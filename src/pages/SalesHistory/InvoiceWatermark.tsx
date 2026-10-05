/**
 * Faded image across the middle of an A4 invoice, like a letterhead
 * watermark. Drawn over the content (not under it) so the table's white row
 * backgrounds can't hide it; the low opacity keeps the text readable. The
 * parent page must be `position: relative`.
 *
 * `data-pdf-watermark` hands it to the PDF paginator, which leaves it out of
 * the page capture and stamps it centred on every page instead of once.
 */
export function InvoiceWatermark({ src }: { src: string }) {
  if (!src) return null;
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      data-pdf-watermark
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "62%",
        maxHeight: "560px",
        objectFit: "contain",
        opacity: 0.08,
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}

/**
 * Resolves the watermark and receiver-signature settings the same way every
 * template resolves the authorised signature: an explicit prop (the Settings
 * page's live preview) wins, otherwise the persisted invoice settings. With no
 * watermark image uploaded, the company logo is used.
 */
export function resolveInvoiceExtras(
  invoiceSettings: Record<string, any> | null | undefined,
  { watermarkUrl, receiverSignatureUrl, logoUrl }: { watermarkUrl?: string; receiverSignatureUrl?: string; logoUrl?: string },
) {
  const showWatermark = invoiceSettings?.show_watermark ?? false;
  return {
    watermarkSrc: showWatermark ? (watermarkUrl || invoiceSettings?.watermark_url || logoUrl || "") : "",
    showReceiverSignature: invoiceSettings?.show_receiver_signature ?? false,
    receiverSignatureSrc: receiverSignatureUrl || invoiceSettings?.receiver_signature_url || "",
  };
}
