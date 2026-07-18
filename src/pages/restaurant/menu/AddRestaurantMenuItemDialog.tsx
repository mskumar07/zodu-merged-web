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
  MenuItem,
  InputAdornment,
  CircularProgress,
  Autocomplete,
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
import SuccessToast from "@components/Common/SuccessToast";
import { getTenantContext, getAccessToken } from "@store/tenantContext";
import {
  useGstList,
  useUnitList,
  type GstOption,
  type UnitOption,
} from "@pages/MenuItemScreen/useMenuItemApi";
import { sanitizeAmountInput } from "@pages/MenuItemScreen/ItemValidation";

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
  opening_stock?: string | number | null;
  alert_stock?: string | number | null;
  stock_qty?: string | number | null;
  stock_alert?: string | number | null;
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

const ITEM_ID_MAX_LENGTH   = 35;
const ITEM_NAME_MAX_LENGTH = 200;
const HSN_CODE_MAX_LENGTH  = 20;
const MAX_AMOUNT           = 99999999999.99;

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
  const originalMenuType = editItem?.menu_type ?? null;
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
  const [submitting, setSubmitting] = useState(false);
  const [imageDeleting, setImageDeleting] = useState(false);
  const [itemCodeChecking, setItemCodeChecking] = useState(false);
  const [itemCodeExistsError, setItemCodeExistsError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  const [toastSeverity, setToastSeverity] = useState<"success" | "error">("error");

  const imageInputRef = useRef<HTMLInputElement>(null);
  const categoryByType = useRef<Partial<Record<MenuType, string>>>({});
  const foodVariants = useRef<Variant[]>([]);

  // ── Hooks ──────────────────────────────────────────────────────────────────
  const { data: gstOptions = [], isLoading: gstLoading } = useGstList();
  const { data: unitOptions = [], isLoading: unitsLoading } = useUnitList();

  // ── Fetch categories when dialog opens or Menu Type changes ────────────────
  useEffect(() => {
    if (!open) return;
    const { zoduId, branchId } = getTenantContext();
    const token = getAccessToken();
    if (!zoduId || !branchId) return;

    const typeParam = form.menuType === "Product" ? "P" : "F";

    setCategoriesLoading(true);
    axios
      .get<{ Data?: RestaurantCategory[]; data?: RestaurantCategory[] }>(
        `${API_BASE}/restaurant/get/category/${zoduId}/${branchId}`,
        {
          params: { "type[]": [typeParam], page: 1, limit: 100 },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      )
      .then((res) => {
        const rows = res.data?.Data ?? res.data?.data ?? [];
        setCategories(rows.filter((c) => c.active !== false));
      })
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));
  }, [open, form.menuType]);

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
    setItemCodeChecking(false);
    setItemCodeExistsError(null);
  };

  // ── Pre-fill form when editItem changes ───────────────────────────────────
  useEffect(() => {
    if (!open) return;
    categoryByType.current = {};
    foodVariants.current = [];
    if (editItem) {
      let parsedVariants: Variant[] = [];
      try {
        const raw = typeof editItem.variants === "string" ? JSON.parse(editItem.variants) : editItem.variants;
        if (Array.isArray(raw)) parsedVariants = raw;
      } catch { parsedVariants = []; }

      const editMenuType = (editItem.menu_type as MenuType) ?? "Food";
      const editCategoryId = String(editItem.category_id ?? editItem.menu_category_id ?? "");
      categoryByType.current[editMenuType] = editCategoryId;
      if (editMenuType === "Food") foodVariants.current = parsedVariants;

      setForm({
        menuType:      editMenuType,
        foodType:      (editItem.food_type as FoodType) ?? "Veg",
        itemCode:      editItem.menu_code ?? "",
        categoryId:    editCategoryId,
        menuName:      editItem.menu_name ?? "",
        menuUnit:      String(editItem.unit_id ?? ""),
        sellPrice:     editItem.sell_price ?? "",
        purchasePrice: editItem.purchase_price ?? "",
        taxType:       editItem.tax_include_or_exclude ? "include" : "exclude",
        gstTax:        String(editItem.gst_id ?? ""),
        hsnCode:       editItem.hsn_code ?? "",
        openingStock:  editItem.stock_qty != null ? String(Number(editItem.stock_qty)) : (editItem.opening_stock != null ? String(Number(editItem.opening_stock)) : ""),
        alertStock:    editItem.stock_alert != null ? String(Number(editItem.stock_alert)) : (editItem.alert_stock != null ? String(Number(editItem.alert_stock)) : ""),
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

  const setAmount = (key: "sellPrice" | "purchasePrice" | "openingStock" | "alertStock") =>
    (e: React.ChangeEvent<HTMLInputElement>) => set(key, sanitizeAmountInput(e.target.value));

  // ── Item code existence check on blur ─────────────────────────────────────
  const checkItemCodeExists = async () => {
    touch("itemCode");
    const code = form.itemCode.trim();
    if (!code) return;
    // In edit mode skip check if code hasn't changed
    if (isEditMode && editItem && editItem.menu_code === code) return;

    const { zoduId, branchId } = getTenantContext();
    const token = getAccessToken();
    if (!zoduId || !branchId) return;

    setItemCodeChecking(true);
    setItemCodeExistsError(null);
    try {
      const res = await axios.get<{ success: boolean; exists: boolean }>(
        `${API_BASE}/restaurant/api/menu/check/item_id`,
        {
          params: { zodu_id: zoduId, branch_id: branchId, item_id: code },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (res.data?.exists) {
        setItemCodeExistsError("Entered Item Code Already Exists");
      }
    } catch {
      // silently ignore network errors for this check
    } finally {
      setItemCodeChecking(false);
    }
  };

  // ── Image handling — upload immediately on select ──────────────────────────
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setToastSeverity("error");
      setToastMsg("Please select a valid image file (JPG, PNG, GIF, etc.)");
      e.target.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setToastSeverity("error");
      setToastMsg("Image size should be below 2MB");
      e.target.value = "";
      return;
    }
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

  // ── Remove image — calls delete API then clears state ─────────────────────
  const handleRemoveImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!imageUrl || imageDeleting) return;

    const token = getAccessToken();
    // Extract filename from URL (last path segment)
    const fileName = imageUrl.split("/").pop();
    if (!fileName) {
      setImagePreview(null);
      setImageUrl(null);
      return;
    }

    setImageDeleting(true);
    try {
      await axios.delete(`${API_BASE}/restaurant/delete/file/${fileName}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch {
      // ignore delete errors — clear locally regardless
    } finally {
      setImageDeleting(false);
      setImagePreview(null);
      setImageUrl(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = (): Partial<Record<keyof FormState, string>> => {
    const errors: Partial<Record<keyof FormState, string>> = {};
    if (!form.menuName.trim()) errors.menuName = "Menu name is required";
    else if (form.menuName.trim().length > ITEM_NAME_MAX_LENGTH)
      errors.menuName = `Menu name cannot exceed ${ITEM_NAME_MAX_LENGTH} characters`;
    if (!form.categoryId) errors.categoryId = "Category is required";
    if (!form.sellPrice || Number(form.sellPrice) <= 0)
      errors.sellPrice = "Sell price must be greater than 0";
    else if (Number(form.sellPrice) > MAX_AMOUNT)
      errors.sellPrice = `Sell price cannot exceed ${MAX_AMOUNT.toLocaleString("en-IN")}`;
    if (form.purchasePrice && Number(form.purchasePrice) > MAX_AMOUNT)
      errors.purchasePrice = `Purchase price cannot exceed ${MAX_AMOUNT.toLocaleString("en-IN")}`;
    if (form.openingStock && Number(form.openingStock) > MAX_AMOUNT)
      errors.openingStock = `Opening stock cannot exceed ${MAX_AMOUNT.toLocaleString("en-IN")}`;
    if (form.alertStock && Number(form.alertStock) > MAX_AMOUNT)
      errors.alertStock = `Low stock alert cannot exceed ${MAX_AMOUNT.toLocaleString("en-IN")}`;
    if (!form.menuUnit) errors.menuUnit = "Menu unit is required";
    if (!form.itemCode.trim()) errors.itemCode = "Item code is required";
    else if (form.itemCode.trim().length > ITEM_ID_MAX_LENGTH)
      errors.itemCode = `Item code cannot exceed ${ITEM_ID_MAX_LENGTH} characters`;
    if (form.hsnCode.trim().length > HSN_CODE_MAX_LENGTH)
      errors.hsnCode = `HSN code cannot exceed ${HSN_CODE_MAX_LENGTH} characters`;
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
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      setToastSeverity("error");
      setToastMsg(firstError ?? "Please fill all required fields");
      return;
    }
    if (itemCodeExistsError) {
      setToastSeverity("error");
      setToastMsg(itemCodeExistsError);
      return;
    }

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
        formData.append("opening_stock", String(Number(form.openingStock)));
      }
      if (form.alertStock) {
        formData.append("alert_stock", String(Number(form.alertStock)));
      }
    }
    formData.append("variants", variants.length > 0 ? JSON.stringify(variants) : "null");
    if (imageUrl) {
      formData.append("menu_image", imageUrl);
    }

    setSubmitting(true);
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
      setToastSeverity("error");
      setToastMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Shared sx ─────────────────────────────────────────────────────────────
  const inputSx = { borderRadius: 1, fontSize: 14 };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
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
          overflowY: "scroll",
          scrollbarWidth: "auto",
          scrollbarColor: (theme) => `${theme.palette.text.disabled} ${theme.palette.action.hover}`,
          "&::-webkit-scrollbar": { width: 10 },
          "&::-webkit-scrollbar-track": { bgcolor: "action.hover" },
          "&::-webkit-scrollbar-thumb": { bgcolor: "text.disabled", borderRadius: 10, border: "2px solid transparent", backgroundClip: "padding-box" },
          "&::-webkit-scrollbar-thumb:hover": { bgcolor: "text.secondary" },
        }}
      >
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
                  <>
                    <Box sx={{ position: "absolute", bottom: 4, right: 4, bgcolor: "#16a34a", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
                      <Typography sx={{ color: "#fff", fontSize: 11, fontWeight: 800, lineHeight: 1 }}>✓</Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={handleRemoveImage}
                      disabled={imageDeleting}
                      sx={{ position: "absolute", top: 2, right: 2, bgcolor: "rgba(0,0,0,0.55)", color: "#fff", width: 20, height: 20, zIndex: 3, "&:hover": { bgcolor: "rgba(210,31,60,0.85)" }, p: 0 }}
                    >
                      {imageDeleting ? <CircularProgress size={11} sx={{ color: "#fff" }} /> : <CloseIcon sx={{ fontSize: 13 }} />}
                    </IconButton>
                  </>
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
                  onChange={(_e, val) => {
                    if (val && val !== form.menuType) {
                      categoryByType.current[form.menuType] = form.categoryId;
                      set("menuType", val as MenuType);
                      set("categoryId", categoryByType.current[val as MenuType] ?? "");
                      if (val === "Product") {
                        foodVariants.current = variants;
                        setVariants([]);
                      } else {
                        setVariants(foodVariants.current);
                      }
                    }
                  }}
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
                onChange={(e) => {
                  set("itemCode", e.target.value);
                  setItemCodeExistsError(null);
                }}
                onBlur={checkItemCodeExists}
                error={Boolean(fieldError("itemCode")) || Boolean(itemCodeExistsError)}
                helperText={fieldError("itemCode") || itemCodeExistsError || undefined}
                inputProps={{ maxLength: ITEM_ID_MAX_LENGTH }}
                InputProps={{
                  sx: inputSx,
                  endAdornment: (
                    <InputAdornment position="end">
                      {itemCodeChecking
                        ? <CircularProgress size={14} sx={{ color: "text.disabled" }} />
                        : <QrCode2Icon sx={{ color: "text.disabled", fontSize: 18 }} />
                      }
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box>
              <FieldLabel text="Category" required />
              <FormControl fullWidth size="small" error={Boolean(fieldError("categoryId"))}>
                <Autocomplete
                  options={categories}
                  getOptionLabel={(c) => c.name}
                  isOptionEqualToValue={(a, b) => a.id === b.id}
                  value={categories.find((c) => String(c.id) === form.categoryId) ?? null}
                  onChange={(_e, newValue) => set("categoryId", newValue ? String(newValue.id) : "")}
                  onClose={() => touch("categoryId")}
                  loading={categoriesLoading}
                  noOptionsText="No categories found"
                  ListboxProps={{ sx: { maxHeight: 300 } }}
                  renderOption={(props, option) => (
                    <MenuItem {...props} key={option.id} sx={{ fontSize: 14 }}>{option.name}</MenuItem>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      placeholder="Select Category"
                      sx={inputSx}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: "text.disabled" }} /></InputAdornment>
                            {params.InputProps.startAdornment}
                          </>
                        ),
                        endAdornment: (
                          <>
                            {categoriesLoading ? <CircularProgress size={14} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
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
                helperText={fieldError("menuName")}
                inputProps={{ maxLength: ITEM_NAME_MAX_LENGTH }}
                InputProps={{ sx: inputSx }} />
            </Box>
            <Box>
              <FieldLabel text="Menu Unit" required />
              <FormControl fullWidth size="small" error={Boolean(fieldError("menuUnit"))}>
                <Autocomplete
                  options={unitOptions}
                  getOptionLabel={(u) => u.label}
                  isOptionEqualToValue={(a, b) => String(a.value) === String(b.value)}
                  value={unitOptions.find((u: UnitOption) => String(u.value) === form.menuUnit) ?? null}
                  onChange={(_e, newValue) => set("menuUnit", newValue ? String(newValue.value) : "")}
                  onClose={() => touch("menuUnit")}
                  loading={unitsLoading}
                  noOptionsText="No units found"
                  ListboxProps={{ sx: { maxHeight: 300 } }}
                  renderOption={(props, option) => (
                    <MenuItem {...props} key={option.value} sx={{ fontSize: 14 }}>{option.label}</MenuItem>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      placeholder="Select Unit"
                      sx={inputSx}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: "text.disabled" }} /></InputAdornment>
                            {params.InputProps.startAdornment}
                          </>
                        ),
                        endAdornment: (
                          <>
                            {unitsLoading ? <CircularProgress size={14} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
                {fieldError("menuUnit") && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>{fieldError("menuUnit")}</Typography>}
              </FormControl>
            </Box>
          </Box>

          {/* ── Row 4: Sell Price + Base/Purchase Price ───────────────────── */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Box>
              <FieldLabel text="Sell Price" required />
              <TextField fullWidth size="small" type="text" inputMode="decimal" placeholder="0.00"
                value={form.sellPrice} onChange={setAmount("sellPrice")}
                onBlur={() => touch("sellPrice")} error={Boolean(fieldError("sellPrice"))}
                helperText={fieldError("sellPrice")}
                inputProps={{ inputMode: "decimal", maxLength: 17 }}
                InputProps={{ sx: inputSx, startAdornment: <InputAdornment position="start"><Typography variant="body2" fontWeight={700} sx={{ color: PRIMARY }}>₹</Typography></InputAdornment> }} />
            </Box>
            <Box>
              <FieldLabel text={form.menuType === "Food" ? "Base Price" : "Purchase Price"} />
              <TextField fullWidth size="small" type="text" inputMode="decimal" placeholder="0.00"
                value={form.purchasePrice} onChange={setAmount("purchasePrice")}
                onBlur={() => touch("purchasePrice")} error={Boolean(fieldError("purchasePrice"))}
                helperText={fieldError("purchasePrice")}
                inputProps={{ inputMode: "decimal", maxLength: 17 }}
                InputProps={{ sx: inputSx, startAdornment: <InputAdornment position="start"><Typography variant="body2" fontWeight={600} color="text.disabled">₹</Typography></InputAdornment> }} />
            </Box>
          </Box>

          {/* ── Variants button — Food only ──────────────────────────────────── */}
          {form.menuType === "Food" ? (
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>Variants</Typography>
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
              {variants.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.25 }}>
                  {variants.map((v) => (
                    <Box
                      key={v.id}
                      sx={{
                        display: "flex", alignItems: "center", gap: 0.75,
                        px: 1.25, py: 0.5, borderRadius: 1.5,
                        bgcolor: "rgba(210,31,60,0.06)",
                        border: "1px solid rgba(210,31,60,0.15)",
                      }}
                    >
                      <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#374151" }}>{v.name}</Typography>
                      <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: PRIMARY }}>₹{v.price}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
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

              {/* HSN Code */}
              <Box>
                <FieldLabel text="HSN Code" />
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter HSN/SAC code"
                  value={form.hsnCode}
                  onChange={(e) => set("hsnCode", e.target.value)}
                  onBlur={() => touch("hsnCode")}
                  error={Boolean(fieldError("hsnCode"))}
                  helperText={fieldError("hsnCode")}
                  inputProps={{ maxLength: HSN_CODE_MAX_LENGTH }}
                  InputProps={{ sx: { ...inputSx, bgcolor: "background.paper" } }}
                />
              </Box>

              {/* Tax Rate Dropdown */}
              <Box>
                <FieldLabel text="Tax Rate (GST)" />
                <FormControl fullWidth size="small">
                  <Autocomplete
                    options={gstOptions}
                    getOptionLabel={(g) => g.label}
                    isOptionEqualToValue={(a, b) => String(a.value) === String(b.value)}
                    value={gstOptions.find((g: GstOption) => String(g.value) === form.gstTax) ?? null}
                    onChange={(_e, newValue) => set("gstTax", newValue ? String(newValue.value) : "")}
                    loading={gstLoading}
                    noOptionsText="No tax rates found"
                    ListboxProps={{ sx: { maxHeight: 300 } }}
                    renderOption={(props, option) => (
                      <MenuItem {...props} key={option.value} sx={{ fontSize: 14 }}>{option.label}</MenuItem>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        placeholder="Select Tax Rate"
                        sx={{ ...inputSx, bgcolor: "background.paper" }}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: "text.disabled" }} /></InputAdornment>
                              {params.InputProps.startAdornment}
                            </>
                          ),
                          endAdornment: (
                            <>
                              {gstLoading ? <CircularProgress size={14} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </FormControl>
              </Box>
            </Box>
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
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={form.openingStock}
                    onChange={setAmount("openingStock")}
                    onBlur={() => touch("openingStock")}
                    error={Boolean(fieldError("openingStock"))}
                    helperText={fieldError("openingStock")}
                    disabled={isEditMode && originalMenuType === "Product"}
                    inputProps={{ inputMode: "decimal", maxLength: 17 }}
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
                    type="text"
                    inputMode="decimal"
                    placeholder="e.g. 10"
                    value={form.alertStock}
                    onChange={setAmount("alertStock")}
                    onBlur={() => touch("alertStock")}
                    error={Boolean(fieldError("alertStock"))}
                    helperText={fieldError("alertStock")}
                    disabled={isEditMode && originalMenuType === "Product"}
                    inputProps={{ inputMode: "decimal", maxLength: 17 }}
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
    <SuccessToast message={toastMsg} onClose={() => setToastMsg("")} severity={toastSeverity} />
    </>
  );
};

export default AddRestaurantMenuItemDialog;
