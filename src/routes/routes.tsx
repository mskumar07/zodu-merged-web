import Layout from "@layouts/index"; // Adjust the import to your Layout file
import Dashboard from "@pages/Dashboard/index.tsx";
import RestaurantSetup from "@pages/RestaurantSetup/index.tsx";
import MenuItemsScreen from "@pages/MenuItemScreen/MenuItemScreen";
import RportsScreen from "@pages/ReportsScreen/index.tsx";
import PurchaseScreen from "@pages/PurchaseScreen";
import ExpenseScreen from "@pages/ExpenseScreen";


import ReportDashboard from "@components/Reports/ReportDashboard";

import RetailPOS from "@pages/POS/pos";
import SalesHistoryScreen from "@pages/SalesHistory/SalesHistory";
import CustomerManagement from "@pages/Customer/Customermanagement";
import InventoryManagement from "../pages/InventoryScreen/InventoryManagement";
import ZoduLoginPage from "@pages/auth/Login";
import ZoduSignupPage from "@pages/auth/Signup";
import SelectBranch from "@pages/auth/SelectBranch";
import ProtectedRoute from "./ProtectedRoute";
import ZoduLandingPage from "@pages/landingPage/ZodulandingPage";
import Setting from "@pages/Settings/Setting";
import SalesReport from "@pages/ReportsScreen/SaleReport";
import CategoryItemSalesReport from "@pages/ReportsScreen/CategoryItemSalesReport";
import DatewiseSaleReport from "@pages/ReportsScreen/DatewiseSaleReport";
import DatewisePurchaseReport from "@pages/ReportsScreen/PurchaseReport/DatewisePurchaseReport";
import MonthWisePurchaseReport from "@pages/ReportsScreen/PurchaseReport/MonthWisePurchaseReport";
import DatewiseExpenseReport from "@pages/ReportsScreen/ExpenseReport/DatewiseExpenseReport";
import MonthWiseExpenseReport from "@pages/ReportsScreen/ExpenseReport/MonthWiseExpenseReport";
import MonthWiseProfitReport from "@pages/ReportsScreen/ProfitReport/MonthWiseProfitReport";
import YearWiseProfitReport  from "@pages/ReportsScreen/ProfitReport/YearWiseProfitReport";

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
      { path: "expense", element: <ExpenseScreen /> },
      {path: "customer-details", element: <CustomerManagement/>},
   
      {
        path: "reports",
        element: <RportsScreen />,
        children: [
          { index: true, element: <ReportDashboard /> },
          { path: "sales", element: <SalesReport /> },
          { path: "sales/category-item", element: <CategoryItemSalesReport /> },
          { path: "sales/datewise", element: <DatewiseSaleReport /> },
          { path: "purchase/datewise", element: <DatewisePurchaseReport /> },
          { path: "purchase/monthwise", element: <MonthWisePurchaseReport /> },
          { path: "expenses/datewise", element: <DatewiseExpenseReport /> },
          { path: "expenses/monthwise", element: <MonthWiseExpenseReport /> },
          { path: "profit/monthwise", element: <MonthWiseProfitReport /> },
          { path: "profit/yearwise",  element: <YearWiseProfitReport /> },
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
  {
    path: "/select-branch",
    element: (
      <ProtectedRoute>
        <SelectBranch />
      </ProtectedRoute>
    ),
  },
];
