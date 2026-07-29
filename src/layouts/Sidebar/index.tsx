import useNavigation from "@hooks/UseNavigation.tsx";
import BarChartIcon from "@mui/icons-material/BarChart";
import CategoryIcon from "@mui/icons-material/Category";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import PaymentsIcon from "@mui/icons-material/Payments";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import ReceiptIcon from "@mui/icons-material/Receipt";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import ChecklistIcon from "@mui/icons-material/Checklist";
import GroupsIcon from '@mui/icons-material/Groups';
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import Logo from "@components/Common/Logo";
import zlogo from "../../assets/zlogo.png";
import zIcon from "../../assets/image.png";
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React, { useState, useEffect } from "react";
import { History, Person, Settings, AdminPanelSettings, Badge } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "@store/store";
import { clearAuthData, BusinessType } from "@store/slices/userSlice";
import { tokenStore } from "@pages/auth/Authapi";
import { db } from "@pages/POS/db";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";

export const drawerWidth = 240;
export const collapsedDrawerWidth = 68;

const retailNavItems = [
  { label: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { label: "Billing", icon: <PointOfSaleIcon />, path: "/pos" },
  { label: "Sales History", icon: <History />, path: "/sales-history" },
  { label: "Menu Items", icon: <CategoryIcon />, path: "/menu" },
  { label: "Inventory", icon: <ReceiptIcon />, path: "/stock" },
  { label: "Purchase", icon: <CategoryIcon />, path: "/purchase" },
  { label: "Expense", icon: <PaymentsIcon />, path: "/expense" },
  { label: "Customer Management", icon: <Person />, path: "/customer-details" },
  { label: "Employee Management", icon: <Badge />, path: "/employee-management" },
  { label: "Attendance", icon: <EventAvailableIcon />, path: "/attendance" },
  { label: "Checklist / Tasklist", icon: <ChecklistIcon />, path: "/checklist" },
  { label: "Role Management", icon: <AdminPanelSettings />, path: "/role-management" },
  { label: "Report", icon: <BarChartIcon />, path: "/reports" },
  { label: "Settings", icon: <Settings />, path: "/settings" },
];

const restaurantNavItems = [
  { label: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { label: "POS", icon: <PointOfSaleIcon />, path: "/restaurant-pos" },
  { label: "Sales History", icon: <History />, path: "/sales-history" },
  { label: "Menu Items", icon: <CategoryIcon />, path: "/restaurant-menu" },
  { label: "Inventory", icon: <ReceiptIcon />, path: "/stock" },
  { label: "Purchase", icon: <CategoryIcon />, path: "/purchase" },
  { label: "Expense", icon: <PaymentsIcon />, path: "/expense" },
  { label: "Customer Management", icon: <Person />, path: "/customer-details" },
  { label: "Employee Management", icon: <Badge />, path: "/employee-management" },
  { label: "Attendance", icon: <EventAvailableIcon />, path: "/attendance" },
  { label: "Checklist / Tasklist", icon: <ChecklistIcon />, path: "/checklist" },
  { label: "Role Management", icon: <AdminPanelSettings />, path: "/role-management" },
  { label: "Report", icon: <BarChartIcon />, path: "/reports" },
  { label: "Settings", icon: <Settings />, path: "/settings" },
];

export default function Sidebar() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const location = useLocation();
  const { navigate } = useNavigation();
  const businessType = useAppSelector(BusinessType);

  const navItems = businessType === "Restaurant" ? restaurantNavItems : retailNavItems;

  const activeIndex = navItems.findIndex(
    (item) =>
      location.pathname === item.path ||
      location.pathname.startsWith(item.path + "/")
  );

  // Billing screen (retail POS) gets a hover-expandable icon rail; every other
  // route keeps the sidebar at its normal fixed width.
  const isBillingRoute = location.pathname.startsWith("/pos");
  const [isHovered, setIsHovered] = useState(false);
  // A stale "hovered" flag can survive a route change when the click that navigated
  // here (e.g. from Sales History) left the cursor sitting over the sidebar's screen
  // position without firing a fresh mouseenter/mouseleave — reset on every navigation
  // so the rail always starts collapsed on the billing route until the user actually
  // moves the mouse over it.
  useEffect(() => { setIsHovered(false); }, [location.pathname]);
  const expanded = !isBillingRoute || isHovered;
  const currentWidth = expanded ? drawerWidth : collapsedDrawerWidth;
  // On the billing route the reserved layout width always stays at the collapsed
  // rail size — hovering overlays the expanded panel on TOP of the page content
  // (position: fixed) instead of growing the flex box, so the table/content next
  // to it never reflows while the sidebar is expanding.
  const reservedWidth = isBillingRoute ? collapsedDrawerWidth : currentWidth;

  const widthTransition = theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  });

  const handleLogout = async () => {
    await db.products.clear();
    await db.meta.clear();
    queryClient.clear();
    tokenStore.clear();
    dispatch(clearAuthData());
    navigate("/login");
  };

  return (
    <Drawer
      sx={{
        width: reservedWidth,
        flexShrink: 0,
        whiteSpace: "nowrap",
        transition: widthTransition,
        "& .MuiDrawer-paper": {
          width: currentWidth,
          overflowX: "hidden",
          boxSizing: "border-box",
          transition: widthTransition,
          // borderRight: 1,
          borderColor: theme.palette.divider,
          bgcolor: theme.palette.background.default,
          ...(isBillingRoute && {
            position: "fixed",
            zIndex: theme.zIndex.drawer + 1,
            boxShadow: isHovered ? "4px 0 20px rgba(15,23,42,0.12)" : "none",
          }),
        },
      }}
      variant="permanent"
      anchor="left"
      aria-label="Sidebar navigation"
      onMouseEnter={() => { if (isBillingRoute) setIsHovered(true); }}
      onMouseLeave={() => { if (isBillingRoute) setIsHovered(false); }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
   <Toolbar
        sx={{
          bgcolor: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "64px !important",
          px: expanded ? undefined : 1,
        }}
      >
        <Box
          onClick={() => navigate("/")}
          sx={{
            cursor: "pointer",
            height: expanded ? 40 : 50,
            width: expanded ? "auto" : 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <img
            src={expanded ? zlogo : zIcon}
            alt="Zodu"
            style={
              expanded
                ? { height: "100%", width: "auto", objectFit: "contain" }
                : { height: "30px", width: "30px", objectFit: "contain" }
            }
          />
        </Box>
      </Toolbar>

<Divider />

      <List
        sx={{
          mt: 1,
          px: 1.25,
          py: 0.5,
          flexGrow: 1,
        }}
      >
        {navItems.map((item, i) => (
          <ListItem
            key={item.label}
            disablePadding
            disableGutters={true}
            sx={{ mb: 0.35 }}
            onClick={() => {
              navigate(item.path);
            }}
          >
            <ListItemButton
              disableRipple={true}
              sx={{
                borderRadius: 1,
                minHeight: 36,
                py: 0.5,
                px: 1.25,
                my: 0,
                mx: 0,
                justifyContent: expanded ? "flex-start" : "center",
                bgcolor:
                  i === activeIndex
                    ? theme.palette.primary.main
                    : "transparent",
                color: i === activeIndex ? "#fff" : theme.palette.text.primary,
                "&:hover": {
                  bgcolor:
                    i === activeIndex
                      ? theme.palette.primary.main
                      : theme.palette.action.hover,
                },
              }}
              aria-current={i === activeIndex ? "page" : undefined}
            >
              <ListItemIcon
                sx={{
                  minWidth: 28,
                  justifyContent: "center",
                  color:
                    i === activeIndex ? "#fff" : theme.palette.text.secondary,
                }}
                aria-hidden="true"
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                sx={{
                  ml: 0.5,
                  opacity: expanded ? 1 : 0,
                  width: expanded ? "auto" : 0,
                  transition: theme.transitions.create(["opacity", "width"], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                  }),
                  "& .MuiTypography-root": {
                    fontWeight: i === activeIndex ? 500 : 400,
                    fontSize: "13px",
                    lineHeight: 1.25,
                    color: i === activeIndex ? "#fff" : "#888",
                    whiteSpace: "nowrap",
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ px: expanded ? 2 : 1, pb: 1, pt: 1 }}>
        <Divider sx={{ mb: 1 }} />
        <ListItem disablePadding disableGutters>
          <ListItemButton
            disableRipple
            onClick={handleLogout}
            sx={{
              borderRadius: 1,
              justifyContent: expanded ? "flex-start" : "center",
              color: theme.palette.error.main,
              "&:hover": {
                bgcolor: "rgba(220, 20, 60, 0.08)",
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 30,
                justifyContent: "center",
                color: theme.palette.error.main,
              }}
              aria-hidden="true"
            >
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              sx={{
                opacity: expanded ? 1 : 0,
                width: expanded ? "auto" : 0,
                transition: theme.transitions.create(["opacity", "width"], {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
                "& .MuiTypography-root": {
                  fontWeight: 600,
                  fontSize: "14px",
                  color: theme.palette.error.main,
                  whiteSpace: "nowrap",
                },
              }}
            />
          </ListItemButton>
        </ListItem>
      </Box>
      </Box>
    </Drawer>
  );
}
