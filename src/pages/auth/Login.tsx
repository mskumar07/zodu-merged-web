
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
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Visibility, VisibilityOff,
  EmailOutlined, LockOutlined,
  Login as LoginIcon,
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useLoginMutation, type LoginResponse } from './Authapi';
import { useAppDispatch, useAppSelector } from '@store/store';
import { IsAuthenticated, addUserData, setAuthData, setRoleAccess } from '@store/slices/userSlice';
import { loadBranchSession } from './loadBranchSession';
import { notifyIfBranchExpired } from '@utils/subscriptionGuard';
import { consumePendingSignup } from '@utils/pendingSignup';
import AuthLayout from './AuthLayout';

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

// ─── Login Page ───────────────────────────────────────────────
const ZoduLoginPage: React.FC = () => {
  const navigate        = useNavigate();
  const dispatch        = useAppDispatch();
  const isAuthenticated = useAppSelector(IsAuthenticated);
  const { mutateAsync: login, isPending } = useLoginMutation();
  const [identity,     setIdentity]     = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState('');
  const [fieldErrors,  setFieldErrors]  = useState<{ identity?: string; password?: string }>({});

  // If already authenticated (e.g. user visits /login while logged in), send to dashboard.
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          console.log("login detail",data)
      if (!data?.user || !data?.access_token || !data?.refresh_token)
        throw new Error('Invalid login response');
      console.log("login response",data)
      const companies = data.companies ?? [];

      dispatch(
        setAuthData({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          profile: data.user,
          company: data.company ?? null,
          companies,
        })
      );

      // Permissions AND settings are scoped per zodu_id + branch_id and fetched
      // separately from login, once a branch is actually resolved (auto-picked
      // here, or chosen on the /select-branch screen). Both fast paths below
      // must load the settings too — POS and every invoice/quotation/proforma
      // template read printer size and layout out of Redux, and a null there
      // silently falls back to the thermal template.
      const loadSession = async (zoduId: string, branchId: string) => {
        const result = await loadBranchSession(dispatch, zoduId, branchId);
        if (!result.roleAccessOk) {
          // Unchanged from before: an unreachable permissions endpoint doesn't
          // stop the login. SessionReconciliationGate retries on mount.
          dispatch(setRoleAccess([]));
        }
      };

      // First login right after signup: the account exists but still only has
      // the bare name/email/phone collected on that form — no address, GST or
      // bank details yet. Send them to finish that on Settings instead of the
      // normal dashboard/branch-picker routes. One-shot: consuming clears the
      // flag, so every login after this one behaves normally.
      const pendingSignup = consumePendingSignup(data.user.email);
      if (pendingSignup) {
        // Select the business signup created (and its first branch) exactly as
        // the single-business path below does — without it nothing is active,
        // so the Topbar has no business name to show and no settings load.
        const email = pendingSignup.email.trim().toLowerCase();
        const name = pendingSignup.restaurant_name.trim().toLowerCase();
        const signupCompany =
          companies.find((c) => c.is_primary) ??
          companies.find((c) => c.email?.trim().toLowerCase() === email) ??
          companies.find((c) => c.restaurant_name?.trim().toLowerCase() === name) ??
          companies[0] ??
          null;
        const firstBranch = signupCompany?.branches?.[0];
        if (signupCompany) {
          dispatch(
            addUserData({
              zoduId: signupCompany.zodu_id,
              branchId: firstBranch?.branch_id ?? "",
              branchName: firstBranch?.branch_name ?? "",
              businessType: signupCompany.business_type ?? pendingSignup.business_type,
            })
          );
          if (firstBranch) await loadSession(signupCompany.zodu_id, firstBranch.branch_id);
        }
        navigate('/settings', { replace: true, state: { openEditBusiness: pendingSignup } });
        return;
      }

      // Employees are pinned to the branch returned on their user record —
      // skip the business/branch picker and go straight to the dashboard.
      const isEmployee = data.user.user_type?.toLowerCase() === 'employee';
      const employeeBranchId = data.user.branch_id || data.user.employee_branch;
      if (isEmployee && employeeBranchId) {
        const employeeCompany =
          companies.find((c) =>
            c.branches?.some((b) => b.branch_id === employeeBranchId)
          ) ?? companies[0] ?? null;
        const employeeBranch = employeeCompany?.branches?.find(
          (b) => b.branch_id === employeeBranchId
        );
        const employeeZoduId = employeeCompany?.zodu_id ?? data.user.zodu_id;

        dispatch(
          addUserData({
            zoduId: employeeZoduId,
            branchId: employeeBranchId,
            branchName: employeeBranch?.branch_name ?? employeeBranchId,
            businessType: employeeCompany?.business_type ?? "",
          })
        );
        await loadSession(employeeZoduId, employeeBranchId);
        navigate('/dashboard', { replace: true });
        notifyIfBranchExpired(employeeBranch);
        return;
      }

      const hasSingleCompany = companies.length === 1;
      const singleCompany = hasSingleCompany ? companies[0] : null;
      const singleCompanyBranches = singleCompany?.branches ?? [];
      const hasSingleBranch = singleCompanyBranches.length === 1;

      if (singleCompany && hasSingleBranch) {
        const onlyBranch = singleCompanyBranches[0];
        dispatch(
          addUserData({
            zoduId: singleCompany.zodu_id,
            branchId: onlyBranch.branch_id,
            branchName: onlyBranch.branch_name,
            businessType: singleCompany.business_type ?? "",
          })
        );
        await loadSession(singleCompany.zodu_id, onlyBranch.branch_id);
        navigate('/dashboard', { replace: true });
        notifyIfBranchExpired(onlyBranch);
        return;
      }

      navigate('/select-branch', { replace: true, state: { companies } });
    } catch {
      setError('Login failed. Please check your credentials and try again.');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@700;800&display=swap');`}</style>

      <AuthLayout cardMaxWidth={500}>
            <Box sx={{ width: '100%' }}>
              {/* Heading */}
              <Box sx={{ mb: 4 }}>
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
                <Box sx={{ mt: 3.5, textAlign: 'center' }}>
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
      </AuthLayout>
    </ThemeProvider>
  );
};

export default ZoduLoginPage;