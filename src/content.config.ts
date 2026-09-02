import { defineCollection, reference } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Shared SEO fields reused across every public-facing collection.
 * Kept optional so Pages CMS never blocks publishing on missing SEO copy —
 * templates fall back to sensible defaults derived from title/description.
 */
const seoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  ogImage: z.string().optional(),
  canonicalUrl: z.string().optional(),
  noindex: z.boolean().default(false),
});

const ctaSchema = z.object({
  label: z.string(),
  href: z.string(),
});

const galleryImageSchema = z.object({
  image: z.string(),
  alt: z.string(),
  caption: z.string().optional(),
});

/* ------------------------------------------------------------------ */
/* GLOBAL SITE SETTINGS (singleton)                                   */
/* ------------------------------------------------------------------ */
const settings = defineCollection({
  loader: file('src/content/settings/global.yaml'),
  schema: z.object({
    businessName: z.string(),
    legalBusinessName: z.string(),
    primaryPhone: z.string(),
    primaryPhoneDisplay: z.string(),
    emergencyPhone: z.string().optional(),
    email: z.string(),
    businessAddress: z
      .object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zip: z.string().optional(),
        displayPublicly: z.boolean().default(false),
      })
      .default({ displayPublicly: false }),
    primaryServiceArea: z.string(),
    secondaryServiceAreas: z.array(z.string()).default([]),

    // Verification-gated trust claims. Each has a boolean "verified" flag —
    // the frontend must never render the value unless verified === true.
    contractorLicense: z.object({
      value: z.string().optional(),
      verified: z.boolean().default(false),
    }),
    // Generic manufacturer/certification credential slot (currently holds
    // the verified GAF Master Elite designation). Nothing renders until
    // verified is true AND name is set.
    credential: z.object({
      verified: z.boolean().default(false),
      name: z.string().optional(),
      badgeImage: z.string().optional(),
      description: z.string().optional(),
      verificationUrl: z.string().optional(),
      contractorId: z.string().optional(),
    }),
    insuranceBonded: z.object({
      value: z.string().optional(),
      verified: z.boolean().default(false),
    }),
    emergencyAvailability: z.object({
      value: z.string().optional(),
      verified: z.boolean().default(false),
    }),
    yearsExperience: z.object({
      value: z.string().optional(),
      verified: z.boolean().default(false),
    }),

    googleRating: z.number().optional(),
    googleReviewCount: z.number().optional(),
    googleBusinessProfileUrl: z.string().optional(),

    primaryCtaLabel: z.string(),
    primaryCtaDestination: z.string(),
    emergencyCtaLabel: z.string().optional(),

    financingUrl: z.string().optional(),
    financingVerified: z.boolean().default(false),

    socialUrls: z
      .object({
        facebook: z.string().optional(),
        instagram: z.string().optional(),
        google: z.string().optional(),
        yelp: z.string().optional(),
        bbb: z.string().optional(),
      })
      .default({}),

    defaultSeoTitle: z.string(),
    defaultMetaDescription: z.string(),
    defaultOgImage: z.string(),
    logo: z.string(),
    logoDark: z.string().optional(),
    favicon: z.string(),

    footerDescription: z.string(),
    businessHours: z
      .array(
        z.object({
          days: z.string(),
          hours: z.string(),
        })
      )
      .default([]),

    leadWebhookUrl: z.string().optional(),
    analyticsId: z.string().optional(),
  }),
});

/* ------------------------------------------------------------------ */
/* SERVICES                                                            */
/* ------------------------------------------------------------------ */
const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    navigationLabel: z.string().optional(),
    shortDescription: z.string(),
    category: z.enum(['repair', 'maintenance', 'replacement', 'other']),
    journey: z.enum(['repair', 'maintenance', 'replacement']).optional(),
    featured: z.boolean().default(false),
    published: z.boolean().default(false),

    heroEyebrow: z.string().optional(),
    heroTitle: z.string(),
    heroDescription: z.string(),
    heroImage: z.string().optional(),
    primaryCta: ctaSchema.optional(),
    secondaryCta: ctaSchema.optional(),

    // Short intro paragraph + a 3-item "quick answer" panel used in the
    // split section directly under the hero (distinct from heroDescription,
    // which already appears in the hero itself).
    overviewText: z.string().optional(),
    quickFacts: z.array(z.object({ title: z.string(), description: z.string() })).default([]),

    // Optional two-column comparison (e.g. Cleaning vs. Repair), rendered
    // via ComparisonPanel when present.
    comparison: z
      .object({
        leftLabel: z.string(),
        rightLabel: z.string(),
        rows: z.array(z.object({ label: z.string(), left: z.string(), right: z.string() })),
      })
      .optional(),

    // Homeowner-specific heading shown above problemStatement (e.g. "Is It
    // Time To Replace Your Roof?"), instead of a generic, mechanically
    // repeated "The Problem" label on every service page.
    problemHeading: z.string().optional(),
    problemStatement: z.string().optional(),
    problemsSolved: z.array(z.string()).default([]),
    benefits: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .default([]),
    benefitsEyebrow: z.string().optional(),
    benefitsHeading: z.string().optional(),
    process: z
      .array(z.object({ step: z.string(), title: z.string(), description: z.string() }))
      .default([]),
    processEyebrow: z.string().optional(),
    processHeading: z.string().optional(),

    gallery: z.array(galleryImageSchema).default([]),

    // Long-form homeowner-education content, rendered after the existing
    // process/benefits sections. Same shape used on project pages, so the
    // same visual pattern (eyebrow + H2 + optional intro/paragraphs/items)
    // renders both. Kept general/conceptual, never implying a specific job.
    educationSections: z
      .array(
        z.object({
          eyebrow: z.string().optional(),
          heading: z.string(),
          intro: z.string().optional(),
          paragraphs: z.array(z.string()).default([]),
          items: z.array(z.object({ title: z.string(), description: z.string() })).default([]),
          tone: z.enum(['light', 'dark']).default('light'),
        })
      )
      .default([]),

    relatedProjectIds: z.array(reference('projects')).default([]),
    relatedFaqIds: z.array(reference('faqs')).default([]),
    relatedReviewIds: z.array(reference('reviews')).default([]),
    relatedLocationIds: z.array(reference('locations')).default([]),

    faqHeading: z.string().optional(),
    ctaHeading: z.string().optional(),
    ctaDescription: z.string().optional(),

    schemaServiceName: z.string().optional(),

    // Roof Rejuvenation specifics — none of this may be asserted publicly
    // until JBA confirms the actual process/product in use. Every value
    // here is paired with its own verified flag, same pattern as the
    // business-settings trust claims.
    rejuvenationDetails: z
      .object({
        process: z.object({ value: z.string().optional(), verified: z.boolean().default(false) }),
        productUsed: z.object({ value: z.string().optional(), verified: z.boolean().default(false) }),
        eligibility: z.object({ value: z.string().optional(), verified: z.boolean().default(false) }),
        expectedBenefits: z.object({ value: z.string().optional(), verified: z.boolean().default(false) }),
        warranty: z.object({ value: z.string().optional(), verified: z.boolean().default(false) }),
        pricing: z.object({ value: z.string().optional(), verified: z.boolean().default(false) }),
      })
      .optional(),

    seo: seoSchema.default({ noindex: false }),
  }),
});

/* ------------------------------------------------------------------ */
/* PROJECTS                                                            */
/* ------------------------------------------------------------------ */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    projectName: z.string(),
    published: z.boolean().default(false),
    featured: z.boolean().default(false),

    city: z.string().optional(),
    neighborhood: z.string().optional(),
    zip: z.string().optional(),

    service: reference('services').optional(),
    relatedServices: z.array(reference('services')).default([]),
    relatedLocation: reference('locations').optional(),

    roofType: z.string().optional(),
    roofMaterial: z.string().optional(),
    manufacturer: z.string().optional(),

    projectSummary: z.string(),
    customerProblem: z.string().optional(),
    inspectionFindings: z.string().optional(),
    solution: z.string().optional(),

    // Case-study depth, kept strictly separate from the facts above: these
    // fields either describe only what's visible/verified for THIS project,
    // or are explicitly general roofing education (never implied to have
    // happened on this specific job).
    // An optional richer multi-stage narrative (problem -> inspection ->
    // damage -> repair -> result), each stage paired with one of the
    // project's own photos. Used instead of whatThisInvolved when a project
    // has enough documented stages to tell a fuller story (see Project 03).
    storyStages: z
      .array(z.object({ heading: z.string(), image: z.string(), text: z.string() }))
      .default([]),
    whatThisInvolved: z.string().optional(),
    homeownerTakeaways: z.array(z.string()).default([]),
    educationSections: z
      .array(
        z.object({
          eyebrow: z.string().optional(),
          heading: z.string(),
          intro: z.string().optional(),
          paragraphs: z.array(z.string()).default([]),
          items: z.array(z.object({ title: z.string(), description: z.string() })).default([]),
          tone: z.enum(['light', 'dark']).default('light'),
        })
      )
      .default([]),
    watchFor: z.array(z.string()).default([]),

    beforeImages: z.array(z.string()).default([]),
    duringImages: z.array(z.string()).default([]),
    afterImages: z.array(z.string()).default([]),
    droneImages: z.array(z.string()).default([]),

    completionDate: z.coerce.date().optional(),
    relatedReview: reference('reviews').optional(),

    seo: seoSchema.default({ noindex: false }),
  }),
});

/* ------------------------------------------------------------------ */
/* SERVICE AREAS / LOCATIONS                                           */
/* ------------------------------------------------------------------ */
const locations = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/locations' }),
  schema: z.object({
    cityName: z.string(),
    published: z.boolean().default(false),
    tier: z.enum(['county', 'city']).default('city'),
    county: z.string().optional(),

    heroTitle: z.string(),
    heroDescription: z.string(),
    heroImage: z.string().optional(),

    localIntro: z.string().optional(),
    servicesAvailable: z.array(reference('services')).default([]),
    neighborhoods: z.array(z.string()).default([]),
    localRoofingConsiderations: z.string().optional(),
    // 3 compact cards (e.g. Weather / Roof Age / Permits & Project Planning)
    // shown as their own "Local Considerations" section, distinct from the
    // hero and intro. Kept conservative — no specific permit/jurisdiction
    // claims unless independently verified.
    considerations: z.array(z.object({ title: z.string(), description: z.string() })).default([]),
    nearbyAreas: z.array(reference('locations')).default([]),

    // General Pacific Northwest roofing context (rain, moss, seasonal storms),
    // and a short paragraph on how JBA helps a homeowner decide next steps.
    // Kept general, never claiming unsupported climate statistics.
    regionalContext: z.string().optional(),
    regionalFactors: z.array(z.object({ title: z.string(), description: z.string() })).default([]),
    commonSigns: z.array(z.string()).default([]),
    decisionHelp: z.string().optional(),

    uniqueFaqIds: z.array(reference('faqs')).default([]),
    mapEmbedUrl: z.string().optional(),

    cta: ctaSchema.optional(),
    seo: seoSchema.default({ noindex: false }),
  }),
});

/* ------------------------------------------------------------------ */
/* REVIEWS                                                             */
/* ------------------------------------------------------------------ */
const reviews = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/reviews' }),
  schema: z.object({
    customerName: z.string(),
    rating: z.number().min(1).max(5),
    reviewText: z.string(),
    reviewSource: z.enum(['google', 'bbb', 'yelp', 'facebook', 'direct']),
    reviewUrl: z.string().optional(),
    reviewDate: z.coerce.date().optional(),
    service: reference('services').optional(),
    city: z.string().optional(),
    relatedProject: reference('projects').optional(),
    featured: z.boolean().default(false),
    published: z.boolean().default(false),
  }),
});

/* ------------------------------------------------------------------ */
/* FAQS                                                                 */
/* ------------------------------------------------------------------ */
const faqs = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/faqs' }),
  schema: z.object({
    question: z.string(),
    answer: z.string(),
    category: z.enum(['repair', 'maintenance', 'replacement', 'general', 'financing', 'permits']),
    relatedServices: z.array(reference('services')).default([]),
    relatedLocations: z.array(reference('locations')).default([]),
    featured: z.boolean().default(false),
    schemaEligible: z.boolean().default(true),
    published: z.boolean().default(true),
  }),
});

/* ------------------------------------------------------------------ */
/* TEAM                                                                 */
/* ------------------------------------------------------------------ */
const team = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/team' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    photo: z.string().optional(),
    shortBio: z.string(),
    certifications: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    published: z.boolean().default(false),
    socialProfile: z.string().optional(),
  }),
});

/* ------------------------------------------------------------------ */
/* MAINTENANCE PLANS                                                    */
/* ------------------------------------------------------------------ */
const maintenance = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/maintenance' }),
  schema: z.object({
    planName: z.string(),
    published: z.boolean().default(false),
    price: z.object({
      value: z.number().optional(),
      display: z.string().optional(),
      verified: z.boolean().default(false),
    }),
    billingFrequency: z.string().optional(),
    shortDescription: z.string(),
    features: z.array(z.string()).default([]),
    recommended: z.boolean().default(false),
    badge: z.string().optional(),
    cta: ctaSchema.optional(),
    finePrint: z.string().optional(),
    order: z.number().default(0),
  }),
});

/* ------------------------------------------------------------------ */
/* RESOURCES / ARTICLES                                                 */
/* ------------------------------------------------------------------ */
const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    published: z.boolean().default(false),
    excerpt: z.string(),
    featuredImage: z.string().optional(),
    author: z.string().optional(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.string().optional(),
    relatedServices: z.array(reference('services')).default([]),
    relatedLocations: z.array(reference('locations')).default([]),
    seo: seoSchema.default({ noindex: false }),
  }),
});

export const collections = {
  settings,
  services,
  projects,
  locations,
  reviews,
  faqs,
  team,
  maintenance,
  articles,
};
