import React, { useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  QrCode2 as QrCode2Icon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  Payments as PaymentsIcon,
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import DataTable, { type ColumnDef } from '@utils/DataTable';
import AdjustStockModal from './AdjustStockModal';

const theme = createTheme({
  palette: {
    primary: { main: '#D2042D' },
    background: { default: '#f5f5f5', paper: '#ffffff' },
    success: { main: '#10b981' },
    error: { main: '#D2042D' },
  },
  typography: {
    fontFamily: '"Poppins", sans-serif',
  },
  shape: { borderRadius: 6 },
});

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  image: string;
  supplier: string;
  stock: number;
  unit: string;
  lowLevel: number;
  status: 'In Stock' | 'Low Stock' | 'Out Stock';
  price: number;
  value: number;
  lastRestock: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: string;
}

const STAT_CARDS_DATA = [
  {
    title: 'Total Stock Value',
    value: '$245,850.00',
    icon: <PaymentsIcon sx={{ color: '#D2042D', fontSize: 16 }} />,
    trend: '+2.4% vs last month',
  },
  {
    title: 'Low Stock Items',
    value: 12,
    icon: <WarningIcon sx={{ color: '#D2042D', fontSize: 16 }} />,
    subtitle: 'Items below reorder level',
  },
  {
    title: 'Out of Stock',
    value: 4,
    icon: <ErrorIcon sx={{ color: '#D2042D', fontSize: 16 }} />,
    subtitle: 'Immediate action required',
  },
  {
    title: 'Total SKUs',
    value: '1,240',
    icon: <QrCode2Icon sx={{ color: '#D2042D', fontSize: 16 }} />,
    subtitle: 'Active items in catalog',
  },
];

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, subtitle, trend }) => (
  <Grid item sx={{ minWidth: 240, flex: '0 0 240px' }}>
    <Card
      elevation={0}
      sx={{
        border: '1px solid #e5e7eb',
        borderRadius: 2,
        bgcolor: 'white',
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
      }}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 0.5 }}>
          {icon}
          <Typography variant="body2" color="text.secondary" fontWeight={500} fontSize="0.75rem">
            {title}
          </Typography>
        </Box>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5, fontSize: '1.5rem' }}>
          {value}
        </Typography>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TrendingUpIcon sx={{ fontSize: 14, color: '#10b981' }} />
            <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 500, fontSize: '0.7rem' }}>
              {trend}
            </Typography>
          </Box>
        )}
        {subtitle && (
          <Typography variant="caption" color="text.secondary" fontSize="0.7rem" fontStyle="italic">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  </Grid>
);

const STATUS_CONFIG = {
  'In Stock': { color: '#10b981', dotColor: '#10b981' },
  'Low Stock': { color: '#f59e0b', dotColor: '#f59e0b' },
  'Out Stock': { color: '#D2042D', dotColor: '#D2042D' },
};

const StatusBadge: React.FC<{ status: InventoryItem['status'] }> = ({ status }) => {
  const { color, dotColor } = STATUS_CONFIG[status];
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dotColor }} />
      <Typography variant="body2" fontWeight={600} fontSize="0.8rem" sx={{ color }}>
        {status}
      </Typography>
    </Box>
  );
};

const InventoryManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryAnchor, setCategoryAnchor] = useState<null | HTMLElement>(null);
  const [supplierAnchor, setSupplierAnchor] = useState<null | HTMLElement>(null);
  const [adjustStockModal, setAdjustStockModal] = useState<{ open: boolean; item: InventoryItem | null }>({
    open: false,
    item: null,
  });

  const inventoryData: InventoryItem[] = useMemo(
    () => [
      {
        id: 'INV001',
        name: 'Arabica Coffee Beans',
        description: 'Dark Roast, 1kg',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuB-PK4fq3Xm5lglegeOI_eXABdl_cWw9BhCvJGndbmSX3q0fiPxJKuvWd1IOGJChHYCOa5-0rgPTktlc6LzCWgxBgk4u3tGfSIQxUeuDARDmaooSAWSZ0vGTTIoXMAEWZ_Ombsvt_37JQjJn6lTzq-Yg-04_Cgm_AQfWZIqbWoajPy53uCKkh1fUrJLVEHAz0KaTQXNXxLYEs4nvnUJtCGNBXgQ-feikPH7LDgJ7ah7oSkiVRc3vWIoCwdR0jXXeGRj8epdijAXfgh4',
        supplier: 'Global Imports',
        stock: 85,
        unit: 'Kg',
        lowLevel: 50,
        status: 'In Stock',
        price: 15.0,
        value: 1275.0,
        lastRestock: 'Oct 12, 2023',
      },
      {
        id: 'INV002',
        name: 'Whole Milk',
        description: 'Pasteurized, 1L',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuScXqQekV8v0bZHHxN_H_aNUCrsNZHsh_sgNWvj24o_QIssRhfz52LYFieJy9pGE-3ji1czl684cFZLBtMjV0hdq_cYlGOSdFws7rgySiegO3pQKKHCtcHkSHEH5Qfv3szXfavs47YfQ5-ZSk1oDFKZUWOEJo12hYfuqPvhO05h0OUGqNAA38Sz-D4cJfuds1do0tGuUJTujJb_M-E6MG8khqlYyKXAbqvoPlHUIxdBKMDJX5A03UsBpJQwPFP4PZyR6jJQ1aOwkXO',
        supplier: 'Local Farm',
        stock: 8,
        unit: 'Pcs',
        lowLevel: 20,
        status: 'Low Stock',
        price: 1.2,
        value: 9.6,
        lastRestock: 'Oct 14, 2023',
      },
      {
        id: 'INV003',
        name: 'Sourdough Loaf',
        description: 'Artisan, 500g',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDhevn93jHSQHULPPZ3omdWWggHu3srwAQJvKwVnWtt4WYn_Ld63y9vhoZm4aW15-tanE-cUX0YW4xjrcu0sCeyoQ_xfR072Bu_Mh76X2_LWKr1GkctpESOQJuXWdPAvFZpP-N2DETfnwrE-oEwGe2VDV8JLypQyRS6gBgMULZu9-NtVvPUrGG4W4SvAyZXrqwtVn5b8Ic0NBzFc8VzRtXQXvuWQZdY5acd8HYhtoCWDFqyNp08pylsunTlvgGCFW8vCVkL-eVvlxBf',
        supplier: 'In-house',
        stock: 0,
        unit: 'Pcs',
        lowLevel: 15,
        status: 'Out Stock',
        price: 4.5,
        value: 0.0,
        lastRestock: 'Oct 10, 2023',
      },
      {
        id: 'INV004',
        name: 'Cheddar Cheese',
        description: 'Aged, 250g',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuC86Kdkg6jy5K3TamaxfoiDh5GFkMIamBoLGYGSqdKhSqJ5HZWQua1xnAEQ2MGYQb2tKSi0qZtK_uAfdZtwpp9Qkvq0iQ6gnqjmFV3Sidb1zJkQ5m_XbHfh9Rjrf8jhgOO_nQzb7K8VoXkQCfgmuQjEr6iLn0Vsi7vsbNeILYZmKQ_2rP9MekF5fEumapN6a5EylpwiJBEG6pqvJSONAdXo84vGlBVzo9FRgJiGyni_vqu1g2lwCoWZYSlNrKaRrL_zfs5LBHFVouWC',
        supplier: 'Dairy Coop',
        stock: 45,
        unit: 'Pcs',
        lowLevel: 20,
        status: 'In Stock',
        price: 4.2,
        value: 189.0,
        lastRestock: 'Oct 15, 2023',
      },
      {
        id: 'INV005',
        name: 'English Tea',
        description: '50 Tea Bags',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAX-PVFafpnTtxPk88mXfA3wg8GWAHYVPwN5OQsIGl_g6dT1vmlL-nSzSpdm84QpGd-wfq0wQyPxd2W0ciaWQbpH7JnvvG6FWBdLYhpbpN9TzXwh-2Y5urWh1GryUnfanuxXMDzf06DiiDcPlJquyqA9fm9cLUEWZ594Aq_Bv2Me-AUI2qi2ekbx-iHGDFp_5oVE45KoLtxy7WoUhi7AjK6I1RlRthwbR-eSWcDEBh974_lySvWLiEsHmip9-WbCThoocir_K1bfJIP',
        supplier: 'Tea Traders',
        stock: 120,
        unit: 'Pcs',
        lowLevel: 30,
        status: 'In Stock',
        price: 6.5,
        value: 780.0,
        lastRestock: 'Sep 20, 2023',
      },
      {
        id: 'INV006',
        name: 'Organic Honey',
        description: 'Wildflower, 500g',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCeCelSmFcdd7wLWaTDPw46wXdCd1cfIjM-SLEvaP5oe8sAKpV7Cox9Q4oGJni147s_ri5xsZRF8wiv9WTuFRdxF6I98WjK9cukHIuQrsExgXI9zXqTPq7JL53sSzyzX8CtqnlccBi1JXp2hUaA_-onLKlQWP9Ces6ZgTFlxSo9uvkQRjqOt5yyr7x7xyEwychko4wXxrrbxwOE6khSGY486Mx2cy87v9Ay2HuryB6GrpSWiJ2w3XGYF990bFZwG3TOf5sHxIOztz35',
        supplier: 'Apiary Direct',
        stock: 12,
        unit: 'Pcs',
        lowLevel: 25,
        status: 'Low Stock',
        price: 12.9,
        value: 154.8,
        lastRestock: 'Oct 05, 2023',
      },
      {
        id: 'INV007',
        name: 'Paper Napkins',
        description: '2-Ply, White, 100pk',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCl0lxvIwGytYS7simFNzjf1blO9jD6aMk2WA6He3atpVPf8z9-e1Zq8A4fjQ0Cs90m5Ol84kHWsqTqxrKC2k-SVDGjCS1aDUWa6XEJ_0K9n5gBv63J-NGy6eS8wl0dwoOWN-2bPa43DUTy_3zIF_mtEHG0PTYwXIi9pVAbBSdRuIr1jjSUYBJTtOf8v3kMril0RoFc2QA8YIIzRuyjEzdzW_UbGS-xs_--aPVNLv_xrI0K0LajQZUsP0S7aqQ0SAtxFePu6rhSLIGf',
        supplier: 'EcoPack Ltd',
        stock: 450,
        unit: 'Pcs',
        lowLevel: 100,
        status: 'In Stock',
        price: 1.5,
        value: 675.0,
        lastRestock: 'Oct 18, 2023',
      },
      {
        id: 'INV008',
        name: 'Espresso Pods',
        description: 'Intensity 9, 10pk',
        image: 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=80&h=80&fit=crop',
        supplier: 'Global Imports',
        stock: 3,
        unit: 'Pcs',
        lowLevel: 20,
        status: 'Low Stock',
        price: 8.9,
        value: 26.7,
        lastRestock: 'Oct 01, 2023',
      },
      {
        id: 'INV009',
        name: 'Oat Milk',
        description: 'Barista Edition, 1L',
        image: 'https://images.unsplash.com/photo-1600718374662-0483d2b9da44?w=80&h=80&fit=crop',
        supplier: 'Local Farm',
        stock: 0,
        unit: 'Pcs',
        lowLevel: 18,
        status: 'Out Stock',
        price: 2.4,
        value: 0.0,
        lastRestock: 'Sep 28, 2023',
      },
      {
        id: 'INV010',
        name: 'Croissants',
        description: 'Butter, Fresh Daily',
        image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=80&h=80&fit=crop',
        supplier: 'In-house',
        stock: 34,
        unit: 'Pcs',
        lowLevel: 20,
        status: 'In Stock',
        price: 2.8,
        value: 95.2,
        lastRestock: 'Oct 19, 2023',
      },
      {
        id: 'INV011',
        name: 'Granulated Sugar',
        description: 'White, 1kg',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&h=80&fit=crop',
        supplier: 'Bulk Supplies Co',
        stock: 200,
        unit: 'Kg',
        lowLevel: 50,
        status: 'In Stock',
        price: 0.9,
        value: 180.0,
        lastRestock: 'Oct 08, 2023',
      },
      {
        id: 'INV012',
        name: 'Vanilla Syrup',
        description: 'Monin, 700ml',
        image: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=80&h=80&fit=crop',
        supplier: 'Beverage Dist.',
        stock: 7,
        unit: 'Btl',
        lowLevel: 15,
        status: 'Low Stock',
        price: 11.5,
        value: 80.5,
        lastRestock: 'Sep 30, 2023',
      },
      {
        id: 'INV013',
        name: 'Disposable Cups',
        description: '12oz, 50pk',
        image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=80&h=80&fit=crop',
        supplier: 'EcoPack Ltd',
        stock: 320,
        unit: 'Pcs',
        lowLevel: 100,
        status: 'In Stock',
        price: 5.0,
        value: 1600.0,
        lastRestock: 'Oct 16, 2023',
      },
    ],
    []
  );

  const filteredData = useMemo(
    () =>
      inventoryData.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.supplier.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [inventoryData, searchQuery]
  );

  const handleOpenAdjustStock = (item: InventoryItem) => {
    setAdjustStockModal({ open: true, item });
  };

  const handleCloseAdjustStock = () => {
    setAdjustStockModal({ open: false, item: null });
  };

  const columns = useMemo<ColumnDef<InventoryItem>[]>(
    () => [
      {
        key: 'id',
        label: 'Item ID',
        width: 100,
        render: (item) => (
          <Typography variant="body2" fontWeight={500} sx={{ color: '#1976d2' }}>
            {item.id}
          </Typography>
        ),
      },
      {
        key: 'name',
        label: 'Item Name',
        minWidth: 260,
        render: (item) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar src={item.image} variant="rounded" sx={{ width: 40, height: 40, borderRadius: 1.5 }} />
            <Box>
              <Typography variant="body2" fontWeight={500}>
                {item.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                {item.description}
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        key: 'supplier',
        label: 'Supplier',
        width: 140,
        render: (item) => (
          <Typography variant="body2" color="text.secondary">
            {item.supplier}
          </Typography>
        ),
      },
      {
        key: 'stock',
        label: 'Stock',
        width: 110,
        render: (item) => (
          <Typography
            variant="body2"
            fontWeight={500}
            sx={{
              color:
                item.status === 'Out Stock'
                  ? '#9ca3af'
                  : item.status === 'Low Stock'
                    ? '#f59e0b'
                    : '#111827',
            }}
          >
            {item.stock} {item.unit}
          </Typography>
        ),
      },
      {
        key: 'lowLevel',
        label: 'Low Level',
        width: 110,
        render: (item) => (
          <Typography variant="body2" color="text.secondary">
            {item.lowLevel} {item.unit}
          </Typography>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        width: 120,
        render: (item) => <StatusBadge status={item.status} />,
      },
      {
        key: 'price',
        label: 'Price',
        width: 100,
        align: 'right',
        render: (item) => (
          <Typography variant="body2" color="text.primary">
            ${item.price.toFixed(2)}
          </Typography>
        ),
      },
      {
        key: 'value',
        label: 'Value',
        width: 110,
        align: 'right',
        render: (item) => (
          <Typography
            variant="body2"
            fontWeight={500}
            sx={{ color: item.value === 0 ? '#9ca3af' : 'text.primary' }}
          >
            ${item.value.toFixed(2)}
          </Typography>
        ),
      },
      {
        key: 'lastRestock',
        label: 'Last Restock',
        width: 140,
        render: (item) => (
          <Typography variant="body2" color="text.secondary">
            {item.lastRestock}
          </Typography>
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        width: 150,
        align: 'right',
        render: (item) => (
          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
            <IconButton size="small" sx={{ color: '#6b7280', '&:hover': { color: '#D2042D' } }}>
              <EditIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleOpenAdjustStock(item)}
              sx={{
                minWidth: 90,
                height: 28,
                fontSize: '0.7rem',
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#e5e7eb',
                color: '#D2042D',
                '&:hover': { borderColor: '#D2042D', bgcolor: '#fef2f2' },
              }}
            >
              Adjust Stock
            </Button>
          </Box>
        ),
      },
    ],
    []
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: '#fafafa', height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            px: { xs: 2, md: 1 },
            py: { xs: 2, md: 1 },
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ position: 'sticky', top: 0, zIndex: 2, bgcolor: '#fafafa', pb: 2 }}>
            <Grid
              container
              spacing={1.5}
              wrap="nowrap"
              sx={{
                mb: 2,
                overflowX: 'auto',
                pb: 0.5,
                '&::-webkit-scrollbar': { height: 6 },
                '&::-webkit-scrollbar-thumb': { backgroundColor: '#d1d5db', borderRadius: 999 },
              }}
            >
              {STAT_CARDS_DATA.map((card) => (
                <StatCard key={card.title} {...card} />
              ))}
            </Grid>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: { xs: 'wrap', lg: 'nowrap' } }}>
              <TextField
                placeholder="Search by Item Name, ID, or Supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                sx={{
                  flex: '1 1 380px',
                  minWidth: { xs: '100%', sm: 260 },
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'white',
                    height: 38,
                    fontSize: '0.875rem',
                    borderRadius: 1,
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 18, color: '#9ca3af' }} />
                    </InputAdornment>
                  ),
                }}
              />

              {['Category', 'Supplier'].map((label) => (
                <Button
                  key={label}
                  variant="outlined"
                  endIcon={<ExpandMoreIcon />}
                  onClick={(e) =>
                    label === 'Category' ? setCategoryAnchor(e.currentTarget) : setSupplierAnchor(e.currentTarget)
                  }
                  sx={{
                    minWidth: 102,
                    height: 38,
                    textTransform: 'none',
                    bgcolor: 'white',
                    borderColor: '#e5e7eb',
                    color: 'text.primary',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&:hover': { borderColor: '#d1d5db', bgcolor: '#fafafa' },
                  }}
                >
                  {label}
                </Button>
              ))}

              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                sx={{
                  minWidth: 88,
                  height: 38,
                  textTransform: 'none',
                  bgcolor: 'white',
                  borderColor: '#e5e7eb',
                  color: 'text.primary',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  '&:hover': { borderColor: '#d1d5db', bgcolor: '#fafafa' },
                }}
              >
                Filter
              </Button>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  minWidth: 150,
                  height: 38,
                  px: 2,
                  ml: { xs: 0, lg: 'auto' },
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  boxShadow: 'none',
                  borderRadius: 2,
                  '&:hover': { boxShadow: 'none' },
                }}
              >
                Add New Stock
              </Button>
            </Box>
          </Box>

          <Box sx={{ flex: 1, minHeight: 0 }}>
            <DataTable<InventoryItem>
              columns={columns}
              rows={filteredData}
              rowKey={(item) => item.id}
              maxHeight="100%"
              emptyMessage="No items found."
            />
          </Box>

          <AdjustStockModal open={adjustStockModal.open} onClose={handleCloseAdjustStock} />

          <Menu anchorEl={categoryAnchor} open={Boolean(categoryAnchor)} onClose={() => setCategoryAnchor(null)}>
            {['All Categories', 'Beverages', 'Dairy', 'Bakery'].map((category) => (
              <MenuItem key={category} onClick={() => setCategoryAnchor(null)}>
                {category}
              </MenuItem>
            ))}
          </Menu>

          <Menu anchorEl={supplierAnchor} open={Boolean(supplierAnchor)} onClose={() => setSupplierAnchor(null)}>
            {['All Suppliers', 'Global Imports', 'Local Farm', 'Dairy Coop'].map((supplier) => (
              <MenuItem key={supplier} onClick={() => setSupplierAnchor(null)}>
                {supplier}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default InventoryManagement;
