/**
 * Euler / Neo Euler 数学字体适配器 / Math-font adapter for Euler / Neo Euler.
 *
 * 中文：
 *   Neo Euler（CTAN 包 euler-math，文件原名 Neo-Euler.otf、现名 Euler-Math.otf）是 Hermann
 *   Zapf 为 AMS 设计的 Euler 的 OpenType 复兴版。它的字形是直立的书法体（upright
 *   calligraphic），不是 Times 那种数学斜体，所以 MATH 表里的轴高（axis height）与斜体校正
 *   （italics correction）都是它自己的设计值，不能按 Times 系数学字体去推断。
 *   本适配器只读取字体自己的表（MATH / head / hhea / OS/2 / cmap / hmtx），绝不做墨迹测量；
 *   OpenType 的排版盒（layout box）= 字体行盒高度/深度 + 逐字宽度（advance），不是墨迹外框。
 *   拉伸定界符装配方（delimiters）刻意留空：MathJax 用自己的私有区零件拼括号与箭头，
 *   覆盖它的目标尺寸会破坏括号高度与跨度。
 *
 * EN:
 *   Neo Euler (CTAN package `euler-math`; the file was Neo-Euler.otf, now Euler-Math.otf) is the
 *   OpenType revival of Hermann Zapf's AMS Euler. Its shapes are upright-calligraphic rather than
 *   Times-like math italics, so the MATH table's axis height and italic corrections follow its own
 *   design and must not be inferred from Times-like math fonts. This adapter only reads the font's
 *   own tables (MATH / head / hhea / OS/2 / cmap / hmtx) and never measures ink; the OpenType
 *   layout box is (font line-band height, line-band depth, per-glyph advance), not an ink
 *   bounding box. `delimiters` is deliberately left undefined: MathJax assembles braces and arrows
 *   from its own private-use pieces, and overwriting its target sizes corrupts brace height and span.
 */

// 依赖仅限契约里的两个模块；因本文件在 adapters/ 子目录，路径写作 ../types 与 ../opentype-math。
// Only the two contract modules are imported; since this file lives under adapters/, the paths are
// spelled ../types and ../opentype-math.
import type { AdapterContext, GlyphMetrics, MathConstants, MathFontAdapter, MathFontMetrics } from '../types';
import { matchByFamilyName } from '../types';
import { readOpenTypeMathTable } from '../opentype-math';

/** 本适配器认领的家族名（大小写不敏感的精确匹配） / Family names claimed here (exact, case-insensitive). */
const EULER_FAMILIES = ['Euler Math', 'Neo Euler', 'Euler'];

/** cmap 收录上限：病态字体不能拖垮一次构建 / Cap on cmap entries so a pathological font cannot stall a build. */
const MAX_MAPPED_CODEPOINTS = 65536;

/** 行盒（高度/深度）的合理上限，单位 em；超过即视为表读坏了 / Sane layout-band ceiling in em — beyond it the tables were misread. */
const MAX_BAND_EM = 2;

/** 表目录项 / One table-directory record. */
interface TableRef {
    /** 文件绝对偏移（TTC 亦然） / Offset from the start of the file (also true inside a TTC). */
    offset: number;
    length: number;
}

/** head / hhea / OS/2 / maxp 里本适配器用到的字段，均为设计单位 / The font-wide fields we need, in design units. */
interface FontWide {
    unitsPerEm: number;
    typoAscender: number | null;
    typoDescender: number | null;
    hheaAscender: number | null;
    hheaDescender: number | null;
    numberOfHMetrics: number | null;
    numGlyphs: number | null;
}

/**
 * MathJax 的私有区装配件不属于本字体的度量范围。
 * Private-use codepoints are MathJax's own stretchy-assembly pieces — never size them.
 */
function isPrivateUse(code: number): boolean {
    return (code >= 0xe000 && code <= 0xf8ff)
        || (code >= 0xf0000 && code <= 0xffffd)
        || (code >= 0x100000 && code <= 0x10fffd);
}

/** 控制字符无墨，也没有可排版的盒 / Control characters have no ink and no meaningful layout box. */
function isControl(code: number): boolean {
    return code < 0x20 || (code >= 0x7f && code <= 0x9f);
}

/** 代理区不是标量值，映射它没有意义 / Surrogates are not scalar values; mapping them is meaningless. */
function isSurrogate(code: number): boolean {
    return code >= 0xd800 && code <= 0xdfff;
}

/**
 * 定位 sfnt 起点：普通字体为 0，TTC 取第一个字体的表目录。
 * Locate the sfnt base: 0 for a plain font, the first font's directory inside a TTC.
 */
function sfntBase(dv: DataView): number | null {
    try {
        if (dv.byteLength < 12) return null;
        const tag = String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3));
        if (tag === 'ttcf') {
            if (dv.byteLength < 16) return null;
            return dv.getUint32(12);
        }
        // 0x00010000 TrueType，'OTTO' CFF，'true'/'typ1' 旧式 / 0x00010000 TrueType, 'OTTO' CFF, 'true'/'typ1' legacy.
        const version = dv.getUint32(0);
        if (version === 0x00010000 || tag === 'OTTO' || tag === 'true' || tag === 'typ1') return 0;
        return null;
    } catch {
        // 头部读不出来就当作不是字体 / An unreadable header means "not a font" — decline upstream.
        return null;
    }
}

/**
 * 在表目录里找一张表；offset 为文件绝对偏移。
 * Find a table record; the returned offset is file-absolute (spec behaviour inside TTC too).
 */
function findTable(dv: DataView, base: number, tag: string): TableRef | null {
    try {
        if (base + 12 > dv.byteLength) return null;
        const numTables = dv.getUint16(base + 4);
        for (let i = 0; i < numTables; i++) {
            const rec = base + 12 + i * 16;
            if (rec + 16 > dv.byteLength) return null;
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
        // 目录损坏视作表缺失，绝不抛出 / A corrupt directory reads as "table absent"; never throw.
    }
    return null;
}

/**
 * 读取字体级度量：unitsPerEm、OS/2 sTypo 升降部、hhea 升降部与 hmtx 度量数、maxp 字形数。
 * Read font-wide metrics: unitsPerEm, OS/2 sTypo ascender/descender, hhea ascent/descent,
 * hmtx long-metric count and maxp glyph count. Everything stays in design units here.
 */
function readFontWide(binary: ArrayBuffer): FontWide | null {
    try {
        const dv = new DataView(binary);
        const base = sfntBase(dv);
        if (base === null) return null;

        const out: FontWide = {
            unitsPerEm: 1000,
            typoAscender: null,
            typoDescender: null,
            hheaAscender: null,
            hheaDescender: null,
            numberOfHMetrics: null,
            numGlyphs: null,
        };

        // head：unitsPerEm 在偏移 18 / unitsPerEm sits at offset 18.
        const head = findTable(dv, base, 'head');
        if (head && head.length >= 20 && head.offset + 20 <= binary.byteLength) {
            const upem = dv.getUint16(head.offset + 18);
            if (upem > 0) out.unitsPerEm = upem;
        }

        // OS/2：sTypoAscender(68) sTypoDescender(70)，版本 0 起即存在 / present since OS/2 version 0.
        const os2 = findTable(dv, base, 'OS/2');
        if (os2 && os2.length >= 72 && os2.offset + 72 <= binary.byteLength) {
            out.typoAscender = dv.getInt16(os2.offset + 68);
            out.typoDescender = dv.getInt16(os2.offset + 70);
        }

        // hhea：ascent(4) descent(6) numberOfHMetrics(34)。
        const hhea = findTable(dv, base, 'hhea');
        if (hhea && hhea.length >= 36 && hhea.offset + 36 <= binary.byteLength) {
            out.hheaAscender = dv.getInt16(hhea.offset + 4);
            out.hheaDescender = dv.getInt16(hhea.offset + 6);
            out.numberOfHMetrics = dv.getUint16(hhea.offset + 34);
        }

        // maxp：numGlyphs 在偏移 4 / numGlyphs sits at offset 4.
        const maxp = findTable(dv, base, 'maxp');
        if (maxp && maxp.length >= 6 && maxp.offset + 6 <= binary.byteLength) {
            out.numGlyphs = dv.getUint16(maxp.offset + 4);
        }

        return out;
    } catch {
        // 字体级表读坏：返回 null，让调用方决定是否弃权 / Unreadable font-wide tables: decline upstream.
        return null;
    }
}

/**
 * 解析 cmap 子表（格式 12 / 4 / 6 / 0）→ 码位到字形 id。
 * Parse one cmap subtable (format 12 / 4 / 6 / 0) into codepoint → glyph id.
 */
function parseCmapSubtable(dv: DataView, at: number, tableEnd: number): Map<number, number> | null {
    try {
        if (at + 4 > tableEnd) return null;
        const map = new Map<number, number>();
        const format = dv.getUint16(at);

        if (format === 12) {
            // format(2) reserved(2) length(4) language(4) numGroups(4) groups… / groups of 12 bytes.
            if (at + 16 > tableEnd) return null;
            const numGroups = dv.getUint32(at + 12);
            for (let g = 0; g < numGroups; g++) {
                const rec = at + 16 + g * 12;
                if (rec + 12 > tableEnd) break;
                const startChar = dv.getUint32(rec);
                const endChar = Math.min(dv.getUint32(rec + 4), 0x10ffff);
                const startGid = dv.getUint32(rec + 8);
                for (let code = startChar; code <= endChar; code++) {
                    if (map.size >= MAX_MAPPED_CODEPOINTS) return map.size > 0 ? map : null;
                    const gid = startGid + (code - startChar);
                    if (gid !== 0) map.set(code, gid);
                }
            }
        } else if (format === 4) {
            // format(2) length(2) language(2) segCountX2(2) searchRange(2) entrySelector(2) rangeShift(2)
            // endCode[segCount] reservedPad(2) startCode[segCount] idDelta[segCount] idRangeOffset[segCount]
            if (at + 14 > tableEnd) return null;
            const segCount = dv.getUint16(at + 6) >> 1;
            if (segCount < 1) return null;
            const endPos = at + 14;
            const startPos = endPos + segCount * 2 + 2;
            const deltaPos = startPos + segCount * 2;
            const rangePos = deltaPos + segCount * 2;
            if (rangePos + segCount * 2 > tableEnd) return null;
            for (let i = 0; i < segCount; i++) {
                const endCode = dv.getUint16(endPos + i * 2);
                const startCode = dv.getUint16(startPos + i * 2);
                if (startCode === 0xffff || startCode > endCode) continue;
                const idDelta = dv.getInt16(deltaPos + i * 2);
                const idRangeOffset = dv.getUint16(rangePos + i * 2);
                for (let code = startCode; code <= endCode; code++) {
                    if (map.size >= MAX_MAPPED_CODEPOINTS) return map.size > 0 ? map : null;
                    let gid = 0;
                    if (idRangeOffset === 0) {
                        gid = (code + idDelta) & 0xffff;
                    } else {
                        // glyphIdArray 入口：偏移自 idRangeOffset 本体起算 / offset is relative to the idRangeOffset cell.
                        const gPos = rangePos + i * 2 + idRangeOffset + (code - startCode) * 2;
                        if (gPos + 2 > tableEnd) continue;
                        gid = dv.getUint16(gPos);
                        if (gid !== 0) gid = (gid + idDelta) & 0xffff;
                    }
                    if (gid !== 0) map.set(code, gid);
                }
            }
        } else if (format === 6) {
            // format(2) length(2) language(2) firstCode(2) entryCount(2) glyphIdArray[entryCount]
            if (at + 10 > tableEnd) return null;
            const firstCode = dv.getUint16(at + 6);
            const entryCount = dv.getUint16(at + 8);
            for (let i = 0; i < entryCount; i++) {
                const rec = at + 10 + i * 2;
                if (rec + 2 > tableEnd) break;
                const gid = dv.getUint16(rec);
                if (gid !== 0) map.set(firstCode + i, gid);
            }
        } else if (format === 0) {
            // format(2) length(2) language(2) glyphIdArray[256]（单字节码位 / byte codepoints）
            for (let code = 0; code < 256; code++) {
                const rec = at + 6 + code;
                if (rec + 1 > tableEnd) break;
                const gid = dv.getUint8(rec);
                if (gid !== 0) map.set(code, gid);
            }
        } else {
            // 其余格式不在此适配器范围内 / Any other format is out of scope here.
            return null;
        }

        return map.size > 0 ? map : null;
    } catch {
        // 子表损坏视作不可用 / A corrupt subtable is simply unusable.
        return null;
    }
}

/**
 * 读 cmap：在各编码记录里挑最合适的一张子表（全 Unicode 优于 BMP）。
 * Read `cmap`, picking the best subtable (full Unicode preferred over BMP-only).
 */
function readCmap(binary: ArrayBuffer): Map<number, number> | null {
    try {
        const dv = new DataView(binary);
        const base = sfntBase(dv);
        if (base === null) return null;
        const cmap = findTable(dv, base, 'cmap');
        if (!cmap || cmap.length < 4) return null;
        const tableEnd = Math.min(cmap.offset + cmap.length, binary.byteLength);

        const numTables = dv.getUint16(cmap.offset + 2);
        const candidates: Array<{ score: number; offset: number }> = [];
        for (let i = 0; i < numTables; i++) {
            const rec = cmap.offset + 4 + i * 8;
            if (rec + 8 > tableEnd) break;
            const platform = dv.getUint16(rec);
            const encoding = dv.getUint16(rec + 2);
            const subOff = cmap.offset + dv.getUint32(rec + 4);
            if (subOff + 4 > tableEnd) continue;
            const format = dv.getUint16(subOff);
            let score = 0;
            if (format === 12) score = 4;
            else if (format === 4) score = 3;
            else if (format === 6) score = 2;
            else if (format === 0) score = 1;
            if (score === 0) continue;
            if (platform === 3 && encoding === 10) score += 3;
            else if (platform === 0) score += 2;
            else if (platform === 3 && encoding === 1) score += 1;
            candidates.push({ score, offset: subOff });
        }
        candidates.sort((a, b) => b.score - a.score);
        for (const candidate of candidates) {
            const map = parseCmapSubtable(dv, candidate.offset, tableEnd);
            if (map) return map;
        }
        return null;
    } catch {
        // cmap 读不出来就没有码位可填 / Without cmap there is nothing to key `chars` by.
        return null;
    }
}

/**
 * 读 hmtx 的逐字 advance（宽度）；后续短项字形共享最后一个长项的 advance。
 * Read per-glyph advance widths from `hmtx`; trailing short-metric glyphs share the last long metric.
 */
function readAdvances(binary: ArrayBuffer, numberOfHMetrics: number, numGlyphs: number | null): Uint16Array | null {
    try {
        if (numberOfHMetrics < 1) return null;
        const dv = new DataView(binary);
        const base = sfntBase(dv);
        if (base === null) return null;
        const hmtx = findTable(dv, base, 'hmtx');
        if (!hmtx) return null;

        const count = numGlyphs !== null && numGlyphs > 0 ? numGlyphs : numberOfHMetrics;
        const need = numberOfHMetrics * 4 + Math.max(0, count - numberOfHMetrics) * 2;
        if (hmtx.offset + Math.min(need, hmtx.length) > binary.byteLength) return null;

        const out = new Uint16Array(count);
        for (let gid = 0; gid < count; gid++) {
            const metric = gid < numberOfHMetrics ? gid : numberOfHMetrics - 1;
            const rec = hmtx.offset + metric * 4;
            if (rec + 2 > tableEndOf(hmtx, binary.byteLength)) return out.length > 0 ? out : null;
            out[gid] = dv.getUint16(rec);
        }
        return out;
    } catch {
        // hmtx 读坏即弃权，宽度宁缺毋猜 / Unreadable hmtx: decline — a guessed width is worse than none.
        return null;
    }
}

/** 表的结束位置（含文件截断） / Where a table ends, clipped to the file. */
function tableEndOf(table: TableRef, fileLength: number): number {
    return Math.min(table.offset + table.length, fileLength);
}

export const eulerMathAdapter: MathFontAdapter = {
    id: 'euler-math',
    name: 'Euler / Neo Euler',
    families: EULER_FAMILIES,
    priority: 120,

    matches(familyName: string): boolean {
        return matchByFamilyName({ families: EULER_FAMILIES }, familyName);
    },

    build(binary: ArrayBuffer, ctx: AdapterContext): MathFontMetrics | null {
        const notes: string[] = [];
        // 便于异常兜底时给出部分结果 / Held outside the try so a partial result can still ship with a note.
        const chars: Record<string, GlyphMetrics> = {};
        let constants: MathConstants | undefined;
        let source: MathFontMetrics['source'] = 'opentype-math';

        try {
            // 1. MATH 表：常量与斜体校正（后者结构体无处安放，只进 notes）。
            //    MATH table: constants plus italics corrections (the struct has no slot for the latter,
            //    so they are only reported in notes).
            const math = readOpenTypeMathTable(binary);
            const wide = readFontWide(binary);
            if (!math && !wide) {
                // 既无 MATH 也读不出字体级表 → 弃权，交给测量兜底。
                // Neither MATH nor font-wide tables: decline so the measurement fallback can try.
                return null;
            }

            // 2. 单位：MATH 常量已按它自己的 unitsPerEm 换算，chars 必须用同一个。
            //    Units: the MATH constants were em-converted with its upem — chars must match it.
            const unitsPerEm = (math ? math.unitsPerEm : 0) || (wide ? wide.unitsPerEm : 0) || ctx.unitsPerEm || 1000;

            // 3. 行盒：OS/2 sTypo* 优先，hhea 其次；这是 OpenType 的排版盒，不是墨迹外框。
            //    Line band: OS/2 sTypo* first, hhea next — the OpenType layout box, not an ink box.
            let ascDesign = wide ? wide.typoAscender : null;
            let descDesign = wide ? wide.typoDescender : null;
            let bandSource = 'OS/2 sTypoAscender/sTypoDescender';
            const typoUsable = typeof ascDesign === 'number' && ascDesign > 0
                && typeof descDesign === 'number' && descDesign < 0;
            if (!typoUsable) {
                ascDesign = wide ? wide.hheaAscender : null;
                descDesign = wide ? wide.hheaDescender : null;
                bandSource = 'hhea ascent/descent';
            }
            const height = typeof ascDesign === 'number' ? ascDesign / unitsPerEm : NaN;
            const depth = typeof descDesign === 'number' ? Math.abs(descDesign) / unitsPerEm : NaN;
            if (!(height > 0) || !(depth >= 0) || height > MAX_BAND_EM || depth > MAX_BAND_EM) {
                // 升降部缺失或荒谬：再猜就会污染 MathJax 表，弃权。
                // Missing or absurd line band: guessing further would poison MathJax's table — decline.
                return null;
            }

            // 4. 逐字度量：宽来自 hmtx，高/深用行盒（OpenType 不提供逐字纵向排版盒）。
            //    Per glyph: width from hmtx; height/depth from the line band (OpenType states no
            //    per-glyph vertical layout box — MATH's MathGlyphInfo has italics, top accent,
            //    extended shapes and math kern, none of which are vertical extents).
            const numberOfHMetrics = wide ? wide.numberOfHMetrics : null;
            const numGlyphs = wide ? wide.numGlyphs : null;
            if (numberOfHMetrics === null) {
                return null;
            }
            const advances = readAdvances(binary, numberOfHMetrics, numGlyphs);
            const cmap = readCmap(binary);
            if (!advances || !cmap) {
                // 没有 cmap 就无法按码位填表，没有 hmtx 就没有宽度 → 弃权。
                // Without cmap there is nothing to key by; without hmtx there is no width — decline.
                return null;
            }

            let skippedFiltered = 0;
            let skippedZeroAdvance = 0;
            const gidToCode = new Map<number, number>();
            for (const [code, gid] of cmap) {
                if (isPrivateUse(code) || isControl(code) || isSurrogate(code)) {
                    // 私有区属于 MathJax 的装配件；控制字符/代理区没有排版意义。
                    // PUA belongs to MathJax's assembly pieces; control/surrogate have no layout meaning.
                    skippedFiltered++;
                    continue;
                }
                const advance = gid >= 0 && gid < advances.length ? advances[gid] : 0;
                if (!(advance > 0)) {
                    // 零宽（多为组合符）会让字形塌缩到邻居身上 / Zero advance (mostly combining marks) collapses onto neighbours.
                    skippedZeroAdvance++;
                    continue;
                }
                chars[String(code)] = [height, depth, advance / unitsPerEm];
                if (!gidToCode.has(gid)) gidToCode.set(gid, code);
            }
            if (Object.keys(chars).length === 0) {
                return null;
            }

            // 5. 诊断注记：把 Euler 的设计怪癖写清楚 / Notes: call out this design's quirks.
            notes.push(
                "Euler / Neo Euler — the OpenType revival of Zapf's AMS Euler (CTAN euler-math; Neo-Euler.otf renamed Euler-Math.otf).",
            );
            notes.push(
                'Design: upright-calligraphic letterforms rather than Times-like math italics; every number here is the font\'s own, never inferred from Times-like conventions.',
            );
            notes.push(
                `Layout band (approximation, applied per glyph): height ${height.toFixed(4)}em / depth ${depth.toFixed(4)}em from ${bandSource}; ` +
                'width is each glyph\'s real advance from hmtx. OpenType MATH carries no per-glyph vertical extents, so the band over-reserves for small glyphs — expected for Euler, whose calligraphic shapes are unusually uneven.',
            );

            if (math) {
                constants = math.constants;
                source = 'opentype-math';
                const axis = math.constants.axisHeight;
                if (typeof axis === 'number') {
                    notes.push(
                        `MATH table read: axisHeight ${axis.toFixed(4)}em — non-standard versus Times-like math fonts; used exactly as the font states it (Euler's fraction bars and minus signs sit on its own axis).`,
                    );
                } else {
                    notes.push('MATH table read, but its axis height was not present; left undefined for MathJax.');
                }
                const italics = Object.keys(math.italicCorrection).length;
                if (italics > 0) {
                    // 斜体校正：Euler 的字母基本是直立书法体，校正值是它自己的设计，无处写入 metrics，仅作诊断。
                    // Italics corrections: Euler's alphabet is largely upright calligraphic, so these are
                    // design-specific; the metrics struct has no slot for them, so they are reported here only.
                    let maxId = '';
                    let maxVal = -Infinity;
                    for (const [gid, value] of Object.entries(math.italicCorrection)) {
                        if (value > maxVal) {
                            maxVal = value;
                            maxId = gid;
                        }
                    }
                    const code = gidToCode.get(Number(maxId));
                    const where = code !== undefined ? `U+${code.toString(16).toUpperCase()}` : `glyph ${maxId}`;
                    notes.push(
                        `Italics corrections: ${italics} entries, largest ${maxVal.toFixed(4)}em at ${where} — non-standard versus Times-like fonts, following Euler's upright-calligraphic design.`,
                    );
                } else {
                    notes.push('Italics corrections: none in the MATH table.');
                }
                notes.push('Stretchy assemblies were readable but not exported: `delimiters` stays undefined so MathJax keeps its own brace and arrow target sizes.');
            } else {
                constants = undefined;
                source = 'reference';
                notes.push('No readable MATH table in this file: constants omitted; layout boxes come from head/hhea/OS/2/cmap/hmtx only.');
            }

            notes.push(
                `Mapped ${Object.keys(chars).length} codepoints; kept MathJax metrics for ${skippedFiltered} private-use/control/surrogate and ${skippedZeroAdvance} zero-advance codepoints.`,
            );
            notes.push('Stretchy delimiter sizes were left to MathJax: this font does not own the assembly.');

            return {
                source,
                chars,
                // 刻意留空，见上文注记 / Deliberately absent — see the notes above.
                delimiters: undefined,
                constants,
                ownsStretchyAssembly: false,
                notes,
            };
        } catch (err) {
            // 绝不静默吞错：能产出多少算多少，错误写进 notes / Never swallow silently: ship partial
            // metrics when we have any, with the error recorded in notes.
            if (Object.keys(chars).length > 0) {
                notes.push(`Euler adapter hit an unexpected error and returned partial metrics: ${String(err)}`);
                return {
                    source,
                    chars,
                    delimiters: undefined,
                    constants,
                    ownsStretchyAssembly: false,
                    notes,
                };
            }
            // 什么都没读出来 → 弃权，让下一个适配器或测量兜底接手（这是约定的下降路径，不是吞错）。
            // Nothing usable read → decline, so the next adapter or the measurement fallback takes over
            // (this is the documented decline path, not a swallowed error).
            return null;
        }
    },
};
