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
import usePurchaseReport from "@hooks/queryHooks/reports/usePurchaseReport";
import type { PurchaseReportParams } from "@/types/report";
import { ReportFilterBar } from "./utils/ReportFilterBar";
import { params_ids } from "@utils/paramId";
import PurchaseModal from "@components/PurchaseTable/PurchaseModal";
import { useGetPurchaseByIdQuery } from "@store/services/menuApi";


interface RawPurchase {
  purchase_id: string;
  branch_id: string;
  vendor_id: string;
  purchase_date: string;
  purchase_type: "Product" | "Other";
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  payment_id: string;
  notes: string;
  attachment_url: Array<{
    url: string;
    type?: string;
    fileName?: string;
    id?: string;
  }>;
  created_at: string;
  updated_at: string;
  vendor_name: string;
  company_name: string;
  vendor_phone: string;
  vendor_email: string;
  company_name: string;
  items: Array<{
    item_id: string;
    item_name: string;
    quantity: number;
    unit: string;
    price: number;
    total: number;
    category: string;
    category_id: number;
  }>;
  category_names?: string[];
  category_ids?: number[];
  no_of_items?: string | number;
  payment_history: Array<{
    payment_id: string;
    paid_amount: number;
    payment_mode: string;
    paid_date: string;
    created_at: string;
  }>;
}

// Modal Data Interface
interface ModalPurchaseData {
  id: string;
  purchase_id: string;
  vendor_name: string;
  category: string;
  purchase_date: string;
  purchase_type: "Product" | "Other";
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  payment_type: string;
  notes: string;
  attachment_url: any[];
  items: any[];
  payment_history: any[];
  updated_at: string;
}

const PurchaseReport: React.FC = () => {
  const mapPurchaseType = (type?: string): "Product" | "Other" => {
    if (!type) return "Other";
    return type.toLowerCase() === "product" ? "Product" : "Other";
  };

  const [activeTab, setActiveTab] = useState("all-purchases");
  const [searchText, setSearchText] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedYear, setSelectedYear] = useState();
  const [page, setPage] = useState(1);
  const [selectedPurchase, setSelectedPurchase] =
    useState<RawPurchase | null>(null);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [modalData, setModalData] = useState<ModalPurchaseData | null>(null);

  const allPurchasesContainerRef = React.useRef<HTMLDivElement>(null);
  const dateWiseContainerRef = React.useRef<HTMLDivElement>(null);
  const monthWiseContainerRef = React.useRef<HTMLDivElement>(null);
    const {
      data: purchaseData,
      isLoading: isLoadingPurchase,
      error: purchaseError,
    } = useGetPurchaseByIdQuery(selectedPurchase?.purchase_id || "", {
      skip: !selectedPurchase?.purchase_id || !purchaseModalOpen,
    });

  const tabs = ["All Purchases", "Date Wise", "Month/Year Wise"];

  useEffect(() => {
    setPage(1);
  }, [activeTab, fromDate, toDate, selectedYear, searchText]);

  const getFilterType = () => {
    if (activeTab === "all-purchases") return "all_purchase";
    if (activeTab === "date-wise") return "date_wise";
    if (activeTab === "month/year-wise") return "month_year_wise";
    return "all_purchase";
  };

  const buildParams = (): PurchaseReportParams => {
    const baseParams: PurchaseReportParams = {
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
    overAllPurchase,
    overAllTotalAmount,
    overAllTotalPaid,
    overAllTotalDue,
    pagination,
    isLoading,
    isFetching,
  } = usePurchaseReport({ params });

  const handleLoadMore = () => {
    if (!isLoading && !isFetching && page < pagination.totalPages) {
      setPage(prev => prev + 1);
    }
  };

  const handleClearFilters = () => {
    setSearchText("");
    setFromDate("");
    setToDate("");
    setSelectedYear(new Date().getFullYear().toString());
  };

  useEffect(() => {
    const container = allPurchasesContainerRef.current;
    if (!container || activeTab !== "all-purchases") return;

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
    if (!purchaseModalOpen || isLoadingPurchase) return;

    const purchaseDetails =
      purchaseData?.Data?.purchase ||
      purchaseData?.Data ||
      purchaseData?.data ||
      purchaseData;

    if (!purchaseDetails || purchaseError) {
      setModalData(null);
      return;
    }

    setModalData({
      id: purchaseDetails.purchase_id || purchaseDetails.id || "",
      purchase_id: purchaseDetails.purchase_id || purchaseDetails.id || "",
      vendor_name: purchaseDetails.vendor_name || "",
      category: purchaseDetails.items?.[0]?.category || "",
      purchase_date:
        purchaseDetails.purchase_date || purchaseDetails.created_at || "",
      purchase_type: mapPurchaseType(purchaseDetails.purchase_type),
      total_amount: Number(purchaseDetails.total_amount || 0),
      paid_amount: Number(purchaseDetails.paid_amount || 0),
      balance_amount: Number(purchaseDetails.balance_amount || 0),
      payment_type:
        purchaseDetails.payment_type ||
        purchaseDetails.payment_history?.[0]?.payment_mode ||
        "",
      notes: purchaseDetails.notes || "",
      attachment_url: (purchaseDetails.attachment_url || []).map(
        (file: any, index: number) => ({
          id: file.id || `${index}`,
          filename: file.filename || file.fileName || `Attachment ${index + 1}`,
          url: file.url || "",
          type: file.type,
        })
      ),
      items: (purchaseDetails.items || []).map((item: any) => ({
        id: item.id || item.item_id || "",
        name: item.name || item.item_name || "",
        qty: Number(item.qty ?? item.quantity ?? 0),
        unit: item.unit || item.unit_name || "",
        purchase_price: Number(item.purchase_price ?? item.price ?? 0),
        selling_price: Number(item.selling_price ?? 0),
        gst_tax: Number(item.gst_tax ?? item.tax ?? 0),
        total_price: Number(item.total_price ?? item.total ?? 0),
      })),
      payment_history: (purchaseDetails.payment_history || []).map(
        (payment: any) => ({
          payment_id: payment.payment_id || "",
          payment_mode: payment.payment_mode || payment.payment_type || "",
          payment_date:
            payment.payment_date || payment.paid_date || payment.created_at || "",
          amount: Number(payment.amount ?? payment.paid_amount ?? 0),
        })
      ),
      updated_at: purchaseDetails.updated_at || "",
    });
  }, [purchaseData, purchaseError, purchaseModalOpen, isLoadingPurchase]);

  const renderAllPurchasesTable = () => {
    return (
      <TableContainer
        ref={allPurchasesContainerRef}
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
                PURCHASE ID
              </TableCell>
              <TableCell sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}>
                VENDOR NAME
              </TableCell>
              <TableCell sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}>
                CATEGORY
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
                BALANCE
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map((purchase, index) => (
              <TableRow
                key={`${purchase.purchase_id}-${index}`}
                hover
                sx={{ "&:last-child td": { borderBottom: 0 } }}>
                <TableCell sx={{ py: 2 }}>{purchase.created_at}</TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Typography
                    color="info"
                    onClick={() => {
                      setSelectedPurchase(purchase);
                      setPurchaseModalOpen(true);
                    }}
                    sx={{
                      fontWeight: 500,
                      cursor: "pointer",
                    }}>
                    {purchase.purchase_id}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2 }}>{purchase.vendor_name}</TableCell>
                <TableCell sx={{ py: 2 }}>
                  {purchase.category_names && purchase.category_names.length
                    ? purchase.category_names.join(", ")
                    : purchase.category_name || (purchase.items || []).map(i => i.category).filter(Boolean).join(", ")}
                </TableCell>
                <TableCell sx={{ py: 2 }} align="right">
                  <Typography fontWeight="bold">
                    ₹{Number(purchase.total_amount).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2 }} align="right">
                  ₹{Number(purchase.paid_amount).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell sx={{ py: 2 }} align="right">
                  <Typography
                    color={Number(purchase.balance_amount) > 0 ? "error" : "success.main"}>
                    ₹{Number(purchase.balance_amount).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
            {isLoading && (
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
                TOTAL PURCHASES
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
                  {data.total_purchases} 
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
                TOTAL PURCHASES
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
        title="Purchase Report"
        subtitle="Monitor ingredient costs, supplier performance, and procurement history."
      />

      <Grid container spacing={1} mb={3}>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <SummaryCard title="TOTAL PURCHASES" value={overAllPurchase} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <SummaryCard title="TOTAL AMOUNT" value={overAllTotalAmount} isCurrency />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <SummaryCard title="TOTAL PAID" value={overAllTotalPaid} isCurrency />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <SummaryCard title="TOTAL DUE" value={overAllTotalDue} isCurrency />
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
          showDateFilter={activeTab === "all-purchases" || activeTab === "date-wise"}
          showMonthYearFilter={activeTab === "month/year-wise"}
        />

        {activeTab === "all-purchases" && renderAllPurchasesTable()}
        {activeTab === "date-wise" && renderDateWiseTable()}
        {activeTab === "month/year-wise" && <ExpandableMonthTable />}
      </Paper>
      <PurchaseModal
        open={purchaseModalOpen}
        onClose={() => {
          setPurchaseModalOpen(false);
          setSelectedPurchase(null);
          setModalData(null);
        }}
        onDelete={() => {}}
        data={modalData}
      />
    </Box>
  );
};

export default PurchaseReport;
