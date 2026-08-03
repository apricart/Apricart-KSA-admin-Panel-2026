import { createContext, useContext, useMemo, useState } from "react";
import apiClient from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [adminName, setAdminName] = useState(() => localStorage.getItem("adminName"));
  const [adminEmail, setAdminEmail] = useState(() => localStorage.getItem("adminEmail"));

  const login = async (email, password) => {
    const response = await apiClient.post("auth/open/admin/login", { email, password });
    const { token: newToken, name } = response.data.data;

    localStorage.setItem("token", newToken);
    localStorage.setItem("adminName", name);
    localStorage.setItem("adminEmail", email);
    setToken(newToken);
    setAdminName(name);
    setAdminEmail(email);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminEmail");
    setToken(null);
    setAdminName(null);
    setAdminEmail(null);
  };

  const value = useMemo(
    () => ({
      token,
      adminName: adminName || "Admin User",
      adminEmail: adminEmail || "sameer456@gmail.com",
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, adminName, adminEmail]
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
