import { useCallback, useEffect, useRef, useState } from "react";
import { useGetOccurrencesQuery, type OccurrenceQuery, type TaskOccurrence } from "./checklistNewApi";

const PAGE_SIZE = 20;

/**
 * Occurrence rows for the landing table: pages accumulate as the user scrolls
 * (same sentinel pattern as the other tables on the screen). Pass `null` to
 * stay idle — the query is skipped and no request is made.
 *
 * Rows are keyed by instance_id when merged, so a refetch of a later page
 * (e.g. after a status update invalidates the list) replaces rows instead of
 * appending duplicates.
 */
export function useOccurrenceRows(params: Omit<OccurrenceQuery, "page" | "limit"> | null) {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<TaskOccurrence[]>([]);
  const sentinelRef = useRef<HTMLTableRowElement | null>(null);

  // `currentData` is only ever the result for the arguments requested right now
  // (undefined while loading or skipped); `data` would keep showing the previous
  // filter's result.
  const { currentData: data, isFetching, isLoading, refetch } = useGetOccurrencesQuery(
    { ...(params as OccurrenceQuery), page, limit: PAGE_SIZE },
    { skip: !params }
  );

  // A different filter set is a new context — drop the old rows at once.
  const paramsKey = JSON.stringify(params);
  useEffect(() => {
    setRows([]);
    setPage(1);
  }, [paramsKey]);

  // paramsKey is a dependency so a cache hit (same filters switched back on, which
  // delivers the same `data` as before) still refills the rows the effect above just cleared.
  useEffect(() => {
    if (!data || data.pagination.page !== page) return;
    setRows((prev) => {
      if (page === 1) return data.data;
      const incoming = new Map(data.data.map((r) => [r.instance_id, r]));
      const merged = prev.map((r) => incoming.get(r.instance_id) ?? r);
      const known = new Set(prev.map((r) => r.instance_id));
      return [...merged, ...data.data.filter((r) => !known.has(r.instance_id))];
    });
  }, [data, page, paramsKey]);

  const hasMore = !!data && data.pagination.page === page && page < data.pagination.pages;

  // Load the next page once the user actually scrolls the container (see the
  // matching effects in ChecklistDashboard for why scrollTop is checked).
  useEffect(() => {
    const node = sentinelRef.current;
    if (!hasMore || !node) return;
    const container = node.parentElement;
    let triggered = false;
    const tryTrigger = () => {
      if (triggered || (container?.scrollTop ?? 0) <= 0) return;
      triggered = true;
      setPage((p) => p + 1);
    };
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) tryTrigger(); },
      { root: container, threshold: 0.1 }
    );
    observer.observe(node);
    container?.addEventListener("scroll", tryTrigger);
    return () => { observer.disconnect(); container?.removeEventListener("scroll", tryTrigger); };
  }, [hasMore]);

  /** Back to page 1 after a change; refetches directly when already there. */
  const reset = useCallback(() => {
    if (!params) return;
    if (page === 1) refetch(); else setPage(1);
  }, [params, page, refetch]);

  return {
    rows,
    total: data?.pagination.total ?? 0,
    isLoading: (isLoading || isFetching) && rows.length === 0,
    hasMore,
    sentinelRef,
    reset,
  };
}
