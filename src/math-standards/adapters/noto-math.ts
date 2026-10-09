/**
 * Noto Sans Math and Noto Serif Math — Google's coverage-first maths fonts.
 *
 * The Noto maths fonts are built for breadth rather than for a particular typographic lineage:
 * they cover the math alphanumerics thoroughly and keep the design deliberately plain so symbols
 * read the same way across scripts. Both families are served by this one module because their
 * metric treatment is the same and only the family names differ.
 *
 * Both ship an OpenType `MATH` table, so the metrics are read, never measured. Noto's numbers are
 * on the compact side — a relatively small x-height and a low axis — and those are design facts,
 * not errors, so they come straight from the table.
 */

import type { AdapterContext, MathFontAdapter, MathFontMetrics } from '../types';
import { matchByFamilyName } from '../types';
import { readOpenTypeMathTable } from '../opentype-math';
import { buildCharsFromFont, readOpenTypeFontInfo } from '../opentype-font';

export const notoMathAdapter: MathFontAdapter = {
    id: 'noto-math',
    name: 'Noto Sans/Serif Math',
    families: ['Noto Sans Math', 'Noto Serif Math', 'Noto Sans Math Mono'],
    priority: 100,

    matches(familyName: string): boolean {
        return matchByFamilyName(this, familyName);
    },

    build(binary: ArrayBuffer, _ctx: AdapterContext): MathFontMetrics | null {
        const font = readOpenTypeFontInfo(binary);
        if (!font) {
            return null;
        }
        const math = readOpenTypeMathTable(binary);
        const built = buildCharsFromFont(font);
        if (built.mapped === 0) {
            return null;
        }

        const notes: string[] = [
            'Noto maths fonts: coverage-first design, deliberately plain shapes.',
            math
                ? 'Read from the font\'s OpenType MATH table; nothing was measured.'
                : 'No MATH table found — boxes come from the font\'s own hmtx/OS-2 metrics.',
            `Mapped ${built.mapped} glyphs; left ${built.skippedAbsent} uncovered ones to MathJax.`,
        ];
        if (math && math.extendedShapes.size > 0) {
            notes.push(`${math.extendedShapes.size} glyphs are extended shapes.`);
        }

        return {
            source: math ? 'opentype-math' : 'tex-tfm',
            chars: built.chars,
            delimiters: undefined,
            ownsStretchyAssembly: false,
            constants: math ? math.constants : undefined,
            notes,
        };
    },
};
