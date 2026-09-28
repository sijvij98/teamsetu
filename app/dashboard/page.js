"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "../../lib/supabaseClient";
import { useAuth } from "../../components/AuthProvider";
import Shell, { ADMIN_NAV, EMP_NAV } from "../../components/dashboard/Shell";
import {
  AdminOverview, Directory, TimeOffAdmin, OnboardingAdmin, OfferLettersAdmin,
} from "../../components/dashboard/views-admin";
import { EmployeeHome, MyLeave, MyOnboarding } from "../../components/dashboard/views-employee";

/* ---------------- data hook ---------------- */
function useCompanyData(refreshKey) {
  const [data, setData] = useState({ employees: [], leaves: [], tasks: [], offers: [] });
  const [loading, setLoading] = useState(true);
  const [unconfigured, setUnconfigured] = useState(false);
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setUnconfigured(true);
      setLoading(false);
      return;
    }
    let alive = true;
    (async () => {
      const [e, l, t, o] = await Promise.all([
        supabase.from("employees").select("*").order("name"),
        supabase.from("leave_requests").select("*, employees(name, department, email)").order("created_at", { ascending: false }),
        supabase.from("onboarding_tasks").select("*, employees(name, department, joining_date)").order("due_date"),
        supabase.from("offer_letters").select("*, employees(name, email)").order("created_at", { ascending: false }),
      ]);
      if (!alive) return;
      setData({
        employees: e.data || [],
        leaves: l.data || [],
        tasks: t.data || [],
        offers: o.data || [],
      });
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [refreshKey]);
  return { ...data, loading, unconfigured };
}

function NotConfigured() {
  return (
    <div className="dash">
      <div className="dash-main" style={{ gridColumn: "1 / -1" }}>
        <div className="panel2 center" style={{ padding: "70px 30px", textAlign: "center" }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>🔌</div>
          <h3>Database not connected yet</h3>
          <p className="muted" style={{ maxWidth: 480, margin: "0 auto" }}>
            This dashboard needs its Supabase database. Add <b>NEXT_PUBLIC_SUPABASE_URL</b> and{" "}
            <b>NEXT_PUBLIC_SUPABASE_ANON_KEY</b> in Vercel → Settings → Environment Variables, then redeploy.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, profile, company, loading } = useAuth();
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const bump = () => setRefreshKey((k) => k + 1);
  const { employees, leaves, tasks, offers, loading: dataLoading, unconfigured } = useCompanyData(refreshKey);

  const role = profile?.role || "employee";
  const isAdmin = role === "admin" || role === "hr";
  const [tab, setTab] = useState(isAdmin ? "overview" : "home");

  useEffect(() => {
    if (!loading && !user && getSupabase()) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    setTab(isAdmin ? "overview" : "home");
  }, [isAdmin]);

  if (loading) return <div className="dash"><div className="dash-main"><p className="muted">Loading…</p></div></div>;
  if (unconfigured) return <NotConfigured />;

  const me = employees.find((e) => e.id === profile?.employee_id)
    || employees.find((e) => e.email && user?.email && e.email.toLowerCase() === user.email.toLowerCase());
  const notifCount = isAdmin ? leaves.filter((l) => l.status === "pending").length : 0;
  const nav = isAdmin ? ADMIN_NAV : EMP_NAV;

  return (
    <Shell nav={nav} tab={tab} setTab={setTab} notifCount={notifCount} displayName={me?.name}>
      {dataLoading ? (
        <p className="muted">Fetching live data…</p>
      ) : isAdmin ? (
        <>
          {tab === "overview" && <AdminOverview employees={employees} leaves={leaves} tasks={tasks} offers={offers} bump={bump} />}
          {tab === "directory" && <Directory employees={employees} />}
          {tab === "timeoff" && <TimeOffAdmin leaves={leaves} bump={bump} />}
          {tab === "onboarding" && <OnboardingAdmin employees={employees} tasks={tasks} company={company} bump={bump} />}
          {tab === "offers" && <OfferLettersAdmin employees={employees} offers={offers} company={company} bump={bump} />}
        </>
      ) : (
        <>
          {tab === "home" && <EmployeeHome employees={employees} leaves={leaves} tasks={tasks} me={me} bump={bump} go={setTab} />}
          {tab === "leave" && <MyLeave leaves={leaves} me={me} company={company} bump={bump} />}
          {tab === "onboarding" && <MyOnboarding tasks={tasks} me={me} bump={bump} />}
          {tab === "directory" && <Directory employees={employees} />}
        </>
      )}
    </Shell>
  );
}
