/**
 * Default plugin settings.
 */
import type { PluginSettings } from './types';

export const DEFAULT_SETTINGS: PluginSettings = {
    // A folder of the plugin's own, so a fresh install does not read or write inside a directory
    // that belongs to something else in the vault. Both are created on demand — see scanFonts().
    fontSourceDir: 'Local-Fonts',
    b64OutputDir: 'Local-Fonts/UsableCssFont',
    availableFonts: [],       // Global font list (shared by all presets)
    fontFamilies: [],         // Global font family grouping info (shared by all presets)
    autoLoadOnStartup: true,

    // Device identification (synced via cloud)
    // NOTE: the real per-device identity lives in device-local storage, NOT here — see
    // _getOrCreateLocalDeviceId(). This map is a one-time migration ledger only.
    deviceFingerprints: {},   // Legacy fingerprint → deviceId (migration ledger only)
    deviceNameMap: {},        // { deviceId: displayName }
    deviceMeta: {},           // { deviceId: { platform, os, model, hostname } }
    deviceAliases: {},        // { collapsed deviceId: surviving deviceId } — see the repair pass

    // Global settings
    latinFontForUI: false,    // Apply Latin font to UI elements (global)

    // Preset system
    presets: [                // Preset array
        {
            id: 'default-preset',
            name: 'Default',
            targetDevices: [],  // Empty array = global default preset
            fonts: {
                ui: '',
                text: '',
                heading: '',
                monospace: '',
                math: '',
                latin: ''
            },
            headingApplyToFileTitle: false,
            latinFontEnabled: false,
            latinFontScope: {
                letters: true,
                numbers: true,
                punctuation: true,
                symbols: true
            }
        }
    ]
};
