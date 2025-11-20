import type { Series } from "@/types/domain";
import {ExportService} from "@/services/export.service";

export function exportPlotToCsv(series: Series, filename?: string): void {
    const exportService = new ExportService;
    return exportService.toCsv(series, filename);
}