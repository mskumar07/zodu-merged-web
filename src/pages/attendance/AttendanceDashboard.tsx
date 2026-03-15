import React, { useState } from 'react';
import { 
  Box, Grid, Card, Typography, Button, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Chip, 
  Avatar, Select, MenuItem, FormControl, InputLabel 
} from '@mui/material';
import {useAppSelector} from "@store/store.ts"
import { styled } from '@mui/material/styles';
import { ATTENDANCE_DATA, TEAM_DATA, LEAVE_REQUESTS } from './mockdata';
import MyTeamOverview from "./MyTeamOverview.tsx"
import type { LeaveStatus } from './types';
import {
  useCheckTodayAttendanceStatusQuery,
  useGetAttendanceHistoryQuery,
  useRequestLeaveMutation
} from "@store/services/attendanceApi";
import AttendanceStatsActions from
  "./AttendanceStatsActions";
import MyAttendanceTable from "./MyattendanceTable";
import RequestLeaveDialog from "./components/RequestLeaveDialog"
import {BranchId, ZoduId} from "@store/slices/userSlice"
import LeaveRequestsContainer from "./LeaveRequestsContainer"



const isValidTime = (time?: string) =>
  time && time !== "--" && time !== "-- : --";

const calculateHours = (checkIn: string, checkOut: string) => {
  try {
    const start = new Date(`1970-01-01 ${checkIn}`);
    const end = new Date(`1970-01-01 ${checkOut}`);
    const diffMs = end.getTime() - start.getTime();

    if (diffMs <= 0) return "-- : --";

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor(
      (diffMs % (1000 * 60 * 60)) / (1000 * 60)
    );

    return `${hours}h ${minutes}m`;
  } catch {
    return "-- : --";
  }
};

type AttendanceItem = {
  attendance_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
};

type AttendanceWithHours = AttendanceItem & {
  total_hours: string | null;
};

const calculateTotalHours = (
  records: AttendanceItem[]
): AttendanceWithHours[] => {
  const parseTime = (dateStr: string, timeStr: string) => {
    return new Date(`${dateStr} ${timeStr}`);
  };

  const formatDuration = (ms: number) => {
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")} hrs`;
  };

  if(!records){
    return []
  }

  return records?.map((record) => {
    const { date, check_in, check_out } = record;

    if (!check_in || !check_out) {
      return { ...record, total_hours: null };
    }

    const checkInTime = parseTime(date, check_in);
    const checkOutTime = parseTime(date, check_out);

    const diffMs = checkOutTime.getTime() - checkInTime.getTime();

    if (diffMs <= 0) {
      return { ...record, total_hours: null };
    }

    return {
      ...record,
      total_hours: formatDuration(diffMs),
    };
  });
};



// Custom Styled Components for Pixel Perfection
const StatCard = styled(Card)({
  padding: '20px',
  borderRadius: '16px',
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
  height: '100%'
});

const StatusChip = styled(Chip)<{ status: string }>(({ status }) => ({
  fontWeight: 'bold',
  fontSize: '0.65rem',
  borderRadius: '4px',
  backgroundColor: 
    status === 'ON TIME' || status === 'PRESENT' ? '#E8F5E9' : 
    status === 'LATE' ? '#FFF3E0' : '#E3F2FD',
  color: 
    status === 'ON TIME' || status === 'PRESENT' ? '#2E7D32' : 
    status === 'LATE' ? '#EF6C00' : '#1976D2',
}));

export const AttendanceDashboard: React.FC = () => {
  const [filter, setFilter] = useState<LeaveStatus | 'All'>('Pending');
  const [openLeaveDialog, setOpenLeaveDialog] = useState(false);

    const employeeId = "db02d538-96ad-43dd-be62-afcd9921f711";

  /* ===== API Calls ===== */

  const {
    data: todayStatusResponse,
    isLoading: isTodayStatusLoading,
  } = useCheckTodayAttendanceStatusQuery(employeeId);

  const {
    data: attendanceHistoryData,
    isLoading: isAttendanceHistoryLoading,
  } = useGetAttendanceHistoryQuery(employeeId);
  const branchId = useAppSelector(BranchId);
  const zoduId = useAppSelector(ZoduId)
  const [requestLeave] = useRequestLeaveMutation();
  const filteredLeaves = LEAVE_REQUESTS.filter(l => filter === 'All' || l.status === filter);
  
  const isSummaryLoading =
    isTodayStatusLoading || isAttendanceHistoryLoading;

  const today = todayStatusResponse?.data;
  const summary = attendanceHistoryData?.summary;
  const records = calculateTotalHours(attendanceHistoryData?.records);
  const todayStatusText = !today?.has_checked_in
  ? "Not checked in yet"
  : today.has_checked_in && !today.has_checked_out
  ? "Checked in"
  : "Checked out";

const todayHours =
  isValidTime(today?.check_in) && isValidTime(today?.check_out)
    ? calculateHours(today.check_in, today.check_out)
    : "-- : --";
  const TARGET_HOURS = 9;

  return (
    <Box sx={{ bgcolor: '#F8F9FA', p: 1, minHeight: '100vh' }}>
      {/* Top Header Stats */}


<AttendanceStatsActions
  isLoading={isSummaryLoading}
  todayHours={todayHours}
  todayStatusText={
    today?.has_checked_in
      ? `Checked-in at ${today.check_in}`
      : "Not checked in yet"
  }
  isActive={today?.is_currently_active}
  totalPresent={summary?.total_present_this_month}
  onTimeRatio={summary?.total_absent_this_month}
  onCheckout={() => console.log("Checkout clicked")}
  onRequestLeave={()=>setOpenLeaveDialog(true)}   // ✅ THIS
/>

      <Grid container spacing={3}>
        {/* Left Column: Attendance Record & Team Overview */}
        {/* <Grid size={{xs:12 ,md:8}}>
          <StatCard sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">My Attendance Record</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#999', fontSize: '0.75rem' }}>DATE</TableCell>
                    <TableCell sx={{ color: '#999', fontSize: '0.75rem' }}>CLOCK IN</TableCell>
                    <TableCell sx={{ color: '#999', fontSize: '0.75rem' }}>STATUS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ATTENDANCE_DATA.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell sx={{ fontWeight: 500 }}>{row.date}</TableCell>
                      <TableCell>{row.clockIn}</TableCell>
                      <TableCell><StatusChip label={row.status} status={row.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </StatCard>
        </Grid> */}
        <Grid size={{xs:12 ,md:8}}>


          <MyTeamOverview
  members={[
    {
      id: "1",
      name: "Isabella Rossi",
      role: "UI/UX Designer",
      status: "PRESENT",
      clockIn: "08:55 AM",
      workingHours: "8h 15m",
    },
    {
      id: "2",
      name: "Marco Bianchi",
      role: "Frontend Dev",
      status: "LATE",
      clockIn: "09:12 AM",
    },
    {
      id: "3",
      name: "Maria Garcia",
      role: "Backend Dev",
      status: "ON LEAVE",
    },
  ]}
  
/>
</Grid>

        {/* Right Column: Leave Requests (The Second Page Content) */}
        <Grid size={{xs:12 ,md:4}}>

          <LeaveRequestsContainer />
        </Grid>
      </Grid>
      <Grid>
        
      </Grid>
      <Grid container>
        <Grid size={{xs:12,md:12}} sx={{
          mt:1
        }}>
                  <MyAttendanceTable
  records={records}
  isLoading={isAttendanceHistoryLoading}
  // onCheckout={handleCheckout}
/>
          {/* <MyTeamOverview
  members={[
    {
      id: "1",
      name: "Isabella Rossi",
      role: "UI/UX Designer",
      status: "PRESENT",
      clockIn: "08:55 AM",
      workingHours: "8h 15m",
    },
    {
      id: "2",
      name: "Marco Bianchi",
      role: "Frontend Dev",
      status: "LATE",
      clockIn: "09:12 AM",
    },
    {
      id: "3",
      name: "Maria Garcia",
      role: "Backend Dev",
      status: "ON LEAVE",
    },
  ]}
  
/> */}
</Grid>

      </Grid>
      <RequestLeaveDialog
  open={openLeaveDialog}
  setOpen={setOpenLeaveDialog}
        employee_id={"3d821dcf-47b2-4178-b5f2-c549bbac2caf"}
        zodu_id={zoduId}
        branch_id={branchId}
        requestLeaveApi={requestLeave}
/>
    </Box>
  );
};