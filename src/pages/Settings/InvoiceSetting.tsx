import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import TagRoundedIcon from "@mui/icons-material/TagRounded";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import GradingRoundedIcon from "@mui/icons-material/GradingRounded";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
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
import SuccessToast from "@components/Common/SuccessToast";
import { useAppDispatch, useAppSelector } from "@store/store";
import { BusinessType, setInvoiceSettings } from "@store/slices/userSlice";
import {
  useInvoiceSettings,
  useUpdateInvoiceSettings,
  type InvoiceSettingsResponse,
  type UpdateInvoiceSettingsPayload,
} from "./useInvoiceSettingApi";
import { ThermalInvoiceTemplate, type ThermalPaperSize } from "../SalesHistory/ThermalInvoiceTemplate";
import { InvoicePDFTemplate } from "../SalesHistory/InvoicePDFTemplate";
import axiosInstance from "@store/services/axiosInstance";
import { apiConfig } from "@config/api";

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
  total: PREVIEW_TAXABLE + PREVIEW_CGST_AMT + PREVIEW_SGST_AMT,
  grand_total: PREVIEW_TAXABLE + PREVIEW_CGST_AMT + PREVIEW_SGST_AMT,
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

interface InvoiceSettings {
  invoicePrefix: string;
  numberOfDigits: string;
  invoiceStartNumber: string;
  defaultTax: string;
  invoiceDueDays: string;
  showCompanyLogo: boolean;
  printThankYouMessage: boolean;
  defaultPaymentMethod: string;
  printInch: string;
  showItemDescription: boolean;
  showItemId: boolean;
  showCustomerDetails: boolean;
  showTaxDetails: boolean;
  showPaymentDetails: boolean;
  showTermsConditions: boolean;
  termsConditionsText: string;
  showNotes: boolean;
  notesText: string;
  showSignature: boolean;
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
  label, description, imageUrl, uploading, shape = "square", onUpload, onRemove,
}: {
  label: string; description: string; imageUrl: string; uploading: boolean;
  shape?: "square" | "banner"; onUpload: (file: File) => void; onRemove: () => void;
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
    <Box sx={{ flex: 1, minWidth: 200 }}>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: headingText }}>{label}</Typography>
      <Typography sx={{ fontSize: 11.5, color: subtleText, mt: 0.2, mb: 1 }}>{description}</Typography>

      <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFile} />

      <Box
        onClick={() => !uploading && inputRef.current?.click()}
        sx={{
          position: "relative",
          height: shape === "banner" ? 84 : 100,
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

const selectSx = {
  fontSize: 13,
  fontWeight: 600,
  borderRadius: 1,
  bgcolor: "#fafbfc",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: cardBorder },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#c5c8d2" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: redTint },
  height: 40,
};

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    fontSize: 13,
    fontWeight: 600,
    borderRadius: 1,
    bgcolor: "#fafbfc",
    height: 40,
    "& fieldset": { borderColor: cardBorder },
    "&:hover fieldset": { borderColor: "#c5c8d2" },
    "&.Mui-focused fieldset": { borderColor: redTint },
  },
};

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

const RETAIL_PAYMENT_METHODS: Array<{ value: string; label: string }> = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "others", label: "Others" },
];

const RESTAURANT_PAYMENT_METHODS: Array<{ value: string; label: string }> = [
  { value: "qr", label: "QR" },
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
];

function toUiSettings(api: InvoiceSettingsResponse): InvoiceSettings {
  return {
    invoicePrefix: api.invoice_prefix,
    numberOfDigits: String(api.invoice_digit_count),
    invoiceStartNumber: String(api.invoice_start_number),
    defaultTax: TAX_LABEL_TO_CODE[api.default_tax_label] ?? "GST18",
    invoiceDueDays: String(api.invoice_due_days),
    showCompanyLogo: api.show_company_logo,
    printThankYouMessage: api.print_thank_you_message,
    defaultPaymentMethod: PAYMENT_METHOD_TO_CODE[api.default_payment_method] ?? "cash",
    printInch: api.printer_inch === "A4" ? "A4" : api.printer_inch.startsWith("5") ? "5" : "3",
    showItemDescription: api.show_description,
    showItemId: api.show_item_id,
    showCustomerDetails: api.show_customer_details ?? true,
    showTaxDetails: api.show_tax_details ?? true,
    showPaymentDetails: api.show_payment_details ?? false,
    showTermsConditions: api.show_terms_conditions ?? false,
    termsConditionsText: api.terms_conditions ?? "",
    showNotes: api.show_notes ?? false,
    notesText: api.notes ?? "",
    showSignature: api.show_signature ?? false,
  };
}

function toApiPayload(ui: InvoiceSettings): UpdateInvoiceSettingsPayload {
  return {
    invoice_prefix: ui.invoicePrefix,
    invoice_digit_count: parseInt(ui.numberOfDigits, 10) || 4,
    invoice_start_number: parseInt(ui.invoiceStartNumber, 10) || 1,
    default_tax_label: TAX_CODE_TO_LABEL[ui.defaultTax] ?? ui.defaultTax,
    invoice_due_days: parseInt(ui.invoiceDueDays, 10) || 0,
    default_payment_method: PAYMENT_CODE_TO_METHOD[ui.defaultPaymentMethod] ?? ui.defaultPaymentMethod,
    printer_inch: ui.printInch === "A4" ? "A4" : `${ui.printInch} Inch`,
    show_company_logo: ui.showCompanyLogo,
    print_thank_you_message: ui.printThankYouMessage,
    show_description: ui.showItemDescription,
    show_item_id: ui.showItemId,
    show_customer_details: ui.showCustomerDetails,
    show_tax_details: ui.showTaxDetails,
    show_payment_details: ui.showPaymentDetails,
    show_terms_conditions: ui.showTermsConditions,
    terms_conditions: ui.termsConditionsText,
    show_notes: ui.showNotes,
    notes: ui.notesText,
    show_signature: ui.showSignature,
  };
}

function getDefaultSettings(businessType: string): InvoiceSettings {
  return {
    invoicePrefix: "INV",
    numberOfDigits: "4",
    invoiceStartNumber: "1",
    defaultTax: "GST18",
    invoiceDueDays: "15",
    showCompanyLogo: true,
    printThankYouMessage: true,
    defaultPaymentMethod: "cash",
    printInch: businessType === "Restaurant" ? "3" : "A4",
    showItemDescription: false,
    showItemId: false,
    showCustomerDetails: true,
    showTaxDetails: true,
    showPaymentDetails: false,
    showTermsConditions: false,
    termsConditionsText: "",
    showNotes: false,
    notesText: "",
    showSignature: false,
  };
}

export default function InvoiceSetting() {
  const dispatch = useAppDispatch();
  const businessType = useAppSelector(BusinessType);
  const paymentMethodOptions =
    businessType === "Restaurant" ? RESTAURANT_PAYMENT_METHODS : RETAIL_PAYMENT_METHODS;

  const [settings, setSettings] = useState<InvoiceSettings>(() => getDefaultSettings(businessType));
  // Preview-only visual density — not persisted to the backend yet.
  const [theme, setTheme] = useState<"compact" | "classic">("classic");
  const [invoiceColor, setInvoiceColor] = useState<string>(INVOICE_COLORS[4]);
  const [companyLogoUrl, setCompanyLogoUrl] = useState("");
  const [companyLogoUploading, setCompanyLogoUploading] = useState(false);
  const [headerImageUrl, setHeaderImageUrl] = useState("");
  const [headerImageUploading, setHeaderImageUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const uploadInvoiceImage = async (
    file: File,
    setUrl: (url: string) => void,
    setUploading: (v: boolean) => void
  ) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axiosInstance.post(apiConfig.uploadImage(), formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const fileUrl =
        response.data?.fileUrl ||
        response.data?.data?.fileUrl ||
        response.data?.url ||
        response.data?.path ||
        response.data?.location ||
        (typeof response.data === "string" ? response.data : null);
      if (!fileUrl) throw new Error("Upload did not return a file URL");
      setUrl(fileUrl);
    } catch {
      setErrorMsg("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const { data, isLoading, isError } = useInvoiceSettings();

  useEffect(() => {
    if (data) setSettings(toUiSettings(data));
  }, [data]);

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
      setSettings(toUiSettings(updated));
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
    saveSettings(toApiPayload(settings));
  };

  // Draft settings for the live receipt preview — reflects unsaved toggle
  // changes immediately instead of waiting on a save round-trip.
  const previewSettingsOverride = {
    show_company_logo: settings.showCompanyLogo,
    show_tax_details: settings.showTaxDetails,
    show_description: settings.showItemDescription,
    show_item_id: settings.showItemId,
    show_customer_details: settings.showCustomerDetails,
    show_payment_details: settings.showPaymentDetails,
    show_terms_conditions: settings.showTermsConditions,
    terms_conditions: settings.termsConditionsText,
    show_notes: settings.showNotes,
    notes: settings.notesText,
    show_signature: settings.showSignature,
  };

  // Auto-shrink the preview to whatever zoom fits the fixed-height preview
  // panel — keeps the whole receipt visible with no internal scrollbar,
  // no matter how tall the selected template/elements make it.
  const previewViewportRef = useRef<HTMLDivElement | null>(null);
  const previewContentRef = useRef<HTMLDivElement | null>(null);
  const previewZoomRef = useRef(1);
  const [previewZoom, setPreviewZoom] = useState(1);

  useLayoutEffect(() => {
    const viewport = previewViewportRef.current;
    const content = previewContentRef.current;
    if (!viewport || !content) return;

    const fit = () => {
      const availableHeight = viewport.clientHeight;
      const availableWidth = viewport.clientWidth;
      const rect = content.getBoundingClientRect();
      if (!availableHeight || !availableWidth || !rect.height || !rect.width) return;

      const naturalHeight = rect.height / previewZoomRef.current;
      const naturalWidth = rect.width / previewZoomRef.current;
      const fitted = Math.min(availableHeight / naturalHeight, availableWidth / naturalWidth, 1);
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
        {/* Left Column */}
        <Stack spacing={2}>
           <Box sx={{ mb: 2.5 }}>
        <Typography sx={{ fontSize: { xs: 22, md: 26 }, fontWeight: 800, color: headingText, lineHeight: 1.2 }}>
          Invoice settings
        </Typography>
        <Typography sx={{ mt: 0.5, fontSize: 13, color: subtleText }}>
          Manage invoice preferences, numbering rules, tax details and print layout.
        </Typography>
      </Box>

          {/* Invoice Theme */}
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
          </Section>

          {/* Select Color — A4 invoice accent color only */}
          {settings.printInch === "A4" && (
            <Section title="Select Color" subtitle="Accent color for the A4 invoice template">
              <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap", py: 1.5 }}>
                {INVOICE_COLORS.map((color) => {
                  const isSelected = invoiceColor === color;
                  return (
                    <Box
                      key={color}
                      onClick={() => setInvoiceColor(color)}
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

          {/* Company Logo & Header */}
          <Section title="Company Logo & Header" subtitle="Upload images to brand your invoices">
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
          </Section>

          {/* Invoice Numbering */}
          <Section title="Invoice Numbering" subtitle="Configure the invoice ID format and sequence">
            <SettingRow
              icon={<LabelOutlinedIcon fontSize="small" />}
              iconBg="#f0fdf4"
              iconColor="#16a34a"
              label="Invoice Prefix"
              description="Prefix for invoice ID"
            >
              <TextField
                fullWidth
                size="small"
                value={settings.invoicePrefix}
                onChange={(e) => update("invoicePrefix", e.target.value.toUpperCase())}
                placeholder="INV"
                sx={textFieldSx}
              />
            </SettingRow>
          </Section>

          {/* Print Layout */}
          <Section title="Print Layout" subtitle="Customize what appears on printed invoices">
            <SettingRow
              icon={<TagRoundedIcon fontSize="small" />}
              iconBg="#f0fdf4"
              iconColor="#16a34a"
              label="Invoice Type"
              description="Select the print paper width"
            >
              <FormControl fullWidth size="small">
                <Select
                  value={settings.printInch}
                  onChange={(e) => update("printInch", e.target.value)}
                  sx={selectSx}
                >
                  {businessType !== "Restaurant" && <MenuItem value="A4">A4</MenuItem>}
                  <MenuItem value="3">3 Inch</MenuItem>
                  <MenuItem value="5">5 Inch</MenuItem>
                </Select>
              </FormControl>
            </SettingRow>

            <Divider sx={{ borderColor: "#f4f5f8" }} />

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
              icon={<FavoriteOutlinedIcon fontSize="small" />}
              iconBg="#fff1f2"
              iconColor={redTint}
              label="Print Thank You Message"
              description="Show thank you message at the bottom of invoice"
            >
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Switch
                  checked={settings.printThankYouMessage}
                  onChange={(e) => update("printThankYouMessage", e.target.checked)}
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
              label="Item Row Identifier"
              description="Choose what the first column shows on the invoice"
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: !settings.showItemId ? redTint : subtleText }}>
                  S.No
                </Typography>
                <Switch
                  checked={settings.showItemId}
                  onChange={(e) => update("showItemId", e.target.checked)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: redTint },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: redTint },
                  }}
                />
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: settings.showItemId ? redTint : subtleText }}>
                  Item ID
                </Typography>
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
                  onChange={(e) => e.target.value.length <= 500 && update("termsConditionsText", e.target.value)}
                  helperText={`${settings.termsConditionsText.length}/500`}
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
                  onChange={(e) => e.target.value.length <= 500 && update("notesText", e.target.value)}
                  helperText={`${settings.notesText.length}/500`}
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
              icon={<BorderColorOutlinedIcon fontSize="small" />}
              iconBg="#eef4ff"
              iconColor="#2563eb"
              label="Authorized Signature"
              description="Show a signature line at the bottom of the invoice"
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
          </Section>

          {/* Payment & Rounding */}
          <Section title="Payment Settings" subtitle="Default payment preferences and invoice due days">
            {businessType !== "Restaurant" && (
              <>
                <SettingRow
                  icon={<EventRoundedIcon fontSize="small" />}
                  iconBg="#eef4ff"
                  iconColor="#2563eb"
                  label="Invoice Due Days"
                  description="Default due days for credit invoices"
                >
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={settings.invoiceDueDays}
                    onChange={(e) => update("invoiceDueDays", e.target.value)}
                    inputProps={{ min: 0 }}
                    InputProps={{
                      endAdornment: (
                        <Typography sx={{ fontSize: 12, color: subtleText, pr: 1, whiteSpace: "nowrap" }}>
                          days
                        </Typography>
                      ),
                    }}
                    sx={textFieldSx}
                  />
                </SettingRow>

                <Divider sx={{ borderColor: "#f4f5f8" }} />
              </>
            )}

            <SettingRow
              icon={<CreditCardRoundedIcon fontSize="small" />}
              iconBg="#faf5ff"
              iconColor="#7c3aed"
              label="Default Payment Method"
              description="Select default payment method"
            >
              <FormControl fullWidth size="small">
                <Select
                  value={settings.defaultPaymentMethod}
                  onChange={(e) => update("defaultPaymentMethod", e.target.value)}
                  sx={selectSx}
                >
                  {paymentMethodOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </SettingRow>
          </Section>

          {/* Tax Settings */}
          <Section title="Tax Settings" subtitle="Define how taxes are computed and applied">
            <SettingRow
              icon={<GradingRoundedIcon fontSize="small" />}
              iconBg="#fdecef"
              iconColor={redTint}
              label="Default Tax"
              description="Default tax to apply in invoice"
            >
              <FormControl fullWidth size="small">
                <Select
                  value={settings.defaultTax}
                  onChange={(e) => update("defaultTax", e.target.value)}
                  sx={selectSx}
                >
                  <MenuItem value="none">None</MenuItem>
                  <MenuItem value="GST5">GST 5%</MenuItem>
                  <MenuItem value="GST12">GST 12%</MenuItem>
                  <MenuItem value="GST18">GST 18%</MenuItem>
                  <MenuItem value="GST28">GST 28%</MenuItem>
                </Select>
              </FormControl>
            </SettingRow>
          </Section>
        </Stack>

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
              {settings.printInch === "A4"
                ? "Live preview based on your current selections (A4)"
                : `Live preview based on your current selections (${settings.printInch} inch thermal)`}
            </Typography>
          </Box>
          <Divider sx={{ borderColor: "#f4f5f8" }} />
          <Box
            ref={previewViewportRef}
            sx={{
              p: 2.5,
              bgcolor: "#F3F4F6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              height: { xs: "auto", lg: "calc(100vh - 260px)" },
              minHeight: { xs: 320, lg: 480 },
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
                <InvoicePDFTemplate
                  data={PREVIEW_DATA}
                  settingsOverride={previewSettingsOverride}
                  theme={theme}
                  accentColor={invoiceColor}
                  logoUrl={companyLogoUrl}
                  headerImageUrl={headerImageUrl}
                />
              ) : (
                <ThermalInvoiceTemplate
                  data={PREVIEW_DATA}
                  paperSize={settings.printInch as ThermalPaperSize}
                  settingsOverride={previewSettingsOverride}
                  theme={theme}
                  logoUrl={companyLogoUrl}
                />
              )}
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Bottom Save Bar */}
      <Box
        sx={{
          mt: 3,
          py: 2,
          px: { xs: 2, md: 2.5 },
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
