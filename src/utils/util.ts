

export const getProductPrice = (obj: any): number => {
  const rawPrice = Number(obj.sell_price || 0);
  const gst = Number(obj.gst_tax || 0);

  // If tax is NOT included, return price directly
  if (!obj.tax_include_or_exclude) {
    return rawPrice;
  }

  // If tax IS included, remove GST from total price
  const basePrice = rawPrice / (1 + gst / 100);

  return Number(basePrice.toFixed(2));
};

//Calculate taxes
export const calculateGroupedTax = (items: any[]) => {
  const taxSummary: Record<
    string,
    {
      gstRate: number;
      taxableAmount: number;
      taxAmount: number;
    }
  > = {};

  items.forEach(({ product, quantity }) => {
    const price = Number(product.sell_price || 0);
    const gstRate = Number(product.gst_tax || 0);
    const isTaxIncluded = product.tax_include_or_exclude === true;

    let taxableAmount = 0;
    let taxAmount = 0;

    if (isTaxIncluded) {
      // Extract tax from inclusive price
      taxableAmount = price / (1 + gstRate / 100);
      taxAmount = price - taxableAmount;
    } else {
      // Tax not included → calculate tax
      taxableAmount = price;
      taxAmount = (price * gstRate) / 100;
    }

    // Multiply by quantity
    taxableAmount *= quantity;
    taxAmount *= quantity;

    const key = gstRate.toString();

    if (!taxSummary[key]) {
      taxSummary[key] = {
        gstRate,
        taxableAmount: 0,
        taxAmount: 0,
      };
    }

    taxSummary[key].taxableAmount += Number(taxableAmount.toFixed(2));
    taxSummary[key].taxAmount += Number(taxAmount.toFixed(2));
  });
  console.log("Tax Summary:", taxSummary);
  return Object.values(taxSummary);
};


// Z-T71 for convert the formik values to formData object
// Z-T71 — Convert Formik values to FormData object
export const objectToFormData = (
  obj: Record<string, any>,
  formData = new FormData(),
  parentKey?: string
) => {
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;
    const value = obj[key];
    const formKey = parentKey ? `${parentKey}[${key}]` : key;

    // ✅ Special case: only send menu_category.name
    if (key === "menu_category" && value && typeof value === "object") {
      if (value.name) {
        formData.append(formKey, value.name);
      }
      continue;
    }
    //   if (value instanceof File) {
    //   formData.append(formKey, value);
    // } else
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === "object" && item !== null) {
          objectToFormData(item, formData, `${formKey}[${index}]`);
        } else {
          formData.append(`${formKey}[${index}]`, item);
        }
      });
    } else if (typeof value === "object" && value !== null) {
      objectToFormData(value, formData, formKey);
    } else if (value !== undefined && value !== null) {
      formData.append(formKey, value);
    }
  }

  return formData;
};

//z-T77
export const generateOrderId = (): string => {
  const now = new Date();
  const pad = (n, width = 2) => n.toString().padStart(width, "0");

  // Format: yyyyMMdd_HHmmssSSS
  const timestamp =
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    "_" +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds()) +
    now.getMilliseconds().toString().padStart(3, "0");

  // Random number between 000–999
  const rand = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `ORD-${timestamp}-${rand}`;
};

//V2
export function generateOrderIdV2() {
  const now = new Date();

  // Format timestamp as YYMMDD
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const timestamp = `${year}${month}${day}`;

  // Generate 4-digit random number
  const rand = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  return `${timestamp}-${rand}`;
}

export const getFileType = (file: any) => {


  const name = file.fileName?.toLowerCase() || "";
  if (name.match(/\.(jpg|jpeg|png|webp)$/)) return "image";
  if (name.endsWith(".pdf")) return "pdf";
  if (name.match(/\.(doc|docx)$/)) return "doc";
  return "file";
};


{/*Z-i34 */}
// Format date
export  const formatDateTime = (dateString: string) => {
  if (!dateString) return "No Date";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";

  const day = date.toLocaleDateString("en-IN", { day: "2-digit" });
  const month = date.toLocaleDateString("en-IN", { month: "short" });
  const year = date.getFullYear();
  const time = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const weekday = date.toLocaleDateString("en-IN", { weekday: "short" });

  return `${day} ${month} ${year}, ${time} (${weekday})`;
};


export const formatDate = (dateStr:string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// 👉 21 Jan 2026

/**
 * Enriches order items with complete menu data
 * Merges full menu item details (gst_tax, food_type, variants, etc.) with ordered items
 * @param menuData - Array of menu categories containing items
 * @param order - Order object with ordered_items array
 * @returns Order object with enriched items containing complete menu data
 */
export function enrichOrderItemsWithMenuData(
  menuData: any[],
  order: any
): any {
  if (!menuData || !order?.ordered_items) {
    return order;
  }

  // Flatten all menu items from all categories into a single map
  const menuItemMap = new Map();
  
  menuData.forEach((category) => {
    if (category.items && Array.isArray(category.items)) {
      category.items.forEach((item) => {
        menuItemMap.set(item.menu_id, item);
      });
    }
  });

  // Enrich ordered items with menu data
  const enrichedOrderedItems = order.ordered_items.map((orderedItem: any) => {
    const menuItem = menuItemMap.get(orderedItem.item_id);
    
    if (menuItem) {
      // Merge menu data with ordered item, keeping ordered item values as priority
      return {
        ...menuItem,          // Start with all menu data
        ...orderedItem,       // Override with ordered item values
        // Explicitly preserve order-specific properties
        qty: orderedItem.qty,
        price: orderedItem.price,
        item_id: orderedItem.item_id,
        item_name: orderedItem.item_name,
        item_unit: orderedItem.item_unit,
        item_image: orderedItem.item_image,
        variant_id: orderedItem.variant_id,
        variant_name: orderedItem.variant_name,
      };
    }
    
    return orderedItem; // Return original if menu item not found
  });

  // Return enriched order
  return {
    ...order,
    ordered_items: enrichedOrderedItems,
  };
}
