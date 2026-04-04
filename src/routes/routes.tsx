import Layout from "@layouts/index"; // Adjust the import to your Layout file
import POSLayout from "@layouts/POSLayout"; // Adjust the import to your Layout file
import Dashboard from "@pages/Dashboard/index.tsx";
import Auth from "@pages/auth/index.tsx";
import POSScreen from "@pages/POS/index.tsx";
import RestaurantSetup from "@pages/RestaurantSetup/index.tsx";
import MenuItemsScreen from "@pages/MenuItemScreen/MenuItemScreen";
import ExpensesScreen from "@pages/ExpensesScreen";
import RportsScreen from "@pages/ReportsScreen/index.tsx";
import InventoryScreen from "@pages/InventoryScreen/InventoryManagement";
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
import InventoryManagement from "../pages/InventoryScreen/InventoryManagement";
import ZoduLoginPage from "@pages/auth/Login";
import ZoduSignupPage from "@pages/auth/Signup";
import ProtectedRoute from "./ProtectedRoute";
import ZoduLandingPage from "@pages/landingPage/ZodulandingPage";

export const routes = [
  {
    path: "/",
    element: <ZoduLandingPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ), // Layout as the shell for all (nested) routes
    children: [
      { path: "dashboard", element: <Dashboard /> },
      { path: "restaurant-setup", element: <RestaurantSetup /> },
      { path: "menu", element: <MenuItemsScreen /> },
      { path: "expense", element: <ExpensesScreen /> },
      { path: "stock", element: <InventoryManagement /> },
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
   {
    path: "/pos",
    element: <RetailPOS />,
    // children: [{ path: "pos", element: <POSScreen /> }],
  },
      // add more child routes as needed ...
    ],
  },
 
  {
    path:"/menu-items",
    element: <MenuItemsScreen />
  },
  { path: "/login", element: <ZoduLoginPage /> },
  { path: "/signup", element: <ZoduSignupPage /> },
];
