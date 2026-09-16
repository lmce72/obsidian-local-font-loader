/**
 * Parses every source module.
 *
 * A bundle fails loudly on a syntax error, but it reports only the first one and only along the
 * paths it actually reached — this checks each module on its own, which is what makes it useful
 * before a commit.
 *
 * Run: bun run check
 */
import { readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');

/** Every .js file under src/, at any depth. */
function collect(dir) {
    return readdirSync(dir).flatMap((entry) => {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) return collect(full);
        return entry.endsWith('.js') ? [full] : [];
    });
}

const files = collect(SRC).sort();
let failed = 0;

for (const file of files) {
    const shown = relative(ROOT, file);
    const { success, stderr } = Bun.spawnSync(['node', '--check', file], { stderr: 'pipe' });
    if (success) {
        console.log(`  ok   ${shown}`);
    } else {
        failed++;
        console.error(`  FAIL ${shown}\n${stderr.toString().trim()}`);
    }
}

console.log(failed ? `\n${failed} of ${files.length} module(s) failed to parse.` : `\n${files.length} module(s) parsed.`);
process.exit(failed ? 1 : 0);
