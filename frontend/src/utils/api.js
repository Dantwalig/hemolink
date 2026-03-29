import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  timeout: 15000,  // 15s timeout — prevents the UI hanging forever
});

// Attach JWT to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — but NOT on login/register routes to avoid redirect loops
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const url = err.config?.url || "";
      const isAuthRoute = ["/login", "/register"].some(r => url.includes(r));

      if (!isAuthRoute) {
        const user = (() => {
          try { return JSON.parse(localStorage.getItem("user")); }
          catch { return null; }
        })();
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Redirect to the right login page for the user's role
        if (user?.role === "hospital") window.location.href = "/hospital-login";
        else if (user?.role === "admin") window.location.href = "/admin/login";
        else window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
