import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Button, TextField, Typography, IconButton,
  CircularProgress, Divider, Switch, Select, MenuItem,
  FormControl, Collapse,
  FormControlLabel, Radio, RadioGroup,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ChecklistIcon from "@mui/icons-material/Checklist";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import RepeatIcon from "@mui/icons-material/Repeat";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ImageIcon from "@mui/icons-material/Image";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useAppSelector } from "@store/store";
import { ZoduId, BranchId, UserProfile } from "@store/slices/userSlice";
import {
  useCreateNewChecklistMutation,
  useUpdateNewChecklistMutation,
  useUploadChecklistAttachmentsMutation,
  useUploadItemFileMutation,
  useDeleteChecklistItemMutation,
  useGetEmployeesForAssignQuery,
  type ChecklistAssignee,
  type ChecklistItemPayload,
  type CreateChecklistPayload,
  type ChecklistResponse,
} from "./checklistNewApi";
import { EvidenceThumb } from "./UpdateTaskStatusModal";

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
    MuiInputLabel: { styleOverrides: { root: { fontSize: 13 } } },
  },
});

// Backend caps uploads at upload.array('files', 5) — keep the picker in sync.
const MAX_UPLOAD_FILES = 5;

// ─── Types ───────────────────────────────────────────────────────────────────────

interface ItemRow {
  id: string;
  /** Server-side item UUID — present when editing an existing item, undefined for new rows. */
  serverId?: string;
  item_title: string;
  description: string;
  /** Newly picked files queued for upload after the checklist is created (create mode). */
  files: File[];
  /** Already-uploaded files from the server, shown when editing an existing checklist item. */
  existingFiles: { id: string; name: string; url: string; uploadedBy?: string; uploadedByName?: string }[];
}

interface ExistingAttachment {
  id: string;
  name: string;
  url: string;
  uploadedBy?: string;
  uploadedByName?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: (msg: string) => void;
  /** When provided, the modal opens in edit mode pre-filled with this checklist's data. */
  editChecklist?: ChecklistResponse | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────────

function initItem(): ItemRow {
  return { id: crypto.randomUUID(), item_title: "", description: "", files: [], existingFiles: [] };
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151", mb: 0.5 }}>
      {children}{required && <Box component="span" sx={{ color: "#E11D48", ml: 0.25 }}>*</Box>}
    </Typography>
  );
}

function SectionHeader({
  num, icon, title, subtitle,
}: {
  num: number; icon: React.ReactNode; title: string; subtitle?: string;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 2 }}>
      <Box sx={{
        width: 30, height: 30, borderRadius: "50%",
        bgcolor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center",
        color: "#E11D48", flexShrink: 0,
      }}>
        {icon}
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#0F172A" }}>
          {num}. {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ fontSize: 12, color: "#6B7280", mt: 0.25 }}>{subtitle}</Typography>
        )}
      </Box>
    </Box>
  );
}

// table column header cell
function ColHead({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#6B7280" }}>{children}</Typography>
  );
}

// ─── Attachment file helpers ──────────────────────────────────────────────────

type AttachFilter = "all" | "image" | "pdf" | "excel" | "word";

function getFileCategory(name: string): "image" | "pdf" | "excel" | "word" | "other" {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  if (["xlsx", "xls", "csv"].includes(ext)) return "excel";
  if (["doc", "docx"].includes(ext)) return "word";
  return "other";
}

// ─── Main Component ───────────────────────────────────────────────────────────────

export default function CreateTaskModal({ open, onClose, onSuccess, onError, editChecklist }: Props) {
  const zoduId = useAppSelector(ZoduId);
  const branchId = useAppSelector(BranchId);
  const profile = useAppSelector(UserProfile);
  const loggedEmployeeId = (profile as any)?.employee_id ?? "";
  const loggedEmployeeName = (profile as any)?.employee_name ?? (profile as any)?.restaurant_name ?? "";

  const isEditMode = !!editChecklist;

  const [createChecklist, { isLoading: isCreating }] = useCreateNewChecklistMutation();
  const [updateChecklist, { isLoading: isUpdating }] = useUpdateNewChecklistMutation();
  const [uploadAttachments] = useUploadChecklistAttachmentsMutation();
  const [uploadItemFile] = useUploadItemFileMutation();
  const [deleteChecklistItem] = useDeleteChecklistItemMutation();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [attachmentsUploading, setAttachmentsUploading] = useState(false);
  const { data: employeesData } = useGetEmployeesForAssignQuery(
    { zodu_id: zoduId, branch_id: branchId },
    { skip: !open || !zoduId || !branchId }
  );

  // Task info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");     
  const [status, setStatus] = useState("Not Started");
  const [dueDate, setDueDate] = useState("");
  const [startDate, setStartDate] = useState("");

  // Assign to
  const [selectedAssignees, setSelectedAssignees] = useState<ChecklistAssignee[]>([]);

  // Checklist items — 1 row by default
  const [items, setItems] = useState<ItemRow[]>([initItem()]);

  // Recurring
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurFrequency, setRecurFrequency] = useState("Daily");
  const [recurEvery, setRecurEvery] = useState(1);
  const [recurStart, setRecurStart] = useState("");
  const [recurEnds, setRecurEnds] = useState<"Never" | "On Date">("Never");
  const [recurEndDate, setRecurEndDate] = useState("");

  // Attachments
  const [attachments, setAttachments] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<ExistingAttachment[]>([]);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<string[]>([]);
  const attachInputRef = useRef<HTMLInputElement>(null);

  // Attachment filter
  const [attachFilter, setAttachFilter] = useState<AttachFilter>("all");

  // Expanded item for file panel
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─── Reset ──────────────────────────────────────────────────────────────────────
  const resetForm = useCallback(() => {
    setTitle(""); setDescription(""); setStatus("Not Started");
    setDueDate(""); setStartDate("");
    setSelectedAssignees([]);
    setItems([initItem()]);
    setIsRecurring(false); setRecurFrequency("Daily"); setRecurEvery(1);
    setRecurStart(""); setRecurEnds("Never"); setRecurEndDate("");
    setAttachments([]); setExistingAttachments([]); setRemovedAttachmentIds([]); setErrors({});
  }, []);

  const handleClose = useCallback(() => { resetForm(); onClose(); }, [resetForm, onClose]);

  // ─── Pre-fill from editChecklist ──────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    if (!editChecklist) { resetForm(); return; }

    setTitle(editChecklist.title ?? "");
    setDescription(editChecklist.description ?? "");
    setStatus(editChecklist.status ?? "Not Started");
    setDueDate(editChecklist.due_date ? editChecklist.due_date.slice(0, 10) : "");
    setStartDate(editChecklist.start_date ? editChecklist.start_date.slice(0, 10) : "");
    setSelectedAssignees(
      (editChecklist.assignees ?? []).map((a) => ({ id: a.id, employee_id: a.employee_id, employee_name: a.employee_name }))
    );
    setItems(
      (editChecklist.items ?? []).length > 0
        ? editChecklist.items.map((i) => ({
            id: i.id, serverId: i.id, item_title: i.item_title, description: i.description ?? "", files: [],
            existingFiles: (i.file_url ?? []).map((f: any) => ({
              id: f.id, name: f.file_name, url: f.file_url,
              uploadedBy: f.uploaded_by, uploadedByName: f.uploaded_by_name,
            })),
          }))
        : [initItem()]
    );
    setIsRecurring(!!editChecklist.is_recurring);
    setRecurFrequency(editChecklist.recur_frequency ?? "Daily");
    setRecurEvery(editChecklist.recur_every ?? 1);
    setRecurStart(editChecklist.recur_start_date ? editChecklist.recur_start_date.slice(0, 10) : "");
    setRecurEnds(editChecklist.recur_end_date ? "On Date" : "Never");
    setRecurEndDate(editChecklist.recur_end_date ? editChecklist.recur_end_date.slice(0, 10) : "");
    setAttachments([]);
    setExistingAttachments(
      // The backend returns attachments either nested ({ file_url: FileEntry[] }) or
      // flat (the attachment row itself is a FileEntry with file_url as a URL string).
      (editChecklist.attachments ?? []).flatMap((att: any) => {
        const entries = Array.isArray(att.file_url) ? att.file_url : [att];
        return entries
          .filter((f: any) => f && f.file_name)
          .map((f: any) => ({
            id: f.id, name: f.file_name, url: f.file_url,
            uploadedBy: f.uploaded_by ?? att.uploaded_by,
            uploadedByName: f.uploaded_by_name ?? att.uploaded_by_name,
          }));
      })
    );
    setRemovedAttachmentIds([]);
    setErrors({});
  }, [open, editChecklist, resetForm]);

  // ─── Validate ───────────────────────────────────────────────────────────────────
  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Task title is required";
    if (!startDate) e.startDate = "Start date is required";
    if (!dueDate) e.dueDate = "Due date is required";
    if (selectedAssignees.length === 0) e.assignees = "At least one employee must be selected";
    if (!items.some((i) => i.item_title.trim())) e.items = "At least one checklist item is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ─── Submit ─────────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;

    const filledItemRows = items.filter((i) => i.item_title.trim());

    const filledItems: ChecklistItemPayload[] = filledItemRows.map((i, idx) => ({
      ...(i.serverId ? { id: i.serverId } : {}),
      item_order: idx + 1,
      item_title: i.item_title.trim(),
      description: i.description.trim(),
      file_url: i.existingFiles.map((f) => ({
        id: f.id, file_url: f.url, file_name: f.name,
        uploaded_by: f.uploadedBy, uploaded_by_name: f.uploadedByName,
      })),
    }));

    const payload: CreateChecklistPayload = {
      zodu_id: zoduId,
      branch_id: branchId,
      title: title.trim(),
      description: description.trim(),
      status,
      due_date: dueDate || undefined,
      start_date: startDate || undefined,
      is_recurring: isRecurring,
      recur_frequency: isRecurring ? recurFrequency : null,
      recur_every: isRecurring ? recurEvery : null,
      recur_ends: isRecurring ? recurEnds : null,
      recur_end_date: isRecurring && recurEnds === "On Date" ? recurEndDate : null,
      recur_start_date: isRecurring ? recurStart : null,
      assignees: selectedAssignees,
      items: filledItems,
      created_by: loggedEmployeeId,
      created_by_name: loggedEmployeeName,
      // Only send the attachments key when the user removed one — listing what remains to keep.
      ...(isEditMode && removedAttachmentIds.length > 0
        ? {
            attachments: existingAttachments.map((f) => ({
              id: f.id, file_url: f.url, file_name: f.name,
              uploaded_by: f.uploadedBy, uploaded_by_name: f.uploadedByName,
            })),
          }
        : {}),
    };

    try {
      const res = isEditMode
        ? await updateChecklist({ id: editChecklist!.id, body: payload }).unwrap()
        : await createChecklist(payload).unwrap();
      if (!res.success) return;

      const createdItems = res.data.items ?? [];
      const itemsWithFiles = filledItemRows
        .map((row, idx) => ({ files: row.files, created: createdItems[idx] }))
        .filter((x) => x.files.length > 0 && x.created);

      if (itemsWithFiles.length > 0 || attachments.length > 0) {
        setIsUploading(true);
        try {
          await Promise.all([
            ...itemsWithFiles.map(({ files, created }) => {
              const formData = new FormData();
              files.forEach((file) => formData.append("files", file));
              return uploadItemFile({
                item_id: created.id, formData, checklistId: res.data.id,
                employee_id: loggedEmployeeId, employee_name: loggedEmployeeName,
              }).unwrap();
            }),
            attachments.length > 0
              ? (() => {
                  const formData = new FormData();
                  attachments.forEach((file) => formData.append("files", file));
                  return uploadAttachments({
                    id: res.data.id,
                    zodu_id: zoduId,
                    branch_id: branchId,
                    employee_id: loggedEmployeeId,
                    employee_name: loggedEmployeeName,
                    formData,
                  }).unwrap();
                })()
              : Promise.resolve(),
          ]);
        } finally {
          setIsUploading(false);
        }
      }

      onSuccess?.();
      handleClose();
    } catch (err: any) {
      const msg = err?.data?.error ?? err?.data?.message ?? (isEditMode ? "Failed to update task." : "Failed to create task.");
      onError?.(msg);
    }
  };

  // ─── Employee helpers ────────────────────────────────────────────────────────────
  const employees = ((employeesData?.data ?? []) as any[]).filter((e) => e.employee_id !== loggedEmployeeId);

  const handleEmployeeSelect = (empId: string) => {
    if (!empId) return;
    if (selectedAssignees.some((a) => a.employee_id === empId)) return;
    const emp = employees.find((e) => e.employee_id === empId);
    if (!emp) return;
    setSelectedAssignees((prev) => [...prev, { employee_id: emp.employee_id, employee_name: emp.name }]);
    if (errors.assignees) setErrors((e) => ({ ...e, assignees: "" }));
  };

  const removeAssignee = (empId: string) =>
    setSelectedAssignees((prev) => prev.filter((a) => a.employee_id !== empId));

  // ─── Item helpers ────────────────────────────────────────────────────────────────
  const addItem = () => setItems((prev) => [...prev, initItem()]);
  const removeItem = async (id: string) => {
    if (items.length <= 1) return;
    const item = items.find((i) => i.id === id);
    if (isEditMode && item?.serverId) {
      setDeletingItemId(id);
      try {
        await deleteChecklistItem({ item_id: item.serverId }).unwrap();
        setItems((prev) => prev.filter((i) => i.id !== id));
      } catch { /* RTK Query handles error */ }
      finally { setDeletingItemId(null); }
    } else {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
  };
  const updateItem = (id: string, field: keyof ItemRow, val: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: val } : i)));
  const removeQueuedItemFile = (itemId: string, idx: number) =>
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, files: i.files.filter((_, fi) => fi !== idx) } : i)));
  const removeExistingItemFile = (itemId: string, fileId: string) =>
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, existingFiles: i.existingFiles.filter((f) => f.id !== fileId) } : i)));

  // In edit mode, an item already exists on the server — newly picked files upload immediately
  // instead of waiting for "Update Task". In create mode the item has no id yet, so the picked
  // files are queued and uploaded only after the checklist (and its items) are created.
  const handleItemFilesPick = async (itemId: string, filesPicked: File[]) => {
    if (filesPicked.length === 0) return;
    const files = filesPicked.slice(0, MAX_UPLOAD_FILES);
    const item = items.find((i) => i.id === itemId);
    // Queue files if: create mode, OR edit mode but this is a newly-added row (no serverId yet)
    if (!isEditMode || !item?.serverId) {
      setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, files: [...i.files, ...files] } : i)));
      return;
    }
    setUploadingItemId(itemId);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      const res = await uploadItemFile({
        item_id: item.serverId, formData,
        employee_id: loggedEmployeeId, employee_name: loggedEmployeeName,
      }).unwrap();
      const rawData: any = res.data;
      const uploaded: { id: string; file_name: string; file_url: string; uploaded_by?: string; uploaded_by_name?: string }[] =
        Array.isArray(rawData) ? rawData : rawData?.file_url ?? [];
      if (uploaded.length > 0) {
        // API returns the full updated file list for the item — replace entirely to avoid duplicates
        setItems((prev) => prev.map((i) => (i.id === itemId
          ? {
              ...i,
              existingFiles: uploaded.map((f) => ({
                id: f.id, name: f.file_name, url: f.file_url,
                uploadedBy: f.uploaded_by ?? loggedEmployeeId,
                uploadedByName: f.uploaded_by_name ?? loggedEmployeeName,
              })),
            }
          : i)));
      }
    } catch { /* RTK Query handles error */ }
    finally { setUploadingItemId(null); }
  };

  // ─── Attachment helpers ──────────────────────────────────────────────────────────
  const handleAttachmentPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const pickedAll = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (pickedAll.length === 0) return;

    if (!isEditMode) {
      setAttachments((prev) => [...prev, ...pickedAll].slice(0, MAX_UPLOAD_FILES));
      return;
    }

    const picked = pickedAll.slice(0, MAX_UPLOAD_FILES);
    setAttachmentsUploading(true);
    try {
      const formData = new FormData();
      picked.forEach((file) => formData.append("files", file));
      const res = await uploadAttachments({
        id: editChecklist!.id,
        zodu_id: zoduId,
        branch_id: branchId,
        employee_id: loggedEmployeeId,
        employee_name: loggedEmployeeName,
        formData,
        skipInvalidation: true,
      }).unwrap();
      // The upload response has been observed as a flat array of file entries directly
      // on `data`, but fall back to the nested shapes too in case the backend varies.
      const rawData: any = res.data;
      const uploadedFiles: { id: string; file_name: string; file_url: string; uploaded_by?: string; uploaded_by_name?: string }[] = Array.isArray(rawData)
        ? rawData
        : rawData?.file_url ?? rawData?.attachments?.flatMap((a: any) => a.file_url) ?? [];
      if (uploadedFiles.length > 0) {
        // API returns the full updated list — replace entirely to avoid duplicates
        setExistingAttachments(uploadedFiles.map((f) => ({
          id: f.id, name: f.file_name, url: f.file_url,
          uploadedBy: f.uploaded_by ?? loggedEmployeeId,
          uploadedByName: f.uploaded_by_name ?? loggedEmployeeName,
        })));
      }
    } catch { /* RTK Query handles error */ }
    finally { setAttachmentsUploading(false); }
  };
  const removeAttachment = (idx: number) =>
    setAttachments((prev) => prev.filter((_, i) => i !== idx));

  const removeExistingAttachment = (id: string) => {
    setExistingAttachments((prev) => prev.filter((f) => f.id !== id));
    setRemovedAttachmentIds((prev) => [...prev, id]);
  };

  // ─── Render ──────────────────────────────────────────────────────────────────────
  return (
    <ThemeProvider theme={theme}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, maxHeight: "90vh" } } }}
      >
        {/* ── Header ── */}
        <DialogTitle sx={{ pb: 0.5, pt: 2.5, px: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 18, color: "#0F172A" }}>
                {isEditMode ? "Edit Task" : "Create Task"}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#6B7280", mt: 0.25 }}>
                {isEditMode
                  ? "Update task details, checklist items and assignees."
                  : "Create a new task, define checklist items and assign it to one or more employees."}
              </Typography>
            </Box>
            <IconButton onClick={handleClose} size="small" sx={{ mt: -0.5 }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>

        <Divider sx={{ mx: 3, mt: 1.5 }} />

        <DialogContent sx={{ px: 3, py: 2, overflowY: "auto" }}>

          {/* ── Two-column: Section 1 + Section 2 ── */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>

            {/* ── Section 1: Task Information ── */}
            <Box>
              <SectionHeader num={1} icon={<ChecklistIcon sx={{ fontSize: 18 }} />} title="Task Information" />

              <Box sx={{ mb: 1.5 }}>
                <FieldLabel required>Task / Checklist Title</FieldLabel>
                <TextField
                  fullWidth size="small"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors((p) => ({ ...p, title: "" })); }}
                  error={!!errors.title}
                  helperText={errors.title}
                  placeholder="Enter task title"
                />
              </Box>

              <Box sx={{ mb: 1.5 }}>
                <FieldLabel>Description</FieldLabel>
                <TextField
                  fullWidth size="small" multiline rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter task description"
                />
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mb: 1.5 }}>
                <Box>
                  <FieldLabel required>Status</FieldLabel>
                  <FormControl size="small" fullWidth>
                    <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                      {["Not Started", "In Progress", "Completed"].map((s) => (
                        <MenuItem key={s} value={s}>{s}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box>
                  <FieldLabel required>Start Date</FieldLabel>
                  <TextField
                    type="date" size="small" fullWidth
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); if (errors.startDate) setErrors((p) => ({ ...p, startDate: "" })); }}
                    error={!!errors.startDate}
                    helperText={errors.startDate}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Box>
              </Box>

              <Box>
                <FieldLabel required>Due Date</FieldLabel>
                <TextField
                  type="date" size="small" fullWidth
                  value={dueDate}
                  onChange={(e) => { setDueDate(e.target.value); if (errors.dueDate) setErrors((p) => ({ ...p, dueDate: "" })); }}
                  error={!!errors.dueDate}
                  helperText={errors.dueDate}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Box>
            </Box>

            {/* ── Section 2: Assign To ── */}
            <Box>
              <SectionHeader num={2} icon={<PeopleAltOutlinedIcon sx={{ fontSize: 18 }} />} title="Assign To" />

              {/* Employee dropdown */}
              <Box sx={{ mb: 1.5 }}>
                <FieldLabel required>Select Employees</FieldLabel>
                <FormControl size="small" fullWidth error={!!errors.assignees}>
                  <Select
                    value=""
                    onChange={(e) => handleEmployeeSelect(e.target.value as string)}
                    displayEmpty
                    renderValue={() => (
                      <Typography sx={{ fontSize: 13, color: "#9CA3AF" }}>Select Employee</Typography>
                    )}
                  >
                    {employees.length === 0 ? (
                      <MenuItem disabled value="">
                        <Typography sx={{ fontSize: 12, color: "#9CA3AF" }}>No employees available</Typography>
                      </MenuItem>
                    ) : (
                      employees.map((emp: any) => {
                        const alreadySelected = selectedAssignees.some((a) => a.employee_id === emp.employee_id);
                        return (
                          <MenuItem key={emp.employee_id} value={emp.employee_id} disabled={alreadySelected}>
                            <Box>
                              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>
                                {emp.name}
                                {alreadySelected && (
                                  <Box component="span" sx={{ fontSize: 11, color: "#9CA3AF", ml: 1 }}>(added)</Box>
                                )}
                              </Typography>
                              {emp.email && (
                                <Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>{emp.email}</Typography>
                              )}
                            </Box>
                          </MenuItem>
                        );
                      })
                    )}
                  </Select>
                </FormControl>
                {errors.assignees && (
                  <Typography sx={{ fontSize: 11, color: "#E11D48", mt: 0.5 }}>{errors.assignees}</Typography>
                )}
              </Box>

              {/* Selected employees — single fixed row, max 4 chips + overflow count */}
              {selectedAssignees.length > 0 && (
                <Box sx={{ mt: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, overflow: "hidden", flexShrink: 1 }}>
                    {selectedAssignees.slice(0, 4).map((a) => {
                      const initials = (a.employee_name ?? "?").slice(0, 2).toUpperCase();
                      return (
                        <Box
                          key={a.employee_id}
                          sx={{
                            display: "flex", alignItems: "center", gap: 0.4, flexShrink: 0,
                            bgcolor: "#FEF2F2", border: "1px solid #FECACA",
                            borderRadius: 5, pl: 0.4, pr: 0.6, py: 0.25,
                          }}
                        >
                          <Box sx={{
                            width: 18, height: 18, borderRadius: "50%",
                            bgcolor: "#E11D48", display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 8, fontWeight: 700, color: "#fff", flexShrink: 0,
                          }}>
                            {initials}
                          </Box>
                          <Typography sx={{ fontSize: 10.5, fontWeight: 600, color: "#E11D48" }}>{initials}</Typography>
                          <IconButton size="small" onClick={() => removeAssignee(a.employee_id)} sx={{ p: 0, ml: 0.1 }}>
                            <CloseIcon sx={{ fontSize: 10, color: "#E11D48" }} />
                          </IconButton>
                        </Box>
                      );
                    })}
                    {selectedAssignees.length > 4 && (
                      <Box sx={{
                        flexShrink: 0, bgcolor: "#F1F5F9", border: "1px solid #E2E8F0",
                        borderRadius: 5, px: 0.75, py: 0.25,
                      }}>
                        <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: "#64748B" }}>
                          +{selectedAssignees.length - 4}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <Typography
                    sx={{ fontSize: 10.5, color: "#E11D48", fontWeight: 600, cursor: "pointer", flexShrink: 0 }}
                    onClick={() => setSelectedAssignees([])}
                  >
                    Clear All
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              {/* ── Recurring Task (moved here from Section 4) ── */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                <SectionHeader num={3} icon={<RepeatIcon sx={{ fontSize: 18 }} />} title="Recurring Task" />
                <Switch
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: "#E11D48" },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#E11D48" },
                  }}
                />
              </Box>

              <Box sx={{
                display: "flex", flexDirection: "column", gap: 1.5,
                bgcolor: !isRecurring ? "#F3F4F6" : "transparent",
                borderRadius: 2, p: !isRecurring ? 1.5 : 0,
                pointerEvents: !isRecurring ? "none" : "auto",
                opacity: !isRecurring ? 0.6 : 1,
                transition: "all 0.2s",
              }}>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                  <Box>
                    <FieldLabel>Frequency</FieldLabel>
                    <FormControl size="small" fullWidth>
                      <Select value={recurFrequency} onChange={(e) => setRecurFrequency(e.target.value)} disabled={!isRecurring} sx={{ bgcolor: !isRecurring ? "#F3F4F6" : undefined }}>
                        {["Daily", "Weekly", "Monthly"].map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box>
                    <FieldLabel>Repeat Every</FieldLabel>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <TextField
                        type="number" size="small"
                        value={recurEvery}
                        onChange={(e) => setRecurEvery(Math.max(1, parseInt(e.target.value) || 1))}
                        disabled={!isRecurring}
                        inputProps={{ min: 1, style: { width: 40, textAlign: "center", padding: "6px 4px" } }}
                        sx={{ width: 64, bgcolor: !isRecurring ? "#F3F4F6" : undefined }}
                      />
                      <Typography sx={{ fontSize: 12, color: "#6B7280" }}>Day(s)</Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                  <Box>
                    <FieldLabel>Start Date</FieldLabel>
                    <TextField
                      type="date" size="small" fullWidth
                      value={recurStart}
                      onChange={(e) => setRecurStart(e.target.value)}
                      disabled={!isRecurring}
                      slotProps={{ inputLabel: { shrink: true } }}
                      sx={{ bgcolor: !isRecurring ? "#F3F4F6" : undefined }}
                    />
                  </Box>
                  <Box>
                    <FieldLabel>Ends</FieldLabel>
                    <RadioGroup row value={recurEnds} onChange={(e) => setRecurEnds(e.target.value as any)}>
                      <FormControlLabel
                        value="Never"
                        control={<Radio size="small" disabled={!isRecurring} sx={{ color: isRecurring ? "#E11D48" : "#9CA3AF", "&.Mui-checked": { color: isRecurring ? "#E11D48" : "#9CA3AF" }, "&.Mui-disabled": { color: "#9CA3AF" }, p: 0.5 }} />}
                        label={<Typography sx={{ fontSize: 12, color: isRecurring ? "#0F172A" : "#9CA3AF" }}>Never</Typography>}
                      />
                      <FormControlLabel
                        value="On Date"
                        control={<Radio size="small" disabled={!isRecurring} sx={{ color: isRecurring ? "#E11D48" : "#9CA3AF", "&.Mui-checked": { color: isRecurring ? "#E11D48" : "#9CA3AF" }, "&.Mui-disabled": { color: "#9CA3AF" }, p: 0.5 }} />}
                        label={<Typography sx={{ fontSize: 12, color: isRecurring ? "#0F172A" : "#9CA3AF" }}>On Date</Typography>}
                      />
                    </RadioGroup>
                    {recurEnds === "On Date" ? (
                      <TextField type="date" size="small" fullWidth value={recurEndDate} onChange={(e) => setRecurEndDate(e.target.value)} disabled={!isRecurring} slotProps={{ inputLabel: { shrink: true } }} sx={{ mt: 0.5, bgcolor: !isRecurring ? "#F3F4F6" : undefined }} />
                    ) : (
                      <Button variant="outlined" size="small" disabled sx={{ mt: 0.5, fontSize: 11, borderColor: "#E5E7EB", color: "#9CA3AF", borderRadius: 1.5 }}>Select end date</Button>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 2.5 }} />

          {/* ── Section 4: Checklist Items ── */}
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
              <SectionHeader
                num={4}
                icon={<ChecklistIcon sx={{ fontSize: 18 }} />}
                title="Checklist Items"
                subtitle="Add checklist items to break down the task into smaller actionable steps."
              />
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addItem}
                size="small"
                sx={{ borderColor: "#E11D48", color: "#E11D48", fontWeight: 600, borderRadius: 2, whiteSpace: "nowrap", flexShrink: 0 }}
              >
                Add Item
              </Button>
            </Box>

            {errors.items && (
              <Typography sx={{ fontSize: 12, color: "#E11D48", mb: 1 }}>{errors.items}</Typography>
            )}

            {/* Table */}
            <Box sx={{ border: "1px solid #E5E7EB", borderRadius: 2, overflow: "hidden" }}>
              {/* Grey header row */}
              <Box sx={{
                display: "grid",
                gridTemplateColumns: "32px 40px 1fr 1fr 150px 80px",
                bgcolor: "#F3F4F6", px: 1.5, py: 1, borderBottom: "1px solid #E5E7EB",
              }}>
                <ColHead></ColHead>
                <ColHead>#</ColHead>
                <ColHead>Checklist Item *</ColHead>
                <ColHead>Description (Optional)</ColHead>
                <ColHead>Reference Files</ColHead>
                <ColHead>Action</ColHead>
              </Box>

              {/* Rows */}
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                {items.map((item, idx) => {
                  const totalFiles = item.existingFiles.length + item.files.length;
                  const isExpanded = expandedItemId === item.id;
                  return (
                    <Box key={item.id} sx={{ borderBottom: idx < items.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                      {/* Main row */}
                      <Box sx={{
                        display: "grid",
                        gridTemplateColumns: "32px 40px 1fr 1fr 150px 80px",
                        alignItems: "center",
                        px: 1.5, py: 0.75,
                        "&:hover": { bgcolor: "#FAFAFA" },
                      }}>
                        <DragIndicatorIcon sx={{ fontSize: 16, color: "#D1D5DB", cursor: "grab" }} />
                        <Typography sx={{ fontSize: 12, color: "#6B7280", textAlign: "center" }}>{idx + 1}</Typography>

                        <Box sx={{ pr: 1 }}>
                          <TextField
                            size="small" fullWidth
                            placeholder="Enter checklist item"
                            value={item.item_title}
                            onChange={(e) => {
                              updateItem(item.id, "item_title", e.target.value);
                              if (errors.items) setErrors((p) => ({ ...p, items: "" }));
                            }}
                            sx={{ "& .MuiOutlinedInput-root": { fontSize: 12 } }}
                          />
                        </Box>

                        <Box sx={{ pr: 1 }}>
                          <TextField
                            size="small" fullWidth
                            placeholder="Enter description (optional)"
                            value={item.description}
                            onChange={(e) => updateItem(item.id, "description", e.target.value)}
                            sx={{ "& .MuiOutlinedInput-root": { fontSize: 12 } }}
                          />
                        </Box>

                        {/* File count badge + expand toggle */}
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 0.75, cursor: "pointer" }}
                          onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                        >
                          <Box sx={{
                            display: "flex", alignItems: "center", gap: 0.5,
                            bgcolor: totalFiles > 0 ? "#EFF6FF" : "#F8FAFC",
                            border: `1px solid ${totalFiles > 0 ? "#BFDBFE" : "#E2E8F0"}`,
                            borderRadius: 1.5, px: 1, py: 0.4,
                          }}>
                            {uploadingItemId === item.id ? (
                              <CircularProgress size={11} sx={{ color: "#2563EB" }} />
                            ) : (
                              <AttachFileIcon sx={{ fontSize: 12, color: totalFiles > 0 ? "#2563EB" : "#94A3B8" }} />
                            )}
                            <Typography sx={{ fontSize: 11, fontWeight: 600, color: totalFiles > 0 ? "#2563EB" : "#94A3B8" }}>
                              {uploadingItemId === item.id ? "Uploading…" : `${totalFiles} ${totalFiles === 1 ? "File" : "Files"}`}
                            </Typography>
                          </Box>
                          {isExpanded
                            ? <ExpandLessIcon sx={{ fontSize: 15, color: "#6B7280" }} />
                            : <ExpandMoreIcon sx={{ fontSize: 15, color: "#6B7280" }} />}
                        </Box>

                        {/* Actions */}
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {deletingItemId === item.id ? (
                            <CircularProgress size={14} sx={{ color: "#EF4444", m: "5px" }} />
                          ) : (
                            <IconButton size="small" onClick={() => removeItem(item.id)} disabled={!!deletingItemId} sx={{ color: "#EF4444" }}>
                              <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          )}
                        </Box>
                      </Box>

                      {/* Expandable file panel */}
                      <Collapse in={isExpanded}>
                        <Box sx={{ borderTop: "1px solid #F1F5F9", bgcolor: "#FAFAFA", px: 2, py: 1.5 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.25 }}>
                            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
                              Reference Files ({totalFiles})
                            </Typography>
                            <Button
                              component="label"
                              variant="outlined"
                              size="small"
                              startIcon={uploadingItemId === item.id
                                ? <CircularProgress size={11} sx={{ color: "#E11D48" }} />
                                : <AddIcon sx={{ fontSize: 13 }} />}
                              disabled={uploadingItemId === item.id}
                              sx={{ fontSize: 11, borderColor: "#E11D48", color: "#E11D48", borderRadius: 1.5, py: 0.3, px: 1.25,
                                "&:hover": { bgcolor: "#FFF1F2" } }}
                            >
                              Upload Files
                              <input type="file" hidden multiple disabled={uploadingItemId === item.id}
                                onChange={(e) => {
                                  const picked = Array.from(e.target.files ?? []);
                                  handleItemFilesPick(item.id, picked);
                                  e.target.value = "";
                                }}
                              />
                            </Button>
                          </Box>

                          {totalFiles === 0 ? (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "#9CA3AF", justifyContent: "center", py: 1.5 }}>
                              <InsertDriveFileOutlinedIcon sx={{ fontSize: 15 }} />
                              <Typography sx={{ fontSize: 11.5 }}>No files uploaded yet</Typography>
                            </Box>
                          ) : (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                              {item.existingFiles.map((f) => (
                                <EvidenceThumb
                                  key={f.id}
                                  file={{ id: f.id, name: f.name, url: f.url, uploadedBy: f.uploadedByName }}
                                  onRemove={() => removeExistingItemFile(item.id, f.id)}
                                />
                              ))}
                              {item.files.map((f, fi) => (
                                <EvidenceThumb
                                  key={fi}
                                  file={{ id: `queued-${fi}`, name: f.name, url: URL.createObjectURL(f) }}
                                  onRemove={() => removeQueuedItemFile(item.id, fi)}
                                />
                              ))}
                            </Box>
                          )}
                        </Box>
                      </Collapse>
                    </Box>
                  );
                })}
              </Box>
            </Box>

          </Box>

          <Divider sx={{ my: 2.5 }} />

          {/* ── Section 5: Attachments (full width) ── */}
          <Box>
              <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1.5 }}>
                <SectionHeader
                  num={5}
                  icon={<AttachFileIcon sx={{ fontSize: 18 }} />}
                  title="Attachments (Optional)"
                />
                <Button
                  component="label"
                  variant="outlined"
                  size="small"
                  startIcon={attachmentsUploading ? <CircularProgress size={12} sx={{ color: "#E11D48" }} /> : <AddIcon sx={{ fontSize: 14 }} />}
                  disabled={attachmentsUploading}
                  sx={{ fontSize: 11.5, borderColor: "#E11D48", color: "#E11D48", borderRadius: 1.5, py: 0.4, px: 1.5, whiteSpace: "nowrap", flexShrink: 0,
                    "&:hover": { bgcolor: "#FFF1F2" } }}
                >
                  Upload Files
                  <input type="file" hidden multiple disabled={attachmentsUploading}
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                    ref={attachInputRef} onChange={handleAttachmentPick}
                  />
                </Button>
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 2.5 }}>
                {/* Drop zone */}
                <Box
                  component="label"
                  sx={{
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    border: "1.5px dashed #E5E7EB", borderRadius: 2, p: 2.5,
                    cursor: attachmentsUploading ? "default" : "pointer", minHeight: 150,
                    "&:hover": attachmentsUploading ? undefined : { borderColor: "#E11D48", bgcolor: "#FFF5F5" },
                  }}
                >
                  {attachmentsUploading ? (
                    <>
                      <CircularProgress size={28} sx={{ color: "#E11D48", mb: 1.5 }} />
                      <Typography sx={{ fontSize: 12, color: "#9CA3AF" }}>Uploading…</Typography>
                    </>
                  ) : (
                    <>
                      <Box sx={{ width: 44, height: 44, borderRadius: "50%", bgcolor: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", mb: 1.25 }}>
                        <UploadFileIcon sx={{ fontSize: 20, color: "#94A3B8" }} />
                      </Box>
                      <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#374151", textAlign: "center" }}>
                        Drag & drop or click to browse
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: "#9CA3AF", mt: 0.5, textAlign: "center" }}>
                        JPG, PNG, PDF, XLS, XLSX, DOC, DOCX
                      </Typography>
                    </>
                  )}
                  <input type="file" hidden multiple disabled={attachmentsUploading}
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleAttachmentPick}
                  />
                </Box>

                {/* Uploaded files */}
                <Box>
                  {(() => {
                    const totalCount = existingAttachments.length + attachments.length;
                    const catCount = (cat: Exclude<AttachFilter, "all">) => {
                      const exCount = existingAttachments.filter((f) => getFileCategory(f.name) === cat).length;
                      const newCount = attachments.filter((f) => getFileCategory(f.name) === cat).length;
                      return exCount + newCount;
                    };
                    const filterChips: { key: AttachFilter; label: string; icon: React.ReactNode }[] = [
                      { key: "all",   label: `All (${totalCount})`,           icon: <InsertDriveFileOutlinedIcon sx={{ fontSize: 11 }} /> },
                      { key: "image", label: `Images (${catCount("image")})`, icon: <ImageIcon sx={{ fontSize: 11 }} /> },
                      { key: "pdf",   label: `PDF (${catCount("pdf")})`,      icon: <PictureAsPdfOutlinedIcon sx={{ fontSize: 11 }} /> },
                      { key: "excel", label: `Excel (${catCount("excel")})`,  icon: <TableChartOutlinedIcon sx={{ fontSize: 11 }} /> },
                      { key: "word",  label: `Word (${catCount("word")})`,    icon: <DescriptionOutlinedIcon sx={{ fontSize: 11 }} /> },
                    ];
                    const filteredExisting = attachFilter === "all"
                      ? existingAttachments
                      : existingAttachments.filter((f) => getFileCategory(f.name) === attachFilter);
                    const filteredNew = attachFilter === "all"
                      ? attachments
                      : attachments.filter((f) => getFileCategory(f.name) === attachFilter);

                    return (
                      <>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                          <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
                            Uploaded Files ({totalCount})
                          </Typography>
                          <Box sx={{ display: "flex", gap: 0.4, flexWrap: "wrap" }}>
                            {filterChips.map(({ key, label, icon }) => {
                              const active = attachFilter === key;
                              return (
                                <Box key={key} onClick={() => setAttachFilter(key)} sx={{
                                  display: "flex", alignItems: "center", gap: 0.4,
                                  px: 1, py: 0.35, borderRadius: 1.5, cursor: "pointer",
                                  bgcolor: active ? "#E11D48" : "#F1F5F9",
                                  color: active ? "#fff" : "#64748B",
                                  border: `1px solid ${active ? "#E11D48" : "#E5E7EB"}`,
                                  fontSize: 10, fontWeight: 600,
                                  "&:hover": { bgcolor: active ? "#BE123C" : "#E5E7EB" },
                                  userSelect: "none",
                                }}>
                                  {icon}
                                  <Typography sx={{ fontSize: 10, fontWeight: 600, color: "inherit", lineHeight: 1 }}>{label}</Typography>
                                </Box>
                              );
                            })}
                          </Box>
                        </Box>

                        <Box sx={{ maxHeight: 210, overflowY: "auto" }}>
                          {filteredExisting.length === 0 && filteredNew.length === 0 ? (
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0.5, py: 3, color: "#9CA3AF" }}>
                              <InsertDriveFileOutlinedIcon sx={{ fontSize: 20 }} />
                              <Typography sx={{ fontSize: 12 }}>No files uploaded</Typography>
                            </Box>
                          ) : (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                              {filteredExisting.map((f) => (
                                <EvidenceThumb
                                  key={f.id}
                                  file={{ id: f.id, name: f.name, url: f.url, uploadedBy: f.uploadedByName }}
                                  onRemove={() => removeExistingAttachment(f.id)}
                                />
                              ))}
                              {filteredNew.map((f, i) => {
                                const origIdx = attachments.indexOf(f);
                                return (
                                  <EvidenceThumb
                                    key={i}
                                    file={{ id: `queued-${origIdx}`, name: f.name, url: URL.createObjectURL(f) }}
                                    onRemove={() => removeAttachment(origIdx)}
                                  />
                                );
                              })}
                            </Box>
                          )}
                        </Box>
                      </>
                    );
                  })()}
                </Box>
              </Box>
            </Box>
        </DialogContent>

        <Divider />

        {/* ── Footer ── */}
        <DialogActions sx={{ px: 3, py: 2, gap: 1.5 }}>
          <Button
            variant="outlined" onClick={handleClose} disabled={isCreating || isUpdating || isUploading || !!uploadingItemId || attachmentsUploading}
            sx={{ borderColor: "#E5E7EB", color: "#374151", px: 3 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained" onClick={handleSubmit} disabled={isCreating || isUpdating || isUploading || !!uploadingItemId || attachmentsUploading} disableElevation
            startIcon={(isCreating || isUpdating || isUploading || !!uploadingItemId || attachmentsUploading) ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : null}
            sx={{ bgcolor: "#E11D48", color: "#fff", px: 3, "&:hover": { bgcolor: "#BE123C" } }}
          >
            {isCreating ? "Creating..." : isUpdating ? "Updating..." : isUploading || !!uploadingItemId || attachmentsUploading ? "Uploading..." : isEditMode ? "Update Task" : "Create Task"}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
