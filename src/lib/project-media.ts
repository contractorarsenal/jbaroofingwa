/**
 * Hand-written, accurate alt text for every real project photo, keyed by the
 * exact path stored in project content. The `projects` schema stores images
 * as plain string arrays (not {src, alt} objects) to avoid a wider schema
 * change — this map supplies real alt text at render time without needing
 * one.
 */
export const PROJECT_IMAGE_ALT: Record<string, string> = {
  '/images/projects/project-01-shingle-roof-replacement/before-aerial.jpg':
    'Aerial view of the roof before replacement, showing worn shingles',
  '/images/projects/project-01-shingle-roof-replacement/after-front.jpg':
    'Completed shingle roof viewed from the front of the house',
  '/images/projects/project-01-shingle-roof-replacement/after-aerial.jpg':
    'Completed shingle roof viewed from above',

  '/images/projects/project-02-metal-roof/before-aerial.jpg':
    'Aerial view of the roof before metal roofing work',
  '/images/projects/project-02-metal-roof/progress.jpg':
    'Metal roofing installation in progress',
  '/images/projects/project-02-metal-roof/after-aerial.jpg':
    'Completed metal roof viewed from above',
  '/images/projects/project-02-metal-roof/after-front.jpg':
    'Completed metal roofing system viewed from the front of the home',

  '/images/projects/project-03-water-damage-roof-repair/problem-moss.jpg':
    'Aging shingles with visible moss growth before repair',
  '/images/projects/project-03-water-damage-roof-repair/problem-drainage.jpg':
    'Close-up of a roof drainage detail that was improperly positioned',
  '/images/projects/project-03-water-damage-roof-repair/damage.jpg':
    'Water-damaged roof decking discovered during inspection',
  '/images/projects/project-03-water-damage-roof-repair/progress-decking.jpg':
    'JBA crew removing damaged roof decking during repair',
  '/images/projects/project-03-water-damage-roof-repair/after-shingles.jpg':
    'New shingles installed after the damaged decking was repaired',

  '/images/projects/project-04-small-shingle-replacement/before.jpg':
    'Older roof with visible moss growth before replacement',
  '/images/projects/project-04-small-shingle-replacement/after.jpg':
    'Completed residential shingle roof replacement',

  '/images/projects/project-05-shingle-installation/before-deck.jpg':
    'Prepared plywood roof deck before shingle installation',
  '/images/projects/project-05-shingle-installation/progress.jpg':
    'Shingle installation partially complete',
  '/images/projects/project-05-shingle-installation/after.jpg':
    'Completed new shingle roof installation',

  '/images/projects/project-06-aging-roof-replacement/before.jpg':
    'Very aged roof before replacement',
  '/images/projects/project-06-aging-roof-replacement/progress-1.jpg':
    'Aging roof replacement in progress',
  '/images/projects/project-06-aging-roof-replacement/progress-2.jpg':
    'Aging roof replacement in progress',
  '/images/projects/project-06-aging-roof-replacement/after.jpg':
    'Completed aging roof replacement',

  '/images/projects/project-07-roof-installation/before.jpg':
    'Roof stripped down before a complete roof installation',
  '/images/projects/project-07-roof-installation/progress.jpg':
    'Complete roof installation in progress',
  '/images/projects/project-07-roof-installation/after.jpg':
    'Completed roof installation',
};

export function projectImageAlt(src: string | undefined, fallback: string): string {
  if (!src) return fallback;
  return PROJECT_IMAGE_ALT[src] ?? fallback;
}
