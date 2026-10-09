/**
 * Shared reader for the OpenType tables every math adapter needs.
 *
 * The `MATH` table says how maths should be laid out; these six tables say what the glyphs
 * themselves are — how wide each one advances, how far it rises above and sinks below the baseline.
 * Together they are enough to build MathJax's `[height, depth, width]` boxes without measuring
 * anything, which is the whole point of reading a font rather than sampling it on a canvas.
 *
 *   `head`  — units per em
 *   `maxp`  — number of glyphs
 *   `hhea`  — font-wide ascent / descent / line gap
 *   `hmtx`  — per-glyph advance widths
 *   `OS/2`  — typographic ascender / descender, cap height, x-height, weight class
 *   `cmap`  — which glyph id a codepoint maps to
 *
 * Every adapter was parsing these same six tables by hand; they live here so a family adapter is
 * about that family's mapping, not about table offsets.
 */

/** Font-wide vertical metrics, in em. */
export interface FontVerticalMetrics {
    /** Typographic ascender (preferred) or hhea ascent. Distance above the baseline. */
    ascent: number;
    /** Typographic descender (preferred) or hhea descent. Distance below the baseline, positive. */
    descent: number;
    /** Cap height above the baseline, when the font states it. */
    capHeight?: number;
    /** x-height above the baseline, when the font states it. */
    xHeight?: number;
    /** OS/2 weight class (400 regular, 700 bold). */
    weightClass: number;
}

/** What an adapter needs to know about the font file itself. */
export interface OpenTypeFontInfo {
    unitsPerEm: number;
    numGlyphs: number;
    verticals: FontVerticalMetrics;
    /** Advance width per glyph id, in design units. */
    advanceWidths: Uint16Array;
    /** Codepoint (decimal string) to glyph id. */
    cmap: Record<string, number>;
    /** Ascender/descender from `hhea`, in em — kept because some designs prefer them. */
    hhea: { ascent: number; descent: number; lineGap: number };
}

function tableDirectory(dv: DataView, base: number): Map<string, { offset: number; length: number }> {
    const out = new Map<string, { offset: number; length: number }>();
    const numTables = dv.getUint16(base + 4);
    for (let i = 0; i < numTables; i++) {
        const rec = base + 12 + i * 16;
        const tag = String.fromCharCode(dv.getUint8(rec), dv.getUint8(rec + 1), dv.getUint8(rec + 2), dv.getUint8(rec + 3));
        out.set(tag, { offset: dv.getUint32(rec + 8), length: dv.getUint32(rec + 12) });
    }
    return out;
}

/** OpenType collections share a header before the first font's directory. */
function fontBase(dv: DataView): number {
    const tag = String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3));
    if (tag === 'ttcf') {
        return dv.getUint32(12);
    }
    return 0;
}

/**
 * Read the structural tables out of a font file.
 *
 * @param binary - the whole font file
 * @returns the parsed info, or null when the file is not a readable OpenType/TrueType font
 */
export function readOpenTypeFontInfo(binary: ArrayBuffer): OpenTypeFontInfo | null {
    try {
        if (binary.byteLength < 12) {
            return null;
        }
        const dv = new DataView(binary);
        const base = fontBase(dv);
        const tables = tableDirectory(dv, base);
        if (tables.size === 0) {
            return null;
        }

        const head = tables.get('head');
        const maxp = tables.get('maxp');
        const hhea = tables.get('hhea');
        const hmtx = tables.get('hmtx');
        const os2 = tables.get('OS/2');
        if (!head || !maxp || !hhea || !hmtx) {
            return null;
        }

        const unitsPerEm = dv.getUint16(head.offset + 18) || 1000;
        const toEm = (design: number) => design / unitsPerEm;

        const numGlyphs = dv.getUint16(maxp.offset + 4);

        // hhea: ascender at +4, descender at +6, lineGap at +8, numberOfHMetrics at +34.
        const hheaAscent = dv.getInt16(hhea.offset + 4);
        const hheaDescent = dv.getInt16(hhea.offset + 6);
        const hheaLineGap = dv.getInt16(hhea.offset + 8);
        const numberOfHMetrics = dv.getUint16(hhea.offset + 34);

        // hmtx: numberOfHMetrics records of (advanceWidth, lsb), then remaining lsbs.
        const advanceWidths = new Uint16Array(numGlyphs);
        for (let i = 0; i < numGlyphs; i++) {
            const rec = i < numberOfHMetrics ? i : numberOfHMetrics - 1;
            advanceWidths[i] = dv.getUint16(hmtx.offset + rec * 4);
        }

        // OS/2: version at +0, usWeightClass at +4, sTypoAscender at +68, sTypoDescender at +70,
        // sCapHeight at +88 (version 2+), sxHeight at +86 (version 2+).
        let ascent = toEm(hheaAscent);
        let descent = toEm(Math.abs(hheaDescent));
        let capHeight: number | undefined;
        let xHeight: number | undefined;
        let weightClass = 400;
        if (os2 && os2.length >= 72) {
            weightClass = dv.getUint16(os2.offset + 4) || 400;
            const typoAscender = dv.getInt16(os2.offset + 68);
            const typoDescender = dv.getInt16(os2.offset + 70);
            if (typoAscender !== 0) {
                ascent = toEm(typoAscender);
                descent = toEm(Math.abs(typoDescender));
            }
            const version = dv.getUint16(os2.offset);
            if (version >= 2 && os2.length >= 90) {
                const sx = dv.getInt16(os2.offset + 86);
                const sc = dv.getInt16(os2.offset + 88);
                if (sx > 0) xHeight = toEm(sx);
                if (sc > 0) capHeight = toEm(sc);
            }
        }

        const cmap = readCmap(dv, tables.get('cmap'));

        return {
            unitsPerEm,
            numGlyphs,
            verticals: { ascent, descent, capHeight, xHeight, weightClass },
            advanceWidths,
            cmap,
            hhea: { ascent: toEm(hheaAscent), descent: toEm(Math.abs(hheaDescent)), lineGap: toEm(hheaLineGap) },
        };
    } catch {
        // A malformed font is the same as one we cannot use.
        return null;
    }
}

/**
 * Read the codepoint-to-glyph map.
 *
 * Only the formats that matter for text glyphs are handled — 4 (BMP) and 12 (full Unicode).
 * Anything else yields an empty map, and the caller then has no codepoint lookup to lean on.
 */
function readCmap(dv: DataView, table: { offset: number; length: number } | undefined): Record<string, number> {
    const out: Record<string, number> = {};
    if (!table) {
        return out;
    }
    try {
        const base = table.offset;
        const numTables = dv.getUint16(base + 2);
        // Prefer a full Unicode (format 12) subtable, then a BMP (format 4) one.
        let chosen = -1;
        let chosenScore = -1;
        for (let i = 0; i < numTables; i++) {
            const rec = base + 4 + i * 8;
            const platformId = dv.getUint16(rec);
            const encodingId = dv.getUint16(rec + 2);
            const offset = dv.getUint32(rec + 4);
            const format = dv.getUint16(base + offset);
            let score = -1;
            if (format === 12) score = 3;
            else if (format === 4) score = 2;
            if (platformId === 3 && encodingId === 10 && score > 0) score += 1;
            if (score > chosenScore) {
                chosenScore = score;
                chosen = base + offset;
            }
        }
        if (chosen < 0) {
            return out;
        }

        const format = dv.getUint16(chosen);
        if (format === 4) {
            const segCountX2 = dv.getUint16(chosen + 6);
            const segCount = segCountX2 / 2;
            const endCodes = chosen + 14;
            const startCodes = endCodes + segCountX2 + 2;
            const idDeltas = startCodes + segCountX2;
            const idRangeOffsets = idDeltas + segCountX2;
            for (let s = 0; s < segCount; s++) {
                const end = dv.getUint16(endCodes + s * 2);
                const start = dv.getUint16(startCodes + s * 2);
                const delta = dv.getInt16(idDeltas + s * 2);
                const rangeOffset = dv.getUint16(idRangeOffsets + s * 2);
                for (let c = start; c <= end && c !== 0xffff; c++) {
                    let glyph: number;
                    if (rangeOffset === 0) {
                        glyph = (c + delta) & 0xffff;
                    } else {
                        const at = idRangeOffsets + s * 2 + rangeOffset + (c - start) * 2;
                        if (at + 2 > dv.byteLength) continue;
                        glyph = dv.getUint16(at);
                        if (glyph !== 0) glyph = (glyph + delta) & 0xffff;
                    }
                    if (glyph !== 0) {
                        out[String(c)] = glyph;
                    }
                }
            }
        } else if (format === 12) {
            const nGroups = dv.getUint32(chosen + 12);
            for (let g = 0; g < nGroups; g++) {
                const rec = chosen + 16 + g * 12;
                const startChar = dv.getUint32(rec);
                const endChar = dv.getUint32(rec + 4);
                const startGlyph = dv.getUint32(rec + 8);
                for (let c = startChar; c <= endChar; c++) {
                    out[String(c)] = startGlyph + (c - startChar);
                }
            }
        }
    } catch {
        // An unreadable cmap just means no codepoint lookup.
    }
    return out;
}

/**
 * The layout box of one glyph, in em, ready for MathJax's `[height, depth, width]`.
 *
 * Vertical extents come from the font-wide ascender/descender — OpenType has no per-glyph vertical
 * metrics in the common case, and the MATH table supplies per-glyph corrections where a design needs
 * them, which the adapter layers on top.
 */
export function glyphLayoutBox(
    font: OpenTypeFontInfo,
    glyphId: number,
): { height: number; depth: number; width: number } | null {
    if (glyphId < 0 || glyphId >= font.numGlyphs) {
        return null;
    }
    const advance = font.advanceWidths[glyphId];
    if (!advance) {
        return null;
    }
    return {
        height: font.verticals.ascent,
        depth: font.verticals.descent,
        width: advance / font.unitsPerEm,
    };
}

/** Glyph id for a codepoint, or null when the font has no such glyph. */
export function glyphForCodepoint(font: OpenTypeFontInfo, codepoint: number): number | null {
    const id = font.cmap[String(codepoint)];
    return typeof id === 'number' && id > 0 ? id : null;
}

/** True when the font carries a glyph for this codepoint. */
export function hasCodepoint(font: OpenTypeFontInfo, codepoint: number): boolean {
    return glyphForCodepoint(font, codepoint) !== null;
}

/**
 * Codepoint ranges the plugin maps into MathJax's plain variants.
 *
 * Anything outside these keeps whatever MathJax already had, which is the safe outcome: the plugin
 * only overrides glyphs it re-fonts, and MathJax's own faces stay in charge of the rest.
 */
export const MAPPED_CODEPOINT_RANGES: Array<[number, number]> = [
    [0x20, 0x7e],       // ASCII printable
    [0xa0, 0xff],       // Latin-1 supplement
    [0x2000, 0x206f],   // general punctuation
    [0x2070, 0x209f],   // super/subscripts
    [0x20a0, 0x20bf],   // currency
    [0x2100, 0x214f],   // letterlike
    [0x2190, 0x21ff],   // arrows
    [0x2200, 0x22ff],   // mathematical operators
    [0x2300, 0x23ff],   // miscellaneous technical
    [0x25a0, 0x25ff],   // geometric shapes
    [0x2600, 0x26ff],   // miscellaneous symbols
    [0x27c0, 0x27ef],   // miscellaneous mathematical symbols-A
    [0x2980, 0x29ff],   // miscellaneous mathematical symbols-B
    [0x2a00, 0x2aff],   // supplemental mathematical operators
    [0x1d400, 0x1d7ff], // mathematical alphanumerics
];

/** A named span of codepoints the font is known not to cover. */
export interface CoverageGap {
    name: string;
    from: number;
    to: number;
}

/** What `buildCharsFromFont` decided about one codepoint. */
export interface CharsBuildResult {
    chars: Record<string, [number, number, number]>;
    /** How many codepoints got a box. */
    mapped: number;
    /** How many were skipped because the font is known not to cover them. */
    skippedGap: number;
    /** How many were skipped because the font has no glyph. */
    skippedAbsent: number;
    /** Gap names that were actually hit while building. */
    gapsHit: string[];
}

/**
 * Build MathJax-style glyph boxes for the mapped codepoints a font actually covers.
 *
 * This is the shared half of every family adapter: walk the ranges the plugin re-fonts, ask the
 * font whether it has each codepoint, and turn the font's own advance and vertical metrics into
 * a layout box. Gaps the font is known to have are left alone so those glyphs keep MathJax's
 * numbers — which is what stops a missing Script or Fraktur letter from rendering as nothing.
 */
export function buildCharsFromFont(
    font: OpenTypeFontInfo,
    gaps: CoverageGap[] = [],
    ranges: Array<[number, number]> = MAPPED_CODEPOINT_RANGES,
): CharsBuildResult {
    const out: CharsBuildResult = {
        chars: {},
        mapped: 0,
        skippedGap: 0,
        skippedAbsent: 0,
        gapsHit: [],
    };

    for (const [from, to] of ranges) {
        for (let code = from; code <= to; code++) {
            const gap = gaps.find(g => code >= g.from && code <= g.to);
            if (gap) {
                out.skippedGap++;
                if (!out.gapsHit.includes(gap.name)) {
                    out.gapsHit.push(gap.name);
                }
                continue;
            }

            const glyphId = glyphForCodepoint(font, code);
            if (glyphId === null) {
                out.skippedAbsent++;
                continue;
            }
            const box = glyphLayoutBox(font, glyphId);
            if (!box) {
                out.skippedAbsent++;
                continue;
            }
            out.chars[String(code)] = [box.height, box.depth, box.width];
            out.mapped++;
        }
    }

    return out;
}

/** True when the codepoint is inside one of the ranges the plugin maps. */
export function isMappedCodepoint(codepoint: number, ranges: Array<[number, number]> = MAPPED_CODEPOINT_RANGES): boolean {
    for (const [from, to] of ranges) {
        if (codepoint >= from && codepoint <= to) {
            return true;
        }
    }
    return false;
}
