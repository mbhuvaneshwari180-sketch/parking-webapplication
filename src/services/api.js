import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-attach JWT token if present in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('parkingspot_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept 401 Unauthorized responses to clear token if expired
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token is invalid or expired, clear it
      if (localStorage.getItem('parkingspot_token')) {
        localStorage.removeItem('parkingspot_token');
        localStorage.removeItem('parkingspot_user');
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const parkingAPI = {
  getAll: (params) => api.get('/parkings', { params }),
  getById: (id) => api.get(`/parkings/${id}`),
  getSlots: (id) => api.get(`/parkings/${id}/slots`),
  create: (data) => api.post('/parkings', data),
  update: (id, data) => api.patch(`/parkings/${id}`, data),
  delete: (id) => api.delete(`/parkings/${id}`),
  uploadImage: (id, imageData) => api.post(`/parkings/${id}/image`, { imageData }),
  getUploadSignature: () => api.get('/parkings/upload-signature'),
  addSlot: (parkingId, slotData) => api.post(`/parkings/${parkingId}/slots`, slotData),
  updateSlot: (slotId, slotData) => api.patch(`/parkings/slots/${slotId}`, slotData),
  deleteSlot: (slotId) => api.delete(`/parkings/slots/${slotId}`),
};

export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  getMine: () => api.get('/bookings/mine'),
  getById: (id) => api.get(`/bookings/${id}`),
  pay: (id, paymentData) => api.post(`/bookings/${id}/pay`, paymentData),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),
};

export const analyticsAPI = {
  getOwnerAnalytics: (params) => api.get('/analytics/owner', { params }),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (id, status) => api.patch(`/admin/users/${id}`, { status }),
  getParkings: () => api.get('/admin/parkings'),
};

export const masterAPI = {
  getOverview: () => api.get('/master/overview'),
  updateUserRole: (id, role) => api.patch(`/master/users/${id}/role`, { role }),
  updateUserStatus: (id, status) => api.patch(`/master/users/${id}/status`, { status }),
  deleteUser: (id) => api.delete(`/master/users/${id}`),
  overrideBooking: (id, action, note) => api.patch(`/master/bookings/${id}/override`, { action, note }),
  getAuditLogs: (params) => api.get('/master/audit-logs', { params }),
  getSettings: () => api.get('/master/settings'),
  updateSettings: (config) => api.patch('/master/settings', config),
};

export default api;
