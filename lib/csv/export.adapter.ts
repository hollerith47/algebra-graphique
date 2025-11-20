import type { Series } from "@/types/domain";

function escapeCsvCell(cell: string | number): string {
    const cellStr = String(cell);
    if (cellStr.includes(",")) {
        return `"${cellStr.replace(/"/g, '""')}"`;
    }
    return cellStr;
}

export function generateCsvContent(series: Series): string {
    if (!series || series.length === 0) {
        return "";
    }

    const headers = ["x", "y"];
    const headerRow = headers.join(",");

    const rows = series.map((point) => {
        const yValue = point.y === null ? "" : point.y;
        return [escapeCsvCell(point.x), escapeCsvCell(yValue)].join(",");
    });

    return [headerRow, ...rows].join("\n");
}

export function downloadCsv(content: string, filename: string): void {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}