/**
 * Contract every math-font adapter implements.
 *
 * The plugin used to derive all math metrics by measuring rendered text on a canvas, which is a
 * single algorithm trying to fit fonts that follow mutually incompatible standards. That cannot
 * work: a font that ships an OpenType `MATH` table already states its own metrics and its own rules
 * for assembling stretchy delimiters, and those design values are not recoverable by measuring ink.
 *
 * So metrics are sourced by standard instead — each adapter knows one font family and how that
 * family's standard expresses its metrics — and the measuring algorithm is demoted to a fallback
 * for fonts that carry no math metadata at all.
 *
 * Units: every value in here is in **em**, matching what MathJax's font table holds. OpenType
 * values are in font design units and must be divided by `unitsPerEm` by the adapter that reads them.
 */

/**
 * One glyph's box: height above the baseline, depth below it, and advance width.
 *
 * This is MathJax's `[height, depth, width]` convention, where the third value is the advance — the
 * CHTML output turns it into the right padding of `mjx-c.mjx-cXXXX`. It is a *layout box*, not an
 * ink bounding box: the two are different standards and must not be confused.
 */
export type GlyphMetrics = [height: number, depth: number, width: number];

/** Font-wide math constants, from the OpenType `MathConstants` table. All in em. */
export interface MathConstants {
    /** Height of the math axis above the baseline — where minus signs and fraction rules sit. */
    axisHeight?: number;
    /** Thickness of the fraction bar. */
    fractionRuleThickness?: number;
    /** Thickness of a radical's rule. */
    radicalRuleThickness?: number;
    /** Scale factor for first-level sub/superscripts (OpenType suggests 0.8). */
    scriptPercentScaleDown?: number;
    /** Scale factor for second-level scripts (OpenType suggests 0.6). */
    scriptScriptPercentScaleDown?: number;
    /** Extra ascender reserved above an overbar. */
    overbarExtraAscender?: number;
    /** Extra descender reserved below an underbar. */
    underbarExtraDescender?: number;
}

/**
 * What an adapter produces.
 *
 * The `chars` and `delimiters` maps are keyed the way MathJax keys its own table: the decimal
 * codepoint as a string, e.g. `"40"` for `(`. Adapters may return a subset — entries they do not
 * produce are left at whatever MathJax already had.
 */
export interface MathFontMetrics {
    /** Where these numbers came from, for diagnostics and for deciding what may be overwritten. */
    source: 'opentype-math' | 'tex-tfm' | 'measured' | 'reference';
    /**
     * Per-glyph box metrics, keyed by decimal codepoint as a string.
     *
     * Safe to write into MathJax's `variant.*.chars` for glyphs this font actually draws.
     */
    chars: Record<string, GlyphMetrics>;
    /**
     * Stretchy-delimiter target sizes, keyed by decimal codepoint.
     *
     * **Only populate this when the font owns the assembly** — that is, when the stretchy pieces
     * will be drawn from *this* font. MathJax assembles `\\underbrace`, `\\left(...\\right)` and
     * extensible arrows from private-use pieces in its own TeX faces, so overwriting its targets
     * with another font's numbers corrupts brace height and span. Leave this undefined to keep
     * MathJax's own values, which is the right answer for a font substituted into MathJax.
     */
    delimiters?: Record<string, GlyphMetrics>;
    /** Font-wide constants, when the standard states them. */
    constants?: MathConstants;
    /** Whether the stretchy assembly is drawn from this font (true only for MATH-table fonts used natively). */
    ownsStretchyAssembly: boolean;
    /**
     * Codepoint ranges this font does not cover, named for a person reading the status.
     *
     * Structural rather than parsed out of `notes` so the caller never has to guess which
     * diagnostic line is a coverage gap. Glyphs in these ranges keep whatever MathJax had.
     */
    gaps?: string[];

    /** Free-form notes surfaced in diagnostics. */
    notes?: string[];
}

/** Context handed to an adapter when it is asked to build metrics. */
export interface AdapterContext {
    /** The family name the user configured, e.g. `"XITS Math"`. */
    familyName: string;
    /** units-per-em of the font, when the caller could read it. */
    unitsPerEm?: number;
}

/** One font family's rule for turning its own metrics into MathJax's. */
export interface MathFontAdapter {
    /** Stable id, also the module's filename stem. */
    id: string;
    /** Human-readable name. */
    name: string;
    /** Family names this adapter claims, compared case-insensitively and exactly. */
    families: string[];
    /** Lower runs first, so a family-specific adapter beats a generic one. */
    priority: number;
    /** Whether this adapter claims the family. Default implementation matches `families`. */
    matches(familyName: string): boolean;
    /**
     * Build metrics from the font file's bytes.
     *
     * @param binary - the font file, as read from the vault
     * @param ctx    - what the caller knows
     * @returns the metrics, or null to decline and let a lower-priority adapter (or the fallback) try
     */
    build(binary: ArrayBuffer, ctx: AdapterContext): MathFontMetrics | null;
}

/** Convenience base: claim a family by exact, case-insensitive name. */
export function matchByFamilyName(adapter: Pick<MathFontAdapter, 'families'>, familyName: string): boolean {
    const want = familyName.trim().toLowerCase();
    return adapter.families.some(f => f.trim().toLowerCase() === want);
}
