import axios from 'axios';

// Single axios instance for the whole app. Base URL points at the backend
// REST API (Assignment 2 server). See .env -> REACT_APP_API_BASE.
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || 'http://localhost:3000/api'
});

// The backend is a mock auth server: it identifies the current user from the
// x-user-id header and enforces roles via x-user-role. We attach both from the
// stored login profile on every request so /users/me, /settings and protected
// writes work.
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('mealy_user');
    if (raw) {
      const user = JSON.parse(raw);
      if (user.userId) config.headers['x-user-id'] = user.userId;
      if (user.userRole) config.headers['x-user-role'] = user.userRole;
    }
  } catch {
    /* ignore malformed storage */
  }
  return config;
});

// The backend wraps every response in { success, data, error }. Unwrap it here
// so callers receive plain data, and turn { success: false } into a thrown
// Error carrying the backend message.
api.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === 'object' && 'success' in body) {
      if (!body.success) {
        throw new Error(body.error?.message || 'Request failed.');
      }
      return body.data;
    }
    return body;
  },
  (error) => {
    const message =
      error.response?.data?.error?.message ||
      error.message ||
      'Network error. Is the backend running on http://localhost:3000?';
    return Promise.reject(new Error(message));
  }
);

export default api;
