import { describe, expect, test } from 'bun:test';
import { DEFAULT_SETTINGS } from '../src/constants';
import { isRecord, normalizeSettings, parseFontFamilyMetadata } from '../src/settings-validation';

describe('persisted settings validation', () => {
    test('invalid and empty input creates independent defaults without mutating the shared defaults', () => {
        for (const raw of [null, undefined, [], false, 'invalid', 1]) {
            expect(normalizeSettings(raw)).toEqual(DEFAULT_SETTINGS);
        }
        const first = normalizeSettings({});
        const second = normalizeSettings({});
        first.presets[0].fonts.math = 'Changed';
        first.presets[0].targetDevices.push('new-device');
        first.deviceNameMap.new = 'New';
        expect(second).toEqual(DEFAULT_SETTINGS);
        expect(DEFAULT_SETTINGS.presets[0].fonts.math).toBe('');
    });

    test('legacy top-level fonts migrate without discarding valid device presets', () => {
        const legacy = { fonts: { math: 'Legacy Math' }, latinFontEnabled: true, latinFontScope: { numbers: false } };
        const result = normalizeSettings(legacy);
        expect(result.presets[0].fonts.math).toBe('Legacy Math');
        expect(result.presets[0].latinFontEnabled).toBe(true);
        expect(result.presets[0].latinFontScope).toEqual({ letters: true, numbers: false, punctuation: true, symbols: true });
        const custom = { id: 'custom', name: 'Reading', targetDevices: ['tablet'], fonts: { text: 'Body' } };
        const migrated = normalizeSettings({ ...legacy, presets: [custom] });
        expect(migrated.presets.map(item => item.id)).toEqual(['default-preset', 'custom']);
        expect(migrated.presets[1].fonts.text).toBe('Body');
        expect(custom.fonts).toEqual({ text: 'Body' });
    });

    test('malformed nested values cannot crash preset selection and prototype keys are removed', () => {
        const raw: unknown = JSON.parse('{"presets":[null,{}, {"id":"one","targetDevices":"oops","fonts":7},{"id":"one","fonts":{}}],"deviceNameMap":{"__proto__":"bad","constructor":"bad","ok":"Phone"},"deviceAliases":{"x":12},"autoLoadOnStartup":"false","fontSourceDir":"../../escape"}');
        const result = normalizeSettings(raw);
        expect(result.presets.map(item => item.id)).toEqual(['default-preset', 'one']);
        expect(result.presets[1].targetDevices).toEqual([]);
        expect(result.presets[1].fonts.math).toBe('');
        expect(result.deviceNameMap).toEqual({ ok: 'Phone' });
        expect(result.deviceAliases).toEqual({});
        expect(result.autoLoadOnStartup).toBe(true);
        expect(result.fontSourceDir).toBe(DEFAULT_SETTINGS.fontSourceDir);
        expect(Object.getPrototypeOf(result.deviceNameMap)).toBe(Object.prototype);
        expect(isRecord(Object.create({ inherited: true }))).toBe(false);
    });

    test('valid settings retain device history, font files, assignments and optional flags', () => {
        const raw = {
            ...DEFAULT_SETTINGS,
            fontSourceDir: 'Fonts/本地', autoLoadOnStartup: false, latinFontForUI: true,
            availableFonts: [{ name: 'Math', familyName: 'Math', path: 'Fonts/Math.OTF', basename: 'Math.OTF', ext: 'otf', variantType: 'bolditalic', subfamilyName: 'Bold Italic', exists: false }],
            fontFamilies: [{ familyName: 'Math', folderPath: 'Fonts', hasRegular: false, hasBold: false, hasItalic: false, hasBoldItalic: true }],
            deviceFingerprints: { legacy: 'device' }, deviceNameMap: { device: 'Tablet' }, deviceAliases: { old: 'device' },
            deviceMeta: { device: { platform: 'mobile', os: 'android', model: 'SM-X710', hostname: '', firstSeen: '2026-01-01', lastSeen: '2026-11-19', type: 'tablet' } },
            deviceTypeModeEnabled: true, deviceTypePresets: { tablet: 'default-preset' }, deviceTypeOverrides: { device: 'tablet' },
        };
        expect(normalizeSettings(raw)).toEqual(raw);
    });

    test('device type mode accepts only known types and a boolean opt-in', () => {
        const result = normalizeSettings({
            deviceTypeModeEnabled: 'true', deviceTypePresets: { tablet: 'saved', watch: 'invalid', phone: 42 },
            deviceTypeOverrides: { good: 'computer', bad: 'watch' },
            deviceMeta: { old: { platform: 'mobile', os: 'android' }, known: { platform: 'desktop', os: 'windows', type: 'computer' }, bad: { platform: 'mobile', type: 'watch' } },
        });
        expect(result.deviceTypeModeEnabled).toBe(false);
        expect(result.deviceTypePresets).toEqual({ tablet: 'saved' });
        expect(result.deviceTypeOverrides).toEqual({ good: 'computer' });
        expect(result.deviceMeta.old.type).toBeUndefined();
        expect(result.deviceMeta.known.type).toBe('computer');
        expect(result.deviceMeta.bad.type).toBeUndefined();
    });

    test('invalid font list entries and escaping source paths are excluded', () => {
        const result = normalizeSettings({
            availableFonts: [null, {}, { name: 'Outside', path: 'C:/private.otf' }, { name: 'Escape', path: 'Fonts/../outside.ttf' }, { name: 'Valid', path: 'Fonts/Valid.woff2' }],
            fontFamilies: [null, { familyName: 'Escape', folderPath: '../outside' }],
        });
        expect(result.availableFonts).toHaveLength(1);
        expect(result.availableFonts[0].familyName).toBe('Valid');
        expect(result.availableFonts[0].variantType).toBe('regular');
        expect(result.fontFamilies).toEqual([]);
    });

    test('control characters remain rejected without regular-expression control ranges', () => {
        for (const character of ['\0', '\n', '\r', '\t', String.fromCharCode(31)]) {
            expect(normalizeSettings({ fontSourceDir: `Fonts${character}/Local` }).fontSourceDir).toBe(DEFAULT_SETTINGS.fontSourceDir);
            expect(parseFontFamilyMetadata({ variants: { regular: `Math${character}.otf` } })).toBeNull();
        }
    });
});

describe('font family metadata validation', () => {
    test('valid variants and names are preserved while unsupported variants are omitted', () => {
        expect(parseFontFamilyMetadata({ familyName: 'Custom Math', variants: { regular: 'Regular.otf', bold: 'Bold.TTF', unsupported: 'No.ttf' } }))
            .toEqual({ familyName: 'Custom Math', variants: { regular: 'Regular.otf', bold: 'Bold.TTF' } });
    });

    test('only sibling font filenames are allowed and malformed metadata falls back to scanning', () => {
        for (const raw of [null, [], {}, { variants: 4 }, { variants: { regular: '../other.otf', bold: 'sub/font.ttf', italic: 'C:\\font.otf', bolditalic: 'font.js' } }]) {
            expect(parseFontFamilyMetadata(raw)).toBeNull();
        }
        expect(parseFontFamilyMetadata({ familyName: 42, variants: { regular: 'Math.woff2', bold: '../invalid.ttf' } }))
            .toEqual({ variants: { regular: 'Math.woff2' } });
    });
});
