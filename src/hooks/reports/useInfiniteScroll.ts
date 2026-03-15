// hooks/useInfiniteScroll.ts
import { useEffect, useRef, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  generateMockOrders,
  generateOrderDateWiseData,
  generateOrderMonthWiseData,
  generateOrderCategoryWiseData,
  generateMockExpenses,
  generateExpenseDateWiseData,
  generateExpenseMonthWiseData,
  generateMockPurchases,
  generatePurchaseDateWiseData,
  generatePurchaseMonthWiseData,
  generateMockInventory,
  generateInventoryDateWiseData,
  generateInventoryMonthWiseData,
} from "../../components/Reports/utils/mockData";

const ITEMS_PER_PAGE = 10;

export const useInfiniteScroll = (
  callback: () => void,
  hasMore: boolean,
  isLoading: boolean,
) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useRef<HTMLDivElement | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !isLoading) {
        callback();
      }
    },
    [hasMore, isLoading, callback],
  );

  useEffect(() => {
    if (!lastElementRef.current) return;

    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "20px",
      threshold: 0.1,
    });

    if (lastElementRef.current) {
      observerRef.current.observe(lastElementRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  return { lastElementRef };
};

// Orders Report Hooks
export const useOrdersReport = (activeTab: string) => {
  return useInfiniteQuery({
    queryKey: ["orders", activeTab],
    queryFn: ({ pageParam = 1 }) => {
      if (activeTab === "all") {
        return generateMockOrders(pageParam, ITEMS_PER_PAGE);
      } else if (activeTab === "date") {
        return generateOrderDateWiseData(pageParam, ITEMS_PER_PAGE);
      }
      return { data: [], hasMore: false };
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

export const useMonthWiseOrders = () => {
  return useInfiniteQuery({
    queryKey: ["orders", "month"],
    queryFn: ({ pageParam = 1 }) => {
      const data = generateOrderMonthWiseData();
      const startIndex = (pageParam - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const paginatedData = data.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        hasMore: endIndex < data.length,
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

export const useCategoryWiseOrders = () => {
  return useInfiniteQuery({
    queryKey: ["orders", "category"],
    queryFn: ({ pageParam = 1 }) => {
      const data = generateOrderCategoryWiseData();
      const startIndex = (pageParam - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const paginatedData = data.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        hasMore: endIndex < data.length,
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

// Expenses Report Hooks
export const useExpensesReport = (activeTab: string) => {
  return useInfiniteQuery({
    queryKey: ["expenses", activeTab],
    queryFn: ({ pageParam = 1 }) => {
      if (activeTab === "all") {
        return generateMockExpenses(pageParam, ITEMS_PER_PAGE);
      } else if (activeTab === "date") {
        return generateExpenseDateWiseData(pageParam, ITEMS_PER_PAGE);
      }
      return { data: [], hasMore: false };
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

export const useMonthWiseExpenses = () => {
  return useInfiniteQuery({
    queryKey: ["expenses", "month"],
    queryFn: ({ pageParam = 1 }) => {
      const data = generateExpenseMonthWiseData();
      const startIndex = (pageParam - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const paginatedData = data.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        hasMore: endIndex < data.length,
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

// Purchases Report Hooks
export const usePurchasesReport = (activeTab: string) => {
  return useInfiniteQuery({
    queryKey: ["purchases", activeTab],
    queryFn: ({ pageParam = 1 }) => {
      if (activeTab === "all") {
        return generateMockPurchases(pageParam, ITEMS_PER_PAGE);
      } else if (activeTab === "date") {
        return generatePurchaseDateWiseData(pageParam, ITEMS_PER_PAGE);
      }
      return { data: [], hasMore: false };
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

export const useMonthWisePurchases = () => {
  return useInfiniteQuery({
    queryKey: ["purchases", "month"],
    queryFn: ({ pageParam = 1 }) => {
      const data = generatePurchaseMonthWiseData();
      const startIndex = (pageParam - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const paginatedData = data.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        hasMore: endIndex < data.length,
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

// Inventory Report Hooks
export const useInventoryReport = (activeTab: string) => {
  return useInfiniteQuery({
    queryKey: ["inventory", activeTab],
    queryFn: ({ pageParam = 1 }) => {
      if (activeTab === "all") {
        return generateMockInventory(pageParam, ITEMS_PER_PAGE);
      } else if (activeTab === "date") {
        return generateInventoryDateWiseData(pageParam, ITEMS_PER_PAGE);
      }
      return { data: [], hasMore: false };
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

export const useMonthWiseInventory = () => {
  return useInfiniteQuery({
    queryKey: ["inventory", "month"],
    queryFn: ({ pageParam = 1 }) => {
      const data = generateInventoryMonthWiseData();
      const startIndex = (pageParam - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const paginatedData = data.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        hasMore: endIndex < data.length,
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });
};
