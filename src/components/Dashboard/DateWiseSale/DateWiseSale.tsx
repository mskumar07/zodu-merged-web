import React, { useState } from "react";
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

interface DatewiseSalesProps {
  data: any[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (event: any, page: number) => void;
  isLoading?: boolean;
}

const DatewiseSales: React.FC<DatewiseSalesProps> = ({
  data,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  isLoading = false,
}) => {

  const [orderBy, setOrderBy] = useState<string>("date");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  const handleSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };


  const sortedSales = [...(data || [])].sort(
    (a: any, b: any) => {
      if (orderBy === "date") {
        const dateA = new Date(a.date || 0).getTime();
        const dateB = new Date(b.date || 0).getTime();
        return order === "asc" ? dateA - dateB : dateB - dateA;
      }
      if (orderBy === "amount") {
        return order === "asc"
          ? (a.amount || 0) - (b.amount || 0)
          : (b.amount || 0) - (a.amount || 0);
      }
      if (orderBy === "bills") {
        return order === "asc"
          ? (a.bills || 0) - (b.bills || 0)
          : (b.bills || 0) - (a.bills || 0);
      }
      return 0;
    }
  );

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "No Date";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return dateString || "Invalid Date";
    }
  };

  const hasSales = sortedSales.length > 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <Card sx={{ display: "flex", height: "100%", flexDirection: "column" }}>
      <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold">
            Datewise Sale
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">
              {totalCount} days
            </Typography>
            <IconButton size="small">
              <FilterListIcon />
            </IconButton>
          </Box>
        </Box>

        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ maxHeight: 400, overflow: "auto", flex: 1 }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "date"}
                    direction={orderBy === "date" ? order : "desc"}
                    onClick={() => handleSort("date")}
                    IconComponent={order === "asc" ? ArrowUpwardIcon : ArrowDownwardIcon}
                  >
                    <strong>Date</strong>
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === "amount"}
                    direction={orderBy === "amount" ? order : "desc"}
                    onClick={() => handleSort("amount")}
                    IconComponent={order === "asc" ? ArrowUpwardIcon : ArrowDownwardIcon}
                  >
                    <strong>Total Amount</strong>
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
                  </TableRow>
                ))
              ) : hasSales ? (
                sortedSales.map((sale: any, index: number) => (
                  <TableRow key={`${sale.formatted_date}-${index}`} hover>
                    <TableCell>
                      <Typography variant="body2">{sale.formatted_date}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold">
                        ₹ {(sale.total_amount || 0).toLocaleString("en-IN")}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">No sales data available</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* {hasSales && (
          <Box mt={2} display="flex" flexDirection="column" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">
              Showing {sortedSales.length} of {totalCount} days
            </Typography>
            {totalPages > 1 && (
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={onPageChange}
                color="primary"
                size="small"
              />
            )}
          </Box>
        )} */}
      </CardContent>
    </Card>
  );
};

export default DatewiseSales;
