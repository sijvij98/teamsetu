import Link from "next/link";

const FEATURES = [
  { ico: "👥", t: "Employee database", d: "One searchable home for every employee record — personal details, documents, job history, and reporting lines." },
  { ico: "🌴", t: "Time-off tracking", d: "Requests, approvals, and balances in one calm workflow. No more spreadsheets or lost leave emails." },
  { ico: "🚀", t: "Onboarding", d: "Welcome new hires with automated checklists, e-signatures, and day-one-ready task lists." },
  { ico: "📈", t: "Performance reviews", d: "Goals, 1-on-1s, and review cycles that managers actually complete — without chasing." },
  { ico: "💰", t: "Payroll-ready reports", d: "Attendance, leaves, and reimbursements flow into clean reports your payroll team will love." },
  { ico: "✍️", t: "E-signatures", d: "Offer letters, policies, and appraisals signed digitally, stored automatically, audit-ready." },
];

const TESTIMONIALS = [
  { q: "We replaced four tools with TeamSetu. Onboarding that took two weeks now takes two days — and new hires keep telling us how smooth it feels.", n: "Priya Nair", r: "Head of People, Craftly (180 employees)", c: "#0ea5e9" },
  { q: "Leave approvals used to live in a WhatsApp group. Now the whole company can see balances and plan better. Managers save hours every month.", n: "Rohan Mehta", r: "Founder, FinEdge (65 employees)", c: "#8b5cf6" },
  { q: "Performance review season went from dreaded to done. 94% completion in the first cycle, and the reports basically wrote themselves.", n: "Ananya Das", r: "HR Lead, Mediora (240 employees)", c: "#f59e0b" },
];

const FAQS = [
  { q: "How long does setup take?", a: "Most companies are live in under a week. Import your employee data from a spreadsheet, invite your team, and you're running. Our onboarding team helps free on Growth plans and above." },
  { q: "Is my employee data safe?", a: "Yes. Data is encrypted in transit and at rest, hosted in ISO 27001-certified data centers, with role-based access so managers only see their own teams." },
  { q: "Can I migrate from spreadsheets or another HR tool?", a: "Absolutely. Our free importer handles CSV/Excel, and we support migration from popular HR tools. Most migrations finish in 2–3 days." },
  { q: "Do you offer a free trial?", a: "Yes — 14 days, no credit card required. You get the full Growth plan during the trial so you can test everything." },
  { q: "What kind of support do you provide?", a: "Live chat and email support on all plans (under 2-hour response in business hours), plus a dedicated success manager on Growth and Enterprise." },
];

function MockDashboard() {
  const bars = [42, 65, 50, 78, 60, 90, 72];
  return (
    <div className="mock">
      <div className="mock-bar"><i /><i /><i /></div>
      <div className="mock-body">
        <div className="mock-side">
          <span className="on" /><span /><span /><span /><span /><span /><span />
        </div>
        <div className="mock-main">
          <div className="mock-cards">
            <div className="mock-card"><b>248</b><small>Employees</small></div>
            <div className="mock-card"><b>18</b><small>On leave today</small></div>
            <div className="mock-card"><b>96%</b><small>Review completion</small></div>
          </div>
          <div className="mock-chart">
            {bars.map((h, i) => <i key={i} style={{ height: h + "%" }} />)}
          </div>
          <div className="mock-row"><span className="avatar" style={{ background: "#0ea5e9" }}>AS</span> Aarav Sharma · Engineering <span className="pill">Active</span></div>
          <div className="mock-row"><span className="avatar" style={{ background: "#8b5cf6" }}>DP</span> Diya Patel · Design <span className="pill warn">On leave</span></div>
          <div className="mock-row"><span className="avatar" style={{ background: "#f59e0b" }}>RM</span> Rohan Mehta · Sales <span className="pill">Active</span></div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="hero-badge"><span className="dot" /> New: Performance reviews 2.0 is here</div>
            <h1 className="h1">HR software your whole team will actually love</h1>
            <p className="lead">
              TeamSetu brings hiring, onboarding, time off, and performance into one simple platform —
              so you spend less time on paperwork and more time on people.
            </p>
            <div className="cta-row">
              <Link href="/signup" className="btn btn-primary btn-lg">Start free trial</Link>
              <Link href="/pricing" className="btn btn-ghost btn-lg">See pricing</Link>
            </div>
            <p className="micro">Free 14-day trial · No credit card required · Cancel anytime</p>
          </div>
          <MockDashboard />
        </div>
        <div className="container">
          <div className="logos">
            <span>NORTHPEAK</span><span>Brightline</span><span>CRAFTLY</span><span>Mediora</span><span>FINEDGE</span><span>loopwork</span>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="section" style={{ paddingTop: 40 }}>
        <div className="container">
          <div className="stats-band">
            <div className="stat"><b><em>2,000</em>+</b><span>companies run on TeamSetu</span></div>
            <div className="stat"><b><em>4.8</em>/5</b><span>average customer rating</span></div>
            <div className="stat"><b><em>98</em>%</b><span>customers renew every year</span></div>
            <div className="stat"><b><em>12</em> hrs</b><span>saved per HR team, weekly</span></div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section section-soft" id="features">
        <div className="container">
          <div className="center">
            <span className="eyebrow">Everything in one place</span>
            <h2 className="h2">One platform for the entire employee journey</h2>
            <p className="lead">From the offer letter to the farewell — stop juggling five tools and three spreadsheets.</p>
          </div>
          <div className="grid-3">
            {FEATURES.map((f) => (
              <div className="feat" key={f.t}>
                <div className="feat-ico">{f.ico}</div>
                <h3>{f.t}</h3>
                <p>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPLIT: onboarding */}
      <section className="section">
        <div className="container">
          <div className="split">
            <div>
              <span className="eyebrow">Onboarding</span>
              <h2 className="h2">Day one, ready on day zero</h2>
              <p className="lead">Send the offer, collect documents, assign tasks — new hires arrive to a plan, not chaos.</p>
              <ul className="checklist">
                <li><span className="tick">✓</span> Automated welcome checklists by role and location</li>
                <li><span className="tick">✓</span> Digital offer letters and policy e-signatures</li>
                <li><span className="tick">✓</span> Tasks auto-assigned to managers, IT, and buddies</li>
                <li><span className="tick">✓</span> 30-60-90 day check-ins built in</li>
              </ul>
            </div>
            <div className="panel" style={{ margin: 0 }}>
              <h3>Onboarding progress — Aarav Sharma</h3>
              <p className="psub">Joined 3 days ago · Engineering</p>
              {[
                ["Offer letter signed", 100],
                ["Documents uploaded", 100],
                ["IT setup & laptop", 100],
                ["Team introductions", 60],
                ["First-week goals set", 20],
              ].map(([t, p]) => (
                <div key={t} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <b>{t}</b><span style={{ color: "var(--muted)" }}>{p}%</span>
                  </div>
                  <div className="progress"><i style={{ width: p + "%" }} /></div>
                </div>
              ))}
            </div>
          </div>

          <div className="split flip">
            <div>
              <span className="eyebrow">Time off</span>
              <h2 className="h2">Leave management without the chaos</h2>
              <p className="lead">Balances update themselves. Approvals take one tap. The whole team can see who's away.</p>
              <ul className="checklist">
                <li><span className="tick">✓</span> Custom leave types and carry-over rules</li>
                <li><span className="tick">✓</span> One-tap approvals on web and mobile</li>
                <li><span className="tick">✓</span> Team calendar so nothing clashes</li>
                <li><span className="tick">✓</span> Auto-synced balances — no manual math</li>
              </ul>
            </div>
            <div className="panel" style={{ margin: 0 }}>
              <h3>Pending requests</h3>
              <p className="psub">3 waiting for your approval</p>
              {[
                ["Diya Patel", "Annual leave · 4 days · Dec 23–26", "#8b5cf6", "DP"],
                ["Kabir Malhotra", "Sick leave · 1 day · Today", "#0ea5e9", "KM"],
                ["Sneha Iyer", "Work from home · 2 days", "#f59e0b", "SI"],
              ].map(([n, d, c, ini]) => (
                <div className="appr" key={n}>
                  <span className="avatar" style={{ background: c }}>{ini}</span>
                  <div className="grow"><b>{n}</b><small>{d}</small></div>
                  <button className="mini-btn ok">Approve</button>
                  <button className="mini-btn no">Decline</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section section-soft" id="testimonials">
        <div className="container">
          <div className="center">
            <span className="eyebrow">Loved by HR teams</span>
            <h2 className="h2">Don't take our word for it</h2>
          </div>
          <div className="grid-3">
            {TESTIMONIALS.map((t) => (
              <div className="testi" key={t.n}>
                <div className="stars">★★★★★</div>
                <p>"{t.q}"</p>
                <div className="testi-who">
                  <span className="avatar" style={{ background: t.c, width: 40, height: 40, fontSize: 14 }}>
                    {t.n.split(" ").map((w) => w[0]).join("")}
                  </span>
                  <div><b>{t.n}</b><small>{t.r}</small></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq">
        <div className="container">
          <div className="center">
            <span className="eyebrow">Questions</span>
            <h2 className="h2">Frequently asked</h2>
          </div>
          <div className="faq">
            {FAQS.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ paddingTop: 20 }}>
        <div className="container">
          <div className="cta-band">
            <h2>Give your HR team their time back</h2>
            <p>Join 2,000+ companies running people operations on TeamSetu. Set up in days, not months.</p>
            <div className="cta-row" style={{ justifyContent: "center" }}>
              <Link href="/signup" className="btn btn-ghost btn-lg">Start free 14-day trial</Link>
              <Link href="/pricing" className="btn btn-lg" style={{ border: "1px solid rgba(255,255,255,.5)", color: "#fff" }}>Talk to sales</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
