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
      retry: 1,
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
            <ToastContainer />
            <App />
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    </QueryClientProvider>
  </React.StrictMode>
);
