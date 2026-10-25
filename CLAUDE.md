# CLAUDE.md — JBA Roofing website

Project instructions for Claude Code working on this repo. Facts here come from the repository, Git history, and the live site. Where something is unverified, it is marked **UNVERIFIED**. Do not treat UNVERIFIED items as fact in client-facing copy.

## Production safety (read first)

- **Every push to `main` is a production deployment.** Cloudflare Pages builds and publishes `main` automatically.
- Never force-push. Never `git reset --hard`. Never discard uncommitted changes.
- Never merge branches or PRs without explicit authorization.
- Never change DNS or Cloudflare settings without explicit approval.
- A successful `git push` is not a production success. After an authorized release, verify the Cloudflare deployment and the live site.
- Prefer a feature branch for non-trivial changes.
- Never commit `.env*`, `.dev.vars`, access tokens, private credentials, or customer data. `.gitignore` covers the env files, but check `git status` before every commit.
- Do not modify other client repositories.

## Business

- **Legal name:** JBA Roofing & Remodeling LLC. **Display name:** "JBA Roofing." (CLIENT-CONTENT-NEEDED.md and the unused logo file `public/images/brand/jba-logo.svg` say "JBA Construction." The header, footer, and hero use the image `jba-nav-logo.webp`. Four customer review quotes also say "JBA Construction"; do not edit those quotes. Unresolved; confirm before changing any name.)
- **Phone:** (206) 474-5996 (`+12064745996`). **Email:** contact.jbaroofing@gmail.com.
- **Address:** not verified. `displayPublicly: false`. Do not display an address.
- **Primary service area:** King County, WA. **Secondary:** Snohomish County, WA; Skagit County, WA.
- **Services listed as published:** Roof Repair, Roof Leak Repair, Storm Damage Repair, Roof Maintenance, Roof Inspection, Roof Cleaning & Moss Removal, Gutter Services, Roof Replacement, Roof Installation. The client has not confirmed this list.
- **Hours:** "Every day, 24 Hours" in settings. **UNVERIFIED**: CLIENT-CONTENT-NEEDED.md says emergency availability is unconfirmed.
- **Primary CTA:** "Book an Appointment" → `/assessment/`. Emergency CTA: "Call Now."

### Claims: verification status

Settings (`src/content/settings/global.yaml`) use a `value` + `verified` pattern. The frontend hides unverified values.

| Claim | Flag in settings | Status |
|---|---|---|
| Contractor license | `verified: true` | **UNVERIFIED** per CLIENT-CONTENT-NEEDED.md. Flag conflicts with checklist. |
| GAF Master Elite | `credential.verified: true` | **UNVERIFIED** per CLIENT-CONTENT-NEEDED.md, which says not to assert it until JBA confirms. Currently rendered publicly (About page, footer badge, GafCredential section). **Do not change without client confirmation.** |
| 24-hour emergency service | `verified: true` | **UNVERIFIED** per CLIENT-CONTENT-NEEDED.md. |
| "8+ Years Roofing Experience" | `verified: true` | Framed as crew experience. Never say "8+ years in business" (GAF lists JBA as in business since 2024). |
| Insurance / bonding | `verified: false` | Hidden. Do not show. |
| Financing "0 Down, 12 Months No Interest" | `financingOffer.verified: true` | **UNVERIFIED** per CLIENT-CONTENT-NEEDED.md. Provider intentionally unnamed. Do not name it without a client request. |
| Maintenance plan pricing | `verified` false until set | Unconfirmed. Do not show prices. |
| Google rating | 5.0, 101 reviews | From the client's Google Business Profile. No individual review text yet. |

Never invent warranty terms, award counts, project counts, or response-time SLAs. CLIENT-CONTENT-NEEDED.md lists them as deliberately unset.

## Stack and architecture

- **Astro** (`astro.config.mjs`), `output: 'static'`, `trailingSlash: 'always'`. Dependencies: `package.json`.
- **Node** `>=22.19.0` (`package.json` engines; `.node-version` also set).
- **Styling:** plain CSS design tokens in `src/styles/global.css`. No CSS framework. Fonts self-hosted via `@fontsource-variable/inter` and `@fontsource/barlow-condensed`.
- **Path aliases** (`tsconfig.json`): `@components/*`, `@layouts/*`, `@lib/*`, `@styles/*`.
- **Scripts** (`package.json`): `dev`, `build` (runs `astro check` then `astro build`), `build:unsafe`, `preview`, `check`, `deploy:pages` (runs `wrangler pages deploy dist --project-name=jbaroofingwa`). Do not run `deploy:pages` without authorization. It publishes directly, outside Git.
- **Content editing:** Pages CMS (`.pages.yml`) commits content changes directly to `main` via GitHub. **A client content edit is a production change**, so pull or check `git log` before assuming the local tree is current.

### Directories

- `src/content.config.ts`: Zod schemas for all collections (the source of truth for fields).
- `src/content/`: content files. Collections:
  - `settings/global.yaml`: single file, loaded with `file()`. Business settings.
  - `services/`, `projects/`, `locations/`, `team/`, `maintenance/`, `articles/`: Markdown, `glob('**/*.md')`.
  - `reviews/`, `faqs/`, `videos/`: YAML, `glob('**/*.yaml')`.
- `src/layouts/BaseLayout.astro`: page shell, head scripts, tracking, header, footer, sticky CTA, cookie notice.
- `src/components/`: `global/` (Header, Footer, StickyMobileCTA, TrustBar, CookieNotice, CredentialsStrip), `sections/` (Hero, WhyJBA, FinalCTA, GafCredential, ProblemSelector), `ui/` (Button, Accordion, TrustFacts, ComparisonPanel, InfoCardGrid, MediaSlot). ARCHITECTURE.md's mention of `PlaceholderArt` is stale; that component is not in the repo., `forms/` (ContactForm, AssessmentForm), `projects/`, `reviews/`, `faqs/`, `media/`, `seo/`.
- `src/lib/`: `content.ts` (published-only query helpers), `schema.ts` (JSON-LD builders), `analytics.ts`, `consent.ts`, `motion.ts`, `web3forms.ts`, `leads.ts`, `project-media.ts`.
- `functions/api/lead.ts`: Cloudflare Pages Function. **Not used by the current UI** (see Forms).
- `functions/_middleware.ts`: adds `X-Robots-Tag: noindex` on `*.pages.dev` hosts only.
- `public/`: `_headers`, `_redirects`, `robots.txt`, `favicon.svg`, `apple-touch-icon.png` (180px, rendered from the approved bear logo `images/brand/jba-nav-logo.webp` on `#080808`; the favicon is a different chevron mark), `images/` (brand, credentials, general, og, projects, videos).

### Publish gating

- Every collection has `published`. Nothing with `published: false` gets a route or appears in lists. Use the helpers in `src/lib/content.ts`.
- Draft city pages (Seattle, Bellevue, Kirkland, Everett) are `published: false`. Template entries under `projects/` and `team/` are never live.
- The Projects collection currently has no published real project. Pages show a graceful empty state.

### Verified-claim gating

Components check `verified` before rendering. The same flags gate the JSON-LD in `src/lib/schema.ts`. Keep this gating when editing.

## Pages and routes

- `/` (`index.astro`), `/services/` and `/services/[id]/`, `/maintenance-plans/`, `/projects/` and `/projects/[id]/`, `/service-areas/` and `/service-areas/[id]/`, `/about/`, `/contact/`, `/assessment/`, `/reviews/`, `/resources/` and `/resources/[id]/`, `/privacy-policy/`, `/terms-of-service/`, `/cookie-policy/`, `404.astro`.
- Legacy URLs from the old jbaroofpro.com site redirect via `public/_redirects` (32 lines, 301s, one 302 for rejuvenation). Add mappings there; do not edit the existing ones casually.

## Assessment funnel and contact form

- `src/components/forms/AssessmentForm.astro` (multi-step roof assessment with optional photo) and `src/components/forms/ContactForm.astro`.
- **Both post to Web3Forms** (`https://api.web3forms.com/submit`). The access key is hardcoded in `src/lib/web3forms.ts` and in the form markup. It is public by design; do not treat it as a secret, and do not print it in reports.
- **Destination email is set in the Web3Forms dashboard, outside this repo. UNVERIFIED.**
- Honeypot field `company_website` (hidden) is present in both forms.
- Analytics events fire on form start and success.
- Do not submit test leads. Do not change form behavior without authorization.

## Web3Forms and the legacy lead Function

- The live forms bypass `functions/api/lead.ts` entirely. `src/lib/leads.ts` (`submitLead()`) is still in the code but not called by the forms. `web3forms.ts` says it is "legacy infrastructure, kept rather than removed."
- **Stale documentation:** README.md, ARCHITECTURE.md, DEPLOYMENT.md (§2, §8), and CLIENT-CONTENT-NEEDED.md still describe `LEAD_WEBHOOK_URL`, `RESEND_API_KEY`, and `LEAD_NOTIFY_EMAIL` as the lead path. Do not rely on those docs for lead delivery.
- Lead Function env vars in `wrangler.toml` and `.env.example` (`LEAD_WEBHOOK_URL`, `RESEND_API_KEY`, `LEAD_NOTIFY_EMAIL`, `SITE_URL`) are names only. Real values live in the Cloudflare dashboard, not the repo.

## Cloudflare Pages and Functions

- **Project:** `jbaroofingwa` (`wrangler.toml`; confirmed by the Cloudflare check run on GitHub).
- **Build:** `npm run build` (includes `astro check`), output `dist/`.
- **Functions:** `functions/` is auto-detected as Pages Functions.
- **Headers and redirects** are applied from `public/_headers` and `public/_redirects` at the output root.
- **Preview:** each deployment gets a `<hash>.jbaroofingwa.pages.dev` URL (verified on the latest `main` build). Preview-branch behavior is UNVERIFIED beyond that.
- **Production domain:** `jbaroofpro.com` serves the same build as the preview URL (verified). Cloudflare's custom-domain mapping is **UNVERIFIED** (no dashboard access from here).
- **`wrangler.toml` does not prove the production configuration.** Confirm the dashboard before any production assumption.

## Analytics, tracking, and consent

**Client-owned** (IDs in `src/content/settings/global.yaml`):
- GA4 `G-56TWWG48L5`. Loads only on production builds, via `BaseLayout.astro`.
- GTM `GTM-TRSW9C3F`. Loads on production builds. The container is documented as empty.
- Microsoft Clarity `yc85tlw8bi`. Loads only after analytics consent (`src/lib/consent.ts`), never on localhost.

**Brand Market Media** (hardcoded in `src/layouts/BaseLayout.astro`):
- GA4 `G-YR9BH2V793`. Configured with `gtag('config')` on every production page, alongside the client's GA4.
- GTM `GTM-599J59F2`. Loads on **every production page with no consent gating.** It is injected in `<head>` on every production build and runs before any consent choice. (The client's GTM `GTM-TRSW9C3F` and GA4 `G-56TWWG48L5` load under the same Consent Mode defaults, and analytics storage stays denied until the visitor accepts.)
- **Ownership and disclosure: UNVERIFIED.** The privacy policy should be checked against this. Commits `1aca2c5`, `3754d65`, and `371ce0c` added them.
- Public container scripts (read-only fetch of `googletagmanager.com/gtm.js`): `GTM-599J59F2` contains Google Ads ID `AW-18373436953` (10 `awct` conversion tags) and the client's GA4 `G-56TWWG48L5`. `BaseLayout.astro` says "We are not installing Google Ads." **That conflicts with the container. Unresolved.** `GTM-TRSW9C3F` (client) also contains GA4 configuration tags, although `global.yaml` calls it empty. These findings come from public script contents, not the GTM admin UI. `GTM-TRSW9C3F` also contains Clarity project `yc85tlw8bi`, so Clarity fires on every production page **even with analytics consent denied** (observed). That contradicts the settings comment and `BaseLayout.astro`, which load Clarity only after consent. The fix belongs in the client's GTM (add a consent trigger to the Clarity tag), which needs owner access.
- Consent is initialized too late for the Brand Market container. In `BaseLayout.astro`, `GTM-599J59F2` is injected before the `gtag('consent','default')` block. Observed: with consent denied, page-view pings still reached `G-56TWWG48L5`, `G-YR9BH2V793`, and `AW-18373436953`. Consent Mode defaults do not block these tags. Each property received one page view per load (no duplicate page views observed).

Consent model: Google Consent Mode defaults are `analytics_storage: denied` unless the visitor previously accepted (`localStorage` key `jba_cookie_consent`). `ad_*` signals are always denied. `src/layouts/BaseLayout.astro` and `src/lib/consent.ts` both read the key.

Event routing (observed in a mocked-route test that blocked all analytics hosts from leaving the machine): page views reach both `G-56TWWG48L5` and `G-YR9BH2V793`. Custom events were not captured by that test, so their routing is **UNVERIFIED**. The config (both IDs in one `gtag` instance) suggests both properties receive them.

Event bus: `src/lib/analytics.ts` exposes `trackEvent()` and `data-analytics-event` attributes. Never pass PII (name, phone, email, address, ZIP, form answers) as an event parameter.

**Do not modify, remove, or duplicate any tracking integration without explicit authorization.**

## SEO, redirects, sitemap, and structured data

- `@astrojs/sitemap` generates the sitemap at build time from real routes. Filters out `/thank-you` and `/preview`.
- `public/robots.txt` points to `https://jbaroofpro.com/sitemap-index.xml`.
- `astro.config.mjs` canonical URL resolution: `SITE_URL` env → on branch `main` (`CF_PAGES_BRANCH`), `https://jbaroofpro.com` → `CF_PAGES_URL` (the per-deployment `*.pages.dev` URL, used by preview builds) → `https://jbaroofpro.com`. Before this rule, the live site's canonicals, `og:url`, JSON-LD, and sitemap all pointed at a `*.pages.dev` hash host (verified on the live site; fixed on branch `seo/jba-search-audit`, not yet deployed). Staging deploys must not claim production canonicals.
- Per-page meta via `src/components/seo/Seo.astro`. JSON-LD via `src/lib/schema.ts`: `RoofingContractor` (every page), `Service`, `FAQPage`, `BreadcrumbList`. No `Review` or `AggregateRating` schema is emitted from data that isn't on the page. The homepage also has a `WebSite` entity (`buildWebSiteSchema` in `src/lib/schema.ts`: name "JBA Roofing", alternateName the legal name), passed through the layout's `jsonLd` prop. The layout and `Seo.astro` accept `canonicalPath`; the 404 page uses `canonicalPath="/"` so it does not canonicalize to a nonexistent URL.

## GitHub and deployment workflow

- **Remote:** `https://github.com/contractorarsenal/jbaroofingwa.git`, `origin`. Local `main` tracks `origin/main`. Verified clean at `371ce0c` at setup.
- **Remote branches:** `main` (production) and `pages.yml` (contains only `index.html`, commit `6221e1a`). **Purpose UNVERIFIED.** Do not merge or delete it without checking.
- **No open PRs** at setup time.
- **GitHub Actions:** no workflow file in the repo. `pages-build-deployment` is GitHub's built-in Pages workflow.
- **GitHub Pages:** enabled on the repo (legacy, `main` root). Its Jekyll build has failed on recent runs. `contractorarsenal.github.io/jbaroofingwa/` currently returns 404. **Known issue**: this is a separate publishing path for repo files. Do not change it without authorization.
- **Cloudflare Pages** is the real production path. Its check run appears on each `main` commit.
- Author identity is set in the repo's local config only: `Jay Duran <259208228+contractorarsenal@users.noreply.github.com>`. Do not change global Git config.
- Git ignore already covers `node_modules/`, `dist/`, `.astro/`, `.env*`, `.dev.vars*`, `.wrangler/`, `.vscode/*` (except `extensions.json`), and `.DS_Store` (also in `.git/info/exclude`).

## Remote development commands

**"Check website"** — read-only. Inspect the site (routes, content, links, config) and report. Do not modify files. Verify live status with read-only HTTP requests if asked.

**"Update website"** — make requested changes locally on a branch when the change is non-trivial, run `npm run check` or `npm run build` when the change touches code or content schemas, and report results. **Do not push automatically.**

**"Push live"** — review all pending changes (`git status`, `git diff`, `git log origin/main..main`), confirm the target branch is `main` and the production domain, run `npm run build` (with `astro check`), and push **only the changes the user explicitly authorized**, to `origin main`. After the push, verify the Cloudflare check run succeeded and that `https://jbaroofpro.com` serves the expected change. Report the verified result, not just the push.

**"Status"** — concise: branch and tracking state, `git status`, last 5 commits, open PRs if checked, and outstanding issues from the list below.

**"Refresh context"** — read only the Git log since the last known commit (`371ce0c` as of setup), the files those commits changed, and any changed documentation. Do not rescan the whole repo.

## Known issues (do not fix automatically)

1. **GAF Master Elite** is rendered publicly while CLIENT-CONTENT-NEEDED.md says not to assert it until confirmed.
2. **Contractor license and 24-hour emergency claims** are flagged `verified: true` in settings, but the checklist lists them as unconfirmed.
3. **Business name** inconsistent: "JBA Roofing" vs "JBA Construction," and the LLC name differs between settings and the checklist.
4. **Secondary tracking** (Brand Market Media GTM `GTM-599J59F2` and GA4 `G-YR9BH2V793`): ungated GTM, ownership and disclosure unconfirmed.
5. **Outdated lead-delivery docs**: README, ARCHITECTURE, DEPLOYMENT §2 and §8, CLIENT-CONTENT-NEEDED.md describe the `/api/lead` path. Live forms use Web3Forms.
6. **GitHub Pages legacy build** fails on recent runs and remains enabled on `main`.
7. **`pages.yml` branch** with `index.html` only. Purpose unknown.
8. **Cloudflare custom-domain mapping** for `jbaroofpro.com` not independently verified.
9. **Missing content**: no published real projects, no team entries, no individual review text, no articles, no drone footage. (The header, footer, and hero use `jba-nav-logo.webp`; `jba-logo.svg` is unused.)
10. **Maintenance pricing and financing claims** require client verification.
11. **CLIENT-CONTENT-NEEDED.md says the analytics ID is still needed**, but `global.yaml` has GA4 `G-56TWWG48L5`. Stale.
12. **No Content-Security-Policy header** (deliberately deferred per DEPLOYMENT §9).
13. **Canonical host** (fixed on `seo/jba-search-audit`, not yet deployed): production canonicals, `og:url`, JSON-LD, and sitemap pointed at a `*.pages.dev` hash. After the next `main` deploy, verify these show `https://jbaroofpro.com/`.
14. **Google Ads tag `AW-18373436953`** inside `GTM-599J59F2`, which conflicts with the code comment saying Google Ads is not installed. Ownership decision needed before any change.
15. **Preview hosts (fixed on branch, not yet deployed).** `functions/_middleware.ts` adds `X-Robots-Tag: noindex, nofollow` to every response on `*.pages.dev` hosts (hash deployments, branch aliases). Verified under `wrangler pages dev` with Host headers. The production host is unaffected. Deployments already live keep their old headers until redeployed. Do not add `*.pages.dev` to robots.txt (blocking would hide the noindex).
16. **Clarity loads without consent** through the client's GTM `GTM-TRSW9C3F` (see Tracking). Client-owner fix needed.
17. **Brand Market container loads before the consent default** (`BaseLayout.astro` ordering). Changing it alters tracking, so it needs approval.

## Working with this repo efficiently

- Read this file first. Then use targeted searches (`rg`, specific paths). Do not read all files.
- Exclude `node_modules/`, `dist/`, `.astro/`, `.wrangler/`, and `package-lock.json` from searches.
- Do not run builds or tests unless the change requires it.
- Keep reports concise.
