/**
 * The plugin's data model.
 *
 * Everything here describes what is persisted to `data.json` or derived from the font files on
 * disk. Keeping it in one module means the shape of a saved setting is stated once and checked
 * everywhere it is read or written — a mistyped field name or a value that drifts from its
 * neighbours is a compile error rather than a silent `undefined` at runtime.
 */

/** The four faces a font family can contribute. */
export type FontVariantType = 'regular' | 'italic' | 'bold' | 'bolditalic';

/** A font category the user can assign a family to. */
export type FontCategoryKey = 'ui' | 'text' | 'heading' | 'monospace' | 'math';

/** A font file found by a scan, and its cached Base64 counterpart. */
export interface FontInfo {
    /** File name without extension — the deduplication key. */
    name: string;
    /** Vault-relative path to the source font file. */
    path: string;
    /** File name with extension. */
    basename: string;
    /** Lower-case extension without the dot: ttf, otf, woff, woff2. */
    ext: string;
    /** Family name reported by the font itself, falling back to the folder name. */
    familyName: string;
    /** Subfamily as named by the font, when it could be read. */
    subfamilyName?: string;
    variantType: FontVariantType;
    /** Whether a Base64 stylesheet has been generated for this file. */
    hasB64: boolean;
    /** Vault-relative path of the generated Base64 stylesheet. */
    b64Path: string | null;
    /** False when the source file has gone missing since the last scan. */
    exists?: boolean;
}

/** A scanned family folder, and which of the four faces it provides. */
export interface FontFamily {
    familyName: string;
    /** Vault-relative path of the family folder. */
    folderPath: string;
    hasRegular: boolean;
    hasItalic: boolean;
    hasBold: boolean;
    hasBoldItalic: boolean;
}

/** What the OpenType/TrueType name table yields for one file. */
export interface FontMetadata {
    familyName: string;
    subfamilyName: string;
    fullName: string;
    postScriptName: string;
    variantType: FontVariantType;
    style: {
        isItalic: boolean;
        isBold: boolean;
        weight: number;
        cssStyle: 'italic' | 'normal';
    };
}

/** Which characters a separated Latin font is allowed to cover. */
export interface LatinFontScope {
    letters: boolean;
    numbers: boolean;
    punctuation: boolean;
    symbols: boolean;
}

/** The fonts a preset assigns to each category. Empty string means "unset". */
export interface PresetFonts {
    ui: string;
    text: string;
    /** Family name, or one of the sentinels `use-text-font` / `use-ui-font`. */
    heading: string;
    monospace: string;
    math: string;
    latin?: string;
}

/** One named font configuration, optionally bound to specific devices. */
export interface FontPreset {
    id: string;
    name: string;
    /** Device ids this preset applies to. Empty means "every unassigned device". */
    targetDevices: string[];
    fonts: PresetFonts;
    latinFontEnabled?: boolean;
    latinFontScope?: LatinFontScope;
    headingApplyToFileTitle?: boolean;
}

/** What a device records about itself, and what other devices see about it. */
export interface DeviceMeta {
    platform: 'mobile' | 'desktop';
    /** `ipados` is distinct from `ios`: since iPadOS 13 an iPad reports a desktop-class UA. */
    os: 'ios' | 'ipados' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';
    /** What the user agent exposes — an Android build code, or the Apple device family. */
    model: string;
    /** Machine name, desktops only. Lets a renamed device still be identifiable. */
    hostname: string;
    /**
     * ISO timestamp of the first launch this id was seen at. Written by the device itself.
     *
     * The pair of timestamps is the only evidence that can separate "one device that lost its
     * identity" from "two devices of the same model": a device that stopped being seen *before*
     * another id appeared is its predecessor, whereas two entries seen at the same time are two
     * real devices. See `isSuccessionChain` in `device-repair.ts`.
     */
    firstSeen?: string;
    /** ISO timestamp of the most recent launch seen; refreshed by the device, not on every launch. */
    lastSeen?: string;
    /** Written by older versions; no longer read, dropped when the entry is rewritten. */
    osVersion?: string;
}

/**
 * Everything persisted to `data.json`.
 *
 * The per-device identity deliberately is NOT here: it lives in device-local storage, because
 * this object syncs and a synced identity would make every device believe it is the same one.
 */
export interface PluginSettings {
    fontSourceDir: string;
    b64OutputDir: string;
    availableFonts: FontInfo[];
    fontFamilies: FontFamily[];
    autoLoadOnStartup: boolean;
    /** Legacy fingerprint → device id. A one-time migration ledger, consumed on first run. */
    deviceFingerprints: Record<string, string>;
    deviceNameMap: Record<string, string>;
    deviceMeta: Record<string, DeviceMeta>;
    /**
     * Collapsed device id → the id that replaced it, written by the device-list repair when a sync
     * merge leaves the same physical device registered twice. A device whose own id was collapsed
     * adopts its survivor from here, instead of re-registering the id that was just removed.
     */
    deviceAliases: Record<string, string>;
    latinFontForUI: boolean;
    presets: FontPreset[];
}

/** The reference metrics a math font must match, in em, measured from MathJax's own faces. */
export interface MathFontReferenceMetrics {
    surdAbove: number;
    surdBelow: number;
    mathItalicX: number;
    digitOne: number;
    plus: number;
}

/** One measured metric that fell outside tolerance. */
export interface MathFontDeviation {
    metric: string;
    actual: number;
    expected: number;
    percent: number;
}

/** The verdict of comparing a math font against MathJax's baked-in metrics. */
export interface MathFontVerdict {
    status: 'ok' | 'mismatch' | 'notMathFont' | 'unavailable';
    deviations: MathFontDeviation[];
    missing?: string[];
}

/** A saved copy of one MathJax glyph entry, so adoption can be undone. */
export interface MathFontMetricSnapshot {
    chars: Array<{ variantName: string; code: string; values: number[] }>;
    delimiters: Array<{ code: string; values: number[] }>;
}
