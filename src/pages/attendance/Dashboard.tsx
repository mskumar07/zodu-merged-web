import { Box } from "@mui/material";
import { useState } from "react";
import { StatusCards } from "./new-components/StatusCards";
import { AttendanceTable } from "./new-components/AttendanceTable";
import { TeamTable } from "./new-components/TeamTable";
import { LeaveRequestDialog } from "./new-components/LeaveRequestDialog";

export default function Dashboard() {
  const [openLeave, setOpenLeave] = useState(false);

  return (
    <Box p={1} display="flex" flexDirection="column" gap={3}>
      <StatusCards onRequestLeave={() => setOpenLeave(true)} />
      <AttendanceTable />
      <TeamTable />

      <LeaveRequestDialog
        open={openLeave}
        onClose={() => setOpenLeave(false)}
      />
    </Box>
  );
}
