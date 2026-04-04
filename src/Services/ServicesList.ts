import axios from "axios";

export const baseURL = axios.create({
      // baseURL: import.meta.env.VITE_API_BASE_URL as string,
                         baseURL: import.meta.env.VITE_API_BASE_URL ?? "https://api.myzodu.com",
});
