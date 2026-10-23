export class ApiError extends Error {
  statusCode: number;
  data?: any;

  constructor(message: string, statusCode: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

const API_BASE = '/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

async function request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...customConfig } = options;

  let url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const token = localStorage.getItem('devflow_token');

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const response = await fetch(url, {
    ...customConfig,
    headers: defaultHeaders,
    credentials: 'include',
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const responseData = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMessage =
      (typeof responseData === 'object' && responseData !== null && (responseData.error || responseData.message)) ||
      `HTTP Error ${response.status}: ${response.statusText}`;
    throw new ApiError(errorMessage, response.status, responseData);
  }

  return responseData as T;
}

export const api = {
  get: <T = any>(url: string, options?: RequestOptions) =>
    request<T>(url, { method: 'GET', ...options }),

  post: <T = any>(url: string, body?: any, options?: RequestOptions) =>
    request<T>(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),

  put: <T = any>(url: string, body?: any, options?: RequestOptions) =>
    request<T>(url, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),

  patch: <T = any>(url: string, body?: any, options?: RequestOptions) =>
    request<T>(url, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),

  delete: <T = any>(url: string, options?: RequestOptions) =>
    request<T>(url, { method: 'DELETE', ...options }),
};
