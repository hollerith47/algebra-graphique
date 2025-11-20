
import type { IExportService } from "@/types/ports";
import type { Series } from "@/types/domain";
import { exportToPng } from "@/lib/plotly/export.adapter";
import { generateCsvContent, downloadCsv } from "@/lib/csv/export.adapter";

export class ExportService implements IExportService {
    async toPng(containerId: string, filename: string): Promise<void> {
        const finalFilename = filename || "graph";
        return exportToPng(containerId, finalFilename);
    }

    toCsv(series: Series, filename?: string): void {
        const finalFilename = filename || "data";
        const csvContent = generateCsvContent(series);
        downloadCsv(csvContent, finalFilename);
    }
}
