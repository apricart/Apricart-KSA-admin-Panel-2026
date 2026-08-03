import { useCallback, useEffect, useMemo, useState } from "react";
import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";
import {
  PackageIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  SearchIcon,
  SortIcon,
  LogoutIcon,
} from "../components/icons";
import OrderDetailPanel from "../components/OrderDetailPanel";
import "./Dashboard.css";

const ORDER_STATUSES = ["ALL", "PENDING", "DELIVERED", "CANCELLED"];
const PAYMENT_STATUSES = ["ALL", "UNPAID", "PAID"];

const ORDER_STATUS_BADGE = {
  PENDING: "warning",
  DELIVERED: "good",
  CANCELLED: "critical",
};

const PAYMENT_STATUS_BADGE = {
  UNPAID: "warning",
  PAID: "good",
};

// type: "text" -> client-side search input; "select" -> server-side dropdown; "sort" -> sortable only
const COLUMNS = [
  { key: "id", label: "Order ID", type: "text" },
  { key: "orderStatus", label: "Status", type: "select", options: ORDER_STATUSES },
  { key: "paymentStatus", label: "Payment", type: "select", options: PAYMENT_STATUSES },
  { key: "items", label: "Items", type: "sort" },
  { key: "grandTotal", label: "Total", type: "sort" },
  { key: "deliveryDate", label: "Delivery date", type: "sort" },
];

function getSortValue(order, key) {
  if (key === "items") return order.orderItems?.length ?? 0;
  return order[key];
}

export default function Dashboard() {
  const { adminName, logout } = useAuth();
  const [allOrders, setAllOrders] = useState(null);
  const [orders, setOrders] = useState(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("ALL");
  const [orderIdSearch, setOrderIdSearch] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [error, setError] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    apiClient
      .get("orders")
      .then((response) => {
        if (!cancelled) setAllOrders(response.data.data);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load orders.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const loadFiltered = useCallback(async () => {
    setError("");
    try {
      if (orderStatusFilter !== "ALL") {
        const response = await apiClient.get(`orders/type/${orderStatusFilter}`);
        let data = response.data.data;
        if (paymentStatusFilter !== "ALL") {
          data = data.filter((order) => order.paymentStatus === paymentStatusFilter);
        }
        setOrders(data);
      } else if (paymentStatusFilter !== "ALL") {
        const response = await apiClient.get(`orders/status/${paymentStatusFilter}`);
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
    }
  }, [orderStatusFilter, paymentStatusFilter, allOrders]);

  useEffect(() => {
    if (allOrders !== null) loadFiltered();
  }, [allOrders, loadFiltered]);

  const stats = allOrders && [
    { label: "Total Orders", value: allOrders.length, accent: "blue", Icon: PackageIcon },
    {
      label: "Pending",
      value: allOrders.filter((o) => o.orderStatus === "PENDING").length,
      accent: "yellow",
      Icon: ClockIcon,
    },
    {
      label: "Delivered",
      value: allOrders.filter((o) => o.orderStatus === "DELIVERED").length,
      accent: "aqua",
      Icon: CheckCircleIcon,
    },
    {
      label: "Cancelled",
      value: allOrders.filter((o) => o.orderStatus === "CANCELLED").length,
      accent: "violet",
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

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Orders Dashboard</h1>
          <p className="dashboard-subtitle">Track and manage customer orders</p>
        </div>
        <div className="dashboard-user">
          <span>Signed in as {adminName}</span>
          <button onClick={logout}>
            <LogoutIcon /> Log out
          </button>
        </div>
      </header>

      {error && <div className="dashboard-error">{error}</div>}

      <section className="stat-grid">
        {(stats ?? Array.from({ length: 4 })).map((stat, index) => (
          <div className="stat-tile" data-accent={stat?.accent ?? "blue"} key={stat?.label ?? index}>
            <div className="stat-icon">{stat?.Icon && <stat.Icon />}</div>
            <div>
              <div className="stat-label">{stat?.label ?? "Loading..."}</div>
              <div className="stat-value">{stat ? stat.value.toLocaleString() : "—"}</div>
            </div>
          </div>
        ))}
      </section>

      <section className="orders-table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th key={col.key}>
                  <div className="th-content">
                    <button className="th-sort" onClick={() => toggleSort(col.key)}>
                      {col.label}
                      <SortIcon direction={sortKey === col.key ? sortDir : null} />
                    </button>

                    {col.type === "text" && (
                      <div className="th-filter th-filter-text">
                        <SearchIcon />
                        <input
                          type="text"
                          placeholder="Search..."
                          value={orderIdSearch}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => setOrderIdSearch(e.target.value)}
                        />
                      </div>
                    )}

                    {col.type === "select" && (
                      <select
                        className="th-filter"
                        onClick={(e) => e.stopPropagation()}
                        value={col.key === "orderStatus" ? orderStatusFilter : paymentStatusFilter}
                        onChange={(e) =>
                          col.key === "orderStatus"
                            ? setOrderStatusFilter(e.target.value)
                            : setPaymentStatusFilter(e.target.value)
                        }
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
          <tbody>
            {visibleOrders === null && (
              <tr>
                <td colSpan={COLUMNS.length} className="orders-empty">
                  Loading orders...
                </td>
              </tr>
            )}
            {visibleOrders?.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="orders-empty">
                  No orders match this filter.
                </td>
              </tr>
            )}
            {visibleOrders?.map((order) => (
              <tr key={order.id} className="orders-row-clickable" onClick={() => setSelectedOrderId(order.id)}>
                <td>{order.id}</td>
                <td>
                  <span className="status-badge" data-status={ORDER_STATUS_BADGE[order.orderStatus] ?? "good"}>
                    <span className="status-dot" />
                    {order.orderStatus}
                  </span>
                </td>
                <td>
                  <span className="status-badge" data-status={PAYMENT_STATUS_BADGE[order.paymentStatus] ?? "good"}>
                    <span className="status-dot" />
                    {order.paymentStatus}
                  </span>
                </td>
                <td>{order.orderItems?.length ?? 0}</td>
                <td>
                  {order.currency?.currencySymbol} {order.grandTotal?.toLocaleString()}
                </td>
                <td>{order.deliveryDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {selectedOrderId && (
        <OrderDetailPanel orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />
      )}
    </div>
  );
}
