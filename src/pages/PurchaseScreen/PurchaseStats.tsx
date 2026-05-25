// PurchaseStats.tsx
import { Grid } from "@mui/material";
import StatCard from "@components/StatCard";
import ShoppingCartIcon    from "@mui/icons-material/ShoppingCart";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import PaidIcon            from "@mui/icons-material/Paid";
import MoneyOffIcon        from "@mui/icons-material/MoneyOff";

interface PurchaseStatsData {
  total_purchase_count: string;
  total_paid_amount: string;
  total_unpaid_amount: string;
  total_amount:         string;
  this_month_spent?: string;
  last_month_spent?: string;
}

interface PurchaseStatsProps {
  data: PurchaseStatsData;
}

const fmtMoney = (v: string) =>
  (parseFloat(v) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const PurchaseStats = ({ data }: PurchaseStatsProps) => (
  <Grid container spacing={2}>

    {/* 1 — Count (no ₹, no decimals) */}
    <Grid size="auto">
      <StatCard
        radius={2}
        label="Total Purchases"
        value={String(parseInt(data.total_purchase_count, 10) || 0)}
        valuePrefix=""
        icon={<ShoppingCartIcon color="primary" />}
      />
    </Grid>

    {/* 2 — Total Amount (new card, replaces This Month Spent) */}
    <Grid size="auto">
      <StatCard
        radius={2}
        label="Total Amount"
        value={fmtMoney(data.total_amount)}
        icon={<ReceiptOutlinedIcon sx={{ color: "#1976d2" }} />}
        iconBgColor="#E3F2FD"
      />
    </Grid>

    {/* 3 — Total Paid */}
    <Grid size="auto">
      <StatCard
        radius={2}
        label="Total Paid"
        value={fmtMoney(data.total_paid_amount)}
        icon={<PaidIcon color="success" />}
        iconBgColor="#E8F5E9"
      />
    </Grid>

    {/* 4 — Total Unpaid */}
    <Grid size="auto">
      <StatCard
        radius={2}
        label="Total Unpaid"
        value={fmtMoney(data.total_unpaid_amount)}
        icon={<MoneyOffIcon color="error" />}
        iconBgColor="#FDECEA"
      />
    </Grid>

  </Grid>
);

export default PurchaseStats;
