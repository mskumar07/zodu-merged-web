import React, { useRef } from "react";
import { Box, Chip, IconButton, Typography } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import {useAppDispatch} from "../../store/store"
import { setOrderMode, updateMenu } from "@store/slices/POSslice";

interface DineInTable {
  tableNumber: string | number;
}

interface HeldOrder {
  id: string;
}

interface OrderBarProps {
  activeDineInTableOrders: DineInTable[];
  heldOrders: HeldOrder[];
  orderMode: string;
  showHoldBar: boolean;
  retriveTableDetails: (tableNumber: string | number) => void;
  handleRestoreHeldOrder: (orderId: string) => void;
}

const OrderBar: React.FC<OrderBarProps> = ({
  activeDineInTableOrders,
  heldOrders,
  orderMode,
  showHoldBar,
  retriveTableDetails,
  handleRestoreHeldOrder,
}) => {
  const dineInScrollRef = useRef<HTMLDivElement | null>(null);
  const holdScrollRef = useRef<HTMLDivElement | null>(null);
  const dispatch = useAppDispatch();
  const handleScroll = (
    ref: React.RefObject<HTMLDivElement>,
    direction: "left" | "right"
  ) => {
    if (ref.current) {
      const scrollAmount = 200;
      ref.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Hide entire bar if no data
  if (
    activeDineInTableOrders.length === 0 &&
    (!showHoldBar || heldOrders.length === 0)
  )
    return null;

  return (
    <Box
      sx={{
        width: "98%",
        position: "sticky",
        bottom: "5%",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "center",
        gap: 1.5,
        backgroundColor: "#fff",
        borderRadius: "25px",
        p: 2,
        boxShadow: 3,
        zIndex: 1200,
      }}
    >
      {/* ---------- Active Dine-In Tables ---------- */}
      {activeDineInTableOrders.length > 0 && activeDineInTableOrders.filter((order)=>order.order_type === "Dine-In").length > 0 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            height: "60px",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, width: "120px" }}
          >
            Active Tables
          </Typography>

          {/* Left scroll */}
          <IconButton
            onClick={() => handleScroll(dineInScrollRef, "left")}
            sx={{
              color: "primary.main",
              backgroundColor: "#f5f5f5",
              borderRadius: "50%",
              "&:hover": { backgroundColor: "#e0e0e0" },
            }}
          >
            <ChevronLeft />
          </IconButton>

          {/* Scrollable list */}
          <Box
            ref={dineInScrollRef}
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 1.5,
              flex: 1,
              overflowX: "auto",
              overflowY: "hidden",
              scrollBehavior: "smooth",
              px: 1,
              flexWrap: "nowrap",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {activeDineInTableOrders.map((item) => (
              <Chip
                key={item.tableNumber}
                label={`Table ${item.tableNumber}`}
                // disabled={orderMode !== "DineIn"}
                onClick={() =>{ 
                  dispatch(setOrderMode("DineIn"))
                  retriveTableDetails(item.tableNumber)
                }}
                sx={{
                  backgroundColor: "primary.main",
                  color: "white",
                  fontWeight: 500,
                  flexShrink: 0,
                  height: "45px",
                  fontSize: "0.9rem",
                }}
              />
            ))}
          </Box>

          {/* Right scroll */}
          <IconButton
            onClick={() => handleScroll(dineInScrollRef, "right")}
            sx={{
              color: "primary.main",
              backgroundColor: "#f5f5f5",
              borderRadius: "50%",
              "&:hover": { backgroundColor: "#e0e0e0" },
            }}
          >
            <ChevronRight />
          </IconButton>
        </Box>
      )}

      {/* ---------- Held Orders ---------- */}
      {showHoldBar && heldOrders.length > 0 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            height: "60px",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, width: "120px" }}
          >
            Held Orders
          </Typography>

          {/* Left scroll */}
          <IconButton
            onClick={() => handleScroll(holdScrollRef, "left")}
            sx={{
              color: "primary.main",
              backgroundColor: "#f5f5f5",
              borderRadius: "50%",
              "&:hover": { backgroundColor: "#e0e0e0" },
            }}
          >
            <ChevronLeft />
          </IconButton>

          {/* Scrollable list */}
          <Box
            ref={holdScrollRef}
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 1.5,
              flex: 1,
              overflowX: "auto",
              overflowY: "hidden",
              scrollBehavior: "smooth",
              px: 1,
              flexWrap: "nowrap",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {heldOrders.map((held) => (
              <Chip
                key={held.id}
                label={held.id}
                sx={{
                  color: "black",
                  backgroundColor: "yellow",
                  width: "100px",
                  flexShrink: 0,
                  height: "45px",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                }}
                onClick={() => handleRestoreHeldOrder(held.id)}
              />
            ))}
          </Box>

          {/* Right scroll */}
          <IconButton
            onClick={() => handleScroll(holdScrollRef, "right")}
            sx={{
              color: "primary.main",
              backgroundColor: "#f5f5f5",
              borderRadius: "50%",
              "&:hover": { backgroundColor: "#e0e0e0" },
            }}
          >
            <ChevronRight />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default OrderBar;
