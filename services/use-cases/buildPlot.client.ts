'use client';

import {AngleMode, Range, Step, Series, RU} from '@/types/domain';
import { ValidationError } from '@/types/domain';
import { calcInWorker } from '@/services/worker-client.service';
import {canonicalizeForWorker} from "@/lib/mathjs/canonicalize.client";

export async function buildPlotClient(
    formula: string,
    range: Range,
    step: Step,
    angle: AngleMode
): Promise<{ series: Series; meta: { invalid: number; total: number; cause?: string }, normalized: string }> {
    if (!(step > 0) || range.min >= range.max) {
        throw new ValidationError(RU.RANGE_STEP_INVALID);
    }
    const {jsString, mathString } = canonicalizeForWorker(formula);
    // console.log("J'etais ici dans buildPlotClient")

    const { xs, ys, meta } = await calcInWorker(jsString, range, step, angle);
    const series: Series = xs.map((x, i) => ({ x, y: ys[i] }));
    return {series, meta, normalized: mathString};
}
