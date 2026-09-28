"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getSupabase } from "../lib/supabaseClient";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();
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
    await getSupabase().auth.signOut();
    window.location.href = "/login";
  }

  return (
    <AuthCtx.Provider value={{ user, profile, company, loading, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
