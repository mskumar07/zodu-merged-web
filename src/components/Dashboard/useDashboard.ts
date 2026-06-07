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
    staleTime: 30_000,
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
    staleTime: 30_000,
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

export function useReminders(zodu_id: string, branch_id: string, businessType: string) {
  return useInfiniteQuery({
    queryKey: dashboardKeys.reminders(zodu_id, branch_id),
    ...makeInfiniteQuery("reminders", zodu_id, branch_id, businessType),
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
    staleTime: 30_000,
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
    staleTime: 30_000,
    enabled: isRestaurant,
  });
}