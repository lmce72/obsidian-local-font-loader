/**
 * OpenType `MATH` table reader.
 *
 * The spec is https://learn.microsoft.com/en-us/typography/opentype/spec/math — the table gives a
 * math layout engine exactly what it needs and what cannot be recovered by measuring text:
 * font-wide constants (axis height, rule thickness, script scaling), per-glyph italics correction,
 * which glyphs count as "extended shapes", and how a stretchy delimiter is assembled from parts
 * with connectors and extender flags.
 *
 * Everything here returns values in **em** (design units divided by `unitsPerEm`), ready to be
 * mapped into MathJax's table. Nothing is measured; nothing is guessed.
 */

import type { GlyphMetrics, MathConstants } from './types';

/** One part of a glyph assembly — how a stretchy delimiter is built from pieces. */
export interface GlyphPart {
    glyphId: number;
    startConnectorLength: number;
    endConnectorLength: number;
    fullAdvance: number;
    isExtender: boolean;
}

/** How one glyph grows to a requested size. */
export interface GlyphConstruction {
    /** Ready-made variants, in the direction of growth, with their measurement in em. */
    variants: Array<{ glyphId: number; advance: number }>;
    /** Assembly recipe, when the shape is built from parts. Null when the font offers none. */
    assembly: {
        italicCorrection: number;
        parts: GlyphPart[];
    } | null;
}

/** Everything read out of a `MATH` table, already converted to em. */
export interface OpenTypeMathTable {
    unitsPerEm: number;
    constants: MathConstants;
    /** Per-glyph italics correction, in em, keyed by decimal glyph id. */
    italicCorrection: Record<string, number>;
    /** Glyph ids that are extended shapes (positioning must use their ink box, not the baseline). */
    extendedShapes: Set<number>;
    /** Vertically growing glyphs, keyed by decimal glyph id. */
    vertVariants: Record<string, GlyphConstruction>;
    /** Horizontally growing glyphs, keyed by decimal glyph id. */
    horizVariants: Record<string, GlyphConstruction>;
    /** Minimum connector overlap for assemblies, in em. */
    minConnectorOverlap: number;
}

/** A record that may carry a device-table offset: we only want the base value. */
type Reader = {
    u16: (o: number) => number;
    i16: (o: number) => number;
    u32: (o: number) => number;
    bytes: Uint8Array;
};

function makeReader(bytes: Uint8Array): Reader {
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return {
        u16: o => dv.getUint16(o),
        i16: o => dv.getInt16(o),
        u32: o => dv.getUint32(o),
        bytes,
    };
}

/** Find a table's offset and length in the font's table directory. */
function findTable(dv: DataView, tag: string): { offset: number; length: number } | null {
    const numTables = dv.getUint16(4);
    for (let i = 0; i < numTables; i++) {
        const rec = 12 + i * 16;
        const t = String.fromCharCode(dv.getUint8(rec), dv.getUint8(rec + 1), dv.getUint8(rec + 2), dv.getUint8(rec + 3));
        if (t === tag) {
            return { offset: dv.getUint32(rec + 8), length: dv.getUint32(rec + 12) };
        }
    }
    return null;
}

/** True for an OpenType collection (`.ttc`), whose header differs from a plain font. */
function isCollection(dv: DataView): boolean {
    const tag = String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3));
    return tag === 'ttcf';
}

/**
 * Parse the `MATH` table out of a font file.
 *
 * @param binary - the whole font file
 * @returns the parsed table, or null when the font has none (which is normal and means the caller
 *          should fall back to another adapter)
 */
export function readOpenTypeMathTable(binary: ArrayBuffer): OpenTypeMathTable | null {
    try {
        const bytes = new Uint8Array(binary);
        const dv = new DataView(binary);
        if (binary.byteLength < 12) return null;

        // A collection stores several fonts after a shared header; take the first one, which is what
        // a family file hands us in practice.
        let base = 0;
        if (isCollection(dv)) {
            const numFonts = dv.getUint32(8);
            if (numFonts < 1) return null;
            base = dv.getUint32(12);
        }

        const header = findTable(new DataView(binary, base), 'MATH');
        if (!header) return null;
        const mathOff = base + header.offset;
        if (mathOff + 10 > binary.byteLength) return null;

        const version = dv.getUint16(mathOff);
        if (version !== 1) return null;
        const constantsOff = mathOff + dv.getUint16(mathOff + 4);
        const glyphInfoOff = mathOff + dv.getUint16(mathOff + 6);
        const variantsOff = mathOff + dv.getUint16(mathOff + 8);

        const unitsPerEm = readUnitsPerEm(dv, base) || 1000;
        const toEm = (design: number) => design / unitsPerEm;

        const r = makeReader(bytes.subarray(mathOff));
        const constants = readConstants(r, constantsOff - mathOff, toEm);

        const info = readGlyphInfo(r, glyphInfoOff - mathOff, toEm);
        const variants = readVariants(r, variantsOff - mathOff, toEm);

        return {
            unitsPerEm,
            constants,
            italicCorrection: info.italicCorrection,
            extendedShapes: info.extendedShapes,
            vertVariants: variants.vert,
            horizVariants: variants.horiz,
            minConnectorOverlap: variants.minConnectorOverlap,
        };
    } catch {
        // A malformed table is the same as no table: the caller falls back.
        return null;
    }
}

function readUnitsPerEm(dv: DataView, base: number): number {
    try {
        const head = findTable(new DataView(dv.buffer, dv.byteOffset + base), 'head');
        if (!head) return 0;
        // unitsPerEm sits at offset 18 in `head`.
        return dv.getUint16(base + head.offset + 18);
    } catch {
        return 0;
    }
}

/** A MathValueRecord is a base value plus an optional device offset; only the base matters here. */
function valueRecord(r: Reader, at: number, toEm: (n: number) => number): number {
    return toEm(r.i16(at));
}

function readConstants(r: Reader, at: number, toEm: (n: number) => number): MathConstants {
    // Field order follows the OpenType `MathConstants` table, and the widths matter:
    //
    //   0   int16        scriptPercentScaleDown
    //   2   int16        scriptScriptPercentScaleDown
    //   4   UFWORD       delimitedSubFormulaMinHeight     <- 2 bytes, not a value record
    //   6   UFWORD       displayOperatorMinHeight         <- 2 bytes, not a value record
    //   8   MathValueRecord mathLeading                   <- 4 bytes from here on
    //  12   MathValueRecord axisHeight
    //  16   MathValueRecord accentBaseHeight
    //  ...  (the remaining value records, 4 bytes each)
    //
    // Treating the two UFWORDs as value records shifts everything after them by four bytes, which
    // silently reads `accentBaseHeight` into `axisHeight`. Measured against XITS Math: the wrong
    // layout reports axisHeight 0.45em (its x-height) instead of 0.25em (its actual axis), and every
    // later constant lands on its neighbour. Verified against the font's own bytes.
    const out: MathConstants = {};
    try {
        let p = at;
        out.scriptPercentScaleDown = r.u16(p) / 100;
        p += 2;
        out.scriptScriptPercentScaleDown = r.u16(p) / 100;
        p += 2;
        p += 2; // delimitedSubFormulaMinHeight
        p += 2; // displayOperatorMinHeight

        p += 4; // mathLeading
        out.axisHeight = valueRecord(r, p, toEm);
        p += 4;

        // accentBaseHeight, flattenedAccentBaseHeight,
        // subscriptShiftDown, subscriptTopMax, subscriptBaselineDropMin,
        // superscriptShiftUp, superscriptShiftUpCramped, superscriptBottomMin,
        // superscriptBaselineDropMax, subSuperscriptGapMin,
        // superscriptBottomMaxWithSubscript, spaceAfterScript,
        // upperLimitGapMin, upperLimitBaselineRiseMin, lowerLimitGapMin, lowerLimitBaselineDropMin,
        // stackTopShiftUp, stackTopDisplayStyleShiftUp, stackBottomShiftDown,
        // stackBottomDisplayStyleShiftDown, stackGapMin, stackDisplayStyleGapMin,
        // stretchStackTopShiftUp, stretchStackBottomShiftDown,
        // stretchStackGapAboveMin, stretchStackGapBelowMin,
        // fractionNumeratorShiftUp, fractionNumeratorDisplayStyleShiftUp,
        // fractionDenominatorShiftDown, fractionDenominatorDisplayStyleShiftDown,
        // fractionNumeratorGapMin, fractionNumDisplayStyleGapMin
        p += 31 * 4;
        out.fractionRuleThickness = valueRecord(r, p, toEm);
        p += 4;
        // fractionDenominatorGapMin, fractionDenomDisplayStyleGapMin,
        // skewedFractionHorizontalGap, skewedFractionVerticalGap,
        // overbarVerticalGap, overbarRuleThickness
        p += 6 * 4;
        out.overbarExtraAscender = valueRecord(r, p, toEm);
        p += 4;
        // underbarVerticalGap, underbarRuleThickness
        p += 2 * 4;
        out.underbarExtraDescender = valueRecord(r, p, toEm);
        p += 4;
        // radicalVerticalGap, radicalDisplayStyleVerticalGap
        p += 2 * 4;
        out.radicalRuleThickness = valueRecord(r, p, toEm);
    } catch {
        // Partial constants are still useful; missing fields are simply left undefined.
    }
    return out;
}

function readCoverage(r: Reader, at: number): number[] {
    // Coverage format 1: format(2) count(2) glyphId[](2 each)
    // Coverage format 2: format(2) rangeCount(2) then ranges (start, end, startCoverageIndex)
    try {
        const format = r.u16(at);
        const ids: number[] = [];
        if (format === 1) {
            const count = r.u16(at + 2);
            for (let i = 0; i < count; i++) ids.push(r.u16(at + 4 + i * 2));
        } else if (format === 2) {
            const ranges = r.u16(at + 2);
            for (let i = 0; i < ranges; i++) {
                const rec = at + 4 + i * 6;
                const start = r.u16(rec);
                const end = r.u16(rec + 2);
                for (let g = start; g <= end; g++) ids.push(g);
            }
        }
        return ids;
    } catch {
        return [];
    }
}

function readGlyphInfo(r: Reader, at: number, toEm: (n: number) => number) {
    const italicCorrection: Record<string, number> = {};
    const extendedShapes = new Set<number>();
    try {
        const italicsOff = at + r.u16(at);
        const topAccentOff = at + r.u16(at + 2);
        const extShapeOff = at + r.u16(at + 4);
        // MathKernInfo at at+6 — not needed for metrics adoption.

        if (italicsOff > at) {
            // MathItalicsCorrectionInfo:
            //   Offset16 italicsCorrectionCoverageOffset   (from the start of this table)
            //   uint16   italicsCorrectionCount
            //   MathValueRecord italicsCorrection[count]
            const covOff = italicsOff + r.u16(italicsOff);
            const count = r.u16(italicsOff + 2);
            const ids = readCoverage(r, covOff);
            for (let i = 0; i < Math.min(count, ids.length); i++) {
                italicCorrection[String(ids[i])] = valueRecord(r, italicsOff + 4 + i * 4, toEm);
            }
        }

        if (extShapeOff > at) {
            const ids = readCoverage(r, extShapeOff);
            for (const id of ids) extendedShapes.add(id);
        }
    } catch {
        // Best effort.
    }
    return { italicCorrection, extendedShapes };
}

function readVariants(r: Reader, at: number, toEm: (n: number) => number) {
    const vert: Record<string, GlyphConstruction> = {};
    const horiz: Record<string, GlyphConstruction> = {};
    let minConnectorOverlap = 0;
    try {
        minConnectorOverlap = toEm(r.u16(at));
        const vertCovOff = at + r.u16(at + 2);
        const horizCovOff = at + r.u16(at + 4);
        const vertCount = r.u16(at + 6);
        const horizCount = r.u16(at + 8);
        const vertArrOff = at + 10;
        const horizArrOff = vertArrOff + vertCount * 2;

        const readSet = (covOff: number, arrOff: number, count: number, into: Record<string, GlyphConstruction>) => {
            const ids = readCoverage(r, covOff);
            for (let i = 0; i < Math.min(count, ids.length); i++) {
                const constructionOff = at + r.u16(arrOff + i * 2);
                into[String(ids[i])] = readConstruction(r, constructionOff, toEm);
            }
        };

        if (vertCount > 0) readSet(vertCovOff, vertArrOff, vertCount, vert);
        if (horizCount > 0) readSet(horizCovOff, horizArrOff, horizCount, horiz);
    } catch {
        // Best effort.
    }
    return { vert, horiz, minConnectorOverlap };
}

function readConstruction(r: Reader, at: number, toEm: (n: number) => number): GlyphConstruction {
    const variants: Array<{ glyphId: number; advance: number }> = [];
    let assembly: GlyphConstruction['assembly'] = null;
    try {
        const assemblyOff = r.u16(at);
        const variantCount = r.u16(at + 2);
        for (let i = 0; i < variantCount; i++) {
            const rec = at + 4 + i * 4;
            variants.push({ glyphId: r.u16(rec), advance: toEm(r.u16(rec + 2)) });
        }
        if (assemblyOff > 0) {
            const a = at + assemblyOff;
            const italic = valueRecord(r, a, toEm);
            const partCount = r.u16(a + 4);
            const parts: GlyphPart[] = [];
            for (let i = 0; i < partCount; i++) {
                const rec = a + 6 + i * 8;
                parts.push({
                    glyphId: r.u16(rec),
                    startConnectorLength: toEm(r.u16(rec + 2)),
                    endConnectorLength: toEm(r.u16(rec + 4)),
                    fullAdvance: toEm(r.u16(rec + 6)),
                    isExtender: (r.u16(rec + 8) & 0x0001) === 1,
                });
            }
            assembly = { italicCorrection: italic, parts };
        }
    } catch {
        // A construction without readable variants is simply empty.
    }
    return { variants, assembly };
}
