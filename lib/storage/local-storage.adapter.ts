const HISTORY_KEY = "algebra-graphique-history";
const MAX_HISTORY = 20;

export function getHistory(): string[] {
    try {
        const stored = localStorage.getItem(HISTORY_KEY);
        if (!stored) return [];
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function saveHistory(formulas: string[]): void {
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(formulas));
    } catch (error) {
        console.error("Не удалось сохранить историю:", error);
    }
}

export function addToHistory(formula: string): void {
    const history = getHistory();
    const filtered = history.filter((f) => f !== formula);
    const updated = [formula, ...filtered].slice(0, MAX_HISTORY);
    saveHistory(updated);
}

export function clearHistory(): void {
    try {
        localStorage.removeItem(HISTORY_KEY);
    } catch (error) {
        console.error("Не удалось очистить историю:", error);
    }
}
