import React from "react";
import { Box, Grid, Button, Typography, IconButton } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { useAppSelector } from "../../store/store";
import { DiscountType, DiscountValue } from "@store/slices/POSslice";
import {
  updateDiscountType,
  updateDiscountValue,
} from "@store/slices/POSslice";
import OrderTypeSelector from "./OrderTypeSelector";
import OrderInfoSection from "./OrderInfoSection";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
// import OrderProductListSection from "./OrderProductListSection";
// import OrderProductListItem from "./OrderProductListItem";
// import SummarySection from "./SummarySection";
import PaymentMethodSelector from "./PaymentMethodSelector";
import CashInputSection from "./CashInputSection";
import PaidButton from "./PaidButton";
import type { Order, KOT, OrderItem } from "../../types/order";
import SelectTableModal from "@components/OrderSummary/SelectTableModal";
import type { KotData, KotItem } from "@store/services/menuApi";
import {
  OrderMode,
  setOrderMode,
  SelectedTable,
  setSelectedTable,
  ActiveDineInTableOrders,
  setActiveDineInTableOrders,
  setSearchProduct,
} from "@store/slices/POSslice.ts";
import OrderSection from "./OrderSection";
import { useAddTableKOTMutation } from "@store/services/menuApi";
import { generateOrderIdV2 } from "@utils/util";
import { toast } from "react-toastify";
import { messageConstant } from "@config/messageConstants";

interface SidebarProps {
  order: Order;
  onQuantityChange: (productId: string, qty: number) => void;
  onRemoveItem: (productId: string) => void;
  handleSummaryRemoveItem: (productId: string) => void; //Z-T97
  handleSummaryQuantityChange: (productId: string, qty: number) => void; //Z-T97
  onCheckout: () => void;
  paymentLoading: boolean; //Zodu-hotfix-01
  tab: number;
  setTab: (tab: number) => void;
  paymentMethod: string;
  setPaymentMethod: (paymentMethod: string) => void;
  onHold: () => void;
  formData?: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
  };
  setFormData?: (data: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
  }) => void;

  // New props for HOLD/RESTORE
  heldOrders: { id: string; order: Order }[];
  setOrderFromHold: (order: Order) => void;
}
["DineIn", "Delivery", "PickUp"];
export const OrderTypeConstant: { [key: string]: string } = {
  DineIn: "Dine-In",
  PickUp: "Takeaway",
  Delivery: "Delivery",
};
const OrderSummarySidebar: React.FC<SidebarProps> = ({
  order,
  onQuantityChange,
  setOrder,
  formData,
  setFormData,
  onRemoveItem,
  tab,
  setTab,
  onCheckout,
  paymentLoading, //zodu-hotfix-01
  paymentMethod,
  setPaymentMethod,
  handleSummaryRemoveItem,
  handleSummaryQuantityChange,
  onHold,
  setShowCustomerModal,
}) => {
  const orderType: string = useSelector(OrderMode); //Z-T77
  const activeDineInTableOrders = useSelector(ActiveDineInTableOrders);
  const selectedTable: number | null = useSelector(SelectedTable); //Z-T77
  const orderMode: string = useSelector(OrderMode); //Z-T77
  const discountType = useAppSelector(DiscountType);
  const discountValue = useAppSelector(DiscountValue);
  const [
    addTableKOT,
    { isLoading: sendToKDSLoading, isError: isSendToKDSError, error },
  ] = useAddTableKOTMutation(); //Z-T77
  const dispatch = useDispatch(); //Z-T77
  const setOrderType = (orderType: string) => {
    dispatch(setOrderMode(orderType));
  };

  //activeDineInTableOrders
  const retriveTableDetails = (tableNumber: number) => {
    const orderDetails = activeDineInTableOrders.find(
      (order) =>
        order.tableNumber != null && // ensures not null or undefined
        order.tableNumber === tableNumber,
    );

    if (orderDetails) {
      setOrder({ ...orderDetails, items: [] });
      setTab(1); // Switch to Summary tab on table selection
    } else {
      setOrder({
        id: generateOrderIdV2(), //z-T77
        customerName: "John Doe",
        tableNumber: tableNumber,
        items: [],
        subtotal: 0,
        kotList: [],
        taxes: 5,
        discount: 0,
        total: 0,
      });
    }
  };

  /**
   * if select table is null -> update state, dispatch table
   * if selectTable has already have a value now current TableId is different
   * setTotalOrder state to reduxstore as activeDineInTableOrders
   * setmockORder
   */
  const selectTable = (tableId: number) => {
    //if tableIs is already selected then throw error
    const isRunning = activeDineInTableOrders.some(
      (order) => order.tableNumber === tableId,
    );
    if (selectedTable === null && !isRunning) {
      setOrder({ ...order, tableNumber: tableId });
      dispatch(setSelectedTable(tableId));
    } else if (isRunning) {
      retriveTableDetails(tableId);
      dispatch(setSelectedTable(tableId));
    } else {
      retriveTableDetails(tableId);
      dispatch(setSelectedTable(tableId));
    }
  };

  const [cashReceived, setCashReceived] = React.useState<number>(0);
  const [open, setOpen] = React.useState(false);
  // Discount modal state, etc.
  // Discount handling
  const [discountModalOpen, setDiscountModalOpen] = React.useState(false);

  const discountAmount =
    discountType === "Percent"
      ? ((order.subtotal ?? 0) * discountValue) / 100
      : discountValue;

  const grandTotal =
    (order.subtotal ?? 0) - discountAmount + (order.taxes ?? 0);

  const onChangeDiscountValue = () => {
    const discountAmount =
      discountType === "Percent"
        ? ((order.subtotal ?? 0) * discountValue) / 100
        : discountValue;

    const newGrandTotal =
      (order.subtotal ?? 0) - discountAmount + (order.taxes ?? 0);
    setOrder({ ...order, total: newGrandTotal });
  };

  React.useEffect(() => {
    onChangeDiscountValue();
  }, [discountValue, discountType]);

  const buildKOTData = (KOTNUMBER: string, KOT: Order): KotData => {
    console.log("Building KOT Data with order:", KOT);
    const kotItems = KOT.items.map((item) => ({
      menu_id: item.product.menu_id,
      variant_id: item.product.variant_id,
      menu_unit: item.product.menu_unit,
      tax: Number(item.product.gst_tax),
      image: item.product.menu_image,
      name: item.product.menu_name,
      price: Number(item.product.sell_price),
      qty: item.quantity,
      tax_inclusive:
        item.product.tax_include_or_exclude === null
          ? false
          : item.product.tax_include_or_exclude, //Z-T97
    }));
    const kotPayload: KotData = {
      zodu_id: "ZODU035", //TO-DO updpate this static value Z-T77
      branch_id: "ZODU035B1", //TO-DO updpate this static value Z-T77
      kot_no: KOTNUMBER, // or dynamic based on your logic
      table_no: selectedTable || 0,
      order_type: OrderTypeConstant[orderMode] || OrderTypeConstant.DineIn, // or from order if available
      // order_id: order.id, Removed as per update on 15-02-2026
      items: kotItems,
      no_of_items: kotItems.length,
      total_amt: order.total,
      final_payment: false, // or true if needed
      order_date: new Date().toISOString().split("T")[0],
      order_time: new Date().toLocaleTimeString("en-GB"),
      customer_name: order.customerName || "",
      customer_phone: "", // if you have it in order
    };
    return kotPayload;
  };

  //Z-T77 Add the KOT details to the Database
  const addKOTToDatabase = async (payload: KotData) => {
    try {
      const response = await toast.promise(
        addTableKOT(payload).unwrap(), // must return a promise
        {
          pending: `${messageConstant.pending.ADDING_KOT}`,
          success: `${messageConstant.success.KOT_SUCCESS}`,
          error: `${messageConstant.failure.KOT_ERROR}`,
        },
      );

      // Check if response contains errors
      if (response?.errors) {
        throw new Error(response.errors);
      }

      console.log("KOT added to database:", response);
      return response;
    } catch (error) {
      console.error("Error adding KOT to database:", error);
      throw error; // Re-throw to ensure toast shows error
    }
  };

  const sendToKDS = async () => {
    console.log("send to KDS clicked", order);
    console.log("send to KDS clicked", order.kotList);
    if (!order.items || order.items.length === 0) {
      toast.error(messageConstant.failure.NO_PRODUCT);
      return;
    }

    if (order.tableNumber === null) {
      toast.error(messageConstant.failure.NO_TABLE_SELECTED);
      return;
    }

    const isKOTListPresent = order.kotList?.length > 0;
    let newOrderItems: any[] = [];

    if (isKOTListPresent) {
      // Map previous KOT items
      const previousItemMap = new Map<string, { qty: number; price: number }>();

      order.kotList.forEach((kot) => {
        kot.items.forEach((i: any) => {
          const id = i.product.menu_id;
          const existing = previousItemMap.get(id) || { qty: 0, price: 0 };

          if (i.product.menu_unit === "kg") {
            previousItemMap.set(id, {
              qty: existing.qty + Number(i.quantity),
              price: existing.price + Number(i.product.sell_price),
            });
          } else {
            previousItemMap.set(id, {
              qty: existing.qty + Number(i.quantity),
              price: existing.price,
            });
          }
        });
      });

      // Compare current items with previous KOT items
      order.items.forEach((item) => {
        const prev = previousItemMap.get(item.product.menu_id) || {
          qty: 0,
          price: 0,
        };

        if (item.product.menu_unit === "kg") {
          const currentQty = Number(item.quantity);
          const currentPrice = Number(item.product.sell_price);

          const diffQty = currentQty - prev.qty;
          const diffPrice = currentPrice - prev.price;

          if (diffQty > 0 && diffPrice > 0) {
            newOrderItems.push({
              ...item,
              quantity: diffQty,
              product: {
                ...item.product,
                sell_price: diffPrice,
              },
            });
          }
        } else {
          const currentQty = Number(item.quantity);
          newOrderItems.push({
            ...item,
            quantity: currentQty,
          });
          // const diffQty = currentQty - prev.qty;
          // if (diffQty > 0) {
          //   newOrderItems.push({
          //     ...item,
          //     quantity: diffQty,
          //   });
          // }
        }
      });

      if (newOrderItems.length === 0) {
        alert("No new or updated items to send");
        return;
      }

      const KOTNUMBER = order.kotList.length + 1;
      const newKOT = genrateKOTBasedOnOrder(newOrderItems, KOTNUMBER);

      const kotPayload = buildKOTData(`KOT-${KOTNUMBER}`, {
        ...order,
        items: newOrderItems,
      }); //Z-T77
      try {
      } catch (error) {
        console.error("Error building KOT data:", error);
      }
      await addKOTToDatabase(kotPayload); //Z-T77
      dispatch(
        setActiveDineInTableOrders({
          ...order,
          kotList: [...order.kotList, newKOT],
        }),
      );
    } else {
      // First KOT for this table
      const KOTNUMBER = 1;
      const newKOT = genrateKOTBasedOnOrder(order.items, KOTNUMBER);
      const kotPayload = buildKOTData(`KOT-${KOTNUMBER}`, order);
      await addKOTToDatabase(kotPayload); //Z-T77
      dispatch(setActiveDineInTableOrders({ ...order, kotList: [newKOT] }));
    }

    // Reset UI but keep store synced
    dispatch(setSelectedTable(null));
    setOrder({
      id: generateOrderIdV2(), //z-T77
      customerName: "John Doe",
      tableNumber: null,
      items: [],
      subtotal: 0,
      kotList: [],
      taxes: 5,
      discount: 0,
      total: 0,
    });
  };

  const isDisabled = order.items.length < 1;

  console.log("OrderSummarySidebar rendered with order:", order);

  //Z-T77
  const removeDuplicatesForKOT = (
    KOTList: KOT[] | [],
    orderItems: OrderItem[],
  ): OrderItem[] => {
    if (KOTList.length === 0) {
      return orderItems;
    }
    const existingMenuIds = new Set(
      KOTList.flatMap((kot) => kot.items.map((item) => item.product.menu_id)),
    );

    return orderItems.filter(
      (item) => !existingMenuIds.has(item.product.menu_id),
    );
  };

  //Z-T77
  const genrateKOTBasedOnOrder = (
    orderItems: OrderItem[],
    KOTNUMBER: number,
  ): KOT => {
    return {
      kotId: `KOT-${KOTNUMBER}`, // example: KOT-1, KOT-2
      items: orderItems,
      time: new Date().toLocaleDateString("en-GB"), // for record
      status: "pending",
    };
  };

  return (
    <Box
      sx={{
        // width: 350,
        p: 0.5,
        bgcolor: "background.paper",
        height: "93%",
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        // gap: 2,
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        <OrderTypeSelector orderType={orderType} onChange={setOrderType} />

        <Box
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {orderType === "DineIn" ? (
            <OrderInfoSection orderId={order.id} tableName={selectedTable} />
          ) : orderType === "Delivery" ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Typography variant="subtitle2">Add Customer:</Typography>
              <IconButton
                disabled={isDisabled}
                onClick={() => setShowCustomerModal(true)}
                sx={{
                  border: "1px solid red",
                  borderRadius: "10px",
                  width: "40px",
                  height: "40px",
                  padding: 0.5,
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  opacity: isDisabled ? 0.4 : 1,
                  pointerEvents: isDisabled ? "none" : "auto",
                  backgroundColor: isDisabled
                    ? "action.disabledBackground"
                    : "transparent",
                }}
              >
                <PersonAddAltIcon color="primary" fontSize="medium" />
              </IconButton>
              {/* <Box sx={{
          border:"1px solid red",
          padding:0.5,
          borderRadius:"10px",
          width:"40px",
          display:"flex",
          alignItems:"center",
          justifyContent:"center",
          cursor:"pointer"
         }} onClick={() => setShowCustomerModal(true)} disabled={order.items.length < 1}><PersonAddAltIcon color="primary" fontSize="medium"/></Box> */}
            </Box>
          ) : (
            ""
          )}
          <Box></Box>
          {/* <Button
            variant="outlined"
            size="small"
            onClick={onHold}
            sx={{ height: 32, width: "30%" }}
            disabled={!onHold}
          >
            Hold
          </Button> */}
        </Box>
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          mt: 1,
        }}
      >
        <OrderSection
          order={order}
          setOrder={setOrder}
          tab={tab}
          setTab={setTab}
          orderType={orderType}
          discountType={discountType}
          discountValue={discountValue}
          selectedTable={selectedTable}
          discountModalOpen={discountModalOpen}
          setDiscountModalOpen={setDiscountModalOpen}
          handleSummaryQuantityChange={handleSummaryQuantityChange}
          handleSummaryRemoveItem={handleSummaryRemoveItem}
          onRemoveItem={onRemoveItem}
          onQuantityChange={onQuantityChange}
        />
      </Box>
      {/* {((orderType === "DineIn" && tab !== 1) || orderType !== "DineIn") && (
        <PaymentMethodSelector
          paymentMethod={paymentMethod}
          onChange={setPaymentMethod}
        />
      )} */}
      <Box
        sx={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 1 }}
      >
        {paymentMethod === "Cash" && (
          <CashInputSection
            cashReceived={cashReceived}
            setCashReceived={setCashReceived}
            grandTotal={grandTotal}
          />
        )}
        {((orderType === "DineIn" && tab === 1) || orderType !== "DineIn") && (
          <>
            <PaymentMethodSelector
              paymentMethod={paymentMethod}
              onChange={setPaymentMethod}
            />
            <PaidButton
              onCheckout={async () => {
                await onCheckout();
                setCashReceived(0);
                setPaymentMethod("Card");
                setFormData &&
                  setFormData({
                    name: "",
                    phone: "",
                    email: "",
                    address: "",
                  });
                dispatch(setSearchProduct(null)); // z-i36
                dispatch(updateDiscountType("Percent")); // z-i36
                dispatch(updateDiscountValue(0)); // z-i36
              }}
              paymentLoading={paymentLoading}
            />
          </>
        )}
        {/*Table and send to KDS button Z-T77*/}
        {orderType === "DineIn" && tab !== 1 && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 3 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => setOpen(true)}
              >
                Table
              </Button>
            </Grid>
            <Grid size={{ xs: 9 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={sendToKDS}
                disabled={
                  selectedTable === null ||
                  order.items.length === 0 ||
                  sendToKDSLoading
                }
              >
                Send to KDS
              </Button>
            </Grid>
          </Grid>
        )}
      </Box>
      <SelectTableModal
        open={open}
        onClose={() => setOpen(false)}
        tableName={selectedTable}
        selectTable={selectTable}
        activeDineInTableOrders={activeDineInTableOrders}
      />
    </Box>
  );
};

export default OrderSummarySidebar;
