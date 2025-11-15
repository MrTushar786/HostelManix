import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://hostelmanix0.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('role');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (id, password, role) =>
    api.post('/auth/login', { id, password, role }),
  register: (username, password, role, studentId) =>
    api.post('/auth/register', { username, password, role, studentId }),
};

// Students API
export const studentsAPI = {
  getAll: () => api.get('/students'),
  getById: (id) => api.get(`/students/${id}`),
  getByStudentId: (studentId) => api.get(`/students/by-student-id/${studentId}`),
  getByRoom: (roomId) => api.get(`/students/room/${roomId}`),
  getMe: () => api.get('/students/me'),
  updateMe: (data) => api.put('/students/me', data),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
};

// Rooms API
export const roomsAPI = {
  getAll: () => api.get('/rooms'),
  getById: (id) => api.get(`/rooms/${id}`),
  getByRoomNumber: (roomNumber) => api.get(`/rooms/number/${roomNumber}`),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`),
};

// Fees API
export const feesAPI = {
  getAll: () => api.get('/fees'),
  getById: (id) => api.get(`/fees/${id}`),
  getByStudent: (studentId) => api.get(`/fees/student/${studentId}`),
  create: (data) => api.post('/fees', data),
  update: (id, data) => api.put(`/fees/${id}`, data),
  delete: (id) => api.delete(`/fees/${id}`),
};

// Leaves API
export const leavesAPI = {
  getAll: () => api.get('/leaves'),
  getById: (id) => api.get(`/leaves/${id}`),
  getByStudent: (studentId) => api.get(`/leaves/student/${studentId}`),
  create: (data) => api.post('/leaves', data),
  update: (id, data) => api.put(`/leaves/${id}`, data),
  delete: (id) => api.delete(`/leaves/${id}`),
};

// Complaints API
export const complaintsAPI = {
  getAll: () => api.get('/complaints'),
  getById: (id) => api.get(`/complaints/${id}`),
  getByStudent: (studentId) => api.get(`/complaints/student/${studentId}`),
  create: (data) => api.post('/complaints', data),
  update: (id, data) => api.put(`/complaints/${id}`, data),
  delete: (id) => api.delete(`/complaints/${id}`),
};

// Maintenance API
export const maintenanceAPI = {
  getAll: () => api.get('/maintenance'),
  getById: (id) => api.get(`/maintenance/${id}`),
  getByStudent: (studentId) => api.get(`/maintenance/student/${studentId}`),
  create: (data) => api.post('/maintenance', data),
  update: (id, data) => api.put(`/maintenance/${id}`, data),
  delete: (id) => api.delete(`/maintenance/${id}`),
};

// Attendance API
export const attendanceAPI = {
  getAll: (params) => api.get('/attendance', { params }),
  getById: (id) => api.get(`/attendance/${id}`),
  getByStudent: (studentId, params) => api.get(`/attendance/student/${studentId}`, { params }),
  getStats: (studentId) => api.get(`/attendance/student/${studentId}/stats`),
  create: (data) => api.post('/attendance', data),
  createBulk: (data) => api.post('/attendance/bulk', data),
  update: (id, data) => api.put(`/attendance/${id}`, data),
  delete: (id) => api.delete(`/attendance/${id}`),
};

// Mess Menu API
export const messMenuAPI = {
  getAll: () => api.get('/mess-menu'),
  getByDay: (day) => api.get(`/mess-menu/${day}`),
  create: (data) => api.post('/mess-menu', data),
  update: (day, data) => api.put(`/mess-menu/${day}`, data),
  delete: (day) => api.delete(`/mess-menu/${day}`),
};

export default api;
// Users
export const usersAPI = {
  changePassword: (currentPassword, newPassword) => api.post('/users/change-password', { currentPassword, newPassword }),
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data)
};

