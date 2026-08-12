import React, { useState } from "react";
import {
  Box, Button, Container, Typography, Stack, Divider,
  Link, IconButton, Accordion, AccordionSummary, AccordionDetails,
  Avatar,
  Grid,
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
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SyncIcon from "@mui/icons-material/Sync";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import BadgeIcon from "@mui/icons-material/Badge";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import InsightsIcon from "@mui/icons-material/Insights";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import AppleIcon from "@mui/icons-material/Apple";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useNavigate } from "react-router-dom";
import heroImg from "../../assets/heroImg.png";
import zlogo from "../../assets/zlogo.png";
import imgPosBilling from "../../assets/modules/pos-billing.png";
import imgInventory from "../../assets/modules/inventory.png";
import imgEmployee from "../../assets/modules/employee.png";
import imgReports from "../../assets/modules/reports-insights.png";
import imgGstTax from "../../assets/modules/gst-tax.png";
import imgMultiLocation from "../../assets/modules/multi-location.png";
import imgDigitalPayments from "../../assets/modules/digital-payments.png";
import imgTaskManagement from "../../assets/modules/task-management.png";
import imgBarcodeStock from "../../assets/modules/barcode-stock.png";
import imgPrint from "../../assets/modules/print.png";
import imgMobileApp from "../../assets/modules/mobile-app.png";
import getAppImg from "../../assets/GetAPP.png";
import gPlayLogo from "../../assets/g_play_logo.png";
import showcaseBilling from "../../assets/wzd__1.png";
import showcaseInventory from "../../assets/wzd_2.png";
import showcaseReports from "../../assets/wzd__3.png";
import showcaseTeam from "../../assets/wzd__4.png";
import posShot1 from "../../assets/Feature/POS.png";
import posShot2 from "../../assets/Feature/POS2.png";
import posShot3 from "../../assets/Feature/POS3.png";
// import pos4 from "../../assets/Feature/pos4.png";
// import pos7 from "../../assets/Feature/pos7.png";
// import pos6 from "../../assets/Feature/pos6.png";
import invShot1 from "../../assets/Feature/Inventory.png";
import invShot2 from "../../assets/Feature/Inventory2.png";
import invShot3 from "../../assets/Feature/Invenotry3.png";
import reportShot1 from "../../assets/Feature/Report.png";
import reportShot2 from "../../assets/Feature/Report2.png";
import reportShot3 from "../../assets/Feature/Report3.png";
import reportShot4 from "../../assets/Feature/Report4.png";
import barShot1 from "../../assets/Feature/bar1.png";
import barShot2 from "../../assets/Feature/bar2.png";
import barShot3 from "../../assets/Feature/bar3.png";
import barShot4 from "../../assets/Feature/bar4.png";
import mobileShot1 from "../../assets/Feature/mobile1.png";
import mobileShot2 from "../../assets/Feature/mobile2.png";
import mobileShot3 from "../../assets/Feature/mobile3.png";
import employeeShot1 from "../../assets/Feature/employee1.png";
import employeeShot2 from "../../assets/Feature/employee3.png";
import employeeShot3 from "../../assets/Feature/employee4.png";
import attendanceShot1 from "../../assets/Feature/attendance1.png";
import attendanceShot2 from "../../assets/Feature/attendance2.png";
import attendanceShot3 from "../../assets/Feature/attendance3.png";
import gstShot1 from "../../assets/Feature/gst1.png";
import gstShot2 from "../../assets/Feature/gst2.png";
import gstShot3 from "../../assets/Feature/gst3.png";
import gstShot4 from "../../assets/Feature/gst4.png";
import cusShot1 from "../../assets/Feature/cus1.png";
import cusShot2 from "../../assets/Feature/cus2.png";
import cusShot3 from "../../assets/Feature/cus3.png";
import cusShot4 from "../../assets/Feature/cus4.png";
import locShot1 from "../../assets/Feature/loc1.png";
import locShot2 from "../../assets/Feature/loc2.png";
import locShot3 from "../../assets/Feature/loc3.png";
import digiShot1 from "../../assets/Feature/digi1.png";
import digiShot2 from "../../assets/Feature/digi2.png";
import digiShot3 from "../../assets/Feature/digi3.png";
import taskShot1 from "../../assets/Feature/task1.png";
import taskShot2 from "../../assets/Feature/task2.png";
import taskShot3 from "../../assets/Feature/task3.png";

import AssessmentIcon from '@mui/icons-material/Assessment';

import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import BarChartIcon from '@mui/icons-material/BarChart';

import { 
  Face as FaceIcon,
  QrCode as QrCodeIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Notifications as NotificationsIcon,
  Receipt as ReceiptIcon,
  Home as HomeIcon,
  Bolt as BoltIcon,
  MoreHoriz as MoreHorizIcon,
  ShoppingBag as ShoppingBagIcon,
} from '@mui/icons-material';

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

const features: {
  icon: string;
  bg: string;
  img: string;
  color:string;
  title: string;
  tagline: string;
  items: string[];
  images?: string[];
}[] = [
  {
    icon: imgPosBilling,
    bg: "#fff0f0",
    img: showcaseBilling,
    title: "Billing",
    tagline: "Turn every sale into a fast, error-free transaction.",
    items: [
      "Create GST-compliant invoices in under 10 seconds",
      "Accept cash, card, UPI & all digital payment modes",
      "Apply discounts, offers & loyalty points instantly",
      "Print or WhatsApp bills directly from the app",
    ],
  },
  {
    icon: imgInventory,
    bg: "#f0fdf4",
    img: showcaseInventory,
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
    icon: imgReports,
    bg: "#fff7ed",
    img: showcaseReports,
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
    icon: imgEmployee,
    bg: "#eff6ff",
    img: showcaseTeam,
     color: "#0a99eb", 
    images: [employeeShot1, employeeShot2, employeeShot3],
    title: "Employee Management",
    tagline: "Run your whole team without the headache.",
    items: [
      "Role-based access control",
      "Track each staff's sales performance",
      "Monthly payroll in minutes",
      "Shift & duty scheduling",
    ],
  },
  {
    icon: imgPrint,
    bg: "#eff6ff",
    img: showcaseTeam,
    title: "Manage Your Team Without the Headache",
    tagline: "Save 5+ hours every week on staff management.",
    items: [
      "Track attendance automatically with login logs",
      "Process monthly payroll in under 10 minutes",
      "Set role-based access — staff see only what they need",
      "Monitor each employee's sales performance live",
    ],
  },
  {
    icon: imgGstTax,
    bg: "#eff6ff",
    img: showcaseTeam,
    title: "GST & Tax Reports",
    tagline: "Stay compliant without the accountant stress.",
    items: [
      "Auto GST calculation on every bill",
      "GSTR-ready exports for your CA",
      "HSN / SAC code support",
      "Tax summary dashboards",
    ],
  },
  {
    icon: imgGstTax,
    bg: "#eff6ff",
    img: showcaseTeam,
     color: "#19bbd4", 
    title: "Customer Management",
    tagline: "Turn one-time buyers into loyal regulars.",
    items: [
      "Customer profiles & purchase history",
      "Loyalty points & reward offers",
      "Loyalty points & reward offers",   
      "Credit / khata management",
      "Targeted offers & reminders"
    ],
  },
  {
    icon: imgMultiLocation,
    bg: "#eff6ff",
    img: showcaseTeam,
    title: "Multi Location",
    tagline: "Run every branch from a single account.",
    items: [
      "Combined cross-branch reports",
      "Per-outlet inventory control",
      "Centralised staff management",
      "Branch-wise performance",
    ],
  },
  {
    icon: imgDigitalPayments,
    bg: "#eff6ff",
    img: showcaseTeam,
     color: "#d70fac", 
    images: [digiShot1, digiShot2, digiShot3],
    title: "Digital Payments",
    tagline: "Accept every payment mode, auto-reconciled.",
    items: [
      "UPI, card & wallet support",
      "QR-code payments at the counter",
      "Automatic payment reminders",
      "Reconciled transaction records",
    ],
  },
  {
    icon: imgTaskManagement,
    bg: "#eff6ff",
    img: showcaseTeam,
     color: "#03e13b", 
    images: [taskShot1, taskShot2, taskShot3],
    title: "Task Management",
    tagline: "Assign work and track it to completion.",
    items: [
      "Assign tasks to any staff member",
      "Track progress in real time",
      "Due-date reminders & alerts",
      "Daily task checklists",
    ],
  },
  {
    icon: imgBarcodeStock,
    bg: "#eff6ff",
    img: showcaseTeam,
     color: "#19bbd4", 
    images: [barShot1, barShot2, barShot3, barShot4],
    title: "Barcode & Stock",
    tagline: "Scan-to-bill speed at the counter.",
    items: [
      "Barcode scan billing",
      "Automatic stock deduction",
      "Label & barcode printing",
      "Batch & expiry tracking",
    ],
  },
  {
    icon: imgMobileApp,
    bg: "#eff6ff",
    img: showcaseTeam,
     color: "#4b06ba", 
    images: [mobileShot1, mobileShot2, mobileShot3],
    title: "Mobile App & Alerts",
    tagline: "Run your business right from your pocket.",
    items: [
      "iOS, Android & tablet apps",
      "Real-time sales alerts",
      "Remote dashboard access",
      "Smart push notifications",
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
  // { icon: LocalPharmacyIcon,        title: "Pharmacies",          desc: "Medical shops, clinics & diagnostic centres" },
  { icon: SpaIcon,                  title: "Beauty & Wellness",   desc: "Salons, spas, fitness studios & wellness centres" },
  { icon: MiscellaneousServicesIcon,title: "Services & Others",   desc: "Coaching centres, print shops & service businesses" },
];

// Complete module suite. `icon` renders today; for the modules illustrated in
// the hero sketch sheet you can slice the artwork via scripts/slice-module-icons.py
// and set `img: new URL("../../assets/modules/<name>.png", import.meta.url).href`
// — the cards prefer the artwork over the icon when `img` is present.
const modules: {
  icon: React.ReactElement;
  color: string;
  bg: string;
  title: string;
  desc: string;
  points: string[];
  img?: string;
}[] = [
  {
    icon: <PointOfSaleIcon />, color: "#d32f2f", bg: "#fff0f0", img: imgPosBilling,
    title: "POS Billing", desc: "Lightning-fast point-of-sale for busy counters.",
    points: ["GST invoices in under 10 seconds", "Cash, card, UPI & split payments", "Instant discounts & loyalty points", "Print or WhatsApp bills directly"],
  },
  {
    icon: <ShoppingCartIcon />, color: "#ea580c", bg: "#fff7ed", img: imgInventory,
    title: "Inventory Management", desc: "Always know what's in stock before you run out.",
    points: ["Real-time stock across all products", "Low-stock & reorder alerts", "Batch, expiry & multi-unit support", "Purchase orders & supplier records"],
  },
  {
    icon: <BadgeIcon />, color: "#2563eb", bg: "#eff6ff", img: imgEmployee,
    title: "Employee Management", desc: "Run your whole team without the headache.",
    points: ["Role-based access control", "Track each staff's sales performance", "Monthly payroll in minutes", "Shift & duty scheduling"],
  },
  {
    icon: <FingerprintIcon />, color: "#0d9488", bg: "#f0fdfa",
    title: "Attendance Management", desc: "Accurate attendance with no manual registers.",
    points: ["Auto check-in / check-out logs", "Late, early & overtime tracking", "Leave & holiday management", "Attendance-linked payroll"],
  },
  {
    icon: <InsightsIcon />, color: "#7c3aed", bg: "#f5f3ff", img: imgReports,
    title: "Reports & Insights", desc: "Make every decision backed by real numbers.",
    points: ["Daily, weekly & monthly P&L", "Top & slow-moving products", "Expense tracking by category", "Export-ready business reports"],
  },
  {
    icon: <ReceiptLongIcon />, color: "#0891b2", bg: "#ecfeff", img: imgGstTax,
    title: "GST & Tax Reports", desc: "Stay compliant without the accountant stress.",
    points: ["Auto GST calculation on every bill", "GSTR-ready exports for your CA", "HSN / SAC code support", "Tax summary dashboards"],
  },
  {
    icon: <GroupsIcon />, color: "#ca8a04", bg: "#fefce8",
    title: "Customer Management", desc: "Turn one-time buyers into loyal regulars.",
    points: ["Customer profiles & purchase history", "Loyalty points & reward offers", "Credit / khata management", "Targeted offers & reminders"],
  },
  {
    icon: <StorefrontIcon />, color: "#9333ea", bg: "#faf5ff", img: imgMultiLocation,
    title: "Multi Location", desc: "Run every branch from a single account.",
    points: ["Combined cross-branch reports", "Per-outlet inventory control", "Centralised staff management", "Branch-wise performance"],
  },
  {
    icon: <CreditCardIcon />, color: "#dc2626", bg: "#fff0f0", img: imgDigitalPayments,
    title: "Digital Payments", desc: "Accept every payment mode, auto-reconciled.",
    points: ["UPI, card & wallet support", "QR-code payments at the counter", "Automatic payment reminders", "Reconciled transaction records"],
  },
  {
    icon: <AssignmentTurnedInIcon />, color: "#16a34a", bg: "#f0fdf4", img: imgTaskManagement,
    title: "Task Management", desc: "Assign work and track it to completion.",
    points: ["Assign tasks to any staff member", "Track progress in real time", "Due-date reminders & alerts", "Daily task checklists"],
  },
  {
    icon: <QrCodeScannerIcon />, color: "#059669", bg: "#ecfdf5", img: imgBarcodeStock,
    title: "Barcode & Stock", desc: "Scan-to-bill speed at the counter.",
    points: ["Barcode scan billing", "Automatic stock deduction", "Label & barcode printing", "Batch & expiry tracking"],
  },
  {
    icon: <NotificationsActiveIcon />, color: "#db2777", bg: "#fdf2f8", img: imgMobileApp,
    title: "Mobile App & Alerts", desc: "Run your business right from your pocket.",
    points: ["iOS, Android & tablet apps", "Real-time sales alerts", "Remote dashboard access", "Smart push notifications"],
  },
];

const plans = [
  {
    name: "Starter",
    tagline: "Perfect for new & small businesses",
    monthly: "₹199",
    yearly: "₹189",
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
    monthly: "₹499",
    yearly: "₹399",
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

// ── Shared spacing tokens ──────────────────────────────────────────────────────
const SX = { xs: 3, md: 10 };          // section horizontal padding
const SPY = { xs: 6, md: 4 };         // section vertical padding
const HMB = { xs: 4, md: 6 };         // section heading bottom margin
const POPPINS = "'Poppins', sans-serif";

// Get-the-app section palette (matches the brand asset sheet)
const APP_RED = "#EF4444";
const APP_RED_DARK = "#DC2626";
const APP_NAVY = "#1E293B";
const APP_SLATE = "#64748B";

// ── Showcase mockup ────────────────────────────────────────────────────────────
// Browser-framed faux dashboard used as a product-screenshot placeholder.
// Tints itself with each feature's accent so the four rows feel distinct.
const ShowcaseMock: React.FC<{ feature: (typeof features)[number] }> = ({ feature }) => (
  <Box sx={{
    borderRadius: "20px", overflow: "hidden", bgcolor: "#fff",
    border: `1px solid ${BORDER}`, boxShadow: "0 24px 60px rgba(0,0,0,0.10)",
  }}>
    {/* Browser chrome */}
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, px: 2, py: 1.3, bgcolor: LIGHT, borderBottom: `1px solid ${BORDER}` }}>
      {["#f87171", "#fbbf24", "#34d399"].map((c) => (
        <Box key={c} sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: c }} />
      ))}
      <Box sx={{ flex: 1 }} />
      <Box sx={{ width: "45%", height: 14, borderRadius: "999px", bgcolor: "#fff", border: `1px solid ${BORDER}` }} />
    </Box>

    {/* Tinted body */}
    <Box sx={{ p: { xs: 2.5, md: 3 }, background: `linear-gradient(160deg, ${feature.bg} 0%, #fff 72%)` }}>
      {/* Header with feature icon */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
        <Box sx={{ width: 44, height: 44, borderRadius: "12px", bgcolor: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {feature.icon}
        </Box>
        <Box>
          <Box sx={{ width: 130, height: 11, borderRadius: "999px", bgcolor: "rgba(17,24,39,0.82)", mb: 0.8 }} />
          <Box sx={{ width: 84, height: 8, borderRadius: "999px", bgcolor: "rgba(17,24,39,0.22)" }} />
        </Box>
      </Box>

      {/* Stat tiles */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 2.5 }}>
        {[0, 1, 2].map((k) => (
          <Box key={k} sx={{ flex: 1, bgcolor: "#fff", borderRadius: "12px", p: 1.5, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <Box sx={{ width: "60%", height: 8, borderRadius: "999px", bgcolor: "rgba(17,24,39,0.14)", mb: 1.2 }} />
            <Box sx={{ width: "85%", height: 15, borderRadius: "999px", bgcolor: alpha(PRIMARY, 0.82) }} />
          </Box>
        ))}
      </Box>

      {/* List rows */}
      <Stack spacing={1.2}>
        {[0, 1, 2, 3].map((k) => (
          <Box key={k} sx={{ display: "flex", alignItems: "center", gap: 1.5, bgcolor: "#fff", borderRadius: "10px", p: 1.3, boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
            <Box sx={{ width: 26, height: 26, borderRadius: "7px", bgcolor: feature.bg, flexShrink: 0 }} />
            <Box sx={{ flex: 1 }}>
              <Box sx={{ width: `${72 - k * 9}%`, height: 9, borderRadius: "999px", bgcolor: "rgba(17,24,39,0.18)" }} />
            </Box>
            <Box sx={{ width: 40, height: 9, borderRadius: "999px", bgcolor: "rgba(17,24,39,0.10)" }} />
          </Box>
        ))}
      </Stack>
    </Box>
  </Box>
);

// ── Component ─────────────────────────────────────────────────────────────────

const ZoduLandingPage: React.FC = () => {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [mobileOpen, setMobileOpen] = useState(false);
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
        }}>
          {/* Main nav row */}
          <Box sx={{ px: { xs: 2.5, md: 6 }, py: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box sx={{ height: 40, display: "flex", alignItems: "center", overflow: "hidden" }}>
              <img src={zlogo} alt="Zodu Logo" style={{ height: "100%", width: "auto", objectFit: "contain" }} />
            </Box>

            {/* Desktop nav links */}
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ display: { xs: "none", md: "flex" } }}>
              {["Features", "Solutions", "Pricing", "Resources", "Company"].map((item) => (
                <Button key={item}
                  endIcon={["Solutions", "Resources", "Company"].includes(item) ? <KeyboardArrowDownIcon sx={{ fontSize: "16px !important" }} /> : undefined}
                  sx={{ color: "#374151", fontWeight: 500, fontSize: "0.9rem", px: 1.5, py: 0.8, "&:hover": { bgcolor: LIGHT, color: DARK } }}>
                  {item}
                </Button>
              ))}
            </Stack>

            {/* Right side: CTAs + hamburger */}
            <Stack direction="row" spacing={1} alignItems="center">
              <Button onClick={() => navigate("/login")}
                sx={{ color: "#374151", fontWeight: 600, fontSize: "0.9rem", px: 2, display: { xs: "none", sm: "inline-flex" } }}>
                Login
              </Button>
              <Button variant="contained" onClick={() => navigate("/signup")}
                sx={{
                  bgcolor: PRIMARY, color: "#fff", px: 2.5, py: 0.9, borderRadius: "8px",
                  fontSize: "0.88rem", fontWeight: 700,
                  display: { xs: "none", sm: "inline-flex" },
                  "&:hover": { bgcolor: PRIMARY_DARK },
                }}>
                Start Free Trial
              </Button>
              <IconButton
                onClick={() => setMobileOpen(!mobileOpen)}
                sx={{ display: { xs: "flex", md: "none" }, color: DARK, p: 0.75 }}
                aria-label="toggle navigation menu"
              >
                {mobileOpen ? <CloseIcon /> : <MenuIcon />}
              </IconButton>
            </Stack>
          </Box>

          {/* Mobile menu — slides in below nav bar */}
          {mobileOpen && (
            <Box sx={{ display: { xs: "block", md: "none" }, bgcolor: "#fff", borderTop: `1px solid ${BORDER}`, px: 2.5, pt: 1.5, pb: 2.5 }}>
              <Stack spacing={0.25} mb={2}>
                {["Features", "Solutions", "Pricing", "Resources", "Company"].map((item) => (
                  <Button key={item} fullWidth onClick={() => setMobileOpen(false)}
                    sx={{ justifyContent: "flex-start", color: DARK, fontWeight: 500, fontSize: "0.95rem", py: 1.1, px: 1.5, borderRadius: "8px", "&:hover": { bgcolor: LIGHT } }}>
                    {item}
                  </Button>
                ))}
              </Stack>
              <Stack spacing={1}>
                <Button fullWidth variant="outlined" onClick={() => { navigate("/login"); setMobileOpen(false); }}
                  sx={{ borderColor: BORDER, color: DARK, fontWeight: 600, borderRadius: "8px", py: 1.1, "&:hover": { borderColor: PRIMARY, color: PRIMARY } }}>
                  Login
                </Button>
                <Button fullWidth variant="contained" onClick={() => { navigate("/signup"); setMobileOpen(false); }}
                  sx={{ bgcolor: PRIMARY, color: "#fff", fontWeight: 700, borderRadius: "8px", py: 1.1, "&:hover": { bgcolor: PRIMARY_DARK } }}>
                  Start Free Trial
                </Button>
              </Stack>
            </Box>
          )}
        </Box>

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <Box sx={{
          overflow: "hidden",
          bgcolor: "#fff",
          position: "relative",
          minHeight: { md: "calc(100vh - 70px)" },
          display: { md: "flex" },
          flexDirection: { md: "column" },
        }}>
          <Box sx={{
            position: "absolute",
            top: 52,
            right: 72,
            width: 132,
            height: 90,
            opacity: 0.45,
            backgroundImage: `radial-gradient(${alpha(PRIMARY, 0.35)} 1.6px, transparent 1.6px)`,
            backgroundSize: "15px 15px",
            pointerEvents: "none",
            display: { xs: "none", md: "block" },
            zIndex: 0,
          }} />

          {/* Two-column layout with a bigger right-side image */}
          <Box sx={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            flex: { md: 1 },
            alignItems: "center",
            justifyContent: "space-between",
            maxWidth: 1360,
            mx: "auto",
            width: "100%",
            px: { xs: 3, sm: 5, md: 5 },
            minHeight: { md: "clamp(500px, calc(100vh - 170px), 590px)" },
          }}>

            {/* LEFT — text (Compact and clean) */}
            <Box sx={{
              flex: { md: "0 0 42%" }, // 👈 Text width-a konjam kurachirukken
              display: "flex", alignItems: "center",
              py: { xs: 4, md: 4 },
              order: { xs: 2, md: 1 },
            }}>
              <Box sx={{
                maxWidth: 520, width: "100%",
                textAlign: { xs: "center", md: "left" },
              }}>

                {/* Trust badge */}
                <Box sx={{
                  display: "inline-flex", alignItems: "center", gap: 0.8,
                  bgcolor: alpha(PRIMARY, 0.09), color: PRIMARY,
                  px: 1.8, py: 0.7, borderRadius: "999px",
                  fontSize: "0.75rem", fontWeight: 700, mb: 2,
                  border: `1px solid ${alpha(PRIMARY, 0.22)}`,
                  boxShadow: `0 10px 24px ${alpha(PRIMARY, 0.08)}`,
                }}>
                  <VerifiedIcon sx={{ fontSize: 14 }} />
                  Trusted by 10,000+ Businesses Across India
                </Box>

                {/* Headline - Standard neat size */}
                <Typography sx={{
                  fontSize: { xs: "2.3rem", md: "3.1rem" },
                  fontWeight: 900, color: DARK,
                  lineHeight: 1.08, letterSpacing: "-0.035em",
                  mb: 1.5,
                }}>
                  Smart Billing &amp;<br />
                  <Box component="span" sx={{ color: "#2563eb", position: "relative", display: "inline-block" }}>
                    Business Management
                    <Box component="span" sx={{
                      position: "absolute",
                      left: 4,
                      right: 8,
                      bottom: { xs: -4, md: -7 },
                      height: { xs: 4, md: 6 },
                      borderRadius: "999px",
                      bgcolor: "rgba(30,58,138,0.15)",
                    }} />
                  </Box>
                </Typography>

                {/* Subtext */}
                <Typography sx={{
                  fontSize: { xs: "0.98rem", md: "1.02rem" },
                  color: "#5B6475", lineHeight: 1.6, mb: 2.2, maxWidth: 480,
                  mx: { xs: "auto", md: 0 },
                }}>
                  All-in-one POS solution to bill, manage, analyse and grow your business effortlessly. No tech skills required.
                </Typography>

                {/* CTAs */}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.4} mb={{ xs: 3.5, md: 2 }} justifyContent={{ xs: "center", md: "flex-start" }}>
                  <Button
                    variant="contained" size="large"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate("/signup")}
                    sx={{
                      bgcolor: PRIMARY, color: "#fff",
                      px: 3.2, py: 1.2, borderRadius: "12px",
                      fontSize: "0.95rem", fontWeight: 700,
                      boxShadow: `0 6px 20px ${alpha(PRIMARY, 0.38)}`,
                      "&:hover": { bgcolor: PRIMARY_DARK, boxShadow: `0 10px 28px ${alpha(PRIMARY, 0.48)}` },
                    }}
                  >
                    Start Free Trial
                  </Button>
                  <Button
                    variant="outlined" size="large"
                    sx={{
                      borderColor: "#D1D5DB", color: DARK,
                      px: 3.2, py: 1.2, borderRadius: "12px",
                      fontSize: "0.95rem", fontWeight: 600,
                      "&:hover": { borderColor: PRIMARY, color: PRIMARY, bgcolor: "transparent" },
                    }}
                  >
                    Book a Demo
                  </Button>
                </Stack>
              </Box>
            </Box>

            {/* RIGHT — hero image (Made larger and prominent) */}
            <Box sx={{
              flex: { md: "0 0 56%" }, // 👈 Image space-a perusaa aakkirukken
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              overflow: "hidden",
              order: { xs: 1, md: 2 },
              minHeight: { xs: 340, sm: 480, md: "auto" },
              py: { xs: 2.5, md: 0 },
            }}>
              <Box sx={{
                position: "relative",
                width: "100%",
                maxWidth: { xs: 520, sm: 720, md: 740 }, // 👈 Image max-width perusaa irukkum
              }}>
                <Box
                  component="img"
                  src={heroImg}
                  alt="Zodu business management platform"
                  sx={{
                    width: "100%",
                    maxHeight: { xs: 420, sm: 620, md: "clamp(480px, calc(100vh - 140px), 660px)" }, // 👈 Image height perusaa fix pannirukken
                    objectFit: "contain",
                    objectPosition: "center",
                    display: "block",
                    filter: "drop-shadow(0 18px 26px rgba(15,23,42,0.12))",
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* ── Trust bar ── */}
          <Box sx={{ bgcolor: "#F9FAFB", px: { xs: 2, md: 3 }, py: { xs: 1.4, md: 1.2 }, flexShrink: 0 }}>
            <Box sx={{
              display: "flex",
              flexWrap: { xs: "wrap", md: "nowrap" },
              bgcolor: "#fff",
              border: `1px solid ${BORDER}`,
              borderRadius: "14px",
              boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
              overflow: "hidden",
              maxWidth: 1280, mx: "auto",
            }}>
              {[
                { icon: <CloudIcon sx={{ fontSize: 24, color: PRIMARY }} />,                  label: "Cloud-Based",       sub: "Access from anywhere, anytime"                    },
                { icon: <LockIcon sx={{ fontSize: 24, color: PRIMARY }} />,                   label: "Bank-Level Security", sub: "Your data is 100% protected with advanced security" },
                { icon: <NotificationsOutlinedIcon sx={{ fontSize: 24, color: PRIMARY }} />,  label: "Smart Notifications", sub: "Stay updated on what matters most"                },
                { icon: <SyncIcon sx={{ fontSize: 24, color: PRIMARY }} />,                   label: "Auto Sync",         sub: "All data synced in real-time"                     },
                { icon: <SupportAgentIcon sx={{ fontSize: 24, color: PRIMARY }} />,           label: "Dedicated Support",   sub: "We're here to help you succeed"                   },
              ].map((b, i) => (
                <Stack
                  key={b.label}
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                  sx={{
                    flex: { md: 1 },
                    width: { xs: i === 4 ? "100%" : "50%", md: "auto" },
                    px: { xs: 2.5, md: 3 },
                    py: { xs: 1.2, md: 1 },
                    borderRight: { md: i < 4 ? `1px solid ${BORDER}` : "none" },
                    borderBottom: { xs: i < 4 ? `1px solid ${BORDER}` : "none", md: "none" },
                  }}
                >
                  {b.icon}
                  <Box>
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: DARK, lineHeight: 1.25 }}>{b.label}</Typography>
                    <Typography sx={{ fontSize: "0.66rem", color: GRAY, lineHeight: 1.35, mt: 0.2 }}>{b.sub}</Typography>
                  </Box>
                </Stack>
              ))}
            </Box>
          </Box>
        </Box>

        {/* ── STATS BAR ────────────────────────────────────────────────────── */}
        {/* <Box sx={{
          bgcolor: "#0B1220",
          py: { xs: 4, md: 5 },
          px: SX,
          position: "relative",
          overflow: "hidden",
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }}>
          <Box
            component="svg"
            viewBox="0 0 1200 220"
            preserveAspectRatio="none"
            aria-hidden="true"
            sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.8 }}
          >
            <path d="M-80 190 C100 110 220 238 386 154 C512 92 590 110 720 158 C866 212 998 168 1280 44" fill="none" stroke={alpha(PRIMARY, 0.18)} strokeWidth="3" />
            <path d="M760 0 C898 70 1030 32 1200 92 L1200 220 L780 220 C710 144 706 62 760 0 Z" fill={alpha(PRIMARY, 0.12)} />
          </Box> */}
          {/* <Container maxWidth="lg">
            <Box sx={{
              position: "relative",
              zIndex: 1,
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
              gap: { xs: 1.5, md: 0 },
              bgcolor: "rgba(255,255,255,0.045)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              boxShadow: "0 14px 32px rgba(0,0,0,0.12)",
              overflow: "hidden",
            }}>
              {[
                { icon: <GroupsIcon sx={{ fontSize: 28, color: PRIMARY }} />,       value: "1 Lakh+",  label: "Active Businesses" },
                { icon: <ReceiptLongIcon sx={{ fontSize: 28, color: PRIMARY }} />,  value: "₹500 Cr+", label: "Bills Generated"   },
                { icon: <StarIcon sx={{ fontSize: 28, color: PRIMARY }} />,         value: "4.9 / 5",  label: "Average Rating"    },
                { icon: <AccessTimeIcon sx={{ fontSize: 28, color: PRIMARY }} />,   value: "30 Min",   label: "Avg. Setup Time"   },
              ].map((stat, i) => (
                <Box key={stat.value} sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: 1.5, md: 2 },
                  p: { xs: 2, md: 2.8 },
                  borderRight: { md: i < 3 ? "1px solid rgba(255,255,255,0.08)" : "none" },
                  borderBottom: { xs: i < 2 ? "1px solid rgba(255,255,255,0.08)" : "none", md: "none" },
                }}>
                  <Box sx={{
                    width: { xs: 44, md: 52 },
                    height: { xs: 44, md: 52 },
                    borderRadius: "50%",
                    border: `1.5px solid ${alpha(PRIMARY, 0.5)}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: { xs: "1.35rem", md: "1.75rem" }, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>
                      {stat.value}
                    </Typography>
                    <Typography sx={{ fontSize: { xs: "0.72rem", md: "0.82rem" }, color: "#A7B0C0", fontWeight: 600, mt: 0.5 }}>{stat.label}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Container> */}
        {/* </Box> */}

        {/* ── FEATURE SHOWCASE (alternating rows) ──────────────────────────── */}
 {/* ── MODULE SUITE (9 MODULES) ─────────────────────────────────────── */}
 <Box 
   sx={{ 
      bgcolor: "#f8fafc", 
      minHeight: "100vh", 
      py: 1.5, 
      px: { xs: 2, md: 3 }, 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center" 
   }}
>
   <Container maxWidth="xl" sx={{ px: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
     
     {/* SECTION HEADINGS */}
     <Box textAlign="center" mb={2}>
       <Typography sx={{ color: "#dc2626", fontWeight: 700, fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", mb: 0.5 }}>
         WHAT ZODU DOES FOR YOU
       </Typography>
       <Typography sx={{ fontSize: { xs: "1.5rem", md: "1.85rem" }, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.025em", mb: 0.5, lineHeight: 1.15 }}>
         Stop Working Harder. Start Working Smarter.
       </Typography>
       <Typography sx={{ fontSize: "0.85rem", color: "#64748b", maxWidth: 550, mx: "auto", lineHeight: 1.4 }}>
         Every feature in Zodu is built around one goal — save you time, eliminate errors, and help your business grow faster.
       </Typography>
     </Box>

     {/* RESPONSIVE GRID */}
     <Grid container spacing={1.5} sx={{ width: "100%", m: 0, alignItems: "stretch" }}>
       
       {/* 1. POS BILLING */}
       <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex" }}>
         <Box sx={{ bgcolor: "#fff", p: 1.5, borderRadius: "12px", border: "1px solid #e2e8f0", width: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 2px 10px rgba(15,23,42,0.03)" }}>
           <Box>
             <Box sx={{ display: "flex", gap: 1.2, mb: 1.2 }}>
               <Box sx={{ width: 30, height: 30, borderRadius: "6px", bgcolor: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                 <ShoppingCartIcon sx={{ color: "#dc2626", fontSize: "0.95rem" }} />
               </Box>
               <Box>
                 <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "#0f172a" }}>POS Billing</Typography>
                 <Typography sx={{ fontSize: "0.7rem", color: "#64748b" }}>Bill in seconds during rush.</Typography>
               </Box>
             </Box>

             <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", justifyContent: "space-between" }}>
               <Box sx={{ flex: 1.2 }}>
                 <Typography sx={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 600 }}>Today's Sales</Typography>
                 <Typography sx={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", my: 0.1 }}>₹ 12,458</Typography>
                 <Typography sx={{ fontSize: "0.65rem", color: "#16a34a", fontWeight: 700, mb: 0.5 }}>↑ 12.5%</Typography>

                 {/* Sparkline */}
                 <Box sx={{ height: 20, mb: 1 }}>
                   <svg width="100%" height="100%" viewBox="0 0 100 28" preserveAspectRatio="none">
                     <polyline points="0,22 15,18 30,20 45,10 60,14 75,4 90,8 100,2" fill="none" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                   </svg>
                 </Box>

                 <Typography sx={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 600 }}>Total Orders: <Box component="span" sx={{ fontWeight: 800, color: "#0f172a" }}>128</Box></Typography>
               </Box>

               <Box sx={{ flex: 1.1, display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}>
                 <Box sx={{ width: 80, bgcolor: "#0f172a", p: 0.8, borderRadius: "8px", border: "1px solid #334155", color: "#fff", display: "flex", flexDirection: "column", gap: 0.4 }}>
                   <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                     <Typography sx={{ fontSize: "0.45rem", fontWeight: 800, color: "#ef4444" }}>zodu</Typography>
                   </Box>
                   <Box sx={{ bgcolor: "#1e293b", p: 0.4, borderRadius: "4px", display: "flex", flexDirection: "column", gap: 0.3 }}>
                     <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography sx={{ fontSize: "0.4rem" }}>Coffee</Typography><Typography sx={{ fontSize: "0.4rem", fontWeight: 700 }}>₹120</Typography></Box>
                     <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography sx={{ fontSize: "0.4rem" }}>Burger</Typography><Typography sx={{ fontSize: "0.4rem", fontWeight: 700 }}>₹150</Typography></Box>
                   </Box>
                   <Box sx={{ display: "flex", justifyContent: "space-between", pt: 0.2, borderTop: "1px solid #334155" }}>
                     <Typography sx={{ fontSize: "0.45rem", fontWeight: 800 }}>Total</Typography>
                     <Typography sx={{ fontSize: "0.45rem", fontWeight: 800, color: "#22c55e" }}>₹270</Typography>
                   </Box>
                 </Box>
               </Box>
             </Box>
           </Box>
         </Box>
       </Grid>

       {/* 2. INVENTORY MANAGEMENT */}
       <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex" }}>
         <Box sx={{ bgcolor: "#fff", p: 1.5, borderRadius: "12px", border: "1px solid #e2e8f0", width: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 2px 10px rgba(15,23,42,0.03)" }}>
           <Box>
             <Box sx={{ display: "flex", gap: 1.2, mb: 1.2 }}>
               <Box sx={{ width: 30, height: 30, borderRadius: "6px", bgcolor: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                 <Inventory2Icon sx={{ color: "#16a34a", fontSize: "0.95rem" }} />
               </Box>
               <Box>
                 <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "#0f172a" }}>Inventory Management</Typography>
                 <Typography sx={{ fontSize: "0.7rem", color: "#64748b" }}>Never run out of best-sellers.</Typography>
               </Box>
             </Box>

             <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
               <Box sx={{ flex: 1.3 }}>
                 <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                   <Box sx={{ width: 45, height: 45, borderRadius: "50%", background: "conic-gradient(#16a34a 0% 70%, #ca8a04 70% 85%, #dc2626 85% 100%)", flexShrink: 0 }} />
                   <Stack spacing={0.2} sx={{ width: "100%" }}>
                     <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography sx={{ fontSize: "0.6rem", color: "#64748b" }}>● In Stock</Typography><Typography sx={{ fontSize: "0.6rem", fontWeight: 800 }}>1,250</Typography></Box>
                     <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography sx={{ fontSize: "0.6rem", color: "#64748b" }}>● Low</Typography><Typography sx={{ fontSize: "0.6rem", fontWeight: 800 }}>86</Typography></Box>
                   </Stack>
                 </Box>
               </Box>

               <Box sx={{ flex: 0.9, p: 0.8, borderRadius: "6px", bgcolor: "#f8fafc", border: "1px solid #f1f5f9", textAlign: "center" }}>
                 <Typography sx={{ fontSize: "0.6rem", color: "#64748b", fontWeight: 600 }}>Low Stock</Typography>
                 <Typography sx={{ fontSize: "1.2rem", fontWeight: 800, color: "#dc2626", my: 0 }}>4</Typography>
                 <Typography sx={{ fontSize: "0.6rem", color: "#2563eb", fontWeight: 700 }}>View →</Typography>
               </Box>
             </Box>
           </Box>

           <Box sx={{ p: 0.8, borderRadius: "6px", bgcolor: "#f8fafc", border: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
             <Typography sx={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600 }}>Stock Value: <Box component="span" sx={{ fontWeight: 800, color: "#0f172a" }}>₹ 48k</Box></Typography>
             <Typography sx={{ fontSize: "0.7rem", color: "#16a34a", fontWeight: 700 }}>↑ 10.3%</Typography>
           </Box>
         </Box>
       </Grid>

       {/* 3. ATTENDANCE MANAGEMENT */}
       <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex" }}>
         <Box sx={{ bgcolor: "#fff", p: 1.5, borderRadius: "12px", border: "1px solid #e2e8f0", width: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 2px 10px rgba(15,23,42,0.03)" }}>
           <Box>
             <Box sx={{ display: "flex", gap: 1.2, mb: 1.2 }}>
               <Box sx={{ width: 30, height: 30, borderRadius: "6px", bgcolor: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                 <AccessTimeIcon sx={{ color: "#7c3aed", fontSize: "0.95rem" }} />
               </Box>
               <Box>
                 <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "#0f172a" }}>Attendance Management</Typography>
                 <Typography sx={{ fontSize: "0.7rem", color: "#64748b" }}>Track time & leaves accurately.</Typography>
               </Box>
             </Box>
             <Box sx={{ display: "flex", gap: 1 }}>
               <Box sx={{ flex: 1, p: 0.8, borderRadius: "6px", bgcolor: "#f8fafc", border: "1px solid #f1f5f9", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                 <Box>
                   <Typography sx={{ fontSize: "0.6rem", color: "#64748b" }}>John Doe</Typography>
                   <Typography sx={{ fontSize: "0.55rem", color: "#64748b", mt: 0.2 }}>In: 09:15 AM</Typography>
                 </Box>
                 <Box sx={{ mt: 0.5, bgcolor: "#16a34a", color: "#fff", py: 0.3, textAlign: "center", borderRadius: "4px", fontSize: "0.6rem", fontWeight: 700 }}>Check-in</Box>
               </Box>
               <Box sx={{ flex: 1.2, p: 0.8, borderRadius: "6px", bgcolor: "#f8fafc", border: "1px solid #f1f5f9" }}>
                 <Typography sx={{ fontSize: "0.7rem", fontWeight: 800, color: "#0f172a", mb: 0.4 }}>May 2024</Typography>
                 <Grid container spacing={0} textAlign="center">
                   {['S','M','T','W','T','F','S'].map((d, i) => (
                     <Grid size={{ xs: 1.7 }} key={i}><Typography sx={{ fontSize: "0.5rem", color: "#94a3b8", fontWeight: 700 }}>{d}</Typography></Grid>
                   ))}
                   {Array.from({length: 14}, (_, i) => i + 1).map((num) => (
                     <Grid size={{ xs: 1.7 }} key={num} sx={{ my: 0.1 }}>
                       <Typography sx={{ fontSize: "0.5rem", fontWeight: num === 21 ? 800 : 500, color: num === 21 ? "#fff" : "#334155", bgcolor: num === 21 ? "#7c3aed" : "transparent", borderRadius: "50%", width: 14, height: 14, mx: "auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
                         {num}
                       </Typography>
                     </Grid>
                   ))}
                 </Grid>
               </Box>
             </Box>
           </Box>
           <Box sx={{ p: 0.8, borderRadius: "6px", bgcolor: "#f8fafc", border: "1px solid #f1f5f9", display: "flex", justifyContent: "space-around", textAlign: "center", mt: 1 }}>
             <Box><Typography sx={{ fontSize: "0.55rem", color: "#64748b" }}>Present</Typography><Typography sx={{ fontWeight: 800, fontSize: "0.8rem", color: "#16a34a" }}>21</Typography></Box>
             <Box><Typography sx={{ fontSize: "0.55rem", color: "#64748b" }}>Absent</Typography><Typography sx={{ fontWeight: 800, fontSize: "0.8rem", color: "#dc2626" }}>2</Typography></Box>
             <Box><Typography sx={{ fontSize: "0.55rem", color: "#64748b" }}>Leaves</Typography><Typography sx={{ fontWeight: 800, fontSize: "0.8rem", color: "#d97706" }}>3</Typography></Box>
           </Box>
         </Box>
       </Grid>

       {/* 4. CUSTOMER MANAGEMENT */}
       <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex" }}>
         <Box sx={{ bgcolor: "#fff", p: 1.5, borderRadius: "12px", border: "1px solid #e2e8f0", width: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 2px 10px rgba(15,23,42,0.03)" }}>
           <Box>
             <Box sx={{ display: "flex", gap: 1.2, mb: 1.2 }}>
               <Box sx={{ width: 30, height: 30, borderRadius: "6px", bgcolor: "#ccfbf1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                 <GroupsIcon sx={{ color: "#0d9488", fontSize: "0.95rem" }} />
               </Box>
               <Box>
                 <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "#0f172a" }}>Customer Management</Typography>
                 <Typography sx={{ fontSize: "0.7rem", color: "#64748b" }}>Build stronger relationships.</Typography>
               </Box>
             </Box>
             <Box sx={{ display: "flex", gap: 1, mb: 1, alignItems: "center" }}>
               <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, flex: 1.3 }}>
                 <Avatar sx={{ bgcolor: "#0d9488", width: 32, height: 32, fontSize: "0.75rem", fontWeight: 700 }}>EW</Avatar>
                 <Box>
                   <Typography sx={{ fontWeight: 800, fontSize: "0.8rem", color: "#0f172a" }}>Emma Watson</Typography>
                   <Typography sx={{ fontSize: "0.5rem", color: "#0d9488", fontWeight: 700, bgcolor: "#ccfbf1", px: 0.5, py: 0.1, borderRadius: "4px", display: "inline-block" }}>Premium</Typography>
                 </Box>
               </Box>
               <Box sx={{ flex: 1, display: "flex", gap: 0.6 }}>
                 <Box sx={{ flex: 1, p: 0.6, borderRadius: "6px", bgcolor: "#f8fafc", border: "1px solid #f1f5f9" }}><Typography sx={{ fontSize: "0.55rem", color: "#64748b" }}>Orders</Typography><Typography sx={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a" }}>24</Typography></Box>
                 <Box sx={{ flex: 1, p: 0.6, borderRadius: "6px", bgcolor: "#f8fafc", border: "1px solid #f1f5f9" }}><Typography sx={{ fontSize: "0.55rem", color: "#64748b" }}>Spent</Typography><Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f172a" }}>₹48k</Typography></Box>
               </Box>
             </Box>
           </Box>
           <Box sx={{ p: 0.8, borderRadius: "6px", bgcolor: "#f8fafc", border: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
             <Box>
               <Typography sx={{ fontSize: "0.6rem", color: "#64748b" }}>emma.watson@email.com</Typography>
               <Typography sx={{ fontSize: "0.6rem", color: "#64748b", mt: 0.2 }}>+91 91234 56789</Typography>
             </Box>
             <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
               <Box sx={{ textAlign: "right" }}>
                 <Typography sx={{ fontSize: "0.55rem", color: "#64748b" }}>Due</Typography>
                 <Typography sx={{ fontSize: "0.8rem", fontWeight: 800, color: "#dc2626" }}>₹2,850</Typography>
               </Box>
               <Box sx={{ bgcolor: "#16a34a", color: "#fff", px: 1, py: 0.3, borderRadius: "4px", fontSize: "0.6rem", fontWeight: 700 }}>Pay</Box>
             </Box>
           </Box>
         </Box>
       </Grid>

       {/* 5. PAYMENTS & REMINDERS */}
       <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex" }}>
         <Box sx={{ bgcolor: "#fff", p: 1.5, borderRadius: "12px", border: "1px solid #e2e8f0", width: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 2px 10px rgba(15,23,42,0.03)" }}>
           <Box>
             <Box sx={{ display: "flex", gap: 1.2, mb: 1.2 }}>
               <Box sx={{ width: 30, height: 30, borderRadius: "6px", bgcolor: "#ffedd5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                 <RequestQuoteIcon sx={{ color: "#ea580c", fontSize: "0.95rem" }} />
               </Box>
               <Box>
                 <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "#0f172a" }}>Payments & Reminders</Typography>
                 <Typography sx={{ fontSize: "0.7rem", color: "#64748b" }}>Get paid on time, every time.</Typography>
               </Box>
             </Box>
             <Box sx={{ display: "flex", gap: 0.8 }}>
               <Box sx={{ flex: 1, p: 0.6, borderRadius: "6px", bgcolor: "#f8fafc", border: "1px solid #f1f5f9" }}><Typography sx={{ fontSize: "0.55rem", color: "#64748b" }}>Outstanding</Typography><Typography sx={{ fontSize: "0.8rem", fontWeight: 800, color: "#0f172a" }}>₹ 18k</Typography></Box>
               <Box sx={{ flex: 1, p: 0.6, borderRadius: "6px", bgcolor: "#f8fafc", border: "1px solid #f1f5f9" }}><Typography sx={{ fontSize: "0.55rem", color: "#64748b" }}>Overdue</Typography><Typography sx={{ fontSize: "0.8rem", fontWeight: 800, color: "#dc2626" }}>11</Typography></Box>
               <Box sx={{ flex: 1, p: 0.6, borderRadius: "6px", bgcolor: "#f8fafc", border: "1px solid #f1f5f9" }}><Typography sx={{ fontSize: "0.55rem", color: "#64748b" }}>Next</Typography><Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#ea580c" }}>2 days</Typography></Box>
             </Box>
           </Box>
           <Box sx={{ p: 0.8, borderRadius: "6px", bgcolor: "#f8fafc", border: "1px solid #f1f5f9", mt: 1 }}>
             <Typography sx={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 600, mb: 0.5 }}>Recent Reminders</Typography>
             <Stack spacing={0.4}>
               <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><Typography sx={{ fontSize: "0.6rem", fontWeight: 700 }}>ABC Retail</Typography><Typography sx={{ fontSize: "0.55rem", color: "#64748b" }}>In 2 days</Typography></Box>
               <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><Typography sx={{ fontSize: "0.6rem", fontWeight: 700 }}>XYZ Store</Typography><Typography sx={{ fontSize: "0.55rem", color: "#64748b" }}>In 5 days</Typography></Box>
             </Stack>
           </Box>
         </Box>
       </Grid>

       {/* 6. GST COMPLIANCE & REPORTS */}
       <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex" }}>
         <Box sx={{ bgcolor: "#fff", p: 1.5, borderRadius: "12px", border: "1px solid #e2e8f0", width: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 2px 10px rgba(15,23,42,0.03)" }}>
           <Box>
             <Box sx={{ display: "flex", gap: 1.2, mb: 1.2 }}>
               <Box sx={{ width: 30, height: 30, borderRadius: "6px", bgcolor: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                 <AssignmentTurnedInIcon sx={{ color: "#0284c7", fontSize: "0.95rem" }} />
               </Box>
               <Box>
                 <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "#0f172a" }}>GST Compliance</Typography>
                 <Typography sx={{ fontSize: "0.7rem", color: "#64748b" }}>Stay 100% compliant.</Typography>
               </Box>
             </Box>
             <Box sx={{ display: "flex", gap: 0.8 }}>
               <Box sx={{ flex: 1, p: 0.6, borderRadius: "6px", bgcolor: "#f8fafc", border: "1px solid #f1f5f9" }}>
                 <Typography sx={{ fontSize: "0.6rem", fontWeight: 800 }}>GSTR-1</Typography>
                 <Typography sx={{ fontSize: "0.6rem", color: "#16a34a", fontWeight: 700, mt: 0.3 }}>Filed</Typography>
               </Box>
               <Box sx={{ flex: 1, p: 0.6, borderRadius: "6px", bgcolor: "#f8fafc", border: "1px solid #f1f5f9" }}>
                 <Typography sx={{ fontSize: "0.6rem", fontWeight: 800 }}>GSTR-3B</Typography>
                 <Typography sx={{ fontSize: "0.6rem", color: "#16a34a", fontWeight: 700, mt: 0.3 }}>Filed</Typography>
               </Box>
               <Box sx={{ flex: 1, p: 0.6, borderRadius: "6px", bgcolor: "#f8fafc", border: "1px solid #f1f5f9" }}>
                 <Typography sx={{ fontSize: "0.6rem", fontWeight: 800 }}>E-Way</Typography>
                 <Typography sx={{ fontSize: "0.6rem", color: "#0284c7", fontWeight: 700, mt: 0.3 }}>128</Typography>
               </Box>
             </Box>
           </Box>
           <Box sx={{ display: "flex", gap: 0.8, mt: 1 }}>
             <Box sx={{ flex: 1, p: 0.6, borderRadius: "6px", bgcolor: "#f8fafc", border: "1px solid #f1f5f9" }}><Typography sx={{ fontSize: "0.55rem", color: "#64748b" }}>ITC</Typography><Typography sx={{ fontSize: "0.7rem", fontWeight: 800, mt: 0.2 }}>₹ 24,780</Typography></Box>
             <Box sx={{ flex: 1, p: 0.6, borderRadius: "6px", bgcolor: "#f8fafc", border: "1px solid #f1f5f9" }}><Typography sx={{ fontSize: "0.55rem", color: "#64748b" }}>Payable</Typography><Typography sx={{ fontSize: "0.7rem", fontWeight: 800, mt: 0.2 }}>₹ 7,640</Typography></Box>
           </Box>
         </Box>
       </Grid>

       {/* 7. EXPENSE MANAGEMENT */}
       <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex" }}>
         <Box sx={{ bgcolor: "#fff", p: 1.5, borderRadius: "12px", border: "1px solid #e2e8f0", width: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 2px 10px rgba(15,23,42,0.03)" }}>
           <Box>
             <Box sx={{ display: "flex", gap: 1.2, mb: 1.2 }}>
               <Box sx={{ width: 30, height: 30, borderRadius: "6px", bgcolor: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                 <AccountBalanceWalletIcon sx={{ color: "#4f46e5", fontSize: "0.95rem" }} />
               </Box>
               <Box>
                 <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "#0f172a" }}>Expense Management</Typography>
                 <Typography sx={{ fontSize: "0.7rem", color: "#64748b" }}>Track expenses & costs.</Typography>
               </Box>
             </Box>
             <Box sx={{ display: "flex", gap: 0.8 }}>
               <Box sx={{ flex: 1, p: 0.6, borderRadius: "6px", bgcolor: "#f8fafc", border: "1px solid #f1f5f9" }}><Typography sx={{ fontSize: "0.55rem", color: "#64748b" }}>Today</Typography><Typography sx={{ fontSize: "0.75rem", fontWeight: 800 }}>₹ 2,350</Typography></Box>
               <Box sx={{ flex: 1, p: 0.6, borderRadius: "6px", bgcolor: "#f8fafc", border: "1px solid #f1f5f9" }}><Typography sx={{ fontSize: "0.55rem", color: "#64748b" }}>This Month</Typography><Typography sx={{ fontSize: "0.75rem", fontWeight: 800 }}>₹ 28k</Typography></Box>
             </Box>
           </Box>
           <Box sx={{ p: 0.8, borderRadius: "6px", bgcolor: "#f8fafc", border: "1px solid #f1f5f9", mt: 1 }}>
             <Typography sx={{ fontSize: "0.6rem", color: "#64748b", fontWeight: 600, mb: 0.5 }}>Top Categories</Typography>
             <Stack spacing={0.5}>
               {[
                 { label: "Rent", pct: 42, amt: "₹ 12k", color: "#2563eb" },
                 { label: "Utilities", pct: 22, amt: "₹ 6k", color: "#3b82f6" },
               ].map((c) => (
                 <Box key={c.label}>
                   <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.1 }}>
                     <Typography sx={{ fontSize: "0.55rem", color: "#64748b" }}>{c.label}</Typography>
                     <Typography sx={{ fontSize: "0.55rem", fontWeight: 700 }}>{c.amt} ({c.pct}%)</Typography>
                   </Box>
                   <Box sx={{ height: 3, borderRadius: "999px", bgcolor: "#e2e8f0" }}>
                     <Box sx={{ height: "100%", width: `${c.pct}%`, borderRadius: "999px", bgcolor: c.color }} />
                   </Box>
                 </Box>
               ))}
             </Stack>
           </Box>
         </Box>
       </Grid>

       {/* 8. PURCHASE MANAGEMENT */}
       <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex" }}>
         <Box sx={{ bgcolor: "#fff", p: 1.5, borderRadius: "12px", border: "1px solid #e2e8f0", width: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 2px 10px rgba(15,23,42,0.03)" }}>
           <Box>
             <Box sx={{ display: "flex", gap: 1.2, mb: 1.2 }}>
               <Box sx={{ width: 30, height: 30, borderRadius: "6px", bgcolor: "#f3e8ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                 <ShoppingBagIcon sx={{ color: "#9333ea", fontSize: "0.95rem" }} />
               </Box>
               <Box>
                 <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "#0f172a" }}>Purchase Management</Typography>
                 <Typography sx={{ fontSize: "0.7rem", color: "#64748b" }}>Manage suppliers & orders.</Typography>
               </Box>
             </Box>
             <Box sx={{ display: "flex", gap: 0.8 }}>
               <Box sx={{ flex: 1.2, p: 0.6, borderRadius: "6px", bgcolor: "#f8fafc", border: "1px solid #f1f5f9" }}><Typography sx={{ fontSize: "0.55rem", color: "#64748b" }}>Total Purchases</Typography><Typography sx={{ fontSize: "0.75rem", fontWeight: 800 }}>₹ 1.25L</Typography></Box>
               <Box sx={{ flex: 0.8, p: 0.6, borderRadius: "6px", bgcolor: "#f8fafc", border: "1px solid #f1f5f9" }}><Typography sx={{ fontSize: "0.55rem", color: "#64748b" }}>Orders</Typography><Typography sx={{ fontSize: "0.75rem", fontWeight: 800 }}>12</Typography></Box>
               <Box sx={{ flex: 0.9, p: 0.6, borderRadius: "6px", bgcolor: "#f8fafc", border: "1px solid #f1f5f9" }}><Typography sx={{ fontSize: "0.55rem", color: "#64748b" }}>Pending</Typography><Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#d97706" }}>5</Typography></Box>
             </Box>
           </Box>
           <Box sx={{ p: 0.8, borderRadius: "6px", bgcolor: "#f8fafc", border: "1px solid #f1f5f9", mt: 1 }}>
             <Typography sx={{ fontSize: "0.6rem", color: "#64748b", fontWeight: 600, mb: 0.5 }}>Recent Purchase Orders</Typography>
             <Stack spacing={0.4}>
               {[
                 { po: "PO-0012", name: "M/s Reliable Traders", amt: "₹ 25k", status: "Pending", color: "#d97706" },
                 { po: "PO-0011", name: "Global Supplies", amt: "₹ 40k", status: "Received", color: "#16a34a" },
               ].map((r) => (
                 <Box key={r.po} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                   <Box>
                     <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: "#0f172a" }}>{r.po}</Typography>
                   </Box>
                   <Box sx={{ textAlign: "right" }}>
                     <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: "#0f172a" }}>{r.amt} <Box component="span" sx={{ fontSize: "0.55rem", fontWeight: 700, color: r.color }}>({r.status})</Box></Typography>
                   </Box>
                 </Box>
               ))}
             </Stack>
           </Box>
         </Box>
       </Grid>
       {/* 9. REPORTS & ANALYTICS */}
       <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex" }}>
         <Box sx={{ bgcolor: "#fff", p: 1.5, borderRadius: "12px", border: "1px solid #e2e8f0", width: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 2px 10px rgba(15,23,42,0.03)" }}>
           <Box>
             <Box sx={{ display: "flex", gap: 1.2, mb: 1.2 }}>
               <Box sx={{ width: 30, height: 30, borderRadius: "6px", bgcolor: "#fce7f3", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                 <BarChartIcon sx={{ color: "#db2777", fontSize: "0.95rem" }} />
               </Box>
               <Box>
                 <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "#0f172a" }}>Reports & Analytics</Typography>
                 <Typography sx={{ fontSize: "0.7rem", color: "#64748b" }}>Gain insights to scale faster.</Typography>
               </Box>
             </Box>
             <Box sx={{ display: "flex", gap: 0.8 }}>
               <Box sx={{ flex: 1, p: 0.6, borderRadius: "6px", bgcolor: "#f8fafc", border: "1px solid #f1f5f9" }}><Typography sx={{ fontSize: "0.55rem", color: "#64748b" }}>Total Reports</Typography><Typography sx={{ fontSize: "0.75rem", fontWeight: 800 }}>34</Typography></Box>
               <Box sx={{ flex: 1, p: 0.6, borderRadius: "6px", bgcolor: "#f8fafc", border: "1px solid #f1f5f9" }}><Typography sx={{ fontSize: "0.55rem", color: "#64748b" }}>Exported</Typography><Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#db2777" }}>18</Typography></Box>
             </Box>
           </Box>
           <Box sx={{ p: 0.8, borderRadius: "6px", bgcolor: "#f8fafc", border: "1px solid #f1f5f9", mt: 1 }}>
             <Typography sx={{ fontSize: "0.6rem", color: "#64748b", fontWeight: 600, mb: 0.5 }}>Quick Export Formats</Typography>
             <Stack spacing={0.4}>
               <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><Typography sx={{ fontSize: "0.6rem", fontWeight: 700 }}>Sales Summary</Typography><Typography sx={{ fontSize: "0.55rem", color: "#db2777", fontWeight: 700 }}>PDF / Excel</Typography></Box>
               <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><Typography sx={{ fontSize: "0.6rem", fontWeight: 700 }}>GST Tax Report</Typography><Typography sx={{ fontSize: "0.55rem", color: "#db2777", fontWeight: 700 }}>JSON / CSV</Typography></Box>
             </Stack>
           </Box>
         </Box>
       </Grid>

     </Grid>
   </Container>
</Box>
 
        {/* ── MODULE SUITE ─────────────────────────────────────────────────── */}
        {/* <Box sx={{ bgcolor: LIGHT, py: SPY, px: SX, position: "relative", overflow: "hidden" }}>
          <Box
            component="svg"
            viewBox="0 0 1200 520"
            preserveAspectRatio="none"
            aria-hidden="true"
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 0,
              display: { xs: "none", md: "block" },
            }}
          >
            <path
              d="M760 54 C850 16 948 20 1032 58 C1112 94 1160 154 1210 132"
              fill="none"
              stroke={alpha(PRIMARY, 0.12)}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M746 96 C842 58 946 58 1034 96 C1114 130 1160 184 1212 166"
              fill="none"
              stroke={alpha(PRIMARY, 0.09)}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M-40 418 C92 358 182 462 304 404 C388 364 420 294 520 316"
              fill="none"
              stroke={alpha(PRIMARY, 0.10)}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <g opacity="0.5">
              {Array.from({ length: 7 }).map((_, row) =>
                Array.from({ length: 9 }).map((__, col) => (
                  <circle
                    key={`${row}-${col}`}
                    cx={954 + col * 24}
                    cy={276 + row * 22}
                    r="2"
                    fill={alpha(PRIMARY, 0.18)}
                  />
                ))
              )}
            </g>
          </Box>
          <Box
            sx={{
              position: "absolute",
              right: { md: 48 },
              top: { md: 54 },
              width: 180,
              height: 180,
              borderRadius: "50%",
              border: `1px dashed ${alpha(PRIMARY, 0.14)}`,
              pointerEvents: "none",
              zIndex: 0,
              display: { xs: "none", md: "block" },
            }}
          />
          <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
            <Box textAlign="center" mb={HMB}>
              <Typography sx={{ color: PRIMARY, fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.18em", textTransform: "uppercase", mb: 1 }}>
                ONE PLATFORM · EVERY MODULE
              </Typography>
              <Typography sx={{ fontSize: { xs: "1.8rem", md: "2.4rem" }, fontWeight: 800, color: DARK, letterSpacing: "-0.025em", mb: 1.5 }}>
                Everything Your Business Runs On
              </Typography>
              <Typography sx={{ fontSize: "1rem", color: GRAY, maxWidth: 540, mx: "auto", lineHeight: 1.7 }}>
                Twelve powerful modules working together — no add-ons, no extra logins, no juggling apps.
              </Typography>
            </Box>

            <Box sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" },
              gap: { xs: 2, md: 2.5 },
            }}>
              {modules.map((m) => (
                <Box key={m.title} sx={{
                  position: "relative",
                  overflow: "hidden",
                  bgcolor: "#fff",
                  border: `1px solid ${alpha(m.color, 0.18)}`,
                  borderRadius: "18px",
                  p: { xs: 2.4, md: 2.6 },
                  transition: "all 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 310,
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    background: `linear-gradient(145deg, ${alpha(m.color, 0.08)} 0%, transparent 46%)`,
                    opacity: 0.9,
                    pointerEvents: "none",
                  },
                  "&:hover": { borderColor: alpha(m.color, 0.5), boxShadow: `0 16px 36px ${alpha(m.color, 0.14)}`, transform: "translateY(-3px)" },
                }}>
                  <Box sx={{ position: "relative", zIndex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1.8 }}>
                    <Box sx={{
                      width: { xs: 78, md: 86 },
                      height: { xs: 78, md: 86 },
                      borderRadius: "16px",
                      flexShrink: 0,
                      bgcolor: "#fff",
                      border: `1px solid ${alpha(m.color, 0.18)}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      boxShadow: `0 10px 24px ${alpha(m.color, 0.12)}`,
                    }}>
                      {m.img
                        ? <Box component="img" src={m.img} alt={m.title} sx={{ width: "88%", height: "88%", objectFit: "contain", mixBlendMode: "multiply" }} />
                        : React.cloneElement(m.icon, { sx: { fontSize: 42, color: m.color } })}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 900, fontSize: { xs: "1.08rem", md: "1.18rem" }, color: DARK, lineHeight: 1.2, mb: 0.8 }}>
                        {m.title}
                      </Typography>
                      <Box sx={{ width: 44, height: 3, borderRadius: "999px", bgcolor: m.color }} />
                    </Box>
                  </Box>

                  <Typography sx={{ fontSize: "0.9rem", color: GRAY, lineHeight: 1.6, mb: 2.2 }}>
                    {m.desc}
                  </Typography>

                  <Divider sx={{ borderColor: alpha(m.color, 0.16), mb: 1.7 }} /> */}

                  {/* Explanation points */}
                  {/* <Stack spacing={0.9}>
                    {m.points.slice(0, 3).map((pt) => (
                      <Box key={pt} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                        <CheckCircleIcon sx={{ fontSize: 15, color: m.color, flexShrink: 0, mt: "2px" }} />
                        <Typography sx={{ fontSize: "0.8rem", color: "#374151", lineHeight: 1.45 }}>{pt}</Typography>
                      </Box>
                    ))}
                  </Stack>
                  </Box>
                </Box>
              ))}
            </Box>
          </Container>
        </Box> */}

{/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
<Box sx={{ bgcolor: "#fff", py: { xs: 1.5, md: 2 }, px: SX, position: "relative", overflow: "hidden" }}>
  
  <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
    <Box textAlign="center" mb={{ xs: 1, md: 1.4 }}>
      <Typography sx={{ color: PRIMARY, fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", mb: 0.2 }}>
        HOW IT WORKS
      </Typography>
      <Typography sx={{ fontSize: { xs: "1.3rem", md: "1.75rem" }, fontWeight: 800, color: DARK, letterSpacing: "-0.025em", mb: 0.4 }}>
        Up and Running in 3 Simple Steps
      </Typography>
      <Typography sx={{ fontSize: "0.8rem", color: GRAY, maxWidth: 460, mx: "auto", lineHeight: 1.35 }}>
        No complicated setup. Sign up and start billing in minutes.
      </Typography>
    </Box>

    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: { xs: 1.2, md: 1.6 }, alignItems: "stretch" }}>
      {steps.map((step, i) => (
        <Box key={step.number} sx={{ position: "relative", height: "100%" }}>
          {i < steps.length - 1 && (
            <Box sx={{
              display: { xs: "none", md: "block" },
              position: "absolute", top: 32, left: "calc(50% + 38px)",
              width: "100%", height: "2px",
              background: `linear-gradient(90deg, ${alpha(PRIMARY, 0.2)} 0%, ${alpha(PRIMARY, 0.05)} 70%, transparent 100%)`,
              zIndex: 0,
            }} />
          )}
          <Box sx={{
            position: "relative",
            zIndex: 1,
            height: "100%",
            p: { xs: 1.5, md: 1.7 },
            borderRadius: "12px",
            bgcolor: "#fff",
            border: `1px solid ${alpha(PRIMARY, 0.12)}`,
            boxShadow: "0 4px 16px rgba(15,23,42,0.04)",
            transition: "all 0.2s",
            "&:hover": { transform: "translateY(-2px)", boxShadow: `0 8px 22px ${alpha(PRIMARY, 0.10)}`, borderColor: alpha(PRIMARY, 0.25) },
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 1 }}>
              <Box sx={{
                width: 38,
                height: 38,
                bgcolor: PRIMARY_LIGHT,
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${alpha(PRIMARY, 0.18)}`,
                boxShadow: `0 4px 12px ${alpha(PRIMARY, 0.12)}`,
                flexShrink: 0,
              }}>
                {step.icon}
              </Box>
              <Typography sx={{ fontSize: "1.8rem", fontWeight: 900, color: alpha(DARK, 0.10), letterSpacing: "-0.06em", lineHeight: 1 }}>
                {step.number}
              </Typography>
            </Box>
            <Typography sx={{ fontWeight: 850, fontSize: "0.88rem", color: DARK, mb: 0.3, lineHeight: 1.2 }}>{step.title}</Typography>
            <Typography sx={{ fontSize: "0.74rem", color: GRAY, lineHeight: 1.35, mb: 1 }}>{step.desc}</Typography>
            <Stack direction="row" flexWrap="wrap" gap={0.4}>
              {step.tags.map((tag) => (
                <Box key={tag} sx={{
                  bgcolor: alpha(PRIMARY, 0.035), color: "#374151",
                  px: 0.9, py: 0.2, borderRadius: "4px",
                  fontSize: "0.62rem", fontWeight: 700, border: `1px solid ${alpha(PRIMARY, 0.11)}`,
                }}>
                  {tag}
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
      ))}
    </Box>

    <Box textAlign="center" mt={{ xs: 1.5, md: 2 }}>
      <Button variant="contained" size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate("/signup")} sx={{
        bgcolor: PRIMARY, color: "#fff", px: 2.8, py: 0.8, borderRadius: "8px",
        fontSize: "0.85rem", fontWeight: 700,
        boxShadow: `0 4px 12px ${alpha(PRIMARY, 0.35)}`,
        "&:hover": { bgcolor: PRIMARY_DARK },
      }}>
        Start Free — No Credit Card Needed
      </Button>
      <Typography sx={{ fontSize: "0.68rem", color: GRAY, mt: 0.5 }}>
        14-day free trial · Full access · Cancel anytime
      </Typography>
    </Box>
  </Container>
</Box>

{/* ── WHO IS IT FOR ─────────────────────────────────────────────────── */}
<Box sx={{ bgcolor: LIGHT, py: { xs: 1.5, md: 2 }, px: SX, position: "relative", overflow: "hidden" }}>
  <Container maxWidth="lg">
    <Box textAlign="center" mb={{ xs: 1.2, md: 1.5 }}>
      <Typography sx={{ color: PRIMARY, fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", mb: 0.2 }}>
        BUILT FOR EVERY BUSINESS
      </Typography>
      <Typography sx={{ fontSize: { xs: "1.3rem", md: "1.75rem" }, fontWeight: 800, color: DARK, letterSpacing: "-0.025em" }}>
        Zodu Works for Your Industry
      </Typography>
    </Box>
    <Box sx={{
      display: "grid",
      gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(5, 1fr)" },
      gap: { xs: 0.8, md: 1 },
    }}>
      {businessTypes.map((biz) => (
        <Box key={biz.title} sx={{
          bgcolor: "#fff",
          border: `1px solid ${alpha(PRIMARY, 0.12)}`,
          borderRadius: "10px",
          p: { xs: 1.2, md: 1 },
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.2s",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background: `linear-gradient(145deg, ${alpha(PRIMARY, 0.06)}, transparent 52%)`,
            opacity: 0,
            transition: "opacity 0.2s",
          },
          "&:hover": { borderColor: alpha(PRIMARY, 0.35), boxShadow: `0 4px 14px ${alpha(PRIMARY, 0.10)}`, transform: "translateY(-2px)" },
          "&:hover::before": { opacity: 1 },
        }}>
          <Box sx={{
            position: "relative",
            zIndex: 1,
            width: 32,
            height: 32,
            mx: "auto",
            mb: 0.5,
            borderRadius: "8px",
            bgcolor: PRIMARY_LIGHT,
            border: `1px solid ${alpha(PRIMARY, 0.14)}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <biz.icon sx={{ fontSize: "1.1rem", color: PRIMARY }} />
          </Box>
          <Typography sx={{ position: "relative", zIndex: 1, fontWeight: 800, fontSize: "0.75rem", color: DARK, mb: 0.15, lineHeight: 1.15 }}>{biz.title}</Typography>
          <Typography sx={{ position: "relative", zIndex: 1, fontSize: "0.6rem", color: GRAY, lineHeight: 1.25 }}>{biz.desc}</Typography>
        </Box>
      ))}
    </Box>
  </Container>
</Box>

        {/* ── PRICING ──────────────────────────────────────────────────────── */}
        <Box sx={{ bgcolor: "#fff", py: SPY, px: SX, position: "relative", overflow: "hidden" }}>
          <Box
            component="svg"
            viewBox="0 0 1200 640"
            preserveAspectRatio="none"
            aria-hidden="true"
            sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", display: { xs: "none", md: "block" } }}
          >
            <path d="M810 44 C942 104 1002 16 1200 82 L1200 0 L810 0 Z" fill={alpha(PRIMARY, 0.045)} />
            <path d="M-80 580 C110 486 238 630 416 534 C514 482 600 492 710 552" fill="none" stroke={alpha(PRIMARY, 0.09)} strokeWidth="3" strokeLinecap="round" />
          </Box>
          <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
            <Box textAlign="center" mb={HMB}>
              <Typography sx={{ color: PRIMARY, fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.18em", textTransform: "uppercase", mb: 1 }}>
                SIMPLE, TRANSPARENT PRICING
              </Typography>
              <Typography sx={{ fontSize: { xs: "1.8rem", md: "2.4rem" }, fontWeight: 800, color: DARK, letterSpacing: "-0.025em", mb: 1.5 }}>
                Choose What Works for Your Business
              </Typography>
              <Typography sx={{ fontSize: "1rem", color: GRAY, maxWidth: 440, mx: "auto", lineHeight: 1.7, mb: 3 }}>
                No hidden charges. No setup fees. Start free for 14 days.
              </Typography>
              <Box sx={{ display: "inline-flex", alignItems: "center", bgcolor: LIGHT, borderRadius: "12px", p: 0.5, gap: 0.5, border: `1px solid ${BORDER}`, boxShadow: "0 8px 20px rgba(15,23,42,0.04)" }}>
                {(["monthly", "yearly"] as const).map((type) => (
                  <Button key={type} onClick={() => setBilling(type)} sx={{
                    px: 2.5, py: 0.8, borderRadius: "8px", fontSize: "0.85rem", fontWeight: 600,
                    textTransform: "capitalize",
                    bgcolor: billing === type ? "#fff" : "transparent",
                    color: billing === type ? DARK : GRAY,
                    boxShadow: billing === type ? "0 1px 6px rgba(0,0,0,0.08)" : "none",
                    "&:hover": { bgcolor: billing === type ? "#fff" : BORDER },
                  }}>
                    {type === "monthly" ? "Monthly" : (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
                        Yearly
                        <Box component="span" sx={{ bgcolor: "#dcfce7", color: "#16a34a", fontSize: "0.6rem", fontWeight: 800, px: 0.8, py: 0.2, borderRadius: "4px" }}>
                          SAVE 20%
                        </Box>
                      </Box>
                    )}
                  </Button>
                ))}
              </Box>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 2.5, alignItems: "stretch" }}>
              {plans.map((plan) => (
                <Box key={plan.name} sx={{
                  border: plan.popular ? `2px solid ${PRIMARY}` : `1px solid ${BORDER}`,
                  borderRadius: "22px",
                  p: { xs: 3, md: 3.2 },
                  position: "relative",
                  overflow: "hidden",
                  transform: plan.popular ? { md: "scale(1.03)" } : "none",
                  boxShadow: plan.popular ? `0 18px 54px ${alpha(PRIMARY, 0.15)}` : "0 10px 28px rgba(15,23,42,0.06)",
                  bgcolor: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    background: plan.popular
                      ? `linear-gradient(145deg, ${alpha(PRIMARY, 0.09)} 0%, transparent 42%)`
                      : "linear-gradient(145deg, rgba(15,23,42,0.025) 0%, transparent 42%)",
                    pointerEvents: "none",
                  },
                }}>
                  <Box sx={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1 }}>
                  {plan.popular && (
                    <Box sx={{
                      position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
                      bgcolor: PRIMARY, color: "#fff", fontSize: "0.65rem", fontWeight: 800,
                      px: 2, py: 0.5, borderRadius: "999px", letterSpacing: "0.1em", whiteSpace: "nowrap",
                    }}>
                      MOST POPULAR
                    </Box>
                  )}
                  <Typography sx={{ fontWeight: 850, fontSize: "1.2rem", color: DARK, mb: 0.4 }}>{plan.name}</Typography>
                  <Typography sx={{ fontSize: "0.83rem", color: GRAY, mb: 2.5 }}>{plan.tagline}</Typography>
                  {plan.monthly !== "Custom" ? (
                    <Box mb={3}>
                      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
                        <Typography sx={{ fontSize: "2.5rem", fontWeight: 900, color: DARK, letterSpacing: "-0.03em" }}>
                          {billing === "monthly" ? plan.monthly : plan.yearly}
                        </Typography>
                        <Typography sx={{ fontSize: "0.85rem", color: GRAY }}>/month</Typography>
                      </Box>
                      {billing === "yearly" && (
                        <Typography sx={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 600 }}>Billed annually · Save 20%</Typography>
                      )}
                    </Box>
                  ) : (
                    <Box mb={3}>
                      <Typography sx={{ fontSize: "1.8rem", fontWeight: 900, color: DARK, mb: 0.4 }}>Custom</Typography>
                      <Typography sx={{ fontSize: "0.8rem", color: GRAY }}>Tailored to your business size</Typography>
                    </Box>
                  )}
                  <Stack spacing={1.2} mb={3} sx={{ flex: 1 }}>
                    {plan.items.map((item) => (
                      <Box key={item} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CheckCircleIcon sx={{ fontSize: 15, color: plan.popular ? PRIMARY : "#16a34a", flexShrink: 0 }} />
                        <Typography sx={{ fontSize: "0.85rem", color: "#374151" }}>{item}</Typography>
                      </Box>
                    ))}
                  </Stack>
                  <Button fullWidth variant={plan.popular ? "contained" : "outlined"} onClick={() => navigate(plan.cta === "Talk to Sales" ? "/" : "/signup")} sx={{
                    py: 1.2, borderRadius: "10px", fontWeight: 700, fontSize: "0.9rem",
                    ...(plan.popular
                      ? { bgcolor: PRIMARY, color: "#fff", "&:hover": { bgcolor: PRIMARY_DARK } }
                      : { borderColor: plan.name === "Enterprise" ? PRIMARY : BORDER, color: plan.name === "Enterprise" ? PRIMARY : DARK, "&:hover": { borderColor: PRIMARY, bgcolor: alpha(PRIMARY, 0.04) } }),
                  }}>
                    {plan.cta}
                  </Button>
                  </Box>
                </Box>
              ))}
            </Box>

            <Box textAlign="center" mt={4}>
              <Typography sx={{ fontSize: "0.83rem", color: GRAY }}>
                All plans include a <Box component="span" sx={{ fontWeight: 700, color: DARK }}>14-day free trial</Box> · No credit card required · Cancel anytime
              </Typography>
            </Box>
          </Container>
        </Box>

        {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
        {/* <Box sx={{ bgcolor: LIGHT, py: SPY, px: SX }}>
          <Container maxWidth="lg">
            <Box textAlign="center" mb={HMB}>
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
        </Box> */}

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
     {/* <Box sx={{ bgcolor: "#fff", py: SPY, px: SX }}>   
          <Container maxWidth="lg">
            <Box textAlign="center" mb={HMB}>
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
        </Box> */}

        {/* ── GET THE APP ──────────────────────────────────────────────────── */}
        <Box sx={{ py: { xs: 3, md: 4 }, px: SX, bgcolor: LIGHT, fontFamily: POPPINS }}>
          {/* Hidden gradient def for the Google Play triangle */}
          <Box component="svg" width="0" height="0" sx={{ position: "absolute" }}>
            <defs>
              <linearGradient id="gplay" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#00C3FF" />
                <stop offset="38%" stopColor="#22D36B" />
                <stop offset="68%" stopColor="#FFCE00" />
                <stop offset="100%" stopColor="#FF3D3D" />
              </linearGradient>
            </defs>
          </Box>

          <Container maxWidth="lg" disableGutters>
            <Box sx={{
              borderRadius: { xs: "20px", md: "26px" },
              minHeight: { md: 430 },
              position: "relative", overflow: "hidden",
              backgroundImage: `linear-gradient(135deg, #FFFFFF 0%, #FFF7F7 48%, #FEECEC 100%)`,
              border: "2px solid rgba(255,255,255,0.9)",
              boxShadow: "0 14px 42px rgba(15,23,42,0.09)",
            }}>
              {/* Red wave shape behind the illustration */}
              <Box
                component="svg"
                viewBox="0 0 1000 720"
                preserveAspectRatio="none"
                sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0, display: { xs: "none", md: "block" } }}
              >
                <defs>
                  <linearGradient id="appwave" x1="0" y1="0" x2="0.5" y2="1">
                    <stop offset="0%" stopColor="#F35858" />
                    <stop offset="100%" stopColor="#E02424" />
                  </linearGradient>
                </defs>
                {/* lighter coral underlay — peeks as a rim on the wave edge + lower sweep */}
                <path d="M1000 46 C900 150 790 164 690 168 C540 174 480 266 470 390 C462 500 370 600 240 720 L1000 720 Z" fill={alpha(APP_RED, 0.44)} />
                {/* main red wave — right blob sweeping across the bottom */}
                <path d="M1000 72 C888 172 788 176 678 184 C540 196 492 290 502 402 C512 536 398 628 310 720 L1000 720 Z" fill="url(#appwave)" />
              </Box>

              {/* Faint concentric rings behind the phone */}
              {[420, 320, 220].map((d) => (
                <Box key={d} sx={{
                  position: "absolute", top: "30%", right: "24%",
                  width: d * 0.7, height: d * 0.7, mt: `${-(d * 0.7) / 2}px`, mr: `${-(d * 0.7) / 2}px`,
                  borderRadius: "50%", border: `1.5px solid ${alpha(APP_RED, 0.12)}`,
                  zIndex: 0, display: { xs: "none", md: "block" }, pointerEvents: "none",
                }} />
              ))}

              {/* Decorative dot patterns */}
              <Box sx={{
                position: "absolute", top: 22, right: 28, width: 100, height: 70, opacity: 0.5, zIndex: 0,
                backgroundImage: `radial-gradient(${alpha(APP_RED, 0.5)} 1.6px, transparent 1.6px)`,
                backgroundSize: "16px 16px", display: { xs: "none", md: "block" },
              }} />
              <Box sx={{
                position: "absolute", bottom: 20, left: 22, width: 76, height: 62, opacity: 0.4, zIndex: 0,
                backgroundImage: `radial-gradient(${alpha(APP_RED, 0.45)} 1.6px, transparent 1.6px)`,
                backgroundSize: "16px 16px", display: { xs: "none", md: "block" },
              }} />

              <Box sx={{
                display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: "center",
                gap: { xs: 3, md: 1.5 }, position: "relative", zIndex: 1,
                p: { xs: 2.5, md: 4 },
                minHeight: { md: 430 },
              }}>
                {/* LEFT — copy */}
                <Box sx={{ flex: { md: "0 0 48%" }, width: "100%", textAlign: { xs: "center", md: "left" } }}>
                  {/* Eyebrow badge */}
                  <Box sx={{
                    display: "inline-flex", alignItems: "center", gap: 1.2,
                    bgcolor: alpha(APP_RED, 0.10), borderRadius: "999px", pl: 0.5, pr: 1.6, py: 0.45, mb: { xs: 2, md: 2 },
                  }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: "8px", bgcolor: APP_RED, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <SmartphoneIcon sx={{ fontSize: 18, color: "#fff" }} />
                    </Box>
                    <Typography sx={{ fontFamily: POPPINS, fontWeight: 800, fontSize: { xs: "0.7rem", md: "0.78rem" }, letterSpacing: "0.14em", color: APP_RED }}>
                      ZODU MOBILE APP
                    </Typography>
                  </Box>

                  {/* Heading */}
                  <Typography sx={{ fontFamily: POPPINS, fontSize: { xs: "1.9rem", md: "2.75rem" }, fontWeight: 800, color: APP_NAVY, lineHeight: 1.1, letterSpacing: "-0.02em", mb: { xs: 1.5, md: 1.8 } }}>
                    Your Whole Business,<br />
                    In Your{" "}
                    <Box component="span" sx={{
                      color: APP_RED, position: "relative", display: "inline-block",
                      "&::after": { content: '""', position: "absolute", left: "4%", right: "2%", bottom: { xs: -5, md: -7 }, height: { xs: 3, md: 4 }, borderRadius: "999px", bgcolor: APP_RED, opacity: 0.85, transform: "rotate(-2deg)" },
                    }}>
                      Pocket
                    </Box>
                  </Typography>

                  {/* Subtext */}
                  <Typography sx={{ fontFamily: POPPINS, fontSize: { xs: "0.86rem", md: "0.98rem" }, color: APP_SLATE, lineHeight: 1.6, mb: { xs: 2.2, md: 2.4 }, maxWidth: 500, mx: { xs: "auto", md: 0 } }}>
                    Bill customers, track stock, check live reports and get instant alerts — anytime, anywhere. Free on iOS &amp; Android.
                  </Typography>

                  {/* Bullets */}
                  {/* <Stack spacing={1} mb={2.5} sx={{ alignItems: { xs: "center", md: "flex-start" } }}>
                    {["Real-time sales & low-stock alerts", "Manage every branch on the move", "Works offline — syncs automatically"].map((t) => (
                      <Box key={t} sx={{ display: "flex", alignItems: "center", gap: 1.3 }}>
                        <CheckCircleIcon sx={{ fontSize: 22, color: APP_RED }} />
                        <Typography sx={{ fontFamily: POPPINS, fontSize: "0.95rem", color: APP_NAVY, fontWeight: 500 }}>{t}</Typography>
                      </Box>
                    ))}
                  </Stack> */}

                  {/* Store badges + QR code */}
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={{ xs: 2.4, md: 2.6 }} sx={{ justifyContent: { xs: "center", md: "flex-start" }, alignItems: { xs: "stretch", sm: "center" } }}>
                    {/* Buttons column */}
                    <Stack spacing={1.4} sx={{ flex: { sm: "0 0 auto" } }}>
                      {/* Google Play — dark */}
                      <Box component="a" href="#" sx={{
                        display: "inline-flex", alignItems: "center", gap: 1.4, textDecoration: "none",
                        bgcolor: "#000", color: "#fff",
                        px: { xs: 2.2, md: 2.4 }, py: { xs: 1.05, md: 1.08 },
                        borderRadius: "10px", border: "1px solid rgba(255,255,255,0.25)",
                        minWidth: { xs: "100%", sm: 192, md: 200 },
                        boxShadow: "0 6px 18px rgba(0,0,0,0.22)", transition: "all 0.18s",
                        "&:hover": { transform: "translateY(-2px)", boxShadow: "0 10px 26px rgba(0,0,0,0.3)" },
                      }}>
                        <Box component="img" src={gPlayLogo} alt="Google Play" sx={{ width: 28, height: 28, objectFit: "contain", flexShrink: 0 }} />
                        <Box sx={{ textAlign: "left", lineHeight: 1 }}>
                          <Typography sx={{ fontFamily: POPPINS, fontSize: "0.58rem", color: "rgba(255,255,255,0.8)", letterSpacing: "0.04em" }}>GET IT ON</Typography>
                          <Typography sx={{ fontFamily: POPPINS, fontSize: "1.05rem", fontWeight: 700, mt: "2px", color: "#fff" }}>Google Play</Typography>
                        </Box>
                      </Box>
                      {/* App Store — dark */}
                      <Box component="a" href="#" sx={{
                        display: "inline-flex", alignItems: "center", gap: 1.4, textDecoration: "none",
                        bgcolor: "#000", color: "#fff",
                        px: { xs: 2.2, md: 2.4 }, py: { xs: 1.05, md: 1.08 },
                        borderRadius: "10px", border: "1px solid rgba(255,255,255,0.25)",
                        minWidth: { xs: "100%", sm: 192, md: 200 },
                        boxShadow: "0 6px 18px rgba(0,0,0,0.22)", transition: "all 0.18s",
                        "&:hover": { transform: "translateY(-2px)", boxShadow: "0 10px 26px rgba(0,0,0,0.3)" },
                      }}>
                        <AppleIcon sx={{ fontSize: 30, color: "#fff", flexShrink: 0 }} />
                        <Box sx={{ textAlign: "left", lineHeight: 1 }}>
                          <Typography sx={{ fontFamily: POPPINS, fontSize: "0.58rem", color: "rgba(255,255,255,0.8)", letterSpacing: "0.04em" }}>Download on the</Typography>
                          <Typography sx={{ fontFamily: POPPINS, fontSize: "1.05rem", fontWeight: 700, mt: "2px", color: "#fff" }}>App Store</Typography>
                        </Box>
                      </Box>
                    </Stack>

                    {/* QR code — desktop only */}
                    <Box sx={{
                      display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 1.5,
                      bgcolor: "#fff", borderRadius: "14px", border: `1px solid ${BORDER}`,
                      boxShadow: "0 6px 20px rgba(0,0,0,0.08)", p: 1.5,
                    }}>
                      {/* QR code SVG placeholder */}
                      <Box sx={{ width: 82, height: 82, flexShrink: 0, bgcolor: "#fff", borderRadius: "8px", overflow: "hidden", p: "4px" }}>
                        <Box component="svg" viewBox="0 0 21 21" width="74" height="74" sx={{ display: "block" }}>
                          {/* Top-left finder */}
                          <rect x="0" y="0" width="7" height="7" fill="#111" rx="0.5"/>
                          <rect x="1" y="1" width="5" height="5" fill="#fff"/>
                          <rect x="2" y="2" width="3" height="3" fill="#111"/>
                          {/* Top-right finder */}
                          <rect x="14" y="0" width="7" height="7" fill="#111" rx="0.5"/>
                          <rect x="15" y="1" width="5" height="5" fill="#fff"/>
                          <rect x="16" y="2" width="3" height="3" fill="#111"/>
                          {/* Bottom-left finder */}
                          <rect x="0" y="14" width="7" height="7" fill="#111" rx="0.5"/>
                          <rect x="1" y="15" width="5" height="5" fill="#fff"/>
                          <rect x="2" y="16" width="3" height="3" fill="#111"/>
                          {/* Timing patterns */}
                          <rect x="8" y="6" width="1" height="1" fill="#111"/><rect x="10" y="6" width="1" height="1" fill="#111"/><rect x="12" y="6" width="1" height="1" fill="#111"/>
                          <rect x="6" y="8" width="1" height="1" fill="#111"/><rect x="6" y="10" width="1" height="1" fill="#111"/><rect x="6" y="12" width="1" height="1" fill="#111"/>
                          {/* Data modules */}
                          <rect x="8" y="0" width="1" height="1" fill="#111"/><rect x="10" y="0" width="2" height="1" fill="#111"/><rect x="13" y="0" width="1" height="1" fill="#111"/>
                          <rect x="9" y="2" width="1" height="1" fill="#111"/><rect x="11" y="2" width="2" height="1" fill="#111"/>
                          <rect x="8" y="4" width="2" height="1" fill="#111"/><rect x="12" y="4" width="2" height="1" fill="#111"/>
                          <rect x="0" y="8" width="1" height="1" fill="#111"/><rect x="2" y="8" width="3" height="1" fill="#111"/><rect x="8" y="8" width="2" height="1" fill="#111"/><rect x="12" y="8" width="2" height="1" fill="#111"/><rect x="16" y="8" width="1" height="1" fill="#111"/><rect x="18" y="8" width="1" height="1" fill="#111"/><rect x="20" y="8" width="1" height="1" fill="#111"/>
                          <rect x="0" y="10" width="1" height="1" fill="#111"/><rect x="3" y="10" width="2" height="1" fill="#111"/><rect x="8" y="10" width="1" height="1" fill="#111"/><rect x="11" y="10" width="2" height="1" fill="#111"/><rect x="15" y="10" width="3" height="1" fill="#111"/><rect x="20" y="10" width="1" height="1" fill="#111"/>
                          <rect x="1" y="12" width="2" height="1" fill="#111"/><rect x="5" y="12" width="1" height="1" fill="#111"/><rect x="9" y="12" width="2" height="1" fill="#111"/><rect x="13" y="12" width="1" height="1" fill="#111"/><rect x="16" y="12" width="2" height="1" fill="#111"/>
                          <rect x="8" y="14" width="1" height="1" fill="#111"/><rect x="10" y="14" width="2" height="1" fill="#111"/><rect x="14" y="14" width="1" height="1" fill="#111"/><rect x="17" y="14" width="2" height="1" fill="#111"/><rect x="20" y="14" width="1" height="1" fill="#111"/>
                          <rect x="9" y="16" width="2" height="1" fill="#111"/><rect x="13" y="16" width="1" height="1" fill="#111"/><rect x="16" y="16" width="1" height="1" fill="#111"/><rect x="19" y="16" width="2" height="1" fill="#111"/>
                          <rect x="8" y="18" width="1" height="1" fill="#111"/><rect x="11" y="18" width="2" height="1" fill="#111"/><rect x="15" y="18" width="1" height="1" fill="#111"/><rect x="18" y="18" width="2" height="1" fill="#111"/>
                          <rect x="9" y="20" width="2" height="1" fill="#111"/><rect x="13" y="20" width="2" height="1" fill="#111"/><rect x="17" y="20" width="1" height="1" fill="#111"/><rect x="20" y="20" width="1" height="1" fill="#111"/>
                        </Box>
                      </Box>
                      <Box>
                        <Typography sx={{ fontFamily: POPPINS, fontWeight: 700, fontSize: "0.78rem", color: APP_NAVY, lineHeight: 1.3 }}>Scan to<br/>Download</Typography>
                        <Typography sx={{ fontFamily: POPPINS, fontSize: "0.62rem", color: APP_SLATE, mt: 0.5, lineHeight: 1.4 }}>Point your camera<br/>at the QR code</Typography>
                      </Box>
                    </Box>
                  </Stack>

                  {/* Trust strip */}
                  <Box sx={{
                    display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                    bgcolor: "#fff", borderRadius: "14px", border: `1px solid ${BORDER}`,
                    boxShadow: "0 8px 22px rgba(15,23,42,0.07)", overflow: "hidden",
                    maxWidth: 520,
                    mx: { xs: "auto", md: 0 },
                  }}>
                    {[
                      { icon: <VerifiedUserIcon sx={{ fontSize: 20, color: APP_RED }} />,   tint: alpha(APP_RED, 0.10),   title: "Secure & Reliable", sub: "Your data is always safe" },
                      { icon: <CloudDoneIcon sx={{ fontSize: 20, color: "#3B82F6" }} />,    tint: "#EFF6FF",              title: "Works Offline",     sub: "Auto syncs when online" },
                      { icon: <SupportAgentIcon sx={{ fontSize: 20, color: "#16A34A" }} />, tint: "#F0FDF4",              title: "24/7 Support",      sub: "We're here to help" },
                    ].map((f, i) => (
                      <Box key={f.title} sx={{
                        display: "flex", alignItems: "center", gap: 0.9, p: { xs: 1.4, md: 1.25 },
                        borderRight: { sm: i < 2 ? `1px solid ${BORDER}` : "none" },
                        borderBottom: { xs: i < 2 ? `1px solid ${BORDER}` : "none", sm: "none" },
                        justifyContent: { xs: "center", sm: "flex-start" },
                      }}>
                        <Box sx={{ width: 34, height: 34, borderRadius: "50%", bgcolor: f.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {f.icon}
                        </Box>
                        <Box sx={{ textAlign: "left" }}>
                          <Typography sx={{ fontFamily: POPPINS, fontSize: "0.72rem", fontWeight: 700, color: APP_NAVY, lineHeight: 1.2 }}>{f.title}</Typography>
                          <Typography sx={{ fontFamily: POPPINS, fontSize: "0.58rem", color: APP_SLATE, lineHeight: 1.3 }}>{f.sub}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* RIGHT — illustration */}
                <Box sx={{ flex: { md: "0 0 52%" }, width: "100%", display: "flex", justifyContent: "center", alignItems: "center", alignSelf: "stretch" }}>
                  <Box component="img" src={getAppImg} alt="Zodu mobile app dashboard"
                    sx={{
                      width: { xs: "100%", md: "96%" },
                      maxWidth: { xs: 430, md: 580 },
                      display: "block",
                      objectFit: "contain",
                      transform: { md: "translate(14px, 4px)" },
                      filter: "drop-shadow(0 18px 30px rgba(15,23,42,0.14))",
                    }} />
                </Box>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <Box component="footer" sx={{ position: "relative", overflow: "hidden", bgcolor: "#0B1220", color: "#fff" }}>
          <Box
            component="svg"
            viewBox="0 0 1200 420"
            preserveAspectRatio="none"
            aria-hidden="true"
            sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.9 }}
          >
            <path d="M760 0 C860 82 996 42 1200 112 L1200 420 L792 420 C690 314 674 130 760 0 Z" fill={alpha(PRIMARY, 0.13)} />
            <path d="M-80 340 C120 260 212 396 396 314 C500 268 586 276 682 342" fill="none" stroke={alpha(PRIMARY, 0.18)} strokeWidth="3" strokeLinecap="round" />
            <path d="M820 76 C918 42 1026 52 1140 112" fill="none" stroke={alpha("#fff", 0.08)} strokeWidth="2" strokeLinecap="round" />
          </Box>
          <Container maxWidth="lg" sx={{ px: { xs: 3, md: 6 }, position: "relative", zIndex: 1 }}>
            <Box sx={{
              mt: { xs: 4, md: 5 },
              p: { xs: 2.5, md: 3 },
              borderRadius: "18px",
              bgcolor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "flex-start", md: "center" },
              justifyContent: "space-between",
              gap: 2.5,
              backdropFilter: "blur(10px)",
            }}>
              <Box>
                <Typography sx={{ fontSize: { xs: "1.35rem", md: "1.7rem" }, fontWeight: 800, lineHeight: 1.2, mb: 0.7 }}>
                  Ready to simplify your business?
                </Typography>
                <Typography sx={{ color: "#A7B0C0", fontSize: "0.9rem", lineHeight: 1.6 }}>
                  Start billing, tracking and growing from one clean dashboard.
                </Typography>
              </Box>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ width: { xs: "100%", sm: "auto" } }}>
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate("/signup")}
                  sx={{ bgcolor: PRIMARY, px: 2.6, py: 1.1, borderRadius: "10px", fontWeight: 800, "&:hover": { bgcolor: PRIMARY_DARK } }}
                >
                  Start Free Trial
                </Button>
                <Button
                  variant="outlined"
                  sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.22)", px: 2.6, py: 1.1, borderRadius: "10px", fontWeight: 700, "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.06)" } }}
                >
                  Talk to Sales
                </Button>
              </Stack>
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.15fr 2fr" }, gap: { xs: 4, md: 6 }, py: { xs: 5, md: 6 } }}>
              {/* Brand */}
              <Box>
                <Box sx={{ height: 48, display: "flex", alignItems: "center", mb: 2 }}>
                  <Box sx={{ bgcolor: "#fff", borderRadius: "12px", px: 1.4, py: 0.9, display: "inline-flex", alignItems: "center", boxShadow: `0 12px 28px ${alpha(PRIMARY, 0.18)}` }}>
                    <img src={zlogo} alt="Zodu Logo" style={{ height: 30, width: "auto", objectFit: "contain" }} />
                  </Box>
                </Box>
                <Typography sx={{ color: "#A7B0C0", fontSize: "0.9rem", lineHeight: 1.75, mb: 2.5, maxWidth: 330 }}>
                  All-in-one POS solution for billing, inventory, staff, reports and growth. Built for modern Indian businesses.
                </Typography>
                <Stack direction="row" spacing={1}>
                  {[<FacebookIcon sx={{ fontSize: 18 }} />, <InstagramIcon sx={{ fontSize: 18 }} />, <LinkedInIcon sx={{ fontSize: 18 }} />, <YouTubeIcon sx={{ fontSize: 18 }} />].map((icon, i) => (
                    <IconButton key={i} size="small" sx={{
                      width: 36,
                      height: 36,
                      bgcolor: "rgba(255,255,255,0.08)",
                      color: "#D1D5DB",
                      border: "1px solid rgba(255,255,255,0.08)",
                      transition: "all 0.18s",
                      "&:hover": { bgcolor: PRIMARY, color: "#fff", transform: "translateY(-2px)" },
                    }}>
                      {icon}
                    </IconButton>
                  ))}
                </Stack>
              </Box>

              {/* Link columns */}
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)", md: "repeat(5, 1fr)" }, gap: { xs: 3, md: 3.5 } }}>
                {[
                  { title: "Product",   links: ["Features", "Pricing", "Modules", "What's New"] },
                  { title: "Solutions", links: ["Retail Stores", "Restaurants", "Supermarkets", "Beauty & Wellness"] },
                  { title: "Company",   links: ["About Us", "Blog", "Careers", "Contact Us"] },
                  { title: "Support",   links: ["Help Centre", "Tutorials", "API Docs", "System Status"] },
                  { title: "Legal",     links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Refund Policy"] },
                ].map((col) => (
                  <Stack spacing={1.5} key={col.title}>
                    <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "0.86rem", position: "relative", pb: 0.7 }}>
                      {col.title}
                      <Box component="span" sx={{ position: "absolute", left: 0, bottom: 0, width: 24, height: 2, borderRadius: "999px", bgcolor: PRIMARY }} />
                    </Typography>
                    <Stack spacing={1}>
                      {col.links.map((l) => (
                        <Link key={l} href="#" underline="none" sx={{ color: "#8B95A7", fontSize: "0.82rem", transition: "all 0.15s", "&:hover": { color: "#fff", pl: 0.4 } }}>
                          {l}
                        </Link>
                      ))}
                    </Stack>
                  </Stack>
                ))}
              </Box>
            </Box>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.09)" }} />
            <Box sx={{ py: 2.5, display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: "center", gap: 2 }}>
              <Typography sx={{ color: "#8B95A7", fontSize: "0.8rem" }}>
                © 2025 Zodu Technologies Pvt. Ltd. All rights reserved.
              </Typography>
              <Stack direction="row" spacing={2.5}>
                {["Privacy", "Terms", "Sitemap"].map((l) => (
                  <Link key={l} href="#" underline="none" sx={{ color: "#8B95A7", fontSize: "0.8rem", "&:hover": { color: "#fff" } }}>{l}</Link>
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