// Same structure as PurchaseStats: project StatCard inside a Grid.
import { memo } from "react";
import type { ReactNode } from "react";
import { Grid } from "@mui/material";
import StatCard from "@components/StatCard";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import type { AccountingSummary } from "./types";
import { fmtAmount } from "./format";

interface CardDef {
  key:    keyof AccountingSummary;
  label:  string;
  icon:   ReactNode;
  color:  string;
  bg:     string;
}

const CARDS: CardDef[] = [
  { key: "sales",     label: "Total Sales",     icon: <ArrowUpwardIcon />,                color: "#16A34A", bg: "#E8F5E9" },
  { key: "purchases", label: "Total Purchases", icon: <ShoppingCartOutlinedIcon />,       color: "#D32F2F", bg: "#FDECEA" },
  { key: "payments",  label: "Total Payments",  icon: <AccountBalanceWalletOutlinedIcon />, color: "#1976D2", bg: "#E3F2FD" },
  { key: "receipts",  label: "Total Receipts",  icon: <ArrowForwardIcon />,               color: "#F59E0B", bg: "#FFF8E1" },
  { key: "expenses",  label: "Total Expenses",  icon: <CreditCardIcon />,                 color: "#E11D48", bg: "#FCE4EC" },
];

function AccountingStats({ summary }: { summary: AccountingSummary }) {
  return (
    <Grid container spacing={2}>
      {CARDS.map((c) => {
        const bucket = summary[c.key];
        return (
          <Grid size="auto" key={c.key}>
            <StatCard
              radius={2}
              label={c.label}
              value={fmtAmount(bucket.amount)}
              icon={c.icon}
              iconColor={c.color}
              iconBgColor={c.bg}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}

export default memo(AccountingStats);
