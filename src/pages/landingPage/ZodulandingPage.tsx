import React, { useState } from "react";
import {
  Box, Button, Typography, Stack, Divider,
   IconButton
  
} from "@mui/material";
import { createTheme, ThemeProvider, alpha } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";

import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

import GroupsIcon from "@mui/icons-material/Groups";

import StoreIcon from "@mui/icons-material/Store";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";


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

import SmartphoneIcon from "@mui/icons-material/Smartphone";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import CloudDoneIcon from "@mui/icons-material/CloudDone";

import { useNavigate } from "react-router-dom";
import {
  Archive, ArrowRight, Building2, Car, ConciergeBell, Cross, Droplet, Dumbbell, Ellipsis,
  Flower2, Gem, GraduationCap, Laptop, Pill, Plane, Printer, Shirt, ShoppingBag, Sofa,
  Sprout, Truck, Utensils, Wine, Zap,
  Bell, Package, ShoppingCart, Store,
  type LucideIcon,
} from "lucide-react";
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

import digiShot1 from "../../assets/Feature/digi1.png";
import digiShot2 from "../../assets/Feature/digi2.png";
import digiShot3 from "../../assets/Feature/digi3.png";
import taskShot1 from "../../assets/Feature/task1.png";
import taskShot2 from "../../assets/Feature/task2.png";
import taskShot3 from "../../assets/Feature/task3.png";

import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import { 
  Face as FaceIcon,
  QrCode as QrCodeIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Notifications as NotificationsIcon,
  Receipt as ReceiptIcon,
  Bolt as BoltIcon,
  ShoppingBag as ShoppingBagIcon,
} from '@mui/icons-material';


import ShieldIcon from '@mui/icons-material/Security';

import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';


import GroupIcon from '@mui/icons-material/Group';



import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";


import posbilling1 from "../../assets/Landingpage/pos-billing1.png";

import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';

import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';

import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';

import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import DevicesRoundedIcon from '@mui/icons-material/DevicesRounded';

import WomanIcon from '@mui/icons-material/Woman';

import { Avatar } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
// The hero artwork (1983 x 793), used at every width: the section's background
// from lg up, a background on tablets, and an <img> on phones.
import heroImage from '../../assets/Landingpage/hero-image.png';
// The device mock-up the hero now leads with — screens plus the store badges.
import heroDevices from '../../assets/Landingpage/hero-img.png';


import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import FactoryRoundedIcon from "@mui/icons-material/FactoryRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import ChairRoundedIcon from "@mui/icons-material/ChairRounded";
import LocalBarRoundedIcon from "@mui/icons-material/LocalBarRounded";
import OpacityRoundedIcon from "@mui/icons-material/OpacityRounded";



// ── Design Tokens ───────────────────────────────────────────
// ──────────────────
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
    monthly: "₹299",
    yearly: "₹249",
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
const PAGE_GUTTER = "clamp(48px, 5.5vw, 112px)";          // lg+ side gutter: the hero copy's inset; every section aligns to it
const SX = { xs: 2.5, sm: 4, md: 6, lg: PAGE_GUTTER };    // section horizontal padding — same as the hero copy
const SECTION_MAX_W = 1720;                               // section content cap (≈ 1920px viewport minus both gutters)
const SPY = { xs: 6, md: 4 };         // section vertical padding
const HMB = { xs: 4, md: 6 };         // section heading bottom margin
const POPPINS = "'Poppins', sans-serif";

// Get-the-app section palette (matches the brand asset sheet)
const APP_RED = "#EF4444";
const APP_RED_DARK = "#DC2626";
const APP_NAVY = "#1E293B";
const APP_SLATE = "#64748B";
const HERO_RED = "#EB0029";        // brand red — primary CTAs only, matches the logo
const HERO_BLUE = "#1D4ED8";       // hero accent text, icons, secondary hover
const HERO_NAVY = "#0F2A6B";       // navy used inside the hero artwork
const HERO_BLUE_SOFT = "#EFF6FF";
const HERO_BASE = "#F8FBFC";       // sampled from the artwork's left edge so the fade is seamless
const NAV_H = { xs: 60, md: 64 };  // navbar row height; the hero subtracts it (+1px border) to fill the screen
/** One screen minus the sticky navbar (+1px border): navbar + hero = exactly the viewport. */
const HERO_SCREEN = {
  xs: `calc(100dvh - ${NAV_H.xs + 1}px)`,
  md: `calc(100dvh - ${NAV_H.md + 1}px)`,
};

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

// ── "What Zodu does for you" ──────────────────────────────────────────────────
// Built to the reference design (1600px canvas, 1520px content). Sizes are that design's px
// values passed through fz(): 1px per unit below 1200px, 0.9px from 1200px, and scaling with
// the viewport from 1536px up so the desktop layout keeps the reference proportions.
//   < 900px   POS + wide cards stack (text above photo); mini cards 1 → 2 columns
//   ≥ 900px   text overlays the photos' blank left side; mini cards on a 6-track grid (3 + 2)
//   ≥ 1200px  POS | Inventory + Attendance side by side
//   ≥ 1536px  five mini cards in one row — the reference layout
// Mini cards pick their own photo placement by their width (container query, see FzMiniCard).
const FZ_RED = "#E5243B";
const FZ_INK = "#0F172A";
const FZ_TEXT = "#334155";
const FZ_MUTED = "#64748B";
const FZ_BORDER = "#E8ECF2";
const FZ_GREEN = "#16A34A";
// Desktop layout needs ~1368px of content (1520 × 0.9) — with PAGE_GUTTER sides that's a 1536px viewport.
const FZ_DESK = "@media (min-width: 1536px)";
const FZ_LAPTOP = "@media (min-width: 1200px) and (max-width: 1535.98px)";
const fz = (n: number) => `calc(${n} * var(--fz-u))`;

const fzCardSx = {
  position: "relative",
  overflow: "hidden",
  // clip (unlike hidden) keeps min-height: auto content-based, so cards grow instead of cutting text
  "@supports (overflow: clip)": { overflow: "clip" },
  bgcolor: "#fff",
  border: `1px solid ${FZ_BORDER}`,
  borderRadius: fz(16),
  boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 10px 28px rgba(15,23,42,0.05)",
} as const;

const fzPanelSx = {
  bgcolor: "#fff",
  border: `1px solid ${FZ_BORDER}`,
  borderRadius: fz(8),
  boxShadow: "0 1px 3px rgba(15,23,42,0.05)",
} as const;

const FzIconTile: React.FC<{ icon: React.ReactNode; color: string; bg: string; size: number; radius: number; iconSize: number }> = ({ icon, color, bg, size, radius, iconSize }) => (
  <Box sx={{
    width: fz(size), height: fz(size), borderRadius: fz(radius), bgcolor: bg, color, flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center", "& svg": { fontSize: fz(iconSize) },
  }}>
    {icon}
  </Box>
);

const FzLearnMore: React.FC<{ size: number }> = ({ size }) => (
  <Box component="button" type="button" sx={{
    display: "inline-flex", alignItems: "center", gap: fz(4), p: 0, border: 0, bgcolor: "transparent",
    color: FZ_RED, fontFamily: "inherit", fontSize: fz(size), fontWeight: 700, lineHeight: 1.2, cursor: "pointer",
    "& svg": { fontSize: fz(size + 3), transition: "transform 0.18s ease" },
    "&:hover svg": { transform: "translateX(2px)" },
    "&:focus-visible": { outline: `2px solid ${alpha(FZ_RED, 0.4)}`, outlineOffset: 2, borderRadius: "4px" },
  }}>
    Learn More <ArrowForwardRoundedIcon />
  </Box>
);

const FzChecklist: React.FC<{ items: string[]; color: string; icon: number; text: number; gap: number }> = ({ items, color, icon, text, gap }) => (
  <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: fz(gap) }}>
    {items.map((item) => (
      <Box component="li" key={item} sx={{ display: "flex", alignItems: "flex-start", gap: fz(10), color: FZ_TEXT, fontSize: fz(text), fontWeight: 500, lineHeight: 1.4 }}>
        <CheckCircleIcon sx={{ fontSize: fz(icon), color, flexShrink: 0 }} />
        {item}
      </Box>
    ))}
  </Box>
);

const FzValue: React.FC<{ children: React.ReactNode; size: number }> = ({ children, size }) => (
  <Typography sx={{ fontSize: fz(size), fontWeight: 800, color: FZ_INK, lineHeight: 1.25, whiteSpace: "nowrap" }}>{children}</Typography>
);

const fzTabs = [
  { label: "All Features", icon: <ShoppingCartOutlinedIcon />, color: "#fff", active: true },
  { label: "Billing", icon: <ReceiptLongIcon />, color: "#F97316", active: false },
  { label: "Inventory", icon: <Inventory2RoundedIcon />, color: FZ_GREEN, active: false },
  { label: "Staff", icon: <PeopleAltRoundedIcon />, color: "#2563EB", active: false },
  { label: "Customers", icon: <GroupsIcon />, color: "#2563EB", active: false },
  { label: "Reports", icon: <BarChartRoundedIcon />, color: FZ_RED, active: false },
];

const fzPosStats = [
  { value: "₹ 12,458", delta: "12.5%", label: "Today's Sales" },
  { value: "128", delta: "8.3%", label: "Total Orders" },
  { value: "₹ 2,850", delta: null, label: "Avg. Order Value" },
];

const fzBenefits = [
  { icon: <BoltIcon />, title: "Real-time sync", sub: "Access your business anytime, anywhere" },
  { icon: <VerifiedUserIcon />, title: "Secure & reliable", sub: "Your data is always protected" },
  { icon: <DevicesRoundedIcon />, title: "Works on all devices", sub: "Desktop, tablet & mobile" },
  { icon: <BarChartRoundedIcon />, title: "Built for growth", sub: "From one store to many" },
];

// Feature photos: cropped to their subject and pre-sized at two widths by scripts/crop-feature-photos.py
// (feature-photos/<slug>-<width>.webp), so the browser picks a near-size file instead of shrinking a
// 1,300–2,200px PNG ~8x (which renders soft). Widths must match the script's MINI_W / WIDE_W.
type FzPhoto = { src: string; srcSet: string };
const FZ_MINI_W = [480, 720];
const FZ_WIDE_W = [640, 1260];
const FZ_WIDE_SIZES = "(min-width: 1200px) 24vw, (min-width: 600px) 60vw, 100vw";
const fzPhotoUrls = import.meta.glob<string>("../../assets/Landingpage/feature-photos/*.webp", { eager: true, import: "default" });
const fzPhoto = (slug: string, widths: number[]): FzPhoto => {
  const url = (w: number) => fzPhotoUrls[`../../assets/Landingpage/feature-photos/${slug}-${w}.webp`];
  return { src: url(widths[widths.length - 1]), srcSet: widths.map((w) => `${url(w)} ${w}w`).join(", ") };
};
const fzCustomerPhoto = fzPhoto("customer", FZ_MINI_W);

const FzPosCard: React.FC = () => (
  // width 100%: an aspect-ratio grid item doesn't stretch inline, so once the row stretches its height the
  // width would become height × ratio — wider than the column, sliding it under the Inventory/Attendance cards.
  <Box sx={{ ...fzCardSx, alignSelf: "stretch", width: "100%", minWidth: 0, display: "flex", flexDirection: "column", aspectRatio: { md: "1821 / 864" } }}>
    <Box sx={{
      position: "relative", zIndex: 1, flex: { md: 1 }, width: { xs: "100%", md: "45%" },
      // md+ bottom spacing is set so the copy stays within the artwork's 1821:864 height (no stretch, no crop).
      display: "flex", flexDirection: "column", p: fz(16), pb: { xs: fz(18), md: fz(20) },
    }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: fz(16) }}>
        <FzIconTile icon={<ShoppingCartOutlinedIcon />} color={FZ_RED} bg="#FFE4E6" size={56} radius={14} iconSize={30} />
        <Box sx={{ pt: fz(4), minWidth: 0 }}>
          <Typography component="h3" sx={{ fontSize: fz(24), fontWeight: 800, color: FZ_INK, lineHeight: 1.2, letterSpacing: "-0.01em" }}>
            POS Billing
          </Typography>
          <Typography sx={{ mt: fz(6), maxWidth: fz(230), fontSize: fz(14), color: FZ_MUTED, lineHeight: 1.4 }}>
            Fast, simple and reliable billing for any type of business.
          </Typography>
        </Box>
      </Box>

      {/* 1200–1535px the card is taller than the artwork, so it sits lower: keep the list left of "Billing Made Simple". */}
      <Box sx={{ mt: fz(24), pl: fz(10), [FZ_LAPTOP]: { maxWidth: "72%" } }}>
        <FzChecklist
          items={["Quick billing & barcode scanning", "Supports multiple payment methods", "Works offline too", "Perfect for retail, restaurant, pharmacy and more"]}
          color={FZ_RED} icon={19} text={13.5} gap={9}
        />
      </Box>

      <Box component="button" type="button" sx={{
        alignSelf: "flex-start", mt: fz(22), mb: { md: fz(24) }, ml: fz(8),
        display: "inline-flex", alignItems: "center", gap: fz(8), height: fz(36), px: fz(18),
        border: 0, borderRadius: fz(8), bgcolor: FZ_RED, color: "#fff", cursor: "pointer",
        fontFamily: "inherit", fontSize: fz(13.5), fontWeight: 700,
        boxShadow: `0 8px 18px ${alpha(FZ_RED, 0.28)}`,
        transition: "transform 0.18s ease, background-color 0.18s ease",
        "& svg": { fontSize: fz(17) },
        "&:hover": { bgcolor: "#CC1B31", transform: "translateY(-1px)" },
        "&:focus-visible": { outline: `3px solid ${alpha(FZ_RED, 0.3)}`, outlineOffset: 2 },
      }}>
        Learn More <ArrowForwardRoundedIcon />
      </Box>

      <Box sx={{
        ...fzPanelSx, borderRadius: fz(12), mt: { xs: fz(20), md: "auto" },
        display: "flex", width: { xs: "100%", sm: "fit-content" }, py: fz(14), px: fz(4),
      }}>
        {fzPosStats.map((s, i) => (
          <Box key={s.label} sx={{ flex: { xs: 1, sm: "0 0 auto" }, minWidth: { sm: fz(104) }, px: { xs: fz(10), sm: fz(18) }, borderLeft: i ? `1px solid ${FZ_BORDER}` : "none" }}>
            <FzValue size={19}>{s.value}</FzValue>
            {s.delta && (
              <Box sx={{ mt: fz(3), display: "flex", alignItems: "center", gap: fz(2), color: FZ_GREEN, fontSize: fz(12.5), fontWeight: 700 }}>
                <ArrowUpwardRoundedIcon sx={{ fontSize: fz(14) }} />{s.delta}
              </Box>
            )}
            <Typography sx={{ mt: fz(s.delta ? 4 : 6), fontSize: fz(12), color: FZ_MUTED, lineHeight: 1.3, whiteSpace: { sm: "nowrap" } }}>
              {s.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>

    {/* The artwork carries the receipt and "Billing Made Simple"; its left side is blank for the copy. */}
    <Box component="img" src={posbilling1} alt="Cashier billing an order on the Zodu POS" loading="lazy" decoding="async" sx={{
      display: "block", width: "100%", position: { md: "absolute" }, inset: { md: 0 },
      height: { xs: "auto", md: "100%" }, aspectRatio: { xs: "4 / 3", sm: "16 / 10", md: "auto" },
      objectFit: "cover", objectPosition: { xs: "90% center", sm: "right center", md: "right top" },
      // 1200–1535px: the copy makes the card taller than the artwork's ratio; cropping would push
      // "Billing Made Simple" into the checklist, so show the artwork whole and fade its top edge.
      [FZ_LAPTOP]: {
        inset: "auto 0 0 auto", height: "auto", aspectRatio: "1821 / 864",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 14%)",
        maskImage: "linear-gradient(to bottom, transparent 0%, #000 14%)",
      },
    }} />
  </Box>
);

const FzWideCard: React.FC<{ icon: React.ReactNode; color: string; bg: string; title: string; desc: string; items: string[]; photo: FzPhoto; alt: string; imagePos?: string }> = ({ icon, color, bg, title, desc, items, photo, alt, imagePos = "right center" }) => (
  <Box sx={{
    ...fzCardSx, flex: { lg: "1 1 0" }, display: "flex", flexDirection: "column", justifyContent: "center",
    // A touch taller than the reference's 2170/725. The photo fills half the card
    // with object-fit: cover, so its crop follows the panel's shape: a taller
    // panel is a shallower crop, which is what "less zoomed" means here — and it
    // keeps the picture bled to the edges, with none of the gaps that fitting the
    // whole photo inside the panel would leave.
    aspectRatio: { sm: "2170 / 800", lg: "auto" },
    minHeight: { lg: fz(210) },
  }}>
    {/* Kept short enough that two of these stay within the POS artwork's height (1821:864), so the POS
        card is never stretched and its artwork never cropped into the checklist. */}
    <Box sx={{ position: "relative", zIndex: 1, width: { xs: "100%", sm: "50%" }, pl: fz(16), pr: fz(8), pt: fz(10), pb: fz(8) }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: fz(14) }}>
        <FzIconTile icon={icon} color={color} bg={bg} size={44} radius={12} iconSize={24} />
        <Box sx={{ minWidth: 0 }}>
          <Typography component="h3" sx={{ fontSize: fz(16), fontWeight: 800, color: FZ_INK, lineHeight: 1.25, letterSpacing: "-0.015em" }}>{title}</Typography>
          <Typography sx={{ mt: fz(3), maxWidth: fz(200), fontSize: fz(12), color: FZ_MUTED, lineHeight: 1.45 }}>{desc}</Typography>
        </Box>
      </Box>
      <Box sx={{ mt: fz(10), pl: fz(12) }}>
        <FzChecklist items={items} color={color} icon={16} text={12} gap={5} />
      </Box>
      <Box sx={{ mt: fz(8), pl: fz(4) }}>
        <FzLearnMore size={12} />
      </Box>
    </Box>

    {/* Frame-free photo panel (it carries the stat card), bled to the card's right, top and bottom edges;
        its white left side fades into the card behind the copy. Capped at 60% of the card so it stays
        clear of the copy on cards that are tall for their width (1200–1535px); imagePos keeps the subject. */}
    <Box component="img" src={photo.src} srcSet={photo.srcSet} sizes={FZ_WIDE_SIZES} alt={alt} loading="lazy" decoding="async" sx={{
      display: "block", position: { sm: "absolute" }, inset: { sm: "0 0 0 auto" },
      // Half the card, always: at width auto the picture was only as wide as its
      // own crop made it (nearer 40%), whatever the cap allowed.
      width: { xs: "100%", sm: "50%" }, maxWidth: { xs: "none", sm: "50%" },
      height: { xs: "auto", sm: "100%" }, aspectRatio: { xs: "16 / 9", sm: "auto" },
      objectFit: "cover", objectPosition: imagePos,
      WebkitMaskImage: { sm: "linear-gradient(to right, transparent 0%, #000 12%)" },
      maskImage: { sm: "linear-gradient(to right, transparent 0%, #000 12%)" },
      // 1200–1535px the card is at its tallest relative to its width: keep the photo right of the copy
      // and give it a longer fade so the crop's left edge stays soft.
      [FZ_LAPTOP]: {
        width: "50%",
        maxWidth: "50%",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, #000 18%)",
        maskImage: "linear-gradient(to right, transparent 0%, #000 18%)",
      },
    }} />
  </Box>
);

// The five module cards below POS / Inventory / Attendance, in the same wide layout. Their photos are
// the landscape scenes shot for the smaller cards; imagePos keeps each subject in the right-hand crop.
const fzModuleCards: Array<React.ComponentProps<typeof FzWideCard>> = [
  {
    icon: <PeopleAltRoundedIcon />, color: "#2563EB", bg: "#DBEAFE",
    title: "Customer Management", desc: "Build lasting customer relationships.",
    items: ["Customer profiles & purchase history", "Loyalty points & rewards", "Total spend & order insights", "Quick customer lookup at billing"],
    photo: fzCustomerPhoto, alt: "Customer checking her loyalty rewards on her phone", imagePos: "center 30%",
  },
  {
    icon: <AccountBalanceWalletOutlinedIcon />, color: "#EA580C", bg: "#FFEDD5",
    title: "Payments & Reminders", desc: "Get paid on time with automated reminders.",
    items: ["Automated payment reminders", "Outstanding amount tracking", "Reminder history per customer", "Collect dues faster"],
    photo: fzPhoto("payments", FZ_MINI_W), alt: "Payment reminder being sent from the Zodu app", imagePos: "center 50%",
  },
  {
    icon: <DescriptionOutlinedIcon />, color: "#2563EB", bg: "#DBEAFE",
    title: "GST Compliance & Reports", desc: "Stay 100% compliant with easy GST filing.",
    items: ["GSTR-1 & GSTR-3B reports", "E-way bill generation", "Filing status at a glance", "GST-ready invoices"],
    photo: fzPhoto("gst", FZ_MINI_W), alt: "GST compliance report with filing status on a desk", imagePos: "center 35%",
  },
  {
    icon: <PaymentOutlinedIcon />, color: FZ_GREEN, bg: "#DCFCE7",
    title: "Expense Management", desc: "Track and control your business expenses.",
    items: ["Daily & monthly expense tracking", "Expense categories", "Monthly spend summary", "See where your money goes"],
    photo: fzPhoto("expense", FZ_MINI_W), alt: "Store staff reviewing monthly expenses on a tablet", imagePos: "center 22%",
  },
  {
    icon: <ShoppingCartOutlinedIcon />, color: "#9333EA", bg: "#F3E8FF",
    title: "Purchase Management", desc: "Manage suppliers, purchase orders & receipts.",
    items: ["Supplier management", "Purchase orders", "Pending receipt tracking", "Purchase totals & history"],
    photo: fzPhoto("purchase", FZ_MINI_W), alt: "Warehouse staff checking purchase orders on a tablet", imagePos: "center 40%",
  },
  {
    icon: <StorefrontRoundedIcon />, color: "#0EA5E9", bg: "#E0F2FE",
    title: "Multi-Location Handling", desc: "Run every branch from one account.",
    items: ["Branch-wise stock & sales", "Switch branch in one tap", "Per-branch pricing & taxes", "Consolidated reports across branches"],
    // Shares the warehouse photo with the Inventory card until a branch-specific one is shot.
    photo: fzPhoto("inventory", FZ_WIDE_W), alt: "Staff checking stock for a branch on a tablet", imagePos: "center 40%",
  },
];

const WhatZoduDoesSection: React.FC = () => (
  <Box component="section" id="what-zodu-does" aria-labelledby="fz-heading" sx={{
    scrollMarginTop: { xs: NAV_H.xs, md: NAV_H.md },
    "--fz-u": "1px",
    "@media (min-width: 1200px)": { "--fz-u": "0.9px" },
    [FZ_DESK]: { "--fz-u": `clamp(0.9px, calc((100vw - 2 * ${PAGE_GUTTER}) / 1520), 1px)` },
    bgcolor: HERO_BASE,
    px: SX,
    pt: { xs: 5, md: fz(28) },
    pb: { xs: 5, md: fz(32) },
  }}>
    <Box sx={{ maxWidth: SECTION_MAX_W, mx: "auto", display: "flex", flexDirection: "column", gap: fz(10) }}>

      {/* Heading + category tabs */}
      <Box sx={{ textAlign: "center", mb: fz(9) }}>
        <Box sx={{
          display: "inline-flex", alignItems: "center", gap: fz(14), color: FZ_RED,
          fontSize: fz(12.5), fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", lineHeight: 1.4,
          "&::before, &::after": { content: '""', width: fz(30), height: "1px", bgcolor: alpha(FZ_RED, 0.45) },
        }}>
          What Zodu does for you
        </Box>
        <Typography component="h2" id="fz-heading" sx={{
          mt: fz(12), fontSize: { xs: "1.75rem", sm: "2.1rem", lg: fz(38) }, fontWeight: 800, color: "#0B1220",
          lineHeight: 1.15, letterSpacing: "-0.025em",
        }}>
          Everything You Need to Run Your Business Smarter
        </Typography>
        {/* <Typography sx={{ mt: fz(8), mx: "auto", maxWidth: fz(640), fontSize: { xs: "0.95rem", lg: fz(15) }, color: "#475569", lineHeight: 1.5 }}>
          From billing and inventory to payments, GST, staff, and insights — Zodu brings every essential operation into one connected platform.
        </Typography> */}

        {/* <Box sx={{
          // one row: scrolls below md, centred whenever it fits ("safe" falls back to start on overflow)
          mt: fz(22), display: "flex", gap: { xs: "8px", md: fz(14) }, justifyContent: "safe center",
          flexWrap: { xs: "nowrap", md: "wrap" }, overflowX: { xs: "auto", md: "visible" },
          mx: { xs: -2.5, sm: -4, md: 0 }, px: { xs: 2.5, sm: 4, md: 0 }, py: fz(4),
          scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" },
        }}>
          {fzTabs.map((tab) => (
            <Box key={tab.label} component="button" type="button" aria-pressed={tab.active} sx={{
              flexShrink: 0, display: "inline-flex", alignItems: "center", gap: fz(8), height: fz(38),
              px: { xs: fz(tab.active ? 18 : 16), md: fz(tab.active ? 24 : 20) },
              borderRadius: "999px", border: `1px solid ${tab.active ? FZ_RED : FZ_BORDER}`,
              bgcolor: tab.active ? FZ_RED : "#fff", color: tab.active ? "#fff" : FZ_TEXT,
              boxShadow: tab.active ? `0 8px 18px ${alpha(FZ_RED, 0.3)}` : "0 1px 2px rgba(15,23,42,0.04)",
              fontFamily: "inherit", fontSize: fz(13), fontWeight: 600, whiteSpace: "nowrap", cursor: "pointer",
              transition: "border-color 0.18s ease, color 0.18s ease",
              "& svg": { fontSize: fz(17), color: tab.color },
              "&:hover": tab.active ? {} : { borderColor: alpha(FZ_RED, 0.35), color: FZ_INK },
              "&:focus-visible": { outline: `3px solid ${alpha(FZ_RED, 0.3)}`, outlineOffset: 2 },
            }}>
              {tab.icon}
              {tab.label}
            </Box>
          ))}
        </Box> */}
      </Box>

      {/* POS | Inventory + Attendance */}
      <Box sx={{ display: "grid", gap: fz(10), gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1.2fr) minmax(0, 1fr)" } }}>
        <FzPosCard />
        <Box sx={{ display: "flex", flexDirection: "column", gap: fz(10), minWidth: 0 }}>
          <FzWideCard
            icon={<Inventory2RoundedIcon />} color={FZ_GREEN} bg="#DCFCE7"
            title="Inventory Management" desc="Track stock in real time and never run out of best-selling items."
            items={["Real-time stock tracking", "Low stock alerts", "Multi-location inventory", "Barcode & batch management"]}
            photo={fzPhoto("inventory", FZ_WIDE_W)} alt="Warehouse staff checking stock levels on a tablet"
          />
          <FzWideCard
            icon={<AccessTimeOutlinedIcon />} color="#7C3AED" bg="#EDE9FE"
            title="Attendance Management" desc="Track staff attendance, shifts and leaves with ease."
            items={["Real-time check-in/out", "Shift & leave management", "Location-based attendance", "Detailed attendance reports"]}
            photo={fzPhoto("attendance", FZ_WIDE_W)} alt="Employee checking in on the Zodu attendance app" imagePos="88% center"
          />
        </Box>
      </Box>

      {/* Six module cards: one per row below 1200px, then two per row across the
          section's full width — three even rows, so nothing is left over. */}
      <Box sx={{
        display: "grid", gap: fz(10),
        gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "repeat(2, minmax(0, 1fr))" },
      }}>
        {fzModuleCards.map((card) => <FzWideCard key={card.title} {...card} />)}
      </Box>
    </Box>
  </Box>
);

/** The four benefits, one strip — shown full width along the bottom of the hero. */
const FzBenefitsStrip: React.FC = () => (
  <Box sx={{
    // Own scale unit: the strip lives in the hero, outside the section that sets --fz-u.
    "--fz-u": "1px",
    "@media (min-width: 1200px)": { "--fz-u": "0.9px" },
    [FZ_DESK]: { "--fz-u": `clamp(0.9px, calc((100vw - 2 * ${PAGE_GUTTER}) / 1520), 1px)` },
    ...fzCardSx, borderRadius: fz(14), display: "grid", width: "100%",
    gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" },
  }}>
    {fzBenefits.map((b, i) => (
      <Box key={b.title} sx={{
        position: "relative", display: "flex", alignItems: "center", justifyContent: { md: "center" },
        gap: fz(14), px: fz(24), py: fz(12),
        borderTop: { xs: i ? `1px solid ${FZ_BORDER}` : "none", sm: i >= 2 ? `1px solid ${FZ_BORDER}` : "none", md: "none" },
        borderLeft: { sm: i % 2 ? `1px solid ${FZ_BORDER}` : "none", md: "none" },
        "&::before": {
          content: '""', display: { xs: "none", md: i ? "block" : "none" },
          position: "absolute", left: 0, top: "25%", bottom: "25%", width: "1px", bgcolor: FZ_BORDER,
        },
      }}>
        <FzIconTile icon={b.icon} color={FZ_RED} bg="#FFE4E6" size={40} radius={20} iconSize={21} />
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: fz(13.5), fontWeight: 700, color: FZ_INK, lineHeight: 1.3 }}>{b.title}</Typography>
          <Typography sx={{ fontSize: fz(11.5), color: FZ_MUTED, lineHeight: 1.35 }}>{b.sub}</Typography>
        </Box>
      </Box>
    ))}
  </Box>
);

{/*BUILT FOR EVERY BUSINESS*/}

// ============================================================
// BUILT FOR EVERY BUSINESS
//
// Heading on one line with the handwritten note beside it, then the industries
// as a plain grid of white cards: tinted icon circle, name and a two-line note.
// ============================================================

type Industry = {
  title: string; // "\n" = line break used by the hero chips; shown on one line in the cards
  description: string; // "\n" = forced line break
  iconColor: string;
  icon: React.ReactNode;
};

// ------------------------------------------------------------
// COLORS
// ------------------------------------------------------------

const NAVY = "#0B1F4B";
const BRAND_RED = "#E11D48";

// ------------------------------------------------------------
// DATA  (order = reading order, 5 per row)
// ------------------------------------------------------------

/** every card icon: same outline weight and size */
const lucideIcon = (Icon: LucideIcon) => <Icon size={24} strokeWidth={1.6} />;

const industries: Industry[] = [
  // ---------- ROW 1 ----------
  { title: "Retail &\nGeneral Trade", description: "Shops, Supermarkets,\nKirana & More", iconColor: "#E5485F", icon: lucideIcon(ShoppingBag) },
  { title: "Agriculture", description: "Farms, Agri Products,\nDairy & Livestock", iconColor: "#22A35A", icon: lucideIcon(Sprout) },
  { title: "Automobile", description: "Vehicles, Spare Parts,\nService Centres & Transport", iconColor: "#6D5BD0", icon: lucideIcon(Car) },
  { title: "Construction &\nReal Estate", description: "Building Materials,\nConstruction, Rentals & Lease", iconColor: "#F59E0B", icon: lucideIcon(Building2) },
  { title: "Healthcare", description: "Clinics, Hospitals,\nPharmacies & More", iconColor: "#3B82F6", icon: lucideIcon(Cross) },

  // ---------- ROW 2 ----------
  { title: "Education &\nCoaching", description: "Schools, Colleges,\nCoaching & Training", iconColor: "#2563EB", icon: lucideIcon(GraduationCap) },
  { title: "Fashion & Lifestyle", description: "Garments, Footwear,\nJewellery, Beauty & More", iconColor: "#EF4444", icon: lucideIcon(Shirt) },
  { title: "Electronics &\nTechnology", description: "Mobiles, Electronics,\nIT Services & Accessories", iconColor: "#14B8A6", icon: lucideIcon(Laptop) },
  { title: "Food & Beverage", description: "Restaurants, Cafes,\nHotels & Catering", iconColor: "#7C5CE0", icon: lucideIcon(Utensils) },
  { title: "Home & Furniture", description: "Furniture, Home Services,\nInteriors & More", iconColor: "#E5485F", icon: lucideIcon(Sofa) },

  // ---------- ROW 3 ----------
  { title: "Automotive & Transport", description: "Vehicles, Logistics,\nTransport & Fleet", iconColor: "#F59E0B", icon: lucideIcon(Truck) },
  { title: "Beauty & Wellness", description: "Spa, Fitness, Wellness\n& Personal Care", iconColor: "#8B5CF6", icon: lucideIcon(Flower2) },
  { title: "Health & Fitness", description: "Gyms, Fitness, Sports\n& Wellness", iconColor: "#E11D48", icon: lucideIcon(Dumbbell) },
  { title: "Pharmacy & Medical Devices", description: "Medicine, Medical Devices\n& Healthcare Products", iconColor: "#22A35A", icon: lucideIcon(Pill) },
  { title: "Printing & Stationery", description: "Printing, Stationery,\nOffice Supplies & More", iconColor: "#7C5CE0", icon: lucideIcon(Printer) },

  // ---------- ROW 4 ----------
  { title: "Electrical & Hardware", description: "Electrical Works,\nHardware & Tools", iconColor: "#10B981", icon: lucideIcon(Zap) },
  { title: "Liquor & Beverages", description: "Liquor, Beverages,\nFood & More", iconColor: "#E11D48", icon: lucideIcon(Wine) },
  { title: "Oil & Gas", description: "Fuel, Energy, Industrial\nSupplies & More", iconColor: "#3B82F6", icon: lucideIcon(Droplet) },
  { title: "Packaging", description: "Packaging Materials,\nSupplies & Services", iconColor: "#F59E0B", icon: lucideIcon(Archive) },
  { title: "Textiles & Garments", description: "Fabrics, Textiles,\nApparel & More", iconColor: "#22A35A", icon: lucideIcon(Shirt) },

  // ---------- ROW 5 ----------
  { title: "Jewellery & Accessories", description: "Jewellery, Watches,\nAccessories & More", iconColor: "#8B5CF6", icon: lucideIcon(Gem) },
  { title: "Hotels & Hospitality", description: "Hotels, Resorts, Hospitality\nServices & More", iconColor: "#F59E0B", icon: lucideIcon(ConciergeBell) },
  { title: "Travel & Tourism", description: "Tours, Travel, Transport\n& Logistics", iconColor: "#2563EB", icon: lucideIcon(Plane) },
  { title: "Others", description: "Many more industries\nand services", iconColor: "#E11D48", icon: lucideIcon(Ellipsis) },
  { title: "And many more...", description: "Whatever your business,\nwe're here to support you.", iconColor: NAVY, icon: lucideIcon(ArrowRight) },
];

// ============================================================
// INDUSTRY CARD
// ============================================================

const IndustryCard = ({ item }: { item: Industry }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      minWidth: 0,
      height: "100%",
      boxSizing: "border-box",
      px: "14px",
      py: "12px",
      bgcolor: "#fff",
      border: "1px solid #EEF0F4",
      borderRadius: "14px",
      boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.04)",
      transition: "box-shadow .2s ease",
      "&:hover": { boxShadow: "0 6px 18px rgba(15,23,42,0.08)" },
    }}
  >
    <Box
      sx={{
        flexShrink: 0,
        width: { xs: 44, xl: 50 },
        height: { xs: 44, xl: 50 },
        borderRadius: "50%",
        bgcolor: alpha(item.iconColor, 0.08),
        color: item.iconColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {item.icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography
        sx={{
          color: "#0F172A",
          fontWeight: 700,
          fontSize: { xs: "13.5px", md: "14px" },
          lineHeight: 1.3,
          letterSpacing: "-0.01em",
        }}
      >
        {item.title.replace(/\n/g, " ")}
      </Typography>
      <Typography
        sx={{
          mt: "4px",
          color: "#64748B",
          fontSize: "11px",
          lineHeight: 1.45,
          whiteSpace: "pre-line", // the "\n" in the data = the line break in the card
        }}
      >
        {item.description}
      </Typography>
    </Box>
  </Box>
);

// ============================================================
// INDUSTRIES SECTION
// ============================================================

export const IndustriesSection = () => {
  return (
    <Box
      component="section"
      id="industries"
      sx={{
        boxSizing: "border-box",
        position: "relative",
        width: "100%",
        px: { xs: "20px", md: "44px" },
        pt: { xs: "28px", md: "32px" },
        pb: { xs: "32px", md: "40px" },
        overflow: "hidden",
        background: "linear-gradient(180deg, #FFFFFF 0%, #F8F9FB 100%)",
      }}
    >
      {/* handwriting font used by the note (remove if already loaded globally) */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&display=swap"
      />

      {/* ---------- HEADER ---------- */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "flex-end" },
          justifyContent: "space-between",
          gap: { xs: "20px", md: "32px" },
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              color: BRAND_RED,
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              mb: "10px",
            }}
          >
            Built for every business
          </Typography>
          <Typography
            component="h2"
            sx={{
              m: 0,
              color: NAVY,
              fontWeight: 800,
              fontSize: { xs: "30px", md: "clamp(28px, 3vw, 46px)" },
              lineHeight: 1.05,
              letterSpacing: "-0.045em",
              whiteSpace: { md: "nowrap" },
            }}
          >
            <Box component="span" sx={{ color: BRAND_RED }}>
              zodu
            </Box>{" "}
            is suitable for all types of businesses
          </Typography>
        </Box>

        {/* handwritten note */}
        <Box
          sx={{
            position: "relative",
            flexShrink: 0,
            alignSelf: { xs: "center", md: "flex-end" },
            textAlign: "center",
            color: BRAND_RED,
            transform: "rotate(-8deg)",
            fontFamily: "'Caveat', 'Segoe Script', 'Brush Script MT', cursive",
            mr: { md: "16px" },
          }}
        >
          {/* spark marks */}
          <Box
            component="svg"
            viewBox="0 0 50 50"
            sx={{ position: "absolute", left: "-36px", top: "-6px", width: "28px", height: "28px" }}
          >
            <path d="M27 5 L36 15" fill="none" stroke={BRAND_RED} strokeWidth="2.4" strokeLinecap="round" />
            <path d="M7 22 L17 22" fill="none" stroke={BRAND_RED} strokeWidth="2.4" strokeLinecap="round" />
            <path d="M18 37 L26 29" fill="none" stroke={BRAND_RED} strokeWidth="2.4" strokeLinecap="round" />
          </Box>
          <Typography
            sx={{
              fontFamily: "inherit",
              fontSize: { xs: "22px", md: "24px" },
              fontWeight: 600,
              fontStyle: "italic",
              lineHeight: 1.2,
              whiteSpace: "nowrap",
            }}
          >
            Different Businesses.
            <br />
            Same Powerful Solution.
          </Typography>
          {/* squiggle underline */}
          <Box
            component="svg"
            viewBox="0 0 290 30"
            sx={{ display: "block", width: "150px", height: "14px", mx: "auto", mt: "4px" }}
          >
            <path d="M4 24 C70 20 150 12 285 2" fill="none" stroke={BRAND_RED} strokeWidth="2.6" strokeLinecap="round" />
          </Box>
        </Box>
      </Box>

      {/* ---------- CARDS ---------- */}
      <Box
        sx={{
          mt: { xs: "24px", md: "28px" },
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            sm: "repeat(2, minmax(0, 1fr))",
            md: "repeat(3, minmax(0, 1fr))",
            lg: "repeat(5, minmax(0, 1fr))",
          },
          gap: { xs: "12px", md: "14px" },
        }}
      >
        {industries.map((item) => (
          <IndustryCard key={item.title} item={item} />
        ))}
      </Box>
    </Box>
  );
};



// ── HERO─────────────────────────────────────────────────────────────────


/**
 * The industries scattered across the hero's top right — the artwork's own
 * corner, kept clear of the copy on the left.
 *
 * Name, icon and colour all come from the `industries` list the "Built for every
 * business" section is drawn from, so the two never drift apart: this is a
 * placement list, nothing more. `left`/`top` are percentages of the layer, which
 * spans the right of the hero only, so no chip can wander over the heading
 * however wide the screen gets.
 *
 * Three rows, each chip's `top` nudged a few percent off its row so they read as
 * scattered rather than ruled. `label` re-wraps a long name onto two lines where
 * one line would be wide enough to run into its neighbour — the section's own
 * wording is untouched. All three rows stay in the top half: the devices in the
 * artwork start around 50% down.
 */
/** Off for now: the previous hero (artwork background + industry chips), kept whole. */
const HERO_LEGACY: boolean = false;

/** The four points below the hero copy. */
const HERO_FEATURES = [
  { icon: <ShoppingCartRoundedIcon />, title: "POS Billing", sub: "Fast & reliable billing",         color: "#EB0029", bg: "#FFE4E6" },
  { icon: <Inventory2RoundedIcon />,   title: "Inventory",   sub: "Real-time stock tracking",        color: "#14B8A6", bg: "#CCFBF1" },
  { icon: <PeopleAltRoundedIcon />,    title: "Customers",   sub: "Manage customer relationships",   color: "#8B5CF6", bg: "#EDE9FE" },
  { icon: <BarChartRoundedIcon />,     title: "Reports",     sub: "Powerful insights for your growth", color: "#F59E0B", bg: "#FFEDD5" },
];

const HERO_CHIPS: Array<{ title: string; left?: number; right?: number; top: number }> = [
  // Left, in the clear strip above the "Trusted by" badge — the copy itself
  // starts lower down, so these three sit over nothing.
  { title: "Retail &\nGeneral Trade",      left: 2,    top: 4 },
  { title: "Food & Beverage",              left: 19,   top: 23 },
  { title: "Home & Furniture",             left: 32,   top: 0 },

  // Middle, over the sky.
  { title: "Hotels & Hospitality",         left: 40,   top: 31 },
  { title: "Automotive & Transport",       left: 58,   top: 4 },
  { title: "Education &\nCoaching",        left: 43,   top: 69 },
  { title: "Healthcare",                   left: 52,   top: 54 },
  { title: "Fashion & Lifestyle",          left: 45,   top: 88 },
  { title: "Beauty & Wellness",            left: 63,   top: 88 },

  // Right, hung off the right edge so a long name grows inwards, never off-screen.
  { title: "Construction &\nReal Estate",  right: 0,   top: 0 },
  { title: "Electronics &\nTechnology",    right: 18,  top: 31 },
  { title: "Textiles & Garments",          right: 0,   top: 38 },
  { title: "Pharmacy & Medical Devices",   right: 16,  top: 61 },
  // Clear of the chakra, which sits around 75-81% across the hero.
  { title: "Jewellery & Accessories",      right: 1,   top: 85 },
];




/** Every chip size scales with the viewport, so the scatter holds its shape from 1200px up. */
const HeroIndustryChips: React.FC = () => (
  <Box
    aria-hidden
    sx={{
      // Below lg the copy sits on top of the artwork, with no room beside it.
      display: { xs: "none", lg: "block" },
      position: "absolute",
      // Full width: the chips on the left live in the band above the badge,
      // which is why every one of them is placed high in the layer.
      left: "2%",
      right: "1.5%",
      top: "2%",
      // The band stops where the artwork's skyline starts, so no chip is ever
      // drawn over a temple, a dome or the bridge.
      height: "26%",
      zIndex: 3,
      pointerEvents: "none",
    }}
  >
    {HERO_CHIPS.map((chip) => {
      const industry = industries.find((i) => i.title === chip.title);
      if (!industry) return null;
      return (
        <Stack
          key={chip.title}
          direction="row"
          alignItems="center"
          spacing="0.55vw"
          sx={{
            position: "absolute",
            ...(chip.right === undefined ? { left: `${chip.left}%` } : { right: `${chip.right}%` }),
            top: `${chip.top}%`,
            // Sized by the name it holds, never by the room left in the layer.
            width: "max-content",
            px: "clamp(8px, 0.6vw, 14px)",
            py: "clamp(4px, 0.32vw, 8px)",
            borderRadius: "999px",
            // No fill: the artwork shows through the pill, only the ring and the
            // lettering sit on top of it.
            bgcolor: "transparent",
            border: `1.5px solid ${alpha(industry.iconColor, 0.7)}`,
            boxShadow: `0 4px 14px ${alpha(industry.iconColor, 0.22)}`,
            // "pre", not "pre-line": the break the name carries, never one the
            // box forces on a chip that has run out of room.
            whiteSpace: "pre",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              bgcolor: "#ffffff",
              borderRadius: "999px",
              width: "clamp(21px, calc(1.4vw + 3px), 31px)",
              height: "clamp(24px, calc(1.9vw + 2px), 40px)",
              color: industry.iconColor,
              "& svg": { fontSize: "clamp(18px, calc(1.25vw + 3px), 28px)" },
            }}
          >
            {industry.icon}
          </Box>
          <Typography
            sx={{
              fontWeight: 700,
              lineHeight: 1.2,
              // Black, not the industry's colour: the icon and the ring already
              // carry that, and the name reads better against the artwork.
              color: "#0F172A",
              fontSize: "clamp(9px, calc(0.62vw + 1px), 14px)",
            }}
          >
            {industry.title}
          </Typography>
        </Stack>
      );
    })}
  </Box>
);

const HERO_RED_DARK = "#C70027";


const CTA_RED = "#E8002D";
const CTA_RED_HOVER = "#C90027";

// ── GET THE APP ─────────────────────────────────────────────────────────────

/** Store badge: dark pill with the logo and two lines of text. */
const AppStoreBadge: React.FC<{ icon: React.ReactNode; small: string; big: string; label: string }> = ({ icon, small, big, label }) => (
  <Box component="a" href="#" aria-label={label} sx={{
    display: "inline-flex", alignItems: "center", gap: 1.4, textDecoration: "none",
    bgcolor: "#0B0B0F", color: "#fff",
    px: { xs: 1.8, md: 2 }, py: { xs: 0.8, md: 0.85 },
    borderRadius: "10px",
    minWidth: 0,
    boxShadow: "0 8px 20px rgba(0,0,0,0.18)", transition: "all 0.18s",
    "&:hover": { transform: "translateY(-2px)", boxShadow: "0 12px 26px rgba(0,0,0,0.26)" },
  }}>
    {icon}
    <Box sx={{ textAlign: "left", lineHeight: 1 }}>
      <Typography sx={{ fontFamily: POPPINS, fontSize: { xs: "0.58rem", md: "0.66rem" }, color: "rgba(255,255,255,0.85)" }}>{small}</Typography>
      <Typography sx={{ fontFamily: POPPINS, fontSize: { xs: "1rem", md: "1.1rem" }, fontWeight: 600, mt: "2px", color: "#fff", whiteSpace: "nowrap" }}>{big}</Typography>
    </Box>
  </Box>
);

/** Placeholder QR mark until the real store link QR is generated. */
const AppQrMark: React.FC = () => (
  <Box component="svg" viewBox="0 0 21 21" sx={{ display: "block", width: "100%", height: "100%" }}>
    <rect x="0" y="0" width="7" height="7" fill="#111" rx="0.5"/><rect x="1" y="1" width="5" height="5" fill="#fff"/><rect x="2" y="2" width="3" height="3" fill="#111"/>
    <rect x="14" y="0" width="7" height="7" fill="#111" rx="0.5"/><rect x="15" y="1" width="5" height="5" fill="#fff"/><rect x="16" y="2" width="3" height="3" fill="#111"/>
    <rect x="0" y="14" width="7" height="7" fill="#111" rx="0.5"/><rect x="1" y="15" width="5" height="5" fill="#fff"/><rect x="2" y="16" width="3" height="3" fill="#111"/>
    <rect x="8" y="6" width="1" height="1" fill="#111"/><rect x="10" y="6" width="1" height="1" fill="#111"/><rect x="12" y="6" width="1" height="1" fill="#111"/>
    <rect x="6" y="8" width="1" height="1" fill="#111"/><rect x="6" y="10" width="1" height="1" fill="#111"/><rect x="6" y="12" width="1" height="1" fill="#111"/>
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
);

const APP_TRUST = [
  { icon: <VerifiedUserIcon />, title: "Secure & Reliable", sub: "Your data is always safe" },
  { icon: <CloudDoneIcon />,    title: "Works Offline",     sub: "Auto syncs when online" },
  { icon: <SupportAgentIcon />, title: "24/7 Support",      sub: "We're here to help" },
];

/**
 * The feature cards around the phone, placed on a 700 x 600 stage (the phone
 * artwork sits in its middle). `x`/`y` = card top-left, `lx`/`ly` = where its
 * dashed line meets the phone. Everything is converted to % of the stage.
 */
const APP_STAGE = { w: 700, h: 600 };
const APP_CARD = 108;
const APP_FEATURES: Array<{
  label: string; icon: React.ReactNode; color: string; side: "left" | "right";
  x: number; y: number; lx: number; ly: number; badge?: string;
}> = [
  { label: "Sales &\nBilling",            icon: <ShoppingCart strokeWidth={2} />,  color: "#E11D48", side: "left",  x: 62,  y: 70,  lx: 262, ly: 205 },
  { label: "Inventory\nManagement",       icon: <Package strokeWidth={2} />,       color: "#16A34A", side: "left",  x: 26,  y: 212, lx: 238, ly: 330 },
  { label: "Customer\nManagement",        icon: <PeopleAltRoundedIcon />,          color: "#F59E0B", side: "left",  x: 0,   y: 352, lx: 222, ly: 450 },
  { label: "Reports &\nInsights",         icon: <BarChartRoundedIcon />,           color: "#E11D48", side: "right", x: 566, y: 130, lx: 478, ly: 250 },
  { label: "Instant\nAlerts",             icon: <Bell strokeWidth={2} />,          color: "#E11D48", side: "right", x: 556, y: 268, lx: 462, ly: 372, badge: "3" },
  { label: "Multi-Branch\nManagement",    icon: <Store strokeWidth={2} />,         color: "#E11D48", side: "right", x: 540, y: 404, lx: 446, ly: 490 },
];

const pctW = (v: number) => `${(v / APP_STAGE.w) * 100}%`;
const pctH = (v: number) => `${(v / APP_STAGE.h) * 100}%`;

/** Phone artwork with the feature cards and dashed connectors around it. */
const AppPhoneStage: React.FC = () => (
  <Box sx={{
    position: "relative", width: "100%", maxWidth: 560, mx: "auto",
    aspectRatio: `${APP_STAGE.w} / ${APP_STAGE.h}`,
    containerType: "inline-size", // card text / icons scale with the stage (cqw)
  }}>
    {/* dashed connectors */}
    <Box component="svg" viewBox={`0 0 ${APP_STAGE.w} ${APP_STAGE.h}`} aria-hidden
      sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: { xs: "none", sm: "block" }, zIndex: 1 }}>
      {APP_FEATURES.map((f) => {
        const sx = f.side === "left" ? f.x + APP_CARD : f.x; // card edge facing the phone
        const sy = f.y + APP_CARD / 2;
        const mx = (sx + f.lx) / 2;
        return (
          <path key={f.label}
            d={`M ${sx} ${sy} C ${mx} ${sy}, ${mx} ${f.ly}, ${f.lx} ${f.ly}`}
            fill="none" stroke={alpha(APP_RED, 0.75)} strokeWidth="1.6" strokeDasharray="5 5" strokeLinecap="round" />
        );
      })}
    </Box>


    {/* phone */}
    <Box component="img" src={getAppImg} alt="Zodu mobile app dashboard" sx={{
      // 408 x 612 artwork: 372 wide = 558 tall, so it ends just inside the 600 stage
      position: "absolute", left: pctW(158), top: pctH(30), width: pctW(372), height: "auto",
      display: "block", zIndex: 2,
      filter: "drop-shadow(0 22px 34px rgba(15,23,42,0.18))",
    }} />

    {/* feature cards */}
    {APP_FEATURES.map((f) => (
      <Box key={f.label} sx={{
        position: "absolute", left: pctW(f.x), top: pctH(f.y), width: pctW(APP_CARD),
        aspectRatio: "1 / 1", zIndex: 3,
        display: { xs: "none", sm: "flex" }, flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: "1.2cqw",
        bgcolor: "#fff", borderRadius: "2.6cqw",
        boxShadow: "0 10px 26px rgba(15,23,42,0.10)",
        transform: "rotate(6deg)",
      }}>
        <Box sx={{ position: "relative", color: f.color, display: "flex", "& svg": { width: "5.4cqw", height: "5.4cqw", fontSize: "5.4cqw" } }}>
          {f.icon}
          {f.badge && (
            <Box sx={{
              position: "absolute", top: "-1.2cqw", right: "-1.6cqw",
              minWidth: "2.8cqw", height: "2.8cqw", px: "0.4cqw", borderRadius: "999px",
              bgcolor: APP_RED, color: "#fff", fontSize: "1.7cqw", fontWeight: 700, fontFamily: POPPINS,
              display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
            }}>{f.badge}</Box>
          )}
        </Box>
        <Typography sx={{
          fontFamily: POPPINS, fontWeight: 600, color: APP_NAVY, textAlign: "center",
          fontSize: "1.75cqw", lineHeight: 1.25, whiteSpace: "pre",
        }}>
          {f.label}
        </Typography>
      </Box>
    ))}
  </Box>
);

const GetAppSection: React.FC = () => (
  <Box sx={{ py: { xs: 3, md: 4 }, px: SX, bgcolor: LIGHT, fontFamily: POPPINS }}>
    <Box sx={{ maxWidth: SECTION_MAX_W, mx: "auto" }}>
      <Box sx={{
        position: "relative", overflow: "hidden",
        borderRadius: { xs: "20px", md: "26px" },
        bgcolor: "#fff",
        boxShadow: "0 14px 42px rgba(15,23,42,0.07)",
      }}>
        {/* soft pink shapes behind the phone */}
        <Box aria-hidden sx={{
          position: "absolute", right: "-12%", top: "-35%", width: "68%", height: "170%", borderRadius: "50%",
          background: `radial-gradient(closest-side, ${alpha("#FBC9CF", 0.75)}, ${alpha("#FDE4E7", 0.55)} 60%, transparent)`,
          zIndex: 0,
        }} />
        <Box aria-hidden sx={{
          position: "absolute", right: "-6%", bottom: "-55%", width: "60%", height: "100%", borderRadius: "50%",
          bgcolor: alpha("#FBD0D5", 0.45), zIndex: 0,
        }} />

        {/* dot patterns */}
        <Box aria-hidden sx={{
          position: "absolute", top: 36, right: 40, width: 110, height: 90, zIndex: 0,
          backgroundImage: `radial-gradient(${alpha(APP_RED, 0.35)} 1.5px, transparent 1.5px)`,
          backgroundSize: "16px 16px", display: { xs: "none", md: "block" },
        }} />
        <Box aria-hidden sx={{
          position: "absolute", bottom: 24, left: 20, width: 70, height: 110, zIndex: 0,
          backgroundImage: `radial-gradient(${alpha(APP_RED, 0.35)} 1.5px, transparent 1.5px)`,
          backgroundSize: "16px 16px", display: { xs: "none", md: "block" },
        }} />

        <Box sx={{
          position: "relative", zIndex: 1,
          display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: "center",
          gap: { xs: 3, md: 2 },
          px: { xs: 2.5, md: 5 }, py: { xs: 3, md: 3 },
        }}>
          {/* LEFT — copy */}
          <Box sx={{ flex: { md: "0 0 52%" }, minWidth: 0, width: "100%", textAlign: { xs: "center", md: "left" } }}>
            {/* eyebrow */}
            <Box sx={{
              display: "inline-flex", alignItems: "center", gap: 1,
              bgcolor: alpha(APP_RED, 0.08), border: `1px solid ${alpha(APP_RED, 0.12)}`,
              borderRadius: "999px", px: 1.8, py: 0.6, mb: { xs: 1.6, md: 1.8 },
            }}>
              <SmartphoneIcon sx={{ fontSize: 20, color: APP_RED }} />
              <Typography sx={{ fontFamily: POPPINS, fontWeight: 700, fontSize: { xs: "0.72rem", md: "0.8rem" }, letterSpacing: "0.14em", color: APP_RED }}>
                ZODU MOBILE APP
              </Typography>
            </Box>

            {/* heading */}
            <Typography component="h2" sx={{
              fontFamily: POPPINS, fontWeight: 800, color: APP_NAVY,
              fontSize: { xs: "2rem", sm: "2.4rem", md: "clamp(2.2rem, 2.9vw, 3rem)" },
              lineHeight: 1.1, letterSpacing: "-0.03em", mb: { xs: 1.5, md: 1.6 },
            }}>
              Your Whole Business,<br />
              In Your{" "}
              <Box component="span" sx={{
                color: APP_RED, position: "relative", display: "inline-block",
                "&::after": { content: '""', position: "absolute", left: 0, right: 0, bottom: { xs: -4, md: -6 }, height: { xs: 3, md: 4 }, borderRadius: "999px", bgcolor: APP_RED },
              }}>
                Pocket
              </Box>
            </Typography>

            {/* subtext */}
            <Typography sx={{
              fontFamily: POPPINS, color: APP_SLATE, lineHeight: 1.6,
              fontSize: { xs: "0.92rem", md: "clamp(0.92rem, 1vw, 1.1rem)" },
              maxWidth: 620, mx: { xs: "auto", md: 0 }, mb: { xs: 2.2, md: 2.4 },
            }}>
              Bill customers, track stock, check live reports and get instant alerts — anytime, anywhere. Free on iOS &amp; Android.
            </Typography>

            {/* Badges row + trust strip share one width and the same three equal
                columns, so their edges line up. */}
            <Box sx={{
              display: "grid", gap: { xs: 2, md: 2.2 },
              width: "100%", maxWidth: 720,
              mx: { xs: "auto", md: 0 },
            }}>
            {/* store badges + QR */}
            <Box sx={{
              display: "grid", alignItems: "stretch", gap: { xs: 1.5, md: 1.6 },
              gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(3, minmax(0, 1fr))" },
            }}>
              <AppStoreBadge label="Download Zodu on the App Store" small="Download on the" big="App Store"
                icon={<AppleIcon sx={{ fontSize: { xs: 26, md: 28 }, color: "#fff", flexShrink: 0 }} />} />
              <AppStoreBadge label="Get Zodu on Google Play" small="GET IT ON" big="Google Play"
                icon={<Box component="img" src={gPlayLogo} alt="" sx={{ width: { xs: 22, md: 24 }, height: { xs: 22, md: 24 }, objectFit: "contain", flexShrink: 0 }} />} />
              <Box sx={{
                display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 1.5,
                bgcolor: "#fff", borderRadius: "12px", border: `1px solid ${BORDER}`,
                boxShadow: "0 6px 20px rgba(0,0,0,0.06)", px: 1.2, py: 0.6,
              }}>
                <Box sx={{ width: 48, height: 48, flexShrink: 0 }}><AppQrMark /></Box>
                <Box sx={{ textAlign: "left" }}>
                  <Typography sx={{ fontFamily: POPPINS, fontWeight: 600, fontSize: "0.8rem", color: APP_NAVY, lineHeight: 1.2 }}>Scan to<br />Download</Typography>
                  <Typography sx={{ fontFamily: POPPINS, fontSize: "0.64rem", color: APP_SLATE, mt: 0.3, lineHeight: 1.3 }}>Point your camera<br />at the QR code</Typography>
                </Box>
              </Box>
            </Box>

            {/* trust strip */}
            <Box sx={{
              display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
              bgcolor: "#fff", borderRadius: "14px", border: `1px solid ${BORDER}`,
              boxShadow: "0 8px 22px rgba(15,23,42,0.05)",
              width: "100%", minWidth: 0,
            }}>
              {APP_TRUST.map((t, i) => (
                <Box key={t.title} sx={{
                  display: "flex", alignItems: "center", gap: 1.1, px: 1.5, py: 1.1, minWidth: 0,
                  justifyContent: { xs: "center", sm: "flex-start" },
                  borderLeft: { sm: i ? `1px solid ${BORDER}` : "none" },
                  borderTop: { xs: i ? `1px solid ${BORDER}` : "none", sm: "none" },
                }}>
                  <Box sx={{
                    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                    bgcolor: alpha(APP_RED, 0.1), color: APP_RED,
                    display: "flex", alignItems: "center", justifyContent: "center", "& svg": { fontSize: 19 },
                  }}>
                    {t.icon}
                  </Box>
                  <Box sx={{ textAlign: "left", minWidth: 0 }}>
                    <Typography sx={{ fontFamily: POPPINS, fontSize: "0.8rem", fontWeight: 600, color: APP_NAVY, lineHeight: 1.25 }}>{t.title}</Typography>
                    <Typography sx={{ fontFamily: POPPINS, fontSize: "0.7rem", color: APP_SLATE, lineHeight: 1.35 }}>{t.sub}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
            </Box>
          </Box>

          {/* RIGHT — phone with the feature cards */}
          <Box sx={{ flex: { md: "1 1 48%" }, minWidth: 0, width: "100%", maxWidth: { xs: 520, md: "none" } }}>
            <AppPhoneStage />
          </Box>
        </Box>
      </Box>
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
      <GlobalStyles styles={{
        "*": { boxSizing: "border-box" },
        "@keyframes heroVisualIn": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      }} />
      <Box sx={{ height: "100dvh", overflowY: "auto", overflowX: "hidden", bgcolor: "#fff", scrollBehavior: "smooth" }}>

        {/* ── NAV ─────────────────────────────────────────────────────────── */}
        <Box component="nav" sx={{
          position: "sticky", top: 0, zIndex: 1000,
          bgcolor: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 1px 14px rgba(15,23,42,0.05)",
          borderBottom: `1px solid ${BORDER}`,
        }}>
          {/* Main nav row */}
          <Box sx={{ height: NAV_H, px: { xs: 2.5, md: 6 }, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box sx={{ height: { xs: 30, md: 34 }, display: "flex", alignItems: "center", overflow: "hidden" }}>
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
                endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: "18px !important" }} />}
                sx={{
                  bgcolor: HERO_RED, color: "#fff", px: 2.25, py: 0.7, borderRadius: "10px",
                  fontSize: "0.88rem", fontWeight: 700,
                  display: { xs: "none", sm: "inline-flex" },
                  boxShadow: "0 8px 18px rgba(235,0,41,0.22)",
                  "&:hover": { bgcolor: "#d90025", transform: "translateY(-1px)", boxShadow: "0 10px 22px rgba(235,0,41,0.28)" },
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
                  endIcon={<ArrowForwardRoundedIcon />}
                  sx={{ bgcolor: HERO_RED, color: "#fff", fontWeight: 700, borderRadius: "10px", py: 1.1, "&:hover": { bgcolor: "#d90025" } }}>
                  Start Free Trial
                </Button>
              </Stack>
            </Box>
          )}
        </Box>

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        {/* Devices on the left, the pitch on the right; below lg they stack with
            the copy first, since a phone should read the promise before the screens. */}
        <Box
          component="section"
          aria-labelledby="hero-heading"
          sx={{
            bgcolor: "#fff",
            // Fills the screen under the navbar on every device. min-, not fixed,
            // height: a short landscape phone can still scroll the content.
            minHeight: HERO_SCREEN,
            boxSizing: "border-box",
            px: { xs: 2.5, sm: 4, md: 6, lg: "4vw" },
            py: { xs: 3, sm: 4, lg: "min(3vw, 4dvh)" },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: { xs: 3, lg: "min(2vw, 3dvh)" },
          }}
        >
          {/* Devices + copy; the benefits strip runs full width underneath. */}
          <Box
            sx={{
              flex: { lg: 1 },
              minHeight: 0,
              width: "100%",
              display: "flex",
              flexDirection: { xs: "column-reverse", lg: "row" },
              alignItems: "center",
              justifyContent: "center",
              gap: { xs: 3, sm: 4, lg: "3vw" },
            }}
          >
          {/* Devices. The picture is 1655px wide, and a flex item never shrinks
              below its own content unless it is told to, hence minWidth 0 on the
              column, or the artwork pushes the copy off the screen. */}
          <Box
            sx={{
              flex: { lg: "0 1 52%" },
              minWidth: 0,
              width: "100%",
              maxWidth: { xs: 560, sm: 680, lg: "none" },
              mx: { xs: "auto", lg: 0 },
            }}
          >
            <Box
              component="img"
              src={heroDevices}
              alt="Zodu running on a desktop, a tablet and a phone"
              sx={{
                display: "block",
                width: "auto",
                maxWidth: "100%",
                height: "auto",
                mx: "auto",
                // Leaves room for the copy above it on phones/tablets; on desktop for
                // the store badges below it (~80px), the benefits strip and its gap
                // (~100px) plus the section padding.
                maxHeight: {
                  xs: "30dvh",
                  sm: "36dvh",
                  lg: `calc(100dvh - ${NAV_H.md + 1}px - 2 * min(3vw, 4dvh) - 180px)`,
                },
              }}
            />

            {/* Store badges, centred under the devices, in the same pattern as
                the download section further down the page. */}
            <Stack
              direction="row"
              spacing={{ xs: 1.5, md: 2 }}
              justifyContent="center"
              flexWrap="wrap"
              useFlexGap
              sx={{ mt: { xs: 2, md: 2.5 } }}
            >
              <Box component="a" href="#" aria-label="Get Zodu on Google Play" sx={{
                display: "inline-flex", alignItems: "center", gap: 1.2, textDecoration: "none",
                bgcolor: "#000", color: "#fff",
                px: { xs: 1.8, md: 2.2 }, py: { xs: 0.9, md: 1.05 },
                borderRadius: "10px",
                boxShadow: "0 6px 18px rgba(0,0,0,0.22)", transition: "all 0.18s",
                "&:hover": { transform: "translateY(-2px)", boxShadow: "0 10px 26px rgba(0,0,0,0.3)" },
              }}>
                <Box component="img" src={gPlayLogo} alt="" sx={{ width: { xs: 22, md: 26 }, height: { xs: 22, md: 26 }, objectFit: "contain", flexShrink: 0 }} />
                <Box sx={{ textAlign: "left", lineHeight: 1 }}>
                  <Typography sx={{ fontSize: { xs: "0.5rem", md: "0.56rem" }, color: "rgba(255,255,255,0.8)", letterSpacing: "0.04em" }}>GET IT ON</Typography>
                  <Typography sx={{ fontSize: { xs: "0.85rem", md: "0.98rem" }, fontWeight: 700, mt: "2px", color: "#fff" }}>Google Play</Typography>
                </Box>
              </Box>

              <Box component="a" href="#" aria-label="Download Zodu on the App Store" sx={{
                display: "inline-flex", alignItems: "center", gap: 1.2, textDecoration: "none",
                bgcolor: "#000", color: "#fff",
                px: { xs: 1.8, md: 2.2 }, py: { xs: 0.9, md: 1.05 },
                borderRadius: "10px",
                boxShadow: "0 6px 18px rgba(0,0,0,0.22)", transition: "all 0.18s",
                "&:hover": { transform: "translateY(-2px)", boxShadow: "0 10px 26px rgba(0,0,0,0.3)" },
              }}>
                <AppleIcon sx={{ fontSize: { xs: 24, md: 28 }, color: "#fff", flexShrink: 0 }} />
                <Box sx={{ textAlign: "left", lineHeight: 1 }}>
                  <Typography sx={{ fontSize: { xs: "0.5rem", md: "0.56rem" }, color: "rgba(255,255,255,0.8)", letterSpacing: "0.04em" }}>Download on the</Typography>
                  <Typography sx={{ fontSize: { xs: "0.85rem", md: "0.98rem" }, fontWeight: 700, mt: "2px", color: "#fff" }}>App Store</Typography>
                </Box>
              </Box>
            </Stack>
          </Box>

          {/* Copy */}
          <Box sx={{ flex: { lg: "1 1 48%" }, minWidth: 0, width: "100%", textAlign: { xs: "center", lg: "left" } }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                display: "inline-flex",
                px: { xs: 1.5, lg: "0.9vw" },
                py: { xs: 0.6, lg: "0.4vw" },
                mb: { xs: 2, lg: "1.4vw" },
                borderRadius: "9999px",
                bgcolor: alpha(HERO_BLUE_SOFT, 0.95),
                border: `1px solid ${alpha(HERO_BLUE, 0.2)}`,
                color: HERO_BLUE,
                fontSize: { xs: "0.72rem", sm: "0.82rem", lg: "clamp(0.72rem, 0.85vw, 1.05rem)" },
                fontWeight: 700,
              }}
            >
              <VerifiedIcon sx={{ fontSize: { xs: 15, lg: "clamp(15px, 1.1vw, 22px)" }, flexShrink: 0 }} />
              <Box component="span">Trusted by 1,00,000+ Businesses Across India</Box>
            </Stack>

            <Typography
              component="h1"
              id="hero-heading"
              sx={{
                color: DARK,
                fontWeight: 800,
                lineHeight: 1.12,
                letterSpacing: "-0.03em",
                fontSize: {
                  xs: "clamp(1.8rem, 7.4vw, 2.5rem)",
                  sm: "2.6rem",
                  md: "3rem",
                  lg: "clamp(2rem, min(3.1vw, 5.6dvh), 4rem)",
                },
              }}
            >
              Smart Billing &amp;
              <Box component="span" sx={{ display: "block", color: HERO_NAVY }}>
                Business Management
              </Box>
              <Box component="span" sx={{ display: "block", color: CTA_RED }}>
                All in One Platform
              </Box>
            </Typography>

            <Typography
              sx={{
                mt: { xs: 2, lg: "1.2vw" },
                mx: { xs: "auto", lg: 0 },
                maxWidth: { xs: 520, lg: "44ch" },
                color: "#475569",
                fontWeight: 500,
                lineHeight: 1.55,
                fontSize: { xs: "1rem", sm: "1.08rem", lg: "clamp(0.95rem, min(1.15vw, 2.2dvh), 1.35rem)" },
              }}
            >
              Bill, manage, analyse and grow your business effortlessly with one
              powerful platform. No tech skills required.
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 1.5, sm: 2 }}
              alignItems="center"
              justifyContent={{ xs: "center", lg: "flex-start" }}
              sx={{ mt: { xs: 3, lg: "1.8vw" } }}
            >
              <Button
                variant="contained"
                disableElevation
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate("/signup")}
                sx={{
                  bgcolor: CTA_RED, color: "#fff", textTransform: "none", fontWeight: 700,
                  borderRadius: "10px", whiteSpace: "nowrap",
                  px: { xs: 3, lg: "1.8vw" }, py: { xs: 1.3, lg: "0.8vw" },
                  fontSize: { xs: "1rem", lg: "clamp(0.95rem, 1.05vw, 1.25rem)" },
                  boxShadow: `0 8px 20px ${alpha(CTA_RED, 0.3)}`,
                  "&:hover": { bgcolor: CTA_RED_HOVER },
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                Start Free Trial
              </Button>
              <Button
                variant="outlined"
                sx={{
                  bgcolor: "#fff", color: "#0F172A", textTransform: "none", fontWeight: 700,
                  borderRadius: "10px", borderColor: "#E2E8F0", whiteSpace: "nowrap",
                  px: { xs: 3, lg: "1.8vw" }, py: { xs: 1.3, lg: "0.8vw" },
                  fontSize: { xs: "1rem", lg: "clamp(0.95rem, 1.05vw, 1.25rem)" },
                  "&:hover": { bgcolor: "#F8FAFC", borderColor: "#CBD5E1" },
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                Book a Demo
              </Button>
            </Stack>

            {/* Four points: two per row on phones, four across from sm up */}
            {/* <Box
              sx={{
                mt: { xs: 3.5, lg: "2.2vw" },
                display: "grid",
                gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(4, minmax(0, 1fr))" },
                gap: { xs: 2.5, lg: "1.2vw" },
              }}
            >
              {HERO_FEATURES.map((f) => (
                <Box key={f.title} sx={{ textAlign: "center" }}>
                  <Box
                    aria-hidden
                    sx={{
                      width: { xs: 52, lg: "clamp(48px, 3.6vw, 78px)" },
                      height: { xs: 52, lg: "clamp(48px, 3.6vw, 78px)" },
                      mx: "auto",
                      mb: 1,
                      borderRadius: "50%",
                      bgcolor: f.bg,
                      color: f.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      "& svg": { fontSize: { xs: 26, lg: "clamp(24px, 1.8vw, 38px)" } },
                    }}
                  >
                    {f.icon}
                  </Box>
                  <Typography sx={{ fontWeight: 700, color: DARK, lineHeight: 1.25, fontSize: { xs: "0.95rem", lg: "clamp(0.9rem, 1.05vw, 1.25rem)" } }}>
                    {f.title}
                  </Typography>
                  <Typography sx={{ color: "#64748B", lineHeight: 1.35, fontSize: { xs: "0.8rem", lg: "clamp(0.75rem, 0.85vw, 1rem)" } }}>
                    {f.sub}
                  </Typography>
                </Box>
              ))}
            </Box> */}
          </Box>
          </Box>

          <FzBenefitsStrip />
        </Box>

        {/* The previous hero — artwork background with the industry chips.
            Switched off by HERO_LEGACY above rather than deleted. */}
        {HERO_LEGACY && (

<Box
  component="section"
  aria-labelledby="hero-heading"
  sx={{
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    width: "100%",
    bgcolor: HERO_BASE,
    flexDirection: { xs: "column", lg: "row" },

    // ✅ aspectRatio conflict remove (minHeight mattum height decide pannum)
    aspectRatio: "auto",

    // Per-screen hero height: full screen, vw-la cap (crop control)
    minHeight: {
      xs: "auto",
      lg: "min(calc(100vh - 72px), 50vw)",
      xl: "min(calc(100vh - 72px), 45vw)",
    },
    "@media (min-width: 1920px)": {
      minHeight: "min(calc(100vh - 72px), 44vw)",
    },
    "@media (min-width: 2560px)": {
      minHeight: "min(calc(100vh - 72px), 40vw)",
    },

    backgroundImage: {
      xs: "none",
      lg: `url(${heroImage})`,
    },
    backgroundRepeat: "no-repeat",
    // "cover" blew the artwork up to ~125% of the hero's width to fill its height,
    // cropping the sides. 110% shows more of it and frees a band along the top for
    // the industry chips; the colour behind it is sampled from the artwork's edge.
    backgroundSize: { xs: "cover", lg: "110% auto" },

    // ✅ Right edge eppavum full-ah theriyum, bottom-la gap varaadhu
    backgroundPosition: {
      lg: "right bottom",
      xl: "right bottom",
    },

    // Left soft white fade — enough to keep the heading legible over the artwork,
    // no more: at 0.88 it washed the whole left of the hero out.
    "&::before": {
      content: '""',
      position: "absolute",
      inset: 0,
      zIndex: 1,
      pointerEvents: "none",
      display: { xs: "none", lg: "block" },
      background: `linear-gradient(
        90deg,
        ${alpha("#FFFFFF", 0.62)} 0%,
        ${alpha("#FFFFFF", 0.48)} 22%,
        ${alpha("#FFFFFF", 0.22)} 36%,
        ${alpha("#FFFFFF", 0)} 46%
      )`,
    },
  }}
>
  {/* ============ TEXT ============ */}
  <Box
    sx={{
      position: "relative",
      zIndex: 2,
      width: "100%",
      maxWidth: {
        xs: "100%",
        sm: 640,
        md: 720,
        lg: "33%",
      },
      "@media (min-width: 2560px)": {
        maxWidth: "42%",
      },
      mx: { xs: "auto", lg: 0 },
      pl: { xs: 2, sm: 4, lg: "5.5vw" },
      pr: { xs: 2, sm: 4, lg: 2 },
      pt: { xs: 4, sm: 5, lg: 0 },
      pb: { xs: 2, sm: 3, lg: 0 },
      textAlign: { xs: "center", lg: "left" },

      // White glow: heading + checklist text
      "& h1, & span": {
        textShadow: {
          lg: `0 0 12px ${alpha("#FFFFFF", 0.9)}, 0 0 24px ${alpha("#FFFFFF", 0.7)}`,
        },
      },
    }}
  >
    {/* Badge */}
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{
        display: "inline-flex",
        maxWidth: { xs: "100%", lg: "none" },
        px: { xs: 1.5, lg: "0.9vw" },
        py: { xs: 0.6, lg: "0.4vw" },
        mb: { xs: 1.5, lg: 2 },
        borderRadius: "9999px !important",
        bgcolor: alpha(HERO_BLUE_SOFT, 0.95),
        border: `1px solid ${alpha(HERO_BLUE, 0.2)}`,
        color: HERO_BLUE,
        fontSize: {
          xs: "0.72rem",
          sm: "0.82rem",
          lg: "clamp(0.72rem, 0.95vw, 1.2rem)",
        },
        fontWeight: 700,
        textAlign: "left",
        whiteSpace: { lg: "nowrap" },
      }}
    >
      <VerifiedIcon
        sx={{
          fontSize: { xs: 15, lg: "clamp(15px, 1.2vw, 24px)" },
          flexShrink: 0,
        }}
      />
      <Box component="span" sx={{ textShadow: "none !important" }}>
        Trusted by 1,00,000+ Businesses Across India
      </Box>
    </Stack>

    {/* Heading */}
    <Typography
      component="h1"
      id="hero-heading"
      sx={{
        color: DARK,
        fontWeight: 800,
        lineHeight: 1.1,
        letterSpacing: "-0.03em",
        // One line, all of it. The whole title runs about 17.5em, so each size
        // keeps that inside the space it has: the copy column below lg, and from
        // lg the heading alone is allowed past the column into the sky above the
        // artwork (the subtitle and buttons stay in the narrow column).
        whiteSpace: "nowrap",
        width: "max-content",
        maxWidth: { xs: "100%", lg: "none" },
        mx: { xs: "auto", lg: 0 },
        fontSize: {
          xs: "clamp(1.05rem, 4.6vw, 1.9rem)",
          sm: "clamp(1.5rem, 3.6vw, 2.2rem)",
          md: "clamp(1.8rem, 3.4vw, 2.6rem)",
          lg: "clamp(1.9rem, 2.9vw, 4rem)",
          xl: "clamp(2.4rem, 2.9vw, 4.4rem)",
        },
      }}
    >
      Smart Billing &amp;{" "}
      <Box component="span" sx={{ color: HERO_NAVY }}>
        Business Management
      </Box>
    </Typography>

    {/* Subtitle */}
    <Typography
      sx={{
        mt: { xs: 1.5, lg: "1.2vw" },
        mx: { xs: "auto", lg: 0 },
        maxWidth: {
          xs: 480,
          sm: 560,
          lg: "32ch",
        },
        "@media (min-width: 2560px)": {
          maxWidth: "42ch",
        },
        color: "#334155",
        fontSize: {
          xs: "1rem",
          sm: "1.1rem",
          lg: "clamp(0.95rem, 1.5vw, 1.7rem)",
        },
        fontWeight: 500,
        lineHeight: 1.55,

        // Strong white glow (temple/palm lines maraiya)
        textShadow: {
          lg: `
            0 0 6px ${alpha("#FFFFFF", 1)},
            0 0 14px ${alpha("#FFFFFF", 0.95)},
            0 0 28px ${alpha("#FFFFFF", 0.8)}
          `,
        },
      }}
    >
      All-in-one POS solution to bill, manage, analyse and grow your
      business effortlessly. No tech skills required.
    </Typography>

    {/* Buttons */}
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={{ xs: 1.5, sm: 2 }}
      alignItems="center"
      justifyContent={{ xs: "center", lg: "flex-start" }}
      sx={{ mt: { xs: 2.5, lg: "2vw" } }}
    >
      <Button
        variant="contained"
        disableElevation
        endIcon={<ArrowForwardIcon />}
        sx={{
          bgcolor: CTA_RED,
          color: "#fff",
          textTransform: "none",
          fontWeight: 700,
          borderRadius: "10px",
          px: { xs: 3, lg: "2vw" },
          py: { xs: 1.3, lg: "0.9vw" },
          fontSize: { xs: "1rem", lg: "clamp(0.95rem, 1.1vw, 1.4rem)" },
          whiteSpace: "nowrap",
          boxShadow: `0 8px 20px ${alpha(CTA_RED, 0.3)}`,
          "&:hover": { bgcolor: CTA_RED_HOVER },
          "& span": { textShadow: "none !important" },
        }}
      >
        Start Free Trial
      </Button>

      <Button
        variant="outlined"
        sx={{
          bgcolor: "#fff",
          color: "#0F172A",
          textTransform: "none",
          fontWeight: 700,
          borderRadius: "10px",
          borderColor: "#E2E8F0",
          px: { xs: 3, lg: "2vw" },
          py: { xs: 1.3, lg: "0.9vw" },
          fontSize: { xs: "1rem", lg: "clamp(0.95rem, 1.1vw, 1.4rem)" },
          whiteSpace: "nowrap",
          "&:hover": { bgcolor: "#F8FAFC", borderColor: "#CBD5E1" },
          "& span": { textShadow: "none !important" },
        }}
      >
        Book a Demo
      </Button>
    </Stack>

    {/* Checklist */}
    <Stack
      direction="row"
      spacing={{ xs: 2, lg: "1.6vw" }}
      alignItems="center"
      justifyContent={{ xs: "center", lg: "flex-start" }}
      flexWrap="wrap"
      useFlexGap
      sx={{ mt: { xs: 2, lg: "1.4vw" } }}
    >
      {["14-day free trial", "No credit card required"].map((item) => (
        <Stack key={item} direction="row" spacing={0.75} alignItems="center">
          <CheckCircleIcon
            sx={{
              color: HERO_BLUE,
              fontSize: { xs: 18, lg: "clamp(16px, 1.25vw, 26px)" },
            }}
          />
          <Typography
            component="span"
            sx={{
              color: "#475569",
              fontWeight: 500,
              fontSize: {
                xs: "0.85rem",
                lg: "clamp(0.8rem, 0.95vw, 1.2rem)",
              },
            }}
          >
            {item}
          </Typography>
        </Stack>
      ))}
    </Stack>
  </Box>

  {/* Industries, scattered across the artwork's top right corner */}
  {/* <HeroIndustryChips /> */}

  {/* MOBILE IMAGE */}
  <Box
    aria-hidden
    sx={{
      display: { xs: "block", sm: "none" },
      width: "100%",
      lineHeight: 0,
      overflow: "hidden",
    }}
  >
    <Box
      component="img"
      src={heroImage}
      alt=""
      sx={{
        display: "block",
        width: "100%",
        height: "auto",
      }}
    />
  </Box>

  {/* TABLET IMAGE */}
  <Box
    aria-hidden
    sx={{
      display: { xs: "none", sm: "block", lg: "none" },
      width: "100%",
      aspectRatio: { sm: "16 / 9", md: "2 / 1" },
      backgroundImage: `url(${heroImage})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
      backgroundPosition: "right bottom",
    }}
  />
</Box>
        )}

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

       
        {/* ── WHAT ZODU DOES FOR YOU ──────────────────────────────────────── */}
        <WhatZoduDoesSection />

        {/* ── INDUSTRIES ───────────────────────────────────────────────────── */}
        <IndustriesSection />

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
{/* <Box sx={{ bgcolor: "#fff", py: { xs: 1.5, md: 2 }, px: SX, position: "relative", overflow: "hidden" ,mb: { xs: 1, md: 2 }}}>
  
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
</Box> */}
{/* ── HOW ITS WORK─────────────────────────────────────────────────── */}

{/* <Box sx={{ bgcolor: "#fff", py: { xs: 1.5, md: 2 }, px: SX, position: "relative", overflow: "hidden" ,mb: { xs: 1, md: 2 }}}>

  <Box sx={{ maxWidth: SECTION_MAX_W, mx: "auto", position: "relative", zIndex: 1 }}>
    <Box textAlign="center" mb={{ xs: 1, md: 1.4 }}>
      <Typography sx={{ color: PRIMARY, fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", mb: 0.2, lineHeight: 1.5 }}>
        HOW IT WORKS
      </Typography>
      <Typography sx={{ fontSize: { xs: "1.3rem", md: "1.75rem" }, fontWeight: 800, color: DARK, letterSpacing: "-0.025em", mb: 0.4, lineHeight: 1.4 }}>
        Up and Running in 3 Simple Steps
      </Typography>
      <Typography sx={{ fontSize: "0.8rem", color: GRAY, maxWidth: 460, mx: "auto", lineHeight: 1.8 }}>
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
            <Typography sx={{ fontWeight: 850, fontSize: "0.88rem", color: DARK, mb: 0.3, lineHeight: 1.6 }}>{step.title}</Typography>
            <Typography sx={{ fontSize: "0.74rem", color: GRAY, lineHeight: 1.8, mb: 1 }}>{step.desc}</Typography>
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
      <Typography sx={{ fontSize: "0.68rem", color: GRAY, mt: 0.5, lineHeight: 1.7 }}>
        14-day free trial · Full access · Cancel anytime
      </Typography>
    </Box>
  </Box>
</Box> */}

{/* ── WHO IS IT FOR ─────────────────────────────────────────────────── */}
{/* <Box sx={{ bgcolor: LIGHT, py: { xs: 1.5, md: 2 }, px: SX, position: "relative", overflow: "hidden",mb: { xs: 6, md: 8 }, }}>
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
</Box> */}
{/* <Box sx={{ bgcolor: LIGHT, py: { xs: 1.5, md: 2 }, px: SX, position: "relative", overflow: "hidden",mb: { xs: 6, md: 8 }, }}>
  <Box sx={{ maxWidth: SECTION_MAX_W, mx: "auto" }}>
    <Box textAlign="center" mb={{ xs: 1.2, md: 1.5 }}>
      <Typography sx={{ color: PRIMARY, fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", mb: 0.2, lineHeight: 1.5 }}>
        BUILT FOR EVERY BUSINESS
      </Typography>
      <Typography sx={{ fontSize: { xs: "1.3rem", md: "1.75rem" }, fontWeight: 800, color: DARK, letterSpacing: "-0.025em", lineHeight: 1.4 }}>
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
          <Typography sx={{ position: "relative", zIndex: 1, fontWeight: 800, fontSize: "0.75rem", color: DARK, mb: 0.15, lineHeight: 1.5 }}>{biz.title}</Typography>
          <Typography sx={{ position: "relative", zIndex: 1, fontSize: "0.6rem", color: GRAY, lineHeight: 1.7 }}>{biz.desc}</Typography>
        </Box>
      ))}
    </Box>
  </Box>
</Box> */}
        {/* ── PRICING ──────────────────────────────────────────────────────── */}
      {/* Intha outer wrapper/container-la mt (margin-top) add pannunga */}
<Box sx={{ mt: { xs: 4, md: 6 }, px: SX }}>
  <Box sx={{ maxWidth: SECTION_MAX_W, mx: "auto", display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 2.5, alignItems: "stretch" }}>
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
      }}>
        <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
          
          {plan.popular ? (
            <Box sx={{ display: "flex", justifyContent: "center", mb: 1.5 }}>
              <Box sx={{
                bgcolor: PRIMARY, 
                color: "#fff", 
                fontSize: "0.65rem", 
                fontWeight: 800,
                px: 2, 
                py: 0.5, 
                borderRadius: "999px", 
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                whiteSpace: "nowrap"
              }}>
                MOST POPULAR
              </Box>
            </Box>
          ) : (
            <Box sx={{ height: 26, mb: 1.5 }} />
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
        <GetAppSection />

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <Box component="footer" sx={{ position: "relative", overflow: "hidden", bgcolor: "#0B1220", color: "#fff", px: SX }}>
    <Box sx={{ maxWidth: SECTION_MAX_W, mx: "auto", position: "relative", zIndex: 1, pt: { xs: 3, md: 3.5 } }}>
      
      {/* Logo and CTA Box in a single row */}
      <Box sx={{
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        alignItems: "center",
        justifyContent: "space-between",
        gap: { xs: 2.5, lg: 4 },
      }}>
        {/* Logo */}
        <Box sx={{ display: "inline-flex", alignItems: "center", flexShrink: 0 }}>
          <img 
            src={zlogo} 
            alt="Zodu Logo" 
            style={{ 
              height: 34, 
              width: "auto", 
              objectFit: "contain",
              filter: "brightness(0) invert(1)" 
            }} 
          />
        </Box>

        {/* Ready to simplify your business Box */}
        <Box sx={{
          px: { xs: 2.5, md: 3 },
          py: { xs: 2, md: 2.25 },
          borderRadius: "18px",
          bgcolor: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.10)",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          gap: 2.5,
          backdropFilter: "blur(10px)",
          flex: 1,
          width: { xs: "100%", lg: "auto" }
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
      </Box>

      <Divider sx={{ mt: { xs: 3, md: 3.5 }, borderColor: "rgba(255,255,255,0.09)" }} />
      
      {/* Bottom section with Copyright, Social Icons, and Links */}
      <Box sx={{ py: 2, display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: "center", gap: { xs: 1.5, md: 2.5 } }}>
        <Typography sx={{ color: "#8B95A7", fontSize: "0.8rem" }}>
          © 2025 Zodu Technologies Pvt. Ltd. All rights reserved.
        </Typography>

        {/* Social Media Icons in the middle */}
        <Stack direction="row" spacing={1}>
          {[<FacebookIcon sx={{ fontSize: 18 }} />, <InstagramIcon sx={{ fontSize: 18 }} />, <LinkedInIcon sx={{ fontSize: 18 }} />, <YouTubeIcon sx={{ fontSize: 18 }} />].map((icon, i) => (
            <IconButton key={i} size="small" sx={{
              width: 34,
              height: 34,
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

        <Stack direction="row" spacing={2.5}>
          {["Privacy", "Terms", "Sitemap"].map((l) => (
            <Typography key={l} sx={{ color: "#8B95A7", fontSize: "0.8rem", cursor: "pointer", "&:hover": { color: "#fff" } }}>{l}</Typography>
          ))}
        </Stack>
      </Box>
    </Box>
  </Box>
      </Box>
    </ThemeProvider>
  );
};

export default ZoduLandingPage;
