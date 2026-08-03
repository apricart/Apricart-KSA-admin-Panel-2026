const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function PackageIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M21 8l-9-5-9 5 9 5 9-5Z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  );
}

export function ClockIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

export function CheckCircleIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </svg>
  );
}

export function XCircleIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5l5 5M14.5 9.5l-5 5" />
    </svg>
  );
}

export function SearchIcon(props) {
  return (
    <svg {...base} width={14} height={14} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4-4" />
    </svg>
  );
}

export function SortIcon({ direction, ...props }) {
  return (
    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M7 10l5-6 5 6"
        stroke={direction === "asc" ? "currentColor" : "var(--text-muted)"}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 14l5 6 5-6"
        stroke={direction === "desc" ? "currentColor" : "var(--text-muted)"}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CloseIcon(props) {
  return (
    <svg {...base} width={18} height={18} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function CalendarIcon(props) {
  return (
    <svg {...base} width={16} height={16} {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  );
}

export function WalletIcon(props) {
  return (
    <svg {...base} width={16} height={16} {...props}>
      <rect x="2" y="6" width="20" height="14" rx="2" />
      <path d="M16 6V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v1" />
      <path d="M17 13h.01" />
    </svg>
  );
}

export function MapPinIcon(props) {
  return (
    <svg {...base} width={16} height={16} {...props}>
      <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function CreditCardIcon(props) {
  return (
    <svg {...base} width={16} height={16} {...props}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}

export function TruckIcon(props) {
  return (
    <svg {...base} width={16} height={16} {...props}>
      <path d="M1 4h14v12H1z" />
      <path d="M15 8h4l3 4v4h-7" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
    </svg>
  );
}

export function NoteIcon(props) {
  return (
    <svg {...base} width={16} height={16} {...props}>
      <path d="M6 2h9l5 5v15H6z" transform="translate(-1 0)" />
      <path d="M14 2v6h6" transform="translate(-1 0)" />
    </svg>
  );
}

export function TagIcon(props) {
  return (
    <svg {...base} width={16} height={16} {...props}>
      <path d="M12 2H2v10l9.3 9.3a2 2 0 0 0 2.8 0l7.2-7.2a2 2 0 0 0 0-2.8L12 2Z" />
      <path d="M7 7h.01" />
    </svg>
  );
}

export function LogoutIcon(props) {
  return (
    <svg {...base} width={16} height={16} {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}
