"use client";

import * as React from "react";
import {useVirtualizer} from "@tanstack/react-virtual";
import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Download} from "lucide-react";
import type {Point, Series} from "@/types/domain";

interface DataTableProps {
    data: Series;
    onExportCsv: () => void;
}

export function DataTable({data, onExportCsv}: DataTableProps) {
    const filteredData = React.useMemo(
        () => data.filter((p): p is Point & { y: number } => p.y !== null),
        [data]
    );

    const rowVirtualizer = useVirtualizer({
        count: filteredData.length,
        getScrollElement: () => document.getElementById("table-scroll-container"),
        estimateSize: () => 40,
        overscan: 10,
    });

    const isEmpty = data.length === 0;

    return (
        <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-amber-50 to-white border-b">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        Таблица значений
                        {!isEmpty && (
                            <span className="text-sm font-normal text-slate-500">
                ({data.length} точек)
              </span>
                        )}
                    </CardTitle>
                    <Button
                        onClick={onExportCsv}
                        size="sm"
                        variant="outline"
                        disabled={isEmpty}
                        className="hover:bg-amber-50 hover:border-amber-300"
                    >
                        <Download className="w-4 h-4"/>
                        Экспорт CSV
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {isEmpty ? (
                    <div className="flex items-center justify-center h-[300px] text-slate-400">
                        <p className="text-sm">Нет данных для отображения</p>
                    </div>
                ) : (
                    <div className="overflow-auto" id="table-scroll-container">
                        <div style={{height: `${rowVirtualizer.getTotalSize()}px`, position: "relative"}}>
                            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                                const item = filteredData[virtualItem.index];
                                return (
                                    <div
                                        key={virtualItem.key}
                                        style={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            width: "100%",
                                            transform: `translateY(${virtualItem.start}px)`,
                                        }}
                                        className="flex items-center justify-between border-b border-slate-100 hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="px-6 py-3 text-sm text-slate-900 font-mono w-1/2">
                                            {item.x.toFixed(6)}
                                        </div>
                                        <div className="px-6 py-3 text-sm text-slate-900 font-mono w-1/2">
                                            {item.y.toFixed(6)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
