import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Canonical/OG/sitemap URLs must match wherever the build is actually being
// served — a staging deploy on *.pages.dev must NOT claim canonical URLs on
// the production domain before DNS is ever pointed here.
//
// Resolution order:
//   1. SITE_URL          — set explicitly per Cloudflare Pages environment
//                           (e.g. only on "Production", once the real domain
//                           is live: https://jbaroofpro.com).
//   2. Production branch  — CF_PAGES_BRANCH === "main" → the real domain. Without
//                           this, CF_PAGES_URL (below) put the per-deployment
//                           *.pages.dev hash into canonicals, og:url, JSON-LD,
//                           and the sitemap of the live site.
//   3. CF_PAGES_URL       — auto-provided by Cloudflare Pages at build time
//                           for every deployment — the deployment's own URL.
//                           Used by preview/branch builds.
//   4. Hardcoded fallback — for local builds run outside Cloudflare Pages.
const PRODUCTION_BRANCH = 'main';
const PRODUCTION_URL = 'https://jbaroofpro.com';
const site =
  process.env.SITE_URL ||
  (process.env.CF_PAGES_BRANCH === PRODUCTION_BRANCH ? PRODUCTION_URL : '') ||
  process.env.CF_PAGES_URL ||
  PRODUCTION_URL;

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/thank-you') && !page.includes('/preview'),
    }),
  ],
  build: {
    format: 'directory',
  },
  image: {
    domains: [],
  },
});
