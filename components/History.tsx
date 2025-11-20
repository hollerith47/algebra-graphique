"use client";

import * as React from "react";
import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Trash2, Clock} from "lucide-react";

interface HistoryProps {
    history: string[];
    onSelectFormula: (formula: string) => void;
    onClearHistory: () => void;
}

export function History({history, onSelectFormula, onClearHistory}: HistoryProps) {
    const isEmpty = history.length === 0;

    return (
        <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-purple-50 to-white border-b">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Clock className="w-4 h-4 text-purple-500"/>
                        История формул
                        {!isEmpty && (
                            <span className="text-sm font-normal text-slate-500">
                ({history.length})
              </span>
                        )}
                    </CardTitle>
                    <Button
                        onClick={onClearHistory}
                        size="sm"
                        variant="ghost"
                        disabled={isEmpty}
                        className="hover:bg-red-50 hover:text-red-600"
                    >
                        <Trash2 className="w-4 h-4"/>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-4">
                {isEmpty ? (
                    <div className="flex items-center justify-center h-[200px] text-slate-400">
                        <p className="text-sm">История пуста</p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {history.map((formula, index) => (
                            <button
                                key={index}
                                onClick={() => onSelectFormula(formula)}
                                className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 bg-white hover:bg-purple-50 hover:border-purple-300 transition-all group"
                            >
                                <code className="text-sm text-slate-700 font-mono group-hover:text-purple-700">
                                    {formula}
                                </code>
                            </button>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}