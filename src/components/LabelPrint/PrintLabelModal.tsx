import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box, Button, Checkbox, CircularProgress, Dialog, FormControl, FormControlLabel,
  IconButton, InputAdornment, MenuItem, Radio, RadioGroup, Select, TextField, Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import { closeFromControlsOnly } from '@utils/dialog';
import LottieLoader from '@components/LottieLoader';
import { useAppSelector } from '@store/store';
import { AllCompanies } from '@store/slices/userSlice';
import { useTenantContext } from '@store/tenantContext';
import {
  LabelView, printLabels, LABEL_SIZES, DEFAULT_LABEL_OPTIONS,
  type CodeType, type LabelType, type LabelOptions, type LabelItem,
} from './labelRender';

const RED = '#D2122E';
const PREVIEW_SCALE = 2.4; // 1 mm ≈ 3.78 px, so a 40 mm label is magnified for the preview

/** One selectable row, in the shape the picker needs whatever business type it came from. */
export interface PickerItem extends LabelItem {
  /** Stable unique id (item_uuid for Retail, menu_id for Restaurant). */
  id: string;
}

export interface PickerCategory { value: number; label: string }

export interface LabelDataSourceQuery { search: string; categoryId: number | '' }

/**
 * What the modal needs from a business type. Each module supplies a hook that
 * maps its own API to this shape; the modal never knows which one it is.
 */
export interface LabelDataSource {
  items: PickerItem[];
  total?: number;
  isLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  /** Loads the next page and resolves with the full list so far. */
  fetchNextPage: () => Promise<{ items: PickerItem[]; hasNextPage: boolean }>;
  categories: PickerCategory[];
  categoriesHasNext: boolean;
  categoriesFetching: boolean;
  fetchMoreCategories: () => void;
}

export type UseLabelDataSource = (query: LabelDataSourceQuery) => LabelDataSource;

const toLabelItem = ({ code, barcode, name, price, category }: PickerItem): LabelItem =>
  ({ code, barcode, name, price, category });

// ─── List row ─────────────────────────────────────────────────

const ItemRow = React.memo(function ItemRow(
  { item, checked, onToggle }: { item: PickerItem; checked: boolean; onToggle: (m: PickerItem) => void },
) {
  return (
    <Box
      onClick={() => onToggle(item)}
      sx={{
        display: 'grid', gridTemplateColumns: '40px 1.3fr 1.6fr 1fr 90px', alignItems: 'center',
        px: 1, minHeight: 38, cursor: 'pointer', borderBottom: '1px solid #F1F5F9',
        '&:hover': { bgcolor: '#F8FAFC' },
        contentVisibility: 'auto', containIntrinsicSize: '38px', // skips layout/paint for off-screen rows
      }}
    >
      <Checkbox size="small" checked={checked} tabIndex={-1} sx={{ p: 0.5, '&.Mui-checked': { color: RED } }} />
      <Typography noWrap sx={{ fontSize: 12, color: '#1976d2' }}>{item.code}</Typography>
      <Typography noWrap sx={{ fontSize: 12, color: '#0F172A' }}>{item.name}</Typography>
      <Typography noWrap sx={{ fontSize: 12, color: '#475569' }}>{item.category ?? '-'}</Typography>
      <Typography sx={{ fontSize: 12, textAlign: 'right', pr: 1 }}>
        {item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </Typography>
    </Box>
  );
});

// ─── Modal body (mounted only while open, so nothing is fetched when closed) ──

function PrintLabelBody({ onClose, useDataSource }: { onClose: () => void; useDataSource: UseLabelDataSource }) {
  const [codeType, setCodeType] = useState<CodeType>('qr');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Map<string, PickerItem>>(new Map());
  const [options, setOptions] = useState<LabelOptions>(DEFAULT_LABEL_OPTIONS);
  const [sizeId, setSizeId] = useState(LABEL_SIZES[0].id);
  const [labelType, setLabelType] = useState<LabelType>(2);
  const [selectingAll, setSelectingAll] = useState(false);
  const [printing, setPrinting] = useState(false);

  const { zoduId } = useTenantContext();
  const companies = useAppSelector(AllCompanies);
  const logoUrl = companies.find((c) => c.zodu_id === zoduId)?.company_logo_url ?? '';

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);
  const onSearch = (v: string) => {
    setSearchInput(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(v), 300);
  };

  const {
    items, total, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage,
    categories, categoriesHasNext, categoriesFetching, fetchMoreCategories,
  } = useDataSource({ search, categoryId });

  // Infinite scroll for the item list.
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage(); },
      { root: scrollRef.current, rootMargin: '120px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, items.length]);

  const toggle = useCallback((m: PickerItem) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(m.id)) next.delete(m.id); else next.set(m.id, m);
      return next;
    });
  }, []);

  const allLoadedSelected = items.length > 0 && items.every((i) => selected.has(i.id));
  const someSelected = selected.size > 0;

  // "Select All" covers every page of the current filter, not just what has scrolled in.
  const toggleAll = async () => {
    if (allLoadedSelected && !hasNextPage) {
      setSelected((prev) => {
        const next = new Map(prev);
        items.forEach((i) => next.delete(i.id));
        return next;
      });
      return;
    }
    setSelectingAll(true);
    try {
      let list = items;
      let more = !!hasNextPage;
      while (more) {
        const res = await fetchNextPage();
        list = res.items;
        more = res.hasNextPage;
      }
      setSelected((prev) => {
        const next = new Map(prev);
        list.forEach((i) => next.set(i.id, i));
        return next;
      });
    } finally {
      setSelectingAll(false);
    }
  };

  const size = LABEL_SIZES.find((s) => s.id === sizeId) ?? LABEL_SIZES[0];
  const previewItem = useMemo(() => {
    const first = selected.values().next().value ?? items[0];
    return first ? toLabelItem(first) : { code: 'ITEM-CODE', name: 'Item Name', price: 0, category: 'Category' };
  }, [selected, items]);

  const setOpt = (k: keyof LabelOptions) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setOptions((o) => ({ ...o, [k]: e.target.checked }));

  const handlePrint = async () => {
    setPrinting(true);
    try {
      await printLabels([...selected.values()].map(toLabelItem), { codeType, labelType, options, size, logoUrl });
    } finally {
      setPrinting(false);
    }
  };

  const optionBox = (k: keyof LabelOptions, label: string) => (
    <FormControlLabel
      key={k}
      control={<Checkbox size="small" checked={options[k]} onChange={setOpt(k)} sx={{ '&.Mui-checked': { color: RED } }} />}
      label={<Typography sx={{ fontSize: 13 }}>{label}</Typography>}
    />
  );

  const typeBtn = (t: LabelType) => (
    <Button
      key={t} onClick={() => setLabelType(t)} variant="outlined"
      sx={{
        textTransform: 'none', fontSize: 13, height: 36, px: 2, borderRadius: 0.5, minWidth: 80,
        color: labelType === t ? RED : '#334155', borderColor: labelType === t ? RED : '#CBD5E1',
        bgcolor: labelType === t ? '#FFF1F2' : '#fff', '&:hover': { borderColor: RED },
      }}
    >Type {t}</Button>
  );

  return (
    <>
      {/* Select All can walk through many pages, so block the modal behind the loader meanwhile. */}
      {selectingAll && (
        <Box sx={{
          position: 'absolute', inset: 0, zIndex: 10, display: 'flex', alignItems: 'center',
          justifyContent: 'center', bgcolor: 'rgba(255,255,255,0.75)', borderRadius: 2,
        }}>
          <LottieLoader />
        </Box>
      )}
      <Box sx={{ px: 3, pt: 2.5, pb: 1.5, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontSize: 22, fontWeight: 700, color: '#0F172A' }}>Print QR / Bar Code</Typography>
          <Typography sx={{ fontSize: 13, color: '#64748B' }}>
            Select menu items and print QR or Bar Code labels for item identification, table menu or inventory.
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
      </Box>

      <Box sx={{ px: 3, pb: 1, flex: 1, minHeight: 0, display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'flex-start' }, overflow: 'auto' }}>
        {/* ── Left: code type + item picker ── */}
        <Box sx={{ flex: 1.3, minWidth: 0, display: 'flex', flexDirection: 'column', border: '1px solid #E2E8F0', borderRadius: 1, p: 1.5 }}>
          <RadioGroup row value={codeType} onChange={(e) => setCodeType(e.target.value as CodeType)}>
            {([['qr', 'QR Code'], ['code128', 'Barcode (CODE128)'], ['ean13', 'Barcode (EAN13)']] as const).map(([v, l]) => (
              <FormControlLabel key={v} value={v} label={<Typography sx={{ fontSize: 13 }}>{l}</Typography>}
                control={<Radio size="small" sx={{ '&.Mui-checked': { color: RED } }} />} />
            ))}
          </RadioGroup>

          <Box sx={{ display: 'flex', gap: 1.5, my: 1.5 }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 12, color: '#475569', mb: 0.5 }}>Category</Typography>
              <FormControl size="small" fullWidth>
                <Select<number | ''>
                  displayEmpty value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value === '' ? '' : Number(e.target.value))}
                  sx={{ fontSize: 13 }}
                  MenuProps={{
                    PaperProps: {
                      sx: { maxHeight: 300 },
                      onScroll: (e: React.UIEvent<HTMLElement>) => {
                        const el = e.currentTarget;
                        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40 && categoriesHasNext && !categoriesFetching) fetchMoreCategories();
                      },
                    },
                  }}
                >
                  <MenuItem value="" sx={{ fontSize: 13 }}>All Categories</MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c.value} value={Number(c.value)} sx={{ fontSize: 13 }}>{c.label}</MenuItem>
                  ))}
                  {categoriesFetching && <MenuItem disabled sx={{ fontSize: 12, justifyContent: 'center' }}>Loading...</MenuItem>}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 12, color: '#475569', mb: 0.5 }}>Search Item</Typography>
              <TextField
                size="small" fullWidth placeholder="Search item code or name..." value={searchInput}
                onChange={(e) => onSearch(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment>,
                  sx: { fontSize: 13 },
                }}
              />
            </Box>
          </Box>

          {/* header */}
          <Box sx={{
            display: 'grid', gridTemplateColumns: '40px 1.3fr 1.6fr 1fr 90px', alignItems: 'center',
            px: 1, height: 38, bgcolor: '#F1F5F9', borderRadius: '4px 4px 0 0',
          }}>
            <Checkbox size="small" checked={allLoadedSelected} indeterminate={someSelected && !allLoadedSelected}
              onChange={toggleAll} disabled={selectingAll || !items.length}
              sx={{ p: 0.5, '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: RED } }} />
            {['Item Code', 'Item Name', 'Category'].map((h) => (
              <Typography key={h} sx={{ fontSize: 12, fontWeight: 700 }}>{h}</Typography>
            ))}
            <Typography sx={{ fontSize: 12, fontWeight: 700, textAlign: 'right', pr: 1 }}>Price (₹)</Typography>
          </Box>

          <Box ref={scrollRef} sx={{ maxHeight: 330, overflowY: 'auto', border: '1px solid #F1F5F9', borderTop: 0 }}>
            {isLoading ? (
              <LottieLoader />
            ) : items.length === 0 ? (
              <Typography sx={{ p: 4, textAlign: 'center', fontSize: 13, color: '#94A3B8' }}>No items found</Typography>
            ) : (
              <>
                {items.map((it) => (
                  <ItemRow key={it.id} item={it} checked={selected.has(it.id)} onToggle={toggle} />
                ))}
                <Box ref={sentinelRef} sx={{ height: 1 }} />
                {isFetchingNextPage && (
                  <Box sx={{ p: 1, textAlign: 'center' }}><CircularProgress size={16} sx={{ color: RED }} /></Box>
                )}
              </>
            )}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Typography sx={{ fontSize: 13 }}>
              {selected.size} item{selected.size === 1 ? '' : 's'} selected
              {total !== undefined ? ` · ${total} total` : ''}
            </Typography>
            <FormControlLabel
              disabled={selectingAll || !items.length}
              control={<Checkbox size="small" checked={allLoadedSelected && !hasNextPage} onChange={toggleAll}
                sx={{ '&.Mui-checked': { color: RED } }} />}
              label={<Typography sx={{ fontSize: 13 }}>Select All</Typography>}
            />
          </Box>
        </Box>

        {/* ── Right: display options + preview ── */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ border: '1px solid #E2E8F0', borderRadius: 1, p: 1.5 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 0.5 }}>Display Options</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {optionBox('showCode', 'Show Item Code')}
              {optionBox('showName', 'Show Item Name')}
              {optionBox('showPrice', 'Show Price')}
            </Box>
          </Box>

          <Box sx={{ border: '1px solid #E2E8F0', borderRadius: 1, p: 1.5, flex: 1 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 1 }}>Label Preview</Typography>
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-end', mb: 1.5 }}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 12, color: '#475569', mb: 0.5 }}>Label Size</Typography>
                <FormControl size="small" fullWidth>
                  <Select value={sizeId} onChange={(e) => setSizeId(e.target.value)} sx={{ fontSize: 13 }}>
                    {LABEL_SIZES.map((s) => <MenuItem key={s.id} value={s.id} sx={{ fontSize: 13 }}>{s.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 12, color: '#475569', mb: 0.5 }}>Label Type</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>{typeBtn(1)}{typeBtn(2)}</Box>
              </Box>
            </Box>

            <Box sx={{
              bgcolor: '#F8FAFC', borderRadius: 1, p: 2,
              display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'auto',
            }}>
              {/* The label is laid out in real mm and magnified, so the preview matches the print. */}
              <Box sx={{ width: `${size.w * 3.78 * PREVIEW_SCALE}px`, height: `${size.h * 3.78 * PREVIEW_SCALE}px`, flexShrink: 0, boxShadow: 1 }}>
                <Box sx={{ transform: `scale(${PREVIEW_SCALE})`, transformOrigin: 'top left', width: 'max-content' }}>
                  <LabelView item={previewItem} codeType={codeType} labelType={labelType}
                    options={options} size={size} logoUrl={logoUrl} />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
        <Button variant="outlined" onClick={onClose}
          sx={{ textTransform: 'none', fontWeight: 600, px: 4, color: '#0F172A', borderColor: '#CBD5E1' }}>
          Cancel
        </Button>
        <Button variant="contained" disabled={!selected.size || printing} onClick={handlePrint}
          startIcon={printing ? <CircularProgress size={16} color="inherit" /> : <PrintOutlinedIcon />}
          sx={{ textTransform: 'none', fontWeight: 700, px: 3, bgcolor: RED, '&:hover': { bgcolor: '#b00f26' } }}>
          Print Labels
        </Button>
      </Box>
    </>
  );
}

export default function PrintLabelModal(
  { open, onClose, useDataSource }: { open: boolean; onClose: () => void; useDataSource: UseLabelDataSource },
) {
  return (
    <Dialog
      open={open} onClose={closeFromControlsOnly(onClose)} fullWidth maxWidth="lg"
      PaperProps={{ sx: { borderRadius: 2, maxHeight: '94vh' } }}
    >
      <PrintLabelBody onClose={onClose} useDataSource={useDataSource} />
    </Dialog>
  );
}
