import axios from "axios";

const axiosHashInstance = axios.create({
  baseURL: "https://prod-api.3dpscan.io:4000/",
  params: {},
});

axiosHashInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    return Promise.reject(error);
  }
);

export default axiosHashInstance;

export const API_BASE_URL = "https://prod-api.3dpscan.io:4000/";