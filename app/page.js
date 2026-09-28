import Link from "next/link";
import Reveal from "../components/Reveal";
import ProductTabs from "../components/ProductTabs";
import CountUp from "../components/CountUp";
import ChatCta from "../components/ChatCta";

const PILLS = ["Hiring & Onboarding", "HR Data & Reporting", "Time Off & Payroll", "Performance & Growth"];
const LOGOS = ["NORTHPEAK", "Brightline", "CRAFTLY", "Mediora", "FINEDGE", "Loopwork", "KAPIVA", "Zephyr"];
const FAQS = [
  { q: "What does TeamSetu do?", a: "TeamSetu is the complete HR platform that brings employee records, time off, onboarding, performance, and payroll-ready reporting together in one place — so small HR teams can do the work of many." },
  { q: "Is there a free trial?", a: "Yes. Every plan starts with a 14-day free trial of the Growth plan. No credit card required, and you can invite your whole HR team during the trial." },
  { q: "How much does TeamSetu cost?", a: "Pricing starts at ₹249 per employee per month (billed annually) on Essentials, ₹399 on Growth, with custom pricing for Enterprise. You only pay for active employees." },
  { q: "Can I migrate from spreadsheets?", a: "Absolutely. Our free importer moves your employee data from Excel or Google Sheets in minutes, and our team helps with larger migrations at no charge." },
  { q: "Is my data secure?", a: "Yes. Data is encrypted in transit and at rest, with role-based access so managers only see their own teams. We run regular security audits and backups." },
];

function MockDashboard() {
  return (
    <div className="mock" aria-hidden="true">
      <div className="mock-bar"><i style={{ background: "#f87171" }} /><i style={{ background: "#fbbf24" }} /><i style={{ background: "#34d399" }} /></div>
      <div className="mock-body">
        <div className="mock-side"><span /><span /><span /><span /><span /></div>
        <div className="mock-main">
          <div className="mock-cards">
            <div className="mock-card"><b>248</b><small>Employees</small></div>
            <div className="mock-card"><b>18</b><small>On leave today</small></div>
            <div className="mock-card"><b>96%</b><small>Review completion</small></div>
          </div>
          <div className="mock-chart">
            {[45, 70, 52, 88, 64, 96, 78].map((h, i) => (
              <i key={i} style={{ height: h + "%", animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
          <div className="mock-row"><span className="avatar" style={{ background: "#0ea5e9" }}>AS</span>Aarav Sharma<span className="pill">Approved</span></div>
          <div className="mock-row"><span className="avatar" style={{ background: "#8b5cf6" }}>DP</span>Diya Patel<span className="pill warn">Pending</span></div>
          <div className="mock-row"><span className="avatar" style={{ background: "#f59e0b" }}>RM</span>Rohan Mehta<span className="pill">Approved</span></div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* ============ HERO ============ */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="hero-badge"><span className="dot" />New: Setu AI assistant is here</span>
            <h1>From HR platform<br />to HR partner</h1>
            <p className="lead">Meet the HR software that handles the busywork for you — hiring, onboarding, time off, and performance in one simple platform, so you can put your people first.</p>
            <div className="cta-row">
              <Link href="/signup" className="btn btn-primary btn-lg">Start free trial</Link>
              <Link href="/pricing" className="btn btn-ghost btn-lg">See pricing</Link>
            </div>
            <div className="pill-row">
              {PILLS.map((p) => <a key={p} className="pill-link" href="#platform">{p}</a>)}
            </div>
            <p className="micro" style={{ marginTop: 18 }}>Free 14-day trial · No credit card required · Cancel anytime</p>
          </div>
          <Reveal delay={1}><MockDashboard /></Reveal>
        </div>
      </section>

      {/* ============ LOGO STRIP ============ */}
      <section className="section" style={{ paddingTop: 64, paddingBottom: 64 }}>
        <div className="container center">
          <Reveal>
            <h2 style={{ fontSize: "clamp(22px, 2.8vw, 32px)" }}>See why 2,000+ companies love working with TeamSetu</h2>
            <div className="logos">{LOGOS.map((l) => <span key={l}>{l}</span>)}</div>
          </Reveal>
        </div>
      </section>

      {/* ============ ANNOUNCEMENTS ============ */}
      <section className="section section-soft">
        <div className="container">
          <Reveal>
            <span className="eyebrow">Product updates</span>
            <h2>What&apos;s new at TeamSetu</h2>
            <p className="lead" style={{ maxWidth: 640 }}>We ship improvements every month. Here&apos;s what&apos;s fresh in the platform.</p>
          </Reveal>
          <div className="announce-grid">
            <Reveal delay={1}>
              <Link href="/features" className="announce-card tint-lime">
                <span className="announce-ico">🤖</span>
                <h3>Meet Setu, your AI HR assistant</h3>
                <p>Setu answers HR questions, drafts policies, and guides employees through time-off and onboarding — right inside TeamSetu.</p>
                <span className="more">Learn more →</span>
              </Link>
            </Reveal>
            <Reveal delay={2}>
              <Link href="/features" className="announce-card tint-blue">
                <span className="announce-ico">📊</span>
                <h3>Custom dashboards are here</h3>
                <p>Build your own people dashboards — headcount trends, attrition, and leave patterns — and schedule them to your inbox.</p>
                <span className="more">Learn more →</span>
              </Link>
            </Reveal>
            <Reveal delay={3}>
              <Link href="/features" className="announce-card tint-pink">
                <span className="announce-ico">🌟</span>
                <h3>Performance reviews 2.0</h3>
                <p>Redesigned review cycles with 360° feedback, calibration views, and reminders that lift completion to 94%+.</p>
                <span className="more">Learn more →</span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ AI BAND ============ */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div className="ai-band">
              <div className="ai-grid">
                <div>
                  <span className="ai-badge">✨ Setu AI</span>
                  <h2>Meet Setu AI</h2>
                  <p className="lead">A built-in intelligence layer that understands your company, answers HR questions instantly, and gets routine work done — while you stay in control.</p>
                  <div className="cta-row">
                    <ChatCta />
                    <Link href="/features" className="btn btn-lg" style={{ border: "1px solid rgba(255,255,255,0.4)", color: "#fff" }}>Explore features</Link>
                  </div>
                </div>
                <div className="ai-chat-mock">
                  <div className="ai-bubble user">How many people are on leave next Friday?</div>
                  <div className="ai-bubble bot">4 people are on leave next Friday — 2 from Engineering and 2 from Design. No project deadlines clash. Want me to notify their managers?</div>
                  <div className="ai-bubble user">Draft a work-from-home policy</div>
                  <div className="ai-bubble bot">Done! I&apos;ve drafted a 2-day hybrid policy based on your company settings. Review and publish when ready.</div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ PRODUCT TABS ============ */}
      <section className="section section-soft" id="platform">
        <div className="container">
          <Reveal>
            <div className="center" style={{ maxWidth: 720, margin: "0 auto" }}>
              <span className="eyebrow">One platform</span>
              <h2>A single platform where everything works together</h2>
              <p className="lead">TeamSetu saves you time and effort so you can focus on what matters most — growing your people and your business.</p>
            </div>
          </Reveal>
          <Reveal delay={1}><ProductTabs /></Reveal>
        </div>
      </section>

      {/* ============ STATS BAND ============ */}
      <section className="section stats-band">
        <div className="container center">
          <Reveal>
            <h2>HR teams save 12+ hours a week<br />and cut admin costs by 35%</h2>
          </Reveal>
          <div className="stat-grid">
            <Reveal delay={1}><div className="stat"><b><CountUp to={2000} suffix="+" /></b><p>companies run their HR on TeamSetu</p></div></Reveal>
            <Reveal delay={2}><div className="stat"><b><CountUp to={4.8} decimals={1} suffix="/5" /></b><p>average customer rating across review sites</p></div></Reveal>
            <Reveal delay={3}><div className="stat"><b><CountUp to={98} suffix="%" /></b><p>of customers renew TeamSetu every year</p></div></Reveal>
          </div>
        </div>
      </section>

      {/* ============ SAVINGS ============ */}
      <section className="section">
        <div className="container">
          <Reveal>
            <span className="eyebrow">Customer results</span>
            <h2>Real hours saved,<br />real money kept</h2>
          </Reveal>
          <div className="save-grid">
            <Reveal delay={1}>
              <div className="save-card"><div className="big">₹8.4L / year</div><p>saved in admin time by a 180-person services company using automated reports and onboarding.</p></div>
            </Reveal>
            <Reveal delay={2}>
              <div className="save-card"><div className="big">20 hrs / week</div><p>given back to a 3-person HR team after moving leave, attendance, and payroll exports to TeamSetu.</p></div>
            </Reveal>
            <Reveal delay={3}>
              <div className="save-card"><div className="big">3 weeks → 4 days</div><p>average onboarding time for new hires at a 250-person startup using TeamSetu checklists.</p></div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ INTEGRATIONS ============ */}
      <section className="section section-soft" style={{ paddingTop: 72, paddingBottom: 72 }}>
        <div className="container center">
          <Reveal>
            <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)" }}>40+ pre-built integrations</h2>
            <p className="lead">TeamSetu connects with the tools you already use.</p>
            <div className="int-strip">
              {["Slack", "Google Workspace", "RazorpayX", "Zoho Books", "Gmail", "Outlook", "Zoom", "Excel Import"].map((i) => (
                <span key={i} className="int-chip">{i}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="section" id="testimonials">
        <div className="container">
          <Reveal>
            <div className="center">
              <span className="eyebrow">Loved by HR teams</span>
              <h2>Hear from our customers</h2>
            </div>
          </Reveal>
          <div className="testi-grid">
            {[
              { q: "TeamSetu took our HR from five spreadsheets to one calm dashboard. Onboarding a new hire used to take me a full day — now it's 20 minutes.", n: "Priya Nair", r: "HR Manager, NorthPeak" },
              { q: "Leave approvals, attendance, payroll reports — it all just flows. Our month-end close went from 4 stressful days to one relaxed afternoon.", n: "Arjun Malhotra", r: "Founder, Loopwork" },
              { q: "The easiest HR software we've tried. Our managers actually complete reviews on time now, and support replies in under an hour.", n: "Kavya Reddy", r: "People Lead, Finedge" },
            ].map((t, i) => (
              <Reveal key={t.n} delay={i + 1}>
                <div className="testi">
                  <div className="stars">★★★★★</div>
                  <p>&ldquo;{t.q}&rdquo;</p>
                  <div className="testi-who">
                    <span className="avatar" style={{ background: ["#0ea5e9", "#8b5cf6", "#f59e0b"][i] }}>{t.n.split(" ").map((w) => w[0]).join("")}</span>
                    <div><b>{t.n}</b><small>{t.r}</small></div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div className="rating-row">
              <div className="rating-badge"><div><b>4.8</b><small>2,400+ reviews</small></div><div className="stars">★★★★★</div></div>
              <div className="rating-badge"><div><b>4.9</b><small>Ease of use</small></div><div className="stars">★★★★★</div></div>
              <div className="rating-badge"><div><b>4.7</b><small>Customer support</small></div><div className="stars">★★★★★</div></div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="section section-soft" id="faq">
        <div className="container">
          <Reveal>
            <div className="center"><h2>Frequently asked questions</h2></div>
          </Reveal>
          <div className="faq">
            {FAQS.map((f, i) => (
              <Reveal key={f.q} delay={Math.min(i, 3)}>
                <details><summary>{f.q}</summary><p>{f.a}</p></details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div className="cta-band">
              <h2>Give your HR team<br />their time back</h2>
              <p className="lead" style={{ maxWidth: 560, margin: "0 auto" }}>Join 2,000+ companies running calmer, faster HR on TeamSetu. Set up in minutes — free for 14 days.</p>
              <div className="cta-row">
                <Link href="/signup" className="btn btn-light btn-lg">Start free trial</Link>
                <Link href="/pricing" className="btn btn-lg" style={{ border: "1px solid rgba(255,255,255,0.4)", color: "#fff" }}>See pricing</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
