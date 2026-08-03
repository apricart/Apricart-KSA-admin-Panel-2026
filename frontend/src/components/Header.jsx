import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import SettingsModal from "./SettingsModal";
import {
  SunIcon,
  MoonIcon,
  BellIcon,
  LogoutIcon,
  LockIcon,
  MenuIcon,
  RefreshIcon,
} from "./icons";

function getInitials(name, email) {
  if (name && name !== "Admin User") {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }
  if (email) {
    return email.substring(0, 2).toUpperCase();
  }
  return "SG";
}

export default function Header({ onMenuClick, onRefresh, refreshing }) {
  const { adminName, adminEmail, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const profileRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = getInitials(adminName, adminEmail);

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white/85 dark:bg-[#131926]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 md:px-8 flex items-center justify-between transition-colors duration-200">
        {/* Left side: Mobile menu toggle + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden transition-colors"
            aria-label="Open sidebar"
          >
            <MenuIcon />
          </button>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              Orders Dashboard
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Track, filter, and manage customer order fulfillments
            </p>
          </div>
        </div>

        {/* Right side: Actions & Profile Menu */}
        <div className="flex items-center gap-2 md:gap-3" ref={profileRef}>
          {/* Quick Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className={`p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold ${
                refreshing ? "opacity-50" : ""
              }`}
              title="Refresh Orders Data"
            >
              <RefreshIcon className={refreshing ? "animate-spin text-amber-500" : ""} />
              <span className="hidden lg:inline">Refresh</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all"
            aria-label="Toggle Theme"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <SunIcon className="text-amber-400" />
            ) : (
              <MoonIcon className="text-slate-700" />
            )}
          </motion.button>

          {/* Notification Bell Button */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all relative"
              title="Notifications"
            >
              <BellIcon />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            </motion.button>

            {/* Notifications Dropdown Animated */}
            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 text-xs z-50"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">Notifications</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-semibold text-[10px]">
                      New
                    </span>
                  </div>
                  <div className="space-y-2 text-slate-600 dark:text-slate-300">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">5 New Pending Orders</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Orders received in the last hour.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Vertical Divider */}
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* Profile Avatar & Dropdown Container */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-blue-400/50 transition-all"
              title="Account Options"
            >
              {initials}
            </motion.button>

            {/* Profile Dropdown Menu */}
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-50"
                >
                  {/* Dropdown Header: Admin Email */}
                  <div className="p-4 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800/80">
                    <p className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      Admin panel
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                      {adminEmail}
                    </p>
                  </div>

                  {/* Options List */}
                  <div className="p-2 space-y-1">
                    {/* System Settings Option */}
                    <motion.div
                      whileHover={{ x: 3 }}
                      onClick={() => {
                        setProfileOpen(false);
                        setSettingsOpen(true);
                      }}
                      className="group flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <RefreshIcon />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          System Settings
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          View API System Config (GET auth/open/settings)
                        </p>
                      </div>
                    </motion.div>

                    {/* Change Password Option */}
                    <motion.div
                      whileHover={{ x: 3 }}
                      onClick={() => alert("Change password feature coming soon!")}
                      className="group flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <LockIcon />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          Change Password
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Update your account password
                        </p>
                      </div>
                    </motion.div>

                    {/* Sign Out Option */}
                    <motion.div
                      whileHover={{ x: 3 }}
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                      }}
                      className="group flex items-center gap-3.5 p-3 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 cursor-pointer transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                        <LogoutIcon />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                          Sign out
                        </p>
                        <p className="text-[11px] text-rose-400 dark:text-rose-400/80 mt-0.5">
                          Log out of your account
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Render System Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
