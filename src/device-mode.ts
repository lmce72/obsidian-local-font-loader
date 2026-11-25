import type { DeviceMeta, DeviceType, FontPreset, PluginSettings } from './types';

export function deviceGroup(settings: PluginSettings, type: DeviceType): DeviceType | 'mobile' {
    return settings.mergeMobileDeviceTypes && type !== 'computer' ? 'mobile' : type;
}

export const DEVICE_TYPES: readonly DeviceType[] = ['computer', 'tablet', 'phone'];

export function isDeviceType(value: unknown): value is DeviceType {
    return value === 'computer' || value === 'tablet' || value === 'phone';
}

/** 使用 Obsidian 与 Better Manager 相同的分类信号；Never infer form factor from window size. */
export function detectDeviceType(platform: { isMobileApp: boolean; isTablet: boolean }): DeviceType {
    return platform.isMobileApp ? (platform.isTablet ? 'tablet' : 'phone') : 'computer';
}

/** 旧设备可手工纠正，已记录类型优先于兼容推断；Overrides also cover Android tablets. */
export function getRecordedDeviceType(meta: DeviceMeta | undefined, override?: DeviceType): DeviceType | undefined {
    if (override) return override;
    if (meta?.type) return meta.type;
    if (meta?.platform === 'desktop') return 'computer';
    if (meta?.os === 'ipados' || meta?.model === 'iPad') return 'tablet';
    if (meta?.os === 'ios' && meta.model === 'iPhone') return 'phone';
    return undefined;
}

/** 仅已启用且有效的类型分配覆盖单设备配置；Unassigned or deleted targets retain the old fallback. */
export function resolveDeviceTypePreset(settings: PluginSettings, type: DeviceType | undefined): FontPreset | undefined {
    if (!settings.deviceTypeModeEnabled || !type) return undefined;
    const group = deviceGroup(settings, type);
    const id = group === 'mobile' ? settings.mobileDevicePreset : settings.deviceTypePresets[group];
    return id ? settings.presets.find(preset => preset.id === id) : undefined;
}

/**
 * 设备实际使用的预设；The preset a device actually runs with.
 *
 * 类别模式先按类型路由；单设备绑定是没有类型可用时的回退，全局默认是最后一层。设置页要按这个
 * 结果分组，不能只看 `targetDevices`——类别模式下它是空的，会把所有设备都算到全局预设名下。
 */
export function resolveDevicePreset(
    settings: PluginSettings, deviceId: string, type: DeviceType | undefined,
): FontPreset | undefined {
    const byType = resolveDeviceTypePreset(settings, type);
    if (byType) return byType;
    return settings.presets.find(preset => preset.targetDevices.includes(deviceId))
        ?? settings.presets.find(preset => preset.id === 'default-preset')
        ?? settings.presets[0];
}

/** 类型绑定独立保存，不覆盖历史设备绑定；Turning the mode off is lossless. */
export function bindDeviceTypeToPreset(settings: PluginSettings, type: DeviceType, presetId: string): void {
    if (!DEVICE_TYPES.includes(type) || !settings.presets.some(preset => preset.id === presetId)) {
        throw new Error('Cannot assign a device type without a valid type and preset');
    }
    const group = deviceGroup(settings, type);
    if (group === 'mobile') settings.mobileDevicePreset = presetId;
    else settings.deviceTypePresets[group] = presetId;
}
