"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", company: "", size: "11–50" });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    try { localStorage.setItem("teamsetu_user", JSON.stringify(form)); } catch {}
    router.push("/dashboard");
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
          <li><span className="tick" style={{ background: "rgba(255,255,255,.2)", color: "#fff" }}>✓</span> Free data import from spreadsheets</li>
          <li><span className="tick" style={{ background: "rgba(255,255,255,.2)", color: "#fff" }}>✓</span> Live onboarding help from HR experts</li>
        </ul>
      </div>
      <div className="auth-form-col">
        <form className="auth-card" onSubmit={submit}>
          <h1>Create your workspace</h1>
          <p>Set up in minutes. Invite your team when ready.</p>
          <div className="field">
            <label>Full name</label>
            <input required placeholder="Priya Sharma" value={form.name} onChange={set("name")} />
          </div>
          <div className="field">
            <label>Work email</label>
            <input required type="email" placeholder="priya@company.com" value={form.email} onChange={set("email")} />
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
          <button className="btn btn-primary" style={{ width: "100%" }} type="submit">Start free trial →</button>
          <p className="micro center">By signing up you agree to our Terms and Privacy Policy.</p>
          <p className="auth-alt">Already have an account? <Link href="/login">Log in</Link></p>
        </form>
      </div>
    </div>
  );
}
