import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function MainLayout({ children, onRefresh, refreshing }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { theme } = useTheme();

  // Re-apply user's selected theme whenever entering MainLayout / Dashboard
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0d0f17] text-slate-900 dark:text-slate-100 flex transition-colors duration-200 overflow-x-hidden">
      {/* Responsive Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main Content Area - Dynamic Padding based on Sidebar Collapse */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          collapsed ? "md:pl-20" : "md:pl-64"
        }`}
      >
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          onRefresh={onRefresh}
          refreshing={refreshing}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
