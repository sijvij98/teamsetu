"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabase } from "../../lib/supabaseClient";
import { notifyAdmins, notifyEmployee } from "../../lib/notify";
import { Avatar, Pill, Panel, Empty, Icon, fmtDate } from "./ui";

/* ================= helpers ================= */
function localISO(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function fmtTime(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}
function dtLocal(ts) {
  if (!ts) return "";
  const d = new Date(ts), p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
function mins(a, b) {
  if (!a || !b) return 0;
  return Math.max(0, Math.round((new Date(b) - new Date(a)) / 60000));
}
function netMinutes(r) {
  if (!r?.clock_in) return 0;
  const end = r.clock_out || new Date().toISOString();
  return mins(r.clock_in, end) - mins(r.lunch_start, r.lunch_end) - mins(r.coffee_start, r.coffee_end);
}
function fmtDur(m) {
  const h = Math.floor(m / 60), mm = m % 60;
  return h ? `${h}h ${mm}m` : `${mm}m`;
}
function dayStatus(r) {
  if (!r || !r.clock_in) return "not-in";
  if (r.clock_out) return "done";
  if (r.coffee_start && !r.coffee_end) return "coffee";
  if (r.lunch_start && !r.lunch_end) return "lunch";
  return "working";
}
const STATUS_PILL = {
  "not-in": <Pill tone="muted">Not clocked in</Pill>,
  working: <Pill tone="ok">Working</Pill>,
  lunch: <Pill tone="warn">On lunch</Pill>,
  coffee: <Pill tone="info">Coffee break</Pill>,
  done: <Pill>Clocked out</Pill>,
};
const TICKET_PILL = {
  draft: <Pill tone="muted">Draft</Pill>,
  submitted: <Pill tone="warn">In review</Pill>,
  approved: <Pill tone="ok">Approved</Pill>,
  changes_requested: <Pill tone="info">Changes requested</Pill>,
};

/* ================= EMPLOYEE: time clock ================= */
export function TimeClock({ attendance, me, bump }) {
  const today = localISO();
  const row = attendance.find((a) => a.work_date === today && a.employee_id === me?.id);
  const [now, setNow] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setNow(new Date()); // set after mount so server HTML matches
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const status = dayStatus(row);

  const act = async (patch, insert = false) => {
    const supabase = getSupabase();
    if (!supabase || !me) return;
    setBusy(true); setMsg("");
    try {
      const nowIso = new Date().toISOString();
      if (insert) {
        const { error } = await supabase.from("attendance").insert({
          company_id: me.company_id, employee_id: me.id, work_date: today, ...patch,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("attendance")
          .update({ ...patch, updated_at: nowIso }).eq("id", row.id);
        if (error) throw error;
      }
      bump();
    } catch (err) { setMsg(err.message); }
    setBusy(false);
  };

  const clockIn = () => act({ clock_in: new Date().toISOString() }, true);
  const clockOut = () => {
    if (status === "lunch" || status === "coffee") { setMsg("Please end your break first, then clock out."); return; }
    act({ clock_out: new Date().toISOString() });
  };
  const startBreak = (kind) => act(kind === "lunch" ? { lunch_start: new Date().toISOString() } : { coffee_start: new Date().toISOString() });
  const endBreak = (kind) => act(kind === "lunch" ? { lunch_end: new Date().toISOString() } : { coffee_end: new Date().toISOString() });

  const events = [];
  if (row?.clock_in) events.push(["Clocked in", row.clock_in]);
  if (row?.lunch_start) events.push(["Lunch started", row.lunch_start]);
  if (row?.lunch_end) events.push(["Lunch ended", row.lunch_end]);
  if (row?.coffee_start) events.push(["Coffee break started", row.coffee_start]);
  if (row?.coffee_end) events.push(["Coffee break ended", row.coffee_end]);
  if (row?.clock_out) events.push(["Clocked out", row.clock_out]);
  events.sort((a, b) => new Date(a[1]) - new Date(b[1]));

  const week = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const iso = localISO(d);
      days.push({ iso, row: attendance.find((a) => a.work_date === iso && a.employee_id === me?.id) });
    }
    return days;
  }, [attendance, me]);

  return (
    <>
      <div className="grid-2">
        <Panel title="Today's clock" sub={fmtDate(today)}>
          <div className="clock-face">
            <div className="clock-time">{now ? now.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", second: "2-digit" }) : "–:–"}</div>
            <div className="clock-status">{STATUS_PILL[status]}</div>
          </div>
          <div className="btn-row wrap">
            {status === "not-in" && (
              <button className="btn btn-primary btn-lg" disabled={busy} onClick={clockIn}>Clock in</button>
            )}
            {status === "working" && (
              <>
                <button className="btn btn-lg" disabled={busy} onClick={() => startBreak("lunch")}>Start lunch</button>
                <button className="btn btn-lg" disabled={busy} onClick={() => startBreak("coffee")}>Coffee break</button>
                <button className="btn btn-primary btn-lg" disabled={busy} onClick={clockOut}>Clock out</button>
              </>
            )}
            {status === "lunch" && (
              <button className="btn btn-primary btn-lg" disabled={busy} onClick={() => endBreak("lunch")}>End lunch</button>
            )}
            {status === "coffee" && (
              <button className="btn btn-primary btn-lg" disabled={busy} onClick={() => endBreak("coffee")}>End coffee break</button>
            )}
            {status === "done" && (
              <div className="clock-done">Day complete — {fmtDur(netMinutes(row))} worked{row.note ? ` · Note: ${row.note}` : ""}</div>
            )}
          </div>
          {msg && <p className="form-msg">{msg}</p>}
        </Panel>

        <Panel title="Today's timeline" sub="Your check-ins and breaks">
          {events.length === 0
            ? <Empty icon={Icon.clock} title="Nothing yet" text="Clock in to start tracking your day." />
            : <ul className="timeline">
              {events.map(([label, ts], i) => (
                <li key={i}><span className="tl-dot" /><div><b>{label}</b><small>{fmtTime(ts)}</small></div></li>
              ))}
            </ul>}
        </Panel>
      </div>

      <Panel title="This week" sub="Your daily totals">
        <div className="tbl-wrap2"><table className="tbl2">
          <thead><tr><th>Day</th><th>Clock in</th><th>Clock out</th><th>Breaks</th><th>Worked</th></tr></thead>
          <tbody>
            {week.map(({ iso, row: r }) => (
              <tr key={iso}>
                <td><b>{iso === today ? "Today" : fmtDate(iso)}</b></td>
                <td>{fmtTime(r?.clock_in)}</td>
                <td>{fmtTime(r?.clock_out)}</td>
                <td>{fmtDur(mins(r?.lunch_start, r?.lunch_end) + mins(r?.coffee_start, r?.coffee_end))}</td>
                <td><b>{r?.clock_in ? fmtDur(netMinutes(r)) : "—"}</b></td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </Panel>
    </>
  );
}

/* ================= EMPLOYEE: daily work log ================= */
const blankTicket = { work_date: localISO(), project: "", title: "", details: "" };

export function WorkLog({ tickets, me, bump }) {
  const [form, setForm] = useState(blankTicket);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const mine = tickets.filter((t) => t.employee_id === me?.id)
    .sort((a, b) => (b.work_date || "").localeCompare(a.work_date || ""));

  const save = async (asSubmit) => {
    const supabase = getSupabase();
    if (!supabase || !me) return;
    if (!form.title.trim()) { setMsg("Please add a title for your log."); return; }
    setBusy(true); setMsg("");
    try {
      const payload = {
        company_id: me.company_id, employee_id: me.id,
        work_date: form.work_date || localISO(),
        project: form.project.trim(), title: form.title.trim(), details: form.details.trim(),
        status: asSubmit ? "submitted" : "draft",
      };
      if (editing) {
        const { error } = await supabase.from("daily_tickets").update(payload).eq("id", editing);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("daily_tickets").insert(payload);
        if (error) throw error;
      }
      setForm(blankTicket); setEditing(null);
      bump();
      if (asSubmit) {
        setMsg("Sent to your manager for review.");
        notifyAdmins({
          kind: "ticket_submitted",
          title: "New work log for review",
          body: `${me.name} submitted a work log for ${fmtDate(payload.work_date)} — “${payload.title}”`,
          email: {
            subject: `Work log for review — ${me.name}`,
            html: `<p><b>${me.name}</b> submitted a work log for <b>${fmtDate(payload.work_date)}</b>.</p><p><b>${payload.title}</b></p><p>${(payload.details || "").replace(/\n/g, "<br>")}</p><p>Open TeamSetu → Attendance → Work logs to review it.</p>`,
          },
        });
      } else setMsg(editing ? "Draft updated." : "Draft saved.");
    } catch (err) { setMsg(err.message); }
    setBusy(false);
  };

  const submitForReview = async (t) => {
    const supabase = getSupabase();
    if (!supabase) return;
    setBusy(true);
    await supabase.from("daily_tickets").update({ status: "submitted" }).eq("id", t.id);
    setBusy(false); bump();
    setMsg("Sent to your manager for review.");
    notifyAdmins({
      kind: "ticket_submitted",
      title: "New work log for review",
      body: `${me.name} submitted a work log for ${fmtDate(t.work_date)} — “${t.title}”`,
    });
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const editable = (t) => t.status === "draft" || t.status === "changes_requested";

  return (
    <>
      <Panel title={editing ? "Edit work log" : "New work log"} sub="Write what you did today, then send it to your manager">
        <div className="form-grid">
          <label>Date<input type="date" value={form.work_date} onChange={set("work_date")} /></label>
          <label>Project / client<input type="text" placeholder="e.g. Website redesign" value={form.project} onChange={set("project")} /></label>
        </div>
        <label className="full">Title<input type="text" placeholder="e.g. Finished the checkout page layout" value={form.title} onChange={set("title")} /></label>
        <label className="full">Details<textarea rows={4} placeholder="What did you do, what is done, what is left…" value={form.details} onChange={set("details")} /></label>
        <div className="btn-row">
          <button className="btn" disabled={busy} onClick={() => save(false)}>{editing ? "Save draft" : "Save as draft"}</button>
          <button className="btn btn-primary" disabled={busy} onClick={() => save(true)}>Send for review</button>
          {editing && <button className="btn btn-ghost" onClick={() => { setEditing(null); setForm(blankTicket); }}>Cancel</button>}
        </div>
        {msg && <p className="form-msg">{msg}</p>}
      </Panel>

      <Panel title="My work logs" sub="Your daily tickets and their review status">
        {mine.length === 0
          ? <Empty icon={Icon.doc} title="No logs yet" text="Write your first work log above and send it for review." />
          : <div className="ticket-list">
            {mine.map((t) => (
              <div className="ticket" key={t.id}>
                <div className="ticket-head">
                  <div><b>{t.title}</b><small>{fmtDate(t.work_date)}{t.project ? ` · ${t.project}` : ""}</small></div>
                  {TICKET_PILL[t.status]}
                </div>
                {t.details && <p className="ticket-body">{t.details}</p>}
                {t.status === "changes_requested" && t.reviewer_note && (
                  <p className="ticket-note"><b>Manager's note:</b> {t.reviewer_note}</p>
                )}
                {editable(t) && (
                  <div className="btn-row">
                    <button className="btn btn-sm" onClick={() => { setEditing(t.id); setForm({ work_date: t.work_date, project: t.project || "", title: t.title, details: t.details || "" }); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Edit</button>
                    <button className="btn btn-sm btn-primary" disabled={busy} onClick={() => submitForReview(t)}>Send for review</button>
                  </div>
                )}
              </div>
            ))}
          </div>}
      </Panel>
    </>
  );
}

/* ================= HR: attendance + work-log review ================= */
export function AttendanceAdmin({ attendance, tickets, employees, me, bump }) {
  const [sub, setSub] = useState("time");
  return (
    <>
      <div className="subtabs">
        <button className={sub === "time" ? "active" : ""} onClick={() => setSub("time")}>Time log</button>
        <button className={sub === "work" ? "active" : ""} onClick={() => setSub("work")}>
          Work logs{tickets.some((t) => t.status === "submitted") ? ` (${tickets.filter((t) => t.status === "submitted").length})` : ""}
        </button>
      </div>
      {sub === "time"
        ? <TimeLogAdmin attendance={attendance} employees={employees} bump={bump} />
        : <WorkLogReview tickets={tickets} employees={employees} bump={bump} />}
    </>
  );
}

function TimeLogAdmin({ attendance, employees, bump }) {
  const [date, setDate] = useState(localISO());
  const [editId, setEditId] = useState(null); // attendance id or "new:<employee_id>"
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [ef, setEf] = useState({});

  const active = employees.filter((e) => e.status === "active")
    .sort((a, b) => a.name.localeCompare(b.name));
  const rows = active.map((e) => ({
    emp: e,
    rec: attendance.find((a) => a.employee_id === e.id && a.work_date === date),
  }));

  const openEdit = (rec, emp) => {
    setEditId(rec ? rec.id : `new:${emp.id}`);
    setMsg("");
    setEf(rec ? {
      clock_in: dtLocal(rec.clock_in), clock_out: dtLocal(rec.clock_out),
      lunch_start: dtLocal(rec.lunch_start), lunch_end: dtLocal(rec.lunch_end),
      coffee_start: dtLocal(rec.coffee_start), coffee_end: dtLocal(rec.coffee_end),
      note: rec.note || "",
    } : { clock_in: "", clock_out: "", lunch_start: "", lunch_end: "", coffee_start: "", coffee_end: "", note: "" });
  };

  const saveEdit = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    setBusy(true); setMsg("");
    try {
      const iso = (v) => (v ? new Date(v).toISOString() : null);
      const payload = {
        clock_in: iso(ef.clock_in), clock_out: iso(ef.clock_out),
        lunch_start: iso(ef.lunch_start), lunch_end: iso(ef.lunch_end),
        coffee_start: iso(ef.coffee_start), coffee_end: iso(ef.coffee_end),
        note: ef.note.trim() || null,
        updated_at: new Date().toISOString(),
      };
      if (editId.startsWith("new:")) {
        const employee_id = editId.slice(4);
        const emp = employees.find((e) => e.id === employee_id);
        const { error } = await supabase.from("attendance").insert({
          company_id: emp.company_id, employee_id, work_date: date, ...payload,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("attendance").update(payload).eq("id", editId);
        if (error) throw error;
      }
      setEditId(null); bump();
    } catch (err) { setMsg(err.message); }
    setBusy(false);
  };

  const editingRow = editId
    ? rows.find((r) => (r.rec && r.rec.id === editId) || `new:${r.emp.id}` === editId)
    : null;
  // "9:00 am–5:00 pm", "1:00 pm →" while a break is still open, "—" when none.
  const span = (s, e) => (!s ? "—" : e ? `${fmtTime(s)}–${fmtTime(e)}` : `${fmtTime(s)} →`);

  return (
    <>
      <Panel title="Time log" sub="Who clocked in, breaks and hours — click edit to fix any entry"
        action={<input type="date" value={date} max={localISO()} onChange={(e) => setDate(e.target.value)} />}>
        <div className="tbl-wrap2"><table className="tbl2">
          <thead><tr><th>Employee</th><th>Status</th><th>Clock in</th><th>Lunch</th><th>Coffee</th><th>Clock out</th><th>Worked</th><th></th></tr></thead>
          <tbody>
            {rows.map(({ emp, rec }) => {
              const st = dayStatus(rec);
              return (
                <tr key={emp.id}>
                  <td><div className="cell-emp"><Avatar name={emp.name} size={30} /><b>{emp.name}</b></div></td>
                  <td>{STATUS_PILL[st]}</td>
                  <td>{fmtTime(rec?.clock_in)}</td>
                  <td>{span(rec?.lunch_start, rec?.lunch_end)}</td>
                  <td>{span(rec?.coffee_start, rec?.coffee_end)}</td>
                  <td>{fmtTime(rec?.clock_out)}</td>
                  <td><b>{rec?.clock_in ? fmtDur(netMinutes(rec)) : "—"}</b></td>
                  <td><button className="btn btn-sm" onClick={() => openEdit(rec, emp)}>{rec ? "Edit" : "Add"}</button></td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
      </Panel>

      {editId && editingRow && (
        <Panel title={`Edit time — ${editingRow.emp.name}`} sub={fmtDate(date)}
          action={<button className="btn btn-sm btn-ghost" onClick={() => setEditId(null)}>Close</button>}>
          <div className="form-grid">
            <label>Clock in<input type="datetime-local" value={ef.clock_in} onChange={(e) => setEf({ ...ef, clock_in: e.target.value })} /></label>
            <label>Clock out<input type="datetime-local" value={ef.clock_out} onChange={(e) => setEf({ ...ef, clock_out: e.target.value })} /></label>
            <label>Lunch start<input type="datetime-local" value={ef.lunch_start} onChange={(e) => setEf({ ...ef, lunch_start: e.target.value })} /></label>
            <label>Lunch end<input type="datetime-local" value={ef.lunch_end} onChange={(e) => setEf({ ...ef, lunch_end: e.target.value })} /></label>
            <label>Coffee start<input type="datetime-local" value={ef.coffee_start} onChange={(e) => setEf({ ...ef, coffee_start: e.target.value })} /></label>
            <label>Coffee end<input type="datetime-local" value={ef.coffee_end} onChange={(e) => setEf({ ...ef, coffee_end: e.target.value })} /></label>
          </div>
          <label className="full">Note (optional)<input type="text" placeholder="e.g. Forgot to clock out — fixed by HR" value={ef.note} onChange={(e) => setEf({ ...ef, note: e.target.value })} /></label>
          <div className="btn-row">
            <button className="btn btn-primary" disabled={busy} onClick={saveEdit}>Save changes</button>
            <button className="btn btn-ghost" onClick={() => setEditId(null)}>Cancel</button>
          </div>
          {msg && <p className="form-msg">{msg}</p>}
        </Panel>
      )}
    </>
  );
}

function WorkLogReview({ tickets, employees, bump }) {
  const [filter, setFilter] = useState("review");
  const [note, setNote] = useState({});
  const [busy, setBusy] = useState(false);

  const byId = Object.fromEntries(employees.map((e) => [e.id, e]));
  const list = tickets
    .filter((t) => (filter === "review" ? t.status === "submitted" : filter === "approved" ? t.status === "approved" : true))
    .sort((a, b) => (b.work_date || "").localeCompare(a.work_date || ""));

  const review = async (t, status) => {
    const supabase = getSupabase();
    if (!supabase) return;
    if (status === "changes_requested" && !(note[t.id] || "").trim()) return;
    setBusy(true);
    await supabase.from("daily_tickets").update({
      status,
      reviewer_note: status === "changes_requested" ? note[t.id].trim() : null,
      updated_at: new Date().toISOString(),
    }).eq("id", t.id);
    setBusy(false); bump();
    const emp = byId[t.employee_id];
    notifyEmployee(t.employee_id, {
      kind: status === "approved" ? "ticket_approved" : "ticket_changes",
      title: status === "approved" ? "Work log approved" : "Work log needs changes",
      body: status === "approved"
        ? `Your work log for ${fmtDate(t.work_date)} — “${t.title}” — was approved.`
        : `Your manager asked for changes on your work log for ${fmtDate(t.work_date)}: “${note[t.id].trim()}”`,
      email: emp?.email,
    });
  };

  return (
    <Panel title="Work logs" sub="Daily tickets your team sent for review">
      <div className="chip-row">
        {[["review", "Needs review"], ["approved", "Approved"], ["all", "All"]].map(([v, l]) => (
          <button key={v} className={`chip${filter === v ? " on" : ""}`} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>
      {list.length === 0
        ? <Empty icon={Icon.doc} title="Nothing here" text={filter === "review" ? "No work logs waiting for review." : "No work logs found."} />
        : <div className="ticket-list">
          {list.map((t) => {
            const emp = byId[t.employee_id];
            return (
              <div className="ticket" key={t.id}>
                <div className="ticket-head">
                  <div className="cell-emp"><Avatar name={emp?.name} size={32} />
                    <div><b>{t.title}</b><small>{emp?.name} · {fmtDate(t.work_date)}{t.project ? ` · ${t.project}` : ""}</small></div>
                  </div>
                  {TICKET_PILL[t.status]}
                </div>
                {t.details && <p className="ticket-body">{t.details}</p>}
                {t.status === "submitted" && (
                  <>
                    <textarea rows={2} placeholder="Note for the employee (needed if you ask for changes)…"
                      value={note[t.id] || ""} onChange={(e) => setNote({ ...note, [t.id]: e.target.value })} />
                    <div className="btn-row">
                      <button className="btn btn-sm btn-primary" disabled={busy} onClick={() => review(t, "approved")}>Approve</button>
                      <button className="btn btn-sm" disabled={busy || !(note[t.id] || "").trim()} onClick={() => review(t, "changes_requested")}>Ask for changes</button>
                    </div>
                  </>
                )}
                {t.status === "changes_requested" && t.reviewer_note && (
                  <p className="ticket-note"><b>Your note:</b> {t.reviewer_note}</p>
                )}
              </div>
            );
          })}
        </div>}
    </Panel>
  );
}
