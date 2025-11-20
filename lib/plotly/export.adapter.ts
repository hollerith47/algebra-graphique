'use client';

let plotlyPromise: Promise<any> | null = null;

export async function getPlotly() {
    if (!plotlyPromise) {
        plotlyPromise = import('plotly.js-dist-min').then((m: any) => m.default ?? m);
    }
    return plotlyPromise;
}

type PngOptions = { width?: number; height?: number; scale?: number; filename?: string };

export async function exportToPng(
    target: string | HTMLElement,
    filename = 'graph',
    opts: PngOptions = {}
) {
    const Plotly = await getPlotly();
    const el = typeof target === "string" ? document.getElementById(target) : target;
    if (!el) return;
    const {width = 600, height = 600, scale = 1, filename: fn} = opts;
    try {
        await Plotly.Plots.resize(el);
    } catch {
    }


    await Plotly.downloadImage(el, {format: 'png', filename: fn ?? filename, width, height, scale});
}
