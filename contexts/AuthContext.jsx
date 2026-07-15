"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from "react";
import { createClient } from "../lib/supabase/cilent";
import { signUpOwner, signIn, signOut, updatePassword, fetchCurrentProfile } from "@/lib/supabaseData";

const AuthContext = createContext(null);

/**
 * REAL Supabase auth context.
 *
 * The trickiest thing here is the login redirect race:
 *   1. signInWithPassword() resolves → we fetch the profile → router.push()
 *   2. onAuthStateChange fires (SIGNED_IN event)
 *   3. The handler calls refresh() again, which sets user to null while
 *      the async profile fetch is in flight
 *   4. useRequireRole sees user===null and calls router.replace("/login")
 *      — undoing the redirect from step 1
 *
 * Fix: `fetchingRef` tracks whether a profile fetch is already in flight.
 * The auth-state-change handler skips the duplicate refresh if one is
 * already happening. This way the login() call's fetch "wins" and the
 * state-change handler is a no-op for that event.
 */
export function AuthProvider({ children }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const fetchingRef = useRef(false);

  const refresh = useCallback(async () => {
    if (fetchingRef.current) return; // already in flight — don't clobber it
    fetchingRef.current = true;
    try {
      const profile = await fetchCurrentProfile(supabase);
      setUser(profile);
    } finally {
      fetchingRef.current = false;
    }
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      await refresh();
      if (mounted) setReady(true);
    })();

    const { data: subscription } = supabase.auth.onAuthStateChange(async (event) => {
      // INITIAL_SESSION fires during the initial getSession() that @supabase/ssr
      // already handles — skip it to avoid a redundant fetch racing the one
      // above. For every other event (SIGNED_IN, TOKEN_REFRESHED, SIGNED_OUT,
      // USER_UPDATED) we do want to re-sync the profile.
      if (event === "INITIAL_SESSION") return;
      await refresh();
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [supabase, refresh]);

  const login = useCallback(async (email, password) => {
    const result = await signIn(supabase, { email, password });
    if (!result.ok) return result;
    // Fetch the profile immediately, before onAuthStateChange fires,
    // so fetchingRef.current is already true when the SIGNED_IN event
    // arrives and the handler bows out.
    fetchingRef.current = true;
    try {
      const profile = await fetchCurrentProfile(supabase);
      setUser(profile);
      return { ok: true, user: profile };
    } finally {
      fetchingRef.current = false;
    }
  }, [supabase]);

  const logout = useCallback(async () => {
    await signOut(supabase);
    setUser(null);
  }, [supabase]);

  const registerOwner = useCallback(async (form) => {
    const result = await signUpOwner(supabase, form);
    if (!result.ok) return result;
    fetchingRef.current = true;
    try {
      const profile = await fetchCurrentProfile(supabase);
      setUser(profile);
      return { ok: true, user: profile, session: result.session };
    } finally {
      fetchingRef.current = false;
    }
  }, [supabase]);

  const changePassword = useCallback(async (_userId, _current, next) => {
    return updatePassword(supabase, next);
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, ready, login, loginAs: null, logout, registerOwner, changePassword, supabase }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}