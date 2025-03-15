// import axios from "axios";
// import store from "@/app/store";
// import { setAccessToken } from "../app/features/auth/authSlice";

// const api = axios.create({
//   baseURL: "http://localhost:4545",
//   withCredentials: true,
// });

// api.interceptors.request.use(
//   (config) => {
//     const state = store.getState();
//     const token = state.auth.accessToken;
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     if (error.response?.status === 401) {
//       try {
//         const res = await axios.post("http://localhost:4545/refresh-token", {}, { withCredentials: true });
//         store.dispatch(setAccessToken(res.data.accessToken));
//         error.config.headers.Authorization = `Bearer ${res.data.accessToken}`;
//         return axios(error.config);
//       } catch (err) {
//         console.error("Refresh token expired",err);
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;
