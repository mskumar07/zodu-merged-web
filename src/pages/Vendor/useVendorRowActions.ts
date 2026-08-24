import { useCallback, useState } from "react";
import { useDeleteVendor, type Vendor } from "../PurchaseScreen/usePuchaseapi";

/** Vendor row's addressable identifier — the uuid `id`, falling back to `vendor_id`. */
export function vendorRowId(v: Vendor): string {
  return v.id ?? v.vendor_id;
}

export function vendorDisplayName(v?: Vendor | null): string {
  if (!v) return "";
  return v.company_name ? `${v.vendor_name} (${v.company_name})` : v.vendor_name;
}

interface UseVendorRowActionsOptions {
  /** Currently selected vendor_id in the host form — cleared automatically if it's the one deleted. */
  selectedVendorId?: string;
  onSelectedVendorCleared?: () => void;
  onDeleted?: (vendor: Vendor) => void;
  onError?: (message: string) => void;
}

/**
 * Shared edit/delete state + handlers for any "Supplier / Vendor" picker.
 * Pairs with <VendorEditDeleteDialogs /> to render the edit modal + delete
 * confirmation without duplicating the wiring in every screen.
 */
export function useVendorRowActions({
  selectedVendorId,
  onSelectedVendorCleared,
  onDeleted,
  onError,
}: UseVendorRowActionsOptions = {}) {
  const [editOpen, setEditOpen]         = useState(false);
  const [vendorToEdit, setVendorToEdit] = useState<Vendor | null>(null);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);
  const deleteVendor = useDeleteVendor();

  const openCreate = useCallback(() => { setVendorToEdit(null); setEditOpen(true); }, []);
  const openEdit   = useCallback((v: Vendor) => { setVendorToEdit(v); setEditOpen(true); }, []);
  const closeEdit  = useCallback(() => { setEditOpen(false); setVendorToEdit(null); }, []);
  const requestDelete = useCallback((v: Vendor) => setVendorToDelete(v), []);
  const cancelDelete  = useCallback(() => setVendorToDelete(null), []);

  const confirmDelete = useCallback(async () => {
    if (!vendorToDelete) return;
    const target = vendorToDelete;
    try {
      await deleteVendor.mutateAsync(vendorRowId(target));
      if (selectedVendorId === target.vendor_id) onSelectedVendorCleared?.();
      onDeleted?.(target);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; error?: string } }; message?: string };
      onError?.(e?.response?.data?.message ?? e?.response?.data?.error ?? e?.message ?? "Failed to delete vendor.");
    } finally {
      setVendorToDelete(null);
    }
  }, [vendorToDelete, deleteVendor, selectedVendorId, onSelectedVendorCleared, onDeleted, onError]);

  return {
    editOpen, vendorToEdit, openCreate, openEdit, closeEdit,
    vendorToDelete, requestDelete, cancelDelete, confirmDelete,
    isDeleting: deleteVendor.isPending,
  };
}

export type VendorRowActions = ReturnType<typeof useVendorRowActions>;
