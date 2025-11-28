'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import {Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import type {Series} from '@/types/domain';
import {getPlotly, exportToPng} from '@/lib/plotly/export.adapter';

// Types locaux (pas d'import 'plotly.js')
type PlotData = Record<string, unknown>;
type PlotLayout = Record<string, unknown>;
type PlotConfig = Record<string, unknown>;

type ReactPlotProps = {
    data: PlotData[];
    layout?: PlotLayout;
    config?: PlotConfig;
    plotly?: any;
    divId?: string;
    className?: string;
    useResizeHandler?: boolean;
    onInitialized?: (_: any, graphDiv: HTMLElement) => void;
    onUpdate?: (_: any, graphDiv: HTMLElement) => void;
};

// Chargement client-only du composant react-plotly.js
const ReactPlot = dynamic<ReactPlotProps>(() => import('react-plotly.js') as any, {
    ssr: false,
    loading: () => (
        <div className="h-[400px] w-full flex items-center justify-center text-slate-500">
            Загрузка графика...
        </div>
    ),
});

interface PlotViewerProps {
    data: Series;
    formula: string;
    id?: string;       // id du conteneur Plotly
    height?: number;   // hauteur en px
}

export function PlotViewer({data, formula, id = 'plot-root', height = 400}: PlotViewerProps) {
    const [plotlyLib, setPlotlyLib] = React.useState<any>(null);
    const graphRef = React.useRef<HTMLElement | null>(null);

    // Charger Plotly côté client au montage
    React.useEffect(() => {
        getPlotly().then(setPlotlyLib);
    }, []);

    // Thème auto (clair/sombre)
    const COLORS = React.useMemo(() => {
        const isDark =
            typeof window !== 'undefined' &&
            document.documentElement.classList.contains('dark');

        return {
            line: isDark ? '#22c55e' /* green-500 */ : '#10b981' /* emerald-500 */,
            font: isDark ? '#cbd5e1' /* slate-300 */ : '#64748b' /* slate-500 */,
            axisLine: isDark ? '#475569' /* slate-600 */ : '#cbd5e1' /* slate-300 */,
            axisZero: '#94a3b8' /* slate-400 */,
            grid: isDark ? '#334155' /* slate-700 */ : '#e2e8f0' /* slate-200 */,
            title: isDark ? '#e2e8f0' /* slate-200 */ : '#1e293b' /* slate-800 */,
        };
    }, []);

    // Données (courbe 3× plus épaisse que la grille)
    const plotData: PlotData[] = React.useMemo(() => {
        if (!data?.length) return [];
        return [
            {
                x: data.map(p => p.x),
                y: data.map(p => (p.y ?? null)), // null = rupture (asymptotes)
                type: 'scatter',
                mode: 'lines',
                line: {color: COLORS.line, width: 3, shape: 'linear'}, // 3× gridwidth=1
                hoverinfo: 'x+y',
                name: formula || 'y = f(x)',
            },
        ];
    }, [data, formula, COLORS.line]);

    // Mise en page
    const layout: PlotLayout = React.useMemo(
        () => ({
            autosize: true,
            height,
            margin: {l: 56, r: 24, t: 48, b: 56},
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            font: {family: 'Inter, ui-sans-serif, system-ui', color: COLORS.font},
            xaxis: {
                gridcolor: COLORS.grid,
                gridwidth: 1,
                linecolor: COLORS.axisLine,
                linewidth: 1,
                zeroline: true,
                zerolinecolor: COLORS.axisZero,
                zerolinewidth: 1,
                mirror: true,
            },
            yaxis: {
                gridcolor: COLORS.grid,
                gridwidth: 1,
                linecolor: COLORS.axisLine,
                linewidth: 1,
                zeroline: true,
                zerolinecolor: COLORS.axisZero,
                zerolinewidth: 1,
                mirror: true,
            },
            legend: {x: 0.02, y: 1.12, orientation: 'h', font: {size: 12}},
            title: {
                text: formula ? `График функции: ${formula}` : 'График функции',
                font: {size: 16, color: COLORS.title},
                x: 0.5,
                xanchor: 'center',
            },
        }),
        [formula, height, COLORS]
    );

    // Config runtime
    const config: PlotConfig = React.useMemo(
        () => ({
            responsive: true,
            displaylogo: false,
            scrollZoom: true,
            doubleClick: 'reset',
            modeBarButtonsToRemove: ['toImage', 'sendDataToCloud', 'select2d', 'lasso2d', 'autoScale2d'],
        }), []);

    return (
        <Card className="shadow-lg shadow-slate-200/50 dark:shadow-slate-900/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                    График
                </CardTitle>
                <div className="flex gap-2">
                    <Button
                        size="sm" variant="outline"
                        onClick={() => exportToPng(graphRef.current ?? id, 'graph')}
                        disabled={!data.length}
                    >
                        Сохранить PNG
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                <div className="w-full" style={{height}}>
                    {data?.length && plotlyLib ? (
                        <ReactPlot
                            divId={id}
                            data={plotData}
                            layout={layout}
                            config={config}
                            plotly={plotlyLib}
                            useResizeHandler
                            className="w-full h-full"
                            onInitialized={(_,gd)=> {graphRef.current = gd}}
                            onUpdate={(_,gd)=> {graphRef.current = gd}}
                        />
                    ) : (
                        <div
                            className="h-full w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/30 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700">
                            <svg className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" fill="none"
                                 viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                      d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/>
                            </svg>
                            <p className="text-slate-500 dark:text-slate-300 font-medium">График не построен</p>
                            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                                Введите формулу и нажмите «Построить»
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
