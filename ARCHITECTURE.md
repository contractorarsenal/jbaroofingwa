# Architecture

## System overview

```
   Editor (JBA office)
          │
          ▼
      Pages CMS  ──────────────►  GitHub repository (source of truth)
   (web UI, edits files             │
    via GitHub's API)               │  git push triggers
          ▲                          ▼
          │                    Cloudflare Pages build
          │                    (npm run build → Astro static site)
          │                          │
          │                          ▼
   Visitor's browser  ◄──────  Cloudflare CDN (dist/ output)
          │
          │  form submission (fetch POST /api/lead)
          ▼
   Cloudflare Pages Function (functions/api/lead.ts)
          │
          ├──► CRM / GoHighLevel webhook   (LEAD_WEBHOOK_URL, if configured)
          └──► Email notification (Resend)  (RESEND_API_KEY, if configured)
```

There is no separate CMS database and no server-rendered backend for content.
GitHub is the single source of truth. Pages CMS is a web UI that commits
changes directly to the same Markdown/YAML files Astro reads at build time.

## Why this stack

- **Astro, static output.** The site is fundamentally a content-driven
  marketing/lead-gen site, not an app — static generation gives the best
  Core Web Vitals with the least moving parts, and every page ships zero
  JavaScript unless a component explicitly needs it (the multi-step
  Assessment form, the before/after slider, the mobile menu).
- **Pages CMS instead of a hosted CMS.** No per-seat pricing, no separate
  database to keep in sync, no vendor lock-in — content is just files in the
  same repo the code lives in. An editor never touches Git directly; Pages
  CMS handles the GitHub commit for them.
- **Cloudflare Pages Functions for forms**, not a separate backend service —
  keeps the whole stack on one platform and avoids exposing any API keys to
  the browser.

## Content architecture

Defined in `src/content.config.ts` using Astro's Content Layer API. Each
collection has a Zod schema that Pages CMS's `.pages.yml` config mirrors
field-for-field — see the comment at the top of `.pages.yml`.

| Collection | Storage | Loader | Notes |
|---|---|---|---|
| `settings` | `src/content/settings/global.yaml` | `file()` | Singleton — one entry, id `global` |
| `services` | `src/content/services/*.md` | `glob()` | Filename = URL slug |
| `projects` | `src/content/projects/*.md` | `glob()` | Filename = URL slug |
| `locations` | `src/content/locations/*.md` | `glob()` | Counties (published) + city strategy pages (draft) |
| `reviews` | `src/content/reviews/*.yaml` | `glob()` | No body/markdown — pure data |
| `faqs` | `src/content/faqs/*.yaml` | `glob()` | No body/markdown — pure data |
| `team` | `src/content/team/*.md` | `glob()` | |
| `maintenance` | `src/content/maintenance/*.md` | `glob()` | Pricing gated behind `verified` |
| `articles` | `src/content/articles/*.md` | `glob()` | Resources/blog |

### Relationships

Collections reference each other via Astro's `reference()` (stored as
`{ collection, id }` in frontmatter, resolved with `getEntry()`/`getEntries()`
at build time — see `src/lib/content.ts`):

- A **service** can list related projects, FAQs, reviews, and locations.
- A **project** references its service and its location, and can name a
  related review.
- A **location** lists which services are offered there, plus local FAQs and
  nearby locations.
- A **FAQ** or **review** can attach to one or more services/locations,
  so a single FAQ entry can surface on a service page, a location page, and
  the homepage without being duplicated.

This is what lets, e.g., a Bellevue roof replacement project automatically
become eligible to appear on the homepage, the Roof Replacement service page,
and the Bellevue location page — it's queried by relationship
(`getProjectsForService`, `getProjectsForLocation` in `src/lib/content.ts`),
never copy-pasted.

### Publish gating

Every content type that can go live has a `published` boolean (FAQs default
to `true` since they're low-risk). All page-generating routes
(`getStaticPaths`) and all listing helpers in `src/lib/content.ts` filter on
`published`, so:

- Draft city pages (Seattle, Bellevue, Kirkland, Everett) exist as real CMS
  entries with the correct schema, but don't generate a live route or appear
  in navigation until `published: true`.
- The example project/team entries under `src/content/projects/` and
  `src/content/team/` are templates for the shape of a real entry — never
  live.

### Verified-claim gating

Distinct from `published`, several fields carry a `verified: false` flag
independent of the value itself — WA contractor license, GAF Master Elite
status, insurance/bonding, emergency availability, years of experience, and
maintenance plan pricing (`src/content.config.ts`, `settings` and
`maintenance` schemas). Components check `verified` before rendering the
value (see `TrustBar.astro`, `Footer.astro`, `about.astro`,
`maintenance-plans/index.astro`) — the same flag also gates the JSON-LD
schema builder in `src/lib/schema.ts`, so nothing gets asserted to search
engines that isn't shown on the page.

## SEO & structured data

- Per-page meta title/description/canonical/OG/Twitter via
  `src/components/seo/Seo.astro`, driven by each entry's `seo` object with
  sensible fallbacks to Business Settings.
- JSON-LD via `src/lib/schema.ts`: `RoofingContractor` (every page, in
  `BaseLayout.astro`), `Service` (service pages), `FAQPage` (any page with
  FAQs attached), `BreadcrumbList` (service/project/location pages). No
  `Review`/`AggregateRating` schema is emitted from fabricated data — it only
  reflects what's actually in the `reviews` collection and Business Settings.
- Sitemap via `@astrojs/sitemap`, generated automatically at build time from
  the actual static routes (so draft/unpublished pages, which never generate
  a route, can't leak into it).
- `public/robots.txt` points at the generated sitemap.

## Legacy URL migration

`public/_redirects` maps the previous jbaroofpro.com URL structure (crawled
2026-08-31) to the new one — e.g. `/roof-repair-in-king-county/` →
`/services/roof-repair/`, `/gallery/` → `/projects/`. Add further mappings
there as more legacy URLs are discovered (old paid-ad landing pages, etc.).

## Analytics

`src/lib/analytics.ts` exposes a single `trackEvent(name, payload)` function
and a `data-analytics-event="..."` HTML attribute convention
(`bindAnalyticsClicks()`, wired up globally in `BaseLayout.astro`) — no
component calls a vendor SDK directly. Events currently fire into
`window.dataLayer`, which is a no-op until a GTM container or GA4 tag is
added; wiring in a real vendor is a one-line change in `analytics.ts`, not a
site-wide refactor. See `CLIENT-CONTENT-NEEDED.md` for the analytics ID
still needed.

## Design system boundary

Editors control **content** (text, images, structured fields, publish
status) through Pages CMS. They cannot touch spacing, typography, color, or
layout — those live in `src/styles/global.css` (design tokens) and the
`.astro` component files, which are not exposed through the CMS in any way.
This is deliberate: see the brief's "standardize the infrastructure, not the
design" principle.
