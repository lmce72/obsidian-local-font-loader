import { afterEach, describe, expect, mock, test } from 'bun:test';
import { mkdtemp, mkdir, readFile, writeFile, access, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DEFAULT_SETTINGS } from '../src/constants';

class Stub {}
const Platform = { isDesktopApp: true, isMobile: false };
mock.module('obsidian', () => ({
    Plugin: Stub, PluginSettingTab: Stub, Modal: Stub, ConfirmationModal: Stub,
    AbstractInputSuggest: Stub, FuzzySuggestModal: Stub, Component: Stub,
    Setting: Stub, Notice: Stub, Menu: Stub, App: Stub, TFolder: Stub, TextComponent: Stub,
    MarkdownRenderer: Stub, setIcon() {}, getLanguage: () => 'en',
    normalizePath: (path: string) => path.replace(/\\/g, '/'), Platform,
}));
Object.assign(globalThis, { window: { navigator: {} } });
const { default: LocalFontLoaderPlugin } = await import('../src/plugin');

const stylesheetTemplate = '/* static rules */\nbody { color: inherit; }\n'
    + '/* local-font-loader:font-faces:start */\n/* local-font-loader:font-faces:end */';

// 不提供节点创建方法，验证既有样式表更新；Verify updates without allowing DOM node creation.
function documentDouble() {
    const nodes = new Map<string, any>();
    const stylesheet = { nodeName: 'STYLE', textContent: stylesheetTemplate };
    const stylesheets = [stylesheet];
    let onMutation = (_records: unknown[]) => {};
    return {
        nodes,
        stylesheet,
        stylesheets,
        defaultView: { MutationObserver: class {
            constructor(callback: typeof onMutation) { onMutation = callback; }
            observe() {}
            disconnect() { onMutation = () => {}; }
        } },
        stylesheetChanged: (added = false) => onMutation([{
            target: added ? { nodeName: 'HEAD', parentNode: null } : stylesheet,
            addedNodes: added ? [stylesheet] : [],
        }]),
        getElementById: (id: string) => nodes.get(id) || null,
        head: { querySelectorAll: () => stylesheets },
    };
}

function runtimeCss(doc: ReturnType<typeof documentDouble>) {
    expect(doc.nodes.size).toBe(0);
    expect(doc.stylesheet.textContent).toContain('body { color: inherit; }');
    return doc.stylesheet.textContent;
}
const roots: string[] = [];
afterEach(async () => { for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true }); });

async function fixture(prefix = 'app://desktop-session/') {
    const root = await mkdtemp(join(tmpdir(), 'local-font-empty-vault-'));
    roots.push(root);
    const doc = documentDouble();
    Object.assign(globalThis, { document: doc, activeDocument: doc });
    const plugin = new LocalFontLoaderPlugin() as any;
    const errors: unknown[] = [];
    plugin._log = () => {};
    plugin._logError = (...args: unknown[]) => errors.push(args);
    plugin._trackFontDocument(doc);
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

describe('math font geometry and lifecycle', () => {
    test('shared base entries restore exactly and native size/assembly metrics remain unchanged', async () => {
        const { plugin } = await fixture();
        const shared = [0.75, 0.25, 0.5, { f: '' }];
        const large = [1.15, 0.65, 0.67, { f: 'LO' }];
        const table = { variant: { normal: { chars: { 125: shared } }, italic: { chars: { 125: shared } }, '-largeop': { chars: { 125: large } } }, delimiters: { 125: { HDW: [1, 2, 3] } } };
        plugin._getMathFontData = () => table;
        window.MathJax = { version: '4.1.3' } as any;
        for (let i = 0; i < 2; i++) {
            expect(plugin._applyMathMetrics(table, { source: 'measured', chars: { 125: [0.8, 0.2, 0.4] } }, 'Test')).toBe(true);
            expect(plugin._mathFontSnapshot.chars).toHaveLength(1);
            expect(large.slice(0, 3)).toEqual([1.15, 0.65, 0.67]);
            expect(table.delimiters[125].HDW).toEqual([1, 2, 3]);
            const css = plugin._buildMathGlyphRules();
            expect(css).toContain(':not([class*="TEX-"])');
            expect(css).toContain(':not(mjx-stretchy-v *)');
            expect(css).not.toContain('::before');
            plugin._restoreMathFontMetrics();
            expect(shared.slice(0, 3)).toEqual([0.75, 0.25, 0.5]);
        }
    });

    test('cold start CSS supports MathJax 3 and 4 without duplicating text or the italic h/Greek glyphs', async () => {
        const { plugin } = await fixture();
        delete window.MathJax;
        plugin.settings = structuredClone(DEFAULT_SETTINGS);
        plugin.currentDeviceId = 'test-device';
        plugin.settings.availableFonts = [font];
        plugin.settings.presets[0].fonts.math = 'Test';
        plugin._fontExistsMap = { Test: true };
        Object.assign(window, { setTimeout: () => 1, clearTimeout: () => {} });
        await plugin.applyFonts();
        await plugin._snippetSync;
        const css = plugin._appliedCss.get('local-font-loader-vars');
        expect(css).toContain(':empty::before');
        expect(css).toContain('MJX-TEX-N, MJXZERO, MJXTEX');
        expect(css).toContain('mjx-c210E');
        expect(css).toContain('content: "ℎ"');
        expect(css).toContain('mjx-c1D6FC');
        expect(css).toContain(':not(.mjx-c221A)');
        expect(css).not.toContain('mjx-c1D455');
    });

    test('layout events do not adopt metrics when fonts were never applied', async () => {
        const { plugin } = await fixture();
        let calls = 0;
        plugin._adoptMathFontMetrics = async () => { calls++; return false; };
        await plugin._retryMathMetricAdoption();
        expect(calls).toBe(0);
    });

    test('clearing fonts disables a persisted snippet even before the new instance applied any CSS', async () => {
        const { plugin, customCss } = await fixture();
        customCss.enabledSnippets.add('local-font-loader');
        expect(plugin._snippetCss.size).toBe(0);
        plugin.removeFontStyles();
        await plugin._snippetSync;
        expect(customCss.enabledSnippets.has('local-font-loader')).toBe(false);
    });

    test('startup scanning does not create defaults over a settings file still arriving from sync', async () => {
        const { plugin } = await fixture();
        plugin.settings = structuredClone(DEFAULT_SETTINGS);
        plugin.app.vault.adapter.list = async () => ({ files: [], folders: [] });
        plugin._ensureFolder = async () => {};
        let saves = 0;
        plugin.saveSettings = async () => { saves++; };
        await plugin.scanFonts(false);
        expect(saves).toBe(0);
        await plugin.scanFonts();
        expect(saves).toBe(1);
    });

    test('reentrant jobs share work and an old generation cannot unlock or block the new font', async () => {
        const { plugin } = await fixture();
        const finish: Array<(value: boolean) => void> = [];
        let calls = 0;
        let after = 0;
        plugin._adoptMathFontMetrics = () => { calls++; return new Promise<boolean>(resolve => finish.push(resolve)); };
        plugin._afterMetricAdoption = async () => { after++; };
        const first = plugin._runMathMetricAdoption('Old');
        const same = plugin._runMathMetricAdoption('Old');
        expect(calls).toBe(1);
        plugin.removeFontStyles();
        const next = plugin._runMathMetricAdoption('New');
        expect(calls).toBe(2);
        finish[0](true);
        await Promise.all([first, same]);
        expect(plugin._mathAdoptionJob).not.toBeNull();
        expect(after).toBe(0);
        finish[1](true);
        await next;
        expect(after).toBe(1);
        expect(plugin._mathAdoptionJob).toBeNull();
    });

    test('unload or a font change invalidates a pending adapter result before it mutates MathJax', async () => {
        const { plugin } = await fixture();
        window.MathJax = { version: '4.1.3' } as any;
        (globalThis as any).activeDocument.fonts = {};
        plugin._waitForMathFontData = async () => ({ variant: {}, delimiters: {} });
        let resolve!: (value: unknown) => void;
        plugin._resolveMathMetricsFromStandards = () => new Promise(done => { resolve = done; });
        let applied = false;
        plugin._applyMathMetrics = () => { applied = true; return true; };
        const pending = plugin._adoptMathFontMetrics('Old');
        await Promise.resolve();
        plugin.removeFontStyles();
        resolve({ kind: 'metrics', metrics: { source: 'measured', chars: {} }, adapterName: 'Test' });
        expect(await pending).toBe(false);
        expect(applied).toBe(false);
    });

    test('manual device type corrections follow identity aliases and are deleted with the device', async () => {
        const { plugin } = await fixture();
        plugin.settings = structuredClone(DEFAULT_SETTINGS);
        plugin.settings.deviceTypeOverrides = { old: 'tablet', target: 'phone' };
        plugin._remapDeviceTypeOverrides({ old: 'new' });
        expect(plugin.settings.deviceTypeOverrides).toEqual({ new: 'tablet', target: 'phone' });
        plugin._remapDeviceTypeOverrides({ new: 'target' });
        expect(plugin.settings.deviceTypeOverrides).toEqual({ target: 'phone' });
        plugin.saveSettings = async () => {};
        await plugin.removeDeviceFromPresets('target');
        expect(plugin.settings.deviceTypeOverrides).toEqual({});
    });
});

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
        expect(runtimeCss(doc)).toContain('app://desktop-session/Fonts/Test.TTF');
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
        expect(runtimeCss(doc)).toContain('http://localhost/_capacitor_file_/Fonts/Test.TTF');
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
        expect(runtimeCss(doc)).toContain('file:///mobile/Test.TTF');
    });

    test('popout receives updated font faces and removing faces clears every document', async () => {
        const { plugin, doc } = await fixture();
        const popout = documentDouble();
        plugin._fontDocuments.add(popout);
        plugin.applyCss(faces(plugin), 'local-font-loader-faces');
        expect(runtimeCss(popout)).toBe(runtimeCss(doc));
        plugin._removeGeneratedStyles('local-font-loader-faces');
        expect(popout.nodes.size).toBe(0);
        expect(doc.nodes.size).toBe(0);
        expect(runtimeCss(doc)).not.toContain('@font-face');
        expect(runtimeCss(popout)).not.toContain('@font-face');
        await plugin._snippetSync;
    });

    test('stylesheet reload and a newly opened window regain faces without changing static CSS', async () => {
        const { plugin, doc } = await fixture();
        const css = faces(plugin);
        plugin.applyCss(css, 'local-font-loader-faces');
        const applied = runtimeCss(doc);
        doc.stylesheet.textContent = stylesheetTemplate;
        const popout = documentDouble();
        plugin._trackFontDocument(popout);
        doc.stylesheetChanged();
        expect(runtimeCss(doc)).toBe(applied);
        expect(runtimeCss(popout)).toBe(applied);
        plugin._applyRuntimeFontFaces(css);
        expect(runtimeCss(doc)).toBe(applied);
        await plugin._snippetSync;
    });

    test('fonts applied before styles.css arrives are restored when Obsidian loads it', async () => {
        const { plugin, doc } = await fixture();
        doc.stylesheets.length = 0;
        plugin.applyCss(faces(plugin), 'local-font-loader-faces');
        expect(doc.stylesheet.textContent).not.toContain('@font-face');
        doc.stylesheets.push(doc.stylesheet);
        doc.stylesheetChanged(true);
        expect(runtimeCss(doc)).toContain('app://desktop-session/Fonts/Test.TTF');
        plugin._fontStyleObservers.get(doc).disconnect();
        doc.stylesheet.textContent = stylesheetTemplate;
        doc.stylesheetChanged();
        expect(doc.stylesheet.textContent).not.toContain('@font-face');
        await plugin._snippetSync;
    });

    test('legacy font nodes are removed while unrelated styles remain unchanged', async () => {
        const { plugin, doc } = await fixture();
        const unrelated = { nodeName: 'STYLE', textContent: 'body { color: red; }' };
        doc.stylesheets.unshift(unrelated);
        doc.nodes.set('local-font-loader-faces', {
            remove: () => doc.nodes.delete('local-font-loader-faces'),
        });
        plugin.applyCss(faces(plugin), 'local-font-loader-faces');
        expect(runtimeCss(doc)).toContain('@font-face');
        expect(unrelated.textContent).toBe('body { color: red; }');
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
        expect(runtimeCss(doc)).toContain('file:///mobile/Fonts/Test.TTF');
        expect(errors).toEqual([]);
    });

    test('missing font resource resolves to null and is logged instead of emitting a broken URL', async () => {
        const { plugin, errors } = await fixture();
        plugin.app.vault.adapter.getResourcePath = () => { throw new Error('missing font'); };
        expect(plugin._getFontResourceSrc(font)).toBeNull();
        expect(errors.length).toBe(1);
    });
});

// 复用空库夹具验证插件调用链，不触碰个人库；Exercise the plugin flow in the empty-vault fixture.
describe('device preset plugin flow', () => {
    test('copying another preset removes the current old binding, saves and applies the copied fonts', async () => {
        const { plugin } = await fixture();
        plugin.settings = structuredClone(DEFAULT_SETTINGS);
        plugin.currentDeviceId = 'current';
        const base = plugin.settings.presets[0];
        base.fonts.text = 'Copied font';
        plugin.settings.presets.push({ ...structuredClone(base), id: 'old', targetDevices: ['current'] });
        const calls: string[] = [];
        plugin.saveSettings = async () => { calls.push('save'); };
        plugin.applyFonts = async () => { calls.push(plugin._getDevicePreset().fonts.text); };
        await plugin.copyPresetForDevice(base.id, 'Copy');
        expect(plugin.settings.presets.filter((p: { targetDevices: string[] }) => p.targetDevices.includes('current'))).toHaveLength(1);
        expect(plugin._getDevicePreset().name).toBe('Copy');
        expect(calls).toEqual(['save', 'Copied font']);
    });

    test('explicit default binding does not recreate the default and missing default uses an independent clone', async () => {
        const { plugin } = await fixture();
        plugin.settings = structuredClone(DEFAULT_SETTINGS);
        plugin.currentDeviceId = 'fresh';
        plugin.settings.presets[0].targetDevices = ['other'];
        const snapshots: number[] = [];
        plugin._persistStartupState = async () => { snapshots.push(1); };
        await plugin._ensureDevicePreset();
        expect(plugin.settings.presets).toHaveLength(1);
        expect(snapshots).toEqual([]);
        plugin.settings.presets[0].id = 'custom';
        await plugin._ensureDevicePreset();
        expect(plugin.settings.presets).toHaveLength(2);
        expect(plugin.settings.presets[0].id).toBe('default-preset');
        expect(plugin.settings.presets[0].fonts).not.toBe(plugin.settings.presets[1].fonts);
        expect(snapshots).toEqual([1]);
    });

    test('startup inheritance sees the freshly registered model and preserves separate ids', async () => {
        const { plugin } = await fixture();
        plugin.settings = structuredClone(DEFAULT_SETTINGS);
        plugin.currentDeviceId = 'fresh';
        const info = { platform: 'mobile', os: 'android', model: 'PJZ110', hostname: '' };
        plugin.settings.deviceMeta = { old: info, fresh: { ...info } };
        plugin.settings.presets.push({ ...structuredClone(plugin.settings.presets[0]), id: 'reading', targetDevices: ['old'] });
        let saved = false;
        plugin._persistStartupState = async () => { saved = true; };
        await plugin._ensureDevicePreset();
        expect(plugin._getDevicePreset().id).toBe('reading');
        expect(Object.keys(plugin.settings.deviceMeta)).toEqual(['old', 'fresh']);
        expect(saved).toBe(true);
    });
});
