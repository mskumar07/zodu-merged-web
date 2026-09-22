import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAppDispatch } from "@store/store";
import { clearAuthData } from "@store/slices/userSlice";
import { tokenStore } from "@pages/auth/Authapi";
import { db } from "@pages/POS/db";
import { resetSessionReconciliation } from "@hooks/useReconcilePersistedSession";

/**
 * Clears every local trace of the session — POS cache, query cache, tokens and
 * the persisted user slice — and sends the user to the login page.
 */
export function useSignOut() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useCallback(async () => {
    try {
      await db.products.clear();
      await db.meta.clear();
    } catch (err) {
      // A failed IndexedDB clear must not leave the user stuck signed in.
      console.warn("[session] failed to clear the POS cache", err);
    }
    queryClient.clear();
    tokenStore.clear();
    dispatch(clearAuthData());
    // The next sign-in in this same page load has to reconcile its session
    // again — the guard is module scoped, not component scoped.
    resetSessionReconciliation();
    navigate("/login", { replace: true });
  }, [dispatch, queryClient, navigate]);
}
