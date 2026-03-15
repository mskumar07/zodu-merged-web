import type { ChecklistItem } from "@types/checklist";

export const mapChecklistStatus = (status: string): ChecklistItem["status"] => {
  const statusMap: Record<string, ChecklistItem["status"]> = {
    pending: "pending",
    in_progress: "active",
    completed: "closed",
    overdue: "overdue",
  };
  return statusMap[status] || "pending";
};
