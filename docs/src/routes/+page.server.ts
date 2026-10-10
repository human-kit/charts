import { nav } from '$lib/docs/nav.js';
import { landingTitle, type Seo } from '$lib/docs/seo.js';
import { SITE_DESCRIPTION } from '$lib/docs/site.js';
import { softwareJsonLd, websiteJsonLd } from '$lib/docs/structured-data.js';

export const prerender = true;

/**
 * Every page's frontmatter, read as text.
 *
 * A SERVER load (not a universal one) so the raw markdown stays on the build
 * machine: an eager `?raw` glob in a universal load would inline all of the files
 * into the client bundle, to ship one sentence from each.
 */
const sources = import.meta.glob('/src/content/**/index.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

function descriptionOf(slug: string): string {
	const frontmatter = sources[`/src/content/${slug}/index.md`]?.match(/^---\n([\s\S]*?)\n---/);
	return frontmatter?.[1].match(/^description:\s*(.+)$/m)?.[1].trim() ?? '';
}

export const load = () => {
	// The landing links to every documentation page, so a crawler reaches all of
	// them one hop from the root instead of having to walk the sidebar.
	const groups = nav.map((group) => ({
		label: group.label,
		items: group.items.map((item) => ({
			...item,
			description: descriptionOf(item.slug)
		}))
	}));

	const seo: Seo = {
		title: landingTitle,
		ogTitle: 'human-kit charts — accessible charts for Svelte 5',
		description: SITE_DESCRIPTION,
		type: 'website',
		jsonLd: [websiteJsonLd(), softwareJsonLd()]
	};

	return { groups, seo };
};
