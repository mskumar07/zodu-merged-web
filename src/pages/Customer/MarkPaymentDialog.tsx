/**
 * MarkPaymentDialog.tsx
 * Records a customer payment against one or more outstanding bills.
 */
import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogContent, Box, Typography, IconButton, Button,
  TextField, Select, MenuItem, Checkbox, Table, TableHead, TableBody,
  TableRow, TableCell, InputAdornment, CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { useOutstandingBills, useMarkPayment } from "./useCustomerapi";

const RED = "#D32F2F";

export interface PayableBill {
  invoiceNo:   string;
  invoiceDate: string;
  dueDate:     string;
  billAmount:  number;
  outstanding: number;
}

export interface MarkPaymentTarget {
  custUuid:           string;
  displayName:        string;
  mobile:             string;
  outstandingBalance: number;
}

interface Props {
  customer:  MarkPaymentTarget;
  onClose:   () => void;
  onSuccess?: () => void;
}

const PAYMENT_MODES = ["Cash", "UPI", "Bank Transfer", "Card", "Others"] as const;

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    fontSize: 13,
    bgcolor: "#fff",
    "& fieldset":             { borderColor: "#E2E8F0" },
    "&:hover fieldset":       { borderColor: "#CBD5E1" },
    "&.Mui-focused fieldset": { borderColor: RED, borderWidth: 2 },
  },
};

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#334155", mb: 0.6 }}>
      {children}
      {required && <Box component="span" sx={{ color: RED, ml: 0.3 }}>*</Box>}
    </Typography>
  );
}

const INR = (v: number) =>
  `₹${v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MarkPaymentDialog({ customer, onClose, onSuccess }: Props) {
  const { data, isLoading, isError, error } = useOutstandingBills(customer.custUuid);

  const bills: PayableBill[] = useMemo(
    () => (data?.bills ?? []).map((b) => ({
      invoiceNo:   b.sale_id,
      invoiceDate: b.invoice_date ?? "",
      dueDate:     b.due_date ?? "",
      billAmount:  Number(b.total_amount) || 0,
      outstanding: Number(b.balance_amount) || 0,
    })),
    [data]
  );

  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelected(new Set(bills.map((b) => b.invoiceNo)));
  }, [bills]);

  const [paymentDate, setPaymentDate]   = useState(() => new Date().toISOString().split("T")[0]);
  const [paymentMode, setPaymentMode]   = useState<typeof PAYMENT_MODES[number]>("Cash");
  const [referenceNo, setReferenceNo]   = useState("");
  const [amountInput, setAmountInput]   = useState("");
  const [files, setFiles] = useState<{ id: string; file: File; name: string; size: string; kind: "pdf" | "image" }[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const selectedOutstanding = useMemo(
    () => bills.reduce((sum, b) => (selected.has(b.invoiceNo) ? sum + b.outstanding : sum), 0),
    [bills, selected]
  );

  const amountToPay   = Math.max(0, (parseFloat(amountInput) || 0));
  const balanceAfter  = Math.max(0, selectedOutstanding - amountToPay);
  const isOverpaid    = amountToPay > selectedOutstanding;

  const toggleBill = (invoiceNo: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(invoiceNo)) next.delete(invoiceNo);
      else next.add(invoiceNo);
      return next;
    });
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList) return;
    const picked = Array.from(fileList).slice(0, Math.max(0, 5 - files.length));
    setFiles((prev) => [
      ...prev,
      ...picked.map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        name: file.name,
        size: fmtSize(file.size),
        kind: (file.type === "application/pdf" ? "pdf" : "image") as "pdf" | "image",
      })),
    ]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const markPayment = useMarkPayment({
    onSuccess: () => onSuccess?.(),
    onError:   (msg) => setSubmitError(msg),
  });

  const canSubmit =
    selected.size > 0 &&
    amountToPay > 0 &&
    !isOverpaid &&
    !!paymentDate &&
    !!paymentMode &&
    !markPayment.isPending;

  const handleSubmit = () => {
    setSubmitError(null);
    if (!canSubmit) return;
    markPayment.mutate({
      custUuid:     customer.custUuid,
      paymentDate,
      paymentMode,
      referenceNo:  referenceNo || undefined,
      totalPayment: amountToPay,
      bills: bills
        .filter((b) => selected.has(b.invoiceNo))
        .map((b) => ({ sale_id: b.invoiceNo })),
      attachments: files.map((f) => f.file),
    });
  };

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid #E2E8F0",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* ── Header ── */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        px: 3, py: 2.25, borderBottom: "1px solid #F1F5F9", bgcolor: "#fff", flexShrink: 0,
      }}>
        <Box>
          <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#0F172A", mb: 0.5 }}>
            Mark Payment
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            <Typography sx={{ fontSize: 13, color: "#64748B" }}>
              <Box component="span" sx={{ fontWeight: 700, color: "#334155" }}>Customer:</Box>{" "}
              {customer.displayName}
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#64748B" }}>
              <Box component="span" sx={{ fontWeight: 700, color: "#334155" }}>Mobile:</Box>{" "}
              {customer.mobile || "—"}
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#64748B" }}>
              <Box component="span" sx={{ fontWeight: 700, color: "#334155" }}>Total Outstanding:</Box>{" "}
              <Box component="span" sx={{ fontWeight: 800, color: RED }}>
                {INR(customer.outstandingBalance)}
              </Box>
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "#64748B", "&:hover": { bgcolor: "#F1F5F9" } }}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 3, py: 2.5, bgcolor: "#F9FAFB", overflowY: "auto", flex: 1, minHeight: 0 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

          {/* ── 1. Select Bills to Pay ── */}
          <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: 2, overflow: "hidden" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>
                1. Select Bills to Pay
              </Typography>
              <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: RED }}>
                {selected.size} bill{selected.size === 1 ? "" : "s"} selected
              </Typography>
            </Box>

            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {["#", "Invoice No.", "Invoice Date", "Due Date", "Bill Amount", "Outstanding", "Select"].map((h) => (
                      <TableCell
                        key={h}
                        align={h === "Select" ? "center" : h === "Bill Amount" || h === "Outstanding" ? "right" : "left"}
                        sx={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", bgcolor: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        <CircularProgress size={22} sx={{ color: RED }} />
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading && isError && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3, fontSize: 13, color: RED }}>
                        {error instanceof Error ? error.message : "Failed to load outstanding bills."}
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading && !isError && bills.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3, fontSize: 13, color: "#94A3B8" }}>
                        No outstanding bills for this customer.
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading && !isError && bills.map((bill, i) => (
                    <TableRow key={bill.invoiceNo} hover>
                      <TableCell sx={{ fontSize: 13, color: "#6B7280" }}>{i + 1}</TableCell>
                      <TableCell sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{bill.invoiceNo}</TableCell>
                      <TableCell sx={{ fontSize: 13, color: "#374151" }}>{bill.invoiceDate || "—"}</TableCell>
                      <TableCell sx={{ fontSize: 13, color: RED, fontWeight: 600 }}>{bill.dueDate || "—"}</TableCell>
                      <TableCell align="right" sx={{ fontSize: 13, color: "#374151" }}>{INR(bill.billAmount)}</TableCell>
                      <TableCell align="right" sx={{ fontSize: 13, fontWeight: 700, color: RED }}>{INR(bill.outstanding)}</TableCell>
                      <TableCell align="center">
                        <Checkbox
                          size="small"
                          checked={selected.has(bill.invoiceNo)}
                          onChange={() => toggleBill(bill.invoiceNo)}
                          sx={{ color: "#D1D5DB", "&.Mui-checked": { color: RED } }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, py: 1.25, bgcolor: "#F9FAFB", borderTop: "1px solid #F1F5F9" }}>
              <InfoOutlinedIcon sx={{ fontSize: 15, color: "#94A3B8" }} />
              <Typography sx={{ fontSize: 12, color: "#64748B" }}>
                Only outstanding invoices are shown. Payments will be adjusted against the selected invoices.
              </Typography>
            </Box>
          </Box>

          {/* ── 2. Payment Details + Summary ── */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.4fr 1fr" }, gap: 2.5 }}>

            {/* Left: form fields */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ bgcolor: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: 3, p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#1E293B", letterSpacing: "0.04em", pb: 1, borderBottom: "1px solid #E5E7EB" }}>
                  2. PAYMENT DETAILS
                </Typography>

                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                  <Box>
                    <FieldLabel required>Payment Date</FieldLabel>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        value={paymentDate ? dayjs(paymentDate) : null}
                        format="DD-MMM-YYYY"
                        onChange={(newValue: Dayjs | null) => setPaymentDate(newValue ? newValue.format("YYYY-MM-DD") : "")}
                        slotProps={{
                          textField: {
                            size: "small", fullWidth: true,
                            sx: { ...inputSx, "& .MuiOutlinedInput-root": { ...inputSx["& .MuiOutlinedInput-root"], bgcolor: "#fff" } },
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Box>
                  <Box>
                    <FieldLabel required>Payment Mode</FieldLabel>
                    <Select
                      size="small" fullWidth
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value as typeof paymentMode)}
                      sx={{
                        borderRadius: "8px", fontSize: 13, bgcolor: "#fff",
                        "& fieldset":             { borderColor: "#E2E8F0" },
                        "&:hover fieldset":       { borderColor: "#CBD5E1" },
                        "&.Mui-focused fieldset": { borderColor: RED, borderWidth: 2 },
                      }}
                    >
                      {PAYMENT_MODES.map((m) => (
                        <MenuItem key={m} value={m} sx={{ fontSize: 13 }}>{m}</MenuItem>
                      ))}
                    </Select>
                  </Box>
                </Box>

                <Box>
                  <FieldLabel>Reference No.</FieldLabel>
                  <TextField
                    size="small" fullWidth placeholder="Enter reference number"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    sx={{ ...inputSx, "& .MuiOutlinedInput-root": { ...inputSx["& .MuiOutlinedInput-root"], bgcolor: "#fff" } }}
                  />
                </Box>
              </Box>

              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#0F172A", mb: 1 }}>
                  3. Attachments <Box component="span" sx={{ color: "#94A3B8", fontWeight: 500 }}>(Optional)</Box>
                </Typography>
                <Typography sx={{ fontSize: 11.5, color: "#94A3B8", mb: 1 }}>
                  Attach payment proof or related documents.
                </Typography>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf"
                  hidden
                  onChange={(e) => {
                    handleFilesSelected(e.target.files);
                    e.target.value = "";
                  }}
                />
                <Box
                  onClick={handleFileButtonClick}
                  sx={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5,
                    p: 2.5, border: "1.5px dashed #E2E8F0", borderRadius: 2, bgcolor: "#FAFAFA",
                    cursor: "pointer", "&:hover": { borderColor: "#CBD5E1" },
                  }}
                >
                  <CloudUploadOutlinedIcon sx={{ fontSize: 24, color: "#9CA3AF" }} />
                  <Typography sx={{ fontSize: 12.5, color: "#6B7280" }}>
                    Drag &amp; drop files here or{" "}
                    <Box component="span" sx={{ color: RED, fontWeight: 700 }}>Browse Files</Box>
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>
                    Supports: JPG, PNG, PDF (Max 5MB each)
                  </Typography>
                </Box>

                {files.length > 0 && (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1.5 }}>
                    {files.map((f) => (
                      <Box
                        key={f.id}
                        sx={{
                          display: "flex", alignItems: "center", gap: 1, p: 1,
                          border: "1px solid #E5E7EB", borderRadius: 1.5, bgcolor: "#fff",
                        }}
                      >
                        {f.kind === "pdf"
                          ? <PictureAsPdfOutlinedIcon sx={{ fontSize: 20, color: "#EF4444" }} />
                          : <ImageOutlinedIcon sx={{ fontSize: 20, color: "#3B82F6" }} />}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {f.name}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>{f.size}</Typography>
                        <IconButton size="small" onClick={() => removeFile(f.id)} sx={{ p: 0.4, color: "#9CA3AF", "&:hover": { color: "#EF4444" } }}>
                          <CloseIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>

            {/* Right: summary panel */}
            <Box sx={{
              bgcolor: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: 3,
              p: 2.5, display: "flex", flexDirection: "column", gap: 1.75, height: "fit-content",
            }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontSize: 13, color: "#64748B" }}>Total Outstanding (Selected)</Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>
                  {INR(selectedOutstanding)}
                </Typography>
              </Box>

              <Box>
                <Typography sx={{ fontSize: 13, color: "#64748B", mb: 0.6 }}>Total Payment</Typography>
                <TextField
                  size="small" fullWidth type="number"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="0.00"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Typography sx={{ fontSize: 13, fontWeight: 700, color: "#64748B" }}>₹</Typography></InputAdornment>,
                    inputProps: { min: 0, style: { fontWeight: 700, textAlign: "right" } },
                  }}
                  error={isOverpaid}
                  sx={{
                    ...inputSx,
                    bgcolor: "#fff",
                    "& input[type=number]": { MozAppearance: "textfield" },
                    "& input[type=number]::-webkit-outer-spin-button": { WebkitAppearance: "none", margin: 0 },
                    "& input[type=number]::-webkit-inner-spin-button": { WebkitAppearance: "none", margin: 0 },
                  }}
                />
                {isOverpaid && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.75 }}>
                    <ErrorOutlineIcon sx={{ fontSize: 14, color: RED }} />
                    <Typography sx={{ fontSize: 11.5, color: RED, fontWeight: 600 }}>
                      Payment amount exceeds the selected invoices' outstanding balance ({INR(selectedOutstanding)}).
                    </Typography>
                  </Box>
                )}
              </Box>

              <Box sx={{ borderTop: "1px solid #E5E7EB", pt: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>Amount to Pay</Typography>
                  <Typography sx={{ fontSize: 18, fontWeight: 800, color: RED }}>{INR(amountToPay)}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography sx={{ fontSize: 13, color: "#64748B" }}>Balance After Payment</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#16A34A" }}>{INR(balanceAfter)}</Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 0.5 }}>
            <InfoOutlinedIcon sx={{ fontSize: 15, color: "#94A3B8" }} />
            <Typography sx={{ fontSize: 12, color: "#64748B" }}>
              Selected bills will be marked as paid and outstanding will be updated.
            </Typography>
          </Box>

          {submitError && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 0.5 }}>
              <ErrorOutlineIcon sx={{ fontSize: 15, color: RED }} />
              <Typography sx={{ fontSize: 12.5, color: RED, fontWeight: 600 }}>
                {submitError}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      {/* ── Footer ── */}
      <Box sx={{
        px: 3, py: 2, bgcolor: "#fff", borderTop: "1px solid #F1F5F9",
        display: "flex", justifyContent: "flex-end", gap: 1.5, flexShrink: 0,
      }}>
        <Button
          variant="outlined" onClick={onClose}
          sx={{
            borderRadius: "10px", borderColor: "#E2E8F0", color: "#475569",
            fontWeight: 700, fontSize: 13, px: 3, textTransform: "none",
            "&:hover": { bgcolor: "#F8FAFC", borderColor: "#CBD5E1" },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained" disableElevation
          onClick={handleSubmit}
          disabled={!canSubmit}
          sx={{
            borderRadius: "10px", bgcolor: RED, color: "#fff",
            fontWeight: 700, fontSize: 13, px: 3, textTransform: "none",
            boxShadow: "0 4px 14px rgba(211,47,47,0.25)",
            "&:hover": { bgcolor: "#B71C1C" },
            "&.Mui-disabled": { bgcolor: "#EF9A9A", color: "#fff" },
          }}
          startIcon={markPayment.isPending ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : undefined}
        >
          {markPayment.isPending ? "Saving…" : "Mark Payment"}
        </Button>
      </Box>
    </Dialog>
  );
}
