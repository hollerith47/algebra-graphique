'use client';

import * as React from "react";
import {FunctionParameters} from "@/components/FunctionParameters";
import {History} from '@/components/History';
import Header from "@/components/Header";
import {clearHistory, exportPlotToPng, loadHistory} from "@/services/use-cases/history";
import {AngleMode, DomainError, ParseError, RU, Series, ValidationError} from "@/types/domain";
import {buildPlotClient} from "@/services/use-cases/buildPlot.client";
import {addHistory} from "@/services/use-cases/history/addHistory";
import {canonicalizeForWorker} from "@/lib/mathjs/canonicalize.client";
import {PlotViewer} from "@/components/PlotViewer";
import {DataTable} from "@/components/DataTable";
import Footer from "@/components/Footer";

export default function Main() {
    const [formula, setFormula] = React.useState('sin(x) * x');
    const [rangeMin, setRangeMin] = React.useState('-10');
    const [rangeMax, setRangeMax] = React.useState('10');
    const [step, setStep] = React.useState('0.1');
    const [angleMode, setAngleMode] = React.useState<AngleMode>('rad');
    const [plotData, setPlotData] = React.useState<Series>([]);
    const [history, setHistory] = React.useState<string[]>([]);
    const [isBuilding, setIsBuilding] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [normalizedPreview, setNormalizedPreview] = React.useState<string>('');
    const [jsFormula, setJsFormula] = React.useState("");

    // Charger l'historique au montage
    React.useEffect(() => {
        setHistory(loadHistory);
    }, []);

    // mettre à jour l’aperçu quand la formule change (sans casser l’input)
    React.useEffect(() => {
        try {
            const {mathString, jsString} = canonicalizeForWorker(formula);
            setNormalizedPreview(mathString);
            setJsFormula(jsString);
        } catch {
            setNormalizedPreview(''); // si syntaxe invalide au fil de la saisie
        }
    }, [formula]);

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

            // 2) buildPlotClient doit accepter la **formule pour worker** (jsString)
            const result = await buildPlotClient(jsFormula, { min, max }, stepValue, angleMode);
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
            setHistory(loadHistory());
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : RU.UNKNOWN);
            setPlotData([]);
        } finally {
            setIsBuilding(false);
        }
    }, [formula, rangeMin, rangeMax, step, angleMode]);

    const handleSave = React.useCallback(async () => {
        if (plotData.length === 0) return;
        try {
            const safe = formula.replace(/[^a-zA-Z0-9\u0400-\u04FF]/g, '_');
            await exportPlotToPng('plot-container', `graph${safe}`);
        } catch {
            setError('Не удалось экспортировать график');
        }
    }, [plotData, formula]);

    // Export CSV simple (sans service dédié)
    const handleExportCsv = React.useCallback(() => {
        if (plotData.length === 0) return;
        try {
            const rows = ['x,y', ...plotData.map(p => `${p.x},${p.y ?? ''}`)].join('\n');
            const blob = new Blob([rows], {type: 'text/csv;charset=utf-8;'});
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
        setNormalizedPreview("")
    }, []);

    const handleSelectFormula = React.useCallback((selectedFormula: string) => {
        setFormula(selectedFormula);
        // console.log({selectedFormula})
        setError(null);
    }, []);

    const handleClearHistory = React.useCallback(() => {
        clearHistory();
        setHistory([]);
    }, []);
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
            <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Header error={error}/>
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
                        <PlotViewer id="plot-container" data={plotData} formula={normalizedPreview}/>
                        <DataTable data={plotData} onExportCsv={handleExportCsv}/>
                    </div>
                </div>
                <Footer/>
            </div>
        </div>
    );
}