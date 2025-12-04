import axios, { AxiosError } from 'axios';
import type { 
  ContentType, 
  ContentTypeListItem, 
  ContentListResponse, 
  FormData,
  ApiError 
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Content Types API
export const contentTypesApi = {
  // Get all content types
  getAll: async (): Promise<ContentTypeListItem[]> => {
    const response = await api.get<ContentTypeListItem[]>('/api/content-types/');
    return response.data;
  },

  // Get content type by ID or name
  getByIdOrName: async (identifier: string | number): Promise<ContentType> => {
    const response = await api.get<ContentType>(`/api/content-types/${identifier}/`);
    return response.data;
  },

  // Get content type schema
  getSchema: async (identifier: string | number) => {
    const response = await api.get(`/api/content-types/${identifier}/schema/`);
    return response.data;
  },
};

// Dynamic Content API
export const contentApi = {
  // Get all content for a specific type
  getAll: async (contentTypeName: string): Promise<ContentListResponse> => {
    const response = await api.get<ContentListResponse>(`/api/content/${contentTypeName}/`);
    return response.data;
  },

  // Get specific content entry
  getById: async (contentTypeName: string, contentId: string) => {
    const response = await api.get(`/api/content/${contentTypeName}/${contentId}/`);
    return response.data;
  },

  // Create new content
  create: async (contentTypeName: string, data: FormData) => {
    const response = await api.post(`/api/content/${contentTypeName}/`, data);
    return response.data;
  },

  // Update content
  update: async (contentTypeName: string, contentId: string, data: FormData) => {
    const response = await api.put(`/api/content/${contentTypeName}/${contentId}/`, data);
    return response.data;
  },

  // Delete content
  delete: async (contentTypeName: string, contentId: string) => {
    const response = await api.delete(`/api/content/${contentTypeName}/${contentId}/`);
    return response.data;
  },
};

// Error handler
export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;
    if (axiosError.response?.data) {
      return axiosError.response.data;
    }
    return { error: axiosError.message || 'An unknown error occurred' };
  }
  return { error: 'An unexpected error occurred' };
};

export default api;
