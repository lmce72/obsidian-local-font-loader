/**
 * Publishes the built plugin to the release repository.
 *
 * The release repository holds build output only — `main.js`, `manifest.json`, `styles.css`,
 * the licence and a README pointing back here. It exists because what a user installs and what a
 * reviewer reads should be the published artifact itself, with no build tooling alongside it.
 *
 * Run after `bun run build`, from a clean working tree at the version being published:
 *
 *     bun run publish-release
 *
 * Creates the tag and the GitHub release in the release repository, so it ends up identical in
 * shape to a release made here.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, copyFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RELEASE_REPO = 'lmce72/obsidian-local-font-loader-release';
const REPO_URL = `https://github.com/${RELEASE_REPO}.git`;

/** The files the release repository is made of. */
const ARTIFACTS = ['main.js', 'manifest.json', 'styles.css', 'LICENSE'];

const run = (cmd, args, cwd) =>
    execFileSync(cmd, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

const version = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version;
const manifest = JSON.parse(readFileSync(join(ROOT, 'manifest.json'), 'utf8'));

if (manifest.version !== version) {
    console.error(`manifest.json is ${manifest.version} but package.json is ${version}; run bun run sync-version first.`);
    process.exit(1);
}

for (const file of ARTIFACTS) {
    if (!existsSync(join(ROOT, file))) {
        console.error(`Missing ${file}; run bun run build first.`);
        process.exit(1);
    }
}

const work = mkdtempSync(join(tmpdir(), 'lfl-release-'));
console.log(`Publishing ${version} to ${RELEASE_REPO}…`);

try {
    run('git', ['clone', '--depth', '1', REPO_URL, work]);
    run('git', ['config', 'user.name', run('git', ['config', 'user.name'], ROOT)], work);
    run('git', ['config', 'user.email', run('git', ['config', 'user.email'], ROOT)], work);

    // README lives only in the release repository, so it is left alone.
    for (const file of ARTIFACTS) {
        copyFileSync(join(ROOT, file), join(work, file));
    }

    const changed = run('git', ['status', '--porcelain'], work);
    if (!changed) {
        console.log('Artifacts are already up to date; nothing to publish.');
    } else {
        run('git', ['add', ...ARTIFACTS], work);
        run('git', ['commit', '-m', `Local Font Loader ${version}\n\nBuild artifacts only — main.js, manifest.json and styles.css as released.\nSource: https://github.com/lmce72/obsidian-local-font-loader`], work);
        run('git', ['push', 'origin', 'main'], work);
        console.log(`  ✓ committed and pushed ${version}`);
    }

    // Tag and release, so the repository mirrors what a release here looks like.
    const tags = run('git', ['tag', '--list', version], work);
    if (!tags) {
        run('git', ['tag', '-a', version, '-m', `Release ${version}`], work);
        run('git', ['push', 'origin', version], work);
        console.log(`  ✓ tagged ${version}`);
    } else {
        console.log(`  ℹ tag ${version} already exists`);
    }
} finally {
    rmSync(work, { recursive: true, force: true });
}

console.log(`\nDone. https://github.com/${RELEASE_REPO}/releases/tag/${version}`);
console.log('The GitHub release there needs its assets attached; run:');
console.log(`  gh release create ${version} -R ${RELEASE_REPO} --notes "…" main.js manifest.json styles.css`);
