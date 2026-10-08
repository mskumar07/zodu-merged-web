import React, { memo, useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import {
  Box, Button, FormControl, MenuItem, Paper, Select, Tab, Tabs, Typography, type SelectChangeEvent,
} from '@mui/material';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import TableViewOutlinedIcon from '@mui/icons-material/TableViewOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LottieLoader from '@components/LottieLoader';
import SuccessToast from '@components/Common/SuccessToast';
import useDebounce from '@hooks/useDebounce';
import { useTenantContext } from '@store/tenantContext';
import { useGstr1Report, type Gstr1Params } from './useGstr1Api';
import {
  apiErrorMessage, useB2bGstins, useRemoteReport, type B2bGstinOption, type RemoteReportParams,
} from './useGstr1RemoteApi';
import { exportGstr1Excel, exportGstr1Pdf } from './exportGstr1';
import { TAB_DEFS, remoteCards, remoteFooter, buildCards, buildExport } from './gstr1Tabs';
import InvoiceListTable from './InvoiceListTable';
import TableToolbar from './TableToolbar';
import TabStatCards from './TabStatCards';
import RowDetailsDialog from './RowDetailsDialog';
import type { ListRow } from './invoiceTableParts';

// ─── Return period helpers ────────────────────────────────────

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const FY_MONTH_ORDER = [3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2]; // Apr … Mar (Date month indexes)

/** Five most recent financial years, newest first: "2026-27", "2025-26"… */
function buildFinancialYears(now = new Date()) {
  const start = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return Array.from({ length: 5 }, (_, i) => {
    const y = start - i;
    return `${y}-${String((y + 1) % 100).padStart(2, '0')}`;
  });
}

const periodsOf = (fy: string) => {
  const startYear = Number(fy.slice(0, 4));
  return FY_MONTH_ORDER.map((m) => {
    const year = m >= 3 ? startYear : startYear + 1;
    return { value: `${m + 1}-${year}`, month: m + 1, year, label: `${MONTHS[m]} ${year}` };
  });
};

/** The current month for the running FY, March for a finished one. */
function defaultPeriod(fy: string, now = new Date()) {
  const periods = periodsOf(fy);
  const cur = `${now.getMonth() + 1}-${now.getFullYear()}`;
  return (periods.find((p) => p.value === cur) ?? periods[periods.length - 1]).value;
}

// ─── Filter bar (memoised: tab and table changes don't repaint it) ──

interface Filters { fy: string; period: string; gstin: string }

const FilterField = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <Box sx={{ minWidth: 190, flex: '1 1 190px', maxWidth: 300 }}>
    <Typography sx={{ fontSize: 12, color: '#475569', mb: 0.5 }}>
      {label}{required && <Box component="span" sx={{ color: '#D2122E' }}> *</Box>}
    </Typography>
    <FormControl size="small" fullWidth>{children}</FormControl>
  </Box>
);

const OPTION_SX = { fontSize: 13 };

const FilterBar = memo(function FilterBar({ filters, onChange, financialYears, gstins, showGstin }: {
  filters: Filters;
  onChange: (k: keyof Filters) => (e: SelectChangeEvent<string>) => void;
  financialYears: string[];
  gstins: B2bGstinOption[];
  /** Hidden on tabs whose invoices have no GSTIN (e.g. B2C Large). */
  showGstin: boolean;
}) {
  const periods = useMemo(() => periodsOf(filters.fy), [filters.fy]);
  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <FilterField label="Financial Year" required>
        <Select value={filters.fy} onChange={onChange('fy')} sx={OPTION_SX}>
          {financialYears.map((y) => <MenuItem key={y} value={y} sx={OPTION_SX}>{y}</MenuItem>)}
        </Select>
      </FilterField>
      <FilterField label="Return Period" required>
        <Select value={filters.period} onChange={onChange('period')} sx={OPTION_SX}>
          {periods.map((p) => <MenuItem key={p.value} value={p.value} sx={OPTION_SX}>{p.label}</MenuItem>)}
        </Select>
      </FilterField>
      {showGstin && (
        <FilterField label="GSTIN">
          <Select value={filters.gstin} onChange={onChange('gstin')} sx={OPTION_SX}>
            <MenuItem value="all" sx={OPTION_SX}>All</MenuItem>
            {gstins.map((g) => (
              <MenuItem key={g.gstin} value={g.gstin} sx={OPTION_SX}>
                {g.gstin}{g.customer_name ? ` - ${g.customer_name}` : ''}
              </MenuItem>
            ))}
          </Select>
        </FilterField>
      )}
    </Box>
  );
});

const NoteBox = memo(function NoteBox({ notes }: { notes: string[] }) {
  return (
    <Box sx={{ display: 'flex', gap: 1.5, p: 2, borderRadius: 1, bgcolor: '#EFF6FF', border: '1px solid #DBEAFE' }}>
      <InfoOutlinedIcon sx={{ color: '#1976d2', mt: 0.2 }} />
      <Box>
        <Typography sx={{ fontSize: 15, fontWeight: 700, mb: 0.5 }}>Note:</Typography>
        <Box component="ul" sx={{ m: 0, pl: 2.5, color: '#334155', fontSize: 13, lineHeight: 1.8 }}>
          {notes.map((n) => <li key={n}>{n}</li>)}
        </Box>
      </Box>
    </Box>
  );
});

const TAB_SX = {
  minHeight: 40, borderBottom: '1px solid #E5E7EB',
  '& .MuiTab-root': { textTransform: 'none', fontSize: 13, fontWeight: 600, minHeight: 40, color: '#475569' },
  '& .Mui-selected': { color: '#D2122E' },
  '& .MuiTabs-indicator': { bgcolor: '#D2122E' },
};
const EXPORT_BTN_SX = { textTransform: 'none', fontWeight: 600, color: '#0F172A', borderColor: '#CBD5E1', height: 40 };

interface Toast { message: string; severity: 'success' | 'error' }
const NO_TOAST: Toast = { message: '', severity: 'success' };

// ─── Screen ───────────────────────────────────────────────────

const Gstr1Report: React.FC = () => {
  const { zoduId, branchId, businessType } = useTenantContext();
  const isRestaurant = businessType?.toLowerCase() === 'restaurant';
  const hasTenant = !!zoduId && !!branchId;

  const financialYears = useMemo(() => buildFinancialYears(), []);
  // Filters apply as they change; Generate Report just reloads the current view.
  const [filters, setFilters] = useState<Filters>(() => ({
    fy: financialYears[0], period: defaultPeriod(financialYears[0]), gstin: 'all',
  }));
  const [tabId, setTabId] = useState(TAB_DEFS[0].id);
  const [viewRow, setViewRow] = useState<ListRow<object> | null>(null);
  // Search text and hidden columns belong to the current tab; both reset when it changes.
  const [search, setSearch] = useState('');
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());
  const [toast, setToast] = useState<Toast>(NO_TOAST);
  const [exporting, setExporting] = useState(false);

  // Client-side tabs filter on the deferred value; the server-driven B2B tab waits 400 ms.
  const query = useDeferredValue(search).trim().toLowerCase();
  const serverSearch = useDebounce(search.trim(), 400);

  const period = useMemo(
    () => periodsOf(filters.fy).find((p) => p.value === filters.period)!,
    [filters.fy, filters.period],
  );

  const def = useMemo(() => TAB_DEFS.find((t) => t.id === tabId)!, [tabId]);
  const isRemote = !!def.remote;

  const notify = useCallback((message: string, severity: Toast['severity']) => setToast({ message, severity }), []);

  // ── GSTIN dropdown: reloads when the financial year or month changes ──
  const gstinParams = useMemo(() => (hasTenant ? {
    zodu_id: zoduId!, branch_id: branchId!, financial_year: filters.fy, month: period.month, isRestaurant,
  } : null), [hasTenant, zoduId, branchId, filters.fy, period.month, isRestaurant]);
  const gstinQuery = useB2bGstins(gstinParams);
  const gstinOptions = useMemo(() => gstinQuery.data ?? [], [gstinQuery.data]);

  // A GSTIN picked for another period may not exist in this one.
  useEffect(() => {
    if (gstinQuery.isSuccess && filters.gstin !== 'all' && !gstinOptions.some((g) => g.gstin === filters.gstin)) {
      setFilters((f) => ({ ...f, gstin: 'all' }));
    }
  }, [gstinQuery.isSuccess, gstinOptions, filters.gstin]);

  // ── Server-driven tabs (B2B, B2C Large): summary, search and paging come from the API ──
  const remoteParams = useMemo<RemoteReportParams | null>(() => (hasTenant && def.remote ? {
    zodu_id: zoduId!, branch_id: branchId!, financial_year: filters.fy, month: period.month,
    gstin: def.remote.gstin ? filters.gstin : undefined, search: serverSearch, isRestaurant,
  } : null), [hasTenant, def.remote, zoduId, branchId, filters.fy, period.month, filters.gstin, serverSearch, isRestaurant]);
  const remoteQuery = useRemoteReport<object>(def.remote?.endpoint, remoteParams);
  const remoteRows = useMemo(() => remoteQuery.data?.pages.flatMap((p) => p.data) ?? [], [remoteQuery.data]);
  const remoteSummary = remoteQuery.data?.pages[0]?.summary;

  // ── The other tabs still read the shared (sample) report ──
  const mockParams = useMemo<Gstr1Params | null>(() => (hasTenant ? {
    zodu_id: zoduId!, branch_id: branchId!, financial_year: filters.fy,
    month: period.month, year: period.year,
    gstin: filters.gstin === 'all' ? undefined : filters.gstin,
    isRestaurant,
  } : null), [hasTenant, zoduId, branchId, filters.fy, period, filters.gstin, isRestaurant]);
  const report = useGstr1Report(mockParams, !isRemote);

  // Errors go to the toast; a successful refresh does too (see `generate`).
  useEffect(() => {
    if (remoteQuery.error) notify(apiErrorMessage(remoteQuery.error, `Failed to load the ${def.exportName} report`), 'error');
  }, [remoteQuery.error, def.exportName, notify]);
  useEffect(() => {
    if (gstinQuery.error) notify(apiErrorMessage(gstinQuery.error, 'Failed to load GSTINs'), 'error');
  }, [gstinQuery.error, notify]);

  const changeTab = useCallback((id: string) => {
    setTabId(id);
    setViewRow(null);
    setSearch('');
    setHidden(new Set());
  }, []);

  const toggleColumn = useCallback((key: string) => setHidden((prev) => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  }), []);

  // Changing the year or month changes which GSTINs exist, so the GSTIN falls back to "All".
  const setField = useCallback((k: keyof Filters) => (e: SelectChangeEvent<string>) => {
    const v = e.target.value;
    setFilters((f) => {
      if (k === 'fy') return { fy: v, period: defaultPeriod(v), gstin: 'all' };
      if (k === 'period') return { ...f, period: v, gstin: 'all' };
      return { ...f, gstin: v };
    });
  }, []);

  const generate = useCallback(async () => {
    const res = await (isRemote ? remoteQuery.refetch() : report.refetch());
    if (!res.isError) notify(`${def.exportName} report generated successfully`, 'success');
  }, [isRemote, remoteQuery, report, def.exportName, notify]);

  // Everything below is driven by the selected tab's config (see gstr1Tabs.tsx).
  const rows = useMemo(
    () => (isRemote ? remoteRows : report.data ? def.rows(report.data) : []),
    [isRemote, remoteRows, report.data, def],
  );
  const cards = useMemo(
    () => (isRemote ? remoteCards(remoteSummary) : buildCards(def, rows, report.data)),
    [isRemote, remoteSummary, def, rows, report.data],
  );
  const footerOverride = useMemo(() => {
    if (isRemote) return remoteSummary ? remoteFooter(remoteSummary) : undefined;
    return report.data && def.footer ? def.footer(report.data) : undefined;
  }, [isRemote, remoteSummary, report.data, def]);
  const loading = isRemote ? remoteQuery.isLoading : report.isFetching && !report.data;
  const cardsLoading = isRemote ? remoteQuery.isLoading : report.isFetching;
  const busy = isRemote ? remoteQuery.isFetching : report.isFetching;

  const title = `GSTR-1 ${def.exportName} (${period.label})`;
  const fileName = `GSTR1_${def.exportName.replace(/[^A-Za-z0-9]+/g, '_')}_${period.label.replace(' ', '_')}`;

  // A server-paged tab exports every matching invoice, not only the pages scrolled in so far.
  const runExport = useCallback(async (kind: 'pdf' | 'excel') => {
    setExporting(true);
    try {
      let all: object[] = rows;
      if (isRemote) {
        let pages = remoteQuery.data?.pages ?? [];
        let more = !!remoteQuery.hasNextPage;
        while (more) {
          const next = await remoteQuery.fetchNextPage();
          pages = next.data?.pages ?? pages;
          more = !!next.hasNextPage;
        }
        all = pages.flatMap((p) => p.data);
      }
      const table = buildExport(def, all);
      if (kind === 'pdf') await exportGstr1Pdf(table, title, fileName); else exportGstr1Excel(table, title, fileName);
    } catch (e) {
      notify(apiErrorMessage(e, 'Export failed'), 'error');
    } finally {
      setExporting(false);
    }
  }, [rows, isRemote, remoteQuery, def, title, fileName, notify]);

  const hasExport = rows.length > 0 && !exporting;
  // fetchNextPage is stable, so the table's scroll observer isn't rebuilt on every render.
  const { fetchNextPage: fetchMoreRemote } = remoteQuery;
  const loadMore = useCallback(() => { fetchMoreRemote(); }, [fetchMoreRemote]);

  if (!isRemote && report.isLoading && !report.data) return <LottieLoader />;

  return (
    <Box sx={{ height: '100%', overflowY: 'auto', p: 1.25, bgcolor: '#fff', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography sx={{ fontSize: 24, fontWeight: 700, color: '#0F172A' }}>GSTR1 Report</Typography>
          <Typography sx={{ fontSize: 13, color: '#64748B' }}>Summary and filing details of outward supplies of goods or services</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<PictureAsPdfOutlinedIcon />} disabled={!hasExport}
            onClick={() => runExport('pdf')} sx={EXPORT_BTN_SX}>
            Export PDF
          </Button>
          <Button variant="outlined" startIcon={<TableViewOutlinedIcon sx={{ color: '#16A34A' }} />} disabled={!hasExport}
            onClick={() => runExport('excel')} sx={EXPORT_BTN_SX}>
            Export Excel
          </Button>
          <Button variant="contained" startIcon={<RefreshIcon />} onClick={generate} disabled={busy}
            sx={{ textTransform: 'none', fontWeight: 700, bgcolor: '#D2122E', height: 40, px: 2.5, '&:hover': { bgcolor: '#b00f26' } }}>
            Generate Report
          </Button>
        </Box>
      </Box>

      <FilterBar filters={filters} onChange={setField} financialYears={financialYears} gstins={gstinOptions} showGstin={!def.remote || !!def.remote.gstin} />

      <TabStatCards cards={cards} loading={cardsLoading} />

      {/* Tabs on the left, the table's search and Columns menu on the right */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, borderBottom: '1px solid #E5E7EB' }}>
        <Tabs value={tabId} onChange={(_, v) => changeTab(v)} variant="scrollable" scrollButtons="auto"
          sx={{ ...TAB_SX, borderBottom: 0, flex: 1, minWidth: 0 }}>
          {TAB_DEFS.map((t) => <Tab key={t.id} value={t.id} label={t.label} disableRipple />)}
        </Tabs>
        <TableToolbar
          search={search} onSearch={setSearch} placeholder={def.searchPlaceholder}
          columns={def.columns.filter((c) => c.key !== 'sno')} hidden={hidden} onToggleColumn={toggleColumn}
          lockedKeys={def.lockedKeys}
        />
      </Box>

      <Box sx={{ flex: 1, minHeight: 420, display: 'flex' }}>
        <Paper elevation={0} sx={{ flex: 1, minWidth: 0, border: '1px solid #E5E7EB', borderRadius: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <InvoiceListTable
            emptyMessage={def.emptyMessage}
            columns={def.columns}
            rows={rows}
            sumKeys={def.sumKeys}
            searchText={def.searchText}
            rowKey={def.rowKey}
            query={query}
            hiddenKeys={hidden}
            footerOverride={footerOverride}
            onViewRow={def.viewable ? setViewRow : undefined}
            loading={loading}
            clientFilter={!isRemote}
            hasNextPage={isRemote && !!remoteQuery.hasNextPage}
            isFetchingNextPage={isRemote && remoteQuery.isFetchingNextPage}
            onLoadMore={isRemote ? loadMore : undefined}
          />
        </Paper>
      </Box>

      {def.notes && <NoteBox notes={def.notes} />}

      <RowDetailsDialog title={def.exportName} row={viewRow} columns={def.columns} onClose={() => setViewRow(null)} />

      <SuccessToast message={toast.message} severity={toast.severity} onClose={() => setToast(NO_TOAST)} />
    </Box>
  );
};

export default Gstr1Report;
