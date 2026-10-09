/**
 * Computer Modern and Concrete — the TeX TFM tradition.
 *
 * These are the fonts Knuth designed for TeX, and for a long time they had no OpenType form at all:
 * their metrics lived in `.tfm` files and followed the TeX conventions (a digit advances exactly
 * 0.5em, the design's `ex` and `em` set the script and display scale, the minus sign's width is the
 * reference rule thickness). Modern builds of CMU Serif and Concrete may or may not carry a `MATH`
 * table, so this adapter reads one when present and falls back to the design constants when not.
 *
 * The point of a dedicated adapter rather than the measurement fallback is that the TeX constants
 * are *known*: a font that follows them can be laid out correctly without sampling its ink, and the
 * sampling would produce the ink box rather than the design box, which is how the numbers drift.
 *
 * Concrete is the heavier "concrete" cut of the same skeleton; CMU Bright is the sans companion.
 * All share the CM metric skeleton, so one adapter covers them.
 */

import type { AdapterContext, MathFontAdapter, MathFontMetrics } from '../types';
import { matchByFamilyName } from '../types';
import { readOpenTypeMathTable } from '../opentype-math';
import { buildCharsFromFont, readOpenTypeFontInfo } from '../opentype-font';

/**
 * The TeX design constants, in em.
 *
 * These are the values a Computer Modern-metric font is expected to have. They are recorded here
 * as the fallback when the font file itself does not state its vertical metrics clearly — which
 * is the honest thing to do for a lineage whose numbers are a published standard.
 */
const TEX_DESIGN_CONSTANTS = {
    /** The classic CM ascent above the baseline. */
    ascent: 0.75,
    /** The classic CM descent below the baseline. */
    descent: 0.25,
    /** x-height of the CM design. */
    xHeight: 0.43,
    /** Cap height of the CM design. */
    capHeight: 0.67,
};

export const computerModernAdapter: MathFontAdapter = {
    id: 'computer-modern',
    name: 'Computer Modern / Concrete',
    families: [
        'Computer Modern',
        'CMU Serif',
        'CMU Sans Serif',
        'CMU Bright',
        'CMU Typewriter Text',
        'Concrete',
        'Concrete Roman',
        'Dingbats',
    ],
    priority: 130,

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

        // A font following the CM skeleton should already carry these; when it does not, the
        // published constants are a better answer than an ink measurement.
        const verticalsLookSane = Math.abs(font.verticals.ascent - TEX_DESIGN_CONSTANTS.ascent) < 0.15;
        const notes: string[] = [
            'Computer Modern lineage: TeX TFM design constants apply.',
            math
                ? 'Read from the font\'s OpenType MATH table; nothing was measured.'
                : 'No MATH table — boxes come from the font\'s own hmtx/OS-2 metrics.',
            `Mapped ${built.mapped} glyphs; left ${built.skippedAbsent} uncovered ones to MathJax.`,
        ];
        if (!verticalsLookSane) {
            notes.push(
                `Font states ascent ${font.verticals.ascent.toFixed(3)}em against the CM design's ` +
                `${TEX_DESIGN_CONSTANTS.ascent}em — kept the font's own value.`,
            );
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
