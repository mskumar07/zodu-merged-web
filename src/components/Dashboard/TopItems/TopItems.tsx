import React, { useRef, useState } from "react";
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
  IconButton,
  Skeleton,
  Pagination,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useInfiniteScroll } from "../hook/useInfiniteScroll";

interface TopItemsProps {
  items: any[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (event: any, page: number) => void;
  isLoading?: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
}

const TopItems: React.FC<TopItemsProps> = ({
  items,
  totalCount,
  currentPage,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  pageSize,
  onPageChange,
  isLoading = false,
}) => {
  const [orderBy, setOrderBy] = useState<string>("total_amount");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  const handleSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useInfiniteScroll(
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    tableContainerRef,
  );

  const sortedItems = [...(items || [])].sort((a: any, b: any) => {
    if (orderBy === "total_amount") {
      const priceA = a.total_amount || 0;
      const priceB = b.total_amount || 0;
      return order === "asc" ? priceA - priceB : priceB - priceA;
    }
    if (orderBy === "total_qty") {
      const qtyA = a.total_qty || 0;
      const qtyB = b.total_qty || 0;
      return order === "asc" ? qtyA - qtyB : qtyB - qtyA;
    }
    if (orderBy === "menu_name") {
      return order === "asc"
        ? (a.menu_name || "").localeCompare(b.menu_name || "")
        : (b.menu_name || "").localeCompare(a.menu_name || "");
    }
    return 0;
  });

  const hasItems = sortedItems.length > 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  console.log(items, "TopItems received");

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6" fontWeight="bold">
            Top Items
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">
              {totalCount} items
            </Typography>
            <IconButton size="small">
              <FilterListIcon />
            </IconButton>
          </Box>
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
                    active={orderBy === "menu_name"}
                    direction={orderBy === "menu_name" ? order : "asc"}
                    onClick={() => handleSort("menu_name")}
                    IconComponent={
                      order === "asc" ? ArrowUpwardIcon : ArrowDownwardIcon
                    }
                  >
                    <strong>Item Name</strong>
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === "total_amount"}
                    direction={orderBy === "total_amount" ? order : "desc"}
                    onClick={() => handleSort("total_amount")}
                    IconComponent={
                      order === "asc" ? ArrowUpwardIcon : ArrowDownwardIcon
                    }
                  >
                    <strong>Total Amount</strong>
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === "total_qty"}
                    direction={orderBy === "total_qty" ? order : "desc"}
                    onClick={() => handleSort("total_qty")}
                    IconComponent={
                      order === "asc" ? ArrowUpwardIcon : ArrowDownwardIcon
                    }
                  >
                    <strong>Quantity</strong>
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell>
                      <Skeleton variant="text" />
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton variant="text" />
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton variant="text" />
                    </TableCell>
                  </TableRow>
                ))
              ) : hasItems ? (
                sortedItems.map((item: any, index: number) => (
                  <TableRow key={`${index}-${item.menu_name}`} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {item.menu_name || "Unnamed Item"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold">
                        ₹ {item.total_amount || 0}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography>{item.total_qty || 0}</Typography>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">
                      No items found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {hasNextPage && (
                <TableRow>
                  <TableCell colSpan={3}>
                    <div ref={loadMoreRef} style={{ height: 20 }} />
                    {isFetchingNextPage && "Loading more..."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default TopItems;
