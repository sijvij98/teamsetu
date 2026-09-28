"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e) => {
    e.preventDefault();
    try { localStorage.setItem("teamsetu_user", JSON.stringify({ email, name: "Demo User", company: "Acme Pvt. Ltd." })); } catch {}
    router.push("/dashboard");
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
          <li><span className="tick" style={{ background: "rgba(255,255,255,.2)", color: "#fff" }}>✓</span> Bank-grade encryption on all data</li>
          <li><span className="tick" style={{ background: "rgba(255,255,255,.2)", color: "#fff" }}>✓</span> SSO available on Growth & Enterprise</li>
        </ul>
      </div>
      <div className="auth-form-col">
        <form className="auth-card" onSubmit={submit}>
          <h1>Log in to TeamSetu</h1>
          <p>Demo build — any email works.</p>
          <div className="field">
            <label>Work email</label>
            <input required type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Password</label>
            <input required type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn btn-primary" style={{ width: "100%" }} type="submit">Log in →</button>
          <p className="auth-alt">New to TeamSetu? <Link href="/signup">Start free trial</Link></p>
        </form>
      </div>
    </div>
  );
}
