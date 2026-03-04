import React, { createContext, useContext, useState, useEffect } from "react";
import { AUTH_TOKEN_KEY } from "../services/api";
import AuthService from "../services/AuthService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      setUser({ token });
    }
  }, []);

  const login = async (credentials) => {
    const { data } = await AuthService.login(credentials);
    const token = data.token;
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    setUser({ token });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  };

  const value = {
    user,
    isLoggedIn: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
