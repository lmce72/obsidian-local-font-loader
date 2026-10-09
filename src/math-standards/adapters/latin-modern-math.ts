/**
 * Latin Modern Math — the Computer Modern lineage, modernised into OpenType.
 *
 * Latin Modern is the OpenType revival of Knuth's Computer Modern, and Latin Modern Math is its
 * math companion. It follows the TeX design constants rather than a Times-like design: the metric
 * skeleton (digit advance 0.5em, the classic ex/em of the CM design) is the reference every TeX
 * document inherits, and MathJax's own TeX faces come from that same tradition.
 *
 * That kinship is the interesting part. Latin Modern Math is the one family where "metrically
 * compatible with MathJax's TeX fonts" is close to true, so MathJax's own size variants
 * (TEX-S1..S4) are a reasonable face for tall delimiters. The plugin still keeps the assembly
 * pieces on MathJax's faces, so the delimiter targets are left alone.
 *
 * Known gap, stated by the vault's font notes: Latin Modern Math does not cover lowercase Script
 * (the 1111-coverage figure). Those glyphs keep MathJax's own metrics and faces.
 *
 * It ships a full OpenType `MATH` table, so everything is read rather than measured.
 */

import type { AdapterContext, MathFontAdapter, MathFontMetrics } from '../types';
import { matchByFamilyName } from '../types';
import { readOpenTypeMathTable } from '../opentype-math';
import { buildCharsFromFont, readOpenTypeFontInfo, type CoverageGap } from '../opentype-font';

/** Codepoints this family is known not to carry. */
const KNOWN_GAPS: CoverageGap[] = [
    { name: 'lowercase Script', from: 0x1d4b6, to: 0x1d4cf },
];

export const latinModernMathAdapter: MathFontAdapter = {
    id: 'latin-modern-math',
    name: 'Latin Modern Math',
    families: ['Latin Modern Math', 'Latin Modern', 'LM Math', 'Latin Modern Math Regular'],
    priority: 30,

    matches(familyName: string): boolean {
        return matchByFamilyName(this, familyName);
    },

    build(binary: ArrayBuffer, _ctx: AdapterContext): MathFontMetrics | null {
        const font = readOpenTypeFontInfo(binary);
        if (!font) {
            return null;
        }
        const math = readOpenTypeMathTable(binary);
        const built = buildCharsFromFont(font, KNOWN_GAPS);
        if (built.mapped === 0) {
            return null;
        }

        const notes: string[] = [
            'Computer Modern lineage: metric skeleton follows the TeX design constants.',
            math
                ? 'Read from the font\'s OpenType MATH table; nothing was measured.'
                : 'No MATH table found — boxes come from the font\'s own hmtx/OS-2 metrics.',
            `Mapped ${built.mapped} glyphs; left ${built.skippedAbsent} uncovered ones to MathJax.`,
        ];
        for (const gap of built.gapsHit) {
            notes.push(`Gap left to MathJax: ${gap}.`);
        }
        if (math && math.extendedShapes.size > 0) {
            notes.push(`${math.extendedShapes.size} glyphs are extended shapes.`);
        }

        return {
            source: math ? 'opentype-math' : 'tex-tfm',
            gaps: built.gapsHit.map(g => `${g} — those letters come from MathJax`),
            chars: built.chars,
            // Left to MathJax: it draws the stretchy pieces from its own faces.
            delimiters: undefined,
            ownsStretchyAssembly: false,
            constants: math ? math.constants : undefined,
            notes,
        };
    },
};
