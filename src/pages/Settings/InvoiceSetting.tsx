import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import LocalPrintshopOutlinedIcon from "@mui/icons-material/LocalPrintshopOutlined";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import SubjectRoundedIcon from "@mui/icons-material/SubjectRounded";
import FormatListNumberedRoundedIcon from "@mui/icons-material/FormatListNumberedRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";
import BorderColorOutlinedIcon from "@mui/icons-material/BorderColorOutlined";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import SuccessToast from "@components/Common/SuccessToast";
import { useAppDispatch, useAppSelector } from "@store/store";
import { BusinessType, setInvoiceSettings } from "@store/slices/userSlice";
import {
  useInvoiceSettings,
  useUpdateInvoiceSettings,
  useUploadInvoiceSignature,
  useDeleteInvoiceSignature,
  type InvoiceSettingsResponse,
  type UpdateInvoiceSettingsPayload,
} from "./useInvoiceSettingApi";
import { ThermalInvoiceTemplate, type ThermalPaperSize } from "../SalesHistory/ThermalInvoiceTemplate";
import { InvoicePDFTemplate } from "../SalesHistory/InvoicePDFTemplate";
import { InvoicePDFTemplateModern } from "../SalesHistory/InvoicePDFTemplateModern";
import { numberToWords } from "@utils/numberToWords";

// ── Sample data for the live receipt preview — never sent anywhere, just
// rendered locally so toggling an element shows its effect immediately.
const PREVIEW_ITEMS = [
  { item_id: "SKU-001", name: "Sample Product A", description: "Sample item description", hsn: "1234", qty: 2, mrp: 275, rate: 250, tax: 5, total: 500 },
  { item_id: "SKU-002", name: "Sample Product B", description: "", hsn: "5678", qty: 1, mrp: 800, rate: 750, tax: 5, total: 750 },
  { item_id: "SKU-003", name: "Sample Product C", description: "", hsn: "9012", qty: 3, mrp: 100, rate: 90, tax: 5, total: 270 },
];
const PREVIEW_SUBTOTAL = PREVIEW_ITEMS.reduce((sum, item) => sum + item.total, 0);
const PREVIEW_DISCOUNT = Math.round(PREVIEW_SUBTOTAL * 0.1);
const PREVIEW_TAXABLE = PREVIEW_SUBTOTAL - PREVIEW_DISCOUNT;
const PREVIEW_CGST_RATE = 2.5;
const PREVIEW_SGST_RATE = 2.5;
const PREVIEW_CGST_AMT = Math.round(PREVIEW_TAXABLE * PREVIEW_CGST_RATE) / 100;
const PREVIEW_SGST_AMT = PREVIEW_CGST_AMT;
const PREVIEW_GRAND_TOTAL = PREVIEW_TAXABLE + PREVIEW_CGST_AMT + PREVIEW_SGST_AMT;
const PREVIEW_DATA = {
  sale_id: "PREVIEW-0001",
  date: new Date().toLocaleDateString("en-GB"),
  due_date: null,
  customer_name: "Sample Customer",
  customer_address: "123 Sample Street, Sample City",
  customer_mobile: "+91 98765 43210",
  customer_gstin: "22AAAAA0000A1Z5",
  payment_mode: "Cash",
  payment_status: "fully_paid",
  items: PREVIEW_ITEMS,
  subtotal: PREVIEW_SUBTOTAL,
  discount: PREVIEW_DISCOUNT,
  discount_label: "Discount (10%)",
  cgst: PREVIEW_CGST_AMT,
  sgst: PREVIEW_SGST_AMT,
  round_off: 0,
  total: PREVIEW_GRAND_TOTAL,
  grand_total: PREVIEW_GRAND_TOTAL,
  amount_in_words: `${numberToWords(Math.round(PREVIEW_GRAND_TOTAL))} Rupees Only`,
  gst_breakdown: [
    { hsn: "1234", cgstRate: PREVIEW_CGST_RATE, sgstRate: PREVIEW_SGST_RATE, cgstAmount: PREVIEW_CGST_AMT, sgstAmount: PREVIEW_SGST_AMT, taxable: PREVIEW_TAXABLE, totalTaxAmount: PREVIEW_CGST_AMT + PREVIEW_SGST_AMT },
  ],
};

const redTint = "#ca0022";
const headingText = "#1d2533";
const subtleText = "#8e95a3";
const cardBorder = "#ececf2";

// Accent color choices for the A4 invoice template (brand name, header divider, table header).
const INVOICE_COLORS = [
  "#111111", // black
  "#2E7D32", // green
  "#1565A8", // blue
  "#7B1FA2", // purple
  "#C62828", // red
  "#6C6FC4", // slate blue
  "#C9962B", // gold
  "#B5651D", // orange
];
const DEFAULT_INVOICE_COLOR = INVOICE_COLORS[4];
// Server contract: exactly 6 hex digits with a leading '#' — no shorthand, no alpha, no rgb().
const COLOR_HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;
// terms_conditions / notes: server cap is 2000 chars each.
const FREE_TEXT_MAX_LENGTH = 2000;

interface InvoiceSettings {
  defaultTax: string;
  invoiceDueDays: string;
  invoiceThemeColor: string;
  showCompanyLogo: boolean;
  defaultPaymentMethod: string;
  printInch: string;
  showItemDescription: boolean;
  showItemId: boolean;
  showSerialNo: boolean;
  showCustomerDetails: boolean;
  showTaxDetails: boolean;
  showPaymentDetails: boolean;
  showTermsConditions: boolean;
  termsConditionsText: string;
  showNotes: boolean;
  notesText: string;
  showSignature: boolean;
  showBankDetails: boolean;
  invoiceTemplate: string;
}

interface SettingRowProps {
  icon: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  label: string;
  description: string;
  children: React.ReactNode;
}

function SettingRow({ icon, iconBg = "#fdecef", iconColor = redTint, label, description, children }: SettingRowProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        py: 2,
        flexWrap: { xs: "wrap", sm: "nowrap" },
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
            bgcolor: iconBg,
            color: iconColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText }}>
            {label}
          </Typography>
          <Typography sx={{ fontSize: 12, color: subtleText, mt: 0.3 }}>
            {description}
          </Typography>
        </Box>
      </Stack>
      <Box sx={{ flexShrink: 0, minWidth: { xs: "100%", sm: 220 } }}>
        {children}
      </Box>
    </Box>
  );
}

interface SectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

function Section({ title, subtitle, children }: SectionProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 1,
        border: "1px solid",
        borderColor: cardBorder,
        bgcolor: "#fff",
        overflow: "hidden",
      }}
    >
      <Box sx={{ px: { xs: 2, md: 2.5 }, pt: 2, pb: 1 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 800, color: headingText, letterSpacing: 0.2 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ fontSize: 12, color: subtleText, mt: 0.3 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      <Divider sx={{ borderColor: "#f4f5f8" }} />
      <Box sx={{ px: { xs: 2, md: 2.5 } }}>
        {children}
      </Box>
    </Paper>
  );
}

// Paper-size choices shown as selectable cards at the top of the settings
// column — the printed layout depends on this, so it reads better as a visual
// pick than as a dropdown buried inside "Print Layout".
const TEMPLATE_TYPES = [
  { value: "A4", label: "A4 Template", caption: "210 x 297 mm", icon: "doc" as const },
  { value: "3", label: "3 inch Thermal Printer", caption: "72 mm width", icon: "printer" as const },
  { value: "5", label: "5 inch Thermal Printer", caption: "120 mm width", icon: "printer" as const },
];

function TemplateTypeCard({
  label, caption, icon, selected, onSelect,
}: {
  label: string; caption: string; icon: "doc" | "printer"; selected: boolean; onSelect: () => void;
}) {
  return (
    <Box
      onClick={onSelect}
      role="button"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        cursor: "pointer",
        border: "2px solid",
        borderColor: selected ? redTint : cardBorder,
        borderRadius: 1.5,
        px: 1.5,
        py: 1.25,
        bgcolor: selected ? "#fdf1f2" : "#fff",
        transition: "border-color 0.15s ease, background-color 0.15s ease",
        "&:hover": { borderColor: selected ? redTint : "#c5c8d2" },
      }}
    >
      <Box
        sx={{
          width: 34,
          height: 34,
          flexShrink: 0,
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: selected ? "#fff" : "#f5f6fa",
          color: selected ? redTint : subtleText,
        }}
      >
        {icon === "doc"
          ? <DescriptionOutlinedIcon fontSize="small" />
          : <LocalPrintshopOutlinedIcon fontSize="small" />}
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: headingText, lineHeight: 1.3 }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: 11.5, color: subtleText, mt: 0.2 }}>
          {caption}
        </Typography>
      </Box>

      <Box
        sx={{
          width: 18,
          height: 18,
          flexShrink: 0,
          borderRadius: 0.6,
          border: "1.5px solid",
          borderColor: selected ? redTint : "#cfd2db",
          bgcolor: selected ? redTint : "#fff",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {selected && <CheckRoundedIcon sx={{ fontSize: 13 }} />}
      </Box>
    </Box>
  );
}

function ThemeCard({
  label, description, variant, selected, onSelect,
}: {
  label: string; description: string; variant: "compact" | "classic"; selected: boolean; onSelect: () => void;
}) {
  const lines = variant === "compact"
    ? [78, 60, 88, 66, 82, 56, 90]
    : [70, 50, 74, 58];

  return (
    <Box
      onClick={onSelect}
      sx={{
        flex: 1,
        cursor: "pointer",
        position: "relative",
        border: "2px solid",
        borderColor: selected ? redTint : cardBorder,
        borderRadius: 1.5,
        p: 1.5,
        bgcolor: selected ? "#fdf1f2" : "#fff",
        transition: "border-color 0.15s ease",
        "&:hover": { borderColor: selected ? redTint : "#c5c8d2" },
      }}
    >
      {selected && (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 18,
            height: 18,
            borderRadius: "50%",
            bgcolor: redTint,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CheckRoundedIcon sx={{ fontSize: 13 }} />
        </Box>
      )}
      <Box
        sx={{
          height: 84,
          bgcolor: "#fafbfc",
          border: "1px solid #eef0f4",
          borderRadius: 1,
          p: 1.25,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: variant === "compact" ? "3px" : "7px",
        }}
      >
        <Box sx={{ width: "55%", height: 6, bgcolor: "#b8bcc4", borderRadius: 0.5, mx: "auto", mb: variant === "compact" ? 0.4 : 0.8 }} />
        {lines.map((w, i) => (
          <Box key={i} sx={{ width: `${w}%`, height: 4, bgcolor: "#dfe2e7", borderRadius: 0.5 }} />
        ))}
      </Box>
      <Typography sx={{ mt: 1, fontSize: 13, fontWeight: 700, color: headingText }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 11, color: subtleText, mt: 0.2 }}>
        {description}
      </Typography>
    </Box>
  );
}

function ImageUploadSlot({
  label, description, imageUrl, uploading, shape = "square", compact = false, onUpload, onRemove,
}: {
  label: string; description: string; imageUrl: string; uploading: boolean;
  shape?: "square" | "banner"; compact?: boolean; onUpload: (file: File) => void; onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file (JPG, PNG, etc.).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be below 2MB.");
      return;
    }
    onUpload(file);
  };

  return (
    <Box sx={compact ? { width: "100%" } : { flex: 1, minWidth: 200 }}>
      {!compact && (
        <>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: headingText }}>{label}</Typography>
          <Typography sx={{ fontSize: 11.5, color: subtleText, mt: 0.2, mb: 1 }}>{description}</Typography>
        </>
      )}

      <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFile} />

      <Box
        onClick={() => !uploading && inputRef.current?.click()}
        sx={{
          position: "relative",
          height: compact ? (shape === "banner" ? 84 : 56) : shape === "banner" ? 84 : 100,
          border: "2px dashed",
          borderColor: cardBorder,
          borderRadius: 1.5,
          bgcolor: "#fafbfc",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: uploading ? "default" : "pointer",
          overflow: "hidden",
          "&:hover": { borderColor: uploading ? cardBorder : "#c5c8d2" },
        }}
      >
        {uploading ? (
          <CircularProgress size={22} sx={{ color: redTint }} />
        ) : imageUrl ? (
          <>
            <Box
              component="img"
              src={imageUrl}
              alt={label}
              sx={{
                maxHeight: "100%",
                maxWidth: "100%",
                objectFit: "contain",
              }}
            />
            <Box
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              sx={{
                position: "absolute",
                top: 4,
                right: 4,
                width: 20,
                height: 20,
                borderRadius: "50%",
                bgcolor: "rgba(0,0,0,0.55)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "&:hover": { bgcolor: "rgba(0,0,0,0.75)" },
              }}
            >
              <CloseRoundedIcon sx={{ fontSize: 13 }} />
            </Box>
          </>
        ) : (
          <>
            <CloudUploadOutlinedIcon sx={{ fontSize: 24, color: "#a5adba" }} />
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#8e95a3", mt: 0.5 }}>
              Click to upload
            </Typography>
            <Typography sx={{ fontSize: 10.5, color: "#b0b7c4" }}>PNG/JPG, up to 2MB</Typography>
          </>
        )}
      </Box>
    </Box>
  );
}

const TAX_LABEL_TO_CODE: Record<string, string> = {
  "GST 5%": "GST5",
  "GST 12%": "GST12",
  "GST 18%": "GST18",
  "GST 28%": "GST28",
  "None": "none",
};
const TAX_CODE_TO_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(TAX_LABEL_TO_CODE).map(([label, code]) => [code, label])
);

const PAYMENT_METHOD_TO_CODE: Record<string, string> = {
  Cash: "cash",
  Card: "card",
  UPI: "upi",
  QR: "qr",
  "Bank Transfer": "bank_transfer",
  Others: "others",
};
const PAYMENT_CODE_TO_METHOD: Record<string, string> = Object.fromEntries(
  Object.entries(PAYMENT_METHOD_TO_CODE).map(([label, code]) => [code, label])
);

function toUiSettings(api: InvoiceSettingsResponse): InvoiceSettings {
  return {
    defaultTax: TAX_LABEL_TO_CODE[api.default_tax_label] ?? "GST18",
    invoiceDueDays: String(api.invoice_due_days),
    // Server normalizes to uppercase and only ever stores a valid #RRGGBB —
    // but older rows may predate this field, so fall back to the UI default.
    invoiceThemeColor: api.invoice_theme_color && COLOR_HEX_REGEX.test(api.invoice_theme_color)
      ? api.invoice_theme_color
      : DEFAULT_INVOICE_COLOR,
    showCompanyLogo: api.show_company_logo,
    defaultPaymentMethod: PAYMENT_METHOD_TO_CODE[api.default_payment_method] ?? "cash",
    printInch: api.printer_inch === "A4" ? "A4" : api.printer_inch.startsWith("5") ? "5" : "3",
    showItemDescription: api.show_description,
    showItemId: api.show_item_id,
    // Older rows predate this field — default to on, matching the prior
    // always-shown behavior before the toggle existed.
    showSerialNo: api.show_serial_no ?? true,
    showCustomerDetails: api.show_customer_details ?? true,
    showTaxDetails: api.show_tax_details ?? true,
    showPaymentDetails: api.show_payment_details ?? false,
    showTermsConditions: api.show_terms_conditions ?? false,
    termsConditionsText: api.terms_conditions ?? "",
    showNotes: api.show_notes ?? false,
    notesText: api.notes ?? "",
    showSignature: api.show_signature ?? false,
    showBankDetails: api.show_bank_details ?? true,
    invoiceTemplate: api.invoice_template === "modern" ? "modern" : "classic",
  };
}

function toApiPayload(ui: InvoiceSettings): UpdateInvoiceSettingsPayload {
  return {
    default_tax_label: TAX_CODE_TO_LABEL[ui.defaultTax] ?? ui.defaultTax,
    invoice_due_days: parseInt(ui.invoiceDueDays, 10) || 0,
    default_payment_method: PAYMENT_CODE_TO_METHOD[ui.defaultPaymentMethod] ?? ui.defaultPaymentMethod,
    printer_inch: ui.printInch === "A4" ? "A4" : `${ui.printInch} Inch`,
    invoice_theme_color: ui.invoiceThemeColor,
    show_company_logo: ui.showCompanyLogo,
    show_description: ui.showItemDescription,
    show_item_id: ui.showItemId,
    show_serial_no: ui.showSerialNo,
    show_customer_details: ui.showCustomerDetails,
    show_tax_details: ui.showTaxDetails,
    show_payment_details: ui.showPaymentDetails,
    show_terms_conditions: ui.showTermsConditions,
    terms_conditions: ui.termsConditionsText,
    show_notes: ui.showNotes,
    notes: ui.notesText,
    show_signature: ui.showSignature,
    show_bank_details: ui.showBankDetails,
    invoice_template: ui.invoiceTemplate,
  };
}

function getDefaultSettings(businessType: string): InvoiceSettings {
  return {
    defaultTax: "GST18",
    invoiceDueDays: "15",
    invoiceThemeColor: DEFAULT_INVOICE_COLOR,
    showCompanyLogo: true,
    defaultPaymentMethod: "cash",
    printInch: businessType === "Restaurant" ? "3" : "A4",
    showItemDescription: false,
    showItemId: false,
    showSerialNo: true,
    showCustomerDetails: true,
    showTaxDetails: true,
    showPaymentDetails: false,
    showTermsConditions: false,
    termsConditionsText: "",
    showNotes: false,
    notesText: "",
    showSignature: false,
    showBankDetails: true,
    invoiceTemplate: "classic",
  };
}

export default function InvoiceSetting() {
  const dispatch = useAppDispatch();
  const businessType = useAppSelector(BusinessType);

  const [settings, setSettings] = useState<InvoiceSettings>(() => getDefaultSettings(businessType));
  // Last-loaded-or-saved snapshot — diffed against `settings` at save time so
  // the PUT only sends fields the user actually changed (server has no
  // stripUnknown and validates the full body per-field, but more importantly
  // the spec calls for a true partial update: saving only a color touch
  // should only send that one key). Null until the first successful GET.
  const baselineRef = useRef<InvoiceSettings | null>(null);
  // Preview-only visual density — not persisted to the backend yet.
  const [theme, setTheme] = useState<"compact" | "classic">("classic");
  // Logo/header images aren't part of the invoice-settings schema (no upload
  // field exists on that API) — these stay local/preview-only, same as the
  // still-disabled Company Logo & Header upload UI above. The signature
  // image is backed by the API (see below).
  const [companyLogoUrl] = useState("");
  const [headerImageUrl] = useState("");
  const [signatureUrl, setSignatureUrl] = useState("");
  const [saved, setSaved] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data, isLoading, isError } = useInvoiceSettings();

  useEffect(() => {
    if (data) {
      const ui = toUiSettings(data);
      // Capture the prior baseline *before* it's overwritten below — the
      // setSettings updater runs after this effect returns, so reading
      // baselineRef.current from inside it would see the new value we're
      // about to assign, not the one it should be diffed against.
      const previousBaseline = baselineRef.current;
      // Merge rather than overwrite: uploading/removing a signature refreshes
      // this same query-cache entry mid-edit, and a blind overwrite here was
      // reverting any toggle the user had changed but not yet saved — e.g.
      // switching "Authorized Signature" on right before uploading the image
      // snapped it back off as soon as the upload's response landed.
      setSettings((prev) => {
        if (!previousBaseline) return ui;
        // Built via fromEntries rather than indexed assignment on a typed
        // object — TS can't verify a `merged[key] = prev[key]` write is safe
        // when `key` is a union of every settings key, even though it is.
        return Object.fromEntries(
          (Object.keys(ui) as Array<keyof InvoiceSettings>).map((key) => [
            key,
            prev[key] !== previousBaseline[key] ? prev[key] : ui[key],
          ])
        ) as unknown as InvoiceSettings;
      });
      baselineRef.current = ui;
      setSignatureUrl(data.signature_url ?? "");
    }
  }, [data]);

  const { mutate: uploadSignature, isPending: signatureUploading } = useUploadInvoiceSignature({
    onSuccess: (updated) => {
      setSignatureUrl(updated.signature_url ?? "");
      // Real invoices (POS, sale history) read the signature from Redux, not
      // this page's query cache — without this dispatch the new image would
      // only show up after the next login/branch switch.
      dispatch(setInvoiceSettings(updated));
    },
    onError: () => setErrorMsg("Failed to upload signature. Please try again."),
  });

  const { mutate: removeSignature, isPending: signatureDeleting } = useDeleteInvoiceSignature({
    onSuccess: (updated) => {
      setSignatureUrl("");
      dispatch(setInvoiceSettings(updated));
    },
    onError: () => setErrorMsg("Failed to remove signature. Please try again."),
  });

  useEffect(() => {
    if (isError) setErrorMsg("Failed to load invoice settings. Please refresh the page.");
  }, [isError]);

  const { mutate: saveSettings, isPending: isSaving } = useUpdateInvoiceSettings({
    onSuccess: (updated) => {
      // Re-sync local form state from the save response directly rather than
      // waiting on the query-cache round trip (the useEffect below) — a stale
      // in-flight GET can otherwise resolve after this PUT and overwrite the
      // cache with pre-save data, which silently reverted fields (e.g. Invoice
      // Type) back to their old value right after the "saved" toast appeared.
      const ui = toUiSettings(updated);
      setSettings(ui);
      baselineRef.current = ui;
      // POS reads printer_inch straight from Redux (populated once at branch-select)
      // to decide A4-vs-thermal print template — without this the change here would
      // only take effect after the next login/branch switch.
      dispatch(setInvoiceSettings(updated));
      setSaved(true);
      setSuccessMsg("Invoice settings updated successfully");
      setTimeout(() => setSaved(false), 2000);
    },
    onError: (msg) => setErrorMsg(msg),
  });

  const update = <K extends keyof InvoiceSettings>(key: K, value: InvoiceSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    const fullPayload = toApiPayload(settings);

    // No baseline yet (first-ever load failed, or this tenant has no row
    // yet) — nothing to diff against, so the upsert needs the full payload.
    if (!baselineRef.current) {
      saveSettings(fullPayload);
      return;
    }

    const baselinePayload = toApiPayload(baselineRef.current);
    const diff: UpdateInvoiceSettingsPayload = {};
    (Object.keys(fullPayload) as Array<keyof UpdateInvoiceSettingsPayload>).forEach((key) => {
      if (fullPayload[key] !== baselinePayload[key]) {
        (diff as Record<string, unknown>)[key] = fullPayload[key];
      }
    });

    if (Object.keys(diff).length === 0) {
      setSuccessMsg("No changes to save.");
      return;
    }

    saveSettings(diff);
  };

  // Draft settings for the live receipt preview — reflects unsaved toggle
  // changes immediately instead of waiting on a save round-trip.
  const previewSettingsOverride = {
    show_company_logo: settings.showCompanyLogo,
    show_tax_details: settings.showTaxDetails,
    show_description: settings.showItemDescription,
    show_item_id: settings.showItemId,
    show_serial_no: settings.showSerialNo,
    show_customer_details: settings.showCustomerDetails,
    show_payment_details: settings.showPaymentDetails,
    show_terms_conditions: settings.showTermsConditions,
    terms_conditions: settings.termsConditionsText,
    show_notes: settings.showNotes,
    notes: settings.notesText,
    show_signature: settings.showSignature,
    show_bank_details: settings.showBankDetails,
  };

  // Fit the preview to the panel's WIDTH only — keeps the receipt at a
  // clearly readable size regardless of how tall it gets; the panel scrolls
  // vertically instead of shrinking further to also fit the height.
  const previewViewportRef = useRef<HTMLDivElement | null>(null);
  const previewContentRef = useRef<HTMLDivElement | null>(null);
  const previewZoomRef = useRef(1);
  const [previewZoom, setPreviewZoom] = useState(1);

  useLayoutEffect(() => {
    const viewport = previewViewportRef.current;
    const content = previewContentRef.current;
    if (!viewport || !content) return;

    const fit = () => {
      const availableWidth = viewport.clientWidth;
      const rect = content.getBoundingClientRect();
      if (!availableWidth || !rect.width) return;

      const naturalWidth = rect.width / previewZoomRef.current;
      const fitted = Math.min(availableWidth / naturalWidth, 1);
      const clamped = Math.max(fitted, 0.25);

      if (Math.abs(clamped - previewZoomRef.current) > 0.004) {
        previewZoomRef.current = clamped;
        setPreviewZoom(clamped);
      }
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(viewport);
    observer.observe(content);
    return () => observer.disconnect();
  });

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress size={28} sx={{ color: redTint }} />
      </Box>
    );
  }

  return (
    <Box >
     

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.1fr 1fr" },
          gap: 2,
          alignItems: "start",
        }}
      >
        {/* Left Column — scrolls independently of the page; the Save bar
            sticks to the bottom of this scroll area only. */}
        <Box sx={{ minHeight: 0, height: { lg: "calc(100vh - 150px)" }, overflowY: { lg: "auto" }, pr: { lg: 0.5 } }}>
        <Stack spacing={2}>
           {/* <Box sx={{ mb: 2.5 }}>
        <Typography sx={{ fontSize: { xs: 22, md: 26 }, fontWeight: 800, color: headingText, lineHeight: 1.2 }}>
          Invoice settings
        </Typography>
        <Typography sx={{ mt: 0.5, fontSize: 13, color: subtleText }}>
          Manage invoice preferences, numbering rules, tax details and print layout.
        </Typography>
      </Box>

          <Section title="Invoice Theme" subtitle="Choose a visual style for your thermal and A4 invoices">
            <Box sx={{ display: "flex", gap: 1.5, py: 1.5 }}>
              <ThemeCard
                label="Classic"
                description="Logo, full GST summary and signature flourish"
                variant="classic"
                selected={theme === "classic"}
                onSelect={() => {
                  setTheme("classic");
                  update("showCompanyLogo", true);
                  update("showTaxDetails", true);
                }}
              />
              <ThemeCard
                label="Compact"
                description="Leaner receipt — no logo or GST breakdown"
                variant="compact"
                selected={theme === "compact"}
                onSelect={() => {
                  setTheme("compact");
                  update("showCompanyLogo", false);
                  update("showTaxDetails", false);
                }}
              />
            </Box>
          </Section> */}

          {/* Company Logo & Header — upload UI disabled for now; only the
              "Show Company Logo in Invoice" toggle below is active until this
              is wired up to persist logo/header images to the backend. */}
          {/* <Section title="Company Logo & Header" subtitle="Upload images to brand your invoices">
            <Box sx={{ display: "flex", gap: 2, py: 1.5, flexWrap: "wrap" }}>
              <ImageUploadSlot
                label="Company Logo"
                description="Square logo — shown on thermal receipts and A4 invoices"
                imageUrl={companyLogoUrl}
                uploading={companyLogoUploading}
                shape="square"
                onUpload={(file) => uploadInvoiceImage(file, setCompanyLogoUrl, setCompanyLogoUploading)}
                onRemove={() => setCompanyLogoUrl("")}
              />
              {settings.printInch === "A4" && (
                <ImageUploadSlot
                  label="Header Image"
                  description="Wide banner shown across the top of A4 invoices"
                  imageUrl={headerImageUrl}
                  uploading={headerImageUploading}
                  shape="banner"
                  onUpload={(file) => uploadInvoiceImage(file, setHeaderImageUrl, setHeaderImageUploading)}
                  onRemove={() => setHeaderImageUrl("")}
                />
              )}
            </Box>
          </Section> */}

          {/* Select Template Type — paper size lives above Print Layout so the
              choice that drives every other print option is picked first. */}
          <Section title="Select Template Type" subtitle="Select the print paper width">
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(auto-fit, minmax(210px, 1fr))" },
                gap: 1.5,
                py: 1.5,
              }}
            >
              {TEMPLATE_TYPES
                .filter((option) => !(option.value === "A4" && businessType === "Restaurant"))
                .map((option) => (
                  <TemplateTypeCard
                    key={option.value}
                    label={option.label}
                    caption={option.caption}
                    icon={option.icon}
                    selected={settings.printInch === option.value}
                    onSelect={() => update("printInch", option.value)}
                  />
                ))}
            </Box>
          </Section>

          {/* Print Layout */}
          <Section title="Print Layout" subtitle="Customize what appears on printed invoices">
            <SettingRow
              icon={<ImageOutlinedIcon fontSize="small" />}
              iconBg="#fff7ed"
              iconColor="#ea7a00"
              label="Show Company Logo in Invoice"
              description="Display company logo on printed invoice"
            >
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Switch
                  checked={settings.showCompanyLogo}
                  onChange={(e) => update("showCompanyLogo", e.target.checked)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: redTint },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: redTint },
                  }}
                />
              </Box>
            </SettingRow>

            <Divider sx={{ borderColor: "#f4f5f8" }} />

            <SettingRow
              icon={<SubjectRoundedIcon fontSize="small" />}
              iconBg="#eef4ff"
              iconColor="#2563eb"
              label="Show Item Description"
              description="Print each item's description below its name on the invoice"
            >
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Switch
                  checked={settings.showItemDescription}
                  onChange={(e) => update("showItemDescription", e.target.checked)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: redTint },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: redTint },
                  }}
                />
              </Box>
            </SettingRow>

            <Divider sx={{ borderColor: "#f4f5f8" }} />

            <SettingRow
              icon={<FormatListNumberedRoundedIcon fontSize="small" />}
              iconBg="#f0fdf4"
              iconColor="#16a34a"
              label="Show Serial No"
              description="Print an S.No column on the invoice"
            >
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Switch
                  checked={settings.showSerialNo}
                  onChange={(e) => update("showSerialNo", e.target.checked)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: redTint },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: redTint },
                  }}
                />
              </Box>
            </SettingRow>

            <Divider sx={{ borderColor: "#f4f5f8" }} />

            <SettingRow
              icon={<FormatListNumberedRoundedIcon fontSize="small" />}
              iconBg="#f0fdf4"
              iconColor="#16a34a"
              label="Show Item ID"
              description="Add an Item ID column on the invoice"
            >
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Switch
                  checked={settings.showItemId}
                  onChange={(e) => update("showItemId", e.target.checked)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: redTint },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: redTint },
                  }}
                />
              </Box>
            </SettingRow>

            <Divider sx={{ borderColor: "#f4f5f8" }} />

            <SettingRow
              icon={<PersonOutlineRoundedIcon fontSize="small" />}
              iconBg="#eef4ff"
              iconColor="#2563eb"
              label="Customer Details"
              description="Show customer name, address and contact on the invoice"
            >
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Switch
                  checked={settings.showCustomerDetails}
                  onChange={(e) => update("showCustomerDetails", e.target.checked)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: redTint },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: redTint },
                  }}
                />
              </Box>
            </SettingRow>

            <Divider sx={{ borderColor: "#f4f5f8" }} />

            <SettingRow
              icon={<ReceiptLongOutlinedIcon fontSize="small" />}
              iconBg="#fdecef"
              iconColor={redTint}
              label="Tax Details (GST Summary)"
              description="Show CGST/SGST breakdown and tax summary"
            >
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Switch
                  checked={settings.showTaxDetails}
                  onChange={(e) => update("showTaxDetails", e.target.checked)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: redTint },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: redTint },
                  }}
                />
              </Box>
            </SettingRow>

            <Divider sx={{ borderColor: "#f4f5f8" }} />

            <SettingRow
              icon={<AccountBalanceWalletOutlinedIcon fontSize="small" />}
              iconBg="#faf5ff"
              iconColor="#7c3aed"
              label="Payment Details"
              description="Show payment mode and status on the invoice"
            >
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Switch
                  checked={settings.showPaymentDetails}
                  onChange={(e) => update("showPaymentDetails", e.target.checked)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: redTint },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: redTint },
                  }}
                />
              </Box>
            </SettingRow>

            <Divider sx={{ borderColor: "#f4f5f8" }} />


            <SettingRow
              icon={<BorderColorOutlinedIcon fontSize="small" />}
              iconBg="#eef4ff"
              iconColor="#2563eb"
              label="Authorized Signature"
              description="Show a signature at the bottom of the invoice"
            >
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Switch
                  checked={settings.showSignature}
                  onChange={(e) => update("showSignature", e.target.checked)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: redTint },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: redTint },
                  }}
                />
              </Box>
            </SettingRow>
            {settings.showSignature && (
              <Box sx={{ pb: 2 }}>
                <ImageUploadSlot
                  compact
                  label="Signature Image"
                  description="Upload the authorized signatory's signature"
                  imageUrl={signatureUrl}
                  uploading={signatureUploading || signatureDeleting}
                  shape="banner"
                  onUpload={(file) => uploadSignature(file)}
                  onRemove={() => removeSignature()}
                />
              </Box>
            )}

            <Divider sx={{ borderColor: "#f4f5f8" }} />

            {/* Bank details are read-only, sourced from Company settings —
                only whether they print on the invoice is editable here. */}
            <SettingRow
              icon={<AccountBalanceOutlinedIcon fontSize="small" />}
              iconBg="#fffbeb"
              iconColor="#d97706"
              label="Show Bank Details"
              description="Print bank account details on the invoice"
            >
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Switch
                  checked={settings.showBankDetails}
                  onChange={(e) => update("showBankDetails", e.target.checked)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: redTint },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: redTint },
                  }}
                />
              </Box>
            </SettingRow>
                        <Divider sx={{ borderColor: "#f4f5f8" }} />

            <SettingRow
              icon={<DescriptionOutlinedIcon fontSize="small" />}
              iconBg="#fff7ed"
              iconColor="#ea7a00"
              label="Terms & Conditions"
              description="Print custom terms & conditions on the invoice"
            >
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Switch
                  checked={settings.showTermsConditions}
                  onChange={(e) => update("showTermsConditions", e.target.checked)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: redTint },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: redTint },
                  }}
                />
              </Box>
            </SettingRow>
            {settings.showTermsConditions && (
              <Box sx={{ pb: 2 }}>
                <TextField
                  multiline
                  minRows={3}
                  maxRows={6}
                  fullWidth
                  placeholder="Enter Terms & Conditions"
                  value={settings.termsConditionsText}
                  onChange={(e) => e.target.value.length <= FREE_TEXT_MAX_LENGTH && update("termsConditionsText", e.target.value)}
                  helperText={`${settings.termsConditionsText.length}/${FREE_TEXT_MAX_LENGTH}`}
                  FormHelperTextProps={{ sx: { textAlign: "right", fontSize: 10.5, mx: 0 } }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: 13,
                      borderRadius: 1,
                      bgcolor: "#fafbfc",
                      "& fieldset": { borderColor: cardBorder },
                      "&:hover fieldset": { borderColor: "#c5c8d2" },
                      "&.Mui-focused fieldset": { borderColor: redTint },
                    },
                  }}
                />
              </Box>
            )}

            <Divider sx={{ borderColor: "#f4f5f8" }} />

            <SettingRow
              icon={<StickyNote2OutlinedIcon fontSize="small" />}
              iconBg="#f0fdf4"
              iconColor="#16a34a"
              label="Notes"
              description="Print an additional note on the invoice"
            >
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Switch
                  checked={settings.showNotes}
                  onChange={(e) => update("showNotes", e.target.checked)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: redTint },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: redTint },
                  }}
                />
              </Box>
            </SettingRow>
            {settings.showNotes && (
              <Box sx={{ pb: 2 }}>
                <TextField
                  multiline
                  minRows={3}
                  maxRows={6}
                  fullWidth
                  placeholder="Enter Notes"
                  value={settings.notesText}
                  onChange={(e) => e.target.value.length <= FREE_TEXT_MAX_LENGTH && update("notesText", e.target.value)}
                  helperText={`${settings.notesText.length}/${FREE_TEXT_MAX_LENGTH}`}
                  FormHelperTextProps={{ sx: { textAlign: "right", fontSize: 10.5, mx: 0 } }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: 13,
                      borderRadius: 1,
                      bgcolor: "#fafbfc",
                      "& fieldset": { borderColor: cardBorder },
                      "&:hover fieldset": { borderColor: "#c5c8d2" },
                      "&.Mui-focused fieldset": { borderColor: redTint },
                    },
                  }}
                />
              </Box>
            )}

          </Section>

          {/* Select Color — A4 invoice accent color only, follows Print
              Layout since it only applies once Invoice Type is set to A4. */}
          {settings.printInch === "A4" && (
            <Section title="Select Color" subtitle="Accent color for the A4 invoice template">
              <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap", py: 1.5, pb: 2 }}>
                {INVOICE_COLORS.map((color) => {
                  const isSelected = settings.invoiceThemeColor.toUpperCase() === color.toUpperCase();
                  return (
                    <Box
                      key={color}
                      onClick={() => update("invoiceThemeColor", color)}
                      sx={{
                        width: 46,
                        height: 34,
                        borderRadius: 1,
                        bgcolor: color,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        outline: "2px solid",
                        outlineColor: isSelected ? headingText : "transparent",
                        outlineOffset: 2,
                        transition: "transform 0.1s ease, outline-color 0.15s ease",
                        "&:hover": { transform: "scale(1.06)" },
                      }}
                    >
                      {isSelected && (
                        <CheckRoundedIcon sx={{ fontSize: 16, color: "#fff" }} />
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Section>
          )}

        </Stack>

          {/* Save bar — sticks to the bottom of this scroll area only
              (not the full width under the preview), reduced padding. */}
          <Box
            sx={{
              position: { lg: "sticky" },
              bottom: { lg: 0 },
              mt: 1.5,
              py: 1,
              px: 2,
              borderRadius: 1,
              border: "1px solid",
              borderColor: cardBorder,
              bgcolor: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Typography sx={{ fontSize: 13, color: subtleText }}>
              Changes are applied to all new invoices generated after saving.
            </Typography>
            <Button
              variant="contained"
              startIcon={isSaving ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <SaveRoundedIcon />}
              onClick={handleSave}
              disabled={isSaving}
              sx={{
                px: 3,
                py: 1,
                borderRadius: 1,
                bgcolor: saved ? "#1a7a3c" : redTint,
                fontWeight: 700,
                fontSize: 13,
                boxShadow: "none",
                transition: "background-color 0.3s",
                "&:hover": { bgcolor: saved ? "#1a7a3c" : "#b1001d", boxShadow: "none" },
                "&.Mui-disabled": { bgcolor: redTint, opacity: 0.7, color: "#fff" },
              }}
            >
              {isSaving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </Button>
          </Box>
        </Box>

        {/* Sample Receipt Preview — untouched by the left column's scroll;
            keeps its own original sticky/height behavior. */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 1,
            border: "1px solid",
            borderColor: cardBorder,
            bgcolor: "#fff",
            overflow: "hidden",
            position: { lg: "sticky" },
            top: { lg: 16 },
          }}
        >
          <Box sx={{ px: { xs: 2, md: 2.5 }, pt: 2, pb: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1.5, flexWrap: "wrap" }}>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: headingText, letterSpacing: 0.2 }}>
                Sample Receipt Preview
              </Typography>
              <Typography sx={{ fontSize: 12, color: subtleText, mt: 0.3 }}>
                {settings.printInch === "A4"
                  ? "Live preview based on your current selections (A4)"
                  : `Live preview based on your current selections (${settings.printInch} inch thermal)`}
              </Typography>
            </Box>

            {settings.printInch === "A4" && (
              <Stack direction="row" sx={{ border: "1px solid", borderColor: cardBorder, borderRadius: 999, p: 0.4, gap: 0.4, flexShrink: 0 }}>
                {(["classic", "modern"] as const).map((option) => {
                  const selected = settings.invoiceTemplate === option;
                  return (
                    <Box
                      key={option}
                      onClick={() => update("invoiceTemplate", option)}
                      sx={{
                        px: 1.5,
                        py: 0.4,
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700,
                        textTransform: "capitalize",
                        cursor: "pointer",
                        color: selected ? "#fff" : subtleText,
                        bgcolor: selected ? redTint : "transparent",
                        transition: "background-color 0.15s, color 0.15s",
                      }}
                    >
                      {option}
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Box>
          <Divider sx={{ borderColor: "#f4f5f8" }} />
          <Box
            ref={previewViewportRef}
            sx={{
              p: 2.5,
              bgcolor: "#F3F4F6",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              overflowX: "hidden",
              overflowY: "auto",
              height: { xs: "auto", lg: "calc(100vh - 220px)" },
              minHeight: { xs: 320, lg: 500 },
              // App-wide CSS hides all scrollbars (index.css `::-webkit-scrollbar { display: none }`) —
              // this panel needs its own visible one so users can tell there's more to scroll to.
              "&::-webkit-scrollbar": { display: "block", width: 8 },
              "&::-webkit-scrollbar-track": { background: "transparent" },
              "&::-webkit-scrollbar-thumb": { background: "#c9ccd3", borderRadius: 4 },
              "&::-webkit-scrollbar-thumb:hover": { background: "#aeb2ba" },
            }}
          >
            <Box
              ref={previewContentRef}
              sx={{
                zoom: previewZoom,
                boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
                flexShrink: 0,
              }}
            >
              {settings.printInch === "A4" ? (
                settings.invoiceTemplate === "modern" ? (
                  <InvoicePDFTemplateModern
                    data={PREVIEW_DATA}
                    settingsOverride={previewSettingsOverride}
                    theme={theme}
                    accentColor={settings.invoiceThemeColor}
                    logoUrl={companyLogoUrl}
                    headerImageUrl={headerImageUrl}
                    signatureUrl={signatureUrl}
                  />
                ) : (
                  <InvoicePDFTemplate
                    data={PREVIEW_DATA}
                    settingsOverride={previewSettingsOverride}
                    theme={theme}
                    accentColor={settings.invoiceThemeColor}
                    logoUrl={companyLogoUrl}
                    headerImageUrl={headerImageUrl}
                    signatureUrl={signatureUrl}
                  />
                )
              ) : (
                <ThermalInvoiceTemplate
                  data={PREVIEW_DATA}
                  paperSize={settings.printInch as ThermalPaperSize}
                  settingsOverride={previewSettingsOverride}
                  theme={theme}
                  logoUrl={companyLogoUrl}
                  signatureUrl={signatureUrl}
                />
              )}
            </Box>
          </Box>
        </Paper>
      </Box>

      <SuccessToast
        message={successMsg || ""}
        severity="success"
        onClose={() => setSuccessMsg(null)}
      />
      <SuccessToast
        message={errorMsg || ""}
        severity="error"
        onClose={() => setErrorMsg(null)}
      />
    </Box>
  );
}
