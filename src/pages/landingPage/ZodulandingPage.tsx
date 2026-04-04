
import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  TextField,
  Stack,
  Avatar,
  AvatarGroup,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Link,
  IconButton,
} from "@mui/material";
import { createTheme, ThemeProvider, alpha } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";

import SellIcon from "@mui/icons-material/Sell";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import HubIcon from "@mui/icons-material/Hub";
import PaymentsIcon from "@mui/icons-material/Payments";
import GroupsIcon from "@mui/icons-material/Groups";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CategoryIcon from "@mui/icons-material/Category";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import DescriptionIcon from "@mui/icons-material/Description";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import TimeToLeaveIcon from "@mui/icons-material/TimeToLeave";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import HistoryIcon from "@mui/icons-material/History";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import PublicIcon from "@mui/icons-material/Public";
import ChatIcon from "@mui/icons-material/Chat";
import { useNavigate } from "react-router-dom";

const PRIMARY = "#af101a";
const PRIMARY_DARK = "#d32f2f";

const theme = createTheme({
  palette: {
    primary: { main: PRIMARY },
    background: { default: "#ffffff", paper: "#ffffff" },
    text: { primary: "#191c1d", secondary: "#5b403d" },
  },
  typography: { fontFamily: "'Inter', sans-serif" },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontFamily: "'Inter', sans-serif", fontWeight: 700 },
      },
    },
  },
});

// ─── Inline SVG Illustrations ─────────────────────────────────────────────────

const BillingIllustration = () => (
  <svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg" width="100%" style={{ height: "auto" }}>
    <rect width="480" height="300" fill="#FFF5F5" rx="16"/>
    <rect x="125" y="72" width="195" height="130" rx="10" fill="#1e293b"/>
    <rect x="135" y="82" width="175" height="110" rx="6" fill="#f8fafc"/>
    <rect x="147" y="96" width="78" height="7" rx="3.5" fill={PRIMARY}/>
    <rect x="147" y="109" width="110" height="4" rx="2" fill="#e2e8f0"/>
    <rect x="147" y="118" width="94" height="4" rx="2" fill="#e2e8f0"/>
    <rect x="147" y="127" width="100" height="4" rx="2" fill="#e2e8f0"/>
    <rect x="147" y="136" width="68" height="4" rx="2" fill="#e2e8f0"/>
    <rect x="147" y="152" width="46" height="16" rx="5" fill={PRIMARY}/>
    <text x="170" y="164" textAnchor="middle" fill="#fff" fontSize="8" fontFamily="Inter,sans-serif" fontWeight="600">SEND</text>
    <rect x="208" y="202" width="18" height="14" rx="2" fill="#475569"/>
    <rect x="183" y="214" width="68" height="8" rx="4" fill="#475569"/>
    <rect x="328" y="58" width="112" height="90" rx="12" fill="#fff" stroke="#fde8e8" strokeWidth="1.5"/>
    <rect x="341" y="74" width="55" height="6" rx="3" fill={PRIMARY}/>
    <rect x="341" y="86" width="72" height="3.5" rx="1.5" fill="#e2e8f0"/>
    <rect x="341" y="95" width="62" height="3.5" rx="1.5" fill="#e2e8f0"/>
    <rect x="341" y="104" width="66" height="3.5" rx="1.5" fill="#e2e8f0"/>
    <rect x="341" y="116" width="36" height="14" rx="5" fill={PRIMARY}/>
    <text x="359" y="127" textAnchor="middle" fill="#fff" fontSize="7" fontFamily="Inter,sans-serif" fontWeight="600">PAY</text>
    <circle cx="423" cy="62" r="13" fill="#22c55e"/>
    <polyline points="417,62 421,67 429,55" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="76" cy="118" r="22" fill="#fcd5b4"/>
    <ellipse cx="76" cy="99" rx="22" ry="11" fill="#7c3f1e"/>
    <rect x="52" y="138" width="48" height="65" rx="14" fill={PRIMARY}/>
    <rect x="98" y="150" width="36" height="10" rx="5" fill="#fcd5b4" transform="rotate(-12 98 150)"/>
    <circle cx="338" cy="52" r="8" fill={PRIMARY_DARK}/>
    <text x="338" y="56" textAnchor="middle" fill="#fff" fontSize="8" fontFamily="Inter,sans-serif" fontWeight="700">3</text>
  </svg>
);

const InventoryIllustration = () => (
  <svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg" width="100%" style={{ height: "auto" }}>
    <rect width="480" height="300" fill="#F0F9FF" rx="16"/>
    <rect x="30" y="228" width="420" height="9" rx="4" fill="#bae6fd"/>
    <rect x="30" y="154" width="420" height="8" rx="4" fill="#bae6fd"/>
    <rect x="30" y="86" width="420" height="7" rx="4" fill="#bae6fd"/>
    {[48,106,164,222,280,338,396].map((x,i)=>(
      <rect key={i} x={x} y={93} width={48} height={60} rx={6} fill={i===3?"#ef4444":i%2===0?"#0369a1":"#0ea5e9"} opacity={0.9}/>
    ))}
    {[48,106,164,222,280,338,396].map((x,i)=>(
      <rect key={i} x={x} y={162} width={48} height={64} rx={6} fill={i%2===0?"#0284c7":"#38bdf8"} opacity={0.85}/>
    ))}
    <text x="246" y="129" textAnchor="middle" fill="#fff" fontSize="20" fontFamily="Inter,sans-serif" fontWeight="700">!</text>
    <rect x="168" y="16" width="144" height="86" rx="12" fill="#1e293b"/>
    <rect x="178" y="26" width="124" height="66" rx="8" fill="#f8fafc"/>
    <rect x="186" y="34" width="58" height="6" rx="3" fill={PRIMARY}/>
    <rect x="186" y="45" width="94" height="3.5" rx="1.5" fill="#e2e8f0"/>
    <rect x="186" y="53" width="78" height="3.5" rx="1.5" fill="#e2e8f0"/>
    <rect x="186" y="63" width="94" height="8" rx="3" fill="#e2e8f0"/>
    <rect x="186" y="63" width="24" height="8" rx="3" fill="#ef4444"/>
    <text x="198" y="70" textAnchor="middle" fill="#fff" fontSize="6" fontFamily="Inter,sans-serif" fontWeight="700">LOW</text>
  </svg>
);

const FinancialIllustration = () => (
  <svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg" width="100%" style={{ height: "auto" }}>
    <rect width="480" height="300" fill="#FFFBEB" rx="16"/>
    {[
      {x:44,h:88,c:PRIMARY},{x:104,h:136,c:PRIMARY_DARK},
      {x:164,h:66,c:PRIMARY},{x:224,h:170,c:PRIMARY_DARK},
      {x:284,h:108,c:PRIMARY},{x:344,h:150,c:PRIMARY_DARK},
    ].map((b,i)=>(
      <rect key={i} x={b.x} y={244-b.h} width={46} height={b.h} rx={6} fill={b.c} opacity={0.88}/>
    ))}
    <line x1="28" y1="244" x2="448" y2="244" stroke="#e2e8f0" strokeWidth="2"/>
    <polyline points="67,178 127,130 187,196 247,88 307,150 367,106"
      fill="none" stroke="#0369a1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    {[67,127,187,247,307,367].map((x,i)=>{
      const ys=[178,130,196,88,150,106];
      return <circle key={i} cx={x} cy={ys[i]} r={5} fill="#fff" stroke="#0369a1" strokeWidth="2.5"/>;
    })}
    <rect x="330" y="22" width="122" height="70" rx="12" fill="#fff" stroke="#fde8e8" strokeWidth="1.5"/>
    <text x="391" y="44" textAnchor="middle" fill="#888" fontSize="10" fontFamily="Inter,sans-serif">Net Profit</text>
    <text x="391" y="64" textAnchor="middle" fill={PRIMARY} fontSize="18" fontWeight="800" fontFamily="Inter,sans-serif">₹2.4L</text>
    <text x="391" y="80" textAnchor="middle" fill="#22c55e" fontSize="10" fontFamily="Inter,sans-serif">▲ 18.2%</text>
  </svg>
);

const MultiBranchIllustration = () => (
  <svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg" width="100%" style={{ height: "auto" }}>
    <rect width="480" height="300" fill="#F0F4FF" rx="16"/>
    <ellipse cx="240" cy="178" rx="190" ry="108" fill="#e0e7ff" opacity="0.6"/>
    <circle cx="240" cy="152" r="34" fill={PRIMARY}/>
    <text x="240" y="158" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700" fontFamily="Inter,sans-serif">HQ</text>
    <line x1="240" y1="152" x2="102" y2="232" stroke={PRIMARY} strokeWidth="2.5" strokeDasharray="6,4" opacity="0.7"/>
    <line x1="240" y1="152" x2="378" y2="232" stroke={PRIMARY} strokeWidth="2.5" strokeDasharray="6,4" opacity="0.7"/>
    <line x1="240" y1="152" x2="240" y2="258" stroke={PRIMARY} strokeWidth="2.5" strokeDasharray="6,4" opacity="0.7"/>
    <circle cx="102" cy="244" r="25" fill={PRIMARY_DARK}/>
    <text x="102" y="249" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700" fontFamily="Inter,sans-serif">NYC</text>
    <circle cx="378" cy="244" r="25" fill={PRIMARY_DARK}/>
    <text x="378" y="249" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700" fontFamily="Inter,sans-serif">LDN</text>
    <circle cx="240" cy="270" r="25" fill={PRIMARY_DARK}/>
    <text x="240" y="275" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700" fontFamily="Inter,sans-serif">MUM</text>
    <circle cx="240" cy="66" r="30" fill="#fff" stroke="#e0e7ff" strokeWidth="1.5"/>
    <path d="M229,58 Q240,49 251,58" stroke={PRIMARY} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <path d="M251,74 Q240,83 229,74" stroke={PRIMARY} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <line x1="229" y1="58" x2="224" y2="65" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round"/>
    <line x1="251" y1="74" x2="256" y2="67" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const ExpenseIllustration = () => (
  <svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg" width="100%" style={{ height: "auto" }}>
    <rect width="480" height="300" fill="#FFFBF0" rx="16"/>
    <rect x="90" y="36" width="112" height="192" rx="10" fill="#fff" stroke="#fde8cc" strokeWidth="1.5"/>
    <path d="M90,228 l11,-9 l11,9 l11,-9 l11,9 l11,-9 l11,9 l11,-9 l11,9 l11,-9 l11,9" stroke="#fde8cc" strokeWidth="1.5" fill="none"/>
    <rect x="105" y="52" width="82" height="7" rx="3.5" fill={PRIMARY}/>
    {[65,75,85,96,107,118,132,146,162].map((y,i)=>(
      <rect key={i} x={105} y={y} width={i%3===0?62:82} height={3.5} rx={1.5} fill="#e2e8f0"/>
    ))}
    <rect x="105" y="194" width="82" height="14" rx="5" fill={PRIMARY}/>
    <text x="146" y="205" textAnchor="middle" fill="#fff" fontSize="8" fontFamily="Inter,sans-serif" fontWeight="600">PAID ✓</text>
    <rect x="242" y="54" width="88" height="150" rx="14" fill="#1e293b"/>
    <rect x="251" y="66" width="70" height="100" rx="8" fill="#fef2f2"/>
    <circle cx="286" cy="86" r="16" fill="#e2e8f0" stroke="#fff" strokeWidth="2"/>
    <circle cx="286" cy="86" r="9" fill="#1e293b"/>
    <circle cx="286" cy="86" r="3.5" fill="#fff" opacity="0.8"/>
    <rect x="255" y="145" width="62" height="5" rx="2.5" fill={PRIMARY} opacity="0.4"/>
    <rect x="255" y="155" width="48" height="5" rx="2.5" fill={PRIMARY} opacity="0.4"/>
    <circle cx="322" cy="72" r="7" fill="#fbbf24"/>
    {[0,1,2,3].map(i=>(
      <ellipse key={i} cx="396" cy={246-i*13} rx="48" ry="11" fill={i%2===0?"#fbbf24":"#f59e0b"}/>
    ))}
    <text x="396" y="250" textAnchor="middle" fill="#92400e" fontSize="10" fontFamily="Inter,sans-serif" fontWeight="700">₹ ₹ ₹</text>
  </svg>
);

const EmployeeIllustration = () => (
  <svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg" width="100%" style={{ height: "auto" }}>
    <rect width="480" height="300" fill="#F0FFF4" rx="16"/>
    <circle cx="240" cy="110" r="30" fill="#fcd5b4"/>
    <ellipse cx="240" cy="88" rx="28" ry="13" fill="#7c3f1e"/>
    <rect x="212" y="138" width="56" height="70" rx="13" fill={PRIMARY}/>
    {[96,168,240,312,384].map((x,i)=>(
      <line key={i} x1="240" y1="138" x2={x} y2="232" stroke="#bbf7d0" strokeWidth="2" strokeDasharray="5,3"/>
    ))}
    {[
      {x:96,c:"#1d4ed8"},{x:168,c:PRIMARY},{x:240,c:"#15803d"},
      {x:312,c:"#d97706"},{x:384,c:"#7c3aed"},
    ].map((p,i)=>(
      <g key={i}>
        <circle cx={p.x} cy={244} r={17} fill="#fcd5b4"/>
        <rect x={p.x-12} y={259} width={24} height={28} rx={8} fill={p.c}/>
      </g>
    ))}
    <rect x="320" y="30" width="132" height="90" rx="12" fill="#fff" stroke="#bbf7d0" strokeWidth="1.5"/>
    <text x="386" y="50" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="Inter,sans-serif">Salary Slip — June</text>
    <rect x="332" y="56" width="108" height="3.5" rx="1.5" fill="#e2e8f0"/>
    <rect x="332" y="65" width="80" height="3.5" rx="1.5" fill="#e2e8f0"/>
    <rect x="332" y="74" width="92" height="3.5" rx="1.5" fill="#e2e8f0"/>
    <rect x="332" y="87" width="108" height="18" rx="6" fill="#22c55e"/>
    <text x="386" y="100" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="Inter,sans-serif">₹45,000 Paid ✓</text>
  </svg>
);

const AttendanceIllustration = () => (
  <svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg" width="100%" style={{ height: "auto" }}>
    <rect width="480" height="300" fill="#FAF5FF" rx="16"/>
    <rect x="38" y="30" width="230" height="254" rx="18" fill="#fff" stroke="#e9d5ff" strokeWidth="1.5"/>
    <rect x="38" y="30" width="230" height="48" rx="18" fill={PRIMARY}/>
    <rect x="38" y="60" width="230" height="18" rx="0" fill={PRIMARY}/>
    <text x="153" y="60" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700" fontFamily="Inter,sans-serif">June 2024</text>
    {["S","M","T","W","T","F","S"].map((d,i)=>(
      <text key={i} x={58+i*32} y={97} textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="Inter,sans-serif">{d}</text>
    ))}
    {Array.from({length:30}).map((_,i)=>{
      const row=Math.floor(i/7),col=i%7;
      const x=58+col*32,y=116+row*32;
      const present=[0,1,3,4,5,6,7,8,10,11,13,14,17,18,20,21];
      const absent=[2,9,15];
      const fill=present.includes(i)?"#22c55e":absent.includes(i)?"#ef4444":"#f1f5f9";
      const tc=present.includes(i)||absent.includes(i)?"#fff":"#94a3b8";
      return(
        <g key={i}>
          <circle cx={x} cy={y} r={11} fill={fill} opacity={0.9}/>
          <text x={x} y={y+4} textAnchor="middle" fill={tc} fontSize="9" fontFamily="Inter,sans-serif" fontWeight="600">{i+1}</text>
        </g>
      );
    })}
    <circle cx="360" cy="152" r="70" fill="#fff" stroke="#e9d5ff" strokeWidth="2"/>
    <circle cx="360" cy="152" r="5" fill={PRIMARY}/>
    <line x1="360" y1="152" x2="360" y2="96" stroke={PRIMARY} strokeWidth="3.5" strokeLinecap="round"/>
    <line x1="360" y1="152" x2="398" y2="165" stroke="#1e293b" strokeWidth="3" strokeLinecap="round"/>
    {[0,1,2,3,4,5,6,7,8,9,10,11].map(i=>{
      const a=(i*30-90)*Math.PI/180;
      return <circle key={i} cx={360+Math.cos(a)*60} cy={152+Math.sin(a)*60} r={3} fill="#e2e8f0"/>;
    })}
    <rect x="294" y="238" width="132" height="30" rx="10" fill="#dcfce7" stroke="#86efac" strokeWidth="1"/>
    <text x="360" y="257" textAnchor="middle" fill="#166534" fontSize="10" fontWeight="600" fontFamily="Inter,sans-serif">✓ Checked In 9:02 AM</text>
  </svg>
);

const ChecklistIllustration = () => (
  <svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg" width="100%" style={{ height: "auto" }}>
    <rect width="480" height="300" fill="#F0FFF4" rx="16"/>
    <rect x="80" y="26" width="245" height="264" rx="14" fill="#fff" stroke="#bbf7d0" strokeWidth="1.5"/>
    <rect x="160" y="16" width="85" height="26" rx="8" fill="#94a3b8"/>
    <rect x="175" y="20" width="55" height="14" rx="5" fill="#64748b"/>
    {[
      {y:78,done:true,label:"Open store"},
      {y:116,done:true,label:"Check inventory"},
      {y:154,done:true,label:"Morning orders"},
      {y:192,done:false,label:"Daily report"},
      {y:230,done:false,label:"Team briefing"},
    ].map((item,i)=>(
      <g key={i}>
        <rect x={100} y={item.y-15} width={26} height={26} rx={7}
          fill={item.done?"#22c55e":"#f8fafc"}
          stroke={item.done?"#22c55e":"#e2e8f0"} strokeWidth="1.5"/>
        {item.done&&(
          <polyline
            points={`105,${item.y},109,${item.y+6},119,${item.y-5}`}
            fill="none" stroke="#fff" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"/>
        )}
        <rect x={138} y={item.y-7} width={158} height={9} rx={4.5}
          fill={item.done?"#bbf7d0":"#f1f5f9"}/>
        <rect x={138} y={item.y-7} width={item.done?158:95} height={9} rx={4.5}
          fill={item.done?"#4ade80":"#e2e8f0"} opacity={item.done?0.6:1}/>
      </g>
    ))}
    <rect x="100" y="258" width="210" height="20" rx="8" fill="#dcfce7"/>
    <rect x="100" y="258" width="126" height="20" rx="8" fill="#22c55e" opacity="0.65"/>
    <text x="205" y="272" textAnchor="middle" fill="#14532d" fontSize="10" fontWeight="600" fontFamily="Inter,sans-serif">3 / 5 Tasks Done</text>
    <circle cx="392" cy="110" r="26" fill="#fcd5b4"/>
    <ellipse cx="392" cy="88" rx="24" ry="12" fill="#7c3f1e"/>
    <rect x="368" y="134" width="48" height="58" rx="12" fill={PRIMARY}/>
  </svg>
);

// ─── Feature Row ─────────────────────────────────────────────────────────────

interface FeatureRowProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  illustration: React.ReactNode;
  flip?: boolean;
  extras?: React.ReactNode;
  arrow?: boolean;
}

const FeatureRow: React.FC<FeatureRowProps> = ({
  icon, iconBg, iconColor, title, description,
  illustration, flip = false, extras, arrow = false,
}) => {
  const textContent = (
    <Box sx={{ flex: 1 }}>
      <Box sx={{
        width: 68, height: 68, borderRadius: "18px", bgcolor: iconBg,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: iconColor, mb: 2.5, "& svg": { fontSize: 38 },
      }}>{icon}</Box>
      <Typography sx={{
        fontSize: { xs: "1.45rem", md: "1.85rem" }, fontWeight: 800,
        color: "#191c1d", lineHeight: 1.2, mb: 1.5, letterSpacing: "-0.02em",
      }}>{title}</Typography>
      <Typography sx={{
        fontSize: "0.97rem", color: "#5b403d", fontWeight: 300,
        lineHeight: 1.85, mb: 1,
      }}>{description}</Typography>
      {arrow && (
        <Box sx={{
          display: "inline-flex", alignItems: "center", mt: 1,
          color: PRIMARY, fontWeight: 700, fontSize: "1rem", cursor: "pointer",
          "& svg": { transition: "transform 0.2s" },
          "&:hover svg": { transform: "translateX(5px)" },
        }}>
          <ArrowForwardIcon sx={{ fontSize: 22 }}/>
        </Box>
      )}
      {extras}
    </Box>
  );

  const imgContent = (
    <Box sx={{ flex: 1 }}>
      <Box sx={{
        borderRadius: "28px", overflow: "hidden",
        border: "1px solid #f1f5f9",
        boxShadow: "0 18px 48px -12px rgba(25,28,29,0.1)",
        bgcolor: "#fff", p: { xs: 1, md: 1.5 },
        transition: "transform 0.4s ease",
        "&:hover": { transform: "scale(1.015)" },
      }}>{illustration}</Box>
    </Box>
  );

  return (
    <Box sx={{
      display: "flex",
      flexDirection: { xs: "column", md: "row" },
      alignItems: "center",
      gap: { xs: 4, md: 8 },
    }}>
      {flip ? <>{imgContent}{textContent}</> : <>{textContent}{imgContent}</>}
    </Box>
  );
};

// ─── App ─────────────────────────────────────────────────────────────────────

const ZoduLandingPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  return (
<ThemeProvider theme={theme}>
  <Box sx={{ height: "auto", overflowY: "auto" }}>     
     <CssBaseline />
      <GlobalStyles
  styles={{
    "*": { boxSizing: "border-box" },
    "html, body": {
      margin: 0,
      padding: 0,
      background: "#fff",
      overflowX: "hidden",
      overflowY: "scroll",
      height: "auto",
      scrollBehavior: "smooth",
    },
    "#root": {
      minHeight: "100vh",
      height: "auto",
      display: "block",
      background: "#fff",
    },
  }}
/>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />

      {/* NAV */}
      <Box component="nav" sx={{
        position: "sticky", top: 0, zIndex: 1000,
        bgcolor: "#fff", borderBottom: "1px solid #f1f5f9",
        px: { xs: 3, md: 8 }, py: 1.5,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <Typography sx={{
          fontSize: "2.5rem", fontWeight: 900, color: PRIMARY,
          letterSpacing: "-0.06em", lineHeight: 1,
        }}>zodu</Typography>
        <Button variant="outlined"
        onClick={()=>navigate("/login")}
        sx={{
          borderColor: PRIMARY, color: PRIMARY, borderWidth: 2,
          borderRadius: "999px", px: 3.5, py: 0.8, fontSize: "0.85rem",
          fontWeight: 700, minWidth: 80,
          "&:hover": { bgcolor: PRIMARY, color: "#fff", borderColor: PRIMARY },
        }}>Login</Button>
      </Box>

      {/* HERO */}
      <Box sx={{ bgcolor: "#fff", pt: { xs: 7, md: 11 }, pb: { xs: 5, md: 9 }, px: 3, textAlign: "center" }}>
        <Container maxWidth="md">
          <Typography sx={{
            fontSize: { xs: "2rem", md: "3.4rem" }, fontWeight: 800,
            color: "#191c1d", lineHeight: 1.15, letterSpacing: "-0.03em",
          }}>Fast &amp; Easy Billing</Typography>
          <Typography sx={{
            fontSize: { xs: "2rem", md: "3.4rem" }, fontWeight: 800,
            color: PRIMARY, lineHeight: 1.15, letterSpacing: "-0.03em", mb: 2.5,
          }}>Command Your Business from any Device.</Typography>
          <Typography sx={{
            fontSize: "0.97rem", color: "#5b403d", fontWeight: 300,
            maxWidth: 540, mx: "auto", lineHeight: 1.85, mb: 4,
          }}>
            Elevate your operations with zodu. Seamless GST billing, real-time inventory
            tracking, and multi-location control in one elegant command center.
          </Typography>

          {/* Price pill */}
          <Box sx={{
            display: "inline-flex", alignItems: "center", gap: 1,
            px: 3.2, py: 1.3, borderRadius: "999px",
            bgcolor: alpha(PRIMARY, 0.07),
            border: `2px solid ${alpha(PRIMARY, 0.22)}`,
            color: PRIMARY, fontWeight: 800, fontSize: "0.95rem", mb: 4,
          }}>
            <SellIcon sx={{ fontSize: 20 }}/>
            JUST AT ₹ 99/MONTH
          </Box>

          {/* Buttons */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center" mb={4}>
            <Button variant="contained" size="large" sx={{
              background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_DARK})`,
              color: "#fff", px: 4, py: 1.5, borderRadius: "10px",
              fontSize: "0.93rem", fontWeight: 700,
              boxShadow: `0 14px 30px -8px ${alpha(PRIMARY, 0.42)}`,
              "&:hover": { transform: "scale(1.04)", boxShadow: `0 20px 40px -8px ${alpha(PRIMARY, 0.5)}` },
              transition: "all 0.2s",
            }}>Get Started for Free</Button>
            <Button variant="contained" size="large" startIcon={<PlayCircleOutlineIcon/>} sx={{
              bgcolor: "#f1f5f9", color: "#191c1d", px: 4, py: 1.5,
              borderRadius: "10px", fontSize: "0.93rem", fontWeight: 700,
              boxShadow: "none", "&:hover": { bgcolor: "#e2e8f0" },
            }}>Watch Demo</Button>
          </Stack>

          {/* Social proof */}
          <Stack direction="row" alignItems="center" spacing={1.5} justifyContent="center">
            {/* <AvatarGroup max={3} sx={{ "& .MuiAvatar-root": { width: 34, height: 34, border: "2px solid #fff", fontSize: "0.75rem" } }}>
              <Avatar src="https://i.pravatar.cc/80?img=47"/>
              <Avatar src="https://i.pravatar.cc/80?img=12"/>
              <Avatar src="https://i.pravatar.cc/80?img=32"/>
            </AvatarGroup> */}
            <Typography sx={{ fontSize: "0.82rem", fontWeight: 500, color: "#5b403d" }}>
              Trusted by{" "}
              <Box component="span" sx={{ color: PRIMARY, fontWeight: 700 }}>1 Lakh +</Box>
              {" "}business owners
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Divider sx={{ borderColor: "#f1f5f9" }}/>

      {/* FEATURES */}
      <Box sx={{ bgcolor: "#fff", py: { xs: 8, md: 14 }, px: { xs: 3, md: 8 } }}>
        <Container maxWidth="lg">
          <Box mb={{ xs: 7, md: 11 }}>
            <Typography sx={{
              color: PRIMARY, fontWeight: 700, letterSpacing: "0.18em",
              textTransform: "uppercase", fontSize: "0.74rem", mb: 0.8,
            }}>Capabilities</Typography>
            <Typography sx={{
              fontSize: { xs: "1.8rem", md: "2.7rem" }, fontWeight: 800,
              color: "#191c1d", letterSpacing: "-0.02em",
            }}>Engineered for Precision.</Typography>
          </Box>

          <Stack spacing={{ xs: 9, md: 15 }}>

            {/* 1. GST — text left, image right */}
            <FeatureRow
              icon={<ReceiptLongIcon/>} iconBg={alpha(PRIMARY,0.06)} iconColor={PRIMARY}
              title="GST Billing & Invoicing"
              description="Create professional, tax-compliant invoices in seconds. Automate payment reminders and track outstanding dues with surgical precision. Our system handles the complexities so you don't have to."
              illustration={<BillingIllustration/>} flip={false} arrow
            />

            {/* 2. Inventory — image left, text right */}
            <FeatureRow
              icon={<Inventory2Icon/>} iconBg={alpha("#0369a1",0.06)} iconColor="#0369a1"
              title="Smart Inventory Tracking"
              description="Real-time stock monitoring with intelligent low-stock alerts and automated replenishment insights. Maintain the perfect balance of supply and demand across your entire network."
              illustration={<InventoryIllustration/>} flip={true}
              extras={
                <Box sx={{ mt: 3, p: 3, borderRadius: "18px", border: "1px solid #f1f5f9", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                    <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#5b403d" }}>Global Stock Status</Typography>
                    <Box sx={{ bgcolor: alpha("#ba1a1a",0.08), color: "#ba1a1a", fontWeight: 800, fontSize: "0.62rem", letterSpacing: "0.07em", px: 1.2, py: 0.4, borderRadius: "5px" }}>LOW ALERT</Box>
                  </Stack>
                  <LinearProgress variant="determinate" value={25} sx={{ height: 8, borderRadius: 4, bgcolor: "#f1f5f9", "& .MuiLinearProgress-bar": { bgcolor: PRIMARY, borderRadius: 4 } }}/>
                  <Typography sx={{ fontSize: "0.7rem", mt: 1, color: alpha("#5b403d",0.6), fontStyle: "italic" }}>
                    Automatic re-order triggered for "Central Warehouse"
                  </Typography>
                </Box>
              }
            />

            {/* 3. Financial — text left, image right */}
            <FeatureRow
              icon={<AnalyticsIcon/>} iconBg={alpha("#9f3f39",0.06)} iconColor="#9f3f39"
              title="Financial Reporting"
              description="Gain absolute clarity with automated P&L statements, balance sheets, and tax reports generated in real-time from your operations."
              illustration={<FinancialIllustration/>} flip={false} arrow
            />

            {/* 4. Multi-branch — image left, text right */}
            <FeatureRow
              icon={<HubIcon/>} iconBg={alpha(PRIMARY,0.06)} iconColor={PRIMARY}
              title="Multi-Branch Control"
              description="Manage multiple business locations from a single dashboard. Synchronize data across all branches instantly and maintain total oversight."
              illustration={<MultiBranchIllustration/>} flip={true}
              extras={
                <Stack direction="row" flexWrap="wrap" gap={1.2} mt={3}>
                  {["New York HQ","London Hub","Mumbai Branch"].map(l=>(
                    <Box key={l} sx={{
                      px: 2.2, py: 0.9, bgcolor: "#f1f5f9", border: "1px solid #e2e8f0",
                      borderRadius: "999px", fontSize: "0.8rem", fontWeight: 700, cursor: "default",
                      transition: "all 0.2s", "&:hover": { bgcolor: PRIMARY, color: "#fff", borderColor: PRIMARY },
                    }}>{l}</Box>
                  ))}
                </Stack>
              }
            />

            {/* 5. Expense — text left, image right */}
            <FeatureRow
              icon={<PaymentsIcon/>} iconBg={alpha("#9f3f39",0.06)} iconColor="#9f3f39"
              title="Expense Management"
              description="Take control of your spending with advanced tools designed for modern financial tracking."
              illustration={<ExpenseIllustration/>} flip={false}
              extras={
                <List dense disablePadding sx={{ mt: 1.5 }}>
                  {[
                    {icon:<PhotoCameraIcon sx={{color:PRIMARY,fontSize:18}}/>,text:"Snap & Save Receipts"},
                    {icon:<CategoryIcon sx={{color:PRIMARY,fontSize:18}}/>,text:"Automated Expense Categorization"},
                    {icon:<QueryStatsIcon sx={{color:PRIMARY,fontSize:18}}/>,text:"Real-time Budget Tracking"},
                  ].map(item=>(
                    <ListItem key={item.text} disableGutters sx={{py:0.4}}>
                      <ListItemIcon sx={{minWidth:30}}>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.text} primaryTypographyProps={{fontSize:"0.88rem",fontWeight:500,color:"#5b403d"}}/>
                    </ListItem>
                  ))}
                </List>
              }
            />

            {/* 6. Employee — image left, text right */}
            <FeatureRow
              icon={<GroupsIcon/>} iconBg={alpha(PRIMARY,0.06)} iconColor={PRIMARY}
              title="Employee Management & Payroll"
              description="Simplify your workforce operations. Automate monthly payroll, manage direct salary disbursements, and track employee attendance with integrated biometrics or mobile check-ins."
              illustration={<EmployeeIllustration/>} flip={true}
              extras={
                <List dense disablePadding sx={{ mt: 1.5 }}>
                  {[
                    {icon:<PaymentsIcon sx={{color:PRIMARY,fontSize:18}}/>,text:"Automated Salary Computations"},
                    {icon:<EventAvailableIcon sx={{color:PRIMARY,fontSize:18}}/>,text:"Real-time Attendance Tracking"},
                    {icon:<DescriptionIcon sx={{color:PRIMARY,fontSize:18}}/>,text:"One-click Payslip Generation"},
                  ].map(item=>(
                    <ListItem key={item.text} disableGutters sx={{py:0.4}}>
                      <ListItemIcon sx={{minWidth:30}}>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.text} primaryTypographyProps={{fontSize:"0.88rem",fontWeight:500,color:"#5b403d"}}/>
                    </ListItem>
                  ))}
                </List>
              }
            />

            {/* 7. Attendance — text left, image right */}
            <FeatureRow
              icon={<CalendarMonthIcon/>} iconBg={alpha(PRIMARY,0.06)} iconColor={PRIMARY}
              title="Attendance Management"
              description="Effortlessly track employee work hours with automated check-ins and real-time reporting."
              illustration={<AttendanceIllustration/>} flip={false}
              extras={
                <List dense disablePadding sx={{ mt: 1.5 }}>
                  {[
                    {icon:<ScheduleIcon sx={{color:PRIMARY,fontSize:18}}/>,text:"Digital Clock-in/out"},
                    {icon:<PendingActionsIcon sx={{color:PRIMARY,fontSize:18}}/>,text:"Automated Timesheets"},
                    {icon:<TimeToLeaveIcon sx={{color:PRIMARY,fontSize:18}}/>,text:"Leave Tracking"},
                  ].map(item=>(
                    <ListItem key={item.text} disableGutters sx={{py:0.4}}>
                      <ListItemIcon sx={{minWidth:30}}>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.text} primaryTypographyProps={{fontSize:"0.88rem",fontWeight:500,color:"#5b403d"}}/>
                    </ListItem>
                  ))}
                </List>
              }
            />

            {/* 8. Checklist — image left, text right */}
            <FeatureRow
              icon={<FactCheckIcon/>} iconBg={alpha("#0369a1",0.06)} iconColor="#0369a1"
              title="Daily Operations Checklist"
              description="Ensure operational excellence with digital checklists that keep your team accountable and organized."
              illustration={<ChecklistIllustration/>} flip={true}
              extras={
                <List dense disablePadding sx={{ mt: 1.5 }}>
                  {[
                    {icon:<PlaylistAddCheckIcon sx={{color:PRIMARY,fontSize:18}}/>,text:"Customizable Task Lists"},
                    {icon:<HistoryIcon sx={{color:PRIMARY,fontSize:18}}/>,text:"Recurring Checklists"},
                    {icon:<AssignmentIndIcon sx={{color:PRIMARY,fontSize:18}}/>,text:"Team Assignment & Tracking"},
                  ].map(item=>(
                    <ListItem key={item.text} disableGutters sx={{py:0.4}}>
                      <ListItemIcon sx={{minWidth:30}}>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.text} primaryTypographyProps={{fontSize:"0.88rem",fontWeight:500,color:"#5b403d"}}/>
                    </ListItem>
                  ))}
                </List>
              }
            />

          </Stack>
        </Container>
      </Box>

      {/* CTA */}
      <Box sx={{ py: { xs: 6, md: 10 }, px: { xs: 3, md: 8 } }}>
        <Container maxWidth="lg">
          <Box sx={{
            background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)`,
            borderRadius: "40px", p: { xs: 5, md: 10 },
            textAlign: "center", color: "#fff", position: "relative", overflow: "hidden",
          }}>
            <Box sx={{ position:"absolute", top:-120, left:-120, width:360, height:360, bgcolor:"rgba(255,255,255,0.06)", borderRadius:"50%", filter:"blur(64px)", pointerEvents:"none" }}/>
            <Box sx={{ position:"absolute", bottom:-120, right:-120, width:360, height:360, bgcolor:"rgba(255,255,255,0.06)", borderRadius:"50%", filter:"blur(64px)", pointerEvents:"none" }}/>
            <Stack spacing={3.5} alignItems="center" sx={{ position:"relative", zIndex:1, maxWidth:580, mx:"auto" }}>
              <Typography sx={{
                fontSize: { xs: "2rem", md: "3.6rem" }, fontWeight: 800,
                lineHeight: 1.15, letterSpacing: "-0.03em",
              }}>Ready to master your business?</Typography>
              <Typography sx={{ fontSize: "0.97rem", opacity: 0.88, fontWeight: 300, lineHeight: 1.75 }}>
                Join 10,000+ business owners who are growing faster with zodu. No credit card required to start.
              </Typography>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} width="100%">
                <TextField
                  type="email" placeholder="Enter your business email"
                  value={email} onChange={e => setEmail(e.target.value)} fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "#fff", borderRadius: "12px",
                      "& fieldset": { border: "none" },
                      "& input": { py: 1.8, px: 2.5, color: "#191c1d", fontSize: "0.93rem", fontFamily: "'Inter',sans-serif" },
                    },
                  }}
                />
                <Button variant="contained" sx={{
                  bgcolor: "#191c1d", color: "#fff", px: 4, py: 1.8,
                  borderRadius: "12px", fontWeight: 900, fontSize: "0.93rem",
                  whiteSpace: "nowrap", boxShadow: "0 14px 30px rgba(0,0,0,0.28)",
                  "&:hover": { bgcolor: "#000", transform: "scale(1.04)" },
                  transition: "all 0.2s",
                }}>Get Started</Button>
              </Stack>
              <Typography sx={{ fontSize: "0.78rem", opacity: 0.62, fontWeight: 400 }}>
                Free 14-day trial • No setup fees • Cancel anytime
              </Typography>
            </Stack>
          </Box>
        </Container>
      </Box>

    <Box component="footer" sx={{ bgcolor: "#fff", borderTop: "1px solid #f1f5f9" }}>
  <Container
    maxWidth="lg"
    sx={{
      px: { xs: 3, md: 6 }, // tighter padding (fix side gaps)
    }}
  >
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: { xs: 5, md: 10 },
        py: { xs: 6, md: 8 },
      }}
    >
      {/* LEFT */}
      <Box sx={{ maxWidth: 260 }}>
        <Stack spacing={2.5}>
          <Typography
            sx={{
              fontSize: "2.4rem",
              fontWeight: 900,
              color: PRIMARY,
              letterSpacing: "-0.06em",
            }}
          >
            zodu
          </Typography>

          <Typography
            sx={{
              color: "#64748b",
              fontSize: "0.87rem",
              lineHeight: 1.7,
            }}
          >
            Providing the precise pulse for modern businesses worldwide.
          </Typography>

          <Stack direction="row" spacing={1}>
            {[<PublicIcon sx={{ fontSize: 18 }} />, <ChatIcon sx={{ fontSize: 18 }} />].map((icon, i) => (
              <IconButton
                key={i}
                size="small"
                sx={{
                  bgcolor: "#f1f5f9",
                  color: "#64748b",
                  "&:hover": { bgcolor: PRIMARY, color: "#fff" },
                }}
              >
                {icon}
              </IconButton>
            ))}
          </Stack>
        </Stack>
      </Box>

      {/* RIGHT */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr 1fr",
            md: "repeat(3, 1fr)",
          },
          gap: { xs: 4, md: 6 },
          flex: 1,
          maxWidth: 600,
        }}
      >
        {[
          { title: "Product", links: ["Features", "Integrations", "Pricing", "Changelog"] },
          { title: "Company", links: ["About Us", "Careers", "Contact", "Partners"] },
          { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy"] },
        ].map((col) => (
          <Stack spacing={2} key={col.title}>
            <Typography sx={{ color: PRIMARY, fontWeight: 700, fontSize: "0.9rem" }}>
              {col.title}
            </Typography>

            <Stack spacing={1.2}>
              {col.links.map((l) => (
                <Link
                  key={l}
                  href="#"
                  underline="none"
                  sx={{
                    color: "#64748b",
                    fontSize: "0.85rem",
                    "&:hover": { color: PRIMARY },
                  }}
                >
                  {l}
                </Link>
              ))}
            </Stack>
          </Stack>
        ))}
      </Box>
    </Box>

    <Divider sx={{ borderColor: "#f1f5f9" }} />

    <Box sx={{ py: 3, textAlign: "center" }}>
      <Typography sx={{ color: "#94a3b8", fontSize: "0.8rem" }}>
        © 2024 zodu. The Precise Pulse of Business.
      </Typography>
    </Box>
  </Container>
</Box>
</Box>
    </ThemeProvider>
  );
};

export default ZoduLandingPage;