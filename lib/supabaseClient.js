"use client";

import { createBrowserClient } from "@supabase/ssr";

let client;
let tried = false;

export function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Returns null when the backend is not configured yet (so pages
// degrade gracefully instead of crashing).
export function getSupabase() {
  if (!hasSupabaseConfig()) return null;
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return client;
}
