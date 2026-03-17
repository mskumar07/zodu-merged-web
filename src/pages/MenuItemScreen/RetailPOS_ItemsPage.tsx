// ============================================================
// RetailPOS – Items/Products Page
// Material UI · TypeScript · Separation of Concerns
//
// File structure (each section is its own module in a real project):
//   types/index.ts          → shared TypeScript interfaces
//   data/products.ts        → static product data
//   hooks/useProducts.ts    → filtering & search logic
//   theme.ts                → MUI theme config
//   components/
//     TopNav.tsx            → sticky app bar
//     PageHeader.tsx        → title + CTA button
//     ProductTabs.tsx       → All / Sellable / Raw tabs
//     FilterBar.tsx         → search input + filter buttons
//     ProductTable.tsx      → scrollable data table
//   App.tsx                 → root component (composition)
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  InputAdornment,
  TextField,
  Box,
  Avatar,
  Button,
  Paper,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Tooltip,
  Container,
  useTheme,
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// ─────────────────────────────────────────────────────────────
// TYPES  (types/index.ts)
// ─────────────────────────────────────────────────────────────
type ItemType = 'Sellable Product' | 'Raw Material';
type TaxInclusion = 'Incl.' | 'Excl.';
type TabValue = 'all' | 'sellable' | 'raw';

interface Product {
  id: string;
  name: string;
  category: string;
  itemType: ItemType;
  mrp: number;
  rate: number;
  taxType: string;
  inclusion: TaxInclusion;
  hsn: string;
  imageUrl?: string;
}

// ─────────────────────────────────────────────────────────────
// DATA  (data/products.ts)
// ─────────────────────────────────────────────────────────────
const ALL_PRODUCTS: Product[] = [
  { id: 'PRD-001', name: 'Premium Cotton Polo', category: 'Apparel', itemType: 'Sellable Product', mrp: 1499, rate: 1199, taxType: 'GST 12%', inclusion: 'Incl.', hsn: '6105', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAN6vbqnwg9vInV_CZCwk7Kw-c9_sUrzxxaJiY7vk75nIIVOKjtp54YXDLgh8J3_Po4MgvhyJTuAqigHyxNmIQy_xzP6xHBJIYvd-eU2QLOpIkcBXQj7AwOvKaO2hFLCmi-MlQYc07oo-gcRSpwLHDWPn6KwobkmNg1CBpgANM3SQzYg9iN96FomV3EYjb8zTyhIgVVep8xeVUh93e7qRIspnAqzesnj9HPm8Qo7Qo5vqca6PAkN4L0v9T29XQ6gxBZ6nFGPSAdIWk6' },
  { id: 'SRV-042', name: 'Standard Tailoring', category: 'Maintenance', itemType: 'Sellable Product', mrp: 500, rate: 450, taxType: 'GST 18%', inclusion: 'Excl.', hsn: '9988', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqChP2minNxRQzty84J0Zsyd3yysWvM4PS9EivumLOM5uLcO4hr0XgJdRbcFAoHabN4Tcycb_Gropa2XWYwVCSJgWDeAy7e-iMgEa0a88FeRVFfz7iEN9j8FzwAW1XBnW-qaBd_P38pYcg_OiUCw9NhvzMI3co8pNMuSqwDXY09WotF605bq5aAAMbms58Tu2ENE4_ZR6WjmoRASpEjdPgtCTdfIzCEq6LXtuzP-JBgKLK3CwszJnWkZKQs73x2l1RYV-PwbTADWri' },
  { id: 'PRD-089', name: 'Classic Oxfords', category: 'Footwear', itemType: 'Raw Material', mrp: 3999, rate: 3499, taxType: 'GST 18%', inclusion: 'Incl.', hsn: '6403', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqtVGKDIb3hHLrcKTI1_Ow63Ip17IqkPJIJJOF054pXKwVh4CkVhLPVuHdCs4TyBz1DqKS1K-eEnwNHEIklevJcCOI3cwWBk2SzraKz3_YbJXTAG8fAWPWqbj7t_wIXfXYnavwBWZVXEgl9RPZWNKDfizOvfwdj6ZIUyBvY3z5zvDuXGvr2jbEqyhRnhxxVHL7tIvz3LNaf2d-SXUzPS_MokUGiVUDJ4wPzcAk5Tk1bwxPZ67R6wMVkXb-QY5nmE1Iv2NCGcvp38bP' },
  { id: 'PRD-004', name: 'Linen Summer Shirt', category: 'Apparel', itemType: 'Sellable Product', mrp: 2299, rate: 1899, taxType: 'GST 12%', inclusion: 'Incl.', hsn: '6205' },
  { id: 'PRD-005', name: 'Slim Fit Chinos', category: 'Apparel', itemType: 'Sellable Product', mrp: 1899, rate: 1599, taxType: 'GST 12%', inclusion: 'Incl.', hsn: '6203' },
  { id: 'RAW-001', name: 'Silk Thread Spool', category: 'Textiles', itemType: 'Raw Material', mrp: 120, rate: 100, taxType: 'GST 5%', inclusion: 'Excl.', hsn: '5004' },
  { id: 'PRD-007', name: 'Designer Denim Jacket', category: 'Apparel', itemType: 'Sellable Product', mrp: 4499, rate: 3999, taxType: 'GST 12%', inclusion: 'Incl.', hsn: '6201' },
  { id: 'PRD-008', name: 'Woven Leather Belt', category: 'Accessories', itemType: 'Sellable Product', mrp: 999, rate: 799, taxType: 'GST 18%', inclusion: 'Incl.', hsn: '4203' },
  { id: 'SRV-002', name: 'Express Alteration', category: 'Service', itemType: 'Sellable Product', mrp: 300, rate: 250, taxType: 'GST 18%', inclusion: 'Excl.', hsn: '9988' },
  { id: 'PRD-010', name: 'Woolen Scarf', category: 'Accessories', itemType: 'Sellable Product', mrp: 750, rate: 599, taxType: 'GST 5%', inclusion: 'Incl.', hsn: '6214' },
  { id: 'RAW-002', name: 'Metal Buttons (Set)', category: 'Hardware', itemType: 'Raw Material', mrp: 45, rate: 35, taxType: 'GST 18%', inclusion: 'Excl.', hsn: '9606' },
  { id: 'PRD-012', name: 'Cargo Shorts', category: 'Apparel', itemType: 'Sellable Product', mrp: 1299, rate: 999, taxType: 'GST 12%', inclusion: 'Incl.', hsn: '6204' },
  { id: 'PRD-013', name: 'Graphic Tee', category: 'Apparel', itemType: 'Sellable Product', mrp: 699, rate: 499, taxType: 'GST 5%', inclusion: 'Incl.', hsn: '6109' },
  { id: 'RAW-003', name: 'Cotton Fabric Roll', category: 'Textiles', itemType: 'Raw Material', mrp: 5000, rate: 4200, taxType: 'GST 5%', inclusion: 'Excl.', hsn: '5208' },
  { id: 'PRD-015', name: 'Silk Necktie', category: 'Accessories', itemType: 'Sellable Product', mrp: 1150, rate: 899, taxType: 'GST 12%', inclusion: 'Incl.', hsn: '6215' },
  { id: 'PRD-016', name: 'Oxford Button-Down', category: 'Apparel', itemType: 'Sellable Product', mrp: 2499, rate: 2099, taxType: 'GST 12%', inclusion: 'Incl.', hsn: '6205' },
  { id: 'PRD-017', name: 'Canvas Tote Bag', category: 'Accessories', itemType: 'Sellable Product', mrp: 499, rate: 399, taxType: 'GST 18%', inclusion: 'Incl.', hsn: '4202' },
  { id: 'RAW-004', name: 'Zipper Pack (10pcs)', category: 'Hardware', itemType: 'Raw Material', mrp: 80, rate: 60, taxType: 'GST 18%', inclusion: 'Excl.', hsn: '9607' },
];

// ─────────────────────────────────────────────────────────────
// THEME  (theme.ts)
// ─────────────────────────────────────────────────────────────
const appTheme = createTheme({
  palette: {
    primary: { main: '#D2122E', light: '#e84460', dark: '#a50e24', contrastText: '#fff' },
    background: { default: '#f8f6f6', paper: '#ffffff' },
    divider: '#e2e8f0',
    text: { primary: '#0f172a', secondary: '#64748b', disabled: '#94a3b8' },
  },
  typography: {
    fontFamily: '"Public Sans", "Segoe UI", sans-serif',
    h4: { fontWeight: 900, letterSpacing: '-0.5px' },
    h6: { fontWeight: 900 },
  },
  shape: { borderRadius: 4 },
  components: {
    MuiAppBar: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiTableCell: { styleOverrides: { root: { borderBottom: '1px solid #f1f5f9' } } },
  },
});

// ─────────────────────────────────────────────────────────────
// HOOK  (hooks/useProducts.ts)
// ─────────────────────────────────────────────────────────────
function useProducts() {
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    let result = ALL_PRODUCTS;
    if (activeTab === 'sellable') result = result.filter(p => p.itemType === 'Sellable Product');
    else if (activeTab === 'raw') result = result.filter(p => p.itemType === 'Raw Material');
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.hsn.includes(q) ||
        p.id.toLowerCase().includes(q)
      );
    }
    return result;
  }, [activeTab, searchQuery]);

  return { activeTab, setActiveTab, searchQuery, setSearchQuery, filteredProducts };
}

// ─────────────────────────────────────────────────────────────
// COMPONENT: TopNav  (components/TopNav.tsx)
// ─────────────────────────────────────────────────────────────
const NAV_LINKS = ['Dashboard', 'Inventory', 'Sales', 'Reports'];

const TopNav: React.FC = () => {
  const theme = useTheme();
  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: `1px solid ${theme.palette.divider}`, zIndex: theme.zIndex.appBar }}>
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 5 }, minHeight: 64 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
            <StorefrontIcon sx={{ fontSize: 28, fontWeight: 700 }} />
            <Typography variant="h6" fontWeight={900} letterSpacing="-0.5px" sx={{ color: 'text.primary' }}>RetailPOS</Typography>
          </Box>
          <Box sx={{ display: { xs: 'none', lg: 'flex' }, gap: 3, ml: 2 }}>
            {NAV_LINKS.map(link => (
              <Typography key={link} component="a" href="#" variant="body2" fontWeight={link === 'Inventory' ? 700 : 600}
                sx={{ color: link === 'Inventory' ? 'primary.main' : 'text.secondary', textDecoration: 'none', borderBottom: '2px solid', borderColor: link === 'Inventory' ? 'primary.main' : 'transparent', pb: 0.3, '&:hover': { color: 'primary.main' }, transition: 'color 0.2s' }}>
                {link}
              </Typography>
            ))}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField size="small" placeholder="Search menu..." sx={{ display: { xs: 'none', sm: 'block' }, width: 200 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} /></InputAdornment>, sx: { borderRadius: 3, bgcolor: 'action.hover', fontSize: 13, '& fieldset': { border: 'none' } } }} />
          <IconButton size="small"><NotificationsIcon sx={{ color: 'text.secondary' }} /></IconButton>
          <Avatar src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKx6ge7ri3C3fuGt89xcLUdZStqe2N9dGfHLvCaHzSQq8qmKNWwmjkUc0NT4OJGQuH7Z4ulGeHH_1oGNAAKgqv-PEE1T2ecCa0tLdq-PYt5vjyrjNFHtJViHLkfzCADOTUmY7pYvry_YeAqbP58RzCbYV4ZCWwfMVcc61gRNhQ1473NWdx6GF3zRiu0ThOfCbf5vLoWTEmAt5Gw1F750pfXqO3VnexHvVFcPGiOicxvoi8h3GkW5Ctz7b7VVldScb6hm5HNVILM5pl" sx={{ width: 36, height: 36, border: '2px solid', borderColor: 'primary.light' }} />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

// ─────────────────────────────────────────────────────────────
// COMPONENT: PageHeader  (components/PageHeader.tsx)
// ─────────────────────────────────────────────────────────────
const PageHeader: React.FC = () => (
  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, mb: 4 }}>
    <Box>
      <Typography variant="h4" fontWeight={900} letterSpacing="-0.5px" color="text.primary">Items/Products</Typography>
      <Typography variant="body2" color="text.secondary" mt={0.5}>Configure your product catalog, pricing structures, and taxation.</Typography>
    </Box>
    <Button variant="contained" startIcon={<AddCircleIcon />}
      sx={{ borderRadius: 3, fontWeight: 700, px: 3, py: 1.2, boxShadow: '0 4px 14px rgba(210,18,46,0.25)', textTransform: 'none', fontSize: 14, whiteSpace: 'nowrap', '&:hover': { boxShadow: '0 6px 18px rgba(210,18,46,0.35)' } }}>
      Add New Item
    </Button>
  </Box>
);

// ─────────────────────────────────────────────────────────────
// COMPONENT: ProductTabs  (components/ProductTabs.tsx)
// ─────────────────────────────────────────────────────────────
interface ProductTabsProps { value: TabValue; onChange: (v: TabValue) => void; }

const TAB_CONFIG: { label: string; value: TabValue }[] = [
  { label: 'All Items', value: 'all' },
  { label: 'Sellable Products', value: 'sellable' },
  { label: 'Raw Materials', value: 'raw' },
];

const ProductTabs: React.FC<ProductTabsProps> = ({ value, onChange }) => {
  const theme = useTheme();
  return (
    <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}`, mb: 3 }}>
      <Tabs value={value} onChange={(_e, v) => onChange(v as TabValue)} textColor="primary" indicatorColor="primary"
        sx={{ minHeight: 48, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: 14, minHeight: 48, px: 3, color: 'text.secondary', '&.Mui-selected': { fontWeight: 700, color: 'primary.main' } }, '& .MuiTabs-indicator': { height: 2 } }}>
        {TAB_CONFIG.map(tab => <Tab key={tab.value} label={tab.label} value={tab.value} disableRipple />)}
      </Tabs>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────
// COMPONENT: FilterBar  (components/FilterBar.tsx)
// ─────────────────────────────────────────────────────────────
interface FilterBarProps { searchQuery: string; onSearchChange: (q: string) => void; }

const FilterBar: React.FC<FilterBarProps> = ({ searchQuery, onSearchChange }) => {
  const theme = useTheme();
  const btnSx = { borderRadius: 2, px: 2.5, fontWeight: 600, textTransform: 'none' as const, bgcolor: 'action.hover', color: 'text.primary', '&:hover': { bgcolor: 'action.selected' }, fontSize: 13, whiteSpace: 'nowrap' as const };
  return (
    <Paper elevation={0} variant="outlined" sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 2 }}>
        <TextField fullWidth size="medium" placeholder="Search by item name, category, or HSN code..." value={searchQuery} onChange={e => onSearchChange(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.disabled' }} /></InputAdornment>, sx: { borderRadius: 3, bgcolor: 'action.hover', '& fieldset': { border: 'none' }, fontSize: 14 } }} />
        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
          <Button variant="text" startIcon={<FilterListIcon />} sx={btnSx}>Filters</Button>
          <Button variant="text" startIcon={<FileDownloadIcon />} sx={btnSx}>Export</Button>
        </Box>
      </Box>
    </Paper>
  );
};

// ─────────────────────────────────────────────────────────────
// COMPONENT: ProductTable  (components/ProductTable.tsx)
// ─────────────────────────────────────────────────────────────
const formatINR = (v: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(v);

const HEADERS = [
  { label: 'Image', align: 'left' as const },
  { label: 'Item ID', align: 'left' as const },
  { label: 'Item Name', align: 'left' as const },
  { label: 'Item Type', align: 'left' as const },
  { label: 'MRP', align: 'right' as const },
  { label: 'Rate', align: 'right' as const },
  { label: 'Tax Type', align: 'left' as const },
  { label: 'Inclusion', align: 'left' as const },
  { label: 'HSN', align: 'left' as const },
  { label: 'Actions', align: 'center' as const },
];

interface ProductTableProps { products: Product[]; }

const ProductTable: React.FC<ProductTableProps> = ({ products }) => {
  const theme = useTheme();
  const stickyR = { position: 'sticky' as const, right: 0, zIndex: 1, boxShadow: '-6px 0 12px -4px rgba(0,0,0,0.07)' };

  return (
    <Paper elevation={0} variant="outlined" sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: 680 }}>
      <Box sx={{ overflowX: 'auto', overflowY: 'auto', flex: 1, '&::-webkit-scrollbar': { width: 6, height: 6 }, '&::-webkit-scrollbar-track': { background: 'transparent' }, '&::-webkit-scrollbar-thumb': { background: theme.palette.divider, borderRadius: 10 } }}>
        <Table stickyHeader size="small" sx={{ minWidth: 960 }}>
          <TableHead>
            <TableRow>
              {HEADERS.map(col => (
                <TableCell key={col.label} align={col.align}
                  sx={{ py: 1.8, px: 2, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary', bgcolor: '#f8fafc', whiteSpace: 'nowrap', borderBottom: `1px solid ${theme.palette.divider}`, ...(col.label === 'Actions' ? stickyR : {}) }}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary" variant="body2">No items match your search.</Typography>
                </TableCell>
              </TableRow>
            ) : products.map(p => (
              <TableRow key={p.id} hover sx={{ '&:last-child td': { border: 0 }, transition: 'background 0.15s' }}>
                {/* Image */}
                <TableCell sx={{ px: 2, py: 1.5 }}>
                  <Avatar src={p.imageUrl} variant="rounded" sx={{ width: 46, height: 46, border: `1px solid ${theme.palette.divider}`, fontSize: 16 }}>
                    {p.name[0]}
                  </Avatar>
                </TableCell>

                {/* ID */}
                <TableCell sx={{ px: 2 }}>
                  <Typography variant="body2" fontFamily="monospace" fontWeight={500} color="text.secondary">{p.id}</Typography>
                </TableCell>

                {/* Name + Category */}
                <TableCell sx={{ px: 2, minWidth: 180 }}>
                  <Typography variant="body2" fontWeight={700} color="text.primary">{p.name}</Typography>
                  <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.disabled' }}>{p.category}</Typography>
                </TableCell>

                {/* Item Type */}
                <TableCell sx={{ px: 2 }}>
                  <Chip label={p.itemType} size="small"
                    sx={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', height: 22, bgcolor: p.itemType === 'Sellable Product' ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)', color: p.itemType === 'Sellable Product' ? '#2563eb' : '#b45309', border: 'none' }} />
                </TableCell>

                {/* MRP */}
                <TableCell align="right" sx={{ px: 2 }}>
                  <Typography variant="body2" fontWeight={600} color="text.secondary">{formatINR(p.mrp)}</Typography>
                </TableCell>

                {/* Rate */}
                <TableCell align="right" sx={{ px: 2 }}>
                  <Typography variant="body2" fontWeight={700} color="primary.main">{formatINR(p.rate)}</Typography>
                </TableCell>

                {/* Tax Type */}
                <TableCell sx={{ px: 2 }}>
                  <Box component="span" sx={{ fontSize: 11, fontWeight: 700, px: 1, py: 0.4, bgcolor: 'action.selected', borderRadius: 1, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                    {p.taxType}
                  </Box>
                </TableCell>

                {/* Inclusion */}
                <TableCell sx={{ px: 2 }}>
                  <Typography variant="caption" fontWeight={600} sx={{ textTransform: 'uppercase', color: 'text.secondary' }}>{p.inclusion}</Typography>
                </TableCell>

                {/* HSN */}
                <TableCell sx={{ px: 2 }}>
                  <Typography variant="body2" fontFamily="monospace" color="text.secondary">{p.hsn}</Typography>
                </TableCell>

                {/* Actions */}
                <TableCell align="center" sx={{ px: 2, bgcolor: 'background.paper', ...stickyR }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                    <Tooltip title="Edit">
                      <IconButton size="small" sx={{ color: 'text.disabled', '&:hover': { color: 'primary.main', bgcolor: 'rgba(210,18,46,0.08)' }, borderRadius: 1.5 }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" sx={{ color: 'primary.main', '&:hover': { bgcolor: 'rgba(210,18,46,0.08)' }, borderRadius: 1.5 }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      {/* Footer count */}
      <Box sx={{ px: 3, py: 1.5, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: '#fafafa', display: 'flex', alignItems: 'center' }}>
        <Typography variant="caption" color="text.disabled" fontWeight={600}>
          Showing {products.length} of {ALL_PRODUCTS.length} items
        </Typography>
      </Box>
    </Paper>
  );
};

// ─────────────────────────────────────────────────────────────
// ROOT  (App.tsx)
// ─────────────────────────────────────────────────────────────
const App: React.FC = () => {
  const { activeTab, setActiveTab, searchQuery, setSearchQuery, filteredProducts } = useProducts();

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
        <TopNav />
        <Container maxWidth="xl" sx={{ flex: 1, display: 'flex', flexDirection: 'column', py: 4 }}>
          <PageHeader />
          <ProductTabs value={activeTab} onChange={setActiveTab} />
          <FilterBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
          <ProductTable products={filteredProducts} />
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default App;
