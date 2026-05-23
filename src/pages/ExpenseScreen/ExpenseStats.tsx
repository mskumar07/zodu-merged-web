import { Grid } from "@mui/material";
import StatCard from "@components/StatCard";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PaidIcon from "@mui/icons-material/Paid";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import type { ExpenseSummary } from "./useExpenseApi";

interface ExpenseStatsProps {
  data: ExpenseSummary;
}

const fmt = (v: string) =>
  Number(Math.round(parseFloat(v) || 0)).toLocaleString("en-IN");

const ExpenseStats = ({ data }: ExpenseStatsProps) => (
  <Grid container spacing={2}>
    <Grid item>
      <StatCard
        radius={2}
        label="Total Expenses"
        value={data.total_expense_count}
        valuePrefix=""
        icon={<ReceiptLongIcon color="primary" />}
      />
    </Grid>
    <Grid item>
      <StatCard
        radius={2}
        label="Total Paid"
        value={fmt(data.total_paid_amount)}
        icon={<PaidIcon color="success" />}
        iconBgColor="#E8F5E9"
      />
    </Grid>
    <Grid item>
      <StatCard
        radius={2}
        label="Total Unpaid"
        value={fmt(data.total_unpaid_amount)}
        icon={<MoneyOffIcon color="error" />}
        iconBgColor="#FDECEA"
      />
    </Grid>
    <Grid item>
      <StatCard
        radius={2}
        label="This Month Spent"
        value={fmt(data.this_month_spent)}
        icon={<CalendarMonthIcon color="primary" />}
      />
    </Grid>
  </Grid>
);

export default ExpenseStats;
