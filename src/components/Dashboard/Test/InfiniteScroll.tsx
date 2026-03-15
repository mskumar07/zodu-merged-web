// components/dashboard/TestInfiniteScroll.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Button,
  CircularProgress,
  Chip,
  TextField,
  Alert,
} from "@mui/material";
import { dashboardApi } from "@Services/DashBoardServices";

const TestInfiniteScroll: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // Small limit to test pagination
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const scrollCountRef = useRef(0);

  const fetchOrders = useCallback(
    async (pageNum: number, isInitial = false) => {
      try {
        if (isInitial) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }
        setError(null);

        // Simulate API call with pagination
        const response = await dashboardApi.getDashboardData(
          "ZODU035",
          "ZODU035B1",
          {
            ordersPage: pageNum,
            ordersLimit: limit,
          }
        );

        const data = response.data || response;
        const newOrders = data.orders || [];

        console.log(`📥 Page ${pageNum} Response:`, {
          page: pageNum,
          limit: limit,
          received: newOrders.length,
          total: data.orders_total_count || "N/A",
          hasMore: newOrders.length === limit,
        });

        if (isInitial) {
          setOrders(newOrders);
        } else {
          setOrders((prev) => [...prev, ...newOrders]);
        }

        // Check if we have more data
        const total = parseInt(data.orders_total_count || "0");
        setTotalCount(total);

        if (total > 0) {
          const currentTotal = (pageNum - 1) * limit + newOrders.length;
          setHasMore(currentTotal < total);
        } else {
          setHasMore(newOrders.length === limit);
        }

        scrollCountRef.current++;
        console.log(
          `🔄 Scroll event triggered ${scrollCountRef.current} times`
        );
      } catch (err: any) {
        console.error("Error fetching orders:", err);
        setError(err.message || "Failed to load orders");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [limit]
  );

  // Initial load
  useEffect(() => {
    setPage(1);
    fetchOrders(1, true);
  }, [fetchOrders]);

  // Handle scroll for infinite loading
  const handleScroll = useCallback(() => {
    if (!tableContainerRef.current || isLoadingMore || !hasMore || isLoading) {
      return;
    }

    const container = tableContainerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;

    console.log("📜 Scroll Info:", {
      scrollTop,
      scrollHeight,
      clientHeight,
      scrollPercentage:
        (((scrollTop + clientHeight) / scrollHeight) * 100).toFixed(2) + "%",
      hasMore,
      isLoadingMore,
      currentPage: page,
      totalOrders: orders.length,
    });

    // Load more when user scrolls to 80% of the container
    const scrollThreshold = 0.8; // 80%
    if (scrollTop + clientHeight >= scrollHeight * scrollThreshold) {
      console.log("🚀 Loading more data...");
      const nextPage = page + 1;
      setPage(nextPage);
      fetchOrders(nextPage, false);
    }
  }, [isLoadingMore, hasMore, isLoading, page, orders.length, fetchOrders]);

  // Attach scroll event listener
  useEffect(() => {
    const container = tableContainerRef.current;
    if (container) {
      console.log("🎯 Scroll listener attached");
      container.addEventListener("scroll", handleScroll);
      return () => {
        console.log("🎯 Scroll listener removed");
        container.removeEventListener("scroll", handleScroll);
      };
    }
  }, [handleScroll]);

  const manualLoadMore = () => {
    if (hasMore && !isLoadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchOrders(nextPage, false);
    }
  };

  const resetData = () => {
    setPage(1);
    setOrders([]);
    setHasMore(true);
    scrollCountRef.current = 0;
    fetchOrders(1, true);
  };

  return (
    <Card sx={{ mt: 3, p: 2 }}>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}>
          <Typography variant="h5" fontWeight="bold">
            🔍 Infinite Scroll Test
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              size="small"
              onClick={resetData}
              disabled={isLoading}>
              Reset Data
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={manualLoadMore}
              disabled={!hasMore || isLoadingMore}>
              Manual Load More
            </Button>
          </Box>
        </Box>

        <Box mb={3} p={2} bgcolor="#f5f5f5" borderRadius={1}>
          <Typography variant="subtitle2" fontWeight="bold" mb={1}>
            📊 Debug Information:
          </Typography>
          <Box display="flex" gap={3}>
            <Chip label={`Page: ${page}`} color="primary" size="small" />
            <Chip
              label={`Orders: ${orders.length}/${totalCount || "N/A"}`}
              color="secondary"
              size="small"
            />
            <Chip
              label={`Has More: ${hasMore ? "Yes" : "No"}`}
              color={hasMore ? "success" : "default"}
              size="small"
            />
            <Chip
              label={`Loading: ${
                isLoadingMore ? "More" : isLoading ? "Initial" : "No"
              }`}
              color={isLoading || isLoadingMore ? "warning" : "default"}
              size="small"
            />
            <Chip
              label={`Scroll Events: ${scrollCountRef.current}`}
              color="info"
              size="small"
            />
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary" mb={2}>
          ℹ️ Scroll down to 80% of the table to trigger infinite scroll. Check
          console for detailed logs.
        </Typography>

        <TableContainer
          ref={tableContainerRef}
          component={Paper}
          variant="outlined"
          sx={{
            maxHeight: 400,
            minHeight: 300,
            overflow: "auto",
            border: "2px dashed #ccc",
            position: "relative",
          }}>
          {/* Scroll indicator */}
          <Box
            sx={{
              position: "absolute",
              top: "80%",
              left: 0,
              right: 0,
              height: "2px",
              backgroundColor: "red",
              zIndex: 1000,
            }}
          />

          <Typography
            variant="caption"
            sx={{
              position: "absolute",
              top: "80%",
              right: 10,
              backgroundColor: "red",
              color: "white",
              padding: "2px 6px",
              borderRadius: 1,
              fontSize: "10px",
              zIndex: 1001,
            }}>
            🔴 Scroll to here (80%) to load more
          </Typography>

          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>#</strong>
                </TableCell>
                <TableCell>
                  <strong>Order ID</strong>
                </TableCell>
                <TableCell>
                  <strong>Type</strong>
                </TableCell>
                <TableCell>
                  <strong>Amount</strong>
                </TableCell>
                <TableCell>
                  <strong>Items</strong>
                </TableCell>
                <TableCell>
                  <strong>Date</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      Loading initial data...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : orders.length > 0 ? (
                <>
                  {orders.map((order, index) => (
                    <TableRow key={`${order.order_id}-${index}`} hover>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {index + 1}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          #{order.order_id || `ORDER-${index}`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.order_type || "Dine-in"}
                          size="small"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="bold">
                          ₹ {(order.total_amt || 1000).toLocaleString("en-IN")}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography>{order.no_of_items || 3} items</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {order.order_date || new Date().toLocaleDateString()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Loading more indicator */}
                  {isLoadingMore && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 2 }}>
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          gap={2}>
                          <CircularProgress size={20} />
                          <Typography variant="body2" color="text.secondary">
                            Loading more orders (Page {page + 1})...
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}

                  {/* End of data indicator */}
                  {!hasMore && orders.length > 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        align="center"
                        sx={{ py: 2, bgcolor: "#f0f0f0" }}>
                        <Typography variant="body2" color="text.secondary">
                          🎉 All {orders.length} orders loaded!
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No orders found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Manual controls */}
        <Box mt={3} p={2} border={1} borderColor="divider" borderRadius={1}>
          <Typography variant="subtitle2" fontWeight="bold" mb={1}>
            🎮 Manual Controls:
          </Typography>
          <Box display="flex" gap={2} alignItems="center">
            <Button
              variant="outlined"
              size="small"
              onClick={() =>
                console.log("Current state:", {
                  orders,
                  page,
                  hasMore,
                  isLoading,
                  isLoadingMore,
                  scrollCount: scrollCountRef.current,
                })
              }>
              Log State
            </Button>

            <TextField
              size="small"
              label="Custom Limit"
              type="number"
              value={limit}
              disabled
              sx={{ width: 120 }}
            />

            <Typography variant="caption" color="text.secondary">
              Each page loads {limit} items
            </Typography>
          </Box>
        </Box>

        {/* Debug Console Panel */}
        <Box
          mt={3}
          p={2}
          bgcolor="#000"
          color="#0f0"
          borderRadius={1}
          fontFamily="monospace">
          <Typography
            variant="caption"
            fontWeight="bold"
            display="block"
            mb={1}>
            🖥️ Debug Console:
          </Typography>
          <Box sx={{ fontSize: "12px", maxHeight: "100px", overflowY: "auto" }}>
            <div>🔄 Scroll events: {scrollCountRef.current}</div>
            <div>📄 Current page: {page}</div>
            <div>📊 Total loaded: {orders.length} orders</div>
            <div>🎯 Has more data: {hasMore ? "YES" : "NO"}</div>
            <div>
              ⏳ Loading:{" "}
              {isLoading ? "Initial" : isLoadingMore ? "More" : "No"}
            </div>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TestInfiniteScroll;
