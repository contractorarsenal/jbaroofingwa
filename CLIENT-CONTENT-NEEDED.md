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
      Jay, 2026-11-12). **Marysville, Lake Stevens, and Arlington are
      client-requested marketing targets** (see the ZIP list below). Their
      pages, with Everett's, are live (see the release record below). Mount
      Vernon and Burlington are built as held previews. Project locations remain
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
| Arlington (Snohomish) | 98223 | Client-requested marketing target (the City of Arlington lists 98223 as its own ZIP). Inspection-led page; permit wording checked against the City of Arlington and Snohomish County official pages. |
| Stanwood (Snohomish) | 98292 | Client-requested target. Live. The ZIP also touches Skagit County. |
| Granite Falls (Snohomish) | 98252 | Client-requested target. Live (PR #17). |
| Darrington (Snohomish) | 98241 | Client-requested target. Live (PR #17). The ZIP also touches Skagit County. |
| Silvana | 98287 | PO box; no page. |
| Mount Vernon / Burlington (Skagit) | 98273, 98274, 98233 | Standard delivery. |
| Other Skagit | 98221 Anacortes, 98284 Sedro-Woolley, 98257 La Conner, 98232 Bow, 98237 Concrete, 98267 Marblemount, 98283 Rockport | Standard delivery. |
| Skagit PO boxes | 98235 Clearlake, 98238 Conway, 98255 Hamilton, 98263 Lyman | No separate page. |
| Bellingham (Whatcom) | 98225, 98226, 98229 (standard), 98227, 98228 (PO box) | Client-requested target. The site records have no Whatcom coverage statement either way. Do not advertise Bellingham until JBA confirms coverage. |

Page status: Everett, Marysville, Lake Stevens, Arlington, Stanwood, Granite
Falls, and Darrington are live (see the release record below). Mount Vernon and
Burlington are held previews. None has a project with a verified city, so each
page shows JBA project photos as examples, not local work.

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

## City Page Release Record (2026-11-12)

Released on approval from Jay. Each live page was checked after Cloudflare
production success: HTTP 200, title, H1, self-canonical on `jbaroofpro.com`,
no `X-Robots-Tag`, `index, follow`, present in the sitemap (34 entries after Granite Falls and Darrington) and on
the service-areas hub and Snohomish County page, estimate links pointing to
`/assessment/`, and no horizontal overflow at 390 px or 1440 px.

| Page | Live URL | PR | Merge commit on `main` |
|---|---|---|---|
| Everett, and the five service-to-project sections | https://jbaroofpro.com/service-areas/everett/ | #11 | 626809c |
| Marysville | https://jbaroofpro.com/service-areas/marysville/ | #11 | 626809c |
| Lake Stevens | https://jbaroofpro.com/service-areas/lake-stevens/ | #12 | e89fab3 |
| Arlington | https://jbaroofpro.com/service-areas/arlington/ | #13 | 85cf3f7 |
| Stanwood | https://jbaroofpro.com/service-areas/stanwood/ | #16 | 3271242 |
| Granite Falls | https://jbaroofpro.com/service-areas/granite-falls/ | #17 | 843184f |
| Darrington | https://jbaroofpro.com/service-areas/darrington/ | #17 | 843184f |
| Docs: Stanwood record, Search Console handoff, rollout notes | (no new page) | #18 | fa589e9 |

Image privacy cleanup (strip embedded GPS metadata, crop two photos that show
house numbers): PR #23, open for review, not merged. Earlier file versions remain in
this public repository's git history.

Held previews (not live, noindexed): Mount Vernon and Burlington (draft release PRs #26 and #27; shared
content #25).

**Open Skagit coverage question (recorded once; it holds Mount Vernon and
Burlington).** Site records conflict. The "What areas do you serve?" FAQ, the
footer, and the meta text say JBA serves Skagit County, while the Skagit page
and its coverage FAQ say "parts of Skagit County... coverage isn't uniform."
Settings list Skagit as a secondary service area, reviews carry no city, and the
legacy site had a single Skagit page (Anacortes). Question for JBA: **Does JBA
take roofing jobs at addresses in Mount Vernon (98273, 98274) and Burlington
(98233), or only some parts of Skagit County, and if only some, which of those
two cities?** The answer also gates Sedro-Woolley, Anacortes, and the smaller
Skagit areas, and any Skagit-side addresses in the Stanwood and Darrington ZIPs.

## Search Console Handoff (submission pending)

No Search Console access was available in the release environment, so
**nothing below has been submitted.** Submission stays **pending** until someone
with access to the `jbaroofpro.com` property completes it and confirms it here
(fill in the "Confirmed by" and date columns).

**Sitemap to submit** (Sitemaps report):

`https://jbaroofpro.com/sitemap-index.xml`

It points to `https://jbaroofpro.com/sitemap-0.xml`, currently 34 URLs. Status:
**pending**. Confirmed by / date: ____________

**URLs to request indexing for** (URL Inspection, then "Request indexing"). All
seven are live and in the sitemap:

| # | Complete URL | Published | Indexing requested |
|---|---|---|---|
| 1 | https://jbaroofpro.com/service-areas/everett/ | PR #11, 626809c | pending |
| 2 | https://jbaroofpro.com/service-areas/marysville/ | PR #11, 626809c | pending |
| 3 | https://jbaroofpro.com/service-areas/lake-stevens/ | PR #12, e89fab3 | pending |
| 4 | https://jbaroofpro.com/service-areas/arlington/ | PR #13, 85cf3f7 | pending |
| 5 | https://jbaroofpro.com/service-areas/stanwood/ | PR #16, 3271242 | pending |
| 6 | https://jbaroofpro.com/service-areas/granite-falls/ | PR #17, 843184f | pending |
| 7 | https://jbaroofpro.com/service-areas/darrington/ | PR #17, 843184f | pending |

- Optional re-crawl requests for existing pages that gained links or sections:
  `https://jbaroofpro.com/services/roof-replacement/`, `/services/roof-repair/`,
  `/services/roof-inspection/`, `/services/roof-cleaning/`,
  `/services/roof-maintenance/`, `https://jbaroofpro.com/service-areas/`, and
  `https://jbaroofpro.com/service-areas/snohomish-county/`.
- Do **not** submit preview hosts (`*.pages.dev`; they are noindexed) or the
  held pages (Mount Vernon, Burlington), which are not live.
- Follow-up: check the Pages report about one to two weeks later and record
  whether each URL is indexed.

## Remaining Coverage Decisions (2026-11-12)

The supplied ZIP list is the evidence of **requested targeting**. The old
website's silence about an area is not treated as proof that JBA excludes it.
Records examined: settings (Skagit listed as a secondary service area), the
"What areas do you serve?" FAQ, footer, and meta text ("serving King,
Snohomish, and Skagit counties"), the Skagit page and coverage FAQ ("parts of
Skagit County... coverage isn't uniform"), review records (no city), project
records (no city), and legacy redirects.

| Requested target (ZIPs) | Existing coverage evidence | Conflicting business statement | Page status | Exact fact needed before publication |
|---|---|---|---|---|
| Mount Vernon (98273, 98274) | Skagit is a secondary service area in settings; the FAQ, footer, and meta say JBA serves Skagit County | Skagit page and FAQ: "parts of Skagit County... coverage isn't uniform" | Held, release PR #26 | Does JBA take roofing jobs at addresses in Mount Vernon (98273, 98274)? |
| Burlington (98233) | Same as above | Same | Held, release PR #27 | Does JBA take roofing jobs at addresses in Burlington (98233)? |
| Sedro-Woolley (98284) | Same | Same | Held, release PR #28 | Does JBA take roofing jobs in Sedro-Woolley (98284)? |
| Anacortes (98221) | Same. The old site had an Anacortes repair page (`/roof-repair-in-anacortes/`), which shows past interest, not current coverage. | Same | Held, release PR #29 | Does JBA take roofing jobs in the city of Anacortes (98221)? |
| La Conner (98257), Bow (98232) | Same | Same | Not built | Does JBA take jobs in La Conner and Bow? |
| Concrete (98237), Rockport (98283), Marblemount (98267) | Same | Same | Not built | How far east in the Skagit Valley does JBA take jobs (which of the three)? |
| Bellingham (98225, 98226, 98229; PO boxes 98227, 98228 get no page) | No coverage statement in the site records either way. The client's ZIP list is the request evidence | The site lists "King, Snohomish, and Skagit" counties, but no record says Whatcom is excluded | Held, release PR #30 | Does JBA take roofing jobs at addresses in Bellingham (98225, 98226, 98229)? |
| Skagit-side addresses in the Stanwood (98292) and Darrington (98241) ZIPs | Snohomish County is described as core coverage ("anywhere in the county") and both pages are live | The ZIPs also touch Skagit County, so the Skagit conflict applies to those addresses | Live | Same answer as the Mount Vernon and Burlington rows, for Skagit-side addresses |

The Skagit rows share one underlying question, recorded once in the release
record above. Lynnwood is not on the ZIP list and is a separate candidate
(see above).

## Coverage Message For JBA (ready to send)

One message covers every open coverage decision above:

> Hi, quick coverage question so our new city pages describe your service area
> accurately. Do you accept residential roofing jobs in each of these?
>
> - Mount Vernon and Burlington
> - Sedro-Woolley and Anacortes
> - Bellingham
> - La Conner, Bow, Concrete, Rockport, and Marblemount
>
> For each, please tell us yes, no, or only some parts, and name any areas you
> exclude or any job types you don't take there (for example, certain roof types
> or services). A line per city is plenty. Thank you!

**JBA's answer: pending.** Record it here once, when provided, then resolve the
conflicting coverage wording in one pass: the Skagit County page
(`skagit-county.md`), the Skagit coverage FAQ, the "What areas do you serve?" FAQ,
and each held preview's city-specific coverage FAQ (`mount-vernon`, `burlington`,
`sedro-woolley`, `anacortes`, `bellingham`), then publish only the cities JBA
accepts.

### What each answer changes

Targeting is already established by the client's ZIP list. The only open fact is
**actual service availability and exclusions**. Once JBA answers, apply it in one pass:

| JBA answer | Wording and pages affected |
|---|---|
| Accepts the city | Publish that city's held preview as-is; its coverage FAQ stays ("send your address and JBA confirms"). Add the city to the "What areas do you serve?" FAQ and, for Skagit cities, tighten the Skagit page and Skagit coverage FAQ only if JBA says coverage is uniform. |
| Only some parts or addresses | Keep the city page; edit the city's coverage FAQ and the page's coverage sentence (`localIntro`/`considerations`) to name the limits. Do not claim every address sharing a ZIP. |
| Job-type limits (for example certain roof types or services) | Edit `servicesAvailable` on that city page and any service wording that implies availability there. |
| Does not accept the city | Leave the preview unpublished (do not merge its PR), remove it from the rollout plan, and keep the ZIP on the no-page list. |
| Limits that change what a page advertises (for example a part of a city, or one service) | Edit only that city's coverage FAQ and coverage sentence. County-boundary or island wording is added only if it changes the coverage the page advertises, and only after the geography is verified against USPS or county records. |

### Release approach and merge dependencies (2026-11-12)

Cities release independently. The shared FAQ relation lines no longer conflict:

- **#25 shared content (inert).** Adds all five city pages with `published: false`,
  their coverage FAQs, and every FAQ `relatedLocations` relation. The generated site
  is byte-identical to main, so it can merge at any time. Merge this first.
- **#26 Mount Vernon, #27 Burlington, #28 Sedro-Woolley, #29 Anacortes, #30
  Bellingham.** Each is one line (`published: false` to `true`), a draft, and
  targets #25's branch. Each requires only #25. Retarget the approved ones to
  `main` after #25 merges (automatic if its branch is deleted). Approve and merge
  only the cities JBA accepts; any subset or order works, because the other cities
  stay unpublished and out of routes, sitemap, hub, and county links.
- **#23 image cleanup** and **#24 docs** are independent of all of the above.

Bellingham gets a city page linked from the service-areas hub. A Whatcom County page
is a separate expansion decision and is not part of this release.

## City Page Rollout Plan (from the recorded target ZIPs)

The 35 ZIPs above are preserved unchanged. Grouping, in suggested order:

| Order | Page | Recorded ZIPs | Basis and gate |
|---|---|---|---|
| Held | Mount Vernon; Burlington | 98273, 98274; 98233 | Built (release PRs #26, #27). Gated on the Skagit coverage question. |
| Done | Stanwood | 98292 | Live (PR #16). Snohomish primary; the ZIP also touches Skagit. |
| Done | Granite Falls; Darrington | 98252; 98241 | Live (PR #17), maintenance-led and repair-led. Darrington's ZIP also touches Skagit. |
| Held | Sedro-Woolley | 98284 | Built (release PR #28). Gated on the coverage question. |
| Held | Anacortes | 98221 | Skagit city of Anacortes. The legacy site had `/roof-repair-in-anacortes/`. Built (release PR #29). Gated on the coverage question. |
| Then | La Conner and Bow | 98257; 98232 | Skagit, small. Gated. |
| Then | Upper Skagit (Concrete, Rockport, Marblemount) | 98237; 98283; 98267 | Rural and small. One regional page or fold into the Skagit County page. Gated. |
| Held | Bellingham | 98225, 98226, 98229 | Requested by the client (ZIP list). The site records say nothing about Whatcom either way, so it is not treated as excluded. Built (release PR #30). Do not advertise until JBA confirms (see Remaining Coverage Decisions). |
| No page | PO box and unique ZIPs | 98206, 98213, 98207, 98227, 98228, 98235, 98238, 98255, 98259, 98263, 98287 | Special-use ZIPs; no separate location pages. |

Lynnwood is not on the ZIP list and remains a separate candidate pending
confirmation of its targeting with Jay.
