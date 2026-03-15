import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Accordion,
  AccordionSummary,
  Box,
  Divider,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

import type { MenuCategory } from "../../types/menuItem.ts";
import { useAppDispatch, useAppSelector } from "../../store/store.ts";
import { setSearchProduct, updateMenu } from "../../store/slices/POSslice.ts";
import { useGetAllPOSDataQuery } from "@services/menuApi.ts";
import { BranchId } from "@store/slices/userSlice.ts";

export const drawerWidth = 240;


export default function POSSidebar() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const branchId = useAppSelector(BranchId);

  const {
      isLoading, data: menuData, isError: isMenuError, error: menuError,
    } = useGetAllPOSDataQuery(branchId);
  const menuItems: MenuCategory[] = menuData?.Data || [];
  const selectedMenu = useAppSelector((state) => state.pos.selectedMenu);
  const searchProduct = useAppSelector((state) => state.pos.searchProduct);

  const handleMenuClick = (title: string) => {
    if(searchProduct !== null) {
      dispatch(setSearchProduct(null))
    }
    dispatch(updateMenu(title));
  };
  if(isLoading){
    return <div>Loading...</div>;
  }

  return (
  <Drawer
    sx={{
      width: drawerWidth,
      flexShrink: 0,
      "& .MuiDrawer-paper": {
        width: drawerWidth,
        boxSizing: "border-box",
        borderRight: 1,
        borderColor: theme.palette.divider,
        bgcolor: theme.palette.background.default,
        display: "flex",
        flexDirection: "column", // Important for layout
      },
    }}
    variant="permanent"
    anchor="left"
    aria-label="POS sidebar"
  >
    {/* Header with back button - Fixed at top */}
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
            color: "#DC143C",
            cursor: "pointer",
            fontSize: "2.5rem",
            fontWeight: 800,
            letterSpacing: "0.05em",
          }}
        >
          zodu
        </Typography>
      </Toolbar>

<Divider />

    {/* Scrollable Menu List */}
    <Box
      sx={{
        flexGrow: 1,
        overflowY: "auto",
      }}
    >
      {menuItems?.map((menu: MenuCategory, i: number) => {
        const menuTitle: string = menu.name;
        const menuCount: number = menu.items.length || 0;
        //Z-T77 menuTitle with count needed to scroll (eg: Anytime - 5)
        const menuTitleWithCount = `${menuTitle} - ${menuCount}`;
        return (
          menuCount > 0 && (
            <Accordion
              key={`${menu.name}-${i}`}
              disableGutters
              elevation={0}
              square
              expanded={selectedMenu === menuTitle}
            >
              <AccordionSummary onClick={() => handleMenuClick(menuTitleWithCount)}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <Typography>{menuTitle || "Untitled"}</Typography>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    {menuCount}
                  </Box>
                </Box>
              </AccordionSummary>
            </Accordion>
          )
        );
      })}
    </Box>
  </Drawer>
  );
}
