import Layout from "@layouts/index"; // Adjust the import to your Layout file
import POSLayout from "@layouts/POSLayout"; // Adjust the import to your Layout file
import Dashboard from "@pages/Dashboard/index.tsx";
import Auth from "@pages/auth/index.tsx";
import POSScreen from "@pages/POS/index.tsx";
import RestaurantSetup from "@pages/RestaurantSetup/index.tsx";
import MenuItemsScreen from "@pages/MenuItemScreen/MenuItemScreen";
import ExpensesScreen from "@pages/ExpensesScreen";
import RportsScreen from "@pages/ReportsScreen/index.tsx";
import InventoryScreen from "@pages/InventoryScreen/index.tsx";
import PurchaseScreen from "@pages/PurchaseScreen";

// ... import other page components
import ChecklistScreen from "./../pages/ChecklistScreen/index";

// Attendance Page Imports
import LeaveRequests from "@pages/attendance/tabs/LeaveRequests";
import AttendanceDashboard from "@pages/attendance/tabs/AttendanceDashboard";
import AttendanceTeam from "@pages/attendance/tabs/AttendanceTeam";
import LeaveHistory from "@pages/attendance/tabs/LeaveHistory";
import AttendanceLayout from "@pages/attendance/AttendanceLayout";
import PurchaseReport from "@components/Reports/PuchaseReport";
import InventoryReport from "@components/Reports/InventoryReport";
import ReportDashboard from "@components/Reports/ReportDashboard";
import OrderReport from "@components/Reports/OrderReport";
import ExpenseReport from "@components/Reports/ExpenseReport";
import RetailPOS from "@pages/POS/pos";
import SalesHistoryScreen from "@pages/SalesHistory/SalesHistory";
import CustomerManagement from "@pages/Customer/Customermanagement";

export const routes = [
  {
    path: "/",
    element: <Layout />, // Layout as the shell for all (nested) routes
    children: [
      { path: "/", index: true, element: <Dashboard /> }, // /   -> Dashboard
      { path: "restaurant-setup", element: <RestaurantSetup /> },
      { path: "menu", element: <MenuItemsScreen /> },
      { path: "expense", element: <ExpensesScreen /> },
      { path: "stock", element: <InventoryScreen /> },
      { path: "purchase", element: <PurchaseScreen /> },
      {path: "customer-details", element: <CustomerManagement/>},
      {
        path: "checklist/*",
        element: <ChecklistScreen />,
      },
      {
        path: "reports",
        element: <RportsScreen />,
        children: [
          { index: true, element: <ReportDashboard /> },
          { path: "orders", element: <OrderReport /> },
          { path: "expenses", element: <ExpenseReport /> },
          { path: "purchase", element: <PurchaseReport /> },
          { path: "inventory", element: <InventoryReport /> },
        ],
      },
      {
        path: "attendance",
        element: <AttendanceLayout />, // layout screen
        children: [
          { index: true, element: <AttendanceDashboard /> }, // /attendance

          { path: "team", element: <AttendanceTeam /> }, // /attendance/team
          { path: "leave-history", element: <LeaveHistory /> }, // /attendance/leave-history
          { path: "leave-requests", element: <LeaveRequests /> }, // /attendance/leave-requests
        ],
      },
       {
    path:"sales-history",
    element: <SalesHistoryScreen/>
  },
      // add more child routes as needed ...
    ],
  },
  {
    path: "/pos",
    element: <RetailPOS />,
    // children: [{ path: "pos", element: <POSScreen /> }],
  },
  {
    path:"/menu-items",
    element: <MenuItemsScreen />
  },
  { path: "/login", element: <Auth /> },
];
