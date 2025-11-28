import {AngleMode, RU} from "@/types/domain";
import {preprocess} from "@/lib/mathjs/utils";

type CalcIn = {
    type: 'calculate';
    payload: {
        formula: string;
        range: { min: number; max: number };
        step: number;
        angle: AngleMode;
    };
};
type Ok = { type: 'success'; data: { xs: number[]; ys: (number | null)[]; meta: { invalid: number; total: number; cause?: string } } };
type Err = { type: 'error'; error: string };

// Fonctions/constantes autorisées
const FUNCS = {
    sin: Math.sin, cos: Math.cos, tan: Math.tan,
    asin: Math.asin, acos: Math.acos, atan: Math.atan,
    log: Math.log10, ln: Math.log, exp: Math.exp,
    abs: Math.abs, sqrt: Math.sqrt, pow: Math.pow,
    cbrt: Math.cbrt ?? ((x: number) => Math.pow(x, 1 / 3)),
};
const CONSTANTS = { pi: Math.PI, e: Math.E };
const ALLOWED_NAMES = new Set(['x', ...Object.keys(FUNCS), ...Object.keys(CONSTANTS)]);
const ALLOWED_CHARS = /^[a-z0-9+\-*/^()., _]+$/i;

// Validation simple : caractères + identifiants
function validate(expr: string) {
    if (!ALLOWED_CHARS.test(expr)) throw new Error(RU.FORMULA_INVALID_CHARS);

    // tous les identifiants rencontrés
    const names = expr.match(/[A-Za-z_]\w*/g) ?? [];
    for (const name of names) {
        // nombres (e.g., "e10") ne sont pas captés ici; on vérifie les vrais identifiants
        if (!ALLOWED_NAMES.has(name)) {
            console.error("erreur de validation dans Validate depuis eval.worker")
            throw new Error(RU.SYMBOL_NOT_ALLOWED(name));
        }
    }
}

// Fabrique f(x) sans "with"
function buildFn(formula: string): (x: number) => number {
    const argNames = ['x', ...Object.keys(FUNCS), ...Object.keys(CONSTANTS)]; // ordre des args

    const fn = new Function(
        ...argNames,
        // Pas de "use strict" explicite : les modules workers sont déjà stricts.
        `return (${formula});`
    ) as (...args: number[]) => number;

    const argValuesBase = [...Object.values(FUNCS), ...Object.values(CONSTANTS)];
    return (x: number) => {
        try {
            const y = fn(x, ...argValuesBase as any);
            return Number.isFinite(y) ? y : NaN;
        } catch {
            return NaN;
        }
    };
}

function refine(xs: number[], evalY: (x: number) => number, angle: AngleMode) {
    const ys: number[] = [];
    const outX: number[] = [];
    const THRESH = 5;
    const toRad = (v: number) => (angle === 'deg' ? (v * Math.PI) / 180 : v);

    for (let i = 0; i < xs.length; i++) {
        const x = xs[i];
        const y = evalY(toRad(x));

        if (!Number.isFinite(y)) {
            if (outX.length) { outX.push(NaN); ys.push(NaN); }
            continue;
        }

        outX.push(x); ys.push(y);

        if (i < xs.length - 1) {
            const nx = xs[i + 1];
            const ny = evalY(toRad(nx));
            if (Number.isFinite(ny)) {
                const dy = Math.abs(ny - y);
                const dx = nx - x;
                if (dy > THRESH && dy / Math.max(dx, 1e-12) > THRESH) {
                    const mid = (x + nx) / 2;
                    const my = evalY(toRad(mid));
                    if (Number.isFinite(my)) { outX.push(mid); ys.push(my); }
                }
            }
        }
    }
    return { xs: outX, ys: ys.map(v => (Number.isFinite(v) ? v : null)) };
}

self.onmessage = (e: MessageEvent<CalcIn>) => {
    const { type, payload } = e.data || {};
    if (type !== 'calculate') return;

    try {
        const { formula, range, step, angle } = payload;
        if (!(step > 0) || range.min >= range.max) throw new Error(RU.RANGE_STEP_INVALID);

        // ✅ Pré-normaliser puis valider
        const raw = String(formula);
        const expr = preprocess(raw, "js");
        validate(expr);

        const f = buildFn(expr);

        const xs: number[] = [];
        for (let x = range.min; x <= range.max + 1e-12; x += step) xs.push(+x.toFixed(12));

        // échantillon brut pour compter invalides
        let invalid = 0;
        let sawInfinity = false;

        const rawY = xs.map((x) => {
            const y = f(angle === 'deg' ? (x * Math.PI) / 180 : x);
            if (!Number.isFinite(y)) {
                invalid++;
                if (y === Infinity || y === -Infinity) sawInfinity = true;
            }
            return Number.isFinite(y) ? y : NaN;
        });

        // raffinement & ruptures
        const { xs: rx, ys: ry } = refine(xs, (v) => {
            const idx = xs.indexOf(v);
            return Number.isFinite(rawY[idx]) ? rawY[idx] : NaN;
        }, angle);

        // heuristique “cause”
        let cause: string | undefined;
        if (/\/\s*0(?![0-9.])/.test(expr) || sawInfinity) cause = 'division_by_zero';

        (self as any).postMessage({
            type: 'success',
            data: { xs: rx, ys: ry, meta: { invalid, total: xs.length, cause } }
        } as Ok);

    } catch (err) {
        (self as any).postMessage({ type: 'error', error: (err as Error).message } as Err);
    }
};

