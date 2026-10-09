/**
 * TeX Gyre Termes Math — Times-flavoured OpenType `MATH` adapter.
 * TeX Gyre Termes Math（Times 风格 OpenType MATH 字体）适配器。
 *
 * This family comes from the TeX Gyre project, derived from URW Nimbus Roman (Times). It is a
 * `MATH`-table font, so its metrics are read from the font's own metadata and never measured.
 * 这个字族来自 TeX Gyre 工程（源自 URW Nimbus Roman / Times）。它自带 `MATH` 表，
 * 因此度量一律从字体元数据读取，绝不走 canvas 测量。
 *
 * Family-keying note: the adapter claims exactly "TeX Gyre Termes Math" and "TeX Gyre Termes" and
 * deliberately does NOT claim "Times" — Times-flavoured text fonts are a different set of files and
 * XITS (also Times-flavoured) has its own adapter.
 * 字族键说明：本适配器只认上述两个名字，绝不认 "Times"；XITS 等同为 Times 风格的字体各有各的适配器。
 *
 * Outline-format note: TeX Gyre Termes Math ships CFF outlines (no `glyf`/`loca`), so there is no
 * cheap per-glyph ink box to read. Per-glyph vertical extents are therefore the font-wide
 * ascender/descender applied per glyph — recorded in `metrics.notes` as the approximation it is.
 * 轮廓格式说明：该字体是 CFF 轮廓（无 `glyf`/`loca`），没有可廉价读取的逐字形墨迹盒。
 * 逐字形垂直度量因此采用字体内全局的上/下缘并逐字形套用，这一近似会记入 `metrics.notes`。
 *
 * Stretchy note: `delimiters` stays undefined and `ownsStretchyAssembly` stays false. MathJax
 * assembles `\left(...\right)`, `\underbrace` and extensible arrows from private-use pieces in its
 * own faces; overwriting its target sizes with this font's numbers is exactly the bug this
 * architecture replaces.
 * 伸缩定界符说明：`delimiters` 保持 undefined、`ownsStretchyAssembly` 保持 false。MathJax 用它
 * 自己字体的私用区零件拼装括号/花括号/箭头，用本字体的尺寸覆盖它的目标尺寸正是要修的 bug。
 */

import type { AdapterContext, GlyphMetrics, MathFontAdapter, MathFontMetrics } from '../types';
import { matchByFamilyName } from '../types';
import { readOpenTypeMathTable } from '../opentype-math';

/** Family names this adapter claims (exact, case-insensitive). 本适配器认领的字族名。 */
const FAMILIES = ['TeX Gyre Termes Math', 'TeX Gyre Termes'];

/**
 * Codepoints MathJax draws from the user's font (the plain variants). Anything outside keeps
 * MathJax's own value, which is the safe outcome.
 * MathJax 会从用户字体取用的码位集合（普通变体）。集合之外的码位沿用 MathJax 自己的数值。
 */
const PROBE_RANGES: Array<[number, number]> = [
    [0x20, 0x7e],     // ASCII printable / ASCII 可打印字符
    [0xa0, 0xff],     // Latin-1 supplement / 拉丁一增补
    [0x370, 0x3ff],   // Greek and Coptic / 希腊字母
    [0x2000, 0x206f], // General punctuation / 通用标点
    [0x2070, 0x209f], // Super/subscripts / 上下标
    [0x20a0, 0x20bf], // Currency symbols / 货币符号
    [0x2100, 0x214f], // Letterlike symbols / 字母式符号
    [0x2190, 0x21ff], // Arrows / 箭头
    [0x2200, 0x22ff], // Mathematical operators / 数学运算符
    [0x2300, 0x23ff], // Miscellaneous technical / 杂项技术符号
    [0x25a0, 0x25ff], // Geometric shapes / 几何形状
    [0x2600, 0x26ff], // Miscellaneous symbols / 杂项符号
    [0x27c0, 0x27ef], // Miscellaneous math symbols-A / 杂项数学符号 A
    [0x2980, 0x29ff], // Miscellaneous math symbols-B / 杂项数学符号 B
    [0x2a00, 0x2aff], // Supplemental math operators / 增补数学运算符
    [0x1d400, 0x1d7ff], // Mathematical alphanumerics / 数学字母数字符号
];

/** One table's location in the file. 表在文件中的位置。 */
interface TableRef {
    offset: number;
    length: number;
}

/** The pieces of the font this adapter reads. 本适配器要读的字体部件。 */
interface FontSfnt {
    /** File bytes as a view, already bounds-checked by `indexTables`. 已做边界检查的文件视图。 */
    dv: DataView;
    /** Total byte length, for bounds checks. 总字节数，用于边界检查。 */
    totalBytes: number;
    tables: Map<string, TableRef>;
}

/**
 * Index the font's table directory. Handles a plain font and the first member of a collection.
 * 索引字体的表目录。支持单字体与集合（ttc）中的第一个字体。
 */
function indexTables(binary: ArrayBuffer): FontSfnt | null {
    try {
        if (binary.byteLength < 12) {
            return null;
        }
        const dv = new DataView(binary);
        const tag = String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3));
        // A collection stores several fonts after a shared header; take the first.
        // 集合文件在公共头之后存多个字体，这里取第一个。
        const base = tag === 'ttcf' ? dv.getUint32(12) : 0;
        if (base < 0 || base + 12 > binary.byteLength) {
            return null;
        }
        const numTables = dv.getUint16(base + 4);
        const tables = new Map<string, TableRef>();
        for (let i = 0; i < numTables; i++) {
            const rec = base + 12 + i * 16;
            if (rec + 16 > binary.byteLength) {
                break;
            }
            const name = String.fromCharCode(
                dv.getUint8(rec),
                dv.getUint8(rec + 1),
                dv.getUint8(rec + 2),
                dv.getUint8(rec + 3)
            );
            // Record offsets are from the beginning of the file. 记录中的偏移自文件头算起。
            const offset = dv.getUint32(rec + 8);
            const length = dv.getUint32(rec + 12);
            if (offset >= 0 && length >= 0 && offset + length <= binary.byteLength) {
                tables.set(name, { offset, length });
            }
        }
        return { dv, totalBytes: binary.byteLength, tables };
    } catch {
        // A directory we cannot index is the same as an unreadable font: the caller declines.
        // 目录无法索引等于字体不可读：调用方会放弃本适配器。
        return null;
    }
}

/** Read `head.unitsPerEm` (offset 18). 读取 `head.unitsPerEm`（偏移 18）。 */
function readUnitsPerEm(sfnt: FontSfnt, notes: string[]): number {
    try {
        const head = sfnt.tables.get('head');
        if (!head || head.offset + 20 > sfnt.totalBytes) {
            notes.push('head table missing or truncated; assuming unitsPerEm 1000.');
            return 1000;
        }
        const upem = sfnt.dv.getUint16(head.offset + 18);
        if (!(upem > 0)) {
            notes.push('head.unitsPerEm was zero; assuming 1000.');
            return 1000;
        }
        return upem;
    } catch {
        notes.push('head table unreadable; assuming unitsPerEm 1000.');
        return 1000;
    }
}

/**
 * Font-wide vertical metrics in design units.
 * 字体级垂直度量（设计单位）。
 *
 * Preference: `OS/2` sTypoAscender/sTypoDescender when `fsSelection` bit 7 (USE_TYPO_METRICS) is
 * set, otherwise `hhea` ascender/descender — with whichever exists as fallback. Line gap is
 * leading, not part of a glyph box, so it is never included.
 * 优先级：`OS/2` 的 sTypo*（当 fsSelection 第 7 位 USE_TYPO_METRICS 置位时），否则用 `hhea`；
 * 缺谁就用另一半兜底。行距（lineGap）属于行距空白，不进字形盒，永不计入。
 */
function readVerticalMetrics(sfnt: FontSfnt, upem: number, notes: string[]): { height: number; depth: number } {
    let ascent = 0;
    let descent = 0;
    let source = '';
    try {
        const hhea = sfnt.tables.get('hhea');
        if (hhea && hhea.offset + 36 <= sfnt.totalBytes) {
            ascent = sfnt.dv.getInt16(hhea.offset + 4);
            descent = sfnt.dv.getInt16(hhea.offset + 6);
            source = 'hhea';
        }
        const os2 = sfnt.tables.get('OS/2');
        if (os2 && os2.offset + 76 <= sfnt.totalBytes) {
            const fsSelection = sfnt.dv.getUint16(os2.offset + 62);
            const typoAscender = sfnt.dv.getInt16(os2.offset + 68);
            const typoDescender = sfnt.dv.getInt16(os2.offset + 70);
            const useTypo = (fsSelection & 0x0080) !== 0;
            if ((useTypo || !source) && typoAscender > 0) {
                ascent = typoAscender;
                descent = typoDescender;
                source = useTypo ? 'OS/2 sTypo (USE_TYPO_METRICS)' : 'OS/2 sTypo (hhea absent)';
            }
        }
    } catch {
        notes.push('Vertical metrics tables were partially unreadable; using whatever was already read.');
    }
    if (!source || ascent <= 0) {
        notes.push('No usable font-wide ascender/descender; degraded to the 0.8em / 0.2em generic line box.');
        return { height: 0.8, depth: 0.2 };
    }
    notes.push(`Font-wide vertical metrics taken from ${source} (${ascent}/${descent} design units).`);
    // Layout box: height above the baseline, depth below. Negative descender becomes positive depth.
    // 布局盒：height 是基线以上、depth 是基线以下。descender 为负值，取绝对值作为 depth。
    return { height: Math.max(0, ascent) / upem, depth: Math.max(0, -descent) / upem };
}

/**
 * Build a codepoint → glyph-id lookup from `cmap`.
 * 从 `cmap` 构建码位 → 字形 id 的查找函数。
 *
 * Preference: format 12 (full Unicode) over format 4 over format 6. Every lookup degrades to 0
 * (missing) rather than throwing.
 * 优先级：format 12（完整 Unicode）> format 4 > format 6。任何查找失败都退回 0（缺字），不抛异常。
 */
function buildCmapLookup(sfnt: FontSfnt, notes: string[]): ((code: number) => number) | null {
    try {
        const cmap = sfnt.tables.get('cmap');
        if (!cmap || cmap.offset + 4 > sfnt.totalBytes) {
            notes.push('cmap table missing; no codepoint could be mapped to a glyph.');
            return null;
        }
        const dv = sfnt.dv;
        const numSubtables = dv.getUint16(cmap.offset + 2);
        let bestOffset = -1;
        let bestFormat = -1;
        let bestScore = -1;
        for (let i = 0; i < numSubtables; i++) {
            const rec = cmap.offset + 4 + i * 8;
            if (rec + 8 > sfnt.totalBytes) {
                break;
            }
            const platformId = dv.getUint16(rec);
            const encodingId = dv.getUint16(rec + 2);
            const subOffset = cmap.offset + dv.getUint32(rec + 4);
            if (subOffset + 4 > sfnt.totalBytes) {
                continue;
            }
            const format = dv.getUint16(subOffset);
            // Score: full-Unicode subtables first, then BMP, then anything else readable.
            // 打分：完整 Unicode 子表优先，其次 BMP，再次其它可读子表。
            let score = -1;
            if (format === 12 && platformId === 3 && encodingId === 10) score = 5;
            else if (format === 12 && platformId === 0) score = 4;
            else if (format === 4 && platformId === 3 && encodingId === 1) score = 3;
            else if (format === 4 && platformId === 0) score = 2;
            else if (format === 6) score = 1;
            if (score > bestScore) {
                bestScore = score;
                bestOffset = subOffset;
                bestFormat = format;
            }
        }
        if (bestOffset < 0 || bestFormat < 0) {
            notes.push('cmap contained no usable subtable (formats 4/6/12); no codepoint could be mapped.');
            return null;
        }

        if (bestFormat === 12) {
            // Format 12: nGroups at +12, then sequential-map groups of (start, end, startGlyphID).
            // Format 12：+12 处是 nGroups，其后是 (起, 止, 起始字形 id) 的连续映射组。
            const groupCount = dv.getUint32(bestOffset + 12);
            return (code: number): number => {
                try {
                    let lo = 0;
                    let hi = groupCount - 1;
                    while (lo <= hi) {
                        const mid = (lo + hi) >> 1;
                        const rec = bestOffset + 16 + mid * 12;
                        const start = dv.getUint32(rec);
                        const end = dv.getUint32(rec + 4);
                        if (code < start) hi = mid - 1;
                        else if (code > end) lo = mid + 1;
                        else return dv.getUint32(rec + 8) + (code - start);
                    }
                    return 0;
                } catch {
                    return 0;
                }
            };
        }

        if (bestFormat === 4) {
            // Format 4: segments of (endCode, startCode, idDelta, idRangeOffset).
            // Format 4：以 (endCode, startCode, idDelta, idRangeOffset) 为一段的分段映射。
            const segCount = dv.getUint16(bestOffset + 6) / 2;
            const endCodesAt = bestOffset + 14;
            const startCodesAt = endCodesAt + segCount * 2 + 2; // + reservedPad 保留字段
            const idDeltasAt = startCodesAt + segCount * 2;
            const idRangeOffsetsAt = idDeltasAt + segCount * 2;
            return (code: number): number => {
                try {
                    for (let i = 0; i < segCount; i++) {
                        const end = dv.getUint16(endCodesAt + i * 2);
                        if (code > end) {
                            continue;
                        }
                        const start = dv.getUint16(startCodesAt + i * 2);
                        if (code < start) {
                            return 0;
                        }
                        const idDelta = dv.getInt16(idDeltasAt + i * 2);
                        const idRangeOffset = dv.getUint16(idRangeOffsetsAt + i * 2);
                        if (idRangeOffset === 0) {
                            return (code + idDelta) & 0xffff;
                        }
                        // The offset is relative to its own slot in idRangeOffset[].
                        // 偏移以 idRangeOffset[] 中自己的槽位为基准。
                        const glyphAt = idRangeOffsetsAt + i * 2 + idRangeOffset + (code - start) * 2;
                        if (glyphAt + 2 > sfnt.totalBytes) {
                            return 0;
                        }
                        const raw = dv.getUint16(glyphAt);
                        return raw === 0 ? 0 : (raw + idDelta) & 0xffff;
                    }
                    return 0;
                } catch {
                    return 0;
                }
            };
        }

        // Format 6: trimmed table mapping firstCode..firstCode+entryCount.
        // Format 6：firstCode 起共 entryCount 个的裁剪表映射。
        const firstCode = dv.getUint16(bestOffset + 6);
        const entryCount = dv.getUint16(bestOffset + 8);
        return (code: number): number => {
            try {
                const index = code - firstCode;
                if (index < 0 || index >= entryCount) {
                    return 0;
                }
                return dv.getUint16(bestOffset + 10 + index * 2);
            } catch {
                return 0;
            }
        };
    } catch {
        notes.push('cmap parsing failed; no codepoint could be mapped to a glyph.');
        return null;
    }
}

/** Read `hhea.numberOfHMetrics` (offset 34). 读取 `hhea.numberOfHMetrics`（偏移 34）。 */
function readNumberOfHMetrics(sfnt: FontSfnt, numGlyphs: number, notes: string[]): number {
    try {
        const hhea = sfnt.tables.get('hhea');
        if (!hhea || hhea.offset + 36 > sfnt.totalBytes) {
            notes.push('hhea table missing; assuming numberOfHMetrics equals numGlyphs.');
            return numGlyphs;
        }
        const n = sfnt.dv.getUint16(hhea.offset + 34);
        return n > 0 ? n : numGlyphs;
    } catch {
        notes.push('hhea.numberOfHMetrics unreadable; assuming numberOfHMetrics equals numGlyphs.');
        return numGlyphs;
    }
}

/** Read `maxp.numGlyphs` (offset 4). 读取 `maxp.numGlyphs`（偏移 4）。 */
function readNumGlyphs(sfnt: FontSfnt, notes: string[]): number {
    try {
        const maxp = sfnt.tables.get('maxp');
        if (!maxp || maxp.offset + 6 > sfnt.totalBytes) {
            notes.push('maxp table missing; glyph count unknown, hmtx reads will be best-effort.');
            return 0;
        }
        return sfnt.dv.getUint16(maxp.offset + 4);
    } catch {
        notes.push('maxp.numGlyphs unreadable; hmtx reads will be best-effort.');
        return 0;
    }
}

/**
 * Build a glyph-id → advance-width (design units) reader from `hmtx`.
 * 从 `hmtx` 构建 字形 id → 前进宽度（设计单位）的读取函数。
 *
 * The last metric record covers every trailing glyph (glyphs beyond `numberOfHMetrics` share the
 * final advance). Bounds failures read as 0 so a bad glyph can never throw out of the loop.
 * 最后一条度量记录覆盖其后所有字形（超出 numberOfHMetrics 的字形共用最后一个前进宽度）。
 * 边界失败一律读作 0，保证单个坏字形不会让循环抛异常。
 */
function buildAdvanceReader(sfnt: FontSfnt, numberOfHMetrics: number): (gid: number) => number {
    const hmtx = sfnt.tables.get('hmtx');
    return (gid: number): number => {
        try {
            if (!hmtx || gid < 0) {
                return 0;
            }
            const slot = gid < numberOfHMetrics ? gid : numberOfHMetrics - 1;
            if (slot < 0) {
                return 0;
            }
            const at = hmtx.offset + slot * 4;
            if (at + 2 > sfnt.totalBytes) {
                return 0;
            }
            return sfnt.dv.getUint16(at);
        } catch {
            return 0;
        }
    };
}

export const texGyreTermesMathAdapter: MathFontAdapter = {
    id: 'tex-gyre-termes-math',
    name: 'TeX Gyre Termes Math',
    families: FAMILIES,
    priority: 40,
    matches(familyName: string): boolean {
        return matchByFamilyName({ families: FAMILIES }, familyName);
    },
    build(binary: ArrayBuffer, ctx: AdapterContext): MathFontMetrics | null {
        const notes: string[] = [];
        const chars: Record<string, GlyphMetrics> = {};

        // Every stage degrades with a note; the one outer catch keeps a surprise from escaping and
        // still returns whatever was built. 每一步都降级并记入 notes；外层 catch 防止意外外抛，
        // 并尽量返回已构建的部分结果。
        try {
            const sfnt = indexTables(binary);
            if (!sfnt) {
                // Unreadable font: decline so the measurement fallback can try.
                // 字体不可读：放弃本适配器，让测量兜底适配器接手。
                return null;
            }

            const upem = readUnitsPerEm(sfnt, notes) || ctx.unitsPerEm || 1000;
            const vertical = readVerticalMetrics(sfnt, upem, notes);
            const numGlyphs = readNumGlyphs(sfnt, notes);
            const numberOfHMetrics = readNumberOfHMetrics(sfnt, numGlyphs > 0 ? numGlyphs : 1, notes);
            const lookupGid = buildCmapLookup(sfnt, notes);
            const advanceOf = buildAdvanceReader(sfnt, numberOfHMetrics);

            // The MATH table is what makes this font a math font; the plain "TeX Gyre Termes" text
            // face has none, so its absence degrades to chars-only metrics instead of a decline.
            // MATH 表才是「数学字体」的凭据；纯文本版 "TeX Gyre Termes" 没有该表，
            // 缺表时降级为仅 chars 的度量，而不是整体放弃。
            const math = readOpenTypeMathTable(binary);
            if (!math) {
                notes.push('No OpenType MATH table in this file: constants omitted, chars derived from hmtx/cmap only.');
            }

            if (!lookupGid) {
                // Without a cmap there is nothing sensible to key chars by.
                // 没有 cmap 就无法按码位建 chars，只能放弃。
                return null;
            }

            let mapped = 0;
            let missing = 0;
            let zeroAdvance = 0;

            for (const [from, to] of PROBE_RANGES) {
                for (let code = from; code <= to; code++) {
                    const gid = lookupGid(code);
                    if (gid <= 0) {
                        // .notdef / absent: keep MathJax's own metrics for this codepoint.
                        // 缺字：该码位沿用 MathJax 自己的度量。
                        missing++;
                        continue;
                    }
                    const advance = advanceOf(gid) / upem;
                    if (!(advance > 0)) {
                        // Zero advance would collapse the glyph onto its neighbour.
                        // 零前进宽度会让该字形与邻接字形重叠，跳过。
                        zeroAdvance++;
                        continue;
                    }
                    // Layout box, not ink box: height above the baseline, depth below, width = advance.
                    // This font gives no per-glyph verticals (CFF outlines; MathGlyphInfo carries
                    // none), so every glyph takes the font-wide ascent/descent — the approximation
                    // the contract asks for, recorded rather than hidden.
                    // 布局盒而非墨迹盒：height 基线以上、depth 基线以下、width = 前进宽度。
                    // 本字体无逐字形垂直度量（CFF 轮廓；MathGlyphInfo 也不提供），
                    // 故逐字形套用字体内全局上/下缘——这是约定允许的近似，记入 notes 而非隐藏。
                    chars[String(code)] = [vertical.height, vertical.depth, advance];
                    mapped++;
                }
            }

            if (mapped === 0) {
                notes.push('No probed codepoint mapped to a glyph with a usable advance; declining so the fallback may try.');
                return null;
            }

            notes.push(
                `Per-glyph vertical extents are approximated by the font-wide ascender/descender ` +
                `(${vertical.height.toFixed(3)}em / ${vertical.depth.toFixed(3)}em) for all ${mapped} glyphs: ` +
                `CFF outlines expose no cheap per-glyph box and the MATH table states none.`
            );
            notes.push(`Mapped ${mapped} codepoints; left ${missing} to MathJax; skipped ${zeroAdvance} with zero advance.`);
            notes.push(
                'Stretchy delimiter sizes were left to MathJax: this font does not own the assembly ' +
                '(delimiters omitted, ownsStretchyAssembly false).'
            );

            return {
                source: 'opentype-math',
                chars,
                // Deliberately absent — see the header note on stretchy assembly.
                // 刻意省略——见文件头关于伸缩拼装的说明。
                delimiters: undefined,
                constants: math ? math.constants : undefined,
                ownsStretchyAssembly: false,
                notes,
            };
        } catch (err) {
            // Never swallow silently: record what happened and hand back whatever was built.
            // 绝不静默吞错：记下发生了什么，并返回已构建的部分结果。
            const message = err instanceof Error ? err.message : String(err);
            notes.push(`TeX Gyre Termes Math adapter failed mid-build: ${message}`);
            const built = Object.keys(chars).length;
            if (built > 0) {
                notes.push(`Returning ${built} partially built glyph entries after the failure.`);
                return {
                    source: 'opentype-math',
                    chars,
                    delimiters: undefined,
                    ownsStretchyAssembly: false,
                    notes,
                };
            }
            return null;
        }
    },
};
