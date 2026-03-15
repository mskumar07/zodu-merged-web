import ExpensesServices, { type CreateExpensePayload } from "../../Services/ExpensesServices";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";


export const useMutateCreateExpenses = ({ refetch }: { refetch: () => void }) => {
  return useMutation({
    mutationFn: (payload: CreateExpensePayload) => ExpensesServices.createExpense(payload),

    onSuccess: (response) => {
      if (response?.status === 200 || response?.data?.success) {
        refetch();
        toast.success(response?.data?.message || "Expense created successfully");
      }
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create expense");
    },
  });
};
