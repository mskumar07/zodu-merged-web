import React, { useState, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  TableSortLabel,
  Skeleton,
  Pagination,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import OrderDetailsModal from "./OrderDetailsModal";
import { useOrderDetailsQuery } from "@hooks/dashboard";
import { useInfiniteScroll } from "../hook/useInfiniteScroll";

interface Order {
  order_id: string;
  order_date: string;
  formatted_date?: string;
  order_type: string;
  total_amt: number;
  no_of_items: number;
  status?: string;
  customer_name?: string;
  [key: string]: any;
}

interface RecentOrdersProps {
  orders: Order[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (event: any, page: number) => void;
  isLoading?: boolean;
  selectedBranch: string;
  hasNextPage: boolean;
  fetchNextPage: any;
  isFetchingNextPage: boolean;
}

const RecentOrders: React.FC<RecentOrdersProps> = ({
  orders,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  isLoading = false,
  selectedBranch,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  console.log(
    "hasNextPage",
    hasNextPage,
    "isFetchingNextPage",
    isFetchingNextPage,
    "fetchNextPage",
    fetchNextPage,
  );
  // const loadMoreRef = useInfiniteScroll(
  //   hasNextPage,
  //   fetchNextPage,
  //   isFetchingNextPage,
  // );
  const tableContainerRef = useRef<HTMLDivElement | null>(null);

const loadMoreRef = useInfiniteScroll(
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  tableContainerRef
);
  console.log("loadMoreRef", loadMoreRef);

  const { data: selectedOrder } = useOrderDetailsQuery({
    branchId: selectedId || selectedBranch,
    orderId: selectedOrderId || "",
    enabled: !!selectedOrderId && isOrderModalOpen,
  });

  console.log("📋 RecentOrders received:", {
    orders,
    totalCount,
    isLoading,
    orders_count: orders.length,
  });

  const openOrderModal = useCallback((order: Order) => {
    console.log(order);
    setSelectedOrderId(order.api_order_id);
    setSelectedId(order.branch_id);
    setIsOrderModalOpen(true);
  }, []);

  const closeOrderModal = useCallback(() => {
    setIsOrderModalOpen(false);
    setSelectedId(null);
    setSelectedOrderId(null);
  }, []);

  const [orderBy, setOrderBy] = React.useState<string>("order_date");
  const [order, setOrder] = React.useState<"asc" | "desc">("desc");

  const handleSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedOrders = [...(orders || [])].sort((a: Order, b: Order) => {
    if (orderBy === "order_date" || orderBy === "formatted_date") {
      const dateA = new Date(a.order_date || a.formatted_date || 0).getTime();
      const dateB = new Date(b.order_date || b.formatted_date || 0).getTime();
      return order === "asc" ? dateA - dateB : dateB - dateA;
    }
    if (orderBy === "total_amt") {
      return order === "asc"
        ? (a.total_amt || 0) - (b.total_amt || 0)
        : (b.total_amt || 0) - (a.total_amt || 0);
    }
    if (orderBy === "no_of_items") {
      return order === "asc"
        ? (a.no_of_items || 0) - (b.no_of_items || 0)
        : (b.no_of_items || 0) - (a.no_of_items || 0);
    }
    if (orderBy === "order_id") {
      return order === "asc"
        ? (a.order_id || "").localeCompare(b.order_id || "")
        : (b.order_id || "").localeCompare(a.order_id || "");
    }
    return 0;
  });

  const hasOrders = sortedOrders.length > 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <>
      <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography variant="h6" fontWeight="bold">
              Recent Orders
            </Typography>
          </Box>

          <TableContainer
            ref={tableContainerRef}
            component={Paper}
            variant="outlined"
            sx={{ maxHeight: 400, overflow: "auto", flex: 1 }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "order_date"}
                      direction={order}
                      onClick={() => handleSort("order_date")}
                      IconComponent={
                        order === "asc" ? ArrowUpwardIcon : ArrowDownwardIcon
                      }
                    >
                      <strong>Date</strong>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "order_id"}
                      direction={order}
                      onClick={() => handleSort("order_id")}
                      IconComponent={
                        order === "asc" ? ArrowUpwardIcon : ArrowDownwardIcon
                      }
                    >
                      <strong>Order ID</strong>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={orderBy === "total_amt"}
                      direction={order}
                      onClick={() => handleSort("total_amt")}
                      IconComponent={
                        order === "asc" ? ArrowUpwardIcon : ArrowDownwardIcon
                      }
                    >
                      <strong>Amount</strong>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center">
                    <TableSortLabel
                      active={orderBy === "no_of_items"}
                      direction={order}
                      onClick={() => handleSort("no_of_items")}
                      IconComponent={
                        order === "asc" ? ArrowUpwardIcon : ArrowDownwardIcon
                      }
                    >
                      <strong>Items</strong>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <strong>Type</strong>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <TableCell key={i}>
                          <Skeleton />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : hasOrders ? (
                  sortedOrders.map((order: Order, index: number) => (
                    <TableRow key={`${order.order_id}-${index}`} hover>
                      <TableCell>
                        {order.formatted_date || order.order_date}
                      </TableCell>
                      <TableCell
                        sx={{ cursor: "pointer", color: "#007ddc" }}
                        onClick={() => openOrderModal(order)}
                      >
                        #{order.public_order_no}
                      </TableCell>
                      <TableCell align="right">
                        ₹ {(order.total_amt || 0).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell align="center">
                        {order.no_of_items || 0}
                      </TableCell>
                      <TableCell>{order.order_type}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No orders found
                    </TableCell>
                  </TableRow>
                )}
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  gap={1}
                >
                  {hasNextPage && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <div ref={loadMoreRef} style={{ height: 20 }} />
                        {isFetchingNextPage && "Loading more..."}
                      </TableCell>
                    </TableRow>
                  )}
                </Box>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <OrderDetailsModal
        open={isOrderModalOpen}
        onClose={closeOrderModal}
        order={selectedOrder}
      />
    </>
  );
};

export default RecentOrders;
