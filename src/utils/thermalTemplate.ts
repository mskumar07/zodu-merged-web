/**
 * The two thermal receipt layouts, each drawn for every roll width:
 *   classic — monospace, dashed rules, items as a column table (# | Item | Qty | Rate | Amount)
 *   modern  — sans-serif, solid rules, each item as "name … amount" over "qty × rate",
 *             and the total on a black bar
 * Stored in the same `invoice_template` setting as the A4 layouts: "modern" and
 * "modern2" print Modern, anything else Classic.
 */
export type ThermalTemplate = "classic" | "modern";

export const THERMAL_TEMPLATE_OPTIONS = [
  { value: "classic", label: "Classic" },
  { value: "modern", label: "Modern" },
] as const;

export function toThermalTemplate(invoiceTemplate: string | null | undefined): ThermalTemplate {
  return invoiceTemplate === "modern" || invoiceTemplate === "modern2" ? "modern" : "classic";
}
