import { useState } from "react";
import {
  Box,
  Button,
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
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";
import TagRoundedIcon from "@mui/icons-material/TagRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import PercentRoundedIcon from "@mui/icons-material/PercentRounded";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import Pin from "@mui/icons-material/Pin";
import LoopRoundedIcon from "@mui/icons-material/LoopRounded";
import GradingRoundedIcon from "@mui/icons-material/GradingRounded";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const redTint = "#ca0022";
const headingText = "#1d2533";
const subtleText = "#8e95a3";
const cardBorder = "#ececf2";

interface InvoiceSettings {
  amountFormat: string;
  currency: string;
  dateFormat: string;
  invoicePrefix: string;
  numberOfDigits: string;
  dailySequenceReset: boolean;
  invoiceStartNumber: string;
  taxCalculationType: string;
  defaultTax: string;
  roundOff: string;
  invoiceDueDays: string;
  showCompanyLogo: boolean;
  printThankYouMessage: boolean;
  defaultPaymentMethod: string;
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

export default function InvoiceSetting() {
  const [settings, setSettings] = useState<InvoiceSettings>({
    amountFormat: "1234.56",
    currency: "INR",
    dateFormat: "DD-MM-YYYY",
    invoicePrefix: "INV",
    numberOfDigits: "4",
    dailySequenceReset: true,
    invoiceStartNumber: "1",
    taxCalculationType: "on_grand_total",
    defaultTax: "GST18",
    roundOff: "2decimal",
    invoiceDueDays: "0",
    showCompanyLogo: true,
    printThankYouMessage: true,
    defaultPaymentMethod: "cash",
  });

  const [saved, setSaved] = useState(false);

  const update = <K extends keyof InvoiceSettings>(key: K, value: InvoiceSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const previewInvoiceNumber = () => {
    const digits = parseInt(settings.numberOfDigits) || 4;
    const num = parseInt(settings.invoiceStartNumber) || 1;
    return `${settings.invoicePrefix}-${String(num).padStart(digits, "0")}`;
  };

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
          {/* Format & Currency */}
          <Section title="Format & Currency" subtitle="Control how amounts and dates appear on invoices">
            <SettingRow
              icon={<AttachMoneyRoundedIcon fontSize="small" />}
              label="Amount Format"
              description="Select how amounts are displayed"
            >
              <FormControl fullWidth size="small">
                <Select
                  value={settings.amountFormat}
                  onChange={(e) => update("amountFormat", e.target.value)}
                  sx={selectSx}
                >
                  <MenuItem value="1234.56">1,234.56 (1234.56)</MenuItem>
                  <MenuItem value="1234.56_dot">1.234,56 (European)</MenuItem>
                  <MenuItem value="1234">1,234 (No decimals)</MenuItem>
                </Select>
              </FormControl>
            </SettingRow>

            <Divider sx={{ borderColor: "#f4f5f8" }} />

            <SettingRow
              icon={<AttachMoneyRoundedIcon fontSize="small" />}
              iconBg="#eef4ff"
              iconColor="#2563eb"
              label="Currency"
              description="Select the currency for invoices"
            >
              <FormControl fullWidth size="small">
                <Select
                  value={settings.currency}
                  onChange={(e) => update("currency", e.target.value)}
                  sx={selectSx}
                >
                  <MenuItem value="INR">INR (₹) - Indian Rupee</MenuItem>
                  <MenuItem value="USD">USD ($) - US Dollar</MenuItem>
                  <MenuItem value="EUR">EUR (€) - Euro</MenuItem>
                  <MenuItem value="GBP">GBP (£) - British Pound</MenuItem>
                </Select>
              </FormControl>
            </SettingRow>

            <Divider sx={{ borderColor: "#f4f5f8" }} />

            <SettingRow
              icon={<CalendarTodayRoundedIcon fontSize="small" />}
              iconBg="#fff7ed"
              iconColor="#ea7a00"
              label="Date Format"
              description="Select the date format"
            >
              <FormControl fullWidth size="small">
                <Select
                  value={settings.dateFormat}
                  onChange={(e) => update("dateFormat", e.target.value)}
                  sx={selectSx}
                >
                  <MenuItem value="DD-MM-YYYY">DD-MM-YYYY (31-05-2025)</MenuItem>
                  <MenuItem value="MM-DD-YYYY">MM-DD-YYYY (05-31-2025)</MenuItem>
                  <MenuItem value="YYYY-MM-DD">YYYY-MM-DD (2025-05-31)</MenuItem>
                  <MenuItem value="DD/MM/YYYY">DD/MM/YYYY (31/05/2025)</MenuItem>
                </Select>
              </FormControl>
            </SettingRow>
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
                  <MenuItem value="3">3 (INV-001)</MenuItem>
                  <MenuItem value="4">4 (INV-0001)</MenuItem>
                  <MenuItem value="5">5 (INV-00001)</MenuItem>
                  <MenuItem value="6">6 (INV-000001)</MenuItem>
                </Select>
              </FormControl>
            </SettingRow>

            <Divider sx={{ borderColor: "#f4f5f8" }} />

            <SettingRow
              icon={<LoopRoundedIcon fontSize="small" />}
              iconBg="#fff1f2"
              iconColor={redTint}
              label="Daily Invoice ID Sequence Reset"
              description="Reset invoice sequence to 1 every day"
            >
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Switch
                  checked={settings.dailySequenceReset}
                  onChange={(e) => update("dailySequenceReset", e.target.checked)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: redTint },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: redTint },
                  }}
                />
              </Box>
            </SettingRow>

            {settings.dailySequenceReset && (
              <Box
                sx={{
                  mx: -2.5,
                  px: 2.5,
                  py: 1.5,
                  bgcolor: "#eff6ff",
                  borderTop: "1px solid #dbeafe",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1,
                }}
              >
                <InfoOutlinedIcon sx={{ fontSize: 16, color: "#2563eb", mt: 0.2, flexShrink: 0 }} />
                <Typography sx={{ fontSize: 12, color: "#1e40af", lineHeight: 1.6 }}>
                  If enabled, the invoice ID will start from 1 every day.<br />
                  If disabled, it will continue as a running sequence.
                </Typography>
              </Box>
            )}

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
        </Stack>

        {/* Right Column */}
        <Stack spacing={2}>
          {/* Tax Settings */}
          <Section title="Tax Settings" subtitle="Define how taxes are computed and applied">
            <SettingRow
              icon={<PercentRoundedIcon fontSize="small" />}
              iconBg="#fff7ed"
              iconColor="#ea7a00"
              label="Tax Calculation Type"
              description="Select how tax will be calculated"
            >
              <FormControl fullWidth size="small">
                <Select
                  value={settings.taxCalculationType}
                  onChange={(e) => update("taxCalculationType", e.target.value)}
                  sx={selectSx}
                >
                  <MenuItem value="on_grand_total">On Grand Total</MenuItem>
                  <MenuItem value="on_each_item">On Each Item</MenuItem>
                  <MenuItem value="exclusive">Tax Exclusive</MenuItem>
                  <MenuItem value="inclusive">Tax Inclusive</MenuItem>
                </Select>
              </FormControl>
            </SettingRow>

            <Divider sx={{ borderColor: "#f4f5f8" }} />

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

          {/* Payment & Rounding */}
          <Section title="Payment & Rounding" subtitle="Set rounding and default payment preferences">
            <SettingRow
              icon={<TagRoundedIcon fontSize="small" />}
              iconBg="#f0fdf4"
              iconColor="#16a34a"
              label="Round Off"
              description="Round off invoice total"
            >
              <FormControl fullWidth size="small">
                <Select
                  value={settings.roundOff}
                  onChange={(e) => update("roundOff", e.target.value)}
                  sx={selectSx}
                >
                  <MenuItem value="none">No Rounding</MenuItem>
                  <MenuItem value="2decimal">Round to 2 decimal places</MenuItem>
                  <MenuItem value="nearest_rupee">Round to nearest rupee</MenuItem>
                  <MenuItem value="nearest_10">Round to nearest 10</MenuItem>
                </Select>
              </FormControl>
            </SettingRow>

            <Divider sx={{ borderColor: "#f4f5f8" }} />

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
                  <MenuItem value="cheque">Cheque</MenuItem>
                </Select>
              </FormControl>
            </SettingRow>
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
          startIcon={<SaveRoundedIcon />}
          onClick={handleSave}
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
          }}
        >
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </Box>
    </Box>
  );
}
