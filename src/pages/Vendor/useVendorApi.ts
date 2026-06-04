import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { getTenantContext, getAccessToken } from "@store/tenantContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "https://api.myzodu.com";

function getApi() {
  const { businessType } = getTenantContext();
  const route = businessType === "Restaurant" ? "restaurant" : "retail";
  const token = getAccessToken();
  return axios.create({
    baseURL: `${API_BASE}/${route}/api`,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export interface CreateVendorPayload {
  zodu_id: string;
  branch_id: string;
  vendor_name: string;
  company_name?: string | null;
  gst?: string | null;
  vendor_phone?: string | null;
  vendor_email?: string | null;
  vendor_address_1?: string | null;
  vendor_address_2?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  type?: "Expense" | "Purchase";
}

export const useCreateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateVendorPayload) => {
      const res = await getApi().post("/vendor", data);

      if (res.data?.success === false) {
        throw new Error(res.data?.message ?? "Failed to create vendor");
      }

      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
  });
};
