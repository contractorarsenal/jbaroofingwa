# Editing the JBA Website — A Plain-English Guide

This guide is for whoever at JBA is updating the website day-to-day. No
coding knowledge needed.

## How to Log In

1. Go to [pagescms.org](https://pagescms.org) and sign in with the GitHub
   account your developer set up for you.
2. Select the JBA Construction site from your list of projects.
3. You'll see a list of sections on the left: Business Settings, Services,
   Projects, Service Areas, Reviews, FAQs, Team, Maintenance Plans,
   Resources.

Every change you make and save here updates the real website. There's no
separate "staging" step — but changes typically take a minute or two to go
live while the site rebuilds.

## Updating Basic Business Info (phone, email, hours)

Go to **Business Settings**. This one page controls things that appear
everywhere on the site:

- Phone number (both the "for click-to-call" version and the "as displayed"
  version — update both to the same number, just formatted differently)
- Email address
- Business hours
- Social media links
- The Google star rating and review count shown on the homepage

Click **Save** at the top when you're done. There's only one Business
Settings entry — you're editing it directly, not creating a new one.

### The "Verified" toggles

Some fields in Business Settings (WA Contractor License, GAF Master Elite,
Insurance/Bonding, Emergency Availability, Years of Experience) have a
**"Verified — OK to show publicly"** switch next to them. This is
intentional: even if you type a value into the field, it will **not appear
anywhere on the live website** until you also switch "Verified" to on. This
is a safeguard so nothing gets claimed publicly before it's actually
confirmed. Once you're sure a piece of information is accurate, fill it in
and flip the switch.

## Adding a New Project (completed job)

1. Go to **Projects** → **Add new**.
2. Fill in the Project Name — this also becomes part of the page's web
   address, so keep it short and descriptive (e.g. "Bellevue Roof
   Replacement").
3. Fill in City, the Service Performed (pick from the dropdown), and a short
   Project Summary.
4. Upload photos under Before Photos / After Photos / Drone Photos. You can
   upload directly from your computer or phone.
5. Optionally link a Customer Review to this project (see below for adding
   reviews first).
6. **Important:** Switch **Published** to on when you're ready for this to
   go live. It stays hidden until you do.
7. Save.

The project will now automatically be eligible to show up in the "Our Work"
gallery, on the homepage's featured work section (if popular), and on the
relevant Service and Service Area pages — you don't need to add it in
multiple places.

## Adding a Photo Anywhere

Any field with an image icon works the same way: click it, then either drag
a photo in or choose one from your computer. Use real JBA photos — actual
job sites, actual crew, actual trucks — not stock photography. If you don't
have a photo yet for something, just leave it blank; the site will show a
tasteful placeholder instead of a broken image.

## Adding a Customer Review

1. Go to **Reviews** → **Add new**.
2. Fill in the customer's name, star rating, and the review text — copy it
   exactly as written (don't paraphrase or invent wording).
3. Pick where the review came from (Google, BBB, Yelp, Facebook, or
   "Direct" if they told you in person/email).
4. Optionally tag which Service and City it relates to, so it can show up on
   the right pages.
5. Switch **Published** on, then Save.

**Only add real reviews you can point back to an actual customer.** Never
invent or exaggerate one — search engines and customers both penalize fake
reviews heavily, and it undermines the honesty positioning the whole site is
built around.

## Adding an FAQ

1. Go to **FAQs** → **Add new**.
2. Write the Question exactly as a customer would ask it, and a clear,
   specific Answer.
3. Pick a Category, and optionally link it to specific Services or Service
   Areas so it shows up on those pages automatically.
4. Save (FAQs are published by default — no separate toggle needed, though
   you can un-publish one if needed).

## Editing a Service Page

Go to **Services**, click into one (e.g. "Roof Repair"). You can edit:

- The headline and description shown at the top of the page
- The list of problems this service solves
- The benefits and the step-by-step process
- The photo gallery
- The FAQ heading and bottom call-to-action text
- The SEO settings (see below)

You generally won't need to touch **Category** or **Customer Journey** —
those control which page layout is used and were set up by your developer.

## Updating a Service Area (city/county) Page

Go to **Service Areas**. King County, Snohomish County, and Skagit County
are live. Seattle, Bellevue, Kirkland, and Everett exist as drafts
(**Published** is off) — see `CLIENT-CONTENT-NEEDED.md` for what's needed
before those go live. When you're ready to launch one:

1. Open the city.
2. Write a real, specific Local Introduction paragraph — don't copy another
   city's text and swap the name; search engines and readers both notice.
3. Add any local project photos and reviews if you have them (via the
   Projects/Reviews sections, tagging that city).
4. Switch **Published** on.

## Editing SEO Fields

Most content types have a "Search Engine Settings (SEO)" section near the
bottom:

- **SEO Page Title** — what shows as the blue link text in Google. Keep it
  under ~60 characters.
- **Meta Description** — the gray summary text under the title in Google
  results. Keep it under ~155 characters.
- **Social Share Image** — the image shown when the page is shared on
  Facebook/Twitter/iMessage.

If you leave these blank, the site falls back to a sensible default built
from the page title and description — you don't have to fill these in for
every single page immediately.

## Publishing Your Changes

Every collection has a **Published** switch (except FAQs, which default to
published). Nothing you create shows up on the live site until you turn this
on — so you can build out a page fully, come back later, and publish when
it's ready.

Saving in Pages CMS commits the change directly, and the live site
automatically rebuilds within a couple of minutes. There's no separate
"publish site" button to remember.

## What You Should NOT Touch

- There's no way to change fonts, colors, spacing, or page layout in Pages
  CMS — that's intentional, and protects the design from breaking. If you
  want a visual change, that goes through your developer.
- Don't edit the **Filename** field after a page has already been published
  and shared/linked — changing it changes the page's web address, which can
  break links people have already bookmarked or that Google has indexed.
- Leave the **Lead Notification Webhook URL** and **Analytics ID** fields in
  Business Settings alone unless your developer specifically asks you to set
  them — these are technical integration settings.
- Don't invent or exaggerate content in Reviews, or turn on a "Verified"
  toggle for something you haven't actually confirmed (license number, GAF
  status, insurance, etc.) — these exist specifically to keep the site
  honest and legally safe.
