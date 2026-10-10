/**
 * The site's own identity: one place for the published origin, the brand names,
 * and the sentence that describes the library. Every head tag, the sitemap, and
 * the structured data read from here, so a rename or a domain move is one edit
 * instead of a grep.
 *
 * `alternateNames` exists for search engines, not for display. The brand is
 * written `human-kit` everywhere, but people type it as one word ("humankit")
 * or as the package ("@human-kit/charts"); listing those as `alternateName` in
 * the WebSite structured data is the supported way to tell Google that the
 * strings name the same thing.
 */
export const SITE_URL = 'https://charts.human-kit.com';

export const BRAND = 'human-kit charts';
export const BRAND_ALTERNATES = ['humankit charts', '@human-kit/charts', 'human-kit'];

/** Used as `og:site_name` and as the suffix of every page title. */
export const SITE_NAME = 'human-kit charts';

export const SITE_TAGLINE = 'Headless, accessible charts for Svelte 5';

export const SITE_DESCRIPTION =
	'Headless, accessible chart components for Svelte 5. Line, area and bar charts with axes, a grid, a legend, a tooltip and a data table — keyboard operation and accessible names included, every pixel left to you.';

export const GITHUB_URL = 'https://github.com/human-kit/charts';

export const OG_IMAGE = `${SITE_URL}/og.png`;
export const OG_IMAGE_ALT = `${BRAND} — ${SITE_TAGLINE}`;

/** Absolute URL for a site-relative path, with no trailing slash. */
export function absolute(pathname: string): string {
	const path = pathname.replace(/\/+$/, '');
	return path === '' ? SITE_URL : `${SITE_URL}${path}`;
}
