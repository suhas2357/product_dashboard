import { createContext, useCallback, useMemo, useState } from 'react';
import { loginUser as loginApi } from '../services/authService.js';
import { getToken, getUser, setToken, setUser, clearAuth } from '../utils/storage.js';

export const AuthContext = createContext(null);

const buildAuthUser = (data) => ({
  id: data.id,
  username: data.username,
  firstName: data.firstName,
  lastName: data.lastName,
  email: data.email,
  image: data.image,
});

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(() => getToken());
  const [user, setUserState] = useState(() => getUser());

  const isAuthenticated = Boolean(token);

  const login = useCallback(async (username, password) => {
    const data = await loginApi(username, password);

    // ✅ DummyJSON returns `accessToken`
    const authToken = data.accessToken;

    if (!authToken || typeof authToken !== 'string') {
      throw new Error('Login failed: no access token returned by the server.');
    }

    const authUser = buildAuthUser(data);

    // Persist to localStorage
    setToken(authToken);
    setUser(authUser);

    // Update React state
    setTokenState(authToken);
    setUserState(authUser);

    return data;
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setTokenState(null);
    setUserState(null);
  }, []);

  const value = useMemo(
    () => ({ token, user, isAuthenticated, login, logout }),
    [token, user, isAuthenticated, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};