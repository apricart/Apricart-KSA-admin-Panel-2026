import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { authService } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [adminName, setAdminName] = useState(() => localStorage.getItem("adminName"));
  const [adminEmail, setAdminEmail] = useState(() => localStorage.getItem("adminEmail"));
  const [settings, setSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState(null);

  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true);
    setSettingsError(null);
    try {
      const response = await authService.getSettings();
      setSettings(response.data?.data || response.data);
    } catch (err) {
      setSettingsError("Could not load system settings.");
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchSettings();
    }
  }, [token, fetchSettings]);

  const login = async (email, password) => {
    const response = await authService.loginAdmin({ email, password });
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
    setSettings(null);
  };

  const value = useMemo(
    () => ({
      token,
      adminName: adminName || "Admin User",
      adminEmail: adminEmail || "sameer456@gmail.com",
      isAuthenticated: Boolean(token),
      settings,
      settingsLoading,
      settingsError,
      fetchSettings,
      login,
      logout,
    }),
    [token, adminName, adminEmail, settings, settingsLoading, settingsError, fetchSettings]
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
