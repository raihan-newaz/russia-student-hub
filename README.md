# Russia Student Hub

A new Bengali, mobile-first Next.js application for Bangladesh → Russia student journeys. Hind Siliguri is bundled and self-hosted through `@fontsource`; no Google Fonts request is required at runtime.

## Run locally

Node.js 20.9+ is required.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Without credentials, public pages show honest empty states and login explains the missing setup. To preview the design with clearly labeled synthetic public data, set `DEMO_MODE=true` in `.env.local`. `/preview` shows a 360px mobile frame. Demo filters operate on a deterministic synthetic cohort. Demo mode never creates accounts or writes records and is ignored on Vercel production.

## Supabase and Google setup

1. Create a Supabase project. Run `supabase/migrations/001_initial.sql` in its SQL editor **once**, before users sign up. The migration creates the tables, RLS policies, public projections, aggregate RPC, moderation, notifications and atomic comment limiter.
2. Enable the Google provider in Supabase Authentication. Create Google OAuth Web client credentials; register Supabase's displayed callback URL in Google. Store the client ID/secret in Supabase, never in source code.
3. In Supabase URL Configuration set Site URL to your deployed app and allow `http://localhost:3000/auth/callback` plus the exact deployed `/auth/callback` URL. Use a stable preview domain if testing OAuth on previews.
4. Populate `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`. Set `SUPABASE_SERVICE_ROLE_KEY` **server-side only** for account deletion; it is never imported in client code or used for ordinary tracker operations.
5. Sign in once. In the SQL editor, grant the first admin using the actual Supabase auth user UUID:

```sql
insert into public.admins(user_id) values ('YOUR-AUTH-USER-UUID');
```

There is no client-controlled admin flag. Only trusted database operators can add administrators. Do not expose the service role key or grant anonymous access to private tables.

## Deploy to Vercel

Import this directory/repository as a Next.js project, use `npm run build`, add the environment variables above, and set `DEMO_MODE=false`. Redeploy after changing environment variables. No paid external resource is provisioned automatically. Supabase and Vercel accounts, project selection and OAuth credentials are required before a live deployment can work.

Production starts empty. Synthetic data is defined only for explicit demo previews and never inserted into the production database. Check `/`, `/experiences`, `/journey`, `/account`, `/privacy`; administrators also have `/admin`.

## Data model and privacy

- `records` is a discriminated private record table (`study`, `document`, `visa`, `cost`, `flight`). Study records are parents; all other records reference a plan. A database trigger prevents cross-owner and non-study parent links. This keeps draft fields flexible while preserving relational ownership and cascading deletion.
- `profiles` stores alias, stats consent and server-managed suspension. Google details stay in Auth. A separate `admins` table controls access.
- `experience_versions` stores explicit public snapshots. A new edit is pending, leaving the old approval visible until review. Unpublishing hides every version. Superseded versions retain comments privately; comments are scoped to the exact version they discussed.
- Public views expose only approved story fields and non-hidden comments with aliases. No owner UUID, private record, email, exact appointment or flight schedule is exposed by those views. Direct underlying table reads are restricted to the owner or authorized moderation roles.
- `dashboard(filters)` computes aggregates in PostgreSQL. Five distinct students are needed for breakdowns, processing samples and each cost group. Unique students and visa attempts are counted separately. Approval rate excludes pending and withdrawn. Missing amounts are excluded, currencies stay separate, flight costs do not duplicate generic airfare items.
- All Server Actions use the authenticated session, schema validation where applicable, and database permissions/RPC authorization. The service role is used solely for authenticated self-deletion. Public data is not cached, so withdrawal is immediately reflected on the next request.
- No uploads, booking, direct messaging or official embassy requirement database is included.

## Checks

```sh
npm run typecheck
npm test
npm run build
```

Tests include model validation and database-level access/aggregation/moderation checks with an isolated PostgreSQL-compatible test database. Still run live Supabase OAuth/session/RLS integration smoke tests with two student accounts and one admin before launch.

## Operational checklist

- Review pending experiences, resolve reports, and merge spelling variants in the admin panel.
- Configure Supabase backups/retention appropriate to your project and review Vercel/Supabase logs without logging user content or tokens.
- Verify login/callback/logout, saving/reloading each record type, failed saves, reapplication, comments/replies, consent withdrawal, and permanent account deletion against the real project.
- Admin lists are paginated at 50 entries per section. Notifications show the latest 50.
- Comments are capped at 5 inserts/minute/user via a transaction advisory lock. For high traffic, add edge abuse controls in addition to account-based limits.
- The development preview has no live credentials by default; a successful frontend build does not verify external OAuth configuration.
