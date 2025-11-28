import {PreprocessTarget} from "@/types/domain";

const FUNC = '(sin|cos|tan|asin|acos|atan|log|ln|exp|abs|sqrt|pow|cbrt)';
const SYM  = '(x|pi|e)';

export function normalizeInput(raw: string): string {
    return String(raw ?? '')
        .trim()
        .toLowerCase()
        .replace(/\u2212/g, '-') // − → -
        .replace(/,/g, '.');     // , décimal → .
}

/** Insertion des multiplications implicites et petits correctifs avant parse */
export function insertImplicitMultiplication(input: string): string {
    let s = input;

    // 1) nombre suivi de symbole/fonction/'('  →  2x, 2sin, 2(
    s = s.replace(
        new RegExp(`(\\d(?:\\.\\d+)?)(?=\\s*(?:\\b${SYM}\\b|\\b${FUNC}\\b|\\())`, 'g'),
        '$1*'
    );

    // 2) symbole ou ')' suivi de nombre/fonction/'(' → x2, x(…), )(…), xsin
    s = s.replace(
        new RegExp(`(\\b${SYM}\\b|\\))(?=\\s*(?:\\d|\\b${FUNC}\\b|\\())`, 'g'),
        '$1*'
    );

    // 3) juxtaposition de parenthèses → )*(
    s = s.replace(/\)\s*\(/g, ')*(');

    // 4) "sin x" → "sin(x)" (argument simple)
    s = s.replace(
        new RegExp(`\\b${FUNC}\\s*(\\b${SYM}\\b|\\d(?:\\.\\d+)?)`, 'g'),
        (_m, fn: string, arg: string) => `${fn}(${arg})`
    );

    // 5) retirer les espaces résiduels
    return s.replace(/\s+/g, '');
}

/** Conversion de l’opérateur de puissance selon la cible */
export function convertPower(expr: string, target: PreprocessTarget): string {
    return target === 'js' ? expr.replace(/\^/g, '**') : expr;
}
