import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (supabaseInstance) return supabaseInstance;

  const url = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables/secrets.'
    );
  }

  supabaseInstance = createClient(url, key);
  return supabaseInstance;
};

// For backward compatibility while migration occurs
export const supabase = (function() {
  try {
    return getSupabase();
  } catch (e) {
    // Return a proxy that throws on any access to give a better runtime experience
    return new Proxy({} as SupabaseClient, {
      get: (target, prop) => {
        if (prop === 'then') return undefined; // Promise check
        throw new Error(
          'Supabase client accessed before valid configuration was provided. ' +
          'Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
        );
      }
    });
  }
})();
