import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import type { RestaurantMenuItem } from "../api/restaurantPosApi";
import { getItemPrice } from "../api/restaurantPosApi";

interface Props {
  item: RestaurantMenuItem;
  qty: number;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onSetQty?: (qty: number) => void;
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

const ProductCard: React.FC<Props> = ({ item, qty, onAdd, onIncrement, onDecrement, onSetQty }) => {
  const price         = getItemPrice(item);
  const foodKey       = item.food_type?.toLowerCase() ?? "veg";
  const { dot, bg }   = FOOD_TYPE[foodKey] ?? FOOD_TYPE.veg;
  const initials      = item.menu_name.slice(0, 2).toUpperCase();
  const isUnavailable = !item.active;
  const hasVariant    = !!(item.variants && item.variants.length > 0);
  const inCart        = qty > 0;

  const [inputVal, setInputVal] = useState(String(qty));

  useEffect(() => {
    setInputVal(String(qty));
  }, [qty]);

  function commitInput() {
    const parsed = parseInt(inputVal, 10);
    if (!isNaN(parsed) && parsed > 0) {
      onSetQty?.(parsed);
    } else {
      setInputVal(String(qty));
    }
  }

  return (
    <Box
      onClick={() => !isUnavailable && onAdd()}
      sx={{
        bgcolor:       "#fff",
        borderRadius:  "12px",
        border:        inCart ? "2px solid #d32f2f" : "1.5px solid #ede8e8",
        overflow:      "hidden",
        cursor:        isUnavailable ? "not-allowed" : "pointer",
        opacity:       isUnavailable ? 0.5 : 1,
        transition:    "box-shadow 0.18s, border-color 0.18s, transform 0.18s",
        display:       "flex",
        flexDirection: "row",
        height:        { xs: 96, sm: 100, md: 110 },
        boxShadow:     inCart
          ? "0 0 0 3px rgba(211,47,47,0.1), 0 2px 8px rgba(0,0,0,0.07)"
          : "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "&:hover": isUnavailable ? {} : {
          boxShadow:   "0 4px 14px rgba(211,47,47,0.17)",
          borderColor: "#d32f2f",
          transform:   "translateY(-1px)",
        },
        userSelect: "none",
        position:   "relative",
      }}
    >
      {/* ── Left: image / placeholder ── */}
      <Box
        sx={{
          width:      { xs: 80, sm: 90, md: 100 },
          minWidth:   { xs: 80, sm: 90, md: 100 },
          flexShrink: 0,
          position:   "relative",
          overflow:   "hidden",
          bgcolor:    item.menu_image ? "#f5f5f5" : "#fdf2f2",
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
              transition: "transform 0.25s ease",
              ".MuiBox-root:hover &": { transform: "scale(1.06)" },
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
              background:     "linear-gradient(145deg, #fff5f5 0%, #fde8e8 100%)",
            }}
          >
            <Box
              sx={{
                width:          50,
                height:         50,
                borderRadius:   "50%",
                bgcolor:        "rgba(211,47,47,0.09)",
                border:         "1.5px solid rgba(211,47,47,0.2)",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize:      "1rem",
                  fontWeight:    700,
                  color:         "#c62828",
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

        {/* Cart count badge — top-right */}
        {inCart && (
          <Box
            sx={{
              position:       "absolute",
              top:            4,
              right:          4,
              minWidth:       17,
              height:         17,
              borderRadius:   "9px",
              bgcolor:        "#d32f2f",
              color:          "#fff",
              fontSize:       "0.55rem",
              fontWeight:     800,
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              px:             0.4,
              boxShadow:      "0 1px 3px rgba(211,47,47,0.5)",
              pointerEvents:  "none",
            }}
          >
            {qty}
          </Box>
        )}

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
        {/* Name */}
        <Typography
          sx={{
            fontSize:        "0.77rem",
            fontWeight:      600,
            color:           "#111827",
            lineHeight:      1.3,
            overflow:        "hidden",
            display:         "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            flex:            "1 1 auto",
          }}
        >
          {item.menu_name}
        </Typography>

        {/* Price */}
        <Typography
          sx={{
            fontSize:   "0.85rem",
            fontWeight: 800,
            color:      "#111827",
            lineHeight: 1,
            mt:         0.2,
          }}
        >
          ₹{price.toFixed(2)}
        </Typography>

        {/* Action row — right-aligned, fixed width for both Add and stepper */}
        {!isUnavailable && (
          <Box sx={{ mt: 0.65, display: "flex", justifyContent: "flex-end" }}>
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
                  width:        96,
                }}
              >
                <Box
                  onClick={() => onDecrement()}
                  sx={{
                    width:          30,
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
                  onClick={() => onIncrement()}
                  sx={{
                    width:          30,
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
                onClick={e => { e.stopPropagation(); onAdd(); }}
                sx={{
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  gap:            "4px",
                  height:         28,
                  width:          96,
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
  );
};

export default ProductCard;
