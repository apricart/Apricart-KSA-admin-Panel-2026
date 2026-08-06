import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { orderService } from "../api";
import MainLayout from "../components/MainLayout";
import {
  PackageIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  SearchIcon,
  SortIcon,
  FilterIcon,
  RefreshIcon,
} from "../components/icons";
import OrderDetailPanel from "../components/OrderDetailPanel";
import { StatCardSkeleton, TableRowsSkeleton } from "../components/Skeleton";

const ORDER_STATUSES = ["ALL", "PENDING", "DELIVERED", "CANCELLED"];
const PAYMENT_STATUSES = ["ALL", "UNPAID", "PAID"];

const ORDER_STATUS_CONFIG = {
  PENDING: {
    badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400",
    dotClass: "bg-amber-400 shadow-xs shadow-amber-400",
  },
  DELIVERED: {
    badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400",
    dotClass: "bg-emerald-400 shadow-xs shadow-emerald-400",
  },
  CANCELLED: {
    badgeClass: "bg-rose-500/15 text-rose-400 border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400",
    dotClass: "bg-rose-400 shadow-xs shadow-rose-400",
  },
};

const PAYMENT_STATUS_CONFIG = {
  UNPAID: {
    badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400",
    dotClass: "bg-amber-400 shadow-xs shadow-amber-400",
  },
  PAID: {
    badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400",
    dotClass: "bg-emerald-400 shadow-xs shadow-emerald-400",
  },
};

const COLUMNS = [
  { key: "id", label: "ORDER ID", type: "text" },
  { key: "orderStatus", label: "STATUS", type: "select", options: ORDER_STATUSES },
  { key: "paymentStatus", label: "PAYMENT", type: "select", options: PAYMENT_STATUSES },
  { key: "items", label: "ITEMS", type: "sort" },
  { key: "grandTotal", label: "TOTAL", type: "sort" },
  { key: "deliveryDate", label: "DELIVERY DATE", type: "sort" },
];

function getSortValue(order, key) {
  if (key === "items") return order.orderItems?.length ?? 0;
  return order[key];
}

export default function Dashboard() {
  const [allOrders, setAllOrders] = useState(null);
  const [orders, setOrders] = useState(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("ALL");
  const [orderIdSearch, setOrderIdSearch] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Pagination states
  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await orderService.getOrders({ pageNo, pageSize });
      setAllOrders(response.data.data);
    } catch {
      setError("Could not load orders from API server.");
    } finally {
      setLoading(false);
    }
  }, [pageNo, pageSize]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const loadFiltered = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      if (orderStatusFilter !== "ALL") {
        const response = await orderService.getOrdersByType(orderStatusFilter);
        let data = response.data.data;
        if (paymentStatusFilter !== "ALL") {
          data = data.filter((order) => order.paymentStatus === paymentStatusFilter);
        }
        setOrders(data);
      } else if (paymentStatusFilter !== "ALL") {
        const response = await orderService.getOrdersByStatus(paymentStatusFilter);
        setOrders(response.data.data);
      } else {
        setOrders(allOrders);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setOrders([]);
      } else {
        setError("Could not load orders for the selected filter.");
      }
    } finally {
      setLoading(false);
    }
  }, [orderStatusFilter, paymentStatusFilter, allOrders]);

  useEffect(() => {
    if (allOrders !== null) loadFiltered();
  }, [allOrders, loadFiltered]);

  const stats = allOrders && [
    {
      label: "Total Orders",
      value: allOrders.length,
      color: "border-sky-500/30 bg-sky-500/5 text-sky-400",
      iconBg: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
      Icon: PackageIcon,
    },
    {
      label: "Pending",
      value: allOrders.filter((o) => o.orderStatus === "PENDING").length,
      color: "border-amber-500/30 bg-amber-500/5 text-amber-400",
      iconBg: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
      Icon: ClockIcon,
    },
    {
      label: "Delivered",
      value: allOrders.filter((o) => o.orderStatus === "DELIVERED").length,
      color: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400",
      iconBg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
      Icon: CheckCircleIcon,
    },
    {
      label: "Cancelled",
      value: allOrders.filter((o) => o.orderStatus === "CANCELLED").length,
      color: "border-purple-500/30 bg-purple-500/5 text-purple-400",
      iconBg: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
      Icon: XCircleIcon,
    },
  ];

  const visibleOrders = useMemo(() => {
    if (!orders) return orders;

    let result = orders;
    if (orderIdSearch.trim()) {
      const needle = orderIdSearch.trim().toLowerCase();
      result = result.filter((order) => String(order.id).toLowerCase().includes(needle));
    }

    if (sortKey) {
      result = [...result].sort((a, b) => {
        const va = getSortValue(a, sortKey);
        const vb = getSortValue(b, sortKey);
        if (va == null && vb == null) return 0;
        if (va == null) return 1;
        if (vb == null) return -1;
        const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb));
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [orders, orderIdSearch, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortKey(null);
    }
  };

  const resetFilters = () => {
    setOrderStatusFilter("ALL");
    setPaymentStatusFilter("ALL");
    setOrderIdSearch("");
    setSortKey(null);
  };

  return (
    <MainLayout
      onRefresh={fetchOrders}
      refreshing={loading}
      headerTitle="Orders Dashboard"
      headerSubtitle="Track, filter, and manage customer order fulfillments"
    >
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-sm flex items-center justify-between"
          >
            <span>{error}</span>
            <button
              onClick={fetchOrders}
              className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg text-xs font-semibold"
            >
              Retry API
            </button>
          </motion.div>
        )}

        {/* Stat Cards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {allOrders === null
            ? Array.from({ length: 4 }).map((_, idx) => <StatCardSkeleton key={idx} />)
            : stats.map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  whileHover={{ y: -3 }}
                  className={`p-5 rounded-2xl border transition-all duration-200 shadow-sm flex items-center gap-4 bg-white dark:bg-[#131926] ${stat.color}`}
                >
                  <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                    <stat.Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                      {stat.value.toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              ))}
        </section>

        {/* Orders Table Container */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#131926] shadow-sm overflow-hidden"
        >
          {/* Active Filter Summary / Toolbar */}
          {(orderStatusFilter !== "ALL" || paymentStatusFilter !== "ALL" || orderIdSearch) && (
            <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
                <FilterIcon className="text-amber-500" />
                <span>Active Filters:</span>
                {orderStatusFilter !== "ALL" && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 font-semibold border border-amber-500/20">
                    Status: {orderStatusFilter}
                  </span>
                )}
                {paymentStatusFilter !== "ALL" && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 font-semibold border border-amber-500/20">
                    Payment: {paymentStatusFilter}
                  </span>
                )}
                {orderIdSearch && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 font-semibold border border-amber-500/20">
                    Search: "{orderIdSearch}"
                  </span>
                )}
              </div>
              <button
                onClick={resetFilters}
                className="text-amber-500 hover:text-amber-400 font-semibold underline underline-offset-2"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Table Element */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-semibold tracking-wider">
                  {COLUMNS.map((col) => (
                    <th key={col.key} className="p-4 align-top">
                      <div className="flex flex-col gap-2">
                        {/* Header Title with Sort button */}
                        <button
                          onClick={() => toggleSort(col.key)}
                          className="flex items-center gap-1.5 font-bold hover:text-amber-500 transition-colors uppercase text-[11px]"
                        >
                          <span>{col.label}</span>
                          <SortIcon direction={sortKey === col.key ? sortDir : null} />
                        </button>

                        {/* Search Input for Order ID */}
                        {col.type === "text" && (
                          <div className="relative">
                            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                            <input
                              type="text"
                              placeholder="Search Order ID..."
                              value={orderIdSearch}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => setOrderIdSearch(e.target.value)}
                              className="w-full pl-8 pr-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 placeholder:text-slate-500 text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-normal"
                            />
                          </div>
                        )}

                        {/* Select Dropdown Filters */}
                        {col.type === "select" && (
                          <select
                            value={col.key === "orderStatus" ? orderStatusFilter : paymentStatusFilter}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                              col.key === "orderStatus"
                                ? setOrderStatusFilter(e.target.value)
                                : setPaymentStatusFilter(e.target.value)
                            }
                            className="w-full py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-normal"
                          >
                            {col.options.map((option) => (
                              <option key={option} value={option}>
                                {option === "ALL" ? "All" : option}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {/* Skeleton Loading Rows */}
                {visibleOrders === null && <TableRowsSkeleton rows={6} columnsCount={COLUMNS.length} />}

                {/* Empty State */}
                {visibleOrders?.length === 0 && (
                  <tr>
                    <td colSpan={COLUMNS.length} className="p-12 text-center text-slate-500 dark:text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <PackageIcon className="w-10 h-10 text-slate-400 dark:text-slate-600 stroke-1" />
                        <p className="font-semibold text-slate-700 dark:text-slate-300 text-base">No orders found</p>
                        <p className="text-xs">Try adjusting your status filter or search parameters.</p>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Orders Data Rows */}
                {visibleOrders?.map((order) => {
                  const statusCfg = ORDER_STATUS_CONFIG[order.orderStatus] || ORDER_STATUS_CONFIG.PENDING;
                  const payCfg = PAYMENT_STATUS_CONFIG[order.paymentStatus] || PAYMENT_STATUS_CONFIG.UNPAID;

                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className="hover:bg-amber-500/5 dark:hover:bg-slate-800/40 cursor-pointer transition-colors duration-150"
                    >
                      {/* Order ID */}
                      <td className="p-4 font-mono font-semibold text-slate-900 dark:text-amber-400">
                        {order.id}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusCfg.badgeClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`} />
                          {order.orderStatus}
                        </span>
                      </td>

                      {/* Payment */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${payCfg.badgeClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${payCfg.dotClass}`} />
                          {order.paymentStatus}
                        </span>
                      </td>

                      {/* Items count */}
                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        {order.orderItems?.length ?? 0}
                      </td>

                      {/* Total */}
                      <td className="p-4 font-semibold text-slate-900 dark:text-white">
                        {order.currency?.currencySymbol || "SAR"} {order.grandTotal?.toLocaleString()}
                      </td>

                      {/* Delivery date */}
                      <td className="p-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {order.deliveryDate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-medium text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPageNo(0);
                }}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-slate-400 ml-2">
                (API params: <code className="text-amber-500 font-mono">pageNo={pageNo}&pageSize={pageSize}</code>)
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span>Page <strong className="text-slate-900 dark:text-white font-bold">{pageNo + 1}</strong></span>
              
              <button
                onClick={() => setPageNo((prev) => Math.max(0, prev - 1))}
                disabled={pageNo === 0 || loading}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <button
                onClick={() => setPageNo((prev) => prev + 1)}
                disabled={(visibleOrders?.length ?? 0) < pageSize || loading}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </motion.section>
      </motion.div>

      {/* Slide-over Detail Modal with AnimatePresence */}
      <AnimatePresence mode="wait">
        {selectedOrderId && (
          <OrderDetailPanel
            key={selectedOrderId}
            orderId={selectedOrderId}
            onClose={() => setSelectedOrderId(null)}
          />
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
