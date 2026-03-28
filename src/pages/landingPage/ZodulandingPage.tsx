import { useState, useEffect } from "react";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Divider from "@mui/material/Divider";
import LinearProgress from "@mui/material/LinearProgress";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";

import SellIcon from "@mui/icons-material/Sell";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import HubIcon from "@mui/icons-material/Hub";
import PaymentsIcon from "@mui/icons-material/Payments";
import GroupsIcon from "@mui/icons-material/Groups";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CategoryIcon from "@mui/icons-material/Category";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import DescriptionIcon from "@mui/icons-material/Description";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import HistoryIcon from "@mui/icons-material/History";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import TimeToLeaveIcon from "@mui/icons-material/TimeToLeave";
import PublicIcon from "@mui/icons-material/Public";
import ChatIcon from "@mui/icons-material/Chat";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";

const theme = createTheme({
  palette: { primary: { main: "#af101a" } },
  typography: { fontFamily: "'Poppins', sans-serif" },
  components: { MuiButton: { styleOverrides: { root: { textTransform: "none" } } } },
});

const RED = "#af101a";

const features = [
  { icon: <ReceiptLongIcon sx={{ fontSize: 40 }} />, ic: RED, ib: "rgba(175,16,26,0.1)", title: "GST Billing & Invoicing", desc: "Create professional, tax-compliant invoices in seconds. Automate payment reminders and track outstanding dues with surgical precision. Our system handles the complexities so you don't have to.", imgLeft: true, extra: "arrow", img: "https://lh3.googleusercontent.com/aida/ADBb0uhvslBh3nihg7za-lWRl4wLS9DXx8Pm45Zwwc_5GZ1f9CMLdcuzHmJUt1VuBHBdeHRNuU_sAFfvo5dWwSinyCSy7ZQdSRWRLmy4nLpsD2Q6Xg3JChADY0e3KqzHHQ0laeyS2f_pZbbysBVYpLPcEEewd_SjMQYP34p3ssaQLehMq1Rwlpng_vm-47Ug5UpjtF5QW3qEC5rvvFf50TMJDbMIqWWFhjgEYFT0DvKIqvD2iumAOhilmikjzTZjPz6nK4RxiWuLqCbHXQ" },
  { icon: <Inventory2Icon sx={{ fontSize: 40 }} />, ic: "#005f7b", ib: "rgba(0,95,123,0.1)", title: "Smart Inventory Tracking", desc: "Real-time stock monitoring with intelligent low-stock alerts and automated replenishment insights. Maintain the perfect balance of supply and demand across your entire network.", imgLeft: false, extra: "inventory", img: "https://lh3.googleusercontent.com/aida/ADBb0uhM-4DUzzxy1Tom3pQvbqBAHqmhLmGTYGLJHvlWGyCkV6-Nud1uyAG6PL2FjdQoeOYEjAgSh1fxxtWWgQKBT9574ja6ALuhIm_lgL4vgyBJt6FgvXoFxEw-zQxeeTQiRMupUQ7sYWCKqw3rw6w21hIO_kKS76R0nep4iyDjfg356dsNIhOR7sxcwjQfNNkahaS70GS9mTsU9lD7cpXBg1m15SI8cVG4RRdUihKnH_FIaD8M_mLQzkjunfPsEnkhakJ-oG-OkO_f" },
  { icon: <AnalyticsIcon sx={{ fontSize: 40 }} />, ic: "#9f3f39", ib: "rgba(159,63,57,0.1)", title: "Financial Reporting", desc: "Gain absolute clarity with automated P&L statements, balance sheets, and tax reports generated in real-time from your operations.", imgLeft: true, extra: "arrow", img: "https://lh3.googleusercontent.com/aida/ADBb0ughykZTPyQeWhJyHANi24VwUvUIQdDCBnc9WaAoIHyNzW4c4sA-O25ERNmzk_TIrzZwR1et49CleQE82idlbtUoJPKmlJ3YJH0JAmwXfqalyqPNRkUqSibx0WUb0HVO8DN74C4ToeDfVbl111q4ljPj3w4LWMgzIFBtHK2AoRsmN0c_ryqG5wkfv_7pV5Sch6tECI1zoSWLkjf6usEWQpeZXaS8AiNIbOXHXqOGyQbLFzRrFVdPYiSsl2TjPO1NTxmHBuGVhu8Ulg" },
  { icon: <HubIcon sx={{ fontSize: 40 }} />, ic: RED, ib: "rgba(175,16,26,0.1)", title: "Multi-Branch Control", desc: "Manage multiple business locations from a single dashboard. Synchronize data across all branches instantly and maintain total oversight.", imgLeft: false, extra: "branches", img: "https://lh3.googleusercontent.com/aida/ADBb0uhJaURc17gKP0n1BepSX_AfJOiR8XPAR1sVbL-4rccBssq7mKqRanBOkPv_HpDDEC-lMRMC1Wo0deYHRyNE1SJd5o-Q4VZIRGL-Yevflz06rrjAY2Jg0KtdVbIwt6ypRFf3QdWHy6D0-hVQmCPdirj3E0uo5RCgxuTHkuX2w4uNM3xIicSCXwH7R5heMB9tvhkw0-SskDRvLtl6I0WzI1EFv7v_7yYYmrUNB8oo8k5XU5rrCjOu6OHoFSbt9O9o6jyhYAx445bGWQ" },
  { icon: <PaymentsIcon sx={{ fontSize: 40 }} />, ic: "#9f3f39", ib: "rgba(159,63,57,0.1)", title: "Expense Management", desc: "Take control of your spending with advanced tools designed for modern financial tracking.", imgLeft: true, extra: "expense", img: "https://lh3.googleusercontent.com/aida/ADBb0uhTokp3Ij1zoL_3fCMLfol6-fsCE1MhJXeRIIU8LgcY-PFfc3cT8WVl90iQONX1JI0W5Cu3--bzkRyifSrhbcN8PKpYvwOYOqODmpBIewMtrqlXjoDiFp-li_74BfkfJGzNKQ-d6aXMS51LkEFysC5kUqQWUWAKxAt1UR25O3HvraX-AVt_9KiSEjdEEhQINT3MKcJAZpYHkSYI6Lj78N6cotO4W36VS8Kev_VIjgk8J_ASsaOJ2rxurCKHuIAxYXChTBIK_LUjvg" },
  { icon: <GroupsIcon sx={{ fontSize: 40 }} />, ic: "#00799c", ib: "rgba(0,121,156,0.1)", title: "Employee Management & Payroll", desc: "Simplify your workforce operations. Automate monthly payroll, manage direct salary disbursements, and track employee attendance with integrated biometrics or mobile check-ins.", imgLeft: false, extra: "payroll", img: "https://lh3.googleusercontent.com/aida/ADBb0uiQa5YW_TrOEpZjNAIpZIck7lFRdcYrLQQn4u4LXjAlgcpjYlmzGsMUmsIE4pVtGNt-KytV2b__QhtUV0GI9i4tMfrXl56ZjExiyyC-P7iV-nv74Q1ZLnmslWyJOkrkvDx3SRWVRDPSGeSv_xoBJVHUoCwoL8lJaypeYv7m9BsKZvGe0d4MaCKA_eRWjxk_D7tOPNA9w-1xW0aKiBEAHBdhUGF3a3KcmKBrrZZg4v8Lp3Pz7x_wlKwdWY8G646qMdU5IjfKtd-g9A" },
  { icon: <CalendarMonthIcon sx={{ fontSize: 40 }} />, ic: RED, ib: "rgba(175,16,26,0.1)", title: "Attendance Management", desc: "Effortlessly track employee work hours with automated check-ins and real-time reporting.", imgLeft: true, extra: "attendance", img: "https://lh3.googleusercontent.com/aida/ADBb0uhk19ikSGEO05xv7dXXS3zjtpi0JwFYGxQ1YHfY9hIayZmQRiBbw83Isl0rOfyI8vDlWaUuHemNRcHzk-caQCT0f2Is_uL7i_-LNEV6STNf368YmOkL5CQ20cPnuS_cPgCU0K2gsSQ2_-oBlqSizFLX16oFii7BkdkFRlXDARjcBqZ9n7_213dSChar0T2T7bEQkqqv5eQa3t8TAhYeOcpfJ_WC2DkeS-1-zJralEiTz3i1vRDWxnAjlEhRu0cpvOIwBh0ct6Ifng" },
  { icon: <FactCheckIcon sx={{ fontSize: 40 }} />, ic: "#005f7b", ib: "rgba(0,95,123,0.1)", title: "Daily Operations Checklist", desc: "Ensure operational excellence with digital checklists that keep your team accountable and organized.", imgLeft: false, extra: "checklist", img: "https://lh3.googleusercontent.com/aida/ADBb0ujuTTlIrXlMtp9538IdAL3oKPE_dTVfMfo9Nw1ASK7jOMiEc99UeJFAzsmRd6jaGU1UhqPXTUpbFe7cclN5qsxVFVQrK_JchRTNlTxeyClcZUKN1EYQRhVurYUDtl181rH7BiUaz4U6BiRFEsMn8T7BnD-eLa5I94DXlTeFph3WkjNFvQIrKhL63tqLicKuMM9LX9IORGJ-3SsmARFhJC5JyUZw8vlz2I5jZotHYxwj0-I7EJWymGXuV_LGLbetuwcBgpgidPQY7Q" },
];

function BulletList({ items }) {
  return (
    <Box sx={{ mt: 2.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
      {items.map(({ icon, label }) => (
        <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ color: RED, display: "flex", flexShrink: 0 }}>{icon}</Box>
          <Typography sx={{ fontWeight: 500, color: "#5b403d", fontSize: "0.93rem" }}>{label}</Typography>
        </Box>
      ))}
    </Box>
  );
}

function Extra({ type }) {
  if (type === "arrow") return (
    <Link href="#" underline="none" sx={{ display: "inline-flex", alignItems: "center", color: RED, fontWeight: 700, mt: 1.5, "& svg": { transition: "transform 0.2s" }, "&:hover svg": { transform: "translateX(6px)" } }}>
      <ArrowForwardIcon />
    </Link>
  );
  if (type === "inventory") return (
    <Box sx={{ mt: 3, p: 3, bgcolor: "#fff", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
        <Typography sx={{ fontWeight: 700, color: "#5b403d", fontSize: "0.82rem" }}>Global Stock Status</Typography>
        <Box sx={{ bgcolor: "rgba(186,26,26,0.1)", color: "#ba1a1a", fontWeight: 900, fontSize: "0.62rem", letterSpacing: "0.06em", px: 1.5, py: 0.5, borderRadius: "6px" }}>LOW ALERT</Box>
      </Box>
      <LinearProgress variant="determinate" value={25} sx={{ height: 10, borderRadius: 5, bgcolor: "#e1e3e4", "& .MuiLinearProgress-bar": { bgcolor: RED, borderRadius: 5 } }} />
      <Typography sx={{ mt: 1, color: "#5b403d", fontStyle: "italic", fontSize: "0.78rem", opacity: 0.8 }}>
        Automatic re-order triggered for "Central Warehouse"
      </Typography>
    </Box>
  );
  if (type === "branches") return (
    <Box sx={{ mt: 3, display: "flex", flexWrap: "wrap", gap: 1.5 }}>
      {["New York HQ", "London Hub", "Mumbai Branch"].map((b) => (
        <Box key={b} sx={{ px: 2.5, py: 1, bgcolor: "#e1e3e4", borderRadius: "999px", fontWeight: 700, fontSize: "0.82rem", color: "#191c1d", cursor: "default", border: "1px solid rgba(0,0,0,0.07)", transition: "all 0.2s", "&:hover": { bgcolor: RED, color: "#fff" } }}>{b}</Box>
      ))}
    </Box>
  );
  if (type === "expense") return <BulletList items={[{ icon: <PhotoCameraIcon sx={{ fontSize: 20 }} />, label: "Snap & Save Receipts" }, { icon: <CategoryIcon sx={{ fontSize: 20 }} />, label: "Automated Expense Categorization" }, { icon: <QueryStatsIcon sx={{ fontSize: 20 }} />, label: "Real-time Budget Tracking" }]} />;
  if (type === "payroll") return <BulletList items={[{ icon: <PaymentsIcon sx={{ fontSize: 20 }} />, label: "Automated Salary Computations" }, { icon: <EventAvailableIcon sx={{ fontSize: 20 }} />, label: "Real-time Attendance Tracking" }, { icon: <DescriptionIcon sx={{ fontSize: 20 }} />, label: "One-click Payslip Generation" }]} />;
  if (type === "attendance") return <BulletList items={[{ icon: <ScheduleIcon sx={{ fontSize: 20 }} />, label: "Digital Clock-in/out" }, { icon: <PendingActionsIcon sx={{ fontSize: 20 }} />, label: "Automated Timesheets" }, { icon: <TimeToLeaveIcon sx={{ fontSize: 20 }} />, label: "Leave Tracking" }]} />;
  if (type === "checklist") return <BulletList items={[{ icon: <PlaylistAddCheckIcon sx={{ fontSize: 20 }} />, label: "Customizable Task Lists" }, { icon: <HistoryIcon sx={{ fontSize: 20 }} />, label: "Recurring Checklists" }, { icon: <AssignmentIndIcon sx={{ fontSize: 20 }} />, label: "Team Assignment & Tracking" }]} />;
  return null;
}

function FeatureRow({ f }) {
  const imgBlock = (
    <Box sx={{ width: "47%", flexShrink: 0 }}>
      <Box sx={{ padding: "14px", borderRadius: "36px", bgcolor: "#fff", boxShadow: "0 20px 48px -12px rgba(25,28,29,0.1)", overflow: "hidden", "&:hover img": { transform: "scale(1.0)" } }}>
        <Box component="img" src={f.img} alt={f.title} sx={{ width: "100%", display: "block", borderRadius: "24px", objectFit: "cover", transform: "scale(1.04)", transition: "transform 0.7s ease" }} />
      </Box>
    </Box>
  );

  const textBlock = (
    <Box sx={{ width: "47%", flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 2.5 }}>
      <Box sx={{ width: 70, height: 70, borderRadius: "18px", bgcolor: f.ib, display: "flex", alignItems: "center", justifyContent: "center", color: f.ic, flexShrink: 0 }}>{f.icon}</Box>
      <Typography sx={{ fontSize: "1.9rem", fontWeight: 800, color: "#191c1d", lineHeight: 1.2 }}>{f.title}</Typography>
      <Typography sx={{ fontSize: "1rem", color: "#5b403d", lineHeight: 1.8, fontWeight: 300 }}>{f.desc}</Typography>
      <Extra type={f.extra} />
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: "6%" }}>
      {f.imgLeft ? imgBlock : textBlock}
      {f.imgLeft ? textBlock : imgBlock}
    </Box>
  );
}

export default function ZodulandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const el = document.getElementById("zodu-root");
    if (!el) return;
    const h = () => setScrolled(el.scrollTop > 20);
    el.addEventListener("scroll", h);
    return () => el.removeEventListener("scroll", h);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; font-family: 'Poppins', sans-serif !important; }
        @keyframes zpulse { 0%,100%{opacity:1} 50%{opacity:.6} }
      `}</style>

      <Box id="zodu-root" sx={{ height: "100vh", overflowY: "auto", overflowX: "hidden", bgcolor: "#f8f9fa" }}>

        {/* ─── NAVBAR ─── */}
        <Box sx={{ position: "sticky", top: 0, zIndex: 1100, bgcolor: scrolled ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.88)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: scrolled ? "1px solid rgba(0,0,0,0.07)" : "none", boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.07)" : "none", transition: "all 0.3s" }}>
          <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 3, md: 6 }, py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography sx={{ fontWeight: 900, color: RED, fontSize: "2.6rem", letterSpacing: "-0.05em", lineHeight: 1 }}>zodu</Typography>
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 4, alignItems: "center" }}>
              {["Features", "Benefits", "Pricing", "FAQs"].map((item, i) => (
                <Link key={item} href="#" underline="none" sx={{ fontWeight: i === 0 ? 700 : 500, color: i === 0 ? RED : "#475569", borderBottom: i === 0 ? `2px solid ${RED}` : "none", pb: i === 0 ? 0.3 : 0, fontSize: "0.93rem", "&:hover": { color: "#d32f2f" }, transition: "color 0.2s" }}>{item}</Link>
              ))}
            </Box>
            <Button onClick={()=>navigate("/login")} variant="outlined" sx={{ borderRadius: "10px", px: 3.5, py: 1, fontWeight: 700, borderColor: RED, color: RED, borderWidth: "2px !important", "&:hover": { bgcolor: RED, color: "#fff", borderColor: RED } }}>Login</Button>
          </Box>
        </Box>

        {/* ─── HERO ─── */}
        <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 3, md: 6 }, py: { xs: 8, md: 14 }, textAlign: "center" }}>
          <Typography sx={{ fontSize: { xs: "2.4rem", md: "4.5rem" }, fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.025em", color: "#191c1d", mb: 3 }}>
            The Precise Pulse<br />
            <Box component="span" sx={{ color: RED }}>of Your Business.</Box>
          </Typography>
          <Typography sx={{ fontSize: { xs: "1rem", md: "1.15rem" }, color: "#5b403d", maxWidth: 650, mx: "auto", lineHeight: 1.85, fontWeight: 300, mb: 4 }}>
            Elevate your operations with Zodu. Seamless GST billing, real-time inventory tracking, and multi-location control in one elegant command center.
          </Typography>

          {/* Badge */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 2.5, py: 1, borderRadius: "999px", bgcolor: "rgba(175,16,26,0.08)", border: "1px solid rgba(175,16,26,0.2)", animation: "zpulse 2s infinite" }}>
              <SellIcon sx={{ fontSize: 16, color: RED }} />
              <Typography sx={{ color: RED, fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>Starting at Just Rs.99/Month</Typography>
            </Box>
          </Box>

          {/* CTAs */}
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap", mb: 5 }}>
            <Button size="large" sx={{ background: `linear-gradient(135deg,${RED},#d32f2f)`, color: "#fff", px: 4.5, py: 1.8, borderRadius: "12px", fontWeight: 700, fontSize: "1rem", boxShadow: "0 12px 28px rgba(175,16,26,0.28)", "&:hover": { transform: "scale(1.04)", background: `linear-gradient(135deg,${RED},#d32f2f)` }, transition: "transform 0.2s" }}>
              Get Started for Free
            </Button>
            <Button size="large" startIcon={<PlayCircleIcon />} sx={{ bgcolor: "#e7e8e9", color: "#191c1d", px: 4.5, py: 1.8, borderRadius: "12px", fontWeight: 700, fontSize: "1rem", "&:hover": { bgcolor: "#dddede" } }}>
              Watch Demo
            </Button>
          </Box>

          {/* Social proof */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
            <AvatarGroup max={3} sx={{ "& .MuiAvatar-root": { width: 42, height: 42, border: "2px solid #f8f9fa" } }}>
              <Avatar src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1DiBHGtzWT7XoPui-Z6UbGtNZH-1sDibD33wQt6UV3Rsn-tHLqRxd--3o4Wh1OyU0Uf-SmUSsPL4QF6UD5aDfR5GbCJQpV1nMtuq9KlxsriT1N4lF-GtFoNW-MAYDr4d7v0bosPS8bj0K6lLIkUHVt91RY3KcQFj0oU0fFCs2J1sdJxJo6XxlYIzw7TflG-XqBIu3SMYIyDkm-ufsuejVhbrjWV1ycphCBJyMHXB2apIAwc178tKqfdec0lSPKmlvJerScqPu_Tk" />
              <Avatar src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnfKLI_ZnkkXuPiVUHObgt8IPjY2Q_pW4-8JlfYq1v8C6ZtCwTwCkhm2qk3MSQAzSXtnjxgHoEexSASWxv5C8zNXH2yHcfcK67OwLR-0NcrFl-hdTvH42mQsvMGhqjqROF1tTS9s8qN1Kt4Ui_JETPEsnBk0CLxoyxZB8XEKIRyuV3Lb6fHCVKRDoFWGtwbO70le42drGgcQ6cs8ZhbpSVWPqhsFxxv6piWqFyMcAxN9Uj96ceMxz7klvACnFuBTQnvQcvfk26UcE" />
              <Avatar src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9QGpgam2X71VqI2Cpmfrk6Cn3f2j-orBxtAxaGMuU1iUJ26f4lvYWQ9vbGR-NWDD9pVKt2vVxbIb1NAtCP81Yp-CKyCEtdDacqHpP30nBEUB5aEVCtEf3-xocRu-S7gpIWOvo6nITxj9wQZRUtQzacsgW8TQjs7LzsD_bLQ65S2_WnbTgiNlvuC3Do9gRjNUxcwXPPZH_uprZTINHzH6JtmMNeDm4tkithqTJAMjvqwHCjwYmv6UxSfInvJDrY2Z6zwiE1afIOoI" />
            </AvatarGroup>
            <Typography sx={{ fontWeight: 500, color: "#5b403d", fontSize: "0.9rem" }}>
              Trusted by <Box component="span" sx={{ fontWeight: 700, color: RED }}>1 Lakh +</Box> business owners
            </Typography>
          </Box>
        </Box>

        {/* ─── CAPABILITIES ─── */}
        <Box sx={{ bgcolor: "#f3f4f5", py: { xs: 8, md: 14 } }}>
          <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 3, md: 6 } }}>
            <Box sx={{ mb: { xs: 7, md: 12 } }}>
              <Typography sx={{ color: RED, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", fontSize: "0.76rem", mb: 1.5 }}>Capabilities</Typography>
              <Typography sx={{ fontSize: { xs: "2rem", md: "3rem" }, fontWeight: 800, color: "#191c1d" }}>Engineered for Precision.</Typography>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 8, md: 14 } }}>
              {features.map((f) => <FeatureRow key={f.title} f={f} />)}
            </Box>
          </Box>
        </Box>

        {/* ─── CTA ─── */}
        <Box sx={{ py: { xs: 8, md: 12 }, px: { xs: 3, md: 6 } }}>
          <Box sx={{ maxWidth: 1280, mx: "auto", background: `linear-gradient(135deg,${RED},#d32f2f)`, borderRadius: "48px", p: { xs: 5, md: 11 }, textAlign: "center", color: "#fff", position: "relative", overflow: "hidden" }}>
            <Box sx={{ position: "absolute", top: -100, left: -100, width: 350, height: 350, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.07)", filter: "blur(70px)", pointerEvents: "none" }} />
            <Box sx={{ position: "absolute", bottom: -100, right: -100, width: 350, height: 350, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.07)", filter: "blur(70px)", pointerEvents: "none" }} />
            <Box sx={{ maxWidth: 680, mx: "auto", position: "relative", zIndex: 1 }}>
              <Typography sx={{ fontSize: { xs: "2.1rem", md: "3.8rem" }, fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.02em", mb: 2.5 }}>Ready to master your business?</Typography>
              <Typography sx={{ fontSize: "1.05rem", opacity: 0.9, fontWeight: 300, mb: 5 }}>Join 10,000+ business owners who are growing faster with Zodu. No credit card required to start.</Typography>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap", mb: 2.5 }}>
                <TextField type="email" placeholder="Enter your business email" value={email} onChange={(e) => setEmail(e.target.value)}
                  sx={{ width: { xs: "100%", sm: 340 }, "& .MuiOutlinedInput-root": { bgcolor: "#fff", borderRadius: "13px", fontSize: "0.95rem", color: "#191c1d", "& fieldset": { border: "none" }, "& input": { py: 1.9, px: 2.5 } } }} />
                <Button sx={{ bgcolor: "#191c1d", color: "#fff", borderRadius: "13px", px: 5, py: 1.9, fontWeight: 900, fontSize: "0.95rem", whiteSpace: "nowrap", "&:hover": { bgcolor: "#2e3132", transform: "scale(1.04)" }, transition: "all 0.2s" }}>Get Started</Button>
              </Box>
              <Typography sx={{ fontSize: "0.8rem", opacity: 0.7, fontWeight: 500 }}>Free 14-day trial • No setup fees • Cancel anytime</Typography>
            </Box>
          </Box>
        </Box>

        {/* ─── FOOTER ─── */}
        <Box component="footer" sx={{ bgcolor: "#f3f4f5", borderRadius: "48px 48px 0 0" }}>
          <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 3, md: 6 }, pt: { xs: 7, md: 10 }, pb: 7, display: "flex", flexWrap: "wrap", gap: { xs: 5, md: 6 } }}>
            <Box sx={{ flex: "1 1 220px", minWidth: 200 }}>
              <Typography sx={{ fontWeight: 900, color: RED, fontSize: "2.3rem", letterSpacing: "-0.05em", mb: 2, lineHeight: 1 }}>zodu</Typography>
              <Typography sx={{ color: "#64748b", fontWeight: 300, fontSize: "0.9rem", lineHeight: 1.75, mb: 3, maxWidth: 200 }}>Providing the precise pulse for modern businesses worldwide.</Typography>
              <Box sx={{ display: "flex", gap: 1.5 }}>
                {[<PublicIcon sx={{ fontSize: 18 }} />, <ChatIcon sx={{ fontSize: 18 }} />].map((icon, i) => (
                  <Box key={i} sx={{ width: 36, height: 36, borderRadius: "50%", bgcolor: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", cursor: "pointer", "&:hover": { bgcolor: RED, color: "#fff" }, transition: "all 0.2s" }}>{icon}</Box>
                ))}
              </Box>
            </Box>
            {[
              { title: "Product", links: ["Features", "Integrations", "Pricing", "Changelog"] },
              { title: "Company", links: ["About Us", "Careers", "Contact", "Partners"] },
              { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy"] },
            ].map((col) => (
              <Box key={col.title} sx={{ flex: "1 1 140px", minWidth: 130 }}>
                <Typography sx={{ fontWeight: 700, color: RED, fontSize: "0.98rem", mb: 3 }}>{col.title}</Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
                  {col.links.map((l) => (
                    <Link key={l} href="#" underline="none" sx={{ color: "#475569", fontWeight: 500, fontSize: "0.86rem", "&:hover": { color: RED }, transition: "color 0.2s" }}>{l}</Link>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
          <Divider sx={{ mx: { xs: 3, md: 6 }, borderColor: "rgba(0,0,0,0.07)" }} />
          <Box sx={{ py: 3.5, textAlign: "center" }}>
            <Typography sx={{ color: "#64748b", fontWeight: 500, fontSize: "0.85rem" }}>© 2024 Zodu. The Precise Pulse of Business.</Typography>
          </Box>
        </Box>

      </Box>
    </ThemeProvider>
  );
}