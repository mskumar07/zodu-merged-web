import React from "react";
import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Typography,
  Button,
  Skeleton,
  Card,
  Chip
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { styled } from "@mui/material/styles";
import {formatDateTime} from "@utils/util"

/* =======================
   Types
======================= */

export interface AttendanceRecord {
  date: string;
  clock_in?: string;
  clock_out?: string;
  total_hours?: string;
  status: "PRESENT" | "LATE" | "ABSENT" | "ON TIME" | string;
}

interface MyAttendanceTableProps {
  records: AttendanceRecord[];
  isLoading: boolean;
  onCheckout?: (row: AttendanceRecord) => void;
}

/* =======================
   Styled Components
======================= */

const StatCard = styled(Card)({
  padding: "20px",
  borderRadius: "16px",
  boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
});

const headCell = {
  color: "#999",
  fontSize: "0.75rem",
  fontWeight: 600,
};

const StatusChip = styled(Chip)<{ status: string }>(({ status }) => ({
  fontWeight: 700,
  fontSize: "0.65rem",
  height: 22,
  borderRadius: 6,
  backgroundColor:
    status === "Present" || status === "ON TIME"
      ? "#E8F5E9"
      : status === "LATE"
      ? "#FFF3E0"
      : "#FDECEA",
  color:
    status === "Present" || status === "ON TIME"
      ? "#2E7D32"
      : status === "LATE"
      ? "#EF6C00"
      : "#C62828",
}));

/* =======================
   Skeleton Rows
======================= */

const TableSkeleton = () => (
  <>
    {[1, 2, 3, 4].map((row) => (
      <TableRow key={row}>
        {[1, 2, 3, 4, 5, 6].map((cell) => (
          <TableCell key={cell}>
            <Skeleton height={20} />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);

/* =======================
   Component
======================= */

const MyAttendanceTable: React.FC<MyAttendanceTableProps> = ({
  records,
  isLoading,
//   onCheckout,
}) => {
  return (
    <StatCard>
      <Typography variant="h6" fontWeight={700} mb={2}>
        My Attendance Record
      </Typography>

      <TableContainer 
      sx={{
    // minHeight:320,
    maxHeight: 360,
    overflowY: "auto",
    "&::-webkit-scrollbar": {
            width: "8px", // scrollbar width
            display: "block"
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#aaa", // scrollbar color
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f1f1f1", // track color
    },
    }}>
        <Table stickyHeader>
          {/* ===== Table Head ===== */}
          <TableHead>
            <TableRow>
              <TableCell sx={headCell}>DATE</TableCell>
              <TableCell sx={headCell}>CLOCK IN</TableCell>
              <TableCell sx={headCell}>CLOCK OUT</TableCell>
              <TableCell sx={headCell}>TOTAL HOURS</TableCell>
              <TableCell sx={headCell}>STATUS</TableCell>
              {/* <TableCell sx={headCell} align="right">
                CHECKOUT
              </TableCell> */}
            </TableRow>
          </TableHead>

          {/* ===== Table Body ===== */}
          <TableBody>
            {isLoading ? (
              <TableSkeleton />
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary">
                    No attendance records found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              records.map((row, i) => {
                const canCheckout = row.clock_in && !row.clock_out;

                return (
                  <TableRow key={i} hover>
                    <TableCell fontWeight={600}>
                      {formatDateTime(row.date)}
                    </TableCell>

                    <TableCell>
                      {row.check_in ?? "-- : --"}
                    </TableCell>

                    <TableCell>
                      {row.check_out ?? "-- : --"}
                    </TableCell>

                    <TableCell fontWeight={600}>
                      {row.total_hours ?? "-- : --"}
                    </TableCell>

                    <TableCell>
                      <StatusChip
                        label={row.status}
                        status={row.status}
                        size="small"
                      />
                    </TableCell>

                    {/* <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<LogoutIcon />}
                        disabled={!canCheckout}
                        // onClick={() => onCheckout?.(row)}
                        sx={{ borderRadius: "8px" }}
                      >
                        Checkout
                      </Button>
                    </TableCell> */}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </StatCard>
  );
};

export default MyAttendanceTable;
