import Axios, { AxiosInstance } from "axios";

export const BASE_URL = "https://ecommerce-myr6.onrender.com"; // Export base URL separately

const axiosInstance: AxiosInstance = Axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
