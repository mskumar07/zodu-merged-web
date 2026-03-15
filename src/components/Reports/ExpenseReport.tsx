import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
  Typography,
  Button,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp, Clear } from "@mui/icons-material";
import { PageHeader } from "./reportHeader";
import { SummaryCard } from "./SummaryCards";
import useExpensesReport from "@hooks/queryHooks/reports/useExpensesReport";
import type { ExpenseReportParams } from "@/types/report";
import { ReportFilterBar } from "./utils/ReportFilterBar";
import { params_ids } from "@utils/paramId";
import ExpenseModal from "@components/ExpensesTable/ExpenseModal";
import type { ExpenseItem } from "@types/report";

const ExpenseReport: React.FC = () => {
  const [activeTab, setActiveTab] = useState("all-expenses");
  const [searchText, setSearchText] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedYear, setSelectedYear] = useState();
  const [page, setPage] = useState(1);
  const [selectedExpense, setSelectedExpense] =
    useState<ExpenseItem | null>(null);
  const [open, setOpen] = useState(false);
  const allExpensesContainerRef = React.useRef<HTMLDivElement>(null);
  const dateWiseContainerRef = React.useRef<HTMLDivElement>(null);
  const monthWiseContainerRef = React.useRef<HTMLDivElement>(null);

  const tabs = ["All Expenses", "Date Wise", "Month/Year Wise"];

  useEffect(() => {
    setPage(1);
  }, [activeTab, fromDate, toDate, selectedYear, searchText]);

  const getFilterType = () => {
    if (activeTab === "all-expenses") return "all_purchase";
    if (activeTab === "date-wise") return "date_wise";
    if (activeTab === "month/year-wise") return "month_year_wise";
    return "all_purchase";
  };

  const buildParams = (): ExpenseReportParams => {
    const baseParams: ExpenseReportParams = {
      zodu_id: params_ids.zudoId,
      branch_id: params_ids.branch.branch_1,
      filterType: getFilterType(),
      page,
      limit: 10,
      search: searchText || undefined,
    };

    if (fromDate && toDate) {
      baseParams.start_date = fromDate;
      baseParams.end_date = toDate;
    }

    if (activeTab === "month/year-wise") {
      baseParams.year = selectedYear;
    }

    return baseParams;
  };

  const params = buildParams();

  const {
    list,
    dateWiseData,
    yearData,
    totalAmount,
    totalBills,
    totalPaid,
    totalUnpaid,
    totalItems,
    pagination,
    isLoading,
    isFetching,
  } = useExpensesReport({ params });

  const handleLoadMore = () => {
    if (!isLoading && !isFetching && page < pagination.totalPages) {
      setPage(prev => prev + 1);
    }
  };

  const handleClearFilters = () => {
    setSearchText("");
    setFromDate("");
    setToDate("");
    setSelectedYear(undefined);
  };

    const handleClose = () => setSelectedExpense(null);

  useEffect(() => {
    const container = allExpensesContainerRef.current;
    if (!container || activeTab !== "all-expenses") return;

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

  const renderAllExpensesTable = () => {
    return (
      <TableContainer
        ref={allExpensesContainerRef}
        component={Paper}
        sx={{
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
          overflow: "hidden",
          maxHeight: "600px",
          overflowY: "auto",
        }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}>
                DATE
              </TableCell>
              <TableCell sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}>
                EXPENSE ID
              </TableCell>
              <TableCell sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}>
                CATEGORY NAME
              </TableCell>
              <TableCell
                sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}
                align="right">
                TOTAL AMOUNT
              </TableCell>
              <TableCell
                sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}
                align="right">
                PAID AMOUNT
              </TableCell>
              <TableCell
                sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}
                align="right">
                DUE AMOUNT
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map((expense) => (
              <TableRow
                key={expense.expense_id}
                hover
                sx={{ "&:last-child td": { borderBottom: 0 } }}>
                <TableCell sx={{ py: 2 }}>{expense.expense_date}</TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Typography
                    color="info"
                    sx={{
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setSelectedExpense(expense);
                      setOpen(true);
                    }}
                    >
                    {expense.expense_id}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  {expense.category_name}
                </TableCell>
                <TableCell sx={{ py: 2 }} align="right">
                  <Typography fontWeight="bold">
                    ₹{Number(expense.total_amount).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2 }} align="right">
                  ₹{Number(expense.paid_amount).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell sx={{ py: 2 }} align="right">
                  <Typography
                    color={Number(expense.due_amount) > 0 ? "error" : "success.main"}>
                    ₹{Number(expense.due_amount).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
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
        }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}>
                DATE
              </TableCell>
              <TableCell
                sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}
                align="right">
                TOTAL EXPENSE
              </TableCell>
              <TableCell
                sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}
                align="right">
                TOTAL AMOUNT
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dateWiseData.map((data, index) => (
              <TableRow
                key={index}
                hover
                sx={{ "&:last-child td": { borderBottom: 0 } }}>
                <TableCell sx={{ py: 2 }}>{data.created_at}</TableCell>
                <TableCell sx={{ py: 2 }} align="right">
                  {data.total_expense} 
                </TableCell>
                <TableCell sx={{ py: 2 }} align="right">
                  <Typography fontWeight="bold">
                    ₹{Number(data.all_total_amount).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
            {isLoading && (
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

  const ExpandableMonthTable = () => {
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    const toggleRow = (year: number) => {
      const newExpanded = new Set(expandedRows);
      if (newExpanded.has(year)) {
        newExpanded.delete(year);
      } else {
        newExpanded.add(year);
      }
      setExpandedRows(newExpanded);
    };

    return (
      <TableContainer
        ref={monthWiseContainerRef}
        component={Paper}
        sx={{
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
          overflow: "hidden",
          maxHeight: "600px",
          overflowY: "auto",
        }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell
                sx={{
                  py: 2,
                  fontWeight: 600,
                  fontSize: "14px",
                  width: "60px",
                }}></TableCell>
              <TableCell sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}>
                YEAR
              </TableCell>
              <TableCell
                sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}
                align="right">
                TOTAL EXPENSES
              </TableCell>
              <TableCell
                sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}
                align="right">
                TOTAL AMOUNT
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {yearData.map((yearItem) => (
              <React.Fragment key={yearItem.year}>
                <TableRow
                  hover
                  sx={{ "&:last-child td": { borderBottom: 0 } }}>
                  <TableCell sx={{ py: 2 }}>
                    <IconButton
                      size="small"
                      onClick={() => toggleRow(yearItem.year)}>
                      {expandedRows.has(yearItem.year) ? (
                        <KeyboardArrowUp />
                      ) : (
                        <KeyboardArrowDown />
                      )}
                    </IconButton>
                  </TableCell>
                  <TableCell sx={{ py: 2, fontWeight: "bold" }}>
                    {yearItem.year}
                  </TableCell>
                  <TableCell sx={{ py: 2 }} align="right">
                    {yearItem.total_bills} 
                  </TableCell>
                  <TableCell sx={{ py: 2 }} align="right">
                    <Typography fontWeight="bold">
                      ₹{yearItem.total_amount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </Typography>
                  </TableCell>
                </TableRow>
                {expandedRows.has(yearItem.year) && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      sx={{ py: 0, backgroundColor: "#fafafa" }}>
                      <Collapse
                        in={expandedRows.has(yearItem.year)}
                        timeout="auto"
                        unmountOnExit>
                        <Box sx={{ py: 2, px: 4 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell
                                  sx={{ fontWeight: 600, fontSize: "13px" }}>
                                  MONTH
                                </TableCell>
                                <TableCell
                                  sx={{ fontWeight: 600, fontSize: "13px" }}
                                  align="right">
                                  TOTAL BILLS
                                </TableCell>
                                <TableCell
                                  sx={{ fontWeight: 600, fontSize: "13px" }}
                                  align="right">
                                  TOTAL AMOUNT
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {yearItem.months.map((month) => (
                                <TableRow key={month.month_number}>
                                  <TableCell sx={{ py: 1 }}>
                                    {month.month}
                                  </TableCell>
                                  <TableCell sx={{ py: 1 }} align="right">
                                    {month.total_bills} 
                                  </TableCell>
                                  <TableCell sx={{ py: 1 }} align="right">
                                    ₹{month.total_amount.toLocaleString("en-IN", {
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
              </React.Fragment>
            ))}
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box>
      <PageHeader
        title="Expense Report"
        subtitle="Track operational costs including utilities, rent, and miscellaneous overheads."
      />

      <Grid container spacing={1} mb={3}>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <SummaryCard title="TOTAL BILLS" value={totalBills} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <SummaryCard title="TOTAL AMOUNT" value={totalAmount} isCurrency />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <SummaryCard title="TOTAL PAID" value={totalPaid} isCurrency />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <SummaryCard title="TOTAL UNPAID" value={totalUnpaid} isCurrency />
        </Grid>
      </Grid>

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

      <Paper elevation={3} sx={{ borderRadius: 2 }}>
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
          selectedMonth=""
          selectedYear={selectedYear}
          onMonthChange={() => {}}
          onYearChange={setSelectedYear}
          showDateFilter={activeTab === "all-expenses" || activeTab === "date-wise"}
          showMonthYearFilter={activeTab === "month/year-wise"}
        />

        {activeTab === "all-expenses" && renderAllExpensesTable()}
        {activeTab === "date-wise" && renderDateWiseTable()}
        {activeTab === "month/year-wise" && <ExpandableMonthTable />}
      </Paper>
          <ExpenseModal
              open={!!selectedExpense}
              onClose={handleClose}
              // onEdit={handleEdit}
              // onDelete={() => setShowDeleteModal(true)}
              data={selectedExpense || undefined}
            />
    </Box>
  );
};

export default ExpenseReport;
