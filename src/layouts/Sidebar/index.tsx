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
import Logo from "@components/Common/Logo";
import zlogo from "../../assets/zlogo.png";
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
import React from "react";
import { History, Person, Settings } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "@store/store";
import { clearAuthData, BusinessType } from "@store/slices/userSlice";
import { tokenStore } from "@pages/auth/Authapi";
import { db } from "@pages/POS/db";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";

export const drawerWidth = 240;

const retailNavItems = [
  { label: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { label: "Billing", icon: <PointOfSaleIcon />, path: "/pos" },
  { label: "Sales History", icon: <History />, path: "/sales-history" },
  { label: "Menu Items", icon: <CategoryIcon />, path: "/menu" },
  { label: "Inventory", icon: <ReceiptIcon />, path: "/stock" },
  { label: "Purchase", icon: <CategoryIcon />, path: "/purchase" },
  { label: "Expense", icon: <PaymentsIcon />, path: "/expense" },
  { label: "Customer Management", icon: <Person />, path: "/customer-details" },
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
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          // borderRight: 1,
          borderColor: theme.palette.divider,
          bgcolor: theme.palette.background.default,
        },
      }}
      variant="permanent"
      anchor="left"
      aria-label="Sidebar navigation"
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
   <Toolbar
        sx={{
          bgcolor: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "64px !important",
        }}
      >
        <Box
          onClick={() => navigate("/")}
          sx={{ cursor: "pointer", height: 40, display: "flex", alignItems: "center" }}
        >
          <img src={zlogo} alt="Zodu" style={{ height: "100%", width: "auto", objectFit: "contain" }} />
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
                  "& .MuiTypography-root": {
                    fontWeight: i === activeIndex ? 500 : 400,
                    fontSize: "13px",
                    lineHeight: 1.25,
                    color: i === activeIndex ? "#fff" : "#888",
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ px: 2, pb: 1, pt: 1 }}>
        <Divider sx={{ mb: 1 }} />
        <ListItem disablePadding disableGutters>
          <ListItemButton
            disableRipple
            onClick={handleLogout}
            sx={{
              borderRadius: 1,
              color: theme.palette.error.main,
              "&:hover": {
                bgcolor: "rgba(220, 20, 60, 0.08)",
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 30,
                color: theme.palette.error.main,
              }}
              aria-hidden="true"
            >
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              sx={{
                "& .MuiTypography-root": {
                  fontWeight: 600,
                  fontSize: "14px",
                  color: theme.palette.error.main,
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
