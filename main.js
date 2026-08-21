/**
 * Local Font Loader for Obsidian
 *
 * Features:
 * - Full-featured Settings Tab for font management
 * - Support for TTF/OTF/WOFF/WOFF2 formats
 * - Base64 caching system for offline usage
 * - Category management: UI Interface, Body Text, Code, and LaTeX Math
 * - Font list persistence to data.json
 * - Quick access via Ribbon icon
 * - Command Palette integration
 *
 * @author CoreVortex
 * @version 1.2.4
 * @license MIT
 */

const { Plugin, PluginSettingTab, Setting, Modal, ConfirmationModal, Notice, setIcon, MarkdownRenderer, Platform } = require('obsidian');

// ============================================================================
// Internationalization (i18n) - Inline
// ============================================================================

const TRANSLATIONS = {
    en: {
        // Plugin Info
        pluginName: 'Local Font Loader',
        pluginDesc: 'Load custom fonts from your local vault',

        // Settings Headers
        headerDirectoryConfig: 'Directory Configuration',
        headerGeneralSettings: 'General Settings',
        headerFontApplication: 'Font Application Settings',
        headerFontFileConfig: 'Font File Configuration',
        headerFallback: 'Fallback Operations',

        // Directory Configuration
        fontSourceDir: 'Font Source Directory',
        fontSourceDirDesc: 'Directory containing font family folders',
        cacheDir: 'Base64 Cache Directory',
        cacheDirDesc: 'Directory for converted CSS files',

        // General Settings
        autoLoad: 'Auto-load fonts on startup',
        autoLoadDesc: 'Automatically apply font configuration when Obsidian starts',

        // Font Types
        uiFontName: 'UI Interface Font',
        uiFontDesc: 'Sidebar, menus, buttons, and other UI elements',
        textFontName: 'Body Text Font',
        textFontDesc: 'Editor body content',
        textFontWarning: '⚠️ Recommended: Choose a font family with Regular/Italic/Bold/BoldItalic variants for proper italic and bold rendering',
        headingFontName: 'Heading Font',
        headingFontDesc: 'Font for markdown headings (h1-h6) in content',
        headingUseTextFont: 'Use Text Font',
        headingUseUIFont: 'Use UI Font',
        headingApplyToFileTitle: 'Apply to File Name Title',
        headingApplyToFileTitleDesc: 'Also apply heading font to the inline file title displayed at the top of notes',
        monospaceFontName: 'Code Font',
        monospaceFontDesc: 'Code blocks and inline code',
        monospaceFontWarning: '⚠️ Required: Must be a monospace font. Regular Latin fonts will cause code alignment issues',
        mathFontName: 'LaTeX Math Font',
        mathFontDesc: 'LaTeX math formula rendering',
        mathFontWarning: '⚠️ Required: Must be a dedicated math font (e.g., Latin Modern Math, XITS Math). Regular fonts cannot render math symbols correctly',
        systemDefault: '-- System Default --',

        // Latin Font Separation
        latinFontInfo: 'Latin Font Separation',
        latinFontInfoDesc: 'After enabling, you can assign a separate Latin font. Latin characters (A-Z, a-z, numbers, punctuation) will use the Latin font, while non-Latin characters (CJK, etc.) will continue using the original font.',
        latinFontInfoDescForLatinUsers: 'This feature is designed for users who mix Latin and non-Latin scripts (e.g., English + Chinese/Japanese/Korean). If you primarily write in Latin-script languages, you likely don\'t need this feature.',
        latinFontEnabled: 'Enable Latin Font Separation',
        latinFontEnabledDesc: 'Use separate fonts for Latin and non-Latin characters',
        latinFontForUI: 'Apply Latin Font to UI',
        latinFontForUIDesc: 'When enabled, the Latin font will also be applied to UI elements (menus, sidebars, buttons, etc.)',
        latinFont: 'Latin Font',
        latinFontDesc: 'Font used for Latin characters (A-Z, a-z, 0-9, punctuation)',
        recommendedLatinFonts: 'Recommended Latin Fonts',
        latinFontScope: 'Latin Font Scope',
        latinFontScopeDesc: 'Fine-tune which character ranges use the Latin font',
        scopeBasic: 'Basic Latin only (A-Z, a-z, 0-9)',
        scopeExtended: 'Basic + Extended Latin (includes accented characters)',
        scopeFull: 'Full Latin + Symbols (includes punctuation and special symbols)',

        // Font Legend
        legendConverted: 'Converted',
        legendNotConverted: 'Not Converted',
        legendCachedOnly: 'Cached Only',
        legendNotExist: 'Not Exist',
        filterAll: 'All',
        noConvertedFonts: 'No converted fonts found',
        noNotConvertedFonts: 'No unconverted fonts found',
        noNotExistFonts: 'No missing fonts found',
        noCachedOnlyFonts: 'No cached-only fonts found',

        // Font Actions
        scanFonts: 'Scan Fonts',
        convertToBase64: 'Convert to Base64',
        deleteFont: 'Delete Font',
        convertAll: 'Convert All',

        // Fallback Operations
        deleteUnusedFonts: 'Delete Unused Fonts',
        rescanFonts: 'Rescan Fonts',
        fontsRescanned: 'Fonts Rescanned',
        converting: 'Converting...',
        allFontsConverted: 'All Fonts Converted',
        fontFileStatus: 'Font File Status',
        deleteUnusedFontsDesc: 'Delete unused font files (configured fonts will not be deleted)',
        clearCache: 'Clear Cache',
        clearCacheDesc: 'Clear all converted font cache files',
        applyNow: 'Apply Now',
        applyNowDesc: 'Apply current font configuration',
        applyFonts: 'Apply fonts',

        // Font Variant Warnings
        variantWarningTitle: 'Font Variant Warning',
        variantWarningBody: 'The selected font "{fontFamily}" only has {variantCount} variant(s) ({variantList}).\n\nFor proper italic and bold rendering in Latin-script content, it\'s recommended to use a font family with Regular, Italic, Bold, and Bold Italic variants. Missing variants may cause faux italic/bold rendering issues.',
        variantWarningContinue: 'Continue anyway',
        variantWarningCancel: 'Cancel',
        nonLatinFontNote: 'Non-Latin fonts (Chinese, Japanese, Korean, etc.) can ignore this warning',

        // Override System Settings
        overrideSystemSettingsTitle: 'Custom Settings Override',
        overrideSystemSettingsContent: 'All custom font settings applied here will override Obsidian\'s system appearance settings.',

        // Performance Warning
        performanceWarningTitle: 'Performance Considerations',
        performanceWarningContent: 'Avoid mixing too many languages in a single line of text. Dense multilingual mixing (e.g., Chinese + Japanese + Korean + Arabic + Russian in one line) may trigger font fallback mechanisms that can freeze the rendering engine.\n\nRecommendation: Keep content from different languages in separate paragraphs or sections for optimal performance.',

        // Settings Page Callouts
        incompleteVariantTitle: 'Font Variant Incomplete',
        incompleteVariantBody: 'The selected font "{fontFamily}" only has {variantCount} variant(s) ({variantList}).\nRecommendation: Choose a font family with Regular, Italic, Bold, and Bold Italic variants to ensure proper italic and bold rendering.\nNon-Latin fonts typically do not require full Italic/Bold variants and can ignore this warning.',
        monospaceRequirement: 'Monospace Font Required',
        monospaceRequirementBody: 'Code fonts must be monospace. Regular Latin fonts will cause code alignment issues.',
        mathFontRequirement: 'Math Font Required',
        mathFontRequirementBody: 'LaTeX math fonts must be dedicated math fonts (e.g., Latin Modern Math, XITS Math). Regular fonts cannot render math symbols correctly.',
        missingVariantTitle: 'Missing Font Variants',
        missingVariantBody: '{latinFont} is missing the following variants: {missingList}. Missing styles will use browser synthesis (lower quality).',

        // Font Missing Warning
        fontMissingWarning: 'Font file is missing, fallback to system default',

        // UI Text
        variantsSuffix: 'variants',
        variantsWithCheckmark: '{familyName} ✓ ({variantCount} variants)',
        variantsWithoutCheckmark: '{familyName} ({variantCount} variants)',
        converted: 'Converted',
        notFoundFontFamily: 'Font family not found. Please verify font folder structure.',
        importFont: 'Import Font',
        convertAllFonts: 'Convert All Fonts (Make Usable)',
        recommendedLatinFontsLabel: '--- Recommended Latin Fonts ---',
        otherFontsLabel: '--- Other Fonts ---',
        expandCollapse: 'Expand/Collapse',
        expandAll: 'Expand All',
        collapseAll: 'Collapse All',
        reconvertFont: 'Reconvert this font',
        deleteThisFont: 'Delete this font',
        confirmDeleteFont: 'Are you sure you want to delete font "{fontName}"?',
        deletedFont: '✓ Deleted {fontName}',
        deleteFailedError: '⚠️ Delete failed: {error}',
        noUnusedFonts: 'No unused fonts',
        confirmDeleteUnusedFonts: 'Found {count} unused fonts. Are you sure you want to delete them?',
        deletedUnusedFonts: '✓ Deleted {count} unused fonts',
        deleteError: '⚠️ Error deleting fonts',
        importedFonts: '✓ Imported {count} font files',
        importing: 'Importing...',
        importError: '⚠️ Import failed',
        importFailedError: '⚠️ Import failed: {error}',
        punctuationDesc: '.,!?;: and other common punctuation',
        symbolsDesc: '@#$%&* and other special characters',

        // Notices
        fontsApplied: '✓ Fonts applied',
        fontConverted: '✓ Font converted',
        conversionFailed: '⚠️ Font conversion failed',
        allConverted: '✓ All fonts converted',
        cacheCleared: '✓ Cleaned {count} cache files',
        cacheClearFailed: '⚠️ Failed to clear cache',
        fontDeleted: '✓ Font deleted',
        deleteFailed: '⚠️ Failed to delete font',
        unusedDeleted: '✓ Deleted {count} unused fonts',
        scanComplete: '✓ Scanned {count} fonts',

        // Modals
        confirmDelete: 'Confirm Delete',
        confirmDeleteMsg: 'Are you sure you want to delete this font?',
        confirmDeleteUnused: 'Are you sure you want to delete all unused fonts?',
        delete: 'Delete',
        cancel: 'Cancel',
        confirm: 'Confirm',

        // Font Info
        variantsCount: '{count} variants',
        familyName: 'Family',
        style: 'Style',
        path: 'Path',

        // Preset Management (New)
        syncDelayTitle: 'Cross-Device Sync Notice',
        syncDelayContent: 'Font preset changes sync across devices via Obsidian Sync or third-party cloud services (iCloud, Dropbox). Changes may take time to propagate. Manually refresh if needed.',
        headerPresetManagement: 'Preset Management',
        createPreset: 'Create New Preset',
        createPresetDesc: 'Enter a name and click the plus icon to create',
        presetNamePlaceholder: 'e.g., Desktop Work, Mobile Reading',
        addPreset: 'Add preset',
        presetNameRequired: 'Preset name is required',
        presetNameExists: 'Preset name already exists',
        presetCreated: 'Preset created',
        headerDeviceManagement: 'Device Management (Drag & Drop)',
        devicePresetManagement: 'Device Preset Assignment',
        currentDevicePreset: 'Current Device Preset',
        currentDevicePresetDesc: 'Select which preset this device should use',
        selectPresetToEdit: 'Select Preset to Edit',
        selectPresetToEditDesc: 'Choose which preset you want to configure font settings for',
        presetName: 'Preset Name',
        presetId: 'Preset ID',
        usingGlobalPreset: 'This is a global preset (applies to all unassigned devices)',
        devices: 'devices',
        global: 'Global',
        presetId: 'Preset ID',
        presetName: 'Preset Name',
        editPresetName: 'Edit preset name',
        enterNewPresetName: 'Enter new preset name',
        deletePreset: 'Delete preset',
        deletePresetWarning: 'After deleting this preset, all devices will use the default preset configuration. Please think twice if your preset differs from the default.',
        cannotDeleteDefaultPreset: 'Cannot delete the default preset',
        targetDevices: 'Target Devices',
        targetDevicesDesc: 'Devices that will use this preset',
        refreshDeviceList: 'Refresh device list',
        globalPresetNote: 'This is a global preset (applies to all devices by default)',
        currentDevice: 'Current Device',
        copyPresetCopy: 'Copy Preset',
        copyPresetCopyDesc: 'Create a copy of the current device\'s preset',
        copySuffix: '_Copy',
        presetCopied: 'Preset copied',
        deviceReassigned: 'Device reassigned to preset',
        dragDeviceHere: 'Drag devices here to assign to this preset',
        currentDeviceName: 'Current Device Name',
        deviceId: 'Device ID',
        deviceNamePlaceholder: 'e.g., Desktop-Mac, Mobile-Android',
        editDeviceName: 'Edit device name',
        moveDeviceToPreset: 'Move device to preset',
        fontConfiguration: 'Font Configuration',
        currentPresetConfig: 'Current Preset Configuration',
        usingGlobalPreset: 'You are using the global preset (default for all unassigned devices)',
        fontNotFound: 'Font not found in available fonts',
        removeDevice: 'Remove device',
        confirmRemoveDevice: 'Remove device "{0}" from all presets? This action cannot be undone.'
    },

    zh: {
        // Plugin Info
        pluginName: '本地字体加载器',
        pluginDesc: '从本地 Vault 加载自定义字体',

        // Settings Headers
        headerDirectoryConfig: '目录配置',
        headerGeneralSettings: '通用设置',
        headerFontApplication: '字体应用设置',
        headerFontFileConfig: '字体文件配置',
        headerFallback: '备用操作',

        // Directory Configuration
        fontSourceDir: '字体源目录',
        fontSourceDirDesc: '包含字体家族文件夹的目录',
        cacheDir: 'Base64 缓存目录',
        cacheDirDesc: '转换后的 CSS 文件存储位置',

        // General Settings
        autoLoad: '启动时自动加载',
        autoLoadDesc: '当 Obsidian 启动时自动应用字体',

        // Font Types
        uiFontName: 'UI 界面字体',
        uiFontDesc: '侧边栏、菜单、按钮等界面元素',
        textFontName: '正文字体',
        textFontDesc: '编辑器正文内容',
        textFontWarning: '⚠️ 建议选择包含 Regular/Italic/Bold/BoldItalic 四种变体的字体家族，以确保斜体和粗体正常显示',
        headingFontName: '标题字体',
        headingFontDesc: '用于正文内的 Markdown 标题（h1-h6）',
        headingUseTextFont: '使用正文字体',
        headingUseUIFont: '使用UI字体',
        headingApplyToFileTitle: '应用到文件名标题',
        headingApplyToFileTitleDesc: '同时将标题字体应用到笔记顶部显示的文件名标题',
        monospaceFontName: '代码字体',
        monospaceFontDesc: '代码块和行内代码',
        monospaceFontWarning: '⚠️ 必须选择等宽字体（Monospace），普通拉丁字体会导致代码对齐错乱',
        mathFontName: 'LaTeX 数学字体',
        mathFontDesc: '数学公式渲染',
        mathFontWarning: '⚠️ 必须选择专用数学字体（如 Latin Modern Math, XITS Math），普通字体无法正确渲染数学符号',
        systemDefault: '-- 系统默认 --',

        // Latin Font Separation
        latinFontInfo: '拉丁字体分离',
        latinFontInfoDesc: '启用后，可单独指定拉丁字体。拉丁字符（A-Z、a-z、数字、标点）将使用拉丁字体，而非拉丁字符（CJK等）仍使用原字体。',
        latinFontInfoDescForLatinUsers: '此功能专为混合使用拉丁文字和非拉丁文字的用户设计（例如：英文 + 中文/日文/韩文）。如果您主要使用拉丁文字书写，可能不需要此功能。',
        latinFontEnabled: '启用拉丁字体分离',
        latinFontEnabledDesc: '为拉丁字符和非拉丁字符使用不同字体',
        latinFontForUI: '拉丁字体应用于 UI',
        latinFontForUIDesc: '启用后，拉丁字体也将应用于 UI 元素（菜单、侧边栏、按钮等）',
        latinFont: '拉丁字体',
        latinFontDesc: '用于拉丁字符的字体（A-Z、a-z、0-9、标点）',
        recommendedLatinFonts: '推荐的拉丁字体',
        latinFontScope: '拉丁字体作用范围',
        latinFontScopeDesc: '精细调整哪些字符范围使用拉丁字体',
        scopeBasic: '仅基本拉丁字符（A-Z、a-z、0-9）',
        scopeExtended: '基本 + 扩展拉丁字符（包含重音字符）',
        scopeFull: '完整拉丁字符 + 符号（包含标点和特殊符号）',

        // Font Legend
        legendConverted: '已转换',
        legendNotConverted: '未转换',
        legendCachedOnly: '仅缓存',
        legendNotExist: '不存在',
        filterAll: '全部',
        noConvertedFonts: '没有已转换的字体',
        noNotConvertedFonts: '没有未转换的字体',
        noNotExistFonts: '没有缺失的字体',
        noCachedOnlyFonts: '没有仅缓存的字体',

        // Font Operations
        scanFonts: '扫描字体',
        convertToBase64: '转换为 Base64',
        deleteFont: '删除字体',
        convertAll: '全部转换',

        // Fallback Operations
        deleteUnusedFonts: '删除未使用的字体',
        rescanFonts: '重新扫描',
        fontsRescanned: '字体已重新扫描',
        converting: '转换中...',
        allFontsConverted: '所有字体已转换',
        fontFileStatus: '字体文件状态',
        deleteUnusedFontsDesc: '删除未使用的字体文件（已配置的字体不会被删除）',
        clearCache: '清除缓存',
        clearCacheDesc: '清除所有转换的字体缓存文件',
        applyNow: '立即应用',
        applyNowDesc: '应用当前字体配置',
        applyFonts: '应用字体',

        // Font Missing Warning
        fontMissingWarning: '当前字体文件缺失，已回退至系统设置',

        // Font Variant Warning
        variantWarningTitle: '字体变体警告',
        variantWarningBody: '所选字体 "{fontFamily}" 仅有 {variantCount} 个变体（{variantList}）。\n\n为确保拉丁文字内容的斜体和粗体正常显示，建议使用包含 Regular、Italic、Bold 和 Bold Italic 四种变体的字体家族。缺少变体可能导致伪斜体/伪粗体渲染问题。',
        variantWarningContinue: '仍然继续',
        variantWarningCancel: '取消',
        nonLatinFontNote: '非拉丁语言字体（中文、日文、韩文等）请忽略此警告',

        // Override System Settings
        overrideSystemSettingsTitle: '自定义设置优先',
        overrideSystemSettingsContent: '所有自定义设置一经应用，均会覆盖系统设置',

        // Performance Warning
        performanceWarningTitle: '性能注意事项',
        performanceWarningContent: '避免在单行内混合过多语言文字。密集的多语言混排（例如在同一行内混合中文+日文+韩文+阿拉伯文+俄文）可能触发字体回退机制，导致渲染引擎卡死。\n\n建议：将不同语言的内容分段显示，以获得最佳性能。',

        // Settings Page Callout
        incompleteVariantTitle: '字体变体不完整',
        incompleteVariantBody: '所选字体 "{fontFamily}" 仅有 {variantCount} 个变体（{variantList}）。\n建议：选择包含 Regular、Italic、Bold 和 Bold Italic 四种变体的字体家族，以确保斜体和粗体正常显示。\n非拉丁语言字体通常不需要完整的 Italic/Bold 变体，可以忽略此警告。',
        monospaceRequirement: '等宽字体要求',
        monospaceRequirementBody: '代码字体必须选择等宽字体（Monospace），普通拉丁字体会导致代码对齐错乱。',
        mathFontRequirement: '数学字体要求',
        mathFontRequirementBody: 'LaTeX 数学字体必须选择专用数学字体（如 Latin Modern Math、XITS Math），普通字体无法正确渲染数学符号。',
        missingVariantTitle: '缺少字体变体',
        missingVariantBody: '{latinFont} 缺少以下变体：{missingList}。缺失的样式将使用浏览器合成（效果较差）。',

        // UI Text
        variantsSuffix: '变体',
        variantsWithCheckmark: '{familyName} ✓ ({variantCount} 个变体)',
        variantsWithoutCheckmark: '{familyName} ({variantCount} 个变体)',
        converted: '已转换',
        notFoundFontFamily: '未找到字体家族，请确认字体文件夹结构正确',
        importFont: '导入字体',
        convertAllFonts: '转换所有字体（使其可用）',
        recommendedLatinFontsLabel: '--- 推荐的拉丁字体 ---',
        otherFontsLabel: '--- 其他字体 ---',
        expandCollapse: '展开/收起',
        expandAll: '全部展开',
        collapseAll: '全部折叠',
        reconvertFont: '重新转换此字体',
        deleteThisFont: '删除此字体',
        confirmDeleteFont: '确定要删除字体 "{fontName}" 吗？',
        deletedFont: '✓ 已删除 {fontName}',
        deleteFailedError: '⚠️ 删除失败: {error}',
        noUnusedFonts: '没有未使用的字体',
        confirmDeleteUnusedFonts: '发现 {count} 个未使用的字体，确定要删除吗？',
        deletedUnusedFonts: '✓ 已删除 {count} 个未使用的字体',
        deleteError: '⚠️ 删除字体时出错',
        importedFonts: '✓ 已导入 {count} 个字体文件',
        importing: '导入中...',
        importError: '⚠️ 导入失败',
        importFailedError: '⚠️ 导入失败: {error}',
        punctuationDesc: '.,!?;: 等常用标点',
        symbolsDesc: '@#$%&* 等特殊字符',

        // Notices
        fontsApplied: '✓ 字体已应用',
        fontConverted: '✓ 字体已转换',
        conversionFailed: '⚠️ 字体转换失败',
        allConverted: '✓ 所有字体已转换',
        cacheCleared: '✓ 已清除 {count} 个缓存文件',
        cacheClearFailed: '⚠️ 清除缓存失败',
        fontDeleted: '✓ 字体已删除',
        deleteFailed: '⚠️ 删除字体失败',
        unusedDeleted: '✓ 已删除 {count} 个未使用的字体',
        scanComplete: '✓ 已扫描 {count} 个字体',

        // Modals
        confirmDelete: '确认删除',
        confirmDeleteMsg: '确定要删除此字体吗？',
        confirmDeleteUnused: '确定要删除所有未使用的字体吗？',
        delete: '删除',
        cancel: '取消',
        confirm: '确认',


        // Font Info
        variantsCount: '{count} 个变体',
        familyName: '家族',
        style: '样式',
        path: '路径',

        // Preset Management (New)
        syncDelayTitle: '跨设备同步提示',
        syncDelayContent: '字体预设的变更通过 Obsidian Sync 或第三方云同步服务（iCloud、Dropbox）在设备间同步。变更可能需要一段时间才能传播到其他设备。如需立即生效，请手动刷新。',
        headerPresetManagement: '预设管理',
        createPreset: '创建新预设',
        createPresetDesc: '输入名称后点击加号图标创建',
        presetNamePlaceholder: '例如：桌面办公、移动阅读',
        addPreset: '添加预设',
        presetNameRequired: '预设名称不能为空',
        presetNameExists: '预设名称已存在',
        presetCreated: '预设已创建',
        headerDeviceManagement: '设备管理（拖拽分配）',
        devicePresetManagement: '设备所属预设管理',
        currentDevicePreset: '当前设备所属预设',
        currentDevicePresetDesc: '选择当前设备要使用的预设',
        selectPresetToEdit: '选择需要被设置的预设',
        selectPresetToEditDesc: '选择您要配置字体设置的预设',
        presetName: '预设名称',
        presetId: '预设 ID',
        usingGlobalPreset: '这是全局预设（应用于所有未分配设备）',
        devices: '设备',
        global: '全局',
        presetId: '预设 ID',
        presetName: '预设名称',
        editPresetName: '编辑预设名称',
        enterNewPresetName: '输入新的预设名称',
        deletePreset: '删除预设',
        deletePresetWarning: '删除此预设后，预设所属的设备均会使用默认预设配置，若您设置的预设与默认预设不同，请三思而后行',
        cannotDeleteDefaultPreset: '无法删除默认预设',
        targetDevices: '目标设备',
        targetDevicesDesc: '将使用此预设的设备列表',
        refreshDeviceList: '刷新设备列表',
        globalPresetNote: '这是全局预设（默认应用于所有设备）',
        currentDevice: '当前设备',
        copyPresetCopy: '复制预设副本',
        copyPresetCopyDesc: '为当前设备创建预设的副本',
        copySuffix: '_副本',
        presetCopied: '预设已复制',
        deviceReassigned: '设备已重新分配到预设',
        dragDeviceHere: '拖动设备到此处以分配到该预设',
        currentDeviceName: '当前设备名称',
        deviceId: '设备 ID',
        deviceNamePlaceholder: '例如：桌面-Mac、移动-安卓',
        editDeviceName: '编辑设备名称',
        moveDeviceToPreset: '移动设备到预设',
        fontConfiguration: '字体配置',
        currentPresetConfig: '当前预设配置',
        usingGlobalPreset: '您正在使用全局预设（所有未分配设备的默认配置）',
        fontNotFound: '字体在可用字体列表中不存在',
        removeDevice: '移除设备',
        confirmRemoveDevice: '从所有预设中移除设备"{0}"？此操作无法撤销。'
    },

    ja: {
        // Plugin Info
        pluginName: 'ローカルフォントローダー',
        pluginDesc: 'ローカル Vault からカスタムフォントを読み込む',

        // Settings Headers
        headerDirectoryConfig: 'ディレクトリ設定',
        headerGeneralSettings: '一般設定',
        headerFontApplication: 'フォント適用設定',
        headerFontFileConfig: 'フォントファイル設定',
        headerFallback: 'フォールバック操作',
        devicePresetManagement: 'デバイスプリセット管理',
        currentDevicePreset: '現在のデバイスプリセット',
        currentDevicePresetDesc: 'このデバイスが使用するプリセットを選択',
        selectPresetToEdit: '編集するプリセットを選択',
        selectPresetToEditDesc: 'フォント設定を構成するプリセットを選択',
        presetName: 'プリセット名',
        presetId: 'プリセット ID',
        usingGlobalPreset: 'グローバルプリセットです（未割り当てのすべてのデバイスに適用）',

        // Directory Settings
        fontSourceDir: 'フォントソースディレクトリ',
        fontSourceDirDesc: 'フォントファミリーフォルダを含むディレクトリ',
        cacheDir: 'Base64 キャッシュディレクトリ',
        cacheDirDesc: '変換された CSS ファイルの保存場所',

        // General Settings
        autoLoad: '起動時に自動読み込み',
        autoLoadDesc: 'Obsidian 起動時にフォントを自動適用',

        // Font Types
        uiFontName: 'UI インターフェースフォント',
        uiFontDesc: 'サイドバー、メニュー、ボタンなどの UI 要素',
        textFontName: '本文フォント',
        textFontDesc: 'エディター本文コンテンツ',
        textFontWarning: '⚠️ 推奨：斜体と太字が正しく表示されるように、Regular/Italic/Bold/BoldItalic バリアントを含むフォントファミリーを選択してください',
        headingFontName: '見出しフォント',
        headingFontDesc: 'コンテンツ内の Markdown 見出し（h1-h6）用フォント',
        headingUseTextFont: '本文フォントを使用',
        headingUseUIFont: 'UI フォントを使用',
        headingApplyToFileTitle: 'ファイル名タイトルに適用',
        headingApplyToFileTitleDesc: 'ノート上部に表示されるインラインファイルタイトルにも見出しフォントを適用',
        monospaceFontName: 'コードフォント',
        monospaceFontDesc: 'コードブロックとインラインコード',
        monospaceFontWarning: '⚠️ 必須：等幅フォントである必要があります。通常のラテン文字フォントはコードの配置を崩します',
        mathFontName: 'LaTeX 数式フォント',
        mathFontDesc: '数式のレンダリング',
        mathFontWarning: '⚠️ 必須：専用の数式フォント（Latin Modern Math、XITS Math など）が必要です。通常のフォントでは数学記号を正しくレンダリングできません',
        systemDefault: '-- システムデフォルト --',

        // Latin Font Separation
        latinFontInfo: 'ラテン文字フォント分離',
        latinFontInfoDesc: '有効にすると、別のラテン文字フォントを指定できます。ラテン文字（A-Z、a-z、数字、句読点）はラテン文字フォントを使用し、非ラテン文字（CJK など）は元のフォントを使用し続けます。',
        latinFontInfoDescForLatinUsers: 'この機能はラテン文字と非ラテン文字を混在させるユーザー向けです（例：英語 + 中国語/日本語/韓国語）。主にラテン文字言語で執筆する場合、この機能は必要ないかもしれません。',
        latinFontEnabled: 'ラテン文字フォント分離を有効化',
        latinFontEnabledDesc: 'ラテン文字と非ラテン文字に異なるフォントを使用',
        latinFontForUI: 'UIにラテン文字フォントを適用',
        latinFontForUIDesc: '有効にすると、ラテン文字フォントはUI要素（メニュー、サイドバー、ボタンなど）にも適用されます',
        latinFont: 'ラテン文字フォント',
        latinFontDesc: 'ラテン文字に使用されるフォント（A-Z、a-z、0-9、句読点）',
        recommendedLatinFonts: '推奨ラテン文字フォント',
        latinFontScope: 'ラテン文字フォントスコープ',
        latinFontScopeDesc: 'どの文字範囲にラテン文字フォントを使用するかを微調整',
        scopeBasic: '基本ラテン文字のみ（A-Z、a-z、0-9）',
        scopeExtended: '基本 + 拡張ラテン文字（アクセント付き文字を含む）',
        scopeFull: '完全ラテン文字 + 記号（句読点と特殊記号を含む）',

        // Font Legend
        legendConverted: '変換済み',
        legendNotConverted: '未変換',
        legendCachedOnly: 'キャッシュのみ',
        legendNotExist: '存在しない',
        filterAll: 'すべて',
        noConvertedFonts: '変換済みのフォントがありません',
        noNotConvertedFonts: '未変換のフォントがありません',
        noNotExistFonts: '欠落しているフォントがありません',

        // Font Operations
        scanFonts: 'フォントをスキャン',
        convertToBase64: 'Base64 に変換',
        deleteFont: 'フォントを削除',
        convertAll: 'すべて変換',

        // Fallback Operations
        deleteUnusedFonts: '未使用フォントを削除',
        rescanFonts: 'フォントを再スキャン',
        fontsRescanned: 'フォントを再スキャンしました',
        converting: '変換中...',
        allFontsConverted: 'すべてのフォントが変換されました',
        fontFileStatus: 'フォントファイルステータス',
        deleteUnusedFontsDesc: '未使用のフォントファイルを削除（設定済みフォントは削除されません）',
        clearCache: 'キャッシュをクリア',
        clearCacheDesc: '変換されたすべてのフォントキャッシュファイルをクリア',
        applyNow: '今すぐ適用',
        applyNowDesc: '現在のフォント設定を適用',
        applyFonts: 'フォントを適用',

        // Font Missing Warning
        fontMissingWarning: 'フォントファイルが見つかりません。システムデフォルトにフォールバックしました',

        // Font Variant Warning
        variantWarningTitle: 'フォントバリアント警告',
        variantWarningBody: '選択したフォント "{fontFamily}" には {variantCount} 個のバリアント（{variantList}）しかありません。\n\nラテン文字コンテンツの斜体と太字を適切にレンダリングするには、Regular、Italic、Bold、Bold Italic のバリアントを含むフォントファミリーを使用することをお勧めします。バリアントが不足していると、疑似斜体/疑似太字のレンダリング問題が発生する可能性があります。',
        variantWarningContinue: 'このまま続ける',
        variantWarningCancel: 'キャンセル',

        // Notices
        fontsApplied: '✓ フォントが適用されました',
        fontConverted: '✓ フォントが変換されました',
        conversionFailed: '⚠️ フォント変換に失敗しました',
        allConverted: '✓ すべてのフォントが変換されました',
        cacheCleared: '✓ {count} 個のキャッシュファイルをクリアしました',
        cacheClearFailed: '⚠️ キャッシュのクリアに失敗しました',
        fontDeleted: '✓ フォントが削除されました',
        deleteFailed: '⚠️ フォントの削除に失敗しました',
        unusedDeleted: '✓ {count} 個の未使用フォントを削除しました',
        scanComplete: '✓ {count} 個のフォントをスキャンしました',
        importedFonts: '✓ {count} 個のフォントファイルをインポートしました',
        importing: 'インポート中...',
        importError: '⚠️ インポートに失敗しました',

        // Modals
        confirmDelete: '削除の確認',
        confirmDeleteMsg: 'このフォントを削除してもよろしいですか？',
        confirmDeleteUnused: 'すべての未使用フォントを削除してもよろしいですか？',
        delete: '削除',
        cancel: 'キャンセル',
        confirm: '確認',

        // Font Info
        variantsCount: '{count} バリアント',
        familyName: 'ファミリー',
        style: 'スタイル',
        path: 'パス'
    },

    ko: {
        // Plugin Info
        pluginName: '로컬 폰트 로더',
        pluginDesc: '로컬 보관함에서 커스텀 폰트 로드',

        // Settings Headers
        headerDirectoryConfig: '디렉토리 설정',
        headerGeneralSettings: '일반 설정',
        headerFontApplication: '폰트 적용 설정',
        headerFontFileConfig: '폰트 파일 설정',
        headerFallback: '대체 작업',
        devicePresetManagement: '장치 프리셋 관리',
        currentDevicePreset: '현재 장치 프리셋',
        currentDevicePresetDesc: '이 장치가 사용할 프리셋 선택',
        selectPresetToEdit: '편집할 프리셋 선택',
        selectPresetToEditDesc: '폰트 설정을 구성할 프리셋 선택',
        presetName: '프리셋 이름',
        presetId: '프리셋 ID',
        usingGlobalPreset: '전역 프리셋입니다（할당되지 않은 모든 장치에 적용）',

        // Directory Settings
        fontSourceDir: '폰트 소스 디렉토리',
        fontSourceDirDesc: '폰트 패밀리 폴더가 포함된 디렉토리',
        cacheDir: 'Base64 캐시 디렉토리',
        cacheDirDesc: '변환된 CSS 파일 저장 위치',

        // General Settings
        autoLoad: '시작 시 자동 로드',
        autoLoadDesc: 'Obsidian 시작 시 폰트 자동 적용',

        // Font Types
        uiFontName: 'UI 인터페이스 폰트',
        uiFontDesc: '사이드바, 메뉴, 버튼 등 UI 요소',
        textFontName: '본문 폰트',
        textFontDesc: '편집기 본문 콘텐츠',
        textFontWarning: '⚠️ 권장：기울임꼴과 굵은 글씨가 올바르게 표시되도록 Regular/Italic/Bold/BoldItalic 변형이 포함된 폰트 패밀리를 선택하세요',
        headingFontName: '제목 폰트',
        headingFontDesc: '콘텐츠 내 마크다운 제목（h1-h6）용 폰트',
        headingUseTextFont: '본문 폰트 사용',
        headingUseUIFont: 'UI 폰트 사용',
        headingApplyToFileTitle: '파일명 제목에 적용',
        headingApplyToFileTitleDesc: '노트 상단에 표시되는 인라인 파일 제목에도 제목 폰트 적용',
        monospaceFontName: '코드 폰트',
        monospaceFontDesc: '코드 블록 및 인라인 코드',
        monospaceFontWarning: '⚠️ 필수：고정폭 폰트여야 합니다. 일반 라틴 폰트는 코드 정렬을 깨뜨립니다',
        mathFontName: 'LaTeX 수학 폰트',
        mathFontDesc: '수학 공식 렌더링',
        mathFontWarning: '⚠️ 필수：전용 수학 폰트（예: Latin Modern Math, XITS Math）가 필요합니다. 일반 폰트는 수학 기호를 올바르게 렌더링할 수 없습니다',
        systemDefault: '-- 시스템 기본값 --',

        // Latin Font Separation
        latinFontInfo: '라틴 폰트 분리',
        latinFontInfoDesc: '활성화하면 별도의 라틴 폰트를 지정할 수 있습니다. 라틴 문자（A-Z, a-z, 숫자, 구두점）는 라틴 폰트를 사용하고 비라틴 문자（CJK 등）는 원래 폰트를 계속 사용합니다.',
        latinFontInfoDescForLatinUsers: '이 기능은 라틴 문자와 비라틴 문자를 혼용하는 사용자를 위한 것입니다（예: 영어 + 중국어/일본어/한국어）. 주로 라틴 문자 언어로 작성하는 경우 이 기능이 필요하지 않을 수 있습니다.',
        latinFontEnabled: '라틴 폰트 분리 활성화',
        latinFontEnabledDesc: '라틴 문자와 비라틴 문자에 다른 폰트 사용',
        latinFontForUI: 'UI에 라틴 폰트 적용',
        latinFontForUIDesc: '활성화하면 라틴 폰트가 UI 요소（메뉴, 사이드바, 버튼 등）에도 적용됩니다',
        latinFont: '라틴 폰트',
        latinFontDesc: '라틴 문자에 사용되는 폰트（A-Z, a-z, 0-9, 구두점）',
        recommendedLatinFonts: '권장 라틴 폰트',
        latinFontScope: '라틴 폰트 범위',
        latinFontScopeDesc: '라틴 폰트를 사용할 문자 범위 세밀 조정',
        scopeBasic: '기본 라틴 문자만（A-Z, a-z, 0-9）',
        scopeExtended: '기본 + 확장 라틴 문자（악센트 문자 포함）',
        scopeFull: '전체 라틴 문자 + 기호（구두점 및 특수 기호 포함）',

        // Font Legend
        legendConverted: '변환됨',
        legendNotConverted: '변환되지 않음',
        legendCachedOnly: '캐시만',
        legendNotExist: '존재하지 않음',
        filterAll: '전체',
        noConvertedFonts: '변환된 폰트가 없습니다',
        noNotConvertedFonts: '변환되지 않은 폰트가 없습니다',
        noNotExistFonts: '누락된 폰트가 없습니다',

        // Font Operations
        scanFonts: '폰트 스캔',
        convertToBase64: 'Base64로 변환',
        deleteFont: '폰트 삭제',
        convertAll: '모두 변환',

        // Fallback Operations
        deleteUnusedFonts: '사용하지 않는 폰트 삭제',
        rescanFonts: '폰트 재스캔',
        fontsRescanned: '폰트 재스캔 완료',
        converting: '변환 중...',
        allFontsConverted: '모든 폰트 변환 완료',
        fontFileStatus: '폰트 파일 상태',
        deleteUnusedFontsDesc: '사용하지 않는 폰트 파일 삭제（설정된 폰트는 삭제되지 않음）',
        clearCache: '캐시 지우기',
        clearCacheDesc: '변환된 모든 폰트 캐시 파일 지우기',
        applyNow: '지금 적용',
        applyNowDesc: '현재 폰트 설정 적용',
        applyFonts: '폰트 적용',

        // Font Missing Warning
        fontMissingWarning: '폰트 파일이 없습니다. 시스템 기본값으로 대체되었습니다',

        // Font Variant Warning
        variantWarningTitle: '폰트 변형 경고',
        variantWarningBody: '선택한 폰트 "{fontFamily}"에는 {variantCount}개의 변형（{variantList}）만 있습니다.\n\n라틴 문자 콘텐츠의 기울임꼴과 굵은 글씨를 올바르게 렌더링하려면 Regular, Italic, Bold, Bold Italic 변형이 포함된 폰트 패밀리를 사용하는 것이 좋습니다. 변형이 누락되면 가짜 기울임꼴/가짜 굵은 글씨 렌더링 문제가 발생할 수 있습니다.',
        variantWarningContinue: '계속 진행',
        variantWarningCancel: '취소',

        // Notices
        fontsApplied: '✓ 폰트가 적용되었습니다',
        fontConverted: '✓ 폰트가 변환되었습니다',
        conversionFailed: '⚠️ 폰트 변환 실패',
        allConverted: '✓ 모든 폰트가 변환되었습니다',
        cacheCleared: '✓ {count}개의 캐시 파일을 지웠습니다',
        cacheClearFailed: '⚠️ 캐시 지우기 실패',
        fontDeleted: '✓ 폰트가 삭제되었습니다',
        deleteFailed: '⚠️ 폰트 삭제 실패',
        unusedDeleted: '✓ {count}개의 사용하지 않는 폰트를 삭제했습니다',
        scanComplete: '✓ {count}개의 폰트를 스캔했습니다',
        importedFonts: '✓ {count}개의 폰트 파일을 가져왔습니다',
        importing: '가져오는 중...',
        importError: '⚠️ 가져오기 실패',

        // Modals
        confirmDelete: '삭제 확인',
        confirmDeleteMsg: '이 폰트를 삭제하시겠습니까？',
        confirmDeleteUnused: '사용하지 않는 모든 폰트를 삭제하시겠습니까？',
        delete: '삭제',
        cancel: '취소',
        confirm: '확인',

        // Font Info
        variantsCount: '{count}개 변형',
        familyName: '패밀리',
        style: '스타일',
        path: '경로'
    },

    es: {
        // Plugin Info
        pluginName: 'Cargador de Fuentes Locales',
        pluginDesc: 'Carga fuentes personalizadas desde tu bóveda local',

        // Settings Headers
        headerDirectoryConfig: 'Configuración de Directorios',
        headerGeneralSettings: 'Configuración General',
        headerFontApplication: 'Configuración de Aplicación de Fuentes',
        headerFontFileConfig: 'Configuración de Archivos de Fuentes',
        headerFallback: 'Operaciones de Respaldo',
        devicePresetManagement: 'Gestión de Presets de Dispositivo',
        currentDevicePreset: 'Preset de Dispositivo Actual',
        currentDevicePresetDesc: 'Seleccionar qué preset debe usar este dispositivo',
        selectPresetToEdit: 'Seleccionar Preset para Editar',
        selectPresetToEditDesc: 'Elegir qué preset desea configurar',
        presetName: 'Nombre del Preset',
        presetId: 'ID del Preset',
        usingGlobalPreset: 'Este es un preset global (aplica a todos los dispositivos no asignados)',

        // Directory Settings
        fontSourceDir: 'Directorio de Origen de Fuentes',
        fontSourceDirDesc: 'Directorio que contiene carpetas de familias de fuentes',
        cacheDir: 'Directorio de Caché Base64',
        cacheDirDesc: 'Donde se almacenan los archivos CSS convertidos',

        // General Settings
        autoLoad: 'Cargar automáticamente al iniciar',
        autoLoadDesc: 'Aplicar automáticamente las fuentes cuando se inicia Obsidian',

        // Tipos de fuente
        uiFontName: 'Fuente de Interfaz UI',
        uiFontDesc: 'Barra lateral, menús, botones y otros elementos de UI',
        textFontName: 'Fuente de Texto del Cuerpo',
        textFontDesc: 'Contenido del cuerpo del editor',
        textFontWarning: '⚠️ Recomendado: Elija una familia de fuentes con variantes Regular/Italic/Bold/BoldItalic para una correcta renderización de cursiva y negrita',
        monospaceFontName: 'Fuente de Código',
        monospaceFontDesc: 'Bloques de código y código en línea',
        monospaceFontWarning: '⚠️ Requerido: Debe ser una fuente monoespaciada. Las fuentes latinas regulares causarán problemas de alineación de código',
        mathFontName: 'Fuente de Matemáticas LaTeX',
        mathFontDesc: 'Renderizado de fórmulas matemáticas',
        mathFontWarning: '⚠️ Requerido: Debe ser una fuente matemática dedicada (ej., Latin Modern Math, XITS Math). Las fuentes regulares no pueden renderizar símbolos matemáticos correctamente',
        systemDefault: '-- Predeterminado del Sistema --',

        // Latin Font Separation
        latinFontInfo: 'Separación de Fuentes Latinas',
        latinFontInfoDesc: 'Al activarse, puede asignar una fuente latina separada. Los caracteres latinos (A-Z, a-z, números, puntuación) usarán la fuente latina, mientras que los caracteres no latinos (CJK, etc.) continuarán usando la fuente original.',
        latinFontInfoDescForLatinUsers: 'Esta función está diseñada para usuarios que mezclan escrituras latinas y no latinas (ej., Inglés + Chino/Japonés/Coreano). Si escribe principalmente en idiomas con escritura latina, probablemente no necesite esta función.',
        latinFontEnabled: 'Activar Separación de Fuentes Latinas',
        latinFontEnabledDesc: 'Usar fuentes separadas para caracteres latinos y no latinos',
        latinFontForUI: 'Aplicar Fuente Latina a UI',
        latinFontForUIDesc: 'Cuando está habilitado, la fuente latina también se aplicará a elementos de UI (menús, barras laterales, botones, etc.)',
        latinFont: 'Fuente Latina',
        latinFontDesc: 'Fuente usada para caracteres latinos (A-Z, a-z, 0-9, puntuación)',
        recommendedLatinFonts: 'Fuentes Latinas Recomendadas',
        latinFontScope: 'Ámbito de Fuente Latina',
        latinFontScopeDesc: 'Ajustar qué rangos de caracteres usan la fuente latina',
        scopeBasic: 'Solo latín básico (A-Z, a-z, 0-9)',
        scopeExtended: 'Latín básico + extendido (incluye caracteres acentuados)',
        scopeFull: 'Latín completo + símbolos (incluye puntuación y símbolos especiales)',

        // Leyenda de fuentes
        legendConverted: 'Convertido',
        legendNotConverted: 'No Convertido',
        legendCachedOnly: 'Solo Caché',
        legendNotExist: 'No Existe',
        filterAll: 'Todos',
        noConvertedFonts: 'No se encontraron fuentes convertidas',
        noNotConvertedFonts: 'No se encontraron fuentes sin convertir',
        noNotExistFonts: 'No se encontraron fuentes faltantes',

        // Acciones de fuentes
        scanFonts: 'Escanear Fuentes',
        convertToBase64: 'Convertir a Base64',
        deleteFont: 'Eliminar Fuente',
        convertAll: 'Convertir Todo',

        // Operaciones de respaldo
        deleteUnusedFonts: 'Eliminar Fuentes No Usadas',
        rescanFonts: 'Reescanear Fuentes',
        fontsRescanned: 'Fuentes Reescaneadas',
        converting: 'Convirtiendo...',
        allFontsConverted: 'Todas las Fuentes Convertidas',
        fontFileStatus: 'Estado de Archivos de Fuentes',
        deleteUnusedFontsDesc: 'Eliminar archivos de fuentes no usadas (las fuentes configuradas no se eliminarán)',
        clearCache: 'Limpiar Caché',
        clearCacheDesc: 'Limpiar todos los archivos de caché de fuentes convertidas',
        applyNow: 'Aplicar Ahora',
        applyNowDesc: 'Aplicar la configuración de fuentes actual',
        applyFonts: 'Aplicar Fuentes',

        // Advertencia de Fuente Faltante
        fontMissingWarning: 'Archivo de fuente faltante, usando predeterminado del sistema',

        // Advertencias de variantes de fuente
        variantWarningTitle: 'Advertencia de Variantes de Fuente',
        variantWarningBody: 'La fuente seleccionada "{fontFamily}" solo tiene {variantCount} variante(s) ({variantList}).\n\nPara una correcta renderización de cursiva y negrita en contenido de escritura latina, se recomienda usar una familia de fuentes con variantes Regular, Italic, Bold y Bold Italic. Las variantes faltantes pueden causar problemas de renderización de falsa cursiva/negrita.',
        variantWarningContinue: 'Continuar de todos modos',
        variantWarningCancel: 'Cancelar',

        // Notificaciones
        fontsApplied: '✓ Fuentes aplicadas',
        fontConverted: '✓ Fuente convertida',
        conversionFailed: '⚠️ Conversión de fuente fallida',
        allConverted: '✓ Todas las fuentes convertidas',
        cacheCleared: '✓ Se limpiaron {count} archivos de caché',
        cacheClearFailed: '⚠️ Error al limpiar caché',
        fontDeleted: '✓ Fuente eliminada',
        deleteFailed: '⚠️ Error al eliminar fuente',
        unusedDeleted: '✓ Se eliminaron {count} fuentes no usadas',
        scanComplete: '✓ Se escanearon {count} fuentes',
        importedFonts: '✓ Se importaron {count} archivos de fuentes',
        importing: 'Importando...',
        importError: '⚠️ Error al importar',

        // Modales
        confirmDelete: 'Confirmar Eliminación',
        confirmDeleteMsg: '¿Está seguro de que desea eliminar esta fuente?',
        confirmDeleteUnused: '¿Está seguro de que desea eliminar todas las fuentes no usadas?',
        delete: 'Eliminar',
        cancel: 'Cancelar',
        confirm: 'Confirmar',


        // Font Info
        variantsCount: '{count} variantes',
        familyName: 'Familia',
        style: 'Estilo',
        path: 'Ruta'
    },

    'zh-TW': {
        // Plugin Info
        pluginName: '本地字型載入器',
        pluginDesc: '從本地 Vault 載入自訂字型',

        // Settings Headers
        headerDirectoryConfig: '目錄設定',
        headerGeneralSettings: '通用設定',
        headerFontApplication: '字型套用設定',
        headerFontFileConfig: '字型檔案設定',
        headerFallback: '備用操作',

        // Directory Configuration
        fontSourceDir: '字型來源目錄',
        fontSourceDirDesc: '包含字型家族資料夾的目錄',
        cacheDir: 'Base64 快取目錄',
        cacheDirDesc: '轉換後的 CSS 檔案儲存位置',

        // General Settings
        autoLoad: '啟動時自動載入',
        autoLoadDesc: '當 Obsidian 啟動時自動套用字型',

        // Font Types
        uiFontName: 'UI 介面字型',
        uiFontDesc: '側邊欄、選單、按鈕等介面元素',
        textFontName: '正文字型',
        textFontDesc: '編輯器正文內容',
        textFontWarning: '⚠️ 建議選擇包含 Regular/Italic/Bold/BoldItalic 四種變體的字型家族，以確保斜體和粗體正常顯示',
        headingFontName: '標題字型',
        headingFontDesc: '用於正文內的 Markdown 標題（h1-h6）',
        headingUseTextFont: '使用正文字型',
        headingUseUIFont: '使用UI字型',
        headingApplyToFileTitle: '套用到檔案名稱標題',
        headingApplyToFileTitleDesc: '同時將標題字型套用到筆記頂部顯示的檔案名稱標題',
        monospaceFontName: '程式碼字型',
        monospaceFontDesc: '程式碼區塊和行內程式碼',
        monospaceFontWarning: '⚠️ 必須選擇等寬字型（Monospace），普通拉丁字型會導致程式碼對齊錯亂',
        mathFontName: 'LaTeX 數學字型',
        mathFontDesc: '數學公式渲染',
        mathFontWarning: '⚠️ 必須選擇專用數學字型（如 Latin Modern Math, XITS Math），普通字型無法正確渲染數學符號',
        systemDefault: '-- 系統預設 --',

        // Latin Font Separation
        latinFontInfo: '拉丁字型分離',
        latinFontInfoDesc: '啟用後，可單獨指定拉丁字型。拉丁字元（A-Z、a-z、數字、標點）將使用拉丁字型，而非拉丁字元（CJK等）仍使用原字型。',
        latinFontInfoDescForLatinUsers: '此功能專為混合使用拉丁文字和非拉丁文字的使用者設計（例如：英文 + 中文/日文/韓文）。如果您主要使用拉丁文字書寫，可能不需要此功能。',
        latinFontEnabled: '啟用拉丁字型分離',
        latinFontEnabledDesc: '為拉丁字元和非拉丁字元使用不同字型',
        latinFontForUI: '拉丁字型套用於 UI',
        latinFontForUIDesc: '啟用後，拉丁字型也將套用於 UI 元素（選單、側邊欄、按鈕等）',
        latinFont: '拉丁字型',
        latinFontDesc: '用於拉丁字元的字型（A-Z、a-z、0-9、標點）',
        recommendedLatinFonts: '推薦的拉丁字型',
        latinFontScope: '拉丁字型作用範圍',
        latinFontScopeDesc: '精細調整哪些字元範圍使用拉丁字型',
        scopeBasic: '僅基本拉丁字元（A-Z、a-z、0-9）',
        scopeExtended: '基本 + 擴充拉丁字元（包含重音字元）',
        scopeFull: '完整拉丁字元 + 符號（包含標點和特殊符號）',

        // Font Legend
        legendConverted: '已轉換',
        legendNotConverted: '未轉換',
        legendCachedOnly: '僅快取',
        legendNotExist: '不存在',
        filterAll: '全部',
        noConvertedFonts: '沒有已轉換的字型',
        noNotConvertedFonts: '沒有未轉換的字型',
        noNotExistFonts: '沒有缺失的字型',
        noCachedOnlyFonts: '沒有僅快取的字型',

        // Font Operations
        scanFonts: '掃描字型',
        convertToBase64: '轉換為 Base64',
        deleteFont: '刪除字型',
        convertAll: '全部轉換',

        // Fallback Operations
        deleteUnusedFonts: '刪除未使用的字型',
        rescanFonts: '重新掃描',
        fontsRescanned: '字型已重新掃描',
        converting: '轉換中...',
        allFontsConverted: '所有字型已轉換',
        fontFileStatus: '字型檔案狀態',
        deleteUnusedFontsDesc: '刪除未使用的字型檔案（已設定的字型不會被刪除）',
        clearCache: '清除快取',
        clearCacheDesc: '清除所有轉換的字型快取檔案',
        applyNow: '立即套用',
        applyNowDesc: '套用目前字型設定',
        applyFonts: '套用字型',

        // Font Missing Warning
        fontMissingWarning: '目前字型檔案缺失，已回退至系統設定',

        // Font Variant Warning
        variantWarningTitle: '字型變體警告',
        variantWarningBody: '所選字型 "{fontFamily}" 僅有 {variantCount} 個變體（{variantList}）。\n\n為確保拉丁文字內容的斜體和粗體正常顯示，建議使用包含 Regular、Italic、Bold 和 Bold Italic 四種變體的字型家族。缺少變體可能導致偽斜體/偽粗體渲染問題。',
        variantWarningContinue: '仍然繼續',
        variantWarningCancel: '取消',
        nonLatinFontNote: '非拉丁語言字型（中文、日文、韓文等）請忽略此警告',

        // Override System Settings
        overrideSystemSettingsTitle: '自訂設定優先',
        overrideSystemSettingsContent: '所有自訂設定一經套用，均會覆蓋系統設定',

        // Performance Warning
        performanceWarningTitle: '效能注意事項',
        performanceWarningContent: '避免在單行內混合過多語言文字。密集的多語言混排（例如在同一行內混合中文+日文+韓文+阿拉伯文+俄文）可能觸發字型回退機制，導致渲染引擎卡死。\n\n建議：將不同語言的內容分段顯示，以獲得最佳效能。',

        // Settings Page Callout
        incompleteVariantTitle: '字型變體不完整',
        incompleteVariantBody: '所選字型 "{fontFamily}" 僅有 {variantCount} 個變體（{variantList}）。\n建議：選擇包含 Regular、Italic、Bold 和 Bold Italic 四種變體的字型家族，以確保斜體和粗體正常顯示。\n非拉丁語言字型通常不需要完整的 Italic/Bold 變體，可以忽略此警告。',
        monospaceRequirement: '等寬字型要求',
        monospaceRequirementBody: '程式碼字型必須選擇等寬字型（Monospace），普通拉丁字型會導致程式碼對齊錯亂。',
        mathFontRequirement: '數學字型要求',
        mathFontRequirementBody: 'LaTeX 數學字型必須選擇專用數學字型（如 Latin Modern Math、XITS Math），普通字型無法正確渲染數學符號。',
        missingVariantTitle: '缺少字型變體',
        missingVariantBody: '{latinFont} 缺少以下變體：{missingList}。缺失的樣式將使用瀏覽器合成（效果較差）。',

        // UI Text
        variantsSuffix: '變體',
        variantsWithCheckmark: '{familyName} ✓ ({variantCount} 個變體)',
        variantsWithoutCheckmark: '{familyName} ({variantCount} 個變體)',
        converted: '已轉換',
        notFoundFontFamily: '未找到字型家族，請確認字型資料夾結構正確',
        importFont: '匯入字型',
        convertAllFonts: '轉換所有字型（使其可用）',
        recommendedLatinFontsLabel: '--- 推薦的拉丁字型 ---',
        otherFontsLabel: '--- 其他字型 ---',
        expandCollapse: '展開/收合',
        expandAll: '全部展開',
        collapseAll: '全部收合',
        reconvertFont: '重新轉換此字型',
        deleteThisFont: '刪除此字型',
        confirmDeleteFont: '確定要刪除字型 "{fontName}" 嗎？',
        deletedFont: '✓ 已刪除 {fontName}',
        deleteFailedError: '⚠️ 刪除失敗: {error}',
        noUnusedFonts: '沒有未使用的字型',
        confirmDeleteUnusedFonts: '發現 {count} 個未使用的字型，確定要刪除嗎？',
        deletedUnusedFonts: '✓ 已刪除 {count} 個未使用的字型',
        deleteError: '⚠️ 刪除字型時出錯',
        importedFonts: '✓ 已匯入 {count} 個字型檔案',
        importing: '匯入中...',
        importError: '⚠️ 匯入失敗',
        importFailedError: '⚠️ 匯入失敗: {error}',
        punctuationDesc: '.,!?;: 等常用標點',
        symbolsDesc: '@#$%&* 等特殊字元',

        // Notices
        fontsApplied: '✓ 字型已套用',
        fontConverted: '✓ 字型已轉換',
        conversionFailed: '⚠️ 字型轉換失敗',
        allConverted: '✓ 所有字型已轉換',
        cacheCleared: '✓ 已清除 {count} 個快取檔案',
        cacheClearFailed: '⚠️ 清除快取失敗',
        fontDeleted: '✓ 字型已刪除',
        deleteFailed: '⚠️ 刪除字型失敗',
        unusedDeleted: '✓ 已刪除 {count} 個未使用的字型',
        scanComplete: '✓ 已掃描 {count} 個字型',

        // Modals
        confirmDelete: '確認刪除',
        confirmDeleteMsg: '確定要刪除此字型嗎？',
        confirmDeleteUnused: '確定要刪除所有未使用的字型嗎？',
        delete: '刪除',
        cancel: '取消',
        confirm: '確認',

        // Font Info
        variantsCount: '{count} 個變體',
        familyName: '家族',
        style: '樣式',
        path: '路徑',

        // Preset Management (New)
        syncDelayTitle: '跨裝置同步提示',
        syncDelayContent: '字型預設的變更透過 Obsidian Sync 或第三方雲端同步服務（iCloud、Dropbox）在裝置間同步。變更可能需要一段時間才能傳播到其他裝置。如需立即生效，請手動重新整理。',
        headerPresetManagement: '預設管理',
        createPreset: '建立新預設',
        createPresetDesc: '輸入名稱後點選加號圖示建立',
        presetNamePlaceholder: '例如：桌面辦公、行動閱讀',
        addPreset: '新增預設',
        presetNameRequired: '預設名稱不能為空',
        presetNameExists: '預設名稱已存在',
        presetCreated: '預設已建立',
        headerDeviceManagement: '裝置管理（拖曳分配）',
        devicePresetManagement: '裝置所屬預設管理',
        currentDevicePreset: '目前裝置所屬預設',
        currentDevicePresetDesc: '選擇目前裝置要使用的預設',
        selectPresetToEdit: '選擇需要被設定的預設',
        selectPresetToEditDesc: '選擇您要設定字型設定的預設',
        presetName: '預設名稱',
        presetId: '預設 ID',
        usingGlobalPreset: '這是全域預設（套用於所有未分配裝置）',
        devices: '裝置',
        global: '全域',
        editPresetName: '編輯預設名稱',
        enterNewPresetName: '輸入新的預設名稱',
        deletePreset: '刪除預設',
        deletePresetWarning: '刪除此預設後，預設所屬的裝置均會使用預設預設設定，若您設定的預設與預設預設不同，請三思而後行',
        cannotDeleteDefaultPreset: '無法刪除預設預設',
        targetDevices: '目標裝置',
        targetDevicesDesc: '將使用此預設的裝置列表',
        refreshDeviceList: '重新整理裝置列表',
        globalPresetNote: '這是全域預設（預設套用於所有裝置）',
        currentDevice: '目前裝置',
        copyPresetCopy: '複製預設副本',
        copyPresetCopyDesc: '為目前裝置建立預設的副本',
        copySuffix: '_副本',
        presetCopied: '預設已複製',
        deviceReassigned: '裝置已重新分配到預設',
        dragDeviceHere: '拖動裝置到此處以分配到該預設',
        currentDeviceName: '目前裝置名稱',
        deviceId: '裝置 ID',
        deviceNamePlaceholder: '例如：桌面-Mac、行動-安卓',
        editDeviceName: '編輯裝置名稱',
        moveDeviceToPreset: '移動裝置到預設',
        fontConfiguration: '字型設定',
        currentPresetConfig: '目前預設設定',
        fontNotFound: '字型在可用字型列表中不存在',
        removeDevice: '移除裝置',
        confirmRemoveDevice: '從所有預設中移除裝置"{0}"？此操作無法復原。'
    }
};

/**
 * Get translation for a key
 * @param {string} key - Translation key
 * @param {string|Object} [localeOrParams] - Language code OR params object (auto-detect)
 * @param {Object} [params] - Parameters for string interpolation (when locale is provided)
 * @returns {string} Translated string
 */
function t(key, localeOrParams = null, params = {}) {
    let locale = null;

    // Smart detection: if second arg is an object, treat it as params
    if (localeOrParams && typeof localeOrParams === 'object') {
        params = localeOrParams;
        locale = null;
    } else {
        locale = localeOrParams;
    }

    // Auto-detect locale from Obsidian if not provided
    if (!locale) {
        const fullLocale = window.localStorage.getItem('language') || 'en';

        // Prefer the full locale code (e.g., zh-TW)
        if (TRANSLATIONS[fullLocale]) {
            locale = fullLocale;
        } else {
            // Fall back to the base locale code (e.g., zh)
            locale = fullLocale.split('-')[0];
        }
    }

    // Fallback to English if locale not supported
    const lang = TRANSLATIONS[locale] || TRANSLATIONS.en;
    let text = lang[key] || TRANSLATIONS.en[key] || key;

    // Replace parameters (e.g., {count} -> actual count)
    Object.keys(params).forEach(param => {
        text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
    });

    return text;
}

/**
 * Get current locale
 * @returns {string} Current language code
 */
function getCurrentLocale() {
    return (window.localStorage.getItem('language') || 'en').split('-')[0];
}

/**
 * Check if current locale is a Latin-script language
 * Latin-script users typically don't need Latin font separation
 * @returns {boolean} True if current locale uses Latin script
 */
function isLatinScriptLocale() {
    const locale = getCurrentLocale();
    const latinLocales = ['en', 'es', 'fr', 'de', 'it', 'pt', 'pl', 'nl', 'sv', 'no', 'da', 'fi'];
    return latinLocales.includes(locale);
}

/**
 * Check if current locale is a CJK language
 * @returns {boolean} True if current locale is Chinese, Japanese, or Korean
 */
function isCJKLocale() {
    const locale = getCurrentLocale();
    return ['zh', 'ja', 'ko'].includes(locale);
}

// ============================================================================
// Font Metadata Parser
// ============================================================================

/**
 * Parse font file metadata (read OpenType/TrueType name table)
 * @param {ArrayBuffer} arrayBuffer - Binary data of the font file
 * @returns {Object|null} Font metadata or null if parsing fails
 */
function parseFontMetadata(arrayBuffer) {
    try {
        const dataView = new DataView(arrayBuffer);

        // Read font table directory
        const numTables = dataView.getUint16(4);

        // Find name table
        let nameTableOffset = null;
        for (let i = 0; i < numTables; i++) {
            const tableOffset = 12 + i * 16;
            const tag = String.fromCharCode(
                dataView.getUint8(tableOffset),
                dataView.getUint8(tableOffset + 1),
                dataView.getUint8(tableOffset + 2),
                dataView.getUint8(tableOffset + 3)
            );

            if (tag === 'name') {
                nameTableOffset = dataView.getUint32(tableOffset + 8);
                break;
            }
        }

        if (!nameTableOffset) {
            return null;
        }

        // Parse name table
        const nameTable = {
            format: dataView.getUint16(nameTableOffset),
            count: dataView.getUint16(nameTableOffset + 2),
            stringOffset: dataView.getUint16(nameTableOffset + 4)
        };

        const nameRecords = [];
        for (let i = 0; i < nameTable.count; i++) {
            const recordOffset = nameTableOffset + 6 + i * 12;
            nameRecords.push({
                platformID: dataView.getUint16(recordOffset),
                encodingID: dataView.getUint16(recordOffset + 2),
                languageID: dataView.getUint16(recordOffset + 4),
                nameID: dataView.getUint16(recordOffset + 6),
                length: dataView.getUint16(recordOffset + 8),
                offset: dataView.getUint16(recordOffset + 10)
            });
        }

        // Extract key information
        const metadata = {
            familyName: null,
            subfamilyName: null,
            fullName: null,
            postScriptName: null
        };

        const stringStorageOffset = nameTableOffset + nameTable.stringOffset;

        for (const record of nameRecords) {
            const stringOffset = stringStorageOffset + record.offset;
            let value = '';

            // Prefer Windows platform Unicode encoding
            if (record.platformID === 3 && record.encodingID === 1) {
                for (let j = 0; j < record.length; j += 2) {
                    const charCode = dataView.getUint16(stringOffset + j);
                    if (charCode > 0) {
                        value += String.fromCharCode(charCode);
                    }
                }
            } else if (record.platformID === 1) {
                // Mac platform ASCII encoding
                for (let j = 0; j < record.length; j++) {
                    value += String.fromCharCode(dataView.getUint8(stringOffset + j));
                }
            }

            if (!value) continue;

            // Name ID mapping: 1=Family, 2=Subfamily, 4=Full, 6=PostScript
            switch (record.nameID) {
                case 1:
                    if (!metadata.familyName) metadata.familyName = value;
                    break;
                case 2:
                    if (!metadata.subfamilyName) metadata.subfamilyName = value;
                    break;
                case 4:
                    if (!metadata.fullName) metadata.fullName = value;
                    break;
                case 6:
                    if (!metadata.postScriptName) metadata.postScriptName = value;
                    break;
            }
        }

        // Parse style information (four variants)
        const subfamily = (metadata.subfamilyName || '').toLowerCase();
        const isItalic = subfamily.includes('italic') || subfamily.includes('oblique');
        const isBold = subfamily.includes('bold') || subfamily.includes('heavy') || subfamily.includes('black');

        // Determine variant type: regular, italic, bold, bolditalic
        let variantType = 'regular';
        if (isBold && isItalic) {
            variantType = 'bolditalic';
        } else if (isBold) {
            variantType = 'bold';
        } else if (isItalic) {
            variantType = 'italic';
        }

        // Map CSS font-weight
        let weight = 400;
        if (subfamily.includes('thin') || subfamily.includes('hairline')) {
            weight = 100;
        } else if (subfamily.includes('extralight') || subfamily.includes('ultralight')) {
            weight = 200;
        } else if (subfamily.includes('light')) {
            weight = 300;
        } else if (subfamily.includes('medium')) {
            weight = 500;
        } else if (subfamily.includes('semibold') || subfamily.includes('demibold')) {
            weight = 600;
        } else if (subfamily.includes('bold')) {
            weight = 700;
        } else if (subfamily.includes('extrabold') || subfamily.includes('ultrabold')) {
            weight = 800;
        } else if (subfamily.includes('black') || subfamily.includes('heavy')) {
            weight = 900;
        }

        return {
            familyName: metadata.familyName,
            subfamilyName: metadata.subfamilyName,
            fullName: metadata.fullName,
            postScriptName: metadata.postScriptName,
            variantType,  // 'regular', 'italic', 'bold', 'bolditalic'
            style: {
                isItalic,
                isBold,
                weight,
                cssStyle: isItalic ? 'italic' : 'normal'
            }
        };

    } catch (error) {
        // Standalone function: "this" is not bound here; log directly to console to avoid masking the real parse error
        console.error('[Font Metadata] Parse failed:', error);
        return null;
    }
}

// ============================================================================
// Default Settings
// ============================================================================

const DEFAULT_SETTINGS = {
    fontSourceDir: 'Components/Library/Fonts',
    b64OutputDir: 'Components/Library/Fonts/B64Font',
    availableFonts: [],       // Global font list (shared by all presets)
    fontFamilies: [],         // Global font family grouping info (shared by all presets)
    autoLoadOnStartup: true,

    // Device identification (synced via cloud)
    deviceFingerprints: {},   // Device fingerprint mapping { fingerprint: deviceId }
    deviceNameMap: {},        // Device name mapping { deviceId: deviceName }

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

// ============================================================================
// Main Plugin Class
// ============================================================================

class LocalFontLoaderPlugin extends Plugin {

    // Log level control
    _logEnabled = false; // logging disabled by default

    _log(...args) {
        if (this._logEnabled) {
            console.log(...args);
        }
    }

    _logError(...args) {
        console.error(...args); // error logs are always emitted
    }

    /**
      * Compares two settings objects for full structural equality (JSON-safe).
      * Used to determine whether a data.json change originated from this plugin's own writes.
      * Returns false on serialization failure (conservative: prefer reloading over missing a sync).
     */
    _settingsEqual(a, b) {
        try {
            return JSON.stringify(a) === JSON.stringify(b);
        } catch (error) {
            this._logError('[Local Font Loader] _settingsEqual 比较失败:', error);
            return false;
        }
    }

    // saveSettings debounce optimization
    _saveSettingsTimer = null;
    _debouncedSaveSettings() {
        if (this._saveSettingsTimer) {
            clearTimeout(this._saveSettingsTimer);
        }
        this._saveSettingsTimer = setTimeout(() => {
            this.saveData(this.settings);
            this._saveSettingsTimer = null;
        }, 300); // 300ms debounce delay
    }

    // Generate unicode-range (based on scope configuration)
    getUnicodeRange(scope) {
        const ranges = [];

        if (scope?.letters !== false) {
            // Letters A-Z, a-z
            ranges.push('U+0041-005A', 'U+0061-007A');
        }

        if (scope?.numbers !== false) {
            // Numbers 0-9
            ranges.push('U+0030-0039');
        }

        if (scope?.punctuation !== false) {
            // Common punctuation marks
            ranges.push('U+0020-002F', 'U+003A-0040', 'U+005B-0060', 'U+007B-007E');
        }

        if (scope?.symbols !== false) {
            // Extended Latin characters and special symbols
            ranges.push('U+00A0-00FF');
        }

        return ranges.length > 0 ? ranges.join(', ') : null;
    }

    /**
      * Escapes quotes and backslashes in CSS strings so font family names cannot break @font-face/font-family syntax.
      * @param {string} str The family name
      * @returns {string} The escaped string
     */
    _escapeCssString(str) {
        return String(str)
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/'/g, "\\'");
    }

    async onload() {
        this._log('[Local Font Loader] Plugin loading...');

        // Load settings
        await this.loadSettings();

        // Auto-detect and register device
        // Use a device fingerprint (platform + UA hash) as the unique identifier
        const deviceFingerprint = this._generateDeviceFingerprint();

        // Check if the device already exists
        let existingDeviceId = null;
        if (this.settings.deviceFingerprints && this.settings.deviceFingerprints[deviceFingerprint]) {
            // Device exists, use the existing ID
            existingDeviceId = this.settings.deviceFingerprints[deviceFingerprint];
            this.currentDeviceId = existingDeviceId;

            // Ensure deviceNameMap has a name (may be lost during data cleanup)
            if (!this.settings.deviceNameMap) {
                this.settings.deviceNameMap = {};
            }
            if (!this.settings.deviceNameMap[existingDeviceId]) {
                this.settings.deviceNameMap[existingDeviceId] = this._getDefaultDeviceName();
                await this.saveSettings();
                this._log(`[Local Font Loader] Device name restored: ${existingDeviceId}`);
            }

            this._log(`[Local Font Loader] Device recognized: ${existingDeviceId}`);
        } else {
            // New device, generate a new ID and register it
            const newDeviceId = this._generateUUID();
            const defaultDeviceName = this._getDefaultDeviceName();

            // Initialize data structures
            if (!this.settings.deviceFingerprints) {
                this.settings.deviceFingerprints = {};
            }
            if (!this.settings.deviceNameMap) {
                this.settings.deviceNameMap = {};
            }

            // Record the device fingerprint mapping
            this.settings.deviceFingerprints[deviceFingerprint] = newDeviceId;
            this.settings.deviceNameMap[newDeviceId] = defaultDeviceName;

            this.currentDeviceId = newDeviceId;

            await this.saveSettings();
            this._log(`[Local Font Loader] New device registered: ${newDeviceId} (${defaultDeviceName})`);
        }

        // Ensure the current device has a preset
        await this._ensureDevicePreset();

        // Add Ribbon icon
        this.addRibbonIcon('type', 'Local Font Loader', () => {
            // Open settings panel directly
            this.app.setting.open();
            this.app.setting.openTabById('local-font-loader');
        });

        // Add commands
        this.addCommand({
            id: 'open-settings',
            name: 'Open Settings',
            callback: () => {
                this.app.setting.open();
                this.app.setting.openTabById('local-font-loader');
            }
        });

        this.addCommand({
            id: 'reload-fonts',
            name: 'Reload Fonts',
            callback: async () => {
                await this.applyFonts();
                new Notice('✓ Fonts reloaded');
            }
        });

        this.addCommand({
            id: 'clear-font-cache',
            name: 'Clear Font Cache',
            callback: async () => {
                await this.clearCache();
            }
        });

        this.addCommand({
            id: 'rescan-fonts',
            name: 'Rescan Fonts',
            callback: async () => {
                await this.scanFonts();
                new Notice('✓ Font list updated');
            }
        });

        this.addCommand({
            id: 'convert-all-fonts',
            name: 'Convert all fonts to Base64',
            callback: async () => {
                await this.convertAllFonts();
            }
        });

        // Add Settings Panel
        this.addSettingTab(new FontManagerSettingTab(this.app, this));

        // Listen for data.json changes (for multi-device sync)
        this.registerEvent(
            this.app.vault.on('modify', (file) => {
                // Check if it is this plugin's data.json
                if (file.path === `${this.manifest.dir}/data.json`) {
                    this._log('[Local Font Loader] data.json modified, checking for content changes...');
                    // Delay the reload to avoid frequent triggers
                    if (this._dataReloadTimer) {
                        clearTimeout(this._dataReloadTimer);
                    }
                    this._dataReloadTimer = setTimeout(async () => {
                        try {
                            // A save of our own is in flight: skip reloading to avoid rolling back newer in-memory settings with a stale disk snapshot
                            if (this._isSaving) {
                                this._log('[Local Font Loader] Save in progress, skipping reload');
                                return;
                            }
                            const data = await this.loadData();
                            // Content matches in-memory settings = written by this plugin (or nothing changed),
                            // skip reloading to avoid rebuilding the whole settings UI and losing input focus.
                            if (this._settingsEqual(data, this.settings)) {
                                this._log('[Local Font Loader] data.json content unchanged, skipping reload');
                                return;
                            }
                            // External change (e.g. multi-device sync): reload settings and refresh the UI
                            await this.loadSettings();
                            // Notify the settings panel to refresh
                            this.app.workspace.trigger('local-font-loader:settings-changed');
                            this._log('[Local Font Loader] Settings reloaded from data.json');
                        } catch (error) {
                            this._logError('[Local Font Loader] Failed to reload settings from data.json:', error);
                        }
                    }, 500); // 500ms debounce
                }
            })
        );

        // Scan fonts (if the list is empty)
        if (this.settings.availableFonts.length === 0) {
            await this.scanFonts();
        }

        // Scan font source-file existence once at startup (not persisted; status-only)
        await this._refreshFontExistence();

        // Auto-load fonts on startup
        if (this.settings.autoLoadOnStartup) {
            await this.applyFonts();
        }

        this._log('[Local Font Loader] ✓ Plugin loaded');
    }

    onunload() {
        this._log('[Local Font Loader] Plugin unloading');

        // Clean up the debounce timer
        if (this._saveSettingsTimer) {
            clearTimeout(this._saveSettingsTimer);
            this._saveSettingsTimer = null;
        }

        // Clean up the data reload debounce timer
        if (this._dataReloadTimer) {
            clearTimeout(this._dataReloadTimer);
            this._dataReloadTimer = null;
        }

        this.removeFontStyles();

        // Remove preset styles injected by the settings tab (incl. device SVG icons) to prevent leftovers after unload
        const presetStyle = document.getElementById('local-font-loader-preset-styles');
        if (presetStyle) presetStyle.remove();
    }

    async loadSettings() {
        const data = await this.loadData();

        // Backward compatibility: migrate legacy data
        if (data && !data.presets) {
            // Migrate legacy font config to the default preset (keep user config as global default)
            const defaultPreset = {
                id: 'default-preset',
                name: 'Default',
                targetDevices: [], // empty array means the global default
                fonts: data.fonts || {},
                latinFontEnabled: data.latinFontEnabled || false,
                latinFontScope: data.latinFontScope || {},
                headingApplyToFileTitle: data.headingApplyToFileTitle || false
            };

            data.presets = [defaultPreset];
        }

        // Clean up legacy deviceId and deviceName fields (deprecated)
        if (data && data.deviceId !== undefined) {
            delete data.deviceId;
        }
        if (data && data.deviceName !== undefined) {
            delete data.deviceName;
        }

        // Initialize new device management fields
        if (data && !data.deviceFingerprints) {
            data.deviceFingerprints = {};
        }
        if (data && !data.deviceNameMap) {
            data.deviceNameMap = {};
        }

        // Deep-clone the default base so settings.presets never shares nested references with the module constant when data is null
        this.settings = Object.assign({}, JSON.parse(JSON.stringify(DEFAULT_SETTINGS)), data);
    }

    async saveSettings() {
        this._isSaving = true;
        try {
            await this.saveData(this.settings);
        } finally {
            this._isSaving = false;
        }
    }

    // ============================================================================
    // Preset Management Methods (New)
    // ============================================================================

    /**
     * Get the preset assigned to the current device
     * @returns {Object} The preset object
     */
    _getDevicePreset() {
        const deviceId = this.currentDeviceId;

        // Find the preset containing the current device
        let preset = this.settings.presets.find(p =>
            p.targetDevices.includes(deviceId)
        );

        if (!preset) {
            // If the device has no preset, fall back to the default global preset
            preset = this.settings.presets.find(p => p.id === 'default-preset');
        }

        if (!preset) {
            // Final fallback: return the first preset
            preset = this.settings.presets[0];
        }

        return preset;
    }

    /**
      * Returns the current device preset's font configuration context (unifies the Latin determination source across convert/apply methods).
     * @returns {{fontsConfig:Object, latinFontEnabled:boolean, latinFontScope:Object}}
     */
    _getDeviceFontContext() {
        const devicePreset = this._getDevicePreset();
        return {
            fontsConfig: devicePreset?.fonts || {},
            latinFontEnabled: devicePreset?.latinFontEnabled || false,
            latinFontScope: devicePreset?.latinFontScope || {},
        };
    }

    /**
     * Create a new preset
     * @param {string} name - The preset name
     */
    async createPreset(name) {
        // Get the global preset (default-preset) as a template
        const defaultPreset = this.settings.presets.find(p => p.id === 'default-preset');

        const newPreset = {
            id: this._generateUUID(),
            name: name,
            targetDevices: [], // new presets start empty, awaiting device assignment
            // Clone the global preset's font config
            fonts: defaultPreset ? JSON.parse(JSON.stringify(defaultPreset.fonts)) : { ui: '', text: '', heading: '', monospace: '', math: '', latin: '' },
            latinFontEnabled: defaultPreset ? defaultPreset.latinFontEnabled : false,
            latinFontScope: defaultPreset ? JSON.parse(JSON.stringify(defaultPreset.latinFontScope)) : { letters: true, numbers: true, punctuation: true, symbols: true },
            headingApplyToFileTitle: defaultPreset ? defaultPreset.headingApplyToFileTitle : false
        };

        this.settings.presets.push(newPreset);
        await this.saveSettings();
    }

    /**
     * Rename a preset
     * @param {string} presetId - The preset ID
     * @param {string} newName - The new name
     */
    async renamePreset(presetId, newName) {
        const preset = this.settings.presets.find(p => p.id === presetId);
        if (preset) {
            preset.name = newName;
            await this.saveSettings();
        }
    }

    /**
     * Delete a preset (with a warning modal and protection for the default preset)
     * @param {string} presetId - The preset ID
     */
    async deletePreset(presetId) {
        const t = (key) => this.getTranslation(key);

        // Do not allow deleting the default preset
        if (presetId === 'default-preset') {
            new Notice(t('cannotDeleteDefaultPreset'), 3000);
            return;
        }

        const preset = this.settings.presets.find(p => p.id === presetId);
        if (!preset) return;

        // Confirmation logic removed; handled by the UI layer

        // Delete preset (devices automatically fall back to the global preset via _getDevicePreset())
        this.settings.presets = this.settings.presets.filter(p => p.id !== presetId);
        await this.saveSettings();
    }

    /**
     * Assign a device to the specified preset (supports dragging into the global preset)
     * @param {string} deviceId - The device ID
     * @param {string} targetPresetId - The target preset ID
     */
    async assignDeviceToPreset(deviceId, targetPresetId) {
        // Remove the device from all presets
        this.settings.presets.forEach(preset => {
            preset.targetDevices = preset.targetDevices.filter(id => id !== deviceId);
        });

        // Add to the target preset (unless the target is the global preset)
        const targetPreset = this.settings.presets.find(p => p.id === targetPresetId);

        // Key logic:
        // - If the target preset is the global preset (id === 'default-preset' && targetDevices.length === 0), do not add the device
        // - Otherwise, add the device to the target preset
        if (targetPreset) {
            const isGlobalPreset = targetPreset.id === 'default-preset' && targetPreset.targetDevices.length === 0;
            if (!isGlobalPreset && !targetPreset.targetDevices.includes(deviceId)) {
                targetPreset.targetDevices.push(deviceId);
            }
        }

        await this.saveSettings();
        await this.applyFonts(); // apply the new preset font config immediately
    }

    /**
     * Duplicate a preset for the current device
     * @param {string} sourcePresetId - The source preset ID
     * @param {string} newPresetName - The new preset name (usually "<original name>_Copy")
     */
    async copyPresetForDevice(sourcePresetId, newPresetName) {
        // Clone from the passed-in source preset (not the current device preset)
        const sourcePreset = this.settings.presets.find(p => p.id === sourcePresetId);
        if (!sourcePreset) return;

        // Deep-clone the source preset as the base of the new preset
        const newPreset = {
            ...JSON.parse(JSON.stringify(sourcePreset)), // deep copy
            id: this._generateUUID(),
            name: newPresetName, // use the passed-in name ("<original>_Copy")
            targetDevices: [this.currentDeviceId] // new preset contains only the current device
        };

        // Only remove the current device from the source preset when it is a custom (non-global) preset
        const isGlobalPreset = sourcePreset.id === 'default-preset' && sourcePreset.targetDevices.length === 0;
        if (!isGlobalPreset) {
            sourcePreset.targetDevices = sourcePreset.targetDevices.filter(
                id => id !== this.currentDeviceId
            );
        }

        this.settings.presets.push(newPreset);
        await this.saveSettings();
    }

    /**
     * Generate a UUID
     * @returns {string} The UUID string
     */
    _generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Remove a device from presets (used to clean up ghost devices)
     * @param {string} deviceId - The device ID to remove
     */
    async removeDeviceFromPresets(deviceId) {
        // Remove the device from all presets' targetDevices
        this.settings.presets.forEach(preset => {
            preset.targetDevices = preset.targetDevices.filter(id => id !== deviceId);
        });

        // Remove from the device name map
        if (this.settings.deviceNameMap && this.settings.deviceNameMap[deviceId]) {
            delete this.settings.deviceNameMap[deviceId];
        }

        await this.saveSettings();
    }

    /**
     * Get the display name of a device (for UI rendering)
     * @param {string} deviceId - The device ID
     * @returns {string} - The device name
     */
    _getDeviceName(deviceId) {
        // Look up from the device name map (unified management for all devices)
        if (this.settings.deviceNameMap && this.settings.deviceNameMap[deviceId]) {
            return this.settings.deviceNameMap[deviceId];
        }

        // Fall back to deviceId
        return deviceId;
    }

    /**
     * Get the platform type of a device (reverse lookup via deviceFingerprints)
     * @param {string} deviceId - The device ID
     * @returns {string} - The platform type: 'mobile' or 'desktop', or 'unknown' if not found
     */
    _getDevicePlatform(deviceId) {
        if (!this.settings.deviceFingerprints) {
            return 'unknown';
        }

        // Reverse lookup: find the fingerprint in deviceFingerprints
        for (const [fingerprint, id] of Object.entries(this.settings.deviceFingerprints)) {
            if (id === deviceId) {
                // Fingerprint format: platform-hash (e.g., mobile-abc123 or desktop-xyz789)
                const platform = fingerprint.split('-')[0];
                return platform; // 'mobile' or 'desktop'
            }
        }

        return 'unknown';
    }

    /**
     * Update a device name (supports editing the current or other devices)
     * @param {string} deviceId - The device ID
     * @param {string} newName - The new name
     */
    async updateDeviceName(deviceId, newName) {
        const trimmedName = newName.trim();
        if (!trimmedName) return;

        // Store uniformly in deviceNameMap (will be synced)
        if (!this.settings.deviceNameMap) {
            this.settings.deviceNameMap = {};
        }
        this.settings.deviceNameMap[deviceId] = trimmedName;

        await this.saveSettings();
    }

    /**
     * Get the default device name
     * @returns {string} The default device name
     */
    _getDefaultDeviceName() {
        const platform = Platform.isMobile ? 'Mobile' : 'Desktop';
        const ua = navigator.userAgent;

        let osName = 'Unknown';
        if (ua.includes('Windows')) osName = 'Windows';
        else if (ua.includes('Mac')) osName = 'Mac';
        else if (ua.includes('Linux')) osName = 'Linux';
        else if (ua.includes('Android')) osName = 'Android';
        else if (ua.includes('iOS')) osName = 'iOS';

        return `${platform}-${osName}`;
    }

    /**
     * Generate a device fingerprint (for device identification)
     * Based on platform, UA, screen resolution, timezone, and other factors
     * @returns {string} The device fingerprint
     */
    _generateDeviceFingerprint() {
        const platform = Platform.isMobile ? 'mobile' : 'desktop';
        const ua = navigator.userAgent;

        // Collect multiple device features
        const features = [
            ua,
            `${screen.width}x${screen.height}`,           // screen resolution
            `${screen.availWidth}x${screen.availHeight}`, // available screen size
            new Date().getTimezoneOffset().toString(),    // timezone offset
            navigator.language,                            // language
            navigator.hardwareConcurrency || 'unknown'     // CPU core count
        ];

        // Simple hash function
        const hash = (str) => {
            let h = 0;
            for (let i = 0; i < str.length; i++) {
                h = ((h << 5) - h) + str.charCodeAt(i);
                h = h & h; // convert to a 32-bit integer
            }
            return Math.abs(h).toString(36);
        };

        // Combine all features and hash them
        const fingerprint = hash(features.join('|'));

        // Combine platform and fingerprint
        return `${platform}-${fingerprint}`;
    }

    /**
     * Ensure the device preset exists
     */
    async _ensureDevicePreset() {
        const deviceId = this.currentDeviceId;

        // Check if any preset is bound to the current device
        const devicePreset = this.settings.presets.find(p =>
            p.targetDevices.includes(deviceId)
        );

        if (!devicePreset) {
            // Use the default preset (global preset with empty targetDevices)
            const defaultPreset = this.settings.presets.find(p => p.id === 'default-preset');
            if (!defaultPreset || defaultPreset.targetDevices.length > 0) {
                // If the default preset is missing or not global, create a global default preset
                console.warn('[LocalFontLoader] Default preset missing or corrupted, recreating...');
                const newDefaultPreset = {
                    id: 'default-preset',
                    name: 'Default',
                    targetDevices: [],
                    fonts: this.settings.presets?.[0]?.fonts || DEFAULT_SETTINGS.presets[0].fonts,
                    latinFontEnabled: this.settings.latinFontEnabled || false,
                    latinFontScope: this.settings.latinFontScope || {},
                    headingApplyToFileTitle: this.settings.headingApplyToFileTitle || false
                };
                this.settings.presets.unshift(newDefaultPreset);
                await this.saveSettings();
            }
        }
    }

    // ============================================================================
    // Font Scanning (original methods)
    // ============================================================================

    // Scan the font directory (using the built-in metadata parser)
    /**
     * Import fonts from a file list
     * @param {FileList} files - The list of font files selected by the user
     */
    async importFontsFromFiles(files) {
        this._log(`[Local Font Loader] Starting to import ${files.length} font files...`);
        let imported = 0;

        for (const file of files) {
            try {
                const arrayBuffer = await file.arrayBuffer();

                // Default to the "Imported" folder
                const targetDir = `${this.settings.fontSourceDir}/Imported`;
                const targetPath = `${targetDir}/${file.name}`;

                // Ensure the directory exists
                try {
                    await this.app.vault.adapter.mkdir(targetDir);
                } catch (err) {
                    // Directory may already exist
                }

                await this.app.vault.adapter.writeBinary(targetPath, arrayBuffer);
                imported++;
                this._log(`[Local Font Loader] Imported: ${file.name}`);
            } catch (error) {
                this._logError(`[Local Font Loader] Failed to import ${file.name}:`, error);
            }
        }

        this._log(`[Local Font Loader] Import completed: ${imported}/${files.length} fonts`);
        return imported;
    }

    async scanFonts() {
        const startTime = performance.now();

        // Concurrency lock: prevent multiple simultaneous scans
        if (this._isScanning) {
            this._log('[Local Font Loader] Scan already in progress, ignoring duplicate call');
            return;
        }
        this._isScanning = true;

        try {
            this._log('[Local Font Loader] Scanning font family folders...');

            // Get all subfolders in font directory
            const dirList = await this.app.vault.adapter.list(this.settings.fontSourceDir);
            const fontDirs = dirList.folders.filter(dir => {
                const basename = dir.split('/').pop();
                return basename !== 'B64Font'; // Exclude cache directory
            });

            this._log(`[Local Font Loader] Found ${fontDirs.length} font family folders`);

            // Normalize the path format, match by filename
            let b64Files = [];
            try {
                const b64List = await this.app.vault.adapter.list(this.settings.b64OutputDir);
                b64Files = b64List.files.map(f => {
                    // Extract the basename (without path and extension) for matching
                    const basename = f.split('/').pop().replace('.css', '');
                    return basename;
                });
                this._log(`[Local Font Loader] Found ${b64Files.length} cached fonts`);
            } catch (err) {
                this._log('[Local Font Loader] B64 cache directory does not exist, will be created during conversion');
            }

            // Capture the old list so entries whose source file is missing can be merged back after scanning
            const previousFonts = this.settings.availableFonts;

            // Reset data
            this.settings.availableFonts = [];
            this.settings.fontFamilies = [];

            // Use a Map for deduplication
            const fontMap = new Map(); // key: font.name, value: fontInfo

            // Scan each font family folder
            for (const fontDir of fontDirs) {
                try {
                    const folderName = fontDir.split('/').pop();
                    const metadataPath = `${fontDir}/.fontfamily.json`;

                    // Try to read the metadata file
                    let metadata = null;
                    try {
                        const metadataContent = await this.app.vault.adapter.read(metadataPath);
                        metadata = JSON.parse(metadataContent);
                        this._log(`[Local Font Loader] Reading family metadata: ${metadata.familyName || folderName}`);
                    } catch (err) {
                        this._log(`[Local Font Loader] Metadata file not found: ${metadataPath}, will auto-scan`);
                    }

                    // Prefer the metadata's familyName
                    const family = {
                        familyName: metadata?.familyName || folderName,
                        folderPath: fontDir,
                        hasRegular: false,
                        hasItalic: false,
                        hasBold: false,
                        hasBoldItalic: false
                    };

                    // If metadata exists, load by metadata
                    if (metadata && metadata.variants) {
                        for (const [variantType, filename] of Object.entries(metadata.variants)) {
                            const fontPath = `${fontDir}/${filename}`;

                            try {
                                // Check if file exists (by attempting to read)
                                await this.app.vault.adapter.readBinary(fontPath);

                                const basename = filename;
                                const name = basename.replace(/\.(ttf|otf|woff|woff2)$/i, '');
                                const ext = basename.split('.').pop().toLowerCase();

                                // Match by filename
                                const hasB64 = b64Files.includes(name);
                                const b64Path = hasB64 ? `${this.settings.b64OutputDir}/${name}.css` : null;

                                const fontInfo = {
                                    name,
                                    path: fontPath,
                                    basename,
                                    ext,
                                    familyName: family.familyName, // use the correct family name from the metadata
                                    variantType,
                                    hasB64,
                                    b64Path
                                };

                                // Deduplicate: avoid adding duplicate fonts
                                if (!fontMap.has(name)) {
                                    fontMap.set(name, fontInfo);
                                }

                                // Mark variants owned by family
                                if (variantType === 'regular') family.hasRegular = true;
                                else if (variantType === 'italic') family.hasItalic = true;
                                else if (variantType === 'bold') family.hasBold = true;
                                else if (variantType === 'bolditalic') family.hasBoldItalic = true;

                                this._log(`[Local Font Loader] Identified font: ${family.familyName} (${variantType})`);
                            } catch (err) {
                                this._log(`[Local Font Loader] Font file does not exist: ${fontPath}`);
                            }
                        }
                    } else {
                        // Read font file metadata in parallel
                        const files = await this.app.vault.adapter.list(fontDir);
                        const fontFiles = files.files.filter(f => /\.(ttf|otf|woff|woff2)$/i.test(f));

                        this._log(`[Local Font Loader] Auto-scanning ${fontFiles.length} font files in ${folderName}...`);

                        // Read all font file metadata in parallel
                        const scanPromises = fontFiles.map(async (fontPath) => {
                            try {
                                const basename = fontPath.split('/').pop();
                                const name = basename.replace(/\.(ttf|otf|woff|woff2)$/i, '');
                                const ext = basename.split('.').pop().toLowerCase();

                                // Read font metadata to determine variant type
                                const arrayBuffer = await this.app.vault.adapter.readBinary(fontPath);
                                const fontMetadata = parseFontMetadata(arrayBuffer);

                                // Use the font's internal familyName (if present)
                                const realFamilyName = fontMetadata?.familyName || family.familyName;
                                const variantType = fontMetadata?.variantType || 'regular';

                                // Match by filename
                                const hasB64 = b64Files.includes(name);
                                const b64Path = hasB64 ? `${this.settings.b64OutputDir}/${name}.css` : null;

                                const fontInfo = {
                                    name,
                                    path: fontPath,
                                    basename,
                                    ext,
                                    familyName: realFamilyName, // use the correct family name from the font itself
                                    variantType,
                                    hasB64,
                                    b64Path
                                };

                                this._log(`[Local Font Loader] Auto-detected: ${realFamilyName} (${variantType})`);
                                return { success: true, fontInfo, variantType };
                            } catch (error) {
                                this._logError(`[Local Font Loader] Failed to scan font: ${fontPath}`, error);
                                return { success: false, fontPath, error };
                            }
                        });

                        const scanResults = await Promise.all(scanPromises);

                        // Collect successfully scanned fonts
                        for (const result of scanResults) {
                            if (result.success) {
                                // Deduplicate: avoid adding duplicate fonts
                                if (!fontMap.has(result.fontInfo.name)) {
                                    fontMap.set(result.fontInfo.name, result.fontInfo);
                                }

                                // Mark variants owned by family
                                if (result.variantType === 'regular') family.hasRegular = true;
                                else if (result.variantType === 'italic') family.hasItalic = true;
                                else if (result.variantType === 'bold') family.hasBold = true;
                                else if (result.variantType === 'bolditalic') family.hasBoldItalic = true;
                            }
                        }
                    }

                    // Add family info
                    if (family.hasRegular || family.hasItalic || family.hasBold || family.hasBoldItalic) {
                        this.settings.fontFamilies.push(family);
                    }

                } catch (error) {
                    this._logError(`[Local Font Loader] Failed to process font family: ${fontDir}`, error);
                }
            }

            // Merge back old entries whose source file is missing (exists is runtime state; strip it when re-adding)
            for (const prevFont of previousFonts) {
                if (fontMap.has(prevFont.name)) continue;
                let stillExists = false;
                if (prevFont.path) {
                    try { stillExists = await this.app.vault.adapter.exists(prevFont.path); } catch (e) { stillExists = false; }
                }
                if (!stillExists) {
                    const { exists, ...cleanFont } = prevFont;
                    fontMap.set(prevFont.name, cleanFont);
                }
            }

            // Convert the Map to an array
            this.settings.availableFonts = Array.from(fontMap.values());

            await this.saveSettings();

            // Rebuild the runtime existence cache after scanning (status is memory-only; never written to data.json)
            await this._refreshFontExistence();

            const endTime = performance.now();
            this._log(`[Local Font Loader] Scan completed: ${this.settings.fontFamilies.length} font families, ${this.settings.availableFonts.length} variants, took ${(endTime - startTime).toFixed(2)}ms`);

        } catch (error) {
            const endTime = performance.now();
            this._logError(`[Local Font Loader] 扫描失败，耗时 ${(endTime - startTime).toFixed(2)}ms:`, error);
            // Keep existing data to avoid UI issues from clearing
            await this.saveSettings();
        } finally {
            // Release the lock
            this._isScanning = false;
        }
    }

    /**
     * Check whether a font exists in the vault
     * @param {string} fontName - The font name or family name
     * @returns {boolean} Whether the font exists
     */
    isFontAvailable(fontName) {
        // Special options (use-text-font, use-ui-font) and empty strings are always valid
        if (!fontName || fontName === 'use-text-font' || fontName === 'use-ui-font') {
            return true;
        }
        // Check if availableFonts contains a matching family name or filename
        return this.settings.availableFonts.some(f =>
            (f.familyName || f.name) === fontName
        );
    }

    // Runtime cache of font source-file existence (memory only, not persisted; name -> boolean)
    _fontExistsMap = {};

    /**
      * Checks at startup / after scanning whether each availableFonts entry's source file exists, writing results to the runtime cache.
      * Results are not persisted; they live only in memory for the current session.
     */
    async _refreshFontExistence() {
        const fonts = this.settings.availableFonts || [];
        const map = {};
        await Promise.all(fonts.map(async (font) => {
            let exists = false;
            if (font.path) {
                try {
                    exists = await this.app.vault.adapter.exists(font.path);
                } catch (error) {
                    this._logError(`[Local Font Loader] 检查字体存在性失败: ${font.path}`, error);
                    exists = false;
                }
            }
            map[font.name] = exists;
        }));
        this._fontExistsMap = map;
    }

    /**
      * Reads a font's runtime existence status (defaults to "exists" for conservative display before refresh).
      * @param {Object} font The font object
      * @returns {boolean} Whether the source file exists
     */
    _getFontExists(font) {
        return this._fontExistsMap[font.name] !== false;
    }

    // Apply fonts config (load from cache only)
    async applyFonts() {
        const startTime = performance.now();
        try {
            this._log('[Local Font Loader] Starting to apply fonts...');

            // Get the preset of the current device (new)
            const devicePreset = this._getDevicePreset();

            if (!devicePreset) {
                console.warn('[LocalFontLoader] No preset found for current device, using default preset');
                return;
            }

            // Use the font config from the device's preset (new)
            const fontsConfig = devicePreset.fonts || {};
            const latinFontEnabled = devicePreset.latinFontEnabled || false;
            const latinFontScope = devicePreset.latinFontScope || {};
            const headingApplyToFileTitle = devicePreset.headingApplyToFileTitle || false;

            const usedFonts = new Set();
            const usedFamilies = new Set(); // font family name (supports multiple variants)
            const missingFonts = []; // record missing fonts

            // Iterate over all configured fonts and check existence
            for (const fontName of Object.values(fontsConfig)) {
                if (fontName) {
                    // Check if the font exists in the vault
                    if (!this.isFontAvailable(fontName)) {
                        missingFonts.push(fontName);
                        this._log(`[Local Font Loader] ⚠️ Font "${fontName}" not found in vault, will fallback to system default`);
                        continue; // skip missing fonts and fall back to the system default
                    }

                    usedFonts.add(fontName);
                    // Find the corresponding font family
                    const fonts = this.settings.availableFonts.filter(f =>
                        f.name === fontName || f.familyName === fontName
                    );
                    if (fonts.length > 0) {
                        const familyName = fonts[0].familyName || fontName;
                        usedFamilies.add(familyName);
                    }
                }
            }

            // Show a missing-font notice (5s)
            if (missingFonts.length > 0) {
                new Notice(t('fontMissingWarning'), 5000);
            }

            if (usedFonts.size === 0) {
                this._log('[Local Font Loader] No fonts configured');
                this.removeFontStyles();
                return;
            }

            this._log('[Local Font Loader] Fonts to load:', Array.from(usedFonts));
            this._log('[Local Font Loader] Font families involved:', Array.from(usedFamilies));

            // Initialize @font-face CSS
            let fontFaceCss = '/* Local Font Loader - Font Faces */\n\n';
            let loadedCount = 0;
            let failedFonts = [];

            // Collect fonts to load
            // Strategy: Load all variants by font family (support Regular, Italic, Bold, BoldItalic)
            for (const familyOrFontName of usedFamilies) {
                try {
                    // Find all font files of this family
                    const familyFonts = this.settings.availableFonts.filter(f =>
                        (f.familyName && f.familyName === familyOrFontName) ||
                        f.name === familyOrFontName
                    );

                    if (familyFonts.length === 0) {
                        this._log(`[Local Font Loader] Font family not found: ${familyOrFontName}`);
                        failedFonts.push(`${familyOrFontName} (未找到)`);
                        continue;
                    }

                    this._log(`[Local Font Loader] Loading font family: ${familyOrFontName}, contains ${familyFonts.length} variants`);

                    // Read all variants in parallel to improve loading performance
                    const readPromises = familyFonts
                        .filter(font => font.hasB64 && font.b64Path)
                        .map(async (font) => {
                            try {
                                const b64Css = await this.app.vault.adapter.read(font.b64Path);
                                this._log(`[Local Font Loader] ✓ Loaded variant: ${font.name} (${font.subfamilyName || 'Unknown'}, ${(b64Css.length / 1024).toFixed(2)} KB)`);
                                return { success: true, css: b64Css, font };
                            } catch (error) {
                                this._logError(`[Local Font Loader] ✗ 读取失败: ${font.name}`, error);
                                return { success: false, font, error };
                            }
                        });

                    const results = await Promise.all(readPromises);

                    // Collect successfully loaded CSS
                    for (const result of results) {
                        if (result.success) {
                            let css = result.css;

                            // If Latin font separation is enabled and the current font is Latin, add unicode-range
                            const isLatinFont = latinFontEnabled && fontsConfig.latin &&
                                (familyOrFontName === fontsConfig.latin || result.font.name === fontsConfig.latin);

                            if (isLatinFont) {
                                // Add unicode-range for the Latin font
                                const unicodeRange = this.getUnicodeRange(latinFontScope);
                                if (unicodeRange) {
                                    // Insert unicode-range after font-display and before }
                                    css = css.replace(
                                        /font-display:\s*swap;/g,
                                        `font-display: swap;\n  unicode-range: ${unicodeRange};`
                                    );
                                    this._log(`[Local Font Loader] Added unicode-range to Latin font: ${result.font.name}`);
                                }
                            }

                            fontFaceCss += css + '\n';
                            loadedCount++;
                        } else {
                            failedFonts.push(`${result.font.name} (读取失败: ${result.error.message})`);
                        }
                    }

                    // Handle uncached fonts
                    const uncachedFonts = familyFonts.filter(f => !f.hasB64 || !f.b64Path);
                    for (const font of uncachedFonts) {
                        this._log(`[Local Font Loader] Font not cached, please convert first: ${font.name}`);
                        failedFonts.push(`${font.name} (not converted)`);
                    }

                } catch (error) {
                    this._logError(`[Local Font Loader] ✗ 无法加载字体家族 ${familyOrFontName}:`, error);
                    failedFonts.push(`${familyOrFontName} (读取失败: ${error.message})`);
                }
            }

            this._log(`[Local Font Loader] @font-face CSS total size: ${(fontFaceCss.length / 1024 / 1024).toFixed(2)} MB`);

            // Apply @font-face CSS
            this.applyCss(fontFaceCss, 'local-font-loader-faces');

            // Apply CSS variables
            let varsCss = '/* Local Font Loader - Variables */\n\n';

            // Base CSS variables
            varsCss += ':root {\n';

            const cssVarsMap = {
                ui: ['--font-interface', '--font-interface-override'],
                text: [
                    '--font-text',
                    '--font-text-override',
                    '--font-default',
                    '--default-font',
                    '--font-family-editor',
                    '--font-text-theme',
                    '--font-editor'
                ],
                monospace: [
                    '--font-monospace',
                    '--font-monospace-override',
                    '--font-monospace-default',
                    '--font-monospace-theme',
                    '--font-code'
                ]
            };

            for (const [key, cssVars] of Object.entries(cssVarsMap)) {
                if (fontsConfig[key]) {
                    const fontFamily = fontsConfig[key];
                    for (const cssVar of cssVars) {
                        // If Latin font separation is enabled, body text font needs special handling
                        if (key === 'text' && latinFontEnabled && fontsConfig.latin) {
                            varsCss += `  ${cssVar}: "${this._escapeCssString(fontsConfig.latin)}", "${this._escapeCssString(fontFamily)}", sans-serif !important;\n`;
                        } else if (key === 'ui' && latinFontEnabled && fontsConfig.latin && this.settings.latinFontForUI) {
                            // If Latin font for UI is enabled, the UI font also uses Latin font separation
                            varsCss += `  ${cssVar}: "${this._escapeCssString(fontsConfig.latin)}", "${this._escapeCssString(fontFamily)}", sans-serif !important;\n`;
                        } else {
                            // Choose an appropriate fallback based on the font type
                            const fallback = (key === 'monospace') ? 'monospace' : 'sans-serif';
                            varsCss += `  ${cssVar}: "${this._escapeCssString(fontFamily)}", ${fallback} !important;\n`;
                        }
                    }
                }
            }

            varsCss += '}\n\n';

            // If Latin font for UI is enabled, add direct UI element overrides
            if (fontsConfig.ui && latinFontEnabled && fontsConfig.latin && this.settings.latinFontForUI) {
                varsCss += `/* UI Elements - Latin Font Separation (High Priority) */\n`;
                const uiFontFamily = `"${this._escapeCssString(fontsConfig.latin)}", "${this._escapeCssString(fontsConfig.ui)}"`;

                // Use higher-specificity selectors to force overrides
                varsCss += `.app-container body,\n`;
                varsCss += `body.app-container,\n`;
                varsCss += `.app-container,\n`;
                varsCss += `body .workspace,\n`;
                varsCss += `body .workspace-leaf-content,\n`;
                varsCss += `body .workspace-tab-header,\n`;
                varsCss += `body .workspace-tab-header-container,\n`;
                varsCss += `body .nav-file-title,\n`;
                varsCss += `body .nav-folder-title,\n`;
                varsCss += `body .tree-item-inner,\n`;
                varsCss += `body .menu,\n`;
                varsCss += `body .menu-item,\n`;
                varsCss += `body .modal,\n`;
                varsCss += `body .modal-content,\n`;
                varsCss += `body .setting-item,\n`;
                varsCss += `body .setting-item-name,\n`;
                varsCss += `body .setting-item-description,\n`;
                varsCss += `body .sidebar,\n`;
                varsCss += `body .sidebar-content {\n`;
                varsCss += `  font-family: ${uiFontFamily}, sans-serif !important;\n`;
                varsCss += `}\n\n`;

                // Additional mobile overrides
                varsCss += `/* Mobile UI Elements - Extra Override */\n`;
                varsCss += `body.is-mobile .workspace,\n`;
                varsCss += `body.is-mobile .workspace-leaf-content,\n`;
                varsCss += `body.is-mobile .workspace-tab-header,\n`;
                varsCss += `body.is-mobile .nav-file-title,\n`;
                varsCss += `body.is-mobile .nav-folder-title,\n`;
                varsCss += `body.is-mobile .tree-item-inner,\n`;
                varsCss += `body.is-mobile .menu,\n`;
                varsCss += `body.is-mobile .menu-item,\n`;
                varsCss += `body.is-mobile .modal,\n`;
                varsCss += `body.is-mobile .setting-item {\n`;
                varsCss += `  font-family: ${uiFontFamily}, sans-serif !important;\n`;
                varsCss += `}\n\n`;

                this._log(`[Local Font Loader] Latin font also applied to UI elements (desktop + mobile)`);
            } else if (fontsConfig.ui) {
                // Only set the UI font, do not enable Latin font separation
                varsCss += `/* UI Elements (High Priority) */\n`;
                varsCss += `.app-container body,\n`;
                varsCss += `body.app-container,\n`;
                varsCss += `.app-container,\n`;
                varsCss += `body .workspace,\n`;
                varsCss += `body .workspace-leaf-content,\n`;
                varsCss += `body .workspace-tab-header,\n`;
                varsCss += `body .workspace-tab-header-container,\n`;
                varsCss += `body .nav-file-title,\n`;
                varsCss += `body .nav-folder-title,\n`;
                varsCss += `body .tree-item-inner,\n`;
                varsCss += `body .menu,\n`;
                varsCss += `body .menu-item,\n`;
                varsCss += `body .modal,\n`;
                varsCss += `body .modal-content,\n`;
                varsCss += `body .setting-item,\n`;
                varsCss += `body .setting-item-name,\n`;
                varsCss += `body .setting-item-description,\n`;
                varsCss += `body .sidebar,\n`;
                varsCss += `body .sidebar-content {\n`;
                varsCss += `  font-family: "${this._escapeCssString(fontsConfig.ui)}", sans-serif !important;\n`;
                varsCss += `}\n\n`;

                // Additional mobile overrides
                varsCss += `/* Mobile UI Elements - Extra Override */\n`;
                varsCss += `body.is-mobile .workspace,\n`;
                varsCss += `body.is-mobile .workspace-leaf-content,\n`;
                varsCss += `body.is-mobile .workspace-tab-header,\n`;
                varsCss += `body.is-mobile .nav-file-title,\n`;
                varsCss += `body.is-mobile .nav-folder-title,\n`;
                varsCss += `body.is-mobile .tree-item-inner,\n`;
                varsCss += `body.is-mobile .menu,\n`;
                varsCss += `body.is-mobile .menu-item,\n`;
                varsCss += `body.is-mobile .modal,\n`;
                varsCss += `body.is-mobile .setting-item {\n`;
                varsCss += `  font-family: "${this._escapeCssString(fontsConfig.ui)}", sans-serif !important;\n`;
                varsCss += `}\n\n`;
            }

            // Universal for mobile and desktop: apply directly to elements
            if (fontsConfig.text) {
                varsCss += `/* Body Text Font */\n`;

                // Build the font-family value
                let textFontFamily = `"${this._escapeCssString(fontsConfig.text)}"`;
                if (latinFontEnabled && fontsConfig.latin) {
                    // Latin font first (due to unicode-range restriction), non-Latin font as fallback
                    textFontFamily = `"${this._escapeCssString(fontsConfig.latin)}", "${this._escapeCssString(fontsConfig.text)}"`;
                    this._log(`[Local Font Loader] Enable Latin font separation: ${fontsConfig.latin} (Latin) + ${fontsConfig.text} (Non-Latin)`);
                    if (this.settings.latinFontForUI) {
                        this._log(`[Local Font Loader] Latin font also applied to UI elements`);
                    }
                }

                // Reading mode
                varsCss += `.markdown-preview-view,\n`;
                // Editing mode
                varsCss += `.markdown-source-view,\n`;
                varsCss += `.cm-s-obsidian,\n`;
                varsCss += `.cm-s-obsidian .cm-line,\n`;
                varsCss += `.markdown-source-view.mod-cm6 .cm-content {\n`;
                varsCss += `  font-family: ${textFontFamily} !important;\n`;
                varsCss += `}\n\n`;
            }

            if (fontsConfig.monospace) {
                varsCss += `/* Code Block Font (High Priority) */\n`;
                const monospaceFontFamily = `"${this._escapeCssString(fontsConfig.monospace)}"`;

                // Code block selectors shared by desktop and mobile
                varsCss += `/* Inline code */\n`;
                varsCss += `body code,\n`;
                varsCss += `body .cm-inline-code,\n`;
                varsCss += `body .markdown-preview-view code {\n`;
                varsCss += `  font-family: ${monospaceFontFamily}, monospace !important;\n`;
                varsCss += `}\n\n`;

                varsCss += `/* Code blocks */\n`;
                varsCss += `body pre,\n`;
                varsCss += `body pre code,\n`;
                varsCss += `body .markdown-preview-view pre,\n`;
                varsCss += `body .markdown-preview-view pre code,\n`;
                varsCss += `body .HyperMD-codeblock,\n`;
                varsCss += `body .cm-s-obsidian pre.HyperMD-codeblock,\n`;
                varsCss += `body .markdown-source-view.mod-cm6 .HyperMD-codeblock,\n`;
                varsCss += `body .markdown-source-view.mod-cm6 .cm-line.HyperMD-codeblock {\n`;
                varsCss += `  font-family: ${monospaceFontFamily}, monospace !important;\n`;
                varsCss += `}\n\n`;

                // Mobile-specific selectors
                varsCss += `/* Mobile code blocks */\n`;
                varsCss += `body.is-mobile code,\n`;
                varsCss += `body.is-mobile pre,\n`;
                varsCss += `body.is-mobile pre code,\n`;
                varsCss += `body.is-mobile .markdown-preview-view code,\n`;
                varsCss += `body.is-mobile .markdown-preview-view pre,\n`;
                varsCss += `body.is-mobile .markdown-source-view code,\n`;
                varsCss += `body.is-mobile .HyperMD-codeblock {\n`;
                varsCss += `  font-family: ${monospaceFontFamily}, monospace !important;\n`;
                varsCss += `}\n\n`;

                this._log(`[Local Font Loader] Code block font applied with high priority selectors`);
            }

            // Heading font
            if (fontsConfig.heading) {
                varsCss += `/* Heading Font */\n`;

                // Parse heading font settings
                let headingFontFamily = '';
                const headingValue = fontsConfig.heading;

                if (headingValue === 'use-text-font') {
                    // Use the text font
                    if (fontsConfig.text) {
                        headingFontFamily = fontsConfig.text;
                        if (latinFontEnabled && fontsConfig.latin) {
                            headingFontFamily = `"${this._escapeCssString(fontsConfig.latin)}", "${this._escapeCssString(fontsConfig.text)}"`;
                        } else {
                            headingFontFamily = `"${this._escapeCssString(headingFontFamily)}"`;
                        }
                    }
                } else if (headingValue === 'use-ui-font') {
                    // Use the UI font
                    if (fontsConfig.ui) {
                        headingFontFamily = `"${this._escapeCssString(fontsConfig.ui)}"`;
                    }
                } else if (headingValue) {
                    // Use a custom font
                    headingFontFamily = `"${this._escapeCssString(headingValue)}"`;
                }

                if (headingFontFamily) {
                    // Apply to headings h1-h6 (reading and editing modes)
                    varsCss += `.markdown-preview-view h1, .markdown-preview-view h2,\n`;
                    varsCss += `.markdown-preview-view h3, .markdown-preview-view h4,\n`;
                    varsCss += `.markdown-preview-view h5, .markdown-preview-view h6,\n`;
                    varsCss += `.cm-header-1, .cm-header-2, .cm-header-3,\n`;
                    varsCss += `.cm-header-4, .cm-header-5, .cm-header-6`;

                    // If the file title option is enabled, add .inline-title
                    if (headingApplyToFileTitle) {
                        varsCss += `,\n.inline-title`;
                    }

                    varsCss += ` {\n  font-family: ${headingFontFamily} !important;\n}\n\n`;
                    this._log(`[Local Font Loader] Apply heading font: ${headingFontFamily}${headingApplyToFileTitle ? ' (including file title)' : ''}`);
                }
            }

            // Math fonts (map MathJax Unicode classes to correct characters)
            if (fontsConfig.math) {
                varsCss += `/* LaTeX Math Font (High Priority) - Fixes MathJax CHTML content */\n`;

                // Performance: pre-build all math glyph CSS rules to avoid runtime loops
                const mathItalicUpperStart = 0x1D434; // A-Z
                const mathItalicLowerStart = 0x1D44E; // a-z

                for (let i = 0; i < 26; i++) {
                    const upperCode = mathItalicUpperStart + i;
                    const lowerCode = mathItalicLowerStart + i;
                    varsCss += `body .mjx-c${upperCode.toString(16).toUpperCase()}.TEX-I::before { content: "${String.fromCodePoint(upperCode)}" !important; }\n`;
                    varsCss += `body .mjx-c${lowerCode.toString(16).toUpperCase()}.TEX-I::before { content: "${String.fromCodePoint(lowerCode)}" !important; }\n`;
                }

                varsCss += `\n/* Apply fonts */\n`;
                varsCss += `/* Italic variables */\n`;
                varsCss += `body mjx-c.TEX-I::before {\n`;
                varsCss += `  font-family: '${this._escapeCssString(fontsConfig.math)}', MJXTEX-I, MJXZERO, serif !important;\n`;
                varsCss += `  font-style: normal !important;\n`;
                varsCss += `}\n\n`;
                varsCss += `/* Numbers and operators */\n`;
                varsCss += `body mjx-mn mjx-c::before,\n`;
                varsCss += `body mjx-mo mjx-c::before,\n`;
                varsCss += `body mjx-c:not(.TEX-I)::before {\n`;
                varsCss += `  font-family: '${this._escapeCssString(fontsConfig.math)}', MJXZERO, MJXTEX, serif !important;\n`;
                varsCss += `}\n\n`;
                varsCss += `/* Container */\n`;
                varsCss += `body mjx-container,\n`;
                varsCss += `body.is-mobile mjx-container {\n`;
                varsCss += `  font-family: '${this._escapeCssString(fontsConfig.math)}', MJXZERO, MJXTEX, serif !important;\n`;
                varsCss += `}\n\n`;

                this._log(`[Local Font Loader] Math font applied with high priority selectors`);
            }

            this.applyCss(varsCss, 'local-font-loader-vars');

            const endTime = performance.now();
            this._log(`[Local Font Loader] ✓ Fonts applied successfully. Loaded ${loadedCount} variants, failed ${failedFonts.length}. Time: ${(endTime - startTime).toFixed(2)}ms`);

            if (failedFonts.length > 0) {
                this._log(`[Local Font Loader] Failed fonts:`, failedFonts);
            }

        } catch (error) {
            const endTime = performance.now();
            this._logError(`[Local Font Loader] Apply fonts失败，耗时 ${(endTime - startTime).toFixed(2)}ms:`, error);
        }
    }

    // Convert all fonts to Base64
    async convertAllFonts() {
        this._log('[Local Font Loader] Starting font conversion...');
        let converted = 0;
        let skipped = 0;

        try {
            for (const font of this.settings.availableFonts) {
                // Skip already cached fonts
                if (font.hasB64) {
                    skipped++;
                    continue;
                }

                try {
                    const variantLabel = font.variantType || 'unknown';
                    this._log(`[Local Font Loader] Converting font: ${font.name} (${font.familyName || 'Unknown'} - ${variantLabel})`);

                    const arrayBuffer = await this.app.vault.adapter.readBinary(font.path);
                    const base64 = this.arrayBufferToBase64(arrayBuffer);

                    // Build the @font-face CSS (config-driven unicode-range determination and family-name escaping)
                    const { css: singleFontCss, fontFamily, variantType, fontWeight, fontStyle } =
                        this._buildFontFaceCss(font, base64, this._getDeviceFontContext());

                    // Save to cache
                    const cachePath = `${this.settings.b64OutputDir}/${font.name}.css`;
                    await this.app.vault.adapter.write(cachePath, singleFontCss);

                    // Update font status
                    font.hasB64 = true;
                    font.b64Path = cachePath;

                    converted++;
                    this._log(`[Local Font Loader] ✓ Converted: ${font.name} (${fontFamily} - ${variantType}, weight: ${fontWeight}, style: ${fontStyle})`);

                } catch (error) {
                    this._logError(`[Local Font Loader] Conversion failed: ${font.name}`, error);
                }
            }

            await this.saveSettings();

            this._log(`[Local Font Loader] Conversion complete：${converted} newly converted，${skipped} already cached`);

        } catch (error) {
            this._logError('[Local Font Loader] 批量Conversion failed:', error);
        }
    }

    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        const chunkSize = 8192; // 8KB chunked processing
        let binary = "";

        for (let i = 0; i < bytes.byteLength; i += chunkSize) {
            const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.byteLength));
            binary += String.fromCharCode.apply(null, chunk);
        }

        return btoa(binary);
    }

    /**
      * Builds a single font's @font-face CSS (config-driven unicode-range determination and family-name escaping).
      * Shared by convertAllFonts / convertSingleFont so Latin determination and escaping stay consistent.
      * @param {Object} font   The font object
      * @param {string} base64 The base64 data
      * @param {Object} ctx    Context from _getDeviceFontContext()
     * @returns {{css:string, fontFamily:string, variantType:string, fontWeight:number, fontStyle:string}}
     */
    _buildFontFaceCss(font, base64, ctx) {
        const { fontsConfig, latinFontEnabled, latinFontScope } = ctx;
        const formatMap = {
            'ttf': 'font/truetype',
            'otf': 'font/opentype',
            'woff': 'font/woff',
            'woff2': 'font/woff2'
        };
        const mimeType = formatMap[font.ext] || 'font/truetype';

        const fontFamily = font.familyName || font.name;
        const variantType = font.variantType || 'regular';

        // Config-driven: whether this font is the Latin font configured in the preset
        const isLatinFont = latinFontEnabled && fontsConfig.latin &&
            (fontFamily === fontsConfig.latin || font.name === fontsConfig.latin);
        const needsUnicodeRange = isLatinFont;

        // Set CSS properties based on the variant type
        let fontWeight = 400;
        let fontStyle = 'normal';

        switch (variantType) {
            case 'italic':
                fontStyle = 'italic';
                break;
            case 'bold':
                fontWeight = 700;
                break;
            case 'bolditalic':
                fontWeight = 700;
                fontStyle = 'italic';
                break;
        }

        // Build the @font-face declaration
        let css = `/* ${this._escapeCssString(fontFamily)} - ${variantType} */\n`;
        css += `@font-face {\n`;
        css += `  font-family: '${this._escapeCssString(fontFamily)}';\n`;
        css += `  src: url(data:${mimeType};base64,${base64});\n`;
        css += `  font-style: ${fontStyle};\n`;
        css += `  font-weight: ${fontWeight};\n`;
        css += `  font-display: swap;\n`;

        if (needsUnicodeRange) {
            // Build unicode-range from the preset's latinFontScope (deprecated top-level field)
            const unicodeRange = this.getUnicodeRange(latinFontScope);
            if (unicodeRange) {
                css += `  unicode-range: ${unicodeRange};\n`;
            }
        }

        css += `}\n`;

        return { css, fontFamily, variantType, fontWeight, fontStyle };
    }

    applyCss(css, cssId) {
        const existingStyle = document.getElementById(cssId);

        // Skip the update if the content is identical
        if (existingStyle && existingStyle.textContent === css) {
            return;
        }

        if (existingStyle) {
            existingStyle.remove();
        }

        if (css) {
            const style = document.createElement('style');
            style.id = cssId;
            style.textContent = css;  // use textContent instead of innerHTML
            document.head.appendChild(style);
        }
    }

    removeFontStyles() {
        const faceStyle = document.getElementById('local-font-loader-faces');
        const varsStyle = document.getElementById('local-font-loader-vars');
        if (faceStyle) faceStyle.remove();
        if (varsStyle) varsStyle.remove();
    }

    async clearCache() {
        try {
            const files = await this.app.vault.adapter.list(this.settings.b64OutputDir);
            let count = 0;

            for (const file of files.files) {
                if (file.endsWith('.css')) {
                    await this.app.vault.adapter.remove(file);
                    count++;
                }
            }

            // Update font list status
            for (const font of this.settings.availableFonts) {
                font.hasB64 = false;
                font.b64Path = null;
            }
            await this.saveSettings();

            this._log(`[Local Font Loader] Cleaned ${count} cache files`);

        } catch (error) {
            this._logError('[Local Font Loader] Clear Cache失败:', error);
        }
    }
}

// ============================================================================
// ==== Settings Panel ====
// ============================================================================

// ============================================================================
// ==== Modal Components (replacing native prompt/confirm) ====
// ============================================================================

/**
 * Text input modal (replaces prompt)
 * Uses the Obsidian native Modal API to avoid window focus loss from the browser-native prompt
 * @class TextInputModal
 * @extends {Modal}
 */
class TextInputModal extends Modal {
    constructor(app, title, placeholder, defaultValue, onSubmit) {
        super(app);
        this.titleText = title;
        this.placeholder = placeholder;
        this.defaultValue = defaultValue || '';
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl, titleEl } = this;

        titleEl.setText(this.titleText);

        // Create the input (using native createEl)
        const inputEl = contentEl.createEl('input', {
            type: 'text',
            value: this.defaultValue,
            placeholder: this.placeholder,
            attr: {
                'aria-label': this.titleText
            }
        });

        // Style setup (using Obsidian CSS variables)
        inputEl.style.width = '100%';
        inputEl.style.marginBottom = '16px';
        inputEl.style.padding = '8px';
        inputEl.style.fontSize = '14px';
        inputEl.style.border = '1px solid var(--background-modifier-border)';
        inputEl.style.borderRadius = '4px';
        inputEl.style.backgroundColor = 'var(--background-primary)';
        inputEl.style.color = 'var(--text-normal)';

        // Create the button container
        const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' });
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'flex-end';
        buttonContainer.style.gap = '8px';
        buttonContainer.style.marginTop = '16px';

        // Cancel button
        const cancelBtn = buttonContainer.createEl('button', { text: t('cancel') });
        cancelBtn.addEventListener('click', () => this.close());

        // Confirm button (primary action)
        const submitBtn = buttonContainer.createEl('button', {
            text: t('confirm'),
            cls: 'mod-cta'
        });
        submitBtn.addEventListener('click', () => {
            const value = inputEl.value.trim();
            if (value) {
                this.onSubmit(value);
                this.close();
            } else {
                // Highlight the input border when empty
                inputEl.style.borderColor = 'var(--text-error)';
                inputEl.focus();
            }
        });

        // Enter to submit, ESC to cancel
        inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                submitBtn.click();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.close();
            }
        });

        // Remove the error style on input
        inputEl.addEventListener('input', () => {
            inputEl.style.borderColor = 'var(--background-modifier-border)';
        });

        // Auto-focus and select the text (for quick edits)
        setTimeout(() => {
            inputEl.focus();
            inputEl.select();
        }, 10);
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

/**
 * Drag-and-drop import modal (avoids the user-activation issue of the file chooser)
 */
class FontImportModal extends Modal {
    constructor(app, plugin, onImport) {
        super(app);
        this.plugin = plugin;
        this.onImport = onImport;
    }

    onOpen() {
        const { contentEl, titleEl } = this;

        titleEl.setText(t('importFont'));

        // Drop zone
        const dropZone = contentEl.createDiv({
            cls: 'font-import-dropzone',
            attr: {
                style: `
                    border: 2px dashed var(--interactive-accent);
                    border-radius: 8px;
                    padding: 60px 40px;
                    text-align: center;
                    background: var(--background-secondary);
                    cursor: pointer;
                    transition: background 0.2s ease;
                `
            }
        });

        const iconContainer = dropZone.createDiv({
            cls: 'font-import-icon',
            attr: {
                style: `
                    margin-bottom: 16px;
                    color: var(--interactive-accent);
                `
            }
        });
        setIcon(iconContainer, 'folder');
        // Set the icon size
        const iconSvg = iconContainer.querySelector('svg');
        if (iconSvg) {
            iconSvg.setAttribute('width', '48');
            iconSvg.setAttribute('height', '48');
            iconSvg.style.display = 'block';
            iconSvg.style.margin = '0 auto';
        }

        const title = dropZone.createDiv({
            attr: {
                style: `
                    font-size: 16px;
                    font-weight: 500;
                    margin-bottom: 8px;
                    color: var(--text-normal);
                `
            },
            text: '拖拽字体文件到此处'
        });

        const subtitle = dropZone.createDiv({
            attr: {
                style: `
                    font-size: 14px;
                    color: var(--text-muted);
                    margin-bottom: 16px;
                `
            },
            text: '或点击选择文件'
        });

        const hint = dropZone.createDiv({
            attr: {
                style: `
                    font-size: 12px;
                    color: var(--text-faint);
                `
            },
            text: '支持 .ttf, .otf, .woff, .woff2 格式'
        });

        // Create a hidden input (inside the Modal)
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = '.ttf,.otf,.woff,.woff2';
        input.style.display = 'none';
        contentEl.appendChild(input);

        // Click the zone to trigger file selection
        dropZone.onclick = () => {
            input.click();
        };

        // File selection handler
        input.onchange = async () => {
            const files = input.files;
            if (!files || files.length === 0) return;

            this.close();
            await this.onImport(files);
        };

        // Drag-and-drop handlers
        dropZone.ondragover = (e) => {
            e.preventDefault();
            dropZone.style.background = 'var(--background-modifier-hover)';
        };

        dropZone.ondragleave = () => {
            dropZone.style.background = 'var(--background-secondary)';
        };

        dropZone.ondrop = async (e) => {
            e.preventDefault();
            dropZone.style.background = 'var(--background-secondary)';

            const files = e.dataTransfer.files;
            if (!files || files.length === 0) return;

            this.close();
            await this.onImport(files);
        };
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

/**
 * Confirmation dialog helper (replaces confirm)
 * @param {App} app - The Obsidian App instance
 * @param {string} title - The dialog title
 * @param {string} message - The confirmation message
 * @param {Function} onConfirm - The confirmation callback
 * @param {boolean} isDangerous - Whether this is a dangerous operation (applies warning styling)
 */
function showConfirmDialog(app, title, message, onConfirm, isDangerous = false) {
    const modal = new ConfirmationModal(app);
    modal.setTitle(title);

    // Create the message content
    modal.contentEl.createEl('p', {
        text: message,
        attr: { style: 'margin-bottom: 16px;' }
    });

    // Add the confirm button
    modal.addButton((btn) => {
        btn.setButtonText(t('confirm'));
        btn.setCta();
        if (isDangerous) {
            btn.buttonEl.addClass('mod-warning'); // dangerous operation, applies warning styling
        }
        btn.onClick(() => {
            onConfirm();
        });
    });

    // Add the cancel button
    modal.addCancelButton(t('cancel'));

    modal.open();
}

// ============================================================================

// New optimized settings UI
// This section replaces the FontManagerSettingTab class (lines 852-1494)

class FontManagerSettingTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
        this._eventListeners = [];
        this._displayDebounceTimer = null;
        this._displayDebounceDelay = 300; // 300ms debounce delay

        this._isVisible = false; // Whether the settings tab is visible (guard for settings-changed re-rendering)

        // Listen for settings-changed (fired by the data.json listener).
        // Registered once; lifecycle is owned by plugin.registerEvent (auto-unbound on unload),
        // no longer unregistered in hide() so syncing keeps working after the settings tab is closed.
        this._settingsChangedHandler = () => {
            if (!this._isVisible) return; // Skip redundant re-rendering while hidden
            this._debouncedDisplay();
        };
        this.plugin.registerEvent(
            this.plugin.app.workspace.on('local-font-loader:settings-changed', this._settingsChangedHandler)
        );
    }

    _addEventListener(element, event, handler, options) {
        element.addEventListener(event, handler, options);
        this._eventListeners.push({ element, event, handler, options });
    }

    _cleanupEventListeners() {
        this._eventListeners.forEach(({ element, event, handler, options }) => {
            element.removeEventListener(event, handler, options);
        });
        this._eventListeners = [];
    }

    /**
     * Debounced version of display()
     * Only executes the last call when invoked multiple times within a short period
     */
    _debouncedDisplay() {
        if (this._displayDebounceTimer) {
            clearTimeout(this._displayDebounceTimer);
        }
        this._displayDebounceTimer = setTimeout(() => {
            this.display();
            this._displayDebounceTimer = null;
        }, this._displayDebounceDelay);
    }

    /**
     * Determine whether a font is a Latin font (heuristic check on the font name)
     * @param {string} fontName - The font family name
     * @returns {boolean} Whether it is a Latin font
     */
    _isLatinFont(fontName) {
        const lowerName = fontName.toLowerCase();

        // Explicit non-Latin font keywords
        const nonLatinKeywords = [
            // Chinese
            '思源', 'noto sans cjk', 'noto serif cjk', 'source han', '微软雅黑', 'microsoft yahei',
            '宋体', 'simsun', '黑体', 'simhei', '楷体', 'kaiti', '方正', 'fangzheng',
            // Japanese
            '源', 'genkai', 'meiryo', 'yu gothic', 'hiragino', 'msmincho', 'msgothic',
            // Korean
            'nanum', 'malgun', 'batang', 'dotum', 'gulim',
            // Arabic
            'arabic', 'nastaliq', 'kufi',
            // Others
            'devanagari', 'thai', 'hebrew'
        ];

        // If contains non-Latin keywords, not a Latin font
        if (nonLatinKeywords.some(keyword => lowerName.includes(keyword))) {
            return false;
        }

        // Explicit Latin font keywords
        const latinKeywords = [
            'times', 'arial', 'helvetica', 'georgia', 'verdana', 'courier',
            'garamond', 'palatino', 'century', 'cambria', 'calibri',
            'latin', 'roman', 'serif', 'sans'
        ];

        // If contains Latin keywords, is a Latin font
        if (latinKeywords.some(keyword => lowerName.includes(keyword))) {
            return true;
        }

        // Default case: assume Latin font (conservative strategy)
        return true;
    }

    display() {
        this._isVisible = true; // Mark the settings tab visible (settings-changed guard)
        this._cleanupEventListeners();

        const { containerEl } = this;

        // Save the scroll position
        const scrollParent = containerEl.closest('.vertical-tab-content');
        const savedScrollTop = scrollParent ? scrollParent.scrollTop : 0;

        containerEl.empty();

        containerEl.createEl('h2', { text: t('pluginName') });

        // ========================================
        // Override System Settings Info
        // ========================================
        const overrideInfoCallout = containerEl.createDiv({ cls: 'callout', attr: { 'data-callout': 'info' } });
        const overrideInfoTitle = overrideInfoCallout.createDiv({ cls: 'callout-title' });
        const overrideInfoIcon = overrideInfoTitle.createDiv({ cls: 'callout-icon' });
        setIcon(overrideInfoIcon, 'info');
        overrideInfoTitle.createDiv({ cls: 'callout-title-inner', text: t('overrideSystemSettingsTitle') });
        const overrideInfoContent = overrideInfoCallout.createDiv({ cls: 'callout-content' });
        overrideInfoContent.createEl('p', { text: t('overrideSystemSettingsContent') });

        // ========================================
        // Performance Warning Callout
        // ========================================
        const warningCallout = containerEl.createDiv({ cls: 'callout', attr: { 'data-callout': 'warning' } });
        const warningTitle = warningCallout.createDiv({ cls: 'callout-title' });
        const warningIcon = warningTitle.createDiv({ cls: 'callout-icon' });
        setIcon(warningIcon, 'alert-triangle');
        warningTitle.createDiv({ cls: 'callout-title-inner', text: t('performanceWarningTitle') });
        const warningContent = warningCallout.createDiv({ cls: 'callout-content' });
        warningContent.createEl('p', { text: t('performanceWarningContent') });

        // ========================================
        // Inject Preset Management CSS Styles
        // ========================================
        const existingStyle = document.getElementById('local-font-loader-preset-styles');
        if (!existingStyle) {
            const style = document.createElement('style');
            style.id = 'local-font-loader-preset-styles';
            style.textContent = `
/* Preset drag-and-drop management area */
.setting-item-heading-with-button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
}

.setting-item-heading-with-button h4 {
    margin: 0;
    flex: 1;
    display: inline-block;
}

.setting-item-heading-with-button .clickable-icon {
    padding: 4px;
    opacity: 0.7;
    transition: opacity 0.2s ease;
    flex-shrink: 0;
}

.setting-item-heading-with-button .clickable-icon:hover {
    opacity: 1;
}

.preset-drag-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 16px 0;
}

.preset-section {
    padding: 12px;
    border-radius: 8px;
    background: var(--background-secondary);
    border: 1px solid var(--background-modifier-border);
}

.preset-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.preset-header h5 {
    margin: 0;
    font-size: 1em;
    color: var(--text-normal);
}

.preset-actions {
    display: flex;
    gap: 8px;
}

.devices-container {
    min-height: 60px;
    padding: 8px;
    border-radius: 6px;
    border: 2px dashed var(--background-modifier-border);
    background: var(--background-primary);
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    transition: border-color 0.2s ease, background-color 0.2s ease;
}

.devices-container.drag-over {
    border-color: var(--interactive-accent);
    background: var(--background-modifier-hover);
}

.global-preset-zone {
    border-color: var(--text-accent);
    border-style: solid;
}

.device-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 6px;
    background: var(--background-secondary);
    border: 1px solid var(--background-modifier-border);
    cursor: move;
    user-select: none;
    font-size: 0.9em;
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.device-item.dragging {
    opacity: 0.5;
}

.device-item.current-device {
    background: var(--interactive-accent);
    color: var(--text-on-accent);
    font-weight: 500;
}

.device-remove-btn {
    margin-left: 4px;
    padding: 2px;
    opacity: 0.6;
    transition: opacity 0.2s ease;
}

.device-remove-btn:hover {
    opacity: 1;
    color: var(--text-error);
}

.device-move-btn {
    margin-left: 4px;
    padding: 4px;
    color: var(--text-normal);
    opacity: 0.8;
    transition: opacity 0.2s ease;
}

.device-move-btn:hover {
    opacity: 1;
    color: var(--interactive-accent);
}

.font-missing-icon {
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
}

/* Mobile adaptation */
@media (max-width: 768px) {
    .preset-drag-container {
        gap: 12px;
    }

    .device-item {
        font-size: 0.85em;
        padding: 5px 10px;
    }
}

/* Operating system icons */
.device-os-icon {
    display: inline-block;
    width: 16px;
    height: 16px;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    flex-shrink: 0;
}

/* Windows icon (FontAwesome brands) */
.device-os-icon.os-windows {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'%3E%3Cpath fill='%23ffffff' d='M0 93.7l183.6-25.3v177.4H0V93.7zm0 324.6l183.6 25.3V268.4H0v149.9zm203.8 28L448 480V268.4H203.8v177.9zm0-380.6v180.1H448V32L203.8 65.7z'/%3E%3C/svg%3E");
}

/* macOS icon (FontAwesome brands) */
.device-os-icon.os-macos {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 384 512'%3E%3Cpath fill='%23ffffff' d='M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z'/%3E%3C/svg%3E");
}

/* Linux icon (FontAwesome brands) */
.device-os-icon.os-linux {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'%3E%3Cpath fill='%23ffffff' d='M220.8 123.3c1 .5 1.8 1.7 3 1.7 1.1 0 2.8-.4 2.9-1.5.2-1.4-1.9-2.3-3.2-2.9-1.7-.7-3.9-1-5.5-.1-.4.2-.8.7-.6 1.1.3 1.3 2.3 1.1 3.4 1.7zm-21.9 1.7c1.2 0 2-1.2 3-1.7 1.1-.6 3.1-.4 3.5-1.6.2-.4-.2-.9-.6-1.1-1.6-.9-3.8-.6-5.5.1-1.3.6-3.4 1.5-3.2 2.9.1 1 1.8 1.5 2.8 1.4zM420 403.8c-3.6-4-5.3-11.6-7.2-19.7-1.8-8.1-3.9-16.8-10.5-22.4-1.3-1.1-2.6-2.1-4-2.9-1.3-.8-2.7-1.5-4.1-2 9.2-27.3 5.6-54.5-3.7-79.1-11.4-30.1-31.3-56.4-46.5-74.4-17.1-21.5-33.7-41.9-33.4-72C311.1 85.4 315.7.1 234.8 0 132.4-.2 158 103.4 156.9 135.2c-1.7 23.4-6.4 41.8-22.5 64.7-18.9 22.5-45.5 58.8-58.1 96.7-6 17.9-8.8 36.1-6.2 53.3-6.5 5.8-11.4 14.7-16.6 20.2-4.2 4.3-10.3 5.9-17 8.3s-14 6-18.5 14.5c-2.1 3.9-2.8 8.1-2.8 12.4 0 3.9.6 7.9 1.2 11.8 1.2 8.1 2.5 15.7.8 20.8-5.2 14.4-5.9 24.4-2.2 31.7 3.8 7.3 11.4 10.5 20.1 12.3 17.3 3.6 40.8 2.7 59.3 12.5 19.8 10.4 39.9 14.1 55.9 10.4 11.6-2.6 21.1-9.6 25.9-20.2 12.5-.1 26.3-5.4 48.3-6.6 14.9-1.2 33.6 5.3 55.1 4.1.6 2.3 1.4 4.6 2.5 6.7v.1c8.3 16.7 23.8 24.3 40.3 23 16.6-1.3 34.1-11 48.3-27.9 13.6-16.4 36-23.2 50.9-32.2 7.4-4.5 13.4-10.1 13.9-18.3.4-8.2-4.4-17.3-15.5-29.7zM223.7 87.3c9.8-22.2 34.2-21.8 44-.4 6.5 14.2 3.6 30.9-4.3 40.4-1.6-.8-5.9-2.6-12.6-4.9 1.1-1.2 3.1-2.7 3.9-4.6 4.8-11.8-.2-27-9.1-27.3-7.3-.5-13.9 10.8-11.8 23-4.1-2-9.4-3.5-13-4.4-1-6.9-.3-14.6 2.9-21.8zM183 75.8c10.1 0 20.8 14.2 19.1 33.5-3.5 1-7.1 2.5-10.2 4.6 1.2-8.9-3.3-20.1-9.6-19.6-8.4.7-9.8 21.2-1.8 28.1 1 .8 1.9-.2-5.9 5.5-15.6-14.6-10.5-52.1 8.4-52.1zm-13.6 60.7c6.2-4.6 13.6-10 14.1-10.5 4.7-4.4 13.5-14.2 27.9-14.2 7.1 0 15.6 2.3 25.9 8.9 6.3 4.1 11.3 4.4 22.6 9.3 8.4 3.5 13.7 9.7 10.5 18.2-2.6 7.1-11 14.4-22.7 18.1-11.1 3.6-19.8 16-38.2 14.9-3.9-.2-7-1-9.6-2.1-8-3.5-12.2-10.4-20-15-8.6-4.8-13.2-10.4-14.7-15.3-1.4-4.9 0-9 4.2-12.3zm3.3 334c-2.7 35.1-43.9 34.4-75.3 18-29.9-15.8-68.6-6.5-76.5-21.9-2.4-4.7-2.4-12.7 2.6-26.4v-.2c2.4-7.6.6-16-.6-23.9-1.2-7.8-1.8-15 .9-20 3.5-6.7 8.5-9.1 14.8-11.3 10.3-3.7 11.8-3.4 19.6-9.9 5.5-5.7 9.5-12.9 14.3-18 5.1-5.5 10-8.1 17.7-6.9 8.1 1.2 15.1 6.8 21.9 16l19.6 35.6c9.5 19.9 43.1 48.4 41 68.9zm-1.4-25.9c-4.1-6.6-9.6-13.6-14.4-19.6 7.1 0 14.2-2.2 16.7-8.9 2.3-6.2 0-14.9-7.4-24.9-13.5-18.2-38.3-32.5-38.3-32.5-13.5-8.4-21.1-18.7-24.6-29.9s-3-23.3-.3-35.2c5.2-22.9 18.6-45.2 27.2-59.2 2.3-1.7.8 3.2-8.7 20.8-8.5 16.1-24.4 53.3-2.6 82.4.6-20.7 5.5-41.8 13.8-61.5 12-27.4 37.3-74.9 39.3-112.7 1.1.8 4.6 3.2 6.2 4.1 4.6 2.7 8.1 6.7 12.6 10.3 12.4 10 28.5 9.2 42.4 1.2 6.2-3.5 11.2-7.5 15.9-9 9.9-3.1 17.8-8.6 22.3-15 7.7 30.4 25.7 74.3 37.2 95.7 6.1 11.4 18.3 35.5 23.6 64.6 3.3-.1 7 .4 10.9 1.4 13.8-35.7-11.7-74.2-23.3-84.9-4.7-4.6-4.9-6.6-2.6-6.5 12.6 11.2 29.2 33.7 35.2 59 2.8 11.6 3.3 23.7.4 35.7 16.4 6.8 35.9 17.9 30.7 34.8-2.2-.1-3.2 0-4.2 0 3.2-10.1-3.9-17.6-22.8-26.1-19.6-8.6-36-8.6-38.3 12.5-12.1 4.2-18.3 14.7-21.4 27.3-2.8 11.2-3.6 24.7-4.4 39.9-.5 7.7-3.6 18-6.8 29-32.1 22.9-76.7 32.9-114.3 7.2zm257.4-11.5c-.9 16.8-41.2 19.9-63.2 46.5-13.2 15.7-29.4 24.4-43.6 25.5s-26.5-4.8-33.7-19.3c-4.7-11.1-2.4-23.1 1.1-36.3 3.7-14.2 9.2-28.8 9.9-40.6.8-15.2 1.7-28.5 4.2-38.7 2.6-10.3 6.6-17.2 13.7-21.1.3-.2.7-.3 1-.5.8 13.2 7.3 26.6 18.8 29.5 12.6 3.3 30.7-7.5 38.4-16.3 9-.3 15.7-.9 22.6 5.1 9.9 8.5 7.1 30.3 17.1 41.6 10.6 11.6 14.9 19.5 13.7 24.6zM173.3 148.7c2 1.9 4.7 4.5 8 7.1 6.6 5.2 15.8 10.6 27.3 10.6 11.6 0 22.5-5.9 31.8-10.8 4.9-2.6 10.9-7 14.8-10.4s5.9-6.3 3.1-6.6-2.6 2.6-6 5.1c-4.4 3.2-9.7 7.4-13.9 9.8-7.4 4.2-19.5 10.2-29.9 10.2s-18.7-4.8-24.9-9.7c-3.1-2.5-5.7-5-7.7-6.9-1.5-1.4-1.9-4.6-4.3-4.9-1.4-.1-1.8 3.7 1.7 6.5z'/%3E%3C/svg%3E");
}

/* Android icon (FontAwesome brands) */
.device-os-icon.os-android {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 576 512'%3E%3Cpath fill='%23ffffff' d='M420.55 301.93a24 24 0 1 1 24-24 24 24 0 0 1-24 24m-265.1 0a24 24 0 1 1 24-24 24 24 0 0 1-24 24m273.7-144.48 47.94-83a10 10 0 1 0-17.27-10h0l-48.54 84.07a301.25 301.25 0 0 0-246.56 0L116.18 64.45a10 10 0 1 0-17.27 10h0l47.94 83C64.53 202.22 8.24 285.55 0 384H576c-8.24-98.45-64.54-181.78-146.85-226.55'/%3E%3C/svg%3E");
}

/* iOS icon (FontAwesome brands) */
.device-os-icon.os-ios {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 384 512'%3E%3Cpath fill='%23ffffff' d='M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z'/%3E%3C/svg%3E");
}

/* Default icon (generic device) */
.device-os-icon.os-default {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 512'%3E%3Cpath fill='%23ffffff' d='M384 96V320H64L64 96H384zM64 32C28.7 32 0 60.7 0 96V320c0 35.3 28.7 64 64 64H181.3l-10.7 32H96c-17.7 0-32 14.3-32 32s14.3 32 32 32H352c17.7 0 32-14.3 32-32s-14.3-32-32-32H277.3l-10.7-32H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm464 0c-26.5 0-48 21.5-48 48V432c0 26.5 21.5 48 48 48h64c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48H528zm16 64h32c8.8 0 16 7.2 16 16s-7.2 16-16 16H544c-8.8 0-16-7.2-16-16s7.2-16 16-16zm-16 80c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16s-7.2 16-16 16H544c-8.8 0-16-7.2-16-16zm32 224a32 32 0 1 1 0 64 32 32 0 1 1 0-64z'/%3E%3C/svg%3E");
}
            `;
            document.head.appendChild(style);
        }

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
                this._newPresetNameInput = text;
            })
            .addButton(btn => {
                btn.setIcon('plus');
                btn.setTooltip(t('addPreset'));
                btn.onClick(async () => {
                    const presetName = this._newPresetNameInput.getValue().trim();
                    if (!presetName) {
                        new Notice(t('presetNameRequired'), 3000);
                        return;
                    }

                    const exists = this.plugin.settings.presets.some(p => p.name === presetName);
                    if (exists) {
                        new Notice(t('presetNameExists'), 3000);
                        return;
                    }

                    await this.plugin.createPreset(presetName);
                    new Notice(`✓ ${t('presetCreated')}: ${presetName}`, 2000);
                    this.display();
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
        this._addEventListener(refreshBtn, 'click', async () => {
            // Reload settings (read from the file)
            await this.plugin.loadSettings();
            // Re-render the entire settings page
            this.display();
        });

        const dragContainer = containerEl.createDiv({ cls: 'preset-drag-container' });

        this.plugin.settings.presets.forEach(preset => {
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
            this._addEventListener(editBtn, 'click', async () => {
                new TextInputModal(
                    this.plugin.app,
                    t('editPresetName'),
                    t('presetNamePlaceholder'),
                    preset.name,
                    async (newName) => {
                        if (newName !== preset.name) {
                            await this.plugin.renamePreset(preset.id, newName);
                            this.display();
                        }
                    }
                ).open();
            });

            // Copy preset button
            const copyBtn = presetActions.createEl('button', { cls: 'clickable-icon' });
            copyBtn.setAttribute('aria-label', t('copyPresetCopy'));
            setIcon(copyBtn, 'copy');
            this._addEventListener(copyBtn, 'click', async () => {
                const copyName = `${preset.name}${t('copySuffix')}`;
                await this.plugin.copyPresetForDevice(preset.id, copyName);
                new Notice(`✓ ${t('presetCopied')}: ${copyName}`, 2000);
                this.display();
            });

            if (preset.id !== 'default-preset') {
                const deleteBtn = presetActions.createEl('button', { cls: 'clickable-icon' });
                deleteBtn.setAttribute('aria-label', t('deletePreset'));
                setIcon(deleteBtn, 'trash');
                this._addEventListener(deleteBtn, 'click', async () => {
                    showConfirmDialog(
                        this.plugin.app,
                        t('deletePreset'),
                        t('deletePresetWarning'),
                        async () => {
                            await this.plugin.deletePreset(preset.id);
                            // If the deleted preset is the one being edited, fall back to the current device preset (or global preset) so display() does not return early
                            if (this._activePresetId === preset.id) {
                                const fallbackPreset = this.plugin._getDevicePreset();
                                this._activePresetId = fallbackPreset ? fallbackPreset.id : 'default-preset';
                            }
                            this.display();
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

            this._addEventListener(devicesContainer, 'dragover', (e) => {
                e.preventDefault();
                devicesContainer.classList.add('drag-over');
            });

            this._addEventListener(devicesContainer, 'dragleave', () => {
                devicesContainer.classList.remove('drag-over');
            });

            this._addEventListener(devicesContainer, 'drop', async (e) => {
                e.preventDefault();
                devicesContainer.classList.remove('drag-over');

                const deviceId = e.dataTransfer.getData('text/plain');
                const targetPresetId = devicesContainer.dataset.presetId;

                await this.plugin.assignDeviceToPreset(deviceId, targetPresetId);
                this.display();
            });

            // Get the device list to display
            let devicesToShow = [];
            if (preset.id === 'default-preset' && preset.targetDevices.length === 0) {
                // Default global preset: show all unassigned devices
                const allDeviceIds = new Set();

                // Collect all known devices (from deviceNameMap)
                if (this.plugin.settings.deviceNameMap) {
                    Object.keys(this.plugin.settings.deviceNameMap).forEach(id => {
                        allDeviceIds.add(id);
                    });
                }

                // Find unassigned devices (not in any custom preset's targetDevices)
                const assignedDevices = new Set();
                this.plugin.settings.presets.forEach(p => {
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
                    const deviceName = this.plugin._getDeviceName(deviceId);
                    const isCurrent = deviceId === this.plugin.currentDeviceId;
                    const devicePlatform = this.plugin._getDevicePlatform(deviceId);

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

                    // Detect the operating system
                    let osClass = 'os-default'; // default icon
                    const deviceNameLower = deviceName.toLowerCase();

                    if (isCurrent) {
                        // Current device: detect precisely from navigator.userAgent
                        const ua = navigator.userAgent;
                        if (Platform.isMobile) {
                            if (ua.includes('Android')) {
                                osClass = 'os-android';
                            } else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) {
                                osClass = 'os-ios';
                            } else {
                                osClass = 'os-default';
                            }
                        } else {
                            if (ua.includes('Windows')) {
                                osClass = 'os-windows';
                            } else if (ua.includes('Mac')) {
                                osClass = 'os-macos';
                            } else if (ua.includes('Linux')) {
                                osClass = 'os-linux';
                            }
                        }
                    } else {
                        // Other devices: infer from platform info and device name
                        if (devicePlatform === 'mobile') {
                            // Mobile device: infer the specific OS from the name
                            if (deviceNameLower.includes('android')) {
                                osClass = 'os-android';
                            } else if (deviceNameLower.includes('ios') || deviceNameLower.includes('iphone') || deviceNameLower.includes('ipad')) {
                                osClass = 'os-ios';
                            } else {
                                // Mobile device with unknown OS, default to Android (more common)
                                osClass = 'os-android';
                            }
                        } else if (devicePlatform === 'desktop') {
                            // Desktop device: infer the specific OS from the name
                            if (deviceNameLower.includes('windows')) {
                                osClass = 'os-windows';
                            } else if (deviceNameLower.includes('mac')) {
                                osClass = 'os-macos';
                            } else if (deviceNameLower.includes('linux')) {
                                osClass = 'os-linux';
                            } else {
                                // Desktop device with unknown OS, use a generic desktop icon
                                osClass = 'os-default';
                            }
                        }
                    }

                    osIcon.addClass(osClass);

                    // Device name
                    deviceInfoContainer.createSpan({
                        text: isCurrent ? `${deviceName} (${t('currentDevice')})` : deviceName,
                        cls: 'device-name'
                    });

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
                    this._addEventListener(editBtn, 'click', async (e) => {
                        e.stopPropagation();

                        new TextInputModal(
                            this.plugin.app,
                            t('editDeviceName'),
                            t('deviceNamePlaceholder'),
                            deviceName,
                            async (newName) => {
                                if (newName !== deviceName) {
                                    await this.plugin.updateDeviceName(deviceId, newName);
                                    this.display();
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
                        this._addEventListener(removeBtn, 'click', async (e) => {
                            e.stopPropagation();

                            showConfirmDialog(
                                this.plugin.app,
                                t('removeDevice'),
                                t('confirmRemoveDevice').replace('{0}', deviceName),
                                async () => {
                                    await this.plugin.removeDeviceFromPresets(deviceId);
                                    this.display();
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
                        this._addEventListener(moveBtn, 'click', async (e) => {
                            e.stopPropagation();

                            const selectEl = document.createElement('select');
                            selectEl.style.cssText = 'position: absolute; opacity: 0; pointer-events: none;';

                            this.plugin.settings.presets.forEach(p => {
                                const option = selectEl.appendChild(document.createElement('option'));
                                option.value = p.id;
                                option.text = (p.id === 'default-preset' && p.targetDevices.length === 0)
                                    ? `${p.name} (${t('global')})`
                                    : p.name;
                            });

                            const currentPreset = this.plugin.settings.presets.find(p =>
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
                                await this.plugin.assignDeviceToPreset(deviceId, targetPresetId);
                                new Notice(`✓ ${t('deviceReassigned')}`, 2000);
                                this.display();
                                selectEl.remove();
                            });

                            selectEl.addEventListener('blur', () => {
                                selectEl.remove();
                            });
                        });
                    }

                    deviceItem.draggable = true;
                    this._addEventListener(deviceItem, 'dragstart', (e) => {
                        e.dataTransfer.setData('text/plain', deviceId);
                        deviceItem.classList.add('dragging');
                    });

                    this._addEventListener(deviceItem, 'dragend', () => {
                        deviceItem.classList.remove('dragging');
                    });
                });
            }
        });

        // ========================================
        // Device Preset Assignment
        // ========================================
        containerEl.createEl('h4', { text: t('devicePresetManagement'), cls: 'setting-item-heading' });

        const devicePreset = this.plugin._getDevicePreset();

        new Setting(containerEl)
            .setName(t('currentDevicePreset'))
            .setDesc(t('currentDevicePresetDesc'))
            .addDropdown(dropdown => {
                this.plugin.settings.presets.forEach(preset => {
                    const label = (preset.id === 'default-preset' && preset.targetDevices.length === 0)
                        ? `${preset.name} (${t('global')})`
                        : preset.name;
                    dropdown.addOption(preset.id, label);
                });

                dropdown.setValue(devicePreset ? devicePreset.id : 'default-preset');

                dropdown.onChange(async (newPresetId) => {
                    await this.plugin.assignDeviceToPreset(this.plugin.currentDeviceId, newPresetId);
                    new Notice(`✓ ${t('deviceReassigned')}`, 2000);
                    this.display();
                });
            })
            .addButton(btn => {
                btn.setIcon('refresh-cw');
                btn.setTooltip(t('refreshDeviceList'));
                btn.onClick(() => this.display());
            });

        new Setting(containerEl)
            .setName(t('copyPresetCopy'))
            .setDesc(t('copyPresetCopyDesc'))
            .addButton(btn => {
                btn.setButtonText(t('copyPresetCopy'));
                btn.onClick(async () => {
                    const devicePreset = this.plugin._getDevicePreset();
                    const copyName = `${devicePreset.name}${t('copySuffix')}`;
                    await this.plugin.copyPresetForDevice(devicePreset.id, copyName);
                    new Notice(`✓ ${t('presetCopied')}: ${copyName}`, 2000);
                    this.display();
                });
            });

        // ========================================
        // Directory Configuration
        // ========================================
        containerEl.createEl('h3', { text: t('headerDirectoryConfig') });

        new Setting(containerEl)
            .setName(t('fontSourceDir'))
            .setDesc(t('fontSourceDirDesc'))
            .addText(text => text
                .setPlaceholder('Components/Library/Fonts')
                .setValue(this.plugin.settings.fontSourceDir)
                .onChange(async (value) => {
                    this.plugin.settings.fontSourceDir = value;
                    await this.plugin.saveSettings();
                })
            )
            .addButton(btn => btn
                .setButtonText(t('scanFonts'))
                .onClick(async () => {
                    await this.plugin.scanFonts();
                    new Notice('✓ Font list updated');
                    this.display();
                })
            );

        new Setting(containerEl)
            .setName(t('cacheDir'))
            .setDesc(t('cacheDirDesc'))
            .addText(text => text
                .setPlaceholder('Components/Library/Fonts/B64Font')
                .setValue(this.plugin.settings.b64OutputDir)
                .onChange(async (value) => {
                    this.plugin.settings.b64OutputDir = value;
                    await this.plugin.saveSettings();
                })
            );

        // Startup settings
        new Setting(containerEl)
            .setName(t('autoLoad'))
            .setDesc(t('autoLoadDesc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.autoLoadOnStartup)
                .onChange(async (value) => {
                    this.plugin.settings.autoLoadOnStartup = value;
                    await this.plugin.saveSettings();
                })
            );

        // ========================================
        // Font Application Settings
        // ========================================
        containerEl.createEl('h3', { text: t('headerFontApplication') });

        // Preset selector (select the preset to configure)
        const currentDevicePreset = this.plugin._getDevicePreset();

        // If _activePresetId is not explicitly set, default to the current device's preset
        if (!this._activePresetId) {
            this._activePresetId = currentDevicePreset ? currentDevicePreset.id : 'default-preset';
        }

        new Setting(containerEl)
            .setName(t('selectPresetToEdit'))
            .setDesc(t('selectPresetToEditDesc'))
            .addDropdown(dropdown => {
                // Populate all presets as options
                this.plugin.settings.presets.forEach(preset => {
                    const label = (preset.id === 'default-preset' && preset.targetDevices.length === 0)
                        ? `${preset.name} (${t('global')})`
                        : preset.name;
                    dropdown.addOption(preset.id, label);
                });

                // Set the currently edited preset
                dropdown.setValue(this._activePresetId);

                // Switch the currently edited preset
                dropdown.onChange(async (newPresetId) => {
                    this._activePresetId = newPresetId;
                    this.display(); // refresh the UI to show the selected preset font config
                });
            });

        // Show info about the currently edited preset
        const activePreset = this.plugin.settings.presets.find(p => p.id === this._activePresetId);
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
        const activePresetForFonts = this.plugin.settings.presets.find(p => p.id === this._activePresetId);
        if (!activePresetForFonts) {
            console.error('[LocalFontLoader] Active preset not found:', this._activePresetId);
            return;
        }
        const activePresetFonts = activePresetForFonts.fonts || {};

        for (const fontType of fontTypes) {
            const settingItem = new Setting(containerEl)
                .setName(fontType.name)
                .setDesc(fontType.desc);

            // Check if the font referenced by the current preset exists
            // Reuse isFontAvailable: exempts empty strings and the use-text-font / use-ui-font sentinel values
            const selectedFont = activePresetFonts[fontType.key];
            const fontExists = this.plugin.isFontAvailable(selectedFont);

            // If the font does not exist, add a warning icon after the name
            if (selectedFont && !fontExists) {
                const warningIcon = settingItem.nameEl.createSpan({ cls: 'font-missing-icon' });
                setIcon(warningIcon, 'x');
                warningIcon.style.color = 'var(--text-error)';
                warningIcon.style.marginLeft = '8px';
                warningIcon.setAttribute('aria-label', t('fontNotFound'));
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
                    const uniqueFamilies = new Set();
                    this.plugin.settings.availableFonts.forEach(font => {
                        const familyName = font.familyName || font.name;
                        uniqueFamilies.add(familyName);
                    });

                    // Add an option for each family (showing variant info)
                    Array.from(uniqueFamilies).sort().forEach(familyName => {
                        const familyFonts = this.plugin.settings.availableFonts.filter(f =>
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
                        await this.plugin.saveSettings();

                        // If the edited preset is the current device's preset, apply fonts immediately
                        const currentDevicePreset = this.plugin._getDevicePreset();
                        if (currentDevicePreset && currentDevicePreset.id === activePresetForFonts.id) {
                            await this.plugin.applyFonts();
                        }

                        // Refresh the UI to show the variant warning
                        // Use requestAnimationFrame so DOM ops run in the next frame, avoiding double renders
                        requestAnimationFrame(() => {
                            this.display();
                        });
                    });
                });

            // Add a variant warning below the setting item (using callout syntax)
            if (activePresetForFonts.fonts[fontType.key]) {
                const fontForVariantCheck = activePresetForFonts.fonts[fontType.key];
                const variants = this.plugin.settings.availableFonts.filter(f =>
                    (f.familyName || f.name) === fontForVariantCheck
                );

                // Text Font: recommend 4 variants (only show for Latin fonts)
                if (fontType.key === 'text' && variants.length > 0 && variants.length < 4) {
                    const variantList = variants.map(f => f.variantType || 'unknown').join(', ');

                    // Check if it is a Latin font
                    const isLatin = this._isLatinFont(fontForVariantCheck);

                    if (isLatin) {
                        // Latin font: show full warning with non-Latin hint inside callout
                        const warningCallout = containerEl.createDiv({ attr: { style: 'margin: 8px 0 16px 0;' } });

                        const warningMd = `> [!warning] ${t('incompleteVariantTitle')}
> ${t('incompleteVariantBody', { fontFamily: fontForVariantCheck, variantCount: variants.length, variantList })}`;

                        MarkdownRenderer.render(this.app, warningMd, warningCallout, '', this);
                    }
                    // Non-Latin fonts: no warning needed
                }

                // Monospace Font: must be monospace
                if (fontType.key === 'monospace') {
                    const infoCallout = containerEl.createDiv({ attr: { style: 'margin: 8px 0 16px 0;' } });

                    const infoMd = `> [!info] ${t('monospaceRequirement')}
> ${t('monospaceRequirementBody')}`;

                    MarkdownRenderer.render(this.app, infoMd, infoCallout, '', this);
                }

                // Math Font: must be specialized math font
                if (fontType.key === 'math') {
                    const infoCallout = containerEl.createDiv({ attr: { style: 'margin: 8px 0 16px 0;' } });

                    const infoMd = `> [!info] ${t('mathFontRequirement')}
> ${t('mathFontRequirementBody')}`;

                    MarkdownRenderer.render(this.app, infoMd, infoCallout, '', this);
                }
            }

            // If it is the Body Text Font, add Latin font separation options
            if (fontType.supportsLatin) {
                this.addLatinFontOptions(containerEl, activePresetForFonts);
            }

            // If it is the Heading Font, add the "apply to file title" option (only shown when use-text-font is not selected)
            if (fontType.supportsFileTitle) {
                const currentValue = activePresetForFonts.fonts[fontType.key];
                if (currentValue && currentValue !== 'use-text-font') {
                    this.addFileTitleOption(containerEl, activePresetForFonts);
                }
            }
        }

        // ========================================
        // Font File Configuration
        // ========================================
        containerEl.createEl('h3', { text: t('headerFontFileConfig') });

        // Filter state (stored on this to persist across re-renders)
        if (!this._fontFilter) {
            this._fontFilter = 'all'; // 'all' | 'converted' | 'notConverted' | 'notExist'
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
            const isActive = this._fontFilter === btnConfig.filter;
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

        this._addEventListener(expandAllBtn, 'click', () => {
            const allFamilies = fontListEl.querySelectorAll('.font-family-item');
            allFamilies.forEach(familyItem => {
                const toggle = familyItem.querySelector('.font-family-toggle');
                const variants = familyItem.querySelector('.font-variants');
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

        this._addEventListener(collapseAllBtn, 'click', () => {
            const allFamilies = fontListEl.querySelectorAll('.font-family-item');
            allFamilies.forEach(familyItem => {
                const toggle = familyItem.querySelector('.font-family-toggle');
                const variants = familyItem.querySelector('.font-variants');
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

        this._addEventListener(rescanBtn, 'click', async () => {
            rescanBtn.disabled = true;
            rescanBtn.style.opacity = '0.5';
            await this.plugin.scanFonts();
            rescanBtn.disabled = false;
            rescanBtn.style.opacity = '1';
            new Notice(t('fontsRescanned') || '✓ 字体已重新扫描');
        });

        // Font list (must be defined first for the button event listeners)
        const fontListEl = containerEl.createDiv({
            attr: {
                style: 'margin: 10px 0; padding: 10px; background: var(--background-secondary); border-radius: 8px; max-height: 400px; overflow-y: auto;'
            }
        });

        // Now add the event listeners for the filter buttons
        filterButtonElements.forEach(({ btn, filter }) => {
            this._addEventListener(btn, 'click', () => {
                this._fontFilter = filter;

                // Only refresh the font list and button states, not the whole page
                fontListEl.empty();
                if (this.plugin.settings.availableFonts.length === 0) {
                    fontListEl.createEl('div', {
                        text: t('notFoundFontFamily'),
                        attr: { style: 'color: var(--text-muted); font-size: 0.9em; text-align: center; padding: 20px;' }
                    });
                } else {
                    this.renderFontFamilies(fontListEl, this._fontFilter);
                }

                // Update all buttons' active states
                filterButtonElements.forEach(({ btn: button, filter: f }) => {
                    const isActive = this._fontFilter === f;
                    button.style.background = isActive ? 'var(--interactive-accent)' : 'var(--background-primary)';
                    button.style.color = isActive ? 'var(--text-on-accent)' : 'var(--text-normal)';
                });
            });
        });

        // Initialize the font list content
        if (this.plugin.settings.availableFonts.length === 0) {
            fontListEl.createEl('div', {
                text: t('notFoundFontFamily'),
                attr: { style: 'color: var(--text-muted); font-size: 0.9em; text-align: center; padding: 20px;' }
            });
        } else {
            // Display by family (collapsible), passing the filter parameter
            this.renderFontFamilies(fontListEl, this._fontFilter);
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
        this._addEventListener(importBtn, 'click', () => {
            const modal = new FontImportModal(
                this.plugin.app,
                this.plugin,
                async (files) => {
                    importBtn.disabled = true;
                    importBtn.textContent = t('importing') || '导入中...';

                    try {
                        await this.plugin.importFontsFromFiles(files);
                        new Notice(t('importedFonts', { count: files.length }));
                        await this.plugin.scanFonts();
                        this._debouncedDisplay();
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
        this._addEventListener(convertBtn, 'click', async () => {
            convertBtn.disabled = true;
            convertBtn.textContent = t('converting') || '转换中...';
            await this.plugin.convertAllFonts();
            convertBtn.disabled = false;
            convertBtn.textContent = t('convertAllFonts');
            new Notice(t('allFontsConverted') || '✓ 所有字体已转换');
        });

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
                    const unusedFonts = this._getUnusedFonts();
                    if (unusedFonts.length === 0) {
                        new Notice(t('noUnusedFonts'));
                        return;
                    }

                    showConfirmDialog(
                        this.plugin.app,
                        t('confirmDelete'),
                        t('confirmDeleteUnusedFonts').replace('{count}', unusedFonts.length),
                        async () => {
                            await this.deleteUnusedFonts();
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
                    await this.plugin.clearCache();
                    this.display();
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
                    await this.plugin.applyFonts();
                    new Notice(t('fontsApplied'));
                })
            );

        // Restore the scroll position (after all UI is built)
        if (scrollParent && savedScrollTop > 0) {
            // Use double requestAnimationFrame to ensure the DOM is fully rendered
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    scrollParent.scrollTop = savedScrollTop;
                });
            });
        }
    }

    // Add Latin font separation options
    addLatinFontOptions(containerEl, activePreset) {
        // Callout: Example - show different descriptions based on the user language
        const exampleCalloutEl = containerEl.createDiv({ attr: { style: 'margin: 16px 0;' } });

        // Base description
        let exampleMarkdown = `> [!example] ${t('latinFontInfo')}\n> ${t('latinFontInfoDesc')}`;

        // If the user is a Latin-language user, append an additional hint
        if (isLatinScriptLocale()) {
            exampleMarkdown += `\n>\n> ${t('latinFontInfoDescForLatinUsers')}`;
        }

        // Use Obsidian's native rendering engine
        MarkdownRenderer.render(
            this.app,
            exampleMarkdown,
            exampleCalloutEl,
            '',
            this
        );

        // Toggle switch
        new Setting(containerEl)
            .setName(t('latinFontEnabled'))
            .setDesc(t('latinFontEnabledDesc'))
            .addToggle(toggle => toggle
                .setValue(activePreset.latinFontEnabled)
                .onChange(async (value) => {
                    activePreset.latinFontEnabled = value;
                    await this.plugin.saveSettings();
                    await this.plugin.applyFonts();
                    this.display(); // refresh the UI
                }));

        if (activePreset.latinFontEnabled) {
            // Select the Latin font
            new Setting(containerEl)
                .setName(t('latinFont'))
                .setDesc(t('latinFontDesc'))
                .addDropdown(dropdown => {
                    dropdown.addOption('', t('systemDefault'));

                    const uniqueFamilies = new Set();
                    this.plugin.settings.availableFonts.forEach(font => {
                        const familyName = font.familyName || font.name;
                        uniqueFamilies.add(familyName);
                    });

                    const allFamilies = Array.from(uniqueFamilies).sort();
                    const latinFamilies = allFamilies.filter(name =>
                        name.toLowerCase().includes('times') ||
                        name.toLowerCase().includes('latin')
                    );
                    const otherFamilies = allFamilies.filter(name => !latinFamilies.includes(name));

                    if (latinFamilies.length > 0) {
                        dropdown.addOption('', t('recommendedLatinFontsLabel'));
                        latinFamilies.forEach(familyName => {
                            const familyFonts = this.plugin.settings.availableFonts.filter(f =>
                                (f.familyName || f.name) === familyName
                            );
                            const allConverted = familyFonts.every(f => f.hasB64);
                            const variantCount = familyFonts.length;
                            const label = allConverted
                                ? `${familyName} ✓ (${variantCount})`
                                : `${familyName} (${variantCount})`;
                            dropdown.addOption(familyName, label);
                        });
                    }

                    if (otherFamilies.length > 0) {
                        dropdown.addOption('', t('otherFontsLabel'));
                        otherFamilies.forEach(familyName => {
                            const familyFonts = this.plugin.settings.availableFonts.filter(f =>
                                (f.familyName || f.name) === familyName
                            );
                            const allConverted = familyFonts.every(f => f.hasB64);
                            const variantCount = familyFonts.length;
                            const label = allConverted
                                ? `${familyName} ✓ (${variantCount})`
                                : `${familyName} (${variantCount})`;
                            dropdown.addOption(familyName, label);
                        });
                    }

                    dropdown.setValue(activePreset.fonts.latin);
                    dropdown.onChange(async (value) => {
                        activePreset.fonts.latin = value;

                        await this.plugin.saveSettings();
                        await this.plugin.applyFonts();

                        // Refresh the UI to show the warning
                        // Use requestAnimationFrame so DOM ops run in the next frame, avoiding double renders
                        requestAnimationFrame(() => {
                            this.display();
                        });
                    });
                });

            // Show the variant warning below the Latin font selector
            if (activePreset.fonts.latin) {
                const latinFont = activePreset.fonts.latin;
                const selectedFonts = this.plugin.settings.availableFonts.filter(f =>
                    (f.familyName || f.name) === latinFont
                );
                const hasItalic = selectedFonts.some(f => f.variantType === 'italic');
                const hasBold = selectedFonts.some(f => f.variantType === 'bold');
                const hasBoldItalic = selectedFonts.some(f => f.variantType === 'bolditalic');

                const missing = [];
                if (!hasItalic) missing.push('Italic');
                if (!hasBold) missing.push('Bold');
                if (!hasBoldItalic) missing.push('Bold Italic');

                if (missing.length > 0) {
                    const warningCalloutEl = containerEl.createDiv({
                        attr: { style: 'margin: 8px 0 16px 0;' }
                    });

                    const missingList = missing.join(', ');
                    const warningMarkdown = `> [!warning] ${t('missingVariantTitle')}
> ${t('missingVariantBody', { latinFont, missingList })}`;

                    MarkdownRenderer.render(
                        this.app,
                        warningMarkdown,
                        warningCalloutEl,
                        '',
                        this
                    );
                }
            }

            const scopes = [
                { key: 'letters', name: 'Letters', desc: 'A-Z, a-z' },
                { key: 'numbers', name: 'Numbers', desc: '0-9' },
                { key: 'punctuation', name: 'Punctuation', desc: t('punctuationDesc') },
                { key: 'symbols', name: 'Symbols', desc: t('symbolsDesc') }
            ];

            scopes.forEach(scope => {
                new Setting(containerEl)
                    .setName(scope.name)
                    .setDesc(scope.desc)
                    .addToggle(toggle => toggle
                        .setValue(activePreset.latinFontScope?.[scope.key] ?? true)
                        .onChange(async (value) => {
                            if (!activePreset.latinFontScope) {
                                activePreset.latinFontScope = { letters: true, numbers: true, punctuation: true, symbols: true };
                            }
                            activePreset.latinFontScope[scope.key] = value;
                            await this.plugin.saveSettings();
                            await this.plugin.applyFonts();
                        }));
            });

            // Latin font for UI toggle
            new Setting(containerEl)
                .setName(t('latinFontForUI'))
                .setDesc(t('latinFontForUIDesc'))
                .addToggle(toggle => toggle
                    .setValue(this.plugin.settings.latinFontForUI ?? false)
                    .onChange(async (value) => {
                        this.plugin.settings.latinFontForUI = value;
                        await this.plugin.saveSettings();
                        await this.plugin.applyFonts();
                    }));
        }
    }

    // Add the file title option
    addFileTitleOption(containerEl, activePreset) {
        // Check the current heading font setting; hide this option if 'use-text-font'
        const headingFontValue = activePreset.fonts.heading;

        if (headingFontValue === 'use-text-font') {
            // When using the text font, do not show this option
            return;
        }

        new Setting(containerEl)
            .setName(t('headingApplyToFileTitle'))
            .setDesc(t('headingApplyToFileTitleDesc'))
            .addToggle(toggle => toggle
                .setValue(activePreset.headingApplyToFileTitle || false)
                .onChange(async (value) => {
                    activePreset.headingApplyToFileTitle = value;
                    await this.plugin.saveSettings();
                    await this.plugin.applyFonts();
                }));
    }

    // Render font families (collapsible)
    renderFontFamilies(containerEl, filter = 'all') {
        // Group by family
        const familiesMap = new Map();

        this.plugin.settings.availableFonts.forEach(font => {
            const familyName = font.familyName || font.name;
            if (!familiesMap.has(familyName)) {
                familiesMap.set(familyName, []);
            }
            familiesMap.get(familyName).push(font);
        });

        // Filter families by the filter condition
        const filteredFamilies = Array.from(familiesMap.entries()).filter(([familyName, fonts]) => {
            if (filter === 'all') {
                return true; // show all
            } else if (filter === 'converted') {
                // At least one variant is converted
                return fonts.some(f => f.hasB64);
            } else if (filter === 'cachedOnly') {
                // Cache only (has B64 but the source file is missing)
                return fonts.some(f => f.hasB64 && !this.plugin._getFontExists(f));
            } else if (filter === 'notConverted') {
                // At least one variant is not converted
                return fonts.some(f => !f.hasB64);
            } else if (filter === 'notExist') {
                // At least one variant's source file is missing
                return fonts.some(f => !this.plugin._getFontExists(f));
            }
            return true;
        });

        // If there are no results after filtering, show a hint
        if (filteredFamilies.length === 0) {
            let emptyMessage = t('noConvertedFonts') || '没有已转换的字体';
            if (filter === 'notConverted') {
                emptyMessage = t('noNotConvertedFonts') || '没有未转换的字体';
            } else if (filter === 'notExist') {
                emptyMessage = t('noNotExistFonts') || '没有缺失的字体';
            } else if (filter === 'cachedOnly') {
                emptyMessage = t('noCachedOnlyFonts') || '没有仅缓存的字体';
            }
            containerEl.createEl('div', {
                text: emptyMessage,
                attr: { style: 'color: var(--text-muted); font-size: 0.9em; text-align: center; padding: 20px;' }
            });
            return;
        }

        // Render each family
        for (const [familyName, fonts] of filteredFamilies) {
            const familyEl = containerEl.createDiv({
                cls: 'font-family-item',
                attr: {
                    style: 'margin-bottom: 8px; border: 1px solid var(--background-modifier-border); border-radius: 6px; overflow: hidden;'
                }
            });

            // Family title (clickable to expand/collapse)
            const headerEl = familyEl.createDiv({
                attr: {
                    style: 'padding: 12px; background: var(--background-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; user-select: none;'
                }
            });

            const leftEl = headerEl.createDiv({
                attr: { style: 'display: flex; align-items: center; gap: 12px; flex: 1;' }
            });

            // Expand/collapse icon
            const expandIcon = leftEl.createSpan({
                cls: 'font-family-toggle',
                attr: {
                    style: 'display: inline-flex; align-items: center; transition: transform 0.2s ease;',
                    'aria-label': t('expandCollapse')
                }
            });
            setIcon(expandIcon, 'chevron-right');

            // Family name
            leftEl.createSpan({
                text: familyName,
                attr: { style: 'font-weight: 600; font-family: var(--font-monospace);' }
            });

            // Font list (collapsed by default)
            const variantsEl = familyEl.createDiv({
                cls: 'font-variants',
                attr: {
                    style: 'display: none; padding: 8px; background: var(--background-secondary);'
                }
            });

            let expanded = false;
            this._addEventListener(headerEl, 'click', () => {
                expanded = !expanded;
                variantsEl.style.display = expanded ? 'block' : 'none';
                // Rotate icon
                expandIcon.style.transform = expanded ? 'rotate(90deg)' : 'rotate(0deg)';
            });

            // Render the variant list
            fonts.forEach(font => {
                const variantEl = variantsEl.createDiv({
                    attr: {
                        style: 'padding: 8px; margin: 4px 0; background: var(--background-primary); border-radius: 4px; display: flex; align-items: center; justify-content: space-between;'
                    }
                });

                const infoEl = variantEl.createDiv({
                    attr: { style: 'display: flex; align-items: center; gap: 12px; flex: 1;' }
                });

                // Status icon
                // Four states:
                // 1. Source missing + cache exists -> blue check (cache only)
                // 2. Source missing + cache missing -> red question mark (fully missing)
                // 3. Source exists + converted -> green check (converted)
                // 4. Source exists + not converted -> gray circle (pending conversion)

                let iconColor, iconName;

                if (!this.plugin._getFontExists(font)) {
                    // Source file missing
                    if (font.hasB64) {
                        // But the cache exists -> blue check
                        iconColor = 'var(--interactive-accent)';
                        iconName = 'check';
                    } else {
                        // Cache also missing -> red question mark
                        iconColor = 'var(--text-error)';
                        iconName = 'help-circle';
                    }
                } else {
                    // Source file exists
                    if (font.hasB64) {
                        // Converted -> green check
                        iconColor = 'var(--color-green)';
                        iconName = 'check';
                    } else {
                        // Not converted -> gray circle
                        iconColor = 'var(--text-muted)';
                        iconName = 'circle';
                    }
                }

                const statusIconEl = infoEl.createSpan({
                    attr: { style: `color: ${iconColor};` }
                });
                setIcon(statusIconEl, iconName);

                // Variant type label
                const variantLabels = {
                    'regular': 'Regular',
                    'italic': 'Italic',
                    'bold': 'Bold',
                    'bolditalic': 'Bold Italic'
                };

                const variantLabel = variantLabels[font.variantType] || 'Unknown';

                // Variant name
                infoEl.createSpan({
                    text: variantLabel,
                    attr: { style: 'font-family: var(--font-monospace); font-size: 0.9em;' }
                });

                // Action buttons
                const actionsEl = variantEl.createDiv({
                    attr: { style: 'display: flex; gap: 4px;' }
                });

                // Reconvert button
                const convertBtn = actionsEl.createEl('button', {
                    attr: {
                        style: 'padding: 4px 8px; cursor: pointer; display: inline-flex; align-items: center;',
                        title: t('reconvertFont'),
                        'aria-label': t('reconvertFont')
                    }
                });
                setIcon(convertBtn, 'refresh-cw');
                this._addEventListener(convertBtn, 'click', async () => {
                    await this.convertSingleFont(font);
                    this.display();
                });

                // Delete button
                const deleteBtn = actionsEl.createEl('button', {
                    attr: {
                        style: 'padding: 4px 8px; cursor: pointer; display: inline-flex; align-items: center;',
                        title: t('deleteThisFont'),
                        'aria-label': t('deleteThisFont')
                    }
                });
                setIcon(deleteBtn, 'trash-2');
                this._addEventListener(deleteBtn, 'click', async () => {
                    showConfirmDialog(
                        this.plugin.app,
                        t('confirmDelete'),
                        t('confirmDeleteFont').replace('{fontName}', font.name),
                        async () => {
                            await this.deleteSingleFont(font);
                            this.display();
                        },
                        true  // isDangerous = true
                    );
                });
            });
        }
    }

    // Convert a single font
    async convertSingleFont(font) {
        try {
            this.plugin._log(`[Local Font Loader] Converting ${font.name}...`);

            const arrayBuffer = await this.plugin.app.vault.adapter.readBinary(font.path);
            const base64 = this.plugin.arrayBufferToBase64(arrayBuffer);

            // Build the @font-face CSS (config-driven unicode-range determination and family-name escaping)
            const { css: singleFontCss } =
                this.plugin._buildFontFaceCss(font, base64, this.plugin._getDeviceFontContext());

            const cachePath = `${this.plugin.settings.b64OutputDir}/${font.name}.css`;
            await this.plugin.app.vault.adapter.write(cachePath, singleFontCss);

            font.hasB64 = true;
            font.b64Path = cachePath;
            await this.plugin.saveSettings();

            this.plugin._log(`[Local Font Loader] ${font.name} Conversion complete`);
            new Notice(`✓ ${font.name} Conversion complete`);
        } catch (error) {
            this.plugin._logError(`[Local Font Loader] Conversion failed: ${font.name}`, error);
            new Notice(`⚠️ Conversion failed: ${error.message}`);
        }
    }

    // Delete a single font
    async deleteSingleFont(font) {
        try {
            // Delete the source file (for cache-only fonts the source may be gone; ignore and keep cleaning the cache)
            try {
                await this.plugin.app.vault.adapter.remove(font.path);
            } catch (err) {
                this.plugin._log(`[Local Font Loader] 源文件不存在，跳过删除: ${font.path}`);
            }

            // Delete the cache
            if (font.b64Path) {
                try {
                    await this.plugin.app.vault.adapter.remove(font.b64Path);
                } catch (err) {
                    // Cache may not exist
                }
            }

            // Remove from the list
            const index = this.plugin.settings.availableFonts.indexOf(font);
            if (index > -1) {
                this.plugin.settings.availableFonts.splice(index, 1);
            }

            await this.plugin.saveSettings();
            new Notice(t('deletedFont', { fontName: font.name }));
        } catch (error) {
            this.plugin._logError(`[Local Font Loader] 删除失败: ${font.name}`, error);
            new Notice(t('deleteFailedError', { error: error.message }));
        }
    }

    /**
      * Collects font objects not referenced by any preset.
      * Iterates all presets (not the deprecated settings.fonts); a font referenced by any preset
      * via familyName or name counts as "used", protecting all variants of the same family from deletion.
      * @returns {Array} Array of unused font objects
     */
    _getUnusedFonts() {
        const usedFontValues = new Set();

        const presets = this.plugin.settings.presets || [];
        for (const preset of presets) {
            const fontsConfig = preset.fonts || {};
            for (const value of Object.values(fontsConfig)) {
                // Skip empty strings and sentinel values (sentinels never match a real font entry)
                if (value && value !== 'use-text-font' && value !== 'use-ui-font') {
                    usedFontValues.add(value);
                }
            }
        }

        const availableFonts = this.plugin.settings.availableFonts || [];
        return availableFonts.filter(font =>
            !usedFontValues.has(font.familyName) && !usedFontValues.has(font.name)
        );
    }

    // Delete Unused Fonts
    async deleteUnusedFonts() {
        // Consistent with applyFonts: collect used fonts across all presets to avoid deleting configured fonts
        const unusedFonts = this._getUnusedFonts();

        if (unusedFonts.length === 0) {
            new Notice(t('noUnusedFonts'));
            return;
        }

        // Confirmation logic removed; handled by the UI layer

        this.plugin._log(`[Local Font Loader] Starting to delete unused fonts (${unusedFonts.length} fonts)...`);
        let deleted = 0;

        try {
            for (const font of unusedFonts) {
                try {
                    // Delete the original font file (for cache-only fonts the source may be gone; ignore and keep cleaning the cache)
                    try {
                        await this.app.vault.adapter.remove(font.path);
                    } catch (err) {
                        this.plugin._log(`[Local Font Loader] 源文件不存在，跳过删除: ${font.path}`);
                    }

                    // Delete the cache file
                    if (font.hasB64 && font.b64Path) {
                        try {
                            await this.app.vault.adapter.remove(font.b64Path);
                        } catch (error) {
                            // Ignore cache deletion errors
                        }
                    }

                    // Remove from the list
                    const index = this.plugin.settings.availableFonts.indexOf(font);
                    if (index > -1) {
                        this.plugin.settings.availableFonts.splice(index, 1);
                    }

                    deleted++;

                } catch (error) {
                    this.plugin._logError(`[Local Font Loader] 删除失败: ${font.name}`, error);
                }
            }

            await this.plugin.saveSettings();

            new Notice(t('deletedUnusedFonts', { count: deleted }));
            this.plugin._log(`[Local Font Loader] Deleted ${deleted} unused fonts`);

            this.display(); // refresh the UI

        } catch (error) {
            this.plugin._logError('[Local Font Loader] 批量删除失败:', error);
            new Notice(t('deleteError'));
        }
    }

    hide() {
        this._isVisible = false;
        // Clear the debounced-render timer so display() is not re-triggered while hidden
        if (this._displayDebounceTimer) {
            clearTimeout(this._displayDebounceTimer);
            this._displayDebounceTimer = null;
        }
        this._cleanupEventListeners();
        // The settings-changed handler's lifecycle is owned by plugin.registerEvent;
        // it is auto-unbound on unload and no longer unregistered in hide() (avoids losing sync after the first close).
        super.hide();
    }
}


// ============================================================================
// ==== Export ====
// ============================================================================

module.exports = LocalFontLoaderPlugin;
