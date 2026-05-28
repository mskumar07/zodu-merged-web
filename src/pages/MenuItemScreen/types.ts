export type ItemType = 'Sellable Product' | 'Raw Material';
export type TaxInclusion = 'Incl.' | 'Excl.';
export type TabValue = 'all' | 'category' | 'sellable' | 'raw';

export interface Product {
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
