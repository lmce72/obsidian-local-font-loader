/**
 * Fira Math — the maths companion to Fira Sans.
 *
 * Fira is Mozilla's humanist sans, and Fira Math extends it with the math alphanumerics and
 * operators. Being sans, its vertical proportions sit differently from the Times and Palatino
 * families: the x-height is large and the ascenders short, so a straight swap of a serif maths
 * font into a Fira-set document changes the texture of every formula. Those proportions come from
 * the font's own tables here rather than from any assumption about what a maths font "should" be.
 *
 * It ships an OpenType `MATH` table, so the metrics are read, never measured.
 */

import type { AdapterContext, MathFontAdapter, MathFontMetrics } from '../types';
import { matchByFamilyName } from '../types';
import { readOpenTypeMathTable } from '../opentype-math';
import { buildCharsFromFont, readOpenTypeFontInfo } from '../opentype-font';

export const firaMathAdapter: MathFontAdapter = {
    id: 'fira-math',
    name: 'Fira Math',
    families: ['Fira Math'],
    priority: 110,

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
            'Fira lineage: humanist sans, large x-height and short ascenders.',
            math
                ? 'Read from the font\'s OpenType MATH table; nothing was measured.'
                : 'No MATH table found — boxes come from the font\'s own hmtx/OS-2 metrics.',
            `Mapped ${built.mapped} glyphs; left ${built.skippedAbsent} uncovered ones to MathJax.`,
        ];
        if (font.verticals.xHeight) {
            notes.push(`x-height ${font.verticals.xHeight.toFixed(3)}em, ascent ${font.verticals.ascent.toFixed(3)}em.`);
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
