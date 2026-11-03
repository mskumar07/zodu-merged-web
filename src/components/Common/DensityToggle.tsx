/**
 * DensityToggle.tsx
 * Three-way row-density switch (Compact / Default / Comfortable) for a table toolbar.
 * The choice is saved and applies to every DataTable.
 */
import { ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import DensitySmallIcon from "@mui/icons-material/DensitySmall";
import DensityMediumIcon from "@mui/icons-material/DensityMedium";
import DensityLargeIcon from "@mui/icons-material/DensityLarge";
import { TABLE_DENSITIES, isDensity, useTableDensityPreference, type TableDensity } from "@utils/tableDensity";

const ICONS: Record<TableDensity, typeof DensitySmallIcon> = {
  compact:     DensitySmallIcon,
  default:     DensityMediumIcon,
  comfortable: DensityLargeIcon,
};

function DensityToggle({ height = 38 }: { height?: number }) {
  const [density, setDensity] = useTableDensityPreference();
  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={density}
      onChange={(_, v) => { if (isDensity(v)) setDensity(v); }}
      aria-label="Row density"
      sx={{
        height, bgcolor: "white", flexShrink: 0,
        "& .MuiToggleButton-root": { px: 1, color: "#6B7280", borderColor: "#D1D5DB" },
        "& .Mui-selected": { color: "#D32F2F !important", bgcolor: "#FEF2F2 !important" },
      }}
    >
      {(Object.keys(TABLE_DENSITIES) as TableDensity[]).map((d) => {
        const Icon = ICONS[d];
        const spec = TABLE_DENSITIES[d];
        return (
          <Tooltip key={d} title={`${spec.label} rows (${spec.rowHeight}px)`}>
            <ToggleButton value={d} aria-label={spec.label}>
              <Icon sx={{ fontSize: 18 }} />
            </ToggleButton>
          </Tooltip>
        );
      })}
    </ToggleButtonGroup>
  );
}

export default DensityToggle;
