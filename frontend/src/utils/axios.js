import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "",
  withCredentials: true, // Crucial for sending/receiving cookies
});

// Request interceptor to add the access token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and not already retrying
    if (
      error.response?.status === 401 &&
      error.response?.data?.expired &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        const res = await axios.post("/api/auth/refresh-token", {});

        if (res.status === 200) {
          const newToken = res.data.token;
          localStorage.setItem("token", newToken);

          // Update the original request with the new token and retry
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Clear storage only on actual 403 (invalid refresh) or 401 (no refresh)
        if (
          refreshError.response?.status === 403 ||
          refreshError.response?.status === 401
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
