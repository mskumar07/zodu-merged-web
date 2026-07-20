export const fmtMoneyRaw = (v: number | string) => {
  const n = typeof v === "string" ? parseFloat(v) || 0 : v || 0;
  return n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};
