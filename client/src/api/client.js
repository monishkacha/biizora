const API_BASE = import.meta.env.VITE_API_URL || '/api';

let accessToken = sessionStorage.getItem('biizora_access') || null;
let activeBusinessId = sessionStorage.getItem('biizora_business') || null;
let onUnauthorized = null;

export function setAccessToken(token) {
  accessToken = token;
  if (token) sessionStorage.setItem('biizora_access', token);
  else sessionStorage.removeItem('biizora_access');
}

export function getAccessToken() {
  return accessToken;
}

export function setActiveBusinessId(id) {
  activeBusinessId = id;
  if (id) sessionStorage.setItem('biizora_business', id);
  else sessionStorage.removeItem('biizora_business');
}

export function getActiveBusinessId() {
  return activeBusinessId;
}

export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

function clearLegacyStorage() {
  const keys = Object.keys(localStorage);
  keys.forEach((k) => {
    if (k.startsWith('amexora_')) localStorage.removeItem(k);
  });
}

export { clearLegacyStorage };

async function refreshAccessToken() {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) return null;
  const data = await res.json();
  setAccessToken(data.accessToken);
  return data;
}

export async function api(path, options = {}) {
  const { _retry, ...rest } = options;
  const headers = {
    'Content-Type': 'application/json',
    ...(rest.headers || {}),
  };

  if (options.body && options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (activeBusinessId) headers['X-Business-Id'] = activeBusinessId;

  const config = {
    ...rest,
    headers,
    credentials: 'include',
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  let res = await fetch(`${API_BASE}${path}`, config);

  if (res.status === 401 && !_retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed?.accessToken) {
      return api(path, { ...options, _retry: true });
    }
    setAccessToken(null);
    if (onUnauthorized) onUnauthorized();
    const err = await res.json().catch(() => ({ error: 'Unauthorized' }));
    throw Object.assign(new Error(err.error || 'Unauthorized'), { status: 401, data: err });
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(new Error(data.error || 'Request failed'), { status: res.status, data });
  }
  return data;
}

export const authApi = {
  register: (body) => api('/auth/register', { method: 'POST', body }),
  login: (body) => api('/auth/login', { method: 'POST', body }),
  logout: () => api('/auth/logout', { method: 'POST' }),
  me: () => api('/auth/me'),
  refresh: () => refreshAccessToken(),
  updateProfile: (body) => api('/auth/profile', { method: 'PATCH', body }),
  acceptInvite: (body) => api('/auth/accept-invite', { method: 'POST', body }),
};

export const businessApi = {
  list: () => api('/businesses'),
  create: (body) => api('/businesses', { method: 'POST', body }),
  get: (id) => api(`/businesses/${id}`),
  update: (id, body) => api(`/businesses/${id}`, { method: 'PATCH', body }),
  onboarding: (id, body) => api(`/businesses/${id}/onboarding`, { method: 'POST', body }),
};

export const membersApi = {
  list: () => api('/members'),
  invite: (body) => api('/members/invite', { method: 'POST', body }),
  updateRole: (memberId, body) => api(`/members/${memberId}`, { method: 'PATCH', body }),
  remove: (memberId) => api(`/members/${memberId}`, { method: 'DELETE' }),
};

export const customersApi = {
  list: () => api('/customers'),
  create: (body) => api('/customers', { method: 'POST', body }),
  update: (id, body) => api(`/customers/${id}`, { method: 'PATCH', body }),
  remove: (id) => api(`/customers/${id}`, { method: 'DELETE' }),
  gstSearch: (gstin) => api('/customers/gst-search', { method: 'POST', body: { gstin } }),
};

export const productsApi = {
  list: () => api('/products'),
  create: (body) => api('/products', { method: 'POST', body }),
  update: (id, body) => api(`/products/${id}`, { method: 'PATCH', body }),
  remove: (id) => api(`/products/${id}`, { method: 'DELETE' }),
};

export const invoicesApi = {
  list: () => api('/invoices'),
  nextNumber: () => api('/invoices/next-number'),
  create: (body) => api('/invoices', { method: 'POST', body }),
  updateStatus: (id, body) => api(`/invoices/${id}/status`, { method: 'PATCH', body }),
  remove: (id) => api(`/invoices/${id}`, { method: 'DELETE' }),
};

export const expensesApi = {
  list: () => api('/expenses'),
  create: (body) => api('/expenses', { method: 'POST', body }),
  remove: (id) => api(`/expenses/${id}`, { method: 'DELETE' }),
};

export const searchApi = {
  query: (q) => api(`/search?q=${encodeURIComponent(q)}`),
};

export const notificationsApi = {
  list: () => api('/notifications'),
  markRead: (id) => api(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => api('/notifications/read-all', { method: 'PATCH' }),
};

export const activityApi = {
  list: (page = 1) => api(`/activity?page=${page}`),
};

export const feedbackApi = {
  submit: (body) => api('/feedback', { method: 'POST', body }),
  list: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.q) qs.set('q', params.q);
    if (params.status) qs.set('status', params.status);
    if (params.sort) qs.set('sort', params.sort);
    const q = qs.toString();
    return api(`/feedback${q ? `?${q}` : ''}`);
  },
  get: (id) => api(`/feedback/${id}`),
  reply: (id, body) => api(`/feedback/${id}/replies`, { method: 'POST', body }),
  adminReply: (id, body) => api(`/feedback/admin/${id}/replies`, { method: 'POST', body }),
  adminStatus: (id, body) => api(`/feedback/admin/${id}/status`, { method: 'PATCH', body }),
};

export const supportApi = {
  center: () => api('/support/center'),
  requestSession: (body) => api('/support/sessions', { method: 'POST', body }),
  createRequest: (body) => api('/support/requests', { method: 'POST', body }),
};

export const migrationApi = {
  parse: (body) => api('/migration/parse', { method: 'POST', body }),
  process: (body) => api('/migration/process', { method: 'POST', body }),
  getHistory: () => api('/migration/history'),
  undo: (id) => api(`/migration/undo/${id}`, { method: 'POST' }),
  export: (format = 'json', scope = 'all') => api(`/migration/export?format=${format}&scope=${scope}`),
  createBackup: () => api('/migration/backup', { method: 'POST' }),
};

