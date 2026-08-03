import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { orderService } from "../api";
import {
  PackageIcon,
  CloseIcon,
  CalendarIcon,
  WalletIcon,
  MapPinIcon,
  CreditCardIcon,
  TruckIcon,
  NoteIcon,
  TagIcon,
} from "./icons";
import { OrderDetailSkeleton } from "./Skeleton";

const ORDER_STATUS_CONFIG = {
  PENDING: {
    badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    dotClass: "bg-amber-400 shadow-xs shadow-amber-400",
  },
  DELIVERED: {
    badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    dotClass: "bg-emerald-400 shadow-xs shadow-emerald-400",
  },
  CANCELLED: {
    badgeClass: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    dotClass: "bg-rose-400 shadow-xs shadow-rose-400",
  },
};

const PAYMENT_STATUS_CONFIG = {
  UNPAID: {
    badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    dotClass: "bg-amber-400 shadow-xs shadow-amber-400",
  },
  PAID: {
    badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    dotClass: "bg-emerald-400 shadow-xs shadow-emerald-400",
  },
};

function formatMoney(value, currency) {
  if (value == null) return "—";
  const precision = Number(currency?.currencyPrecision ?? 2);
  const amount = value.toLocaleString(undefined, {
    minimumFractionDigits: value % 1 === 0 ? 0 : precision,
    maximumFractionDigits: precision,
  });
  return currency?.currencySymbol ? `${currency.currencySymbol} ${amount}` : amount;
}

function formatDate(isoDate) {
  if (!isoDate) return "—";
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(time) {
  if (!time) return null;
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time;
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

function StatusBadge({ value, configMap }) {
  if (!value) return null;
  const cfg = configMap[value] || { badgeClass: "bg-slate-500/10 text-slate-400 border-slate-500/20", dotClass: "bg-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.badgeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
      {value}
    </span>
  );
}

export default function OrderDetailPanel({ orderId, onClose }) {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setOrder(null);
    setError("");
    let cancelled = false;

    orderService
      .getOrderDetail(orderId)
      .then((response) => {
        if (!cancelled) setOrder(response.data.data);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load order details.");
      });

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const currency = order?.currency;
  const detailRows = order && [
    { label: "Progress", Icon: TruckIcon, value: <StatusBadge value={order.orderStatus} configMap={ORDER_STATUS_CONFIG} /> },
    { label: "Payment", Icon: WalletIcon, value: <StatusBadge value={order.paymentStatus} configMap={PAYMENT_STATUS_CONFIG} /> },
    { label: "Method", Icon: CreditCardIcon, value: order.paymentMode },
    {
      label: "Address",
      Icon: MapPinIcon,
      value: order.customerAddress
        ? [order.customerAddress.addressDetail, order.customerAddress.locationType]
            .filter(Boolean)
            .join(" · ")
        : null,
    },
    { label: "Coupon", Icon: TagIcon, value: order.couponCode },
    { label: "Notes", Icon: NoteIcon, value: order.notes },
  ];

  const summaryRows = order && [
    { label: "Net total", value: order.netTotal },
    { label: "Delivery charges", value: order.deliveryCharges },
    { label: "Tax", value: order.totalTax },
    { label: "Discount", value: order.totalDiscount === 0 ? 0 : -order.totalDiscount },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: "easeInOut" }}
      className="fixed inset-0 z-50 overflow-hidden flex justify-end"
    >
      {/* Backdrop Fade */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full overflow-y-auto"
      >
        {/* Header Hero Area */}
        <div className="p-6 bg-gradient-to-b from-slate-100 to-white dark:from-slate-800/80 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
                <PackageIcon />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Order Details
                </span>
                <p className="text-lg font-mono font-bold text-slate-900 dark:text-amber-400 leading-none">
                  #{orderId}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close panel"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Hero Card Stats */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 shadow-xs">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <WalletIcon /> Total Amount
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {order ? formatMoney(order.grandTotal, currency) : "—"}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <CalendarIcon /> Date & Time
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                {order ? formatDate(order.deliveryDate) : "—"}
              </p>
              {order?.deliveryTime && (
                <p className="text-[11px] text-amber-500 font-medium">
                  {formatTime(order.deliveryTime)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm">
              {error}
            </div>
          )}

          {!order && !error && <OrderDetailSkeleton />}

          {order && (
            <>
              {/* Order Info Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <MapPinIcon /> Delivery & Payment Info
                </h3>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 divide-y divide-slate-200/60 dark:divide-slate-800/60">
                  {detailRows
                    .filter((row) => row.value)
                    .map((row) => (
                      <div className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs gap-3" key={row.label}>
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                          <row.Icon /> {row.label}
                        </span>
                        <span className="text-slate-900 dark:text-slate-200 font-semibold text-right">
                          {row.value}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Items List Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <PackageIcon /> Order Items ({order.orderItems?.length ?? 0})
                </h3>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 divide-y divide-slate-200/60 dark:divide-slate-800/60 overflow-hidden">
                  {(order.orderItems ?? []).map((item) => (
                    <div className="p-3 flex items-center gap-3 text-xs" key={item.id}>
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700 bg-white"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-200/60 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                          <PackageIcon />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Qty: {item.quantity} {item.weight ? `· ${item.weight}` : ""}
                        </p>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-amber-400">
                        {formatMoney(item.totalAmount, currency)}
                      </div>
                    </div>
                  ))}
                  {!order.orderItems?.length && (
                    <div className="p-4 text-center text-slate-400 text-xs">
                      No items listed for this order.
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Summary Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <WalletIcon /> Financial Summary
                </h3>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 space-y-2 text-xs">
                  {summaryRows.map((row) => (
                    <div className="flex justify-between text-slate-600 dark:text-slate-400" key={row.label}>
                      <span>{row.label}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {formatMoney(row.value, currency)}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between text-sm font-bold text-slate-900 dark:text-white">
                    <span>Grand Total</span>
                    <span className="text-amber-500">
                      {formatMoney(order.grandTotal, currency)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.aside>
    </motion.div>
  );
}
