import type { ReportOption } from "@/pages/reports/reportsOverview";

export const ROUTE_MAPPING = {
  orders: {
    datewise: "/report/orders/datewise",
    monthwise: "/report/orders/monthwise",
    yearwise: "/report/orders/yearwise",
  },
  purchase: {
    datewise: "/report/purchase/datewise",
    monthwise: "/report/purchase/monthwise",
    yearwise: "/report/purchase/yearwise",
  },
  expense: {
    datewise: "/report/expense/datewise",
    monthwise: "/report/expense/monthwise",
    yearwise: "/report/expense/yearwise",
  },
  stocks: {
    current: "/report/stocks/current",
  },
} as const;

export const getReportRoute = (
  reportType: "orders" | "purchase" | "expense" | "inventory",
  reportView: "datewise" | "monthwise" | "yearwise" | "current"
): string => {
  if (reportType === "inventory") {
    return ROUTE_MAPPING.stocks.current;
  }

  const typeMap: Record<string, keyof typeof ROUTE_MAPPING> = {
    orders: "orders",
    purchase: "purchase",
    expense: "expense",
  };

  const viewMap: Record<string, "datewise" | "monthwise" | "yearwise"> = {
    datewise: "datewise",
    monthwise: "monthwise",
    yearwise: "yearwise",
    normal: "datewise",
  };

  const type = typeMap[reportType];
  const view = viewMap[reportView] || "datewise";

  return ROUTE_MAPPING[type][view];
};

export const handleReportChipClick = (
  report: ReportOption,
  navigate: (path: string) => void
): void => {
  if (report.path) {
    navigate(report.path);
  }
};

export const handleFavoriteToggle = (
  event: React.MouseEvent,
  reportId: string,
  favorites: string[],
  setFavorites: React.Dispatch<React.SetStateAction<string[]>>
): void => {
  event.stopPropagation();
  setFavorites((prev) => {
    const newFavorites = prev.includes(reportId)
      ? prev.filter((fav) => fav !== reportId)
      : [...prev, reportId];
    return newFavorites;
  });
};

export const navigateToReport = (
  reportType: "orders" | "purchase" | "expense" | "inventory",
  reportView: "normal" | "monthwise" | "yearwise",
  navigate: (path: string) => void
): void => {
  const viewMap: Record<string, "datewise" | "monthwise" | "yearwise" | "current"> = {
    normal: "datewise",
    monthwise: "monthwise",
    yearwise: "yearwise",
  };

  const route = getReportRoute(reportType, viewMap[reportView]);
  navigate(route);
};
