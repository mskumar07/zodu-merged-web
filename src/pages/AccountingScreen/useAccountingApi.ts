import axios from "axios";
import { useInfiniteQuery } from "@tanstack/react-query";
import axiosInstance from "@store/services/axiosInstance";
import type { AccountingEntry, AccountingSummary, TransactionType } from "./types";

export interface AccountingFilters {
  zodu_id: string;
  branch_id: string;
  /** YYYY-MM-DD, inclusive. */
  from_date?: string;
  to_date?: string;
  type?: TransactionType;
  search?: string;
  isRestaurant?: boolean;
}

interface AccountingPage {
  success?: boolean;
  error?: string;
  /** Covers the date range only; `type` and `search` don't narrow it. */
  summary: AccountingSummary;
  data: AccountingEntry[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

const PAGE_SIZE = 30;

class AccountingError extends Error {}

/** The server's `{ success: false, error }` message, or a fallback. */
export function apiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) return (err.response?.data as { error?: string } | undefined)?.error ?? err.message ?? fallback;
  return err instanceof Error ? err.message : fallback;
}

/** 4xx means the request itself is wrong, so retrying can't help. */
const retryOnce = (failures: number, err: unknown) =>
  failures < 1
  && !(err instanceof AccountingError)
  && !(axios.isAxiosError(err) && (err.response?.status ?? 500) < 500);

/** Accounting entries, 30 at a time (scrolling loads the next page). Pass `null` to keep the query idle. */
export function useAccountingEntries(filters: AccountingFilters | null) {
  return useInfiniteQuery({
    queryKey: ["accounting", filters],
    enabled: !!filters?.zodu_id && !!filters?.branch_id,
    initialPageParam: 1,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    retry: retryOnce,
    // Keep the last result on screen while a filter or search reloads, so the table doesn't flash empty.
    placeholderData: (previous) => previous,
    getNextPageParam: (last: AccountingPage) => (last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined),
    queryFn: async ({ pageParam, signal }): Promise<AccountingPage> => {
      const { isRestaurant, from_date, to_date, type, search, ...tenant } = filters!;
      const res = await axiosInstance.get(`${isRestaurant ? "/restaurant" : "/retail"}/api/accounting`, {
        signal,
        params: {
          ...tenant,
          ...(from_date && { from_date }),
          ...(to_date && { to_date }),
          ...(type && { type }),
          ...(search && { search }),
          page: pageParam,
          limit: PAGE_SIZE,
        },
      });
      const page = res.data as AccountingPage;
      if (page.success === false) throw new AccountingError(page.error || "Failed to load accounting entries");
      return page;
    },
  });
}
