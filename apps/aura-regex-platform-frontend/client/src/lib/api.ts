import axios, { AxiosInstance, AxiosError } from 'axios';

// API Konfigürasyonu (Yedekli yapı)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

console.log('🔌 API Konfigürasyonu:', {
  API_BASE_URL,
  API_URL,
  NODE_ENV: import.meta.env.MODE,
});

// Axios örneği oluştur
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 saniye zaman aşımı (AI işlemleri uzun sürebilir)
});

// İsteklere Token Ekleme Interceptor'ı
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Yanıtları ve Hataları İşleme Interceptor'ı
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token süresi dolmuş veya geçersiz
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Eğer zaten login sayfasında değilsek yönlendir
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }

    // Detaylı hata loglama
    console.error('❌ API Hatası:', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
      data: error.response?.data,
    });

    return Promise.reject(error);
  }
);

// Backend Sağlık Kontrolü
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_URL}/api/health`, {
      timeout: 5000,
    });
    return response.status === 200;
  } catch (error) {
    console.warn('⚠️ Backend sağlık kontrolü başarısız:', error);
    return false;
  }
};

// ============================================
// KİMLİK DOĞRULAMA (AUTH) ENDPOINTLERİ
// ============================================
export const authAPI = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  signup: (data: { email: string; password: string; username?: string }) =>
    api.post('/auth/signup', data),

  profile: () => api.get('/auth/profile'),

  logout: () => api.post('/auth/logout'),
};

// ============================================
// REGEX AI ENDPOINTLERİ
// ============================================
export const regexAIAPI = {
  // Backend Route: POST /api/ai/regex
  generate: (prompt: string, generationType: 'DAILY' | 'ACADEMIC' = 'DAILY') =>
    api.post('/ai/regex', { prompt, generationType }),

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
// KURALLAR (RULES) ENDPOINTLERİ
// ============================================
export const rulesAPI = {
  // Backend Route: POST /api/rules
  create: (data: any) =>
    api.post('/rules', {
      name: data.name,
      regex: data.pattern,
      naturalLang: data.naturalLanguageInput,
      description: data.description,
      folderId: data.folderId,
      isPublic: data.isPublic, // ✅ Support Public/Private
      // flags: data.flags // Backend doesn't support flags yet
    }),

  getAll: () =>
    api.get('/rules'),

  getPublic: () => api.get('/rules/public'), // 🌍 Get Public Rules

  getById: (id: string) =>
    api.get(`/rules/${id}`),

  update: (id: string, data: any) =>
    api.put(`/rules/${id}`, data),

  delete: (id: string) =>
    api.delete(`/rules/${id}`),

  like: (id: string) => api.post(`/rules/${id}/like`), // 💙 Like
  unlike: (id: string) => api.delete(`/rules/${id}/like`), // 💔 Unlike

  // 💬 Comments
  addComment: (id: string, content: string) => api.post(`/rules/${id}/comments`, { content }),
  getComments: (id: string) => api.get(`/rules/${id}/comments`),

  // 👁️ Visibility
  toggleVisibility: (id: string, isPublic: boolean) => api.put(`/rules/${id}/visibility`, { isPublic }),
};

// ============================================
// KLASÖRLER (FOLDERS) ENDPOINTLERİ
// ============================================
export const foldersAPI = {
  // Backend Route: POST /api/folders
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
// TEST SENARYOLARI (TEST CASES) ENDPOINTLERİ
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
// LOGLAR (GENERATION LOGS) ENDPOINTLERİ
// ============================================
export const generationLogsAPI = {
  getAll: () =>
    api.get('/logs'),

  // Backend'de getById henüz yoksa bunu kullanma veya backend'e ekle
  getById: (id: string) =>
    api.get(`/generationlogs/${id}`),
};

// ============================================
// REGEX TEST (Canlı Test) ENDPOINTLERİ
// ============================================
export const regexAPI = {
  // Backend Route: POST /api/regex/test
  test: (pattern: string, testString: string, flags?: string) =>
    api.post('/regex/test', { regex: pattern, testText: testString, flags }),
};

// ============================================
// KULLANICI YÖNETİMİ (ADMIN) ENDPOINTLERİ
// ============================================
export const usersAPI = {
  getAll: () => api.get('/users'),
  getStats: () => api.get('/users/stats'), // ✅ Stats API
  ban: (userId: string) => api.put(`/users/${userId}/ban`),
  unban: (userId: string) => api.put(`/users/${userId}/unban`),
};

// ============================================
// HATA YÖNETİMİ YARDIMCISI
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
      return 'İstenen işlem veya kaynak bulunamadı (404).';
    }
    if (error.response?.status === 401) {
      return 'Oturum süresi dolmuş. Lütfen tekrar giriş yapın.';
    }
    if (error.response?.status === 429) {
      return 'Çok fazla istek gönderdiniz. Lütfen biraz bekleyin.';
    }
    if (error.response?.status === 500) {
      return 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
    }
    return error.response?.data?.message || error.message || 'Bir hata oluştu.';
  }
  return 'Bilinmeyen bir hata oluştu.';
};

export default api;