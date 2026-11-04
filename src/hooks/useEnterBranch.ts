import { useCallback } from "react";
import { useAppDispatch } from "@store/store";
import { setRoleAccess } from "@store/slices/userSlice";
import type { CompanyWithBranches } from "@pages/auth/Authapi";
import { loadBranchSession } from "@pages/auth/loadBranchSession";
import { markSessionReconciled } from "@hooks/useReconcilePersistedSession";
import { useSwitchBranch } from "@hooks/useSwitchBranch";

/**
 * Makes (company, branch) the active tenant and loads that branch's permissions
 * and settings: what /select-branch does on a click, without the screen. Resolves
 * false (UI left where it was) when the switch is refused.
 */
export function useEnterBranch() {
  const dispatch = useAppDispatch();
  const switchBranch = useSwitchBranch();

  return useCallback(
    async (company: CompanyWithBranches, branchId: string, branchName: string): Promise<boolean> => {
      const switched = await switchBranch({
        zoduId: company.zodu_id,
        branchId,
        branchName,
        businessType: company.business_type ?? "",
      });
      if (!switched) return false;
      const result = await loadBranchSession(dispatch, company.zodu_id, branchId);
      if (!result.roleAccessOk) dispatch(setRoleAccess([]));
      markSessionReconciled(company.zodu_id, branchId);
      return true;
    },
    [dispatch, switchBranch]
  );
}
