// import { useState } from "react";
// import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
// import Box from "@mui/material/Box";
// import Typography from "@mui/material/Typography";
// import Button from "@mui/material/Button";
// import IconButton from "@mui/material/IconButton";
// import Avatar from "@mui/material/Avatar";

// import PaymentsIcon from "@mui/icons-material/Payments";
// import DescriptionIcon from "@mui/icons-material/Description";
// import Inventory2Icon from "@mui/icons-material/Inventory2";
// import InsightsIcon from "@mui/icons-material/Insights";
// import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
// import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
// import LocalCafeIcon from "@mui/icons-material/LocalCafe";
// import BakeryDiningIcon from "@mui/icons-material/BakeryDining";
// import RestaurantIcon from "@mui/icons-material/Restaurant";
// import Package2Icon from "@mui/icons-material/Inventory";
// import WaterDropIcon from "@mui/icons-material/WaterDrop";
// import IcecreamIcon from "@mui/icons-material/Icecream";
// import TrendingUpIcon from "@mui/icons-material/TrendingUp";
// import WarningAmberIcon from "@mui/icons-material/WarningAmber";

// // ── Theme ─────────────────────────────────────────────────────────────────────
// const theme = createTheme({
//   palette: {
//     primary: { main: "#D32F2F" },
//     background: { default: "#F8FAFC", paper: "#FFFFFF" },
//     text: { primary: "#0F172A", secondary: "#64748B" },
//   },
//   typography: { fontFamily: "'Inter', sans-serif" },
//   components: {
//     MuiButton: { styleOverrides: { root: { textTransform: "none" } } },
//   },
// });

// const RED = "#D32F2F";

// // ── Data ──────────────────────────────────────────────────────────────────────
// const summaryCards = [
//   { label: "Total Sales",     value: "₹1,24,500", icon: <PaymentsIcon    sx={{ fontSize: 18 }} /> },
//   { label: "Total Invoices",  value: "142",        icon: <DescriptionIcon sx={{ fontSize: 18 }} /> },
//   { label: "Low Stock Items", value: "08",         icon: <Inventory2Icon  sx={{ fontSize: 18 }} /> },
//   { label: "Today's Revenue", value: "₹18,200",   icon: <InsightsIcon    sx={{ fontSize: 18 }} /> },
// ];

// const salesRows = [
//   { date: "Oct 24, 14:20", inv: "#INV-8842", customer: "Rahul Sharma", amount: "₹1,250", status: "PAID",    paid: true  },
//   { date: "Oct 24, 13:45", inv: "#INV-8841", customer: "Priya Patel",  amount: "₹3,420", status: "PAID",    paid: true  },
//   { date: "Oct 24, 12:10", inv: "#INV-8840", customer: "Amit Verma",   amount: "₹890",   status: "PENDING", paid: false },
//   { date: "Oct 24, 11:30", inv: "#INV-8839", customer: "Sneha Roy",    amount: "₹2,100", status: "PAID",    paid: true  },
// ];

// const reminderRows = [
//   { due: "Oct 26", inv: "#INV-8835", type: "SALE",     name: "Suresh Kumar",      total: "₹4,500",  due_amt: "₹2,500",  due_type: "PARTIAL"  },
//   { due: "Oct 25", inv: "#PO-2241",  type: "PURCHASE", name: "Dairy Fresh Ltd",   total: "₹12,000", due_amt: "₹12,000", due_type: "NOT PAID" },
//   { due: "Oct 27", inv: "#INV-8822", type: "SALE",     name: "Anita Desai",       total: "₹1,850",  due_amt: "₹1,850",  due_type: "NOT PAID" },
//   { due: "Oct 28", inv: "#PO-2239",  type: "PURCHASE", name: "Bean Roasters Co.", total: "₹8,500",  due_amt: "₹4,250",  due_type: "PARTIAL"  },
//   { due: "Oct 24", inv: "#INV-8840", type: "SALE",     name: "Amit Verma",        total: "₹890",    due_amt: "₹890",    due_type: "NOT PAID" },
// ];

// const topItems = [
//   { icon: <LocalCafeIcon    sx={{ fontSize: 16 }} />, name: "Cappuccino",       cat: "Beverages", rev: "₹12,450", sold: 142 },
//   { icon: <BakeryDiningIcon sx={{ fontSize: 16 }} />, name: "Butter Croissant", cat: "Food",      rev: "₹8,920",  sold: 98  },
//   { icon: <RestaurantIcon   sx={{ fontSize: 16 }} />, name: "Avocado Toast",    cat: "Food",      rev: "₹6,400",  sold: 45  },
// ];

// const inventoryAlerts = [
//   { icon: <Package2Icon  sx={{ fontSize: 16 }} />, name: "Premium Coffee Beans",  stock: "2 kg",        status: "Critical", statusColor: RED,       bgcolor: "#FEE2E2" },
//   { icon: <WaterDropIcon sx={{ fontSize: 16 }} />, name: "Oat Milk (1L Cartons)", stock: "0",           status: "Out",      statusColor: "#7C3AED", bgcolor: "#EDE9FE" },
//   { icon: <IcecreamIcon  sx={{ fontSize: 16 }} />, name: "Chocolate Syrup",       stock: "4 bottles",   status: "Low",      statusColor: "#D97706", bgcolor: "#FEF3C7" },
// ];

// // ── Shared styles ─────────────────────────────────────────────────────────────
// const card = {
//   bgcolor: "#fff",
//   border: "1px solid #F1F5F9",
//   borderRadius: "10px",
//   boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
// };

// // ── DataTable primitives (mirrors InventoryManagement DataTable) ──────────────
// const ROW_H  = 38;
// const CELL_P = "0px 12px";

// const headCellSx = {
//   height:          ROW_H,
//   padding:         CELL_P,
//   lineHeight:      `${ROW_H}px`,
//   whiteSpace:      "nowrap" as const,
//   fontSize:        "11px",
//   fontWeight:      600,
//   color:           "#6B7280",
//   backgroundColor: "#F5F5F5",
//   borderBottom:    "1px solid #E5E7EB",
//   letterSpacing:   "0.06em",
//   textTransform:   "uppercase" as const,
//   position:        "sticky" as const,
//   top:             0,
//   zIndex:          2,
// };

// const bodyCellSx = {
//   height:          ROW_H,
//   padding:         CELL_P,
//   fontSize:        "13px",
//   color:           "#374151",
//   verticalAlign:   "middle",
//   backgroundColor: "#ffffff",
//   borderBottom:    "1px solid #F3F4F6",
// };

// interface ColDef<T> {
//   key:       string;
//   label:     string;
//   align?:    "left" | "center" | "right";
//   width?:    number | string;
//   minWidth?: number | string;
//   render:    (row: T) => React.ReactNode;
// }

// function MiniTable<T>({ columns, rows, rowKey }: {
//   columns: ColDef<T>[];
//   rows:    T[];
//   rowKey:  (r: T) => string | number;
// }) {
//   return (
//     <Box
//       component="table"
//       sx={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}
//     >
//       <Box component="thead">
//         <Box component="tr">
//           {columns.map(col => (
//             <Box
//               component="th"
//               key={col.key}
//               sx={{
//                 ...headCellSx,
//                 textAlign: col.align ?? "left",
//                 width:     col.width,
//                 minWidth:  col.minWidth,
//               }}
//             >
//               {col.label}
//             </Box>
//           ))}
//         </Box>
//       </Box>
//       <Box component="tbody">
//         {rows.map(row => (
//           <Box
//             component="tr"
//             key={rowKey(row)}
//             sx={{
//               "&:hover td": { bgcolor: "#FAFAFA" },
//               "&:last-child td": { borderBottom: "none" },
//             }}
//           >
//             {columns.map(col => (
//               <Box
//                 component="td"
//                 key={col.key}
//                 sx={{ ...bodyCellSx, textAlign: col.align ?? "left" }}
//               >
//                 {col.render(row)}
//               </Box>
//             ))}
//           </Box>
//         ))}
//       </Box>
//     </Box>
//   );
// }

// // ── SectionCard ───────────────────────────────────────────────────────────────
// function SectionCard({
//   title,
//   action,
//   children,
//   sx = {},
// }: {
//   title:    React.ReactNode;
//   action?:  React.ReactNode;
//   children: React.ReactNode;
//   sx?:      object;
// }) {
//   return (
//     <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0, ...sx }}>
//       <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
//         <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#0F172A" }}>{title}</Typography>
//         {action}
//       </Box>
//       <Box
//         sx={{
//           ...card,
//           flex: 1,
//           minHeight: 0,
//           overflow: "hidden",
//           display: "flex",
//           flexDirection: "column",
//         }}
//       >
//         <Box
//           sx={{
//             flex: 1,
//             minHeight: 0,
//             overflowY: "auto",
//             overflowX: "auto",
//             "&::-webkit-scrollbar":       { width: 5, height: 4 },
//             "&::-webkit-scrollbar-track": { bgcolor: "#F3F4F6" },
//             "&::-webkit-scrollbar-thumb": { bgcolor: "#D1D5DB", borderRadius: 10 },
//           }}
//         >
//           {children}
//         </Box>
//       </Box>
//     </Box>
//   );
// }

// // ── StatusBadge ───────────────────────────────────────────────────────────────
// function StatusBadge({ label, color, bg }: { label: string; color: string; bg: string }) {
//   return (
//     <Box sx={{
//       display: "inline-flex", alignItems: "center", gap: 0.5,
//       px: 1, py: 0.3, borderRadius: "5px",
//       fontSize: "11px", fontWeight: 700,
//       color, bgcolor: bg,
//     }}>
//       <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: color, flexShrink: 0 }} />
//       {label}
//     </Box>
//   );
// }

// // ── Summary Card ──────────────────────────────────────────────────────────────
// function SummaryCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
//   return (
//     <Box
//       sx={{
//         ...card,
//         px: 2,
//         py: 1.5,
//         display: "flex",
//         alignItems: "center",
//         gap: 1.5,
//         // fixed width so all 4 are identical — wide enough for "₹1,24,500"
//         width: 190,
//         flexShrink: 0,
//       }}
//     >
//       <Box sx={{
//         width: 36, height: 36, borderRadius: "8px",
//         bgcolor: "rgba(211,47,47,0.07)", color: RED,
//         display: "flex", alignItems: "center", justifyContent: "center",
//         flexShrink: 0,
//       }}>
//         {icon}
//       </Box>
//       <Box sx={{ minWidth: 0 }}>
//         <Typography sx={{ fontSize: "11px", fontWeight: 500, color: "#64748B", whiteSpace: "nowrap" }}>
//           {label}
//         </Typography>
//         <Typography sx={{ fontSize: "1.15rem", fontWeight: 800, color: "#0F172A", lineHeight: 1.3 }}>
//           {value}
//         </Typography>
//       </Box>
//     </Box>
//   );
// }

// // ── Sales columns ─────────────────────────────────────────────────────────────
// type SaleRow = typeof salesRows[0];
// const salesCols: ColDef<SaleRow>[] = [
//   {
//     key: "date", label: "Date", minWidth: 110,
//     render: r => <Typography sx={{ fontSize: 12, color: "#64748B" }}>{r.date}</Typography>,
//   },
//   {
//     key: "inv", label: "Invoice ID", minWidth: 100,
//     render: r => <Typography sx={{ fontSize: 12, fontFamily: "monospace", fontWeight: 600, color: "#475569" }}>{r.inv}</Typography>,
//   },
//   {
//     key: "customer", label: "Customer",
//     render: r => <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{r.customer}</Typography>,
//   },
//   {
//     key: "amount", label: "Amount", align: "right",
//     render: r => <Typography sx={{ fontSize: 13, fontWeight: 700, color: RED }}>{r.amount}</Typography>,
//   },
//   {
//     key: "status", label: "Status", align: "center",
//     render: r => (
//       <StatusBadge
//         label={r.status}
//         color={r.paid ? "#059669" : "#D97706"}
//         bg={r.paid ? "#ECFDF5" : "#FFFBEB"}
//       />
//     ),
//   },
// ];

// // ── Reminder columns ──────────────────────────────────────────────────────────
// type ReminderRow = typeof reminderRows[0];
// const reminderCols: ColDef<ReminderRow>[] = [
//   {
//     key: "due", label: "Due Date", minWidth: 70,
//     render: r => <Typography sx={{ fontSize: 12, color: "#64748B" }}>{r.due}</Typography>,
//   },
//   {
//     key: "inv", label: "Invoice / PO", minWidth: 100,
//     render: r => (
//       <Box>
//         <Typography sx={{ fontSize: 12, fontFamily: "monospace", fontWeight: 600, color: "#475569" }}>{r.inv}</Typography>
//         <Typography sx={{ fontSize: 10, fontWeight: 700, color: r.type === "SALE" ? "#2563EB" : "#7C3AED", mt: 0.2 }}>{r.type}</Typography>
//       </Box>
//     ),
//   },
//   {
//     key: "name", label: "Name",
//     render: r => <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{r.name}</Typography>,
//   },
//   {
//     key: "total", label: "Total", align: "right",
//     render: r => <Typography sx={{ fontSize: 13, color: "#475569" }}>{r.total}</Typography>,
//   },
//   {
//     key: "due_amt", label: "Due Amt", align: "right",
//     render: r => (
//       <Box sx={{ textAlign: "right" }}>
//         <Typography sx={{ fontSize: 13, fontWeight: 700, color: RED }}>{r.due_amt}</Typography>
//         <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#94A3B8" }}>{r.due_type}</Typography>
//       </Box>
//     ),
//   },
// ];

// // ── Top Items columns ─────────────────────────────────────────────────────────
// type TopItem = typeof topItems[0];
// const topItemCols: ColDef<TopItem>[] = [
//   {
//     key: "name", label: "Item",
//     render: r => (
//       <Box>
//         <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{r.name}</Typography>
//         <Typography sx={{ fontSize: 11, color: "#94A3B8" }}>{r.cat}</Typography>
//       </Box>
//     ),
//   },
//   {
//     key: "sold", label: "Sold", align: "center",
//     render: r => <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{r.sold}</Typography>,
//   },
//   {
//     key: "rev", label: "Revenue", align: "right",
//     render: r => <Typography sx={{ fontSize: 13, fontWeight: 700, color: RED }}>{r.rev}</Typography>,
//   },
// ];

// // ── Inventory Alert columns ───────────────────────────────────────────────────
// type AlertItem = typeof inventoryAlerts[0];
// const alertCols: ColDef<AlertItem>[] = [
//   {
//     key: "name", label: "Item",
//     render: r => (
//       <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{r.name}</Typography>
//     ),
//   },
//   {
//     key: "stock", label: "Stock", align: "center",
//     render: r => <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{r.stock}</Typography>,
//   },
//   {
//     key: "status", label: "Status", align: "center",
//     render: r => (
//       <StatusBadge label={r.status} color={r.statusColor} bg={r.bgcolor} />
//     ),
//   },
//   {
//     key: "action", label: "", align: "center", width: 40,
//     render: _r => (
//       <IconButton size="small" sx={{ color: RED, p: 0.5, borderRadius: "6px", "&:hover": { bgcolor: "rgba(211,47,47,0.08)" } }}>
//         <ShoppingCartCheckoutIcon sx={{ fontSize: 16 }} />
//       </IconButton>
//     ),
//   },
// ];

// // ── Main Dashboard ────────────────────────────────────────────────────────────
// export default function DashboardLayout() {
//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'); *, *::before, *::after { font-family: 'Inter', sans-serif !important; box-sizing: border-box; }`}</style>

//       <Box sx={{ bgcolor: "#F8FAFC", height: "100%", minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>

//         <Box
//           component="main"
//           sx={{
//             flex: 1, minHeight: 0,
//             px: { xs: 1.5, md: 2 },
//             py: { xs: 1.5, md: 2 },
//             width: "100%",
//             overflow: "hidden",
//             display: "flex",
//             flexDirection: "column",
//             gap: 2,
//           }}
//         >

//           {/* ── Summary Cards — fixed equal width, left-aligned ── */}
//           <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
//             {summaryCards.map(c => <SummaryCard key={c.label} {...c} />)}
//           </Box>

//           {/* ── Two-column layout ── */}
//           <Box
//             sx={{
//               flex: 1, minHeight: 0,
//               display: "flex",
//               gap: 2,
//               alignItems: "stretch",
//             }}
//           >

//             {/* ── LEFT COLUMN — 60% ── */}
//             <Box sx={{ flex: "0 0 60%", minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column", gap: 2 }}>

//               <SectionCard title="Recent Sales Activity" sx={{ flex: 1, minHeight: 0 }}>
//                 <MiniTable
//                   columns={salesCols}
//                   rows={salesRows}
//                   rowKey={r => r.inv}
//                 />
//               </SectionCard>

//               <SectionCard
//                 title="Payment Reminders"
//                 action={
//                   <Button
//                     size="small"
//                     startIcon={<NotificationsActiveIcon sx={{ fontSize: 14 }} />}
//                     sx={{ color: RED, fontWeight: 700, fontSize: "0.7rem", p: 0, minWidth: 0, "&:hover": { textDecoration: "underline", bgcolor: "transparent" } }}
//                   >
//                     Send All
//                   </Button>
//                 }
//                 sx={{ flex: 1, minHeight: 0 }}
//               >
//                 <MiniTable
//                   columns={reminderCols}
//                   rows={reminderRows}
//                   rowKey={r => r.inv}
//                 />
//               </SectionCard>

//             </Box>

//             {/* ── RIGHT COLUMN — 40% ── */}
//             <Box sx={{ flex: "0 0 40%", minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column", gap: 2 }}>

//               <SectionCard
//                 title={
//                   <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
//                     <TrendingUpIcon sx={{ fontSize: 16, color: RED }} />
//                     Top Selling Items
//                   </Box>
//                 }
//                 sx={{ flex: 1, minHeight: 0 }}
//               >
//                 <MiniTable
//                   columns={topItemCols}
//                   rows={topItems}
//                   rowKey={r => r.name}
//                 />
//               </SectionCard>

//               <SectionCard
//                 title={
//                   <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
//                     <WarningAmberIcon sx={{ fontSize: 16, color: "#D97706" }} />
//                     Inventory Alerts
//                   </Box>
//                 }
//                 action={
//                   <Box sx={{ px: 1.25, py: 0.3, borderRadius: "5px", bgcolor: "rgba(211,47,47,0.08)", color: RED, fontSize: "11px", fontWeight: 700 }}>
//                     8 LOW
//                   </Box>
//                 }
//                 sx={{ flex: 1, minHeight: 0 }}
//               >
//                 <MiniTable
//                   columns={alertCols}
//                   rows={inventoryAlerts}
//                   rowKey={r => r.name}
//                 />
//               </SectionCard>

//             </Box>
//           </Box>
//         </Box>
//       </Box>
//     </ThemeProvider>
//   );
// }

import { useEffect, useRef, useCallback, useState } from "react";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";

import PaymentsIcon              from "@mui/icons-material/Payments";
import DescriptionIcon           from "@mui/icons-material/Description";
import Inventory2Icon            from "@mui/icons-material/Inventory2";
import InsightsIcon              from "@mui/icons-material/Insights";
import NotificationsActiveIcon   from "@mui/icons-material/NotificationsActive";
import ShoppingCartCheckoutIcon  from "@mui/icons-material/ShoppingCartCheckout";
import TrendingUpIcon            from "@mui/icons-material/TrendingUp";
import WarningAmberIcon          from "@mui/icons-material/WarningAmber";

import {
  useStats,
  useSales,
  useTopItems,
  useReminders,
  useInventoryAlerts,
} from "./useDashboard";
import { useAppSelector } from "@store/store";
import { getTenantContext } from "@store/tenantContext";
import InvoiceDetailsModal from "@pages/SalesHistory/Invoicedetaildialog";

// ── Config — swap these out per session ───────────────────────

// ── Theme ─────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary:    { main: "#D32F2F" },
    background: { default: "#F8FAFC", paper: "#FFFFFF" },
    text:       { primary: "#0F172A", secondary: "#64748B" },
  },
  typography: { fontFamily: "'Inter', sans-serif" },
  components: {
    MuiButton:   { styleOverrides: { root: { textTransform: "none" } } },
    MuiSkeleton: { defaultProps: { animation: "wave" } },
  },
});

const RED = "#D32F2F";

// ── Shared card style ─────────────────────────────────────────
const card = {
  bgcolor:     "#fff",
  border:      "1px solid #F1F5F9",
  borderRadius: "10px",
  boxShadow:   "0 1px 4px rgba(0,0,0,0.05)",
};

// ── Table primitives ──────────────────────────────────────────
const ROW_H  = 38;
const CELL_P = "0px 12px";

const headCellSx = {
  height:          ROW_H,
  padding:         CELL_P,
  lineHeight:      `${ROW_H}px`,
  whiteSpace:      "nowrap" as const,
  fontSize:        "11px",
  fontWeight:      600,
  color:           "#6B7280",
  backgroundColor: "#F5F5F5",
  borderBottom:    "1px solid #E5E7EB",
  letterSpacing:   "0.06em",
  textTransform:   "uppercase" as const,
  position:        "sticky" as const,
  top:             0,
  zIndex:          2,
};

const bodyCellSx = {
  height:          ROW_H,
  padding:         CELL_P,
  fontSize:        "13px",
  color:           "#374151",
  verticalAlign:   "middle",
  backgroundColor: "#ffffff",
  borderBottom:    "1px solid #F3F4F6",
};

interface ColDef<T> {
  key:       string;
  label:     string;
  align?:    "left" | "center" | "right";
  width?:    number | string;
  minWidth?: number | string;
  render:    (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
}

// ── MiniTable with sentinel for infinite scroll ───────────────
function MiniTable<T>({
  columns,
  rows,
  rowKey,
  onLoadMore,
  onRowClick,
  isFetchingNextPage,
  hasNextPage,
}: {
  columns:             ColDef<T>[];
  rows:                T[];
  rowKey:              (r: T) => string | number;
  onLoadMore?:         () => void;
  onRowClick?:         (row: T) => void;
  isFetchingNextPage?: boolean;
  hasNextPage?:        boolean;
}) {
  const sentinelRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (!onLoadMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) onLoadMore(); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [onLoadMore, hasNextPage, isFetchingNextPage]);

  return (
    <Box component="table" sx={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
      <Box component="thead">
        <Box component="tr">
          {columns.map(col => (
            <Box
              component="th" key={col.key}
              sx={{ ...headCellSx, textAlign: col.align ?? "left", width: col.width, minWidth: col.minWidth }}
            >
              {col.label}
            </Box>
          ))}
        </Box>
      </Box>

      <Box component="tbody">
        {rows.map(row => (
          <Box
            component="tr" key={rowKey(row)}
            sx={{ "&:hover td": { bgcolor: "#FAFAFA" }, "&:last-child td": { borderBottom: "none" } }}
          >
            {columns.map(col => (
              <Box component="td" key={col.key} sx={{ ...bodyCellSx, textAlign: col.align ?? "left" }}>
                {col.render(row)}
              </Box>
            ))}
          </Box>
        ))}

        {/* Skeleton rows while fetching next page */}
        {isFetchingNextPage &&
          Array.from({ length: 3 }).map((_, i) => (
            <Box component="tr" key={`skel-${i}`}>
              {columns.map(col => (
                <Box component="td" key={col.key} sx={{ ...bodyCellSx }}>
                  <Skeleton height={16} sx={{ borderRadius: 1 }} />
                </Box>
              ))}
            </Box>
          ))
        }

        {/* Invisible sentinel row — triggers next page fetch */}
        {hasNextPage && (
          <Box component="tr" ref={sentinelRef}>
            <Box component="td" colSpan={columns.length} sx={{ p: 0, height: 1, border: "none" }} />
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ── Skeleton table (initial load) ─────────────────────────────
function SkeletonTable({ cols, rows = 4 }: { cols: number; rows?: number }) {
  return (
    <Box component="table" sx={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
      <Box component="thead">
        <Box component="tr">
          {Array.from({ length: cols }).map((_, i) => (
            <Box component="th" key={i} sx={headCellSx}>
              <Skeleton width={60} height={12} />
            </Box>
          ))}
        </Box>
      </Box>
      <Box component="tbody">
        {Array.from({ length: rows }).map((_, r) => (
          <Box component="tr" key={r}>
            {Array.from({ length: cols }).map((_, c) => (
              <Box component="td" key={c} sx={bodyCellSx}>
                <Skeleton height={16} sx={{ borderRadius: 1 }} />
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ── SectionCard ───────────────────────────────────────────────
function SectionCard({
  title, action, children, sx = {},
}: {
  title: React.ReactNode; action?: React.ReactNode;
  children: React.ReactNode; sx?: object;
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0, ...sx }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#0F172A" }}>{title}</Typography>
        {action}
      </Box>
      <Box sx={{ ...card, flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <Box sx={{
          flex: 1, minHeight: 0, overflowY: "auto", overflowX: "auto",
          "&::-webkit-scrollbar":       { width: 5, height: 4 },
          "&::-webkit-scrollbar-track": { bgcolor: "#F3F4F6" },
          "&::-webkit-scrollbar-thumb": { bgcolor: "#D1D5DB", borderRadius: 10 },
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

// ── StatusBadge ───────────────────────────────────────────────
function StatusBadge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center", gap: 0.5,
      px: 1, py: 0.3, borderRadius: "5px", fontSize: "11px", fontWeight: 700,
      color, bgcolor: bg,
    }}>
      <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: color, flexShrink: 0 }} />
      {label}
    </Box>
  );
}

// ── SummaryCard ───────────────────────────────────────────────
function SummaryCard({ label, value, icon, loading }: {
  label: string; value?: string; icon: React.ReactNode; loading: boolean;
}) {
  return (
    <Box sx={{
      ...card, px: 2, py: 1.5,
      display: "flex", alignItems: "center", gap: 1.5,
      width: 190, flexShrink: 0,
    }}>
      <Box sx={{
        width: 36, height: 36, borderRadius: "8px",
        bgcolor: "rgba(211,47,47,0.07)", color: RED,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: "11px", fontWeight: 500, color: "#64748B", whiteSpace: "nowrap" }}>
          {label}
        </Typography>
        {loading
          ? <Skeleton width={80} height={24} sx={{ borderRadius: 1, mt: 0.5 }} />
          : <Typography sx={{ fontSize: "1.15rem", fontWeight: 800, color: "#0F172A", lineHeight: 1.3 }}>
              {value}
            </Typography>
        }
      </Box>
    </Box>
  );
}

// ── helpers ───────────────────────────────────────────────────
const fmt = (n: number) =>
  "₹" + Number(n).toLocaleString("en-IN");

function flatPages(query: { data?: { pages: Array<{ data: any[] }> } }) {
  return query.data?.pages.flatMap(p => p.data) ?? [];
}

function paymentStatusBadge(status: string) {
  const map: Record<string, { color: string; bg: string }> = {
    fully_paid: { color: "#059669", bg: "#ECFDF5" },
    paid:       { color: "#059669", bg: "#ECFDF5" },
    partial:    { color: "#D97706", bg: "#FFFBEB" },
    pending:    { color: "#D97706", bg: "#FFFBEB" },
    not_paid:   { color: "#DC2626", bg: "#FEF2F2" },
  };
  const cfg = map[status?.toLowerCase()] ?? { color: "#64748B", bg: "#F1F5F9" };
  return <StatusBadge label={status?.toUpperCase()} {...cfg} />;
}

function stockStatusBadge(status: string) {
  const map: Record<string, { color: string; bg: string }> = {
    out:      { color: "#7C3AED", bg: "#EDE9FE" },
    critical: { color: "#D32F2F", bg: "#FEE2E2" },
    low:      { color: "#D97706", bg: "#FEF3C7" },
  };
  const cfg = map[status?.toLowerCase()] ?? { color: "#64748B", bg: "#F1F5F9" };
  return <StatusBadge label={status?.charAt(0).toUpperCase() + status?.slice(1)} {...cfg} />;
}

// ── Column definitions ────────────────────────────────────────

// Sales
type SaleRow = {
  sale_uuid: string; sale_id: string; sale_date: string; sale_time: string;
  total_amount: string; payment_status: string; customer_name: string;
};


// Reminders
type ReminderRow = {
  ref_id: string; ref_type: string; txn_date: string; due_date: string;
  total_amount: string; paid_amount: string; balance_amount: string;
  payment_status: string; party_name?: string; vendor_name?: string;
};
const reminderCols: ColDef<ReminderRow>[] = [
  { key: "due",  label: "Due Date", minWidth: 70,
    render: r => <Typography sx={{ fontSize: 12, color: "#64748B" }}>{r.due_date ? new Date(r.due_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—"}</Typography> },
  { key: "inv",  label: "Invoice / PO", minWidth: 100,
    render: r => (
      <Box>
        <Typography sx={{ fontSize: 12, fontFamily: "monospace", fontWeight: 600, color: "#475569" }}>{r.ref_id}</Typography>
        <Typography sx={{ fontSize: 10, fontWeight: 700, color: r.ref_type === "SALE" ? "#2563EB" : "#7C3AED", mt: 0.2 }}>{r.ref_type}</Typography>
      </Box>
    ) },
  { key: "name", label: "Name",
    render: r => <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{r.party_name ?? r.vendor_name ?? "—"}</Typography> },
  { key: "total", label: "Total", align: "right",
    render: r => <Typography sx={{ fontSize: 13, color: "#475569" }}>{fmt(+r.total_amount)}</Typography> },
  { key: "due_amt", label: "Due Amt", align: "right",
    render: r => (
      <Box sx={{ textAlign: "right" }}>
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: RED }}>{fmt(+r.balance_amount)}</Typography>
        <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#94A3B8" }}>{r.payment_status?.toUpperCase()}</Typography>
      </Box>
    ) },
];

// Top Items
type TopItem = {
  item_id: string; item_name: string; category_id?: string;
  total_sold: string; total_revenue: string;
};
const topItemCols: ColDef<TopItem>[] = [
  { key: "name", label: "Item",
    render: r => (
      <Box>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{r.item_name}</Typography>
        {r.category_id && <Typography sx={{ fontSize: 11, color: "#94A3B8" }}>Cat #{r.category_id}</Typography>}
      </Box>
    ) },
  { key: "sold", label: "Sold", align: "center",
    render: r => <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{Math.round(+r.total_sold)}</Typography> },
  { key: "rev",  label: "Revenue", align: "right",
    render: r => <Typography sx={{ fontSize: 13, fontWeight: 700, color: RED }}>{fmt(+r.total_revenue)}</Typography> },
];

// Inventory Alerts
type AlertItem = {
  item_uuid: string; item_id: string; item_name: string;
  available_qty: string; reorder_level: string; stock_status: string;
};
const alertCols: ColDef<AlertItem>[] = [
  { key: "name",   label: "Item",
    render: r => <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{r.item_name}</Typography> },
  { key: "stock",  label: "Stock", align: "center",
    render: r => <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{r.available_qty}</Typography> },
  { key: "status", label: "Status", align: "center",
    render: r => stockStatusBadge(r.stock_status) },
  { key: "action", label: "", align: "center", width: 40,
    render: _r => (
      <IconButton size="small" sx={{ color: RED, p: 0.5, borderRadius: "6px", "&:hover": { bgcolor: "rgba(211,47,47,0.08)" } }}>
        <ShoppingCartCheckoutIcon sx={{ fontSize: 16 }} />
      </IconButton>
    ) },
];

// ── Main Dashboard ────────────────────────────────────────────
export default function DashboardLayout() {
  const { branchId, zoduId } = getTenantContext();
  const statsQuery   = useStats(zoduId, branchId);
  const salesQuery   = useSales(zoduId, branchId);
  const topQuery     = useTopItems(zoduId, branchId);
  const remindQuery  = useReminders(zoduId, branchId);
  const alertQuery   = useInventoryAlerts(zoduId, branchId);
    const [invoiceDialog, setInvoiceDialog] = useState<string | null>(null);


  const stats  = statsQuery.data;
  const sales  = flatPages(salesQuery)   as SaleRow[];
  const tops   = flatPages(topQuery)     as TopItem[];
  const remind = flatPages(remindQuery)  as ReminderRow[];
  const alerts = flatPages(alertQuery)   as AlertItem[];

  // Stable callbacks so MiniTable doesn't re-subscribe observers on every render
  const loadMoreSales   = useCallback(() => salesQuery.fetchNextPage(),  [salesQuery]);
  const loadMoreTops    = useCallback(() => topQuery.fetchNextPage(),    [topQuery]);
  const loadMoreRemind  = useCallback(() => remindQuery.fetchNextPage(), [remindQuery]);
  const loadMoreAlerts  = useCallback(() => alertQuery.fetchNextPage(),  [alertQuery]);


  const handleInvoice = (saleId: string) => setInvoiceDialog(saleId);

const salesCols: ColDef<SaleRow>[] = [
  { key: "date",     label: "Date",       minWidth: 110,
    render: r => <Typography sx={{ fontSize: 12, color: "#64748B" }}>{r.sale_date} {r.sale_time}</Typography> },
  { key: "inv",      label: "Invoice ID", minWidth: 100,
    render: r => <Typography onClick={() => handleInvoice(r.sale_id)} sx={{ fontSize: 12, fontWeight: 600, color: "#1976d2",cursor:"pointer" }}>{r.sale_id}</Typography> },
  { key: "customer", label: "Customer",
    render: r => <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{r.customer_name}</Typography> },
  { key: "amount",   label: "Amount", align: "right",
    render: r => <Typography sx={{ fontSize: 13, fontWeight: 700, color: RED }}>{fmt(+r.total_amount)}</Typography> },
  { key: "status",   label: "Status", align: "center",
    render: r => paymentStatusBadge(r.payment_status) },
];

  const summaryCards = [
    { label: "Total Sales",     value: stats ? fmt(stats.total_sales)     : undefined, icon: <PaymentsIcon    sx={{ fontSize: 18 }} /> },
    { label: "Total Invoices",  value: stats ? String(stats.total_invoices)  : undefined, icon: <DescriptionIcon sx={{ fontSize: 18 }} /> },
    { label: "Low Stock Items", value: stats ? String(stats.low_stock_items) : undefined, icon: <Inventory2Icon  sx={{ fontSize: 18 }} /> },
    { label: "Today's Revenue", value: stats ? fmt(stats.todays_revenue)  : undefined, icon: <InsightsIcon    sx={{ fontSize: 18 }} /> },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'); *, *::before, *::after { font-family: 'Inter', sans-serif !important; box-sizing: border-box; }`}</style>

      <Box sx={{ bgcolor: "#F8FAFC", height: "100%", minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Box component="main" sx={{
          flex: 1, minHeight: 0, px: { xs: 1.5, md: 2 }, py: { xs: 1.5, md: 2 },
          width: "100%", overflow: "hidden", display: "flex", flexDirection: "column", gap: 2,
        }}>

          {/* ── Summary Cards ── */}
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            {summaryCards.map(c => (
              <SummaryCard key={c.label} loading={statsQuery.isLoading} {...c} />
            ))}
          </Box>

          {/* ── Two-column layout ── */}
          <Box sx={{ flex: 1, minHeight: 0, display: "flex", gap: 2, alignItems: "stretch" }}>

            {/* LEFT — 60% */}
            <Box sx={{ flex: "0 0 60%", minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column", gap: 2 }}>

              <SectionCard title="Recent Sales Activity" sx={{ flex: 1, minHeight: 0 }}>
                {salesQuery.isLoading
                  ? <SkeletonTable cols={5} />
                  : <MiniTable
                      columns={salesCols}
                      rows={sales}
                      rowKey={r => r.sale_uuid}
                      onLoadMore={loadMoreSales}
                      isFetchingNextPage={salesQuery.isFetchingNextPage}
                      hasNextPage={salesQuery.hasNextPage}
                    />
                }
              </SectionCard>

              <SectionCard
                title="Payment Reminders"
                action={
                  <Button
                    size="small"
                    startIcon={<NotificationsActiveIcon sx={{ fontSize: 14 }} />}
                    sx={{ color: RED, fontWeight: 700, fontSize: "0.7rem", p: 0, minWidth: 0, "&:hover": { textDecoration: "underline", bgcolor: "transparent" } }}
                  >
                    Send All
                  </Button>
                }
                sx={{ flex: 1, minHeight: 0 }}
              >
                {remindQuery.isLoading
                  ? <SkeletonTable cols={5} />
                  : <MiniTable
                      columns={reminderCols}
                      rows={remind}
                      rowKey={r => `${r.ref_type}-${r.ref_id}`}
                      onLoadMore={loadMoreRemind}
                      isFetchingNextPage={remindQuery.isFetchingNextPage}
                      hasNextPage={remindQuery.hasNextPage}
                    />
                }
              </SectionCard>

            </Box>

            {/* RIGHT — 40% */}
            <Box sx={{ flex: "0 0 39%", minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column", gap: 2 }}>

              <SectionCard
                title={<Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}><TrendingUpIcon sx={{ fontSize: 16, color: RED }} />Top Selling Items</Box>}
                sx={{ flex: 1, minHeight: 0 }}
              >
                {topQuery.isLoading
                  ? <SkeletonTable cols={3} />
                  : <MiniTable
                      columns={topItemCols}
                      rows={tops}
                      rowKey={r => r.item_id}
                      onLoadMore={loadMoreTops}
                      isFetchingNextPage={topQuery.isFetchingNextPage}
                      hasNextPage={topQuery.hasNextPage}
                    />
                }
              </SectionCard>

              <SectionCard
                title={<Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}><WarningAmberIcon sx={{ fontSize: 16, color: "#D97706" }} />Inventory Alerts</Box>}
                action={
                  <Box sx={{ px: 1.25, py: 0.3, borderRadius: "5px", bgcolor: "rgba(211,47,47,0.08)", color: RED, fontSize: "11px", fontWeight: 700 }}>
                    {alertQuery.isLoading ? <Skeleton width={40} /> : `${alerts.length} LOW`}
                  </Box>
                }
                sx={{ flex: 1, minHeight: 0 }}
              >
                {alertQuery.isLoading
                  ? <SkeletonTable cols={4} />
                  : <MiniTable
                      columns={alertCols}
                      rows={alerts}
                      rowKey={r => r.item_uuid}
                      onLoadMore={loadMoreAlerts}
                      isFetchingNextPage={alertQuery.isFetchingNextPage}
                      hasNextPage={alertQuery.hasNextPage}
                    />
                }
              </SectionCard>

            </Box>
          </Box>
        </Box>
      </Box>
          {invoiceDialog && (
        <InvoiceDetailsModal saleId={invoiceDialog} onClose={() => setInvoiceDialog(null)} />
      )}
    </ThemeProvider>
  );
}