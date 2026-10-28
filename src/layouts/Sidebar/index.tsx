import useNavigation from "@hooks/UseNavigation.tsx";
import BarChartIcon from "@mui/icons-material/BarChart";
import CategoryIcon from "@mui/icons-material/Category";
import inventoryIcon from "../../assets/icons/inventory.png";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import PaymentsIcon from "@mui/icons-material/Payments";
import SvgIcon from "@mui/material/SvgIcon";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import ChecklistIcon from "@mui/icons-material/Checklist";
import SoupKitchenIcon from "@mui/icons-material/SoupKitchen";
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
import useMediaQuery from "@mui/material/useMediaQuery";
import React, { useState, useEffect } from "react";
import { History, Settings } from "@mui/icons-material";
import SupervisorAccountOutlinedIcon from "@mui/icons-material/SupervisorAccountOutlined";
import { useAppSelector } from "@store/store";
import { BusinessType, RoleAccess } from "@store/slices/userSlice";
import { RestaurantBillingView } from "@store/slices/POSslice";
import { useSignOut } from "@hooks/useSignOut";
import { useLocation } from "react-router-dom";

// Two overlapping bills with a rupee mark, drawn as strokes so it follows the icon colour
const BillingIcon = () => (
  <SvgIcon viewBox="0 0 24 24">
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.5 6V3h8l3.5 3.5V17" />
      <path d="M3.5 6h7.5l4 4v12l-1.5-1.5L11.5 22 10 20.5 8.5 22 7 20.5 5.5 22 4 20.5 3.5 22Z" />
      <path d="M11 6v4h4" />
      <path d="M6.5 12.5h5" />
      <path d="M6.5 15h3.5M6.5 16.5h3.5M6.5 15h1a1.5 1.5 0 0 1 0 3h-1l3 2" />
    </g>
  </SvgIcon>
);

// ID card: photo on the left, text lines on the right
const IdCardIcon = () => (
  <SvgIcon viewBox="0 0 24 24">
    <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
      <circle cx="8.5" cy="10.5" r="1.8" fill="currentColor" />
      <path d="M5.5 16c.4-1.6 1.6-2.4 3-2.4s2.6.8 3 2.4" />
      <path d="M14.5 9.5h4M14.5 13h4" />
    </g>
  </SvgIcon>
);

// PNG used as a mask so it picks up the surrounding icon colour (e.g. white when active)
const InventoryIcon = () => (
  <Box
    component="span"
    sx={{
      width: 32,
      height: 32,
      m: "-4px",
      display: "inline-block",
      bgcolor: "currentColor",
      WebkitMask: `url(${inventoryIcon}) center / contain no-repeat`,
      mask: `url(${inventoryIcon}) center / contain no-repeat`,
    }}
  />
);

export const drawerWidth = 240;
export const collapsedDrawerWidth = 68;

// `module` maps each nav entry to the `module_name` returned in the login
// response's `role_access` list, so the sidebar can hide entries whose
// `can_read` is false. Items with no `module` (not modelled as a permission
// module by the backend) always render.
const retailNavItems = [
  { label: "Dashboard", icon: <DashboardIcon />, path: "/dashboard", module: "Dashboard" },
  { label: "Billing", icon: <BillingIcon />, path: "/pos", module: "Billing" },
  { label: "Sales History", icon: <History />, path: "/sales-history", module: "Sales History" },
  { label: "Menu Items", icon: <CategoryIcon />, path: "/menu", module: "Menu Items" },
  { label: "Inventory", icon: <InventoryIcon />, path: "/stock", module: "Inventory" },
  { label: "Purchase", icon: <ShoppingCartOutlinedIcon />, path: "/purchase", module: "Purchase" },
  { label: "Expense", icon: <PaymentsIcon />, path: "/expense", module: "Expense" },
  { label: "Accounting", icon: <AccountBalanceOutlinedIcon />, path: "/accounting", module: "Accounting" },
  { label: "Customer Management", icon: <SupervisorAccountOutlinedIcon />, path: "/customer-details", module: "Customer Management" },
  { label: "Staff / User Management", icon: <IdCardIcon />, path: "/employee-management", module: "Staff / User Management" },
  { label: "Attendance", icon: <EventAvailableIcon />, path: "/attendance", module: "Attendance" },
  { label: "Checklist / Tasklist", icon: <ChecklistIcon />, path: "/checklist", module: "Checklist / Tasklist" },
  { label: "Report", icon: <BarChartIcon />, path: "/reports", module: "Reports" },
  { label: "Settings", icon: <Settings />, path: "/settings", module: "Settings" },
];

const restaurantNavItems = [
  { label: "Dashboard", icon: <DashboardIcon />, path: "/dashboard", module: "Dashboard" },
  { label: "POS", icon: <BillingIcon />, path: "/restaurant-pos", module: "Billing" },
  { label: "Sales History", icon: <History />, path: "/sales-history", module: "Sales History" },
  { label: "KDS Screen", icon: <SoupKitchenIcon />, path: "/kds", module: "KDS Screen" },
  { label: "Menu Items", icon: <CategoryIcon />, path: "/restaurant-menu", module: "Menu Items" },
  { label: "Inventory", icon: <InventoryIcon />, path: "/stock", module: "Inventory" },
  { label: "Purchase", icon: <ShoppingCartOutlinedIcon />, path: "/purchase", module: "Purchase" },
  { label: "Expense", icon: <PaymentsIcon />, path: "/expense", module: "Expense" },
  { label: "Staff / User Management", icon: <IdCardIcon />, path: "/employee-management", module: "Staff / User Management" },
  { label: "Attendance", icon: <EventAvailableIcon />, path: "/attendance", module: "Attendance" },
  { label: "Checklist / Tasklist", icon: <ChecklistIcon />, path: "/checklist", module: "Checklist / Tasklist" },
  { label: "Report", icon: <BarChartIcon />, path: "/reports", module: "Reports" },
  { label: "Settings", icon: <Settings />, path: "/settings", module: "Settings" },
];

interface SidebarProps {
  /** Controlled open state for the temporary (mobile/tablet) drawer. */
  mobileOpen?: boolean;
  /** Called to close the temporary drawer — backdrop click, Escape, or a nav item click. */
  onMobileClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const theme = useTheme();
  const location = useLocation();
  const { navigate } = useNavigation();
  const handleLogout = useSignOut();
  const businessType = useAppSelector(BusinessType);
  const roleAccess = useAppSelector(RoleAccess);
  // Below `md` the sidebar can't rely on hover (touch devices) or afford to
  // permanently reserve drawer width, so it becomes a hamburger-triggered
  // overlay instead of the desktop's always-visible rail.
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const allNavItems = businessType === "Restaurant" ? restaurantNavItems : retailNavItems;

  // A module with no matching role_access entry (e.g. old sessions before this
  // was wired up, or modules not modelled as permissions) stays visible —
  // only an explicit can_read: false hides the menu item.
  const navItems = allNavItems.filter((item) => {
    if (!item.module) return true;
    const access = roleAccess.find((r) => r.module_name === item.module);
    return access ? access.can_read : true;
  });

  const activeIndex = navItems.findIndex(
    (item) =>
      location.pathname === item.path ||
      location.pathname.startsWith(item.path + "/")
  );

  // Billing screen (retail POS) gets a hover-expandable icon rail; every other
  // route keeps the sidebar at its normal fixed width. The restaurant POS screen
  // renders its own full-screen overlay and only wants the rail while its
  // Keyboard billing layout is active — Touch mode stays full-screen with no
  // sidebar reserved, same as before.
  const restaurantBillingView = useAppSelector(RestaurantBillingView);
  const isBillingRoute =
    location.pathname.startsWith("/pos") ||
    (location.pathname.startsWith("/restaurant-pos") && restaurantBillingView === "keyboard") ||
    location.pathname.startsWith("/kds");
  const [isHovered, setIsHovered] = useState(false);
  // A stale "hovered" flag can survive a route change when the click that navigated
  // here (e.g. from Sales History) left the cursor sitting over the sidebar's screen
  // position without firing a fresh mouseenter/mouseleave — reset on every navigation
  // so the rail always starts collapsed on the billing route until the user actually
  // moves the mouse over it.
  useEffect(() => { setIsHovered(false); }, [location.pathname]);
  // On mobile/tablet the drawer is a full-width temporary overlay — the
  // desktop-only collapsed-rail/hover behavior doesn't apply there.
  const expanded = isMobile ? true : !isBillingRoute || isHovered;
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

  return (
    <Drawer
      sx={{
        width: isMobile ? undefined : reservedWidth,
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
          ...(isBillingRoute && !isMobile && {
            position: "fixed",
            zIndex: theme.zIndex.drawer + 1,
            boxShadow: isHovered ? "4px 0 20px rgba(15,23,42,0.12)" : "none",
          }),
        },
      }}
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? mobileOpen : true}
      onClose={onMobileClose}
      ModalProps={isMobile ? { keepMounted: true } : undefined}
      anchor="left"
      aria-label="Sidebar navigation"
      onMouseEnter={() => { if (isBillingRoute && !isMobile) setIsHovered(true); }}
      onMouseLeave={() => { if (isBillingRoute && !isMobile) setIsHovered(false); }}
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
              if (isMobile) onMobileClose?.();
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
                    fontWeight: 500,
                    fontSize: "13px",
                    lineHeight: 1.25,
                    color: i === activeIndex ? "#fff" : "rgb(71, 85, 105)",
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
