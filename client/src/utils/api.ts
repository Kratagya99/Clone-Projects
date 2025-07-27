import axios from 'axios';
import {
  User,
  Video,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  VideoUploadResponse,
  VideosResponse,
} from '../types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' 
  : 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: LoginCredentials): Promise<AuthResponse> =>
    api.post('/auth/login', credentials).then(res => res.data),
  
  register: (credentials: RegisterCredentials): Promise<AuthResponse> =>
    api.post('/auth/register', credentials).then(res => res.data),
  
  getCurrentUser: (): Promise<{ user: User }> =>
    api.get('/auth/me').then(res => res.data),
};

// Video API
export const videoAPI = {
  uploadVideo: (formData: FormData): Promise<VideoUploadResponse> =>
    api.post('/videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data),
  
  getMyVideos: (page = 1, limit = 10): Promise<VideosResponse> =>
    api.get(`/videos/my-videos?page=${page}&limit=${limit}`).then(res => res.data),
  
  getExploreVideos: (page = 1, limit = 10): Promise<VideosResponse> =>
    api.get(`/videos/explore?page=${page}&limit=${limit}`).then(res => res.data),
  
  likeVideo: (videoId: number): Promise<{ message: string; liked: boolean; likeCount: number }> =>
    api.post(`/videos/${videoId}/like`).then(res => res.data),
  
  deleteVideo: (videoId: number): Promise<{ message: string }> =>
    api.delete(`/videos/${videoId}`).then(res => res.data),
};

// User API
export const userAPI = {
  getUserProfile: (username: string): Promise<{ user: User }> =>
    api.get(`/users/profile/${username}`).then(res => res.data),
  
  updateProfile: (data: { city?: string }): Promise<{ message: string; user: User }> =>
    api.put('/users/profile', data).then(res => res.data),
};

export default api;