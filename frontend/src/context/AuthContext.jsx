import { createContext, useContext, useMemo, useState } from "react";
import apiClient from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [adminName, setAdminName] = useState(() => localStorage.getItem("adminName"));

  const login = async (email, password) => {
    const response = await apiClient.post("auth/open/admin/login", { email, password });
    const { token: newToken, name } = response.data.data;

    localStorage.setItem("token", newToken);
    localStorage.setItem("adminName", name);
    setToken(newToken);
    setAdminName(name);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminName");
    setToken(null);
    setAdminName(null);
  };

  const value = useMemo(
    () => ({ token, adminName, isAuthenticated: Boolean(token), login, logout }),
    [token, adminName]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
