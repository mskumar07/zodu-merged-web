import Layout from "@layouts/index"; // Adjust the import to your Layout file
import Dashboard from "@pages/Dashboard/index.tsx";
import RestaurantSetup from "@pages/RestaurantSetup/index.tsx";
import MenuItemsScreen from "@pages/MenuItemScreen/MenuItemScreen";
import RportsScreen from "@pages/ReportsScreen/index.tsx";
import PurchaseScreen from "@pages/PurchaseScreen";


import ReportDashboard from "@components/Reports/ReportDashboard";

import RetailPOS from "@pages/POS/pos";
import SalesHistoryScreen from "@pages/SalesHistory/SalesHistory";
import CustomerManagement from "@pages/Customer/Customermanagement";
import InventoryManagement from "../pages/InventoryScreen/InventoryManagement";
import ZoduLoginPage from "@pages/auth/Login";
import ZoduSignupPage from "@pages/auth/Signup";
import ProtectedRoute from "./ProtectedRoute";
import ZoduLandingPage from "@pages/landingPage/ZodulandingPage";
import Setting from "@pages/Settings/Setting";
import SalesReport from "@pages/ReportsScreen/SaleReport";
import CategoryItemSalesReport from "@pages/ReportsScreen/CategoryItemSalesReport";
import DatewiseSaleReport from "@pages/ReportsScreen/DatewiseSaleReport";

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
      { path: "stock", element: <InventoryManagement /> },
      { path: "purchase", element: <PurchaseScreen /> },
      {path: "customer-details", element: <CustomerManagement/>},
   
      {
        path: "reports",
        element: <RportsScreen />,
        children: [
          { index: true, element: <ReportDashboard /> },
          { path: "sales", element: <SalesReport /> },
          { path: "sales/category-item", element: <CategoryItemSalesReport /> },
          { path: "sales/datewise", element: <DatewiseSaleReport /> },
          // { path: "expenses", element: <ExpenseReport /> },
          // { path: "purchase", element: <PurchaseReport /> },
          // { path: "inventory", element: <InventoryReport /> },
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
  {
    path:"/settings",
    element: <Setting />
  }
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
