import Axios, { AxiosInstance } from "axios";

const axiosInstance:AxiosInstance = Axios.create({
  baseURL: "http://localhost:4545",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
