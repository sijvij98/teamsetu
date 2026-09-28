"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../AuthProvider";
import { getSupabase } from "../../lib/supabaseClient";
import { Avatar, Icon, greeting } from "./ui";

/* App shell: dark sidebar (icon rail on tablet, bottom nav on phone),
   top bar with title / notifications / profile. */

export const ADMIN_NAV = [
  ["overview", "Overview", Icon.home],
  ["directory", "Directory", Icon.users],
  ["timeoff", "Time Off", Icon.calendar],
  ["onboarding", "Onboarding", Icon.rocket],
  ["offers", "Offer Letters", Icon.doc],
];

export const EMP_NAV = [
  ["home", "Home", Icon.home],
  ["leave", "My Leave", Icon.calendar],
  ["onboarding", "Onboarding", Icon.rocket],
  ["directory", "Directory", Icon.users],
];

const TITLES = {
  overview: ["Overview", "Your workspace at a glance"],
  directory: ["Directory", "Everyone in the company"],
  timeoff: ["Time Off", "Leave requests and balances"],
  onboarding: ["Onboarding", "New joiners and checklists"],
  offers: ["Offer Letters", "Create and track offers"],
  home: ["Home", "Your day at a glance"],
  leave: ["My Leave", "Balances, requests and history"],
};

/* Notification bell: in-app inbox for leave decisions, offers, onboarding.
   Polls every 30s so new items appear without a refresh. */
function NotifBell() {
  const { profile } = useAuth();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const empId = profile?.employee_id;

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !empId) return;
    let alive = true;
    const load = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("id, title, body, read, created_at")
        .eq("employee_id", empId)
        .order("created_at", { ascending: false })
        .limit(15);
      if (alive) setItems(data || []);
    };
    load();
    const t = setInterval(load, 30000);
    return () => { alive = false; clearInterval(t); };
  }, [empId]);

  const unread = items.filter((n) => !n.read).length;

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      const supabase = getSupabase();
      setItems((cur) => cur.map((n) => ({ ...n, read: true })));
      if (supabase) {
        await supabase.from("notifications").update({ read: true }).eq("employee_id", empId).eq("read", false);
      }
    }
  };

  const ago = (ts) => {
    if (!ts) return "";
    const m = Math.round((Date.now() - new Date(ts).getTime()) / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.round(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.round(h / 24)}d ago`;
  };

  return (
    <div className="notif-wrap">
      <button className="icon-btn bell" title="Notifications" onClick={toggle}>
        {Icon.bell}{unread > 0 && <i className="dot">{unread}</i>}
      </button>
      {open && (
        <>
          <div className="notif-scrim" onClick={() => setOpen(false)} />
          <div className="notif-pop">
            <div className="notif-head"><b>Notifications</b>{unread > 0 && <small>{unread} new</small>}</div>
            {items.length === 0 && <p className="notif-empty">You're all caught up. Leave updates, offers and onboarding alerts will land here.</p>}
            {items.map((n) => (
              <div className={`notif-item${n.read ? "" : " fresh"}`} key={n.id}>
                <b>{n.title}</b>
                {n.body && <small>{n.body}</small>}
                <span className="notif-time">{ago(n.created_at)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Shell({ nav, tab, setTab, notifCount, displayName, children }) {
  const { user, profile, company, signOut } = useAuth();
  const name = displayName || user?.email?.split("@")[0] || "there";
  const first = name.split(" ")[0];
  const [title, sub] = TITLES[tab] || ["Dashboard", ""];

  return (
    <div className="dash">
      {/* sidebar */}
      <aside className="dash-side">
        <div className="dash-brand">
          <span className="dash-logo">TS</span>
          <span className="dash-brand-tx"><b>TeamSetu</b><small>{company?.name || "Workspace"}</small></span>
        </div>
        <nav className="dash-nav">
          {nav.map(([key, label, icon]) => (
            <button key={key} className={`dash-link${tab === key ? " on" : ""}`} onClick={() => setTab(key)}>
              <span className="dash-link-ic">{icon}</span>
              <span className="dash-link-tx">{label}</span>
              {key === "timeoff" && notifCount > 0 && <span className="dash-badge">{notifCount}</span>}
            </button>
          ))}
        </nav>
        <div className="dash-user">
          <Avatar name={name} size={38} />
          <div className="dash-user-tx"><b>{first}</b><small style={{ textTransform: "capitalize" }}>{profile?.role || "member"}</small></div>
          <button className="icon-btn" title="Log out" onClick={signOut}>{Icon.logout}</button>
        </div>
      </aside>

      {/* main */}
      <div className="dash-main">
        <header className="dash-top">
          <div className="dash-top-tx">
            <p className="dash-hello">{greeting()}, {first} 👋</p>
            <h2>{title}</h2>
            <p className="dash-sub">{sub}</p>
          </div>
          <div className="dash-top-right">
            <NotifBell />
            <Avatar name={name} size={40} />
          </div>
        </header>
        <div className="dash-body">{children}</div>
      </div>

      {/* bottom nav for phones */}
      <nav className="dash-bottomnav">
        {nav.map(([key, label, icon]) => (
          <button key={key} className={tab === key ? "on" : ""} onClick={() => setTab(key)}>
            <span>{icon}</span><small>{label}</small>
            {key === "timeoff" && notifCount > 0 && <i className="dot">{notifCount}</i>}
          </button>
        ))}
      </nav>
    </div>
  );
}
