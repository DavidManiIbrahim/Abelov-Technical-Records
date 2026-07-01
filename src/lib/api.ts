import { ServiceRequest, Goods, Purchase, Expense, Credit, Order } from '@/types/database';
import { getCache, setCache, invalidateCache } from '@/utils/storage';

// Memory cache keys (in-memory cache only, no persistence)
const getApiBase = () => {
  // 1. Prefer explicit environment variable
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL as string;
  }

  // 2. Check if running on localhost (runtime check)
  // This ensures that even a production build running locally uses local backend
  // and prevents deployed app from trying to hit localhost
  if (typeof window !== 'undefined') {
    const isLocal = window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.includes('192.168.');
    if (isLocal) {
      return 'http://localhost:4000/api/v1';
    }
  }

  // 3. Fallback to production backend
  return 'https://abelov-technical-records-backend.onrender.com/api/v1';
};

const API_BASE = getApiBase();
console.log('API Base URL:', API_BASE);

const apiFetch = async (path: string, init?: RequestInit) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  // Add Authorization header if token exists in localStorage (read freshly on each request)
  const token = localStorage.getItem('auth_token');
  if (token) {
    // @ts-ignore
    headers['Authorization'] = `Bearer ${token}`;
    // console.log('Attached auth token:', token.substring(0, 10) + '...');
  } else {
    console.warn('No auth token found in localStorage for request:', path);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: { ...headers, ...(init?.headers || {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const errorMsg = body?.error || body?.details || `API error ${res.status}`;
    throw new Error(errorMsg);
  }
  if (res.status === 204) return null;
  return res.json();
};

// Service Request API - All calls go to MongoDB backend
export const serviceRequestAPI = {
  async create(request: Omit<ServiceRequest, 'id' | 'created_at' | 'updated_at'>) {
    const res = await apiFetch('/requests', {
      method: 'POST',
      body: JSON.stringify(request)
    });
    const record = (res?.data || res) as ServiceRequest;
    setCache<ServiceRequest>(`service_request:${record.id}`, record);
    if (record.user_id) {
      invalidateCache(`service_requests:${record.user_id}`);
      invalidateCache(`stats:${record.user_id}`);
    }
    invalidateCache('admin_requests');
    invalidateCache('admin_global_stats');
    invalidateCache('service_requests');
    return record;
  },

  async getById(id: string, forceRefresh = false) {
    if (!forceRefresh) {
      const cached = getCache<ServiceRequest | null>(`service_request:${id}`);
      if (cached) return cached;
    }

    // Try the regular endpoint first (for authenticated users)
    // If not authenticated, the fetch helper handles authentication if token is available
    const token = localStorage.getItem('auth_token');
    const endpoint = token ? `/requests/${id}` : `/requests/public/${id}`;

    try {
      const res = await apiFetch(endpoint);
      const record = (res?.data || res) as ServiceRequest;
      setCache<ServiceRequest>(`service_request:${id}`, record);
      return record;
    } catch (err) {
      // Fallback to public if regular fails
      if (token) {
        const res = await apiFetch(`/requests/public/${id}`);
        const record = (res?.data || res) as ServiceRequest;
        setCache<ServiceRequest>(`service_request:${id}`, record);
        return record;
      }
      throw err;
    }
  },


  async getByUserId(userId: string, forceRefresh = false) {
    const key = `service_requests:${userId}`;
    if (!forceRefresh) {
      const cached = getCache<ServiceRequest[]>(key);
      if (cached) return cached;
    }
    const res = await apiFetch(`/requests?user_id=${userId}`);
    const list = (res?.data || res) as ServiceRequest[];
    setCache<ServiceRequest[]>(key, list);
    return list;
  },

  async getAll(forceRefresh = false) {
    const key = 'service_requests_global';
    if (!forceRefresh) {
      const cached = getCache<ServiceRequest[]>(key);
      if (cached) return cached;
    }
    const res = await apiFetch('/requests');
    const list = (res?.data || res) as ServiceRequest[];
    setCache<ServiceRequest[]>(key, list);
    return list;
  },

  async update(id: string, updates: Partial<ServiceRequest>) {
    const res = await apiFetch(`/requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    const record = (res?.data || res) as ServiceRequest;
    setCache<ServiceRequest>(`service_request:${record.id}`, record);
    if (record.user_id) {
      invalidateCache(`service_requests:${record.user_id}`);
      invalidateCache(`stats:${record.user_id}`);
    }
    invalidateCache('admin_requests');
    invalidateCache('admin_global_stats');
    invalidateCache('service_requests');
    return record;
  },

  async delete(id: string) {
    await apiFetch(`/requests/${id}`, { method: 'DELETE' });
    invalidateCache(`service_request:${id}`);
    invalidateCache('admin_requests');
    invalidateCache('admin_global_stats');
    invalidateCache('service_requests'); // Invalidate all list caches
  },

  async search(userId: string, query: string) {
    const res = await apiFetch(`/requests/search?user_id=${userId}&q=${encodeURIComponent(query)}`);
    const list = (res?.data || res) as ServiceRequest[];
    return list;
  },

  async getByStatus(userId: string, status: string) {
    const res = await apiFetch(`/requests?user_id=${userId}&status=${status}`);
    const list = (res?.data || res) as ServiceRequest[];
    return list;
  },

  async getStats(userId: string, forceRefresh = false) {
    const key = `stats:${userId}`;
    if (!forceRefresh) {
      const cached = getCache<{ total: number; completed: number; pending: number; inProgress: number; totalRevenue: number }>(key);
      if (cached) return cached;
    }
    const res = await apiFetch(`/requests/stats/${userId}`);
    const stats = res?.data || res;
    setCache(key, stats);
    return stats;
  },
};


// Admin API - All calls go to MongoDB backend
export const adminAPI = {
  async getAllUsersWithStats() {
    const res = await apiFetch('/admin/users');
    return (res?.data || res) as unknown[];
  },

  async getAllServiceRequests(limit = 100, offset = 0, forceRefresh = false) {
    const key = `admin_requests_limit=${limit}_offset=${offset}`;
    if (!forceRefresh) {
      const cached = getCache<{ requests: ServiceRequest[]; total: number }>(key);
      if (cached) return cached;
    }

    const res = await apiFetch(`/admin/requests?limit=${limit}&offset=${offset}`);
    const result = {
      requests: (res?.data || res?.requests || []) as ServiceRequest[],
      total: res?.total || 0
    };
    setCache(key, result);
    return result;
  },

  async getRequestsByStatus(status: string, limit = 100, offset = 0) {
    const res = await apiFetch(`/admin/requests?status=${status}&limit=${limit}&offset=${offset}`);
    return {
      requests: (res?.data || res?.requests || []) as ServiceRequest[],
      total: res?.total || 0
    };
  },

  async getActivityLogs(limit = 50, offset = 0) {
    const res = await apiFetch(`/admin/logs?limit=${limit}&offset=${offset}`);
    return {
      logs: (res?.data || res?.logs || []) as unknown[],
      total: res?.total || 0
    };
  },

  async getGlobalStats(forceRefresh = false) {
    const key = 'admin_global_stats';
    if (!forceRefresh) {
      const cached = getCache<{
        totalUsers: number;
        totalTickets: number;
        pendingTickets: number;
        completedTickets: number;
        inProgressTickets: number;
        unsuccessfulTickets: number;
        totalRevenue: number;
      }>(key);
      if (cached) return cached;
    }

    const res = await apiFetch('/admin/stats');
    const stats = res as {
      totalUsers: number;
      totalTickets: number;
      pendingTickets: number;
      completedTickets: number;
      inProgressTickets: number;
      unsuccessfulTickets: number;
      totalRevenue: number;
    };
    setCache(key, stats);
    return stats;
  },

  async searchRequests(query: string, limit = 50, offset = 0) {
    const res = await apiFetch(`/admin/requests/search?q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`);
    return {
      requests: (res?.data || res?.requests || []) as ServiceRequest[],
      total: res?.total || 0
    };
  },

  async getUserRoles(userId: string) {
    const res = await apiFetch(`/admin/users/${userId}/roles`);
    return (res?.data || res || []) as Array<{ role: string; assigned_at: string }>;
  },

  async assignRole(userId: string, role: string) {
    const res = await apiFetch(`/admin/users/${userId}/roles`, {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
    return res?.data || res;
  },

  async removeRole(userId: string, role: string) {
    const res = await apiFetch(`/admin/users/${userId}/roles/${role}`, {
      method: 'DELETE',
    });
    return res?.data || res;
  },

  async toggleUserStatus(userId: string, isActive: boolean) {
    const res = await apiFetch(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ is_active: isActive }),
    });
    return res?.data || res;
  },

  async createUser(data: any) {
    const res = await apiFetch('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res?.data || res;
  },

  async deleteUser(userId: string) {
    const res = await apiFetch(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
    return res?.data || res;
  },
};


// Auth API - all calls go to backend, token cached after success
export const authAPI = {
  async signup(email: string, password: string, role?: 'user' | 'admin') {
    const res = await apiFetch('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
    const user = res?.user || res;
    return user;
  },

  async login(email: string, password: string) {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const user = res?.user || res;
    // Attach token to user object so it can be saved in AuthContext
    if (res?.token && typeof user === 'object') {
      user.token = res.token;
    }
    return user;
  },

  async me() {
    const res = await apiFetch('/auth/me');
    const user = res?.user || res;
    return user;
  },

  async logout() {
    await apiFetch('/auth/logout', {
      method: 'POST',
    });
  },

  async updateProfile(data: { username?: string; profile_image?: string }) {
    const res = await apiFetch('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res?.user || res;
  },
};

// Goods API - Inventory management
export const goodsAPI = {
  async getAll(userId: string) {
    const res = await apiFetch(`/goods?user_id=${userId}`);
    const list = (res?.data || res) as Goods[];
    return list;
  },

  async getById(id: string) {
    const res = await apiFetch(`/goods/${id}`);
    return (res?.data || res) as Goods;
  },

  async create(goods: Omit<Goods, 'id' | 'created_at' | 'updated_at'>) {
    const res = await apiFetch('/goods', {
      method: 'POST',
      body: JSON.stringify(goods),
    });
    return (res?.data || res) as Goods;
  },

  async update(id: string, updates: Partial<Goods>) {
    const res = await apiFetch(`/goods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return (res?.data || res) as Goods;
  },

  async delete(id: string) {
    await apiFetch(`/goods/${id}`, { method: 'DELETE' });
  },
};

// Purchases API
export const purchasesAPI = {
  async getAll(userId: string) {
    const res = await apiFetch(`/purchases?user_id=${userId}`);
    return (res?.data || res) as Purchase[];
  },

  async getById(id: string) {
    const res = await apiFetch(`/purchases/${id}`);
    return (res?.data || res) as Purchase;
  },

  async create(purchase: Omit<Purchase, 'id' | 'created_at' | 'updated_at'>) {
    const res = await apiFetch('/purchases', {
      method: 'POST',
      body: JSON.stringify(purchase),
    });
    return (res?.data || res) as Purchase;
  },

  async update(id: string, updates: Partial<Purchase>) {
    const res = await apiFetch(`/purchases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return (res?.data || res) as Purchase;
  },

  async delete(id: string) {
    await apiFetch(`/purchases/${id}`, { method: 'DELETE' });
  },
};

// Expenses API
export const expensesAPI = {
  async getAll(userId: string) {
    const res = await apiFetch(`/expenses?user_id=${userId}`);
    return (res?.data || res) as Expense[];
  },

  async getById(id: string) {
    const res = await apiFetch(`/expenses/${id}`);
    return (res?.data || res) as Expense;
  },

  async create(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) {
    const res = await apiFetch('/expenses', {
      method: 'POST',
      body: JSON.stringify(expense),
    });
    return (res?.data || res) as Expense;
  },

  async update(id: string, updates: Partial<Expense>) {
    const res = await apiFetch(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return (res?.data || res) as Expense;
  },

  async delete(id: string) {
    await apiFetch(`/expenses/${id}`, { method: 'DELETE' });
  },
};

// Credits API
export const creditsAPI = {
  async getAll(userId: string) {
    const res = await apiFetch(`/credits?user_id=${userId}`);
    return (res?.data || res) as Credit[];
  },

  async getById(id: string) {
    const res = await apiFetch(`/credits/${id}`);
    return (res?.data || res) as Credit;
  },

  async create(credit: Omit<Credit, 'id' | 'created_at' | 'updated_at'>) {
    const res = await apiFetch('/credits', {
      method: 'POST',
      body: JSON.stringify(credit),
    });
    return (res?.data || res) as Credit;
  },

  async update(id: string, updates: Partial<Credit>) {
    const res = await apiFetch(`/credits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return (res?.data || res) as Credit;
  },

  async delete(id: string) {
    await apiFetch(`/credits/${id}`, { method: 'DELETE' });
  },
};

// Orders API
export const ordersAPI = {
  async getAll(userId: string) {
    const res = await apiFetch(`/orders?user_id=${userId}`);
    return (res?.data || res) as Order[];
  },

  async getById(id: string) {
    const res = await apiFetch(`/orders/${id}`);
    return (res?.data || res) as Order;
  },

  async create(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) {
    const res = await apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
    return (res?.data || res) as Order;
  },

  async update(id: string, updates: Partial<Order>) {
    const res = await apiFetch(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return (res?.data || res) as Order;
  },

  async delete(id: string) {
    await apiFetch(`/orders/${id}`, { method: 'DELETE' });
  },
};
