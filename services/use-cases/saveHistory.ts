import {historyService} from "@/services/history.service";

export function saveToHistory(formula: string): void {
    if (!formula.trim()) return;
    historyService.add(formula);
}

export function clearHistory(): void {
    historyService.clear();
}
