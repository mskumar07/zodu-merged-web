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

const TopBar: React.FC = () => {
  const theme = useTheme();
  const [selectedBranch, setSelectedBranch] = React.useState("ZODU035B1");
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
         <Select
                size="small"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                sx={{ minWidth: 160 }}>
                <MenuItem value="ZODU035B1">Main Branch</MenuItem>
                <MenuItem value="ZODU035B2">Branch 2</MenuItem>
                <MenuItem value="ZODU035B3">Branch 3</MenuItem>
              </Select>
        <Box className={styles.profileSection}>
         
          <IconButton>
            <Badge color="error" variant="dot">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Box className={styles.profileBox}>
            <Avatar
              className={styles.avatar}
              src="https://randomuser.me/api/portraits/women/65.jpg"
            />
            <Box
              sx={{ display: { xs: "none", sm: "block" }, textAlign: "right" }}
            >
              <Typography
                className={styles.profileName}
                sx={{ color: "black" }}
                variant="subtitle1"
              >
                Tynisha Obey
              </Typography>
              <Typography className={styles.profileRole} sx={{ color: "black" }} variant="subtitle2">
                KATRING
              </Typography>
            </Box>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
