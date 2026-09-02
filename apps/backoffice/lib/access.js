// lib/access.js
export function maskNIN(nin) {
  if (!nin) return "—";
  return "•••••••" + nin.slice(-4);
}

/** What a given viewer role is allowed to see on a resident/owner record.
 *  Admin: everything. CDA: enough to verify a household, not full ID numbers.
 *  Owner: same restriction as CDA for their own tenants — they don't need
 *  a tenant's full NIN either, just enough to confirm identity on paper. */
export function canSeeFullIdentifiers(viewerRole) {
  return viewerRole === "admin";
}