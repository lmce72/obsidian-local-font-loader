/**
 * Libertinus Math —— OpenType MATH 字体适配模块 / OpenType `MATH` adapter for Libertinus Math.
 *
 * Libertinus Math is the LibreBodoni/Libertine-derived OpenType math face behind many unicode-math
 * templates. It ships a real `MATH` table, so its constants (axis height, rule thickness, script
 * scaling) are read from the font, never measured. / Libertinus Math 是源自
 * LibreBodoni/Libertine 的 OpenType 数学字体，是许多 unicode-math 模板的默认观感；它带有完整的
 * MATH 表，因此轴高、分数线粗细、脚本缩放等常量一律从字体元数据读取，绝不测量。
 *
 * Claims two family names so a user typing "Libertinus" still lands here — and then gets a clean
 * decline when the file is the plain text face with no `MATH` table (the measurement fallback
 * handles that). / 声明两个字族名，使用户输入 "Libertinus" 也能命中；若文件其实是不含 MATH 表的
 * 纯文本字体，则干净地返回 null 交给测量兜底适配器。
 *
 * Deliberate omissions. / 刻意的省略：
 *  - `delimiters` stays undefined and `ownsStretchyAssembly` stays false: MathJax assembles
 *    braces, extensible arrows and `\underbrace` from private-use pieces in its own faces, so
 *    overwriting its target sizes corrupts brace height and span. / 不写 `delimiters`：花括号、
 *    可伸缩箭头与 `\underbrace` 由 MathJax 自带私有区部件拼装，覆盖其目标尺寸会破坏花括号的
 *    高度与跨度。
 *  - No canvas measuring anywhere: only font metadata. / 全程不使用 canvas 测量，只读字体元数据。
 *
 * Per-glyph verticals. / 逐字形纵向范围：
 *  - TrueType `glyf`+`loca` carry per-glyph bounding boxes — used when present.
 *    / TrueType 的 glyf+loca 带逐字形包围盒，存在时优先使用。
 *  - CFF outlines (the format Libertinus Math actually ships as) expose no cheap per-glyph box, so
 *    the font-wide OS/2 sTypoAscender/sTypoDescender (else hhea ascent/descent) stand in for every
 *    glyph, and that approximation is recorded in `notes`. / CFF 轮廓（Libertinus Math 的实际发布
 *    格式）没有廉价的逐字形包围盒，故退化为整字体的 OS/2 sTypoAscender/sTypoDescender（缺省时用
 *    hhea）作为每个字形的纵向范围，并把该近似写入 `notes`。
 *
 * The italics correction this font exposes is famously generous; it is summarized into `notes`
 * because the plugin's italic override interacts with it. / 本字体的斜体校正量偏大，这里汇总进
 * `notes`，因为插件的斜体覆盖逻辑会与之相互作用。
 *
 * This module imports only `types` and `opentype-math`. / 本模块仅依赖 types 与 opentype-math。
 */

import type { AdapterContext, GlyphMetrics, MathFontAdapter, MathFontMetrics } from '../types';
import { matchByFamilyName } from '../types';
import { readOpenTypeMathTable } from '../opentype-math';

/** Family names this adapter claims. / 本适配器声明的字族名。 */
const CLAIMED_FAMILIES: string[] = ['Libertinus Math', 'Libertinus'];

/** Location of one table inside the font file. / 某张表在字体文件中的位置。 */
interface TableRef {
    offset: number;
    length: number;
}

/** Vertical extents of one glyph, in em. / 单字形纵向范围（em）。 */
interface VerticalBox {
    height: number;
    depth: number;
}

/** Exception text for diagnostics, never thrown onward. / 用于诊断的异常文本，绝不继续抛出。 */
function errorText(err: unknown): string {
    if (err instanceof Error && err.message) {
        return err.message;
    }
    return String(err);
}

/** Control characters carry no ink. / 控制字符没有字面。 */
function isControlCode(code: number): boolean {
    return code < 0x20 || (code >= 0x7f && code <= 0x9f);
}

/**
 * Private-use areas hold MathJax's own stretchy assembly pieces — never size them here.
 * / 私有区存放的是 MathJax 自己的伸缩拼装部件，绝不在这里给它们定尺寸。
 */
function isPrivateUseCode(code: number): boolean {
    return (
        (code >= 0xe000 && code <= 0xf8ff) ||
        (code >= 0xf0000 && code <= 0xffffd) ||
        (code >= 0x100000 && code <= 0x10fffd)
    );
}

/** Surrogates and noncharacters are not drawable codepoints. / 代理项与非字符不是可绘制码位。 */
function isNonDrawingCode(code: number): boolean {
    return (code >= 0xd800 && code <= 0xdfff) || code === 0xfffe || code === 0xffff;
}

/** True when the codepoint must keep MathJax's own metrics. / 该码位应保留 MathJax 自带度量。 */
function skipCode(code: number): boolean {
    return isControlCode(code) || isPrivateUseCode(code) || isNonDrawingCode(code);
}

/** Offset of the first font's table directory: 0 for a plain font, else the TTC's first entry. */
function fontDirectoryBase(dv: DataView): number {
    try {
        if (dv.byteLength < 12) {
            return 0;
        }
        const tag = String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3));
        if (tag === 'ttcf') {
            const numFonts = dv.getUint32(8);
            if (numFonts < 1) {
                return 0;
            }
            return dv.getUint32(12);
        }
        return 0;
    } catch {
        return 0;
    }
}

/**
 * Minimal OpenType table reader for the width and vertical data the `MATH` table does not carry.
 * / MATH 表不含字宽与字形纵向范围，这里做最小化的 OpenType 表读取。
 *
 * Every parse is defensive: unreadable structures are reported through `problems` and degrade to
 * "keep MathJax's numbers", never throw. / 所有解析都防御式进行：读不通的结构写入 `problems`
 * 并降级为「保留 MathJax 的数字」，绝不抛出。
 */
class OpenTypeReader {
    private readonly dv: DataView;
    private readonly dir: DataView;

    /** unitsPerEm from `head`, or 1000 when unreadable. / head 的 unitsPerEm，读不到时为 1000。 */
    readonly unitsPerEm: number;
    /** Glyph count from `maxp`, or 0 when unreadable. / maxp 的字形数，读不到时为 0。 */
    readonly numGlyphs: number;

    /** Parse problems to surface in `metrics.notes`. / 需写入 metrics.notes 的解析问题。 */
    readonly problems: string[] = [];

    private readonly headRef: TableRef | null;
    private readonly hheaRef: TableRef | null;
    private readonly hmtxRef: TableRef | null;
    private readonly os2Ref: TableRef | null;
    private readonly cmapRef: TableRef | null;
    private readonly glyfRef: TableRef | null;
    private readonly locaRef: TableRef | null;

    constructor(binary: ArrayBuffer) {
        this.dv = new DataView(binary);
        const base = fontDirectoryBase(this.dv);
        this.dir = new DataView(binary, base);

        this.headRef = this.findTable('head');
        this.hheaRef = this.findTable('hhea');
        const maxpRef = this.findTable('maxp');
        this.hmtxRef = this.findTable('hmtx');
        this.os2Ref = this.findTable('OS/2');
        this.cmapRef = this.findTable('cmap');
        this.glyfRef = this.findTable('glyf');
        this.locaRef = this.findTable('loca');

        this.unitsPerEm = this.readUnitsPerEm();
        this.numGlyphs = this.readNumGlyphs(maxpRef);
    }

    /** Find a table record; null means absent, which is not an error. / 查表记录；null 表示不存在，不算错误。 */
    private findTable(tag: string): TableRef | null {
        try {
            const numTables = this.dir.getUint16(4);
            for (let i = 0; i < numTables; i++) {
                const rec = 12 + i * 16;
                const t = String.fromCharCode(
                    this.dir.getUint8(rec),
                    this.dir.getUint8(rec + 1),
                    this.dir.getUint8(rec + 2),
                    this.dir.getUint8(rec + 3),
                );
                if (t === tag) {
                    return { offset: this.dir.getUint32(rec + 8), length: this.dir.getUint32(rec + 12) };
                }
            }
        } catch (err) {
            this.problems.push(`Table directory unreadable while looking up '${tag}' (${errorText(err)}).`);
        }
        return null;
    }

    private readUnitsPerEm(): number {
        try {
            if (this.headRef && this.headRef.length >= 20) {
                const upem = this.dv.getUint16(this.headRef.offset + 18);
                if (upem > 0) {
                    return upem;
                }
            }
        } catch (err) {
            this.problems.push(`head.unitsPerEm unreadable (${errorText(err)}); assuming 1000.`);
        }
        return 1000;
    }

    private readNumGlyphs(maxpRef: TableRef | null): number {
        try {
            if (maxpRef && maxpRef.length >= 6) {
                return this.dv.getUint16(maxpRef.offset + 4);
            }
        } catch (err) {
            this.problems.push(`maxp.numGlyphs unreadable (${errorText(err)}).`);
        }
        return 0;
    }

    /**
     * Codepoint -> glyph id, merged from every usable cmap subtable (format 12 preferred).
     * / 码位 -> 字形 id，合并自所有可用 cmap 子表（优先 format 12）。
     */
    readCmap(): Map<number, number> {
        const out = new Map<number, number>();
        if (!this.cmapRef) {
            this.problems.push('cmap table absent; per-glyph metrics left to MathJax.');
            return out;
        }
        try {
            const cmapStart = this.cmapRef.offset;
            const numTables = this.dv.getUint16(cmapStart + 2);
            interface Sub { offset: number; score: number; }
            const subs: Sub[] = [];
            for (let i = 0; i < numTables; i++) {
                const rec = cmapStart + 4 + i * 8;
                if (rec + 8 > this.dv.byteLength) {
                    break;
                }
                const subOffset = cmapStart + this.dv.getUint32(rec + 4);
                if (subOffset + 2 > this.dv.byteLength) {
                    continue;
                }
                const format = this.dv.getUint16(subOffset);
                // Preference: full-Unicode format 12 beats BMP format 4 beats format 6.
                // 优先级：全 Unicode 的 format 12 > BMP 的 format 4 > format 6。
                if (format === 12) {
                    subs.push({ offset: subOffset, score: 3 });
                } else if (format === 4) {
                    subs.push({ offset: subOffset, score: 2 });
                } else if (format === 6) {
                    subs.push({ offset: subOffset, score: 1 });
                }
            }
            subs.sort((a, b) => b.score - a.score);
            for (const sub of subs) {
                const got =
                    sub.score === 3 ? this.readCmap12(sub.offset) : sub.score === 2 ? this.readCmap4(sub.offset) : this.readCmap6(sub.offset);
                for (const [code, gid] of got) {
                    if (!out.has(code)) {
                        out.set(code, gid);
                    }
                }
            }
            if (out.size === 0) {
                this.problems.push('cmap present but no usable subtable (format 4/6/12).');
            }
        } catch (err) {
            this.problems.push(`cmap parse failed part-way (${errorText(err)}); using what was read.`);
        }
        return out;
    }

    /** cmap format 4 (BMP segments). / cmap format 4（BMP 分段）。 */
    private readCmap4(at: number): Map<number, number> {
        const map = new Map<number, number>();
        const length = this.dv.getUint16(at + 2);
        const hardEnd = this.dv.byteLength;
        const segCountX2 = this.dv.getUint16(at + 6);
        const segCount = segCountX2 >> 1;
        if (segCount === 0 || segCountX2 > 0xfffe) {
            return map;
        }
        const endCodes = at + 14;
        const startCodes = endCodes + segCountX2 + 2;
        const deltas = startCodes + segCountX2;
        const rangeOffsets = deltas + segCountX2;
        for (let i = 0; i < segCount; i++) {
            const endCode = this.dv.getUint16(endCodes + i * 2);
            const startCode = this.dv.getUint16(startCodes + i * 2);
            const delta = this.dv.getInt16(deltas + i * 2);
            const rangeOffset = this.dv.getUint16(rangeOffsets + i * 2);
            if (startCode > endCode || endCode - startCode > 0xffff) {
                continue;
            }
            for (let code = startCode; code <= endCode; code++) {
                if (code === 0xffff) {
                    continue;
                }
                let gid: number;
                if (rangeOffset === 0) {
                    gid = (code + delta) & 0xffff;
                } else {
                    const gidAddr = rangeOffsets + i * 2 + rangeOffset + (code - startCode) * 2;
                    if (gidAddr + 2 > hardEnd || gidAddr + 2 > at + length) {
                        continue;
                    }
                    gid = this.dv.getUint16(gidAddr);
                    if (gid !== 0) {
                        gid = (gid + delta) & 0xffff;
                    }
                }
                if (gid !== 0) {
                    map.set(code, gid);
                }
            }
        }
        return map;
    }

    /** cmap format 6 (trimmed table). / cmap format 6（裁剪表）。 */
    private readCmap6(at: number): Map<number, number> {
        const map = new Map<number, number>();
        const first = this.dv.getUint16(at + 6);
        const count = this.dv.getUint16(at + 8);
        if (count === 0 || count > 0x10000) {
            return map;
        }
        for (let i = 0; i < count; i++) {
            const addr = at + 10 + i * 2;
            if (addr + 2 > this.dv.byteLength) {
                break;
            }
            const gid = this.dv.getUint16(addr);
            if (gid !== 0) {
                map.set(first + i, gid);
            }
        }
        return map;
    }

    /** cmap format 12 (full-Unicode groups). / cmap format 12（全 Unicode 分组）。 */
    private readCmap12(at: number): Map<number, number> {
        const map = new Map<number, number>();
        const numGroups = this.dv.getUint32(at + 12);
        if (numGroups === 0 || numGroups > 0x10000) {
            return map;
        }
        for (let i = 0; i < numGroups; i++) {
            const rec = at + 16 + i * 12;
            if (rec + 12 > this.dv.byteLength) {
                break;
            }
            const start = this.dv.getUint32(rec);
            const end = this.dv.getUint32(rec + 4);
            const startGid = this.dv.getUint32(rec + 8);
            if (end < start || end > 0x10ffff || end - start > 0xffff) {
                continue;
            }
            for (let code = start; code <= end; code++) {
                const gid = startGid + (code - start);
                if (gid !== 0) {
                    map.set(code, gid);
                }
            }
        }
        return map;
    }

    /**
     * Advance widths in design units, indexed by glyph id (hmtx repeats the last advance past
     * numberOfHMetrics). / 以设计单位表示的推进宽度，按字形 id 索引（超过 numberOfHMetrics 后沿用
     * 最后一个宽度，hmtx 规定如此）。
     */
    readAdvanceWidths(): Uint16Array {
        try {
            if (!this.hmtxRef || !this.hheaRef || this.numGlyphs <= 0) {
                this.problems.push('hmtx/hhea/maxp missing; advance widths unavailable.');
                return new Uint16Array(0);
            }
            const numberOfHMetrics = Math.max(1, this.dv.getUint16(this.hheaRef.offset + 34));
            const widths = new Uint16Array(this.numGlyphs);
            for (let gid = 0; gid < this.numGlyphs; gid++) {
                const rec = gid < numberOfHMetrics ? gid : numberOfHMetrics - 1;
                widths[gid] = this.dv.getUint16(this.hmtxRef.offset + rec * 4);
            }
            return widths;
        } catch (err) {
            this.problems.push(`hmtx read failed (${errorText(err)}); advance widths unavailable.`);
            return new Uint16Array(0);
        }
    }

    /**
     * Per-glyph vertical extents from TrueType `glyf` bounding boxes, in em; null when the font
     * has no glyf/loca (CFF outlines). / 从 TrueType glyf 包围盒读取逐字形纵向范围（em）；字体
     * 没有 glyf/loca（CFF 轮廓）时返回 null。
     */
    readGlyphVerticals(): Map<number, VerticalBox> | null {
        try {
            if (!this.glyfRef || !this.locaRef || !this.headRef || this.numGlyphs <= 0) {
                return null;
            }
            const indexToLocFormat = this.dv.getInt16(this.headRef.offset + 50);
            const entrySize = indexToLocFormat === 0 ? 2 : 4;
            const locaNeed = this.locaRef.offset + (this.numGlyphs + 1) * entrySize;
            if (locaNeed > this.dv.byteLength) {
                this.problems.push('loca table truncated; falling back to font-wide verticals.');
                return null;
            }
            const upem = this.unitsPerEm || 1000;
            const map = new Map<number, VerticalBox>();
            for (let gid = 0; gid < this.numGlyphs; gid++) {
                let start: number;
                let end: number;
                if (indexToLocFormat === 0) {
                    start = this.dv.getUint16(this.locaRef.offset + gid * 2) * 2;
                    end = this.dv.getUint16(this.locaRef.offset + (gid + 1) * 2) * 2;
                } else {
                    start = this.dv.getUint32(this.locaRef.offset + gid * 4);
                    end = this.dv.getUint32(this.locaRef.offset + (gid + 1) * 4);
                }
                if (end <= start) {
                    // Empty glyph (e.g. space): zero height and depth. / 空字形（如空格）：高深为 0。
                    map.set(gid, { height: 0, depth: 0 });
                    continue;
                }
                if (start + 10 > this.dv.byteLength) {
                    continue;
                }
                // Glyph header: numberOfContours(i16), xMin, yMin, xMax, yMax.
                // 字形头：numberOfContours(i16)、xMin、yMin、xMax、yMax。
                const yMin = this.dv.getInt16(this.glyfRef.offset + start + 4);
                const yMax = this.dv.getInt16(this.glyfRef.offset + start + 8);
                map.set(gid, {
                    height: Math.max(0, yMax) / upem,
                    depth: Math.max(0, -yMin) / upem,
                });
            }
            return map;
        } catch (err) {
            this.problems.push(`glyf/loca read failed (${errorText(err)}); falling back to font-wide verticals.`);
            return null;
        }
    }

    /**
     * Font-wide ascent/descent in em: OS/2 sTypo* first, hhea second. / 整字体的上升/下降部（em）：
     * 优先 OS/2 sTypo*，其次 hhea。
     */
    readFontWideVerticals(): VerticalBox | null {
        try {
            const upem = this.unitsPerEm || 1000;
            if (this.os2Ref && this.os2Ref.length >= 74) {
                const asc = this.dv.getInt16(this.os2Ref.offset + 68);
                const desc = this.dv.getInt16(this.os2Ref.offset + 70);
                if (asc > 0 || desc < 0) {
                    return { height: Math.max(0, asc) / upem, depth: Math.max(0, -desc) / upem };
                }
            }
            if (this.hheaRef) {
                const asc = this.dv.getInt16(this.hheaRef.offset + 4);
                const desc = this.dv.getInt16(this.hheaRef.offset + 6);
                return { height: Math.max(0, asc) / upem, depth: Math.max(0, -desc) / upem };
            }
        } catch (err) {
            this.problems.push(`OS/2 and hhea verticals unreadable (${errorText(err)}).`);
        }
        return null;
    }
}

/**
 * Summarize the font's italics correction into diagnostics. / 将字体的斜体校正量汇总进诊断信息。
 *
 * Libertinus Math's correction is generous, which interacts with the plugin's italic override, so
 * the numbers are surfaced rather than applied silently. / Libertinus Math 的校正量偏大，会与插件的
 * 斜体覆盖逻辑相互作用，因此把数字暴露出来而不是静默使用。
 */
function summarizeItalicCorrection(italicCorrection: Record<string, number>, notes: string[]): void {
    const values = Object.values(italicCorrection);
    if (values.length === 0) {
        notes.push('MATH table carries no italics-correction coverage.');
        return;
    }
    let max = 0;
    let sum = 0;
    for (const v of values) {
        sum += v;
        if (v > max) {
            max = v;
        }
    }
    const mean = sum / values.length;
    notes.push(
        `Libertinus Math states a generous italic correction (${values.length} glyphs; max ${max.toFixed(4)} em, mean ${mean.toFixed(4)} em). ` +
            `The plugin's italic override interacts with these values — prefer the font's own correction over synthetic slanting.`,
    );
}

/**
 * Build the per-glyph layout boxes: height above baseline, depth below, advance width — all in em.
 * / 构建逐字形布局盒：基线以上的高度、基线以下的深度、推进宽度，单位均为 em。
 */
function buildChars(reader: OpenTypeReader, notes: string[]): Record<string, GlyphMetrics> {
    const chars: Record<string, GlyphMetrics> = {};
    const cmap = reader.readCmap();
    if (cmap.size === 0) {
        return chars;
    }
    const upem = reader.unitsPerEm || 1000;
    const advances = reader.readAdvanceWidths();
    const perGlyph = reader.readGlyphVerticals();
    // Only ask for the font-wide box when per-glyph verticals are unavailable.
    // 只有在逐字形纵向范围不可用时才退回整字体盒子。
    const wide = perGlyph ? null : reader.readFontWideVerticals();

    let kept = 0;
    let skippedNonDrawing = 0;
    let skippedZeroWidth = 0;
    let skippedNoVertical = 0;

    for (const [code, gid] of cmap) {
        if (skipCode(code)) {
            skippedNonDrawing++;
            continue;
        }
        const width = (gid >= 0 && gid < advances.length ? advances[gid] : 0) / upem;
        if (!(width > 0)) {
            // Zero advance would collapse the glyph onto its neighbour; keep MathJax's numbers.
            // 推进宽度为 0 会让字形与邻字重叠；保留 MathJax 的数字。
            skippedZeroWidth++;
            continue;
        }
        let box: VerticalBox | undefined = perGlyph ? perGlyph.get(gid) : (wide ?? undefined);
        if (!box) {
            skippedNoVertical++;
            continue;
        }
        chars[String(code)] = [box.height, box.depth, width];
        kept++;
    }

    notes.push(
        `Read ${kept} glyphs from cmap+hmtx; kept MathJax metrics for ${skippedNonDrawing} non-drawing codepoints and ` +
            `${skippedZeroWidth} zero-advance glyphs${skippedNoVertical > 0 ? ` and ${skippedNoVertical} glyphs without vertical extents` : ''}.`,
    );
    if (perGlyph) {
        notes.push('Per-glyph verticals come from glyf bounding boxes.');
    } else if (wide) {
        notes.push(
            'No per-glyph verticals (CFF outlines): font-wide OS/2 sTypoAscender/sTypoDescender (or hhea) stand in for every glyph — heights and depths are approximate.',
        );
    } else {
        notes.push('No vertical extents could be read; per-glyph metrics left entirely to MathJax.');
    }
    return chars;
}

export const libertinusMathAdapter: MathFontAdapter = {
    id: 'libertinus-math',
    name: 'Libertinus Math',
    families: CLAIMED_FAMILIES,
    priority: 60,
    matches(familyName: string): boolean {
        return matchByFamilyName({ families: CLAIMED_FAMILIES }, familyName);
    },
    build(binary: ArrayBuffer, ctx: AdapterContext): MathFontMetrics | null {
        const notes: string[] = [];
        // No MATH table means a plain text Libertinus (or a broken file): decline so the measurement
        // fallback can try. That is the designed hand-off, not an error. / 没有 MATH 表说明这是纯
        // 文本 Libertinus（或损坏文件），按契约返回 null 交给测量兜底；这是设计好的交接而非错误。
        const math = readOpenTypeMathTable(binary);
        if (!math) {
            return null;
        }

        try {
            const reader = new OpenTypeReader(binary);
            const upem = math.unitsPerEm > 0 ? math.unitsPerEm : reader.unitsPerEm;

            if (ctx.unitsPerEm && ctx.unitsPerEm !== upem) {
                notes.push(`Caller reported unitsPerEm=${ctx.unitsPerEm}, font says ${upem}; using the font's value.`);
            }

            const chars = buildChars(reader, notes);
            summarizeItalicCorrection(math.italicCorrection, notes);
            notes.push('Stretchy delimiter sizes were left to MathJax: this font does not own the assembly.');
            for (const problem of reader.problems) {
                notes.push(problem);
            }

            return {
                source: 'opentype-math',
                chars,
                // Deliberately absent: braces and arrows are assembled from MathJax's own pieces, so
                // their target sizes must stay MathJax's. / 刻意省略：花括号与箭头由 MathJax 自带
                // 部件拼装，其目标尺寸必须保留为 MathJax 的值。
                delimiters: undefined,
                constants: math.constants,
                ownsStretchyAssembly: false,
                notes,
            };
        } catch (err) {
            // Never throw out of build(): ship what was read and record the failure in notes, so an
            // empty `chars` simply leaves MathJax's entries untouched. / 绝不从 build() 抛出：把已
            // 读到的内容交出去并把失败写进 notes，chars 为空时 MathJax 的条目原样保留。
            notes.push(`Libertinus Math metrics could not be assembled (${errorText(err)}); MathJax metrics kept.`);
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
