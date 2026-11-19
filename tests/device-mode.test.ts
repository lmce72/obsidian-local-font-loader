import { describe, expect, test } from 'bun:test';
import { DEFAULT_SETTINGS } from '../src/constants';
import { bindDeviceTypeToPreset, detectDeviceType, getRecordedDeviceType, isDeviceType, resolveDeviceTypePreset } from '../src/device-mode';
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
});
