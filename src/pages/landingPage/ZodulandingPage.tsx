import React, { useState } from "react";
import {
  Box, Button, Container, Typography, Stack, Divider,
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

// import pos4 from "../../assets/Feature/pos4.png";
// import pos7 from "../../assets/Feature/pos7.png";
// import pos6 from "../../assets/Feature/pos6.png";

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
  Home as HomeIcon,
  Bolt as BoltIcon,
  MoreHoriz as MoreHorizIcon,
  ShoppingBag as ShoppingBagIcon,
} from '@mui/icons-material';


import ShieldIcon from '@mui/icons-material/Security';

import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';


import GroupIcon from '@mui/icons-material/Group';

import posbilling from "../../assets/Landingpage/pos-billing.png";
import inventoryImage from "../../assets/Landingpage/Inventory-Management.jpeg";
import CustomerManagementImage from "../../assets/Landingpage/Customer-Management.png";

import womenImage from "../../assets/Landingpage/women-image.png";
import attendanceImage from "../../assets/Landingpage/Attendance-Management.jpeg";

import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PaymentsRemindersImage from "../../assets/Landingpage/Payments-reminders.jpeg";

import ExpenseManagementImage from "../../assets/Landingpage/Expense-management.jpeg";
import purchaseManagementImg from "../../assets/Landingpage/purchase-management.jpeg";
import reportsAnalyticsImg from '../../assets/Landingpage/reportsAnalyticsImg.png';
import reportsAnalyticsFullyTransparentImg from "../../assets/Landingpage/reports-analytics-fully-transparent.png";
import CustomerManagementImage1 from "../../assets/Landingpage/Customer-management1.png";
import GSTComplianceImage2 from "../../assets/Landingpage/Gst-compliance&reports.png";

import posbilling1 from "../../assets/Landingpage/pos-billing1.png";
import PaymentsRemindersImage2 from "../../assets/Landingpage/payments&reminder.png";
import purchaseManagementImg2 from "../../assets/Landingpage/purchase-management1.png";
import ExpenseManagementImage2 from "../../assets/Landingpage/Expense-management1.png";

import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';

import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';

import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';

import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import DevicesRoundedIcon from '@mui/icons-material/DevicesRounded';

import WomanIcon from '@mui/icons-material/Woman';

import { Avatar } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import heroSectionBg from '../../assets/Landingpage/herosection_bg.png';
import heroSectionBgWide from '../../assets/Landingpage/herosection_bg_extended.webp';


import SendIcon from '@mui/icons-material/Send';

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
const SX = { xs: 3, md: 10 };          // section horizontal padding
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
const HERO_COPY_W = "min(29vw, 560px)";
const HERO_MASK_TOP = "linear-gradient(to bottom, transparent 0%, #000 12%)";   // mobile: fade artwork top into HERO_BASE
// Desktop artwork (herosection_bg_extended.webp) = the 1983×793 original with its own backdrop
// extended 1200px left, 600px up and 96px down (scripts/extend-hero-bg.py). HERO_WIDE_K
// scales the rendered height so the original part keeps the size that keeps its badges clear of
// the copy; the bottom extension lifts it off the hero's bottom edge.
const HERO_WIDE_K = (793 + 600 + 96) / 793;
const HERO_WIDE_MASK = "linear-gradient(to right, transparent 0%, #000 4%), linear-gradient(to bottom, transparent 0%, #000 6%)";
const NAV_H = { xs: 60, md: 64 };  // navbar row height; the hero subtracts it (+1px border) to fill the screen

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
// the viewport from 1440px up so the desktop layout keeps the reference proportions.
//   < 900px   POS + wide cards stack (text above photo); mini cards 1 → 2 columns
//   ≥ 900px   text overlays the photos' blank left side; mini cards on a 6-track grid (3 + 2)
//   ≥ 1200px  POS | Inventory + Attendance side by side
//   ≥ 1440px  five mini cards in one row — the reference layout
const FZ_RED = "#E5243B";
const FZ_INK = "#0F172A";
const FZ_TEXT = "#334155";
const FZ_MUTED = "#64748B";
const FZ_BORDER = "#E8ECF2";
const FZ_GREEN = "#16A34A";
const FZ_DESK = "@media (min-width: 1440px)";
const FZ_LAPTOP = "@media (min-width: 1200px) and (max-width: 1439.98px)";
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

const FzLabel: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 10 }) => (
  <Typography sx={{ fontSize: fz(size), color: FZ_MUTED, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{children}</Typography>
);

const FzValue: React.FC<{ children: React.ReactNode; size: number }> = ({ children, size }) => (
  <Typography sx={{ fontSize: fz(size), fontWeight: 800, color: FZ_INK, lineHeight: 1.25, whiteSpace: "nowrap" }}>{children}</Typography>
);

const FzRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: fz(6) }}>
    <Box component="span" sx={{ fontSize: fz(10), color: FZ_MUTED, minWidth: 0 }}>{label}</Box>
    <Box component="span" sx={{ fontSize: fz(10.5), fontWeight: 800, color: FZ_INK, whiteSpace: "nowrap" }}>{value}</Box>
  </Box>
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

const fzExpenses = [
  { label: "Rent", amount: "₹ 12,000", icon: <HomeIcon />, color: "#2563EB", bg: "#DBEAFE" },
  { label: "Utilities", amount: "₹ 6,250", icon: <LightbulbRoundedIcon />, color: "#EA580C", bg: "#FFEDD5" },
  { label: "Marketing", amount: "₹ 4,200", icon: <CampaignRoundedIcon />, color: FZ_GREEN, bg: "#DCFCE7" },
  { label: "Others", amount: "₹ 6,000", icon: <MoreHorizIcon />, color: "#D97706", bg: "#FEF3C7" },
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
const FZ_MINI_SIZES = "(min-width: 1440px) 12vw, (min-width: 900px) 28vw, (min-width: 600px) 50vw, 60vw";
const FZ_WIDE_SIZES = "(min-width: 1200px) 24vw, (min-width: 600px) 60vw, 100vw";
const fzPhotoUrls = import.meta.glob<string>("../../assets/Landingpage/feature-photos/*.webp", { eager: true, import: "default" });
const fzPhoto = (slug: string, widths: number[]): FzPhoto => {
  const url = (w: number) => fzPhotoUrls[`../../assets/Landingpage/feature-photos/${slug}-${w}.webp`];
  return { src: url(widths[widths.length - 1]), srcSet: widths.map((w) => `${url(w)} ${w}w`).join(", ") };
};
const fzCustomerPhoto = fzPhoto("customer", FZ_MINI_W);

type FzMini = {
  title: string;
  sub: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  photo: FzPhoto;
  alt: string;
  imagePos: string;
  imageFr: number;          // image column width relative to the data panel (reference ratios)
  learnMore?: "image" | "panel" | "panel-end";
  panel: React.ReactNode;
};

const fzMiniCards: FzMini[] = [
  {
    title: "Customer Management", sub: "Build lasting customer relationships.",
    icon: <PeopleAltRoundedIcon />, color: "#2563EB", bg: "#DBEAFE",
    photo: fzCustomerPhoto, alt: "Customer checking her loyalty rewards on her phone", imagePos: "38% center", imageFr: 0.95,
    learnMore: "panel",
    panel: (
      <Box sx={{ ...fzPanelSx, p: fz(9) }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: fz(8) }}>
          <Box aria-hidden="true" sx={{
            width: fz(30), height: fz(30), borderRadius: "50%", flexShrink: 0, border: "2px solid #fff",
            boxShadow: `0 0 0 1px ${FZ_BORDER}`, backgroundImage: `url("${fzCustomerPhoto.src}")`,  // quoted: dev URLs can contain parentheses
            backgroundSize: "380%", backgroundPosition: "42% 28%",
          }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: fz(11.5), fontWeight: 700, color: FZ_INK, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Priya Sharma</Typography>
            <Box component="span" sx={{ display: "inline-block", mt: fz(3), px: fz(6), py: fz(1.5), borderRadius: fz(4), bgcolor: "#FEF3C7", color: "#B45309", fontSize: fz(8.5), fontWeight: 700, lineHeight: 1.3 }}>
              Gold Customer
            </Box>
          </Box>
        </Box>
        <Box sx={{ mt: fz(10), display: "flex", flexDirection: "column", gap: fz(6) }}>
          <FzRow label="Total Orders" value="24" />
          <FzRow label="Total Spent" value="₹ 48,250" />
          <FzRow label="Loyalty Points" value="1,250" />
        </Box>
      </Box>
    ),
  },
  {
    title: "Payments & Reminders", sub: "Get paid on time with automated reminders.",
    icon: <AccountBalanceWalletOutlinedIcon />, color: "#EA580C", bg: "#FFEDD5",
    photo: fzPhoto("payments", FZ_MINI_W), alt: "Payment reminder being sent from the Zodu app", imagePos: "center 60%", imageFr: 1.1,
    panel: (
      <>
        <Box sx={{ ...fzPanelSx, p: fz(10) }}>
          <FzLabel>Outstanding Amount</FzLabel>
          <Box sx={{ mt: fz(4) }}><FzValue size={16}>₹ 18,750</FzValue></Box>
        </Box>
        <Box sx={{ ...fzPanelSx, p: fz(10), display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: fz(6) }}>
          <Box>
            <FzLabel>Reminders Sent</FzLabel>
            <Box sx={{ mt: fz(4) }}><FzValue size={16}>32</FzValue></Box>
          </Box>
          <SendIcon sx={{ fontSize: fz(20), color: FZ_RED, transform: "rotate(-30deg)", mb: fz(4), flexShrink: 0 }} />
        </Box>
      </>
    ),
  },
  {
    title: "GST Compliance & Reports", sub: "Stay 100% compliant with easy GST filing.",
    icon: <DescriptionOutlinedIcon />, color: "#2563EB", bg: "#DBEAFE",
    photo: fzPhoto("gst", FZ_MINI_W), alt: "GST compliance report with filing status on a desk", imagePos: "center 35%", imageFr: 1.8,
    learnMore: "image",
    panel: (
      <>
        {[["GSTR-1", "Filed"], ["GSTR-3B", "Filed"], ["E-Way Bill", "Generated"]].map(([title, status]) => (
          <Box key={title} sx={{ ...fzPanelSx, px: fz(8), py: fz(6), display: "flex", alignItems: "center", gap: fz(7) }}>
            <CheckCircleIcon sx={{ fontSize: fz(17), color: FZ_GREEN, flexShrink: 0 }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: fz(10.5), fontWeight: 700, color: FZ_INK, lineHeight: 1.2 }}>{title}</Typography>
              <Typography sx={{ fontSize: fz(9.5), color: FZ_MUTED, lineHeight: 1.2 }}>{status}</Typography>
            </Box>
          </Box>
        ))}
      </>
    ),
  },
  {
    title: "Expense Management", sub: "Track and control your business expenses.",
    icon: <PaymentOutlinedIcon />, color: FZ_GREEN, bg: "#DCFCE7",
    photo: fzPhoto("expense", FZ_MINI_W), alt: "Store staff reviewing monthly expenses on a tablet", imagePos: "70% 20%", imageFr: 1,
    panel: (
      <Box sx={{ ...fzPanelSx, p: fz(8), flex: 1 }}>
        <FzLabel>This Month</FzLabel>
        <Box sx={{ mt: fz(3), display: "flex", alignItems: "center", flexWrap: "wrap", columnGap: fz(6) }}>
          <FzValue size={13.5}>₹ 28,450</FzValue>
          <Box sx={{ display: "inline-flex", alignItems: "center", color: FZ_GREEN, fontSize: fz(10), fontWeight: 700 }}>
            <ArrowDownwardRoundedIcon sx={{ fontSize: fz(11) }} />8.4%
          </Box>
        </Box>
        <Box sx={{ mt: fz(8), display: "flex", flexDirection: "column", gap: fz(6) }}>
          {fzExpenses.map((e) => (
            <Box key={e.label} sx={{ display: "flex", alignItems: "center", gap: fz(5), fontSize: fz(9.5) }}>
              <Box sx={{ width: fz(16), height: fz(16), borderRadius: "50%", bgcolor: e.bg, color: e.color, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", "& svg": { fontSize: fz(10) } }}>
                {e.icon}
              </Box>
              <Box component="span" sx={{ flex: 1, minWidth: 0, color: FZ_TEXT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.label}</Box>
              <Box component="span" sx={{ color: FZ_INK, fontWeight: 700, whiteSpace: "nowrap" }}>{e.amount}</Box>
            </Box>
          ))}
        </Box>
      </Box>
    ),
  },
  {
    title: "Purchase Management", sub: "Manage suppliers, purchase orders & receipts.",
    icon: <ShoppingCartOutlinedIcon />, color: "#9333EA", bg: "#F3E8FF",
    photo: fzPhoto("purchase", FZ_MINI_W), alt: "Warehouse staff checking purchase orders on a tablet", imagePos: "30% center", imageFr: 1.37,
    learnMore: "panel-end",
    panel: (
      <>
        {[["Total Purchases", "₹ 1,25,000"], ["Purchase Orders", "12"], ["Pending Receipts", "5"]].map(([label, value]) => (
          <Box key={label} sx={{ ...fzPanelSx, px: fz(10), py: fz(6) }}>
            <FzLabel size={9.5}>{label}</FzLabel>
            <FzValue size={12.5}>{value}</FzValue>
          </Box>
        ))}
      </>
    ),
  },
];

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

      {/* 1200–1439px the card is taller than the artwork, so it sits lower: keep the list left of "Billing Made Simple". */}
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
      // 1200–1439px: the copy makes the card taller than the artwork's ratio; cropping would push
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
    aspectRatio: { sm: "2170 / 725", lg: "auto" },
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
        clear of the copy on cards that are tall for their width (1200–1439px); imagePos keeps the subject. */}
    <Box component="img" src={photo.src} srcSet={photo.srcSet} sizes={FZ_WIDE_SIZES} alt={alt} loading="lazy" decoding="async" sx={{
      display: "block", position: { sm: "absolute" }, inset: { sm: "0 0 0 auto" },
      width: { xs: "100%", sm: "auto" }, maxWidth: { xs: "none", sm: "60%" },
      height: { xs: "auto", sm: "100%" }, aspectRatio: { xs: "16 / 9", sm: "auto" },
      objectFit: "cover", objectPosition: imagePos,
      WebkitMaskImage: { sm: "linear-gradient(to right, transparent 0%, #000 12%)" },
      maskImage: { sm: "linear-gradient(to right, transparent 0%, #000 12%)" },
      // 1200–1439px the card is at its tallest relative to its width: keep the photo right of the copy
      // and give it a longer fade so the crop's left edge stays soft.
      [FZ_LAPTOP]: {
        maxWidth: "54%",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, #000 18%)",
        maskImage: "linear-gradient(to right, transparent 0%, #000 18%)",
      },
    }} />
  </Box>
);

const FzMiniCard: React.FC<{ card: FzMini }> = ({ card }) => (
  <Box sx={{ ...fzCardSx, borderRadius: fz(14), p: fz(10), pt: fz(9), display: "flex", flexDirection: "column", gap: fz(10) }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: fz(14) }}>
      <FzIconTile icon={card.icon} color={card.color} bg={card.bg} size={40} radius={10} iconSize={21} />
      <Box sx={{ minWidth: 0 }}>
        <Typography component="h3" sx={{ fontSize: fz(14.5), fontWeight: 800, color: FZ_INK, lineHeight: 1.25 }}>{card.title}</Typography>
        <Typography sx={{ mt: fz(2), fontSize: fz(11), color: FZ_MUTED, lineHeight: 1.35 }}>{card.sub}</Typography>
      </Box>
    </Box>

    <Box sx={{ flex: 1, display: "grid", gridTemplateColumns: `minmax(0, ${card.imageFr}fr) minmax(0, 1fr)`, gap: fz(12) }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: fz(8), minWidth: 0 }}>
        <Box component="img" src={card.photo.src} srcSet={card.photo.srcSet} sizes={FZ_MINI_SIZES} alt={card.alt} loading="lazy" decoding="async" sx={{
          display: "block", width: "100%", height: 0, flex: "1 1 auto",
          minHeight: fz(card.learnMore === "image" ? 108 : 128),
          objectFit: "cover", objectPosition: card.imagePos, borderRadius: fz(8),
        }} />
        {card.learnMore === "image" && <FzLearnMore size={11} />}
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: fz(8), minWidth: 0 }}>
        {card.panel}
        {card.learnMore === "panel" && <Box sx={{ mt: "auto", pl: fz(3) }}><FzLearnMore size={11} /></Box>}
        {card.learnMore === "panel-end" && <Box sx={{ mt: "auto", display: "flex", justifyContent: "flex-end" }}><FzLearnMore size={11} /></Box>}
      </Box>
    </Box>
  </Box>
);

const WhatZoduDoesSection: React.FC = () => (
  <Box component="section" id="what-zodu-does" aria-labelledby="fz-heading" sx={{
    scrollMarginTop: { xs: NAV_H.xs, md: NAV_H.md },
    "--fz-u": "1px",
    "@media (min-width: 1200px)": { "--fz-u": "0.9px" },
    [FZ_DESK]: { "--fz-u": "clamp(0.9px, calc((100vw - 80px) / 1520), 1px)", px: "40px" },
    bgcolor: HERO_BASE,
    px: { xs: 2, sm: 3, md: 4 },
    pt: { xs: 5, md: fz(28) },
    pb: { xs: 5, md: fz(32) },
  }}>
    <Box sx={{ maxWidth: 1520, mx: "auto", display: "flex", flexDirection: "column", gap: fz(10) }}>

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
        <Typography sx={{ mt: fz(8), mx: "auto", maxWidth: fz(640), fontSize: { xs: "0.95rem", lg: fz(15) }, color: "#475569", lineHeight: 1.5 }}>
          From billing and inventory to payments, GST, staff, and insights — Zodu brings every essential operation into one connected platform.
        </Typography>

        <Box sx={{
          // one row: scrolls below md, centred whenever it fits ("safe" falls back to start on overflow)
          mt: fz(22), display: "flex", gap: { xs: "8px", md: fz(14) }, justifyContent: "safe center",
          flexWrap: { xs: "nowrap", md: "wrap" }, overflowX: { xs: "auto", md: "visible" },
          mx: { xs: -2, sm: -3, md: 0 }, px: { xs: 2, sm: 3, md: 0 }, py: fz(4),
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
        </Box>
      </Box>

      {/* POS | Inventory + Attendance */}
      <Box sx={{ display: "grid", gap: fz(10), gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1.435fr) minmax(0, 1fr)" } }}>
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

      {/* Five module cards: 1 → 2 → 3 + 2 → 5 columns */}
      <Box sx={{
        display: "grid", gap: fz(10),
        gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(6, minmax(0, 1fr))" },
        "& > *": { gridColumn: { md: "span 2" } },
        "& > :nth-of-type(n+4)": { gridColumn: { md: "span 3" } },
        "& > :last-of-type": { gridColumn: { sm: "1 / -1", md: "span 3" } },
        [FZ_DESK]: {
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          "& > *, & > :nth-of-type(n+4), & > :last-of-type": { gridColumn: "auto" },
        },
      }}>
        {fzMiniCards.map((card) => <FzMiniCard key={card.title} card={card} />)}
      </Box>

      {/* Benefits strip */}
      <Box sx={{
        ...fzCardSx, borderRadius: fz(14), display: "grid",
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
      <Box sx={{ height: "100vh", overflowY: "auto", overflowX: "hidden", bgcolor: "#fff", scrollBehavior: "smooth" }}>

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
        {/* herosection_bg.png is the hero background, rendered once as an <img> so it loads
            with high priority. The artwork already contains the industry badges and tagline.
            lg+: full-bleed, anchored bottom-right. Its height is capped at 33vw so the leftmost
            baked-in badge (~23% into the artwork) always starts to the right of the copy, whose
            width is capped at 5.5vw padding + 29vw. Below lg the copy sits on top and the
            artwork bleeds edge-to-edge underneath. */}
        <Box
          component="section"
          aria-labelledby="hero-heading"
          sx={{
            position: "relative",
            overflow: "hidden",
            bgcolor: HERO_BASE,
            // lg: light scrim for text contrast only; it clears before the first baked-in badge (~34.5vw).
            "&::before": {
              content: '""',
              display: { xs: "none", lg: "block" },
              position: "absolute",
              inset: 0,
              zIndex: 1,
              pointerEvents: "none",
              background: `linear-gradient(90deg, ${alpha(HERO_BASE, 0.5)} 0, ${alpha(HERO_BASE, 0.25)} 20vw, ${alpha(HERO_BASE, 0)} 34vw)`,
            },
            display: "flex",
            flexDirection: "column",
            // Navbar + hero fill exactly one screen (the page scroll container is 100vh).
            minHeight: { xs: `calc(100vh - ${NAV_H.xs + 1}px)`, md: `calc(100vh - ${NAV_H.md + 1}px)` },
          }}
        >
          {/* Copy */}
          <Box
            sx={{
              position: "relative",
              zIndex: 2,
              width: "100%",
              maxWidth: { xs: 720, lg: "none" },
              mx: { xs: "auto", lg: 0 },
              my: "auto",               // centre the copy in the free height; artwork stays at the bottom
              pl: { xs: 2.5, sm: 4, md: 6, lg: "clamp(48px, 5.5vw, 112px)" },
              pr: { xs: 2.5, sm: 4, md: 6, lg: 4 },
              pt: { xs: 5, sm: 6 },
              pb: { xs: 4, sm: 5, lg: 6 },
              textAlign: { xs: "center", lg: "left" },
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                display: "inline-flex",
                maxWidth: "100%",
                px: { xs: 1.5, md: 1.75 },
                py: 0.75,
                mb: { xs: 2.5, md: 3 },
                borderRadius: "999px",
                bgcolor: alpha(HERO_BLUE_SOFT, 0.9),
                border: `1px solid ${alpha(HERO_BLUE, 0.18)}`,
                color: HERO_BLUE,
                fontSize: "clamp(0.78rem, 0.72rem + 0.25vw, 0.9rem)",
                fontWeight: 700,
                lineHeight: 1.3,
                textAlign: "left",
                // ~360px phones: wrap as "Trusted by 10,000+ / Businesses Across India" in a tight
                // two-line pill instead of orphaning "India".
                "@media (max-width: 380px)": { "& > span": { maxWidth: "24ch" } },
              }}
            >
              <VerifiedIcon sx={{ fontSize: 18, flexShrink: 0 }} />
              <Box component="span">Trusted by 10,000+ Businesses Across India</Box>
            </Stack>

            <Typography
              component="h1"
              id="hero-heading"
              sx={{
                maxWidth: { lg: HERO_COPY_W },
                color: DARK,
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: "-0.025em",
                fontSize: {
                  xs: "clamp(2.25rem, 9vw, 2.75rem)",
                  sm: "clamp(2.75rem, 6.5vw, 3.5rem)",
                  lg: "clamp(2.5rem, 3.4vw, 4.4rem)",
                },
              }}
            >
              Smart Billing &amp;{" "}
              <Box
                component="span"
                sx={{
                  display: { sm: "block" },
                  color: HERO_BLUE,
                  backgroundImage: `linear-gradient(90deg, ${HERO_NAVY} 0%, ${HERO_BLUE} 100%)`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Business Management
              </Box>
            </Typography>

            <Typography
              sx={{
                mt: { xs: 2.5, md: 3 },
                mx: { xs: "auto", lg: 0 },
                maxWidth: { xs: 540, lg: HERO_COPY_W },
                color: "#475569",
                fontSize: "clamp(1rem, 0.94rem + 0.3vw, 1.2rem)",
                lineHeight: 1.6,
              }}
            >
              All-in-one POS solution to bill, manage, analyse and grow your business effortlessly.
              No tech skills required.
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ mt: { xs: 3.5, md: 4 }, justifyContent: { sm: "center", lg: "flex-start" } }}
            >
              <Button
                variant="contained"
                onClick={() => navigate("/signup")}
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{
                  bgcolor: HERO_RED,
                  color: "#fff",
                  px: 3.5,
                  minHeight: 52,
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontWeight: 700,
                  boxShadow: "0 12px 24px rgba(235, 0, 41, 0.24)",
                  width: { xs: "100%", sm: "auto" },
                  transition: "transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease",
                  "&:hover": { bgcolor: "#d90025", transform: "translateY(-2px)", boxShadow: "0 16px 30px rgba(235, 0, 41, 0.3)" },
                  "&:focus-visible": { outline: `3px solid ${alpha(HERO_RED, 0.3)}`, outlineOffset: 3 },
                }}
              >
                Start Free Trial
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate("/signup")}
                sx={{
                  borderColor: "#CBD5E1",
                  color: DARK,
                  bgcolor: "#fff",
                  px: 3.5,
                  minHeight: 52,
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontWeight: 700,
                  width: { xs: "100%", sm: "auto" },
                  transition: "transform 0.18s ease, border-color 0.18s ease, background-color 0.18s ease, color 0.18s ease",
                  "&:hover": { borderColor: HERO_BLUE, color: HERO_BLUE, bgcolor: HERO_BLUE_SOFT, transform: "translateY(-2px)" },
                  "&:focus-visible": { outline: `3px solid ${alpha(HERO_BLUE, 0.3)}`, outlineOffset: 3 },
                }}
              >
                Book a Demo
              </Button>
            </Stack>

            <Box
              sx={{
                mt: 2.5,
                display: "flex",
                flexWrap: "wrap",
                justifyContent: { xs: "center", lg: "flex-start" },
                columnGap: 2.5,
                rowGap: 1,
                color: GRAY,
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              {["14-day free trial", "No credit card required"].map((point) => (
                <Box key={point} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <CheckCircleRoundedIcon sx={{ fontSize: 18, color: HERO_BLUE }} />
                  {point}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Background artwork. Desktop swaps in the extended version so the photo fills the whole
              hero; mobile shows the original below the copy with its top faded into HERO_BASE. */}
          <Box component="picture" sx={{ display: "contents" }}>
            <source media="(min-width: 1200px)" srcSet={heroSectionBgWide} />
            <Box
              component="img"
              src={heroSectionBg}
              alt="Zodu dashboard on phone, tablet and laptop — built for retail, restaurants, healthcare, education and logistics"
              fetchPriority="high"
              sx={{
                display: "block",
                flexShrink: 0,
                position: { xs: "relative", lg: "absolute" },
                right: { lg: 0 },
                bottom: { lg: 0 },
                width: { xs: "100%", lg: "auto" },
                // lg: the original part renders min(100%, 33vw - 12px) tall — the cap that keeps the
                // leftmost badge right of the copy; the extension fills the space around it.
                height: { xs: "auto", lg: `calc(min(100%, 33vw - 12px) * ${HERO_WIDE_K})` },
                maxWidth: "none",
                aspectRatio: { xs: "2 / 1", lg: "auto" },
                objectFit: "cover",
                objectPosition: "right center",
                WebkitMaskImage: { xs: HERO_MASK_TOP, lg: HERO_WIDE_MASK },
                maskImage: { xs: HERO_MASK_TOP, lg: HERO_WIDE_MASK },
                WebkitMaskComposite: { lg: "source-in" },
                maskComposite: { lg: "intersect" },
                "@media (prefers-reduced-motion: no-preference)": {
                  animation: "heroVisualIn 700ms ease-out both",
                },
              }}
            />
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

       
        {/* ── WHAT ZODU DOES FOR YOU ──────────────────────────────────────── */}
        <WhatZoduDoesSection />

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

<Box sx={{ bgcolor: "#fff", py: { xs: 1.5, md: 2 }, px: SX, position: "relative", overflow: "hidden" ,mb: { xs: 1, md: 2 }}}>
  
  <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
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
  </Container>
</Box>

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
<Box sx={{ bgcolor: LIGHT, py: { xs: 1.5, md: 2 }, px: SX, position: "relative", overflow: "hidden",mb: { xs: 6, md: 8 }, }}>
  <Container maxWidth="lg">
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
  </Container>
</Box>
        {/* ── PRICING ──────────────────────────────────────────────────────── */}
      {/* Intha outer wrapper/container-la mt (margin-top) add pannunga */}
<Box sx={{ mt: { xs: 4, md: 6 }, px: { xs: 2, md: 4 } }}>
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
    <Container maxWidth="lg" sx={{ px: { xs: 3, md: 6 }, position: "relative", zIndex: 1, py: { xs: 4, md: 5 } }}>
      
      {/* Logo and CTA Box in a single row */}
      <Box sx={{
        mt: { xs: 2, md: 3 },
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        alignItems: "center",
        justifyContent: "space-between",
        gap: 4,
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

      <Box sx={{ py: { xs: 3, md: 4 } }} />

      <Divider sx={{ borderColor: "rgba(255,255,255,0.09)" }} />
      
      {/* Bottom section with Copyright, Social Icons, and Links */}
      <Box sx={{ py: 2.5, display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: "center", gap: 2.5 }}>
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
    </Container>
  </Box>
      </Box>
    </ThemeProvider>
  );
};

export default ZoduLandingPage;
