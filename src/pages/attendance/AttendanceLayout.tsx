import {AttendanceDashboard} from "./AttendanceDashboard"
import {useNavigate, useLocation} from "react-router-dom"
import {Box} from "@mui/material"
/** Tab config type */
interface AttendanceTab {
  label: string;
  path: string;
}

/** Tabs definition */
const tabs: AttendanceTab[] = [
  { label: "Dashboard", path: "" }, // index route
  { label: "Team", path: "team" },
  { label: "Leave History", path: "leave-history" },
  { label: "Leave Requests", path: "leave-requests" },
];

const AttendanceLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /** Detect active tab from URL */
  const activeTab: number = tabs.findIndex((tab) => {
    if (tab.path === "") {
      return location.pathname === "/attendance";
    }
    return location.pathname.endsWith(`/attendance/${tab.path}`);
  });

  return(
      <AttendanceDashboard />

  )

  return (
    <Box sx={{ px: 3, py: 2 }}>
      {/* ===== Header ===== */}


      {/* ===== Tabs ===== */}

      {/* ===== Child Routes ===== */}
      <AttendanceDashboard />
    </Box>
  );
};

export default AttendanceLayout;
