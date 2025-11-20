
import type { AngleMode, Range, Step, Series } from "./domain";

export interface IExpressionService {
    sanitize(formula: string): string;
    compile(formula: string, angleMode: AngleMode): (x: number) => number | null;
}

export interface ISamplingService {
    grid(range: Range, step: Step): number[];
    refine(
        xs: number[],
        evalY: (x: number) => number | null
    ): { xs: number[]; ys: (number | null)[] };
}

export interface IExportService {
    toPng(containerId: string, filename?: string): Promise<void>;
    toCsv(series: Series, filename?: string): void;
}

export interface IHistoryService {
    getAll(): string[];
    add(formula: string): void;
    clear(): void;
}
