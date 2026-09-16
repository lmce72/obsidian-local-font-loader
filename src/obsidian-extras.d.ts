/**
 * Members Obsidian provides at runtime but does not publish in `obsidian.d.ts`.
 *
 * Declaring them here keeps the call sites readable instead of scattering `as any` through the
 * plugin, and keeps the undocumented surface in one file where it can be reviewed.
 */
import type { App, View } from 'obsidian';

declare module 'obsidian' {
    interface App {
        /**
         * The settings window controller.
         *
         * Undocumented but stable — it is how a ribbon icon or command opens the plugin's own tab.
         */
        setting: {
            open(): void;
            openTabById(id: string): void;
        };
    }

    interface View {
        /**
         * Present on MarkdownView; absent on most other view types, hence optional.
         * `rerender(true)` forces a full re-render rather than reusing cached sections.
         */
        previewMode?: {
            rerender(full?: boolean): void;
        };
    }
}

declare global {
    interface Window {
        /**
         * MathJax's runtime, present only once Obsidian has typeset something on this platform.
         *
         * Left loosely typed on purpose: only the small surface the plugin actually touches is
         * declared, and the shapes below are documented against MathJax 3.2.
         */
        MathJax?: {
            config: {
                chtml: {
                    font: MathJaxFontData;
                };
            };
            startup: {
                output: {
                    options?: { adaptiveCSS?: boolean };
                    clearCache(): void;
                    adaptor: { document: unknown };
                };
            };
        };
    }
}

/** MathJax's pre-built metrics: what it lays maths out from, rather than the font files. */
export interface MathJaxFontData {
    /** Per-variant glyph table: `[height, depth, width, { ic?, sk?, c?, f? }]` keyed by codepoint. */
    variant: Record<string, { chars: Record<string, unknown[]> }>;
    /** Stretchy-assembly specs: target sizes, the piece codepoints, and the assembled metrics. */
    delimiters: Record<string, { HDW: number[] }>;
}
