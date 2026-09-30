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
import MenuIcon from "@mui/icons-material/Menu";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import Button from "@mui/material/Button";
import { getBranchSubscription, SUBSCRIPTION_NOTICE_DAYS } from "@utils/subscription";
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
import { RestaurantBillingView } from "@store/slices/POSslice";
import { authApis } from "@pages/auth/Authapi";
import { useNavigate, useLocation } from "react-router-dom";

interface TopBarProps {
  /** Opens the mobile/tablet sidebar drawer — only rendered below `md`. */
  onMenuClick?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
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
  // top bar / company name don't sit under a phantom 240px gap. Below `md` the
  // sidebar is an off-canvas overlay (opened via the hamburger button) and never
  // reserves layout space, so the top bar always spans the full width there.
  const restaurantBillingView = useAppSelector(RestaurantBillingView);
  const isBillingRoute =
    location.pathname.startsWith("/pos") ||
    (location.pathname.startsWith("/restaurant-pos") && restaurantBillingView === "keyboard") ||
    location.pathname.startsWith("/kds");
  const reservedSidebarWidth = isBillingRoute ? collapsedDrawerWidth : drawerWidth;
  const zoduId = useAppSelector(ZoduId);
  const branchId = useAppSelector(BranchId);
  const branchName = useAppSelector(BranchName);
  const companies = useAppSelector(AllCompanies);

  const selectedCompany =
    companies.find((company) => company.zodu_id === zoduId) ?? null;

  const companyBranches = selectedCompany?.branches ?? [];
  const isEmployee = profile?.user_type?.toLowerCase() === "employee";

  const currentBranch = companyBranches.find((branch) => branch.branch_id === branchId) ?? null;
  const branchCity = [
    currentBranch?.city || currentBranch?.branch_city,
    currentBranch?.district || currentBranch?.branch_district,
  ]
    .filter((v, i, arr): v is string => !!v && arr.indexOf(v) === i)
    .join(", ");

  // Trial / subscription of the branch in session (subscriptions are per branch).
  const subscription = getBranchSubscription(currentBranch);
  // The end date always shows; the days-left tag only in the final 30 days
  // (or once it has ended).
  const showDaysLeft =
    !!subscription &&
    (subscription.expired || (subscription.daysLeft !== null && subscription.daysLeft <= SUBSCRIPTION_NOTICE_DAYS));
  // Plans are shown on the landing page's pricing section.
  const handlePayNow = () => window.open("/#pricing", "_blank", "noopener");

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
        width: { xs: "100%", md: `calc(100% - ${reservedSidebarWidth}px)` },
        ml: { xs: 0, md: reservedSidebarWidth },
        transition: theme.transitions.create(["width", "margin"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        borderBottom: "1px solid " + theme.palette.divider,
      }}
      elevation={0}
    >
      <Toolbar className={styles.toolbar} sx={{ gap: { xs: 0.5, sm: 1 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0, flex: "1 1 auto" }}>
          <IconButton
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            sx={{
              display: { xs: "inline-flex", md: "none" },
              color: "#1A0004",
              flexShrink: 0,
              mr: 0.5,
            }}
          >
            <MenuIcon />
          </IconButton>
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
                  flexShrink: 0,
                  "&:hover": { bgcolor: "#a50d19" },
                }}
              >
                <ArrowBackIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}
          <Box sx={{ minWidth: 0 }}>
            <Typography
              noWrap
              sx={{
                color: "black",
                fontWeight: 600,
                fontSize: { xs: 15, md: 20 },
                lineHeight: 1.2,
                textTransform: "capitalize",
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {selectedCompany?.restaurant_name || selectedCompany?.company_name || profile?.restaurant_name || ""}
            </Typography>
            {/* Current branch + its city, as on the branch selection screen */}
            {(currentBranch || branchName) && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, minWidth: 0, mt: 0.2 }}>
                <LocationOnOutlinedIcon sx={{ fontSize: 14, color: "#c8101f", flexShrink: 0 }} />
                <Typography
                  noWrap
                  sx={{ fontSize: 12, color: "#6b7280", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  <Box component="span" sx={{ fontWeight: 700, color: "#374151" }}>
                    {currentBranch
                      ? `${currentBranch.branch_id} - ${currentBranch.branch_name}`
                      : branchName}
                  </Box>
                  {branchCity && ` · ${branchCity}`}
                </Typography>
              </Box>
            )}
          </Box>
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
                  flexShrink: 0,
                  "&:hover": { bgcolor: "rgba(200,16,31,0.14)" },
                  "&.Mui-disabled": { color: "#c8c8c8", bgcolor: "rgba(0,0,0,0.04)" },
                }}
              >
                <SwitchAccountIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        {subscription && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0, mx: { sm: 1 } }}>
            <Box
              sx={{
                display: { xs: "none", lg: "flex" },
                alignItems: "center",
                gap: 1,
                px: 1.5,
                py: 0.75,
                borderRadius: "10px",
                bgcolor: "#f5f7fb",
                border: "1px solid #e8ecf3",
                whiteSpace: "nowrap",
              }}
            >
              <CalendarMonthOutlinedIcon sx={{ fontSize: 18, color: "#2563eb" }} />
              <Typography sx={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>
                {subscription.isTrial
                  ? subscription.expired ? "Trial ended on " : "Trial ends on "
                  : subscription.expired ? "Subscription ended on " : "Subscription ends on "}
                <Box component="span" sx={{ fontWeight: 700, color: "#111827" }}>
                  {subscription.dateLabel}
                </Box>
              </Typography>
              {showDaysLeft && subscription.daysLabel && (
                <Box
                  component="span"
                  sx={{
                    px: 1,
                    py: 0.25,
                    borderRadius: "6px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: subscription.color,
                    bgcolor: `${subscription.color}14`,
                  }}
                >
                  {subscription.daysLabel}
                </Box>
              )}
            </Box>
            {/* Pay Now only once the trial / subscription ends within 10 days */}
            {subscription.payNow && !isEmployee && (
              <Button
                variant="contained"
                size="small"
                onClick={handlePayNow}
                startIcon={<CreditCardOutlinedIcon sx={{ fontSize: 18 }} />}
                sx={{
                  display: { xs: "none", sm: "inline-flex" },
                  px: 2,
                  py: 0.75,
                  borderRadius: "10px",
                  bgcolor: "#2563eb",
                  textTransform: "none",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  boxShadow: "0 6px 16px rgba(37,99,235,0.25)",
                  "&:hover": { bgcolor: "#1d4ed8" },
                }}
              >
                Pay Now
              </Button>
            )}
          </Box>
        )}

        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 2 }, flexShrink: 0 }}>
          <Select
            size="small"
            value={branchId}
            onChange={(e) => handleBranchChange(e.target.value)}
            sx={{
              minWidth: { xs: 70, sm: 140, md: 180 },
              maxWidth: { xs: 100, sm: "none" },
              "& .MuiSelect-select": {
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              },
            }}
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

          <IconButton sx={{ flexShrink: 0 }}>
            <Badge color="error" variant="dot">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1, flexShrink: 0 }}>
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
