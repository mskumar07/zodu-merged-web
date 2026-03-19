import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
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
  History as HistoryIcon,
  ExpandMore as ExpandMoreIcon,
  Payments as PaymentsIcon,
  Inventory2 as Inventory2Icon,
  Dashboard as DashboardIcon,
  Delete,
  Inventory2,
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import AdjustStockModal from './AdjustStockModal';

const theme = createTheme({
  palette: {
    primary: {
      main: '#D2042D',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    success: {
      main: '#10b981',
    },
    error: {
      main: '#D2042D',
    },
  },
  typography: {
    fontFamily: '"Public Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  shape: {
    borderRadius: 6,
  },
});

interface InventoryItem {
  id: number;
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

const InventoryManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryAnchor, setCategoryAnchor] = useState<null | HTMLElement>(null);
  const [supplierAnchor, setSupplierAnchor] = useState<null | HTMLElement>(null);
    const [open, setOpen] = useState(false);

  const inventoryData: InventoryItem[] = [
    {
      id: 1,
      name: 'Arabica Coffee Beans',
      description: 'Dark Roast, 1kg',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-PK4fq3Xm5lglegeOI_eXABdl_cWw9BhCvJGndbmSX3q0fiPxJKuvWd1IOGJChHYCOa5-0rgPTktlc6LzCWgxBgk4u3tGfSIQxUeuDARDmaooSAWSZ0vGTTIoXMAEWZ_Ombsvt_37JQjJn6lTzq-Yg-04_Cgm_AQfWZIqbWoajPy53uCKkh1fUrJLVEHAz0KaTQXNXxLYEs4nvnUJtCGNBXgQ-feikPH7LDgJ7ah7oSkiVRc3vWIoCwdR0jXXeGRj8epdijAXfgh4',
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
      id: 2,
      name: 'Whole Milk',
      description: 'Pasteurized, 1L',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuScXqQekV8v0bZHHxN_H_aNUCrsNZHsh_sgNWvj24o_QIssRhfz52LYFieJy9pGE-3ji1czl684cFZLBtMjV0hdq_cYlGOSdFws7rgySiegO3pQKKHCtcHkSHEH5Qfv3szXfavs47YfQ5-ZSk1oDFKZUWOEJo12hYfuqPvhO05h0OUGqNAA38Sz-D4cJfuds1do0tGuUJTujJb_M-E6MG8khqlYyKXAbqvoPlHUIxdBKMDJX5A03UsBpJQwPFP4PZyR6jJQ1aOwkXO',
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
      id: 3,
      name: 'Sourdough Loaf',
      description: 'Artisan, 500g',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhevn93jHSQHULPPZ3omdWWggHu3srwAQJvKwVnWtt4WYn_Ld63y9vhoZm4aW15-tanE-cUX0YW4xjrcu0sCeyoQ_xfR072Bu_Mh76X2_LWKr1GkctpESOQJuXWdPAvFZpP-N2DETfnwrE-oEwGe2VDV8JLypQyRS6gBgMULZu9-NtVvPUrGG4W4SvAyZXrqwtVn5b8Ic0NBzFc8VzRtXQXvuWQZdY5acd8HYhtoCWDFqyNp08pylsunTlvgGCFW8vCVkL-eVvlxBf',
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
      id: 4,
      name: 'Cheddar Cheese',
      description: 'Aged, 250g',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC86Kdkg6jy5K3TamaxfoiDh5GFkMIamBoLGYGSqdKhSqJ5HZWQua1xnAEQ2MGYQb2tKSi0qZtK_uAfdZtwpp9Qkvq0iQ6gnqjmFV3Sidb1zJkQ5m_XbHfh9Rjrf8jhgOO_nQzb7K8VoXkQCfgmuQjEr6iLn0Vsi7vsbNeILYZmKQ_2rP9MekF5fEumapN6a5EylpwiJBEG6pqvJSONAdXo84vGlBVzo9FRgJiGyni_vqu1g2lwCoWZYSlNrKaRrL_zfs5LBHFVouWC',
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
      id: 5,
      name: 'English Tea',
      description: '50 Tea Bags',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAX-PVFafpnTtxPk88mXfA3wg8GWAHYVPwN5OQsIGl_g6dT1vmlL-nSzSpdm84QpGd-wfq0wQyPxd2W0ciaWQbpH7JnvvG6FWBdLYhpbpN9TzXwh-2Y5urWh1GryUnfanuxXMDzf06DiiDcPlJquyqA9fm9cLUEWZ594Aq_Bv2Me-AUI2qi2ekbx-iHGDFp_5oVE45KoLtxy7WoUhi7AjK6I1RlRthwbR-eSWcDEBh974_lySvWLiEsHmip9-WbCThoocir_K1bfJIP',
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
      id: 6,
      name: 'Organic Honey',
      description: 'Wildflower, 500g',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCeCelSmFcdd7wLWaTDPw46wXdCd1cfIjM-SLEvaP5oe8sAKpV7Cox9Q4oGJni147s_ri5xsZRF8wiv9WTuFRdxF6I98WjK9cukHIuQrsExgXI9zXqTPq7JL53sSzyzX8CtqnlccBi1JXp2hUaA_-onLKlQWP9Ces6ZgTFlxSo9uvkQRjqOt5yyr7x7xyEwychko4wXxrrbxwOE6khSGY486Mx2cy87v9Ay2HuryB6GrpSWiJ2w3XGYF990bFZwG3TOf5sHxIOztz35',
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
      id: 7,
      name: 'Paper Napkins',
      description: '2-Ply, White, 100pk',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCl0lxvIwGytYS7simFNzjf1blO9jD6aMk2WA6He3atpVPf8z9-e1Zq8A4fjQ0Cs90m5Ol84kHWsqTqxrKC2k-SVDGjCS1aDUWa6XEJ_0K9n5gBv63J-NGy6eS8wl0dwoOWN-2bPa43DUTy_3zIF_mtEHG0PTYwXIi9pVAbBSdRuIr1jjSUYBJTtOf8v3kMril0RoFc2QA8YIIzRuyjEzdzW_UbGS-xs_--aPVNLv_xrI0K0LajQZUsP0S7aqQ0SAtxFePu6rhSLIGf',
      supplier: 'EcoPack Ltd',
      stock: 450,
      unit: 'Pcs',
      lowLevel: 100,
      status: 'In Stock',
      price: 1.5,
      value: 675.0,
      lastRestock: 'Oct 18, 2023',
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          bgcolor: '#fafafa',
          height: '100%',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >      

        <Box
          sx={{
            px: { xs: 2, md: 3 },
            py: { xs: 2, md: 3 },
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 2,
              bgcolor: '#fafafa',
              pb: 2,
            }}
          >
            {/* Stats Grid */}
            <Grid
              container
              spacing={1.5}
              wrap="nowrap"
              sx={{
                mb: 2,
                overflowX: 'auto',
                pb: 0.5,
                '&::-webkit-scrollbar': {
                  height: 6,
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#d1d5db',
                  borderRadius: 999,
                },
              }}
            >
              <Grid item sx={{ minWidth: 320, flex: '0 0 320px' }}>
                <Card
                  elevation={0}
                  sx={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 2,
                 
                    bgcolor: 'white',
                    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
                  }}
                >
                  <CardContent sx={{ p: 1.75, '&:last-child': { pb: 1.75 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={500}
                        fontSize="0.75rem"
                      >
                        Total Stock Value
                      </Typography>
                      <PaymentsIcon sx={{ color: '#D2042D', fontSize: 16 }} />
                    </Box>
                    <Typography
                      variant="h5"
                      fontWeight={700}
                      sx={{ mb: 0.5, fontSize: '1.75rem' }}
                    >
                      $245,850.00
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TrendingUpIcon sx={{ fontSize: 14, color: '#10b981' }} />
                      <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 500 }}>
                        +2.4% vs last month
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item sx={{ minWidth: 320, flex: '0 0 320px' }}>
                <Card
                  elevation={0}
                  sx={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 2,
                    bgcolor: 'white',
                    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
                  }}
                >
                  <CardContent sx={{ p: 1.75, '&:last-child': { pb: 1.75 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={500}
                        fontSize="0.75rem"
                      >
                        Low Stock Items
                      </Typography>
                      <WarningIcon sx={{ color: '#D2042D', fontSize: 16 }} />
                    </Box>
                    <Typography
                      variant="h5"
                      fontWeight={700}
                      color="primary"
                      sx={{ mb: 0.5, fontSize: '1.75rem' }}
                    >
                      12
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontStyle="italic"
                      fontSize="0.75rem"
                    >
                      Items below reorder level
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item sx={{ minWidth: 320, flex: '0 0 320px' }}>
                <Card
                  elevation={0}
                  sx={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 2,
                    bgcolor: 'white',
                    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
                  }}
                >
                  <CardContent sx={{ p: 1.75, '&:last-child': { pb: 1.75 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={500}
                        fontSize="0.75rem"
                      >
                        Out of Stock
                      </Typography>
                      <ErrorIcon sx={{ color: '#D2042D', fontSize: 16 }} />
                    </Box>
                    <Typography
                      variant="h5"
                      fontWeight={700}
                      color="primary"
                      sx={{ mb: 0.5, fontSize: '1.75rem' }}
                    >
                      4
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontStyle="italic"
                      fontSize="0.75rem"
                    >
                      Immediate action required
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item sx={{ minWidth: 320, flex: '0 0 320px' }}>
                <Card
                  elevation={0}
                  sx={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 2,
                    bgcolor: 'white',
                    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
                  }}
                >
                  <CardContent sx={{ p: 1.75, '&:last-child': { pb: 1.75 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={500}
                        fontSize="0.75rem"
                      >
                        Total SKUs
                      </Typography>
                      <QrCode2Icon sx={{ color: '#D2042D', fontSize: 16 }} />
                    </Box>
                    <Typography
                      variant="h5"
                      fontWeight={700}
                      sx={{ mb: 0.5, fontSize: '1.75rem' }}
                    >
                      1,240
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontStyle="italic"
                      fontSize="0.75rem"
                    >
                      Active items in catalog
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Toolbar */}
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  flexWrap: { xs: 'wrap', lg: 'nowrap' },
                }}
              >
                <Box sx={{ flex: '1 1 380px', minWidth: { xs: '100%', sm: 260 } }}>
                  <TextField
                    placeholder="Search by Item Name, SKU, or Code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="small"
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'white',
                        height: 38,
                        fontSize: '0.875rem',
                        borderRadius: 2,
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
                </Box>
                <Button
                    variant="outlined"
                    endIcon={<ExpandMoreIcon />}
                    onClick={(e) => setCategoryAnchor(e.currentTarget)}
                    sx={{
                      minWidth: 102,
                      height: 38,
                      textTransform: 'none',
                      bgcolor: 'white',
                      borderColor: '#e5e7eb',
                      color: 'text.primary',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      '&:hover': {
                        borderColor: '#d1d5db',
                        bgcolor: '#fafafa',
                      },
                    }}
                  >
                    Category
                  </Button>
                <Button
                    variant="outlined"
                    endIcon={<ExpandMoreIcon />}
                    onClick={(e) => setSupplierAnchor(e.currentTarget)}
                    sx={{
                      minWidth: 102,
                      height: 38,
                      textTransform: 'none',
                      bgcolor: 'white',
                      borderColor: '#e5e7eb',
                      color: 'text.primary',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      '&:hover': {
                        borderColor: '#d1d5db',
                        bgcolor: '#fafafa',
                      },
                    }}
                  >
                    Supplier
                  </Button>
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
                      '&:hover': {
                        borderColor: '#d1d5db',
                        bgcolor: '#fafafa',
                      },
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
                    '&:hover': {
                      boxShadow: 'none',
                    },
                  }}
                >
                  Add New Stock
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Table */}
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              flex: 1,
              minHeight: 0,
              overflow: 'auto',
              border: '1px solid #e5e7eb',
              borderRadius: 2,
              bgcolor: 'white',
            }}
          >
            <Table sx={{ minWidth: 1000 }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 1,
                      fontWeight: 600,
                      fontSize: '0.6875rem',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      py: 1.5,
                      bgcolor: '#fafafa',
                      borderBottom: '1px solid #e5e7eb',
                    }}
                  >
                    ITEM NAME
                  </TableCell>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 1,
                      fontWeight: 600,
                      fontSize: '0.6875rem',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      py: 1.5,
                      bgcolor: '#fafafa',
                      borderBottom: '1px solid #e5e7eb',
                    }}
                  >
                    SUPPLIER
                  </TableCell>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 1,
                      fontWeight: 600,
                      fontSize: '0.6875rem',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      py: 1.5,
                      bgcolor: '#fafafa',
                      borderBottom: '1px solid #e5e7eb',
                    }}
                  >
                    STOCK
                  </TableCell>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 1,
                      fontWeight: 600,
                      fontSize: '0.6875rem',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      py: 1.5,
                      bgcolor: '#fafafa',
                      borderBottom: '1px solid #e5e7eb',
                    }}
                  >
                    LOW LEVEL
                  </TableCell>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 1,
                      fontWeight: 600,
                      fontSize: '0.6875rem',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      py: 1.5,
                      bgcolor: '#fafafa',
                      borderBottom: '1px solid #e5e7eb',
                    }}
                  >
                    STATUS
                  </TableCell>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 1,
                      fontWeight: 600,
                      fontSize: '0.6875rem',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      py: 1.5,
                      bgcolor: '#fafafa',
                      borderBottom: '1px solid #e5e7eb',
                    }}
                  >
                    PRICE
                  </TableCell>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 1,
                      fontWeight: 600,
                      fontSize: '0.6875rem',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      py: 1.5,
                      bgcolor: '#fafafa',
                      borderBottom: '1px solid #e5e7eb',
                    }}
                  >
                    VALUE
                  </TableCell>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 1,
                      fontWeight: 600,
                      fontSize: '0.6875rem',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      py: 1.5,
                      bgcolor: '#fafafa',
                      borderBottom: '1px solid #e5e7eb',
                    }}
                  >
                    LAST RESTOCK
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 1,
                      fontWeight: 600,
                      fontSize: '0.6875rem',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      py: 1.5,
                      bgcolor: '#fafafa',
                      borderBottom: '1px solid #e5e7eb',
                    }}
                  >
                    ACTIONS
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inventoryData.map((item, index) => (
                  <TableRow
                    key={item.id}
                    sx={{
                      '&:hover': {
                        bgcolor: '#fef8f8',
                      },
                      '&:last-child td': {
                        borderBottom: 0,
                      },
                    }}
                  >
                    <TableCell sx={{ py: 2, borderBottom: '1px solid #f3f4f6' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={item.image}
                          variant="rounded"
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 1.5,
                          }}
                        />
                        <Box>
                          <Typography variant="body2" fontWeight={600} fontSize="0.875rem">
                            {item.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                            {item.description}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2, borderBottom: '1px solid #f3f4f6' }}>
                      <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                        {item.supplier}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2, borderBottom: '1px solid #f3f4f6' }}>
                      <Chip
                        label={`${item.stock} ${item.unit}`}
                        size="small"
                        sx={{
                          bgcolor:
                            item.status === 'Out Stock'
                              ? '#f3f4f6'
                              : item.status === 'Low Stock'
                              ? '#fce4ec'
                              : '#fce4ec',
                          color:
                            item.status === 'Out Stock'
                              ? '#9ca3af'
                              : item.status === 'Low Stock'
                              ? '#D2042D'
                              : '#D2042D',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          height: 24,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 2, borderBottom: '1px solid #f3f4f6' }}>
                      <Typography variant="body2" fontSize="0.875rem">
                        {item.lowLevel} {item.unit}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2, borderBottom: '1px solid #f3f4f6' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor:
                              item.status === 'In Stock'
                                ? '#10b981'
                                : item.status === 'Low Stock'
                                ? '#ffd000'
                                : '#D2042D',
                          }}
                        />
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          fontSize="0.875rem"
                          sx={{
                            color:
                              item.status === 'In Stock'
                                ? '#10b981'
                                : item.status === 'Low Stock'
                                ? '#ffd000'
                                : '#D2042D',
                          }}
                        >
                          {item.status}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2, borderBottom: '1px solid #f3f4f6' }}>
                      <Typography variant="body2" fontSize="0.875rem">
                        ${item.price.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2, borderBottom: '1px solid #f3f4f6' }}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        fontSize="0.875rem"
                        sx={{ color: item.value === 0 ? '#9ca3af' : 'text.primary' }}
                      >
                        ${item.value.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2, borderBottom: '1px solid #f3f4f6' }}>
                      <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                        {item.lastRestock}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ py: 2, borderBottom: '1px solid #f3f4f6' }}>
                      <IconButton size="small" sx={{ color: '#D2042D' }}>
                        <EditIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                      <IconButton onClick={()=> setOpen(true)} size="small" sx={{ color: '#D2042D' }}>
                        <Inventory2 sx={{ fontSize: 18 }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
<AdjustStockModal open={open} onClose={()=> setOpen(false)} />

          {/* Menus */}
          <Menu
            anchorEl={categoryAnchor}
            open={Boolean(categoryAnchor)}
            onClose={() => setCategoryAnchor(null)}
          >
            <MenuItem onClick={() => setCategoryAnchor(null)}>All Categories</MenuItem>
            <MenuItem onClick={() => setCategoryAnchor(null)}>Beverages</MenuItem>
            <MenuItem onClick={() => setCategoryAnchor(null)}>Dairy</MenuItem>
            <MenuItem onClick={() => setCategoryAnchor(null)}>Bakery</MenuItem>
          </Menu>

          <Menu
            anchorEl={supplierAnchor}
            open={Boolean(supplierAnchor)}
            onClose={() => setSupplierAnchor(null)}
          >
            <MenuItem onClick={() => setSupplierAnchor(null)}>All Suppliers</MenuItem>
            <MenuItem onClick={() => setSupplierAnchor(null)}>Global Imports</MenuItem>
            <MenuItem onClick={() => setSupplierAnchor(null)}>Local Farm</MenuItem>
            <MenuItem onClick={() => setSupplierAnchor(null)}>Dairy Coop</MenuItem>
          </Menu>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default InventoryManagement;
