/**
 * Device and preset management.
 *
 * One section of the settings tab. Extracted from a single 1400-line display() method so that
 * each part can be read, reviewed and changed on its own.
 */

import { Notice, Platform, Setting, setIcon } from 'obsidian';

import { t } from '../../i18n';
import { TextInputModal, showConfirmDialog } from '../modals';
import type FontManagerSettingTab from '../settings-tab';

/**
 * Renders this section into the given container.
 *
 * @param tab - The settings tab, for access to the plugin and shared helpers
 * @param containerEl - Where to append the section
 */
export function renderDeviceAndPresetSection(tab: FontManagerSettingTab, containerEl: HTMLElement): void {
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
                tab._newPresetNameInput = text;
            })
            .addButton(btn => {
                btn.setIcon('plus');
                btn.setTooltip(t('addPreset'));
                btn.onClick(async () => {
                    const presetName = tab._newPresetNameInput.getValue().trim();
                    if (!presetName) {
                        new Notice(t('presetNameRequired'), 3000);
                        return;
                    }

                    const exists = tab.plugin.settings.presets.some(p => p.name === presetName);
                    if (exists) {
                        new Notice(t('presetNameExists'), 3000);
                        return;
                    }

                    await tab.plugin.createPreset(presetName);
                    new Notice(`✓ ${t('presetCreated')}: ${presetName}`, 2000);
                    tab.display();
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
        tab._addEventListener(refreshBtn, 'click', async () => {
            // Reload settings (read from the file)
            await tab.plugin.loadSettings();
            // Re-render the entire settings page
            tab.display();
        });

        const dragContainer = containerEl.createDiv({ cls: 'preset-drag-container' });

        tab.plugin.settings.presets.forEach(preset => {
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
            tab._addEventListener(editBtn, 'click', async () => {
                new TextInputModal(
                    tab.plugin.app,
                    t('editPresetName'),
                    t('presetNamePlaceholder'),
                    preset.name,
                    async (newName) => {
                        if (newName !== preset.name) {
                            await tab.plugin.renamePreset(preset.id, newName);
                            tab.display();
                        }
                    }
                ).open();
            });

            // Copy preset button
            const copyBtn = presetActions.createEl('button', { cls: 'clickable-icon' });
            copyBtn.setAttribute('aria-label', t('copyPresetCopy'));
            setIcon(copyBtn, 'copy');
            tab._addEventListener(copyBtn, 'click', async () => {
                const copyName = `${preset.name}${t('copySuffix')}`;
                await tab.plugin.copyPresetForDevice(preset.id, copyName);
                new Notice(`✓ ${t('presetCopied')}: ${copyName}`, 2000);
                tab.display();
            });

            if (preset.id !== 'default-preset') {
                const deleteBtn = presetActions.createEl('button', { cls: 'clickable-icon' });
                deleteBtn.setAttribute('aria-label', t('deletePreset'));
                setIcon(deleteBtn, 'trash');
                tab._addEventListener(deleteBtn, 'click', async () => {
                    showConfirmDialog(
                        tab.plugin.app,
                        t('deletePreset'),
                        t('deletePresetWarning'),
                        async () => {
                            await tab.plugin.deletePreset(preset.id);
                            // If the deleted preset is the one being edited, fall back to the current device preset (or global preset) so display() does not return early
                            if (tab._activePresetId === preset.id) {
                                const fallbackPreset = tab.plugin._getDevicePreset();
                                tab._activePresetId = fallbackPreset ? fallbackPreset.id : 'default-preset';
                            }
                            tab.display();
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

            tab._addEventListener(devicesContainer, 'dragover', (e) => {
                e.preventDefault();
                devicesContainer.classList.add('drag-over');
            });

            tab._addEventListener(devicesContainer, 'dragleave', () => {
                devicesContainer.classList.remove('drag-over');
            });

            tab._addEventListener(devicesContainer, 'drop', async (e) => {
                e.preventDefault();
                devicesContainer.classList.remove('drag-over');

                const deviceId = e.dataTransfer.getData('text/plain');
                const targetPresetId = devicesContainer.dataset.presetId;

                await tab.plugin.assignDeviceToPreset(deviceId, targetPresetId);
                tab.display();
            });

            // Get the device list to display
            let devicesToShow = [];
            if (preset.id === 'default-preset' && preset.targetDevices.length === 0) {
                // Default global preset: show all unassigned devices
                const allDeviceIds = new Set();

                // Collect all known devices (from deviceNameMap)
                if (tab.plugin.settings.deviceNameMap) {
                    Object.keys(tab.plugin.settings.deviceNameMap).forEach(id => {
                        allDeviceIds.add(id);
                    });
                }

                // Find unassigned devices (not in any custom preset's targetDevices)
                const assignedDevices = new Set();
                tab.plugin.settings.presets.forEach(p => {
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
                    const deviceName = tab.plugin._getDeviceName(deviceId);
                    const isCurrent = deviceId === tab.plugin.currentDeviceId;

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
                    const detectedOs = tab.plugin._getDeviceOs(deviceId);
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
                    const identifier = tab.plugin._getDeviceHostname(deviceId)
                        || tab.plugin._getDeviceModel(deviceId);

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
                    tab._addEventListener(editBtn, 'click', async (e) => {
                        e.stopPropagation();

                        new TextInputModal(
                            tab.plugin.app,
                            t('editDeviceName'),
                            t('deviceNamePlaceholder'),
                            deviceName,
                            async (newName) => {
                                if (newName !== deviceName) {
                                    await tab.plugin.updateDeviceName(deviceId, newName);
                                    tab.display();
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
                        tab._addEventListener(removeBtn, 'click', async (e) => {
                            e.stopPropagation();

                            showConfirmDialog(
                                tab.plugin.app,
                                t('removeDevice'),
                                t('confirmRemoveDevice').replace('{0}', deviceName),
                                async () => {
                                    await tab.plugin.removeDeviceFromPresets(deviceId);
                                    tab.display();
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
                        tab._addEventListener(moveBtn, 'click', async (e) => {
                            e.stopPropagation();

                            const selectEl = document.createElement('select');
                            selectEl.style.cssText = 'position: absolute; opacity: 0; pointer-events: none;';

                            tab.plugin.settings.presets.forEach(p => {
                                const option = selectEl.appendChild(document.createElement('option'));
                                option.value = p.id;
                                option.text = (p.id === 'default-preset' && p.targetDevices.length === 0)
                                    ? `${p.name} (${t('global')})`
                                    : p.name;
                            });

                            const currentPreset = tab.plugin.settings.presets.find(p =>
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
                                await tab.plugin.assignDeviceToPreset(deviceId, targetPresetId);
                                new Notice(`✓ ${t('deviceReassigned')}`, 2000);
                                tab.display();
                                selectEl.remove();
                            });

                            selectEl.addEventListener('blur', () => {
                                selectEl.remove();
                            });
                        });
                    }

                    deviceItem.draggable = true;
                    tab._addEventListener(deviceItem, 'dragstart', (e) => {
                        e.dataTransfer.setData('text/plain', deviceId);
                        deviceItem.classList.add('dragging');
                    });

                    tab._addEventListener(deviceItem, 'dragend', () => {
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

                tab._addEventListener(cleanupBtn, 'click', async () => {
                    const prunable = tab.plugin.getPrunableDevices();

                    if (prunable.length === 0) {
                        new Notice(t('cleanupDevicesNone'), 3000);
                        return;
                    }

                    const deviceNames = prunable.map(device => device.name).join('、');

                    showConfirmDialog(
                        tab.plugin.app,
                        t('cleanupDevices'),
                        t('confirmCleanupDevices').replace('{0}', deviceNames),
                        async () => {
                            const removedCount = await tab.plugin.pruneUnboundDevices();
                            new Notice(`✓ ${t('cleanupDevicesDone').replace('{0}', String(removedCount))}`, 3000);
                            tab.display();
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

        const devicePreset = tab.plugin._getDevicePreset();

        new Setting(containerEl)
            .setName(t('currentDevicePreset'))
            .setDesc(t('currentDevicePresetDesc'))
            .addDropdown(dropdown => {
                tab.plugin.settings.presets.forEach(preset => {
                    const label = (preset.id === 'default-preset' && preset.targetDevices.length === 0)
                        ? `${preset.name} (${t('global')})`
                        : preset.name;
                    dropdown.addOption(preset.id, label);
                });

                dropdown.setValue(devicePreset ? devicePreset.id : 'default-preset');

                dropdown.onChange(async (newPresetId) => {
                    await tab.plugin.assignDeviceToPreset(tab.plugin.currentDeviceId, newPresetId);
                    new Notice(`✓ ${t('deviceReassigned')}`, 2000);
                    tab.display();
                });
            })
            .addButton(btn => {
                btn.setIcon('refresh-cw');
                btn.setTooltip(t('refreshDeviceList'));
                btn.onClick(() => tab.display());
            });

        new Setting(containerEl)
            .setName(t('copyPresetCopy'))
            .setDesc(t('copyPresetCopyDesc'))
            .addButton(btn => {
                btn.setButtonText(t('copyPresetCopy'));
                btn.onClick(async () => {
                    const devicePreset = tab.plugin._getDevicePreset();
                    const copyName = `${devicePreset.name}${t('copySuffix')}`;
                    await tab.plugin.copyPresetForDevice(devicePreset.id, copyName);
                    new Notice(`✓ ${t('presetCopied')}: ${copyName}`, 2000);
                    tab.display();
                });
            });
}
