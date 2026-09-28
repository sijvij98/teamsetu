"use client";

import { useMemo, useState } from "react";
import { getSupabase } from "../../lib/supabaseClient";
import { notifyEmployee } from "../../lib/notify";
import { useAuth } from "../AuthProvider";
import {
  Avatar, Pill, Kpi, Panel, Empty, ProgressBar, BarChart, HBarList,
  Icon, colorFor, fmtDate, inr, todayISO, daysBetween,
} from "./ui";

/* Notify an employee about a leave decision (in-app bell + email). */
async function notifyLeaveDecision(leave, ok) {
  const range = `${fmtDate(leave.from_date)} → ${fmtDate(leave.to_date)}`;
  notifyEmployee(leave.employee_id, {
    kind: ok ? "leave_approved" : "leave_declined",
    title: ok ? "Leave approved ✓" : "Leave request declined",
    body: `Your ${leave.leave_type} (${range}) was ${ok ? "approved" : "declined"} by HR.`,
    email: {
      to: leave.employees?.email,
      subject: `Your leave request was ${ok ? "approved" : "declined"} — ${leave.leave_type}`,
      html: `<p>Hi ${leave.employees?.name || "there"},</p><p>Your <b>${leave.leave_type}</b> request (${range}) has been <b>${ok ? "approved" : "declined"}</b> by HR.</p><p>Open TeamSetu → My Leave to see the details.</p>`,
    },
  });
}

/* ================= ADMIN: overview ================= */
export function AdminOverview({ employees, leaves, tasks, offers, bump }) {
  const { profile } = useAuth();
  const today = todayISO();
  const onLeaveToday = leaves.filter((l) => l.status === "approved" && l.from_date <= today && l.to_date >= today).length;
  const pending = leaves.filter((l) => l.status === "pending");
  const offered = employees.filter((e) => e.status === "offered").length;
  const thisMonth = employees.filter((e) => e.joining_date && e.joining_date.slice(0, 7) === today.slice(0, 7)).length;

  const trend = useMemo(() => {
    const buckets = {};
    employees.forEach((e) => {
      if (!e.joining_date) return;
      const d = new Date(e.joining_date + "T00:00:00");
      const sort = d.getFullYear() * 12 + d.getMonth();
      buckets[sort] = buckets[sort] || { label: "", value: 0, sort, year: d.getFullYear(), month: d.getMonth() };
      buckets[sort].value += 1;
    });
    const list = Object.values(buckets).sort((a, b) => a.sort - b.sort).slice(-8);
    const multiYear = new Set(list.map((b) => b.year)).size > 1;
    return list.map((b) => ({
      ...b,
      label: new Date(b.year, b.month, 1).toLocaleDateString("en-IN", { month: "short" }) + (multiYear ? ` ’${String(b.year).slice(2)}` : ""),
    }));
  }, [employees]);

  const depts = useMemo(() => {
    const m = {};
    employees.forEach((e) => { m[e.department || "Other"] = (m[e.department || "Other"] || 0) + 1; });
    return Object.entries(m).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [employees]);

  const recent = [...employees]
    .filter((e) => e.joining_date)
    .sort((a, b) => (b.joining_date > a.joining_date ? 1 : -1))
    .slice(0, 5);

  const decide = async (leave, ok) => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.from("leave_requests").update({ status: ok ? "approved" : "declined", decided_by: profile?.id }).eq("id", leave.id);
    bump();
    notifyLeaveDecision(leave, ok);
  };

  return (
    <>
      <div className="kpi2-grid">
        <Kpi icon={Icon.users} label="Total employees" value={employees.length} sub={thisMonth ? `+${thisMonth} joined this month` : "across all departments"} />
        <Kpi icon={Icon.calendar} label="On leave today" value={onLeaveToday} sub="approved leaves" />
        <Kpi icon={Icon.clock} label="Pending approvals" value={pending.length} sub={pending.length ? "needs your action" : "all clear 🎉"} tone={pending.length ? "alert" : ""} />
        <Kpi icon={Icon.doc} label="Offers in pipeline" value={offered} sub="awaiting acceptance" />
      </div>

      <div className="grid-2">
        <Panel title="Joining trend" sub="New joiners per month">
          {trend.length ? <BarChart data={trend} /> : <Empty title="No data yet" text="Joining dates will build this chart." />}
        </Panel>
        <Panel title="Department strength" sub="Headcount by team">
          <HBarList data={depts} />
        </Panel>
      </div>

      <div className="grid-2">
        <Panel title="Pending approvals" sub="Leave requests waiting on you"
          action={pending.length > 2 ? <span className="linklike">{pending.length} total</span> : null}>
          {pending.length === 0 && <Empty icon={Icon.check} title="All caught up" text="No leave requests waiting for approval." />}
          {pending.slice(0, 3).map((l) => (
            <LeaveDecisionRow key={l.id} l={l} onDecide={decide} />
          ))}
        </Panel>
        <Panel title="Recent joiners" sub="Newest members of the team">
          {recent.map((e) => (
            <div className="rowline" key={e.id}>
              <Avatar name={e.name} size={38} />
              <div className="grow"><b>{e.name}</b><small>{e.title} · {e.department}</small></div>
              <small className="muted">joined {fmtDate(e.joining_date)}</small>
            </div>
          ))}
        </Panel>
      </div>
    </>
  );
}

function LeaveDecisionRow({ l, onDecide }) {
  const n = l.employees?.name || "Employee";
  return (
    <div className="appr2">
      <Avatar name={n} size={40} />
      <div className="grow">
        <b>{n}</b>
        <small>{l.leave_type} · {fmtDate(l.from_date)} → {fmtDate(l.to_date)} ({daysBetween(l.from_date, l.to_date)}d){l.reason ? ` · “${l.reason}”` : ""}</small>
      </div>
      <div className="appr2-btns">
        <button className="btn2 ok" onClick={() => onDecide(l, true)}>{Icon.check} Approve</button>
        <button className="btn2 no" onClick={() => onDecide(l, false)}>{Icon.x} Decline</button>
      </div>
    </div>
  );
}

/* ================= shared: directory ================= */
export function Directory({ employees }) {
  const [q, setQ] = useState("");
  const rows = employees.filter((e) => (e.name + " " + e.department + " " + e.title).toLowerCase().includes(q.toLowerCase()));
  return (
    <Panel
      title="Employee directory"
      sub={`${rows.length} of ${employees.length} shown`}
      action={<label className="search2">{Icon.search}<input placeholder="Search name, role, dept…" value={q} onChange={(e) => setQ(e.target.value)} /></label>}
    >
      <div className="tbl-wrap2">
        <table className="tbl2">
          <thead><tr><th>Employee</th><th>Department</th><th>Role</th><th>Joined</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id}>
                <td><span className="who2"><Avatar name={e.name} size={34} /><b>{e.name}</b></span></td>
                <td>{e.department}</td>
                <td>{e.title}</td>
                <td>{fmtDate(e.joining_date)}</td>
                <td><Pill tone={e.status === "active" ? "green" : e.status === "onboarding" ? "blue" : "amber"}>{e.status}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <Empty title="No matches" text="Try a different search." />}
    </Panel>
  );
}

/* ================= ADMIN: time off ================= */
export function TimeOffAdmin({ leaves, bump }) {
  const { profile } = useAuth();
  const pending = leaves.filter((l) => l.status === "pending");
  const decided = leaves.filter((l) => l.status !== "pending");

  const decide = async (leave, ok) => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.from("leave_requests").update({ status: ok ? "approved" : "declined", decided_by: profile?.id }).eq("id", leave.id);
    bump();
    notifyLeaveDecision(leave, ok);
  };

  return (
    <>
      <div className="kpi2-grid three">
        <Kpi icon={Icon.clock} label="Pending requests" value={pending.length} sub="awaiting action" tone={pending.length ? "alert" : ""} />
        <Kpi icon={Icon.check} label="Approved" value={leaves.filter((l) => l.status === "approved").length} sub="all time" />
        <Kpi icon={Icon.x} label="Declined" value={leaves.filter((l) => l.status === "declined").length} sub="all time" />
      </div>
      <Panel title="Needs your decision" sub="Approve or decline — balances update automatically">
        {pending.length === 0 && <Empty icon={Icon.check} title="Nothing pending" text="New requests will appear here." />}
        {pending.map((l) => <LeaveDecisionRow key={l.id} l={l} onDecide={decide} />)}
      </Panel>
      <Panel title="History" sub="Recently decided requests">
        {decided.slice(0, 10).map((l) => {
          const n = l.employees?.name || "Employee";
          return (
            <div className="rowline" key={l.id}>
              <Avatar name={n} size={36} />
              <div className="grow"><b>{n} · {l.leave_type}</b><small>{fmtDate(l.from_date)} → {fmtDate(l.to_date)}{l.reason ? ` · “${l.reason}”` : ""}</small></div>
              <Pill tone={l.status === "approved" ? "green" : "red"}>{l.status}</Pill>
            </div>
          );
        })}
        {decided.length === 0 && <Empty title="No history yet" />}
      </Panel>
    </>
  );
}

/* ================= ADMIN: onboarding ================= */
export const DEFAULT_TASKS = [
  "Send welcome email with day-one plan",
  "Collect ID proof and address proof",
  "Issue laptop and access card",
  "Create email and tool accounts",
  "Assign onboarding buddy",
  "Schedule HR orientation",
  "Complete payroll and bank details",
  "Day-7 check-in with manager",
];

export function TaskList({ tasks, onToggle }) {
  return (
    <div className="tasklist">
      {tasks.map((t) => (
        <label key={t.id} className={`task${t.done ? " done" : ""}`}>
          <input type="checkbox" checked={t.done} onChange={() => onToggle(t)} />
          <span className="checkbox">{Icon.check}</span>
          <span className="task-tx">{t.title}</span>
          {t.due_date && <small className="muted">due {fmtDate(t.due_date)}</small>}
        </label>
      ))}
    </div>
  );
}

export function OnboardingAdmin({ employees, tasks, company, bump }) {
  const [busy, setBusy] = useState(false);
  const list = employees.filter((e) => e.status === "onboarding" || e.status === "offered");

  const toggle = async (t) => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.from("onboarding_tasks").update({ done: !t.done }).eq("id", t.id);
    bump();
  };
  const seedTasks = async (emp) => {
    setBusy(true);
    const supabase = getSupabase();
    if (supabase) {
      await supabase.from("onboarding_tasks").insert(
        DEFAULT_TASKS.map((title, i) => ({
          company_id: emp.company_id, employee_id: emp.id, title,
          due_date: new Date(Date.now() + i * 86400000).toISOString().slice(0, 10),
        }))
      );
      await supabase.from("employees").update({ status: "onboarding" }).eq("id", emp.id);
    }
    setBusy(false); bump();
    // Tell the joiner their checklist is ready.
    notifyEmployee(emp.id, {
      kind: "onboarding_started",
      title: "Your onboarding checklist is ready",
      body: `${company?.name || "HR"} started your day-one checklist — ${DEFAULT_TASKS.length} tasks to complete before joining.`,
      email: {
        to: emp.email,
        subject: `Your onboarding checklist is ready — ${emp.name.split(" ")[0]}, welcome!`,
        html: `<p>Hi ${emp.name},</p><p>Your onboarding checklist is ready with <b>${DEFAULT_TASKS.length} tasks</b>. Open TeamSetu → Onboarding to work through it before your joining date (<b>${fmtDate(emp.joining_date)}</b>).</p>`,
      },
    });
  };

  return (
    <Panel title="Onboarding workspace" sub="Checklists, documents and day-one tasks">
      {list.length === 0 && <Empty icon={Icon.rocket} title="No one onboarding" text="Accepted offers appear here automatically." />}
      {list.map((e) => {
        const et = tasks.filter((t) => t.employee_id === e.id);
        const done = et.filter((t) => t.done).length;
        const pct = et.length ? Math.round((done / et.length) * 100) : 0;
        return (
          <div className="onb-card" key={e.id}>
            <div className="onb-head">
              <Avatar name={e.name} size={42} />
              <div className="grow"><b>{e.name}</b><small>{e.title} · {e.department} · joins {fmtDate(e.joining_date)}</small></div>
              <b className="pct">{pct}%</b>
            </div>
            <ProgressBar pct={pct} />
            {et.length === 0 ? (
              <button className="btn2 primary" disabled={busy} style={{ marginTop: 14 }} onClick={() => seedTasks(e)}>
                {busy ? "Creating…" : "Start onboarding checklist"}
              </button>
            ) : (
              <div style={{ marginTop: 12 }}><TaskList tasks={et} onToggle={toggle} /></div>
            )}
          </div>
        );
      })}
    </Panel>
  );
}

/* ================= ADMIN: offer letters ================= */
export function OfferLettersAdmin({ employees, offers, company, bump }) {
  const [view, setView] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", position: "", department: "Engineering", ctc: "", joining: "" });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const create = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Database not connected");
      const no = `TS/${new Date().getFullYear()}/${String(offers.length + 1).padStart(3, "0")}`;
      const { data: emp, error: eErr } = await supabase.from("employees").insert({
        company_id: company.id, name: form.name.trim(), email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(), department: form.department, title: form.position.trim(),
        joining_date: form.joining, status: "offered",
      }).select("id").single();
      if (eErr) throw eErr;
      const { error: oErr } = await supabase.from("offer_letters").insert({
        company_id: company.id, employee_id: emp.id, letter_no: no,
        position: form.position.trim(), department: form.department,
        ctc_annual: Number(form.ctc), joining_date: form.joining, status: "draft",
      });
      if (oErr) throw oErr;
      setForm({ name: "", email: "", phone: "", position: "", department: "Engineering", ctc: "", joining: "" });
      bump();
    } catch (err) { alert(err.message); }
    setBusy(false);
  };

  const setStatus = async (offer, status) => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.from("offer_letters").update({ status }).eq("id", offer.id);
    if (status === "accepted") {
      await supabase.from("employees").update({ status: "onboarding" }).eq("id", offer.employee_id);
    }
    setView(null); bump();
    // Notify the candidate — in-app bell + email (when configured).
    const cname = offer.employees?.name || "there";
    if (status === "sent" || status === "accepted") {
      notifyEmployee(offer.employee_id, {
        kind: status === "sent" ? "offer_sent" : "offer_accepted",
        title: status === "sent" ? "You have a new offer letter" : "Offer accepted — welcome aboard!",
        body: status === "sent"
          ? `${company?.name} sent you an offer for ${offer.position} (${inr(offer.ctc_annual)}/yr).`
          : `Your offer for ${offer.position} was accepted. Your onboarding checklist starts now.`,
        email: {
          to: offer.employees?.email,
          subject: status === "sent"
            ? `Offer letter from ${company?.name} — ${offer.position}`
            : `Welcome to ${company?.name}! Your offer was accepted`,
          html: `<p>Hi ${cname},</p>` + (status === "sent"
            ? `<p><b>${company?.name}</b> is pleased to offer you the position of <b>${offer.position}</b> (${offer.department}) with an annual CTC of <b>${inr(offer.ctc_annual)}</b>. Expected joining date: <b>${fmtDate(offer.joining_date)}</b>.</p>`
            : `<p>Your offer for <b>${offer.position}</b> has been accepted. We look forward to you joining on <b>${fmtDate(offer.joining_date)}</b>.</p>`),
        },
      });
    }
  };

  if (view) return <LetterView offer={view} company={company} onBack={() => setView(null)} onStatus={setStatus} />;

  return (
    <>
      <Panel title="Generate offer letter" sub="Creates the employee record and a printable letter">
        <form className="form2" onSubmit={create}>
          <label>Full name<input required value={form.name} onChange={set("name")} placeholder="Aarav Kapoor" /></label>
          <label>Email<input required type="email" value={form.email} onChange={set("email")} placeholder="aarav@example.com" /></label>
          <label>Phone<input value={form.phone} onChange={set("phone")} placeholder="+91…" /></label>
          <label>Position<input required value={form.position} onChange={set("position")} placeholder="Backend Developer" /></label>
          <label>Department
            <select value={form.department} onChange={set("department")}>
              {["Engineering", "Design", "Product", "Sales", "Marketing", "HR", "Finance", "Support"].map((d) => <option key={d}>{d}</option>)}
            </select>
          </label>
          <label>Annual CTC (₹)<input required type="number" min="1" value={form.ctc} onChange={set("ctc")} placeholder="1400000" /></label>
          <label>Joining date<input required type="date" value={form.joining} onChange={set("joining")} /></label>
          <div className="form2-full"><button className="btn2 primary" disabled={busy}>{busy ? "Creating…" : "Generate offer letter"}</button></div>
        </form>
      </Panel>
      <Panel title="All offer letters" sub={`${offers.length} total`}>
        {offers.length === 0 && <Empty icon={Icon.doc} title="No offers yet" text="Generate your first offer above." />}
        {offers.map((o) => (
          <button className="rowline as-btn" key={o.id} onClick={() => setView(o)}>
            <Avatar name={o.employees?.name || "?"} size={38} />
            <div className="grow"><b>{o.employees?.name}</b><small>{o.position} · {inr(o.ctc_annual)} / yr</small></div>
            <Pill tone={o.status === "draft" ? "amber" : o.status === "sent" ? "blue" : "green"}>{o.status}</Pill>
          </button>
        ))}
      </Panel>
    </>
  );
}

function LetterView({ offer, company, onBack, onStatus }) {
  const emp = offer.employees || {};
  return (
    <div>
      <div className="no-print" style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <button className="btn2" onClick={onBack}>← Back</button>
        <button className="btn2" onClick={() => window.print()}>Print / Save as PDF</button>
        {offer.status === "draft" && <button className="btn2 primary" onClick={() => onStatus(offer, "sent")}>Mark as sent</button>}
        {offer.status === "sent" && <button className="btn2 primary" onClick={() => onStatus(offer, "accepted")}>Mark as accepted</button>}
        <Pill tone={offer.status === "draft" ? "amber" : offer.status === "sent" ? "blue" : "green"}>{offer.status}</Pill>
      </div>
      <div className="letter">
        <div className="letter-head">
          <div><b>{company?.name}</b><br /><small>Offer of Employment</small></div>
          <div style={{ textAlign: "right" }}><small>Letter no.</small><br /><b>{offer.letter_no}</b></div>
        </div>
        <p>Date: {fmtDate(offer.created_at?.slice(0, 10))}</p>
        <p>Dear {emp.name},</p>
        <p>We are pleased to offer you the position of <b>{offer.position}</b> in our <b>{offer.department}</b> department at {company?.name}.</p>
        <p>Your annual cost to company will be <b>{inr(offer.ctc_annual)}</b>, and your expected date of joining is <b>{fmtDate(offer.joining_date)}</b>.</p>
        <p>This offer is subject to verification of your documents and references. Please confirm your acceptance by signing below.</p>
        <div className="letter-sign">
          <div><p>___________________</p><small>Authorised signatory, {company?.name}</small></div>
          <div><p>___________________</p><small>Candidate signature & date</small></div>
        </div>
      </div>
    </div>
  );
}
