import type { AngleMode, Range, Step, Series } from "./domain";

export interface WorkerPayload {
    formula: string;
    range: Range;
    step: Step;
    angle: AngleMode;
}

export interface WorkerMessage {
    type: "calculate";
    payload: WorkerPayload;
}

export interface WorkerResponse {
    type: "success" | "error";
    data: Series;
    error?: string;
}
