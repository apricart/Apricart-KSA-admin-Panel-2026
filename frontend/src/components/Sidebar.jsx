import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  DashboardIcon,
  ProductsIcon,
  BannerIcon,
  UsersIcon,
  SettingsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
} from "./icons";

const NAV_ITEMS = [
  { label: "Orders Dashboard", path: "/", icon: DashboardIcon },
  { label: "Products", path: "/products", icon: ProductsIcon },
  { label: "Banners", path: "/banners", icon: BannerIcon },
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
        <div className="h-16 px-4 flex items-center justify-center border-b border-[#152B59] overflow-hidden relative">
          {collapsed ? (
            <img
              src="/WebIconLogo.png"
              alt="Apricart Logo"
              className="w-9 h-9 object-contain shrink-0 mx-auto"
            />
          ) : (
            <img
              src="/ApricartWhiteLogo.png"
              alt="Apricart KSA"
              className="h-8 max-w-[180px] object-contain mx-auto"
            />
          )}

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="md:hidden absolute right-3 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
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
