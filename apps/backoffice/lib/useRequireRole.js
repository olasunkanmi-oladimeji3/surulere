import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "./useStore";
import { navHrefFor } from "./data";

/**
 * Guards a dashboard page by role, redirecting to /login if the session
 * doesn't satisfy it. Returns { user, db, ready }.
 *
 * `ready` is deliberately conservative — it only becomes true once the
 * auth context has finished its initial profile load AND confirms the
 * user's role is correct. This means a page renders <PageLoading /> during
 * the auth check rather than briefly flashing its content or bouncing to
 * /login and back. The redirect only fires once `ready` is false AND the
 * auth context itself is done loading (`authReady`); never during the
 * in-flight fetch that's still resolving.
 */
export function useRequireRole(role) {
  const { user, ready: authReady } = useAuth();
  const { db } = useStore(); // legacy mock data for not-yet-migrated pages
  const router = useRouter();

  const roleOk = !role || user?.role === role;
  const authorized = authReady && !!user && roleOk;

  useEffect(() => {
    // Only redirect once authReady=true so we don't fire mid-fetch.
    if (authReady && !user) {
      router.replace("/login");
    } else if (authReady && user && !roleOk) {
      // Logged in but wrong role — send them to their own dashboard
      // rather than a dead /login bounce.
      router.replace(navHrefFor(user.role));
    }
  }, [authReady, user, roleOk, router]);

  return { user, db, ready: authorized };
}