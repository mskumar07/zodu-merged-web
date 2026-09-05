const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return ones ? `${TENS[tens]} ${ONES[ones]}` : TENS[tens];
}

function threeDigits(n: number): string {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  const hundredsPart = hundreds ? `${ONES[hundreds]} Hundred` : "";
  const restPart = rest ? twoDigits(rest) : "";
  return [hundredsPart, restPart].filter(Boolean).join(" ");
}

/**
 * Converts a non-negative integer rupee amount to words using the Indian
 * numbering system (Crore / Lakh / Thousand / Hundred), e.g.
 * 1693800 -> "Sixteen Lakh Ninety Three Thousand Eight Hundred".
 */
export function numberToWords(amount: number): string {
  const n = Math.floor(Math.abs(amount));
  if (n === 0) return "Zero";

  const crore = Math.floor(n / 1_00_00_000);
  const lakh = Math.floor((n / 1_00_000) % 100);
  const thousand = Math.floor((n / 1_000) % 100);
  const hundred = n % 1_000;

  const parts = [
    crore ? `${threeDigits(crore)} Crore` : "",
    lakh ? `${twoDigits(lakh)} Lakh` : "",
    thousand ? `${twoDigits(thousand)} Thousand` : "",
    hundred ? threeDigits(hundred) : "",
  ].filter(Boolean);

  return parts.join(" ");
}
