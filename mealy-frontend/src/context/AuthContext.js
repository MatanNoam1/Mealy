import { createContext, useContext, useEffect, useState } from 'react';
import * as authService from '../services/auth.service';

const AuthContext = createContext(null);

const TOKEN_KEY = 'mealy_token';
const USER_KEY = 'mealy_user';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // Restore the saved session from localStorage on first mount so a page
  // refresh keeps the user logged in.
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedToken) setToken(storedToken);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(USER_KEY);
      }
    }
    setReady(true);
  }, []);

  // Logs in, stores the token and userId (so the api layer can attach the
  // x-user-id header), then loads the full profile from /users/me.
  const login = async (email, password) => {
    const { userId, token: newToken } = await authService.login(email, password);
    localStorage.setItem(TOKEN_KEY, newToken);
    // Store the id first so the request interceptor can attach x-user-id when
    // the profile is fetched below.
    localStorage.setItem(USER_KEY, JSON.stringify({ userId }));
    setToken(newToken);

    const profile = await authService.getCurrentUser();
    localStorage.setItem(USER_KEY, JSON.stringify(profile));
    setUser(profile);
    return profile;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      /* logout is best-effort; clear local state regardless */
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  // Lets other pages (such as Settings) refresh the cached profile.
  const updateUser = (next) => {
    setUser(next);
    localStorage.setItem(USER_KEY, JSON.stringify(next));
  };

  const value = {
    token,
    user,
    ready,
    isAuthenticated: !!token,
    login,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
