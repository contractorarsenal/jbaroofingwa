# JBA Construction — Website

Astro-based marketing site and lead-generation platform for JBA Construction,
deployed via GitHub → Cloudflare Pages, with content managed through
[Pages CMS](https://pagescms.org).

## Stack

- **Framework:** [Astro](https://astro.build) 7 (static output)
- **Content:** Astro Content Layer API (`src/content.config.ts`) — Markdown/YAML files edited via Pages CMS
- **Styling:** Plain CSS with design tokens (`src/styles/global.css`) — no CSS framework
- **Hosting:** Cloudflare Pages
- **Forms backend:** Cloudflare Pages Function (`functions/api/lead.ts`)
- **Fonts:** Self-hosted via `@fontsource-variable` (no external font requests)

## Local Development

Requires Node.js 18+.

```bash
npm install
npm run dev       # http://localhost:4321
```

Other scripts:

```bash
npm run build      # type-check (astro check) + production build to dist/
npm run build:unsafe  # build without type-checking (faster, use for quick checks)
npm run preview     # preview the production build locally
npm run check       # run astro check only
```

## Project Structure

```
.pages.yml                 # Pages CMS configuration — see ARCHITECTURE.md
wrangler.toml               # Cloudflare Pages config
functions/api/lead.ts       # Cloudflare Pages Function — receives form submissions
public/                     # Static assets, robots.txt, _headers, _redirects
src/
  content.config.ts         # Content collection schemas (the CMS data model)
  content/                  # Actual content files (edited via Pages CMS or by hand)
    settings/global.yaml    # Site-wide settings (single file)
    services/                # One .md file per service
    projects/                # One .md file per completed project
    locations/                # One .md file per service area (county or city)
    reviews/                  # One .yaml file per customer review
    faqs/                     # One .yaml file per FAQ
    team/                     # One .md file per team member
    maintenance/               # One .md file per maintenance plan
    articles/                  # One .md file per resource/blog article
  layouts/BaseLayout.astro   # Global page shell (header, footer, SEO, sticky CTA)
  components/
    global/                  # Header, Footer, TrustBar, StickyMobileCTA
    sections/                # Homepage/service-page building blocks
    ui/                       # Button, Accordion, PlaceholderArt
    projects/, reviews/, faqs/, forms/
  lib/
    content.ts                # Published-only content query helpers
    schema.ts                  # JSON-LD structured data builders
    analytics.ts                # Vendor-agnostic analytics event bus
    leads.ts                    # Client-side lead submission helper
  pages/                     # File-based routes (see URL structure below)
```

## URL Structure

```
/
/services/                      /services/roof-repair/  (and other services)
/maintenance-plans/
/projects/                      /projects/[project]/
/service-areas/                 /service-areas/[area]/
/about/
/contact/
/assessment/                    the multi-step Roof Assessment funnel
/resources/                      /resources/[article]/
/privacy-policy/  /terms-of-service/
```

## Content Model / CMS

Content lives as Markdown (with frontmatter) and YAML files under `src/content/`,
validated against Zod schemas in `src/content.config.ts`. Pages CMS
(`.pages.yml`) edits these same files directly in the GitHub repo — there is
no separate CMS database. See **ARCHITECTURE.md** for how the pieces fit
together and **CMS-GUIDE.md** for day-to-day editing instructions written for
a non-technical user.

Every collection has a `published` boolean (or, for FAQs, defaults to
published). Nothing with `published: false` is rendered on the live site,
which is how draft content (unconfirmed city pages, template examples,
in-progress projects) stays safely out of production.

## Verified vs. Unverified Claims

Several fields in Business Settings carry a paired `value` / `verified: false`
shape — WA contractor license, GAF Master Elite status, insurance/bonding,
emergency availability claims, years of experience, and maintenance plan
pricing. **The frontend will not render these values publicly until
`verified` is set to `true`.** This is intentional — see
`CLIENT-CONTENT-NEEDED.md` for what still needs confirming before flipping
each one on.

## Forms & Lead Delivery

All lead capture (the Roof Assessment funnel, the Contact page form) calls
`submitLead()` in `src/lib/leads.ts`, which POSTs to `/api/lead` — a
Cloudflare Pages Function at `functions/api/lead.ts`. That function is
adapter-based:

- `LEAD_WEBHOOK_URL` (Cloudflare Pages environment variable) — if set, forwards
  the lead JSON to a CRM/GoHighLevel webhook.
- `RESEND_API_KEY` + `LEAD_NOTIFY_EMAIL` — if both are set, sends an email
  notification via Resend.
- If neither is configured, submissions still succeed (nothing is lost — every
  submission is logged server-side) but no one is notified. **Set at least
  one of these in the Cloudflare Pages dashboard before launch.**

Set these under Cloudflare Pages → Settings → Environment variables. Never
commit real credentials into this repo.

## Deployment (Cloudflare Pages)

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Node version:** 18 or later (set via Cloudflare Pages environment settings if needed)
- `functions/` is auto-detected by Cloudflare Pages as Pages Functions — no extra config needed.
- `public/_headers` and `public/_redirects` are applied automatically by Cloudflare Pages at the output root.

See **ARCHITECTURE.md** for the full request-flow diagram and
**CLIENT-CONTENT-NEEDED.md** for what's still needed before this goes live
for real.

## Troubleshooting

- **"Missing src/content/settings/global.yaml" error at build time** — the
  Business Settings file was deleted or renamed; every page depends on it.
- **A new CMS entry doesn't show up on the site** — check its `published`
  field is `true`, then rebuild (`npm run dev` picks up new content
  automatically; a live Cloudflare deploy needs a new build, which Pages CMS
  triggers automatically via its GitHub commit).
- **Pages CMS reports a schema error in `.pages.yml`** — Pages CMS's field
  syntax has shifted across versions; check the current schema at
  <https://pagescms.org/docs/configuration> against the field in question.
- **Images not showing** — confirm the path starts with `/images/...` and the
  file actually exists under `public/images/`.
