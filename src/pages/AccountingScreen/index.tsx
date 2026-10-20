import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, Menu, MenuItem, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AccountingStats from "./AccountingStats";
import AccountingTable from "./AccountingTable";
import AccountingFilters, { type FilterValues } from "./AccountingFilters";
import SuccessToast from "@components/Common/SuccessToast";
import useDebounce from "@hooks/useDebounce";
import { useTenantContext } from "@store/tenantContext";
import { apiErrorMessage, useAccountingEntries, type AccountingFilters as ApiFilters } from "./useAccountingApi";
import type { AccountingEntry, AccountingSummary } from "./types";

const NEW_ENTRY_OPTIONS = ["Sales", "Purchase", "Payment", "Receipt", "Expense"] as const;

const EMPTY_SUMMARY: AccountingSummary = {
  sales: { amount: 0, count: 0 }, purchases: { amount: 0, count: 0 }, payments: { amount: 0, count: 0 },
  receipts: { amount: 0, count: 0 }, expenses: { amount: 0, count: 0 },
};
const NO_ROWS: AccountingEntry[] = [];
const INITIAL_FILTERS: FilterValues = { search: "", type: "", from_date: "", to_date: "" };

export default function AccountingScreen() {
  const { zoduId, branchId, businessType } = useTenantContext();
  const isRestaurant = businessType?.toLowerCase() === "restaurant";

  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const closeMenu = useCallback(() => setAnchor(null), []);

  const [filters, setFilters] = useState<FilterValues>(INITIAL_FILTERS);
  const patchFilters = useCallback((patch: Partial<FilterValues>) => setFilters((f) => ({ ...f, ...patch })), []);
  const [toast, setToast] = useState("");

  // Search waits 400 ms; a cleared box applies at once so the unfiltered cache shows straight away.
  const trimmed = filters.search.trim();
  const debouncedSearch = useDebounce(trimmed, 400);
  const search = trimmed ? debouncedSearch : "";

  const params = useMemo<ApiFilters | null>(() => (zoduId && branchId ? {
    zodu_id: zoduId, branch_id: branchId, isRestaurant, search,
    from_date: filters.from_date, to_date: filters.to_date, type: filters.type || undefined,
  } : null), [zoduId, branchId, isRestaurant, search, filters.from_date, filters.to_date, filters.type]);

  const query = useAccountingEntries(params);
  const rows = useMemo(() => query.data?.pages.flatMap((p) => p.data) ?? NO_ROWS, [query.data]);
  const summary = query.data?.pages[0]?.summary ?? EMPTY_SUMMARY;

  const { error, fetchNextPage } = query;
  useEffect(() => {
    if (error) setToast(apiErrorMessage(error, "Failed to load accounting entries"));
  }, [error]);
  const loadMore = useCallback(() => { fetchNextPage(); }, [fetchNextPage]);

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", px: 1, py: 1, gap: 2.25 }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, flexWrap: "wrap", flexShrink: 0 }}>
        <Box>
          <Typography component="h1" sx={{ fontSize: 28, fontWeight: 800, color: "#0F172A", lineHeight: 1.2, letterSpacing: "-0.02em" }}>
            Accounting
          </Typography>
        </Box>
        <Button
          variant="contained" disableElevation
          startIcon={<AddIcon />} endIcon={<KeyboardArrowDownIcon />}
          onClick={(e) => setAnchor(e.currentTarget)}
          sx={{ bgcolor: "#D32F2F", fontWeight: 700, fontSize: 14, px: 2.5, py: 1.1, borderRadius: "8px", textTransform: "none", boxShadow: "0 4px 14px rgba(211,47,47,0.3)", "&:hover": { bgcolor: "#B71C1C" } }}
        >
          New Entry
        </Button>
        <Menu anchorEl={anchor} open={!!anchor} onClose={closeMenu} slotProps={{ paper: { sx: { minWidth: 170, borderRadius: "10px", mt: 0.5 } } }}>
          {NEW_ENTRY_OPTIONS.map((o) => <MenuItem key={o} onClick={closeMenu}>{o}</MenuItem>)}
        </Menu>
      </Box>

      <Box sx={{ flexShrink: 0 }}><AccountingStats summary={summary} /></Box>

      <AccountingFilters values={filters} onChange={patchFilters} />

      <AccountingTable
        rows={rows} loading={query.isLoading}
        hasNextPage={query.hasNextPage} isFetchingNextPage={query.isFetchingNextPage} onLoadMore={loadMore}
        emptyMessage={trimmed ? "No transactions match your search." : "No transactions found."}
      />

      <SuccessToast message={toast} severity="error" onClose={() => setToast("")} />
    </Box>
  );
}
