"use client";

import { useMemo, useState } from "react";
import { getSupabase } from "../../lib/supabaseClient";
import { notifyAdmins } from "../../lib/notify";
import { useAuth } from "../AuthProvider";
import {
  Avatar, Pill, Panel, Empty, ProgressBar, Ring,
  Icon, fmtDate, todayISO, daysBetween, greeting,
} from "./ui";
import { TaskList } from "./views-admin";

/* Leave allowances per year */
const ALLOWANCE = { "Annual leave": 12, "Sick leave": 6, "Casual leave": 6 };

function usedDays(leaves, type) {
  const year = todayISO().slice(0, 4);
  return leaves
    .filter((l) => l.status === "approved" && l.leave_type === type && l.from_date?.startsWith(year))
    .reduce((s, l) => s + daysBetween(l.from_date, l.to_date), 0);
}

/* ================= EMPLOYEE: home ================= */
export function EmployeeHome({ employees, leaves, tasks, me, bump, go }) {
  const myLeaves = leaves.filter((l) => l.employee_id === me?.id);
  const myTasks = tasks.filter((t) => t.employee_id === me?.id);
  const done = myTasks.filter((t) => t.done).length;
  const onbPct = myTasks.length ? Math.round((done / myTasks.length) * 100) : 0;
  const pendingMine = myLeaves.filter((l) => l.status === "pending").length;

  const team = useMemo(() => {
    if (!me) return [];
    return employees.filter((e) => e.id !== me.id && e.department === me.department && e.status === "active").slice(0, 5);
  }, [employees, me]);

  const toggle = async (t) => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.from("onboarding_tasks").update({ done: !t.done }).eq("id", t.id);
    bump();
  };

  return (
    <>
      {/* my leave snapshot */}
      <div className="grid-3">
        {Object.entries(ALLOWANCE).map(([type, total]) => {
          const used = usedDays(myLeaves, type);
          const left = Math.max(0, total - used);
          return (
            <div className="kpi2" key={type}>
              <div className="kpi2-tx"><small>{type}</small><b>{left} <span className="unit">days left</span></b><span>{used} of {total} used this year</span></div>
              <Ring pct={(left / total) * 100} size={72} />
            </div>
          );
        })}
      </div>

      <div className="grid-2">
        <Panel title="My requests" sub="Your recent time-off requests"
          action={<button className="btn2 primary sm" onClick={() => go("leave")}>{Icon.plus} Apply leave</button>}>
          {myLeaves.length === 0 && <Empty icon={Icon.calendar} title="No requests yet" text="Apply for leave and track it here." />}
          {myLeaves.slice(0, 4).map((l) => (
            <div className="rowline" key={l.id}>
              <div className="grow"><b>{l.leave_type}</b><small>{fmtDate(l.from_date)} → {fmtDate(l.to_date)} ({daysBetween(l.from_date, l.to_date)}d){l.reason ? ` · “${l.reason}”` : ""}</small></div>
              <Pill tone={l.status === "approved" ? "green" : l.status === "pending" ? "amber" : "red"}>{l.status}</Pill>
            </div>
          ))}
          {pendingMine > 0 && <p className="hint">{pendingMine} request{pendingMine > 1 ? "s" : ""} waiting for approval</p>}
        </Panel>

        <Panel title="My onboarding" sub={myTasks.length ? `${done} of ${myTasks.length} done` : "Your day-one checklist"}>
          {myTasks.length === 0 && <Empty icon={Icon.rocket} title="Nothing here" text="Your onboarding checklist will appear when HR starts it." />}
          {myTasks.length > 0 && (<><ProgressBar pct={onbPct} /><div style={{ marginTop: 12 }}><TaskList tasks={myTasks} onToggle={toggle} /></div></>)}
        </Panel>
      </div>

      <Panel title="My team" sub={me ? `${me.department} · ${team.length} teammates` : "Your teammates"}>
        <div className="teamrow">
          {team.map((e) => (
            <div className="teammate" key={e.id}><Avatar name={e.name} size={46} /><b>{e.name.split(" ")[0]}</b><small>{e.title}</small></div>
          ))}
          {team.length === 0 && <Empty title="No teammates found" />}
        </div>
      </Panel>
    </>
  );
}

/* ================= EMPLOYEE: my leave ================= */
export function MyLeave({ leaves, me, company, bump }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ type: "Casual leave", from: "", to: "", reason: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const myLeaves = leaves.filter((l) => l.employee_id === me?.id);

  const apply = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!me) { setMsg("We couldn't find your employee record. Ask HR to link your login."); return; }
    if (form.to < form.from) { setMsg("End date can't be before start date."); return; }
    setBusy(true);
    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Database not connected");
      const { error } = await supabase.from("leave_requests").insert({
        company_id: company?.id || me.company_id,
        employee_id: me.id,
        leave_type: form.type,
        from_date: form.from,
        to_date: form.to,
        reason: form.reason.trim(),
        status: "pending",
      });
      if (error) throw error;
      setForm({ type: "Casual leave", from: "", to: "", reason: "" });
      setMsg("Request sent! HR will review it shortly.");
      bump();
      // Notify HR/admins — in-app bell + email (when email sending is configured).
      notifyAdmins({
        kind: "leave_request",
        title: "New leave request",
        body: `${me.name} requested ${form.type} (${fmtDate(form.from)} → ${fmtDate(form.to)})${form.reason.trim() ? ` — “${form.reason.trim()}”` : ""}`,
        email: {
          subject: `New leave request from ${me.name} — ${form.type}`,
          html: `<p><b>${me.name}</b> has requested <b>${form.type}</b> from <b>${fmtDate(form.from)}</b> to <b>${fmtDate(form.to)}</b>.</p>${form.reason.trim() ? `<p>Reason: ${form.reason.trim()}</p>` : ""}<p>Open TeamSetu → Time Off to approve or decline.</p>`,
        },
      });
    } catch (err) { setMsg(err.message); }
    setBusy(false);
  };

  return (
    <>
      <div className="grid-3">
        {Object.entries(ALLOWANCE).map(([type, total]) => {
          const used = usedDays(myLeaves, type);
          const left = Math.max(0, total - used);
          return (
            <div className="kpi2" key={type}>
              <div className="kpi2-tx"><small>{type}</small><b>{left} <span className="unit">days left</span></b></div>
              <ProgressBar pct={(left / total) * 100} />
            </div>
          );
        })}
      </div>

      <div className="grid-2">
        <Panel title="Apply for leave" sub="Sends a request to HR for approval">
          <form className="form2" onSubmit={apply}>
            <label>Leave type
              <select value={form.type} onChange={set("type")}>
                <option>Casual leave</option><option>Sick leave</option><option>Annual leave</option><option>Work from home</option>
              </select>
            </label>
            <label>From<input required type="date" value={form.from} onChange={set("from")} min={todayISO()} /></label>
            <label>To<input required type="date" value={form.to} onChange={set("to")} min={form.from || todayISO()} /></label>
            <label className="form2-full">Reason (optional)<input value={form.reason} onChange={set("reason")} placeholder="e.g. Family function" /></label>
            <div className="form2-full"><button className="btn2 primary" disabled={busy}>{busy ? "Sending…" : "Send request"}</button></div>
          </form>
          {msg && <p className="hint" style={{ marginTop: 12 }}>{msg}</p>}
        </Panel>

        <Panel title="My history" sub={`${myLeaves.length} requests`}>
          {myLeaves.length === 0 && <Empty icon={Icon.calendar} title="No requests yet" text="Your leave history will show here." />}
          {myLeaves.map((l) => (
            <div className="rowline" key={l.id}>
              <div className="grow"><b>{l.leave_type}</b><small>{fmtDate(l.from_date)} → {fmtDate(l.to_date)} ({daysBetween(l.from_date, l.to_date)}d){l.reason ? ` · “${l.reason}”` : ""}</small></div>
              <Pill tone={l.status === "approved" ? "green" : l.status === "pending" ? "amber" : "red"}>{l.status}</Pill>
            </div>
          ))}
        </Panel>
      </div>
    </>
  );
}

/* ================= EMPLOYEE: my onboarding ================= */
export function MyOnboarding({ tasks, me, bump }) {
  const myTasks = tasks.filter((t) => t.employee_id === me?.id);
  const done = myTasks.filter((t) => t.done).length;
  const pct = myTasks.length ? Math.round((done / myTasks.length) * 100) : 0;

  const toggle = async (t) => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.from("onboarding_tasks").update({ done: !t.done }).eq("id", t.id);
    bump();
  };

  return (
    <Panel title="My onboarding checklist" sub={myTasks.length ? `${done} of ${myTasks.length} complete — ${pct}%` : "Your day-one tasks"}>
      {myTasks.length === 0 && <Empty icon={Icon.rocket} title="Checklist not started yet" text="HR will start your onboarding checklist soon. Meanwhile, say hello to your buddy!" />}
      {myTasks.length > 0 && (<><ProgressBar pct={pct} /><div style={{ marginTop: 14 }}><TaskList tasks={myTasks} onToggle={toggle} /></div></>)}
    </Panel>
  );
}
