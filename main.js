// src/plugin.ts
var import_obsidian7 = require("obsidian");

// src/i18n.ts
var TRANSLATIONS = {
  en: {
    pluginName: "Local Font Loader",
    pluginDesc: "Load custom fonts from your local vault",
    headerDirectoryConfig: "Directory Configuration",
    headerGeneralSettings: "General Settings",
    headerFontApplication: "Font Application Settings",
    headerFontFileConfig: "Font File Configuration",
    headerFallback: "Fallback Operations",
    fontSourceDir: "Font Source Directory",
    fontSourceDirDesc: "Directory containing font family folders",
    cacheDir: "Base64 Cache Directory",
    cacheDirDesc: "Directory for converted CSS files",
    autoLoad: "Auto-load fonts on startup",
    autoLoadDesc: "Automatically apply font configuration when Obsidian starts",
    uiFontName: "UI Interface Font",
    uiFontDesc: "Sidebar, menus, buttons, and other UI elements",
    textFontName: "Body Text Font",
    textFontDesc: "Editor body content",
    textFontWarning: "⚠️ Recommended: Choose a font family with Regular/Italic/Bold/BoldItalic variants for proper italic and bold rendering",
    headingFontName: "Heading Font",
    headingFontDesc: "Font for markdown headings (h1-h6) in content",
    headingUseTextFont: "Use Text Font",
    headingUseUIFont: "Use UI Font",
    headingApplyToFileTitle: "Apply to File Name Title",
    headingApplyToFileTitleDesc: "Also apply heading font to the inline file title displayed at the top of notes",
    monospaceFontName: "Code Font",
    monospaceFontDesc: "Code blocks and inline code",
    monospaceFontWarning: "⚠️ Required: Must be a monospace font. Regular Latin fonts will cause code alignment issues",
    mathFontName: "LaTeX Math Font",
    mathFontDesc: "LaTeX math formula rendering",
    mathFontWarning: "⚠️ Required: Must be a dedicated math font (e.g., Latin Modern Math, XITS Math). Regular fonts cannot render math symbols correctly",
    systemDefault: "-- System Default --",
    latinFontInfo: "Latin Font Separation",
    latinFontInfoDesc: "After enabling, you can assign a separate Latin font. Latin characters (A-Z, a-z, numbers, punctuation) will use the Latin font, while non-Latin characters (CJK, etc.) will continue using the original font.",
    latinFontInfoDescForLatinUsers: "This feature is designed for users who mix Latin and non-Latin scripts (e.g., English + Chinese/Japanese/Korean). If you primarily write in Latin-script languages, you likely don't need this feature.",
    latinFontEnabled: "Enable Latin Font Separation",
    latinFontEnabledDesc: "Use separate fonts for Latin and non-Latin characters",
    latinFontForUI: "Apply Latin Font to UI",
    latinFontForUIDesc: "When enabled, the Latin font will also be applied to UI elements (menus, sidebars, buttons, etc.)",
    latinFont: "Latin Font",
    latinFontDesc: "Font used for Latin characters (A-Z, a-z, 0-9, punctuation)",
    recommendedLatinFonts: "Recommended Latin Fonts",
    latinFontScope: "Latin Font Scope",
    latinFontScopeDesc: "Fine-tune which character ranges use the Latin font",
    scopeBasic: "Basic Latin only (A-Z, a-z, 0-9)",
    scopeExtended: "Basic + Extended Latin (includes accented characters)",
    scopeFull: "Full Latin + Symbols (includes punctuation and special symbols)",
    legendConverted: "Converted",
    legendNotConverted: "Not Converted",
    legendCachedOnly: "Cached Only",
    legendNotExist: "Not Exist",
    filterAll: "All",
    noConvertedFonts: "No converted fonts found",
    noNotConvertedFonts: "No unconverted fonts found",
    noNotExistFonts: "No missing fonts found",
    noCachedOnlyFonts: "No cached-only fonts found",
    scanFonts: "Scan Fonts",
    convertToBase64: "Convert to Base64",
    deleteFont: "Delete Font",
    convertAll: "Convert All",
    deleteUnusedFonts: "Delete Unused Fonts",
    rescanFonts: "Rescan Fonts",
    fontsRescanned: "Fonts Rescanned",
    converting: "Converting...",
    allFontsConverted: "All Fonts Converted",
    fontFileStatus: "Font File Status",
    deleteUnusedFontsDesc: "Delete unused font files (configured fonts will not be deleted)",
    clearCache: "Clear Cache",
    clearCacheDesc: "Clear all converted font cache files",
    applyNow: "Apply Now",
    applyNowDesc: "Apply current font configuration",
    applyFonts: "Apply fonts",
    variantWarningTitle: "Font Variant Warning",
    variantWarningBody: `The selected font "{fontFamily}" only has {variantCount} variant(s) ({variantList}).

For proper italic and bold rendering in Latin-script content, it's recommended to use a font family with Regular, Italic, Bold, and Bold Italic variants. Missing variants may cause faux italic/bold rendering issues.`,
    variantWarningContinue: "Continue anyway",
    variantWarningCancel: "Cancel",
    nonLatinFontNote: "Non-Latin fonts (Chinese, Japanese, Korean, etc.) can ignore this warning",
    overrideSystemSettingsTitle: "Custom Settings Override",
    overrideSystemSettingsContent: "All custom font settings applied here will override Obsidian's system appearance settings.",
    performanceWarningTitle: "Performance Considerations",
    performanceWarningContent: `Avoid mixing too many languages in a single line of text. Dense multilingual mixing (e.g., Chinese + Japanese + Korean + Arabic + Russian in one line) may trigger font fallback mechanisms that can freeze the rendering engine.

Recommendation: Keep content from different languages in separate paragraphs or sections for optimal performance.`,
    incompleteVariantTitle: "Font Variant Incomplete",
    incompleteVariantBody: `The selected font "{fontFamily}" only has {variantCount} variant(s) ({variantList}).
Recommendation: Choose a font family with Regular, Italic, Bold, and Bold Italic variants to ensure proper italic and bold rendering.
Non-Latin fonts typically do not require full Italic/Bold variants and can ignore this warning.`,
    monospaceRequirement: "Monospace Font Required",
    monospaceRequirementBody: "Code fonts must be monospace. Regular Latin fonts will cause code alignment issues.",
    mathFontRequirement: "Math Font Required",
    mathFontRequirementBody: "LaTeX math fonts must be dedicated math fonts (e.g., Latin Modern Math, XITS Math). Regular fonts cannot render math symbols correctly.",
    mathFontMismatchTitle: "Math font metrics do not match",
    mathFontMismatchBody: '"{fontFamily}" has different glyph metrics from the fonts MathJax builds its layout from, so radicals leave a gap between the hook and the bar, and superscripts/subscripts drift away from their base. A math font with Computer Modern metrics — Latin Modern Math above all — removes this entirely.',
    mathFontNotMathTitle: "Not a usable math font",
    mathFontNotMathBody: '"{fontFamily}" does not provide the required math glyphs ({missing}), so MathJax falls back for them and the formula layout drifts. Please choose a dedicated math font.',
    missingVariantTitle: "Missing Font Variants",
    missingVariantBody: "{latinFont} is missing the following variants: {missingList}. Missing styles will use browser synthesis (lower quality).",
    fontMissingWarning: "Font file is missing, fallback to system default",
    variantsSuffix: "variants",
    variantsWithCheckmark: "{familyName} ✓ ({variantCount} variants)",
    variantsWithoutCheckmark: "{familyName} ({variantCount} variants)",
    converted: "Converted",
    notFoundFontFamily: "Font family not found. Please verify font folder structure.",
    importFont: "Import Font",
    convertAllFonts: "Convert All Fonts (Make Usable)",
    recommendedLatinFontsLabel: "--- Recommended Latin Fonts ---",
    otherFontsLabel: "--- Other Fonts ---",
    expandCollapse: "Expand/Collapse",
    expandAll: "Expand All",
    collapseAll: "Collapse All",
    reconvertFont: "Reconvert this font",
    deleteThisFont: "Delete this font",
    confirmDeleteFont: 'Are you sure you want to delete font "{fontName}"?',
    deletedFont: "✓ Deleted {fontName}",
    deleteFailedError: "⚠️ Delete failed: {error}",
    noUnusedFonts: "No unused fonts",
    confirmDeleteUnusedFonts: "Found {count} unused fonts. Are you sure you want to delete them?",
    deletedUnusedFonts: "✓ Deleted {count} unused fonts",
    deleteError: "⚠️ Error deleting fonts",
    importedFonts: "✓ Imported {count} font files",
    importing: "Importing...",
    importError: "⚠️ Import failed",
    importFailedError: "⚠️ Import failed: {error}",
    punctuationDesc: ".,!?;: and other common punctuation",
    symbolsDesc: "@#$%&* and other special characters",
    fontsApplied: "✓ Fonts applied",
    fontConverted: "✓ Font converted",
    conversionFailed: "⚠️ Font conversion failed",
    allConverted: "✓ All fonts converted",
    cacheCleared: "✓ Cleaned {count} cache files",
    cacheClearFailed: "⚠️ Failed to clear cache",
    fontDeleted: "✓ Font deleted",
    deleteFailed: "⚠️ Failed to delete font",
    unusedDeleted: "✓ Deleted {count} unused fonts",
    scanComplete: "✓ Scanned {count} fonts",
    confirmDelete: "Confirm Delete",
    confirmDeleteMsg: "Are you sure you want to delete this font?",
    confirmDeleteUnused: "Are you sure you want to delete all unused fonts?",
    delete: "Delete",
    cancel: "Cancel",
    confirm: "Confirm",
    variantsCount: "{count} variants",
    familyName: "Family",
    style: "Style",
    path: "Path",
    syncDelayTitle: "Cross-Device Sync Notice",
    syncDelayContent: "Font preset changes sync across devices via Obsidian Sync or third-party cloud services (iCloud, Dropbox). Changes may take time to propagate. Manually refresh if needed.",
    headerPresetManagement: "Preset Management",
    createPreset: "Create New Preset",
    createPresetDesc: "Enter a name and click the plus icon to create",
    presetNamePlaceholder: "e.g., Desktop Work, Mobile Reading",
    addPreset: "Add preset",
    presetNameRequired: "Preset name is required",
    presetNameExists: "Preset name already exists",
    presetCreated: "Preset created",
    headerDeviceManagement: "Device Management (Drag & Drop)",
    devicePresetManagement: "Device Preset Assignment",
    currentDevicePreset: "Current Device Preset",
    currentDevicePresetDesc: "Select which preset this device should use",
    selectPresetToEdit: "Select Preset to Edit",
    selectPresetToEditDesc: "Choose which preset you want to configure font settings for",
    devices: "devices",
    global: "Global",
    presetId: "Preset ID",
    presetName: "Preset Name",
    editPresetName: "Edit preset name",
    enterNewPresetName: "Enter new preset name",
    deletePreset: "Delete preset",
    deletePresetWarning: "After deleting this preset, all devices will use the default preset configuration. Please think twice if your preset differs from the default.",
    cannotDeleteDefaultPreset: "Cannot delete the default preset",
    targetDevices: "Target Devices",
    targetDevicesDesc: "Devices that will use this preset",
    refreshDeviceList: "Refresh device list",
    globalPresetNote: "This is a global preset (applies to all devices by default)",
    currentDevice: "Current Device",
    copyPresetCopy: "Copy Preset",
    copyPresetCopyDesc: "Create a copy of the current device's preset",
    copySuffix: "_Copy",
    presetCopied: "Preset copied",
    deviceReassigned: "Device reassigned to preset",
    dragDeviceHere: "Drag devices here to assign to this preset",
    cleanupDevices: "Clean up unbound devices",
    cleanupDevicesNone: "No unbound devices to clean up",
    confirmCleanupDevices: `These devices are neither this device nor bound to any preset, and will be removed from the list:

{0}`,
    cleanupDevicesDone: "Cleaned up {0} device(s)",
    currentDeviceName: "Current Device Name",
    deviceId: "Device ID",
    deviceNamePlaceholder: "e.g., Desktop-Mac, Mobile-Android",
    editDeviceName: "Edit device name",
    moveDeviceToPreset: "Move device to preset",
    fontConfiguration: "Font Configuration",
    currentPresetConfig: "Current Preset Configuration",
    usingGlobalPreset: "You are using the global preset (default for all unassigned devices)",
    fontNotFound: "Font not found in available fonts",
    removeDevice: "Remove device",
    confirmRemoveDevice: 'Remove device "{0}" from all presets? This action cannot be undone.'
  },
  zh: {
    pluginName: "本地字体加载器",
    pluginDesc: "从本地 Vault 加载自定义字体",
    headerDirectoryConfig: "目录配置",
    headerGeneralSettings: "通用设置",
    headerFontApplication: "字体应用设置",
    headerFontFileConfig: "字体文件配置",
    headerFallback: "备用操作",
    fontSourceDir: "字体源目录",
    fontSourceDirDesc: "包含字体家族文件夹的目录",
    cacheDir: "Base64 缓存目录",
    cacheDirDesc: "转换后的 CSS 文件存储位置",
    autoLoad: "启动时自动加载",
    autoLoadDesc: "当 Obsidian 启动时自动应用字体",
    uiFontName: "UI 界面字体",
    uiFontDesc: "侧边栏、菜单、按钮等界面元素",
    textFontName: "正文字体",
    textFontDesc: "编辑器正文内容",
    textFontWarning: "⚠️ 建议选择包含 Regular/Italic/Bold/BoldItalic 四种变体的字体家族，以确保斜体和粗体正常显示",
    headingFontName: "标题字体",
    headingFontDesc: "用于正文内的 Markdown 标题（h1-h6）",
    headingUseTextFont: "使用正文字体",
    headingUseUIFont: "使用UI字体",
    headingApplyToFileTitle: "应用到文件名标题",
    headingApplyToFileTitleDesc: "同时将标题字体应用到笔记顶部显示的文件名标题",
    monospaceFontName: "代码字体",
    monospaceFontDesc: "代码块和行内代码",
    monospaceFontWarning: "⚠️ 必须选择等宽字体（Monospace），普通拉丁字体会导致代码对齐错乱",
    mathFontName: "LaTeX 数学字体",
    mathFontDesc: "数学公式渲染",
    mathFontWarning: "⚠️ 必须选择专用数学字体（如 Latin Modern Math, XITS Math），普通字体无法正确渲染数学符号",
    systemDefault: "-- 系统默认 --",
    latinFontInfo: "拉丁字体分离",
    latinFontInfoDesc: "启用后，可单独指定拉丁字体。拉丁字符（A-Z、a-z、数字、标点）将使用拉丁字体，而非拉丁字符（CJK等）仍使用原字体。",
    latinFontInfoDescForLatinUsers: "此功能专为混合使用拉丁文字和非拉丁文字的用户设计（例如：英文 + 中文/日文/韩文）。如果您主要使用拉丁文字书写，可能不需要此功能。",
    latinFontEnabled: "启用拉丁字体分离",
    latinFontEnabledDesc: "为拉丁字符和非拉丁字符使用不同字体",
    latinFontForUI: "拉丁字体应用于 UI",
    latinFontForUIDesc: "启用后，拉丁字体也将应用于 UI 元素（菜单、侧边栏、按钮等）",
    latinFont: "拉丁字体",
    latinFontDesc: "用于拉丁字符的字体（A-Z、a-z、0-9、标点）",
    recommendedLatinFonts: "推荐的拉丁字体",
    latinFontScope: "拉丁字体作用范围",
    latinFontScopeDesc: "精细调整哪些字符范围使用拉丁字体",
    scopeBasic: "仅基本拉丁字符（A-Z、a-z、0-9）",
    scopeExtended: "基本 + 扩展拉丁字符（包含重音字符）",
    scopeFull: "完整拉丁字符 + 符号（包含标点和特殊符号）",
    legendConverted: "已转换",
    legendNotConverted: "未转换",
    legendCachedOnly: "仅缓存",
    legendNotExist: "不存在",
    filterAll: "全部",
    noConvertedFonts: "没有已转换的字体",
    noNotConvertedFonts: "没有未转换的字体",
    noNotExistFonts: "没有缺失的字体",
    noCachedOnlyFonts: "没有仅缓存的字体",
    scanFonts: "扫描字体",
    convertToBase64: "转换为 Base64",
    deleteFont: "删除字体",
    convertAll: "全部转换",
    deleteUnusedFonts: "删除未使用的字体",
    rescanFonts: "重新扫描",
    fontsRescanned: "字体已重新扫描",
    converting: "转换中...",
    allFontsConverted: "所有字体已转换",
    fontFileStatus: "字体文件状态",
    deleteUnusedFontsDesc: "删除未使用的字体文件（已配置的字体不会被删除）",
    clearCache: "清除缓存",
    clearCacheDesc: "清除所有转换的字体缓存文件",
    applyNow: "立即应用",
    applyNowDesc: "应用当前字体配置",
    applyFonts: "应用字体",
    fontMissingWarning: "当前字体文件缺失，已回退至系统设置",
    variantWarningTitle: "字体变体警告",
    variantWarningBody: `所选字体 "{fontFamily}" 仅有 {variantCount} 个变体（{variantList}）。

为确保拉丁文字内容的斜体和粗体正常显示，建议使用包含 Regular、Italic、Bold 和 Bold Italic 四种变体的字体家族。缺少变体可能导致伪斜体/伪粗体渲染问题。`,
    variantWarningContinue: "仍然继续",
    variantWarningCancel: "取消",
    nonLatinFontNote: "非拉丁语言字体（中文、日文、韩文等）请忽略此警告",
    overrideSystemSettingsTitle: "自定义设置优先",
    overrideSystemSettingsContent: "所有自定义设置一经应用，均会覆盖系统设置",
    performanceWarningTitle: "性能注意事项",
    performanceWarningContent: `避免在单行内混合过多语言文字。密集的多语言混排（例如在同一行内混合中文+日文+韩文+阿拉伯文+俄文）可能触发字体回退机制，导致渲染引擎卡死。

建议：将不同语言的内容分段显示，以获得最佳性能。`,
    incompleteVariantTitle: "字体变体不完整",
    incompleteVariantBody: `所选字体 "{fontFamily}" 仅有 {variantCount} 个变体（{variantList}）。
建议：选择包含 Regular、Italic、Bold 和 Bold Italic 四种变体的字体家族，以确保斜体和粗体正常显示。
非拉丁语言字体通常不需要完整的 Italic/Bold 变体，可以忽略此警告。`,
    monospaceRequirement: "等宽字体要求",
    monospaceRequirementBody: "代码字体必须选择等宽字体（Monospace），普通拉丁字体会导致代码对齐错乱。",
    mathFontRequirement: "数学字体要求",
    mathFontRequirementBody: "LaTeX 数学字体必须选择专用数学字体（如 Latin Modern Math、XITS Math），普通字体无法正确渲染数学符号。",
    mathFontMismatchTitle: "数学字体度量不匹配",
    mathFontMismatchBody: "「{fontFamily}」的字形度量与 MathJax 排版所依据的字体不一致，会出现根号横杠与钩子脱开、上下标与底数浮离的问题。改用 Computer Modern 度量的数学字体（首选 Latin Modern Math）可从根上消除。",
    mathFontNotMathTitle: "不是可用的数学字体",
    mathFontNotMathBody: "「{fontFamily}」未提供所需的数学字形（{missing}），MathJax 会改用回退字体渲染，公式排版会随之错位。请改选专用数学字体。",
    missingVariantTitle: "缺少字体变体",
    missingVariantBody: "{latinFont} 缺少以下变体：{missingList}。缺失的样式将使用浏览器合成（效果较差）。",
    variantsSuffix: "变体",
    variantsWithCheckmark: "{familyName} ✓ ({variantCount} 个变体)",
    variantsWithoutCheckmark: "{familyName} ({variantCount} 个变体)",
    converted: "已转换",
    notFoundFontFamily: "未找到字体家族，请确认字体文件夹结构正确",
    importFont: "导入字体",
    convertAllFonts: "转换所有字体（使其可用）",
    recommendedLatinFontsLabel: "--- 推荐的拉丁字体 ---",
    otherFontsLabel: "--- 其他字体 ---",
    expandCollapse: "展开/收起",
    expandAll: "全部展开",
    collapseAll: "全部折叠",
    reconvertFont: "重新转换此字体",
    deleteThisFont: "删除此字体",
    confirmDeleteFont: '确定要删除字体 "{fontName}" 吗？',
    deletedFont: "✓ 已删除 {fontName}",
    deleteFailedError: "⚠️ 删除失败: {error}",
    noUnusedFonts: "没有未使用的字体",
    confirmDeleteUnusedFonts: "发现 {count} 个未使用的字体，确定要删除吗？",
    deletedUnusedFonts: "✓ 已删除 {count} 个未使用的字体",
    deleteError: "⚠️ 删除字体时出错",
    importedFonts: "✓ 已导入 {count} 个字体文件",
    importing: "导入中...",
    importError: "⚠️ 导入失败",
    importFailedError: "⚠️ 导入失败: {error}",
    punctuationDesc: ".,!?;: 等常用标点",
    symbolsDesc: "@#$%&* 等特殊字符",
    fontsApplied: "✓ 字体已应用",
    fontConverted: "✓ 字体已转换",
    conversionFailed: "⚠️ 字体转换失败",
    allConverted: "✓ 所有字体已转换",
    cacheCleared: "✓ 已清除 {count} 个缓存文件",
    cacheClearFailed: "⚠️ 清除缓存失败",
    fontDeleted: "✓ 字体已删除",
    deleteFailed: "⚠️ 删除字体失败",
    unusedDeleted: "✓ 已删除 {count} 个未使用的字体",
    scanComplete: "✓ 已扫描 {count} 个字体",
    confirmDelete: "确认删除",
    confirmDeleteMsg: "确定要删除此字体吗？",
    confirmDeleteUnused: "确定要删除所有未使用的字体吗？",
    delete: "删除",
    cancel: "取消",
    confirm: "确认",
    variantsCount: "{count} 个变体",
    familyName: "家族",
    style: "样式",
    path: "路径",
    syncDelayTitle: "跨设备同步提示",
    syncDelayContent: "字体预设的变更通过 Obsidian Sync 或第三方云同步服务（iCloud、Dropbox）在设备间同步。变更可能需要一段时间才能传播到其他设备。如需立即生效，请手动刷新。",
    headerPresetManagement: "预设管理",
    createPreset: "创建新预设",
    createPresetDesc: "输入名称后点击加号图标创建",
    presetNamePlaceholder: "例如：桌面办公、移动阅读",
    addPreset: "添加预设",
    presetNameRequired: "预设名称不能为空",
    presetNameExists: "预设名称已存在",
    presetCreated: "预设已创建",
    headerDeviceManagement: "设备管理（拖拽分配）",
    devicePresetManagement: "设备所属预设管理",
    currentDevicePreset: "当前设备所属预设",
    currentDevicePresetDesc: "选择当前设备要使用的预设",
    selectPresetToEdit: "选择需要被设置的预设",
    selectPresetToEditDesc: "选择您要配置字体设置的预设",
    devices: "设备",
    global: "全局",
    presetId: "预设 ID",
    presetName: "预设名称",
    editPresetName: "编辑预设名称",
    enterNewPresetName: "输入新的预设名称",
    deletePreset: "删除预设",
    deletePresetWarning: "删除此预设后，预设所属的设备均会使用默认预设配置，若您设置的预设与默认预设不同，请三思而后行",
    cannotDeleteDefaultPreset: "无法删除默认预设",
    targetDevices: "目标设备",
    targetDevicesDesc: "将使用此预设的设备列表",
    refreshDeviceList: "刷新设备列表",
    globalPresetNote: "这是全局预设（默认应用于所有设备）",
    currentDevice: "当前设备",
    copyPresetCopy: "复制预设副本",
    copyPresetCopyDesc: "为当前设备创建预设的副本",
    copySuffix: "_副本",
    presetCopied: "预设已复制",
    deviceReassigned: "设备已重新分配到预设",
    dragDeviceHere: "拖动设备到此处以分配到该预设",
    cleanupDevices: "清理未绑定设备",
    cleanupDevicesNone: "没有可清理的未绑定设备",
    confirmCleanupDevices: `以下设备既非本机、也未绑定任何预设，将从列表中移除：

{0}`,
    cleanupDevicesDone: "已清理 {0} 台设备",
    currentDeviceName: "当前设备名称",
    deviceId: "设备 ID",
    deviceNamePlaceholder: "例如：桌面-Mac、移动-安卓",
    editDeviceName: "编辑设备名称",
    moveDeviceToPreset: "移动设备到预设",
    fontConfiguration: "字体配置",
    currentPresetConfig: "当前预设配置",
    usingGlobalPreset: "您正在使用全局预设（所有未分配设备的默认配置）",
    fontNotFound: "字体在可用字体列表中不存在",
    removeDevice: "移除设备",
    confirmRemoveDevice: '从所有预设中移除设备"{0}"？此操作无法撤销。'
  },
  ja: {
    pluginName: "ローカルフォントローダー",
    pluginDesc: "ローカル Vault からカスタムフォントを読み込む",
    headerDirectoryConfig: "ディレクトリ設定",
    headerGeneralSettings: "一般設定",
    headerFontApplication: "フォント適用設定",
    headerFontFileConfig: "フォントファイル設定",
    headerFallback: "フォールバック操作",
    devicePresetManagement: "デバイスプリセット管理",
    currentDevicePreset: "現在のデバイスプリセット",
    currentDevicePresetDesc: "このデバイスが使用するプリセットを選択",
    selectPresetToEdit: "編集するプリセットを選択",
    selectPresetToEditDesc: "フォント設定を構成するプリセットを選択",
    presetName: "プリセット名",
    presetId: "プリセット ID",
    usingGlobalPreset: "グローバルプリセットです（未割り当てのすべてのデバイスに適用）",
    fontSourceDir: "フォントソースディレクトリ",
    fontSourceDirDesc: "フォントファミリーフォルダを含むディレクトリ",
    cacheDir: "Base64 キャッシュディレクトリ",
    cacheDirDesc: "変換された CSS ファイルの保存場所",
    autoLoad: "起動時に自動読み込み",
    autoLoadDesc: "Obsidian 起動時にフォントを自動適用",
    uiFontName: "UI インターフェースフォント",
    uiFontDesc: "サイドバー、メニュー、ボタンなどの UI 要素",
    textFontName: "本文フォント",
    textFontDesc: "エディター本文コンテンツ",
    textFontWarning: "⚠️ 推奨：斜体と太字が正しく表示されるように、Regular/Italic/Bold/BoldItalic バリアントを含むフォントファミリーを選択してください",
    headingFontName: "見出しフォント",
    headingFontDesc: "コンテンツ内の Markdown 見出し（h1-h6）用フォント",
    headingUseTextFont: "本文フォントを使用",
    headingUseUIFont: "UI フォントを使用",
    headingApplyToFileTitle: "ファイル名タイトルに適用",
    headingApplyToFileTitleDesc: "ノート上部に表示されるインラインファイルタイトルにも見出しフォントを適用",
    monospaceFontName: "コードフォント",
    monospaceFontDesc: "コードブロックとインラインコード",
    monospaceFontWarning: "⚠️ 必須：等幅フォントである必要があります。通常のラテン文字フォントはコードの配置を崩します",
    mathFontName: "LaTeX 数式フォント",
    mathFontDesc: "数式のレンダリング",
    mathFontWarning: "⚠️ 必須：専用の数式フォント（Latin Modern Math、XITS Math など）が必要です。通常のフォントでは数学記号を正しくレンダリングできません",
    systemDefault: "-- システムデフォルト --",
    latinFontInfo: "ラテン文字フォント分離",
    latinFontInfoDesc: "有効にすると、別のラテン文字フォントを指定できます。ラテン文字（A-Z、a-z、数字、句読点）はラテン文字フォントを使用し、非ラテン文字（CJK など）は元のフォントを使用し続けます。",
    latinFontInfoDescForLatinUsers: "この機能はラテン文字と非ラテン文字を混在させるユーザー向けです（例：英語 + 中国語/日本語/韓国語）。主にラテン文字言語で執筆する場合、この機能は必要ないかもしれません。",
    latinFontEnabled: "ラテン文字フォント分離を有効化",
    latinFontEnabledDesc: "ラテン文字と非ラテン文字に異なるフォントを使用",
    latinFontForUI: "UIにラテン文字フォントを適用",
    latinFontForUIDesc: "有効にすると、ラテン文字フォントはUI要素（メニュー、サイドバー、ボタンなど）にも適用されます",
    latinFont: "ラテン文字フォント",
    latinFontDesc: "ラテン文字に使用されるフォント（A-Z、a-z、0-9、句読点）",
    recommendedLatinFonts: "推奨ラテン文字フォント",
    latinFontScope: "ラテン文字フォントスコープ",
    latinFontScopeDesc: "どの文字範囲にラテン文字フォントを使用するかを微調整",
    scopeBasic: "基本ラテン文字のみ（A-Z、a-z、0-9）",
    scopeExtended: "基本 + 拡張ラテン文字（アクセント付き文字を含む）",
    scopeFull: "完全ラテン文字 + 記号（句読点と特殊記号を含む）",
    legendConverted: "変換済み",
    legendNotConverted: "未変換",
    legendCachedOnly: "キャッシュのみ",
    legendNotExist: "存在しない",
    filterAll: "すべて",
    noConvertedFonts: "変換済みのフォントがありません",
    noNotConvertedFonts: "未変換のフォントがありません",
    noNotExistFonts: "欠落しているフォントがありません",
    scanFonts: "フォントをスキャン",
    convertToBase64: "Base64 に変換",
    deleteFont: "フォントを削除",
    convertAll: "すべて変換",
    deleteUnusedFonts: "未使用フォントを削除",
    rescanFonts: "フォントを再スキャン",
    fontsRescanned: "フォントを再スキャンしました",
    converting: "変換中...",
    allFontsConverted: "すべてのフォントが変換されました",
    fontFileStatus: "フォントファイルステータス",
    deleteUnusedFontsDesc: "未使用のフォントファイルを削除（設定済みフォントは削除されません）",
    clearCache: "キャッシュをクリア",
    clearCacheDesc: "変換されたすべてのフォントキャッシュファイルをクリア",
    applyNow: "今すぐ適用",
    applyNowDesc: "現在のフォント設定を適用",
    applyFonts: "フォントを適用",
    fontMissingWarning: "フォントファイルが見つかりません。システムデフォルトにフォールバックしました",
    variantWarningTitle: "フォントバリアント警告",
    variantWarningBody: `選択したフォント "{fontFamily}" には {variantCount} 個のバリアント（{variantList}）しかありません。

ラテン文字コンテンツの斜体と太字を適切にレンダリングするには、Regular、Italic、Bold、Bold Italic のバリアントを含むフォントファミリーを使用することをお勧めします。バリアントが不足していると、疑似斜体/疑似太字のレンダリング問題が発生する可能性があります。`,
    variantWarningContinue: "このまま続ける",
    variantWarningCancel: "キャンセル",
    fontsApplied: "✓ フォントが適用されました",
    fontConverted: "✓ フォントが変換されました",
    conversionFailed: "⚠️ フォント変換に失敗しました",
    allConverted: "✓ すべてのフォントが変換されました",
    cacheCleared: "✓ {count} 個のキャッシュファイルをクリアしました",
    cacheClearFailed: "⚠️ キャッシュのクリアに失敗しました",
    fontDeleted: "✓ フォントが削除されました",
    deleteFailed: "⚠️ フォントの削除に失敗しました",
    unusedDeleted: "✓ {count} 個の未使用フォントを削除しました",
    scanComplete: "✓ {count} 個のフォントをスキャンしました",
    importedFonts: "✓ {count} 個のフォントファイルをインポートしました",
    importing: "インポート中...",
    importError: "⚠️ インポートに失敗しました",
    confirmDelete: "削除の確認",
    confirmDeleteMsg: "このフォントを削除してもよろしいですか？",
    confirmDeleteUnused: "すべての未使用フォントを削除してもよろしいですか？",
    delete: "削除",
    cancel: "キャンセル",
    confirm: "確認",
    variantsCount: "{count} バリアント",
    familyName: "ファミリー",
    style: "スタイル",
    path: "パス"
  },
  ko: {
    pluginName: "로컬 폰트 로더",
    pluginDesc: "로컬 보관함에서 커스텀 폰트 로드",
    headerDirectoryConfig: "디렉토리 설정",
    headerGeneralSettings: "일반 설정",
    headerFontApplication: "폰트 적용 설정",
    headerFontFileConfig: "폰트 파일 설정",
    headerFallback: "대체 작업",
    devicePresetManagement: "장치 프리셋 관리",
    currentDevicePreset: "현재 장치 프리셋",
    currentDevicePresetDesc: "이 장치가 사용할 프리셋 선택",
    selectPresetToEdit: "편집할 프리셋 선택",
    selectPresetToEditDesc: "폰트 설정을 구성할 프리셋 선택",
    presetName: "프리셋 이름",
    presetId: "프리셋 ID",
    usingGlobalPreset: "전역 프리셋입니다（할당되지 않은 모든 장치에 적용）",
    fontSourceDir: "폰트 소스 디렉토리",
    fontSourceDirDesc: "폰트 패밀리 폴더가 포함된 디렉토리",
    cacheDir: "Base64 캐시 디렉토리",
    cacheDirDesc: "변환된 CSS 파일 저장 위치",
    autoLoad: "시작 시 자동 로드",
    autoLoadDesc: "Obsidian 시작 시 폰트 자동 적용",
    uiFontName: "UI 인터페이스 폰트",
    uiFontDesc: "사이드바, 메뉴, 버튼 등 UI 요소",
    textFontName: "본문 폰트",
    textFontDesc: "편집기 본문 콘텐츠",
    textFontWarning: "⚠️ 권장：기울임꼴과 굵은 글씨가 올바르게 표시되도록 Regular/Italic/Bold/BoldItalic 변형이 포함된 폰트 패밀리를 선택하세요",
    headingFontName: "제목 폰트",
    headingFontDesc: "콘텐츠 내 마크다운 제목（h1-h6）용 폰트",
    headingUseTextFont: "본문 폰트 사용",
    headingUseUIFont: "UI 폰트 사용",
    headingApplyToFileTitle: "파일명 제목에 적용",
    headingApplyToFileTitleDesc: "노트 상단에 표시되는 인라인 파일 제목에도 제목 폰트 적용",
    monospaceFontName: "코드 폰트",
    monospaceFontDesc: "코드 블록 및 인라인 코드",
    monospaceFontWarning: "⚠️ 필수：고정폭 폰트여야 합니다. 일반 라틴 폰트는 코드 정렬을 깨뜨립니다",
    mathFontName: "LaTeX 수학 폰트",
    mathFontDesc: "수학 공식 렌더링",
    mathFontWarning: "⚠️ 필수：전용 수학 폰트（예: Latin Modern Math, XITS Math）가 필요합니다. 일반 폰트는 수학 기호를 올바르게 렌더링할 수 없습니다",
    systemDefault: "-- 시스템 기본값 --",
    latinFontInfo: "라틴 폰트 분리",
    latinFontInfoDesc: "활성화하면 별도의 라틴 폰트를 지정할 수 있습니다. 라틴 문자（A-Z, a-z, 숫자, 구두점）는 라틴 폰트를 사용하고 비라틴 문자（CJK 등）는 원래 폰트를 계속 사용합니다.",
    latinFontInfoDescForLatinUsers: "이 기능은 라틴 문자와 비라틴 문자를 혼용하는 사용자를 위한 것입니다（예: 영어 + 중국어/일본어/한국어）. 주로 라틴 문자 언어로 작성하는 경우 이 기능이 필요하지 않을 수 있습니다.",
    latinFontEnabled: "라틴 폰트 분리 활성화",
    latinFontEnabledDesc: "라틴 문자와 비라틴 문자에 다른 폰트 사용",
    latinFontForUI: "UI에 라틴 폰트 적용",
    latinFontForUIDesc: "활성화하면 라틴 폰트가 UI 요소（메뉴, 사이드바, 버튼 등）에도 적용됩니다",
    latinFont: "라틴 폰트",
    latinFontDesc: "라틴 문자에 사용되는 폰트（A-Z, a-z, 0-9, 구두점）",
    recommendedLatinFonts: "권장 라틴 폰트",
    latinFontScope: "라틴 폰트 범위",
    latinFontScopeDesc: "라틴 폰트를 사용할 문자 범위 세밀 조정",
    scopeBasic: "기본 라틴 문자만（A-Z, a-z, 0-9）",
    scopeExtended: "기본 + 확장 라틴 문자（악센트 문자 포함）",
    scopeFull: "전체 라틴 문자 + 기호（구두점 및 특수 기호 포함）",
    legendConverted: "변환됨",
    legendNotConverted: "변환되지 않음",
    legendCachedOnly: "캐시만",
    legendNotExist: "존재하지 않음",
    filterAll: "전체",
    noConvertedFonts: "변환된 폰트가 없습니다",
    noNotConvertedFonts: "변환되지 않은 폰트가 없습니다",
    noNotExistFonts: "누락된 폰트가 없습니다",
    scanFonts: "폰트 스캔",
    convertToBase64: "Base64로 변환",
    deleteFont: "폰트 삭제",
    convertAll: "모두 변환",
    deleteUnusedFonts: "사용하지 않는 폰트 삭제",
    rescanFonts: "폰트 재스캔",
    fontsRescanned: "폰트 재스캔 완료",
    converting: "변환 중...",
    allFontsConverted: "모든 폰트 변환 완료",
    fontFileStatus: "폰트 파일 상태",
    deleteUnusedFontsDesc: "사용하지 않는 폰트 파일 삭제（설정된 폰트는 삭제되지 않음）",
    clearCache: "캐시 지우기",
    clearCacheDesc: "변환된 모든 폰트 캐시 파일 지우기",
    applyNow: "지금 적용",
    applyNowDesc: "현재 폰트 설정 적용",
    applyFonts: "폰트 적용",
    fontMissingWarning: "폰트 파일이 없습니다. 시스템 기본값으로 대체되었습니다",
    variantWarningTitle: "폰트 변형 경고",
    variantWarningBody: `선택한 폰트 "{fontFamily}"에는 {variantCount}개의 변형（{variantList}）만 있습니다.

라틴 문자 콘텐츠의 기울임꼴과 굵은 글씨를 올바르게 렌더링하려면 Regular, Italic, Bold, Bold Italic 변형이 포함된 폰트 패밀리를 사용하는 것이 좋습니다. 변형이 누락되면 가짜 기울임꼴/가짜 굵은 글씨 렌더링 문제가 발생할 수 있습니다.`,
    variantWarningContinue: "계속 진행",
    variantWarningCancel: "취소",
    fontsApplied: "✓ 폰트가 적용되었습니다",
    fontConverted: "✓ 폰트가 변환되었습니다",
    conversionFailed: "⚠️ 폰트 변환 실패",
    allConverted: "✓ 모든 폰트가 변환되었습니다",
    cacheCleared: "✓ {count}개의 캐시 파일을 지웠습니다",
    cacheClearFailed: "⚠️ 캐시 지우기 실패",
    fontDeleted: "✓ 폰트가 삭제되었습니다",
    deleteFailed: "⚠️ 폰트 삭제 실패",
    unusedDeleted: "✓ {count}개의 사용하지 않는 폰트를 삭제했습니다",
    scanComplete: "✓ {count}개의 폰트를 스캔했습니다",
    importedFonts: "✓ {count}개의 폰트 파일을 가져왔습니다",
    importing: "가져오는 중...",
    importError: "⚠️ 가져오기 실패",
    confirmDelete: "삭제 확인",
    confirmDeleteMsg: "이 폰트를 삭제하시겠습니까？",
    confirmDeleteUnused: "사용하지 않는 모든 폰트를 삭제하시겠습니까？",
    delete: "삭제",
    cancel: "취소",
    confirm: "확인",
    variantsCount: "{count}개 변형",
    familyName: "패밀리",
    style: "스타일",
    path: "경로"
  },
  es: {
    pluginName: "Cargador de Fuentes Locales",
    pluginDesc: "Carga fuentes personalizadas desde tu bóveda local",
    headerDirectoryConfig: "Configuración de Directorios",
    headerGeneralSettings: "Configuración General",
    headerFontApplication: "Configuración de Aplicación de Fuentes",
    headerFontFileConfig: "Configuración de Archivos de Fuentes",
    headerFallback: "Operaciones de Respaldo",
    devicePresetManagement: "Gestión de Presets de Dispositivo",
    currentDevicePreset: "Preset de Dispositivo Actual",
    currentDevicePresetDesc: "Seleccionar qué preset debe usar este dispositivo",
    selectPresetToEdit: "Seleccionar Preset para Editar",
    selectPresetToEditDesc: "Elegir qué preset desea configurar",
    presetName: "Nombre del Preset",
    presetId: "ID del Preset",
    usingGlobalPreset: "Este es un preset global (aplica a todos los dispositivos no asignados)",
    fontSourceDir: "Directorio de Origen de Fuentes",
    fontSourceDirDesc: "Directorio que contiene carpetas de familias de fuentes",
    cacheDir: "Directorio de Caché Base64",
    cacheDirDesc: "Donde se almacenan los archivos CSS convertidos",
    autoLoad: "Cargar automáticamente al iniciar",
    autoLoadDesc: "Aplicar automáticamente las fuentes cuando se inicia Obsidian",
    uiFontName: "Fuente de Interfaz UI",
    uiFontDesc: "Barra lateral, menús, botones y otros elementos de UI",
    textFontName: "Fuente de Texto del Cuerpo",
    textFontDesc: "Contenido del cuerpo del editor",
    textFontWarning: "⚠️ Recomendado: Elija una familia de fuentes con variantes Regular/Italic/Bold/BoldItalic para una correcta renderización de cursiva y negrita",
    monospaceFontName: "Fuente de Código",
    monospaceFontDesc: "Bloques de código y código en línea",
    monospaceFontWarning: "⚠️ Requerido: Debe ser una fuente monoespaciada. Las fuentes latinas regulares causarán problemas de alineación de código",
    mathFontName: "Fuente de Matemáticas LaTeX",
    mathFontDesc: "Renderizado de fórmulas matemáticas",
    mathFontWarning: "⚠️ Requerido: Debe ser una fuente matemática dedicada (ej., Latin Modern Math, XITS Math). Las fuentes regulares no pueden renderizar símbolos matemáticos correctamente",
    systemDefault: "-- Predeterminado del Sistema --",
    latinFontInfo: "Separación de Fuentes Latinas",
    latinFontInfoDesc: "Al activarse, puede asignar una fuente latina separada. Los caracteres latinos (A-Z, a-z, números, puntuación) usarán la fuente latina, mientras que los caracteres no latinos (CJK, etc.) continuarán usando la fuente original.",
    latinFontInfoDescForLatinUsers: "Esta función está diseñada para usuarios que mezclan escrituras latinas y no latinas (ej., Inglés + Chino/Japonés/Coreano). Si escribe principalmente en idiomas con escritura latina, probablemente no necesite esta función.",
    latinFontEnabled: "Activar Separación de Fuentes Latinas",
    latinFontEnabledDesc: "Usar fuentes separadas para caracteres latinos y no latinos",
    latinFontForUI: "Aplicar Fuente Latina a UI",
    latinFontForUIDesc: "Cuando está habilitado, la fuente latina también se aplicará a elementos de UI (menús, barras laterales, botones, etc.)",
    latinFont: "Fuente Latina",
    latinFontDesc: "Fuente usada para caracteres latinos (A-Z, a-z, 0-9, puntuación)",
    recommendedLatinFonts: "Fuentes Latinas Recomendadas",
    latinFontScope: "Ámbito de Fuente Latina",
    latinFontScopeDesc: "Ajustar qué rangos de caracteres usan la fuente latina",
    scopeBasic: "Solo latín básico (A-Z, a-z, 0-9)",
    scopeExtended: "Latín básico + extendido (incluye caracteres acentuados)",
    scopeFull: "Latín completo + símbolos (incluye puntuación y símbolos especiales)",
    legendConverted: "Convertido",
    legendNotConverted: "No Convertido",
    legendCachedOnly: "Solo Caché",
    legendNotExist: "No Existe",
    filterAll: "Todos",
    noConvertedFonts: "No se encontraron fuentes convertidas",
    noNotConvertedFonts: "No se encontraron fuentes sin convertir",
    noNotExistFonts: "No se encontraron fuentes faltantes",
    scanFonts: "Escanear Fuentes",
    convertToBase64: "Convertir a Base64",
    deleteFont: "Eliminar Fuente",
    convertAll: "Convertir Todo",
    deleteUnusedFonts: "Eliminar Fuentes No Usadas",
    rescanFonts: "Reescanear Fuentes",
    fontsRescanned: "Fuentes Reescaneadas",
    converting: "Convirtiendo...",
    allFontsConverted: "Todas las Fuentes Convertidas",
    fontFileStatus: "Estado de Archivos de Fuentes",
    deleteUnusedFontsDesc: "Eliminar archivos de fuentes no usadas (las fuentes configuradas no se eliminarán)",
    clearCache: "Limpiar Caché",
    clearCacheDesc: "Limpiar todos los archivos de caché de fuentes convertidas",
    applyNow: "Aplicar Ahora",
    applyNowDesc: "Aplicar la configuración de fuentes actual",
    applyFonts: "Aplicar Fuentes",
    fontMissingWarning: "Archivo de fuente faltante, usando predeterminado del sistema",
    variantWarningTitle: "Advertencia de Variantes de Fuente",
    variantWarningBody: `La fuente seleccionada "{fontFamily}" solo tiene {variantCount} variante(s) ({variantList}).

Para una correcta renderización de cursiva y negrita en contenido de escritura latina, se recomienda usar una familia de fuentes con variantes Regular, Italic, Bold y Bold Italic. Las variantes faltantes pueden causar problemas de renderización de falsa cursiva/negrita.`,
    variantWarningContinue: "Continuar de todos modos",
    variantWarningCancel: "Cancelar",
    fontsApplied: "✓ Fuentes aplicadas",
    fontConverted: "✓ Fuente convertida",
    conversionFailed: "⚠️ Conversión de fuente fallida",
    allConverted: "✓ Todas las fuentes convertidas",
    cacheCleared: "✓ Se limpiaron {count} archivos de caché",
    cacheClearFailed: "⚠️ Error al limpiar caché",
    fontDeleted: "✓ Fuente eliminada",
    deleteFailed: "⚠️ Error al eliminar fuente",
    unusedDeleted: "✓ Se eliminaron {count} fuentes no usadas",
    scanComplete: "✓ Se escanearon {count} fuentes",
    importedFonts: "✓ Se importaron {count} archivos de fuentes",
    importing: "Importando...",
    importError: "⚠️ Error al importar",
    confirmDelete: "Confirmar Eliminación",
    confirmDeleteMsg: "¿Está seguro de que desea eliminar esta fuente?",
    confirmDeleteUnused: "¿Está seguro de que desea eliminar todas las fuentes no usadas?",
    delete: "Eliminar",
    cancel: "Cancelar",
    confirm: "Confirmar",
    variantsCount: "{count} variantes",
    familyName: "Familia",
    style: "Estilo",
    path: "Ruta"
  },
  "zh-TW": {
    pluginName: "本地字型載入器",
    pluginDesc: "從本地 Vault 載入自訂字型",
    headerDirectoryConfig: "目錄設定",
    headerGeneralSettings: "通用設定",
    headerFontApplication: "字型套用設定",
    headerFontFileConfig: "字型檔案設定",
    headerFallback: "備用操作",
    fontSourceDir: "字型來源目錄",
    fontSourceDirDesc: "包含字型家族資料夾的目錄",
    cacheDir: "Base64 快取目錄",
    cacheDirDesc: "轉換後的 CSS 檔案儲存位置",
    autoLoad: "啟動時自動載入",
    autoLoadDesc: "當 Obsidian 啟動時自動套用字型",
    uiFontName: "UI 介面字型",
    uiFontDesc: "側邊欄、選單、按鈕等介面元素",
    textFontName: "正文字型",
    textFontDesc: "編輯器正文內容",
    textFontWarning: "⚠️ 建議選擇包含 Regular/Italic/Bold/BoldItalic 四種變體的字型家族，以確保斜體和粗體正常顯示",
    headingFontName: "標題字型",
    headingFontDesc: "用於正文內的 Markdown 標題（h1-h6）",
    headingUseTextFont: "使用正文字型",
    headingUseUIFont: "使用UI字型",
    headingApplyToFileTitle: "套用到檔案名稱標題",
    headingApplyToFileTitleDesc: "同時將標題字型套用到筆記頂部顯示的檔案名稱標題",
    monospaceFontName: "程式碼字型",
    monospaceFontDesc: "程式碼區塊和行內程式碼",
    monospaceFontWarning: "⚠️ 必須選擇等寬字型（Monospace），普通拉丁字型會導致程式碼對齊錯亂",
    mathFontName: "LaTeX 數學字型",
    mathFontDesc: "數學公式渲染",
    mathFontWarning: "⚠️ 必須選擇專用數學字型（如 Latin Modern Math, XITS Math），普通字型無法正確渲染數學符號",
    systemDefault: "-- 系統預設 --",
    latinFontInfo: "拉丁字型分離",
    latinFontInfoDesc: "啟用後，可單獨指定拉丁字型。拉丁字元（A-Z、a-z、數字、標點）將使用拉丁字型，而非拉丁字元（CJK等）仍使用原字型。",
    latinFontInfoDescForLatinUsers: "此功能專為混合使用拉丁文字和非拉丁文字的使用者設計（例如：英文 + 中文/日文/韓文）。如果您主要使用拉丁文字書寫，可能不需要此功能。",
    latinFontEnabled: "啟用拉丁字型分離",
    latinFontEnabledDesc: "為拉丁字元和非拉丁字元使用不同字型",
    latinFontForUI: "拉丁字型套用於 UI",
    latinFontForUIDesc: "啟用後，拉丁字型也將套用於 UI 元素（選單、側邊欄、按鈕等）",
    latinFont: "拉丁字型",
    latinFontDesc: "用於拉丁字元的字型（A-Z、a-z、0-9、標點）",
    recommendedLatinFonts: "推薦的拉丁字型",
    latinFontScope: "拉丁字型作用範圍",
    latinFontScopeDesc: "精細調整哪些字元範圍使用拉丁字型",
    scopeBasic: "僅基本拉丁字元（A-Z、a-z、0-9）",
    scopeExtended: "基本 + 擴充拉丁字元（包含重音字元）",
    scopeFull: "完整拉丁字元 + 符號（包含標點和特殊符號）",
    legendConverted: "已轉換",
    legendNotConverted: "未轉換",
    legendCachedOnly: "僅快取",
    legendNotExist: "不存在",
    filterAll: "全部",
    noConvertedFonts: "沒有已轉換的字型",
    noNotConvertedFonts: "沒有未轉換的字型",
    noNotExistFonts: "沒有缺失的字型",
    noCachedOnlyFonts: "沒有僅快取的字型",
    scanFonts: "掃描字型",
    convertToBase64: "轉換為 Base64",
    deleteFont: "刪除字型",
    convertAll: "全部轉換",
    deleteUnusedFonts: "刪除未使用的字型",
    rescanFonts: "重新掃描",
    fontsRescanned: "字型已重新掃描",
    converting: "轉換中...",
    allFontsConverted: "所有字型已轉換",
    fontFileStatus: "字型檔案狀態",
    deleteUnusedFontsDesc: "刪除未使用的字型檔案（已設定的字型不會被刪除）",
    clearCache: "清除快取",
    clearCacheDesc: "清除所有轉換的字型快取檔案",
    applyNow: "立即套用",
    applyNowDesc: "套用目前字型設定",
    applyFonts: "套用字型",
    fontMissingWarning: "目前字型檔案缺失，已回退至系統設定",
    variantWarningTitle: "字型變體警告",
    variantWarningBody: `所選字型 "{fontFamily}" 僅有 {variantCount} 個變體（{variantList}）。

為確保拉丁文字內容的斜體和粗體正常顯示，建議使用包含 Regular、Italic、Bold 和 Bold Italic 四種變體的字型家族。缺少變體可能導致偽斜體/偽粗體渲染問題。`,
    variantWarningContinue: "仍然繼續",
    variantWarningCancel: "取消",
    nonLatinFontNote: "非拉丁語言字型（中文、日文、韓文等）請忽略此警告",
    overrideSystemSettingsTitle: "自訂設定優先",
    overrideSystemSettingsContent: "所有自訂設定一經套用，均會覆蓋系統設定",
    performanceWarningTitle: "效能注意事項",
    performanceWarningContent: `避免在單行內混合過多語言文字。密集的多語言混排（例如在同一行內混合中文+日文+韓文+阿拉伯文+俄文）可能觸發字型回退機制，導致渲染引擎卡死。

建議：將不同語言的內容分段顯示，以獲得最佳效能。`,
    incompleteVariantTitle: "字型變體不完整",
    incompleteVariantBody: `所選字型 "{fontFamily}" 僅有 {variantCount} 個變體（{variantList}）。
建議：選擇包含 Regular、Italic、Bold 和 Bold Italic 四種變體的字型家族，以確保斜體和粗體正常顯示。
非拉丁語言字型通常不需要完整的 Italic/Bold 變體，可以忽略此警告。`,
    monospaceRequirement: "等寬字型要求",
    monospaceRequirementBody: "程式碼字型必須選擇等寬字型（Monospace），普通拉丁字型會導致程式碼對齊錯亂。",
    mathFontRequirement: "數學字型要求",
    mathFontRequirementBody: "LaTeX 數學字型必須選擇專用數學字型（如 Latin Modern Math、XITS Math），普通字型無法正確渲染數學符號。",
    mathFontMismatchTitle: "數學字型度量不相容",
    mathFontMismatchBody: "「{fontFamily}」的字形度量與 MathJax 排版所依據的字型不一致，會出現根號橫槓與鉤子脫開、上下標與底數浮離的問題。改用 Computer Modern 度量的數學字型（首選 Latin Modern Math）可從根本消除。",
    mathFontNotMathTitle: "不是可用的數學字型",
    mathFontNotMathBody: "「{fontFamily}」未提供所需的數學字形（{missing}），MathJax 會改用回退字型渲染，公式排版會隨之錯位。請改選專用數學字型。",
    missingVariantTitle: "缺少字型變體",
    missingVariantBody: "{latinFont} 缺少以下變體：{missingList}。缺失的樣式將使用瀏覽器合成（效果較差）。",
    variantsSuffix: "變體",
    variantsWithCheckmark: "{familyName} ✓ ({variantCount} 個變體)",
    variantsWithoutCheckmark: "{familyName} ({variantCount} 個變體)",
    converted: "已轉換",
    notFoundFontFamily: "未找到字型家族，請確認字型資料夾結構正確",
    importFont: "匯入字型",
    convertAllFonts: "轉換所有字型（使其可用）",
    recommendedLatinFontsLabel: "--- 推薦的拉丁字型 ---",
    otherFontsLabel: "--- 其他字型 ---",
    expandCollapse: "展開/收合",
    expandAll: "全部展開",
    collapseAll: "全部收合",
    reconvertFont: "重新轉換此字型",
    deleteThisFont: "刪除此字型",
    confirmDeleteFont: '確定要刪除字型 "{fontName}" 嗎？',
    deletedFont: "✓ 已刪除 {fontName}",
    deleteFailedError: "⚠️ 刪除失敗: {error}",
    noUnusedFonts: "沒有未使用的字型",
    confirmDeleteUnusedFonts: "發現 {count} 個未使用的字型，確定要刪除嗎？",
    deletedUnusedFonts: "✓ 已刪除 {count} 個未使用的字型",
    deleteError: "⚠️ 刪除字型時出錯",
    importedFonts: "✓ 已匯入 {count} 個字型檔案",
    importing: "匯入中...",
    importError: "⚠️ 匯入失敗",
    importFailedError: "⚠️ 匯入失敗: {error}",
    punctuationDesc: ".,!?;: 等常用標點",
    symbolsDesc: "@#$%&* 等特殊字元",
    fontsApplied: "✓ 字型已套用",
    fontConverted: "✓ 字型已轉換",
    conversionFailed: "⚠️ 字型轉換失敗",
    allConverted: "✓ 所有字型已轉換",
    cacheCleared: "✓ 已清除 {count} 個快取檔案",
    cacheClearFailed: "⚠️ 清除快取失敗",
    fontDeleted: "✓ 字型已刪除",
    deleteFailed: "⚠️ 刪除字型失敗",
    unusedDeleted: "✓ 已刪除 {count} 個未使用的字型",
    scanComplete: "✓ 已掃描 {count} 個字型",
    confirmDelete: "確認刪除",
    confirmDeleteMsg: "確定要刪除此字型嗎？",
    confirmDeleteUnused: "確定要刪除所有未使用的字型嗎？",
    delete: "刪除",
    cancel: "取消",
    confirm: "確認",
    variantsCount: "{count} 個變體",
    familyName: "家族",
    style: "樣式",
    path: "路徑",
    syncDelayTitle: "跨裝置同步提示",
    syncDelayContent: "字型預設的變更透過 Obsidian Sync 或第三方雲端同步服務（iCloud、Dropbox）在裝置間同步。變更可能需要一段時間才能傳播到其他裝置。如需立即生效，請手動重新整理。",
    headerPresetManagement: "預設管理",
    createPreset: "建立新預設",
    createPresetDesc: "輸入名稱後點選加號圖示建立",
    presetNamePlaceholder: "例如：桌面辦公、行動閱讀",
    addPreset: "新增預設",
    presetNameRequired: "預設名稱不能為空",
    presetNameExists: "預設名稱已存在",
    presetCreated: "預設已建立",
    headerDeviceManagement: "裝置管理（拖曳分配）",
    devicePresetManagement: "裝置所屬預設管理",
    currentDevicePreset: "目前裝置所屬預設",
    currentDevicePresetDesc: "選擇目前裝置要使用的預設",
    selectPresetToEdit: "選擇需要被設定的預設",
    selectPresetToEditDesc: "選擇您要設定字型設定的預設",
    presetName: "預設名稱",
    presetId: "預設 ID",
    usingGlobalPreset: "這是全域預設（套用於所有未分配裝置）",
    devices: "裝置",
    global: "全域",
    editPresetName: "編輯預設名稱",
    enterNewPresetName: "輸入新的預設名稱",
    deletePreset: "刪除預設",
    deletePresetWarning: "刪除此預設後，預設所屬的裝置均會使用預設預設設定，若您設定的預設與預設預設不同，請三思而後行",
    cannotDeleteDefaultPreset: "無法刪除預設預設",
    targetDevices: "目標裝置",
    targetDevicesDesc: "將使用此預設的裝置列表",
    refreshDeviceList: "重新整理裝置列表",
    globalPresetNote: "這是全域預設（預設套用於所有裝置）",
    currentDevice: "目前裝置",
    copyPresetCopy: "複製預設副本",
    copyPresetCopyDesc: "為目前裝置建立預設的副本",
    copySuffix: "_副本",
    presetCopied: "預設已複製",
    deviceReassigned: "裝置已重新分配到預設",
    dragDeviceHere: "拖動裝置到此處以分配到該預設",
    cleanupDevices: "清理未綁定裝置",
    cleanupDevicesNone: "沒有可清理的未綁定裝置",
    confirmCleanupDevices: `以下裝置既非本機、也未綁定任何預設，將從列表中移除：

{0}`,
    cleanupDevicesDone: "已清理 {0} 台裝置",
    currentDeviceName: "目前裝置名稱",
    deviceId: "裝置 ID",
    deviceNamePlaceholder: "例如：桌面-Mac、行動-安卓",
    editDeviceName: "編輯裝置名稱",
    moveDeviceToPreset: "移動裝置到預設",
    fontConfiguration: "字型設定",
    currentPresetConfig: "目前預設設定",
    fontNotFound: "字型在可用字型列表中不存在",
    removeDevice: "移除裝置",
    confirmRemoveDevice: '從所有預設中移除裝置"{0}"？此操作無法復原。'
  }
};
function t(key, localeOrParams = null, params = {}) {
  let locale = null;
  if (localeOrParams && typeof localeOrParams === "object") {
    params = localeOrParams;
    locale = null;
  } else {
    locale = localeOrParams;
  }
  if (!locale) {
    const fullLocale = window.localStorage.getItem("language") || "en";
    if (TRANSLATIONS[fullLocale]) {
      locale = fullLocale;
    } else {
      locale = fullLocale.split("-")[0];
    }
  }
  const lang = TRANSLATIONS[locale] || TRANSLATIONS.en;
  let text = lang[key] || TRANSLATIONS.en[key] || key;
  Object.keys(params).forEach((param) => {
    text = text.replace(new RegExp(`\\{${param}\\}`, "g"), params[param]);
  });
  return text;
}
function getCurrentLocale() {
  return (window.localStorage.getItem("language") || "en").split("-")[0];
}
function isLatinScriptLocale() {
  const locale = getCurrentLocale();
  const latinLocales = ["en", "es", "fr", "de", "it", "pt", "pl", "nl", "sv", "no", "da", "fi"];
  return latinLocales.includes(locale);
}

// src/font-metadata.ts
function parseFontMetadata(arrayBuffer) {
  try {
    const dataView = new DataView(arrayBuffer);
    const numTables = dataView.getUint16(4);
    let nameTableOffset = null;
    for (let i = 0;i < numTables; i++) {
      const tableOffset = 12 + i * 16;
      const tag = String.fromCharCode(dataView.getUint8(tableOffset), dataView.getUint8(tableOffset + 1), dataView.getUint8(tableOffset + 2), dataView.getUint8(tableOffset + 3));
      if (tag === "name") {
        nameTableOffset = dataView.getUint32(tableOffset + 8);
        break;
      }
    }
    if (!nameTableOffset) {
      return null;
    }
    const nameTable = {
      format: dataView.getUint16(nameTableOffset),
      count: dataView.getUint16(nameTableOffset + 2),
      stringOffset: dataView.getUint16(nameTableOffset + 4)
    };
    const nameRecords = [];
    for (let i = 0;i < nameTable.count; i++) {
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
    const metadata = {
      familyName: null,
      subfamilyName: null,
      fullName: null,
      postScriptName: null
    };
    const stringStorageOffset = nameTableOffset + nameTable.stringOffset;
    for (const record of nameRecords) {
      const stringOffset = stringStorageOffset + record.offset;
      let value = "";
      if (record.platformID === 3 && record.encodingID === 1) {
        for (let j = 0;j < record.length; j += 2) {
          const charCode = dataView.getUint16(stringOffset + j);
          if (charCode > 0) {
            value += String.fromCharCode(charCode);
          }
        }
      } else if (record.platformID === 1) {
        for (let j = 0;j < record.length; j++) {
          value += String.fromCharCode(dataView.getUint8(stringOffset + j));
        }
      }
      if (!value)
        continue;
      switch (record.nameID) {
        case 1:
          if (!metadata.familyName)
            metadata.familyName = value;
          break;
        case 2:
          if (!metadata.subfamilyName)
            metadata.subfamilyName = value;
          break;
        case 4:
          if (!metadata.fullName)
            metadata.fullName = value;
          break;
        case 6:
          if (!metadata.postScriptName)
            metadata.postScriptName = value;
          break;
      }
    }
    const subfamily = (metadata.subfamilyName || "").toLowerCase();
    const isItalic = subfamily.includes("italic") || subfamily.includes("oblique");
    const isBold = subfamily.includes("bold") || subfamily.includes("heavy") || subfamily.includes("black");
    let variantType = "regular";
    if (isBold && isItalic) {
      variantType = "bolditalic";
    } else if (isBold) {
      variantType = "bold";
    } else if (isItalic) {
      variantType = "italic";
    }
    let weight = 400;
    if (subfamily.includes("thin") || subfamily.includes("hairline")) {
      weight = 100;
    } else if (subfamily.includes("extralight") || subfamily.includes("ultralight")) {
      weight = 200;
    } else if (subfamily.includes("light")) {
      weight = 300;
    } else if (subfamily.includes("medium")) {
      weight = 500;
    } else if (subfamily.includes("semibold") || subfamily.includes("demibold")) {
      weight = 600;
    } else if (subfamily.includes("bold")) {
      weight = 700;
    } else if (subfamily.includes("extrabold") || subfamily.includes("ultrabold")) {
      weight = 800;
    } else if (subfamily.includes("black") || subfamily.includes("heavy")) {
      weight = 900;
    }
    return {
      familyName: metadata.familyName,
      subfamilyName: metadata.subfamilyName,
      fullName: metadata.fullName,
      postScriptName: metadata.postScriptName,
      variantType,
      style: {
        isItalic,
        isBold,
        weight,
        cssStyle: isItalic ? "italic" : "normal"
      }
    };
  } catch (error) {
    console.error("[Font Metadata] Parse failed:", error);
    return null;
  }
}

// src/constants.ts
var DEFAULT_SETTINGS = {
  fontSourceDir: "Local-Fonts",
  b64OutputDir: "Local-Fonts/UsableCssFont",
  availableFonts: [],
  fontFamilies: [],
  autoLoadOnStartup: true,
  deviceFingerprints: {},
  deviceNameMap: {},
  deviceMeta: {},
  latinFontForUI: false,
  presets: [
    {
      id: "default-preset",
      name: "Default",
      targetDevices: [],
      fonts: {
        ui: "",
        text: "",
        heading: "",
        monospace: "",
        math: "",
        latin: ""
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

// src/ui/settings-tab.ts
var import_obsidian6 = require("obsidian");

// src/ui/modals.ts
var import_obsidian = require("obsidian");
class TextInputModal extends import_obsidian.Modal {
  titleText;
  placeholder;
  defaultValue;
  onSubmit;
  constructor(app, title, placeholder, defaultValue, onSubmit) {
    super(app);
    this.titleText = title;
    this.placeholder = placeholder;
    this.defaultValue = defaultValue || "";
    this.onSubmit = onSubmit;
  }
  onOpen() {
    const { contentEl, titleEl } = this;
    titleEl.setText(this.titleText);
    const inputEl = contentEl.createEl("input", {
      type: "text",
      value: this.defaultValue,
      placeholder: this.placeholder,
      attr: {
        "aria-label": this.titleText
      }
    });
    inputEl.setCssStyles({
      width: "100%",
      marginBottom: "16px",
      padding: "8px",
      fontSize: "14px",
      border: "1px solid var(--background-modifier-border)",
      borderRadius: "4px",
      backgroundColor: "var(--background-primary)",
      color: "var(--text-normal)"
    });
    const buttonContainer = contentEl.createDiv({ cls: "modal-button-container" });
    buttonContainer.setCssStyles({
      display: "flex",
      justifyContent: "flex-end",
      gap: "8px",
      marginTop: "16px"
    });
    const cancelBtn = buttonContainer.createEl("button", { text: t("cancel") });
    cancelBtn.addEventListener("click", () => this.close());
    const submitBtn = buttonContainer.createEl("button", {
      text: t("confirm"),
      cls: "mod-cta"
    });
    submitBtn.addEventListener("click", () => {
      const value = inputEl.value.trim();
      if (value) {
        this.onSubmit(value);
        this.close();
      } else {
        inputEl.setCssStyles({
          borderColor: "var(--text-error)"
        });
        inputEl.focus();
      }
    });
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submitBtn.click();
      } else if (e.key === "Escape") {
        e.preventDefault();
        this.close();
      }
    });
    inputEl.addEventListener("input", () => {
      inputEl.setCssStyles({
        borderColor: "var(--background-modifier-border)"
      });
    });
    window.setTimeout(() => {
      inputEl.focus();
      inputEl.select();
    }, 10);
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

class FontImportModal extends import_obsidian.Modal {
  plugin;
  onImport;
  constructor(app, plugin, onImport) {
    super(app);
    this.plugin = plugin;
    this.onImport = onImport;
  }
  onOpen() {
    const { contentEl, titleEl } = this;
    titleEl.setText(t("importFont"));
    const dropZone = contentEl.createDiv({
      cls: "font-import-dropzone",
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
      cls: "font-import-icon",
      attr: {
        style: `
                    margin-bottom: 16px;
                    color: var(--interactive-accent);
                `
      }
    });
    import_obsidian.setIcon(iconContainer, "folder");
    const iconSvg = iconContainer.querySelector("svg");
    if (iconSvg) {
      iconSvg.setAttribute("width", "48");
      iconSvg.setAttribute("height", "48");
      iconSvg.setCssStyles({
        display: "block",
        margin: "0 auto"
      });
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
      text: "拖拽字体文件到此处"
    });
    const subtitle = dropZone.createDiv({
      attr: {
        style: `
                    font-size: 14px;
                    color: var(--text-muted);
                    margin-bottom: 16px;
                `
      },
      text: "或点击选择文件"
    });
    const hint = dropZone.createDiv({
      attr: {
        style: `
                    font-size: 12px;
                    color: var(--text-faint);
                `
      },
      text: "支持 .ttf, .otf, .woff, .woff2 格式"
    });
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".ttf,.otf,.woff,.woff2";
    input.setCssStyles({
      display: "none"
    });
    contentEl.appendChild(input);
    dropZone.onclick = () => {
      input.click();
    };
    input.onchange = async () => {
      const files = input.files;
      if (!files || files.length === 0)
        return;
      this.close();
      await this.onImport(files);
    };
    dropZone.ondragover = (e) => {
      e.preventDefault();
      dropZone.setCssStyles({
        background: "var(--background-modifier-hover)"
      });
    };
    dropZone.ondragleave = () => {
      dropZone.setCssStyles({
        background: "var(--background-secondary)"
      });
    };
    dropZone.ondrop = async (e) => {
      e.preventDefault();
      dropZone.setCssStyles({
        background: "var(--background-secondary)"
      });
      const files = e.dataTransfer.files;
      if (!files || files.length === 0)
        return;
      this.close();
      await this.onImport(files);
    };
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
function showConfirmDialog(app, title, message, onConfirm, isDangerous = false) {
  const modal = new import_obsidian.ConfirmationModal(app);
  modal.setTitle(title);
  modal.contentEl.createEl("p", {
    text: message,
    attr: { style: "margin-bottom: 16px;" }
  });
  modal.addButton((btn) => {
    btn.setButtonText(t("confirm"));
    btn.setCta();
    if (isDangerous) {
      btn.buttonEl.addClass("mod-warning");
    }
    btn.onClick(() => {
      onConfirm();
    });
  });
  modal.addCancelButton(t("cancel"));
  modal.open();
}

// src/ui/settings/device-preset.ts
var import_obsidian2 = require("obsidian");
function renderDeviceAndPresetSection(tab, containerEl) {
  const syncWarningCallout = containerEl.createDiv({ cls: "callout", attr: { "data-callout": "info" } });
  const syncWarningTitle = syncWarningCallout.createDiv({ cls: "callout-title" });
  const syncWarningIcon = syncWarningTitle.createDiv({ cls: "callout-icon" });
  import_obsidian2.setIcon(syncWarningIcon, "info");
  syncWarningTitle.createDiv({ cls: "callout-title-inner", text: t("syncDelayTitle") });
  const syncWarningContent = syncWarningCallout.createDiv({ cls: "callout-content" });
  syncWarningContent.createEl("p", { text: t("syncDelayContent") });
  containerEl.createEl("h3", { text: t("headerPresetManagement") });
  new import_obsidian2.Setting(containerEl).setName(t("createPreset")).setDesc(t("createPresetDesc")).addText((text) => {
    text.setPlaceholder(t("presetNamePlaceholder"));
    tab._newPresetNameInput = text;
  }).addButton((btn) => {
    btn.setIcon("plus");
    btn.setTooltip(t("addPreset"));
    btn.onClick(async () => {
      const presetName = tab._newPresetNameInput.getValue().trim();
      if (!presetName) {
        new import_obsidian2.Notice(t("presetNameRequired"), 3000);
        return;
      }
      const exists = tab.plugin.settings.presets.some((p) => p.name === presetName);
      if (exists) {
        new import_obsidian2.Notice(t("presetNameExists"), 3000);
        return;
      }
      await tab.plugin.createPreset(presetName);
      new import_obsidian2.Notice(`✓ ${t("presetCreated")}: ${presetName}`, 2000);
      tab.display();
    });
  });
  const deviceManagementHeader = containerEl.createDiv({ cls: "setting-item-heading-with-button" });
  deviceManagementHeader.createEl("h4", { text: t("headerDeviceManagement") });
  const refreshBtn = deviceManagementHeader.createEl("button", { cls: "clickable-icon" });
  refreshBtn.setAttribute("aria-label", t("refreshDeviceList"));
  import_obsidian2.setIcon(refreshBtn, "refresh-cw");
  tab._addEventListener(refreshBtn, "click", async () => {
    await tab.plugin.loadSettings();
    tab.display();
  });
  const dragContainer = containerEl.createDiv({ cls: "preset-drag-container" });
  tab.plugin.settings.presets.forEach((preset) => {
    const presetSection = dragContainer.createDiv({ cls: "preset-section" });
    const presetHeader = presetSection.createDiv({ cls: "preset-header" });
    presetHeader.createEl("h5", {
      text: preset.id === "default-preset" && preset.targetDevices.length === 0 ? `${preset.name} (${t("global")})` : preset.name
    });
    const presetActions = presetHeader.createDiv({ cls: "preset-actions" });
    const editBtn = presetActions.createEl("button", { cls: "clickable-icon" });
    editBtn.setAttribute("aria-label", t("editPresetName"));
    import_obsidian2.setIcon(editBtn, "edit");
    tab._addEventListener(editBtn, "click", async () => {
      new TextInputModal(tab.plugin.app, t("editPresetName"), t("presetNamePlaceholder"), preset.name, async (newName) => {
        if (newName !== preset.name) {
          await tab.plugin.renamePreset(preset.id, newName);
          tab.display();
        }
      }).open();
    });
    const copyBtn = presetActions.createEl("button", { cls: "clickable-icon" });
    copyBtn.setAttribute("aria-label", t("copyPresetCopy"));
    import_obsidian2.setIcon(copyBtn, "copy");
    tab._addEventListener(copyBtn, "click", async () => {
      const copyName = `${preset.name}${t("copySuffix")}`;
      await tab.plugin.copyPresetForDevice(preset.id, copyName);
      new import_obsidian2.Notice(`✓ ${t("presetCopied")}: ${copyName}`, 2000);
      tab.display();
    });
    if (preset.id !== "default-preset") {
      const deleteBtn = presetActions.createEl("button", { cls: "clickable-icon" });
      deleteBtn.setAttribute("aria-label", t("deletePreset"));
      import_obsidian2.setIcon(deleteBtn, "trash");
      tab._addEventListener(deleteBtn, "click", async () => {
        showConfirmDialog(tab.plugin.app, t("deletePreset"), t("deletePresetWarning"), async () => {
          await tab.plugin.deletePreset(preset.id);
          if (tab._activePresetId === preset.id) {
            const fallbackPreset = tab.plugin._getDevicePreset();
            tab._activePresetId = fallbackPreset ? fallbackPreset.id : "default-preset";
          }
          tab.display();
        }, true);
      });
    }
    const devicesContainer = presetSection.createDiv({
      cls: "devices-container",
      attr: { "data-preset-id": preset.id }
    });
    if (preset.id === "default-preset" && preset.targetDevices.length === 0) {
      devicesContainer.addClass("global-preset-zone");
    }
    tab._addEventListener(devicesContainer, "dragover", (e) => {
      e.preventDefault();
      devicesContainer.classList.add("drag-over");
    });
    tab._addEventListener(devicesContainer, "dragleave", () => {
      devicesContainer.classList.remove("drag-over");
    });
    tab._addEventListener(devicesContainer, "drop", async (e) => {
      e.preventDefault();
      devicesContainer.classList.remove("drag-over");
      const deviceId = e.dataTransfer.getData("text/plain");
      const targetPresetId = devicesContainer.dataset.presetId;
      await tab.plugin.assignDeviceToPreset(deviceId, targetPresetId);
      tab.display();
    });
    let devicesToShow = [];
    if (preset.id === "default-preset" && preset.targetDevices.length === 0) {
      const allDeviceIds = new Set;
      if (tab.plugin.settings.deviceNameMap) {
        Object.keys(tab.plugin.settings.deviceNameMap).forEach((id) => {
          allDeviceIds.add(id);
        });
      }
      const assignedDevices = new Set;
      tab.plugin.settings.presets.forEach((p) => {
        if (p.targetDevices.length > 0) {
          p.targetDevices.forEach((id) => assignedDevices.add(id));
        }
      });
      devicesToShow = Array.from(allDeviceIds).filter((id) => !assignedDevices.has(id));
    } else {
      devicesToShow = preset.targetDevices;
    }
    if (devicesToShow.length === 0) {
      devicesContainer.createEl("p", {
        text: t("dragDeviceHere"),
        cls: "setting-item-description"
      });
    } else {
      devicesToShow.forEach((deviceId) => {
        const deviceName = tab.plugin._getDeviceName(deviceId);
        const isCurrent = deviceId === tab.plugin.currentDeviceId;
        const deviceItem = devicesContainer.createDiv({
          cls: "device-item"
        });
        const deviceInfoContainer = deviceItem.createDiv({
          attr: { style: "display: flex; align-items: center; gap: 8px; flex: 1;" }
        });
        const osIcon = deviceInfoContainer.createSpan({
          cls: "device-os-icon"
        });
        const osIconClasses = {
          android: "os-android",
          ios: "os-ios",
          ipados: "os-ipados",
          windows: "os-windows",
          macos: "os-macos",
          linux: "os-linux"
        };
        const detectedOs = tab.plugin._getDeviceOs(deviceId);
        osIcon.addClass(osIconClasses[detectedOs] || "os-default");
        const textContainer = deviceInfoContainer.createDiv({
          attr: { style: "display: flex; flex-direction: column; gap: 2px; min-width: 0;" }
        });
        textContainer.createSpan({
          text: isCurrent ? `${deviceName} (${t("currentDevice")})` : deviceName,
          cls: "device-name"
        });
        const metaParts = [];
        const identifier = tab.plugin._getDeviceHostname(deviceId) || tab.plugin._getDeviceModel(deviceId);
        if (identifier && identifier !== deviceName) {
          metaParts.push(identifier);
        }
        const osLabels = {
          android: "Android",
          ios: "iOS",
          ipados: "iPadOS",
          windows: "Windows",
          macos: "macOS",
          linux: "Linux"
        };
        const osText = osLabels[detectedOs];
        if (osText && osText !== identifier) {
          metaParts.push(osText);
        }
        if (metaParts.length > 0) {
          textContainer.createSpan({
            text: metaParts.join(" · "),
            cls: "device-meta"
          });
        }
        const btnContainer = deviceItem.createDiv({ cls: "device-actions" });
        const editBtn2 = btnContainer.createEl("button", {
          cls: "clickable-icon",
          attr: {
            "aria-label": t("editDeviceName"),
            style: "color: var(--text-on-accent);"
          }
        });
        import_obsidian2.setIcon(editBtn2, "edit");
        tab._addEventListener(editBtn2, "click", async (e) => {
          e.stopPropagation();
          new TextInputModal(tab.plugin.app, t("editDeviceName"), t("deviceNamePlaceholder"), deviceName, async (newName) => {
            if (newName !== deviceName) {
              await tab.plugin.updateDeviceName(deviceId, newName);
              tab.display();
            }
          }).open();
        });
        if (!isCurrent) {
          const removeBtn = btnContainer.createEl("button", {
            cls: "clickable-icon",
            attr: { "aria-label": t("removeDevice") }
          });
          import_obsidian2.setIcon(removeBtn, "trash-2");
          tab._addEventListener(removeBtn, "click", async (e) => {
            e.stopPropagation();
            showConfirmDialog(tab.plugin.app, t("removeDevice"), t("confirmRemoveDevice").replace("{0}", deviceName), async () => {
              await tab.plugin.removeDeviceFromPresets(deviceId);
              tab.display();
            }, true);
          });
        }
        if (isCurrent) {
          deviceItem.addClass("current-device");
        }
        if (import_obsidian2.Platform.isMobile) {
          const moveBtn = btnContainer.createEl("button", {
            cls: "clickable-icon",
            attr: { "aria-label": t("moveDeviceToPreset") }
          });
          import_obsidian2.setIcon(moveBtn, "move");
          tab._addEventListener(moveBtn, "click", async (e) => {
            e.stopPropagation();
            const selectEl = document.createElement("select");
            selectEl.setCssStyles({
              cssText: "position: absolute; opacity: 0; pointer-events: none;"
            });
            tab.plugin.settings.presets.forEach((p) => {
              const option = selectEl.appendChild(document.createElement("option"));
              option.value = p.id;
              option.text = p.id === "default-preset" && p.targetDevices.length === 0 ? `${p.name} (${t("global")})` : p.name;
            });
            const currentPreset = tab.plugin.settings.presets.find((p) => p.targetDevices.includes(deviceId));
            if (currentPreset) {
              selectEl.value = currentPreset.id;
            }
            document.body.appendChild(selectEl);
            selectEl.focus();
            selectEl.click();
            selectEl.addEventListener("change", async () => {
              const targetPresetId = selectEl.value;
              await tab.plugin.assignDeviceToPreset(deviceId, targetPresetId);
              new import_obsidian2.Notice(`✓ ${t("deviceReassigned")}`, 2000);
              tab.display();
              selectEl.remove();
            });
            selectEl.addEventListener("blur", () => {
              selectEl.remove();
            });
          });
        }
        deviceItem.draggable = true;
        tab._addEventListener(deviceItem, "dragstart", (e) => {
          e.dataTransfer.setData("text/plain", deviceId);
          deviceItem.classList.add("dragging");
        });
        tab._addEventListener(deviceItem, "dragend", () => {
          deviceItem.classList.remove("dragging");
        });
      });
    }
    if (preset.id === "default-preset" && preset.targetDevices.length === 0) {
      const cleanupFooter = presetSection.createDiv({ cls: "device-cleanup-footer" });
      const cleanupBtn = cleanupFooter.createEl("button", {
        text: t("cleanupDevices"),
        cls: "mod-warning"
      });
      tab._addEventListener(cleanupBtn, "click", async () => {
        const prunable = tab.plugin.getPrunableDevices();
        if (prunable.length === 0) {
          new import_obsidian2.Notice(t("cleanupDevicesNone"), 3000);
          return;
        }
        const deviceNames = prunable.map((device) => device.name).join("、");
        showConfirmDialog(tab.plugin.app, t("cleanupDevices"), t("confirmCleanupDevices").replace("{0}", deviceNames), async () => {
          const removedCount = await tab.plugin.pruneUnboundDevices();
          new import_obsidian2.Notice(`✓ ${t("cleanupDevicesDone").replace("{0}", String(removedCount))}`, 3000);
          tab.display();
        }, true);
      });
    }
  });
  containerEl.createEl("h4", { text: t("devicePresetManagement"), cls: "setting-item-heading" });
  const devicePreset = tab.plugin._getDevicePreset();
  new import_obsidian2.Setting(containerEl).setName(t("currentDevicePreset")).setDesc(t("currentDevicePresetDesc")).addDropdown((dropdown) => {
    tab.plugin.settings.presets.forEach((preset) => {
      const label = preset.id === "default-preset" && preset.targetDevices.length === 0 ? `${preset.name} (${t("global")})` : preset.name;
      dropdown.addOption(preset.id, label);
    });
    dropdown.setValue(devicePreset ? devicePreset.id : "default-preset");
    dropdown.onChange(async (newPresetId) => {
      await tab.plugin.assignDeviceToPreset(tab.plugin.currentDeviceId, newPresetId);
      new import_obsidian2.Notice(`✓ ${t("deviceReassigned")}`, 2000);
      tab.display();
    });
  }).addButton((btn) => {
    btn.setIcon("refresh-cw");
    btn.setTooltip(t("refreshDeviceList"));
    btn.onClick(() => tab.display());
  });
  new import_obsidian2.Setting(containerEl).setName(t("copyPresetCopy")).setDesc(t("copyPresetCopyDesc")).addButton((btn) => {
    btn.setButtonText(t("copyPresetCopy"));
    btn.onClick(async () => {
      const devicePreset2 = tab.plugin._getDevicePreset();
      const copyName = `${devicePreset2.name}${t("copySuffix")}`;
      await tab.plugin.copyPresetForDevice(devicePreset2.id, copyName);
      new import_obsidian2.Notice(`✓ ${t("presetCopied")}: ${copyName}`, 2000);
      tab.display();
    });
  });
}

// src/ui/settings/directory-application.ts
var import_obsidian3 = require("obsidian");
function renderDirectoryAndApplicationSection(tab, containerEl) {
  containerEl.createEl("h3", { text: t("headerDirectoryConfig") });
  new import_obsidian3.Setting(containerEl).setName(t("fontSourceDir")).setDesc(t("fontSourceDirDesc")).addText((text) => text.setPlaceholder("Local-Fonts").setValue(tab.plugin.settings.fontSourceDir).onChange(async (value) => {
    tab.plugin.settings.fontSourceDir = value;
    await tab.plugin.saveSettings();
  })).addButton((btn) => btn.setButtonText(t("scanFonts")).onClick(async () => {
    await tab.plugin.scanFonts();
    new import_obsidian3.Notice("✓ Font list updated");
    tab.display();
  }));
  new import_obsidian3.Setting(containerEl).setName(t("cacheDir")).setDesc(t("cacheDirDesc")).addText((text) => text.setPlaceholder("Local-Fonts/UsableCssFont").setValue(tab.plugin.settings.b64OutputDir).onChange(async (value) => {
    tab.plugin.settings.b64OutputDir = value;
    await tab.plugin.saveSettings();
  }));
  new import_obsidian3.Setting(containerEl).setName(t("autoLoad")).setDesc(t("autoLoadDesc")).addToggle((toggle) => toggle.setValue(tab.plugin.settings.autoLoadOnStartup).onChange(async (value) => {
    tab.plugin.settings.autoLoadOnStartup = value;
    await tab.plugin.saveSettings();
  }));
  containerEl.createEl("h3", { text: t("headerFontApplication") });
  const currentDevicePreset = tab.plugin._getDevicePreset();
  if (!tab._activePresetId) {
    tab._activePresetId = currentDevicePreset ? currentDevicePreset.id : "default-preset";
  }
  new import_obsidian3.Setting(containerEl).setName(t("selectPresetToEdit")).setDesc(t("selectPresetToEditDesc")).addDropdown((dropdown) => {
    tab.plugin.settings.presets.forEach((preset) => {
      const label = preset.id === "default-preset" && preset.targetDevices.length === 0 ? `${preset.name} (${t("global")})` : preset.name;
      dropdown.addOption(preset.id, label);
    });
    dropdown.setValue(tab._activePresetId);
    dropdown.onChange(async (newPresetId) => {
      tab._activePresetId = newPresetId;
      tab.display();
    });
  });
  const activePreset = tab.plugin.settings.presets.find((p) => p.id === tab._activePresetId);
  if (activePreset) {
    const presetInfoEl = containerEl.createDiv({
      cls: "callout",
      attr: { "data-callout": "example" }
    });
    const presetInfoTitle = presetInfoEl.createDiv({ cls: "callout-title" });
    const presetInfoIcon = presetInfoTitle.createDiv({ cls: "callout-icon" });
    import_obsidian3.setIcon(presetInfoIcon, "list-checks");
    presetInfoTitle.createDiv({
      cls: "callout-title-inner",
      text: `${t("presetName")}: ${activePreset.name}`
    });
    const presetInfoContent = presetInfoEl.createDiv({ cls: "callout-content" });
    presetInfoContent.createEl("p", {
      text: `${t("presetId")}: ${activePreset.id}`,
      attr: { style: "margin: 0; font-family: var(--font-monospace); color: var(--text-muted);" }
    });
    if (activePreset.id === "default-preset" && activePreset.targetDevices.length === 0) {
      const warningContainer = presetInfoContent.createEl("p", {
        attr: {
          style: "margin: 8px 0 0 0; color: var(--text-warning); display: flex; align-items: center; gap: 6px;"
        }
      });
      const warningIcon = warningContainer.createSpan({ cls: "warning-icon" });
      import_obsidian3.setIcon(warningIcon, "alert-triangle");
      warningIcon.setCssStyles({
        display: "inline-flex",
        flexShrink: "0"
      });
      warningContainer.createSpan({ text: t("usingGlobalPreset") });
    }
  }
  const fontTypes = [
    { key: "ui", name: t("uiFontName"), desc: t("uiFontDesc") },
    {
      key: "text",
      name: t("textFontName"),
      desc: t("textFontDesc"),
      supportsLatin: true
    },
    {
      key: "heading",
      name: t("headingFontName"),
      desc: t("headingFontDesc"),
      supportsFileTitle: true,
      specialOptions: ["text", "ui"]
    },
    {
      key: "monospace",
      name: t("monospaceFontName"),
      desc: t("monospaceFontDesc")
    },
    {
      key: "math",
      name: t("mathFontName"),
      desc: t("mathFontDesc")
    }
  ];
  const activePresetForFonts = tab.plugin.settings.presets.find((p) => p.id === tab._activePresetId);
  if (!activePresetForFonts) {
    console.error("[LocalFontLoader] Active preset not found:", tab._activePresetId);
    return;
  }
  const activePresetFonts = activePresetForFonts.fonts || {};
  for (const fontType of fontTypes) {
    const settingItem = new import_obsidian3.Setting(containerEl).setName(fontType.name).setDesc(fontType.desc);
    const selectedFont = activePresetFonts[fontType.key];
    const fontExists = tab.plugin.isFontAvailable(selectedFont);
    if (selectedFont && !fontExists) {
      const warningIcon = settingItem.nameEl.createSpan({ cls: "font-missing-icon" });
      import_obsidian3.setIcon(warningIcon, "x");
      warningIcon.setCssStyles({
        color: "var(--text-error)",
        marginLeft: "8px"
      });
      warningIcon.setAttribute("aria-label", t("fontNotFound"));
    }
    const mathVerdict = fontType.key === "math" && selectedFont && fontExists ? tab.plugin._evaluateMathFont(selectedFont) : null;
    if (mathVerdict && (mathVerdict.status === "mismatch" || mathVerdict.status === "notMathFont")) {
      const mathWarningIcon = settingItem.nameEl.createSpan({ cls: "font-incompatible-icon" });
      import_obsidian3.setIcon(mathWarningIcon, "alert-triangle");
      mathWarningIcon.setCssStyles({
        color: "var(--text-warning)",
        marginLeft: "8px"
      });
      mathWarningIcon.setAttribute("aria-label", t(mathVerdict.status === "notMathFont" ? "mathFontNotMathTitle" : "mathFontMismatchTitle"));
    }
    settingItem.addDropdown((dropdown) => {
      dropdown.addOption("", t("systemDefault"));
      if (fontType.specialOptions) {
        fontType.specialOptions.forEach((optKey) => {
          if (optKey === "text") {
            dropdown.addOption("use-text-font", t("headingUseTextFont"));
          } else if (optKey === "ui") {
            dropdown.addOption("use-ui-font", t("headingUseUIFont"));
          }
        });
      }
      const uniqueFamilies = new Set;
      tab.plugin.settings.availableFonts.forEach((font) => {
        const familyName = font.familyName || font.name;
        uniqueFamilies.add(familyName);
      });
      Array.from(uniqueFamilies).sort().forEach((familyName) => {
        const familyFonts = tab.plugin.settings.availableFonts.filter((f) => (f.familyName || f.name) === familyName);
        const allConverted = familyFonts.every((f) => f.hasB64);
        const label = allConverted ? `${familyName} ✓` : familyName;
        dropdown.addOption(familyName, label);
      });
      dropdown.setValue(activePresetForFonts.fonts[fontType.key]);
      dropdown.onChange(async (value) => {
        activePresetForFonts.fonts[fontType.key] = value;
        await tab.plugin.saveSettings();
        const currentDevicePreset2 = tab.plugin._getDevicePreset();
        if (currentDevicePreset2 && currentDevicePreset2.id === activePresetForFonts.id) {
          await tab.plugin.applyFonts();
        }
        window.requestAnimationFrame(() => {
          tab.display();
        });
      });
    });
    if (activePresetForFonts.fonts[fontType.key]) {
      const fontForVariantCheck = activePresetForFonts.fonts[fontType.key];
      const variants = tab.plugin.settings.availableFonts.filter((f) => (f.familyName || f.name) === fontForVariantCheck);
      if (fontType.key === "text" && variants.length > 0 && variants.length < 4) {
        const variantList = variants.map((f) => f.variantType || "unknown").join(", ");
        const isLatin = tab._isLatinFont(fontForVariantCheck);
        if (isLatin) {
          const warningCallout = containerEl.createDiv({ attr: { style: "margin: 8px 0 16px 0;" } });
          const warningMd = `> [!warning] ${t("incompleteVariantTitle")}
> ${t("incompleteVariantBody", { fontFamily: fontForVariantCheck, variantCount: variants.length, variantList })}`;
          tab._renderMarkdown(warningCallout, warningMd);
        }
      }
      if (fontType.key === "monospace") {
        const infoCallout = containerEl.createDiv({ attr: { style: "margin: 8px 0 16px 0;" } });
        const infoMd = `> [!info] ${t("monospaceRequirement")}
> ${t("monospaceRequirementBody")}`;
        tab._renderMarkdown(infoCallout, infoMd);
      }
      if (fontType.key === "math") {
        const infoCallout = containerEl.createDiv({ attr: { style: "margin: 8px 0 16px 0;" } });
        if (mathVerdict && mathVerdict.status === "notMathFont") {
          const warningMd = `> [!warning] ${t("mathFontNotMathTitle")}
> ${t("mathFontNotMathBody", { fontFamily: selectedFont, missing: (mathVerdict.missing || []).join(", ") })}`;
          tab._renderMarkdown(infoCallout, warningMd);
        } else if (mathVerdict && mathVerdict.status === "mismatch") {
          const detail = mathVerdict.deviations.map((d) => `${d.metric}: ${d.actual}em (MathJax ${d.expected}em, ±${d.percent}%)`).join(`
> `);
          const warningMd = `> [!warning] ${t("mathFontMismatchTitle")}
> ${t("mathFontMismatchBody", { fontFamily: selectedFont })}
>
> ${detail}`;
          tab._renderMarkdown(infoCallout, warningMd);
        } else {
          const infoMd = `> [!info] ${t("mathFontRequirement")}
> ${t("mathFontRequirementBody")}`;
          tab._renderMarkdown(infoCallout, infoMd);
        }
      }
    }
    if (fontType.supportsLatin) {
      tab.addLatinFontOptions(containerEl, activePresetForFonts);
    }
    if (fontType.supportsFileTitle) {
      const currentValue = activePresetForFonts.fonts[fontType.key];
      if (currentValue && currentValue !== "use-text-font") {
        tab.addFileTitleOption(containerEl, activePresetForFonts);
      }
    }
  }
}

// src/ui/settings/font-status.ts
var import_obsidian4 = require("obsidian");
function renderFontStatusSection(tab, containerEl) {
  containerEl.createEl("h3", { text: t("headerFontFileConfig") });
  if (!tab._fontFilter) {
    tab._fontFilter = "all";
  }
  const buttonContainerEl = containerEl.createDiv({
    attr: {
      style: "margin-bottom: 12px; padding: 12px; background: var(--background-secondary); border-radius: 8px; display: flex; gap: 16px; flex-wrap: wrap; align-items: center;"
    }
  });
  const filterGroup = buttonContainerEl.createDiv({
    attr: { style: "display: flex; gap: 8px; align-items: center; flex-wrap: wrap;" }
  });
  const filterButtons = [
    { filter: "all", icon: "list", label: t("filterAll") || "全部" },
    { filter: "converted", icon: "check", label: t("legendConverted") },
    { filter: "cachedOnly", icon: "database", label: t("legendCachedOnly") },
    { filter: "notConverted", icon: "circle", label: t("legendNotConverted") },
    { filter: "notExist", icon: "help-circle", label: t("legendNotExist") }
  ];
  const filterButtonElements = [];
  filterButtons.forEach((btnConfig) => {
    const isActive = tab._fontFilter === btnConfig.filter;
    const btn = filterGroup.createEl("button", {
      attr: {
        style: `
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        padding: 4px 10px;
                        border-radius: 4px;
                        border: 1px solid var(--background-modifier-border);
                        background: ${isActive ? "var(--interactive-accent)" : "var(--background-primary)"};
                        color: ${isActive ? "var(--text-on-accent)" : "var(--text-normal)"};
                        cursor: pointer;
                        font-size: 0.85em;
                        transition: all 0.2s ease;
                    `,
        "aria-label": btnConfig.label
      }
    });
    const iconEl = btn.createSpan({ attr: { style: "display: inline-flex; align-items: center;" } });
    import_obsidian4.setIcon(iconEl, btnConfig.icon);
    btn.createSpan({ text: btnConfig.label });
    filterButtonElements.push({ btn, filter: btnConfig.filter });
  });
  buttonContainerEl.createDiv({
    attr: { style: "width: 1px; height: 24px; background: var(--background-modifier-border);" }
  });
  const expandCollapseGroup = buttonContainerEl.createDiv({
    attr: { style: "display: flex; gap: 8px; align-items: center;" }
  });
  const expandAllBtn = expandCollapseGroup.createEl("button", {
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
      "aria-label": t("expandAll")
    }
  });
  const expandIcon = expandAllBtn.createSpan({ attr: { style: "display: inline-flex; align-items: center;" } });
  import_obsidian4.setIcon(expandIcon, "chevrons-down");
  expandAllBtn.createSpan({ text: t("expandAll") });
  tab._addEventListener(expandAllBtn, "click", () => {
    const allFamilies = fontListEl.querySelectorAll(".font-family-item");
    allFamilies.forEach((familyItem) => {
      const toggle = familyItem.querySelector(".font-family-toggle");
      const variants = familyItem.querySelector(".font-variants");
      if (toggle && variants && variants.style.display === "none") {
        toggle.setCssStyles({
          transform: "rotate(90deg)"
        });
        variants.setCssStyles({
          display: "block"
        });
      }
    });
  });
  const collapseAllBtn = expandCollapseGroup.createEl("button", {
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
      "aria-label": t("collapseAll")
    }
  });
  const collapseIcon = collapseAllBtn.createSpan({ attr: { style: "display: inline-flex; align-items: center;" } });
  import_obsidian4.setIcon(collapseIcon, "chevrons-up");
  collapseAllBtn.createSpan({ text: t("collapseAll") });
  tab._addEventListener(collapseAllBtn, "click", () => {
    const allFamilies = fontListEl.querySelectorAll(".font-family-item");
    allFamilies.forEach((familyItem) => {
      const toggle = familyItem.querySelector(".font-family-toggle");
      const variants = familyItem.querySelector(".font-variants");
      if (toggle && variants && variants.style.display !== "none") {
        toggle.setCssStyles({
          transform: "rotate(0deg)"
        });
        variants.setCssStyles({
          display: "none"
        });
      }
    });
  });
  const legendEl = containerEl.createDiv({
    attr: {
      style: "margin-bottom: 16px; padding: 12px; background: var(--background-secondary); border-radius: 8px; display: flex; justify-content: space-between; align-items: center; gap: 16px; font-size: 0.9em;"
    }
  });
  const legendsContainer = legendEl.createDiv({
    attr: { style: "display: flex; gap: 16px; flex-wrap: wrap; align-items: center;" }
  });
  legendsContainer.createDiv({
    text: t("fontFileStatus"),
    attr: { style: "font-weight: 600; color: var(--text-normal);" }
  });
  legendsContainer.createDiv({
    attr: { style: "width: 1px; height: 20px; background: var(--background-modifier-border);" }
  });
  const legends = [
    { icon: "check", color: "var(--color-green)", text: t("legendConverted") },
    { icon: "circle", color: "var(--text-muted)", text: t("legendNotConverted") },
    { icon: "check", color: "var(--interactive-accent)", text: t("legendCachedOnly") },
    { icon: "help-circle", color: "var(--text-error)", text: t("legendNotExist") }
  ];
  legends.forEach((legend) => {
    const item = legendsContainer.createDiv({
      attr: { style: "display: flex; align-items: center; gap: 6px;" }
    });
    const iconEl = item.createSpan({ attr: { style: `color: ${legend.color};` } });
    import_obsidian4.setIcon(iconEl, legend.icon);
    item.createSpan({ text: legend.text });
  });
  const rescanBtn = legendEl.createEl("button", {
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
      "aria-label": t("rescanFonts") || "重新扫描"
    }
  });
  const rescanIcon = rescanBtn.createSpan({ attr: { style: "display: inline-flex; align-items: center;" } });
  import_obsidian4.setIcon(rescanIcon, "rotate-cw");
  rescanBtn.createSpan({ text: t("rescanFonts") || "重新扫描" });
  tab._addEventListener(rescanBtn, "click", async () => {
    rescanBtn.disabled = true;
    rescanBtn.setCssStyles({
      opacity: "0.5"
    });
    await tab.plugin.scanFonts();
    new import_obsidian4.Notice(t("fontsRescanned") || "✓ 字体已重新扫描");
    tab.display();
  });
  const fontListEl = containerEl.createDiv({
    attr: {
      style: "margin: 10px 0; padding: 10px; background: var(--background-secondary); border-radius: 8px; max-height: 400px; overflow-y: auto;"
    }
  });
  filterButtonElements.forEach(({ btn, filter }) => {
    tab._addEventListener(btn, "click", () => {
      tab._fontFilter = filter;
      fontListEl.empty();
      if (tab.plugin.settings.availableFonts.length === 0) {
        fontListEl.createEl("div", {
          text: t("notFoundFontFamily"),
          attr: { style: "color: var(--text-muted); font-size: 0.9em; text-align: center; padding: 20px;" }
        });
      } else {
        tab.renderFontFamilies(fontListEl, tab._fontFilter);
      }
      filterButtonElements.forEach(({ btn: button, filter: f }) => {
        const isActive = tab._fontFilter === f;
        button.setCssStyles({
          background: isActive ? "var(--interactive-accent)" : "var(--background-primary)",
          color: isActive ? "var(--text-on-accent)" : "var(--text-normal)"
        });
      });
    });
  });
  if (tab.plugin.settings.availableFonts.length === 0) {
    fontListEl.createEl("div", {
      text: t("notFoundFontFamily"),
      attr: { style: "color: var(--text-muted); font-size: 0.9em; text-align: center; padding: 20px;" }
    });
  } else {
    tab.renderFontFamilies(fontListEl, tab._fontFilter);
  }
  const fontOperationsEl = containerEl.createDiv({
    attr: {
      style: "display: flex; gap: 12px; margin: 16px 0;"
    }
  });
  const importBtn = fontOperationsEl.createEl("button", {
    text: t("importFont"),
    attr: {
      style: "flex: 1; padding: 12px; cursor: pointer;",
      class: "mod-cta"
    }
  });
  tab._addEventListener(importBtn, "click", () => {
    const modal = new FontImportModal(tab.plugin.app, tab.plugin, async (files) => {
      importBtn.disabled = true;
      importBtn.textContent = t("importing") || "导入中...";
      try {
        await tab.plugin.importFontsFromFiles(files);
        new import_obsidian4.Notice(t("importedFonts", { count: files.length }));
        await tab.plugin.scanFonts();
        tab._debouncedDisplay();
      } catch (error) {
        console.error("[Local Font Loader] Import failed:", error);
        new import_obsidian4.Notice(t("importError") || "导入失败");
      } finally {
        importBtn.disabled = false;
        importBtn.textContent = t("importFont");
      }
    });
    modal.open();
  });
  const convertBtn = fontOperationsEl.createEl("button", {
    text: t("convertAllFonts"),
    attr: {
      style: "flex: 1; padding: 12px; cursor: pointer;"
    }
  });
  tab._addEventListener(convertBtn, "click", async () => {
    convertBtn.disabled = true;
    convertBtn.textContent = t("converting") || "转换中...";
    await tab.plugin.convertAllFonts();
    new import_obsidian4.Notice(t("allFontsConverted") || "✓ 所有字体已转换");
    tab.display();
  });
}

// src/ui/settings/fallback.ts
var import_obsidian5 = require("obsidian");
function renderFallbackSection(tab, containerEl) {
  containerEl.createEl("h3", { text: t("headerFallback") });
  new import_obsidian5.Setting(containerEl).setName(t("deleteUnusedFonts")).setDesc(t("deleteUnusedFontsDesc")).addButton((btn) => btn.setButtonText(t("deleteUnusedFonts")).setWarning().onClick(async () => {
    const unusedFonts = tab._getUnusedFonts();
    if (unusedFonts.length === 0) {
      new import_obsidian5.Notice(t("noUnusedFonts"));
      return;
    }
    showConfirmDialog(tab.plugin.app, t("confirmDelete"), t("confirmDeleteUnusedFonts").replace("{count}", unusedFonts.length), async () => {
      await tab.deleteUnusedFonts();
    }, true);
  }));
  new import_obsidian5.Setting(containerEl).setName(t("clearCache")).setDesc(t("clearCacheDesc")).addButton((btn) => btn.setButtonText(t("clearCache")).setWarning().onClick(async () => {
    await tab.plugin.clearCache();
    tab.display();
  }));
  new import_obsidian5.Setting(containerEl).setName(t("applyNow")).setDesc(t("applyNowDesc")).addButton((btn) => btn.setButtonText(t("applyFonts")).setCta().onClick(async () => {
    await tab.plugin.applyFonts();
    new import_obsidian5.Notice(t("fontsApplied"));
  }));
}

// src/ui/settings-tab.ts
class FontManagerSettingTab extends import_obsidian6.PluginSettingTab {
  plugin;
  _markdownComponents = [];
  _eventListeners = [];
  _displayDebounceTimer = null;
  _displayDebounceDelay = 300;
  _isVisible = false;
  _settingsChangedHandler;
  _activePresetId = "default-preset";
  _fontFilter = "all";
  _newPresetNameInput = null;
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
    this._eventListeners = [];
    this._displayDebounceTimer = null;
    this._displayDebounceDelay = 300;
    this._isVisible = false;
    this._settingsChangedHandler = () => {
      if (!this._isVisible)
        return;
      this._debouncedDisplay();
    };
    this.plugin.registerEvent(this.plugin.app.workspace.on("local-font-loader:settings-changed", this._settingsChangedHandler));
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
    this._markdownComponents.forEach((component) => component.unload());
    this._markdownComponents = [];
  }
  _renderMarkdown(el, markdown) {
    const component = new import_obsidian6.Component;
    component.load();
    this._markdownComponents.push(component);
    import_obsidian6.MarkdownRenderer.render(this.app, markdown, el, "", component);
  }
  _debouncedDisplay() {
    if (this._displayDebounceTimer) {
      window.clearTimeout(this._displayDebounceTimer);
    }
    this._displayDebounceTimer = window.setTimeout(() => {
      this.display();
      this._displayDebounceTimer = null;
    }, this._displayDebounceDelay);
  }
  _isLatinFont(fontName) {
    const lowerName = fontName.toLowerCase();
    const nonLatinKeywords = [
      "思源",
      "noto sans cjk",
      "noto serif cjk",
      "source han",
      "微软雅黑",
      "microsoft yahei",
      "宋体",
      "simsun",
      "黑体",
      "simhei",
      "楷体",
      "kaiti",
      "方正",
      "fangzheng",
      "源",
      "genkai",
      "meiryo",
      "yu gothic",
      "hiragino",
      "msmincho",
      "msgothic",
      "nanum",
      "malgun",
      "batang",
      "dotum",
      "gulim",
      "arabic",
      "nastaliq",
      "kufi",
      "devanagari",
      "thai",
      "hebrew"
    ];
    if (nonLatinKeywords.some((keyword) => lowerName.includes(keyword))) {
      return false;
    }
    const latinKeywords = [
      "times",
      "arial",
      "helvetica",
      "georgia",
      "verdana",
      "courier",
      "garamond",
      "palatino",
      "century",
      "cambria",
      "calibri",
      "latin",
      "roman",
      "serif",
      "sans"
    ];
    if (latinKeywords.some((keyword) => lowerName.includes(keyword))) {
      return true;
    }
    return true;
  }
  display() {
    this._isVisible = true;
    this._cleanupEventListeners();
    const { containerEl } = this;
    const scrollParent = containerEl.closest(".vertical-tab-content");
    const savedScrollTop = scrollParent ? scrollParent.scrollTop : 0;
    containerEl.empty();
    new import_obsidian6.Setting(containerEl).setName(t("pluginName")).setHeading();
    const overrideInfoCallout = containerEl.createDiv({ cls: "callout", attr: { "data-callout": "info" } });
    const overrideInfoTitle = overrideInfoCallout.createDiv({ cls: "callout-title" });
    const overrideInfoIcon = overrideInfoTitle.createDiv({ cls: "callout-icon" });
    import_obsidian6.setIcon(overrideInfoIcon, "info");
    overrideInfoTitle.createDiv({ cls: "callout-title-inner", text: t("overrideSystemSettingsTitle") });
    const overrideInfoContent = overrideInfoCallout.createDiv({ cls: "callout-content" });
    overrideInfoContent.createEl("p", { text: t("overrideSystemSettingsContent") });
    const warningCallout = containerEl.createDiv({ cls: "callout", attr: { "data-callout": "warning" } });
    const warningTitle = warningCallout.createDiv({ cls: "callout-title" });
    const warningIcon = warningTitle.createDiv({ cls: "callout-icon" });
    import_obsidian6.setIcon(warningIcon, "alert-triangle");
    warningTitle.createDiv({ cls: "callout-title-inner", text: t("performanceWarningTitle") });
    const warningContent = warningCallout.createDiv({ cls: "callout-content" });
    warningContent.createEl("p", { text: t("performanceWarningContent") });
    renderDeviceAndPresetSection(this, containerEl);
    renderDirectoryAndApplicationSection(this, containerEl);
    renderFontStatusSection(this, containerEl);
    renderFallbackSection(this, containerEl);
    if (scrollParent && savedScrollTop > 0) {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          scrollParent.scrollTop = savedScrollTop;
        });
      });
    }
  }
  addLatinFontOptions(containerEl, activePreset) {
    const exampleCalloutEl = containerEl.createDiv({ attr: { style: "margin: 16px 0;" } });
    let exampleMarkdown = `> [!example] ${t("latinFontInfo")}
> ${t("latinFontInfoDesc")}`;
    if (isLatinScriptLocale()) {
      exampleMarkdown += `
>
> ${t("latinFontInfoDescForLatinUsers")}`;
    }
    this._renderMarkdown(exampleCalloutEl, exampleMarkdown);
    new import_obsidian6.Setting(containerEl).setName(t("latinFontEnabled")).setDesc(t("latinFontEnabledDesc")).addToggle((toggle) => toggle.setValue(activePreset.latinFontEnabled).onChange(async (value) => {
      activePreset.latinFontEnabled = value;
      await this.plugin.saveSettings();
      await this.plugin.applyFonts();
      this.display();
    }));
    if (activePreset.latinFontEnabled) {
      new import_obsidian6.Setting(containerEl).setName(t("latinFont")).setDesc(t("latinFontDesc")).addDropdown((dropdown) => {
        dropdown.addOption("", t("systemDefault"));
        const uniqueFamilies = new Set;
        this.plugin.settings.availableFonts.forEach((font) => {
          const familyName = font.familyName || font.name;
          uniqueFamilies.add(familyName);
        });
        const allFamilies = Array.from(uniqueFamilies).sort();
        const latinFamilies = allFamilies.filter((name) => name.toLowerCase().includes("times") || name.toLowerCase().includes("latin"));
        const otherFamilies = allFamilies.filter((name) => !latinFamilies.includes(name));
        if (latinFamilies.length > 0) {
          dropdown.addOption("", t("recommendedLatinFontsLabel"));
          latinFamilies.forEach((familyName) => {
            const familyFonts = this.plugin.settings.availableFonts.filter((f) => (f.familyName || f.name) === familyName);
            const allConverted = familyFonts.every((f) => f.hasB64);
            const variantCount = familyFonts.length;
            const label = allConverted ? `${familyName} ✓ (${variantCount})` : `${familyName} (${variantCount})`;
            dropdown.addOption(familyName, label);
          });
        }
        if (otherFamilies.length > 0) {
          dropdown.addOption("", t("otherFontsLabel"));
          otherFamilies.forEach((familyName) => {
            const familyFonts = this.plugin.settings.availableFonts.filter((f) => (f.familyName || f.name) === familyName);
            const allConverted = familyFonts.every((f) => f.hasB64);
            const variantCount = familyFonts.length;
            const label = allConverted ? `${familyName} ✓ (${variantCount})` : `${familyName} (${variantCount})`;
            dropdown.addOption(familyName, label);
          });
        }
        dropdown.setValue(activePreset.fonts.latin);
        dropdown.onChange(async (value) => {
          activePreset.fonts.latin = value;
          await this.plugin.saveSettings();
          await this.plugin.applyFonts();
          window.requestAnimationFrame(() => {
            this.display();
          });
        });
      });
      if (activePreset.fonts.latin) {
        const latinFont = activePreset.fonts.latin;
        const selectedFonts = this.plugin.settings.availableFonts.filter((f) => (f.familyName || f.name) === latinFont);
        const hasItalic = selectedFonts.some((f) => f.variantType === "italic");
        const hasBold = selectedFonts.some((f) => f.variantType === "bold");
        const hasBoldItalic = selectedFonts.some((f) => f.variantType === "bolditalic");
        const missing = [];
        if (!hasItalic)
          missing.push("Italic");
        if (!hasBold)
          missing.push("Bold");
        if (!hasBoldItalic)
          missing.push("Bold Italic");
        if (missing.length > 0) {
          const warningCalloutEl = containerEl.createDiv({
            attr: { style: "margin: 8px 0 16px 0;" }
          });
          const missingList = missing.join(", ");
          const warningMarkdown = `> [!warning] ${t("missingVariantTitle")}
> ${t("missingVariantBody", { latinFont, missingList })}`;
          this._renderMarkdown(warningCalloutEl, warningMarkdown);
        }
      }
      const scopes = [
        { key: "letters", name: "Letters", desc: "A-Z, a-z" },
        { key: "numbers", name: "Numbers", desc: "0-9" },
        { key: "punctuation", name: "Punctuation", desc: t("punctuationDesc") },
        { key: "symbols", name: "Symbols", desc: t("symbolsDesc") }
      ];
      scopes.forEach((scope) => {
        new import_obsidian6.Setting(containerEl).setName(scope.name).setDesc(scope.desc).addToggle((toggle) => toggle.setValue(activePreset.latinFontScope?.[scope.key] ?? true).onChange(async (value) => {
          if (!activePreset.latinFontScope) {
            activePreset.latinFontScope = { letters: true, numbers: true, punctuation: true, symbols: true };
          }
          activePreset.latinFontScope[scope.key] = value;
          await this.plugin.saveSettings();
          await this.plugin.applyFonts();
        }));
      });
      new import_obsidian6.Setting(containerEl).setName(t("latinFontForUI")).setDesc(t("latinFontForUIDesc")).addToggle((toggle) => toggle.setValue(this.plugin.settings.latinFontForUI ?? false).onChange(async (value) => {
        this.plugin.settings.latinFontForUI = value;
        await this.plugin.saveSettings();
        await this.plugin.applyFonts();
      }));
    }
  }
  addFileTitleOption(containerEl, activePreset) {
    const headingFontValue = activePreset.fonts.heading;
    if (headingFontValue === "use-text-font") {
      return;
    }
    new import_obsidian6.Setting(containerEl).setName(t("headingApplyToFileTitle")).setDesc(t("headingApplyToFileTitleDesc")).addToggle((toggle) => toggle.setValue(activePreset.headingApplyToFileTitle || false).onChange(async (value) => {
      activePreset.headingApplyToFileTitle = value;
      await this.plugin.saveSettings();
      await this.plugin.applyFonts();
    }));
  }
  renderFontFamilies(containerEl, filter = "all") {
    const familiesMap = new Map;
    this.plugin.settings.availableFonts.forEach((font) => {
      const familyName = font.familyName || font.name;
      if (!familiesMap.has(familyName)) {
        familiesMap.set(familyName, []);
      }
      familiesMap.get(familyName).push(font);
    });
    const filteredFamilies = Array.from(familiesMap.entries()).filter(([familyName, fonts]) => {
      if (filter === "all") {
        return true;
      } else if (filter === "converted") {
        return fonts.some((f) => f.hasB64);
      } else if (filter === "cachedOnly") {
        return fonts.some((f) => f.hasB64 && !this.plugin._getFontExists(f));
      } else if (filter === "notConverted") {
        return fonts.some((f) => !f.hasB64);
      } else if (filter === "notExist") {
        return fonts.some((f) => !this.plugin._getFontExists(f));
      }
      return true;
    });
    if (filteredFamilies.length === 0) {
      let emptyMessage = t("noConvertedFonts") || "没有已转换的字体";
      if (filter === "notConverted") {
        emptyMessage = t("noNotConvertedFonts") || "没有未转换的字体";
      } else if (filter === "notExist") {
        emptyMessage = t("noNotExistFonts") || "没有缺失的字体";
      } else if (filter === "cachedOnly") {
        emptyMessage = t("noCachedOnlyFonts") || "没有仅缓存的字体";
      }
      containerEl.createEl("div", {
        text: emptyMessage,
        attr: { style: "color: var(--text-muted); font-size: 0.9em; text-align: center; padding: 20px;" }
      });
      return;
    }
    for (const [familyName, fonts] of filteredFamilies) {
      const familyEl = containerEl.createDiv({
        cls: "font-family-item",
        attr: {
          style: "margin-bottom: 8px; border: 1px solid var(--background-modifier-border); border-radius: 6px; overflow: hidden;"
        }
      });
      const headerEl = familyEl.createDiv({
        attr: {
          style: "padding: 12px; background: var(--background-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; user-select: none;"
        }
      });
      const leftEl = headerEl.createDiv({
        attr: { style: "display: flex; align-items: center; gap: 12px; flex: 1;" }
      });
      const expandIcon = leftEl.createSpan({
        cls: "font-family-toggle",
        attr: {
          style: "display: inline-flex; align-items: center; transition: transform 0.2s ease;",
          "aria-label": t("expandCollapse")
        }
      });
      import_obsidian6.setIcon(expandIcon, "chevron-right");
      leftEl.createSpan({
        text: familyName,
        attr: { style: "font-weight: 600; font-family: var(--font-monospace);" }
      });
      const variantsEl = familyEl.createDiv({
        cls: "font-variants",
        attr: {
          style: "display: none; padding: 8px; background: var(--background-secondary);"
        }
      });
      let expanded = false;
      this._addEventListener(headerEl, "click", () => {
        expanded = !expanded;
        variantsEl.setCssStyles({
          display: expanded ? "block" : "none"
        });
        expandIcon.setCssStyles({
          transform: expanded ? "rotate(90deg)" : "rotate(0deg)"
        });
      });
      fonts.forEach((font) => {
        const variantEl = variantsEl.createDiv({
          attr: {
            style: "padding: 8px; margin: 4px 0; background: var(--background-primary); border-radius: 4px; display: flex; align-items: center; justify-content: space-between;"
          }
        });
        const infoEl = variantEl.createDiv({
          attr: { style: "display: flex; align-items: center; gap: 12px; flex: 1;" }
        });
        let iconColor, iconName;
        if (!this.plugin._getFontExists(font)) {
          if (font.hasB64) {
            iconColor = "var(--interactive-accent)";
            iconName = "check";
          } else {
            iconColor = "var(--text-error)";
            iconName = "help-circle";
          }
        } else {
          if (font.hasB64) {
            iconColor = "var(--color-green)";
            iconName = "check";
          } else {
            iconColor = "var(--text-muted)";
            iconName = "circle";
          }
        }
        const statusIconEl = infoEl.createSpan({
          attr: { style: `color: ${iconColor};` }
        });
        import_obsidian6.setIcon(statusIconEl, iconName);
        const variantLabels = {
          regular: "Regular",
          italic: "Italic",
          bold: "Bold",
          bolditalic: "Bold Italic"
        };
        const variantLabel = variantLabels[font.variantType] || "Unknown";
        infoEl.createSpan({
          text: variantLabel,
          attr: { style: "font-family: var(--font-monospace); font-size: 0.9em;" }
        });
        const actionsEl = variantEl.createDiv({
          attr: { style: "display: flex; gap: 4px;" }
        });
        const convertBtn = actionsEl.createEl("button", {
          attr: {
            style: "padding: 4px 8px; cursor: pointer; display: inline-flex; align-items: center;",
            title: t("reconvertFont"),
            "aria-label": t("reconvertFont")
          }
        });
        import_obsidian6.setIcon(convertBtn, "refresh-cw");
        this._addEventListener(convertBtn, "click", async () => {
          await this.convertSingleFont(font);
          this.display();
        });
        const deleteBtn = actionsEl.createEl("button", {
          attr: {
            style: "padding: 4px 8px; cursor: pointer; display: inline-flex; align-items: center;",
            title: t("deleteThisFont"),
            "aria-label": t("deleteThisFont")
          }
        });
        import_obsidian6.setIcon(deleteBtn, "trash-2");
        this._addEventListener(deleteBtn, "click", async () => {
          showConfirmDialog(this.plugin.app, t("confirmDelete"), t("confirmDeleteFont").replace("{fontName}", font.name), async () => {
            await this.deleteSingleFont(font);
            this.display();
          }, true);
        });
      });
    }
  }
  async convertSingleFont(font) {
    try {
      this.plugin._log(`[Local Font Loader] Converting ${font.name}...`);
      const arrayBuffer = await this.plugin.app.vault.adapter.readBinary(font.path);
      const base64 = this.plugin.arrayBufferToBase64(arrayBuffer);
      const { css: singleFontCss } = this.plugin._buildFontFaceCss(font, base64, this.plugin._getDeviceFontContext());
      const cachePath = `${this.plugin.settings.b64OutputDir}/${font.name}.css`;
      await this.plugin.app.vault.adapter.write(cachePath, singleFontCss);
      font.hasB64 = true;
      font.b64Path = cachePath;
      await this.plugin.saveSettings();
      this.plugin._log(`[Local Font Loader] ${font.name} Conversion complete`);
      new import_obsidian6.Notice(`✓ ${font.name} Conversion complete`);
    } catch (error) {
      this.plugin._logError(`[Local Font Loader] Conversion failed: ${font.name}`, error);
      new import_obsidian6.Notice(`⚠️ Conversion failed: ${error.message}`);
    }
  }
  async deleteSingleFont(font) {
    try {
      try {
        await this.plugin.app.vault.adapter.remove(font.path);
      } catch (err) {
        this.plugin._log(`[Local Font Loader] 源文件不存在，跳过删除: ${font.path}`);
      }
      if (font.b64Path) {
        try {
          await this.plugin.app.vault.adapter.remove(font.b64Path);
        } catch {}
      }
      const index = this.plugin.settings.availableFonts.indexOf(font);
      if (index > -1) {
        this.plugin.settings.availableFonts.splice(index, 1);
      }
      await this.plugin.saveSettings();
      new import_obsidian6.Notice(t("deletedFont", { fontName: font.name }));
    } catch (error) {
      this.plugin._logError(`[Local Font Loader] 删除失败: ${font.name}`, error);
      new import_obsidian6.Notice(t("deleteFailedError", { error: error.message }));
    }
  }
  _getUnusedFonts() {
    const usedFontValues = new Set;
    const presets = this.plugin.settings.presets || [];
    for (const preset of presets) {
      const fontsConfig = preset.fonts || {};
      for (const value of Object.values(fontsConfig)) {
        if (value && value !== "use-text-font" && value !== "use-ui-font") {
          usedFontValues.add(value);
        }
      }
    }
    const availableFonts = this.plugin.settings.availableFonts || [];
    return availableFonts.filter((font) => !usedFontValues.has(font.familyName) && !usedFontValues.has(font.name));
  }
  async deleteUnusedFonts() {
    const unusedFonts = this._getUnusedFonts();
    if (unusedFonts.length === 0) {
      new import_obsidian6.Notice(t("noUnusedFonts"));
      return;
    }
    this.plugin._log(`[Local Font Loader] Starting to delete unused fonts (${unusedFonts.length} fonts)...`);
    let deleted = 0;
    try {
      for (const font of unusedFonts) {
        try {
          try {
            await this.app.vault.adapter.remove(font.path);
          } catch (err) {
            this.plugin._log(`[Local Font Loader] 源文件不存在，跳过删除: ${font.path}`);
          }
          if (font.hasB64 && font.b64Path) {
            try {
              await this.app.vault.adapter.remove(font.b64Path);
            } catch {}
          }
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
      new import_obsidian6.Notice(t("deletedUnusedFonts", { count: deleted }));
      this.plugin._log(`[Local Font Loader] Deleted ${deleted} unused fonts`);
      this.display();
    } catch (error) {
      this.plugin._logError("[Local Font Loader] 批量删除失败:", error);
      new import_obsidian6.Notice(t("deleteError"));
    }
  }
  hide() {
    this._isVisible = false;
    if (this._displayDebounceTimer) {
      window.clearTimeout(this._displayDebounceTimer);
      this._displayDebounceTimer = null;
    }
    this._cleanupEventListeners();
    super.hide();
  }
}

// src/plugin.ts
var browserNavigator = globalThis.navigator;
var LEGACY_SNIPPET = "local-font-loader";

class LocalFontLoaderPlugin extends import_obsidian7.Plugin {
  currentDeviceId;
  _mathFontSnapshot = null;
  _adoptedSheets = new Map;
  _appliedCss = new Map;
  _snippetCss = new Map;
  _snippetEnabled = false;
  _snippetWritten = false;
  _snippetSync = Promise.resolve();
  _legacySnippetChecked = false;
  _isScanning = false;
  _isSaving = false;
  _dataReloadTimer = null;
  _logEnabled = false;
  _log(...args) {
    if (this._logEnabled) {
      console.log(...args);
    }
  }
  _logError(...args) {
    console.error(...args);
  }
  _settingsEqual(a, b) {
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch (error) {
      this._logError("[Local Font Loader] _settingsEqual 比较失败:", error);
      return false;
    }
  }
  _saveSettingsTimer = null;
  _debouncedSaveSettings() {
    if (this._saveSettingsTimer) {
      window.clearTimeout(this._saveSettingsTimer);
    }
    this._saveSettingsTimer = window.setTimeout(() => {
      this.saveData(this.settings);
      this._saveSettingsTimer = null;
    }, 300);
  }
  getUnicodeRange(scope) {
    const ranges = [];
    if (scope?.letters !== false) {
      ranges.push("U+0041-005A", "U+0061-007A");
    }
    if (scope?.numbers !== false) {
      ranges.push("U+0030-0039");
    }
    if (scope?.punctuation !== false) {
      ranges.push("U+0020-002F", "U+003A-0040", "U+005B-0060", "U+007B-007E");
    }
    if (scope?.symbols !== false) {
      ranges.push("U+00A0-00FF");
    }
    return ranges.length > 0 ? ranges.join(", ") : null;
  }
  _escapeCssString(str) {
    return String(str).replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/'/g, "\\'");
  }
  _buildCodeFontRules(fontFamily) {
    const fontStack = `"${this._escapeCssString(fontFamily)}", monospace`;
    const PRIORITY_SCOPE = ":root body";
    const emitRule = (comment, selectors, extraDeclarations = "") => {
      let css2 = `/* ${comment} */
`;
      css2 += selectors.map((selector) => `${PRIORITY_SCOPE} ${selector}`).join(`,
`) + ` {
`;
      css2 += `  font-family: ${fontStack} !important;
`;
      if (extraDeclarations) {
        css2 += extraDeclarations;
      }
      css2 += `}

`;
      return css2;
    };
    let css = `/* Code Block Font (High Priority) */
`;
    css += emitRule("Inline code", [
      ".markdown-preview-view.markdown-rendered code:not(pre code)",
      ".markdown-preview-view code:not(pre code)",
      ".markdown-rendered code:not(pre code)",
      ".markdown-source-view.mod-cm6.cm-s-obsidian .cm-inline-code",
      ".markdown-source-view.mod-cm6 .cm-inline-code",
      ".cm-inline-code",
      "code:not(pre code)"
    ]);
    css += emitRule("Code blocks", [
      ".markdown-preview-view.markdown-rendered pre code",
      ".markdown-preview-view pre code",
      ".markdown-preview-view pre",
      ".markdown-source-view.mod-cm6.cm-s-obsidian .cm-line.HyperMD-codeblock",
      ".markdown-source-view.mod-cm6 .cm-line.HyperMD-codeblock",
      ".markdown-source-view.mod-cm6.cm-s-obsidian .cm-line:has(.cm-hmd-codeblock)",
      ".markdown-source-view.mod-cm6 .cm-line:has(.cm-hmd-codeblock)",
      ".HyperMD-codeblock",
      ".cm-s-obsidian pre.HyperMD-codeblock",
      "pre code",
      "pre"
    ]);
    css += emitRule("Code block line numbers", [
      ".code-styler-line-number",
      ".cm-gutter.cm-lineNumbers",
      ".cm-lineNumbers .cm-gutterElement"
    ]);
    return css;
  }
  _buildUiFontRules(uiFontFamily) {
    const UI_SELECTORS = [
      ".workspace",
      ".workspace-leaf-content",
      ".workspace-tab-header",
      ".workspace-tab-header-container",
      ".nav-file-title",
      ".nav-folder-title",
      ".tree-item-inner",
      ".sidebar",
      ".sidebar-content",
      ".view-header-title-container",
      ".view-header-title-parent",
      ".view-header-breadcrumb",
      ".view-header-breadcrumb-separator",
      ".view-header-title",
      ".markdown-preview-view .inline-title",
      ".markdown-source-view .inline-title",
      ".inline-title",
      ".metadata-container",
      ".metadata-properties-heading",
      ".metadata-container .metadata-properties-heading",
      ".metadata-property",
      ".metadata-container .metadata-property",
      ".metadata-property-key",
      ".metadata-container .metadata-property-key",
      ".metadata-property-key-input",
      ".metadata-container .metadata-property-key-input",
      ".metadata-property-value",
      ".metadata-container .metadata-property-value",
      ".metadata-input-longtext",
      ".metadata-container .metadata-input-longtext",
      ".metadata-input-text",
      ".metadata-container .metadata-input-text",
      ".metadata-add-button",
      ".metadata-container .metadata-add-button",
      ".multi-select-pill",
      ".multi-select-pill-content",
      ".menu",
      ".menu-item",
      ".modal",
      ".modal-content",
      ".setting-item",
      ".setting-item-name",
      ".setting-item-description",
      ".notice",
      ".notice-container",
      ".tooltip",
      ".prompt",
      ".prompt-input",
      ".suggestion-container",
      ".suggestion-item",
      ".popover",
      ".hover-popover",
      ".cm-tooltip",
      ".cm-tooltip-autocomplete"
    ];
    let css = `/* UI Elements (High Priority) */
`;
    css += UI_SELECTORS.map((selector) => `body ${selector}`).join(`,
`) + `,
`;
    css += UI_SELECTORS.map((selector) => `body.is-mobile ${selector}`).join(`,
`) + ` {
`;
    css += `  font-family: ${uiFontFamily}, sans-serif !important;
`;
    css += `}

`;
    return css;
  }
  async onload() {
    this._log("[Local Font Loader] Plugin loading...");
    try {
      await this.loadSettings();
      this._log("[Local Font Loader] Settings loaded successfully");
      if (!this.settings.presets || this.settings.presets.length === 0) {
        console.error("[Local Font Loader] Critical: presets array is empty or undefined");
        throw new Error("Settings validation failed: presets missing");
      }
      const deviceId = await this._getOrCreateLocalDeviceId();
      this.currentDeviceId = deviceId;
      if (!this.settings.deviceNameMap) {
        this.settings.deviceNameMap = {};
      }
      if (!this.settings.deviceMeta) {
        this.settings.deviceMeta = {};
      }
      const deviceInfo = this._detectDeviceInfo();
      const previousMeta = this.settings.deviceMeta[deviceId];
      const metaChanged = !previousMeta || previousMeta.platform !== deviceInfo.platform || previousMeta.os !== deviceInfo.os || previousMeta.model !== deviceInfo.model || previousMeta.hostname !== deviceInfo.hostname || Object.keys(previousMeta).length !== Object.keys(deviceInfo).length;
      const isKnownDevice = Boolean(this.settings.deviceNameMap[deviceId]);
      const storedName = this.settings.deviceNameMap[deviceId];
      const generatedNameOutdated = isKnownDevice && this._isGeneratedDeviceName(storedName, previousMeta) && storedName !== this._getDefaultDeviceName(deviceInfo);
      if (!isKnownDevice) {
        this.settings.deviceMeta[deviceId] = { ...deviceInfo };
        this.settings.deviceNameMap[deviceId] = this._getDefaultDeviceName(deviceInfo);
        await this.saveSettings();
        this._log(`[Local Font Loader] New device registered: ${deviceId} (${this.settings.deviceNameMap[deviceId]})`);
      } else if (metaChanged || generatedNameOutdated) {
        this.settings.deviceMeta[deviceId] = { ...deviceInfo };
        if (generatedNameOutdated) {
          this.settings.deviceNameMap[deviceId] = this._getDefaultDeviceName(deviceInfo);
          this._log(`[Local Font Loader] Default device name refreshed: ${storedName} -> ${this.settings.deviceNameMap[deviceId]}`);
        }
        await this.saveSettings();
        this._log(`[Local Font Loader] Device metadata refreshed: ${deviceId}`);
      } else {
        this._log(`[Local Font Loader] Device recognized: ${deviceId}`);
      }
      await this._ensureDevicePreset();
      this._log("[Local Font Loader] Device preset ensured");
    } catch (error) {
      console.error("[Local Font Loader] Failed during initialization:", error);
    }
    this.addRibbonIcon("type", "Local Font Loader", () => {
      this.app.setting.open();
      this.app.setting.openTabById("local-font-loader");
    });
    this.addCommand({
      id: "open-settings",
      name: "Open Settings",
      callback: () => {
        this.app.setting.open();
        this.app.setting.openTabById("local-font-loader");
      }
    });
    this.addCommand({
      id: "reload-fonts",
      name: "Reload Fonts",
      callback: async () => {
        await this.applyFonts();
        new import_obsidian7.Notice("✓ Fonts reloaded");
      }
    });
    this.addCommand({
      id: "clear-font-cache",
      name: "Clear Font Cache",
      callback: async () => {
        await this.clearCache();
      }
    });
    this.addCommand({
      id: "rescan-fonts",
      name: "Rescan Fonts",
      callback: async () => {
        await this.scanFonts();
        new import_obsidian7.Notice("✓ Font list updated");
      }
    });
    this.addCommand({
      id: "convert-all-fonts",
      name: "Convert all fonts to Base64",
      callback: async () => {
        await this.convertAllFonts();
      }
    });
    this.addSettingTab(new FontManagerSettingTab(this.app, this));
    this.registerEvent(this.app.vault.on("modify", (file) => {
      if (file.path === `${this.manifest.dir}/data.json`) {
        this._log("[Local Font Loader] data.json modified, checking for content changes...");
        if (this._dataReloadTimer) {
          window.clearTimeout(this._dataReloadTimer);
        }
        this._dataReloadTimer = window.setTimeout(async () => {
          try {
            if (this._isSaving) {
              this._log("[Local Font Loader] Save in progress, skipping reload");
              return;
            }
            const data = await this.loadData();
            if (this._settingsEqual(data, this.settings)) {
              this._log("[Local Font Loader] data.json content unchanged, skipping reload");
              return;
            }
            await this.loadSettings();
            this._log("[Local Font Loader] Settings reloaded from data.json");
            if (this.settings.autoLoadOnStartup) {
              this._log("[Local Font Loader] Re-applying fonts after settings reload...");
              try {
                await this.applyFonts();
                this._log("[Local Font Loader] Fonts re-applied successfully");
              } catch (error) {
                console.error("[Local Font Loader] Failed to re-apply fonts:", error);
              }
            }
            this.app.workspace.trigger("local-font-loader:settings-changed");
          } catch (error) {
            this._logError("[Local Font Loader] Failed to reload settings from data.json:", error);
          }
        }, 500);
      }
    }));
    if (this.settings.availableFonts.length === 0) {
      this._log("[Local Font Loader] Font list is empty, scanning...");
      await this.scanFonts();
    }
    try {
      await this._refreshFontExistence();
      this._log("[Local Font Loader] Font existence check completed");
    } catch (error) {
      console.error("[Local Font Loader] Font existence check failed:", error);
    }
    if (this.settings.autoLoadOnStartup) {
      this._log("[Local Font Loader] Auto-loading fonts...");
      try {
        await this.applyFonts();
        this._log("[Local Font Loader] Fonts applied successfully");
      } catch (error) {
        console.error("[Local Font Loader] Failed to apply fonts:", error);
        new import_obsidian7.Notice("⚠️ Local Font Loader: 字体加载失败，请检查控制台日志", 5000);
      }
    } else {
      this._log("[Local Font Loader] Auto-load disabled, skipping font application");
    }
    this._log("[Local Font Loader] ✓ Plugin loaded");
  }
  onunload() {
    this._log("[Local Font Loader] Plugin unloading");
    if (this._saveSettingsTimer) {
      window.clearTimeout(this._saveSettingsTimer);
      this._saveSettingsTimer = null;
    }
    if (this._dataReloadTimer) {
      window.clearTimeout(this._dataReloadTimer);
      this._dataReloadTimer = null;
    }
    this.removeFontStyles();
    const presetStyle = document.getElementById("local-font-loader-preset-styles");
    if (presetStyle)
      presetStyle.remove();
  }
  async loadSettings() {
    const data = await this.loadData();
    const needsMigration = !data || !data.presets || data.presets.length === 0 || (() => {
      const defaultPreset = data.presets.find((p) => p.id === "default-preset");
      if (!defaultPreset)
        return true;
      const fonts = defaultPreset.fonts || {};
      const hasValidFonts = Object.values(fonts).some((v) => v && v.trim() !== "");
      return !hasValidFonts;
    })();
    if (data && needsMigration) {
      this._log("[Local Font Loader] 检测到配置需要迁移或修复，正在处理...");
      const defaultPreset = {
        id: "default-preset",
        name: "Default",
        targetDevices: [],
        fonts: data.fonts || {},
        latinFontEnabled: data.latinFontEnabled || false,
        latinFontScope: data.latinFontScope || {},
        headingApplyToFileTitle: data.headingApplyToFileTitle || false
      };
      data.presets = [defaultPreset];
      this._log("[Local Font Loader] ✓ 配置迁移完成");
    }
    if (data && data.deviceId !== undefined) {
      delete data.deviceId;
    }
    if (data && data.deviceName !== undefined) {
      delete data.deviceName;
    }
    if (data && !data.deviceFingerprints) {
      data.deviceFingerprints = {};
    }
    if (data && !data.deviceNameMap) {
      data.deviceNameMap = {};
    }
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
  _getDevicePreset() {
    const deviceId = this.currentDeviceId;
    let preset = this.settings.presets.find((p) => p.targetDevices.includes(deviceId));
    if (!preset) {
      preset = this.settings.presets.find((p) => p.id === "default-preset");
    }
    if (!preset) {
      preset = this.settings.presets[0];
    }
    return preset;
  }
  _getDeviceFontContext() {
    const devicePreset = this._getDevicePreset();
    return {
      fontsConfig: devicePreset?.fonts || {},
      latinFontEnabled: devicePreset?.latinFontEnabled || false,
      latinFontScope: devicePreset?.latinFontScope || {}
    };
  }
  async createPreset(name) {
    const defaultPreset = this.settings.presets.find((p) => p.id === "default-preset");
    const newPreset = {
      id: this._generateUUID(),
      name,
      targetDevices: [],
      fonts: defaultPreset ? JSON.parse(JSON.stringify(defaultPreset.fonts)) : { ui: "", text: "", heading: "", monospace: "", math: "", latin: "" },
      latinFontEnabled: defaultPreset ? defaultPreset.latinFontEnabled : false,
      latinFontScope: defaultPreset ? JSON.parse(JSON.stringify(defaultPreset.latinFontScope)) : { letters: true, numbers: true, punctuation: true, symbols: true },
      headingApplyToFileTitle: defaultPreset ? defaultPreset.headingApplyToFileTitle : false
    };
    this.settings.presets.push(newPreset);
    await this.saveSettings();
  }
  async renamePreset(presetId, newName) {
    const preset = this.settings.presets.find((p) => p.id === presetId);
    if (preset) {
      preset.name = newName;
      await this.saveSettings();
    }
  }
  async deletePreset(presetId) {
    if (presetId === "default-preset") {
      new import_obsidian7.Notice(t("cannotDeleteDefaultPreset"), 3000);
      return;
    }
    const preset = this.settings.presets.find((p) => p.id === presetId);
    if (!preset)
      return;
    this.settings.presets = this.settings.presets.filter((p) => p.id !== presetId);
    await this.saveSettings();
  }
  async assignDeviceToPreset(deviceId, targetPresetId) {
    this.settings.presets.forEach((preset) => {
      preset.targetDevices = preset.targetDevices.filter((id) => id !== deviceId);
    });
    const targetPreset = this.settings.presets.find((p) => p.id === targetPresetId);
    if (targetPreset) {
      const isGlobalPreset = targetPreset.id === "default-preset" && targetPreset.targetDevices.length === 0;
      if (!isGlobalPreset && !targetPreset.targetDevices.includes(deviceId)) {
        targetPreset.targetDevices.push(deviceId);
      }
    }
    await this.saveSettings();
    await this.applyFonts();
  }
  async copyPresetForDevice(sourcePresetId, newPresetName) {
    const sourcePreset = this.settings.presets.find((p) => p.id === sourcePresetId);
    if (!sourcePreset)
      return;
    const newPreset = {
      ...JSON.parse(JSON.stringify(sourcePreset)),
      id: this._generateUUID(),
      name: newPresetName,
      targetDevices: [this.currentDeviceId]
    };
    const isGlobalPreset = sourcePreset.id === "default-preset" && sourcePreset.targetDevices.length === 0;
    if (!isGlobalPreset) {
      sourcePreset.targetDevices = sourcePreset.targetDevices.filter((id) => id !== this.currentDeviceId);
    }
    this.settings.presets.push(newPreset);
    await this.saveSettings();
  }
  _generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === "x" ? r : r & 3 | 8;
      return v.toString(16);
    });
  }
  async removeDeviceFromPresets(deviceId) {
    this.settings.presets.forEach((preset) => {
      preset.targetDevices = preset.targetDevices.filter((id) => id !== deviceId);
    });
    if (this.settings.deviceNameMap && this.settings.deviceNameMap[deviceId]) {
      delete this.settings.deviceNameMap[deviceId];
    }
    if (this.settings.deviceMeta && this.settings.deviceMeta[deviceId]) {
      delete this.settings.deviceMeta[deviceId];
    }
    await this.saveSettings();
  }
  getPrunableDevices() {
    const boundDeviceIds = new Set;
    this.settings.presets.forEach((preset) => {
      (preset.targetDevices || []).forEach((id) => boundDeviceIds.add(id));
    });
    const prunable = [];
    Object.keys(this.settings.deviceNameMap || {}).forEach((deviceId) => {
      if (deviceId === this.currentDeviceId)
        return;
      if (boundDeviceIds.has(deviceId))
        return;
      prunable.push({ id: deviceId, name: this._getDeviceName(deviceId) });
    });
    return prunable;
  }
  async pruneUnboundDevices() {
    const prunable = this.getPrunableDevices();
    const nameMap = this.settings.deviceNameMap || {};
    prunable.forEach(({ id }) => {
      delete this.settings.deviceNameMap[id];
      if (this.settings.deviceMeta) {
        delete this.settings.deviceMeta[id];
      }
    });
    let orphanCount = 0;
    Object.keys(this.settings.deviceMeta || {}).forEach((id) => {
      if (!nameMap[id]) {
        delete this.settings.deviceMeta[id];
        orphanCount++;
      }
    });
    if (prunable.length > 0 || orphanCount > 0) {
      await this.saveSettings();
    }
    this._log(`[Local Font Loader] Pruned ${prunable.length} unbound device(s), ${orphanCount} orphaned metadata entr(ies)`);
    return prunable.length + orphanCount;
  }
  _getDeviceName(deviceId) {
    if (this.settings.deviceNameMap && this.settings.deviceNameMap[deviceId]) {
      return this.settings.deviceNameMap[deviceId];
    }
    return deviceId;
  }
  _getDevicePlatform(deviceId) {
    const meta = this.settings.deviceMeta && this.settings.deviceMeta[deviceId];
    if (meta && meta.platform) {
      return meta.platform;
    }
    if (this.settings.deviceFingerprints) {
      for (const [fingerprint, id] of Object.entries(this.settings.deviceFingerprints)) {
        if (id === deviceId) {
          return fingerprint.split("-")[0];
        }
      }
    }
    return "unknown";
  }
  async updateDeviceName(deviceId, newName) {
    const trimmedName = newName.trim();
    if (!trimmedName)
      return;
    if (!this.settings.deviceNameMap) {
      this.settings.deviceNameMap = {};
    }
    this.settings.deviceNameMap[deviceId] = trimmedName;
    await this.saveSettings();
  }
  async _getOrCreateLocalDeviceId() {
    const STORAGE_KEY = "local-font-loader-device-id";
    let storedId = null;
    try {
      storedId = this.app.loadLocalStorage(STORAGE_KEY);
    } catch (error) {
      console.error("[Local Font Loader] Failed to read device-local id:", error);
    }
    if (storedId && typeof storedId === "string") {
      if (this._sealLegacyEntries(storedId)) {
        await this.saveSettings();
        this._log(`[Local Font Loader] Legacy ledger sealed for held id: ${storedId}`);
      }
      return storedId;
    }
    const deviceId = await this._claimLegacyDeviceId() || this._generateUUID();
    try {
      this.app.saveLocalStorage(STORAGE_KEY, deviceId);
      const confirmed = this.app.loadLocalStorage(STORAGE_KEY);
      if (confirmed !== deviceId) {
        console.error(`[Local Font Loader] Device id did not persist (wrote ${deviceId}, read back ${confirmed}); this device may register again on the next launch.`);
      } else {
        this._log(`[Local Font Loader] Device id persisted: ${deviceId}`);
      }
    } catch (error) {
      console.error("[Local Font Loader] Failed to persist device-local id:", error);
    }
    return deviceId;
  }
  async _claimLegacyDeviceId() {
    const ledger = this.settings.deviceFingerprints;
    if (!ledger) {
      return null;
    }
    const fingerprint = this._generateDeviceFingerprint();
    const claimedId = ledger[fingerprint];
    if (!claimedId) {
      return null;
    }
    this._sealLegacyEntries(claimedId);
    await this.saveSettings();
    this._log(`[Local Font Loader] Legacy device id claimed and sealed: ${claimedId}`);
    return claimedId;
  }
  _sealLegacyEntries(deviceId) {
    const ledger = this.settings.deviceFingerprints;
    if (!ledger) {
      return false;
    }
    let changed = false;
    Object.keys(ledger).forEach((key) => {
      if (ledger[key] === deviceId) {
        delete ledger[key];
        changed = true;
      }
    });
    return changed;
  }
  _detectDeviceInfo() {
    const ua = browserNavigator.userAgent;
    const platform = import_obsidian7.Platform.isMobile ? "mobile" : "desktop";
    const hostname = this._getDesktopHostname();
    if (import_obsidian7.Platform.isIosApp || /iPhone|iPad|iPod/.test(ua)) {
      const isTablet = import_obsidian7.Platform.isTablet || /iPad/.test(ua);
      return {
        platform: "mobile",
        os: isTablet ? "ipados" : "ios",
        model: isTablet ? "iPad" : /iPod/.test(ua) ? "iPod" : "iPhone",
        hostname: ""
      };
    }
    if (/Android/.test(ua)) {
      const platformBlock = (ua.match(/\(([^)]*)\)/) || [])[1] || "";
      const segments = platformBlock.split(";").map((segment) => segment.trim());
      const androidIndex = segments.findIndex((segment) => /^Android\s/i.test(segment));
      let model = "";
      for (let i = androidIndex >= 0 ? androidIndex + 1 : 0;i < segments.length; i++) {
        const segment = segments[i];
        if (!segment) {
          continue;
        }
        if (/^wv$/i.test(segment)) {
          continue;
        }
        if (/^[a-z]{2}(-[A-Za-z]{2})?$/.test(segment)) {
          continue;
        }
        model = segment.replace(/\s*Build\/.*$/i, "").trim();
        break;
      }
      return {
        platform: "mobile",
        os: "android",
        model,
        hostname: ""
      };
    }
    const nodePlatform = this._getDesktopOsPlatform();
    if (nodePlatform === "win32") {
      return { platform, os: "windows", model: "", hostname };
    }
    if (nodePlatform === "darwin") {
      return { platform: "desktop", os: "macos", model: "", hostname };
    }
    if (nodePlatform) {
      return { platform: "desktop", os: "linux", model: "", hostname };
    }
    if (/Windows/.test(ua)) {
      return { platform, os: "windows", model: "", hostname };
    }
    if (/Mac OS X|Macintosh/.test(ua)) {
      return { platform: "desktop", os: "macos", model: "", hostname };
    }
    if (/Linux|X11/.test(ua)) {
      return { platform: "desktop", os: "linux", model: "", hostname };
    }
    return { platform, os: "unknown", model: "", hostname };
  }
  _getDesktopOsPlatform() {
    if (!import_obsidian7.Platform.isDesktopApp) {
      return null;
    }
    try {
      const process = window.process;
      return process?.platform ?? null;
    } catch (error) {
      console.error("[Local Font Loader] Could not read the desktop platform:", error);
      return null;
    }
  }
  _getDesktopHostname() {
    if (!import_obsidian7.Platform.isDesktopApp) {
      return "";
    }
    try {
      const nodeRequire = window.require;
      const os = nodeRequire?.("os");
      if (!os)
        return "";
      return String(os.hostname() || "").trim();
    } catch (error) {
      console.error("[Local Font Loader] Failed to read hostname:", error);
      return "";
    }
  }
  _isGeneratedDeviceName(name, meta) {
    if (!name) {
      return false;
    }
    if (/^(Desktop|Mobile)-(Linux|Windows|Mac|macOS|iOS|iPadOS|Android|Unknown)$/.test(name)) {
      return true;
    }
    if (meta && (name === meta.hostname || name === meta.model)) {
      return true;
    }
    return false;
  }
  _getDefaultDeviceName(deviceInfo) {
    const info = deviceInfo || this._detectDeviceInfo();
    if (info.hostname) {
      return info.hostname;
    }
    if (info.model) {
      return info.model;
    }
    const osLabels = {
      ios: "iOS",
      ipados: "iPadOS",
      android: "Android",
      windows: "Windows",
      macos: "Mac",
      linux: "Linux",
      unknown: "Unknown"
    };
    const osLabel = osLabels[info.os] || "Unknown";
    const platform = info.platform === "mobile" ? "Mobile" : "Desktop";
    return `${platform}-${osLabel}`;
  }
  _getDeviceOs(deviceId) {
    const meta = this.settings.deviceMeta && this.settings.deviceMeta[deviceId];
    return meta && meta.os ? meta.os : "unknown";
  }
  _getDeviceHostname(deviceId) {
    const meta = this.settings.deviceMeta && this.settings.deviceMeta[deviceId];
    return meta && meta.hostname ? meta.hostname : "";
  }
  _getDeviceModel(deviceId) {
    const meta = this.settings.deviceMeta && this.settings.deviceMeta[deviceId];
    return meta && meta.model ? meta.model : "";
  }
  _generateDeviceFingerprint() {
    const platform = import_obsidian7.Platform.isMobile ? "mobile" : "desktop";
    const ua = browserNavigator.userAgent;
    const features = [
      ua,
      `${screen.width}x${screen.height}`,
      `${screen.availWidth}x${screen.availHeight}`,
      new Date().getTimezoneOffset().toString(),
      browserNavigator.language,
      browserNavigator.hardwareConcurrency || "unknown"
    ];
    const hash = (str) => {
      let h = 0;
      for (let i = 0;i < str.length; i++) {
        h = (h << 5) - h + str.charCodeAt(i);
        h = h & h;
      }
      return Math.abs(h).toString(36);
    };
    const fingerprint = hash(features.join("|"));
    return `${platform}-${fingerprint}`;
  }
  async _ensureDevicePreset() {
    const deviceId = this.currentDeviceId;
    const devicePreset = this.settings.presets.find((p) => p.targetDevices.includes(deviceId));
    if (!devicePreset) {
      const defaultPreset = this.settings.presets.find((p) => p.id === "default-preset");
      if (!defaultPreset || defaultPreset.targetDevices.length > 0) {
        console.warn("[LocalFontLoader] Default preset missing or corrupted, recreating...");
        const carryOver = this.settings.presets?.[0];
        const newDefaultPreset = {
          id: "default-preset",
          name: "Default",
          targetDevices: [],
          fonts: carryOver?.fonts || DEFAULT_SETTINGS.presets[0].fonts,
          latinFontEnabled: carryOver?.latinFontEnabled ?? false,
          latinFontScope: carryOver?.latinFontScope ?? { letters: true, numbers: true, punctuation: true, symbols: true },
          headingApplyToFileTitle: carryOver?.headingApplyToFileTitle ?? false
        };
        this.settings.presets.unshift(newDefaultPreset);
        await this.saveSettings();
      }
    }
  }
  async importFontsFromFiles(files) {
    this._log(`[Local Font Loader] Starting to import ${files.length} font files...`);
    let imported = 0;
    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const targetDir = `${this.settings.fontSourceDir}/Imported`;
        const targetPath = `${targetDir}/${file.name}`;
        try {
          await this.app.vault.adapter.mkdir(targetDir);
        } catch {}
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
    if (this._isScanning) {
      this._log("[Local Font Loader] Scan already in progress, ignoring duplicate call");
      return;
    }
    this._isScanning = true;
    try {
      this._log("[Local Font Loader] Scanning font family folders...");
      try {
        await this.app.vault.adapter.mkdir(this.settings.fontSourceDir);
      } catch {}
      const dirList = await this.app.vault.adapter.list(this.settings.fontSourceDir);
      const cacheFolderName = this.settings.b64OutputDir.split("/").filter(Boolean).pop();
      const fontDirs = dirList.folders.filter((dir) => {
        const basename = dir.split("/").pop();
        return basename !== cacheFolderName;
      });
      this._log(`[Local Font Loader] Found ${fontDirs.length} font family folders`);
      let b64Files = [];
      try {
        const b64List = await this.app.vault.adapter.list(this.settings.b64OutputDir);
        b64Files = b64List.files.map((f) => {
          const basename = f.split("/").pop().replace(".css", "");
          return basename;
        });
        this._log(`[Local Font Loader] Found ${b64Files.length} cached fonts`);
      } catch (err) {
        this._log("[Local Font Loader] B64 cache directory does not exist, will be created during conversion");
      }
      const previousFonts = this.settings.availableFonts;
      this.settings.availableFonts = [];
      this.settings.fontFamilies = [];
      const fontMap = new Map;
      for (const fontDir of fontDirs) {
        try {
          const folderName = fontDir.split("/").pop();
          const metadataPath = `${fontDir}/.fontfamily.json`;
          let metadata = null;
          try {
            const metadataContent = await this.app.vault.adapter.read(metadataPath);
            metadata = JSON.parse(metadataContent);
            this._log(`[Local Font Loader] Reading family metadata: ${metadata.familyName || folderName}`);
          } catch (err) {
            this._log(`[Local Font Loader] Metadata file not found: ${metadataPath}, will auto-scan`);
          }
          const family = {
            familyName: metadata?.familyName || folderName,
            folderPath: fontDir,
            hasRegular: false,
            hasItalic: false,
            hasBold: false,
            hasBoldItalic: false
          };
          if (metadata && metadata.variants) {
            for (const [variantType, filename] of Object.entries(metadata.variants)) {
              const fontPath = `${fontDir}/${filename}`;
              try {
                await this.app.vault.adapter.readBinary(fontPath);
                const basename = filename;
                const name = basename.replace(/\.(ttf|otf|woff|woff2)$/i, "");
                const ext = basename.split(".").pop().toLowerCase();
                const hasB64 = b64Files.includes(name);
                const b64Path = hasB64 ? `${this.settings.b64OutputDir}/${name}.css` : null;
                const fontInfo = {
                  name,
                  path: fontPath,
                  basename,
                  ext,
                  familyName: family.familyName,
                  variantType,
                  hasB64,
                  b64Path
                };
                if (!fontMap.has(name)) {
                  fontMap.set(name, fontInfo);
                }
                if (variantType === "regular")
                  family.hasRegular = true;
                else if (variantType === "italic")
                  family.hasItalic = true;
                else if (variantType === "bold")
                  family.hasBold = true;
                else if (variantType === "bolditalic")
                  family.hasBoldItalic = true;
                this._log(`[Local Font Loader] Identified font: ${family.familyName} (${variantType})`);
              } catch (err) {
                this._log(`[Local Font Loader] Font file does not exist: ${fontPath}`);
              }
            }
          } else {
            const files = await this.app.vault.adapter.list(fontDir);
            const fontFiles = files.files.filter((f) => /\.(ttf|otf|woff|woff2)$/i.test(f));
            this._log(`[Local Font Loader] Auto-scanning ${fontFiles.length} font files in ${folderName}...`);
            const scanPromises = fontFiles.map(async (fontPath) => {
              try {
                const basename = fontPath.split("/").pop();
                const name = basename.replace(/\.(ttf|otf|woff|woff2)$/i, "");
                const ext = basename.split(".").pop().toLowerCase();
                const arrayBuffer = await this.app.vault.adapter.readBinary(fontPath);
                const fontMetadata = parseFontMetadata(arrayBuffer);
                const realFamilyName = fontMetadata?.familyName || family.familyName;
                const variantType = fontMetadata?.variantType || "regular";
                const hasB64 = b64Files.includes(name);
                const b64Path = hasB64 ? `${this.settings.b64OutputDir}/${name}.css` : null;
                const fontInfo = {
                  name,
                  path: fontPath,
                  basename,
                  ext,
                  familyName: realFamilyName,
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
            for (const result of scanResults) {
              if (result.success) {
                if (!fontMap.has(result.fontInfo.name)) {
                  fontMap.set(result.fontInfo.name, result.fontInfo);
                }
                if (result.variantType === "regular")
                  family.hasRegular = true;
                else if (result.variantType === "italic")
                  family.hasItalic = true;
                else if (result.variantType === "bold")
                  family.hasBold = true;
                else if (result.variantType === "bolditalic")
                  family.hasBoldItalic = true;
              }
            }
          }
          if (family.hasRegular || family.hasItalic || family.hasBold || family.hasBoldItalic) {
            this.settings.fontFamilies.push(family);
          }
        } catch (error) {
          this._logError(`[Local Font Loader] Failed to process font family: ${fontDir}`, error);
        }
      }
      for (const prevFont of previousFonts) {
        if (fontMap.has(prevFont.name))
          continue;
        let stillExists = false;
        if (prevFont.path) {
          try {
            stillExists = await this.app.vault.adapter.exists(prevFont.path);
          } catch (e) {
            stillExists = false;
          }
        }
        if (!stillExists) {
          const { exists, ...cleanFont } = prevFont;
          fontMap.set(prevFont.name, cleanFont);
        }
      }
      this.settings.availableFonts = Array.from(fontMap.values());
      await this.saveSettings();
      await this._refreshFontExistence();
      const endTime = performance.now();
      this._log(`[Local Font Loader] Scan completed: ${this.settings.fontFamilies.length} font families, ${this.settings.availableFonts.length} variants, took ${(endTime - startTime).toFixed(2)}ms`);
    } catch (error) {
      const endTime = performance.now();
      this._logError(`[Local Font Loader] 扫描失败，耗时 ${(endTime - startTime).toFixed(2)}ms:`, error);
      await this.saveSettings();
    } finally {
      this._isScanning = false;
    }
  }
  async _adoptMathFontMetrics(familyName) {
    const mathJax = window.MathJax;
    if (!familyName || !mathJax || !mathJax.config || !mathJax.config.chtml) {
      return false;
    }
    const fontData = mathJax.config.chtml.font;
    if (!fontData || !fontData.variant || !document.fonts) {
      return false;
    }
    try {
      await document.fonts.load(`16px "${familyName}"`);
    } catch (error) {
      console.error(`[Local Font Loader] Could not load math font "${familyName}":`, error);
    }
    if (!document.fonts.check(`16px "${familyName}"`)) {
      this._log(`[Local Font Loader] Math font "${familyName}" is not loaded; metrics not adopted`);
      return false;
    }
    const canvas = document.createElement("canvas");
    canvas.width = 8;
    canvas.height = 8;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return false;
    }
    const SIZE = 200;
    const measure = (char) => {
      try {
        ctx.font = `${SIZE}px "${familyName}"`;
        const m = ctx.measureText(char);
        return {
          h: (m.actualBoundingBoxAscent || 0) / SIZE,
          d: (m.actualBoundingBoxDescent || 0) / SIZE,
          w: m.width / SIZE
        };
      } catch (error) {
        return null;
      }
    };
    this._restoreMathFontMetrics();
    const snapshot = { chars: [], delimiters: [] };
    let adopted = 0;
    Object.keys(fontData.variant).forEach((variantName) => {
      const chars = fontData.variant[variantName].chars;
      if (!chars)
        return;
      Object.keys(chars).forEach((code) => {
        const entry = chars[code];
        if (!Array.isArray(entry) || entry.length < 3)
          return;
        const extra = entry[3] || {};
        const codePoint = Number(code);
        const isMathItalicRange = codePoint >= 119860 && codePoint <= 119911;
        const drawChar = isMathItalicRange ? String.fromCodePoint(codePoint) : extra.c ? String(extra.c) : String.fromCodePoint(codePoint);
        const measured = measure(drawChar);
        if (!measured || measured.w === 0 && measured.h === 0) {
          return;
        }
        snapshot.chars.push({ variantName, code, values: [entry[0], entry[1], entry[2]] });
        entry[0] = measured.h;
        entry[1] = measured.d;
        entry[2] = measured.w;
        adopted++;
      });
    });
    Object.keys(fontData.delimiters || {}).forEach((code) => {
      const delimiter = fontData.delimiters[code];
      if (!delimiter || !Array.isArray(delimiter.HDW))
        return;
      const measured = measure(String.fromCodePoint(Number(code)));
      if (!measured || measured.w === 0 && measured.h === 0)
        return;
      snapshot.delimiters.push({ code, values: delimiter.HDW.slice() });
      delimiter.HDW = [measured.h, measured.d, measured.w];
    });
    this._mathFontSnapshot = snapshot;
    this._log(`[Local Font Loader] Math font metrics adopted from "${familyName}": ${adopted} glyphs, ${snapshot.delimiters.length} delimiters`);
    return true;
  }
  _restoreMathFontMetrics() {
    const snapshot = this._mathFontSnapshot;
    const mathJax = window.MathJax;
    if (!snapshot || !mathJax || !mathJax.config || !mathJax.config.chtml) {
      this._mathFontSnapshot = null;
      return;
    }
    const fontData = mathJax.config.chtml.font;
    snapshot.chars.forEach(({ variantName, code, values }) => {
      const chars = fontData.variant[variantName] && fontData.variant[variantName].chars;
      if (chars && chars[code]) {
        chars[code][0] = values[0];
        chars[code][1] = values[1];
        chars[code][2] = values[2];
      }
    });
    snapshot.delimiters.forEach(({ code, values }) => {
      if (fontData.delimiters && fontData.delimiters[code]) {
        fontData.delimiters[code].HDW = values.slice();
      }
    });
    this._log(`[Local Font Loader] Math font metrics restored (${snapshot.chars.length} glyphs)`);
    this._mathFontSnapshot = null;
  }
  async _rebuildMathJaxStyles() {
    const mathJax = window.MathJax;
    if (!mathJax || !mathJax.startup || !mathJax.startup.output) {
      return false;
    }
    const output = mathJax.startup.output;
    try {
      if (output.options) {
        output.options.adaptiveCSS = false;
      }
      output.clearCache();
      const existing = document.getElementById("MJX-CHTML-styles");
      if (existing) {
        existing.remove();
      }
      const scratch = document.createElement("div");
      scratch.setCssStyles({
        display: "none"
      });
      document.body.appendChild(scratch);
      const typesetComponent = new import_obsidian7.Component;
      typesetComponent.load();
      try {
        await import_obsidian7.MarkdownRenderer.render(this.app, "$x$", scratch, "", typesetComponent);
      } finally {
        typesetComponent.unload();
      }
      scratch.remove();
      return !!document.getElementById("MJX-CHTML-styles");
    } catch (error) {
      console.error("[Local Font Loader] Failed to rebuild MathJax styles:", error);
      return false;
    } finally {
      try {
        if (output.options) {
          output.options.adaptiveCSS = true;
        }
      } catch (error) {
        console.error("[Local Font Loader] Failed to restore adaptive CSS mode:", error);
      }
    }
  }
  _refreshMathViews() {
    try {
      this.app.workspace.iterateAllLeaves((leaf) => {
        const view = leaf.view;
        if (view && view.previewMode && typeof view.previewMode.rerender === "function") {
          view.previewMode.rerender(true);
        }
      });
    } catch (error) {
      console.error("[Local Font Loader] Failed to refresh math views:", error);
    }
  }
  _evaluateMathFont(familyName) {
    const REFERENCE = {
      surdAbove: 0.8125,
      surdBelow: 0.2031,
      mathItalicX: 0.557,
      digitOne: 0.5,
      plus: 0.778
    };
    const TOLERANCE = 0.1;
    if (!familyName || typeof document === "undefined" || !document.fonts) {
      return { status: "unavailable", deviations: [] };
    }
    try {
      if (!document.fonts.check(`16px "${familyName}"`)) {
        return { status: "unavailable", deviations: [] };
      }
    } catch (error) {
      return { status: "unavailable", deviations: [] };
    }
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return { status: "unavailable", deviations: [] };
    }
    const SIZE = 200;
    const advanceOf = (char) => {
      try {
        ctx.font = `${SIZE}px "${familyName}"`;
        return ctx.measureText(char).width / SIZE;
      } catch (error) {
        return 0;
      }
    };
    const inkOf = (char) => {
      try {
        ctx.font = `${SIZE}px "${familyName}"`;
        const metrics = ctx.measureText(char);
        return {
          above: (metrics.actualBoundingBoxAscent || 0) / SIZE,
          below: (metrics.actualBoundingBoxDescent || 0) / SIZE
        };
      } catch (error) {
        return { above: 0, below: 0 };
      }
    };
    const surd = inkOf("√");
    const measured = {
      surdAbove: surd.above,
      surdBelow: surd.below,
      mathItalicX: advanceOf("\uD835\uDC65"),
      digitOne: advanceOf("1"),
      plus: advanceOf("+")
    };
    const missing = [];
    if (measured.mathItalicX <= 0)
      missing.push("\uD835\uDC65");
    if (measured.surdAbove <= 0)
      missing.push("√");
    if (missing.length > 0) {
      return { status: "notMathFont", deviations: [], missing };
    }
    const deviations = [];
    Object.keys(REFERENCE).forEach((metric) => {
      const actual = measured[metric];
      if (!actual)
        return;
      const ratio = Math.abs(actual - REFERENCE[metric]) / REFERENCE[metric];
      if (ratio > TOLERANCE) {
        deviations.push({
          metric,
          actual: Number(actual.toFixed(3)),
          expected: REFERENCE[metric],
          percent: Math.round(ratio * 100)
        });
      }
    });
    return {
      status: deviations.length > 0 ? "mismatch" : "ok",
      deviations
    };
  }
  isFontAvailable(fontName) {
    if (!fontName || fontName === "use-text-font" || fontName === "use-ui-font") {
      return true;
    }
    return this.settings.availableFonts.some((f) => (f.familyName || f.name) === fontName);
  }
  _fontExistsMap = {};
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
  _getFontExists(font) {
    return this._fontExistsMap[font.name] !== false;
  }
  async applyFonts() {
    const startTime = performance.now();
    try {
      this._log("[Local Font Loader] Starting to apply fonts...");
      const devicePreset = this._getDevicePreset();
      if (!devicePreset) {
        console.warn("[LocalFontLoader] No preset found for current device, using default preset");
        return;
      }
      const fontsConfig = devicePreset.fonts || {};
      const latinFontEnabled = devicePreset.latinFontEnabled || false;
      const latinFontScope = devicePreset.latinFontScope || {};
      const headingApplyToFileTitle = devicePreset.headingApplyToFileTitle || false;
      const usedFonts = new Set;
      const usedFamilies = new Set;
      const missingFonts = [];
      for (const fontName of Object.values(fontsConfig)) {
        if (fontName) {
          if (!this.isFontAvailable(fontName)) {
            missingFonts.push(fontName);
            this._log(`[Local Font Loader] ⚠️ Font "${fontName}" not found in vault, will fallback to system default`);
            continue;
          }
          usedFonts.add(fontName);
          const fonts = this.settings.availableFonts.filter((f) => f.name === fontName || f.familyName === fontName);
          if (fonts.length > 0) {
            const familyName = fonts[0].familyName || fontName;
            usedFamilies.add(familyName);
          }
        }
      }
      if (missingFonts.length > 0) {
        new import_obsidian7.Notice(t("fontMissingWarning"), 5000);
      }
      if (usedFonts.size === 0) {
        this._log("[Local Font Loader] No fonts configured");
        this.removeFontStyles();
        return;
      }
      this._log("[Local Font Loader] Fonts to load:", Array.from(usedFonts));
      this._log("[Local Font Loader] Font families involved:", Array.from(usedFamilies));
      let fontFaceCss = `/* Local Font Loader - Font Faces */

`;
      let loadedCount = 0;
      let failedFonts = [];
      for (const familyOrFontName of usedFamilies) {
        try {
          const familyFonts = this.settings.availableFonts.filter((f) => f.familyName && f.familyName === familyOrFontName || f.name === familyOrFontName);
          if (familyFonts.length === 0) {
            this._log(`[Local Font Loader] Font family not found: ${familyOrFontName}`);
            failedFonts.push(`${familyOrFontName} (未找到)`);
            continue;
          }
          this._log(`[Local Font Loader] Loading font family: ${familyOrFontName}, contains ${familyFonts.length} variants`);
          const readPromises = familyFonts.filter((font) => font.hasB64 && font.b64Path).map(async (font) => {
            try {
              const b64Css = await this.app.vault.adapter.read(font.b64Path);
              this._log(`[Local Font Loader] ✓ Loaded variant: ${font.name} (${font.subfamilyName || "Unknown"}, ${(b64Css.length / 1024).toFixed(2)} KB)`);
              return { success: true, css: b64Css, font };
            } catch (error) {
              this._logError(`[Local Font Loader] ✗ 读取失败: ${font.name}`, error);
              return { success: false, font, error };
            }
          });
          const results = await Promise.all(readPromises);
          for (const result of results) {
            if (result.success) {
              let css = result.css;
              const isLatinFont = latinFontEnabled && fontsConfig.latin && (familyOrFontName === fontsConfig.latin || result.font.name === fontsConfig.latin);
              if (isLatinFont) {
                const unicodeRange = this.getUnicodeRange(latinFontScope);
                if (unicodeRange) {
                  css = css.replace(/font-display:\s*swap;/g, `font-display: swap;
  unicode-range: ${unicodeRange};`);
                  this._log(`[Local Font Loader] Added unicode-range to Latin font: ${result.font.name}`);
                }
              }
              fontFaceCss += css + `
`;
              loadedCount++;
            } else {
              failedFonts.push(`${result.font.name} (读取失败: ${result.error.message})`);
            }
          }
          const uncachedFonts = familyFonts.filter((f) => !f.hasB64 || !f.b64Path);
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
      this.applyCss(fontFaceCss, "local-font-loader-faces");
      let varsCss = `/* Local Font Loader - Variables */

`;
      const cssVarsMap = {
        ui: ["--font-interface", "--font-interface-override"],
        text: [
          "--font-text",
          "--font-text-override",
          "--font-print",
          "--font-print-override",
          "--font-default",
          "--default-font",
          "--font-family-editor",
          "--font-text-theme",
          "--font-editor"
        ],
        monospace: [
          "--font-monospace",
          "--font-monospace-override",
          "--font-monospace-default",
          "--font-monospace-theme",
          "--font-code"
        ]
      };
      const buildFontStack = (key, fontFamily) => {
        const separatesLatin = latinFontEnabled && fontsConfig.latin && (key === "text" || key === "ui" && this.settings.latinFontForUI);
        if (separatesLatin) {
          return `"${this._escapeCssString(fontsConfig.latin)}", "${this._escapeCssString(fontFamily)}", sans-serif`;
        }
        const fallback = key === "monospace" ? "monospace" : "sans-serif";
        return `"${this._escapeCssString(fontFamily)}", ${fallback}`;
      };
      const fontDeclarations = [];
      for (const [key, cssVars] of Object.entries(cssVarsMap)) {
        if (!fontsConfig[key]) {
          continue;
        }
        const stack = buildFontStack(key, fontsConfig[key]);
        for (const cssVar of cssVars) {
          fontDeclarations.push(`${cssVar}: ${stack} !important;`);
        }
      }
      if (fontDeclarations.length > 0) {
        for (const scope of [":root", "body"]) {
          varsCss += `${scope} {
`;
          for (const declaration of fontDeclarations) {
            varsCss += `  ${declaration}
`;
          }
          varsCss += `}

`;
        }
        this._log(`[Local Font Loader] ${fontDeclarations.length} font variables declared on :root and re-declared on <body> to override Obsidian core inline styles`);
      }
      if (fontsConfig.ui && latinFontEnabled && fontsConfig.latin && this.settings.latinFontForUI) {
        varsCss += this._buildUiFontRules(`"${this._escapeCssString(fontsConfig.latin)}", "${this._escapeCssString(fontsConfig.ui)}"`);
        this._log(`[Local Font Loader] Latin font also applied to UI elements (desktop + mobile)`);
      } else if (fontsConfig.ui) {
        varsCss += this._buildUiFontRules(`"${this._escapeCssString(fontsConfig.ui)}"`);
        this._log(`[Local Font Loader] UI font applied (workspace chrome + floating UI)`);
      }
      if (fontsConfig.text) {
        varsCss += `/* Body Text Font */
`;
        let textFontFamily = `"${this._escapeCssString(fontsConfig.text)}"`;
        if (latinFontEnabled && fontsConfig.latin) {
          textFontFamily = `"${this._escapeCssString(fontsConfig.latin)}", "${this._escapeCssString(fontsConfig.text)}"`;
          this._log(`[Local Font Loader] Enable Latin font separation: ${fontsConfig.latin} (Latin) + ${fontsConfig.text} (Non-Latin)`);
          if (this.settings.latinFontForUI) {
            this._log(`[Local Font Loader] Latin font also applied to UI elements`);
          }
        }
        varsCss += `.markdown-preview-view,
`;
        varsCss += `.markdown-source-view,
`;
        varsCss += `.cm-s-obsidian,
`;
        varsCss += `.cm-s-obsidian .cm-line,
`;
        varsCss += `.markdown-source-view.mod-cm6 .cm-content {
`;
        varsCss += `  font-family: ${textFontFamily} !important;
`;
        varsCss += `}

`;
      }
      if (fontsConfig.monospace) {
        varsCss += this._buildCodeFontRules(fontsConfig.monospace);
        this._log(`[Local Font Loader] Code font applied (inline code, code blocks, line numbers)`);
      }
      if (fontsConfig.heading) {
        varsCss += `/* Heading Font */
`;
        let headingFontFamily = "";
        const headingValue = fontsConfig.heading;
        if (headingValue === "use-text-font") {
          if (fontsConfig.text) {
            headingFontFamily = fontsConfig.text;
            if (latinFontEnabled && fontsConfig.latin) {
              headingFontFamily = `"${this._escapeCssString(fontsConfig.latin)}", "${this._escapeCssString(fontsConfig.text)}"`;
            } else {
              headingFontFamily = `"${this._escapeCssString(headingFontFamily)}"`;
            }
          }
        } else if (headingValue === "use-ui-font") {
          if (fontsConfig.ui) {
            headingFontFamily = `"${this._escapeCssString(fontsConfig.ui)}"`;
          }
        } else if (headingValue) {
          headingFontFamily = `"${this._escapeCssString(headingValue)}"`;
        }
        if (headingFontFamily) {
          varsCss += `.markdown-preview-view h1, .markdown-preview-view h2,
`;
          varsCss += `.markdown-preview-view h3, .markdown-preview-view h4,
`;
          varsCss += `.markdown-preview-view h5, .markdown-preview-view h6,
`;
          varsCss += `.cm-header-1, .cm-header-2, .cm-header-3,
`;
          varsCss += `.cm-header-4, .cm-header-5, .cm-header-6`;
          if (headingApplyToFileTitle) {
            varsCss += `,
.inline-title`;
          }
          varsCss += ` {
  font-family: ${headingFontFamily} !important;
}

`;
          this._log(`[Local Font Loader] Apply heading font: ${headingFontFamily}${headingApplyToFileTitle ? " (including file title)" : ""}`);
        }
      }
      if (fontsConfig.math) {
        varsCss += `/* LaTeX Math Font (High Priority) - Fixes MathJax CHTML content */
`;
        const mathItalicUpperStart = 119860;
        const mathItalicLowerStart = 119886;
        for (let i = 0;i < 26; i++) {
          const upperCode = mathItalicUpperStart + i;
          const lowerCode = mathItalicLowerStart + i;
          varsCss += `body .mjx-c${upperCode.toString(16).toUpperCase()}.TEX-I::before { content: "${String.fromCodePoint(upperCode)}" !important; }
`;
          varsCss += `body .mjx-c${lowerCode.toString(16).toUpperCase()}.TEX-I::before { content: "${String.fromCodePoint(lowerCode)}" !important; }
`;
        }
        varsCss += `
/* Apply fonts */
`;
        const sizeVariantGuard = [1, 2, 3, 4].map((n) => `:not(.TEX-S${n})`).join("");
        varsCss += `/* Italic variables */
`;
        varsCss += `body mjx-c.TEX-I${sizeVariantGuard}::before {
`;
        varsCss += `  font-family: '${this._escapeCssString(fontsConfig.math)}', MJXTEX-I, MJXZERO, serif !important;
`;
        varsCss += `  font-style: normal !important;
`;
        varsCss += `}

`;
        varsCss += `/* Numbers and operators */
`;
        varsCss += `body mjx-mn mjx-c${sizeVariantGuard}::before,
`;
        varsCss += `body mjx-mo mjx-c${sizeVariantGuard}::before,
`;
        varsCss += `body mjx-c:not(.TEX-I)${sizeVariantGuard}::before {
`;
        varsCss += `  font-family: '${this._escapeCssString(fontsConfig.math)}', MJXZERO, MJXTEX, serif !important;
`;
        varsCss += `}

`;
        varsCss += `/* Container */
`;
        varsCss += `body mjx-container,
`;
        varsCss += `body.is-mobile mjx-container {
`;
        varsCss += `  font-family: '${this._escapeCssString(fontsConfig.math)}', MJXZERO, MJXTEX, serif !important;
`;
        varsCss += `}

`;
        varsCss += `/* Stretchy assembly pieces — keep MathJax's own glyphs */
`;
        const stretchyScopes = [
          "mjx-stretchy-h mjx-c",
          "mjx-stretchy-v mjx-c",
          "mjx-stretchy-h mjx-ext mjx-c",
          "mjx-stretchy-v mjx-ext mjx-c"
        ];
        stretchyScopes.forEach((scope, index) => {
          varsCss += `body ${scope}:not(.TEX-I)${sizeVariantGuard}::before`;
          varsCss += index === stretchyScopes.length - 1 ? ` {
` : `,
`;
        });
        varsCss += `  font-family: MJXZERO, MJXTEX, serif !important;
`;
        varsCss += `}

`;
        this._log(`[Local Font Loader] Math font applied with high priority selectors`);
        window.setTimeout(() => {
          this._adoptMathFontMetrics(fontsConfig.math).then((adopted) => {
            if (!adopted)
              return;
            return this._rebuildMathJaxStyles().then(() => this._refreshMathViews());
          }).catch((error) => {
            console.error("[Local Font Loader] Failed to adopt math font metrics:", error);
          });
        }, 300);
      }
      this.applyCss(varsCss, "local-font-loader-vars");
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
  async convertAllFonts() {
    this._log("[Local Font Loader] Starting font conversion...");
    let converted = 0;
    let skipped = 0;
    try {
      for (const font of this.settings.availableFonts) {
        if (font.hasB64) {
          skipped++;
          continue;
        }
        try {
          const variantLabel = font.variantType || "unknown";
          this._log(`[Local Font Loader] Converting font: ${font.name} (${font.familyName || "Unknown"} - ${variantLabel})`);
          const arrayBuffer = await this.app.vault.adapter.readBinary(font.path);
          const base64 = this.arrayBufferToBase64(arrayBuffer);
          const { css: singleFontCss, fontFamily, variantType, fontWeight, fontStyle } = this._buildFontFaceCss(font, base64, this._getDeviceFontContext());
          const cachePath = `${this.settings.b64OutputDir}/${font.name}.css`;
          await this.app.vault.adapter.write(cachePath, singleFontCss);
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
      this._logError("[Local Font Loader] 批量Conversion failed:", error);
    }
  }
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    const chunkSize = 8192;
    let binary = "";
    for (let i = 0;i < bytes.byteLength; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.byteLength));
      binary += String.fromCharCode.apply(null, chunk);
    }
    return btoa(binary);
  }
  _buildFontFaceCss(font, base64, ctx) {
    const { fontsConfig, latinFontEnabled, latinFontScope } = ctx;
    const formatMap = {
      ttf: "font/truetype",
      otf: "font/opentype",
      woff: "font/woff",
      woff2: "font/woff2"
    };
    const mimeType = formatMap[font.ext] || "font/truetype";
    const fontFamily = font.familyName || font.name;
    const variantType = font.variantType || "regular";
    const isLatinFont = latinFontEnabled && fontsConfig.latin && (fontFamily === fontsConfig.latin || font.name === fontsConfig.latin);
    const needsUnicodeRange = isLatinFont;
    let fontWeight = 400;
    let fontStyle = "normal";
    switch (variantType) {
      case "italic":
        fontStyle = "italic";
        break;
      case "bold":
        fontWeight = 700;
        break;
      case "bolditalic":
        fontWeight = 700;
        fontStyle = "italic";
        break;
    }
    let css = `/* ${this._escapeCssString(fontFamily)} - ${variantType} */
`;
    css += `@font-face {
`;
    css += `  font-family: '${this._escapeCssString(fontFamily)}';
`;
    css += `  src: url(data:${mimeType};base64,${base64});
`;
    css += `  font-style: ${fontStyle};
`;
    css += `  font-weight: ${fontWeight};
`;
    css += `  font-display: swap;
`;
    if (needsUnicodeRange) {
      const unicodeRange = this.getUnicodeRange(latinFontScope);
      if (unicodeRange) {
        css += `  unicode-range: ${unicodeRange};
`;
      }
    }
    css += `}
`;
    return { css, fontFamily, variantType, fontWeight, fontStyle };
  }
  applyCss(css, cssId) {
    if (this._appliedCss.get(cssId) === css) {
      return;
    }
    if (!css) {
      this._removeGeneratedStyles(cssId);
      return;
    }
    if (this._supportsConstructableStylesheets()) {
      this._dropLegacySnippet();
      let sheet = this._adoptedSheets.get(cssId);
      if (!sheet) {
        sheet = new CSSStyleSheet;
        this._adoptedSheets.set(cssId, sheet);
        document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
      }
      try {
        sheet.replaceSync(css);
      } catch (error) {
        this._logError(`[Local Font Loader] Could not apply stylesheet "${cssId}":`, error);
        return;
      }
    } else {
      this._snippetCss.set(cssId, css);
      this._queueSnippetSync();
    }
    this._appliedCss.set(cssId, css);
  }
  _supportsConstructableStylesheets() {
    return typeof CSSStyleSheet === "function" && "replaceSync" in CSSStyleSheet.prototype && "adoptedStyleSheets" in document;
  }
  _removeGeneratedStyles(cssId) {
    const sheet = this._adoptedSheets.get(cssId);
    if (sheet) {
      document.adoptedStyleSheets = document.adoptedStyleSheets.filter((s) => s !== sheet);
      this._adoptedSheets.delete(cssId);
    }
    const element = document.getElementById(cssId);
    if (element) {
      element.remove();
    }
    if (this._snippetCss.delete(cssId)) {
      this._queueSnippetSync();
    }
    this._appliedCss.delete(cssId);
  }
  _queueSnippetSync() {
    this._snippetSync = this._snippetSync.then(() => this._syncSnippet()).catch((error) => this._logError("[Local Font Loader] Could not write the CSS snippet:", error));
  }
  async _syncSnippet() {
    const customCss = this.app.customCss;
    if (!customCss) {
      this._logError("[Local Font Loader] No CSS snippets on this platform: the fonts cannot be applied.");
      return;
    }
    const path = customCss.getSnippetPath(LEGACY_SNIPPET);
    const css = Array.from(this._snippetCss.values()).join(`
`);
    if (!css) {
      if (!this._snippetEnabled) {
        return;
      }
      this._snippetEnabled = false;
      customCss.setCssEnabledStatus(LEGACY_SNIPPET, false);
      if (!this._snippetWritten) {
        return;
      }
      this._snippetWritten = false;
      if (await this.app.vault.adapter.exists(path)) {
        await this.app.vault.adapter.remove(path);
      }
      return;
    }
    await this.app.vault.adapter.write(path, css);
    this._snippetWritten = true;
    if (!this._snippetEnabled) {
      this._snippetEnabled = true;
      customCss.setCssEnabledStatus(LEGACY_SNIPPET, true);
    }
    this._log(`[Local Font Loader] Applied ${(css.length / 1024 / 1024).toFixed(2)} MB of CSS through the "${LEGACY_SNIPPET}" snippet.`);
  }
  _dropLegacySnippet() {
    if (this._legacySnippetChecked) {
      return;
    }
    this._legacySnippetChecked = true;
    if (!this.app.customCss?.enabledSnippets?.has(LEGACY_SNIPPET)) {
      return;
    }
    this._snippetEnabled = true;
    this._queueSnippetSync();
  }
  removeFontStyles() {
    this._removeGeneratedStyles("local-font-loader-faces");
    this._removeGeneratedStyles("local-font-loader-vars");
    this._restoreMathFontMetrics();
  }
  async clearCache() {
    try {
      const files = await this.app.vault.adapter.list(this.settings.b64OutputDir);
      let count = 0;
      for (const file of files.files) {
        if (file.endsWith(".css")) {
          await this.app.vault.adapter.remove(file);
          count++;
        }
      }
      for (const font of this.settings.availableFonts) {
        font.hasB64 = false;
        font.b64Path = null;
      }
      await this.saveSettings();
      this._log(`[Local Font Loader] Cleaned ${count} cache files`);
    } catch (error) {
      this._logError("[Local Font Loader] Clear Cache失败:", error);
    }
  }
}

// src/main.ts
module.exports = LocalFontLoaderPlugin;
