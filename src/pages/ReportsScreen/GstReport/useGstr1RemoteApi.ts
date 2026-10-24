import axios from 'axios';
import { infiniteQueryOptions, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import axiosInstance from '@store/services/axiosInstance';

// ─── Shared contract of the server-driven GSTR-1 tabs ─────────
// Every one of these endpoints takes the same filters and answers with the same
// envelope: { period, summary, data: row[], meta }. Only the row shape differs.

/** Totals over every invoice the filters match, not just the loaded page. */
export interface RemoteSummary {
  total_invoices?: number;
  /** HSN only: distinct HSN rows, and the tax across them. */
  total_hsn_items?: number;
  total_tax?: number;
  /** CDNR only: it counts notes and reports the credit note value instead of invoices. */
  total_notes?: number;
  total_credit_note_value?: number;
  total_taxable_value: number;
  total_igst: number;
  total_cgst: number;
  total_sgst: number;
  total_cess: number;
  total_value: number;
}

export interface RemotePage<Row> {
  success?: boolean;
  error?: string;
  period: { financial_year: string; month: number | null; from_date: string; to_date: string };
  summary: RemoteSummary;
  data: Row[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

/** Path segment under /api/report/gst/gstr1/ for each server-driven tab. */
export type RemoteEndpoint = 'b2b' | 'b2c-large' | 'b2c-small' | 'cdnr' | 'cdnur' | 'hsn';

interface TenantParams {
  zodu_id: string;
  branch_id: string;
  /** "2026-27" */
  financial_year: string;
  /** 1-12; leave out for the whole year. */
  month?: number;
  isRestaurant?: boolean;
}

export interface RemoteReportParams extends TenantParams {
  /** A GSTIN ("all" or empty = every customer). Only the B2B and CDNR endpoints take it. */
  gstin?: string;
  /** Matches invoice/note no or customer name (B2B and CDNR: also GSTIN). */
  search?: string;
}

const PAGE_SIZE = 50;

const gstr1Path = (endpoint: string, isRestaurant?: boolean) =>
  `${isRestaurant ? '/restaurant' : '/retail'}/api/report/gst/gstr1/${endpoint}`;

class RemoteReportError extends Error {}

/** The server's `{ success: false, error }` message, or a fallback. */
export function apiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) return (err.response?.data as { error?: string } | undefined)?.error ?? err.message ?? fallback;
  return err instanceof Error ? err.message : fallback;
}

/** 4xx means the request itself is wrong, so retrying can't help. */
const retryOnce = (failures: number, err: unknown) =>
  failures < 1
  && !(err instanceof RemoteReportError)
  && !(axios.isAxiosError(err) && (err.response?.status ?? 500) < 500);

// ─── Summary cards + table ────────────────────────────────────

const remoteReportOptions = <Row>(endpoint: RemoteEndpoint | undefined, params: RemoteReportParams | null) =>
  infiniteQueryOptions({
    queryKey: ['gstr1', endpoint, 'report', params],
    enabled: !!endpoint && !!params?.zodu_id && !!params?.branch_id && !!params?.financial_year,
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: retryOnce,
    getNextPageParam: (last: RemotePage<Row>) => (last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined),
    queryFn: async ({ pageParam }): Promise<RemotePage<Row>> => {
      const { isRestaurant, gstin, search, ...rest } = params!;
      const res = await axiosInstance.get(gstr1Path(endpoint!, isRestaurant), {
        params: {
          ...rest,
          ...(gstin && gstin.toLowerCase() !== 'all' && { gstin }),
          ...(search && { search }),
          page: pageParam,
          limit: PAGE_SIZE,
        },
      });
      const page = res.data as RemotePage<Row>;
      if (page.success === false) throw new RemoteReportError(page.error || `Failed to load the ${endpoint} report`);
      return page;
    },
  });

/**
 * One server-driven tab, 50 rows at a time (scrolling loads the next page).
 * `summary` on any page covers all matching rows. The previous result stays on
 * screen while a changed filter or search loads (same tab only), so the table doesn't flash empty.
 * Pass `null` params (or no endpoint) to keep the query idle.
 */
export function useRemoteReport<Row>(endpoint: RemoteEndpoint | undefined, params: RemoteReportParams | null) {
  return useInfiniteQuery({
    ...remoteReportOptions<Row>(endpoint, params),
    // Keep the last result on screen while a filter/search reloads, but never carry one tab's rows
    // over to another tab (they have different columns): only reuse data from the same endpoint.
    placeholderData: (previous, previousQuery) => (previousQuery?.queryKey[1] === endpoint ? previous : undefined),
  });
}

// ─── B2B GSTIN dropdown ───────────────────────────────────────

export interface B2bGstinOption {
  gstin: string;
  customer_name: string;
}

/** GSTINs that have B2B invoices in the chosen year/month. The UI adds "All". */
export function useB2bGstins(params: TenantParams | null) {
  return useQuery({
    queryKey: ['gstr1', 'b2b', 'gstins', params],
    enabled: !!params?.zodu_id && !!params?.branch_id && !!params?.financial_year,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: retryOnce,
    queryFn: async (): Promise<B2bGstinOption[]> => {
      const { isRestaurant, ...query } = params!;
      const res = await axiosInstance.get(`${gstr1Path('b2b', isRestaurant)}/gstins`, { params: query });
      return res.data?.data ?? [];
    },
  });
}
