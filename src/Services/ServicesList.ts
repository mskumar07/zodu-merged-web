import axios from "axios";

export const baseURL = axios.create({
      // baseURL: import.meta.env.VITE_API_BASE_URL as string,
                         baseURL: "https://api.zodusolutions.cloud/" ,
});
