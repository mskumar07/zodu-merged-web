import React, { useMemo, useState, useCallback, useRef, useEffect } from "react";
import LottieLoader from "@components/LottieLoader";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchIcon from "@mui/icons-material/Search";
import AddNewCustomerDialog from "./Addnewcustomerdialog";
import CustomerLedgerDialog from "./CustomerLedgerDialog";
import MarkPaymentDialog from "./MarkPaymentDialog";
import DataTable, { type ColumnDef } from "@utils/DataTable";
import { useInfiniteCustomers } from "./useCustomerapi";

const theme = createTheme({
  palette: {
    primary: { main: "#D32F2F" },
    background: { default: "#F9FAFB", paper: "#FFFFFF" },
    text: { primary: "#0F172A", secondary: "#6B7280" },
  },
 
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", borderRadius: 8, fontWeight: 700 },
      },
    },
    // MuiTableCell: {
    //   styleOverrides: {
    //     root: {
    //       borderBottom: "1px solid #F3F4F6",
    //       padding: "10px 16px",
    //       fontSize: 13,
    //     },
    //     head: {
    //       fontSize: 10,
    //       fontWeight: 700,
    //       letterSpacing: "0.07em",
    //       color: "#6B7280",
    //       textTransform: "uppercase",
    //       backgroundColor: "#F9FAFB",
    //       borderBottom: "2px solid #E5E7EB",
    //       padding: "12px 16px",
    //       position: "sticky",
    //       top: 0,
    //       zIndex: 10,
    //     },
    //   },
    // },
  },
});

interface Customer {
  id: string;
  custUuid: string;
  businessName: string;
  contactName: string;
  mobile: string;
  email: string;
  address: string;
  gstin: string;
  totalSale: number;
  outstandingBalance: number;
  placeOfSupply: string;
}

interface ApiCustomer {
  cust_id: string;
  cust_uuid: string;
  cust_name: string | null;
  cpy_name: string | null;
  mobile_no: string[] | null;
  email_id: string[] | null;
  gst: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  total_sale?: number | string | null;
  outstanding_balance?: number | string | null;
}



const INR = (v: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(v);
const TABLE_TEXT_COLOR = "#374151";


interface CustomerManagementProps {
  onAddCustomer?: () => void;
  onEditCustomer?: (customer: Customer) => void;
  onDeleteCustomer?: (id: string) => void;
}

export default function CustomerManagement({
  onAddCustomer,
  onEditCustomer,
  onDeleteCustomer,
}: CustomerManagementProps) {
  const [search, setSearch] = useState("");
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<ApiCustomer | null>(null);
  const [customerLedgerOpen, setCustomerLedgerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<Customer | null>(null);

  const sentinelRef       = useRef<HTMLTableRowElement>(null) as React.RefObject<HTMLTableRowElement>;
  const tableContainerRef = useRef<HTMLDivElement>(null)      as React.RefObject<HTMLDivElement>;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteCustomers(search);

  const apiCustomers = useMemo(
    () => data?.pages.flatMap((p) => p.customers) ?? [],
    [data],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { root: tableContainerRef.current },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleDelete = useCallback((id: string) => {
    if (window.confirm("Delete this customer?")) {
      onDeleteCustomer?.(id);
    }
  }, [onDeleteCustomer]);

  const filtered: Customer[] = useMemo(() => {
    if (!apiCustomers || !Array.isArray(apiCustomers)) return [];
    return (apiCustomers as unknown as ApiCustomer[]).map((c: ApiCustomer) => ({
      id: c.cust_id,
      custUuid: c.cust_uuid,
      businessName: c.cpy_name || "—",
      contactName: c.cust_name || "—",
      mobile: c.mobile_no?.[0] || "",
      email: c.email_id?.[0] || "",
      address: [c.address_line1, c.city, c.state, c.pincode].filter(Boolean).join(", "),
      gstin: c.gst || "",
      totalSale: Number(c.total_sale) || 0,
      outstandingBalance: Number(c.outstanding_balance) || 0,
      placeOfSupply: c.state || "",
    }));
  }, [apiCustomers]);

  const handleCustomerClick = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerLedgerOpen(true);
  }, []);

  const columns = useMemo<ColumnDef<Customer>[]>(
    () => [
      {
        key: "customerId",
        label: "Customer ID",
        width: 100,
        render: (customer) => (
          <Typography
            onClick={(event) => {
              event.stopPropagation();
              handleCustomerClick(customer);
            }}
            sx={{
              fontSize: 13,
              fontWeight: 600,
              color: "#1976d2",
              whiteSpace: "nowrap",
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {customer.id}
          </Typography>
        ),
      },
      {
        key: "businessName",
        label: "Customer / Business Name",
        width: 220,
        render: (customer) => (
          <Box sx={{ overflow: "hidden" }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: TABLE_TEXT_COLOR, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {customer.contactName}
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: TABLE_TEXT_COLOR, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {customer.businessName}
            </Typography>
          </Box>
        ),
      },
      {
        key: "mobile",
        label: "Mobile Number",
        width: 130,
        render: (customer) => (
          <Typography sx={{ fontSize: 13, color: TABLE_TEXT_COLOR, whiteSpace: "nowrap" }}>
            {customer.mobile}
          </Typography>
        ),
      },
      {
        key: "email",
        label: "Email Address",
        width: 240,
        render: (customer) => (
          <Typography sx={{ fontSize: 13, color: TABLE_TEXT_COLOR, whiteSpace: "nowrap" }}>
            {customer.email}
          </Typography>
        ),
      },
      {
        key: "gstin",
        label: "GSTIN",
        width: 140,
        render: (customer) =>
          customer.gstin ? (
            <Typography
              sx={{
                fontSize: 13,
                color: TABLE_TEXT_COLOR,
             
                borderRadius: 1,
                px: 0.7,
                py: 0.2,
                display: "inline-block",
                whiteSpace: "nowrap",
                letterSpacing: "0.04em",
              }}
            >
              {customer.gstin}
            </Typography>
          ) : (
            <Typography sx={{ fontSize: 13, color: "#D1D5DB" }}>--</Typography>
          ),
      },
      {
        key: "totalSale",
        label: "Total Sale",
        align: "right",
        width: 130,
        render: (customer) => (
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 700,
              color: "#1976d2",
              whiteSpace: "nowrap",
            }}
          >
            {INR(customer.totalSale)}
          </Typography>
        ),
      },
      {
        key: "outstandingBalance",
        label: "Outstanding",
        align: "right",
        width: 130,
        render: (customer) => (
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 700,
              color: customer.outstandingBalance > 0 ? "#D32F2F" : "#16A34A",
              whiteSpace: "nowrap",
            }}
          >
            {INR(customer.outstandingBalance)}
          </Typography>
        ),
      },
      {
        key: "markPayment",
        label: "",
        align: "center",
        width: 130,
        render: (customer) =>
          customer.outstandingBalance > 0 ? (
            <Button
              size="small"
              variant="contained"
              color="primary"
              disableElevation
              onClick={(event) => {
                event.stopPropagation();
                setPaymentTarget(customer);
              }}
              sx={{
                fontSize: "0.65rem",
                py: 0.4,
                px: 1.5,
                height: 24,
                width: "100%",
                whiteSpace: "nowrap",
              }}
            >
              Mark as Paid
            </Button>
          ) : null,
      },
      {
        key: "actions",
        label: "Actions",
        align: "center",
        width: 100,
        render: (customer) => (
          <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
            <Tooltip title="Edit" placement="top">
              <IconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  // Find the full customer data from apiCustomers
                  const fullCustomer = (apiCustomers as unknown as ApiCustomer[]).find((c: ApiCustomer) => c.cust_id === customer.id);
                  if (fullCustomer) {
                    setEditingCustomer(fullCustomer);
                    setAddCustomerOpen(true);
                  }
                  onEditCustomer?.(customer);
                }}
                sx={{
                  color: "#9CA3AF",
                  p: 0.6,
                  borderRadius: 1,
                  "&:hover": { color: "#2563EB", bgcolor: "#EFF6FF" },
                  transition: "all 0.12s",
                }}
              >
                <EditOutlinedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete" placement="top">
              <IconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  handleDelete(customer.id);
                }}
                sx={{
                  color: "#9CA3AF",
                  p: 0.6,
                  borderRadius: 1,
                  "&:hover": { color: "#DC2626", bgcolor: "#FEE2E2" },
                  transition: "all 0.12s",
                }}
              >
                <DeleteOutlineIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [onEditCustomer, apiCustomers, handleDelete, handleCustomerClick]
  );

  if (isLoading) return <LottieLoader />;

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          bgcolor: "#F9FAFB",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        <Box
          sx={{
            px: 1,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            gap: 2,
            flexWrap: "nowrap",
            overflow: "hidden",
          }}
        >
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or GSTIN..."
            size="small"
            sx={{
              flex: "1 1 0",
              minWidth: 0,
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
                bgcolor: "#ffff",
                fontSize: 13,
                "& fieldset": { borderColor: "#E5E7EB" },
                "&:hover fieldset": { borderColor: "#D32F2F" },
                "&.Mui-focused fieldset": { borderColor: "#D32F2F", borderWidth: 2 },
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 17, color: "#9CA3AF" }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
            <Typography sx={{ fontSize: 12, color: "#9CA3AF", fontWeight: 500 }}>
              Showing{" "}
              <Box component="span" sx={{ fontWeight: 800, color: "#1A1A2E" }}>
                {filtered.length}
              </Box>{" "}
              customers
            </Typography>

            {/* <Button
              variant="outlined"
              size="small"
              startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 15 }} />}
              sx={{
                fontSize: 12,
                fontWeight: 600,
                borderColor: "#E5E7EB",
                color: "#374151",
                px: 1.5,
                py: 0.7,
                borderRadius: 1.5,
                "&:hover": { borderColor: "#9CA3AF", bgcolor: "#F9FAFB" },
              }}
            >
              Export CSV
            </Button>

            <Button
              variant="outlined"
              size="small"
              startIcon={<PrintOutlinedIcon sx={{ fontSize: 15 }} />}
              sx={{
                fontSize: 12,
                fontWeight: 600,
                borderColor: "#E5E7EB",
                color: "#374151",
                px: 1.5,
                py: 0.7,
                borderRadius: 1.5,
                "&:hover": { borderColor: "#9CA3AF", bgcolor: "#F9FAFB" },
              }}
            >
              Print List
            </Button> */}

            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon sx={{ fontSize: 16 }} />}
              onClick={() => {
                setEditingCustomer(null);
                setAddCustomerOpen(true);
                onAddCustomer?.();
              }}
              disableElevation
              sx={{
                fontSize: 13,
                fontWeight: 700,
                bgcolor: "#D32F2F",
                color: "#fff",
                px: 2,
                py: 0.8,
                borderRadius: 1.5,
                boxShadow: "0 4px 14px rgba(211,47,47,0.3)",
                "&:hover": { bgcolor: "#B71C1C" },
                "&:active": { transform: "scale(0.97)" },
                transition: "all 0.15s",
              }}
            >
              Add New Customer
            </Button>
          </Box>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0, px: 1, py: 1.5 }}>
          <Box sx={{ height: "100%", minHeight: 0 }}>
            <DataTable<Customer>
              columns={columns}
              rows={filtered}
              rowKey={(customer) => customer.id}
              onRowClick={handleCustomerClick}
              isLoading={isLoading}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              loadMoreRef={sentinelRef}
              tableContainerRef={tableContainerRef}
              maxHeight="100%"
              emptyMessage={search ? `No customers found for "${search}"` : "No customers found."}
            />
          </Box>
        </Box>

        <AddNewCustomerDialog
          open={addCustomerOpen}
          onClose={() => {
            setAddCustomerOpen(false);
            setEditingCustomer(null);
          }}
          editingCustomer={editingCustomer}
        />

        <CustomerLedgerDialog
          open={customerLedgerOpen}
          onClose={() => setCustomerLedgerOpen(false)}
          custUuid={selectedCustomer?.custUuid}
          customerName={selectedCustomer?.businessName || selectedCustomer?.contactName || "Customer"}
        />

        {paymentTarget && (
          <MarkPaymentDialog
            customer={{
              custUuid:           paymentTarget.custUuid,
              displayName:        paymentTarget.businessName || paymentTarget.contactName,
              mobile:             paymentTarget.mobile,
              outstandingBalance: paymentTarget.outstandingBalance,
            }}
            onClose={() => setPaymentTarget(null)}
            onSuccess={() => setPaymentTarget(null)}
          />
        )}
      </Box>
    </ThemeProvider>
  );
}
