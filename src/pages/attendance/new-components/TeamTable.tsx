import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  Chip,
  IconButton,
  Card,
  CardHeader
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";

const team = [
  { name: "Isabella Rossi", role: "UI/UX Designer", status: "PRESENT", in: "08:55 AM", hours: "8h 15m" },
  { name: "Marco Bianchi", role: "Frontend Dev", status: "LATE", in: "09:12 AM", hours: "--" },
  { name: "Maria Garcia", role: "Backend Dev", status: "ON LEAVE", in: "--", hours: "--" }
];

export const TeamTable = () => (
  <Card>
    <CardHeader title="My Team Overview" />
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Employee</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Clock In</TableCell>
          <TableCell>Working Hours</TableCell>
          <TableCell>Action</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {team.map((emp) => (
          <TableRow key={emp.name}>
            <TableCell>
              <Avatar sx={{ mr: 1 }} /> {emp.name}
            </TableCell>
            <TableCell>
              <Chip label={emp.status} size="small" />
            </TableCell>
            <TableCell>{emp.in}</TableCell>
            <TableCell>{emp.hours}</TableCell>
            <TableCell>
              <IconButton>
                <ChatIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Card>
);
