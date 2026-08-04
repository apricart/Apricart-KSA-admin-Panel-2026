import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  DashboardIcon,
  ProductsIcon,
  UsersIcon,
  SettingsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
} from "./icons";

const NAV_ITEMS = [
  { label: "Orders Dashboard", path: "/", icon: DashboardIcon, active: true },
  { label: "Products", path: "/products", icon: ProductsIcon },
  { label: "Customers", path: "/customers", icon: UsersIcon, badge: "Soon" },
  { label: "Settings", path: "/settings", icon: SettingsIcon, badge: "Soon" },
];

export default function Sidebar({ isOpen, onClose, collapsed, setCollapsed }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container with Framer Motion */}
      <motion.aside
        animate={{
          width: collapsed ? 80 : 256,
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={`fixed top-0 left-0 z-50 h-full bg-[#0B1B3D] border-r border-[#152B59] text-slate-200 flex flex-col dark:bg-[#07122B] dark:border-slate-800/80 shadow-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } transition-transform duration-300 md:transition-none`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#152B59] overflow-hidden">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FFC500] to-[#F97316] flex items-center justify-center text-[#0B1B3D] font-black text-xl shadow-lg shadow-[#FFC500]/20 shrink-0 cursor-pointer border border-[#FFC500]/40"
            >
              A
            </motion.div>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col whitespace-nowrap"
              >
                <span className="font-bold tracking-tight text-white leading-none text-lg">
                  Apricart <span className="text-[#FFC500] font-black text-sm">KSA</span>
                </span>
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mt-1">
                  Admin Panel
                </span>
              </motion.div>
            )}
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap"
            >
              Navigation
            </motion.div>
          )}

          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => onClose && onClose()}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-[#FFC500]/15 text-[#FFC500] border border-[#FFC500]/30 shadow-xs"
                    : "text-slate-300 hover:text-white hover:bg-[#132854]"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? "text-[#FFC500]" : "text-slate-400 group-hover:text-slate-100"
                  }`}
                />
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="truncate flex-1 whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
                {!collapsed && item.badge && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-1.5 py-0.5 text-[10px] font-semibold rounded-md bg-[#132854] text-slate-300 border border-[#1d3a77]"
                  >
                    {item.badge}
                  </motion.span>
                )}

                {/* Active Indicator Bar */}
                {isActive && (
                  <motion.span
                    layoutId="activeNavIndicator"
                    className="absolute right-0 top-2 bottom-2 w-1.5 rounded-l-full bg-[#FFC500] shadow-sm shadow-[#FFC500]"
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer Collapse Toggle */}
        <div className="p-3 border-t border-slate-800/80 hidden md:block">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors text-xs font-semibold"
          >
            {collapsed ? (
              <ChevronRightIcon />
            ) : (
              <>
                <ChevronLeftIcon />
                <span className="whitespace-nowrap">Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
