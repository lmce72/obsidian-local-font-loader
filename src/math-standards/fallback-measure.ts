/**
 * Measurement fallback, for fonts that carry no math metadata at all.
 *
 * This is the path that has to guess, and it is why the standards-based adapters above exist: a
 * canvas measurement is an *ink bounding box*, while MathJax's table wants a *layout box*, and the
 * two are not the same standard. The guess is kept because a font like Minion Pro — a text font
 * with no `MATH` table — still has to work as a math font, but it is now the last resort rather
 * than the only tool.
 *
 * Three traps this version is built around:
 *
 *  1. **Canvas silently falls back.** When the font lacks a codepoint, `measureText` does not fail;
 *     it returns the metrics of whatever font the browser substituted. So "the font has no glyph"
 *     cannot be detected by a zero result. It is detected here by measuring an unfailingly-missing
 *     codepoint with the same font and comparing, which is the only signal the platform gives.
 *  2. **Private-use codepoints are not ours to size.** U+E000–U+F8FF are MathJax's own stretchy
 *     assembly pieces, drawn from its own faces. Measuring them with another font is meaningless.
 *  3. **Stretchy targets belong to whoever draws the pieces.** Since the pieces come from MathJax's
 *     fonts here, `delimiters` is never produced — MathJax keeps its own sizes for braces and
 *     arrows, which is what keeps brace height and span correct.
 */

import type { AdapterContext, GlyphMetrics, MathFontAdapter, MathFontMetrics } from './types';
import { matchByFamilyName } from './types';

/** The measure size: large enough that rounding is negligible, small enough to stay cheap. */
const PROBE_SIZE = 200;

/**
 * A codepoint no font carries. Measuring it reveals what "missing glyph" looks like for *this*
 * font's fallback chain, which is what makes presence detection possible at all.
 */
const NOT_A_GLYPH = '\u{10FFFD}';

/** Private-use area: MathJax's stretchy assembly pieces live here. Never measure them. */
function isPrivateUse(code: number): boolean {
    return (code >= 0xe000 && code <= 0xf8ff) || (code >= 0xf0000 && code <= 0xffffd) || (code >= 0x100000 && code <= 0x10fffd);
}

/** Control characters carry no ink and measuring them is meaningless. */
function isControl(code: number): boolean {
    return code < 0x20 || (code >= 0x7f && code <= 0x9f);
}

interface Ink { width: number; ascent: number; descent: number; }

function measureWith(ctx: CanvasRenderingContext2D, family: string, text: string): Ink {
    ctx.font = `${PROBE_SIZE}px "${family.replace(/"/g, '')}"`;
    const m = ctx.measureText(text);
    return {
        width: m.width,
        ascent: m.actualBoundingBoxAscent || 0,
        descent: m.actualBoundingBoxDescent || 0,
    };
}

/** Two measurements are the same fallback when every field matches. */
function sameInk(a: Ink, b: Ink): boolean {
    return a.width === b.width && a.ascent === b.ascent && a.descent === b.descent;
}

export const measurementFallbackAdapter: MathFontAdapter = {
    id: 'fallback-measure',
    name: 'Measured (fallback)',
    // Claims nothing by name: it is reached only when every named adapter declines.
    families: [],
    priority: 1000,
    matches(_familyName: string): boolean {
        return true;
    },
    build(_binary: ArrayBuffer, ctx: AdapterContext): MathFontMetrics | null {
        const familyName = (ctx.familyName || '').trim();
        if (!familyName) {
            return null;
        }

        const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
        const c2d = canvas ? canvas.getContext('2d') : null;
        if (!c2d) {
            return null;
        }

        const notes: string[] = [];
        const notdef = measureWith(c2d, familyName, NOT_A_GLYPH);

        // What to measure: the codepoints MathJax draws from the user's font — the plain variants,
        // which is what the plugin re-fonts. Size variants and assembly pieces are excluded here
        // (they are private-use) and by the caller's font rules, which keep MathJax's faces.
        const chars: Record<string, GlyphMetrics> = {};
        let measured = 0;
        let skippedMissing = 0;

        // Probe a practical set rather than the whole table: ASCII, Latin-1, common math operators,
        // and the math alphanumerics MathJax maps to. Anything outside this keeps MathJax's value,
        // which is the safe outcome.
        const ranges: Array<[number, number]> = [
            [0x20, 0x7e],   // ASCII printable
            [0xa0, 0xff],   // Latin-1 supplement
            [0x2000, 0x206f], // general punctuation
            [0x2070, 0x209f], // super/subscripts
            [0x20a0, 0x20bf], // currency
            [0x2100, 0x214f], // letterlike
            [0x2190, 0x21ff], // arrows
            [0x2200, 0x22ff], // math operators
            [0x2300, 0x23ff], // misc technical
            [0x25a0, 0x25ff], // geometric shapes
            [0x2600, 0x26ff], // misc symbols
            [0x27c0, 0x27ef], // misc math symbols-A
            [0x2980, 0x29ff], // misc math symbols-B
            [0x2a00, 0x2aff], // supplemental math operators
            [0x1d400, 0x1d7ff], // math alphanumerics
        ];

        for (const [from, to] of ranges) {
            for (let code = from; code <= to; code++) {
                if (isPrivateUse(code) || isControl(code)) {
                    continue;
                }
                const text = String.fromCodePoint(code);
                const ink = measureWith(c2d, familyName, text);

                // No glyph: identical to the unfailingly-missing probe, so keep MathJax's numbers.
                if (sameInk(ink, notdef)) {
                    skippedMissing++;
                    continue;
                }

                const width = ink.width / PROBE_SIZE;
                const ascent = ink.ascent / PROBE_SIZE;
                const descent = ink.descent / PROBE_SIZE;

                // A layout box has no negative extents: MathJax's table is [height, depth, width]
                // where height and depth are distances from the baseline, so an ink descent that
                // lands above the baseline (a hyphen, say) simply means depth 0.
                const height = Math.max(0, ascent);
                const depth = Math.max(0, descent);

                if (!(width > 0)) {
                    // Zero advance would collapse the glyph onto its neighbour.
                    skippedMissing++;
                    continue;
                }

                chars[String(code)] = [height, depth, width];
                measured++;
            }
        }

        if (measured === 0) {
            notes.push('No glyph of the probed set could be measured; leaving MathJax metrics in place.');
            return null;
        }

        notes.push(`Measured ${measured} glyphs; kept MathJax metrics for ${skippedMissing} absent or unusable ones.`);
        notes.push('Stretchy delimiter sizes were left to MathJax: this font does not own the assembly.');
        if (skippedMissing > 0) {
            notes.push(`Presence detection uses a missing-codepoint baseline, not zero-width, because canvas falls back silently.`);
        }

        return {
            source: 'measured',
            chars,
            // Deliberately absent: see the note above — braces and arrows are assembled from
            // MathJax's own pieces, so their target sizes must stay MathJax's.
            delimiters: undefined,
            ownsStretchyAssembly: false,
            notes,
        };
    },
};

export const matchFallbackFamily = matchByFamilyName;
