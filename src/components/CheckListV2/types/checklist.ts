export const DEFAULT_PARAMS = {
  zoduId: "ZODU035",
  branchId: "ZODU035B1",
  userId: "8f0d9c7e-6a8b-4f6d-b7e1-4b9bdfc11234",
  limit: 50,
  offset: 0,
};

export const CHECKLIST_USER_STORAGE_KEY = "checklist_selected_user_id";

export const CHECKLIST_USERS = [
  {
    label: "Admin",
    id: "8f0d9c7e-6a8b-4f6d-b7e1-4b9bdfc11234",
  },
  {
    label: "Employee",
    id: "1ecd4f70-67ed-4e4c-9de7-6e0a53797908",
  },
] as const;

export const getSelectedChecklistUserId = (): string => {
  if (typeof window === "undefined") {
    return DEFAULT_PARAMS.userId;
  }

  const storedUserId = window.localStorage.getItem(CHECKLIST_USER_STORAGE_KEY);
  const isAllowedUser = CHECKLIST_USERS.some((user) => user.id === storedUserId);

  return isAllowedUser ? (storedUserId as string) : DEFAULT_PARAMS.userId;
};

export interface ApiTaskNote {
  id: string;
  note: string;
  created_by: string;
  created_by_name?: string;
  created_at: string;
}

export interface ApiChecklistTask {
  id: string;
  notes: ApiTaskNote[];
  title: string;
  status: "completed" | "pending";
  custom_id: string;
  voice_url: string | null;
  description: string;
  reference_image_url: Array<{ id: string; url: string; name: string }>;
}

export interface ApiChecklistAssignee {
  name: string;
  user_id: string;
}

export interface ApiChecklistSchedule {
  due_at: string;
  end_date: string | null;
  timezone: string;
  start_date: string;
  recurrence_rrule: string;
  reminder_offsets: any[];
}

export interface ApiChecklistDue {
  status: "pending" | "overdue" | "completed";
  scheduled_for: string;
}

export interface ApiChecklist {
  id: string;
  due: ApiChecklistDue;
  name: string;
  created_by?: string;
  tasks: ApiChecklistTask[];
  zodu_id: string;
  schedule: ApiChecklistSchedule;
  assignees: ApiChecklistAssignee[];
  branch_id: string;
  custom_id: string;
  created_at: string;
  category_id: number;
  description: string;
  total_tasks: number;
  category_name: string;
  overdue_tasks: number;
  pending_tasks: number;
  completed_tasks: number;
}

export interface ApiChecklistResponse {
  Data: {
    overall: {
      total_tasks: number;
      overdue_tasks: number;
      pending_tasks: number;
      completed_tasks: number;
    };
    checklists: ApiChecklist[];
  };
}

// UI Types
export interface ChecklistAssignee {
  id: string;
  name: string;
  initials: string;
  color: string;
  email?: string;
}

export interface ChecklistTask {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  verified?: string;
  noteField?: boolean;
  reference_image_url?: Array<{ id: string; url: string; name: string }>;
  voice_note_url?: string | null;
  notesCount?: number;
  status?: string;
  notes?: ApiTaskNote[];
  apiId?: string;
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  created_by?: string;
  title: string;
  description: string;
  category: string;
  status: "active" | "pending" | "completed" | "in_progress" | "reopened";
  priority: "high" | "medium" | "low";
  progress: number;
  total_tasks: number;
  completed_tasks: number;
  due_date: string;
  created_at: string;
  assignees: ChecklistAssignee[];
  tasks: ChecklistTask[];
  category_id?: number;
}

// Helper function to transform API data to UI format
export const transformApiChecklistToUi = (
  apiChecklist: ApiChecklist,
): ChecklistItem => {
  let status: ChecklistItem["status"] = "active";

  if (apiChecklist.due.status === "completed") {
    status = "completed";
  } else if (
    apiChecklist.completed_tasks === apiChecklist.total_tasks &&
    apiChecklist.total_tasks > 0
  ) {
    status = "completed";
  } else if (
    apiChecklist.pending_tasks > 0 &&
    apiChecklist.completed_tasks > 0
  ) {
    status = "in_progress";
  } else if (apiChecklist.due.status === "pending") {
    status = "pending";
  }

  const priority: "high" | "medium" | "low" = "medium";
  const progress =
    apiChecklist.total_tasks > 0
      ? Math.round(
          (apiChecklist.completed_tasks / apiChecklist.total_tasks) * 100,
        )
      : 0;

  const colors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f97316",
  ];

  const assignees: ChecklistAssignee[] = apiChecklist.assignees.map(
    (assignee, index) => {
      const initials = assignee.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      return {
        id: assignee.user_id,
        name: assignee.name,
        initials,
        color: colors[index % colors.length],
      };
    },
  );

  const tasks: ChecklistTask[] = apiChecklist.tasks.map((task, index) => ({
    id: index + 1,
    title: task.title,
    description: task.description,
    completed: task.status === "completed",
    apiId: task.id,
    reference_image_url: task.reference_image_url,
    notes: task.notes || [],
    notesCount: task.notes?.length || 0,
    status: task.status,
    noteField:
      task.title.toLowerCase().includes("temperature") ||
      task.title.toLowerCase().includes("fridge") ||
      task.title.toLowerCase().includes("temp"),
  }));

  return {
    id: apiChecklist.id,
    checklist_id: apiChecklist.custom_id,
    created_by: apiChecklist.created_by,
    title: apiChecklist.name,
    description: apiChecklist.description,
    category: apiChecklist.category_name,
    status,
    priority,
    progress,
    total_tasks: apiChecklist.total_tasks,
    completed_tasks: apiChecklist.completed_tasks,
    due_date: apiChecklist.due.scheduled_for,
    created_at: apiChecklist.created_at,
    assignees,
    tasks,
    category_id: apiChecklist.category_id,
  };
};

export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const getColorForUser = (userId: string): string => {
  const colors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f97316",
  ];
  const hash = userId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return colors[hash % colors.length];
};
