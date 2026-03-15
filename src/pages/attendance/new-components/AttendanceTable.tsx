import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Card,
  CardHeader
} from "@mui/material";

const rows = [
  { date: "Oct 20, 2023", in: "09:02 AM", out: "--", hours: "06h 45m", status: "ON TIME" },
  { date: "Oct 19, 2023", in: "08:58 AM", out: "06:15 PM", hours: "09h 17m", status: "ON TIME" },
  { date: "Oct 18, 2023", in: "09:15 AM", out: "06:00 PM", hours: "08h 45m", status: "LATE" }
];

export const AttendanceTable = () => (
  <Card>
    <CardHeader title="My Attendance Record" subheader="Weekly clock-in activity" />
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Date</TableCell>
          <TableCell>Clock In</TableCell>
          <TableCell>Clock Out</TableCell>
          <TableCell>Total Hours</TableCell>
          <TableCell>Status</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.date}>
            <TableCell>{row.date}</TableCell>
            <TableCell>{row.in}</TableCell>
            <TableCell>{row.out}</TableCell>
            <TableCell>{row.hours}</TableCell>
            <TableCell>
              <Chip
                label={row.status}
                color={row.status === "ON TIME" ? "success" : "warning"}
                size="small"
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Card>
);
