/**
 * API Client for Mobile App
 * Similar to web app's api-client.ts but adapted for React Native
 */
import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import {API_CONFIG} from '../config/api';
import tokenManager from '../utils/tokenManager';
import authService from './authService';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  responseCode?: string;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - Add auth token
    // NOTE:
    // - Default behavior: send backend access token.
    // - For specific requests (e.g. Google outbound authentication), callers can
    //   disable this by setting `headers: { 'X-Skip-Auth': '1' }`.
    this.client.interceptors.request.use(
      async config => {
        const skipAuth = (config.headers as any)?.['X-Skip-Auth'] === '1';
        if (!skipAuth) {
          const token = await tokenManager.getAccessToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }

        return config;
      },
      error => {
        return Promise.reject(error);
      },
    );

    // Response interceptor - Handle errors and refresh token
    this.client.interceptors.response.use(
      response => {
        // Backend returns { responseCode, data, message }
        if (response.data.responseCode === 'S0000') {
          return {
            ...response,
            data: {
              success: true,
              data: response.data.data,
            },
          };
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // Nếu lỗi 401 và chưa retry
        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;

          try {
            // Thử refresh token
            const refreshToken = await tokenManager.getRefreshToken();
            if (refreshToken) {
              const authData = await authService.refreshToken();
              
              if (authData.token) {
                // Retry request với token mới
                originalRequest.headers.Authorization = `Bearer ${authData.token}`;
                return this.client(originalRequest);
              }
            }
          } catch (refreshError) {
            // Refresh token failed, clear storage và logout
            console.error('Refresh token failed:', refreshError);
            await tokenManager.clearAll();
            // Có thể emit event để AuthContext logout
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    data?: any,
    config?: InternalAxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.request({
        method,
        url: endpoint,
        data,
        ...(config || {}),
      });

      // Handle backend response format
      if (response.data.responseCode === 'S0000') {
        return {
          success: true,
          data: response.data.data,
        };
      }

      return {
        success: false,
        error: response.data.message || 'Request failed',
        data: response.data.data,
      };
    } catch (error: any) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const errorData = axiosError.response.data as any;
        return {
          success: false,
          error: errorData.message || errorData.error || axiosError.message,
        };
      }
      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint);
  }

  // POST request
  async post<T>(
    endpoint: string,
    data?: any,
    config?: InternalAxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, config);
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data);
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint);
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data);
  }

  // ========== Bookings API ==========
  async getBookings() {
    return this.get('/bookings');
  }

  async getBooking(id: number) {
    return this.get(`/bookings/${id}`);
  }

  async getBookingsByUser(userId: string | number) {
    return this.get(`/bookings/by-user/${encodeURIComponent(String(userId))}`);
  }

  async getBookingsByStatus(status: string) {
    return this.get(`/bookings/by-status/${status}`);
  }

  async createBooking(bookingData: {
    code?: string;
    userId: string;
    roomId: number;
    checkinDate: string;
    checkoutDate: string;
    numGuests: number;
    note?: string;
  }) {
    return this.post('/bookings', bookingData);
  }

  async updateBooking(id: number, bookingData: any) {
    return this.put(`/bookings/${id}`, bookingData);
  }

  async deleteBooking(id: number) {
    return this.delete(`/bookings/${id}`);
  }

  // ========== Rooms API ==========
  async getRooms() {
    return this.get('/rooms');
  }

  async getRoom(id: number) {
    return this.get(`/rooms/${id}`);
  }

  async getRoomsByStatus(
    status:
      | 'AVAILABLE'
      | 'OCCUPIED'
      | 'MAINTENANCE'
      | 'CLEANING'
      | 'OUT_OF_SERVICE',
    startTime?: string,
    endTime?: string,
  ) {
    const params = new URLSearchParams();
    if (startTime) {
      params.set('startTime', startTime);
    }
    if (endTime) {
      params.set('endTime', endTime);
    }
    const qs = params.toString();
    return this.get(`/rooms/by-status/${status}${qs ? `?${qs}` : ''}`);
  }

  // ========== Services API ==========
  async getServices() {
    return this.get('/services');
  }

  async getService(id: number) {
    return this.get(`/services/${id}`);
  }

  // ========== Orders API ==========
  // Backend requires bookingId
  async getOrdersByBooking(bookingId: number) {
    const queryParams = new URLSearchParams();
      queryParams.set('bookingId', bookingId.toString());
    return this.get(`/orders/my-orders?${queryParams.toString()}`);
  }

  async getServiceOrder(id: number) {
    return this.get(`/orders/${id}`);
  }

  // Staff order detail endpoint includes items + authorization by assigned staff
  async getStaffOrderDetail(staffId: number, orderId: number) {
    return this.get(`/orders/staff/${staffId}/tasks/${orderId}`);
  }

  async createOrderCart(params: {
    bookingId: number;
    requestedBy?: string;
    note?: string;
  }) {
    return this.post('/orders/cart', params);
  }

  async addOrderItem(orderId: number, serviceId: number, quantity: number) {
    return this.post(`/orders/${orderId}/items`, {
      serviceId,
      quantity,
    });
  }

  async cancelOrder(orderId: number) {
    return this.post(`/orders/${orderId}/cancel`);
  }

  // ========== Staff Orders API ==========
  async staffConfirmOrder(orderId: number, staffId: number, note?: string) {
    return this.post(`/orders/${orderId}/staff/confirm`, {
      staffId,
      note: note || '',
    });
  }

  async staffRejectOrder(orderId: number, staffId: number, reason?: string) {
    return this.post(`/orders/${orderId}/staff/reject`, {
      staffId,
      reason: reason || '',
    });
  }

  async getStaffTasksForOrder(staffId: number, status?: string) {
    const queryParams = new URLSearchParams();
    if (status) {
      queryParams.set('status', status);
    }
    const endpoint = `/orders/staff/${staffId}/tasks${
      queryParams.toString() ? '?' + queryParams.toString() : ''
    }`;
    return this.get(endpoint);
  }
}

export default new ApiClient();
