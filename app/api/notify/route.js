import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/notify
 * Body: { to_employee_ids: string[], kind, title, body, email?: { to: string|string[], subject, html } }
 *
 * 1. Verifies the caller's session (Bearer token) and resolves their company.
 * 2. Inserts one in-app notification row per recipient employee.
 * 3. If RESEND_API_KEY is set and an email payload is provided, sends a real
 *    email via Resend (free tier: 100 emails/day, no card needed).
 */
export async function POST(req) {
  try {
    const { to_employee_ids, kind, title, body, email } = await req.json();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const token = (req.headers.get("authorization") || "").replace(/^Bearer /i, "");
    if (!url || !anon || !token || !Array.isArray(to_employee_ids) || !to_employee_ids.length) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const sb = createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ ok: false }, { status: 401 });

    const { data: profile } = await sb
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();
    if (!profile?.company_id) return NextResponse.json({ ok: false }, { status: 403 });

    // In-app notifications (RLS: insert allowed within own company).
    await sb.from("notifications").insert(
      to_employee_ids.map((employee_id) => ({
        company_id: profile.company_id,
        employee_id,
        kind: kind || "info",
        title: title || "Notification",
        body: body || "",
      }))
    );

    // Real email via Resend — only when the key is configured.
    const resendKey = process.env.RESEND_API_KEY;
    if (email?.to && resendKey) {
      const to = Array.isArray(email.to) ? email.to : [email.to];
      const clean = to.filter((t) => typeof t === "string" && t.includes("@"));
      if (clean.length) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.NOTIFY_FROM || "TeamSetu <notifications@teamsetu.app>",
            to: clean,
            subject: email.subject || title,
            html: email.html || `<p>${body || ""}</p>`,
          }),
        }).catch(() => {});
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
