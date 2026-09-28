"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const EMPLOYEES = [
  ["Aarav Sharma", "Engineering", "Backend Developer", "Bangalore", "#0ea5e9", "AS", "Active"],
  ["Diya Patel", "Design", "Product Designer", "Mumbai", "#8b5cf6", "DP", "On leave"],
  ["Rohan Mehta", "Sales", "Account Executive", "Delhi", "#f59e0b", "RM", "Active"],
  ["Sneha Iyer", "Marketing", "Content Lead", "Chennai", "#ec4899", "SI", "Active"],
  ["Vikram Singh", "Engineering", "DevOps Engineer", "Gurgaon", "#10b981", "VS", "Active"],
  ["Ananya Das", "People", "HR Business Partner", "Kolkata", "#6366f1", "AD", "Active"],
  ["Kabir Malhotra", "Finance", "Analyst", "Delhi", "#14b8a6", "KM", "Probation"],
  ["Priya Nair", "Engineering", "Frontend Developer", "Kochi", "#f43f5e", "PN", "Active"],
];

const NAV = [
  ["Overview", "◈"], ["Directory", "👥"], ["Time Off", "🌴"], ["Onboarding", "🚀"],
  ["Performance", "📈"], ["Reports", "📊"], ["Settings", "⚙"],
];

const HIRING = [["Jan", 8], ["Feb", 11], ["Mar", 9], ["Apr", 14], ["May", 12], ["Jun", 18], ["Jul", 15], ["Aug", 21]];

function Overview() {
  return (
    <>
      <div className="kpi-grid">
        {[
          ["Total employees", "248", "+12 this month"],
          ["On leave today", "18", "7% of workforce"],
          ["Pending approvals", "7", "3 time-off · 4 expenses"],
          ["Open positions", "9", "32 candidates in pipeline"],
        ].map(([l, v, s]) => (
          <div className="kpi" key={l}><small>{l}</small><b>{v}</b><span>{s}</span></div>
        ))}
      </div>
      <div className="two-col">
        <div className="panel">
          <h3>Hiring this year</h3>
          <p className="psub">New joiners per month</p>
          <div className="bars">
            {HIRING.map(([m, v]) => (
              <div className="bar-col" key={m}>
                <i style={{ height: (v / 21) * 100 + "%" }} />
                <small>{m}</small>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <h3>Needs your approval</h3>
          <p className="psub">Oldest first</p>
          {[
            ["Diya Patel", "Annual leave · Dec 23–26 (4 days)", "#8b5cf6", "DP"],
            ["Kabir Malhotra", "Sick leave · Today", "#14b8a6", "KM"],
            ["Sneha Iyer", "Expense · ₹8,400 conference", "#ec4899", "SI"],
          ].map(([n, d, c, ini]) => (
            <div className="appr" key={n}>
              <span className="avatar" style={{ background: c }}>{ini}</span>
              <div className="grow"><b>{n}</b><small>{d}</small></div>
              <button className="mini-btn ok">Approve</button>
            </div>
          ))}
        </div>
      </div>
      <div className="panel">
        <h3>Onboarding in progress</h3>
        <p className="psub">New hires from the last 30 days</p>
        <table className="tbl">
          <thead><tr><th>Employee</th><th>Department</th><th>Start date</th><th>Progress</th></tr></thead>
          <tbody>
            {[
              ["Aarav Sharma", "Engineering", "Sep 25", 72, "#0ea5e9", "AS"],
              ["Ishita Bose", "Support", "Sep 20", 91, "#8b5cf6", "IB"],
              ["Arjun Reddy", "Sales", "Sep 28", 34, "#f59e0b", "AR"],
            ].map(([n, d, s, p, c, ini]) => (
              <tr key={n}>
                <td><span className="who"><span className="avatar" style={{ background: c }}>{ini}</span>{n}</span></td>
                <td>{d}</td><td>{s}</td>
                <td style={{ minWidth: 180 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                    <span></span><b>{p}%</b>
                  </div>
                  <div className="progress" style={{ marginTop: 0 }}><i style={{ width: p + "%" }} /></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Directory() {
  const [q, setQ] = useState("");
  const rows = EMPLOYEES.filter(([n, d, r]) =>
    (n + d + r).toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div className="panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 8 }}>
        <div><h3>Employee directory</h3><p className="psub" style={{ margin: 0 }}>{rows.length} of {EMPLOYEES.length} shown</p></div>
        <input className="search" placeholder="Search name, role, dept…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="tbl">
          <thead><tr><th>Employee</th><th>Department</th><th>Role</th><th>Location</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map(([n, d, r, l, c, ini, s]) => (
              <tr key={n}>
                <td><span className="who"><span className="avatar" style={{ background: c }}>{ini}</span>{n}</span></td>
                <td>{d}</td><td>{r}</td><td>{l}</td>
                <td><span className={`pill ${s !== "Active" ? "warn" : ""}`}>{s}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TimeOff() {
  const [reqs, setReqs] = useState([
    ["Diya Patel", "Annual leave", "Dec 23 – Dec 26 · 4 days", "#8b5cf6", "DP"],
    ["Kabir Malhotra", "Sick leave", "Today · 1 day", "#14b8a6", "KM"],
    ["Sneha Iyer", "Work from home", "Oct 2 – Oct 3 · 2 days", "#ec4899", "SI"],
  ]);
  const decide = (i, ok) => setReqs(reqs.map((r, j) => (i === j ? [...r.slice(0, 4), ok ? "Approved" : "Declined"] : r)));
  return (
    <>
      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {[["Annual leave balance (avg)", "14.2 days", "resets Jan 1"], ["Sick leave taken (Sep)", "23 days", "team-wide"], ["Pending requests", String(reqs.filter((r) => !r[5]).length), "awaiting action"]].map(([l, v, s]) => (
          <div className="kpi" key={l}><small>{l}</small><b>{v}</b><span>{s}</span></div>
        ))}
      </div>
      <div className="panel">
        <h3>Time-off requests</h3>
        <p className="psub">Approve or decline — balances update automatically</p>
        {reqs.map(([n, t, d, c, ini, done], i) => (
          <div className="appr" key={n}>
            <span className="avatar" style={{ background: c }}>{ini}</span>
            <div className="grow"><b>{n} · {t}</b><small>{d}</small></div>
            {done ? <span className={`pill ${done === "Declined" ? "warn" : ""}`}>{done}</span> : (
              <>
                <button className="mini-btn ok" onClick={() => decide(i, true)}>Approve</button>
                <button className="mini-btn no" onClick={() => decide(i, false)}>Decline</button>
              </>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function Soon({ title, text }) {
  return (
    <div className="panel center" style={{ padding: "70px 30px" }}>
      <div style={{ fontSize: 44, marginBottom: 14 }}>🛠️</div>
      <h3>{title}</h3>
      <p className="psub" style={{ maxWidth: 440, margin: "0 auto" }}>{text}</p>
    </div>
  );
}

export default function Dashboard() {
  const [tab, setTab] = useState("Overview");
  const [user, setUser] = useState({ name: "Demo User", company: "Acme Pvt. Ltd." });

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("teamsetu_user") || "null");
      if (u) setUser({ name: u.name || u.email?.split("@")[0] || "Demo User", company: u.company || "Acme Pvt. Ltd." });
    } catch {}
  }, []);

  return (
    <div className="dash">
      <aside className="dash-side">
        <Link href="/" className="brand"><span className="brand-mark">TS</span> TeamSetu</Link>
        {NAV.map(([t, ico]) => (
          <button key={t} className={`dash-link ${tab === t ? "on" : ""}`} onClick={() => setTab(t)}>
            <i>{ico}</i> {t}
          </button>
        ))}
        <div className="dash-user">
          <span className="avatar" style={{ background: "var(--green-500)" }}>{user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}</span>
          <div><b style={{ color: "#fff" }}>{user.name}</b><br /><span style={{ fontSize: 12 }}>{user.company}</span></div>
        </div>
      </aside>
      <div className="dash-main">
        <div className="dash-top">
          <div>
            <h1>{tab === "Overview" ? `Good evening, ${user.name.split(" ")[0]} 👋` : tab}</h1>
            <p>{user.company} · {tab === "Overview" ? "Here's what's happening today." : "Demo data for illustration."}</p>
          </div>
          <input className="search" placeholder="Search employees, reports…" />
        </div>

        {tab === "Overview" && <Overview />}
        {tab === "Directory" && <Directory />}
        {tab === "Time Off" && <TimeOff />}
        {tab === "Onboarding" && <Soon title="Onboarding workspace" text="Checklists, document collection, and day-one task automation live here. This demo build shows the overview above." />}
        {tab === "Performance" && <Soon title="Performance hub" text="Goals, 1-on-1s, and review cycles live here. This demo build shows the overview above." />}
        {tab === "Reports" && <Soon title="Reports library" text="50+ ready-made HR reports and a custom builder live here. This demo build shows the overview above." />}
        {tab === "Settings" && <Soon title="Workspace settings" text="Company profile, leave policies, roles, and integrations live here." />}
      </div>
    </div>
  );
}
