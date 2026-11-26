import axios from 'axios';
import { Thought } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:5001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

export interface ThoughtFilters {
  category?: string;
  tag?: string;
  searchText?: string;
  limit?: number;
  offset?: number;
}

export interface CreateThoughtDto {
  title: string;
  content: string;
  category: string;
  importance: number;
  tags?: string[];
  status?: string;
}

export interface UpdateThoughtDto {
  title?: string;
  content?: string;
  category?: string;
  importance?: number;
  tags?: string[];
  status?: string;
}

export const thoughtsApi = {
  // Get all thoughts with optional filters
  getThoughts: async (filters?: ThoughtFilters) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.tag) params.append('tag', filters.tag);
    if (filters?.searchText) params.append('searchText', filters.searchText);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    
    const response = await api.get<Thought[]>(`/thoughts?${params.toString()}`);
    return response.data;
  },

  // Get thought by ID
  getThoughtById: async (id: string) => {
    const response = await api.get<Thought>(`/thoughts/${id}`);
    return response.data;
  },

  // Create new thought
  createThought: async (data: CreateThoughtDto) => {
    const response = await api.post<Thought>('/thoughts', data);
    return response.data;
  },

  // Update thought
  updateThought: async (id: string, data: UpdateThoughtDto) => {
    const response = await api.put<Thought>(`/thoughts/${id}`, data);
    return response.data;
  },

  // Delete thought
  deleteThought: async (id: string) => {
    const response = await api.delete(`/thoughts/${id}`);
    return response.data;
  },

  // Search thoughts
  searchThoughts: async (searchText: string) => {
    const response = await api.get<Thought[]>(`/thoughts/search?searchText=${encodeURIComponent(searchText)}`);
    return response.data;
  },

  // Get thoughts by category
  getThoughtsByCategory: async (category: string) => {
    const response = await api.get<Thought[]>(`/thoughts/category/${category}`);
    return response.data;
  },

  // Get thoughts by tag
  getThoughtsByTag: async (tag: string) => {
    const response = await api.get<Thought[]>(`/thoughts/tag/${tag}`);
    return response.data;
  },

  // Get thought connections
  getThoughtConnections: async (thoughtId: string) => {
    const response = await api.get(`/connections/thought/${thoughtId}`);
    return response.data;
  },

  // Get thought stats
  getThoughtStats: async () => {
    const response = await api.get('/thoughts/stats');
    return response.data;
  }
};

export default thoughtsApi;