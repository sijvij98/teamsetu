"use client";
// Notification helpers — fire-and-forget. A notification failure must
// never break the main flow (leave apply, approve, offer status, ...).
import { getSupabase } from "./supabaseClient";

async function post(payload) {
  try {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await fetch("/api/notify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    /* notifications are best-effort */
  }
}

/** Notify one employee (in-app bell + email if configured). */
export function notifyEmployee(employeeId, { kind, title, body, email }) {
  return post({ to_employee_ids: [employeeId], kind, title, body, email });
}

/** Notify every HR/admin of the company.
 *  email: { subject, html } — recipients are resolved automatically. */
export async function notifyAdmins({ kind, title, body, email }) {
  const supabase = getSupabase();
  if (!supabase) return;
  const { data } = await supabase
    .from("profiles")
    .select("employee_id, employees(email, name)")
    .in("role", ["admin", "hr"]);
  const ids = (data || []).map((p) => p.employee_id).filter(Boolean);
  if (!ids.length) return;
  const to = (data || [])
    .map((p) => p.employees?.email)
    .filter((e) => typeof e === "string" && e.includes("@"));
  return post({
    to_employee_ids: ids,
    kind,
    title,
    body,
    email: email ? { ...email, to } : undefined,
  });
}
