import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useAppDispatch } from "@store/store";
import { addUserData } from "@store/slices/userSlice";
import { apiSlice } from "@store/services/apiSlice";
import { switchContext } from "@utils/authSession";

export interface BranchTarget {
  zoduId: string;
  branchId: string;
  branchName: string;
  businessType?: string;
}

/**
 * Changes the active company/branch: first the token (the server reads the
 * company and branch from it, nothing else), then the UI, then every cached
 * screen's data is fetched again for the new branch.
 *
 * Resolves false, with the UI left on the old branch, when the server refuses
 * (404: not a company/branch this user may use) or can't be reached.
 */
export function useSwitchBranch() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useCallback(
    async (target: BranchTarget): Promise<boolean> => {
      try {
        await switchContext(target.zoduId, target.branchId);
      } catch (err) {
        const status = (err as { response?: { status?: number } }).response?.status;
        toast.error(
          status === 404 ? "You don't have access to that branch." : "Couldn't switch branch. Please try again.",
          { toastId: "branch-switch" }
        );
        return false;
      }
      dispatch(addUserData(target));
      dispatch(apiSlice.util.resetApiState());
      void queryClient.invalidateQueries();
      return true;
    },
    [dispatch, queryClient]
  );
}
