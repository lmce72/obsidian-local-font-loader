/**
 * Keeps the version in one place.
 *
 * package.json is the source of truth; manifest.json and the entry banner are written from it,
 * so a release cannot ship a manifest that disagrees with the package it was built from.
 *
 * Run: bun run sync-version
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const write = (p, s) => writeFileSync(join(ROOT, p), s);

const pkg = JSON.parse(read('package.json'));
const version = pkg.version;

if (!/^\d+\.\d+\.\d+$/.test(version)) {
    console.error(`package.json version is not a plain semver: ${version}`);
    process.exit(1);
}

const changes = [];

// manifest.json — what Obsidian shows and what the release is named after
const manifestRaw = read('manifest.json');
const manifest = JSON.parse(manifestRaw);
if (manifest.version !== version) {
    manifest.version = version;
    write('manifest.json', JSON.stringify(manifest, null, '\t') + '\n');
    changes.push(`manifest.json  ${manifestRaw.match(/"version": "[^"]+"/)[0]} -> "version": "${version}"`);
}

// entry banner — the version a developer sees when opening the build input
const bannerPath = 'src/main.ts';
const banner = read(bannerPath);
const nextBanner = banner.replace(/@version\s+\d+\.\d+\.\d+/, `@version ${version}`);
if (nextBanner !== banner) {
    write(bannerPath, nextBanner);
    changes.push(`${bannerPath}  @version -> ${version}`);
} else if (!banner.includes(`@version ${version}`)) {
    console.error(`${bannerPath} has no @version line to update`);
    process.exit(1);
}

console.log(changes.length ? `Synced to ${version}:\n  ${changes.join('\n  ')}` : `Already at ${version}; nothing to do.`);
