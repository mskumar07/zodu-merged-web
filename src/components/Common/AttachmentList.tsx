import { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";

export interface AttachmentItem {
  id:   string;
  url:  string;
  name: string;
  kind: "image" | "pdf" | "doc" | "sheet" | "file";
}

const EXT_KIND: Record<string, AttachmentItem["kind"]> = {
  jpg: "image", jpeg: "image", png: "image", gif: "image", bmp: "image", webp: "image", svg: "image",
  pdf: "pdf",
  doc: "doc", docx: "doc", txt: "doc",
  xls: "sheet", xlsx: "sheet", csv: "sheet",
};

function kindOf(name: string, mimetype?: string | null): AttachmentItem["kind"] {
  const mime = (mimetype ?? "").toLowerCase();
  if (mime.startsWith("image/")) return "image";
  if (mime === "application/pdf") return "pdf";
  const ext = name.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
  return EXT_KIND[ext] ?? "file";
}

/**
 * Normalises whatever shape `attachment_url` comes back in — a JSON string, a
 * single URL, an array of URLs, or an array of { id, url, filename, mimetype } —
 * into one list. Reads only the metadata; the files themselves are not fetched.
 */
export function parseAttachments(raw: unknown): AttachmentItem[] {
  if (!raw) return [];
  let list: unknown[];
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      list = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      list = [raw];
    }
  } else {
    list = Array.isArray(raw) ? raw : [raw];
  }

  return list.flatMap((entry: any, i): AttachmentItem[] => {
    if (!entry) return [];
    if (typeof entry === "string") {
      const name = decodeURIComponent(entry.split("?")[0].split("/").pop() || `attachment-${i + 1}`);
      return [{ id: `att-${i}-${entry}`, url: entry, name, kind: kindOf(name) }];
    }
    const url: string = entry.url ?? "";
    if (!url) return [];
    const name: string = entry.filename ?? decodeURIComponent(url.split("?")[0].split("/").pop() || `attachment-${i + 1}`);
    return [{ id: entry.id ?? `att-${i}`, url, name, kind: kindOf(name, entry.mimetype) }];
  });
}

const KIND_ICON: Record<AttachmentItem["kind"], { Icon: typeof ImageOutlinedIcon; color: string; bg: string }> = {
  image: { Icon: ImageOutlinedIcon,           color: "#2563EB", bg: "#EFF6FF" },
  pdf:   { Icon: PictureAsPdfOutlinedIcon,    color: "#DC2626", bg: "#FEF2F2" },
  doc:   { Icon: DescriptionOutlinedIcon,     color: "#1D4ED8", bg: "#EFF6FF" },
  sheet: { Icon: TableChartOutlinedIcon,      color: "#16A34A", bg: "#F0FDF4" },
  file:  { Icon: InsertDriveFileOutlinedIcon, color: "#64748B", bg: "#F1F5F9" },
};

/** Full view of one attachment. The file is requested only while this is open. */
function AttachmentViewer({ file, onClose }: { file: AttachmentItem | null; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed]   = useState(false);
  const previewable = file?.kind === "image" || file?.kind === "pdf";

  return (
    <Dialog
      open={!!file}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      TransitionProps={{ onEnter: () => { setLoading(true); setFailed(false); } }}
      PaperProps={{ sx: { borderRadius: 2.5, height: previewable ? "90vh" : "auto" } }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, px: 2.5, py: 1.5, borderBottom: "1px solid #F1F5F9" }}>
        <Typography noWrap sx={{ flex: 1, fontSize: 15, fontWeight: 700, color: "#0F172A" }}>
          {file?.name}
        </Typography>
        {file && (
          <Button
            size="small"
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
            sx={{ textTransform: "none", fontWeight: 600, fontSize: 12.5, color: "#475569" }}
          >
            Open in new tab
          </Button>
        )}
        <IconButton size="small" onClick={onClose} sx={{ color: "#9CA3AF" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, position: "relative", bgcolor: previewable ? "#0F172A0D" : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {file && previewable && loading && !failed && (
          <CircularProgress size={32} sx={{ position: "absolute", color: "#D32F2F" }} />
        )}

        {file?.kind === "image" && !failed && (
          <Box
            component="img"
            src={file.url}
            alt={file.name}
            onLoad={() => setLoading(false)}
            onError={() => { setLoading(false); setFailed(true); }}
            sx={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", visibility: loading ? "hidden" : "visible" }}
          />
        )}

        {file?.kind === "pdf" && (
          <Box
            component="iframe"
            src={file.url}
            title={file.name}
            onLoad={() => setLoading(false)}
            sx={{ width: "100%", height: "100%", border: 0 }}
          />
        )}

        {file && (!previewable || failed) && (
          <Box sx={{ textAlign: "center", py: 6, px: 3 }}>
            <Typography sx={{ fontSize: 14, color: "#475569", mb: 2 }}>
              {failed ? "This file could not be loaded." : "Preview isn't available for this file type."}
            </Typography>
            <Button
              variant="contained"
              disableElevation
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
              sx={{ textTransform: "none", fontWeight: 700, bgcolor: "#D32F2F", "&:hover": { bgcolor: "#B71C1C" } }}
            >
              Open / Download
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Attachment tiles for a detail view: a type icon and the file name only — no
 * thumbnails, so opening the detail view doesn't download anything. Clicking a
 * tile opens the file in a full view, which is when it is fetched.
 */
export default function AttachmentList({ attachments }: { attachments: AttachmentItem[] }) {
  const [active, setActive] = useState<AttachmentItem | null>(null);
  if (attachments.length === 0) return null;

  return (
    <>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.25 }}>
        {attachments.map((file) => {
          const { Icon, color, bg } = KIND_ICON[file.kind];
          return (
            <Box
              key={file.id}
              component="button"
              type="button"
              onClick={() => setActive(file)}
              title={file.name}
              sx={{
                display: "flex", alignItems: "center", gap: 1.25,
                maxWidth: 260, px: 1.5, py: 1,
                border: "1px solid #E2E8F0", borderRadius: 1.5, bgcolor: "#fff",
                cursor: "pointer", textAlign: "left", font: "inherit",
                transition: "border-color 0.15s, background-color 0.15s",
                "&:hover": { borderColor: "#CBD5E1", bgcolor: "#F8FAFC" },
              }}
            >
              <Box sx={{ p: 0.75, borderRadius: 1, bgcolor: bg, display: "flex", flexShrink: 0 }}>
                <Icon sx={{ fontSize: 20, color }} />
              </Box>
              <Typography noWrap sx={{ fontSize: 12.5, fontWeight: 600, color: "#2563EB", minWidth: 0 }}>
                {file.name}
              </Typography>
            </Box>
          );
        })}
      </Box>
      <AttachmentViewer file={active} onClose={() => setActive(null)} />
    </>
  );
}
