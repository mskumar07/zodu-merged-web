import { installSubscriptionGuard } from "./subscriptionGuard";

// Side-effect module: import it FIRST in main.tsx so the axios.create() patch is
// in place before any feature module builds its own client.
installSubscriptionGuard();
