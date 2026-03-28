// import React, { useState, useEffect, useCallback } from "react";
// import {
//   Box,
//   Typography,
//   Grid,
//   TextField,
//   InputAdornment,
//   Skeleton,
//   Card,
//   CardContent,
// } from "@mui/material";
// import { useQueryClient } from "@tanstack/react-query";
// import SearchIcon from "@mui/icons-material/Search";

// import DateFilterNav from "./filters/DateFilterNav";
// import RecentOrders from "./RecentOrders/RecentOrders";
// import TopItems from "./TopItems/TopItems";
// import DatewiseSales from "./DateWiseSale/DateWiseSale";
// import ExpensesDataTable from "./Expenses/Expenses";
// import SummaryCards from "./SummaryCards/SummaryCards";
// import { getDateRange } from "@Services/ReportServices";
// import { useDashboardDataQuery } from "@hooks/dashboard";
// import {
//   useDashboardSummary,
//   useDashboardOrders,
//   useDashboardExpenses,
//   useDashboardTopItems,
//   useDashboardDatewiseSales,
//   useInfiniteDashboardOrders,
//   useInfiniteTopItems
// } from "@hooks/dashboard";
// import {useAppSelector} from "@store/store"
// import {ZoduId} from "@store/slices/userSlice"
// import { useInfiniteDashboardExpenses } from "@hooks/dashboard/useInfiniteDashboardExpense";


// const STORAGE_KEY = "dashboard_selected_branch";

// const DashboardLayout: React.FC = () => {
//   const queryClient = useQueryClient();

//   const [selectedBranch] = useState(() => {
//     const saved = localStorage.getItem(STORAGE_KEY);
//     return saved || "ZODU035B1";
//   });

//   const [dateFilter, setDateFilter] = useState({
//     type: "today" as string,
//     startDate: "",
//     endDate: "",
//   });

//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchValue, setSearchValue] = useState("");

//   const [ordersPagination, setOrdersPagination] = useState({ page: 1, limit: 10 });
//   const [expensesPagination, setExpensesPagination] = useState({ page: 1, limit: 10 });
//   const [topItemsPagination, setTopItemsPagination] = useState({ page: 1, limit: 10 });
//   const [datewiseSalesPagination, setDatewiseSalesPagination] = useState({ page: 1, limit: 10 });

//   useEffect(() => {
//     const { startDate, endDate } = getDateRange("today");
//     setDateFilter({
//       type: "today",
//       startDate,
//       endDate,
//     });
//   }, []);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setSearchQuery(searchValue);
//     }, 500);

//     return () => clearTimeout(timer);
//   }, [searchValue]);

//   const {
//     data: dashboardData,
//     isLoading,
//     isFetching,
//     refetch: refetchDashboard,
//   } = useDashboardDataQuery({
//     branchId: selectedBranch,
//     ordersPage: ordersPagination.page,
//     ordersLimit: ordersPagination.limit,
//     expensesPage: expensesPagination.page,
//     expensesLimit: expensesPagination.limit,
//     topItemsPage: topItemsPagination.page,
//     topItemsLimit: topItemsPagination.limit,
//     datewiseSalesPage: datewiseSalesPagination.page,
//     datewiseSalesLimit: datewiseSalesPagination.limit,
//     dateType: dateFilter.type as any,
//     fromDate: dateFilter.startDate,
//     toDate: dateFilter.endDate,
//     searchQuery,
//   });

//   const ZODUID = useAppSelector(ZoduId)

//   const summaryQuery = useDashboardSummary(ZODUID, selectedBranch, {
//   dateType: dateFilter.type,
//   fromDate: dateFilter.startDate,
//   toDate: dateFilter.endDate,
//  });






    
//  const ordersQuery = useDashboardOrders(ZODUID, selectedBranch, {
//   page: ordersPagination.page,
//   limit: ordersPagination.limit,
//   dateType: dateFilter.type,
//   fromDate: dateFilter.startDate,
//   toDate: dateFilter.endDate,
// });
// /* Top Items */
// const {
//   data: topItemsData,
//   fetchNextPage: fetchNextTopItemsPage,
//   hasNextPage: hasNextTopItemsPage,
//   isFetchingNextPage: isFetchingTopItemsNextPage,
//   isLoading: isTopItemsLoading,
// } = useInfiniteTopItems(ZODUID, selectedBranch, {
//   page: topItemsPagination.page,
//   limit: topItemsPagination.limit,
//   dateType: dateFilter.type,
//   fromDate: dateFilter.startDate,
//   toDate: dateFilter.endDate,
// });
// const topItems =
//   topItemsData?.pages.flatMap((page) => page.data || []) || [];

// const topItemsTotal =
//   topItemsData?.pages?.[0]?.pagination?.totalRecords || 0;
//   console.log("💸 top items in DashboardLayout:", {
//   topItems,
//   topItemsData,
//   topItemsTotal
// });
// /* Recent Orders */
//  const {
//   data: recentOrdersData,
//   fetchNextPage: fetchNextRecentOrderPage,
//   hasNextPage: hasNextRecentOrdersPage,
//   isFetchingNextPage: isFetchingRecentOrdersNextPage,
//   isLoading: isRecentOrdersLoading,
// } = useInfiniteDashboardOrders(ZODUID, selectedBranch, {
//   limit: 10,
//   dateType: dateFilter.type,
//   fromDate: dateFilter.startDate,
//   toDate: dateFilter.endDate,
// });
// const recentOrders =
//   recentOrdersData?.pages.flatMap((page) => page.data || []) || [];


// const recentOrdersTotal =
//   recentOrdersData?.pages?.[0]?.pagination?.total || 0;
// console.log(recentOrdersData, "recentOrdersTotal in DashboardLayout");
// console.log("💸 recent orders in DashboardLayout:", {
//   recentOrders,
//   recentOrdersData,
//   recentOrdersTotal
// });

// /* Expenses */
// const {
//   data: expensesData,
//   fetchNextPage: fetchNextExpensesPage,
//   hasNextPage: hasNextExpensesPage,
//   isFetchingNextPage: isFetchingNextExpensesPage,
//   isLoading: isExpensesLoading,
// } = useInfiniteDashboardExpenses(ZODUID, selectedBranch, {
//   limit: 10,
//   dateType: dateFilter.type,
//   fromDate: dateFilter.startDate,
//   toDate: dateFilter.endDate,
// });

// const expenses =
//   expensesData?.pages.flatMap((page) => page.data || []) || [];
// console.log("💸 expenses in DashboardLayout:", {
//   expenses,
//   expensesData,
// });

// const expensesTotal =
//   expensesData?.pages?.[0]?.pagination?.totalRecords || 0;



// // const topItemsQuery = useDashboardTopItems(ZODUID, selectedBranch, {
// //   page: topItemsPagination.page,
// //   limit: topItemsPagination.limit,
// //   dateType: dateFilter.type,
// //   fromDate: dateFilter.startDate,
// //   toDate: dateFilter.endDate,
// // });

// const datewiseQuery = useDashboardDatewiseSales(ZODUID, selectedBranch, {
//   page: datewiseSalesPagination.page,
//   limit: datewiseSalesPagination.limit,
//   dateType: dateFilter.type,
//   fromDate: dateFilter.startDate,
//   toDate: dateFilter.endDate,
// });





//   const applyDateFilter = useCallback((filterType: string) => {
//     if (filterType === "custom") {
//       setDateFilter({
//         type: "custom",
//         startDate: "",
//         endDate: "",
//       });
//     } else {
//       const { startDate, endDate } = getDateRange(filterType);
//       setDateFilter({
//         type: filterType,
//         startDate,
//         endDate,
//       });
//     }

//     setOrdersPagination({ page: 1, limit: 10 });
//     setExpensesPagination({ page: 1, limit: 10 });
//     setTopItemsPagination({ page: 1, limit: 10 });
//     setDatewiseSalesPagination({ page: 1, limit: 10 });
//   }, []);

//   const applyCustomDateRange = useCallback((start: string, end: string) => {
//     setDateFilter({
//       type: "custom",
//       startDate: start,
//       endDate: end,
//     });

//     setOrdersPagination({ page: 1, limit: 10 });
//     setExpensesPagination({ page: 1, limit: 10 });
//     setTopItemsPagination({ page: 1, limit: 10 });
//     setDatewiseSalesPagination({ page: 1, limit: 10 });
//   }, []);

//   const handleOrdersPageChange = useCallback((_: any, page: number) => {
//     setOrdersPagination((prev) => ({ ...prev, page }));
//   }, []);

//   const handleExpensesPageChange = useCallback((_: any, page: number) => {
//     setExpensesPagination((prev) => ({ ...prev, page }));
//   }, []);

//   const handleTopItemsPageChange = useCallback((_: any, page: number) => {
//     setTopItemsPagination((prev) => ({ ...prev, page }));
//   }, []);

//   const handleDatewiseSalesPageChange = useCallback((_: any, page: number) => {
//     setDatewiseSalesPagination((prev) => ({ ...prev, page }));
//   }, []);

//   return (
//     <Box
//       sx={{
//         height: "90vh",
//         display: "flex",
//         flexDirection: "column",
//         backgroundColor: "#f5f5f5",
//         overflow: "hidden",
//       }}
//     >
//       <Box
//         display="flex"
//         justifyContent="space-between"
//         alignItems="center"
//         px={3}
//         py={2}
//         bgcolor="#fff"
//         borderBottom="1px solid #e0e0e0"
//       >
//         <Typography variant="h5" fontWeight="bold">
//           Dashboard
//         </Typography>

//         <Box display="flex" gap={2} alignItems="center">
//           <TextField
//             size="small"
//             placeholder="Search..."
//             value={searchValue}
//             onChange={(e) => setSearchValue(e.target.value)}
//             InputProps={{
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <SearchIcon />
//                 </InputAdornment>
//               ),
//             }}
//           />

//           <DateFilterNav
//             selectedType={dateFilter.type}
//             startDate={dateFilter.startDate}
//             endDate={dateFilter.endDate}
//             onFilterChange={applyDateFilter}
//             onCustomRangeApply={applyCustomDateRange}
//           />
//         </Box>
//       </Box>

//       <Box
//         sx={{
//           flex: 1,
//           overflowY: "auto",
//           px: 3,
//           py: 2,
//         }}
//       >
//         {isLoading && !dashboardData?.summary ? (
//           <>
//             <Grid container spacing={2} mb={3}>
//               {[1, 2, 3, 4].map((i) => (
//                 <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
//                   <Card>
//                     <CardContent>
//                       <Skeleton variant="text" width="60%" />
//                       <Skeleton variant="text" width="80%" height={40} />
//                     </CardContent>
//                   </Card>
//                 </Grid>
//               ))}
//             </Grid>

//             <Grid container spacing={3} mb={3}>
//               <Grid size={{ xs: 12, md: 8 }}>
//                 <Card>
//                   <CardContent>
//                     <Skeleton variant="rectangular" height={400} />
//                   </CardContent>
//                 </Card>
//               </Grid>
//               <Grid size={{ xs: 12, md: 4 }}>
//                 <Card>
//                   <CardContent>
//                     <Skeleton variant="rectangular" height={400} />
//                   </CardContent>
//                 </Card>
//               </Grid>
//             </Grid>
//           </>
//         ) : (
//           <>
//             <Grid container spacing={3} mb={3} alignItems="stretch">
//               <Grid
//                 sx={{ display: "flex", flexDirection: "column", gap: 2 }}
//                 size={{ xs: 12, md: 8 }}
//               >
//                 <SummaryCards
//                   summary={summaryQuery?.data?.data}
//                   isLoading={isLoading}
//                 />
//                 <RecentOrders
//                   orders={recentOrders}
//                   totalCount={recentOrdersTotal}
//                   currentPage={ordersQuery?.data?.data?.pagination?.page}
//                   pageSize={ordersQuery?.data?.data?.pagination?.limit}
//                   onPageChange={handleOrdersPageChange}
//                   isLoading={isRecentOrdersLoading}
//                   selectedBranch={selectedBranch}
//                   hasNextPage={hasNextRecentOrdersPage}
//                   fetchNextPage={fetchNextRecentOrderPage}
//                   isFetchingNextPage={isFetchingRecentOrdersNextPage}
//                 />
//               </Grid>

//               <Grid size={{ xs: 12, md: 4 }}>
//                 <DatewiseSales
//                   data={datewiseQuery?.data?.data || []}
//                   totalCount={
//                     datewiseQuery?.data?.pagination?.totalRecords ||
//                     datewiseQuery?.data?.pagination?.total ||
//                     0
//                   }
//                   currentPage={
//                     datewiseQuery?.data?.pagination?.page ||
//                     datewiseSalesPagination.page
//                   }
//                   pageSize={
//                     datewiseQuery?.data?.pagination?.limit ||
//                     datewiseSalesPagination.limit
//                   }
//                   onPageChange={handleDatewiseSalesPageChange}
//                   isLoading={datewiseQuery?.isPending}
//                 />
//               </Grid>
//             </Grid>

//             <Grid container spacing={3}>
//               <Grid size={{ xs: 12, md: 6, lg: 8 }}>
//                 <ExpensesDataTable
//                   expenses={expenses}
//                   totalCount={expensesTotal}
//                   isLoading={isExpensesLoading}
//                   hasNextPage={hasNextExpensesPage}
//                   fetchNextPage={fetchNextExpensesPage}
//                   isFetchingNextPage={isFetchingNextExpensesPage}
//                 />
//               </Grid>

//               <Grid size={{ xs: 12, md: 6, lg: 4 }}>
//                 <TopItems
//                   items={topItems}
//                   totalCount={topItemsTotal}
//                   currentPage={1}
//                   pageSize={10}
//                   onPageChange={handleTopItemsPageChange}
//                   isLoading={isTopItemsLoading}
//                   fetchNextPage={fetchNextTopItemsPage}
//                   hasNextPage={hasNextTopItemsPage}
//                   isFetchingNextPage={isFetchingTopItemsNextPage}
//                 />
//               </Grid>
//             </Grid>
//           </>
//         )}
//       </Box>
//     </Box>
//   );
// };

// export default DashboardLayout;


import { useState } from "react";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";

import PaymentsIcon from "@mui/icons-material/Payments";
import DescriptionIcon from "@mui/icons-material/Description";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import InsightsIcon from "@mui/icons-material/Insights";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import LocalCafeIcon from "@mui/icons-material/LocalCafe";
import BakeryDiningIcon from "@mui/icons-material/BakeryDining";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import Package2Icon from "@mui/icons-material/Inventory";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import IcecreamIcon from "@mui/icons-material/Icecream";

// ── Theme ─────────────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary: { main: "#D32F2F" },
    background: { default: "#F8FAFC", paper: "#FFFFFF" },
    text: { primary: "#0F172A", secondary: "#64748B" },
  },
  typography: { fontFamily: "'Inter', sans-serif" },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: "none" } } },
  },
});

const RED = "#D32F2F";

// ── Data ──────────────────────────────────────────────────────────────────────
const summaryCards = [
  { label: "Total Sales", value: "₹1,24,500", icon: <PaymentsIcon sx={{ fontSize: 20 }} /> },
  { label: "Total Invoices", value: "142", icon: <DescriptionIcon sx={{ fontSize: 20 }} /> },
  { label: "Low Stock Items", value: "08", icon: <Inventory2Icon sx={{ fontSize: 20 }} /> },
  { label: "Today's Revenue", value: "₹18,200", icon: <InsightsIcon sx={{ fontSize: 20 }} /> },
];

const salesRows = [
  { date: "Oct 24, 14:20", inv: "#INV-8842", customer: "Rahul Sharma", amount: "₹1,250", status: "PAID", paid: true },
  { date: "Oct 24, 13:45", inv: "#INV-8841", customer: "Priya Patel", amount: "₹3,420", status: "PAID", paid: true },
  { date: "Oct 24, 12:10", inv: "#INV-8840", customer: "Amit Verma", amount: "₹890", status: "PENDING", paid: false },
  { date: "Oct 24, 11:30", inv: "#INV-8839", customer: "Sneha Roy", amount: "₹2,100", status: "PAID", paid: true },
];

const reminderRows = [
  { due: "Oct 26, 2024", inv: "#INV-8835", type: "SALE", name: "Suresh Kumar", total: "₹4,500", due_amt: "₹2,500", due_type: "PARTIAL" },
  { due: "Oct 25, 2024", inv: "#PO-2241", type: "PURCHASE", name: "Dairy Fresh Ltd", total: "₹12,000", due_amt: "₹12,000", due_type: "NOT PAID" },
  { due: "Oct 27, 2024", inv: "#INV-8822", type: "SALE", name: "Anita Desai", total: "₹1,850", due_amt: "₹1,850", due_type: "NOT PAID" },
  { due: "Oct 28, 2024", inv: "#PO-2239", type: "PURCHASE", name: "Bean Roasters Co.", total: "₹8,500", due_amt: "₹4,250", due_type: "PARTIAL" },
  { due: "Oct 24, 2024", inv: "#INV-8840", type: "SALE", name: "Amit Verma", total: "₹890", due_amt: "₹890", due_type: "NOT PAID" },
];

const topItems = [
  { icon: <LocalCafeIcon sx={{ fontSize: 20 }} />, name: "Cappuccino", cat: "Beverages", rev: "₹12,450", sold: "142 sold" },
  { icon: <BakeryDiningIcon sx={{ fontSize: 20 }} />, name: "Butter Croissant", cat: "Food", rev: "₹8,920", sold: "98 sold" },
  { icon: <RestaurantIcon sx={{ fontSize: 20 }} />, name: "Avocado Toast", cat: "Food", rev: "₹6,400", sold: "45 sold" },
];

const inventoryAlerts = [
  { icon: <Package2Icon sx={{ fontSize: 20 }} />, name: "Premium Coffee Beans", note: "Only 2kg remaining", noteColor: RED },
  { icon: <WaterDropIcon sx={{ fontSize: 20 }} />, name: "Oat Milk (1L Cartons)", note: "Out of stock", noteColor: RED },
  { icon: <IcecreamIcon sx={{ fontSize: 20 }} />, name: "Chocolate Syrup", note: "4 bottles remaining", noteColor: "#D97706" },
];

// ── Shared styles ─────────────────────────────────────────────────────────────
const card = {
  bgcolor: "#fff",
  border: "1px solid #F1F5F9",
  borderRadius: "12px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
};

const thCell = {
  px: 2,
  py: 1.1,
  fontSize: "0.62rem", fontWeight: 700,
  color: "#94A3B8", letterSpacing: "0.1em", textTransform: "uppercase",
  whiteSpace: "nowrap",
  position: "sticky",
  top: 0,
  zIndex: 2,
  bgcolor: "rgba(248,250,252,0.98)",
  backdropFilter: "blur(6px)",
};

const tdCell = { px: 2, py: 1.25, verticalAlign: "middle" };

// ── Components ────────────────────────────────────────────────────────────────
function SummaryCard({ label, value, icon }) {
  return (
    <Box sx={{ ...card, p: 1.5, flex: "1 1 200px", minWidth: 0 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography sx={{ fontSize: "0.82rem", fontWeight: 500, color: "#64748B" }}>{label}</Typography>
        <Box sx={{ color: RED, opacity: 0.8 }}>{icon}</Box>
      </Box>
      <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: "#0F172A" }}>{value}</Typography>
    </Box>
  );
}

function StatusBadge({ status, paid }) {
  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center",
      px: 1.25, py: 0.4, borderRadius: "6px", fontSize: "0.62rem", fontWeight: 700,
      bgcolor: paid ? "#ECFDF5" : "#FFFBEB",
      color: paid ? "#059669" : "#D97706",
      border: `1px solid ${paid ? "#D1FAE5" : "#FDE68A"}`,
    }}>
      {status}
    </Box>
  );
}

function SectionCard({ children, sx = {} }) {
  return <Box sx={{ ...card, overflow: "hidden", ...sx }}>{children}</Box>;
}

function TableWrapper({ children, sx = {} }) {
  return (
    <Box
      sx={{
        overflowX: "auto",
        overflowY: "auto",
        minHeight: 0,
        "&::-webkit-scrollbar": { width: 6, height: 4 },
        "&::-webkit-scrollbar-thumb": { bgcolor: "#fff", borderRadius: 10 },
        ...sx,
      }}
    >
      <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
        {children}
      </Box>
    </Box>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function DashboardLayout() {
  const [search, setSearch] = useState("");

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'); *, *::before, *::after { font-family: 'Inter', sans-serif !important; box-sizing: border-box; }`}</style>

      <Box
        sx={{
          bgcolor: "#F8FAFC",
          height: "100%",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >

        {/* ── HEADER ── */}
     
        {/* ── MAIN ── */}
        <Box
          component="main"
          sx={{
            flex: 1,
            minHeight: 0,
            px: { xs: 1.5, md: 2 },
            py: { xs: 1.5, md: 2 },
            width: "100%",
            overflow: "hidden",
          }}
        >

          {/* Summary Cards */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2 }}>
            {summaryCards.map((c) => <SummaryCard key={c.label} {...c} />)}
          </Box>

          {/* Two-column layout */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "stretch",
              flexWrap: "wrap",
              minHeight: 0,
              height: "calc(100% - 118px)",
            }}
          >

            {/* ── LEFT COLUMN ── */}
            <Box
              sx={{
                flex: "1 1 540px",
                minWidth: 0,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >

              {/* Recent Sales Activity */}
              <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
                <Typography sx={{ fontSize: "1.05rem", fontWeight: 700, color: "#0F172A", mb: 1.25 }}>Recent Sales Activity</Typography>
                <SectionCard sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
                  <TableWrapper sx={{ flex: 1, minHeight: 0 }}>
                    <Box component="thead">
                      <Box component="tr" sx={{ bgcolor: "rgba(248,250,252,0.8)", borderBottom: "1px solid #F1F5F9" }}>
                        {["Date", "Invoice ID", "Customer", "Amount", "Status"].map((h) => (
                          <Box component="th" key={h} sx={thCell}>{h}</Box>
                        ))}
                      </Box>
                    </Box>
                    <Box component="tbody">
                      {salesRows.map((r, i) => (
                        <Box component="tr" key={i} sx={{ borderBottom: i < salesRows.length - 1 ? "1px solid #FAFAFA" : "none", "&:hover": { bgcolor: "rgba(248,250,252,0.6)" }, transition: "background 0.15s" }}>
                          <Box component="td" sx={{ ...tdCell }}><Typography sx={{ fontSize: "0.75rem", color: "#64748B" }}>{r.date}</Typography></Box>
                          <Box component="td" sx={{ ...tdCell }}><Typography sx={{ fontSize: "0.75rem", fontFamily: "monospace", fontWeight: 600, color: "#475569" }}>{r.inv}</Typography></Box>
                          <Box component="td" sx={{ ...tdCell }}><Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#0F172A" }}>{r.customer}</Typography></Box>
                          <Box component="td" sx={{ ...tdCell }}><Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: RED }}>{r.amount}</Typography></Box>
                          <Box component="td" sx={{ ...tdCell }}><StatusBadge status={r.status} paid={r.paid} /></Box>
                        </Box>
                      ))}
                    </Box>
                  </TableWrapper>
                </SectionCard>
              </Box>

              {/* Payment Reminders */}
              <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.25 }}>
                  <Typography sx={{ fontSize: "1.05rem", fontWeight: 700, color: "#0F172A" }}>Payment Reminders</Typography>
                  <Button size="small" startIcon={<NotificationsActiveIcon sx={{ fontSize: 16 }} />} sx={{ color: RED, fontWeight: 700, fontSize: "0.72rem", p: 0, minWidth: 0, "&:hover": { textDecoration: "underline", bgcolor: "transparent" } }}>
                    Send All Reminders
                  </Button>
                </Box>
                <SectionCard sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
                  <TableWrapper sx={{ flex: 1, minHeight: 0 }}>
                    <Box component="thead">
                      <Box component="tr" sx={{ bgcolor: "rgba(248,250,252,0.8)", borderBottom: "1px solid #F1F5F9" }}>
                        {["Due Date", "Invoice/PO #", "Name", "Total Amount", "Due Amount"].map((h) => (
                          <Box component="th" key={h} sx={thCell}>{h}</Box>
                        ))}
                      </Box>
                    </Box>
                    <Box component="tbody">
                      {reminderRows.map((r, i) => (
                        <Box component="tr" key={i} sx={{ borderBottom: i < reminderRows.length - 1 ? "1px solid #FAFAFA" : "none", "&:hover": { bgcolor: "rgba(248,250,252,0.6)" }, transition: "background 0.15s" }}>
                          <Box component="td" sx={tdCell}><Typography sx={{ fontSize: "0.75rem", color: "#64748B" }}>{r.due}</Typography></Box>
                          <Box component="td" sx={tdCell}>
                            <Typography sx={{ fontSize: "0.75rem", fontFamily: "monospace", fontWeight: 600, color: "#475569" }}>{r.inv}</Typography>
                            <Typography sx={{ fontSize: "0.6rem", color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", mt: 0.25 }}>{r.type}</Typography>
                          </Box>
                          <Box component="td" sx={tdCell}><Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#0F172A" }}>{r.name}</Typography></Box>
                          <Box component="td" sx={tdCell}><Typography sx={{ fontSize: "0.85rem", fontWeight: 500, color: "#475569" }}>{r.total}</Typography></Box>
                          <Box component="td" sx={tdCell}>
                            <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: RED }}>{r.due_amt}</Typography>
                            <Typography sx={{ fontSize: "0.6rem", color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", mt: 0.25 }}>{r.due_type}</Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </TableWrapper>
                </SectionCard>
              </Box>
            </Box>

            {/* ── RIGHT COLUMN ── */}
            <Box sx={{ flex: "0 0 300px", minWidth: 260, display: "flex", flexDirection: "column", gap: 2 }}>

              {/* Top Selling Items */}
              <Box>
                <Typography sx={{ fontSize: "1.05rem", fontWeight: 700, color: "#0F172A", mb: 1.25 }}>Top Selling Items</Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {topItems.map((item, i) => (
                    <Box key={i} sx={{ ...card, p: 2, display: "flex", alignItems: "center", gap: 2, "&:hover": { borderColor: "rgba(211,47,47,0.2)" }, transition: "border-color 0.2s" }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: "10px", bgcolor: "rgba(211,47,47,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: RED, flexShrink: 0 }}>
                        {item.icon}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</Typography>
                          <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: RED, flexShrink: 0, ml: 1 }}>{item.rev}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
                          <Typography sx={{ fontSize: "0.62rem", color: "#64748B" }}>{item.cat}</Typography>
                          <Typography sx={{ fontSize: "0.62rem", fontWeight: 600, color: "#94A3B8" }}>{item.sold}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
                <Button fullWidth sx={{ mt: 1.5, py: 1.25, fontSize: "0.62rem", fontWeight: 700, color: "#94A3B8", bgcolor: "rgba(248,250,252,0.8)", border: "1px solid #F1F5F9", borderRadius: "10px", letterSpacing: "0.1em", "&:hover": { bgcolor: "#F1F5F9" } }}>
                  FULL MENU PERFORMANCE
                </Button>
              </Box>

              {/* Inventory Alerts */}
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.25 }}>
                  <Typography sx={{ fontSize: "1.05rem", fontWeight: 700, color: "#0F172A" }}>Inventory Alerts</Typography>
                  <Box sx={{ px: 1.25, py: 0.4, borderRadius: "6px", bgcolor: "rgba(211,47,47,0.08)", color: RED, border: `1px solid rgba(211,47,47,0.2)`, fontSize: "0.62rem", fontWeight: 700 }}>8 LOW</Box>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {inventoryAlerts.map((item, i) => (
                    <Box key={i} sx={{ ...card, p: 2, display: "flex", alignItems: "center", gap: 2 }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: "10px", bgcolor: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8", flexShrink: 0 }}>
                        {item.icon}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</Typography>
                        <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: item.noteColor, mt: 0.25 }}>{item.note}</Typography>
                      </Box>
                      <IconButton size="small" sx={{ color: RED, borderRadius: "8px", p: 0.75, "&:hover": { bgcolor: "rgba(211,47,47,0.08)" } }}>
                        <ShoppingCartCheckoutIcon sx={{ fontSize: 20 }} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
                <Button fullWidth sx={{ mt: 1.5, py: 1.25, fontSize: "0.62rem", fontWeight: 700, color: "#94A3B8", bgcolor: "rgba(248,250,252,0.8)", border: "1px solid #F1F5F9", borderRadius: "10px", letterSpacing: "0.1em", "&:hover": { bgcolor: "#F1F5F9" } }}>
                  VIEW FULL INVENTORY
                </Button>
              </Box>

            </Box>
          </Box>
        </Box>

        {/* ── FOOTER ── */}
       

      </Box>
    </ThemeProvider>
  );
}
