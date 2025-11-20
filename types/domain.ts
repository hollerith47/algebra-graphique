export type AngleMode = 'rad' | 'deg';

export interface Range {
    min: number;
    max: number
}

export type Step = number;

export interface Point {
    x: number;
    y: number | null
}

export type Series = Point[];
export type PreprocessTarget = 'js' | 'mathjs';

export class ValidationError extends Error {}
export class DomainError extends Error {}
export class ParseError extends Error {}

export const RU = {
    FORMULA_EMPTY: 'Формула не может быть пустой.',
    FORMULA_INVALID_CHARS: 'Формула содержит недопустимые символы.',
    FORMULA_SYNTAX: 'Неверный синтаксис или структура формулы.',
    RANGE_STEP_INVALID: 'Некорректные пределы или шаг.',
    NUMBERS_REQUIRED: 'Все поля должны быть числами.',
    MIN_LESS_MAX: "Значение «От» должно быть меньше «До».",
    STEP_POSITIVE: 'Шаг должен быть положительным числом.',
    CALCULATION_ERROR:'Не удалось вычислить функцию',
    DIV_BY_ZERO: 'деление на ноль в выражении.',
    UNDEFINED_ON_INTERVAL: 'функция не определена на выбранном интервале.',
    UNDEFINED_ON_ALL_INTERVALS: 'деление на ноль в выражении или функция не определена на всём интервале.',
    UNKNOWN: 'Произошла ошибка.',
    SYMBOL_NOT_ALLOWED: (s: string) => `Символ «${s}» недопустим.`,
    OP_NOT_ALLOWED: (s: string) => `Операция «${s}» недопустима.`,
    FUNC_NOT_ALLOWED: (s: string) => `Функция «${s}» недопустима.`,
    NODE_NOT_ALLOWED: (s: string) => `Тип узла «${s}» недопустим.`,
};
