import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Tooltip from "@mui/material/Tooltip";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SwitchAccountIcon from "@mui/icons-material/SwitchAccount";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import styles from "./index.module.css";
import { useTheme } from "@mui/material/styles";
import { drawerWidth, collapsedDrawerWidth } from "../Sidebar/index";
import { MenuItem, Select } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@store/store";
import {
  AllCompanies,
  BranchId,
  BranchName,
  UserProfile,
  ZoduId,
  addUserData,
  setRoleAccess,
} from "@store/slices/userSlice";
import { authApis } from "@pages/auth/Authapi";
import { useNavigate, useLocation } from "react-router-dom";

const TopBar: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const profile = useAppSelector(UserProfile);

  const isReportSubPage =
    location.pathname.startsWith("/reports") &&
    location.pathname !== "/reports";
  // Sidebar reserves only the collapsed rail width on the billing route (it hover-
  // expands as an overlay without affecting layout there) — match that here so the
  // top bar / company name don't sit under a phantom 240px gap.
  const isBillingRoute = location.pathname.startsWith("/pos");
  const reservedSidebarWidth = isBillingRoute ? collapsedDrawerWidth : drawerWidth;
  const zoduId = useAppSelector(ZoduId);
  const branchId = useAppSelector(BranchId);
  const branchName = useAppSelector(BranchName);
  const companies = useAppSelector(AllCompanies);

  const selectedCompany =
    companies.find((company) => company.zodu_id === zoduId) ?? null;

  const companyBranches = selectedCompany?.branches ?? [];
  const isEmployee = profile?.user_type?.toLowerCase() === "employee";

  const handleBranchChange = async (selectedBranchId: string) => {
    const found = companyBranches.find((branch) => branch.branch_id === selectedBranchId);
    if (!found || !selectedCompany) return;

    dispatch(
      addUserData({
        branchId: found.branch_id,
        branchName: found.branch_name,
        zoduId: selectedCompany.zodu_id,
      })
    );

    try {
      const roleAccess = await authApis.getRoleAccess(selectedCompany.zodu_id, found.branch_id);
      dispatch(setRoleAccess(roleAccess));
    } catch {
      dispatch(setRoleAccess([]));
    }
  };

  return (
    <AppBar
      position="fixed"
      className={styles.appBar}
      sx={{
        backgroundColor: "#fff",
        width: { sm: `calc(100% - ${reservedSidebarWidth}px)` },
        ml: { sm: reservedSidebarWidth },
        transition: theme.transitions.create(["width", "margin"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        borderBottom: "1px solid " + theme.palette.divider,
      }}
      elevation={0}
    >
      <Toolbar className={styles.toolbar}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {isReportSubPage && (
            <Tooltip title="Back to Reports">
              <IconButton
                size="small"
                onClick={() => navigate("/reports")}
                sx={{
                  color: "#fff",
                  bgcolor: "#c8101f",
                  borderRadius: "8px",
                  p: 0.6,
                  mr: 0.5,
                  "&:hover": { bgcolor: "#a50d19" },
                }}
              >
                <ArrowBackIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}
          <Typography sx={{ color: "black", fontWeight: 600, fontSize: 20, textTransform: "capitalize" }}>
            {selectedCompany?.restaurant_name || selectedCompany?.company_name || profile?.restaurant_name || ""}
          </Typography>
          <Tooltip title={isEmployee ? "" : "Switch Organisation"}>
            <span>
              <IconButton
                size="small"
                disabled={isEmployee}
                onClick={() => navigate("/select-branch", { state: { companies, fromSwitch: true } })}
                sx={{
                  color: "#c8101f",
                  bgcolor: "rgba(200,16,31,0.07)",
                  borderRadius: "8px",
                  p: 0.6,
                  "&:hover": { bgcolor: "rgba(200,16,31,0.14)" },
                  "&.Mui-disabled": { color: "#c8c8c8", bgcolor: "rgba(0,0,0,0.04)" },
                }}
              >
                <SwitchAccountIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Select
            size="small"
            value={branchId}
            onChange={(e) => handleBranchChange(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            {companyBranches.length > 0
              ? companyBranches.map((b) => (
                  <MenuItem key={b.branch_id} value={b.branch_id}>
                    {b.branch_name}
                  </MenuItem>
                ))
              : <MenuItem value={branchId}>{branchName || branchId}</MenuItem>
            }
          </Select>

          <IconButton>
            <Badge color="error" variant="dot">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1 }}>
            <Avatar sx={{ bgcolor: "#c8101f", fontSize: 14, fontWeight: 700 }}>
              {(profile?.employee_name || profile?.restaurant_name || "?").trim().charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography sx={{ color: "black", fontWeight: 600, fontSize: 14 }}>
                {profile?.employee_name ||
                  profile?.restaurant_name ||
                  (profile?.user_type === "super_admin" ? "Super Admin" : "Manager")}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
