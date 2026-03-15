import { apiSlice } from "./apiSlice";

export interface CreateChecklistRequest {
  checklist: {
    title: string;
    description: string;
    category_id: number;
    branch_id: string;
    zodu_id: string;
    created_by: string;
  };
  schedule: {
    due_date: string;
    due_time: string;
    repeat: "norepeat" | "daily" | "weekly" | "monthly";
  };
  tasks: Array<{
    title: string;
    description: string;
    reference_image_url: any[];
    voice_note_url: string | null;
  }>;
  assignees: string[];
}

export interface AssignableUser {
  user_id: string;
  name: string;
  email?: string;
}

export interface AddTaskNoteRequest {
  task_id: string;
  note: string;
  created_by: string;
}

export interface GetChecklistsParams {
  zodu_id: string;
  branch_id: string;
  user_id?: string;
  limit?: number;
  offset?: number;
}

export interface Category {
  id: number;
  name: string;
  zodu_id: string;
  created_at: string;
}

export interface CreateCategoryRequest {
  name: string;
  zodu_id: string;
}

export interface UpdateCategoryRequest {
  name: string;
}

export const checklistApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all checklists (includes tasks with notes)
    getChecklistDashboard: builder.query<any, GetChecklistsParams>({
      query: ({ zodu_id, branch_id, user_id, limit = 50, offset = 0 }) => ({
        url: "checklist/checklists",
        method: "GET",
        params: {
          zodu_id,
          branch_id,
          ...(user_id ? { user_id } : {}),
          limit,
          offset,
        },
      }),
      providesTags: ["Checklist"],
    }),

    // Create checklist
    createChecklist: builder.mutation<any, CreateChecklistRequest>({
      query: (data) => ({
        url: "checklist/checklists/create",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Checklist"],
    }),

    // Update checklist
    updateChecklist: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `checklist/checklists/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["Checklist"],
    }),

    // Delete checklist
    deleteChecklist: builder.mutation<any, string>({
      query: (id) => ({
        url: `checklist/checklists/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Checklist"],
    }),

    // Complete task
    completeTask: builder.mutation({
      query: ({
        taskId,
        completed_by,
        status,
      }: {
        taskId: string;
        completed_by: string;
        status: string;
      }) => ({
        url: `checklist/task-instances/${taskId}/complete`,
        method: "PATCH",
        data: { completed_by, status },
      }),
      invalidatesTags: ["Checklist"],
    }),

    ChangeInprogressTask: builder.mutation({
      query: ({
        taskId,
        completed_by,
        status,
      }: {
        taskId: string;
        completed_by: string;
        status: string;
      }) => ({
        url: `checklist/task-instances/${taskId}/complete`,
        method: "PATCH",
        data: { completed_by, status },
      }),
      invalidatesTags: ["Checklist"],
    }),

    // Add task note
    addTaskNote: builder.mutation({
      query: (data: AddTaskNoteRequest) => ({
        url: "checklist/task-notes",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Checklist"], // Refresh checklist data
    }),

    updateTaskNote: builder.mutation({
      query: ({ notes, id }: { notes: any; id: any }) => ({
        url: `checklist/task-notes/${id}`,
        method: "PUT",
        data: notes,
      }),
      invalidatesTags: ["Checklist"], // Refresh checklist data
    }),

    deleteTaskNote: builder.mutation({
      query: (id: any) => ({
        url: `checklist/task-notes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Checklist"], // Refresh checklist data
    }),

    // List categories
    getCategories: builder.query<
      { data: Category[] },
      { zodu_id: string; branch_id: string }
    >({
      query: ({ zodu_id, branch_id }) => ({
        url: "checklist/categories",
        method: "GET",
        params: { zodu_id, branch_id },
      }),

      providesTags: ["Category"],
    }),

    createCategory: builder.mutation<Category, any>({
      query: (data) => ({
        url: "checklist/categories",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Category"],
    }),
    updateCategory: builder.mutation<
      Category,
      { id: number; data: UpdateCategoryRequest }
    >({
      query: ({ id, data }) => ({
        url: `checklist/categories/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["Category"],
    }),

    deleteCategory: builder.mutation({
      query: (id: number) => ({
        url: `checklist/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),

    // Get assignable users
    getAssignableUsers: builder.query<
      { data: AssignableUser[] },
      { zodu_id: string; branch_id: string }
    >({
      query: ({ zodu_id, branch_id }) => ({
        url: "checklist/assignees",
        method: "GET",
        params: { zodu_id, branch_id },
      }),
      transformResponse: (res) => {
        return res as any;
      },
    }),
  }),
});

export const {
  useGetChecklistDashboardQuery,
  useChangeInprogressTaskMutation,
  useUpdateTaskNoteMutation,
  useDeleteTaskNoteMutation,
  useCreateChecklistMutation,
  useUpdateChecklistMutation,
  useDeleteChecklistMutation,
  useCompleteTaskMutation,
  useAddTaskNoteMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetAssignableUsersQuery,
} = checklistApi;
