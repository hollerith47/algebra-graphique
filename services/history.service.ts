const KEY = 'formula_history_v1';

export const historyService = {
    getAll(): string[] {
        try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
        catch { return []; }
    },
    add(formula: string) {
        const arr = new Set<string>(this.getAll());
        arr.add(formula);
        localStorage.setItem(KEY, JSON.stringify(Array.from(arr).slice(-20)));
    },
    clear() { localStorage.removeItem(KEY); },
};
