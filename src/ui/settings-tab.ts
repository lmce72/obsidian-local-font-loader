/**
 * Settings UI for font management, presets and device assignment.
 */
import { Component, PluginSettingTab, Setting, Notice, MarkdownRenderer, TextComponent, setIcon } from 'obsidian';

import { t, isLatinScriptLocale } from '../i18n';
import { showConfirmDialog } from './modals';
import type LocalFontLoaderPlugin from '../plugin';
import { renderDeviceAndPresetSection } from './settings/device-preset';
import { renderDirectoryAndApplicationSection } from './settings/directory-application';
import { renderFontStatusSection } from './settings/font-status';
import { renderFallbackSection } from './settings/fallback';

export default class FontManagerSettingTab extends PluginSettingTab {
    /** The plugin this tab configures. `import type` keeps this free of a runtime cycle. */
    plugin: LocalFontLoaderPlugin;

    /**
     * Components backing MarkdownRenderer calls.
     *
     * MarkdownRenderer needs a Component to own what it creates, and the plugin itself is the
     * wrong owner: its lifecycle spans the whole session, so everything rendered here would
     * stay alive after the settings tab is gone. These are created per render and unloaded
     * with the rest of the tab state.
     */
    _markdownComponents: Component[] = [];

    /** Listeners registered through _addEventListener, unbound by _cleanupEventListeners. */
    _eventListeners: Array<{ element: HTMLElement; event: string; handler: EventListener; options?: AddEventListenerOptions }> = [];

    /** Debounce handle for display(), which is requested repeatedly while typing. */
    _displayDebounceTimer: number | null = null;
    _displayDebounceDelay = 300;

    /** Whether the tab is on screen — guards re-rendering while it is hidden. */
    _isVisible = false;

    /** Fires when another device syncs a change into data.json. */
    _settingsChangedHandler!: () => void;

    /** Preset currently being edited. */
    _activePresetId = 'default-preset';

    /** Font-list filter: all | converted | notConverted | notExist | cachedOnly. */
    _fontFilter = 'all';

    /** The preset-name input, while it is on screen. */
    _newPresetNameInput: TextComponent | null = null;

    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
        this._eventListeners = [];
        this._displayDebounceTimer = null;
        this._displayDebounceDelay = 300; // 300ms debounce delay

        this._isVisible = false; // Whether the settings tab is visible (guard for settings-changed re-rendering)

        // Listen for settings-changed (fired by the data.json listener).
        // Registered once; lifecycle is owned by plugin.registerEvent (auto-unbound on unload),
        // no longer unregistered in hide() so syncing keeps working after the settings tab is closed.
        this._settingsChangedHandler = () => {
            if (!this._isVisible) return; // Skip redundant re-rendering while hidden
            this._debouncedDisplay();
        };
        this.plugin.registerEvent(
            this.plugin.app.workspace.on('local-font-loader:settings-changed' as 'layout-change', this._settingsChangedHandler)
        );
    }

    _addEventListener(element, event, handler, options?: AddEventListenerOptions) {
        element.addEventListener(event, handler, options);
        this._eventListeners.push({ element, event, handler, options });
    }

    _cleanupEventListeners() {
        this._eventListeners.forEach(({ element, event, handler, options }) => {
            element.removeEventListener(event, handler, options);
        });
        this._eventListeners = [];

        this._markdownComponents.forEach(component => component.unload());
        this._markdownComponents = [];
    }

    /**
     * Renders Markdown into an element under a component scoped to this render.
     *
     * @param el - Where to render
     * @param markdown - The Markdown source
     */
    _renderMarkdown(el: HTMLElement, markdown: string): void {
        const component = new Component();
        component.load();
        this._markdownComponents.push(component);
        MarkdownRenderer.render(this.app, markdown, el, '', component);
    }

    /**
     * Debounced version of display()
     * Only executes the last call when invoked multiple times within a short period
     */
    _debouncedDisplay() {
        if (this._displayDebounceTimer) {
            window.clearTimeout(this._displayDebounceTimer);
        }
        this._displayDebounceTimer = window.setTimeout(() => {
            this.display();
            this._displayDebounceTimer = null;
        }, this._displayDebounceDelay);
    }

    /**
     * Determine whether a font is a Latin font (heuristic check on the font name)
     * @param {string} fontName - The font family name
     * @returns {boolean} Whether it is a Latin font
     */
    _isLatinFont(fontName) {
        const lowerName = fontName.toLowerCase();

        // Explicit non-Latin font keywords
        const nonLatinKeywords = [
            // Chinese
            '思源', 'noto sans cjk', 'noto serif cjk', 'source han', '微软雅黑', 'microsoft yahei',
            '宋体', 'simsun', '黑体', 'simhei', '楷体', 'kaiti', '方正', 'fangzheng',
            // Japanese
            '源', 'genkai', 'meiryo', 'yu gothic', 'hiragino', 'msmincho', 'msgothic',
            // Korean
            'nanum', 'malgun', 'batang', 'dotum', 'gulim',
            // Arabic
            'arabic', 'nastaliq', 'kufi',
            // Others
            'devanagari', 'thai', 'hebrew'
        ];

        // If contains non-Latin keywords, not a Latin font
        if (nonLatinKeywords.some(keyword => lowerName.includes(keyword))) {
            return false;
        }

        // Explicit Latin font keywords
        const latinKeywords = [
            'times', 'arial', 'helvetica', 'georgia', 'verdana', 'courier',
            'garamond', 'palatino', 'century', 'cambria', 'calibri',
            'latin', 'roman', 'serif', 'sans'
        ];

        // If contains Latin keywords, is a Latin font
        if (latinKeywords.some(keyword => lowerName.includes(keyword))) {
            return true;
        }

        // Default case: assume Latin font (conservative strategy)
        return true;
    }


    display() {
        this._isVisible = true; // Mark the settings tab visible (settings-changed guard)
        this._cleanupEventListeners();

        const { containerEl } = this;

        // Save the scroll position
        const scrollParent = containerEl.closest('.vertical-tab-content');
        const savedScrollTop = scrollParent ? scrollParent.scrollTop : 0;

        containerEl.empty();

        new Setting(containerEl).setName(t('pluginName')).setHeading();

        // ========================================
        // Override System Settings Info
        // ========================================
        const overrideInfoCallout = containerEl.createDiv({ cls: 'callout', attr: { 'data-callout': 'info' } });
        const overrideInfoTitle = overrideInfoCallout.createDiv({ cls: 'callout-title' });
        const overrideInfoIcon = overrideInfoTitle.createDiv({ cls: 'callout-icon' });
        setIcon(overrideInfoIcon, 'info');
        overrideInfoTitle.createDiv({ cls: 'callout-title-inner', text: t('overrideSystemSettingsTitle') });
        const overrideInfoContent = overrideInfoCallout.createDiv({ cls: 'callout-content' });
        overrideInfoContent.createEl('p', { text: t('overrideSystemSettingsContent') });

        // ========================================
        // Performance Warning Callout
        // ========================================
        const warningCallout = containerEl.createDiv({ cls: 'callout', attr: { 'data-callout': 'warning' } });
        const warningTitle = warningCallout.createDiv({ cls: 'callout-title' });
        const warningIcon = warningTitle.createDiv({ cls: 'callout-icon' });
        setIcon(warningIcon, 'alert-triangle');
        warningTitle.createDiv({ cls: 'callout-title-inner', text: t('performanceWarningTitle') });
        const warningContent = warningCallout.createDiv({ cls: 'callout-content' });
        warningContent.createEl('p', { text: t('performanceWarningContent') });

        // ========================================
        // Each section owns its own module; display() only decides the order.
        renderDeviceAndPresetSection(this, containerEl);
        renderDirectoryAndApplicationSection(this, containerEl);
        renderFontStatusSection(this, containerEl);
        renderFallbackSection(this, containerEl);

        // Restore the scroll position (after all UI is built)
        if (scrollParent && savedScrollTop > 0) {
            // Use double requestAnimationFrame to ensure the DOM is fully rendered
            window.requestAnimationFrame(() => {
                window.requestAnimationFrame(() => {
                    scrollParent.scrollTop = savedScrollTop;
                });
            });
        }
    }

    // Add Latin font separation options
    addLatinFontOptions(containerEl, activePreset) {
        // Callout: Example - show different descriptions based on the user language
        const exampleCalloutEl = containerEl.createDiv({ attr: { style: 'margin: 16px 0;' } });

        // Base description
        let exampleMarkdown = `> [!example] ${t('latinFontInfo')}\n> ${t('latinFontInfoDesc')}`;

        // If the user is a Latin-language user, append an additional hint
        if (isLatinScriptLocale()) {
            exampleMarkdown += `\n>\n> ${t('latinFontInfoDescForLatinUsers')}`;
        }

        // Use Obsidian's native rendering engine
        this._renderMarkdown(exampleCalloutEl, exampleMarkdown);

        // Toggle switch
        new Setting(containerEl)
            .setName(t('latinFontEnabled'))
            .setDesc(t('latinFontEnabledDesc'))
            .addToggle(toggle => toggle
                .setValue(activePreset.latinFontEnabled)
                .onChange(async (value) => {
                    activePreset.latinFontEnabled = value;
                    await this.plugin.saveSettings();
                    await this.plugin.applyFonts();
                    this.display(); // refresh the UI
                }));

        if (activePreset.latinFontEnabled) {
            // Select the Latin font
            new Setting(containerEl)
                .setName(t('latinFont'))
                .setDesc(t('latinFontDesc'))
                .addDropdown(dropdown => {
                    dropdown.addOption('', t('systemDefault'));

                    const uniqueFamilies = new Set<string>();
                    this.plugin.settings.availableFonts.forEach(font => {
                        const familyName = font.familyName || font.name;
                        uniqueFamilies.add(familyName);
                    });

                    const allFamilies = Array.from(uniqueFamilies).sort();
                    const latinFamilies = allFamilies.filter(name =>
                        name.toLowerCase().includes('times') ||
                        name.toLowerCase().includes('latin')
                    );
                    const otherFamilies = allFamilies.filter(name => !latinFamilies.includes(name));

                    if (latinFamilies.length > 0) {
                        dropdown.addOption('', t('recommendedLatinFontsLabel'));
                        latinFamilies.forEach(familyName => {
                            const familyFonts = this.plugin.settings.availableFonts.filter(f =>
                                (f.familyName || f.name) === familyName
                            );
                            const allConverted = familyFonts.every(f => f.hasB64);
                            const variantCount = familyFonts.length;
                            const label = allConverted
                                ? `${familyName} ✓ (${variantCount})`
                                : `${familyName} (${variantCount})`;
                            dropdown.addOption(familyName, label);
                        });
                    }

                    if (otherFamilies.length > 0) {
                        dropdown.addOption('', t('otherFontsLabel'));
                        otherFamilies.forEach(familyName => {
                            const familyFonts = this.plugin.settings.availableFonts.filter(f =>
                                (f.familyName || f.name) === familyName
                            );
                            const allConverted = familyFonts.every(f => f.hasB64);
                            const variantCount = familyFonts.length;
                            const label = allConverted
                                ? `${familyName} ✓ (${variantCount})`
                                : `${familyName} (${variantCount})`;
                            dropdown.addOption(familyName, label);
                        });
                    }

                    dropdown.setValue(activePreset.fonts.latin);
                    dropdown.onChange(async (value) => {
                        activePreset.fonts.latin = value;

                        await this.plugin.saveSettings();
                        await this.plugin.applyFonts();

                        // Refresh the UI to show the warning
                        // Use requestAnimationFrame so DOM ops run in the next frame, avoiding double renders
                        window.requestAnimationFrame(() => {
                            this.display();
                        });
                    });
                });

            // Show the variant warning below the Latin font selector
            if (activePreset.fonts.latin) {
                const latinFont = activePreset.fonts.latin;
                const selectedFonts = this.plugin.settings.availableFonts.filter(f =>
                    (f.familyName || f.name) === latinFont
                );
                const hasItalic = selectedFonts.some(f => f.variantType === 'italic');
                const hasBold = selectedFonts.some(f => f.variantType === 'bold');
                const hasBoldItalic = selectedFonts.some(f => f.variantType === 'bolditalic');

                const missing = [];
                if (!hasItalic) missing.push('Italic');
                if (!hasBold) missing.push('Bold');
                if (!hasBoldItalic) missing.push('Bold Italic');

                if (missing.length > 0) {
                    const warningCalloutEl = containerEl.createDiv({
                        attr: { style: 'margin: 8px 0 16px 0;' }
                    });

                    const missingList = missing.join(', ');
                    const warningMarkdown = `> [!warning] ${t('missingVariantTitle')}
> ${t('missingVariantBody', { latinFont, missingList })}`;

                    this._renderMarkdown(warningCalloutEl, warningMarkdown);
                }
            }

            const scopes = [
                { key: 'letters', name: 'Letters', desc: 'A-Z, a-z' },
                { key: 'numbers', name: 'Numbers', desc: '0-9' },
                { key: 'punctuation', name: 'Punctuation', desc: t('punctuationDesc') },
                { key: 'symbols', name: 'Symbols', desc: t('symbolsDesc') }
            ];

            scopes.forEach(scope => {
                new Setting(containerEl)
                    .setName(scope.name)
                    .setDesc(scope.desc)
                    .addToggle(toggle => toggle
                        .setValue(activePreset.latinFontScope?.[scope.key] ?? true)
                        .onChange(async (value) => {
                            if (!activePreset.latinFontScope) {
                                activePreset.latinFontScope = { letters: true, numbers: true, punctuation: true, symbols: true };
                            }
                            activePreset.latinFontScope[scope.key] = value;
                            await this.plugin.saveSettings();
                            await this.plugin.applyFonts();
                        }));
            });

            // Latin font for UI toggle
            new Setting(containerEl)
                .setName(t('latinFontForUI'))
                .setDesc(t('latinFontForUIDesc'))
                .addToggle(toggle => toggle
                    .setValue(this.plugin.settings.latinFontForUI ?? false)
                    .onChange(async (value) => {
                        this.plugin.settings.latinFontForUI = value;
                        await this.plugin.saveSettings();
                        await this.plugin.applyFonts();
                    }));
        }
    }

    // Add the file title option
    addFileTitleOption(containerEl, activePreset) {
        // Check the current heading font setting; hide this option if 'use-text-font'
        const headingFontValue = activePreset.fonts.heading;

        if (headingFontValue === 'use-text-font') {
            // When using the text font, do not show this option
            return;
        }

        new Setting(containerEl)
            .setName(t('headingApplyToFileTitle'))
            .setDesc(t('headingApplyToFileTitleDesc'))
            .addToggle(toggle => toggle
                .setValue(activePreset.headingApplyToFileTitle || false)
                .onChange(async (value) => {
                    activePreset.headingApplyToFileTitle = value;
                    await this.plugin.saveSettings();
                    await this.plugin.applyFonts();
                }));
    }

    // Render font families (collapsible)
    renderFontFamilies(containerEl, filter = 'all') {
        // Group by family
        const familiesMap = new Map();

        this.plugin.settings.availableFonts.forEach(font => {
            const familyName = font.familyName || font.name;
            if (!familiesMap.has(familyName)) {
                familiesMap.set(familyName, []);
            }
            familiesMap.get(familyName).push(font);
        });

        // Filter families by the filter condition
        const filteredFamilies = Array.from(familiesMap.entries()).filter(([familyName, fonts]) => {
            if (filter === 'all') {
                return true; // show all
            } else if (filter === 'converted') {
                // At least one variant is converted
                return fonts.some(f => f.hasB64);
            } else if (filter === 'cachedOnly') {
                // Cache only (has B64 but the source file is missing)
                return fonts.some(f => f.hasB64 && !this.plugin._getFontExists(f));
            } else if (filter === 'notConverted') {
                // At least one variant is not converted
                return fonts.some(f => !f.hasB64);
            } else if (filter === 'notExist') {
                // At least one variant's source file is missing
                return fonts.some(f => !this.plugin._getFontExists(f));
            }
            return true;
        });

        // If there are no results after filtering, show a hint
        if (filteredFamilies.length === 0) {
            let emptyMessage = t('noConvertedFonts') || '没有已转换的字体';
            if (filter === 'notConverted') {
                emptyMessage = t('noNotConvertedFonts') || '没有未转换的字体';
            } else if (filter === 'notExist') {
                emptyMessage = t('noNotExistFonts') || '没有缺失的字体';
            } else if (filter === 'cachedOnly') {
                emptyMessage = t('noCachedOnlyFonts') || '没有仅缓存的字体';
            }
            containerEl.createEl('div', {
                text: emptyMessage,
                attr: { style: 'color: var(--text-muted); font-size: 0.9em; text-align: center; padding: 20px;' }
            });
            return;
        }

        // Render each family
        for (const [familyName, fonts] of filteredFamilies) {
            const familyEl = containerEl.createDiv({
                cls: 'font-family-item',
                attr: {
                    style: 'margin-bottom: 8px; border: 1px solid var(--background-modifier-border); border-radius: 6px; overflow: hidden;'
                }
            });

            // Family title (clickable to expand/collapse)
            const headerEl = familyEl.createDiv({
                attr: {
                    style: 'padding: 12px; background: var(--background-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; user-select: none;'
                }
            });

            const leftEl = headerEl.createDiv({
                attr: { style: 'display: flex; align-items: center; gap: 12px; flex: 1;' }
            });

            // Expand/collapse icon
            const expandIcon = leftEl.createSpan({
                cls: 'font-family-toggle',
                attr: {
                    style: 'display: inline-flex; align-items: center; transition: transform 0.2s ease;',
                    'aria-label': t('expandCollapse')
                }
            });
            setIcon(expandIcon, 'chevron-right');

            // Family name
            leftEl.createSpan({
                text: familyName,
                attr: { style: 'font-weight: 600; font-family: var(--font-monospace);' }
            });

            // Font list (collapsed by default)
            const variantsEl = familyEl.createDiv({
                cls: 'font-variants',
                attr: {
                    style: 'display: none; padding: 8px; background: var(--background-secondary);'
                }
            });

            let expanded = false;
            this._addEventListener(headerEl, 'click', () => {
                expanded = !expanded;
                variantsEl.style.display = expanded ? 'block' : 'none';
                // Rotate icon
                expandIcon.style.transform = expanded ? 'rotate(90deg)' : 'rotate(0deg)';
            });

            // Render the variant list
            fonts.forEach(font => {
                const variantEl = variantsEl.createDiv({
                    attr: {
                        style: 'padding: 8px; margin: 4px 0; background: var(--background-primary); border-radius: 4px; display: flex; align-items: center; justify-content: space-between;'
                    }
                });

                const infoEl = variantEl.createDiv({
                    attr: { style: 'display: flex; align-items: center; gap: 12px; flex: 1;' }
                });

                // Status icon
                // Four states:
                // 1. Source missing + cache exists -> blue check (cache only)
                // 2. Source missing + cache missing -> red question mark (fully missing)
                // 3. Source exists + converted -> green check (converted)
                // 4. Source exists + not converted -> gray circle (pending conversion)

                let iconColor, iconName;

                if (!this.plugin._getFontExists(font)) {
                    // Source file missing
                    if (font.hasB64) {
                        // But the cache exists -> blue check
                        iconColor = 'var(--interactive-accent)';
                        iconName = 'check';
                    } else {
                        // Cache also missing -> red question mark
                        iconColor = 'var(--text-error)';
                        iconName = 'help-circle';
                    }
                } else {
                    // Source file exists
                    if (font.hasB64) {
                        // Converted -> green check
                        iconColor = 'var(--color-green)';
                        iconName = 'check';
                    } else {
                        // Not converted -> gray circle
                        iconColor = 'var(--text-muted)';
                        iconName = 'circle';
                    }
                }

                const statusIconEl = infoEl.createSpan({
                    attr: { style: `color: ${iconColor};` }
                });
                setIcon(statusIconEl, iconName);

                // Variant type label
                const variantLabels = {
                    'regular': 'Regular',
                    'italic': 'Italic',
                    'bold': 'Bold',
                    'bolditalic': 'Bold Italic'
                };

                const variantLabel = variantLabels[font.variantType] || 'Unknown';

                // Variant name
                infoEl.createSpan({
                    text: variantLabel,
                    attr: { style: 'font-family: var(--font-monospace); font-size: 0.9em;' }
                });

                // Action buttons
                const actionsEl = variantEl.createDiv({
                    attr: { style: 'display: flex; gap: 4px;' }
                });

                // Reconvert button
                const convertBtn = actionsEl.createEl('button', {
                    attr: {
                        style: 'padding: 4px 8px; cursor: pointer; display: inline-flex; align-items: center;',
                        title: t('reconvertFont'),
                        'aria-label': t('reconvertFont')
                    }
                });
                setIcon(convertBtn, 'refresh-cw');
                this._addEventListener(convertBtn, 'click', async () => {
                    await this.convertSingleFont(font);
                    this.display();
                });

                // Delete button
                const deleteBtn = actionsEl.createEl('button', {
                    attr: {
                        style: 'padding: 4px 8px; cursor: pointer; display: inline-flex; align-items: center;',
                        title: t('deleteThisFont'),
                        'aria-label': t('deleteThisFont')
                    }
                });
                setIcon(deleteBtn, 'trash-2');
                this._addEventListener(deleteBtn, 'click', async () => {
                    showConfirmDialog(
                        this.plugin.app,
                        t('confirmDelete'),
                        t('confirmDeleteFont').replace('{fontName}', font.name),
                        async () => {
                            await this.deleteSingleFont(font);
                            this.display();
                        },
                        true  // isDangerous = true
                    );
                });
            });
        }
    }

    // Convert a single font
    async convertSingleFont(font) {
        try {
            this.plugin._log(`[Local Font Loader] Converting ${font.name}...`);

            const arrayBuffer = await this.plugin.app.vault.adapter.readBinary(font.path);
            const base64 = this.plugin.arrayBufferToBase64(arrayBuffer);

            // Build the @font-face CSS (config-driven unicode-range determination and family-name escaping)
            const { css: singleFontCss } =
                this.plugin._buildFontFaceCss(font, base64, this.plugin._getDeviceFontContext());

            const cachePath = `${this.plugin.settings.b64OutputDir}/${font.name}.css`;
            await this.plugin.app.vault.adapter.write(cachePath, singleFontCss);

            font.hasB64 = true;
            font.b64Path = cachePath;
            await this.plugin.saveSettings();

            this.plugin._log(`[Local Font Loader] ${font.name} Conversion complete`);
            new Notice(`✓ ${font.name} Conversion complete`);
        } catch (error) {
            this.plugin._logError(`[Local Font Loader] Conversion failed: ${font.name}`, error);
            new Notice(`⚠️ Conversion failed: ${error.message}`);
        }
    }

    // Delete a single font
    async deleteSingleFont(font) {
        try {
            // Delete the source file (for cache-only fonts the source may be gone; ignore and keep cleaning the cache)
            try {
                await this.plugin.app.vault.adapter.remove(font.path);
            } catch (err) {
                this.plugin._log(`[Local Font Loader] 源文件不存在，跳过删除: ${font.path}`);
            }

            // Delete the cache
            if (font.b64Path) {
                try {
                    await this.plugin.app.vault.adapter.remove(font.b64Path);
                } catch {
                    // 目录已存在等预期情况，忽略
                }
            }

            // Remove from the list
            const index = this.plugin.settings.availableFonts.indexOf(font);
            if (index > -1) {
                this.plugin.settings.availableFonts.splice(index, 1);
            }

            await this.plugin.saveSettings();
            new Notice(t('deletedFont', { fontName: font.name }));
        } catch (error) {
            this.plugin._logError(`[Local Font Loader] 删除失败: ${font.name}`, error);
            new Notice(t('deleteFailedError', { error: error.message }));
        }
    }

    /**
      * Collects font objects not referenced by any preset.
      * Iterates all presets (not the deprecated settings.fonts); a font referenced by any preset
      * via familyName or name counts as "used", protecting all variants of the same family from deletion.
      * @returns {Array} Array of unused font objects
     */
    _getUnusedFonts() {
        const usedFontValues = new Set();

        const presets = this.plugin.settings.presets || [];
        for (const preset of presets) {
            const fontsConfig = preset.fonts || {};
            for (const value of Object.values(fontsConfig)) {
                // Skip empty strings and sentinel values (sentinels never match a real font entry)
                if (value && value !== 'use-text-font' && value !== 'use-ui-font') {
                    usedFontValues.add(value);
                }
            }
        }

        const availableFonts = this.plugin.settings.availableFonts || [];
        return availableFonts.filter(font =>
            !usedFontValues.has(font.familyName) && !usedFontValues.has(font.name)
        );
    }

    // Delete Unused Fonts
    async deleteUnusedFonts() {
        // Consistent with applyFonts: collect used fonts across all presets to avoid deleting configured fonts
        const unusedFonts = this._getUnusedFonts();

        if (unusedFonts.length === 0) {
            new Notice(t('noUnusedFonts'));
            return;
        }

        // Confirmation logic removed; handled by the UI layer

        this.plugin._log(`[Local Font Loader] Starting to delete unused fonts (${unusedFonts.length} fonts)...`);
        let deleted = 0;

        try {
            for (const font of unusedFonts) {
                try {
                    // Delete the original font file (for cache-only fonts the source may be gone; ignore and keep cleaning the cache)
                    try {
                        await this.app.vault.adapter.remove(font.path);
                    } catch (err) {
                        this.plugin._log(`[Local Font Loader] 源文件不存在，跳过删除: ${font.path}`);
                    }

                    // Delete the cache file
                    if (font.hasB64 && font.b64Path) {
                        try {
                            await this.app.vault.adapter.remove(font.b64Path);
                        } catch {
                            // 目录已存在等预期情况，忽略
                        }
                    }

                    // Remove from the list
                    const index = this.plugin.settings.availableFonts.indexOf(font);
                    if (index > -1) {
                        this.plugin.settings.availableFonts.splice(index, 1);
                    }

                    deleted++;

                } catch (error) {
                    this.plugin._logError(`[Local Font Loader] 删除失败: ${font.name}`, error);
                }
            }

            await this.plugin.saveSettings();

            new Notice(t('deletedUnusedFonts', { count: deleted }));
            this.plugin._log(`[Local Font Loader] Deleted ${deleted} unused fonts`);

            this.display(); // refresh the UI

        } catch (error) {
            this.plugin._logError('[Local Font Loader] 批量删除失败:', error);
            new Notice(t('deleteError'));
        }
    }

    hide() {
        this._isVisible = false;
        // Clear the debounced-render timer so display() is not re-triggered while hidden
        if (this._displayDebounceTimer) {
            window.clearTimeout(this._displayDebounceTimer);
            this._displayDebounceTimer = null;
        }
        this._cleanupEventListeners();
        // The settings-changed handler's lifecycle is owned by plugin.registerEvent;
        // it is auto-unbound on unload and no longer unregistered in hide() (avoids losing sync after the first close).
        super.hide();
    }
}
