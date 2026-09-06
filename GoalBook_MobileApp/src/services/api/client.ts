import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { APP_CONFIG } from '../../constants/config';
import { secureStorage } from '../storage/secureStorage';

type UnauthorizedHandler = () => void;
const unauthorizedHandlers = new Set<UnauthorizedHandler>();

export const registerUnauthorizedHandler = (handler: UnauthorizedHandler): (() => void) => {
  unauthorizedHandlers.add(handler);
  return () => {
    unauthorizedHandlers.delete(handler);
  };
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: APP_CONFIG.api.userServerUrl,
  timeout: APP_CONFIG.api.timeoutMs,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const aiClient: AxiosInstance = axios.create({
  baseURL: APP_CONFIG.api.aiServerUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await secureStorage.getItem(APP_CONFIG.storageKeys.authToken);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear token on 401 Unauthorized
      await secureStorage.deleteItem(APP_CONFIG.storageKeys.authToken);
      await secureStorage.deleteItem(APP_CONFIG.storageKeys.refreshToken);
      // Trigger all registered handlers for auto-logout
      unauthorizedHandlers.forEach((handler) => {
        try {
          handler();
        } catch (e) {
          console.warn('[apiClient] Error in unauthorized handler:', e);
        }
      });
    }
    return Promise.reject(error);
  }
);
