// @utils/mapPurchaseData.ts

interface RawPurchase {
  purchase_id: string;
  branch_id: string;
  vendor_id: string;
  purchase_date: string;
  purchase_type: "direct" | "indirect";
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  payment_id: number;
  notes: string;
  attachment_url: any[];
  created_at: string;
  updated_at: string;
  vendor_name: string;
  vendor_phone: string;
  vendor_email: string;
  company_name: string;
  items: Array<{
    item_id: string;
    item_name: string;
    quantity: number;
    unit: string;
    price: number;
    total: number;
    category: string;
    category_id: number;
  }>;
  payment_history: Array<{
    payment_id: number;
    paid_amount: number;
    payment_mode: string;
    paid_date: string;
    created_at: string;
  }>;
}

interface TablePurchaseItem {
  id: string;
  category: string;
  name: string;
  billDate: string;
  totalAmount: number;
  amountPaid: number;
  paymentMethod: string;
  allocatedTo: {
    name: string;
    initials: string;
    department: string;
    color: string;
  };
}

/**
 * Transform raw API purchase data to table format
 */
export const mapPurchases = (rawPurchases: RawPurchase[]): TablePurchaseItem[] => {
  if (!rawPurchases || !Array.isArray(rawPurchases)) return [];
  
  return rawPurchases.map((purchase) => {
    // Get the first payment method from payment_history
    const paymentMethod = purchase.payment_history?.[0]?.payment_mode || "Unknown";
    
    // Get the first item for category and name
    const firstItem = purchase.items?.[0] || {};
    
    // Generate initials from vendor name
    const vendorName = purchase.vendor_name || "";
    const initials = vendorName
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    
    // Create a color based on vendor name for consistent avatar colors
    const nameHash = vendorName.split("").reduce((acc: number, char: string) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const color = `hsl(${nameHash % 360}, 70%, 60%)`;
    
    return {
      id: purchase.purchase_id,
      category: firstItem.category || "Uncategorized",
      name: firstItem.item_name || purchase.notes || "Purchase",
      billDate: purchase.updated_at,
      totalAmount: purchase.total_amount,
      amountPaid: purchase.paid_amount,
      paymentMethod: paymentMethod,
      allocatedTo: {
        name: purchase.vendor_name,
        initials: initials || "V",
        department: purchase.company_name || "Vendor",
        color: color,
      }
    };
  });
};

/**
 * Get raw purchase data by ID
 */
export const getRawPurchaseById = (rawPurchases: RawPurchase[], purchaseId: string): RawPurchase | undefined => {
  return rawPurchases.find(purchase => purchase.purchase_id === purchaseId);
};