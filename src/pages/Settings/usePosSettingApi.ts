import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTenantContext, getAccessToken } from "@store/tenantContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5001";

function getApi() {
  const token = getAccessToken();
  return axios.create({
    baseURL: `${API_BASE}/auth/api`,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

// ─── Types ────────────────────────────────────────────────────

// The three sale types a branch can offer at POS. The server validates
// `pos_types` against exactly these labels — there are no slug forms — and
// `default_pos_type` must always be one of the selected ones.
export const POS_TYPE_LABELS = ["Invoice", "Quotation", "Proforma"] as const;
export type PosTypeLabel = (typeof POS_TYPE_LABELS)[number];

export interface PosSettingsResponse {
  zodu_id: string;
  branch_id: string;
  pos_types: PosTypeLabel[];
  default_pos_type: PosTypeLabel;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Both fields always travel together: the server checks `default_pos_type`
// against the `pos_types` in the same request, falling back to the stored list
// when it is absent — which is how a partial update ends up rejected.
export interface UpdatePosSettingsPayload {
  pos_types: PosTypeLabel[];
  default_pos_type: PosTypeLabel;
}

// ─── Normalizing ──────────────────────────────────────────────

/** Canonical labels, in canonical order, with unknown values dropped. */
export function toPosTypeLabels(raw: unknown): PosTypeLabel[] {
  const parts = Array.isArray(raw) ? raw : typeof raw === "string" ? raw.split(",") : [];
  const seen = new Set<PosTypeLabel>();
  parts.forEach((part) => {
    const key = String(part).trim().toLowerCase();
    const label = POS_TYPE_LABELS.find((l) => l.toLowerCase() === key);
    if (label) seen.add(label);
  });
  return POS_TYPE_LABELS.filter((l) => seen.has(l));
}

/**
 * Coerces whatever comes back (or is absent, on a branch with no row yet) into
 * a usable pair: at least one enabled type, and a default that is one of them.
 * The POS screen renders straight off this, so it can never be handed an empty
 * list or a default that has no tab.
 */
export function normalizePosSettings(raw: unknown): PosSettingsResponse {
  const row = (raw ?? {}) as Record<string, unknown>;
  const types = toPosTypeLabels(row.pos_types);
  const posTypes: PosTypeLabel[] = types.length > 0 ? types : ["Invoice"];
  const rawDefault = toPosTypeLabels([row.default_pos_type])[0];
  return {
    ...(row as unknown as PosSettingsResponse),
    pos_types: posTypes,
    default_pos_type: rawDefault && posTypes.includes(rawDefault) ? rawDefault : posTypes[0],
  };
}

// ─── Query keys ───────────────────────────────────────────────

export const posSettingsQueryKeys = {
  detail: (zoduId: string, branchId: string) => ["pos-settings", zoduId, branchId] as const,
};

// ─── Fetch POS settings ───────────────────────────────────────

async function fetchPosSettings(zoduId: string, branchId: string): Promise<PosSettingsResponse> {
  const { data } = await getApi().get(`/pos-settings/${zoduId}/${branchId}`);
  return normalizePosSettings(data.data?.settings ?? data.settings ?? data.data);
}

export function usePosSettings(enabled = true) {
  const { zoduId, branchId } = getTenantContext();
  return useQuery({
    queryKey: posSettingsQueryKeys.detail(zoduId ?? "", branchId ?? ""),
    queryFn: () => fetchPosSettings(zoduId!, branchId!),
    enabled: enabled && !!zoduId && !!branchId,
    // Deliberately never cached-and-trusted: POS mounts its own QueryClient, so
    // a save on the settings screen writes to a cache POS cannot see. Refetching
    // on every mount (and on focus, which a zero staleTime re-enables) is what
    // makes a changed tab row show up without a page reload. The response is a
    // handful of fields, so the extra call costs nothing.
    staleTime: 0,
    refetchOnMount: "always",
  });
}

// ─── Update POS settings ──────────────────────────────────────

async function updatePosSettings(payload: UpdatePosSettingsPayload): Promise<PosSettingsResponse> {
  const { zoduId, branchId } = getTenantContext();
  const { data } = await getApi().put(`/pos-settings/${zoduId}/${branchId}`, payload);
  return normalizePosSettings(data.data?.settings ?? data.settings ?? data.data);
}

export function useUpdatePosSettings(options?: {
  onSuccess?: (settings: PosSettingsResponse) => void;
  onError?: (msg: string) => void;
}) {
  const queryClient = useQueryClient();
  const { zoduId, branchId } = getTenantContext();

  return useMutation({
    mutationFn: updatePosSettings,
    onSuccess: (settings) => {
      queryClient.setQueryData(posSettingsQueryKeys.detail(zoduId ?? "", branchId ?? ""), settings);
      options?.onSuccess?.(settings);
    },
    onError: (err: unknown) => {
      options?.onError?.(extractPosErrorMessage(err, "Failed to update POS settings"));
    },
  });
}

/**
 * The POS settings endpoints answer with two different error shapes, both
 * already written for the user to read:
 *   { "errors": "\"default_pos_type\" (Proforma) must be one of ..." }  — validation
 *   { "data": { "error": "Failed to update POS settings..." } }         — everything else
 */
export function extractPosErrorMessage(err: unknown, fallback: string): string {
  if (!axios.isAxiosError(err)) return fallback;
  const body = err.response?.data as Record<string, any> | undefined;
  const candidates = [
    typeof body?.errors === "string" ? body.errors : undefined,
    body?.data?.error,
    body?.error,
    body?.data?.message,
    body?.message,
  ];
  return candidates.find((c) => typeof c === "string" && c.trim() !== "") ?? err.message ?? fallback;
}
