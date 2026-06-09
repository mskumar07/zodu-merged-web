import React, { useState } from "react";
import {
  Box, Button, Container, Typography, Stack, Divider,
  Link, IconButton, Accordion, AccordionSummary, AccordionDetails,
  Avatar,
} from "@mui/material";
import { createTheme, ThemeProvider, alpha } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";

import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import GroupsIcon from "@mui/icons-material/Groups";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import StoreIcon from "@mui/icons-material/Store";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AddIcon from "@mui/icons-material/Add";
import StarIcon from "@mui/icons-material/Star";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import CloudIcon from "@mui/icons-material/Cloud";
import LockIcon from "@mui/icons-material/Lock";
import BusinessIcon from "@mui/icons-material/Business";
import VerifiedIcon from "@mui/icons-material/Verified";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SpeedIcon from "@mui/icons-material/Speed";
import StorefrontIcon from "@mui/icons-material/Storefront";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import LocalGroceryStoreIcon from "@mui/icons-material/LocalGroceryStore";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import SpaIcon from "@mui/icons-material/Spa";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import { useNavigate } from "react-router-dom";
import heroSection from "../../assets/hero-section.png";
import zlogo from "../../assets/zlogo.png";

// ── Design Tokens ─────────────────────────────────────────────────────────────
const PRIMARY       = "#d32f2f";
const PRIMARY_DARK  = "#b71c1c";
const PRIMARY_LIGHT = "#ffebee";
const DARK          = "#111827";
const GRAY          = "#6B7280";
const LIGHT         = "#F9FAFB";
const BORDER        = "#E5E7EB";

const theme = createTheme({
  palette: {
    primary: { main: PRIMARY },
    background: { default: "#ffffff" },
    text: { primary: DARK, secondary: GRAY },
  },
  typography: { fontFamily: "'Inter', sans-serif" },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontFamily: "'Inter', sans-serif", fontWeight: 600 },
      },
    },
  },
});

// ── Data ──────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: <ReceiptLongIcon sx={{ fontSize: 28, color: PRIMARY }} />,
    bg: "#fff0f0",
    title: "Bill Customers 10× Faster",
    tagline: "No more long queues. No more billing errors.",
    items: [
      "Create GST-compliant invoices in under 10 seconds",
      "Accept cash, card, UPI & all digital payment modes",
      "Apply discounts, offers & loyalty points instantly",
      "Print or WhatsApp bills directly from the app",
    ],
  },
  {
    icon: <Inventory2Icon sx={{ fontSize: 28, color: "#16a34a" }} />,
    bg: "#f0fdf4",
    title: "Never Run Out of Stock Again",
    tagline: "Know exactly what you have before you need it.",
    items: [
      "Real-time stock tracking across all your products",
      "Automatic low-stock alerts before you run out",
      "Manage batches, expiry dates & multiple units",
      "Purchase orders & supplier management built in",
    ],
  },
  {
    icon: <AnalyticsIcon sx={{ fontSize: 28, color: "#ea580c" }} />,
    bg: "#fff7ed",
    title: "Know Exactly Where Your Money Goes",
    tagline: "Stop guessing. Start making data-driven decisions.",
    items: [
      "Daily, weekly & monthly profit & loss reports",
      "See your top-selling and slow-moving products",
      "Track expenses by category and date range",
      "Export GST-ready reports to share with your CA",
    ],
  },
  {
    icon: <GroupsIcon sx={{ fontSize: 28, color: "#2563eb" }} />,
    bg: "#eff6ff",
    title: "Manage Your Team Without the Headache",
    tagline: "Save 5+ hours every week on staff management.",
    items: [
      "Track attendance automatically with login logs",
      "Process monthly payroll in under 10 minutes",
      "Set role-based access — staff see only what they need",
      "Monitor each employee's sales performance live",
    ],
  },
];

const steps = [
  {
    number: "01",
    icon: <StoreIcon sx={{ fontSize: 26, color: PRIMARY }} />,
    title: "Set Up Your Store in 30 Minutes",
    desc: "Add your products, set prices, and connect your receipt printer. Our onboarding team walks you through every step — no tech knowledge needed.",
    tags: ["Product Catalog", "Price Setup", "Printer Config", "Staff Accounts"],
  },
  {
    number: "02",
    icon: <SpeedIcon sx={{ fontSize: 26, color: "#16a34a" }} />,
    title: "Bill, Track & Manage From One Screen",
    desc: "Generate bills, track live inventory, manage staff, and handle expenses — all from a single dashboard that works on any phone, tablet, or computer.",
    tags: ["Instant Billing", "Live Inventory", "Staff Check-in", "Expense Logs"],
  },
  {
    number: "03",
    icon: <TrendingUpIcon sx={{ fontSize: 26, color: "#2563eb" }} />,
    title: "Grow Your Business With Confidence",
    desc: "Daily reports show what is working and what is not. Spot your best-sellers, cut dead stock, and make every decision backed by real numbers.",
    tags: ["Daily P&L", "Top Products", "Trend Analysis", "GST Reports"],
  },
];

const businessTypes = [
  { icon: StorefrontIcon,           title: "Retail Stores",       desc: "Clothing, footwear, electronics & general stores" },
  { icon: RestaurantIcon,           title: "Restaurants & Cafés", desc: "QSR, dine-in, cloud kitchens & food courts" },
  { icon: LocalGroceryStoreIcon,    title: "Supermarkets",        desc: "Daily needs, FMCG, fresh produce & kirana shops" },
  { icon: LocalPharmacyIcon,        title: "Pharmacies",          desc: "Medical shops, clinics & diagnostic centres" },
  { icon: SpaIcon,                  title: "Beauty & Wellness",   desc: "Salons, spas, fitness studios & wellness centres" },
  { icon: MiscellaneousServicesIcon,title: "Services & Others",   desc: "Coaching centres, print shops & service businesses" },
];

const plans = [
  {
    name: "Starter",
    tagline: "Perfect for new & small businesses",
    monthly: "₹999",
    yearly: "₹799",
    popular: false,
    cta: "Start Free Trial",
    items: [
      "Unlimited Billing & Invoicing",
      "Inventory Management",
      "Basic Sales Reports",
      "1 Branch",
      "2 Staff Logins",
      "Email & Chat Support",
    ],
  },
  {
    name: "Growth",
    tagline: "Best for growing businesses",
    monthly: "₹1,999",
    yearly: "₹1,599",
    popular: true,
    cta: "Start Free Trial",
    items: [
      "Everything in Starter",
      "Employee Attendance & Payroll",
      "Advanced Reports & Analytics",
      "Customer Loyalty Points",
      "Up to 5 Staff Logins",
      "Mobile App Access",
      "Priority Phone & Chat Support",
    ],
  },
  {
    name: "Enterprise",
    tagline: "For multi-branch businesses",
    monthly: "Custom",
    yearly: "Custom",
    popular: false,
    cta: "Talk to Sales",
    items: [
      "Everything in Growth",
      "Multi-Branch Management",
      "Unlimited Staff Logins",
      "API & Third-Party Integrations",
      "Dedicated Account Manager",
      "Custom Onboarding & Training",
    ],
  },
];

const testimonials = [
  {
    name: "Rajesh Kumar",
    role: "Restaurant Owner",
    location: "Chennai",
    outcome: "40% more customers served daily",
    text: "Before Zodu, billing during lunch rush was complete chaos. Now I serve 40% more customers in the same time. Each bill takes under 10 seconds — my staff loves it.",
  },
  {
    name: "Priya Sharma",
    role: "Supermarket Owner",
    location: "Bangalore",
    outcome: "Zero stockouts in 6 months",
    text: "I used to run out of stock twice a week without knowing. Zodu's inventory alerts have saved me from stockouts for 6 months straight. Customers trust me more now.",
  },
  {
    name: "Amit Verma",
    role: "Clothing Store Owner",
    location: "Mumbai",
    outcome: "Saves ₹8,000/month on CA fees",
    text: "Payroll used to take me half a day every month and I would always make mistakes. Now it's done in 10 minutes. I also saved on accountant fees — ₹8,000 per month!",
  },
  {
    name: "Neha Malhotra",
    role: "Pharmacy Owner",
    location: "Delhi",
    outcome: "CA billing reduced by 60%",
    text: "The GST reports are worth the entire subscription on their own. My CA bills me less because everything is perfectly organised and export-ready. Best investment I have made.",
  },
];

const faqs = [
  {
    q: "How quickly can I get started with Zodu?",
    a: "Most businesses are up and billing in under 30 minutes. Our onboarding team sets up your product catalogue, configures your printer, and trains your staff — all for free.",
  },
  {
    q: "Do I need any technical knowledge to use Zodu?",
    a: "Not at all. Zodu is designed for business owners, not techies. If you can use WhatsApp, you can use Zodu. We also provide free training videos and live support whenever you need help.",
  },
  {
    q: "Does Zodu support GST billing and compliance?",
    a: "Yes. Zodu generates fully GST-compliant invoices with automatic tax calculations. You can export GSTR-ready reports in formats your CA or accountant can use directly.",
  },
  {
    q: "Can I manage multiple branches from one account?",
    a: "Yes. Our Growth and Enterprise plans support multi-branch management. View combined reports, manage inventory across all locations, and control staff access from one dashboard.",
  },
  {
    q: "What happens to my data if I cancel?",
    a: "Your data belongs to you. You can export your complete data — sales history, customer details, inventory records — in Excel or PDF at any time, including when you cancel.",
  },
  {
    q: "Is there a free trial? Do I need a credit card to start?",
    a: "Yes! You get a full 14-day free trial with access to every feature. No credit card required. You only pay if you decide to continue after the trial ends.",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

const ZoduLandingPage: React.FC = () => {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const navigate = useNavigate();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={{ "*": { boxSizing: "border-box" } }} />
      <Box sx={{ height: "100vh", overflowY: "auto", overflowX: "hidden", bgcolor: "#fff", scrollBehavior: "smooth" }}>

        {/* ── NAV ─────────────────────────────────────────────────────────── */}
        <Box component="nav" sx={{
          position: "sticky", top: 0, zIndex: 1000,
          bgcolor: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${BORDER}`,
          px: { xs: 3, md: 6 }, py: 2,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          
            <Box sx={{ height: 40, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              <img src={zlogo} alt="Zodu Logo" style={{ height: "100%", width: "auto", objectFit: "contain" }} />
            </Box>

          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ display: { xs: "none", md: "flex" } }}>
            {["Features", "Solutions", "Pricing", "Resources", "Company"].map((item) => (
              <Button key={item}
                endIcon={["Solutions", "Resources", "Company"].includes(item) ? <KeyboardArrowDownIcon sx={{ fontSize: "16px !important" }} /> : undefined}
                sx={{ color: "#374151", fontWeight: 500, fontSize: "0.9rem", px: 1.5, py: 0.8, "&:hover": { bgcolor: LIGHT, color: DARK } }}>
                {item}
              </Button>
            ))}
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button onClick={() => navigate("/login")} sx={{ color: "#374151", fontWeight: 600, fontSize: "0.9rem", px: 2 }}>
              Login
            </Button>
            <Button variant="contained" onClick={() => navigate("/signup")} sx={{
              bgcolor: PRIMARY, color: "#fff", px: 2.5, py: 0.9, borderRadius: "8px",
              fontSize: "0.88rem", fontWeight: 700,
              "&:hover": { bgcolor: PRIMARY_DARK },
            }}>
              Start Free Trial
            </Button>
          </Stack>
        </Box>

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <Box sx={{
          overflow: "hidden", position: "relative",
          backgroundImage: `url(${heroSection})`,
          backgroundSize: "contain",
          backgroundPosition: "right center",
          backgroundRepeat: "no-repeat",
        }}>
          {/* gradient overlay — opaque white on left so text stays readable */}
          <Box sx={{
            position: "absolute", inset: 0, zIndex: 0,
            background: "linear-gradient(to right, rgba(255,255,255,1) 48%, rgba(255,255,255,0.15) 100%)",
          }} />
          <Container maxWidth="lg" sx={{ px: { xs: 3, md: 6 }, position: "relative", zIndex: 1 }}>
            <Box sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              gap: { xs: 4, md: 2 },
              pt: { xs: 6, md: 5 },
              minHeight: { md: 380 },
            }}>
              {/* Left */}
              <Box sx={{ flex: "0 0 auto", maxWidth: { xs: "100%", md: 530 }, pt: { xs: 0, md: 3 } }}>

                {/* Trust badge */}
                <Box sx={{
                  display: "inline-flex", alignItems: "center", gap: 0.7,
                  bgcolor: PRIMARY_LIGHT, color: PRIMARY,
                  px: 1.6, py: 0.6, borderRadius: "999px",
                  fontSize: "0.78rem", fontWeight: 700, mb: 2.5,
                  border: `1px solid ${alpha(PRIMARY, 0.2)}`,
                }}>
                  <VerifiedIcon sx={{ fontSize: 13 }} />
                  Trusted by 10,000+ Businesses Across India
                </Box>

                <Typography sx={{
                  fontSize: { xs: "2.3rem", md: "3.4rem" },
                  fontWeight: 800, color: DARK,
                  lineHeight: 1.12, letterSpacing: "-0.03em", mb: 2,
                }}>
                  Smart Billing &amp;<br />
                  <Box component="span" sx={{ color: PRIMARY }}>Business Management</Box>
                </Typography>

                <Typography sx={{ fontSize: "1.05rem", color: GRAY, lineHeight: 1.75, mb: 2.5, maxWidth: 460 }}>
                  All-in-one POS solution to bill, manage, analyse and grow your business effortlessly. No tech skills required.
                </Typography>

                {/* Feature bullets */}
                <Stack direction="row" flexWrap="wrap" gap={2.5} mb={3.5}>
                  {["Billing", "Inventory", "Manage", "Grow"].map((f) => (
                    <Box key={f} sx={{ display: "flex", alignItems: "center", gap: 0.8, color: "#374151", fontWeight: 500, fontSize: "0.92rem" }}>
                      <Box component="span" sx={{ width: 8, height: 8, bgcolor: PRIMARY, borderRadius: "50%", flexShrink: 0, display: "inline-block" }} />
                      {f}
                    </Box>
                  ))}
                </Stack>

                {/* CTAs */}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3.5}>
                  <Button variant="contained" size="large" endIcon={<ArrowForwardIcon />} onClick={() => navigate("/signup")} sx={{
                    bgcolor: PRIMARY, color: "#fff", px: 3.5, py: 1.3, borderRadius: "10px",
                    fontSize: "0.95rem", fontWeight: 700,
                    boxShadow: `0 6px 20px ${alpha(PRIMARY, 0.4)}`,
                    "&:hover": { bgcolor: PRIMARY_DARK, boxShadow: `0 8px 28px ${alpha(PRIMARY, 0.5)}` },
                  }}>
                    Start Free Trial
                  </Button>
                  <Button variant="outlined" size="large" sx={{
                    borderColor: BORDER, color: DARK, px: 3.5, py: 1.3,
                    borderRadius: "10px", fontSize: "0.95rem", fontWeight: 600,
                    "&:hover": { borderColor: PRIMARY, color: PRIMARY, bgcolor: "transparent" },
                  }}>
                    Book a Demo
                  </Button>
                </Stack>

                {/* Social proof */}
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Stack direction="row">
                    {[1, 2, 3, 4].map((i) => (
                      <Avatar key={i} sx={{
                        width: 32, height: 32, ml: i === 1 ? 0 : -1,
                        border: "2px solid #fff",
                        bgcolor: ["#fbbf24", "#34d399", "#60a5fa", "#f472b6"][i - 1],
                        fontSize: "0.68rem", fontWeight: 700,
                      }}>
                        {["R", "P", "A", "N"][i - 1]}
                      </Avatar>
                    ))}
                  </Stack>
                  <Box>
                    <Stack direction="row" spacing={0.2} alignItems="center">
                      {[1, 2, 3, 4, 5].map((i) => <StarIcon key={i} sx={{ fontSize: 14, color: "#fbbf24" }} />)}
                      <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: DARK, ml: 0.5 }}>4.9/5</Typography>
                    </Stack>
                    <Typography sx={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                      500+ reviews · Supported 100+ Businesses Worldwide
                    </Typography>
                  </Box>
                </Stack>
              </Box>

            </Box>

            {/* Trust badges */}
            <Box sx={{
              display: "flex", flexWrap: "wrap", justifyContent: "center",
              gap: { xs: 3, md: 6 },
              borderTop: `1px solid ${BORDER}`,
              py: 3,
            }}>
              {[
                { icon: <CloudIcon sx={{ fontSize: 20, color: PRIMARY }} />, label: "Cloud-Based",         sub: "Access from anywhere, anytime" },
                { icon: <LockIcon sx={{ fontSize: 20, color: PRIMARY }} />,  label: "Bank-Level Security", sub: "Your data, fully protected"    },
                { icon: <BusinessIcon sx={{ fontSize: 20, color: PRIMARY }} />, label: "Multi-Branch Ready", sub: "Manage all stores in one place" },
                { icon: <VerifiedIcon sx={{ fontSize: 20, color: PRIMARY }} />, label: "10,000+ Businesses", sub: "Trust Zodu every single day"   },
              ].map((b) => (
                <Stack key={b.label} direction="row" alignItems="center" spacing={1.2}>
                  <Box sx={{ width: 38, height: 38, bgcolor: alpha(PRIMARY, 0.08), borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {b.icon}
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: DARK }}>{b.label}</Typography>
                    <Typography sx={{ fontSize: "0.72rem", color: "#94a3b8" }}>{b.sub}</Typography>
                  </Box>
                </Stack>
              ))}
            </Box>
          </Container>
        </Box>

        {/* ── STATS BAR ────────────────────────────────────────────────────── */}
        <Box sx={{ bgcolor: DARK, py: { xs: 5, md: 5 }, px: { xs: 3, md: 6 } }}>
          <Container maxWidth="lg">
            <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: { xs: 5, md: 0 } }}>
              {[
                { value: "1 lakh",  label: "Active Businesses"  },
                { value: "₹500 Cr+", label: "Bills Generated"    },
                { value: "4.9 / 5",  label: "Average Rating"     },
                { value: "30 Min",   label: "Average Setup Time" },
              ].map((stat, i) => (
                <Box key={stat.value} sx={{
                  flex: { md: 1 }, textAlign: "center", px: { md: 3 },
                  borderRight: { md: i < 3 ? `1px solid rgba(255,255,255,0.08)` : "none" },
                }}>
                  <Typography sx={{ fontSize: { xs: "2rem", md: "2.4rem" }, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em" }}>
                    {stat.value}
                  </Typography>
                  <Typography sx={{ fontSize: "0.82rem", color: "#6B7280", fontWeight: 500, mt: 0.3 }}>{stat.label}</Typography>
                </Box>
              ))}
            </Box>
          </Container>
        </Box>

        {/* ── FEATURES ─────────────────────────────────────────────────────── */}
        <Box sx={{ bgcolor: LIGHT, py: { xs: 8, md: 14 }, px: { xs: 3, md: 6 } }}>
          <Container maxWidth="lg">
            <Box textAlign="center" mb={{ xs: 6, md: 10 }}>
              <Typography sx={{ color: PRIMARY, fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.18em", textTransform: "uppercase", mb: 1.5 }}>
                WHAT ZODU DOES FOR YOU
              </Typography>
              <Typography sx={{ fontSize: { xs: "1.9rem", md: "2.8rem" }, fontWeight: 800, color: DARK, letterSpacing: "-0.025em", mb: 2 }}>
                Stop Working Harder.<br />Start Working Smarter.
              </Typography>
              <Typography sx={{ fontSize: "1.05rem", color: GRAY, maxWidth: 540, mx: "auto", lineHeight: 1.75 }}>
                Every feature in Zodu is built around one goal — save you time, eliminate errors, and help your business grow faster.
              </Typography>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 3 }}>
              {features.map((f) => (
                <Box key={f.title} sx={{
                  bgcolor: "#fff", border: `1px solid ${BORDER}`, borderRadius: "20px",
                  p: { xs: 3.5, md: 4 }, transition: "all 0.2s",
                  "&:hover": { boxShadow: "0 12px 40px rgba(0,0,0,0.07)", transform: "translateY(-3px)", borderColor: alpha(PRIMARY, 0.25) },
                }}>
                  <Box sx={{ width: 56, height: 56, bgcolor: f.bg, borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", mb: 2.5 }}>
                    {f.icon}
                  </Box>
                  <Typography sx={{ fontWeight: 800, fontSize: "1.15rem", color: DARK, mb: 0.5 }}>{f.title}</Typography>
                  <Typography sx={{ fontSize: "0.87rem", color: PRIMARY, fontWeight: 600, mb: 2.5 }}>{f.tagline}</Typography>
                  <Stack spacing={1.3}>
                    {f.items.map((item) => (
                      <Box key={item} sx={{ display: "flex", alignItems: "flex-start", gap: 1.2 }}>
                        <CheckCircleIcon sx={{ fontSize: 16, color: "#16a34a", flexShrink: 0, mt: "2px" }} />
                        <Typography sx={{ fontSize: "0.88rem", color: "#374151", lineHeight: 1.6 }}>{item}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              ))}
            </Box>
          </Container>
        </Box>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
        <Box sx={{ bgcolor: "#fff", py: { xs: 8, md: 14 }, px: { xs: 3, md: 6 } }}>
          <Container maxWidth="lg">
            <Box textAlign="center" mb={{ xs: 6, md: 10 }}>
              <Typography sx={{ color: PRIMARY, fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.18em", textTransform: "uppercase", mb: 1.5 }}>
                HOW IT WORKS
              </Typography>
              <Typography sx={{ fontSize: { xs: "1.9rem", md: "2.8rem" }, fontWeight: 800, color: DARK, letterSpacing: "-0.025em", mb: 2 }}>
                Up and Running in 3 Simple Steps
              </Typography>
              <Typography sx={{ fontSize: "1.05rem", color: GRAY, maxWidth: 480, mx: "auto", lineHeight: 1.75 }}>
                No complicated setup. No tech team needed. Just sign up and start billing in minutes.
              </Typography>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: { xs: 5, md: 4 } }}>
              {steps.map((step, i) => (
                <Box key={step.number} sx={{ position: "relative" }}>
                  {i < steps.length - 1 && (
                    <Box sx={{
                      display: { xs: "none", md: "block" },
                      position: "absolute", top: 27, left: "calc(50% + 40px)",
                      width: "calc(100% - 0px)", height: "1px",
                      background: `linear-gradient(90deg, ${BORDER} 60%, transparent 100%)`,
                      zIndex: 0,
                    }} />
                  )}
                  <Box sx={{ position: "relative", zIndex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
                      <Box sx={{
                        width: 54, height: 54, bgcolor: PRIMARY_LIGHT,
                        borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                        border: `2px solid ${alpha(PRIMARY, 0.15)}`,
                        flexShrink: 0,
                      }}>
                        {step.icon}
                      </Box>
                      <Typography sx={{ fontSize: "2.8rem", fontWeight: 900, color: BORDER, letterSpacing: "-0.06em", lineHeight: 1 }}>
                        {step.number}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 800, fontSize: "1.08rem", color: DARK, mb: 1.5, lineHeight: 1.35 }}>{step.title}</Typography>
                    <Typography sx={{ fontSize: "0.9rem", color: GRAY, lineHeight: 1.75, mb: 2.5 }}>{step.desc}</Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {step.tags.map((tag) => (
                        <Box key={tag} sx={{
                          bgcolor: LIGHT, color: "#374151",
                          px: 1.5, py: 0.5, borderRadius: "6px",
                          fontSize: "0.75rem", fontWeight: 600,
                          border: `1px solid ${BORDER}`,
                        }}>
                          {tag}
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </Box>
              ))}
            </Box>

            <Box textAlign="center" mt={{ xs: 6, md: 9 }}>
              <Button variant="contained" size="large" endIcon={<ArrowForwardIcon />} onClick={() => navigate("/signup")} sx={{
                bgcolor: PRIMARY, color: "#fff", px: 4.5, py: 1.5, borderRadius: "12px",
                fontSize: "1rem", fontWeight: 700,
                boxShadow: `0 8px 24px ${alpha(PRIMARY, 0.35)}`,
                "&:hover": { bgcolor: PRIMARY_DARK },
              }}>
                Start Free — No Credit Card Needed
              </Button>
              <Typography sx={{ fontSize: "0.82rem", color: GRAY, mt: 1.5 }}>
                14-day free trial · Full access to all features · Cancel anytime
              </Typography>
            </Box>
          </Container>
        </Box>

        {/* ── WHO IS IT FOR ─────────────────────────────────────────────────── */}
        <Box sx={{ bgcolor: LIGHT, py: { xs: 8, md: 12 }, px: { xs: 3, md: 6 } }}>
          <Container maxWidth="lg">
            <Box textAlign="center" mb={{ xs: 6, md: 8 }}>
              <Typography sx={{ color: PRIMARY, fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.18em", textTransform: "uppercase", mb: 1.5 }}>
                BUILT FOR EVERY BUSINESS
              </Typography>
              <Typography sx={{ fontSize: { xs: "1.9rem", md: "2.8rem" }, fontWeight: 800, color: DARK, letterSpacing: "-0.025em" }}>
                Zodu Works for Your Industry
              </Typography>
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)", md: "repeat(6, 1fr)" }, gap: 2 }}>
              {businessTypes.map((biz) => (
                <Box key={biz.title} sx={{
                  bgcolor: "#fff", border: `1px solid ${BORDER}`, borderRadius: "16px",
                  p: 2.5, textAlign: "center", cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": { borderColor: alpha(PRIMARY, 0.35), boxShadow: `0 4px 20px ${alpha(PRIMARY, 0.08)}`, transform: "translateY(-2px)" },
                }}>
                  <biz.icon sx={{ fontSize: "2.2rem", color: PRIMARY, mb: 1.2 }} />
                  <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: DARK, mb: 0.5, lineHeight: 1.35 }}>{biz.title}</Typography>
                  <Typography sx={{ fontSize: "0.73rem", color: GRAY, lineHeight: 1.5 }}>{biz.desc}</Typography>
                </Box>
              ))}
            </Box>
          </Container>
        </Box>

        {/* ── DASHBOARD DEMO ────────────────────────────────────────────────── */}
        <Box sx={{ bgcolor: DARK, py: { xs: 8, md: 14 }, px: { xs: 3, md: 6 } }}>
          <Container maxWidth="lg">
            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: "center", gap: { xs: 6, md: 10 } }}>
              <Box sx={{ flex: "0 0 auto", maxWidth: { xs: "100%", md: 420 } }}>
                <Typography sx={{ color: PRIMARY, fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.18em", textTransform: "uppercase", mb: 2 }}>
                  POWERFUL DASHBOARD
                </Typography>
                <Typography sx={{ fontSize: { xs: "1.9rem", md: "2.6rem" }, fontWeight: 800, color: "#fff", lineHeight: 1.2, mb: 2, letterSpacing: "-0.025em" }}>
                  Your Entire Business at a Glance
                </Typography>
                <Typography sx={{ fontSize: "0.97rem", color: "#94a3b8", lineHeight: 1.75, mb: 4 }}>
                  No more spreadsheets. No more guessing. See your sales, stock, expenses, and profits in one live dashboard — on any device, anytime.
                </Typography>
                <Stack spacing={2} mb={4}>
                  {[
                    "Live sales & revenue — today, this week, this month",
                    "Real-time stock levels across all product categories",
                    "Employee performance and attendance at a glance",
                    "Top-selling products and items that need attention",
                  ].map((point) => (
                    <Box key={point} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                      <CheckCircleIcon sx={{ fontSize: 17, color: PRIMARY, flexShrink: 0, mt: "3px" }} />
                      <Typography sx={{ fontSize: "0.9rem", color: "#cbd5e1", lineHeight: 1.65 }}>{point}</Typography>
                    </Box>
                  ))}
                </Stack>
                <Button variant="outlined" endIcon={<ArrowForwardIcon />} onClick={() => navigate("/signup")} sx={{
                  borderColor: "rgba(255,255,255,0.25)", color: "#fff", px: 3.5, py: 1.3, borderRadius: "10px",
                  fontSize: "0.93rem", fontWeight: 600,
                  "&:hover": { bgcolor: "#fff", color: DARK, borderColor: "#fff" },
                }}>
                  See the Dashboard Live
                </Button>
              </Box>

              <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
                <Box component="img" src={heroSection} alt="Zodu live dashboard view"
                  sx={{ width: "100%", maxWidth: 560, objectFit: "contain", filter: "drop-shadow(0 20px 60px rgba(0,0,0,0.5))" }} />
              </Box>
            </Box>
          </Container>
        </Box>

        {/* ── PRICING ──────────────────────────────────────────────────────── */}
        <Box sx={{ bgcolor: "#fff", py: { xs: 8, md: 14 }, px: { xs: 3, md: 6 } }}>
          <Container maxWidth="lg">
            <Box textAlign="center" mb={{ xs: 6, md: 10 }}>
              <Typography sx={{ color: PRIMARY, fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.18em", textTransform: "uppercase", mb: 1.5 }}>
                SIMPLE, TRANSPARENT PRICING
              </Typography>
              <Typography sx={{ fontSize: { xs: "1.9rem", md: "2.8rem" }, fontWeight: 800, color: DARK, letterSpacing: "-0.025em", mb: 2 }}>
                Choose What Works for Your Business
              </Typography>
              <Typography sx={{ fontSize: "1.05rem", color: GRAY, maxWidth: 480, mx: "auto", lineHeight: 1.75, mb: 4 }}>
                No hidden charges. No setup fees. Start free for 14 days and upgrade only when you are ready.
              </Typography>

              {/* Monthly / Yearly toggle */}
              <Box sx={{ display: "inline-flex", alignItems: "center", bgcolor: LIGHT, borderRadius: "12px", p: 0.5, gap: 0.5 }}>
                {(["monthly", "yearly"] as const).map((type) => (
                  <Button key={type} onClick={() => setBilling(type)} sx={{
                    px: 3, py: 0.9, borderRadius: "10px", fontSize: "0.88rem", fontWeight: 600,
                    textTransform: "capitalize",
                    bgcolor: billing === type ? "#fff" : "transparent",
                    color: billing === type ? DARK : GRAY,
                    boxShadow: billing === type ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                    "&:hover": { bgcolor: billing === type ? "#fff" : BORDER },
                  }}>
                    {type === "monthly" ? "Monthly" : (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                        Yearly
                        <Box component="span" sx={{ bgcolor: "#dcfce7", color: "#16a34a", fontSize: "0.63rem", fontWeight: 800, px: 0.9, py: 0.2, borderRadius: "4px" }}>
                          SAVE 20%
                        </Box>
                      </Box>
                    )}
                  </Button>
                ))}
              </Box>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 3, alignItems: "center" }}>
              {plans.map((plan) => (
                <Box key={plan.name} sx={{
                  border: plan.popular ? `2px solid ${PRIMARY}` : `1px solid ${BORDER}`,
                  borderRadius: "24px", p: { xs: 3.5, md: 4 },
                  position: "relative",
                  transform: plan.popular ? { md: "scale(1.04)" } : "none",
                  boxShadow: plan.popular ? `0 24px 60px ${alpha(PRIMARY, 0.14)}` : "0 2px 16px rgba(0,0,0,0.04)",
                  bgcolor: "#fff",
                }}>
                  {plan.popular && (
                    <Box sx={{
                      position: "absolute", top: -15, left: "50%", transform: "translateX(-50%)",
                      bgcolor: PRIMARY, color: "#fff", fontSize: "0.68rem", fontWeight: 800,
                      px: 2.5, py: 0.6, borderRadius: "999px", letterSpacing: "0.1em", whiteSpace: "nowrap",
                    }}>
                      MOST POPULAR
                    </Box>
                  )}

                  <Typography sx={{ fontWeight: 800, fontSize: "1.3rem", color: DARK, mb: 0.5 }}>{plan.name}</Typography>
                  <Typography sx={{ fontSize: "0.85rem", color: GRAY, mb: 3 }}>{plan.tagline}</Typography>

                  {plan.monthly !== "Custom" ? (
                    <Box mb={4}>
                      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
                        <Typography sx={{ fontSize: "2.8rem", fontWeight: 900, color: DARK, letterSpacing: "-0.03em" }}>
                          {billing === "monthly" ? plan.monthly : plan.yearly}
                        </Typography>
                        <Typography sx={{ fontSize: "0.9rem", color: GRAY }}>/month</Typography>
                      </Box>
                      {billing === "yearly" && (
                        <Typography sx={{ fontSize: "0.78rem", color: "#16a34a", fontWeight: 600 }}>
                          Billed annually · You save 20%
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Box mb={4}>
                      <Typography sx={{ fontSize: "2rem", fontWeight: 900, color: DARK, mb: 0.5 }}>Custom</Typography>
                      <Typography sx={{ fontSize: "0.82rem", color: GRAY }}>Tailored to your business size</Typography>
                    </Box>
                  )}

                  <Stack spacing={1.4} mb={4}>
                    {plan.items.map((item) => (
                      <Box key={item} sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                        <CheckCircleIcon sx={{ fontSize: 16, color: plan.popular ? PRIMARY : "#16a34a", flexShrink: 0 }} />
                        <Typography sx={{ fontSize: "0.88rem", color: "#374151" }}>{item}</Typography>
                      </Box>
                    ))}
                  </Stack>

                  <Button fullWidth variant={plan.popular ? "contained" : "outlined"} onClick={() => navigate(plan.cta === "Talk to Sales" ? "/" : "/signup")} sx={{
                    py: 1.4, borderRadius: "12px", fontWeight: 700, fontSize: "0.93rem",
                    ...(plan.popular
                      ? { bgcolor: PRIMARY, color: "#fff", "&:hover": { bgcolor: PRIMARY_DARK } }
                      : { borderColor: plan.name === "Enterprise" ? PRIMARY : BORDER, color: plan.name === "Enterprise" ? PRIMARY : DARK, "&:hover": { borderColor: PRIMARY, bgcolor: alpha(PRIMARY, 0.04) } }),
                  }}>
                    {plan.cta}
                  </Button>
                </Box>
              ))}
            </Box>

            <Box textAlign="center" mt={5}>
              <Typography sx={{ fontSize: "0.85rem", color: GRAY }}>
                All plans include a <Box component="span" sx={{ fontWeight: 700, color: DARK }}>14-day free trial</Box> · No credit card required · Cancel anytime
              </Typography>
            </Box>
          </Container>
        </Box>

        {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
        <Box sx={{ bgcolor: LIGHT, py: { xs: 8, md: 14 }, px: { xs: 3, md: 6 } }}>
          <Container maxWidth="lg">
            <Box textAlign="center" mb={{ xs: 6, md: 10 }}>
              <Typography sx={{ color: PRIMARY, fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.18em", textTransform: "uppercase", mb: 1.5 }}>
                REAL RESULTS FROM REAL BUSINESSES
              </Typography>
              <Typography sx={{ fontSize: { xs: "1.9rem", md: "2.8rem" }, fontWeight: 800, color: DARK, letterSpacing: "-0.025em" }}>
                Business Owners Love Zodu
              </Typography>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 3 }}>
              {testimonials.map((t) => (
                <Box key={t.name} sx={{
                  bgcolor: "#fff", border: `1px solid ${BORDER}`, borderRadius: "20px", p: 3,
                  display: "flex", flexDirection: "column",
                  transition: "box-shadow 0.2s",
                  "&:hover": { boxShadow: "0 8px 30px rgba(0,0,0,0.07)" },
                }}>
                  <Stack direction="row" spacing={0.3} mb={1.5}>
                    {[1, 2, 3, 4, 5].map((i) => <StarIcon key={i} sx={{ fontSize: 14, color: "#fbbf24" }} />)}
                  </Stack>

                  <Box sx={{
                    display: "inline-flex", bgcolor: "#f0fdf4", color: "#16a34a",
                    px: 1.4, py: 0.35, borderRadius: "6px", fontSize: "0.72rem", fontWeight: 700,
                    mb: 1.8, alignSelf: "flex-start",
                  }}>
                    ✓ {t.outcome}
                  </Box>

                  <Typography sx={{ fontSize: "0.87rem", color: "#475569", lineHeight: 1.75, mb: 2.5, flex: 1, fontStyle: "italic" }}>
                    "{t.text}"
                  </Typography>

                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ width: 38, height: 38, bgcolor: PRIMARY, fontSize: "0.85rem", fontWeight: 700 }}>
                      {t.name[0]}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: DARK }}>{t.name}</Typography>
                      <Typography sx={{ fontSize: "0.74rem", color: GRAY }}>{t.role} · {t.location}</Typography>
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Box>
          </Container>
        </Box>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <Box sx={{ bgcolor: "#fff", py: { xs: 8, md: 14 }, px: { xs: 3, md: 6 } }}>
          <Container maxWidth="lg">
            <Box textAlign="center" mb={{ xs: 6, md: 10 }}>
              <Typography sx={{ color: PRIMARY, fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.18em", textTransform: "uppercase", mb: 1.5 }}>
                GOT QUESTIONS?
              </Typography>
              <Typography sx={{ fontSize: { xs: "1.9rem", md: "2.8rem" }, fontWeight: 800, color: DARK, letterSpacing: "-0.025em", mb: 2 }}>
                Everything You Need to Know
              </Typography>
              <Typography sx={{ fontSize: "1.05rem", color: GRAY, maxWidth: 460, mx: "auto", lineHeight: 1.75 }}>
                Still have questions? Our support team is available 7 days a week to help you get started.
              </Typography>
            </Box>

            <Box sx={{ maxWidth: 780, mx: "auto" }}>
              {faqs.map((faq, i) => (
                <Accordion key={i} elevation={0} disableGutters sx={{
                  borderBottom: i < faqs.length - 1 ? `1px solid ${BORDER}` : "none",
                  "&:before": { display: "none" },
                  "&.Mui-expanded": { bgcolor: "#fafafa", borderRadius: "8px" },
                }}>
                  <AccordionSummary expandIcon={<AddIcon sx={{ color: PRIMARY, fontSize: 20 }} />}
                    sx={{ px: 2, "& .MuiAccordionSummary-content": { my: 2 } }}>
                    <Typography sx={{ fontWeight: 600, fontSize: "0.97rem", color: DARK }}>{faq.q}</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 2, pt: 0, pb: 3 }}>
                    <Typography sx={{ fontSize: "0.9rem", color: GRAY, lineHeight: 1.8 }}>{faq.a}</Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Container>
        </Box>

        {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
        <Box sx={{ py: { xs: 8, md: 10 }, px: { xs: 3, md: 6 }, bgcolor: LIGHT }}>
          <Container maxWidth="md">
            <Box sx={{
              bgcolor: PRIMARY, borderRadius: "28px",
              p: { xs: 5, md: 8 }, textAlign: "center",
              backgroundImage: `radial-gradient(ellipse at 75% 40%, ${alpha(PRIMARY_DARK, 0.7)} 0%, ${PRIMARY} 100%)`,
              position: "relative", overflow: "hidden",
            }}>
              <Typography sx={{ fontSize: { xs: "1.9rem", md: "2.8rem" }, fontWeight: 800, color: "#fff", lineHeight: 1.2, mb: 2, letterSpacing: "-0.025em" }}>
                Ready to Grow Your Business?
              </Typography>
              <Typography sx={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.85)", mb: 5, lineHeight: 1.75, maxWidth: 500, mx: "auto" }}>
                Join 10,000+ businesses already using Zodu. Start your free 14-day trial — no credit card required, cancel anytime.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
                <Button variant="contained" size="large" endIcon={<ArrowForwardIcon />} onClick={() => navigate("/signup")} sx={{
                  bgcolor: "#fff", color: PRIMARY, px: 4, py: 1.5, borderRadius: "12px",
                  fontWeight: 700, fontSize: "1rem",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                  "&:hover": { bgcolor: "#f1f5f9" },
                }}>
                  Start Free Trial
                </Button>
                <Button variant="outlined" size="large" sx={{
                  borderColor: "rgba(255,255,255,0.45)", color: "#fff",
                  px: 4, py: 1.5, borderRadius: "12px", fontWeight: 700, fontSize: "1rem",
                  "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.1)" },
                }}>
                  Talk to an Expert
                </Button>
              </Stack>
              <Typography sx={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.6)", mt: 3 }}>
                14-day free trial · Full feature access · No credit card needed
              </Typography>
            </Box>
          </Container>
        </Box>

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <Box component="footer" sx={{ bgcolor: DARK }}>
          <Container maxWidth="lg" sx={{ px: { xs: 3, md: 6 } }}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: { xs: 6, md: 10 }, py: { xs: 6, md: 8 } }}>
              {/* Brand */}
              <Box sx={{ maxWidth: 260 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <Box sx={{ height: 44, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    <img src={zlogo} alt="Zodu Logo" style={{ height: "100%", width: "auto", objectFit: "contain" }} />
                  </Box>
                </Box>
                <Typography sx={{ color: "#6B7280", fontSize: "0.87rem", lineHeight: 1.75, mb: 3 }}>
                  All-in-one POS solution to bill, manage, analyse and grow your business effortlessly.
                </Typography>
                <Stack direction="row" spacing={1}>
                  {[<FacebookIcon sx={{ fontSize: 18 }} />, <InstagramIcon sx={{ fontSize: 18 }} />, <LinkedInIcon sx={{ fontSize: 18 }} />, <YouTubeIcon sx={{ fontSize: 18 }} />].map((icon, i) => (
                    <IconButton key={i} size="small" sx={{ bgcolor: "rgba(255,255,255,0.06)", color: "#9ca3af", "&:hover": { bgcolor: PRIMARY, color: "#fff" } }}>
                      {icon}
                    </IconButton>
                  ))}
                </Stack>
              </Box>

              {/* Link columns */}
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(5, 1fr)" }, gap: { xs: 4, md: 4 }, flex: 1 }}>
                {[
                  { title: "Product",   links: ["Features", "Pricing", "Integrations", "What's New"] },
                  { title: "Solutions", links: ["Retail Stores", "Restaurants", "Supermarkets", "Pharmacies"] },
                  { title: "Company",   links: ["About Us", "Blog", "Careers", "Contact Us"] },
                  { title: "Support",   links: ["Help Centre", "Video Tutorials", "API Docs", "System Status"] },
                  { title: "Legal",     links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Refund Policy"] },
                ].map((col) => (
                  <Stack spacing={1.8} key={col.title}>
                    <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "0.88rem" }}>{col.title}</Typography>
                    <Stack spacing={1.2}>
                      {col.links.map((l) => (
                        <Link key={l} href="#" underline="none" sx={{ color: "#6B7280", fontSize: "0.85rem", transition: "color 0.15s", "&:hover": { color: "#fff" } }}>
                          {l}
                        </Link>
                      ))}
                    </Stack>
                  </Stack>
                ))}
              </Box>
            </Box>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.07)" }} />
            <Box sx={{ py: 3, display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: "center", gap: 2 }}>
              <Typography sx={{ color: "#6B7280", fontSize: "0.82rem" }}>
                © 2024 Zodu Technologies Pvt. Ltd. All rights reserved.
              </Typography>
              <Stack direction="row" spacing={2.5}>
                {["Privacy", "Terms", "Sitemap"].map((l) => (
                  <Link key={l} href="#" underline="none" sx={{ color: "#6B7280", fontSize: "0.82rem", "&:hover": { color: "#fff" } }}>{l}</Link>
                ))}
              </Stack>
            </Box>
          </Container>
        </Box>

      </Box>
    </ThemeProvider>
  );
};

export default ZoduLandingPage;
