# Deployment Guide

This document is the single source of truth for getting this repository
running on Cloudflare Pages, connecting Pages CMS, and eventually moving the
live domain over. It reflects what was actually inspected and verified in
this repo — not generic Cloudflare Pages instructions.

---

## 1. Cloudflare Pages Project Settings

| Setting | Value | Why |
|---|---|---|
| Framework preset | **Astro** | `astro.config.mjs` present, `astro` in `dependencies` |
| Build command | `npm run build` | Runs `astro check && astro build` — type-checks before building so a broken build fails loudly in CI rather than shipping silently |
| Build output directory | `dist` | `astro.config.mjs` has no custom `outDir`; confirmed by an actual local build — this is also declared in `wrangler.toml`'s `pages_build_output_dir` |
| Root directory | `/` | Single-package repo, no monorepo structure |
| Node version | **20** | Pinned via `.node-version` (Cloudflare Pages reads this automatically). Local development happened on Node 26, but that's a very new non-LTS line unlikely to be available in Cloudflare's build image — 20 is the safe, current LTS choice. **NOT VERIFIED YET against an actual Cloudflare build** — if the first build log shows a different Node version was used, override it by setting a `NODE_VERSION` environment variable in the Pages dashboard instead. |
| Package manager | npm | `package-lock.json` is committed; no `pnpm-lock.yaml` or `yarn.lock` present |
| Install command | Default (`npm install`) | Nothing non-standard required |
| Functions | Auto-detected from `/functions` | Cloudflare Pages automatically picks up `functions/api/lead.ts` — no dashboard config needed for this |
| Compatibility date | `2026-08-01` | Set in `wrangler.toml`; also pass `--compatibility-date=2026-08-01` if ever running `wrangler pages dev` manually without picking up the toml |
| Compatibility flags | None required | The one Function in this repo only uses `fetch`/`Request`/`Response`/`JSON`/`Promise` — all standard, no flags needed |

### Astro output mode: static, not SSR

`astro.config.mjs` has `output: 'static'`. Every route in `src/pages/` is
pre-rendered at build time — confirmed by an actual `astro build` producing
24 static HTML files in `dist/`, with zero server-rendered routes. **There is
no Cloudflare adapter installed or needed** (`@astrojs/cloudflare` is not in
`package.json`) — that adapter is only required for Astro SSR mode, which
this project does not use.

The dynamic behavior (the Roof Assessment form's lead submission) is handled
entirely outside Astro, by a hand-written Cloudflare Pages Function at
`functions/api/lead.ts`. This is the correct, lower-complexity pattern for a
mostly-static site that only needs one small API endpoint — it coexists with
static Astro output automatically; Cloudflare Pages serves `/functions/*`
routes and falls through to the static `dist/` output for everything else.
**Verified locally** by running `npx wrangler pages dev dist` (the real
Cloudflare Functions runtime, not `astro dev`/`astro preview`) and confirming
both static pages and `/api/lead` work from the same server.

---

## 2. Environment Variables

| Variable | Purpose | Used in | Secret? | Required for staging? | Required for leads to actually arrive? | Missing behavior |
|---|---|---|---|---|---|---|
| `LEAD_WEBHOOK_URL` | Forwards every lead as JSON to a CRM/GoHighLevel webhook | `functions/api/lead.ts` | Secret (treat as one — it's a bearer-less POST target) | No | Yes (this or the two below) | Webhook delivery is skipped entirely; verified locally that the site still builds, the form still submits, and the response correctly reports `configured:false` rather than pretending success |
| `RESEND_API_KEY` | Auth for sending a lead-notification email via Resend | `functions/api/lead.ts` | **Secret** | No | Yes (paired with `LEAD_NOTIFY_EMAIL`) | Email step is skipped; same safe `configured:false` behavior, verified locally |
| `LEAD_NOTIFY_EMAIL` | Destination address for the email notification | `functions/api/lead.ts` | Plain text (an email address, but treat as configuration not a public value) | No | Yes (paired with `RESEND_API_KEY`) | Same as above — email step is skipped without it |
| `SITE_URL` | Overrides the canonical/OG/sitemap base URL | `astro.config.mjs` (build-time only) | Plain text | No | N/A | Falls back to Cloudflare's own `CF_PAGES_URL`, then to the hardcoded `https://jbaroofpro.com` — see §7 |

No other environment variables are referenced anywhere in the repository —
confirmed by grepping for `import.meta.env`, `process.env`, and `env.` across
`src/` and `functions/`. There are no `PUBLIC_*` client-exposed variables at
all, so nothing here can leak into the browser bundle.

`CF_PAGES`, `CF_PAGES_BRANCH`, `CF_PAGES_COMMIT_SHA`, and `CF_PAGES_URL` are
provided automatically by Cloudflare on every build/Function invocation —
confirmed by inspecting `wrangler pages dev`'s own startup log, which lists
them as bindings. Nothing needs to be set for these to exist.

### Safe missing-env behavior (verified, not assumed)

Tested directly against the real Cloudflare Functions runtime
(`wrangler pages dev`), not just `astro dev`:

1. **No env vars set at all** → `POST /api/lead` still returns
   `{"ok":true,"configured":false,"delivered":false}` (HTTP 200). The
   submission is logged server-side (visible in Cloudflare's Function logs)
   so nothing is silently lost, but the response is honest that nothing was
   actually forwarded anywhere.
2. **`LEAD_WEBHOOK_URL` set and reachable** → `{"ok":true,"configured":true,"delivered":true}`; confirmed the mock endpoint actually received the correct JSON payload.
3. **`LEAD_WEBHOOK_URL` set but unreachable** → `{"ok":true,"configured":true,"delivered":false}`, with the real error (`"Network connection lost."` in the local test) logged server-side only — never sent to the client.
4. **Malformed/oversized `photo` field** → clean `400 {"ok":false,"error":"Invalid or oversized photo"}`, not a crash or stack trace.
5. **Invalid JSON body** → clean `400 {"ok":false,"error":"Invalid JSON"}`.
6. **`GET /api/lead`** → clean `405 {"ok":false,"error":"Method not allowed"}`.

No scenario produces a stack trace, an uncaught exception, a blank page, or a
false "delivered" claim.

---

## 3. Build / Runtime Verification

| Check | Result |
|---|---|
| `astro check` (type-check) | ✅ 0 errors (was 16 at the start of this audit — see §11) |
| `astro build` | ✅ 24 pages generated, ~1.0MB total output |
| Cloudflare Functions runtime (`wrangler pages dev`) | ✅ Verified — static pages and `/api/lead` both served correctly from one process |
| Full Roof Assessment funnel, end-to-end | ✅ Verified via browser automation against the real Functions runtime: ZIP validation, need selection, context step, timeline+insurance, **real photo upload with actual file bytes transmitted**, contact form, submission, confirmation screen |
| Routes | ✅ All 24 routes return 200 except the two that should 404 (an intentionally-unpublished template project, and a nonexistent URL) |
| Redirects | ✅ 6 legacy URL mappings parsed successfully by `wrangler pages dev` ("Parsed 6 valid redirect rules") |
| Headers | ✅ 6 header rules parsed successfully by `wrangler pages dev` ("Parsed 6 valid header rules") |
| SEO | ✅ Unique title/description per page confirmed across all 24 routes; single `<h1>` per page confirmed by grepping built HTML (not the Astro dev toolbar, which inflates counts — see §11) |
| Schema (JSON-LD) | ✅ Verified both states directly: with `verified: false` (default), no GAF/license claim appears anywhere in HTML or JSON-LD; with `verified: true` (temporary test, reverted), the claim and a proper `PropertyValue` schema node both appear correctly |
| Asset paths | ✅ No absolute `/Users/...` paths anywhere in source; all image references in content match actual files on disk byte-for-byte (case-sensitive check, relevant since macOS is case-insensitive by default but Cloudflare's Linux build environment is not) |
| Mobile viewports | ✅ 320/375/390/430/768px all checked — zero horizontal overflow, sticky mobile CTA confirmed visible at every width under 1080px |

---

## 4. Pages CMS Connection Steps

You've never connected Pages CMS before — here's exactly what to do with
this repository:

1. Go to **[pagescms.org](https://pagescms.org)**.
2. Click **Sign in with GitHub**. Authorize the Pages CMS GitHub App when
   prompted — it will ask for repository access (you can scope it to just
   this one repo rather than all of your repos).
3. Once signed in, click **Add a project** (or equivalent "connect a
   repository" action) and select this repository from the list.
4. Pages CMS looks for a `.pages.yml` file **at the root of the repository**
   — it's already there, committed, so it should be picked up automatically
   as soon as the repo is connected. If it isn't detected, check that the
   branch Pages CMS is pointed at actually contains `.pages.yml` at the root
   (not inside a subfolder).
5. Pages CMS reads `.pages.yml` to discover collections — you should see
   **Business Settings, Services, Projects, Service Areas, Reviews, FAQs,
   Team, Maintenance Plans, Resources / Articles** listed as sections.
6. **Branch:** point Pages CMS at `main` to start. (See §5 for why this is
   the recommended choice for this project specifically, and the safer
   alternative if you want a review step.)
7. **Image uploads:** configured via the top-level `media:` key in
   `.pages.yml` — uploads are written into `public/images/` in the repo and
   referenced by editors as `/images/...` paths, which is exactly how the
   existing content (logo, OG image) already references images. No separate
   media host is involved.
8. **Edits become Git commits automatically** — every save in Pages CMS
   commits directly to the connected branch via GitHub's API. There is no
   separate "publish" step in Pages CMS itself.
9. **Branch/PR workflow:** Pages CMS can be configured to commit straight to
   `main`, or to open a pull request per change, depending on the
   `settings.mergeMode` behavior it exposes (test this after connecting —
   the exact toggle location is a Pages CMS UI detail, **not verified yet**
   since it requires an actual account to click through).
10. **Test with one fake entry:**
    - Go to **Projects → Add new**.
    - Fill in a Project Name like "Test Entry — Delete Me", a City, and a
      short Project Summary. Leave **Published** OFF.
    - Save.
11. **Verify the resulting commit:** go to the repository on GitHub → check
    the commit history on the branch Pages CMS is writing to. You should see
    a new commit (likely authored by a Pages CMS bot/app identity) adding a
    file like `src/content/projects/test-entry-delete-me.md`.
12. **Verify Cloudflare sees it:** if the repo is already connected to
    Cloudflare Pages by this point, that commit triggers a new build
    automatically — check the **Deployments** tab in the Cloudflare Pages
    dashboard for a new build matching that commit hash.
13. **Delete the test entry** the same way — open it in Pages CMS and use its
    delete action (or delete the file directly on GitHub) — either produces
    a normal commit.
14. **To revert a bad CMS change:** go to the file's history on GitHub (the
    "History" button on any file page) and either revert the specific commit
    (`git revert <sha>` if working locally, or GitHub's own "Revert" button
    on the commit/PR) or restore the previous version of the file directly
    from GitHub's UI. Since Pages CMS writes plain Git commits, every normal
    Git recovery method works — there is no CMS-side undo separate from Git.

---

## 5. CMS → GitHub → Cloudflare Workflow

```
Developer change → git commit → GitHub → Cloudflare auto-build → deployed
JBA CMS edit     → Pages CMS  → git commit → GitHub → Cloudflare auto-build → deployed
```

**Recommended branch strategy for this client:** Pages CMS commits directly
to `main`, and `main` is Cloudflare's production branch.

Why this is the safer practical choice here, not just the simplest one:
- JBA's edits are content only (Pages CMS cannot touch layout/code — see
  `ARCHITECTURE.md`'s design-system boundary), so the blast radius of a bad
  CMS edit is limited to wrong text/images/publish-state, not a broken build.
- Every collection has a `published` boolean specifically so a half-finished
  edit doesn't go live by accident — the safety mechanism is already in the
  content model, not the Git workflow.
- A PR-per-edit workflow would require someone to actively review and merge
  every phone-number tweak or FAQ edit, which doesn't match "simple enough
  for an office manager" from the original brief.
- If a bad edit does reach `main`, §4 step 14 (Git revert) fully recovers it.

**Preview deployments:** enable them in Cloudflare Pages (they're on by
default for Pages projects connected to GitHub) so that any **developer**
branch/PR gets its own preview URL automatically — this is independent of
how Pages CMS itself is configured, and costs nothing to leave on. Recommend
production still only deploys from `main`.

---

## 6. Staging Deployment Checklist

Run through this on the `*.pages.dev` URL before ever touching DNS.

**Desktop**
- [ ] Homepage hero, intent router, and all sections render correctly
- [ ] Header nav + Services dropdown work
- [ ] Footer links resolve

**Mobile** (already verified locally at 320/375/390/430/768px — re-check on the actual deployed URL)
- [ ] No horizontal scroll on any page
- [ ] Sticky call/quote bar visible and tappable
- [ ] Hamburger menu opens/closes correctly

**Forms**
- [ ] Full Roof Assessment funnel: submit with no photo, submit with a photo
- [ ] Contact page form submits
- [ ] Check Cloudflare Pages Function logs (Dashboard → your project →
      Functions → Real-time Logs, or `wrangler pages deployment tail`) to
      confirm submissions are actually being logged even before CRM
      credentials are set

**SEO**
- [ ] View source on 2–3 pages, confirm `<title>`/meta description are
      unique and NOT pointing at `jbaroofpro.com` in canonical/OG tags —
      they should now match the `*.pages.dev` staging URL (see §7 — this is
      the one thing that specifically needs re-verifying once actually built
      on Cloudflare, since it depends on `CF_PAGES_URL` being populated at
      build time, which could only be confirmed on Cloudflare's own infra)
- [ ] `/sitemap-index.xml` loads and lists the staging domain, not jbaroofpro.com
- [ ] `/robots.txt` loads

**CMS**
- [ ] Add and delete one test entry per §4, confirm it triggers a Cloudflare rebuild

**Pages Functions**
- [ ] `/api/lead` responds (test via the form, not by hitting it directly with GET — that should 405)

**Redirects**
- [ ] Visit `/roof-repair-in-king-county/` on the staging URL → confirms 301 to `/services/roof-repair/`
- [ ] Visit `/gallery/` → confirms 301 to `/projects/`
- [ ] Visit `/home/` → confirms 301 to `/`

**Headers**
- [ ] Check response headers on a page (browser devtools → Network) for
      `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`

**Images**
- [ ] Confirm no broken images anywhere (there shouldn't be any — every
      referenced image was verified to exist on disk — but re-check after a
      real Cloudflare build since local `dist/` and Cloudflare's build
      environment are not guaranteed identical)

**Analytics**
- [ ] None configured yet — nothing to check until an analytics ID is added
      (see `CLIENT-CONTENT-NEEDED.md`)

**Performance**
- [ ] Run Lighthouse against the staging URL (this cannot be meaningfully
      tested against `localhost` — Cloudflare's edge caching and real
      network conditions matter for an accurate score) — **NOT VERIFIED YET**

**404**
- [ ] Visit a nonsense path on the staging URL, confirm the styled 404 page
      appears (not Cloudflare's own generic error page)

---

## 7. Domain / Base URL Architecture

**Problem found and fixed during this audit:** `astro.config.mjs` previously
hardcoded `site: 'https://jbaroofpro.com'`. Since every canonical URL,
OpenGraph URL, JSON-LD `url` field, and sitemap entry is derived from
`Astro.site`, a staging deployment on `*.pages.dev` would have falsely
claimed `jbaroofpro.com` as its canonical domain — actively wrong while that
domain isn't pointed here, and confusing if the old site is still live there
during the transition.

**Fix:** `astro.config.mjs` now resolves the site URL in this order:

1. `SITE_URL` environment variable, if explicitly set (intended for the
   Cloudflare "Production" environment once the real domain is live).
2. `CF_PAGES_URL`, which Cloudflare automatically provides on every build —
   confirmed this variable is real and populated by inspecting `wrangler
   pages dev`'s own runtime bindings (though that confirms it at
   **Function-runtime** scope, not proven yet at **build-time** scope inside
   Cloudflare's actual CI — see the caveat below).
3. A hardcoded fallback of `https://jbaroofpro.com`, used only for local
   builds run outside Cloudflare Pages entirely.

**NOT VERIFIED YET:** whether `CF_PAGES_URL` is populated inside the Node
build process specifically (as opposed to the Functions runtime, which *is*
confirmed). This can only be confirmed by an actual Cloudflare Pages build —
to verify, after the first deploy, view-source on any page and check the
`<link rel="canonical">` value: it should show the `*.pages.dev` staging URL,
not `jbaroofpro.com`. If it incorrectly shows `jbaroofpro.com`, that means
`CF_PAGES_URL` wasn't available at build time, and `SITE_URL` should be
explicitly set to the `*.pages.dev` URL on the Preview/staging environment
instead as a manual override.

**Going live later:** once DNS is pointed at Cloudflare, add one environment
variable — `SITE_URL=https://jbaroofpro.com` scoped to the Production
environment — and trigger a rebuild. Every canonical/OG/sitemap URL across
all 24+ pages updates in that single change. No file edits required.

---

## 8. Lead Delivery Activation

Current state: submissions succeed and are durably logged server-side, but
nothing is forwarded anywhere yet.

To activate real delivery, add **one or both** of these in Cloudflare Pages
→ Settings → Environment variables:

**Option A — CRM/webhook:**
- Add `LEAD_WEBHOOK_URL` = the CRM's webhook ingestion URL (e.g. from
  GoHighLevel or another CRM's inbound webhook feature).
- No code change needed — `functions/api/lead.ts` already posts the full
  lead JSON (minus any photo, which isn't sent to generic webhooks — see
  below) to this URL on every submission.

**Option B — Email notification (via Resend):**
- Create a Resend account and API key.
- Add `RESEND_API_KEY` and `LEAD_NOTIFY_EMAIL` (the inbox that should
  receive lead notifications).
- If a photo was attached to the Roof Assessment, it's sent as a real email
  attachment (base64-decoded by Resend) — this was verified end-to-end
  locally, including the actual `FileReader` → base64 → POST body →
  attachment path, not just the metadata.

Both can be enabled simultaneously. Neither is required for the site to
build or the form to "work" from the visitor's perspective — but at least
one is required for a real human to ever see a submitted lead.

**Payload fields sent:** formName, zip, need, symptoms, timeline,
isInsuranceClaim, name, phone, email, address, preferredContact, notes,
photoCount, photo (email only), photoName, path, referrer.

**Spam protection:** a hidden honeypot field (`company_website`) — if
filled in (which only a bot would do), the request returns a normal-looking
`200 {"ok":true}` with no delivery attempted, so bots get no signal they
were caught.

**Photo constraints:** capped at 6MB client-side before encoding, with a
10MB server-side backstop on the resulting base64 string; rejected with a
clean 400 if malformed or oversized rather than silently dropped or crashing.

---

## 9. Security / Performance Issues Found

**Fixed during this audit:**
- **Misleading delivery-success reporting** — `functions/api/lead.ts`
  previously reported every submission as "delivered" via
  `Promise.allSettled`'s fulfilled/rejected status, even when no CRM/email
  was configured at all (a no-op "success" was indistinguishable from a real
  one) and even when a webhook returned a non-2xx HTTP status (fetch doesn't
  reject on HTTP error codes). Rewrote to track `attempted`/`ok` explicitly
  per channel — verified all three real states (unconfigured, configured
  + working, configured + failing) against the live Functions runtime.
- **Photo upload was cosmetic** — the file picker updated a "N photo
  selected" label and fired an analytics event, but the actual file was
  never included in the request; only a count. Now reads the file via
  `FileReader`, encodes to base64 client-side with a size cap, and the
  server validates and forwards it as a real email attachment. Verified
  end-to-end with an actual file upload through the browser.
- **Hardcoded production domain in canonical/sitemap generation** — see §7.
- **Server-side log spam risk** — the lead handler's `console.log` would
  have dumped a multi-MB base64 photo into Cloudflare's function logs on
  every photo submission; now explicitly strips it before logging.

**Reviewed, no change made (deliberately):**
- **No Content-Security-Policy header** — none was added. Adding one
  speculatively risks breaking Pages CMS, a future analytics vendor, or
  fonts/images in ways that can't be verified without those integrations
  actually in place. Flagged as a follow-up once analytics/CRM vendors are
  finalized, not done now, per the instruction not to guess at header
  effects.
- **No file-type allowlist beyond `accept="image/*"`** on the photo input —
  this is a client-side hint only (any file type could technically be
  POSTed directly to the API). The server checks the value starts with
  `data:image/` before accepting it, which is a reasonable, low-effort
  backstop for a low-risk internal-facing lead form; not hardened further
  than that since there's no file storage/execution risk here (nothing is
  ever written to disk or served back — it's forwarded to Resend/webhook
  only).
- **CORS** — not configured, and doesn't need to be: the form is only ever
  submitted from same-origin pages, and the honeypot/validation already
  protects the endpoint from being a useful open target.

**Performance — reviewed, healthy:**
- Total build output ~1.0MB across 24 pages.
- Per-page JS chunks are 4–8KB uncompressed; no framework runtime shipped.
- Fonts self-hosted via `@fontsource-variable` (zero third-party font
  requests).
- Hero image is not lazy-loaded (correct — it's the LCP element); below-fold
  images (`ProjectCard`) are lazy-loaded correctly.
- No dev-only or `/Users/...`-referencing assets anywhere in `public/` or
  content.

---

## 10. Rollback Strategy

- **Bad Git commit reaches `main`:** `git revert <sha>` and push (or use
  GitHub's "Revert" button on the commit/PR) → Cloudflare auto-deploys the
  revert like any other commit.
- **Cloudflare deployment itself is broken** (e.g. a bad build succeeds but
  the runtime misbehaves): Cloudflare Pages keeps every previous deployment
  — go to the project's **Deployments** tab and use **Rollback to this
  deployment** on the last known-good one. This is instant and doesn't
  require a Git operation at all.
- **A Pages CMS edit breaks the site:** same as "bad Git commit" above —
  Pages CMS edits are plain commits, so Git history is the recovery
  mechanism (see §4 step 14).
- **Form backend breaks:** the site itself is unaffected (static pages don't
  depend on the Function) — only `/api/lead` is impacted. Check Cloudflare's
  Function real-time logs first; worst case, redeploy the previous working
  commit for `functions/api/lead.ts` specifically.
- **Domain migration goes wrong:** see §7 of the domain migration plan below
  — DNS changes are reversible by reverting the DNS record, and the old host
  should stay untouched/unchanged until the new deployment is fully verified
  (see next section).

---

## 11. What Changed During This Audit

This was a verification and hardening pass on the existing, already-built
site — no redesign, no framework change, no content-model change beyond what
was required to fix real bugs found:

1. `astro.config.mjs` — site URL now resolves per-environment instead of
   being hardcoded (§7).
2. `functions/api/lead.ts` — delivery-result tracking rewritten so
   "delivered" is never falsely reported; photo now actually forwarded (as a
   real email attachment) instead of discarded; added server-side photo
   validation/size cap; stopped logging raw photo bytes.
3. `src/lib/leads.ts` — added `photo`/`photoName` to the payload type.
4. `src/pages/assessment/index.astro` — photo input now actually reads and
   encodes the file (previously tracked only a count); added a size-limit
   error message.
5. `src/content.config.ts` — fixed a Zod v4 typing issue (`z` import source,
   `seoSchema.default()` argument) that was causing `astro check` to fail
   with 16 type errors; fixed two unused-import warnings elsewhere; fixed a
   `Button` component prop type gap (`analyticsLocation` wasn't declared,
   causing 5 further type errors across pages that used it).
6. `src/components/seo/Seo.astro` / `src/layouts/BaseLayout.astro` — loosened
   the `jsonLd` prop type to correctly allow `null` entries in an array (two
   pages legitimately pass a nullable FAQ schema).
7. `src/pages/assessment/index.astro` (separately, functional bugs found
   during this same pass while re-verifying the funnel) — fixed an
   unwanted auto-scroll on initial page load that shoved the form under the
   sticky header; fixed the timeline step's auto-advance silently skipping
   the insurance question; fixed query-param preselection being immediately
   overwritten back to step 1.
8. Added `.node-version` (pins Node 20 for Cloudflare's build image),
   `.env.example` (variable names only), and this file.
9. `.gitignore` — added `.dev.vars`/`.dev.vars.*` (wrangler's local secrets
   file, used only transiently during this audit's testing and never
   committed).

All 24 pages still build; `astro check` now passes with 0 errors (previously
0 was never actually confirmed — the earlier build script used
`astro build` directly, which does not type-check).
