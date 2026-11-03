// Z-T71
import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { API_BASE } from "@utils/authSession";

// The one HTTP client for every API call in the app. The access token, the
// platform header and the 401 → refresh → retry come from utils/authSession
// (installed on it in main.tsx). Modules never set Authorization themselves.
const axiosInstance = axios.create({
  baseURL: API_BASE,
});

export type ServiceClient = Pick<AxiosInstance, "get" | "delete" | "post" | "put" | "patch">;

/**
 * The same client with another base path (e.g. `${API_BASE}/retail/api`), for
 * modules written against a service-relative URL. Every request still goes
 * through axiosInstance and its session handling.
 */
export function serviceClient(baseURL: string, defaults: AxiosRequestConfig = {}): ServiceClient {
  const withBase = (config?: AxiosRequestConfig): AxiosRequestConfig => ({ ...defaults, ...config, baseURL });
  return {
    get: (url, config) => axiosInstance.get(url, withBase(config)),
    delete: (url, config) => axiosInstance.delete(url, withBase(config)),
    post: (url, data, config) => axiosInstance.post(url, data, withBase(config)),
    put: (url, data, config) => axiosInstance.put(url, data, withBase(config)),
    patch: (url, data, config) => axiosInstance.patch(url, data, withBase(config)),
  } as ServiceClient;
}

export default axiosInstance;
