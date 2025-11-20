import { create, all, MathNode, SymbolNode, OperatorNode, FunctionNode, } from "mathjs";
import {AngleMode, ParseError, RU} from "@/types/domain";

const math = create(all, { epsilon: 1e-12 });

const ALLOWED_FUNCTIONS = new Set([
    "sin", "cos", "tan", "asin", "acos", "atan",
    "log", /* 'ln' peut être mappé vers log si tu veux */
    "exp", "abs", "sqrt", "pow", "cbrt",
]);
const ALLOWED_SYMBOLS = new Set(["x", "pi", "e"]);
const ALLOWED_OPERATORS = new Set(["+", "-", "*", "/", "^"]);

function validateNode(node: MathNode, _path?: string, parent?: MathNode): void {
    switch (node.type) {
        case "SymbolNode": {
            const sym = node as SymbolNode;

            // Si ce SymbolNode est le nom de fonction d'un FunctionNode parent → vérifier ALLOWED_FUNCTIONS
            if (parent?.type === "FunctionNode" && (parent as FunctionNode).fn === node) {
                if (!ALLOWED_FUNCTIONS.has(sym.name)) {
                    throw new ParseError(RU.FUNC_NOT_ALLOWED(sym.name));
                }
                return;
            }

            // Sinon, c'est une variable/constante → vérifier ALLOWED_SYMBOLS
            if (!ALLOWED_SYMBOLS.has(sym.name)) {
                throw new ParseError(RU.SYMBOL_NOT_ALLOWED(sym.name));
            }
            return;
        }

        case "OperatorNode": {
            const op = (node as OperatorNode).op;
            if (!ALLOWED_OPERATORS.has(op)) {
                throw new ParseError(RU.OP_NOT_ALLOWED(op));
            }
            return;
        }

        case "FunctionNode":
            // Rien de spécial ici; les arguments seront validés par la traversée,
            // et le nom a été validé via le SymbolNode ci-dessus.
            return;

        case "ParenthesisNode":
        case "ConstantNode":
            return;

        default:
            // Bloque tout type de nœud non prévu (AssignmentNode, FunctionAssignmentNode, etc.)
            throw new ParseError(RU.NODE_NOT_ALLOWED(node.type));
    }
}

export class MathJsAdapter {
    sanitize(formula: string): string {
        if (!formula || !formula.trim()) {
            throw new ParseError(RU.FORMULA_EMPTY);
        }
        const sanitized = formula.trim().toLowerCase();

        try {
            const root = math.parse(sanitized);
            //TODO: IMPORTANT: passer "parent" à la validation
            root.traverse((n, p, parent) => validateNode(n as MathNode, p, parent as MathNode | undefined));
        } catch (e) {
            if (e instanceof ParseError) throw e;
            throw new ParseError(RU.FORMULA_SYNTAX);
        }

        return sanitized;
    }

    compile(formula: string, angleMode: AngleMode): (x: number) => number | null {
        const node: MathNode = math.parse(formula);     // ✅ parse
        const compiled = node.compile();                // ✅ node.compile()

        return (x: number): number | null => {
            const xVal = angleMode === 'deg' ? (x * Math.PI) / 180 : x;
            try {
                const y = compiled.evaluate({ x: xVal, pi: Math.PI, e: Math.E });
                return Number.isFinite(y) ? y : null;
            } catch {
                return null;
            }
        };
    }
}
