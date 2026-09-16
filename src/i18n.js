/**
 * Translations and locale helpers.
 */

export const TRANSLATIONS = {
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
        mathFontMismatchTitle: 'Math font metrics do not match',
        mathFontMismatchBody: '"{fontFamily}" has different glyph metrics from the fonts MathJax builds its layout from, so radicals leave a gap between the hook and the bar, and superscripts/subscripts drift away from their base. A math font with Computer Modern metrics — Latin Modern Math above all — removes this entirely.',
        mathFontNotMathTitle: 'Not a usable math font',
        mathFontNotMathBody: '"{fontFamily}" does not provide the required math glyphs ({missing}), so MathJax falls back for them and the formula layout drifts. Please choose a dedicated math font.',
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
        cleanupDevices: 'Clean up unbound devices',
        cleanupDevicesNone: 'No unbound devices to clean up',
        confirmCleanupDevices: 'These devices are neither this device nor bound to any preset, and will be removed from the list:\n\n{0}',
        cleanupDevicesDone: 'Cleaned up {0} device(s)',
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
        mathFontMismatchTitle: '数学字体度量不匹配',
        mathFontMismatchBody: '「{fontFamily}」的字形度量与 MathJax 排版所依据的字体不一致，会出现根号横杠与钩子脱开、上下标与底数浮离的问题。改用 Computer Modern 度量的数学字体（首选 Latin Modern Math）可从根上消除。',
        mathFontNotMathTitle: '不是可用的数学字体',
        mathFontNotMathBody: '「{fontFamily}」未提供所需的数学字形（{missing}），MathJax 会改用回退字体渲染，公式排版会随之错位。请改选专用数学字体。',
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
        cleanupDevices: '清理未绑定设备',
        cleanupDevicesNone: '没有可清理的未绑定设备',
        confirmCleanupDevices: '以下设备既非本机、也未绑定任何预设，将从列表中移除：\n\n{0}',
        cleanupDevicesDone: '已清理 {0} 台设备',
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
        mathFontMismatchTitle: '數學字型度量不相容',
        mathFontMismatchBody: '「{fontFamily}」的字形度量與 MathJax 排版所依據的字型不一致，會出現根號橫槓與鉤子脫開、上下標與底數浮離的問題。改用 Computer Modern 度量的數學字型（首選 Latin Modern Math）可從根本消除。',
        mathFontNotMathTitle: '不是可用的數學字型',
        mathFontNotMathBody: '「{fontFamily}」未提供所需的數學字形（{missing}），MathJax 會改用回退字型渲染，公式排版會隨之錯位。請改選專用數學字型。',
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
        cleanupDevices: '清理未綁定裝置',
        cleanupDevicesNone: '沒有可清理的未綁定裝置',
        confirmCleanupDevices: '以下裝置既非本機、也未綁定任何預設，將從列表中移除：\n\n{0}',
        cleanupDevicesDone: '已清理 {0} 台裝置',
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
export function t(key, localeOrParams = null, params = {}) {
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
export function getCurrentLocale() {
    return (window.localStorage.getItem('language') || 'en').split('-')[0];
}

/**
 * Check if current locale is a Latin-script language
 * Latin-script users typically don't need Latin font separation
 * @returns {boolean} True if current locale uses Latin script
 */
export function isLatinScriptLocale() {
    const locale = getCurrentLocale();
    const latinLocales = ['en', 'es', 'fr', 'de', 'it', 'pt', 'pl', 'nl', 'sv', 'no', 'da', 'fi'];
    return latinLocales.includes(locale);
}

/**
 * Check if current locale is a CJK language
 * @returns {boolean} True if current locale is Chinese, Japanese, or Korean
 */
export function isCJKLocale() {
    const locale = getCurrentLocale();
    return ['zh', 'ja', 'ko'].includes(locale);
}
