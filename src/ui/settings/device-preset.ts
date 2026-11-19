/**
 * Device and preset management.
 *
 * One section of the settings tab. Extracted from a single 1400-line display() method so that
 * each part can be read, reviewed and changed on its own.
 */

import { Menu, Notice, Platform, Setting, setIcon } from 'obsidian';

import { t } from '../../i18n';
import { deviceLimitNotices } from '../../device-presets';
import { DEVICE_TYPES, bindDeviceTypeToPreset, detectDeviceType, getRecordedDeviceType, isDeviceType } from '../../device-mode';
import { TextInputModal, showConfirmDialog } from '../modals';
import type FontManagerSettingTab from '../settings-tab';

/** 空字符串会触发新版下拉的标签回填；Keep UI-only values distinct from persisted preset IDs. */
const INDIVIDUAL_BINDING_VALUE = '__device_binding__';
const AUTOMATIC_DEVICE_TYPE_VALUE = '__automatic_device_type__';

/** 统一处理设置操作失败；DOM callbacks remain synchronous and rejection-safe. */
function runDeviceAction(tab: FontManagerSettingTab, action: () => Promise<void>): void {
    void action().catch(error => {
        tab.plugin._logError('[Local Font Loader] Device setting failed:', error);
        new Notice(t('deviceTypeSaveFailed'));
    });
}

function renderDeviceTypeSettings(tab: FontManagerSettingTab, containerEl: HTMLElement): void {
    const settings = tab.plugin.settings;
    new Setting(containerEl)
        .setName(t('deviceTypeMode'))
        .setDesc(t('deviceTypeModeDesc'))
        .addToggle(toggle => {
            toggle.setValue(settings.deviceTypeModeEnabled);
            toggle.toggleEl.setAttribute('aria-label', t('deviceTypeMode'));
            toggle.onChange(enabled => {
                settings.deviceTypeModeEnabled = enabled;
                runDeviceAction(tab, async () => {
                    await tab.plugin.saveSettings();
                    await tab.plugin.applyFonts();
                    tab.update();
                });
            });
        });
    if (!settings.deviceTypeModeEnabled) return;

    for (const type of DEVICE_TYPES) {
        const name = t(`deviceType_${type}`);
        new Setting(containerEl)
            .setName(name)
            .setDesc(t('deviceTypePresetDesc'))
            .addDropdown(dropdown => {
                dropdown.selectEl.setAttribute('aria-label', name);
                dropdown.addOption(INDIVIDUAL_BINDING_VALUE, t('deviceTypeUseDeviceBinding'));
                for (const preset of settings.presets) dropdown.addOption(preset.id, preset.name);
                const assigned = settings.deviceTypePresets[type];
                dropdown.setValue(assigned && settings.presets.some(preset => preset.id === assigned)
                    ? assigned : INDIVIDUAL_BINDING_VALUE);
                dropdown.onChange(id => {
                    if (id === INDIVIDUAL_BINDING_VALUE) delete settings.deviceTypePresets[type];
                    else bindDeviceTypeToPreset(settings, type, id);
                    runDeviceAction(tab, async () => {
                        await tab.plugin.saveSettings();
                        await tab.plugin.applyFonts();
                        tab.update();
                    });
                });
            });
    }
    containerEl.createEl('p', { cls: 'setting-item-description', text: t('deviceTypeCardsDesc') });
}

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
                    const presetName = (tab._newPresetNameInput?.getValue() ?? '').trim();
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
                    tab.update();
                });
            });

        // ========================================
        // Drag and Drop Device Management
        // ========================================
        const deviceManagementHeader = containerEl.createDiv({ cls: 'setting-item-heading-with-button' });
        deviceManagementHeader.createEl('h4', { text: t('headerDeviceManagement') });

        renderDeviceTypeSettings(tab, containerEl);

        // 桌面也展示移动端局限，沿用原生样式；Show mobile limitations to desktop managers as well.
        {
            const calloutEl = containerEl.createDiv({ cls: 'callout', attr: { 'data-callout': 'warning' } });
            const titleEl = calloutEl.createDiv({ cls: 'callout-title' });
            setIcon(titleEl.createDiv({ cls: 'callout-icon' }), 'alert-triangle');
            titleEl.createDiv({ cls: 'callout-title-inner', text: t('deviceLimitTitle') });
            const contentEl = calloutEl.createDiv({ cls: 'callout-content' });
            for (const notice of deviceLimitNotices(Platform)) {
                contentEl.createEl('p', { text: t(notice) });
            }
        }

        const refreshBtn = deviceManagementHeader.createEl('button', { cls: 'clickable-icon' });
        refreshBtn.setAttribute('aria-label', t('refreshDeviceList'));
        setIcon(refreshBtn, 'refresh-cw');
        tab._addEventListener(refreshBtn, 'click', async () => {
            // Reload settings (read from the file)
            await tab.plugin.loadSettings();
            await tab.plugin.repairDeviceList();
            await tab.plugin._ensureDevicePreset();
            await tab.plugin.applyFonts();
            // Re-render the entire settings page
            tab.update();
        });

        const dragContainer = containerEl.createDiv({ cls: 'preset-drag-container' });

        tab.plugin.settings.presets.forEach(preset => {
            const presetSection = dragContainer.createDiv({ cls: 'preset-section' });

            const presetHeader = presetSection.createDiv({ cls: 'preset-header' });
            presetHeader.createEl('h5', {
                text: preset.id === 'default-preset'
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
                            tab.update();
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
                tab.update();
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
                            tab.update();
                        },
                        true  // isDangerous = true (dangerous operation)
                    );
                });
            }

            const devicesContainer = presetSection.createDiv({
                cls: 'devices-container',
                attr: { 'data-preset-id': preset.id }
            });

            if (preset.id === 'default-preset') {
                devicesContainer.addClass('global-preset-zone');
            }

            tab._addEventListener(devicesContainer, 'dragover', (e: DragEvent) => {
                if (tab.plugin.settings.deviceTypeModeEnabled) return;
                e.preventDefault();
                devicesContainer.classList.add('drag-over');
            });

            tab._addEventListener(devicesContainer, 'dragleave', () => {
                devicesContainer.classList.remove('drag-over');
            });

            tab._addEventListener(devicesContainer, 'drop', async (e: DragEvent) => {
                e.preventDefault();
                devicesContainer.classList.remove('drag-over');
                if (tab.plugin.settings.deviceTypeModeEnabled) return;

                const deviceId = e.dataTransfer?.getData('text/plain') ?? '';
                const targetPresetId = devicesContainer.dataset.presetId ?? '';

                await tab.plugin.assignDeviceToPreset(deviceId, targetPresetId);
                tab.update();
            });

            // Get the device list to display
            let devicesToShow: string[] = [];
            if (preset.id === 'default-preset') {
                // Default global preset: show all unassigned devices
                const allDeviceIds = new Set<string>();

                // Collect all known devices (from deviceNameMap)
                if (tab.plugin.settings.deviceNameMap) {
                    Object.keys(tab.plugin.settings.deviceNameMap).forEach(id => {
                        allDeviceIds.add(id);
                    });
                }

                // Find unassigned devices (not in any custom preset's targetDevices)
                const assignedDevices = new Set<string>();
                tab.plugin.settings.presets.forEach(p => {
                    if (p.id !== 'default-preset') {
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
                    const deviceInfoContainer = deviceItem.createDiv({ cls: 'lfl-device-info' });

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
                        linux: 'os-linux',
                        unknown: 'os-default'
                    };
                    const detectedOs = tab.plugin._getDeviceOs(deviceId);
                    osIcon.addClass(osIconClasses[detectedOs] || 'os-default');

                    // Device name + descriptive sub-line
                    const textContainer = deviceInfoContainer.createDiv({ cls: 'lfl-device-text' });

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
                        linux: 'Linux',
                        unknown: ''
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

                    if (tab.plugin.settings.deviceTypeModeEnabled) {
                        // 旧设备可显式补充类型，原 ID 分配不变；Classification is separate from assignment.
                        new Setting(textContainer)
                            .setName(t('deviceTypeLabel'))
                            .addDropdown(dropdown => {
                                dropdown.selectEl.setAttribute('aria-label', `${deviceName}: ${t('deviceTypeLabel')}`);
                                const automaticType = isCurrent ? detectDeviceType(Platform)
                                    : getRecordedDeviceType(tab.plugin.settings.deviceMeta[deviceId]);
                                dropdown.addOption(AUTOMATIC_DEVICE_TYPE_VALUE, automaticType
                                    ? `${t('deviceTypeAutomatic')} (${t(`deviceType_${automaticType}`)})`
                                    : t('deviceTypeUnknown'));
                                for (const type of DEVICE_TYPES) dropdown.addOption(type, t(`deviceType_${type}`));
                                dropdown.setValue(tab.plugin.settings.deviceTypeOverrides[deviceId] || AUTOMATIC_DEVICE_TYPE_VALUE);
                                dropdown.onChange(value => {
                                    if (isDeviceType(value)) {
                                        tab.plugin.settings.deviceTypeOverrides[deviceId] = value;
                                    } else delete tab.plugin.settings.deviceTypeOverrides[deviceId];
                                    runDeviceAction(tab, async () => {
                                        await tab.plugin.saveSettings();
                                        await tab.plugin.applyFonts();
                                        tab.update();
                                    });
                                });
                            });
                    }

                    // Edit button (shown for all devices) - uses a white icon
                    const editBtn = btnContainer.createEl('button', {
                        cls: 'clickable-icon device-edit-btn',
                        attr: { 'aria-label': t('editDeviceName') }
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
                                    tab.update();
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
                                    tab.update();
                                },
                                true  // isDangerous = true
                            );
                        });
                    }

                    if (isCurrent) {
                        deviceItem.addClass('current-device');
                    }

                    if (Platform.isMobile && !tab.plugin.settings.deviceTypeModeEnabled) {
                        const moveBtn = btnContainer.createEl('button', {
                            cls: 'clickable-icon',
                            attr: { 'aria-label': t('moveDeviceToPreset') }
                        });
                        setIcon(moveBtn, 'move');
                        tab._addEventListener(moveBtn, 'click', (e: MouseEvent) => {
                            e.stopPropagation();
                            const currentPreset = tab.plugin.settings.presets.find(p =>
                                p.targetDevices.includes(deviceId)
                            );
                            // 使用原生菜单，不依赖隐藏选择框或失焦时序；Use the native menu lifecycle.
                            const menu = new Menu();
                            tab.plugin.settings.presets.forEach(preset => {
                                menu.addItem(item => item
                                    .setTitle(preset.id === 'default-preset' ? `${preset.name} (${t('global')})` : preset.name)
                                    .setChecked(preset.id === (currentPreset?.id || 'default-preset'))
                                    .onClick(() => {
                                        void tab.plugin.assignDeviceToPreset(deviceId, preset.id).then(() => {
                                            new Notice(t('deviceReassigned'), 2000);
                                            tab.update();
                                        }).catch(error => {
                                            tab.plugin._logError('[Local Font Loader] Failed to reassign the device:', error);
                                        });
                                    }));
                            });
                            const rect = moveBtn.getBoundingClientRect();
                            menu.showAtPosition({ x: rect.left, y: rect.bottom }, moveBtn.ownerDocument);
                        });
                    }

                    // 移动端使用菜单分配，避免长按拖拽干扰滚动；Keep touch scrolling free of card dragging.
                    deviceItem.draggable = !Platform.isMobile && !tab.plugin.settings.deviceTypeModeEnabled;
                    tab._addEventListener(deviceItem, 'dragstart', (e: DragEvent) => {
                        e.dataTransfer?.setData('text/plain', deviceId);
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
            if (preset.id === 'default-preset') {
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
                            tab.update();
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

        if (!tab.plugin.settings.deviceTypeModeEnabled) new Setting(containerEl)
            .setName(t('currentDevicePreset'))
            .setDesc(t('currentDevicePresetDesc'))
            .addDropdown(dropdown => {
                tab.plugin.settings.presets.forEach(preset => {
                    const label = preset.id === 'default-preset'
                        ? `${preset.name} (${t('global')})`
                        : preset.name;
                    dropdown.addOption(preset.id, label);
                });

                dropdown.setValue(devicePreset ? devicePreset.id : 'default-preset');

                dropdown.onChange(async (newPresetId) => {
                    await tab.plugin.assignDeviceToPreset(tab.plugin.currentDeviceId, newPresetId);
                    new Notice(`✓ ${t('deviceReassigned')}`, 2000);
                    tab.update();
                });
            })
            .addButton(btn => {
                btn.setIcon('refresh-cw');
                btn.setTooltip(t('refreshDeviceList'));
                btn.onClick(() => tab.update());
            });

        new Setting(containerEl)
            .setName(t('copyPresetCopy'))
            .setDesc(t('copyPresetCopyDesc'))
            .addButton(btn => {
                btn.setButtonText(t('copyPresetCopy'));
                btn.onClick(async () => {
                    const devicePreset = tab.plugin._getDevicePreset();
                    if (!devicePreset) {
                        return;
                    }
                    const copyName = `${devicePreset.name}${t('copySuffix')}`;
                    await tab.plugin.copyPresetForDevice(devicePreset.id, copyName);
                    new Notice(`✓ ${t('presetCopied')}: ${copyName}`, 2000);
                    tab.update();
                });
            });
}
