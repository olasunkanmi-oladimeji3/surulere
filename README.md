# Ilé Surulere

A property & resident registry for Surulere Local Government, Lagos. Two apps, one Supabase project.

## Structure

```
apps/
  web/         The public site + citizen-facing registry (login, signup, field
               data collection, property/resident self-service, the owner/
               resident/CDA dashboards). Deploys at the main domain.
  backoffice/  The LG Staff (admin) dashboard — properties, residents, field
               submissions review, CDA member and LG Staff management, audit
               log. Deploys separately, ideally with restricted access
               (its own domain/subdomain, an allowlist, etc.) since it's
               internal-only.
```

Both apps share the same Supabase project (same database, same auth users) but are otherwise independent Next.js apps — separate `package.json`, separate deployments. Shared logic (Supabase clients, queries, a handful of UI components) is currently **duplicated** between the two rather than pulled into a shared package — a deliberate simplicity/risk tradeoff when the split was done; consider extracting a `packages/shared` workspace package if the duplication starts causing drift.

Property and resident **detail/edit views live only in `apps/web`** — `apps/backoffice`'s list pages link out to them (opens in a new tab) rather than duplicating that UI. Set `NEXT_PUBLIC_REGISTRY_URL` (in backoffice) and `NEXT_PUBLIC_BACKOFFICE_URL` (in web) once both are deployed so those cross-app links point at the real URLs instead of `localhost`.

## Local development

```bash
npm install              # installs both apps' dependencies (npm workspaces)
npm run dev:web          # apps/web on :3000
npm run dev:backoffice   # apps/backoffice on :3001 — run alongside web to test cross-app links
```

Each app needs its own `.env` (gitignored) with:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

**On that service role key**: it bypasses Row Level Security entirely, so today it's the *only* thing enforcing access control on server actions — there's no RLS policy backstop yet. `apps/backoffice` needs it for obvious reasons. `apps/web` **also** needs it, because the property/resident self-edit actions (`lib/actions/properties.js`, `lib/actions/residents.js`) use it too — the split reduces what ships in the public app's *route/UI* bundle, but doesn't fully isolate this secret until real RLS policies exist and those actions can move to the session-aware client instead.

## Deploying

Two separate Vercel projects (or equivalent), each pointed at its `apps/*` subdirectory, each with its own env vars and — for backoffice — ideally its own access restriction beyond just "not linked from the public site."

## Building

```bash
npm run build:web
npm run build:backoffice
```
