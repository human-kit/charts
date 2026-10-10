import { browser, dev } from '$app/environment';
import { injectAnalytics } from '@vercel/analytics/sveltekit';
import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

/**
 * The counts of the views, of where a reader came from, and of the speed of a
 * page.
 *
 * These two scripts are served from this domain, so a content blocker does not
 * stop them, and they write nothing to the device of the reader.
 *
 * The guard on `browser` is not in the instructions of the package, but a
 * prerender runs this module on the server, and a build must not stop on a
 * script that looks for a document.
 */
if (browser) {
	injectAnalytics({ mode: dev ? 'development' : 'production' });
	injectSpeedInsights();
}
