import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', withCredentials: true, timeout: 120000 });

let refreshing = null;
let onAuthLost = () => {};
export const setAuthLostHandler = (fn) => { onAuthLost = fn; };

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const { config, response } = error;
    const skip = /\/auth\/(login|register|refresh|logout)/.test(config?.url || '');
    if (response?.status === 401 && !config._retry && !skip) {
      config._retry = true;
      try {
        refreshing = refreshing || api.post('/auth/refresh').finally(() => { refreshing = null; });
        await refreshing;
        return api(config);
      } catch (e) {
        onAuthLost();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
