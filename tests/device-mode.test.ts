import { describe, expect, test } from 'bun:test';
import { DEFAULT_SETTINGS } from '../src/constants';
import { bindDeviceTypeToPreset, detectDeviceType, getRecordedDeviceType, isDeviceType, resolveDevicePreset, resolveDeviceTypePreset } from '../src/device-mode';
import type { DeviceMeta } from '../src/types';

const desktop: DeviceMeta = { platform: 'desktop', os: 'windows', model: '', hostname: 'test' };
const mobile: DeviceMeta = { platform: 'mobile', os: 'android', model: 'Test model', hostname: '' };

describe('optional device type mode', () => {
    test('defaults to individual bindings and uses Obsidian form-factor signals', () => {
        expect(DEFAULT_SETTINGS.deviceTypeModeEnabled).toBe(false);
        expect(detectDeviceType({ isMobileApp: false, isTablet: false })).toBe('computer');
        expect(detectDeviceType({ isMobileApp: true, isTablet: true })).toBe('tablet');
        expect(detectDeviceType({ isMobileApp: true, isTablet: false })).toBe('phone');
        expect(detectDeviceType({ isMobileApp: false, isTablet: true })).toBe('computer');
    });

    test('does not guess unknown remote mobile form factors and accepts explicit corrections', () => {
        expect(getRecordedDeviceType(desktop)).toBe('computer');
        expect(getRecordedDeviceType(mobile)).toBeUndefined();
        expect(getRecordedDeviceType(undefined)).toBeUndefined();
        expect(getRecordedDeviceType({ ...mobile, os: 'ipados' })).toBe('tablet');
        expect(getRecordedDeviceType({ ...mobile, os: 'ios', model: 'iPhone' })).toBe('phone');
        expect(getRecordedDeviceType({ ...mobile, type: 'tablet' })).toBe('tablet');
        expect(getRecordedDeviceType(mobile, 'tablet')).toBe('tablet');
        expect(getRecordedDeviceType({ ...mobile, type: 'phone' }, 'tablet')).toBe('tablet');
        expect(isDeviceType('mobile')).toBe(false);
        expect(isDeviceType('tablet')).toBe(true);
    });

    test('type assignments override only when enabled and preserve old bindings on round trip', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        const global = settings.presets[0];
        global.targetDevices = ['device-1'];
        const custom = { ...structuredClone(global), id: 'math-tablet', targetDevices: [] };
        settings.presets.push(custom);
        const bindings = settings.presets.map(preset => [...preset.targetDevices]);
        bindDeviceTypeToPreset(settings, 'tablet', custom.id);
        expect(resolveDeviceTypePreset(settings, 'tablet')).toBeUndefined();
        settings.deviceTypeModeEnabled = true;
        expect(resolveDeviceTypePreset(settings, 'tablet')).toBe(custom);
        expect(resolveDeviceTypePreset(settings, 'phone')).toBeUndefined();
        expect(resolveDeviceTypePreset(settings, undefined)).toBeUndefined();
        settings.deviceTypeModeEnabled = false;
        expect(resolveDeviceTypePreset(settings, 'tablet')).toBeUndefined();
        expect(settings.presets.map(preset => preset.targetDevices)).toEqual(bindings);
        settings.deviceTypeModeEnabled = true;
        expect(resolveDeviceTypePreset(settings, 'tablet')).toBe(custom);
    });

    test('merged mobile devices share one preset and restore their separate presets when split', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        const global = settings.presets[0];
        const tablet = { ...structuredClone(global), id: 'tablet-preset' };
        settings.presets.push(tablet);
        settings.deviceTypeModeEnabled = true;
        bindDeviceTypeToPreset(settings, 'tablet', tablet.id);
        bindDeviceTypeToPreset(settings, 'phone', global.id);
        settings.mergeMobileDeviceTypes = true;
        expect(resolveDeviceTypePreset(settings, 'tablet')).toBeUndefined();
        bindDeviceTypeToPreset(settings, 'phone', tablet.id);
        expect(resolveDeviceTypePreset(settings, 'phone')).toBe(tablet);
        expect(resolveDeviceTypePreset(settings, 'tablet')).toBe(tablet);
        expect(resolveDeviceTypePreset(settings, 'computer')).toBeUndefined();
        settings.mergeMobileDeviceTypes = false;
        expect(resolveDeviceTypePreset(settings, 'tablet')).toBe(tablet);
        expect(resolveDeviceTypePreset(settings, 'phone')).toBe(global);
    });

    test('missing presets fall back and invalid assignments do not mutate settings', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.deviceTypeModeEnabled = true;
        settings.deviceTypePresets.phone = 'deleted-preset';
        expect(resolveDeviceTypePreset(settings, 'phone')).toBeUndefined();
        const before = structuredClone(settings);
        expect(() => bindDeviceTypeToPreset(settings, 'phone', 'missing')).toThrow();
        expect(settings).toEqual(before);
        bindDeviceTypeToPreset(settings, 'computer', 'default-preset');
        expect(resolveDeviceTypePreset(settings, 'computer')).toBe(settings.presets[0]);
    });

    test('a device resolves to its type preset, then its own binding, then the global default', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        const global = settings.presets[0];
        const tablet = { ...structuredClone(global), id: 'tablet-preset', targetDevices: [] };
        const individual = { ...structuredClone(global), id: 'individual-preset', targetDevices: ['device-a'] };
        settings.presets.push(tablet, individual);

        // Mode off: the device's own binding decides; everything else falls back to global.
        expect(resolveDevicePreset(settings, 'device-a', 'tablet')).toBe(individual);
        expect(resolveDevicePreset(settings, 'device-b', 'tablet')).toBe(global);

        // Mode on but no type binding: the per-device binding still decides.
        settings.deviceTypeModeEnabled = true;
        expect(resolveDevicePreset(settings, 'device-a', 'tablet')).toBe(individual);

        // A type binding wins over the per-device binding; an unclassified device keeps it.
        bindDeviceTypeToPreset(settings, 'tablet', tablet.id);
        expect(resolveDevicePreset(settings, 'device-a', 'tablet')).toBe(tablet);
        expect(resolveDevicePreset(settings, 'device-a', undefined)).toBe(individual);
        // A device whose type points at a deleted preset falls through to the global default.
        settings.deviceTypePresets.tablet = 'deleted-preset';
        expect(resolveDevicePreset(settings, 'device-b', 'tablet')).toBe(global);
    });
});
