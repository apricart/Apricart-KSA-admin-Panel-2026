import { motion } from "framer-motion";

export function Skeleton({
  className = "",
  variant = "rounded",
  width,
  height,
  animation = "pulse",
  style = {},
}) {
  const baseStyles = "bg-slate-200/80 dark:bg-slate-800/80";

  const variantStyles = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-none",
    rounded: "rounded-lg",
  };

  const animationStyles = {
    shimmer: "animate-pulse",
    pulse: "animate-pulse",
    none: "",
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant] || "rounded-lg"} ${
        animationStyles[animation] || "animate-pulse"
      } ${className}`}
      style={{ width, height, ...style }}
    />
  );
}

// Stat Card Skeleton
export function StatCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#131926] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex items-center gap-4"
    >
      <Skeleton variant="rounded" width={48} height={48} className="rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="60%" height={12} />
        <Skeleton variant="text" width="40%" height={24} />
      </div>
    </motion.div>
  );
}

// Table Rows Skeleton Component
export function TableRowsSkeleton({ rows = 5, columnsCount = 6 }) {
  return (
    <>
      {[...Array(rows)].map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-slate-100 dark:border-slate-800/60">
          {[...Array(columnsCount)].map((_, colIndex) => (
            <td key={colIndex} className="p-4">
              <Skeleton
                variant={colIndex === 0 ? "rounded" : "text"}
                width={colIndex === 0 ? 40 : colIndex === 1 ? 120 : 75}
                height={colIndex === 0 ? 32 : 14}
                className={colIndex === 0 ? "rounded-lg" : ""}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// Order Detail Side Drawer Skeleton Component
export function OrderDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Hero Cards Skeleton */}
      <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-100/60 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
        <div className="space-y-2">
          <Skeleton variant="text" width="50%" height={12} />
          <Skeleton variant="text" width="75%" height={24} />
        </div>
        <div className="space-y-2">
          <Skeleton variant="text" width="50%" height={12} />
          <Skeleton variant="text" width="65%" height={20} />
        </div>
      </div>

      {/* Info Section Skeleton */}
      <div className="space-y-3">
        <Skeleton variant="text" width="40%" height={14} />
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <Skeleton variant="text" width="30%" height={12} />
              <Skeleton variant="text" width="45%" height={14} />
            </div>
          ))}
        </div>
      </div>

      {/* Items Section Skeleton */}
      <div className="space-y-3">
        <Skeleton variant="text" width="35%" height={14} />
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-3 space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton variant="rounded" width={48} height={48} className="rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" width="70%" height={14} />
                <Skeleton variant="text" width="40%" height={10} />
              </div>
              <Skeleton variant="text" width={60} height={14} />
            </div>
          ))}
        </div>
      </div>

      {/* Financial Summary Skeleton */}
      <div className="space-y-3">
        <Skeleton variant="text" width="40%" height={14} />
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <Skeleton variant="text" width="30%" height={12} />
              <Skeleton variant="text" width="25%" height={12} />
            </div>
          ))}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between">
            <Skeleton variant="text" width="35%" height={16} />
            <Skeleton variant="text" width="30%" height={18} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Chart Skeleton Component
export function ChartSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#131926] shadow-sm flex flex-col justify-between space-y-4"
    >
      <div className="flex items-center justify-between">
        <Skeleton variant="text" width={140} height={18} />
        <Skeleton variant="rounded" width={110} height={28} className="rounded-xl" />
      </div>
      <div className="w-full h-52 flex flex-col justify-end space-y-3 p-2">
        <Skeleton variant="rounded" width="100%" height={160} className="rounded-xl opacity-60" />
        <div className="flex justify-between pt-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} variant="text" width={24} height={10} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Category / Subcategory / Product Card Grid Skeleton Component
export function CategorySkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#131926] shadow-sm flex flex-col justify-between space-y-4"
    >
      <Skeleton variant="rounded" width="100%" height={140} className="rounded-xl" />
      <div className="space-y-2">
        <Skeleton variant="text" width="60%" height={16} />
        <Skeleton variant="text" width="40%" height={12} />
      </div>
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex gap-2">
        <Skeleton variant="rounded" width="70%" height={32} className="rounded-lg" />
        <Skeleton variant="rounded" width="30%" height={32} className="rounded-lg" />
      </div>
    </motion.div>
  );
}

export const SubcategorySkeleton = CategorySkeleton;
export const ProductSkeleton = CategorySkeleton;

export default Skeleton;
