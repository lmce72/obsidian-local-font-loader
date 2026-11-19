import type { MathJaxFontData } from './obsidian-extras';

/** 只接管普通 Unicode 字形；Keep TeX size variants and assembly pieces native. */
export function canReplaceMathGlyph(code: number, entry: unknown[]): boolean {
    if (!Number.isInteger(code) || code === 0x221a || code < 0x20 || code > 0x10ffff
        || (code >= 0xe000 && code <= 0xf8ff) || code >= 0xf0000) return false;
    const extra: unknown = entry[3];
    if (!extra || typeof extra !== 'object') return true;
    const face = 'f' in extra ? extra.f : undefined;
    return face === undefined || face === '' || face === 'I';
}

/** 所有字体与盒模型规则共用同一选择器；One scope for font and geometry. */
export function mathGlyphSelector(code: string, entry: unknown[], mathJax4: boolean): string {
    const extra: unknown = entry[3];
    const italic = extra && typeof extra === 'object' && 'f' in extra && extra.f === 'I';
    const faceGuard = italic ? '.TEX-I' : ':not([class*="TEX-"])';
    const assemblyGuard = ':not(mjx-stretchy-h *):not(mjx-stretchy-v *)';
    return `body mjx-c.mjx-c${Number(code).toString(16).toUpperCase()}${faceGuard}${assemblyGuard}${mathJax4 ? '' : '::before'}`;
}

/** 只遍历替换字体实际使用的基本字形，避免重复修改共享数组；Visit shared entries once. */
export function replaceableMathEntries(font: MathJaxFontData): Array<[string, unknown[]]> {
    const seen = new Set<unknown[]>();
    return Object.entries(font.variant.normal?.chars ?? {}).filter(([code, entry]) => {
        if (!Array.isArray(entry) || entry.length < 3 || seen.has(entry)
            || !canReplaceMathGlyph(Number(code), entry)) return false;
        seen.add(entry);
        return true;
    });
}
