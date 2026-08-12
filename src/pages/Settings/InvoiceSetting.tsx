import { useEffect, useState } from "react";
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
import Pin from "@mui/icons-material/Pin";
import GradingRoundedIcon from "@mui/icons-material/GradingRounded";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import SuccessToast from "@components/Common/SuccessToast";
import {
  useInvoiceSettings,
  useUpdateInvoiceSettings,
  type InvoiceSettingsResponse,
  type UpdateInvoiceSettingsPayload,
} from "./useInvoiceSettingApi";

const redTint = "#ca0022";
const headingText = "#1d2533";
const subtleText = "#8e95a3";
const cardBorder = "#ececf2";

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
  "Bank Transfer": "bank_transfer",
};
const PAYMENT_CODE_TO_METHOD: Record<string, string> = Object.fromEntries(
  Object.entries(PAYMENT_METHOD_TO_CODE).map(([label, code]) => [code, label])
);

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
    printInch: api.printer_inch.startsWith("5") ? "5" : "3",
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
    printer_inch: `${ui.printInch} Inch`,
    show_company_logo: ui.showCompanyLogo,
    print_thank_you_message: ui.printThankYouMessage,
  };
}

const DEFAULT_SETTINGS: InvoiceSettings = {
  invoicePrefix: "INV",
  numberOfDigits: "4",
  invoiceStartNumber: "1",
  defaultTax: "GST18",
  invoiceDueDays: "15",
  showCompanyLogo: true,
  printThankYouMessage: true,
  defaultPaymentMethod: "cash",
  printInch: "3",
};

export default function InvoiceSetting() {
  const [settings, setSettings] = useState<InvoiceSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data, isLoading, isError } = useInvoiceSettings();

  useEffect(() => {
    if (data) setSettings(toUiSettings(data));
  }, [data]);

  useEffect(() => {
    if (isError) setErrorMsg("Failed to load invoice settings. Please refresh the page.");
  }, [isError]);

  const { mutate: saveSettings, isPending: isSaving } = useUpdateInvoiceSettings({
    onSuccess: () => {
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

  const previewInvoiceNumber = () => {
    const digits = parseInt(settings.numberOfDigits) || 4;
    const num = parseInt(settings.invoiceStartNumber) || 1;
    return `${settings.invoicePrefix}-${String(num).padStart(digits, "0")}`;
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress size={28} sx={{ color: redTint }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 2.5 }}>
        <Typography sx={{ fontSize: { xs: 22, md: 26 }, fontWeight: 800, color: headingText, lineHeight: 1.2 }}>
          Invoice settings
        </Typography>
        <Typography sx={{ mt: 0.5, fontSize: 13, color: subtleText }}>
          Manage invoice preferences, numbering rules, tax details and print layout.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          gap: 2,
        }}
      >
        {/* Left Column */}
        <Stack spacing={2}>
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

            <Divider sx={{ borderColor: "#f4f5f8" }} />

            <SettingRow
              icon={<Pin fontSize="small" />}
              iconBg="#faf5ff"
              iconColor="#7c3aed"
              label="Number of Digits"
              description="Total digits in invoice number"
            >
              <FormControl fullWidth size="small">
                <Select
                  value={settings.numberOfDigits}
                  onChange={(e) => update("numberOfDigits", e.target.value)}
                  sx={selectSx}
                >
                  <MenuItem value="3">3 ({settings.invoicePrefix || "INV"}-001)</MenuItem>
                  <MenuItem value="4">4 ({settings.invoicePrefix || "INV"}-0001)</MenuItem>
                  <MenuItem value="5">5 ({settings.invoicePrefix || "INV"}-00001)</MenuItem>
                </Select>
              </FormControl>
            </SettingRow>

            <Divider sx={{ borderColor: "#f4f5f8" }} />

            <Box sx={{ py: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1.5,
                      bgcolor: "#f0fdf4",
                      color: "#16a34a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <TagRoundedIcon fontSize="small" />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText }}>
                      Invoice Start Number
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: subtleText, mt: 0.3 }}>
                      Starting number for invoice sequence
                    </Typography>
                  </Box>
                </Stack>
                <TextField
                  size="small"
                  type="number"
                  value={settings.invoiceStartNumber}
                  onChange={(e) => update("invoiceStartNumber", e.target.value)}
                  inputProps={{ min: 1 }}
                  sx={{ ...textFieldSx, width: 100 }}
                />
              </Stack>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1.5,
                  py: 0.6,
                  borderRadius: 1,
                  bgcolor: "#f4f5f8",
                  border: "1px dashed #dde0e8",
                }}
              >
                <Typography sx={{ fontSize: 11, color: subtleText, fontWeight: 600 }}>Preview:</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 800, color: headingText, fontFamily: "monospace" }}>
                  {previewInvoiceNumber()}
                </Typography>
              </Box>
            </Box>
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

        {/* Right Column */}
        <Stack spacing={2}>
          {/* Payment & Rounding */}
          <Section title="Payment Settings" subtitle="Default payment preferences and invoice due days">
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
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="card">Card</MenuItem>
                  <MenuItem value="upi">UPI</MenuItem>
                  <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                </Select>
              </FormControl>
            </SettingRow>
          </Section>

          {/* Print Layout */}
          <Section title="Print Layout" subtitle="Customize what appears on printed invoices">
            <SettingRow
              icon={<TagRoundedIcon fontSize="small" />}
              iconBg="#f0fdf4"
              iconColor="#16a34a"
              label="Printer Inch"
              description="Select the print paper width"
            >
              <FormControl fullWidth size="small">
                <Select
                  value={settings.printInch}
                  onChange={(e) => update("printInch", e.target.value)}
                  sx={selectSx}
                >
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
          </Section>
        </Stack>
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
