import { useEffect, useState } from "react";
import apiClient from "../api/client";
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
import "./OrderDetailPanel.css";

const ORDER_STATUS_BADGE = {
  PENDING: "warning",
  DELIVERED: "good",
  CANCELLED: "critical",
};

const PAYMENT_STATUS_BADGE = {
  UNPAID: "warning",
  PAID: "good",
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

function StatusBadge({ value, map }) {
  if (!value) return null;
  return (
    <span className="status-badge" data-status={map[value] ?? "good"}>
      <span className="status-dot" />
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

    apiClient
      .get("orders/detail", { params: { id: orderId } })
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
    { label: "Progress", Icon: TruckIcon, value: <StatusBadge value={order.orderStatus} map={ORDER_STATUS_BADGE} /> },
    { label: "Payment", Icon: WalletIcon, value: <StatusBadge value={order.paymentStatus} map={PAYMENT_STATUS_BADGE} /> },
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
    <div className="order-panel-overlay" onClick={onClose}>
      <aside className="order-panel" onClick={(event) => event.stopPropagation()}>
        <div className="order-panel-hero">
          <button className="order-panel-close" onClick={onClose} aria-label="Close panel">
            <CloseIcon />
          </button>

          <div className="order-panel-heading">
            <div className="order-panel-heading-icon">
              <PackageIcon />
            </div>
            <div>
              <div className="order-panel-eyebrow">Order ID</div>
              <div className="order-panel-id">{orderId}</div>
            </div>
            {order && (
              <div className="order-panel-heading-badge">
                <StatusBadge value={order.orderStatus} map={ORDER_STATUS_BADGE} />
              </div>
            )}
          </div>

          <div className="order-panel-hero-card">
            <div>
              <div className="hero-card-label">
                <WalletIcon /> Total
              </div>
              <div className="hero-card-total">{order ? formatMoney(order.grandTotal, currency) : "—"}</div>
            </div>
            <div className="hero-card-date">
              <div className="hero-card-label hero-card-label-end">
                <CalendarIcon /> Date
              </div>
              <div className="hero-card-day">{order ? formatDate(order.deliveryDate) : "—"}</div>
              {order?.deliveryTime && <div className="hero-card-time">{formatTime(order.deliveryTime)}</div>}
            </div>
          </div>
        </div>

        <div className="order-panel-body">
          {error && <div className="order-panel-error">{error}</div>}
          {!order && !error && <div className="order-panel-loading">Loading order details...</div>}

          {order && (
            <>
              <div className="order-panel-section-title">
                <MapPinIcon /> Details
              </div>
              <div className="order-panel-card">
                {detailRows
                  .filter((row) => row.value)
                  .map((row) => (
                    <div className="order-detail-row" key={row.label}>
                      <span className="order-detail-label">
                        <row.Icon /> {row.label}
                      </span>
                      <span className="order-detail-value">{row.value}</span>
                    </div>
                  ))}
              </div>

              <div className="order-panel-section-title">
                <PackageIcon width={16} height={16} /> Items ({order.orderItems?.length ?? 0})
              </div>
              <div className="order-panel-card">
                {(order.orderItems ?? []).map((item) => (
                  <div className="order-item-row" key={item.id}>
                    {item.image ? (
                      <img className="order-item-image" src={item.image} alt={item.title} loading="lazy" />
                    ) : (
                      <div className="order-item-image order-item-image-fallback">
                        <PackageIcon width={16} height={16} />
                      </div>
                    )}
                    <div className="order-item-info">
                      <div className="order-item-title">{item.title}</div>
                      <div className="order-item-meta">
                        Qty {item.quantity}
                        {item.weight ? ` · ${item.weight}` : ""}
                      </div>
                    </div>
                    <div className="order-item-amount">{formatMoney(item.totalAmount, currency)}</div>
                  </div>
                ))}
                {!order.orderItems?.length && <div className="order-panel-loading">No items in this order.</div>}
              </div>

              <div className="order-panel-section-title">
                <WalletIcon /> Summary
              </div>
              <div className="order-panel-card">
                {summaryRows.map((row) => (
                  <div className="order-detail-row" key={row.label}>
                    <span className="order-detail-label">{row.label}</span>
                    <span className="order-detail-value">{formatMoney(row.value, currency)}</span>
                  </div>
                ))}
                <div className="order-detail-row order-summary-total">
                  <span className="order-detail-label">Grand total</span>
                  <span className="order-detail-value">{formatMoney(order.grandTotal, currency)}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
