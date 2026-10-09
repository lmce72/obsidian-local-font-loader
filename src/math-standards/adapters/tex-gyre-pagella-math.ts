/**
 * TeX Gyre Pagella Math — OpenType `MATH` 标准适配器 / OpenType `MATH` standard adapter.
 *
 * 中文：
 *   TeX Gyre Pagella Math 是 GUST e-Foundry 以 URW Nimbus Palladio（Palatino 风格）为底本制作的
 *   OpenType 数学字体，自带完整的 `MATH` 表。本模块只读取字体自身的元数据（MATH 常量、cmap、
 *   hmtx 前进宽度、head/hhea/OS-2 字体级度量），绝不使用 canvas 测量。Pagella 的数学轴高度与
 *   分数线厚度与 Termes 不同，所有数值一律来自该字体自己的表，不在适配器之间共享任何常量。
 *
 * English:
 *   TeX Gyre Pagella Math is the Palatino-flavoured OpenType math face (URW Nimbus Palladio
 *   derived) from GUST e-Foundry, and it ships a full `MATH` table. Everything here is read from
 *   the font's own metadata — the MATH constants, `cmap`, `hmtx` advances and the font-wide
 *   `head`/`hhea`/`OS/2` values — and nothing is ever measured on a canvas. Pagella's axis height
 *   and rule thickness differ from Termes', so no number is shared between the TeX Gyre adapters.
 *
 * 关键约定 / Key conventions:
 *   - `delimiters` 保持 undefined：MathJax 的可伸缩定界符（括号、花括号、长箭头）由它自己的
 *     字体拼装，本模块不接管（ownsStretchyAssembly: false）。用本字体的数字去覆盖目标尺寸
 *     正是此前花括号高度与跨度损坏的原因。
 *     `delimiters` stays undefined: MathJax assembles stretchy delimiters from its own faces, and
 *     overwriting its target sizes with this font's numbers is what corrupted brace height before.
 *   - `chars` 是排版盒 [height, depth, width]（基线上高度、基线下深度、前进宽度），不是墨迹
 *     包围盒；轮廓极值（glyf/CFF 包围盒）刻意不用于高度/深度。
 *     `chars` entries are layout boxes ([height, depth, width] = ascent, descent, advance), never
 *     ink bounding boxes; outline extremes are deliberately not used for height/depth.
 */

// 仅依赖契约的两个模块（位于上级目录）/ Only the two contract modules (one directory up).
import type { AdapterContext, GlyphMetrics, MathFontAdapter, MathFontMetrics } from '../types';
import { matchByFamilyName } from '../types';
import { readOpenTypeMathTable } from '../opentype-math';

/** 表目录中的一条记录 / One table-directory record. */
interface TableRecord {
    offset: number;
    length: number;
}

/** 字体级垂直度量（单位 em）/ Font-wide vertical extents, in em. */
interface FontWideVerticals {
    ascent: number;
    descent: number;
}

/**
 * 在 sfnt 表目录中查找表 / Locate a table in the sfnt table directory.
 *
 * 目录内记录的 offset 是相对整个文件起点的，故返回值可直接用于文件级 DataView。
 * Directory offsets are file-absolute, so the result can be used against a file-level DataView.
 */
function findTableAt(dv: DataView, base: number, tag: string): TableRecord | null {
    try {
        if (base + 12 > dv.byteLength) return null;
        const numTables = dv.getUint16(base + 4);
        for (let i = 0; i < numTables; i++) {
            const rec = base + 12 + i * 16;
            if (rec + 16 > dv.byteLength) break;
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
        // 目录不可读即视为表缺失 / An unreadable directory simply means "table absent".
    }
    return null;
}

/**
 * 字体数据起点 / Base offset of the font data.
 *
 * ttc 集合取第一个字体，与 MATH 读取器一致；普通字体从 0 开始。
 * A `.ttc` collection takes its first font, matching the MATH reader; a plain font starts at 0.
 */
function fontBase(dv: DataView): number {
    try {
        if (dv.byteLength < 16) return 0;
        const tag = String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3));
        if (tag === 'ttcf') {
            const numFonts = dv.getUint32(8);
            return numFonts >= 1 ? dv.getUint32(12) : 0;
        }
    } catch {
        // 回退到 0 / Fall back to 0.
    }
    return 0;
}

/**
 * 解析 units-per-em / Resolve units-per-em.
 *
 * 优先 head，其次调用方与 MATH 表已读到的值。Falls back to the caller's and the MATH table's
 * values when `head` is unreadable.
 */
function resolveUnitsPerEm(dv: DataView, base: number, fromMath: number, fromCtx?: number): number {
    try {
        const head = findTableAt(dv, base, 'head');
        if (head && head.offset + 20 <= dv.byteLength) {
            const upem = dv.getUint16(head.offset + 18);
            if (upem > 0) return upem;
        }
    } catch {
        // 交给下面的回退链 / Hand over to the fallback chain below.
    }
    if (fromMath > 0) return fromMath;
    if (fromCtx !== undefined && fromCtx > 0) return fromCtx;
    return 1000;
}

/**
 * 读取字体级垂直度量 / Read the font-wide vertical extents.
 *
 * 取值顺序 OS/2 sTypoAscender/sTypoDescender → hhea ascender/descender → usWin* → 内置缺省。
 * Preference: OS/2 sTypo* → hhea → usWin* → built-in defaults. 这些是排版盒的字体级缺省，
 * 不是轮廓墨迹范围。/ These are font-wide layout defaults, not outline ink extents.
 */
function readFontWideVerticals(
    dv: DataView,
    base: number,
    toEm: (n: number) => number,
    notes: string[],
): FontWideVerticals {
    let ascentDesign = 0;
    let descentDesign = 0; // 基线以下的正值量 / Positive magnitude below the baseline.
    let source = '';

    try {
        const os2 = findTableAt(dv, base, 'OS/2');
        if (os2 && os2.offset + 72 <= dv.byteLength) {
            const typoAsc = dv.getInt16(os2.offset + 68);
            const typoDesc = dv.getInt16(os2.offset + 70);
            if (typoAsc > 0) {
                ascentDesign = typoAsc;
                source = 'OS/2 sTypoAscender';
            }
            if (typoDesc < 0) {
                descentDesign = -typoDesc;
                if (!source) source = 'OS/2 sTypoDescender';
            }
        }
    } catch {
        // OS/2 缺失时走 hhea / Fall through to hhea when OS/2 is unusable.
    }

    try {
        const hhea = findTableAt(dv, base, 'hhea');
        if (hhea && hhea.offset + 8 <= dv.byteLength) {
            const hAsc = dv.getInt16(hhea.offset + 4);
            const hDesc = dv.getInt16(hhea.offset + 6);
            if (ascentDesign <= 0 && hAsc > 0) {
                ascentDesign = hAsc;
                source = 'hhea ascender';
            }
            if (descentDesign <= 0 && hDesc < 0) {
                descentDesign = -hDesc;
                if (!source) source = 'hhea descender';
            }
        }
    } catch {
        // hhea 缺失时走 usWin* / Fall through to usWin* when hhea is unusable.
    }

    if (ascentDesign <= 0 || descentDesign <= 0) {
        try {
            const os2 = findTableAt(dv, base, 'OS/2');
            if (os2 && os2.offset + 78 <= dv.byteLength) {
                const winAsc = dv.getUint16(os2.offset + 74);
                const winDesc = dv.getUint16(os2.offset + 76);
                if (ascentDesign <= 0 && winAsc > 0) {
                    ascentDesign = winAsc;
                    source = 'OS/2 usWinAscent';
                }
                if (descentDesign <= 0 && winDesc > 0) {
                    descentDesign = winDesc;
                    if (!source) source = 'OS/2 usWinDescent';
                }
            }
        } catch {
            // 最后回退到内置缺省 / Last resort: the built-in defaults below.
        }
    }

    if (ascentDesign <= 0 || descentDesign <= 0) {
        notes.push('Font-wide ascender/descender unreadable (head, hhea and OS/2 all unusable); using 0.75/0.25 em defaults.');
        return { ascent: 0.75, descent: 0.25 };
    }

    notes.push(`Font-wide layout verticals taken from ${source} (approximation: the font offers no per-glyph layout verticals).`);
    return { ascent: toEm(ascentDesign), descent: toEm(descentDesign) };
}

/**
 * 建立字形前进宽度查询 / Build a glyph-advance lookup from `hmtx`.
 *
 * 返回 null 表示 hmtx/hhea 不可读，此时宁可不产出 chars 也不编造宽度。
 * Returns null when `hmtx`/`hhea` is unreadable — an empty `chars` beats invented widths.
 */
function readAdvanceLookup(
    dv: DataView,
    base: number,
    toEm: (n: number) => number,
    notes: string[],
): ((gid: number) => number) | null {
    try {
        const hhea = findTableAt(dv, base, 'hhea');
        const hmtx = findTableAt(dv, base, 'hmtx');
        if (!hhea || !hmtx || hhea.offset + 36 > dv.byteLength) {
            notes.push('hhea/hmtx absent: advance widths were not adopted.');
            return null;
        }
        let numberOfHMetrics = dv.getUint16(hhea.offset + 34);
        if (numberOfHMetrics === 0) {
            numberOfHMetrics = Math.max(1, Math.floor(hmtx.length / 4));
        }
        if (numberOfHMetrics <= 0 || hmtx.offset + numberOfHMetrics * 4 > dv.byteLength) {
            notes.push('hmtx shorter than hhea.numberOfHMetrics: advance widths were not adopted.');
            return null;
        }
        // 末条 longHorMetric 的前进宽度覆盖其余字形 / The last long metric covers the remaining glyphs.
        const lastAdvance = dv.getUint16(hmtx.offset + (numberOfHMetrics - 1) * 4);
        return (gid: number): number => {
            if (!Number.isFinite(gid) || gid < 0) return toEm(lastAdvance);
            const metric = gid < numberOfHMetrics ? gid : numberOfHMetrics - 1;
            return toEm(dv.getUint16(hmtx.offset + metric * 4));
        };
    } catch {
        notes.push('hmtx read failed: advance widths were not adopted.');
        return null;
    }
}

/**
 * cmap format 4（BMP 段映射）/ cmap format 4 (BMP segment mapping).
 */
function readCmapFormat4(dv: DataView, sub: number, out: Map<number, number>): boolean {
    try {
        if (sub + 14 > dv.byteLength) return false;
        const segCountX2 = dv.getUint16(sub + 6);
        const segCount = segCountX2 >> 1;
        if (segCount === 0 || segCountX2 === 0) return false;
        const endBase = sub + 14;
        const startBase = endBase + segCountX2 + 2;
        const deltaBase = startBase + segCountX2;
        const rangeBase = deltaBase + segCountX2;
        if (rangeBase + segCountX2 > dv.byteLength) return false;

        for (let i = 0; i < segCount; i++) {
            const end = dv.getUint16(endBase + i * 2);
            const start = dv.getUint16(startBase + i * 2);
            const delta = dv.getInt16(deltaBase + i * 2);
            const rangeOffset = dv.getUint16(rangeBase + i * 2);
            if (start > end) continue; // 非法段直接跳过 / Illegal segment: skip.
            for (let cp = start; cp <= end; cp++) {
                if (cp === 0xffff) continue; // 哨兵段 / Sentinel segment.
                let gid: number;
                if (rangeOffset === 0) {
                    gid = (cp + delta) & 0xffff;
                } else {
                    // 经 idRangeOffset 间接索引 glyphIdArray / Indirect index into glyphIdArray.
                    const at = rangeBase + i * 2 + rangeOffset + (cp - start) * 2;
                    if (at + 2 > dv.byteLength) break;
                    gid = dv.getUint16(at);
                    if (gid !== 0) gid = (gid + delta) & 0xffff;
                }
                if (gid !== 0) out.set(cp, gid);
            }
        }
        return out.size > 0;
    } catch {
        return false;
    }
}

/**
 * cmap format 12/13（平面全量分组）/ cmap format 12/13 (full-plane group mapping).
 *
 * format 12 为一段一码位连续映射，format 13 为整组映射同一字形。
 * Format 12 maps a group consecutively; format 13 maps the whole group to one glyph.
 */
function readCmapFormat12or13(dv: DataView, sub: number, out: Map<number, number>, oneGlyph: boolean): boolean {
    try {
        if (sub + 16 > dv.byteLength) return false;
        const numGroups = dv.getUint32(sub + 12);
        const groupsBase = sub + 16;
        const maxCp = 0x10ffff;
        for (let i = 0; i < numGroups; i++) {
            const rec = groupsBase + i * 12;
            if (rec + 12 > dv.byteLength) break;
            const start = dv.getUint32(rec);
            const end = dv.getUint32(rec + 4);
            const startGid = dv.getUint32(rec + 8);
            if (start > end || start > maxCp) continue;
            const last = Math.min(end, maxCp);
            for (let cp = start; cp <= last; cp++) {
                const gid = oneGlyph ? startGid : startGid + (cp - start);
                if (gid !== 0) out.set(cp, gid);
            }
        }
        return out.size > 0;
    } catch {
        return false;
    }
}

/**
 * 读取 cmap：码位 → 字形 id / Read `cmap`: codepoint → glyph id.
 *
 * 优先覆盖平面 1（数学字母数字区）的 Unicode 子表。/ Prefer Unicode subtables that cover plane 1
 * (the math alphanumerics), falling back to BMP-only subtables.
 */
function readCmap(dv: DataView, base: number, notes: string[]): Map<number, number> {
    const out = new Map<number, number>();
    try {
        const cmap = findTableAt(dv, base, 'cmap');
        if (!cmap || cmap.offset + 4 > dv.byteLength) {
            notes.push('cmap absent: no per-codepoint glyphs were adopted.');
            return out;
        }
        const cmapOff = cmap.offset;
        const numTables = dv.getUint16(cmapOff + 2);
        let bestOff = -1;
        let bestScore = -1;
        let bestFormat = -1;

        for (let i = 0; i < numTables; i++) {
            const rec = cmapOff + 4 + i * 8;
            if (rec + 8 > dv.byteLength) break;
            const platform = dv.getUint16(rec);
            const encoding = dv.getUint16(rec + 2);
            const sub = cmapOff + dv.getUint32(rec + 4);
            if (sub + 4 > dv.byteLength) continue;
            const format = dv.getUint16(sub);
            let score = -1;
            if ((platform === 3 && encoding === 10) || (platform === 0 && (encoding === 4 || encoding === 6))) {
                // Windows 全量 Unicode / 平面 1 的 Unicode 子表
                score = format === 12 ? 400 : format === 13 ? 350 : format === 4 ? 200 : 100;
            } else if (platform === 0) {
                score = format === 12 ? 300 : format === 13 ? 250 : format === 4 ? 150 : 50;
            } else if (platform === 3 && encoding === 1) {
                score = format === 4 ? 100 : 50;
            }
            if (score > bestScore) {
                bestScore = score;
                bestOff = sub;
                bestFormat = format;
            }
        }

        if (bestOff < 0) {
            notes.push('No usable cmap subtable (Unicode or Windows BMP); nothing was adopted.');
            return out;
        }

        let ok = false;
        if (bestFormat === 4) {
            ok = readCmapFormat4(dv, bestOff, out);
        } else if (bestFormat === 12) {
            ok = readCmapFormat12or13(dv, bestOff, out, false);
        } else if (bestFormat === 13) {
            ok = readCmapFormat12or13(dv, bestOff, out, true);
        }
        if (!ok) {
            notes.push(`cmap subtable format ${bestFormat} could not be read; nothing was adopted.`);
            return out;
        }
        if (bestFormat === 4) {
            // format 4 只覆盖 BMP，数学字母数字区在平面 1 / format 4 is BMP-only; math alphanumerics live in plane 1.
            notes.push('cmap format 4 covers the BMP only; plane-1 math alphanumerics keep MathJax metrics.');
        }
    } catch {
        notes.push('cmap read failed; nothing was adopted.');
    }
    return out;
}

/**
 * 是否值得写入 chars / Whether a codepoint may be written into `chars`.
 *
 * 控制字符无排版意义；私用区是 MathJax 自己的拼装字形，永不覆盖。
 * Controls carry no layout meaning; private-use holds MathJax's own assembly pieces and must never
 * be overwritten.
 */
function isAdoptableCodepoint(cp: number): boolean {
    if (!Number.isFinite(cp) || cp < 0x20 || cp > 0x10ffff) return false;
    if (cp >= 0x7f && cp <= 0x9f) return false;
    if (cp >= 0xd800 && cp <= 0xdfff) return false; // 代理区 / surrogates
    if (cp >= 0xe000 && cp <= 0xf8ff) return false; // 私用区 / BMP private use
    if (cp >= 0xf0000 && cp <= 0xffffd) return false;
    if (cp >= 0x100000 && cp <= 0x10fffd) return false;
    return true;
}

/**
 * TeX Gyre Pagella Math 的适配器 / The TeX Gyre Pagella Math adapter.
 *
 * build() 只做「读表 → 换算成 em」的映射；任何读不了的结构都降级并在 notes 中说明，绝不抛异常。
 * `build()` only maps table data into em; any unreadable structure degrades gracefully with a note
 * in `metrics.notes`, and nothing is ever thrown.
 */
export const texGyrePagellaMathAdapter: MathFontAdapter = {
    id: 'tex-gyre-pagella-math',
    name: 'TeX Gyre Pagella Math',
    families: ['TeX Gyre Pagella Math', 'TeX Gyre Pagella'],
    priority: 50,

    /** 按家族名精确匹配（忽略大小写）/ Claim the family by exact name, case-insensitively. */
    matches(familyName: string): boolean {
        return matchByFamilyName(texGyrePagellaMathAdapter, familyName);
    },

    build(binary: ArrayBuffer, ctx: AdapterContext): MathFontMetrics | null {
        const notes: string[] = [];

        // 1) MATH 表是设计常量的唯一来源 / The MATH table is the only source of design constants.
        let math: ReturnType<typeof readOpenTypeMathTable>;
        try {
            math = readOpenTypeMathTable(binary);
        } catch (err) {
            // readOpenTypeMathTable 内部已吞掉解析异常；这里兜住的是调用层面的意外。
            // The helper swallows parse errors internally; this guards the call itself.
            notes.push(`MATH table read threw: ${err instanceof Error ? err.message : String(err)}`);
            return null;
        }
        if (!math) {
            // 没有 MATH 表就不是这条路的职责，交还给测量回退。/ Not this standard's job: decline so
            // a lower-priority adapter or the measurement fallback can try.
            return null;
        }

        // 2) 后续任何结构读失败都只降级，不抛出 / Every later read degrades instead of throwing.
        const chars: Record<string, GlyphMetrics> = {};
        try {
            const dv = new DataView(binary);
            const base = fontBase(dv);
            const upem = resolveUnitsPerEm(dv, base, math.unitsPerEm, ctx.unitsPerEm);
            const toEm = (design: number): number => design / upem;

            // 垂直盒：字体级 ascender/descender（排版缺省，不是墨迹盒）。
            // Vertical box: font-wide ascender/descender (layout defaults, not an ink box).
            const verticals = readFontWideVerticals(dv, base, toEm, notes);

            // 前进宽度来自 hmtx / Advance widths come from `hmtx`.
            const advanceOf = readAdvanceLookup(dv, base, toEm, notes);
            if (advanceOf) {
                const cmap = readCmap(dv, base, notes);
                let adopted = 0;
                for (const [cp, gid] of cmap) {
                    if (!isAdoptableCodepoint(cp)) continue;
                    const width = advanceOf(gid);
                    if (!Number.isFinite(width) || width < 0) continue;
                    chars[String(cp)] = [verticals.ascent, verticals.descent, width];
                    adopted++;
                }
                if (adopted > 0) {
                    notes.push(
                        `Adopted ${adopted} glyphs from cmap/hmtx; height/depth are the font-wide layout box (${verticals.ascent.toFixed(4)}/${verticals.descent.toFixed(4)} em).`,
                    );
                    notes.push(
                        'Per-glyph vertical extents are approximated with the font-wide ascender/descender: MATH MathGlyphInfo carries no per-glyph layout verticals, and outline bounding boxes are not a layout box.',
                    );
                }
            }
        } catch (err) {
            // 读到一半失败：保留 MATH 常量，chars 保持已产出的部分 / Keep the MATH constants and any
            // chars already produced; say what was lost.
            notes.push(`Partial metrics only: ${err instanceof Error ? err.message : String(err)}`);
        }

        notes.push('Constants (axis height, rule thickness, script scaling) are this font\'s own MATH values, not shared with TeX Gyre Termes Math.');
        notes.push('Stretchy delimiter sizes were left to MathJax: this font does not own the assembly.');

        return {
            source: 'opentype-math',
            chars,
            // 刻意省略：见文件头约定 / Deliberately absent: see the header conventions.
            delimiters: undefined,
            constants: math.constants,
            ownsStretchyAssembly: false,
            notes,
        };
    },
};
