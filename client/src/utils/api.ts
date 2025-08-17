import { 
  LoginRequest, 
  RegisterRequest, 
  PasswordResetRequest, 
  PasswordResetConfirm, 
  AuthResponse, 
  User 
} from '@/types/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('authToken');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {};

    // Don't set Content-Type for FormData - browser will set it with boundary
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    // Merge additional headers if provided
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new ApiError(
        data.message || `HTTP error! status: ${response.status}`,
        response.status,
        data.errors
      );
    }

    return data;
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async requestPasswordReset(data: PasswordResetRequest): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>('/api/auth/password-reset/request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resetPassword(data: PasswordResetConfirm): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>('/api/auth/password-reset/reset', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProfile(): Promise<User> {
    const response = await this.makeRequest<{ user: User }>('/api/auth/profile');
    return response.user;
  }

  async healthCheck(): Promise<{ status: string }> {
    return this.makeRequest<{ status: string }>('/api/health');
  }

  // Generic HTTP methods for property management
  async get<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, customHeaders?: Record<string, string>): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
      headers: customHeaders
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export const api = apiClient; // Alias for easier usage
export { ApiError };

// Utility function to resolve photo URLs
export const resolvePhotoUrl = (url: string): string => {
  // If the URL is already a full path (starts with http:// or https://), use it directly
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Otherwise, prepend the API_BASE_URL to form the complete URL
  return `${API_BASE_URL}${url}`;
};

// Export API_BASE_URL for use in other parts of the application
export { API_BASE_URL };