import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  vendor_type?: "Expense" | "Purchase";
}

/** Body sent to PUT /api/vendors/:id — id goes in the URL, not the body */
export interface EditVendorPayload {
  vendor_name?: string | null;
  company_name?: string | null;
  gst?: string | null;
  vendor_phone?: string | null;
  vendor_email?: string | null;
  vendor_address_1?: string | null;
  vendor_address_2?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  vendor_type?: "Expense" | "Purchase";
}

export interface VendorRecord {
  id?: string;
  vendor_id: string;
  zodu_id?: string;
  branch_id?: string;
  vendor_name?: string;
  company_name?: string;
  gst?: string;
  vendor_phone?: string;
  vendor_email?: string;
  vendor_address_1?: string;
  vendor_address_2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  vendor_type?: "Expense" | "Purchase";
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

/** GET /api/vendors/:id */
export const useVendorById = (vendorId: string, enabled = true) => {
  return useQuery({
    queryKey: ["vendor", vendorId],
    queryFn: async () => {
      const res = await getApi().get(`/vendors/${vendorId}`);
      if (res.data?.success === false) {
        throw new Error(res.data?.message ?? res.data?.error ?? "Vendor not found");
      }
      return res.data?.data as VendorRecord;
    },
    enabled: enabled && !!vendorId,
    staleTime: 30_000,
  });
};

/** PUT /api/vendors/:id */
export const useUpdateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EditVendorPayload }) => {
      const res = await getApi().put(`/vendor/${id}`, data);

      if (res.data?.success === false) {
        throw new Error(res.data?.message ?? res.data?.error ?? "Failed to update vendor");
      }

      return res.data?.data as VendorRecord;
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      queryClient.invalidateQueries({ queryKey: ["vendor", id] });
    },
  });
};

/** DELETE /api/vendors/:id */
export const useDeleteVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vendorId: string) => {
      const res = await getApi().delete(`/vendor/${vendorId}`);

      if (res.data?.success === false) {
        throw new Error(res.data?.message ?? res.data?.error ?? "Failed to delete vendor");
      }

      return res.data;
    },
    onSuccess: (_data, vendorId) => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      queryClient.removeQueries({ queryKey: ["vendor", vendorId] });
    },
  });
};
