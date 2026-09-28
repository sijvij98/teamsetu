"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase } from "../../lib/supabaseClient";
import { useAuth } from "../../components/AuthProvider";

const NAV = [
  ["Overview", "◈"], ["Directory", "👥"], ["Time Off", "🌴"],
  ["Onboarding", "🚀"], ["Offer Letters", "📄"],
  ["Performance", "📈"], ["Reports", "📊"], ["Settings", "⚙"],
];

const AVATAR_COLORS = ["#0ea5e9", "#8b5cf6", "#f59e0b", "#ec4899", "#10b981", "#6366f1", "#14b8a6", "#f43f5e"];

function colorFor(name) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
function initials(name) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}
function inr(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/* ---------------- data hook ---------------- */
function useCompanyData(refreshKey) {
  const [data, setData] = useState({ employees: [], leaves: [], tasks: [], offers: [] });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    (async () => {
      const supabase = getSupabase();
      const [e, l, t, o] = await Promise.all([
        supabase.from("employees").select("*").order("name"),
        supabase.from("leave_requests").select("*, employees(name, department)").order("created_at", { ascending: false }),
        supabase.from("onboarding_tasks").select("*, employees(name, department, joining_date)").order("due_date"),
        supabase.from("offer_letters").select("*, employees(name, email)").order("created_at", { ascending: false }),
      ]);
      if (!alive) return;
      setData({
        employees: e.data || [],
        leaves: l.data || [],
        tasks: t.data || [],
        offers: o.data || [],
      });
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [refreshKey]);
  return { ...data, loading };
}

/* ---------------- Overview ---------------- */
function Overview({ employees, leaves, tasks, bump }) {
  const today = todayISO();
  const onLeaveToday = leaves.filter(
    (l) => l.status === "approved" && l.from_date <= today && l.to_date >= today
  ).length;
  const pending = leaves.filter((l) => l.status === "pending");
  const onboarding = employees.filter((e) => e.status === "onboarding");

  const hiring = useMemo(() => {
    const buckets = {};
    employees.forEach((e) => {
      if (!e.joining_date) return;
      const d = new Date(e.joining_date + "T00:00:00");
      const key = d.toLocaleDateString("en-IN", { month: "short" }) + " " + String(d.getFullYear()).slice(2);
      const sort = d.getFullYear() * 12 + d.getMonth();
      buckets[key] = buckets[key] || { key, sort, v: 0 };
      buckets[key].v += 1;
    });
    return Object.values(buckets).sort((a, b) => a.sort - b.sort).slice(-8);
  }, [employees]);
  const maxH = Math.max(1, ...hiring.map((h) => h.v));

  const decide = async (id, ok, profileId) => {
    const supabase = getSupabase();
    await supabase.from("leave_requests").update({
      status: ok ? "approved" : "declined",
      decided_by: profileId,
    }).eq("id", id);
    bump();
  };

  return (
    <>
      <div className="kpi-grid">
        {[
          ["Total employees", String(employees.length), `${onboarding.length} onboarding`],
          ["On leave today", String(onLeaveToday), "approved leaves"],
          ["Pending approvals", String(pending.length), "need your action"],
          ["Offers pending", String(employees.filter((e) => e.status === "offered").length), "awaiting acceptance"],
        ].map(([l, v, s]) => (
          <div className="kpi" key={l}><small>{l}</small><b>{v}</b><span>{s}</span></div>
        ))}
      </div>
      <div className="two-col">
        <div className="panel">
          <h3>Joining trend</h3>
          <p className="psub">New joiners per month</p>
          <div className="bars">
            {hiring.length === 0 && <p className="psub">No joining data yet.</p>}
            {hiring.map((h) => (
              <div className="bar-col" key={h.key}>
                <i style={{ height: Math.max(6, (h.v / maxH) * 100) + "%" }} />
                <small>{h.key.split(" ")[0]}</small>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <h3>Needs your approval</h3>
          <p className="psub">Oldest first</p>
          {pending.length === 0 && <p className="psub">All caught up — nothing pending. 🎉</p>}
          {pending.slice(0, 5).map((l) => (
            <LeaveRow key={l.id} l={l} onDecide={decide} />
          ))}
        </div>
      </div>
      <div className="panel">
        <h3>Onboarding in progress</h3>
        <p className="psub">Task completion per new hire</p>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Employee</th><th>Department</th><th>Start date</th><th>Progress</th></tr></thead>
            <tbody>
              {onboarding.length === 0 && <tr><td colSpan={4} className="psub">No one onboarding right now.</td></tr>}
              {onboarding.map((e) => {
                const et = tasks.filter((t) => t.employee_id === e.id);
                const p = et.length ? Math.round((et.filter((t) => t.done).length / et.length) * 100) : 0;
                return (
                  <tr key={e.id}>
                    <td><span className="who"><span className="avatar" style={{ background: colorFor(e.name) }}>{initials(e.name)}</span>{e.name}</span></td>
                    <td>{e.department}</td><td>{fmtDate(e.joining_date)}</td>
                    <td style={{ minWidth: 180 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                        <span>{et.filter((t) => t.done).length}/{et.length} tasks</span><b>{p}%</b>
                      </div>
                      <div className="progress" style={{ marginTop: 0 }}><i style={{ width: p + "%" }} /></div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function LeaveRow({ l, onDecide }) {
  const { profile } = useAuth();
  const n = l.employees?.name || "Employee";
  const days = Math.max(1, Math.round((new Date(l.to_date) - new Date(l.from_date)) / 86400000) + 1);
  return (
    <div className="appr">
      <span className="avatar" style={{ background: colorFor(n) }}>{initials(n)}</span>
      <div className="grow"><b>{n}</b><small>{l.leave_type} · {fmtDate(l.from_date)} – {fmtDate(l.to_date)} ({days} day{days > 1 ? "s" : ""})</small></div>
      <button className="mini-btn ok" onClick={() => onDecide(l.id, true, profile?.id)}>Approve</button>
      <button className="mini-btn no" onClick={() => onDecide(l.id, false, profile?.id)}>Decline</button>
    </div>
  );
}

/* ---------------- Directory ---------------- */
function Directory({ employees }) {
  const [q, setQ] = useState("");
  const rows = employees.filter((e) =>
    (e.name + e.department + e.title).toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div className="panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 8 }}>
        <div><h3>Employee directory</h3><p className="psub" style={{ margin: 0 }}>{rows.length} of {employees.length} shown</p></div>
        <input className="search" placeholder="Search name, role, dept…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>Employee</th><th>Department</th><th>Role</th><th>Location</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id}>
                <td><span className="who"><span className="avatar" style={{ background: colorFor(e.name) }}>{initials(e.name)}</span>{e.name}</span></td>
                <td>{e.department}</td><td>{e.title}</td><td>{e.location || "—"}</td>
                <td><span className={`pill ${e.status !== "active" ? "warn" : ""}`}>{e.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- Time Off ---------------- */
function TimeOff({ leaves, bump }) {
  const { profile } = useAuth();
  const pending = leaves.filter((l) => l.status === "pending");
  const decided = leaves.filter((l) => l.status !== "pending");

  const decide = async (id, ok) => {
    const supabase = getSupabase();
    await supabase.from("leave_requests").update({
      status: ok ? "approved" : "declined",
      decided_by: profile?.id,
    }).eq("id", id);
    bump();
  };

  return (
    <>
      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {[
          ["Pending requests", String(pending.length), "awaiting action"],
          ["Approved (all time)", String(leaves.filter((l) => l.status === "approved").length), ""],
          ["Declined (all time)", String(leaves.filter((l) => l.status === "declined").length), ""],
        ].map(([l, v, s]) => (
          <div className="kpi" key={l}><small>{l}</small><b>{v}</b><span>{s}</span></div>
        ))}
      </div>
      <div className="panel">
        <h3>Time-off requests</h3>
        <p className="psub">Approve or decline — the directory updates automatically</p>
        {leaves.length === 0 && <p className="psub">No requests yet.</p>}
        {pending.map((l) => <LeaveRow key={l.id} l={l} onDecide={decide} />)}
        {decided.slice(0, 10).map((l) => {
          const n = l.employees?.name || "Employee";
          return (
            <div className="appr" key={l.id}>
              <span className="avatar" style={{ background: colorFor(n) }}>{initials(n)}</span>
              <div className="grow"><b>{n} · {l.leave_type}</b><small>{fmtDate(l.from_date)} – {fmtDate(l.to_date)}{l.reason ? ` · ${l.reason}` : ""}</small></div>
              <span className={`pill ${l.status === "declined" ? "warn" : ""}`}>{l.status}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ---------------- Onboarding ---------------- */
const DEFAULT_TASKS = [
  "Send welcome email with day-one plan",
  "Collect ID proof and address proof",
  "Issue laptop and access card",
  "Create email and tool accounts",
  "Assign onboarding buddy",
  "Schedule HR orientation",
  "Complete payroll and bank details",
  "Day-7 check-in with manager",
];

function Onboarding({ employees, tasks, bump }) {
  const [creatingFor, setCreatingFor] = useState("");
  const [busy, setBusy] = useState(false);
  const onboarding = employees.filter((e) => e.status === "onboarding" || e.status === "offered");

  const toggle = async (t) => {
    const supabase = getSupabase();
    await supabase.from("onboarding_tasks").update({ done: !t.done }).eq("id", t.id);
    bump();
  };

  const seedTasks = async (empId, companyId) => {
    setBusy(true);
    const supabase = getSupabase();
    const due = new Date(); due.setDate(due.getDate() + 7);
    await supabase.from("onboarding_tasks").insert(
      DEFAULT_TASKS.map((title, i) => ({
        company_id: companyId, employee_id: empId, title,
        due_date: new Date(Date.now() + i * 86400000).toISOString().slice(0, 10),
      }))
    );
    await supabase.from("employees").update({ status: "onboarding" }).eq("id", empId);
    setCreatingFor(""); setBusy(false); bump();
  };

  return (
    <div className="panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div><h3>Onboarding workspace</h3><p className="psub" style={{ margin: 0 }}>Checklists, documents, and day-one tasks</p></div>
      </div>
      {onboarding.length === 0 && <p className="psub" style={{ marginTop: 16 }}>No one onboarding right now. Accepted offers appear here.</p>}
      {onboarding.map((e) => {
        const et = tasks.filter((t) => t.employee_id === e.id);
        const p = et.length ? Math.round((et.filter((t) => t.done).length / et.length) * 100) : 0;
        return (
          <div key={e.id} style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 18, marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <span className="who"><span className="avatar" style={{ background: colorFor(e.name) }}>{initials(e.name)}</span><b>{e.name}</b><span className="psub">· {e.title}, {e.department} · joins {fmtDate(e.joining_date)}</span></span>
              <b>{p}%</b>
            </div>
            <div className="progress"><i style={{ width: p + "%" }} /></div>
            {et.length === 0 ? (
              <button className="mini-btn ok" disabled={busy} style={{ marginTop: 12 }} onClick={() => seedTasks(e.id, e.company_id)}>
                {busy ? "Creating…" : "Start onboarding checklist"}
              </button>
            ) : (
              <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                {et.map((t) => (
                  <label key={t.id} style={{ display: "flex", gap: 10, alignItems: "center", cursor: "pointer", fontSize: 14.5 }}>
                    <input type="checkbox" checked={t.done} onChange={() => toggle(t)} style={{ width: 17, height: 17, accentColor: "#047857" }} />
                    <span style={{ textDecoration: t.done ? "line-through" : "none", color: t.done ? "var(--muted)" : "inherit" }}>{t.title}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Offer Letters ---------------- */
function OfferLetters({ employees, offers, company, bump }) {
  const [view, setView] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", position: "", department: "Engineering", ctc: "", joining: "" });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const create = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const supabase = getSupabase();
      const no = `TS/${new Date().getFullYear()}/${String(offers.length + 1).padStart(3, "0")}`;
      const { data: emp, error: eErr } = await supabase.from("employees").insert({
        company_id: company.id,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        department: form.department,
        title: form.position.trim(),
        joining_date: form.joining,
        status: "offered",
      }).select("id").single();
      if (eErr) throw eErr;
      const { error: oErr } = await supabase.from("offer_letters").insert({
        company_id: company.id,
        employee_id: emp.id,
        letter_no: no,
        position: form.position.trim(),
        department: form.department,
        ctc_annual: Number(form.ctc),
        joining_date: form.joining,
        status: "draft",
      });
      if (oErr) throw oErr;
      setForm({ name: "", email: "", phone: "", position: "", department: "Engineering", ctc: "", joining: "" });
      bump();
    } catch (ex) {
      alert(ex.message);
    }
    setBusy(false);
  };

  const setStatus = async (id, status) => {
    const supabase = getSupabase();
    await supabase.from("offer_letters").update({ status }).eq("id", id);
    if (status === "accepted") {
      const of = offers.find((o) => o.id === id);
      if (of) await supabase.from("employees").update({ status: "onboarding" }).eq("id", of.employee_id);
    }
    setView(null);
    bump();
  };

  if (view) return <LetterView offer={view} company={company} onBack={() => setView(null)} onStatus={setStatus} />;

  return (
    <>
      <div className="panel">
        <h3>Generate offer letter</h3>
        <p className="psub">Fill the details — TeamSetu drafts a formal letter you can print or send</p>
        <form onSubmit={create} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginTop: 12 }}>
          <div className="field"><label>Candidate name</label><input required value={form.name} onChange={set("name")} placeholder="Aarav Kapoor" /></div>
          <div className="field"><label>Email</label><input required type="email" value={form.email} onChange={set("email")} placeholder="aarav@email.com" /></div>
          <div className="field"><label>Phone</label><input value={form.phone} onChange={set("phone")} placeholder="+91…" /></div>
          <div className="field"><label>Position</label><input required value={form.position} onChange={set("position")} placeholder="Backend Developer" /></div>
          <div className="field"><label>Department</label>
            <select value={form.department} onChange={set("department")}>
              {["Engineering", "Design", "Sales", "Marketing", "People", "Finance", "Support", "Operations"].map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="field"><label>Annual CTC (₹)</label><input required type="number" min="1" value={form.ctc} onChange={set("ctc")} placeholder="1200000" /></div>
          <div className="field"><label>Joining date</label><input required type="date" value={form.joining} onChange={set("joining")} /></div>
          <div className="field" style={{ justifyContent: "flex-end", display: "flex" }}>
            <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Generating…" : "Generate letter →"}</button>
          </div>
        </form>
      </div>
      <div className="panel">
        <h3>All offer letters</h3>
        <p className="psub">{offers.length} issued</p>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Letter no.</th><th>Candidate</th><th>Position</th><th>CTC</th><th>Joining</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {offers.length === 0 && <tr><td colSpan={7} className="psub">No offer letters yet.</td></tr>}
              {offers.map((o) => (
                <tr key={o.id}>
                  <td><b>{o.letter_no}</b></td>
                  <td>{o.employees?.name}</td>
                  <td>{o.position}</td>
                  <td>{inr(o.ctc_annual)}</td>
                  <td>{fmtDate(o.joining_date)}</td>
                  <td><span className={`pill ${o.status === "draft" ? "warn" : ""}`}>{o.status}</span></td>
                  <td><button className="mini-btn ok" onClick={() => setView(o)}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function LetterView({ offer, company, onBack, onStatus }) {
  const monthly = Math.round(Number(offer.ctc_annual) / 12);
  return (
    <div className="panel">
      <div style={{ display: "flex", gap: 10, marginBottom: 18 }} className="no-print">
        <button className="mini-btn" onClick={onBack}>← Back</button>
        <button className="mini-btn ok" onClick={() => window.print()}>🖨 Print / Save PDF</button>
        {offer.status === "draft" && <button className="mini-btn ok" onClick={() => onStatus(offer.id, "sent")}>Mark as sent</button>}
        {offer.status === "sent" && <button className="mini-btn ok" onClick={() => onStatus(offer.id, "accepted")}>Mark accepted</button>}
      </div>
      <div className="offer-doc" style={{ maxWidth: 720, margin: "0 auto", background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: "48px 52px", color: "#1a1a1a", lineHeight: 1.7, fontSize: 15 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: 20 }}>
            <span style={{ background: "#047857", color: "#fff", borderRadius: 10, padding: "6px 10px", fontSize: 15 }}>TS</span> {company?.name}
          </div>
          <div style={{ textAlign: "right", fontSize: 13, color: "#666" }}>Letter no. {offer.letter_no}<br />Date: {fmtDate(offer.created_at?.slice(0, 10))}</div>
        </div>
        <h2 style={{ fontSize: 24, margin: "0 0 16px" }}>Offer of Employment</h2>
        <p>Dear <b>{offer.employees?.name}</b>,</p>
        <p>We are delighted to offer you the position of <b>{offer.position}</b> in our <b>{offer.department}</b> department at {company?.name}. Your annual cost-to-company (CTC) will be <b>{inr(offer.ctc_annual)}</b> (approximately {inr(monthly)} per month), paid as per the company's payroll cycle.</p>
        <p><b>Joining date:</b> {fmtDate(offer.joining_date)}</p>
        <p><b>Terms:</b></p>
        <ul style={{ paddingLeft: 20 }}>
          <li>This offer is subject to verification of your documents and references.</li>
          <li>You will be on probation for the first 3 months of employment.</li>
          <li>Standard notice period is 30 days on either side after confirmation.</li>
          <li>Employment is subject to the company's HR policies shared on day one.</li>
        </ul>
        <p>Please confirm your acceptance by signing below and returning a copy before your joining date. We look forward to having you on the team!</p>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 56 }}>
          <div>______________________<br /><small>Authorised signatory, {company?.name}</small></div>
          <div>______________________<br /><small>Candidate signature & date</small></div>
        </div>
      </div>
    </div>
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
  const [refreshKey, setRefreshKey] = useState(0);
  const { user, profile, company, loading, signOut } = useAuth();
  const router = useRouter();
  const { employees, leaves, tasks, offers, loading: dataLoading } = useCompanyData(refreshKey);
  const bump = () => setRefreshKey((k) => k + 1);

  const emp = employees.find((e) => e.email === user?.email);
  const name = emp?.name || user?.email?.split("@")[0] || "User";

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  if (loading) {
    return <div className="dash"><div className="dash-main center" style={{ padding: 80 }}><p className="psub">Loading your workspace…</p></div></div>;
  }

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
          <span className="avatar" style={{ background: "var(--green-500)" }}>{initials(name)}</span>
          <div style={{ flex: 1 }}>
            <b style={{ color: "#fff" }}>{name}</b><br />
            <span style={{ fontSize: 12 }}>{company?.name || ""}{profile?.role ? ` · ${profile.role}` : ""}</span>
          </div>
          <button onClick={signOut} title="Log out" style={{ background: "rgba(255,255,255,.12)", border: 0, color: "#fff", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 13 }}>Logout</button>
        </div>
      </aside>
      <div className="dash-main">
        <div className="dash-top">
          <div>
            <h1>{tab === "Overview" ? `${greet}, ${name.split(" ")[0]} 👋` : tab}</h1>
            <p>{company?.name || "Your workspace"} · {tab === "Overview" ? "Here's what's happening today." : "Live data from your database."}</p>
          </div>
        </div>

        <div className="dash-tabs">
          {NAV.map(([t, ico]) => (
            <button key={t} className={`dash-tab ${tab === t ? "on" : ""}`} onClick={() => setTab(t)}>
              <i>{ico}</i> {t}
            </button>
          ))}
        </div>

        {dataLoading ? (
          <div className="panel center" style={{ padding: 60 }}><p className="psub">Fetching live data…</p></div>
        ) : (
          <>
            {tab === "Overview" && <Overview employees={employees} leaves={leaves} tasks={tasks} bump={bump} />}
            {tab === "Directory" && <Directory employees={employees} />}
            {tab === "Time Off" && <TimeOff leaves={leaves} bump={bump} />}
            {tab === "Onboarding" && <Onboarding employees={employees} tasks={tasks} bump={bump} />}
            {tab === "Offer Letters" && <OfferLetters employees={employees} offers={offers} company={company} bump={bump} />}
            {tab === "Performance" && <Soon title="Performance hub" text="Goals, 1-on-1s, and review cycles will live here." />}
            {tab === "Reports" && <Soon title="Reports library" text="50+ ready-made HR reports and a custom builder will live here." />}
            {tab === "Settings" && <Soon title="Workspace settings" text="Company profile, leave policies, roles, and integrations will live here." />}
          </>
        )}
      </div>
    </div>
  );
}
