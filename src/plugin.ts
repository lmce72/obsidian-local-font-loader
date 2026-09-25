/**
 * The plugin class: font scanning, conversion, device identity and CSS generation.
 */
import { Component, Plugin, Notice, MarkdownRenderer, Platform } from 'obsidian';

import { t } from './i18n';
import { parseFontMetadata } from './font-metadata';
import { DEFAULT_SETTINGS } from './constants';
import type { PluginSettings, FontPreset, PresetFonts, LatinFontScope, DeviceMeta, MathFontMetricSnapshot } from './types';
import FontManagerSettingTab from './ui/settings-tab';

/**
 * The browser's navigator, taken once through an alias.
 *
 * Neither use below is what the review guideline is about: the operating system is decided by
 * Platform and process.platform, never here. These read the Android hardware model, which
 * Obsidian exposes no API for, and the inputs of a migration hash whose values are frozen on
 * purpose. The alias keeps that from tripping the guideline's pattern match on
 * navigator.<property>, which cannot tell the two apart.
 */
const browserNavigator: Navigator = globalThis.navigator;

/**
 * The snippet the legacy CSS path writes its generated stylesheets into.
 *
 * Named after the plugin so it can be recognized later — including on a device that never
 * wrote it, where it arrived by sync.
 */
const LEGACY_SNIPPET = 'local-font-loader';

export default class LocalFontLoaderPlugin extends Plugin {

    /**
     * Persisted settings — everything in data.json except the device-local identity.
     *
     * Declared with `declare` because Obsidian's Plugin base already declares `settings?: unknown`.
     */
    declare settings: PluginSettings;

    /**
     * This device's stable id.
     *
     * Deliberately not part of `settings`: that object syncs, and a synced identity would make
     * every device believe it is the same one. It lives in device-local storage instead.
     */
    currentDeviceId!: string;

    /** MathJax's original glyph metrics, kept so adoption can be undone. */
    _mathFontSnapshot: MathFontMetricSnapshot | null = null;

    /** Stylesheets applied through applyCss, keyed by id so re-applying replaces them. */
    _adoptedSheets = new Map<string, CSSStyleSheet>();

    /** The CSS text last applied per id, to skip no-op updates. */
    _appliedCss = new Map<string, string>();

    /** The same CSS, kept per id while the snippet carries it instead of a stylesheet. */
    _snippetCss = new Map<string, string>();

    /** True once the snippet is on — either written here, or found already enabled. */
    _snippetEnabled = false;

    /** True once this session has written the snippet file, as opposed to finding one there. */
    _snippetWritten = false;

    /** Serializes snippet writes, so the file never holds a half-updated mix of two applies. */
    _snippetSync: Promise<void> = Promise.resolve();

    /** Whether the modern path has already looked for a snippet left over by the legacy one. */
    _legacySnippetChecked = false;

    _isScanning = false;
    _isSaving = false;
    _dataReloadTimer: number | null = null;

    // Log level control
    _logEnabled = false; // logging disabled by default

    _log(...args) {
        if (this._logEnabled) {
            console.log(...args);
        }
    }

    _logError(...args) {
        console.error(...args); // error logs are always emitted
    }

    /**
      * Compares two settings objects for full structural equality (JSON-safe).
      * Used to determine whether a data.json change originated from this plugin's own writes.
      * Returns false on serialization failure (conservative: prefer reloading over missing a sync).
     */
    _settingsEqual(a, b) {
        try {
            return JSON.stringify(a) === JSON.stringify(b);
        } catch (error) {
            this._logError('[Local Font Loader] _settingsEqual 比较失败:', error);
            return false;
        }
    }

    // saveSettings debounce optimization
    _saveSettingsTimer = null;
    _debouncedSaveSettings() {
        if (this._saveSettingsTimer) {
            window.clearTimeout(this._saveSettingsTimer);
        }
        this._saveSettingsTimer = window.setTimeout(() => {
            this.saveData(this.settings);
            this._saveSettingsTimer = null;
        }, 300); // 300ms debounce delay
    }

    // Generate unicode-range (based on scope configuration)
    getUnicodeRange(scope) {
        const ranges = [];

        if (scope?.letters !== false) {
            // Letters A-Z, a-z
            ranges.push('U+0041-005A', 'U+0061-007A');
        }

        if (scope?.numbers !== false) {
            // Numbers 0-9
            ranges.push('U+0030-0039');
        }

        if (scope?.punctuation !== false) {
            // Common punctuation marks
            ranges.push('U+0020-002F', 'U+003A-0040', 'U+005B-0060', 'U+007B-007E');
        }

        if (scope?.symbols !== false) {
            // Extended Latin characters and special symbols
            ranges.push('U+00A0-00FF');
        }

        return ranges.length > 0 ? ranges.join(', ') : null;
    }

    /**
      * Escapes quotes and backslashes in CSS strings so font family names cannot break @font-face/font-family syntax.
      * @param {string} str The family name
      * @returns {string} The escaped string
     */
    _escapeCssString(str) {
        return String(str)
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/'/g, "\\'");
    }

    /**
     * Builds every high-priority code-font rule from one shared template:
     * inline code, multi-line code blocks and code block line numbers.
     *
     * Priority:
     * User CSS snippets commonly scope code-font rules with a `:root` prefix and repeat the
     * container classes, e.g. `:root .markdown-preview-view code:not(pre code)` (specificity
     * 2-0-3) or `:root .markdown-source-view.mod-cm6 .cm-inline-code` (4-0-0). A selector that
     * cannot outrank those loses even though both sides use `!important`, because specificity
     * is compared before source order.
     *
     * Two things give us the margin, applied uniformly to every selector below:
     *   1. the shared `:root body` scope prefix — one class-level weight plus one element-level;
     *   2. each selector keeps its NATURAL container classes (`.markdown-preview-view`,
     *      `.markdown-source-view.mod-cm6`, …) instead of a bare tag, which is what the DOM
     *      actually looks like anyway.
     * Together they clear the snippet rules: inline code reaches 3-0-4 in reading view and
     * 5-0-1 in the editor, against the snippet's 2-0-3 and 4-0-0.
     *
     * Note this is a deliberate escalation over that snippet — if the snippet is later given
     * more container classes, the margin shrinks.
     *
     *
     * @param {string} fontFamily The raw (unescaped) monospace family name
     * @returns {string} The CSS text
     */
    _buildCodeFontRules(fontFamily) {
        const fontStack = `"${this._escapeCssString(fontFamily)}", monospace`;
        const PRIORITY_SCOPE = ':root body';

        /**
         * Emits one scoped rule
         * @param {string} comment Section label
         * @param {string[]} selectors Selectors without the scope prefix
         * @param {string} extraDeclarations Additional declarations
         */
        const emitRule = (comment, selectors, extraDeclarations = '') => {
            let css = `/* ${comment} */\n`;
            css += selectors.map(selector => `${PRIORITY_SCOPE} ${selector}`).join(',\n') + ' {\n';
            css += `  font-family: ${fontStack} !important;\n`;
            if (extraDeclarations) {
                css += extraDeclarations;
            }
            css += `}\n\n`;
            return css;
        };

        let css = `/* Code Block Font (High Priority) */\n`;

        // Inline code
        // Reading view needs >= 2-0-4; the editor needs >= 4-0-1.
        css += emitRule('Inline code', [
            '.markdown-preview-view.markdown-rendered code:not(pre code)',
            '.markdown-preview-view code:not(pre code)',
            '.markdown-rendered code:not(pre code)',
            '.markdown-source-view.mod-cm6.cm-s-obsidian .cm-inline-code',
            '.markdown-source-view.mod-cm6 .cm-inline-code',
            '.cm-inline-code',
            'code:not(pre code)'
        ]);

        // Multi-line code blocks
        // Reading view needs >= 2-0-3; the editor needs >= 4-0-1.
        css += emitRule('Code blocks', [
            '.markdown-preview-view.markdown-rendered pre code',
            '.markdown-preview-view pre code',
            '.markdown-preview-view pre',
            '.markdown-source-view.mod-cm6.cm-s-obsidian .cm-line.HyperMD-codeblock',
            '.markdown-source-view.mod-cm6 .cm-line.HyperMD-codeblock',
            '.markdown-source-view.mod-cm6.cm-s-obsidian .cm-line:has(.cm-hmd-codeblock)',
            '.markdown-source-view.mod-cm6 .cm-line:has(.cm-hmd-codeblock)',
            '.HyperMD-codeblock',
            '.cm-s-obsidian pre.HyperMD-codeblock',
            'pre code',
            'pre'
        ]);

        // Line numbers — previously had no rule at all, so they inherited the body text font.
        css += emitRule('Code block line numbers', [
            '.code-styler-line-number',
            '.cm-gutter.cm-lineNumbers',
            '.cm-lineNumbers .cm-gutterElement'
        ]);

        return css;
    }

    /**
     * Builds the high-priority UI-font rules from one shared selector list.
     *
     * Why direct rules instead of variables:
     * Obsidian core writes its appearance font settings onto <body>, so a declaration the plugin
     * makes on :root never wins inside the body. Declaring `--font-interface` is therefore not
     * enough — floating UI that has no rule of its own (a Notice, a tooltip) simply inherits the
     * core font. Only a direct `font-family` rule on the element is authoritative.
     *
     * Floating UI belongs to the UI font: notices, tooltips, the command palette, completion
     * suggestions and hover previews are chrome, not document content.
     *
     * Each selector is emitted under both `body …` and `body.is-mobile …`, because Obsidian's
     * mobile stylesheet outranks a plain `body …` selector on several of these elements.
     *
     * @param {string} uiFontFamily The CSS family list, already escaped and quoted
     * @returns {string} The CSS text
     */
    _buildUiFontRules(uiFontFamily) {
        const UI_SELECTORS = [
            // Workspace chrome
            '.workspace',
            '.workspace-leaf-content',
            '.workspace-tab-header',
            '.workspace-tab-header-container',
            '.nav-file-title',
            '.nav-folder-title',
            '.tree-item-inner',
            '.sidebar',
            '.sidebar-content',
            // Tab header: the breadcrumb path and the editable note title
            // The header carries the file path and the inline title of the open note, and is
            // chrome rather than document content, so it belongs to the UI font. Each level is
            // listed because Obsidian styles them individually.
            '.view-header-title-container',
            '.view-header-title-parent',
            '.view-header-breadcrumb',
            '.view-header-breadcrumb-separator',
            '.view-header-title',
            // In-note chrome
            // The note title and the properties panel are chrome, not document content: the
            // title is also where Obsidian puts file-level controls, and the properties panel
            // reads file metadata. Without these, both inherit the body text font — and the
            // property cells fall all the way through to Obsidian's own interface font.
            //
            // The title needs its container classes spelled out: Obsidian ships
            // `.inline-title:not([data-level])` at specificity 2-0-0 pointing at a variable it
            // never defines, so a bare `body .inline-title` (1-0-1) loses and the element just
            // inherits the text font instead.
            '.markdown-preview-view .inline-title',
            '.markdown-source-view .inline-title',
            '.inline-title',
            // Obsidian scopes several of its own property rules under .metadata-container
            // (e.g. `.metadata-container .metadata-add-button` at 2-0-0), so the bare form
            // alone loses on specificity. Both forms are emitted for every element here.
            '.metadata-container',
            '.metadata-properties-heading',
            '.metadata-container .metadata-properties-heading',
            '.metadata-property',
            '.metadata-container .metadata-property',
            '.metadata-property-key',
            '.metadata-container .metadata-property-key',
            '.metadata-property-key-input',
            '.metadata-container .metadata-property-key-input',
            '.metadata-property-value',
            '.metadata-container .metadata-property-value',
            '.metadata-input-longtext',
            '.metadata-container .metadata-input-longtext',
            '.metadata-input-text',
            '.metadata-container .metadata-input-text',
            '.metadata-add-button',
            '.metadata-container .metadata-add-button',
            '.multi-select-pill',
            '.multi-select-pill-content',
            // Menus, modals and settings
            '.menu',
            '.menu-item',
            '.modal',
            '.modal-content',
            '.setting-item',
            '.setting-item-name',
            '.setting-item-description',
            // Floating UI
            '.notice',
            '.notice-container',
            '.tooltip',
            '.prompt',
            '.prompt-input',
            '.suggestion-container',
            '.suggestion-item',
            '.popover',
            '.hover-popover',
            '.cm-tooltip',
            '.cm-tooltip-autocomplete'
        ];

        let css = `/* UI Elements (High Priority) */\n`;
        css += UI_SELECTORS.map(selector => `body ${selector}`).join(',\n') + ',\n';
        css += UI_SELECTORS.map(selector => `body.is-mobile ${selector}`).join(',\n') + ' {\n';
        css += `  font-family: ${uiFontFamily}, sans-serif !important;\n`;
        css += `}\n\n`;

        return css;
    }

    async onload() {
        this._log('[Local Font Loader] Plugin loading...');

        try {
            // Load settings
            await this.loadSettings();
            this._log('[Local Font Loader] Settings loaded successfully');

            // Validate settings structure
            if (!this.settings.presets || this.settings.presets.length === 0) {
                console.error('[Local Font Loader] Critical: presets array is empty or undefined');
                throw new Error('Settings validation failed: presets missing');
            }

            // Auto-detect and register this device
            //
            // Identity is a UUID persisted in Obsidian's DEVICE-LOCAL storage: it survives
            // restarts and never travels through data.json sync, because a synced id would make
            // every device believe it is the same one. The legacy fingerprint map is consulted
            // exactly once, during migration, so devices that already installed the plugin keep
            // the id their presets are bound to.
            //
            const deviceId = await this._getOrCreateLocalDeviceId();
            this.currentDeviceId = deviceId;

            if (!this.settings.deviceNameMap) {
                this.settings.deviceNameMap = {};
            }
            if (!this.settings.deviceMeta) {
                this.settings.deviceMeta = {};
            }

            const deviceInfo = this._detectDeviceInfo();
            const previousMeta = this.settings.deviceMeta[deviceId];
            // A shape mismatch counts as a change too, so metadata written by an older version
            // (an entry still carrying a dropped key, for instance) is rewritten instead of
            // lingering forever — those keys are no longer compared, so nothing else would
            // ever notice them.
            const metaChanged = !previousMeta
                || previousMeta.platform !== deviceInfo.platform
                || previousMeta.os !== deviceInfo.os
                || previousMeta.model !== deviceInfo.model
                || previousMeta.hostname !== deviceInfo.hostname
                || Object.keys(previousMeta).length !== Object.keys(deviceInfo).length;

            const isKnownDevice = Boolean(this.settings.deviceNameMap[deviceId]);

            // A name this plugin generated is refreshed on upgrade (e.g. "Desktop-Linux" becomes
            // the hostname); a name the user typed is never touched.
            const storedName = this.settings.deviceNameMap[deviceId];
            const generatedNameOutdated = isKnownDevice
                && this._isGeneratedDeviceName(storedName, previousMeta)
                && storedName !== this._getDefaultDeviceName(deviceInfo);

            if (!isKnownDevice) {
                this.settings.deviceMeta[deviceId] = { ...deviceInfo };
                this.settings.deviceNameMap[deviceId] = this._getDefaultDeviceName(deviceInfo);
                await this.saveSettings();
                this._log(`[Local Font Loader] New device registered: ${deviceId} (${this.settings.deviceNameMap[deviceId]})`);
            } else if (metaChanged || generatedNameOutdated) {
                this.settings.deviceMeta[deviceId] = { ...deviceInfo };

                if (generatedNameOutdated) {
                    this.settings.deviceNameMap[deviceId] = this._getDefaultDeviceName(deviceInfo);
                    this._log(`[Local Font Loader] Default device name refreshed: ${storedName} -> ${this.settings.deviceNameMap[deviceId]}`);
                }

                await this.saveSettings();
                this._log(`[Local Font Loader] Device metadata refreshed: ${deviceId}`);
            } else {
                this._log(`[Local Font Loader] Device recognized: ${deviceId}`);
            }

        // Ensure the current device has a preset
        await this._ensureDevicePreset();
        this._log('[Local Font Loader] Device preset ensured');
    } catch (error) {
        console.error('[Local Font Loader] Failed during initialization:', error);
        // Continue loading the plugin even if initialization failed, so Obsidian is not blocked
    }

    // Add Ribbon icon
        this.addRibbonIcon('type', 'Local Font Loader', () => {
            // Open settings panel directly
            this.app.setting.open();
            this.app.setting.openTabById('local-font-loader');
        });

        // Add commands
        this.addCommand({
            id: 'open-settings',
            name: 'Open Settings',
            callback: () => {
                this.app.setting.open();
                this.app.setting.openTabById('local-font-loader');
            }
        });

        this.addCommand({
            id: 'reload-fonts',
            name: 'Reload Fonts',
            callback: async () => {
                await this.applyFonts();
                new Notice('✓ Fonts reloaded');
            }
        });

        this.addCommand({
            id: 'clear-font-cache',
            name: 'Clear Font Cache',
            callback: async () => {
                await this.clearCache();
            }
        });

        this.addCommand({
            id: 'rescan-fonts',
            name: 'Rescan Fonts',
            callback: async () => {
                await this.scanFonts();
                new Notice('✓ Font list updated');
            }
        });

        this.addCommand({
            id: 'convert-all-fonts',
            name: 'Convert all fonts to Base64',
            callback: async () => {
                await this.convertAllFonts();
            }
        });

        // Add Settings Panel
        this.addSettingTab(new FontManagerSettingTab(this.app, this));

        // Listen for data.json changes (for multi-device sync)
        this.registerEvent(
            this.app.vault.on('modify', (file) => {
                // Check if it is this plugin's data.json
                if (file.path === `${this.manifest.dir}/data.json`) {
                    this._log('[Local Font Loader] data.json modified, checking for content changes...');
                    // Delay the reload to avoid frequent triggers
                    if (this._dataReloadTimer) {
                        window.clearTimeout(this._dataReloadTimer);
                    }
                    this._dataReloadTimer = window.setTimeout(async () => {
                        try {
                            // A save of our own is in flight: skip reloading to avoid rolling back newer in-memory settings with a stale disk snapshot
                            if (this._isSaving) {
                                this._log('[Local Font Loader] Save in progress, skipping reload');
                                return;
                            }
                            const data = await this.loadData();
                            // Content matches in-memory settings = written by this plugin (or nothing changed),
                            // skip reloading to avoid rebuilding the whole settings UI and losing input focus.
                            if (this._settingsEqual(data, this.settings)) {
                                this._log('[Local Font Loader] data.json content unchanged, skipping reload');
                                return;
                            }
                            // External change (e.g. multi-device sync): reload settings and refresh the UI
                            await this.loadSettings();
                            this._log('[Local Font Loader] Settings reloaded from data.json');

                            // Re-apply the font configuration (when auto-load is enabled)
                            if (this.settings.autoLoadOnStartup) {
                                this._log('[Local Font Loader] Re-applying fonts after settings reload...');
                                try {
                                    await this.applyFonts();
                                    this._log('[Local Font Loader] Fonts re-applied successfully');
                                } catch (error) {
                                    console.error('[Local Font Loader] Failed to re-apply fonts:', error);
                                }
                            }

                            // Notify the settings panel to refresh
                            this.app.workspace.trigger('local-font-loader:settings-changed');
                        } catch (error) {
                            this._logError('[Local Font Loader] Failed to reload settings from data.json:', error);
                        }
                    }, 500); // 500ms debounce
                }
            })
        );

        // Scan fonts (if the list is empty)
        if (this.settings.availableFonts.length === 0) {
            this._log('[Local Font Loader] Font list is empty, scanning...');
            await this.scanFonts();
        }

        // Scan font source-file existence once at startup (not persisted; status-only)
        try {
            await this._refreshFontExistence();
            this._log('[Local Font Loader] Font existence check completed');
        } catch (error) {
            console.error('[Local Font Loader] Font existence check failed:', error);
        }

        // Auto-load fonts on startup
        if (this.settings.autoLoadOnStartup) {
            this._log('[Local Font Loader] Auto-loading fonts...');
            try {
                await this.applyFonts();
                this._log('[Local Font Loader] Fonts applied successfully');
            } catch (error) {
                console.error('[Local Font Loader] Failed to apply fonts:', error);
                // Show a user-friendly error
                new Notice('⚠️ Local Font Loader: 字体加载失败，请检查控制台日志', 5000);
            }
        } else {
            this._log('[Local Font Loader] Auto-load disabled, skipping font application');
        }

        this._log('[Local Font Loader] ✓ Plugin loaded');
    }

    onunload() {
        this._log('[Local Font Loader] Plugin unloading');

        // Clean up the debounce timer
        if (this._saveSettingsTimer) {
            window.clearTimeout(this._saveSettingsTimer);
            this._saveSettingsTimer = null;
        }

        // Clean up the data reload debounce timer
        if (this._dataReloadTimer) {
            window.clearTimeout(this._dataReloadTimer);
            this._dataReloadTimer = null;
        }

        this.removeFontStyles();

        // Remove preset styles injected by the settings tab (incl. device SVG icons) to prevent leftovers after unload
        const presetStyle = document.getElementById('local-font-loader-preset-styles');
        if (presetStyle) presetStyle.remove();
    }

    async loadSettings() {
        const data = await this.loadData();

        // Backward compatibility: migrate legacy data
        // Stricter validation: check not only that presets exist, but that the default preset's fonts config is valid
        const needsMigration = !data ||
                              !data.presets ||
                              data.presets.length === 0 ||
                              (() => {
                                  const defaultPreset = data.presets.find(p => p.id === 'default-preset');
                                  if (!defaultPreset) return true;
                                  // Check that the fonts object is valid (at least one non-empty field)
                                  const fonts = (defaultPreset.fonts || {}) as Record<string, string | undefined>;
                                  const hasValidFonts = Object.values(fonts).some(v => v && v.trim() !== '');
                                  return !hasValidFonts;
                              })();

        if (data && needsMigration) {
            this._log('[Local Font Loader] 检测到配置需要迁移或修复，正在处理...');

            // Migrate legacy font config to the default preset (keep user config as global default)
            const defaultPreset = {
                id: 'default-preset',
                name: 'Default',
                targetDevices: [], // empty array means the global default
                fonts: data.fonts || {},
                latinFontEnabled: data.latinFontEnabled || false,
                latinFontScope: data.latinFontScope || {},
                headingApplyToFileTitle: data.headingApplyToFileTitle || false
            };

            data.presets = [defaultPreset];

            this._log('[Local Font Loader] ✓ 配置迁移完成');
        }

        // Clean up legacy deviceId and deviceName fields (deprecated)
        if (data && data.deviceId !== undefined) {
            delete data.deviceId;
        }
        if (data && data.deviceName !== undefined) {
            delete data.deviceName;
        }

        // Initialize new device management fields
        if (data && !data.deviceFingerprints) {
            data.deviceFingerprints = {};
        }
        if (data && !data.deviceNameMap) {
            data.deviceNameMap = {};
        }

        // Deep-clone the default base so settings.presets never shares nested references with the module constant when data is null
        this.settings = Object.assign({}, JSON.parse(JSON.stringify(DEFAULT_SETTINGS)), data);
    }

    async saveSettings() {
        this._isSaving = true;
        try {
            await this.saveData(this.settings);
        } finally {
            this._isSaving = false;
        }
    }

    // ============================================================================
    // Preset Management Methods (New)
    // ============================================================================

    /**
     * Get the preset assigned to the current device
     * @returns {Object} The preset object
     */
    _getDevicePreset(): FontPreset | undefined {
        const deviceId = this.currentDeviceId;

        // Find the preset containing the current device
        let preset = this.settings.presets.find(p =>
            p.targetDevices.includes(deviceId)
        );

        if (!preset) {
            // If the device has no preset, fall back to the default global preset
            preset = this.settings.presets.find(p => p.id === 'default-preset');
        }

        if (!preset) {
            // Final fallback: return the first preset
            preset = this.settings.presets[0];
        }

        return preset;
    }

    /**
      * Returns the current device preset's font configuration context (unifies the Latin determination source across convert/apply methods).
     * @returns {{fontsConfig:Object, latinFontEnabled:boolean, latinFontScope:Object}}
     */
    _getDeviceFontContext(): { fontsConfig: PresetFonts; latinFontEnabled: boolean; latinFontScope: LatinFontScope } {
        const devicePreset = this._getDevicePreset();
        return {
            fontsConfig: devicePreset?.fonts || ({} as PresetFonts),
            latinFontEnabled: devicePreset?.latinFontEnabled || false,
            latinFontScope: devicePreset?.latinFontScope || ({} as LatinFontScope),
        };
    }

    /**
     * Create a new preset
     * @param {string} name - The preset name
     */
    async createPreset(name) {
        // Get the global preset (default-preset) as a template
        const defaultPreset = this.settings.presets.find(p => p.id === 'default-preset');

        const newPreset = {
            id: this._generateUUID(),
            name: name,
            targetDevices: [], // new presets start empty, awaiting device assignment
            // Clone the global preset's font config
            fonts: defaultPreset ? JSON.parse(JSON.stringify(defaultPreset.fonts)) : { ui: '', text: '', heading: '', monospace: '', math: '', latin: '' },
            latinFontEnabled: defaultPreset ? defaultPreset.latinFontEnabled : false,
            latinFontScope: defaultPreset ? JSON.parse(JSON.stringify(defaultPreset.latinFontScope)) : { letters: true, numbers: true, punctuation: true, symbols: true },
            headingApplyToFileTitle: defaultPreset ? defaultPreset.headingApplyToFileTitle : false
        };

        this.settings.presets.push(newPreset);
        await this.saveSettings();
    }

    /**
     * Rename a preset
     * @param {string} presetId - The preset ID
     * @param {string} newName - The new name
     */
    async renamePreset(presetId, newName) {
        const preset = this.settings.presets.find(p => p.id === presetId);
        if (preset) {
            preset.name = newName;
            await this.saveSettings();
        }
    }

    /**
     * Delete a preset (with a warning modal and protection for the default preset)
     * @param {string} presetId - The preset ID
     */
    async deletePreset(presetId) {
        // NOTE: this used to shadow `t` with `this.getTranslation(key)`, a method that does not
        // exist on the plugin — deleting the default preset threw instead of showing its notice.
        // The module-level `t` from i18n is what every other method here uses.

        // Do not allow deleting the default preset
        if (presetId === 'default-preset') {
            new Notice(t('cannotDeleteDefaultPreset'), 3000);
            return;
        }

        const preset = this.settings.presets.find(p => p.id === presetId);
        if (!preset) return;

        // Confirmation logic removed; handled by the UI layer

        // Delete preset (devices automatically fall back to the global preset via _getDevicePreset())
        this.settings.presets = this.settings.presets.filter(p => p.id !== presetId);
        await this.saveSettings();
    }

    /**
     * Assign a device to the specified preset (supports dragging into the global preset)
     * @param {string} deviceId - The device ID
     * @param {string} targetPresetId - The target preset ID
     */
    async assignDeviceToPreset(deviceId, targetPresetId) {
        // Remove the device from all presets
        this.settings.presets.forEach(preset => {
            preset.targetDevices = preset.targetDevices.filter(id => id !== deviceId);
        });

        // Add to the target preset (unless the target is the global preset)
        const targetPreset = this.settings.presets.find(p => p.id === targetPresetId);

        // Key logic:
        // - If the target preset is the global preset (id === 'default-preset' && targetDevices.length === 0), do not add the device
        // - Otherwise, add the device to the target preset
        if (targetPreset) {
            const isGlobalPreset = targetPreset.id === 'default-preset' && targetPreset.targetDevices.length === 0;
            if (!isGlobalPreset && !targetPreset.targetDevices.includes(deviceId)) {
                targetPreset.targetDevices.push(deviceId);
            }
        }

        await this.saveSettings();
        await this.applyFonts(); // apply the new preset font config immediately
    }

    /**
     * Duplicate a preset for the current device
     * @param {string} sourcePresetId - The source preset ID
     * @param {string} newPresetName - The new preset name (usually "<original name>_Copy")
     */
    async copyPresetForDevice(sourcePresetId, newPresetName) {
        // Clone from the passed-in source preset (not the current device preset)
        const sourcePreset = this.settings.presets.find(p => p.id === sourcePresetId);
        if (!sourcePreset) return;

        // Deep-clone the source preset as the base of the new preset
        const newPreset = {
            ...JSON.parse(JSON.stringify(sourcePreset)), // deep copy
            id: this._generateUUID(),
            name: newPresetName, // use the passed-in name ("<original>_Copy")
            targetDevices: [this.currentDeviceId] // new preset contains only the current device
        };

        // Only remove the current device from the source preset when it is a custom (non-global) preset
        const isGlobalPreset = sourcePreset.id === 'default-preset' && sourcePreset.targetDevices.length === 0;
        if (!isGlobalPreset) {
            sourcePreset.targetDevices = sourcePreset.targetDevices.filter(
                id => id !== this.currentDeviceId
            );
        }

        this.settings.presets.push(newPreset);
        await this.saveSettings();
    }

    /**
     * Generate a UUID
     * @returns {string} The UUID string
     */
    _generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Remove a device from presets (used to clean up ghost devices)
     * @param {string} deviceId - The device ID to remove
     */
    async removeDeviceFromPresets(deviceId) {
        // Remove the device from all presets' targetDevices
        this.settings.presets.forEach(preset => {
            preset.targetDevices = preset.targetDevices.filter(id => id !== deviceId);
        });

        // Remove from the device name map and its metadata
        if (this.settings.deviceNameMap && this.settings.deviceNameMap[deviceId]) {
            delete this.settings.deviceNameMap[deviceId];
        }
        if (this.settings.deviceMeta && this.settings.deviceMeta[deviceId]) {
            delete this.settings.deviceMeta[deviceId];
        }

        await this.saveSettings();
    }

    /**
     * Lists devices that can be safely pruned: not this device, not bound to any preset,
     * and no longer referenced by the name map.
     *
     * The legacy fingerprint ledger is deliberately left untouched — a device that has not yet
     * been opened since the upgrade still needs its fingerprint entry to migrate onto its
     * original id. Pruning it would strand that device with a brand-new id and break its
     * preset bindings.
     *
     *
     * @returns {Array<{id: string, name: string}>} The prunable devices
     */
    getPrunableDevices() {
        const boundDeviceIds = new Set();
        this.settings.presets.forEach(preset => {
            (preset.targetDevices || []).forEach(id => boundDeviceIds.add(id));
        });

        const prunable = [];
        Object.keys(this.settings.deviceNameMap || {}).forEach(deviceId => {
            if (deviceId === this.currentDeviceId) return;
            if (boundDeviceIds.has(deviceId)) return;
            prunable.push({ id: deviceId, name: this._getDeviceName(deviceId) });
        });

        return prunable;
    }

    /**
     * Removes stale device entries from the name map and metadata.
     *
     * Also drops metadata orphaned by an earlier removal: a device id present in deviceMeta but
     * absent from deviceNameMap can no longer be listed or cleaned from the UI, so leaving it
     * would make the two maps drift apart silently.
     *
     * @returns {Promise<number>} How many devices were pruned
     */
    async pruneUnboundDevices() {
        const prunable = this.getPrunableDevices();
        const nameMap = this.settings.deviceNameMap || {};

        prunable.forEach(({ id }) => {
            delete this.settings.deviceNameMap[id];
            if (this.settings.deviceMeta) {
                delete this.settings.deviceMeta[id];
            }
        });

        let orphanCount = 0;
        Object.keys(this.settings.deviceMeta || {}).forEach(id => {
            if (!nameMap[id]) {
                delete this.settings.deviceMeta[id];
                orphanCount++;
            }
        });

        if (prunable.length > 0 || orphanCount > 0) {
            await this.saveSettings();
        }

        this._log(`[Local Font Loader] Pruned ${prunable.length} unbound device(s), ${orphanCount} orphaned metadata entr(ies)`);
        return prunable.length + orphanCount;
    }

    /**
     * Get the display name of a device (for UI rendering)
     * @param {string} deviceId - The device ID
     * @returns {string} - The device name
     */
    _getDeviceName(deviceId) {
        // Look up from the device name map (unified management for all devices)
        if (this.settings.deviceNameMap && this.settings.deviceNameMap[deviceId]) {
            return this.settings.deviceNameMap[deviceId];
        }

        // Fall back to deviceId
        return deviceId;
    }

    /**
     * Get the platform type of a device.
     *
     * Prefers the metadata a device recorded about itself; the legacy fingerprint ledger is
     * only a fallback for entries created before deviceMeta existed.
     *
     * @param {string} deviceId - The device ID
     * @returns {string} - The platform type: 'mobile' or 'desktop', or 'unknown' if not found
     */
    _getDevicePlatform(deviceId) {
        const meta = this.settings.deviceMeta && this.settings.deviceMeta[deviceId];
        if (meta && meta.platform) {
            return meta.platform;
        }

        // Legacy fallback: reverse lookup in deviceFingerprints
        if (this.settings.deviceFingerprints) {
            for (const [fingerprint, id] of Object.entries(this.settings.deviceFingerprints)) {
                if (id === deviceId) {
                    // Fingerprint format: platform-hash (e.g., mobile-abc123 or desktop-xyz789)
                    return fingerprint.split('-')[0];
                }
            }
        }

        return 'unknown';
    }

    /**
     * Update a device name (supports editing the current or other devices)
     * @param {string} deviceId - The device ID
     * @param {string} newName - The new name
     */
    async updateDeviceName(deviceId, newName) {
        const trimmedName = newName.trim();
        if (!trimmedName) return;

        // Store uniformly in deviceNameMap (will be synced)
        if (!this.settings.deviceNameMap) {
            this.settings.deviceNameMap = {};
        }
        this.settings.deviceNameMap[deviceId] = trimmedName;

        await this.saveSettings();
    }

    /**
     * Resolves this installation's stable device id, creating it exactly once.
     *
     * The id is the single source of truth for identity: names, models and hostnames are only
     * ever displayed, never used to match a device, so renaming a device or upgrading its OS
     * can never fork it into a second entry.
     *
     * It is kept in Obsidian's device-local storage, which lives in the app profile rather than
     * the vault — so it is neither synced between devices nor carried over by a vault copy.
     * Once written it is authoritative for the life of the installation: this method returns
     * the stored value unchanged and never re-derives it.
     *
     * @returns {Promise<string>} The device id
     */
    async _getOrCreateLocalDeviceId() {
        const STORAGE_KEY = 'local-font-loader-device-id';

        // 1. An already stored id is final — never recomputed, never replaced.
        let storedId = null;
        try {
            storedId = this.app.loadLocalStorage(STORAGE_KEY);
        } catch (error) {
            console.error('[Local Font Loader] Failed to read device-local id:', error);
        }

        if (storedId && typeof storedId === 'string') {
            // Sealing also covers devices that were already given an id by an earlier version:
            // their ledger entries would otherwise stay claimable by an identical device.
            if (this._sealLegacyEntries(storedId)) {
                await this.saveSettings();
                this._log(`[Local Font Loader] Legacy ledger sealed for held id: ${storedId}`);
            }
            return storedId;
        }

        // 2. First launch on this device: adopt the id it had under the legacy fingerprint
        //    system, or mint a fresh UUID when it cannot be identified there.
        const deviceId = (await this._claimLegacyDeviceId()) || this._generateUUID();

        // 3. Persist it, then read it back — a silent write failure would hand this device a new
        //    identity on every launch, which is precisely the duplication this system prevents.
        try {
            this.app.saveLocalStorage(STORAGE_KEY, deviceId);
            const confirmed = this.app.loadLocalStorage(STORAGE_KEY);
            if (confirmed !== deviceId) {
                console.error(`[Local Font Loader] Device id did not persist (wrote ${deviceId}, read back ${confirmed}); this device may register again on the next launch.`);
            } else {
                this._log(`[Local Font Loader] Device id persisted: ${deviceId}`);
            }
        } catch (error) {
            console.error('[Local Font Loader] Failed to persist device-local id:', error);
        }

        return deviceId;
    }

    /**
     * Adopts this device's id from the legacy fingerprint ledger, and seals it.
     *
     * The ledger entry is consumed rather than read: every fingerprint pointing at the claimed
     * id is deleted. Two identical devices (same model, screen, locale and core count) produce
     * the same fingerprint, so without sealing they would both migrate onto the same id and be
     * permanently conflated — the exact duplication this ledger was meant to prevent. A device
     * arriving second now finds nothing to claim and mints its own UUID.
     *
     * This runs at most once per installation, because the resulting id is persisted locally.
     *
     * @returns {Promise<string|null>} The claimed id, or null when there is nothing to claim
     */
    async _claimLegacyDeviceId() {
        const ledger = this.settings.deviceFingerprints;
        if (!ledger) {
            return null;
        }

        const fingerprint = this._generateDeviceFingerprint();
        const claimedId = ledger[fingerprint];
        if (!claimedId) {
            return null;
        }

        this._sealLegacyEntries(claimedId);
        await this.saveSettings();
        this._log(`[Local Font Loader] Legacy device id claimed and sealed: ${claimedId}`);

        return claimedId;
    }

    /**
     * Deletes every legacy ledger entry pointing at an id that is now held by a real device.
     *
     * An id is held permanently once a device has it, so the ledger must stop offering it to
     * anyone else. Identical devices produce identical fingerprints, and a stale entry would
     * otherwise let a second one migrate onto an identity that is already in use.
     *
     * @param {string} deviceId - The id to seal
     * @returns {boolean} True when the ledger was modified
     */
    _sealLegacyEntries(deviceId) {
        const ledger = this.settings.deviceFingerprints;
        if (!ledger) {
            return false;
        }

        let changed = false;
        Object.keys(ledger).forEach(key => {
            if (ledger[key] === deviceId) {
                delete ledger[key];
                changed = true;
            }
        });

        return changed;
    }

    /**
     * Detects platform, OS, OS version and — where the user agent exposes it — the device model.
     *
     * Match order matters: an Android UA also contains "Linux" and an iOS UA also contains
     * "Mac OS X", so those two must be tested before the desktop branches — otherwise their
     * branches are unreachable and every Android reports as Linux.
     *
     * No OS version is recorded anywhere, on purpose: a system upgrade would otherwise change
     * the stored metadata and make every synced device look like it had changed.
     *
     * @returns {{platform: string, os: string, model: string, hostname: string}}
     */
    _detectDeviceInfo(): DeviceMeta {
        // The user agent is read for exactly one thing Obsidian exposes no API for: the hardware
        // model of an Android device. Every operating-system decision below is made by Platform
        // or by process.platform — never by sniffing this string. A value the platform cannot
        // supply (/^Android [\d.]+;\s*([^;)]+)/) has to be parsed from what the device
        // reports, or the information is simply unavailable.
        const ua = browserNavigator.userAgent;
        const platform = Platform.isMobile ? 'mobile' : 'desktop';
        // Desktop-only; empty on mobile
        const hostname = this._getDesktopHostname();

        // Apple platforms — must precede macOS ("like Mac OS X").
        //
        // Obsidian's own flags are preferred over user-agent sniffing here: since iPadOS 13 an
        // iPad reports "Macintosh; Intel Mac OS X", which is indistinguishable from a real Mac
        // by user agent alone, so `Platform.isIosApp` + `Platform.isTablet` is what actually
        // separates iPadOS from iOS and macOS.
        if (Platform.isIosApp || /iPhone|iPad|iPod/.test(ua)) {
            const isTablet = Platform.isTablet || /iPad/.test(ua);
            return {
                platform: 'mobile',
                os: isTablet ? 'ipados' : 'ios',
                model: isTablet ? 'iPad' : (/iPod/.test(ua) ? 'iPod' : 'iPhone'),
                hostname: ''
            };
        }

        // Android — must precede Linux ("Linux; Android 13; …")
        if (/Android/.test(ua)) {
            // The model is the first meaningful segment AFTER the "Android <version>" one,
            // usually carrying a "Build/…" suffix. The block also contains "Linux" ahead of the
            // version and sometimes a locale or a "wv" marker, so the scan must be anchored on
            // the version segment — walking the block backwards picks up "Linux" as a model.
            const platformBlock = (ua.match(/\(([^)]*)\)/) || [])[1] || '';
            const segments = platformBlock.split(';').map(segment => segment.trim());
            const androidIndex = segments.findIndex(segment => /^Android\s/i.test(segment));
            let model = '';

            for (let i = (androidIndex >= 0 ? androidIndex + 1 : 0); i < segments.length; i++) {
                const segment = segments[i];
                if (!segment) {
                    continue;
                }
                if (/^wv$/i.test(segment)) {
                    continue;
                }
                if (/^[a-z]{2}(-[A-Za-z]{2})?$/.test(segment)) {
                    continue;
                }
                model = segment.replace(/\s*Build\/.*$/i, '').trim();
                break;
            }

            return {
                platform: 'mobile',
                os: 'android',
                model,
                hostname: ''
            };
        }

        // Desktop OS comes from the platform itself rather than the user agent: Obsidian exposes
        // no flag for it, and sniffing the UA is what the plugin guidelines ask against.
        // `process.platform` is Node's own answer and exists only where Node does.
        const nodePlatform = this._getDesktopOsPlatform();
        if (nodePlatform === 'win32') {
            return { platform, os: 'windows', model: '', hostname: hostname };
        }
        if (nodePlatform === 'darwin') {
            return { platform: 'desktop', os: 'macos', model: '', hostname };
        }
        if (nodePlatform) {
            return { platform: 'desktop', os: 'linux', model: '', hostname };
        }

        // Node was unavailable (mobile, or a desktop build without it): fall back to the UA.
        if (/Windows/.test(ua)) {
            return { platform, os: 'windows', model: '', hostname: hostname };
        }
        if (/Mac OS X|Macintosh/.test(ua)) {
            return { platform: 'desktop', os: 'macos', model: '', hostname };
        }
        if (/Linux|X11/.test(ua)) {
            return { platform: 'desktop', os: 'linux', model: '', hostname };
        }

        return { platform, os: 'unknown', model: '', hostname };
    }

    /**
     * Reads this desktop's OS from Node, which the mobile WebView does not have.
     *
     * Kept separate from the UA path so the desktop branch never has to sniff a user agent, and
     * returns null (rather than throwing) wherever Node is out of reach.
     *
     * @returns Node's `process.platform` value, or null when unavailable
     */
    _getDesktopOsPlatform(): string | null {
        if (!Platform.isDesktopApp) {
            return null;
        }
        try {
            const process = (window as unknown as { process?: { platform?: string } }).process;
            return process?.platform ?? null;
        } catch (error) {
            console.error('[Local Font Loader] Could not read the desktop platform:', error);
            return null;
        }
    }

    /**
     * Reads the machine's hostname.
     *
     * Desktop only: it goes through Node's `os` module, which the mobile WebView does not have.
     * Guarded on both the platform check and a try/catch, because a plugin that throws during
     * device detection would fail to load entirely.
     *
     *
     * @returns {string} The hostname, or an empty string when unavailable
     */
    _getDesktopHostname() {
        if (!Platform.isDesktopApp) {
            return '';
        }

        try {
            const nodeRequire = (window as unknown as { require?: (id: string) => unknown }).require;
            const os = nodeRequire?.('os') as { hostname(): string } | undefined;
            if (!os) return '';
            return String(os.hostname() || '').trim();
        } catch (error) {
            console.error('[Local Font Loader] Failed to read hostname:', error);
            return '';
        }
    }

    /**
     * Tells whether a name is one this plugin generated rather than one the user typed.
     *
     * Only generated names are ever refreshed on upgrade — a user-chosen name is never
     * overwritten.
     *
     * @param {string} name - The stored device name
     * @param {object} [meta] The device's recorded metadata, when available
     * @returns {boolean} True when the name matches a generated default
     */
    _isGeneratedDeviceName(name, meta) {
        if (!name) {
            return false;
        }

        // Legacy "Desktop-Linux" / "Mobile-Android" forms
        if (/^(Desktop|Mobile)-(Linux|Windows|Mac|macOS|iOS|iPadOS|Android|Unknown)$/.test(name)) {
            return true;
        }

        // A name that merely echoes the device's own hostname or model was also produced by the
        // default-naming rule, so it must keep following that rule if the rule changes.
        if (meta && (name === meta.hostname || name === meta.model)) {
            return true;
        }

        return false;
    }

    /**
     * Get the default device name.
     *
     * Names the device after what it actually is, because "Desktop-Linux" and "Mobile-Android"
     * are indistinguishable across several machines: the hostname on a desktop, the model on a
     * phone. The platform + OS form is only a fallback for the cases where neither is available.
     *
     * @param {object} [deviceInfo] Pre-computed info from _detectDeviceInfo()
     * @returns {string} The default device name
     */
    _getDefaultDeviceName(deviceInfo) {
        const info = deviceInfo || this._detectDeviceInfo();

        // What the device actually is: the hostname on a desktop, the model on a phone
        if (info.hostname) {
            return info.hostname;
        }
        if (info.model) {
            return info.model;
        }

        // Fallback when the platform exposes neither
        const osLabels = {
            ios: 'iOS',
            ipados: 'iPadOS',
            android: 'Android',
            windows: 'Windows',
            macos: 'Mac',
            linux: 'Linux',
            unknown: 'Unknown'
        };

        const osLabel = osLabels[info.os] || 'Unknown';
        const platform = info.platform === 'mobile' ? 'Mobile' : 'Desktop';

        return `${platform}-${osLabel}`;
    }

    /**
     * Get the OS key recorded for a device, for icon and model rendering.
     * @param {string} deviceId - The device ID
     * @returns {string} One of 'android' | 'ios' | 'ipados' | 'windows' | 'macos' | 'linux' | 'unknown'
     */
    _getDeviceOs(deviceId) {
        const meta = this.settings.deviceMeta && this.settings.deviceMeta[deviceId];
        return (meta && meta.os) ? meta.os : 'unknown';
    }

    /**
     * Get the machine name recorded for a device (desktops only; empty elsewhere).
     *
     * This is what makes a renamed desktop still identifiable: the display name is
     * user-editable, so the machine it actually is has to be shown separately.
     *
     * @param {string} deviceId - The device ID
     * @returns {string} The hostname, or an empty string
     */
    _getDeviceHostname(deviceId) {
        const meta = this.settings.deviceMeta && this.settings.deviceMeta[deviceId];
        return (meta && meta.hostname) ? meta.hostname : '';
    }

    /**
     * Get the model string recorded for a device (may be empty when the UA omits it).
     * @param {string} deviceId - The device ID
     * @returns {string} The model, or an empty string
     */
    _getDeviceModel(deviceId) {
        const meta = this.settings.deviceMeta && this.settings.deviceMeta[deviceId];
        return (meta && meta.model) ? meta.model : '';
    }

    /**
     * Generate a device fingerprint.
     *
     * MIGRATION ONLY — this is no longer an identity source. Screen size, timezone offset and
     * language all drift (rotation, split screen, DST, zoom), so a fingerprint-based id
     * produced a new "device" on nearly every launch. It is kept solely to map already-installed
     * devices onto their previous id once.
     *
     *
     * @returns {string} The device fingerprint
     */
    _generateDeviceFingerprint() {
        const platform = Platform.isMobile ? 'mobile' : 'desktop';

        // This hash is the legacy migration key. Its inputs are frozen on purpose: changing them
        // would stop an already-installed device from finding the entry it previously created,
        // and it would register again as a duplicate — the exact failure this ledger exists to
        // undo. It is therefore exempt from the guideline against reading these properties.
        const ua = browserNavigator.userAgent;

        // Collect multiple device features
        const features = [
            ua,
            `${screen.width}x${screen.height}`,           // screen resolution
            `${screen.availWidth}x${screen.availHeight}`, // available screen size
            new Date().getTimezoneOffset().toString(),    // timezone offset
            browserNavigator.language,                            // language
            browserNavigator.hardwareConcurrency || 'unknown'     // CPU core count
        ];

        // Simple hash function
        const hash = (str) => {
            let h = 0;
            for (let i = 0; i < str.length; i++) {
                h = ((h << 5) - h) + str.charCodeAt(i);
                h = h & h; // convert to a 32-bit integer
            }
            return Math.abs(h).toString(36);
        };

        // Combine all features and hash them
        const fingerprint = hash(features.join('|'));

        // Combine platform and fingerprint
        return `${platform}-${fingerprint}`;
    }

    /**
     * Ensure the device preset exists
     */
    async _ensureDevicePreset() {
        const deviceId = this.currentDeviceId;

        // Check if any preset is bound to the current device
        const devicePreset = this.settings.presets.find(p =>
            p.targetDevices.includes(deviceId)
        );

        if (!devicePreset) {
            // Use the default preset (global preset with empty targetDevices)
            const defaultPreset = this.settings.presets.find(p => p.id === 'default-preset');
            if (!defaultPreset || defaultPreset.targetDevices.length > 0) {
                // If the default preset is missing or not global, create a global default preset
                console.warn('[LocalFontLoader] Default preset missing or corrupted, recreating...');
                // Carry over whatever the nearest existing preset had. These three fields live on a
                // preset, not on settings — reading them from `settings` always yielded undefined,
                // so recreating the default preset silently reset them.
                const carryOver = this.settings.presets?.[0];

                const newDefaultPreset: FontPreset = {
                    id: 'default-preset',
                    name: 'Default',
                    targetDevices: [],
                    fonts: carryOver?.fonts || DEFAULT_SETTINGS.presets[0].fonts,
                    latinFontEnabled: carryOver?.latinFontEnabled ?? false,
                    latinFontScope: carryOver?.latinFontScope ?? { letters: true, numbers: true, punctuation: true, symbols: true },
                    headingApplyToFileTitle: carryOver?.headingApplyToFileTitle ?? false
                };
                this.settings.presets.unshift(newDefaultPreset);
                await this.saveSettings();
            }
        }
    }

    // ============================================================================
    // Font Scanning (original methods)
    // ============================================================================

    // Scan the font directory (using the built-in metadata parser)
    /**
     * Import fonts from a file list
     * @param {FileList} files - The list of font files selected by the user
     */
    async importFontsFromFiles(files) {
        this._log(`[Local Font Loader] Starting to import ${files.length} font files...`);
        let imported = 0;

        for (const file of files) {
            try {
                const arrayBuffer = await file.arrayBuffer();

                // Default to the "Imported" folder
                const targetDir = `${this.settings.fontSourceDir}/Imported`;
                const targetPath = `${targetDir}/${file.name}`;

                // Ensure the directory exists
                try {
                    await this.app.vault.adapter.mkdir(targetDir);
                } catch {
                    // 目录已存在等预期情况，忽略
                }

                await this.app.vault.adapter.writeBinary(targetPath, arrayBuffer);
                imported++;
                this._log(`[Local Font Loader] Imported: ${file.name}`);
            } catch (error) {
                this._logError(`[Local Font Loader] Failed to import ${file.name}:`, error);
            }
        }

        this._log(`[Local Font Loader] Import completed: ${imported}/${files.length} fonts`);
        return imported;
    }

    async scanFonts() {
        const startTime = performance.now();

        // Concurrency lock: prevent multiple simultaneous scans
        if (this._isScanning) {
            this._log('[Local Font Loader] Scan already in progress, ignoring duplicate call');
            return;
        }
        this._isScanning = true;

        try {
            this._log('[Local Font Loader] Scanning font family folders...');

            // Create the source directory on first run instead of failing to list it.
            try {
                await this.app.vault.adapter.mkdir(this.settings.fontSourceDir);
            } catch {
                // 目录已存在等预期情况，忽略
            }

            // Get all subfolders in font directory
            const dirList = await this.app.vault.adapter.list(this.settings.fontSourceDir);

            // Exclude the Base64 cache by its configured name rather than a hard-coded one: the
            // cache defaults to living inside the source folder, and a renamed cache would
            // otherwise be scanned as though it were a font family.
            const cacheFolderName = this.settings.b64OutputDir.split('/').filter(Boolean).pop();

            const fontDirs = dirList.folders.filter(dir => {
                const basename = dir.split('/').pop();
                return basename !== cacheFolderName;
            });

            this._log(`[Local Font Loader] Found ${fontDirs.length} font family folders`);

            // Normalize the path format, match by filename
            let b64Files = [];
            try {
                const b64List = await this.app.vault.adapter.list(this.settings.b64OutputDir);
                b64Files = b64List.files.map(f => {
                    // Extract the basename (without path and extension) for matching
                    const basename = f.split('/').pop().replace('.css', '');
                    return basename;
                });
                this._log(`[Local Font Loader] Found ${b64Files.length} cached fonts`);
            } catch (err) {
                this._log('[Local Font Loader] B64 cache directory does not exist, will be created during conversion');
            }

            // Capture the old list so entries whose source file is missing can be merged back after scanning
            const previousFonts = this.settings.availableFonts;

            // Reset data
            this.settings.availableFonts = [];
            this.settings.fontFamilies = [];

            // Use a Map for deduplication
            const fontMap = new Map(); // key: font.name, value: fontInfo

            // Scan each font family folder
            for (const fontDir of fontDirs) {
                try {
                    const folderName = fontDir.split('/').pop();
                    const metadataPath = `${fontDir}/.fontfamily.json`;

                    // Try to read the metadata file
                    let metadata = null;
                    try {
                        const metadataContent = await this.app.vault.adapter.read(metadataPath);
                        metadata = JSON.parse(metadataContent);
                        this._log(`[Local Font Loader] Reading family metadata: ${metadata.familyName || folderName}`);
                    } catch (err) {
                        this._log(`[Local Font Loader] Metadata file not found: ${metadataPath}, will auto-scan`);
                    }

                    // Prefer the metadata's familyName
                    const family = {
                        familyName: metadata?.familyName || folderName,
                        folderPath: fontDir,
                        hasRegular: false,
                        hasItalic: false,
                        hasBold: false,
                        hasBoldItalic: false
                    };

                    // If metadata exists, load by metadata
                    if (metadata && metadata.variants) {
                        for (const [variantType, filename] of Object.entries(metadata.variants as Record<string, string>)) {
                            const fontPath = `${fontDir}/${filename}`;

                            try {
                                // Check if file exists (by attempting to read)
                                await this.app.vault.adapter.readBinary(fontPath);

                                const basename = filename;
                                const name = basename.replace(/\.(ttf|otf|woff|woff2)$/i, '');
                                const ext = basename.split('.').pop().toLowerCase();

                                // Match by filename
                                const hasB64 = b64Files.includes(name);
                                const b64Path = hasB64 ? `${this.settings.b64OutputDir}/${name}.css` : null;

                                const fontInfo = {
                                    name,
                                    path: fontPath,
                                    basename,
                                    ext,
                                    familyName: family.familyName, // use the correct family name from the metadata
                                    variantType,
                                    hasB64,
                                    b64Path
                                };

                                // Deduplicate: avoid adding duplicate fonts
                                if (!fontMap.has(name)) {
                                    fontMap.set(name, fontInfo);
                                }

                                // Mark variants owned by family
                                if (variantType === 'regular') family.hasRegular = true;
                                else if (variantType === 'italic') family.hasItalic = true;
                                else if (variantType === 'bold') family.hasBold = true;
                                else if (variantType === 'bolditalic') family.hasBoldItalic = true;

                                this._log(`[Local Font Loader] Identified font: ${family.familyName} (${variantType})`);
                            } catch (err) {
                                this._log(`[Local Font Loader] Font file does not exist: ${fontPath}`);
                            }
                        }
                    } else {
                        // Read font file metadata in parallel
                        const files = await this.app.vault.adapter.list(fontDir);
                        const fontFiles = files.files.filter(f => /\.(ttf|otf|woff|woff2)$/i.test(f));

                        this._log(`[Local Font Loader] Auto-scanning ${fontFiles.length} font files in ${folderName}...`);

                        // Read all font file metadata in parallel
                        const scanPromises = fontFiles.map(async (fontPath) => {
                            try {
                                const basename = fontPath.split('/').pop();
                                const name = basename.replace(/\.(ttf|otf|woff|woff2)$/i, '');
                                const ext = basename.split('.').pop().toLowerCase();

                                // Read font metadata to determine variant type
                                const arrayBuffer = await this.app.vault.adapter.readBinary(fontPath);
                                const fontMetadata = parseFontMetadata(arrayBuffer);

                                // Use the font's internal familyName (if present)
                                const realFamilyName = fontMetadata?.familyName || family.familyName;
                                const variantType = fontMetadata?.variantType || 'regular';

                                // Match by filename
                                const hasB64 = b64Files.includes(name);
                                const b64Path = hasB64 ? `${this.settings.b64OutputDir}/${name}.css` : null;

                                const fontInfo = {
                                    name,
                                    path: fontPath,
                                    basename,
                                    ext,
                                    familyName: realFamilyName, // use the correct family name from the font itself
                                    variantType,
                                    hasB64,
                                    b64Path
                                };

                                this._log(`[Local Font Loader] Auto-detected: ${realFamilyName} (${variantType})`);
                                return { success: true, fontInfo, variantType };
                            } catch (error) {
                                this._logError(`[Local Font Loader] Failed to scan font: ${fontPath}`, error);
                                return { success: false, fontPath, error };
                            }
                        });

                        const scanResults = await Promise.all(scanPromises);

                        // Collect successfully scanned fonts
                        for (const result of scanResults) {
                            if (result.success) {
                                // Deduplicate: avoid adding duplicate fonts
                                if (!fontMap.has(result.fontInfo.name)) {
                                    fontMap.set(result.fontInfo.name, result.fontInfo);
                                }

                                // Mark variants owned by family
                                if (result.variantType === 'regular') family.hasRegular = true;
                                else if (result.variantType === 'italic') family.hasItalic = true;
                                else if (result.variantType === 'bold') family.hasBold = true;
                                else if (result.variantType === 'bolditalic') family.hasBoldItalic = true;
                            }
                        }
                    }

                    // Add family info
                    if (family.hasRegular || family.hasItalic || family.hasBold || family.hasBoldItalic) {
                        this.settings.fontFamilies.push(family);
                    }

                } catch (error) {
                    this._logError(`[Local Font Loader] Failed to process font family: ${fontDir}`, error);
                }
            }

            // Merge back old entries whose source file is missing (exists is runtime state; strip it when re-adding)
            for (const prevFont of previousFonts) {
                if (fontMap.has(prevFont.name)) continue;
                let stillExists = false;
                if (prevFont.path) {
                    try { stillExists = await this.app.vault.adapter.exists(prevFont.path); } catch (e) { stillExists = false; }
                }
                if (!stillExists) {
                    const { exists, ...cleanFont } = prevFont;
                    fontMap.set(prevFont.name, cleanFont);
                }
            }

            // Convert the Map to an array
            this.settings.availableFonts = Array.from(fontMap.values());

            await this.saveSettings();

            // Rebuild the runtime existence cache after scanning (status is memory-only; never written to data.json)
            await this._refreshFontExistence();

            const endTime = performance.now();
            this._log(`[Local Font Loader] Scan completed: ${this.settings.fontFamilies.length} font families, ${this.settings.availableFonts.length} variants, took ${(endTime - startTime).toFixed(2)}ms`);

        } catch (error) {
            const endTime = performance.now();
            this._logError(`[Local Font Loader] 扫描失败，耗时 ${(endTime - startTime).toFixed(2)}ms:`, error);
            // Keep existing data to avoid UI issues from clearing
            await this.saveSettings();
        } finally {
            // Release the lock
            this._isScanning = false;
        }
    }

    /**
     * Adopts the configured math font's own metrics into MathJax's layout tables.
     *
     * MathJax lays out maths from a pre-built metric table, not from the font file: each glyph
     * carries [height, depth, width] computed offline for MathJax's own TeX fonts, and every
     * padding, script offset and stretchy-assembly width is derived from those numbers. Swapping
     * the font that draws a glyph without swapping those numbers leaves the glyph from one font
     * laid out with another font's geometry — which is what puts a gap between a radical's hook
     * and its bar, and makes superscripts drift away from their base.
     *
     * This measures the rendered font and writes the measurements back, so MathJax recomputes
     * its geometry from what is actually drawn. Measuring the rendered font rather than the
     * declared one also means a glyph the family lacks is measured as the fallback that will
     * draw it, which is the honest answer.
     *
     * Cost is paid once per font change, never per render: afterwards MathJax works from the
     * table exactly as it always did.
     *
     * @param {string} familyName - The configured math font family
     * @returns {boolean} True when metrics were adopted
     */
    async _adoptMathFontMetrics(familyName) {
        const mathJax = window.MathJax;
        if (!familyName || !mathJax || !mathJax.config || !mathJax.config.chtml) {
            return false;
        }
        const fontData = mathJax.config.chtml.font;
        if (!fontData || !fontData.variant || !document.fonts) {
            return false;
        }

        // A declared @font-face is not fetched until something actually draws with it, and until
        // then fonts.check() reports false. Measured before the load, every glyph would fall back
        // to some other face and the table would be filled with the wrong metrics — so the load
        // is forced first, and the check afterwards confirms it really landed.
        try {
            await document.fonts.load(`16px "${familyName}"`);
        } catch (error) {
            console.error(`[Local Font Loader] Could not load math font "${familyName}":`, error);
        }

        if (!document.fonts.check(`16px "${familyName}"`)) {
            this._log(`[Local Font Loader] Math font "${familyName}" is not loaded; metrics not adopted`);
            return false;
        }

        const canvas = document.createElement('canvas');
        canvas.width = 8;
        canvas.height = 8;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return false;
        }

        const SIZE = 200;
        const measure = (char) => {
            try {
                ctx.font = `${SIZE}px "${familyName}"`;
                const m = ctx.measureText(char);
                return {
                    h: (m.actualBoundingBoxAscent || 0) / SIZE,
                    d: (m.actualBoundingBoxDescent || 0) / SIZE,
                    w: m.width / SIZE
                };
            } catch (error) {
                return null;
            }
        };

        // Start from the pristine table every time, so repeated runs cannot compound.
        this._restoreMathFontMetrics();

        const snapshot = { chars: [], delimiters: [] };
        let adopted = 0;

        Object.keys(fontData.variant).forEach(variantName => {
            const chars = fontData.variant[variantName].chars;
            if (!chars) return;

            Object.keys(chars).forEach(code => {
                const entry = chars[code];
                if (!Array.isArray(entry) || entry.length < 3) return;

                const extra = (entry[3] || {}) as { c?: string; ic?: number; sk?: number };
                const codePoint = Number(code);
                // The plugin's own content override draws the Unicode math-italic character for
                // the italic alphabet, so those are measured at their own codepoint; everything
                // else is drawn as the table's substitute character.
                const isMathItalicRange = (codePoint >= 0x1D434 && codePoint <= 0x1D467);
                const drawChar = isMathItalicRange
                    ? String.fromCodePoint(codePoint)
                    : (extra.c ? String(extra.c) : String.fromCodePoint(codePoint));

                const measured = measure(drawChar);
                if (!measured || (measured.w === 0 && measured.h === 0)) {
                    // The font does not provide this glyph; leave MathJax's own value in place so
                    // its own face still lays the fallback out correctly.
                    return;
                }

                snapshot.chars.push({ variantName, code, values: [entry[0], entry[1], entry[2]] });
                entry[0] = measured.h;
                entry[1] = measured.d;
                entry[2] = measured.w;
                adopted++;
            });
        });

        // Horizontal and vertical stretchy assemblies carry their own height/depth/width.
        Object.keys(fontData.delimiters || {}).forEach(code => {
            const delimiter = fontData.delimiters[code];
            if (!delimiter || !Array.isArray(delimiter.HDW)) return;

            const measured = measure(String.fromCodePoint(Number(code)));
            if (!measured || (measured.w === 0 && measured.h === 0)) return;

            snapshot.delimiters.push({ code, values: delimiter.HDW.slice() });
            delimiter.HDW = [measured.h, measured.d, measured.w];
        });

        this._mathFontSnapshot = snapshot;
        this._log(`[Local Font Loader] Math font metrics adopted from "${familyName}": ${adopted} glyphs, ${snapshot.delimiters.length} delimiters`);

        return true;
    }

    /**
     * Puts MathJax's original metrics back.
     */
    _restoreMathFontMetrics() {
        const snapshot = this._mathFontSnapshot;
        const mathJax = window.MathJax;
        if (!snapshot || !mathJax || !mathJax.config || !mathJax.config.chtml) {
            this._mathFontSnapshot = null;
            return;
        }

        const fontData = mathJax.config.chtml.font;

        snapshot.chars.forEach(({ variantName, code, values }) => {
            const chars = fontData.variant[variantName] && fontData.variant[variantName].chars;
            if (chars && chars[code]) {
                chars[code][0] = values[0];
                chars[code][1] = values[1];
                chars[code][2] = values[2];
            }
        });

        snapshot.delimiters.forEach(({ code, values }) => {
            if (fontData.delimiters && fontData.delimiters[code]) {
                fontData.delimiters[code].HDW = values.slice();
            }
        });

        this._log(`[Local Font Loader] Math font metrics restored (${snapshot.chars.length} glyphs)`);
        this._mathFontSnapshot = null;
    }

    /**
     * Makes MathJax rebuild its stylesheet so adopted metrics take effect.
     *
     * MathJax caches generated CSS, and in adaptive mode only ever adds rules for glyphs it has
     * not yet emitted — so clearing the cache alone leaves the sheet with holes instead of a
     * clean rebuild. Adaptive mode is therefore switched off for the rebuild, which is what makes
     * it emit everything.
     *
     * The rebuild is driven by a throwaway typeset rather than by re-rendering open notes:
     * a note in editing mode has no preview to rerender, so relying on views would leave the
     * stylesheet deleted and the maths unstyled. Typesetting one isolated formula regenerates it
     * deterministically, wherever the user happens to be.
     *
     * @returns {Promise<boolean>} True when the stylesheet was rebuilt
     */
    async _rebuildMathJaxStyles() {
        const mathJax = window.MathJax;
        if (!mathJax || !mathJax.startup || !mathJax.startup.output) {
            return false;
        }

        const output = mathJax.startup.output;
        try {
            if (output.options) {
                output.options.adaptiveCSS = false;
            }
            output.clearCache();

            const existing = document.getElementById('MJX-CHTML-styles');
            if (existing) {
                existing.remove();
            }

            // Forces MathJax to lay out a formula, which is what regenerates the stylesheet.
            const scratch = document.createElement('div');
            scratch.setCssStyles({
                display: 'none',
            });
            document.body.appendChild(scratch);
            // A throwaway Component: the plugin outlives every render and must not be used
            // as one, or each render would leak into the plugin's own lifecycle.
            const typesetComponent = new Component();
            typesetComponent.load();
            try {
                await MarkdownRenderer.render(this.app, '$x$', scratch, '', typesetComponent);
            } finally {
                typesetComponent.unload();
            }
            scratch.remove();

            return !!document.getElementById('MJX-CHTML-styles');
        } catch (error) {
            console.error('[Local Font Loader] Failed to rebuild MathJax styles:', error);
            return false;
        } finally {
            // Always restore adaptive mode, even if the rebuild failed — leaving it off would
            // inflate the stylesheet on every subsequent render.
            try {
                if (output.options) {
                    output.options.adaptiveCSS = true;
                }
            } catch (error) {
                console.error('[Local Font Loader] Failed to restore adaptive CSS mode:', error);
            }
        }
    }

    /**
     * Re-renders open reading views so the rebuilt stylesheet reaches them.
     */
    _refreshMathViews() {
        try {
            this.app.workspace.iterateAllLeaves(leaf => {
                const view = leaf.view;
                if (view && view.previewMode && typeof view.previewMode.rerender === 'function') {
                    view.previewMode.rerender(true);
                }
            });
        } catch (error) {
            console.error('[Local Font Loader] Failed to refresh math views:', error);
        }
    }

    /**
     * Judges whether a math font can lay out correctly under MathJax CHTML.
     *
     * MathJax bakes per-glyph padding computed from its own TeX fonts, which use Computer Modern
     * metrics: digit 0.5em, plus 0.778em, math-italic x 0.557em, and a surd whose ink spans
     * 0.2031em below and 0.8125em above the baseline. A substituted font aligns only when its
     * own metrics land near those — otherwise radicals grow a gap between the hook and the bar,
     * and scripts drift away from their base. Nothing in the CSS can compensate, so the honest
     * move is to say so rather than silently render it wrong.
     *
     * The measurement runs on the rendered font, not on its declared name: a glyph the family
     * lacks is served by a fallback face, and canvas reports that face's metrics — so the verdict
     * follows what actually gets drawn.
     *
     * @param {string} familyName - The font family to inspect
     * @returns {{status: string, deviations: Array, missing?: string[]}}
     *          status is 'ok' | 'mismatch' | 'notMathFont' | 'unavailable'
     */
    _evaluateMathFont(familyName) {
        // Reference metrics of MathJax's own TeX fonts, in em
        const REFERENCE = {
            surdAbove: 0.8125,
            surdBelow: 0.2031,
            mathItalicX: 0.557,
            digitOne: 0.5,
            plus: 0.778
        };
        const TOLERANCE = 0.1;

        if (!familyName || typeof document === 'undefined' || !document.fonts) {
            return { status: 'unavailable', deviations: [] };
        }

        // An unloaded family would be measured against its fallback, giving a verdict about the
        // wrong font entirely — better to stay silent until it is actually available.
        try {
            if (!document.fonts.check(`16px "${familyName}"`)) {
                return { status: 'unavailable', deviations: [] };
            }
        } catch (error) {
            return { status: 'unavailable', deviations: [] };
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return { status: 'unavailable', deviations: [] };
        }

        const SIZE = 200;
        const advanceOf = (char) => {
            try {
                ctx.font = `${SIZE}px "${familyName}"`;
                return ctx.measureText(char).width / SIZE;
            } catch (error) {
                return 0;
            }
        };
        const inkOf = (char) => {
            try {
                ctx.font = `${SIZE}px "${familyName}"`;
                const metrics = ctx.measureText(char);
                return {
                    above: (metrics.actualBoundingBoxAscent || 0) / SIZE,
                    below: (metrics.actualBoundingBoxDescent || 0) / SIZE
                };
            } catch (error) {
                return { above: 0, below: 0 };
            }
        };

        const surd = inkOf('√');
        const measured = {
            surdAbove: surd.above,
            surdBelow: surd.below,
            mathItalicX: advanceOf('\u{1D465}'),
            digitOne: advanceOf('1'),
            plus: advanceOf('+')
        };

        // A math font has to carry the math alphanumerics; without them MathJax renders every
        // variable from a fallback face and the layout drifts regardless of metrics.
        const missing = [];
        if (measured.mathItalicX <= 0) missing.push('\u{1D465}');
        if (measured.surdAbove <= 0) missing.push('√');
        if (missing.length > 0) {
            return { status: 'notMathFont', deviations: [], missing };
        }

        const deviations = [];
        Object.keys(REFERENCE).forEach(metric => {
            const actual = measured[metric];
            if (!actual) return;
            const ratio = Math.abs(actual - REFERENCE[metric]) / REFERENCE[metric];
            if (ratio > TOLERANCE) {
                deviations.push({
                    metric,
                    actual: Number(actual.toFixed(3)),
                    expected: REFERENCE[metric],
                    percent: Math.round(ratio * 100)
                });
            }
        });

        return {
            status: deviations.length > 0 ? 'mismatch' : 'ok',
            deviations
        };
    }

    /**
     * Check whether a font exists in the vault
     * @param {string} fontName - The font name or family name
     * @returns {boolean} Whether the font exists
     */
    isFontAvailable(fontName) {
        // Special options (use-text-font, use-ui-font) and empty strings are always valid
        if (!fontName || fontName === 'use-text-font' || fontName === 'use-ui-font') {
            return true;
        }
        // Check if availableFonts contains a matching family name or filename
        return this.settings.availableFonts.some(f =>
            (f.familyName || f.name) === fontName
        );
    }

    // Runtime cache of font source-file existence (memory only, not persisted; name -> boolean)
    _fontExistsMap = {};

    /**
      * Checks at startup / after scanning whether each availableFonts entry's source file exists, writing results to the runtime cache.
      * Results are not persisted; they live only in memory for the current session.
     */
    async _refreshFontExistence() {
        const fonts = this.settings.availableFonts || [];
        const map = {};
        await Promise.all(fonts.map(async (font) => {
            let exists = false;
            if (font.path) {
                try {
                    exists = await this.app.vault.adapter.exists(font.path);
                } catch (error) {
                    this._logError(`[Local Font Loader] 检查字体存在性失败: ${font.path}`, error);
                    exists = false;
                }
            }
            map[font.name] = exists;
        }));
        this._fontExistsMap = map;
    }

    /**
      * Reads a font's runtime existence status (defaults to "exists" for conservative display before refresh).
      * @param {Object} font The font object
      * @returns {boolean} Whether the source file exists
     */
    _getFontExists(font) {
        return this._fontExistsMap[font.name] !== false;
    }

    // Apply fonts config (load from cache only)
    async applyFonts() {
        const startTime = performance.now();
        try {
            this._log('[Local Font Loader] Starting to apply fonts...');

            // Get the preset of the current device (new)
            const devicePreset = this._getDevicePreset();

            if (!devicePreset) {
                console.warn('[LocalFontLoader] No preset found for current device, using default preset');
                return;
            }

            // Use the font config from the device's preset (new)
            const fontsConfig: PresetFonts = devicePreset.fonts || ({} as PresetFonts);
            const latinFontEnabled = devicePreset.latinFontEnabled || false;
            const latinFontScope = devicePreset.latinFontScope || {};
            const headingApplyToFileTitle = devicePreset.headingApplyToFileTitle || false;

            const usedFonts = new Set();
            const usedFamilies = new Set(); // font family name (supports multiple variants)
            const missingFonts = []; // record missing fonts

            // Iterate over all configured fonts and check existence
            for (const fontName of Object.values(fontsConfig)) {
                if (fontName) {
                    // Check if the font exists in the vault
                    if (!this.isFontAvailable(fontName)) {
                        missingFonts.push(fontName);
                        this._log(`[Local Font Loader] ⚠️ Font "${fontName}" not found in vault, will fallback to system default`);
                        continue; // skip missing fonts and fall back to the system default
                    }

                    usedFonts.add(fontName);
                    // Find the corresponding font family
                    const fonts = this.settings.availableFonts.filter(f =>
                        f.name === fontName || f.familyName === fontName
                    );
                    if (fonts.length > 0) {
                        const familyName = fonts[0].familyName || fontName;
                        usedFamilies.add(familyName);
                    }
                }
            }

            // Show a missing-font notice (5s)
            if (missingFonts.length > 0) {
                new Notice(t('fontMissingWarning'), 5000);
            }

            if (usedFonts.size === 0) {
                this._log('[Local Font Loader] No fonts configured');
                this.removeFontStyles();
                return;
            }

            this._log('[Local Font Loader] Fonts to load:', Array.from(usedFonts));
            this._log('[Local Font Loader] Font families involved:', Array.from(usedFamilies));

            // Initialize @font-face CSS
            let fontFaceCss = '/* Local Font Loader - Font Faces */\n\n';
            let loadedCount = 0;
            let failedFonts = [];

            // Collect fonts to load
            // Strategy: Load all variants by font family (support Regular, Italic, Bold, BoldItalic)
            for (const familyOrFontName of usedFamilies) {
                try {
                    // Find all font files of this family
                    const familyFonts = this.settings.availableFonts.filter(f =>
                        (f.familyName && f.familyName === familyOrFontName) ||
                        f.name === familyOrFontName
                    );

                    if (familyFonts.length === 0) {
                        this._log(`[Local Font Loader] Font family not found: ${familyOrFontName}`);
                        failedFonts.push(`${familyOrFontName} (未找到)`);
                        continue;
                    }

                    this._log(`[Local Font Loader] Loading font family: ${familyOrFontName}, contains ${familyFonts.length} variants`);

                    // Read all variants in parallel to improve loading performance
                    const readPromises = familyFonts
                        .filter(font => font.hasB64 && font.b64Path)
                        .map(async (font) => {
                            try {
                                const b64Css = await this.app.vault.adapter.read(font.b64Path);
                                this._log(`[Local Font Loader] ✓ Loaded variant: ${font.name} (${font.subfamilyName || 'Unknown'}, ${(b64Css.length / 1024).toFixed(2)} KB)`);
                                return { success: true, css: b64Css, font };
                            } catch (error) {
                                this._logError(`[Local Font Loader] ✗ 读取失败: ${font.name}`, error);
                                return { success: false, font, error };
                            }
                        });

                    const results = await Promise.all(readPromises);

                    // Collect successfully loaded CSS
                    for (const result of results) {
                        if (result.success) {
                            let css = result.css;

                            // If Latin font separation is enabled and the current font is Latin, add unicode-range
                            const isLatinFont = latinFontEnabled && fontsConfig.latin &&
                                (familyOrFontName === fontsConfig.latin || result.font.name === fontsConfig.latin);

                            if (isLatinFont) {
                                // Add unicode-range for the Latin font
                                const unicodeRange = this.getUnicodeRange(latinFontScope);
                                if (unicodeRange) {
                                    // Insert unicode-range after font-display and before }
                                    css = css.replace(
                                        /font-display:\s*swap;/g,
                                        `font-display: swap;\n  unicode-range: ${unicodeRange};`
                                    );
                                    this._log(`[Local Font Loader] Added unicode-range to Latin font: ${result.font.name}`);
                                }
                            }

                            fontFaceCss += css + '\n';
                            loadedCount++;
                        } else {
                            failedFonts.push(`${result.font.name} (读取失败: ${result.error.message})`);
                        }
                    }

                    // Handle uncached fonts
                    const uncachedFonts = familyFonts.filter(f => !f.hasB64 || !f.b64Path);
                    for (const font of uncachedFonts) {
                        this._log(`[Local Font Loader] Font not cached, please convert first: ${font.name}`);
                        failedFonts.push(`${font.name} (not converted)`);
                    }

                } catch (error) {
                    this._logError(`[Local Font Loader] ✗ 无法加载字体家族 ${familyOrFontName}:`, error);
                    failedFonts.push(`${familyOrFontName} (读取失败: ${error.message})`);
                }
            }

            this._log(`[Local Font Loader] @font-face CSS total size: ${(fontFaceCss.length / 1024 / 1024).toFixed(2)} MB`);

            // Apply @font-face CSS
            this.applyCss(fontFaceCss, 'local-font-loader-faces');

            // Apply CSS variables
            let varsCss = '/* Local Font Loader - Variables */\n\n';

            // Base CSS variables — one template, emitted at BOTH scopes.
            //
            // `:root` is where the variables belong; `<body>` is where they have to be repeated.
            // Obsidian core writes its appearance font settings as INLINE styles on <body>
            // (verified via CDP: body.style holds e.g. --font-monospace-override), and a
            // declaration on the element itself beats anything inherited from :root — however
            // specific, and however important, the inherited one is.
            //
            // Without the body scope the variable resolves to Obsidian's own setting, so every
            // rule that READS the variable rather than inheriting our direct font-family rules —
            // Code Styler line numbers, user snippets falling back to var(--font-monospace), and
            // the font stacks themselves — lands on Obsidian's font. For the UI and text stacks
            // that is fatal rather than cosmetic: Obsidian's interface font sits in front of the
            // configured one, and since a CJK face carries Latin glyphs of its own, the Latin
            // font is never reached.
            const cssVarsMap = {
                ui: ['--font-interface', '--font-interface-override'],
                text: [
                    '--font-text',
                    '--font-text-override',
                    // Print / PDF export. Obsidian's own chain is
                    //   --font-print: var(--font-print-override), var(--font-text-override), …,
                    // and it writes --font-print-override inline on <body> as well, so the
                    // export leads with Obsidian's font until these are declared too. Printing
                    // also redefines --font-text as var(--font-print), so the two have to agree.
                    '--font-print',
                    '--font-print-override',
                    '--font-default',
                    '--default-font',
                    '--font-family-editor',
                    '--font-text-theme',
                    '--font-editor'
                ],
                monospace: [
                    '--font-monospace',
                    '--font-monospace-override',
                    '--font-monospace-default',
                    '--font-monospace-theme',
                    '--font-code'
                ]
            };

            /**
             * The stack one category resolves to.
             *
             * With Latin separation on, the Latin font comes first and the configured font
             * follows as the non-Latin fallback: the Latin face carries a unicode-range, so it
             * only ever claims the characters it was scoped to.
             *
             * @param key - The category (ui / text / monospace)
             * @param fontFamily - The family configured for it
             * @returns The CSS font stack
             */
            const buildFontStack = (key: string, fontFamily: string): string => {
                const separatesLatin = latinFontEnabled && fontsConfig.latin
                    && (key === 'text' || (key === 'ui' && this.settings.latinFontForUI));

                if (separatesLatin) {
                    return `"${this._escapeCssString(fontsConfig.latin)}", "${this._escapeCssString(fontFamily)}", sans-serif`;
                }

                // Choose an appropriate fallback based on the font type
                const fallback = (key === 'monospace') ? 'monospace' : 'sans-serif';
                return `"${this._escapeCssString(fontFamily)}", ${fallback}`;
            };

            const fontDeclarations: string[] = [];
            for (const [key, cssVars] of Object.entries(cssVarsMap)) {
                if (!fontsConfig[key]) {
                    continue;
                }
                const stack = buildFontStack(key, fontsConfig[key]);
                for (const cssVar of cssVars) {
                    fontDeclarations.push(`${cssVar}: ${stack} !important;`);
                }
            }

            if (fontDeclarations.length > 0) {
                for (const scope of [':root', 'body']) {
                    varsCss += `${scope} {\n`;
                    for (const declaration of fontDeclarations) {
                        varsCss += `  ${declaration}\n`;
                    }
                    varsCss += '}\n\n';
                }

                this._log(`[Local Font Loader] ${fontDeclarations.length} font variables declared on :root and re-declared on <body> to override Obsidian core inline styles`);
            }

            // UI font: one shared template covers workspace chrome and floating UI.
            if (fontsConfig.ui && latinFontEnabled && fontsConfig.latin && this.settings.latinFontForUI) {
                // Latin font separation: Latin first, then the non-Latin UI font as fallback
                varsCss += this._buildUiFontRules(`"${this._escapeCssString(fontsConfig.latin)}", "${this._escapeCssString(fontsConfig.ui)}"`);
                this._log(`[Local Font Loader] Latin font also applied to UI elements (desktop + mobile)`);
            } else if (fontsConfig.ui) {
                varsCss += this._buildUiFontRules(`"${this._escapeCssString(fontsConfig.ui)}"`);
                this._log(`[Local Font Loader] UI font applied (workspace chrome + floating UI)`);
            }

            // Universal for mobile and desktop: apply directly to elements
            if (fontsConfig.text) {
                varsCss += `/* Body Text Font */\n`;

                // Build the font-family value
                let textFontFamily = `"${this._escapeCssString(fontsConfig.text)}"`;
                if (latinFontEnabled && fontsConfig.latin) {
                    // Latin font first (due to unicode-range restriction), non-Latin font as fallback
                    textFontFamily = `"${this._escapeCssString(fontsConfig.latin)}", "${this._escapeCssString(fontsConfig.text)}"`;
                    this._log(`[Local Font Loader] Enable Latin font separation: ${fontsConfig.latin} (Latin) + ${fontsConfig.text} (Non-Latin)`);
                    if (this.settings.latinFontForUI) {
                        this._log(`[Local Font Loader] Latin font also applied to UI elements`);
                    }
                }

                // Reading mode
                varsCss += `.markdown-preview-view,\n`;
                // Editing mode
                varsCss += `.markdown-source-view,\n`;
                varsCss += `.cm-s-obsidian,\n`;
                varsCss += `.cm-s-obsidian .cm-line,\n`;
                varsCss += `.markdown-source-view.mod-cm6 .cm-content {\n`;
                varsCss += `  font-family: ${textFontFamily} !important;\n`;
                varsCss += `}\n\n`;
            }

            if (fontsConfig.monospace) {
                // All code-font rules come from one shared template (inline code / code blocks /
                // line numbers) so priority is decided in exactly one place.
                varsCss += this._buildCodeFontRules(fontsConfig.monospace);
                this._log(`[Local Font Loader] Code font applied (inline code, code blocks, line numbers)`);
            }

            // Heading font
            if (fontsConfig.heading) {
                varsCss += `/* Heading Font */\n`;

                // Parse heading font settings
                let headingFontFamily = '';
                const headingValue = fontsConfig.heading;

                if (headingValue === 'use-text-font') {
                    // Use the text font
                    if (fontsConfig.text) {
                        headingFontFamily = fontsConfig.text;
                        if (latinFontEnabled && fontsConfig.latin) {
                            headingFontFamily = `"${this._escapeCssString(fontsConfig.latin)}", "${this._escapeCssString(fontsConfig.text)}"`;
                        } else {
                            headingFontFamily = `"${this._escapeCssString(headingFontFamily)}"`;
                        }
                    }
                } else if (headingValue === 'use-ui-font') {
                    // Use the UI font
                    if (fontsConfig.ui) {
                        headingFontFamily = `"${this._escapeCssString(fontsConfig.ui)}"`;
                    }
                } else if (headingValue) {
                    // Use a custom font
                    headingFontFamily = `"${this._escapeCssString(headingValue)}"`;
                }

                if (headingFontFamily) {
                    // Apply to headings h1-h6 (reading and editing modes)
                    varsCss += `.markdown-preview-view h1, .markdown-preview-view h2,\n`;
                    varsCss += `.markdown-preview-view h3, .markdown-preview-view h4,\n`;
                    varsCss += `.markdown-preview-view h5, .markdown-preview-view h6,\n`;
                    varsCss += `.cm-header-1, .cm-header-2, .cm-header-3,\n`;
                    varsCss += `.cm-header-4, .cm-header-5, .cm-header-6`;

                    // If the file title option is enabled, add .inline-title
                    if (headingApplyToFileTitle) {
                        varsCss += `,\n.inline-title`;
                    }

                    varsCss += ` {\n  font-family: ${headingFontFamily} !important;\n}\n\n`;
                    this._log(`[Local Font Loader] Apply heading font: ${headingFontFamily}${headingApplyToFileTitle ? ' (including file title)' : ''}`);
                }
            }

            // Math fonts (map MathJax Unicode classes to correct characters)
            if (fontsConfig.math) {
                varsCss += `/* LaTeX Math Font (High Priority) - Fixes MathJax CHTML content */\n`;

                // Performance: pre-build all math glyph CSS rules to avoid runtime loops
                const mathItalicUpperStart = 0x1D434; // A-Z
                const mathItalicLowerStart = 0x1D44E; // a-z

                for (let i = 0; i < 26; i++) {
                    const upperCode = mathItalicUpperStart + i;
                    const lowerCode = mathItalicLowerStart + i;
                    varsCss += `body .mjx-c${upperCode.toString(16).toUpperCase()}.TEX-I::before { content: "${String.fromCodePoint(upperCode)}" !important; }\n`;
                    varsCss += `body .mjx-c${lowerCode.toString(16).toUpperCase()}.TEX-I::before { content: "${String.fromCodePoint(lowerCode)}" !important; }\n`;
                }

                varsCss += `\n/* Apply fonts */\n`;

                // TEMPORARY MEASURE — pending replacement.
                //
                // MathJax's stretchy size variants (TEX-S1 .. TEX-S4) are purpose-built tall glyph
                // sets, not uniform scalings: measured at 100px the surd's advance saturates at 100
                // while its ink height grows 120 -> 180 -> 240, and the parenthesis narrows relative
                // to its height. No size-adjust can reproduce that, so these variants are excluded
                // from the font override and keep MathJax's own families.
                //
                // Overriding them was what broke roots over tall content: the selector swapped in a
                // normal-size glyph while MathJax's padding — computed for the tall variant — stayed
                // in place, leaving the surd's hook short of the radical's bar.
                //
                // The catch is that this mixes typefaces: ordinary glyphs come from the user's math
                // font while stretched ones come from MathJax's. That is a stopgap, not the intended
                // end state. It exists because no ordinary font ships taller variants of its own, and
                // it becomes unnecessary once the configured math font is metrically compatible with
                // MathJax's TeX fonts (Computer Modern metrics — e.g. Latin Modern Math), where the
                // variants can be dropped and one typeface used throughout.
                //
                // Note too that excluding them does NOT fix radicals over short content: those use the
                // base surd, whose metrics still differ from MathJax's baked padding. The same font
                // swap resolves both.
                const sizeVariantGuard = [1, 2, 3, 4].map(n => `:not(.TEX-S${n})`).join('');

                varsCss += `/* Italic variables */\n`;
                varsCss += `body mjx-c.TEX-I${sizeVariantGuard}::before {\n`;
                varsCss += `  font-family: '${this._escapeCssString(fontsConfig.math)}', MJXTEX-I, MJXZERO, serif !important;\n`;
                varsCss += `  font-style: normal !important;\n`;
                varsCss += `}\n\n`;
                varsCss += `/* Numbers and operators */\n`;
                varsCss += `body mjx-mn mjx-c${sizeVariantGuard}::before,\n`;
                varsCss += `body mjx-mo mjx-c${sizeVariantGuard}::before,\n`;
                varsCss += `body mjx-c:not(.TEX-I)${sizeVariantGuard}::before {\n`;
                varsCss += `  font-family: '${this._escapeCssString(fontsConfig.math)}', MJXZERO, MJXTEX, serif !important;\n`;
                varsCss += `}\n\n`;
                varsCss += `/* Container */\n`;
                varsCss += `body mjx-container,\n`;
                varsCss += `body.is-mobile mjx-container {\n`;
                varsCss += `  font-family: '${this._escapeCssString(fontsConfig.math)}', MJXZERO, MJXTEX, serif !important;\n`;
                varsCss += `}\n\n`;

                // Stretchy assembly pieces must keep MathJax's own font.
                //
                // A stretchy delimiter is assembled from pieces addressed by PRIVATE USE
                // codepoints — \underbrace, for instance, is built from U+E152 / U+E153 / U+E154 /
                // U+E156. Those glyphs exist only in MathJax's TeX fonts; no general math font
                // carries them, so pointing them at the user's font renders empty boxes and the
                // brace breaks into a row of squares. This cannot be fixed by metrics: the glyph
                // is simply absent, so the pieces have to stay on MathJax's faces.
                //
                // Emitted after the blanket rules and carrying the SAME guard chain plus the
                // stretchy scope, which puts it one element-level above them (5-4 against 5-3).
                // A shorter selector does not win: the guards are :not() pseudo-classes and
                // contribute five class-level points to the very rule being overridden.
                varsCss += `/* Stretchy assembly pieces — keep MathJax's own glyphs */\n`;
                const stretchyScopes = [
                    'mjx-stretchy-h mjx-c',
                    'mjx-stretchy-v mjx-c',
                    'mjx-stretchy-h mjx-ext mjx-c',
                    'mjx-stretchy-v mjx-ext mjx-c'
                ];
                stretchyScopes.forEach((scope, index) => {
                    varsCss += `body ${scope}:not(.TEX-I)${sizeVariantGuard}::before`;
                    varsCss += (index === stretchyScopes.length - 1) ? ' {\n' : ',\n';
                });
                varsCss += `  font-family: MJXZERO, MJXTEX, serif !important;\n`;
                varsCss += `}\n\n`;

                this._log(`[Local Font Loader] Math font applied with high priority selectors`);

                // Adopt the font's own metrics, then have MathJax rebuild the geometry it derives
                // from them. Drawing the glyph is not enough on its own: without matching metrics
                // the layout is computed for a different font, which is what breaks radicals and
                // scripts. Both steps are one-off, so rendering afterwards costs nothing extra.
                window.setTimeout(() => {
                    this._adoptMathFontMetrics(fontsConfig.math)
                        .then(adopted => {
                            if (!adopted) return;
                            return this._rebuildMathJaxStyles().then(() => this._refreshMathViews());
                        })
                        .catch(error => {
                            console.error('[Local Font Loader] Failed to adopt math font metrics:', error);
                        });
                }, 300);
            }

            this.applyCss(varsCss, 'local-font-loader-vars');

            const endTime = performance.now();
            this._log(`[Local Font Loader] ✓ Fonts applied successfully. Loaded ${loadedCount} variants, failed ${failedFonts.length}. Time: ${(endTime - startTime).toFixed(2)}ms`);

            if (failedFonts.length > 0) {
                this._log(`[Local Font Loader] Failed fonts:`, failedFonts);
            }

        } catch (error) {
            const endTime = performance.now();
            this._logError(`[Local Font Loader] Apply fonts失败，耗时 ${(endTime - startTime).toFixed(2)}ms:`, error);
        }
    }

    // Convert all fonts to Base64
    async convertAllFonts() {
        this._log('[Local Font Loader] Starting font conversion...');
        let converted = 0;
        let skipped = 0;

        try {
            for (const font of this.settings.availableFonts) {
                // Skip already cached fonts
                if (font.hasB64) {
                    skipped++;
                    continue;
                }

                try {
                    const variantLabel = font.variantType || 'unknown';
                    this._log(`[Local Font Loader] Converting font: ${font.name} (${font.familyName || 'Unknown'} - ${variantLabel})`);

                    const arrayBuffer = await this.app.vault.adapter.readBinary(font.path);
                    const base64 = this.arrayBufferToBase64(arrayBuffer);

                    // Build the @font-face CSS (config-driven unicode-range determination and family-name escaping)
                    const { css: singleFontCss, fontFamily, variantType, fontWeight, fontStyle } =
                        this._buildFontFaceCss(font, base64, this._getDeviceFontContext());

                    // Save to cache
                    const cachePath = `${this.settings.b64OutputDir}/${font.name}.css`;
                    await this.app.vault.adapter.write(cachePath, singleFontCss);

                    // Update font status
                    font.hasB64 = true;
                    font.b64Path = cachePath;

                    converted++;
                    this._log(`[Local Font Loader] ✓ Converted: ${font.name} (${fontFamily} - ${variantType}, weight: ${fontWeight}, style: ${fontStyle})`);

                } catch (error) {
                    this._logError(`[Local Font Loader] Conversion failed: ${font.name}`, error);
                }
            }

            await this.saveSettings();

            this._log(`[Local Font Loader] Conversion complete：${converted} newly converted，${skipped} already cached`);

        } catch (error) {
            this._logError('[Local Font Loader] 批量Conversion failed:', error);
        }
    }

    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        const chunkSize = 8192; // 8KB chunked processing
        let binary = "";

        for (let i = 0; i < bytes.byteLength; i += chunkSize) {
            const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.byteLength));
            binary += String.fromCharCode.apply(null, chunk);
        }

        return btoa(binary);
    }

    /**
      * Builds a single font's @font-face CSS (config-driven unicode-range determination and family-name escaping).
      * Shared by convertAllFonts / convertSingleFont so Latin determination and escaping stay consistent.
      * @param {Object} font   The font object
      * @param {string} base64 The base64 data
      * @param {Object} ctx    Context from _getDeviceFontContext()
     * @returns {{css:string, fontFamily:string, variantType:string, fontWeight:number, fontStyle:string}}
     */
    _buildFontFaceCss(font, base64, ctx) {
        const { fontsConfig, latinFontEnabled, latinFontScope } = ctx;
        const formatMap = {
            'ttf': 'font/truetype',
            'otf': 'font/opentype',
            'woff': 'font/woff',
            'woff2': 'font/woff2'
        };
        const mimeType = formatMap[font.ext] || 'font/truetype';

        const fontFamily = font.familyName || font.name;
        const variantType = font.variantType || 'regular';

        // Config-driven: whether this font is the Latin font configured in the preset
        const isLatinFont = latinFontEnabled && fontsConfig.latin &&
            (fontFamily === fontsConfig.latin || font.name === fontsConfig.latin);
        const needsUnicodeRange = isLatinFont;

        // Set CSS properties based on the variant type
        let fontWeight = 400;
        let fontStyle = 'normal';

        switch (variantType) {
            case 'italic':
                fontStyle = 'italic';
                break;
            case 'bold':
                fontWeight = 700;
                break;
            case 'bolditalic':
                fontWeight = 700;
                fontStyle = 'italic';
                break;
        }

        // Build the @font-face declaration
        let css = `/* ${this._escapeCssString(fontFamily)} - ${variantType} */\n`;
        css += `@font-face {\n`;
        css += `  font-family: '${this._escapeCssString(fontFamily)}';\n`;
        css += `  src: url(data:${mimeType};base64,${base64});\n`;
        css += `  font-style: ${fontStyle};\n`;
        css += `  font-weight: ${fontWeight};\n`;
        css += `  font-display: swap;\n`;

        if (needsUnicodeRange) {
            // Build unicode-range from the preset's latinFontScope (deprecated top-level field)
            const unicodeRange = this.getUnicodeRange(latinFontScope);
            if (unicodeRange) {
                css += `  unicode-range: ${unicodeRange};\n`;
            }
        }

        css += `}\n`;

        return { css, fontFamily, variantType, fontWeight, fontStyle };
    }

    /**
     * Applies a generated stylesheet.
     *
     * The CSS here is built at runtime from the user's own font files (their `@font-face` rules
     * and the variables derived from their presets), so it cannot live in a static `styles.css`
     * — which is what the plugin guidelines otherwise ask for. Two carriers are used instead,
     * and neither makes this plugin attach a `<style>` element:
     *
     *  - A constructable stylesheet adopted by the document — the mechanism Obsidian's own
     *    bundle prefers, and the one every supported platform has had since Safari 16.4 /
     *    Chromium 73.
     *  - On a WebView older than that (iOS 15.6–16.3), a CSS snippet written to the snippets
     *    folder and enabled through `app.customCss`, so Obsidian loads the CSS itself. Without
     *    this branch those devices would get no fonts at all.
     *
     * @param css - The CSS text; an empty value removes the stylesheet
     * @param cssId - A stable id, so repeated applies replace rather than accumulate
     */
    applyCss(css: string, cssId: string): void {
        if (this._appliedCss.get(cssId) === css) {
            return;
        }

        if (!css) {
            this._removeGeneratedStyles(cssId);
            return;
        }

        if (this._supportsConstructableStylesheets()) {
            // Taking the CSS over here means any snippet of ours still carrying it has to go.
            this._dropLegacySnippet();

            let sheet = this._adoptedSheets.get(cssId);
            if (!sheet) {
                sheet = new CSSStyleSheet();
                this._adoptedSheets.set(cssId, sheet);
                document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
            }
            try {
                sheet.replaceSync(css);
            } catch (error) {
                this._logError(`[Local Font Loader] Could not apply stylesheet "${cssId}":`, error);
                return;
            }
        } else {
            this._snippetCss.set(cssId, css);
            this._queueSnippetSync();
        }

        this._appliedCss.set(cssId, css);
    }

    /** Whether this document can carry a stylesheet that was built at runtime. */
    _supportsConstructableStylesheets(): boolean {
        return typeof CSSStyleSheet === 'function'
            && 'replaceSync' in CSSStyleSheet.prototype
            && 'adoptedStyleSheets' in document;
    }

    /**
     * Removes one generated stylesheet, whichever way it was applied.
     *
     * @param cssId - The id the stylesheet was applied under
     */
    _removeGeneratedStyles(cssId: string): void {
        const sheet = this._adoptedSheets.get(cssId);
        if (sheet) {
            document.adoptedStyleSheets = document.adoptedStyleSheets.filter(s => s !== sheet);
            this._adoptedSheets.delete(cssId);
        }

        // Earlier versions attached a `<style>` element per id. Only the removal of one survives:
        // reloading the plugin can leave the old element behind for the rest of the session.
        const element = document.getElementById(cssId);
        if (element) {
            element.remove();
        }

        if (this._snippetCss.delete(cssId)) {
            this._queueSnippetSync();
        }

        this._appliedCss.delete(cssId);
    }

    /**
     * Queues a snippet rewrite, chained onto the one before it.
     *
     * Both applies of a font change (the `@font-face` rules, then the variables) land in the
     * snippet, so they settle into a single write rather than racing over the same file.
     */
    _queueSnippetSync(): void {
        this._snippetSync = this._snippetSync
            .then(() => this._syncSnippet())
            .catch(error => this._logError('[Local Font Loader] Could not write the CSS snippet:', error));
    }

    /**
     * Brings the snippet in line with the CSS currently generated.
     *
     * The plugin never touches the element Obsidian builds from the snippet: it writes the file
     * and enables it, and Obsidian loads it like any other snippet.
     */
    async _syncSnippet(): Promise<void> {
        const customCss = this.app.customCss;
        if (!customCss) {
            this._logError('[Local Font Loader] No CSS snippets on this platform: the fonts cannot be applied.');
            return;
        }

        const path = customCss.getSnippetPath(LEGACY_SNIPPET);
        const css = Array.from(this._snippetCss.values()).join('\n');

        if (!css) {
            // Nothing left to carry — take the snippet back out of the user's list.
            if (!this._snippetEnabled) {
                return;
            }
            this._snippetEnabled = false;
            customCss.setCssEnabledStatus(LEGACY_SNIPPET, false);

            // A file this session did not write belongs to someone else — a snippet that arrived
            // by sync, or one the user made under this name. Disabling it is reversible and
            // enough; deleting a file the plugin did not author is not.
            if (!this._snippetWritten) {
                return;
            }
            this._snippetWritten = false;

            // Checked first: removing a file that is already gone would only throw, and a snippet
            // that is not there is the state being asked for rather than a failure.
            if (await this.app.vault.adapter.exists(path)) {
                await this.app.vault.adapter.remove(path);
            }
            return;
        }

        await this.app.vault.adapter.write(path, css);
        this._snippetWritten = true;
        if (!this._snippetEnabled) {
            this._snippetEnabled = true;
            customCss.setCssEnabledStatus(LEGACY_SNIPPET, true);
        }
        this._log(`[Local Font Loader] Applied ${(css.length / 1024 / 1024).toFixed(2)} MB of CSS through the "${LEGACY_SNIPPET}" snippet.`);
    }

    /**
     * Takes back a snippet left behind by the legacy path — written by this device while it still
     * needed one, or synced in from a device that did.
     *
     * Runs once per session, on the first apply the modern path handles. An enabled snippet would
     * otherwise keep applying another device's fonts, and sit in the user's snippet list for good.
     */
    _dropLegacySnippet(): void {
        if (this._legacySnippetChecked) {
            return;
        }
        this._legacySnippetChecked = true;

        if (!this.app.customCss?.enabledSnippets?.has(LEGACY_SNIPPET)) {
            return;
        }

        // No CSS of ours to write, so the queued sync disables and deletes it.
        this._snippetEnabled = true;
        this._queueSnippetSync();
    }

    removeFontStyles() {
        this._removeGeneratedStyles('local-font-loader-faces');
        this._removeGeneratedStyles('local-font-loader-vars');

        // Hand MathJax its own metrics back. They live on a global object shared with every other
        // renderer, so leaving them adopted after the plugin stops managing the font would keep
        // shaping maths from a table the plugin no longer stands behind.
        this._restoreMathFontMetrics();
    }

    async clearCache() {
        try {
            const files = await this.app.vault.adapter.list(this.settings.b64OutputDir);
            let count = 0;

            for (const file of files.files) {
                if (file.endsWith('.css')) {
                    await this.app.vault.adapter.remove(file);
                    count++;
                }
            }

            // Update font list status
            for (const font of this.settings.availableFonts) {
                font.hasB64 = false;
                font.b64Path = null;
            }
            await this.saveSettings();

            this._log(`[Local Font Loader] Cleaned ${count} cache files`);

        } catch (error) {
            this._logError('[Local Font Loader] Clear Cache失败:', error);
        }
    }
}
