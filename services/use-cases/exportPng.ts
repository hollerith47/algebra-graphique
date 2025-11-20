
import {ExportService} from "@/services/export.service";

export async function exportPlotToPng(containerId: string): Promise<void> {
    const exportService = new ExportService();
    return exportService.toPng(containerId, "graph");
}
