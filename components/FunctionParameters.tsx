"use client";

import * as React from "react";
import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
import {Button} from "@/components/ui/button";
import {Play, Save, Trash2} from "lucide-react";
import type {AngleMode} from "@/types/domain";

interface FunctionParametersProps {
    formula: string;
    rangeMin: string;
    rangeMax: string;
    step: string;
    angleMode: AngleMode;
    onFormulaChange: (value: string) => void;
    onRangeMinChange: (value: string) => void;
    onRangeMaxChange: (value: string) => void;
    onStepChange: (value: string) => void;
    onAngleModeChange: (mode: AngleMode) => void;
    onBuild: () => void;
    onSave: () => void;
    onClear: () => void;
    isBuilding: boolean;
}

export function FunctionParameters({
                                       formula,
                                       rangeMin,
                                       rangeMax,
                                       step,
                                       angleMode,
                                       onFormulaChange,
                                       onRangeMinChange,
                                       onRangeMaxChange,
                                       onStepChange,
                                       onAngleModeChange,
                                       onBuild,
                                       onSave,
                                       onClear,
                                       isBuilding,
                                   }: FunctionParametersProps) {
    return (
        <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Параметры функции
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="formula" className="text-slate-700">
                        Формула y = f(x)
                    </Label>
                    <Input
                        id="formula"
                        value={formula}
                        onChange={(e) => onFormulaChange(e.target.value)}
                        placeholder="например: 2*x^2 + 1"
                        className="font-mono text-base"
                    />
                    <p className="text-xs text-slate-500">
                        Поддерживаются: sin, cos, tan, log, ln, exp, abs, sqrt, pow, +, -, *, /, ^, ( )
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="rangeMin" className="text-slate-700">
                            От
                        </Label>
                        <Input
                            id="rangeMin"
                            type="number"
                            value={rangeMin}
                            onChange={(e) => onRangeMinChange(e.target.value)}
                            placeholder="-10"
                            step="any"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="rangeMax" className="text-slate-700">
                            До
                        </Label>
                        <Input
                            id="rangeMax"
                            type="number"
                            value={rangeMax}
                            onChange={(e) => onRangeMaxChange(e.target.value)}
                            placeholder="10"
                            step="any"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="step" className="text-slate-700">
                            Шаг
                        </Label>
                        <Input
                            id="step"
                            type="number"
                            value={step}
                            onChange={(e) => onStepChange(e.target.value)}
                            placeholder="0.1"
                            step="any"
                        />
                    </div>
                </div>

                <div
                    className="flex items-center justify-between rounded-lg border border-slate-200 p-4 bg-slate-50/50">
                    <div className="space-y-0.5">
                        <Label htmlFor="angleMode" className="text-slate-700 font-medium">
                            Единицы угла
                        </Label>
                        <p className="text-xs text-slate-500">
                            {angleMode === "rad" ? "Радианы" : "Градусы"}
                        </p>
                    </div>
                    <Switch
                        id="angleMode"
                        checked={angleMode === "deg"}
                        onCheckedChange={(checked) => onAngleModeChange(checked ? "deg" : "rad")}
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <Button
                        onClick={onBuild}
                        disabled={isBuilding || !formula.trim()}
                        className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all"
                    >
                        <Play className="w-4 h-4"/>
                        {isBuilding ? "Построение..." : "Построить"}
                    </Button>
                    <Button
                        onClick={onSave}
                        variant="outline"
                        disabled={!formula.trim()}
                        className="h-11 flex-1 hover:bg-emerald-50 hover:border-emerald-300"
                    >
                        <Save className="w-4 h-4"/>
                        Сохранить
                    </Button>
                    <Button
                        onClick={onClear}
                        variant="outline"
                        disabled={!formula.trim()}
                        className="h-11 flex-1 hover:bg-red-50 hover:border-red-300"
                    >
                        <Trash2 className="w-4 h-4"/>
                        Очистить
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}