import {
  useQuery,
  useInfiniteQuery,
  type UseInfiniteQueryOptions,
} from "@tanstack/react-query";


async function fetchJSON(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error((await res.json()).error ?? "Request failed");
  return res.json();
}

// ── Query key factory ─────────────────────────────────────────
export const dashboardKeys = {
  all:              (z: string, b: string) => ["dashboard", z, b] as const,
  stats:            (z: string, b: string) => [...dashboardKeys.all(z, b), "stats"],
  sales:            (z: string, b: string) => [...dashboardKeys.all(z, b), "sales"],
  topItems:         (z: string, b: string) => [...dashboardKeys.all(z, b), "top-items"],
  reminders:        (z: string, b: string) => [...dashboardKeys.all(z, b), "reminders"],
  inventoryAlerts:  (z: string, b: string) => [...dashboardKeys.all(z, b), "inventory-alerts"],
};


const API_BASE  = import.meta.env.VITE_API_BASE_URL ?? "https://api.myzodu.com";


// ── Stats (simple query) ──────────────────────────────────────
export function useStats(zodu_id: string, branch_id: string) {
  return useQuery({
    queryKey: dashboardKeys.stats(zodu_id, branch_id),
    queryFn:  () =>
      fetchJSON(`${API_BASE}/retail/api/dashboard/stats?zodu_id=${zodu_id}&branch_id=${branch_id}`),
    select: (res) => res.data,
    staleTime: 30_000,
  });
}

// ── Infinite query factory ─────────────────────────────────────
function makeInfiniteQuery(
  endpoint: string,
  zodu_id: string,
  branch_id: string,
  limit = 20
) {
  return {
    queryFn: ({ pageParam }: { pageParam: string | undefined }) => {
      const cursor = pageParam ? `&cursor=${pageParam}` : "";
      return fetchJSON(
        `${API_BASE}/retail/api/dashboard/${endpoint}?zodu_id=${zodu_id}&branch_id=${branch_id}&limit=${limit}${cursor}`
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last: any) =>
      last.pagination.hasMore ? last.pagination.nextCursor : undefined,
    staleTime: 30_000,
  } satisfies Partial<UseInfiniteQueryOptions>;
}

export function useSales(zodu_id: string, branch_id: string) {
  return useInfiniteQuery({
    queryKey: dashboardKeys.sales(zodu_id, branch_id),
    ...makeInfiniteQuery("sales", zodu_id, branch_id),
  });
}

export function useTopItems(zodu_id: string, branch_id: string) {
  return useInfiniteQuery({
    queryKey: dashboardKeys.topItems(zodu_id, branch_id),
    ...makeInfiniteQuery("top-items", zodu_id, branch_id),
  });
}

export function useReminders(zodu_id: string, branch_id: string) {
  return useInfiniteQuery({
    queryKey: dashboardKeys.reminders(zodu_id, branch_id),
    ...makeInfiniteQuery("reminders", zodu_id, branch_id),
  });
}

export function useInventoryAlerts(zodu_id: string, branch_id: string) {
  return useInfiniteQuery({
    queryKey: dashboardKeys.inventoryAlerts(zodu_id, branch_id),
    ...makeInfiniteQuery("inventory-alerts", zodu_id, branch_id),
  });
}