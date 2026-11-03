import "@utils/installAuth";
import "@utils/installSubscriptionGuard";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ToastContainer } from "react-toastify";

import muiTheme from "./theme/theme";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 0,
      // 401 is retried once by the session layer after a refresh; 403 / 404 / 429
      // won't change on a retry (and 429 would only extend the wait).
      retry: (failureCount, error) => {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status === 401 || status === 403 || status === 404 || status === 429) return false;
        return failureCount < 1;
      },
    },
  },
});

// expose for debugging
(window as any).__queryClient = queryClient;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <BrowserRouter>
          <ThemeProvider theme={muiTheme}>
            <CssBaseline />
            <ToastContainer
              position="top-right"
              autoClose={2000}
              pauseOnFocusLoss={false}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              pauseOnHover
              theme="light"
              style={{ zIndex: 999999, top: "64px" }}
            />
            <App />
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    </QueryClientProvider>
  </React.StrictMode>
);
