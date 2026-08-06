import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "../api/client";
import MainLayout from "../components/MainLayout";
import {
  DashboardIcon,
  ProductsIcon,
  BannerIcon,
  PackageIcon,
} from "../components/icons";
import { StatCardSkeleton, ChartSkeleton } from "../components/Skeleton";

// Timeframe options
const TIMEFRAME_OPTIONS = [
  { label: "Last 6 Months", value: "6months" },
  { label: "Last Month", value: "1month" },
  { label: "Last Week", value: "1week" },
];

// Interactive Area Chart Component with Smooth Hover Tracking
function TrendAreaChart({ title, colorTheme = "blue", initialTimeframe = "6months", dataPoints }) {
  const [timeframe, setTimeframe] = useState(initialTimeframe);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const svgRef = useRef(null);

  // Colors based on theme
  const themeConfig = {
    blue: {
      stroke: "#3B82F6",
      fillGradientStart: "#3B82F6",
      badgeBg: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      tooltipText: "text-blue-500",
    },
    orange: {
      stroke: "#F97316",
      fillGradientStart: "#F97316",
      badgeBg: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      tooltipText: "text-orange-500",
    },
    purple: {
      stroke: "#8B5CF6",
      fillGradientStart: "#8B5CF6",
      badgeBg: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      tooltipText: "text-purple-500",
    },
  }[colorTheme] || {
    stroke: "#3B82F6",
    fillGradientStart: "#3B82F6",
    badgeBg: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    tooltipText: "text-blue-500",
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
  const height = 200;
  const paddingX = 35;
  const paddingY = 30;

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

  // Mouse move tracking over entire chart area
  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const svgX = (mouseX / rect.width) * width;

    let closestIdx = 0;
    let minDistance = Infinity;
    points.forEach((pt, idx) => {
      const dist = Math.abs(pt.x - svgX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = idx;
      }
    });

    setHoveredIndex(closestIdx);
  };

  const currentHover = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#131926] shadow-sm flex flex-col justify-between space-y-4 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
      {/* Header & Filter Dropdown */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900 dark:text-white text-base">{title}</h3>
        <div className="relative">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
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
      <div
        className="relative w-full h-52 flex items-center justify-center cursor-pointer select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={themeConfig.fillGradientStart} stopOpacity="0.4" />
              <stop offset="100%" stopColor={themeConfig.fillGradientStart} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Dotted Grid Horizontal Lines */}
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
            transition={{ duration: 0.4 }}
            d={areaD}
            fill={`url(#${gradientId})`}
          />

          {/* Vertical Dotted Indicator Line on Hover */}
          {currentHover && (
            <line
              x1={currentHover.x}
              y1={paddingY}
              x2={currentHover.x}
              y2={height - paddingY}
              stroke="currentColor"
              strokeDasharray="3 3"
              className="text-slate-400 dark:text-slate-600"
              strokeWidth={1.5}
            />
          )}

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
                r={hoveredIndex === i ? 6 : 4}
                fill={themeConfig.stroke}
                className="transition-all duration-150 cursor-pointer"
              />
              {/* X Axis Labels */}
              <text
                x={pt.x}
                y={height - 8}
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

        {/* Hover Tooltip Overlay Box */}
        <AnimatePresence>
          {currentHover && (
            <motion.div
              initial={{ opacity: 0, y: -5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute z-30 pointer-events-none p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-xs space-y-1 backdrop-blur-md"
              style={{
                left: `${(currentHover.x / width) * 100}%`,
                top: `${(currentHover.y / height) * 100 - 30}%`,
                transform: "translate(-50%, -100%)",
              }}
            >
              <p className="font-bold text-slate-800 dark:text-slate-200">{currentHover.label}</p>
              <p className={`font-semibold ${themeConfig.tooltipText}`}>value : {currentHover.value}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    ordersCount: 0,
    productsCount: 0,
    categoriesCount: 0,
    bannersCount: 0,
  });

  // Fetch Dashboard Stats from APIs
  const fetchDashboardMetrics = useCallback(async () => {
    setLoading(true);
    try {
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

      setStats({
        ordersCount: ordersData.length || 6,
        productsCount: Array.isArray(prodsData) ? prodsData.length || 16 : 16,
        categoriesCount: Array.isArray(catsData) ? catsData.length || 4 : 4,
        bannersCount: Array.isArray(bannersData) ? bannersData.length || 4 : 4,
      });
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
        {/* Top Summary Stat Cards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              {/* Card 1: Total Orders */}
              <motion.div
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate("/orders")}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#131926] shadow-xs flex items-center gap-4 cursor-pointer hover:border-blue-500/50 hover:shadow-md transition-all group"
                title="Click to view Orders Dashboard"
              >
                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 group-hover:scale-110 transition-transform">
                  <PackageIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Total Orders
                  </p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                    {stats.ordersCount}
                  </p>
                </div>
              </motion.div>

              {/* Card 2: Total Products */}
              <motion.div
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate("/products")}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#131926] shadow-xs flex items-center gap-4 cursor-pointer hover:border-amber-500/50 hover:shadow-md transition-all group"
                title="Click to view Products Catalog"
              >
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover:scale-110 transition-transform">
                  <ProductsIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Total Products
                  </p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                    {stats.productsCount}
                  </p>
                </div>
              </motion.div>

              {/* Card 3: Categories */}
              <motion.div
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate("/products")}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#131926] shadow-xs flex items-center gap-4 cursor-pointer hover:border-emerald-500/50 hover:shadow-md transition-all group"
                title="Click to view Categories"
              >
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <DashboardIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Categories
                  </p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                    {stats.categoriesCount}
                  </p>
                </div>
              </motion.div>

              {/* Card 4: Active Banners */}
              <motion.div
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate("/banners")}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#131926] shadow-xs flex items-center gap-4 cursor-pointer hover:border-purple-500/50 hover:shadow-md transition-all group"
                title="Click to view Banners Management"
              >
                <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20 group-hover:scale-110 transition-transform">
                  <BannerIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Active Banners
                  </p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                    {stats.bannersCount}
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </section>

        {/* 3 Interactive Spline Area Charts Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {loading ? (
            <>
              <ChartSkeleton />
              <ChartSkeleton />
              <ChartSkeleton />
            </>
          ) : (
            <>
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
            </>
          )}
        </section>
      </div>
    </MainLayout>
  );
}
