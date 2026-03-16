/**
 * dialogHelpers.tsx
 * Shared mini-components and the INR formatter used across all three
 * invoice dialogs (InvoiceDetailDialog, MarkPaymentDialog, SalesReturnDialog).
 */
import { TableCell, Typography } from "@mui/material";

// ─── Currency formatter ────────────────────────────────────────────────────
export const INR = (v: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(v);

// ─── Table header cell ─────────────────────────────────────────────────────
export function IHCell({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right" | "center";
}) {
  return (
    <TableCell
      align={align}
      sx={{
        bgcolor: "#F8FAFC",
        fontSize: "0.7rem",
        fontWeight: 700,
        letterSpacing: "0.06em",
        color: "#64748B",
        textTransform: "uppercase",
        borderBottom: "1px solid #E2E8F0",
        py: 1.5,
        px: 2,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </TableCell>
  );
}

// ─── Table body cell ───────────────────────────────────────────────────────
export function IBCell({
  children,
  align = "left",
  bold = false,
  primary = false,
  mono = false,
  muted = false,
}: {
  children: React.ReactNode;
  align?: "left" | "right" | "center";
  bold?: boolean;
  primary?: boolean;
  mono?: boolean;
  muted?: boolean;
}) {
  return (
    <TableCell
      align={align}
      sx={{
        fontSize: "0.875rem",
        fontWeight: bold ? 700 : 500,
        color: primary ? "#D0021B" : muted ? "#94A3B8" : "#0F172A",
        fontFamily: mono ? "monospace" : "inherit",
        borderBottom: "1px solid #F1F5F9",
        py: 1.75,
        px: 2,
      }}
    >
      {children}
    </TableCell>
  );
}

// ─── Section heading ("ITEMS LIST", "HSN-WISE TAX BREAKDOWN", …) ──────────
export function SectionHeading({ text }: { text: string }) {
  return (
    <Typography
      sx={{
        fontSize: "0.75rem",
        fontWeight: 700,
        letterSpacing: "0.12em",
        color: "#94A3B8",
        textTransform: "uppercase",
        mb: 1.5,
        px: 0.5,
      }}
    >
      {text}
    </Typography>
  );
}