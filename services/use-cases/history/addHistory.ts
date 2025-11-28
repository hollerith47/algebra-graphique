import {historyService} from "@/services/history.service";

export function addHistory(formula: string) {
    return historyService.add(formula);
}