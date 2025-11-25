import axios, { AxiosInstance, AxiosError } from 'axios';

// API Configuration with fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

console.log('🔌 API Configuration:', {
  API_BASE_URL,
  API_URL,
  NODE_ENV: import.meta.env.MODE,
});

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors with better messages
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }

    // Log detailed error info
    console.error('❌ API Error:', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
      data: error.response?.data,
    });

    return Promise.reject(error);
  }
);

// Health check function
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_URL}/api/health`, {
      timeout: 5000,
    });
    return response.status === 200;
  } catch (error) {
    console.warn('⚠️ Backend health check failed:', error);
    return false;
  }
};

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================
export const authAPI = {
  signup: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/signup', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  profile: () =>
    api.get('/auth/profile'),
};

// ============================================
// REGEX AI GENERATION ENDPOINTS
// ============================================
export const regexAIAPI = {
  generate: (prompt: string) =>
    api.post('/ai/regex', { prompt }),
  
  getAll: () =>
    api.get('/ai/regex'),
  
  search: (query: string) =>
    api.get('/ai/regex/search', { params: { q: query } }),
  
  update: (id: string, data: { output: string; explanation: string }) =>
    api.put(`/ai/regex/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/ai/regex/${id}`),
};

// ============================================
// RULES ENDPOINTS
// ============================================
export const rulesAPI = {
  create: (data: {
    name: string;
    pattern: string;
    naturalLanguageInput?: string;
    flags?: string;
    folderId?: string;
  }) =>
    api.post('/rules', data),
  
  getAll: () =>
    api.get('/rules'),
  
  getById: (id: string) =>
    api.get(`/rules/${id}`),
  
  update: (id: string, data: { name?: string; pattern?: string; flags?: string }) =>
    api.put(`/rules/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/rules/${id}`),
  
  like: (id: string) =>
    api.post(`/rules/${id}/like`),
};

// ============================================
// FOLDERS ENDPOINTS
// ============================================
export const foldersAPI = {
  create: (data: { name: string }) =>
    api.post('/folders', data),
  
  getAll: () =>
    api.get('/folders'),
  
  getById: (id: string) =>
    api.get(`/folders/${id}`),
  
  update: (id: string, data: { name: string }) =>
    api.put(`/folders/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/folders/${id}`),
};

// ============================================
// TEST CASES ENDPOINTS
// ============================================
export const testcasesAPI = {
  create: (data: {
    ruleId: string;
    testInput: string;
    expectedOutput: string;
  }) =>
    api.post('/testcases', data),
  
  getAll: () =>
    api.get('/testcases'),
  
  getByRuleId: (ruleId: string) =>
    api.get('/testcases', { params: { ruleId } }),
  
  update: (id: string, data: { testInput?: string; expectedOutput?: string }) =>
    api.put(`/testcases/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/testcases/${id}`),
};

// ============================================
// GENERATION LOGS ENDPOINTS
// ============================================
export const generationLogsAPI = {
  getAll: () =>
    api.get('/generationlogs'),
  
  getById: (id: string) =>
    api.get(`/generationlogs/${id}`),
};

// ============================================
// REGEX ENDPOINTS (for testing)
// ============================================
export const regexAPI = {
  test: (pattern: string, testString: string, flags?: string) =>
    api.post('/regex', { pattern, testString, flags }),
};

// ============================================
// ERROR HANDLING UTILITIES
// ============================================
export const getErrorMessage = (error: any): string => {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return 'Bağlantı zaman aşımına uğradı. Lütfen Backend sunucusunun çalıştığını kontrol edin.';
    }
    if (error.code === 'ERR_NETWORK') {
      return 'Ağ hatası. Backend sunucusuna bağlanılamıyor. Lütfen http://localhost:8000 adresini kontrol edin.';
    }
    if (error.response?.status === 404) {
      return 'İstenen kaynak bulunamadı.';
    }
    if (error.response?.status === 401) {
      return 'Oturum süresi dolmuş. Lütfen tekrar giriş yapın.';
    }
    if (error.response?.status === 500) {
      return 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
    }
    return error.response?.data?.message || error.message || 'Bir hata oluştu.';
  }
  return 'Bilinmeyen bir hata oluştu.';
};

export default api;
