import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Avatar,
  IconButton,
  TextField,
  Button,
  Menu,
  MenuItem,
  Pagination,
  Skeleton,
  Fab,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";

import {useGetTeamDashboardQuery, useGetTeamEmployeeListQuery} from "@services/attendanceApi";
import { useAppSelector } from "@store/store";
import { BranchId } from "@store/slices/userSlice";

/* =====================
   Types
===================== */
type Status = "PRESENT" | "ABSENT" | "ON LEAVE";

interface TeamMember {
  name: string;
  employee_id: string;
  role: string;
  status: Status;
  check_in: string;
  check_out: string;
}

/* =====================
   Static Data
===================== */
const teamMembers: TeamMember[] = [
  {
    name: "Gordon Ramsay",
    employee_id: "gordon.r@company.com",
    role: "Head Chef",
    status: "PRESENT",
    check_in: "08:45 AM",
    check_out: "05:30 PM ",
  },
  {
    name: "Moe Szyslak",
    employee_id: "moe.s@company.com",
    role: "Bartender",
    status: "ABSENT",
    check_in: "08:45 AM",
    check_out: "05:30 PM ",
  },
  {
    name: "Rachel Green",
    employee_id: "rachel.g@company.com",
    role: "Waitstaff",
    status: "ON LEAVE",
    check_in: "08:45 AM",
    check_out: "05:30 PM ",
  },
  {
    name: "Phoebe Buffay",
    employee_id: "phoebe.b@company.com",
    role: "Entertainer",
    status: "PRESENT",
    check_in: "08:45 AM",
    check_out: "05:30 PM ",
  },
];

/* =====================
   Component
===================== */
const AttendanceTeam: React.FC = () => {
  const [filterAnchor, setFilterAnchor] = React.useState<null | HTMLElement>(
    null
  );
  const [page, setPage] = React.useState(1); // MUI Pagination is 1-based
  const [limit, setLimit] = React.useState(5);

  const branch_id = useAppSelector(BranchId);
  const [filterDate, setFilterDate] = React.useState<Date | null>(new Date());
  const { data:teamDashboardData, error:teamDashboardError, isLoading:teamDashboardLoading } = useGetTeamDashboardQuery();
  const {data:teamEmployeeList, error:teamEmployeeListError, isLoading:teamEmployeeListLoading} = useGetTeamEmployeeListQuery({branch_id: branch_id, date: filterDate ? filterDate.toISOString().split("T")[0] : undefined, page,limit,});
  console.log("Team Dashboard Data:", teamDashboardData);
  console.log("Team Employee List Data:", teamEmployeeList);
  return (
    <Box>
      {/* ===== Summary Cards ===== */}
      <Grid container spacing={3} mb={3}>
         {teamDashboardLoading ? (
    <>
      {[1, 2, 3, 4].map((i) => (
        <Grid key={i} size={{ xs: 12, md: 3 }}>
          <SkeletonSummaryCard />
        </Grid>
      ))}
    </>
  ) : (
        <>
        <Grid size={{ xs: 12, md: 3 }}>
          <SummaryCard title="Total Employees" value={Number(teamDashboardData?.total_employees) || 0} icon="👥" />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <SummaryCard title="Today Present" value={teamDashboardData?.today_present || 0} color="success" />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <SummaryCard title="Today Absent" value={Number(teamDashboardData?.total_employees) - Number(teamDashboardData?.today_present)} color="error" />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <SummaryCard title="On Leave" value={teamDashboardData?.on_leave || 0} color="warning" />
        </Grid>
        </>
  )}
      </Grid>

      {/* ===== Team Attendance Table ===== */}
      <Card variant="outlined">
        <CardContent>
          {/* Header */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">Team Attendance List</Typography>

            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                placeholder="Search team members..."
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1 }} />,
                }}
              />

              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={(e) => setFilterAnchor(e.currentTarget)}
              >
                Filter
              </Button>

              <Menu
                anchorEl={filterAnchor}
                open={Boolean(filterAnchor)}
                onClose={() => setFilterAnchor(null)}
              >
                <MenuItem>Present</MenuItem>
                <MenuItem>Absent</MenuItem>
                <MenuItem>On Leave</MenuItem>
              </Menu>

              <Button variant="contained" color="error">
                Export
              </Button>
            </Stack>
          </Stack>

          {/* Table */}
          <TableContainer component={Paper} elevation={0}>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>EMPLOYEE</TableCell>
        <TableCell>ROLE</TableCell>
        <TableCell>STATUS</TableCell>
        <TableCell>CHECK-IN</TableCell>
        <TableCell align="right">ACTIONS</TableCell>
      </TableRow>
    </TableHead>

    <TableBody>
      {teamEmployeeListLoading ? (
        // Skeleton rows
        Array.from({ length: 5 }).map((_, index) => (
          <TableRowSkeleton key={index} />
        ))
      ) : teamEmployeeList?.length ? (
        // Actual data
        teamEmployeeList.map((member, index) => (
          <TableRow key={index}>
            <TableCell>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar>{member.avatar}</Avatar>
                <Box>
                  <Typography fontWeight={500}>
                    {member.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {member.email}
                  </Typography>
                </Box>
              </Stack>
            </TableCell>

            <TableCell>{member.role}</TableCell>

            <TableCell>
              <Chip
                label={member.status}
                size="small"
                color={
                  member.status === "PRESENT"
                    ? "success"
                    : member.status === "ABSENT"
                    ? "error"
                    : "warning"
                }
              />
            </TableCell>

            <TableCell>{member.checkIn}</TableCell>

            <TableCell align="right">
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))
      ) : (
        // Empty state
        <TableRow>
          <TableCell colSpan={5} align="center">
            <Typography color="text.secondary">
              No employees found
            </Typography>
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
</TableContainer>


          {/* Pagination */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mt={2}
          >
            <Typography variant="body2" color="text.secondary">
              Showing 1 to 4 of 12 employees
            </Typography>
            <Pagination count={3} page={1} />
          </Stack>
        </CardContent>
      </Card>

      {/* ===== Floating Add Button ===== */}
      <Fab
        color="error"
        sx={{ position: "fixed", bottom: 24, right: 24 }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default AttendanceTeam;

/* =====================
   Reusable Summary Card
===================== */
interface SummaryCardProps {
  title: string;
  value: string|number;
  color?: "success" | "error" | "warning";
  icon?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  color,
  icon,
}) => (
  <Card variant="outlined">
    <CardContent>
      <Stack direction="row" justifyContent="space-between">
        <Typography color="text.secondary">{title}</Typography>
        {icon && <Typography>{icon}</Typography>}
      </Stack>

      <Typography
        variant="h4"
        mt={1}
        color={color ? `${color}.main` : "text.primary"}
      >
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const SkeletonSummaryCard: React.FC = () => (
  <Card variant="outlined">
    <CardContent>
      <Stack direction="row" justifyContent="space-between">
        <Skeleton variant="text" width={120} height={20} />
        <Skeleton variant="circular" width={24} height={24} />
      </Stack>

      <Skeleton variant="text" width={80} height={48} sx={{ mt: 1 }} />
    </CardContent>
  </Card>
);


const TableRowSkeleton = () => (
  <TableRow>
    {/* EMPLOYEE */}
    <TableCell>
      <Stack direction="row" spacing={2} alignItems="center">
        <Skeleton variant="circular" width={40} height={40} />
        <Stack spacing={0.5}>
          <Skeleton width={120} height={18} />
          <Skeleton width={160} height={14} />
        </Stack>
      </Stack>
    </TableCell>

    {/* ROLE */}
    <TableCell>
      <Skeleton width={80} />
    </TableCell>

    {/* STATUS */}
    <TableCell>
      <Skeleton variant="rounded" width={70} height={24} />
    </TableCell>

    {/* CHECK-IN */}
    <TableCell>
      <Skeleton width={90} />
    </TableCell>

    {/* ACTIONS */}
    <TableCell align="right">
      <Skeleton variant="circular" width={24} height={24} />
    </TableCell>
  </TableRow>
);

