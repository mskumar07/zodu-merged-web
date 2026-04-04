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
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React from "react";
import { History, Person, Settings } from "@mui/icons-material";
import { useAppDispatch } from "@store/store";
import { clearAuthData } from "@store/slices/userSlice";
import { tokenStore } from "@pages/auth/Authapi";

export const drawerWidth = 240;

const navItems = [
  { label: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
 { label: "POS", icon: <PointOfSaleIcon />, path: "/pos" },
  { label: "Sales History", icon: <History />, path: "/sales-history" },

  { label: "Menu Items", icon: <CategoryIcon />, path: "/menu" },
  // { label: "Category", icon: <BarChartIcon />, path: "/category" },

  
  { label: "Inventory", icon: <ReceiptIcon />, path: "/stock" },
  // { label: "Expense", icon: <PaymentsIcon />, path: "/expense" },
  { label: "Purchase", icon: <CategoryIcon />, path:"/purchase"},
    { label: "Customer Management", icon: <Person />, path: "/customer-details" },
  // { label: "Checklist", icon: <ChecklistIcon />, path: "/checklist" },
  // {label: "Attendance", icon:<GroupsIcon/>, path:"/attendance"},
  { label: "Report", icon: <BarChartIcon />, path: "/reports" },
  
   {
    label: "Settings",
    icon: <Settings />,
    path: "/",
  },
];

export default function Sidebar() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const { navigate } = useNavigation();

  const handleLogout = () => {
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
        <Typography
          onClick={() => navigate("/")}
          sx={{
            cursor: "pointer",
            color: "#DC143C",
            fontSize: "2.5rem",
            fontWeight: 800,
            letterSpacing: "0.05em",
          }}
        >
          zodu
        </Typography>
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
              setActiveIndex(i);
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
