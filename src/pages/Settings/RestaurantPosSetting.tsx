import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
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
import GradingRoundedIcon from "@mui/icons-material/GradingRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import FormatListNumberedRoundedIcon from "@mui/icons-material/FormatListNumberedRounded";
import TagRoundedIcon from "@mui/icons-material/TagRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import SuccessToast from "@components/Common/SuccessToast";
import { useAppDispatch } from "@store/store";
import { setInvoiceSettings } from "@store/slices/userSlice";
import {
  useInvoiceSettings,
  useUpdateInvoiceSettings,
  toPaymentTypeLabels,
  PAYMENT_TYPE_LABELS,
  type PaymentTypeLabel,
  type UpdateInvoiceSettingsPayload,
} from "./useInvoiceSettingApi";

const redTint = "#ca0022";
const headingText = "#1d2533";
const subtleText = "#8e95a3";
const cardBorder = "#ececf2";

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

const RESTAURANT_PAYMENT_METHODS: Array<{ value: string; label: string }> = [
  { value: "qr", label: "QR" },
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
];

// Payment types the cashier can choose from at POS checkout, shown there as chips —
// only the ones enabled here appear on the checkout screen. These are the canonical
// labels the API validates against (PAYMENT_TYPE_LABELS); there is no code/slug form,
// so they're both the value sent to the server and the text shown on the chip.
const POS_PAYMENT_TYPE_OPTIONS: PaymentTypeLabel[] = [...PAYMENT_TYPE_LABELS];
const DEFAULT_POS_PAYMENT_TYPES: PaymentTypeLabel[] = ["Cash", "UPI", "Bank Transfer", "Others"];

function parsePosPaymentTypes(raw: unknown): PaymentTypeLabel[] {
  const labels = toPaymentTypeLabels(raw);
  return labels.length > 0 ? labels : DEFAULT_POS_PAYMENT_TYPES;
}

// `default_payment_method` uses its own vocabulary ("Card"/"QR" exist there but not in
// payment_types), so only the ones that overlap can be reconciled with the enabled list.
function defaultMethodAsPaymentType(methodCode: string): PaymentTypeLabel | null {
  const label = PAYMENT_CODE_TO_METHOD[methodCode] ?? methodCode;
  return POS_PAYMENT_TYPE_OPTIONS.find((l) => l.toLowerCase() === label.toLowerCase()) ?? null;
}

interface PosSettings {
  invoicePrefix: string;
  numberOfDigits: string;
  invoiceStartNumber: string;
  defaultTax: string;
  invoiceDueDays: string;
  defaultPaymentMethod: string;
  posPaymentTypes: PaymentTypeLabel[];
  stockCheckEnabled: boolean;
  customerMandatory: boolean;
}

function getDefaultPosSettings(): PosSettings {
  return {
    invoicePrefix: "INV",
    numberOfDigits: "4",
    invoiceStartNumber: "1",
    defaultTax: "GST18",
    invoiceDueDays: "15",
    defaultPaymentMethod: "cash",
    posPaymentTypes: DEFAULT_POS_PAYMENT_TYPES,
    stockCheckEnabled: false,
    customerMandatory: false,
  };
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

// Restaurant POS settings — same API/hooks as the retail screen, but without the
// Sale Types card (Invoice/Quotation/Proforma don't apply to a restaurant till)
// and without Invoice Due Days (no credit-invoice workflow here).
export default function RestaurantPosSetting() {
  const dispatch = useAppDispatch();

  const [settings, setSettings] = useState<PosSettings>(getDefaultPosSettings);
  // Last-loaded-or-saved snapshot — diffed at save time so the PUT only sends
  // the fields that actually changed.
  const baselineRef = useRef<PosSettings | null>(null);

  const [saved, setSaved] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data, isLoading, isError } = useInvoiceSettings();

  useEffect(() => {
    if (data) {
      const ui: PosSettings = {
        invoicePrefix: data.invoice_prefix,
        numberOfDigits: String(data.invoice_digit_count),
        invoiceStartNumber: String(data.invoice_start_number),
        defaultTax: TAX_LABEL_TO_CODE[data.default_tax_label] ?? "GST18",
        invoiceDueDays: String(data.invoice_due_days),
        defaultPaymentMethod: PAYMENT_METHOD_TO_CODE[data.default_payment_method] ?? "cash",
        posPaymentTypes: parsePosPaymentTypes(data.payment_types),
        stockCheckEnabled: data.stock_check_enabled ?? false,
        customerMandatory: data.customer_mandatory ?? false,
      };
      setSettings(ui);
      baselineRef.current = ui;
    }
  }, [data]);

  useEffect(() => {
    if (isError) setErrorMsg("Failed to load POS settings. Please refresh the page.");
  }, [isError]);

  const { mutate: saveSettings, isPending: isSaving } = useUpdateInvoiceSettings({
    onSuccess: (updated) => {
      const ui: PosSettings = {
        invoicePrefix: updated.invoice_prefix,
        numberOfDigits: String(updated.invoice_digit_count),
        invoiceStartNumber: String(updated.invoice_start_number),
        defaultTax: TAX_LABEL_TO_CODE[updated.default_tax_label] ?? "GST18",
        invoiceDueDays: String(updated.invoice_due_days),
        defaultPaymentMethod: PAYMENT_METHOD_TO_CODE[updated.default_payment_method] ?? "cash",
        posPaymentTypes: parsePosPaymentTypes(updated.payment_types),
        stockCheckEnabled: updated.stock_check_enabled ?? false,
        customerMandatory: updated.customer_mandatory ?? false,
      };
      setSettings(ui);
      baselineRef.current = ui;
      // POS reads payment_types straight from Redux (populated once at branch-select) to
      // decide which payment chips to render — without this the picker above would only
      // take effect after the next login/branch switch, so deselected types kept showing.
      dispatch(setInvoiceSettings(updated));
      setSaved(true);
      setSuccessMsg("POS settings updated successfully");
      setTimeout(() => setSaved(false), 2000);
    },
    onError: (msg) => setErrorMsg(msg),
  });

  const update = <K extends keyof PosSettings>(key: K, value: PosSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const togglePaymentType = (value: PaymentTypeLabel) => {
    setSettings((prev) => {
      const isSelected = prev.posPaymentTypes.includes(value);
      // Keep at least one payment type enabled — POS checkout needs somewhere to fall back to,
      // and the server rejects an empty array anyway (min 1 item).
      if (isSelected && prev.posPaymentTypes.length === 1) return prev;
      const posPaymentTypes = isSelected
        ? prev.posPaymentTypes.filter((v) => v !== value)
        : POS_PAYMENT_TYPE_OPTIONS.filter((v) => v === value || prev.posPaymentTypes.includes(v));
      return { ...prev, posPaymentTypes };
    });
    setSaved(false);
  };

  // The server rejects duplicates (case-insensitively) and unknown values, so send the
  // canonical labels in canonical order with no repeats.
  const toPaymentTypesPayload = (types: PaymentTypeLabel[], defaultMethodCode: string) => {
    const selected = POS_PAYMENT_TYPE_OPTIONS.filter((label) => types.includes(label));
    // `default_payment_method` must be one of `payment_types` or the request is rejected,
    // so a default that overlaps this vocabulary is always kept enabled.
    const defaultLabel = defaultMethodAsPaymentType(defaultMethodCode);
    if (defaultLabel && !selected.includes(defaultLabel)) {
      return POS_PAYMENT_TYPE_OPTIONS.filter((l) => l === defaultLabel || selected.includes(l));
    }
    return selected;
  };

  const handleSave = () => {
    const fullPayload: UpdateInvoiceSettingsPayload = {
      invoice_prefix: settings.invoicePrefix,
      invoice_digit_count: parseInt(settings.numberOfDigits, 10) || 4,
      invoice_start_number: parseInt(settings.invoiceStartNumber, 10) || 1,
      default_tax_label: TAX_CODE_TO_LABEL[settings.defaultTax] ?? settings.defaultTax,
      invoice_due_days: parseInt(settings.invoiceDueDays, 10) || 0,
      default_payment_method: PAYMENT_CODE_TO_METHOD[settings.defaultPaymentMethod] ?? settings.defaultPaymentMethod,
      payment_types: toPaymentTypesPayload(settings.posPaymentTypes, settings.defaultPaymentMethod),
      stock_check_enabled: settings.stockCheckEnabled,
      customer_mandatory: settings.customerMandatory,
    };

    if (!baselineRef.current) {
      saveSettings(fullPayload);
      return;
    }

    const baselinePayload: UpdateInvoiceSettingsPayload = {
      invoice_prefix: baselineRef.current.invoicePrefix,
      invoice_digit_count: parseInt(baselineRef.current.numberOfDigits, 10) || 4,
      invoice_start_number: parseInt(baselineRef.current.invoiceStartNumber, 10) || 1,
      default_tax_label: TAX_CODE_TO_LABEL[baselineRef.current.defaultTax] ?? baselineRef.current.defaultTax,
      invoice_due_days: parseInt(baselineRef.current.invoiceDueDays, 10) || 0,
      default_payment_method: PAYMENT_CODE_TO_METHOD[baselineRef.current.defaultPaymentMethod] ?? baselineRef.current.defaultPaymentMethod,
      payment_types: toPaymentTypesPayload(baselineRef.current.posPaymentTypes, baselineRef.current.defaultPaymentMethod),
      stock_check_enabled: baselineRef.current.stockCheckEnabled,
      customer_mandatory: baselineRef.current.customerMandatory,
    };

    const diff: UpdateInvoiceSettingsPayload = {};
    (Object.keys(fullPayload) as Array<keyof UpdateInvoiceSettingsPayload>).forEach((key) => {
      const next = fullPayload[key];
      const prev = baselinePayload[key];
      // payment_types is an array — `!==` on it is always true, which would resend it
      // on every save (and, worse, hide a genuine no-op behind a pointless PUT).
      const changed = Array.isArray(next) || Array.isArray(prev)
        ? JSON.stringify(next) !== JSON.stringify(prev)
        : next !== prev;
      if (changed) {
        (diff as Record<string, unknown>)[key] = next;
      }
    });

    // The server validates default_payment_method against the payment_types in the same
    // request, so once the default moves, the enabled list has to travel with it —
    // otherwise it's checked against the stored list, which may not contain the new default.
    // (Only meaningful when the default is expressible as a payment type at all: "Card"/"QR"
    // exist in the default-method vocabulary but not in payment_types.)
    if (diff.default_payment_method && !diff.payment_types &&
        defaultMethodAsPaymentType(settings.defaultPaymentMethod)) {
      diff.payment_types = fullPayload.payment_types;
    }

    if (Object.keys(diff).length === 0) {
      setSuccessMsg("No changes to save.");
      return;
    }

    saveSettings(diff);
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
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
          alignItems: "start",
        }}
      >
        <Stack spacing={2}>
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
                inputProps={{ maxLength: 20 }}
                sx={textFieldSx}
              />
            </SettingRow>

            <Divider sx={{ borderColor: "#f4f5f8" }} />

            <SettingRow
              icon={<FormatListNumberedRoundedIcon fontSize="small" />}
              iconBg="#eef4ff"
              iconColor="#2563eb"
              label="Digit Count"
              description="Coming soon — saved, but doesn't change invoice numbering yet"
            >
              <TextField
                fullWidth
                size="small"
                type="number"
                value={settings.numberOfDigits}
                onChange={(e) => update("numberOfDigits", e.target.value)}
                inputProps={{ min: 1, max: 10 }}
                sx={textFieldSx}
              />
            </SettingRow>

            <Divider sx={{ borderColor: "#f4f5f8" }} />

            <SettingRow
              icon={<TagRoundedIcon fontSize="small" />}
              iconBg="#eef4ff"
              iconColor="#2563eb"
              label="Start Number"
              description="Coming soon — saved, but doesn't change invoice numbering yet"
            >
              <TextField
                fullWidth
                size="small"
                type="number"
                value={settings.invoiceStartNumber}
                onChange={(e) => update("invoiceStartNumber", e.target.value)}
                inputProps={{ min: 0 }}
                sx={textFieldSx}
              />
            </SettingRow>
          </Section>

          <Section
            title="Tax Settings"
            subtitle="Define how taxes are computed and applied"
          >
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

          <Section
            title="Additional Settings"
            subtitle="Configure additional POS behaviours"
          >
            <SettingRow
              icon={<Inventory2RoundedIcon fontSize="small" />}
              iconBg="#fff7ed"
              iconColor="#ea580c"
              label="Stock Check"
              description="Check stock availability while adding items in POS"
            >
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Switch
                  checked={settings.stockCheckEnabled}
                  onChange={(e) => update("stockCheckEnabled", e.target.checked)}
                />
              </Box>
            </SettingRow>

            <Divider sx={{ borderColor: "#f4f5f8" }} />

            <SettingRow
              icon={<GroupRoundedIcon fontSize="small" />}
              iconBg="#faf5ff"
              iconColor="#7c3aed"
              label="Customer Mandatory"
              description="Make customer selection mandatory in POS"
            >
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Switch
                  checked={settings.customerMandatory}
                  onChange={(e) => update("customerMandatory", e.target.checked)}
                />
              </Box>
            </SettingRow>
          </Section>
        </Stack>

        <Stack spacing={2}>
          <Section
            title="Payment Settings"
            subtitle="Default payment preferences"
          >
            <Box sx={{ py: 2 }}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    bgcolor: "#e8f7ee",
                    color: "#1a7a3c",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <PaymentsRoundedIcon fontSize="small" />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText }}>
                    Payment Types
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: subtleText, mt: 0.3, mb: 1.5 }}>
                    Only the selected types appear at POS checkout
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {POS_PAYMENT_TYPE_OPTIONS.map((option) => {
                      const selected = settings.posPaymentTypes.includes(option);
                      return (
                        <Chip
                          key={option}
                          label={option}
                          clickable
                          onClick={() => togglePaymentType(option)}
                          sx={{
                            fontSize: 12.5,
                            fontWeight: 700,
                            borderRadius: 1,
                            bgcolor: selected ? "#fdecef" : "#fafbfc",
                            color: selected ? redTint : headingText,
                            border: "1px solid",
                            borderColor: selected ? "#f6c3cb" : cardBorder,
                            "&:hover": { bgcolor: selected ? "#fbdde2" : "#f4f5f8" },
                          }}
                        />
                      );
                    })}
                  </Stack>
                </Box>
              </Stack>
            </Box>

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
                  {RESTAURANT_PAYMENT_METHODS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
          Changes are applied to all new sales made after saving.
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
