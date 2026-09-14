/**
 * Extracts the release notes for the current tag from CHANGELOG.md.
 *
 * The tag that triggered the workflow names the version; its section — everything between
 * "## [<version>]" and the next "## [" heading — becomes the GitHub Release body, so the
 * published release always carries the fix list for that exact version.
 *
 * Writes RELEASE_NOTES.md next to the repository root. When no matching section exists the
 * file is still written (with a short fallback) so the release step never fails on a missing
 * heading, and the reason is printed for the workflow log.
 *
 * Run locally:  GITHUB_REF_NAME=1.4.0 node .github/extract-release-notes.js
 */

const fs = require('fs');
const path = require('path');

const CHANGELOG = 'CHANGELOG.md';
const OUTPUT = 'RELEASE_NOTES.md';
const VERSION_HEADING = /^##\s+\[([^\]]+)\]/;

/** Reads the tag the workflow was triggered by, tolerating an optional leading "v". */
function resolveVersion() {
    const ref = process.env.GITHUB_REF_NAME || '';
    return ref.replace(/^v/, '').trim();
}

/** Returns the body of the section for `version`, or null when there is none. */
function extractSection(changelog, version) {
    const lines = changelog.split('\n');
    const start = lines.findIndex(line => {
        const match = line.match(VERSION_HEADING);
        return match && match[1] === version;
    });

    if (start === -1) {
        return null;
    }

    let end = lines.length;
    for (let i = start + 1; i < lines.length; i++) {
        if (VERSION_HEADING.test(lines[i])) {
            end = i;
            break;
        }
    }

    return lines.slice(start + 1, end).join('\n').trim();
}

function main() {
    const version = resolveVersion();

    if (!version) {
        console.warn('No GITHUB_REF_NAME set; writing a placeholder release body.');
        fs.writeFileSync(OUTPUT, 'See CHANGELOG.md for details.\n');
        return;
    }

    let changelog;
    try {
        changelog = fs.readFileSync(path.resolve(process.cwd(), CHANGELOG), 'utf8');
    } catch (error) {
        console.error(`Could not read ${CHANGELOG}: ${error.message}`);
        fs.writeFileSync(OUTPUT, 'See CHANGELOG.md for details.\n');
        return;
    }

    const section = extractSection(changelog, version);

    if (!section) {
        console.warn(`No "## [${version}]" section found in ${CHANGELOG}; writing a placeholder release body.`);
        fs.writeFileSync(OUTPUT, `Release ${version}. See CHANGELOG.md for details.\n`);
        return;
    }

    fs.writeFileSync(OUTPUT, `${section}\n`);
    console.log(`Wrote ${OUTPUT} from the "${version}" section (${section.length} chars).`);
}

main();
