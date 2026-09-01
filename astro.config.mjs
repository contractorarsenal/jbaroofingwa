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
//   2. CF_PAGES_URL       — auto-provided by Cloudflare Pages at build time
//                           for every deployment (staging and production
//                           branch alike) — the deployment's own live URL.
//   3. Hardcoded fallback — for local builds run outside Cloudflare Pages.
const site = process.env.SITE_URL || process.env.CF_PAGES_URL || 'https://jbaroofpro.com';

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
