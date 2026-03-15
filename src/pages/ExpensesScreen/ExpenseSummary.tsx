// ExpenseSummary.tsx
import { Grid } from "@mui/material";
import StatCard from "@components/StatCard";
import PaidIcon from "@mui/icons-material/Paid";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

interface ExpenseSummaryData {
  total_expense: string;
  total_paid: string;
  total_unpaid: string;
  this_month: string;
  last_month?: string;
}

interface ExpenseSummaryProps {
  data: ExpenseSummaryData;
}

const ExpenseSummary = ({ data }: ExpenseSummaryProps) => {
  return (
    <Grid container spacing={2}>
      <Grid item>
        <StatCard
          label="Total Expense"
          value={data.total_expense}
          icon={<PaidIcon color="primary" />}
        />
      </Grid>

      <Grid item>
        <StatCard
          label="Total Paid"
          value={data.total_paid}
          icon={<PaidIcon color="success" />}
          iconBgColor="#E8F5E9"
        />
      </Grid>

      <Grid item>
        <StatCard
          label="Total Unpaid"
          value={data.total_unpaid}
          icon={<MoneyOffIcon color="error" />}
          iconBgColor="#FDECEA"
        />
      </Grid>

      <Grid item>
        <StatCard
          label="This Month"
          value={data.this_month}
          icon={<CalendarMonthIcon color="primary" />}
        />
      </Grid>
    </Grid>
  );
};

export default ExpenseSummary;
