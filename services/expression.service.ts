
import type { IExpressionService } from "@/types/ports";
import type { AngleMode } from "@/types/domain";
import { MathJsAdapter } from "@/lib/mathjs/parser.adapter";

export class ExpressionService implements IExpressionService {
    private parser: MathJsAdapter;

    constructor() {
        this.parser = new MathJsAdapter();
    }

    sanitize(formula: string): string {
        return this.parser.sanitize(formula);
    }

    compile(
        formula: string,
        angleMode: AngleMode
    ): (x: number) => number | null {
        return this.parser.compile(formula, angleMode);
    }
}
