/**
 * Directory configuration and font application.
 *
 * One section of the settings tab. Extracted from a single 1400-line display() method so that
 * each part can be read, reviewed and changed on its own.
 */

import { Notice, Setting, setIcon, MarkdownRenderer } from 'obsidian';

import { t } from '../../i18n';
import type { PresetFonts } from '../../types';
import type FontManagerSettingTab from '../settings-tab';

/**
 * Renders this section into the given container.
 *
 * @param tab - The settings tab, for access to the plugin and shared helpers
 * @param containerEl - Where to append the section
 */
export function renderDirectoryAndApplicationSection(tab: FontManagerSettingTab, containerEl: HTMLElement): void {
        // ========================================
        // Directory Configuration
        // ========================================
        containerEl.createEl('h3', { text: t('headerDirectoryConfig') });

        new Setting(containerEl)
            .setName(t('fontSourceDir'))
            .setDesc(t('fontSourceDirDesc'))
            .addText(text => text
                .setPlaceholder('Components/Library/Fonts')
                .setValue(tab.plugin.settings.fontSourceDir)
                .onChange(async (value) => {
                    tab.plugin.settings.fontSourceDir = value;
                    await tab.plugin.saveSettings();
                })
            )
            .addButton(btn => btn
                .setButtonText(t('scanFonts'))
                .onClick(async () => {
                    await tab.plugin.scanFonts();
                    new Notice('✓ Font list updated');
                    tab.display();
                })
            );

        new Setting(containerEl)
            .setName(t('cacheDir'))
            .setDesc(t('cacheDirDesc'))
            .addText(text => text
                .setPlaceholder('Components/Library/Fonts/B64Font')
                .setValue(tab.plugin.settings.b64OutputDir)
                .onChange(async (value) => {
                    tab.plugin.settings.b64OutputDir = value;
                    await tab.plugin.saveSettings();
                })
            );

        // Startup settings
        new Setting(containerEl)
            .setName(t('autoLoad'))
            .setDesc(t('autoLoadDesc'))
            .addToggle(toggle => toggle
                .setValue(tab.plugin.settings.autoLoadOnStartup)
                .onChange(async (value) => {
                    tab.plugin.settings.autoLoadOnStartup = value;
                    await tab.plugin.saveSettings();
                })
            );

        // ========================================
        // Font Application Settings
        // ========================================
        containerEl.createEl('h3', { text: t('headerFontApplication') });

        // Preset selector (select the preset to configure)
        const currentDevicePreset = tab.plugin._getDevicePreset();

        // If _activePresetId is not explicitly set, default to the current device's preset
        if (!tab._activePresetId) {
            tab._activePresetId = currentDevicePreset ? currentDevicePreset.id : 'default-preset';
        }

        new Setting(containerEl)
            .setName(t('selectPresetToEdit'))
            .setDesc(t('selectPresetToEditDesc'))
            .addDropdown(dropdown => {
                // Populate all presets as options
                tab.plugin.settings.presets.forEach(preset => {
                    const label = (preset.id === 'default-preset' && preset.targetDevices.length === 0)
                        ? `${preset.name} (${t('global')})`
                        : preset.name;
                    dropdown.addOption(preset.id, label);
                });

                // Set the currently edited preset
                dropdown.setValue(tab._activePresetId);

                // Switch the currently edited preset
                dropdown.onChange(async (newPresetId) => {
                    tab._activePresetId = newPresetId;
                    tab.display(); // refresh the UI to show the selected preset font config
                });
            });

        // Show info about the currently edited preset
        const activePreset = tab.plugin.settings.presets.find(p => p.id === tab._activePresetId);
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
        const activePresetForFonts = tab.plugin.settings.presets.find(p => p.id === tab._activePresetId);
        if (!activePresetForFonts) {
            console.error('[LocalFontLoader] Active preset not found:', tab._activePresetId);
            return;
        }
        const activePresetFonts: PresetFonts = activePresetForFonts.fonts || ({} as PresetFonts);

        for (const fontType of fontTypes) {
            const settingItem = new Setting(containerEl)
                .setName(fontType.name)
                .setDesc(fontType.desc);

            // Check if the font referenced by the current preset exists
            // Reuse isFontAvailable: exempts empty strings and the use-text-font / use-ui-font sentinel values
            const selectedFont = activePresetFonts[fontType.key];
            const fontExists = tab.plugin.isFontAvailable(selectedFont);

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
                ? tab.plugin._evaluateMathFont(selectedFont)
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
                    const uniqueFamilies = new Set<string>();
                    tab.plugin.settings.availableFonts.forEach(font => {
                        const familyName = font.familyName || font.name;
                        uniqueFamilies.add(familyName);
                    });

                    // Add an option for each family (showing variant info)
                    Array.from(uniqueFamilies).sort().forEach(familyName => {
                        const familyFonts = tab.plugin.settings.availableFonts.filter(f =>
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
                        await tab.plugin.saveSettings();

                        // If the edited preset is the current device's preset, apply fonts immediately
                        const currentDevicePreset = tab.plugin._getDevicePreset();
                        if (currentDevicePreset && currentDevicePreset.id === activePresetForFonts.id) {
                            await tab.plugin.applyFonts();
                        }

                        // Refresh the UI to show the variant warning
                        // Use requestAnimationFrame so DOM ops run in the next frame, avoiding double renders
                        requestAnimationFrame(() => {
                            tab.display();
                        });
                    });
                });

            // Add a variant warning below the setting item (using callout syntax)
            if (activePresetForFonts.fonts[fontType.key]) {
                const fontForVariantCheck = activePresetForFonts.fonts[fontType.key];
                const variants = tab.plugin.settings.availableFonts.filter(f =>
                    (f.familyName || f.name) === fontForVariantCheck
                );

                // Text Font: recommend 4 variants (only show for Latin fonts)
                if (fontType.key === 'text' && variants.length > 0 && variants.length < 4) {
                    const variantList = variants.map(f => f.variantType || 'unknown').join(', ');

                    // Check if it is a Latin font
                    const isLatin = tab._isLatinFont(fontForVariantCheck);

                    if (isLatin) {
                        // Latin font: show full warning with non-Latin hint inside callout
                        const warningCallout = containerEl.createDiv({ attr: { style: 'margin: 8px 0 16px 0;' } });

                        const warningMd = `> [!warning] ${t('incompleteVariantTitle')}
> ${t('incompleteVariantBody', { fontFamily: fontForVariantCheck, variantCount: variants.length, variantList })}`;

                        MarkdownRenderer.render(tab.app, warningMd, warningCallout, '', tab.plugin);
                    }
                    // Non-Latin fonts: no warning needed
                }

                // Monospace Font: must be monospace
                if (fontType.key === 'monospace') {
                    const infoCallout = containerEl.createDiv({ attr: { style: 'margin: 8px 0 16px 0;' } });

                    const infoMd = `> [!info] ${t('monospaceRequirement')}
> ${t('monospaceRequirementBody')}`;

                    MarkdownRenderer.render(tab.app, infoMd, infoCallout, '', tab.plugin);
                }

                // Math Font: must be specialized math font
                if (fontType.key === 'math') {
                    const infoCallout = containerEl.createDiv({ attr: { style: 'margin: 8px 0 16px 0;' } });

                    if (mathVerdict && mathVerdict.status === 'notMathFont') {
                        const warningMd = `> [!warning] ${t('mathFontNotMathTitle')}
> ${t('mathFontNotMathBody', { fontFamily: selectedFont, missing: (mathVerdict.missing || []).join(', ') })}`;

                        MarkdownRenderer.render(tab.app, warningMd, infoCallout, '', tab.plugin);
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

                        MarkdownRenderer.render(tab.app, warningMd, infoCallout, '', tab.plugin);
                    } else {
                        const infoMd = `> [!info] ${t('mathFontRequirement')}
> ${t('mathFontRequirementBody')}`;

                        MarkdownRenderer.render(tab.app, infoMd, infoCallout, '', tab.plugin);
                    }
                }
            }

            // If it is the Body Text Font, add Latin font separation options
            if (fontType.supportsLatin) {
                tab.addLatinFontOptions(containerEl, activePresetForFonts);
            }

            // If it is the Heading Font, add the "apply to file title" option (only shown when use-text-font is not selected)
            if (fontType.supportsFileTitle) {
                const currentValue = activePresetForFonts.fonts[fontType.key];
                if (currentValue && currentValue !== 'use-text-font') {
                    tab.addFileTitleOption(containerEl, activePresetForFonts);
                }
            }
        }
}
