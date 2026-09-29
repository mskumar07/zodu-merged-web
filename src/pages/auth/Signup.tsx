
import React, { useState } from 'react';
import {
  Box, TextField, Button, Typography, Link,
  Alert, CircularProgress, InputAdornment, IconButton, LinearProgress,
  Checkbox, FormControlLabel, Select, MenuItem, FormControl,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Visibility, VisibilityOff,
  StorefrontOutlined, EmailOutlined, PhoneOutlined, LockOutlined,
  CheckCircle, HowToReg as HowToRegIcon,
  Storefront as StoreIcon,
  RestaurantMenu as RestaurantMenuIcon,
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useSignupMutation } from './authApi';
import { setPendingSignup } from '@utils/pendingSignup';
import AuthLayout from './AuthLayout';

// Field sizing scales with the viewport height so the whole form fits one screen.
const INPUT_PY = 'clamp(7px, 1.15vh, 12px)';
const labelSx = { fontSize: '0.8rem', fontWeight: 600, color: '#5b403d', mb: 0.5, ml: 0.5 } as const;

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
            '& input': { padding: `${INPUT_PY} 14px` },
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
    business_type:   'Retail' as 'Retail' | 'Restaurant',
  });
  const [showPassword,        setShowPassword]  = useState(false);
  const [showConfirmPassword, setShowConfirmPw] = useState(false);
  const [error,               setError]         = useState('');
  const [success,             setSuccess]       = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof typeof form, string>>>({});

  const pwStrength = getPasswordStrength(form.password);

  function setField(key: keyof typeof form, value: string) {
    setForm(p => ({ ...p, [key]: value }));
    if (key === 'password') {
      if (!value) {
        setFieldErrors(p => ({ ...p, password: 'Password is required' }));
      } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,30}$/.test(value)) {
        setFieldErrors(p => ({ ...p, password: 'Password must be 8–30 characters and include uppercase, lowercase, a number, and a special character' }));
      } else {
        setFieldErrors(p => ({ ...p, password: undefined }));
      }
    } else if (fieldErrors[key]) {
      setFieldErrors(p => ({ ...p, [key]: undefined }));
    }
  }

  function validate(): boolean {
    const errs: typeof fieldErrors = {};
    if (!form.restaurant_name.trim())   errs.restaurant_name = 'Restaurant name is required';
    if (!form.email.trim())             errs.email           = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.phone_number.trim())      errs.phone_number    = 'Mobile number is required';
    else if (!/^[0-9]{10}$/.test(form.phone_number.replace(/\s/g, ''))) errs.phone_number = 'Enter a valid 10-digit mobile number';
    if (!form.password)                 errs.password = 'Password is required';
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,30}$/.test(form.password))
      errs.password = 'Password must be 8–30 characters and include uppercase, lowercase, a number, and a special character';
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
        business_type:   form.business_type,
      });
      // Signup only collects name/email/phone — the fuller business profile
      // (address, GST, bank) still needs to be filled in. Flag it so the
      // first login after this lands on Settings with that form pre-filled
      // and open, instead of the normal dashboard/branch-picker route.
      setPendingSignup({
        email:           form.email.trim(),
        restaurant_name: form.restaurant_name.trim(),
        phone_number:    form.phone_number.trim(),
        business_type:   form.business_type,
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
        <AuthLayout cardMaxWidth={500}>
          <Box>
            <Box sx={{ textAlign: 'center', py: 2 }}>
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
        </AuthLayout>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@700;800&display=swap');`}</style>

      <AuthLayout cardMaxWidth={500}>
            <Box sx={{ width: '100%' }}>
              {/* Heading */}
              <Box sx={{ mb: 'clamp(10px, 1.8vh, 20px)' }}>
                <Typography
                  sx={{
                    fontFamily:    "'Plus Jakarta Sans', sans-serif",
                    fontSize:      'clamp(1.4rem, 3.2vh, 1.75rem)',
                    fontWeight:    800,
                    color:         '#191c1d',
                    lineHeight:    1.2,
                    mb:            0.5,
                  }}
                >
                  Create Account
                </Typography>
                <Typography sx={{ color: '#5b403d', fontSize: '0.88rem', lineHeight: 1.5 }}>
                  Simplify Your Restaurant & Retail Business with ZODU
                </Typography>
              </Box>

              {/* Error */}
              {error && (
                <Alert severity="error" onClose={() => setError('')}
                  sx={{ mb: 1.5, py: 0, borderRadius: 2, fontSize: '0.82rem', fontWeight: 600 }}
                >
                  {error}
                </Alert>
              )}

              {/* Form — single column; spacing scales with the viewport height to fit one screen */}
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    rowGap: 'clamp(8px, 1.4vh, 14px)',
                  }}
                >
                  {/* Business type */}
                  <Box>
                    <Typography sx={labelSx}>Business Type</Typography>
                    <FormControl fullWidth disabled={isPending}>
                      <Select
                        value={form.business_type}
                        onChange={e => setForm(p => ({ ...p, business_type: e.target.value as 'Retail' | 'Restaurant' }))}
                        renderValue={selected => {
                          const isRetail = selected === 'Retail';
                          return (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                              {isRetail
                                ? <StoreIcon sx={{ fontSize: 18, color: '#af101a' }} />
                                : <RestaurantMenuIcon sx={{ fontSize: 18, color: '#af101a' }} />}
                              <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: '#191c1d' }}>
                                {selected}
                              </Typography>
                            </Box>
                          );
                        }}
                        sx={{
                          borderRadius: '8px',
                          bgcolor: '#f3f4f5',
                          '& .MuiOutlinedInput-notchedOutline': { border: '1px solid #d1d5db' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#af101a', borderWidth: '1px' },
                          '& .MuiSelect-select': { py: INPUT_PY, px: '14px' },
                        }}
                      >
                        {([
                          { key: 'Retail',     label: 'Retail',     icon: <StoreIcon sx={{ fontSize: 20 }} /> },
                          { key: 'Restaurant', label: 'Restaurant', icon: <RestaurantMenuIcon sx={{ fontSize: 20 }} /> },
                        ] as const).map(({ key, label, icon }) => (
                          <MenuItem key={key} value={key}
                            sx={{
                              display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25,
                              '&.Mui-selected': { bgcolor: '#fef2f2', color: '#af101a' },
                              '&.Mui-selected:hover': { bgcolor: '#fde8e8' },
                              '& svg': { color: form.business_type === key ? '#af101a' : '#6b7280' },
                            }}
                          >
                            {icon}
                            <Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>{label}</Typography>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Company name */}
                  <Box>
                    <Typography sx={labelSx}>Company Name</Typography>
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
                    <Typography sx={labelSx}>Email Address</Typography>
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
                    <Typography sx={labelSx}>Mobile Number</Typography>
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
                    <Typography sx={labelSx}>Create Password</Typography>
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
                      <Box sx={{ mt: 0.6, px: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={(pwStrength.score / 4) * 100}
                          sx={{
                            flex: 1, height: 4, borderRadius: 3, bgcolor: '#edeeef',
                            '& .MuiLinearProgress-bar': { bgcolor: pwStrength.color, borderRadius: 3, transition: 'width 0.4s ease' },
                          }}
                        />
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: pwStrength.color, lineHeight: 1 }}>
                          {pwStrength.label}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Confirm password */}
                  <Box>
                    <Typography sx={labelSx}>Confirm Password</Typography>
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
                          fontSize:  '0.7rem', fontWeight: 700, mt: 0.5, px: 0.5, lineHeight: 1.2,
                          color:     form.password === form.confirmPassword ? '#22C55E' : '#EF4444',
                        }}
                      >
                        {form.password === form.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Same for branch */}
                <FormControlLabel
                  sx={{ ml: 0, mt: 'clamp(10px, 1.8vh, 16px)' }}
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
                    py:         'clamp(9px, 1.5vh, 13px)',
                    mt:         'clamp(10px, 1.8vh, 16px)',
                    background: 'linear-gradient(135deg, #af101a 0%, #d32f2f 100%)',
                    boxShadow:  '0 8px 24px rgba(175,16,26,0.3)',
                    fontSize:   '0.98rem',
                    '&:hover':  { background: 'linear-gradient(135deg, #930010 0%, #af101a 100%)', boxShadow: '0 12px 28px rgba(175,16,26,0.4)', transform: 'scale(1.015)' },
                    '&:active':       { transform: 'scale(0.985)' },
                    '&.Mui-disabled': { bgcolor: '#e4beba', boxShadow: 'none' },
                    transition:       'all 0.2s ease',
                  }}
                >
                  {isPending ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Create Account'}
                </Button>

                {/* Login link */}
                <Box sx={{ mt: 'clamp(10px, 1.8vh, 18px)', textAlign: 'center' }}>
                  <Typography sx={{ color: '#5b403d', fontSize: '0.88rem' }}>
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
      </AuthLayout>
    </ThemeProvider>
  );
};

export default ZoduSignupPage;