'use client';

import * as React from 'react';
import { FunctionParameters } from '@/components/FunctionParameters';
import { PlotViewer } from '@/components/PlotViewer';
import { DataTable } from '@/components/DataTable';
import { History } from '@/components/History';

import {AngleMode, RU, Series} from '@/types/domain';
import { buildPlotClient } from '@/services/use-cases/buildPlot.client';
import {clearHistory, exportPlotToPng, loadHistory} from "@/services/use-cases/history";
import {addHistory} from "@/services/use-cases/history/addHistory";

export default function Page() {
    const [formula, setFormula] = React.useState('sin(x) * x');
    const [rangeMin, setRangeMin] = React.useState('-10');
    const [rangeMax, setRangeMax] = React.useState('10');
    const [step, setStep] = React.useState('0.1');
    const [angleMode, setAngleMode] = React.useState<AngleMode>('rad');
    const [plotData, setPlotData] = React.useState<Series>([]);
    const [history, setHistory] = React.useState<string[]>([]);
    const [isBuilding, setIsBuilding] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const formulaName = formula.replace("", "_")

    // Charger l'historique au montage
    React.useEffect(() => {
        setHistory(loadHistory);
    }, []);

    const handleBuild = React.useCallback(async () => {
        if (!formula.trim()) return;

        setIsBuilding(true);
        setError(null);

        try {
            const min = parseFloat(rangeMin);
            const max = parseFloat(rangeMax);
            const stepValue = parseFloat(step);

            if (Number.isNaN(min) || Number.isNaN(max) || Number.isNaN(stepValue)) {
                throw new Error(RU.NUMBERS_REQUIRED);
            }
            if (min >= max) throw new Error(RU.MIN_LESS_MAX);
            if (stepValue <= 0) throw new Error(RU.STEP_POSITIVE);

            const result = await buildPlotClient(formula, { min, max }, stepValue, angleMode);
            if (!result || !result.meta) {
                throw new Error(RU.CALCULATION_ERROR);
            }

            const {series, meta} = result
            // 100% des points invalides → erreur claire
            if (meta.invalid === meta.total) {
                const msg =
                    meta.cause === 'division_by_zero'
                        ? RU.UNDEFINED_ON_ALL_INTERVALS
                        : RU.UNDEFINED_ON_INTERVAL;
                throw new Error(msg);
            }

            setPlotData(series);
            addHistory(formula);
            setHistory(loadHistory);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : RU.UNKNOWN);
            console.error("HandleBuild ERROR", err)
            setPlotData([]);
        } finally {
            setIsBuilding(false);
        }
    }, [formula, rangeMin, rangeMax, step, angleMode]);

    const handleSave = React.useCallback(async () => {
        if (plotData.length === 0) return;
        try {
            await exportPlotToPng('plot-container', `graph${formulaName}`);
        } catch {
            setError('Не удалось экспортировать график');
        }
    }, [plotData]);

    // Export CSV simple (sans service dédié)
    const handleExportCsv = React.useCallback(() => {
        if (plotData.length === 0) return;
        try {
            const rows = ['x,y', ...plotData.map(p => `${p.x},${p.y ?? ''}`)].join('\n');
            const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const safeName = `данные_${formula.replace(/[^a-zA-Z0-9\u0400-\u04FF]/g, '_')}.csv`;
            a.href = url;
            a.download = safeName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch {
            setError('Не удалось экспортировать CSV');
        }
    }, [plotData, formula]);

    const handleClear = React.useCallback(() => {
        setFormula('');
        setRangeMin('-10');
        setRangeMax('10');
        setStep('0.1');
        setAngleMode('rad');
        setPlotData([]);
        setError(null);
    }, []);

    const handleSelectFormula = React.useCallback((selectedFormula: string) => {
        setFormula(selectedFormula);
        setError(null);
    }, []);

    const handleClearHistory = React.useCallback(() => {
        clearHistory();
        setHistory([]);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
            <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <header className="mb-8">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shadow-lg">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Построение графиков функций</h1>
                            <p className="text-slate-600 mt-1">Визуализация математических функций y = f(x)</p>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
                            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <h3 className="text-sm font-semibold text-red-900">Ошибка</h3>
                                <p className="text-sm text-red-700 mt-1">{error}</p>
                            </div>
                        </div>
                    )}
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-4 space-y-6">
                        <FunctionParameters
                            formula={formula}
                            rangeMin={rangeMin}
                            rangeMax={rangeMax}
                            step={step}
                            angleMode={angleMode}
                            onFormulaChange={setFormula}
                            onRangeMinChange={setRangeMin}
                            onRangeMaxChange={setRangeMax}
                            onStepChange={setStep}
                            onAngleModeChange={setAngleMode}
                            onBuild={handleBuild}
                            onSave={handleSave}
                            onClear={handleClear}
                            isBuilding={isBuilding}
                        />

                        <History
                            history={history}
                            onSelectFormula={handleSelectFormula}
                            onClearHistory={handleClearHistory}
                        />
                    </div>

                    <div className="lg:col-span-8 space-y-6">
                        {/* Important: id "plot-container" pour l’export PNG */}
                        <PlotViewer id="plot-container" data={plotData} formula={formula} />
                        <DataTable data={plotData} onExportCsv={handleExportCsv} />
                    </div>
                </div>

                <footer className="mt-12 pt-8 border-t border-slate-200">
                    <div className="flex items-center justify-between text-sm text-slate-500">
                        <p>© 2025 Algebra Graphique. Построение графиков функций.</p>
                        <p>Работает в современных браузерах</p>
                    </div>
                </footer>
            </div>
        </div>
    );
}
