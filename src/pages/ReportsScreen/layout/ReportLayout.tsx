// reports/layout/ReportLayout.tsx
import { Box, Grid, Paper } from "@mui/material";
import ReportHeader from "../components/ReportHeader";
import ReportSummaryCards from "../components/ReportSummaryCards";

const ReportLayout = ({ children, summary }: any) => {
  return (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Grid container alignItems="center" justifyContent="space-between">
        {/* LEFT – SUMMARY */}
        <Grid>
          <ReportSummaryCards summary={summary} />
        </Grid>

        {/* RIGHT – FILTERS */}
        <Grid>
          <ReportHeader />
        </Grid>
      </Grid>

      <Box mt={2}>{children}</Box>
    </Paper>
  );
};

export default ReportLayout;
