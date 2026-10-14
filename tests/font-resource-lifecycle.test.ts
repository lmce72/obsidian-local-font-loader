import { afterEach, describe, expect, mock, test } from 'bun:test';
import { mkdtemp, mkdir, readFile, writeFile, access, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

class Stub {}
const Platform = { isDesktopApp: true, isMobile: false };
mock.module('obsidian', () => ({
    Plugin: Stub, PluginSettingTab: Stub, Modal: Stub, ConfirmationModal: Stub,
    AbstractInputSuggest: Stub, FuzzySuggestModal: Stub, Component: Stub,
    Setting: Stub, Notice: Stub, App: Stub, TFolder: Stub, TextComponent: Stub,
    MarkdownRenderer: Stub, setIcon() {}, getLanguage: () => 'en',
    normalizePath: (path: string) => path.replace(/\\/g, '/'), Platform,
}));
Object.assign(globalThis, { window: { navigator: {} } });
const { default: LocalFontLoaderPlugin } = await import('../src/plugin');

// Small DOM test double: verifies style lifecycle, not font rendering in a WebView.
function documentDouble() {
    const nodes = new Map<string, any>();
    return {
        nodes,
        getElementById: (id: string) => nodes.get(id) || null,
        createElement: (tag: string) => ({ tagName: tag, id: '', textContent: '', remove() { nodes.delete(this.id); } }),
        head: { appendChild: (node: any) => nodes.set(node.id, node) },
    };
}
const roots: string[] = [];
afterEach(async () => { for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true }); });

async function fixture(prefix = 'app://desktop-session/') {
    const root = await mkdtemp(join(tmpdir(), 'local-font-empty-vault-'));
    roots.push(root);
    const doc = documentDouble();
    Object.assign(globalThis, { document: doc });
    const plugin = new LocalFontLoaderPlugin() as any;
    const errors: unknown[] = [];
    plugin._log = () => {};
    plugin._logError = (...args: unknown[]) => errors.push(args);
    plugin._fontDocuments.add(doc);
    const snippetPath = '.obsidian/snippets/local-font-loader.css';
    const customCss = {
        enabledSnippets: new Set<string>(), csscache: new Map<string, string>(),
        getSnippetPath: () => snippetPath, requestLoadSnippets() {},
        setCssEnabledStatus(name: string, enabled: boolean) { enabled ? this.enabledSnippets.add(name) : this.enabledSnippets.delete(name); },
    };
    plugin.app = { customCss, vault: { adapter: {
        exists: async (path: string) => { try { await access(join(root, path)); return true; } catch { return false; } },
        mkdir: (path: string) => mkdir(join(root, path)),
        read: (path: string) => readFile(join(root, path), 'utf8'),
        write: (path: string, css: string) => writeFile(join(root, path), css),
        getResourcePath: (path: string) => prefix + path,
    } } };
    return { plugin, root, doc, errors, snippetPath, customCss };
}
const font = { name: 'Test', familyName: 'Test', path: 'Fonts/Test.TTF', variantType: 'regular' };
const faces = (plugin: any) => plugin._buildFontFaceCss(font, { fontsConfig: {}, latinFontEnabled: false, latinFontScope: {} }, plugin._getFontResourceSrc(font)).css;

describe('session-local font resources', () => {
    test('empty vault creates snippet folders and keeps font addresses out of disk', async () => {
        const { plugin, root, doc, errors, snippetPath, customCss } = await fixture();
        await plugin._sanitizePersistedFontSnippet();
        plugin.applyCss(faces(plugin), 'local-font-loader-faces');
        plugin.applyCss('body { --font-text: "Test"; }', 'local-font-loader-vars');
        await plugin._snippetSync;
        const css = await readFile(join(root, snippetPath), 'utf8');
        expect(css).toContain('--font-text');
        expect(css).not.toContain('app://');
        expect(css).not.toContain('@font-face');
        expect(doc.nodes.get('local-font-loader-faces').textContent).toContain('app://desktop-session/Fonts/Test.TTF');
        expect(customCss.enabledSnippets.has('local-font-loader')).toBe(true);
        expect(errors).toEqual([]);
    });

    test('desktop snippet synced to mobile is cleaned and uses mobile adapter URL at runtime', async () => {
        const { plugin, root, snippetPath, doc, errors } = await fixture('http://localhost/_capacitor_file_/');
        await mkdir(join(root, '.obsidian/snippets'), { recursive: true });
        await writeFile(join(root, snippetPath), '@media print { @font-face {font-family:"Old";src:url("app://dead/font.TTF?1")} }\nbody {--font-text:"Test"}');
        await plugin._sanitizePersistedFontSnippet();
        expect(await readFile(join(root, snippetPath), 'utf8')).not.toContain('app://');
        Platform.isDesktopApp = false; Platform.isMobile = true;
        plugin.applyCss(faces(plugin), 'local-font-loader-faces');
        await plugin._snippetSync;
        expect(doc.nodes.get('local-font-loader-faces').textContent).toContain('http://localhost/_capacitor_file_/Fonts/Test.TTF');
        expect(errors).toEqual([]);
        Platform.isDesktopApp = true; Platform.isMobile = false;
    });

    test('resource URLs from successive sessions never alter the portable snippet', async () => {
        const { plugin, root, snippetPath, doc } = await fixture();
        plugin.applyCss('body { --font-text: Test; }', 'local-font-loader-vars');
        plugin.applyCss(faces(plugin), 'local-font-loader-faces');
        await plugin._snippetSync;
        const before = await readFile(join(root, snippetPath), 'utf8');
        plugin.app.vault.adapter.getResourcePath = () => 'file:///mobile/Test.TTF';
        plugin.applyCss(faces(plugin), 'local-font-loader-faces');
        await plugin._snippetSync;
        expect(await readFile(join(root, snippetPath), 'utf8')).toBe(before);
        expect(doc.nodes.get('local-font-loader-faces').textContent).toContain('file:///mobile/Test.TTF');
    });

    test('popout receives updated font faces and removing faces clears every document', async () => {
        const { plugin, doc } = await fixture();
        const popout = documentDouble();
        plugin._fontDocuments.add(popout);
        plugin.applyCss(faces(plugin), 'local-font-loader-faces');
        expect(popout.nodes.get('local-font-loader-faces').textContent).toBe(doc.nodes.get('local-font-loader-faces').textContent);
        plugin._removeGeneratedStyles('local-font-loader-faces');
        expect(popout.nodes.size).toBe(0);
        expect(doc.nodes.size).toBe(0);
        await plugin._snippetSync;
    });

    test('fresh empty vault with no selected fonts does not create stale font rules', async () => {
        const { plugin, root, snippetPath, doc, errors } = await fixture();
        plugin._getDevicePreset = () => ({ fonts: {} });
        plugin._restoreMathFontMetrics = () => {};
        await plugin.applyFonts();
        await plugin._snippetSync;
        expect(doc.nodes.size).toBe(0);
        expect(await plugin.app.vault.adapter.exists(snippetPath)).toBe(false);
        expect(errors).toEqual([]);
    });

    test('applying a configured font in an empty vault writes variables and runtime faces', async () => {
        const { plugin, root, snippetPath, doc, errors } = await fixture('file:///mobile/');
        plugin.settings = { availableFonts: [font], latinFontForUI: false };
        plugin._getDevicePreset = () => ({ fonts: { text: 'Test' } });
        await plugin.applyFonts();
        await plugin._snippetSync;
        const css = await readFile(join(root, snippetPath), 'utf8');
        expect(css).toContain('--font-text: "Test"');
        expect(css).not.toContain('file:///');
        expect(doc.nodes.get('local-font-loader-faces').textContent).toContain('file:///mobile/Fonts/Test.TTF');
        expect(errors).toEqual([]);
    });

    test('missing font resource resolves to null and is logged instead of emitting a broken URL', async () => {
        const { plugin, errors } = await fixture();
        plugin.app.vault.adapter.getResourcePath = () => { throw new Error('missing font'); };
        expect(plugin._getFontResourceSrc(font)).toBeNull();
        expect(errors.length).toBe(1);
    });
});
