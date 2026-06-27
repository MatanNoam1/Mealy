import api from './api';

// POST /api/auth/login -> { userId, token }
export const login = (email, password) =>
  api.post('/auth/login', { email, password });

// POST /api/auth/register -> { userId, userRole, token, user }
export const register = (payload) => api.post('/auth/register', payload);

// POST /api/auth/logout -> { message }
export const logout = () => api.post('/auth/logout');

// GET /api/users/me -> current user profile
export const getCurrentUser = () => api.get('/users/me');
