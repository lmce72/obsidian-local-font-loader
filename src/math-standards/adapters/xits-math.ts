/**
 * XITS Math adapter / XITS Math 字体适配器
 *
 * XITS is the STIX-family Times-like math font (the face this vault actually uses). It ships a
 * complete OpenType `MATH` table, so its metrics are read, never measured.
 * XITS 是 STIX 系 Times 风格数学字体（本库实际使用的字面）。它带有完整的 OpenType `MATH`
 * 表，因此全部度量均来自字体元数据读取，绝不走测量路径。
 *
 * Design notes / 设计说明：
 *  - It is a two-width design: wide upright shapes, with both a text weight and a bold. This
 *    adapter reports the metrics of the supplied face only.
 *    它是双宽度设计：直立体较宽，并同时提供常规与粗体。本适配器只描述传入的那一副字面。
 *  - The MATH table's `MathGlyphInfo` carries no per-glyph vertical extents (only italic
 *    correction, top accent, kern info and extended-shape coverage). Per-glyph advance comes from
 *    `hmtx`; height/depth therefore use the font-wide typographic ascender/descender as a uniform
 *    layout box, which is an approximation recorded in `notes`.
 *    MATH 的 `MathGlyphInfo` 不含逐字形垂直范围（仅斜体校正、顶重音、kern 与 extended shape
 *    覆盖）。逐字形步进来自 `hmtx`；高度/深度则采用全字体排版上伸/下伸作为统一版式盒，
 *    属近似值，已记入 `notes`。
 *  - `delimiters` is deliberately left undefined: MathJax assembles stretchy braces and arrows
 *    from its own faces' private-use pieces, so its target sizes must stay its own.
 *    刻意不填 `delimiters`：MathJax 用其自有字面的私用区拼件组装可伸缩括号与箭头，
 *    其目标尺寸必须保持 MathJax 自己的值。
 *
 * Imports are limited to the contract modules `types` and `opentype-math` so the module compiles
 * standalone (paths are `../…` only because this file lives in `adapters/`).
 * 导入仅限契约模块 `types` 与 `opentype-math`，保证模块可独立编译
 * （写作 `../…` 仅因本文件位于 `adapters/` 目录）。
 */

import type { AdapterContext, GlyphMetrics, MathFontAdapter, MathFontMetrics } from '../types';
import { matchByFamilyName } from '../types';
import { readOpenTypeMathTable } from '../opentype-math';

/** Families this adapter claims / 本适配器认领的字族名 */
const XITS_FAMILIES: string[] = ['XITS Math', 'XITS Math Two', 'XITS'];

/**
 * Codepoint ranges worth reporting into MathJax's table.
 * 值得写入 MathJax 表的码位区间。
 *
 * Math alphanumerics and the usual math blocks, plus Latin Extended, Greek and Cyrillic — XITS
 * covers them and math typesetting uses them. Private-use and controls are excluded on purpose:
 * MathJax owns the private-use stretchy pieces.
 * 数学字母数字与常见数学区段，另加 Latin Extended、希腊文与西里尔文——XITS 覆盖这些且数学排版
 * 会用到。刻意排除私用区与控制符：私用区可伸缩拼件归 MathJax 所有。
 */
const REPORT_RANGES: Array<[number, number]> = [
    [0x20, 0x7e], // ASCII printable / ASCII 可打印
    [0xa0, 0xff], // Latin-1 supplement / 拉丁一增补
    [0x100, 0x24f], // Latin Extended-A/B / 拉丁扩展 A/B
    [0x370, 0x3ff], // Greek and Coptic / 希腊与科普特
    [0x400, 0x4ff], // Cyrillic / 西里尔
    [0x2000, 0x206f], // General punctuation / 通用标点
    [0x2070, 0x209f], // Super/subscripts / 上下标
    [0x20a0, 0x20bf], // Currency symbols / 货币符号
    [0x2100, 0x214f], // Letterlike symbols / 类字母符号
    [0x2190, 0x21ff], // Arrows / 箭头
    [0x2200, 0x22ff], // Mathematical operators / 数学运算符
    [0x2300, 0x23ff], // Miscellaneous technical / 杂项技术符号
    [0x25a0, 0x25ff], // Geometric shapes / 几何形状
    [0x2600, 0x26ff], // Miscellaneous symbols / 杂项符号
    [0x27c0, 0x27ef], // Miscellaneous math symbols-A / 杂项数学符号 A
    [0x2980, 0x29ff], // Miscellaneous math symbols-B / 杂项数学符号 B
    [0x2a00, 0x2aff], // Supplemental math operators / 增补数学运算符
    [0x1d400, 0x1d7ff], // Mathematical alphanumerics / 数学字母数字
];

/** Control characters carry no ink / 控制符无墨迹 */
function isControl(code: number): boolean {
    return code < 0x20 || (code >= 0x7f && code <= 0x9f);
}

/** Private-use areas belong to MathJax's assembly pieces / 私用区属于 MathJax 的拼装件 */
function isPrivateUse(code: number): boolean {
    return (
        (code >= 0xe000 && code <= 0xf8ff) ||
        (code >= 0xf0000 && code <= 0xffffd) ||
        (code >= 0x100000 && code <= 0x10fffd)
    );
}

/** True when a codepoint falls in one of the reported ranges / 码位是否落在上报区间内 */
function inReportedRange(code: number): boolean {
    for (const [from, to] of REPORT_RANGES) {
        if (code >= from && code <= to) return true;
    }
    return false;
}

/** Locate one table in the sfnt table directory / 在 sfnt 表目录中定位单张表 */
function findTable(dv: DataView, base: number, tag: string): { offset: number; length: number } | null {
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
        // Out-of-range directory read: treat as a missing table / 目录越界读取：按缺表处理
    }
    return null;
}

/** Offset of the first font inside a collection, or 0 for a plain font / 集合内首字体偏移，普通字体为 0 */
function fontBase(dv: DataView, byteLength: number): number {
    try {
        if (byteLength < 12) return -1;
        const tag = String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3));
        if (tag === 'ttcf') {
            const numFonts = dv.getUint32(8);
            if (numFonts < 1) return -1;
            return dv.getUint32(12);
        }
        return 0;
    } catch {
        return -1;
    }
}

/** What the plain OpenType tables give us / 普通 OpenType 表提供的信息 */
interface SfntInfo {
    unitsPerEm: number;
    /** Font-wide ascender in design units (positive) / 全字体上伸（设计单位，正值） */
    ascender: number;
    /** Font-wide descender in design units (negative) / 全字体下伸（设计单位，负值） */
    descender: number;
    numGlyphs: number;
    /** Per-glyph advance in design units / 逐字形步进（设计单位） */
    advances: Uint16Array | null;
    /** Codepoint -> glyph id / 码位到字形 id */
    cmap: Map<number, number> | null;
    /** Which vertical source won / 垂直度量来源 */
    verticalSource: 'os2-typo' | 'hhea' | 'none';
}

/** Parse one cmap subtable into `into` / 解析单张 cmap 子表写入 `into` */
function readCmapSubtable(dv: DataView, tableStart: number, subOffset: number, into: Map<number, number>): boolean {
    try {
        const o = tableStart + subOffset;
        const format = dv.getUint16(o);
        if (format === 4) {
            // Format 4: BMP segments / 格式 4：BMP 分段
            const segCountX2 = dv.getUint16(o + 6);
            const segCount = segCountX2 >>> 1;
            if (segCount === 0) return false;
            const endBase = o + 14;
            const startBase = endBase + segCount * 2 + 2; // +2 skips reservedPad / +2 跳过保留字
            const deltaBase = startBase + segCount * 2;
            const rangeBase = deltaBase + segCount * 2;
            for (let i = 0; i < segCount; i++) {
                const end = dv.getUint16(endBase + i * 2);
                const start = dv.getUint16(startBase + i * 2);
                const delta = dv.getInt16(deltaBase + i * 2);
                const rangeOffset = dv.getUint16(rangeBase + i * 2);
                if (start > end) continue;
                // 0xFFFF is the required sentinel segment; skip only that codepoint, not a whole
                // segment that merely reaches the BMP top.
                // 0xFFFF 是规范要求的哨兵段；只跳过该码位，而非整个触顶 BMP 的段。
                const last = Math.min(end, 0xfffe);
                for (let cp = start; cp <= last; cp++) {
                    let gid: number;
                    if (rangeOffset === 0) {
                        gid = (cp + delta) & 0xffff;
                    } else {
                        // Glyph id array addressing per the spec / 按规范计算字形 id 数组地址
                        const addr = rangeBase + i * 2 + rangeOffset + (cp - start) * 2;
                        gid = dv.getUint16(addr);
                        if (gid !== 0) gid = (gid + delta) & 0xffff;
                    }
                    if (gid !== 0) into.set(cp, gid);
                }
            }
            return true;
        }
        if (format === 12) {
            // Format 12: full-repertoire groups / 格式 12：全码位分组
            const nGroups = dv.getUint32(o + 12);
            for (let g = 0; g < nGroups; g++) {
                const rec = o + 16 + g * 12;
                const startCp = dv.getUint32(rec);
                const endCp = dv.getUint32(rec + 4);
                const startGid = dv.getUint32(rec + 8);
                if (startCp > endCp || endCp > 0x10ffff) continue;
                for (let cp = startCp; cp <= endCp; cp++) {
                    const gid = startGid + (cp - startCp);
                    if (gid !== 0) into.set(cp, gid);
                }
            }
            return true;
        }
    } catch {
        // Malformed subtable: caller tries the next one / 子表损坏：调用方换下一张
    }
    return false;
}

/** Build the codepoint map from the best cmap subtable available / 从最优 cmap 子表构建码位映射 */
function readCmap(dv: DataView, table: { offset: number; length: number }, notes: string[]): Map<number, number> | null {
    try {
        const numTables = dv.getUint16(table.offset + 2);
        const candidates: Array<{ plat: number; enc: number; off: number; rank: number }> = [];
        for (let i = 0; i < numTables; i++) {
            const rec = table.offset + 4 + i * 8;
            const plat = dv.getUint16(rec);
            const enc = dv.getUint16(rec + 2);
            const off = dv.getUint32(rec + 4);
            // Preference: Windows full Unicode, any Unicode, Windows BMP, everything else.
            // 优先级：Windows 全 Unicode、任意 Unicode、Windows BMP、其余。
            let rank = 9;
            if (plat === 3 && enc === 10) rank = 0;
            else if (plat === 0) rank = 1;
            else if (plat === 3 && enc === 1) rank = 2;
            else if (plat === 3 && enc === 0) rank = 3;
            candidates.push({ plat, enc, off, rank });
        }
        candidates.sort((a, b) => a.rank - b.rank);
        const into = new Map<number, number>();
        for (const c of candidates) {
            into.clear();
            if (readCmapSubtable(dv, table.offset, c.off, into) && into.size > 0) {
                notes.push(
                    `cmap subtable platform ${c.plat} encoding ${c.enc} gave ${into.size} codepoints. ` +
                        `cmap 子表 platform ${c.plat} / encoding ${c.enc} 解析出 ${into.size} 个码位。`,
                );
                return into;
            }
        }
        notes.push('No usable cmap subtable (only formats 4 and 12 are read); chars stay empty. ' + '无可用 cmap 子表（仅解析格式 4 与 12），chars 留空。');
    } catch {
        notes.push('cmap could not be parsed; chars stay empty. ' + 'cmap 解析失败，chars 留空。');
    }
    return null;
}

/** Read head / hhea / maxp / OS-2 / hmtx / cmap into one bundle / 读取各表并打包 */
function readSfntInfo(binary: ArrayBuffer, notes: string[]): SfntInfo | null {
    try {
        const dv = new DataView(binary);
        const base = fontBase(dv, binary.byteLength);
        if (base < 0) {
            notes.push('Font header is unreadable; only MATH constants can be reported. ' + '字体头不可读，仅能上报 MATH 常量。');
            return null;
        }

        // head: unitsPerEm at +18 / head：+18 处为 unitsPerEm
        let unitsPerEm = 1000;
        const head = findTable(dv, base, 'head');
        if (head && head.offset + 20 <= binary.byteLength) {
            const upem = dv.getUint16(head.offset + 18);
            if (upem > 0) unitsPerEm = upem;
        }

        // maxp: numGlyphs at +4 / maxp：+4 处为字形总数
        let numGlyphs = 0;
        const maxp = findTable(dv, base, 'maxp');
        if (maxp && maxp.offset + 6 <= binary.byteLength) {
            numGlyphs = dv.getUint16(maxp.offset + 4);
        }

        // hhea: ascender +4, descender +6, numberOfHMetrics +34 / hhea：上伸、下伸、步进条目数
        let hheaAsc = 0;
        let hheaDesc = 0;
        let numberOfHMetrics = 0;
        const hhea = findTable(dv, base, 'hhea');
        if (hhea && hhea.offset + 36 <= binary.byteLength) {
            hheaAsc = dv.getInt16(hhea.offset + 4);
            hheaDesc = dv.getInt16(hhea.offset + 6);
            numberOfHMetrics = dv.getUint16(hhea.offset + 34);
        }

        // OS/2: sTypoAscender +68, sTypoDescender +70 (typographic layout extents)
        // OS/2：+68 排版上伸、+70 排版下伸（排版版式范围）
        let typoAsc = 0;
        let typoDesc = 0;
        const os2 = findTable(dv, base, 'OS/2');
        if (os2 && os2.offset + 72 <= binary.byteLength) {
            typoAsc = dv.getInt16(os2.offset + 68);
            typoDesc = dv.getInt16(os2.offset + 70);
        }

        // Prefer the typographic pair when it is sane; it is a layout metric, not ink.
        // 合法时优先排版对：它是版式度量而非墨迹范围。
        let ascender = 0;
        let descender = 0;
        let verticalSource: SfntInfo['verticalSource'] = 'none';
        const sane = (a: number, d: number) => a > 0 && d < 0 && a <= unitsPerEm * 2 && -d <= unitsPerEm;
        if (sane(typoAsc, typoDesc)) {
            ascender = typoAsc;
            descender = typoDesc;
            verticalSource = 'os2-typo';
        } else if (sane(hheaAsc, hheaDesc)) {
            ascender = hheaAsc;
            descender = hheaDesc;
            verticalSource = 'hhea';
        } else {
            notes.push('Neither OS/2 sTypo nor hhea gave sane verticals; height/depth fall back to 0.8/0.2 em. ' + 'OS/2 sTypo 与 hhea 均无合法垂直度量，高度/深度退化为 0.8/0.2 em。');
            ascender = Math.round(unitsPerEm * 0.8);
            descender = -Math.round(unitsPerEm * 0.2);
            verticalSource = 'none';
        }

        // hmtx: advance per glyph, last advance repeats for the tail glyphs
        // hmtx：逐字形步进，尾部字形沿用最后一条步进
        let advances: Uint16Array | null = null;
        const hmtx = findTable(dv, base, 'hmtx');
        if (hmtx && numGlyphs > 0 && numberOfHMetrics > 0) {
            const usable = Math.min(numberOfHMetrics, numGlyphs);
            if (hmtx.offset + usable * 4 <= binary.byteLength) {
                advances = new Uint16Array(numGlyphs);
                let last = 0;
                for (let g = 0; g < usable; g++) {
                    last = dv.getUint16(hmtx.offset + g * 4);
                    advances[g] = last;
                }
                for (let g = usable; g < numGlyphs; g++) advances[g] = last;
            }
        }
        if (!advances) {
            notes.push('hmtx was unusable; glyph widths stay at MathJax values. ' + 'hmtx 不可用，字形宽度保留 MathJax 原值。');
        }

        // cmap / 码位映射
        let cmap: Map<number, number> | null = null;
        const cmapTable = findTable(dv, base, 'cmap');
        if (cmapTable) {
            cmap = readCmap(dv, cmapTable, notes);
        } else {
            notes.push('No cmap table; chars stay empty. ' + '缺少 cmap 表，chars 留空。');
        }

        return { unitsPerEm, ascender, descender, numGlyphs, advances, cmap, verticalSource };
    } catch (err) {
        notes.push(
            `sfnt metric tables could not be read: ${err instanceof Error ? err.message : String(err)}. ` +
                `sfnt 度量表读取失败：${err instanceof Error ? err.message : String(err)}。`,
        );
        return null;
    }
}

export const xitsMathAdapter: MathFontAdapter = {
    id: 'xits-math',
    name: 'XITS Math',
    families: XITS_FAMILIES,
    priority: 10,

    matches(familyName: string): boolean {
        return matchByFamilyName({ families: XITS_FAMILIES }, familyName);
    },

    build(binary: ArrayBuffer, ctx: AdapterContext): MathFontMetrics | null {
        const notes: string[] = [];
        // The font's own MATH table is the point of this adapter: without it, decline and let the
        // measurement fallback try. The helper never throws — a malformed table reads as "none".
        // 本适配器的意义就是字体自带的 MATH 表：没有它就拒绝，交给测量兜底。
        // 辅助函数不会抛出——损坏的表等同于“没有表”。
        const math = readOpenTypeMathTable(binary);
        if (!math) {
            return null;
        }

        try {
            const info = readSfntInfo(binary, notes);

            // The helper already converted MATH values to em; take its constants as-is.
            // 辅助函数已把 MATH 值转成 em，常量原样采用。
            const constants = math.constants;
            if (typeof constants.axisHeight === 'number') {
                notes.push(`MATH constants adopted (axisHeight ${constants.axisHeight.toFixed(4)} em).` + ` 已采用 MATH 常量（axisHeight ${constants.axisHeight.toFixed(4)} em）。`);
            } else {
                notes.push('MATH constants were partially readable; missing fields stay undefined. ' + 'MATH 常量只读到部分字段，缺失项保持 undefined。');
            }

            // Stretchy assembly stays with MathJax — see the file header.
            // 可伸缩拼装仍归 MathJax，见文件头说明。
            notes.push('Stretchy delimiter sizes were left to MathJax: this font does not own the assembly in MathJax output. ' + '可伸缩定界符尺寸保留 MathJax 原值：在 MathJax 输出中拼装并不由本字体承担。');

            // What the MATH table could not supply / MATH 表无法提供的部分
            const italicCount = Object.keys(math.italicCorrection).length;
            const extCount = math.extendedShapes.size;
            notes.push(
                `MATH also reports ${italicCount} italic corrections and ${extCount} extended shapes; ` +
                    `MathFontMetrics has no fields for them and they are not applied here. ` +
                    `MATH 另含 ${italicCount} 条斜体校正与 ${extCount} 个 extended shape；` +
                    `MathFontMetrics 无对应字段，此处未套用。`,
            );
            notes.push('XITS is a two-width design (text weight plus bold); these metrics describe the supplied face only. ' + 'XITS 为双宽度设计（常规+粗体）；本组度量仅描述传入的这一副字面。');

            const chars: Record<string, GlyphMetrics> = {};
            if (!info) {
                notes.push('Glyph boxes could not be built; only constants are reported. ' + '无法构建字形盒，仅上报常量。');
                return {
                    source: 'opentype-math',
                    chars,
                    delimiters: undefined,
                    constants,
                    ownsStretchyAssembly: false,
                    notes,
                };
            }

            // Layout box: height/depth from the font-wide typographic verticals, width from hmtx.
            // This is the documented approximation — the font gives no per-glyph vertical extents.
            // 版式盒：高度/深度取全字体排版垂直度量，宽度取 hmtx 步进。
            // 这是文档写明的近似——字体未提供逐字形垂直范围。
            const upem = info.unitsPerEm > 0 ? info.unitsPerEm : 1000;
            const height = info.ascender / upem;
            const depth = -info.descender / upem;
            if (ctx.unitsPerEm && ctx.unitsPerEm !== upem) {
                notes.push(`Caller reported unitsPerEm ${ctx.unitsPerEm}, font says ${upem}; the font wins. ` + `调用方报告 unitsPerEm ${ctx.unitsPerEm}，字体为 ${upem}；以字体为准。`);
            }
            notes.push(
                `Glyph boxes: width per-glyph from hmtx, height ${height.toFixed(4)} em / depth ${depth.toFixed(4)} em ` +
                    `uniformly from ${info.verticalSource} (per-glyph verticals are approximated by these font-wide values). ` +
                    `字形盒：宽度逐字形取自 hmtx，高度 ${height.toFixed(4)} em / 深度 ${depth.toFixed(4)} em ` +
                    `统一取自 ${info.verticalSource}（逐字形垂直度量以此全字体值近似）。`,
            );

            if (info.cmap && info.advances) {
                let mapped = 0;
                let zeroAdvance = 0;
                for (const [code, gid] of info.cmap) {
                    if (!inReportedRange(code) || isControl(code) || isPrivateUse(code)) continue;
                    if (gid <= 0 || gid >= info.numGlyphs) continue;
                    const width = (info.advances[gid] ?? 0) / upem;
                    // Zero-advance glyphs are usually combining marks: keep them at width 0,
                    // which is their true advance, rather than dropping them.
                    // 零步进字形多为组合记号：保留宽度 0（即其真实步进），不丢弃。
                    if (width === 0) zeroAdvance++;
                    chars[String(code)] = [height, depth, width];
                    mapped++;
                }
                notes.push(`Built ${mapped} glyph boxes from cmap+hmtx.` + ` 由 cmap+hmtx 构建 ${mapped} 个字形盒。`);
                if (zeroAdvance > 0) {
                    notes.push(`${zeroAdvance} zero-advance glyphs kept at width 0 (combining marks).` + ` 有 ${zeroAdvance} 个零步进字形保留宽度 0（组合记号）。`);
                }
                if (mapped === 0) {
                    notes.push('cmap produced no reported codepoints; constants remain the useful output. ' + 'cmap 未给出任何上报码位，常量仍是有效产出。');
                }
            }

            return {
                source: 'opentype-math',
                chars,
                // Deliberately absent — see the file header and rule in types.ts.
                // 刻意缺省——见文件头与 types.ts 中的约定。
                delimiters: undefined,
                constants,
                ownsStretchyAssembly: false,
                notes,
            };
        } catch (err) {
            // Never throw and never swallow: the reason goes into `notes`, and the constants read
            // from MATH are still worth handing back even when the glyph boxes failed.
            // 绝不抛出、绝不静默：原因写入 `notes`；即便字形盒构建失败，MATH 常量仍值得回传。
            notes.push(
                `xits-math build failed: ${err instanceof Error ? err.message : String(err)}. ` +
                    `xits-math 构建失败：${err instanceof Error ? err.message : String(err)}。`,
            );
            return {
                source: 'opentype-math',
                chars: {},
                delimiters: undefined,
                constants: math.constants,
                ownsStretchyAssembly: false,
                notes,
            };
        }
    },
};
