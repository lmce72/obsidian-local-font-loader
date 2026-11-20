import { afterEach, describe, expect, mock, test } from 'bun:test';

// 仅模拟宿主 API 的版本差异；Model host API availability, not browser rendering.
const frames: Array<() => void> = [];
function element(parentElement: ReturnType<typeof element> | null = null): {
    parentElement: ReturnType<typeof element> | null;
    ownerDocument: { defaultView: { requestAnimationFrame(callback: () => void): number } };
    scrollTop: number; scrollLeft: number;
} {
    return {
        parentElement, scrollTop: 0, scrollLeft: 0,
        ownerDocument: { defaultView: { requestAnimationFrame(callback) { frames.push(callback); return frames.length; } } },
    };
}
class SettingTabStub {
    app: unknown;
    containerEl = element();
    constructor(app: unknown) { this.app = app; }
    hide() {}
}
class Stub {}
mock.module('obsidian', () => ({
    App: Stub, Plugin: Stub, PluginSettingTab: SettingTabStub,
    Component: Stub, Setting: Stub, Notice: Stub, MarkdownRenderer: Stub,
    TextComponent: Stub, Modal: Stub, Menu: Stub, setIcon() {},
    AbstractInputSuggest: Stub, FuzzySuggestModal: Stub, TFolder: Stub,
    Platform: {}, getLanguage: () => 'en',
    normalizePath: (path: string) => path.replace(/\\/g, '/'),
}));
const { default: FontManagerSettingTab } = await import('../src/ui/settings-tab');
const hostPrototype = Object.getPrototypeOf(FontManagerSettingTab.prototype);
const originalUpdate = Object.getOwnPropertyDescriptor(hostPrototype, 'update');
const originalHide = Object.getOwnPropertyDescriptor(hostPrototype, 'hide');

function fixture() {
    const plugin = {
        app: { workspace: { on: () => ({}) } }, registerEvent() {}, _logError() {},
    };
    const tab = new FontManagerSettingTab(plugin.app as never, plugin as never);
    // Bun 的模块缓存可能复用其它测试的宿主桩；Supply host state even when another suite owns the mock.
    Object.assign(tab, { containerEl: element() });
    if (typeof hostPrototype.hide !== 'function') {
        Object.defineProperty(hostPrototype, 'hide', { configurable: true, value() {} });
    }
    tab._isVisible = true;
    return tab;
}
afterEach(() => {
    Reflect.deleteProperty(SettingTabStub.prototype, 'update');
    if (originalUpdate) Object.defineProperty(hostPrototype, 'update', originalUpdate);
    else Reflect.deleteProperty(hostPrototype, 'update');
    if (originalHide) Object.defineProperty(hostPrototype, 'hide', originalHide);
    else Reflect.deleteProperty(hostPrototype, 'hide');
    frames.length = 0;
});

describe('settings host compatibility', () => {
    test('pre-1.13 refresh uses display when the host has no update method', () => {
        const tab = fixture();
        let displayed = 0;
        tab._renderPage = () => { displayed++; };
        tab.update();
        expect(displayed).toBe(1);
    });

    test('modern refresh delegates to native definitions and restores ancestor scrolling', () => {
        const tab = fixture();
        const parent = element();
        parent.scrollTop = 320;
        parent.scrollLeft = 9;
        Object.assign(tab.containerEl, { parentElement: parent, scrollTop: 14 });
        let updated = 0;
        const update = {
            configurable: true,
            value() { updated++; parent.scrollTop = 0; tab.containerEl.scrollTop = 0; },
        };
        Object.defineProperty(hostPrototype, 'update', update);
        Object.defineProperty(SettingTabStub.prototype, 'update', update);
        tab.update();
        expect(updated).toBe(1);
        expect(parent.scrollTop).toBe(320);
        expect(parent.scrollLeft).toBe(9);
        expect(tab.containerEl.scrollTop).toBe(14);
    });

    test('hiding the tab invalidates queued scroll restoration', () => {
        const tab = fixture();
        const parent = element();
        parent.scrollTop = 320;
        Object.assign(tab.containerEl, { parentElement: parent });
        tab._renderPage = () => {};
        tab.update();
        tab.hide();
        parent.scrollTop = 7;
        while (frames.length) frames.shift()?.();
        expect(parent.scrollTop).toBe(7);
    });

    test('listeners cancel native events synchronously and contain rejected actions', async () => {
        const tab = fixture();
        let listener: ((event: Event) => void) | undefined;
        const target = { addEventListener: (_: string, callback: (event: Event) => void) => { listener = callback; } };
        const errors: unknown[] = [];
        tab.plugin._logError = (...args) => { errors.push(args); };
        tab._addEventListener(target as never, 'drop', async event => {
            event.preventDefault();
            throw new Error('test failure');
        });
        const event = new Event('drop', { cancelable: true });
        listener?.(event);
        expect(event.defaultPrevented).toBe(true);
        await Promise.resolve();
        expect(errors).toHaveLength(1);
    });

    test('failed source deletion preserves the configured font entry', async () => {
        const tab = fixture();
        const font = { name: 'Locked font', path: 'Fonts/Locked.ttf' };
        let saved = false;
        Object.assign(tab.plugin, {
            settings: { availableFonts: [font] },
            app: { vault: { adapter: {
                exists: async () => true,
                remove: async () => { throw new Error('Access denied'); },
            } } },
            saveSettings: async () => { saved = true; },
        });
        await tab.deleteSingleFont(font as never);
        expect(tab.plugin.settings.availableFonts).toContain(font);
        expect(saved).toBe(false);
    });
});
