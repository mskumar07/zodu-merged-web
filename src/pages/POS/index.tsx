import {
  Box,
  Container,
  Grid,
  Backdrop,
  Chip,
  Button,
  CircularProgress,
} from "@mui/material";
import React, { useEffect, useState } from "react";

import CombinedFilterBar from "@components/CombinedFilterBar/index.tsx";
import CreateCustomerModal from "@components/Modals/CreateCustomerModal";
import OrderSummarySidebar from "@components/OrderSummary/OrderSummarySidebar";

import ProductAccordion from "@components/ProductAccordion/index.js";
import { generateOrderId, getProductPrice, calculateGroupedTax } from "../../utils/util.ts";
import type { Order } from "../../types/order";
import type { Product } from "../../types/product";
import {
  useDeleteHoldMenuMutation,
  useGetAllPOSDataQuery,
} from "@services/menuApi.ts";
import { useAppSelector, useAppDispatch } from "../../store/store.ts";
import { BranchId, ZoduId } from "@store/slices/userSlice.ts";
import {
  setSelectedProduct,
  toggleVariantModal,
  togglekgModal,
  OrderMode,
  setSelectedTable, //z-t77 active tabale number
  ActiveDineInTableOrders,
  updateActiveDineInTableOrders,
  setKgModalAction,
  SearchProduct,
} from "../../store/slices/POSslice.ts";
import { DiscountType, DiscountValue } from "@store/slices/POSslice.ts";
import { setOrderMode } from "@store/slices/POSslice.ts";
import {
  useHoldMenuMutation,
  useGetHoldMenuQuery,
  useAddTableKOTMutation,
} from "@services/menuApi.ts";
import { toast } from "react-toastify";
import { messageConstant } from "@config/messageConstants.tsx";
import { createHoldKOTPayload } from "@utils/createHoldPayload.ts";
import { transformHoldOrderResponse } from "@utils/transformHoldOrderResponse.ts";
import {OrderTypeConstant} from "@components/OrderSummary/OrderSummarySidebar.tsx";
import {generateOrderIdV2} from "@utils/util.ts";
import useDebounce from "@hooks/useDebounce.tsx";
import {enrichOrderItemsWithMenuData} from "@utils/util.ts";

export const MENU_UNIT_KG = "KG"; // Define constant for 'kg' unit

const splitMenuAndVariant = (menuName: string = "") => {
  const [baseName, ...variantParts] = menuName.split(" - ");
  return {
    baseMenuName: baseName?.trim() || menuName,
    derivedVariantName: variantParts.join(" - ").trim() || null,
  };
};

const mockOrder: Order = {
  id: generateOrderIdV2(),
  customerName: "John Doe",
  tableNumber: null,
  items: [],
  summaryItems: [],
  subtotal: 0,
  kotList: [],
  taxes: 0,
  discount: 0,
  total: 0,
};

export const emptyOrder: Order = {
  id: generateOrderIdV2(),
  customerName: "",
  tableNumber: null,
  items: [],
  kotList: [],
  subtotal: 0,
  taxes: 0,
  total: 0,
};

export interface ProductItem {
  product: {
    zodu_id: string;
    branch_id: string;
    menu_name: string;
    order_time: string;
    variants: any[]; // If you know structure, replace `any`
    category: string;
    sell_price: string;
    purchase_price: string;
    hsn_code: string;
    gst_tax: string;
    food_type: string;
    tax_include_or_exclude: string;
    productTotal: string;
    count: number;
    menu_image: string;
    menu_type: string;
    menu_unit: string;
    favorites: any | null; // Replace `any` if known
    active: boolean;
    menu_id: string;
    variant_id?: string;
    variant_name?: string;
  };
  quantity: number;
}

//Z-T76
import type { MenuCategory, MenuItem } from "../../types/menuItem.ts";
import {
  useCompleteKOTMutation,
  useGetTableKOTQuery,
} from "@store/services/menuApi.ts"; //z-t77 get table kot
import { transformBackendOrderToOrder } from "@utils/orderTransform.ts"; //z-t77 transform kot data to order
import OrderBar from "./OrderBar.tsx";

/**
/**
 * Find menu item(s) by product list and return category structure
 * @param data - full menu data
 * @param products - array of product objects to search
 */
export function findMenuItemsByProducts(
  data: MenuCategory[],
  products: (Product | string)[]

): MenuCategory[] {
  if (!products || products.length === 0) {
    return data;
  }

  // normalize to lowercase names safely
const productNames = new Set<string>();
const  menuIdSet = new Set<string>();
if (Array.isArray(products)) {
  products.forEach((p) => {
    const name =
      typeof p === "string" ? p : p?.name;

    if (name) productNames.add(name.toLowerCase());
  });
} else if (products?.name) {
  productNames.add(products.name.toLowerCase());
  if (products?.id) menuIdSet.add(products.id);
}

return data
    .map((category) => {
      // const matchedItems: MenuItem[] = category.items.filter((item) =>
      //   productNames.has(item.menu_name?.toLowerCase()) || menuIdSet.has(item.menu_id)
      // );

      const matchedItems: MenuItem[] = category.items.filter((item) => {
      const menuName = item.menu_name?.toLowerCase() ?? "";
      const menuID = item.menu_id?.toLowerCase() ?? "";

      const nameMatch = Array.from(productNames).some((searchTerm) =>
      {
        return menuName.includes(searchTerm.toLowerCase()) || menuID.includes(searchTerm.toLowerCase())
      }
      );

      const idMatch = menuIdSet.has(item.menu_id);

      return nameMatch || idMatch;
    });


      if (matchedItems.length > 0) {
        return {
          name: category.name,
          items: matchedItems,
        };
      }
      return null;
    })
    .filter((c): c is MenuCategory => c !== null);

}

const POSScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [order, setOrder] = React.useState<Order>(mockOrder);
  const [formData, setFormData] = React.useState({
      name: "",
      phone: "",
      email: "",
      address: "",
  });
  console.log("POSSCREEN order", order)
  const [showCustomerModal, setShowCustomerModal] = React.useState(false);
  const [showHoldOrderModal, setShowHoldOrderModal] = React.useState(false);
  const [isCustomerDetailsSubmitted, setIsCustomerDetailsSubmitted] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState("Card");
  // const [searchProducts, setSearchProducts] = React.useState<Product[]|null>(null);
  const searchProducts = useAppSelector(SearchProduct);
  console.log("searchProduct from store:",  searchProducts);
  const debouncedSearchProduct = useDebounce(searchProducts, 300);


  const orderMode = useAppSelector(OrderMode);
  const activeDineInTableOrders = useAppSelector(ActiveDineInTableOrders);
  const branchId = useAppSelector(BranchId);
  const zoduId = useAppSelector(ZoduId);
  const selectedTable = useAppSelector((state) => state.pos.SelectedTable);
  const discountType = useAppSelector(DiscountType);
  const discountValue = useAppSelector(DiscountValue);
  const [
    addTableKOT,
    { isLoading: sendToKDSLoading, isError: isSendToKDSError, error },
  ] = useAddTableKOTMutation(); //Z-T77
  const [deleteHoldMenuMutation] = useDeleteHoldMenuMutation(); //Z-T97
  //Z-T97 Fetch Menu Data
  const {
    isLoading,
    data: menuData,
    isError: isMenuError,
    error: menuError,
  } = useGetAllPOSDataQuery(branchId);
  const menuItems: MenuCategory[] = menuData?.Data || [];
  const loading = isLoading || isMenuError;
  const menuList = menuItems.flatMap((category: MenuCategory) =>
    category.items.map((item: MenuItem) => ({
      id: item.menu_name,
      name: item.menu_name,
    }))
  );

  // ✅✅✅✅✅✅Lingesh Changes✅✅✅✅✅✅
  // const [heldOrder, setHeldOrder] = useState<Order | null>(null);
  const [showHoldBar, setShowHoldBar] = useState(false);
  const [heldOrders, setHeldOrders] = useState<
    { id: string; order: Order; tableNumber: number | null }[]
  >([]);
  //Z-T77 Fetch KOT data and transform to activeDineInTableOrders
  const { data: tableKOT, isLoading: isLoadingTableKOT } =
    useGetTableKOTQuery(branchId); //Z-T77
  //Z-T97
  const { data: holdOrders, isLoading: isLoadingHoldOrders } =
    useGetHoldMenuQuery(branchId);

  useEffect(() => {
    if (!isLoadingHoldOrders && holdOrders?.Data?.data?.length > 0) {
      // Transform each backend hold order to frontend format

      const TotalHoldOrders = holdOrders?.Data?.data;
      const transformedHoldOrders = TotalHoldOrders?.map((holdData: any) =>
        transformHoldOrderResponse(holdData)
      );

      // Update your state
      setHeldOrders(transformedHoldOrders);

      // ✅ If more than one hold order exists, perform reset actions
      if (transformedHoldOrders.length >= 1) {
        dispatch(setSelectedTable(null)); // Z-T77 clear selected table on hold
        setOrder(emptyOrder); // reset functionality
        setShowHoldBar(true);
      }
    } else {
      setHeldOrders([]);
    }
  }, [isLoadingHoldOrders, holdOrders]);
  //zodu-hotfix-01
  const [
    completeKot,
    {
      isLoading: completeKOTloading,
      isError: isCompleteKOTerror,
      error: completeKOTerror,
    },
  ] = useCompleteKOTMutation();
  const [holdMenuMutation] = useHoldMenuMutation(); //Z-T97
  useEffect(() => {
    if (!isLoadingTableKOT) {
      const transformedOrders = tableKOT?.Data.map((kotData: any) => {

        const response = enrichOrderItemsWithMenuData(menuData?.Data , kotData);
        const transformedOrder = transformBackendOrderToOrder(response);
        // dispatch(setActiveDineInTableOrders(transformedOrder));
        return transformedOrder;
      });
      dispatch(updateActiveDineInTableOrders(transformedOrders || []));
    }
  }, [isLoadingTableKOT, tableKOT]);
  // const [holdCounter, setHoldCounter] = useState(1);
  // Z-T76
  // const filteredMenuItems = React.useMemo(
  //   () => findMenuItemsByProducts(menuItems, searchProducts),
  //   [menuItems, searchProducts]
  // );

  const filteredMenuItems = React.useMemo(
  () =>
    findMenuItemsByProducts(
      menuItems,
      debouncedSearchProduct ? debouncedSearchProduct : []
    ),
  [menuItems, debouncedSearchProduct]
);

  useEffect(() => {
    // Reset Customer Date on orderMode change
    handleOrderTypeChange();

  },[orderMode])

  const handleOrderTypeChange = async() => {
      if(orderMode !== "Delivery" && isCustomerDetailsSubmitted) {
      setIsCustomerDetailsSubmitted(false);
      await handleSubmitCustomer({ name: "", phone: "" });
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
      })
    }
  }
  const [tab, setTab] = React.useState(0);

  const handleOpenVariantModal = () => {
    // setSelectedProduct(product);
    dispatch(toggleVariantModal());
  };

  const handleOpenKgModal = () => {
    // setSelectedProduct(product);
    dispatch(togglekgModal());
  };

  const handleCloseModal = () => {
    dispatch(toggleVariantModal());
    // setSelectedProduct(null);
  };
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(
    []
  );

  const categories = ["All", "Favourites"];
  const selectedMenu = useAppSelector((state) => state.pos.selectedMenu);

  // ---- Filter logic

  // const filteredProducts = products?.filter((p) => {
  //   const matchesCategory =
  //     selectedCategories.length === 0 ||
  //     selectedCategories.includes("All") ||
  //     selectedCategories.includes(p.category ?? "");
  //   const matchesSearch =
  //     searchProducts.length === 0 ||
  //     searchProducts.some((sp) => sp.id === p.id);
  //   return matchesCategory && matchesSearch;
  // });

  // Z-T77 udpated the Table Number
  const addItemToOrder = (product: MenuItem, tableNumber = null) => {
    setOrder((prev) => {
      // Update items
      let updatedItems;
      const existing = prev.items.find(
        (i) => i.product.menu_id === product.menu_id
      );

      if (existing) {
        updatedItems = prev.items.map((i) =>
          i.product.menu_id === product.menu_id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        updatedItems = [...prev.items, { product, quantity: 1 }];
      }

      // ✅ Recalculate subtotal
      console.log("updated Items", updatedItems)
      const subtotal = updatedItems.reduce((sum, item) => {
        const price = getProductPrice(item.product);
        console.log("Price for item", item.product.menu_name, price)
        return (
          sum +
          (item.product.menu_unit === "kg"
            ? Number(price)
            : Number(price) * Number(item.quantity))
        );
      }, 0);

      // ✅ Recalculate total
      const total = subtotal + (prev.taxes || 0) - (prev.discount || 0);
      const totalTax = calculateGroupedTax(updatedItems)[0]?.taxAmount || 0;
      console.log("Calculated Taxes:", totalTax);
      return {
        ...prev,
        tableNumber: prev?.tableNumber || tableNumber,
        items: updatedItems,
        kotList: prev?.kotList || [],
        taxes:totalTax,
        subtotal,
        total,
      };
    });
  };
 
  // handle on select
  const handleSelectProduct = (product: any) => {
    console.log("Selected Product:", product);
    if (
      product?.variants &&
      product?.variants !== null &&
      product?.variants.length > 0
    ) {
      handleOpenVariantModal();
      dispatch(setSelectedProduct(product));
      setTab(0)
    } else if (product?.menu_unit === MENU_UNIT_KG) {
      handleOpenKgModal();
      dispatch(setSelectedProduct(product));
      dispatch(setKgModalAction("edit"));
      setTab(0)

    } else {
      //Z-T77 if orderMode is DineIn send the tableNumber else not
      addItemToOrder(product);
      setTab(0);
    }
  };

  //OLD Quantity Change Handler new is Below
  // const handleQuantityChange = (productId: string, qty: number, product: MenuItem, variantId: string | null) => {
  //   if (product?.menu_unit === MENU_UNIT_KG) {
  //     handleOpenKgModal();
  //     dispatch(setSelectedProduct(product));
  //     dispatch(setKgModalAction("add"));
  //     return;
  //   }
  //   if (product?.variants && product?.variants.length > 0) {
  //     handleOpenVariantModal();
  //     dispatch(setSelectedProduct(product));
  //     // dispatch(setVariantModalAction("edit"));
  //     return;
  //   }
  //   const calulatedSubtotal = (items: ProductItem[]) =>{
  //     return items.reduce(
  //       (sum, item) =>
  //         sum +
  //         (item.product.menu_id === productId
  //           ? getProductPrice(item.product) * qty
  //           : getProductPrice(item.product) * item.quantity),
  //       0
  //     );
  //   };
  //   setOrder((prev) => ({
  //     ...prev,
  //     items: prev.items.map((item) =>
  //       item.product.menu_id === productId ? { ...item, quantity: qty } : item
  //     ),
  //     subtotal: calulatedSubtotal(prev.items),
  //     total:
  //       calulatedSubtotal(prev.items) +
  //       (prev.taxes || 0) -
  //       (prev.discount || 0),
  //   }));
  // };

  const handleQuantityChange = (
  productId: string,
  qty: number,
  product: MenuItem,
  variantId: string | null
) => {
  // KG flow stays unchanged
  if (product?.menu_unit === MENU_UNIT_KG) {
    handleOpenKgModal();
    dispatch(setSelectedProduct(product));
    dispatch(setKgModalAction("add"));
    return;
  }

  // Variant selection flow stays unchanged
  if (product?.variants && product?.variants.length > 0 && !variantId) {
    handleOpenVariantModal();
    dispatch(setSelectedProduct(product));
    return;
  }

  const calculateSubtotal = (items: ProductItem[]) => {
    return items.reduce((sum, item) => {
      const isTarget = variantId
        ? item.product.menu_id === productId &&
          item.product.variant_id === variantId
        : item.product.menu_id === productId;

      const price = getProductPrice(item.product);
      const quantity = isTarget ? qty : item.quantity;

      return sum + price * quantity;
    }, 0);
  };

  setOrder((prev) => {
    const updatedItems = prev.items.map((item) => {
      // Variant-specific update
      if (
        variantId &&
        item.product.menu_id === productId &&
        item.product.variant_id === variantId
      ) {
        return { ...item, quantity: qty };
      }

      // Non-variant update (old behavior)
      if (!variantId && item.product.menu_id === productId) {
        return { ...item, quantity: qty };
      }

      return item;
    });

    const subtotal = calculateSubtotal(updatedItems);
    const totalTax = calculateGroupedTax(updatedItems)[0]?.taxAmount || 0;
    console.log("Calculated Taxes:", totalTax);
    return {
      ...prev,
      items: updatedItems,
      subtotal,
      taxes: totalTax,
      total: subtotal + (prev.taxes || 0) - (prev.discount || 0),
    };
  });
};


  const handleRemoveItem = (productId: string, product: MenuItem, variantId: string | null) => {
    
    setOrder((prev) => {
      const updatedItems = prev.items.filter((i) => {
        // Case 1: Variant exists → remove only that variant
        if (variantId) {
          return !(
            i.product.menu_id === productId &&
            i.product.variant_id === variantId
          );
        }

        // Case 2: No variant → remove all items with same menu_id
        return i.product.menu_id !== productId;
      });
      const totalTax = calculateGroupedTax(updatedItems)[0]?.taxAmount || 0;
      const updatedTotal = updatedItems.reduce((sum, item) => {
        const price = getProductPrice(item.product);
        return (
          sum +
          (item.product.menu_unit === "kg"
            ? Number(price)
            : Number(price) * Number(item.quantity))
        );
      }, 0);
      return { ...prev, items: updatedItems, subtotal: updatedTotal, taxes: totalTax };
    });
  };
  {/*Z-T97*/}
  const handleSummaryQuantityChange = (productId: string, qty: number, product: MenuItem, variantId: string | null) => {
    if (product?.menu_unit === MENU_UNIT_KG) {
      handleOpenKgModal();
      dispatch(setSelectedProduct(product));
      dispatch(setKgModalAction("add"));
      return;
    }
   
    if (product?.variants && product?.variants.length > 0 && !variantId) {
      handleOpenVariantModal();
      dispatch(setSelectedProduct(product));
      // dispatch(setVariantModalAction("edit"));
      return;
    }
  setOrder((prev) => {
    // const updatedSummaryItems = prev.summaryItems.map((item) => {
    //   if (item.product.menu_id === productId) {
    //     const updatedTotal = getProductPrice(item.product) * qty;
    //     return {
    //       ...item,
    //       quantity: qty,
    //       product: {
    //         ...item.product,
    //       productTotal: updatedTotal.toString(), // update productTotal
    //       },
    //     };
    //   }
    //   return item;
    // });

     const updatedSummaryItems = prev.summaryItems.map((item) => {
      // Variant-specific update
      if (
        variantId &&
        item.product.menu_id === productId &&
        item.product.variant_id === variantId
      ) {
        const updatedTotal = getProductPrice(item.product) * qty;
        return {
          ...item,
          quantity: qty,
          product: {
            ...item.product,
            productTotal: updatedTotal.toString(),
          },
        };
      }

      // Non-variant update
      if (!variantId && item.product.menu_id === productId) {
        const updatedTotal = getProductPrice(item.product) * qty;
        return {
          ...item,
          quantity: qty,
          product: {
            ...item.product,
            productTotal: updatedTotal.toString(),
          },
        };
      }

      return item;
    });

    // Recalculate subtotal
    const newSubtotal = updatedSummaryItems.reduce(
      (sum, item) => sum + getProductPrice(item.product) * item.quantity,
      0
    );
    const totalTax = calculateGroupedTax(updatedSummaryItems)[0]?.taxAmount || 0;

    return {
      ...prev,
      summaryItems: updatedSummaryItems,
      subtotal: newSubtotal,
      taxes: totalTax,
      total: newSubtotal + (prev.taxes || 0) - (prev.discount || 0),
    };
  });
};


    const handleSummaryRemoveItem = (productId: string, product: MenuItem, variantId: string|null) => {
    // if (product?.menu_unit === MENU_UNIT_KG) {
    //   handleOpenKgModal();
    //   dispatch(setSelectedProduct(product));
    //   dispatch(setKgModalAction("remove"));
    //   return;
    // }
    setOrder((prev) => {
      const updatedItems = prev.summaryItems.filter((i) => {
        // Case 1: Variant exists → remove only that variant
        if (variantId) {
          return !(
            i.product.menu_id === productId &&
            i.product.variant_id === variantId
          );
        }

        // Case 2: No variant → remove all items with same menu_id
        return i.product.menu_id !== productId;
      });
      const updatedTotal = updatedItems.reduce((sum, item) => {
        const price = getProductPrice(item.product);
        return (
          sum +
          (item.product.menu_unit === "kg"
            ? Number(price)
            : Number(price) * Number(item.quantity))
        );
      }, 0);
      const totalTax = calculateGroupedTax(updatedItems)[0]?.taxAmount || 0;
      return { ...prev, summaryItems: updatedItems, subtotal: updatedTotal, taxes: totalTax };
    });
  };

  /**
   * Get the order-type
   * Get the order items
   * Get the table number
   */
  const OrderIsValidToProcced = () => {
    if (
      orderMode === "DineIn" &&
      (order.tableNumber === null || order.tableNumber === null) &&
      order.kotList.length < 1
    ) {
      toast.error(messageConstant.failure.NO_TABLE_SELECTED);
      return false;
    } else if (orderMode !== "DineIn" && order.items.length < 1) {
      toast.error(messageConstant.failure.NO_PRODUCT);
      return false;
    } else {
      return true;
    }
  };

  const isOrderSendToKDSBeforePayment = () => {
    // Check if any item in the order has kotList entry
    if (orderMode === "DineIn") {
      const hasSentToKDS = order.kotList && order.kotList.length > 0;
      return hasSentToKDS;
    } else {
      return true; // For non-DineIn orders, we assume it's valid
    }
  };
  //complete Payment for DineIn
  const completePaymentForDineIn = async (order: Order) => {
    try {
      console.log("mydata",order.summaryItems)
      const formattedSummaryItems = order.summaryItems.map((item) => {
        const selectedVariant = item.product.variants?.find(
          (v: any) =>
            v.id === item.product.variant_id ||
            v.variant_id === item.product.variant_id
        );
        const { baseMenuName, derivedVariantName } = splitMenuAndVariant(
          item.product.menu_name
        );

        return {
          menu_id: item.product.menu_id,
          name: baseMenuName,
          price: Number(item.product.sell_price), // ensure number
          image: item.product.menu_image || null,
          tax: 5, // static for now, can be dynamic later
          qty: item.quantity,
          variant_id:
            item.product.variant_id ||
            selectedVariant?.variant_id ||
            selectedVariant?.id ||
            null,
          variant_name:
            item.product.variant_name ||
            selectedVariant?.variant_name ||
            derivedVariantName,
          tax_inclusive:
            item.product.tax_include_or_exclude === null
              ? false
              : item.product.tax_include_or_exclude,
        };
      });
      console.log("Order Details", order)
      await completeKot({
        api_order_id: order.id,
        zodu_id: zoduId, //TO-DO updpate this static value Z-T77
        branch_id: branchId, //TO-DO updpate this static value Z-T77
        tableNumber: order.tableNumber || 0,
        items: formattedSummaryItems,
        "discount_type": discountType==="Amount"? "FLAT":"PERCENT",
        "discount_value": discountValue,
        totalAmount: order.total,
        paymentType: paymentMethod,
      }).unwrap();

       setOrder(emptyOrder);
       dispatch(setSelectedTable(null)); //Z-T77 clear selected table on checkout
       toast.success(messageConstant.success.PAID_SUCCESS);
    } catch (error) {
      console.log(isCompleteKOTerror);

      toast.error(messageConstant.failure.PAYMENT_FAILED);
    }
  };

  const buildDeliveryPickUpPayload = (KOT: Order): any => {
    const SelectedItems = KOT.items.map((item) => {

    // 🔥 Find the selected variant using product.variant_id
    const selectedVariant = item.product.variants?.find(
      (v: any) =>
        v.id === item.product.variant_id ||
        v.variant_id === item.product.variant_id
    );
console.log("sss",item.product.menu_name)
    const { baseMenuName, derivedVariantName } = splitMenuAndVariant(
      item.product.menu_name
    );
    return {
      menu_id: item.product.menu_id,
      menu_unit: item.product.menu_unit,
      tax: Number(item.product.gst_tax),
      image: item.product.menu_image,

      // Better item name
      name: baseMenuName,

      price: selectedVariant
        ? Number(selectedVariant.price)
        : Number(item.product.sell_price),

      qty: item.quantity,

      tax_inclusive:
        item.product.tax_include_or_exclude ?? false,

      variant_id:
        item.product.variant_id ||
        selectedVariant?.variant_id ||
        selectedVariant?.id ||
        null,
      variant_name:
        item.product.variant_name ||
        selectedVariant?.variant_name ||
        derivedVariantName,
    };
  });

    console.log("Ordeer Details", KOT)
    const kotPayload: any = {
      zodu_id: zoduId, //TO-DO updpate this static value Z-T77
      branch_id: branchId, //TO-DO updpate this static value Z-T77                                   // or dynamic based on your logic
      table_no: selectedTable || 0,
      "discount_type": discountType==="Amount"? "FLAT":"PERCENT",
      "discount_value": discountValue,
      order_type: OrderTypeConstant[orderMode] || OrderTypeConstant.DineIn, // or from order if available
      // order_id: generateOrderIdV2(), removed orderId as 15/02/2026
      items: SelectedItems,
      no_of_items: SelectedItems.length,
      total_amt: KOT.total,
      final_payment: true, // or true if needed
      order_date: new Date().toISOString().split("T")[0],
      order_time: new Date().toLocaleTimeString("en-GB"),
      customer_name: KOT.customerName || "",
      customer_phone: KOT.customerPhone || "", // if you have it in order
    };
    return kotPayload;
  };

  //complete Payment for Deliverry
  const completePaymentForDeliveryAndPickup = async (order: Order) => {
    try {
      const payload = buildDeliveryPickUpPayload(order);

      const response = await addTableKOT(payload).unwrap();
      console.log(response, "response", "order", order);
      await deleteHoldMenuMutation(order.id).unwrap(); //Z-T97 delete hold order after complete payment
      setOrder(emptyOrder);
      dispatch(setSelectedTable(null)); //Z-T77 clear selected table on checkout
      toast.success(messageConstant.success.PAID_SUCCESS);
    } catch (error) {
      console.warn(error);
      toast.error(messageConstant.failure.PAYMENT_FAILED);
    }
  };

  //Zodu-hotfix-01
  const handleCheckout = async () => {
    //adding validation to the checkout function
    if (!OrderIsValidToProcced()) {
      return;
    }
    if (!isOrderSendToKDSBeforePayment()) {
      toast.error(messageConstant.failure.SEND_KOT_TO_KDS);
      return;
    }

    if (orderMode === "DineIn") {
      console.log("Order", order)
      await completePaymentForDineIn(order);
      return;
    } else if (orderMode === "Delivery" || orderMode === "PickUp") {
      await completePaymentForDeliveryAndPickup(order);
      return;
    } else {
      toast.error(messageConstant.failure.INVALID_ORDER_TYPE);
      return;
    }
  };

  const handleSubmitCustomer = async (customerData: any) => {
    try {
      console.log(customerData, "customerData");
      console.log("Order", order);
      const payload = {
        ...order,
        customerName: customerData.name,
        customerPhone: customerData.phone,
        final_payment: false,
      };
      const updatedPayload = buildDeliveryPickUpPayload(payload);
      const response = await addTableKOT(updatedPayload).unwrap();
      if(customerData?.name && customerData?.phone){
        setIsCustomerDetailsSubmitted(true);
      }else{
        setIsCustomerDetailsSubmitted(false);
      }
      return response;
    } catch (error) {
      console.log(error, "error in the data");
      throw error;
    }
  };

  const handleResumeOrder = () => {
    setShowHoldOrderModal(false);
  };

  //activeDineInTableOrders
  const retriveTableDetails = (tableNumber: number) => {
    const orderDetails = activeDineInTableOrders.find(
      (order) =>
        order.tableNumber != null && // ensures not null or undefined
        order.tableNumber === tableNumber
    );

    console.log("activeDineInTableOrders", activeDineInTableOrders)
    if (orderDetails) {
      console.log("orderDetails", orderDetails)
      dispatch(setSelectedTable(tableNumber));
      const updateOrderItemDetails = orderDetails?.items?.map(
        (order: ProductItem) => ({
          product: {
            ...order.product,
            productTotal: Number(order.product.sell_price) * order.quantity,
            sell_price: order.product.sell_price,
          },
          quantity: order.quantity,
        })
      );
      setOrder({
        ...orderDetails,
        summaryItems: updateOrderItemDetails,
        items: [],
      });
      setTab(1);
    }
  };
  // ✅Lingesh
  // const handleHoldOrder = () => {
  //   if (order.items.length === 0) return;
  //   const holdID = `HOLD${holdCounter}`;

  //   setHeldOrders((prev) => [...prev, { id: holdID, order }]);
  //   setOrder(emptyOrder); // reset functionality
  //   setHoldCounter((prev) => prev + 1);
  //   setShowHoldBar(true);
  // };
  const handleHoldOrder = async () => {
    if (order.items.length === 0) {
      toast.error(messageConstant.failure.NO_PRODUCT);
      return;
    }
    if (!OrderIsValidToProcced()) {
      return;
    }
    try {
      const usedHoldNum = heldOrders.map((ho) =>
        Number(ho.id.replace("HOLD", ""))
      );
      let nextHoldNum = 1;
      while (usedHoldNum.includes(nextHoldNum)) {
        nextHoldNum++;
      }
      const holdID = `HOLD${nextHoldNum}`;
      const holdPayload = createHoldKOTPayload(order);
      await addHoldDataToDB({
        ...holdPayload,
        orderType: OrderTypeConstant[orderMode] || OrderTypeConstant.DineIn,
      });

      setHeldOrders((prev) => [
        ...prev,
        { id: holdID, order, tableNumber: order.tableNumber || null },
      ]);
      dispatch(setSelectedTable(null)); //Z-T77 clear selected table on hold
      setOrder(emptyOrder); // reset functionality
      setShowHoldBar(true);
    } catch (error) {
      console.error("Unable to creaate hold record");
    }
  };
  console.log("Search Products:", searchProducts);
  const addHoldDataToDB = async (payload: any) => {
    try {
      // Wrap your API call inside toast.promise
      const response = await toast.promise(
        holdMenuMutation(payload).unwrap(), // returns a promise
        {
          pending: `${messageConstant.pending.ADDING_HOLD}`,
          success: `${messageConstant.success.HOLD_SUCCESS}`,
          error: `${messageConstant.failure.HOLD_ERROR}`,
        }
      );

      return response;
    } catch (error) {
      console.error("Failed to hold order:", error);
      return null;
    }
  };

  const handleRestoreHeldOrder = (holdID: string) => {
    const held = heldOrders.find((ho) => ho.id === holdID);
    if (!held) return;
    setOrder(held.order);
    let orderMode = held.order.order_type;
    if (orderMode === "Takeaway" || orderMode === "Pickup") {
      orderMode = "PickUp";
    }
    dispatch(setOrderMode(orderMode || "DineIn"));
    dispatch(setSelectedTable(held.tableNumber)); //Z-T77 clear selected table on hold
    // setHeldOrders((prev) => prev.filter((ho) => ho.id !== holdID)); remove this to keep the hold order even after restore Z-T97
    if (heldOrders.length < 1) {
      setShowHoldBar(false);
    }
  };

  return (
    <Container maxWidth={false} sx={{ py: 2, height: "100vh" }}>
      <Grid container spacing={2} sx={{ px: 3, height: "100%" }}>
        {/* Main Content - Left Side */}
        <Grid size={{ xs: 12, md: 8.5 }}>
          <Box
            sx={{
              display: "flex",
              // position: "relative",
              flexDirection: "column",
              gap: 2,
            }}>
            {/* Filter Bar (search/chips) */}
            <CombinedFilterBar
              products={menuList} //Z-T76
              categories={categories}
              selectedCategories={selectedCategories}
              onCategoryChange={setSelectedCategories}
              searchValue={searchProducts}
              // onSearchChange={setSearchProducts}
            />
            {/* Product Grid below! */}
            <Box
              sx={{
                maxHeight: "calc(80vh-100px)", // position: "relative",
              }}>
              {/* <ProductGrid
                products={filteredProducts}
                onSelect={handleSelectProduct}
              /> */}
              <ProductAccordion
                // categories={menuReport}
                categories={filteredMenuItems} //Z-T76 filtered menu's
                onSelect={handleSelectProduct}
                activeCategory={selectedMenu}
                order={order}
                setOrder={setOrder}
                showHoldBar={heldOrders.length > 0}
                heldOrders={heldOrders}
                onRestoreHeldOrder={handleRestoreHeldOrder}
              />
            </Box>
          </Box>
          <OrderBar
            activeDineInTableOrders={activeDineInTableOrders}
            heldOrders={heldOrders}
            orderMode={orderMode}
            showHoldBar={showHoldBar}
            retriveTableDetails={retriveTableDetails}
            handleRestoreHeldOrder={handleRestoreHeldOrder}
          />
        </Grid>
        {/* Order Summary Sidebar - Right Side */}
        <Grid  size={{ xs: 12, md: 3.5 }} sx={{ height: "100%" }}>
          <Box
            sx={{
              position: "sticky",
              top: 0,
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
            >
            <OrderSummarySidebar
              order={order}
              formData={formData}
              setFormData={setFormData}
              // setOrder={}
              onQuantityChange={handleQuantityChange}
              onRemoveItem={handleRemoveItem}
              onCheckout={handleCheckout}
              paymentLoading={completeKOTloading || sendToKDSLoading} //zodu-htofix-01
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              setOrder={setOrder}
              tab={tab}
              setTab={setTab}
              onHold={handleHoldOrder}
              handleSummaryRemoveItem={handleSummaryRemoveItem}
              handleSummaryQuantityChange={handleSummaryQuantityChange}
              heldOrders={heldOrders}
              setOrderFromHold={(order: any) => setOrder(order)}
              setShowCustomerModal={setShowCustomerModal}
            />
          </Box>
        </Grid>
      </Grid>
      {/* Modals */}
      <CreateCustomerModal
        open={showCustomerModal}
        formData={formData}
        setFormData={setFormData}
        onClose={() => setShowCustomerModal(false)}
        onSubmit={handleSubmitCustomer}
      />
      {/* Loader Modal */}
      <Backdrop
        open={loading || isLoadingTableKOT}
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.modal + 1,
        }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Container>
  );
};

export default POSScreen;

