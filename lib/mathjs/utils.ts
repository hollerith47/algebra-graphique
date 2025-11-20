import {PreprocessTarget} from "@/types/domain";


export function preprocess(expr: string, target: PreprocessTarget = 'js'): string {
    let s = String(expr).trim().toLowerCase();

    // normaliser le « − »
    s = s.replace(/\u2212/g, '-');

    const FUNC = '(sin|cos|tan|asin|acos|atan|log|ln|exp|abs|sqrt|pow|cbrt)';
    const SYM  = '(x|pi|e)';

    // 2x, 2(…), 2sin, pi x, etc.
    s = s.replace(new RegExp(`(\\d(?:\\.\\d+)?)(?=\\s*(?:\\b${SYM}\\b|\\b${FUNC}\\b|\\())`, 'g'), '$1*');
    // x(…), )x, x2, )2, xsin
    s = s.replace(new RegExp(`(\\b${SYM}\\b|\\))(?=\\s*(?:\\b${SYM}\\b|\\d|\\b${FUNC}\\b|\\())`, 'g'), '$1*');
    // nombre/symbole juste avant '('
    s = s.replace(new RegExp(`(\\d(?:\\.\\d+)?|\\b${SYM}\\b)\\s*(?=\\()`, 'g'), '$1*');
    // "sin x" -> "sin(x)" (argument simple)
    s = s.replace(new RegExp(`\\b${FUNC}\\s*(\\b${SYM}\\b|\\d(?:\\.\\d+)?)`, 'g'),
        (_m, fn: string, arg: string) => `${fn}(${arg})`);

    // espaces
    s = s.replace(/\s+/g, '');

    // ⚠️ conversion du caret seulement pour JS (worker)
    if (target === 'js') s = s.replace(/\^/g, '**');

    return s;
}
