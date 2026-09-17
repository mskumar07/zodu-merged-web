import { Box } from "@mui/material";
import { PAPER_COLUMNS, type Slip } from "@utils/kot/kotTicket";

/**
 * The slip exactly as the printer lays it out: the same monospace lines the
 * ESC/POS encoder sends, one character per column, double-size lines doubled.
 */
export default function KotSlipPreview({ slip }: { slip: Slip }) {
  const cols = PAPER_COLUMNS[slip.paper];
  return (
    <Box
      sx={{
        // `ch` is one monospace character, so the paper is exactly `cols` wide.
        width: `calc(${cols}ch + 24px)`,
        maxWidth: "100%",
        overflowX: "auto",
        mx: "auto",
        px: "12px",
        py: 2,
        bgcolor: "#fff",
        color: "#111",
        fontFamily: '"Courier New", "Noto Sans Mono", monospace',
        fontSize: 12,
        lineHeight: 1.35,
        boxShadow: "0 1px 2px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.08)",
        borderRadius: "2px",
      }}
    >
      {slip.lines.map((line, i) => (
        <Box
          key={i}
          component="div"
          sx={{
            whiteSpace: "pre",
            fontWeight: line.bold ? 700 : 400,
            fontSize: line.size === 2 ? "2em" : "1em",
            lineHeight: line.size === 2 ? 1.2 : 1.35,
            // A double-size line holds half the columns in the same paper width.
            width: line.size === 2 ? `${cols / 2}ch` : `${cols}ch`,
            overflow: "hidden",
          }}
        >
          {line.text || " "}
        </Box>
      ))}
    </Box>
  );
}
