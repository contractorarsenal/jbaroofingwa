/**
 * Intrinsic pixel size of an image served from /public, read at build time.
 *
 * Used to write width/height attributes on <img> so the browser can reserve
 * the image's aspect ratio before it loads (prevents layout shift). Returns
 * null for remote URLs, missing files, or unreadable files, in which case the
 * caller should omit the attributes rather than guess.
 */
import { join } from 'node:path';
import sharp from 'sharp';

export interface ImageSize {
  width: number;
  height: number;
}

const cache = new Map<string, Promise<ImageSize | null>>();

export function getImageSize(src: string | undefined | null): Promise<ImageSize | null> {
  if (!src || !src.startsWith('/') || src.startsWith('//')) return Promise.resolve(null);

  let pending = cache.get(src);
  if (!pending) {
    pending = sharp(join(process.cwd(), 'public', src))
      .metadata()
      .then((m) => (m.width && m.height ? { width: m.width, height: m.height } : null))
      .catch(() => null);
    cache.set(src, pending);
  }
  return pending;
}
