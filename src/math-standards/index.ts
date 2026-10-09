/**
 * Math-font standards registry: pick the right adapter for a family, or fall back.
 *
 * Order of preference, most specific first:
 *   1. a family-specific adapter (knows that family's quirks)
 *   2. the generic OpenType `MATH`-table path (any font that ships the table)
 *   3. the measurement fallback (fonts with no math metadata at all)
 *
 * The fallback is deliberately last: it is the only path that has to guess, and guessing is what
 * produced the corrupted metrics this architecture exists to replace.
 */

import type { AdapterContext, MathFontAdapter, MathFontMetrics } from './types';
import { matchByFamilyName } from './types';

// Family-specific adapters. Each is its own module so a family's quirks live in one place.
import { xitsMathAdapter } from './adapters/xits-math';
import { stixTwoMathAdapter } from './adapters/stix-two-math';
import { latinModernMathAdapter } from './adapters/latin-modern-math';
import { texGyreTermesMathAdapter } from './adapters/tex-gyre-termes-math';
import { texGyrePagellaMathAdapter } from './adapters/tex-gyre-pagella-math';
import { libertinusMathAdapter } from './adapters/libertinus-math';
import { asanaMathAdapter } from './adapters/asana-math';
import { cambriaMathAdapter } from './adapters/cambria-math';
import { minionMathAdapter } from './adapters/minion-math';
import { notoMathAdapter } from './adapters/noto-math';
import { firaMathAdapter } from './adapters/fira-math';
import { eulerMathAdapter } from './adapters/euler-math';
import { computerModernAdapter } from './adapters/computer-modern';
import { mathJaxTexAdapter } from './adapters/mathjax-tex';

import { measurementFallbackAdapter } from './fallback-measure';

/** Every adapter, ordered by priority at registration time. */
const adapters: MathFontAdapter[] = [
    xitsMathAdapter,
    stixTwoMathAdapter,
    latinModernMathAdapter,
    texGyreTermesMathAdapter,
    texGyrePagellaMathAdapter,
    libertinusMathAdapter,
    asanaMathAdapter,
    cambriaMathAdapter,
    minionMathAdapter,
    notoMathAdapter,
    firaMathAdapter,
    eulerMathAdapter,
    computerModernAdapter,
    mathJaxTexAdapter,
    // Last: the only path that measures, so it only sees fonts nothing above claims.
    measurementFallbackAdapter,
].sort((a, b) => a.priority - b.priority);

/** The adapter that claims this family, or null when none does. */
export function findMathFontAdapter(familyName: string): MathFontAdapter | null {
    for (const adapter of adapters) {
        if (adapter.matches(familyName)) {
            return adapter;
        }
    }
    return null;
}

/** Ids of every registered adapter, for diagnostics and the settings UI. */
export function listMathFontAdapters(): Array<{ id: string; name: string; priority: number; families: string[] }> {
    return adapters.map(a => ({ id: a.id, name: a.name, priority: a.priority, families: a.families }));
}

export interface MathMetricsResult {
    metrics: MathFontMetrics;
    /** Which adapter produced it. */
    adapterId: string;
    adapterName: string;
}

/**
 * Build metrics for a family from its font file.
 *
 * The measurement fallback is only reached when **no named adapter claims the family**. If a named
 * adapter matches and then declines, that decline is final: it means "this family is not mine to
 * size", and measuring it would be the wrong answer. That distinction is what keeps MathJax's own
 * faces from being sampled on a canvas — the reference adapter matches their names precisely so it
 * can refuse them, and falling through to the fallback after that refusal would undo it.
 *
 * @param binary     - the font file
 * @param familyName - the configured family name
 * @returns the metrics plus who produced them, or null when nothing would take it
 */
export function buildMathMetrics(binary: ArrayBuffer, familyName: string, unitsPerEm?: number): MathMetricsResult | null {
    const ctx: AdapterContext = { familyName, unitsPerEm };

    const named = adapters.filter(a => a.id !== measurementFallbackAdapter.id && a.matches(familyName));
    const pool = named.length > 0 ? named : [measurementFallbackAdapter];

    for (const adapter of pool) {
        try {
            const metrics = adapter.build(binary, ctx);
            if (metrics) {
                return { metrics, adapterId: adapter.id, adapterName: adapter.name };
            }
        } catch {
            // A broken adapter must not stop the next one in the pool from trying.
            continue;
        }
    }

    // A named adapter that matched but produced nothing is a deliberate refusal, not a gap.
    return null;
}

export { matchByFamilyName };
export type { AdapterContext, MathFontAdapter, MathFontMetrics, GlyphMetrics, MathConstants } from './types';
export { readOpenTypeMathTable } from './opentype-math';
export type { OpenTypeMathTable, GlyphConstruction, GlyphPart } from './opentype-math';
