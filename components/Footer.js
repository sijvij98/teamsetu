import Link from "next/link";

const COLS = [
  { h: "Product", links: ["Features", "Pricing", "Integrations", "Mobile app", "What's new"] },
  { h: "Solutions", links: ["Startups", "Enterprises", "Remote teams", "Payroll", "Performance"] },
  { h: "Resources", links: ["Blog", "HR guides", "Help center", "API docs", "Community"] },
];

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="foot-grid">
          <div>
            <Link href="/" className="brand" style={{ marginBottom: 14, display: "inline-flex" }}>
              <span className="brand-mark">TS</span> TeamSetu
            </Link>
            <p style={{ color: "var(--muted)", fontSize: 14.5, lineHeight: 1.65, maxWidth: 300 }}>
              HR software that brings your whole team together — hiring, onboarding, time off, and performance in one place.
            </p>
          </div>
          {COLS.map((c) => (
            <div key={c.h}>
              <h4>{c.h}</h4>
              <ul>
                {c.links.map((l) => (
                  <li key={l}><a href="#">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="foot-bottom">
          <span>© 2026 TeamSetu Technologies Pvt. Ltd. All rights reserved.</span>
          <span>Privacy · Terms · Security</span>
        </div>
      </div>
    </footer>
  );
}
