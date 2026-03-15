// utils/mockData.ts
import {
  type Order,
  type OrderDateWise,
  type OrderMonthWise,
  type OrderCategoryWise,
  type Expense,
  type Purchase,
  type Inventory,
  OrderType,
  PaymentMethod,
} from "../types/report.type";

const CUSTOMER_NAMES = [
  "John Doe",
  "Jane Smith",
  "Robert Johnson",
  "Sarah Williams",
  "Michael Brown",
];
const CUSTOMER_PHONES = [
  "+1 234-567-8901",
  "+1 234-567-8902",
  "+1 234-567-8903",
  "+1 234-567-8904",
];
const ADDRESSES = [
  "123 Main St",
  "456 Oak Ave",
  "789 Pine Rd",
  "321 Maple Blvd",
];

// Generate paginated mock data for infinite scroll
export const generateMockOrders = (
  page: number,
  limit: number,
): { data: Order[]; hasMore: boolean } => {
  const startIndex = (page - 1) * limit;
  const totalOrders = 1240;

  const orderTypes = [
    OrderType.DINE_IN,
    OrderType.TAKEAWAY,
    OrderType.DELIVERY,
  ];
  const paymentMethods = [
    PaymentMethod.CASH,
    PaymentMethod.WALLET,
    PaymentMethod.UPI,
    PaymentMethod.CARD
  ];

  const data: Order[] = Array.from({ length: limit }, (_, i) => {
    const index = startIndex + i;
    if (index >= totalOrders) return null;

    const orderType = orderTypes[Math.floor(Math.random() * 3)];
    const itemsCount = Math.floor(Math.random() * 4) + 1;
    const baseAmount = Math.floor(Math.random() * 100) + 20;
    const gst = parseFloat((baseAmount * 0.1).toFixed(2));
    const totalAmount = parseFloat((baseAmount + gst).toFixed(2));

    const items = Array.from({ length: itemsCount }, (_, j) => ({
      name: `Item ${index}-${j}`,
      quantity: Math.floor(Math.random() * 3) + 1,
      price: Math.floor(Math.random() * 30) + 10,
    }));

    return {
      id: `order-${index}`,
      orderId: `#ORD-${9900 + index}`,
      dateTime: `24 Oct 2023 ${Math.floor(Math.random() * 24)
        .toString()
        .padStart(2, "0")}:${Math.floor(Math.random() * 60)
        .toString()
        .padStart(2, "0")}`,
      orderType,
      items,
      gst,
      totalAmount,
      paymentMethod:
        paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      customerName:
        CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)],
      customerPhone:
        CUSTOMER_PHONES[Math.floor(Math.random() * CUSTOMER_PHONES.length)],
      address: ADDRESSES[Math.floor(Math.random() * ADDRESSES.length)],
    };
  }).filter(Boolean) as Order[];

  return {
    data,
    hasMore: startIndex + limit < totalOrders,
  };
};

export const generateOrderDateWiseData = (
  page: number,
  limit: number,
): { data: OrderDateWise[]; hasMore: boolean } => {
  const allDates: OrderDateWise[] = [];
  for (let i = 1; i <= 100; i++) {
    const date = new Date(2023, 9, i);
    allDates.push({
      date: date
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        .replace(/ /g, "-")
        .toUpperCase(),
      totalBills: Math.floor(Math.random() * 100) + 20,
      totalAmount: parseFloat((Math.random() * 5000 + 1000).toFixed(2)),
    });
  }

  const startIndex = (page - 1) * limit;
  const data = allDates.slice(startIndex, startIndex + limit);

  return {
    data,
    hasMore: startIndex + limit < allDates.length,
  };
};

export const generateOrderMonthWiseData = (): OrderMonthWise[] => {
  const years = [2023, 2024, 2025];

  return years.map((year) => {
    const months = [
      { name: "January", days: 31 },
      { name: "February", days: year % 4 === 0 ? 29 : 28 },
      { name: "March", days: 31 },
      { name: "April", days: 30 },
      { name: "May", days: 31 },
      { name: "June", days: 30 },
      { name: "July", days: 31 },
      { name: "August", days: 31 },
      { name: "September", days: 30 },
      { name: "October", days: 31 },
      { name: "November", days: 30 },
      { name: "December", days: 31 },
    ];

    const monthData = months.map((month) => ({
      month: month.name,
      totalBills: Math.floor(Math.random() * 800) + 200,
      totalAmount: parseFloat((Math.random() * 20000 + 5000).toFixed(2)),
    }));

    return {
      year,
      months: monthData,
      totalBills: monthData.reduce((sum, m) => sum + m.totalBills, 0),
      totalAmount: parseFloat(
        monthData.reduce((sum, m) => sum + m.totalAmount, 0).toFixed(2),
      ),
    };
  });
};

export const generateOrderCategoryWiseData = (): OrderCategoryWise[] => {
  return [
    {
      category: "Beverages",
      totalItems: 850,
      totalAmount: parseFloat((320 * 5.5 + 280 * 4 + 250 * 5.48).toFixed(2)),
      items: [
        { itemName: "Iced Caramel Latte", totalQty: 320, totalAmount: 1760 },
        { itemName: "Classic Lemonade", totalQty: 280, totalAmount: 1120 },
        { itemName: "Fruit Medley Smoothie", totalQty: 250, totalAmount: 1370 },
      ],
    },
    {
      category: "Appetizers",
      totalItems: 420,
      totalAmount: 2100,
      items: [
        { itemName: "Garlic Bread", totalQty: 180, totalAmount: 900 },
        { itemName: "Nachos", totalQty: 120, totalAmount: 720 },
        { itemName: "Spring Rolls", totalQty: 120, totalAmount: 480 },
      ],
    },
    {
      category: "Main Course",
      totalItems: 1150,
      totalAmount: 23000,
      items: [
        { itemName: "Grilled Salmon", totalQty: 450, totalAmount: 9000 },
        { itemName: "Beef Steak", totalQty: 400, totalAmount: 12000 },
        { itemName: "Chicken Alfredo", totalQty: 300, totalAmount: 6000 },
      ],
    },
    {
      category: "Desserts",
      totalItems: 310,
      totalAmount: 3100,
      items: [
        { itemName: "Chocolate Cake", totalQty: 150, totalAmount: 1500 },
        { itemName: "Ice Cream Sundae", totalQty: 160, totalAmount: 1280 },
        { itemName: "Cheesecake", totalQty: 60, totalAmount: 420 },
      ],
    },
  ];
};

// Expenses Data
export const generateMockExpenses = (
  page: number,
  limit: number,
): { data: Expense[]; hasMore: boolean } => {
  const startIndex = (page - 1) * limit;
  const totalExpenses = 500;

  const categories = [
    "Inventory Supply",
    "Utilities",
    "Maintenance",
    "Rent",
    "Salaries",
  ];
  const expenseNames = [
    "Fresh Vegetables & Meat",
    "Electricity Bill",
    "Kitchen Equipment Repair",
    "Monthly Premise Rent",
    "Staff Salaries",
  ];
  const vendors = [
    "Fresh Farms Co.",
    "Electricity Co.",
    "Maintenance Corp",
    "Landlord Inc.",
    "Payroll Services",
  ];

  const data: Expense[] = Array.from({ length: limit }, (_, i) => {
    const index = startIndex + i;
    if (index >= totalExpenses) return null;

    const categoryIndex = Math.floor(Math.random() * categories.length);
    const totalAmount =
      categoryIndex === 3 ? 4500 : Math.floor(Math.random() * 2000) + 500;
    const paidAmount =
      Math.random() > 0.3
        ? totalAmount
        : Math.floor(Math.random() * totalAmount);
    const dueAmount = totalAmount - paidAmount;

    return {
      id: `expense-${index}`,
      expenseId: `#EXP-${4400 + index}`,
      date: `24 Oct 2023`,
      category: categories[categoryIndex],
      expenseName: expenseNames[categoryIndex],
      totalAmount,
      paidAmount,
      dueAmount,
      vendor: vendors[categoryIndex],
      description: `Monthly expense for ${expenseNames[categoryIndex].toLowerCase()}`,
    };
  }).filter(Boolean) as Expense[];

  return {
    data,
    hasMore: startIndex + limit < totalExpenses,
  };
};

export const generateExpenseDateWiseData = (
  page: number,
  limit: number,
): { data: any[]; hasMore: boolean } => {
  const allDates: any[] = [];
  for (let i = 1; i <= 100; i++) {
    const date = new Date(2023, 9, i);
    allDates.push({
      date: date
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        .replace(/ /g, "-")
        .toUpperCase(),
      totalBills: Math.floor(Math.random() * 50) + 5,
      totalAmount: parseFloat((Math.random() * 3000 + 500).toFixed(2)),
    });
  }

  const startIndex = (page - 1) * limit;
  const data = allDates.slice(startIndex, startIndex + limit);

  return {
    data,
    hasMore: startIndex + limit < allDates.length,
  };
};

export const generateExpenseMonthWiseData = () => {
  const years = [2023, 2024];

  return years.map((year) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const monthData = months.map((month) => ({
      month,
      totalBills: Math.floor(Math.random() * 50) + 10,
      totalAmount: parseFloat((Math.random() * 15000 + 2000).toFixed(2)),
    }));

    return {
      year,
      months: monthData,
      totalBills: monthData.reduce((sum, m) => sum + m.totalBills, 0),
      totalAmount: parseFloat(
        monthData.reduce((sum, m) => sum + m.totalAmount, 0).toFixed(2),
      ),
    };
  });
};

// Purchases Data
export const generateMockPurchases = (
  page: number,
  limit: number,
): { data: Purchase[]; hasMore: boolean } => {
  const startIndex = (page - 1) * limit;
  const totalPurchases = 300;

  const suppliers = [
    "Fresh Farms",
    "Meat Suppliers Inc",
    "Beverage Co",
    "Spice Traders",
    "Dairy Products Ltd",
  ];
  const ingredients = [
    "Fresh Vegetables",
    "Beef",
    "Coffee Beans",
    "Spices",
    "Milk",
    "Chicken",
    "Fruits",
  ];

  const data: Purchase[] = Array.from({ length: limit }, (_, i) => {
    const index = startIndex + i;
    if (index >= totalPurchases) return null;

    const quantity = Math.floor(Math.random() * 100) + 10;
    const unitPrice = Math.floor(Math.random() * 50) + 5;
    const totalAmount = quantity * unitPrice;
    const paidAmount =
      Math.random() > 0.2
        ? totalAmount
        : Math.floor(Math.random() * totalAmount);
    const dueAmount = totalAmount - paidAmount;

    return {
      id: `purchase-${index}`,
      purchaseId: `#PUR-${6000 + index}`,
      date: `24 Oct 2023`,
      supplier: suppliers[Math.floor(Math.random() * suppliers.length)],
      ingredient: ingredients[Math.floor(Math.random() * ingredients.length)],
      quantity,
      unitPrice,
      totalAmount,
      status: Math.random() > 0.3 ? "Delivered" : "Pending",
      paidAmount,
      dueAmount,
    };
  }).filter(Boolean) as Purchase[];

  return {
    data,
    hasMore: startIndex + limit < totalPurchases,
  };
};

export const generatePurchaseDateWiseData = (
  page: number,
  limit: number,
): { data: any[]; hasMore: boolean } => {
  const allDates: any[] = [];
  for (let i = 1; i <= 100; i++) {
    const date = new Date(2023, 9, i);
    allDates.push({
      date: date
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        .replace(/ /g, "-")
        .toUpperCase(),
      totalBills: Math.floor(Math.random() * 30) + 5,
      totalAmount: parseFloat((Math.random() * 8000 + 1000).toFixed(2)),
    });
  }

  const startIndex = (page - 1) * limit;
  const data = allDates.slice(startIndex, startIndex + limit);

  return {
    data,
    hasMore: startIndex + limit < allDates.length,
  };
};

export const generatePurchaseMonthWiseData = () => {
  const years = [2023, 2024];

  return years.map((year) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const monthData = months.map((month) => ({
      month,
      totalBills: Math.floor(Math.random() * 40) + 10,
      totalAmount: parseFloat((Math.random() * 25000 + 5000).toFixed(2)),
    }));

    return {
      year,
      months: monthData,
      totalBills: monthData.reduce((sum, m) => sum + m.totalBills, 0),
      totalAmount: parseFloat(
        monthData.reduce((sum, m) => sum + m.totalAmount, 0).toFixed(2),
      ),
    };
  });
};

// Inventory Data
export const generateMockInventory = (
  page: number,
  limit: number,
): { data: Inventory[]; hasMore: boolean } => {
  const items = [
    { name: "Tomatoes", category: "Vegetables", unitPrice: 2.5, threshold: 40 },
    { name: "Potatoes", category: "Vegetables", unitPrice: 1.8, threshold: 60 },
    { name: "Beef", category: "Meat", unitPrice: 12.5, threshold: 30 },
    { name: "Chicken", category: "Meat", unitPrice: 8.5, threshold: 35 },
    { name: "Coffee Beans", category: "Beverages", unitPrice: 15.0, threshold: 25 },
    { name: "Milk", category: "Dairy", unitPrice: 3.5, threshold: 50 },
    { name: "Flour", category: "Baking", unitPrice: 2.0, threshold: 70 },
    { name: "Sugar", category: "Baking", unitPrice: 2.2, threshold: 70 },
    { name: "Lettuce", category: "Vegetables", unitPrice: 1.5, threshold: 45 },
    { name: "Cheese", category: "Dairy", unitPrice: 6.0, threshold: 20 },
  ];

  const allItems: Inventory[] = [];

  for (let i = 0; i < 100; i++) {
    const item = items[i % items.length];
    const stockQuantity = Math.floor(Math.random() * 200) + 10;

    const stockAlertThreshold = item.threshold; // ✅ per-item threshold
    const stockAlert = stockQuantity <= stockAlertThreshold;
    const stockStatus = stockAlert ? "LOW STOCK" : "OK";

    const totalValue = stockQuantity * item.unitPrice;
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    allItems.push({
      id: `inv-${i}`,
      itemId: `#INV-${2000 + i}`,
      itemName: item.name,
      category: item.category,
      stockQuantity,
      stockAlertThreshold, // 👈 added
      stockAlert,
      stockStatus,
      unitPrice: item.unitPrice,
      totalValue: parseFloat(totalValue.toFixed(2)),
      lastUpdatedDate: date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      unit: i % 3 === 0 ? "kg" : i % 3 === 1 ? "liters" : "pieces",
    });
  }

  const startIndex = (page - 1) * limit;
  const data = allItems.slice(startIndex, startIndex + limit);

  return {
    data,
    hasMore: startIndex + limit < allItems.length,
  };
};



export const generateInventoryDateWiseData = (
  page: number,
  limit: number,
): { data: any[]; hasMore: boolean } => {
  const allDates: any[] = [];
  for (let i = 1; i <= 100; i++) {
    const date = new Date(2023, 9, i);
    allDates.push({
      date: date
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        .replace(/ /g, "-")
        .toUpperCase(),
      totalItems: Math.floor(Math.random() * 200) + 50,
      totalValue: parseFloat((Math.random() * 50000 + 10000).toFixed(2)),
    });
  }

  const startIndex = (page - 1) * limit;
  const data = allDates.slice(startIndex, startIndex + limit);

  return {
    data,
    hasMore: startIndex + limit < allDates.length,
  };
};

export const generateInventoryMonthWiseData = () => {
  const years = [2023, 2024];

  return years.map((year) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const monthData = months.map((month) => ({
      month,
      totalItems: Math.floor(Math.random() * 150) + 50,
      totalValue: parseFloat((Math.random() * 80000 + 20000).toFixed(2)),
    }));

    return {
      year,
      months: monthData,
      totalBills: monthData.reduce((sum, m) => sum + m.totalItems, 0),
      totalAmount: parseFloat(
        monthData.reduce((sum, m) => sum + m.totalValue, 0).toFixed(2),
      ),
    };
  });
};
