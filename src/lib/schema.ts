/**
 * JSON-LD structured data builders.
 *
 * Every builder only includes fields backed by verified data — see the
 * `verified` flags on GlobalSettings (contractorLicense, credential,
 * etc.). Never add a claim here that isn't already visible and true on the
 * rendered page; schema.org markup mismatched with page content violates
 * Google's structured data guidelines and risks a manual action.
 */
import type { CollectionEntry } from 'astro:content';

type Settings = CollectionEntry<'settings'>['data'];

export function buildLocalBusinessSchema(settings: Settings, siteUrl: string) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'RoofingContractor',
    name: settings.businessName,
    legalName: settings.legalBusinessName,
    url: siteUrl,
    telephone: settings.primaryPhoneDisplay,
    email: settings.email,
    areaServed: [settings.primaryServiceArea, ...settings.secondaryServiceAreas],
    image: siteUrl + settings.defaultOgImage,
  };

  if (settings.businessAddress.displayPublicly && settings.businessAddress.street) {
    schema.address = {
      '@type': 'PostalAddress',
      streetAddress: settings.businessAddress.street,
      addressLocality: settings.businessAddress.city,
      addressRegion: settings.businessAddress.state,
      postalCode: settings.businessAddress.zip || undefined,
      addressCountry: 'US',
    };
  }

  if (settings.contractorLicense.verified && settings.contractorLicense.value) {
    schema.identifier = {
      '@type': 'PropertyValue',
      name: 'WA Contractor License',
      value: settings.contractorLicense.value,
    };
  }

  if (settings.googleRating && settings.googleReviewCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: settings.googleRating,
      reviewCount: settings.googleReviewCount,
    };
  }

  return schema;
}

export function buildServiceSchema(params: {
  serviceName: string;
  description: string;
  siteUrl: string;
  pageUrl: string;
  areaServed: string[];
  providerName: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: params.serviceName,
    name: params.serviceName,
    description: params.description,
    url: params.pageUrl,
    areaServed: params.areaServed,
    provider: {
      '@type': 'RoofingContractor',
      name: params.providerName,
      url: params.siteUrl,
    },
  };
}

export function buildFaqSchema(faqs: { question: string; answer: string }[]) {
  if (faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };
}

export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildReviewSchema(
  reviews: { customerName: string; rating: number; reviewText: string; reviewDate?: Date }[],
  itemReviewed: string
) {
  if (reviews.length === 0) return null;
  return reviews.map((r) => ({
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: { '@type': 'RoofingContractor', name: itemReviewed },
    author: { '@type': 'Person', name: r.customerName },
    reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
    reviewBody: r.reviewText,
    datePublished: r.reviewDate?.toISOString(),
  }));
}
