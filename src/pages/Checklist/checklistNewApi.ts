import { apiSlice } from "@store/services/apiSlice";

// ─── Request / Response Types ──────────────────────────────────────────────────

export interface ChecklistAssignee {
  id?: string;
  employee_id: string;
  employee_name: string;
}

export interface ChecklistItemPayload {
  id?: string;
  item_order: number;
  item_title: string;
  description?: string;
  file_url?: any[];
}

export interface CreateChecklistPayload {
  zodu_id: string;
  branch_id: string;
  title: string;
  description?: string;
  status?: string;
  due_date?: string;
  start_date?: string;
  is_recurring: boolean;
  recur_frequency?: string | null;
  recur_every?: number | null;
  recur_ends?: string | null;
  recur_end_date?: string | null;
  recur_start_date?: string | null;
  assignees: ChecklistAssignee[];
  items: ChecklistItemPayload[];
  created_by?: string;
  created_by_name?: string;
  /** Only included on update when an existing checklist-level attachment was removed — the remaining files to keep. */
  attachments?: any[];
}

export interface FileEntry {
  id: string;
  file_name: string;
  file_url: string;
  uploaded_by: string;
  uploaded_by_name: string;
}

export interface ChecklistItemResponse {
  id: string;
  checklist_id: string;
  item_order: number;
  item_title: string;
  description: string;
  file_url: FileEntry[];
  employee_checklist_upload?: FileEntry[] | null;
  status?: string;
  remarks?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ChecklistAssigneeResponse {
  id?: string;
  checklist_id?: string;
  employee_id: string;
  employee_name: string;
  status: string;
  assigned_at?: string;
}

export interface ChecklistAttachmentResponse {
  id: string;
  checklist_id?: string;
  file_url: FileEntry[];
  uploaded_by?: string;
  uploaded_by_name?: string;
  uploaded_at?: string;
}

export interface ChecklistResponse {
  id: string;
  checklist_code?: string;
  zodu_id: string;
  branch_id: string;
  title: string;
  description: string;
  status: string;
  due_date: string;
  start_date: string | null;
  is_recurring: boolean;
  recur_frequency: string | null;
  recur_every: number | null;
  recur_ends: string | null;
  recur_end_date: string | null;
  recur_start_date: string | null;
  created_by: string;
  created_by_name: string;
  updated_by?: string | null;
  updated_by_name?: string | null;
  created_at: string;
  updated_at?: string;
  assignees: ChecklistAssigneeResponse[];
  items: ChecklistItemResponse[];
  attachments?: ChecklistAttachmentResponse[];
}

export interface MySummaryResponse {
  employee_id: string;
  employee_name: string;
  tasks_assigned: number;
  pending: number;
  in_progress: number;
  completed: number;
  overdue: number;
  last_activity: string | null;
}

export interface MyTaskItem {
  id: string;
  checklist_code?: string;
  title: string;
  description: string;
  status: string;
  due_date: string;
  start_date: string;
  is_recurring: boolean;
  created_by_name: string;
  last_update: string | null;
  total_items: number;
  completed_items: number;
}

export interface MyTasksResponse {
  success: boolean;
  tabs: { all: number; pending: number; in_progress: number; completed: number; overdue: number };
  data: MyTaskItem[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

export interface AssignedEmployeesSummary {
  total_assigned: number;
  pending: number;
  completed: number;
}

export interface AssignedChecklistAssignee {
  employee_id: string;
  employee_name: string;
  status: string;
}

export interface AssignedChecklistSummary {
  checklist_id: string;
  checklist_code?: string;
  title: string;
  status?: string;
  created_by_name?: string;
  due_date: string;
  last_activity: string | null;
  total_items: number;
  assignees: AssignedChecklistAssignee[];
  pending: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  overdue: number;
}

export interface AssignedEmployeesResponse {
  success: boolean;
  data: AssignedChecklistSummary[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

export interface EmployeeForAssign {
  employee_id: string;
  employee_code: string;
  name: string;
  email?: string;
  phone?: string;
  status?: string;
  employment_type?: string;
  branch_id?: string;
}

export interface TaskStatusItemPayload {
  item_id: string;
  status: "Not Started" | "Completed" | "In Progress" | "Cancelled";
  remarks?: string;
  employee_id?: string | null;
}

export interface UpdateTaskStatusPayload {
  zodu_id: string;
  branch_id: string;
  items: TaskStatusItemPayload[];
}

// ─── Injected API ──────────────────────────────────────────────────────────────

export const checklistNewApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // POST /checklist/api/checklists
    createNewChecklist: builder.mutation<{ success: boolean; data: ChecklistResponse }, CreateChecklistPayload>({
      query: (body) => ({
        url: "checklist/api/checklists",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: "Checklist", id: "LIST" }],
    }),

    // GET /checklist/api/checklists/:id?zodu_id=&branch_id=
    getChecklistById: builder.query<{ success: boolean; data: ChecklistResponse }, { id: string; zodu_id: string; branch_id: string }>({
      query: ({ id, zodu_id, branch_id }) => ({
        url: `checklist/api/checklists/${id}`,
        method: "GET",
        params: { zodu_id, branch_id },
      }),
      providesTags: (_result, _error, { id }) => [{ type: "Checklist", id }],
    }),

    // PUT /checklist/api/checklists/:id
    updateNewChecklist: builder.mutation<{ success: boolean; data: any }, { id: string; body: Partial<CreateChecklistPayload> }>({
      query: ({ id, body }) => ({
        url: `checklist/api/checklists/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Checklist", id }, { type: "Checklist", id: "LIST" }],
    }),

    // PUT /checklist/api/checklists/:id/task-status
    updateTaskStatus: builder.mutation<{ success: boolean; data: ChecklistResponse }, { id: string; body: UpdateTaskStatusPayload }>({
      query: ({ id, body }) => ({
        url: `checklist/api/checklists/${id}/task-status`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Checklist", id }, { type: "Checklist", id: "LIST" }],
    }),

    // DELETE /checklist/api/checklists/:id
    deleteNewChecklist: builder.mutation<{ success: boolean }, { id: string; zodu_id: string; branch_id: string }>({
      query: ({ id, zodu_id, branch_id }) => ({
        url: `checklist/api/checklists/${id}`,
        method: "DELETE",
        data: { zodu_id, branch_id },
      }),
      invalidatesTags: [{ type: "Checklist", id: "LIST" }],
    }),

    // POST /checklist/api/checklists/:id/attachments
    uploadChecklistAttachments: builder.mutation<{ success: boolean; data: any }, { id: string; zodu_id: string; branch_id: string; employee_id: string; employee_name: string; formData: FormData; employee_checklist_upload?: boolean; skipInvalidation?: boolean }>({
      query: ({ id, zodu_id, branch_id, employee_id, employee_name, formData, employee_checklist_upload }) => {
        formData.append("zodu_id", zodu_id);
        formData.append("branch_id", branch_id);
        formData.append("employee_id", employee_id);
        formData.append("employee_name", employee_name);
        if (employee_checklist_upload) formData.append("employee_checklist_upload", "true");
        return {
          url: `checklist/api/checklists/${id}/attachments`,
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: (_result, _error, { id, skipInvalidation }) => skipInvalidation ? [] : [{ type: "Checklist", id }],
    }),

    // POST /checklist/api/checklists/items/:item_id/files
    uploadItemFile: builder.mutation<{ success: boolean; data: any }, { item_id: string; formData: FormData; checklistId?: string; employee_id?: string; employee_name?: string; employee_checklist_upload?: boolean }>({
      query: ({ item_id, formData, employee_id, employee_name, employee_checklist_upload }) => {
        if (employee_id) formData.append("employee_id", employee_id);
        if (employee_name) formData.append("employee_name", employee_name);
        if (employee_checklist_upload) formData.append("employee_checklist_upload", "true");
        return {
          url: `checklist/api/checklists/items/${item_id}/files`,
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: (_result, _error, { checklistId }) => (checklistId ? [{ type: "Checklist", id: checklistId }] : []),
    }),

    // DELETE /checklist/api/checklists/:id/attachments/:file_id
    deleteChecklistAttachment: builder.mutation<{ success: boolean; data: any[] }, { checklist_id: string; file_id: string }>({
      query: ({ checklist_id, file_id }) => ({
        url: `checklist/api/checklists/${checklist_id}/attachments/${file_id}`,
        method: "DELETE",
      }),
      invalidatesTags: () => [],
    }),

    // DELETE /checklist/api/checklists/items/:item_id/files/:file_id
    deleteItemFile: builder.mutation<{ success: boolean; data: any }, { item_id: string; file_id: string; checklistId?: string; employee_checklist_upload?: boolean }>({
      query: ({ item_id, file_id, employee_checklist_upload }) => ({
        url: `checklist/api/checklists/items/${item_id}/files/${file_id}`,
        method: "DELETE",
        data: { employee_checklist_upload: employee_checklist_upload ?? false },
      }),
      invalidatesTags: (_result, _error, { checklistId }) => (checklistId ? [{ type: "Checklist", id: checklistId }] : []),
    }),

    // DELETE /checklist/api/checklists/items/:item_id
    deleteChecklistItem: builder.mutation<{ success: boolean }, { item_id: string; checklistId?: string }>({
      query: ({ item_id }) => ({
        url: `checklist/api/checklists/items/${item_id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { checklistId }) => (checklistId ? [{ type: "Checklist", id: checklistId }] : []),
    }),

    // GET /checklist/api/checklists/my-summary
    getMyChecklistSummary: builder.query<{ success: boolean; data: MySummaryResponse }, { zodu_id: string; branch_id: string; employee_id: string; search?: string; status?: string }>({
      query: ({ zodu_id, branch_id, employee_id, search, status }) => ({
        url: "checklist/api/checklists/my-summary",
        method: "GET",
        params: {
          zodu_id, branch_id, employee_id,
          ...(search ? { search } : {}),
          ...(status && status !== "All Status" ? { status } : {}),
        },
      }),
      providesTags: [{ type: "Checklist", id: "LIST" }],
    }),

    // GET /checklist/api/checklists/assigned-employees
    getAssignedEmployees: builder.query<AssignedEmployeesResponse, { zodu_id: string; branch_id: string; employee_id: string; page?: number; limit?: number; search?: string; status?: string }>({
      query: ({ zodu_id, branch_id, employee_id, page = 1, limit = 10, search, status }) => ({
        url: "checklist/api/checklists/assigned-employees",
        method: "GET",
        params: {
          zodu_id, branch_id, created_by: employee_id, page, limit,
          ...(search ? { search } : {}),
          ...(status && status !== "All Status" ? { status } : {}),
        },
      }),
      providesTags: [{ type: "Checklist", id: "LIST" }],
    }),

    // GET /checklist/api/checklists/assigned-employees-summary
    getAssignedEmployeesSummary: builder.query<{ success: boolean; data: AssignedEmployeesSummary }, { zodu_id: string; branch_id: string; employee_id: string; search?: string; status?: string }>({
      query: ({ zodu_id, branch_id, employee_id, search, status }) => ({
        url: "checklist/api/checklists/assigned-employees-summary",
        method: "GET",
        params: {
          zodu_id, branch_id, created_by: employee_id,
          ...(search ? { search } : {}),
          ...(status && status !== "All Status" ? { status } : {}),
        },
      }),
      providesTags: [{ type: "Checklist", id: "LIST" }],
    }),

    // GET /checklist/api/checklists/my-tasks
    getMyChecklistTasks: builder.query<MyTasksResponse, { zodu_id: string; branch_id: string; employee_id: string; page?: number; limit?: number; search?: string; status?: string }>({
      query: ({ zodu_id, branch_id, employee_id, page = 1, limit = 10, search, status }) => ({
        url: "checklist/api/checklists/my-tasks",
        method: "GET",
        params: {
          zodu_id, branch_id, employee_id, page, limit,
          ...(search ? { search } : {}),
          ...(status && status !== "All Status" ? { status } : {}),
        },
      }),
      providesTags: [{ type: "Checklist", id: "LIST" }],
    }),

    // GET employees list for assignment
    getEmployeesForAssign: builder.query<{ success: boolean; data: EmployeeForAssign[]; pagination: any }, { zodu_id: string; branch_id: string }>({
      query: ({ zodu_id, branch_id }) => ({
        url: "employee/api/employees",
        method: "GET",
        params: { zodu_id, branch_id, status: "active", page: 1, limit: 100 },
      }),
    }),
  }),
});

export const {
  useCreateNewChecklistMutation,
  useGetChecklistByIdQuery,
  useUpdateNewChecklistMutation,
  useUpdateTaskStatusMutation,
  useDeleteNewChecklistMutation,
  useUploadChecklistAttachmentsMutation,
  useUploadItemFileMutation,
  useDeleteChecklistAttachmentMutation,
  useDeleteItemFileMutation,
  useDeleteChecklistItemMutation,
  useGetMyChecklistSummaryQuery,
  useGetMyChecklistTasksQuery,
  useGetAssignedEmployeesQuery,
  useGetAssignedEmployeesSummaryQuery,
  useGetEmployeesForAssignQuery,
} = checklistNewApi;
