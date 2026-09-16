/**
 * Fallback and maintenance actions.
 *
 * One section of the settings tab. Extracted from a single 1400-line display() method so that
 * each part can be read, reviewed and changed on its own.
 */

import { Notice, Setting } from 'obsidian';

import { t } from '../../i18n';
import { showConfirmDialog } from '../modals';
import type FontManagerSettingTab from '../settings-tab';

/**
 * Renders this section into the given container.
 *
 * @param tab - The settings tab, for access to the plugin and shared helpers
 * @param containerEl - Where to append the section
 */
export function renderFallbackSection(tab: FontManagerSettingTab, containerEl: HTMLElement): void {
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
                    const unusedFonts = tab._getUnusedFonts();
                    if (unusedFonts.length === 0) {
                        new Notice(t('noUnusedFonts'));
                        return;
                    }

                    showConfirmDialog(
                        tab.plugin.app,
                        t('confirmDelete'),
                        t('confirmDeleteUnusedFonts').replace('{count}', unusedFonts.length),
                        async () => {
                            await tab.deleteUnusedFonts();
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
                    await tab.plugin.clearCache();
                    tab.display();
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
                    await tab.plugin.applyFonts();
                    new Notice(t('fontsApplied'));
                })
            );
}
