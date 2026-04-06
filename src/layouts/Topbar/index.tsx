import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import NotificationsIcon from "@mui/icons-material/Notifications";
import styles from "./index.module.css";
import { useTheme } from "@mui/material/styles";
import { drawerWidth } from "../Sidebar/index";
import { MenuItem, Select } from "@mui/material";
import { useAppSelector } from "@store/store";
import { getTenantContext } from "@store/tenantContext";

const TopBar: React.FC = () => {
  const theme = useTheme();
  const [selectedBranch, setSelectedBranch] = React.useState("B1");
  const { profile } = useAppSelector(getTenantContext);
  return (
    <AppBar
      position="fixed"
      className={styles.appBar}
      sx={{
        backgroundColor: "#fff",
        width: { sm: `calc(100% - ${drawerWidth}px)` }, // sets width minus sidebar
        ml: { sm: drawerWidth },
        borderBottom: "1px solid " + theme.palette.divider,
      }}
      elevation={0}
    >
      <Toolbar className={styles.toolbar}>
        {/* 60% Greeting */}
        {/* <Box className={styles.greetingSection}>
          <Logo fontSize="1.8rem" justifyContent="flex-start" />
        </Box> */}
        {/* 30% Search and Icons */}
        {/* 10% Profile */}
        <Typography
               
                sx={{ color: "black", fontWeight: 600, fontSize: 20,textTransform:"capitalize" }}
              >
                {profile?.restaurant_name || "Jane Doe"}
              </Typography>
     
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
             <Select
                size="small"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                sx={{ minWidth: 160 }}>
                <MenuItem value="B1">Main Branch</MenuItem>
              
              </Select>
          <IconButton>
            <Badge color="error" variant="dot">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Box sx={{display:"flex",justifyContent:"center",alignItems:"center",gap:1}}>
            <Avatar
              
              src="https://randomuser.me/api/portraits/women/65.jpg"
            />
            <Box
              sx={{ display: { xs: "none", sm: "block" } }}
            >
              {/* <Typography
               
                sx={{ color: "black", fontWeight: 600, fontSize: 14,textTransform:"capitalize" }}
              >
                {profile?.restaurant_name || "Jane Doe"}
              </Typography> */}
              <Typography  sx={{ color: "black", fontWeight: 600, fontSize: 14 }} >
                {profile?.user_type === "super_admin" ? "Super Admin" : "Manager"}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
