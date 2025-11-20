import {historyService} from "@/services/history.service";

export function loadHistory(): string[] {
    return historyService.getAll();
}
