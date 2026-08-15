import React, { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Button, Typography, IconButton, Divider, Chip,
  Select, MenuItem, FormControl, TextField, Avatar, Tooltip,
  CircularProgress, Collapse,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import ChecklistIcon from "@mui/icons-material/Checklist";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AddIcon from "@mui/icons-material/Add";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ImageIcon from "@mui/icons-material/Image";
import { useAppSelector } from "@store/store";
import { ZoduId, BranchId, UserProfile } from "@store/slices/userSlice";
import { useUpdateTaskStatusMutation, useUploadItemFileMutation, useDeleteChecklistItemMutation, useUploadChecklistAttachmentsMutation, useDeleteItemFileMutation, useDeleteChecklistAttachmentMutation, type TaskStatusItemPayload } from "./checklistNewApi";

// ─── Theme ──────────────────────────────────────────────────────────────────────

const theme = createTheme({
  palette: {
    primary: { main: "#E11D48" },
    background: { default: "#F9FAFB", paper: "#FFFFFF" },
    text: { primary: "#0F172A", secondary: "#6B7280" },
  },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: "none", borderRadius: 8, fontWeight: 600 } } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 8, fontSize: 13 } } },
  },
});

// ─── Types ───────────────────────────────────────────────────────────────────────

export type ItemStatus = "Completed" | "In Progress" | "Cancelled" | "Not Started";

export interface TaskStatusItemFile {
  id: string;
  name: string;
  url: string;
  uploadedBy?: string;
  uploadedById?: string;
  /** true when uploaded in the current session — skip DELETE API on remove */
  isNew?: boolean;
  /** true when the file came from employee_checklist_upload[] — passed to DELETE API */
  isEmployeeUpload?: boolean;
}

export interface TaskStatusItem {
  id: string;
  order: number;
  title: string;
  description: string;
  referenceImageUrl?: string | null;
  status: ItemStatus;
  remarks: string;
  files: TaskStatusItemFile[];
}

export interface TaskStatusFile {
  id: string;
  name: string;
  url: string;
  type: string;
  sizeLabel: string;
  uploadedBy?: string;
  uploadedById?: string;
}

export interface TaskStatusDetail {
  taskTitle: string;
  taskId: string;
  checklistDbId: string;
  dueDate: string;
  assignedBy: string;
  assignedById?: string;
  assignedOn: string;
  status: string;
  assignees: { id: string; name: string }[];
  description: string;
  items: TaskStatusItem[];
  files: TaskStatusFile[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  task: TaskStatusDetail | null;
  loggedEmployeeId?: string;
  onEdit?: () => void;
  onSuccess?: () => void;
  onError?: (msg: string) => void;
  /** When false, the modal renders in read-only mode: status/remarks fields,
   *  uploads, the pencil "edit task" icon, and the submit button are all
   *  disabled — used when the Checklist / Tasklist module's can_edit is false. */
  canEdit?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────────

const AVATAR_PALETTE: { bg: string; color: string }[] = [
  { bg: "#FCE7F3", color: "#DB2777" },
  { bg: "#DCFCE7", color: "#15803D" },
  { bg: "#DBEAFE", color: "#1D4ED8" },
  { bg: "#FEF3C7", color: "#B45309" },
  { bg: "#EDE9FE", color: "#7C3AED" },
  { bg: "#FFE4E6", color: "#E11D48" },
];

function avatarPaletteIndex(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % AVATAR_PALETTE.length;
}
function avatarColor(seed: string) { return AVATAR_PALETTE[avatarPaletteIndex(seed)].bg; }
function avatarTextColor(seed: string) { return AVATAR_PALETTE[avatarPaletteIndex(seed)].color; }

// Backend caps uploads at upload.array('files', 5) — keep the picker in sync.
const MAX_UPLOAD_FILES = 5;

const ITEM_STATUS_COLORS: Record<ItemStatus, { bg: string; color: string; dot: string; border: string }> = {
  "Completed":   { bg: "#F0FDF4", color: "#15803D", dot: "#22C55E", border: "#BBF7D0" },
  "In Progress": { bg: "#FEF9C3", color: "#A16207", dot: "#EAB308", border: "#FDE68A" },
  "Cancelled":   { bg: "#FEF2F2", color: "#DC2626", dot: "#EF4444", border: "#FECACA" },
  "Not Started": { bg: "#F8FAFC", color: "#64748B", dot: "#94A3B8", border: "#E2E8F0" },
};

function getFileCategory(name: string): "image" | "pdf" | "excel" | "word" | "other" {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  if (["xlsx", "xls", "csv"].includes(ext)) return "excel";
  if (["doc", "docx"].includes(ext)) return "word";
  return "other";
}

function FileCategoryIcon({ name, size = 36 }: { name: string; size?: number }) {
  const cat = getFileCategory(name);
  const ext = (name.split(".").pop() ?? "").toLowerCase();
  const isImage = cat === "image";
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    pdf:   { bg: "#FEF2F2", color: "#DC2626",  label: "PDF" },
    excel: { bg: "#F0FDF4", color: "#16A34A",  label: ext.toUpperCase() },
    word:  { bg: "#EFF6FF", color: "#2563EB",  label: ext.toUpperCase() },
    image: { bg: "#F5F3FF", color: "#7C3AED",  label: ext.toUpperCase() },
    other: { bg: "#F8FAFC", color: "#64748B",  label: ext.toUpperCase() },
  };
  const s = styles[cat];
  return (
    <Box sx={{
      width: size, height: size, borderRadius: 1.5, bgcolor: s.bg,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      {cat === "pdf"   && <PictureAsPdfOutlinedIcon sx={{ fontSize: size * 0.5, color: s.color }} />}
      {cat === "excel" && <TableChartOutlinedIcon   sx={{ fontSize: size * 0.5, color: s.color }} />}
      {cat === "word"  && <DescriptionOutlinedIcon  sx={{ fontSize: size * 0.5, color: s.color }} />}
      {isImage         && <ImageIcon                sx={{ fontSize: size * 0.5, color: s.color }} />}
      {cat === "other" && <InsertDriveFileOutlinedIcon sx={{ fontSize: size * 0.5, color: s.color }} />}
    </Box>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", mb: 0.5, textTransform: "uppercase", letterSpacing: 0.3 }}>
      {children}
    </Typography>
  );
}

// ─── Evidence Thumbnail ────────────────────────────────────────────────────────────

export function EvidenceThumb({
  file, onRemove, deleting, disabled,
}: {
  file: { id: string; name: string; url: string; uploadedBy?: string; uploadedById?: string };
  onRemove?: () => void;
  deleting?: boolean;
  disabled?: boolean;
}) {
  const isImage = getFileCategory(file.name) === "image";

  return (
    <Box sx={{ width: 52 }}>
      <Box
        component={isImage ? "div" : "a"}
        href={isImage ? undefined : file.url}
        target={isImage ? undefined : "_blank"}
        sx={{
          position: "relative", width: 52, height: 52, borderRadius: 1.25,
          overflow: "hidden", bgcolor: "#F1F5F9",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {isImage ? (
          <Box
            component="img" src={file.url} alt={file.name}
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <FileCategoryIcon name={file.name} size={26} />
        )}

        {isImage && (
          <Box
            component="a" href={file.url} target="_blank"
            sx={{
              position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
              bgcolor: "rgba(0,0,0,0.25)", opacity: 0, transition: "opacity 0.2s",
              "&:hover": { opacity: 1 },
            }}
          >
            <VisibilityOutlinedIcon sx={{ fontSize: 13, color: "#fff" }} />
          </Box>
        )}

        {onRemove && (
          deleting ? (
            <CircularProgress size={10} sx={{ color: "#fff", position: "absolute", top: 2, right: 2 }} />
          ) : (
            <IconButton
              size="small"
              disabled={disabled}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(); }}
              sx={{
                position: "absolute", top: 1, right: 1, width: 14, height: 14,
                bgcolor: "rgba(0,0,0,0.55)", "&:hover": { bgcolor: "rgba(0,0,0,0.75)" },
              }}
            >
              <CloseIcon sx={{ fontSize: 9, color: "#fff" }} />
            </IconButton>
          )
        )}
      </Box>
      {file.uploadedBy && (
        <Typography sx={{ fontSize: 9, color: "#6B7280", mt: 0.4, textAlign: "center" }} noWrap>
          {file.uploadedBy}
        </Typography>
      )}
    </Box>
  );
}

// ─── Item Card ───────────────────────────────────────────────────────────────────

function ItemCard({
  item, onChangeStatus, onChangeRemarks, onPickFile, uploading, loggedEmployeeId, onRemoveFile, deletingEvidenceFileId, canEdit,
}: {
  item: TaskStatusItem;
  onChangeStatus: (id: string, status: ItemStatus) => void;
  onChangeRemarks: (id: string, remarks: string) => void;
  onPickFile: (id: string, files: FileList) => void;
  uploading: boolean;
  loggedEmployeeId?: string;
  onRemoveFile: (itemId: string, fileId: string) => void;
  deletingEvidenceFileId: string | null;
  canEdit: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const c = ITEM_STATUS_COLORS[item.status] ?? ITEM_STATUS_COLORS["Not Started"];
  const referenceFiles = item.files.filter((f) => !f.isEmployeeUpload);
  const evidenceFiles = item.files.filter((f) => f.isEmployeeUpload);

  return (
    <Box sx={{ border: "1px solid #E5E7EB", borderRadius: 2, mb: 1.5, overflow: "hidden", bgcolor: "#fff" }}>
      {/* Main row */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: "36px 1.8fr 2fr 170px 1.4fr 120px",
        alignItems: "center", gap: 1.5, px: 2.5, py: 1.75,
      }}>
        {/* # */}
        <Box sx={{
          width: 26, height: 26, borderRadius: "50%", bgcolor: "#F1F5F9",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#64748B" }}>{item.order}</Typography>
        </Box>

        {/* Title */}
        <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#0F172A" }}>{item.title}</Typography>

        {/* Description */}
        <Typography sx={{ fontSize: 12, color: "#6B7280", lineHeight: 1.4 }}>{item.description}</Typography>

        {/* Status */}
        <FormControl size="small" fullWidth disabled={!canEdit}>
          <Select
            value={item.status}
            onChange={(e) => onChangeStatus(item.id, e.target.value as ItemStatus)}
            sx={{
              fontSize: 12, fontWeight: 600, color: c.color, bgcolor: c.bg,
              border: `1px solid ${c.border}`, borderRadius: 2,
              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
            }}
            renderValue={(v) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: c.dot }} />
                {v}
              </Box>
            )}
          >
            {(Object.keys(ITEM_STATUS_COLORS) as ItemStatus[]).map((s) => (
              <MenuItem key={s} value={s} sx={{ fontSize: 12 }}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Remarks */}
        <TextField
          size="small"
          fullWidth
          placeholder="Add remarks..."
          value={item.remarks}
          onChange={(e) => onChangeRemarks(item.id, e.target.value)}
          disabled={!canEdit}
          sx={{ "& .MuiOutlinedInput-root": { fontSize: 12 } }}
        />

        {/* Evidence count + expand */}
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 0.75, cursor: "pointer" }}
          onClick={() => setExpanded((p) => !p)}
        >
          <Box sx={{
            display: "flex", alignItems: "center", gap: 0.5,
            bgcolor: item.files.length > 0 ? "#EFF6FF" : "#F8FAFC",
            border: `1px solid ${item.files.length > 0 ? "#BFDBFE" : "#E2E8F0"}`,
            borderRadius: 1.5, px: 1.25, py: 0.5,
          }}>
            <AttachFileIcon sx={{ fontSize: 13, color: item.files.length > 0 ? "#2563EB" : "#94A3B8" }} />
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: item.files.length > 0 ? "#2563EB" : "#94A3B8" }}>
              {item.files.length} {item.files.length === 1 ? "File" : "Files"}
            </Typography>
          </Box>
          {expanded ? <ExpandLessIcon sx={{ fontSize: 16, color: "#6B7280" }} /> : <ExpandMoreIcon sx={{ fontSize: 16, color: "#6B7280" }} />}
        </Box>

      </Box>

      {/* Reference Image / Evidence Attachments expandable panel */}
      <Collapse in={expanded}>
        <Box sx={{ borderTop: "1px solid #F1F5F9", bgcolor: "#FAFAFA" }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            {/* Left: Reference Image(s) — from file_url */}
            <Box sx={{ px: 2.5, py: 2, borderRight: "1px solid #E5E7EB" }}>
              <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#374151", mb: 1.5 }}>
                Reference Image ({referenceFiles.length})
              </Typography>
              {referenceFiles.length === 0 ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#9CA3AF", py: 1.5, justifyContent: "center" }}>
                  <ImageOutlinedIcon sx={{ fontSize: 16 }} />
                  <Typography sx={{ fontSize: 12 }}>No reference image</Typography>
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                  {referenceFiles.map((f) => (
                    <EvidenceThumb key={f.id} file={f} />
                  ))}
                </Box>
              )}
            </Box>

            {/* Right: Evidence files — from employee_checklist_upload */}
            <Box sx={{ px: 2.5, py: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#374151" }}>
                  Evidence ({evidenceFiles.length})
                </Typography>
                <Button
                  component="label"
                  variant="outlined"
                  size="small"
                  startIcon={uploading ? <CircularProgress size={12} sx={{ color: "#E11D48" }} /> : <AddIcon sx={{ fontSize: 14 }} />}
                  disabled={uploading || !canEdit}
                  sx={{ fontSize: 11.5, borderColor: "#E11D48", color: "#E11D48", borderRadius: 1.5, py: 0.4, px: 1.5,
                    "&:hover": { bgcolor: "#FFF1F2" } }}
                >
                  Upload Files
                  <input type="file" hidden multiple disabled={uploading || !canEdit}
                    onChange={(e) => { if (e.target.files?.length) onPickFile(item.id, e.target.files); e.target.value = ""; }}
                  />
                </Button>
              </Box>

              {evidenceFiles.length === 0 ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#9CA3AF", py: 1.5, justifyContent: "center" }}>
                  <InsertDriveFileOutlinedIcon sx={{ fontSize: 16 }} />
                  <Typography sx={{ fontSize: 12 }}>No evidence uploaded yet</Typography>
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                  {evidenceFiles.map((f) => {
                    const canDelete = canEdit && !!loggedEmployeeId && !!f.uploadedById && f.uploadedById === loggedEmployeeId;
                    return (
                      <EvidenceThumb
                        key={f.id}
                        file={f}
                        onRemove={canDelete ? () => onRemoveFile(item.id, f.id) : undefined}
                        deleting={deletingEvidenceFileId === f.id}
                        disabled={!!deletingEvidenceFileId}
                      />
                    );
                  })}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────────

type AttachFilter = "all" | "image" | "pdf" | "excel" | "word";

export default function UpdateTaskStatusModal({ open, onClose, task, loggedEmployeeId, onEdit, onSuccess, onError, canEdit = true }: Props) {
  const zoduId = useAppSelector(ZoduId);
  const branchId = useAppSelector(BranchId);
  const profile = useAppSelector(UserProfile);
  const loggedEmployeeName = (profile as any)?.name ?? (profile as any)?.employee_name ?? "";

  const [items, setItems] = useState<TaskStatusItem[]>(task?.items ?? []);
  const originalItemsRef = React.useRef<TaskStatusItem[]>(task?.items ?? []);
  const changedItemIdsRef = React.useRef<Set<string>>(new Set());
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [deletingEvidenceFileId, setDeletingEvidenceFileId] = useState<string | null>(null);

  const [attachFiles, setAttachFiles] = useState<TaskStatusFile[]>([]);
  const [attachUploading, setAttachUploading] = useState(false);
  const [deletingAttachId, setDeletingAttachId] = useState<string | null>(null);
  const [attachFilter, setAttachFilter] = useState<AttachFilter>("all");

  const [updateTaskStatus, { isLoading: isSubmitting }] = useUpdateTaskStatusMutation();
  const [uploadItemFile] = useUploadItemFileMutation();
  const [deleteChecklistItem] = useDeleteChecklistItemMutation();
  const [uploadChecklistAttachments] = useUploadChecklistAttachmentsMutation();
  const [deleteItemFile] = useDeleteItemFileMutation();
  const [deleteChecklistAttachment] = useDeleteChecklistAttachmentMutation();

  React.useEffect(() => {
    const freshItems = task?.items ?? [];
    originalItemsRef.current = freshItems;
    changedItemIdsRef.current = new Set();
    setItems(freshItems);
    setAttachFiles(task?.files ?? []);
  }, [task]);

  if (!task) return null;

  const handleChangeStatus = (id: string, status: ItemStatus) => {
    changedItemIdsRef.current.add(id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  };

  const handleChangeRemarks = (id: string, remarks: string) => {
    changedItemIdsRef.current.add(id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, remarks } : i)));
  };

  const handleRemoveItemFile = async (itemId: string, fileId: string) => {
    const item = items.find((i) => i.id === itemId);
    const file = item?.files.find((f) => f.id === fileId);
    if (!file) return;
    if (!file.isNew) {
      setDeletingEvidenceFileId(fileId);
      try {
        await deleteItemFile({
          item_id: itemId,
          file_id: fileId,
          employee_checklist_upload: file.isEmployeeUpload ?? false,
        }).unwrap();
      } catch { setDeletingEvidenceFileId(null); return; }
      setDeletingEvidenceFileId(null);
    }
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, files: i.files.filter((f) => f.id !== fileId) } : i)));
  };

  const handlePickFile = async (itemId: string, fileList: FileList) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList).slice(0, MAX_UPLOAD_FILES);
    changedItemIdsRef.current.add(itemId);
    setUploadingItemId(itemId);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      const res = await uploadItemFile({
        item_id: itemId, formData,
        employee_id: loggedEmployeeId, employee_name: loggedEmployeeName,
        employee_checklist_upload: true,
      }).unwrap();
      const rawData: any = res.data;
      const uploaded: { id: string; file_name: string; file_url: string }[] =
        Array.isArray(rawData) ? rawData : (rawData?.employee_checklist_upload ?? rawData?.file_url ?? []);
      if (uploaded.length > 0) {
        // API returns the full updated evidence list for the item — replace that subset entirely to avoid duplicates
        setItems((prev) => prev.map((i) => (i.id === itemId ? {
          ...i,
          files: [
            ...i.files.filter((f) => !f.isEmployeeUpload),
            ...uploaded.map((f) => ({ id: f.id, name: f.file_name, url: f.file_url, uploadedBy: f.uploaded_by_name ?? loggedEmployeeName, uploadedById: loggedEmployeeId, isNew: true, isEmployeeUpload: true })),
          ],
        } : i)));
      }
    } catch { /* RTK Query handles error */ }
    finally { setUploadingItemId(null); }
  };

  const handleDeleteItem = async (itemId: string) => {
    setDeletingItemId(itemId);
    try {
      await deleteChecklistItem({ item_id: itemId, checklistId: task.checklistDbId }).unwrap();
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch { /* RTK Query handles error */ }
    finally { setDeletingItemId(null); }
  };

  const handleAttachmentPick = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const picked = Array.from(files).slice(0, MAX_UPLOAD_FILES);
    setAttachUploading(true);
    try {
      const formData = new FormData();
      picked.forEach((f) => formData.append("files", f));
      const res = await uploadChecklistAttachments({
        id: task.checklistDbId, zodu_id: zoduId, branch_id: branchId,
        employee_id: loggedEmployeeId ?? "", employee_name: loggedEmployeeName, formData,
        skipInvalidation: true,
      }).unwrap();
      const rawData: any = res.data;
      const entries: { id: string; file_name: string; file_url: string }[] =
        Array.isArray(rawData) ? rawData : (rawData?.file_url ?? []);
      if (entries.length > 0) {
        setAttachFiles(entries.map((f) => ({
          id: f.id,
          name: f.file_name,
          url: f.file_url,
          type: (f.file_name.split(".").pop() ?? "file").toLowerCase(),
          sizeLabel: "",
          uploadedBy: (f as any).uploaded_by_name ?? loggedEmployeeName,
          uploadedById: (f as any).uploaded_by ?? loggedEmployeeId,
        })));
      }
    } catch { /* RTK Query handles error */ }
    finally { setAttachUploading(false); }
  };

  const handleDeleteAttachment = async (fileId: string) => {
    setDeletingAttachId(fileId);
    try {
      const res = await deleteChecklistAttachment({ checklist_id: task.checklistDbId, file_id: fileId }).unwrap();
      // API returns the remaining attachments — replace list entirely
      const remaining: { id: string; file_name: string; file_url: string; uploaded_by?: string; uploaded_by_name?: string }[] =
        Array.isArray(res.data) ? res.data : [];
      setAttachFiles(remaining.map((f) => ({
        id: f.id,
        name: f.file_name,
        url: f.file_url,
        type: (f.file_name.split(".").pop() ?? "file").toLowerCase(),
        sizeLabel: "",
        uploadedBy: f.uploaded_by_name ?? undefined,
        uploadedById: f.uploaded_by ?? undefined,
      })));
    } catch { /* RTK Query handles error */ }
    finally { setDeletingAttachId(null); }
  };

  const handleSubmit = async () => {
    const payload: TaskStatusItemPayload[] = items.map((i) => ({
      item_id: i.id,
      status: i.status,
      remarks: i.remarks,
      employee_id: changedItemIdsRef.current.has(i.id) ? (loggedEmployeeId ?? null) : null,
    }));
    try {
      await updateTaskStatus({
        id: task.checklistDbId,
        body: { zodu_id: zoduId, branch_id: branchId, items: payload },
      }).unwrap();
      onSuccess?.();
    } catch (err: any) {
      const msg = err?.data?.error ?? err?.data?.message ?? "Failed to update task status.";
      onError?.(msg);
    }
  };

  const isOwner = !!loggedEmployeeId && !!task.assignedById && loggedEmployeeId === task.assignedById;

  // Attachment filter counts
  const catCount = (cat: Exclude<AttachFilter, "all">) =>
    attachFiles.filter((f) => getFileCategory(f.name) === cat).length;
  const filteredAttach = attachFilter === "all"
    ? attachFiles
    : attachFiles.filter((f) => getFileCategory(f.name) === attachFilter);

  const filterChips: { key: AttachFilter; label: string; icon: React.ReactNode }[] = [
    { key: "all",   label: `All (${attachFiles.length})`,      icon: <InsertDriveFileOutlinedIcon sx={{ fontSize: 12 }} /> },
    { key: "image", label: `Images (${catCount("image")})`,    icon: <ImageIcon sx={{ fontSize: 12 }} /> },
    { key: "pdf",   label: `PDF (${catCount("pdf")})`,         icon: <PictureAsPdfOutlinedIcon sx={{ fontSize: 12 }} /> },
    { key: "excel", label: `Excel (${catCount("excel")})`,     icon: <TableChartOutlinedIcon sx={{ fontSize: 12 }} /> },
    { key: "word",  label: `Word (${catCount("word")})`,       icon: <DescriptionOutlinedIcon sx={{ fontSize: 12 }} /> },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, maxHeight: "94vh" } } }}
      >
        {/* ── Header ── */}
        <DialogTitle sx={{ pb: 1.5, pt: 2.5, px: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{
                width: 38, height: 38, borderRadius: "10px",
                bgcolor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center",
                color: "#E11D48", flexShrink: 0,
              }}>
                <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 18, color: "#0F172A" }}>Update Task Status</Typography>
                <Typography sx={{ fontSize: 12, color: "#6B7280", mt: 0.25 }}>
                  Review checklist items, update status and upload supporting documents.
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: -0.5 }}>
              {isOwner && canEdit && (
                <IconButton onClick={onEdit} size="small" sx={{ color: "#6B7280" }}>
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              )}
              <IconButton onClick={onClose} size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>

        <Divider sx={{ mx: 3 }} />

        <DialogContent sx={{ px: 3, py: 2.5, overflowY: "auto", bgcolor: "#F9FAFB" }}>

          {/* ── Task Information ── */}
          <Box sx={{ bgcolor: "#fff", border: "1px solid #F1F5F9", borderRadius: 2.5, p: 1.75, mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1.25 }}>
              <Box sx={{ width: 26, height: 26, borderRadius: "8px", bgcolor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", color: "#E11D48" }}>
                <ChecklistIcon sx={{ fontSize: 14 }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#0F172A" }}>Task Information</Typography>
              <Chip label={task.taskId} size="small"
                sx={{ bgcolor: "#F1F5F9", color: "#334155", fontWeight: 700, fontSize: 12, height: 24, borderRadius: 1.5 }}
              />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 2 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box><FieldLabel>Task Title</FieldLabel>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{task.taskTitle}</Typography>
                </Box>
                <Box><FieldLabel>Description</FieldLabel>
                  <Typography sx={{ fontSize: 12.5, color: "#374151", lineHeight: 1.4 }}>{task.description}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box><FieldLabel>Due Date</FieldLabel>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <CalendarMonthOutlinedIcon sx={{ fontSize: 14, color: "#9CA3AF" }} />
                    <Typography sx={{ fontSize: 13, color: "#374151" }}>{task.dueDate}</Typography>
                  </Box>
                </Box>
                <Box><FieldLabel>Status</FieldLabel>
                  <Chip label={task.status} size="small"
                    sx={{
                      bgcolor: "transparent",
                      color: "#1D4ED8",
                      fontWeight: 600,
                      fontSize: 13,
                      height: 20,
                      borderRadius: 1.5,
                      "& .MuiChip-label": { pl: 0, pr: 0 },
                    }}
                  />
                </Box>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box><FieldLabel>Assigned On</FieldLabel>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <CalendarMonthOutlinedIcon sx={{ fontSize: 14, color: "#9CA3AF" }} />
                    <Typography sx={{ fontSize: 13, color: "#374151" }}>{task.assignedOn}</Typography>
                  </Box>
                </Box>
                <Box><FieldLabel>Assigned To ({task.assignees.length})</FieldLabel>
                  <Tooltip title={task.assignees.map((a) => a.name).join(", ")}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {task.assignees.map((a) => a.name).join(", ")}
                    </Typography>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* ── Checklist Items ── */}
          <Box sx={{ bgcolor: "#fff", border: "1px solid #F1F5F9", borderRadius: 2.5, p: 2.5, mb: 2.5 }}>
            {/* Section header */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ width: 30, height: 30, borderRadius: "8px", bgcolor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", color: "#E11D48" }}>
                  <ChecklistIcon sx={{ fontSize: 16 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#0F172A" }}>
                    CHECKLIST ITEMS ({items.length})
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "#6B7280" }}>Review and update the status of each checklist item.</Typography>
                </Box>
              </Box>
            </Box>

            {/* Column header */}
            <Box sx={{
              display: "grid",
              gridTemplateColumns: "36px 1.8fr 2fr 170px 1.4fr 120px",
              gap: 1.5, px: 2.5, py: 1, mb: 1,
              bgcolor: "#F8FAFC", borderRadius: 1.5, border: "1px solid #F1F5F9",
            }}>
              {["#", "Checklist Item", "Description", "Status *", "Remarks (Optional)", "Evidence"].map((h, i) => (
                <Typography key={i} sx={{ fontSize: 12.5, fontWeight: 700, color: "#9CA3AF", letterSpacing: 0.1 }}>{h}</Typography>
              ))}
            </Box>

            {/* Item cards */}
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onChangeStatus={handleChangeStatus}
                onChangeRemarks={handleChangeRemarks}
                onPickFile={handlePickFile}
                uploading={uploadingItemId === item.id}
                loggedEmployeeId={loggedEmployeeId}
                onRemoveFile={handleRemoveItemFile}
                deletingEvidenceFileId={deletingEvidenceFileId}
                canEdit={canEdit}
              />
            ))}

            {/* Legend */}
            <Box sx={{ display: "flex", gap: 2.5, mt: 1.5, flexWrap: "wrap" }}>
              {(Object.entries(ITEM_STATUS_COLORS) as [ItemStatus, typeof ITEM_STATUS_COLORS[ItemStatus]][]).map(([s, c]) => (
                <Box key={s} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: c.dot }} />
                  <Typography sx={{ fontSize: 11, color: "#6B7280" }}>{s}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* ── Task Attachments (General) ── */}
          <Box sx={{ bgcolor: "#fff", border: "1px solid #F1F5F9", borderRadius: 2.5, p: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ width: 30, height: 30, borderRadius: "8px", bgcolor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", color: "#E11D48" }}>
                  <AttachFileIcon sx={{ fontSize: 16 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#0F172A" }}>TASK ATTACHMENTS (GENERAL)</Typography>
                  <Typography sx={{ fontSize: 12, color: "#6B7280" }}>
                    Upload documents related to the overall task. These files are not attached to any specific checklist item.
                  </Typography>
                </Box>
              </Box>
              <Button
                component="label"
                variant="outlined"
                size="small"
                startIcon={attachUploading ? <CircularProgress size={13} sx={{ color: "#E11D48" }} /> : <AddIcon sx={{ fontSize: 15 }} />}
                disabled={attachUploading || !canEdit}
                sx={{ fontSize: 12, borderColor: "#E11D48", color: "#E11D48", borderRadius: 1.5, px: 2, py: 0.6, whiteSpace: "nowrap",
                  "&:hover": { bgcolor: "#FFF1F2" } }}
              >
                Upload Files
                <input type="file" hidden multiple disabled={attachUploading || !canEdit}
                  onChange={(e) => { handleAttachmentPick(e.target.files); e.target.value = ""; }}
                />
              </Button>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 2.5 }}>
              {/* Drop zone */}
              <Box
                component="label"
                sx={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  border: "1.5px dashed #E5E7EB", borderRadius: 2, p: 3,
                  cursor: (attachUploading || !canEdit) ? "default" : "pointer", minHeight: 160,
                  opacity: canEdit ? 1 : 0.6,
                  "&:hover": (attachUploading || !canEdit) ? undefined : { borderColor: "#E11D48", bgcolor: "#FFF5F5" },
                }}
              >
                {attachUploading ? (
                  <>
                    <CircularProgress size={30} sx={{ color: "#E11D48", mb: 1.5 }} />
                    <Typography sx={{ fontSize: 12.5, color: "#9CA3AF" }}>Uploading…</Typography>
                  </>
                ) : (
                  <>
                    <Box sx={{ width: 48, height: 48, borderRadius: "50%", bgcolor: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", mb: 1.5 }}>
                      <UploadFileIcon sx={{ fontSize: 22, color: "#94A3B8" }} />
                    </Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", textAlign: "center" }}>
                      Drag & drop files here<br />or click to browse
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: "#9CA3AF", mt: 0.5, textAlign: "center" }}>
                      JPG, PNG, PDF, XLS, XLSX, DOC, DOCX<br />(Max 10MB each)
                    </Typography>
                  </>
                )}
                <input type="file" hidden multiple disabled={attachUploading || !canEdit}
                  onChange={(e) => { handleAttachmentPick(e.target.files); e.target.value = ""; }}
                />
              </Box>

              {/* Uploaded files list */}
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.25 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
                    Uploaded Files ({attachFiles.length})
                  </Typography>
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                    {filterChips.map(({ key, label, icon }) => {
                      const active = attachFilter === key;
                      return (
                        <Box
                          key={key}
                          onClick={() => setAttachFilter(key)}
                          sx={{
                            display: "flex", alignItems: "center", gap: 0.5,
                            px: 1.25, py: 0.4, borderRadius: 1.5, cursor: "pointer",
                            fontSize: 11, fontWeight: 600,
                            bgcolor: active ? "#E11D48" : "#F1F5F9",
                            color: active ? "#fff" : "#64748B",
                            border: `1px solid ${active ? "#E11D48" : "#E5E7EB"}`,
                            transition: "all 0.15s",
                            "&:hover": { bgcolor: active ? "#BE123C" : "#E5E7EB" },
                            userSelect: "none",
                          }}
                        >
                          {icon}
                          <Typography sx={{ fontSize: 11, fontWeight: 600, color: "inherit", lineHeight: 1 }}>
                            {label}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>

                <Box sx={{ maxHeight: 280, overflowY: "auto" }}>
                  {filteredAttach.length === 0 ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#9CA3AF", py: 3, justifyContent: "center" }}>
                      <InsertDriveFileOutlinedIcon sx={{ fontSize: 18 }} />
                      <Typography sx={{ fontSize: 12 }}>No files uploaded</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                      {filteredAttach.map((f) => {
                        const canDelete = canEdit && !!loggedEmployeeId && !!f.uploadedById && f.uploadedById === loggedEmployeeId;
                        return (
                          <EvidenceThumb
                            key={f.id}
                            file={{ id: f.id, name: f.name, url: f.url, uploadedBy: f.uploadedBy, uploadedById: f.uploadedById }}
                            onRemove={canDelete ? () => handleDeleteAttachment(f.id) : undefined}
                            deleting={deletingAttachId === f.id}
                            disabled={!!deletingAttachId}
                          />
                        );
                      })}
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <Divider />

        {/* ── Footer ── */}
        <DialogActions sx={{ px: 3, py: 2, gap: 1.5, justifyContent: "space-between" }}>
          <Button variant="outlined" disabled={!canEdit} sx={{ borderColor: "#E5E7EB", color: "#374151", px: 3 }}>
            Save as Draft
          </Button>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button variant="outlined" onClick={onClose} sx={{ borderColor: "#E5E7EB", color: "#374151", px: 3 }}>
              Cancel
            </Button>
            <Button
              variant="contained" disableElevation
              onClick={handleSubmit}
              disabled={!canEdit || isSubmitting || !!uploadingItemId || attachUploading}
              startIcon={(isSubmitting || !!uploadingItemId || attachUploading) ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : undefined}
              sx={{ bgcolor: "#E11D48", color: "#fff", px: 3, "&:hover": { bgcolor: "#BE123C" } }}
            >
              Submit & Update Status
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
