import api from './api';

// POST /api/auth/login -> { userId, token }
export const login = (email, password) =>
  api.post('/auth/login', { email, password });

// POST /api/auth/logout -> { message }
export const logout = () => api.post('/auth/logout');

// GET /api/users/me -> current user profile
export const getCurrentUser = () => api.get('/users/me');
