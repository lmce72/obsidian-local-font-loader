/**
 * Cambria Math 适配器 —— 微软的 OpenType `MATH` 参考字体（随 Windows / Office 发行）。
 * Cambria Math adapter — Microsoft's reference OpenType `MATH` font (ships with Windows / Office).
 *
 * Cambria 是 MATH 表工具链的参考实现，绝大多数 MATH 解析器都以它为测试基准。它的常量针对
 * ClearType 渲染调校、轴高（axis height）相对偏高——这些设计值在此原样采用，不做“修正”。
 * Cambria is the reference implementation most MATH-table tooling is validated against. Its
 * constants are tuned for ClearType and its axis height is relatively high; both are taken
 * verbatim here and never re-tuned.
 *
 * 指标来源 / Where the numbers come from:
 *  - 常量 constants —— `readOpenTypeMathTable` 的输出（已是 em）。
 *  - 横向 width    —— `cmap` 得到码点→字位映射后查 `hmtx` 前进宽度，精确值。
 *  - 纵向 h/d      —— MATH 的 MathGlyphInfo 只有斜体校正/顶重音/字距，没有逐字形高深，
 *    故布局盒纵向用全字体的 OS/2 sTypo*（或 hhea）升部/降部近似；该近似写入 notes。
 *  - `delimiters` 保持 undefined、`ownsStretchyAssembly` 为 false：MathJax 用它自己字体里的
 *    私用区拼件组装 \left(...\right)、\underbrace 与可延展箭头；用本字体的数字覆盖其目标
 *    尺寸会破坏花括号高度与跨度（这正是本架构要替换掉的缺陷）。
 *
 * 全字体 .ttc 集合会先解包成单字体（取带 MATH 表的那个成员），使 MATH 表与字形度量同源；
 * 解包失败时优雅降级并写入 notes，绝不抛出。
 */

import type { AdapterContext, GlyphMetrics, MathFontAdapter, MathFontMetrics } from '../types';
import { matchByFamilyName } from '../types';
import type { OpenTypeMathTable } from '../opentype-math';
import { readOpenTypeMathTable } from '../opentype-math';

/** 本适配器认领的字族名（大小写不敏感精确匹配）。Family names claimed, matched case-insensitively. */
const FAMILIES = ['Cambria Math', 'Cambria'];

/** 码点→字位映射的防御性上限，防止损坏的 cmap 分组把循环拖死。Guard against corrupt cmap groups. */
const MAX_CODEPOINT_ENTRIES = 300000;

/** 表目录中一个表的位置（文件内绝对偏移）。One table's location, absolute within the file. */
interface TableRef {
    offset: number;
    length: number;
}

/** `head` / `hhea` / `OS/2` 里对布局盒有用的字段。The fields we need for the layout box. */
interface HheaInfo {
    ascent: number;
    descent: number;
    numHMetrics: number;
}

interface Os2Info {
    fsSelection: number;
    sTypoAscender: number;
    sTypoDescender: number;
    usWinAscent: number;
    usWinDescent: number;
}

/** 纵向布局盒的最终取值及其出处，用于 notes。The chosen font-wide vertical metrics and their source. */
interface VerticalBox {
    ascent: number;
    descent: number;
    source: string;
}

/** `e` 的可读描述，用于 notes（绝不静默吞异常）。Readable description of `e` for notes. */
function describeError(e: unknown): string {
    return e instanceof Error ? e.message : String(e);
}

/** 读取表标签（4 个 ASCII 字节）。Read a 4-byte table tag. */
function readTag(dv: DataView, at: number): string {
    return String.fromCharCode(
        dv.getUint8(at),
        dv.getUint8(at + 1),
        dv.getUint8(at + 2),
        dv.getUint8(at + 3),
    );
}

/**
 * 在表目录里查找某个表。
 * Find a table in the font's table directory.
 *
 * @param base - 单字体在文件内的起始位置（普通字体为 0，集合成员为其偏移）。
 *               Font start within the file; 0 for a plain font.
 * 表记录里的 offset 是文件内绝对偏移，集合中亦然，故此处不再叠加 base。
 * Table-record offsets are absolute file offsets (also in collections).
 */
function findTable(dv: DataView, base: number, tag: string): TableRef | null {
    try {
        const numTables = dv.getUint16(base + 4);
        for (let i = 0; i < numTables; i++) {
            const rec = base + 12 + i * 16;
            if (rec + 16 > dv.byteLength) break;
            if (readTag(dv, rec) !== tag) continue;
            const offset = dv.getUint32(rec + 8);
            const length = dv.getUint32(rec + 12);
            if (offset + length > dv.byteLength) return null;
            return { offset, length };
        }
    } catch {
        // 视为没找到，调用方按“表缺失”处理。Treat as absent; callers degrade.
    }
    return null;
}

/** 单字体文件的便捷查找（base = 0）。Lookup for a single-font file. */
function getTable(dv: DataView, tag: string): TableRef | null {
    return findTable(dv, 0, tag);
}

/** 是否 OpenType 字体集合（.ttc）。True for an OpenType collection (`.ttc`). */
function isCollection(dv: DataView): boolean {
    return dv.byteLength >= 12 && readTag(dv, 0) === 'ttcf';
}

/**
 * 把集合的某个成员重建成一份独立的字体文件。
 * Rebuild one collection member as a standalone font file.
 *
 * 表内容整块拷贝，表内偏移均为表相对值，因此搬家是安全的（与 fonttools 导出成员同理）。
 * Whole tables are copied and all intra-table offsets are table-relative, so relocation is safe.
 */
function rebuildSingleFont(dv: DataView, base: number): ArrayBuffer {
    const numTables = dv.getUint16(base + 4);
    if (numTables < 1 || numTables > 512) {
        throw new Error(`unreasonable table count ${numTables}`);
    }

    const tags: string[] = [];
    const checksums: number[] = [];
    const sources: Array<{ offset: number; length: number }> = [];
    for (let i = 0; i < numTables; i++) {
        const rec = base + 12 + i * 16;
        if (rec + 16 > dv.byteLength) {
            throw new Error('table directory truncated');
        }
        const tag = readTag(dv, rec);
        const checksum = dv.getUint32(rec + 4);
        const offset = dv.getUint32(rec + 8);
        const length = dv.getUint32(rec + 12);
        if (offset + length > dv.byteLength) {
            throw new Error(`table ${tag} out of range`);
        }
        tags.push(tag);
        checksums.push(checksum);
        sources.push({ offset, length });
    }

    // 先算每个表的新落点（4 字节对齐）。Lay out the new table positions, 4-byte aligned.
    const headerSize = 12 + numTables * 16;
    let cursor = headerSize;
    const placements: number[] = [];
    for (const src of sources) {
        placements.push(cursor);
        cursor = (cursor + src.length + 3) & ~3;
    }

    const out = new ArrayBuffer(cursor);
    const odv = new DataView(out);
    const outBytes = new Uint8Array(out);
    const srcBytes = new Uint8Array(dv.buffer, dv.byteOffset, dv.byteLength);

    odv.setUint32(0, dv.getUint32(base)); // sfnt 版本 / sfnt version
    odv.setUint16(4, numTables);
    // searchRange / entrySelector / rangeShift 仅供二分查找；数值合法即可，这里按规范计算。
    // Only used for binary search of the directory; computed per spec.
    const maxPow2 = 1 << (31 - Math.clz32(numTables));
    odv.setUint16(6, maxPow2 * 16);
    odv.setUint16(8, Math.log2(maxPow2) | 0);
    odv.setUint16(10, numTables * 16 - maxPow2 * 16);

    for (let i = 0; i < numTables; i++) {
        const rec = 12 + i * 16;
        for (let t = 0; t < 4; t++) {
            odv.setUint8(rec + t, tags[i].charCodeAt(t));
        }
        // 校验和沿用原值：本模块只读元数据，不校验表内容。
        // Keep the original checksums: this module only reads metadata.
        odv.setUint32(rec + 4, checksums[i]);
        odv.setUint32(rec + 8, placements[i]);
        odv.setUint32(rec + 12, sources[i].length);
        outBytes.set(srcBytes.subarray(sources[i].offset, sources[i].offset + sources[i].length), placements[i]);
    }
    return out;
}

/**
 * 归一化：集合解包为单字体，普通文件原样返回。
 * Normalize: unpack a collection to a single font, pass plain files through.
 *
 * 选取第一个带 MATH 表的成员（cambria.ttc 里常规字面排在 Cambria Math 之前），
 * 让 `readOpenTypeMathTable` 与本模块的 cmap/hmtx 读取落在同一成员上。
 * Pick the first member that carries a MATH table so every reader sees the same face.
 */
function extractSingleFont(binary: ArrayBuffer, notes: string[]): ArrayBuffer {
    const dv = new DataView(binary);
    if (!isCollection(dv)) {
        return binary;
    }
    try {
        const numFonts = dv.getUint32(8);
        if (numFonts < 1) return binary;
        let chosen = -1;
        for (let i = 0; i < numFonts; i++) {
            const at = 12 + i * 4;
            if (at + 4 > binary.byteLength) break;
            const base = dv.getUint32(at);
            if (base <= 0 || base + 12 > binary.byteLength) continue;
            if (chosen < 0) chosen = base;
            if (findTable(dv, base, 'MATH')) {
                chosen = base;
                break;
            }
        }
        if (chosen < 0) return binary;
        const rebuilt = rebuildSingleFont(dv, chosen);
        notes.push('OpenType collection unpacked to the member that carries the MATH table.');
        return rebuilt;
    } catch (e) {
        notes.push(`OpenType collection could not be unpacked (${describeError(e)}); reading the file as-is.`);
        return binary;
    }
}

/** `hhea` 的升部/降部与 numberOfHMetrics。Ascent, descent and numberOfHMetrics from `hhea`. */
function readHhea(dv: DataView): HheaInfo | null {
    try {
        const ref = getTable(dv, 'hhea');
        if (!ref || ref.length < 36) return null;
        return {
            ascent: dv.getInt16(ref.offset + 4),
            descent: dv.getInt16(ref.offset + 6),
            numHMetrics: dv.getUint16(ref.offset + 34),
        };
    } catch (e) {
        return null;
    }
}

/** `OS/2` 的排版度量与 fsSelection。Typographic metrics and fsSelection from `OS/2`. */
function readOs2(dv: DataView, notes: string[]): Os2Info | null {
    try {
        const ref = getTable(dv, 'OS/2');
        if (!ref || ref.length < 8) return null;
        const info: Os2Info = {
            fsSelection: 0,
            sTypoAscender: 0,
            sTypoDescender: 0,
            usWinAscent: 0,
            usWinDescent: 0,
        };
        // fsSelection 在偏移 62（需 v0 及以上且长度足够）。fsSelection at offset 62.
        if (ref.length >= 64) {
            info.fsSelection = dv.getUint16(ref.offset + 62);
        }
        // sTypoAscender / sTypoDescender 在 68 / 70。Typo ascender/descender at 68 / 70.
        if (ref.length >= 72) {
            info.sTypoAscender = dv.getInt16(ref.offset + 68);
            info.sTypoDescender = dv.getInt16(ref.offset + 70);
        }
        // usWinAscent / usWinDescent 在 74 / 76。Win ascent/descent at 74 / 76.
        if (ref.length >= 78) {
            info.usWinAscent = dv.getUint16(ref.offset + 74);
            info.usWinDescent = dv.getUint16(ref.offset + 76);
        }
        return info;
    } catch (e) {
        notes.push(`OS/2 table unreadable (${describeError(e)}); falling back to hhea verticals.`);
        return null;
    }
}

/**
 * 选纵向布局盒：优先 OS/2 sTypo*（当 USE_TYPO_METRICS 置位），否则 hhea。
 * Choose the font-wide vertical box: OS/2 sTypo* when USE_TYPO_METRICS is set, else hhea.
 */
function pickVertical(hhea: HheaInfo | null, os2: Os2Info | null): VerticalBox {
    const typoUsable = !!os2 && os2.sTypoAscender > 0;
    const useTypo = typoUsable && (os2.fsSelection & 0x80) !== 0;
    if (useTypo && os2) {
        return {
            ascent: os2.sTypoAscender,
            descent: Math.abs(os2.sTypoDescender),
            source: 'OS/2 sTypoAscender/sTypoDescender (USE_TYPO_METRICS)',
        };
    }
    if (hhea && hhea.ascent > 0) {
        return {
            ascent: hhea.ascent,
            descent: Math.abs(hhea.descent),
            source: 'hhea ascent/descent',
        };
    }
    if (typoUsable && os2) {
        return {
            ascent: os2.sTypoAscender,
            descent: Math.abs(os2.sTypoDescender),
            source: 'OS/2 sTypoAscender/sTypoDescender',
        };
    }
    if (os2 && os2.usWinAscent > 0) {
        return {
            ascent: os2.usWinAscent,
            descent: os2.usWinDescent,
            source: 'OS/2 usWinAscent/usWinDescent',
        };
    }
    // 最后兜底：常规西文字体的典型比例。Last resort: typical Latin proportions.
    return { ascent: 800, descent: 200, source: 'built-in 0.8/0.2 default' };
}

/** 格式 4 子表（BMP）。Format 4 subtable (BMP). */
function parseCmap4(dv: DataView, sub: number, end: number, into: Map<number, number>): void {
    const segCountX2 = dv.getUint16(sub + 6);
    if (segCountX2 < 2 || (segCountX2 & 1) !== 0) return;
    const segCount = segCountX2 / 2;
    const endBase = sub + 14;
    const startBase = endBase + segCountX2 + 2;
    const deltaBase = startBase + segCountX2;
    const rangeBase = deltaBase + segCountX2;
    for (let s = 0; s < segCount; s++) {
        const segEnd = dv.getUint16(endBase + s * 2);
        const segStart = dv.getUint16(startBase + s * 2);
        const delta = dv.getInt16(deltaBase + s * 2);
        const rangeOffset = dv.getUint16(rangeBase + s * 2);
        if (segStart === 0xffff || segStart > segEnd) continue;
        for (let c = segStart; c <= segEnd; c++) {
            if (into.size >= MAX_CODEPOINT_ENTRIES) return;
            let gid: number;
            if (rangeOffset === 0) {
                gid = (c + delta) & 0xffff;
            } else {
                const idx = rangeBase + s * 2 + rangeOffset + (c - segStart) * 2;
                if (idx + 2 > end) return;
                gid = dv.getUint16(idx);
                if (gid !== 0) gid = (gid + delta) & 0xffff;
            }
            if (gid === 0) continue;
            if (!into.has(c)) into.set(c, gid);
        }
    }
}

/** 格式 6 子表（紧凑 BMP）。Format 6 subtable (trimmed BMP). */
function parseCmap6(dv: DataView, sub: number, end: number, into: Map<number, number>): void {
    const firstCode = dv.getUint16(sub + 6);
    const entryCount = dv.getUint16(sub + 8);
    for (let i = 0; i < entryCount; i++) {
        if (into.size >= MAX_CODEPOINT_ENTRIES) return;
        const idx = sub + 10 + i * 2;
        if (idx + 2 > end) return;
        const gid = dv.getUint16(idx);
        if (gid === 0) continue;
        const code = firstCode + i;
        if (!into.has(code)) into.set(code, gid);
    }
}

/** 格式 12 子表（全平面，数学字母数字区必需）。Format 12 subtable (full Unicode; required for math alphanumerics). */
function parseCmap12(dv: DataView, sub: number, end: number, into: Map<number, number>): void {
    const numGroups = dv.getUint32(sub + 12);
    for (let i = 0; i < numGroups; i++) {
        const rec = sub + 16 + i * 12;
        if (rec + 12 > end) return;
        const start = dv.getUint32(rec);
        const finish = dv.getUint32(rec + 4);
        const startGid = dv.getUint32(rec + 8);
        if (start > finish || finish > 0x10ffff) continue;
        for (let c = start; c <= finish; c++) {
            if (into.size >= MAX_CODEPOINT_ENTRIES) return;
            const gid = startGid + (c - start);
            if (gid === 0) continue;
            if (!into.has(c)) into.set(c, gid);
        }
    }
}

/**
 * 读 `cmap`：码点 → 字位 id。
 * Read `cmap`: codepoint to glyph id.
 *
 * 合并所有 Unicode 子表（平台 0，以及平台 3 的 enc 1/10），后者保证拿到 U+1D400+ 数学字母数字区；
 * 符号子表（3,0）刻意不取——它把码点搬到 PUA，而 PUA 归 MathJax 的拼件。
 * All Unicode subtables are merged; the symbol cmap (3,0) is skipped because it relocates
 * codepoints into the private-use area, which belongs to MathJax's assembly pieces.
 */
function readCmap(dv: DataView, notes: string[]): Map<number, number> {
    const map = new Map<number, number>();
    try {
        const ref = getTable(dv, 'cmap');
        if (!ref) {
            notes.push('No cmap table: codepoint coverage unknown, chars left empty.');
            return map;
        }
        const numSub = dv.getUint16(ref.offset + 2);
        for (let i = 0; i < numSub; i++) {
            const rec = ref.offset + 4 + i * 8;
            if (rec + 8 > ref.offset + ref.length) break;
            const platform = dv.getUint16(rec);
            const encoding = dv.getUint16(rec + 2);
            const isUnicode = platform === 0 || (platform === 3 && (encoding === 1 || encoding === 10));
            if (!isUnicode) continue;
            const sub = ref.offset + dv.getUint32(rec + 4);
            if (sub + 4 > ref.offset + ref.length) continue;
            const end = ref.offset + ref.length;
            const format = dv.getUint16(sub);
            if (format === 12) parseCmap12(dv, sub, end, map);
            else if (format === 4) parseCmap4(dv, sub, end, map);
            else if (format === 6) parseCmap6(dv, sub, end, map);
            // 其他格式（0/13/14）在此无用或过时。Other formats are unused or obsolete here.
        }
        if (map.size === 0) {
            notes.push('cmap contained no usable Unicode subtable; chars left empty.');
        } else if (map.size >= MAX_CODEPOINT_ENTRIES) {
            notes.push(`cmap truncated at ${MAX_CODEPOINT_ENTRIES} entries (corrupt size guard).`);
        }
    } catch (e) {
        notes.push(`cmap table unreadable (${describeError(e)}); partial coverage kept.`);
    }
    return map;
}

/**
 * 为每个字位建立前进宽度查询（`hmtx`）。
 * Build an advance-width lookup from `hmtx` (after `head`/`hhea`).
 */
function readHmtx(dv: DataView, numHMetrics: number, notes: string[]): ((gid: number) => number) | null {
    try {
        const ref = getTable(dv, 'hmtx');
        if (!ref) {
            notes.push('No hmtx table: advance widths unavailable, chars left empty.');
            return null;
        }
        const count = Math.max(0, Math.min(numHMetrics, Math.floor(ref.length / 4)));
        if (count === 0) {
            notes.push('hmtx has no longHorMetric records; advance widths unavailable.');
            return null;
        }
        const advances = new Uint16Array(count);
        for (let i = 0; i < count; i++) {
            advances[i] = dv.getUint16(ref.offset + i * 4);
        }
        // 超出 numberOfHMetrics 的字位共用最后一个前进宽度（规范行为）。
        // Glyphs past numberOfHMetrics share the last advance (per spec).
        const tail = advances[count - 1];
        return (gid: number) => (gid < count ? advances[gid] : tail);
    } catch (e) {
        notes.push(`hmtx table unreadable (${describeError(e)}); advance widths unavailable.`);
        return null;
    }
}

/** 私用区：MathJax 的可延展拼件住在这里，绝不写入 chars。Private-use area: MathJax's assembly pieces live here. */
function isPrivateUse(code: number): boolean {
    return (
        (code >= 0xe000 && code <= 0xf8ff) ||
        (code >= 0xf0000 && code <= 0xffffd) ||
        (code >= 0x100000 && code <= 0x10fffd)
    );
}

/** 控制字符无墨迹，度量无意义。Control characters carry no ink. */
function isControl(code: number): boolean {
    return code < 0x20 || (code >= 0x7f && code <= 0x9f);
}

export const cambriaMathAdapter: MathFontAdapter = {
    id: 'cambria-math',
    name: 'Cambria Math',
    families: FAMILIES,
    priority: 80,
    matches(familyName: string): boolean {
        return matchByFamilyName({ families: FAMILIES }, familyName);
    },
    build(binary: ArrayBuffer, ctx: AdapterContext): MathFontMetrics | null {
        const notes: string[] = [];
        // 部分失败时仍返回已读到的内容，保证错误进入 notes 而不是静默丢弃。
        // On partial failure still return what was read, so errors surface in notes.
        let mathTable: OpenTypeMathTable | null = null;
        let chars: Record<string, GlyphMetrics> = {};

        try {
            if (!binary || binary.byteLength < 12) {
                return null;
            }

            // 集合（cambria.ttc）解包，保证 MATH 与字形度量来自同一成员。
            // Unpack collections so MATH and glyph metrics come from the same member.
            const font = extractSingleFont(binary, notes);
            const dv = new DataView(font);

            // 1. MATH 表：常量的唯一权威。没有它就没有可映射的标准度量，直接让路。
            //    The MATH table is the authority for constants; without it, decline.
            mathTable = readOpenTypeMathTable(font);
            if (!mathTable) {
                return null;
            }

            // 2. 单位：与常量共用同一 basis，避免两套换算打架。
            //    Keep chars and constants on one units-per-em basis.
            const upm =
                mathTable.unitsPerEm > 0
                    ? mathTable.unitsPerEm
                    : ctx.unitsPerEm && ctx.unitsPerEm > 0
                      ? ctx.unitsPerEm
                      : 1000;

            // 3. 纵向布局盒：全字体升/降部（近似值）。Font-wide verticals as the layout box.
            const vertical = pickVertical(readHhea(dv), readOs2(dv, notes));
            const height = vertical.ascent / upm;
            const depth = vertical.descent / upm;

            // 4. cmap + hmtx → 逐字形盒子。Per-glyph boxes from cmap + hmtx.
            const cmap = readCmap(dv, notes);
            const hhea = readHhea(dv);
            const advanceFor = readHmtx(dv, hhea ? hhea.numHMetrics : 0, notes);
            let used = 0;
            let skipped = 0;
            if (advanceFor && cmap.size > 0) {
                for (const [code, gid] of cmap) {
                    if (gid <= 0 || isPrivateUse(code) || isControl(code) || code > 0x10ffff) {
                        skipped++;
                        continue;
                    }
                    const advance = advanceFor(gid);
                    if (!(advance > 0)) {
                        // 零前进宽度多半是 hmtx 读歪了（例如 numHMetrics 误读成 0），
                        // 写进去会把字形压到邻字上，宁可保留 MathJax 原值。
                        // A zero advance is usually a misread hmtx; keep MathJax's value.
                        skipped++;
                        continue;
                    }
                    chars[String(code)] = [height, depth, advance / upm];
                    used++;
                }
            }

            // hmtx 全为 0 视为读取失败，丢弃 chars 以免写入有害宽度。
            // All-zero advances mean hmtx was misread; drop chars rather than corrupt widths.
            if (cmap.size > 0 && used === 0 && advanceFor) {
                chars = {};
                notes.push('Every hmtx advance was zero; treating hmtx as unreadable and leaving chars empty.');
            }

            notes.push(
                `Layout-box height/depth from font-wide ${vertical.source} ` +
                    `(${height.toFixed(4)} / ${depth.toFixed(4)} em): the MATH table carries no per-glyph vertical extents, ` +
                    `so verticals are an approximation; widths are exact hmtx advances.`,
            );
            notes.push(
                `Read ${used} glyph boxes from cmap+hmtx (skipped ${skipped}: private-use, control, .notdef or zero advance).`,
            );
            notes.push(
                'MATH constants taken verbatim from Cambria Math (ClearType-tuned; axis height is relatively high by design).',
            );
            notes.push(
                'Stretchy delimiter sizes left to MathJax (delimiters omitted, ownsStretchyAssembly=false): ' +
                    'brace and arrow assembly uses MathJax private-use pieces, not this font.',
            );
            if (Object.keys(mathTable.italicCorrection).length > 0) {
                notes.push(
                    `MATH italics corrections for ${Object.keys(mathTable.italicCorrection).length} glyphs were read ` +
                        'but not exported (MathFontMetrics has no field for them).',
                );
            }

            return {
                source: 'opentype-math',
                chars,
                // 刻意省略：见上方 notes——花括号与箭头由 MathJax 的拼件组装。
                // Deliberately absent: braces and arrows are assembled by MathJax's own pieces.
                delimiters: undefined,
                constants: mathTable.constants,
                ownsStretchyAssembly: false,
                notes,
            };
        } catch (e) {
            // 兜底：损坏的字体不能拖垮注册表循环；能返回多少算多少，错误进 notes。
            // Last resort: a malformed font must not break the registry loop.
            notes.push(`Cambria Math metrics were only partially read: ${describeError(e)}`);
            if (mathTable) {
                return {
                    source: 'opentype-math',
                    chars,
                    constants: mathTable.constants,
                    ownsStretchyAssembly: false,
                    notes,
                };
            }
            return null;
        }
    },
};
