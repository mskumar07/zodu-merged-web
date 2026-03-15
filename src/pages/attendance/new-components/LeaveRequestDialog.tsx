import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Grid
} from "@mui/material";

export const LeaveRequestDialog = ({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Request Leave</DialogTitle>

      <DialogContent>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12}>
            <TextField select label="Leave Type" fullWidth>
              <MenuItem value="sick">Sick Leave</MenuItem>
              <MenuItem value="casual">Casual Leave</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={6}>
            <TextField type="date" label="Start Date" fullWidth InputLabelProps={{ shrink: true }} />
          </Grid>

          <Grid item xs={6}>
            <TextField type="date" label="End Date" fullWidth InputLabelProps={{ shrink: true }} />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Reason"
              multiline
              rows={3}
              fullWidth
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="error">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};
