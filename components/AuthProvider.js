"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getSupabase, hasSupabaseConfig } from "../lib/supabaseClient";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [configured] = useState(hasSupabaseConfig());

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }
    let alive = true;

    async function load(sessionUser) {
      if (!sessionUser) {
        if (alive) { setUser(null); setProfile(null); setCompany(null); setLoading(false); }
        return;
      }
      const { data: prof } = await supabase
        .from("profiles")
        .select("*, companies(*)")
        .eq("id", sessionUser.id)
        .single();
      if (!alive) return;
      setUser(sessionUser);
      setProfile(prof || null);
      setCompany(prof?.companies || null);
      setLoading(false);
    }

    supabase.auth.getSession().then(({ data }) => load(data.session?.user || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => load(session?.user || null));
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);

  async function signOut() {
    const supabase = getSupabase();
    if (supabase) await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <AuthCtx.Provider value={{ user, profile, company, loading, signOut, configured }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
