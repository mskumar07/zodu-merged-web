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

const fmtMoney = (v: string) =>
  (parseFloat(v) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ExpenseStats = ({ data }: ExpenseStatsProps) => (
  <Grid container spacing={2}>
    <Grid size="auto">
      <StatCard
        radius={2}
        label="Total Expenses"
        value={String(parseInt(data.total_expense_count, 10) || 0)}
        valuePrefix=""
        icon={<ReceiptLongIcon color="primary" />}
      />
    </Grid>
    <Grid size="auto">
      <StatCard
        radius={2}
        label="Total Paid"
        value={fmtMoney(data.total_paid_amount)}
        icon={<PaidIcon color="success" />}
        iconBgColor="#E8F5E9"
      />
    </Grid>
    <Grid size="auto">
      <StatCard
        radius={2}
        label="Total Unpaid"
        value={fmtMoney(data.total_unpaid_amount)}
        icon={<MoneyOffIcon color="error" />}
        iconBgColor="#FDECEA"
      />
    </Grid>
    <Grid size="auto">
      <StatCard
        radius={2}
        label="This Month Spent"
        value={fmtMoney(data.this_month_spent)}
        icon={<CalendarMonthIcon color="primary" />}
      />
    </Grid>
  </Grid>
);

export default ExpenseStats;
