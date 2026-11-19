/** 外部设置先验证再使用；Validate persisted settings before they enter the plugin. */
import { DEFAULT_SETTINGS } from './constants';
import type { DeviceMeta, DeviceType, FontFamily, FontInfo, FontPreset, FontVariantType, LatinFontScope, PluginSettings, PresetFonts } from './types';

const unsafeKeys = new Set(['__proto__', 'prototype', 'constructor']);
const variantTypes: readonly FontVariantType[] = ['regular', 'italic', 'bold', 'bolditalic'];

/** JSON 对象不接受数组或自定义原型；Only plain JSON records are accepted. */
export function isRecord(value: unknown): value is Record<string, unknown> {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
    const prototype: unknown = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

function text(value: unknown, fallback = ''): string {
    return typeof value === 'string' ? value : fallback;
}

function flag(value: unknown, fallback: boolean): boolean {
    return typeof value === 'boolean' ? value : fallback;
}

function safeKey(value: string): boolean {
    return value.length > 0 && !unsafeKeys.has(value);
}

/** 控制字符不能进入文件路径；Keep control characters out of file paths. */
function hasControlCharacter(value: string): boolean {
    for (let index = 0; index < value.length; index++) {
        if (value.charCodeAt(index) < 0x20) return true;
    }
    return false;
}

function strings(value: unknown): string[] {
    return Array.isArray(value) ? [...new Set(value.filter((item): item is string => typeof item === 'string' && safeKey(item)))] : [];
}

function stringMap(value: unknown): Record<string, string> {
    const result: Record<string, string> = {};
    if (!isRecord(value)) return result;
    for (const [key, item] of Object.entries(value)) {
        if (safeKey(key) && typeof item === 'string') result[key] = item;
    }
    return result;
}

/** 限定为库内相对路径；Reject absolute paths and parent traversal. */
function relativePath(value: unknown): string | null {
    if (typeof value !== 'string' || !value || hasControlCharacter(value) || value.includes(':')) return null;
    const path = value.replace(/\\/g, '/');
    if (path.startsWith('/') || path.split('/').some(part => part === '..')) return null;
    const normalized = path.split('/').filter(part => part && part !== '.').join('/');
    return normalized || null;
}

function fonts(value: unknown): PresetFonts {
    const source = isRecord(value) ? value : {};
    return {
        ui: text(source.ui), text: text(source.text), heading: text(source.heading),
        monospace: text(source.monospace), math: text(source.math), latin: text(source.latin),
    };
}

function scope(value: unknown): LatinFontScope {
    const source = isRecord(value) ? value : {};
    return {
        letters: flag(source.letters, true), numbers: flag(source.numbers, true),
        punctuation: flag(source.punctuation, true), symbols: flag(source.symbols, true),
    };
}

function preset(value: unknown): FontPreset | null {
    if (!isRecord(value) || typeof value.id !== 'string' || !safeKey(value.id)) return null;
    return {
        id: value.id, name: text(value.name, value.id), targetDevices: strings(value.targetDevices),
        fonts: fonts(value.fonts), latinFontEnabled: flag(value.latinFontEnabled, false),
        latinFontScope: scope(value.latinFontScope), headingApplyToFileTitle: flag(value.headingApplyToFileTitle, false),
    };
}

function isVariant(value: unknown): value is FontVariantType {
    return variantTypes.some(variant => value === variant);
}

function isDeviceType(value: unknown): value is DeviceType {
    return value === 'computer' || value === 'tablet' || value === 'phone';
}

function deviceTypePresets(value: unknown): Partial<Record<DeviceType, string>> {
    const result: Partial<Record<DeviceType, string>> = {};
    if (!isRecord(value)) return result;
    for (const type of ['computer', 'tablet', 'phone'] as const) {
        if (typeof value[type] === 'string') result[type] = value[type];
    }
    return result;
}

function deviceTypeOverrides(value: unknown): Record<string, DeviceType> {
    const result: Record<string, DeviceType> = {};
    if (!isRecord(value)) return result;
    for (const [key, item] of Object.entries(value)) {
        if (safeKey(key) && isDeviceType(item)) result[key] = item;
    }
    return result;
}

function font(value: unknown): FontInfo | null {
    if (!isRecord(value) || typeof value.name !== 'string' || !value.name) return null;
    const path = relativePath(value.path);
    if (!path || !/\.(ttf|otf|woff|woff2)$/i.test(path)) return null;
    const basename = path.split('/').pop() || '';
    const result: FontInfo = {
        name: value.name, path, basename, ext: basename.slice(basename.lastIndexOf('.') + 1).toLowerCase(),
        familyName: text(value.familyName, value.name), variantType: isVariant(value.variantType) ? value.variantType : 'regular',
    };
    if (typeof value.subfamilyName === 'string') result.subfamilyName = value.subfamilyName;
    if (typeof value.exists === 'boolean') result.exists = value.exists;
    return result;
}

function family(value: unknown): FontFamily | null {
    if (!isRecord(value) || typeof value.familyName !== 'string' || !value.familyName) return null;
    const folderPath = relativePath(value.folderPath);
    if (!folderPath) return null;
    return {
        familyName: value.familyName, folderPath,
        hasRegular: flag(value.hasRegular, false), hasItalic: flag(value.hasItalic, false),
        hasBold: flag(value.hasBold, false), hasBoldItalic: flag(value.hasBoldItalic, false),
    };
}

function device(value: unknown): DeviceMeta | null {
    if (!isRecord(value) || (value.platform !== 'desktop' && value.platform !== 'mobile')) return null;
    const os = value.os;
    const result: DeviceMeta = {
        platform: value.platform,
        os: os === 'ios' || os === 'ipados' || os === 'android' || os === 'windows' || os === 'macos' || os === 'linux' ? os : 'unknown',
        model: text(value.model), hostname: text(value.hostname),
    };
    if (typeof value.firstSeen === 'string') result.firstSeen = value.firstSeen;
    if (typeof value.lastSeen === 'string') result.lastSeen = value.lastSeen;
    if (typeof value.osVersion === 'string') result.osVersion = value.osVersion;
    if (isDeviceType(value.type)) result.type = value.type;
    return result;
}

function deviceMap(value: unknown): Record<string, DeviceMeta> {
    const result: Record<string, DeviceMeta> = {};
    if (!isRecord(value)) return result;
    for (const [key, item] of Object.entries(value)) {
        if (!safeKey(key)) continue;
        const metadata = device(item);
        if (metadata) result[key] = metadata;
    }
    return result;
}

function arrayOf<T>(value: unknown, parse: (item: unknown) => T | null): T[] {
    if (!Array.isArray(value)) return [];
    const result: T[] = [];
    for (const item of value) {
        const parsed = parse(item);
        if (parsed !== null) result.push(parsed);
    }
    return result;
}

/** 不修改输入或共享默认值；Return independent, validated settings and migrate legacy fonts. */
export function normalizeSettings(raw: unknown): PluginSettings {
    const source = isRecord(raw) ? raw : {};
    const presets = arrayOf(source.presets, preset);
    const seen = new Set<string>();
    const uniquePresets = presets.filter(item => !seen.has(item.id) && Boolean(seen.add(item.id)));
    if (!uniquePresets.some(item => item.id === 'default-preset')) {
        uniquePresets.unshift({
            id: 'default-preset', name: 'Default', targetDevices: [], fonts: fonts(source.fonts),
            latinFontEnabled: flag(source.latinFontEnabled, false), latinFontScope: scope(source.latinFontScope),
            headingApplyToFileTitle: flag(source.headingApplyToFileTitle, false),
        });
    }
    return {
        fontSourceDir: relativePath(source.fontSourceDir) || DEFAULT_SETTINGS.fontSourceDir,
        autoLoadOnStartup: flag(source.autoLoadOnStartup, DEFAULT_SETTINGS.autoLoadOnStartup),
        latinFontForUI: flag(source.latinFontForUI, DEFAULT_SETTINGS.latinFontForUI),
        availableFonts: arrayOf(source.availableFonts, font), fontFamilies: arrayOf(source.fontFamilies, family),
        deviceFingerprints: stringMap(source.deviceFingerprints), deviceNameMap: stringMap(source.deviceNameMap),
        deviceAliases: stringMap(source.deviceAliases), deviceMeta: deviceMap(source.deviceMeta), presets: uniquePresets,
        deviceTypeModeEnabled: source.deviceTypeModeEnabled === true,
        deviceTypePresets: deviceTypePresets(source.deviceTypePresets),
        deviceTypeOverrides: deviceTypeOverrides(source.deviceTypeOverrides),
    };
}

export interface FontFamilyMetadata {
    familyName?: string;
    variants: Partial<Record<FontVariantType, string>>;
}

/** 元数据不能跳出字体目录；Metadata may reference only sibling font files. */
export function parseFontFamilyMetadata(raw: unknown): FontFamilyMetadata | null {
    if (!isRecord(raw) || !isRecord(raw.variants)) return null;
    const variants: Partial<Record<FontVariantType, string>> = {};
    for (const key of variantTypes) {
        const filename = raw.variants[key];
        if (typeof filename === 'string' && !hasControlCharacter(filename) && !/[\\/:]/.test(filename)
            && filename !== '.' && filename !== '..' && /\.(ttf|otf|woff|woff2)$/i.test(filename)) {
            variants[key] = filename;
        }
    }
    if (Object.keys(variants).length === 0) return null;
    return typeof raw.familyName === 'string' && raw.familyName
        ? { familyName: raw.familyName, variants }
        : { variants };
}
