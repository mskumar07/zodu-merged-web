
// import React, { useEffect, useState } from 'react';
// import {
//   Box,
//   TextField,
//   Button,
//   Typography,
//   Link,
//   Stack,
//   Alert,
//   CircularProgress,
//   InputAdornment,
//   IconButton,
// } from '@mui/material';
// import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
// import {
//   ShoppingBag as ShoppingBagIcon,
//   Layers as LayersIcon,
//   ShoppingCart as ShoppingCartIcon,
//   Person as PersonIcon,
//   Security as SecurityIcon,
//   Visibility,
//   VisibilityOff,
//   EmailOutlined,
//   LockOutlined,
// } from '@mui/icons-material';
// import { createTheme, ThemeProvider } from '@mui/material/styles';
// import { useLoginMutation, type LoginResponse } from './Authapi';
// import { useAppDispatch, useAppSelector } from '@store/store';
// import { IsAuthenticated } from '@store/slices/userSlice';
// import { setAuthData } from '@store/slices/userSlice';

// // ── theme ─────────────────────────────────────────────────────────────────────
// const theme = createTheme({
//   palette: {
//     primary:    { main: '#D2122E' },
//     secondary:  { main: '#B00E26' },
//     background: { default: '#ffffff', paper: '#ffffff' },
//   },
//   shape:      { borderRadius: 12 },
//   components: {
//     MuiTextField: {
//       defaultProps: { size: 'small' },
//       styleOverrides: {
//         root: {
//           '& .MuiOutlinedInput-root': {
//             borderRadius: 10,
//             fontWeight: 500,
//             fontSize: '0.9rem',
//             transition: 'box-shadow 0.2s',
//             '&.Mui-focused': {
//               boxShadow: '0 0 0 3px rgba(210,18,46,0.12)',
//             },
//             '& input': { padding: '12px 14px' },
//           },
//         },
//       },
//     },
//     MuiButton: {
//       styleOverrides: {
//         root: {
//           borderRadius: 10,
//           fontWeight: 700,
//           letterSpacing: '0.04em',
//           textTransform: 'none',
//           fontSize: '0.95rem',
//           padding: '12px 24px',
//           transition: 'all 0.2s',
//         },
//       },
//     },
//   },
// });

// // ── shared branding panel ─────────────────────────────────────────────────────
// const features = [
//   { icon: <LayersIcon />,       label: 'Retail'      },
//   { icon: <ShoppingCartIcon />, label: 'Restaurant'  },
//   { icon: <PersonIcon />,       label: 'CRM'         },
//   { icon: <SecurityIcon />,     label: 'HRM'         },
// ];

// const BrandingPanel: React.FC = () => (
//   <Box
//     sx={{
//       display:  { xs: 'none', lg: 'flex' },
//       flex:     1,
//       position: 'relative',
//       overflow: 'hidden',
//       bgcolor:  '#f8fafc',
//     }}
//   >
//     <Box
//       component="img"
//       src="https://lh3.googleusercontent.com/aida-public/AB6AXuASQ5TYj1l-4Jq21vhT3RZukrN6pT5Oat279tsoCp0ETxxZqe7wCsuGAunqcMJfWz5gAQ-N0rnO1kyr0yWXeg6tW5KW8_yDjipRixjCi-XJtZXMl_Ni9o1cerp2MnoSaBidA-hLZ38eJdNwoMO_xCuVSBFvCFtfktlmnPH1t6-ldLdDELC3Cm3EiaZTWmsvpFjT-r6uKFOPQaxX4w7sH3xo5V8Ez0nNk-22NfWtFX8KvmEfQIwSoh8qjWmjmz6bGHDEHbUu-Z8j4i8"
//       alt="ZODU platform illustration"
//       sx={{
//         position:   'absolute',
//         inset:      0,
//         width:      '100%',
//         height:     '100%',
//         objectFit:  'contain',
//         p:          6,
//         opacity:    0.95,
//         transform:  'scale(1.1)',
//       }}
//     />
//     <Box
//       sx={{
//         position:   'absolute',
//         inset:      0,
//         background: 'linear-gradient(to bottom right, rgba(210,18,46,0.08), transparent, rgba(248,250,252,0.85))',
//       }}
//     />
//     <Box
//       sx={{
//         position:       'absolute',
//         inset:          0,
//         display:        'flex',
//         flexDirection:  'column',
//         justifyContent: 'flex-end',
//         p:              8,
//         background:     'linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.5) 40%, transparent 100%)',
//       }}
//     >
//       {/* Logo */}
//       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 5 }}>
//         <Box
//           sx={{
//             bgcolor:     'primary.main',
//             p:           1,
//             borderRadius: 2.5,
//             boxShadow:   '0 12px 24px rgba(210,18,46,0.25)',
//           }}
//         >
//           <ShoppingBagIcon sx={{ fontSize: 30, color: 'white' }} />
//         </Box>
//         <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', letterSpacing: '-0.03em' }}>
//           ZODU
//         </Typography>
//       </Box>

//       <Typography
//         variant="h2"
//         sx={{ fontWeight: 800, color: '#111827', lineHeight: 1.15, letterSpacing: '-0.03em', fontSize: '2.75rem' }}
//       >
//         Empowering Retail &amp;<br />Hospitality.
//       </Typography>

//       <Typography
//         variant="body1"
//         sx={{ mt: 2.5, color: '#4b5563', maxWidth: 480, fontWeight: 500, lineHeight: 1.8, fontSize: '1rem' }}
//       >
//         Streamline your operations, manage inventory, and delight customers
//         with our all-in-one POS solution.
//       </Typography>

//       <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
//         {features.map((f, i) => (
//           <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
//             <Box
//               sx={{
//                 width:           42,
//                 height:          42,
//                 borderRadius:    '50%',
//                 bgcolor:         'rgba(210,18,46,0.08)',
//                 display:         'flex',
//                 alignItems:      'center',
//                 justifyContent:  'center',
//                 border:          '1.5px solid rgba(210,18,46,0.18)',
//                 '& svg':         { fontSize: 18, color: 'primary.main' },
//               }}
//             >
//               {f.icon}
//             </Box>
//             <Typography
//               variant="caption"
//               sx={{ fontSize: '0.6rem', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}
//             >
//               {f.label}
//             </Typography>
//           </Box>
//         ))}
//       </Stack>
//     </Box>
//   </Box>
// );

// // ── login page ────────────────────────────────────────────────────────────────
// const ZoduLoginPage: React.FC = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const dispatch = useAppDispatch();
//   const isAuthenticated = useAppSelector(IsAuthenticated);
//   const { mutateAsync: login, isPending } = useLoginMutation();
//   const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/dashboard';

//   // form state
//   const [identity, setIdentity]         = useState('');
//   const [password, setPassword]         = useState('');
//   const [showPassword, setShowPassword] = useState(false);

//   // UX state
//   const [error, setError]               = useState('');
//   const [fieldErrors, setFieldErrors]   = useState<{ identity?: string; password?: string }>({});

//   useEffect(() => {
//     if (isAuthenticated) {
//       navigate(redirectTo, { replace: true });
//     }
//   }, [isAuthenticated, navigate, redirectTo]);

//   // ── client-side validation ──────────────────────────────────────────────────
//   function validate(): boolean {
//     const errs: typeof fieldErrors = {};
//     if (!identity.trim()) {
//       errs.identity = 'Email or phone number is required';
//     } else if (
//       !identity.includes('@') &&
//       !/^[0-9]{10}$/.test(identity.replace(/\s/g, ''))
//     ) {
//       errs.identity = 'Enter a valid email or 10-digit phone number';
//     }
//     if (!password) {
//       errs.password = 'Password is required';
//     } else if (password.length < 6) {
//       errs.password = 'Password must be at least 6 characters';
//     }
//     setFieldErrors(errs);
//     return Object.keys(errs).length === 0;
//   }

//   // ── submit ──────────────────────────────────────────────────────────────────
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     if (!validate()) return;

//     const isEmail = identity.includes('@');
//     const payload = isEmail
//       ? { email: identity.trim(), password }
//       : { phone_number: identity.trim(), password };

//     try {
//       const response = await login(payload);
//       const data: LoginResponse =
//         response && typeof response === 'object' && 'data' in response
//           ? (response.data as LoginResponse)
//           : response;

//       if (!data?.user || !data?.access_token || !data?.refresh_token) {
//         throw new Error('Invalid login response');
//       }

//       dispatch(
//         setAuthData({
//           accessToken: data.access_token,
//           refreshToken: data.refresh_token,
//           profile: data.user,
//         })
//       );
//       navigate(redirectTo, { replace: true });
//     } catch (err: any) {
//       // err.message is unwrapped by authApi.unwrap()
//       console.log(err)
//       setError('Login failed. Please try again.');
//     }
//   };

//   return (
//     <ThemeProvider theme={theme}>
//       <Box sx={{ display: 'flex', minHeight: '100vh' }}>
//         <BrandingPanel />

//         {/* ── right: form ── */}
//         <Box
//           sx={{
//             flex:           1,
//             display:        'flex',
//             flexDirection:  'column',
//             justifyContent: 'center',
//             alignItems:     'center',
//             px:             { xs: 3, sm: 5, lg: 8 },
//             py:             { xs: 6, sm: 8 },
//             bgcolor:        '#fafafa',
//           }}
//         >
//           <Box sx={{ width: '100%', maxWidth: 400 }}>
//             {/* Mobile logo */}
//             <Box
//               sx={{
//                 display:       { xs: 'flex', lg: 'none' },
//                 flexDirection: 'column',
//                 alignItems:    'center',
//                 mb:             5,
//               }}
//             >
//               <Box
//                 sx={{
//                   width:           52,
//                   height:          52,
//                   bgcolor:         'primary.main',
//                   borderRadius:    3,
//                   display:         'flex',
//                   alignItems:      'center',
//                   justifyContent:  'center',
//                   boxShadow:       '0 12px 24px rgba(210,18,46,0.25)',
//                   mb:              1.5,
//                 }}
//               >
//                 <ShoppingBagIcon sx={{ fontSize: 30, color: 'white' }} />
//               </Box>
//               <Typography variant="h5" fontWeight={800} letterSpacing="-0.02em">ZODU</Typography>
//             </Box>

//             {/* Header */}
//             <Box sx={{ mb: 5 }}>
//               <Typography
//                 variant="h4"
//                 sx={{ fontWeight: 800, color: '#D2122E', letterSpacing: '-0.03em', textAlign: 'center', mb: 1 }}
//               >
//                 Welcome back
//               </Typography>
//               <Typography
//                 variant="body2"
//                 sx={{ color: '#6b7280', fontWeight: 500, textAlign: 'center', fontSize: '0.9rem', lineHeight: 1.6 }}
//               >
//                 Sign in to manage your restaurant, retail,<br />CRM and HRM in one place.
//               </Typography>
//             </Box>

//             {/* Global error alert */}
//             {error && (
//               <Alert
//                 severity="error"
//                 sx={{ mb: 3, borderRadius: 2.5, fontWeight: 600, fontSize: '0.85rem' }}
//                 onClose={() => setError('')}
//               >
//                 {error}
//               </Alert>
//             )}

//             {/* Form */}
//             <Box component="form" onSubmit={handleSubmit} noValidate>
//               <Stack spacing={2.5}>
//                 {/* Identity */}
//                 <Box>
//                   <Typography
//                     variant="body2"
//                     sx={{ mb: 0.75, fontWeight: 700, color: '#374151', fontSize: '0.82rem' }}
//                   >
//                     Email or Phone Number
//                   </Typography>
//                   <TextField
//                     fullWidth
//                     placeholder="manager@store.com or 9876543210"
//                     value={identity}
//                     onChange={(e) => {
//                       setIdentity(e.target.value);
//                       if (fieldErrors.identity) setFieldErrors(p => ({ ...p, identity: undefined }));
//                     }}
//                     error={!!fieldErrors.identity}
//                     helperText={fieldErrors.identity}
//                     disabled={isPending}
//                     InputProps={{
//                       startAdornment: (
//                         <InputAdornment position="start">
//                           <EmailOutlined sx={{ fontSize: 18, color: fieldErrors.identity ? 'error.main' : '#9ca3af' }} />
//                         </InputAdornment>
//                       ),
//                     }}
//                   />
//                 </Box>

//                 {/* Password */}
//                 <Box>
//                   <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
//                     <Typography
//                       variant="body2"
//                       sx={{ fontWeight: 700, color: '#374151', fontSize: '0.82rem' }}
//                     >
//                       Password
//                     </Typography>
//                     <Link
//                       href="#"
//                       sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'primary.main', textDecoration: 'none', '&:hover': { color: 'secondary.main' } }}
//                     >
//                       Forgot password?
//                     </Link>
//                   </Box>
//                   <TextField
//                     fullWidth
//                     type={showPassword ? 'text' : 'password'}
//                     placeholder="Enter your password"
//                     value={password}
//                     onChange={(e) => {
//                       setPassword(e.target.value);
//                       if (fieldErrors.password) setFieldErrors(p => ({ ...p, password: undefined }));
//                     }}
//                     error={!!fieldErrors.password}
//                     helperText={fieldErrors.password}
//                     disabled={isPending}
//                     InputProps={{
//                       startAdornment: (
//                         <InputAdornment position="start">
//                           <LockOutlined sx={{ fontSize: 18, color: fieldErrors.password ? 'error.main' : '#9ca3af' }} />
//                         </InputAdornment>
//                       ),
//                       endAdornment: (
//                         <InputAdornment position="end">
//                           <IconButton size="small" onClick={() => setShowPassword(p => !p)} edge="end" tabIndex={-1}>
//                             {showPassword
//                               ? <VisibilityOff sx={{ fontSize: 18, color: '#9ca3af' }} />
//                               : <Visibility    sx={{ fontSize: 18, color: '#9ca3af' }} />}
//                           </IconButton>
//                         </InputAdornment>
//                       ),
//                     }}
//                   />
//                 </Box>

//                 {/* Submit */}
//                 <Button
//                   type="submit"
//                   fullWidth
//                   variant="contained"
//                   disabled={isPending}
//                   sx={{
//                     py:        1.6,
//                     mt:        0.5,
//                     boxShadow: '0 8px 20px rgba(210,18,46,0.25)',
//                     '&:hover': { bgcolor: 'secondary.main', boxShadow: '0 12px 24px rgba(210,18,46,0.35)', transform: 'translateY(-1px)' },
//                     '&:active':   { transform: 'translateY(0)' },
//                     '&.Mui-disabled': { bgcolor: '#e5e7eb', boxShadow: 'none' },
//                   }}
//                 >
//                   {isPending
//                     ? <CircularProgress size={20} sx={{ color: 'white' }} />
//                     : 'Sign In'}
//                 </Button>
//               </Stack>

//               {/* Divider + signup link */}
//               <Box sx={{ mt: 4, pt: 3.5, borderTop: '1px solid #f0f0f0', textAlign: 'center' }}>
//                 <Typography variant="body2" sx={{ color: '#4b5563', fontWeight: 500, fontSize: '0.875rem' }}>
//                   Don't have an account?{' '}
//                   <Link
//                     component={RouterLink}
//                     to="/signup"
//                     sx={{ fontWeight: 700, color: 'primary.main', textDecoration: 'none', '&:hover': { color: 'secondary.main' } }}
//                   >
//                     Create one for free
//                   </Link>
//                 </Typography>
//               </Box>
//             </Box>

//             {/* Footer */}
//             <Box sx={{ mt: 8, textAlign: 'center' }}>
//               <Typography variant="caption" sx={{ color: '#c4c4c4', fontWeight: 600, fontSize: '0.7rem', lineHeight: 1.8 }}>
//                 © 2026 ZODU Management Cloud. All rights reserved.<br />
//                 Trusted by 5,000+ Retailers &amp; Restaurants.
//               </Typography>
//             </Box>
//           </Box>
//         </Box>
//       </Box>
//     </ThemeProvider>
//   );
// };

// export default ZoduLoginPage;
import React, { useEffect, useState } from 'react';
import {
  Box, TextField, Button, Typography, Link, Stack,
  Alert, CircularProgress, InputAdornment, IconButton,
} from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  TrendingUp as TrendingUpIcon,
  Payments as PaymentsIcon,
  Visibility, VisibilityOff,
  EmailOutlined, LockOutlined,
  Login as LoginIcon,
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useLoginMutation, type LoginResponse } from './Authapi';
import { useAppDispatch, useAppSelector } from '@store/store';
import { IsAuthenticated, setAuthData } from '@store/slices/userSlice';

// ─── Theme ────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary:    { main: '#af101a' },
    background: { default: '#f8f9fa', paper: '#ffffff' },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: { fontFamily: "'Plus Jakarta Sans', sans-serif" },
    h2: { fontFamily: "'Plus Jakarta Sans', sans-serif" },
    h3: { fontFamily: "'Plus Jakarta Sans', sans-serif" },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiTextField: {
      defaultProps: { size: 'medium' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            bgcolor:      '#f3f4f5',
            
            fontSize:     '0.9rem',
            fontWeight:   500,
            border:       '1px solid #e0e0e0',
            '& fieldset': { border: 'none' },
            '&.Mui-focused': {
              bgcolor:    '#ffffff',
              // boxShadow:  '0 0 0 2px #af101a',
            },
            '& input': { padding: '14px 16px' },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius:  12,
          fontWeight:    700,
          textTransform: 'none',
          fontSize:      '0.95rem',
          padding:       '14px 24px',
        },
      },
    },
  },
});

// ─── Left Branding Panel ──────────────────────────────────────
const BrandingPanel: React.FC = () => (
  <Box
    sx={{
      display:       { xs: 'none', md: 'flex' },
      width:         '50%',
      flexShrink:    0,
      flexDirection: 'column',
      justifyContent:'space-between',
      position:      'relative',
      overflow:      'hidden',
      bgcolor:       '#f3f4f5',
      p:             { md: 6, lg: 10 },
    }}
  >
    {/* Decorative blobs */}
    <Box sx={{ position: 'absolute', top: -96, left: -96, width: 384, height: 384, bgcolor: 'rgba(175,16,26,0.05)', borderRadius: '50%', filter: 'blur(64px)' }} />
    <Box sx={{ position: 'absolute', bottom: 80, right: 0, width: 256, height: 256, bgcolor: 'rgba(0,95,123,0.05)', borderRadius: '50%', filter: 'blur(64px)' }} />

    {/* Headline */}
    <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 440 }}>
      <Typography
        sx={{
          fontFamily:    "'Plus Jakarta Sans', sans-serif",
          fontSize:      { md: '3rem', lg: '4.5rem' },
          fontWeight:    800,
          color:         '#191c1d',
          lineHeight:    1.1,
          letterSpacing: '-0.02em',
          mb:            3,
        }}
      >
        Fast &amp; Easy{' '}
        <Box component="span" sx={{ color: 'primary.main' }}>Billing</Box>
      </Typography>
      <Typography sx={{ fontSize: '1.1rem', color: '#5b403d', lineHeight: 1.625, maxWidth: 380 }}>
        Command your business from any device with precision and ease.
        Experience the pulse of your finances in real-time.
      </Typography>
    </Box>

    {/* Metric card */}
    <Box sx={{ position: 'relative', zIndex: 1 }}>
      <Box
        sx={{
          bgcolor:      '#ffffff',
          borderRadius: 3,
          p:            4,
          maxWidth:     340,
          boxShadow:    '0 25px 50px -12px rgba(0,0,0,0.08)',
          transition:   'transform 0.5s ease',
          '&:hover':    { transform: 'translateY(-8px)' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box
            sx={{
              width:          48,
              height:         48,
              borderRadius:   '50%',
              bgcolor:        '#ffdad6',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
            }}
          >
            <PaymentsIcon sx={{ color: 'primary.main', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.8rem', color: '#5b403d', fontWeight: 500 }}>
              Total Invoiced
            </Typography>
            <Typography
              sx={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize:   '1.5rem',
                fontWeight: 800,
                color:      '#191c1d',
                lineHeight: 1.2,
              }}
            >
              $142,850.00
            </Typography>
          </Box>
        </Box>
        {/* Progress bar */}
        <Box sx={{ mb: 1.5 }}>
          <Box sx={{ height: 8, bgcolor: '#e7e8e9', borderRadius: 8, overflow: 'hidden' }}>
            <Box sx={{ height: '100%', width: '85%', bgcolor: 'primary.main', borderRadius: 8 }} />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <TrendingUpIcon sx={{ fontSize: 14, color: 'primary.main' }} />
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#5b403d' }}>
            12% increase from last month
          </Typography>
        </Box>
      </Box>

      {/* Grayscale office image — decorative */}
      <Box
        component="img"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGM7YosMDJTh9k4abAECbFZaHG6Nvb5Ec18sUqSKVXSd1nep1dtgY28fDUTSubXu3Z1IqI0amYmB51LIBMONx8-bQOr4pUSi81iR4vqcVy99JD9-deGzbFPb0jmmeSA9ujiybqvIW0gj8qpW4IwFw3DWhCct-SkCut0bZyuZs_shmzgHdHdnaoepQPdCpFFVyMD-EcG9r60HpT2b0YNl1VrHiLeVqdSkbKyHIrm6FbGrgCRj7n2JRx2-AaQh12YQMO1GNudOfhTP8"
        alt="Office workspace"
        sx={{
          position:  'absolute',
          bottom:    48,
          right:     48,
          width:     '50%',
          opacity:   0.18,
          filter:    'grayscale(100%) contrast(1.25)',
          borderRadius: 3,
          pointerEvents: 'none',
        }}
      />
    </Box>
  </Box>
);

// ─── Login Page ───────────────────────────────────────────────
const ZoduLoginPage: React.FC = () => {
  const navigate        = useNavigate();
  const location        = useLocation();
  const dispatch        = useAppDispatch();
  const isAuthenticated = useAppSelector(IsAuthenticated);
  const { mutateAsync: login, isPending } = useLoginMutation();
  const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/dashboard';

  const [identity,     setIdentity]     = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState('');
  const [fieldErrors,  setFieldErrors]  = useState<{ identity?: string; password?: string }>({});

  useEffect(() => {
    if (isAuthenticated) navigate(redirectTo, { replace: true });
  }, [isAuthenticated, navigate, redirectTo]);

  function validate(): boolean {
    const errs: typeof fieldErrors = {};
    if (!identity.trim()) {
      errs.identity = 'Email or phone number is required';
    } else if (!identity.includes('@') && !/^[0-9]{10}$/.test(identity.replace(/\s/g, ''))) {
      errs.identity = 'Enter a valid email or 10-digit phone number';
    }
    if (!password)             errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    const isEmail = identity.includes('@');
    const payload = isEmail
      ? { email: identity.trim(), password }
      : { phone_number: identity.trim(), password };
    try {
      const response = await login(payload);
      const data: LoginResponse =
        response && typeof response === 'object' && 'data' in response
          ? (response.data as LoginResponse)
          : response;
      if (!data?.user || !data?.access_token || !data?.refresh_token)
        throw new Error('Invalid login response');
      dispatch(setAuthData({ accessToken: data.access_token, refreshToken: data.refresh_token, profile: data.user }));
      navigate(redirectTo, { replace: true });
    } catch {
      setError('Login failed. Please check your credentials and try again.');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@700;800&display=swap');`}</style>

      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8f9fa' }}>
        <BrandingPanel />

        {/* ── Right: form panel ── */}
        <Box
          sx={{
            flex:           1,
            display:        'flex',
            flexDirection:  'column',
            bgcolor:        '#ffffff',
            position:       'relative',
            minHeight:      '100vh',
          }}
        >
          {/* ── Logo — top right ── */}
          <Box
            sx={{
              position: 'absolute',
              top:      { xs: 20, sm: 28 },
              right:    { xs: 24, sm: 36 },
              zIndex:   10,
            }}
          >
            <Typography
              sx={{
                fontFamily:    "'Plus Jakarta Sans', sans-serif",
                fontSize:      '2rem',
                fontWeight:    800,
                color:         'primary.main',
                letterSpacing: '-0.04em',
                lineHeight:    1,
              }}
            >
              zodu
            </Typography>
          </Box>

          {/* ── Centered form ── */}
          <Box
            sx={{
              flex:           1,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              px:             { xs: 3, sm: 6, lg: 10 },
              py:             { xs: 8, sm: 6 },
            }}
          >
            <Box sx={{ width: '100%', maxWidth: 420 }}>
              {/* Heading */}
              <Box sx={{ textAlign: 'center', mb: 5 }}>
                <Typography
                  sx={{
                    fontFamily:    "'Plus Jakarta Sans', sans-serif",
                    fontSize:      '1.875rem',
                    fontWeight:    800,
                    color:         '#191c1d',
                    mb:            1,
                  }}
                >
                  Welcome Back
                </Typography>
                <Typography sx={{ color: '#5b403d', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Enter your credentials to access your command center.
                </Typography>
              </Box>

              {/* Error alert */}
              {error && (
                <Alert
                  severity="error"
                  onClose={() => setError('')}
                  sx={{ mb: 3, borderRadius: 2, fontSize: '0.85rem', fontWeight: 600 }}
                >
                  {error}
                </Alert>
              )}

              {/* Form */}
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={3}>
                  {/* Email field */}
                  <Box>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#5b403d', mb: 0.75, ml: 0.5 }}>
                      Email Address
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="name@company.com"
                      value={identity}
                      onChange={e => { setIdentity(e.target.value); if (fieldErrors.identity) setFieldErrors(p => ({ ...p, identity: undefined })); }}
                      error={!!fieldErrors.identity}
                      helperText={fieldErrors.identity}
                      disabled={isPending}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailOutlined sx={{ fontSize: 18, color: fieldErrors.identity ? 'error.main' : '#8f6f6c' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  {/* Password field */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75, mx: 0.5 }}>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#5b403d' }}>
                        Password
                      </Typography>
                      <Link href="#" underline="hover" sx={{ fontSize: '0.82rem', fontWeight: 700, color: 'primary.main' }}>
                        Forgot Password?
                      </Link>
                    </Box>
                    <TextField
                      fullWidth
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors(p => ({ ...p, password: undefined })); }}
                      error={!!fieldErrors.password}
                      helperText={fieldErrors.password}
                      disabled={isPending}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlined sx={{ fontSize: 18, color: fieldErrors.password ? 'error.main' : '#8f6f6c' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setShowPassword(p => !p)} edge="end" tabIndex={-1}>
                              {showPassword
                                ? <VisibilityOff sx={{ fontSize: 18, color: '#8f6f6c' }} />
                                : <Visibility    sx={{ fontSize: 18, color: '#8f6f6c' }} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  {/* Submit */}
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isPending}
                    endIcon={!isPending && <LoginIcon sx={{ fontSize: 20 }} />}
                    sx={{
                      py:         1.75,
                      mt:         0.5,
                      background: 'linear-gradient(135deg, #af101a 0%, #d32f2f 100%)',
                      boxShadow:  '0 8px 24px rgba(175,16,26,0.3)',
                      fontSize:   '1rem',
                      '&:hover':  {
                        background:  'linear-gradient(135deg, #930010 0%, #af101a 100%)',
                        boxShadow:   '0 12px 28px rgba(175,16,26,0.4)',
                        transform:   'scale(1.015)',
                      },
                      '&:active':       { transform: 'scale(0.985)' },
                      '&.Mui-disabled': { bgcolor: '#e4beba', boxShadow: 'none' },
                      transition:       'all 0.2s ease',
                    }}
                  >
                    {isPending ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Login'}
                  </Button>
                </Stack>

                {/* Sign up link */}
                <Box sx={{ mt: 5, textAlign: 'center' }}>
                  <Typography sx={{ color: '#5b403d', fontSize: '0.9rem' }}>
                    Don't have an account?{' '}
                    <Link
                      component={RouterLink}
                      to="/signup"
                      sx={{ fontWeight: 700, color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    >
                      Create one
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* ── Footer ── */}
          <Box
            component="footer"
            sx={{
              display:        'flex',
              flexDirection:  { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems:     'center',
              px:             { xs: 3, sm: 5 },
              py:             2.5,
              bgcolor:        '#f3f4f5',
              borderTop:      '1px solid #e4beba',
              gap:            1.5,
            }}
          >
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#191c1d', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              zodu
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
              {['Privacy Policy', 'Terms of Service', 'Help Center', 'Contact'].map(item => (
                <Link
                  key={item}
                  href="#"
                  underline="hover"
                  sx={{ fontSize: '0.8rem', color: '#8f6f6c', '&:hover': { color: 'primary.main' }, transition: 'color 0.15s' }}
                >
                  {item}
                </Link>
              ))}
            </Box>
            <Typography sx={{ fontSize: '0.78rem', color: '#8f6f6c' }}>
              © 2026 ZODU. All rights reserved.
            </Typography>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default ZoduLoginPage;