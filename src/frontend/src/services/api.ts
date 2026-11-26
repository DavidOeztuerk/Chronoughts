import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { AuthResponse, LoginRequest, RegisterRequest, Thought, ThoughtRequest, ThoughtConnection, ThoughtConnectionRequest } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

class ApiClient {
  private axiosInstance: AxiosInstance;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const newToken = await this.refreshToken();
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.clear();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  private async refreshToken(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = new Promise(async (resolve, reject) => {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const accessToken = localStorage.getItem('accessToken');
        
        if (!refreshToken || !accessToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/refresh`, {
          accessToken,
          refreshToken,
        });

        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        
        this.refreshPromise = null;
        resolve(response.data.accessToken);
      } catch (error) {
        this.refreshPromise = null;
        reject(error);
      }
    });

    return this.refreshPromise;
  }

  // Auth endpoints
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.axiosInstance.post<AuthResponse>('/auth/login', data);
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.axiosInstance.post<AuthResponse>('/auth/register', data);
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.axiosInstance.post('/auth/logout');
    } finally {
      localStorage.clear();
    }
  }

  async getCurrentUser() {
    const response = await this.axiosInstance.get('/auth/me');
    return response.data;
  }

  async updateProfile(profileData: any) {
    const response = await this.axiosInstance.put('/auth/profile', profileData);
    return response.data;
  }

  // Thoughts endpoints
  async getThoughts(params?: { category?: string; tag?: string; searchText?: string; limit?: number }) {
    const response = await this.axiosInstance.get<Thought[]>('/thoughts', { params });
    return response.data;
  }

  async getThought(id: string) {
    const response = await this.axiosInstance.get<Thought>(`/thoughts/${id}`);
    return response.data;
  }

  async createThought(data: ThoughtRequest) {
    const response = await this.axiosInstance.post<Thought>('/thoughts', data);
    return response.data;
  }

  async updateThought(id: string, data: ThoughtRequest) {
    const response = await this.axiosInstance.put<Thought>(`/thoughts/${id}`, data);
    return response.data;
  }

  async deleteThought(id: string) {
    await this.axiosInstance.delete(`/thoughts/${id}`);
  }

  // Connections endpoints
  async getConnections(thoughtId: string) {
    const response = await this.axiosInstance.get<ThoughtConnection[]>(`/connections/thought/${thoughtId}`);
    return response.data;
  }

  async createConnection(data: ThoughtConnectionRequest) {
    const response = await this.axiosInstance.post<ThoughtConnection>('/connections', data);
    return response.data;
  }

  async deleteConnection(id: string) {
    await this.axiosInstance.delete(`/connections/${id}`);
  }

  async getRelatedThoughts(thoughtId: string, maxDepth: number = 1) {
    const response = await this.axiosInstance.get<Thought[]>(`/connections/thought/${thoughtId}/related`, {
      params: { maxDepth }
    });
    return response.data;
  }

  // Stats and Activity endpoints
  async getStats() {
    const response = await this.axiosInstance.get('/thoughts/stats');
    return response.data;
  }

  async getRecentActivity(limit: number = 10) {
    const response = await this.axiosInstance.get('/thoughts/activity', {
      params: { limit }
    });
    return response.data;
  }
}

export default new ApiClient();