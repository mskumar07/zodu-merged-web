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
  orders:           (z: string, b: string) => [...dashboardKeys.all(z, b), "orders"],
};


const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "https://api.myzodu.com";

/**
 * The Dashboard is a wall display as much as a page: it is left open while
 * sales are rung up elsewhere, so it cannot wait to be remounted.
 *
 * A sale rung up in this browser invalidates these keys immediately (see
 * utils/dataSync.ts). The poll is the safety net for everything that message
 * cannot reach — another till, another device, a payment recorded by someone
 * else. `refetchIntervalInBackground` is left off, so a hidden tab stops
 * polling and catches up on focus instead of hammering the API all night.
 */
const LIVE_REFRESH = {
  staleTime: 15_000,
  refetchInterval: 30_000,
  refetchOnWindowFocus: true,
} as const;

function getBusinessSegment(businessType: string): string {
  return businessType.toLowerCase() === "restaurant" ? "restaurant" : "retail";
}

// ── Stats (simple query) ──────────────────────────────────────
export function useStats(zodu_id: string, branch_id: string, businessType: string) {
  const isRestaurant = businessType.toLowerCase() === "restaurant";
  return useQuery({
    queryKey: [...dashboardKeys.stats(zodu_id, branch_id), businessType],
    queryFn:  () =>
      isRestaurant
        ? fetchJSON(`${API_BASE}/restaurant/api/dashboard/summary/${zodu_id}/${branch_id}`)
        : fetchJSON(`${API_BASE}/retail/api/dashboard/stats?zodu_id=${zodu_id}&branch_id=${branch_id}`),
    select: (res) => res.data,
    enabled: !!zodu_id && !!branch_id,
    ...LIVE_REFRESH,
  });
}

// ── Infinite query factory ─────────────────────────────────────
function makeInfiniteQuery(
  endpoint: string,
  zodu_id: string,
  branch_id: string,
  businessType: string,
  limit = 20
) {
  const segment = getBusinessSegment(businessType);
  return {
    queryFn: ({ pageParam }: { pageParam: unknown }) => {
      const cursor = pageParam ? `&cursor=${pageParam}` : "";
      return fetchJSON(
        `${API_BASE}/${segment}/api/dashboard/${endpoint}?zodu_id=${zodu_id}&branch_id=${branch_id}&limit=${limit}${cursor}`
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last: any) =>
      last.pagination.hasMore ? last.pagination.nextCursor : undefined,
    ...LIVE_REFRESH,
  } satisfies Partial<UseInfiniteQueryOptions>;
}

export function useSales(zodu_id: string, branch_id: string, businessType: string) {
  const isRestaurant = businessType.toLowerCase() === "restaurant";
  return useInfiniteQuery({
    queryKey: dashboardKeys.sales(zodu_id, branch_id),
    ...makeInfiniteQuery("sales", zodu_id, branch_id, businessType),
    enabled: !isRestaurant,
  });
}

export function useTopItems(zodu_id: string, branch_id: string, businessType: string) {
  const isRestaurant = businessType.toLowerCase() === "restaurant";
  return useInfiniteQuery({
    queryKey: dashboardKeys.topItems(zodu_id, branch_id),
    ...makeInfiniteQuery("top-items", zodu_id, branch_id, businessType),
    enabled: !isRestaurant,
  });
}

export function useReminders(zodu_id: string, branch_id: string, businessType: string, limit = 5) {
  const segment = getBusinessSegment(businessType);
  return useInfiniteQuery({
    queryKey: dashboardKeys.reminders(zodu_id, branch_id),
    queryFn: ({ pageParam }: { pageParam: number }) =>
      fetchJSON(
        `${API_BASE}/${segment}/api/dashboard/reminders?zodu_id=${zodu_id}&branch_id=${branch_id}&page=${pageParam}&limit=${limit}`
      ),
    initialPageParam: 1,
    getNextPageParam: (last: any) =>
      last.pagination.hasMore ? last.pagination.page + 1 : undefined,
    ...LIVE_REFRESH,
    enabled: !!zodu_id && !!branch_id,
  });
}

export function useInventoryAlerts(zodu_id: string, branch_id: string, businessType: string) {
  return useInfiniteQuery({
    queryKey: dashboardKeys.inventoryAlerts(zodu_id, branch_id),
    ...makeInfiniteQuery("inventory-alerts", zodu_id, branch_id, businessType),
  });
}

// ── Restaurant Top Items (page-based infinite scroll) ─────────
export function useRestaurantTopItems(zodu_id: string, branch_id: string, isRestaurant: boolean, limit = 10) {
  return useInfiniteQuery({
    queryKey: [...dashboardKeys.topItems(zodu_id, branch_id), "restaurant"],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      fetchJSON(
        `${API_BASE}/restaurant/api/dashboard/top-items?zodu_id=${zodu_id}&branch_id=${branch_id}&page=${pageParam}&limit=${limit}`
      ),
    initialPageParam: 1,
    getNextPageParam: (last: any) =>
      last.pagination.page < last.pagination.totalPages
        ? last.pagination.page + 1
        : undefined,
    ...LIVE_REFRESH,
    enabled: isRestaurant,
  });
}

// ── Restaurant Recent Orders (page-based infinite scroll) ─────
export function useOrders(zodu_id: string, branch_id: string, isRestaurant: boolean, limit = 10) {
  return useInfiniteQuery({
    queryKey: dashboardKeys.orders(zodu_id, branch_id),
    queryFn: ({ pageParam }: { pageParam: number }) =>
      fetchJSON(
        `${API_BASE}/restaurant/api/dashboard/orders/${zodu_id}?branch_id=${branch_id}&page=${pageParam}&limit=${limit}`
      ),
    initialPageParam: 1,
    getNextPageParam: (last: any) =>
      last.pagination.page < last.pagination.totalPages
        ? last.pagination.page + 1
        : undefined,
    ...LIVE_REFRESH,
    enabled: isRestaurant,
  });
}