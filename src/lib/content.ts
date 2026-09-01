import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

/** Published-only accessors so draft/unconfirmed content never reaches production pages. */

export async function getPublishedServices(): Promise<CollectionEntry<'services'>[]> {
  return getCollection('services', ({ data }) => data.published);
}

export async function getServicesByJourney(
  journey: 'repair' | 'maintenance' | 'replacement'
): Promise<CollectionEntry<'services'>[]> {
  const services = await getPublishedServices();
  return services.filter((s) => s.data.journey === journey);
}

export async function getPublishedProjects(): Promise<CollectionEntry<'projects'>[]> {
  const projects = await getCollection('projects', ({ data }) => data.published);
  return projects.sort((a, b) => {
    const aDate = a.data.completionDate?.getTime() ?? 0;
    const bDate = b.data.completionDate?.getTime() ?? 0;
    return bDate - aDate;
  });
}

export async function getFeaturedProjects(limit = 3): Promise<CollectionEntry<'projects'>[]> {
  const projects = await getPublishedProjects();
  const featured = projects.filter((p) => p.data.featured);
  return (featured.length > 0 ? featured : projects).slice(0, limit);
}

export async function getProjectsForService(serviceSlug: string): Promise<CollectionEntry<'projects'>[]> {
  const projects = await getPublishedProjects();
  return projects.filter(
    (p) =>
      p.data.service?.id === serviceSlug ||
      p.data.relatedServices.some((s) => s.id === serviceSlug)
  );
}

export async function getProjectsForLocation(locationSlug: string): Promise<CollectionEntry<'projects'>[]> {
  const projects = await getPublishedProjects();
  return projects.filter((p) => p.data.relatedLocation?.id === locationSlug);
}

export async function getPublishedLocations(): Promise<CollectionEntry<'locations'>[]> {
  return getCollection('locations', ({ data }) => data.published);
}

export async function getPublishedReviews(): Promise<CollectionEntry<'reviews'>[]> {
  const reviews = await getCollection('reviews', ({ data }) => data.published);
  return reviews.sort((a, b) => {
    const aDate = a.data.reviewDate?.getTime() ?? 0;
    const bDate = b.data.reviewDate?.getTime() ?? 0;
    return bDate - aDate;
  });
}

export async function getReviewsForService(serviceSlug: string): Promise<CollectionEntry<'reviews'>[]> {
  const reviews = await getPublishedReviews();
  return reviews.filter((r) => r.data.service?.id === serviceSlug);
}

export async function getReviewsForLocation(city: string): Promise<CollectionEntry<'reviews'>[]> {
  const reviews = await getPublishedReviews();
  return reviews.filter((r) => r.data.city?.toLowerCase() === city.toLowerCase());
}

export async function getPublishedFaqs(): Promise<CollectionEntry<'faqs'>[]> {
  return getCollection('faqs', ({ data }) => data.published);
}

export async function getFaqsForService(serviceSlug: string): Promise<CollectionEntry<'faqs'>[]> {
  const faqs = await getPublishedFaqs();
  return faqs.filter((f) => f.data.relatedServices.some((s) => s.id === serviceSlug));
}

export async function getFaqsForLocation(locationSlug: string): Promise<CollectionEntry<'faqs'>[]> {
  const faqs = await getPublishedFaqs();
  return faqs.filter((f) => f.data.relatedLocations.some((l) => l.id === locationSlug));
}

export async function getActiveMaintenancePlans(): Promise<CollectionEntry<'maintenance'>[]> {
  const plans = await getCollection('maintenance', ({ data }) => data.published);
  return plans.sort((a, b) => a.data.order - b.data.order);
}

export async function getPublishedTeam(): Promise<CollectionEntry<'team'>[]> {
  return getCollection('team', ({ data }) => data.published);
}

export async function getPublishedArticles(): Promise<CollectionEntry<'articles'>[]> {
  const articles = await getCollection('articles', ({ data }) => data.published);
  return articles.sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime());
}

export async function getGlobalSettings() {
  const settings = await getEntry('settings', 'global');
  if (!settings) {
    throw new Error(
      'Missing src/content/settings/global.yaml — global site settings are required for every page.'
    );
  }
  return settings.data;
}
