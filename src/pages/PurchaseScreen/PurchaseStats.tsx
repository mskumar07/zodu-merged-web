// PurchaseStats.tsx
import { Grid } from "@mui/material";
import StatCard from "@components/StatCard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PaidIcon from "@mui/icons-material/Paid";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

interface PurchaseStatsData {
  total_purchase_count: string;
  total_paid_amount: string;
  total_unpaid_amount: string;
  this_month_spent: string;
  last_month_spent?: string;
}

interface PurchaseStatsProps {
  data: PurchaseStatsData;
}

const PurchaseStats = ({ data }: PurchaseStatsProps) => {
    console.log(data)
  return (
    <Grid container spacing={2}>
      <Grid item>
        <StatCard
        radius={2}
          label="Total Purchases"
          value={data.total_purchase_count}
          valuePrefix=""
          icon={<ShoppingCartIcon color="primary" />}
        />
      </Grid>

      <Grid item>
        <StatCard
          radius={2}
          label="Total Paid"
          value={data.total_paid_amount}
          icon={<PaidIcon color="success" />}
          iconBgColor="#E8F5E9"
        />
      </Grid>

      <Grid item>
        <StatCard
          radius={2}
          label="Total Unpaid"
          value={data.total_unpaid_amount}
          icon={<MoneyOffIcon color="error" />}
          iconBgColor="#FDECEA"
        />
      </Grid>

      <Grid item>
        <StatCard
          radius={2}
          label="This Month Spent"
          value={data.this_month_spent}
          icon={<CalendarMonthIcon color="primary" />}
        />
      </Grid>
    </Grid>
  );
};

export default PurchaseStats;
