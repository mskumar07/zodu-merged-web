import { useState, ChangeEvent } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Grid
} from "@mui/material";
import { toast } from "react-toastify";

import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

/* ---------- Types ---------- */

interface RequestLeaveFormData {
  leave_type: string;
  start_date: Dayjs | null;
  end_date: Dayjs | null;
  reason: string;
}

interface RequestLeaveDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  employee_id: string;
  zodu_id: string;
  branch_id: string;
  requestLeaveApi: (payload: RequestLeavePayload) => Promise<any>;
}

interface RequestLeavePayload {
  employee_id: string;
  zodu_id: string;
  branch_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
}

/* ---------- Component ---------- */

const RequestLeaveDialog: React.FC<RequestLeaveDialogProps> = ({
  open,
  setOpen,
  employee_id,
  zodu_id,
  branch_id,
  requestLeaveApi
}) => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<RequestLeaveFormData>({
    leave_type: "",
    start_date: null,
    end_date: null,
    reason: ""
  });

  /* ---------- Handlers ---------- */

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    const { leave_type, start_date, end_date, reason } = formData;

    if (!leave_type || !start_date || !end_date || !reason) {
      toast.error("All fields are required");
      return false;
    }

    if (end_date.isBefore(start_date, "day")) {
      toast.error("End date cannot be before start date");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload: RequestLeavePayload = {
      employee_id,
      zodu_id,
      branch_id,
      leave_type: formData.leave_type,
      start_date: formData.start_date!.format("YYYY-MM-DD"),
      end_date: formData.end_date!.format("YYYY-MM-DD"),
      reason: formData.reason
    };

    try {
      setLoading(true);
      await requestLeaveApi(payload);
      toast.success("Leave request submitted successfully");
      setOpen(false);

      setFormData({
        leave_type: "",
        start_date: null,
        end_date: null,
        reason: ""
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit leave request");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UI ---------- */

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={() => !loading && setOpen(false)} fullWidth>
        <DialogTitle>Request Leave</DialogTitle>

        <DialogContent>
          <Grid container spacing={2} mt={1}>
            <Grid size={{ xs: 12 }}>
              <TextField
                select
                label="Leave Type"
                name="leave_type"
                value={formData.leave_type}
                onChange={handleChange}
                fullWidth
                size="small"
              >
                <MenuItem value="Casual Leave">Casual Leave</MenuItem>
                <MenuItem value="Sick Leave">Sick Leave</MenuItem>
                <MenuItem value="Paid Leave">Paid Leave</MenuItem>
                <MenuItem value="Unpaid Leave">Unpaid Leave</MenuItem>
              </TextField>
            </Grid>

            {/* Start Date */}
            <Grid size={{ xs: 12, md: 6 }}>
              <DatePicker
                label="Start Date"
                value={formData.start_date}
                minDate={dayjs()} // future dates only
                onChange={(newValue) =>
                  setFormData((prev) => ({
                    ...prev,
                    start_date: newValue,
                    end_date: null
                  }))
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small"
                  }
                }}
              />
            </Grid>

            {/* End Date */}
            <Grid size={{ xs: 12, md: 6 }}>
              <DatePicker
                label="End Date"
                value={formData.end_date}
                minDate={formData.start_date || dayjs()}
                disabled={!formData.start_date}
                onChange={(newValue) =>
                  setFormData((prev) => ({
                    ...prev,
                    end_date: newValue
                  }))
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small"
                  }
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                multiline
                rows={3}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default RequestLeaveDialog;
