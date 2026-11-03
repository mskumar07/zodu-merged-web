import { installSubscriptionGuard } from "./subscriptionGuard";

// Side-effect module, imported in main.tsx: blocks writes on the app's HTTP
// client (store/services/axiosInstance) while the branch is view-only.
installSubscriptionGuard();
