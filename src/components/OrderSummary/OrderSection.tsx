//Z-T77
import React, { useEffect, useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import OrderProductListItem from "./OrderProductListItem";
import SummarySection from "./SummarySection";
import KOTListCards from "./KOTListCards";
import { useGetTableKOTQuery } from "@store/services/menuApi";

const groupedKOT = (data:any) => {
  
  return data.kot_items.reduce((acc: Record<string, KOT>, curr) => {
    const kotId = curr.kot_no;

    if (!acc[kotId]) {
      acc[kotId] = {
        kotId,
        items: [],
        time: new Date().toLocaleTimeString(), // or any real time value
        status: "pending",
      };
    }

    acc[kotId].items.push({
      product: { menu_name: curr.item_name },
      quantity: curr.qty,
    });

    return acc;
  }, {})
};

export default function OrderSection({
  order,
  setOrder,
  orderType,
  tab,
  setTab,
  discountType,
  discountValue,
  onQuantityChange,
  onRemoveItem,
  handleSummaryQuantityChange,
  handleSummaryRemoveItem,
  discountModalOpen,
  setDiscountModalOpen,
  selectedTable,
}: any) {
  console.log("OrderSection order", setOrder);
  const { data: tableKOT, isLoading: isLoadingTableKOT } = useGetTableKOTQuery("ZODU035B1"); //Z-T77
  const [kotList, setKotList] = useState<any>(tableKOT || []); //Z-T77
  const getKOTForSelectedTable = () => {
    if (!tableKOT || !selectedTable) return [];
  
    return tableKOT.Data.filter(
      (kot: any) => Number(kot.table_no) === Number(selectedTable)
    ).map((kot: any) => groupedKOT(kot));
  }
  useEffect(() => {
    if (isLoadingTableKOT) return;
    const filteredKOT = getKOTForSelectedTable();
    const formatted = filteredKOT.flatMap(obj => Object.values(obj));
    setKotList(formatted);
  }, [tableKOT, selectedTable, isLoadingTableKOT]);
  return (
    <>
      {orderType === "DineIn" ? (
        <Box  
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            minHeight: 0, // 🔥 critical for scrolling
          }}
        >
          {/* Tabs Header */}
          <Tabs
            sx={{ width: "100%" }}
            variant="fullWidth"
            value={tab}
            onChange={(_, newValue) => setTab(newValue)}
          >
            <Tab label="Order" />
            <Tab label="Summary" />
          </Tabs>

          {/* Tab Content */}
          {tab === 0 && (
            <Box mt={2} 
             sx={{
    height: "100%",              // 🔥 must inherit from parent
    display: "flex",
    flexDirection: "column",
    minHeight: 0,                // 🔥 critical
  }}
            >
              {/* 👇 Whole block goes in first tab */}
              <Box
                sx={{
                  flexGrow: 1,
                  minHeight: 0, // 🔥 prevents flex overflow
                  // height: "70vh", //z-T77 adjust height as needed
                  // height: "60vh", //z-T77 adjust height as needed 
                  overflowY: "auto", // vertical scroll only when needed
                  overflowX: "hidden", // optional: hide horizontal scroll
                  scrollbarWidth: "thin", // for Firefox
                  "&::-webkit-scrollbar": {
                    width: "8px", // scrollbar width
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#aaa", // scrollbar color
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: "#f1f1f1", // track color
                  },
                }}
              >
                {order.items.map((item: any) => (
                  <OrderProductListItem
                    key={item.product.id}
                    item={item}
                    onQuantityChange={(qty) =>
                      onQuantityChange(item.product.menu_id, qty, item.product, item.product?.variant_id ?? null )
                    }
                    onRemove={() => onRemoveItem(item.product.menu_id, item.product,  item.product?.variant_id ?? null )}
                  />
                ))}
              </Box>

              {/* <SummarySection
                order={order}
                discountType={discountType}
                discountValue={discountValue}
                onDiscountTypeChange={setDiscountType}
                onDiscountValueChange={setDiscountValue}
                discountModalOpen={discountModalOpen}
                setDiscountModalOpen={setDiscountModalOpen}
              /> */}
            </Box>
          )}

          {
            tab === 1 && (
              <Box mt={2}
              sx={{
                height: "100%",
                display: "flex",
                overflow: "hidden",
                flexDirection: "column",
                minHeight: 0, // 🔥 critical for scrolling
              }}
              >
              {/* 👇 Whole block goes in first tab */}
              <Box
                sx={{
                   flexGrow: 1,
                  overflowY: "auto",
                  // overflowX: "hidden",
                  minHeight: 0,          // 🔥 prevents overflow bug
                  scrollbarWidth: "thin", // for Firefox
                  "&::-webkit-scrollbar": {
                    width: "8px", // scrollbar width
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#aaa", // scrollbar color
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: "#f1f1f1", // track color
                  },
                }}
              >
                {order?.summaryItems?.map((item: any) => (
                  <OrderProductListItem
                    key={item.product.id}
                    item={item}
                    onQuantityChange={(qty) =>
                      handleSummaryQuantityChange(item.product.menu_id, qty, item.product, item.product?.variant_id ?? null)
                    }
                    onRemove={() => handleSummaryRemoveItem(item.product.menu_id, item.product, item.product?.variant_id ?? null )}
                    isSummary={true}
                  />
                ))}
              </Box>
               <Box sx={{ flexShrink: 0 }}>
              <SummarySection
                order={order}
                setOrder={setOrder}
                discountType={discountType}
                discountValue={discountValue}
                discountModalOpen={discountModalOpen}
                setDiscountModalOpen={setDiscountModalOpen}
              />
              </Box>
            </Box>
            )
          }

          {tab === 2 && (
            <Box>
            <Box
              mt={2}
              // sx={{ maxHeight: "430px", height: "600px", overflow: "scroll" }}
            >
              {/* 👇 Second tab content (custom summary tab view) */}
              <KOTListCards kotList={kotList} />
            </Box>
            
               <SummarySection
                order={order}
                discountType={discountType}
                discountValue={discountValue}
                // onDiscountTypeChange={setDiscountType}
                // onDiscountValueChange={setDiscountValue}
                discountModalOpen={discountModalOpen}
                setDiscountModalOpen={setDiscountModalOpen}
              />
            </Box>
          )}
        </Box>
      ) : (
        // Non-DineIn → Just render the block as is (no tabs)
        <Box
           sx={{
    height: "100%",
    display: "flex",
    flexDirection: "column",
    minHeight: 0, // 🔥 critical for scrolling
  }}
        >
          <Box sx={{ 
                  flexGrow: 1,
                  overflowY: "auto",
                  minHeight: 0, // 🔥 prevents flex overflow
                  scrollbarWidth: "thin", // for Firefox
                  "&::-webkit-scrollbar": {
                    width: "8px", // scrollbar width
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#aaa", // scrollbar color
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: "#f1f1f1", // track color
                  },
                   }}>
            {order.items.map((item: any) => (
              <OrderProductListItem
                key={item.product.id}
                item={item}
                onQuantityChange={(qty) =>
                  onQuantityChange(item.product.menu_id, qty, item.product, item.product?.variant_id ?? null )
                }
                onRemove={() => onRemoveItem(item.product.menu_id, item.product,  item.product?.variant_id ?? null)}
              />
            ))}
          </Box>
          <Box sx={{ flexShrink: 0 }}>
          <SummarySection
            order={order}
            setOrder={setOrder}
            discountType={discountType}
            discountValue={discountValue}
            // onDiscountTypeChange={setDiscountType}
            // onDiscountValueChange={setDiscountValue}
            discountModalOpen={discountModalOpen}
            setDiscountModalOpen={setDiscountModalOpen}
          />
          </Box>
        </Box>
      )}
    </>
  );
}
