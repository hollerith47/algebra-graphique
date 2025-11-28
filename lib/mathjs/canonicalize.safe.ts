import {canonicalizeForWorker} from "@/lib/mathjs/canonicalize.client";

export type CanonResult =
    | { ok: true; mathString: string; jsString: string }
    | { ok: false; error: string };

export function canonicalizeSafe(raw: string): CanonResult {
    try {
        if (!raw.trim()) {
            return { ok: false, error: 'Формула не может быть пустой.' };
        }
        const { mathString, jsString } = canonicalizeForWorker(raw);
        return { ok: true, mathString, jsString };
    } catch (e: any) {
        return { ok: false, error: e?.message ?? 'Неверный синтаксис формулы.' };
    }
}