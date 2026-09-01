# Content & Assets Still Needed From JBA

Everything below is either a placeholder, gated behind a `verified: false`
flag, or simply missing. Nothing false has been published — the site
currently under-claims rather than over-claims. This list is the path to
turning the safeguards off with real, confirmed information.

## CRITICAL BEFORE LAUNCH

- [ ] **Confirm the phone number.** Currently set to (206) 474-5996 (pulled
      from the Google Business Profile). Confirm this is correct and the
      one JBA wants used everywhere — the old site's (617) number is
      already fully removed from this build.
- [ ] **Confirm the email address.** Currently `contact.jbaroofing@gmail.com`.
- [ ] **WA Contractor License number.** Field exists in Business Settings
      (`contractorLicense`) but is unverified — nothing shows on the site
      until the exact license number is confirmed and `verified` is set to
      `true`.
- [ ] **GAF Master Elite status.** The research report cites gaf.com as
      listing JBA as a GAF Master Elite contractor, but per direct
      instruction this must NOT be asserted publicly until JBA explicitly
      confirms it. Flip `gafMasterElite.verified` to `true` once confirmed.
- [ ] **Proof of insurance / bonding.** Field exists (`insuranceBonded`),
      unverified.
- [ ] **At least one real project** with real before/after/drone photos —
      the Projects collection currently only has an unpublished template
      entry. Without this, the homepage "Featured Work" and `/projects/`
      show a graceful empty state rather than actual proof of work.
- [ ] **A way to receive form submissions.** Set at least one of
      `LEAD_WEBHOOK_URL` or (`RESEND_API_KEY` + `LEAD_NOTIFY_EMAIL`) as
      Cloudflare Pages environment variables — right now, submissions
      succeed and are logged, but nobody is notified. See README.md.
- [ ] **Real logo file(s).** The header/footer currently use a clean text
      wordmark ("JBA Construction") rather than a placeholder image — if
      JBA has an actual logo, it should replace this via Business Settings
      (Logo / Logo Dark fields) and likely needs a small component update
      to actually render it in the header (currently text-only by design,
      since no logo file existed at build time).

## SHOULD HAVE

- [ ] **Maintenance plan pricing.** Both plans ("Annual Tune-Up" and "Moss
      Prevention Plan") exist with real feature lists pulled from the
      research report's recommendations, but pricing is unverified/blank.
      Confirm actual pricing and set `price.display` + `price.verified: true`
      on each.
- [ ] **Confirm the full active service list.** Currently published:
      Roof Repair, Roof Leak Repair, Storm Damage Repair, Roof Maintenance,
      Roof Inspection, Roof Cleaning & Moss Removal, Gutter Services, Roof
      Replacement, Roof Installation. Confirm this matches what JBA
      actually wants to advertise — anything not offered should be
      unpublished.
- [ ] **Confirm which cities to actively target.** Seattle, Bellevue,
      Kirkland, and Everett exist as drafts (`published: false`) per the
      research strategy — King, Snohomish, and Skagit counties are live as
      the confirmed broad service area. Publishing individual city pages
      needs real local project photos/reviews for each city to avoid thin,
      duplicate-feeling content (see CMS-GUIDE.md).
- [ ] **Team names, roles, and photos.** Team collection has only an
      unpublished template entry.
- [ ] **Owner photo and short bio**, if JBA wants a "founder-led trust"
      section per the research recommendations.
- [ ] **Crew and truck/fleet photos** — referenced throughout as
      `PlaceholderArt` graphics rather than real photography. Needed for:
      hero section, Why JBA section, maintenance/moss-treatment section,
      About page team cards.
- [ ] **At least a handful of real Google reviews** to seed the Reviews
      collection — the current 5.0★/101 reviews figure is shown as a
      summary stat (from the client-provided Google Business Profile data),
      but no individual review text is populated yet.
- [ ] **Financing partner info**, if JBA offers financing — `financingUrl`
      and `financingVerified` exist in Business Settings but are empty/off.
- [ ] **Emergency availability policy.** Is JBA actually 24/7? What's a
      realistic response-time commitment? Currently unverified/blank —
      affects copy on the Roof Repair page and homepage trust signals.
- [ ] **Analytics ID** (GA4 measurement ID or GTM container ID) — the
      analytics event system (`src/lib/analytics.ts`) is fully wired and
      firing events into `window.dataLayer`, but nothing is currently
      collecting them.

## NICE TO HAVE

- [ ] Years of experience / combined crew experience claim (framed around
      the team's experience rather than the LLC's incorporation date, since
      JBA Construction LLC was only formed in 2024 per the BBB record — see
      research report Phase 1).
- [ ] BBB profile URL, Yelp URL, and other social links for Business
      Settings.
- [ ] A short founder/owner video, if JBA wants to pursue the "Founder-Led
      Trust" positioning angle from the research.
- [ ] Resource/blog article content (permit guides, seasonal maintenance
      checklists, etc.) — the Resources section exists and works, just has
      no articles yet.
- [ ] A downloadable seasonal maintenance checklist PDF, if desired
      (mentioned as an optional idea in the research report).
- [ ] Drone footage/video for the homepage hero, if JBA wants to move beyond
      the current static hero treatment (kept static intentionally for
      performance — see ARCHITECTURE.md on Core Web Vitals).

## Explicitly NOT Guessed or Fabricated

Per direct instruction, the following were deliberately left unset rather
than estimated or inferred from the research report, even where the report
suggested a specific number: years in business, project count, award count,
exact response-time SLAs, and specific warranty terms (e.g. "25-year
workmanship," "Golden Pledge"). These require direct confirmation from JBA
before they can be stated anywhere on the site or in its structured data.
