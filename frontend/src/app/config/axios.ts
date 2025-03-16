import Axios, { AxiosInstance } from "axios";

const axiosInstance:AxiosInstance = Axios.create({
  baseURL: "https://ecommerce-myr6.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
