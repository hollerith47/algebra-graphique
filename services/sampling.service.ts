import type {ISamplingService} from "@/types/ports";
import type {Range, Step} from "@/types/domain";

const REFINEMENT_THRESHOLD = 5; // Refine if |y2 - y1| is this many times the grid height
const REFINEMENT_STEPS = 10; // Add this many points when refining

export class SamplingService implements ISamplingService {
    grid(range: Range, step: Step): number[] {
        const xs: number[] = [];
        for (let x = range.min; x <= range.max; x += step) {
            xs.push(x);
        }
        // Ensure the last point is included if step doesn't align perfectly
        if (xs[xs.length - 1] < range.max) {
            xs.push(range.max);
        }
        return xs;
    }

    refine(
        xs: number[],
        evalY: (x: number) => number | null
    ): { xs: number[]; ys: (number | null)[] } {
        if (xs.length === 0) {
            return {xs: [], ys: []};
        }

        const refinedXs: number[] = [];
        const refinedYs: (number | null)[] = [];

        const initialYs = xs.map(evalY);
        const validYs = initialYs.filter((y): y is number => y !== null);
        const yRange = validYs.length > 0 ? Math.max(...validYs) - Math.min(...validYs) : 0;
        const threshold = (yRange / xs.length) * REFINEMENT_THRESHOLD;

        refinedXs.push(xs[0]);
        refinedYs.push(initialYs[0]);

        for (let i = 0; i < xs.length - 1; i++) {
            const x1 = xs[i];
            const y1 = initialYs[i];
            const x2 = xs[i + 1];
            const y2 = initialYs[i + 1];

            // Handle discontinuity
            if (y1 === null || y2 === null) {
                if (y1 === null) {
                    // If the first point is null, we've already added it.
                    // Add the second point if it's not null to start the new line segment.
                } else {
                    // y1 is a number, y2 is null. The line ends at y1.
                    // Add a null point to create a gap.
                    refinedXs.push(x2);
                    refinedYs.push(null);
                }
            } else {
                const deltaY = Math.abs(y2 - y1);
                // Refine if the jump is large and not near an asymptote (where yRange could be huge)
                if (deltaY > threshold && yRange > 1e-6) {
                    const subStep = (x2 - x1) / REFINEMENT_STEPS;
                    for (let j = 1; j < REFINEMENT_STEPS; j++) {
                        const subX = x1 + j * subStep;
                        refinedXs.push(subX);
                        refinedYs.push(evalY(subX));
                    }
                }
            }

            refinedXs.push(x2);
            refinedYs.push(y2);
        }

        // De-duplicate points
        const uniquePoints = new Map<number, number | null>();
        for (let i = 0; i < refinedXs.length; i++) {
            uniquePoints.set(refinedXs[i], refinedYs[i]);
        }

        const finalXs = Array.from(uniquePoints.keys()).sort((a, b) => a - b);
        const finalYs = finalXs.map(x => uniquePoints.get(x)!);

        return {xs: finalXs, ys: finalYs};
    }
}
