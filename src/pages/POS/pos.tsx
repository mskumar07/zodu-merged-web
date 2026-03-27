// import { useState, useEffect, useRef, useCallback, useMemo } from "react";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { usePosSearch } from "./useposproducts";
// import type { PosProduct } from "./db";
// import { useSaveOrder } from "./usesaveOrder";
// import {
//   useCustomerSearch,
//   type ApiCustomer,
//   primaryMobile,
//   customerLabel,
//   customerAddress,
// } from "./useCustomer";
// import {
//   Box, Typography, TextField, Button, IconButton, Table, TableBody,
//   TableCell, TableHead, TableRow, Divider, Chip, Paper, InputAdornment,
//   Tooltip, Fade, Badge, Dialog, DialogTitle, DialogContent, DialogActions,
//   List, ListItem, ListItemText, ListItemSecondaryAction,
//   Select, MenuItem, CircularProgress,
// } from "@mui/material";
// import { createTheme, ThemeProvider } from "@mui/material/styles";
// import AddShoppingCartIcon    from "@mui/icons-material/AddShoppingCart";
// import KeyboardReturnIcon     from "@mui/icons-material/KeyboardReturn";
// import DeleteOutlineIcon      from "@mui/icons-material/DeleteOutline";
// import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
// import SaveIcon               from "@mui/icons-material/Save";
// import PrintOutlinedIcon      from "@mui/icons-material/PrintOutlined";
// import FiberManualRecordIcon  from "@mui/icons-material/FiberManualRecord";
// import PersonOutlineIcon      from "@mui/icons-material/PersonOutline";
// import QrCodeScannerIcon      from "@mui/icons-material/QrCodeScanner";
// import AddIcon                from "@mui/icons-material/Add";
// import RemoveIcon             from "@mui/icons-material/Remove";
// import GridViewIcon           from "@mui/icons-material/GridView";
// import PlayArrowIcon          from "@mui/icons-material/PlayArrow";
// import CloseIcon              from "@mui/icons-material/Close";
// import SearchIcon             from "@mui/icons-material/Search";
// import EditIcon               from "@mui/icons-material/Edit";
// import CalendarTodayIcon      from "@mui/icons-material/CalendarToday";
// import PersonSearchIcon       from "@mui/icons-material/PersonSearch";
// import { useNavigate }        from "react-router-dom";
// import { Receipt }            from "@mui/icons-material";
// import CustomerLedgerDialog   from "../Customer/CustomerLedgerDialog";
// import AddNewCustomerDialog   from "@pages/Customer/Addnewcustomerdialog";

// // ─── Constants ────────────────────────────────────────────────
// const INR = (v: number) =>
//   new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(v);
// const todayStr = () => new Date().toISOString().split("T")[0];

// const ZODU_ID   = import.meta.env.VITE_ZODU_ID   ?? "ZODU035";
// const BRANCH_ID = import.meta.env.VITE_BRANCH_ID ?? "ZODU035B1";

// // ─── Theme ────────────────────────────────────────────────────
// const theme = createTheme({
//   palette: {
//     primary:    { main: "#C8102E" },
//     background: { default: "#F0F2F5", paper: "#FFFFFF" },
//     text:       { primary: "#1A1A2E", secondary: "#6B7280" },
//   },
//   typography: { fontFamily: '"Poppins", sans-serif' },
//   components: {
//     MuiButton:    { styleOverrides: { root: { textTransform: "none", borderRadius: 8, fontWeight: 600 } } },
//     MuiTableCell: {
//       styleOverrides: {
//         root: { borderBottom: "1px solid #F0F0F0", padding: "6px 8px" },
//         head: { fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", color: "#6B7280", textTransform: "uppercase", backgroundColor: "#FAFAFA" },
//       },
//     },
//     MuiDialog: { styleOverrides: { paper: { borderRadius: 16 } } },
//   },
// });

// // ─── Types ────────────────────────────────────────────────────
// interface LineItem {
//   code: string; description: string; qty: number; unitPrice: number; sellPrice: number;uuid: string;
//   hsn: string; mrp: number; gstPct: number; taxInclusive: boolean; category?: string; unit?: string;
//   editingQty?: boolean; editingPrice?: boolean; qtyDraft?: string; priceDraft?: string;
// }

// interface Customer {
//   id:      string | null;
//   name:    string;
//   mobile:  string;
//   address: string;
//   gstin:   string;
// }
// const EMPTY_CUSTOMER: Customer = { id: null, name: "", mobile: "", address: "", gstin: "" };

// interface HeldOrder {
//   id: string; label: string; items: LineItem[];
//   discount: string; customer: Customer; time: Date;
// }

// type Zone = "SEARCH" | "CUSTOMER" | "TABLE" | "FOOTER";

// // ✅ Sub-focus within SEARCH zone:
// //   "CODE" = item search text field
// //   "QTY"  = qty number field
// // Navigation: Tab/→ from CODE → QTY → CUSTOMER
// //             ←        from QTY  → CODE
// //             ← / Escape from CUSTOMER → QTY
// type SearchFocus = "CODE" | "QTY";

// type FooterFocus = "DISCOUNT_PCT" | "DISCOUNT_AMT" | "PAYMENT_TYPE" | "REF_NO" | "RECEIVED" | "SAVE";
// type PaymentType = "Cash" | "Card" | "UPI" | "Credit";

// // ─── Helpers ──────────────────────────────────────────────────
// function toLineItem(p: PosProduct): LineItem {
//   const grossPrice    = Number(p.sell_price) || 0;
//   const gstPct        = Number(p.gst_tax)    || 0;
//   const taxInclusive  = p.tax_inclusive === true || (p.tax_inclusive as unknown) === 1;

//   // For tax-inclusive items the sell_price already contains GST.
//   // Strip tax out so unitPrice always represents the BASE (pre-tax) price.
//   // This ensures discounts are applied on the taxable base, not on gross.
//   const unitPrice = taxInclusive && gstPct > 0
//     ? grossPrice / (1 + gstPct / 100)   // base = gross / (1 + gst%)
//     : grossPrice;

//     console.log("pos",p)

//   return {
//     uuid:          p.item_uuid,
//     code:         p.item_id,
//     description:  p.item_name,
//     qty:          1,
//     unitPrice,                            // BASE price — used for all calculations
//     sellPrice:    grossPrice,             // GROSS price (what's on the price tag) — display only
//     taxInclusive,
//     hsn:          p.hsn_code   ?? "",
//     mrp:          Number(p.purchase_price) || grossPrice,
//     gstPct,
//     category:     p.category_name ?? "",
//     unit:         p.unit          || "NOS",
//   };
// }

// function paymentStatus(grand: number, received: number) {
//   if (received <= 0)           return { label: "UNPAID",                                  color: "#DC2626" };
//   if (received < grand - 0.01) return { label: `PARTIAL · Due ${INR(grand - received)}`,   color: "#D97706" };
//   if (received > grand + 0.01) return { label: `EXCESS · Return ${INR(received - grand)}`, color: "#2563EB" };
//   return                               { label: "FULL PAYMENT",                             color: "#16A34A" };
// }

// function Kbd({ children }: { children: React.ReactNode }) {
//   return (
//     <Box component="span" sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", bgcolor: "#D3D3D3", border: "1px solid #D3D3D3", borderRadius: "4px", px: 0.6, py: 0.1, minWidth: 18 }}>
//       <Typography sx={{ fontSize: 9, fontWeight: 700, fontFamily: "monospace", color: "#696969", lineHeight: 1.4 }}>{children}</Typography>
//     </Box>
//   );
// }

// function Highlight({ text, query }: { text: string; query: string }) {
//   if (!query.trim()) return <>{text}</>;
//   const i = text.toLowerCase().indexOf(query.toLowerCase());
//   if (i === -1) return <>{text}</>;
//   return <>{text.slice(0, i)}<Box component="span" sx={{ bgcolor: "#FEF08A", borderRadius: 0.4, px: 0.2, fontWeight: 800 }}>{text.slice(i, i + query.length)}</Box>{text.slice(i + query.length)}</>;
// }

// const queryClient = new QueryClient();
// const CAT_COLOR: Record<string, string> = { Beans: "#92400E", Drinks: "#1D4ED8", Equipment: "#065F46", Accessories: "#5B21B6", Milk: "#9D174D", Syrups: "#B45309" };

// // ─── Root ─────────────────────────────────────────────────────
// export default function RetailPOS() {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <RetailPOSInner />
//     </QueryClientProvider>
//   );
// }

// // ─── Main component ───────────────────────────────────────────
// function RetailPOSInner() {
//   const [codeInput, setCodeInput] = useState("");
//   const { results: suggestions, isLoading: catalogueLoading, total: catalogueTotal } = usePosSearch(BRANCH_ID, codeInput);

//   const [items,          setItems]          = useState<LineItem[]>([]);
//   const [discount,       setDiscount]       = useState("0");
//   const [discountPct,    setDiscountPct]    = useState("0");
//   const [referenceNo,    setReferenceNo]    = useState("");
//   const [receivedAmount, setReceivedAmount] = useState("");
//   const [paymentType,    setPaymentType]    = useState<PaymentType>("Cash");
//   const [printEnabled,   setPrintEnabled]   = useState(true);
//   const [invoiceDate,    setInvoiceDate]    = useState(todayStr());
//   const [customer,       setCustomer]       = useState<Customer>(EMPTY_CUSTOMER);
//   const [customerSuggestionsOpen, setCustomerSuggestionsOpen] = useState(false);
//   const [customerLedgerOpen,      setCustomerLedgerOpen]      = useState(false);
//   const [addCustomerOpen,         setAddCustomerOpen]         = useState(false);
//   const [flashRow,  setFlashRow]  = useState<string | null>(null);
//   const [searchQty, setSearchQty] = useState("1");

//   const { results: customerResults, loading: customerLoading, search: searchCustomers, clear: clearCustomerResults } = useCustomerSearch(ZODU_ID, BRANCH_ID);

//   const [zone,            setZone]            = useState<Zone>("SEARCH");
//   // ✅ Tracks which field inside SEARCH zone is focused
//   const [searchFocus,     setSearchFocus]     = useState<SearchFocus>("CODE");
//   const [activeRowIdx,    setActiveRowIdx]    = useState(-1);
//   const [footerFocus,     setFooterFocus]     = useState<FooterFocus>("DISCOUNT_PCT");
//   const [suggestionIdx,   setSuggestionIdx]   = useState(-1);
//   const [showSuggestions, setShowSuggestions] = useState(false);

//   const [heldOrders,     setHeldOrders]     = useState<HeldOrder[]>([]);
//   const [holdDialogOpen, setHoldDialogOpen] = useState(false);
//   const [holdCounter,    setHoldCounter]    = useState(1);

//   const { saveOrder, saving } = useSaveOrder();
//   const [saveResult, setSaveResult] = useState<{
//     open: boolean; success: boolean; message: string;
//     invoiceNo?: string; grandTotal?: number; change?: number;
//   } | null>(null);

//   const codeRef           = useRef<HTMLInputElement>(null);
//   const qtySearchRef      = useRef<HTMLInputElement>(null);   // ✅ ref for QTY field
//   const customerNameRef   = useRef<HTMLInputElement>(null);
//   const customerMobileRef = useRef<HTMLInputElement>(null);
//   const discountPctRef    = useRef<HTMLInputElement>(null);
//   const discountAmtRef    = useRef<HTMLInputElement>(null);
//   const refNoRef          = useRef<HTMLInputElement>(null);
//   const receivedRef       = useRef<HTMLInputElement>(null);
//   const tableBodyRef      = useRef<HTMLTableSectionElement>(null);
//   const qtyRefs           = useRef<Record<string, HTMLInputElement | null>>({});
//   const priceRefs         = useRef<Record<string, HTMLInputElement | null>>({});
//   const editCancelledRef  = useRef(false);

//   useEffect(() => { codeRef.current?.focus(); }, []);

//   useEffect(() => {
//     if (zone === "TABLE" && activeRowIdx >= 0) {
//       const rows = tableBodyRef.current?.querySelectorAll("tr[data-rowcode]");
//       if (rows?.[activeRowIdx]) (rows[activeRowIdx] as HTMLElement).scrollIntoView({ block: "nearest", behavior: "smooth" });
//     }
//   }, [activeRowIdx, zone]);

//   // ✅ Focus the correct sub-field when zone/searchFocus changes
//   useEffect(() => {
//     if (zone === "SEARCH") {
//       if (searchFocus === "CODE") setTimeout(() => codeRef.current?.focus(), 10);
//       else                        setTimeout(() => qtySearchRef.current?.focus(), 10);
//     } else if (zone === "CUSTOMER") {
//       setTimeout(() => customerNameRef.current?.focus(), 10);
//     } else if (zone === "FOOTER") {
//       if      (footerFocus === "DISCOUNT_PCT") setTimeout(() => discountPctRef.current?.focus(), 10);
//       else if (footerFocus === "DISCOUNT_AMT") setTimeout(() => discountAmtRef.current?.focus(), 10);
//       else if (footerFocus === "REF_NO")       setTimeout(() => refNoRef.current?.focus(),       10);
//       else if (footerFocus === "RECEIVED")     setTimeout(() => receivedRef.current?.focus(),    10);
//     }
//   }, [zone, footerFocus, searchFocus]);

//   useEffect(() => {
//     setSuggestionIdx(-1);
//     // ✅ Re-open dropdown whenever user types — even after adding an item
//     if (codeInput.trim() && zone === "SEARCH" && searchFocus === "CODE") {
//       setShowSuggestions(true);
//     }
//   }, [codeInput]);

//   useEffect(() => {
//     if (!catalogueLoading && codeInput.trim() && zone === "SEARCH" && searchFocus === "CODE" && document.activeElement === codeRef.current)
//       setShowSuggestions(true);
//   }, [catalogueLoading]);

//   const startEditQty = useCallback((code: string) => {
//     setItems(prev => prev.map(i => i.code === code
//       ? { ...i, editingQty: true, editingPrice: false, qtyDraft: String(i.qty) }
//       : { ...i, editingQty: false }));
//     setTimeout(() => { qtyRefs.current[code]?.focus(); qtyRefs.current[code]?.select(); }, 30);
//   }, []);

//   const startEditPrice = useCallback((code: string) => {
//     setItems(prev => prev.map(i => i.code === code
//       ? { ...i, editingPrice: true, editingQty: false, priceDraft: String(i.sellPrice) }
//       : { ...i, editingPrice: false }));
//     setTimeout(() => { priceRefs.current[code]?.focus(); priceRefs.current[code]?.select(); }, 30);
//   }, []);

//   const doAddItem = useCallback((itemId: string) => {
//     const p = suggestions.find(s => s.item_id === itemId);
//     if (!p) return false;
//     setItems(prev => {
//       const idx = prev.findIndex(i => i.code === p.item_id);
//       if (idx >= 0) { const u = [...prev]; u[idx] = { ...u[idx], qty: u[idx].qty + 1 }; return u; }
//       return [...prev, toLineItem(p)];
//     });
//     setFlashRow(p.item_id); setTimeout(() => setFlashRow(null), 700);
//     return p.item_id;
//   }, [suggestions]);

//   const handleAddItem = useCallback((overrideCode?: string) => {
//     const code = (overrideCode ?? codeInput).trim();
//     const qty  = Math.max(1, parseInt(searchQty) || 1);
//     const id   = doAddItem(code);
//     setCodeInput(""); setSearchQty("1"); setShowSuggestions(false);
//     if (id) {
//       // ✅ Apply qty but stay in SEARCH zone — don't jump to TABLE row
//       setItems(prev => prev.map(i => i.code === id ? { ...i, qty } : i));
//     }
//     // Always return focus to CODE field so cashier can scan the next item
//     setZone("SEARCH"); setSearchFocus("CODE");
//     setTimeout(() => codeRef.current?.focus(), 10);
//   }, [codeInput, searchQty, doAddItem]);

//   const selectSuggestion = useCallback((p: PosProduct) => {
//     const qty = Math.max(1, parseInt(searchQty) || 1);
//     const id  = doAddItem(p.item_id);
//     setCodeInput(""); setSearchQty("1"); setShowSuggestions(false);
//     if (id) {
//       // ✅ Apply qty but stay in SEARCH zone — don't jump to TABLE row
//       setItems(prev => prev.map(i => i.code === id ? { ...i, qty } : i));
//     }
//     // Always return focus to CODE field so cashier can scan the next item
//     setZone("SEARCH"); setSearchFocus("CODE");
//     setTimeout(() => codeRef.current?.focus(), 10);
//   }, [doAddItem, searchQty]);

//   const handleClear = useCallback(() => {
//     setItems([]); setDiscount("0"); setDiscountPct("0"); setReferenceNo("");
//     setReceivedAmount(""); setCodeInput(""); setActiveRowIdx(-1);
//     setZone("SEARCH"); setSearchFocus("CODE");
//     setCustomer(EMPTY_CUSTOMER); clearCustomerResults();
//   }, [clearCustomerResults]);

//   const handleHold = useCallback(() => {
//     if (items.length === 0) return;
//     setHeldOrders(prev => [...prev, {
//       id: `H-${Date.now()}`, label: `Order #${holdCounter}`,
//       items: items.map(i => ({ ...i, editingQty: false, editingPrice: false })),
//       discount, customer, time: new Date(),
//     }]);
//     setHoldCounter(c => c + 1); setItems([]); setDiscount("0"); setReceivedAmount("");
//     setActiveRowIdx(-1); setZone("SEARCH"); setSearchFocus("CODE"); setCustomer(EMPTY_CUSTOMER);
//   }, [items, discount, customer, holdCounter]);

//   const handleRecall = (hold: HeldOrder) => {
//     if (items.length > 0 && !window.confirm("Current order will be cleared. Recall held order?")) return;
//     setItems(hold.items); setDiscount(hold.discount); setCustomer(hold.customer);
//     setHeldOrders(prev => prev.filter(h => h.id !== hold.id));
//     setHoldDialogOpen(false); setZone("TABLE"); setActiveRowIdx(0);
//   };

//   const handleDeleteHold = (id: string) => setHeldOrders(prev => prev.filter(h => h.id !== id));

//   const updateQty  = (code: string, delta: number) =>
//     setItems(prev => prev.map(i => i.code === code ? { ...i, qty: Math.max(1, i.qty + delta) } : i));

//   const removeItem = (code: string) => {
//     setItems(prev => {
//       const next = prev.filter(i => i.code !== code);
//       if (!next.length) { setActiveRowIdx(-1); setZone("SEARCH"); setSearchFocus("CODE"); }
//       else setActiveRowIdx(idx => Math.min(idx, next.length - 1));
//       return next;
//     });
//   };

//   // subtotal = sum of BASE prices (unitPrice is always pre-tax after toLineItem())
//   const subtotal        = useMemo(() => items.reduce((s, i) => s + i.qty * i.unitPrice, 0), [items]);

//   // Discount applied on the pre-tax subtotal
//   const discountPctAmt  = subtotal * (parseFloat(discountPct) || 0) / 100;
//   const discountFlatAmt = parseFloat(discount) || 0;
//   const discountAmt     = discountPctAmt + discountFlatAmt;
//   const discountedSubtotal = Math.max(0, subtotal - discountAmt);

//   // GST is always computed on the discounted BASE price, regardless of tax_inclusive
//   // (unitPrice is already the base — toLineItem() stripped tax out for inclusive items)
//   const gstAmount       = useMemo(() => {
//     if (subtotal === 0) return 0;
//     return items.reduce((s, i) => {
//       const itemBase     = i.qty * i.unitPrice;
//       const itemDiscount = discountAmt * (itemBase / subtotal);   // proportional discount
//       return s + Math.max(0, itemBase - itemDiscount) * i.gstPct / 100;
//     }, 0);
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [items, discountAmt, subtotal]);
//   const grandTotal      = discountedSubtotal + gstAmount;
//   const received        = parseFloat(receivedAmount) || 0;
//   const totalUnits      = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
//   const status          = paymentStatus(grandTotal, received);
//   const navigate        = useNavigate();

//   const handleCustomerFieldChange = useCallback((field: "name" | "mobile", value: string) => {
//     setCustomer(prev => ({ ...prev, id: null, [field]: value }));
//     setCustomerSuggestionsOpen(true);
//     searchCustomers(value);
//   }, [searchCustomers]);

//   const handleSelectCustomer = useCallback((c: ApiCustomer) => {
//     // Build combined display name: show both person name and company name when both exist
//     const custName = c.cust_name?.trim() ?? "";
//     const cpyName  = c.cpy_name?.trim()  ?? "";
//     const displayName = custName && cpyName
//       ? `${custName} / ${cpyName}`   // "Ravi Kumar / Hero Motors"
//       : custName || cpyName;         // whichever exists

//     setCustomer({
//       id:      c.cust_uuid,
//       name:    displayName,
//       mobile:  primaryMobile(c),
//       address: customerAddress(c),
//       gstin:   c.gst ?? "",
//     });
//     setCustomerSuggestionsOpen(false);
//     clearCustomerResults();
//     setZone("CUSTOMER");
//   }, [clearCustomerResults]);

//   const handleSave = useCallback(async () => {
//     if (items.length === 0 || saving) return;
//     console.log("neeee",items)
//     const result = await saveOrder({
//       zodu_id: ZODU_ID, branch_id: BRANCH_ID,
//       items, customer, invoiceDate, discountPct,
//       discountFlat: discount, receivedAmount, paymentType, referenceNo,
//     });
//     if (result.success) {
//       const order    = result.order as any;
//       const totalAmt = parseFloat(order?.total_amount ?? "0");
//       const paidAmt  = parseFloat(order?.paid_amount  ?? "0");
//       const change   = paidAmt > totalAmt ? paidAmt - totalAmt : 0;
//       setSaveResult({ open: true, success: true, message: result.message, grandTotal: totalAmt, change });
//       if (printEnabled) console.log("🖨 Printing invoice");
//       handleClear();
//     } else {
//       setSaveResult({ open: true, success: false, message: result.message });
//     }
//   }, [items, customer, invoiceDate, discountPct, discount, receivedAmount, paymentType, referenceNo, printEnabled, saving, saveOrder, handleClear]);

//   const FOOTER_ORDER: FooterFocus[] = ["DISCOUNT_PCT", "DISCOUNT_AMT", "PAYMENT_TYPE", "REF_NO", "RECEIVED", "SAVE"];

//   // ── Keyboard handler ──────────────────────────────────────────
//   useEffect(() => {
//     const handler = (e: KeyboardEvent) => {
//       const active  = document.activeElement as HTMLElement;
//       const inInput = active?.tagName === "INPUT" || active?.tagName === "TEXTAREA" || active?.tagName === "SELECT";
//       if (active?.closest('[role="dialog"]')) return;

//       if (e.key === "F2") { e.preventDefault(); setShowSuggestions(false); setZone("SEARCH"); setSearchFocus("CODE"); return; }
//       if (e.key === "F4") { e.preventDefault(); handleClear(); return; }
//       if (e.key === "F7") { e.preventDefault(); setZone("FOOTER"); setFooterFocus("DISCOUNT_PCT"); return; }
//       if (e.key === "F8") { e.preventDefault(); handleSave(); return; }
//       if (e.key === "F9") { e.preventDefault(); handleHold(); return; }

//       const editingItem = items.find(i => i.editingQty || i.editingPrice);
//       if (editingItem) {
//         if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); editCancelledRef.current = true; (document.activeElement as HTMLElement)?.blur(); return; }
//         if (e.key === "Enter" || e.key === "Tab") return;
//         return;
//       }

//       if (zone === "SEARCH") {
//         // ── CODE sub-field ──────────────────────────────────────
//         if (searchFocus === "CODE") {
//           if (showSuggestions && suggestions.length > 0) {
//             if (e.key === "ArrowDown")  { e.preventDefault(); setSuggestionIdx(i => Math.min(i + 1, suggestions.length - 1)); return; }
//             if (e.key === "ArrowUp")    { e.preventDefault(); setSuggestionIdx(i => Math.max(i - 1, -1)); return; }
//             if (e.key === "Escape")     { e.preventDefault(); setShowSuggestions(false); setSuggestionIdx(-1); return; }
//             if (e.key === "Enter")      { e.preventDefault(); if (suggestionIdx >= 0 && suggestions[suggestionIdx]) selectSuggestion(suggestions[suggestionIdx]); else handleAddItem(); return; }
//             // ✅ Tab/→ while suggestions open → close suggestions, move to QTY (not customer)
//             if (e.key === "Tab" || e.key === "ArrowRight") {
//               e.preventDefault();
//               setShowSuggestions(false);
//               setSuggestionIdx(-1);
//               setSearchFocus("QTY");
//               return;
//             }
//           } else {
//             if (e.key === "Enter")     { e.preventDefault(); handleAddItem(); return; }
//             if (e.key === "ArrowDown") { e.preventDefault(); if (items.length > 0) { (document.activeElement as HTMLElement)?.blur(); setZone("TABLE"); setActiveRowIdx(0); } return; }
//             // ✅ Tab/→ from CODE → focus QTY first
//             if (e.key === "Tab" || e.key === "ArrowRight") {
//               e.preventDefault();
//               setSearchFocus("QTY");
//               return;
//             }
//           }
//           return;
//         }

//         // ── QTY sub-field ───────────────────────────────────────
//         if (searchFocus === "QTY") {
//           // ✅ ← from QTY → go back to CODE
//           if (e.key === "ArrowLeft") {
//             e.preventDefault();
//             setSearchFocus("CODE");
//             return;
//           }
//           // ✅ Tab/→ from QTY → now move to CUSTOMER
//           if (e.key === "Tab" || e.key === "ArrowRight") {
//             e.preventDefault();
//             (document.activeElement as HTMLElement)?.blur();
//             setZone("CUSTOMER");
//             return;
//           }
//           // Enter in QTY → add item using current codeInput
//           if (e.key === "Enter") {
//             e.preventDefault();
//             handleAddItem();
//             return;
//           }
//           // Escape from QTY → back to CODE
//           if (e.key === "Escape") {
//             e.preventDefault();
//             setSearchFocus("CODE");
//             return;
//           }
//           return;
//         }
//         return;
//       }

//       if (zone === "CUSTOMER") {
//         // ✅ ← / Escape from CUSTOMER → go back to QTY (not directly to CODE)
//         if (e.key === "Escape" || e.key === "ArrowLeft") {
//           e.preventDefault();
//           (document.activeElement as HTMLElement)?.blur();
//           setZone("SEARCH");
//           setSearchFocus("QTY");
//           return;
//         }
//         if (e.key === "ArrowDown") { e.preventDefault(); (document.activeElement as HTMLElement)?.blur(); setZone("TABLE"); setActiveRowIdx(0); return; }
//         return;
//       }

//       if (zone === "TABLE") {
//         const item = items[activeRowIdx];
//         if (!item) return;
//         if (e.key === "ArrowDown")  { e.preventDefault(); if (activeRowIdx < items.length - 1) setActiveRowIdx(i => i + 1); else { setZone("FOOTER"); setFooterFocus("DISCOUNT_PCT"); } return; }
//         if (e.key === "ArrowUp")    { e.preventDefault(); if (activeRowIdx > 0) setActiveRowIdx(i => i - 1); else { setZone("SEARCH"); setSearchFocus("CODE"); setActiveRowIdx(-1); } return; }
//         if (e.key === "Escape")     { e.preventDefault(); setActiveRowIdx(-1); setZone("SEARCH"); setSearchFocus("CODE"); return; }
//         if (e.key === "Enter")      { e.preventDefault(); startEditQty(item.code); return; }
//         if (e.key === "q" || e.key === "Q") { e.preventDefault(); startEditQty(item.code); return; }
//         if (e.key === "p" || e.key === "P") { e.preventDefault(); startEditPrice(item.code); return; }
//         if (e.key === "+" || e.key === "=") { e.preventDefault(); updateQty(item.code, 1); return; }
//         if (e.key === "-")          { e.preventDefault(); updateQty(item.code, -1); return; }
//         if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); removeItem(item.code); return; }
//         if (!inInput && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
//           setZone("SEARCH"); setSearchFocus("CODE"); setActiveRowIdx(-1);
//           setCodeInput(e.key); setTimeout(() => codeRef.current?.focus(), 10); return;
//         }
//         return;
//       }

//       if (zone === "FOOTER") {
//         const fi = FOOTER_ORDER.indexOf(footerFocus);
//         if (e.key === "ArrowRight") { e.preventDefault(); (document.activeElement as HTMLElement)?.blur(); if (fi < FOOTER_ORDER.length - 1) setFooterFocus(FOOTER_ORDER[fi + 1]); return; }
//         if (e.key === "ArrowLeft")  { e.preventDefault(); (document.activeElement as HTMLElement)?.blur(); if (fi > 0) setFooterFocus(FOOTER_ORDER[fi - 1]); return; }
//         if (e.key === "ArrowUp")    { e.preventDefault(); (document.activeElement as HTMLElement)?.blur(); setZone("TABLE"); setActiveRowIdx(items.length - 1); return; }
//         if (inInput && e.key === "Escape") { e.preventDefault(); (document.activeElement as HTMLElement)?.blur(); setZone("SEARCH"); setSearchFocus("CODE"); return; }
//         if (inInput) return;
//         if (e.key === "Escape") { e.preventDefault(); setZone("SEARCH"); setSearchFocus("CODE"); return; }
//         if (e.key === "Enter")  { e.preventDefault(); if (footerFocus === "SAVE") handleSave(); return; }
//         return;
//       }
//     };
//     window.addEventListener("keydown", handler);
//     return () => window.removeEventListener("keydown", handler);
//   }, [zone, searchFocus, activeRowIdx, footerFocus, showSuggestions, suggestions, suggestionIdx, items, handleAddItem, handleClear, handleHold, handleSave, selectSuggestion, startEditQty, startEditPrice]);

//   const isFooterActive = (f: FooterFocus) => zone === "FOOTER" && footerFocus === f;
//   const footerOutline  = (f: FooterFocus) => ({ outline: isFooterActive(f) ? "2.5px solid #C8102E" : "2.5px solid transparent", outlineOffset: 2, transition: "outline 0.12s" });

//   // ✅ Whether a search sub-field is "active" (for border highlight)
//   const isSearchActive = (sf: SearchFocus) => zone === "SEARCH" && searchFocus === sf;

//   // ─────────────────────────────────────────────────────────────
//   return (
//     <ThemeProvider theme={theme}>
//       <Box sx={{ minHeight: "100vh", bgcolor: "#F0F2F5", display: "flex", flexDirection: "column" }}>

//         {/* TOP BAR */}
//         <Box sx={{ bgcolor: "#fff", borderBottom: "1px solid #E5E7EB", px: { xs: 2, md: 3 }, py: 0.75, display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 50 }}>
//           <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
//             <Button onClick={() => navigate("/dashboard")} startIcon={<GridViewIcon />} sx={{ color: "#6B7280", fontWeight: 500, fontSize: 12 }}>Dashboard</Button>
//           </Box>
//           <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//             <Box sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 1.5, px: 1.5, py: 0.5 }}>
//               <CalendarTodayIcon sx={{ fontSize: 15, color: "#6B7280" }} />
//               <Typography sx={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.05em" }}>INVOICE DATE</Typography>
//               <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)}
//                 style={{ border: "none", outline: "none", background: "transparent", fontSize: 12, fontWeight: 700, color: "#1A1A2E", fontFamily: "inherit", cursor: "pointer" }} />
//             </Box>
//             <Divider orientation="vertical" flexItem />
//             <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
//               <Button onClick={() => navigate("/sales-history")} startIcon={<Receipt />} sx={{ backgroundColor: "#C8102E", color: "#fff", fontWeight: 500, fontSize: 12 }}>Sales History</Button>
//             </Box>
//             <Divider orientation="vertical" flexItem />
//             <Box sx={{ textAlign: "right" }}>
//               <Typography sx={{ fontSize: 10, color: "#9CA3AF", lineHeight: 1 }}>STATION 04</Typography>
//               <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#1A1A2E" }}>Cashier: Alex M.</Typography>
//             </Box>
//             <Box sx={{ width: 32, height: 32, bgcolor: "#FEE2E2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
//               <PersonOutlineIcon sx={{ color: "#C8102E", fontSize: 18 }} />
//             </Box>
//           </Box>
//         </Box>

//         {/* MAIN CONTENT */}
//         <Box sx={{ flex: 1, px: { xs: 1.5, md: 2 }, pt: 1.5, pb: 1 }}>
//           <Box sx={{ display: "flex", gap: 2, mb: 1.5, alignItems: "stretch" }}>

//             {/* ── Search panel ── */}
//             <Paper elevation={0} sx={{
//               flex: "1 1 auto", borderRadius: 2, p: 1.5, bgcolor: "#fff",
//               position: "relative", zIndex: 100, transition: "border-color 0.2s",
//               border: zone === "SEARCH" ? "2px solid #C8102E" : "2px solid #E5E7EB",
//               boxShadow: zone === "SEARCH" ? "0 0 0 3px rgba(200,16,46,0.08)" : "none",
//             }}>
//               <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-end" }}>
//                 <Box sx={{ flex: 1, position: "relative" }}>
//                   <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.4 }}>
//                     <Typography sx={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#C8102E" }}>ITEM ID / NAME</Typography>
//                     <Kbd>F2</Kbd>
//                     {catalogueLoading
//                       ? <Typography sx={{ fontSize: 9, color: "#9CA3AF", ml: 0.5 }}>syncing…</Typography>
//                       : catalogueTotal > 0 && <Typography sx={{ fontSize: 9, color: "#10B981", ml: 0.5 }}>● {catalogueTotal.toLocaleString()} items</Typography>
//                     }
//                   </Box>
//                   <TextField
//                     inputRef={codeRef} value={codeInput}
//                     onChange={e => setCodeInput(e.target.value)}
//                     onFocus={() => { setZone("SEARCH"); setSearchFocus("CODE"); if (!catalogueLoading && codeInput.trim()) setShowSuggestions(true); }}
//                     onBlur={() => setTimeout(() => setShowSuggestions(false), 180)}
//                     placeholder="Search by item ID, name or category…"
//                     size="small" fullWidth autoComplete="off"
//                     InputProps={{
//                       startAdornment: <InputAdornment position="start"><QrCodeScannerIcon sx={{ color: "#C8102E", fontSize: 18 }} /></InputAdornment>,
//                       endAdornment: codeInput
//                         ? <InputAdornment position="end"><IconButton size="small" onMouseDown={e => { e.preventDefault(); setCodeInput(""); setShowSuggestions(false); codeRef.current?.focus(); }}><CloseIcon sx={{ fontSize: 13, color: "#9CA3AF" }} /></IconButton></InputAdornment>
//                         : <InputAdornment position="end"><SearchIcon sx={{ fontSize: 15, color: "#D1D5DB" }} /></InputAdornment>,
//                       sx: { borderRadius: 1.5, bgcolor: "#FAFAFA", fontSize: 13 },
//                     }}
//                     sx={{ "& .MuiOutlinedInput-root": {
//                       "& fieldset": { borderColor: isSearchActive("CODE") ? "#C8102E" : "#E5E7EB", borderWidth: isSearchActive("CODE") ? 2 : 1 },
//                       "&:hover fieldset": { borderColor: "#C8102E" },
//                       "&.Mui-focused fieldset": { borderColor: "#C8102E" },
//                     }}}
//                   />

//                   {/* Suggestions dropdown */}
//                   {showSuggestions && (
//                     <Paper elevation={8} sx={{ position: "absolute", top: "calc(100% + 2px)", left: 0, right: 0, borderRadius: "0 0 8px 8px", overflow: "hidden", zIndex: 9999, border: "1px solid #E0E0E0", borderTop: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
//                       <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 1.5, py: 0.6, bgcolor: "#F5F5F5", borderBottom: "1px solid #E5E7EB" }}>
//                         <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>Item Name</Typography>
//                         <IconButton size="small" onMouseDown={e => { e.preventDefault(); setShowSuggestions(false); }} sx={{ p: 0.2 }}><CloseIcon sx={{ fontSize: 13, color: "#9CA3AF" }} /></IconButton>
//                       </Box>
//                       {codeInput.trim() && suggestions.length === 0 && (
//                         <Box sx={{ py: 3, textAlign: "center" }}>
//                           <Typography sx={{ fontSize: 12, color: "#9CA3AF" }}>No items found for "{codeInput.trim()}"</Typography>
//                         </Box>
//                       )}
//                       {suggestions.length > 0 && (
//                         <Box sx={{ maxHeight: 300, overflowY: "auto", bgcolor: "#fff" }}>
//                           {suggestions.map((p, idx) => (
//                             <Box key={p.item_id} onMouseDown={() => selectSuggestion(p)}
//                               sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1.5, py: 0.75, cursor: "pointer", gap: 1.5, bgcolor: idx === suggestionIdx ? "#EFF6FF" : "#fff", borderBottom: "1px solid #F3F4F6", borderLeft: idx === suggestionIdx ? "3px solid #3B82F6" : "3px solid transparent", "&:hover": { bgcolor: "#F9FAFB", borderLeft: "3px solid #6B7280" }, transition: "all 0.08s" }}>
//                               <Box sx={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 1 }}>
//                                 <Box sx={{ flexShrink: 0, bgcolor: "#F3F4F6", border: "1px solid #E5E7EB", borderRadius: 1, px: 0.7, py: 0.15 }}>
//                                   <Typography sx={{ fontSize: 10, fontWeight: 700, fontFamily: "monospace", color: "#374151", whiteSpace: "nowrap" }}>{p.item_id}</Typography>
//                                 </Box>
//                                 <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//                                   <Highlight text={p.item_name} query={codeInput} />
//                                 </Typography>
//                               </Box>
//                               <Box sx={{ textAlign: "right", flexShrink: 0 }}>
//                                 <Typography sx={{ fontSize: 13, fontWeight: 700, color: idx === suggestionIdx ? "#1D4ED8" : "#111827" }}>₹{Number(p.sell_price).toLocaleString("en-IN")}<Typography sx={{ fontSize: 9, color: p.tax_inclusive ? "#D97706" : "#9CA3AF", fontWeight: p.tax_inclusive ? 700 : 400, lineHeight: 1 }}>
//                                   / per {p.unit || "NOS"}
//                                 </Typography></Typography>
                                
//                               </Box>
//                             </Box>
//                           ))}
//                         </Box>
//                       )}
//                     </Paper>
//                   )}
//                 </Box>

//                 {/* ✅ QTY field — highlighted when QTY is active sub-field */}
//                 <Box sx={{ width: 80 }}>
//                   <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.4 }}>
//                     <Typography sx={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: isSearchActive("QTY") ? "#C8102E" : "#374151" }}>QTY</Typography>
//                   </Box>
//                   <TextField
//                     inputRef={qtySearchRef} value={searchQty}
//                     onChange={e => setSearchQty(e.target.value.replace(/\D/g, ""))}
//                     onFocus={() => { setZone("SEARCH"); setSearchFocus("QTY"); }}
//                     placeholder="1" size="small" fullWidth autoComplete="off"
//                     inputProps={{ style: { textAlign: "center", fontWeight: 700, fontSize: 14 } }}
//                     sx={{ "& .MuiOutlinedInput-root": {
//                       borderRadius: 1.5, bgcolor: "#FAFAFA", fontSize: 13,
//                       "& fieldset": { borderColor: isSearchActive("QTY") ? "#C8102E" : "#E5E7EB", borderWidth: isSearchActive("QTY") ? 2 : 1 },
//                       "&:hover fieldset": { borderColor: "#C8102E" },
//                       "&.Mui-focused fieldset": { borderColor: "#C8102E" },
//                     }}}
//                   />
//                 </Box>

//                 <Button variant="contained" startIcon={<AddShoppingCartIcon />} onClick={() => handleAddItem()}
//                   sx={{ bgcolor: "#C8102E", color: "#fff", px: 2.5, py: 0.9, fontSize: 13, fontWeight: 700, borderRadius: 1.5, minHeight: 38, whiteSpace: "nowrap", boxShadow: "0 4px 14px rgba(200,16,46,0.35)", "&:hover": { bgcolor: "#A50D26" }, "&:active": { transform: "scale(0.97)" } }}>
//                   ADD <Box component="span" sx={{ fontSize: 10, opacity: 0.8, ml: 0.4 }}>[Enter]</Box>
//                 </Button>
//               </Box>
//             </Paper>

//             {/* ── Customer panel ── */}
//             <Paper elevation={0} sx={{ minWidth: 800, border: zone === "CUSTOMER" ? "2px solid #C8102E" : "1px solid #E5E7EB", borderRadius: 2.5, p: 1.5, bgcolor: "#fff", transition: "border 0.2s, box-shadow 0.2s", position: "relative", boxShadow: zone === "CUSTOMER" ? "0 0 0 3px rgba(200,16,46,0.08)" : "none" }}>
//               <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1.5, mb: 1.2 }}>
//                 <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
//                   <PersonSearchIcon sx={{ fontSize: 15, color: "#C8102E" }} />
//                   <Typography sx={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color: "#374151" }}>CUSTOMER</Typography>
//                   {customer.id && (
//                     <Chip label="Linked" size="small" onDelete={() => { setCustomer(EMPTY_CUSTOMER); clearCustomerResults(); }}
//                       sx={{ fontSize: 9, height: 18, bgcolor: "#DCFCE7", color: "#16A34A", fontWeight: 700 }} />
//                   )}
//                 </Box>
//                 <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                   <Button size="small" variant="outlined" onClick={() => setAddCustomerOpen(true)}
//                     sx={{ borderColor: "#F3C4CB", color: "#C8102E", fontSize: 9, fontWeight: 800, px: 1.25, py: 0.55, borderRadius: 1.5, minWidth: 0, whiteSpace: "nowrap", "&:hover": { borderColor: "#C8102E", bgcolor: "#FFF5F6" } }}>
//                     Add Customer
//                   </Button>
//                   <Button size="small" variant="outlined" onClick={() => setCustomerLedgerOpen(true)}
//                     sx={{ borderColor: "#F3C4CB", color: "#C8102E", fontSize: 9, fontWeight: 800, px: 1.25, py: 0.55, borderRadius: 1.5, minWidth: 0, whiteSpace: "nowrap", "&:hover": { borderColor: "#C8102E", bgcolor: "#FFF5F6" } }}>
//                     View Ledger / History
//                   </Button>
//                 </Box>
//               </Box>

//               <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1 }}>
//                 <TextField inputRef={customerNameRef} value={customer.name}
//                   onChange={e => handleCustomerFieldChange("name", e.target.value)}
//                   onFocus={() => { setZone("CUSTOMER"); if (customer.name.trim()) setCustomerSuggestionsOpen(true); }}
//                   onBlur={() => setTimeout(() => setCustomerSuggestionsOpen(false), 180)}
//                   placeholder="Name or company" size="small" autoComplete="off"
//                   sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.75, fontSize: 12, bgcolor: "#F8FAFC", "& fieldset": { borderColor: "#E2E8F0" }, "&:hover fieldset": { borderColor: "#C8102E" }, "&.Mui-focused fieldset": { borderColor: "#C8102E" } } }}
//                   inputProps={{ style: { padding: "7px 12px", fontWeight: 500 } }}
//                 />
//                 <TextField inputRef={customerMobileRef} value={customer.mobile}
//                   onChange={e => handleCustomerFieldChange("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
//                   onFocus={() => { setZone("CUSTOMER"); if (customer.mobile.trim()) setCustomerSuggestionsOpen(true); }}
//                   onBlur={() => setTimeout(() => setCustomerSuggestionsOpen(false), 180)}
//                   placeholder="Mobile" size="small" autoComplete="off"
//                   sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.75, fontSize: 12, bgcolor: "#F8FAFC", "& fieldset": { borderColor: "#E2E8F0" }, "&:hover fieldset": { borderColor: "#C8102E" }, "&.Mui-focused fieldset": { borderColor: "#C8102E" } } }}
//                   inputProps={{ style: { padding: "7px 12px", fontWeight: 500, fontFamily: "monospace", letterSpacing: "0.04em" } }}
//                 />
//               </Box>

//               {customerSuggestionsOpen && (customer.name.trim() || customer.mobile.trim()) && (
//                 <Paper elevation={8} sx={{ position: "absolute", top: "calc(100% - 4px)", left: 12, right: 12, zIndex: 9998, borderRadius: 2, border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 16px 40px rgba(15,23,42,0.16)" }}>
//                   <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1.5, py: 1, bgcolor: "#FFF7F8", borderBottom: "1px solid #F3D6DB" }}>
//                     <Box>
//                       <Typography sx={{ fontSize: 10, fontWeight: 800, color: "#374151", letterSpacing: "0.06em" }}>CUSTOMER SEARCH</Typography>
//                       <Typography sx={{ fontSize: 9, color: "#9CA3AF" }}>Select to auto-fill mobile, address and GSTIN.</Typography>
//                     </Box>
//                     {customerLoading
//                       ? <CircularProgress size={12} sx={{ color: "#C8102E" }} />
//                       : <Typography sx={{ fontSize: 9, fontWeight: 800, color: "#C8102E" }}>{customerResults.length} result{customerResults.length !== 1 ? "s" : ""}</Typography>
//                     }
//                   </Box>
//                   {!customerLoading && customerResults.length === 0
//                     ? <Box sx={{ px: 2, py: 3, textAlign: "center" }}><Typography sx={{ fontSize: 12, color: "#9CA3AF" }}>No matching customers found.</Typography></Box>
//                     : <Box sx={{ maxHeight: 280, overflowY: "auto", bgcolor: "#fff" }}>
//                         {customerResults.map(c => (
//                           <Box key={c.cust_uuid} onMouseDown={() => handleSelectCustomer(c)}
//                             sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1, px: 1.5, py: 1.1, borderBottom: "1px solid #F8FAFC", cursor: "pointer", "&:hover": { bgcolor: "#FFF7F8" } }}>
//                             <Box sx={{ minWidth: 0 }}>
//                               {/* Person name */}
//                               {c.cust_name && (
//                                 <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#1F2937", lineHeight: 1.3 }}>
//                                   {c.cust_name}
//                                 </Typography>
//                               )}
//                               {/* Company name — shown below with a building icon style */}
//                               {c.cpy_name && (
//                                 <Typography sx={{ fontSize: 11, fontWeight: 600, color: c.cust_name ? "#6B7280" : "#1F2937", lineHeight: 1.3 }}>
//                                   {c.cust_name ? `🏢 ${c.cpy_name}` : c.cpy_name}
//                                 </Typography>
//                               )}
//                               <Typography sx={{ fontSize: 10, color: "#9CA3AF", mt: 0.2 }}>
//                                 {primaryMobile(c)}{c.city ? ` • ${c.city}` : ""}
//                               </Typography>
//                             </Box>
//                             {c.gst && <Typography sx={{ fontSize: 9, fontWeight: 700, color: "#6B7280", fontFamily: "monospace", whiteSpace: "nowrap" }}>{c.gst}</Typography>}
//                           </Box>
//                         ))}
//                       </Box>
//                   }
//                   <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 1.5, py: 0.85, bgcolor: "#FCFCFD", borderTop: "1px solid #EEF2F7" }}>
//                     <Typography sx={{ fontSize: 9, color: "#9CA3AF", fontWeight: 700 }}>Type to search by name or mobile</Typography>
//                     <Button size="small" variant="contained" onClick={() => { setCustomerSuggestionsOpen(false); setAddCustomerOpen(true); }}
//                       sx={{ bgcolor: "#C8102E", fontSize: 9, fontWeight: 800, borderRadius: 1.5, px: 1.1, py: 0.45, "&:hover": { bgcolor: "#A50D26" } }}>+ Add New</Button>
//                   </Box>
//                 </Paper>
//               )}
//             </Paper>
//           </Box>

//           {/* ORDER TABLE */}
//           <Paper elevation={0} sx={{ border: zone === "TABLE" ? "2px solid #1976d2" : "1px solid #E5E7EB", borderRadius: 2, overflow: "hidden", mb: 1.5, transition: "border 0.2s", boxShadow: zone === "TABLE" ? "0 0 0 3px rgba(245,158,11,0.1)" : "none" }}>
//             <Box sx={{ maxHeight: "calc(100vh - 460px)", overflowY: "auto" }}>
//               <Table size="small" stickyHeader>
//                 <TableHead>
//                   <TableRow>
//                     <TableCell sx={{ width: 10, p: 0 }} />
//                     <TableCell sx={{ width: 70 }}>ITEM ID</TableCell>
//                     <TableCell>DESCRIPTION</TableCell>
//                     <TableCell sx={{ width: 70 }}>HSN</TableCell>
//                     <TableCell align="center" sx={{ width: 60 }}>GST%</TableCell>
//                     <TableCell align="right"  sx={{ width: 90 }}>GST AMT</TableCell>
//                     <TableCell align="right"  sx={{ width: 90 }}>MRP (₹)</TableCell>
//                     <TableCell align="center" sx={{ width: 130 }}><Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.4 }}>QTY <Kbd>Q</Kbd></Box></TableCell>
//                     <TableCell align="right"  sx={{ width: 130 }}><Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.4 }}>RATE <Kbd>P</Kbd></Box></TableCell>
//                     <TableCell align="right"  sx={{ width: 105 }}>TOTAL</TableCell>
//                     <TableCell sx={{ width: 36 }} />
//                   </TableRow>
//                 </TableHead>
//                 <TableBody ref={tableBodyRef}>
//                   {items.length === 0 && (
//                     <TableRow>
//                       <TableCell colSpan={11} align="center" sx={{ py: 6 }}>
//                         <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, color: "#D1D5DB" }}>
//                           <KeyboardReturnIcon sx={{ fontSize: 32 }} />
//                           <Typography sx={{ fontSize: 13 }}>Search and add items above</Typography>
//                         </Box>
//                       </TableCell>
//                     </TableRow>
//                   )}
//                   {items.map((item, rowIdx) => {
//                     const isActive  = zone === "TABLE" && activeRowIdx === rowIdx;
//                     const itemGst   = (item.qty * item.unitPrice * item.gstPct) / 100;
//                     const itemTotal = item.qty * item.sellPrice; // gross sell price × qty = base + tax
//                     return (
//                       <Fade in key={item.code}>
//                         <TableRow data-rowcode={item.code} onClick={() => { setZone("TABLE"); setActiveRowIdx(rowIdx); }}
//                           sx={{ bgcolor: flashRow === item.code ? "#FFF1F3" : isActive ? "#E3F2FD" : "transparent", cursor: "pointer", transition: "background 0.2s", "&:hover": { bgcolor: isActive ? "#E3F2FD" : "#F5F5F5" } }}>
//                           <TableCell sx={{ p: 0 }}>
//                             <Box sx={{ width: 4, minHeight: 40, bgcolor: isActive ? "#1976D2" : "transparent", borderRadius: "0 2px 2px 0", transition: "background 0.2s" }} />
//                           </TableCell>
//                           <TableCell>
//                             <Chip label={item.code} size="small" sx={{ fontWeight: 700, fontSize: 10, bgcolor: isActive ? "#BBDEFB" : "#F3F4F6", color: isActive ? "#0D47A1" : "#374151", border: isActive ? "1px solid #90CAF9" : "1px solid transparent", height: 20 }} />
//                           </TableCell>
//                           <TableCell>
//                             <Typography sx={{ fontSize: 12, fontWeight: isActive ? 600 : 500, color: "#1A1A2E", lineHeight: 1.3 }}>{item.description}</Typography>
//                             {item.category && <Typography sx={{ fontSize: 9, fontWeight: 700, color: CAT_COLOR[item.category] ?? "#6B7280" }}>{item.category}</Typography>}
//                           </TableCell>
//                           <TableCell><Typography sx={{ fontSize: 11, fontFamily: "monospace", color: "#374151", fontWeight: 600 }}>{item.hsn}</Typography></TableCell>
//                           <TableCell align="center"><Typography sx={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>{item.gstPct}%</Typography></TableCell>
//                           <TableCell align="right"><Typography sx={{ fontSize: 11, color: "#374151", fontWeight: 600 }}>{INR(itemGst)}</Typography></TableCell>
//                           <TableCell align="right"><Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>₹{item.mrp.toLocaleString("en-IN")}</Typography></TableCell>
//                           {/* QTY */}
//                           <TableCell align="center" onClick={e => e.stopPropagation()}>
//                             <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.3 }}>
//                               <IconButton size="small" onClick={() => updateQty(item.code, -1)} sx={{ width: 24, height: 24, bgcolor: "#F3F4F6", "&:hover": { bgcolor: "#FEE2E2" } }}><RemoveIcon sx={{ fontSize: 12 }} /></IconButton>
//                               {item.editingQty ? (
//                                 <TextField inputRef={el => { qtyRefs.current[item.code] = el; }} value={item.qtyDraft ?? ""}
//                                   onChange={e => setItems(prev => prev.map(i => i.code === item.code ? { ...i, qtyDraft: e.target.value.replace(/\D/, "") } : i))}
//                                   onBlur={() => { if (editCancelledRef.current) { editCancelledRef.current = false; return; } const el = qtyRefs.current[item.code]; const newQty = Math.max(1, parseInt(el?.value ?? "") || 1); setItems(prev => prev.map(i => i.code === item.code ? { ...i, qty: newQty, editingQty: false, qtyDraft: undefined } : i)); setZone("TABLE"); setActiveRowIdx(rowIdx); }}
//                                   onKeyDown={e => { if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); e.stopPropagation(); const newQty = Math.max(1, parseInt((e.target as HTMLInputElement).value) || 1); editCancelledRef.current = true; setItems(prev => prev.map(i => i.code === item.code ? { ...i, qty: newQty, editingQty: false, qtyDraft: undefined } : i)); (e.target as HTMLElement).blur(); setZone("TABLE"); setActiveRowIdx(rowIdx); } if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); editCancelledRef.current = true; setItems(prev => prev.map(i => i.code === item.code ? { ...i, editingQty: false, qtyDraft: undefined } : i)); (e.target as HTMLElement).blur(); setZone("TABLE"); setActiveRowIdx(rowIdx); } }}
//                                   size="small" inputProps={{ style: { textAlign: "center", fontWeight: 800, fontSize: 14, padding: "2px 2px", width: 32 } }}
//                                   sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1, "& fieldset": { borderColor: "#1976D2", borderWidth: 2 } }, width: 48 }} />
//                               ) : (
//                                 <Box onClick={() => { setZone("TABLE"); setActiveRowIdx(rowIdx); if (isActive) startEditQty(item.code); }}
//                                   sx={{ minWidth: 30, textAlign: "center", fontWeight: 800, fontSize: 14, px: 0.4, py: 0.2, borderRadius: 1, cursor: isActive ? "text" : "pointer", border: isActive ? "1.5px dashed #1976D2" : "1.5px dashed transparent", bgcolor: isActive ? "#E3F2FD" : "transparent", "&:hover": { border: "1.5px dashed #1976D2", bgcolor: "#E3F2FD" }, transition: "all 0.15s" }}>
//                                   {item.qty}
//                                 </Box>
//                               )}
//                               <IconButton size="small" onClick={() => updateQty(item.code, 1)} sx={{ width: 24, height: 24, bgcolor: "#F3F4F6", "&:hover": { bgcolor: "#DCFCE7" } }}><AddIcon sx={{ fontSize: 12 }} /></IconButton>
//                             </Box>
//                           </TableCell>
//                           {/* RATE */}
//                           <TableCell align="right" onClick={e => e.stopPropagation()}>
//                             {item.editingPrice ? (
//                               <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.4 }}>
//                                 <Typography sx={{ fontSize: 11, color: "#9CA3AF", fontWeight: 700 }}>₹</Typography>
//                                 <TextField inputRef={el => { priceRefs.current[item.code] = el; }} value={item.priceDraft ?? ""}
//                                   onChange={e => setItems(prev => prev.map(i => i.code === item.code ? { ...i, priceDraft: e.target.value.replace(/[^0-9.]/g, "") } : i))}
//                                   onBlur={() => { if (editCancelledRef.current) { editCancelledRef.current = false; return; } const el = priceRefs.current[item.code]; const newSell = Math.max(0, parseFloat(el?.value ?? "") || item.sellPrice); const newBase = item.taxInclusive && item.gstPct > 0 ? newSell / (1 + item.gstPct / 100) : newSell; setItems(prev => prev.map(i => i.code === item.code ? { ...i, sellPrice: newSell, unitPrice: newBase, editingPrice: false, priceDraft: undefined } : i)); setZone("TABLE"); setActiveRowIdx(rowIdx); }}
//                                   onKeyDown={e => { if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); e.stopPropagation(); const newSell = Math.max(0, parseFloat((e.target as HTMLInputElement).value) || item.sellPrice); const newBase = item.taxInclusive && item.gstPct > 0 ? newSell / (1 + item.gstPct / 100) : newSell; editCancelledRef.current = true; setItems(prev => prev.map(i => i.code === item.code ? { ...i, sellPrice: newSell, unitPrice: newBase, editingPrice: false, priceDraft: undefined } : i)); (e.target as HTMLElement).blur(); setZone("TABLE"); setActiveRowIdx(rowIdx); } if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); editCancelledRef.current = true; setItems(prev => prev.map(i => i.code === item.code ? { ...i, editingPrice: false, priceDraft: undefined } : i)); (e.target as HTMLElement).blur(); setZone("TABLE"); setActiveRowIdx(rowIdx); } }}
//                                   size="small" inputProps={{ style: { textAlign: "right", fontWeight: 700, fontSize: 12, padding: "2px 4px", width: 60 } }}
//                                   sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1, "& fieldset": { borderColor: "#1976D2", borderWidth: 2 } }, width: 80 }} />
//                               </Box>
//                             ) : (
//                               <Box onClick={() => { setZone("TABLE"); setActiveRowIdx(rowIdx); if (isActive) startEditPrice(item.code); }}
//                                 sx={{ display: "inline-flex", alignItems: "center", gap: 0.3, px: 0.6, py: 0.2, borderRadius: 1, cursor: isActive ? "text" : "pointer", border: isActive ? "1.5px dashed #1976D2" : "1.5px dashed transparent", bgcolor: isActive ? "#E3F2FD" : "transparent", "&:hover": { border: "1.5px dashed #1976D2", bgcolor: "#E3F2FD", "& .pedit": { opacity: 1 } }, transition: "all 0.15s" }}>
//                                 <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
//                                   <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{INR(item.sellPrice)}</Typography>
//                                   {/* Badge: tells cashier whether rate shown is base (ex-GST) or gross */}
//                                   {/* <Typography sx={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.04em", color: item.taxInclusive ? "#D97706" : "#10B981", lineHeight: 1 }}>
//                                     {item.taxInclusive ? "INCL.→EX-GST" : "EX-GST"}
//                                   </Typography> */}
//                                 </Box>
//                                 <EditIcon className="pedit" sx={{ fontSize: 10, color: "#1976D2", opacity: isActive ? 0.6 : 0, transition: "opacity 0.15s" }} />
//                               </Box>
//                             )}
//                           </TableCell>
//                           <TableCell align="right"><Typography sx={{ fontSize: 13, fontWeight: 700, color: isActive ? "#0D47A1" : "#1A1A2E" }}>{INR(itemTotal)}</Typography></TableCell>
//                           <TableCell onClick={e => e.stopPropagation()}>
//                             <IconButton size="small" onClick={() => removeItem(item.code)} sx={{ color: "#D1D5DB", "&:hover": { color: "#C8102E", bgcolor: "#FEE2E2" } }}><DeleteOutlineIcon sx={{ fontSize: 15 }} /></IconButton>
//                           </TableCell>
//                         </TableRow>
//                       </Fade>
//                     );
//                   })}
//                 </TableBody>
//               </Table>
//             </Box>
//           </Paper>
//         </Box>

//         {/* FOOTER TOOLBAR */}
//         <Box sx={{ bgcolor: "#F8FAFC", px: 2, py: 0.55, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//           <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
//             <Button size="small" startIcon={<DeleteOutlineIcon sx={{ fontSize: 12 }} />} onClick={handleClear} sx={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700, py: 0.3, px: 1, minWidth: 0, borderRadius: 1, "&:hover": { color: "#F87171", bgcolor: "rgba(239,68,68,0.1)" } }}>CLEAR <Box component="span" sx={{ fontSize: 9, opacity: 0.6 }}>[F4]</Box></Button>
//             <Button size="small" startIcon={<PauseCircleOutlineIcon sx={{ fontSize: 12 }} />} onClick={handleHold} sx={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700, py: 0.3, px: 1, minWidth: 0, borderRadius: 1, "&:hover": { color: "#60A5FA", bgcolor: "rgba(96,165,250,0.1)" } }}>HOLD <Box component="span" sx={{ fontSize: 9, opacity: 0.6 }}>[F9]</Box></Button>
//             <Badge badgeContent={heldOrders.length} sx={{ "& .MuiBadge-badge": { fontSize: 8, minWidth: 13, height: 13, bgcolor: "#C8102E", color: "#fff" } }}>
//               <Button size="small" startIcon={<PlayArrowIcon sx={{ fontSize: 12 }} />} onClick={() => setHoldDialogOpen(true)} sx={{ fontSize: 10, color: heldOrders.length > 0 ? "#60A5FA" : "#9CA3AF", fontWeight: 700, py: 0.3, px: 1, minWidth: 0, borderRadius: 1, "&:hover": { bgcolor: "rgba(96,165,250,0.1)" } }}>RECALL</Button>
//             </Badge>
//           </Box>
//           <Divider orientation="vertical" flexItem />
//           <Box sx={{ display: { xs: "none", xl: "flex" }, gap: 1, alignItems: "center" }}>
//             {[["F2","Search"],["→","Code→Qty→Cust"],["Q","Qty"],["P","Price"],["↑↓","Rows"],["←→","Footer"],["F9","Hold"],["F8","Save"],["+−","Quick qty"],["Del","Remove"]].map(([k, l]) => (
//               <Box key={k+l} sx={{ display: "flex", alignItems: "center", gap: 0.3 }}><Kbd>{k}</Kbd><Typography sx={{ fontSize: 9, color: "#9CA3AF" }}>{l}</Typography></Box>
//             ))}
//           </Box>
//           <Divider orientation="vertical" flexItem />
//           <Typography sx={{ fontSize: 10, color: "#6B7280", fontWeight: 700, letterSpacing: "0.08em" }}>ITEMS: {totalUnits} UNITS</Typography>
//         </Box>

//         {/* BILLING FOOTER */}
//         <Box sx={{ bgcolor: "#fff", borderTop: "1px solid #E5E7EB", px: 2.5, py: 1.5, display: "flex", gap: 2, alignItems: "stretch" }}>
//           {/* COL 1 */}
//           <Box sx={{ flex: 0.5, display: "flex", flexDirection: "column", gap: 1.5, justifyContent: "flex-start", pt: 0.5 }}>
//             <Box>
//               <Typography sx={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.08em", mb: 0.5 }}>PAYMENT TYPE</Typography>
//               <Select value={paymentType} onChange={e => setPaymentType(e.target.value as PaymentType)}
//                 onFocus={() => { setZone("FOOTER"); setFooterFocus("PAYMENT_TYPE"); }}
//                 size="small" fullWidth
//                 sx={{ fontSize: 13, fontWeight: 600, borderRadius: 1.5, "& fieldset": { borderColor: isFooterActive("PAYMENT_TYPE") ? "#C8102E" : "#E5E7EB", borderWidth: isFooterActive("PAYMENT_TYPE") ? 2 : 1 }, "&:hover fieldset": { borderColor: "#C8102E" } }}>
//                 {["Cash","Card","UPI","Credit"].map(val => <MenuItem key={val} value={val} sx={{ fontSize: 13, fontWeight: 600 }}>{val}</MenuItem>)}
//               </Select>
//             </Box>
//             <Box>
//               <Typography sx={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.08em", mb: 0.5 }}>REFERENCE NO.</Typography>
//               <TextField inputRef={refNoRef} value={referenceNo} onChange={e => setReferenceNo(e.target.value)}
//                 onFocus={() => { setZone("FOOTER"); setFooterFocus("REF_NO"); }}
//                 placeholder="Enter Transaction ID" size="small" fullWidth
//                 inputProps={{ style: { padding: "6px 12px", fontSize: 13 } }}
//                 sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5, "& fieldset": { borderColor: isFooterActive("REF_NO") ? "#C8102E" : "#E5E7EB", borderWidth: isFooterActive("REF_NO") ? 2 : 1 }, "&:hover fieldset": { borderColor: "#C8102E" } } }}
//               />
//             </Box>
//           </Box>
//           <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
//           {/* COL 2 */}
//           <Box sx={{ flex: 0.7, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
//             <Box>
//               {[
//                 { label: "SUBTOTAL", value: INR(subtotal),           color: "#1A1A2E" },
//                 { label: "DISCOUNT", value: `− ${INR(discountAmt)}`, color: discountAmt > 0 ? "#16A34A" : "#9CA3AF" },
//                 { label: "GST",      value: INR(gstAmount),          color: "#1A1A2E" },
//               ].map(row => (
//                 <Box key={row.label} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.4, borderBottom: "1px solid #F3F4F6" }}>
//                   <Typography sx={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500, letterSpacing: "0.04em" }}>{row.label}</Typography>
//                   <Typography sx={{ fontSize: 12, fontWeight: 600, color: row.color, fontFamily: "monospace" }}>{row.value}</Typography>
//                 </Box>
//               ))}
//               <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.6 }}>
//                 <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#1A1A2E", letterSpacing: "0.04em" }}>GRAND TOTAL</Typography>
//                 <Typography sx={{ fontSize: 15, fontWeight: 900, color: "#1A1A2E", fontFamily: "monospace" }}>₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</Typography>
//               </Box>
//             </Box>
//             <Box>
//               <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
//                 <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#C8102E", letterSpacing: "0.06em" }}>DISCOUNT</Typography>
//                 <Kbd>F7</Kbd>
//               </Box>
//               <Box sx={{ display: "flex", gap: 1 }}>
//                 <TextField inputRef={discountPctRef} value={discountPct} onChange={e => setDiscountPct(e.target.value.replace(/[^0-9.]/g, ""))}
//                   onFocus={() => { setZone("FOOTER"); setFooterFocus("DISCOUNT_PCT"); }} size="small"
//                   InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF" }}>%</Typography></InputAdornment> }}
//                   inputProps={{ style: { padding: "5px 6px", fontSize: 13, fontWeight: 600 } }}
//                   sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 1.5, "& fieldset": { borderColor: isFooterActive("DISCOUNT_PCT") ? "#C8102E" : "#E5E7EB", borderWidth: isFooterActive("DISCOUNT_PCT") ? 2 : 1 }, "&:hover fieldset": { borderColor: "#C8102E" } } }}
//                 />
//                 <TextField inputRef={discountAmtRef} value={discount} onChange={e => setDiscount(e.target.value.replace(/[^0-9.]/g, ""))}
//                   onFocus={() => { setZone("FOOTER"); setFooterFocus("DISCOUNT_AMT"); }} size="small"
//                   InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF" }}>₹</Typography></InputAdornment> }}
//                   inputProps={{ style: { padding: "5px 6px", fontSize: 13, fontWeight: 600 } }}
//                   sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 1.5, "& fieldset": { borderColor: isFooterActive("DISCOUNT_AMT") ? "#C8102E" : "#E5E7EB", borderWidth: isFooterActive("DISCOUNT_AMT") ? 2 : 1 }, "&:hover fieldset": { borderColor: "#C8102E" } } }}
//                 />
//               </Box>
//             </Box>
//           </Box>
//           <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
//           {/* COL 3 */}
//           <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
//             <Box onClick={() => receivedRef.current?.focus()}
//               sx={{ flex: 1, border: `2px solid ${isFooterActive("RECEIVED") ? "#C8102E" : "#FECDD3"}`, borderRadius: 2, px: 2, py: 1, textAlign: "right", bgcolor: isFooterActive("RECEIVED") ? "#FFF1F3" : "#FFF5F6", cursor: "text", transition: "border-color 0.15s, background 0.15s", "&:hover": { borderColor: "#C8102E", bgcolor: "#FFF1F3" } }}>
//               <Typography sx={{ fontSize: 9, fontWeight: 800, color: "#C8102E", letterSpacing: "0.1em", mb: 0.2 }}>RECEIVED AMOUNT</Typography>
//               <Box sx={{ display: "flex", alignItems: "center" }}>
//                 <Typography sx={{ fontSize: 26, fontWeight: 900, color: "#C8102E", lineHeight: 1, mr: 0.3, fontFamily: "monospace" }}>₹</Typography>
//                 <TextField inputRef={receivedRef} value={receivedAmount} onChange={e => setReceivedAmount(e.target.value.replace(/[^0-9.]/g, ""))}
//                   onFocus={() => { setZone("FOOTER"); setFooterFocus("RECEIVED"); }}
//                   placeholder="0.00" variant="standard" InputProps={{ disableUnderline: true }}
//                   inputProps={{ style: { padding: 0, fontSize: 28, fontWeight: 900, color: "#C8102E", fontFamily: "monospace", width: "100%", textAlign: "right" } }}
//                   sx={{ flex: 1, "& input::placeholder": { color: "#FECDD3", opacity: 1 } }}
//                 />
//               </Box>
//             </Box>
//             <Box sx={{ display: "flex", gap: 1, alignItems: "stretch" }}>
//               <Tooltip title={printEnabled ? "Print ON" : "Print OFF"}>
//                 <Box onClick={() => setPrintEnabled(p => !p)}
//                   sx={{ width: 52, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0.3, border: "1px solid #E5E7EB", borderRadius: 2, cursor: "pointer", bgcolor: "#F9FAFB", "&:hover": { bgcolor: "#F3F4F6" }, transition: "background 0.15s" }}>
//                   <Box sx={{ width: 32, height: 18, bgcolor: printEnabled ? "#C8102E" : "#D1D5DB", borderRadius: 10, position: "relative", transition: "background 0.2s" }}>
//                     <Box sx={{ position: "absolute", top: 2, left: printEnabled ? 14 : 2, width: 14, height: 14, bgcolor: "#fff", borderRadius: "50%", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
//                   </Box>
//                   <Typography sx={{ fontSize: 8, fontWeight: 700, color: "#6B7280", letterSpacing: "0.05em" }}>PRINT</Typography>
//                 </Box>
//               </Tooltip>
//               <Button variant="contained"
//                 startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon sx={{ fontSize: 18 }} />}
//                 onClick={handleSave} disabled={saving || items.length === 0}
//                 sx={{ ...footerOutline("SAVE"), flex: 1, bgcolor: "#C8102E", color: "#fff", fontSize: 15, fontWeight: 800, py: 1, borderRadius: 2, boxShadow: "0 4px 18px rgba(200,16,46,0.35)", "&:hover": { bgcolor: "#A50D26" }, "&:active": { transform: "scale(0.98)" }, "&.Mui-disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF", boxShadow: "none" }, transition: "all 0.15s" }}>
//                 {saving ? "SAVING…" : "SAVE"}{" "}
//                 <Box component="span" sx={{ fontSize: 11, opacity: 0.85, ml: 0.5 }}>[F8]</Box>
//               </Button>
//             </Box>
//             <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
//               <Typography sx={{ fontSize: 10, color: "#6B7280", fontWeight: 600 }}>PAYMENT STATUS:</Typography>
//               <Typography sx={{ fontSize: 11, fontWeight: 800, color: status.color, letterSpacing: "0.06em" }}>{status.label}</Typography>
//             </Box>
//           </Box>
//         </Box>

//         {/* STATUS BAR */}
//         <Box sx={{ bgcolor: "#1A1A2E", px: 2.5, py: 0.35, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//           <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
//             {[{ dot: "#22C55E", label: "SYSTEM ONLINE" }, { dot: "#EF4444", label: "PRINTER READY" }].map(s => (
//               <Box key={s.label} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><FiberManualRecordIcon sx={{ fontSize: 7, color: s.dot }} /><Typography sx={{ fontSize: 9, color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.06em" }}>{s.label}</Typography></Box>
//             ))}
//           </Box>
//           <Box sx={{ display: "flex", gap: 2 }}>
//             <Typography sx={{ fontSize: 9, color: "#6B7280", fontWeight: 600 }}>SERVER: CLOUD-E24</Typography>
//             <Typography sx={{ fontSize: 9, color: "#9CA3AF", fontWeight: 700 }}>POS-ID: 4492-AX</Typography>
//           </Box>
//         </Box>

//         {/* HOLD DIALOG */}
//         <Dialog open={holdDialogOpen} onClose={() => setHoldDialogOpen(false)} maxWidth="sm" fullWidth>
//           <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.5 }}>
//             <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//               <Box sx={{ bgcolor: "#FEE2E2", borderRadius: 1.5, p: 0.5, display: "flex" }}><PauseCircleOutlineIcon sx={{ color: "#C8102E", fontSize: 18 }} /></Box>
//               <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Held Orders</Typography>
//               <Chip label={`${heldOrders.length}`} size="small" sx={{ bgcolor: "#FEE2E2", color: "#C8102E", fontWeight: 700, fontSize: 10 }} />
//             </Box>
//             <IconButton size="small" onClick={() => setHoldDialogOpen(false)}><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
//           </DialogTitle>
//           <Divider />
//           <DialogContent sx={{ p: 0, minHeight: 180 }}>
//             {heldOrders.length === 0
//               ? <Box sx={{ py: 6, textAlign: "center", color: "#D1D5DB" }}><PauseCircleOutlineIcon sx={{ fontSize: 44 }} /><Typography sx={{ fontSize: 13, mt: 1 }}>No orders on hold</Typography></Box>
//               : <List disablePadding>
//                   {heldOrders.map((hold, i) => (
//                     <Box key={hold.id}>
//                       {i > 0 && <Divider />}
//                       <ListItem sx={{ px: 2, py: 1.5, "&:hover": { bgcolor: "#FFF5F6" }, alignItems: "flex-start" }}>
//                         <ListItemText
//                           primary={<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><Typography sx={{ fontWeight: 700, fontSize: 14 }}>{hold.label}</Typography>{hold.customer.name && <Chip label={hold.customer.name} size="small" sx={{ fontSize: 10, height: 18, bgcolor: "#F3F4F6" }} />}</Box>}
//                           secondary={<Box><Typography sx={{ fontSize: 11, color: "#374151", fontWeight: 600 }}>{hold.items.length} items · {INR(hold.items.reduce((s, i) => s + i.qty * i.unitPrice, 0))}</Typography><Typography sx={{ fontSize: 10, color: "#9CA3AF" }}>{hold.time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}</Typography><Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>{hold.items.slice(0, 3).map(item => <Chip key={item.code} label={`${item.qty}× ${item.description.split(" ").slice(0, 3).join(" ")}…`} size="small" sx={{ fontSize: 9, height: 18, bgcolor: "#F3F4F6" }} />)}{hold.items.length > 3 && <Chip label={`+${hold.items.length - 3} more`} size="small" sx={{ fontSize: 9, height: 18, bgcolor: "#F3F4F6", color: "#9CA3AF" }} />}</Box></Box>}
//                         />
//                         <ListItemSecondaryAction sx={{ top: "50%", transform: "translateY(-50%)" }}>
//                           <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
//                             <Button size="small" variant="contained" startIcon={<PlayArrowIcon sx={{ fontSize: 13 }} />} onClick={() => handleRecall(hold)} sx={{ fontSize: 10, fontWeight: 700, bgcolor: "#C8102E", "&:hover": { bgcolor: "#A50D26" }, borderRadius: 1.5, py: 0.4, minWidth: 80 }}>Recall</Button>
//                             <Button size="small" startIcon={<DeleteOutlineIcon sx={{ fontSize: 13 }} />} onClick={() => handleDeleteHold(hold.id)} sx={{ fontSize: 10, fontWeight: 600, color: "#EF4444", "&:hover": { bgcolor: "#FEF2F2" }, borderRadius: 1.5, py: 0.4, minWidth: 80 }}>Delete</Button>
//                           </Box>
//                         </ListItemSecondaryAction>
//                       </ListItem>
//                     </Box>
//                   ))}
//                 </List>
//             }
//           </DialogContent>
//           <Divider />
//           <DialogActions sx={{ px: 2, py: 1, justifyContent: "space-between" }}>
//             <Typography sx={{ fontSize: 10, color: "#9CA3AF" }}>F9 to hold · Recall to restore</Typography>
//             <Button onClick={() => setHoldDialogOpen(false)} sx={{ fontWeight: 600, color: "#374151", fontSize: 12 }}>Close</Button>
//           </DialogActions>
//         </Dialog>

//         {/* SAVE RESULT DIALOG */}
//         <Dialog open={!!saveResult?.open} onClose={() => setSaveResult(null)} maxWidth="xs" fullWidth TransitionComponent={Fade}>
//           <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 0 }}>
//             <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//               <Box sx={{ bgcolor: saveResult?.success ? "#DCFCE7" : "#FEE2E2", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
//                 {saveResult?.success ? <SaveIcon sx={{ color: "#16A34A", fontSize: 20 }} /> : <CloseIcon sx={{ color: "#C8102E", fontSize: 20 }} />}
//               </Box>
//               <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{saveResult?.success ? "Order Saved" : "Save Failed"}</Typography>
//             </Box>
//             <IconButton size="small" onClick={() => setSaveResult(null)}><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
//           </DialogTitle>
//           <DialogContent sx={{ pt: 2 }}>
//             {saveResult?.success ? (
//               <Box>
//                 <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
//                   <Typography sx={{ fontSize: 13, color: "#6B7280" }}>Grand Total</Typography>
//                   <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{INR(saveResult.grandTotal ?? 0)}</Typography>
//                 </Box>
//                 {(saveResult.change ?? 0) > 0 && (
//                   <Box sx={{ display: "flex", justifyContent: "space-between", bgcolor: "#DBEAFE", borderRadius: 1.5, px: 1.5, py: 0.8, mt: 0.5 }}>
//                     <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1D4ED8" }}>💵 Return Change</Typography>
//                     <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#1D4ED8" }}>{INR(saveResult.change ?? 0)}</Typography>
//                   </Box>
//                 )}
//               </Box>
//             ) : (
//               <Box sx={{ bgcolor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 2, p: 1.5 }}>
//                 <Typography sx={{ fontSize: 13, color: "#DC2626" }}>{saveResult?.message}</Typography>
//               </Box>
//             )}
//           </DialogContent>
//           <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
//             {saveResult?.success && printEnabled && (
//               <Button variant="outlined" startIcon={<PrintOutlinedIcon />} onClick={() => setSaveResult(null)}
//                 sx={{ borderRadius: 2, fontWeight: 600, flex: 1, borderColor: "#E5E7EB", color: "#374151" }}>Print</Button>
//             )}
//             <Button variant="contained" onClick={() => setSaveResult(null)}
//               sx={{ bgcolor: saveResult?.success ? "#16A34A" : "#C8102E", "&:hover": { bgcolor: saveResult?.success ? "#15803D" : "#A50D26" }, borderRadius: 2, fontWeight: 700, flex: 1 }}
//               autoFocus>
//               {saveResult?.success ? "New Sale" : "Dismiss"}
//             </Button>
//           </DialogActions>
//         </Dialog>

//         <CustomerLedgerDialog open={customerLedgerOpen} onClose={() => setCustomerLedgerOpen(false)}
//           customerName={customer.name || "Walk-in Customer"} />
//         <AddNewCustomerDialog open={addCustomerOpen} onClose={() => setAddCustomerOpen(false)} />

//       </Box>
//     </ThemeProvider>
//   );
// }

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePosSearch } from "./useposproducts";
import type { PosProduct } from "./db";
import { useSaveOrder } from "./usesaveOrder";
import {
  useCustomerSearch,
  type ApiCustomer,
  primaryMobile,
  customerLabel,
  customerAddress,
} from "./usecustomer";
import {
  Box, Typography, TextField, Button, IconButton, Table, TableBody,
  TableCell, TableHead, TableRow, Divider, Chip, Paper, InputAdornment,
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
import FiberManualRecordIcon  from "@mui/icons-material/FiberManualRecord";
import PersonOutlineIcon      from "@mui/icons-material/PersonOutline";
import QrCodeScannerIcon      from "@mui/icons-material/QrCodeScanner";
import AddIcon                from "@mui/icons-material/Add";
import RemoveIcon             from "@mui/icons-material/Remove";
import GridViewIcon           from "@mui/icons-material/GridView";
import PlayArrowIcon          from "@mui/icons-material/PlayArrow";
import CloseIcon              from "@mui/icons-material/Close";
import SearchIcon             from "@mui/icons-material/Search";
import EditIcon               from "@mui/icons-material/Edit";
import CalendarTodayIcon      from "@mui/icons-material/CalendarToday";
import PersonSearchIcon       from "@mui/icons-material/PersonSearch";
import { useLocation, useNavigate }        from "react-router-dom";
import { Receipt }            from "@mui/icons-material";
import CustomerLedgerDialog   from "../Customer/CustomerLedgerDialog";
import AddNewCustomerDialog   from "@pages/Customer/Addnewcustomerdialog";
import { fetchSaleDetail } from "../SalesHistory/useSaleshistory";
// ─── Constants ────────────────────────────────────────────────
const INR = (v: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(v);
const todayStr = () => new Date().toISOString().split("T")[0];

const ZODU_ID   = import.meta.env.VITE_ZODU_ID   ?? "ZODU035";
const BRANCH_ID = import.meta.env.VITE_BRANCH_ID ?? "ZODU035B1";

// ─── Theme ────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary:    { main: "#C8102E" },
    background: { default: "#F0F2F5", paper: "#FFFFFF" },
    text:       { primary: "#1A1A2E", secondary: "#6B7280" },
  },
  typography: { fontFamily: '"Poppins", sans-serif' },
  components: {
    MuiButton:    { styleOverrides: { root: { textTransform: "none", borderRadius: 8, fontWeight: 600 } } },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: "1px solid #F0F0F0", padding: "6px 8px" },
        head: { fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", color: "#6B7280", textTransform: "uppercase", backgroundColor: "#FAFAFA" },
      },
    },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 16 } } },
  },
});

// ─── Types ────────────────────────────────────────────────────
interface LineItem {
  code: string; description: string; qty: number; unitPrice: number; sellPrice: number;uuid: string;
  hsn: string; mrp: number; gstPct: number; taxInclusive: boolean; category?: string; unit?: string;
  discount?: number; // ✅ Added discount field
  editingQty?: boolean; editingPrice?: boolean; qtyDraft?: string; priceDraft?: string;
}

interface Customer {
  id:      string | null;
  name:    string;
  mobile:  string;
  address: string;
  gstin:   string;
}
const EMPTY_CUSTOMER: Customer = { id: null, name: "", mobile: "", address: "", gstin: "" };

interface HeldOrder {
  id: string; label: string; items: LineItem[];
  discount: string; customer: Customer; time: Date;
}

type Zone = "SEARCH" | "CUSTOMER" | "TABLE" | "FOOTER";

type SearchFocus = "CODE";

type FooterFocus = "DISCOUNT_PCT" | "DISCOUNT_AMT" | "PAYMENT_TYPE" | "REF_NO" | "RECEIVED" | "SAVE";
type PaymentType = "Cash" | "Card" | "UPI" | "Credit";

// ─── Helpers ──────────────────────────────────────────────────
function toLineItem(p: PosProduct): LineItem {
  const grossPrice    = Number(p.sell_price) || 0;
  const gstPct        = Number(p.gst_tax)    || 0;
  const taxInclusive  = p.tax_inclusive === true || (p.tax_inclusive as unknown) === 1;

  // For tax-inclusive items the sell_price already contains GST.
  // Strip tax out so unitPrice always represents the BASE (pre-tax) price.
  // This ensures discounts are applied on the taxable base, not on gross.
  const unitPrice = taxInclusive && gstPct > 0
    ? grossPrice / (1 + gstPct / 100)   // base = gross / (1 + gst%)
    : grossPrice;


  return {
    uuid:          p.item_uuid, // ✅ Set uuid from the product
    code:         p.item_id,
    description:  p.item_name,
    qty:          1,
    unitPrice,                            // BASE price — used for all calculations
    sellPrice:    grossPrice,             // GROSS price (what's on the price tag) — display only
    taxInclusive,
    hsn:          p.hsn_code   ?? "",
    mrp:          Number(p.purchase_price) || grossPrice,
    gstPct,
    category:     p.category_name ?? "",
    unit:         p.unit          || "NOS",
    discount:     0,                      // ✅ Initialize discount
  };
}

function paymentStatus(grand: number, received: number) {
  if (received <= 0)           return { label: "UNPAID",                                  color: "#DC2626" };
  if (received < grand - 0.01) return { label: `PARTIAL · Due ${INR(grand - received)}`,   color: "#D97706" };
  if (received > grand + 0.01) return { label: `EXCESS · Return ${INR(received - grand)}`, color: "#2563EB" };
  return                               { label: "FULL PAYMENT",                             color: "#16A34A" };
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
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i === -1) return <>{text}</>;
  return <>{text.slice(0, i)}<Box component="span" sx={{ bgcolor: "#FEF08A", borderRadius: 0.4, px: 0.2, fontWeight: 800 }}>{text.slice(i, i + query.length)}</Box>{text.slice(i + query.length)}</>;
}

const queryClient = new QueryClient();
const CAT_COLOR: Record<string, string> = { Beans: "#92400E", Drinks: "#1D4ED8", Equipment: "#065F46", Accessories: "#5B21B6", Milk: "#9D174D", Syrups: "#B45309" };

// ─── Root ─────────────────────────────────────────────────────
export default function RetailPOS() {
  return (
    <QueryClientProvider client={queryClient}>
      <RetailPOSInner />
    </QueryClientProvider>
  );
}

// ─── Main component ───────────────────────────────────────────
function RetailPOSInner() {
  const [codeInput, setCodeInput] = useState("");
  const { results: suggestions, isLoading: catalogueLoading, total: catalogueTotal } = usePosSearch(BRANCH_ID, codeInput);

const query = new URLSearchParams(useLocation().search);
const saleIdFromUrl = query.get("saleId");

const [items,          setItems]          = useState<LineItem[]>([]);
  const [discount,       setDiscount]       = useState("0");
  const [discountPct,    setDiscountPct]    = useState("0");
  const [referenceNo,    setReferenceNo]    = useState("");
  const [receivedAmount, setReceivedAmount] = useState("");
  const [paymentType,    setPaymentType]    = useState<PaymentType>("Cash");
  const [printEnabled,   setPrintEnabled]   = useState(true);
  const [invoiceDate,    setInvoiceDate]    = useState(todayStr());
  const [customer,       setCustomer]       = useState<Customer>(EMPTY_CUSTOMER);
  const [customerSuggestionsOpen, setCustomerSuggestionsOpen] = useState(false);
  const [customerLedgerOpen,      setCustomerLedgerOpen]      = useState(false);
  const [addCustomerOpen,         setAddCustomerOpen]         = useState(false);
  const [flashRow,  setFlashRow]  = useState<string | null>(null);
const [saleId, setSaleId] = useState<string | null>(null);
  const { results: customerResults, loading: customerLoading, search: searchCustomers, clear: clearCustomerResults } = useCustomerSearch(ZODU_ID, BRANCH_ID);

  const [zone,            setZone]            = useState<Zone>("SEARCH");
  // ✅ Tracks which field inside SEARCH zone is focused
  const [searchFocus,     setSearchFocus]     = useState<SearchFocus>("CODE");
  const [activeRowIdx,    setActiveRowIdx]    = useState(-1);
  const [footerFocus,     setFooterFocus]     = useState<FooterFocus>("DISCOUNT_PCT");
  const [suggestionIdx,   setSuggestionIdx]   = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [heldOrders,     setHeldOrders]     = useState<HeldOrder[]>([]);
  const [holdDialogOpen, setHoldDialogOpen] = useState(false);
  const [holdCounter,    setHoldCounter]    = useState(1);

  const { saveOrder, saving,updateOrder } = useSaveOrder();
  const [saveResult, setSaveResult] = useState<{
    open: boolean; success: boolean; message: string;
    invoiceNo?: string; grandTotal?: number; change?: number;
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
  const editCancelledRef  = useRef(false);

  useEffect(() => { codeRef.current?.focus(); }, []);
  useEffect(() => {
  if (saleIdFromUrl) {
    setSaleId(saleIdFromUrl);
  }
}, []);

  useEffect(() => {
    if (zone === "TABLE" && activeRowIdx >= 0) {
      const rows = tableBodyRef.current?.querySelectorAll("tr[data-rowcode]");
      if (rows?.[activeRowIdx]) (rows[activeRowIdx] as HTMLElement).scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeRowIdx, zone]);

  // ✅ Focus the correct sub-field when zone/searchFocus changes
  useEffect(() => {
    if (zone === "SEARCH") {
      setTimeout(() => codeRef.current?.focus(), 10);
    } else if (zone === "CUSTOMER") {
      setTimeout(() => customerNameRef.current?.focus(), 10);
    } else if (zone === "FOOTER") {
      if      (footerFocus === "DISCOUNT_PCT") setTimeout(() => discountPctRef.current?.focus(), 10);
      else if (footerFocus === "DISCOUNT_AMT") setTimeout(() => discountAmtRef.current?.focus(), 10);
      else if (footerFocus === "REF_NO")       setTimeout(() => refNoRef.current?.focus(),       10);
      else if (footerFocus === "RECEIVED")     setTimeout(() => receivedRef.current?.focus(),    10);
    }
  }, [zone, footerFocus, searchFocus]);

  useEffect(() => {
    setSuggestionIdx(-1);
    // ✅ Re-open dropdown whenever user types — even after adding an item
    if (codeInput.trim() && zone === "SEARCH" && searchFocus === "CODE") {
      setShowSuggestions(true);
    }
  }, [codeInput]);

  useEffect(() => {
    if (!catalogueLoading && codeInput.trim() && zone === "SEARCH" && searchFocus === "CODE" && document.activeElement === codeRef.current)
      setShowSuggestions(true);
  }, [catalogueLoading]);

  const startEditQty = useCallback((code: string) => {
    setItems(prev => prev.map(i => i.code === code
      ? { ...i, editingQty: true, editingPrice: false, qtyDraft: String(i.qty) }
      : { ...i, editingQty: false }));
    setTimeout(() => { qtyRefs.current[code]?.focus(); qtyRefs.current[code]?.select(); }, 30);
  }, []);

  const startEditPrice = useCallback((code: string) => {
    setItems(prev => prev.map(i => i.code === code
      ? { ...i, editingPrice: true, editingQty: false, priceDraft: String(i.sellPrice) }
      : { ...i, editingPrice: false }));
    setTimeout(() => { priceRefs.current[code]?.focus(); priceRefs.current[code]?.select(); }, 30);
  }, []);

  const doAddItem = useCallback((itemId: string) => {
    const p = suggestions.find(s => s.item_id === itemId);
    if (!p) return false;
    setItems(prev => {
      const idx = prev.findIndex(i => i.code === p.item_id);
      if (idx >= 0) { const u = [...prev]; u[idx] = { ...u[idx], qty: u[idx].qty + 1 }; return u; }
      return [...prev, toLineItem(p)];
    });
    setFlashRow(p.item_id); setTimeout(() => setFlashRow(null), 700);
    return p.item_id;
  }, [suggestions]);

 useEffect(() => {
  if (!saleId) return;

  const loadSale = async () => {
    const data = await fetchSaleDetail(saleId);

    const sale = data.sale;
    setSaleId(sale.sale_uuid)
    const items = data.items;
    const payments = data.payment_history;

    console.log("muitems",items)
    // ✅ ITEMS
    setItems(
      items.map((i) => {
        const grossPrice = Number(i.price) || 0;
        const gstPct = Number(i.gst_percentage) || 0;
        const taxInclusive = Boolean(i.tax_inclusive);
        const unitPrice =
          taxInclusive && gstPct > 0
            ? grossPrice / (1 + gstPct / 100)
            : grossPrice;

        return {
          code: i.item_id,
          description: i.item_name,
          qty: Number(i.quantity),
          unitPrice,
          sellPrice: grossPrice,
          gstPct,
          taxInclusive,
          uuid: i.item_uuid,
          hsn: i.hsn_code ?? "",
          mrp: Number(i.mrp || 0),
          unit: i.unit || "NOS",
          discount: Number(i.discount || 0),
        };
      })
    );

    // ✅ CUSTOMER
    if (data.customer) {
      const c = data.customer;

      const displayName =
        c.cust_name && c.cpy_name
          ? `${c.cust_name} / ${c.cpy_name}`
          : c.cust_name || c.cpy_name || "";

      setCustomer({
        id: c.cust_uuid,
        name: displayName,
        mobile: c.mobile || "",
        address: [
          c.address_line1,
          c.address_line2,
          c.city,
          c.state,
          c.pincode,
        ]
          .filter(Boolean)
          .join(", "),
        gstin: c.gst || "",
      });
    }

    // ✅ DISCOUNT
    if (sale.discount_type === "percentage") {
      setDiscountPct(String(sale.discount_value || 0));
      setDiscount("0");
    } else {
      setDiscount(String(sale.discount_amount || 0));
      setDiscountPct("0");
    }

    // ✅ PAYMENT
    setReceivedAmount(String(sale.paid_amount || 0));

    if (payments.length > 0) {
      const last = payments[payments.length - 1];
      setReferenceNo(last.transaction_id || "");
      setPaymentType((last.transaction_type as any) || "Cash");
    }

    // ✅ DATE
    setInvoiceDate(
      sale.sale_date_fmt
        ? new Date(sale.sale_date_fmt).toISOString().split("T")[0]
        : ""
    );
  };

  loadSale();
}, [saleId]);

  const handleAddItem = useCallback((overrideCode?: string) => {
    const code = (overrideCode ?? codeInput).trim();
    const id   = doAddItem(code);
    setCodeInput(""); setShowSuggestions(false);
    if (id) {
      setItems(prev => prev.map(i => i.code === id ? { ...i, qty: 1 } : i));
    }
    // Always return focus to CODE field so cashier can scan the next item
    setZone("SEARCH"); setSearchFocus("CODE");
    setTimeout(() => codeRef.current?.focus(), 10);
  }, [codeInput, doAddItem]);

  const selectSuggestion = useCallback((p: PosProduct) => {
    const id  = doAddItem(p.item_id);
    setCodeInput(""); setShowSuggestions(false);
    if (id) {
      setItems(prev => prev.map(i => i.code === id ? { ...i, qty: 1, uuid: p.item_uuid } : i));
    }
    // Always return focus to CODE field so cashier can scan the next item
    setZone("SEARCH"); setSearchFocus("CODE");
    setTimeout(() => codeRef.current?.focus(), 10);
  }, [doAddItem]);

  const handleClear = useCallback(() => {
    setItems([]); setDiscount("0"); setDiscountPct("0"); setReferenceNo("");
    setReceivedAmount(""); setCodeInput(""); setActiveRowIdx(-1);
    setZone("SEARCH"); setSearchFocus("CODE");
    setCustomer(EMPTY_CUSTOMER); clearCustomerResults();
  }, [clearCustomerResults]);

  const handleHold = useCallback(() => {
    if (items.length === 0) return;
    setHeldOrders(prev => [...prev, {
      id: `H-${Date.now()}`, label: `Order #${holdCounter}`,
      items: items.map(i => ({ ...i, editingQty: false, editingPrice: false })),
      discount, customer, time: new Date(),
    }]);
    setHoldCounter(c => c + 1); setItems([]); setDiscount("0"); setReceivedAmount("");
    setActiveRowIdx(-1); setZone("SEARCH"); setSearchFocus("CODE"); setCustomer(EMPTY_CUSTOMER);
  }, [items, discount, customer, holdCounter]);

  const handleRecall = (hold: HeldOrder) => {
    if (items.length > 0 && !window.confirm("Current order will be cleared. Recall held order?")) return;
    setItems(hold.items); setDiscount(hold.discount); setCustomer(hold.customer);
    setHeldOrders(prev => prev.filter(h => h.id !== hold.id));
    setHoldDialogOpen(false); setZone("TABLE"); setActiveRowIdx(0);
  };

  const handleDeleteHold = (id: string) => setHeldOrders(prev => prev.filter(h => h.id !== id));

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

  // subtotal = sum of BASE prices (unitPrice is always pre-tax after toLineItem())
  const subtotal        = useMemo(() => items.reduce((s, i) => s + i.qty * i.unitPrice, 0), [items]);

  // Discount applied on the pre-tax subtotal
  const discountPctAmt  = subtotal * (parseFloat(discountPct) || 0) / 100;
  const discountFlatAmt = parseFloat(discount) || 0;
  const discountAmt     = discountPctAmt + discountFlatAmt;
  const discountedSubtotal = Math.max(0, subtotal - discountAmt);

  // GST is always computed on the discounted BASE price, regardless of tax_inclusive
  // (unitPrice is already the base — toLineItem() stripped tax out for inclusive items)
  const gstAmount       = useMemo(() => {
    if (subtotal === 0) return 0;
    return items.reduce((s, i) => {
      const itemBase     = i.qty * i.unitPrice;
      const itemDiscount = discountAmt * (itemBase / subtotal);   // proportional discount
      return s + Math.max(0, itemBase - itemDiscount) * i.gstPct / 100;
    }, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, discountAmt, subtotal]);
  const grandTotal      = discountedSubtotal + gstAmount;
  const received        = parseFloat(receivedAmount) || 0;
  const totalUnits      = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const status          = paymentStatus(grandTotal, received);
  const navigate        = useNavigate();

  const handleCustomerFieldChange = useCallback((field: "name" | "mobile", value: string) => {
    setCustomer(prev => ({ ...prev, id: null, [field]: value }));
    setCustomerSuggestionsOpen(true);
    searchCustomers(value);
  }, [searchCustomers]);

  const handleSelectCustomer = useCallback((c: ApiCustomer) => {
    // Build combined display name: show both person name and company name when both exist
    const custName = c.cust_name?.trim() ?? "";
    const cpyName  = c.cpy_name?.trim()  ?? "";
    const displayName = custName && cpyName
      ? `${custName} / ${cpyName}`   // "Ravi Kumar / Hero Motors"
      : custName || cpyName;         // whichever exists

    setCustomer({
      id:      c.cust_uuid,
      name:    displayName,
      mobile:  primaryMobile(c),
      address: customerAddress(c),
      gstin:   c.gst ?? "",
    });
    setCustomerSuggestionsOpen(false);
    clearCustomerResults();
    setZone("CUSTOMER");
  }, [clearCustomerResults]);

  const handleSave = useCallback(async () => {
    if (items.length === 0 || saving) return;
 const result = saleId
  ? await updateOrder(saleId, {
      zodu_id: ZODU_ID,
      branch_id: BRANCH_ID,
      items,
      customer,
      invoiceDate,
      discountPct,
      discountFlat: discount,
      receivedAmount,
      paymentType,
      referenceNo,
    })
  : await saveOrder({
      zodu_id: ZODU_ID,
      branch_id: BRANCH_ID,
      items,
      customer,
      invoiceDate,
      discountPct,
      discountFlat: discount,
      receivedAmount,
      paymentType,
      referenceNo,
    });
    if (result.success) {
      const order    = result.order as any;
      const totalAmt = parseFloat(order?.total_amount ?? "0");
      const paidAmt  = parseFloat(order?.paid_amount  ?? "0");
      const change   = paidAmt > totalAmt ? paidAmt - totalAmt : 0;
      setSaveResult({ open: true, success: true, message: result.message, grandTotal: totalAmt, change });
      if (printEnabled) console.log("🖨 Printing invoice");
      handleClear();
    } else {
      setSaveResult({ open: true, success: false, message: result.message });
    }
  }, [items, customer, invoiceDate, discountPct, discount, receivedAmount, paymentType, referenceNo, printEnabled, saving, saveOrder, handleClear]);

  const FOOTER_ORDER: FooterFocus[] = ["DISCOUNT_PCT", "DISCOUNT_AMT", "PAYMENT_TYPE", "REF_NO", "RECEIVED", "SAVE"];

  // ── Keyboard handler ──────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const active  = document.activeElement as HTMLElement;
      const inInput = active?.tagName === "INPUT" || active?.tagName === "TEXTAREA" || active?.tagName === "SELECT";
      if (active?.closest('[role="dialog"]')) return;

      if (e.key === "F2") { e.preventDefault(); setShowSuggestions(false); setZone("SEARCH"); setSearchFocus("CODE"); return; }
      if (e.key === "F4") { e.preventDefault(); handleClear(); return; }
      if (e.key === "F7") { e.preventDefault(); setZone("FOOTER"); setFooterFocus("DISCOUNT_PCT"); return; }
      if (e.key === "F8") { e.preventDefault(); handleSave(); return; }
      if (e.key === "F9") { e.preventDefault(); handleHold(); return; }

      const editingItem = items.find(i => i.editingQty || i.editingPrice);
      if (editingItem) {
        if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); editCancelledRef.current = true; (document.activeElement as HTMLElement)?.blur(); return; }
        if (e.key === "Enter" || e.key === "Tab") return;
        return;
      }

      if (zone === "SEARCH") {
        // ── CODE sub-field ──────────────────────────────────────
        if (searchFocus === "CODE") {
          if (showSuggestions && suggestions.length > 0) {
            if (e.key === "ArrowDown")  { e.preventDefault(); setSuggestionIdx(i => Math.min(i + 1, suggestions.length - 1)); return; }
            if (e.key === "ArrowUp")    { e.preventDefault(); setSuggestionIdx(i => Math.max(i - 1, -1)); return; }
            if (e.key === "Escape")     { e.preventDefault(); setShowSuggestions(false); setSuggestionIdx(-1); return; }
            if (e.key === "Enter")      { e.preventDefault(); if (suggestionIdx >= 0 && suggestions[suggestionIdx]) selectSuggestion(suggestions[suggestionIdx]); else handleAddItem(); return; }
            // ✅ Tab/→ while suggestions open → close suggestions, move to QTY (not customer)
            if (e.key === "Tab" || e.key === "ArrowRight") {
              e.preventDefault();
              setShowSuggestions(false);
              setSuggestionIdx(-1);
              setZone("CUSTOMER");
              return;
            }
          } else {
            if (e.key === "Enter")     { e.preventDefault(); handleAddItem(); return; }
            if (e.key === "ArrowDown") { e.preventDefault(); if (items.length > 0) { (document.activeElement as HTMLElement)?.blur(); setZone("TABLE"); setActiveRowIdx(0); } return; }
            // ✅ Tab/→ from CODE → focus QTY first
            if (e.key === "Tab" || e.key === "ArrowRight") {
              e.preventDefault();
              setZone("CUSTOMER");
              return;
            }
          }
          return;
        }

        // ── QTY sub-field ───────────────────────────────────────
        if (false) {
          // ✅ ← from QTY → go back to CODE
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            setSearchFocus("CODE");
            return;
          }
          // ✅ Tab/→ from QTY → now move to CUSTOMER
          if (e.key === "Tab" || e.key === "ArrowRight") {
            e.preventDefault();
            (document.activeElement as HTMLElement)?.blur();
            setZone("CUSTOMER");
            return;
          }
          // Enter in QTY → add item using current codeInput
          if (e.key === "Enter") {
            e.preventDefault();
            handleAddItem();
            return;
          }
          // Escape from QTY → back to CODE
          if (e.key === "Escape") {
            e.preventDefault();
            setSearchFocus("CODE");
            return;
          }
          return;
        }
        return;
      }

      if (zone === "CUSTOMER") {
        // ✅ ← / Escape from CUSTOMER → go back to QTY (not directly to CODE)
        if (e.key === "Escape" || e.key === "ArrowLeft") {
          e.preventDefault();
          (document.activeElement as HTMLElement)?.blur();
          setZone("SEARCH");
          setSearchFocus("CODE");
          return;
        }
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
  }, [zone, searchFocus, activeRowIdx, footerFocus, showSuggestions, suggestions, suggestionIdx, items, handleAddItem, handleClear, handleHold, handleSave, selectSuggestion, startEditQty, startEditPrice]);

  const isFooterActive = (f: FooterFocus) => zone === "FOOTER" && footerFocus === f;
  const footerOutline  = (f: FooterFocus) => ({ outline: isFooterActive(f) ? "2.5px solid #C8102E" : "2.5px solid transparent", outlineOffset: 2, transition: "outline 0.12s" });

  // ✅ Whether a search sub-field is "active" (for border highlight)
  const isSearchActive = (sf: SearchFocus) => zone === "SEARCH" && searchFocus === sf;

  // ─────────────────────────────────────────────────────────────
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "#F0F2F5", display: "flex", flexDirection: "column" }}>

        {/* TOP BAR */}
        <Box sx={{ bgcolor: "#fff", borderBottom: "1px solid #E5E7EB", px: { xs: 2, md: 3 }, py: 0.75, display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 50 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Button onClick={() => navigate("/dashboard")} startIcon={<GridViewIcon />} sx={{ color: "#6B7280", fontWeight: 500, fontSize: 12 }}>Dashboard</Button>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 1.5, px: 1.5, py: 0.5 }}>
              <CalendarTodayIcon sx={{ fontSize: 15, color: "#6B7280" }} />
              <Typography sx={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.05em" }}>INVOICE DATE</Typography>
              <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)}
                style={{ border: "none", outline: "none", background: "transparent", fontSize: 12, fontWeight: 700, color: "#1A1A2E", fontFamily: "inherit", cursor: "pointer" }} />
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Button onClick={() => navigate("/sales-history")} startIcon={<Receipt />} sx={{ backgroundColor: "#C8102E", color: "#fff", fontWeight: 500, fontSize: 12 }}>Sales History</Button>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{ fontSize: 10, color: "#9CA3AF", lineHeight: 1 }}>STATION 04</Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#1A1A2E" }}>Cashier: Alex M.</Typography>
            </Box>
            <Box sx={{ width: 32, height: 32, bgcolor: "#FEE2E2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PersonOutlineIcon sx={{ color: "#C8102E", fontSize: 18 }} />
            </Box>
          </Box>
        </Box>

        {/* MAIN CONTENT */}
        <Box sx={{ flex: 1, px: { xs: 1.5, md: 2 }, pt: 1.5, pb: 1 }}>
          <Box sx={{ display: "flex", gap: 2, mb: 1.5, alignItems: "stretch" }}>

            {/* ── Search panel ── */}
            <Paper elevation={0} sx={{
              flex: "1 1 auto", borderRadius: 2, p: 1.5, bgcolor: "#fff",
              position: "relative", zIndex: 100, transition: "border-color 0.2s",
              border: zone === "SEARCH" ? "2px solid #C8102E" : "2px solid #E5E7EB",
              boxShadow: zone === "SEARCH" ? "0 0 0 3px rgba(200,16,46,0.08)" : "none",
            }}>
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-end" }}>
                <Box sx={{ flex: 1, position: "relative" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.4 }}>
                    <Typography sx={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#C8102E" }}>ITEM ID / NAME</Typography>
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
                    placeholder="Search by item ID, name or category…"
                    size="small" fullWidth autoComplete="off"
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><QrCodeScannerIcon sx={{ color: "#C8102E", fontSize: 18 }} /></InputAdornment>,
                      endAdornment: codeInput
                        ? <InputAdornment position="end"><IconButton size="small" onMouseDown={e => { e.preventDefault(); setCodeInput(""); setShowSuggestions(false); codeRef.current?.focus(); }}><CloseIcon sx={{ fontSize: 13, color: "#9CA3AF" }} /></IconButton></InputAdornment>
                        : <InputAdornment position="end"><SearchIcon sx={{ fontSize: 15, color: "#D1D5DB" }} /></InputAdornment>,
                      sx: { borderRadius: 1.5, bgcolor: "#FAFAFA", fontSize: 13 },
                    }}
                    sx={{ "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: isSearchActive("CODE") ? "#C8102E" : "#E5E7EB", borderWidth: isSearchActive("CODE") ? 2 : 1 },
                      "&:hover fieldset": { borderColor: "#C8102E" },
                      "&.Mui-focused fieldset": { borderColor: "#C8102E" },
                    }}}
                  />

                  {/* Suggestions dropdown */}
                  {showSuggestions && (
                    <Paper elevation={8} sx={{ position: "absolute", top: "calc(100% + 2px)", left: 0, right: 0, borderRadius: "0 0 8px 8px", overflow: "hidden", zIndex: 9999, border: "1px solid #E0E0E0", borderTop: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 1.5, py: 0.6, bgcolor: "#F5F5F5", borderBottom: "1px solid #E5E7EB" }}>
                        <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>Item Name</Typography>
                        <IconButton size="small" onMouseDown={e => { e.preventDefault(); setShowSuggestions(false); }} sx={{ p: 0.2 }}><CloseIcon sx={{ fontSize: 13, color: "#9CA3AF" }} /></IconButton>
                      </Box>
                      {codeInput.trim() && suggestions.length === 0 && (
                        <Box sx={{ py: 3, textAlign: "center" }}>
                          <Typography sx={{ fontSize: 12, color: "#9CA3AF" }}>No items found for "{codeInput.trim()}"</Typography>
                        </Box>
                      )}
                      {suggestions.length > 0 && (
                        <Box sx={{ maxHeight: 300, overflowY: "auto", bgcolor: "#fff" }}>
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
                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: idx === suggestionIdx ? "#1D4ED8" : "#111827" }}>₹{Number(p.sell_price).toLocaleString("en-IN")}<Typography sx={{ fontSize: 9, color: p.tax_inclusive ? "#D97706" : "#9CA3AF", fontWeight: p.tax_inclusive ? 700 : 400, lineHeight: 1 }}>
                                  / per {p.unit || "NOS"}
                                </Typography></Typography>
                                
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Paper>
                  )}
                </Box>

                {/* Search qty field intentionally commented out */}

                <Button variant="contained" startIcon={<AddShoppingCartIcon />} onClick={() => handleAddItem()}
                  sx={{ bgcolor: "#C8102E", color: "#fff", px: 2.5, py: 0.9, fontSize: 13, fontWeight: 700, borderRadius: 1.5, minHeight: 38, whiteSpace: "nowrap", boxShadow: "0 4px 14px rgba(200,16,46,0.35)", "&:hover": { bgcolor: "#A50D26" }, "&:active": { transform: "scale(0.97)" } }}>
                  ADD <Box component="span" sx={{ fontSize: 10, opacity: 0.8, ml: 0.4 }}>[Enter]</Box>
                </Button>
              </Box>
            </Paper>

            {/* ── Customer panel ── */}
            <Paper elevation={0} sx={{ minWidth: 800, border: zone === "CUSTOMER" ? "2px solid #C8102E" : "1px solid #E5E7EB", borderRadius: 2.5, p: 1.5, bgcolor: "#fff", transition: "border 0.2s, box-shadow 0.2s", position: "relative", boxShadow: zone === "CUSTOMER" ? "0 0 0 3px rgba(200,16,46,0.08)" : "none" }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1.5, mb: 1.2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
                  <PersonSearchIcon sx={{ fontSize: 15, color: "#C8102E" }} />
                  <Typography sx={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color: "#374151" }}>CUSTOMER</Typography>
                  {customer.id && (
                    <Chip label="Linked" size="small" onDelete={() => { setCustomer(EMPTY_CUSTOMER); clearCustomerResults(); }}
                      sx={{ fontSize: 9, height: 18, bgcolor: "#DCFCE7", color: "#16A34A", fontWeight: 700 }} />
                  )}
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Button size="small" variant="outlined" onClick={() => setAddCustomerOpen(true)}
                    sx={{ borderColor: "#F3C4CB", color: "#C8102E", fontSize: 9, fontWeight: 800, px: 1.25, py: 0.55, borderRadius: 1.5, minWidth: 0, whiteSpace: "nowrap", "&:hover": { borderColor: "#C8102E", bgcolor: "#FFF5F6" } }}>
                    Add Customer
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => setCustomerLedgerOpen(true)}
                    sx={{ borderColor: "#F3C4CB", color: "#C8102E", fontSize: 9, fontWeight: 800, px: 1.25, py: 0.55, borderRadius: 1.5, minWidth: 0, whiteSpace: "nowrap", "&:hover": { borderColor: "#C8102E", bgcolor: "#FFF5F6" } }}>
                    View Ledger / History
                  </Button>
                </Box>
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1 }}>
                <TextField inputRef={customerNameRef} value={customer.name}
                  onChange={e => handleCustomerFieldChange("name", e.target.value)}
                  onFocus={() => { setZone("CUSTOMER"); if (customer.name.trim()) setCustomerSuggestionsOpen(true); }}
                  onBlur={() => setTimeout(() => setCustomerSuggestionsOpen(false), 180)}
                  placeholder="Name or company" size="small" autoComplete="off"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.75, fontSize: 12, bgcolor: "#F8FAFC", "& fieldset": { borderColor: "#E2E8F0" }, "&:hover fieldset": { borderColor: "#C8102E" }, "&.Mui-focused fieldset": { borderColor: "#C8102E" } } }}
                  inputProps={{ style: { padding: "7px 12px", fontWeight: 500 } }}
                />
                <TextField inputRef={customerMobileRef} value={customer.mobile}
                  onChange={e => handleCustomerFieldChange("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
                  onFocus={() => { setZone("CUSTOMER"); if (customer.mobile.trim()) setCustomerSuggestionsOpen(true); }}
                  onBlur={() => setTimeout(() => setCustomerSuggestionsOpen(false), 180)}
                  placeholder="Mobile" size="small" autoComplete="off"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.75, fontSize: 12, bgcolor: "#F8FAFC", "& fieldset": { borderColor: "#E2E8F0" }, "&:hover fieldset": { borderColor: "#C8102E" }, "&.Mui-focused fieldset": { borderColor: "#C8102E" } } }}
                  inputProps={{ style: { padding: "7px 12px", fontWeight: 500, fontFamily: "monospace", letterSpacing: "0.04em" } }}
                />
              </Box>

              {customerSuggestionsOpen && (customer.name.trim() || customer.mobile.trim()) && (
                <Paper elevation={8} sx={{ position: "absolute", top: "calc(100% - 4px)", left: 12, right: 12, zIndex: 9998, borderRadius: 2, border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 16px 40px rgba(15,23,42,0.16)" }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1.5, py: 1, bgcolor: "#FFF7F8", borderBottom: "1px solid #F3D6DB" }}>
                    <Box>
                      <Typography sx={{ fontSize: 10, fontWeight: 800, color: "#374151", letterSpacing: "0.06em" }}>CUSTOMER SEARCH</Typography>
                      <Typography sx={{ fontSize: 9, color: "#9CA3AF" }}>Select to auto-fill mobile, address and GSTIN.</Typography>
                    </Box>
                    {customerLoading
                      ? <CircularProgress size={12} sx={{ color: "#C8102E" }} />
                      : <Typography sx={{ fontSize: 9, fontWeight: 800, color: "#C8102E" }}>{customerResults.length} result{customerResults.length !== 1 ? "s" : ""}</Typography>
                    }
                  </Box>
                  {!customerLoading && customerResults.length === 0
                    ? <Box sx={{ px: 2, py: 3, textAlign: "center" }}><Typography sx={{ fontSize: 12, color: "#9CA3AF" }}>No matching customers found.</Typography></Box>
                    : <Box sx={{ maxHeight: 280, overflowY: "auto", bgcolor: "#fff" }}>
                        {customerResults.map(c => (
                          <Box key={c.cust_uuid} onMouseDown={() => handleSelectCustomer(c)}
                            sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1, px: 1.5, py: 1.1, borderBottom: "1px solid #F8FAFC", cursor: "pointer", "&:hover": { bgcolor: "#FFF7F8" } }}>
                            <Box sx={{ minWidth: 0 }}>
                              {/* Person name */}
                              {c.cust_name && (
                                <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#1F2937", lineHeight: 1.3 }}>
                                  {c.cust_name}
                                </Typography>
                              )}
                              {/* Company name — shown below with a building icon style */}
                              {c.cpy_name && (
                                <Typography sx={{ fontSize: 11, fontWeight: 600, color: c.cust_name ? "#6B7280" : "#1F2937", lineHeight: 1.3 }}>
                                  {c.cust_name ? `🏢 ${c.cpy_name}` : c.cpy_name}
                                </Typography>
                              )}
                              <Typography sx={{ fontSize: 10, color: "#9CA3AF", mt: 0.2 }}>
                                {primaryMobile(c)}{c.city ? ` • ${c.city}` : ""}
                              </Typography>
                            </Box>
                            {c.gst && <Typography sx={{ fontSize: 9, fontWeight: 700, color: "#6B7280", fontFamily: "monospace", whiteSpace: "nowrap" }}>{c.gst}</Typography>}
                          </Box>
                        ))}
                      </Box>
                  }
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 1.5, py: 0.85, bgcolor: "#FCFCFD", borderTop: "1px solid #EEF2F7" }}>
                    <Typography sx={{ fontSize: 9, color: "#9CA3AF", fontWeight: 700 }}>Type to search by name or mobile</Typography>
                    <Button size="small" variant="contained" onClick={() => { setCustomerSuggestionsOpen(false); setAddCustomerOpen(true); }}
                      sx={{ bgcolor: "#C8102E", fontSize: 9, fontWeight: 800, borderRadius: 1.5, px: 1.1, py: 0.45, "&:hover": { bgcolor: "#A50D26" } }}>+ Add New</Button>
                  </Box>
                </Paper>
              )}
            </Paper>
          </Box>

          {/* ORDER TABLE */}
          <Paper elevation={0} sx={{ border: zone === "TABLE" ? "2px solid #1976d2" : "1px solid #E5E7EB", borderRadius: 2, overflow: "hidden", mb: 1.5, transition: "border 0.2s", boxShadow: zone === "TABLE" ? "0 0 0 3px rgba(245,158,11,0.1)" : "none" }}>
            <Box sx={{ maxHeight: "calc(100vh - 460px)", overflowY: "auto" }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 10, p: 0 }} />
                    <TableCell sx={{ width: 70 }}>ITEM ID</TableCell>
                    <TableCell>DESCRIPTION</TableCell>
                    <TableCell sx={{ width: 70 }}>HSN</TableCell>
                    <TableCell align="center" sx={{ width: 60 }}>GST%</TableCell>
                    <TableCell align="right"  sx={{ width: 90 }}>GST AMT</TableCell>
                    <TableCell align="right"  sx={{ width: 90 }}>MRP (₹)</TableCell>
                    <TableCell align="center" sx={{ width: 130 }}><Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.4 }}>QTY <Kbd>Q</Kbd></Box></TableCell>
                    <TableCell align="right"  sx={{ width: 130 }}><Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.4 }}>RATE <Kbd>P</Kbd></Box></TableCell>
                    <TableCell align="right"  sx={{ width: 105 }}>DISCOUNT</TableCell>
                    <TableCell align="right"  sx={{ width: 105 }}>TOTAL</TableCell>
                    <TableCell sx={{ width: 36 }} />
                  </TableRow>
                </TableHead>
                <TableBody ref={tableBodyRef}>
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={12} align="center" sx={{ py: 6 }}>
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
                    const itemTotal = item.qty * item.sellPrice; // gross sell price × qty = base + tax
                    const itemDiscount = item.discount ?? 0;

                    return (
                      <Fade in key={item.code}>
                        <TableRow data-rowcode={item.code} onClick={() => { setZone("TABLE"); setActiveRowIdx(rowIdx); }}
                          sx={{ bgcolor: flashRow === item.code ? "#FFF1F3" : isActive ? "#E3F2FD" : "transparent", cursor: "pointer", transition: "background 0.2s", "&:hover": { bgcolor: isActive ? "#E3F2FD" : "#F5F5F5" } }}>
                          <TableCell sx={{ p: 0 }}>
                            <Box sx={{ width: 4, minHeight: 40, bgcolor: isActive ? "#1976D2" : "transparent", borderRadius: "0 2px 2px 0", transition: "background 0.2s" }} />
                          </TableCell>
                          <TableCell>
                            <Chip label={item.code} size="small" sx={{ fontWeight: 700, fontSize: 10, bgcolor: isActive ? "#BBDEFB" : "#F3F4F6", color: isActive ? "#0D47A1" : "#374151", border: isActive ? "1px solid #90CAF9" : "1px solid transparent", height: 20 }} />
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: 12, fontWeight: isActive ? 600 : 500, color: "#1A1A2E", lineHeight: 1.3 }}>{item.description}</Typography>
                            {item.category && <Typography sx={{ fontSize: 9, fontWeight: 700, color: CAT_COLOR[item.category] ?? "#6B7280" }}>{item.category}</Typography>}
                          </TableCell>
                          <TableCell><Typography sx={{ fontSize: 11, fontFamily: "monospace", color: "#374151", fontWeight: 600 }}>{item.hsn}</Typography></TableCell>
                          <TableCell align="center"><Typography sx={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>{item.gstPct}%</Typography></TableCell>
                          <TableCell align="right"><Typography sx={{ fontSize: 11, color: "#374151", fontWeight: 600 }}>{INR(itemGst)}</Typography></TableCell>
                          <TableCell align="right"><Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>₹{item.mrp.toLocaleString("en-IN")}</Typography></TableCell>
                          {/* QTY */}
                          <TableCell align="center" onClick={e => e.stopPropagation()}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.3 }}>
                              <IconButton size="small" onClick={() => updateQty(item.code, -1)} sx={{ width: 24, height: 24, bgcolor: "#F3F4F6", "&:hover": { bgcolor: "#FEE2E2" } }}><RemoveIcon sx={{ fontSize: 12 }} /></IconButton>
                              {item.editingQty ? (
                                <TextField inputRef={el => { qtyRefs.current[item.code] = el; }} value={item.qtyDraft ?? ""}
                                  onChange={e => setItems(prev => prev.map(i => i.code === item.code ? { ...i, qtyDraft: e.target.value.replace(/\D/, "") } : i))}
                                  onBlur={() => { if (editCancelledRef.current) { editCancelledRef.current = false; return; } const el = qtyRefs.current[item.code]; const newQty = Math.max(1, parseInt(el?.value ?? "") || 1); setItems(prev => prev.map(i => i.code === item.code ? { ...i, qty: newQty, editingQty: false, qtyDraft: undefined } : i)); setZone("TABLE"); setActiveRowIdx(rowIdx); }}
                                  onKeyDown={e => { if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); e.stopPropagation(); const newQty = Math.max(1, parseInt((e.target as HTMLInputElement).value) || 1); editCancelledRef.current = true; setItems(prev => prev.map(i => i.code === item.code ? { ...i, qty: newQty, editingQty: false, qtyDraft: undefined } : i)); (e.target as HTMLElement).blur(); setZone("TABLE"); setActiveRowIdx(rowIdx); } if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); editCancelledRef.current = true; setItems(prev => prev.map(i => i.code === item.code ? { ...i, editingQty: false, qtyDraft: undefined } : i)); (e.target as HTMLElement).blur(); setZone("TABLE"); setActiveRowIdx(rowIdx); } }}
                                  size="small" inputProps={{ style: { textAlign: "center", fontWeight: 800, fontSize: 14, padding: "2px 2px", width: 32 } }}
                                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1, "& fieldset": { borderColor: "#1976D2", borderWidth: 2 } }, width: 48 }} />
                              ) : (
                                <Box onClick={() => { setZone("TABLE"); setActiveRowIdx(rowIdx); if (isActive) startEditQty(item.code); }}
                                  sx={{ minWidth: 30, textAlign: "center", fontWeight: 800, fontSize: 14, px: 0.4, py: 0.2, borderRadius: 1, cursor: isActive ? "text" : "pointer", border: isActive ? "1.5px dashed #1976D2" : "1.5px dashed transparent", bgcolor: isActive ? "#E3F2FD" : "transparent", "&:hover": { border: "1.5px dashed #1976D2", bgcolor: "#E3F2FD" }, transition: "all 0.15s" }}>
                                  {item.qty}
                                </Box>
                              )}
                              <IconButton size="small" onClick={() => updateQty(item.code, 1)} sx={{ width: 24, height: 24, bgcolor: "#F3F4F6", "&:hover": { bgcolor: "#DCFCE7" } }}><AddIcon sx={{ fontSize: 12 }} /></IconButton>
                            </Box>
                          </TableCell>
                          {/* RATE */}
                          <TableCell align="right" onClick={e => e.stopPropagation()}>
                            {item.editingPrice ? (
                              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.4 }}>
                                <Typography sx={{ fontSize: 11, color: "#9CA3AF", fontWeight: 700 }}>₹</Typography>
                                <TextField inputRef={el => { priceRefs.current[item.code] = el; }} value={item.priceDraft ?? ""}
                                  onChange={e => setItems(prev => prev.map(i => i.code === item.code ? { ...i, priceDraft: e.target.value.replace(/[^0-9.]/g, "") } : i))}
                                  onBlur={() => { if (editCancelledRef.current) { editCancelledRef.current = false; return; } const el = priceRefs.current[item.code]; const newSell = Math.max(0, parseFloat(el?.value ?? "") || item.sellPrice); const newBase = item.taxInclusive && item.gstPct > 0 ? newSell / (1 + item.gstPct / 100) : newSell; setItems(prev => prev.map(i => i.code === item.code ? { ...i, sellPrice: newSell, unitPrice: newBase, editingPrice: false, priceDraft: undefined } : i)); setZone("TABLE"); setActiveRowIdx(rowIdx); }}
                                  onKeyDown={e => { if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); e.stopPropagation(); const newSell = Math.max(0, parseFloat((e.target as HTMLInputElement).value) || item.sellPrice); const newBase = item.taxInclusive && item.gstPct > 0 ? newSell / (1 + item.gstPct / 100) : newSell; editCancelledRef.current = true; setItems(prev => prev.map(i => i.code === item.code ? { ...i, sellPrice: newSell, unitPrice: newBase, editingPrice: false, priceDraft: undefined } : i)); (e.target as HTMLElement).blur(); setZone("TABLE"); setActiveRowIdx(rowIdx); } if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); editCancelledRef.current = true; setItems(prev => prev.map(i => i.code === item.code ? { ...i, editingPrice: false, priceDraft: undefined } : i)); (e.target as HTMLElement).blur(); setZone("TABLE"); setActiveRowIdx(rowIdx); } }}
                                  size="small" inputProps={{ style: { textAlign: "right", fontWeight: 700, fontSize: 12, padding: "2px 4px", width: 60 } }}
                                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1, "& fieldset": { borderColor: "#1976D2", borderWidth: 2 } }, width: 80 }} />
                              </Box>
                            ) : (
                              <Box onClick={() => { setZone("TABLE"); setActiveRowIdx(rowIdx); if (isActive) startEditPrice(item.code); }}
                                sx={{ display: "inline-flex", alignItems: "center", gap: 0.3, px: 0.6, py: 0.2, borderRadius: 1, cursor: isActive ? "text" : "pointer", border: isActive ? "1.5px dashed #1976D2" : "1.5px dashed transparent", bgcolor: isActive ? "#E3F2FD" : "transparent", "&:hover": { border: "1.5px dashed #1976D2", bgcolor: "#E3F2FD", "& .pedit": { opacity: 1 } }, transition: "all 0.15s" }}>
                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{INR(item.sellPrice)}</Typography>
                                </Box>
                                <EditIcon className="pedit" sx={{ fontSize: 10, color: "#1976D2", opacity: isActive ? 0.6 : 0, transition: "opacity 0.15s" }} />
                              </Box>
                            )}
                          </TableCell>
                          {/* DISCOUNT */}
                          <TableCell align="right">
                            <Typography sx={{ fontSize: 12, fontWeight: 600, color: itemDiscount > 0 ? "#16A34A" : "#9CA3AF" }}>
                              {itemDiscount > 0 ? `−${INR(itemDiscount)}` : "−"}
                            </Typography>
                          </TableCell>
                          {/* TOTAL */}
                          <TableCell align="right">
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: isActive ? "#0D47A1" : "#1A1A2E" }}>{INR(itemTotal - itemDiscount)}</Typography>
                          </TableCell>
                          <TableCell onClick={e => e.stopPropagation()}>
                            <IconButton size="small" onClick={() => removeItem(item.code)} sx={{ color: "#D1D5DB", "&:hover": { color: "#C8102E", bgcolor: "#FEE2E2" } }}><DeleteOutlineIcon sx={{ fontSize: 15 }} /></IconButton>
                          </TableCell>
                        </TableRow>
                      </Fade>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        </Box>

        {/* FOOTER TOOLBAR */}
        <Box sx={{ bgcolor: "#F8FAFC", px: 2, py: 0.55, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
            <Button size="small" startIcon={<DeleteOutlineIcon sx={{ fontSize: 12 }} />} onClick={handleClear} sx={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700, py: 0.3, px: 1, minWidth: 0, borderRadius: 1, "&:hover": { color: "#F87171", bgcolor: "rgba(239,68,68,0.1)" } }}>CLEAR <Box component="span" sx={{ fontSize: 9, opacity: 0.6 }}>[F4]</Box></Button>
         
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box sx={{ display: { xs: "none", xl: "flex" }, gap: 1, alignItems: "center" }}>
            {[["F2","Search"],["→","Code→Qty→Cust"],["Q","Qty"],["P","Price"],["↑↓","Rows"],["←→","Footer"],["F9","Hold"],["F8","Save"],["+−","Quick qty"],["Del","Remove"]].map(([k, l]) => (
              <Box key={k+l} sx={{ display: "flex", alignItems: "center", gap: 0.3 }}><Kbd>{k}</Kbd><Typography sx={{ fontSize: 9, color: "#9CA3AF" }}>{l}</Typography></Box>
            ))}
          </Box>
          <Divider orientation="vertical" flexItem />
          <Typography sx={{ fontSize: 10, color: "#6B7280", fontWeight: 700, letterSpacing: "0.08em" }}>ITEMS: {totalUnits} UNITS</Typography>
        </Box>

        {/* BILLING FOOTER */}
        <Box sx={{ bgcolor: "#fff", borderTop: "1px solid #E5E7EB", px: 2.5, py: 1.5, display: "flex", gap: 2, alignItems: "stretch" }}>
          {/* COL 1 */}
          <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 1.5, justifyContent: "flex-start", pt: 0.5 }}>
            <Box>
              <Typography sx={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.08em", mb: 0.5 }}>PAYMENT TYPE</Typography>
              <Select value={paymentType} onChange={e => setPaymentType(e.target.value as PaymentType)}
                onFocus={() => { setZone("FOOTER"); setFooterFocus("PAYMENT_TYPE"); }}
                size="small" fullWidth
                sx={{ fontSize: 13, fontWeight: 600, borderRadius: 1.5, "& fieldset": { borderColor: isFooterActive("PAYMENT_TYPE") ? "#C8102E" : "#E5E7EB", borderWidth: isFooterActive("PAYMENT_TYPE") ? 2 : 1 }, "&:hover fieldset": { borderColor: "#C8102E" } }}>
                {["Cash","Card","UPI","Credit"].map(val => <MenuItem key={val} value={val} sx={{ fontSize: 13, fontWeight: 600 }}>{val}</MenuItem>)}
              </Select>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.08em", mb: 0.5 }}>REFERENCE NO.</Typography>
              <TextField inputRef={refNoRef} value={referenceNo} onChange={e => setReferenceNo(e.target.value)}
                onFocus={() => { setZone("FOOTER"); setFooterFocus("REF_NO"); }}
                placeholder="Enter Transaction ID" size="small" fullWidth
                inputProps={{ style: { padding: "6px 12px", fontSize: 13 } }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5, "& fieldset": { borderColor: isFooterActive("REF_NO") ? "#C8102E" : "#E5E7EB", borderWidth: isFooterActive("REF_NO") ? 2 : 1 }, "&:hover fieldset": { borderColor: "#C8102E" } } }}
              />
            </Box>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          {/* COL 2 */}
          <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <Box>
              {[
                { label: "SUBTOTAL", value: INR(subtotal),           color: "#1A1A2E" },
                { label: "DISCOUNT", value: `− ${INR(discountAmt)}`, color: discountAmt > 0 ? "#16A34A" : "#9CA3AF" },
                { label: "GST",      value: INR(gstAmount),          color: "#1A1A2E" },
              ].map(row => (
                <Box key={row.label} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.4, borderBottom: "1px solid #F3F4F6" }}>
                  <Typography sx={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500, letterSpacing: "0.04em" }}>{row.label}</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: row.color, fontFamily: "monospace" }}>{row.value}</Typography>
                </Box>
              ))}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.6 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#1A1A2E", letterSpacing: "0.04em" }}>GRAND TOTAL</Typography>
                <Typography sx={{ fontSize: 15, fontWeight: 900, color: "#1A1A2E", fontFamily: "monospace" }}>₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</Typography>
              </Box>
            </Box>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#C8102E", letterSpacing: "0.06em" }}>DISCOUNT</Typography>
                <Kbd>F7</Kbd>
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField inputRef={discountPctRef} value={discountPct} onChange={e => setDiscountPct(e.target.value.replace(/[^0-9.]/g, ""))}
                  onFocus={() => { setZone("FOOTER"); setFooterFocus("DISCOUNT_PCT"); }} size="small"
                  InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF" }}>%</Typography></InputAdornment> }}
                  inputProps={{ style: { padding: "5px 6px", fontSize: 13, fontWeight: 600 } }}
                  sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 1.5, "& fieldset": { borderColor: isFooterActive("DISCOUNT_PCT") ? "#C8102E" : "#E5E7EB", borderWidth: isFooterActive("DISCOUNT_PCT") ? 2 : 1 }, "&:hover fieldset": { borderColor: "#C8102E" } } }}
                />
                <TextField inputRef={discountAmtRef} value={discount} onChange={e => setDiscount(e.target.value.replace(/[^0-9.]/g, ""))}
                  onFocus={() => { setZone("FOOTER"); setFooterFocus("DISCOUNT_AMT"); }} size="small"
                  InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF" }}>₹</Typography></InputAdornment> }}
                  inputProps={{ style: { padding: "5px 6px", fontSize: 13, fontWeight: 600 } }}
                  sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 1.5, "& fieldset": { borderColor: isFooterActive("DISCOUNT_AMT") ? "#C8102E" : "#E5E7EB", borderWidth: isFooterActive("DISCOUNT_AMT") ? 2 : 1 }, "&:hover fieldset": { borderColor: "#C8102E" } } }}
                />
              </Box>
            </Box>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          {/* COL 3 */}
          <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 1 }}>
            <Box onClick={() => receivedRef.current?.focus()}
              sx={{ flex: 1, border: `2px solid ${isFooterActive("RECEIVED") ? "#C8102E" : "#FECDD3"}`, borderRadius: 2, px: 2, py: 1, textAlign: "right", bgcolor: isFooterActive("RECEIVED") ? "#FFF1F3" : "#FFF5F6", cursor: "text", transition: "border-color 0.15s, background 0.15s", "&:hover": { borderColor: "#C8102E", bgcolor: "#FFF1F3" } }}>
              <Typography sx={{ fontSize: 9, fontWeight: 800, color: "#C8102E", letterSpacing: "0.1em", mb: 0.2 }}>RECEIVED AMOUNT</Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography sx={{ fontSize: 26, fontWeight: 900, color: "#C8102E", lineHeight: 1, mr: 0.3, fontFamily: "monospace" }}>₹</Typography>
                <TextField inputRef={receivedRef} value={receivedAmount} onChange={e => setReceivedAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                  onFocus={() => { setZone("FOOTER"); setFooterFocus("RECEIVED"); }}
                  placeholder="0.00" variant="standard" InputProps={{ disableUnderline: true }}
                  inputProps={{ style: { padding: 0, fontSize: 28, fontWeight: 900, color: "#C8102E", fontFamily: "monospace", width: "100%", textAlign: "right" } }}
                  sx={{ flex: 1, "& input::placeholder": { color: "#FECDD3", opacity: 1 } }}
                />
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 1, alignItems: "stretch" }}>
             
              <Button variant="contained"
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon sx={{ fontSize: 18 }} />}
                onClick={handleSave} disabled={saving || items.length === 0}
                sx={{ ...footerOutline("SAVE"), flex: 1, bgcolor: "#C8102E", color: "#fff", fontSize: 15, fontWeight: 800, py: 1, borderRadius: 2, boxShadow: "0 4px 18px rgba(200,16,46,0.35)", "&:hover": { bgcolor: "#A50D26" }, "&:active": { transform: "scale(0.98)" }, "&.Mui-disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF", boxShadow: "none" }, transition: "all 0.15s" }}>
                {saving ? "SAVING…" : "SAVE"}{" "}
                <Box component="span" sx={{ fontSize: 11, opacity: 0.85, ml: 0.5 }}>[F8]</Box>
              </Button>
               <Tooltip title={printEnabled ? "Print ON" : "Print OFF"}>
                <Box onClick={() => setPrintEnabled(p => !p)}
                  sx={{ width: 52, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0.3, border: "1px solid #E5E7EB", borderRadius: 2, cursor: "pointer", bgcolor: "#F9FAFB", "&:hover": { bgcolor: "#F3F4F6" }, transition: "background 0.15s" }}>
                  <Box sx={{ width: 32, height: 18, bgcolor: printEnabled ? "#C8102E" : "#D1D5DB", borderRadius: 10, position: "relative", transition: "background 0.2s" }}>
                    <Box sx={{ position: "absolute", top: 2, left: printEnabled ? 14 : 2, width: 14, height: 14, bgcolor: "#fff", borderRadius: "50%", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                  </Box>
                  <Typography sx={{ fontSize: 8, fontWeight: 700, color: "#6B7280", letterSpacing: "0.05em" }}>PRINT</Typography>
                </Box>
              </Tooltip>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center",justifyContent:"space-between" }}>
              <Box sx={{display:"flex",gap:1}}>
              <Button
                size="small"
                startIcon={<PauseCircleOutlineIcon sx={{ fontSize: 12 }} />}
                onClick={handleHold}
                sx={{
                  minWidth: 92,
                  height: 28,
                  px: 1.2,
                  borderRadius: 1.25,
                  bgcolor: "#4B5563",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 800,
                  boxShadow: "0 2px 6px rgba(75,85,99,0.22)",
                  "&:hover": { bgcolor: "#374151" },
                }}
              >
                HOLD <Box component="span" sx={{ fontSize: 9, opacity: 0.8, ml: 0.4 }}>[F9]</Box>
              </Button>
              <Badge
                badgeContent={heldOrders.length}
                invisible={heldOrders.length === 0}
                sx={{ "& .MuiBadge-badge": { fontSize: 8, minWidth: 14, height: 14, bgcolor: "#C8102E", color: "#fff", fontWeight: 800 } }}
              >
                <Button
                  size="small"
                  startIcon={<PlayArrowIcon sx={{ fontSize: 12 }} />}
                  onClick={() => setHoldDialogOpen(true)}
                  sx={{
                    minWidth: 90,
                    height: 28,
                    px: 1.15,
                    borderRadius: 1.25,
                    border: "1px solid #E5E7EB",
                    bgcolor: heldOrders.length > 0 ? "#4B5563" : "#F3F4F6",
                    color: heldOrders.length > 0 ? "#374151" : "#9CA3AF",
                    fontSize: 10,
                    fontWeight: 800,
                    "&:hover": {
                      bgcolor: heldOrders.length > 0 ? "#4B5563" : "#F3F4F6",
                      borderColor: heldOrders.length > 0 ? "#CBD5E1" : "#E5E7EB",
                    },
                  }}
                >
                  RECALL
                </Button>
              </Badge>
              </Box>
              <Box sx={{display:"flex",gap:1}}>
              <Typography sx={{ fontSize: 10, color: "#6B7280", fontWeight: 600 }}>PAYMENT STATUS:</Typography>
              <Typography sx={{ fontSize: 11, fontWeight: 800, color: status.color, letterSpacing: "0.06em" }}>{status.label}</Typography>
            </Box>
            </Box>
          </Box>
        </Box>

        {/* STATUS BAR */}
        <Box sx={{ bgcolor: "#1A1A2E", px: 2.5, py: 0.35, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {[{ dot: "#22C55E", label: "SYSTEM ONLINE" }, { dot: "#EF4444", label: "PRINTER READY" }].map(s => (
              <Box key={s.label} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><FiberManualRecordIcon sx={{ fontSize: 7, color: s.dot }} /><Typography sx={{ fontSize: 9, color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.06em" }}>{s.label}</Typography></Box>
            ))}
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Typography sx={{ fontSize: 9, color: "#6B7280", fontWeight: 600 }}>SERVER: CLOUD-E24</Typography>
            <Typography sx={{ fontSize: 9, color: "#9CA3AF", fontWeight: 700 }}>POS-ID: 4492-AX</Typography>
          </Box>
        </Box>

        {/* HOLD DIALOG */}
        <Dialog open={holdDialogOpen} onClose={() => setHoldDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ bgcolor: "#FEE2E2", borderRadius: 1.5, p: 0.5, display: "flex" }}><PauseCircleOutlineIcon sx={{ color: "#C8102E", fontSize: 18 }} /></Box>
              <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Held Orders</Typography>
              <Chip label={`${heldOrders.length}`} size="small" sx={{ bgcolor: "#FEE2E2", color: "#C8102E", fontWeight: 700, fontSize: 10 }} />
            </Box>
            <IconButton size="small" onClick={() => setHoldDialogOpen(false)}><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ p: 0, minHeight: 180 }}>
            {heldOrders.length === 0
              ? <Box sx={{ py: 6, textAlign: "center", color: "#D1D5DB" }}><PauseCircleOutlineIcon sx={{ fontSize: 44 }} /><Typography sx={{ fontSize: 13, mt: 1 }}>No orders on hold</Typography></Box>
              : <List disablePadding>
                  {heldOrders.map((hold, i) => (
                    <Box key={hold.id}>
                      {i > 0 && <Divider />}
                      <ListItem sx={{ px: 2, py: 1.5, "&:hover": { bgcolor: "#FFF5F6" }, alignItems: "flex-start" }}>
                        <ListItemText
                          primary={<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><Typography sx={{ fontWeight: 700, fontSize: 14 }}>{hold.label}</Typography>{hold.customer.name && <Chip label={hold.customer.name} size="small" sx={{ fontSize: 10, height: 18, bgcolor: "#F3F4F6" }} />}</Box>}
                          secondary={<Box><Typography sx={{ fontSize: 11, color: "#374151", fontWeight: 600 }}>{hold.items.length} items · {INR(hold.items.reduce((s, i) => s + i.qty * i.unitPrice, 0))}</Typography><Typography sx={{ fontSize: 10, color: "#9CA3AF" }}>{hold.time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}</Typography><Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>{hold.items.slice(0, 3).map(item => <Chip key={item.code} label={`${item.qty}× ${item.description.split(" ").slice(0, 3).join(" ")}…`} size="small" sx={{ fontSize: 9, height: 18, bgcolor: "#F3F4F6" }} />)}{hold.items.length > 3 && <Chip label={`+${hold.items.length - 3} more`} size="small" sx={{ fontSize: 9, height: 18, bgcolor: "#F3F4F6", color: "#9CA3AF" }} />}</Box></Box>}
                        />
                        <ListItemSecondaryAction sx={{ top: "50%", transform: "translateY(-50%)" }}>
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                            <Button size="small" variant="contained" startIcon={<PlayArrowIcon sx={{ fontSize: 13 }} />} onClick={() => handleRecall(hold)} sx={{ fontSize: 10, fontWeight: 700, bgcolor: "#C8102E", "&:hover": { bgcolor: "#A50D26" }, borderRadius: 1.5, py: 0.4, minWidth: 80 }}>Recall</Button>
                            <Button size="small" startIcon={<DeleteOutlineIcon sx={{ fontSize: 13 }} />} onClick={() => handleDeleteHold(hold.id)} sx={{ fontSize: 10, fontWeight: 600, color: "#EF4444", "&:hover": { bgcolor: "#FEF2F2" }, borderRadius: 1.5, py: 0.4, minWidth: 80 }}>Delete</Button>
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </Box>
                  ))}
                </List>
            }
          </DialogContent>
          <Divider />
          <DialogActions sx={{ px: 2, py: 1, justifyContent: "space-between" }}>
            <Typography sx={{ fontSize: 10, color: "#9CA3AF" }}>F9 to hold · Recall to restore</Typography>
            <Button onClick={() => setHoldDialogOpen(false)} sx={{ fontWeight: 600, color: "#374151", fontSize: 12 }}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* SAVE RESULT DIALOG */}
        <Dialog open={!!saveResult?.open} onClose={() => setSaveResult(null)} maxWidth="xs" fullWidth TransitionComponent={Fade}>
          <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ bgcolor: saveResult?.success ? "#DCFCE7" : "#FEE2E2", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {saveResult?.success ? <SaveIcon sx={{ color: "#16A34A", fontSize: 20 }} /> : <CloseIcon sx={{ color: "#C8102E", fontSize: 20 }} />}
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{saveResult?.success ? "Order Saved" : "Save Failed"}</Typography>
            </Box>
            <IconButton size="small" onClick={() => setSaveResult(null)}><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            {saveResult?.success ? (
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography sx={{ fontSize: 13, color: "#6B7280" }}>Grand Total</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{INR(saveResult.grandTotal ?? 0)}</Typography>
                </Box>
                {(saveResult.change ?? 0) > 0 && (
                  <Box sx={{ display: "flex", justifyContent: "space-between", bgcolor: "#DBEAFE", borderRadius: 1.5, px: 1.5, py: 0.8, mt: 0.5 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1D4ED8" }}>💵 Return Change</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#1D4ED8" }}>{INR(saveResult.change ?? 0)}</Typography>
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
            {saveResult?.success && printEnabled && (
              <Button variant="outlined" startIcon={<PrintOutlinedIcon />} onClick={() => setSaveResult(null)}
                sx={{ borderRadius: 2, fontWeight: 600, flex: 1, borderColor: "#E5E7EB", color: "#374151" }}>Print</Button>
            )}
            <Button variant="contained" onClick={() => setSaveResult(null)}
              sx={{ bgcolor: saveResult?.success ? "#16A34A" : "#C8102E", "&:hover": { bgcolor: saveResult?.success ? "#15803D" : "#A50D26" }, borderRadius: 2, fontWeight: 700, flex: 1 }}
              autoFocus>
              {saveResult?.success ? "New Sale" : "Dismiss"}
            </Button>
          </DialogActions>
        </Dialog>

        <CustomerLedgerDialog open={customerLedgerOpen} onClose={() => setCustomerLedgerOpen(false)}
          customerName={customer.name || "Walk-in Customer"} />
        <AddNewCustomerDialog open={addCustomerOpen} onClose={() => setAddCustomerOpen(false)} />

      </Box>
    </ThemeProvider>
  );
}
