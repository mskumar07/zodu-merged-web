import { memo, type ReactNode } from 'react';
import { Box } from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import PercentIcon from '@mui/icons-material/Percent';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import StatCard from '@components/StatCard';
import { money } from './invoiceTableParts';
import type { CardDef } from './gstr1Tabs';

const icon = (Icon: typeof DescriptionOutlinedIcon, color: string): ReactNode => (
  <Icon fontSize="small" sx={{ color }} />
);

// One look per card kind, so every tab's cards read the same way.
const LOOK: Record<CardDef['kind'], { icon: ReactNode; bg: string }> = {
  count: { icon: icon(DescriptionOutlinedIcon, '#1976d2'), bg: '#E3F2FD' },
  value: { icon: icon(CurrencyRupeeIcon, '#16A34A'), bg: '#E8F5E9' },
  taxable: { icon: icon(PercentIcon, '#D2122E'), bg: '#FDECEF' },
  tax: { icon: icon(ReceiptLongOutlinedIcon, '#EA580C'), bg: '#FFF3E0' },
  igst: { icon: icon(ReceiptLongOutlinedIcon, '#D2122E'), bg: '#FDECEF' },
  cgst: { icon: icon(ReceiptLongOutlinedIcon, '#EA580C'), bg: '#FFF3E0' },
  sgst: { icon: icon(ReceiptLongOutlinedIcon, '#7B1FA2'), bg: '#F3E5F5' },
  cess: { icon: icon(ReceiptLongOutlinedIcon, '#475569'), bg: '#F1F5F9' },
  docs: { icon: icon(FolderOpenOutlinedIcon, '#7B1FA2'), bg: '#F3E5F5' },
};

function TabStatCards({ cards, loading }: { cards: CardDef[]; loading: boolean }) {
  return (
    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', flexShrink: 0 }}>
      {cards.map((c) => (
        <StatCard
          key={c.id} label={c.label} loading={loading}
          valuePrefix={c.isMoney ? '₹' : ''}
          value={c.isMoney ? money(c.value) : c.value}
          icon={LOOK[c.kind].icon} iconBgColor={LOOK[c.kind].bg}
          compact
        />
      ))}
    </Box>
  );
}

export default memo(TabStatCards);
