'use client';

import { create, all, MathNode, SymbolNode, OperatorNode, FunctionNode } from 'mathjs';
import {convertPower, insertImplicitMultiplication, normalizeInput} from "@/lib/mathjs/normalize";
import {RU} from "@/types/domain";

const math = create(all, {});

const ALLOWED_FUNCS = new Set([
    'sin','cos','tan','asin','acos','atan','log','ln','exp','abs','sqrt','pow','cbrt'
]);
const ALLOWED_SYMBOLS = new Set(['x','pi','e']);
const ALLOWED_OPERATORS = new Set(['+','-','*','/','^']);

function validateAst(node: MathNode) {
    node.traverse((n, _path, parent) => {
        if (n.type === 'SymbolNode') {
            const name = (n as SymbolNode).name;
            // si le symbole est le "fn" d'un FunctionNode → c'est un nom de fonction
            if (parent?.type === 'FunctionNode' && (parent as any).fn === n) {
                if (!ALLOWED_FUNCS.has(name)) throw new Error(`Функция «${name}» недопустима.`);
                return;
            }
            if (!ALLOWED_SYMBOLS.has(name)) throw new Error(`Символ «${name}» недопустим.`);
        } else if (n.type === 'OperatorNode') {
            const op = (n as OperatorNode).op;
            if (!ALLOWED_OPERATORS.has(op)) throw new Error(`Операция «${op}» недопустима.`);
        } else if (n.type === 'FunctionNode') {
            const fname = (n as FunctionNode).fn?.name;
            if (fname && !ALLOWED_FUNCS.has(fname)) throw new Error(`Функция «${fname}» недопустима.`);
        }
    });
}

export function canonicalizeForWorker(rawFormula: string) {
    if (!rawFormula.trim()) {
        throw new Error(RU.FORMULA_EMPTY);
    }
    // 0) normaliser + ANNULER toute éventuelle conversion '**' -> '^'
    const input0 = normalizeInput(rawFormula).replace(/\*\*/g, '^');

    console.log({input0})

    // 1) mêmes normalisations qu’au worker (core partagé)
    console.log({rawFormula})
    const prepared = insertImplicitMultiplication(normalizeInput(input0));

    // 2) parse MathJS
    let ast: MathNode;
    try {
        ast = math.parse(prepared);
    } catch {
        throw new Error('Неверный синтаксис формулы.');
    }
    // 3) validation whitelist
    validateAst(ast);

    // 4) forme canonique mathjs (avec * explicites)
    const mathString = ast.toString({ implicit: 'show', parenthesis: 'auto' });

    // 5) forme JS pour worker ( ^ → ** )
    const jsString = convertPower(mathString, 'js');

    return { mathString, jsString };

}
