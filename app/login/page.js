"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "../../lib/supabaseClient";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      router.push("/dashboard");
      router.refresh();
    } catch (ex) {
      setErr(ex.message || "Login failed. Please check your details and try again.");
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-side">
        <Link href="/" className="brand" style={{ color: "#fff", marginBottom: 40 }}>
          <span className="brand-mark" style={{ background: "#fff", color: "#047857" }}>TS</span> TeamSetu
        </Link>
        <h2>Welcome back</h2>
        <p>Your team, your data, your HR — all in one calm place.</p>
        <ul>
          <li><span className="tick" style={{ background: "rgba(255,255,255,.2)", color: "#fff" }}>✓</span> Passwords encrypted with bcrypt</li>
          <li><span className="tick" style={{ background: "rgba(255,255,255,.2)", color: "#fff" }}>✓</span> Your company data is fully isolated</li>
        </ul>
      </div>
      <div className="auth-form-col">
        <form className="auth-card" onSubmit={submit}>
          <h1>Log in to TeamSetu</h1>
          <p>Use the email and password for your workspace.</p>
          {err && <p style={{ color: "#b91c1c", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", fontSize: 14 }}>{err}</p>}
          <div className="field">
            <label>Work email</label>
            <input required type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Password</label>
            <input required type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn btn-primary" style={{ width: "100%" }} type="submit" disabled={busy}>
            {busy ? "Logging in…" : "Log in →"}
          </button>
          <p className="auth-alt">New to TeamSetu? <Link href="/signup">Start free trial</Link></p>
        </form>
      </div>
    </div>
  );
}
