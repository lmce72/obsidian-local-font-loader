import { describe, expect, test } from 'bun:test';
import { readOpenTypeMathTable } from '../src/math-standards/opentype-math';

/** 各字段放不同哨兵值，防止错位读取悄悄通过；Distinct sentinels expose incorrect binary offsets. */
function mathFont(collection = false): ArrayBuffer {
    const binary = new ArrayBuffer(512);
    const view = new DataView(binary);
    const tag = (offset: number, text: string) => {
        for (let index = 0; index < text.length; index++) view.setUint8(offset + index, text.charCodeAt(index));
    };
    const base = collection ? 32 : 0;
    if (collection) {
        tag(0, 'ttcf');
        view.setUint32(4, 0x00010000);
        view.setUint32(8, 1);
        view.setUint32(12, base);
    }
    view.setUint32(base, 0x00010000);
    view.setUint16(base + 4, 2);
    tag(base + 12, 'head');
    view.setUint32(base + 20, 96);
    view.setUint32(base + 24, 54);
    tag(base + 28, 'MATH');
    view.setUint32(base + 36, 160);
    view.setUint32(base + 40, 304);
    view.setUint16(96 + 18, 1000);

    const math = 160;
    view.setUint16(math, 1);
    view.setUint16(math + 4, 10);
    view.setUint16(math + 6, 230);
    view.setUint16(math + 8, 240);
    const constants = math + 10;
    view.setUint16(constants, 80);
    view.setUint16(constants + 2, 60);
    view.setUint16(constants + 4, 1200);
    view.setUint16(constants + 6, 1400);
    for (let index = 0; index < 51; index++) view.setInt16(constants + 8 + index * 4, 101 + index);

    const variants = math + 240;
    view.setUint16(variants, 40);
    view.setUint16(variants + 2, 12);
    view.setUint16(variants + 6, 1);
    view.setUint16(variants + 10, 18);
    view.setUint16(variants + 12, 1);
    view.setUint16(variants + 14, 1);
    view.setUint16(variants + 16, 125);
    const construction = variants + 18;
    view.setUint16(construction, 8);
    view.setUint16(construction + 2, 1);
    view.setUint16(construction + 4, 200);
    view.setUint16(construction + 6, 1200);
    const assembly = construction + 8;
    view.setInt16(assembly, 10);
    view.setUint16(assembly + 4, 2);
    const parts = [[501, 10, 20, 1000, 0], [502, 30, 40, 1100, 1]];
    parts.forEach((part, index) => part.forEach((value, field) => view.setUint16(assembly + 6 + index * 10 + field * 2, value)));
    return binary;
}

describe('OpenType MATH binary reader', () => {
    test('reads every assembly part as a ten-byte GlyphPart record', () => {
        const parsed = readOpenTypeMathTable(mathFont());
        expect(parsed?.vertVariants['125'].variants).toEqual([{ glyphId: 200, advance: 1.2 }]);
        expect(parsed?.vertVariants['125'].assembly).toEqual({
            italicCorrection: 0.01,
            parts: [
                { glyphId: 501, startConnectorLength: 0.01, endConnectorLength: 0.02, fullAdvance: 1, isExtender: false },
                { glyphId: 502, startConnectorLength: 0.03, endConnectorLength: 0.04, fullAdvance: 1.1, isExtender: true },
            ],
        });
    });

    test('TTC table records are absolute offsets from the collection, not its member directory', () => {
        const standalone = readOpenTypeMathTable(mathFont());
        const collection = readOpenTypeMathTable(mathFont(true));
        expect(collection).not.toBeNull();
        expect(collection?.unitsPerEm).toBe(1000);
        expect(collection).toEqual(standalone);
    });

    test('reads fraction, overbar, underbar and radical constants from their actual record positions', () => {
        const parsed = readOpenTypeMathTable(mathFont());
        expect(parsed?.constants).toMatchObject({
            scriptPercentScaleDown: 0.8, scriptScriptPercentScaleDown: 0.6, axisHeight: 0.102,
            fractionRuleThickness: 0.135, overbarExtraAscender: 0.142,
            underbarExtraDescender: 0.145, radicalRuleThickness: 0.148,
        });
    });

    test('empty and truncated font headers return null', () => {
        for (const length of [0, 4, 11, 12]) expect(readOpenTypeMathTable(new ArrayBuffer(length))).toBeNull();
    });
});
