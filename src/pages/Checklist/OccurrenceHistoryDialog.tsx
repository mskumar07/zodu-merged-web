import { Box, Chip, Dialog, IconButton, Typography } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import CloseIcon from "@mui/icons-material/Close";
import DataTable, { type ColumnDef } from "@utils/DataTable";
import LottieLoader from "@components/LottieLoader";
import type { TaskOccurrence } from "./checklistNewApi";

interface Props {
  /** The task whose occurrences are listed; null keeps the dialog closed. */
  task: { code?: string; title: string } | null;
  rows: TaskOccurrence[];
  total: number;
  isLoading: boolean;
  hasMore: boolean;
  sentinelRef: React.RefObject<HTMLTableRowElement | null>;
  columns: ColumnDef<TaskOccurrence>[];
  onClose: () => void;
}

/**
 * Every day a recurring task has run, newest first, in a popup over the board — the
 * main table keeps its place, and "Update" on a row opens the status modal on top.
 */
export default function OccurrenceHistoryDialog({ task, rows, total, isLoading, hasMore, sentinelRef, columns, onClose }: Props) {
  return (
    <Dialog
      open={!!task}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: "14px", overflow: "hidden" } }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 3, py: 2, borderBottom: "1px solid #F1F5F9" }}>
        <Box sx={{ width: 38, height: 38, borderRadius: "10px", bgcolor: "#FFF1F2", color: "#E11D48", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <HistoryIcon sx={{ fontSize: 22 }} />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontSize: 17, fontWeight: 700, color: "#0F172A", lineHeight: 1.25 }}>Occurrence History</Typography>
          <Typography sx={{ fontSize: 12.5, color: "#6B7280" }} noWrap>
            {task?.code ? `${task.code} · ` : ""}{task?.title}
          </Typography>
        </Box>
        {!isLoading && (
          <Chip
            label={`${total} occurrence${total === 1 ? "" : "s"}`}
            size="small"
            sx={{ height: 24, fontSize: 12, fontWeight: 700, bgcolor: "#F1F5F9", color: "#475569" }}
          />
        )}
        <IconButton onClick={onClose} size="small" sx={{ color: "#64748B" }}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      <Box sx={{ p: 2.5, bgcolor: "#F8FAFC" }}>
        {isLoading ? (
          <LottieLoader />
        ) : (
          <DataTable<TaskOccurrence>
            columns={columns}
            rows={rows}
            rowKey={(occ) => occ.instance_id}
            maxHeight={420}
            hasNextPage={hasMore}
            loadMoreRef={sentinelRef}
            hideEndNote
            emptyMessage="No occurrences yet"
          />
        )}
      </Box>
    </Dialog>
  );
}
