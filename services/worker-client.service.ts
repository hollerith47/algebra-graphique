'use client';

import type { AngleMode } from '@/types/domain';

let worker: Worker | null = null;

function ensureWorker() {
    if (!worker) {
        worker = new Worker(
            new URL('../lib/workers/eval.worker.ts', import.meta.url),
            { type: 'module' }
        );
    }
    return worker;
}

export function calcInWorker(
    formula: string,
    range: { min: number; max: number },
    step: number,
    angle: AngleMode
): Promise<{ xs: number[]; ys: (number | null)[]; meta: { invalid: number; total: number; cause?: string } }> {
    const w = ensureWorker();
    return new Promise((resolve, reject) => {
        const handler = (ev: MessageEvent) => {
            const msg = ev.data;
            if (msg?.type === 'success') {
                w.removeEventListener('message', handler);
                resolve(msg.data);
            } else if (msg?.type === 'error') {
                w.removeEventListener('message', handler);
                reject(new Error(msg.error));
            }
        };
        w.addEventListener('message', handler);
        w.postMessage({ type: 'calculate', payload: { formula, range, step, angle } });
    });
}
