/**
 * Font file status: scanning, conversion and deletion.
 *
 * One section of the settings tab. Extracted from a single 1400-line display() method so that
 * each part can be read, reviewed and changed on its own.
 */

import { Notice, setIcon, MarkdownRenderer } from 'obsidian';

import { t } from '../../i18n';
import { FontImportModal } from '../modals';
import type FontManagerSettingTab from '../settings-tab';

/**
 * Renders this section into the given container.
 *
 * @param tab - The settings tab, for access to the plugin and shared helpers
 * @param containerEl - Where to append the section
 */
export function renderFontStatusSection(tab: FontManagerSettingTab, containerEl: HTMLElement): void {
        // ========================================
        // Font File Configuration
        // ========================================
        containerEl.createEl('h3', { text: t('headerFontFileConfig') });

        // Filter state (stored on this to persist across re-renders)
        if (!tab._fontFilter) {
            tab._fontFilter = 'all'; // 'all' | 'converted' | 'notConverted' | 'notExist'
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
            const isActive = tab._fontFilter === btnConfig.filter;
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

        tab._addEventListener(expandAllBtn, 'click', () => {
            const allFamilies = fontListEl.querySelectorAll('.font-family-item');
            allFamilies.forEach(familyItem => {
                const toggle = familyItem.querySelector<HTMLElement>('.font-family-toggle');
                const variants = familyItem.querySelector<HTMLElement>('.font-variants');
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

        tab._addEventListener(collapseAllBtn, 'click', () => {
            const allFamilies = fontListEl.querySelectorAll('.font-family-item');
            allFamilies.forEach(familyItem => {
                const toggle = familyItem.querySelector<HTMLElement>('.font-family-toggle');
                const variants = familyItem.querySelector<HTMLElement>('.font-variants');
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

        tab._addEventListener(rescanBtn, 'click', async () => {
            rescanBtn.disabled = true;
            rescanBtn.style.opacity = '0.5';
            await tab.plugin.scanFonts();
            new Notice(t('fontsRescanned') || '✓ 字体已重新扫描');

            // Re-render so the font dropdowns pick up the rescanned list — they read
            // settings.availableFonts when they are built, so without this the new families stay
            // invisible until the settings tab is reopened by hand.
            tab.display();
        });

        // Font list (must be defined first for the button event listeners)
        const fontListEl = containerEl.createDiv({
            attr: {
                style: 'margin: 10px 0; padding: 10px; background: var(--background-secondary); border-radius: 8px; max-height: 400px; overflow-y: auto;'
            }
        });

        // Now add the event listeners for the filter buttons
        filterButtonElements.forEach(({ btn, filter }) => {
            tab._addEventListener(btn, 'click', () => {
                tab._fontFilter = filter;

                // Only refresh the font list and button states, not the whole page
                fontListEl.empty();
                if (tab.plugin.settings.availableFonts.length === 0) {
                    fontListEl.createEl('div', {
                        text: t('notFoundFontFamily'),
                        attr: { style: 'color: var(--text-muted); font-size: 0.9em; text-align: center; padding: 20px;' }
                    });
                } else {
                    tab.renderFontFamilies(fontListEl, tab._fontFilter);
                }

                // Update all buttons' active states
                filterButtonElements.forEach(({ btn: button, filter: f }) => {
                    const isActive = tab._fontFilter === f;
                    button.style.background = isActive ? 'var(--interactive-accent)' : 'var(--background-primary)';
                    button.style.color = isActive ? 'var(--text-on-accent)' : 'var(--text-normal)';
                });
            });
        });

        // Initialize the font list content
        if (tab.plugin.settings.availableFonts.length === 0) {
            fontListEl.createEl('div', {
                text: t('notFoundFontFamily'),
                attr: { style: 'color: var(--text-muted); font-size: 0.9em; text-align: center; padding: 20px;' }
            });
        } else {
            // Display by family (collapsible), passing the filter parameter
            tab.renderFontFamilies(fontListEl, tab._fontFilter);
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
        tab._addEventListener(importBtn, 'click', () => {
            const modal = new FontImportModal(
                tab.plugin.app,
                tab.plugin,
                async (files) => {
                    importBtn.disabled = true;
                    importBtn.textContent = t('importing') || '导入中...';

                    try {
                        await tab.plugin.importFontsFromFiles(files);
                        new Notice(t('importedFonts', { count: files.length }));
                        await tab.plugin.scanFonts();
                        tab._debouncedDisplay();
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
        tab._addEventListener(convertBtn, 'click', async () => {
            convertBtn.disabled = true;
            convertBtn.textContent = t('converting') || '转换中...';
            await tab.plugin.convertAllFonts();
            new Notice(t('allFontsConverted') || '✓ 所有字体已转换');

            // Re-render so newly converted families show their ✓ and become selectable.
            // This rebuilds the button too, so its label and disabled state no longer need
            // restoring by hand here.
            tab.display();
        });
}
