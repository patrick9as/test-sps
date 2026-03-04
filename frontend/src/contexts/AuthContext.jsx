import React, { createContext, useContext, useState, useEffect } from "react";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "../services/api";
import AuthService from "../services/AuthService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const storedUser = localStorage.getItem(AUTH_USER_KEY);
    if (token) {
      const parsed = storedUser ? JSON.parse(storedUser) : null;
      setUser(parsed ? { token, ...parsed } : { token });
    }
  }, []);

  const login = async (credentials) => {
    const { data } = await AuthService.login(credentials);
    const token = data.token;
    const userData = data.user || {};
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    if (userData.id) localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
    setUser({ token, ...userData });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  };

  const updateUser = (partial) => {
    if (!partial || !user) return;
    const next = { ...user, ...partial };
    setUser(next);
    const token = next.token;
    if (token) {
      const { token: _, ...toStore } = next;
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(toStore));
    }
  };

  const value = {
    user,
    isLoggedIn: !!user?.token,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
