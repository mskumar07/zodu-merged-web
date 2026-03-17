import useNavigation from "@hooks/UseNavigation.tsx";
import BarChartIcon from "@mui/icons-material/BarChart";
import CategoryIcon from "@mui/icons-material/Category";
import DashboardIcon from "@mui/icons-material/Dashboard";
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
import { Person } from "@mui/icons-material";

export const drawerWidth = 240;

const navItems = [
  { label: "Dashboard", icon: <DashboardIcon />, path: "/" },
 { label: "POS", icon: <PointOfSaleIcon />, path: "/pos" },
  { label: "Menu Items", icon: <CategoryIcon />, path: "/menu" },
  // { label: "Category", icon: <BarChartIcon />, path: "/category" },

  
  { label: "Inventory", icon: <ReceiptIcon />, path: "/stock" },
  // { label: "Expense", icon: <PaymentsIcon />, path: "/expense" },
  { label: "Purchase", icon: <CategoryIcon />, path:"/purchase"},
    { label: "Customer Management", icon: <Person />, path: "/customer-details" },
  // { label: "Checklist", icon: <ChecklistIcon />, path: "/checklist" },
  // {label: "Attendance", icon:<GroupsIcon/>, path:"/attendance"},
  { label: "Report", icon: <BarChartIcon />, path: "/reports" },
  
  //  {
  //   label: "Restaurant setup",
  //   icon: <RestaurantMenuIcon />,
  //   path: "/restaurant-setup",
  // },
];

export default function Sidebar() {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const { navigate } = useNavigation();
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

      <List sx={{ mt: 2 }}>
        {navItems.map((item, i) => (
          <ListItem
            key={item.label}
            disablePadding
            disableGutters={true}
            onClick={() => {
              navigate(item.path);
              setActiveIndex(i);
            }}
          >
            <ListItemButton
              disableRipple={true}
              sx={{
                borderRadius: 1,
                my: 0.5,
                mx: 2,
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
                  minWidth: 40,
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
                  "& .MuiTypography-root": {
                    fontWeight: i === activeIndex ? 500 : 400,
                    fontSize: "14px",
                    color: i === activeIndex ? "#fff" : "#888",
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}
