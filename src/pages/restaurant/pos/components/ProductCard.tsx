import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import type { RestaurantMenuItem } from "../api/restaurantPosApi";
import { getItemPrice, isKgUnit } from "../api/restaurantPosApi";

interface Props {
  item: RestaurantMenuItem;
  qty: number;
  onAdd: (item: RestaurantMenuItem) => void;
  onIncrement: (item: RestaurantMenuItem) => void;
  onDecrement: (item: RestaurantMenuItem) => void;
  onSetQty?: (item: RestaurantMenuItem, qty: number) => void;
  /** POS setting "Show Item Images". Off: no photo column — the price and the
   *  Add / stepper share one row under the name. */
  showImage?: boolean;
}

const FOOD_TYPE: Record<string, { dot: string; bg: string }> = {
  veg:     { dot: "#16a34a", bg: "#dcfce7" },
  non_veg: { dot: "#dc2626", bg: "#fee2e2" },
  egg:     { dot: "#d97706", bg: "#fef3c7" },
};

/* Global style injected once to remove number input spinners */
const spinnerStyle =
  "input[data-qty-spin-qty]::-webkit-outer-spin-button," +
  "input[data-qty-spin-qty]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}" +
  "input[data-qty-spin-qty]{-moz-appearance:textfield}";

if (typeof document !== "undefined" && !document.getElementById("qty-spin-qty-style")) {
  const s = document.createElement("style");
  s.id = "qty-spin-qty-style";
  s.textContent = spinnerStyle;
  document.head.appendChild(s);
}

const ProductCard: React.FC<Props> = ({ item, qty, onAdd, onIncrement, onDecrement, onSetQty, showImage = true }) => {
  const price         = getItemPrice(item);
  const foodKey       = item.food_type?.toLowerCase().replace(/[\s-]+/g, "_") ?? "veg";
  const { dot, bg }   = FOOD_TYPE[foodKey] ?? FOOD_TYPE.veg;
  const initials      = item.menu_name.slice(0, 2).toUpperCase();
  const isUnavailable = !item.active;
  const hasVariant    = !!(item.variants && item.variants.length > 0);
  const isKg          = isKgUnit(item.menu_unit);
  const inCart        = qty > 0;

  const [inputVal, setInputVal] = useState(String(qty));

  useEffect(() => {
    setInputVal(String(qty));
  }, [qty]);

  function commitInput() {
    const parsed = isKg ? parseFloat(inputVal) : parseInt(inputVal, 10);
    if (!isNaN(parsed) && parsed > 0) {
      onSetQty?.(item, parsed);
    } else {
      setInputVal(String(qty));
    }
  }

  return (
    <Box
      onClick={() => { if (!isUnavailable) { onAdd(item); } }}
      sx={{
        bgcolor:       "#fff",
        borderRadius:  "12px",
        // Same border width in and out of the cart — only the colour changes — so
        // selecting a card never grows it or nudges its contents.
        border:        `1.5px solid ${inCart ? "#d32f2f" : "#ede8e8"}`,
        overflow:      "hidden",
        cursor:        isUnavailable ? "not-allowed" : "pointer",
        opacity:       isUnavailable ? 0.5 : 1,
        transition:    "box-shadow 0.18s, border-color 0.18s",
        display:       "flex",
        flexDirection: "row",
        // No photo column → let the card shrink to its content instead of
        // reserving the image height.
        height:        showImage ? { xs: 84, sm: 88, md: 92 } : "auto",
        boxShadow:     inCart
          ? "0 2px 8px rgba(211,47,47,0.12)"
          : "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "&:hover": isUnavailable ? {} : {
          boxShadow:   "0 4px 14px rgba(211,47,47,0.17)",
          borderColor: "#d32f2f",
        },
        userSelect: "none",
        position:   "relative",
      }}
    >
      {/* ── Left: image / placeholder ── */}
      {showImage && (
      <Box
        sx={{
          width:      { xs: 76, sm: 84, md: 92 },
          minWidth:   { xs: 76, sm: 84, md: 92 },
          flexShrink: 0,
          position:   "relative",
          overflow:   "hidden",
          // bgcolor:    "#f5f5f5",
        }}
      >
        {item.menu_image ? (
          <Box
            component="img"
            src={item.menu_image}
            alt={item.menu_name}
            sx={{
              width:      "100%",
              height:     "100%",
              objectFit:  "cover",
              display:    "block",
            }}
          />
        ) : (
          <Box
            sx={{
              width:          "100%",
              height:         "100%",
              display:        "flex",
              alignItems:     "center",
                justifyContent: "center",
                             background:     "linear-gradient(145deg, #f9fafb 0%, #f1f2f4 100%)",

            }}
          >
            <Box
              sx={{
                width:          50,
                height:         50,
                borderRadius:   "50%",
                bgcolor:        "#fff",
                border:         "1.5px solid rgba(107,114,128,0.2)",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize:      "1rem",
                  fontWeight:    700,
                   color:         "#6b7280",
                  letterSpacing: "0.04em",
                  lineHeight:    1,
                }}
              >
                {initials}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Food-type badge — bottom-left */}
        <Box
          sx={{
            position:       "absolute",
            bottom:         4,
            left:           4,
            width:          13,
            height:         13,
            borderRadius:   "3px",
            bgcolor:        bg,
            border:         `1.5px solid ${dot}`,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
          }}
        >
          <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: dot }} />
        </Box>

        {isUnavailable && (
          <Box
            sx={{
              position:       "absolute",
              inset:          0,
              bgcolor:        "rgba(255,255,255,0.88)",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
            }}
          >
            <Typography sx={{ fontSize: "0.58rem", fontWeight: 700, color: "#9ca3af", textAlign: "center" }}>
              Off Menu
            </Typography>
          </Box>
        )}
      </Box>
      )}

      {/* ── Right: content ── */}
      <Box
        sx={{
          flex:          1,
          display:       "flex",
          flexDirection: "column",
          px:            1.2,
          pt:            0.9,
          pb:            0.8,
          minWidth:      0,
        }}
      >
        {/* Name — with the food-type mark in front when there is no photo column */}
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.6, flex: "0 0 auto", minWidth: 0 }}>
        {!showImage && (
          <Box
            sx={{
              mt:             "2px",
              width:          13,
              height:         13,
              flexShrink:     0,
              borderRadius:   "3px",
              bgcolor:        bg,
              border:         `1.5px solid ${dot}`,
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
            }}
          >
            <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: dot }} />
          </Box>
        )}
        <Typography
          sx={{
            fontSize:        "0.77rem",
            fontWeight:      800,
            color:           "#111827",
            lineHeight:      1.3,
            // Always reserve two lines so price + Add sit at the same height on every card
            minHeight:       "2.6em",
            overflow:        "hidden",
            display:         "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            flex:            "1 1 auto",
            textTransform:   "uppercase",
          }}
        >
          {item.menu_name}
        </Typography>
        </Box>

        {/* Price + action — one row, price left; pinned to the card's bottom when there is a photo column */}
        <Box
          sx={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            gap:            1,
            mt:             showImage ? "auto" : 0.8,
          }}
        >

        {/* Price */}
        <Typography
          sx={{
            fontSize:   "0.85rem",
            fontWeight: 600,
            color:      "#111827",
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          ₹{price.toFixed(2)}
        </Typography>

        {/* Action row — right-aligned; Add and stepper share a width of up to 96px, and
            shrink on a narrow card rather than pushing out over its border */}
        {!isUnavailable && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", flex: "0 1 96px", minWidth: 0 }}>
            {inCart && !hasVariant ? (
              /* Stepper — same width as Add button */
              <Box
                onClick={e => e.stopPropagation()}
                sx={{
                  display:      "flex",
                  alignItems:   "center",
                  borderRadius: "7px",
                  border:       "1.5px solid #d32f2f",
                  overflow:     "hidden",
                  height:       28,
                  width:        "100%",
                }}
              >
                <Box
                  onClick={() => onDecrement(item)}
                  sx={{
                    width:          { xs: 24, md: 30 },
                    height:         "100%",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    color:          "#d32f2f",
                    fontWeight:     700,
                    fontSize:       "1rem",
                    bgcolor:        "#fff",
                    cursor:         "pointer",
                    flexShrink:     0,
                    "&:hover":      { bgcolor: "#fef2f2" },
                  }}
                >
                  −
                </Box>

                {/* Typeable qty — global style removes spinners */}
                <Box
                  component="input"
                  type="number"
                  data-qty-spin-qty
                  value={inputVal}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputVal(e.target.value)}
                  onBlur={commitInput}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") commitInput(); }}
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  sx={{
                    flex:       1,
                    width:      "50px",
                    height:     "100%",
                    border:     "none",
                    outline:    "none",
                    bgcolor:    "#d32f2f",
                    color:      "#fff",
                    fontWeight: 800,
                    fontSize:   "0.75rem",
                    textAlign:  "center",
                    cursor:     "text",
                    fontFamily: "inherit",
                    minWidth:   0,
                  }}
                />

                <Box
                  onClick={() => onIncrement(item)}
                  sx={{
                    width:          { xs: 24, md: 30 },
                    height:         "100%",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    color:          "#d32f2f",
                    fontWeight:     700,
                    fontSize:       "1rem",
                    bgcolor:        "#fff",
                    cursor:         "pointer",
                    flexShrink:     0,
                    "&:hover":      { bgcolor: "#fef2f2" },
                  }}
                >
                  +
                </Box>
              </Box>
            ) : (
              /* Add button — same width as stepper */
              <Box
                onClick={e => { e.stopPropagation(); onAdd(item); }}
                sx={{
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  gap:            "4px",
                  height:         28,
                  width:          "100%",
                  minWidth:       0,
                  border:         "1.5px solid #d32f2f",
                  borderRadius:   "7px",
                  color:          "#d32f2f",
                  bgcolor:        "#fff",
                  cursor:         "pointer",
                  transition:     "background 0.15s, color 0.15s",
                  "&:hover":      { bgcolor: "#d32f2f", color: "#fff" },
                  whiteSpace:     "nowrap",
                }}
              >
                <AddIcon sx={{ fontSize: 13, flexShrink: 0 }} />
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, lineHeight: 1 }}>
                  {hasVariant ? "Choose" : "Add"}
                </Typography>
              </Box>
            )}
          </Box>
        )}
        </Box>
      </Box>
    </Box>
  );
};

// Memoized: the menu grid can hold hundreds of these, and only the item/qty
// props actually change per card — everything else (order type, cart totals,
// panel state) lives in sibling components and shouldn't force a re-render here.
export default React.memo(ProductCard);
