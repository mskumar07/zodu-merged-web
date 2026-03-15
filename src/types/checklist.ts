export interface ReferenceImage {
  id: string;
  url: string;
  name: string;
}

export interface Task {
  id?: number;
  title: string;
  description: string;
  reference_image_url: ReferenceImage[];
  voice_note_url: string | null;
  status?: "pending" | "in_progress" | "testing" | "completed" | "overdue";
  completed_by?: string;
  completed_at?: string;
}

export interface ChecklistSchedule {
  due_date: string;
  due_time: string;
  repeat: "daily" | "weekly" | "monthly" | "none";
}

export interface ChecklistInfo {
  title: string;
  description: string;
  category_id: number;
  branch_id?: string;
  zodu_id?: string;
  created_by?: string;
}

export interface CreateChecklistPayload {
  checklist: ChecklistInfo;
  schedule: ChecklistSchedule;
  tasks: Task[];
  assignees: string[];
}

export interface UpdateChecklistPayload {
  checklist: Partial<ChecklistInfo>;
  schedule?: ChecklistSchedule;
  tasks?: Task[];
  assignees?: string[];
}

export interface ChecklistDashboardStats {
  in_progress: number;
  completed: number;
  overdue: number;
  pending: number;
  total: number;
}

export interface Assignee {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export interface ScheduleItem {
  due_at: string;
  end_date: string;
  recurrence_rrule: string;
  reminder_offsets: [];
  start_date: string;
  timezone: string;
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  title: string;
  description: string;
  category: string;
  category_id: number;
  schedule: ScheduleItem;
  status: "active" | "pending" | "testing" | "closed" | "overdue";
  progress: number;
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks?: number;
  pending_tasks?: number;
  due_date: string;
  assignees: Assignee[];
  tasks: Task[];
  created_at?: string;
}

export type BoardStatus = "pending" | "active" | "testing" | "closed";

export interface BoardColumn {
  id: BoardStatus;
  title: string;
  items: ChecklistItem[];
}

export interface FilterOptions {
  search: string;
  assignees: string[];
  dateRange: {
    start: string | null;
    end: string | null;
  };
  categories: string[];
}

export interface ChecklistFormData {
  zoduId: string;
  branchId: string;
  userId: string;
  name: string;
  description: string;
  category_id: number;
  tasks: Array<{
    title: string;
    description: string;
  }>;
  assignees: any[];
  schedule: {
    start_date: string;
    due_at: string;
    recurrence_rrule?: string;
  };
}
