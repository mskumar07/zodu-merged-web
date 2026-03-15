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
  Skeleton,
  Pagination,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ExpenseModal from "@components/ExpensesTable/ExpenseModal";
import { useInfiniteScroll } from "../hook/useInfiniteScroll";

interface ExpensesDataTableProps {
  expenses: any[];
  totalCount: number;
  // currentPage: number;
  // pageSize: number;
  // onPageChange: (event: any, page: number) => void;
  isLoading?: boolean;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
}

const ExpensesDataTable: React.FC<ExpensesDataTableProps> = ({
  expenses,
  totalCount,
  hasNextPage = false,
  fetchNextPage = () => {},
  isFetchingNextPage = false,
  isLoading = false,
}) => {
  console.log("isFetchingNextPage:", isFetchingNextPage);
  const [orderBy, setOrderBy] = useState<string>("expense_date");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useInfiniteScroll(
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    tableContainerRef
  );

  const handleSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleOpenExpense = (expense: any) => {
    setSelectedExpense(expense);
  };

  const handleClose = () => {
    setSelectedExpense(null);
  };

  const sortedExpenses = [...(expenses || [])].sort((a: any, b: any) => {
    if (orderBy === "expense_date") {
      const dateA = new Date(a.updated_at || 0).getTime();
      const dateB = new Date(b.updated_at || 0).getTime();
      return order === "asc" ? dateA - dateB : dateB - dateA;
    }
    if (orderBy === "total_amount") {
      return order === "asc"
        ? (a.total_amount || 0) - (b.total_amount || 0)
        : (b.total_amount || 0) - (a.total_amount || 0);
    }
    return 0;
  });

  const hasExpenses = sortedExpenses.length > 0;
  // const totalPages = Math.ceil(totalCount / pageSize);

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "No Date";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";

    const day = date.toLocaleDateString("en-IN", { day: "2-digit" });
    const month = date.toLocaleDateString("en-IN", { month: "short" });
    const year = date.getFullYear();
    const time = date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const weekday = date.toLocaleDateString("en-IN", { weekday: "short" });

    return `${day} ${month} ${year}, ${time} (${weekday})`;
  };

  return (
    <>
      <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6" fontWeight="bold">
              Expenses
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
                      active={orderBy === "expense_date"}
                      direction={orderBy === "expense_date" ? order : "desc"}
                      onClick={() => handleSort("expense_date")}
                    >
                      <strong>Date</strong>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <strong>Expense ID</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Expense Name</strong>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={orderBy === "total_amount"}
                      direction={orderBy === "total_amount" ? order : "desc"}
                      onClick={() => handleSort("total_amount")}
                    >
                      <strong>Total</strong>
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
                      <TableCell>
                        <Skeleton variant="text" />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : hasExpenses ? (
                  sortedExpenses.map((expense: any, index: number) => (
                    <TableRow
                      key={`${expense.expense_id}-${index}`}
                      hover
                      sx={{ "&:hover": { backgroundColor: "action.hover" } }}
                    >
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDateTime(expense.updated_at)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight="medium"
                          sx={{
                            cursor: "pointer",
                            color: "#007ddcff",
                            "&:hover": { textDecoration: "underline" },
                          }}
                          onClick={() => handleOpenExpense(expense)}
                        >
                          #{expense.expense_id}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography fontWeight={600}>
                          {expense.category_name || "Unknown"}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography fontWeight="bold">
                          ₹{" "}
                          {(Number(expense.total_amount) || 0).toLocaleString(
                            "en-IN",
                          )}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      <Typography color="text.secondary">
                        No expenses found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {hasNextPage && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <div ref={loadMoreRef} style={{ height: 20 }} />
                      {isFetchingNextPage && "Loading more..."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* <Box display="flex" flexDirection="column" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {hasExpenses ? `` : "No expenses to display"}
            </Typography>
          </Box> */}
        </CardContent>
      </Card>

      <ExpenseModal
        open={Boolean(selectedExpense)}
        onClose={handleClose}
        home={true}
        data={selectedExpense || undefined}
      />
    </>
  );
};

export default ExpensesDataTable;
