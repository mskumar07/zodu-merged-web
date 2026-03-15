// components/reports/OrderReport.tsx
import type {
  OrderCategoryReportParams,
  OrdersReportParams,
} from "@/types/report";
import OrderDetailsModal from "@components/Dashboard/RecentOrders/OrderDetailsModal";
import { useOrderDetailsQuery } from "@hooks/dashboard";
import useOrderCategoryReport from "@hooks/queryHooks/reports/useOrderCategoryReport";
import useOrdersReport from "@hooks/queryHooks/reports/useOrdersReport";
import { Clear, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Collapse,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { params_ids } from "@utils/paramId";
import React, { useCallback, useEffect, useState } from "react";
import { PageHeader } from "./reportHeader";
import { SummaryCard } from "./SummaryCards";
import type { Order } from "./types/report.type";
import { ReportFilterBar } from "./utils/ReportFilterBar";

const OrderReport: React.FC = () => {
  const [activeTab, setActiveTab] = useState("all-orders");
  const [searchText, setSearchText] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString(),
  );
  const [page, setPage] = useState(1);
  const [categoryPage, setCategoryPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const allOrdersContainerRef = React.useRef<HTMLDivElement>(null);
  const dateWiseContainerRef = React.useRef<HTMLDivElement>(null);
  const categoryContainerRef = React.useRef<HTMLDivElement>(null);
  const { data: selectedOrder } = useOrderDetailsQuery({
    branchId: "ZODU035B1",
    orderId: selectedOrderId || "",
    enabled: !!selectedOrderId && isOrderModalOpen,
  });

  const tabs = [
    "All Orders",
    "Date Wise",
    "Month/Year Wise",
    "Category/Item Wise",
  ];

  useEffect(() => {
    setPage(1);
    setCategoryPage(1);
  }, [activeTab, fromDate, toDate, selectedYear, searchText]);

  const getFilterType = () => {
    if (activeTab === "all-orders") return "all_orders";
    if (activeTab === "date-wise") return "date_wise";
    if (activeTab === "month/year-wise") return "month_year_wise";
    return "all_orders";
  };

  const buildParams = (): OrdersReportParams => {
    const baseParams: OrdersReportParams = {
      zodu_id: params_ids.zudoId,
      branch_id: params_ids.branch.branch_1,
      filterType: getFilterType(),
      reportView: "normal",
      page,
      limit: 10,
    };

    if (fromDate && toDate) {
      baseParams.start_date = fromDate;
      baseParams.end_date = toDate;
    }

    if (activeTab === "month/year-wise" && selectedYear) {
      baseParams.year = selectedYear;
    }

    if (searchText) {
      baseParams.search = searchText;
    }

    return baseParams;
  };

  const params = buildParams();

  const {
    list,
    chartData,
    totalAmount,
    totalItems,
    pagination,
    isLoading,
    isFetching,
  } = useOrdersReport({ params, enabled: activeTab !== "category/item-wise" });

  /* CHECK THIS */
  // Single page params for summary cards (always page 1)
  const summaryParams = {
    ...params,
    page: 1,
  };

  const {
    totalAmount: summaryTotalAmount,
    totalItems: summaryTotalItems,
    pagination: summaryPagination,
  } = useOrdersReport({
    params: summaryParams,
    enabled: activeTab !== "category/item-wise",
  });

  const categoryParams: OrderCategoryReportParams = {
    zodu_id: params_ids.zudoId,
    branch_id: params_ids.branch.branch_1,
    page: categoryPage,
    limit: 10,
    search: searchText || undefined,
  };

  const {
    categories,
    summary: categorySummary,
    pagination: categoryPagination,
    isLoading: isCategoryLoading,
    isFetching: isCategoryFetching,
  } = useOrderCategoryReport({
    params: categoryParams,
    enabled: activeTab === "category/item-wise",
  });
  /* CHECK THIS */
  // Single page params for category summary cards (always page 1)
  const categorySummaryParams: OrderCategoryReportParams = {
    zodu_id: params_ids.zudoId,
    branch_id: params_ids.branch.branch_1,
    page: 1,
    limit: 10,
    search: searchText || undefined,
  };

  const { summary: categorySummarySinglePage } = useOrderCategoryReport({
    params: categorySummaryParams,
    enabled: activeTab === "category/item-wise",
  });

  const handleLoadMore = () => {
    if (!isLoading && !isFetching && page < pagination.totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const handleClearFilters = () => {
    setSearchText("");
    setFromDate("");
    setToDate("");
    setSelectedMonth("");
    setSelectedYear(new Date().getFullYear().toString());
  };

  const handleCategoryLoadMore = () => {
    if (
      !isCategoryLoading &&
      !isCategoryFetching &&
      categoryPage < categoryPagination.totalPages
    ) {
      setCategoryPage((prev) => prev + 1);
    }
  };

  const handleOrderClick = useCallback((order: Order) => {
    setSelectedOrderId(order?.api_order_id);
    setIsOrderModalOpen(true);
  }, []);

  const closeOrderModal = useCallback(() => {
    setIsOrderModalOpen(false);
    setSelectedOrderId(null);
  }, []);

  const formatItemsDisplay = (items: any): string => {
    if (!items) return "0";
    return `${items}`;
  };

  useEffect(() => {
    const container = allOrdersContainerRef.current;
    if (!container || activeTab !== "all-orders") return;

    const handleScroll = () => {
      if (isLoading || isFetching) return;
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollTop + clientHeight >= scrollHeight - 50) {
        handleLoadMore();
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [isLoading, isFetching, page, pagination.totalPages, activeTab]);

  useEffect(() => {
    const container = dateWiseContainerRef.current;
    if (!container || activeTab !== "date-wise") return;

    const handleScroll = () => {
      if (isLoading || isFetching) return;
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollTop + clientHeight >= scrollHeight - 50) {
        handleLoadMore();
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [isLoading, isFetching, page, pagination.totalPages, activeTab]);

  useEffect(() => {
    const container = categoryContainerRef.current;
    if (!container || activeTab !== "category/item-wise") return;

    const handleScroll = () => {
      if (isCategoryLoading || isCategoryFetching) return;
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollTop + clientHeight >= scrollHeight - 50) {
        handleCategoryLoadMore();
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [
    isCategoryLoading,
    isCategoryFetching,
    categoryPage,
    categoryPagination.totalPages,
    activeTab,
  ]);

  const renderAllOrdersTable = () => {
    return (
      <TableContainer
        ref={allOrdersContainerRef}
        component={Paper}
        sx={{
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
          overflow: "hidden",
          maxHeight: "600px",
          overflowY: "auto",
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}>
                DATE & TIME
              </TableCell>
              <TableCell sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}>
                ORDER ID
              </TableCell>
              {/* moved to new position as per z-I51 */}
              <TableCell
                sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}
                align="right"
              >
                TOTAL AMOUNT
              </TableCell>
              <TableCell
                sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}
                align="right"
              >
                GST
              </TableCell>
              <TableCell sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}>
                ORDER TYPE
              </TableCell>
              <TableCell sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}>
                ITEMS
              </TableCell>
              {/* Removed the payment type as per Z-I51 */}
              {/* <TableCell sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}>
                PAYMENT TYPE
              </TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map((order: any, index: number) => (
              <TableRow
                key={`${order.api_order_id}-${index}`}
                hover
                sx={{ "&:last-child td": { borderBottom: 0 } }}
              >
                <TableCell sx={{ py: 2 }}>{order.created_at}</TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Typography
                    color="info"
                    sx={{
                      cursor: "pointer",
                      fontWeight: 500,
                      "&:hover": { textDecoration: "underline" },
                    }}
                    onClick={() => handleOrderClick(order)}
                  >
                    {order.public_order_no}
                  </Typography>
                </TableCell>

                <TableCell sx={{ py: 2 }} align="right">
                  <Typography fontWeight="bold">
                    ₹{parseFloat(order.total_amt || 0).toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2 }} align="right">
                  ₹{parseFloat(order.total_tax || 0).toFixed(2)}
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Typography
                    sx={{
                      color:
                        order.order_type === "Delivery"
                          ? "#2e7d32"
                          : order.order_type === "Takeaway"
                            ? "#1976d2"
                            : "#d32f2f",
                      fontWeight: 600,
                    }}
                  >
                    {order.order_type}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  {formatItemsDisplay(order.no_of_items)}
                </TableCell>

                {/* <TableCell sx={{ py: 2 }} align="right">
                  <Typography fontWeight="bold">
                    ₹{parseFloat(order.total_amt || 0).toFixed(2)}
                  </Typography>
                </TableCell> */}
                {/* <TableCell sx={{ py: 2 }}>
                 <Typography sx={{fontWeight:500}}>{order.payment_type || "-"}</Typography>
                </TableCell> */}
              </TableRow>
            ))}
            {isFetching && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderDateWiseTable = () => {
    return (
      <TableContainer
        ref={dateWiseContainerRef}
        component={Paper}
        sx={{
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
          overflow: "hidden",
          maxHeight: "600px",
          overflowY: "auto",
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}>
                DATE
              </TableCell>
              <TableCell
                sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}
                align="right"
              >
                TOTAL BILLS
              </TableCell>
              <TableCell
                sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}
                align="right"
              >
                TOTAL AMOUNT
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {chartData.map((data: any, index: number) => (
              <TableRow
                key={index}
                hover
                sx={{ "&:last-child td": { borderBottom: 0 } }}
              >
                <TableCell sx={{ py: 2 }}>{data.created_at}</TableCell>
                <TableCell sx={{ py: 2 }} align="right">
                  {data.total_orders}
                </TableCell>
                <TableCell sx={{ py: 2 }} align="right">
                  <Typography fontWeight="bold">
                    ₹
                    {parseFloat(data.all_total_amount || 0).toLocaleString(
                      "en-US",
                      {
                        minimumFractionDigits: 2,
                      },
                    )}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
            {isFetching && (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  {
    /* Keeping old comp for reference */
  }

  // const ExpandableMonthTable = () => {
  //   const [expandedYear, setExpandedYear] = useState<boolean>(false);

  const ExpandableMonthTable = () => {
    const [expandedYear, setExpandedYear] = useState<boolean>(false);

    const toggleYear = () => {
      setExpandedYear(!expandedYear);
    };

    return (
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          boxShadow: "none",
          maxHeight: "600px",
          overflowY: "auto",
          backgroundColor: "#ffffff",
        }}
      >
        <Table stickyHeader size="small">
          {/* ================= YEAR HEADER ================= */}
          <TableHead>
            <TableRow sx={{ backgroundColor: "#ffffff" }}>
              <TableCell sx={{ py: 1, width: 48 }} />
              <TableCell sx={{ py: 1, fontSize: 13, fontWeight: 600 }}>
                YEAR
              </TableCell>
              <TableCell
                sx={{ py: 1, fontSize: 13, fontWeight: 600 }}
                align="right"
              >
                TOTAL BILLS
              </TableCell>
              <TableCell
                sx={{ py: 1, fontSize: 13, fontWeight: 600 }}
                align="right"
              >
                TOTAL AMOUNT
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {/* ================= YEAR ROW ================= */}
            <TableRow
              hover
              sx={{
                "& td": {
                  py: 0.75,
                  borderBottom: "1px solid #e5e7eb",
                },
              }}
            >
              <TableCell>
                <IconButton
                  size="small"
                  onClick={toggleYear}
                  sx={{ color: "#dc2626" }} // red arrow
                >
                  {expandedYear ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                </IconButton>
              </TableCell>

              <TableCell sx={{ fontWeight: 600 }}>{selectedYear}</TableCell>

              <TableCell align="right">{totalItems}</TableCell>

              <TableCell align="right">
                <Typography fontWeight={600}>
                  ₹
                  {totalAmount?.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </Typography>
              </TableCell>
            </TableRow>

            {/* ================= EXPANDED MONTH SECTION ================= */}
            {expandedYear && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  sx={{
                    p: 0,
                    backgroundColor: "#fafafa",
                    borderBottom: "1px solid #e5e7eb",
                    borderLeft: "3px solid #dc2626", // red accent
                  }}
                >
                  <Collapse in={expandedYear} timeout="auto" unmountOnExit>
                    <Box sx={{ px: 2, py: 1.25 }}>
                      <Table
                        size="small"
                        sx={{
                          width: "100%",
                          borderCollapse: "separate",
                          borderSpacing: 0,
                          border: "1px solid #e5e7eb",
                          backgroundColor: "#ffffff",
                        }}
                      >
                        {/* -------- Month Header -------- */}
                        <TableHead>
                          <TableRow
                            sx={{
                              backgroundColor: "#fff1f2", // light red tint
                              "& th": {
                                py: 0.75,
                                fontSize: 12.5,
                                fontWeight: 600,
                                borderBottom: "1px solid #e5e7eb",
                              },
                            }}
                          >
                            <TableCell>MONTH</TableCell>
                            <TableCell align="right">TOTAL BILLS</TableCell>
                            <TableCell align="right">TOTAL AMOUNT</TableCell>
                          </TableRow>
                        </TableHead>

                        {/* -------- Month Rows -------- */}
                        <TableBody>
                          {chartData.map((month: any) => (
                            <TableRow
                              key={month.month_number}
                              sx={{
                                "& td": {
                                  py: 0.7,
                                  fontSize: 12.5,
                                  borderBottom: "1px solid #e5e7eb",
                                },
                                "&:last-child td": {
                                  borderBottom: "none",
                                },
                              }}
                            >
                              <TableCell>{month.month}</TableCell>
                              <TableCell align="right">
                                {month.total_orders}
                              </TableCell>
                              <TableCell align="right">
                                ₹
                                {parseFloat(
                                  month.total_amount || 0,
                                ).toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                })}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            )}

            {/* ================= LOADER ================= */}
            {isFetching && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 2 }}>
                  <CircularProgress size={22} sx={{ color: "#dc2626" }} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // const ExpandableCategoryTable = () => {
  //   const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  //   const toggleRow = (categoryId: number) => {
  //     const newExpanded = new Set(expandedRows);
  //     if (newExpanded.has(categoryId)) {
  //       newExpanded.delete(categoryId);
  //     } else {
  //       newExpanded.add(categoryId);
  //     }
  //     setExpandedRows(newExpanded);
  //   };

  //   return (
  //     <TableContainer
  //       ref={categoryContainerRef}
  //       component={Paper}
  //       sx={{
  //         boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
  //         borderRadius: "8px",
  //         overflow: "hidden",
  //         maxHeight: "600px",
  //         overflowY: "auto",
  //       }}>
  //       <Table stickyHeader>
  //         <TableHead>
  //           <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
  //             <TableCell
  //               sx={{
  //                 py: 2,
  //                 fontWeight: 600,
  //                 fontSize: "14px",
  //                 width: "60px",
  //               }}></TableCell>
  //             <TableCell sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}>
  //               CATEGORY NAME
  //             </TableCell>
  //             <TableCell
  //               sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}
  //               align="right">
  //               TOTAL ITEMS
  //             </TableCell>
  //             <TableCell
  //               sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}
  //               align="right">
  //               TOTAL AMOUNT
  //             </TableCell>
  //           </TableRow>
  //         </TableHead>
  //         <TableBody>
  //           {categories.map((category) => (
  //             <React.Fragment key={category.category_id}>
  //               <TableRow
  //                 hover
  //                 sx={{ "&:last-child td": { borderBottom: 0 } }}>
  //                 <TableCell sx={{ py: 2 }}>
  //                   <IconButton
  //                     size="small"
  //                     onClick={() => toggleRow(category.category_id)}>
  //                     {expandedRows.has(category.category_id) ? (
  //                       <KeyboardArrowUp />
  //                     ) : (
  //                       <KeyboardArrowDown />
  //                     )}
  //                   </IconButton>
  //                 </TableCell>
  //                 <TableCell sx={{ py: 2, fontWeight: "bold" }}>
  //                   {category.category_name}
  //                 </TableCell>
  //                 <TableCell sx={{ py: 2 }} align="right">
  //                   {category.total_qty}
  //                 </TableCell>
  //                 <TableCell sx={{ py: 2 }} align="right">
  //                   <Typography fontWeight="bold">
  //                     ₹{category.total_amount.toLocaleString("en-IN", {
  //                       minimumFractionDigits: 2,
  //                     })}
  //                   </Typography>
  //                 </TableCell>
  //               </TableRow>
  //               {expandedRows.has(category.category_id) && (
  //                 <TableRow>
  //                   <TableCell
  //                     colSpan={4}
  //                     sx={{ py: 0, backgroundColor: "#fafafa" }}>
  //                     <Collapse
  //                       in={expandedRows.has(category.category_id)}
  //                       timeout="auto"
  //                       unmountOnExit>
  //                       <Box sx={{ py: 2, px: 4 }}>
  //                         <Table size="small">
  //                           <TableHead>
  //                             <TableRow>
  //                               <TableCell
  //                                 sx={{ fontWeight: 600, fontSize: "13px" }}>
  //                                 ITEM NAME
  //                               </TableCell>
  //                               <TableCell
  //                                 sx={{ fontWeight: 600, fontSize: "13px" }}
  //                                 align="right">
  //                                 TOTAL QTY
  //                               </TableCell>
  //                               <TableCell
  //                                 sx={{ fontWeight: 600, fontSize: "13px" }}
  //                                 align="right">
  //                                 TOTAL AMOUNT
  //                               </TableCell>
  //                             </TableRow>
  //                           </TableHead>
  //                           <TableBody>
  //                             {category.items.map((item) => (
  //                               <TableRow key={item.item_id}>
  //                                 <TableCell sx={{ py: 1 }}>
  //                                   {item.item_name}
  //                                 </TableCell>
  //                                 <TableCell sx={{ py: 1 }} align="right">
  //                                   {item.total_qty}
  //                                 </TableCell>
  //                                 <TableCell sx={{ py: 1 }} align="right">
  //                                   ₹{item.total_amount.toLocaleString("en-IN", {
  //                                     minimumFractionDigits: 2,
  //                                   })}
  //                                 </TableCell>
  //                               </TableRow>
  //                             ))}
  //                           </TableBody>
  //                         </Table>
  //                       </Box>
  //                     </Collapse>
  //                   </TableCell>
  //                 </TableRow>
  //               )}
  //             </React.Fragment>
  //           ))}
  //           {isCategoryLoading && (
  //             <TableRow>
  //               <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
  //                 <CircularProgress size={24} />
  //               </TableCell>
  //             </TableRow>
  //           )}
  //         </TableBody>
  //       </Table>
  //     </TableContainer>
  //   );
  // };

  const ExpandableCategoryTable = () => {
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    const toggleRow = (categoryId: number) => {
      const newExpanded = new Set(expandedRows);
      newExpanded.has(categoryId)
        ? newExpanded.delete(categoryId)
        : newExpanded.add(categoryId);
      setExpandedRows(newExpanded);
    };

    return (
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          boxShadow: "none",
          maxHeight: "600px",
          overflowY: "auto",
          backgroundColor: "#ffffff",
        }}
      >
        <Table stickyHeader size="small">
          {/* ================= HEADER ================= */}
          <TableHead>
            <TableRow sx={{ backgroundColor: "#ffffff" }}>
              <TableCell sx={{ py: 1, width: 48 }} />
              <TableCell sx={{ py: 1, fontSize: 13, fontWeight: 600 }}>
                CATEGORY NAME
              </TableCell>
              <TableCell
                sx={{ py: 1, fontSize: 13, fontWeight: 600 }}
                align="right"
              >
                TOTAL ITEMS
              </TableCell>
              <TableCell
                sx={{ py: 1, fontSize: 13, fontWeight: 600 }}
                align="right"
              >
                TOTAL AMOUNT
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {categories.map((category) => (
              <React.Fragment key={category.category_id}>
                {/* ================= CATEGORY ROW ================= */}
                <TableRow
                  hover
                  sx={{
                    "& td": {
                      py: 0.75,
                      borderBottom: "1px solid #e5e7eb",
                    },
                  }}
                >
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => toggleRow(category.category_id)}
                      sx={{ color: "#e11d48" }}
                    >
                      {expandedRows.has(category.category_id) ? (
                        <KeyboardArrowUp />
                      ) : (
                        <KeyboardArrowDown />
                      )}
                    </IconButton>
                  </TableCell>

                  <TableCell sx={{ fontWeight: 600 }}>
                    {category.category_name}
                  </TableCell>

                  <TableCell align="right">{category.total_qty}</TableCell>

                  <TableCell align="right">
                    <Typography fontWeight={600}>
                      ₹
                      {category.total_amount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </Typography>
                  </TableCell>
                </TableRow>

                {/* ================= EXPANDED ITEMS ================= */}
                {expandedRows.has(category.category_id) && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      sx={{
                        p: 0,
                        backgroundColor: "#fafafa",
                        borderBottom: "1px solid #e5e7eb",
                        borderLeft: "3px solid #e11d48", // red accent
                      }}
                    >
                      <Collapse
                        in={expandedRows.has(category.category_id)}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Box sx={{ px: 2, py: 1.25 }}>
                          <TableContainer
                            sx={{
                              maxHeight: 280,
                              overflow: "auto",
                              "&::-webkit-scrollbar": {
                                width: "6px", // scrollbar width
                                display: "block",
                              },
                              "&::-webkit-scrollbar-thumb": {
                                backgroundColor: "#aaa", // scrollbar color
                                borderRadius: "4px",
                              },
                              "&::-webkit-scrollbar-track": {
                                backgroundColor: "#f1f1f1", // track color
                              },
                            }}
                          >
                            <Table
                              stickyHeader
                              size="small"
                              sx={{
                                width: "100%",
                                borderCollapse: "separate",
                                borderSpacing: 0,
                                border: "1px solid #e5e7eb",
                                backgroundColor: "#ffffff",
                              }}
                            >
                              {/* -------- Item Header -------- */}
                              <TableHead>
                                <TableRow
                                  sx={{
                                    backgroundColor: "#cc404a", // very light red tint
                                    "& th": {
                                      py: 0.75,
                                      fontSize: 12.5,
                                      fontWeight: 600,
                                      borderBottom: "1px solid #e5e7eb",
                                    },
                                  }}
                                >
                                  <TableCell sx={{ width: 48 }} />
                                  <TableCell>ITEM NAME</TableCell>
                                  <TableCell align="right">TOTAL QTY</TableCell>
                                  <TableCell align="right">
                                    TOTAL AMOUNT
                                  </TableCell>
                                </TableRow>
                              </TableHead>

                              {/* -------- Item Rows -------- */}

                              <TableBody>
                                {category.items.map((item) => (
                                  <TableRow key={item.item_id}>
                                    {/* Spacer cell */}
                                    <TableCell />

                                    <TableCell>{item.item_name}</TableCell>

                                    <TableCell align="right">
                                      {item.total_qty}
                                    </TableCell>

                                    <TableCell align="right">
                                      ₹
                                      {item.total_amount.toLocaleString(
                                        "en-IN",
                                        {
                                          minimumFractionDigits: 2,
                                        },
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}

            {/* ================= LOADER ================= */}
            {isCategoryLoading && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 2 }}>
                  <CircularProgress size={22} sx={{ color: "#e11d48" }} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  const SummaryCardsMemo = React.memo(function SummaryCardsMemo({
    activeTab,
    paginationTotalRecords,
    totalAmount,
    totalItems,
    categoryTotalOrders,
    categoryTotalQty,
    categoryTotalAmount,
  }: {
    activeTab: string;
    paginationTotalRecords: number;
    totalAmount: number;
    totalItems: number;
    categoryTotalOrders: number;
    categoryTotalQty: number;
    categoryTotalAmount: number;
  }) {
    switch (activeTab) {
      case "all-orders":
      case "date-wise":
        return (
          <>
            <Grid spacing={0.5} size={{ xs: 12, sm: 6, md: 2 }}>
              <SummaryCard
                title="TOTAL ORDERS"
                value={paginationTotalRecords || 0}
              />
            </Grid>
            <Grid spacing={0.5} size={{ xs: 12, sm: 6, md: 2 }}>
              <SummaryCard
                title="TOTAL AMOUNT"
                value={totalAmount || 0}
                isCurrency
              />
            </Grid>
          </>
        );

      case "month/year-wise":
        return (
          <>
            <Grid spacing={0.5} size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard title="TOTAL BILLS" value={totalItems || 0} />
            </Grid>
            <Grid spacing={0.5} size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard
                title="TOTAL REVENUE"
                value={totalAmount || 0}
                isCurrency
              />
            </Grid>
          </>
        );

      case "category/item-wise":
        return (
          <>
            <Grid spacing={0.5} size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard
                title="TOTAL ORDERS"
                value={categoryTotalOrders || 0}
              />
            </Grid>
            <Grid spacing={0.5} size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard title="TOTAL QTY" value={categoryTotalQty || 0} />
            </Grid>
            <Grid spacing={0.5} size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard
                title="TOTAL AMOUNT"
                value={categoryTotalAmount || 0}
                isCurrency
              />
            </Grid>
          </>
        );

      default:
        return null;
    }
  });
  /* Check This */
  const summaryCards = (
    <SummaryCardsMemo
      activeTab={activeTab}
      paginationTotalRecords={summaryPagination.totalRecords || 0}
      totalAmount={summaryTotalAmount || 0}
      totalItems={summaryTotalItems || 0}
      categoryTotalOrders={categorySummarySinglePage?.totalOrders || 0}
      categoryTotalQty={categorySummarySinglePage?.totalQty || 0}
      categoryTotalAmount={categorySummarySinglePage?.totalAmount || 0}
    />
  );
  return (
    <Box>
      <PageHeader
        title="Order Report"
        subtitle="Review your sales performance and order trends."
      />

      <Grid container spacing={1} mb={2}>
        {summaryCards}
      </Grid>

      {(fromDate || toDate) && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button
            variant="outlined"
            size="medium"
            startIcon={<Clear />}
            onClick={handleClearFilters}
            sx={{
              textTransform: "none",
              borderRadius: 2,
            }}
          >
            Clear Filters
          </Button>
        </Box>
      )}

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <ReportFilterBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          searchText={searchText}
          onSearchChange={setSearchText}
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
          showDateFilter={
            activeTab === "all-orders" || activeTab === "date-wise"
          }
          showMonthYearFilter={activeTab === "month/year-wise"}
        />

        <TableContainer>
          {activeTab === "all-orders" && renderAllOrdersTable()}
          {activeTab === "date-wise" && renderDateWiseTable()}
          {activeTab === "month/year-wise" && <ExpandableMonthTable />}
          {activeTab === "category/item-wise" && <ExpandableCategoryTable />}
        </TableContainer>
      </Paper>

      <OrderDetailsModal
        open={isOrderModalOpen}
        onClose={closeOrderModal}
        order={selectedOrder}
      />
    </Box>
  );
};

export default OrderReport;
