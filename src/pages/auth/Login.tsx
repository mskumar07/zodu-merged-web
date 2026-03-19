import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Container,
  Paper,
  Grid,
  InputAdornment,
  Avatar,
  Stack,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  ShoppingBag as ShoppingBagIcon,
  Layers as LayersIcon,
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#D2122E',
    },
    secondary: {
      main: '#B00E26',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Quicksand", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"',
  },
  shape: {
    borderRadius: 12,
  },
});

const ZoduLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password });
    navigate('/dashboard');
    // Add your login logic here
  };

  const features = [
    { icon: <LayersIcon />, label: 'Retail' },
    { icon: <ShoppingCartIcon />, label: 'Restaurant' },
    { icon: <PersonIcon />, label: 'CRM' },
    { icon: <SecurityIcon />, label: 'HRM' },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* LEFT SIDE: Visual/Branding Section (Hidden on mobile) */}
        <Box
          sx={{
            display: { xs: 'none', lg: 'flex' },
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            bgcolor: '#f8fafc',
          }}
        >
          {/* Background Image */}
          <Box
            component="img"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuASQ5TYj1l-4Jq21vhT3RZukrN6pT5Oat279tsoCp0ETxxZqe7wCsuGAunqcMJfWz5gAQ-N0rnO1kyr0yWXeg6tW5KW8_yDjipRixjCi-XJtZXMl_Ni9o1cerp2MnoSaBidA-hLZ38eJdNwoMO_xCuVSBFvCFtfktlmnPH1t6-ldLdDELC3Cm3EiaZTWmsvpFjT-r6uKFOPQaxX4w7sH3xo5V8Ez0nNk-22NfWtFX8KvmEfQIwSoh8qjWmjmz6bGHDEHbUu-Z8j4i8"
            alt="Modern business ecosystem illustration"
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              p: 6,
              opacity: 0.95,
              transform: 'scale(1.1)',
            }}
          />

          {/* Gradient Overlay */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to bottom right, rgba(210, 18, 46, 0.1), rgba(255, 255, 255, 0.05), rgba(248, 250, 252, 0.8))',
              mixBlendMode: 'multiply',
            }}
          />

          {/* Content Overlay */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              p: 12,
              background:
                'linear-gradient(to top, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.4), transparent)',
            }}
          >
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 6 }}>
              <Box
                sx={{
                  bgcolor: 'primary.main',
                  p: 1,
                  borderRadius: 3,
                  boxShadow: '0 20px 25px -5px rgba(210, 18, 46, 0.2)',
                }}
              >
                <ShoppingBagIcon sx={{ fontSize: 32, color: 'white' }} />
              </Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}
              >
                ZODU
              </Typography>
            </Box>

            {/* Headline */}
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                color: '#111827',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                fontSize: '3rem',
              }}
            >
              Empowering Retail &amp; Hospitality.
            </Typography>

            {/* Description */}
            <Typography
              variant="body1"
              sx={{
                mt: 3,
                color: '#4b5563',
                maxWidth: '600px',
                fontWeight: 500,
                lineHeight: 1.8,
                fontSize: '1.125rem',
              }}
            >
              Experience the future of business management with ZODU. Streamline your operations,
              manage inventory, and delight customers with our all-in-one POS solution.
            </Typography>

            {/* Feature Icons */}
            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              {features.map((feature, index) => (
                <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: 'rgba(210, 18, 46, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(210, 18, 46, 0.2)',
                      '& svg': {
                        fontSize: 20,
                        color: 'primary.main',
                      },
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 0.5,
                      fontSize: '0.625rem',
                      color: '#6b7280',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    }}
                  >
                    {feature.label}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>

        {/* RIGHT SIDE: Login Form Section */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            px: { xs: 2, sm: 3, lg: 10, xl: 12 },
            py: { xs: 6, sm: 12 },
          }}
        >
          <Box sx={{ mx: 'auto', width: '100%', maxWidth: 384 }}>
            {/* Mobile Logo */}
            <Box
              sx={{
                display: { xs: 'flex', lg: 'none' },
                flexDirection: 'column',
                alignItems: 'center',
                mb: 5,
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: 'primary.main',
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 3,
                  mb: 1.5,
                }}
              >
                <ShoppingBagIcon sx={{ fontSize: 32, color: 'white' }} />
              </Box>
              <Typography variant="h5" fontWeight={700} letterSpacing="-0.02em">
                ZODU
              </Typography>
            </Box>

            {/* Header */}
            <Box>
              <Typography
                variant="h4"
                
                sx={{ fontWeight: 700, letterSpacing: '-0.02em', color: '#D30020',justifySelf:'center',textAlign:'center' }}
              >
               Welcome to ZODU
              </Typography>
              <Typography
                variant="body2"
                sx={{ mt: 1.5, color: '#6b7280', fontWeight: 600, fontSize: '0.875rem' }}
              >
                Manage your Restaurant, Retail, CRM, and HRM in one place.
              </Typography>
            </Box>

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 5 }}>
              <Stack spacing={3}>
                {/* Email/Phone Field */}
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ mb: 1, fontWeight: 700, color: '#374151', fontSize: '0.875rem' }}
                  >
                    Email or Phone Number
                  </Typography>
                  <TextField
                    fullWidth
                    id="identity"
                    name="identity"
                    type="text"
                    placeholder="e.g. manager@store.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        fontWeight: 600,
                        '& input': {
                          py: 1.5,
                        },
                      },
                    }}
                  />
                </Box>

                {/* Password Field */}
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, color: '#374151', fontSize: '0.875rem' }}
                    >
                      Password
                    </Typography>
                   
                  </Box>
                  <TextField
                    fullWidth
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        fontWeight: 600,
                        '& input': {
                          py: 1.5,
                        },
                      },
                    }}
                  />
                  <Box sx={{ mt: 1.25, display: 'flex', justifyContent: 'flex-end' }}>
                    <Link
                      href="#"
                      sx={{
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': {
                          color: 'secondary.main',
                        },
                      }}
                    >
                      Forgot password ?
                    </Link>
                  </Box>
                </Box>

                {/* Login Button */}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    py: 1.75,
                    borderRadius: 1,
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    boxShadow: '0 10px 15px -3px rgba(210, 18, 46, 0.2)',
                    '&:hover': {
                      bgcolor: 'secondary.main',
                    },
                  }}
                >
                  Sign In
                </Button>
              </Stack>

              {/* Secondary Actions */}
              <Box
                sx={{
                  mt: 5,
                  pt: 4,
                  borderTop: '1px solid #f3f4f6',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    textAlign: 'center',
                    color: '#4b5563',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                  }}
                >
                 Don't have an account ? {''}
                  <Link
                    component={RouterLink}
                    to="/signup"
                    sx={{
                      fontWeight: 700,
                      color: 'primary.main',
                      textDecoration: 'none',
                      '&:hover': {
                        color: 'secondary.main',
                      },
                    }}
                  >
                    Create an Account
                  </Link>
                </Typography>
              </Box>
            </Box>

            {/* Footer */}
            <Box sx={{ mt: 10, textAlign: { xs: 'center', lg: 'left' } }}>
              <Typography
                variant="caption"
                sx={{
                  color: '#9ca3af',
                  fontWeight: 600,
                  lineHeight: 1.8,
                  fontSize: '0.75rem',
                }}
              >
                © 2026 ZODU Management Cloud. All rights reserved.
                <br />
                Trusted by 5,000+ Retailers &amp; Restaurants.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default ZoduLoginPage;
