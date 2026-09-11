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
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SuccessToast from "@components/Common/SuccessToast";
import SelectableTypeCard from "@components/Common/SelectableTypeCard";
import { useAppDispatch } from "@store/store";
import { setInvoiceSettings } from "@store/slices/userSlice";
import {
  useInvoiceSettings,
  useUpdateInvoiceSettings,
  useUploadInvoiceSignature,
  useDeleteInvoiceSignature,
  type InvoiceSettingsResponse,
  type UpdateInvoiceSettingsPayload,
} from "./useInvoiceSettingApi";
import { ThermalInvoiceTemplate, type ThermalPaperSize } from "../SalesHistory/ThermalInvoiceTemplate";
import { numberToWords } from "@utils/numberToWords";
import { normalizeInvoiceCopyTypes } from "@utils/invoiceCopyTypes";

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
  // Restaurant keeps these fixed rather than exposing a toggle — same values
  // sent to the (shared) API either way, just not editable from this screen.
  showShippingAddress: boolean;
  invoiceCopyTypes: ReturnType<typeof normalizeInvoiceCopyTypes>;
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

// Paper-size choices — Restaurant never offers A4, so the list is fixed to
// the two thermal widths (matching TEMPLATE_TYPES' Restaurant filter on the
// retail screen).
const TEMPLATE_TYPES = [
  { value: "3", label: "3 inch Thermal Printer", caption: "72 mm width", icon: <LocalPrintshopOutlinedIcon fontSize="small" /> },
  { value: "5", label: "5 inch Thermal Printer", caption: "120 mm width", icon: <LocalPrintshopOutlinedIcon fontSize="small" /> },
];

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

// Server contract: exactly 6 hex digits with a leading '#'.
const COLOR_HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;
const DEFAULT_INVOICE_COLOR = "#C62828";

function toUiSettings(api: InvoiceSettingsResponse): InvoiceSettings {
  return {
    defaultTax: TAX_LABEL_TO_CODE[api.default_tax_label] ?? "GST18",
    invoiceDueDays: String(api.invoice_due_days),
    invoiceThemeColor: api.invoice_theme_color && COLOR_HEX_REGEX.test(api.invoice_theme_color)
      ? api.invoice_theme_color
      : DEFAULT_INVOICE_COLOR,
    showCompanyLogo: api.show_company_logo,
    defaultPaymentMethod: PAYMENT_METHOD_TO_CODE[api.default_payment_method] ?? "cash",
    printInch: api.printer_inch.startsWith("5") ? "5" : "3",
    showItemDescription: api.show_description,
    showItemId: api.show_item_id,
    showSerialNo: api.show_serial_no ?? true,
    showCustomerDetails: api.show_customer_details ?? true,
    showShippingAddress: api.show_shipping_address ?? true,
    invoiceCopyTypes: normalizeInvoiceCopyTypes(api.invoice_copy_types),
    showTaxDetails: api.show_tax_details ?? true,
    showPaymentDetails: api.show_payment_details ?? false,
    showTermsConditions: api.show_terms_conditions ?? false,
    termsConditionsText: api.terms_conditions ?? "",
    showNotes: api.show_notes ?? false,
    notesText: api.notes ?? "",
    showSignature: api.show_signature ?? false,
    showBankDetails: api.show_bank_details ?? true,
    invoiceTemplate: "classic",
  };
}

function toApiPayload(ui: InvoiceSettings): UpdateInvoiceSettingsPayload {
  return {
    default_tax_label: TAX_CODE_TO_LABEL[ui.defaultTax] ?? ui.defaultTax,
    invoice_due_days: parseInt(ui.invoiceDueDays, 10) || 0,
    default_payment_method: PAYMENT_CODE_TO_METHOD[ui.defaultPaymentMethod] ?? ui.defaultPaymentMethod,
    printer_inch: `${ui.printInch} Inch`,
    invoice_theme_color: ui.invoiceThemeColor,
    show_company_logo: ui.showCompanyLogo,
    show_description: ui.showItemDescription,
    show_item_id: ui.showItemId,
    show_serial_no: ui.showSerialNo,
    show_customer_details: ui.showCustomerDetails,
    show_shipping_address: ui.showShippingAddress,
    invoice_copy_types: ui.invoiceCopyTypes,
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

function getDefaultSettings(): InvoiceSettings {
  return {
    defaultTax: "GST18",
    invoiceDueDays: "15",
    invoiceThemeColor: DEFAULT_INVOICE_COLOR,
    showCompanyLogo: true,
    defaultPaymentMethod: "cash",
    printInch: "3",
    showItemDescription: false,
    showItemId: false,
    showSerialNo: true,
    showCustomerDetails: true,
    showShippingAddress: true,
    invoiceCopyTypes: ["Original"],
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

// Restaurant invoice settings — same API as retail (InvoiceSetting.tsx), but
// without the Shipping Address, Invoice Copy Types, and Show Bank Details
// sections, which don't apply to a restaurant bill. Those fields still travel
// in the payload at their existing/default values; only their editable UI
// controls are hidden here. Restaurant is also always thermal (no A4 option,
// so no accent-color picker or per-template preview switch either).
export default function RestaurantInvoiceSetting() {
  const dispatch = useAppDispatch();

  const [settings, setSettings] = useState<InvoiceSettings>(getDefaultSettings);
  const baselineRef = useRef<InvoiceSettings | null>(null);
  const [theme] = useState<"compact" | "classic">("classic");
  const [companyLogoUrl] = useState("");
  const [signatureUrl, setSignatureUrl] = useState("");
  const [saved, setSaved] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data, isLoading, isError } = useInvoiceSettings();

  useEffect(() => {
    if (data) {
      const ui = toUiSettings(data);
      const previousBaseline = baselineRef.current;
      setSettings((prev) => {
        if (!previousBaseline) return ui;
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
      const ui = toUiSettings(updated);
      setSettings(ui);
      baselineRef.current = ui;
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

    if (!baselineRef.current) {
      saveSettings(fullPayload);
      return;
    }

    const baselinePayload = toApiPayload(baselineRef.current);
    const diff: UpdateInvoiceSettingsPayload = {};
    (Object.keys(fullPayload) as Array<keyof UpdateInvoiceSettingsPayload>).forEach((key) => {
      const next = fullPayload[key];
      const prev = baselinePayload[key];
      const changed = Array.isArray(next) || Array.isArray(prev)
        ? JSON.stringify(next) !== JSON.stringify(prev)
        : next !== prev;
      if (changed) {
        (diff as Record<string, unknown>)[key] = next;
      }
    });

    if (Object.keys(diff).length === 0) {
      setSuccessMsg("No changes to save.");
      return;
    }

    saveSettings(diff);
  };

  const previewSettingsOverride = {
    show_company_logo: settings.showCompanyLogo,
    show_tax_details: settings.showTaxDetails,
    show_description: settings.showItemDescription,
    show_item_id: settings.showItemId,
    show_serial_no: settings.showSerialNo,
    show_customer_details: settings.showCustomerDetails,
    show_shipping_address: settings.showShippingAddress,
    invoice_copy_types: settings.invoiceCopyTypes,
    show_payment_details: settings.showPaymentDetails,
    show_terms_conditions: settings.showTermsConditions,
    terms_conditions: settings.termsConditionsText,
    show_notes: settings.showNotes,
    notes: settings.notesText,
    show_signature: settings.showSignature,
    show_bank_details: settings.showBankDetails,
  };

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
    <Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.1fr 1fr" },
          gap: 2,
          alignItems: "start",
        }}
      >
        {/* Left Column */}
        <Box sx={{ minHeight: 0, height: { lg: "calc(100vh - 150px)" }, overflowY: { lg: "auto" }, pr: { lg: 0.5 } }}>
        <Stack spacing={2}>

          <Section title="Select Template Type" subtitle="Select the print paper width">
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(auto-fit, minmax(210px, 1fr))" },
                gap: 1.5,
                py: 1.5,
              }}
            >
              {TEMPLATE_TYPES.map((option) => (
                <SelectableTypeCard
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
              description="Show the item tax column and HSN-wise tax breakdown"
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

        </Stack>

          {/* Save bar */}
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

        {/* Sample Receipt Preview */}
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
          <Box sx={{ px: { xs: 2, md: 2.5 }, pt: 2, pb: 1 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 800, color: headingText, letterSpacing: 0.2 }}>
              Sample Receipt Preview
            </Typography>
            <Typography sx={{ fontSize: 12, color: subtleText, mt: 0.3 }}>
              {`Live preview based on your current selections (${settings.printInch} inch thermal)`}
            </Typography>
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
              <ThermalInvoiceTemplate
                data={PREVIEW_DATA}
                paperSize={settings.printInch as ThermalPaperSize}
                settingsOverride={previewSettingsOverride}
                theme={theme}
                logoUrl={companyLogoUrl}
                signatureUrl={signatureUrl}
              />
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
