import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Autocomplete, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, Divider,
  IconButton, MenuItem, Paper, Select, Stack, Switch, TextField, ToggleButton, ToggleButtonGroup,
  Tooltip, Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import RouterOutlinedIcon from "@mui/icons-material/RouterOutlined";
import UsbOutlinedIcon from "@mui/icons-material/UsbOutlined";
import BluetoothOutlinedIcon from "@mui/icons-material/BluetoothOutlined";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import SuccessToast from "@components/Common/SuccessToast";
import { useAppSelector } from "@store/store";
import { AllCompanies, BranchId, UserProfile, ZoduId } from "@store/slices/userSlice";
import { closeFromControlsOnly } from "@utils/dialog";
import { encodeSlip, type CutMode } from "@utils/kot/escpos";
import { buildKotSlip, type KotBatch, type PaperSize, type PrinterConnection, type PrinterRole } from "@utils/kot/kotTicket";
import type { KotSettings } from "@utils/kot/kotDispatch";
import {
  DEFAULT_BRIDGE_URL, bridgeDiscoverPrinters, bridgeHealth, bridgePrint, bridgeSystemPrinters, getBridgeUrl, setBridgeUrl,
  type DiscoveredPrinter,
} from "@utils/kot/printBridge";
import TravelExploreRoundedIcon from "@mui/icons-material/TravelExploreRounded";
import {
  extractErrorMessage, useDeleteKotPrinter, useKotCounters, useKotPrinters, useKotSettings,
  useSaveKotPrinter, useUpdateKotCounter, useUpdateKotSettings,
  type KotCounter, type KotPrinter, type KotPrinterInput,
} from "@pages/MenuItemScreen/kotApi";
import KotSlipPreview from "@pages/restaurant/kot/KotSlipPreview";

const redTint = "#ca0022";
const headingText = "#1d2533";
const subtleText = "#8e95a3";
const cardBorder = "#ececf2";

const DEFAULT_SETTINGS: KotSettings = {
  kot_printing_enabled: true,
  default_counter_id: null,
  billing_printer_id: null,
  print_all_at_billing: false,
  billing_copy_mode: "consolidated",
  max_retries: 1,
};

const CONNECTION_LABEL: Record<PrinterConnection, string> = { LAN: "LAN", USB: "USB", BLUETOOTH: "Bluetooth" };
const ROLE_LABEL: Record<PrinterRole, string> = { kot_counter: "KOT counter", billing: "Billing", both: "KOT + Billing" };
const CUT_LABEL: Record<CutMode, string> = { partial: "Partial cut", full: "Full cut", none: "No cut" };

const selectSx = {
  fontSize: 13,
  fontWeight: 600,
  borderRadius: 1,
  bgcolor: "#fafbfc",
  height: 40,
  "& .MuiOutlinedInput-notchedOutline": { borderColor: cardBorder },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: redTint },
};

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    fontSize: 13,
    fontWeight: 600,
    borderRadius: 1,
    bgcolor: "#fafbfc",
    "& fieldset": { borderColor: cardBorder },
    "&.Mui-focused fieldset": { borderColor: redTint },
  },
};

function Section({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <Paper elevation={0} sx={{ borderRadius: 1, border: "1px solid", borderColor: cardBorder, bgcolor: "#fff", overflow: "hidden" }}>
      <Box sx={{ px: { xs: 2, md: 2.5 }, pt: 2, pb: 1, display: "flex", alignItems: "flex-start", gap: 2 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 800, color: headingText, letterSpacing: 0.2 }}>{title}</Typography>
          {subtitle && <Typography sx={{ fontSize: 12, color: subtleText, mt: 0.3 }}>{subtitle}</Typography>}
        </Box>
        {action}
      </Box>
      <Divider sx={{ borderColor: "#f4f5f8" }} />
      <Box sx={{ px: { xs: 2, md: 2.5 } }}>{children}</Box>
    </Paper>
  );
}

function SettingRow({ label, description, children }: { label: string; description: string; children: ReactNode }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, py: 1.75, flexWrap: { xs: "wrap", sm: "nowrap" } }}>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText }}>{label}</Typography>
        <Typography sx={{ fontSize: 12, color: subtleText, mt: 0.3 }}>{description}</Typography>
      </Box>
      <Box sx={{ flexShrink: 0, minWidth: { xs: "100%", sm: 200 }, display: "flex", justifyContent: "flex-end" }}>{children}</Box>
    </Box>
  );
}

// An id Select holds "" for none; MUI types its value as the option type, so normalise here.
const selectId = (value: unknown): number | null => (value === "" || value == null ? null : Number(value));

const connectionIcon = (type: PrinterConnection) =>
  type === "LAN" ? <RouterOutlinedIcon fontSize="small" /> : type === "USB" ? <UsbOutlinedIcon fontSize="small" /> : <BluetoothOutlinedIcon fontSize="small" />;

const printerAddress = (p: KotPrinter) =>
  p.connection_type === "LAN" ? `${p.ip_address}:${p.port ?? 9100}` : p.device_name ?? "";

// ─── Sample ticket for preview and test prints ──────────────────────────────

function sampleBatch(orderType: "Dine-In" | "Takeaway" | "Delivery", counterName: string): KotBatch {
  return {
    api_order_id: "preview",
    kot_no: 12,
    order_no: orderType === "Dine-In" ? "023" : "INV-B1-144",
    order_type: orderType,
    table_no: orderType === "Dine-In" ? "T5" : null,
    customer_name: "Ravi Kumar",
    customer_phone: "9876543210",
    delivery_address: "12, Anna Salai, Teynampet, Chennai 600018",
    waiter_name: orderType === "Dine-In" ? "Suresh" : null,
    covers: orderType === "Dine-In" ? 4 : null,
    tickets: [{
      ticket_id: 0,
      kot_type: "NEW",
      kot_counter_id: 1,
      counter_name: counterName,
      created_at: new Date().toISOString(),
      print_status: null,
      items: [
        { item_id: "1", item_name: "Paneer Tikka", variant_name: "Half", qty: 2, note: "less spicy", fallback_counter_id: null },
        { item_id: "2", item_name: "Butter Naan", variant_name: null, qty: 4, note: null, fallback_counter_id: null },
        { item_id: "3", item_name: "Tandoori Roti", variant_name: null, qty: 3, note: "well done", fallback_counter_id: null },
      ],
    }],
  };
}

// ─── Printer dialog ─────────────────────────────────────────────────────────

const EMPTY_PRINTER: KotPrinterInput = {
  printer_name: "", connection_type: "LAN", ip_address: "", port: 9100, device_name: "",
  paper_size: "3", cut_mode: "partial", role: "kot_counter", active: true,
};

const IPV4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;

function PrinterDialog({ open, initial, draft, onClose, onSave, saving, apiError }: {
  open: boolean;
  initial: KotPrinter | null;
  /** Prefill for a new printer, e.g. one found by auto detect. */
  draft?: Partial<KotPrinterInput> | null;
  onClose: () => void;
  onSave: (printer: KotPrinterInput & { id?: number }) => void;
  saving: boolean;
  apiError: string;
}) {
  const [form, setForm] = useState<KotPrinterInput>(EMPTY_PRINTER);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [systemPrinters, setSystemPrinters] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setForm(initial ? { ...EMPTY_PRINTER, ...initial, ip_address: initial.ip_address ?? "", device_name: initial.device_name ?? "", cut_mode: initial.cut_mode ?? "partial" } : { ...EMPTY_PRINTER, ...draft });
    setErrors({});
    // Offer this PC's installed printers for USB/Bluetooth; silently empty without the bridge.
    bridgeSystemPrinters().then(setSystemPrinters).catch(() => setSystemPrinters([]));
  }, [open, initial, draft]);

  const set = <K extends keyof KotPrinterInput>(key: K, value: KotPrinterInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const handleSave = () => {
    const next: Record<string, string> = {};
    if (!form.printer_name.trim()) next.printer_name = "Printer name is required";
    if (form.connection_type === "LAN") {
      if (!IPV4.test((form.ip_address ?? "").trim())) next.ip_address = "Enter a valid IP address, e.g. 192.168.1.50";
      const port = Number(form.port);
      if (!Number.isInteger(port) || port < 1 || port > 65535) next.port = "1–65535";
    } else if (!(form.device_name ?? "").trim()) {
      next.device_name = form.connection_type === "BLUETOOTH" ? "Printer name or COM port is required" : "Printer name is required";
    }
    setErrors(next);
    if (Object.keys(next).length) return;
    onSave({
      ...form,
      id: initial?.id,
      printer_name: form.printer_name.trim(),
      ip_address: form.connection_type === "LAN" ? (form.ip_address ?? "").trim() : null,
      port: form.connection_type === "LAN" ? Number(form.port) : null,
      device_name: form.connection_type === "LAN" ? null : (form.device_name ?? "").trim(),
    });
  };

  return (
    <Dialog open={open} onClose={closeFromControlsOnly(onClose)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 1.5 } }}>
      <Box sx={{ display: "flex", alignItems: "center", px: 3, py: 2, borderBottom: "1px solid", borderColor: "divider" }}>
        <Typography sx={{ fontWeight: 800, fontSize: 16, flex: 1 }}>{initial ? "Edit printer" : "Add printer"}</Typography>
        <IconButton size="small" onClick={onClose} disabled={saving}><CloseIcon fontSize="small" /></IconButton>
      </Box>
      <DialogContent sx={{ px: 3, py: 2.5 }}>
        <Stack spacing={2}>
          <TextField
            label="Printer name" size="small" fullWidth autoFocus value={form.printer_name}
            onChange={(e) => set("printer_name", e.target.value)} placeholder="e.g. Tandoor printer"
            error={!!errors.printer_name} helperText={errors.printer_name} inputProps={{ maxLength: 60 }} sx={textFieldSx}
          />
          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: subtleText, mb: 0.75 }}>Connection</Typography>
            <ToggleButtonGroup
              exclusive fullWidth size="small" value={form.connection_type}
              onChange={(_, v: PrinterConnection | null) => v && set("connection_type", v)}
              sx={{ "& .MuiToggleButton-root": { textTransform: "none", fontWeight: 700, gap: 0.75 }, "& .Mui-selected": { color: `${redTint} !important`, bgcolor: "#fdecef !important" } }}
            >
              {(["LAN", "USB", "BLUETOOTH"] as const).map((t) => (
                <ToggleButton key={t} value={t}>{connectionIcon(t)}{CONNECTION_LABEL[t]}</ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
          {form.connection_type === "LAN" ? (
            <Stack direction="row" spacing={1.5}>
              <TextField
                label="IP address" size="small" fullWidth value={form.ip_address ?? ""}
                onChange={(e) => set("ip_address", e.target.value)} placeholder="192.168.1.50"
                error={!!errors.ip_address} helperText={errors.ip_address} sx={textFieldSx}
              />
              <TextField
                label="Port" size="small" type="number" value={form.port ?? ""} sx={{ ...textFieldSx, width: 110 }}
                onChange={(e) => set("port", selectId(e.target.value))}
                error={!!errors.port} helperText={errors.port}
              />
            </Stack>
          ) : (
            <Autocomplete
              freeSolo options={systemPrinters} value={form.device_name ?? ""}
              onInputChange={(_, v) => set("device_name", v)}
              renderInput={(params) => (
                <TextField
                  {...params} size="small" sx={textFieldSx}
                  label={form.connection_type === "BLUETOOTH" ? "Printer name or COM port" : "Printer name on this PC"}
                  placeholder={form.connection_type === "BLUETOOTH" ? "e.g. COM5" : "e.g. EPSON TM-T82"}
                  error={!!errors.device_name}
                  helperText={errors.device_name || (systemPrinters.length ? "Pick an installed printer, or type its name" : "As installed on the billing PC running the print bridge")}
                />
              )}
            />
          )}
          <Stack direction="row" spacing={1.5}>
            <Select size="small" fullWidth value={form.paper_size} onChange={(e) => set("paper_size", e.target.value as PaperSize)} sx={selectSx}>
              <MenuItem value="2">2 inch (58 mm)</MenuItem>
              <MenuItem value="3">3 inch (80 mm)</MenuItem>
              <MenuItem value="5">5 inch (127 mm)</MenuItem>
            </Select>
            <Select size="small" fullWidth value={form.role} onChange={(e) => set("role", e.target.value as PrinterRole)} sx={selectSx}
              renderValue={(r) => `Use: ${ROLE_LABEL[r as PrinterRole]}`}>
              {(Object.keys(ROLE_LABEL) as PrinterRole[]).map((r) => <MenuItem key={r} value={r}>{ROLE_LABEL[r]}</MenuItem>)}
            </Select>
          </Stack>
          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: subtleText, mb: 0.75 }}>Auto cutter</Typography>
            <ToggleButtonGroup
              exclusive fullWidth size="small" value={form.cut_mode}
              onChange={(_, v: CutMode | null) => v && set("cut_mode", v)}
              sx={{ "& .MuiToggleButton-root": { textTransform: "none", fontWeight: 700 }, "& .Mui-selected": { color: `${redTint} !important`, bgcolor: "#fdecef !important" } }}
            >
              {(["partial", "full", "none"] as const).map((m) => <ToggleButton key={m} value={m}>{CUT_LABEL[m]}</ToggleButton>)}
            </ToggleButtonGroup>
            <Typography sx={{ fontSize: 11, color: subtleText, mt: 0.5 }}>
              {form.cut_mode === "none" ? "Paper feeds out to tear by hand — for printers without a cutter" : "Paper is cut automatically after every ticket"}
            </Typography>
          </Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Active</Typography>
            <Switch checked={form.active} onChange={(e) => set("active", e.target.checked)} color="error" />
          </Stack>
          {apiError && <Typography sx={{ color: "error.main", fontSize: 12 }}>{apiError}</Typography>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider" }}>
        <Button onClick={onClose} disabled={saving} sx={{ textTransform: "none", fontWeight: 600, color: "text.secondary" }}>Cancel</Button>
        <Button
          variant="contained" onClick={handleSave} disabled={saving}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveRoundedIcon />}
          sx={{ textTransform: "none", fontWeight: 700, bgcolor: redTint, "&:hover": { bgcolor: "#a8001c" } }}
        >
          {initial ? "Save printer" : "Add printer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Auto detect dialog ─────────────────────────────────────────────────────

// Bluetooth scans also turn up headphones and phones; names like these float to the top.
const LIKELY_PRINTER = /print|pos|thermal|receipt|epson|tvs|xprinter|rugtek|posiflex|bixolon|star|citizen|zebra|tm-|rp\d|\bxp-/i;

const discoveredKey = (p: { connection_type: string; ip_address: string | null; port: number | null; device_name: string | null }) =>
  p.connection_type === "LAN" ? `LAN:${p.ip_address}:${p.port ?? 9100}` : `${p.connection_type}:${(p.device_name ?? "").toLowerCase()}`;

function DetectPrintersDialog({ open, existing, onClose, onPick }: {
  open: boolean;
  existing: KotPrinter[];
  onClose: () => void;
  onPick: (printer: DiscoveredPrinter) => void;
}) {
  const [state, setState] = useState<{ status: "scanning" } | { status: "done"; printers: DiscoveredPrinter[] } | { status: "error"; error: string }>({ status: "scanning" });

  const scan = () => {
    setState({ status: "scanning" });
    bridgeDiscoverPrinters()
      .then((found) => {
        const rank = (p: DiscoveredPrinter) => (p.connection_type !== "BLUETOOTH" || LIKELY_PRINTER.test(`${p.name} ${p.detail}`) ? 0 : 1);
        setState({ status: "done", printers: [...found].sort((a, b) => rank(a) - rank(b)) });
      })
      .catch((err) => setState({ status: "error", error: err instanceof Error ? err.message : "Scan failed" }));
  };
  useEffect(() => { if (open) scan(); }, [open]);

  const added = new Set(existing.map(discoveredKey));

  return (
    <Dialog open={open} onClose={closeFromControlsOnly(onClose)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 1.5 } }}>
      <Box sx={{ display: "flex", alignItems: "center", px: 3, py: 2, borderBottom: "1px solid", borderColor: "divider" }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 800, fontSize: 16 }}>Detect printers</Typography>
          <Typography sx={{ fontSize: 12, color: subtleText }}>Network printers on this PC's Wi-Fi/LAN, and USB or paired Bluetooth printers on this PC</Typography>
        </Box>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </Box>
      <DialogContent sx={{ px: 3, py: 1, minHeight: 180 }}>
        {state.status === "scanning" && (
          <Stack alignItems="center" spacing={1.5} sx={{ py: 5 }}>
            <CircularProgress size={28} sx={{ color: redTint }} />
            <Typography sx={{ fontSize: 13, color: subtleText }}>Searching for printers… this takes a few seconds</Typography>
          </Stack>
        )}
        {state.status === "error" && (
          <Typography sx={{ fontSize: 13, color: "error.main", py: 5, textAlign: "center" }}>{state.error}</Typography>
        )}
        {state.status === "done" && state.printers.length === 0 && (
          <Typography sx={{ fontSize: 13, color: subtleText, py: 5, textAlign: "center" }}>
            No printers found. Check the printer is switched on and on the same network as this PC, or that its USB driver is installed / it is paired over Bluetooth. You can still add it manually.
          </Typography>
        )}
        {state.status === "done" && state.printers.map((p, i) => {
          const isAdded = added.has(discoveredKey(p));
          return (
            <Box key={discoveredKey(p)} sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1.5, borderTop: i ? "1px solid #f4f5f8" : "none" }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: "#eef4ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {connectionIcon(p.connection_type)}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText }} noWrap>{p.name}</Typography>
                <Typography sx={{ fontSize: 12, color: subtleText }} noWrap>
                  {p.connection_type === "LAN" ? `${p.ip_address}:${p.port ?? 9100}` : p.device_name} · {p.detail}
                </Typography>
              </Box>
              {isAdded ? (
                <Chip label="Added" size="small" sx={{ fontWeight: 700, fontSize: 11, bgcolor: "#ecfdf5", color: "#047857" }} />
              ) : (
                <Button size="small" startIcon={<AddRoundedIcon />} onClick={() => onPick(p)}
                  sx={{ textTransform: "none", fontWeight: 700, color: redTint, bgcolor: "#fdecef", borderRadius: 1, "&:hover": { bgcolor: "#fbd5dc" } }}>
                  Add
                </Button>
              )}
            </Box>
          );
        })}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider" }}>
        <Button onClick={scan} disabled={state.status === "scanning"} sx={{ textTransform: "none", fontWeight: 700, color: headingText }}>Scan again</Button>
        <Button onClick={onClose} sx={{ textTransform: "none", fontWeight: 600, color: "text.secondary" }}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

type BridgeState = { status: "checking" } | { status: "ok"; version: string } | { status: "down"; error: string };

export default function PrinterSettings() {
  const zoduId = useAppSelector(ZoduId) ?? "";
  const branchId = useAppSelector(BranchId) ?? "";
  const companies = useAppSelector(AllCompanies);
  const profile = useAppSelector(UserProfile);
  const company = companies.find((c) => c.zodu_id === zoduId);
  const restaurantName = company?.restaurant_name || company?.company_name || profile?.restaurant_name || "Restaurant";

  const { data: printers = [], isLoading: printersLoading } = useKotPrinters(zoduId, branchId);
  const { data: counters = [], isLoading: countersLoading } = useKotCounters(zoduId, branchId);
  const { data: savedSettings, isLoading: settingsLoading } = useKotSettings(zoduId, branchId);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // ── Print bridge (this computer) ──
  const [bridgeUrl, setBridgeUrlState] = useState(getBridgeUrl);
  const [bridge, setBridge] = useState<BridgeState>({ status: "checking" });
  const checkBridge = async () => {
    setBridge({ status: "checking" });
    try {
      const { version } = await bridgeHealth();
      setBridge({ status: "ok", version });
    } catch (err) {
      setBridge({ status: "down", error: err instanceof Error ? err.message : "Not reachable" });
    }
  };
  useEffect(() => { checkBridge(); }, []);

  // ── Printers ──
  const [printerDialog, setPrinterDialog] = useState<{ open: boolean; printer: KotPrinter | null; draft?: Partial<KotPrinterInput> }>({ open: false, printer: null });
  const [detectOpen, setDetectOpen] = useState(false);
  const addDetected = (p: DiscoveredPrinter) => {
    setDetectOpen(false);
    setPrinterError("");
    setPrinterDialog({
      open: true,
      printer: null,
      draft: {
        printer_name: p.name.slice(0, 60), connection_type: p.connection_type,
        ip_address: p.ip_address ?? "", port: p.port ?? 9100, device_name: p.device_name ?? "",
        // The first printer is usually the billing counter's.
        role: printers.length === 0 ? "both" : "kot_counter",
      },
    });
  };
  const [printerError, setPrinterError] = useState("");
  const savePrinter = useSaveKotPrinter(zoduId, branchId);
  const deletePrinter = useDeleteKotPrinter(zoduId, branchId);
  const [testingId, setTestingId] = useState<number | null>(null);

  const testPrint = async (printer: KotPrinter) => {
    setTestingId(printer.id);
    try {
      const slip = buildKotSlip(sampleBatch("Dine-In", "Test"), sampleBatch("Dine-In", "Test").tickets, {
        restaurantName, paper: printer.paper_size, printedAt: new Date(), banner: `Test print - ${printer.printer_name}`,
      });
      await bridgePrint(printer, encodeSlip(slip, printer.cut_mode));
      setSuccessMsg(`Test KOT sent to ${printer.printer_name}`);
    } catch (err) {
      setErrorMsg(`${printer.printer_name}: ${err instanceof Error ? err.message : "print failed"}`);
    } finally {
      setTestingId(null);
    }
  };

  // ── Counter printers ──
  // Counters are created and mapped to menu items from Menu Items → KOT Settings;
  // here each one only gets its printer. The update endpoint takes the whole
  // counter, so every other field is sent back unchanged.
  const updateCounter = useUpdateKotCounter(zoduId, branchId);
  const assignPrinter = (c: KotCounter, printerId: number | null) =>
    updateCounter.mutate(
      { id: c.id, counter_name: c.counter_name, printer_id: printerId, print_billing_copy: c.print_billing_copy, active: c.active, is_default: c.is_default },
      {
        onSuccess: () => setSuccessMsg(printerId ? `${c.counter_name} will print on ${printers.find((p) => p.id === printerId)?.printer_name ?? "the selected printer"}` : `Printer removed from ${c.counter_name}`),
        onError: (err) => setErrorMsg(extractErrorMessage(err, "Unable to assign printer")),
      },
    );

  // ── Global settings ──
  const [settings, setSettings] = useState<KotSettings>(DEFAULT_SETTINGS);
  useEffect(() => { if (savedSettings) setSettings({ ...DEFAULT_SETTINGS, ...savedSettings }); }, [savedSettings]);
  const updateSettings = useUpdateKotSettings(zoduId, branchId);

  // Billing printer saves on change; the dispatcher falls back to a billing-role printer when none is chosen.
  const chosenBillingPrinter = printers.find((p) => p.id === savedSettings?.billing_printer_id && p.active);
  const effectiveBillingPrinter = chosenBillingPrinter ?? printers.find((p) => p.active && (p.role === "billing" || p.role === "both"));
  const assignBillingPrinter = (printerId: number | null) => {
    setSettings((s) => ({ ...s, billing_printer_id: printerId }));
    updateSettings.mutate(
      { ...DEFAULT_SETTINGS, ...savedSettings, billing_printer_id: printerId },
      {
        onSuccess: () => setSuccessMsg(printerId ? `Billing printer set to ${printers.find((p) => p.id === printerId)?.printer_name ?? "the selected printer"}` : "Billing printer removed"),
        onError: (err) => setErrorMsg(extractErrorMessage(err, "Unable to save billing printer")),
      },
    );
  };
  const dirty = !!savedSettings && (Object.keys(DEFAULT_SETTINGS) as (keyof KotSettings)[]).some((k) => settings[k] !== savedSettings[k]);

  // ── Preview ──
  const [previewType, setPreviewType] = useState<"Dine-In" | "Takeaway" | "Delivery">("Dine-In");
  const [previewPaper, setPreviewPaper] = useState<PaperSize>("3");
  const previewSlip = useMemo(() => {
    const b = sampleBatch(previewType, counters[0]?.counter_name ?? "Tandoor");
    return buildKotSlip(b, b.tickets, { restaurantName, paper: previewPaper, printedAt: new Date() });
  }, [previewType, previewPaper, counters, restaurantName]);

  if (printersLoading || countersLoading || settingsLoading) {
    return <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress size={28} sx={{ color: redTint }} /></Box>;
  }

  const addButton = (label: string, onClick: () => void) => (
    <Button
      size="small" startIcon={<AddRoundedIcon />} onClick={onClick}
      sx={{ textTransform: "none", fontWeight: 700, color: redTint, bgcolor: "#fdecef", borderRadius: 1, "&:hover": { bgcolor: "#fbd5dc" } }}
    >
      {label}
    </Button>
  );

  return (
    <Box>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.4fr) minmax(0, 1fr)" }, gap: 2, alignItems: "start" }}>
        <Stack spacing={2} sx={{ minWidth: 0 }}>
          {/* ── Bridge ── */}
          <Section title="Print bridge on this computer" subtitle="The POS sends kitchen tickets to printers through the Zodu Print Bridge running on this billing PC.">
            <Box sx={{ py: 2, display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
              <Chip
                icon={bridge.status === "checking" ? <CircularProgress size={12} /> : undefined}
                label={bridge.status === "ok" ? `Connected · v${bridge.version}` : bridge.status === "down" ? "Not running" : "Checking…"}
                sx={{
                  fontWeight: 700, fontSize: 12,
                  bgcolor: bridge.status === "ok" ? "#ecfdf5" : bridge.status === "down" ? "#fef2f2" : "#f3f4f6",
                  color: bridge.status === "ok" ? "#047857" : bridge.status === "down" ? "#b91c1c" : "#6b7280",
                }}
              />
              <TextField
                size="small" value={bridgeUrl} onChange={(e) => setBridgeUrlState(e.target.value)} placeholder={DEFAULT_BRIDGE_URL}
                InputProps={{ startAdornment: <LinkRoundedIcon sx={{ fontSize: 18, color: subtleText, mr: 0.75 }} /> }}
                sx={{ ...textFieldSx, flex: 1, minWidth: 220 }}
              />
              <Button
                variant="outlined" size="small" onClick={() => { setBridgeUrl(bridgeUrl); setBridgeUrlState(getBridgeUrl()); checkBridge(); }}
                sx={{ textTransform: "none", fontWeight: 700, borderColor: cardBorder, color: headingText, height: 40 }}
              >
                Save & test
              </Button>
            </Box>
            {bridge.status === "down" && (
              <Typography sx={{ fontSize: 12, color: subtleText, pb: 2 }}>
                {bridge.error}. Install and start the print bridge on this PC (see <b>print-bridge/README.md</b>), then press Save & test.
                Orders still go through without it — tickets are kept and can be reprinted once it is running.
              </Typography>
            )}
          </Section>

          {/* ── Printers ── */}
          <Section
            title="Printers"
            subtitle="Kitchen and billing printers on this branch's network"
            action={
              <Stack direction="row" spacing={1}>
                <Tooltip title={bridge.status === "ok" ? "" : "Start the print bridge on this PC to detect printers"}>
                  <span>
                    <Button
                      size="small" variant="outlined" startIcon={<TravelExploreRoundedIcon />} disabled={bridge.status !== "ok"} onClick={() => setDetectOpen(true)}
                      sx={{ textTransform: "none", fontWeight: 700, borderColor: cardBorder, color: headingText, borderRadius: 1 }}
                    >
                      Auto detect
                    </Button>
                  </span>
                </Tooltip>
                {addButton("Add printer", () => { setPrinterError(""); setPrinterDialog({ open: true, printer: null }); })}
              </Stack>
            }
          >
            {printers.length === 0 && (
              <Typography sx={{ fontSize: 13, color: subtleText, py: 3, textAlign: "center" }}>No printers yet. Use Auto detect to find them, or add each kitchen counter's printer and the billing printer.</Typography>
            )}
            {printers.map((p, i) => (
              <Box key={p.id} sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1.5, borderTop: i ? "1px solid #f4f5f8" : "none", opacity: p.active ? 1 : 0.55 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: "#eef4ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {connectionIcon(p.connection_type)}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText }} noWrap>{p.printer_name}</Typography>
                  <Typography sx={{ fontSize: 12, color: subtleText }} noWrap>
                    {CONNECTION_LABEL[p.connection_type]} · {printerAddress(p)} · {p.paper_size}" · {CUT_LABEL[p.cut_mode ?? "partial"]} · {ROLE_LABEL[p.role]}{p.active ? "" : " · Inactive"}
                  </Typography>
                </Box>
                <Tooltip title="Test print">
                  <span>
                    <IconButton size="small" onClick={() => testPrint(p)} disabled={testingId !== null}>
                      {testingId === p.id ? <CircularProgress size={16} /> : <PrintOutlinedIcon fontSize="small" />}
                    </IconButton>
                  </span>
                </Tooltip>
                <IconButton size="small" onClick={() => { setPrinterError(""); setPrinterDialog({ open: true, printer: p }); }}><EditOutlinedIcon fontSize="small" /></IconButton>
                <IconButton
                  size="small" sx={{ color: redTint }}
                  onClick={() => {
                    if (!window.confirm(`Delete ${p.printer_name}? Counters using it will fall back until a new printer is set.`)) return;
                    deletePrinter.mutate(p.id, { onSuccess: () => setSuccessMsg("Printer deleted"), onError: (err) => setErrorMsg(extractErrorMessage(err, "Unable to delete printer")) });
                  }}
                >
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Section>

          {/* ── Counter printers ── */}
          <Section title="Printer assignment" subtitle="Choose the billing printer and the printer each KOT counter prints on. Counters without a printer print on the billing printer. Counters are managed in Menu Items → KOT Settings.">
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1.5, flexWrap: { xs: "wrap", sm: "nowrap" } }}>
              <Chip label="BILL" size="small" sx={{ fontWeight: 800, fontSize: 11, bgcolor: "#eef4ff", color: "#2563eb" }} />
              <Box sx={{ flex: 1, minWidth: 140 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText }} noWrap>Billing printer</Typography>
                <Typography sx={{ fontSize: 12, color: subtleText }}>
                  Bills, billing copies, and KOTs for counters with no printer
                </Typography>
              </Box>
              <Select
                size="small" displayEmpty value={settings.billing_printer_id ?? ""} disabled={updateSettings.isPending}
                sx={{ ...selectSx, width: { xs: "100%", sm: 240 } }}
                onChange={(e) => assignBillingPrinter(selectId(e.target.value))}
                renderValue={(v) => {
                  const chosen = printers.find((p) => p.id === selectId(v));
                  if (chosen) return chosen.printer_name;
                  return effectiveBillingPrinter
                    ? <Typography sx={{ fontSize: 13, color: subtleText, fontWeight: 600 }}>Auto · {effectiveBillingPrinter.printer_name}</Typography>
                    : <Typography sx={{ fontSize: 13, color: "#b91c1c", fontWeight: 600 }}>No billing printer</Typography>;
                }}
              >
                <MenuItem value="">None (auto-pick a Billing printer)</MenuItem>
                {printers.filter((p) => p.active || p.id === settings.billing_printer_id).map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.printer_name} · {ROLE_LABEL[p.role]}</MenuItem>
                ))}
              </Select>
            </Box>
            {counters.length === 0 && (
              <Typography sx={{ fontSize: 13, color: subtleText, py: 3, textAlign: "center" }}>
                No KOT counters yet. Add them from Menu Items → KOT Settings, then assign their printers here.
              </Typography>
            )}
            {counters.map((c) => {
              const printer = printers.find((p) => p.id === c.printer_id);
              return (
                <Box key={c.id} sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1.5, borderTop: "1px solid #f4f5f8", flexWrap: { xs: "wrap", sm: "nowrap" }, opacity: c.active ? 1 : 0.55 }}>
                  <Chip label={c.counter_code} size="small" sx={{ fontWeight: 800, fontSize: 11, bgcolor: "#fdecef", color: redTint }} />
                  <Box sx={{ flex: 1, minWidth: 140 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText }} noWrap>{c.counter_name}</Typography>
                    <Typography sx={{ fontSize: 12, color: subtleText }}>
                      {c.item_count ?? 0} item{c.item_count === 1 ? "" : "s"}{c.active ? "" : " · Inactive"}
                    </Typography>
                  </Box>
                  <Select
                    size="small" displayEmpty value={c.printer_id ?? ""} disabled={updateCounter.isPending}
                    sx={{ ...selectSx, width: { xs: "100%", sm: 240 } }}
                    onChange={(e) => assignPrinter(c, selectId(e.target.value))}
                    renderValue={(v) => (selectId(v) !== null
                      ? printer?.printer_name ?? "—"
                      : effectiveBillingPrinter
                        ? <Typography sx={{ fontSize: 13, color: subtleText, fontWeight: 600 }}>Billing printer · {effectiveBillingPrinter.printer_name}</Typography>
                        : <Typography sx={{ fontSize: 13, color: "#b91c1c", fontWeight: 600 }}>No printer assigned</Typography>)}
                  >
                    <MenuItem value="">Use billing printer</MenuItem>
                    {printers.filter((p) => p.role !== "billing" || p.id === c.printer_id).map((p) => (
                      <MenuItem key={p.id} value={p.id}>{p.printer_name} · {printerAddress(p)}</MenuItem>
                    ))}
                  </Select>
                </Box>
              );
            })}
          </Section>

          {/* ── Global ── */}
          <Section
            title="Routing & billing copies"
            subtitle="Branch-wide KOT behaviour"
            action={
              <Button
                variant="contained" size="small" disabled={!dirty || updateSettings.isPending}
                startIcon={updateSettings.isPending ? <CircularProgress size={14} color="inherit" /> : <SaveRoundedIcon />}
                onClick={() => updateSettings.mutate(settings, {
                  onSuccess: () => setSuccessMsg("KOT settings saved"),
                  onError: (err) => setErrorMsg(extractErrorMessage(err, "Unable to save KOT settings")),
                })}
                sx={{ textTransform: "none", fontWeight: 700, bgcolor: redTint, "&:hover": { bgcolor: "#a8001c" } }}
              >
                Save
              </Button>
            }
          >
            <SettingRow label="Print KOTs automatically" description="Print kitchen tickets when an order is sent, edited or paid">
              <Switch color="error" checked={settings.kot_printing_enabled} onChange={(e) => setSettings((s) => ({ ...s, kot_printing_enabled: e.target.checked }))} />
            </SettingRow>
            <Divider sx={{ borderColor: "#f4f5f8" }} />
            <SettingRow label="Default counter" description="Where unmapped and newly created items print">
              <Select size="small" fullWidth displayEmpty value={settings.default_counter_id ?? ""} sx={selectSx}
                onChange={(e) => setSettings((s) => ({ ...s, default_counter_id: selectId(e.target.value) }))}>
                <MenuItem value="">Billing printer</MenuItem>
                {counters.filter((c) => c.active).map((c) => <MenuItem key={c.id} value={c.id}>{c.counter_name}</MenuItem>)}
              </Select>
            </SettingRow>
            <Divider sx={{ borderColor: "#f4f5f8" }} />
            <SettingRow label="Print full KOT at billing counter" description="Every order's tickets also print at billing, regardless of per-counter copies">
              <Switch color="error" checked={settings.print_all_at_billing} disabled={!effectiveBillingPrinter}
                onChange={(e) => setSettings((s) => ({ ...s, print_all_at_billing: e.target.checked }))} />
            </SettingRow>
            {/* Billing copy format — hidden for now; the saved billing_copy_mode (default "consolidated") still applies.
            {settings.print_all_at_billing && (
              <>
                <Divider sx={{ borderColor: "#f4f5f8" }} />
                <SettingRow label="Billing copy format" description="One slip with every counter's items, or a copy of each counter's slip">
                  <Select size="small" fullWidth value={settings.billing_copy_mode} sx={selectSx}
                    onChange={(e) => setSettings((s) => ({ ...s, billing_copy_mode: e.target.value as KotSettings["billing_copy_mode"] }))}>
                    <MenuItem value="consolidated">One consolidated KOT</MenuItem>
                    <MenuItem value="per_counter">Copy of each counter's KOT</MenuItem>
                  </Select>
                </SettingRow>
              </>
            )}
            */}
            <Divider sx={{ borderColor: "#f4f5f8" }} />
            <SettingRow label="Retries before fallback" description="Extra attempts on a counter's own printer before rerouting its items">
              <Select size="small" fullWidth value={settings.max_retries} sx={selectSx}
                onChange={(e) => setSettings((s) => ({ ...s, max_retries: Number(e.target.value) }))}>
                {[0, 1, 2, 3].map((n) => <MenuItem key={n} value={n}>{n === 0 ? "No retry" : `${n} retr${n === 1 ? "y" : "ies"}`}</MenuItem>)}
              </Select>
            </SettingRow>
          </Section>
        </Stack>

        {/* ── Preview ── */}
        <Box sx={{ position: { lg: "sticky" }, top: { lg: 64 }, minWidth: 0 }}>
          <Section title="KOT preview" subtitle="Sample ticket in the layout the kitchen receives">
            <Stack direction="row" spacing={1} sx={{ py: 1.5, flexWrap: "wrap", rowGap: 1 }}>
              <ToggleButtonGroup exclusive size="small" value={previewType} onChange={(_, v) => v && setPreviewType(v)}
                sx={{ "& .MuiToggleButton-root": { textTransform: "none", fontWeight: 700, fontSize: 12, px: 1.25 }, "& .Mui-selected": { color: `${redTint} !important`, bgcolor: "#fdecef !important" } }}>
                <ToggleButton value="Dine-In">Dine-In</ToggleButton>
                <ToggleButton value="Takeaway">Pick Up</ToggleButton>
                <ToggleButton value="Delivery">Delivery</ToggleButton>
              </ToggleButtonGroup>
              <ToggleButtonGroup exclusive size="small" value={previewPaper} onChange={(_, v) => v && setPreviewPaper(v)}
                sx={{ "& .MuiToggleButton-root": { textTransform: "none", fontWeight: 700, fontSize: 12, px: 1.25 }, "& .Mui-selected": { color: `${redTint} !important`, bgcolor: "#fdecef !important" } }}>
                <ToggleButton value="2">2"</ToggleButton>
                <ToggleButton value="3">3"</ToggleButton>
                <ToggleButton value="5">5"</ToggleButton>
              </ToggleButtonGroup>
            </Stack>
            <Box sx={{ pb: 2.5, bgcolor: "#f4f5f8", mx: { xs: -2, md: -2.5 }, px: 2, pt: 2 }}>
              <KotSlipPreview slip={previewSlip} />
            </Box>
          </Section>
        </Box>
      </Box>

      <PrinterDialog
        open={printerDialog.open}
        initial={printerDialog.printer}
        draft={printerDialog.draft}
        onClose={() => setPrinterDialog({ open: false, printer: null })}
        saving={savePrinter.isPending}
        apiError={printerError}
        onSave={(p) => {
          setPrinterError("");
          savePrinter.mutate(p, {
            onSuccess: () => { setPrinterDialog({ open: false, printer: null }); setSuccessMsg(p.id ? "Printer saved" : "Printer added"); },
            onError: (err) => setPrinterError(extractErrorMessage(err, "Unable to save printer")),
          });
        }}
      />

      <DetectPrintersDialog open={detectOpen} existing={printers} onClose={() => setDetectOpen(false)} onPick={addDetected} />

      <SuccessToast message={successMsg} onClose={() => setSuccessMsg("")} />
      <SuccessToast message={errorMsg} severity="error" onClose={() => setErrorMsg("")} />
    </Box>
  );
}
