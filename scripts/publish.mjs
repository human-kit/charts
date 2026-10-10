// Publishes the packages with changesets, then tells which npm dist-tag it used.
// Do not pass `--tag`: in prerelease mode (`.changeset/pre.json` present),
// `changeset publish` uses the pre tag itself and rejects an explicit one.

import { existsSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const preConfigUrl = new URL('../.changeset/pre.json', import.meta.url);

if (existsSync(preConfigUrl)) {
	const pre = JSON.parse(readFileSync(preConfigUrl, 'utf8'));
	console.log(`Prerelease mode: changesets publishes under the "${pre.tag}" dist-tag.`);
} else {
	console.log('Stable mode: changesets publishes under the "latest" dist-tag.');
}

execSync('pnpm exec changeset publish', { stdio: 'inherit' });
