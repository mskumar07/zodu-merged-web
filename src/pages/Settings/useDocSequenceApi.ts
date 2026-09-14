/**
 * useDocSequenceApi.ts
 * ─────────────────────────────────────────────────────────────
 * The per-branch running counter behind every generated document id.
 *
 *   GET /retail/api/doc-sequence/:zodu_id/:branch_id/:doc_type
 *     → { doc_type, last_seq, next_seq, next_id }
 *     Read-only: it neither creates a document nor advances the counter, so
 *     it is safe to poll for a "Next Invoice: INV-145" style preview.
 *
 *   PUT /retail/api/doc-sequence/:zodu_id/:branch_id/:doc_type
 *     body { last_seq } → the next generated id becomes last_seq + 1.
 *     This is the "someone skipped numbers, put the sequence back" admin
 *     control. It rewrites billing numbers, so callers confirm first.
 * ─────────────────────────────────────────────────────────────
 */

import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTenantContext } from "@store/tenantContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "https://api.myzodu.com";

// ─── Types ────────────────────────────────────────────────────

// Every counter the retail service keeps. The three POS ones are the only
// ones this app previews today; the rest are listed so a caller elsewhere
// (purchases, expenses, customers) does not have to redeclare the union.
export const DOC_TYPES = ["INV", "QUO", "PRO", "PUR", "EXP", "CUS"] as const;
export type DocType = (typeof DOC_TYPES)[number];

export interface DocSequence {
  doc_type: DocType;
  // The last number actually handed out. 0 on a branch that has issued none.
  last_seq: number;
  // last_seq + 1 — what the next document will be numbered.
  next_seq: number;
  // The full id that number will render as, prefix and suffix included, e.g.
  // "INV-145". Server-composed: never rebuild it from parts on the client.
  next_id: string;
}

// ─── Query keys ───────────────────────────────────────────────

export const docSequenceQueryKeys = {
  detail: (zoduId: string, branchId: string, docType: DocType) =>
    ["doc-sequence", zoduId, branchId, docType] as const,
};

// ─── Fetch ────────────────────────────────────────────────────

export async function fetchDocSequence(docType: DocType): Promise<DocSequence> {
  const { zoduId, branchId } = getTenantContext();
  const { data } = await axios.get(
    `${API_BASE}/retail/api/doc-sequence/${zoduId}/${branchId}/${docType}`,
  );
  return (data?.data ?? data) as DocSequence;
}

/**
 * The next id for one counter. Never cached-and-trusted: another till on the
 * same branch may have burned numbers since this screen loaded, so the preview
 * refetches whenever the screen is remounted or refocused.
 */
export function useDocSequence(docType: DocType, enabled = true) {
  const { zoduId, branchId } = getTenantContext();
  return useQuery({
    queryKey: docSequenceQueryKeys.detail(zoduId ?? "", branchId ?? "", docType),
    queryFn: () => fetchDocSequence(docType),
    enabled: enabled && !!zoduId && !!branchId,
    staleTime: 0,
    refetchOnMount: "always",
    // A preview that fails is not worth a retry storm — the screen just falls
    // back to showing nothing rather than a wrong number.
    retry: 1,
  });
}

// ─── Update ───────────────────────────────────────────────────

export interface UpdateDocSequenceParams {
  docType: DocType;
  /** The next generated id becomes this + 1. */
  lastSeq: number;
}

async function updateDocSequence({ docType, lastSeq }: UpdateDocSequenceParams): Promise<DocSequence> {
  const { zoduId, branchId } = getTenantContext();
  const { data } = await axios.put(
    `${API_BASE}/retail/api/doc-sequence/${zoduId}/${branchId}/${docType}`,
    { last_seq: lastSeq },
  );
  return (data?.data ?? data) as DocSequence;
}

export function useUpdateDocSequence(options?: {
  onSuccess?: (seq: DocSequence) => void;
  onError?: (msg: string) => void;
}) {
  const queryClient = useQueryClient();
  const { zoduId, branchId } = getTenantContext();

  return useMutation({
    mutationFn: updateDocSequence,
    onSuccess: (seq, vars) => {
      queryClient.setQueryData(
        docSequenceQueryKeys.detail(zoduId ?? "", branchId ?? "", vars.docType),
        seq,
      );
      options?.onSuccess?.(seq);
    },
    onError: (err: unknown) => {
      options?.onError?.(extractDocSequenceError(err, "Failed to update the sequence"));
    },
  });
}

/** Pulls whichever error string the retail service put in the body. */
export function extractDocSequenceError(err: unknown, fallback: string): string {
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
