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
    public errors?: Record<string, string[]>,
    public serverMessage?: string,
    public endpoint?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    // Return server message if available, otherwise fallback to generic message
    return this.serverMessage || this.message;
  }

  /**
   * Check if this is a specific type of error
   */
  isValidationError(): boolean {
    return this.status === 400;
  }

  isAuthError(): boolean {
    return this.status === 401;
  }

  isPermissionError(): boolean {
    return this.status === 403;
  }

  isNotFoundError(): boolean {
    return this.status === 404;
  }

  isServerError(): boolean {
    return this.status >= 500;
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
    // Following is the request headers requested by ngrok
    headers['ngrok-skip-browser-warning'] = `true`;

    try {
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
        // Enhanced error parsing to handle multiple server response formats
        const serverMessage = this.extractServerMessage(data, response.status);
        const fallbackMessage = `HTTP error! status: ${response.status}`;
        
        throw new ApiError(
          fallbackMessage,
          response.status,
          data.errors,
          serverMessage,
          endpoint
        );
      }

      return data;
    } catch (error) {
      // Handle network errors (no response from server)
      if (error instanceof ApiError) {
        throw error; // Re-throw API errors as-is
      }
      
      // Network or other errors
      throw new ApiError(
        'Network error occurred',
        0,
        undefined,
        'Unable to connect to server. Please check your connection.',
        endpoint
      );
    }
  }

  /**
   * Extract server error message from different response formats
   */
  private extractServerMessage(data: any, status: number): string {
    // Handle different server response formats
    if (typeof data === 'string') {
      return data;
    }
    
    if (data && typeof data === 'object') {
      // Common formats: {error: "message"}, {message: "error"}, {errors: [...]}
      const message = data.error || data.message || data.msg;
      if (message) {
        return message;
      }
      
      // Handle validation errors array
      if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        return data.errors.join(', ');
      }
      
      // Handle validation errors object
      if (data.errors && typeof data.errors === 'object') {
        const errorMessages = Object.values(data.errors).flat();
        if (errorMessages.length > 0) {
          return errorMessages.join(', ');
        }
      }
    }
    
    // Fallback messages based on status code
    switch (status) {
      case 400: return 'Invalid request data';
      case 401: return 'Authentication required';
      case 403: return 'Permission denied';
      case 404: return 'Resource not found';
      case 409: return 'Resource conflict';
      case 422: return 'Validation failed';
      case 500: return 'Internal server error';
      case 502: return 'Server temporarily unavailable';
      case 503: return 'Service unavailable';
      default: return 'An error occurred';
    }
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

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export const api = apiClient; // Alias for easier usage
export { ApiError };

// Utility function to resolve photo URLs from the API
export const resolvePhotoUrl = (url: string): string => {
  // If the URL is already a full path (starts with http:// or https://), use it directly
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Otherwise, prepend the API_BASE_URL to form the complete URL
  return `${API_BASE_URL}${url}`;
};

// Utility function to resolve client-side asset paths (images, static files, etc.)
export const resolveAssetPath = (path: string): string => {
  // If the path is already absolute or external, return as-is
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
    return path;
  }
  
  // Get the base path from environment variable or Vite's BASE_URL
  const base = import.meta.env.VITE_APP_BASE || import.meta.env.BASE_URL || '/';
  
  // Ensure base ends with slash
  const basePath = base.endsWith('/') ? base : `${base}/`;
  
  // Remove leading slash from path if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Combine base with path
  return `${basePath}${cleanPath}`;
};

// Get dynamic base URLs from environment
export const getClientBaseUrl = (): string => {
  const base = import.meta.env.VITE_APP_BASE || import.meta.env.BASE_URL || '/';
  return base.endsWith('/') ? base : `${base}/`;
};

// Export API_BASE_URL and dynamic base URL for use in other parts of the application
export { API_BASE_URL };
export const CLIENT_BASE_URL = getClientBaseUrl();