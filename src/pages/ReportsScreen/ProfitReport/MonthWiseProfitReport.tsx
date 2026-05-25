import React, { useMemo, useRef, useState } from "react";
import {
  Box, Card, Grid, MenuItem, Paper, Select, Skeleton, Typography,
} from "@mui/material";
import TrendingUpOutlinedIcon   from "@mui/icons-material/TrendingUpOutlined";
import ShoppingBagOutlinedIcon  from "@mui/icons-material/ShoppingBagOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import MoneyOffOutlinedIcon     from "@mui/icons-material/MoneyOffOutlined";
import { useQuery }             from "@tanstack/react-query";
import axios                    from "axios";
import { useTenantContext }     from "@store/tenantContext";
import DataTable, { type ColumnDef } from "@utils/DataTable";

// ── Config ────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";
const CURRENT_YEAR = new Date().getFullYear();

const fmt = (val: number) =>
  val != null
    ? `₹ ${val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "₹ 0.00";

// ── Types ─────────────────────────────────────────────────────
interface MonthRow {
  month_num:      number;
  month_name:     string;
  total_sales:    number;
  total_purchase: number;
  total_expense:  number;
  profit:         number;
}

interface YearlySummary {
  total_sales:    number;
  total_purchase: number;
  total_expense:  number;
  profit:         number;
}

interface ProfitResponse {
  success:         boolean;
  data: {
    year:            number;
    yearly_summary:  YearlySummary;
    monthly_data:    MonthRow[];
  };
}

// ── API hooks ─────────────────────────────────────────────────

/** Fetches only years that have real data from the backend */
function useActiveYears(zoduId: string, branchId: string) {
  return useQuery<number[]>({
    queryKey: ["profit-active-years", zoduId, branchId],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE}/restaurant/api/report/profit/active-years`, {
        params: { zodu_id: zoduId, branch_id: branchId },
      });
      return (data?.data?.active_years as number[]) ?? [CURRENT_YEAR];
    },
    enabled:   !!zoduId && !!branchId,
    staleTime: 10 * 60 * 1000, // cache 10 min — years rarely change mid-session
  });
}

function useProfitReport(zoduId: string, branchId: string, year: number) {
  return useQuery<ProfitResponse>({
    queryKey: ["profit-report", zoduId, branchId, year],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE}/restaurant/api/report/profit`, {
        params: { zodu_id: zoduId, branch_id: branchId, year },
      });
      return data;
    },
    enabled:   !!zoduId && !!branchId,
    staleTime: 5 * 60 * 1000,
  });
}

// ── StatCard ──────────────────────────────────────────────────
interface StatCardProps {
  title:       string;
  value:       string;
  icon:        React.ReactNode;
  iconBg:      string;
  valueColor?: string;
  loading?:    boolean;
}
const StatCard = ({ title, value, icon, iconBg, valueColor, loading }: StatCardProps) => (
  <Card sx={{ p: 1.5, borderRadius: 1, height: "100%" }} elevation={1}>
    <Box display="flex" gap={1} alignItems="center">
      <Box sx={{
        width: 36, height: 36, borderRadius: "50%", bgcolor: iconBg,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        {icon}
      </Box>
      <Box flex={1}>
        <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ letterSpacing: 0.3 }}>
          {title}
        </Typography>
        {loading
          ? <Skeleton width={90} height={24} />
          : <Typography fontWeight="bold" mt={0.5} sx={{ fontSize: 18, lineHeight: 1.3, color: valueColor || "text.primary" }}>
              {value}
            </Typography>
        }
      </Box>
    </Box>
  </Card>
);

// ── Main ──────────────────────────────────────────────────────
const MonthWiseProfitReport: React.FC = () => {
  const { zoduId, branchId } = useTenantContext();

  // fetch active years first, then default-select the most recent one
  const { data: activeYears = [CURRENT_YEAR], isLoading: yearsLoading } =
    useActiveYears(zoduId ?? "", branchId ?? "");

  const [year, setYear] = useState<number>(CURRENT_YEAR);

  // once active years load, sync selected year to the first (most recent) one
  const selectedYear = activeYears.includes(year) ? year : (activeYears[0] ?? CURRENT_YEAR);

  const { data: res, isLoading } = useProfitReport(zoduId ?? "", branchId ?? "", selectedYear);

  const summary = res?.data?.yearly_summary;
  const rows    = res?.data?.monthly_data ?? [];

  const tableContainerRef = useRef<HTMLDivElement>(null);

  const columns = useMemo<ColumnDef<MonthRow>[]>(() => [
    {
      key:      "month_name",
      label:    "MONTH",
      minWidth: 120,
      render:   (row) => (
        <Typography sx={{ fontSize: "0.8rem", color: "primary.main", fontWeight: 600, whiteSpace: "nowrap" }}>
          {row.month_name}
        </Typography>
      ),
    },
    {
      key:      "total_sales",
      label:    "TOTAL SALES",
      align:    "right",
      minWidth: 140,
      render:   (row) => (
        <Typography sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#2e7d32", whiteSpace: "nowrap" }}>
          {fmt(row.total_sales)}
        </Typography>
      ),
    },
    {
      key:      "total_purchase",
      label:    "TOTAL PURCHASE",
      align:    "right",
      minWidth: 150,
      render:   (row) => (
        <Typography sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#1565c0", whiteSpace: "nowrap" }}>
          {fmt(row.total_purchase)}
        </Typography>
      ),
    },
    {
      key:      "total_expense",
      label:    "TOTAL EXPENSE",
      align:    "right",
      minWidth: 150,
      render:   (row) => (
        <Typography sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#e65100", whiteSpace: "nowrap" }}>
          {fmt(row.total_expense)}
        </Typography>
      ),
    },
    {
      key:      "profit",
      label:    "TOTAL PROFIT",
      align:    "right",
      minWidth: 140,
      render:   (row) => (
        <Typography sx={{
          fontSize: "0.85rem", fontWeight: 700, whiteSpace: "nowrap",
          color: row.profit >= 0 ? "#2e7d32" : "#c62828",
        }}>
          {row.profit < 0 ? "-" : ""}{fmt(Math.abs(row.profit))}
        </Typography>
      ),
    },
  ], []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", p: { xs: 1, md: 1 }, background: "#fff", gap: 1.5 }}>

      {/* STAT CARDS */}
      <Grid container spacing={1.5} sx={{ flexShrink: 0 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            loading={isLoading}
            title="Total Sales"
            value={fmt(summary?.total_sales ?? 0)}
            iconBg="#e8f5e9"
            icon={<ShoppingBagOutlinedIcon sx={{ color: "#2e7d32", fontSize: 18 }} />}
            valueColor="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            loading={isLoading}
            title="Total Purchase"
            value={fmt(summary?.total_purchase ?? 0)}
            iconBg="#e3f2fd"
            icon={<ShoppingCartOutlinedIcon sx={{ color: "#1565c0", fontSize: 18 }} />}
            valueColor="#1565c0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            loading={isLoading}
            title="Total Expense"
            value={fmt(summary?.total_expense ?? 0)}
            iconBg="#fff3e0"
            icon={<MoneyOffOutlinedIcon sx={{ color: "#e65100", fontSize: 18 }} />}
            valueColor="#e65100"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            loading={isLoading}
            title="Total Profit"
            value={fmt(summary?.profit ?? 0)}
            iconBg="#f3e5f5"
            icon={<TrendingUpOutlinedIcon sx={{ color: "#7b1fa2", fontSize: 18 }} />}
            valueColor={(summary?.profit ?? 0) >= 0 ? "#2e7d32" : "#c62828"}
          />
        </Grid>
      </Grid>

      {/* TABLE */}
      <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <Paper sx={{ borderRadius: 1, border: "1px solid #eee", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

          {/* Table header bar with year filter */}
          <Box sx={{ px: 2, pt: 1.5, pb: 1, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <Typography fontWeight="bold" fontSize="0.9rem">
              Monthly Profit Breakdown — {selectedYear}
            </Typography>

            {yearsLoading ? (
              <Skeleton width={90} height={32} sx={{ borderRadius: 1 }} />
            ) : (
              <Select
                size="small"
                value={selectedYear}
                onChange={(e) => setYear(Number(e.target.value))}
                sx={{ fontSize: "0.8rem", height: 32, minWidth: 90 }}
              >
                {activeYears.map((y: number) => (
                  <MenuItem key={y} value={y} sx={{ fontSize: "0.85rem" }}>{y}</MenuItem>
                ))}
              </Select>
            )}
          </Box>

          <Box sx={{ flex: 1, minHeight: 0 }}>
            <DataTable<MonthRow>
              columns={columns}
              rows={rows}
              rowKey={(row) => String(row.month_num)}
              isLoading={isLoading}
              skeletonRows={6}
              hasNextPage={false}
              isFetchingNextPage={false}
              loadMoreRef={null as any}
              tableContainerRef={tableContainerRef}
              maxHeight="100%"
              emptyMessage={`No profit data available for ${selectedYear}`}
            />
          </Box>

          <Box sx={{ px: 2, py: 1, display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #f0f0f0", flexShrink: 0 }}>
            <Typography variant="caption" color="text.secondary">
              {rows.length > 0 ? `${rows.length} months · ${selectedYear}` : `Full year performance · ${selectedYear}`}
            </Typography>
          </Box>

        </Paper>
      </Box>
    </Box>
  );
};

export default MonthWiseProfitReport;
