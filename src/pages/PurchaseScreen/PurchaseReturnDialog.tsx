/**
 * PurchaseReturnDialog.tsx
 * Create or edit a Purchase Return / Debit Note against a purchase invoice.
 * Lines and stock limits come from GET /purchase/:id (returnable_qty); an edit also loads the return
 * so its quantities come back pre-selected. State is one qty-per-line map (selected = qty > 0) and the
 * rows are memoised, so stepping one quantity re-renders that row, not the table.
 */
import { memo, useCallback, useMemo, useState } from "react";
import {
  Box, Button, Checkbox, CircularProgress, Collapse, Dialog, IconButton, MenuItem,
  Select, Skeleton, TextField, Typography, alpha,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AssignmentReturnOutlinedIcon from "@mui/icons-material/AssignmentReturnOutlined";
import {
  usePurchaseById, type PurchaseDetail, type PurchaseItemRow,
  type PurchaseReturnKind, type PurchaseReturnListRow,
} from "./usePuchaseapi";
import {
  PURCHASE_REFUND_MODES, purchaseApiError, useCreatePurchaseReturn, usePurchaseReturnDetail,
  useUpdatePurchaseReturn, type PurchaseReturnDetail,
} from "./usePurchaseReturnApi";
import { localDateStr, toDateInputValue } from "@utils/localDate";
import { ReturnDateInput, useReturnDate } from "@components/Common/ReturnDateInput";

export type Notify = (message: string, severity?: "success" | "error") => void;

/** What to open: a purchase to return against, plus an existing return when editing. */
export interface PurchaseReturnTarget {
  purchaseId:  string;
  editReturn?: PurchaseReturnListRow;
}

interface Props {
  /** The dialog is open while this is set. */
  target:  PurchaseReturnTarget | null;
  onClose: () => void;
  notify:  Notify;
}

// ── Static config ─────────────────────────────────────────────
const REASONS = [
  "Defective Product", "Wrong Item Received", "Damaged in Transit",
  "Excess Quantity", "Quality Not as Expected", "Price Difference", "Other",
] as const;

const SETTLEMENTS: Record<PurchaseReturnKind, readonly string[]> = {
  PURCHASE_RETURN: ["Refund from Supplier", "Replacement Goods", "Adjust against Payable"],
  DEBIT_NOTE:      ["Credit to Supplier (Debit Note)", "Price Adjustment"],
};

const KIND_CARDS: Array<{ kind: PurchaseReturnKind; label: string; icon: React.ReactNode }> = [
  { kind: "PURCHASE_RETURN", label: "Purchase Return", icon: <SwapHorizIcon sx={{ fontSize: 20 }} /> },
  { kind: "DEBIT_NOTE",      label: "Debit Note",      icon: <DescriptionOutlinedIcon sx={{ fontSize: 20 }} /> },
];

const ACCENT = "#D32F2F";
const INR = (v: number) => v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num = (v: unknown) => Number(v ?? 0) || 0;
const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const todayStr = () => localDateStr();
const round2 = (v: number) => Math.round(v * 100) / 100;

const GRID = "40px minmax(220px, 1fr) 92px 104px 92px 148px 108px 118px";
const HEAD = { fontSize: 12, fontWeight: 700, color: "#64748B", letterSpacing: "0.02em" } as const;

// ── Line model ────────────────────────────────────────────────
interface Line {
  id:        number;
  itemId:    string | null;
  name:      string;
  hsn:       string;
  gst:       number;
  original:  number;
  returned:  number;
  available: number;
  price:     number;
}

/** `own` is what the return being edited already holds on this line — it is not "used up" for that return. */
const toLine = (it: PurchaseItemRow, own: number): Line => {
  const original  = num(it.qty);
  const returned  = Math.max(0, num(it.returned_qty) - own);
  const returnable = it.returnable_qty != null ? num(it.returnable_qty) : original - num(it.returned_qty);
  return {
    id: it.purchase_item_id, itemId: it.item_id, name: it.item_name,
    hsn: it.hsn_code ?? it.hsn ?? "—", gst: num(it.gst_percentage),
    original, returned, available: Math.max(0, round2(returnable + own)), price: num(it.purchase_price),
  };
};

// ── Quantity stepper ──────────────────────────────────────────
const stepBtn = { width: 28, height: 28, borderRadius: 0, color: "#64748B", "&:hover": { bgcolor: "#F1F5F9" } } as const;

const QtyStepper = memo(function QtyStepper({ value, max, onChange }: { value: number; max: number; onChange: (v: number) => void }) {
  const clamp = (v: number) => Math.min(max, Math.max(0, round2(v) || 0));
  // Free-typing draft so "1." and "0.5" survive while the user types; cleared on blur.
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", border: "1px solid #E2E8F0", borderRadius: "8px", overflow: "hidden", bgcolor: "#fff", opacity: max === 0 ? 0.5 : 1 }}>
      <IconButton size="small" disabled={value <= 0} onClick={() => { setDraft(null); onChange(clamp(value - 1)); }} sx={stepBtn} aria-label="Decrease"><RemoveIcon sx={{ fontSize: 15 }} /></IconButton>
      <Box
        component="input" value={draft ?? String(value)} disabled={max === 0} inputMode="decimal" aria-label="Return quantity"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const text = e.target.value.replace(/[^\d.]/g, "");
          setDraft(text);
          const n = clamp(parseFloat(text));
          if (n !== value) onChange(n);
        }}
        onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.select()}
        onBlur={() => setDraft(null)}
        sx={{ width: 44, height: 28, border: 0, borderLeft: "1px solid #E2E8F0", borderRight: "1px solid #E2E8F0", textAlign: "center", fontSize: 13, fontWeight: 700, outline: "none", bgcolor: "transparent", "&:focus": { bgcolor: alpha(ACCENT, 0.04) } }}
      />
      <IconButton size="small" disabled={value >= max} onClick={() => { setDraft(null); onChange(clamp(value + 1)); }} sx={stepBtn} aria-label="Increase"><AddIcon sx={{ fontSize: 15 }} /></IconButton>
    </Box>
  );
});

// ── One item row ──────────────────────────────────────────────
const ItemRow = memo(function ItemRow({ line, qty, onQty, onToggle }: {
  line: Line; qty: number;
  onQty: (id: number, qty: number) => void;
  onToggle: (id: number, available: number) => void;
}) {
  const selected = qty > 0;
  const exhausted = line.available === 0;
  const cell = { fontSize: 13, color: "#334155", textAlign: "center" as const };
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: GRID, alignItems: "center", px: 1, py: 1, borderBottom: "1px solid #F1F5F9", bgcolor: selected ? alpha(ACCENT, 0.05) : "transparent", transition: "background-color .12s", opacity: exhausted ? 0.55 : 1 }}>
      <Checkbox size="small" checked={selected} disabled={exhausted} onChange={() => onToggle(line.id, line.available)} sx={{ color: "#CBD5E1", "&.Mui-checked": { color: ACCENT } }} inputProps={{ "aria-label": `Select ${line.name}` }} />
      <Box sx={{ minWidth: 0, pr: 1 }}>
        <Typography noWrap sx={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{line.itemId ? `${line.itemId} - ` : ""}{line.name}</Typography>
        <Typography noWrap sx={{ fontSize: 11.5, color: "#94A3B8" }}>HSN: {line.hsn}{line.gst > 0 ? ` | ${line.gst}%` : ""}</Typography>
      </Box>
      <Typography sx={cell}>{line.original}</Typography>
      <Typography sx={cell}>{line.returned}</Typography>
      <Typography sx={{ ...cell, fontWeight: 600 }}>{line.available}</Typography>
      <Box sx={{ textAlign: "center" }}><QtyStepper value={qty} max={line.available} onChange={(v) => onQty(line.id, v)} /></Box>
      <Typography sx={{ ...cell, textAlign: "right" }}>{INR(line.price)}</Typography>
      <Typography sx={{ ...cell, textAlign: "right", fontWeight: 800, color: selected ? "#0F172A" : "#94A3B8", pr: 1 }}>{INR(qty * line.price)}</Typography>
    </Box>
  );
});

// ── Small labelled field ──────────────────────────────────────
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#334155", mb: 0.75 }}>
        {label}{required && <Box component="span" sx={{ color: ACCENT }}> *</Box>}
      </Typography>
      {children}
    </Box>
  );
}

const selectSx = { height: 44, borderRadius: "10px", fontSize: 14, bgcolor: "#fff", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" } } as const;

// ── Summary card ──────────────────────────────────────────────
function SummaryCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ border: "1px solid #E2E8F0", borderRadius: "12px", p: 2, bgcolor: "#fff" }}>
      <Typography sx={{ fontSize: 11, fontWeight: 800, color: "#94A3B8", letterSpacing: "0.12em", textTransform: "uppercase", mb: 1 }}>{title}</Typography>
      {children}
    </Box>
  );
}

function SummaryRow({ label, value, strong, color }: { label: string; value: number; strong?: boolean; color?: string }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", py: 0.4, ...(strong && { borderTop: "1.5px solid #E5E7EB", mt: 0.6, pt: 0.9 }) }}>
      <Typography sx={{ fontSize: strong ? 14 : 13, fontWeight: strong ? 800 : 500, color: strong ? "#0F172A" : "#475569" }}>{label}</Typography>
      <Typography sx={{ fontSize: strong ? 16 : 13, fontWeight: strong ? 800 : 600, color: color ?? "#0F172A" }}>
        {value < 0 ? "− " : ""}₹{INR(Math.abs(value))}
      </Typography>
    </Box>
  );
}

function Header({ title, subtitle, onClose }: { title: string; subtitle: string; onClose: () => void }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 3, py: 2, borderBottom: "1px solid #EEF2F7" }}>
      <Box sx={{ p: 1.1, bgcolor: alpha(ACCENT, 0.08), borderRadius: "10px", display: "flex" }}>
        <AssignmentReturnOutlinedIcon sx={{ color: ACCENT, fontSize: 24 }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 19, fontWeight: 800, color: "#0F172A", lineHeight: 1.2 }}>{title}</Typography>
        <Typography sx={{ fontSize: 13, color: "#64748B" }}>{subtitle}</Typography>
      </Box>
      <IconButton onClick={onClose} aria-label="Close"><CloseIcon /></IconButton>
    </Box>
  );
}

/** Options for a select whose stored value may predate the current list. */
const withValue = (list: readonly string[], value: string) => (value && !list.includes(value) ? [value, ...list] : list);

// ── The form: mounted only once the purchase (and, when editing, the return) has loaded,
//    so initial state is computed once from real data and never needs resetting. ──
function Form({ data, ret, editReturn, onClose, notify }: {
  data: PurchaseDetail; ret?: PurchaseReturnDetail; editReturn?: PurchaseReturnListRow;
} & Pick<Props, "onClose" | "notify">) {
  const isEdit = !!editReturn;

  const ownQty = useMemo(
    () => Object.fromEntries((ret?.items ?? []).map((i) => [i.original_item_id, num(i.return_qty)])) as Record<number, number>,
    [ret],
  );

  const [qty, setQty]           = useState<Record<number, number>>(ownQty);
  const [kind, setKind]         = useState<PurchaseReturnKind>(ret?.return.return_type ?? "PURCHASE_RETURN");
  const [reason, setReason]     = useState(ret?.return.return_reason ?? "");
  const [settlement, setSettle] = useState<string>(ret?.return.refund_type ?? SETTLEMENTS[kind][0]);
  const [notes, setNotes]       = useState(ret?.return.notes ?? "");
  // Optional: the vendor handed the money back at this moment (create only)
  const [refundNow, setRefundNow] = useState(false);
  const [rfAmount, setRfAmount]   = useState("");
  const [rfMode, setRfMode]       = useState<string>(PURCHASE_REFUND_MODES[0]);
  const [rfRef, setRfRef]         = useState("");
  const [rfDate, setRfDate]       = useState(todayStr());

  // A return can't be dated before the purchase it was raised against.
  const minReturnDate = useMemo(() => toDateInputValue(data.purchase_date), [data.purchase_date]);
  const { date: returnDate, setDate: setReturnDate, valid: returnDateValid } = useReturnDate(
    minReturnDate,
    toDateInputValue(ret?.return.return_date_fmt),
  );
  // The refund can't predate the return either.
  const refundDate = rfDate < returnDate ? returnDate : rfDate;

  const createReturn = useCreatePurchaseReturn();
  const updateReturn = useUpdatePurchaseReturn(editReturn?.return_uuid ?? "");
  const submitting   = createReturn.isPending || updateReturn.isPending;

  const lines = useMemo(() => data.items.map((it) => toLine(it, ownQty[it.purchase_item_id] ?? 0)), [data, ownQty]);

  const onQty = useCallback((id: number, v: number) => setQty((q) => ({ ...q, [id]: v })), []);
  const onToggle = useCallback((id: number, available: number) =>
    setQty((q) => ({ ...q, [id]: q[id] > 0 ? 0 : Math.min(1, available) })), []);

  const selectable    = useMemo(() => lines.filter((l) => l.available > 0), [lines]);
  const selectedLines = useMemo(() => lines.filter((l) => (qty[l.id] ?? 0) > 0), [lines, qty]);
  const allSelected   = selectable.length > 0 && selectable.every((l) => (qty[l.id] ?? 0) > 0);
  const someSelected  = selectedLines.length > 0;

  const toggleAll = () =>
    setQty(allSelected ? {} : Object.fromEntries(selectable.map((l) => [l.id, qty[l.id] > 0 ? qty[l.id] : l.available])));

  const totals = useMemo(() => {
    let taxable = 0, tax = 0;
    for (const l of selectedLines) {
      const amount = (qty[l.id] ?? 0) * l.price;
      taxable += amount;
      tax += amount * l.gst / 100;
    }
    return { taxable, tax, total: taxable + tax };
  }, [selectedLines, qty]);

  // What this return does to the money. The invoice shrinks by the return total; anything already paid
  // beyond the new invoice value comes back from the supplier, the rest just lowers the balance due.
  const payment = useMemo(() => {
    const earlierReturns = num(data.total_returned) - (ret?.summary.return_total ?? 0);
    const invoiceTotal   = Math.max(0, num(data.total_amount) - earlierReturns);
    const paid           = num(data.paid_amount);
    const newTotal       = Math.max(0, invoiceTotal - totals.total);
    return {
      invoiceTotal, paid,
      balanceBefore: Math.max(0, invoiceTotal - paid),
      newTotal,
      balanceAfter:  Math.max(0, newTotal - paid),
      refundable:    Math.max(0, paid - newTotal),
    };
  }, [data, ret, totals.total]);

  const changeKind = (k: PurchaseReturnKind) => {
    setKind(k);
    setSettle(SETTLEMENTS[k][0]);
  };

  const refundValue = rfAmount.trim() ? parseFloat(rfAmount) : payment.refundable;
  const refundValid = !refundNow || (refundValue > 0 && refundValue <= payment.refundable + 0.001);
  const showRefundNow = !isEdit && payment.refundable > 0 && someSelected;

  const canSubmit = someSelected && !!reason && !!settlement && returnDateValid && refundValid && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    const body = {
      return_type:   kind,
      return_reason: reason,
      return_date:   returnDate,
      refund_type:   settlement,
      notes:         notes.trim() || null,
      items:         selectedLines.map((l) => ({ original_item_id: l.id, return_qty: qty[l.id] })),
    };
    try {
      if (isEdit) {
        const res = await updateReturn.mutateAsync(body);
        notify(num(res.excess_refund) > 0 ? `${res.return_id} updated — ₹${INR(num(res.excess_refund))} refunded in excess` : `${res.return_id} updated`);
      } else {
        const res = await createReturn.mutateAsync({
          ...body,
          original_purchase_id: data.purchase_id,
          ...(showRefundNow && refundNow && {
            refund_payment: {
              amount: refundValue, payment_mode: rfMode,
              ...(rfRef.trim() && { reference_no: rfRef.trim() }),
              refund_date: refundDate,
            },
          }),
        });
        notify(`${res.return_id} created`);
      }
      onClose();
    } catch (err) {
      notify(purchaseApiError(err, isEdit ? "Failed to update the return" : "Failed to create the return"), "error");
    }
  };

  const docName = kind === "DEBIT_NOTE" ? "Debit Note" : "Purchase Return";

  return (
    <>
      <Header
        title={isEdit ? `Edit ${editReturn.return_id}` : "Process Purchase Return / Debit Note"}
        subtitle={isEdit ? "Change the returned items, quantities or details." : "Select items and process as Purchase Return or Debit Note."}
        onClose={onClose}
      />

      {/* Sections keep their natural height; without flexShrink:0 the overflow:hidden items box collapses to 0 in a short window */}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: 3, py: 2.5, display: "flex", flexDirection: "column", gap: 2.5, "& > *": { flexShrink: 0 } }}>
        {/* Context strip */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr 1.4fr" }, gap: 2, alignItems: "end" }}>
          {[
            { label: "Purchase Invoice No.", value: data.invoice_bill_no || data.purchase_id },
            { label: "Supplier Name",        value: data.vendor_name ?? data.company_name ?? "—" },
            { label: "Invoice Date",         value: fmtDate(data.purchase_date) },
          ].map(({ label, value }) => (
            <Box key={label} sx={{ pb: 1, borderBottom: "1px solid #EEF2F7" }}>
              <Typography sx={{ fontSize: 13, color: "#64748B", mb: 0.5 }}>{label}</Typography>
              <Typography noWrap sx={{ fontSize: 15, fontWeight: 800, color: "#0F172A" }}>{value}</Typography>
            </Box>
          ))}
          <Box>
            <Typography sx={{ fontSize: 13, color: "#64748B", mb: 0.75 }}>Transaction Type</Typography>
            <Box role="radiogroup" sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.25 }}>
              {KIND_CARDS.map((c) => {
                const on = kind === c.kind;
                return (
                  <Box key={c.kind} role="radio" aria-checked={on} tabIndex={0} onClick={() => changeKind(c.kind)}
                    onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); changeKind(c.kind); } }}
                    sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.5, py: 1.1, borderRadius: "10px", cursor: "pointer", userSelect: "none", border: `1.5px solid ${on ? ACCENT : "#E2E8F0"}`, bgcolor: on ? alpha(ACCENT, 0.05) : "#fff", color: on ? ACCENT : "#475569", transition: "all .12s", "&:hover": { borderColor: on ? ACCENT : "#CBD5E1" }, "&:focus-visible": { outline: `2px solid ${alpha(ACCENT, 0.4)}` } }}>
                    {c.icon}
                    <Typography sx={{ flex: 1, fontSize: 13.5, fontWeight: 700, color: "inherit", whiteSpace: "nowrap" }}>{c.label}</Typography>
                    <Box sx={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${on ? ACCENT : "#CBD5E1"}`, display: "grid", placeItems: "center" }}>
                      {on && <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: ACCENT }} />}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>

        {/* Items */}
        <Box sx={{ border: "1px solid #E2E8F0", borderRadius: "12px", overflow: "hidden" }}>
          <Box sx={{ overflowX: "auto" }}>
            <Box sx={{ minWidth: 860 }}>
              <Box sx={{ display: "grid", gridTemplateColumns: GRID, alignItems: "center", px: 1, py: 1.1, bgcolor: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                <Checkbox size="small" checked={allSelected} indeterminate={someSelected && !allSelected} disabled={selectable.length === 0} onChange={toggleAll} sx={{ color: "#CBD5E1", "&.Mui-checked, &.MuiCheckbox-indeterminate": { color: ACCENT } }} inputProps={{ "aria-label": "Select all" }} />
                <Typography sx={HEAD}>Item Details</Typography>
                <Typography sx={{ ...HEAD, textAlign: "center" }}>Qty Original</Typography>
                <Typography sx={{ ...HEAD, textAlign: "center" }}>Returned / Debited</Typography>
                <Typography sx={{ ...HEAD, textAlign: "center" }}>Available</Typography>
                <Typography sx={{ ...HEAD, textAlign: "center" }}>Return/Debit Qty</Typography>
                <Typography sx={{ ...HEAD, textAlign: "right" }}>Unit Price (₹)</Typography>
                <Typography sx={{ ...HEAD, textAlign: "right", pr: 1 }}>Amount (₹)</Typography>
              </Box>
              <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
                {lines.length === 0 ? (
                  <Typography sx={{ py: 5, textAlign: "center", fontSize: 13.5, color: "#94A3B8" }}>This purchase has no items to return.</Typography>
                ) : lines.map((l) => (
                  <ItemRow key={l.id} line={l} qty={qty[l.id] ?? 0} onQty={onQty} onToggle={onToggle} />
                ))}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Reason / type / date */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 2.5, alignItems: "start" }}>
          <Field label="Reason" required>
            <Select fullWidth displayEmpty value={reason} onChange={(e) => setReason(e.target.value)} sx={selectSx}
              renderValue={(v) => v || <Box component="span" sx={{ color: "#94A3B8" }}>Select a reason</Box>}>
              {withValue(REASONS, reason).map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </Select>
          </Field>
          <Field label={kind === "DEBIT_NOTE" ? "Debit Type" : "Return Type"} required>
            <Select fullWidth value={settlement} onChange={(e) => setSettle(e.target.value)} sx={selectSx}>
              {withValue(SETTLEMENTS[kind], settlement).map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </Field>
          <Field label={kind === "DEBIT_NOTE" ? "Debit Note Date" : "Return Date"} required>
            <ReturnDateInput value={returnDate} onChange={setReturnDate} minDate={minReturnDate}
              sx={{ "& .MuiOutlinedInput-root": { height: 44, borderRadius: "10px", fontSize: 14, bgcolor: "#fff", "& fieldset": { borderColor: "#E2E8F0" } } }} />
          </Field>
        </Box>

        <Field label="Internal Note (Optional)">
          <TextField fullWidth multiline minRows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Add specific details about the return/debit note, photos received, or manager approval..."
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: 14, bgcolor: "#fff", "& fieldset": { borderColor: "#E2E8F0" } } }} />
        </Field>

        {/* Payment summary */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
          <SummaryCard title={`${docName} value`}>
            <SummaryRow label="Taxable Amount" value={totals.taxable} />
            <SummaryRow label="GST" value={totals.tax} />
            <SummaryRow label={`${docName} Total`} value={totals.total} strong color={ACCENT} />
          </SummaryCard>
          <SummaryCard title="Payment summary">
            <SummaryRow label="Invoice Total" value={payment.invoiceTotal} />
            <SummaryRow label="Paid to Supplier" value={payment.paid} color="#16A34A" />
            <SummaryRow label="Balance Due (before)" value={payment.balanceBefore} />
            {someSelected && <SummaryRow label="Less: this return" value={-totals.total} color={ACCENT} />}
            <SummaryRow label="Balance Due (after)" value={payment.balanceAfter} strong color={payment.balanceAfter > 0 ? "#D97706" : "#0F172A"} />
            {payment.refundable > 0 && <SummaryRow label="Refundable by Supplier" value={payment.refundable} strong color="#0369A1" />}
          </SummaryCard>
        </Box>

        {/* Vendor refunded at once (create only, and only when money is actually owed back) */}
        {showRefundNow && (
          <Box sx={{ border: "1px solid #BAE6FD", bgcolor: "#F0F9FF", borderRadius: "12px", p: 2 }}>
            <Box onClick={() => setRefundNow((v) => !v)} sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer", userSelect: "none" }}>
              <Checkbox size="small" checked={refundNow} sx={{ p: 0.5, "&.Mui-checked": { color: "#0369A1" } }} inputProps={{ "aria-label": "Supplier refunded now" }} />
              <Box>
                <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#0C4A6E" }}>Supplier has refunded ₹{INR(payment.refundable)} now</Typography>
                <Typography sx={{ fontSize: 12, color: "#0369A1" }}>Leave unticked to record the refund later with Mark Refund.</Typography>
              </Box>
            </Box>
            <Collapse in={refundNow} unmountOnExit>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" }, gap: 1.5, mt: 1.5 }}>
                <TextField size="small" label="Amount (₹)" type="number" value={rfAmount} placeholder={String(payment.refundable)}
                  error={refundNow && !refundValid} helperText={refundNow && !refundValid ? `Up to ₹${INR(payment.refundable)}` : undefined}
                  onChange={(e) => setRfAmount(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ bgcolor: "#fff" }} />
                <Select size="small" value={rfMode} onChange={(e) => setRfMode(e.target.value)} sx={{ bgcolor: "#fff" }}>
                  {PURCHASE_REFUND_MODES.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                </Select>
                <TextField size="small" label="Reference No." value={rfRef} onChange={(e) => setRfRef(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ bgcolor: "#fff" }} />
                <TextField size="small" label="Refund Date" type="date" value={refundDate} onChange={(e) => setRfDate(e.target.value)}
                  inputProps={{ min: returnDate }} InputLabelProps={{ shrink: true }} sx={{ bgcolor: "#fff" }} />
              </Box>
            </Collapse>
          </Box>
        )}

      </Box>

      {/* Footer */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 2, flexWrap: "wrap", px: 3, py: 2, bgcolor: "#F8FAFC", borderTop: "1px solid #EEF2F7" }}>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button variant="outlined" onClick={onClose} disabled={submitting}
            sx={{ borderRadius: "10px", px: 3, py: 1.1, borderColor: "#E2E8F0", bgcolor: "#fff", color: "#0F172A", fontWeight: 700 }}>
            Cancel
          </Button>
          <Button variant="contained" disableElevation disabled={!canSubmit} onClick={submit}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <DescriptionOutlinedIcon />}
            sx={{ borderRadius: "10px", px: 4, py: 1.1, bgcolor: ACCENT, fontWeight: 700, boxShadow: "0 8px 20px -6px rgba(211,47,47,0.5)", "&:hover": { bgcolor: "#B71C1C" }, "&.Mui-disabled": { bgcolor: "#E2E8F0", color: "#94A3B8", boxShadow: "none" } }}>
            {submitting ? "Saving…" : isEdit ? "Save Changes" : "Process"}
          </Button>
        </Box>
      </Box>
    </>
  );
}

/** Loads what the form needs, then mounts it. Mounted only while open, so every open starts clean. */
function Body({ target, onClose, notify }: { target: PurchaseReturnTarget } & Pick<Props, "onClose" | "notify">) {
  const purchase = usePurchaseById(target.purchaseId);
  const editUuid = target.editReturn?.return_uuid;
  const ret      = usePurchaseReturnDetail(editUuid);

  if (purchase.data && (!editUuid || ret.data)) {
    return <Form data={purchase.data} ret={ret.data} editReturn={target.editReturn} onClose={onClose} notify={notify} />;
  }

  const failed = purchase.isError || ret.isError;
  return (
    <>
      <Header title="Process Purchase Return / Debit Note" subtitle="Select items and process as Purchase Return or Debit Note." onClose={onClose} />
      <Box sx={{ p: 3 }}>
        {failed ? (
          <Typography sx={{ py: 6, textAlign: "center", fontSize: 14, color: "#DC2626" }}>Couldn't load this purchase. Please close and try again.</Typography>
        ) : (
          [0, 1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={i === 0 ? 56 : 48} sx={{ mb: 1.5 }} />)
        )}
      </Box>
    </>
  );
}

export default function PurchaseReturnDialog({ target, onClose, notify }: Props) {
  return (
    <Dialog open={!!target} onClose={onClose} maxWidth="lg" fullWidth
      PaperProps={{ sx: { borderRadius: "16px", maxHeight: "94vh", display: "flex", flexDirection: "column", overflow: "hidden" } }}>
      {target && <Body key={`${target.purchaseId}:${target.editReturn?.return_uuid ?? "new"}`} target={target} onClose={onClose} notify={notify} />}
    </Dialog>
  );
}
