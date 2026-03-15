// // components/reports/InventoryReport.tsx
// import React, { useState } from "react";
// import {
//   Box,
//   Grid,
//   CircularProgress,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Chip,
//   Typography,
// } from "@mui/material";
// import { PageHeader } from "./reportHeader";
// import { ReportTabs } from "./ReportTabs";
// import { SummaryCard } from "./SummaryCards";
// import { ReportModal } from "./ReportsModal";
// import {
//   useInventoryReport,
//   useInfiniteScroll,
// } from "../../hooks/reports/useInfiniteScroll";
// import { type Inventory } from "./types/report.type";
// import { ReportFilterBar } from "./utils/ReportFilterBar";

// const InventoryReport: React.FC = () => {
//   const [activeTab, setActiveTab] = useState("all-inventory");
//   const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(
//     null,
//   );
//   const [modalOpen, setModalOpen] = useState(false);
//   const [searchText, setSearchText] = useState("");
// const [fromDate, setFromDate] = useState("");
// const [toDate, setToDate] = useState("");
// const [selectedMonth, setSelectedMonth] = useState("");
// const [selectedYear, setSelectedYear] = useState("");


//   const tabs = ["All Inventory"];

//   const {
//     data: inventoryData,
//     fetchNextPage,
//     hasNextPage,
//     isFetchingNextPage,
//   } = useInventoryReport(
//     activeTab === "all-inventory"
//       ? "all"
//       : activeTab === "date-wise"
//         ? "date"
//         : "",
//   );

//   const { lastElementRef } = useInfiniteScroll(
//     fetchNextPage,
//     !!hasNextPage,
//     isFetchingNextPage,
//   );

//   const handleInventoryClick = (item: Inventory) => {
//     setSelectedInventory(item);
//     setModalOpen(true);
//   };

//   const renderAllInventoryTable = () => {
//  const rawInventory =
//   inventoryData?.pages.flatMap((page: any) => page.data) || [];

// const allInventory = rawInventory.filter((item: any) => {
//   const itemDate = new Date(item.lastUpdatedDate);

//   const matchesSearch =
//     !searchText ||
//     item.itemId?.toLowerCase().includes(searchText.toLowerCase()) ||
//     item.itemName?.toLowerCase().includes(searchText.toLowerCase()) ||
//     item.category?.toLowerCase().includes(searchText.toLowerCase());

//   const matchesFromDate =
//     !fromDate || itemDate >= new Date(fromDate);

//   const matchesToDate =
//     !toDate || itemDate <= new Date(toDate);

//   return matchesSearch && matchesFromDate && matchesToDate;
// });


//     return (
//       <TableContainer
//         component={Paper}
//         sx={{
//           boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
//           borderRadius: "8px",
//           overflow: "hidden",
//           maxHeight: "600px",
//           overflowY: "auto",
//         }}>
//         <Table stickyHeader>
//           <TableHead>
//             <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
//               <TableCell sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}>
//                 ITEM ID
//               </TableCell>
//               <TableCell sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}>
//                 ITEM NAME
//               </TableCell>
//               <TableCell sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}>
//                 CATEGORY
//               </TableCell>
//               <TableCell
//                 sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}
//                 align="right">
//                 STOCK QTY
//               </TableCell>

//               <TableCell
//                 sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}
//                 align="right">
//                 UNIT PRICE
//               </TableCell>
//               <TableCell
//                 sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}
//                 align="right">
//                 TOTAL VALUE
//               </TableCell>
//               <TableCell sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}>
//                 LAST UPDATED
//               </TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {allInventory.map((item: Inventory, index: number) => {
//               return (
//                 <TableRow
//                   key={item.id}
//                   hover
//                   sx={{ "&:last-child td": { borderBottom: 0 } }}
//                   ref={
//                     index === allInventory.length - 1
//                       ? (lastElementRef as React.Ref<HTMLTableRowElement>)
//                       : null
//                   }>
              
//   <TableCell
//     sx={{
//       py: 2,
//       color: "#1976d2",
//       "&:hover": { textDecoration: "underline" },
//       cursor: "pointer",
//     }}
//     onClick={() => handleInventoryClick(item)}
//   >
//     {item.itemId}
//   </TableCell>

//   <TableCell sx={{ py: 2 }}>{item.itemName}</TableCell>

//   <TableCell sx={{ py: 2 }}>{item.category}</TableCell>

//   <TableCell
//     align="right"
//     sx={{
//       py: 2,
//       color:
//         item.stockQuantity <= item.stockAlertThreshold
//           ? "error.main"
//           : "success.main",
//       fontWeight: 600,
//     }}
//   >
//     {item.stockQuantity}
//   </TableCell>

//   <TableCell sx={{ py: 2 }} align="right">
//     ${item.unitPrice.toFixed(2)}
//   </TableCell>

//   <TableCell sx={{ py: 2 }} align="right">
//     <Typography fontWeight="bold">
//       ${item.totalValue.toFixed(2)}
//     </Typography>
//   </TableCell>

//   <TableCell sx={{ py: 2 }}>{item.lastUpdatedDate}</TableCell>
// </TableRow>

//               );
//             })}
//             {isFetchingNextPage && (
//               <TableRow>
//                 <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
//                   <CircularProgress size={24} />
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </TableContainer>
//     );
//   };

//   const renderDateWiseTable = () => {
//     const dateWiseData =
//       inventoryData?.pages.flatMap((page: any) => page.data) || [];

//     return (
//       <TableContainer
//         component={Paper}
//         sx={{
//           boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
//           borderRadius: "8px",
//           overflow: "hidden",
//           maxHeight: "600px",
//           overflowY: "auto",
//         }}>
//         <Table stickyHeader>
//           <TableHead>
//             <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
//               <TableCell sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}>
//                 DATE
//               </TableCell>
//               <TableCell
//                 sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}
//                 align="right">
//                 TOTAL ITEMS
//               </TableCell>
//               <TableCell
//                 sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}
//                 align="right">
//                 TOTAL VALUE
//               </TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {dateWiseData.map((data: any, index: number) => (
//               <TableRow
//                 key={index}
//                 hover
//                 sx={{ "&:last-child td": { borderBottom: 0 } }}
//                 ref={
//                   index === dateWiseData.length - 1
//                     ? (lastElementRef as React.Ref<HTMLTableRowElement>)
//                     : null
//                 }>
//                 <TableCell sx={{ py: 2 }}>{data.date}</TableCell>
//                 <TableCell sx={{ py: 2 }} align="right">
//                   {data.totalItems} Items
//                 </TableCell>
//                 <TableCell sx={{ py: 2 }} align="right">
//                   <Typography fontWeight="bold">
//                     $
//                     {data.totalValue.toLocaleString("en-US", {
//                       minimumFractionDigits: 2,
//                     })}
//                   </Typography>
//                 </TableCell>
//               </TableRow>
//             ))}
//             {isFetchingNextPage && (
//               <TableRow>
//                 <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
//                   <CircularProgress size={24} />
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </TableContainer>
//     );
//   };

//   const ExpandableMonthTable = () => {
//     const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
//    const rawMonthWise =
//   monthWiseData?.pages.flatMap((page: any) => page.data) || [];

// const monthWiseDataArr = rawMonthWise.filter((item: any) => {
//   return !selectedYear || item.year === Number(selectedYear);
// });

//     const { lastElementRef: monthLastElementRef } = useInfiniteScroll(
//       fetchNextMonth,
//       !!hasNextMonth,
//       isFetchingNextMonth,
//     );

//     const toggleRow = (year: number) => {
//       const newExpanded = new Set(expandedRows);
//       if (newExpanded.has(year)) {
//         newExpanded.delete(year);
//       } else {
//         newExpanded.add(year);
//       }
//       setExpandedRows(newExpanded);
//     };

//     return (
//       <TableContainer
//         component={Paper}
//         sx={{
//           boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
//           borderRadius: "8px",
//           overflow: "hidden",
//           maxHeight: "600px",
//           overflowY: "auto",
//         }}>
//         <Table stickyHeader>
//           <TableHead>
//             <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
//               <TableCell
//                 sx={{
//                   py: 2,
//                   fontWeight: 600,
//                   fontSize: "14px",
//                   width: "60px",
//                 }}></TableCell>
//               <TableCell sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}>
//                 YEAR
//               </TableCell>
//               <TableCell
//                 sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}
//                 align="right">
//                 TOTAL ITEMS
//               </TableCell>
//               <TableCell
//                 sx={{ py: 2, fontWeight: 600, fontSize: "14px" }}
//                 align="right">
//                 TOTAL VALUE
//               </TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {monthWiseDataArr.map((yearData: any, index: number) => (
//               <React.Fragment key={yearData.year}>
//                 <TableRow
//                   hover
//                   sx={{ "&:last-child td": { borderBottom: 0 } }}
//                   ref={
//                     index === monthWiseDataArr.length - 1
//                       ? (monthLastElementRef as React.Ref<HTMLTableRowElement>)
//                       : null
//                   }>
//                   <TableCell sx={{ py: 2 }}>
//                     <IconButton
//                       size="small"
//                       onClick={() => toggleRow(yearData.year)}>
//                       {expandedRows.has(yearData.year) ? (
//                         <KeyboardArrowUp />
//                       ) : (
//                         <KeyboardArrowDown />
//                       )}
//                     </IconButton>
//                   </TableCell>
//                   <TableCell sx={{ py: 2, fontWeight: "bold" }}>
//                     {yearData.year}
//                   </TableCell>
//                   <TableCell sx={{ py: 2 }} align="right">
//                     {yearData.totalBills} Items
//                   </TableCell>
//                   <TableCell sx={{ py: 2 }} align="right">
//                     <Typography fontWeight="bold">
//                       $
//                       {yearData.totalAmount.toLocaleString("en-US", {
//                         minimumFractionDigits: 2,
//                       })}
//                     </Typography>
//                   </TableCell>
//                 </TableRow>
//                 {expandedRows.has(yearData.year) && (
//                   <TableRow>
//                     <TableCell
//                       colSpan={4}
//                       sx={{ py: 0, backgroundColor: "#fafafa" }}>
//                       <Collapse
//                         in={expandedRows.has(yearData.year)}
//                         timeout="auto"
//                         unmountOnExit>
//                         <Box sx={{ py: 2, px: 4 }}>
//                           <Table size="small">
//                             <TableHead>
//                               <TableRow>
//                                 <TableCell
//                                   sx={{ fontWeight: 600, fontSize: "13px" }}>
//                                   MONTH
//                                 </TableCell>
//                                 <TableCell
//                                   sx={{ fontWeight: 600, fontSize: "13px" }}
//                                   align="right">
//                                   TOTAL ITEMS
//                                 </TableCell>
//                                 <TableCell
//                                   sx={{ fontWeight: 600, fontSize: "13px" }}
//                                   align="right">
//                                   TOTAL VALUE
//                                 </TableCell>
//                               </TableRow>
//                             </TableHead>
//                             <TableBody>
//                               {yearData.months.map((month: any) => (
//                                 <TableRow key={month.month}>
//                                   <TableCell sx={{ py: 1 }}>
//                                     {month.month}
//                                   </TableCell>
//                                   <TableCell sx={{ py: 1 }} align="right">
//                                     {month.totalItems} Items
//                                   </TableCell>
//                                   <TableCell sx={{ py: 1 }} align="right">
//                                     $
//                                     {month.totalValue.toLocaleString("en-US", {
//                                       minimumFractionDigits: 2,
//                                     })}
//                                   </TableCell>
//                                 </TableRow>
//                               ))}
//                             </TableBody>
//                           </Table>
//                         </Box>
//                       </Collapse>
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </React.Fragment>
//             ))}
//             {isFetchingNextMonth && (
//               <TableRow>
//                 <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
//                   <CircularProgress size={24} />
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </TableContainer>
//     );
//   };

//   return (
//     <Box>
//       <PageHeader
//         title="Inventory Report"
//         subtitle="Analyze stock levels, waste management, and inventory turnover ratios."
//       />

//       <Grid container spacing={1} mb={3}>
//         <Grid size={{ xs: 12, sm: 6, md: 2 }}>
//           <SummaryCard title="TOTAL ITEMS" value={856} />
//         </Grid>
//         <Grid size={{ xs: 12, sm: 6, md: 2 }}>
//           <SummaryCard title="TOTAL STOCK VALUE" value={125430.75} isCurrency />
//         </Grid>
//         <Grid size={{ xs: 12, sm: 6, md: 2 }}>
//           <SummaryCard title="LOW STOCK ITEMS" value={12} />
//         </Grid>
//       </Grid>

//    <Paper elevation={3} sx={{ borderRadius: 2 }}>
      
//         <ReportFilterBar
//         tabs={tabs}
//         activeTab={activeTab}
//         onTabChange={setActiveTab}
//         searchText={searchText}
//         onSearchChange={setSearchText}
//         fromDate={fromDate}
//         toDate={toDate}
//         onFromDateChange={setFromDate}
//         onToDateChange={setToDate}
//         selectedMonth={selectedMonth}
//         selectedYear={selectedYear}
//         onMonthChange={setSelectedMonth}
//         onYearChange={setSelectedYear}
//       />
//       {activeTab === "all-inventory" && renderAllInventoryTable()}

//       </Paper>

//       <ReportModal
//         open={modalOpen}
//         onClose={() => setModalOpen(false)}
//         type="inventory"
//         data={selectedInventory}
//       />
//     </Box>
//   );
// };

// export default InventoryReport;
// components/reports/InventoryReport.tsx
import React, { useState } from "react";
import {
  Box,
  Grid,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";
import { PageHeader } from "./reportHeader";
import { SummaryCard } from "./SummaryCards";
import { ReportModal } from "./ReportsModal";
import { ReportFilterBar } from "./utils/ReportFilterBar";
import { useInfiniteScroll } from "../../hooks/reports/useInfiniteScroll";
import type { InventoryItem } from "@/types/report";
import { useStocksInventoryReport } from "@hooks/queryHooks/reports";

const InventoryReport: React.FC = () => {
  const [activeTab, setActiveTab] = useState("all-inventory");
  const [selectedInventory, setSelectedInventory] =
    useState<InventoryItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [page, setPage] = useState(1);
  const limit = 20;

  const tabs = ["All Inventory"];

  const {
    stocks,
    totalItems,
    lowStockItems,
    outOfStockItems,
    totalStockValue,
    pagination,
    isFetching,
  } = useStocksInventoryReport({
    zoduId: "ZODU035",        // 🔴 replace
    branchId: "ZODU035B1",   // 🔴 replace
    filterType: "all",
    page,
    limit,
    startDate: fromDate,
    endDate: toDate,
    search: searchText,
  });

  const hasNextPage = page < pagination.totalPages;

  const { lastElementRef } = useInfiniteScroll(
    () => setPage((prev) => prev + 1),
    hasNextPage,
    isFetching
  );

  const handleInventoryClick = (item: InventoryItem) => {
    setSelectedInventory(item);
    setModalOpen(true);
  };

  console.log("stock",stocks)
  return (
    <Box>
      <PageHeader
        title="Inventory Report"
        subtitle="Analyze stock levels, waste management, and inventory turnover ratios."
      />

      {/* ===== SUMMARY ===== */}
      <Grid container spacing={1} mb={3}>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <SummaryCard title="TOTAL ITEMS" value={totalItems} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <SummaryCard
            title="TOTAL STOCK VALUE"
            value={Number(totalStockValue)}
            isCurrency
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <SummaryCard title="LOW STOCK ITEMS" value={lowStockItems} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <SummaryCard title="OUT OF STOCK" value={outOfStockItems} />
        </Grid>
      </Grid>

      <Paper elevation={3} sx={{ borderRadius: 2 }}>
        <ReportFilterBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          searchText={searchText}
          onSearchChange={(v) => {
            setPage(1);
            setSearchText(v);
          }}
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={(v) => {
            setPage(1);
            setFromDate(v);
          }}
          onToDateChange={(v) => {
            setPage(1);
            setToDate(v);
          }}
        />

        <TableContainer
          component={Paper}
          sx={{
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            overflow: "hidden",
            maxHeight: "600px",
            overflowY: "auto",
          }}
        >
          <Table stickyHeader>
          <TableHead>
  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
    <TableCell sx={{ py: 2, fontWeight: 600 }}>ITEM ID</TableCell>
    <TableCell sx={{ py: 2, fontWeight: 600 }}>ITEM NAME</TableCell>
    <TableCell sx={{ py: 2, fontWeight: 600 }}>CATEGORY</TableCell>
    <TableCell sx={{ py: 2, fontWeight: 600 }} align="right">
      STOCK QTY
    </TableCell>
    <TableCell sx={{ py: 2, fontWeight: 600 }} align="right">
      STOCK ALERT
    </TableCell>
    <TableCell sx={{ py: 2, fontWeight: 600 }} align="right">
      TOTAL VALUE
    </TableCell>
    <TableCell sx={{ py: 2, fontWeight: 600 }}>
      LAST UPDATED
    </TableCell>
  </TableRow>
</TableHead>


          <TableBody>
  {stocks.map((item, index) => (
    <TableRow
      key={item.item_id}
      hover
      ref={
        index === stocks.length - 1
          ? (lastElementRef as React.Ref<HTMLTableRowElement>)
          : null
      }
    >
      <TableCell
        sx={{
          py: 2,
          color: "#1976d2",
          "&:hover": { textDecoration: "underline" },
          cursor: "pointer",
        }}
        onClick={() => handleInventoryClick(item)}
      >
        {item.item_id}
      </TableCell>

      <TableCell sx={{ py: 2 }}>{item.item_name}</TableCell>
      <TableCell sx={{ py: 2 }}>{item.category_name}</TableCell>

      <TableCell
        align="right"
        sx={{
          py: 2,
          color:
            item.status === "out"
              ? "error.main"
              : item.status === "low"
              ? "warning.main"
              : "success.main",
          fontWeight: 600,
        }}
      >
        {item.stock_qty} {item.unit_name}
      </TableCell>

      {/* ✅ STOCK ALERT */}
      <TableCell align="right" sx={{ py: 2 }}>
        {item.stock_alert}
      </TableCell>

      <TableCell sx={{ py: 2 }} align="right">
        <Typography fontWeight="bold">
          ₹{Number(item.total_amount).toFixed(2)}
        </Typography>
      </TableCell>

      {/* ✅ LAST UPDATED */}
      <TableCell sx={{ py: 2 }}>
        {item.last_updated}
      </TableCell>
    </TableRow>
  ))}

  {isFetching && (
    <TableRow>
      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
        <CircularProgress size={24} />
      </TableCell>
    </TableRow>
  )}
</TableBody>

          </Table>
        </TableContainer>
      </Paper>

      <ReportModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        type="inventory"
        data={selectedInventory}
      />
    </Box>
  );
};

export default InventoryReport;
