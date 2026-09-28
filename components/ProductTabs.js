"use client";

import { useState } from "react";
import Link from "next/link";
import Reveal from "./Reveal";

const TABS = [
  {
    id: "data",
    label: "HR Data & Reporting",
    title: "Every people fact, one click away",
    desc: "TeamSetu is your single source of truth for people data — with ready-made reports, custom dashboards, and workflows that run themselves.",
    feats: [
      ["Employee records", "Secure profiles with documents, history, and custom fields for every team member."],
      ["Automated reporting", "50+ pre-built reports on headcount, attrition, and diversity — scheduled to your inbox."],
      ["Mobile app", "Approve, request, and check anything from your phone. HR that fits in a pocket."],
    ],
    visual: "report",
  },
  {
    id: "hiring",
    label: "Hiring & Onboarding",
    title: "Hire fast, onboard faster",
    desc: "From job post to first day: a smooth pipeline, scorecards, and onboarding checklists that welcome new hires properly.",
    feats: [
      ["Applicant tracking", "One pipeline for every role — move candidates with drag and drop."],
      ["Candidate experience", "Branded career page and timely updates that candidates actually enjoy."],
      ["Onboarding tasks", "Role-based checklists auto-assigned to managers, IT, and buddies."],
    ],
    visual: "pipeline",
  },
  {
    id: "payroll",
    label: "Time Off & Payroll",
    title: "Payroll without the panic",
    desc: "Time off, attendance, and reimbursements flow straight into payroll-ready exports. No double entry, no month-end chaos.",
    feats: [
      ["Time-off tracking", "One-tap requests, smart approvals, and balances that update themselves."],
      ["Attendance", "Shifts, check-ins, and holiday calendars for every location."],
      ["Payroll exports", "Clean, payroll-ready files your finance team can use directly."],
    ],
    visual: "calendar",
  },
  {
    id: "performance",
    label: "Performance & Growth",
    title: "Grow people, not paperwork",
    desc: "Goals, 1-on-1s, and review cycles that run on autopilot — so feedback happens all year, not once a year.",
    feats: [
      ["Goals & OKRs", "Company-to-individual goal trees everyone can actually see."],
      ["Review cycles", "Automated 360° reviews with reminders that get 94%+ completion."],
      ["1-on-1 templates", "Guided agendas that make manager conversations meaningful."],
    ],
    visual: "growth",
  },
];

function Visual({ kind }) {
  if (kind === "report")
    return (
      <div>
        <div className="mock-row" style={{ marginBottom: 14 }}><b>Headcount report</b><span className="pill">Live</span></div>
        <div className="bars" style={{ height: 170 }}>
          {[38, 55, 44, 70, 62, 88, 78].map((h, i) => (
            <div className="bar-col" key={i}><i style={{ height: h + "%", animationDelay: `${i * 0.08}s` }} /><small>{["Jan","Feb","Mar","Apr","May","Jun","Jul"][i]}</small></div>
          ))}
        </div>
      </div>
    );
  if (kind === "pipeline")
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[["Applied", 48, "#059669"], ["Screening", 26, "#0ea5e9"], ["Interview", 14, "#683180"], ["Offer", 6, "#f59e0b"]].map(([s, n, c]) => (
          <div key={s} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
            <b style={{ fontSize: 14 }}>{s}</b>
            <span className="pill" style={{ marginLeft: "auto" }}>{n} candidates</span>
          </div>
        ))}
      </div>
    );
  if (kind === "calendar")
    return (
      <div>
        <div className="mock-row" style={{ marginBottom: 14 }}><b>Team calendar — October</b><span className="pill">3 on leave</span></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
          {Array.from({ length: 28 }, (_, i) => (
            <div key={i} style={{
              aspectRatio: "1", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700,
              background: [4, 11, 18].includes(i) ? "var(--green-100)" : "#fff",
              border: "1px solid var(--border)", color: [4, 11, 18].includes(i) ? "var(--green-800)" : "var(--muted)",
            }}>{i + 1}</div>
          ))}
        </div>
      </div>
    );
  return (
    <div>
      <div className="mock-row" style={{ marginBottom: 14 }}><b>Review completion</b><span className="pill">94%</span></div>
      {[["Self reviews", 96], ["Peer feedback", 88], ["Manager reviews", 94]].map(([s, p]) => (
        <div key={s} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700 }}><span>{s}</span><span>{p}%</span></div>
          <div className="progress"><i style={{ width: p + "%" }} /></div>
        </div>
      ))}
    </div>
  );
}

export default function ProductTabs() {
  const [active, setActive] = useState(TABS[0]);
  return (
    <div>
      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} role="tab" className={`tab-btn ${active.id === t.id ? "on" : ""}`} onClick={() => setActive(t)}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="tab-panel" key={active.id}>
        <div className="tab-grid">
          <Reveal>
            <h3 style={{ fontSize: "clamp(22px, 2.6vw, 30px)" }}>{active.title}</h3>
            <p className="lead" style={{ fontSize: 16 }}>{active.desc}</p>
            <div className="tab-feats">
              {active.feats.map(([b, s]) => (
                <div className="tab-feat" key={b}><b>{b}</b><span>{s}</span></div>
              ))}
            </div>
            <Link href="/signup" className="btn btn-primary">Start free trial</Link>
          </Reveal>
          <Reveal delay={1}>
            <div className="tab-visual"><Visual kind={active.visual} /></div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
