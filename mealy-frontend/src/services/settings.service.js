import api from './api';

// GET /api/settings -> { userId, firstName, lastName, email, theme, dietaryPreferences }
export const getSettings = () => api.get('/settings');

// PUT /api/settings -> updated settings
export const updateSettings = (settings) => api.put('/settings', settings);
