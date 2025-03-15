import axios from "axios";

const PRIMARY_URL = "https://explorer-api.3dpscan.io/graphql/";
const FAILOVER_URL = "https://failover.3dpscan.io/graphql/";

const axiosInstance = axios.create({
  baseURL: PRIMARY_URL,
  params: {},
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.config && !error.config.__isRetryRequest) {
      error.config.__isRetryRequest = true;
      error.config.baseURL = FAILOVER_URL;
      return axiosInstance(error.config);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;