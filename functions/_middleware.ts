/**
 * Cloudflare Pages middleware — keeps deployment-hash and branch preview
 * hosts out of search indexes.
 *
 * Every Cloudflare Pages deployment is also served on a *.pages.dev host
 * (e.g. https://<hash>.jbaroofingwa.pages.dev and branch aliases). Those
 * hosts duplicate the production site, so they get `X-Robots-Tag: noindex`.
 *
 * The production domain (jbaroofpro.com) is never matched, so it stays
 * indexable. A response-header rule is used instead of a <meta> tag because
 * it also covers non-HTML files and needs no change to any page.
 *
 * Note: robots.txt must NOT disallow these hosts. Google has to crawl a URL
 * to see its noindex directive.
 */
export const onRequest: PagesFunction = async (context) => {
  const response = await context.next();
  const { hostname } = new URL(context.request.url);

  if (hostname !== 'pages.dev' && !hostname.endsWith('.pages.dev')) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.set('X-Robots-Tag', 'noindex, nofollow');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
