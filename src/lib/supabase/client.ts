"use client";

import { createBrowserClient } from "@supabase/ssr";

function getSupabaseBrowserConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase browser environment variables.");
  }

  return { supabaseKey, supabaseUrl };
}

export function createClient() {
  const { supabaseKey, supabaseUrl } = getSupabaseBrowserConfig();

  return createBrowserClient(supabaseUrl, supabaseKey);
}
