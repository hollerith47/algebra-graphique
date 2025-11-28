import {historyService} from "@/services/history.service";

export function clearHistory(): void {
    historyService.clear();
}
