import React, { createContext, useContext, useState, useEffect } from "react";

const AUTH_KEY = "auth_user";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(AUTH_KEY);
      }
    }
  }, []);

  const login = (credentials) => {
    const mockUser = { email: credentials?.email ?? "user@mock", isLoggedIn: true };
    setUser(mockUser);
    localStorage.setItem(AUTH_KEY, JSON.stringify(mockUser));
    return Promise.resolve({ success: true });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
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
