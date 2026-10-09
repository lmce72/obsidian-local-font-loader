/**
 * Minion Math 字体适配器 / Minion Math font adapter.
 *
 * 中文：Minion Math 是 Adobe 为 Minion Pro 配套设计的商用数学字体，自带完整的 OpenType MATH 表，
 *       因此度量直接读字体元数据，绝不做画布测量。注意家族名是 "Minion Math" 而不是 "Minion Pro"：
 *       Minion Pro 是纯文本字体、没有 MATH 表，必须留给测量回退路径，本模块绝不认领。
 * English: Minion Math is Adobe's commercial math companion to Minion Pro and ships a full OpenType
 *          MATH table, so every number is read from font metadata — never measured on a canvas.
 *          IMPORTANT: the family name is "Minion Math", NOT "Minion Pro". Minion Pro is a text font
 *          with no MATH table and must be left to the measurement fallback; this adapter never
 *          claims it.
 *
 * 中文：`delimiters` 一律留空——MathJax 用它自己私有区（U+E000–U+F8FF）的部件拼装可伸缩定界符，
 *       用本字体的数字去覆盖目标尺寸会破坏花括号高度与跨度（这正是本架构所替换的旧 bug）。
 * English: `delimiters` is deliberately left undefined. MathJax assembles `\underbrace`,
 *          `\left(...\right)` and extensible arrows from private-use pieces in ITS OWN fonts;
 *          overwriting its target sizes with this font's numbers corrupts brace height and span.
 *
 * 中文：`chars` 的每个值是布局盒 [height, depth, width]——基线以上高度、基线以下深度、前进宽度，
 *       单位一律 em（设计单位 / unitsPerEm）。
 * English: each `chars` entry is a layout box [height, depth, width] — height above the baseline,
 *          depth below it, advance width — all in em (design units divided by unitsPerEm).
 */

import type { AdapterContext, GlyphMetrics, MathFontAdapter, MathFontMetrics } from '../types';
import { matchByFamilyName } from '../types';
import { readOpenTypeMathTable } from '../opentype-math';

/** 本模块认领的家族名 / The family names this adapter claims (exact, case-insensitive). */
const FAMILIES: string[] = ['Minion Math'];

// ---------------------------------------------------------------------------
// 二进制表读取小工具 / Tiny binary table readers (sfnt / OpenType layout)
// ---------------------------------------------------------------------------

/** 一个表在文件中的位置 / One table's location in the font file (file-absolute offset). */
interface TableRange {
    offset: number;
    length: number;
}

/** 读到的字形布局数据 / Glyph layout data read from cmap/hmtx/hhea/OS-2 (+ glyf when present). */
interface GlyphLayout {
    /** 每 em 的设计单位数 / design units per em. */
    unitsPerEm: number;
    /** 字形总数 / number of glyphs. */
    numGlyphs: number;
    /** 每字形前进宽度（设计单位）/ per-glyph advance width in design units. */
    advances: Uint16Array;
    /** cmap：码点 -> 字形 id / codepoint -> glyph id. */
    cmap: Map<number, number>;
    /** TrueType 逐字形垂直范围（设计单位），CFF 字体为 null / per-glyph extents; null for CFF. */
    yMin: Int16Array | null;
    yMax: Int16Array | null;
    /** 字体级上缘（em）/ font-wide ascent above the baseline, in em. */
    fontAscent: number;
    /** 字体级下缘（em，正值，即基线以下深度）/ font-wide depth below baseline, positive, in em. */
    fontDescent: number;
    /** 垂直度量来源，用于诊断 / where the vertical metrics came from, for diagnostics. */
    verticalSource: 'glyf' | 'os2-typo' | 'hhea' | 'default';
}

/**
 * 在 sfnt 表目录中定位一个表。
 * Locate one table in the sfnt table directory. Offsets in the directory are file-absolute.
 */
function findTableRange(dv: DataView, base: number, tag: string): TableRange | null {
    try {
        const numTables = dv.getUint16(base + 4);
        for (let i = 0; i < numTables; i++) {
            const rec = base + 12 + i * 16;
            const t = String.fromCharCode(
                dv.getUint8(rec),
                dv.getUint8(rec + 1),
                dv.getUint8(rec + 2),
                dv.getUint8(rec + 3),
            );
            if (t === tag) {
                return { offset: dv.getUint32(rec + 8), length: dv.getUint32(rec + 12) };
            }
        }
    } catch {
        // 目录损坏视作"没有这个表"，由调用方降级 / a broken directory means "absent" — caller degrades.
    }
    return null;
}

/**
 * 单字体 base 为 0；TTC 取第一个字体（与 readOpenTypeMathTable 一致）。
 * Plain font: base 0. TTC: the first font's offset, matching readOpenTypeMathTable.
 */
function firstFontBase(dv: DataView): number {
    try {
        const tag = String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3));
        if (tag === 'ttcf') {
            const numFonts = dv.getUint32(8);
            if (numFonts < 1) return 0;
            return dv.getUint32(12);
        }
    } catch {
        // 头部不可读时按普通字体处理 / unreadable header: treat as a plain single font.
    }
    return 0;
}

/** 控制字符没有墨迹 / control characters carry no ink. */
function isControl(code: number): boolean {
    return code < 0x20 || (code >= 0x7f && code <= 0x9f);
}

/**
 * 私用区是 MathJax 自己的可伸缩拼装部件，不归本模块量。
 * Private-use codepoints are MathJax's own stretchy assembly pieces — never size them here.
 */
function isPrivateUse(code: number): boolean {
    return (code >= 0xe000 && code <= 0xf8ff) || (code >= 0xf0000 && code <= 0xffffd) || (code >= 0x100000 && code <= 0x10fffd);
}

/** 代理区不是标量值 / surrogates are not scalar values. */
function isSurrogate(code: number): boolean {
    return code >= 0xd800 && code <= 0xdfff;
}

/**
 * 空白字形：没有墨迹，逐字形盒应为零高度零深度。
 * Spacing glyphs: no ink, so their per-glyph box is zero in both directions.
 */
function isSpacing(code: number): boolean {
    return code === 0x20 || code === 0xa0
        || (code >= 0x2000 && code <= 0x200a)
        || code === 0x2028 || code === 0x2029 || code === 0x202f || code === 0x205f
        || code === 0x3000;
}

// ---------------------------------------------------------------------------
// cmap：码点 -> 字形 id / cmap: codepoint -> glyph id
// ---------------------------------------------------------------------------

/** 单个 cmap 子表 / one cmap subtable to merge. */
interface CmapSubtable {
    offset: number;
    /** 优先级：12/13 覆盖 4，4 覆盖 0/6 / priority: 12/13 overwrites 4 overwrites 0/6. */
    score: number;
}

/** 解析 cmap format 4（BMP 段式）/ parse cmap format 4 (BMP segmented mapping). */
function parseCmapFormat4(dv: DataView, at: number, end: number, into: Map<number, number>): void {
    const segCount = dv.getUint16(at + 6) / 2;
    const endCodes = at + 14;
    const startCodes = endCodes + segCount * 2 + 2;
    const idDeltas = startCodes + segCount * 2;
    const idRangeOffsets = idDeltas + segCount * 2;
    for (let i = 0; i < segCount; i++) {
        const end = dv.getUint16(endCodes + i * 2);
        const start = dv.getUint16(startCodes + i * 2);
        if (start === 0xffff || start > end) continue;
        const delta = dv.getInt16(idDeltas + i * 2);
        const rangeOffset = dv.getUint16(idRangeOffsets + i * 2);
        for (let code = start; code <= end; code++) {
            let gid: number;
            if (rangeOffset === 0) {
                gid = (code + delta) & 0xffff;
            } else {
                const addr = idRangeOffsets + i * 2 + rangeOffset + (code - start) * 2;
                if (addr + 2 > end) break;
                gid = dv.getUint16(addr);
                if (gid !== 0) gid = (gid + delta) & 0xffff;
            }
            if (gid !== 0) into.set(code, gid);
        }
    }
}

/**
 * 解析 cmap format 12（全码点范围）或 13（多对一）。
 * Parse cmap format 12 (full-codepoint ranges) or 13 (many-to-one).
 */
function parseCmapFormat12(dv: DataView, at: number, end: number, into: Map<number, number>, manyToOne: boolean): void {
    const numGroups = dv.getUint32(at + 12);
    for (let g = 0; g < numGroups; g++) {
        const rec = at + 16 + g * 12;
        if (rec + 12 > end) break;
        const startChar = dv.getUint32(rec);
        const endChar = dv.getUint32(rec + 4);
        const startGid = dv.getUint32(rec + 8);
        if (startChar > endChar) continue;
        for (let code = startChar; code <= endChar; code++) {
            const gid = manyToOne ? startGid : startGid + (code - startChar);
            if (gid !== 0) into.set(code, gid);
        }
    }
}

/** 解析 cmap format 0 / 6（小表）/ parse cmap format 0 / 6 (small tables). */
function parseCmapSmall(dv: DataView, at: number, end: number, into: Map<number, number>, format: number): void {
    if (format === 0) {
        for (let code = 0; code < 256; code++) {
            const addr = at + 6 + code;
            if (addr >= end) break;
            const gid = dv.getUint8(addr);
            if (gid !== 0) into.set(code, gid);
        }
        return;
    }
    // format 6: firstCode uint16, entryCount uint16, glyphIdArray uint16[]
    const first = dv.getUint16(at + 6);
    const count = dv.getUint16(at + 8);
    for (let i = 0; i < count; i++) {
        const addr = at + 10 + i * 2;
        if (addr + 2 > end) break;
        const gid = dv.getUint16(addr);
        if (gid !== 0) into.set(first + i, gid);
    }
}

/**
 * 读取 cmap 表的全部可用子表，低优先级先写、高优先级覆盖。
 * Read every usable cmap subtable; low score first, high score overwrites.
 */
function parseCmap(dv: DataView, table: TableRange, notes: string[]): Map<number, number> {
    const map = new Map<number, number>();
    try {
        const end = table.offset + table.length;
        const numTables = dv.getUint16(table.offset + 2);
        const subtables: CmapSubtable[] = [];
        for (let i = 0; i < numTables; i++) {
            const rec = table.offset + 4 + i * 8;
            if (rec + 8 > end) break;
            const subOff = table.offset + dv.getUint32(rec + 4);
            if (subOff + 2 > end) continue;
            const format = dv.getUint16(subOff);
            let score = 0;
            if (format === 12 || format === 13) score = 3;
            else if (format === 4) score = 2;
            else if (format === 0 || format === 6) score = 1;
            if (score > 0) subtables.push({ offset: subOff, score });
        }
        subtables.sort((a, b) => a.score - b.score);
        for (const sub of subtables) {
            const format = dv.getUint16(sub.offset);
            if (format === 4) parseCmapFormat4(dv, sub.offset, end, map);
            else if (format === 12) parseCmapFormat12(dv, sub.offset, end, map, false);
            else if (format === 13) parseCmapFormat12(dv, sub.offset, end, map, true);
            else parseCmapSmall(dv, sub.offset, end, map, format);
        }
        if (map.size === 0) {
            notes.push('cmap subtables were present but yielded no codepoint mapping.');
        }
    } catch {
        notes.push('cmap could not be fully parsed; codepoints mapped so far were kept.');
    }
    return map;
}

// ---------------------------------------------------------------------------
// 组装布局数据 / Assemble the glyph layout
// ---------------------------------------------------------------------------

/**
 * 读取 cmap/hmtx/hhea/OS-2（以及 TrueType 的 glyf/loca）构建字形布局数据。
 * Read cmap/hmtx/hhea/OS-2 (plus glyf/loca for TrueType) into glyph layout data.
 *
 * 中文：MATH 表的 MathGlyphInfo 并不提供逐字形高度/深度，所以垂直范围要么来自 glyf 外包框
 *       （TrueType），要么退回字体级 OS/2 sTypo / hhea 升降部——后者会在 notes 中注明近似。
 * English: the MATH table's MathGlyphInfo carries no per-glyph height/depth, so vertical extents
 *          come from glyf bounding boxes (TrueType) or fall back to the font-wide OS/2 sTypo /
 *          hhea ascender-descender — recorded in notes as an approximation.
 */
function readGlyphLayout(binary: ArrayBuffer, notes: string[], upemFallback: number, ctx: AdapterContext): GlyphLayout | null {
    try {
        const dv = new DataView(binary);
        const base = firstFontBase(dv);

        const head = findTableRange(dv, base, 'head');
        const hhea = findTableRange(dv, base, 'hhea');
        const maxp = findTableRange(dv, base, 'maxp');
        const hmtx = findTableRange(dv, base, 'hmtx');
        const cmapTable = findTableRange(dv, base, 'cmap');
        if (!head || !hhea || !maxp || !hmtx || !cmapTable) {
            notes.push('Required tables (head/hhea/maxp/hmtx/cmap) are incomplete; declining.');
            return null;
        }

        // unitsPerEm：head 优先，其次调用方已知值 / head first, then whatever the caller knew.
        const unitsPerEm = dv.getUint16(head.offset + 18) || upemFallback || ctx.unitsPerEm || 1000;
        const numGlyphs = dv.getUint16(maxp.offset + 4);
        if (!(numGlyphs > 0)) {
            notes.push('maxp reports no glyphs; declining.');
            return null;
        }

        // hhea：字体级升降部 + 水平度量数 / hhea: font-wide ascender/descender + numberOfHMetrics.
        const hheaAsc = dv.getInt16(hhea.offset + 4);
        const hheaDesc = dv.getInt16(hhea.offset + 6);
        const rawHMetrics = dv.getUint16(hhea.offset + 34);

        // OS/2 sTypoAscender/sTypoDescender 优先于 hhea / OS/2 sTypo values outrank hhea.
        let fontAscentDU = hheaAsc;
        let fontDescentDU = Math.max(0, -hheaDesc);
        let verticalSource: GlyphLayout['verticalSource'] = 'hhea';
        const os2 = findTableRange(dv, base, 'OS/2');
        if (os2 && os2.length >= 72) {
            const typoAsc = dv.getInt16(os2.offset + 68);
            const typoDesc = dv.getInt16(os2.offset + 70);
            if (typoAsc > 0) {
                fontAscentDU = typoAsc;
                fontDescentDU = Math.max(0, -typoDesc);
                verticalSource = 'os2-typo';
            }
        }
        if (!(fontAscentDU > 0)) {
            // 两个表都给不出有效升降部：用常见比例兜底并注明 / neither table helped: default ratio, noted.
            fontAscentDU = Math.round(unitsPerEm * 0.75);
            fontDescentDU = Math.round(unitsPerEm * 0.25);
            verticalSource = 'default';
            notes.push('Neither OS/2 sTypo nor hhea gave a usable ascender; used 0.75em/0.25em defaults.');
        }

        // hmtx：每个字形的前进宽度（不足时截断）/ hmtx: per-glyph advance, truncated when short.
        const advances = new Uint16Array(numGlyphs);
        const hMetricsCount = Math.max(1, Math.min(rawHMetrics || 1, numGlyphs, Math.floor(hmtx.length / 4)));
        for (let g = 0; g < numGlyphs; g++) {
            const rec = hmtx.offset + Math.min(g, hMetricsCount - 1) * 4;
            advances[g] = dv.getUint16(rec);
        }
        if (hMetricsCount < (rawHMetrics || 1)) {
            notes.push('hmtx is shorter than hhea.numberOfHMetrics; advance widths were truncated to the readable range.');
        }

        // cmap / glyph id 映射 / codepoint -> glyph id mapping.
        const cmap = parseCmap(dv, cmapTable, notes);

        // glyf + loca：TrueType 的逐字形垂直范围 / per-glyph vertical extents for TrueType.
        let yMin: Int16Array | null = null;
        let yMax: Int16Array | null = null;
        const glyf = findTableRange(dv, base, 'glyf');
        const loca = findTableRange(dv, base, 'loca');
        if (glyf && loca) {
            try {
                const indexToLocFormat = dv.getInt16(head.offset + 50);
                const needed = indexToLocFormat === 0 ? (numGlyphs + 1) * 2 : (numGlyphs + 1) * 4;
                if (loca.length >= needed) {
                    yMin = new Int16Array(numGlyphs);
                    yMax = new Int16Array(numGlyphs);
                    const glyfEnd = glyf.offset + glyf.length;
                    for (let g = 0; g < numGlyphs; g++) {
                        let start: number;
                        let stop: number;
                        if (indexToLocFormat === 0) {
                            start = dv.getUint16(loca.offset + g * 2) * 2;
                            stop = dv.getUint16(loca.offset + (g + 1) * 2) * 2;
                        } else {
                            start = dv.getUint32(loca.offset + g * 4);
                            stop = dv.getUint32(loca.offset + (g + 1) * 4);
                        }
                        // 空字形或截断记录：盒为 0 / empty or truncated record: zero box.
                        if (stop <= start || start + 10 > glyfEnd || stop > glyfEnd) continue;
                        yMin[g] = dv.getInt16(glyf.offset + start + 4);
                        yMax[g] = dv.getInt16(glyf.offset + start + 8);
                    }
                    verticalSource = 'glyf';
                    notes.push('Per-glyph vertical extents come from glyf bounding boxes (TrueType outlines).');
                }
            } catch {
                yMin = null;
                yMax = null;
                notes.push('glyf/loca could not be read; fell back to font-wide vertical extents.');
            }
        } else {
            // CFF 轮廓（Minion Math 的 .otf 即是）：表里没有逐字形垂直范围。
            // CFF outlines (as Minion Math .otf ships): no per-glyph vertical extents in the tables.
            notes.push('No glyf/loca (CFF outlines): height/depth use the font-wide ascender/descender for every glyph.');
        }

        return {
            unitsPerEm,
            numGlyphs,
            advances,
            cmap,
            yMin,
            yMax,
            fontAscent: fontAscentDU / unitsPerEm,
            fontDescent: fontDescentDU / unitsPerEm,
            verticalSource,
        };
    } catch {
        notes.push('Glyph layout tables could not be read at all; declining.');
        return null;
    }
}

// ---------------------------------------------------------------------------
// 适配器本体 / The adapter itself
// ---------------------------------------------------------------------------

export const minionMathAdapter: MathFontAdapter = {
    id: 'minion-math',
    name: 'Minion Math',
    families: FAMILIES,
    priority: 90,

    matches(familyName: string): boolean {
        return matchByFamilyName({ families: FAMILIES }, familyName);
    },

    build(binary: ArrayBuffer, ctx: AdapterContext): MathFontMetrics | null {
        const notes: string[] = [];
        const chars: Record<string, GlyphMetrics> = {};
        let constants: MathFontMetrics['constants'];

        try {
            // 1) MATH 表：常量的唯一来源 / MATH table: the sole source of font-wide constants.
            const math = readOpenTypeMathTable(binary);
            if (!math) {
                // 没有 MATH 表（例如误传了 Minion Pro）：拒绝认领，让低优先级适配器或测量回退接手。
                // No MATH table (e.g. someone passed Minion Pro): decline so a lower-priority adapter
                // or the measurement fallback can take it.
                return null;
            }
            constants = math.constants;

            // 2) 字形布局：cmap/hmtx/hhea/OS-2（+ glyf）/ glyph layout: cmap/hmtx/hhea/OS-2 (+ glyf).
            const layout = readGlyphLayout(binary, notes, math.unitsPerEm, ctx);
            if (!layout) {
                return null;
            }

            const upem = layout.unitsPerEm;
            let mapped = 0;
            let skipped = 0;

            // 3) 组装 chars：布局盒 [height, depth, width]，单位 em。
            //    Assemble chars: layout box [height, depth, width], all in em.
            for (const [code, gid] of layout.cmap) {
                if (code <= 0 || isControl(code) || isPrivateUse(code) || isSurrogate(code)) {
                    // 控制字符与私用区不归本模块管 / control chars and PUA are not ours to size.
                    skipped++;
                    continue;
                }
                if (gid <= 0 || gid >= layout.numGlyphs) {
                    skipped++;
                    continue;
                }

                const width = layout.advances[gid] / upem;
                let height: number;
                let depth: number;

                if (layout.yMax && layout.yMin) {
                    // TrueType：逐字形外包框，设计单位 -> em。
                    // TrueType: per-glyph extents, design units -> em.
                    height = Math.max(0, layout.yMax[gid] / upem);
                    depth = Math.max(0, -layout.yMin[gid] / upem);
                } else if (isSpacing(code)) {
                    // 空白字形无墨迹，逐字形盒给零 / spacing glyphs have no ink: zero vertical box.
                    height = 0;
                    depth = 0;
                } else {
                    // 无逐字形垂直范围：字体级升降部近似（见 notes）。
                    // No per-glyph verticals: font-wide ascender/descender approximation (see notes).
                    height = layout.fontAscent;
                    depth = layout.fontDescent;
                }

                chars[String(code)] = [height, depth, width];
                mapped++;
            }

            if (mapped === 0) {
                notes.push('No usable codepoint could be mapped from cmap; declining.');
                return null;
            }

            notes.push(`Mapped ${mapped} codepoints; kept MathJax metrics for ${skipped} control, private-use or absent ones.`);
            if (layout.verticalSource !== 'glyf') {
                notes.push('Vertical extents are a font-wide approximation (OS/2 sTypo / hhea), not per-glyph ink.');
            }
            notes.push('Stretchy delimiter sizes were left to MathJax: Minion Math is substituted into MathJax and does not own the assembly.');

            return {
                source: 'opentype-math',
                chars,
                // 刻意留空：见文件头说明 / deliberately absent: see the header comment.
                delimiters: undefined,
                constants,
                ownsStretchyAssembly: false,
                notes,
            };
        } catch (err) {
            // 绝不把异常抛给调用方：有部分结果就带着错误说明返回，否则放弃认领。
            // Never throw at the caller: return partial results with the error noted, else decline.
            const message = err instanceof Error ? err.message : String(err);
            notes.push(`Minion Math adapter failed mid-build: ${message}`);
            const count = Object.keys(chars).length;
            if (count === 0) {
                return null;
            }
            return {
                source: 'opentype-math',
                chars,
                delimiters: undefined,
                constants,
                ownsStretchyAssembly: false,
                notes,
            };
        }
    },
};
