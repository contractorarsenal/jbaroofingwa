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
- [ ] **City page targets.** King, Snohomish, and Skagit counties are live as
      the confirmed broad service area. Seattle, Bellevue, and Kirkland
      remain drafts (`published: false`); they are not in the client's
      supplied target list. **Everett is a confirmed target** (confirmed by
      Jay, 2026-11-12). **Marysville and Lake Stevens are client-requested
      marketing targets** (see the ZIP list below). Their pages are built for
      release review (PR #11 for Everett and Marysville, a stacked PR for Lake
      Stevens) and are not live until merged. Project locations remain
      unverified, so each page shows JBA project photos as examples of JBA's
      roofing work and does not call any project local. Still needed for
      each city: any project JBA can verify by city, with permission to name
      it (see CMS-GUIDE.md on avoiding thin city pages).
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

## Client-Requested Marketing Targets (ZIP Codes)

Supplied by Jay (recorded 2026-11-12). These are **client-requested
marketing targets**, not verified service coverage and not completed-project
locations. A project's city must be verified separately before any page calls
it local work.

Target ZIPs (35): 98201, 98203, 98204, 98206, 98207, 98208, 98213, 98221,
98223, 98225, 98226, 98227, 98228, 98229, 98232, 98233, 98235, 98237, 98238,
98241, 98252, 98255, 98257, 98258, 98259, 98263, 98267, 98270, 98271, 98273,
98274, 98283, 98284, 98287, 98292.

Mapped on 2026-11-12 from zip-codes.com (a compilation of USPS data) with
place names cross-checked against GeoNames. USPS's own lookup could not be
queried by script, so confirm any ZIP before excluding it from a page.

| Area | ZIPs | Notes |
|---|---|---|
| Everett (Snohomish) | 98201, 98203, 98204, 98208 | Standard delivery. Page built for preview. |
| Everett (non-delivery) | 98206, 98213 (PO box), 98207 (unique) | No separate page. |
| Marysville (Snohomish) | 98270, 98271 | Both Marysville. 98271 also lists Tulalip and Quil Ceda Village as city aliases. |
| Lake Stevens (Snohomish) | 98258 | Client-requested marketing target. 98259 is a PO box (North Lakewood), so it needs no page. Stacked PR against `feat/everett-service-area`. |
| Other Snohomish | 98223 Arlington, 98252 Granite Falls, 98292 Stanwood, 98241 Darrington | 98287 Silvana is a PO box. Stanwood and Darrington ZIPs also touch Skagit County. |
| Mount Vernon / Burlington (Skagit) | 98273, 98274, 98233 | Standard delivery. |
| Other Skagit | 98221 Anacortes, 98284 Sedro-Woolley, 98257 La Conner, 98232 Bow, 98237 Concrete, 98267 Marblemount, 98283 Rockport | Standard delivery. Anacortes also touches San Juan County. |
| Skagit PO boxes | 98235 Clearlake, 98238 Conway, 98255 Hamilton, 98263 Lyman | No separate page. |
| Bellingham (Whatcom) | 98225, 98226, 98229 (standard), 98227, 98228 (PO box) | **Whatcom County is not a documented JBA service area.** Do not advertise Bellingham until JBA confirms coverage. |

Page status: Everett and Marysville are in PR #11. Lake Stevens is in a
stacked PR against `feat/everett-service-area` (retarget it to `main` after
PR #11 merges). None of the three has a project with a verified
city, so each shows JBA project photos as examples, not local work.

Special-use ZIPs (10 PO box, 1 unique) should not become location pages.
Lynnwood is not on this list. It remains a separate candidate (a metal-roof
inquiry and a legacy `/roof-repair-in-lynnwood/` URL), pending confirmation
of its targeting with Jay.

## Explicitly NOT Guessed or Fabricated

Per direct instruction, the following were deliberately left unset rather
than estimated or inferred from the research report, even where the report
suggested a specific number: years in business, project count, award count,
exact response-time SLAs, and specific warranty terms (e.g. "25-year
workmanship," "Golden Pledge"). These require direct confirmation from JBA
before they can be stated anywhere on the site or in its structured data.
