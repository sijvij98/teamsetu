"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "../../lib/supabaseClient";

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", company: "", size: "11–50" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const supabase = getSupabase();
      // 1. Create the login
      const { data, error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
      });
      if (error) throw error;
      const uid = data.user?.id;
      if (!uid) throw new Error("Could not create your account. Please try again.");

      // 2. Create the company workspace
      const { data: co, error: coErr } = await supabase
        .from("companies")
        .insert({ name: form.company.trim(), plan: "growth" })
        .select("id")
        .single();
      if (coErr) throw coErr;

      // 3. Link this login as the workspace admin
      const { error: pErr } = await supabase.from("profiles").insert({
        id: uid,
        company_id: co.id,
        role: "admin",
      });
      if (pErr) throw pErr;

      // 4. Add the admin to the employee directory too
      await supabase.from("employees").insert({
        company_id: co.id,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        department: "People",
        title: "Administrator",
        status: "active",
      });

      router.push("/dashboard");
      router.refresh();
    } catch (ex) {
      setErr(ex.message || "Signup failed. Please try again.");
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-side">
        <Link href="/" className="brand" style={{ color: "#fff", marginBottom: 40 }}>
          <span className="brand-mark" style={{ background: "#fff", color: "#047857" }}>TS</span> TeamSetu
        </Link>
        <h2>Your 14-day free trial starts here</h2>
        <p>Join 2,000+ companies running people operations on TeamSetu.</p>
        <ul>
          <li><span className="tick" style={{ background: "rgba(255,255,255,.2)", color: "#fff" }}>✓</span> Full Growth plan — no credit card required</li>
          <li><span className="tick" style={{ background: "rgba(255,255,255,.2)", color: "#fff" }}>✓</span> Your own secure company workspace</li>
          <li><span className="tick" style={{ background: "rgba(255,255,255,.2)", color: "#fff" }}>✓</span> Live onboarding help from HR experts</li>
        </ul>
      </div>
      <div className="auth-form-col">
        <form className="auth-card" onSubmit={submit}>
          <h1>Create your workspace</h1>
          <p>Set up in minutes. Invite your team when ready.</p>
          {err && <p style={{ color: "#b91c1c", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", fontSize: 14 }}>{err}</p>}
          <div className="field">
            <label>Full name</label>
            <input required placeholder="Priya Sharma" value={form.name} onChange={set("name")} />
          </div>
          <div className="field">
            <label>Work email</label>
            <input required type="email" placeholder="priya@company.com" value={form.email} onChange={set("email")} />
          </div>
          <div className="field">
            <label>Password</label>
            <input required type="password" minLength={8} placeholder="Minimum 8 characters" value={form.password} onChange={set("password")} />
          </div>
          <div className="field">
            <label>Company name</label>
            <input required placeholder="Acme Pvt. Ltd." value={form.company} onChange={set("company")} />
          </div>
          <div className="field">
            <label>Company size</label>
            <select value={form.size} onChange={set("size")}>
              <option>1–10</option><option>11–50</option><option>51–200</option><option>201–500</option><option>500+</option>
            </select>
          </div>
          <button className="btn btn-primary" style={{ width: "100%" }} type="submit" disabled={busy}>
            {busy ? "Creating workspace…" : "Start free trial →"}
          </button>
          <p className="micro center">By signing up you agree to our Terms and Privacy Policy.</p>
          <p className="auth-alt">Already have an account? <Link href="/login">Log in</Link></p>
        </form>
      </div>
    </div>
  );
}
