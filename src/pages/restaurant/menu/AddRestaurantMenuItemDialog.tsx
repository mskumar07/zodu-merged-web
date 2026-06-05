import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  InputAdornment,
  CircularProgress,
  ListSubheader,
  Alert,
} from "@mui/material";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { getTenantContext, getAccessToken } from "@store/tenantContext";
import {
  useGstList,
  useUnitList,
  type GstOption,
  type UnitOption,
} from "@pages/MenuItemScreen/useMenuItemApi";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface EditItemData {
  menu_id: string;
  menu_name: string;
  menu_type: string;
  food_type: string | null;
  menu_category_id?: number;
  category_id?: number;
  menu_unit?: string;
  unit_id?: number | null;
  sell_price: string;
  purchase_price: string | null;
  gst_id?: number | null;
  gst_tax?: string | null;
  tax_include_or_exclude?: boolean | null;
  hsn_code?: string | null;
  menu_image?: string | null;
  menu_code?: string;
  variants?: unknown;
}

interface AddRestaurantMenuItemDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editItem?: EditItemData | null;
}

type MenuType = "Food" | "Product";
type FoodType = "Veg" | "Non-Veg" | "Egg";
type TaxType = "include" | "exclude";

interface Variant {
  id: string;
  name: string;
  price: string;
}

interface RestaurantCategory {
  id: number;
  name: string;
  type?: string;
  active: boolean;
}

interface FormState {
  menuType: MenuType;
  foodType: FoodType;
  itemCode: string;
  categoryId: string;
  menuName: string;
  menuUnit: string;
  sellPrice: string;
  purchasePrice: string;
  taxType: TaxType;
  gstTax: string;
  hsnCode: string;
  openingStock: string;
  alertStock: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "https://api.myzodu.com";
const PRIMARY = "#D21F3C";

const INITIAL_FORM: FormState = {
  menuType: "Food",
  foodType: "Veg",
  itemCode: "",
  categoryId: "",
  menuName: "",
  menuUnit: "",
  sellPrice: "",
  purchasePrice: "",
  taxType: "include",
  gstTax: "",
  hsnCode: "",
  openingStock: "",
  alertStock: "",
};

// ─── Helper Components ──────────────────────────────────────────────────────────

const FieldLabel: React.FC<{ text: string; required?: boolean }> = ({
  text,
  required,
}) => (
  <Typography
    variant="body2"
    fontWeight={600}
    mb={0.8}
    color="text.primary"
    fontSize={13}
  >
    {text}
    {required && (
      <Box component="span" sx={{ color: PRIMARY, ml: 0.3 }}>
        *
      </Box>
    )}
  </Typography>
);

// ─── Main Component ─────────────────────────────────────────────────────────────

const AddRestaurantMenuItemDialog: React.FC<
  AddRestaurantMenuItemDialogProps
> = ({ open, onClose, onSuccess, editItem }) => {
  const isEditMode = !!editItem;
  // ── State ──────────────────────────────────────────────────────────────────
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [variantDraft, setVariantDraft] = useState<Variant[]>([]);
  const [categories, setCategories] = useState<RestaurantCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [unitSearch, setUnitSearch] = useState("");
  const [gstSearch, setGstSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);

  // ── Hooks ──────────────────────────────────────────────────────────────────
  const { data: gstOptions = [], isLoading: gstLoading } = useGstList();
  const { data: unitOptions = [], isLoading: unitsLoading } = useUnitList();

  // ── Fetch categories when dialog opens ─────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const { zoduId, branchId } = getTenantContext();
    const token = getAccessToken();
    if (!zoduId || !branchId) return;

    setCategoriesLoading(true);
    axios
      .get<{ Data?: RestaurantCategory[]; data?: RestaurantCategory[] }>(
        `${API_BASE}/restaurant/get/category/${zoduId}/${branchId}`,
        {
          params: { "type[]": ["F", "P"], page: 1, limit: 100 },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      )
      .then((res) => {
        const rows = res.data?.Data ?? res.data?.data ?? [];
        setCategories(rows.filter((c) => c.active !== false));
      })
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));
  }, [open]);

  // ── Reset on close ─────────────────────────────────────────────────────────
  const handleReset = () => {
    setForm(INITIAL_FORM);
    setTouched({});
    setImagePreview(null);
    setImageUrl(null);
    setImageUploading(false);
    setVariants([]);
    setVariantDraft([]);
    setVariantModalOpen(false);
    setCategorySearch("");
    setUnitSearch("");
    setGstSearch("");
    setErrorMsg(null);
  };

  // ── Pre-fill form when editItem changes ───────────────────────────────────
  useEffect(() => {
    if (!open) return;
    if (editItem) {
      let parsedVariants: Variant[] = [];
      try {
        const raw = typeof editItem.variants === "string" ? JSON.parse(editItem.variants) : editItem.variants;
        if (Array.isArray(raw)) parsedVariants = raw;
      } catch { parsedVariants = []; }

      setForm({
        menuType:      (editItem.menu_type as MenuType) ?? "Food",
        foodType:      (editItem.food_type as FoodType) ?? "Veg",
        itemCode:      editItem.menu_code ?? "",
        categoryId:    String(editItem.category_id ?? editItem.menu_category_id ?? ""),
        menuName:      editItem.menu_name ?? "",
        menuUnit:      String(editItem.unit_id ?? ""),
        sellPrice:     editItem.sell_price ?? "",
        purchasePrice: editItem.purchase_price ?? "",
        taxType:       editItem.tax_include_or_exclude ? "include" : "exclude",
        gstTax:        String(editItem.gst_id ?? ""),
        hsnCode:       editItem.hsn_code ?? "",
        openingStock:  "",
        alertStock:    "",
      });
      setImagePreview(editItem.menu_image ?? null);
      setImageUrl(editItem.menu_image ?? null);
      setVariants(parsedVariants);
      setTouched({});
    } else {
      handleReset();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editItem]);

  const handleClose = () => {
    if (submitting) return;
    handleReset();
    onClose();
  };

  // ── Field helpers ──────────────────────────────────────────────────────────
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const touch = (key: keyof FormState) =>
    setTouched((prev) => ({ ...prev, [key]: true }));

  // ── Image handling — upload immediately on select ──────────────────────────
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUrl(null);

    // Show local preview instantly
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload to server immediately
    const token = getAccessToken();
    const formData = new FormData();
    formData.append("file", file);
    setImageUploading(true);
    try {
      const res = await axios.post<{ data: { fileUrl: string } }>(
        `${API_BASE}/restaurant/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data", ...(token ? { Authorization: `Bearer ${token}` } : {}) } }
      );
      setImageUrl(res.data.data.fileUrl);
    } catch {
      setImageUrl(null);
    } finally {
      setImageUploading(false);
    }
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = (): Partial<Record<keyof FormState, string>> => {
    const errors: Partial<Record<keyof FormState, string>> = {};
    if (!form.menuName.trim()) errors.menuName = "Menu name is required";
    if (!form.categoryId) errors.categoryId = "Category is required";
    if (!form.sellPrice || Number(form.sellPrice) <= 0)
      errors.sellPrice = "Sell price must be greater than 0";
    if (!form.menuUnit) errors.menuUnit = "Menu unit is required";
    if (!form.itemCode.trim()) errors.itemCode = "Item code is required";
    return errors;
  };

  const fieldError = (key: keyof FormState): string | undefined => {
    if (!touched[key]) return undefined;
    return validate()[key];
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    // Touch all required fields
    setTouched({
      menuName: true,
      categoryId: true,
      sellPrice: true,
      menuUnit: true,
      itemCode: true,
    });

    const errors = validate();
    if (Object.keys(errors).length > 0) return;

    const { zoduId, branchId } = getTenantContext();
    const token = getAccessToken();

    // Use the unit id directly
    const menuUnitId = form.menuUnit;

    const formData = new FormData();
    formData.append("zodu_id", zoduId ?? "");
    formData.append("branch_id", branchId ?? "");
    formData.append("menu_category_id", form.categoryId);
    formData.append("menu_name", form.menuName.trim());
    formData.append("menu_type", form.menuType);
    if (form.menuType === "Food") {
      formData.append("food_type", form.foodType);
    }
    formData.append("sell_price", form.sellPrice);
    if (form.purchasePrice) {
      formData.append("purchase_price", form.purchasePrice);
    }
    if (form.hsnCode.trim()) {
      formData.append("hsn_code", form.hsnCode.trim());
    }
    if (form.gstTax) {
      formData.append("gst_tax", form.gstTax);
    }
    formData.append(
      "tax_include_or_exclude",
      String(form.taxType === "include")
    );
    formData.append("menu_unit", menuUnitId);
    formData.append("item_code", form.itemCode.trim());
    formData.append("menu_code", form.itemCode.trim());
    if (form.menuType === "Product") {
      if (form.openingStock) {
        formData.append("opening_stock", form.openingStock);
      }
      if (form.alertStock) {
        formData.append("alert_stock", form.alertStock);
      }
    }
    formData.append("variants", variants.length > 0 ? JSON.stringify(variants) : "null");
    if (imageUrl) {
      formData.append("menu_image", imageUrl);
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const headers = { "Content-Type": "multipart/form-data", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      if (isEditMode && editItem) {
        await axios.put(
          `${API_BASE}/restaurant/api/menu/update/menu_item/${editItem.menu_id}`,
          formData,
          { headers }
        );
      } else {
        await axios.post(
          `${API_BASE}/restaurant/api/menu/api/add/menu_item`,
          formData,
          { headers }
        );
      }
      handleReset();
      onClose();
      onSuccess?.();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? err.message
        : "Failed to add menu item. Please try again.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Filtered dropdown options ──────────────────────────────────────────────
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(categorySearch.trim().toLowerCase())
  );

  const filteredUnits = unitOptions.filter(
    (u: UnitOption) =>
      u.label.toLowerCase().includes(unitSearch.trim().toLowerCase()) ||
      u.shortName.toLowerCase().includes(unitSearch.trim().toLowerCase())
  );

  const filteredGstOptions = gstOptions.filter(
    (g: GstOption) =>
      g.label.toLowerCase().includes(gstSearch.trim().toLowerCase()) ||
      String(g.percentage).includes(gstSearch.trim())
  );

  // ── Shared sx ─────────────────────────────────────────────────────────────
  const inputSx = { borderRadius: 1, fontSize: 14 };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1.5,
          boxShadow: "0 32px 80px rgba(0,0,0,0.22)",
          maxHeight: "92vh",
        },
      }}
      BackdropProps={{
        sx: {
          bgcolor: "rgba(15,23,42,0.65)",
          backdropFilter: "blur(3px)",
        },
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            py: 2.5,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                bgcolor: "rgba(210,31,60,0.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AddCircleIcon sx={{ color: PRIMARY, fontSize: 22 }} />
            </Box>
            <Box>
              <Typography
                fontWeight={800}
                fontSize={18}
                lineHeight={1.2}
                letterSpacing="-0.3px"
              >
                {isEditMode ? "Edit Menu Item" : "Add Menu Item"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {isEditMode ? "Update the details of this menu item" : "Create a new food or product for your restaurant menu"}
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={handleClose}
            disabled={submitting}
            sx={{
              color: "text.disabled",
              borderRadius: 2,
              "&:hover": { color: "text.secondary", bgcolor: "action.hover" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <DialogContent
        sx={{
          px: 3,
          py: 3,
          overflowY: "auto",
          "&::-webkit-scrollbar": { width: 5 },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "divider",
            borderRadius: 10,
          },
        }}
      >
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 1.5 }}>
            {errorMsg}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

          {/* ── Row 1: Image + Menu Type toggle + Food Type ─────────────── */}
          <Box sx={{ display: "flex", gap: 2.5, alignItems: "flex-start" }}>

            {/* Image upload */}
            <Box sx={{ flexShrink: 0 }}>
              <FieldLabel text="Menu Image" />
              <Box
                onClick={() => imageInputRef.current?.click()}
                sx={{
                  width: 110, height: 110,
                  borderRadius: 1.5,
                  border: "2px dashed",
                  borderColor: imagePreview ? PRIMARY : "divider",
                  bgcolor: "action.hover",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  cursor: "pointer", overflow: "hidden", transition: "all 0.2s",
                  position: "relative",
                  "&:hover": { borderColor: PRIMARY },
                }}
              >
                {imagePreview && !imageUploading && (
                  <Box
                    component="img"
                    src={imagePreview}
                    alt="Menu"
                    sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  />
                )}
                {imageUploading && (
                  <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(255,255,255,0.7)", borderRadius: 1.5, zIndex: 2 }}>
                    <CircularProgress size={22} sx={{ color: PRIMARY }} />
                  </Box>
                )}
                {!imagePreview && !imageUploading && (
                  <>
                    <AddAPhotoIcon sx={{ color: "text.disabled", fontSize: 26, mb: 0.5 }} />
                    <Typography variant="caption" color="text.disabled" fontWeight={500} fontSize={11}>
                      Click to upload
                    </Typography>
                  </>
                )}
                {imagePreview && imageUrl && (
                  <Box sx={{ position: "absolute", bottom: 4, right: 4, bgcolor: "#16a34a", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
                    <Typography sx={{ color: "#fff", fontSize: 11, fontWeight: 800, lineHeight: 1 }}>✓</Typography>
                  </Box>
                )}
              </Box>
              <input ref={imageInputRef} type="file" accept="image/*" hidden onChange={handleImageChange} />
            </Box>

            {/* Menu Type + Food Type — same row */}
            <Box sx={{ flex: 1, display: "flex", flexDirection: "row", gap: 4, alignItems: "flex-end", flexWrap: "wrap" }}>
              <Box>
                <FieldLabel text="Menu Type" required />
                <ToggleButtonGroup
                  value={form.menuType}
                  exclusive
                  onChange={(_e, val) => { if (val) set("menuType", val as MenuType); }}
                  size="small"
                  sx={{ "& .MuiToggleButton-root": { textTransform: "none", fontWeight: 700, fontSize: 13, px: 3, py: 0.8, borderColor: "#E2E8F0", color: "#64748B", "&.Mui-selected": { bgcolor: PRIMARY, color: "#fff", borderColor: PRIMARY, "&:hover": { bgcolor: "#b71c34" } }, "&:hover": { bgcolor: "rgba(210,31,60,0.06)" } } }}
                >
                  <ToggleButton value="Food">Food</ToggleButton>
                  <ToggleButton value="Product">Product</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {form.menuType === "Food" && (
                <Box>
                  <FieldLabel text="Food Type" />
                  <ToggleButtonGroup
                    value={form.foodType}
                    exclusive
                    onChange={(_e, val) => { if (val) set("foodType", val as FoodType); }}
                    size="small"
                    sx={{ "& .MuiToggleButton-root": { textTransform: "none", fontWeight: 700, fontSize: 13, px: 3, py: 0.8, borderColor: "#E2E8F0", color: "#64748B", "&.Mui-selected": { bgcolor: PRIMARY, color: "#fff", borderColor: PRIMARY, "&:hover": { bgcolor: "#b71c34" } }, "&:hover": { bgcolor: "rgba(210,31,60,0.06)" } } }}
                  >
                    <ToggleButton value="Veg">Veg</ToggleButton>
                    <ToggleButton value="Non-Veg">Non-Veg</ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              )}
            </Box>
          </Box>

          {/* ── Row 2: Item Code + Category ──────────────────────────────── */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Box>
              <FieldLabel text="Item Code" required />
              <TextField
                fullWidth size="small" placeholder="e.g. MENU-001"
                value={form.itemCode}
                onChange={(e) => set("itemCode", e.target.value)}
                onBlur={() => touch("itemCode")}
                error={Boolean(fieldError("itemCode"))}
                helperText={fieldError("itemCode")}
                InputProps={{ sx: inputSx, endAdornment: <InputAdornment position="end"><QrCode2Icon sx={{ color: "text.disabled", fontSize: 18 }} /></InputAdornment> }}
              />
            </Box>
            <Box>
              <FieldLabel text="Category" required />
              <FormControl fullWidth size="small" error={Boolean(fieldError("categoryId"))}>
                <Select
                  value={form.categoryId} displayEmpty
                  onChange={(e) => set("categoryId", e.target.value)}
                  onOpen={() => setCategorySearch("")}
                  onClose={() => touch("categoryId")}
                  renderValue={(selected) => {
                    if (!selected) return <Box component="span" sx={{ color: "text.disabled" }}>{categoriesLoading ? "Loading…" : "Select Category"}</Box>;
                    return categories.find((c) => String(c.id) === selected)?.name ?? selected;
                  }}
                  startAdornment={categoriesLoading ? <InputAdornment position="start"><CircularProgress size={14} /></InputAdornment> : null}
                  MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                  sx={inputSx}
                >
                  <ListSubheader sx={{ bgcolor: "#fff", py: 1, px: 1, borderBottom: "1px solid", borderColor: "divider" }} onKeyDown={(e) => e.stopPropagation()}>
                    <TextField size="small" fullWidth placeholder="Search category..." value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)} onClick={(e) => e.stopPropagation()}
                      InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: "text.disabled" }} /></InputAdornment> }} />
                  </ListSubheader>
                  <MenuItem value="" disabled sx={{ fontSize: 14, color: "text.disabled" }}>Select Category</MenuItem>
                  {filteredCategories.map((c) => <MenuItem key={c.id} value={String(c.id)} sx={{ fontSize: 14 }}>{c.name}</MenuItem>)}
                  {filteredCategories.length === 0 && !categoriesLoading && <MenuItem disabled sx={{ fontSize: 13, color: "text.disabled" }}>No categories found</MenuItem>}
                </Select>
                {fieldError("categoryId") && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>{fieldError("categoryId")}</Typography>}
              </FormControl>
            </Box>
          </Box>

          {/* ── Row 3: Menu Name + Menu Unit ─────────────────────────────── */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Box>
              <FieldLabel text="Menu Name" required />
              <TextField fullWidth size="small" placeholder="e.g. Chicken Biryani"
                value={form.menuName} onChange={(e) => set("menuName", e.target.value)}
                onBlur={() => touch("menuName")} error={Boolean(fieldError("menuName"))}
                helperText={fieldError("menuName")} InputProps={{ sx: inputSx }} />
            </Box>
            <Box>
              <FieldLabel text="Menu Unit" required />
              <FormControl fullWidth size="small" error={Boolean(fieldError("menuUnit"))}>
                <Select
                  value={form.menuUnit} displayEmpty
                  onChange={(e) => set("menuUnit", e.target.value)}
                  onOpen={() => setUnitSearch("")} onClose={() => touch("menuUnit")}
                  renderValue={(v) => {
                    if (!v) return <Box component="span" sx={{ color: "text.disabled" }}>{unitsLoading ? "Loading…" : "Select Unit"}</Box>;
                    return unitOptions.find((u: UnitOption) => String(u.value) === v)?.label ?? v;
                  }}
                  startAdornment={unitsLoading ? <InputAdornment position="start"><CircularProgress size={14} /></InputAdornment> : null}
                  MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                  sx={inputSx}
                >
                  <ListSubheader sx={{ bgcolor: "#fff", py: 1, px: 1, borderBottom: "1px solid", borderColor: "divider" }} onKeyDown={(e) => e.stopPropagation()}>
                    <TextField size="small" fullWidth placeholder="Search unit..." value={unitSearch}
                      onChange={(e) => setUnitSearch(e.target.value)} onClick={(e) => e.stopPropagation()}
                      InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: "text.disabled" }} /></InputAdornment> }} />
                  </ListSubheader>
                  <MenuItem value="" disabled sx={{ fontSize: 14, color: "text.disabled" }}>Select Unit</MenuItem>
                  {filteredUnits.map((u: UnitOption) => <MenuItem key={u.value} value={String(u.value)} sx={{ fontSize: 14 }}>{u.label}</MenuItem>)}
                </Select>
                {fieldError("menuUnit") && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>{fieldError("menuUnit")}</Typography>}
              </FormControl>
            </Box>
          </Box>

          {/* ── Row 4: Sell Price + Base/Purchase Price ───────────────────── */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Box>
              <FieldLabel text="Sell Price" required />
              <TextField fullWidth size="small" type="number" placeholder="0.00"
                value={form.sellPrice} onChange={(e) => set("sellPrice", e.target.value)}
                onBlur={() => touch("sellPrice")} error={Boolean(fieldError("sellPrice"))}
                helperText={fieldError("sellPrice")}
                InputProps={{ sx: inputSx, startAdornment: <InputAdornment position="start"><Typography variant="body2" fontWeight={700} sx={{ color: PRIMARY }}>₹</Typography></InputAdornment> }} />
            </Box>
            <Box>
              <FieldLabel text={form.menuType === "Food" ? "Base Price" : "Purchase Price"} />
              <TextField fullWidth size="small" type="number" placeholder="0.00"
                value={form.purchasePrice} onChange={(e) => set("purchasePrice", e.target.value)}
                InputProps={{ sx: inputSx, startAdornment: <InputAdornment position="start"><Typography variant="body2" fontWeight={600} color="text.disabled">₹</Typography></InputAdornment> }} />
            </Box>
          </Box>

          {/* ── Variants button — Food only ──────────────────────────────────── */}
          {form.menuType === "Food" ? (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>Variants</Typography>
                {variants.length > 0 && (
                  <Box sx={{ px: 1, py: 0.2, bgcolor: PRIMARY, borderRadius: 5 }}>
                    <Typography sx={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>{variants.length}</Typography>
                  </Box>
                )}
              </Box>
              <Button
                size="small"
                startIcon={<AddCircleIcon sx={{ fontSize: 15 }} />}
                onClick={() => {
                  const draft = variants.length > 0 ? variants.map(v => ({ ...v })) : [{ id: String(Date.now()), name: "", price: "" }];
                  setVariantDraft(draft);
                  setVariantModalOpen(true);
                }}
                sx={{ fontSize: 12, fontWeight: 700, color: PRIMARY, bgcolor: "rgba(210,31,60,0.07)", px: 1.5, py: 0.6, borderRadius: 1.5, textTransform: "none", "&:hover": { bgcolor: "rgba(210,31,60,0.14)" } }}
              >
                {variants.length > 0 ? "Edit Variants" : "Add Variants"}
              </Button>
            </Box>
          ) : null}

          {/* ── Tax Section ──────────────────────────────────────────────────── */}
          <Box
            sx={{
              bgcolor: "action.hover",
              borderRadius: 1.5,
              p: 2.5,
            }}
          >
            <Typography
              variant="body2"
              fontWeight={700}
              color="text.secondary"
              textTransform="uppercase"
              letterSpacing="0.06em"
              fontSize={11}
              mb={2}
            >
              Tax Information
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 2.5,
              }}
            >
              {/* Tax Inclusion Toggle */}
              <Box>
                <FieldLabel text="Tax Type" />
                <ToggleButtonGroup
                  value={form.taxType}
                  exclusive
                  onChange={(_e, val) => { if (val) set("taxType", val as TaxType); }}
                  size="small"
                  sx={{ "& .MuiToggleButton-root": { textTransform: "none", fontWeight: 700, fontSize: 13, px: 3, py: 0.8, borderColor: "#E2E8F0", color: "#64748B", "&.Mui-selected": { bgcolor: PRIMARY, color: "#fff", borderColor: PRIMARY, "&:hover": { bgcolor: "#b71c34" } }, "&:hover": { bgcolor: "rgba(210,31,60,0.06)" } } }}
                >
                  <ToggleButton value="include">Include Tax</ToggleButton>
                  <ToggleButton value="exclude">Exclude Tax</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Tax Rate Dropdown */}
              <Box>
                <FieldLabel text="Tax Rate (GST)" />
                <FormControl fullWidth size="small">
                  <Select
                    value={form.gstTax}
                    displayEmpty
                    onChange={(e) => set("gstTax", e.target.value)}
                    onOpen={() => setGstSearch("")}
                    renderValue={(v) => {
                      if (!v)
                        return (
                          <Box component="span" sx={{ color: "text.disabled" }}>
                            {gstLoading ? "Loading…" : "Select Tax Rate"}
                          </Box>
                        );
                      return (
                        gstOptions.find(
                          (g: GstOption) => String(g.value) === v
                        )?.label ?? v
                      );
                    }}
                    startAdornment={
                      gstLoading ? (
                        <InputAdornment position="start">
                          <CircularProgress size={14} />
                        </InputAdornment>
                      ) : null
                    }
                    MenuProps={{
                      PaperProps: { sx: { maxHeight: 300 } },
                    }}
                    sx={{ ...inputSx, bgcolor: "background.paper" }}
                  >
                    <ListSubheader
                      sx={{
                        bgcolor: "#fff",
                        py: 1,
                        px: 1,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                      }}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <TextField
                        size="small"
                        fullWidth
                        placeholder="Search tax..."
                        value={gstSearch}
                        onChange={(e) => setGstSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon
                                sx={{ fontSize: 16, color: "text.disabled" }}
                              />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </ListSubheader>
                    <MenuItem
                      value=""
                      sx={{ fontSize: 14, color: "text.disabled" }}
                    >
                      None
                    </MenuItem>
                    {filteredGstOptions.map((g: GstOption) => (
                      <MenuItem
                        key={g.value}
                        value={String(g.value)}
                        sx={{ fontSize: 14 }}
                      >
                        {g.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Box>

          {/* ── HSN Code ────────────────────────────────────────────────────── */}
          <Box>
            <FieldLabel text="HSN Code" />
            <TextField
              fullWidth
              size="small"
              placeholder="Enter HSN/SAC code"
              value={form.hsnCode}
              onChange={(e) => set("hsnCode", e.target.value)}
              InputProps={{ sx: inputSx }}
            />
          </Box>

          {/* ── Stock fields (Product only) ─────────────────────────────────── */}
          {form.menuType === "Product" && (
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1.5,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  px: 2.5,
                  py: 1.5,
                  bgcolor: "action.hover",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={700}
                  color="text.secondary"
                  textTransform="uppercase"
                  letterSpacing="0.06em"
                  fontSize={11}
                >
                  Stock Information
                </Typography>
                <Box
                  sx={{
                    ml: 1,
                    px: 1,
                    py: 0.2,
                    bgcolor: "action.selected",
                    borderRadius: 5,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: "text.secondary",
                      letterSpacing: "0.04em",
                    }}
                  >
                    OPTIONAL
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  px: 2.5,
                  py: 2.5,
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 2.5,
                }}
              >
                <Box>
                  <FieldLabel text="Opening Stock" />
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    placeholder="0"
                    value={form.openingStock}
                    onChange={(e) => set("openingStock", e.target.value)}
                    InputProps={{
                      sx: inputSx,
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography
                            variant="caption"
                            color="text.disabled"
                            fontWeight={600}
                          >
                            {unitOptions.find(
                              (u: UnitOption) =>
                                String(u.value) === form.menuUnit
                            )?.shortName ?? "UNIT"}
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, display: "block" }}
                  >
                    Current stock quantity at the time of adding this item
                  </Typography>
                </Box>
                <Box>
                  <FieldLabel text="Alert Stock" />
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    placeholder="e.g. 10"
                    value={form.alertStock}
                    onChange={(e) => set("alertStock", e.target.value)}
                    InputProps={{
                      sx: inputSx,
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography
                            variant="caption"
                            color="text.disabled"
                            fontWeight={600}
                          >
                            {unitOptions.find(
                              (u: UnitOption) =>
                                String(u.value) === form.menuUnit
                            )?.shortName ?? "UNIT"}
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, display: "block" }}
                  >
                    Alert when stock falls below this quantity
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <DialogActions
        sx={{
          px: 3,
          py: 2.5,
          borderTop: "1px solid",
          borderColor: "divider",
          gap: 1.5,
          justifyContent: "flex-end",
        }}
      >
        <Button
          onClick={handleClose}
          variant="outlined"
          disabled={submitting}
          sx={{
            borderRadius: 1,
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            height: 42,
            borderColor: "divider",
            color: "text.secondary",
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting}
          startIcon={
            submitting ? (
              <CircularProgress size={16} color="inherit" />
            ) : undefined
          }
          sx={{
            borderRadius: 1,
            textTransform: "none",
            fontWeight: 700,
            px: 4,
            height: 42,
            bgcolor: PRIMARY,
            boxShadow: "0 4px 14px rgba(210,31,60,0.25)",
            "&:hover": { bgcolor: "#b71c34" },
            "&:active": { transform: "scale(0.98)" },
            "&.Mui-disabled": { bgcolor: "rgba(210,31,60,0.4)", color: "#fff" },
          }}
        >
          {submitting ? (isEditMode ? "Updating…" : "Adding…") : (isEditMode ? "Update Menu" : "Add Menu")}
        </Button>
      </DialogActions>

      {/* ── Variant Modal ─────────────────────────────────────────────────── */}
      <Dialog open={variantModalOpen} onClose={() => setVariantModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, fontSize: 16, borderBottom: "1px solid #F1F5F9", pb: 1.5 }}>
          Variants
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
          {variantDraft.map((v, i) => (
            <Box key={v.id} sx={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 1.5, alignItems: "center" }}>
              <TextField
                size="small" placeholder="Variant Name" value={v.name}
                onChange={(e) => setVariantDraft(prev => prev.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1, fontSize: 13 } }}
              />
              <TextField
                size="small" placeholder="Price" type="number" value={v.price}
                onChange={(e) => setVariantDraft(prev => prev.map((x, idx) => idx === i ? { ...x, price: e.target.value } : x))}
                InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{ fontSize: 13, color: PRIMARY, fontWeight: 700 }}>₹</Typography></InputAdornment> }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1, fontSize: 13 } }}
              />
              <IconButton size="small" onClick={() => setVariantDraft(prev => prev.filter((_, idx) => idx !== i))}
                sx={{ color: "#EF4444", "&:hover": { bgcolor: "#FEF2F2" }, borderRadius: 1 }}>
                <DeleteOutlineIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          ))}
          <Button
            size="small" variant="outlined"
            onClick={() => setVariantDraft(prev => [...prev, { id: String(Date.now()), name: "", price: "" }])}
            sx={{ alignSelf: "flex-start", textTransform: "none", fontWeight: 700, fontSize: 13, borderColor: PRIMARY, color: PRIMARY, borderRadius: 1.5, px: 2, "&:hover": { bgcolor: "rgba(210,31,60,0.06)", borderColor: PRIMARY } }}
          >
            + Add Variant
          </Button>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #F1F5F9", gap: 1.5 }}>
          <Button onClick={() => setVariantModalOpen(false)} sx={{ textTransform: "none", fontWeight: 600, color: "#374151" }}>Cancel</Button>
          <Button
            variant="contained" disableElevation
            onClick={() => { setVariants(variantDraft.filter(v => v.name.trim())); setVariantModalOpen(false); }}
            sx={{ textTransform: "none", fontWeight: 700, bgcolor: PRIMARY, borderRadius: 1.5, px: 3, "&:hover": { bgcolor: "#b71c34" } }}
          >
            Save Variants
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default AddRestaurantMenuItemDialog;
