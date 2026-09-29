"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const LINKS = [
  ["Features", "/features"],
  ["Pricing", "/pricing"],
  ["Customers", "/#testimonials"],
  ["FAQ", "/#faq"],
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav ${scrolled ? "scrolled" : ""}`}>
      <div className="container nav-inner">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">TS</span> TeamSetu
        </Link>
        <nav className="nav-links">
          {LINKS.map(([t, h]) => (
            <Link key={t} href={h}>{t}</Link>
          ))}
        </nav>
        <div className="nav-actions">
          <Link href="/login" className="btn btn-ghost btn-sm hide-sm">Log in</Link>
          <Link href="/signup" className="btn btn-primary btn-sm">Start free trial</Link>
          <button
            className="nav-toggle"
            aria-label="Menu"
            onClick={() => setOpen(!open)}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>
      {open && (
        <div className="container">
          <nav className="mobile-menu open">
            <Link href="/signup" className="btn btn-primary menu-cta" onClick={() => setOpen(false)}>Start free trial</Link>
            {LINKS.map(([t, h]) => (
              <Link key={t} href={h} onClick={() => setOpen(false)}>{t}</Link>
            ))}
            <Link href="/login" onClick={() => setOpen(false)}>Log in</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
