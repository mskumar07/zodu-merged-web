/**
 * Credit for a sales return — mirrors buildReturnLines in the backend
 * (retail-service/src/services/sale-service.js) so the preview equals the
 * amount that gets saved: the invoice's own stored tax and its line / order
 * discounts are pro-rated by quantity, and the invoice round-off takes its share.
 *
 * Split in two so the invoice-level work runs once per loaded sale, and only the
 * cheap per-line part runs when a checkbox or quantity changes.
 */

export interface ReturnPick {
  item: any;
  qty:  number;
}

export interface InvoiceCreditContext {
  /** Share of the order-level discount per unit of line weight, 0 when there is none. */
  orderDiscountRate: number;
  weightOf:          (item: any) => number;
  lineDiscountFactor: 0 | 1;
  invoiceValue:      number;
  invoiceRoundOff:   number;
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Value of a sale line before tax: a tax-inclusive price has the tax taken out. */
const baseOf = (item: any, qty: number): number => {
  const value  = qty * Number(item.price);
  const gstPct = Number(item.gst_percentage) || 0;
  return item.tax_inclusive && gstPct > 0 ? value / (1 + gstPct / 100) : value;
};

export function buildInvoiceContext(sale: any, items: any[]): InvoiceCreditContext {
  const beforeGst     = sale?.discount_gst_mode === "before";
  const orderDiscount = Number(sale?.discount_amount) || 0;
  const billed        = Number(sale?.total_amount) || 0;

  // "After GST" discounts are shared by value incl. tax, "before GST" by pre-tax value.
  const weightOf = (item: any) =>
    round2(baseOf(item, Number(item.quantity))) + (beforeGst ? 0 : Number(item.tax_amount) || 0);

  let totalWeight = 0, grossValue = 0, lineDiscountTotal = 0;
  for (const item of items) {
    totalWeight       += weightOf(item);
    grossValue        += round2(baseOf(item, Number(item.quantity))) + (Number(item.tax_amount) || 0);
    lineDiscountTotal += Number(item.discount) || 0;
  }

  // Some older invoices recorded a line discount that was never deducted from the
  // billed total; apply it only when the billed total reconciles with it.
  const lineDiscountFactor: 0 | 1 =
    Math.abs(billed - (grossValue - lineDiscountTotal - orderDiscount)) < 1 ||
    Math.abs(billed - (grossValue - orderDiscount)) >= 1
      ? 1 : 0;

  // The gap to the billed total is the invoice's round-off (a gap of a rupee or
  // more is not rounding and is ignored).
  const invoiceValue = grossValue - lineDiscountFactor * lineDiscountTotal - orderDiscount;
  const billedGap    = round2(billed - invoiceValue);

  return {
    orderDiscountRate:  orderDiscount > 0 && totalWeight > 0 ? orderDiscount / totalWeight : 0,
    weightOf,
    lineDiscountFactor,
    invoiceValue,
    invoiceRoundOff:    Math.abs(billedGap) < 1 ? billedGap : 0,
  };
}

export interface ReturnCreditBreakdown {
  /** Σ qty × invoice price of the returned units, i.e. what the invoice shows for those lines. */
  itemValue: number;
  /** What the invoice's line / order discounts take off `itemValue` (0 when there are none). */
  discount:  number;
  /** The invoice round-off's share of this return (can be negative). */
  roundOff:  number;
  /** Credit given to the customer: itemValue − discount + roundOff. */
  total:     number;
}

const EMPTY_BREAKDOWN: ReturnCreditBreakdown = { itemValue: 0, discount: 0, roundOff: 0, total: 0 };

/** What the customer is credited for `picks`, split so the screen can show where the number comes from. */
export function computeReturnBreakdown(ctx: InvoiceCreditContext, picks: ReturnPick[]): ReturnCreditBreakdown {
  if (picks.length === 0) return EMPTY_BREAKDOWN;

  let subtotal = 0, tax = 0, discount = 0, itemValue = 0;
  for (const { item, qty } of picks) {
    const share   = qty / Number(item.quantity);
    const taxable = round2(baseOf(item, qty));
    const gstPct  = Number(item.gst_percentage) || 0;

    itemValue += qty * Number(item.price);
    subtotal  += taxable;
    tax       += round2(item.tax_amount != null ? Number(item.tax_amount) * share : (taxable * gstPct) / 100);
    discount  += round2(
      (Number(item.discount) || 0) * ctx.lineDiscountFactor * share +
        ctx.orderDiscountRate * ctx.weightOf(item) * share,
    );
  }

  const credit   = round2(round2(subtotal) - round2(discount) + round2(tax));
  const roundOff = ctx.invoiceValue > 0 ? round2((ctx.invoiceRoundOff * credit) / ctx.invoiceValue) : 0;
  const total    = round2(credit + roundOff);
  itemValue      = round2(itemValue);
  // Everything between the invoice price and the pre-round-off credit is discount, however it was
  // split between taxable value and tax — so the rows on screen always add up to the total.
  return { itemValue, discount: round2(itemValue - credit), roundOff, total };
}

/** What the customer is credited for `picks`, after discounts and round-off. */
export const computeReturnCredit = (ctx: InvoiceCreditContext, picks: ReturnPick[]): number =>
  computeReturnBreakdown(ctx, picks).total;
