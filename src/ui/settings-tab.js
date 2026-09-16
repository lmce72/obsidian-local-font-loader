/**
 * Settings UI for font management, presets and device assignment.
 */
import { PluginSettingTab, Setting, Modal, Notice, MarkdownRenderer, Platform, setIcon } from 'obsidian';

import { t, isLatinScriptLocale } from '../i18n.js';
import { TextInputModal, FontImportModal, showConfirmDialog } from './modals.js';

export default class FontManagerSettingTab extends PluginSettingTab {
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
            this.plugin.app.workspace.on('local-font-loader:settings-changed', this._settingsChangedHandler)
        );
    }

    _addEventListener(element, event, handler, options) {
        element.addEventListener(event, handler, options);
        this._eventListeners.push({ element, event, handler, options });
    }

    _cleanupEventListeners() {
        this._eventListeners.forEach(({ element, event, handler, options }) => {
            element.removeEventListener(event, handler, options);
        });
        this._eventListeners = [];
    }

    /**
     * Debounced version of display()
     * Only executes the last call when invoked multiple times within a short period
     */
    _debouncedDisplay() {
        if (this._displayDebounceTimer) {
            clearTimeout(this._displayDebounceTimer);
        }
        this._displayDebounceTimer = setTimeout(() => {
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

        containerEl.createEl('h2', { text: t('pluginName') });

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
        // Inject Preset Management CSS Styles
        // ========================================
        const existingStyle = document.getElementById('local-font-loader-preset-styles');
        if (!existingStyle) {
            const style = document.createElement('style');
            style.id = 'local-font-loader-preset-styles';
            style.textContent = `
/* Preset drag-and-drop management area */
.setting-item-heading-with-button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
}

.setting-item-heading-with-button h4 {
    margin: 0;
    flex: 1;
    display: inline-block;
}

.setting-item-heading-with-button .clickable-icon {
    padding: 4px;
    opacity: 0.7;
    transition: opacity 0.2s ease;
    flex-shrink: 0;
}

.setting-item-heading-with-button .clickable-icon:hover {
    opacity: 1;
}

.preset-drag-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 16px 0;
}

.preset-section {
    padding: 12px;
    border-radius: 8px;
    background: var(--background-secondary);
    border: 1px solid var(--background-modifier-border);
}

.preset-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.preset-header h5 {
    margin: 0;
    font-size: 1em;
    color: var(--text-normal);
}

.preset-actions {
    display: flex;
    gap: 8px;
}

.devices-container {
    min-height: 60px;
    padding: 8px;
    border-radius: 6px;
    border: 2px dashed var(--background-modifier-border);
    background: var(--background-primary);
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    transition: border-color 0.2s ease, background-color 0.2s ease;
}

.devices-container.drag-over {
    border-color: var(--interactive-accent);
    background: var(--background-modifier-hover);
}

.global-preset-zone {
    border-color: var(--text-accent);
    border-style: solid;
}

.device-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 6px;
    background: var(--background-secondary);
    border: 1px solid var(--background-modifier-border);
    cursor: move;
    user-select: none;
    font-size: 0.9em;
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.device-item.dragging {
    opacity: 0.5;
}

.device-item.current-device {
    background: var(--interactive-accent);
    color: var(--text-on-accent);
    font-weight: 500;
}

.device-remove-btn {
    margin-left: 4px;
    padding: 2px;
    opacity: 0.6;
    transition: opacity 0.2s ease;
}

.device-remove-btn:hover {
    opacity: 1;
    color: var(--text-error);
}

.device-move-btn {
    margin-left: 4px;
    padding: 4px;
    color: var(--text-normal);
    opacity: 0.8;
    transition: opacity 0.2s ease;
}

.device-move-btn:hover {
    opacity: 1;
    color: var(--interactive-accent);
}

.font-missing-icon {
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
}

/* Mobile adaptation */
@media (max-width: 768px) {
    .preset-drag-container {
        gap: 12px;
    }

    .device-item {
        font-size: 0.85em;
        padding: 5px 10px;
    }
}

/* Operating system icons */
.device-os-icon {
    display: inline-block;
    width: 16px;
    height: 16px;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    flex-shrink: 0;
}

/* Windows icon (FontAwesome brands) */
.device-os-icon.os-windows {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'%3E%3Cpath fill='%23ffffff' d='M0 93.7l183.6-25.3v177.4H0V93.7zm0 324.6l183.6 25.3V268.4H0v149.9zm203.8 28L448 480V268.4H203.8v177.9zm0-380.6v180.1H448V32L203.8 65.7z'/%3E%3C/svg%3E");
}

/* macOS icon (FontAwesome brands) */
.device-os-icon.os-macos {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 384 512'%3E%3Cpath fill='%23ffffff' d='M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z'/%3E%3C/svg%3E");
}

/* Linux icon (FontAwesome brands) */
.device-os-icon.os-linux {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'%3E%3Cpath fill='%23ffffff' d='M220.8 123.3c1 .5 1.8 1.7 3 1.7 1.1 0 2.8-.4 2.9-1.5.2-1.4-1.9-2.3-3.2-2.9-1.7-.7-3.9-1-5.5-.1-.4.2-.8.7-.6 1.1.3 1.3 2.3 1.1 3.4 1.7zm-21.9 1.7c1.2 0 2-1.2 3-1.7 1.1-.6 3.1-.4 3.5-1.6.2-.4-.2-.9-.6-1.1-1.6-.9-3.8-.6-5.5.1-1.3.6-3.4 1.5-3.2 2.9.1 1 1.8 1.5 2.8 1.4zM420 403.8c-3.6-4-5.3-11.6-7.2-19.7-1.8-8.1-3.9-16.8-10.5-22.4-1.3-1.1-2.6-2.1-4-2.9-1.3-.8-2.7-1.5-4.1-2 9.2-27.3 5.6-54.5-3.7-79.1-11.4-30.1-31.3-56.4-46.5-74.4-17.1-21.5-33.7-41.9-33.4-72C311.1 85.4 315.7.1 234.8 0 132.4-.2 158 103.4 156.9 135.2c-1.7 23.4-6.4 41.8-22.5 64.7-18.9 22.5-45.5 58.8-58.1 96.7-6 17.9-8.8 36.1-6.2 53.3-6.5 5.8-11.4 14.7-16.6 20.2-4.2 4.3-10.3 5.9-17 8.3s-14 6-18.5 14.5c-2.1 3.9-2.8 8.1-2.8 12.4 0 3.9.6 7.9 1.2 11.8 1.2 8.1 2.5 15.7.8 20.8-5.2 14.4-5.9 24.4-2.2 31.7 3.8 7.3 11.4 10.5 20.1 12.3 17.3 3.6 40.8 2.7 59.3 12.5 19.8 10.4 39.9 14.1 55.9 10.4 11.6-2.6 21.1-9.6 25.9-20.2 12.5-.1 26.3-5.4 48.3-6.6 14.9-1.2 33.6 5.3 55.1 4.1.6 2.3 1.4 4.6 2.5 6.7v.1c8.3 16.7 23.8 24.3 40.3 23 16.6-1.3 34.1-11 48.3-27.9 13.6-16.4 36-23.2 50.9-32.2 7.4-4.5 13.4-10.1 13.9-18.3.4-8.2-4.4-17.3-15.5-29.7zM223.7 87.3c9.8-22.2 34.2-21.8 44-.4 6.5 14.2 3.6 30.9-4.3 40.4-1.6-.8-5.9-2.6-12.6-4.9 1.1-1.2 3.1-2.7 3.9-4.6 4.8-11.8-.2-27-9.1-27.3-7.3-.5-13.9 10.8-11.8 23-4.1-2-9.4-3.5-13-4.4-1-6.9-.3-14.6 2.9-21.8zM183 75.8c10.1 0 20.8 14.2 19.1 33.5-3.5 1-7.1 2.5-10.2 4.6 1.2-8.9-3.3-20.1-9.6-19.6-8.4.7-9.8 21.2-1.8 28.1 1 .8 1.9-.2-5.9 5.5-15.6-14.6-10.5-52.1 8.4-52.1zm-13.6 60.7c6.2-4.6 13.6-10 14.1-10.5 4.7-4.4 13.5-14.2 27.9-14.2 7.1 0 15.6 2.3 25.9 8.9 6.3 4.1 11.3 4.4 22.6 9.3 8.4 3.5 13.7 9.7 10.5 18.2-2.6 7.1-11 14.4-22.7 18.1-11.1 3.6-19.8 16-38.2 14.9-3.9-.2-7-1-9.6-2.1-8-3.5-12.2-10.4-20-15-8.6-4.8-13.2-10.4-14.7-15.3-1.4-4.9 0-9 4.2-12.3zm3.3 334c-2.7 35.1-43.9 34.4-75.3 18-29.9-15.8-68.6-6.5-76.5-21.9-2.4-4.7-2.4-12.7 2.6-26.4v-.2c2.4-7.6.6-16-.6-23.9-1.2-7.8-1.8-15 .9-20 3.5-6.7 8.5-9.1 14.8-11.3 10.3-3.7 11.8-3.4 19.6-9.9 5.5-5.7 9.5-12.9 14.3-18 5.1-5.5 10-8.1 17.7-6.9 8.1 1.2 15.1 6.8 21.9 16l19.6 35.6c9.5 19.9 43.1 48.4 41 68.9zm-1.4-25.9c-4.1-6.6-9.6-13.6-14.4-19.6 7.1 0 14.2-2.2 16.7-8.9 2.3-6.2 0-14.9-7.4-24.9-13.5-18.2-38.3-32.5-38.3-32.5-13.5-8.4-21.1-18.7-24.6-29.9s-3-23.3-.3-35.2c5.2-22.9 18.6-45.2 27.2-59.2 2.3-1.7.8 3.2-8.7 20.8-8.5 16.1-24.4 53.3-2.6 82.4.6-20.7 5.5-41.8 13.8-61.5 12-27.4 37.3-74.9 39.3-112.7 1.1.8 4.6 3.2 6.2 4.1 4.6 2.7 8.1 6.7 12.6 10.3 12.4 10 28.5 9.2 42.4 1.2 6.2-3.5 11.2-7.5 15.9-9 9.9-3.1 17.8-8.6 22.3-15 7.7 30.4 25.7 74.3 37.2 95.7 6.1 11.4 18.3 35.5 23.6 64.6 3.3-.1 7 .4 10.9 1.4 13.8-35.7-11.7-74.2-23.3-84.9-4.7-4.6-4.9-6.6-2.6-6.5 12.6 11.2 29.2 33.7 35.2 59 2.8 11.6 3.3 23.7.4 35.7 16.4 6.8 35.9 17.9 30.7 34.8-2.2-.1-3.2 0-4.2 0 3.2-10.1-3.9-17.6-22.8-26.1-19.6-8.6-36-8.6-38.3 12.5-12.1 4.2-18.3 14.7-21.4 27.3-2.8 11.2-3.6 24.7-4.4 39.9-.5 7.7-3.6 18-6.8 29-32.1 22.9-76.7 32.9-114.3 7.2zm257.4-11.5c-.9 16.8-41.2 19.9-63.2 46.5-13.2 15.7-29.4 24.4-43.6 25.5s-26.5-4.8-33.7-19.3c-4.7-11.1-2.4-23.1 1.1-36.3 3.7-14.2 9.2-28.8 9.9-40.6.8-15.2 1.7-28.5 4.2-38.7 2.6-10.3 6.6-17.2 13.7-21.1.3-.2.7-.3 1-.5.8 13.2 7.3 26.6 18.8 29.5 12.6 3.3 30.7-7.5 38.4-16.3 9-.3 15.7-.9 22.6 5.1 9.9 8.5 7.1 30.3 17.1 41.6 10.6 11.6 14.9 19.5 13.7 24.6zM173.3 148.7c2 1.9 4.7 4.5 8 7.1 6.6 5.2 15.8 10.6 27.3 10.6 11.6 0 22.5-5.9 31.8-10.8 4.9-2.6 10.9-7 14.8-10.4s5.9-6.3 3.1-6.6-2.6 2.6-6 5.1c-4.4 3.2-9.7 7.4-13.9 9.8-7.4 4.2-19.5 10.2-29.9 10.2s-18.7-4.8-24.9-9.7c-3.1-2.5-5.7-5-7.7-6.9-1.5-1.4-1.9-4.6-4.3-4.9-1.4-.1-1.8 3.7 1.7 6.5z'/%3E%3C/svg%3E");
}

/* Android icon (FontAwesome brands) */
.device-os-icon.os-android {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 576 512'%3E%3Cpath fill='%23ffffff' d='M420.55 301.93a24 24 0 1 1 24-24 24 24 0 0 1-24 24m-265.1 0a24 24 0 1 1 24-24 24 24 0 0 1-24 24m273.7-144.48 47.94-83a10 10 0 1 0-17.27-10h0l-48.54 84.07a301.25 301.25 0 0 0-246.56 0L116.18 64.45a10 10 0 1 0-17.27 10h0l47.94 83C64.53 202.22 8.24 285.55 0 384H576c-8.24-98.45-64.54-181.78-146.85-226.55'/%3E%3C/svg%3E");
}

/* iOS icon (FontAwesome brands) */
.device-os-icon.os-ios {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 384 512'%3E%3Cpath fill='%23ffffff' d='M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z'/%3E%3C/svg%3E");
}

/* Default icon (generic device) */
.device-os-icon.os-default {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 512'%3E%3Cpath fill='%23ffffff' d='M384 96V320H64L64 96H384zM64 32C28.7 32 0 60.7 0 96V320c0 35.3 28.7 64 64 64H181.3l-10.7 32H96c-17.7 0-32 14.3-32 32s14.3 32 32 32H352c17.7 0 32-14.3 32-32s-14.3-32-32-32H277.3l-10.7-32H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm464 0c-26.5 0-48 21.5-48 48V432c0 26.5 21.5 48 48 48h64c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48H528zm16 64h32c8.8 0 16 7.2 16 16s-7.2 16-16 16H544c-8.8 0-16-7.2-16-16s7.2-16 16-16zm-16 80c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16s-7.2 16-16 16H544c-8.8 0-16-7.2-16-16zm32 224a32 32 0 1 1 0 64 32 32 0 1 1 0-64z'/%3E%3C/svg%3E");
}
            `;
            document.head.appendChild(style);
        }

        // ========================================
        // Sync Delay Notice Callout
        // ========================================
        const syncWarningCallout = containerEl.createDiv({ cls: 'callout', attr: { 'data-callout': 'info' } });
        const syncWarningTitle = syncWarningCallout.createDiv({ cls: 'callout-title' });
        const syncWarningIcon = syncWarningTitle.createDiv({ cls: 'callout-icon' });
        setIcon(syncWarningIcon, 'info');
        syncWarningTitle.createDiv({ cls: 'callout-title-inner', text: t('syncDelayTitle') });
        const syncWarningContent = syncWarningCallout.createDiv({ cls: 'callout-content' });
        syncWarningContent.createEl('p', { text: t('syncDelayContent') });

        // ========================================
        // Preset Management
        // ========================================
        containerEl.createEl('h3', { text: t('headerPresetManagement') });

        new Setting(containerEl)
            .setName(t('createPreset'))
            .setDesc(t('createPresetDesc'))
            .addText(text => {
                text.setPlaceholder(t('presetNamePlaceholder'));
                this._newPresetNameInput = text;
            })
            .addButton(btn => {
                btn.setIcon('plus');
                btn.setTooltip(t('addPreset'));
                btn.onClick(async () => {
                    const presetName = this._newPresetNameInput.getValue().trim();
                    if (!presetName) {
                        new Notice(t('presetNameRequired'), 3000);
                        return;
                    }

                    const exists = this.plugin.settings.presets.some(p => p.name === presetName);
                    if (exists) {
                        new Notice(t('presetNameExists'), 3000);
                        return;
                    }

                    await this.plugin.createPreset(presetName);
                    new Notice(`✓ ${t('presetCreated')}: ${presetName}`, 2000);
                    this.display();
                });
            });

        // ========================================
        // Drag and Drop Device Management
        // ========================================
        const deviceManagementHeader = containerEl.createDiv({ cls: 'setting-item-heading-with-button' });
        deviceManagementHeader.createEl('h4', { text: t('headerDeviceManagement') });

        const refreshBtn = deviceManagementHeader.createEl('button', { cls: 'clickable-icon' });
        refreshBtn.setAttribute('aria-label', t('refreshDeviceList'));
        setIcon(refreshBtn, 'refresh-cw');
        this._addEventListener(refreshBtn, 'click', async () => {
            // Reload settings (read from the file)
            await this.plugin.loadSettings();
            // Re-render the entire settings page
            this.display();
        });

        const dragContainer = containerEl.createDiv({ cls: 'preset-drag-container' });

        this.plugin.settings.presets.forEach(preset => {
            const presetSection = dragContainer.createDiv({ cls: 'preset-section' });

            const presetHeader = presetSection.createDiv({ cls: 'preset-header' });
            presetHeader.createEl('h5', {
                text: (preset.id === 'default-preset' && preset.targetDevices.length === 0)
                    ? `${preset.name} (${t('global')})`
                    : preset.name
            });

            const presetActions = presetHeader.createDiv({ cls: 'preset-actions' });

            const editBtn = presetActions.createEl('button', { cls: 'clickable-icon' });
            editBtn.setAttribute('aria-label', t('editPresetName'));
            setIcon(editBtn, 'edit');
            this._addEventListener(editBtn, 'click', async () => {
                new TextInputModal(
                    this.plugin.app,
                    t('editPresetName'),
                    t('presetNamePlaceholder'),
                    preset.name,
                    async (newName) => {
                        if (newName !== preset.name) {
                            await this.plugin.renamePreset(preset.id, newName);
                            this.display();
                        }
                    }
                ).open();
            });

            // Copy preset button
            const copyBtn = presetActions.createEl('button', { cls: 'clickable-icon' });
            copyBtn.setAttribute('aria-label', t('copyPresetCopy'));
            setIcon(copyBtn, 'copy');
            this._addEventListener(copyBtn, 'click', async () => {
                const copyName = `${preset.name}${t('copySuffix')}`;
                await this.plugin.copyPresetForDevice(preset.id, copyName);
                new Notice(`✓ ${t('presetCopied')}: ${copyName}`, 2000);
                this.display();
            });

            if (preset.id !== 'default-preset') {
                const deleteBtn = presetActions.createEl('button', { cls: 'clickable-icon' });
                deleteBtn.setAttribute('aria-label', t('deletePreset'));
                setIcon(deleteBtn, 'trash');
                this._addEventListener(deleteBtn, 'click', async () => {
                    showConfirmDialog(
                        this.plugin.app,
                        t('deletePreset'),
                        t('deletePresetWarning'),
                        async () => {
                            await this.plugin.deletePreset(preset.id);
                            // If the deleted preset is the one being edited, fall back to the current device preset (or global preset) so display() does not return early
                            if (this._activePresetId === preset.id) {
                                const fallbackPreset = this.plugin._getDevicePreset();
                                this._activePresetId = fallbackPreset ? fallbackPreset.id : 'default-preset';
                            }
                            this.display();
                        },
                        true  // isDangerous = true (dangerous operation)
                    );
                });
            }

            const devicesContainer = presetSection.createDiv({
                cls: 'devices-container',
                attr: { 'data-preset-id': preset.id }
            });

            if (preset.id === 'default-preset' && preset.targetDevices.length === 0) {
                devicesContainer.addClass('global-preset-zone');
            }

            this._addEventListener(devicesContainer, 'dragover', (e) => {
                e.preventDefault();
                devicesContainer.classList.add('drag-over');
            });

            this._addEventListener(devicesContainer, 'dragleave', () => {
                devicesContainer.classList.remove('drag-over');
            });

            this._addEventListener(devicesContainer, 'drop', async (e) => {
                e.preventDefault();
                devicesContainer.classList.remove('drag-over');

                const deviceId = e.dataTransfer.getData('text/plain');
                const targetPresetId = devicesContainer.dataset.presetId;

                await this.plugin.assignDeviceToPreset(deviceId, targetPresetId);
                this.display();
            });

            // Get the device list to display
            let devicesToShow = [];
            if (preset.id === 'default-preset' && preset.targetDevices.length === 0) {
                // Default global preset: show all unassigned devices
                const allDeviceIds = new Set();

                // Collect all known devices (from deviceNameMap)
                if (this.plugin.settings.deviceNameMap) {
                    Object.keys(this.plugin.settings.deviceNameMap).forEach(id => {
                        allDeviceIds.add(id);
                    });
                }

                // Find unassigned devices (not in any custom preset's targetDevices)
                const assignedDevices = new Set();
                this.plugin.settings.presets.forEach(p => {
                    if (p.targetDevices.length > 0) {
                        p.targetDevices.forEach(id => assignedDevices.add(id));
                    }
                });

                devicesToShow = Array.from(allDeviceIds).filter(id => !assignedDevices.has(id));
            } else {
                // Custom preset: show its targetDevices
                devicesToShow = preset.targetDevices;
            }

            if (devicesToShow.length === 0) {
                devicesContainer.createEl('p', {
                    text: t('dragDeviceHere'),
                    cls: 'setting-item-description'
                });
            } else {
                devicesToShow.forEach(deviceId => {
                    const deviceName = this.plugin._getDeviceName(deviceId);
                    const isCurrent = deviceId === this.plugin.currentDeviceId;

                    const deviceItem = devicesContainer.createDiv({
                        cls: 'device-item'
                    });

                    // OS icon + device name container
                    const deviceInfoContainer = deviceItem.createDiv({
                        attr: { style: 'display: flex; align-items: center; gap: 8px; flex: 1;' }
                    });

                    // OS icon (using CSS class)
                    const osIcon = deviceInfoContainer.createSpan({
                        cls: 'device-os-icon'
                    });

                    // Operating system: read the metadata each device recorded about itself.
                    // Never infer it from the device name — the name is user-editable, so a rename
                    // used to flip the icon to the wrong OS.
                    const osIconClasses = {
                        android: 'os-android',
                        ios: 'os-ios',
                        ipados: 'os-ipados',
                        windows: 'os-windows',
                        macos: 'os-macos',
                        linux: 'os-linux'
                    };
                    const detectedOs = this.plugin._getDeviceOs(deviceId);
                    osIcon.addClass(osIconClasses[detectedOs] || 'os-default');

                    // Device name + descriptive sub-line
                    const textContainer = deviceInfoContainer.createDiv({
                        attr: { style: 'display: flex; flex-direction: column; gap: 2px; min-width: 0;' }
                    });

                    textContainer.createSpan({
                        text: isCurrent ? `${deviceName} (${t('currentDevice')})` : deviceName,
                        cls: 'device-name'
                    });

                    // Sub-line: what the machine actually is, then which OS it runs.
                    //
                    // The identifier is the hostname on a desktop and the model on a phone
                    // (Android exposes one; iOS does not, so it falls back to the device family).
                    // It is skipped when the display name already is that identifier, so a device
                    // left on its default name does not read twice.
                    //
                    // No OS version is shown: a system upgrade would change it constantly.
                    const metaParts = [];
                    const identifier = this.plugin._getDeviceHostname(deviceId)
                        || this.plugin._getDeviceModel(deviceId);

                    if (identifier && identifier !== deviceName) {
                        metaParts.push(identifier);
                    }

                    // Devices that have not reported in since this version simply show no
                    // sub-line until their next launch.
                    const osLabels = {
                        android: 'Android',
                        ios: 'iOS',
                        ipados: 'iPadOS',
                        windows: 'Windows',
                        macos: 'macOS',
                        linux: 'Linux'
                    };
                    const osText = osLabels[detectedOs];

                    if (osText && osText !== identifier) {
                        metaParts.push(osText);
                    }

                    if (metaParts.length > 0) {
                        textContainer.createSpan({
                            text: metaParts.join(' · '),
                            cls: 'device-meta'
                        });
                    }

                    // Button container
                    const btnContainer = deviceItem.createDiv({ cls: 'device-actions' });

                    // Edit button (shown for all devices) - uses a white icon
                    const editBtn = btnContainer.createEl('button', {
                        cls: 'clickable-icon',
                        attr: {
                            'aria-label': t('editDeviceName'),
                            style: 'color: var(--text-on-accent);' // white icon
                        }
                    });
                    setIcon(editBtn, 'edit');
                    this._addEventListener(editBtn, 'click', async (e) => {
                        e.stopPropagation();

                        new TextInputModal(
                            this.plugin.app,
                            t('editDeviceName'),
                            t('deviceNamePlaceholder'),
                            deviceName,
                            async (newName) => {
                                if (newName !== deviceName) {
                                    await this.plugin.updateDeviceName(deviceId, newName);
                                    this.display();
                                }
                            }
                        ).open();
                    });

                    // Delete button (only shown for non-current devices)
                    if (!isCurrent) {
                        const removeBtn = btnContainer.createEl('button', {
                            cls: 'clickable-icon',
                            attr: { 'aria-label': t('removeDevice') }
                        });
                        setIcon(removeBtn, 'trash-2');
                        this._addEventListener(removeBtn, 'click', async (e) => {
                            e.stopPropagation();

                            showConfirmDialog(
                                this.plugin.app,
                                t('removeDevice'),
                                t('confirmRemoveDevice').replace('{0}', deviceName),
                                async () => {
                                    await this.plugin.removeDeviceFromPresets(deviceId);
                                    this.display();
                                },
                                true  // isDangerous = true
                            );
                        });
                    }

                    if (isCurrent) {
                        deviceItem.addClass('current-device');
                    }

                    if (Platform.isMobile) {
                        const moveBtn = btnContainer.createEl('button', {
                            cls: 'clickable-icon',
                            attr: { 'aria-label': t('moveDeviceToPreset') }
                        });
                        setIcon(moveBtn, 'move');
                        this._addEventListener(moveBtn, 'click', async (e) => {
                            e.stopPropagation();

                            const selectEl = document.createElement('select');
                            selectEl.style.cssText = 'position: absolute; opacity: 0; pointer-events: none;';

                            this.plugin.settings.presets.forEach(p => {
                                const option = selectEl.appendChild(document.createElement('option'));
                                option.value = p.id;
                                option.text = (p.id === 'default-preset' && p.targetDevices.length === 0)
                                    ? `${p.name} (${t('global')})`
                                    : p.name;
                            });

                            const currentPreset = this.plugin.settings.presets.find(p =>
                                p.targetDevices.includes(deviceId)
                            );
                            if (currentPreset) {
                                selectEl.value = currentPreset.id;
                            }

                            document.body.appendChild(selectEl);
                            selectEl.focus();
                            selectEl.click();

                            selectEl.addEventListener('change', async () => {
                                const targetPresetId = selectEl.value;
                                await this.plugin.assignDeviceToPreset(deviceId, targetPresetId);
                                new Notice(`✓ ${t('deviceReassigned')}`, 2000);
                                this.display();
                                selectEl.remove();
                            });

                            selectEl.addEventListener('blur', () => {
                                selectEl.remove();
                            });
                        });
                    }

                    deviceItem.draggable = true;
                    this._addEventListener(deviceItem, 'dragstart', (e) => {
                        e.dataTransfer.setData('text/plain', deviceId);
                        deviceItem.classList.add('dragging');
                    });

                    this._addEventListener(deviceItem, 'dragend', () => {
                        deviceItem.classList.remove('dragging');
                    });
                });
            }

            // Global zone footer: an explicit, confirmed cleanup for stale device entries.
            // Shown only where duplicates actually surface, and it lists exactly which devices
            // would go, so nothing is removed silently.
            if (preset.id === 'default-preset' && preset.targetDevices.length === 0) {
                const cleanupFooter = presetSection.createDiv({ cls: 'device-cleanup-footer' });

                const cleanupBtn = cleanupFooter.createEl('button', {
                    text: t('cleanupDevices'),
                    cls: 'mod-warning'
                });

                this._addEventListener(cleanupBtn, 'click', async () => {
                    const prunable = this.plugin.getPrunableDevices();

                    if (prunable.length === 0) {
                        new Notice(t('cleanupDevicesNone'), 3000);
                        return;
                    }

                    const deviceNames = prunable.map(device => device.name).join('、');

                    showConfirmDialog(
                        this.plugin.app,
                        t('cleanupDevices'),
                        t('confirmCleanupDevices').replace('{0}', deviceNames),
                        async () => {
                            const removedCount = await this.plugin.pruneUnboundDevices();
                            new Notice(`✓ ${t('cleanupDevicesDone').replace('{0}', String(removedCount))}`, 3000);
                            this.display();
                        },
                        true  // isDangerous = true
                    );
                });
            }
        });

        // ========================================
        // Device Preset Assignment
        // ========================================
        containerEl.createEl('h4', { text: t('devicePresetManagement'), cls: 'setting-item-heading' });

        const devicePreset = this.plugin._getDevicePreset();

        new Setting(containerEl)
            .setName(t('currentDevicePreset'))
            .setDesc(t('currentDevicePresetDesc'))
            .addDropdown(dropdown => {
                this.plugin.settings.presets.forEach(preset => {
                    const label = (preset.id === 'default-preset' && preset.targetDevices.length === 0)
                        ? `${preset.name} (${t('global')})`
                        : preset.name;
                    dropdown.addOption(preset.id, label);
                });

                dropdown.setValue(devicePreset ? devicePreset.id : 'default-preset');

                dropdown.onChange(async (newPresetId) => {
                    await this.plugin.assignDeviceToPreset(this.plugin.currentDeviceId, newPresetId);
                    new Notice(`✓ ${t('deviceReassigned')}`, 2000);
                    this.display();
                });
            })
            .addButton(btn => {
                btn.setIcon('refresh-cw');
                btn.setTooltip(t('refreshDeviceList'));
                btn.onClick(() => this.display());
            });

        new Setting(containerEl)
            .setName(t('copyPresetCopy'))
            .setDesc(t('copyPresetCopyDesc'))
            .addButton(btn => {
                btn.setButtonText(t('copyPresetCopy'));
                btn.onClick(async () => {
                    const devicePreset = this.plugin._getDevicePreset();
                    const copyName = `${devicePreset.name}${t('copySuffix')}`;
                    await this.plugin.copyPresetForDevice(devicePreset.id, copyName);
                    new Notice(`✓ ${t('presetCopied')}: ${copyName}`, 2000);
                    this.display();
                });
            });

        // ========================================
        // Directory Configuration
        // ========================================
        containerEl.createEl('h3', { text: t('headerDirectoryConfig') });

        new Setting(containerEl)
            .setName(t('fontSourceDir'))
            .setDesc(t('fontSourceDirDesc'))
            .addText(text => text
                .setPlaceholder('Components/Library/Fonts')
                .setValue(this.plugin.settings.fontSourceDir)
                .onChange(async (value) => {
                    this.plugin.settings.fontSourceDir = value;
                    await this.plugin.saveSettings();
                })
            )
            .addButton(btn => btn
                .setButtonText(t('scanFonts'))
                .onClick(async () => {
                    await this.plugin.scanFonts();
                    new Notice('✓ Font list updated');
                    this.display();
                })
            );

        new Setting(containerEl)
            .setName(t('cacheDir'))
            .setDesc(t('cacheDirDesc'))
            .addText(text => text
                .setPlaceholder('Components/Library/Fonts/B64Font')
                .setValue(this.plugin.settings.b64OutputDir)
                .onChange(async (value) => {
                    this.plugin.settings.b64OutputDir = value;
                    await this.plugin.saveSettings();
                })
            );

        // Startup settings
        new Setting(containerEl)
            .setName(t('autoLoad'))
            .setDesc(t('autoLoadDesc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.autoLoadOnStartup)
                .onChange(async (value) => {
                    this.plugin.settings.autoLoadOnStartup = value;
                    await this.plugin.saveSettings();
                })
            );

        // ========================================
        // Font Application Settings
        // ========================================
        containerEl.createEl('h3', { text: t('headerFontApplication') });

        // Preset selector (select the preset to configure)
        const currentDevicePreset = this.plugin._getDevicePreset();

        // If _activePresetId is not explicitly set, default to the current device's preset
        if (!this._activePresetId) {
            this._activePresetId = currentDevicePreset ? currentDevicePreset.id : 'default-preset';
        }

        new Setting(containerEl)
            .setName(t('selectPresetToEdit'))
            .setDesc(t('selectPresetToEditDesc'))
            .addDropdown(dropdown => {
                // Populate all presets as options
                this.plugin.settings.presets.forEach(preset => {
                    const label = (preset.id === 'default-preset' && preset.targetDevices.length === 0)
                        ? `${preset.name} (${t('global')})`
                        : preset.name;
                    dropdown.addOption(preset.id, label);
                });

                // Set the currently edited preset
                dropdown.setValue(this._activePresetId);

                // Switch the currently edited preset
                dropdown.onChange(async (newPresetId) => {
                    this._activePresetId = newPresetId;
                    this.display(); // refresh the UI to show the selected preset font config
                });
            });

        // Show info about the currently edited preset
        const activePreset = this.plugin.settings.presets.find(p => p.id === this._activePresetId);
        if (activePreset) {
            const presetInfoEl = containerEl.createDiv({
                cls: 'callout',
                attr: { 'data-callout': 'example' }
            });

            const presetInfoTitle = presetInfoEl.createDiv({ cls: 'callout-title' });
            const presetInfoIcon = presetInfoTitle.createDiv({ cls: 'callout-icon' });
            setIcon(presetInfoIcon, 'list-checks');
            presetInfoTitle.createDiv({
                cls: 'callout-title-inner',
                text: `${t('presetName')}: ${activePreset.name}`
            });

            const presetInfoContent = presetInfoEl.createDiv({ cls: 'callout-content' });

            presetInfoContent.createEl('p', {
                text: `${t('presetId')}: ${activePreset.id}`,
                attr: { style: 'margin: 0; font-family: var(--font-monospace); color: var(--text-muted);' }
            });

            // If it is the global preset, show a notice
            if (activePreset.id === 'default-preset' && activePreset.targetDevices.length === 0) {
                const warningContainer = presetInfoContent.createEl('p', {
                    attr: {
                        style: 'margin: 8px 0 0 0; color: var(--text-warning); display: flex; align-items: center; gap: 6px;'
                    }
                });
                const warningIcon = warningContainer.createSpan({ cls: 'warning-icon' });
                setIcon(warningIcon, 'alert-triangle');
                warningIcon.style.display = 'inline-flex';
                warningIcon.style.flexShrink = '0';
                warningContainer.createSpan({ text: t('usingGlobalPreset') });
            }
        }

        const fontTypes = [
            { key: 'ui', name: t('uiFontName'), desc: t('uiFontDesc') },
            {
                key: 'text',
                name: t('textFontName'),
                desc: t('textFontDesc'),
                supportsLatin: true
            },
            {
                key: 'heading',
                name: t('headingFontName'),
                desc: t('headingFontDesc'),
                supportsFileTitle: true,
                specialOptions: ['text', 'ui']
            },
            {
                key: 'monospace',
                name: t('monospaceFontName'),
                desc: t('monospaceFontDesc')
            },
            {
                key: 'math',
                name: t('mathFontName'),
                desc: t('mathFontDesc')
            }
        ];

        // Get activePreset outside the loop so all onChange callbacks reference the same object
        const activePresetForFonts = this.plugin.settings.presets.find(p => p.id === this._activePresetId);
        if (!activePresetForFonts) {
            console.error('[LocalFontLoader] Active preset not found:', this._activePresetId);
            return;
        }
        const activePresetFonts = activePresetForFonts.fonts || {};

        for (const fontType of fontTypes) {
            const settingItem = new Setting(containerEl)
                .setName(fontType.name)
                .setDesc(fontType.desc);

            // Check if the font referenced by the current preset exists
            // Reuse isFontAvailable: exempts empty strings and the use-text-font / use-ui-font sentinel values
            const selectedFont = activePresetFonts[fontType.key];
            const fontExists = this.plugin.isFontAvailable(selectedFont);

            // If the font does not exist, add a warning icon after the name
            if (selectedFont && !fontExists) {
                const warningIcon = settingItem.nameEl.createSpan({ cls: 'font-missing-icon' });
                setIcon(warningIcon, 'x');
                warningIcon.style.color = 'var(--text-error)';
                warningIcon.style.marginLeft = '8px';
                warningIcon.setAttribute('aria-label', t('fontNotFound'));
            }

            // Math font: flag a font that MathJax cannot lay out correctly. Checked once here and
            // reused for the callout below, so the two indicators can never disagree.
            const mathVerdict = (fontType.key === 'math' && selectedFont && fontExists)
                ? this.plugin._evaluateMathFont(selectedFont)
                : null;

            if (mathVerdict && (mathVerdict.status === 'mismatch' || mathVerdict.status === 'notMathFont')) {
                const mathWarningIcon = settingItem.nameEl.createSpan({ cls: 'font-incompatible-icon' });
                setIcon(mathWarningIcon, 'alert-triangle');
                mathWarningIcon.style.color = 'var(--text-warning)';
                mathWarningIcon.style.marginLeft = '8px';
                mathWarningIcon.setAttribute('aria-label', t(
                    mathVerdict.status === 'notMathFont' ? 'mathFontNotMathTitle' : 'mathFontMismatchTitle'
                ));
            }

            settingItem.addDropdown(dropdown => {
                    dropdown.addOption('', t('systemDefault'));

                    // If specialOptions exist, add the special options
                    if (fontType.specialOptions) {
                        fontType.specialOptions.forEach(optKey => {
                            if (optKey === 'text') {
                                dropdown.addOption('use-text-font', t('headingUseTextFont'));
                            } else if (optKey === 'ui') {
                                dropdown.addOption('use-ui-font', t('headingUseUIFont'));
                            }
                        });
                    }

                    // Use the font family list (deduplicated)
                    const uniqueFamilies = new Set();
                    this.plugin.settings.availableFonts.forEach(font => {
                        const familyName = font.familyName || font.name;
                        uniqueFamilies.add(familyName);
                    });

                    // Add an option for each family (showing variant info)
                    Array.from(uniqueFamilies).sort().forEach(familyName => {
                        const familyFonts = this.plugin.settings.availableFonts.filter(f =>
                            (f.familyName || f.name) === familyName
                        );

                        const allConverted = familyFonts.every(f => f.hasB64);

                        // Show only the font name, adding a checkmark for converted fonts
                        const label = allConverted ? `${familyName} ✓` : familyName;

                        dropdown.addOption(familyName, label);
                    });

                    // Read the value from the edited preset
                    dropdown.setValue(activePresetForFonts.fonts[fontType.key]);
                    dropdown.onChange(async (value) => {
                        // Write to the edited preset
                        activePresetForFonts.fonts[fontType.key] = value;
                        await this.plugin.saveSettings();

                        // If the edited preset is the current device's preset, apply fonts immediately
                        const currentDevicePreset = this.plugin._getDevicePreset();
                        if (currentDevicePreset && currentDevicePreset.id === activePresetForFonts.id) {
                            await this.plugin.applyFonts();
                        }

                        // Refresh the UI to show the variant warning
                        // Use requestAnimationFrame so DOM ops run in the next frame, avoiding double renders
                        requestAnimationFrame(() => {
                            this.display();
                        });
                    });
                });

            // Add a variant warning below the setting item (using callout syntax)
            if (activePresetForFonts.fonts[fontType.key]) {
                const fontForVariantCheck = activePresetForFonts.fonts[fontType.key];
                const variants = this.plugin.settings.availableFonts.filter(f =>
                    (f.familyName || f.name) === fontForVariantCheck
                );

                // Text Font: recommend 4 variants (only show for Latin fonts)
                if (fontType.key === 'text' && variants.length > 0 && variants.length < 4) {
                    const variantList = variants.map(f => f.variantType || 'unknown').join(', ');

                    // Check if it is a Latin font
                    const isLatin = this._isLatinFont(fontForVariantCheck);

                    if (isLatin) {
                        // Latin font: show full warning with non-Latin hint inside callout
                        const warningCallout = containerEl.createDiv({ attr: { style: 'margin: 8px 0 16px 0;' } });

                        const warningMd = `> [!warning] ${t('incompleteVariantTitle')}
> ${t('incompleteVariantBody', { fontFamily: fontForVariantCheck, variantCount: variants.length, variantList })}`;

                        MarkdownRenderer.render(this.app, warningMd, warningCallout, '', this);
                    }
                    // Non-Latin fonts: no warning needed
                }

                // Monospace Font: must be monospace
                if (fontType.key === 'monospace') {
                    const infoCallout = containerEl.createDiv({ attr: { style: 'margin: 8px 0 16px 0;' } });

                    const infoMd = `> [!info] ${t('monospaceRequirement')}
> ${t('monospaceRequirementBody')}`;

                    MarkdownRenderer.render(this.app, infoMd, infoCallout, '', this);
                }

                // Math Font: must be specialized math font
                if (fontType.key === 'math') {
                    const infoCallout = containerEl.createDiv({ attr: { style: 'margin: 8px 0 16px 0;' } });

                    if (mathVerdict && mathVerdict.status === 'notMathFont') {
                        const warningMd = `> [!warning] ${t('mathFontNotMathTitle')}
> ${t('mathFontNotMathBody', { fontFamily: selectedFont, missing: (mathVerdict.missing || []).join(', ') })}`;

                        MarkdownRenderer.render(this.app, warningMd, infoCallout, '', this);
                    } else if (mathVerdict && mathVerdict.status === 'mismatch') {
                        // List the offending metrics, so the warning says which measurements failed
                        // rather than just asserting incompatibility.
                        const detail = mathVerdict.deviations
                            .map(d => `${d.metric}: ${d.actual}em (MathJax ${d.expected}em, ±${d.percent}%)`)
                            .join('\n> ');

                        const warningMd = `> [!warning] ${t('mathFontMismatchTitle')}
> ${t('mathFontMismatchBody', { fontFamily: selectedFont })}
>
> ${detail}`;

                        MarkdownRenderer.render(this.app, warningMd, infoCallout, '', this);
                    } else {
                        const infoMd = `> [!info] ${t('mathFontRequirement')}
> ${t('mathFontRequirementBody')}`;

                        MarkdownRenderer.render(this.app, infoMd, infoCallout, '', this);
                    }
                }
            }

            // If it is the Body Text Font, add Latin font separation options
            if (fontType.supportsLatin) {
                this.addLatinFontOptions(containerEl, activePresetForFonts);
            }

            // If it is the Heading Font, add the "apply to file title" option (only shown when use-text-font is not selected)
            if (fontType.supportsFileTitle) {
                const currentValue = activePresetForFonts.fonts[fontType.key];
                if (currentValue && currentValue !== 'use-text-font') {
                    this.addFileTitleOption(containerEl, activePresetForFonts);
                }
            }
        }

        // ========================================
        // Font File Configuration
        // ========================================
        containerEl.createEl('h3', { text: t('headerFontFileConfig') });

        // Filter state (stored on this to persist across re-renders)
        if (!this._fontFilter) {
            this._fontFilter = 'all'; // 'all' | 'converted' | 'notConverted' | 'notExist'
        }

        // Button group container (filter + expand/collapse)
        const buttonContainerEl = containerEl.createDiv({
            attr: {
                style: 'margin-bottom: 12px; padding: 12px; background: var(--background-secondary); border-radius: 8px; display: flex; gap: 16px; flex-wrap: wrap; align-items: center;'
            }
        });

        // Filter button group
        const filterGroup = buttonContainerEl.createDiv({
            attr: { style: 'display: flex; gap: 8px; align-items: center; flex-wrap: wrap;' }
        });

        // Filter button config
        const filterButtons = [
            { filter: 'all', icon: 'list', label: t('filterAll') || '全部' },
            { filter: 'converted', icon: 'check', label: t('legendConverted') },
            { filter: 'cachedOnly', icon: 'database', label: t('legendCachedOnly') },
            { filter: 'notConverted', icon: 'circle', label: t('legendNotConverted') },
            { filter: 'notExist', icon: 'help-circle', label: t('legendNotExist') }
        ];

        const filterButtonElements = [];
        filterButtons.forEach(btnConfig => {
            const isActive = this._fontFilter === btnConfig.filter;
            const btn = filterGroup.createEl('button', {
                attr: {
                    style: `
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        padding: 4px 10px;
                        border-radius: 4px;
                        border: 1px solid var(--background-modifier-border);
                        background: ${isActive ? 'var(--interactive-accent)' : 'var(--background-primary)'};
                        color: ${isActive ? 'var(--text-on-accent)' : 'var(--text-normal)'};
                        cursor: pointer;
                        font-size: 0.85em;
                        transition: all 0.2s ease;
                    `,
                    'aria-label': btnConfig.label
                }
            });

            const iconEl = btn.createSpan({ attr: { style: 'display: inline-flex; align-items: center;' } });
            setIcon(iconEl, btnConfig.icon);
            btn.createSpan({ text: btnConfig.label });

            filterButtonElements.push({ btn, filter: btnConfig.filter });
        });

        // Add a separator
        buttonContainerEl.createDiv({
            attr: { style: 'width: 1px; height: 24px; background: var(--background-modifier-border);' }
        });

        // Expand/collapse button group
        const expandCollapseGroup = buttonContainerEl.createDiv({
            attr: { style: 'display: flex; gap: 8px; align-items: center;' }
        });

        // Expand all button
        const expandAllBtn = expandCollapseGroup.createEl('button', {
            attr: {
                style: `
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 10px;
                    border-radius: 4px;
                    border: 1px solid var(--background-modifier-border);
                    background: var(--background-primary);
                    color: var(--text-normal);
                    cursor: pointer;
                    font-size: 0.85em;
                    transition: all 0.2s ease;
                `,
                'aria-label': t('expandAll')
            }
        });
        const expandIcon = expandAllBtn.createSpan({ attr: { style: 'display: inline-flex; align-items: center;' } });
        setIcon(expandIcon, 'chevrons-down');
        expandAllBtn.createSpan({ text: t('expandAll') });

        this._addEventListener(expandAllBtn, 'click', () => {
            const allFamilies = fontListEl.querySelectorAll('.font-family-item');
            allFamilies.forEach(familyItem => {
                const toggle = familyItem.querySelector('.font-family-toggle');
                const variants = familyItem.querySelector('.font-variants');
                if (toggle && variants && variants.style.display === 'none') {
                    toggle.style.transform = 'rotate(90deg)';
                    variants.style.display = 'block';
                }
            });
        });

        // Collapse all button
        const collapseAllBtn = expandCollapseGroup.createEl('button', {
            attr: {
                style: `
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 10px;
                    border-radius: 4px;
                    border: 1px solid var(--background-modifier-border);
                    background: var(--background-primary);
                    color: var(--text-normal);
                    cursor: pointer;
                    font-size: 0.85em;
                    transition: all 0.2s ease;
                `,
                'aria-label': t('collapseAll')
            }
        });
        const collapseIcon = collapseAllBtn.createSpan({ attr: { style: 'display: inline-flex; align-items: center;' } });
        setIcon(collapseIcon, 'chevrons-up');
        collapseAllBtn.createSpan({ text: t('collapseAll') });

        this._addEventListener(collapseAllBtn, 'click', () => {
            const allFamilies = fontListEl.querySelectorAll('.font-family-item');
            allFamilies.forEach(familyItem => {
                const toggle = familyItem.querySelector('.font-family-toggle');
                const variants = familyItem.querySelector('.font-variants');
                if (toggle && variants && variants.style.display !== 'none') {
                    toggle.style.transform = 'rotate(0deg)';
                    variants.style.display = 'none';
                }
            });
        });

        // Legend container (independent of the button group)
        const legendEl = containerEl.createDiv({
            attr: {
                style: 'margin-bottom: 16px; padding: 12px; background: var(--background-secondary); border-radius: 8px; display: flex; justify-content: space-between; align-items: center; gap: 16px; font-size: 0.9em;'
            }
        });

        // Legend (left side)
        const legendsContainer = legendEl.createDiv({
            attr: { style: 'display: flex; gap: 16px; flex-wrap: wrap; align-items: center;' }
        });

        // "Font File Status" label
        legendsContainer.createDiv({
            text: t('fontFileStatus'),
            attr: { style: 'font-weight: 600; color: var(--text-normal);' }
        });

        // Vertical separator
        legendsContainer.createDiv({
            attr: { style: 'width: 1px; height: 20px; background: var(--background-modifier-border);' }
        });

        const legends = [
            { icon: 'check', color: 'var(--color-green)', text: t('legendConverted') },
            { icon: 'circle', color: 'var(--text-muted)', text: t('legendNotConverted') },
            { icon: 'check', color: 'var(--interactive-accent)', text: t('legendCachedOnly') },
            { icon: 'help-circle', color: 'var(--text-error)', text: t('legendNotExist') }
        ];

        legends.forEach(legend => {
            const item = legendsContainer.createDiv({
                attr: { style: 'display: flex; align-items: center; gap: 6px;' }
            });
            const iconEl = item.createSpan({ attr: { style: `color: ${legend.color};` } });
            setIcon(iconEl, legend.icon);
            item.createSpan({ text: legend.text });
        });

        // Refresh scan button (right side)
        const rescanBtn = legendEl.createEl('button', {
            attr: {
                style: `
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    border-radius: 4px;
                    border: 1px solid var(--background-modifier-border);
                    background: var(--background-primary);
                    color: var(--text-normal);
                    cursor: pointer;
                    font-size: 0.9em;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                `,
                'aria-label': t('rescanFonts') || '重新扫描'
            }
        });

        const rescanIcon = rescanBtn.createSpan({ attr: { style: 'display: inline-flex; align-items: center;' } });
        setIcon(rescanIcon, 'rotate-cw');
        rescanBtn.createSpan({ text: t('rescanFonts') || '重新扫描' });

        this._addEventListener(rescanBtn, 'click', async () => {
            rescanBtn.disabled = true;
            rescanBtn.style.opacity = '0.5';
            await this.plugin.scanFonts();
            new Notice(t('fontsRescanned') || '✓ 字体已重新扫描');

            // Re-render so the font dropdowns pick up the rescanned list — they read
            // settings.availableFonts when they are built, so without this the new families stay
            // invisible until the settings tab is reopened by hand.
            this.display();
        });

        // Font list (must be defined first for the button event listeners)
        const fontListEl = containerEl.createDiv({
            attr: {
                style: 'margin: 10px 0; padding: 10px; background: var(--background-secondary); border-radius: 8px; max-height: 400px; overflow-y: auto;'
            }
        });

        // Now add the event listeners for the filter buttons
        filterButtonElements.forEach(({ btn, filter }) => {
            this._addEventListener(btn, 'click', () => {
                this._fontFilter = filter;

                // Only refresh the font list and button states, not the whole page
                fontListEl.empty();
                if (this.plugin.settings.availableFonts.length === 0) {
                    fontListEl.createEl('div', {
                        text: t('notFoundFontFamily'),
                        attr: { style: 'color: var(--text-muted); font-size: 0.9em; text-align: center; padding: 20px;' }
                    });
                } else {
                    this.renderFontFamilies(fontListEl, this._fontFilter);
                }

                // Update all buttons' active states
                filterButtonElements.forEach(({ btn: button, filter: f }) => {
                    const isActive = this._fontFilter === f;
                    button.style.background = isActive ? 'var(--interactive-accent)' : 'var(--background-primary)';
                    button.style.color = isActive ? 'var(--text-on-accent)' : 'var(--text-normal)';
                });
            });
        });

        // Initialize the font list content
        if (this.plugin.settings.availableFonts.length === 0) {
            fontListEl.createEl('div', {
                text: t('notFoundFontFamily'),
                attr: { style: 'color: var(--text-muted); font-size: 0.9em; text-align: center; padding: 20px;' }
            });
        } else {
            // Display by family (collapsible), passing the filter parameter
            this.renderFontFamilies(fontListEl, this._fontFilter);
        }

        // Font file operation buttons
        const fontOperationsEl = containerEl.createDiv({
            attr: {
                style: 'display: flex; gap: 12px; margin: 16px 0;'
            }
        });

        // Import fonts
        const importBtn = fontOperationsEl.createEl('button', {
            text: t('importFont'),
            attr: {
                style: 'flex: 1; padding: 12px; cursor: pointer;',
                class: 'mod-cta'
            }
        });

        // Use a Modal popup to avoid the file chooser user-activation issue
        this._addEventListener(importBtn, 'click', () => {
            const modal = new FontImportModal(
                this.plugin.app,
                this.plugin,
                async (files) => {
                    importBtn.disabled = true;
                    importBtn.textContent = t('importing') || '导入中...';

                    try {
                        await this.plugin.importFontsFromFiles(files);
                        new Notice(t('importedFonts', { count: files.length }));
                        await this.plugin.scanFonts();
                        this._debouncedDisplay();
                    } catch (error) {
                        console.error('[Local Font Loader] Import failed:', error);
                        new Notice(t('importError') || '导入失败');
                    } finally {
                        importBtn.disabled = false;
                        importBtn.textContent = t('importFont');
                    }
                }
            );
            modal.open();
        });

        // Convert all fonts
        const convertBtn = fontOperationsEl.createEl('button', {
            text: t('convertAllFonts'),
            attr: {
                style: 'flex: 1; padding: 12px; cursor: pointer;'
            }
        });
        this._addEventListener(convertBtn, 'click', async () => {
            convertBtn.disabled = true;
            convertBtn.textContent = t('converting') || '转换中...';
            await this.plugin.convertAllFonts();
            new Notice(t('allFontsConverted') || '✓ 所有字体已转换');

            // Re-render so newly converted families show their ✓ and become selectable.
            // This rebuilds the button too, so its label and disabled state no longer need
            // restoring by hand here.
            this.display();
        });

        // ========================================
        // Fallback operations
        // ========================================
        containerEl.createEl('h3', { text: t('headerFallback') });

        // Delete Unused Fonts
        new Setting(containerEl)
            .setName(t('deleteUnusedFonts'))
            .setDesc(t('deleteUnusedFontsDesc'))
            .addButton(btn => btn
                .setButtonText(t('deleteUnusedFonts'))
                .setWarning()
                .onClick(async () => {
                    const unusedFonts = this._getUnusedFonts();
                    if (unusedFonts.length === 0) {
                        new Notice(t('noUnusedFonts'));
                        return;
                    }

                    showConfirmDialog(
                        this.plugin.app,
                        t('confirmDelete'),
                        t('confirmDeleteUnusedFonts').replace('{count}', unusedFonts.length),
                        async () => {
                            await this.deleteUnusedFonts();
                        },
                        true  // isDangerous = true
                    );
                })
            );

        // Clear Cache
        new Setting(containerEl)
            .setName(t('clearCache'))
            .setDesc(t('clearCacheDesc'))
            .addButton(btn => btn
                .setButtonText(t('clearCache'))
                .setWarning()
                .onClick(async () => {
                    await this.plugin.clearCache();
                    this.display();
                })
            );

        // Apply Now
        new Setting(containerEl)
            .setName(t('applyNow'))
            .setDesc(t('applyNowDesc'))
            .addButton(btn => btn
                .setButtonText(t('applyFonts'))
                .setCta()
                .onClick(async () => {
                    await this.plugin.applyFonts();
                    new Notice(t('fontsApplied'));
                })
            );

        // Restore the scroll position (after all UI is built)
        if (scrollParent && savedScrollTop > 0) {
            // Use double requestAnimationFrame to ensure the DOM is fully rendered
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
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
        MarkdownRenderer.render(
            this.app,
            exampleMarkdown,
            exampleCalloutEl,
            '',
            this
        );

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

                    const uniqueFamilies = new Set();
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
                        requestAnimationFrame(() => {
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

                    MarkdownRenderer.render(
                        this.app,
                        warningMarkdown,
                        warningCalloutEl,
                        '',
                        this
                    );
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
                } catch (err) {
                    // Cache may not exist
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
                        } catch (error) {
                            // Ignore cache deletion errors
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
            clearTimeout(this._displayDebounceTimer);
            this._displayDebounceTimer = null;
        }
        this._cleanupEventListeners();
        // The settings-changed handler's lifecycle is owned by plugin.registerEvent;
        // it is auto-unbound on unload and no longer unregistered in hide() (avoids losing sync after the first close).
        super.hide();
    }
}
