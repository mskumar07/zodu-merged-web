import { useCallback, useEffect, useSyncExternalStore } from "react";
import { runIfSubscribed, subscriptionGuardStore } from "@utils/subscriptionGuard";

/**
 * Button-level guard for view-only (expired) businesses.
 *
 *   const { isReadOnly, guard } = useSubscriptionGuard();
 *   <Button onClick={guard(() => setAddOpen(true))}>Add</Button>
 *
 * Writes are already blocked centrally at the network layer; use this to stop
 * the click *before* a form opens, so the user sees the modal immediately.
 */
export function useSubscriptionGuard() {
  const { readOnly } = useSyncExternalStore(
    subscriptionGuardStore.subscribe,
    subscriptionGuardStore.getSnapshot
  );

  // Returns the same function type it is given, so wrapped handlers keep the
  // event / argument types of the prop they are passed to.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const guard = useCallback(<F extends (...args: any[]) => void>(action?: F): F => {
    return ((...args: Parameters<F>) => {
      const allowed = runIfSubscribed(action ? () => action(...args) : undefined);
      // A blocked click must not also trigger a parent handler (e.g. a table row's open-detail).
      const first = args[0] as { stopPropagation?: () => void } | undefined;
      if (!allowed) first?.stopPropagation?.();
    }) as F;
  }, []);

  return { isReadOnly: readOnly, guard };
}

/**
 * Put in any write dialog (add / edit / adjust / pay / return ...). If the
 * dialog would open on a view-only business it closes straight away and the
 * expired modal shows instead — covering every way the dialog can be opened.
 */
export function useBlockWhenReadOnly(open: boolean, onClose: () => void) {
  const { readOnly } = useSyncExternalStore(
    subscriptionGuardStore.subscribe,
    subscriptionGuardStore.getSnapshot
  );
  const blocked = open && readOnly;

  useEffect(() => {
    if (!blocked) return;
    subscriptionGuardStore.openModal();
    onClose();
    // onClose is usually an inline closure; only the blocked edge matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocked]);

  return blocked;
}
