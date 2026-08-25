// Single source of truth for site-level identity. Was hardcoded in pages/[slug].tsx.
export const SITE_URL = 'https://intervolz.com';
export const SITE_NAME = 'intervolz';
export const AUTHOR = 'Maxwell Volz';
export const AUTHOR_GITHUB = 'https://github.com/MaxwellVolz';

export const SITE_TITLE = 'Maxwell Volz — engineer & artist, San Francisco';
export const SITE_DESCRIPTION =
  'Build logs and technical write-ups from Maxwell Volz: AI tooling, Rust, React, Three.js and Blender. Dev stories from work in progress and projects already shipped.';

export const DEFAULT_OG_IMAGE = '/imgs/og-default.png';

/** Absolute URL for a site-relative path. Keeps trailing slashes consistent. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
