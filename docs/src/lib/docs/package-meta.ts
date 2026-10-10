// The published package's identity, read from its own package.json — the file
// the release bump writes to — so the header can never advertise a version the
// registry doesn't have. Keep the reach outside the docs app in this one module
// rather than spreading the relative path around.
import pkg from '../../../../packages/charts/package.json';

export const packageName: string = pkg.name;
export const npmUrl = `https://www.npmjs.com/package/${pkg.name}`;

/**
 * The version on npm, or `null` before the first release. `0.0.0` is the
 * placeholder in the package.json of an unreleased package: the registry has no
 * such version, so the header links to the repository instead of to npm.
 */
export const packageVersion: string | null = pkg.version === '0.0.0' ? null : pkg.version;
