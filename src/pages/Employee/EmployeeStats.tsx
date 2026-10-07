import { memo } from "react";
import { Grid } from "@mui/material";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import StatCard from "@components/StatCard";
import { useEmployeeStats, type EmployeeStats as EmployeeStatsData } from "./useEmployeeApi";

// Memoised: the table's scrolling, searching and modals re-render the page
// constantly, and none of that should touch these cards. `listStats` is passed
// when the visible list already carries the totals; otherwise the cards fetch.
function EmployeeStats({ listStats }: { listStats?: EmployeeStatsData }) {
  const { data, isLoading } = useEmployeeStats(listStats);

  return (
    // Same layout as the Purchase page's cards: each one only as wide as its content.
    <Grid container spacing={2} sx={{ px: 1, pt: 1.5, pb: 0.5, flexShrink: 0 }}>
      <Grid size="auto">
        <StatCard
          label="Total Employees"
          value={data?.totalEmployees ?? 0}
          valuePrefix=""
          loading={isLoading}
          icon={<PeopleAltOutlinedIcon fontSize="small" color="primary" />}
        />
      </Grid>
      <Grid size="auto">
        <StatCard
          label="Users (Employees with login)"
          value={data?.loginUsers ?? 0}
          valuePrefix=""
          loading={isLoading}
          icon={<ManageAccountsOutlinedIcon fontSize="small" sx={{ color: "#1976d2" }} />}
          iconBgColor="#E3F2FD"
        />
      </Grid>
    </Grid>
  );
}

export default memo(EmployeeStats);
