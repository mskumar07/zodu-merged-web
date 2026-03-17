import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  InputAdornment,
  TextField,
  Box,
  Avatar,
  useTheme,
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';

const NAV_LINKS = ['Dashboard', 'Inventory', 'Sales', 'Reports'];

const TopNav: React.FC = () => {
  const theme = useTheme();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: `1px solid ${theme.palette.divider}`,
        zIndex: theme.zIndex.appBar,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 5 }, minHeight: 64 }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
            <StorefrontIcon sx={{ fontSize: 30, fontWeight: 700 }} />
            <Typography
              variant="h6"
              fontWeight={900}
              letterSpacing="-0.5px"
              sx={{ color: 'text.primary' }}
            >
              RetailPOS
            </Typography>
          </Box>

          {/* Nav links */}
          <Box sx={{ display: { xs: 'none', lg: 'flex' }, gap: 3, ml: 2 }}>
            {NAV_LINKS.map((link) => (
              <Typography
                key={link}
                component="a"
                href="#"
                variant="body2"
                fontWeight={link === 'Inventory' ? 700 : 600}
                sx={{
                  color: link === 'Inventory' ? 'primary.main' : 'text.secondary',
                  textDecoration: 'none',
                  borderBottom: link === 'Inventory' ? '2px solid' : '2px solid transparent',
                  borderColor: link === 'Inventory' ? 'primary.main' : 'transparent',
                  pb: 0.3,
                  '&:hover': { color: 'primary.main' },
                  transition: 'color 0.2s',
                }}
              >
                {link}
              </Typography>
            ))}
          </Box>
        </Box>

        {/* Right side */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search menu..."
            sx={{ display: { xs: 'none', sm: 'block' }, width: 220 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
              sx: { borderRadius: 3, bgcolor: 'action.hover', fontSize: 13 },
            }}
          />
          <IconButton size="small">
            <NotificationsIcon sx={{ color: 'text.secondary' }} />
          </IconButton>
          <Avatar
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKx6ge7ri3C3fuGt89xcLUdZStqe2N9dGfHLvCaHzSQq8qmKNWwmjkUc0NT4OJGQuH7Z4ulGeHH_1oGNAAKgqv-PEE1T2ecCa0tLdq-PYt5vjyrjNFHtJViHLkfzCADOTUmY7pYvry_YeAqbP58RzCbYV4ZCWwfMVcc61gRNhQ1473NWdx6GF3zRiu0ThOfCbf5vLoWTEmAt5Gw1F750pfXqO3VnexHvVFcPGiOicxvoi8h3GkW5Ctz7b7VVldScb6hm5HNVILM5pl"
            sx={{ width: 38, height: 38, border: '2px solid', borderColor: 'primary.light' }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopNav;
