import { Box, MenuItem, Select, type SelectProps } from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";
import PaymentsIcon from "@mui/icons-material/Payments";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import ReceiptIcon from "@mui/icons-material/Receipt";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

const MODE_ICON: Record<string, SvgIconComponent> = {
  Cash: PaymentsIcon,
  UPI: QrCode2Icon,
  "Bank Transfer": AccountBalanceIcon,
  Card: CreditCardIcon,
  Cheque: ReceiptIcon,
  Others: MoreHorizIcon,
};

const ModeLabel = ({ mode, color }: { mode: string; color: string }) => {
  const Icon = MODE_ICON[mode] ?? MoreHorizIcon;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Icon sx={{ fontSize: 18, color }} />
      {mode}
    </Box>
  );
};

interface Props extends Omit<SelectProps<string>, "children" | "renderValue"> {
  options: readonly string[];
  /** Font size for the options, matching the host dialog's inputs. */
  optionFontSize?: number | string;
}

/** Payment mode dropdown with a leading icon on the selected value and every option. */
export default function PaymentModeSelect({ options, optionFontSize = "0.875rem", ...props }: Props) {
  return (
    <Select {...props} renderValue={(v) => <ModeLabel mode={v} color="#D2042D" />}>
      {options.map((m) => (
        <MenuItem key={m} value={m} sx={{ fontSize: optionFontSize, fontWeight: 600 }}>
          <ModeLabel mode={m} color="#6B7280" />
        </MenuItem>
      ))}
    </Select>
  );
}
