import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useForceRefreshProducts, usePosSearch } from "./useposproducts";
import type { PosProduct } from "./db";
import { useSaveOrder, type SaveOrderResult } from "./usesaveOrder";
import {
  useCustomerSearch,
  type ApiCustomer,
  primaryMobile,
  customerAddress,
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
import AddShoppingCartIcon    from "@mui/icons-material/AddShoppingCart";
import KeyboardReturnIcon     from "@mui/icons-material/KeyboardReturn";
import DeleteOutlineIcon      from "@mui/icons-material/DeleteOutline";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import SaveIcon               from "@mui/icons-material/Save";
import PrintOutlinedIcon      from "@mui/icons-material/PrintOutlined";
import QrCodeScannerIcon      from "@mui/icons-material/QrCodeScanner";
import AddIcon                from "@mui/icons-material/Add";
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
import html2canvas            from "html2canvas";
import jsPDF                  from "jspdf";
import { useLocation }        from "react-router-dom";
import CustomerLedgerDialog   from "../Customer/CustomerLedgerDialog";
import AddNewCustomerDialog   from "@pages/Customer/Addnewcustomerdialog";
import AddItemModal           from "../MenuItemScreen/AddItemModal";
import {
  fetchSaleDetail,
} from "../SalesHistory/useSaleshistory";
import { InvoicePDFTemplate } from "../SalesHistory/InvoicePDFTemplate";
import { ThermalInvoiceTemplate, type ThermalPaperSize } from "../SalesHistory/ThermalInvoiceTemplate";
import DiscountModal          from "./DiscountModal";
import NoteModal              from "./NotesModal";
import { useAppSelector }     from "@store/store";
import { BranchId, ZoduId }   from "@store/slices/userSlice";
import { Download } from "@mui/icons-material";

const INR = (v: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(v);
const todayStr = () => new Date().toISOString().split("T")[0];

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
    background: { default: "#F0F2F5", paper: "#FFFFFF" },
    text: { primary: "#1A1A2E", secondary: "#6B7280" },
  },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: "none", borderRadius: 8, fontWeight: 600 } } },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: "1px solid #F0F0F0", padding: "6px 8px" },
        head: {
          fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", color: "#6B7280",
          textTransform: "uppercase", backgroundColor: "#FAFAFA",
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
  editingQty?: boolean; editingPrice?: boolean; editingDiscount?: boolean;
  qtyDraft?: string; priceDraft?: string; discountDraft?: string;
}
interface Customer { id: string | null; name: string; mobile: string; address: string; gstin: string; }
const EMPTY_CUSTOMER: Customer = { id: null, name: "", mobile: "", address: "", gstin: "" };
interface SavedOrderSnapshot {
  result: SaveOrderResult;
  customer: Customer;
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
type PosMode = "SALE" | "QUOTATION";
type Zone = "SEARCH" | "CUSTOMER" | "TABLE" | "FOOTER";
type SearchFocus = "CODE";
type FooterFocus = "DISCOUNT_PCT" | "DISCOUNT_AMT" | "PAYMENT_TYPE" | "REF_NO" | "RECEIVED" | "SAVE";
type PaymentType = "Cash" | "UPI" | "Bank Transfer" | "Others";

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
  };
}

function paymentStatus(grand: number, received: number) {
  if (received <= 0) return { label: "UNPAID", color: "#DC2626" };
  if (received < grand - 0.01) return { label: `PARTIAL · Due ${INR(grand - received)}`, color: "#D97706" };
  if (received > grand + 0.01) return { label: `EXCESS · Return ${INR(received - grand)}`, color: "#2563EB" };
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

function toWords(n: number): string {
  return n.toLocaleString("en-IN");
}

const queryClient = new QueryClient();
const CAT_COLOR: Record<string, string> = { Beans: "#92400E", Drinks: "#1D4ED8", Equipment: "#065F46", Accessories: "#5B21B6", Milk: "#9D174D", Syrups: "#B45309" };

export default function RetailPOS() {
  return <QueryClientProvider client={queryClient}><RetailPOSInner /></QueryClientProvider>;
}

function RetailPOSInner() {
  const zoduId   = useAppSelector(ZoduId);
  const branchId = useAppSelector(BranchId);

  const [codeInput, setCodeInput] = useState("");
  const { results: suggestions, isLoading: catalogueLoading, total: catalogueTotal } = usePosSearch(branchId, codeInput, zoduId);
  const forceRefresh = useForceRefreshProducts(branchId, zoduId);

  const location        = useLocation();
  const query           = new URLSearchParams(location.search);
  const saleIdFromUrl   = query.get("saleId");
  const saleTypeFromUrl = query.get("saleType");

  const [posMode,        setPosMode]        = useState<PosMode>("SALE");
  const [items,          setItems]          = useState<LineItem[]>([]);
  const [discount,       setDiscount]       = useState("0");
  const [discountPct,    setDiscountPct]    = useState("0");
  const [gstMode,        setGstMode]        = useState<"after" | "before">("after");
  const [referenceNo,    setReferenceNo]    = useState("");
  const [receivedAmount, setReceivedAmount] = useState("");
  const [paymentType,    setPaymentType]    = useState<PaymentType>("Cash");
  const [printEnabled,   setPrintEnabled]   = useState(true);
  const [thermalPaperSize, setThermalPaperSize] = useState<ThermalPaperSize>("3");
  const [invoiceDate,    setInvoiceDate]    = useState(todayStr());
  const [dueDate,        setDueDate]        = useState("");
  const [orderNote,      setOrderNote]      = useState("");
  const [customer,       setCustomer]       = useState<Customer>(EMPTY_CUSTOMER);
  const [customerSuggestionsOpen, setCustomerSuggestionsOpen] = useState(false);
  const [customerLedgerOpen,      setCustomerLedgerOpen]      = useState(false);
  const [addCustomerOpen,         setAddCustomerOpen]         = useState(false);
  const [addItemOpen,             setAddItemOpen]             = useState(false);
  const [downloadLoading,         setDownloadLoading]         = useState(false);
  const [shareLoading,            setShareLoading]            = useState(false);
  const [savedOrderSnapshot,      setSavedOrderSnapshot]      = useState<SavedOrderSnapshot | null>(null);
  const [flashRow,       setFlashRow]       = useState<string | null>(null);
  const [saleId,         setSaleId]         = useState<string | null>(null);

  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [noteModalOpen,     setNoteModalOpen]     = useState(false);

  const { results: customerResults, loading: customerLoading, search: searchCustomers, clear: clearCustomerResults } = useCustomerSearch(zoduId, branchId);

  const [zone,                 setZone]                 = useState<Zone>("SEARCH");
  const [searchFocus,          setSearchFocus]          = useState<SearchFocus>("CODE");
  const [activeRowIdx,         setActiveRowIdx]         = useState(-1);
  const [footerFocus,          setFooterFocus]          = useState<FooterFocus>("DISCOUNT_PCT");
  const [suggestionIdx,        setSuggestionIdx]        = useState(-1);
  const [customerSuggestionIdx,setCustomerSuggestionIdx]= useState(-1);
  const [showSuggestions,      setShowSuggestions]      = useState(false);
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
  const subtotal          = useMemo(() => items.reduce((s, i) => s + i.qty * i.unitPrice, 0), [items]);
  const itemDiscountTotal = useMemo(() => items.reduce((s, i) => s + (i.discount ?? 0), 0), [items]);
  const discountPctAmt    = subtotal * (parseFloat(discountPct) || 0) / 100;
  const discountFlatAmt   = parseFloat(discount) || 0;
  const orderDiscountAmt  = discountPctAmt + discountFlatAmt;

  const gstAmount = useMemo(() => {
    if (subtotal === 0) return 0;
    if (gstMode === "before") {
      return items.reduce((s, i) => {
        const itemBase     = i.qty * i.unitPrice;
        const itemDiscount = orderDiscountAmt * (itemBase / subtotal);
        return s + Math.max(0, itemBase - itemDiscount) * i.gstPct / 100;
      }, 0);
    } else {
      return items.reduce((s, i) => {
        const itemBase = i.qty * i.unitPrice;
        return s + itemBase * i.gstPct / 100;
      }, 0);
    }
  }, [items, orderDiscountAmt, gstMode, subtotal]);

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
  const isQuotation   = posMode === "QUOTATION";
  const status        = paymentStatus(grandTotal, received);
  const dueDateEnabled = !isQuotation && received < grandTotal - 0.01;
  // ────────────────────────────────────────────────────────────────────────────

  const [saveResult, setSaveResult] = useState<{
    open: boolean; success: boolean; message: string;
    invoiceNo?: string; grandTotal?: number; change?: number; saleId?: string;
  } | null>(null);

  const codeRef           = useRef<HTMLInputElement>(null);
  const customerNameRef   = useRef<HTMLInputElement>(null);
  const customerMobileRef = useRef<HTMLInputElement>(null);
  const discountPctRef    = useRef<HTMLInputElement>(null);
  const discountAmtRef    = useRef<HTMLInputElement>(null);
  const refNoRef          = useRef<HTMLInputElement>(null);
  const receivedRef       = useRef<HTMLInputElement>(null);
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
    if (saleTypeFromUrl) setPosMode(saleTypeFromUrl.toLowerCase() === "q" ? "QUOTATION" : "SALE");
  }, [saleIdFromUrl, saleTypeFromUrl]);

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

  const doAddItem = useCallback((itemId: string) => {
    const p = suggestions.find(s => s.item_id === itemId);
    if (!p) return false;
    setItems(prev => {
      const idx = prev.findIndex(i => i.code === p.item_id);
      if (idx >= 0) { const e = prev[idx]; return [{ ...e, qty: e.qty + 1 }, ...prev.filter((_, i) => i !== idx)]; }
      return [toLineItem(p), ...prev];
    });
    setFlashRow(p.item_id); setTimeout(() => setFlashRow(null), 700);
    return p.item_id;
  }, [suggestions]);

  useEffect(() => {
    if (!saleId) return;
    const loadSale = async () => {
      const data = await fetchSaleDetail(saleIdFromUrl!);
      const sale = data.sale;
      setPosMode(sale.sale_type?.toLowerCase() === "q" ? "QUOTATION" : "SALE");
      setSaleId(sale.sale_uuid);
      console.log("new",data)
      setItems(data.items.map((i: any) => {
        const grossPrice   = Number(i.price) || 0;
        const gstPct       = Number(i.gst_percentage) || 0;
        const taxInclusive = Boolean(i.tax_inclusive);
        const unitPrice    = taxInclusive && gstPct > 0 ? grossPrice / (1 + gstPct / 100) : grossPrice;
        return { code: i.item_id, description: i.item_name, qty: Number(i.quantity), unitPrice, sellPrice: grossPrice, gstPct, taxInclusive, uuid: i.item_uuid, hsn: i.hsn_code ?? "", mrp: Number(i.mrp || 0), unit: i.unit || "NOS", discount: Number(i.discount || 0) };
      }));
      if (data.customer) {
        const c = data.customer;
        const displayName = c.cust_name && c.cpy_name ? `${c.cust_name} / ${c.cpy_name}` : c.cust_name || c.cpy_name || "";
        setCustomer({ id: c.cust_uuid, name: displayName, mobile: c.mobile || "", address: [c.address_line1, c.address_line2, c.city, c.state, c.pincode].filter(Boolean).join(", "), gstin: c.gst || "" });
      }
      if (sale.discount_type === "percentage") { setDiscountPct(String(sale.discount_value || 0)); setDiscount("0"); }
      else { setDiscount(String(sale.discount_amount || 0)); setDiscountPct("0"); }
      setReceivedAmount(String(sale.paid_amount || 0));
      if (data.payment_history.length > 0) {
        const last = data.payment_history[data.payment_history.length - 1];
        setReferenceNo(last.transaction_id || "");
        setPaymentType((last.transaction_type as any) || "Cash");
      }
      setInvoiceDate(formatDateForInput(sale.sale_date_fmt));
      setDueDate(formatDateForInput((sale as any).due_date_fmt || (sale as any).due_date));
    };
    loadSale();
  }, [saleId]);

  const handleAddItem = useCallback((overrideCode?: string) => {
    const code = (overrideCode ?? codeInput).trim();
    const id   = doAddItem(code);
    setCodeInput(""); setShowSuggestions(false);
    if (id) setItems(prev => prev.map(i => i.code === id ? { ...i, qty: 1 } : i));
    setZone("SEARCH"); setSearchFocus("CODE");
    setTimeout(() => codeRef.current?.focus(), 10);
  }, [codeInput, doAddItem]);

  const selectSuggestion = useCallback((p: PosProduct) => {
    const id = doAddItem(p.item_id);
    setCodeInput(""); setShowSuggestions(false);
    if (id) setItems(prev => prev.map(i => i.code === id ? { ...i, qty: 1, uuid: p.item_uuid } : i));
    setZone("SEARCH"); setSearchFocus("CODE");
    setTimeout(() => codeRef.current?.focus(), 10);
  }, [doAddItem]);

  const handleClear = useCallback(() => {
    setItems([]); setDiscount("0"); setDiscountPct("0"); setReferenceNo("");
    setReceivedAmount(""); setCodeInput(""); setActiveRowIdx(-1); setOrderNote("");
    setDueDate("");
    setZone("SEARCH"); setSearchFocus("CODE");
    setCustomer(EMPTY_CUSTOMER); clearCustomerResults(); setGstMode("after");
    setReceivedDirty(false);

  }, [clearCustomerResults]);

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
      order_type:     posMode,
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

  const updateQty  = (code: string, delta: number) =>
    setItems(prev => prev.map(i => i.code === code ? { ...i, qty: Math.max(1, i.qty + delta) } : i));

  const removeItem = (code: string) => {
    setItems(prev => {
      const next = prev.filter(i => i.code !== code);
      if (!next.length) { setActiveRowIdx(-1); setZone("SEARCH"); setSearchFocus("CODE"); }
      else setActiveRowIdx(idx => Math.min(idx, next.length - 1));
      return next;
    });
  };

  const handleCustomerFieldChange = useCallback((field: "name" | "mobile", value: string) => {
    setCustomer(prev => ({ ...prev, id: null, [field]: value }));
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
    setCustomer({ id: c.cust_uuid, name: displayName, mobile: primaryMobile(c), address: customerAddress(c), gstin: c.gst ?? "" });
    setCustomerSuggestionsOpen(false); setCustomerSuggestionIdx(-1); clearCustomerResults(); setZone("CUSTOMER");
  }, [clearCustomerResults]);

  const handleCloseSaveResult = useCallback(() => {
    setSaveResult(null);
    setSavedOrderSnapshot(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (items.length === 0 || saving) return;
    const result = saleId
      ? await updateOrder(saleId, { zodu_id: zoduId, branch_id: branchId, items, customer, invoiceDate, dueDate: dueDateEnabled ? dueDate : "", discountPct, discountFlat: discount, discountGstMode: gstMode, roundoff: roundoffValue, posMode, receivedAmount, paymentType, referenceNo })
      : await saveOrder({ zodu_id: zoduId, branch_id: branchId, items, customer, invoiceDate, dueDate: dueDateEnabled ? dueDate : "", discountPct, discountFlat: discount, discountGstMode: gstMode, roundoff: roundoffValue, posMode, receivedAmount, paymentType, referenceNo });
    if (result.success) {
      console.log("save Result",result)
      const order    = result.order as any;
      const totalAmt = parseFloat(order?.total_amount ?? "0");
      const paidAmt  = parseFloat(order?.paid_amount  ?? "0");
      const change   = paidAmt > totalAmt ? paidAmt - totalAmt : 0;
      const savedSaleId = String(order?.sale_id ?? saleIdFromUrl ?? "").trim() || undefined;
      setSavedOrderSnapshot({ result: result as SaveOrderResult, customer: { ...customer } });
      setSaveResult({ open: true, success: true, message: result.message, grandTotal: totalAmt, change, saleId: savedSaleId });
      if (printEnabled) console.log("🖨 Printing invoice");
      handleClear();
    } else {
      setSavedOrderSnapshot(null);
      setSaveResult({ open: true, success: false, message: result.message });
    }
  }, [items, customer, invoiceDate, dueDate, dueDateEnabled, discountPct, discount, gstMode, roundoffValue, posMode, receivedAmount, paymentType, referenceNo, printEnabled, saving, saveOrder, updateOrder, handleClear, saleId, saleIdFromUrl]);

  const handleThermalPrint = useCallback(() => {
    if (!thermalRef.current) return;
    // Use actual printable widths (roll width minus hardware margins) to prevent right-side clipping
    const paperMmMap: Record<ThermalPaperSize, number> = { "3": 72, "4": 96, "5": 120 };
    const mm = paperMmMap[thermalPaperSize];
    const content = thermalRef.current.innerHTML;
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
    body { width: ${mm}mm; background: #fff; }
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

  const modeAccent  = "#C8102E";
  const modeBg      = "#FFF1F3";
  const modeBorder  = "#F3C4CB";

  const hasDiscount   = parseFloat(discountPct) > 0 || parseFloat(discount) > 0;
  const hasNote       = orderNote.trim().length > 0;
  const discountBadge = (() => {
    const parts: string[] = [];
    if (parseFloat(discountPct) > 0) parts.push(`${discountPct}%`);
    if (parseFloat(discount)    > 0) parts.push(`₹${discount}`);
    return parts.join(" + ") || null;
  })();

  const totalGstRow = items.reduce((s, i) => s + (i.qty * i.unitPrice * i.gstPct) / 100, 0);
  const totalAmtRow = items.reduce((s, i) => s + i.qty * i.sellPrice - (i.discount ?? 0), 0);
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
    if (!order) return null;

    const customerName = saleCustomer?.name?.trim() || "Walk-In";
    const customerAddress = saleCustomer?.address?.trim() || "-";
    const customerMobile = saleCustomer?.mobile?.trim() ? `+91 ${saleCustomer.mobile}` : "-";
    const customerGstin = saleCustomer?.gstin?.trim() || "-";
    const hasDiscount = Number(order.discount_amount ?? 0) > 0;
    const discountLabel = order.discount_type === "percentage"
      ? `Discount (${Number(order.discount_value ?? 0)}%)`
      : "Discount";

    const totalCgst = savedHsnBreakdown.reduce((sum, row) => sum + row.cgstAmount, 0);
    const totalSgst = savedHsnBreakdown.reduce((sum, row) => sum + row.sgstAmount, 0);
    const totalAmount = Number(order.total_amount ?? 0);


    return {
      sale_id: order.sale_id,
      date: order.sale_date,
      due_date: order.due_date ?? null,
      customer_name: customerName,
      customer_address: customerAddress,
      customer_mobile: customerMobile,
      customer_gstin: customerGstin,
      payment_mode: payment?.transaction_type ?? paymentType,
      payment_status: order.payment_status,
      items: saleItems.map((item) => ({
        item_id: item.item_id,
        name: item.item_name,
        category: item.variant_name ?? "",
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
      amount_in_words: `${toWords(Math.round(totalAmount))} Rupees Only`,
      gst_breakdown: savedHsnBreakdown,
      company: undefined,
    };
  }, [savedHsnBreakdown, savedOrderSnapshot, paymentType]);

  const generateInvoicePdf = useCallback(async (): Promise<jsPDF | null> => {
    if (!pdfRef.current) return null;

    const canvas = await html2canvas(pdfRef.current, {
      scale: 1.6,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.72);
    const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4", compress: true });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imageWidth = pageWidth;
    const imageHeight = (canvas.height * imageWidth) / canvas.width;

    let heightLeft = imageHeight;
    let position = 0;

    pdf.addImage(imgData, "JPEG", 0, position, imageWidth, imageHeight, undefined, "MEDIUM");
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imageHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imageWidth, imageHeight, undefined, "MEDIUM");
      heightLeft -= pageHeight;
    }

    return pdf;
  }, []);

  const handleDownloadInvoice = useCallback(async () => {
    if (!savedPdfData) return;
    setDownloadLoading(true);
    try {
      const pdf = await generateInvoicePdf();
      if (!pdf) return;
      const fileName = `Invoice_${savedPdfData.sale_id ?? saveResult?.saleId ?? "invoice"}.pdf`;
      pdf.save(fileName);
    } finally {
      setDownloadLoading(false);
    }
  }, [generateInvoicePdf, saveResult?.saleId, savedPdfData]);

  const handleShareInvoice = useCallback(async () => {
    if (!savedPdfData) return;

    setShareLoading(true);
    try {
      const pdf = await generateInvoicePdf();
      if (!pdf) return;

      const fileName = `Invoice_${savedPdfData.sale_id ?? saveResult?.saleId ?? "invoice"}.pdf`;
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
  }, [generateInvoicePdf, saveResult?.saleId, savedPdfData]);

  // ─────────────────────────────────────────────────────────────
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ height: "100%", minHeight: 0, bgcolor: "#F0F2F5", display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* ═══════════════════════ TOP BAR ════════════════════════ */}
        <Box sx={{ bgcolor: "#fff", borderBottom: "1px solid #E5E7EB", px: { xs: 2, md: 3 }, py: 0.75, display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 50 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, bgcolor: "#F3F4F6", borderRadius: 2, p: 0.5 }}>
            <Box onClick={() => setPosMode("SALE")} sx={{ display: "flex", alignItems: "center", gap: 0.7, px: 1.75, py: 0.6, borderRadius: 1.5, cursor: "pointer", bgcolor: !isQuotation ? "#C8102E" : "transparent", color: !isQuotation ? "#fff" : "#6B7280", transition: "all 0.18s", "&:hover": { bgcolor: !isQuotation ? "#C8102E" : "#E5E7EB" } }}>
              <ReceiptLongIcon sx={{ fontSize: 15 }} />
              <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em" }}>Sale</Typography>
            </Box>
            <Box onClick={() => setPosMode("QUOTATION")} sx={{ display: "flex", alignItems: "center", gap: 0.7, px: 1.75, py: 0.6, borderRadius: 1.5, cursor: "pointer", bgcolor: isQuotation ? "#1D4ED8" : "transparent", color: isQuotation ? "#fff" : "#6B7280", transition: "all 0.18s", "&:hover": { bgcolor: isQuotation ? "#1D4ED8" : "#E5E7EB" } }}>
              <RequestQuoteIcon sx={{ fontSize: 15 }} />
              <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em" }}>Quotation</Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, alignSelf: "end" }}>
            {!isQuotation && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, justifyContent: "space-between", width: "100%" }}>
                <Box sx={{ display: "flex", gap: 0.75 }}>
                  <Button size="small" disabled={holdSaving || items.length === 0}
                    startIcon={holdSaving ? <CircularProgress size={10} /> : <PauseCircleOutlineIcon />}
                    onClick={handleHold}
                    
                    sx={{ minWidth: 82, height: 26, px: 1, borderRadius: 1.25, bgcolor: "#4B5563", color: "#fff", fontSize: 10, fontWeight: 800, boxShadow: "0 2px 6px rgba(75,85,99,0.22)", "&:hover": { bgcolor: "#374151" } }}>
                    HOLD <Box component="span" sx={{ fontSize: 9, opacity: 0.8, ml: 0.3 }}>[F9]</Box>
                  </Button>
                  <Badge badgeContent={heldOrders.length} invisible={heldOrders.length === 0} sx={{ "& .MuiBadge-badge": { fontSize: 8, minWidth: 14, height: 14, bgcolor: "#C8102E", color: "#fff", fontWeight: 800 } }}>
                    <Button size="small" startIcon={<PlayArrowIcon sx={{ fontSize: 12 }} />} onClick={() => { setHoldDialogOpen(true); refetchHolds(); }}
                      sx={{ minWidth: 80, height: 26, px: 1, borderRadius: 1.25, border: "1px solid #E5E7EB", bgcolor: heldOrders.length > 0 ? "#4B5563" : "#F3F4F6", color: heldOrders.length > 0 ? "#fff" : "#9CA3AF", fontSize: 10, fontWeight: 800, "&:hover": { bgcolor: heldOrders.length > 0 ? "#374151" : "#E5E7EB" } }}>
                      RECALL
                    </Button>
                  </Badge>
                </Box>
              </Box>
            )}
            <Box onClick={handleOpenPicker}
              sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1 }, bgcolor: isQuotation ? "#DBEAFE" : "#FEE2E2", border: `1px solid ${isQuotation ? "#1D4ED8" : "#C8102E"}`, borderRadius: 1.5, px: { xs: 1, sm: 1.5 }, py: 0.5, transition: "all 0.2s", cursor: "pointer", whiteSpace: "nowrap" }}>
              <CalendarTodayIcon sx={{ fontSize: 15, color: isQuotation ? "#1D4ED8" : "#C8102E", flexShrink: 0 }} />
              <Typography sx={{ fontSize: { xs: 9, sm: 10 }, color: isQuotation ? "#1D4ED8" : "#C8102E", fontWeight: 700, letterSpacing: "0.05em", display: { xs: "none", sm: "block" } }}>
                {isQuotation ? "QUOTATION DATE" : "INVOICE DATE"}
              </Typography>
              <Typography sx={{ fontSize: { xs: 11, sm: 12 }, fontWeight: 700, color: isQuotation ? "#1D4ED8" : "#C8102E", whiteSpace: "nowrap" }}>
                {invoiceDate || "Select date"}
              </Typography>
              <input ref={inputRef} type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} style={{ position: "absolute", opacity: 0, pointerEvents: "none" }} />
            </Box>
          </Box>
        </Box>

        {/* MAIN CONTENT */}
        <Box sx={{ flex: 1, minHeight: 0, px: { xs: 0.5, sm: 1, md: 1.5 }, pt: { xs: 0.5, sm: 0.75 }, pb: { xs: 0.5, sm: 0.75 }, display: "flex", flexDirection: "column" }}>
          <Box sx={{ display: "flex", gap: { xs: 0.75, sm: 1, md: 1.5 }, mb: { xs: 0.75, sm: 1 }, alignItems: "stretch", flexDirection: { xs: "column", md: "row" } }}>

            {/* Search panel */}
            <Paper elevation={0} sx={{ flex: "1 1 auto", borderRadius: 2, p: 1.5, bgcolor: "#fff", position: "relative", zIndex: 100, transition: "border-color 0.2s", border: zone === "SEARCH" ? `2px solid ${modeAccent}` : "2px solid #E5E7EB", boxShadow: zone === "SEARCH" ? `0 0 0 3px ${isQuotation ? "rgba(29,78,216,0.08)" : "rgba(200,16,46,0.08)"}` : "none" }}>
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-end" }}>
                <Box sx={{ flex: 1, position: "relative" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.4 }}>
                    <Typography sx={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: modeAccent }}>ITEM ID / NAME</Typography>
                    <Kbd>F2</Kbd>
                    {catalogueLoading
                      ? <Typography sx={{ fontSize: 9, color: "#9CA3AF", ml: 0.5 }}>syncing…</Typography>
                      : catalogueTotal > 0 && <Typography sx={{ fontSize: 9, color: "#10B981", ml: 0.5 }}>● {catalogueTotal.toLocaleString()} items</Typography>
                    }
                  </Box>
                  <TextField
                    inputRef={codeRef} value={codeInput}
                    onChange={e => setCodeInput(e.target.value)}
                    onFocus={() => { setZone("SEARCH"); setSearchFocus("CODE"); if (!catalogueLoading && codeInput.trim()) setShowSuggestions(true); }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 180)}
                    placeholder="Search by item ID, name or category…" size="small" fullWidth autoComplete="off"
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
                        <Button size="small" variant="contained" onMouseDown={(e) => { e.preventDefault(); setShowSuggestions(false); setAddItemOpen(true); }} sx={{ bgcolor: modeAccent, fontSize: 9, fontWeight: 800, borderRadius: 1.5, px: 1.1, py: 0.45, "&:hover": { bgcolor: isQuotation ? "#1E40AF" : "#A50D26" } }}>+ Add Menu Item</Button>
                      </Box>
                    </Paper>
                  )}
                </Box>
                <Button variant="contained" startIcon={<AddShoppingCartIcon />} onClick={() => handleAddItem()}
                  sx={{ bgcolor: modeAccent, color: "#fff", px: 2.5, py: 0.9, fontSize: 13, fontWeight: 700, borderRadius: 1.5, minHeight: 38, whiteSpace: "nowrap", boxShadow: `0 4px 14px ${isQuotation ? "rgba(29,78,216,0.35)" : "rgba(200,16,46,0.35)"}`, "&:hover": { bgcolor: isQuotation ? "#1E40AF" : "#A50D26" }, "&:active": { transform: "scale(0.97)" } }}>
                  ADD <Box component="span" sx={{ fontSize: 10, opacity: 0.8, ml: 0.4 }}>[Enter]</Box>
                </Button>
              </Box>
            </Paper>

            {/* Customer panel */}
            <Paper elevation={0} sx={{ flex: { xs: 1, md: "0 0 auto" }, width: { md: "40%", lg: "38%", xl: "34%" }, maxWidth: { md: 560 }, border: zone === "CUSTOMER" ? `2px solid ${modeAccent}` : "1px solid #E5E7EB", borderRadius: 2.5, p: { xs: 1, sm: 1.25 }, bgcolor: "#fff", transition: "border 0.2s, box-shadow 0.2s", position: "relative", boxShadow: zone === "CUSTOMER" ? `0 0 0 3px ${isQuotation ? "rgba(29,78,216,0.08)" : "rgba(200,16,46,0.08)"}` : "none" }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1.5, mb: 1.2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
                  <PersonSearchIcon sx={{ fontSize: 15, color: modeAccent }} />
                  <Typography sx={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color: "#374151" }}>CUSTOMER</Typography>
                  {customer.id && <Chip label="Linked" size="small" onDelete={() => { setCustomer(EMPTY_CUSTOMER); clearCustomerResults(); }} sx={{ fontSize: 9, height: 18, bgcolor: "#DCFCE7", color: "#16A34A", fontWeight: 700 }} />}
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Button disabled={!customer.id} size="small" variant="outlined" onClick={() => setCustomerLedgerOpen(true)} sx={{ borderColor: modeBorder, color: modeAccent, fontSize: 9, fontWeight: 800, px: 1.25, py: 0.55, borderRadius: 1.5, minWidth: 0, whiteSpace: "nowrap", "&:hover": { borderColor: modeAccent, bgcolor: modeBg } }}>View Ledger / History</Button>
                </Box>
              </Box>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1 }}>
                <TextField inputRef={customerNameRef} value={customer.name} onChange={e => handleCustomerFieldChange("name", e.target.value)} onFocus={() => { setZone("CUSTOMER"); if (customer.name.trim()) { setCustomerSuggestionsOpen(true); setCustomerSuggestionIdx(-1); } }} onBlur={() => setTimeout(() => setCustomerSuggestionsOpen(false), 180)} placeholder="Name or company" size="small" autoComplete="off" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.75, fontSize: 12, bgcolor: "#F8FAFC", "& fieldset": { borderColor: "#E2E8F0" }, "&:hover fieldset": { borderColor: modeAccent }, "&.Mui-focused fieldset": { borderColor: modeAccent } } }} inputProps={{ style: { padding: "7px 12px", fontWeight: 500 } }} />
                <TextField inputRef={customerMobileRef} value={customer.mobile} onChange={e => handleCustomerFieldChange("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))} onFocus={() => { setZone("CUSTOMER"); if (customer.mobile.trim()) { setCustomerSuggestionsOpen(true); setCustomerSuggestionIdx(-1); } }} onBlur={() => setTimeout(() => setCustomerSuggestionsOpen(false), 180)} placeholder="Mobile" size="small" autoComplete="off" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.75, fontSize: 12, bgcolor: "#F8FAFC", "& fieldset": { borderColor: "#E2E8F0" }, "&:hover fieldset": { borderColor: modeAccent }, "&.Mui-focused fieldset": { borderColor: modeAccent } } }} inputProps={{ style: { padding: "7px 12px", fontWeight: 500, fontFamily: "monospace", letterSpacing: "0.04em" } }} />
              </Box>
              {customerSuggestionsOpen && (customer.name.trim() || customer.mobile.trim()) && (
                <Paper elevation={8} sx={{ position: "absolute", top: "calc(100% - 4px)", left: 12, right: 12, zIndex: 9998, borderRadius: 2, border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 16px 40px rgba(15,23,42,0.16)" }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1.5, py: 1, bgcolor: isQuotation ? "#EFF6FF" : "#FFF7F8", borderBottom: `1px solid ${isQuotation ? "#BFDBFE" : "#F3D6DB"}` }}>
                    <Box>
                      <Typography sx={{ fontSize: 10, fontWeight: 800, color: "#374151", letterSpacing: "0.06em" }}>CUSTOMER SEARCH</Typography>
                      <Typography sx={{ fontSize: 9, color: "#9CA3AF" }}>Select to auto-fill mobile, address and GSTIN.</Typography>
                    </Box>
                    {customerLoading ? <CircularProgress size={12} sx={{ color: modeAccent }} /> : <Typography sx={{ fontSize: 9, fontWeight: 800, color: modeAccent }}>{customerResults.length} result{customerResults.length !== 1 ? "s" : ""}</Typography>}
                  </Box>
                  {!customerLoading && customerResults.length === 0
                    ? <Box sx={{ px: 2, py: 3, textAlign: "center" }}><Typography sx={{ fontSize: 12, color: "#9CA3AF" }}>No matching customers found.</Typography></Box>
                    : <Box ref={customerSuggestionListRef} sx={{ maxHeight: 280, overflowY: "auto", bgcolor: "#fff" }}>
                        {customerResults.map((c, idx) => (
                          <Box key={c.cust_uuid} onMouseDown={() => handleSelectCustomer(c)} sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1, px: 1.5, py: 1.1, borderBottom: "1px solid #F8FAFC", cursor: "pointer", bgcolor: idx === customerSuggestionIdx ? (isQuotation ? "#EFF6FF" : "#FFF7F8") : "#fff", borderLeft: idx === customerSuggestionIdx ? `3px solid ${modeAccent}` : "3px solid transparent", "&:hover": { bgcolor: isQuotation ? "#EFF6FF" : "#FFF7F8" } }}>
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
                    <Button size="small" variant="contained" onClick={() => { setCustomerSuggestionsOpen(false); setAddCustomerOpen(true); }} sx={{ bgcolor: modeAccent, fontSize: 9, fontWeight: 800, borderRadius: 1.5, px: 1.1, py: 0.45, "&:hover": { bgcolor: isQuotation ? "#1E40AF" : "#A50D26" } }}>+ Add New</Button>
                  </Box>
                </Paper>
              )}
            </Paper>
          </Box>

          {/* ORDER TABLE */}
          <Paper elevation={0} sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", border: zone === "TABLE" ? "2px solid #1976d2" : "1px solid #E5E7EB", borderRadius: 2, overflow: "hidden", transition: "border 0.2s", boxShadow: zone === "TABLE" ? "0 0 0 3px rgba(245,158,11,0.1)" : "none" }}>
            <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: "#ea9999 #F3F4F6", "&::-webkit-scrollbar": { width: "8px" }, "&::-webkit-scrollbar-track": { backgroundColor: "#F3F4F6", borderRadius: "4px" }, "&::-webkit-scrollbar-thumb": { backgroundColor: "#ea9999", borderRadius: "4px", "&:hover": { backgroundColor: "#A50D26" } } }}>
              <Table size="small" stickyHeader sx={{ borderCollapse: "separate", tableLayout: "fixed" }}>
                <colgroup>
                  <col style={{ width: 10 }} /><col style={{ width: 120 }} /><col /><col style={{ width: 70 }} />
                  <col style={{ width: 60 }} /><col style={{ width: 90 }} /><col style={{ width: 90 }} />
                  <col style={{ width: 130 }} /><col style={{ width: 130 }} /><col style={{ width: 110 }} />
                  <col style={{ width: 115 }} /><col style={{ width: 105 }} /><col style={{ width: 36 }} />
                </colgroup>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 10, p: 0 }} />
                    <TableCell sx={{ width: 120, fontSize: 12 }}>ITEM ID</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>DESCRIPTION</TableCell>
                    <TableCell sx={{ width: 70, fontSize: 12 }}>HSN</TableCell>
                    <TableCell align="center" sx={{ width: 60, fontSize: 12 }}>GST%</TableCell>
                    <TableCell align="right" sx={{ width: 90, fontSize: 12 }}>GST AMT</TableCell>
                    <TableCell align="right" sx={{ width: 90, fontSize: 12 }}>MRP (₹)</TableCell>
                    <TableCell align="center" sx={{ width: 130, fontSize: 12 }}><Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.4 }}>QTY <Kbd>Q</Kbd></Box></TableCell>
                    <TableCell align="right" sx={{ width: 130, fontSize: 12 }}><Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.4 }}>RATE <Kbd>P</Kbd></Box></TableCell>
                    <TableCell align="right" sx={{ width: 110, fontSize: 12, whiteSpace: "nowrap" }}>UNIT PRICE</TableCell>
                    <TableCell align="right" sx={{ width: 115, fontSize: 12 }}><Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.4 }}>DISC % <Kbd>D</Kbd></Box></TableCell>
                    <TableCell align="right" sx={{ width: 105, fontSize: 12 }}>TOTAL</TableCell>
                    <TableCell sx={{ width: 36 }} />
                  </TableRow>
                </TableHead>
                <TableBody ref={tableBodyRef}>
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={13} align="center" sx={{ py: 6 }}>
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, color: "#D1D5DB" }}>
                          <KeyboardReturnIcon sx={{ fontSize: 32 }} />
                          <Typography sx={{ fontSize: 13 }}>Search and add items above</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                  {items.map((item, rowIdx) => {
                    const isActive  = zone === "TABLE" && activeRowIdx === rowIdx;
                    const itemGst   = (item.qty * item.unitPrice * item.gstPct) / 100;
                    const itemTotal = item.qty * item.sellPrice - (item.discount ?? 0);
                    return (
                      <Fade in key={item.code}>
                        <TableRow data-rowcode={item.code} onClick={() => { setZone("TABLE"); setActiveRowIdx(rowIdx); }}
                          sx={{ bgcolor: flashRow === item.code ? "#FFF1F3" : isActive ? "#E3F2FD" : "transparent", cursor: "pointer", transition: "background 0.2s", "&:hover": { bgcolor: isActive ? "#E3F2FD" : "#F5F5F5" } }}>
                          <TableCell sx={{ p: 0 }}><Box sx={{ width: 4, minHeight: 40, bgcolor: isActive ? "#1976D2" : "transparent", borderRadius: "0 2px 2px 0", transition: "background 0.2s" }} /></TableCell>
<TableCell>
  <Typography
    sx={{
      fontSize: 12,
      fontWeight: 700,
      color: "#374151",
      whiteSpace: "nowrap",
      overflow: "visible",
    }}
  >
    {item.code}
  </Typography>
</TableCell>                          <TableCell>
                            <Typography sx={{ fontSize: 13, fontWeight: isActive ? 800 : 700, color: "#1A1A2E", lineHeight: 1.3 }}>{item.description}</Typography>
                            {item.category && <Typography sx={{ fontSize: 10, fontWeight: 700, color: CAT_COLOR[item.category] ?? "#6B7280" }}>{item.category}</Typography>}
                          </TableCell>
                          <TableCell><Typography sx={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>{item.hsn}</Typography></TableCell>
                          <TableCell align="center"><Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{item.gstPct}%</Typography></TableCell>
                          <TableCell align="right"><Typography sx={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>{INR(itemGst)}</Typography></TableCell>
                          <TableCell align="right"><Typography sx={{ fontSize: 13, color: "#9CA3AF" }}>₹{item.mrp.toLocaleString("en-IN")}</Typography></TableCell>

                          {/* QTY */}
                          <TableCell align="center" onClick={e => e.stopPropagation()}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.3 }}>
                              <IconButton size="small" onClick={() => updateQty(item.code, -1)} sx={{ width: 24, height: 24, bgcolor: "#F3F4F6", "&:hover": { bgcolor: "#FEE2E2" } }}><RemoveIcon sx={{ fontSize: 12 }} /></IconButton>
                              {item.editingQty ? (
                                <TextField inputRef={el => { qtyRefs.current[item.code] = el; }} value={item.qtyDraft ?? ""}
                                  onChange={e => setItems(prev => prev.map(i => i.code === item.code ? { ...i, qtyDraft: e.target.value.replace(/[^0-9.]/g, "") } : i))}
                                  onBlur={() => { if (editCancelledRef.current) { editCancelledRef.current = false; return; } const el = qtyRefs.current[item.code]; const newQty = Math.max(1, parseFloat(el?.value ?? "") || 1); setItems(prev => prev.map(i => i.code === item.code ? { ...i, qty: newQty, editingQty: false, qtyDraft: undefined } : i)); setZone("TABLE"); setActiveRowIdx(rowIdx); }}
                                  onKeyDown={e => { if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); e.stopPropagation(); const newQty = Math.max(1, parseFloat((e.target as HTMLInputElement).value) || 1); editCancelledRef.current = true; setItems(prev => prev.map(i => i.code === item.code ? { ...i, qty: newQty, editingQty: false, qtyDraft: undefined } : i)); (e.target as HTMLElement).blur(); setZone("TABLE"); setActiveRowIdx(rowIdx); } if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); editCancelledRef.current = true; setItems(prev => prev.map(i => i.code === item.code ? { ...i, editingQty: false, qtyDraft: undefined } : i)); (e.target as HTMLElement).blur(); setZone("TABLE"); setActiveRowIdx(rowIdx); } }}
                                  size="small" inputProps={{ step: "any", style: { textAlign: "center", fontWeight: 800, fontSize: 14, padding: "2px 2px", width: 48 } }}
                                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1, "& fieldset": { borderColor: "#1976D2", borderWidth: 2 } }, width: 64 }} />
                              ) : (
                                <Box onClick={() => { setZone("TABLE"); setActiveRowIdx(rowIdx); if (isActive) startEditQty(item.code); }}
                                  sx={{ minWidth: 30, textAlign: "center", fontWeight: 800, fontSize: 14, px: 0.4, py: 0.2, borderRadius: 1, cursor: isActive ? "text" : "pointer", border: isActive ? "1.5px dashed #1976D2" : "1.5px dashed transparent", bgcolor: isActive ? "#E3F2FD" : "transparent", "&:hover": { border: "1.5px dashed #1976D2", bgcolor: "#E3F2FD" }, transition: "all 0.15s" }}>{item.qty}</Box>
                              )}
                              <IconButton size="small" onClick={() => updateQty(item.code, 1)} sx={{ width: 24, height: 24, bgcolor: "#F3F4F6", "&:hover": { bgcolor: "#DCFCE7" } }}><AddIcon sx={{ fontSize: 12 }} /></IconButton>
                            </Box>
                          </TableCell>

                          {/* RATE */}
                          <TableCell align="right" onClick={e => e.stopPropagation()}>
                            {item.editingPrice ? (
                              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.4 }}>
                                <Typography sx={{ fontSize: 13, color: "#9CA3AF", fontWeight: 700 }}>₹</Typography>
                                <TextField inputRef={el => { priceRefs.current[item.code] = el; }} value={item.priceDraft ?? ""}
                                  onChange={e => setItems(prev => prev.map(i => i.code === item.code ? { ...i, priceDraft: e.target.value.replace(/[^0-9.]/g, "") } : i))}
                                  onBlur={() => { if (editCancelledRef.current) { editCancelledRef.current = false; return; } const el = priceRefs.current[item.code]; const newSell = Math.max(0, parseFloat(el?.value ?? "") || item.sellPrice); const newBase = item.taxInclusive && item.gstPct > 0 ? newSell / (1 + item.gstPct / 100) : newSell; setItems(prev => prev.map(i => i.code === item.code ? { ...i, sellPrice: newSell, unitPrice: newBase, editingPrice: false, priceDraft: undefined } : i)); setZone("TABLE"); setActiveRowIdx(rowIdx); }}
                                  onKeyDown={e => { if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); e.stopPropagation(); const newSell = Math.max(0, parseFloat((e.target as HTMLInputElement).value) || item.sellPrice); const newBase = item.taxInclusive && item.gstPct > 0 ? newSell / (1 + item.gstPct / 100) : newSell; editCancelledRef.current = true; setItems(prev => prev.map(i => i.code === item.code ? { ...i, sellPrice: newSell, unitPrice: newBase, editingPrice: false, priceDraft: undefined } : i)); (e.target as HTMLElement).blur(); setZone("TABLE"); setActiveRowIdx(rowIdx); } if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); editCancelledRef.current = true; setItems(prev => prev.map(i => i.code === item.code ? { ...i, editingPrice: false, priceDraft: undefined } : i)); (e.target as HTMLElement).blur(); setZone("TABLE"); setActiveRowIdx(rowIdx); } }}
                                  size="small" inputProps={{ style: { textAlign: "right", fontWeight: 700, fontSize: 13, padding: "2px 4px", width: 60 } }}
                                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1, "& fieldset": { borderColor: "#1976D2", borderWidth: 2 } }, width: 80 }} />
                              </Box>
                            ) : (
                              <Box onClick={() => { setZone("TABLE"); setActiveRowIdx(rowIdx); if (isActive) startEditPrice(item.code); }}
                                sx={{ display: "inline-flex", alignItems: "center", gap: 0.3, px: 0.6, py: 0.2, borderRadius: 1, cursor: isActive ? "text" : "pointer", border: isActive ? "1.5px dashed #1976D2" : "1.5px dashed transparent", bgcolor: isActive ? "#E3F2FD" : "transparent", "&:hover": { border: "1.5px dashed #1976D2", bgcolor: "#E3F2FD", "& .pedit": { opacity: 1 } }, transition: "all 0.15s" }}>
                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{INR(item.sellPrice)}</Typography>
                                <EditIcon className="pedit" sx={{ fontSize: 10, color: "#1976D2", opacity: isActive ? 0.6 : 0, transition: "opacity 0.15s" }} />
                              </Box>
                            )}
                          </TableCell>

                          {/* UNIT PRICE EX.TAX */}
                          <TableCell align="right"><Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{INR(item.unitPrice)}</Typography></TableCell>

                          {/* DISCOUNT % */}
                          <TableCell align="right" onClick={e => e.stopPropagation()}>
                            {item.editingDiscount ? (
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
                            )}
                          </TableCell>

                          {/* TOTAL */}
                          <TableCell align="right"><Typography sx={{ fontSize: 13, fontWeight: 700, color: isActive ? "#0D47A1" : "#1A1A2E" }}>{INR(itemTotal)}</Typography></TableCell>
                          <TableCell onClick={e => e.stopPropagation()}><IconButton size="small" onClick={() => removeItem(item.code)} sx={{ color: "#D1D5DB", "&:hover": { color: "#C8102E", bgcolor: "#FEE2E2" } }}><DeleteOutlineIcon sx={{ fontSize: 15 }} /></IconButton></TableCell>
                        </TableRow>
                      </Fade>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>

            {/* Total row pinned to bottom */}
            <Table size="small" sx={{ borderCollapse: "separate", flexShrink: 0, tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: 10 }} /><col style={{ width: 70 }} /><col /><col style={{ width: 70 }} />
                <col style={{ width: 60 }} /><col style={{ width: 90 }} /><col style={{ width: 90 }} />
                <col style={{ width: 130 }} /><col style={{ width: 130 }} /><col style={{ width: 110 }} />
                <col style={{ width: 115 }} /><col style={{ width: 105 }} /><col style={{ width: 36 }} />
              </colgroup>
              <TableBody>
                <TableRow sx={{ bgcolor: "#F8FAFC", "& .MuiTableCell-root": { borderTop: "2px solid #E5E7EB", borderBottom: "none", py: 1, height: 34, bgcolor: "#F8FAFC" } }}>
                  <TableCell sx={{ p: 0 }} /><TableCell />
                  <TableCell><Typography sx={{ fontSize: 13, fontWeight: 800, color: "#374151" }}>Total</Typography></TableCell>
                  <TableCell /><TableCell align="center" />
                  <TableCell align="right"><Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{INR(items.length > 0 ? totalGstRow : 0)}</Typography></TableCell>
                  <TableCell align="right" />
                  <TableCell align="center"><Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{items.length > 0 ? totalUnits : 0}</Typography></TableCell>
                  <TableCell align="right" />
                  <TableCell align="right"><Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{INR(items.length > 0 ? subtotal : 0)}</Typography></TableCell>
                  <TableCell align="right">
                    {items.length > 0 && itemDiscountTotal > 0
                      ? <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#C8102E" }}>- {INR(itemDiscountTotal)}</Typography>
                      : <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#D1D5DB" }}>—</Typography>
                    }
                  </TableCell>
                  <TableCell align="right"><Typography sx={{ fontSize: 13, fontWeight: 700, color: "#000" }}>{INR(items.length > 0 ? totalAmtRow : 0)}</Typography></TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        </Box>

        {/* ═══════════════════ BILLING FOOTER ════════════════════ */}
        <Box sx={{ bgcolor: "#fff", borderTop: "1px solid #E5E7EB", flexShrink: 0, px: { xs: 0.75, sm: 1.25, md: 1.75 }, py: { xs: 0.5, sm: 0.75 }, display: "flex", gap: { xs: 0.75, sm: 1, md: 1.5 }, alignItems: "stretch", justifyContent: "flex-end", flexDirection: { xs: "column", md: "row" }, overflowY: { xs: "auto", md: "visible" }, maxHeight: { xs: "45vh", md: "none" } }}>

          {/* LEFT BLOCK */}
          <Box sx={{ width: { xs: "100%", md: "auto" }, minWidth: { md: 320, lg: 360 }, flexShrink: 0, display: "flex", flexDirection: "column", gap: { xs: 0.4, sm: 0.55 } }}>
            <Box sx={{ display: "flex", gap: { xs: 0.5, sm: 0.75 }, flexDirection: "row" }}>
              <Button onClick={() => setDiscountModalOpen(true)} variant="outlined" startIcon={<LocalOfferOutlinedIcon sx={{ fontSize: 14 }} />}
                sx={{ flex: 1, justifyContent: "flex-start", borderRadius: { xs: 1.5, sm: 2 }, py: { xs: 0.65, sm: 0.85 }, px: { xs: 1, sm: 1.5 }, fontSize: { xs: 11, sm: 12 }, fontWeight: 700, color: hasDiscount ? modeAccent : "#6B7280", borderColor: hasDiscount ? modeAccent : "#E5E7EB", borderWidth: hasDiscount ? 1.5 : 1, bgcolor: hasDiscount ? `${modeAccent}06` : "#FAFAFA", "&:hover": { borderColor: modeAccent, bgcolor: `${modeAccent}0A`, color: modeAccent }, transition: "all 0.18s", textTransform: "none", gap: 0.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flex: 1 }}>
                  <span>Discount</span>
                  <Box component="span" sx={{ fontSize: { xs: 8, sm: 9 }, opacity: 0.55 }}>[F6]</Box>
                </Box>
                {discountBadge && <Chip label={discountBadge} size="small" sx={{ height: 18, fontSize: { xs: 9, sm: 10 }, fontWeight: 700, bgcolor: `${modeAccent}18`, color: modeAccent, border: "none", ml: 0.5, display: { xs: "none", sm: "inline-flex" } }} />}
              </Button>
              <Button onClick={() => setNoteModalOpen(true)} variant="outlined" startIcon={<NoteAltOutlinedIcon sx={{ fontSize: 14 }} />}
                sx={{ flex: 1, justifyContent: "flex-start", borderRadius: { xs: 1.5, sm: 2 }, py: { xs: 0.65, sm: 0.85 }, px: { xs: 1, sm: 1.5 }, fontSize: { xs: 11, sm: 12 }, fontWeight: 700, color: hasNote ? "#16A34A" : "#6B7280", borderColor: hasNote ? "#86EFAC" : "#E5E7EB", borderWidth: hasNote ? 1.5 : 1, bgcolor: hasNote ? "#F0FDF4" : "#FAFAFA", "&:hover": { borderColor: "#6EE7B7", bgcolor: "#F0FDF4", color: "#16A34A" }, transition: "all 0.18s", textTransform: "none", gap: 0.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flex: 1 }}>
                  <span>Note</span>
                  <Box component="span" sx={{ fontSize: { xs: 8, sm: 9 }, opacity: 0.55 }}>[F7]</Box>
                </Box>
                {hasNote && <Chip label="Added" size="small" sx={{ height: 18, fontSize: { xs: 9, sm: 10 }, fontWeight: 700, bgcolor: "#DCFCE7", color: "#166534", border: "none", ml: 0.5, display: { xs: "none", sm: "inline-flex" } }} />}
              </Button>
            </Box>

            {!isQuotation && (
              <Box sx={{ display: "flex", gap: { xs: 0.5, sm: 0.75 }, flexDirection: "row" }}>
                <Box sx={{ width: { xs: 110, sm: 130 }, flexShrink: 0 }}>
                  <Typography sx={{ fontSize: { xs: 8, sm: 9 }, color: "#9CA3AF", fontWeight: 700, letterSpacing: "0.08em", mb: 0.3 }}>PAYMENT TYPE</Typography>
                  <Select value={paymentType} onChange={e => setPaymentType(e.target.value as PaymentType)} onFocus={() => { setZone("FOOTER"); setFooterFocus("PAYMENT_TYPE"); }} size="small" fullWidth
                    sx={{ fontSize: { xs: 11, sm: 12 }, fontWeight: 700, borderRadius: 1.5, "& fieldset": { borderColor: isFooterActive("PAYMENT_TYPE") ? "#C8102E" : "#E5E7EB", borderWidth: isFooterActive("PAYMENT_TYPE") ? 2 : 1 }, "&:hover fieldset": { borderColor: "#C8102E" }, "& .MuiSelect-select": { py: { xs: "4px", sm: "6px" } } }}>
                    {["Cash","UPI","Bank Transfer","Others"].map(val => <MenuItem key={val} value={val} sx={{ fontSize: { xs: 11, sm: 12 }, fontWeight: 600 }}>{val}</MenuItem>)}
                  </Select>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: { xs: 8, sm: 9 }, color: "#9CA3AF", fontWeight: 700, letterSpacing: "0.08em", mb: 0.3 }}>REFERENCE NO.</Typography>
                  <TextField inputRef={refNoRef} value={referenceNo} onChange={e => setReferenceNo(e.target.value)} onFocus={() => { setZone("FOOTER"); setFooterFocus("REF_NO"); }} placeholder="Transaction ID" size="small" fullWidth
                    inputProps={{ style: { padding: "6px 10px", fontSize: "clamp(11px, 1vw, 12px)" } }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5, "& fieldset": { borderColor: isFooterActive("REF_NO") ? "#C8102E" : "#E5E7EB", borderWidth: isFooterActive("REF_NO") ? 2 : 1 }, "&:hover fieldset": { borderColor: "#C8102E" } } }} />
                </Box>
              </Box>
            )}
            {!isQuotation && (
              <Box sx={{ display: "flex", gap: { xs: 0.5, sm: 1 }, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                  <Typography sx={{ fontSize: { xs: 8, sm: 9 }, color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.06em", mb: 0.35 }}>PAYMENT STATUS</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", height: 32 }}>
                    <Typography sx={{ fontSize: { xs: 11, sm: 12 }, fontWeight: 800, color: status.color, letterSpacing: "0.04em" }}>{status.label}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                  <Typography sx={{ fontSize: { xs: 8, sm: 9 }, color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.06em", mb: 0.35 }}>DUE DATE</Typography>
                  <TextField
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    onFocus={() => setZone("FOOTER")}
                    disabled={!dueDateEnabled}
                    size="small"
                    inputProps={{ min: invoiceDate }}
                    sx={{
                      minWidth: { xs: 120, sm: 140 },
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1.5,
                        bgcolor: dueDateEnabled ? "#fff" : "#F8FAFC",
                        "& fieldset": { borderColor: dueDateEnabled ? "#E5E7EB" : "#E2E8F0" },
                        "&:hover fieldset": { borderColor: dueDateEnabled ? "#C8102E" : "#E2E8F0" },
                        "&.Mui-focused fieldset": { borderColor: "#C8102E", borderWidth: 2 },
                      },
                      "& .MuiInputBase-input": {
                        py: "6px",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: dueDateEnabled ? "#111827" : "#94A3B8",
                      },
                    }}
                  />
                </Box>
              </Box>
            )}
           
          
          </Box>

          <Divider orientation="vertical" flexItem sx={{ mx: { xs: 0.25, sm: 0.5 }, display: { xs: "none", md: "block" } }} />

          {/* RIGHT BLOCK */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 0.4, sm: 0.5 }, alignItems: { xs: "stretch", md: "flex-end" }, flex: { xs: 1, md: "0 0 auto" } }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", gap: 1 }}>
              <Typography sx={{ fontSize: { xs: 10, sm: 11 }, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>Discount {gstMode === "before" && "(Before GST)"}</Typography>
              <Typography sx={{ fontSize: { xs: 10, sm: 11 }, fontWeight: 800, color: (orderDiscountAmt + itemDiscountTotal) > 0 ? "#C8102E" : "#9CA3AF" }}>
                {(orderDiscountAmt + itemDiscountTotal) > 0 ? `- ₹${(orderDiscountAmt + itemDiscountTotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "0.00"}
              </Typography>
            </Box>

            {!isQuotation && (
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", gap: 1 }}>
                <Typography sx={{ fontSize: { xs: 10, sm: 11 }, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>Round Off</Typography>
                <Typography sx={{ fontSize: { xs: 10, sm: 11 }, fontWeight: 800, color: roundoffValue > 0 ? "#16A34A" : "#C8102E" }}>
                  {roundoffValue > 0 ? "+" : ""}{roundoffValue.toFixed(2)}
                </Typography>
              </Box>
            )}

            {isQuotation ? (
              <Box sx={{ border: "2px solid #D3D3D3", borderRadius: { xs: 1.5, sm: 2 }, px: { xs: 1.25, sm: 1.75 }, py: { xs: 0.35, sm: 0.5 }, textAlign: "right", bgcolor: "#E5E4E2", width: "100%", maxWidth: { xs: "100%", md: "clamp(200px, 20vw, 280px)" } }}>
                <Typography sx={{ fontSize: { xs: 8, sm: 9 }, fontWeight: 800, color: "#000", letterSpacing: "0.1em", mb: 0.1 }}>TOTAL AMOUNT</Typography>
                <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 0.3 }}>
                  <Typography sx={{ fontSize: { xs: 13, sm: 14 }, fontWeight: 900, color: "#000" }}>₹</Typography>
                  <Typography sx={{ fontSize: { xs: 18, sm: 20 }, fontWeight: 900, color: "#000", lineHeight: 1 }}>{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</Typography>
                </Box>
              </Box>
            ) : (
              <Box onClick={() => receivedRef.current?.focus()}
                sx={{ border: `2px solid ${isFooterActive("RECEIVED") ? "#A0A0A0" : "#D3D3D3"}`, borderRadius: { xs: 1.5, sm: 2 }, px: { xs: 1.25, sm: 1.75 }, py: { xs: 0.25, sm: 0.35 }, textAlign: "right", bgcolor: isFooterActive("RECEIVED") ? "#fff" : "#E5E4E2", cursor: "text", transition: "border-color 0.15s, background 0.15s", width: "100%", maxWidth: { xs: "100%", md: "clamp(200px, 20vw, 280px)" }, "&:hover": { borderColor: "#A0A0A0", bgcolor: "#D8D8D6" } }}>
                <Typography sx={{ fontSize: { xs: 8, sm: 9 }, fontWeight: 800, color: "#444", letterSpacing: "0.1em", mb: 0.05 }}>RECEIVED · TOTAL {INR(grandTotal)}</Typography>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.15 }}>
                  <Typography sx={{ fontSize: { xs: 13, sm: 14 }, fontWeight: 900, color: "#000", lineHeight: 1 }}>₹</Typography>
                  <TextField inputRef={receivedRef} value={receivedAmount}
onChange={e => {
  setReceivedDirty(true);
  setReceivedAmount(e.target.value.replace(/[^0-9.]/g, ""));
}}                    onFocus={() => { setZone("FOOTER"); setFooterFocus("RECEIVED"); }}
                    placeholder="0.00" variant="standard" InputProps={{ disableUnderline: true }}
                    inputProps={{ style: { padding: 0, fontSize: "clamp(12px, 1.3vw, 18px)", fontWeight: 900, color: "#000", textAlign: "right", width: "100%", minWidth: "60px" } }}
                    sx={{ width: "100%", "& input::placeholder": { color: "#888", opacity: 1 } }} />
                </Box>
              </Box>
            )}

<Box sx={{ display: "flex", gap: { xs: 0.75, sm: 1 }, alignItems: "stretch", width: "100%", overflow: "hidden" }}>
                <Tooltip title={printEnabled ? "Print ON" : "Print OFF"}>
                <Box onClick={() => setPrintEnabled(p => !p)}
                  sx={{ width: { xs: 44, sm: 48 }, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0.3, border: "1px solid #E5E7EB", borderRadius: { xs: 1.5, sm: 2 }, cursor: "pointer", bgcolor: "#F9FAFB", "&:hover": { bgcolor: "#F3F4F6" }, transition: "background 0.15s", flexShrink: 0 }}>
                  <Box sx={{ width: 24, height: 14, bgcolor: printEnabled ? modeAccent : "#D1D5DB", borderRadius: 10, position: "relative", transition: "background 0.2s" }}>
                    <Box sx={{ position: "absolute", top: 2, left: printEnabled ? 10 : 2, width: 10, height: 10, bgcolor: "#fff", borderRadius: "50%", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                  </Box>
                  <Typography sx={{ fontSize: { xs: 7, sm: 8 }, fontWeight: 700, color: "#6B7280", letterSpacing: "0.05em" }}>PRINT</Typography>
                </Box>
              </Tooltip>
              <Button variant="contained"
                startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                onClick={handleSave} disabled={saving || items.length === 0}
                sx={{ ...footerOutline("SAVE"), flex: 1, minWidth: 0, width: "100%", bgcolor: modeAccent, color: "#fff", fontSize: { xs: 12, sm: 14 }, fontWeight: 800, py: { xs: 0.7, sm: 0.9 }, px: { xs: 1, sm: 2 }, borderRadius: { xs: 1.5, sm: 2 }, boxShadow: `0 4px 18px rgba(200,16,46,0.35)`, "&:hover": { bgcolor: "#A50D26" }, "&:active": { transform: "scale(0.98)" }, "&.Mui-disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF", boxShadow: "none" }, transition: "all 0.15s" }}>
                {saving ? "SAVING…" : isQuotation ? "SAVE QUOTE" : "SAVE"}{" "}
                <Box component="span" sx={{ fontSize: { xs: 10, sm: 11 }, opacity: 0.85, ml: 0.5 }}>[F8]</Box>
              </Button>
            </Box>
          </Box>
        </Box>

        {/* MODALS */}
        <DiscountModal open={discountModalOpen} onClose={() => setDiscountModalOpen(false)} discountPct={discountPct} discount={discount} modeAccent={modeAccent} gstMode={gstMode} onApply={(pct, amt, mode) => { setDiscountPct(pct); setDiscount(amt); setGstMode(mode); }} />
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
          <Box sx={{ display: "grid", gridTemplateColumns: "1.2fr 1.2fr 1.5fr 1fr 1fr 1fr", px: 3, py: 0.75, fontSize: 11, fontWeight: 700, color: "#6B7280", bgcolor: "#FAFAFA", borderTop: "1px solid #F1F5F9", borderBottom: "2px solid #E5E7EB", letterSpacing: "0.05em" }}>
            <span>HOLD ID</span><span>DATE & TIME</span><span>CUSTOMER</span><span>ITEMS</span><span>TOTAL</span><span style={{ textAlign: "center" }}>ACTION</span>
          </Box>
          <Box sx={{ maxHeight: 360, overflowY: "auto" }}>
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
        </Dialog>

        {/* SAVE RESULT DIALOG */}
        <Dialog open={!!saveResult?.open} onClose={handleCloseSaveResult} maxWidth="xs" fullWidth TransitionComponent={Fade}>
          <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ bgcolor: saveResult?.success ? "#DCFCE7" : "#FEE2E2", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {saveResult?.success ? <SaveIcon sx={{ color: "#16A34A", fontSize: 20 }} /> : <CloseIcon sx={{ color: "#C8102E", fontSize: 20 }} />}
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{saveResult?.success ? (isQuotation ? "Quotation Saved" : "Order Saved") : "Save Failed"}</Typography>
            </Box>
            <IconButton size="small" onClick={handleCloseSaveResult}><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            {saveResult?.success ? (
              <Box sx={{my:2}}>
                 <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography sx={{ fontSize: 13, color: "#6B7280" }}>Invoice Id</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{saveResult.saleId}</Typography>
                </Box>
                
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography sx={{ fontSize: 13, color: "#6B7280" }}>Grand Total</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{INR(saveResult.grandTotal ?? 0)}</Typography>
                </Box>
                <Typography sx={{ fontSize: 15, color: "#16A34A", mb: 0.5,textAlign:"center" }}>Invoice generated successfully.</Typography>
                {!isQuotation && (saveResult.change ?? 0) > 0 && (
                  <Box sx={{ display: "flex", justifyContent: "space-between", bgcolor: "#DBEAFE", borderRadius: 1.5, px: 1.5, py: 0.8, mt: 0.5 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1D4ED8" }}>💵 Return Change</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#1D4ED8" }}>{INR(saveResult.change ?? 0)}</Typography>
                  </Box>
                )}

                {/* Paper size selector — only visible when print is enabled */}
                {printEnabled && (
                  <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "1px solid #F1F5F9" }}>
                    <Typography sx={{ fontSize: 11, color: "#6B7280", mb: 0.8, fontWeight: 600, letterSpacing: "0.04em" }}>
                      THERMAL PAPER SIZE
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {(["3", "4", "5"] as ThermalPaperSize[]).map((size) => (
                        <Box
                          key={size}
                          onClick={() => setThermalPaperSize(size)}
                          sx={{
                            px: 1.5, py: 0.5, borderRadius: 1.5, cursor: "pointer",
                            fontSize: 12, fontWeight: 700,
                            border: "1.5px solid",
                            borderColor: thermalPaperSize === size ? "#C8102E" : "#E5E7EB",
                            bgcolor: thermalPaperSize === size ? "#FFF1F3" : "#fff",
                            color: thermalPaperSize === size ? "#C8102E" : "#6B7280",
                            transition: "all 0.15s",
                            userSelect: "none",
                          }}
                        >
                          {size}&quot;
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

              </Box>
            ) : (
              <Box sx={{ bgcolor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 2, p: 1.5 }}>
                <Typography sx={{ fontSize: 13, color: "#DC2626" }}>{saveResult?.message}</Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
            {saveResult?.success && (
              <Tooltip title={savedPdfData ? "Download invoice" : "Preparing invoice..."}>
                <span>
                  <IconButton onClick={handleDownloadInvoice} disabled={!savedPdfData || downloadLoading}
                    sx={{ border: "1px solid #E5E7EB", borderRadius: 2, color: "#475569", bgcolor: "#fff", "&:hover": { bgcolor: "#F8FAFC", borderColor: "#CBD5E1" }, "&.Mui-disabled": { bgcolor: "#F8FAFC", color: "#CBD5E1" } }}>
                    {downloadLoading ? <CircularProgress size={18} /> : <Download sx={{ fontSize: 18 }} />}
                  </IconButton>
                </span>
              </Tooltip>
            )}
            {saveResult?.success && (
              <Tooltip title={savedPdfData ? "Share invoice" : "Preparing invoice..."}>
                <span>
                  <IconButton onClick={handleShareInvoice} disabled={!savedPdfData || shareLoading}
                    sx={{ border: "1px solid #E5E7EB", borderRadius: 2, color: "#475569", bgcolor: "#fff", "&:hover": { bgcolor: "#F8FAFC", borderColor: "#CBD5E1" }, "&.Mui-disabled": { bgcolor: "#F8FAFC", color: "#CBD5E1" } }}>
                    {shareLoading ? <CircularProgress size={18} /> : <ShareIcon sx={{ fontSize: 18 }} />}
                  </IconButton>
                </span>
              </Tooltip>
            )}
            {saveResult?.success && printEnabled && (
              <Button variant="outlined" startIcon={<PrintOutlinedIcon />} onClick={handleThermalPrint} sx={{ borderRadius: 2, fontWeight: 600, flex: 1, borderColor: "#E5E7EB", color: "#374151" }}>Print</Button>
            )}
            <Button variant="contained" onClick={handleCloseSaveResult}
              sx={{ bgcolor: saveResult?.success ? "#16A34A" : "#C8102E", "&:hover": { bgcolor: saveResult?.success ? "#15803D" : "#A50D26" }, borderRadius: 2, fontWeight: 700, flex: 1 }} autoFocus>
              {saveResult?.success ? (isQuotation ? "New Quote" : "New Sale") : "Dismiss"}
            </Button>
          </DialogActions>
        </Dialog>

        {savedPdfData && (
          <Box sx={{ position: "fixed", left: -10000, top: 0, width: 794, pointerEvents: "none", opacity: 0 }}>
            <InvoicePDFTemplate ref={pdfRef} data={savedPdfData} />
          </Box>
        )}
        {savedPdfData && (
          <Box sx={{ position: "fixed", left: -10000, top: 0, pointerEvents: "none", opacity: 0 }}>
            <ThermalInvoiceTemplate ref={thermalRef} data={savedPdfData} paperSize={thermalPaperSize} />
          </Box>
        )}

        <CustomerLedgerDialog open={customerLedgerOpen} onClose={() => setCustomerLedgerOpen(false)} custUuid={customer.id} customerName={customer.name || "Walk-in"} />
        <AddNewCustomerDialog open={addCustomerOpen} onClose={() => setAddCustomerOpen(false)} />
        <AddItemModal open={addItemOpen} onClose={() => setAddItemOpen(false)} onSave={handleAddItemSaved} />
      </Box>
    </ThemeProvider>
  );
}

