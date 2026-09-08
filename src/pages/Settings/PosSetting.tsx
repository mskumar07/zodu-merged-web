import { useEffect, useRef, useState } from "react";
import {
  Alert,
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
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import FormatListNumberedRoundedIcon from "@mui/icons-material/FormatListNumberedRounded";
import TagRoundedIcon from "@mui/icons-material/TagRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import RequestQuoteOutlinedIcon from "@mui/icons-material/RequestQuoteOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SuccessToast from "@components/Common/SuccessToast";
import SelectableTypeCard from "@components/Common/SelectableTypeCard";
import { useAppDispatch, useAppSelector } from "@store/store";
import { BusinessType, setInvoiceSettings, setPosSettings } from "@store/slices/userSlice";
import {
  useInvoiceSettings,
  useUpdateInvoiceSettings,
  toPaymentTypeLabels,
  PAYMENT_TYPE_LABELS,
  type PaymentTypeLabel,
  type UpdateInvoiceSettingsPayload,
} from "./useInvoiceSettingApi";
import {
  usePosSettings,
  useUpdatePosSettings,
  POS_TYPE_LABELS,
  type PosTypeLabel,
} from "./usePosSettingApi";

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

// One glyph and one line of "what is this for" per sale type — three document
// names alone don't say how they differ at the till.
const POS_TYPE_ICONS: Record<PosTypeLabel, React.ReactElement> = {
  Invoice: <ReceiptLongRoundedIcon fontSize="small" />,
  Quotation: <RequestQuoteOutlinedIcon fontSize="small" />,
  Proforma: <DescriptionOutlinedIcon fontSize="small" />,
};

const POS_TYPE_CAPTIONS: Record<PosTypeLabel, string> = {
  Invoice: "Billed sale — takes payment",
  Quotation: "Price offer — no payment",
  Proforma: "Draft bill — no payment",
};

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

export default function PosSetting() {
  const dispatch = useAppDispatch();
  const businessType = useAppSelector(BusinessType);
  const paymentMethodOptions =
    businessType === "Restaurant" ? RESTAURANT_PAYMENT_METHODS : RETAIL_PAYMENT_METHODS;

  const [settings, setSettings] = useState<PosSettings>(getDefaultPosSettings);
  // Last-loaded-or-saved snapshot — diffed at save time so the PUT (shared
  // with the Invoice settings tab) only sends the fields owned by this tab.
  const baselineRef = useRef<PosSettings | null>(null);

  // Sale types live on their own endpoint (/pos-settings), not on the invoice
  // settings row, so they get their own state, baseline and PUT — both fields
  // always travel together (see saveSaleTypes).
  const [posTypes, setPosTypes] = useState<PosTypeLabel[]>(["Invoice"]);
  const [defaultPosType, setDefaultPosType] = useState<PosTypeLabel>("Invoice");
  const posBaselineRef = useRef<{ posTypes: PosTypeLabel[]; defaultPosType: PosTypeLabel } | null>(null);
  // The server's own wording for a rejected combination — shown next to the
  // checkboxes rather than as a toast, since it names the offending field.
  const [posTypeError, setPosTypeError] = useState<string | null>(null);

  const [saved, setSaved] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data, isLoading, isError } = useInvoiceSettings();
  const {
    data: posData,
    isLoading: isPosLoading,
    isError: isPosError,
  } = usePosSettings();

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
    if (posData) {
      setPosTypes(posData.pos_types);
      setDefaultPosType(posData.default_pos_type);
      posBaselineRef.current = {
        posTypes: posData.pos_types,
        defaultPosType: posData.default_pos_type,
      };
      setPosTypeError(null);
    }
  }, [posData]);

  useEffect(() => {
    if (isError || isPosError) setErrorMsg("Failed to load POS settings. Please refresh the page.");
  }, [isError, isPosError]);

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

  const { mutate: savePosTypes, isPending: isSavingPosTypes } = useUpdatePosSettings({
    onSuccess: (updated) => {
      setPosTypes(updated.pos_types);
      setDefaultPosType(updated.default_pos_type);
      posBaselineRef.current = {
        posTypes: updated.pos_types,
        defaultPosType: updated.default_pos_type,
      };
      setPosTypeError(null);
      // The POS screen renders its sale-type tabs from Redux (populated at
      // branch-select), so push the new values there — otherwise the tabs only
      // change after the next login or branch switch.
      dispatch(setPosSettings(updated));
      setSaved(true);
      setSuccessMsg("POS settings updated successfully");
      setTimeout(() => setSaved(false), 2000);
    },
    onError: (msg) => setPosTypeError(msg),
  });

  // Unchecking the current default moves it to the first type still enabled —
  // the PUT must always carry a default that is one of pos_types, and blocking
  // the uncheck instead would just leave the user stuck.
  const togglePosType = (value: PosTypeLabel) => {
    const isSelected = posTypes.includes(value);
    // At least one type has to stay on: the POS needs a tab to open, and the
    // server rejects an empty array anyway.
    if (isSelected && posTypes.length === 1) return;
    const next = isSelected
      ? posTypes.filter((v) => v !== value)
      : POS_TYPE_LABELS.filter((v) => v === value || posTypes.includes(v));
    setPosTypes(next);
    if (!next.includes(defaultPosType)) setDefaultPosType(next[0]);
    setPosTypeError(null);
    setSaved(false);
  };

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

  const posTypesDirty = () => {
    const baseline = posBaselineRef.current;
    if (!baseline) return true;
    return (
      JSON.stringify(baseline.posTypes) !== JSON.stringify(posTypes) ||
      baseline.defaultPosType !== defaultPosType
    );
  };

  const handleSave = () => {
    // Sale types go to their own endpoint. Both fields are sent every time,
    // even when only one changed: the server validates default_pos_type against
    // the pos_types in the same request and falls back to the stored list
    // otherwise, which is what makes a partial update fail.
    const saveSaleTypes = posTypesDirty();
    if (saveSaleTypes) {
      setPosTypeError(null);
      savePosTypes({ pos_types: posTypes, default_pos_type: defaultPosType });
    }

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
      if (!saveSaleTypes) setSuccessMsg("No changes to save.");
      return;
    }

    saveSettings(diff);
  };

  if (isLoading || isPosLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress size={28} sx={{ color: redTint }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Two independent column stacks, not grid cells: these sections have
          very different heights, and fixed cell placement left a visible hole
          beside the shorter column. */}
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
            title="Sale Types"
            subtitle="Which document types the POS offers, and which one it opens on"
          >
            <Box sx={{ py: 2 }}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    bgcolor: "#eef4ff",
                    color: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <ReceiptLongRoundedIcon fontSize="small" />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText }}>
                    Enabled Sale Types
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: subtleText, mt: 0.3, mb: 0.5 }}>
                    Only the selected types get a tab in POS — at least one stays on
                  </Typography>
                  <Box
                    sx={{
                      mt: 1.5,
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "repeat(auto-fit, minmax(190px, 1fr))" },
                      gap: 1.5,
                    }}
                  >
                    {POS_TYPE_LABELS.map((option) => {
                      const checked = posTypes.includes(option);
                      return (
                        <SelectableTypeCard
                          key={option}
                          label={option}
                          caption={POS_TYPE_CAPTIONS[option]}
                          icon={POS_TYPE_ICONS[option]}
                          badge={option === defaultPosType ? "DEFAULT" : undefined}
                          selected={checked}
                          // The last remaining type can't be turned off — POS needs
                          // a tab to open on, and the server rejects an empty list.
                          disabled={checked && posTypes.length === 1}
                          onSelect={() => togglePosType(option)}
                        />
                      );
                    })}
                  </Box>

                  {posTypeError && (
                    <Alert severity="error" sx={{ mt: 1, fontSize: 12, py: 0.25, alignItems: "center" }}>
                      {posTypeError}
                    </Alert>
                  )}
                </Box>
              </Stack>
            </Box>

            <Divider sx={{ borderColor: "#f4f5f8" }} />

            <SettingRow
              icon={<GradingRoundedIcon fontSize="small" />}
              iconBg="#f0fdf4"
              iconColor="#16a34a"
              label="Default Sale Type"
              description="The tab POS opens on for a new sale"
            >
              <FormControl fullWidth size="small">
                <Select
                  value={defaultPosType}
                  onChange={(e) => {
                    setDefaultPosType(e.target.value as PosTypeLabel);
                    setPosTypeError(null);
                    setSaved(false);
                  }}
                  sx={selectSx}
                >
                  {/* Only enabled types are offered — the server rejects a default
                      that isn't one of pos_types, so it can't be picked here. */}
                  {posTypes.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </SettingRow>
          </Section>

          <Section
            title="Payment Settings"
            subtitle="Default payment preferences and invoice due days"
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
          startIcon={isSaving || isSavingPosTypes ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <SaveRoundedIcon />}
          onClick={handleSave}
          disabled={isSaving || isSavingPosTypes}
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
          {isSaving || isSavingPosTypes ? "Saving..." : saved ? "Saved!" : "Save Changes"}
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
