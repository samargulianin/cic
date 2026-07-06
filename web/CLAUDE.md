# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Bilingual (Georgian/English) brochure site for **One World**, the official Georgian representative of **Cambridge International College (CIC)**. Credibility-first lead generation, not online enrolment. This is a **homepage-first prototype**; see `../PRD.md` for scope and `../research/` for design references and the brand guideline.

## Commands

```bash
npm run dev                 # dev server at http://localhost:3000 (site /ka /en, admin /admin)
npm run build               # production build — also the full typecheck (run before declaring done)
npm run lint
npm run generate:types      # regenerate src/payload-types.ts AFTER any collection/block/global change
npm run generate:importmap  # regenerate the admin import map after adding admin UI components
```

**Seeding (important):** do NOT use `npm run seed` — `payload run` relies on tsx, which is broken on Node 24 (`node:crypto` ENOENT, `payloadInitError`). Seed by hitting the dev-only route while the dev server runs:

```bash
curl http://localhost:3000/seed   # creates admin user, fields, Header/Footer, homepage (bilingual)
```

Admin login after seed: `admin@oneworld.ge` / `changeme123`.

## Critical gotchas

- **SQLite is single-writer.** Any CLI/script that writes to `oneworld.db` will hang if the dev server is running. The `/seed` route avoids this because it runs *inside* the dev server process. For other write scripts, stop the dev server first.
- **Schema changes** (collections/blocks/globals): the dev SQLite DB auto-pushes additive changes, but structural changes (e.g. toggling `localized`) need a reset: stop dev → `rm -f oneworld.db*` → `npm run generate:types` → restart dev → re-seed.
- **Next 16** renamed the middleware convention to `proxy.ts` (not `middleware.ts`).

## Architecture

Single Next.js 16 (App Router) app with **Payload CMS 3 embedded** — one codebase, one deploy. React 19, Tailwind v4, **Postgres (Neon)** via `@payloadcms/db-postgres` (`DATABASE_URI`) in both dev and production. (An earlier SQLite setup — `oneworld.db`/`@payloadcms/db-sqlite` — has been retired; `.env.bak.sqlite` remains as a reference.)

**Two root layouts via route groups** (there is no shared `app/layout.tsx`):
- `src/app/(frontend)/[locale]/` — the public localized site.
- `src/app/(payload)/` — Payload admin + REST/GraphQL (boilerplate; don't hand-edit beyond config).

**Bilingual model — two independent layers:**
- **UI chrome** (nav, buttons, form labels): `next-intl`. Locale routing in `src/proxy.ts` + `src/i18n/{routing,request,navigation}.ts`; strings in `src/messages/{ka,en}.json`. Georgian (`ka`) is the default; URLs are always prefixed (`/ka`, `/en`). The `proxy.ts` matcher excludes `api`, `admin`, `seed`, and Next internals so Payload owns those paths.
- **Content** (pages, fields): Payload `localization` (`ka` default). Fetched per-locale via the Payload **Local API** in `src/lib/payload.ts` (`getPayloadClient`, `getPage`, `getFields`, `getHeader`, `getFooter`) from server components — no HTTP round-trip.

**Block-based pages.** The homepage (`Pages` doc, slug `home`) is composed from CMS blocks, so editors reorder/edit sections without code. Each block in `src/blocks/*` maps 1:1 to a React section in `src/components/sections/*`, dispatched by `RenderBlocks.tsx` on `block.blockType`. The six blocks: Hero, TrustStrip, StatsCallout, FieldsGrid, Narrative, CTABanner.
- The `Pages.layout` blocks field is **`localized: true` as a whole** (each language composes its own page). Consequently block subfields must **NOT** be individually `localized` — Payload forbids localized fields nested inside a localized parent, and seeding both locales would otherwise clobber each other's block rows.

**Collections/globals:** `Pages`, `Fields` (the 19 professional fields + study-level taxonomy), `Enquiries` (leads), `Media`, `Users` (auth); `Header`, `Footer` globals. All in `src/collections/` and `src/globals/`, registered in `src/payload.config.ts`.

**Enquiry flow** (`src/actions/enquiry.ts`, a server action — used instead of an API route to avoid clashing with Payload's `/api` catch-all and the i18n proxy): honeypot + Cloudflare Turnstile (skipped if `TURNSTILE_SECRET_KEY` unset) + validation → `payload.create` with `overrideAccess: true` → the `Enquiries` `afterChange` hook emails One World (`ENQUIRY_NOTIFY_TO`; logs to console if no SMTP). Public REST `create` on `Enquiries` is disabled by design, so all creation goes through the action.

## Design system

Tailwind v4 with brand tokens in `src/app/(frontend)/globals.css` `@theme` (from the CIC brand guideline in `../research/`): indigo navy `#2E3A7E`, Cambridge crimson red, pale-yellow `cream` accent, off-white neutrals. **All sans** (Noto Sans Georgian, full Mkhedruli + Latin) — no serif. Custom utilities: `bg-hero` (dark indigo hero), `bg-red-cta`, `bg-navy-cta`.

- **Hero red-accent convention:** wrap a word in the hero `heading` with `*asterisks*` (e.g. `170+ *distance* programmes`) and `Hero.tsx`'s `AccentHeading` renders that span in red. The logo lives at `public/logo-mark.png` (transparent-bg crest).

## Deploying (Railway)

The `build` script is `payload generate:importmap && next build` (not just `next build`). This is deliberate: `src/app/(payload)/admin/importMap.js` is imported by the admin layout/pages, and Railway's cached `copy / /app` layer kept serving a build context *without* it, failing with `Can't resolve '../importMap.js'` even though the file is committed. Regenerating it at the start of the build writes it fresh into the build context, so the import always resolves regardless of cache state. `generate:importmap` only instantiates the config (no DB connection) but reads `PAYLOAD_SECRET`/`DATABASE_URI` — these must be available as Railway **build-time** variables.

## Going to production
Swap `sqliteAdapter` → `@payloadcms/db-postgres` (+ `DATABASE_URI`); set `SMTP_*`/`ENQUIRY_NOTIFY_TO` and Turnstile keys; set a strong `PAYLOAD_SECRET`; remove the `/seed` route (`src/app/seed/`).
when creating form on the website always use build validation
