import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import EventNoteIcon from "@mui/icons-material/EventNote";

export const StatusCards = ({ onRequestLeave }: { onRequestLeave: () => void }) => {
  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
      <Card sx={{ flex: 1 }}>
        <CardContent>
          <Typography variant="caption">Today's Hours</Typography>
          <Typography variant="h4">06h 45m</Typography>
          <Typography color="success.main">ACTIVE</Typography>
        </CardContent>
      </Card>

      <Card sx={{ flex: 1 }}>
        <CardContent>
          <Typography variant="caption">Monthly Present</Typography>
          <Typography variant="h4">96.5%</Typography>
          <Typography color="success.main">Excellent</Typography>
        </CardContent>
      </Card>

      <Card sx={{ flex: 1 }}>
        <CardContent>
          <Typography variant="caption">On-Time Ratio</Typography>
          <Typography variant="h4">92%</Typography>
          <Typography variant="body2">20 Days on time</Typography>
        </CardContent>
      </Card>

      <Stack spacing={1} justifyContent="center">
        <Button
          variant="contained"
          color="error"
          startIcon={<LogoutIcon />}
        >
          Check Out
        </Button>

        <Button
          variant="outlined"
          startIcon={<EventNoteIcon />}
          onClick={onRequestLeave}
        >
          Request Leave
        </Button>
      </Stack>
    </Stack>
  );
};
