"use client";

/* Shared bits for the dashboard: icons, avatars, cards, charts. */

const AVATAR_COLORS = ["#0ea5e9", "#8b5cf6", "#f59e0b", "#ec4899", "#10b981", "#6366f1", "#14b8a6", "#f43f5e"];

export function colorFor(name = "") {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
export function initials(name = "") {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
}
export function inr(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}
export function fmtDate(d) {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
export function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000) + 1;
}
export function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/* ---------- SVG icons ---------- */
const P = (d, extra) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d}{extra}
  </svg>
);
export const Icon = {
  home: P(<><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9 21v-6h6v6" /></>),
  users: P(<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5" /><circle cx="17" cy="9" r="2.6" /><path d="M16 14.7c2.9.3 4.9 2.1 5.5 5.3" /></>),
  calendar: P(<><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" /></>),
  rocket: P(<><path d="M5 19c-1.5-1-2-2.5-2-4 2.5 0 5.5 1 7.5 3s3 5 3 7.5c-1.5 0-3-.5-4-2" /><path d="M14 4c3-2 7-2 7-2s0 4-2 7l-5 5-5-5 5-5Z" /><circle cx="15" cy="9" r="1.6" /></>),
  doc: P(<><path d="M6 2h9l5 5v15H6V2Z" /><path d="M14 2v6h6M9 13h7M9 17h7" /></>),
  chart: P(<><path d="M3 21h18" /><path d="M6 17v-6M11 17V7M16 17v-9M21 17V4" /></>),
  bell: P(<><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6" /><path d="M10 20a2 2 0 0 0 4 0" /></>),
  logout: P(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></>),
  check: P(<><path d="m4 12.5 5 5L20 6.5" /></>),
  x: P(<><path d="M6 6l12 12M18 6 6 18" /></>),
  plus: P(<><path d="M12 5v14M5 12h14" /></>),
  search: P(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>),
  clock: P(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></>),
  chevR: P(<><path d="m9 6 6 6-6 6" /></>),
  spark: P(<><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l2.5 2.5M16.5 16.5 19 19M19 5l-2.5 2.5M7.5 16.5 5 19" /></>),
  card: P(<><rect x="2" y="5" width="20" height="14" rx="3" /><path d="M2 10h20" /></>),
};

/* ---------- atoms ---------- */
export function Avatar({ name, size = 40 }) {
  return (
    <span className="av" style={{ background: colorFor(name), width: size, height: size, fontSize: size * 0.38 }}>
      {initials(name)}
    </span>
  );
}

export function Pill({ tone = "", children }) {
  return <span className={`pill2 ${tone}`}>{children}</span>;
}

export function Kpi({ icon, label, value, sub, tone = "" }) {
  return (
    <div className={`kpi2 ${tone}`}>
      <span className="kpi2-ic">{icon}</span>
      <div className="kpi2-tx"><small>{label}</small><b>{value}</b>{sub && <span>{sub}</span>}</div>
    </div>
  );
}

export function Panel({ title, sub, action, children, pad = true }) {
  return (
    <section className={`panel2${pad ? "" : " flush"}`}>
      {(title || action) && (
        <div className="panel2-head">
          <div>{title && <h3>{title}</h3>}{sub && <p>{sub}</p>}</div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Empty({ icon, title, text }) {
  return (
    <div className="empty2">
      <span className="empty2-ic">{icon || Icon.spark}</span>
      <b>{title}</b>
      {text && <p>{text}</p>}
    </div>
  );
}

export function ProgressBar({ pct }) {
  return <div className="pbar"><i style={{ width: Math.min(100, Math.max(0, pct)) + "%" }} /></div>;
}

/* ---------- charts (pure SVG) ---------- */
export function BarChart({ data }) {
  // data: [{label, value}]
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="barchart">
      {data.map((d) => (
        <div className="barchart-col" key={d.label}>
          <div className="barchart-track">
            <div className="barchart-fill" style={{ height: Math.max(6, (d.value / max) * 100) + "%" }} title={`${d.label}: ${d.value}`} />
          </div>
          <small>{d.label}</small>
        </div>
      ))}
    </div>
  );
}

export function HBarList({ data }) {
  // data: [{label, value}]
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="hbarlist">
      {data.map((d) => (
        <div className="hbar" key={d.label}>
          <div className="hbar-top"><span>{d.label}</span><b>{d.value}</b></div>
          <div className="hbar-track"><i style={{ width: (d.value / max) * 100 + "%" }} /></div>
        </div>
      ))}
    </div>
  );
}

export function Ring({ pct, size = 84, label }) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (Math.min(100, Math.max(0, pct)) / 100) * c;
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#e8edea" strokeWidth="9" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#047857" strokeWidth="9" fill="none"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
          transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div className="ring-tx"><b>{Math.round(pct)}%</b>{label && <small>{label}</small>}</div>
    </div>
  );
}
