import axiosInstance from "@store/services/axiosInstance";
import { installAuth } from "./authSession";

// Side-effect module: import it FIRST in main.tsx so the app's one HTTP client
// carries the session handling before any feature module sends a request.
installAuth(axiosInstance);
