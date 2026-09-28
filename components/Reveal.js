"use client";

import { useEffect, useRef } from "react";

export default function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const d = delay === 1 ? "reveal-d1" : delay === 2 ? "reveal-d2" : delay === 3 ? "reveal-d3" : "";
  return (
    <div ref={ref} className={`reveal ${d} ${className}`.trim()}>
      {children}
    </div>
  );
}
