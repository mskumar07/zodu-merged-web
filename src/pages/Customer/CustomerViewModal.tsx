import React, { useEffect, useState } from "react";
import { closeFromControlsOnly } from "@utils/dialog";
import {
  Box, Dialog, DialogContent, DialogTitle,
  Divider, IconButton, Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import LottieLoader from "@components/LottieLoader";
import SuccessToast from "@components/Common/SuccessToast";
import { useCustomerDetail, getCustomerApiError } from "./useCustomerapi";

/** Figures that come from the list row — the detail API does not return them. */
export interface CustomerSalesSummary {
  totalInvoice: number;
  totalSale: number;
  outstandingBalance: number;
}

const INR = (v: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(v);

function SH({ icon, title, iconBg, iconColor }: {
  icon: React.ReactNode; title: string; iconBg: string; iconColor: string;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
      <Box sx={{
        width: 26, height: 26, bgcolor: iconBg, borderRadius: 1.5,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, color: iconColor,
      }}>
        {icon}
      </Box>
      <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#1F2937", letterSpacing: 0.3 }}>
        {title}
      </Typography>
    </Box>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: "#9CA3AF", letterSpacing: 0.6, mb: 0.3 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: value ? "#0F172A" : "#D1D5DB", wordBreak: "break-word" }}>
        {value || "—"}
      </Typography>
    </Box>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 1.2 }}>
      {children}
    </Box>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  custUuid: string | null;
  summary?: CustomerSalesSummary | null;
}

const joinAddress = (...parts: (string | null | undefined)[]) =>
  parts.map((p) => p?.trim()).filter(Boolean).join(", ");

export default function CustomerViewModal({ open, onClose, custUuid, summary }: Props) {
  const { data: customer, isLoading, isError, error } = useCustomerDetail(open ? custUuid : null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isError) setErrorMsg(getCustomerApiError(error, "Failed to load customer details"));
  }, [isError, error]);

  const billingAddress = joinAddress(
    customer?.address_line1, customer?.address_line2, customer?.city, customer?.state, customer?.pincode,
  );
  const shippingAddress = customer?.same_as_billing_address
    ? billingAddress
    : (customer?.shipping_address ?? "");

  return (
    <>
    <Dialog
      open={open}
      onClose={closeFromControlsOnly(onClose)}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 4, boxShadow: "0 25px 60px rgba(15,23,42,0.2)", maxWidth: 700 } } }}
    >
      <DialogTitle sx={{
        px: 3, py: 2, borderBottom: "1px solid #F1F5F9",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ p: 0.8, bgcolor: "rgba(225,29,72,0.08)", borderRadius: 2, display: "flex" }}>
            <PersonOutlineIcon sx={{ color: "#E11D48", fontSize: 20 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 17, fontWeight: 800, color: "#0F172A" }}>Customer Details</Typography>
            <Typography sx={{ fontSize: 11, color: "#6B7280" }}>Customer information (read-only)</Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small"
          sx={{ color: "#6B7280", bgcolor: "#F9FAFB", "&:hover": { bgcolor: "#F3F4F6" }, borderRadius: "50%" }}>
          <CloseIcon sx={{ fontSize: 17 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 3, bgcolor: "#fff", maxHeight: "76vh", overflowY: "auto" }}>
        {isLoading ? (
          <LottieLoader />
        ) : !customer ? (
          <Typography sx={{ color: "#9CA3AF", fontSize: 13, textAlign: "center", py: 4 }}>
            No customer data found.
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box>
              <SH icon={<PersonOutlineIcon sx={{ fontSize: 14 }} />}
                title="Basic Information" iconBg="#FFF1F2" iconColor="#E11D48" />
              <Row>
                <Field label="Customer Name" value={customer.cust_name} />
                <Field label="Customer ID" value={customer.cust_id} />
              </Row>
              <Row>
                <Field label="Business Name" value={customer.cpy_name} />
                <Field label="Status" value={customer.is_active ? "Active" : "Inactive"} />
              </Row>
              <Row>
                <Field label="Mobile Number" value={customer.mobile_no?.join(", ")} />
                <Field label="Email Address" value={customer.email_id?.join(", ")} />
              </Row>
            </Box>

            <Divider sx={{ borderColor: "#F1F5F9" }} />

            <Box>
              <SH icon={<BusinessOutlinedIcon sx={{ fontSize: 14 }} />}
                title="Tax Information" iconBg="#EFF6FF" iconColor="#2563EB" />
              <Row>
                <Field label="GSTIN" value={customer.gst} />
                <Box />
              </Row>
            </Box>

            <Divider sx={{ borderColor: "#F1F5F9" }} />

            <Box>
              <SH icon={<LocationOnOutlinedIcon sx={{ fontSize: 14 }} />}
                title="Address" iconBg="#F0FDF4" iconColor="#16A34A" />
              <Row>
                <Field label="Billing Address" value={billingAddress} />
                <Field label="Shipping Address" value={shippingAddress} />
              </Row>
            </Box>

            {summary && (
              <>
                <Divider sx={{ borderColor: "#F1F5F9" }} />

                <Box>
                  <SH icon={<ReceiptLongOutlinedIcon sx={{ fontSize: 14 }} />}
                    title="Sales Summary" iconBg="#FFFBEB" iconColor="#D97706" />
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
                    <Field label="Total Invoice" value={String(summary.totalInvoice)} />
                    <Field label="Total Sale" value={INR(summary.totalSale)} />
                    <Field label="Outstanding" value={INR(summary.outstandingBalance)} />
                  </Box>
                </Box>
              </>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
    <SuccessToast message={errorMsg} severity="error" onClose={() => setErrorMsg("")} />
    </>
  );
}
