
// import React, { useState } from 'react';
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
//   LinearProgress,
// } from '@mui/material';
// import { Link as RouterLink, useNavigate } from 'react-router-dom';
// import {
//   ShoppingBag as ShoppingBagIcon,
//   Layers as LayersIcon,
//   ShoppingCart as ShoppingCartIcon,
//   Person as PersonIcon,
//   Security as SecurityIcon,
//   Visibility,
//   VisibilityOff,
//   StorefrontOutlined,
//   EmailOutlined,
//   PhoneOutlined,
//   LockOutlined,
//   CheckCircle,
// } from '@mui/icons-material';
// import { createTheme, ThemeProvider } from '@mui/material/styles';
// import { useSignupMutation } from './authApi';

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
//           fontWeight:    700,
//           letterSpacing: '0.02em',
//           textTransform: 'none',
//           fontSize:      '0.95rem',
//           padding:       '12px 24px',
//           transition:    'all 0.2s',
//         },
//       },
//     },
//   },
// });

// // ── features (shared branding data) ──────────────────────────────────────────
// const features = [
//   { icon: <LayersIcon />,       label: 'Retail'     },
//   { icon: <ShoppingCartIcon />, label: 'Restaurant' },
//   { icon: <PersonIcon />,       label: 'CRM'        },
//   { icon: <SecurityIcon />,     label: 'HRM'        },
// ];

// // ── branding panel (same as login) ───────────────────────────────────────────
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
//         position:  'absolute',
//         inset:     0,
//         width:     '100%',
//         height:    '100%',
//         objectFit: 'contain',
//         p:         6,
//         opacity:   0.95,
//         transform: 'scale(1.1)',
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
//       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 5 }}>
//         <Box sx={{ bgcolor: 'primary.main', p: 1, borderRadius: 2.5, boxShadow: '0 12px 24px rgba(210,18,46,0.25)' }}>
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
//         Experience the future of business management with ZODU. Streamline your
//         operations, manage inventory, and delight customers.
//       </Typography>

//       <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
//         {features.map((f, i) => (
//           <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
//             <Box
//               sx={{
//                 width:          42,
//                 height:         42,
//                 borderRadius:   '50%',
//                 bgcolor:        'rgba(210,18,46,0.08)',
//                 display:        'flex',
//                 alignItems:     'center',
//                 justifyContent: 'center',
//                 border:         '1.5px solid rgba(210,18,46,0.18)',
//                 '& svg':        { fontSize: 18, color: 'primary.main' },
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

// // ── password strength ─────────────────────────────────────────────────────────
// function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
//   if (!pw) return { score: 0, label: '', color: '#e5e7eb' };
//   let score = 0;
//   if (pw.length >= 8)              score++;
//   if (/[A-Z]/.test(pw))            score++;
//   if (/[0-9]/.test(pw))            score++;
//   if (/[^A-Za-z0-9]/.test(pw))     score++;
//   const levels = [
//     { label: 'Too short',  color: '#EF4444' },
//     { label: 'Weak',       color: '#F97316' },
//     { label: 'Fair',       color: '#EAB308' },
//     { label: 'Good',       color: '#22C55E' },
//     { label: 'Strong',     color: '#16A34A' },
//   ];
//   return { score, ...levels[score] };
// }

// // ── signup page ───────────────────────────────────────────────────────────────
// const ZoduSignupPage: React.FC = () => {
//   const navigate = useNavigate();
//   const { mutateAsync: signup, isPending } = useSignupMutation();

//   const [form, setForm] = useState({
//     restaurant_name:  '',
//     email:            '',
//     phone_number:     '',
//     password:         '',
//     confirmPassword:  '',
//   });

//   const [showPassword, setShowPassword]         = useState(false);
//   const [showConfirmPassword, setShowConfirmPw] = useState(false);
//   const [error, setError]                       = useState('');
//   const [success, setSuccess]                   = useState(false);
//   const [fieldErrors, setFieldErrors]           = useState<Partial<Record<keyof typeof form, string>>>({});

//   const pwStrength = getPasswordStrength(form.password);

//   function setField(key: keyof typeof form, value: string) {
//     setForm(p => ({ ...p, [key]: value }));
//     if (fieldErrors[key]) setFieldErrors(p => ({ ...p, [key]: undefined }));
//   }

//   // ── validation ──────────────────────────────────────────────────────────────
//   function validate(): boolean {
//     const errs: typeof fieldErrors = {};

//     if (!form.restaurant_name.trim())
//       errs.restaurant_name = 'Restaurant name is required';

//     if (!form.email.trim())
//       errs.email = 'Email is required';
//     else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
//       errs.email = 'Enter a valid email address';

//     if (!form.phone_number.trim())
//       errs.phone_number = 'Mobile number is required';
//     else if (!/^[0-9]{10}$/.test(form.phone_number.replace(/\s/g, '')))
//       errs.phone_number = 'Enter a valid 10-digit mobile number';

//     if (!form.password)
//       errs.password = 'Password is required';
//     else if (form.password.length < 8)
//       errs.password = 'Password must be at least 8 characters';
//     else if (pwStrength.score < 2)
//       errs.password = 'Password is too weak — add numbers or special characters';

//     if (!form.confirmPassword)
//       errs.confirmPassword = 'Please confirm your password';
//     else if (form.password !== form.confirmPassword)
//       errs.confirmPassword = 'Passwords do not match';

//     setFieldErrors(errs);
//     return Object.keys(errs).length === 0;
//   }

//   // ── submit ──────────────────────────────────────────────────────────────────
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     if (!validate()) return;

//     try {
//       await signup({
//         restaurant_name: form.restaurant_name.trim(),
//         email:           form.email.trim(),
//         phone_number:    form.phone_number.trim(),
//         password:        form.password,
//       });
//       setSuccess(true);
//       // Brief success state then redirect to login
//       setTimeout(() => navigate('/login'), 1800);
//     } catch (err: any) {
//       setError(err.message || 'Registration failed. Please try again.');
//     }
//   };

//   // ── success screen ──────────────────────────────────────────────────────────
//   if (success) {
//     return (
//       <ThemeProvider theme={theme}>
//         <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#fafafa' }}>
//           <BrandingPanel />
//           <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
//             <Box sx={{ textAlign: 'center', maxWidth: 360 }}>
//               <CheckCircle sx={{ fontSize: 72, color: '#22C55E', mb: 3 }} />
//               <Typography variant="h5" fontWeight={800} color="#111827" mb={1}>
//                 Account Created!
//               </Typography>
//               <Typography variant="body2" color="#6b7280" fontWeight={500} mb={3}>
//                 Your ZODU account is ready. Redirecting you to login…
//               </Typography>
//               <CircularProgress size={24} sx={{ color: 'primary.main' }} />
//             </Box>
//           </Box>
//         </Box>
//       </ThemeProvider>
//     );
//   }

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
//             overflowY:      'auto',
//           }}
//         >
//           <Box sx={{ width: '100%', maxWidth: 420 }}>
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
//             <Box sx={{ textAlign: 'center', mb: 4 }}>
//               <Typography
//                 variant="h4"
//                 sx={{ fontWeight: 800, color: '#D2122E', letterSpacing: '-0.03em', mb: 1 }}
//               >
//                 Create Account
//               </Typography>
//               <Typography
//                 variant="body2"
//                 sx={{ color: '#6b7280', fontWeight: 500, fontSize: '0.875rem', lineHeight: 1.6 }}
//               >
//                 Join 5,000+ restaurants and retailers on ZODU
//               </Typography>
//             </Box>

//             {/* Global error */}
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
//               <Stack spacing={2}>
//                 {/* Restaurant Name */}
//                 <Box>
//                   <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 700, color: '#374151', fontSize: '0.82rem' }}>
//                     Restaurant Name
//                   </Typography>
//                   <TextField
//                     fullWidth
//                     placeholder="e.g. Spice Garden"
//                     value={form.restaurant_name}
//                     onChange={e => setField('restaurant_name', e.target.value)}
//                     error={!!fieldErrors.restaurant_name}
//                     helperText={fieldErrors.restaurant_name}
//                     disabled={isPending}
//                     InputProps={{
//                       startAdornment: (
//                         <InputAdornment position="start">
//                           <StorefrontOutlined sx={{ fontSize: 18, color: fieldErrors.restaurant_name ? 'error.main' : '#9ca3af' }} />
//                         </InputAdornment>
//                       ),
//                     }}
//                   />
//                 </Box>

//                 {/* Email */}
//                 <Box>
//                   <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 700, color: '#374151', fontSize: '0.82rem' }}>
//                     Email Address
//                   </Typography>
//                   <TextField
//                     fullWidth
//                     type="email"
//                     placeholder="manager@restaurant.com"
//                     value={form.email}
//                     onChange={e => setField('email', e.target.value)}
//                     error={!!fieldErrors.email}
//                     helperText={fieldErrors.email}
//                     disabled={isPending}
//                     InputProps={{
//                       startAdornment: (
//                         <InputAdornment position="start">
//                           <EmailOutlined sx={{ fontSize: 18, color: fieldErrors.email ? 'error.main' : '#9ca3af' }} />
//                         </InputAdornment>
//                       ),
//                     }}
//                   />
//                 </Box>

//                 {/* Phone */}
//                 <Box>
//                   <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 700, color: '#374151', fontSize: '0.82rem' }}>
//                     Mobile Number
//                   </Typography>
//                   <TextField
//                     fullWidth
//                     type="tel"
//                     placeholder="9876543210"
//                     value={form.phone_number}
//                     onChange={e => setField('phone_number', e.target.value.replace(/\D/g, '').slice(0, 10))}
//                     error={!!fieldErrors.phone_number}
//                     helperText={fieldErrors.phone_number}
//                     disabled={isPending}
//                     InputProps={{
//                       startAdornment: (
//                         <InputAdornment position="start">
//                           <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//                             <PhoneOutlined sx={{ fontSize: 16, color: '#9ca3af' }} />
//                             <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#6b7280', mr: 0.5 }}>
//                               +91
//                             </Typography>
//                           </Box>
//                         </InputAdornment>
//                       ),
//                     }}
//                   />
//                 </Box>

//                 {/* Password */}
//                 <Box>
//                   <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 700, color: '#374151', fontSize: '0.82rem' }}>
//                     Create Password
//                   </Typography>
//                   <TextField
//                     fullWidth
//                     type={showPassword ? 'text' : 'password'}
//                     placeholder="Min. 8 characters"
//                     value={form.password}
//                     onChange={e => setField('password', e.target.value)}
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
//                   {/* Password strength bar */}
//                   {form.password && (
//                     <Box sx={{ mt: 1 }}>
//                       <LinearProgress
//                         variant="determinate"
//                         value={(pwStrength.score / 4) * 100}
//                         sx={{
//                           height:       5,
//                           borderRadius: 3,
//                           bgcolor:      '#f0f0f0',
//                           '& .MuiLinearProgress-bar': {
//                             bgcolor:      pwStrength.color,
//                             borderRadius: 3,
//                             transition:   'width 0.4s ease',
//                           },
//                         }}
//                       />
//                       <Typography
//                         variant="caption"
//                         sx={{ fontSize: '0.72rem', fontWeight: 700, color: pwStrength.color, mt: 0.4, display: 'block' }}
//                       >
//                         {pwStrength.label}
//                       </Typography>
//                     </Box>
//                   )}
//                 </Box>

//                 {/* Confirm Password */}
//                 <Box>
//                   <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 700, color: '#374151', fontSize: '0.82rem' }}>
//                     Confirm Password
//                   </Typography>
//                   <TextField
//                     fullWidth
//                     type={showConfirmPassword ? 'text' : 'password'}
//                     placeholder="Re-enter your password"
//                     value={form.confirmPassword}
//                     onChange={e => setField('confirmPassword', e.target.value)}
//                     error={!!fieldErrors.confirmPassword}
//                     helperText={fieldErrors.confirmPassword}
//                     disabled={isPending}
//                     InputProps={{
//                       startAdornment: (
//                         <InputAdornment position="start">
//                           <LockOutlined sx={{ fontSize: 18, color: fieldErrors.confirmPassword ? 'error.main' : '#9ca3af' }} />
//                         </InputAdornment>
//                       ),
//                       endAdornment: (
//                         <InputAdornment position="end">
//                           <IconButton size="small" onClick={() => setShowConfirmPw(p => !p)} edge="end" tabIndex={-1}>
//                             {showConfirmPassword
//                               ? <VisibilityOff sx={{ fontSize: 18, color: '#9ca3af' }} />
//                               : <Visibility    sx={{ fontSize: 18, color: '#9ca3af' }} />}
//                           </IconButton>
//                         </InputAdornment>
//                       ),
//                     }}
//                   />
//                   {/* Live match indicator */}
//                   {form.confirmPassword && form.password && (
//                     <Typography
//                       variant="caption"
//                       sx={{
//                         fontSize:    '0.72rem',
//                         fontWeight:  700,
//                         color:       form.password === form.confirmPassword ? '#22C55E' : '#EF4444',
//                         mt:          0.4,
//                         display:     'block',
//                       }}
//                     >
//                       {form.password === form.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
//                     </Typography>
//                   )}
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
//                     '&:hover': {
//                       bgcolor:   'secondary.main',
//                       boxShadow: '0 12px 24px rgba(210,18,46,0.35)',
//                       transform: 'translateY(-1px)',
//                     },
//                     '&:active':       { transform: 'translateY(0)' },
//                     '&.Mui-disabled': { bgcolor: '#e5e7eb', boxShadow: 'none' },
//                   }}
//                 >
//                   {isPending
//                     ? <CircularProgress size={20} sx={{ color: 'white' }} />
//                     : 'Create Account'}
//                 </Button>
//               </Stack>

//               {/* Login link */}
//               <Box sx={{ mt: 3, textAlign: 'center' }}>
//                 <Typography variant="body2" sx={{ color: '#4b5563', fontWeight: 500, fontSize: '0.875rem' }}>
//                   Already have an account?{' '}
//                   <Link
//                     component={RouterLink}
//                     to="/login"
//                     sx={{
//                       fontWeight:    700,
//                       color:         'primary.main',
//                       textDecoration: 'none',
//                       '&:hover':     { color: 'secondary.main', textDecoration: 'underline' },
//                     }}
//                   >
//                     Login here
//                   </Link>
//                 </Typography>
//               </Box>
//             </Box>

//             {/* Footer */}
//             <Box sx={{ mt: 6, textAlign: 'center' }}>
//               <Typography variant="caption" sx={{ color: '#c4c4c4', fontWeight: 600, fontSize: '0.7rem', lineHeight: 1.8 }}>
//                 © 2026 ZODU Management Cloud. All rights reserved.
//               </Typography>
//             </Box>
//           </Box>
//         </Box>
//       </Box>
//     </ThemeProvider>
//   );
// };

// export default ZoduSignupPage;
import React, { useState } from 'react';
import {
  Box, TextField, Button, Typography, Link, Stack,
  Alert, CircularProgress, InputAdornment, IconButton, LinearProgress,
  Checkbox, FormControlLabel,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  TrendingUp as TrendingUpIcon,
  Payments as PaymentsIcon,
  Visibility, VisibilityOff,
  StorefrontOutlined, EmailOutlined, PhoneOutlined, LockOutlined,
  CheckCircle, HowToReg as HowToRegIcon,
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useSignupMutation } from './authApi';

// ─── Theme (shared with Login) ────────────────────────────────
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
            '& fieldset': { border: '1px solid #d1d5db' },
            '&.Mui-focused': {
              bgcolor:   '#ffffff',
              // boxShadow: '0 0 0 2px rgba(175,16,26,0.2)',
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

// ─── Left Branding Panel (identical to Login) ─────────────────
const BrandingPanel: React.FC = () => (
  <Box
    sx={{
      display:        { xs: 'none', md: 'flex' },
      width:          '50%',
      flexShrink:     0,
      flexDirection:  'column',
      justifyContent: 'space-between',
      position:       'relative',
      overflow:       'hidden',
      bgcolor:        '#f3f4f5',
      p:              { md: 6, lg: 10 },
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

      {/* Decorative image */}
      <Box
        component="img"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGM7YosMDJTh9k4abAECbFZaHG6Nvb5Ec18sUqSKVXSd1nep1dtgY28fDUTSubXu3Z1IqI0amYmB51LIBMONx8-bQOr4pUSi81iR4vqcVy99JD9-deGzbFPb0jmmeSA9ujiybqvIW0gj8qpW4IwFw3DWhCct-SkCut0bZyuZs_shmzgHdHdnaoepQPdCpFFVyMD-EcG9r60HpT2b0YNl1VrHiLeVqdSkbKyHIrm6FbGrgCRj7n2JRx2-AaQh12YQMO1GNudOfhTP8"
        alt="Office workspace"
        sx={{
          position:      'absolute',
          bottom:        48,
          right:         48,
          width:         '50%',
          opacity:       0.18,
          filter:        'grayscale(100%) contrast(1.25)',
          borderRadius:  3,
          pointerEvents: 'none',
        }}
      />
    </Box>
  </Box>
);

// ─── Password strength ────────────────────────────────────────
function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '#e5e7eb' };
  let score = 0;
  if (pw.length >= 8)          score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { label: 'Too short', color: '#EF4444' },
    { label: 'Weak',      color: '#F97316' },
    { label: 'Fair',      color: '#EAB308' },
    { label: 'Good',      color: '#22C55E' },
    { label: 'Strong',    color: '#16A34A' },
  ];
  return { score, ...levels[score] };
}

// ─── Signup Page ──────────────────────────────────────────────
const ZoduSignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { mutateAsync: signup, isPending } = useSignupMutation();

  const [form, setForm] = useState({
    restaurant_name: '',
    email:           '',
    phone_number:    '',
    password:        '',
    confirmPassword: '',
    same_for_branch: true,
  });
  const [showPassword,        setShowPassword]  = useState(false);
  const [showConfirmPassword, setShowConfirmPw] = useState(false);
  const [error,               setError]         = useState('');
  const [success,             setSuccess]       = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof typeof form, string>>>({});

  const pwStrength = getPasswordStrength(form.password);

  function setField(key: keyof typeof form, value: string) {
    setForm(p => ({ ...p, [key]: value }));
    if (fieldErrors[key]) setFieldErrors(p => ({ ...p, [key]: undefined }));
  }

  function validate(): boolean {
    const errs: typeof fieldErrors = {};
    if (!form.restaurant_name.trim())   errs.restaurant_name = 'Restaurant name is required';
    if (!form.email.trim())             errs.email           = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.phone_number.trim())      errs.phone_number    = 'Mobile number is required';
    else if (!/^[0-9]{10}$/.test(form.phone_number.replace(/\s/g, ''))) errs.phone_number = 'Enter a valid 10-digit mobile number';
    if (!form.password)                 errs.password        = 'Password is required';
    else if (form.password.length < 8)  errs.password        = 'Password must be at least 8 characters';
    else if (pwStrength.score < 2)      errs.password        = 'Password is too weak — add numbers or special characters';
    if (!form.confirmPassword)          errs.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    try {
      await signup({
        restaurant_name: form.restaurant_name.trim(),
        email:           form.email.trim(),
        phone_number:    form.phone_number.trim(),
        password:        form.password,
        same_for_branch: form.same_for_branch,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    }
  };

  // ── Success screen ───────────────────────────────────────────
  if (success) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8f9fa' }}>
          <BrandingPanel />
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#ffffff', p: 4 }}>
            <Box sx={{ textAlign: 'center', maxWidth: 360 }}>
              <CheckCircle sx={{ fontSize: 72, color: '#22C55E', mb: 3 }} />
              <Typography
                sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.5rem', color: '#191c1d', mb: 1 }}
              >
                Account Created!
              </Typography>
              <Typography sx={{ color: '#5b403d', fontWeight: 500, mb: 3 }}>
                Your ZODU account is ready. Redirecting you to login…
              </Typography>
              <CircularProgress size={24} sx={{ color: 'primary.main' }} />
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@700;800&display=swap');`}</style>

      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8f9fa' }}>
        <BrandingPanel />

        {/* ── Right: form panel ── */}
        <Box
          sx={{
            flex:          1,
            display:       'flex',
            flexDirection: 'column',
            bgcolor:       '#ffffff',
            position:      'relative',
            overflowY:     'auto',
          }}
        >
          {/* ── Logo — top right ── */}
          <Box
            sx={{
              position:   'absolute',
              top:        { xs: 20, sm: 28 },
              right:      { xs: 24, sm: 36 },
              zIndex:     10,
              flexShrink: 0,
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

          {/* ── Scrollable form area ── */}
          <Box
            sx={{
              flex:           1,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              px:             { xs: 3, sm: 6, lg: 10 },
              pt:             { xs: 10, sm: 8 },
              pb:             { xs: 4, sm: 6 },
            }}
          >
            <Box sx={{ width: '100%', maxWidth: 440 }}>
              {/* Heading */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography
                  sx={{
                    fontFamily:    "'Plus Jakarta Sans', sans-serif",
                    fontSize:      '1.875rem',
                    fontWeight:    800,
                    color:         '#191c1d',
                    mb:            1,
                  }}
                >
                  Create Account
                </Typography>
                <Typography sx={{ color: '#5b403d', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Join 5,000+ restaurants and retailers on ZODU.
                </Typography>
              </Box>

              {/* Error */}
              {error && (
                <Alert severity="error" onClose={() => setError('')}
                  sx={{ mb: 3, borderRadius: 2, fontSize: '0.85rem', fontWeight: 600 }}
                >
                  {error}
                </Alert>
              )}

              {/* Form */}
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={2.5}>

                  {/* Restaurant name */}
                  <Box>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#5b403d', mb: 0.75, ml: 0.5 }}>
                      Restaurant Name
                    </Typography>
                    <TextField
                      fullWidth placeholder="e.g. Spice Garden"
                      value={form.restaurant_name}
                      onChange={e => setField('restaurant_name', e.target.value)}
                      error={!!fieldErrors.restaurant_name} helperText={fieldErrors.restaurant_name}
                      disabled={isPending}
                      InputProps={{ startAdornment: <InputAdornment position="start"><StorefrontOutlined sx={{ fontSize: 18, color: fieldErrors.restaurant_name ? 'error.main' : '#8f6f6c' }} /></InputAdornment> }}
                    />
                  </Box>

                  {/* Email */}
                  <Box>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#5b403d', mb: 0.75, ml: 0.5 }}>
                      Email Address
                    </Typography>
                    <TextField
                      fullWidth type="email" placeholder="manager@restaurant.com"
                      value={form.email}
                      onChange={e => setField('email', e.target.value)}
                      error={!!fieldErrors.email} helperText={fieldErrors.email}
                      disabled={isPending}
                      InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlined sx={{ fontSize: 18, color: fieldErrors.email ? 'error.main' : '#8f6f6c' }} /></InputAdornment> }}
                    />
                  </Box>

                  {/* Phone */}
                  <Box>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#5b403d', mb: 0.75, ml: 0.5 }}>
                      Mobile Number
                    </Typography>
                    <TextField
                      fullWidth type="tel" placeholder="9876543210"
                      value={form.phone_number}
                      onChange={e => setField('phone_number', e.target.value.replace(/\D/g, '').slice(0, 10))}
                      error={!!fieldErrors.phone_number} helperText={fieldErrors.phone_number}
                      disabled={isPending}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <PhoneOutlined sx={{ fontSize: 16, color: '#8f6f6c' }} />
                              <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#5b403d', mr: 0.5 }}>+91</Typography>
                            </Box>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  {/* Password */}
                  <Box>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#5b403d', mb: 0.75, ml: 0.5 }}>
                      Create Password
                    </Typography>
                    <TextField
                      fullWidth type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={e => setField('password', e.target.value)}
                      error={!!fieldErrors.password} helperText={fieldErrors.password}
                      disabled={isPending}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><LockOutlined sx={{ fontSize: 18, color: fieldErrors.password ? 'error.main' : '#8f6f6c' }} /></InputAdornment>,
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setShowPassword(p => !p)} edge="end" tabIndex={-1}>
                              {showPassword ? <VisibilityOff sx={{ fontSize: 18, color: '#8f6f6c' }} /> : <Visibility sx={{ fontSize: 18, color: '#8f6f6c' }} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    {form.password && (
                      <Box sx={{ mt: 1, px: 0.5 }}>
                        <LinearProgress
                          variant="determinate"
                          value={(pwStrength.score / 4) * 100}
                          sx={{
                            height: 5, borderRadius: 3, bgcolor: '#edeeef',
                            '& .MuiLinearProgress-bar': { bgcolor: pwStrength.color, borderRadius: 3, transition: 'width 0.4s ease' },
                          }}
                        />
                        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: pwStrength.color, mt: 0.5 }}>
                          {pwStrength.label}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Confirm password */}
                  <Box>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#5b403d', mb: 0.75, ml: 0.5 }}>
                      Confirm Password
                    </Typography>
                    <TextField
                      fullWidth type={showConfirmPassword ? 'text' : 'password'} placeholder="Re-enter your password"
                      value={form.confirmPassword}
                      onChange={e => setField('confirmPassword', e.target.value)}
                      error={!!fieldErrors.confirmPassword} helperText={fieldErrors.confirmPassword}
                      disabled={isPending}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><LockOutlined sx={{ fontSize: 18, color: fieldErrors.confirmPassword ? 'error.main' : '#8f6f6c' }} /></InputAdornment>,
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setShowConfirmPw(p => !p)} edge="end" tabIndex={-1}>
                              {showConfirmPassword ? <VisibilityOff sx={{ fontSize: 18, color: '#8f6f6c' }} /> : <Visibility sx={{ fontSize: 18, color: '#8f6f6c' }} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    {form.confirmPassword && form.password && (
                      <Typography
                        sx={{
                          fontSize:  '0.72rem', fontWeight: 700, mt: 0.5, px: 0.5,
                          color:     form.password === form.confirmPassword ? '#22C55E' : '#EF4444',
                        }}
                      >
                        {form.password === form.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                      </Typography>
                    )}
                  </Box>

                  {/* Same for branch */}
                  <FormControlLabel
                    sx={{ ml: 0 }}
                    control={
                      <Checkbox
                        checked={form.same_for_branch}
                        onChange={e => setForm(p => ({ ...p, same_for_branch: e.target.checked }))}
                        disabled={isPending}
                        size="small"
                        sx={{
                          color: '#9AA9BF',
                          '&.Mui-checked': { color: '#af101a' },
                          p: 0,
                          mr: 1,
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, color: '#5b403d' }}>
                        Same for branch
                      </Typography>
                    }
                  />

                  {/* Submit */}
                  <Button
                    type="submit" fullWidth variant="contained" disabled={isPending}
                    endIcon={!isPending && <HowToRegIcon sx={{ fontSize: 20 }} />}
                    sx={{
                      py:         1.75,
                      mt:         0.5,
                      background: 'linear-gradient(135deg, #af101a 0%, #d32f2f 100%)',
                      boxShadow:  '0 8px 24px rgba(175,16,26,0.3)',
                      fontSize:   '1rem',
                      '&:hover':  { background: 'linear-gradient(135deg, #930010 0%, #af101a 100%)', boxShadow: '0 12px 28px rgba(175,16,26,0.4)', transform: 'scale(1.015)' },
                      '&:active':       { transform: 'scale(0.985)' },
                      '&.Mui-disabled': { bgcolor: '#e4beba', boxShadow: 'none' },
                      transition:       'all 0.2s ease',
                    }}
                  >
                    {isPending ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Create Account'}
                  </Button>
                </Stack>

                {/* Login link */}
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Typography sx={{ color: '#5b403d', fontSize: '0.9rem' }}>
                    Already have an account?{' '}
                    <Link
                      component={RouterLink} to="/login"
                      sx={{ fontWeight: 700, color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    >
                      Login here
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
              flexShrink:     0,
            }}
          >
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#191c1d', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              zodu
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
              {['Privacy Policy', 'Terms of Service', 'Help Center', 'Contact'].map(item => (
                <Link
                  key={item} href="#" underline="hover"
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

export default ZoduSignupPage;