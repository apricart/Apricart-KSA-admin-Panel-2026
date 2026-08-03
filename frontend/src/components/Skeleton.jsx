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
          <td className="p-4">
            <Skeleton variant="text" width={110} height={14} />
          </td>
          <td className="p-4">
            <Skeleton variant="rounded" width={80} height={24} className="rounded-full" />
          </td>
          <td className="p-4">
            <Skeleton variant="rounded" width={70} height={24} className="rounded-full" />
          </td>
          <td className="p-4">
            <Skeleton variant="text" width={30} height={14} />
          </td>
          <td className="p-4">
            <Skeleton variant="text" width={85} height={14} />
          </td>
          <td className="p-4">
            <Skeleton variant="text" width={95} height={14} />
          </td>
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

export default Skeleton;
