/**
 * Asana Math adapter — reads the font's own OpenType `MATH` table and glyph metrics.
 *
 * Asana Math 适配器：直接读取字体自带的 OpenType `MATH` 表与字形度量，不做任何测量。
 *
 * Asana Math (Apostolos Syropoulos, from the Asana/Palladio lineage) is an OpenType MATH font
 * with an unusually complete glyph-assembly story and a distinctive high math axis. Both facts
 * live in the font's own tables, so nothing here is guessed: the `MATH` table states the axis
 * height and rule thicknesses, and `hmtx`/`glyf`/`OS/2` state the per-glyph layout boxes.
 *
 * Asana Math（Asana/Palladio 谱系）自带非常完整的 glyph-assembly 数据，并且数学轴位置偏高；
 * 这些都由字体自身表格给出，因此本模块只做读取换算，不做测量。
 *
 * Stretchy delimiters stay MathJax's: this font is substituted into MathJax, which assembles
 * `\\underbrace`, `\\left(...\\right)` and extensible arrows from private-use pieces in its own
 * faces. Writing this font's target sizes into `delimiters` is exactly what corrupted brace
 * height and span before, so `delimiters` is left undefined and `ownsStretchyAssembly` is false.
 *
 * 拉伸定界符仍由 MathJax 自己的字形拼装，因此 `delimiters` 保持 undefined，避免覆盖目标尺寸。
 */

import type { AdapterContext, GlyphMetrics, MathFontAdapter, MathFontMetrics } from '../types';
import { matchByFamilyName } from '../types';
import { readOpenTypeMathTable } from '../opentype-math';

/** 本适配器认领的字体族名 / Family names this adapter claims. */
const ADAPTER_FAMILIES = ['Asana Math', 'Asana'];

/** 字体表在文件中的位置 / One table's slice of the font file. */
interface TableRef {
    offset: number;
    length: number;
}

/** 字形轮廓的垂直范围（设计单位）/ A glyph's design outline extents, in design units. */
interface OutlineExtents {
    yMin: number;
    yMax: number;
}

/** 专用区：MathJax 的拉伸拼装件所在，永不写入 / Private-use area owned by MathJax's assembly pieces. */
function isPrivateUse(code: number): boolean {
    return (
        (code >= 0xe000 && code <= 0xf8ff) ||
        (code >= 0xf0000 && code <= 0xffffd) ||
        (code >= 0x100000 && code <= 0x10fffd)
    );
}

/** 控制字符无墨迹、无布局意义 / Control characters carry no ink and no layout meaning. */
function isControl(code: number): boolean {
    return code < 0x20 || (code >= 0x7f && code <= 0x9f);
}

/**
 * 读取字体表目录（支持 ttc 集合，取第一个字体）。
 * Read the table directory; a collection (`.ttc`) contributes its first font, which is what a
 * family file hands us in practice.
 */
function readTableDirectory(dv: DataView): Map<string, TableRef> {
    const tables = new Map<string, TableRef>();
    if (dv.byteLength < 12) {
        return tables;
    }
    let base = 0;
    const headTag = String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3));
    if (headTag === 'ttcf') {
        if (dv.byteLength < 16) {
            return tables;
        }
        base = dv.getUint32(12);
    }
    if (base < 0 || base + 12 > dv.byteLength) {
        return tables;
    }
    const numTables = dv.getUint16(base + 4);
    for (let i = 0; i < numTables; i++) {
        const rec = base + 12 + i * 16;
        if (rec + 16 > dv.byteLength) {
            break;
        }
        const tag = String.fromCharCode(
            dv.getUint8(rec),
            dv.getUint8(rec + 1),
            dv.getUint8(rec + 2),
            dv.getUint8(rec + 3)
        );
        const offset = dv.getUint32(rec + 8);
        const length = dv.getUint32(rec + 12);
        // 表必须完整落在文件内才可信 / A table counts only when it lies wholly inside the file.
        if (offset <= dv.byteLength && length <= dv.byteLength - offset) {
            tables.set(tag, { offset, length });
        }
    }
    return tables;
}

/**
 * 解析 cmap format 4（BMP）。
 * Parse a cmap format 4 subtable (basic multilingual plane).
 */
function parseCmapFormat4(dv: DataView, off: number, into: Map<number, number>): void {
    const segCountX2 = dv.getUint16(off + 6);
    const segCount = segCountX2 >> 1;
    if (segCount <= 0 || segCount > 0x4000) {
        return;
    }
    const endBase = off + 14;
    const startBase = endBase + segCountX2 + 2;
    const deltaBase = startBase + segCountX2;
    const rangeBase = deltaBase + segCountX2;
    for (let i = 0; i < segCount; i++) {
        const end = dv.getUint16(endBase + i * 2);
        const start = dv.getUint16(startBase + i * 2);
        const delta = dv.getInt16(deltaBase + i * 2);
        const rangeOffset = dv.getUint16(rangeBase + i * 2);
        if (start > end) {
            continue;
        }
        // 单段上限：损坏的段不至于拖死循环 / Cap one segment so a corrupt range cannot loop forever.
        if (end - start > 0xffff) {
            continue;
        }
        for (let code = start; code <= end; code++) {
            let gid: number;
            if (rangeOffset === 0) {
                gid = (code + delta) & 0xffff;
            } else {
                const addr = rangeBase + i * 2 + rangeOffset + (code - start) * 2;
                gid = dv.getUint16(addr);
                if (gid !== 0) {
                    gid = (gid + delta) & 0xffff;
                }
            }
            if (gid !== 0) {
                into.set(code, gid);
            }
        }
    }
}

/**
 * 解析 cmap format 12（全 Unicode）。
 * Parse a cmap format 12 subtable (full Unicode range).
 */
function parseCmapFormat12(dv: DataView, off: number, into: Map<number, number>): void {
    const nGroups = dv.getUint32(off + 12);
    // 组数上限：防御损坏的计数 / Cap group count against a corrupt header.
    const groups = Math.min(nGroups, 0x20000);
    const groupsOff = off + 16;
    for (let i = 0; i < groups; i++) {
        const rec = groupsOff + i * 12;
        const start = dv.getUint32(rec);
        const end = dv.getUint32(rec + 4);
        const startGid = dv.getUint32(rec + 8);
        if (start > end || end - start > 0xffff) {
            continue;
        }
        for (let code = start; code <= end; code++) {
            const gid = startGid + (code - start);
            if (gid !== 0) {
                into.set(code, gid);
            }
        }
    }
}

/**
 * 建立码位 → glyph id 映射（合并所有可读的 Unicode 子表）。
 * Build the codepoint → glyph-id map, merging every readable Unicode subtable so coverage is
 * the union of what the font declares.
 */
function readCodepointMap(dv: DataView, ref: TableRef, notes: string[]): Map<number, number> {
    const map = new Map<number, number>();
    const base = ref.offset;
    const numSubtables = dv.getUint16(base + 2);
    let parsed = 0;
    for (let i = 0; i < numSubtables; i++) {
        const rec = base + 4 + i * 8;
        if (rec + 8 > base + ref.length) {
            break;
        }
        const platform = dv.getUint16(rec);
        const encoding = dv.getUint16(rec + 2);
        const subOff = base + dv.getUint32(rec + 4);
        if (subOff + 4 > dv.byteLength) {
            continue;
        }
        const format = dv.getUint16(subOff);
        try {
            if (format === 4) {
                parseCmapFormat4(dv, subOff, map);
                parsed++;
            } else if (format === 12 && (platform === 3 || platform === 0 || encoding === 10)) {
                parseCmapFormat12(dv, subOff, map);
                parsed++;
            }
        } catch (err) {
            // 坏子表跳过，继续下一个 / One broken subtable must not kill the rest.
            notes.push(`cmap subtable ${i} (format ${format}) could not be read; skipped.`);
            notes.push(`cmap read error: ${String(err)}`);
        }
    }
    if (parsed === 0) {
        notes.push('No readable Unicode cmap subtable (format 4 or 12); chars cannot be keyed by codepoint.');
    }
    return map;
}

/**
 * 读取每个字形的前进宽度（hmtx，设计单位）。
 * Read per-glyph advance widths from `hmtx`, in design units.
 */
function readAdvances(
    dv: DataView,
    ref: TableRef,
    numberOfHMetrics: number,
    numGlyphs: number
): number[] {
    const advances = new Array<number>(numGlyphs).fill(0);
    const metricCount = Math.max(1, Math.min(numberOfHMetrics, numGlyphs));
    for (let gid = 0; gid < numGlyphs; gid++) {
        // 超出 numberOfHMetrics 的字形沿用最后一个前进宽度 / Beyond the last full metric every
        // glyph shares that advance, per the spec.
        const slot = Math.min(gid, metricCount - 1);
        advances[gid] = dv.getUint16(ref.offset + slot * 4);
    }
    return advances;
}

/**
 * 读取每个字形轮廓的垂直范围（glyf 设计外包框）。
 *
 * Read per-glyph design outline extents from `glyf`/`loca`. OpenType's `hmtx` carries no
 * per-glyph vertical metrics at all, so the outline's design bbox is the font's own statement of
 * how far above and below the baseline a glyph reaches — the per-glyph design extent, not a
 * measured ink box. Empty glyphs (spaces) return null, meaning "no extent above or below".
 *
 * 整体读取失败时返回 null，调用方降级为字体级 ascender/descender。
 */
function readOutlineExtents(
    dv: DataView,
    locaRef: TableRef | undefined,
    glyfRef: TableRef | undefined,
    numGlyphs: number,
    longLoca: boolean,
    notes: string[]
): Array<OutlineExtents | null> | null {
    if (!locaRef || !glyfRef || numGlyphs <= 0) {
        // CFF 轮廓没有可安全读取的逐字形外包框 / CFF outlines give no safely readable per-glyph bbox.
        notes.push('No glyf/loca outlines (CFF or unreadable); per-glyph verticals fall back to font-wide ascender/descender.');
        return null;
    }
    try {
        const entrySize = longLoca ? 4 : 2;
        const need = (numGlyphs + 1) * entrySize;
        if (locaRef.length < need) {
            notes.push('loca table shorter than numGlyphs; per-glyph verticals fall back to font-wide ascender/descender.');
            return null;
        }
        const readLoca = (i: number): number =>
            longLoca ? dv.getUint32(locaRef.offset + i * 4) : dv.getUint16(locaRef.offset + i * 2) * 2;

        const out = new Array<OutlineExtents | null>(numGlyphs).fill(null);
        for (let gid = 0; gid < numGlyphs; gid++) {
            const start = readLoca(gid);
            const end = readLoca(gid + 1);
            // 零长度记录是空字形（例如空格）/ A zero-length record is an empty glyph (a space).
            if (end <= start) {
                out[gid] = null;
                continue;
            }
            const at = glyfRef.offset + start;
            if (start + 10 > glyfRef.length || at + 10 > dv.byteLength) {
                out[gid] = null;
                continue;
            }
            // 无论简单还是复合字形，头部都是 numberOfContours + xMin/yMin/xMax/yMax。
            // Simple and composite glyphs share the same 10-byte bbox header.
            out[gid] = {
                yMin: dv.getInt16(at + 4),
                yMax: dv.getInt16(at + 8),
            };
        }
        return out;
    } catch (err) {
        notes.push(`glyf/loca read failed (${String(err)}); per-glyph verticals fall back to font-wide ascender/descender.`);
        return null;
    }
}

/** 从 OS/2 与 hhea 读取字体级垂直度量（设计单位）。 */
function readFontVerticals(dv: DataView, tables: Map<string, TableRef>, notes: string[]): { ascent: number; descent: number } {
    let ascent = 0;
    let descent = 0;
    try {
        // OS/2.sTypoAscender / sTypoDescender：版式标准的字体级取值。
        const os2 = tables.get('OS/2');
        if (os2 && os2.length >= 72) {
            ascent = dv.getInt16(os2.offset + 68);
            descent = dv.getInt16(os2.offset + 70);
        }
    } catch (err) {
        notes.push(`OS/2 verticals unreadable (${String(err)}); trying hhea.`);
    }
    if (!(ascent > 0) || !(descent < 0)) {
        try {
            // hhea.ascender / hhea.descender：回退来源 / Fallback source.
            const hhea = tables.get('hhea');
            if (hhea && hhea.length >= 8) {
                ascent = dv.getInt16(hhea.offset + 4);
                descent = dv.getInt16(hhea.offset + 6);
            }
        } catch (err) {
            notes.push(`hhea verticals unreadable (${String(err)}).`);
        }
    }
    if (!(ascent > 0) || !(descent < 0)) {
        // 两个表都不可用：明说是猜测，不静默 / Both tables unusable: say the guess out loud.
        notes.push('No usable OS/2 or hhea vertical metrics; using a declared 0.8em / 0.2em em-box guess.');
        return { ascent: 800, descent: -200 };
    }
    return { ascent, descent };
}

/** 读取 maxp.numGlyphs。 */
function readNumGlyphs(dv: DataView, tables: Map<string, TableRef>, notes: string[]): number {
    try {
        const maxp = tables.get('maxp');
        if (maxp && maxp.length >= 6) {
            const n = dv.getUint16(maxp.offset + 4);
            if (n > 0) {
                return n;
            }
        }
    } catch (err) {
        notes.push(`maxp unreadable (${String(err)}).`);
    }
    notes.push('numGlyphs unavailable; only advance widths for glyph ids under 65535 can be trusted.');
    return 0;
}

/** 读取 head：unitsPerEm 与 loca 格式。 */
function readHead(dv: DataView, tables: Map<string, TableRef>, notes: string[]): { unitsPerEm: number; longLoca: boolean } {
    let unitsPerEm = 0;
    let longLoca = false;
    try {
        const head = tables.get('head');
        if (head && head.length >= 54) {
            unitsPerEm = dv.getUint16(head.offset + 18);
            longLoca = dv.getInt16(head.offset + 50) !== 0;
        }
    } catch (err) {
        notes.push(`head unreadable (${String(err)}).`);
    }
    return { unitsPerEm, longLoca };
}

export const asanaMathAdapter: MathFontAdapter = {
    id: 'asana-math',
    name: 'Asana Math',
    families: ADAPTER_FAMILIES,
    priority: 70,

    matches(familyName: string): boolean {
        return matchByFamilyName({ families: ADAPTER_FAMILIES }, familyName);
    },

    build(binary: ArrayBuffer, ctx: AdapterContext): MathFontMetrics | null {
        const notes: string[] = [];
        try {
            // 1. MATH 表：常量已在 em 单位 / The MATH table's values are already in em.
            const math = readOpenTypeMathTable(binary);
            if (!math) {
                // 无 MATH 表即放弃认领，交给后面的适配器 / No MATH table: decline the claim.
                return null;
            }

            const dv = new DataView(binary);
            const tables = readTableDirectory(dv);
            const headInfo = readHead(dv, tables, notes);
            const upm = math.unitsPerEm || headInfo.unitsPerEm || ctx.unitsPerEm || 1000;
            const toEm = (design: number): number => design / upm;

            // 2. 码位 → glyph id / Codepoint to glyph id.
            const cmapRef = tables.get('cmap');
            const codeToGid = cmapRef ? readCodepointMap(dv, cmapRef, notes) : new Map<number, number>();
            if (!cmapRef) {
                notes.push('No cmap table; chars cannot be keyed by codepoint.');
            }

            // 3. 字形数量与前进宽度 / Glyph count and advances.
            const numGlyphs = readNumGlyphs(dv, tables, notes);
            const hheaRef = tables.get('hhea');
            let numberOfHMetrics = numGlyphs;
            try {
                if (hheaRef && hheaRef.length >= 36) {
                    numberOfHMetrics = dv.getUint16(hheaRef.offset + 34);
                }
            } catch (err) {
                notes.push(`hhea.numberOfHMetrics unreadable (${String(err)}); assuming all glyphs carry a full metric record.`);
            }

            const hmtxRef = tables.get('hmtx');
            let advances: number[] = [];
            if (hmtxRef && numGlyphs > 0) {
                try {
                    advances = readAdvances(dv, hmtxRef, numberOfHMetrics, numGlyphs);
                } catch (err) {
                    notes.push(`hmtx read failed (${String(err)}); widths left to MathJax.`);
                }
            } else if (!hmtxRef) {
                notes.push('No hmtx table; widths left to MathJax.');
            }

            // 4. 逐字形垂直范围，失败则用字体级值 / Per-glyph verticals, else font-wide.
            const extents = readOutlineExtents(
                dv,
                tables.get('loca'),
                tables.get('glyf'),
                numGlyphs,
                headInfo.longLoca,
                notes
            );
            const fontVerticals = readFontVerticals(dv, tables, notes);
            const fontHeight = Math.max(0, toEm(fontVerticals.ascent));
            const fontDepth = Math.max(0, toEm(-fontVerticals.descent));

            // 5. 组装 chars：布局盒 [height, depth, width] / Build the layout-box map.
            const chars: Record<string, GlyphMetrics> = {};
            let built = 0;
            let skipped = 0;
            for (const [code, gid] of codeToGid) {
                if (isPrivateUse(code) || isControl(code)) {
                    continue;
                }
                const width = advances[gid];
                if (width === undefined || !(width > 0)) {
                    // 零前进宽度会压到邻字上，交给 MathJax 原值 / Zero advance would collapse the
                    // glyph onto its neighbour; keep MathJax's value instead.
                    skipped++;
                    continue;
                }
                const w = toEm(width);
                let h: number;
                let d: number;
                if (extents) {
                    const box = extents[gid];
                    if (box) {
                        // 轮廓设计范围即逐字形布局盒；负方向截到 0。
                        // The design extent is the per-glyph layout box; clamp the down side to 0.
                        h = Math.max(0, toEm(box.yMax));
                        d = Math.max(0, toEm(-box.yMin));
                    } else {
                        // 空字形（空格）：基线上下都为 0 / Empty glyph (a space): nothing above or below.
                        h = 0;
                        d = 0;
                    }
                } else {
                    // 无逐字形数据：字体级近似 / No per-glyph data: font-wide approximation.
                    h = fontHeight;
                    d = fontDepth;
                }
                chars[String(code)] = [h, d, w];
                built++;
            }

            if (built === 0) {
                notes.push('No glyph of the cmap coverage produced a usable layout box; MathJax metrics stay in place for chars.');
            }
            if (!extents) {
                notes.push('Per-glyph height/depth are the font-wide ascender/descender approximation (OpenType hmtx has no per-glyph verticals and outlines were unreadable).');
            }

            // 6. 装配信息只记入诊断：delimiters 一律不写。
            // Assembly data is diagnostics only — `delimiters` is never written here.
            const vertCount = Object.keys(math.vertVariants).length;
            const horizCount = Object.keys(math.horizVariants).length;
            let assemblyCount = 0;
            for (const key of Object.keys(math.vertVariants)) {
                if (math.vertVariants[key].assembly) {
                    assemblyCount++;
                }
            }
            for (const key of Object.keys(math.horizVariants)) {
                if (math.horizVariants[key].assembly) {
                    assemblyCount++;
                }
            }
            notes.push(
                `MATH table adopted (axis height ${math.constants.axisHeight ?? 'n/a'}em); ` +
                `${vertCount} vertical and ${horizCount} horizontal constructions, ${assemblyCount} with assembly recipes.`
            );
            notes.push('Stretchy delimiter target sizes were left to MathJax: this font does not own the assembly.');
            notes.push(`Built ${built} glyph layout boxes from font tables; skipped ${skipped} without a usable advance.`);

            return {
                source: 'opentype-math',
                chars,
                // 明确留空，理由见文件头 / Explicitly absent: see the file header.
                delimiters: undefined,
                constants: math.constants,
                ownsStretchyAssembly: false,
                notes,
            };
        } catch (err) {
            // 绝不向外抛：留一句诊断后放弃，让后续适配器接手。
            // Never throw out: record the failure and decline, so the next adapter still runs.
            notes.push(`Asana Math adapter failed and declined: ${String(err)}`);
            return null;
        }
    },
};
