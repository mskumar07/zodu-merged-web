import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  InputAdornment,
  Stack,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
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

const ZoduSignupPage: React.FC = () => {
  const [restaurantName, setRestaurantName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Signup attempt:', {
      restaurantName,
      email,
      mobile,
      password,
      confirmPassword,
    });
    // Add your signup logic here
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
                <Box
                  key={index}
                  sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
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

        {/* RIGHT SIDE: Signup Form Section */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            px: { xs: 2, sm: 3, lg: 10, xl: 12 },
            py: { xs: 6, sm: 12 },
            bgcolor: '#fafafa',
          }}
        >
          <Box sx={{ mx: 'auto', width: '100%', maxWidth: 440 }}>
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

            {/* Logo */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  letterSpacing: '-0.02em',
                  fontSize: '2.5rem',
                  textTransform: 'lowercase',
                }}
              >
                zodu
              </Typography>
            </Box>

            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: '#111827',
                  mb: 1,
                }}
              >
                Create Account
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#6b7280',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                }}
              >
                Welcome to the kitchen! Let's cook up something amazing together
              </Typography>
            </Box>

            {/* Signup Form */}
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
              <Stack spacing={2.5}>
                {/* Restaurant Name Field */}
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: '#111827',
                      fontSize: '0.875rem',
                    }}
                  >
                    Restaurant Name
                  </Typography>
                  <TextField
                    fullWidth
                    id="restaurantName"
                    name="restaurantName"
                    type="text"
                    placeholder="Eg : Placeholder"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        bgcolor: 'white',
                        fontWeight: 500,
                        '& input': {
                          py: 1.5,
                        },
                        '& fieldset': {
                          borderColor: '#d1d5db',
                        },
                        '&:hover fieldset': {
                          borderColor: '#9ca3af',
                        },
                      },
                    }}
                  />
                </Box>

                {/* Email Field */}
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: '#111827',
                      fontSize: '0.875rem',
                    }}
                  >
                    Email id
                  </Typography>
                  <TextField
                    fullWidth
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Eg : Placeholder"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        bgcolor: 'white',
                        fontWeight: 500,
                        '& input': {
                          py: 1.5,
                        },
                        '& fieldset': {
                          borderColor: '#d1d5db',
                        },
                        '&:hover fieldset': {
                          borderColor: '#9ca3af',
                        },
                      },
                    }}
                  />
                </Box>

                {/* Mobile Number Field */}
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: '#111827',
                      fontSize: '0.875rem',
                    }}
                  >
                    Mobile No
                  </Typography>
                  <TextField
                    fullWidth
                    id="mobile"
                    name="mobile"
                    type="tel"
                    placeholder="Eg : Placeholder"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography
                            sx={{
                              fontWeight: 600,
                              color: '#6b7280',
                              fontSize: '0.875rem',
                            }}
                          >
                            +91
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        bgcolor: 'white',
                        fontWeight: 500,
                        '& input': {
                          py: 1.5,
                        },
                        '& fieldset': {
                          borderColor: '#d1d5db',
                        },
                        '&:hover fieldset': {
                          borderColor: '#9ca3af',
                        },
                      },
                    }}
                  />
                </Box>

                {/* Create Password Field */}
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: '#111827',
                      fontSize: '0.875rem',
                    }}
                  >
                    Create Password
                  </Typography>
                  <TextField
                    fullWidth
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Eg : Placeholder"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        bgcolor: 'white',
                        fontWeight: 500,
                        '& input': {
                          py: 1.5,
                        },
                        '& fieldset': {
                          borderColor: '#d1d5db',
                        },
                        '&:hover fieldset': {
                          borderColor: '#9ca3af',
                        },
                      },
                    }}
                  />
                </Box>

                {/* Confirm Password Field */}
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: '#111827',
                      fontSize: '0.875rem',
                    }}
                  >
                    Confirm Password
                  </Typography>
                  <TextField
                    fullWidth
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Eg : Placeholder"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        bgcolor: 'white',
                        fontWeight: 500,
                        '& input': {
                          py: 1.5,
                        },
                        '& fieldset': {
                          borderColor: '#d1d5db',
                        },
                        '&:hover fieldset': {
                          borderColor: '#9ca3af',
                        },
                      },
                    }}
                  />
                </Box>

                {/* Create Account Button */}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    py: 1.75,
                    borderRadius: 1,
                    fontWeight: 700,
                    fontSize: '1rem',
                    textTransform: 'none',
                    mt: 1,
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: 'secondary.main',
                      boxShadow: 'none',
                    },
                  }}
                >
                  Create Account
                </Button>
              </Stack>

              {/* Login Link */}
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#4b5563',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                  }}
                >
                  Already have an account?{' '}
                  <Link
                    component={RouterLink}
                    to="/login"
                    sx={{
                      fontWeight: 700,
                      color: 'primary.main',
                      textDecoration: 'none',
                      '&:hover': {
                        color: 'secondary.main',
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Login here
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default ZoduSignupPage;
