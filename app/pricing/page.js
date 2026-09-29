"use client";

import { useState } from "react";
import Link from "next/link";

const PLANS = [
  {
    name: "Essentials",
    desc: "For small teams getting organized.",
    monthly: 299, annual: 249,
    cta: "Start free trial",
    feats: ["Up to 50 employees", "Employee database & org chart", "Time-off tracking", "Onboarding checklists", "Mobile app", "Email support"],
  },
  {
    name: "Growth",
    desc: "For scaling companies that need more.",
    monthly: 449, annual: 399,
    cta: "Start free trial", hot: true,
    feats: ["Everything in Essentials", "Performance reviews & goals", "Hiring pipeline (ATS)", "E-signatures", "Custom reports", "Dedicated success manager", "Priority support"],
  },
  {
    name: "Enterprise",
    desc: "For large orgs with complex needs.",
    monthly: null, annual: null,
    cta: "Talk to sales",
    feats: ["Everything in Growth", "SSO / SAML & SCIM", "Custom data retention", "Advanced permissions", "API access", "99.9% uptime SLA", "Onboarding concierge"],
  },
];

const ROWS = [
  ["Employee database", true, true, true],
  ["Time-off tracking", true, true, true],
  ["Onboarding", true, true, true],
  ["Performance reviews", false, true, true],
  ["Hiring pipeline", false, true, true],
  ["E-signatures", false, true, true],
  ["Custom reports", false, true, true],
  ["SSO / SAML", false, false, true],
  ["API access", false, false, true],
  ["Dedicated success manager", false, true, true],
];

export default function Pricing() {
  const [annual, setAnnual] = useState(true);

  return (
    <>
      <section className="hero" style={{ paddingBottom: 40 }}>
        <div className="container center">
          <span className="eyebrow">Pricing</span>
          <h1 className="h1">Simple pricing that scales with you</h1>
          <p className="lead" style={{ margin: "0 auto" }}>
            Per employee, per month. No setup fees, no hidden costs. Switch plans or cancel anytime.
          </p>
          <div className="toggle">
            <button className={annual ? "on" : ""} onClick={() => setAnnual(true)}>Annual — save 17%</button>
            <button className={!annual ? "on" : ""} onClick={() => setAnnual(false)}>Monthly</button>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 10 }}>
        <div className="container">
          <div className="price-grid">
            {PLANS.map((p) => (
              <div className={`price-card ${p.hot ? "hot" : ""}`} key={p.name}>
                {p.hot && <span className="price-flag">MOST POPULAR</span>}
                <h3>{p.name}</h3>
                <p className="pdesc">{p.desc}</p>
                {p.monthly ? (
                  <div className="amount">₹{annual ? p.annual : p.monthly}<small> /employee/month{annual ? ", billed annually" : ", billed monthly"}</small></div>
                ) : (
                  <div className="amount">Custom<small> — let's talk</small></div>
                )}
                <ul>{p.feats.map((f) => <li key={f}>{f}</li>)}</ul>
                <Link href="/signup" className={`btn ${p.hot ? "btn-primary" : "btn-ghost"}`} style={{ width: "100%" }}>{p.cta}</Link>
              </div>
            ))}
          </div>

          <div className="center" style={{ marginTop: 64 }}>
            <h2 className="h2">Compare plans</h2>
          </div>
          <div className="compare-scroll" style={{ marginTop: 24 }}>
            <table className="tbl2">
              <thead><tr><th>Feature</th><th>Essentials</th><th>Growth</th><th>Enterprise</th></tr></thead>
              <tbody>
                {ROWS.map(([f, a, b, c]) => (
                  <tr key={f}>
                    <td style={{ fontWeight: 600 }}>{f}</td>
                    {[a, b, c].map((v, i) => (
                      <td key={i} style={{ color: v ? "var(--green-700)" : "var(--muted)", fontWeight: 700 }}>
                        {v ? "✓" : "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="faq">
            <details><summary>Is there really a free trial?</summary><p>Yes — 14 days on the Growth plan, no credit card required. If you do nothing, the trial simply ends. No surprise charges, ever.</p></details>
            <details><summary>What counts as an "employee" for billing?</summary><p>Anyone with an active profile in TeamSetu. Contractors on limited-access profiles are free.</p></details>
            <details><summary>Can I switch plans later?</summary><p>Anytime. Upgrades apply instantly; downgrades take effect at your next billing cycle.</p></details>
            <details><summary>Do you offer discounts for NGOs or startups?</summary><p>Yes — 50% off for registered nonprofits and 30% off for startups under 2 years old on annual plans. Talk to sales.</p></details>
          </div>
        </div>
      </section>
    </>
  );
}
