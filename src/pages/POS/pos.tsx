import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useForceRefreshProducts, usePosSearch, usePosProducts } from "./useposproducts";
import type { PosProduct } from "./db";
import { useSaveOrder, SALE_TYPE_BY_POS_MODE, type SaveOrderResult } from "./usesaveOrder";
import {
  useCustomerSearch,
  type ApiCustomer,
  primaryMobile,
  customerAddress,
  customerShippingAddress,
} from "./usecustomer";
import {
  useHoldOrders,
  useSaveHold,
  useDeleteHold,
  type ApiHold,
  type SaveHoldPayload,
} from "./useholdorders";
import {
  Box, Typography, TextField, Button, IconButton, Table, TableBody,
  TableCell, TableHead, TableRow, TableFooter, Divider, Chip, Paper, InputAdornment,
  Tooltip, Fade, Badge, Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemText, ListItemSecondaryAction,
  Select, MenuItem, CircularProgress,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import AddShoppingCartIcon    from "@mui/icons-material/AddShoppingCart";
import KeyboardReturnIcon     from "@mui/icons-material/KeyboardReturn";
import DeleteOutlineIcon      from "@mui/icons-material/DeleteOutline";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import SaveIcon               from "@mui/icons-material/Save";
import PrintOutlinedIcon      from "@mui/icons-material/PrintOutlined";
import QrCodeScannerIcon      from "@mui/icons-material/QrCodeScanner";
import AddIcon                from "@mui/icons-material/Add";
import AddCircleOutlineIcon   from "@mui/icons-material/AddCircleOutline";
import RemoveIcon             from "@mui/icons-material/Remove";
import PlayArrowIcon          from "@mui/icons-material/PlayArrow";
import CloseIcon              from "@mui/icons-material/Close";
import SearchIcon             from "@mui/icons-material/Search";
import EditIcon               from "@mui/icons-material/Edit";
import CalendarTodayIcon      from "@mui/icons-material/CalendarToday";
import PersonSearchIcon       from "@mui/icons-material/PersonSearch";
import ReceiptLongIcon        from "@mui/icons-material/ReceiptLong";
import RequestQuoteIcon       from "@mui/icons-material/RequestQuote";
import NoteAltOutlinedIcon    from "@mui/icons-material/NoteAltOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import ShareIcon              from "@mui/icons-material/Share";
import QrCode2Icon            from "@mui/icons-material/QrCode2";
import AccountBalanceIcon     from "@mui/icons-material/AccountBalance";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PaymentsIcon           from "@mui/icons-material/Payments";
import ReceiptIcon            from "@mui/icons-material/Receipt";
import MoreHorizIcon          from "@mui/icons-material/MoreHoriz";
import InfoOutlinedIcon       from "@mui/icons-material/InfoOutlined";
import SwapHorizIcon          from "@mui/icons-material/SwapHoriz";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import jsPDF                  from "jspdf";
import { renderPaginatedInvoicePdf } from "@utils/pdfPagination";
import { numberToWords } from "@utils/numberToWords";
import { useLocation }        from "react-router-dom";
import CustomerLedgerDialog   from "../Customer/CustomerLedgerDialog";
import AddNewCustomerDialog   from "@pages/Customer/Addnewcustomerdialog";
import AddItemModal           from "../MenuItemScreen/AddItemModal";
import SuccessToast           from "@components/Common/SuccessToast";
import CameraBarcodeScanner   from "@components/Common/CameraBarcodeScanner";
import { useHardwareScannerListener } from "@components/Common/useHardwareScannerListener";
import { isMobileOrTabletDevice } from "@components/Common/deviceType";
import CameraAltOutlinedIcon  from "@mui/icons-material/CameraAltOutlined";
import {
  fetchSaleDetail,
} from "../SalesHistory/useSaleshistory";
import { flushSync } from "react-dom";
import { InvoicePDFTemplate } from "../SalesHistory/InvoicePDFTemplate";
import { InvoicePDFTemplateModern } from "../SalesHistory/InvoicePDFTemplateModern";
import { InvoicePDFTemplateModern2 } from "../SalesHistory/InvoicePDFTemplateModern2";
import InvoiceCopyActions from "@components/Common/InvoiceCopyActions";
import { invoiceCopyTypesForSale, normalizeInvoiceCopyTypes } from "@utils/invoiceCopyTypes";
import { isProformaSaleType, isQuotationSaleType } from "@utils/saleType";
import { ThermalInvoiceTemplate, type ThermalPaperSize } from "../SalesHistory/ThermalInvoiceTemplate";
import { toPaymentTypeLabels } from "@pages/Settings/useInvoiceSettingApi";
import { normalizePosSettings, usePosSettings, type PosTypeLabel } from "@pages/Settings/usePosSettingApi";
import DiscountModal          from "./DiscountModal";
import NoteModal              from "./NotesModal";
import { useAppSelector, useAppDispatch } from "@store/store";
import { BranchId, ZoduId, InvoiceSettingsData, PosSettingsData, setPosSettings } from "@store/slices/userSlice";
import { Download } from "@mui/icons-material";
import CheckCircleIcon        from "@mui/icons-material/CheckCircle";
import CurrencyRupeeIcon      from "@mui/icons-material/CurrencyRupee";

const INR = (v: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(v);
// Round-half-up to 2 decimals — matches the value the user sees per row, so totals summed
// from these match the sum of the displayed rows instead of drifting from unrounded sums.
const round2 = (v: number) => Math.round((v + Number.EPSILON) * 100) / 100;
const todayStr = () => new Date().toISOString().split("T")[0];

// Format YYYY-MM-DD -> "29-JUL-2026"
const formatDateDisplay = (dateString: string | undefined): string => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  if (!year || !month || !day) return "";
  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return `${day}-${monthNames[Number(month) - 1]}-${year}`;
};

// Format date string to YYYY-MM-DD without timezone shift
const formatDateForInput = (dateString: string | undefined): string => {
  if (!dateString) return "";
  const d = new Date(dateString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const theme = createTheme({
  palette: {
    primary: { main: "#C8102E" },
    background: { default: "#FFFFFF", paper: "#FFFFFF" },
    text: { primary: "#1A1A2E", secondary: "#6B7280" },
  },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: "none", borderRadius: 8, fontWeight: 600 } } },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: "1px solid #F0F0F0", padding: "6px 8px" },
        head: {
          fontSize: 12, fontWeight: 700, letterSpacing: "0.02em", color: "#6B7280",
          backgroundColor: "#FAFAFA",
          whiteSpace: "normal", wordBreak: "break-word", overflowWrap: "anywhere", lineHeight: 1.35,
        },
      },
    },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 16 } } },
  },
});

interface LineItem {
  code: string; description: string; qty: number; unitPrice: number; sellPrice: number; uuid: string;
  hsn: string; mrp: number; gstPct: number; taxInclusive: boolean; category?: string; unit?: string;
  discount?: number;
  discountPct?: number;
  itemDescription?: string;
  editingQty?: boolean; editingPrice?: boolean; editingDiscount?: boolean;
  qtyDraft?: string; priceDraft?: string; discountDraft?: string;
}
interface Customer { id: string | null; name: string; mobile: string; address: string; gstin: string; shippingAddress: string; sameAsBillingAddress: boolean; }
const EMPTY_CUSTOMER: Customer = { id: null, name: "", mobile: "", address: "", gstin: "", shippingAddress: "", sameAsBillingAddress: true };
interface SavedOrderSnapshot {
  result: SaveOrderResult;
  customer: Customer;
  // POS mode at save-time — the print data needs it to title the document
  // "QUOTATION", and posMode can change before the user hits Print.
  saleType: string;
  // Vehicle number for the transport copy — not persisted by the backend yet,
  // so it is captured here and merged into the print data below.
  vehicleNo: string;
  // Manually-typed item descriptions aren't persisted by the backend yet, so
  // they're captured here (keyed by item code) at save-time and merged back
  // into the print data below rather than round-tripped through the API.
  descriptions: Record<string, string>;
}
interface HeldOrder {
  id: string;
  label: string;
  items: LineItem[];
  discount: string;
  discountPct: string;
  customer: Customer;
  time: Date;
  totalAmount: number;
}
type PosMode = "SALE" | "QUOTATION" | "PROFORMA";

// POS tabs come from the sale types enabled in Settings → POS Settings.
// Those labels ("Invoice" | "Quotation" | "Proforma") are what that API stores;
// PosMode is what this screen and the orders API speak, so the two are mapped
// here rather than passing labels around.
const POS_MODE_BY_TYPE: Record<PosTypeLabel, PosMode> = {
  Invoice: "SALE",
  Quotation: "QUOTATION",
  Proforma: "PROFORMA",
};
const POS_TYPE_BY_MODE: Record<PosMode, PosTypeLabel> = {
  SALE: "Invoice",
  QUOTATION: "Quotation",
  PROFORMA: "Proforma",
};

// One accent per sale type so the cashier can tell at a glance which document
// they are building: the house red for an invoice, blue for a quotation and a
// light green for a proforma.
const POS_MODE_THEME: Record<PosMode, {
  accent: string;       // tab fill, chip border and text
  accentHover: string;  // hover state for solid accent buttons
  tint: string;         // faint row background (highlighted suggestion)
  chipBg: string;       // date chip fill
  totalBg: string;
  totalBorder: string;
  totalText: string;
  shadow: string;       // glow under the primary action button
  focusRing: string;    // ring around the focused panel
}> = {
  SALE: {
    accent: "#C8102E", accentHover: "#A50D26", tint: "#FFF7F8", chipBg: "#FEE2E2",
    totalBg: "#DCFCE7", totalBorder: "#86EFAC", totalText: "#16A34A",
    shadow: "rgba(200,16,46,0.35)", focusRing: "rgba(200,16,46,0.08)",
  },
  QUOTATION: {
    accent: "#1D4ED8", accentHover: "#1E40AF", tint: "#EFF6FF", chipBg: "#DBEAFE",
    totalBg: "#EFF6FF", totalBorder: "#BFDBFE", totalText: "#1D4ED8",
    shadow: "rgba(29,78,216,0.35)", focusRing: "rgba(29,78,216,0.08)",
  },
  PROFORMA: {
    accent: "#2FA36B", accentHover: "#26895A", tint: "#F0FDF6", chipBg: "#D9F7E7",
    totalBg: "#F0FDF6", totalBorder: "#A7E8C6", totalText: "#2FA36B",
    shadow: "rgba(47,163,107,0.35)", focusRing: "rgba(47,163,107,0.10)",
  },
};

/** `sale_type` as stored on an order ("retail" | "quotation" | "proforma", plus
 *  the older short "q" / "p" forms) back to the tab it belongs on. */
function saleTypeToPosMode(saleType: string | null | undefined): PosMode {
  if (isQuotationSaleType(saleType)) return "QUOTATION";
  if (isProformaSaleType(saleType)) return "PROFORMA";
  return "SALE";
}
/**
 * Cart table columns, shared by the scrolling body table and the pinned totals
 * row so the two can never drift apart.
 *
 * Pixels, not percentages: a rupee value has a floor width, and percentage
 * columns fall under it on a laptop — ₹2,25,000.00 then wraps mid-number and
 * collides with the column next to it. Only DESCRIPTION flexes, absorbing
 * whatever width is left. Below `md` the screen renders cards instead of this
 * table, so these widths only have to hold from ~900px up.
 *
 * Each budget is the widest value the column shows plus the 8px-a-side cell
 * padding from the theme above: ₹2,25,000.00 at 13px needs ~88px, so 108.
 */
const CART_COL_WIDTHS: (number | "auto")[] = [
  4,      // active-row accent bar
  96,     // ITEM ID — free text, wraps
  "auto", // DESCRIPTION — takes the remaining width
  104,    // TAX AMT (GST %)
  92,     // MRP
  104,    // QTY stepper
  118,    // RATE input
  108,    // UNIT PRICE
  84,     // DISC % input
  112,    // TOTAL
  40,     // remove button
];

function CartColGroup() {
  return (
    <colgroup>
      {CART_COL_WIDTHS.map((width, i) => (
        <col key={i} style={{ width: width === "auto" ? "auto" : `${width}px` }} />
      ))}
    </colgroup>
  );
}

type Zone = "SEARCH" | "CUSTOMER" | "TABLE" | "FOOTER";
type SearchFocus = "CODE";
type FooterFocus = "DISCOUNT_PCT" | "DISCOUNT_AMT" | "PAYMENT_TYPE" | "REF_NO" | "RECEIVED" | "SAVE";
type PaymentType = "Cash" | "UPI" | "UPI + Cash" | "Cheque" | "Bank Transfer" | "Others";

// Falls back to the original hardcoded four for branches whose settings predate the field.
const DEFAULT_ENABLED_PAYMENT_TYPES: PaymentType[] = ["Cash", "UPI", "Bank Transfer", "Others"];
const PAYMENT_TYPE_ICON: Record<PaymentType, typeof QrCode2Icon> = {
  Cash: PaymentsIcon,
  UPI: QrCode2Icon,
  "UPI + Cash": AccountBalanceWalletIcon,
  Cheque: ReceiptIcon,
  "Bank Transfer": AccountBalanceIcon,
  Others: MoreHorizIcon,
};

// `payment_types` is an array of canonical labels (set in POS settings' "Payment Types"
// chip picker) controlling which payment chips appear at checkout. Falls back to the
// original hardcoded four when unset, so existing branches keep their current behavior.
function getEnabledPaymentTypes(raw: unknown): PaymentType[] {
  const labels = toPaymentTypeLabels(raw);
  return labels.length > 0 ? labels : DEFAULT_ENABLED_PAYMENT_TYPES;
}

function toLineItem(p: PosProduct): LineItem {
  const grossPrice = Number(p.sell_price) || 0;
  const gstPct = Number(p.gst_tax) || 0;
  const taxInclusive = p.tax_inclusive === true || (p.tax_inclusive as unknown) === 1;
  const unitPrice = taxInclusive && gstPct > 0 ? grossPrice / (1 + gstPct / 100) : grossPrice;
  return {
    uuid: p.item_uuid, code: p.item_id, description: p.item_name,
    qty: 1, unitPrice, sellPrice: grossPrice, taxInclusive,
    hsn: p.hsn_code ?? "", mrp: Number(p.mrp) || grossPrice,
    gstPct, category: p.category_name ?? "", unit: p.unit || "NOS", discount: 0,
    // Seed from the menu item's own description — snapshotted at add-to-cart
    // time so the invoice shows the text current when this line was billed.
    // The cashier can still edit it per line before checkout.
    itemDescription: p.description ?? "",
  };
}

// Settings' default_payment_method ("Cash" | "Card" | "UPI" | "Bank Transfer") doesn't have a
// "Card" equivalent among POS's payment tiles, so it falls back to "Others".
function toPosPaymentType(method: string | undefined): PaymentType {
  if (method === "Cash" || method === "UPI" || method === "Bank Transfer") return method;
  return "Others";
}

// printer_inch is stored as "3 Inch" / "4 Inch" / "5 Inch"; PaperSize only accepts "3" | "4" | "5".
function toThermalPaperSize(printerInch: string | undefined): ThermalPaperSize {
  if (printerInch?.startsWith("4")) return "4";
  if (printerInch?.startsWith("5")) return "5";
  return "3";
}

function addDaysToDate(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function paymentStatus(grand: number, received: number) {
  if (received <= 0) return { label: "UNPAID", color: "#DC2626" };
  if (received < grand - 0.01) return { label: "PARTIAL", color: "#D97706" };
  if (received > grand + 0.01) return { label: "EXCESS", color: "#2563EB" };
  return { label: "FULL PAYMENT", color: "#16A34A" };
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", bgcolor: "#D3D3D3", border: "1px solid #D3D3D3", borderRadius: "4px", px: 0.6, py: 0.1, minWidth: 18 }}>
      <Typography sx={{ fontSize: 9, fontWeight: 700, fontFamily: "monospace", color: "#696969", lineHeight: 1.4 }}>{children}</Typography>
    </Box>
  );
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <Box component="span" sx={{ bgcolor: "#FEF08A", borderRadius: 0.4, px: 0.2, fontWeight: 800 }}>
        {text.slice(index, index + query.length)}
      </Box>
      {text.slice(index + query.length)}
    </>
  );
}

const queryClient = new QueryClient();
const CAT_COLOR: Record<string, string> = { Beans: "#92400E", Drinks: "#1D4ED8", Equipment: "#065F46", Accessories: "#5B21B6", Milk: "#9D174D", Syrups: "#B45309" };

export default function RetailPOS() {
  return <QueryClientProvider client={queryClient}><RetailPOSInner /></QueryClientProvider>;
}

function RetailPOSInner() {
  const dispatch = useAppDispatch();
  const zoduId   = useAppSelector(ZoduId);
  const branchId = useAppSelector(BranchId);
  const invoiceSettings = useAppSelector(InvoiceSettingsData);
  // Sale types this branch offers, and the one POS opens on. The Redux copy is
  // only filled at branch-select, so a branch selected before these settings
  // existed — or one whose settings changed since — would show a stale tab row;
  // the query is the source of truth and Redux is the instant-render fallback
  // while it loads. normalizePosSettings guarantees a non-empty list whose
  // default is one of its members, even for a branch with no POS row yet.
  const storedPosSettings = useAppSelector(PosSettingsData);
  const { data: fetchedPosSettings } = usePosSettings();
  const { pos_types: enabledPosTypes, default_pos_type: defaultPosType } = useMemo(
    () => normalizePosSettings(fetchedPosSettings ?? storedPosSettings),
    [fetchedPosSettings, storedPosSettings],
  );
  useEffect(() => {
    if (!fetchedPosSettings) return;
    const stored = normalizePosSettings(storedPosSettings);
    if (
      stored.default_pos_type === fetchedPosSettings.default_pos_type &&
      stored.pos_types.join() === fetchedPosSettings.pos_types.join()
    ) return;
    dispatch(setPosSettings(fetchedPosSettings));
  }, [fetchedPosSettings, storedPosSettings, dispatch]);

  // The default type leads the tab row as well as being the one POS opens on —
  // it is the branch's everyday document, so it reads first. The rest follow in
  // their canonical order (Invoice, Quotation, Proforma).
  const orderedPosTypes = useMemo(
    () => [defaultPosType, ...enabledPosTypes.filter((type) => type !== defaultPosType)],
    [enabledPosTypes, defaultPosType],
  );
  const enabledPaymentTypes = useMemo(
    () => getEnabledPaymentTypes(invoiceSettings?.payment_types),
    [invoiceSettings?.payment_types]
  );
  // Camera scanning only makes sense on a phone/tablet's own camera — desktop/laptop
  // relies on a hardware USB/Bluetooth scanner instead, so the camera button is hidden there.
  const isMobileOrTablet = useMemo(() => isMobileOrTabletDevice(), []);
  // Below `md` (phone/tablet-portrait widths) the order list renders as stacked
  // cards instead of the 11-column table — a horizontally-scrolling table doesn't
  // work well on touch, and the qty/rate/discount edit inputs need real room.
  // `md` and up (small laptops included) keeps the table — plenty of width once
  // this section is no longer sharing space with a sidebar. `useMediaQuery` (not
  // just an sx breakpoint) because the two layouts mount different DOM/controls —
  // CSS-hiding one instead of the other would double up the qty/price/discount
  // TextField refs.
  const isCompactTable = useMediaQuery(theme.breakpoints.down("md"));

  const [codeInput, setCodeInput] = useState("");
  const { results: suggestions, isLoading: catalogueLoading, total: catalogueTotal } = usePosSearch(branchId, codeInput, zoduId);
  // Full cached catalogue (same query as usePosSearch's, shared via react-query cache) — used for
  // exact barcode/item_id lookups on scan, independent of whatever's currently typed in the search box.
  const { data: allProducts = [] } = usePosProducts(branchId, zoduId);
  const forceRefresh = useForceRefreshProducts(branchId, zoduId);

  const location        = useLocation();
  const query           = new URLSearchParams(location.search);
  const saleIdFromUrl   = query.get("saleId");
  const saleTypeFromUrl = query.get("saleType");

  const [posMode,        setPosMode]        = useState<PosMode>(() => POS_MODE_BY_TYPE[defaultPosType]);
  // Set once the cashier picks a tab — their choice then outranks a default
  // that only arrives with the settings response.
  const posModeTouchedRef = useRef(false);
  const [items,          setItems]          = useState<LineItem[]>([]);
  const [discount,       setDiscount]       = useState("0");
  const [discountPct,    setDiscountPct]    = useState("0");
  const [gstMode,        setGstMode]        = useState<"after" | "before">("after");
  const [referenceNo,    setReferenceNo]    = useState("");
  const [vehicleNo,      setVehicleNo]      = useState("");
  const [receivedAmount, setReceivedAmount] = useState("");
  const [paymentType,    setPaymentType]    = useState<PaymentType>("Cash");
  const [printEnabled,   setPrintEnabled]   = useState(true);
  const thermalPaperSize: ThermalPaperSize = toThermalPaperSize(invoiceSettings?.printer_inch);
  // Copy markings offered in the success modal's Download/Print menus.
  const invoiceCopyTypes = normalizeInvoiceCopyTypes(invoiceSettings?.invoice_copy_types);
  // The transport copy travels with the goods and prints a Vehicle No row, so
  // the cashier only needs somewhere to type it when that copy is enabled.
  const showVehicleNo = invoiceCopyTypes.includes("Transport");
  const [invoiceDate,    setInvoiceDate]    = useState(todayStr());
  const [dueDate,        setDueDate]        = useState("");
  const [orderNote,      setOrderNote]      = useState("");
  const [customer,       setCustomer]       = useState<Customer>(EMPTY_CUSTOMER);
  const [selectedApiCustomer, setSelectedApiCustomer] = useState<ApiCustomer | null>(null);
  const [customerSuggestionsOpen, setCustomerSuggestionsOpen] = useState(false);
  const [customerLedgerOpen,      setCustomerLedgerOpen]      = useState(false);
  const [addCustomerOpen,         setAddCustomerOpen]         = useState(false);
  const [addItemOpen,             setAddItemOpen]             = useState(false);
  const [cameraScanOpen,          setCameraScanOpen]          = useState(false);
  const [scanMsg,                 setScanMsg]                 = useState("");
  const [toastSeverity,           setToastSeverity]           = useState<'success' | 'error'>('success');
  const [downloadLoading,         setDownloadLoading]         = useState(false);
  // Copy marking the hidden print templates are currently rendering — driven
  // synchronously at capture time (see generatePdfForCopies).
  const [renderCopyType,          setRenderCopyType]          = useState<string | null>(null);
  const [shareLoading,            setShareLoading]            = useState(false);
  const [printLoading,            setPrintLoading]            = useState(false);
  const [savedOrderSnapshot,      setSavedOrderSnapshot]      = useState<SavedOrderSnapshot | null>(null);
  const [flashRow,       setFlashRow]       = useState<string | null>(null);
  const [saleId,         setSaleId]         = useState<string | null>(null);

  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [noteModalOpen,     setNoteModalOpen]     = useState(false);
  // Purely visual toggle for the "Ship to same as Billing" checkbox in the redesigned
  // Bill To / Ship To cards — there is no separate shipping-address field in existing
  // state/API, so this only controls which label the Ship To card mirrors.
  const [shipSameAsBilling, setShipSameAsBilling] = useState(true);

  const { results: customerResults, loading: customerLoading, search: searchCustomers, clear: clearCustomerResults } = useCustomerSearch(zoduId, branchId);

  const [zone,                 setZone]                 = useState<Zone>("SEARCH");
  const [searchFocus,          setSearchFocus]          = useState<SearchFocus>("CODE");
  const [activeRowIdx,         setActiveRowIdx]         = useState(-1);
  const [footerFocus,          setFooterFocus]          = useState<FooterFocus>("DISCOUNT_PCT");
  const [suggestionIdx,        setSuggestionIdx]        = useState(-1);
  const [customerSuggestionIdx,setCustomerSuggestionIdx]= useState(-1);
  const [showSuggestions,      setShowSuggestions]      = useState(false);
  // Free-typed search query for the Customer panel — kept separate from `customer.name`
  // so Bill To / Ship To only reflect an actually-selected customer, not each keystroke.
  const [customerQuery,        setCustomerQuery]        = useState("");
  const [holdDialogOpen,       setHoldDialogOpen]       = useState(false);
  const [receivedDirty, setReceivedDirty] = useState(false);

const {
  data: serverHolds = [],
  isLoading: holdsLoading,
  refetch: refetchHolds,
} = useHoldOrders(zoduId, branchId); 

  const { mutateAsync: saveHoldApi, isPending: holdSaving } = useSaveHold(zoduId, branchId);
  const { mutateAsync: deleteHoldApi }                       = useDeleteHold(zoduId, branchId);
  const { saveOrder, saving, updateOrder }                   = useSaveOrder();

  // ─── ALL computed totals — declared BEFORE any useCallback that uses them ───
  const subtotal          = useMemo(() => items.reduce((s, i) => s + round2(i.qty * i.unitPrice), 0), [items]);
  const itemDiscountTotal = useMemo(() => items.reduce((s, i) => s + (i.discount ?? 0), 0), [items]);

  // Undiscounted GST — the tax on the full taxable value, before any order-level discount is applied.
  // Each item's GST is rounded to 2dp first (matching its displayed value), then summed.
  const grossGstAmount = useMemo(() => {
    if (subtotal === 0) return 0;
    return items.reduce((s, i) => s + round2(i.qty * i.unitPrice * i.gstPct / 100), 0);
  }, [items, subtotal]);

  const discountFlatAmt = parseFloat(discount) || 0;
  const discountPctVal  = parseFloat(discountPct) || 0;

  // "Before GST": % is taken on the taxable value, so GST is recomputed on the discounted base.
  // "After GST": % is taken on the GST-inclusive total (subtotal + GST), matching how the discount reads on the bill.
  const discountPctAmt = gstMode === "before"
    ? subtotal * discountPctVal / 100
    : (subtotal + grossGstAmount) * discountPctVal / 100;
  // Percentage and flat are the same single discount shown two ways (kept in
  // sync in the modal), not two discounts stacked — mirrors the discount_type
  // exclusivity already enforced when the order is saved (see discount_type below).
  const orderDiscountAmt = discountPctVal > 0 ? discountPctAmt : discountFlatAmt;

  const gstAmount = useMemo(() => {
    if (subtotal === 0) return 0;
    if (gstMode === "before") {
      return items.reduce((s, i) => {
        const itemBase     = i.qty * i.unitPrice;
        const itemDiscount = orderDiscountAmt * (itemBase / subtotal);
        return s + round2(Math.max(0, itemBase - itemDiscount) * i.gstPct / 100);
      }, 0);
    }
    return grossGstAmount;
  }, [items, orderDiscountAmt, gstMode, subtotal, grossGstAmount]);

  const grandTotalRaw = useMemo(() => {
    if (gstMode === "before") {
      return Math.max(0, (subtotal - orderDiscountAmt) + gstAmount - itemDiscountTotal);
    } else {
      return Math.max(0, subtotal + gstAmount - orderDiscountAmt - itemDiscountTotal);
    }
  }, [subtotal, gstAmount, orderDiscountAmt, itemDiscountTotal, gstMode]);

  const roundoffValue = Math.round(grandTotalRaw) - grandTotalRaw;
  const grandTotal    = Math.round(grandTotalRaw);
  const received      = parseFloat(receivedAmount) || 0;
  const totalUnits    = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  // Quotations and proformas are both non-binding documents: no payment is
  // taken, so POS hides the payment fields and the hold controls for either.
  const isNonSaleDoc   = posMode !== "SALE";
  const posTypeLabel   = POS_TYPE_BY_MODE[posMode];
  const modeTheme      = POS_MODE_THEME[posMode];
  const status        = paymentStatus(grandTotal, received);
  const dueDateEnabled = !isNonSaleDoc && received < grandTotal - 0.01;
  // ────────────────────────────────────────────────────────────────────────────

  const [saveResult, setSaveResult] = useState<{
    open: boolean; success: boolean; message: string;
    invoiceNo?: string; grandTotal?: number; change?: number; saleId?: string;
  } | null>(null);

  const codeRef           = useRef<HTMLInputElement>(null);
  const customerNameRef   = useRef<HTMLInputElement>(null);
  const discountPctRef    = useRef<HTMLInputElement>(null);
  const discountAmtRef    = useRef<HTMLInputElement>(null);
  const refNoRef          = useRef<HTMLInputElement>(null);
  const receivedRef       = useRef<HTMLInputElement>(null);
  const dueDateInputRef   = useRef<HTMLInputElement | null>(null);
  const tableBodyRef      = useRef<HTMLTableSectionElement>(null);
  const qtyRefs           = useRef<Record<string, HTMLInputElement | null>>({});
  const priceRefs         = useRef<Record<string, HTMLInputElement | null>>({});
  const discountRefs      = useRef<Record<string, HTMLInputElement | null>>({});
  const editCancelledRef       = useRef(false);
  const inputRef               = useRef<HTMLInputElement | null>(null);
  const pdfRef                 = useRef<HTMLDivElement | null>(null);
  const thermalRef             = useRef<HTMLDivElement | null>(null);
  const suggestionListRef      = useRef<HTMLDivElement | null>(null);
  const customerSuggestionListRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { forceRefresh(); }, []);
  useEffect(() => { codeRef.current?.focus(); }, []);
  useEffect(() => {
    setSaleId(saleIdFromUrl);
    if (saleTypeFromUrl) setPosMode(saleTypeToPosMode(saleTypeFromUrl));
  }, [saleIdFromUrl, saleTypeFromUrl]);

  // Open on the branch's default sale type, and never sit on a tab that has
  // since been turned off in Settings. Reopening a saved document is exempt —
  // its own type wins, and the loader below sets it.
  useEffect(() => {
    if (saleId) return;
    // Settings arrive after first paint, so the default has to be applied when
    // it lands — but only until the cashier picks a tab themselves, after which
    // the only correction is off a type that no longer exists.
    if (!posModeTouchedRef.current) {
      setPosMode(POS_MODE_BY_TYPE[defaultPosType]);
      return;
    }
    setPosMode((prev) => (enabledPosTypes.includes(POS_TYPE_BY_MODE[prev]) ? prev : POS_MODE_BY_TYPE[defaultPosType]));
  }, [enabledPosTypes, defaultPosType, saleId]);

  useEffect(() => {
    if (zone === "TABLE" && activeRowIdx >= 0) {
      const rows = tableBodyRef.current?.querySelectorAll("tr[data-rowcode]");
      if (rows?.[activeRowIdx]) (rows[activeRowIdx] as HTMLElement).scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeRowIdx, zone]);

  useEffect(() => {
    if (suggestionIdx < 0) return;
    const container = suggestionListRef.current;
    if (!container) return;
    const item = container.children[suggestionIdx] as HTMLElement | undefined;
    if (item) item.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [suggestionIdx]);

  useEffect(() => {
    if (customerSuggestionIdx < 0) return;
    const container = customerSuggestionListRef.current;
    if (!container) return;
    const item = container.children[customerSuggestionIdx] as HTMLElement | undefined;
    if (item) item.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [customerSuggestionIdx]);

  useEffect(() => {
    if (zone === "SEARCH")        setTimeout(() => codeRef.current?.focus(), 10);
    else if (zone === "CUSTOMER") setTimeout(() => customerNameRef.current?.focus(), 10);
    else if (zone === "FOOTER") {
      if      (footerFocus === "DISCOUNT_PCT") setTimeout(() => discountPctRef.current?.focus(), 10);
      else if (footerFocus === "DISCOUNT_AMT") setTimeout(() => discountAmtRef.current?.focus(), 10);
      else if (footerFocus === "REF_NO")       setTimeout(() => refNoRef.current?.focus(),       10);
      else if (footerFocus === "RECEIVED")     setTimeout(() => receivedRef.current?.focus(),    10);
    }
  }, [zone, footerFocus, searchFocus]);

  useEffect(() => {
    setSuggestionIdx(-1);
    if (codeInput.trim() && zone === "SEARCH" && searchFocus === "CODE") setShowSuggestions(true);
  }, [codeInput]);

  useEffect(() => {
    if (!catalogueLoading && codeInput.trim() && zone === "SEARCH" && searchFocus === "CODE" && document.activeElement === codeRef.current)
      setShowSuggestions(true);
  }, [catalogueLoading]);

useEffect(() => {
  if (!receivedDirty && grandTotal > 0) {
    setReceivedAmount(String(grandTotal));
  }
  if (grandTotal === 0) {
    setReceivedAmount("");
    setReceivedDirty(false);
  }
}, [grandTotal, receivedDirty]);

  // Seed payment type / due date from branch invoice settings — only for a fresh order
  // (no saleId loaded yet), so this never clobbers values restored from an existing sale.
  useEffect(() => {
    if (!invoiceSettings || saleId) return;
    const enabled = getEnabledPaymentTypes(invoiceSettings.payment_types);
    const defaultType = toPosPaymentType(invoiceSettings.default_payment_method);
    setPaymentType(enabled.includes(defaultType) ? defaultType : enabled[0]);
    setDueDate(addDaysToDate(invoiceDate, invoiceSettings.invoice_due_days || 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceSettings, saleId]);

  // A sale restored from a saleId (or one open while the picker was edited in settings) can
  // hold a payment type that's since been disabled — it has no chip to render and no matching
  // <MenuItem>, which leaves the hidden Select blank and the keyboard nav with nothing to land
  // on. Fall back to the first enabled type; a still-enabled selection is left alone.
  useEffect(() => {
    if (!enabledPaymentTypes.includes(paymentType)) {
      setPaymentType(enabledPaymentTypes[0]);
    }
  }, [enabledPaymentTypes, paymentType]);

  const startEditQty = useCallback((code: string) => {
    setItems(prev => prev.map(i => i.code === code ? { ...i, editingQty: true, editingPrice: false, editingDiscount: false, qtyDraft: String(i.qty) } : { ...i, editingQty: false }));
    setTimeout(() => { qtyRefs.current[code]?.focus(); qtyRefs.current[code]?.select(); }, 30);
  }, []);

  const startEditPrice = useCallback((code: string) => {
    setItems(prev => prev.map(i => i.code === code ? { ...i, editingPrice: true, editingQty: false, editingDiscount: false, priceDraft: String(i.sellPrice) } : { ...i, editingPrice: false }));
    setTimeout(() => { priceRefs.current[code]?.focus(); priceRefs.current[code]?.select(); }, 30);
  }, []);

  const startEditDiscount = useCallback((code: string) => {
    setItems(prev => prev.map(i => i.code === code ? { ...i, editingDiscount: true, editingQty: false, editingPrice: false, discountDraft: String(i.discountPct ?? 0) } : { ...i, editingDiscount: false }));
    setTimeout(() => { discountRefs.current[code]?.focus(); discountRefs.current[code]?.select(); }, 30);
  }, []);

  // Server caps description at 1000 chars — trim client-side so it can never 400.
  const updateItemDescription = useCallback((code: string, value: string) => {
    const trimmed = value.slice(0, 1000);
    setItems(prev => prev.map(i => i.code === code ? { ...i, itemDescription: trimmed } : i));
  }, []);

  // Shared by manual suggestion clicks, Enter-to-add, and barcode/QR scans —
  // bumps qty if the product's already on the order, otherwise prepends a new line.
  // This is the single source of truth for qty — callers must not re-set it afterwards,
  // or a repeat scan/Enter of the same item stops incrementing.
  const addProductLine = useCallback((p: PosProduct) => {
    if (invoiceSettings?.stock_check_enabled) {
      const existingQty = items.find(i => i.code === p.item_id)?.qty ?? 0;
      if (existingQty + 1 > p.stock_qty) {
        setToastSeverity('error');
        setScanMsg(p.stock_qty > 0
          ? `Only ${p.stock_qty} in stock for "${p.item_name}"`
          : `"${p.item_name}" is out of stock`);
        return;
      }
    }
    setItems(prev => {
      const idx = prev.findIndex(i => i.code === p.item_id);
      if (idx >= 0) { const e = prev[idx]; return [{ ...e, qty: e.qty + 1, uuid: p.item_uuid }, ...prev.filter((_, i) => i !== idx)]; }
      return [toLineItem(p), ...prev];
    });
    setFlashRow(p.item_id); setTimeout(() => setFlashRow(null), 700);
  }, [items, invoiceSettings]);

  const doAddItem = useCallback((itemId: string) => {
    const p = suggestions.find(s => s.item_id === itemId);
    if (!p) return false;
    addProductLine(p);
    return p.item_id;
  }, [suggestions, addProductLine]);

  // Scan lookups (hardware gun or camera) match against the FULL cached catalogue,
  // not the live-typed `suggestions`, so a scan works regardless of what's in the
  // search box. Matches by exact item_id or barcode (case-insensitive). Scanning the
  // same item again bumps its qty (addProductLine already does this) — the toast just
  // reflects which happened so repeated scans are visibly confirmed.
  const handleScanCode = useCallback((rawCode: string) => {
    const code = rawCode.trim();
    if (!code) return;
    const lower = code.toLowerCase();
    const p = allProducts.find(prod =>
      prod.item_id?.toLowerCase() === lower || prod.barcode?.toLowerCase() === lower
    );
    if (!p) {
      setToastSeverity('error');
      setScanMsg(`No item found for scanned code "${code}"`);
      return;
    }
    const existing = items.find(i => i.code === p.item_id);
    addProductLine(p);
    setToastSeverity('success');
    setScanMsg(existing ? `"${p.item_name}" qty increased to ${existing.qty + 1}` : `Added "${p.item_name}"`);
  }, [allProducts, addProductLine, items]);

  // Whether any dialog is currently open — the page-level scanner listener below must
  // stay off while one is, so it doesn't fight with a dialog's own scan handling
  // (e.g. AddItemModal's Item ID field owns scans while that modal is open).
  const anyModalOpen = addItemOpen || cameraScanOpen || addCustomerOpen || customerLedgerOpen
    || discountModalOpen || noteModalOpen || holdDialogOpen || Boolean(saveResult?.open);

  // Auto-detects a connected hardware USB/Bluetooth scanner without requiring the
  // scan bar to be clicked first — active whenever the POS screen has no dialog open.
  useHardwareScannerListener({ onScan: handleScanCode, active: !anyModalOpen });

  useEffect(() => {
    if (!saleId) return;
    const loadSale = async () => {
      const data = await fetchSaleDetail(saleIdFromUrl!);
      const sale = data.sale;
      setPosMode(saleTypeToPosMode(sale.sale_type));
      setSaleId(sale.sale_uuid);
      console.log("new",data)
      setItems(data.items.map((i: any) => {
        const grossPrice   = Number(i.price) || 0;
        const gstPct       = Number(i.gst_percentage) || 0;
        const taxInclusive = Boolean(i.tax_inclusive);
        const unitPrice    = taxInclusive && gstPct > 0 ? grossPrice / (1 + gstPct / 100) : grossPrice;
        return { code: i.item_id, description: i.item_name, qty: Number(i.quantity), unitPrice, sellPrice: grossPrice, gstPct, taxInclusive, uuid: i.item_uuid, hsn: i.hsn_code ?? "", mrp: Number(i.mrp || 0), unit: i.unit || "NOS", discount: Number(i.discount || 0), discountPct: Number(i.discount_percentage || 0), itemDescription: i.description ?? "" };
      }));
      if (data.customer) {
        const c = data.customer;
        const displayName = c.cust_name && c.cpy_name ? `${c.cust_name} / ${c.cpy_name}` : c.cust_name || c.cpy_name || "";
        const billingAddress = [c.address_line1, c.address_line2, c.city, c.state, c.pincode].filter(Boolean).join(", ");
        setCustomer({ id: c.cust_uuid, name: displayName, mobile: c.mobile || "", address: billingAddress, gstin: c.gst || "", shippingAddress: c.same_as_billing_address ? billingAddress : (c.shipping_address || ""), sameAsBillingAddress: !!c.same_as_billing_address });
        setShipSameAsBilling(!!c.same_as_billing_address);
        setCustomerQuery(displayName);
      }
      if (sale.discount_type === "percentage") { setDiscountPct(String(sale.discount_value || 0)); setDiscount("0"); }
      else { setDiscount(String(sale.discount_amount || 0)); setDiscountPct("0"); }
      setGstMode(sale.discount_gst_mode === "before" ? "before" : "after");
      setReceivedAmount(String(sale.paid_amount || 0));
      if (data.payment_history.length > 0) {
        const last = data.payment_history[data.payment_history.length - 1];
        setReferenceNo(last.transaction_id || "");
        setPaymentType((last.transaction_type as any) || "Cash");
      }
      setVehicleNo((sale as any).vehicle_no ?? "");
      setInvoiceDate(formatDateForInput(sale.sale_date_fmt));
      setDueDate(formatDateForInput((sale as any).due_date_fmt || (sale as any).due_date));
    };
    loadSale();
  }, [saleId]);

  const handleAddItem = useCallback((overrideCode?: string) => {
    const code = (overrideCode ?? codeInput).trim();
    const id   = doAddItem(code);
    if (!id && code) {
      // Not found via the live search suggestions (e.g. a scanned barcode that
      // differs from item_id) — fall back to an exact item_id/barcode match
      // against the full catalogue, same lookup a physical scan uses.
      handleScanCode(code);
    }
    setCodeInput(""); setShowSuggestions(false);
    setZone("SEARCH"); setSearchFocus("CODE");
    setTimeout(() => codeRef.current?.focus(), 10);
  }, [codeInput, doAddItem, handleScanCode]);

  const selectSuggestion = useCallback((p: PosProduct) => {
    doAddItem(p.item_id);
    setCodeInput(""); setShowSuggestions(false);
    setZone("SEARCH"); setSearchFocus("CODE");
    setTimeout(() => codeRef.current?.focus(), 10);
  }, [doAddItem]);

  const handleClear = useCallback(() => {
    setItems([]); setDiscount("0"); setDiscountPct("0"); setReferenceNo(""); setVehicleNo("");
    setReceivedAmount(""); setCodeInput(""); setActiveRowIdx(-1); setOrderNote("");
    const freshInvoiceDate = todayStr();
    setInvoiceDate(freshInvoiceDate);
    setDueDate(invoiceSettings ? addDaysToDate(freshInvoiceDate, invoiceSettings.invoice_due_days || 0) : "");
    if (invoiceSettings) {
      const enabled = getEnabledPaymentTypes(invoiceSettings.payment_types);
      const defaultType = toPosPaymentType(invoiceSettings.default_payment_method);
      setPaymentType(enabled.includes(defaultType) ? defaultType : enabled[0]);
    } else {
      setPaymentType("Cash");
    }
    setZone("SEARCH"); setSearchFocus("CODE");
    setCustomer(EMPTY_CUSTOMER); setSelectedApiCustomer(null); setCustomerQuery(""); clearCustomerResults(); setGstMode("after");
    setReceivedDirty(false);

  }, [clearCustomerResults, invoiceSettings]);

console.log("test",serverHolds)

  const heldOrders: HeldOrder[] = serverHolds?.map((h: ApiHold) => ({
    id:    h.hold_uuid,
    label: h.hold_id,
    items: h.items.map((i) => ({
      code:        i.item_id,
      description: i.item_name,
      qty:         Number(i.quantity),
      unitPrice:   i.tax_inclusive && i.gst_percentage > 0
        ? Number(i.price) / (1 + i.gst_percentage / 100)
        : Number(i.price),
      sellPrice:   Number(i.price),
      uuid:        i.item_uuid ?? i.item_id,
      hsn:         i.hsn_code ?? "",
      mrp:         Number(i.mrp),
      gstPct:      Number(i.gst_percentage),
      taxInclusive:Boolean(i.tax_inclusive),
      unit:        i.unit ?? "NOS",
      discount:    Number(i.discount ?? 0),
      // The Hold API doesn't persist description — re-populate from the
      // current menu-item catalogue rather than expecting it back from here.
      itemDescription: allProducts.find(p => p.item_id === i.item_id)?.description ?? "",
    })),
    discount:    String(h.discount_type === "flat"       ? h.discount_value : 0),
    discountPct: String(h.discount_type === "percentage" ? h.discount_value : 0),
    customer: {
      id:      h.customer_uuid,
      name:    h.customer_name  ?? "",
      mobile:  h.customer_phone ?? "",
      address: "",
      gstin:   "",
    },
    time:        new Date(h.created_at),
    totalAmount: Number(h.total_amount),
  }));

  // ── handleHold now safely references all computed values above ──
  const handleHold = useCallback(async () => {
    if (items.length === 0 || holdSaving) return;
    console.log(items)

    const payload: SaveHoldPayload = {
      zodu_id:        zoduId,
      branch_id:      branchId,
      // Holding is only offered on the Invoice tab (F9 and the Hold button are
      // both gated on posMode === "SALE"), so this is never a quotation or
      // proforma — the hold API only knows the two values anyway.
      order_type:     "SALE",
      notes:          orderNote || null,
      customer_uuid:  customer.id || null,
      customer_name:  customer.name || null,
      customer_phone: customer.mobile || null,
      total_items:    items.length,
      subtotal,
      total_tax:      gstAmount,
      discount_type:
        parseFloat(discountPct) > 0 ? "percentage"
        : parseFloat(discount)  > 0 ? "flat"
        : null,
      discount_value:
        parseFloat(discountPct) > 0 ? parseFloat(discountPct)
        : parseFloat(discount)  || 0,
      discount_amount: orderDiscountAmt,
      round_off:       roundoffValue,
      total_amount:    grandTotal,
      
      items: items.map((i) => ({
        item_uuid:      i.uuid || null,
        item_id:        i.code,
        item_name:      i.description,
        // Accepted for validation, but the Hold API doesn't persist it —
        // resuming a hold re-populates each line from the menu-item catalogue.
        description:    i.itemDescription || null,
        unit:           i.unit || null,
        quantity:       i.qty,
        price:          i.sellPrice,
        mrp:            i.mrp || null,
        discount:       i.discount ?? 0,
        hsn_code:       i.hsn || null,
        gst_percentage: i.gstPct,
        tax_amount:     (i.qty * i.unitPrice * i.gstPct) / 100,
        cgst:           (i.qty * i.unitPrice * i.gstPct) / 200,
        sgst:           (i.qty * i.unitPrice * i.gstPct) / 200,
        tax_inclusive:  i.taxInclusive,
      })),
    };

    try {
      await saveHoldApi(payload);
      setItems([]);
      setDiscount("0");
      setDiscountPct("0");
      setReceivedAmount("");
      setActiveRowIdx(-1);
      setZone("SEARCH");
      setSearchFocus("CODE");
      setCustomer(EMPTY_CUSTOMER);
      setSelectedApiCustomer(null);
      setCustomerQuery("");
      setOrderNote("");
      refetchHolds();
    } catch (err) {
      console.error("Hold save failed:", err);
    }
  }, [
    items, zoduId, branchId, posMode, orderNote, customer,
    subtotal, gstAmount, discountPct, discount, orderDiscountAmt,
    roundoffValue, grandTotal, holdSaving, saveHoldApi,refetchHolds
  ]);

  const handleDeleteHold = async (id: string) => {
    try { await deleteHoldApi(id);
      await refetchHolds();
     }
    catch (err) { console.error("Delete failed", err); }
  };

  const handleRecall = async (hold: HeldOrder) => {
  if (
    items.length > 0 &&
    !window.confirm("Current order will be cleared. Recall held order?")
  ) return;

  // 1. Load hold into POS
  setItems(hold.items);
  setDiscount(hold.discount);
  setCustomer(hold.customer);
  setCustomerQuery(hold.customer.name || "");

  setHoldDialogOpen(false);
  setZone("TABLE");
  setActiveRowIdx(0);

  try {
    // 2. DELETE from DB (wait for it)
    await deleteHoldApi(hold.id);

    // 3. REFETCH after delete completes
    await refetchHolds();

  } catch (err) {
    console.error("Delete failed", err);
  }
};

  const handleOpenPicker = () => {
    if (inputRef.current) { inputRef.current.showPicker(); inputRef.current.focus(); }
  };

  const handleOpenDueDatePicker = () => {
    if (dueDateInputRef.current) { dueDateInputRef.current.showPicker(); dueDateInputRef.current.focus(); }
  };

  const updateQty  = (code: string, delta: number) => {
    if (delta > 0 && invoiceSettings?.stock_check_enabled) {
      const item = items.find(i => i.code === code);
      const stockQty = allProducts.find(p => p.item_id === code)?.stock_qty;
      if (item && stockQty !== undefined && item.qty + delta > stockQty) {
        setToastSeverity('error');
        setScanMsg(stockQty > 0
          ? `Only ${stockQty} in stock for "${item.description}"`
          : `"${item.description}" is out of stock`);
        return;
      }
    }
    setItems(prev => prev.map(i => {
      if (i.code !== code) return i;
      const qty = Math.max(1, i.qty + delta);
      const discount = i.discountPct ? parseFloat(((i.discountPct * qty * i.sellPrice) / 100).toFixed(2)) : i.discount;
      return { ...i, qty, discount };
    }));
  };

  // Commits a typed quantity (qty box blur/Enter/Tab) — shared so both call
  // sites apply the same stock cap instead of duplicating the clamp logic.
  const commitQtyDraft = (code: string, rawValue: string) => {
    let newQty = Math.max(1, parseFloat(rawValue) || 1);
    if (invoiceSettings?.stock_check_enabled) {
      const stockQty = allProducts.find(p => p.item_id === code)?.stock_qty;
      if (stockQty !== undefined && newQty > stockQty) {
        newQty = Math.max(1, stockQty);
        setToastSeverity('error');
        setScanMsg(stockQty > 0
          ? `Only ${stockQty} in stock — quantity capped at ${newQty}`
          : `Item is out of stock`);
      }
    }
    setItems(prev => prev.map(i => {
      if (i.code !== code) return i;
      const discount = i.discountPct ? parseFloat(((i.discountPct * newQty * i.sellPrice) / 100).toFixed(2)) : i.discount;
      return { ...i, qty: newQty, discount, editingQty: false, qtyDraft: undefined };
    }));
  };

  const removeItem = (code: string) => {
    setItems(prev => {
      const next = prev.filter(i => i.code !== code);
      if (!next.length) { setActiveRowIdx(-1); setZone("SEARCH"); setSearchFocus("CODE"); }
      else setActiveRowIdx(idx => Math.min(idx, next.length - 1));
      return next;
    });
  };

  const handleCustomerQueryChange = useCallback((value: string) => {
    setCustomerQuery(value);
    setCustomerSuggestionsOpen(true);
    setCustomerSuggestionIdx(-1);
    searchCustomers(value);
  }, [searchCustomers]);

  const handleAddItemSaved = useCallback(() => {
    setAddItemOpen(false);
    void forceRefresh();
    setTimeout(() => codeRef.current?.focus(), 10);
  }, [forceRefresh]);

  const handleSelectCustomer = useCallback((c: ApiCustomer) => {
    const custName    = c.cust_name?.trim() ?? "";
    const cpyName     = c.cpy_name?.trim()  ?? "";
    const displayName = custName && cpyName ? `${custName} / ${cpyName}` : custName || cpyName;
    setCustomer({ id: c.cust_uuid, name: displayName, mobile: primaryMobile(c), address: customerAddress(c), gstin: c.gst ?? "", shippingAddress: customerShippingAddress(c), sameAsBillingAddress: c.same_as_billing_address });
    setSelectedApiCustomer(c);
    setShipSameAsBilling(c.same_as_billing_address);
    setCustomerQuery(displayName);
    setCustomerSuggestionsOpen(false); setCustomerSuggestionIdx(-1); clearCustomerResults(); setZone("CUSTOMER");
  }, [clearCustomerResults]);

  const handleCloseSaveResult = useCallback(() => {
    setSaveResult(null);
    setSavedOrderSnapshot(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (items.length === 0 || saving) return;
    if (invoiceSettings?.customer_mandatory && !customer.id) {
      setSaveResult({ open: true, success: false, message: "Please select a customer before completing this sale." });
      return;
    }
    const stockCheckEnabled = !!invoiceSettings?.stock_check_enabled;
    const result = saleId
      ? await updateOrder(saleId, { zodu_id: zoduId, branch_id: branchId, items, customer, invoiceDate, dueDate: dueDateEnabled ? dueDate : "", discountPct, discountFlat: discount, discountGstMode: gstMode, roundoff: roundoffValue, posMode, receivedAmount, paymentType, referenceNo, vehicleNo, stockCheckEnabled })
      : await saveOrder({ zodu_id: zoduId, branch_id: branchId, items, customer, invoiceDate, dueDate: dueDateEnabled ? dueDate : "", discountPct, discountFlat: discount, discountGstMode: gstMode, roundoff: roundoffValue, posMode, receivedAmount, paymentType, referenceNo, vehicleNo, stockCheckEnabled });
    if (result.success) {
      console.log("save Result",result)
      const order    = result.order as any;
      const totalAmt = parseFloat(order?.total_amount ?? "0");
      const paidAmt  = parseFloat(order?.paid_amount  ?? "0");
      const change   = paidAmt > totalAmt ? paidAmt - totalAmt : 0;
      const savedSaleId = String(order?.sale_id ?? saleIdFromUrl ?? "").trim() || undefined;
      setSavedOrderSnapshot({
        result: result as SaveOrderResult,
        customer: { ...customer },
        saleType: SALE_TYPE_BY_POS_MODE[posMode],
        vehicleNo,
        descriptions: Object.fromEntries(items.map(i => [i.code, i.itemDescription || ""])),
      });
      setSaveResult({ open: true, success: true, message: result.message, grandTotal: totalAmt, change, saleId: savedSaleId });
      if (printEnabled) console.log("🖨 Printing invoice");
      handleClear();
    } else {
      setSavedOrderSnapshot(null);
      setSaveResult({ open: true, success: false, message: result.message });
    }
  }, [items, customer, invoiceDate, dueDate, dueDateEnabled, discountPct, discount, gstMode, roundoffValue, posMode, receivedAmount, paymentType, referenceNo, vehicleNo, printEnabled, saving, saveOrder, updateOrder, handleClear, saleId, saleIdFromUrl, invoiceSettings]);

  const handleThermalPrint = useCallback((copies: string[] = []) => {
    if (!thermalRef.current) return;
    // Use actual printable widths (roll width minus hardware margins) to prevent right-side clipping
    const paperMmMap: Record<ThermalPaperSize, number> = { "3": 72, "4": 96, "5": 120 };
    const mm = paperMmMap[thermalPaperSize];
    // outerHTML (not innerHTML) — the ref'd div carries the base font-family/color/weight
    // inline styles; innerHTML would drop them and fall back to the browser's thin default font.
    // One capture per requested copy, each re-rendered synchronously so it
    // carries its own marking, then joined with hard page breaks.
    const list: Array<string | null> = copies.length > 0 ? copies : [null];
    const parts: string[] = [];
    try {
      for (const copy of list) {
        flushSync(() => setRenderCopyType(copy));
        parts.push(thermalRef.current.outerHTML);
      }
    } finally {
      flushSync(() => setRenderCopyType(null));
    }
    const content = parts.join('<div style="page-break-after:always"></div>');
    const printWindow = window.open("", "_blank", "width=500,height=700");
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Receipt</title>
  <style>
    @page { size: ${mm}mm auto; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: ${mm}mm;
      background: #fff;
      color: #000;
      font-family: 'Courier New','Consolas','Lucida Console',monospace;
      font-weight: 600;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    @media print { html, body { width: ${mm}mm; } }
  </style>
</head>
<body>${content}</body>
</html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
  }, [thermalRef, thermalPaperSize]);

  const FOOTER_ORDER: FooterFocus[] = ["DISCOUNT_PCT", "DISCOUNT_AMT", "PAYMENT_TYPE", "REF_NO", "RECEIVED", "SAVE"];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const active  = document.activeElement as HTMLElement;
      const inInput = active?.tagName === "INPUT" || active?.tagName === "TEXTAREA" || active?.tagName === "SELECT";
      if (active?.closest('[role="dialog"]')) return;

      if (e.key === "F2") { e.preventDefault(); setShowSuggestions(false); setZone("SEARCH"); setSearchFocus("CODE"); return; }
      if (e.key === "F4") { e.preventDefault(); handleClear(); return; }
      if (e.key === "F6") { e.preventDefault(); setDiscountModalOpen(true); return; }
      if (e.key === "F7") { e.preventDefault(); setNoteModalOpen(true); return; }
      if (e.key === "F8") { e.preventDefault(); handleSave(); return; }
      if (e.key === "F9" && posMode === "SALE") { e.preventDefault(); handleHold(); return; }

      const editingItem = items.find(i => i.editingQty || i.editingPrice || i.editingDiscount);
      if (editingItem) {
        if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); editCancelledRef.current = true; (document.activeElement as HTMLElement)?.blur(); return; }
        if (e.key === "Enter" || e.key === "Tab") return;
        return;
      }

      if (zone === "SEARCH" && searchFocus === "CODE") {
        if (showSuggestions && suggestions.length > 0) {
          if (e.key === "ArrowDown")  { e.preventDefault(); setSuggestionIdx(i => Math.min(i + 1, suggestions.length - 1)); return; }
          if (e.key === "ArrowUp")    { e.preventDefault(); setSuggestionIdx(i => Math.max(i - 1, -1)); return; }
          if (e.key === "Escape")     { e.preventDefault(); setShowSuggestions(false); setSuggestionIdx(-1); return; }
          if (e.key === "Enter")      { e.preventDefault(); if (suggestionIdx >= 0 && suggestions[suggestionIdx]) selectSuggestion(suggestions[suggestionIdx]); else handleAddItem(); return; }
          if (e.key === "Tab" || e.key === "ArrowRight") { e.preventDefault(); setShowSuggestions(false); setSuggestionIdx(-1); setZone("CUSTOMER"); return; }
        } else {
          if (e.key === "Enter")     { e.preventDefault(); handleAddItem(); return; }
          if (e.key === "ArrowDown") { e.preventDefault(); if (items.length > 0) { (document.activeElement as HTMLElement)?.blur(); setZone("TABLE"); setActiveRowIdx(0); } return; }
          if (e.key === "Tab" || e.key === "ArrowRight") { e.preventDefault(); setZone("CUSTOMER"); return; }
        }
        return;
      }

      if (zone === "CUSTOMER") {
        if (customerSuggestionsOpen && customerResults.length > 0) {
          if (e.key === "ArrowDown") { e.preventDefault(); setCustomerSuggestionIdx(i => Math.min(i + 1, customerResults.length - 1)); return; }
          if (e.key === "ArrowUp")   { e.preventDefault(); setCustomerSuggestionIdx(i => Math.max(i - 1, 0)); return; }
          if (e.key === "Enter") {
            e.preventDefault();
            if (customerSuggestionIdx >= 0 && customerResults[customerSuggestionIdx]) handleSelectCustomer(customerResults[customerSuggestionIdx]);
            return;
          }
          if (e.key === "Escape") { e.preventDefault(); setCustomerSuggestionsOpen(false); setCustomerSuggestionIdx(-1); return; }
        }
        if (e.key === "Escape" || e.key === "ArrowLeft") { e.preventDefault(); (document.activeElement as HTMLElement)?.blur(); setZone("SEARCH"); setSearchFocus("CODE"); return; }
        if (e.key === "ArrowDown") { e.preventDefault(); (document.activeElement as HTMLElement)?.blur(); setZone("TABLE"); setActiveRowIdx(0); return; }
        return;
      }

      if (zone === "TABLE") {
        const item = items[activeRowIdx];
        if (!item) return;
        if (e.key === "ArrowDown")  { e.preventDefault(); if (activeRowIdx < items.length - 1) setActiveRowIdx(i => i + 1); else { setZone("FOOTER"); setFooterFocus("DISCOUNT_PCT"); } return; }
        if (e.key === "ArrowUp")    { e.preventDefault(); if (activeRowIdx > 0) setActiveRowIdx(i => i - 1); else { setZone("SEARCH"); setSearchFocus("CODE"); setActiveRowIdx(-1); } return; }
        if (e.key === "Escape")     { e.preventDefault(); setActiveRowIdx(-1); setZone("SEARCH"); setSearchFocus("CODE"); return; }
        if (e.key === "Enter")      { e.preventDefault(); startEditQty(item.code); return; }
        if (e.key === "q" || e.key === "Q") { e.preventDefault(); startEditQty(item.code); return; }
        if (e.key === "p" || e.key === "P") { e.preventDefault(); startEditPrice(item.code); return; }
        if (e.key === "d" || e.key === "D") { e.preventDefault(); startEditDiscount(item.code); return; }
        if (e.key === "+" || e.key === "=") { e.preventDefault(); updateQty(item.code, 1); return; }
        if (e.key === "-")          { e.preventDefault(); updateQty(item.code, -1); return; }
        if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); removeItem(item.code); return; }
        if (!inInput && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          setZone("SEARCH"); setSearchFocus("CODE"); setActiveRowIdx(-1);
          setCodeInput(e.key); setTimeout(() => codeRef.current?.focus(), 10); return;
        }
        return;
      }

      if (zone === "FOOTER") {
        const fi = FOOTER_ORDER.indexOf(footerFocus);
        if (e.key === "ArrowRight") { e.preventDefault(); (document.activeElement as HTMLElement)?.blur(); if (fi < FOOTER_ORDER.length - 1) setFooterFocus(FOOTER_ORDER[fi + 1]); return; }
        if (e.key === "ArrowLeft")  { e.preventDefault(); (document.activeElement as HTMLElement)?.blur(); if (fi > 0) setFooterFocus(FOOTER_ORDER[fi - 1]); return; }
        if (e.key === "ArrowUp")    { e.preventDefault(); (document.activeElement as HTMLElement)?.blur(); setZone("TABLE"); setActiveRowIdx(items.length - 1); return; }
        if (inInput && e.key === "Escape") { e.preventDefault(); (document.activeElement as HTMLElement)?.blur(); setZone("SEARCH"); setSearchFocus("CODE"); return; }
        if (inInput) return;
        if (e.key === "Escape") { e.preventDefault(); setZone("SEARCH"); setSearchFocus("CODE"); return; }
        if (e.key === "Enter")  { e.preventDefault(); if (footerFocus === "SAVE") handleSave(); return; }
        return;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [zone, searchFocus, activeRowIdx, footerFocus, showSuggestions, suggestions, suggestionIdx, customerSuggestionsOpen, customerResults, customerSuggestionIdx, items, posMode, handleAddItem, handleClear, handleHold, handleSave, selectSuggestion, handleSelectCustomer, startEditQty, startEditPrice, startEditDiscount]);

  const isFooterActive = (f: FooterFocus) => zone === "FOOTER" && footerFocus === f;
  const footerOutline  = (f: FooterFocus) => ({ outline: isFooterActive(f) ? "2.5px solid #C8102E" : "2.5px solid transparent", outlineOffset: 2, transition: "outline 0.12s" });
  const isSearchActive = (sf: SearchFocus) => zone === "SEARCH" && searchFocus === sf;

  // Follow the active sale type rather than staying red: the accent buttons and
  // their hover states have to come from the same palette, or a proforma ends up
  // with a red button that turns green under the cursor.
  const modeAccent  = modeTheme.accent;
  const modeBg      = modeTheme.tint;
  const modeBorder  = modeTheme.totalBorder;

  const hasDiscount   = parseFloat(discountPct) > 0 || parseFloat(discount) > 0;
  const hasNote       = orderNote.trim().length > 0;
  const discountBadge = (() => {
    const parts: string[] = [];
    if (parseFloat(discountPct) > 0) parts.push(`${discountPct}%`);
    if (parseFloat(discount)    > 0) parts.push(`₹${discount}`);
    return parts.join(" + ") || null;
  })();

  const totalGstRow = items.reduce((s, i) => s + round2((i.qty * i.unitPrice * i.gstPct) / 100), 0);
  // Built from unitPrice + rounded item GST (same basis as the sidebar's Sub Total/Tax), not sellPrice —
  // keeps this footer reconciled with Sub Total + Tax + Round Off on the right.
  const totalAmtRow = items.reduce((s, i) => {
    const itemGst = round2((i.qty * i.unitPrice * i.gstPct) / 100);
    return s + round2(i.qty * i.unitPrice + itemGst - (i.discount ?? 0));
  }, 0);
  const empty       = items.length === 0;

  const savedHsnBreakdown = useMemo(() => {
    const saleItems = (savedOrderSnapshot?.result.items as any[]) ?? [];
    const hsnMap = saleItems.reduce((acc, item) => {
      const hsn = item.hsn_code ?? "-";
      const gstPct = Number(item.gst_percentage ?? 0);
      const quantity = Number(item.quantity ?? 0);
      const price = Number(item.price ?? 0);
      const discountAmount = Number(item.discount ?? 0);
      const taxable = quantity * price - discountAmount;
      const cgst = Number(item.cgst ?? 0);
      const sgst = Number(item.sgst ?? 0);

      if (!acc[hsn]) {
        acc[hsn] = {
          hsn,
          taxable: 0,
          cgstRate: gstPct / 2,
          cgstAmount: 0,
          sgstRate: gstPct / 2,
          sgstAmount: 0,
          totalTaxAmount: 0,
        };
      }

      acc[hsn].taxable += taxable;
      acc[hsn].cgstAmount += cgst;
      acc[hsn].sgstAmount += sgst;
      acc[hsn].totalTaxAmount += cgst + sgst;
      return acc;
    }, {} as Record<string, {
      hsn: string;
      taxable: number;
      cgstRate: number;
      cgstAmount: number;
      sgstRate: number;
      sgstAmount: number;
      totalTaxAmount: number;
    }>);

    return Object.values(hsnMap);
  }, [savedOrderSnapshot]);

  const savedPdfData = useMemo(() => {
    const order = savedOrderSnapshot?.result.order as any;
    const saleItems = (savedOrderSnapshot?.result.items as any[]) ?? [];
    const payment = savedOrderSnapshot?.result.payment as any;
    const saleCustomer = savedOrderSnapshot?.customer;
    const itemDescriptions = savedOrderSnapshot?.descriptions ?? {};
    if (!order) return null;

    const customerName = saleCustomer?.name?.trim() || "Walk-In";
    const customerAddress = saleCustomer?.address?.trim() || "-";
    const customerMobile = saleCustomer?.mobile?.trim() ? `+91 ${saleCustomer.mobile}` : "-";
    const customerGstin = saleCustomer?.gstin?.trim() || "-";
    const customerShippingAddress = saleCustomer?.shippingAddress?.trim() || "";
    const hasDiscount = Number(order.discount_amount ?? 0) > 0;
    const discountLabel = order.discount_type === "percentage"
      ? `Discount (${Number(order.discount_value ?? 0)}%)`
      : "Discount";

    const totalCgst = savedHsnBreakdown.reduce((sum, row) => sum + row.cgstAmount, 0);
    const totalSgst = savedHsnBreakdown.reduce((sum, row) => sum + row.sgstAmount, 0);
    const totalAmount = Number(order.total_amount ?? 0);


    return {
      sale_id: order.sale_id,
      // Drives the "QUOTATION" vs "INVOICE" heading in the print templates.
      sale_type: order.sale_type ?? savedOrderSnapshot?.saleType,
      // Printed on the transport copy; blank rule when it was left empty.
      vehicle_no: order.vehicle_no ?? savedOrderSnapshot?.vehicleNo,
      date: order.sale_date,
      due_date: order.due_date ?? null,
      customer_name: customerName,
      customer_address: customerAddress,
      customer_mobile: customerMobile,
      customer_gstin: customerGstin,
      customer_shipping_address: customerShippingAddress,
      payment_mode: payment?.transaction_type ?? paymentType,
      payment_status: order.payment_status,
      items: saleItems.map((item) => ({
        item_id: item.item_id,
        name: item.item_name,
        category: item.variant_name ?? "",
        description: itemDescriptions[item.item_id] || "",
        hsn: item.hsn_code ?? "-",
        qty: Number(item.quantity ?? 0),
        mrp: Number(item.mrp ?? 0),
        rate: Number(item.price ?? 0),
        tax: Number(item.gst_percentage ?? 0),
        total: Number(item.total_amount ?? 0),
      })),
      subtotal: Number(order.subtotal ?? 0),
      discount: hasDiscount ? Number(order.discount_amount ?? 0) : null,
      discount_label: discountLabel,
      cgst: totalCgst,
      sgst: totalSgst,
      cgst_pct: savedHsnBreakdown[0]?.cgstRate ?? 0,
      sgst_pct: savedHsnBreakdown[0]?.sgstRate ?? 0,
      round_off: order.round_off,
      total: totalAmount,
      amount_in_words: `${numberToWords(Math.round(totalAmount))} Rupees Only`,
      gst_breakdown: savedHsnBreakdown,
      company: undefined,
    };
  }, [savedHsnBreakdown, savedOrderSnapshot, paymentType]);

  /**
   * One PDF holding each requested copy in turn. An empty list means "no copy
   * marking" — the behavior from before copy types existed.
   */
  const generatePdfForCopies = useCallback(async (copies: string[]): Promise<jsPDF | null> => {
    if (!pdfRef.current) return null;
    const list: Array<string | null> = copies.length > 0 ? copies : [null];
    let doc: jsPDF | null = null;
    try {
      for (const copy of list) {
        // flushSync, not a plain setState: the marking has to be in the DOM
        // before the capture below reads it.
        flushSync(() => setRenderCopyType(copy));
        doc = await renderPaginatedInvoicePdf(pdfRef.current, doc);
        if (!doc) return null;
      }
    } finally {
      flushSync(() => setRenderCopyType(null));
    }
    return doc;
  }, []);

  // What the just-saved document offers in its Download/Print/Share menus — a
  // quotation prints unmarked, an invoice or proforma gets the configured
  // copies. `invoiceCopyTypes` above still drives the Vehicle No field, which
  // follows the setting rather than the document.
  const savedCopyTypes = invoiceCopyTypesForSale(invoiceSettings?.invoice_copy_types, savedPdfData?.sale_type);

  const handleDownloadInvoice = useCallback(async (copies: string[] = []) => {
    if (!savedPdfData) return;
    setDownloadLoading(true);
    try {
      const pdf = await generatePdfForCopies(copies);
      if (!pdf) return;
      const base = `Invoice_${savedPdfData.sale_id ?? saveResult?.saleId ?? "invoice"}`;
      const fileName = copies.length === 0 ? `${base}.pdf`
        : copies.length === 1 ? `${base}_${copies[0]}.pdf`
        : `${base}_All_Copies.pdf`;
      pdf.save(fileName);
    } finally {
      setDownloadLoading(false);
    }
  }, [generatePdfForCopies, saveResult?.saleId, savedPdfData]);

  const handleShareInvoice = useCallback(async (copies: string[] = []) => {
    if (!savedPdfData) return;

    setShareLoading(true);
    try {
      const pdf = await generatePdfForCopies(copies);
      if (!pdf) return;

      const base = `Invoice_${savedPdfData.sale_id ?? saveResult?.saleId ?? "invoice"}`;
      const fileName = copies.length === 0 ? `${base}.pdf`
        : copies.length === 1 ? `${base}_${copies[0]}.pdf`
        : `${base}_All_Copies.pdf`;
      const blob = pdf.output("blob");
      const file = new File([blob], fileName, { type: "application/pdf" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `Invoice ${savedPdfData.sale_id ?? ""}`.trim(),
            text: `Invoice from ${savedPdfData.sale_id ?? "POS"}`,
          });
          return;
        } catch (error: any) {
          if (error?.name === "AbortError") return;
        }
      }

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } finally {
      setShareLoading(false);
    }
  }, [generatePdfForCopies, saveResult?.saleId, savedPdfData]);

  // "Invoice Type" in Invoice Settings decides how the Print button behaves:
  // A4 triggers the browser's print dialog on the generated PDF without ever
  // navigating away; any thermal width (3"/5", "4" handled defensively) prints
  // the thermal receipt.
  const handlePrintInvoice = useCallback(async (copies: string[] = []) => {
    if (invoiceSettings?.printer_inch !== "A4") {
      handleThermalPrint(copies);
      return;
    }
    if (!savedPdfData) return;
    setPrintLoading(true);
    try {
      const pdf = await generatePdfForCopies(copies);
      if (!pdf) return;
      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      // A hidden iframe (rather than window.open in a new tab) loads the PDF and
      // prints it in place — the user never leaves the current page/tab. Chrome's
      // built-in PDF viewer doesn't reliably fire the iframe's `load` event (a
      // long-standing quirk), so `onload` is only a fast path — a fallback timer
      // guarantees print() still fires on browsers where it never does.
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.src = url;
      let printed = false;
      const triggerPrint = () => {
        if (printed) return;
        printed = true;
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      };
      iframe.onload = triggerPrint;
      document.body.appendChild(iframe);
      setTimeout(triggerPrint, 1000);
      setTimeout(() => {
        iframe.remove();
        URL.revokeObjectURL(url);
      }, 60000);
    } finally {
      setPrintLoading(false);
    }
  }, [invoiceSettings?.printer_inch, savedPdfData, generatePdfForCopies, handleThermalPrint]);

  // ── Shared qty/rate/discount editing controls ──────────────────
  // Used by both the desktop table row and the mobile/tablet card list so the
  // inline-edit behavior (refs, blur/keydown commit, F2-style shortcuts) has a
  // single implementation — only the surrounding layout differs per breakpoint.
  const renderQtyControl = (item: LineItem, rowIdx: number, isActive: boolean) => (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.3 }}>
      <IconButton size="small" onClick={() => updateQty(item.code, -1)} sx={{ width: 24, height: 24, bgcolor: "#F3F4F6", "&:hover": { bgcolor: "#FEE2E2" } }}><RemoveIcon sx={{ fontSize: 12 }} /></IconButton>
      {item.editingQty ? (
        <TextField inputRef={el => { qtyRefs.current[item.code] = el; }} value={item.qtyDraft ?? ""}
          onChange={e => setItems(prev => prev.map(i => i.code === item.code ? { ...i, qtyDraft: e.target.value.replace(/[^0-9.]/g, "") } : i))}
          onBlur={() => { if (editCancelledRef.current) { editCancelledRef.current = false; return; } const el = qtyRefs.current[item.code]; commitQtyDraft(item.code, el?.value ?? ""); setZone("TABLE"); setActiveRowIdx(rowIdx); }}
          onKeyDown={e => { if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); e.stopPropagation(); editCancelledRef.current = true; commitQtyDraft(item.code, (e.target as HTMLInputElement).value); (e.target as HTMLElement).blur(); setZone("TABLE"); setActiveRowIdx(rowIdx); } if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); editCancelledRef.current = true; setItems(prev => prev.map(i => i.code === item.code ? { ...i, editingQty: false, qtyDraft: undefined } : i)); (e.target as HTMLElement).blur(); setZone("TABLE"); setActiveRowIdx(rowIdx); } }}
          size="small" inputProps={{ step: "any", style: { textAlign: "center", fontWeight: 800, fontSize: 14, padding: "2px 2px", width: 48 } }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1, "& fieldset": { borderColor: "#1976D2", borderWidth: 2 } }, width: 64 }} />
      ) : (
        <Box onClick={() => { setZone("TABLE"); setActiveRowIdx(rowIdx); if (isActive) startEditQty(item.code); }}
          sx={{ minWidth: 30, textAlign: "center", fontWeight: 800, fontSize: 14, px: 0.4, py: 0.2, borderRadius: 1, cursor: isActive ? "text" : "pointer", border: isActive ? "1.5px dashed #1976D2" : "1.5px dashed transparent", bgcolor: isActive ? "#E3F2FD" : "transparent", "&:hover": { border: "1.5px dashed #1976D2", bgcolor: "#E3F2FD" }, transition: "all 0.15s" }}>{item.qty}</Box>
      )}
      <IconButton size="small" onClick={() => updateQty(item.code, 1)} sx={{ width: 24, height: 24, bgcolor: "#F3F4F6", "&:hover": { bgcolor: "#DCFCE7" } }}><AddIcon sx={{ fontSize: 12 }} /></IconButton>
    </Box>
  );

  const renderRateControl = (item: LineItem, rowIdx: number, isActive: boolean) => (
    item.editingPrice ? (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.4 }}>
        <Typography sx={{ fontSize: 13, color: "#9CA3AF", fontWeight: 700 }}>₹</Typography>
        <TextField inputRef={el => { priceRefs.current[item.code] = el; }} value={item.priceDraft ?? ""}
          onChange={e => setItems(prev => prev.map(i => i.code === item.code ? { ...i, priceDraft: e.target.value.replace(/[^0-9.]/g, "") } : i))}
          onBlur={() => { if (editCancelledRef.current) { editCancelledRef.current = false; return; } const el = priceRefs.current[item.code]; const newSell = Math.max(0, parseFloat(el?.value ?? "") || item.sellPrice); const newBase = item.taxInclusive && item.gstPct > 0 ? newSell / (1 + item.gstPct / 100) : newSell; setItems(prev => prev.map(i => { if (i.code !== item.code) return i; const discount = i.discountPct ? parseFloat(((i.discountPct * i.qty * newSell) / 100).toFixed(2)) : i.discount; return { ...i, sellPrice: newSell, unitPrice: newBase, discount, editingPrice: false, priceDraft: undefined }; })); setZone("TABLE"); setActiveRowIdx(rowIdx); }}
          onKeyDown={e => { if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); e.stopPropagation(); const newSell = Math.max(0, parseFloat((e.target as HTMLInputElement).value) || item.sellPrice); const newBase = item.taxInclusive && item.gstPct > 0 ? newSell / (1 + item.gstPct / 100) : newSell; editCancelledRef.current = true; setItems(prev => prev.map(i => { if (i.code !== item.code) return i; const discount = i.discountPct ? parseFloat(((i.discountPct * i.qty * newSell) / 100).toFixed(2)) : i.discount; return { ...i, sellPrice: newSell, unitPrice: newBase, discount, editingPrice: false, priceDraft: undefined }; })); (e.target as HTMLElement).blur(); setZone("TABLE"); setActiveRowIdx(rowIdx); } if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); editCancelledRef.current = true; setItems(prev => prev.map(i => i.code === item.code ? { ...i, editingPrice: false, priceDraft: undefined } : i)); (e.target as HTMLElement).blur(); setZone("TABLE"); setActiveRowIdx(rowIdx); } }}
          size="small" inputProps={{ style: { textAlign: "right", fontWeight: 700, fontSize: 13, padding: "2px 4px", width: 60 } }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1, "& fieldset": { borderColor: "#1976D2", borderWidth: 2 } }, width: 80 }} />
      </Box>
    ) : (
      <Box onClick={() => { setZone("TABLE"); setActiveRowIdx(rowIdx); if (isActive) startEditPrice(item.code); }}
        sx={{ display: "inline-flex", alignItems: "center", gap: 0.3, px: 0.6, py: 0.2, borderRadius: 1, cursor: isActive ? "text" : "pointer", border: isActive ? "1.5px dashed #1976D2" : "1.5px dashed transparent", bgcolor: isActive ? "#E3F2FD" : "transparent", "&:hover": { border: "1.5px dashed #1976D2", bgcolor: "#E3F2FD", "& .pedit": { opacity: 1 } }, transition: "all 0.15s" }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>{INR(item.sellPrice)}</Typography>
        <EditIcon className="pedit" sx={{ fontSize: 10, color: "#1976D2", opacity: isActive ? 0.6 : 0, transition: "opacity 0.15s", flexShrink: 0 }} />
      </Box>
    )
  );

  const renderDiscountControl = (item: LineItem, rowIdx: number, isActive: boolean) => (
    item.editingDiscount ? (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.4 }}>
        <TextField
          inputRef={el => { discountRefs.current[item.code] = el; }}
          value={item.discountDraft ?? ""}
          onChange={e => setItems(prev => prev.map(i => i.code === item.code ? { ...i, discountDraft: e.target.value.replace(/[^0-9.]/g, "") } : i))}
          onBlur={() => {
            if (editCancelledRef.current) { editCancelledRef.current = false; return; }
            const el = discountRefs.current[item.code];
            const pct = Math.min(100, Math.max(0, parseFloat(el?.value ?? "") || 0));
            const flat = parseFloat(((pct * item.qty * item.sellPrice) / 100).toFixed(2));
            setItems(prev => prev.map(i => i.code === item.code ? { ...i, discountPct: pct, discount: flat, editingDiscount: false, discountDraft: undefined } : i));
            setZone("TABLE"); setActiveRowIdx(rowIdx);
          }}
          onKeyDown={e => {
            if (e.key === "Enter" || e.key === "Tab") {
              e.preventDefault(); e.stopPropagation();
              const pct = Math.min(100, Math.max(0, parseFloat((e.target as HTMLInputElement).value) || 0));
              const flat = parseFloat(((pct * item.qty * item.sellPrice) / 100).toFixed(2));
              editCancelledRef.current = true;
              setItems(prev => prev.map(i => i.code === item.code ? { ...i, discountPct: pct, discount: flat, editingDiscount: false, discountDraft: undefined } : i));
              (e.target as HTMLElement).blur(); setZone("TABLE"); setActiveRowIdx(rowIdx);
            }
            if (e.key === "Escape") {
              e.preventDefault(); e.stopPropagation();
              editCancelledRef.current = true;
              setItems(prev => prev.map(i => i.code === item.code ? { ...i, editingDiscount: false, discountDraft: undefined } : i));
              (e.target as HTMLElement).blur(); setZone("TABLE"); setActiveRowIdx(rowIdx);
            }
          }}
          size="small"
          inputProps={{ style: { textAlign: "right", fontWeight: 700, fontSize: 13, padding: "2px 4px", width: 40 } }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1, "& fieldset": { borderColor: "#C8102E", borderWidth: 2 } }, width: 70 }}
          InputProps={{ endAdornment: <Typography sx={{ fontSize: 12, color: "#9CA3AF", fontWeight: 700 }}>%</Typography> }}
        />
      </Box>
    ) : (
      <Box onClick={() => { setZone("TABLE"); setActiveRowIdx(rowIdx); if (isActive) startEditDiscount(item.code); }}
        sx={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-end", px: 0.6, py: 0.2, borderRadius: 1, cursor: isActive ? "text" : "pointer", border: isActive ? "1.5px dashed #C8102E" : "1.5px dashed transparent", bgcolor: isActive ? "#FFF1F3" : "transparent", "&:hover": { border: "1.5px dashed #C8102E", bgcolor: "#FFF1F3", "& .dedit": { opacity: 1 } }, transition: "all 0.15s" }}>
        {(item.discountPct ?? 0) > 0 ? (
          <>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#C8102E" }}>{item.discountPct}%</Typography>
              <EditIcon className="dedit" sx={{ fontSize: 10, color: "#C8102E", opacity: isActive ? 0.5 : 0, transition: "opacity 0.15s" }} />
            </Box>
            <Typography sx={{ fontSize: 10, color: "#C8102E", fontWeight: 500 }}>- {INR(item.discount ?? 0)}</Typography>
          </>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#D1D5DB" }}>—</Typography>
            <EditIcon className="dedit" sx={{ fontSize: 10, color: "#C8102E", opacity: isActive ? 0.5 : 0, transition: "opacity 0.15s" }} />
          </Box>
        )}
      </Box>
    )
  );

  // ─────────────────────────────────────────────────────────────
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ height: "100%", minHeight: 0, bgcolor: "#F5F6FA", display: "flex", flexDirection: "column", overflow: { xs: "auto", lg: "hidden" } }}>

        {/* ═══════════════════ MAIN TWO-COLUMN LAYOUT ═══════════════════ */}
        {/* Below `lg` this stacks to a column. Desktop relies on a fixed viewport
            height with internal scroll regions (minHeight:0 + overflow:hidden) —
            stacked on mobile/tablet that squeezes the item-entry column to nothing
            to make room for the summary column below it. `minHeight:"auto"` lets
            each section keep its natural content height instead, and the page
            scrolls as a whole (via the root Box's overflow, above). */}
        <Box sx={{ flex: 1, minHeight: { xs: "auto", lg: 0 }, display: "flex", gap: { xs: 0.75, md: 1 }, p: { xs: 0.5, sm: 0.75, md: 1 }, overflow: { xs: "visible", lg: "hidden" }, flexDirection: { xs: "column", lg: "row" } }}>

          {/* ─────────────────────── LEFT COLUMN ─────────────────────── */}
          <Box sx={{ flex: "1 1 auto", minWidth: 0, minHeight: { xs: "auto", lg: 0 }, display: "flex", flexDirection: "column", gap: { xs: 0.75, sm: 1 }, overflow: { xs: "visible", lg: "hidden" } }}>

            {/* Top row: Sale/Quotation tabs + Hold/Recall — stays a single row on
                every width (no wrap): the switcher and buttons shrink their padding/
                font on `xs` and drop the "[F9]"-style keyboard hints (meaningless on
                touch anyway) so all four controls keep fitting phone widths. */}
            <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: 2, px: { xs: 1, md: 2 }, py: 0.75, display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: { xs: 42, md: 50 }, flexShrink: 0, flexWrap: "nowrap", gap: { xs: 0.5, md: 1 } }}>
              {/* One tab per sale type enabled in Settings → POS Settings, the
                  default one first — a branch that turned a type off gets no tab
                  for it, and a branch left with one type gets no switcher. */}
              <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.3, md: 0.5 }, bgcolor: "#F3F4F6", borderRadius: 2, p: 0.5, flexShrink: 0 }}>
                {orderedPosTypes.map((type) => {
                  const mode = POS_MODE_BY_TYPE[type];
                  const active = posMode === mode;
                  const accent = POS_MODE_THEME[mode].accent;
                  return (
                    <Box key={type} onClick={() => { posModeTouchedRef.current = true; setPosMode(mode); }} sx={{ display: "flex", alignItems: "center", gap: { xs: 0.4, md: 0.7 }, px: { xs: 1, md: 1.75 }, py: { xs: 0.4, md: 0.6 }, borderRadius: 1.5, cursor: "pointer", bgcolor: active ? accent : "transparent", color: active ? "#fff" : "#6B7280", transition: "all 0.18s", "&:hover": { bgcolor: active ? accent : "#E5E7EB" } }}>
                      {mode === "SALE"
                        ? <ReceiptLongIcon sx={{ fontSize: { xs: 13, md: 15 } }} />
                        : <RequestQuoteIcon sx={{ fontSize: { xs: 13, md: 15 } }} />}
                      <Typography sx={{ fontSize: { xs: 10.5, md: 12 }, fontWeight: 700, letterSpacing: "0.04em" }}>{type}</Typography>
                    </Box>
                  );
                })}
              </Box>

              {!isNonSaleDoc && (
                <Box sx={{ display: "flex", gap: { xs: 0.5, md: 0.75 }, flexShrink: 0 }}>
                  <Button size="small" disabled={holdSaving || items.length === 0}
                    startIcon={holdSaving ? <CircularProgress size={10} /> : <PauseCircleOutlineIcon sx={{ fontSize: { xs: 13, md: 16 } }} />}
                    onClick={handleHold}
                    sx={{ minWidth: { xs: 0, md: 82 }, height: { xs: 24, md: 26 }, px: { xs: 0.75, md: 1 }, borderRadius: 1.25, bgcolor: "#4B5563", color: "#fff", fontSize: { xs: 9, md: 10 }, fontWeight: 800, boxShadow: "0 2px 6px rgba(75,85,99,0.22)", "&:hover": { bgcolor: "#374151" } }}>
                    HOLD <Box component="span" sx={{ display: { xs: "none", md: "inline" }, fontSize: 9, opacity: 0.8, ml: 0.3 }}>[F9]</Box>
                  </Button>
                  <Badge badgeContent={heldOrders.length} invisible={heldOrders.length === 0} sx={{ "& .MuiBadge-badge": { fontSize: 8, minWidth: 14, height: 14, bgcolor: "#C8102E", color: "#fff", fontWeight: 800 } }}>
                    <Button size="small" startIcon={<PlayArrowIcon sx={{ fontSize: { xs: 11, md: 12 } }} />} onClick={() => { setHoldDialogOpen(true); refetchHolds(); }}
                      sx={{ minWidth: { xs: 0, md: 80 }, height: { xs: 24, md: 26 }, px: { xs: 0.75, md: 1 }, borderRadius: 1.25, border: "1px solid #E5E7EB", bgcolor: heldOrders.length > 0 ? "#4B5563" : "#F3F4F6", color: heldOrders.length > 0 ? "#fff" : "#9CA3AF", fontSize: { xs: 9, md: 10 }, fontWeight: 800, "&:hover": { bgcolor: heldOrders.length > 0 ? "#374151" : "#E5E7EB" } }}>
                      RECALL
                    </Button>
                  </Badge>
                </Box>
              )}
            </Box>

            {/* Search row */}
            <Paper elevation={0} sx={{ borderRadius: 2, p: { xs: 1.1, md: 1.75 }, bgcolor: "#fff", position: "relative", zIndex: 100, transition: "border-color 0.2s", flexShrink: 0, border: zone === "SEARCH" ? `2px solid ${modeAccent}` : "2px solid #E5E7EB", boxShadow: zone === "SEARCH" ? `0 0 0 3px ${modeTheme.focusRing}` : "none" }}>
              <Box sx={{ display: "flex", gap: { xs: 0.75, md: 1.5 }, alignItems: "flex-end", flexWrap: { xs: "wrap", md: "nowrap" } }}>
                <Box sx={{ flex: 1, minWidth: { xs: "100%", md: 0 }, position: "relative" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.3 }}>
                    <Typography sx={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: modeAccent }}>ITEM ID / NAME</Typography>
                    <Kbd>F2</Kbd>
                    {/* Catalogue sync status is a nice-to-have, not actionable on a phone screen —
                        keep it off mobile so the label row doesn't fight the input for width. */}
                    <Box sx={{ display: { xs: "none", sm: "inline-flex" } }}>
                      {catalogueLoading
                        ? <Typography sx={{ fontSize: 9, color: "#9CA3AF", ml: 0.5 }}>syncing…</Typography>
                        : catalogueTotal > 0 && <Typography sx={{ fontSize: 9, color: "#10B981", ml: 0.5 }}>● {catalogueTotal.toLocaleString()} items</Typography>
                      }
                    </Box>
                  </Box>
                  <TextField
                    inputRef={codeRef} value={codeInput}
                    onChange={e => setCodeInput(e.target.value)}
                    onFocus={() => { setZone("SEARCH"); setSearchFocus("CODE"); if (!catalogueLoading && codeInput.trim()) setShowSuggestions(true); }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 180)}
                    placeholder="Search by item ID, name, category — or scan a barcode/QR…" size="small" fullWidth autoComplete="off"
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><QrCodeScannerIcon sx={{ color: modeAccent, fontSize: 18 }} /></InputAdornment>,
                      endAdornment: codeInput
                        ? <InputAdornment position="end"><IconButton size="small" onMouseDown={e => { e.preventDefault(); setCodeInput(""); setShowSuggestions(false); codeRef.current?.focus(); }}><CloseIcon sx={{ fontSize: 13, color: "#9CA3AF" }} /></IconButton></InputAdornment>
                        : <InputAdornment position="end"><SearchIcon sx={{ fontSize: 15, color: "#D1D5DB" }} /></InputAdornment>,
                      sx: { borderRadius: 1.5, bgcolor: "#FAFAFA", fontSize: 13 },
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: isSearchActive("CODE") ? modeAccent : "#E5E7EB", borderWidth: isSearchActive("CODE") ? 2 : 1 }, "&:hover fieldset": { borderColor: modeAccent }, "&.Mui-focused fieldset": { borderColor: modeAccent } } }}
                  />
                  {showSuggestions && (
                    <Paper elevation={8} sx={{ position: "absolute", top: "calc(100% + 2px)", left: 0, right: 0, borderRadius: "0 0 8px 8px", overflow: "hidden", zIndex: 9999, border: "1px solid #E0E0E0", borderTop: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 1.5, py: 0.6, bgcolor: "#F5F5F5", borderBottom: "1px solid #E5E7EB" }}>
                        <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>Item Name</Typography>
                        <IconButton size="small" onMouseDown={e => { e.preventDefault(); setShowSuggestions(false); }} sx={{ p: 0.2 }}><CloseIcon sx={{ fontSize: 13, color: "#9CA3AF" }} /></IconButton>
                      </Box>
                      {codeInput.trim() && suggestions.length === 0 && <Box sx={{ py: 3, textAlign: "center" }}><Typography sx={{ fontSize: 12, color: "#9CA3AF" }}>No items found for "{codeInput.trim()}"</Typography></Box>}
                      {suggestions.length > 0 && (
                        <Box ref={suggestionListRef} sx={{ maxHeight: 300, overflowY: "auto", bgcolor: "#fff" }}>
                          {suggestions.map((p, idx) => (
                            <Box key={p.item_id} onMouseDown={() => selectSuggestion(p)}
                              sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1.5, py: 0.75, cursor: "pointer", gap: 1.5, bgcolor: idx === suggestionIdx ? "#EFF6FF" : "#fff", borderBottom: "1px solid #F3F4F6", borderLeft: idx === suggestionIdx ? "3px solid #3B82F6" : "3px solid transparent", "&:hover": { bgcolor: "#F9FAFB", borderLeft: "3px solid #6B7280" }, transition: "all 0.08s" }}>
                              <Box sx={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 1 }}>
                                <Box sx={{ flexShrink: 0, bgcolor: "#F3F4F6", border: "1px solid #E5E7EB", borderRadius: 1, px: 0.7, py: 0.15 }}>
                                  <Typography sx={{ fontSize: 10, fontWeight: 700, fontFamily: "monospace", color: "#374151", whiteSpace: "nowrap" }}>{p.item_id}</Typography>
                                </Box>
                                <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  <Highlight text={p.item_name} query={codeInput} />
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: idx === suggestionIdx ? "#1D4ED8" : "#111827" }}>₹{Number(p.sell_price).toLocaleString("en-IN")}</Typography>
                                <Typography sx={{ fontSize: 9, color: p.tax_inclusive ? "#D97706" : "#9CA3AF", fontWeight: p.tax_inclusive ? 700 : 400, lineHeight: 1 }}>/ per {p.unit || "NOS"}</Typography>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      )}
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 1.5, py: 0.85, bgcolor: "#FCFCFD", borderTop: "1px solid #EEF2F7" }}>
                        <Typography sx={{ fontSize: 9, color: "#9CA3AF", fontWeight: 700 }}>Type to search by item id, name or category</Typography>
                        <Button size="small" variant="contained" onMouseDown={(e) => { e.preventDefault(); setShowSuggestions(false); setAddItemOpen(true); }} sx={{ bgcolor: modeAccent, fontSize: 9, fontWeight: 800, borderRadius: 1.5, px: 1.1, py: 0.45, "&:hover": { bgcolor: modeTheme.accentHover } }}>+ Add Menu Item</Button>
                      </Box>
                    </Paper>
                  )}
                </Box>
                <Button variant="contained" startIcon={<AddShoppingCartIcon />} onClick={() => handleAddItem()}
                  sx={{ flex: { xs: 1, md: "initial" }, bgcolor: modeAccent, color: "#fff", px: { xs: 1.5, md: 2.5 }, py: 0.9, fontSize: { xs: 12, md: 13 }, fontWeight: 700, borderRadius: 1.5, minHeight: 38, whiteSpace: "nowrap", boxShadow: `0 4px 14px ${modeTheme.shadow}`, "&:hover": { bgcolor: modeTheme.accentHover }, "&:active": { transform: "scale(0.97)" } }}>
                  ADD ITEM <Box component="span" sx={{ display: { xs: "none", md: "inline" }, fontSize: 10, opacity: 0.8, ml: 0.4 }}>[Enter]</Box>
                </Button>
                {items.length > 0 && (
                  <Button variant="outlined" startIcon={<DeleteOutlineIcon sx={{ fontSize: 16 }} />} onClick={handleClear}
                    sx={{ borderColor: "#E5E7EB", color: "#6B7280", px: { xs: 1.1, md: 1.75 }, py: 0.9, fontSize: { xs: 11, md: 12 }, fontWeight: 700, borderRadius: 1.5, minHeight: 38, whiteSpace: "nowrap", "&:hover": { borderColor: "#C8102E", color: "#C8102E", bgcolor: "#FEF2F2" } }}>
                    CLEAR <Box component="span" sx={{ display: { xs: "none", md: "inline" }, fontSize: 10, opacity: 0.8, ml: 0.4 }}>[F4]</Box>
                  </Button>
                )}
                {isMobileOrTablet && (
                  <Tooltip title="Scan with camera">
                    <IconButton size="small" onClick={() => setCameraScanOpen(true)}
                      sx={{ flexShrink: 0, border: "1px solid #E5E7EB", borderRadius: 1.5, color: modeAccent, height: 38, width: 38 }}>
                      <CameraAltOutlinedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Paper>

          {/* ORDER TABLE */}
          <Paper elevation={0} sx={{ flex: 1, minHeight: { xs: "auto", lg: 0 }, display: "flex", flexDirection: "column", border: zone === "TABLE" ? "2px solid #1976d2" : "1px solid #E5E7EB", borderRadius: 2, overflow: "hidden", transition: "border 0.2s", boxShadow: zone === "TABLE" ? "0 0 0 3px rgba(245,158,11,0.1)" : "none" }}>
            {isCompactTable ? (
              /* Below `lg` an 11-column table doesn't work on touch even with horizontal
                 scroll — each item renders as its own card instead, with the qty/rate/
                 discount controls reused as-is from renderQtyControl/renderRateControl/
                 renderDiscountControl so the editing behavior stays identical to desktop. */
              <Box sx={{ flex: 1, minHeight: "auto", display: "flex", flexDirection: "column" }}>
                {items.length === 0 ? (
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, color: "#D1D5DB", py: 6 }}>
                    <KeyboardReturnIcon sx={{ fontSize: 32 }} />
                    <Typography sx={{ fontSize: 13 }}>Search and add items above</Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.85, p: 1 }}>
                    {items.map((item, rowIdx) => {
                      const isActive  = zone === "TABLE" && activeRowIdx === rowIdx;
                      const itemGst   = round2((item.qty * item.unitPrice * item.gstPct) / 100);
                      const itemTotal = round2(item.qty * item.unitPrice + itemGst - (item.discount ?? 0));
                      return (
                        <Fade in key={item.code}>
                          <Paper
                            data-rowcode={item.code}
                            elevation={0}
                            onClick={() => { setZone("TABLE"); setActiveRowIdx(rowIdx); }}
                            sx={{
                              border: isActive ? "1.5px solid #1976D2" : "1px solid #E5E7EB",
                              borderRadius: 2, p: 1.1, cursor: "pointer", transition: "background 0.2s, border-color 0.2s",
                              bgcolor: flashRow === item.code ? "#FFF1F3" : isActive ? "#E3F2FD" : "#fff",
                            }}
                          >
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
                              <Box sx={{ minWidth: 0 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                                  <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: "#9CA3AF" }}>{item.code}</Typography>
                                  {item.category && (
                                    <>
                                      <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "#D1D5DB" }} />
                                      <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: CAT_COLOR[item.category] ?? "#6B7280" }}>{item.category}</Typography>
                                    </>
                                  )}
                                </Box>
                                <Typography sx={{ fontSize: 14, fontWeight: isActive ? 800 : 700, color: "#1A1A2E", lineHeight: 1.3 }}>{item.description}</Typography>
                                <TextField
                                  value={item.itemDescription ?? ""}
                                  onChange={e => updateItemDescription(item.code, e.target.value)}
                                  onKeyDown={e => e.stopPropagation()}
                                  placeholder="Add description..."
                                  size="small"
                                  variant="outlined"
                                  fullWidth
                                  multiline
                                  maxRows={2}
                                  sx={{
                                    mt: 0.5,
                                    "& .MuiOutlinedInput-root": { fontSize: 12, bgcolor: "#FAFAFA", minHeight: 38, padding: "3px 6px", alignItems: "flex-start", "& fieldset": { borderColor: "#E5E7EB" } },
                                    "& .MuiOutlinedInput-input": { padding: 0 },
                                  }}
                                />
                              </Box>
                              <IconButton size="small" onClick={e => { e.stopPropagation(); removeItem(item.code); }} sx={{ flexShrink: 0, color: "#D1D5DB", p: 0.4, "&:hover": { color: "#C8102E", bgcolor: "#FEE2E2" } }}><DeleteOutlineIcon sx={{ fontSize: 16 }} /></IconButton>
                            </Box>

                            <Divider sx={{ my: 0.85 }} />

                            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1.5, flexWrap: "wrap" }} onClick={e => e.stopPropagation()}>
                              <Box>
                                <Typography sx={{ fontSize: 9, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", mb: 0.2 }}>Qty</Typography>
                                {renderQtyControl(item, rowIdx, isActive)}
                              </Box>
                              <Box sx={{ textAlign: "right" }}>
                                <Typography sx={{ fontSize: 9, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", mb: 0.2 }}>Rate</Typography>
                                {renderRateControl(item, rowIdx, isActive)}
                              </Box>
                            </Box>

                            <Divider sx={{ my: 0.85 }} />

                            {/* Secondary specs flow naturally instead of a rigid 2-col grid — a
                                short value (e.g. "—" for no discount) no longer leaves a whole
                                half-width cell looking empty. */}
                            <Box sx={{ display: "flex", flexWrap: "wrap", rowGap: 0.6, columnGap: 2 }}>
                              <Box>
                                <Typography sx={{ fontSize: 9, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase" }}>MRP</Typography>
                                <Typography sx={{ fontSize: 12.5, color: "#9CA3AF" }}>₹{item.mrp.toLocaleString("en-IN")}</Typography>
                              </Box>
                              <Box>
                                <Typography sx={{ fontSize: 9, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase" }}>Unit Price</Typography>
                                <Typography sx={{ fontSize: 12.5, color: "#374151", fontWeight: 600 }}>{INR(item.unitPrice)}</Typography>
                              </Box>
                              <Box>
                                <Typography sx={{ fontSize: 9, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase" }}>Tax (GST {item.gstPct}%)</Typography>
                                <Typography sx={{ fontSize: 12.5, color: "#374151", fontWeight: 700 }}>{INR(itemGst)}</Typography>
                              </Box>
                              <Box onClick={e => e.stopPropagation()}>
                                <Typography sx={{ fontSize: 9, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", mb: 0.2 }}>Discount</Typography>
                                {renderDiscountControl(item, rowIdx, isActive)}
                              </Box>
                            </Box>

                            <Divider sx={{ my: 0.85 }} />

                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#6B7280" }}>Total</Typography>
                              <Typography sx={{ fontSize: 16, fontWeight: 800, color: isActive ? "#0D47A1" : "#1A1A2E" }}>{INR(itemTotal)}</Typography>
                            </Box>
                          </Paper>
                        </Fade>
                      );
                    })}
                  </Box>
                )}

                {/* Quick glance total — the full breakdown (subtotal, discount, tax,
                    round off) already lives in the SUMMARY card just below, so this
                    strip only needs the two numbers useful while scrolling the list. */}
                {items.length > 0 && (
                  <Box sx={{ borderTop: "1px solid #E5E7EB", bgcolor: "#F8FAFC", p: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#6B7280" }}>{items.length} item{items.length > 1 ? "s" : ""}</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#000" }}>Total: {INR(totalAmtRow)}</Typography>
                  </Box>
                )}
              </Box>
            ) : (
              <>
                <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden", scrollbarWidth: "thin", scrollbarColor: "#ea9999 #F3F4F6", "&::-webkit-scrollbar": { width: "8px" }, "&::-webkit-scrollbar-track": { backgroundColor: "#F3F4F6", borderRadius: "4px" }, "&::-webkit-scrollbar-thumb": { backgroundColor: "#ea9999", borderRadius: "4px", "&:hover": { backgroundColor: "#A50D26" } } }}>
                  <Table size="small" stickyHeader sx={{ borderCollapse: "separate", tableLayout: "fixed", width: "100%" }}>
                    <CartColGroup />
                    <TableHead>
                      <TableRow sx={{ "& .MuiTableCell-root": { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", px: 1 } }}>
                        <TableCell sx={{ p: 0 }} />
                        <TableCell sx={{ fontSize: 12 }}>ITEM ID</TableCell>
                        <TableCell sx={{ fontSize: 12 }}>DESCRIPTION</TableCell>
                        {/* "TAX AMT (GST %)" never fit this column and printed as an
                            ellipsis — the per-row chip carries the rate anyway. */}
                        <TableCell align="right" sx={{ fontSize: 12 }}>TAX (GST%)</TableCell>
                        <TableCell align="right" sx={{ fontSize: 12 }}>MRP (₹)</TableCell>
                        <TableCell align="center" sx={{ fontSize: 12 }}><Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.4 }}>QTY <Kbd>Q</Kbd></Box></TableCell>
                        <TableCell align="right" sx={{ fontSize: 12 }}><Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.4 }}>RATE <Kbd>P</Kbd></Box></TableCell>
                        <TableCell align="right" sx={{ fontSize: 12 }}>UNIT PRICE</TableCell>
                        <TableCell align="right" sx={{ fontSize: 12 }}><Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.4 }}>DISC % <Kbd>D</Kbd></Box></TableCell>
                        <TableCell align="right" sx={{ fontSize: 12 }}>TOTAL</TableCell>
                        <TableCell />
                      </TableRow>
                    </TableHead>
                    <TableBody ref={tableBodyRef}>
                      {items.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={11} align="center" sx={{ py: 6 }}>
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, color: "#D1D5DB" }}>
                              <KeyboardReturnIcon sx={{ fontSize: 32 }} />
                              <Typography sx={{ fontSize: 13 }}>Search and add items above</Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                      {items.map((item, rowIdx) => {
                        const isActive  = zone === "TABLE" && activeRowIdx === rowIdx;
                        const itemGst   = round2((item.qty * item.unitPrice * item.gstPct) / 100);
                        const itemTotal = round2(item.qty * item.unitPrice + itemGst - (item.discount ?? 0));
                        return (
                          <Fade in key={item.code}>
                            <TableRow data-rowcode={item.code} onClick={() => { setZone("TABLE"); setActiveRowIdx(rowIdx); }}
                              sx={{ bgcolor: flashRow === item.code ? "#FFF1F3" : isActive ? "#E3F2FD" : "transparent", cursor: "pointer", transition: "background 0.2s", "&:hover": { bgcolor: isActive ? "#E3F2FD" : "#F5F5F5" } }}>
                              <TableCell sx={{ p: 0 }}><Box sx={{ width: 4, minHeight: 40, bgcolor: isActive ? "#1976D2" : "transparent", borderRadius: "0 2px 2px 0", transition: "background 0.2s" }} /></TableCell>
                              <TableCell sx={{ overflow: "hidden" }}>
                                {/* Item IDs are free text and are often wordy
                                    ("Oil Extraction 20KG"). Wrap inside the column
                                    rather than letting one spill across the
                                    description next to it; `title` keeps the full
                                    value reachable on hover. */}
                                <Typography
                                  title={item.code}
                                  sx={{ fontSize: 12, fontWeight: 700, color: "#374151", lineHeight: 1.3, overflowWrap: "anywhere" }}
                                >
                                  {item.code}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography sx={{ fontSize: 13, fontWeight: isActive ? 800 : 700, color: "#1A1A2E", lineHeight: 1.3, overflowWrap: "anywhere" }}>{item.description}</Typography>
                                {item.category && <Typography sx={{ fontSize: 10, fontWeight: 700, color: CAT_COLOR[item.category] ?? "#6B7280" }}>{item.category}</Typography>}
                                <TextField
                                  value={item.itemDescription ?? ""}
                                  onChange={e => updateItemDescription(item.code, e.target.value)}
                                  onClick={e => e.stopPropagation()}
                                  onKeyDown={e => e.stopPropagation()}
                                  placeholder="Add description..."
                                  size="medium"
                                  variant="outlined"
                                  fullWidth

                                  multiline
                                  maxRows={3}
                                  sx={{
                                    mt: 0.5,
                                    verticalAlign: "top",
                                    "& .MuiOutlinedInput-root": { fontSize: 12, bgcolor: "#FAFAFA", minHeight: 50, padding: "4px 6px", alignItems: "flex-start", "& fieldset": { borderColor: "#E5E7EB" } },
                                    "& .MuiOutlinedInput-input": { padding: 0.3 },
                                  }}
                                />
                              </TableCell>
                              <TableCell align="right">
                                <Typography sx={{ fontSize: 13, color: "#374151", fontWeight: 700, lineHeight: 1.2, whiteSpace: "nowrap" }}>{INR(itemGst)}</Typography>
                                <Box component="span" sx={{ display: "inline-block", fontSize: 9.5, fontWeight: 700, color: "#6B7280", bgcolor: "#F3F4F6", borderRadius: 999, px: 0.7, py: 0.05, mt: 0.2 }}>GST {item.gstPct}%</Box>
                              </TableCell>
                              <TableCell align="right"><Typography sx={{ fontSize: 13, color: "#9CA3AF", whiteSpace: "nowrap" }}>₹{item.mrp.toLocaleString("en-IN")}</Typography></TableCell>

                              {/* QTY */}
                              <TableCell align="center" onClick={e => e.stopPropagation()}>
                                {renderQtyControl(item, rowIdx, isActive)}
                              </TableCell>

                              {/* RATE */}
                              <TableCell align="right" onClick={e => e.stopPropagation()}>
                                {renderRateControl(item, rowIdx, isActive)}
                              </TableCell>

                              {/* UNIT PRICE EX.TAX */}
                              <TableCell align="right"><Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>{INR(item.unitPrice)}</Typography></TableCell>

                              {/* DISCOUNT % */}
                              <TableCell align="right" onClick={e => e.stopPropagation()}>
                                {renderDiscountControl(item, rowIdx, isActive)}
                              </TableCell>

                              {/* TOTAL */}
                              <TableCell align="right">
                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: isActive ? "#0D47A1" : "#1A1A2E", whiteSpace: "nowrap" }}>{INR(itemTotal)}</Typography>
                              </TableCell>
                              <TableCell onClick={e => e.stopPropagation()}><IconButton size="small" onClick={() => removeItem(item.code)} sx={{ color: "#D1D5DB", "&:hover": { color: "#C8102E", bgcolor: "#FEE2E2" } }}><DeleteOutlineIcon sx={{ fontSize: 15 }} /></IconButton></TableCell>
                            </TableRow>
                          </Fade>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Box>

                {/* Total row pinned to bottom */}
                <Table size="small" sx={{ borderCollapse: "separate", flexShrink: 0, tableLayout: "fixed", width: "100%" }}>
                  <CartColGroup />
                  <TableBody>
                    <TableRow sx={{ bgcolor: "#F8FAFC", "& .MuiTableCell-root": { borderTop: "2px solid #E5E7EB", borderBottom: "none", py: 1, height: 34, bgcolor: "#F8FAFC" } }}>
                      <TableCell sx={{ p: 0 }} /><TableCell />
                      <TableCell><Typography sx={{ fontSize: 13, fontWeight: 800, color: "#374151" }}>Total</Typography></TableCell>
                      <TableCell align="right"><Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>{INR(items.length > 0 ? totalGstRow : 0)}</Typography></TableCell>
                      <TableCell align="right" />
                      <TableCell align="center"><Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{items.length > 0 ? totalUnits : 0}</Typography></TableCell>
                      <TableCell align="right" />
                      <TableCell align="right"><Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>{INR(items.length > 0 ? subtotal : 0)}</Typography></TableCell>
                      <TableCell align="right">
                        {items.length > 0 && itemDiscountTotal > 0
                          ? <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#C8102E" }}>- {INR(itemDiscountTotal)}</Typography>
                          : <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#D1D5DB" }}>—</Typography>
                        }
                      </TableCell>
                      <TableCell align="right"><Typography sx={{ fontSize: 13, fontWeight: 700, color: "#000", whiteSpace: "nowrap" }}>{INR(items.length > 0 ? totalAmtRow : 0)}</Typography></TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </>
            )}
          </Paper>

            {/* Customer panel — search row + Bill To / Ship To cards */}
            <Paper elevation={0} sx={{ flexShrink: 0, border: zone === "CUSTOMER" ? `2px solid ${modeAccent}` : "1px solid #E5E7EB", borderRadius: 2.5, p: { xs: 1.75, sm: 2.25 },  bgcolor: "#fff", transition: "border 0.2s, box-shadow 0.2s", position: "relative", boxShadow: zone === "CUSTOMER" ? `0 0 0 3px ${modeTheme.focusRing}` : "none" }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1.5, mb: 0.8 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
                  <PersonSearchIcon sx={{ fontSize: 15, color: modeAccent }} />
                  <Typography sx={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color: "#374151" }}>CUSTOMER</Typography>
                  {customer.id && <Chip label="Clear Customer" size="small" onDelete={() => { setCustomer(EMPTY_CUSTOMER); setSelectedApiCustomer(null); setCustomerQuery(""); clearCustomerResults(); }} sx={{ fontSize: 9, height: 18, bgcolor: "#FEE2E2", color: "#C8102E", fontWeight: 700 }} />}
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Button disabled={!customer.id} size="small" variant="outlined" onClick={() => setCustomerLedgerOpen(true)} sx={{ borderColor: modeBorder, color: modeAccent, fontSize: 9, fontWeight: 800, px: 1.25, py: 0.55, borderRadius: 1.5, minWidth: 0, whiteSpace: "nowrap", "&:hover": { borderColor: modeAccent, bgcolor: modeBg } }}>View Ledger / History</Button>
                </Box>
              </Box>

              {/* Search / autocomplete row — one field searches by name, company or mobile.
                  Vehicle No only joins the row when the transport copy is enabled. */}
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: showVehicleNo ? "1.4fr 1fr 1fr auto" : "1fr 1fr auto" }, gap: 1, alignItems: "center" }}>
                <Box sx={{ position: "relative" }}>
                  <TextField inputRef={customerNameRef} value={customerQuery} onChange={e => handleCustomerQueryChange(e.target.value)} onFocus={() => { setZone("CUSTOMER"); if (customer.id) { setCustomerQuery(""); clearCustomerResults(); } else if (customerQuery.trim()) { setCustomerSuggestionsOpen(true); setCustomerSuggestionIdx(-1); } }} onBlur={() => setTimeout(() => setCustomerSuggestionsOpen(false), 180)} placeholder="Search by name, company or mobile" size="small" autoComplete="off" fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.75, fontSize: 12, bgcolor: "#F8FAFC", "& fieldset": { borderColor: "#E2E8F0" }, "&:hover fieldset": { borderColor: modeAccent }, "&.Mui-focused fieldset": { borderColor: modeAccent } } }} inputProps={{ style: { padding: "7px 12px", fontWeight: 500 } }} />

                  {customerSuggestionsOpen && customerQuery.trim() && (
                    <Paper elevation={8} sx={{ position: "absolute", bottom: "calc(100% + 4px)", left: 0, right: 0, zIndex: 9998, borderRadius: 2, border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 -16px 40px rgba(15,23,42,0.16)" }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, px: 1.5, py: 1, bgcolor: modeAccent }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.7, minWidth: 0 }}>
                          <PersonSearchIcon sx={{ fontSize: 14, color: "#fff", flexShrink: 0 }} />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: "#fff", letterSpacing: "0.07em" }}>CUSTOMER SEARCH</Typography>
                            <Typography sx={{ fontSize: 9.5, fontWeight: 600, color: "#fff", whiteSpace: "nowrap" }}>Select to auto-fill mobile, address and GSTIN.</Typography>
                          </Box>
                        </Box>
                        {customerLoading
                          ? <CircularProgress size={12} sx={{ color: "#fff" }} />
                          : <Box sx={{ px: 0.9, py: 0.25, borderRadius: 999, bgcolor: "rgba(255,255,255,0.18)" }}>
                              <Typography sx={{ fontSize: 9, fontWeight: 800, color: "#fff", whiteSpace: "nowrap" }}>{customerResults.length} result{customerResults.length !== 1 ? "s" : ""}</Typography>
                            </Box>
                        }
                      </Box>
                      {!customerLoading && customerResults.length === 0
                        ? <Box sx={{ px: 2, py: 3, textAlign: "center" }}><Typography sx={{ fontSize: 12, color: "#9CA3AF" }}>No matching customers found.</Typography></Box>
                        : <Box ref={customerSuggestionListRef} sx={{ maxHeight: 280, overflowY: "auto", bgcolor: "#fff" }}>
                            {customerResults.map((c, idx) => (
                              <Box key={c.cust_uuid} onMouseDown={() => handleSelectCustomer(c)} sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1, px: 1.5, py: 1.1, borderBottom: "1px solid #F8FAFC", cursor: "pointer", bgcolor: idx === customerSuggestionIdx ? modeTheme.tint : "#fff", borderLeft: idx === customerSuggestionIdx ? `3px solid ${modeAccent}` : "3px solid transparent", "&:hover": { bgcolor: modeTheme.tint } }}>
                                <Box sx={{ minWidth: 0 }}>
                                  {c.cust_name && <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#1F2937", lineHeight: 1.3 }}>{c.cust_name}</Typography>}
                                  {c.cpy_name && <Typography sx={{ fontSize: 11, fontWeight: 600, color: c.cust_name ? "#6B7280" : "#1F2937", lineHeight: 1.3 }}>{c.cust_name ? `🏢 ${c.cpy_name}` : c.cpy_name}</Typography>}
                                  <Typography sx={{ fontSize: 10, color: "#9CA3AF", mt: 0.2 }}>{primaryMobile(c)}{c.city ? ` • ${c.city}` : ""}</Typography>
                                </Box>
                                {c.gst && <Typography sx={{ fontSize: 9, fontWeight: 700, color: "#6B7280", fontFamily: "monospace", whiteSpace: "nowrap" }}>{c.gst}</Typography>}
                              </Box>
                            ))}
                          </Box>
                      }
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 1.5, py: 0.85, bgcolor: "#FCFCFD", borderTop: "1px solid #EEF2F7" }}>
                        <Typography sx={{ fontSize: 9, color: "#9CA3AF", fontWeight: 700 }}>Type to search by name or mobile</Typography>
                        <Button size="small" variant="contained" onClick={() => { setCustomerSuggestionsOpen(false); setSelectedApiCustomer(null); setAddCustomerOpen(true); }} sx={{ bgcolor: modeAccent, fontSize: 9, fontWeight: 800, borderRadius: 1.5, px: 1.1, py: 0.45, "&:hover": { bgcolor: modeTheme.accentHover } }}>+ Add New</Button>
                      </Box>
                    </Paper>
                  )}
                </Box>
                <TextField
                  value={customer.gstin}
                  placeholder="GSTIN"
                  size="small"
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography sx={{ fontSize: 10, fontWeight: 800, color: "#9CA3AF", letterSpacing: "0.06em" }}>GSTIN</Typography>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.75, fontSize: 12, bgcolor: "#F8FAFC", "& fieldset": { borderColor: "#E2E8F0" } } }}
                  inputProps={{ style: { padding: "7px 12px", fontWeight: 600, fontFamily: "monospace", letterSpacing: "0.03em" } }}
                />
                {showVehicleNo && (
                  <TextField
                    value={vehicleNo}
                    onChange={e => setVehicleNo(e.target.value.toUpperCase())}
                    onFocus={() => setZone("CUSTOMER")}
                    placeholder="Vehicle No"
                    size="small"
                    fullWidth
                    autoComplete="off"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalShippingOutlinedIcon sx={{ fontSize: 14, color: "#9CA3AF" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.75, fontSize: 12, bgcolor: "#F8FAFC", "& fieldset": { borderColor: "#E2E8F0" }, "&:hover fieldset": { borderColor: modeAccent }, "&.Mui-focused fieldset": { borderColor: modeAccent } } }}
                    inputProps={{ style: { padding: "7px 12px", fontWeight: 600, fontFamily: "monospace", letterSpacing: "0.03em" }, maxLength: 20 }}
                  />
                )}
                <Button size="small" variant="contained" onClick={() => setAddCustomerOpen(true)} sx={{ bgcolor: modeAccent, fontSize: 11, fontWeight: 800, borderRadius: 1.5, px: 1.5, py: 0.85, whiteSpace: "nowrap", "&:hover": { bgcolor: modeTheme.accentHover } }}>{customer.id ? "Edit Customer" : "+ Add New"}</Button>
              </Box>

              {/* Bill To / Ship To visual cards (read-only summary of the same customer record) */}
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1, mt: 0.9, position: "relative" }}>
                <Box sx={{ border: "1px solid #E5E7EB", borderRadius: 2, p: 0.85, bgcolor: "#F9FAFB" }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.35 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <DescriptionOutlinedIcon sx={{ fontSize: 12, color: "#C8102E" }} />
                      <Typography sx={{ fontSize: 8.5, fontWeight: 800, letterSpacing: "0.08em", color: "#9CA3AF" }}>BILL TO</Typography>
                    </Box>
                    <IconButton size="small" onClick={() => { setCustomerQuery(""); clearCustomerResults(); customerNameRef.current?.focus(); }} sx={{ p: 0.2, color: "#9CA3AF", "&:hover": { color: modeAccent, bgcolor: modeBg } }}>
                      <EditIcon sx={{ fontSize: 12 }} />
                    </IconButton>
                  </Box>
                  {customer.name && <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#1F2937", lineHeight: 1.25 }}>{customer.name}</Typography>}
                  {customer.mobile && <Typography sx={{ fontSize: 11, color: "#6B7280", mt: 0.1 }}>{customer.mobile}</Typography>}
                  <Typography sx={{ fontSize: 10, color: "#9CA3AF", mt: 0.1 }}>{customer.address || "No address on file"}</Typography>
                  {customer.gstin && <Typography sx={{ fontSize: 9, color: "#6B7280", fontFamily: "monospace", mt: 0.1 }}>GSTIN: {customer.gstin}</Typography>}
                </Box>

                <Box sx={{ border: "1px solid #E5E7EB", borderRadius: 2, p: 0.85, bgcolor: "#F9FAFB", position: "relative" }}>
                  <Box sx={{ position: "absolute", left: -15, top: "50%", transform: "translateY(-50%)", display: { xs: "none", sm: "flex" }, alignItems: "center", justifyContent: "center", width: 22, height: 22, bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "50%", color: "#9CA3AF" }}>
                    <SwapHorizIcon sx={{ fontSize: 12 }} />
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.35 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <LocalShippingOutlinedIcon sx={{ fontSize: 12, color: "#C8102E" }} />
                      <Typography sx={{ fontSize: 8.5, fontWeight: 800, letterSpacing: "0.08em", color: "#9CA3AF" }}>SHIP TO</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                      <Box sx={{ width: 13, height: 13, borderRadius: 0.5, border: `1.5px solid ${shipSameAsBilling ? modeAccent : "#D1D5DB"}`, bgcolor: shipSameAsBilling ? modeAccent : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {shipSameAsBilling && <Box sx={{ width: 6, height: 6, bgcolor: "#fff", borderRadius: 0.25 }} />}
                      </Box>
                      <Typography sx={{ fontSize: 8.5, color: "#6B7280", fontWeight: 600 }}>Same as Billing</Typography>
                    </Box>
                  </Box>
                  {customer.name && <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#1F2937", lineHeight: 1.25 }}>{customer.name}</Typography>}
                  {customer.mobile && <Typography sx={{ fontSize: 11, color: "#6B7280", mt: 0.1 }}>{customer.mobile}</Typography>}
                  <Typography sx={{ fontSize: 10, color: "#9CA3AF", mt: 0.1 }}>
                    {shipSameAsBilling ? (customer.address || "No address on file") : (customer.shippingAddress || "No shipping address on file")}
                  </Typography>
                </Box>
              </Box>
            </Paper>
        </Box>

          {/* ─────────────────────── RIGHT COLUMN (SIDEBAR) ─────────────────────── */}
          <Box sx={{ width: { xs: "100%", lg: 340, xl: 360 }, flexShrink: 0, minHeight: { xs: "auto", lg: 0 }, display: "flex", flexDirection: "column", gap: { xs: 0.6, sm: 0.75 }, overflow: { xs: "visible", lg: "hidden" } }}>

          <Box sx={{ flex: "1 1 auto", minHeight: { xs: "auto", lg: 0 }, overflowY: { xs: "visible", lg: "auto" }, display: "flex", flexDirection: "column", gap: { xs: 1, sm: 1.25 } }}>

            {/* SUMMARY card */}
            <Paper elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 2.5, p: 2.25, bgcolor: "#fff" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 2 }}>
                <Typography sx={{ fontSize: 14.5, fontWeight: 800, letterSpacing: "0.06em", color: "#374151" }}>SUMMARY</Typography>
                <Box onClick={handleOpenPicker}
                  sx={{ display: "flex", alignItems: "center", gap: 0.6, bgcolor: modeTheme.chipBg, border: `1px solid ${modeTheme.accent}`, borderRadius: 1.5, px: 1, py: 0.4, transition: "all 0.2s", cursor: "pointer", whiteSpace: "nowrap", position: "relative" }}>
                  <CalendarTodayIcon sx={{ fontSize: 14, color: modeTheme.accent, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: 10, color: modeTheme.accent, fontWeight: 700, letterSpacing: "0.04em" }}>
                    {posTypeLabel.toUpperCase()} DATE
                  </Typography>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: modeTheme.accent, whiteSpace: "nowrap" }}>
                    {invoiceDate ? formatDateDisplay(invoiceDate) : "Select date"}
                  </Typography>
                  <input ref={inputRef} type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} style={{ position: "absolute", opacity: 0, pointerEvents: "none" }} />
                </Box>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.6 }}>
                <Typography sx={{ fontSize: 13.5, color: "#6B7280" }}>Total Items</Typography>
                <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#111827" }}>{items.length}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.6 }}>
                <Typography sx={{ fontSize: 13.5, color: "#6B7280" }}>Sub Total</Typography>
                <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#111827" }}>{INR(items.length > 0 ? subtotal : 0)}</Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.6, gap: 1 }}>
                <Typography sx={{ fontSize: 13.5, color: "#6B7280", whiteSpace: "nowrap" }}>Discount {gstMode === "before" && "(Before GST)"}</Typography>
                {hasDiscount ? (
                  <Box onClick={() => setDiscountModalOpen(true)}
                    sx={{ display: "flex", alignItems: "center", gap: 0.6, pl: 1, pr: 0.5, py: 0.3, borderRadius: 999, bgcolor: "#FEE2E2", cursor: "pointer", "&:hover": { bgcolor: "#FECACA" }, transition: "background 0.15s" }}>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: "#C8102E", whiteSpace: "nowrap" }}>
                      {discountBadge} · - ₹{(orderDiscountAmt + itemDiscountTotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </Typography>
                    <IconButton size="small"
                      onClick={(e) => { e.stopPropagation(); setDiscountPct("0"); setDiscount("0"); }}
                      sx={{ p: 0.2, color: "#C8102E", "&:hover": { bgcolor: "#FCA5A5" } }}>
                      <CloseIcon sx={{ fontSize: 12 }} />
                    </IconButton>
                  </Box>
                ) : (
                  <Button onClick={() => setDiscountModalOpen(true)} disabled={items.length === 0} size="small" startIcon={<AddCircleOutlineIcon sx={{ fontSize: 15 }} />}
                    sx={{ minWidth: 0, px: 1.25, py: 0.35, fontSize: 10.5, fontWeight: 500, color: modeAccent, borderRadius: 999, bgcolor: modeBg, "&:hover": { bgcolor: "#FEE2E2" }, "&.Mui-disabled": { color: "#B0B7C4", bgcolor: "#F3F4F6" } }}>
                    Add Discount
                  </Button>
                )}
              </Box>

              {gstAmount > 0 && (
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.6 }}>
                  <Typography sx={{ fontSize: 13.5, color: "#6B7280" }}>Tax (GST)</Typography>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#111827" }}>{INR(gstAmount)}</Typography>
                </Box>
              )}

              {!isNonSaleDoc && (
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography sx={{ fontSize: 13.5, color: "#6B7280" }}>Round Off</Typography>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: roundoffValue > 0 ? "#16A34A" : "#C8102E" }}>
                    {roundoffValue > 0 ? "+" : ""}{roundoffValue.toFixed(2)}
                  </Typography>
                </Box>
              )}

              {/* TOTAL AMOUNT highlighted bar */}
              <Box sx={{ bgcolor: modeTheme.totalBg, border: `1px solid ${modeTheme.totalBorder}`, borderRadius: 2, px: 1.5, py: 1.1, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", rowGap: 0.25, columnGap: 1, mb: 2 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.05em", color: modeTheme.totalText, whiteSpace: "nowrap" }}>TOTAL AMOUNT</Typography>
                <Typography sx={{ fontSize: 20, fontWeight: 900, color: modeTheme.totalText, whiteSpace: "nowrap" }}>{INR(grandTotal)}</Typography>
              </Box>

              {!isNonSaleDoc && (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, mb: 0.6 }}>
                      <Typography sx={{ fontSize: 11.5, color: "#9CA3AF", fontWeight: 700, letterSpacing: "0.05em" }}>RECEIVED AMOUNT</Typography>
                      <Tooltip title={`Total due: ${INR(grandTotal)}`}>
                        <InfoOutlinedIcon sx={{ fontSize: 13, color: "#D1D5DB" }} />
                      </Tooltip>
                    </Box>
                    <TextField
                      inputRef={receivedRef}
                      value={receivedAmount}
                      onChange={e => { setReceivedDirty(true); setReceivedAmount(e.target.value.replace(/[^0-9.]/g, "")); }}
                      onFocus={() => { setZone("FOOTER"); setFooterFocus("RECEIVED"); }}
                      placeholder="0.00" size="small" fullWidth
                      InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                      inputProps={{ style: { fontWeight: 800, fontSize: 16, textAlign: "right" } }}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5, "& fieldset": { borderColor: isFooterActive("RECEIVED") ? "#C8102E" : "#E5E7EB", borderWidth: isFooterActive("RECEIVED") ? 2 : 1 }, "&:hover fieldset": { borderColor: "#C8102E" } } }}
                    />
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ fontSize: 13.5, color: "#6B7280" }}>Balance Due</Typography>
                    <Typography sx={{ fontSize: 15, fontWeight: 800, color: received >= grandTotal ? "#16A34A" : "#C8102E" }}>
                      {INR(Math.max(0, grandTotal - received))}
                    </Typography>
                  </Box>
                </>
              )}
            </Paper>

            {/* PAYMENT DETAILS card */}
            {!isNonSaleDoc && (
              <Paper elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 2.5, p: 2.25, bgcolor: "#fff", flex: 1 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.06em", color: "#374151", mb: 2 }}>PAYMENT DETAILS</Typography>

                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.75, mb: 2 }}>
                  {enabledPaymentTypes.map(val => {
                    const selected = paymentType === val;
                    const Icon = PAYMENT_TYPE_ICON[val];
                    return (
                      <Box key={val} onClick={() => { setPaymentType(val); setZone("FOOTER"); setFooterFocus("PAYMENT_TYPE"); }}
                        sx={{
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 0.6,
                          border: `1.5px solid ${selected ? modeAccent : "#E5E7EB"}`, borderRadius: 999, py: 0.85, px: 1, cursor: "pointer",
                          bgcolor: selected ? `${modeAccent}0D` : "#FAFAFA", transition: "all 0.15s",
                          "&:hover": { borderColor: modeAccent, bgcolor: `${modeAccent}0D` },
                        }}>
                        <Icon sx={{ fontSize: 18, color: selected ? modeAccent : "#6B7280" }} />
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: selected ? modeAccent : "#6B7280", whiteSpace: "nowrap" }}>{val}</Typography>
                      </Box>
                    );
                  })}
                </Box>
                {/* Hidden select preserves existing FOOTER zone keyboard nav (arrow keys / Enter) for payment type.
                    Must be "1px" not the bare number 1 — MUI's sx treats a 0-1 width/height number as a
                    percentage (1 = 100%), which was silently stretching this to full container width. */}
                <Select value={paymentType} onChange={e => setPaymentType(e.target.value as PaymentType)} onFocus={() => { setZone("FOOTER"); setFooterFocus("PAYMENT_TYPE"); }}
                  sx={{ position: "absolute", width: "1px", height: "1px", opacity: 0, pointerEvents: "none" }} tabIndex={-1}>
                  {enabledPaymentTypes.map(val => <MenuItem key={val} value={val}>{val}</MenuItem>)}
                </Select>

                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ fontSize: 11.5, color: "#9CA3AF", fontWeight: 700, letterSpacing: "0.06em", mb: 1.5 }}>REFERENCE NO.</Typography>
                  <TextField inputRef={refNoRef} value={referenceNo} onChange={e => setReferenceNo(e.target.value)} onFocus={() => { setZone("FOOTER"); setFooterFocus("REF_NO"); }} placeholder="Transaction ID" size="small" fullWidth
                    inputProps={{ style: { padding: "8px 10px", fontSize: 13.5 } }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5, "& fieldset": { borderColor: isFooterActive("REF_NO") ? "#C8102E" : "#E5E7EB", borderWidth: isFooterActive("REF_NO") ? 2 : 1 }, "&:hover fieldset": { borderColor: "#C8102E" } } }} />
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.10 }}>
                  <Typography sx={{ fontSize: 11.5, color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.05em" }}>PAYMENT STATUS</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 800, color: status.color, letterSpacing: "0.03em" }}>{status.label}</Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.50 }}>
                  <Typography sx={{ fontSize: 11.5, color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.05em" }}>DUE DATE</Typography>
                  <Box
                    onClick={() => { if (dueDateEnabled) { setZone("FOOTER"); handleOpenDueDatePicker(); } }}
                    sx={{
                      position: "relative",
                      display: "flex", alignItems: "center", gap: 0.6,
                      minWidth: 140, height: 33,
                      px: 1.25,
                      borderRadius: 1.5,
                      border: "1px solid",
                      borderColor: dueDateEnabled ? "#E5E7EB" : "#E2E8F0",
                      bgcolor: dueDateEnabled ? "#fff" : "#F8FAFC",
                      cursor: dueDateEnabled ? "pointer" : "default",
                      "&:hover": { borderColor: dueDateEnabled ? "#C8102E" : "#E2E8F0" },
                    }}
                  >
                    <CalendarTodayIcon sx={{ fontSize: 14, color: dueDateEnabled ? "#6B7280" : "#CBD5E1" }} />
                    <Typography sx={{ fontSize: "13.5px", fontWeight: 600, color: dueDateEnabled ? "#111827" : "#94A3B8" }}>
                      {dueDate ? formatDateDisplay(dueDate) : "Select date"}
                    </Typography>
                    <input
                      ref={dueDateInputRef}
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      disabled={!dueDateEnabled}
                      min={invoiceDate}
                      style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0 }}
                    />
                  </Box>
                </Box>
              </Paper>
            )}

          </Box>

            {/* Note button (kept alongside payment/summary controls) */}
            <Button onClick={() => setNoteModalOpen(true)} variant="outlined" startIcon={<NoteAltOutlinedIcon sx={{ fontSize: 14 }} />}
              sx={{ justifyContent: "flex-start", borderRadius: 2, py: 0.85, px: 1.5, fontSize: 12, fontWeight: 700, color: hasNote ? "#16A34A" : "#6B7280", borderColor: hasNote ? "#86EFAC" : "#E5E7EB", borderWidth: hasNote ? 1.5 : 1, bgcolor: hasNote ? "#F0FDF4" : "#FAFAFA", "&:hover": { borderColor: "#6EE7B7", bgcolor: "#F0FDF4", color: "#16A34A" }, transition: "all 0.18s", textTransform: "none", gap: 0.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flex: 1 }}>
                <span>Note</span>
                <Box component="span" sx={{ fontSize: 9, opacity: 0.55 }}>[F7]</Box>
              </Box>
              {hasNote && <Chip label="Added" size="small" sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: "#DCFCE7", color: "#166534", border: "none", ml: 0.5 }} />}
            </Button>

            {/* PRINT + SAVE row */}
            <Box sx={{ display: "flex", gap: 1, alignItems: "stretch" }}>
              <Tooltip title={printEnabled ? "Print ON" : "Print OFF"}>
                <Box onClick={() => setPrintEnabled(p => !p)}
                  sx={{ width: 92, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75, border: "1px solid #E5E7EB", borderRadius: 2, cursor: "pointer", bgcolor: "#F9FAFB", "&:hover": { bgcolor: "#F3F4F6" }, transition: "background 0.15s", flexShrink: 0 }}>
                  <Box sx={{ width: 34, height: 18, borderRadius: 999, bgcolor: printEnabled ? modeAccent : "#D1D5DB", display: "flex", alignItems: "center", justifyContent: printEnabled ? "flex-end" : "flex-start", px: 0.3, transition: "background 0.15s" }}>
                    <Box sx={{ width: 14, height: 14, borderRadius: "50%", bgcolor: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.25)", transition: "all 0.15s" }} />
                  </Box>
                  <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#6B7280", letterSpacing: "0.05em" }}>PRINT</Typography>
                </Box>
              </Tooltip>
              <Button variant="contained"
                startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon sx={{ fontSize: 18 }} />}
                onClick={handleSave} disabled={saving || items.length === 0 || received > grandTotal + 0.01}
                sx={{ ...footerOutline("SAVE"), flex: 1, minWidth: 0, bgcolor: modeAccent, color: "#fff", fontSize: 14, fontWeight: 800, py: 0.9, px: 2, borderRadius: 2, boxShadow: `0 4px 18px rgba(200,16,46,0.35)`, "&:hover": { bgcolor: "#A50D26" }, "&:active": { transform: "scale(0.98)" }, "&.Mui-disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF", boxShadow: "none" }, transition: "all 0.15s" }}>
                {saving ? "SAVING…" : isNonSaleDoc ? `SAVE ${posTypeLabel.toUpperCase()}` : "SAVE"}{" "}
                <Box component="span" sx={{ fontSize: 11, opacity: 0.85, ml: 0.5 }}>[F8]</Box>
              </Button>
            </Box>
          </Box>
        </Box>

        {/* MODALS */}
        {/* <DiscountModal open={discountModalOpen} onClose={() => setDiscountModalOpen(false)} discountPct={discountPct} discount={discount} modeAccent={modeAccent} gstMode={gstMode} onApply={(pct, amt, mode) => { setDiscountPct(pct); setDiscount(amt); setGstMode(mode); }} /> */}
        <DiscountModal 
  open={discountModalOpen} 
  onClose={() => setDiscountModalOpen(false)} 
  discountPct={discountPct}
  discount={discount}
  modeAccent={modeAccent}
  gstMode={gstMode}
  baseAmount={grandTotalRaw + orderDiscountAmt}
  onApply={(pct, amt, mode) => { 
    setDiscountPct(pct); 
    setDiscount(amt); 
    setGstMode(mode); 
  }} 
/>
        <NoteModal open={noteModalOpen} onClose={() => setNoteModalOpen(false)} orderNote={orderNote} onApply={note => setOrderNote(note)} />

        {/* HOLD DIALOG */}
        <Dialog open={holdDialogOpen} onClose={() => setHoldDialogOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: "16px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" } }}>
          <Box sx={{ px: 3, py: 0.5, borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography sx={{ fontSize: 18, fontWeight: 800 }}>Hold Orders</Typography>
            <IconButton onClick={() => setHoldDialogOpen(false)} sx={{ color: "#6B7280", "&:hover": { bgcolor: "#F3F4F6", color: "#111827" } }}><CloseIcon /></IconButton>
          </Box>
          <Box sx={{ px: 3, py: 1.5 }}>
            <TextField fullWidth size="small" placeholder="Search by Hold ID, Customer Name or Amount... (Alt + S)"
              InputProps={{ startAdornment: <SearchIcon sx={{ fontSize: 18, color: "#9CA3AF", mr: 1 }} /> }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: "#F9FAFB", fontSize: 13 } }} />
          </Box>
          {/* The 6-column grid below doesn't reflow at phone dialog widths — scroll it
              horizontally there instead of clipping the ACTION column. */}
          <Box sx={{ overflowX: { xs: "auto", sm: "hidden" } }}>
          <Box sx={{ minWidth: { xs: 620, sm: "auto" } }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1.2fr 1.2fr 1.5fr 1fr 1fr 1fr", px: 3, py: 0.75, fontSize: 11, fontWeight: 700, color: "#6B7280", bgcolor: "#FAFAFA", borderTop: "1px solid #F1F5F9", borderBottom: "2px solid #E5E7EB", letterSpacing: "0.05em" }}>
            <span>HOLD ID</span><span>DATE & TIME</span><span>CUSTOMER</span><span>ITEMS</span><span>TOTAL</span><span style={{ textAlign: "center" }}>ACTION</span>
          </Box>
          <Box sx={{ maxHeight: 360, overflowY: "auto" }}>
            {heldOrders.length === 0 && (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 6, gap: 1 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#6B7280" }}>No hold items</Typography>
                <Typography sx={{ fontSize: 12, color: "#9CA3AF" }}>Orders you hold will appear here.</Typography>
              </Box>
            )}
            {heldOrders.map((order, index) => {
              const totalAmount = order.items.reduce((sum, i) => sum + i.qty * i.sellPrice, 0);
              return (
                <React.Fragment key={order.id}>
                  <Box sx={{ display: "grid", gridTemplateColumns: "1.2fr 1.2fr 1.5fr 1fr 1fr 1fr", px: 3, py: 1, alignItems: "center", transition: "background 0.15s", "&:hover": { bgcolor: "#FAFAFA" } }}>
                    <Typography sx={{ fontWeight: 800, color: "#C8102E", fontSize: 12 }}>#{order.label}</Typography>
                    <Typography sx={{ fontSize: 12, color: "#374151" }}>
                      {order.time.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} • {order.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 500 }}>{order.customer?.name || "Walk-in"}</Typography>
                    <Typography sx={{ fontSize: 12, color: "#6B7280" }}>{order.items.length} items</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>₹{totalAmount.toLocaleString("en-IN")}</Typography>
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1 }}>
                      <IconButton size="small" onClick={() => handleDeleteHold(order.id)} sx={{ color: "#EF4444", p: 0.5, "&:hover": { bgcolor: "#FEE2E2" } }}><DeleteOutlineIcon sx={{ fontSize: 16 }} /></IconButton>
                      <Button size="small" onClick={() => handleRecall(order)} sx={{ bgcolor: "#C8102E", color: "#fff", fontWeight: 700, fontSize: 10, px: 2, py: 0.4, minWidth: 0, borderRadius: "6px", boxShadow: "0 2px 8px rgba(200,16,46,0.3)", "&:hover": { bgcolor: "#A50D26", transform: "translateY(-1px)" }, "&:active": { transform: "scale(0.96)" } }}>RECALL</Button>
                    </Box>
                  </Box>
                  {index < heldOrders.length - 1 && <Divider sx={{ mx: 3, borderColor: "#F1F5F9" }} />}
                </React.Fragment>
              );
            })}
          </Box>
          </Box>
          </Box>
        </Dialog>

        {/* SAVE RESULT DIALOG */}
        <Dialog open={!!saveResult?.open} onClose={handleCloseSaveResult} maxWidth={saveResult?.success ? "sm" : "xs"} fullWidth TransitionComponent={Fade}
          PaperProps={{ sx: { borderRadius: "20px", boxShadow: "0 24px 70px rgba(0,0,0,0.18)", overflow: "visible" } }}>
          {saveResult?.success ? (
            <>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, px: 3, pt: 3, pb: 2 }}>
                <Box sx={{ position: "relative", width: 52, height: 52, flexShrink: 0 }}>
                  <Box sx={{ bgcolor: "#DCFCE7", borderRadius: "50%", width: 52, height: 52, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CheckCircleIcon sx={{ color: "#16A34A", fontSize: 34 }} />
                  </Box>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: 19, color: "#111827" }}>
                    {`${posTypeLabel} Created!`}
                  </Typography>
                  <Typography sx={{ fontSize: 15, mt: 0.25 }}>
                    <Box component="span" sx={{ color: "#16A34A", fontWeight: 800 }}>{INR(saveResult.grandTotal ?? 0)}</Box>
                    <Box component="span" sx={{ color: "#6B7280", ml: 0.75 }}>saved 🎉</Box>
                  </Typography>
                </Box>
                <IconButton size="small" onClick={handleCloseSaveResult} sx={{ alignSelf: "flex-start", color: "#9CA3AF" }}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
              </Box>

              <Divider sx={{ borderColor: "#F1F5F9" }} />

              <DialogContent sx={{ px: 3, py: 2 }}>
                <Box sx={{ display: "flex", alignItems: "stretch" }}>
                  <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 0.5 }}>
                    <Box sx={{ bgcolor: "#DCFCE7", borderRadius: "10px", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ReceiptLongIcon sx={{ color: "#16A34A", fontSize: 18 }} />
                    </Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>{saveResult.saleId}</Typography>
                    <Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>Invoice No.</Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem sx={{ borderColor: "#F1F5F9", mx: 1 }} />
                  <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 0.5 }}>
                    <Box sx={{ bgcolor: "#DCFCE7", borderRadius: "10px", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <CurrencyRupeeIcon sx={{ color: "#16A34A", fontSize: 18 }} />
                    </Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>{INR(saveResult.grandTotal ?? 0)}</Typography>
                    <Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>Total Amount</Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem sx={{ borderColor: "#F1F5F9", mx: 1 }} />
                  <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 0.5 }}>
                    <Box sx={{ bgcolor: "#DCFCE7", borderRadius: "10px", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <CalendarTodayIcon sx={{ color: "#16A34A", fontSize: 16 }} />
                    </Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>
                      {invoiceDate ? new Date(invoiceDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>Date</Typography>
                  </Box>
                </Box>

                {!isNonSaleDoc && (saveResult.change ?? 0) > 0 && (
                  <Box sx={{ display: "flex", justifyContent: "space-between", bgcolor: "#DBEAFE", borderRadius: 1.5, px: 1.5, py: 0.8, mt: 2 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1D4ED8" }}>💵 Return Change</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#1D4ED8" }}>{INR(saveResult.change ?? 0)}</Typography>
                  </Box>
                )}
              </DialogContent>

              <Divider sx={{ borderColor: "#F1F5F9", mb: 2 }} />

              <DialogActions sx={{ px: 3, pb: 3, pt: 0, gap: 1, flexWrap: "nowrap" }}>
                <Tooltip title={savedPdfData ? "Download invoice" : "Preparing invoice..."}>
                  <span style={{ flex: "1 1 0" }}>
                    <InvoiceCopyActions
                      fullWidth
                      label="Download"
                      icon={<Download sx={{ fontSize: 18 }} />}
                      copyTypes={savedCopyTypes}
                      onRun={handleDownloadInvoice}
                      busy={downloadLoading}
                      disabled={!savedPdfData}
                      buttonSx={{ borderRadius: 2, fontWeight: 600, whiteSpace: "nowrap", border: "1px solid #E5E7EB", color: "#374151", textTransform: "none" }}
                    />
                  </span>
                </Tooltip>
                <Tooltip title={savedPdfData ? "Share invoice" : "Preparing invoice..."}>
                  <span style={{ flex: "1 1 0" }}>
                    <InvoiceCopyActions
                      fullWidth
                      label="Share"
                      icon={<ShareIcon sx={{ fontSize: 18 }} />}
                      copyTypes={savedCopyTypes}
                      onRun={handleShareInvoice}
                      busy={shareLoading}
                      disabled={!savedPdfData}
                      buttonSx={{ borderRadius: 2, fontWeight: 600, whiteSpace: "nowrap", border: "1px solid #E5E7EB", color: "#374151", textTransform: "none" }}
                    />
                  </span>
                </Tooltip>
                {printEnabled && (
                  <Tooltip title={invoiceSettings?.printer_inch === "A4" && !savedPdfData ? "Preparing invoice..." : "Print invoice"}>
                    <span style={{ flex: "1 1 0" }}>
                      <InvoiceCopyActions
                        fullWidth
                        label="Print"
                        icon={<PrintOutlinedIcon sx={{ fontSize: 18 }} />}
                        copyTypes={savedCopyTypes}
                        onRun={handlePrintInvoice}
                        busy={printLoading}
                        disabled={invoiceSettings?.printer_inch === "A4" && !savedPdfData}
                        buttonSx={{ borderRadius: 2, fontWeight: 600, whiteSpace: "nowrap", border: "1px solid #E5E7EB", color: "#374151", textTransform: "none" }}
                      />
                    </span>
                  </Tooltip>
                )}
                <Button variant="contained" onClick={handleCloseSaveResult} startIcon={<AddIcon />}
                  sx={{ bgcolor: "#16A34A", "&:hover": { bgcolor: "#15803D" }, borderRadius: 2, fontWeight: 700, flex: "1.4 1 0", whiteSpace: "nowrap", textTransform: "none" }} autoFocus>
                  New Sale
                </Button>
              </DialogActions>
            </>
          ) : (
            <>
              <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ bgcolor: "#FEE2E2", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CloseIcon sx={{ color: "#C8102E", fontSize: 20 }} />
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Save Failed</Typography>
                </Box>
                <IconButton size="small" onClick={handleCloseSaveResult}><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
              </DialogTitle>
              <DialogContent sx={{ pt: 2 }}>
                <Box sx={{ bgcolor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 2, p: 1.5 }}>
                  <Typography sx={{ fontSize: 13, color: "#DC2626" }}>{saveResult?.message}</Typography>
                </Box>
              </DialogContent>
              <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
                <Button variant="contained" onClick={handleCloseSaveResult}
                  sx={{ bgcolor: "#C8102E", "&:hover": { bgcolor: "#A50D26" }, borderRadius: 2, fontWeight: 700, flex: 1 }} autoFocus>
                  Dismiss
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {savedPdfData && (
          <Box sx={{ position: "fixed", left: -10000, top: 0, width: 794, pointerEvents: "none", opacity: 0 }}>
            {invoiceSettings?.invoice_template === "modern2" ? (
              <InvoicePDFTemplateModern2 ref={pdfRef} data={savedPdfData} copyType={renderCopyType} />
            ) : invoiceSettings?.invoice_template === "modern" ? (
              <InvoicePDFTemplateModern ref={pdfRef} data={savedPdfData} copyType={renderCopyType} />
            ) : (
              <InvoicePDFTemplate ref={pdfRef} data={savedPdfData} copyType={renderCopyType} />
            )}
          </Box>
        )}
        {savedPdfData && (
          <Box sx={{ position: "fixed", left: -10000, top: 0, pointerEvents: "none", opacity: 0 }}>
            <ThermalInvoiceTemplate ref={thermalRef} data={savedPdfData} paperSize={thermalPaperSize} copyType={renderCopyType} />
          </Box>
        )}

        <CustomerLedgerDialog open={customerLedgerOpen} onClose={() => setCustomerLedgerOpen(false)} custUuid={customer.id} customerName={customer.name || "Walk-in"} />
        <AddNewCustomerDialog
          open={addCustomerOpen}
          onClose={() => setAddCustomerOpen(false)}
          editingCustomer={selectedApiCustomer}
          onSaved={(saved) => {
            const custName    = saved.cust_name?.trim() ?? "";
            const cpyName     = saved.cpy_name?.trim()  ?? "";
            const displayName = custName && cpyName ? `${custName} / ${cpyName}` : custName || cpyName;
            const c: ApiCustomer = { ...saved, same_as_billing_address: (saved as any).same_as_billing_address ?? !saved.shipping_address };
            setCustomer({ id: c.cust_uuid, name: displayName, mobile: primaryMobile(c), address: customerAddress(c), gstin: c.gst ?? "", shippingAddress: customerShippingAddress(c), sameAsBillingAddress: c.same_as_billing_address });
            setSelectedApiCustomer(c);
            setShipSameAsBilling(c.same_as_billing_address);
            setCustomerQuery(displayName);
          }}
        />
        <AddItemModal open={addItemOpen} onClose={() => setAddItemOpen(false)} onSave={handleAddItemSaved} />
        <CameraBarcodeScanner
          open={cameraScanOpen}
          onClose={() => setCameraScanOpen(false)}
          onScan={handleScanCode}
        />
        <SuccessToast message={scanMsg} severity={toastSeverity} onClose={() => setScanMsg("")} />
      </Box>
    </ThemeProvider>
  );
}

