export interface User {
  id: number;
  username: string;
  email: string;
  city: string;
  created_at?: string;
  videoCount?: number;
  totalLikes?: number;
}

export interface Video {
  id: number;
  filename: string;
  original_name: string;
  duration: number;
  file_size: number;
  created_at: string;
  username: string;
  city?: string;
  like_count: number;
  user_liked: boolean;
  videoUrl: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  city: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface VideoUploadResponse {
  message: string;
  video: {
    id: number;
    filename: string;
    originalName: string;
    duration: number;
    fileSize: number;
    uploadedAt: string;
  };
}

export interface VideosResponse {
  videos: Video[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}