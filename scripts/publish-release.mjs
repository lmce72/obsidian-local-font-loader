/**
 * Publishes the current version as a GitHub release.
 *
 * The release has to live in the repository the community directory names for this plugin —
 * `lmce72/obsidian-local-font-loader` — because that is where Obsidian's installer looks for
 * `manifest.json`, `main.js` and `styles.css`, and it reads them from that repository's **latest
 * release**, not from a branch. Publishing anywhere else (the `-release` repository this script
 * used to write to, for instance) leaves the new version unreachable, and Obsidian reports the
 * mismatch as a manifest pointing at a version that has no release.
 *
 * Run after `bun run build` and after committing, from a clean working tree at the version being
 * published:
 *
 *     bun run publish-release
 *
 * The release body is the text under the version's heading in CHANGELOG.md, up to the first `###`
 * — the rule the changelog states for itself, applied here so the two cannot drift apart.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** The repository the community directory points at, so the one the installer reads. */
const RELEASE_REPO = 'lmce72/obsidian-local-font-loader';

/** What the installer downloads. LICENSE and README travel with the source, not the release. */
const ARTIFACTS = ['main.js', 'manifest.json', 'styles.css'];

const run = (cmd, args) =>
    execFileSync(cmd, args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

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

// A release cut from a dirty tree, or from a commit nobody can fetch, would not correspond to
// anything a reviewer can read afterwards.
const dirty = run('git', ['status', '--porcelain']);
if (dirty) {
    console.error(`Working tree is not clean; commit first:\n${dirty}`);
    process.exit(1);
}

const branch = run('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
const unpushed = run('git', ['log', '--oneline', `origin/${branch}..HEAD`]);
if (unpushed) {
    console.error(`HEAD is ahead of origin/${branch}; push first:\n${unpushed}`);
    process.exit(1);
}

/** The summary paragraph under `## [version]` in CHANGELOG.md, which is what users read. */
function releaseNotes() {
    const changelog = readFileSync(join(ROOT, 'CHANGELOG.md'), 'utf8');
    const heading = changelog.indexOf(`## [${version}]`);
    if (heading < 0) {
        console.error(`CHANGELOG.md has no "## [${version}]" section; write it before releasing.`);
        process.exit(1);
    }

    const section = changelog.slice(heading);
    const firstSubsection = section.indexOf('\n###');
    const notes = (firstSubsection < 0 ? section : section.slice(0, firstSubsection))
        .split('\n')
        .slice(1)
        .join('\n')
        .trim();

    if (!notes) {
        console.error(`The "## [${version}]" section has no summary paragraph; that paragraph becomes the release body.`);
        process.exit(1);
    }
    return notes;
}

const notes = releaseNotes();
console.log(`Publishing ${version} to ${RELEASE_REPO}…`);

// `releases/latest` resolves through the tag, so it is created here rather than by hand.
if (run('git', ['tag', '--list', version])) {
    console.log(`  ℹ tag ${version} already exists`);
} else {
    run('git', ['tag', '-a', version, '-m', `Release ${version}`]);
    run('git', ['push', 'origin', version]);
    console.log(`  ✓ tagged and pushed ${version}`);
}

// `gh` carries the assets: without them the installer has nothing to download. An existing
// release is refreshed rather than refused, so re-running after a fix is safe.
const releaseExists = (() => {
    try {
        run('gh', ['release', 'view', version, '-R', RELEASE_REPO]);
        return true;
    } catch {
        return false;
    }
})();

if (releaseExists) {
    run('gh', ['release', 'upload', version, '-R', RELEASE_REPO, '--clobber', ...ARTIFACTS]);
    run('gh', ['release', 'edit', version, '-R', RELEASE_REPO, '--title', version, '--notes', notes, '--latest']);
    console.log(`  ✓ release updated with ${ARTIFACTS.join(', ')}`);
} else {
    run('gh', ['release', 'create', version, '-R', RELEASE_REPO, '--title', version, '--notes', notes, '--latest', ...ARTIFACTS]);
    console.log(`  ✓ release created with ${ARTIFACTS.join(', ')}`);
}

console.log(`\nDone. https://github.com/${RELEASE_REPO}/releases/tag/${version}`);
