/**
 * STIX Two Math / STIX Math / STIXGeneral metrics adapter.
 * STIX Two Math / STIX Math / STIXGeneral 的度量适配器。
 *
 * STIX Two Math is the Times-derived OpenType MATH font from the STIX scientific-publishing
 * project. Every number is read out of the font's own tables — the `MATH` table for the font-wide
 * constants, and `cmap`/`hmtx`/`glyf`/`OS/2`/`hhea` for per-glyph layout boxes. Nothing is
 * measured and nothing is hard-coded: STIX Two's italic corrections and its taller math axis
 * differ from STIX One, so those values can only be read, never remembered.
 * STIX Two Math 是 STIX 科学出版项目中源自 Times 的 OpenType MATH 字体。所有数值都读自字体
 * 自身的表：字体级常量来自 `MATH` 表，逐字形布局盒来自 `cmap`/`hmtx`/`glyf`/`OS/2`/`hhea`。
 * 既不测量也不硬编码：STIX Two 的斜体校正与更高的数学轴都与 STIX One 不同，只能读取。
 *
 * Deliberate omission: `delimiters` is left undefined even though the font ships a full glyph
 * assembly. When this face is substituted into MathJax, the stretchy pieces are still drawn from
 * MathJax's own TeX faces, so its target sizes must stay untouched — overwriting them is exactly
 * the brace-height corruption this adapter set replaces.
 * 有意省略：即便该字体自带完整的拼装数据，也不写 `delimiters`。字体被代入 MathJax 后，可伸缩
 * 部件仍由 MathJax 自己的 TeX 字体绘制，其目标尺寸必须保持原样——覆写正是本适配器架构所替代的
 * 花括号高度损坏问题的根源。
 */

import type { AdapterContext, GlyphMetrics, MathFontAdapter, MathFontMetrics, MathConstants } from '../types';
import { matchByFamilyName } from '../types';
import type { OpenTypeMathTable } from '../opentype-math';
import { readOpenTypeMathTable } from '../opentype-math';

/** Family names this adapter claims. / 本适配器认领的字族名。 */
const FAMILIES = ['STIX Two Math', 'STIX Math', 'STIXGeneral'];

/**
 * Codepoints to size: the set MathJax draws from the user's font (plain variants).
 * 需要计量的码位集合：MathJax 从用户字体绘制的那部分（普通变体）。
 *
 * The same practical set as the measurement fallback, plus Greek — math text lives on U+0370–U+03FF
 * and a math font that cannot size alpha is useless. Private-use and control codepoints are
 * excluded: U+E000–U+F8FF are MathJax's own assembly pieces and are never ours to size.
 * 与测量兜底相同的实用集合，外加希腊字母区——数学文本离不开 U+0370–U+03FF。私用区与控制字符
 * 排除在外：U+E000–U+F8FF 是 MathJax 自己的拼装部件，绝不该由我们计量。
 */
const PROBE_RANGES: Array<[number, number]> = [
    [0x20, 0x7e],     // ASCII printable / ASCII 可打印字符
    [0xa0, 0xff],     // Latin-1 supplement / 拉丁一补充
    [0x370, 0x3ff],   // Greek / 希腊字母
    [0x2000, 0x206f], // general punctuation / 通用标点
    [0x2070, 0x209f], // super/subscripts / 上下标
    [0x20a0, 0x20bf], // currency / 货币
    [0x2100, 0x214f], // letterlike / 字母式符号
    [0x2190, 0x21ff], // arrows / 箭头
    [0x2200, 0x22ff], // math operators / 数学运算符
    [0x2300, 0x23ff], // misc technical / 杂项技术符号
    [0x25a0, 0x25ff], // geometric shapes / 几何形状
    [0x2600, 0x26ff], // misc symbols / 杂项符号
    [0x27c0, 0x27ef], // misc math symbols-A / 杂项数学符号 A
    [0x2980, 0x29ff], // misc math symbols-B / 杂项数学符号 B
    [0x2a00, 0x2aff], // supplemental math operators / 补充数学运算符
    [0x1d400, 0x1d7ff], // math alphanumerics / 数学字母数字符号
];

/** Private-use area: MathJax's stretchy pieces live here. / 私用区：MathJax 的可伸缩部件所在。 */
function isPrivateUse(code: number): boolean {
    return (code >= 0xe000 && code <= 0xf8ff) || (code >= 0xf0000 && code <= 0xffffd) || (code >= 0x100000 && code <= 0x10fffd);
}

/** Control characters carry no ink. / 控制字符没有墨迹。 */
function isControl(code: number): boolean {
    return (code < 0x20) || (code >= 0x7f && code <= 0x9f);
}

/** Expand the ranges into the exact codepoints to produce. / 把区间展开为待生成的码位集合。 */
function buildWantedSet(): Set<number> {
    const want = new Set<number>();
    for (const [from, to] of PROBE_RANGES) {
        for (let code = from; code <= to; code++) {
            if (!isPrivateUse(code) && !isControl(code)) {
                want.add(code);
            }
        }
    }
    return want;
}

/** Render an unknown thrown value as text for a diagnostic note. / 把未知异常转成诊断文本。 */
function errText(err: unknown): string {
    return err instanceof Error ? err.message : String(err);
}

/** One entry in the SFNT table directory. / SFNT 表目录中的一条记录。 */
interface TableRecord {
    offset: number;
    length: number;
}

/** What the per-glyph loop needs, read once from the font's tables. / 逐字形循环所需、一次读齐的字体表数据。 */
interface SfntInfo {
    unitsPerEm: number;
    indexToLocFormat: number;
    /** Font-wide typographic box in design units: ascender above baseline, descender below (usually negative). / 设计单位的字体级排版盒：基线上方的 ascender、基线下方的 descender（通常为负）。 */
    typoAscender: number;
    typoDescender: number;
    advances: Uint16Array;
    cmap: Map<string, number>;
    /** `glyf` + `loca`, both only usable for TrueType outlines (null for CFF). / `glyf` + `loca`，仅 TrueType 轮廓可用（CFF 时为 null）。 */
    glyf: TableRecord | null;
    loca: TableRecord | null;
    usedTypoMetrics: boolean;
    usedHheaMetrics: boolean;
}

/**
 * Read the SFNT table directory (TTC-aware: the first font in a collection is used).
 * 读取 SFNT 表目录（兼容 TTC：取集合中的第一个字体）。
 */
function readTableDirectory(dv: DataView): Map<string, TableRecord> | null {
    try {
        if (dv.byteLength < 12) return null;
        const tag = String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3));
        // A collection stores several fonts after a shared header; take the first one.
        // 集合文件在公共头之后存放多个字体；取第一个。
        let base = 0;
        if (tag === 'ttcf') {
            const numFonts = dv.getUint32(8);
            if (numFonts < 1) return null;
            base = dv.getUint32(12);
        }
        if (base + 12 > dv.byteLength) return null;
        const numTables = dv.getUint16(base + 4);
        const tables = new Map<string, TableRecord>();
        for (let i = 0; i < numTables; i++) {
            const rec = base + 12 + i * 16;
            if (rec + 16 > dv.byteLength) break;
            // Directory offsets are absolute from the start of the file, for plain fonts and TTC alike.
            // 目录内偏移一律相对文件起始，对普通字体与 TTC 都成立。
            const name = String.fromCharCode(
                dv.getUint8(rec), dv.getUint8(rec + 1), dv.getUint8(rec + 2), dv.getUint8(rec + 3),
            );
            tables.set(name, { offset: dv.getUint32(rec + 8), length: dv.getUint32(rec + 12) });
        }
        return tables;
    } catch {
        return null;
    }
}

/** Parse one cmap format 4 subtable (BMP). / 解析 cmap format 4 子表（BMP）。 */
function parseCmapFormat4(dv: DataView, at: number, want: Set<number>, into: Map<string, number>): void {
    const segCount = dv.getUint16(at + 6) / 2;
    const endCodesAt = at + 14;
    const startCodesAt = endCodesAt + segCount * 2 + 2;
    const idDeltaAt = startCodesAt + segCount * 2;
    const idRangeOffsetAt = idDeltaAt + segCount * 2;
    for (let s = 0; s < segCount; s++) {
        const end = dv.getUint16(endCodesAt + s * 2);
        const start = dv.getUint16(startCodesAt + s * 2);
        const idDelta = dv.getInt16(idDeltaAt + s * 2);
        const idRangeOffset = dv.getUint16(idRangeOffsetAt + s * 2);
        if (start > end || start === 0xffff) continue;
        for (let code = start; code <= end; code++) {
            if (!want.has(code)) continue;
            let gid = 0;
            try {
                if (idRangeOffset === 0) {
                    gid = (code + idDelta) & 0xffff;
                } else {
                    const addr = idRangeOffsetAt + s * 2 + idRangeOffset + (code - start) * 2;
                    if (addr + 2 > dv.byteLength) continue;
                    const raw = dv.getUint16(addr);
                    gid = raw === 0 ? 0 : (raw + idDelta) & 0xffff;
                }
            } catch {
                // One unreadable segment must not kill the rest. / 单个段读不出不能拖垮其余段。
                continue;
            }
            if (gid !== 0) into.set(String(code), gid);
        }
    }
}

/** Parse one cmap format 12 subtable (full Unicode). / 解析 cmap format 12 子表（完整 Unicode）。 */
function parseCmapFormat12(dv: DataView, at: number, want: Set<number>, into: Map<string, number>): void {
    const numGroups = dv.getUint32(at + 12);
    for (let g = 0; g < numGroups; g++) {
        const rec = at + 16 + g * 12;
        if (rec + 12 > dv.byteLength) break;
        const start = dv.getUint32(rec);
        const end = dv.getUint32(rec + 4);
        const startGid = dv.getUint32(rec + 8);
        if (start > end) continue;
        for (let code = start; code <= end; code++) {
            if (!want.has(code)) continue;
            const gid = startGid + (code - start);
            if (gid !== 0) into.set(String(code), gid);
        }
    }
}

/**
 * Read codepoint -> glyph id for the wanted set. Prefers format 12 over format 4.
 * 读取「码位 -> 字形 id」映射，优先 format 12，其次 format 4。
 */
function readCmap(dv: DataView, rec: TableRecord, want: Set<number>): Map<string, number> {
    const into = new Map<string, number>();
    try {
        const numSubtables = dv.getUint16(rec.offset + 2);
        let bestScore = -1;
        let bestOffset = -1;
        for (let i = 0; i < numSubtables; i++) {
            const r = rec.offset + 4 + i * 8;
            if (r + 8 > dv.byteLength) break;
            const platform = dv.getUint16(r);
            const encoding = dv.getUint16(r + 2);
            const sub = rec.offset + dv.getUint32(r + 4);
            if (sub + 2 > dv.byteLength) continue;
            const format = dv.getUint16(sub);
            // Rank: full-Unicode subtables first, then whatever else parses.
            // 排序：完整 Unicode 子表优先，其余可解析者其次。
            let score = -1;
            if (format === 12) {
                score = (platform === 3 && encoding === 10) ? 4 : (platform === 0 ? 3 : 2);
            } else if (format === 4) {
                score = (platform === 3 && encoding === 1) ? 3 : (platform === 0 ? 2 : 1);
            }
            if (score > bestScore) {
                bestScore = score;
                bestOffset = sub;
            }
        }
        if (bestOffset < 0) return into;
        const format = dv.getUint16(bestOffset);
        if (format === 12) {
            parseCmapFormat12(dv, bestOffset, want, into);
        } else if (format === 4) {
            parseCmapFormat4(dv, bestOffset, want, into);
        }
    } catch {
        // Whatever was parsed so far is still usable. / 已解析的部分仍然可用。
    }
    return into;
}

/** Read per-glyph advance widths from `hmtx`. / 从 `hmtx` 读取逐字形步进宽度。 */
function readAdvances(dv: DataView, rec: TableRecord, numberOfHMetrics: number, numGlyphs: number): Uint16Array | null {
    try {
        if (numGlyphs < 1 || numberOfHMetrics < 1) return null;
        const advances = new Uint16Array(numGlyphs);
        const full = Math.min(numberOfHMetrics, numGlyphs);
        for (let g = 0; g < full; g++) {
            const off = rec.offset + g * 4;
            if (off + 2 > dv.byteLength) return null;
            advances[g] = dv.getUint16(off);
        }
        // Glyphs past numberOfHMetrics repeat the last advance width.
        // 超出 numberOfHMetrics 的字形沿用最后一个步进宽度。
        const last = advances[full - 1];
        for (let g = full; g < numGlyphs; g++) {
            advances[g] = last;
        }
        return advances;
    } catch {
        return null;
    }
}

/**
 * Read one glyph's TrueType bounding box (yMin/yMax) via `loca` + `glyf`, in design units.
 * 通过 `loca` + `glyf` 读取单个字形的 TrueType 包围盒（yMin/yMax），设计单位。
 *
 * An empty glyph (a space) has zero extents, which is its correct layout box. Composite glyphs
 * carry a stored bounding box covering their components, so the same header read works.
 * 空字形（空格）的外延为零，这本身就是正确的布局盒。复合字形存有覆盖各组件的包围盒，
 * 因此同样的头部读取方式依然成立。
 */
function readGlyphYBounds(
    dv: DataView,
    glyf: TableRecord,
    loca: TableRecord,
    indexToLocFormat: number,
    gid: number,
): { yMin: number; yMax: number } | null {
    try {
        let start: number;
        let end: number;
        if (indexToLocFormat === 0) {
            const a = loca.offset + gid * 2;
            const b = loca.offset + (gid + 1) * 2;
            if (b + 2 > dv.byteLength) return null;
            start = dv.getUint16(a) * 2;
            end = dv.getUint16(b) * 2;
        } else {
            const a = loca.offset + gid * 4;
            const b = loca.offset + (gid + 1) * 4;
            if (b + 4 > dv.byteLength) return null;
            start = dv.getUint32(a);
            end = dv.getUint32(b);
        }
        if (end <= start) {
            // Empty outline: zero height and depth. / 空轮廓：高度与深度均为零。
            return { yMin: 0, yMax: 0 };
        }
        const goff = glyf.offset + start;
        if (goff + 10 > dv.byteLength) return null;
        // numberOfContours (int16), xMin, yMin, xMax, yMax — bbox header of both simple and composite glyphs.
        // numberOfContours (int16)、xMin、yMin、xMax、yMax —— 简单与复合字形共用的包围盒头。
        return { yMin: dv.getInt16(goff + 6), yMax: dv.getInt16(goff + 8) };
    } catch {
        return null;
    }
}

/**
 * Collect everything the per-glyph loop needs from the font's tables.
 * 收集逐字形循环所需的全部字体表数据。
 */
function readSfntInfo(dv: DataView, want: Set<number>, notes: string[]): SfntInfo | null {
    const tables = readTableDirectory(dv);
    if (!tables) {
        notes.push('STIX: SFNT table directory could not be read; no glyph metrics produced.');
        return null;
    }

    // `head` carries unitsPerEm and the loca format. / `head` 提供 unitsPerEm 与 loca 格式。
    let unitsPerEm = 0;
    let indexToLocFormat = 1;
    const head = tables.get('head');
    if (head && head.length >= 54) {
        unitsPerEm = dv.getUint16(head.offset + 18);
        indexToLocFormat = dv.getInt16(head.offset + 50);
    }

    // `hhea` carries the font-wide ascent/descent and the hmtx split. / `hhea` 提供字体级升降部与 hmtx 切分。
    let hheaAscender = 0;
    let hheaDescender = 0;
    let numberOfHMetrics = 0;
    const hhea = tables.get('hhea');
    if (hhea && hhea.length >= 36) {
        hheaAscender = dv.getInt16(hhea.offset + 4);
        hheaDescender = dv.getInt16(hhea.offset + 6);
        numberOfHMetrics = dv.getUint16(hhea.offset + 34);
    }

    // `OS/2` typographic metrics are the preferred font-wide box. / `OS/2` 的排版度量是首选的字体级盒。
    let typoAscender = 0;
    let typoDescender = 0;
    let usedTypoMetrics = false;
    let usedHheaMetrics = false;
    const os2 = tables.get('OS/2');
    if (os2 && os2.length >= 72) {
        typoAscender = dv.getInt16(os2.offset + 68);
        typoDescender = dv.getInt16(os2.offset + 70);
        usedTypoMetrics = true;
    } else if (hhea && hhea.length >= 36) {
        typoAscender = hheaAscender;
        typoDescender = hheaDescender;
        usedHheaMetrics = true;
    } else {
        notes.push('STIX: neither OS/2 sTypoAscender nor hhea ascent is readable; font-wide vertical defaults are unavailable.');
    }

    // `maxp` bounds everything indexed by glyph id. / `maxp` 界定一切以字形 id 索引的结构。
    let numGlyphs = 0;
    const maxp = tables.get('maxp');
    if (maxp && maxp.length >= 6) {
        numGlyphs = dv.getUint16(maxp.offset + 4);
    }
    if (numGlyphs < 1) {
        notes.push('STIX: maxp reports no glyphs; no per-glyph metrics produced.');
        return null;
    }

    let advances: Uint16Array | null = null;
    const hmtx = tables.get('hmtx');
    if (hmtx) {
        advances = readAdvances(dv, hmtx, numberOfHMetrics, numGlyphs);
    }
    if (!advances) {
        notes.push('STIX: hmtx advance widths unreadable; no per-glyph metrics produced.');
        return null;
    }

    let cmap = new Map<string, number>();
    const cmapRec = tables.get('cmap');
    if (cmapRec) {
        cmap = readCmap(dv, cmapRec, want);
    }
    if (cmap.size === 0) {
        notes.push('STIX: cmap has no readable Unicode subtable for the probed codepoints; no per-glyph metrics produced.');
        return null;
    }

    // CFF outlines have no glyf/loca: the per-glyph verticals then fall back to the font-wide box.
    // CFF 轮廓没有 glyf/loca：逐字形垂直外延此时退化为字体级盒。
    const glyfRec = tables.get('glyf') || null;
    const locaRec = tables.get('loca') || null;
    const glyf = glyfRec && glyfRec.length > 0 ? glyfRec : null;
    const loca = locaRec && locaRec.length > 0 ? locaRec : null;

    return {
        unitsPerEm,
        indexToLocFormat,
        typoAscender,
        typoDescender,
        advances,
        cmap,
        glyf,
        loca,
        usedTypoMetrics,
        usedHheaMetrics,
    };
}

/** Assemble the metrics object in one place. / 在一处组装最终的度量对象。 */
function finish(constants: MathConstants, chars: Record<string, GlyphMetrics>, notes: string[]): MathFontMetrics {
    return {
        source: 'opentype-math',
        chars,
        // Deliberately absent: braces and arrows are assembled from MathJax's own pieces when this
        // font is substituted, so their target sizes must stay MathJax's.
        // 有意不写：本字体被代入时，花括号与箭头仍由 MathJax 自己的部件拼装，其目标尺寸必须保持其原值。
        delimiters: undefined,
        constants,
        ownsStretchyAssembly: false,
        notes,
    };
}

export const stixTwoMathAdapter: MathFontAdapter = {
    id: 'stix-two-math',
    name: 'STIX Two Math',
    families: FAMILIES,
    priority: 20,

    /** Claim a family by exact, case-insensitive name. / 按精确（忽略大小写）字族名认领。 */
    matches(familyName: string): boolean {
        return matchByFamilyName(stixTwoMathAdapter, familyName);
    },

    /**
     * Build metrics from the font file's bytes.
     * 从字体文件字节构建度量。
     *
     * @param binary - the whole font file / 整个字体文件
     * @param ctx    - what the caller knows / 调用方已知信息
     * @returns metrics, or null to decline so the measurement fallback tries / 度量；null 表示拒接，交给测量兜底
     */
    build(binary: ArrayBuffer, ctx: AdapterContext): MathFontMetrics | null {
        const notes: string[] = [];

        // The MATH table is what makes this adapter the right one; a STIX text face without it
        // carries no math metadata at all and belongs to the measurement fallback.
        // MATH 表是本适配器成立的前提；没有它的 STIX 文本字体完全没有数学元数据，归测量兜底管。
        let math: OpenTypeMathTable | null = null;
        try {
            math = readOpenTypeMathTable(binary);
        } catch (err) {
            // readOpenTypeMathTable already swallows parse errors; this only guards a bad argument.
            // readOpenTypeMathTable 本身已吞掉解析错误；此处只防参数异常。
            notes.push(`STIX: MATH table read failed: ${errText(err)}`);
            math = null;
        }
        if (!math) {
            return null;
        }

        // Units: readOpenTypeMathTable already returns em, so nothing here is rescaled again.
        // 单位：readOpenTypeMathTable 已返回 em，此处不再二次换算。
        const chars: Record<string, GlyphMetrics> = {};

        try {
            const dv = new DataView(binary);
            const want = buildWantedSet();
            const info = readSfntInfo(dv, want, notes);
            if (!info) {
                // Constants alone are still worth returning: no fallback can recover them.
                // 仅常量也值得返回：任何兜底都无法还原这些数值。
                notes.push('STIX: returning MATH constants only; MathJax keeps its own per-glyph metrics.');
                return finish(math.constants, chars, notes);
            }

            let unitsPerEm = info.unitsPerEm;
            if (!(unitsPerEm > 0)) {
                unitsPerEm = math.unitsPerEm;
            }
            if (!(unitsPerEm > 0) && ctx.unitsPerEm && ctx.unitsPerEm > 0) {
                unitsPerEm = ctx.unitsPerEm;
            }
            if (!(unitsPerEm > 0)) {
                // Last resort; recorded so nobody mistakes it for a read value.
                // 最后手段；记录在案，以免被误当作读取值。
                unitsPerEm = 1000;
                notes.push('STIX: unitsPerEm unreadable in head/MATH; assumed 1000.');
            }

            // Font-wide layout box used where a glyph has no readable vertical extents.
            // 当字形没有可读的垂直外延时，采用字体级布局盒。
            const fontHeight = Math.max(0, info.typoAscender) / unitsPerEm;
            const fontDepth = Math.max(0, -info.typoDescender) / unitsPerEm;
            if (info.usedTypoMetrics) {
                notes.push('STIX: font-wide verticals from OS/2 sTypoAscender/sTypoDescender.');
            } else if (info.usedHheaMetrics) {
                notes.push('STIX: OS/2 typographic metrics absent; font-wide verticals from hhea ascent/descent.');
            }

            const glyf = info.glyf;
            const loca = info.loca;
            const hasGlyf = glyf !== null && loca !== null;
            if (!hasGlyf) {
                notes.push('STIX: no glyf/loca tables (CFF outlines); per-glyph height/depth approximated by the font-wide ascender/descender.');
            }

            let built = 0;
            let missingGlyph = 0;
            let zeroAdvance = 0;
            let approximated = 0;

            for (const code of want) {
                const key = String(code);
                const gid = info.cmap.get(key);
                if (gid === undefined || gid === 0 || gid >= info.advances.length) {
                    // No usable glyph for this codepoint: keep whatever MathJax already had.
                    // 该码位没有可用字形：保留 MathJax 原有数值。
                    missingGlyph++;
                    continue;
                }
                const widthUnits = info.advances[gid];
                if (!(widthUnits > 0)) {
                    // Zero advance would collapse the glyph onto its neighbour.
                    // 零步进会让该字形塌陷到相邻字形上。
                    zeroAdvance++;
                    continue;
                }

                let height: number;
                let depth: number;
                if (hasGlyf && glyf && loca) {
                    const box = readGlyphYBounds(dv, glyf, loca, info.indexToLocFormat, gid);
                    if (box) {
                        // Layout box, not ink box: extents come from the glyph's own design outline.
                        // 布局盒而非墨迹盒：外延取自字形自身的设计轮廓。
                        height = Math.max(0, box.yMax) / unitsPerEm;
                        depth = Math.max(0, -box.yMin) / unitsPerEm;
                    } else {
                        height = fontHeight;
                        depth = fontDepth;
                        approximated++;
                    }
                } else {
                    height = fontHeight;
                    depth = fontDepth;
                    approximated++;
                }

                const metrics: GlyphMetrics = [height, depth, widthUnits / unitsPerEm];
                chars[key] = metrics;
                built++;
            }

            notes.push(
                `STIX: built ${built} glyph layout boxes from cmap/hmtx/glyf; kept MathJax metrics for ${missingGlyph} absent glyphs and ${zeroAdvance} zero-advance glyphs.`,
            );
            if (approximated > 0) {
                notes.push(
                    `STIX: ${approximated} glyphs have no readable outline box; their height/depth use the font-wide ascender/descender (typographic approximation).`,
                );
            }
        } catch (err) {
            // Never throw out of build(): report and keep whatever was produced.
            // 绝不从 build() 抛出：记入 notes 并保留已产出的部分。
            notes.push(`STIX: glyph metric parse failed: ${errText(err)}; returning MATH constants with partial chars.`);
        }

        // Italic corrections are in the MATH table but MathFontMetrics has no slot for them; the
        // axis and rule values the table states do map onto `constants` and are taken from there.
        // 斜体校正虽在 MATH 表中，但 MathFontMetrics 没有对应字段；表中的数学轴与线宽则映射进 `constants`。
        notes.push('STIX: MATH italic corrections read but not exported (no field on MathFontMetrics); axis and rule values come from the MATH constants.');
        notes.push('STIX: delimiters omitted on purpose — MathJax assembles stretchy delimiters from its own faces, so its target sizes must stay.');

        return finish(math.constants, chars, notes);
    },
};
