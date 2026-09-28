import Link from "next/link";

const BLOCKS = [
  {
    e: "Core HR",
    t: "A single source of truth for your people",
    d: "Every employee record, document, and job change — organized, searchable, and always current.",
    pts: ["Custom fields for anything unique to your company", "Org chart that builds itself as you grow", "Document vault with expiry reminders", "Full audit trail on every change"],
  },
  {
    e: "Hiring",
    t: "From job post to offer letter",
    d: "Publish roles, track applicants, and send digital offer letters without leaving TeamSetu.",
    pts: ["One-click job posting to your careers page", "Kanban pipeline for every opening", "Scorecards and interview scheduling", "Offer letters with e-signature"],
  },
  {
    e: "Performance",
    t: "Reviews people don't dread",
    d: "Goals, continuous feedback, and review cycles that run themselves — with completion rates to prove it.",
    pts: ["OKRs and goals linked to reviews", "Peer feedback and 1-on-1 templates", "Automated review cycles and reminders", "Calibration-ready reports for leadership"],
  },
  {
    e: "Reports",
    t: "Answers, not spreadsheets",
    d: "Headcount, attrition, leave trends, review scores — drag, drop, done. Export anywhere.",
    pts: ["50+ ready-made HR reports", "Custom report builder", "Scheduled email digests for founders", "Payroll-ready exports in one click"],
  },
];

export default function Features() {
  return (
    <>
      <section className="hero" style={{ paddingBottom: 60 }}>
        <div className="container center">
          <span className="eyebrow">Features</span>
          <h1 className="h1">Everything HR needs.<br />Nothing it doesn't.</h1>
          <p className="lead" style={{ margin: "0 auto 28px" }}>
            Four deeply-built modules that cover the full employee lifecycle — designed to be set up in days and loved for years.
          </p>
          <div className="cta-row" style={{ justifyContent: "center" }}>
            <Link href="/signup" className="btn btn-primary btn-lg">Start free trial</Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 20 }}>
        <div className="container">
          {BLOCKS.map((b, i) => (
            <div className={`split ${i % 2 ? "flip" : ""}`} key={b.e} style={{ marginTop: i ? 80 : 40 }}>
              <div>
                <span className="eyebrow">{b.e}</span>
                <h2 className="h2">{b.t}</h2>
                <p className="lead">{b.d}</p>
                <ul className="checklist">
                  {b.pts.map((p) => (
                    <li key={p}><span className="tick">✓</span>{p}</li>
                  ))}
                </ul>
              </div>
              <div className="mock">
                <div className="mock-bar"><i /><i /><i /></div>
                <div style={{ padding: 24 }}>
                  <div className="mock-cards" style={{ gridTemplateColumns: "1fr 1fr" }}>
                    <div className="mock-card"><b>{["248", "32", "96%", "12"][i]}</b><small>{["Active employees", "Open roles", "Review completion", "Reports scheduled"][i]}</small></div>
                    <div className="mock-card"><b>{["4.2%", "18", "4.8/5", "50+"][i]}</b><small>{["Attrition (annual)", "Offers sent", "Avg. rating", "Templates"][i]}</small></div>
                  </div>
                  {[85, 60, 72, 48].map((h, j) => (
                    <div key={j} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                        <span style={{ fontWeight: 600 }}>{["Engineering", "Sales", "Design", "Operations"][j]}</span>
                        <span style={{ color: "var(--muted)" }}>{h}%</span>
                      </div>
                      <div className="progress" style={{ marginTop: 0 }}><i style={{ width: h + "%" }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 20 }}>
        <div className="container">
          <div className="cta-band">
            <h2>See it on your own data</h2>
            <p>Import a spreadsheet and explore every feature free for 14 days. No credit card, no sales call required.</p>
            <div className="cta-row" style={{ justifyContent: "center" }}>
              <Link href="/signup" className="btn btn-ghost btn-lg">Start free trial</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
