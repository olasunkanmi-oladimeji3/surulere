import { useSyncExternalStore } from "react";
import { DB, subscribeToStore } from "./data";

/**
 * Bridges the localStorage-backed demo "database" into React the correct
 * way — via useSyncExternalStore — instead of useState+useEffect. Every
 * write in lib/data.js calls notify() internally, so any component that
 * reads this hook re-renders automatically.
 *
 * Two React contracts this must satisfy:
 *
 *   1. getSnapshot() must return the same reference as long as the store
 *      hasn't changed — hence the module-level `cache`. notify() nulls it,
 *      so the next render re-computes.
 *
 *   2. getServerSnapshot() must ALSO return a stable reference — it runs
 *      during SSR and during the server-to-client hydration comparison, and
 *      React calls it multiple times. Returning `computeSnapshot()` inline
 *      (a new object every call) triggers "getServerSnapshot should be
 *      cached to avoid an infinite loop". The fix: a module-level constant
 *      computed once when the module loads. It's the same across all
 *      server renders in a request since localStorage doesn't exist on the
 *      server anyway — { db: seedData, user: null } is always the right
 *      answer there.
 */

let cache = null;

// Real auth/session state comes from contexts/AuthContext.jsx (Supabase) —
// this hook only bridges the legacy mock `db`, so the snapshot doesn't carry
// a `user` field anymore (nothing here reads one; see useRequireRole.js).
function computeSnapshot() {
  const db = DB.load();
  return { db };
}

function getSnapshot() {
  if (cache === null) cache = computeSnapshot();
  return cache;
}

// Stable constant — the server always sees seed data.
// Must not be computed lazily (function call) or React warns about
// the infinite loop; must be the same object reference every time.
const SERVER_SNAPSHOT = { db: DB.load() };

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

function subscribe(callback) {
  return subscribeToStore(() => {
    cache = null;
    callback();
  });
}

export function useStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}