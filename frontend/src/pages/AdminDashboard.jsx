import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import apiClient from "../api/client";
import MainLayout from "../components/MainLayout";
import {
  DashboardIcon,
  ProductsIcon,
  BannerIcon,
  PackageIcon,
  CheckCircleIcon,
  ClockIcon,
  RefreshIcon,
  ArrowRightIcon,
} from "../components/icons";
import { Skeleton } from "../components/Skeleton";

// Timeframe options
const TIMEFRAME_OPTIONS = [
  { label: "Last 6 Months", value: "6months" },
  { label: "Last Month", value: "1month" },
  { label: "Last Week", value: "1week" },
];

// Interactive Area Chart Component
function TrendAreaChart({ title, colorTheme = "blue", initialTimeframe = "6months", dataPoints }) {
  const [timeframe, setTimeframe] = useState(initialTimeframe);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Colors based on theme
  const themeConfig = {
    blue: {
      stroke: "#3B82F6",
      fillGradientStart: "#3B82F6",
      fillGradientEnd: "rgba(59, 130, 246, 0.0)",
      badgeBg: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },
    orange: {
      stroke: "#F97316",
      fillGradientStart: "#F97316",
      fillGradientEnd: "rgba(249, 115, 22, 0.0)",
      badgeBg: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    },
    purple: {
      stroke: "#8B5CF6",
      fillGradientStart: "#8B5CF6",
      fillGradientEnd: "rgba(139, 92, 246, 0.0)",
      badgeBg: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    },
  }[colorTheme] || {
    stroke: "#3B82F6",
    fillGradientStart: "#3B82F6",
    fillGradientEnd: "rgba(59, 130, 246, 0.0)",
    badgeBg: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  };

  // Mock data mapping per timeframe
  const pointsData = {
    "6months": [
      { label: "Mar", value: 0 },
      { label: "Apr", value: 0 },
      { label: "May", value: 0 },
      { label: "Jun", value: 0 },
      { label: "Jul", value: 12 },
      { label: "Aug", value: 4 },
    ],
    "1month": [
      { label: "W1", value: 2 },
      { label: "W2", value: 5 },
      { label: "W3", value: 9 },
      { label: "W4", value: 16 },
    ],
    "1week": [
      { label: "Mon", value: 1 },
      { label: "Tue", value: 3 },
      { label: "Wed", value: 7 },
      { label: "Thu", value: 4 },
      { label: "Fri", value: 9 },
      { label: "Sat", value: 12 },
      { label: "Sun", value: 16 },
    ],
  }[timeframe] || dataPoints || [];

  const width = 360;
  const height = 180;
  const paddingX = 30;
  const paddingY = 25;

  const maxValue = Math.max(...pointsData.map((d) => d.value), 16);

  // Compute SVG Points
  const points = pointsData.map((d, index) => {
    const x = paddingX + (index / (pointsData.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - (d.value / maxValue) * (height - paddingY * 2);
    return { x, y, ...d };
  });

  // Build SVG Path (Cubic Bezier for smooth curves)
  const pathD = points.reduce((acc, point, i, a) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = a[i - 1];
    const cx1 = prev.x + (point.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (point.x - prev.x) / 2;
    const cy2 = point.y;
    return `${acc} C ${cx1},${cy1} ${cx2},${cy2} ${point.x},${point.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x},${height - paddingY} L ${points[0].x},${height - paddingY} Z`;

  const gradientId = `gradient-${colorTheme}-${title.replace(/\s+/g, "")}`;

  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#131926] shadow-sm flex flex-col justify-between space-y-4">
      {/* Header & Filter Dropdown */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900 dark:text-white text-base">{title}</h3>
        <div className="relative">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
          >
            {TIMEFRAME_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative w-full h-48 flex items-center justify-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={themeConfig.fillGradientStart} stopOpacity="0.4" />
              <stop offset="100%" stopColor={themeConfig.fillGradientStart} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Dotted Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingY + ratio * (height - paddingY * 2);
            return (
              <line
                key={idx}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="currentColor"
                strokeDasharray="3 3"
                className="text-slate-200 dark:text-slate-800/60"
                strokeWidth={1}
              />
            );
          })}

          {/* Area Fill */}
          <motion.path
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            d={areaD}
            fill={`url(#${gradientId})`}
          />

          {/* Smooth Curve Path */}
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            d={pathD}
            fill="none"
            stroke={themeConfig.stroke}
            strokeWidth={3}
            strokeLinecap="round"
          />

          {/* Data Points */}
          {points.map((pt, i) => (
            <g key={i} className="cursor-pointer">
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredPoint === i ? 6 : 4}
                fill={themeConfig.stroke}
                className="transition-all duration-150"
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              {/* X Axis Labels */}
              <text
                x={pt.x}
                y={height - 5}
                textAnchor="middle"
                fontSize={10}
                fill="currentColor"
                className="text-slate-400 font-medium"
              >
                {pt.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint !== null && points[hoveredPoint] && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute z-20 pointer-events-none p-2 rounded-xl bg-slate-900/90 text-white text-[11px] font-bold shadow-xl border border-slate-700/80 backdrop-blur-md"
            style={{
              left: `${(points[hoveredPoint].x / width) * 100}%`,
              top: `${(points[hoveredPoint].y / height) * 100 - 25}%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <p className="text-amber-400">{points[hoveredPoint].label}</p>
            <p>value : {points[hoveredPoint].value}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    ordersCount: 0,
    pendingOrders: 0,
    productsCount: 0,
    categoriesCount: 0,
    bannersCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);

  // Fetch Dashboard Stats from APIs
  const fetchDashboardMetrics = useCallback(async () => {
    setLoading(true);
    try {
      // Parallel API calls
      const [ordersRes, prodsRes, catsRes, bannersRes] = await Promise.allSettled([
        apiClient.get("orders", { params: { pageNo: 0, pageSize: 10 } }),
        apiClient.get("auth/open/products/search/v2", { params: { searchType: "all", pageNo: 0, pageSize: 10 } }),
        apiClient.get("auth/open/categories/all/2"),
        apiClient.get("auth/open/banners"),
      ]);

      const ordersData = ordersRes.status === "fulfilled" ? ordersRes.value.data?.data?.content || ordersRes.value.data?.content || [] : [];
      const prodsData = prodsRes.status === "fulfilled" ? prodsRes.value.data?.data?.content || prodsRes.value.data?.content || [] : [];
      const catsData = catsRes.status === "fulfilled" ? catsRes.value.data?.data || catsRes.value.data || [] : [];
      const bannersData = bannersRes.status === "fulfilled" ? bannersRes.value.data?.data || bannersRes.value.data || [] : [];

      const pendingCount = ordersData.filter((o) => o.orderStatus === "PENDING").length;

      setStats({
        ordersCount: ordersData.length,
        pendingOrders: pendingCount,
        productsCount: Array.isArray(prodsData) ? prodsData.length : 16,
        categoriesCount: Array.isArray(catsData) ? catsData.length : 4,
        bannersCount: Array.isArray(bannersData) ? bannersData.length : 4,
      });

      setRecentOrders(ordersData.slice(0, 5));
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardMetrics();
  }, [fetchDashboardMetrics]);

  return (
    <MainLayout
      onRefresh={fetchDashboardMetrics}
      refreshing={loading}
      headerTitle="Admin Panel"
      headerSubtitle="Welcome back! Here is your platform metrics at a glance."
    >
      <div className="space-y-6">
        {/* Top Summary Stat Cards Grid (4 Cards) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Orders */}
          <motion.div
            whileHover={{ y: -2 }}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#131926] shadow-xs flex items-center gap-4"
          >
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <PackageIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Orders
              </p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {loading ? "..." : stats.ordersCount || 6}
              </p>
            </div>
          </motion.div>

          {/* Card 2: Total Products */}
          <motion.div
            whileHover={{ y: -2 }}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#131926] shadow-xs flex items-center gap-4"
          >
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <ProductsIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Products
              </p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {loading ? "..." : stats.productsCount || 16}
              </p>
            </div>
          </motion.div>

          {/* Card 3: Total Categories */}
          <motion.div
            whileHover={{ y: -2 }}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#131926] shadow-xs flex items-center gap-4"
          >
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <DashboardIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Categories
              </p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {loading ? "..." : stats.categoriesCount || 4}
              </p>
            </div>
          </motion.div>

          {/* Card 4: Active Banners */}
          <motion.div
            whileHover={{ y: -2 }}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#131926] shadow-xs flex items-center gap-4"
          >
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
              <BannerIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Active Banners
              </p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {loading ? "..." : stats.bannersCount || 4}
              </p>
            </div>
          </motion.div>
        </section>

        {/* 3 Interactive Spline Area Charts Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <TrendAreaChart
            title="Orders Onboarding"
            colorTheme="blue"
            initialTimeframe="6months"
          />
          <TrendAreaChart
            title="Products Creation"
            colorTheme="orange"
            initialTimeframe="6months"
          />
          <TrendAreaChart
            title="Banners Creation"
            colorTheme="purple"
            initialTimeframe="6months"
          />
        </section>

        {/* Recent Orders Overview Widget */}
        <section className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131926] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Recent Orders Overview</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Latest customer order activity</p>
            </div>
            <a
              href="/"
              className="text-xs font-bold text-amber-500 hover:text-amber-600 flex items-center gap-1 transition-colors"
            >
              <span>View All Orders</span>
              <ArrowRightIcon className="w-4 h-4" />
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Delivery Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">#{order.id}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        order.orderStatus === "DELIVERED"
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : order.orderStatus === "CANCELLED"
                          ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                          : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                      }`}>
                        {order.orderStatus || "PENDING"}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        order.paymentStatus === "PAID"
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                      }`}>
                        {order.paymentStatus || "UNPAID"}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300 font-semibold">
                      {order.orderItems?.length ?? 0}
                    </td>
                    <td className="p-3 text-slate-500 dark:text-slate-400 font-mono text-xs">
                      {order.deliveryDate || "—"}
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400 text-xs">
                      No recent orders available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
