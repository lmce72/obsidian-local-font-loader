/**
 * Font file status: scanning, conversion and deletion.
 *
 * One section of the settings tab. Extracted from a single 1400-line display() method so that
 * each part can be read, reviewed and changed on its own.
 */

import { Notice, setIcon, MarkdownRenderer } from 'obsidian';

import { t } from '../../i18n';
import { FontImportModal } from '../modals';
import { setFontFamilyExpanded } from '../font-family-view';
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
        const buttonContainerEl = containerEl.createDiv({ cls: 'lfl-toolbar' });

        // Filter button group
        const filterGroup = buttonContainerEl.createDiv({ cls: 'lfl-toolbar-group' });

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
                cls: isActive ? 'lfl-chip is-active' : 'lfl-chip',
                attr: { 'aria-label': btnConfig.label }
            });

            const iconEl = btn.createSpan({ cls: 'lfl-chip-icon' });
            setIcon(iconEl, btnConfig.icon);
            btn.createSpan({ text: btnConfig.label });

            filterButtonElements.push({ btn, filter: btnConfig.filter });
        });

        // Add a separator
        buttonContainerEl.createDiv({ cls: 'lfl-toolbar-divider' });

        // Expand/collapse button group
        const expandCollapseGroup = buttonContainerEl.createDiv({ cls: 'lfl-toolbar-group' });

        // Expand all button
        const expandAllBtn = expandCollapseGroup.createEl('button', {
            cls: 'lfl-chip',
            attr: { 'aria-label': t('expandAll') }
        });
        const expandIcon = expandAllBtn.createSpan({ cls: 'lfl-chip-icon' });
        setIcon(expandIcon, 'chevrons-down');
        expandAllBtn.createSpan({ text: t('expandAll') });

        tab._addEventListener(expandAllBtn, 'click', () => {
            const allFamilies = fontListEl.querySelectorAll('.font-family-item');
            allFamilies.forEach(familyItem => {
                setFontFamilyExpanded(familyItem as HTMLElement, true);
            });
        });

        // Collapse all button
        const collapseAllBtn = expandCollapseGroup.createEl('button', {
            cls: 'lfl-chip',
            attr: { 'aria-label': t('collapseAll') }
        });
        const collapseIcon = collapseAllBtn.createSpan({ cls: 'lfl-chip-icon' });
        setIcon(collapseIcon, 'chevrons-up');
        collapseAllBtn.createSpan({ text: t('collapseAll') });

        tab._addEventListener(collapseAllBtn, 'click', () => {
            const allFamilies = fontListEl.querySelectorAll('.font-family-item');
            allFamilies.forEach(familyItem => {
                setFontFamilyExpanded(familyItem as HTMLElement, false);
            });
        });

        // Legend container (independent of the button group)
        const legendEl = containerEl.createDiv({ cls: 'lfl-legend' });

        // Legend (left side)
        const legendsContainer = legendEl.createDiv({ cls: 'lfl-legend-items' });

        // "Font File Status" label
        legendsContainer.createDiv({
            text: t('fontFileStatus'),
            cls: 'lfl-legend-title'
        });

        // Vertical separator
        legendsContainer.createDiv({ cls: 'lfl-legend-divider' });

        // The state names double as the modifier on the icon class, so a legend entry and the
        // variant row it describes can never drift apart in colour.
        const legends = [
            { icon: 'check', state: 'converted', text: t('legendConverted') },
            { icon: 'circle', state: 'pending', text: t('legendNotConverted') },
            { icon: 'check', state: 'cached', text: t('legendCachedOnly') },
            { icon: 'help-circle', state: 'missing', text: t('legendNotExist') }
        ];

        legends.forEach(legend => {
            const item = legendsContainer.createDiv({ cls: 'lfl-legend-item' });
            const iconEl = item.createSpan({ cls: `lfl-legend-icon is-${legend.state}` });
            setIcon(iconEl, legend.icon);
            item.createSpan({ text: legend.text });
        });

        // Refresh scan button (right side)
        const rescanBtn = legendEl.createEl('button', {
            cls: 'lfl-chip lfl-chip--rescan',
            attr: { 'aria-label': t('rescanFonts') || '重新扫描' }
        });

        const rescanIcon = rescanBtn.createSpan({ cls: 'lfl-chip-icon' });
        setIcon(rescanIcon, 'rotate-cw');
        rescanBtn.createSpan({ text: t('rescanFonts') || '重新扫描' });

        tab._addEventListener(rescanBtn, 'click', async () => {
            rescanBtn.disabled = true;
            await tab.plugin.scanFonts();
            new Notice(t('fontsRescanned') || '✓ 字体已重新扫描');

            // Re-render so the font dropdowns pick up the rescanned list — they read
            // settings.availableFonts when they are built, so without this the new families stay
            // invisible until the settings tab is reopened by hand.
            tab.display();
        });

        // Font list (must be defined first for the button event listeners)
        const fontListEl = containerEl.createDiv({ cls: 'lfl-font-list' });

        // Now add the event listeners for the filter buttons
        filterButtonElements.forEach(({ btn, filter }) => {
            tab._addEventListener(btn, 'click', () => {
                tab._fontFilter = filter;

                // Only refresh the font list and button states, not the whole page
                fontListEl.empty();
                if (tab.plugin.settings.availableFonts.length === 0) {
                    fontListEl.createEl('div', {
                        text: t('notFoundFontFamily'),
                        cls: 'lfl-empty-note'
                    });
                } else {
                    tab.renderFontFamilies(fontListEl, tab._fontFilter);
                }

                // Update all buttons' active states
                filterButtonElements.forEach(({ btn: button, filter: f }) => {
                    button.toggleClass('is-active', tab._fontFilter === f);
                });
            });
        });

        // Initialize the font list content
        if (tab.plugin.settings.availableFonts.length === 0) {
            fontListEl.createEl('div', {
                text: t('notFoundFontFamily'),
                cls: 'lfl-empty-note'
            });
        } else {
            // Display by family (collapsible), passing the filter parameter
            tab.renderFontFamilies(fontListEl, tab._fontFilter);
        }

        // Font file operation buttons
        const fontOperationsEl = containerEl.createDiv({ cls: 'lfl-font-actions' });

        // Import fonts
        const importBtn = fontOperationsEl.createEl('button', {
            text: t('importFont'),
            cls: 'mod-cta'
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
            text: t('convertAllFonts')
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
