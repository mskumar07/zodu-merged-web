import React, { useLayoutEffect, useRef, useState } from 'react';
import { Box, Link, Typography } from '@mui/material';
import zlogo from '@assets/zlogo.png';

const RED = '#af101a';
const INK = '#191c1d';
const MUTED = '#6b6f76';
const HEADING_FONT = "'Plus Jakarta Sans', sans-serif";

// ─── Billing illustration (drawn in code) ─────────────────────
const TILE_SHADES = [
  ['#f6c9cc', '#f8d3d5', '#f6c9cc', '#e7777e'],
  ['#f8d3d5', '#f6c9cc', '#e7777e', '#f8d3d5'],
  ['#ec9aa0', '#ec9aa0', '#fbe3e4', '#fbe3e4'],
];

const BillingIllustration: React.FC = () => (
  <Box
    component="svg"
    viewBox="0 0 440 380"
    aria-hidden="true"
    sx={{ width: '100%', height: 'auto', maxWidth: 460, maxHeight: '50vh', display: 'block' }}
  >
    <defs>
      <linearGradient id="authBlob" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fdf0f0" />
        <stop offset="1" stopColor="#fbe4e5" />
      </linearGradient>
      <filter id="authSoft" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6" />
      </filter>
    </defs>

    {/* soft blob */}
    <path
      d="M214 22c78-4 150 38 160 112 9 64-24 92-18 150 5 52-58 84-138 80-92-5-178-36-190-112-10-62 34-92 38-140 5-58 70-86 148-90z"
      fill="url(#authBlob)"
    />
    <ellipse cx="220" cy="332" rx="120" ry="10" fill="#f3c5c8" opacity=".45" filter="url(#authSoft)" />

    {/* sparks + dot */}
    <g stroke="#e5484d" strokeWidth="4" strokeLinecap="round">
      <path d="M362 40l3 22" />
      <path d="M392 62l-12 18" />
      <path d="M408 102l-20 8" />
    </g>
    <circle cx="352" cy="130" r="9" fill="#f3c5c8" />

    {/* dot grid */}
    <g fill="#e5484d" opacity=".75">
      {[0, 1, 2, 3].map(r =>
        [0, 1, 2, 3].map(c => <circle key={`${r}-${c}`} cx={24 + c * 18} cy={272 + r * 16} r="2.4" />)
      )}
    </g>

    {/* monitor */}
    <g transform="rotate(-4 200 170)">
      <path d="M186 268h40l8 30h-56z" fill="#ec8a90" />
      <rect x="150" y="296" width="112" height="12" rx="6" fill="#e5484d" />
      <rect x="64" y="84" width="276" height="188" rx="16" fill="#fff" stroke="#e5484d" strokeWidth="4" />
      {TILE_SHADES.map((row, r) =>
        row.map((fill, c) => (
          <rect key={`${r}-${c}`} x={92 + c * 60} y={112 + r * 48} width="38" height="26" rx="6" fill={fill} />
        ))
      )}
    </g>

    {/* receipt / document */}
    <rect x="300" y="200" width="70" height="122" rx="14" fill="#f3b5b9" stroke="#e5484d" strokeWidth="3" />
    <rect x="326" y="176" width="92" height="146" rx="14" fill="#fff" stroke="#e5484d" strokeWidth="4" />
    <g stroke="#e5484d" strokeWidth="4" strokeLinecap="round">
      <path d="M346 208h52" />
      <path d="M346 232h40" />
      <path d="M346 256h52" />
      <path d="M346 280h30" />
    </g>
  </Box>
);

// ─── Shared layout for Login / Signup ─────────────────────────
interface AuthLayoutProps {
  children: React.ReactNode;
  cardMaxWidth?: number;
}

// Below this the form gets too small to read; the page scrolls instead.
const MIN_SCALE = 0.7;

type Fit = { scale: number; height: number; scroll: boolean };

const Logo: React.FC<{ height?: object }> = ({ height }) => (
  <Box
    component="img"
    src={zlogo}
    alt="zodu"
    sx={{ display: 'block', height: height ?? { xs: 30, md: 'clamp(30px, 4.6vh, 44px)' }, width: 'auto' }}
  />
);

// Links + copyright strip — sits under the brand panel on desktop and under
// the form when the brand panel is hidden.
const FooterStrip: React.FC = () => (
  <>
    <Box sx={{ display: 'flex', gap: { xs: 1.75, sm: 2, lg: 3 }, flexWrap: 'wrap', justifyContent: 'center' }}>
      {['Privacy Policy', 'Terms of Service', 'Help Center', 'Contact'].map(item => (
        <Link
          key={item}
          href="#"
          underline="hover"
          sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' }, color: MUTED, whiteSpace: 'nowrap', '&:hover': { color: RED }, transition: 'color 0.15s' }}
        >
          {item}
        </Link>
      ))}
    </Box>
    <Typography sx={{ fontSize: { xs: '0.72rem', sm: '0.78rem' }, color: MUTED, whiteSpace: 'nowrap' }}>
      © {new Date().getFullYear()} ZODU. All rights reserved.
    </Typography>
  </>
);

// 50 / 50 split on desktop: brand panel on the left, form on the right, with a
// divider line between them. Phones and portrait tablets show the form only.
const AuthLayout: React.FC<AuthLayoutProps> = ({ children, cardMaxWidth = 500 }) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<Fit>({ scale: 1, height: 0, scroll: false });

  // Shrinks the card so the right half fits the viewport on any screen size.
  // The space is taken from the window height (not the main area's own size),
  // so switching to the scroll fallback can't feed back into the measurement.
  useLayoutEffect(() => {
    const measure = () => {
      const main = mainRef.current;
      const card = cardRef.current;
      if (!main || !card) return;
      const cs = getComputedStyle(main);
      const avail =
        window.innerHeight -
        (headerRef.current?.offsetHeight ?? 0) -
        (footerRef.current?.offsetHeight ?? 0) -
        parseFloat(cs.paddingTop) -
        parseFloat(cs.paddingBottom);
      const natural = card.offsetHeight; // transforms don't change offsetHeight
      if (!natural || avail <= 0) return;
      const raw = Math.min(1, avail / natural);
      const next: Fit = { scale: Math.max(MIN_SCALE, raw), height: natural, scroll: raw < MIN_SCALE };
      setFit(prev =>
        Math.abs(prev.scale - next.scale) < 0.002 && prev.height === next.height && prev.scroll === next.scroll
          ? prev
          : next
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    [headerRef, footerRef, cardRef].forEach(r => r.current && ro.observe(r.current));
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        height: fit.scroll ? 'auto' : '100dvh',
        overflow: fit.scroll ? 'visible' : 'hidden',
        display: 'flex',
        bgcolor: '#ffffff',
      }}
    >
      {/* ── Left half: brand panel ── */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          width: '50%',
          flexShrink: 0,
          minHeight: 0,
          borderRight: '1px solid #eceef2',
          background: 'radial-gradient(900px 520px at 20% 30%, #fdf1f1 0%, rgba(253,241,241,0) 70%), #fbfbfc',
          px: { md: 5, lg: 8, xl: 10 },
          py: 'clamp(16px, 4vh, 40px)',
        }}
      >
        <Box sx={{ flexShrink: 0 }}>
          <Logo />
        </Box>

        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 'clamp(12px, 3vh, 32px)' }}>
          <Box>
            <Typography
              component="h1"
              sx={{
                fontFamily: HEADING_FONT,
                fontSize: { md: 'clamp(2.2rem, min(7vh, 5vw), 3.6rem)', xl: 'clamp(2.6rem, min(7.4vh, 4.4vw), 4.4rem)' },
                fontWeight: 800, color: INK, lineHeight: 1.08, letterSpacing: '-0.03em', mb: 'clamp(10px, 2.4vh, 22px)',
              }}
            >
              <Box component="span" sx={{ display: 'block', whiteSpace: 'nowrap' }}>Fast &amp; Easy</Box>
              <Box component="span" sx={{ display: 'block', color: '#d0101c' }}>Billing</Box>
            </Typography>
            <Typography sx={{ fontSize: { md: '0.95rem', lg: '1.05rem' }, color: MUTED, lineHeight: 1.65, maxWidth: 420 }}>
              Command your business from any device with precision and ease.
              Experience the pulse of your finances in real-time.
            </Typography>
          </Box>

          <Box
            sx={{
              flex: '0 1 auto',
              minHeight: 0,
              display: 'flex',
              justifyContent: 'center',
              '& svg': { maxHeight: 'clamp(160px, 40vh, 380px)', width: 'auto', maxWidth: '100%' },
            }}
          >
            <BillingIllustration />
          </Box>
        </Box>

        {/* Footer strip — bottom of the brand panel */}
        <Box
          component="footer"
          sx={{
            flexShrink: 0,
            display: 'flex',
            flexDirection: { md: 'column', lg: 'row' },
            alignItems: { md: 'flex-start', lg: 'center' },
            justifyContent: 'space-between',
            gap: 1,
            pt: 'clamp(10px, 2vh, 18px)',
            borderTop: '1px solid #eceef2',
            '& > div': { justifyContent: { md: 'flex-start' } },
          }}
        >
          <FooterStrip />
        </Box>
      </Box>

      {/* ── Right half: form ── */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          bgcolor: '#ffffff',
        }}
      >
        {/* Logo — only when the left panel is hidden */}
        <Box ref={headerRef} sx={{ flexShrink: 0, display: { xs: 'block', md: 'none' }, px: { xs: 2.5, sm: 5 }, pt: 2 }}>
          <Logo height={{ xs: 28 }} />
        </Box>

        <Box
          ref={mainRef}
          sx={{
            flex: fit.scroll ? '1 0 auto' : 1,
            minHeight: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: { xs: 2, sm: 5, lg: 8 },
            py: { xs: 1.5, md: 'clamp(12px, 3vh, 32px)' },
          }}
        >
          {/* Form card — the slot takes the scaled height so nothing overlaps */}
          <Box
            sx={{
              width: '100%',
              maxWidth: cardMaxWidth,
              height: fit.height ? fit.height * fit.scale : 'auto',
            }}
          >
            <Box
              ref={cardRef}
              sx={{
                position: 'relative',
                width: '100%',
                transform: fit.scale < 1 ? `scale(${fit.scale})` : 'none',
                transformOrigin: 'top center',
                bgcolor: '#ffffff',
                borderRadius: 3,
                border: '1px solid #f0f0f2',
                boxShadow: '0 24px 60px -24px rgba(17,24,39,0.18)',
                px: { xs: 2.5, sm: 4.5 },
                py: { xs: 3, sm: 'clamp(16px, 3vh, 36px)' },
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: 112,
                  height: 4,
                  bgcolor: '#d0101c',
                },
              }}
            >
              {children}
            </Box>
          </Box>
        </Box>

        {/* Footer — under the form only when the brand panel is hidden */}
        <Box
          ref={footerRef}
          component="footer"
          sx={{
            display: { xs: 'flex', md: 'none' },
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.75,
            flexShrink: 0,
            borderTop: '1px solid #eceef2',
            px: 2,
            py: 1.5,
          }}
        >
          <FooterStrip />
        </Box>
      </Box>
    </Box>
  );
};

export default AuthLayout;
