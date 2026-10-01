import { useEffect, useSyncExternalStore } from "react";
import { useAppSelector } from "@store/store";
import { AllCompanies, BranchId, ZoduId } from "@store/slices/userSlice";
import { getBranchSubscription } from "@utils/subscription";
import { installSubscriptionGuard, subscriptionGuardStore } from "@utils/subscriptionGuard";
import SubscriptionExpiredModal from "@components/Modals/SubscriptionExpiredModal";

installSubscriptionGuard();

// Mount once inside the Redux provider. Keeps the guard's view-only flag in
// step with the branch in session and renders the shared "expired" modal.
const SubscriptionGuard: React.FC = () => {
  const zoduId = useAppSelector(ZoduId);
  const branchId = useAppSelector(BranchId);
  const companies = useAppSelector(AllCompanies);
  const { modalOpen } = useSyncExternalStore(
    subscriptionGuardStore.subscribe,
    subscriptionGuardStore.getSnapshot
  );

  const company = companies.find((c) => c.zodu_id === zoduId);
  const branch = company?.branches.find((b) => b.branch_id === branchId);
  const subscription = getBranchSubscription(branch);
  const expired = !!subscription?.expired;

  useEffect(() => {
    subscriptionGuardStore.setReadOnly(expired);
  }, [expired]);

  if (!expired) return null;

  const businessName = [
    company?.restaurant_name || company?.business_name || company?.company_name,
    branch?.branch_name,
  ]
    .filter(Boolean)
    .join(" - ");

  return (
    <SubscriptionExpiredModal
      open={modalOpen}
      mode="viewOnly"
      businessName={businessName}
      expiryDate={subscription?.dateLabel}
      onClose={subscriptionGuardStore.closeModal}
    />
  );
};

export default SubscriptionGuard;
