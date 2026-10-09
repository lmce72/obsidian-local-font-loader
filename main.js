// src/plugin.ts
var import_obsidian10 = require("obsidian");

// src/i18n.ts
var import_obsidian = require("obsidian");
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
    browseFolder: "Browse",
    browseFolderDesc: "Pick a folder from the vault",
    selectFolder: "Select a folder",
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
    legendConverted: "Available",
    legendNotExist: "Not Exist",
    filterAll: "All",
    noNotExistFonts: "No missing fonts found",
    scanFonts: "Scan Fonts",
    deleteFont: "Delete Font",
    deleteUnusedFonts: "Delete Unused Fonts",
    rescanFonts: "Rescan Fonts",
    fontsRescanned: "Fonts Rescanned",
    fontFileStatus: "Font File Status",
    deleteUnusedFontsDesc: "Delete unused font files (configured fonts will not be deleted)",
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
    noAvailableFonts: "No fonts found yet. Use Rescan to look for them.",
    fontStatusTitle: "Font status",
    fontStatusIntro: "Which font each category uses, and where its numbers come from.",
    fontStatusFont: "Font",
    fontStatusFiles: "Files",
    fontStatusHow: "How the numbers are obtained",
    fontStatusSource: "Source",
    fontStatusGaps: "Not covered",
    fontStatusNone: "None",
    fontStatusPending: "Waiting for the font to be resolved",
    fontStatusClose: "Close",
    variantsSuffix: "variants",
    variantsWithCheckmark: "{familyName} ✓ ({variantCount} variants)",
    variantsWithoutCheckmark: "{familyName} ({variantCount} variants)",
    notFoundFontFamily: "Font family not found. Please verify font folder structure.",
    importFont: "Import Font",
    recommendedLatinFontsLabel: "--- Recommended Latin Fonts ---",
    otherFontsLabel: "--- Other Fonts ---",
    expandCollapse: "Expand/Collapse",
    expandAll: "Expand All",
    collapseAll: "Collapse All",
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
    importDropTitle: "Drag font files here",
    importDropSubtitle: "Or click to choose files",
    importDropHint: "Supports .ttf, .otf, .woff, .woff2",
    punctuationDesc: ".,!?;: and other common punctuation",
    symbolsDesc: "@#$%&* and other special characters",
    fontsApplied: "✓ Fonts applied",
    conversionFailed: "⚠️ Font conversion failed",
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
    deviceLimitTitle: "Known limitation",
    deviceLimitBodyAndroid: "On Android, a factory reset leaves the same device duplicated in this list.",
    deviceLimitBodyIos: "On iOS, uninstalling and reinstalling Obsidian leaves the same device duplicated in this list.",
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
    deviceListRepaired: "Merged {0} duplicated device entr(y/ies) in the device list",
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
    browseFolder: "浏览",
    browseFolderDesc: "从库中选择一个文件夹",
    selectFolder: "选择文件夹",
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
    legendConverted: "可用",
    legendNotExist: "不存在",
    filterAll: "全部",
    noNotExistFonts: "没有缺失的字体",
    scanFonts: "扫描字体",
    deleteFont: "删除字体",
    deleteUnusedFonts: "删除未使用的字体",
    rescanFonts: "重新扫描",
    fontsRescanned: "字体已重新扫描",
    fontFileStatus: "字体文件状态",
    deleteUnusedFontsDesc: "删除未使用的字体文件（已配置的字体不会被删除）",
    applyNow: "立即应用",
    applyNowDesc: "应用当前字体配置",
    applyFonts: "应用字体",
    fontMissingWarning: "当前字体文件缺失，已回退至系统设置",
    noAvailableFonts: "尚未发现任何字体。请使用「重新扫描」查找。",
    fontStatusTitle: "字体状态",
    fontStatusIntro: "每一类用的是哪个字体，以及它的度量从哪里来。",
    fontStatusFont: "字体",
    fontStatusFiles: "文件",
    fontStatusHow: "度量是怎么得到的",
    fontStatusSource: "来源",
    fontStatusGaps: "未覆盖",
    fontStatusNone: "未设置",
    fontStatusPending: "字体尚未解析完成",
    fontStatusClose: "关闭",
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
    notFoundFontFamily: "未找到字体家族，请确认字体文件夹结构正确",
    importFont: "导入字体",
    recommendedLatinFontsLabel: "--- 推荐的拉丁字体 ---",
    otherFontsLabel: "--- 其他字体 ---",
    expandCollapse: "展开/收起",
    expandAll: "全部展开",
    collapseAll: "全部折叠",
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
    importDropTitle: "拖拽字体文件到此处",
    importDropSubtitle: "或点击选择文件",
    importDropHint: "支持 .ttf, .otf, .woff, .woff2 格式",
    punctuationDesc: ".,!?;: 等常用标点",
    symbolsDesc: "@#$%&* 等特殊字符",
    fontsApplied: "✓ 字体已应用",
    conversionFailed: "⚠️ 字体转换失败",
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
    deviceLimitTitle: "已知局限",
    deviceLimitBodyAndroid: "安卓端恢复出厂设置后，会出现同一台设备在此列表中重复的问题。",
    deviceLimitBodyIos: "iOS 端卸载并重装 Obsidian 后，会出现同一台设备在此列表中重复的问题。",
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
    deviceListRepaired: "设备列表已自我修复：合并 {0} 组重复设备",
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
    legendConverted: "使用可能",
    legendNotExist: "存在しない",
    filterAll: "すべて",
    noNotExistFonts: "欠落しているフォントがありません",
    scanFonts: "フォントをスキャン",
    deleteFont: "フォントを削除",
    deleteUnusedFonts: "未使用フォントを削除",
    rescanFonts: "フォントを再スキャン",
    fontsRescanned: "フォントを再スキャンしました",
    fontFileStatus: "フォントファイルステータス",
    deleteUnusedFontsDesc: "未使用のフォントファイルを削除（設定済みフォントは削除されません）",
    applyNow: "今すぐ適用",
    applyNowDesc: "現在のフォント設定を適用",
    applyFonts: "フォントを適用",
    fontMissingWarning: "フォントファイルが見つかりません。システムデフォルトにフォールバックしました",
    noAvailableFonts: "まだフォントが見つかりません。「再スキャン」で探してください。",
    fontStatusTitle: "フォントの状態",
    fontStatusIntro: "各カテゴリが使うフォントと、その数値の出所。",
    fontStatusFont: "フォント",
    fontStatusFiles: "ファイル",
    fontStatusHow: "数値の取得方法",
    fontStatusSource: "出所",
    fontStatusGaps: "未対応",
    fontStatusNone: "未設定",
    fontStatusPending: "フォントの解決待ち",
    fontStatusClose: "閉じる",
    variantWarningTitle: "フォントバリアント警告",
    variantWarningBody: `選択したフォント "{fontFamily}" には {variantCount} 個のバリアント（{variantList}）しかありません。

ラテン文字コンテンツの斜体と太字を適切にレンダリングするには、Regular、Italic、Bold、Bold Italic のバリアントを含むフォントファミリーを使用することをお勧めします。バリアントが不足していると、疑似斜体/疑似太字のレンダリング問題が発生する可能性があります。`,
    variantWarningContinue: "このまま続ける",
    variantWarningCancel: "キャンセル",
    fontsApplied: "✓ フォントが適用されました",
    conversionFailed: "⚠️ フォント変換に失敗しました",
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
    legendConverted: "사용 가능",
    legendNotExist: "존재하지 않음",
    filterAll: "전체",
    noNotExistFonts: "누락된 폰트가 없습니다",
    scanFonts: "폰트 스캔",
    deleteFont: "폰트 삭제",
    deleteUnusedFonts: "사용하지 않는 폰트 삭제",
    rescanFonts: "폰트 재스캔",
    fontsRescanned: "폰트 재스캔 완료",
    fontFileStatus: "폰트 파일 상태",
    deleteUnusedFontsDesc: "사용하지 않는 폰트 파일 삭제（설정된 폰트는 삭제되지 않음）",
    applyNow: "지금 적용",
    applyNowDesc: "현재 폰트 설정 적용",
    applyFonts: "폰트 적용",
    fontMissingWarning: "폰트 파일이 없습니다. 시스템 기본값으로 대체되었습니다",
    noAvailableFonts: "아직 글꼴이 없습니다. 다시 스캔하여 찾아보세요.",
    fontStatusTitle: "글꼴 상태",
    fontStatusIntro: "각 범주가 쓰는 글꼴과 수치의 출처입니다.",
    fontStatusFont: "글꼴",
    fontStatusFiles: "파일",
    fontStatusHow: "수치를 얻는 방식",
    fontStatusSource: "출처",
    fontStatusGaps: "미지원",
    fontStatusNone: "없음",
    fontStatusPending: "글꼴 확인 대기 중",
    fontStatusClose: "닫기",
    variantWarningTitle: "폰트 변형 경고",
    variantWarningBody: `선택한 폰트 "{fontFamily}"에는 {variantCount}개의 변형（{variantList}）만 있습니다.

라틴 문자 콘텐츠의 기울임꼴과 굵은 글씨를 올바르게 렌더링하려면 Regular, Italic, Bold, Bold Italic 변형이 포함된 폰트 패밀리를 사용하는 것이 좋습니다. 변형이 누락되면 가짜 기울임꼴/가짜 굵은 글씨 렌더링 문제가 발생할 수 있습니다.`,
    variantWarningContinue: "계속 진행",
    variantWarningCancel: "취소",
    fontsApplied: "✓ 폰트가 적용되었습니다",
    conversionFailed: "⚠️ 폰트 변환 실패",
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
    legendConverted: "Disponible",
    legendNotExist: "No Existe",
    filterAll: "Todos",
    noNotExistFonts: "No se encontraron fuentes faltantes",
    scanFonts: "Escanear Fuentes",
    deleteFont: "Eliminar Fuente",
    deleteUnusedFonts: "Eliminar Fuentes No Usadas",
    rescanFonts: "Reescanear Fuentes",
    fontsRescanned: "Fuentes Reescaneadas",
    fontFileStatus: "Estado de Archivos de Fuentes",
    deleteUnusedFontsDesc: "Eliminar archivos de fuentes no usadas (las fuentes configuradas no se eliminarán)",
    applyNow: "Aplicar Ahora",
    applyNowDesc: "Aplicar la configuración de fuentes actual",
    applyFonts: "Aplicar Fuentes",
    fontMissingWarning: "Archivo de fuente faltante, usando predeterminado del sistema",
    noAvailableFonts: "Aún no hay fuentes. Use «Volver a buscar» para encontrarlas.",
    fontStatusTitle: "Estado de las fuentes",
    fontStatusIntro: "Qué fuente usa cada categoría y de dónde salen sus números.",
    fontStatusFont: "Fuente",
    fontStatusFiles: "Archivos",
    fontStatusHow: "Cómo se obtienen los números",
    fontStatusSource: "Origen",
    fontStatusGaps: "Sin cubrir",
    fontStatusNone: "Ninguna",
    fontStatusPending: "Esperando a resolver la fuente",
    fontStatusClose: "Cerrar",
    variantWarningTitle: "Advertencia de Variantes de Fuente",
    variantWarningBody: `La fuente seleccionada "{fontFamily}" solo tiene {variantCount} variante(s) ({variantList}).

Para una correcta renderización de cursiva y negrita en contenido de escritura latina, se recomienda usar una familia de fuentes con variantes Regular, Italic, Bold y Bold Italic. Las variantes faltantes pueden causar problemas de renderización de falsa cursiva/negrita.`,
    variantWarningContinue: "Continuar de todos modos",
    variantWarningCancel: "Cancelar",
    fontsApplied: "✓ Fuentes aplicadas",
    conversionFailed: "⚠️ Conversión de fuente fallida",
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
    legendConverted: "可用",
    legendNotExist: "不存在",
    filterAll: "全部",
    noNotExistFonts: "沒有缺失的字型",
    scanFonts: "掃描字型",
    deleteFont: "刪除字型",
    deleteUnusedFonts: "刪除未使用的字型",
    rescanFonts: "重新掃描",
    fontsRescanned: "字型已重新掃描",
    fontFileStatus: "字型檔案狀態",
    deleteUnusedFontsDesc: "刪除未使用的字型檔案（已設定的字型不會被刪除）",
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
    notFoundFontFamily: "未找到字型家族，請確認字型資料夾結構正確",
    importFont: "匯入字型",
    recommendedLatinFontsLabel: "--- 推薦的拉丁字型 ---",
    otherFontsLabel: "--- 其他字型 ---",
    expandCollapse: "展開/收合",
    expandAll: "全部展開",
    collapseAll: "全部收合",
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
    importDropTitle: "拖拽字型檔案到此處",
    importDropSubtitle: "或點擊選擇檔案",
    importDropHint: "支援 .ttf, .otf, .woff, .woff2 格式",
    punctuationDesc: ".,!?;: 等常用標點",
    symbolsDesc: "@#$%&* 等特殊字元",
    fontsApplied: "✓ 字型已套用",
    conversionFailed: "⚠️ 字型轉換失敗",
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
    deviceLimitTitle: "已知限制",
    deviceLimitBodyAndroid: "安卓端恢復原廠設定後，會出現同一台裝置在此列表中重複的問題。",
    deviceLimitBodyIos: "iOS 端卸載並重新安裝 Obsidian 後，會出現同一台裝置在此列表中重複的問題。",
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
    deviceListRepaired: "裝置列表已自我修復：合併 {0} 組重複裝置",
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
var TRANSLATIONS_BY_LOCALE = TRANSLATIONS;
function t(key, localeOrParams = null, params = {}) {
  let locale = null;
  if (typeof localeOrParams === "object" && localeOrParams !== null) {
    params = localeOrParams;
  } else if (typeof localeOrParams === "string") {
    locale = localeOrParams;
  }
  if (!locale) {
    const fullLocale = import_obsidian.getLanguage() || "en";
    if (TRANSLATIONS_BY_LOCALE[fullLocale]) {
      locale = fullLocale;
    } else {
      locale = fullLocale.split("-")[0];
    }
  }
  const lang = TRANSLATIONS_BY_LOCALE[locale] || TRANSLATIONS_BY_LOCALE.en;
  let text = lang[key] || TRANSLATIONS_BY_LOCALE.en[key] || key;
  Object.keys(params).forEach((param) => {
    text = text.replace(new RegExp(`\\{${param}\\}`, "g"), String(params[param]));
  });
  return text;
}
function getCurrentLocale() {
  return (import_obsidian.getLanguage() || "en").split("-")[0];
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
      familyName: metadata.familyName || "",
      subfamilyName: metadata.subfamilyName || "",
      fullName: metadata.fullName || "",
      postScriptName: metadata.postScriptName || "",
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
  availableFonts: [],
  fontFamilies: [],
  autoLoadOnStartup: true,
  deviceFingerprints: {},
  deviceNameMap: {},
  deviceMeta: {},
  deviceAliases: {},
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

// src/device-repair.ts
var DEVICE_STALE_MS = 14 * 24 * 60 * 60 * 1000;
var SUCCESSION_MIN_GAP_MS = 24 * 60 * 60 * 1000;
var SUCCESSION_MAX_GAP_MS = 30 * 24 * 60 * 60 * 1000;
function readLifetime(meta) {
  const parse = (value) => {
    if (!value) {
      return null;
    }
    const time = Date.parse(value);
    return Number.isNaN(time) ? null : time;
  };
  return {
    first: parse(meta && meta.firstSeen),
    last: parse(meta && meta.lastSeen)
  };
}
function describeDeviceGroupHistory(ids, meta, now) {
  const spans = ids.map((id) => readLifetime(meta[id]));
  for (let i = 0;i < spans.length; i++) {
    for (let j = i + 1;j < spans.length; j++) {
      const a = spans[i];
      const b = spans[j];
      if (a.first === null || a.last === null || b.first === null || b.last === null) {
        continue;
      }
      if (a.first <= b.last && b.first <= a.last) {
        return "coexisted";
      }
    }
  }
  const usableSpans = spans.filter((span) => span.first !== null && span.last !== null);
  if (usableSpans.length !== spans.length) {
    return "unknown";
  }
  const ordered = usableSpans.slice().sort((a, b) => a.first - b.first);
  const newest = ordered[ordered.length - 1];
  if (!Number.isFinite(now) || now - newest.last > DEVICE_STALE_MS) {
    return "unknown";
  }
  for (let i = 0;i < ordered.length - 1; i++) {
    const gap = ordered[i + 1].first - ordered[i].last;
    if (gap < SUCCESSION_MIN_GAP_MS || gap > SUCCESSION_MAX_GAP_MS) {
      return "unknown";
    }
  }
  return "succession";
}
function resolveDeviceAlias(deviceId, aliases) {
  if (!aliases) {
    return deviceId;
  }
  let current = deviceId;
  const seen = new Set([deviceId]);
  while (aliases[current] && !seen.has(aliases[current])) {
    current = aliases[current];
    seen.add(current);
  }
  return current;
}
function isGeneratedDeviceName(name, meta) {
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
function deviceIdentityKey(meta) {
  if (!meta || meta.platform !== "mobile" && meta.platform !== "desktop") {
    return null;
  }
  const hostname = String(meta.hostname || "").trim().toLowerCase();
  if (hostname) {
    return `${meta.platform}|${meta.os}|host:${hostname}`;
  }
  const model = String(meta.model || "").trim().toLowerCase();
  if (!model || meta.os === "ios" || meta.os === "ipados") {
    return null;
  }
  return `${meta.platform}|${meta.os}|model:${model}`;
}
function findDuplicateDeviceGroups(meta, aliases = {}) {
  const groups = new Map;
  Object.keys(meta || {}).forEach((id) => {
    if (aliases[id]) {
      return;
    }
    const key = deviceIdentityKey(meta[id]);
    if (!key) {
      return;
    }
    const ids = groups.get(key);
    if (ids) {
      ids.push(id);
    } else {
      groups.set(key, [id]);
    }
  });
  const duplicates = [];
  groups.forEach((ids, key) => {
    if (ids.length > 1) {
      duplicates.push({ key, ids: ids.slice().sort() });
    }
  });
  return duplicates;
}
function pickCanonicalId(ids, nameMap, meta) {
  const seenAt = (id) => {
    const stamp = meta[id] && meta[id].lastSeen;
    const time = stamp ? Date.parse(stamp) : Number.NaN;
    return Number.isNaN(time) ? -1 : time;
  };
  const live = ids.filter((id) => seenAt(id) >= 0);
  if (live.length > 0) {
    const mostRecent = live.reduce((best, id) => seenAt(id) > seenAt(best) ? id : best);
    if (live.length === 1 || live.some((id) => seenAt(id) !== seenAt(mostRecent))) {
      return mostRecent;
    }
  }
  const userNamed = ids.find((id) => nameMap[id] && !isGeneratedDeviceName(nameMap[id], meta[id]));
  return userNamed || ids[0];
}
function pickName(canonicalId, ids, nameMap) {
  if (nameMap[canonicalId]) {
    return nameMap[canonicalId];
  }
  for (const id of ids) {
    if (nameMap[id]) {
      return nameMap[id];
    }
  }
  return;
}
function pickMeta(canonicalId, ids, meta) {
  const source = meta[canonicalId] || ids.map((id) => meta[id]).find(Boolean);
  if (!source) {
    return;
  }
  const earliest = ids.map((id) => meta[id] && meta[id].firstSeen).filter(Boolean).sort()[0];
  const latest = ids.map((id) => meta[id] && meta[id].lastSeen).filter(Boolean).sort().pop();
  return {
    ...source,
    ...earliest ? { firstSeen: earliest } : {},
    ...latest ? { lastSeen: latest } : {}
  };
}
function planDeviceRepair(input) {
  const nameMap = input.nameMap || {};
  const meta = input.meta || {};
  const previous = input.aliases || {};
  const aliases = {};
  Object.keys(previous).forEach((id) => {
    const target = resolveDeviceAlias(id, previous);
    if (target !== id) {
      aliases[id] = target;
    }
  });
  const allGroups = findDuplicateDeviceGroups(meta, aliases);
  const mergeable = allGroups.filter((group) => !group.key.includes("|model:"));
  const ambiguous = allGroups.filter((group) => group.key.includes("|model:")).map((group) => ({ ...group, history: describeDeviceGroupHistory(group.ids, meta, input.now) }));
  const merges = mergeable.map((group) => {
    const canonicalId = pickCanonicalId(group.ids, nameMap, meta);
    const removedIds = group.ids.filter((id) => id !== canonicalId);
    removedIds.forEach((id) => {
      aliases[id] = canonicalId;
    });
    return {
      canonicalId,
      removedIds,
      name: pickName(canonicalId, group.ids, nameMap),
      meta: pickMeta(canonicalId, group.ids, meta)
    };
  });
  Object.keys(aliases).forEach((id) => {
    const target = resolveDeviceAlias(id, aliases);
    if (target === id) {
      delete aliases[id];
    } else {
      aliases[id] = target;
    }
  });
  return { merges, ambiguous, aliases, changed: merges.length > 0 };
}
function remapDeviceIds(deviceIds, aliases) {
  const seen = new Set;
  const result = [];
  (deviceIds || []).forEach((id) => {
    const mapped = resolveDeviceAlias(id, aliases);
    if (seen.has(mapped)) {
      return;
    }
    seen.add(mapped);
    result.push(mapped);
  });
  return result;
}

// src/ui/settings-tab.ts
var import_obsidian9 = require("obsidian");

// src/ui/modals.ts
var import_obsidian2 = require("obsidian");
class TextInputModal extends import_obsidian2.Modal {
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
      cls: "lfl-text-input",
      attr: {
        "aria-label": this.titleText
      }
    });
    const buttonContainer = contentEl.createDiv({ cls: "modal-button-container lfl-modal-buttons" });
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
        inputEl.addClass("is-invalid");
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
      inputEl.removeClass("is-invalid");
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

class FontImportModal extends import_obsidian2.Modal {
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
    const dropZone = contentEl.createDiv({ cls: "lfl-import-dropzone" });
    const iconContainer = dropZone.createDiv({ cls: "lfl-import-icon" });
    import_obsidian2.setIcon(iconContainer, "folder");
    dropZone.createDiv({ cls: "lfl-import-title", text: t("importDropTitle") });
    dropZone.createDiv({ cls: "lfl-import-subtitle", text: t("importDropSubtitle") });
    dropZone.createDiv({ cls: "lfl-import-hint", text: t("importDropHint") });
    const input = createEl("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".ttf,.otf,.woff,.woff2";
    input.addClass("lfl-hidden-input");
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
      dropZone.addClass("is-dragover");
    };
    dropZone.ondragleave = () => {
      dropZone.removeClass("is-dragover");
    };
    dropZone.ondrop = async (e) => {
      e.preventDefault();
      dropZone.removeClass("is-dragover");
      const transfer = e.dataTransfer;
      if (!transfer)
        return;
      const files = transfer.files;
      if (files.length === 0)
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
  const modal = new import_obsidian2.ConfirmationModal(app);
  modal.setTitle(title);
  modal.contentEl.createEl("p", {
    text: message,
    cls: "lfl-confirm-message"
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

class FontStatusModal extends import_obsidian2.Modal {
  rows;
  constructor(app, rows) {
    super(app);
    this.rows = rows;
  }
  onOpen() {
    const { contentEl, titleEl } = this;
    titleEl.setText(t("fontStatusTitle") || "Font status");
    contentEl.addClass("lfl-font-status");
    contentEl.createEl("p", {
      cls: "lfl-font-status-intro",
      text: t("fontStatusIntro") || "Which font each category uses, and where its metrics come from."
    });
    for (const row of this.rows) {
      contentEl.appendChild(this.renderRow(row));
    }
    const footer = contentEl.createDiv({ cls: "lfl-font-status-footer" });
    const closeEl = footer.createEl("button", { cls: "mod-cta", text: t("fontStatusClose") || "Close" });
    closeEl.addEventListener("click", () => this.close());
  }
  renderRow(row) {
    const card = createDiv({ cls: "lfl-font-status-card" });
    card.createDiv({ cls: "lfl-font-status-category", text: row.category });
    const fontEl = card.createDiv({ cls: "lfl-font-status-font" });
    fontEl.createSpan({ cls: "lfl-font-status-label", text: t("fontStatusFont") || "Font" });
    fontEl.createSpan({
      cls: "lfl-font-status-value lfl-font-status-value-strong",
      text: row.family || (t("fontStatusNone") || "None")
    });
    if (row.files) {
      const filesEl = card.createDiv({ cls: "lfl-font-status-field" });
      filesEl.createSpan({ cls: "lfl-font-status-label", text: t("fontStatusFiles") || "Files" });
      filesEl.createSpan({ cls: "lfl-font-status-value", text: row.files });
    }
    if (row.family) {
      const howEl = card.createDiv({ cls: "lfl-font-status-field lfl-font-status-field-stack" });
      howEl.createSpan({
        cls: "lfl-font-status-label",
        text: t("fontStatusHow") || "How the metrics are obtained"
      });
      const list = howEl.createEl("ol", { cls: "lfl-font-status-steps" });
      const steps = row.adaptation.length > 0 ? row.adaptation : [t("fontStatusPending") || "Waiting for the font to be resolved"];
      for (const step of steps) {
        list.createEl("li", { cls: "lfl-font-status-step", text: step });
      }
      if (row.source) {
        const sourceEl = card.createDiv({ cls: "lfl-font-status-field" });
        sourceEl.createSpan({ cls: "lfl-font-status-label", text: t("fontStatusSource") || "Source" });
        sourceEl.createSpan({ cls: "lfl-font-status-value", text: row.source });
      }
      if (row.gaps.length > 0) {
        const gapsEl = card.createDiv({ cls: "lfl-font-status-field lfl-font-status-field-stack" });
        gapsEl.createSpan({ cls: "lfl-font-status-label", text: t("fontStatusGaps") || "Not covered" });
        for (const gap of row.gaps) {
          gapsEl.createDiv({ cls: "lfl-font-status-gap", text: gap });
        }
      }
    }
    return card;
  }
  onClose() {
    this.contentEl.empty();
  }
}

// src/ui/settings/device-preset.ts
var import_obsidian3 = require("obsidian");
function renderDeviceAndPresetSection(tab, containerEl) {
  const syncWarningCallout = containerEl.createDiv({ cls: "callout", attr: { "data-callout": "info" } });
  const syncWarningTitle = syncWarningCallout.createDiv({ cls: "callout-title" });
  const syncWarningIcon = syncWarningTitle.createDiv({ cls: "callout-icon" });
  import_obsidian3.setIcon(syncWarningIcon, "info");
  syncWarningTitle.createDiv({ cls: "callout-title-inner", text: t("syncDelayTitle") });
  const syncWarningContent = syncWarningCallout.createDiv({ cls: "callout-content" });
  syncWarningContent.createEl("p", { text: t("syncDelayContent") });
  containerEl.createEl("h3", { text: t("headerPresetManagement") });
  new import_obsidian3.Setting(containerEl).setName(t("createPreset")).setDesc(t("createPresetDesc")).addText((text) => {
    text.setPlaceholder(t("presetNamePlaceholder"));
    tab._newPresetNameInput = text;
  }).addButton((btn) => {
    btn.setIcon("plus");
    btn.setTooltip(t("addPreset"));
    btn.onClick(async () => {
      const presetName = (tab._newPresetNameInput?.getValue() ?? "").trim();
      if (!presetName) {
        new import_obsidian3.Notice(t("presetNameRequired"), 3000);
        return;
      }
      const exists = tab.plugin.settings.presets.some((p) => p.name === presetName);
      if (exists) {
        new import_obsidian3.Notice(t("presetNameExists"), 3000);
        return;
      }
      await tab.plugin.createPreset(presetName);
      new import_obsidian3.Notice(`✓ ${t("presetCreated")}: ${presetName}`, 2000);
      tab.update();
    });
  });
  const deviceManagementHeader = containerEl.createDiv({ cls: "setting-item-heading-with-button" });
  deviceManagementHeader.createEl("h4", { text: t("headerDeviceManagement") });
  if (import_obsidian3.Platform.isMobile) {
    const calloutEl = containerEl.createDiv({ cls: "callout", attr: { "data-callout": "warning" } });
    const titleEl = calloutEl.createDiv({ cls: "callout-title" });
    import_obsidian3.setIcon(titleEl.createDiv({ cls: "callout-icon" }), "alert-triangle");
    titleEl.createDiv({ cls: "callout-title-inner", text: t("deviceLimitTitle") });
    calloutEl.createDiv({ cls: "callout-content" }).createEl("p", { text: t(import_obsidian3.Platform.isIosApp ? "deviceLimitBodyIos" : "deviceLimitBodyAndroid") });
  }
  const refreshBtn = deviceManagementHeader.createEl("button", { cls: "clickable-icon" });
  refreshBtn.setAttribute("aria-label", t("refreshDeviceList"));
  import_obsidian3.setIcon(refreshBtn, "refresh-cw");
  tab._addEventListener(refreshBtn, "click", async () => {
    await tab.plugin.loadSettings();
    tab.update();
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
    import_obsidian3.setIcon(editBtn, "edit");
    tab._addEventListener(editBtn, "click", async () => {
      new TextInputModal(tab.plugin.app, t("editPresetName"), t("presetNamePlaceholder"), preset.name, async (newName) => {
        if (newName !== preset.name) {
          await tab.plugin.renamePreset(preset.id, newName);
          tab.update();
        }
      }).open();
    });
    const copyBtn = presetActions.createEl("button", { cls: "clickable-icon" });
    copyBtn.setAttribute("aria-label", t("copyPresetCopy"));
    import_obsidian3.setIcon(copyBtn, "copy");
    tab._addEventListener(copyBtn, "click", async () => {
      const copyName = `${preset.name}${t("copySuffix")}`;
      await tab.plugin.copyPresetForDevice(preset.id, copyName);
      new import_obsidian3.Notice(`✓ ${t("presetCopied")}: ${copyName}`, 2000);
      tab.update();
    });
    if (preset.id !== "default-preset") {
      const deleteBtn = presetActions.createEl("button", { cls: "clickable-icon" });
      deleteBtn.setAttribute("aria-label", t("deletePreset"));
      import_obsidian3.setIcon(deleteBtn, "trash");
      tab._addEventListener(deleteBtn, "click", async () => {
        showConfirmDialog(tab.plugin.app, t("deletePreset"), t("deletePresetWarning"), async () => {
          await tab.plugin.deletePreset(preset.id);
          if (tab._activePresetId === preset.id) {
            const fallbackPreset = tab.plugin._getDevicePreset();
            tab._activePresetId = fallbackPreset ? fallbackPreset.id : "default-preset";
          }
          tab.update();
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
      const deviceId = e.dataTransfer?.getData("text/plain") ?? "";
      const targetPresetId = devicesContainer.dataset.presetId ?? "";
      await tab.plugin.assignDeviceToPreset(deviceId, targetPresetId);
      tab.update();
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
        const deviceInfoContainer = deviceItem.createDiv({ cls: "lfl-device-info" });
        const osIcon = deviceInfoContainer.createSpan({
          cls: "device-os-icon"
        });
        const osIconClasses = {
          android: "os-android",
          ios: "os-ios",
          ipados: "os-ipados",
          windows: "os-windows",
          macos: "os-macos",
          linux: "os-linux",
          unknown: "os-default"
        };
        const detectedOs = tab.plugin._getDeviceOs(deviceId);
        osIcon.addClass(osIconClasses[detectedOs] || "os-default");
        const textContainer = deviceInfoContainer.createDiv({ cls: "lfl-device-text" });
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
          linux: "Linux",
          unknown: ""
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
          cls: "clickable-icon device-edit-btn",
          attr: { "aria-label": t("editDeviceName") }
        });
        import_obsidian3.setIcon(editBtn2, "edit");
        tab._addEventListener(editBtn2, "click", async (e) => {
          e.stopPropagation();
          new TextInputModal(tab.plugin.app, t("editDeviceName"), t("deviceNamePlaceholder"), deviceName, async (newName) => {
            if (newName !== deviceName) {
              await tab.plugin.updateDeviceName(deviceId, newName);
              tab.update();
            }
          }).open();
        });
        if (!isCurrent) {
          const removeBtn = btnContainer.createEl("button", {
            cls: "clickable-icon",
            attr: { "aria-label": t("removeDevice") }
          });
          import_obsidian3.setIcon(removeBtn, "trash-2");
          tab._addEventListener(removeBtn, "click", async (e) => {
            e.stopPropagation();
            showConfirmDialog(tab.plugin.app, t("removeDevice"), t("confirmRemoveDevice").replace("{0}", deviceName), async () => {
              await tab.plugin.removeDeviceFromPresets(deviceId);
              tab.update();
            }, true);
          });
        }
        if (isCurrent) {
          deviceItem.addClass("current-device");
        }
        if (import_obsidian3.Platform.isMobile) {
          const moveBtn = btnContainer.createEl("button", {
            cls: "clickable-icon",
            attr: { "aria-label": t("moveDeviceToPreset") }
          });
          import_obsidian3.setIcon(moveBtn, "move");
          tab._addEventListener(moveBtn, "click", async (e) => {
            e.stopPropagation();
            const selectEl = createEl("select");
            selectEl.addClass("lfl-hidden-select");
            tab.plugin.settings.presets.forEach((p) => {
              const option = selectEl.appendChild(createEl("option"));
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
              try {
                const targetPresetId = selectEl.value;
                await tab.plugin.assignDeviceToPreset(deviceId, targetPresetId);
                new import_obsidian3.Notice(`✓ ${t("deviceReassigned")}`, 2000);
                tab.update();
              } catch (error) {
                tab.plugin._logError("[Local Font Loader] Failed to reassign the device:", error);
              } finally {
                selectEl.remove();
              }
            });
            selectEl.addEventListener("blur", () => {
              selectEl.remove();
            });
          });
        }
        deviceItem.draggable = true;
        tab._addEventListener(deviceItem, "dragstart", (e) => {
          e.dataTransfer?.setData("text/plain", deviceId);
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
          new import_obsidian3.Notice(t("cleanupDevicesNone"), 3000);
          return;
        }
        const deviceNames = prunable.map((device) => device.name).join("、");
        showConfirmDialog(tab.plugin.app, t("cleanupDevices"), t("confirmCleanupDevices").replace("{0}", deviceNames), async () => {
          const removedCount = await tab.plugin.pruneUnboundDevices();
          new import_obsidian3.Notice(`✓ ${t("cleanupDevicesDone").replace("{0}", String(removedCount))}`, 3000);
          tab.update();
        }, true);
      });
    }
  });
  containerEl.createEl("h4", { text: t("devicePresetManagement"), cls: "setting-item-heading" });
  const devicePreset = tab.plugin._getDevicePreset();
  new import_obsidian3.Setting(containerEl).setName(t("currentDevicePreset")).setDesc(t("currentDevicePresetDesc")).addDropdown((dropdown) => {
    tab.plugin.settings.presets.forEach((preset) => {
      const label = preset.id === "default-preset" && preset.targetDevices.length === 0 ? `${preset.name} (${t("global")})` : preset.name;
      dropdown.addOption(preset.id, label);
    });
    dropdown.setValue(devicePreset ? devicePreset.id : "default-preset");
    dropdown.onChange(async (newPresetId) => {
      await tab.plugin.assignDeviceToPreset(tab.plugin.currentDeviceId, newPresetId);
      new import_obsidian3.Notice(`✓ ${t("deviceReassigned")}`, 2000);
      tab.update();
    });
  }).addButton((btn) => {
    btn.setIcon("refresh-cw");
    btn.setTooltip(t("refreshDeviceList"));
    btn.onClick(() => tab.update());
  });
  new import_obsidian3.Setting(containerEl).setName(t("copyPresetCopy")).setDesc(t("copyPresetCopyDesc")).addButton((btn) => {
    btn.setButtonText(t("copyPresetCopy"));
    btn.onClick(async () => {
      const devicePreset2 = tab.plugin._getDevicePreset();
      if (!devicePreset2) {
        return;
      }
      const copyName = `${devicePreset2.name}${t("copySuffix")}`;
      await tab.plugin.copyPresetForDevice(devicePreset2.id, copyName);
      new import_obsidian3.Notice(`✓ ${t("presetCopied")}: ${copyName}`, 2000);
      tab.update();
    });
  });
}

// src/ui/settings/directory-application.ts
var import_obsidian6 = require("obsidian");

// src/ui/settings/folder-input.ts
var import_obsidian4 = require("obsidian");
var import_obsidian5 = require("obsidian");
class FolderInputSuggest extends import_obsidian4.AbstractInputSuggest {
  onPick;
  constructor(app, textInputEl, onPick) {
    super(app, textInputEl);
    this.onPick = onPick;
  }
  getSuggestions(query) {
    const needle = query.toLowerCase();
    return this.vaultFolders().filter((folder) => folder.path.toLowerCase().includes(needle));
  }
  renderSuggestion(folder, el) {
    el.setText(folder.path);
  }
  selectSuggestion(folder) {
    this.setValue(folder.path);
    this.onPick(folder.path);
    this.close();
  }
  vaultFolders() {
    return this.app.vault.getAllLoadedFiles().filter((file) => file instanceof import_obsidian5.TFolder).sort((a, b) => a.path.localeCompare(b.path));
  }
}

class FolderPickerModal extends import_obsidian4.FuzzySuggestModal {
  onPick;
  constructor(app, onPick) {
    super(app);
    this.onPick = onPick;
    this.setPlaceholder(t("selectFolder"));
  }
  getItems() {
    return this.app.vault.getAllLoadedFiles().filter((file) => file instanceof import_obsidian5.TFolder).sort((a, b) => a.path.localeCompare(b.path));
  }
  getItemText(folder) {
    return folder.path;
  }
  onChooseItem(folder) {
    this.onPick(folder.path);
  }
}
function addFolderPathInput(setting, app, initialValue, onChange, placeholder = "") {
  let field = null;
  setting.addText((text) => {
    field = text;
    text.setValue(initialValue);
    if (placeholder) {
      text.setPlaceholder(placeholder);
    }
    text.onChange((value) => onChange(value));
    new FolderInputSuggest(app, text.inputEl, (path) => {
      text.setValue(path);
      onChange(path);
    });
  });
  setting.addButton((button) => button.setButtonText(t("browseFolder")).setTooltip(t("browseFolderDesc")).onClick(() => {
    new FolderPickerModal(app, (path) => {
      field?.setValue(path);
      onChange(path);
    }).open();
  }));
}

// src/ui/settings/directory-application.ts
function renderDirectoryAndApplicationSection(tab, containerEl) {
  containerEl.createEl("h3", { text: t("headerDirectoryConfig") });
  const sourceDirSetting = new import_obsidian6.Setting(containerEl).setName(t("fontSourceDir")).setDesc(t("fontSourceDirDesc"));
  addFolderPathInput(sourceDirSetting, tab.app, tab.plugin.settings.fontSourceDir, async (value) => {
    try {
      tab.plugin.settings.fontSourceDir = value;
      await tab.plugin.saveSettings();
    } catch (error) {
      tab.plugin._logError("[Local Font Loader] Failed to save the font source directory:", error);
    }
  }, "Local-Fonts");
  sourceDirSetting.addButton((btn) => btn.setButtonText(t("scanFonts")).onClick(async () => {
    await tab.plugin.scanFonts();
    new import_obsidian6.Notice("✓ Font list updated");
    tab.update();
  }));
  new import_obsidian6.Setting(containerEl).setName(t("autoLoad")).setDesc(t("autoLoadDesc")).addToggle((toggle) => toggle.setValue(tab.plugin.settings.autoLoadOnStartup).onChange(async (value) => {
    tab.plugin.settings.autoLoadOnStartup = value;
    await tab.plugin.saveSettings();
  }));
  containerEl.createEl("h3", { text: t("headerFontApplication") });
  const currentDevicePreset = tab.plugin._getDevicePreset();
  if (!tab._activePresetId) {
    tab._activePresetId = currentDevicePreset ? currentDevicePreset.id : "default-preset";
  }
  new import_obsidian6.Setting(containerEl).setName(t("selectPresetToEdit")).setDesc(t("selectPresetToEditDesc")).addDropdown((dropdown) => {
    tab.plugin.settings.presets.forEach((preset) => {
      const label = preset.id === "default-preset" && preset.targetDevices.length === 0 ? `${preset.name} (${t("global")})` : preset.name;
      dropdown.addOption(preset.id, label);
    });
    dropdown.setValue(tab._activePresetId);
    dropdown.onChange(async (newPresetId) => {
      tab._activePresetId = newPresetId;
      tab.update();
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
    import_obsidian6.setIcon(presetInfoIcon, "list-checks");
    presetInfoTitle.createDiv({
      cls: "callout-title-inner",
      text: `${t("presetName")}: ${activePreset.name}`
    });
    const presetInfoContent = presetInfoEl.createDiv({ cls: "callout-content" });
    presetInfoContent.createEl("p", {
      text: `${t("presetId")}: ${activePreset.id}`,
      cls: "lfl-preset-id"
    });
    if (activePreset.id === "default-preset" && activePreset.targetDevices.length === 0) {
      const warningContainer = presetInfoContent.createEl("p", { cls: "lfl-global-warning" });
      const warningIcon = warningContainer.createSpan({ cls: "lfl-warning-icon" });
      import_obsidian6.setIcon(warningIcon, "alert-triangle");
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
    tab.plugin._logError("[Local Font Loader] Active preset not found:", tab._activePresetId);
    return;
  }
  const activePresetFonts = activePresetForFonts.fonts || {};
  for (const fontType of fontTypes) {
    const settingItem = new import_obsidian6.Setting(containerEl).setName(fontType.name).setDesc(fontType.desc);
    const selectedFont = activePresetFonts[fontType.key];
    const fontExists = tab.plugin.isFontAvailable(selectedFont);
    if (selectedFont && !fontExists) {
      const warningIcon = settingItem.nameEl.createSpan({ cls: "font-missing-icon" });
      import_obsidian6.setIcon(warningIcon, "x");
      warningIcon.setAttribute("aria-label", t("fontNotFound"));
    }
    const mathVerdict = fontType.key === "math" && selectedFont && fontExists ? tab.plugin._evaluateMathFont(selectedFont) : null;
    if (mathVerdict && (mathVerdict.status === "mismatch" || mathVerdict.status === "notMathFont")) {
      const mathWarningIcon = settingItem.nameEl.createSpan({ cls: "font-incompatible-icon" });
      import_obsidian6.setIcon(mathWarningIcon, "alert-triangle");
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
        const allUsable = familyFonts.every((f) => tab.plugin._getFontExists(f));
        const label = allUsable ? `${familyName} ✓` : familyName;
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
          tab.update();
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
          const warningCallout = containerEl.createDiv({ cls: "lfl-callout" });
          const warningMd = `> [!warning] ${t("incompleteVariantTitle")}
> ${t("incompleteVariantBody", { fontFamily: fontForVariantCheck, variantCount: variants.length, variantList })}`;
          tab._renderMarkdown(warningCallout, warningMd);
        }
      }
      if (fontType.key === "monospace") {
        const infoCallout = containerEl.createDiv({ cls: "lfl-callout" });
        const infoMd = `> [!info] ${t("monospaceRequirement")}
> ${t("monospaceRequirementBody")}`;
        tab._renderMarkdown(infoCallout, infoMd);
      }
      if (fontType.key === "math") {
        const infoCallout = containerEl.createDiv({ cls: "lfl-callout" });
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
var import_obsidian7 = require("obsidian");

// src/ui/font-family-view.ts
var TOGGLE_SELECTOR = ".font-family-toggle";
var VARIANTS_SELECTOR = ".font-variants";
function setFontFamilyExpanded(familyEl, expanded) {
  familyEl.querySelector(TOGGLE_SELECTOR)?.toggleClass("is-open", expanded);
  familyEl.querySelector(VARIANTS_SELECTOR)?.toggleClass("is-open", expanded);
}
function isFontFamilyExpanded(familyEl) {
  return familyEl.querySelector(VARIANTS_SELECTOR)?.hasClass("is-open") ?? false;
}

// src/ui/settings/font-status.ts
function renderFontStatusSection(tab, containerEl) {
  containerEl.createEl("h3", { text: t("headerFontFileConfig") });
  if (!tab._fontFilter) {
    tab._fontFilter = "all";
  }
  const buttonContainerEl = containerEl.createDiv({ cls: "lfl-toolbar" });
  const filterGroup = buttonContainerEl.createDiv({ cls: "lfl-toolbar-group" });
  const filterButtons = [
    { filter: "all", icon: "list", label: t("filterAll") || "全部" },
    { filter: "available", icon: "check", label: t("legendConverted") },
    { filter: "notExist", icon: "help-circle", label: t("legendNotExist") }
  ];
  const filterButtonElements = [];
  filterButtons.forEach((btnConfig) => {
    const isActive = tab._fontFilter === btnConfig.filter;
    const btn = filterGroup.createEl("button", {
      cls: isActive ? "lfl-chip is-active" : "lfl-chip",
      attr: { "aria-label": btnConfig.label }
    });
    const iconEl = btn.createSpan({ cls: "lfl-chip-icon" });
    import_obsidian7.setIcon(iconEl, btnConfig.icon);
    btn.createSpan({ text: btnConfig.label });
    filterButtonElements.push({ btn, filter: btnConfig.filter });
  });
  buttonContainerEl.createDiv({ cls: "lfl-toolbar-divider" });
  const expandCollapseGroup = buttonContainerEl.createDiv({ cls: "lfl-toolbar-group" });
  const expandAllBtn = expandCollapseGroup.createEl("button", {
    cls: "lfl-chip",
    attr: { "aria-label": t("expandAll") }
  });
  const expandIcon = expandAllBtn.createSpan({ cls: "lfl-chip-icon" });
  import_obsidian7.setIcon(expandIcon, "chevrons-down");
  expandAllBtn.createSpan({ text: t("expandAll") });
  tab._addEventListener(expandAllBtn, "click", () => {
    const allFamilies = fontListEl.querySelectorAll(".font-family-item");
    allFamilies.forEach((familyItem) => {
      setFontFamilyExpanded(familyItem, true);
    });
  });
  const collapseAllBtn = expandCollapseGroup.createEl("button", {
    cls: "lfl-chip",
    attr: { "aria-label": t("collapseAll") }
  });
  const collapseIcon = collapseAllBtn.createSpan({ cls: "lfl-chip-icon" });
  import_obsidian7.setIcon(collapseIcon, "chevrons-up");
  collapseAllBtn.createSpan({ text: t("collapseAll") });
  tab._addEventListener(collapseAllBtn, "click", () => {
    const allFamilies = fontListEl.querySelectorAll(".font-family-item");
    allFamilies.forEach((familyItem) => {
      setFontFamilyExpanded(familyItem, false);
    });
  });
  const legendEl = containerEl.createDiv({ cls: "lfl-legend" });
  const legendsContainer = legendEl.createDiv({ cls: "lfl-legend-items" });
  legendsContainer.createDiv({
    text: t("fontFileStatus"),
    cls: "lfl-legend-title"
  });
  legendsContainer.createDiv({ cls: "lfl-legend-divider" });
  const legends = [
    { icon: "check", state: "available", text: t("legendConverted") },
    { icon: "help-circle", state: "missing", text: t("legendNotExist") }
  ];
  legends.forEach((legend) => {
    const item = legendsContainer.createDiv({ cls: "lfl-legend-item" });
    const iconEl = item.createSpan({ cls: `lfl-legend-icon is-${legend.state}` });
    import_obsidian7.setIcon(iconEl, legend.icon);
    item.createSpan({ text: legend.text });
  });
  const rescanBtn = legendEl.createEl("button", {
    cls: "lfl-chip lfl-chip--rescan",
    attr: { "aria-label": t("rescanFonts") || "重新扫描" }
  });
  const rescanIcon = rescanBtn.createSpan({ cls: "lfl-chip-icon" });
  import_obsidian7.setIcon(rescanIcon, "rotate-cw");
  rescanBtn.createSpan({ text: t("rescanFonts") || "重新扫描" });
  tab._addEventListener(rescanBtn, "click", async () => {
    rescanBtn.disabled = true;
    await tab.plugin.scanFonts();
    new import_obsidian7.Notice(t("fontsRescanned") || "✓ 字体已重新扫描");
    tab.update();
  });
  const fontListEl = containerEl.createDiv({ cls: "lfl-font-list" });
  filterButtonElements.forEach(({ btn, filter }) => {
    tab._addEventListener(btn, "click", () => {
      tab._fontFilter = filter;
      fontListEl.empty();
      if (tab.plugin.settings.availableFonts.length === 0) {
        fontListEl.createEl("div", {
          text: t("notFoundFontFamily"),
          cls: "lfl-empty-note"
        });
      } else {
        tab.renderFontFamilies(fontListEl, tab._fontFilter);
      }
      filterButtonElements.forEach(({ btn: button, filter: f }) => {
        button.toggleClass("is-active", tab._fontFilter === f);
      });
    });
  });
  if (tab.plugin.settings.availableFonts.length === 0) {
    fontListEl.createEl("div", {
      text: t("notFoundFontFamily"),
      cls: "lfl-empty-note"
    });
  } else {
    tab.renderFontFamilies(fontListEl, tab._fontFilter);
  }
  const fontOperationsEl = containerEl.createDiv({ cls: "lfl-font-actions" });
  const importBtn = fontOperationsEl.createEl("button", {
    text: t("importFont"),
    cls: "mod-cta"
  });
  tab._addEventListener(importBtn, "click", () => {
    const modal = new FontImportModal(tab.plugin.app, tab.plugin, async (files) => {
      importBtn.disabled = true;
      importBtn.textContent = t("importing") || "导入中...";
      try {
        await tab.plugin.importFontsFromFiles(files);
        new import_obsidian7.Notice(t("importedFonts", { count: files.length }));
        await tab.plugin.scanFonts();
        tab._debouncedDisplay();
      } catch (error) {
        tab.plugin._logError("[Local Font Loader] Import failed:", error);
        new import_obsidian7.Notice(t("importError") || "导入失败");
      } finally {
        importBtn.disabled = false;
        importBtn.textContent = t("importFont");
      }
    });
    modal.open();
  });
}

// src/ui/settings/fallback.ts
var import_obsidian8 = require("obsidian");
function renderFallbackSection(tab, containerEl) {
  containerEl.createEl("h3", { text: t("headerFallback") });
  new import_obsidian8.Setting(containerEl).setName(t("deleteUnusedFonts")).setDesc(t("deleteUnusedFontsDesc")).addButton((btn) => btn.setButtonText(t("deleteUnusedFonts")).setDestructive().onClick(async () => {
    const unusedFonts = tab._getUnusedFonts();
    if (unusedFonts.length === 0) {
      new import_obsidian8.Notice(t("noUnusedFonts"));
      return;
    }
    showConfirmDialog(tab.plugin.app, t("confirmDelete"), t("confirmDeleteUnusedFonts").replace("{count}", String(unusedFonts.length)), async () => {
      await tab.deleteUnusedFonts();
    }, true);
  }));
  new import_obsidian8.Setting(containerEl).setName(t("applyNow")).setDesc(t("applyNowDesc")).addButton((btn) => btn.setButtonText(t("applyFonts")).setCta().onClick(async () => {
    await tab.plugin.applyFonts();
    new import_obsidian8.Notice(t("fontsApplied"));
  }));
}

// src/ui/settings-tab.ts
class FontManagerSettingTab extends import_obsidian9.PluginSettingTab {
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
    const listener = handler;
    element.addEventListener(event, listener, options);
    this._eventListeners.push({ element, event, handler: listener, options });
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
    const component = new import_obsidian9.Component;
    component.load();
    this._markdownComponents.push(component);
    import_obsidian9.MarkdownRenderer.render(this.app, markdown, el, "", component);
  }
  _debouncedDisplay() {
    if (this._displayDebounceTimer) {
      window.clearTimeout(this._displayDebounceTimer);
    }
    this._displayDebounceTimer = window.setTimeout(() => {
      this.update();
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
  getSettingDefinitions() {
    return [{
      type: "group",
      items: [{
        name: t("pluginName"),
        render: (setting) => {
          setting.settingEl.addClass("lfl-settings-page");
          this._renderPage(setting.settingEl);
        }
      }]
    }];
  }
  _renderPage(containerEl) {
    this._isVisible = true;
    this._cleanupEventListeners();
    const scrollParent = containerEl.closest(".vertical-tab-content");
    const savedScrollTop = scrollParent ? scrollParent.scrollTop : 0;
    containerEl.empty();
    new import_obsidian9.Setting(containerEl).setName(t("pluginName")).setHeading();
    const overrideInfoCallout = containerEl.createDiv({ cls: "callout", attr: { "data-callout": "info" } });
    const overrideInfoTitle = overrideInfoCallout.createDiv({ cls: "callout-title" });
    const overrideInfoIcon = overrideInfoTitle.createDiv({ cls: "callout-icon" });
    import_obsidian9.setIcon(overrideInfoIcon, "info");
    overrideInfoTitle.createDiv({ cls: "callout-title-inner", text: t("overrideSystemSettingsTitle") });
    const overrideInfoContent = overrideInfoCallout.createDiv({ cls: "callout-content" });
    overrideInfoContent.createEl("p", { text: t("overrideSystemSettingsContent") });
    const warningCallout = containerEl.createDiv({ cls: "callout", attr: { "data-callout": "warning" } });
    const warningTitle = warningCallout.createDiv({ cls: "callout-title" });
    const warningIcon = warningTitle.createDiv({ cls: "callout-icon" });
    import_obsidian9.setIcon(warningIcon, "alert-triangle");
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
    const exampleCalloutEl = containerEl.createDiv({ cls: "lfl-callout lfl-callout--lead" });
    let exampleMarkdown = `> [!example] ${t("latinFontInfo")}
> ${t("latinFontInfoDesc")}`;
    if (isLatinScriptLocale()) {
      exampleMarkdown += `
>
> ${t("latinFontInfoDescForLatinUsers")}`;
    }
    this._renderMarkdown(exampleCalloutEl, exampleMarkdown);
    new import_obsidian9.Setting(containerEl).setName(t("latinFontEnabled")).setDesc(t("latinFontEnabledDesc")).addToggle((toggle) => toggle.setValue(activePreset.latinFontEnabled ?? false).onChange(async (value) => {
      activePreset.latinFontEnabled = value;
      await this.plugin.saveSettings();
      await this.plugin.applyFonts();
      this.update();
    }));
    if (activePreset.latinFontEnabled) {
      new import_obsidian9.Setting(containerEl).setName(t("latinFont")).setDesc(t("latinFontDesc")).addDropdown((dropdown) => {
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
            const allUsable = familyFonts.every((f) => this.plugin._getFontExists(f));
            const variantCount = familyFonts.length;
            const label = allUsable ? `${familyName} ✓ (${variantCount})` : `${familyName} (${variantCount})`;
            dropdown.addOption(familyName, label);
          });
        }
        if (otherFamilies.length > 0) {
          dropdown.addOption("", t("otherFontsLabel"));
          otherFamilies.forEach((familyName) => {
            const familyFonts = this.plugin.settings.availableFonts.filter((f) => (f.familyName || f.name) === familyName);
            const allUsable = familyFonts.every((f) => this.plugin._getFontExists(f));
            const variantCount = familyFonts.length;
            const label = allUsable ? `${familyName} ✓ (${variantCount})` : `${familyName} (${variantCount})`;
            dropdown.addOption(familyName, label);
          });
        }
        dropdown.setValue(activePreset.fonts.latin ?? "");
        dropdown.onChange(async (value) => {
          activePreset.fonts.latin = value;
          await this.plugin.saveSettings();
          await this.plugin.applyFonts();
          window.requestAnimationFrame(() => {
            this.update();
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
          const warningCalloutEl = containerEl.createDiv({ cls: "lfl-callout" });
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
        new import_obsidian9.Setting(containerEl).setName(scope.name).setDesc(scope.desc).addToggle((toggle) => toggle.setValue(activePreset.latinFontScope?.[scope.key] ?? true).onChange(async (value) => {
          if (!activePreset.latinFontScope) {
            activePreset.latinFontScope = { letters: true, numbers: true, punctuation: true, symbols: true };
          }
          activePreset.latinFontScope[scope.key] = value;
          await this.plugin.saveSettings();
          await this.plugin.applyFonts();
        }));
      });
      new import_obsidian9.Setting(containerEl).setName(t("latinFontForUI")).setDesc(t("latinFontForUIDesc")).addToggle((toggle) => toggle.setValue(this.plugin.settings.latinFontForUI ?? false).onChange(async (value) => {
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
    new import_obsidian9.Setting(containerEl).setName(t("headingApplyToFileTitle")).setDesc(t("headingApplyToFileTitleDesc")).addToggle((toggle) => toggle.setValue(activePreset.headingApplyToFileTitle || false).onChange(async (value) => {
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
      } else if (filter === "available") {
        return fonts.some((f) => this.plugin._getFontExists(f));
      } else if (filter === "notExist") {
        return fonts.some((f) => !this.plugin._getFontExists(f));
      }
      return true;
    });
    if (filteredFamilies.length === 0) {
      let emptyMessage = t("noAvailableFonts") || "没有可用的字体";
      if (filter === "notExist") {
        emptyMessage = t("noNotExistFonts") || "没有缺失的字体";
      }
      containerEl.createEl("div", {
        text: emptyMessage,
        cls: "lfl-empty-note"
      });
      return;
    }
    for (const [familyName, fonts] of filteredFamilies) {
      const familyEl = containerEl.createDiv({ cls: "font-family-item" });
      const headerEl = familyEl.createDiv({ cls: "font-family-header" });
      const leftEl = headerEl.createDiv({ cls: "font-family-title" });
      const expandIcon = leftEl.createSpan({
        cls: "font-family-toggle",
        attr: { "aria-label": t("expandCollapse") }
      });
      import_obsidian9.setIcon(expandIcon, "chevron-right");
      leftEl.createSpan({
        text: familyName,
        cls: "font-family-name"
      });
      const variantsEl = familyEl.createDiv({ cls: "font-variants" });
      this._addEventListener(headerEl, "click", () => {
        setFontFamilyExpanded(familyEl, !isFontFamilyExpanded(familyEl));
      });
      fonts.forEach((font) => {
        const variantEl = variantsEl.createDiv({ cls: "font-variant-item" });
        const infoEl = variantEl.createDiv({ cls: "font-variant-info" });
        const fontSourceExists = this.plugin._getFontExists(font);
        const status = fontSourceExists ? "available" : "missing";
        const iconName = fontSourceExists ? "check" : "help-circle";
        const statusIconEl = infoEl.createSpan({
          cls: `font-variant-status is-${status}`
        });
        import_obsidian9.setIcon(statusIconEl, iconName);
        const variantLabels = {
          regular: "Regular",
          italic: "Italic",
          bold: "Bold",
          bolditalic: "Bold Italic"
        };
        const variantLabel = variantLabels[font.variantType] || "Unknown";
        infoEl.createSpan({
          text: variantLabel,
          cls: "font-variant-label"
        });
        const actionsEl = variantEl.createDiv({ cls: "font-variant-actions" });
        const deleteBtn = actionsEl.createEl("button", {
          cls: "font-icon-btn",
          attr: {
            title: t("deleteThisFont"),
            "aria-label": t("deleteThisFont")
          }
        });
        import_obsidian9.setIcon(deleteBtn, "trash-2");
        this._addEventListener(deleteBtn, "click", async () => {
          showConfirmDialog(this.plugin.app, t("confirmDelete"), t("confirmDeleteFont").replace("{fontName}", font.name), async () => {
            await this.deleteSingleFont(font);
            this.update();
          }, true);
        });
      });
    }
  }
  async deleteSingleFont(font) {
    try {
      try {
        await this.plugin.app.vault.adapter.remove(font.path);
      } catch {
        this.plugin._log(`[Local Font Loader] 源文件不存在，跳过删除: ${font.path}`);
      }
      const index = this.plugin.settings.availableFonts.indexOf(font);
      if (index > -1) {
        this.plugin.settings.availableFonts.splice(index, 1);
      }
      await this.plugin.saveSettings();
      new import_obsidian9.Notice(t("deletedFont", { fontName: font.name }));
    } catch (error) {
      this.plugin._logError(`[Local Font Loader] 删除失败: ${font.name}`, error);
      new import_obsidian9.Notice(t("deleteFailedError", { error: error.message }));
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
      new import_obsidian9.Notice(t("noUnusedFonts"));
      return;
    }
    this.plugin._log(`[Local Font Loader] Starting to delete unused fonts (${unusedFonts.length} fonts)...`);
    let deleted = 0;
    try {
      for (const font of unusedFonts) {
        try {
          try {
            await this.app.vault.adapter.remove(font.path);
          } catch {
            this.plugin._log(`[Local Font Loader] 源文件不存在，跳过删除: ${font.path}`);
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
      new import_obsidian9.Notice(t("deletedUnusedFonts", { count: deleted }));
      this.plugin._log(`[Local Font Loader] Deleted ${deleted} unused fonts`);
      this.update();
    } catch (error) {
      this.plugin._logError("[Local Font Loader] 批量删除失败:", error);
      new import_obsidian9.Notice(t("deleteError"));
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

// src/math-standards/types.ts
function matchByFamilyName(adapter, familyName) {
  const want = familyName.trim().toLowerCase();
  return adapter.families.some((f) => f.trim().toLowerCase() === want);
}

// src/math-standards/opentype-math.ts
function makeReader(bytes) {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return {
    u16: (o) => dv.getUint16(o),
    i16: (o) => dv.getInt16(o),
    u32: (o) => dv.getUint32(o),
    bytes
  };
}
function findTable(dv, tag) {
  const numTables = dv.getUint16(4);
  for (let i = 0;i < numTables; i++) {
    const rec = 12 + i * 16;
    const t2 = String.fromCharCode(dv.getUint8(rec), dv.getUint8(rec + 1), dv.getUint8(rec + 2), dv.getUint8(rec + 3));
    if (t2 === tag) {
      return { offset: dv.getUint32(rec + 8), length: dv.getUint32(rec + 12) };
    }
  }
  return null;
}
function isCollection(dv) {
  const tag = String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3));
  return tag === "ttcf";
}
function readOpenTypeMathTable(binary) {
  try {
    const bytes = new Uint8Array(binary);
    const dv = new DataView(binary);
    if (binary.byteLength < 12)
      return null;
    let base = 0;
    if (isCollection(dv)) {
      const numFonts = dv.getUint32(8);
      if (numFonts < 1)
        return null;
      base = dv.getUint32(12);
    }
    const header = findTable(new DataView(binary, base), "MATH");
    if (!header)
      return null;
    const mathOff = base + header.offset;
    if (mathOff + 10 > binary.byteLength)
      return null;
    const version = dv.getUint16(mathOff);
    if (version !== 1)
      return null;
    const constantsOff = mathOff + dv.getUint16(mathOff + 4);
    const glyphInfoOff = mathOff + dv.getUint16(mathOff + 6);
    const variantsOff = mathOff + dv.getUint16(mathOff + 8);
    const unitsPerEm = readUnitsPerEm(dv, base) || 1000;
    const toEm = (design) => design / unitsPerEm;
    const r = makeReader(bytes.subarray(mathOff));
    const constants = readConstants(r, constantsOff - mathOff, toEm);
    const info = readGlyphInfo(r, glyphInfoOff - mathOff, toEm);
    const variants = readVariants(r, variantsOff - mathOff, toEm);
    return {
      unitsPerEm,
      constants,
      italicCorrection: info.italicCorrection,
      extendedShapes: info.extendedShapes,
      vertVariants: variants.vert,
      horizVariants: variants.horiz,
      minConnectorOverlap: variants.minConnectorOverlap
    };
  } catch {
    return null;
  }
}
function readUnitsPerEm(dv, base) {
  try {
    const head = findTable(new DataView(dv.buffer, dv.byteOffset + base), "head");
    if (!head)
      return 0;
    return dv.getUint16(base + head.offset + 18);
  } catch {
    return 0;
  }
}
function valueRecord(r, at, toEm) {
  return toEm(r.i16(at));
}
function readConstants(r, at, toEm) {
  const out = {};
  try {
    let p = at;
    out.scriptPercentScaleDown = r.u16(p) / 100;
    p += 2;
    out.scriptScriptPercentScaleDown = r.u16(p) / 100;
    p += 2;
    p += 2;
    p += 2;
    p += 4;
    out.axisHeight = valueRecord(r, p, toEm);
    p += 4;
    p += 31 * 4;
    out.fractionRuleThickness = valueRecord(r, p, toEm);
    p += 4;
    p += 6 * 4;
    out.overbarExtraAscender = valueRecord(r, p, toEm);
    p += 4;
    p += 2 * 4;
    out.underbarExtraDescender = valueRecord(r, p, toEm);
    p += 4;
    p += 2 * 4;
    out.radicalRuleThickness = valueRecord(r, p, toEm);
  } catch {}
  return out;
}
function readCoverage(r, at) {
  try {
    const format = r.u16(at);
    const ids = [];
    if (format === 1) {
      const count = r.u16(at + 2);
      for (let i = 0;i < count; i++)
        ids.push(r.u16(at + 4 + i * 2));
    } else if (format === 2) {
      const ranges = r.u16(at + 2);
      for (let i = 0;i < ranges; i++) {
        const rec = at + 4 + i * 6;
        const start = r.u16(rec);
        const end = r.u16(rec + 2);
        for (let g = start;g <= end; g++)
          ids.push(g);
      }
    }
    return ids;
  } catch {
    return [];
  }
}
function readGlyphInfo(r, at, toEm) {
  const italicCorrection = {};
  const extendedShapes = new Set;
  try {
    const italicsOff = at + r.u16(at);
    const topAccentOff = at + r.u16(at + 2);
    const extShapeOff = at + r.u16(at + 4);
    if (italicsOff > at) {
      const covOff = italicsOff + r.u16(italicsOff);
      const count = r.u16(italicsOff + 2);
      const ids = readCoverage(r, covOff);
      for (let i = 0;i < Math.min(count, ids.length); i++) {
        italicCorrection[String(ids[i])] = valueRecord(r, italicsOff + 4 + i * 4, toEm);
      }
    }
    if (extShapeOff > at) {
      const ids = readCoverage(r, extShapeOff);
      for (const id of ids)
        extendedShapes.add(id);
    }
  } catch {}
  return { italicCorrection, extendedShapes };
}
function readVariants(r, at, toEm) {
  const vert = {};
  const horiz = {};
  let minConnectorOverlap = 0;
  try {
    minConnectorOverlap = toEm(r.u16(at));
    const vertCovOff = at + r.u16(at + 2);
    const horizCovOff = at + r.u16(at + 4);
    const vertCount = r.u16(at + 6);
    const horizCount = r.u16(at + 8);
    const vertArrOff = at + 10;
    const horizArrOff = vertArrOff + vertCount * 2;
    const readSet = (covOff, arrOff, count, into) => {
      const ids = readCoverage(r, covOff);
      for (let i = 0;i < Math.min(count, ids.length); i++) {
        const constructionOff = at + r.u16(arrOff + i * 2);
        into[String(ids[i])] = readConstruction(r, constructionOff, toEm);
      }
    };
    if (vertCount > 0)
      readSet(vertCovOff, vertArrOff, vertCount, vert);
    if (horizCount > 0)
      readSet(horizCovOff, horizArrOff, horizCount, horiz);
  } catch {}
  return { vert, horiz, minConnectorOverlap };
}
function readConstruction(r, at, toEm) {
  const variants = [];
  let assembly = null;
  try {
    const assemblyOff = r.u16(at);
    const variantCount = r.u16(at + 2);
    for (let i = 0;i < variantCount; i++) {
      const rec = at + 4 + i * 4;
      variants.push({ glyphId: r.u16(rec), advance: toEm(r.u16(rec + 2)) });
    }
    if (assemblyOff > 0) {
      const a = at + assemblyOff;
      const italic = valueRecord(r, a, toEm);
      const partCount = r.u16(a + 4);
      const parts = [];
      for (let i = 0;i < partCount; i++) {
        const rec = a + 6 + i * 8;
        parts.push({
          glyphId: r.u16(rec),
          startConnectorLength: toEm(r.u16(rec + 2)),
          endConnectorLength: toEm(r.u16(rec + 4)),
          fullAdvance: toEm(r.u16(rec + 6)),
          isExtender: (r.u16(rec + 8) & 1) === 1
        });
      }
      assembly = { italicCorrection: italic, parts };
    }
  } catch {}
  return { variants, assembly };
}

// src/math-standards/adapters/xits-math.ts
var XITS_FAMILIES = ["XITS Math", "XITS Math Two", "XITS"];
var REPORT_RANGES = [
  [32, 126],
  [160, 255],
  [256, 591],
  [880, 1023],
  [1024, 1279],
  [8192, 8303],
  [8304, 8351],
  [8352, 8383],
  [8448, 8527],
  [8592, 8703],
  [8704, 8959],
  [8960, 9215],
  [9632, 9727],
  [9728, 9983],
  [10176, 10223],
  [10624, 10751],
  [10752, 11007],
  [119808, 120831]
];
function isControl(code) {
  return code < 32 || code >= 127 && code <= 159;
}
function isPrivateUse(code) {
  return code >= 57344 && code <= 63743 || code >= 983040 && code <= 1048573 || code >= 1048576 && code <= 1114109;
}
function inReportedRange(code) {
  for (const [from, to] of REPORT_RANGES) {
    if (code >= from && code <= to)
      return true;
  }
  return false;
}
function findTable2(dv, base, tag) {
  try {
    const numTables = dv.getUint16(base + 4);
    for (let i = 0;i < numTables; i++) {
      const rec = base + 12 + i * 16;
      const t2 = String.fromCharCode(dv.getUint8(rec), dv.getUint8(rec + 1), dv.getUint8(rec + 2), dv.getUint8(rec + 3));
      if (t2 === tag) {
        return { offset: dv.getUint32(rec + 8), length: dv.getUint32(rec + 12) };
      }
    }
  } catch {}
  return null;
}
function fontBase(dv, byteLength) {
  try {
    if (byteLength < 12)
      return -1;
    const tag = String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3));
    if (tag === "ttcf") {
      const numFonts = dv.getUint32(8);
      if (numFonts < 1)
        return -1;
      return dv.getUint32(12);
    }
    return 0;
  } catch {
    return -1;
  }
}
function readCmapSubtable(dv, tableStart, subOffset, into) {
  try {
    const o = tableStart + subOffset;
    const format = dv.getUint16(o);
    if (format === 4) {
      const segCountX2 = dv.getUint16(o + 6);
      const segCount = segCountX2 >>> 1;
      if (segCount === 0)
        return false;
      const endBase = o + 14;
      const startBase = endBase + segCount * 2 + 2;
      const deltaBase = startBase + segCount * 2;
      const rangeBase = deltaBase + segCount * 2;
      for (let i = 0;i < segCount; i++) {
        const end = dv.getUint16(endBase + i * 2);
        const start = dv.getUint16(startBase + i * 2);
        const delta = dv.getInt16(deltaBase + i * 2);
        const rangeOffset = dv.getUint16(rangeBase + i * 2);
        if (start > end)
          continue;
        const last = Math.min(end, 65534);
        for (let cp = start;cp <= last; cp++) {
          let gid;
          if (rangeOffset === 0) {
            gid = cp + delta & 65535;
          } else {
            const addr = rangeBase + i * 2 + rangeOffset + (cp - start) * 2;
            gid = dv.getUint16(addr);
            if (gid !== 0)
              gid = gid + delta & 65535;
          }
          if (gid !== 0)
            into.set(cp, gid);
        }
      }
      return true;
    }
    if (format === 12) {
      const nGroups = dv.getUint32(o + 12);
      for (let g = 0;g < nGroups; g++) {
        const rec = o + 16 + g * 12;
        const startCp = dv.getUint32(rec);
        const endCp = dv.getUint32(rec + 4);
        const startGid = dv.getUint32(rec + 8);
        if (startCp > endCp || endCp > 1114111)
          continue;
        for (let cp = startCp;cp <= endCp; cp++) {
          const gid = startGid + (cp - startCp);
          if (gid !== 0)
            into.set(cp, gid);
        }
      }
      return true;
    }
  } catch {}
  return false;
}
function readCmap(dv, table, notes) {
  try {
    const numTables = dv.getUint16(table.offset + 2);
    const candidates = [];
    for (let i = 0;i < numTables; i++) {
      const rec = table.offset + 4 + i * 8;
      const plat = dv.getUint16(rec);
      const enc = dv.getUint16(rec + 2);
      const off = dv.getUint32(rec + 4);
      let rank = 9;
      if (plat === 3 && enc === 10)
        rank = 0;
      else if (plat === 0)
        rank = 1;
      else if (plat === 3 && enc === 1)
        rank = 2;
      else if (plat === 3 && enc === 0)
        rank = 3;
      candidates.push({ plat, enc, off, rank });
    }
    candidates.sort((a, b) => a.rank - b.rank);
    const into = new Map;
    for (const c of candidates) {
      into.clear();
      if (readCmapSubtable(dv, table.offset, c.off, into) && into.size > 0) {
        notes.push(`cmap subtable platform ${c.plat} encoding ${c.enc} gave ${into.size} codepoints. ` + `cmap 子表 platform ${c.plat} / encoding ${c.enc} 解析出 ${into.size} 个码位。`);
        return into;
      }
    }
    notes.push("No usable cmap subtable (only formats 4 and 12 are read); chars stay empty. " + "无可用 cmap 子表（仅解析格式 4 与 12），chars 留空。");
  } catch {
    notes.push("cmap could not be parsed; chars stay empty. " + "cmap 解析失败，chars 留空。");
  }
  return null;
}
function readSfntInfo(binary, notes) {
  try {
    const dv = new DataView(binary);
    const base = fontBase(dv, binary.byteLength);
    if (base < 0) {
      notes.push("Font header is unreadable; only MATH constants can be reported. " + "字体头不可读，仅能上报 MATH 常量。");
      return null;
    }
    let unitsPerEm = 1000;
    const head = findTable2(dv, base, "head");
    if (head && head.offset + 20 <= binary.byteLength) {
      const upem = dv.getUint16(head.offset + 18);
      if (upem > 0)
        unitsPerEm = upem;
    }
    let numGlyphs = 0;
    const maxp = findTable2(dv, base, "maxp");
    if (maxp && maxp.offset + 6 <= binary.byteLength) {
      numGlyphs = dv.getUint16(maxp.offset + 4);
    }
    let hheaAsc = 0;
    let hheaDesc = 0;
    let numberOfHMetrics = 0;
    const hhea = findTable2(dv, base, "hhea");
    if (hhea && hhea.offset + 36 <= binary.byteLength) {
      hheaAsc = dv.getInt16(hhea.offset + 4);
      hheaDesc = dv.getInt16(hhea.offset + 6);
      numberOfHMetrics = dv.getUint16(hhea.offset + 34);
    }
    let typoAsc = 0;
    let typoDesc = 0;
    const os2 = findTable2(dv, base, "OS/2");
    if (os2 && os2.offset + 72 <= binary.byteLength) {
      typoAsc = dv.getInt16(os2.offset + 68);
      typoDesc = dv.getInt16(os2.offset + 70);
    }
    let ascender = 0;
    let descender = 0;
    let verticalSource = "none";
    const sane = (a, d) => a > 0 && d < 0 && a <= unitsPerEm * 2 && -d <= unitsPerEm;
    if (sane(typoAsc, typoDesc)) {
      ascender = typoAsc;
      descender = typoDesc;
      verticalSource = "os2-typo";
    } else if (sane(hheaAsc, hheaDesc)) {
      ascender = hheaAsc;
      descender = hheaDesc;
      verticalSource = "hhea";
    } else {
      notes.push("Neither OS/2 sTypo nor hhea gave sane verticals; height/depth fall back to 0.8/0.2 em. " + "OS/2 sTypo 与 hhea 均无合法垂直度量，高度/深度退化为 0.8/0.2 em。");
      ascender = Math.round(unitsPerEm * 0.8);
      descender = -Math.round(unitsPerEm * 0.2);
      verticalSource = "none";
    }
    let advances = null;
    const hmtx = findTable2(dv, base, "hmtx");
    if (hmtx && numGlyphs > 0 && numberOfHMetrics > 0) {
      const usable = Math.min(numberOfHMetrics, numGlyphs);
      if (hmtx.offset + usable * 4 <= binary.byteLength) {
        advances = new Uint16Array(numGlyphs);
        let last = 0;
        for (let g = 0;g < usable; g++) {
          last = dv.getUint16(hmtx.offset + g * 4);
          advances[g] = last;
        }
        for (let g = usable;g < numGlyphs; g++)
          advances[g] = last;
      }
    }
    if (!advances) {
      notes.push("hmtx was unusable; glyph widths stay at MathJax values. " + "hmtx 不可用，字形宽度保留 MathJax 原值。");
    }
    let cmap = null;
    const cmapTable = findTable2(dv, base, "cmap");
    if (cmapTable) {
      cmap = readCmap(dv, cmapTable, notes);
    } else {
      notes.push("No cmap table; chars stay empty. " + "缺少 cmap 表，chars 留空。");
    }
    return { unitsPerEm, ascender, descender, numGlyphs, advances, cmap, verticalSource };
  } catch (err) {
    notes.push(`sfnt metric tables could not be read: ${err instanceof Error ? err.message : String(err)}. ` + `sfnt 度量表读取失败：${err instanceof Error ? err.message : String(err)}。`);
    return null;
  }
}
var xitsMathAdapter = {
  id: "xits-math",
  name: "XITS Math",
  families: XITS_FAMILIES,
  priority: 10,
  matches(familyName) {
    return matchByFamilyName({ families: XITS_FAMILIES }, familyName);
  },
  build(binary, ctx) {
    const notes = [];
    const math = readOpenTypeMathTable(binary);
    if (!math) {
      return null;
    }
    try {
      const info = readSfntInfo(binary, notes);
      const constants = math.constants;
      if (typeof constants.axisHeight === "number") {
        notes.push(`MATH constants adopted (axisHeight ${constants.axisHeight.toFixed(4)} em).` + ` 已采用 MATH 常量（axisHeight ${constants.axisHeight.toFixed(4)} em）。`);
      } else {
        notes.push("MATH constants were partially readable; missing fields stay undefined. " + "MATH 常量只读到部分字段，缺失项保持 undefined。");
      }
      notes.push("Stretchy delimiter sizes were left to MathJax: this font does not own the assembly in MathJax output. " + "可伸缩定界符尺寸保留 MathJax 原值：在 MathJax 输出中拼装并不由本字体承担。");
      const italicCount = Object.keys(math.italicCorrection).length;
      const extCount = math.extendedShapes.size;
      notes.push(`MATH also reports ${italicCount} italic corrections and ${extCount} extended shapes; ` + `MathFontMetrics has no fields for them and they are not applied here. ` + `MATH 另含 ${italicCount} 条斜体校正与 ${extCount} 个 extended shape；` + `MathFontMetrics 无对应字段，此处未套用。`);
      notes.push("XITS is a two-width design (text weight plus bold); these metrics describe the supplied face only. " + "XITS 为双宽度设计（常规+粗体）；本组度量仅描述传入的这一副字面。");
      const chars = {};
      if (!info) {
        notes.push("Glyph boxes could not be built; only constants are reported. " + "无法构建字形盒，仅上报常量。");
        return {
          source: "opentype-math",
          chars,
          delimiters: undefined,
          constants,
          ownsStretchyAssembly: false,
          notes
        };
      }
      const upem = info.unitsPerEm > 0 ? info.unitsPerEm : 1000;
      const height = info.ascender / upem;
      const depth = -info.descender / upem;
      if (ctx.unitsPerEm && ctx.unitsPerEm !== upem) {
        notes.push(`Caller reported unitsPerEm ${ctx.unitsPerEm}, font says ${upem}; the font wins. ` + `调用方报告 unitsPerEm ${ctx.unitsPerEm}，字体为 ${upem}；以字体为准。`);
      }
      notes.push(`Glyph boxes: width per-glyph from hmtx, height ${height.toFixed(4)} em / depth ${depth.toFixed(4)} em ` + `uniformly from ${info.verticalSource} (per-glyph verticals are approximated by these font-wide values). ` + `字形盒：宽度逐字形取自 hmtx，高度 ${height.toFixed(4)} em / 深度 ${depth.toFixed(4)} em ` + `统一取自 ${info.verticalSource}（逐字形垂直度量以此全字体值近似）。`);
      if (info.cmap && info.advances) {
        let mapped = 0;
        let zeroAdvance = 0;
        for (const [code, gid] of info.cmap) {
          if (!inReportedRange(code) || isControl(code) || isPrivateUse(code))
            continue;
          if (gid <= 0 || gid >= info.numGlyphs)
            continue;
          const width = (info.advances[gid] ?? 0) / upem;
          if (width === 0)
            zeroAdvance++;
          chars[String(code)] = [height, depth, width];
          mapped++;
        }
        notes.push(`Built ${mapped} glyph boxes from cmap+hmtx.` + ` 由 cmap+hmtx 构建 ${mapped} 个字形盒。`);
        if (zeroAdvance > 0) {
          notes.push(`${zeroAdvance} zero-advance glyphs kept at width 0 (combining marks).` + ` 有 ${zeroAdvance} 个零步进字形保留宽度 0（组合记号）。`);
        }
        if (mapped === 0) {
          notes.push("cmap produced no reported codepoints; constants remain the useful output. " + "cmap 未给出任何上报码位，常量仍是有效产出。");
        }
      }
      return {
        source: "opentype-math",
        chars,
        delimiters: undefined,
        constants,
        ownsStretchyAssembly: false,
        notes
      };
    } catch (err) {
      notes.push(`xits-math build failed: ${err instanceof Error ? err.message : String(err)}. ` + `xits-math 构建失败：${err instanceof Error ? err.message : String(err)}。`);
      return {
        source: "opentype-math",
        chars: {},
        delimiters: undefined,
        constants: math.constants,
        ownsStretchyAssembly: false,
        notes
      };
    }
  }
};

// src/math-standards/adapters/stix-two-math.ts
var FAMILIES = ["STIX Two Math", "STIX Math", "STIXGeneral"];
var PROBE_RANGES = [
  [32, 126],
  [160, 255],
  [880, 1023],
  [8192, 8303],
  [8304, 8351],
  [8352, 8383],
  [8448, 8527],
  [8592, 8703],
  [8704, 8959],
  [8960, 9215],
  [9632, 9727],
  [9728, 9983],
  [10176, 10223],
  [10624, 10751],
  [10752, 11007],
  [119808, 120831]
];
function isPrivateUse2(code) {
  return code >= 57344 && code <= 63743 || code >= 983040 && code <= 1048573 || code >= 1048576 && code <= 1114109;
}
function isControl2(code) {
  return code < 32 || code >= 127 && code <= 159;
}
function buildWantedSet() {
  const want = new Set;
  for (const [from, to] of PROBE_RANGES) {
    for (let code = from;code <= to; code++) {
      if (!isPrivateUse2(code) && !isControl2(code)) {
        want.add(code);
      }
    }
  }
  return want;
}
function errText(err) {
  return err instanceof Error ? err.message : String(err);
}
function readTableDirectory(dv) {
  try {
    if (dv.byteLength < 12)
      return null;
    const tag = String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3));
    let base = 0;
    if (tag === "ttcf") {
      const numFonts = dv.getUint32(8);
      if (numFonts < 1)
        return null;
      base = dv.getUint32(12);
    }
    if (base + 12 > dv.byteLength)
      return null;
    const numTables = dv.getUint16(base + 4);
    const tables = new Map;
    for (let i = 0;i < numTables; i++) {
      const rec = base + 12 + i * 16;
      if (rec + 16 > dv.byteLength)
        break;
      const name = String.fromCharCode(dv.getUint8(rec), dv.getUint8(rec + 1), dv.getUint8(rec + 2), dv.getUint8(rec + 3));
      tables.set(name, { offset: dv.getUint32(rec + 8), length: dv.getUint32(rec + 12) });
    }
    return tables;
  } catch {
    return null;
  }
}
function parseCmapFormat4(dv, at, want, into) {
  const segCount = dv.getUint16(at + 6) / 2;
  const endCodesAt = at + 14;
  const startCodesAt = endCodesAt + segCount * 2 + 2;
  const idDeltaAt = startCodesAt + segCount * 2;
  const idRangeOffsetAt = idDeltaAt + segCount * 2;
  for (let s = 0;s < segCount; s++) {
    const end = dv.getUint16(endCodesAt + s * 2);
    const start = dv.getUint16(startCodesAt + s * 2);
    const idDelta = dv.getInt16(idDeltaAt + s * 2);
    const idRangeOffset = dv.getUint16(idRangeOffsetAt + s * 2);
    if (start > end || start === 65535)
      continue;
    for (let code = start;code <= end; code++) {
      if (!want.has(code))
        continue;
      let gid = 0;
      try {
        if (idRangeOffset === 0) {
          gid = code + idDelta & 65535;
        } else {
          const addr = idRangeOffsetAt + s * 2 + idRangeOffset + (code - start) * 2;
          if (addr + 2 > dv.byteLength)
            continue;
          const raw = dv.getUint16(addr);
          gid = raw === 0 ? 0 : raw + idDelta & 65535;
        }
      } catch {
        continue;
      }
      if (gid !== 0)
        into.set(String(code), gid);
    }
  }
}
function parseCmapFormat12(dv, at, want, into) {
  const numGroups = dv.getUint32(at + 12);
  for (let g = 0;g < numGroups; g++) {
    const rec = at + 16 + g * 12;
    if (rec + 12 > dv.byteLength)
      break;
    const start = dv.getUint32(rec);
    const end = dv.getUint32(rec + 4);
    const startGid = dv.getUint32(rec + 8);
    if (start > end)
      continue;
    for (let code = start;code <= end; code++) {
      if (!want.has(code))
        continue;
      const gid = startGid + (code - start);
      if (gid !== 0)
        into.set(String(code), gid);
    }
  }
}
function readCmap2(dv, rec, want) {
  const into = new Map;
  try {
    const numSubtables = dv.getUint16(rec.offset + 2);
    let bestScore = -1;
    let bestOffset = -1;
    for (let i = 0;i < numSubtables; i++) {
      const r = rec.offset + 4 + i * 8;
      if (r + 8 > dv.byteLength)
        break;
      const platform = dv.getUint16(r);
      const encoding = dv.getUint16(r + 2);
      const sub = rec.offset + dv.getUint32(r + 4);
      if (sub + 2 > dv.byteLength)
        continue;
      const format2 = dv.getUint16(sub);
      let score = -1;
      if (format2 === 12) {
        score = platform === 3 && encoding === 10 ? 4 : platform === 0 ? 3 : 2;
      } else if (format2 === 4) {
        score = platform === 3 && encoding === 1 ? 3 : platform === 0 ? 2 : 1;
      }
      if (score > bestScore) {
        bestScore = score;
        bestOffset = sub;
      }
    }
    if (bestOffset < 0)
      return into;
    const format = dv.getUint16(bestOffset);
    if (format === 12) {
      parseCmapFormat12(dv, bestOffset, want, into);
    } else if (format === 4) {
      parseCmapFormat4(dv, bestOffset, want, into);
    }
  } catch {}
  return into;
}
function readAdvances(dv, rec, numberOfHMetrics, numGlyphs) {
  try {
    if (numGlyphs < 1 || numberOfHMetrics < 1)
      return null;
    const advances = new Uint16Array(numGlyphs);
    const full = Math.min(numberOfHMetrics, numGlyphs);
    for (let g = 0;g < full; g++) {
      const off = rec.offset + g * 4;
      if (off + 2 > dv.byteLength)
        return null;
      advances[g] = dv.getUint16(off);
    }
    const last = advances[full - 1];
    for (let g = full;g < numGlyphs; g++) {
      advances[g] = last;
    }
    return advances;
  } catch {
    return null;
  }
}
function readGlyphYBounds(dv, glyf, loca, indexToLocFormat, gid) {
  try {
    let start;
    let end;
    if (indexToLocFormat === 0) {
      const a = loca.offset + gid * 2;
      const b = loca.offset + (gid + 1) * 2;
      if (b + 2 > dv.byteLength)
        return null;
      start = dv.getUint16(a) * 2;
      end = dv.getUint16(b) * 2;
    } else {
      const a = loca.offset + gid * 4;
      const b = loca.offset + (gid + 1) * 4;
      if (b + 4 > dv.byteLength)
        return null;
      start = dv.getUint32(a);
      end = dv.getUint32(b);
    }
    if (end <= start) {
      return { yMin: 0, yMax: 0 };
    }
    const goff = glyf.offset + start;
    if (goff + 10 > dv.byteLength)
      return null;
    return { yMin: dv.getInt16(goff + 6), yMax: dv.getInt16(goff + 8) };
  } catch {
    return null;
  }
}
function readSfntInfo2(dv, want, notes) {
  const tables = readTableDirectory(dv);
  if (!tables) {
    notes.push("STIX: SFNT table directory could not be read; no glyph metrics produced.");
    return null;
  }
  let unitsPerEm = 0;
  let indexToLocFormat = 1;
  const head = tables.get("head");
  if (head && head.length >= 54) {
    unitsPerEm = dv.getUint16(head.offset + 18);
    indexToLocFormat = dv.getInt16(head.offset + 50);
  }
  let hheaAscender = 0;
  let hheaDescender = 0;
  let numberOfHMetrics = 0;
  const hhea = tables.get("hhea");
  if (hhea && hhea.length >= 36) {
    hheaAscender = dv.getInt16(hhea.offset + 4);
    hheaDescender = dv.getInt16(hhea.offset + 6);
    numberOfHMetrics = dv.getUint16(hhea.offset + 34);
  }
  let typoAscender = 0;
  let typoDescender = 0;
  let usedTypoMetrics = false;
  let usedHheaMetrics = false;
  const os2 = tables.get("OS/2");
  if (os2 && os2.length >= 72) {
    typoAscender = dv.getInt16(os2.offset + 68);
    typoDescender = dv.getInt16(os2.offset + 70);
    usedTypoMetrics = true;
  } else if (hhea && hhea.length >= 36) {
    typoAscender = hheaAscender;
    typoDescender = hheaDescender;
    usedHheaMetrics = true;
  } else {
    notes.push("STIX: neither OS/2 sTypoAscender nor hhea ascent is readable; font-wide vertical defaults are unavailable.");
  }
  let numGlyphs = 0;
  const maxp = tables.get("maxp");
  if (maxp && maxp.length >= 6) {
    numGlyphs = dv.getUint16(maxp.offset + 4);
  }
  if (numGlyphs < 1) {
    notes.push("STIX: maxp reports no glyphs; no per-glyph metrics produced.");
    return null;
  }
  let advances = null;
  const hmtx = tables.get("hmtx");
  if (hmtx) {
    advances = readAdvances(dv, hmtx, numberOfHMetrics, numGlyphs);
  }
  if (!advances) {
    notes.push("STIX: hmtx advance widths unreadable; no per-glyph metrics produced.");
    return null;
  }
  let cmap = new Map;
  const cmapRec = tables.get("cmap");
  if (cmapRec) {
    cmap = readCmap2(dv, cmapRec, want);
  }
  if (cmap.size === 0) {
    notes.push("STIX: cmap has no readable Unicode subtable for the probed codepoints; no per-glyph metrics produced.");
    return null;
  }
  const glyfRec = tables.get("glyf") || null;
  const locaRec = tables.get("loca") || null;
  const glyf = glyfRec && glyfRec.length > 0 ? glyfRec : null;
  const loca = locaRec && locaRec.length > 0 ? locaRec : null;
  return {
    unitsPerEm,
    indexToLocFormat,
    typoAscender,
    typoDescender,
    advances,
    cmap,
    glyf,
    loca,
    usedTypoMetrics,
    usedHheaMetrics
  };
}
function finish(constants, chars, notes) {
  return {
    source: "opentype-math",
    chars,
    delimiters: undefined,
    constants,
    ownsStretchyAssembly: false,
    notes
  };
}
var stixTwoMathAdapter = {
  id: "stix-two-math",
  name: "STIX Two Math",
  families: FAMILIES,
  priority: 20,
  matches(familyName) {
    return matchByFamilyName(stixTwoMathAdapter, familyName);
  },
  build(binary, ctx) {
    const notes = [];
    let math = null;
    try {
      math = readOpenTypeMathTable(binary);
    } catch (err) {
      notes.push(`STIX: MATH table read failed: ${errText(err)}`);
      math = null;
    }
    if (!math) {
      return null;
    }
    const chars = {};
    try {
      const dv = new DataView(binary);
      const want = buildWantedSet();
      const info = readSfntInfo2(dv, want, notes);
      if (!info) {
        notes.push("STIX: returning MATH constants only; MathJax keeps its own per-glyph metrics.");
        return finish(math.constants, chars, notes);
      }
      let unitsPerEm = info.unitsPerEm;
      if (!(unitsPerEm > 0)) {
        unitsPerEm = math.unitsPerEm;
      }
      if (!(unitsPerEm > 0) && ctx.unitsPerEm && ctx.unitsPerEm > 0) {
        unitsPerEm = ctx.unitsPerEm;
      }
      if (!(unitsPerEm > 0)) {
        unitsPerEm = 1000;
        notes.push("STIX: unitsPerEm unreadable in head/MATH; assumed 1000.");
      }
      const fontHeight = Math.max(0, info.typoAscender) / unitsPerEm;
      const fontDepth = Math.max(0, -info.typoDescender) / unitsPerEm;
      if (info.usedTypoMetrics) {
        notes.push("STIX: font-wide verticals from OS/2 sTypoAscender/sTypoDescender.");
      } else if (info.usedHheaMetrics) {
        notes.push("STIX: OS/2 typographic metrics absent; font-wide verticals from hhea ascent/descent.");
      }
      const glyf = info.glyf;
      const loca = info.loca;
      const hasGlyf = glyf !== null && loca !== null;
      if (!hasGlyf) {
        notes.push("STIX: no glyf/loca tables (CFF outlines); per-glyph height/depth approximated by the font-wide ascender/descender.");
      }
      let built = 0;
      let missingGlyph = 0;
      let zeroAdvance = 0;
      let approximated = 0;
      for (const code of want) {
        const key = String(code);
        const gid = info.cmap.get(key);
        if (gid === undefined || gid === 0 || gid >= info.advances.length) {
          missingGlyph++;
          continue;
        }
        const widthUnits = info.advances[gid];
        if (!(widthUnits > 0)) {
          zeroAdvance++;
          continue;
        }
        let height;
        let depth;
        if (hasGlyf && glyf && loca) {
          const box = readGlyphYBounds(dv, glyf, loca, info.indexToLocFormat, gid);
          if (box) {
            height = Math.max(0, box.yMax) / unitsPerEm;
            depth = Math.max(0, -box.yMin) / unitsPerEm;
          } else {
            height = fontHeight;
            depth = fontDepth;
            approximated++;
          }
        } else {
          height = fontHeight;
          depth = fontDepth;
          approximated++;
        }
        const metrics = [height, depth, widthUnits / unitsPerEm];
        chars[key] = metrics;
        built++;
      }
      notes.push(`STIX: built ${built} glyph layout boxes from cmap/hmtx/glyf; kept MathJax metrics for ${missingGlyph} absent glyphs and ${zeroAdvance} zero-advance glyphs.`);
      if (approximated > 0) {
        notes.push(`STIX: ${approximated} glyphs have no readable outline box; their height/depth use the font-wide ascender/descender (typographic approximation).`);
      }
    } catch (err) {
      notes.push(`STIX: glyph metric parse failed: ${errText(err)}; returning MATH constants with partial chars.`);
    }
    notes.push("STIX: MATH italic corrections read but not exported (no field on MathFontMetrics); axis and rule values come from the MATH constants.");
    notes.push("STIX: delimiters omitted on purpose — MathJax assembles stretchy delimiters from its own faces, so its target sizes must stay.");
    return finish(math.constants, chars, notes);
  }
};

// src/math-standards/opentype-font.ts
function tableDirectory(dv, base) {
  const out = new Map;
  const numTables = dv.getUint16(base + 4);
  for (let i = 0;i < numTables; i++) {
    const rec = base + 12 + i * 16;
    const tag = String.fromCharCode(dv.getUint8(rec), dv.getUint8(rec + 1), dv.getUint8(rec + 2), dv.getUint8(rec + 3));
    out.set(tag, { offset: dv.getUint32(rec + 8), length: dv.getUint32(rec + 12) });
  }
  return out;
}
function fontBase2(dv) {
  const tag = String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3));
  if (tag === "ttcf") {
    return dv.getUint32(12);
  }
  return 0;
}
function readOpenTypeFontInfo(binary) {
  try {
    if (binary.byteLength < 12) {
      return null;
    }
    const dv = new DataView(binary);
    const base = fontBase2(dv);
    const tables = tableDirectory(dv, base);
    if (tables.size === 0) {
      return null;
    }
    const head = tables.get("head");
    const maxp = tables.get("maxp");
    const hhea = tables.get("hhea");
    const hmtx = tables.get("hmtx");
    const os2 = tables.get("OS/2");
    if (!head || !maxp || !hhea || !hmtx) {
      return null;
    }
    const unitsPerEm = dv.getUint16(head.offset + 18) || 1000;
    const toEm = (design) => design / unitsPerEm;
    const numGlyphs = dv.getUint16(maxp.offset + 4);
    const hheaAscent = dv.getInt16(hhea.offset + 4);
    const hheaDescent = dv.getInt16(hhea.offset + 6);
    const hheaLineGap = dv.getInt16(hhea.offset + 8);
    const numberOfHMetrics = dv.getUint16(hhea.offset + 34);
    const advanceWidths = new Uint16Array(numGlyphs);
    for (let i = 0;i < numGlyphs; i++) {
      const rec = i < numberOfHMetrics ? i : numberOfHMetrics - 1;
      advanceWidths[i] = dv.getUint16(hmtx.offset + rec * 4);
    }
    let ascent = toEm(hheaAscent);
    let descent = toEm(Math.abs(hheaDescent));
    let capHeight;
    let xHeight;
    let weightClass = 400;
    if (os2 && os2.length >= 72) {
      weightClass = dv.getUint16(os2.offset + 4) || 400;
      const typoAscender = dv.getInt16(os2.offset + 68);
      const typoDescender = dv.getInt16(os2.offset + 70);
      if (typoAscender !== 0) {
        ascent = toEm(typoAscender);
        descent = toEm(Math.abs(typoDescender));
      }
      const version = dv.getUint16(os2.offset);
      if (version >= 2 && os2.length >= 90) {
        const sx = dv.getInt16(os2.offset + 86);
        const sc = dv.getInt16(os2.offset + 88);
        if (sx > 0)
          xHeight = toEm(sx);
        if (sc > 0)
          capHeight = toEm(sc);
      }
    }
    const cmap = readCmap3(dv, tables.get("cmap"));
    return {
      unitsPerEm,
      numGlyphs,
      verticals: { ascent, descent, capHeight, xHeight, weightClass },
      advanceWidths,
      cmap,
      hhea: { ascent: toEm(hheaAscent), descent: toEm(Math.abs(hheaDescent)), lineGap: toEm(hheaLineGap) }
    };
  } catch {
    return null;
  }
}
function readCmap3(dv, table) {
  const out = {};
  if (!table) {
    return out;
  }
  try {
    const base = table.offset;
    const numTables = dv.getUint16(base + 2);
    let chosen = -1;
    let chosenScore = -1;
    for (let i = 0;i < numTables; i++) {
      const rec = base + 4 + i * 8;
      const platformId = dv.getUint16(rec);
      const encodingId = dv.getUint16(rec + 2);
      const offset = dv.getUint32(rec + 4);
      const format2 = dv.getUint16(base + offset);
      let score = -1;
      if (format2 === 12)
        score = 3;
      else if (format2 === 4)
        score = 2;
      if (platformId === 3 && encodingId === 10 && score > 0)
        score += 1;
      if (score > chosenScore) {
        chosenScore = score;
        chosen = base + offset;
      }
    }
    if (chosen < 0) {
      return out;
    }
    const format = dv.getUint16(chosen);
    if (format === 4) {
      const segCountX2 = dv.getUint16(chosen + 6);
      const segCount = segCountX2 / 2;
      const endCodes = chosen + 14;
      const startCodes = endCodes + segCountX2 + 2;
      const idDeltas = startCodes + segCountX2;
      const idRangeOffsets = idDeltas + segCountX2;
      for (let s = 0;s < segCount; s++) {
        const end = dv.getUint16(endCodes + s * 2);
        const start = dv.getUint16(startCodes + s * 2);
        const delta = dv.getInt16(idDeltas + s * 2);
        const rangeOffset = dv.getUint16(idRangeOffsets + s * 2);
        for (let c = start;c <= end && c !== 65535; c++) {
          let glyph;
          if (rangeOffset === 0) {
            glyph = c + delta & 65535;
          } else {
            const at = idRangeOffsets + s * 2 + rangeOffset + (c - start) * 2;
            if (at + 2 > dv.byteLength)
              continue;
            glyph = dv.getUint16(at);
            if (glyph !== 0)
              glyph = glyph + delta & 65535;
          }
          if (glyph !== 0) {
            out[String(c)] = glyph;
          }
        }
      }
    } else if (format === 12) {
      const nGroups = dv.getUint32(chosen + 12);
      for (let g = 0;g < nGroups; g++) {
        const rec = chosen + 16 + g * 12;
        const startChar = dv.getUint32(rec);
        const endChar = dv.getUint32(rec + 4);
        const startGlyph = dv.getUint32(rec + 8);
        for (let c = startChar;c <= endChar; c++) {
          out[String(c)] = startGlyph + (c - startChar);
        }
      }
    }
  } catch {}
  return out;
}
function glyphLayoutBox(font, glyphId) {
  if (glyphId < 0 || glyphId >= font.numGlyphs) {
    return null;
  }
  const advance = font.advanceWidths[glyphId];
  if (!advance) {
    return null;
  }
  return {
    height: font.verticals.ascent,
    depth: font.verticals.descent,
    width: advance / font.unitsPerEm
  };
}
function glyphForCodepoint(font, codepoint) {
  const id = font.cmap[String(codepoint)];
  return typeof id === "number" && id > 0 ? id : null;
}
var MAPPED_CODEPOINT_RANGES = [
  [32, 126],
  [160, 255],
  [8192, 8303],
  [8304, 8351],
  [8352, 8383],
  [8448, 8527],
  [8592, 8703],
  [8704, 8959],
  [8960, 9215],
  [9632, 9727],
  [9728, 9983],
  [10176, 10223],
  [10624, 10751],
  [10752, 11007],
  [119808, 120831]
];
function buildCharsFromFont(font, gaps = [], ranges = MAPPED_CODEPOINT_RANGES) {
  const out = {
    chars: {},
    mapped: 0,
    skippedGap: 0,
    skippedAbsent: 0,
    gapsHit: []
  };
  for (const [from, to] of ranges) {
    for (let code = from;code <= to; code++) {
      const gap = gaps.find((g) => code >= g.from && code <= g.to);
      if (gap) {
        out.skippedGap++;
        if (!out.gapsHit.includes(gap.name)) {
          out.gapsHit.push(gap.name);
        }
        continue;
      }
      const glyphId = glyphForCodepoint(font, code);
      if (glyphId === null) {
        out.skippedAbsent++;
        continue;
      }
      const box = glyphLayoutBox(font, glyphId);
      if (!box) {
        out.skippedAbsent++;
        continue;
      }
      out.chars[String(code)] = [box.height, box.depth, box.width];
      out.mapped++;
    }
  }
  return out;
}

// src/math-standards/adapters/latin-modern-math.ts
var KNOWN_GAPS = [
  { name: "lowercase Script", from: 119990, to: 120015 }
];
var latinModernMathAdapter = {
  id: "latin-modern-math",
  name: "Latin Modern Math",
  families: ["Latin Modern Math", "Latin Modern", "LM Math", "Latin Modern Math Regular"],
  priority: 30,
  matches(familyName) {
    return matchByFamilyName(this, familyName);
  },
  build(binary, _ctx) {
    const font = readOpenTypeFontInfo(binary);
    if (!font) {
      return null;
    }
    const math = readOpenTypeMathTable(binary);
    const built = buildCharsFromFont(font, KNOWN_GAPS);
    if (built.mapped === 0) {
      return null;
    }
    const notes = [
      "Computer Modern lineage: metric skeleton follows the TeX design constants.",
      math ? "Read from the font's OpenType MATH table; nothing was measured." : "No MATH table found — boxes come from the font's own hmtx/OS-2 metrics.",
      `Mapped ${built.mapped} glyphs; left ${built.skippedAbsent} uncovered ones to MathJax.`
    ];
    for (const gap of built.gapsHit) {
      notes.push(`Gap left to MathJax: ${gap}.`);
    }
    if (math && math.extendedShapes.size > 0) {
      notes.push(`${math.extendedShapes.size} glyphs are extended shapes.`);
    }
    return {
      source: math ? "opentype-math" : "tex-tfm",
      gaps: built.gapsHit.map((g) => `${g} — those letters come from MathJax`),
      chars: built.chars,
      delimiters: undefined,
      ownsStretchyAssembly: false,
      constants: math ? math.constants : undefined,
      notes
    };
  }
};

// src/math-standards/adapters/tex-gyre-termes-math.ts
var FAMILIES2 = ["TeX Gyre Termes Math", "TeX Gyre Termes"];
var PROBE_RANGES2 = [
  [32, 126],
  [160, 255],
  [880, 1023],
  [8192, 8303],
  [8304, 8351],
  [8352, 8383],
  [8448, 8527],
  [8592, 8703],
  [8704, 8959],
  [8960, 9215],
  [9632, 9727],
  [9728, 9983],
  [10176, 10223],
  [10624, 10751],
  [10752, 11007],
  [119808, 120831]
];
function indexTables(binary) {
  try {
    if (binary.byteLength < 12) {
      return null;
    }
    const dv = new DataView(binary);
    const tag = String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3));
    const base = tag === "ttcf" ? dv.getUint32(12) : 0;
    if (base < 0 || base + 12 > binary.byteLength) {
      return null;
    }
    const numTables = dv.getUint16(base + 4);
    const tables = new Map;
    for (let i = 0;i < numTables; i++) {
      const rec = base + 12 + i * 16;
      if (rec + 16 > binary.byteLength) {
        break;
      }
      const name = String.fromCharCode(dv.getUint8(rec), dv.getUint8(rec + 1), dv.getUint8(rec + 2), dv.getUint8(rec + 3));
      const offset = dv.getUint32(rec + 8);
      const length = dv.getUint32(rec + 12);
      if (offset >= 0 && length >= 0 && offset + length <= binary.byteLength) {
        tables.set(name, { offset, length });
      }
    }
    return { dv, totalBytes: binary.byteLength, tables };
  } catch {
    return null;
  }
}
function readUnitsPerEm2(sfnt, notes) {
  try {
    const head = sfnt.tables.get("head");
    if (!head || head.offset + 20 > sfnt.totalBytes) {
      notes.push("head table missing or truncated; assuming unitsPerEm 1000.");
      return 1000;
    }
    const upem = sfnt.dv.getUint16(head.offset + 18);
    if (!(upem > 0)) {
      notes.push("head.unitsPerEm was zero; assuming 1000.");
      return 1000;
    }
    return upem;
  } catch {
    notes.push("head table unreadable; assuming unitsPerEm 1000.");
    return 1000;
  }
}
function readVerticalMetrics(sfnt, upem, notes) {
  let ascent = 0;
  let descent = 0;
  let source = "";
  try {
    const hhea = sfnt.tables.get("hhea");
    if (hhea && hhea.offset + 36 <= sfnt.totalBytes) {
      ascent = sfnt.dv.getInt16(hhea.offset + 4);
      descent = sfnt.dv.getInt16(hhea.offset + 6);
      source = "hhea";
    }
    const os2 = sfnt.tables.get("OS/2");
    if (os2 && os2.offset + 76 <= sfnt.totalBytes) {
      const fsSelection = sfnt.dv.getUint16(os2.offset + 62);
      const typoAscender = sfnt.dv.getInt16(os2.offset + 68);
      const typoDescender = sfnt.dv.getInt16(os2.offset + 70);
      const useTypo = (fsSelection & 128) !== 0;
      if ((useTypo || !source) && typoAscender > 0) {
        ascent = typoAscender;
        descent = typoDescender;
        source = useTypo ? "OS/2 sTypo (USE_TYPO_METRICS)" : "OS/2 sTypo (hhea absent)";
      }
    }
  } catch {
    notes.push("Vertical metrics tables were partially unreadable; using whatever was already read.");
  }
  if (!source || ascent <= 0) {
    notes.push("No usable font-wide ascender/descender; degraded to the 0.8em / 0.2em generic line box.");
    return { height: 0.8, depth: 0.2 };
  }
  notes.push(`Font-wide vertical metrics taken from ${source} (${ascent}/${descent} design units).`);
  return { height: Math.max(0, ascent) / upem, depth: Math.max(0, -descent) / upem };
}
function buildCmapLookup(sfnt, notes) {
  try {
    const cmap = sfnt.tables.get("cmap");
    if (!cmap || cmap.offset + 4 > sfnt.totalBytes) {
      notes.push("cmap table missing; no codepoint could be mapped to a glyph.");
      return null;
    }
    const dv = sfnt.dv;
    const numSubtables = dv.getUint16(cmap.offset + 2);
    let bestOffset = -1;
    let bestFormat = -1;
    let bestScore = -1;
    for (let i = 0;i < numSubtables; i++) {
      const rec = cmap.offset + 4 + i * 8;
      if (rec + 8 > sfnt.totalBytes) {
        break;
      }
      const platformId = dv.getUint16(rec);
      const encodingId = dv.getUint16(rec + 2);
      const subOffset = cmap.offset + dv.getUint32(rec + 4);
      if (subOffset + 4 > sfnt.totalBytes) {
        continue;
      }
      const format = dv.getUint16(subOffset);
      let score = -1;
      if (format === 12 && platformId === 3 && encodingId === 10)
        score = 5;
      else if (format === 12 && platformId === 0)
        score = 4;
      else if (format === 4 && platformId === 3 && encodingId === 1)
        score = 3;
      else if (format === 4 && platformId === 0)
        score = 2;
      else if (format === 6)
        score = 1;
      if (score > bestScore) {
        bestScore = score;
        bestOffset = subOffset;
        bestFormat = format;
      }
    }
    if (bestOffset < 0 || bestFormat < 0) {
      notes.push("cmap contained no usable subtable (formats 4/6/12); no codepoint could be mapped.");
      return null;
    }
    if (bestFormat === 12) {
      const groupCount = dv.getUint32(bestOffset + 12);
      return (code) => {
        try {
          let lo = 0;
          let hi = groupCount - 1;
          while (lo <= hi) {
            const mid = lo + hi >> 1;
            const rec = bestOffset + 16 + mid * 12;
            const start = dv.getUint32(rec);
            const end = dv.getUint32(rec + 4);
            if (code < start)
              hi = mid - 1;
            else if (code > end)
              lo = mid + 1;
            else
              return dv.getUint32(rec + 8) + (code - start);
          }
          return 0;
        } catch {
          return 0;
        }
      };
    }
    if (bestFormat === 4) {
      const segCount = dv.getUint16(bestOffset + 6) / 2;
      const endCodesAt = bestOffset + 14;
      const startCodesAt = endCodesAt + segCount * 2 + 2;
      const idDeltasAt = startCodesAt + segCount * 2;
      const idRangeOffsetsAt = idDeltasAt + segCount * 2;
      return (code) => {
        try {
          for (let i = 0;i < segCount; i++) {
            const end = dv.getUint16(endCodesAt + i * 2);
            if (code > end) {
              continue;
            }
            const start = dv.getUint16(startCodesAt + i * 2);
            if (code < start) {
              return 0;
            }
            const idDelta = dv.getInt16(idDeltasAt + i * 2);
            const idRangeOffset = dv.getUint16(idRangeOffsetsAt + i * 2);
            if (idRangeOffset === 0) {
              return code + idDelta & 65535;
            }
            const glyphAt = idRangeOffsetsAt + i * 2 + idRangeOffset + (code - start) * 2;
            if (glyphAt + 2 > sfnt.totalBytes) {
              return 0;
            }
            const raw = dv.getUint16(glyphAt);
            return raw === 0 ? 0 : raw + idDelta & 65535;
          }
          return 0;
        } catch {
          return 0;
        }
      };
    }
    const firstCode = dv.getUint16(bestOffset + 6);
    const entryCount = dv.getUint16(bestOffset + 8);
    return (code) => {
      try {
        const index = code - firstCode;
        if (index < 0 || index >= entryCount) {
          return 0;
        }
        return dv.getUint16(bestOffset + 10 + index * 2);
      } catch {
        return 0;
      }
    };
  } catch {
    notes.push("cmap parsing failed; no codepoint could be mapped to a glyph.");
    return null;
  }
}
function readNumberOfHMetrics(sfnt, numGlyphs, notes) {
  try {
    const hhea = sfnt.tables.get("hhea");
    if (!hhea || hhea.offset + 36 > sfnt.totalBytes) {
      notes.push("hhea table missing; assuming numberOfHMetrics equals numGlyphs.");
      return numGlyphs;
    }
    const n = sfnt.dv.getUint16(hhea.offset + 34);
    return n > 0 ? n : numGlyphs;
  } catch {
    notes.push("hhea.numberOfHMetrics unreadable; assuming numberOfHMetrics equals numGlyphs.");
    return numGlyphs;
  }
}
function readNumGlyphs(sfnt, notes) {
  try {
    const maxp = sfnt.tables.get("maxp");
    if (!maxp || maxp.offset + 6 > sfnt.totalBytes) {
      notes.push("maxp table missing; glyph count unknown, hmtx reads will be best-effort.");
      return 0;
    }
    return sfnt.dv.getUint16(maxp.offset + 4);
  } catch {
    notes.push("maxp.numGlyphs unreadable; hmtx reads will be best-effort.");
    return 0;
  }
}
function buildAdvanceReader(sfnt, numberOfHMetrics) {
  const hmtx = sfnt.tables.get("hmtx");
  return (gid) => {
    try {
      if (!hmtx || gid < 0) {
        return 0;
      }
      const slot = gid < numberOfHMetrics ? gid : numberOfHMetrics - 1;
      if (slot < 0) {
        return 0;
      }
      const at = hmtx.offset + slot * 4;
      if (at + 2 > sfnt.totalBytes) {
        return 0;
      }
      return sfnt.dv.getUint16(at);
    } catch {
      return 0;
    }
  };
}
var texGyreTermesMathAdapter = {
  id: "tex-gyre-termes-math",
  name: "TeX Gyre Termes Math",
  families: FAMILIES2,
  priority: 40,
  matches(familyName) {
    return matchByFamilyName({ families: FAMILIES2 }, familyName);
  },
  build(binary, ctx) {
    const notes = [];
    const chars = {};
    try {
      const sfnt = indexTables(binary);
      if (!sfnt) {
        return null;
      }
      const upem = readUnitsPerEm2(sfnt, notes) || ctx.unitsPerEm || 1000;
      const vertical = readVerticalMetrics(sfnt, upem, notes);
      const numGlyphs = readNumGlyphs(sfnt, notes);
      const numberOfHMetrics = readNumberOfHMetrics(sfnt, numGlyphs > 0 ? numGlyphs : 1, notes);
      const lookupGid = buildCmapLookup(sfnt, notes);
      const advanceOf = buildAdvanceReader(sfnt, numberOfHMetrics);
      const math = readOpenTypeMathTable(binary);
      if (!math) {
        notes.push("No OpenType MATH table in this file: constants omitted, chars derived from hmtx/cmap only.");
      }
      if (!lookupGid) {
        return null;
      }
      let mapped = 0;
      let missing = 0;
      let zeroAdvance = 0;
      for (const [from, to] of PROBE_RANGES2) {
        for (let code = from;code <= to; code++) {
          const gid = lookupGid(code);
          if (gid <= 0) {
            missing++;
            continue;
          }
          const advance = advanceOf(gid) / upem;
          if (!(advance > 0)) {
            zeroAdvance++;
            continue;
          }
          chars[String(code)] = [vertical.height, vertical.depth, advance];
          mapped++;
        }
      }
      if (mapped === 0) {
        notes.push("No probed codepoint mapped to a glyph with a usable advance; declining so the fallback may try.");
        return null;
      }
      notes.push(`Per-glyph vertical extents are approximated by the font-wide ascender/descender ` + `(${vertical.height.toFixed(3)}em / ${vertical.depth.toFixed(3)}em) for all ${mapped} glyphs: ` + `CFF outlines expose no cheap per-glyph box and the MATH table states none.`);
      notes.push(`Mapped ${mapped} codepoints; left ${missing} to MathJax; skipped ${zeroAdvance} with zero advance.`);
      notes.push("Stretchy delimiter sizes were left to MathJax: this font does not own the assembly " + "(delimiters omitted, ownsStretchyAssembly false).");
      return {
        source: "opentype-math",
        chars,
        delimiters: undefined,
        constants: math ? math.constants : undefined,
        ownsStretchyAssembly: false,
        notes
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      notes.push(`TeX Gyre Termes Math adapter failed mid-build: ${message}`);
      const built = Object.keys(chars).length;
      if (built > 0) {
        notes.push(`Returning ${built} partially built glyph entries after the failure.`);
        return {
          source: "opentype-math",
          chars,
          delimiters: undefined,
          ownsStretchyAssembly: false,
          notes
        };
      }
      return null;
    }
  }
};

// src/math-standards/adapters/tex-gyre-pagella-math.ts
function findTableAt(dv, base, tag) {
  try {
    if (base + 12 > dv.byteLength)
      return null;
    const numTables = dv.getUint16(base + 4);
    for (let i = 0;i < numTables; i++) {
      const rec = base + 12 + i * 16;
      if (rec + 16 > dv.byteLength)
        break;
      const t2 = String.fromCharCode(dv.getUint8(rec), dv.getUint8(rec + 1), dv.getUint8(rec + 2), dv.getUint8(rec + 3));
      if (t2 === tag) {
        return { offset: dv.getUint32(rec + 8), length: dv.getUint32(rec + 12) };
      }
    }
  } catch {}
  return null;
}
function fontBase3(dv) {
  try {
    if (dv.byteLength < 16)
      return 0;
    const tag = String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3));
    if (tag === "ttcf") {
      const numFonts = dv.getUint32(8);
      return numFonts >= 1 ? dv.getUint32(12) : 0;
    }
  } catch {}
  return 0;
}
function resolveUnitsPerEm(dv, base, fromMath, fromCtx) {
  try {
    const head = findTableAt(dv, base, "head");
    if (head && head.offset + 20 <= dv.byteLength) {
      const upem = dv.getUint16(head.offset + 18);
      if (upem > 0)
        return upem;
    }
  } catch {}
  if (fromMath > 0)
    return fromMath;
  if (fromCtx !== undefined && fromCtx > 0)
    return fromCtx;
  return 1000;
}
function readFontWideVerticals(dv, base, toEm, notes) {
  let ascentDesign = 0;
  let descentDesign = 0;
  let source = "";
  try {
    const os2 = findTableAt(dv, base, "OS/2");
    if (os2 && os2.offset + 72 <= dv.byteLength) {
      const typoAsc = dv.getInt16(os2.offset + 68);
      const typoDesc = dv.getInt16(os2.offset + 70);
      if (typoAsc > 0) {
        ascentDesign = typoAsc;
        source = "OS/2 sTypoAscender";
      }
      if (typoDesc < 0) {
        descentDesign = -typoDesc;
        if (!source)
          source = "OS/2 sTypoDescender";
      }
    }
  } catch {}
  try {
    const hhea = findTableAt(dv, base, "hhea");
    if (hhea && hhea.offset + 8 <= dv.byteLength) {
      const hAsc = dv.getInt16(hhea.offset + 4);
      const hDesc = dv.getInt16(hhea.offset + 6);
      if (ascentDesign <= 0 && hAsc > 0) {
        ascentDesign = hAsc;
        source = "hhea ascender";
      }
      if (descentDesign <= 0 && hDesc < 0) {
        descentDesign = -hDesc;
        if (!source)
          source = "hhea descender";
      }
    }
  } catch {}
  if (ascentDesign <= 0 || descentDesign <= 0) {
    try {
      const os2 = findTableAt(dv, base, "OS/2");
      if (os2 && os2.offset + 78 <= dv.byteLength) {
        const winAsc = dv.getUint16(os2.offset + 74);
        const winDesc = dv.getUint16(os2.offset + 76);
        if (ascentDesign <= 0 && winAsc > 0) {
          ascentDesign = winAsc;
          source = "OS/2 usWinAscent";
        }
        if (descentDesign <= 0 && winDesc > 0) {
          descentDesign = winDesc;
          if (!source)
            source = "OS/2 usWinDescent";
        }
      }
    } catch {}
  }
  if (ascentDesign <= 0 || descentDesign <= 0) {
    notes.push("Font-wide ascender/descender unreadable (head, hhea and OS/2 all unusable); using 0.75/0.25 em defaults.");
    return { ascent: 0.75, descent: 0.25 };
  }
  notes.push(`Font-wide layout verticals taken from ${source} (approximation: the font offers no per-glyph layout verticals).`);
  return { ascent: toEm(ascentDesign), descent: toEm(descentDesign) };
}
function readAdvanceLookup(dv, base, toEm, notes) {
  try {
    const hhea = findTableAt(dv, base, "hhea");
    const hmtx = findTableAt(dv, base, "hmtx");
    if (!hhea || !hmtx || hhea.offset + 36 > dv.byteLength) {
      notes.push("hhea/hmtx absent: advance widths were not adopted.");
      return null;
    }
    let numberOfHMetrics = dv.getUint16(hhea.offset + 34);
    if (numberOfHMetrics === 0) {
      numberOfHMetrics = Math.max(1, Math.floor(hmtx.length / 4));
    }
    if (numberOfHMetrics <= 0 || hmtx.offset + numberOfHMetrics * 4 > dv.byteLength) {
      notes.push("hmtx shorter than hhea.numberOfHMetrics: advance widths were not adopted.");
      return null;
    }
    const lastAdvance = dv.getUint16(hmtx.offset + (numberOfHMetrics - 1) * 4);
    return (gid) => {
      if (!Number.isFinite(gid) || gid < 0)
        return toEm(lastAdvance);
      const metric = gid < numberOfHMetrics ? gid : numberOfHMetrics - 1;
      return toEm(dv.getUint16(hmtx.offset + metric * 4));
    };
  } catch {
    notes.push("hmtx read failed: advance widths were not adopted.");
    return null;
  }
}
function readCmapFormat4(dv, sub, out) {
  try {
    if (sub + 14 > dv.byteLength)
      return false;
    const segCountX2 = dv.getUint16(sub + 6);
    const segCount = segCountX2 >> 1;
    if (segCount === 0 || segCountX2 === 0)
      return false;
    const endBase = sub + 14;
    const startBase = endBase + segCountX2 + 2;
    const deltaBase = startBase + segCountX2;
    const rangeBase = deltaBase + segCountX2;
    if (rangeBase + segCountX2 > dv.byteLength)
      return false;
    for (let i = 0;i < segCount; i++) {
      const end = dv.getUint16(endBase + i * 2);
      const start = dv.getUint16(startBase + i * 2);
      const delta = dv.getInt16(deltaBase + i * 2);
      const rangeOffset = dv.getUint16(rangeBase + i * 2);
      if (start > end)
        continue;
      for (let cp = start;cp <= end; cp++) {
        if (cp === 65535)
          continue;
        let gid;
        if (rangeOffset === 0) {
          gid = cp + delta & 65535;
        } else {
          const at = rangeBase + i * 2 + rangeOffset + (cp - start) * 2;
          if (at + 2 > dv.byteLength)
            break;
          gid = dv.getUint16(at);
          if (gid !== 0)
            gid = gid + delta & 65535;
        }
        if (gid !== 0)
          out.set(cp, gid);
      }
    }
    return out.size > 0;
  } catch {
    return false;
  }
}
function readCmapFormat12or13(dv, sub, out, oneGlyph) {
  try {
    if (sub + 16 > dv.byteLength)
      return false;
    const numGroups = dv.getUint32(sub + 12);
    const groupsBase = sub + 16;
    const maxCp = 1114111;
    for (let i = 0;i < numGroups; i++) {
      const rec = groupsBase + i * 12;
      if (rec + 12 > dv.byteLength)
        break;
      const start = dv.getUint32(rec);
      const end = dv.getUint32(rec + 4);
      const startGid = dv.getUint32(rec + 8);
      if (start > end || start > maxCp)
        continue;
      const last = Math.min(end, maxCp);
      for (let cp = start;cp <= last; cp++) {
        const gid = oneGlyph ? startGid : startGid + (cp - start);
        if (gid !== 0)
          out.set(cp, gid);
      }
    }
    return out.size > 0;
  } catch {
    return false;
  }
}
function readCmap4(dv, base, notes) {
  const out = new Map;
  try {
    const cmap = findTableAt(dv, base, "cmap");
    if (!cmap || cmap.offset + 4 > dv.byteLength) {
      notes.push("cmap absent: no per-codepoint glyphs were adopted.");
      return out;
    }
    const cmapOff = cmap.offset;
    const numTables = dv.getUint16(cmapOff + 2);
    let bestOff = -1;
    let bestScore = -1;
    let bestFormat = -1;
    for (let i = 0;i < numTables; i++) {
      const rec = cmapOff + 4 + i * 8;
      if (rec + 8 > dv.byteLength)
        break;
      const platform = dv.getUint16(rec);
      const encoding = dv.getUint16(rec + 2);
      const sub = cmapOff + dv.getUint32(rec + 4);
      if (sub + 4 > dv.byteLength)
        continue;
      const format = dv.getUint16(sub);
      let score = -1;
      if (platform === 3 && encoding === 10 || platform === 0 && (encoding === 4 || encoding === 6)) {
        score = format === 12 ? 400 : format === 13 ? 350 : format === 4 ? 200 : 100;
      } else if (platform === 0) {
        score = format === 12 ? 300 : format === 13 ? 250 : format === 4 ? 150 : 50;
      } else if (platform === 3 && encoding === 1) {
        score = format === 4 ? 100 : 50;
      }
      if (score > bestScore) {
        bestScore = score;
        bestOff = sub;
        bestFormat = format;
      }
    }
    if (bestOff < 0) {
      notes.push("No usable cmap subtable (Unicode or Windows BMP); nothing was adopted.");
      return out;
    }
    let ok = false;
    if (bestFormat === 4) {
      ok = readCmapFormat4(dv, bestOff, out);
    } else if (bestFormat === 12) {
      ok = readCmapFormat12or13(dv, bestOff, out, false);
    } else if (bestFormat === 13) {
      ok = readCmapFormat12or13(dv, bestOff, out, true);
    }
    if (!ok) {
      notes.push(`cmap subtable format ${bestFormat} could not be read; nothing was adopted.`);
      return out;
    }
    if (bestFormat === 4) {
      notes.push("cmap format 4 covers the BMP only; plane-1 math alphanumerics keep MathJax metrics.");
    }
  } catch {
    notes.push("cmap read failed; nothing was adopted.");
  }
  return out;
}
function isAdoptableCodepoint(cp) {
  if (!Number.isFinite(cp) || cp < 32 || cp > 1114111)
    return false;
  if (cp >= 127 && cp <= 159)
    return false;
  if (cp >= 55296 && cp <= 57343)
    return false;
  if (cp >= 57344 && cp <= 63743)
    return false;
  if (cp >= 983040 && cp <= 1048573)
    return false;
  if (cp >= 1048576 && cp <= 1114109)
    return false;
  return true;
}
var texGyrePagellaMathAdapter = {
  id: "tex-gyre-pagella-math",
  name: "TeX Gyre Pagella Math",
  families: ["TeX Gyre Pagella Math", "TeX Gyre Pagella"],
  priority: 50,
  matches(familyName) {
    return matchByFamilyName(texGyrePagellaMathAdapter, familyName);
  },
  build(binary, ctx) {
    const notes = [];
    let math;
    try {
      math = readOpenTypeMathTable(binary);
    } catch (err) {
      notes.push(`MATH table read threw: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    }
    if (!math) {
      return null;
    }
    const chars = {};
    try {
      const dv = new DataView(binary);
      const base = fontBase3(dv);
      const upem = resolveUnitsPerEm(dv, base, math.unitsPerEm, ctx.unitsPerEm);
      const toEm = (design) => design / upem;
      const verticals = readFontWideVerticals(dv, base, toEm, notes);
      const advanceOf = readAdvanceLookup(dv, base, toEm, notes);
      if (advanceOf) {
        const cmap = readCmap4(dv, base, notes);
        let adopted = 0;
        for (const [cp, gid] of cmap) {
          if (!isAdoptableCodepoint(cp))
            continue;
          const width = advanceOf(gid);
          if (!Number.isFinite(width) || width < 0)
            continue;
          chars[String(cp)] = [verticals.ascent, verticals.descent, width];
          adopted++;
        }
        if (adopted > 0) {
          notes.push(`Adopted ${adopted} glyphs from cmap/hmtx; height/depth are the font-wide layout box (${verticals.ascent.toFixed(4)}/${verticals.descent.toFixed(4)} em).`);
          notes.push("Per-glyph vertical extents are approximated with the font-wide ascender/descender: MATH MathGlyphInfo carries no per-glyph layout verticals, and outline bounding boxes are not a layout box.");
        }
      }
    } catch (err) {
      notes.push(`Partial metrics only: ${err instanceof Error ? err.message : String(err)}`);
    }
    notes.push("Constants (axis height, rule thickness, script scaling) are this font's own MATH values, not shared with TeX Gyre Termes Math.");
    notes.push("Stretchy delimiter sizes were left to MathJax: this font does not own the assembly.");
    return {
      source: "opentype-math",
      chars,
      delimiters: undefined,
      constants: math.constants,
      ownsStretchyAssembly: false,
      notes
    };
  }
};

// src/math-standards/adapters/libertinus-math.ts
var CLAIMED_FAMILIES = ["Libertinus Math", "Libertinus"];
function errorText(err) {
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return String(err);
}
function isControlCode(code) {
  return code < 32 || code >= 127 && code <= 159;
}
function isPrivateUseCode(code) {
  return code >= 57344 && code <= 63743 || code >= 983040 && code <= 1048573 || code >= 1048576 && code <= 1114109;
}
function isNonDrawingCode(code) {
  return code >= 55296 && code <= 57343 || code === 65534 || code === 65535;
}
function skipCode(code) {
  return isControlCode(code) || isPrivateUseCode(code) || isNonDrawingCode(code);
}
function fontDirectoryBase(dv) {
  try {
    if (dv.byteLength < 12) {
      return 0;
    }
    const tag = String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3));
    if (tag === "ttcf") {
      const numFonts = dv.getUint32(8);
      if (numFonts < 1) {
        return 0;
      }
      return dv.getUint32(12);
    }
    return 0;
  } catch {
    return 0;
  }
}

class OpenTypeReader {
  dv;
  dir;
  unitsPerEm;
  numGlyphs;
  problems = [];
  headRef;
  hheaRef;
  hmtxRef;
  os2Ref;
  cmapRef;
  glyfRef;
  locaRef;
  constructor(binary) {
    this.dv = new DataView(binary);
    const base = fontDirectoryBase(this.dv);
    this.dir = new DataView(binary, base);
    this.headRef = this.findTable("head");
    this.hheaRef = this.findTable("hhea");
    const maxpRef = this.findTable("maxp");
    this.hmtxRef = this.findTable("hmtx");
    this.os2Ref = this.findTable("OS/2");
    this.cmapRef = this.findTable("cmap");
    this.glyfRef = this.findTable("glyf");
    this.locaRef = this.findTable("loca");
    this.unitsPerEm = this.readUnitsPerEm();
    this.numGlyphs = this.readNumGlyphs(maxpRef);
  }
  findTable(tag) {
    try {
      const numTables = this.dir.getUint16(4);
      for (let i = 0;i < numTables; i++) {
        const rec = 12 + i * 16;
        const t2 = String.fromCharCode(this.dir.getUint8(rec), this.dir.getUint8(rec + 1), this.dir.getUint8(rec + 2), this.dir.getUint8(rec + 3));
        if (t2 === tag) {
          return { offset: this.dir.getUint32(rec + 8), length: this.dir.getUint32(rec + 12) };
        }
      }
    } catch (err) {
      this.problems.push(`Table directory unreadable while looking up '${tag}' (${errorText(err)}).`);
    }
    return null;
  }
  readUnitsPerEm() {
    try {
      if (this.headRef && this.headRef.length >= 20) {
        const upem = this.dv.getUint16(this.headRef.offset + 18);
        if (upem > 0) {
          return upem;
        }
      }
    } catch (err) {
      this.problems.push(`head.unitsPerEm unreadable (${errorText(err)}); assuming 1000.`);
    }
    return 1000;
  }
  readNumGlyphs(maxpRef) {
    try {
      if (maxpRef && maxpRef.length >= 6) {
        return this.dv.getUint16(maxpRef.offset + 4);
      }
    } catch (err) {
      this.problems.push(`maxp.numGlyphs unreadable (${errorText(err)}).`);
    }
    return 0;
  }
  readCmap() {
    const out = new Map;
    if (!this.cmapRef) {
      this.problems.push("cmap table absent; per-glyph metrics left to MathJax.");
      return out;
    }
    try {
      const cmapStart = this.cmapRef.offset;
      const numTables = this.dv.getUint16(cmapStart + 2);
      const subs = [];
      for (let i = 0;i < numTables; i++) {
        const rec = cmapStart + 4 + i * 8;
        if (rec + 8 > this.dv.byteLength) {
          break;
        }
        const subOffset = cmapStart + this.dv.getUint32(rec + 4);
        if (subOffset + 2 > this.dv.byteLength) {
          continue;
        }
        const format = this.dv.getUint16(subOffset);
        if (format === 12) {
          subs.push({ offset: subOffset, score: 3 });
        } else if (format === 4) {
          subs.push({ offset: subOffset, score: 2 });
        } else if (format === 6) {
          subs.push({ offset: subOffset, score: 1 });
        }
      }
      subs.sort((a, b) => b.score - a.score);
      for (const sub of subs) {
        const got = sub.score === 3 ? this.readCmap12(sub.offset) : sub.score === 2 ? this.readCmap4(sub.offset) : this.readCmap6(sub.offset);
        for (const [code, gid] of got) {
          if (!out.has(code)) {
            out.set(code, gid);
          }
        }
      }
      if (out.size === 0) {
        this.problems.push("cmap present but no usable subtable (format 4/6/12).");
      }
    } catch (err) {
      this.problems.push(`cmap parse failed part-way (${errorText(err)}); using what was read.`);
    }
    return out;
  }
  readCmap4(at) {
    const map = new Map;
    const length = this.dv.getUint16(at + 2);
    const hardEnd = this.dv.byteLength;
    const segCountX2 = this.dv.getUint16(at + 6);
    const segCount = segCountX2 >> 1;
    if (segCount === 0 || segCountX2 > 65534) {
      return map;
    }
    const endCodes = at + 14;
    const startCodes = endCodes + segCountX2 + 2;
    const deltas = startCodes + segCountX2;
    const rangeOffsets = deltas + segCountX2;
    for (let i = 0;i < segCount; i++) {
      const endCode = this.dv.getUint16(endCodes + i * 2);
      const startCode = this.dv.getUint16(startCodes + i * 2);
      const delta = this.dv.getInt16(deltas + i * 2);
      const rangeOffset = this.dv.getUint16(rangeOffsets + i * 2);
      if (startCode > endCode || endCode - startCode > 65535) {
        continue;
      }
      for (let code = startCode;code <= endCode; code++) {
        if (code === 65535) {
          continue;
        }
        let gid;
        if (rangeOffset === 0) {
          gid = code + delta & 65535;
        } else {
          const gidAddr = rangeOffsets + i * 2 + rangeOffset + (code - startCode) * 2;
          if (gidAddr + 2 > hardEnd || gidAddr + 2 > at + length) {
            continue;
          }
          gid = this.dv.getUint16(gidAddr);
          if (gid !== 0) {
            gid = gid + delta & 65535;
          }
        }
        if (gid !== 0) {
          map.set(code, gid);
        }
      }
    }
    return map;
  }
  readCmap6(at) {
    const map = new Map;
    const first = this.dv.getUint16(at + 6);
    const count = this.dv.getUint16(at + 8);
    if (count === 0 || count > 65536) {
      return map;
    }
    for (let i = 0;i < count; i++) {
      const addr = at + 10 + i * 2;
      if (addr + 2 > this.dv.byteLength) {
        break;
      }
      const gid = this.dv.getUint16(addr);
      if (gid !== 0) {
        map.set(first + i, gid);
      }
    }
    return map;
  }
  readCmap12(at) {
    const map = new Map;
    const numGroups = this.dv.getUint32(at + 12);
    if (numGroups === 0 || numGroups > 65536) {
      return map;
    }
    for (let i = 0;i < numGroups; i++) {
      const rec = at + 16 + i * 12;
      if (rec + 12 > this.dv.byteLength) {
        break;
      }
      const start = this.dv.getUint32(rec);
      const end = this.dv.getUint32(rec + 4);
      const startGid = this.dv.getUint32(rec + 8);
      if (end < start || end > 1114111 || end - start > 65535) {
        continue;
      }
      for (let code = start;code <= end; code++) {
        const gid = startGid + (code - start);
        if (gid !== 0) {
          map.set(code, gid);
        }
      }
    }
    return map;
  }
  readAdvanceWidths() {
    try {
      if (!this.hmtxRef || !this.hheaRef || this.numGlyphs <= 0) {
        this.problems.push("hmtx/hhea/maxp missing; advance widths unavailable.");
        return new Uint16Array(0);
      }
      const numberOfHMetrics = Math.max(1, this.dv.getUint16(this.hheaRef.offset + 34));
      const widths = new Uint16Array(this.numGlyphs);
      for (let gid = 0;gid < this.numGlyphs; gid++) {
        const rec = gid < numberOfHMetrics ? gid : numberOfHMetrics - 1;
        widths[gid] = this.dv.getUint16(this.hmtxRef.offset + rec * 4);
      }
      return widths;
    } catch (err) {
      this.problems.push(`hmtx read failed (${errorText(err)}); advance widths unavailable.`);
      return new Uint16Array(0);
    }
  }
  readGlyphVerticals() {
    try {
      if (!this.glyfRef || !this.locaRef || !this.headRef || this.numGlyphs <= 0) {
        return null;
      }
      const indexToLocFormat = this.dv.getInt16(this.headRef.offset + 50);
      const entrySize = indexToLocFormat === 0 ? 2 : 4;
      const locaNeed = this.locaRef.offset + (this.numGlyphs + 1) * entrySize;
      if (locaNeed > this.dv.byteLength) {
        this.problems.push("loca table truncated; falling back to font-wide verticals.");
        return null;
      }
      const upem = this.unitsPerEm || 1000;
      const map = new Map;
      for (let gid = 0;gid < this.numGlyphs; gid++) {
        let start;
        let end;
        if (indexToLocFormat === 0) {
          start = this.dv.getUint16(this.locaRef.offset + gid * 2) * 2;
          end = this.dv.getUint16(this.locaRef.offset + (gid + 1) * 2) * 2;
        } else {
          start = this.dv.getUint32(this.locaRef.offset + gid * 4);
          end = this.dv.getUint32(this.locaRef.offset + (gid + 1) * 4);
        }
        if (end <= start) {
          map.set(gid, { height: 0, depth: 0 });
          continue;
        }
        if (start + 10 > this.dv.byteLength) {
          continue;
        }
        const yMin = this.dv.getInt16(this.glyfRef.offset + start + 4);
        const yMax = this.dv.getInt16(this.glyfRef.offset + start + 8);
        map.set(gid, {
          height: Math.max(0, yMax) / upem,
          depth: Math.max(0, -yMin) / upem
        });
      }
      return map;
    } catch (err) {
      this.problems.push(`glyf/loca read failed (${errorText(err)}); falling back to font-wide verticals.`);
      return null;
    }
  }
  readFontWideVerticals() {
    try {
      const upem = this.unitsPerEm || 1000;
      if (this.os2Ref && this.os2Ref.length >= 74) {
        const asc = this.dv.getInt16(this.os2Ref.offset + 68);
        const desc = this.dv.getInt16(this.os2Ref.offset + 70);
        if (asc > 0 || desc < 0) {
          return { height: Math.max(0, asc) / upem, depth: Math.max(0, -desc) / upem };
        }
      }
      if (this.hheaRef) {
        const asc = this.dv.getInt16(this.hheaRef.offset + 4);
        const desc = this.dv.getInt16(this.hheaRef.offset + 6);
        return { height: Math.max(0, asc) / upem, depth: Math.max(0, -desc) / upem };
      }
    } catch (err) {
      this.problems.push(`OS/2 and hhea verticals unreadable (${errorText(err)}).`);
    }
    return null;
  }
}
function summarizeItalicCorrection(italicCorrection, notes) {
  const values = Object.values(italicCorrection);
  if (values.length === 0) {
    notes.push("MATH table carries no italics-correction coverage.");
    return;
  }
  let max = 0;
  let sum = 0;
  for (const v of values) {
    sum += v;
    if (v > max) {
      max = v;
    }
  }
  const mean = sum / values.length;
  notes.push(`Libertinus Math states a generous italic correction (${values.length} glyphs; max ${max.toFixed(4)} em, mean ${mean.toFixed(4)} em). ` + `The plugin's italic override interacts with these values — prefer the font's own correction over synthetic slanting.`);
}
function buildChars(reader, notes) {
  const chars = {};
  const cmap = reader.readCmap();
  if (cmap.size === 0) {
    return chars;
  }
  const upem = reader.unitsPerEm || 1000;
  const advances = reader.readAdvanceWidths();
  const perGlyph = reader.readGlyphVerticals();
  const wide = perGlyph ? null : reader.readFontWideVerticals();
  let kept = 0;
  let skippedNonDrawing = 0;
  let skippedZeroWidth = 0;
  let skippedNoVertical = 0;
  for (const [code, gid] of cmap) {
    if (skipCode(code)) {
      skippedNonDrawing++;
      continue;
    }
    const width = (gid >= 0 && gid < advances.length ? advances[gid] : 0) / upem;
    if (!(width > 0)) {
      skippedZeroWidth++;
      continue;
    }
    let box = perGlyph ? perGlyph.get(gid) : wide ?? undefined;
    if (!box) {
      skippedNoVertical++;
      continue;
    }
    chars[String(code)] = [box.height, box.depth, width];
    kept++;
  }
  notes.push(`Read ${kept} glyphs from cmap+hmtx; kept MathJax metrics for ${skippedNonDrawing} non-drawing codepoints and ` + `${skippedZeroWidth} zero-advance glyphs${skippedNoVertical > 0 ? ` and ${skippedNoVertical} glyphs without vertical extents` : ""}.`);
  if (perGlyph) {
    notes.push("Per-glyph verticals come from glyf bounding boxes.");
  } else if (wide) {
    notes.push("No per-glyph verticals (CFF outlines): font-wide OS/2 sTypoAscender/sTypoDescender (or hhea) stand in for every glyph — heights and depths are approximate.");
  } else {
    notes.push("No vertical extents could be read; per-glyph metrics left entirely to MathJax.");
  }
  return chars;
}
var libertinusMathAdapter = {
  id: "libertinus-math",
  name: "Libertinus Math",
  families: CLAIMED_FAMILIES,
  priority: 60,
  matches(familyName) {
    return matchByFamilyName({ families: CLAIMED_FAMILIES }, familyName);
  },
  build(binary, ctx) {
    const notes = [];
    const math = readOpenTypeMathTable(binary);
    if (!math) {
      return null;
    }
    try {
      const reader = new OpenTypeReader(binary);
      const upem = math.unitsPerEm > 0 ? math.unitsPerEm : reader.unitsPerEm;
      if (ctx.unitsPerEm && ctx.unitsPerEm !== upem) {
        notes.push(`Caller reported unitsPerEm=${ctx.unitsPerEm}, font says ${upem}; using the font's value.`);
      }
      const chars = buildChars(reader, notes);
      summarizeItalicCorrection(math.italicCorrection, notes);
      notes.push("Stretchy delimiter sizes were left to MathJax: this font does not own the assembly.");
      for (const problem of reader.problems) {
        notes.push(problem);
      }
      return {
        source: "opentype-math",
        chars,
        delimiters: undefined,
        constants: math.constants,
        ownsStretchyAssembly: false,
        notes
      };
    } catch (err) {
      notes.push(`Libertinus Math metrics could not be assembled (${errorText(err)}); MathJax metrics kept.`);
      return {
        source: "opentype-math",
        chars: {},
        delimiters: undefined,
        constants: math.constants,
        ownsStretchyAssembly: false,
        notes
      };
    }
  }
};

// src/math-standards/adapters/asana-math.ts
var ADAPTER_FAMILIES = ["Asana Math", "Asana"];
function isPrivateUse3(code) {
  return code >= 57344 && code <= 63743 || code >= 983040 && code <= 1048573 || code >= 1048576 && code <= 1114109;
}
function isControl3(code) {
  return code < 32 || code >= 127 && code <= 159;
}
function readTableDirectory2(dv) {
  const tables = new Map;
  if (dv.byteLength < 12) {
    return tables;
  }
  let base = 0;
  const headTag = String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3));
  if (headTag === "ttcf") {
    if (dv.byteLength < 16) {
      return tables;
    }
    base = dv.getUint32(12);
  }
  if (base < 0 || base + 12 > dv.byteLength) {
    return tables;
  }
  const numTables = dv.getUint16(base + 4);
  for (let i = 0;i < numTables; i++) {
    const rec = base + 12 + i * 16;
    if (rec + 16 > dv.byteLength) {
      break;
    }
    const tag = String.fromCharCode(dv.getUint8(rec), dv.getUint8(rec + 1), dv.getUint8(rec + 2), dv.getUint8(rec + 3));
    const offset = dv.getUint32(rec + 8);
    const length = dv.getUint32(rec + 12);
    if (offset <= dv.byteLength && length <= dv.byteLength - offset) {
      tables.set(tag, { offset, length });
    }
  }
  return tables;
}
function parseCmapFormat42(dv, off, into) {
  const segCountX2 = dv.getUint16(off + 6);
  const segCount = segCountX2 >> 1;
  if (segCount <= 0 || segCount > 16384) {
    return;
  }
  const endBase = off + 14;
  const startBase = endBase + segCountX2 + 2;
  const deltaBase = startBase + segCountX2;
  const rangeBase = deltaBase + segCountX2;
  for (let i = 0;i < segCount; i++) {
    const end = dv.getUint16(endBase + i * 2);
    const start = dv.getUint16(startBase + i * 2);
    const delta = dv.getInt16(deltaBase + i * 2);
    const rangeOffset = dv.getUint16(rangeBase + i * 2);
    if (start > end) {
      continue;
    }
    if (end - start > 65535) {
      continue;
    }
    for (let code = start;code <= end; code++) {
      let gid;
      if (rangeOffset === 0) {
        gid = code + delta & 65535;
      } else {
        const addr = rangeBase + i * 2 + rangeOffset + (code - start) * 2;
        gid = dv.getUint16(addr);
        if (gid !== 0) {
          gid = gid + delta & 65535;
        }
      }
      if (gid !== 0) {
        into.set(code, gid);
      }
    }
  }
}
function parseCmapFormat122(dv, off, into) {
  const nGroups = dv.getUint32(off + 12);
  const groups = Math.min(nGroups, 131072);
  const groupsOff = off + 16;
  for (let i = 0;i < groups; i++) {
    const rec = groupsOff + i * 12;
    const start = dv.getUint32(rec);
    const end = dv.getUint32(rec + 4);
    const startGid = dv.getUint32(rec + 8);
    if (start > end || end - start > 65535) {
      continue;
    }
    for (let code = start;code <= end; code++) {
      const gid = startGid + (code - start);
      if (gid !== 0) {
        into.set(code, gid);
      }
    }
  }
}
function readCodepointMap(dv, ref, notes) {
  const map = new Map;
  const base = ref.offset;
  const numSubtables = dv.getUint16(base + 2);
  let parsed = 0;
  for (let i = 0;i < numSubtables; i++) {
    const rec = base + 4 + i * 8;
    if (rec + 8 > base + ref.length) {
      break;
    }
    const platform = dv.getUint16(rec);
    const encoding = dv.getUint16(rec + 2);
    const subOff = base + dv.getUint32(rec + 4);
    if (subOff + 4 > dv.byteLength) {
      continue;
    }
    const format = dv.getUint16(subOff);
    try {
      if (format === 4) {
        parseCmapFormat42(dv, subOff, map);
        parsed++;
      } else if (format === 12 && (platform === 3 || platform === 0 || encoding === 10)) {
        parseCmapFormat122(dv, subOff, map);
        parsed++;
      }
    } catch (err) {
      notes.push(`cmap subtable ${i} (format ${format}) could not be read; skipped.`);
      notes.push(`cmap read error: ${String(err)}`);
    }
  }
  if (parsed === 0) {
    notes.push("No readable Unicode cmap subtable (format 4 or 12); chars cannot be keyed by codepoint.");
  }
  return map;
}
function readAdvances2(dv, ref, numberOfHMetrics, numGlyphs) {
  const advances = new Array(numGlyphs).fill(0);
  const metricCount = Math.max(1, Math.min(numberOfHMetrics, numGlyphs));
  for (let gid = 0;gid < numGlyphs; gid++) {
    const slot = Math.min(gid, metricCount - 1);
    advances[gid] = dv.getUint16(ref.offset + slot * 4);
  }
  return advances;
}
function readOutlineExtents(dv, locaRef, glyfRef, numGlyphs, longLoca, notes) {
  if (!locaRef || !glyfRef || numGlyphs <= 0) {
    notes.push("No glyf/loca outlines (CFF or unreadable); per-glyph verticals fall back to font-wide ascender/descender.");
    return null;
  }
  try {
    const entrySize = longLoca ? 4 : 2;
    const need = (numGlyphs + 1) * entrySize;
    if (locaRef.length < need) {
      notes.push("loca table shorter than numGlyphs; per-glyph verticals fall back to font-wide ascender/descender.");
      return null;
    }
    const readLoca = (i) => longLoca ? dv.getUint32(locaRef.offset + i * 4) : dv.getUint16(locaRef.offset + i * 2) * 2;
    const out = new Array(numGlyphs).fill(null);
    for (let gid = 0;gid < numGlyphs; gid++) {
      const start = readLoca(gid);
      const end = readLoca(gid + 1);
      if (end <= start) {
        out[gid] = null;
        continue;
      }
      const at = glyfRef.offset + start;
      if (start + 10 > glyfRef.length || at + 10 > dv.byteLength) {
        out[gid] = null;
        continue;
      }
      out[gid] = {
        yMin: dv.getInt16(at + 4),
        yMax: dv.getInt16(at + 8)
      };
    }
    return out;
  } catch (err) {
    notes.push(`glyf/loca read failed (${String(err)}); per-glyph verticals fall back to font-wide ascender/descender.`);
    return null;
  }
}
function readFontVerticals(dv, tables, notes) {
  let ascent = 0;
  let descent = 0;
  try {
    const os2 = tables.get("OS/2");
    if (os2 && os2.length >= 72) {
      ascent = dv.getInt16(os2.offset + 68);
      descent = dv.getInt16(os2.offset + 70);
    }
  } catch (err) {
    notes.push(`OS/2 verticals unreadable (${String(err)}); trying hhea.`);
  }
  if (!(ascent > 0) || !(descent < 0)) {
    try {
      const hhea = tables.get("hhea");
      if (hhea && hhea.length >= 8) {
        ascent = dv.getInt16(hhea.offset + 4);
        descent = dv.getInt16(hhea.offset + 6);
      }
    } catch (err) {
      notes.push(`hhea verticals unreadable (${String(err)}).`);
    }
  }
  if (!(ascent > 0) || !(descent < 0)) {
    notes.push("No usable OS/2 or hhea vertical metrics; using a declared 0.8em / 0.2em em-box guess.");
    return { ascent: 800, descent: -200 };
  }
  return { ascent, descent };
}
function readNumGlyphs2(dv, tables, notes) {
  try {
    const maxp = tables.get("maxp");
    if (maxp && maxp.length >= 6) {
      const n = dv.getUint16(maxp.offset + 4);
      if (n > 0) {
        return n;
      }
    }
  } catch (err) {
    notes.push(`maxp unreadable (${String(err)}).`);
  }
  notes.push("numGlyphs unavailable; only advance widths for glyph ids under 65535 can be trusted.");
  return 0;
}
function readHead(dv, tables, notes) {
  let unitsPerEm = 0;
  let longLoca = false;
  try {
    const head = tables.get("head");
    if (head && head.length >= 54) {
      unitsPerEm = dv.getUint16(head.offset + 18);
      longLoca = dv.getInt16(head.offset + 50) !== 0;
    }
  } catch (err) {
    notes.push(`head unreadable (${String(err)}).`);
  }
  return { unitsPerEm, longLoca };
}
var asanaMathAdapter = {
  id: "asana-math",
  name: "Asana Math",
  families: ADAPTER_FAMILIES,
  priority: 70,
  matches(familyName) {
    return matchByFamilyName({ families: ADAPTER_FAMILIES }, familyName);
  },
  build(binary, ctx) {
    const notes = [];
    try {
      const math = readOpenTypeMathTable(binary);
      if (!math) {
        return null;
      }
      const dv = new DataView(binary);
      const tables = readTableDirectory2(dv);
      const headInfo = readHead(dv, tables, notes);
      const upm = math.unitsPerEm || headInfo.unitsPerEm || ctx.unitsPerEm || 1000;
      const toEm = (design) => design / upm;
      const cmapRef = tables.get("cmap");
      const codeToGid = cmapRef ? readCodepointMap(dv, cmapRef, notes) : new Map;
      if (!cmapRef) {
        notes.push("No cmap table; chars cannot be keyed by codepoint.");
      }
      const numGlyphs = readNumGlyphs2(dv, tables, notes);
      const hheaRef = tables.get("hhea");
      let numberOfHMetrics = numGlyphs;
      try {
        if (hheaRef && hheaRef.length >= 36) {
          numberOfHMetrics = dv.getUint16(hheaRef.offset + 34);
        }
      } catch (err) {
        notes.push(`hhea.numberOfHMetrics unreadable (${String(err)}); assuming all glyphs carry a full metric record.`);
      }
      const hmtxRef = tables.get("hmtx");
      let advances = [];
      if (hmtxRef && numGlyphs > 0) {
        try {
          advances = readAdvances2(dv, hmtxRef, numberOfHMetrics, numGlyphs);
        } catch (err) {
          notes.push(`hmtx read failed (${String(err)}); widths left to MathJax.`);
        }
      } else if (!hmtxRef) {
        notes.push("No hmtx table; widths left to MathJax.");
      }
      const extents = readOutlineExtents(dv, tables.get("loca"), tables.get("glyf"), numGlyphs, headInfo.longLoca, notes);
      const fontVerticals = readFontVerticals(dv, tables, notes);
      const fontHeight = Math.max(0, toEm(fontVerticals.ascent));
      const fontDepth = Math.max(0, toEm(-fontVerticals.descent));
      const chars = {};
      let built = 0;
      let skipped = 0;
      for (const [code, gid] of codeToGid) {
        if (isPrivateUse3(code) || isControl3(code)) {
          continue;
        }
        const width = advances[gid];
        if (width === undefined || !(width > 0)) {
          skipped++;
          continue;
        }
        const w = toEm(width);
        let h;
        let d;
        if (extents) {
          const box = extents[gid];
          if (box) {
            h = Math.max(0, toEm(box.yMax));
            d = Math.max(0, toEm(-box.yMin));
          } else {
            h = 0;
            d = 0;
          }
        } else {
          h = fontHeight;
          d = fontDepth;
        }
        chars[String(code)] = [h, d, w];
        built++;
      }
      if (built === 0) {
        notes.push("No glyph of the cmap coverage produced a usable layout box; MathJax metrics stay in place for chars.");
      }
      if (!extents) {
        notes.push("Per-glyph height/depth are the font-wide ascender/descender approximation (OpenType hmtx has no per-glyph verticals and outlines were unreadable).");
      }
      const vertCount = Object.keys(math.vertVariants).length;
      const horizCount = Object.keys(math.horizVariants).length;
      let assemblyCount = 0;
      for (const key of Object.keys(math.vertVariants)) {
        if (math.vertVariants[key].assembly) {
          assemblyCount++;
        }
      }
      for (const key of Object.keys(math.horizVariants)) {
        if (math.horizVariants[key].assembly) {
          assemblyCount++;
        }
      }
      notes.push(`MATH table adopted (axis height ${math.constants.axisHeight ?? "n/a"}em); ` + `${vertCount} vertical and ${horizCount} horizontal constructions, ${assemblyCount} with assembly recipes.`);
      notes.push("Stretchy delimiter target sizes were left to MathJax: this font does not own the assembly.");
      notes.push(`Built ${built} glyph layout boxes from font tables; skipped ${skipped} without a usable advance.`);
      return {
        source: "opentype-math",
        chars,
        delimiters: undefined,
        constants: math.constants,
        ownsStretchyAssembly: false,
        notes
      };
    } catch (err) {
      notes.push(`Asana Math adapter failed and declined: ${String(err)}`);
      return null;
    }
  }
};

// src/math-standards/adapters/cambria-math.ts
var FAMILIES3 = ["Cambria Math", "Cambria"];
var MAX_CODEPOINT_ENTRIES = 300000;
function describeError(e) {
  return e instanceof Error ? e.message : String(e);
}
function readTag(dv, at) {
  return String.fromCharCode(dv.getUint8(at), dv.getUint8(at + 1), dv.getUint8(at + 2), dv.getUint8(at + 3));
}
function findTable3(dv, base, tag) {
  try {
    const numTables = dv.getUint16(base + 4);
    for (let i = 0;i < numTables; i++) {
      const rec = base + 12 + i * 16;
      if (rec + 16 > dv.byteLength)
        break;
      if (readTag(dv, rec) !== tag)
        continue;
      const offset = dv.getUint32(rec + 8);
      const length = dv.getUint32(rec + 12);
      if (offset + length > dv.byteLength)
        return null;
      return { offset, length };
    }
  } catch {}
  return null;
}
function getTable(dv, tag) {
  return findTable3(dv, 0, tag);
}
function isCollection2(dv) {
  return dv.byteLength >= 12 && readTag(dv, 0) === "ttcf";
}
function rebuildSingleFont(dv, base) {
  const numTables = dv.getUint16(base + 4);
  if (numTables < 1 || numTables > 512) {
    throw new Error(`unreasonable table count ${numTables}`);
  }
  const tags = [];
  const checksums = [];
  const sources = [];
  for (let i = 0;i < numTables; i++) {
    const rec = base + 12 + i * 16;
    if (rec + 16 > dv.byteLength) {
      throw new Error("table directory truncated");
    }
    const tag = readTag(dv, rec);
    const checksum = dv.getUint32(rec + 4);
    const offset = dv.getUint32(rec + 8);
    const length = dv.getUint32(rec + 12);
    if (offset + length > dv.byteLength) {
      throw new Error(`table ${tag} out of range`);
    }
    tags.push(tag);
    checksums.push(checksum);
    sources.push({ offset, length });
  }
  const headerSize = 12 + numTables * 16;
  let cursor = headerSize;
  const placements = [];
  for (const src of sources) {
    placements.push(cursor);
    cursor = cursor + src.length + 3 & ~3;
  }
  const out = new ArrayBuffer(cursor);
  const odv = new DataView(out);
  const outBytes = new Uint8Array(out);
  const srcBytes = new Uint8Array(dv.buffer, dv.byteOffset, dv.byteLength);
  odv.setUint32(0, dv.getUint32(base));
  odv.setUint16(4, numTables);
  const maxPow2 = 1 << 31 - Math.clz32(numTables);
  odv.setUint16(6, maxPow2 * 16);
  odv.setUint16(8, Math.log2(maxPow2) | 0);
  odv.setUint16(10, numTables * 16 - maxPow2 * 16);
  for (let i = 0;i < numTables; i++) {
    const rec = 12 + i * 16;
    for (let t2 = 0;t2 < 4; t2++) {
      odv.setUint8(rec + t2, tags[i].charCodeAt(t2));
    }
    odv.setUint32(rec + 4, checksums[i]);
    odv.setUint32(rec + 8, placements[i]);
    odv.setUint32(rec + 12, sources[i].length);
    outBytes.set(srcBytes.subarray(sources[i].offset, sources[i].offset + sources[i].length), placements[i]);
  }
  return out;
}
function extractSingleFont(binary, notes) {
  const dv = new DataView(binary);
  if (!isCollection2(dv)) {
    return binary;
  }
  try {
    const numFonts = dv.getUint32(8);
    if (numFonts < 1)
      return binary;
    let chosen = -1;
    for (let i = 0;i < numFonts; i++) {
      const at = 12 + i * 4;
      if (at + 4 > binary.byteLength)
        break;
      const base = dv.getUint32(at);
      if (base <= 0 || base + 12 > binary.byteLength)
        continue;
      if (chosen < 0)
        chosen = base;
      if (findTable3(dv, base, "MATH")) {
        chosen = base;
        break;
      }
    }
    if (chosen < 0)
      return binary;
    const rebuilt = rebuildSingleFont(dv, chosen);
    notes.push("OpenType collection unpacked to the member that carries the MATH table.");
    return rebuilt;
  } catch (e) {
    notes.push(`OpenType collection could not be unpacked (${describeError(e)}); reading the file as-is.`);
    return binary;
  }
}
function readHhea(dv) {
  try {
    const ref = getTable(dv, "hhea");
    if (!ref || ref.length < 36)
      return null;
    return {
      ascent: dv.getInt16(ref.offset + 4),
      descent: dv.getInt16(ref.offset + 6),
      numHMetrics: dv.getUint16(ref.offset + 34)
    };
  } catch (e) {
    return null;
  }
}
function readOs2(dv, notes) {
  try {
    const ref = getTable(dv, "OS/2");
    if (!ref || ref.length < 8)
      return null;
    const info = {
      fsSelection: 0,
      sTypoAscender: 0,
      sTypoDescender: 0,
      usWinAscent: 0,
      usWinDescent: 0
    };
    if (ref.length >= 64) {
      info.fsSelection = dv.getUint16(ref.offset + 62);
    }
    if (ref.length >= 72) {
      info.sTypoAscender = dv.getInt16(ref.offset + 68);
      info.sTypoDescender = dv.getInt16(ref.offset + 70);
    }
    if (ref.length >= 78) {
      info.usWinAscent = dv.getUint16(ref.offset + 74);
      info.usWinDescent = dv.getUint16(ref.offset + 76);
    }
    return info;
  } catch (e) {
    notes.push(`OS/2 table unreadable (${describeError(e)}); falling back to hhea verticals.`);
    return null;
  }
}
function pickVertical(hhea, os2) {
  const typoUsable = !!os2 && os2.sTypoAscender > 0;
  const useTypo = typoUsable && (os2.fsSelection & 128) !== 0;
  if (useTypo && os2) {
    return {
      ascent: os2.sTypoAscender,
      descent: Math.abs(os2.sTypoDescender),
      source: "OS/2 sTypoAscender/sTypoDescender (USE_TYPO_METRICS)"
    };
  }
  if (hhea && hhea.ascent > 0) {
    return {
      ascent: hhea.ascent,
      descent: Math.abs(hhea.descent),
      source: "hhea ascent/descent"
    };
  }
  if (typoUsable && os2) {
    return {
      ascent: os2.sTypoAscender,
      descent: Math.abs(os2.sTypoDescender),
      source: "OS/2 sTypoAscender/sTypoDescender"
    };
  }
  if (os2 && os2.usWinAscent > 0) {
    return {
      ascent: os2.usWinAscent,
      descent: os2.usWinDescent,
      source: "OS/2 usWinAscent/usWinDescent"
    };
  }
  return { ascent: 800, descent: 200, source: "built-in 0.8/0.2 default" };
}
function parseCmap4(dv, sub, end, into) {
  const segCountX2 = dv.getUint16(sub + 6);
  if (segCountX2 < 2 || (segCountX2 & 1) !== 0)
    return;
  const segCount = segCountX2 / 2;
  const endBase = sub + 14;
  const startBase = endBase + segCountX2 + 2;
  const deltaBase = startBase + segCountX2;
  const rangeBase = deltaBase + segCountX2;
  for (let s = 0;s < segCount; s++) {
    const segEnd = dv.getUint16(endBase + s * 2);
    const segStart = dv.getUint16(startBase + s * 2);
    const delta = dv.getInt16(deltaBase + s * 2);
    const rangeOffset = dv.getUint16(rangeBase + s * 2);
    if (segStart === 65535 || segStart > segEnd)
      continue;
    for (let c = segStart;c <= segEnd; c++) {
      if (into.size >= MAX_CODEPOINT_ENTRIES)
        return;
      let gid;
      if (rangeOffset === 0) {
        gid = c + delta & 65535;
      } else {
        const idx = rangeBase + s * 2 + rangeOffset + (c - segStart) * 2;
        if (idx + 2 > end)
          return;
        gid = dv.getUint16(idx);
        if (gid !== 0)
          gid = gid + delta & 65535;
      }
      if (gid === 0)
        continue;
      if (!into.has(c))
        into.set(c, gid);
    }
  }
}
function parseCmap6(dv, sub, end, into) {
  const firstCode = dv.getUint16(sub + 6);
  const entryCount = dv.getUint16(sub + 8);
  for (let i = 0;i < entryCount; i++) {
    if (into.size >= MAX_CODEPOINT_ENTRIES)
      return;
    const idx = sub + 10 + i * 2;
    if (idx + 2 > end)
      return;
    const gid = dv.getUint16(idx);
    if (gid === 0)
      continue;
    const code = firstCode + i;
    if (!into.has(code))
      into.set(code, gid);
  }
}
function parseCmap12(dv, sub, end, into) {
  const numGroups = dv.getUint32(sub + 12);
  for (let i = 0;i < numGroups; i++) {
    const rec = sub + 16 + i * 12;
    if (rec + 12 > end)
      return;
    const start = dv.getUint32(rec);
    const finish2 = dv.getUint32(rec + 4);
    const startGid = dv.getUint32(rec + 8);
    if (start > finish2 || finish2 > 1114111)
      continue;
    for (let c = start;c <= finish2; c++) {
      if (into.size >= MAX_CODEPOINT_ENTRIES)
        return;
      const gid = startGid + (c - start);
      if (gid === 0)
        continue;
      if (!into.has(c))
        into.set(c, gid);
    }
  }
}
function readCmap5(dv, notes) {
  const map = new Map;
  try {
    const ref = getTable(dv, "cmap");
    if (!ref) {
      notes.push("No cmap table: codepoint coverage unknown, chars left empty.");
      return map;
    }
    const numSub = dv.getUint16(ref.offset + 2);
    for (let i = 0;i < numSub; i++) {
      const rec = ref.offset + 4 + i * 8;
      if (rec + 8 > ref.offset + ref.length)
        break;
      const platform = dv.getUint16(rec);
      const encoding = dv.getUint16(rec + 2);
      const isUnicode = platform === 0 || platform === 3 && (encoding === 1 || encoding === 10);
      if (!isUnicode)
        continue;
      const sub = ref.offset + dv.getUint32(rec + 4);
      if (sub + 4 > ref.offset + ref.length)
        continue;
      const end = ref.offset + ref.length;
      const format = dv.getUint16(sub);
      if (format === 12)
        parseCmap12(dv, sub, end, map);
      else if (format === 4)
        parseCmap4(dv, sub, end, map);
      else if (format === 6)
        parseCmap6(dv, sub, end, map);
    }
    if (map.size === 0) {
      notes.push("cmap contained no usable Unicode subtable; chars left empty.");
    } else if (map.size >= MAX_CODEPOINT_ENTRIES) {
      notes.push(`cmap truncated at ${MAX_CODEPOINT_ENTRIES} entries (corrupt size guard).`);
    }
  } catch (e) {
    notes.push(`cmap table unreadable (${describeError(e)}); partial coverage kept.`);
  }
  return map;
}
function readHmtx(dv, numHMetrics, notes) {
  try {
    const ref = getTable(dv, "hmtx");
    if (!ref) {
      notes.push("No hmtx table: advance widths unavailable, chars left empty.");
      return null;
    }
    const count = Math.max(0, Math.min(numHMetrics, Math.floor(ref.length / 4)));
    if (count === 0) {
      notes.push("hmtx has no longHorMetric records; advance widths unavailable.");
      return null;
    }
    const advances = new Uint16Array(count);
    for (let i = 0;i < count; i++) {
      advances[i] = dv.getUint16(ref.offset + i * 4);
    }
    const tail = advances[count - 1];
    return (gid) => gid < count ? advances[gid] : tail;
  } catch (e) {
    notes.push(`hmtx table unreadable (${describeError(e)}); advance widths unavailable.`);
    return null;
  }
}
function isPrivateUse4(code) {
  return code >= 57344 && code <= 63743 || code >= 983040 && code <= 1048573 || code >= 1048576 && code <= 1114109;
}
function isControl4(code) {
  return code < 32 || code >= 127 && code <= 159;
}
var cambriaMathAdapter = {
  id: "cambria-math",
  name: "Cambria Math",
  families: FAMILIES3,
  priority: 80,
  matches(familyName) {
    return matchByFamilyName({ families: FAMILIES3 }, familyName);
  },
  build(binary, ctx) {
    const notes = [];
    let mathTable = null;
    let chars = {};
    try {
      if (!binary || binary.byteLength < 12) {
        return null;
      }
      const font = extractSingleFont(binary, notes);
      const dv = new DataView(font);
      mathTable = readOpenTypeMathTable(font);
      if (!mathTable) {
        return null;
      }
      const upm = mathTable.unitsPerEm > 0 ? mathTable.unitsPerEm : ctx.unitsPerEm && ctx.unitsPerEm > 0 ? ctx.unitsPerEm : 1000;
      const vertical = pickVertical(readHhea(dv), readOs2(dv, notes));
      const height = vertical.ascent / upm;
      const depth = vertical.descent / upm;
      const cmap = readCmap5(dv, notes);
      const hhea = readHhea(dv);
      const advanceFor = readHmtx(dv, hhea ? hhea.numHMetrics : 0, notes);
      let used = 0;
      let skipped = 0;
      if (advanceFor && cmap.size > 0) {
        for (const [code, gid] of cmap) {
          if (gid <= 0 || isPrivateUse4(code) || isControl4(code) || code > 1114111) {
            skipped++;
            continue;
          }
          const advance = advanceFor(gid);
          if (!(advance > 0)) {
            skipped++;
            continue;
          }
          chars[String(code)] = [height, depth, advance / upm];
          used++;
        }
      }
      if (cmap.size > 0 && used === 0 && advanceFor) {
        chars = {};
        notes.push("Every hmtx advance was zero; treating hmtx as unreadable and leaving chars empty.");
      }
      notes.push(`Layout-box height/depth from font-wide ${vertical.source} ` + `(${height.toFixed(4)} / ${depth.toFixed(4)} em): the MATH table carries no per-glyph vertical extents, ` + `so verticals are an approximation; widths are exact hmtx advances.`);
      notes.push(`Read ${used} glyph boxes from cmap+hmtx (skipped ${skipped}: private-use, control, .notdef or zero advance).`);
      notes.push("MATH constants taken verbatim from Cambria Math (ClearType-tuned; axis height is relatively high by design).");
      notes.push("Stretchy delimiter sizes left to MathJax (delimiters omitted, ownsStretchyAssembly=false): " + "brace and arrow assembly uses MathJax private-use pieces, not this font.");
      if (Object.keys(mathTable.italicCorrection).length > 0) {
        notes.push(`MATH italics corrections for ${Object.keys(mathTable.italicCorrection).length} glyphs were read ` + "but not exported (MathFontMetrics has no field for them).");
      }
      return {
        source: "opentype-math",
        chars,
        delimiters: undefined,
        constants: mathTable.constants,
        ownsStretchyAssembly: false,
        notes
      };
    } catch (e) {
      notes.push(`Cambria Math metrics were only partially read: ${describeError(e)}`);
      if (mathTable) {
        return {
          source: "opentype-math",
          chars,
          constants: mathTable.constants,
          ownsStretchyAssembly: false,
          notes
        };
      }
      return null;
    }
  }
};

// src/math-standards/adapters/minion-math.ts
var FAMILIES4 = ["Minion Math"];
function findTableRange(dv, base, tag) {
  try {
    const numTables = dv.getUint16(base + 4);
    for (let i = 0;i < numTables; i++) {
      const rec = base + 12 + i * 16;
      const t2 = String.fromCharCode(dv.getUint8(rec), dv.getUint8(rec + 1), dv.getUint8(rec + 2), dv.getUint8(rec + 3));
      if (t2 === tag) {
        return { offset: dv.getUint32(rec + 8), length: dv.getUint32(rec + 12) };
      }
    }
  } catch {}
  return null;
}
function firstFontBase(dv) {
  try {
    const tag = String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3));
    if (tag === "ttcf") {
      const numFonts = dv.getUint32(8);
      if (numFonts < 1)
        return 0;
      return dv.getUint32(12);
    }
  } catch {}
  return 0;
}
function isControl5(code) {
  return code < 32 || code >= 127 && code <= 159;
}
function isPrivateUse5(code) {
  return code >= 57344 && code <= 63743 || code >= 983040 && code <= 1048573 || code >= 1048576 && code <= 1114109;
}
function isSurrogate(code) {
  return code >= 55296 && code <= 57343;
}
function isSpacing(code) {
  return code === 32 || code === 160 || code >= 8192 && code <= 8202 || code === 8232 || code === 8233 || code === 8239 || code === 8287 || code === 12288;
}
function parseCmapFormat43(dv, at, end, into) {
  const segCount = dv.getUint16(at + 6) / 2;
  const endCodes = at + 14;
  const startCodes = endCodes + segCount * 2 + 2;
  const idDeltas = startCodes + segCount * 2;
  const idRangeOffsets = idDeltas + segCount * 2;
  for (let i = 0;i < segCount; i++) {
    const end2 = dv.getUint16(endCodes + i * 2);
    const start = dv.getUint16(startCodes + i * 2);
    if (start === 65535 || start > end2)
      continue;
    const delta = dv.getInt16(idDeltas + i * 2);
    const rangeOffset = dv.getUint16(idRangeOffsets + i * 2);
    for (let code = start;code <= end2; code++) {
      let gid;
      if (rangeOffset === 0) {
        gid = code + delta & 65535;
      } else {
        const addr = idRangeOffsets + i * 2 + rangeOffset + (code - start) * 2;
        if (addr + 2 > end2)
          break;
        gid = dv.getUint16(addr);
        if (gid !== 0)
          gid = gid + delta & 65535;
      }
      if (gid !== 0)
        into.set(code, gid);
    }
  }
}
function parseCmapFormat123(dv, at, end, into, manyToOne) {
  const numGroups = dv.getUint32(at + 12);
  for (let g = 0;g < numGroups; g++) {
    const rec = at + 16 + g * 12;
    if (rec + 12 > end)
      break;
    const startChar = dv.getUint32(rec);
    const endChar = dv.getUint32(rec + 4);
    const startGid = dv.getUint32(rec + 8);
    if (startChar > endChar)
      continue;
    for (let code = startChar;code <= endChar; code++) {
      const gid = manyToOne ? startGid : startGid + (code - startChar);
      if (gid !== 0)
        into.set(code, gid);
    }
  }
}
function parseCmapSmall(dv, at, end, into, format) {
  if (format === 0) {
    for (let code = 0;code < 256; code++) {
      const addr = at + 6 + code;
      if (addr >= end)
        break;
      const gid = dv.getUint8(addr);
      if (gid !== 0)
        into.set(code, gid);
    }
    return;
  }
  const first = dv.getUint16(at + 6);
  const count = dv.getUint16(at + 8);
  for (let i = 0;i < count; i++) {
    const addr = at + 10 + i * 2;
    if (addr + 2 > end)
      break;
    const gid = dv.getUint16(addr);
    if (gid !== 0)
      into.set(first + i, gid);
  }
}
function parseCmap(dv, table, notes) {
  const map = new Map;
  try {
    const end = table.offset + table.length;
    const numTables = dv.getUint16(table.offset + 2);
    const subtables = [];
    for (let i = 0;i < numTables; i++) {
      const rec = table.offset + 4 + i * 8;
      if (rec + 8 > end)
        break;
      const subOff = table.offset + dv.getUint32(rec + 4);
      if (subOff + 2 > end)
        continue;
      const format = dv.getUint16(subOff);
      let score = 0;
      if (format === 12 || format === 13)
        score = 3;
      else if (format === 4)
        score = 2;
      else if (format === 0 || format === 6)
        score = 1;
      if (score > 0)
        subtables.push({ offset: subOff, score });
    }
    subtables.sort((a, b) => a.score - b.score);
    for (const sub of subtables) {
      const format = dv.getUint16(sub.offset);
      if (format === 4)
        parseCmapFormat43(dv, sub.offset, end, map);
      else if (format === 12)
        parseCmapFormat123(dv, sub.offset, end, map, false);
      else if (format === 13)
        parseCmapFormat123(dv, sub.offset, end, map, true);
      else
        parseCmapSmall(dv, sub.offset, end, map, format);
    }
    if (map.size === 0) {
      notes.push("cmap subtables were present but yielded no codepoint mapping.");
    }
  } catch {
    notes.push("cmap could not be fully parsed; codepoints mapped so far were kept.");
  }
  return map;
}
function readGlyphLayout(binary, notes, upemFallback, ctx) {
  try {
    const dv = new DataView(binary);
    const base = firstFontBase(dv);
    const head = findTableRange(dv, base, "head");
    const hhea = findTableRange(dv, base, "hhea");
    const maxp = findTableRange(dv, base, "maxp");
    const hmtx = findTableRange(dv, base, "hmtx");
    const cmapTable = findTableRange(dv, base, "cmap");
    if (!head || !hhea || !maxp || !hmtx || !cmapTable) {
      notes.push("Required tables (head/hhea/maxp/hmtx/cmap) are incomplete; declining.");
      return null;
    }
    const unitsPerEm = dv.getUint16(head.offset + 18) || upemFallback || ctx.unitsPerEm || 1000;
    const numGlyphs = dv.getUint16(maxp.offset + 4);
    if (!(numGlyphs > 0)) {
      notes.push("maxp reports no glyphs; declining.");
      return null;
    }
    const hheaAsc = dv.getInt16(hhea.offset + 4);
    const hheaDesc = dv.getInt16(hhea.offset + 6);
    const rawHMetrics = dv.getUint16(hhea.offset + 34);
    let fontAscentDU = hheaAsc;
    let fontDescentDU = Math.max(0, -hheaDesc);
    let verticalSource = "hhea";
    const os2 = findTableRange(dv, base, "OS/2");
    if (os2 && os2.length >= 72) {
      const typoAsc = dv.getInt16(os2.offset + 68);
      const typoDesc = dv.getInt16(os2.offset + 70);
      if (typoAsc > 0) {
        fontAscentDU = typoAsc;
        fontDescentDU = Math.max(0, -typoDesc);
        verticalSource = "os2-typo";
      }
    }
    if (!(fontAscentDU > 0)) {
      fontAscentDU = Math.round(unitsPerEm * 0.75);
      fontDescentDU = Math.round(unitsPerEm * 0.25);
      verticalSource = "default";
      notes.push("Neither OS/2 sTypo nor hhea gave a usable ascender; used 0.75em/0.25em defaults.");
    }
    const advances = new Uint16Array(numGlyphs);
    const hMetricsCount = Math.max(1, Math.min(rawHMetrics || 1, numGlyphs, Math.floor(hmtx.length / 4)));
    for (let g = 0;g < numGlyphs; g++) {
      const rec = hmtx.offset + Math.min(g, hMetricsCount - 1) * 4;
      advances[g] = dv.getUint16(rec);
    }
    if (hMetricsCount < (rawHMetrics || 1)) {
      notes.push("hmtx is shorter than hhea.numberOfHMetrics; advance widths were truncated to the readable range.");
    }
    const cmap = parseCmap(dv, cmapTable, notes);
    let yMin = null;
    let yMax = null;
    const glyf = findTableRange(dv, base, "glyf");
    const loca = findTableRange(dv, base, "loca");
    if (glyf && loca) {
      try {
        const indexToLocFormat = dv.getInt16(head.offset + 50);
        const needed = indexToLocFormat === 0 ? (numGlyphs + 1) * 2 : (numGlyphs + 1) * 4;
        if (loca.length >= needed) {
          yMin = new Int16Array(numGlyphs);
          yMax = new Int16Array(numGlyphs);
          const glyfEnd = glyf.offset + glyf.length;
          for (let g = 0;g < numGlyphs; g++) {
            let start;
            let stop;
            if (indexToLocFormat === 0) {
              start = dv.getUint16(loca.offset + g * 2) * 2;
              stop = dv.getUint16(loca.offset + (g + 1) * 2) * 2;
            } else {
              start = dv.getUint32(loca.offset + g * 4);
              stop = dv.getUint32(loca.offset + (g + 1) * 4);
            }
            if (stop <= start || start + 10 > glyfEnd || stop > glyfEnd)
              continue;
            yMin[g] = dv.getInt16(glyf.offset + start + 4);
            yMax[g] = dv.getInt16(glyf.offset + start + 8);
          }
          verticalSource = "glyf";
          notes.push("Per-glyph vertical extents come from glyf bounding boxes (TrueType outlines).");
        }
      } catch {
        yMin = null;
        yMax = null;
        notes.push("glyf/loca could not be read; fell back to font-wide vertical extents.");
      }
    } else {
      notes.push("No glyf/loca (CFF outlines): height/depth use the font-wide ascender/descender for every glyph.");
    }
    return {
      unitsPerEm,
      numGlyphs,
      advances,
      cmap,
      yMin,
      yMax,
      fontAscent: fontAscentDU / unitsPerEm,
      fontDescent: fontDescentDU / unitsPerEm,
      verticalSource
    };
  } catch {
    notes.push("Glyph layout tables could not be read at all; declining.");
    return null;
  }
}
var minionMathAdapter = {
  id: "minion-math",
  name: "Minion Math",
  families: FAMILIES4,
  priority: 90,
  matches(familyName) {
    return matchByFamilyName({ families: FAMILIES4 }, familyName);
  },
  build(binary, ctx) {
    const notes = [];
    const chars = {};
    let constants;
    try {
      const math = readOpenTypeMathTable(binary);
      if (!math) {
        return null;
      }
      constants = math.constants;
      const layout = readGlyphLayout(binary, notes, math.unitsPerEm, ctx);
      if (!layout) {
        return null;
      }
      const upem = layout.unitsPerEm;
      let mapped = 0;
      let skipped = 0;
      for (const [code, gid] of layout.cmap) {
        if (code <= 0 || isControl5(code) || isPrivateUse5(code) || isSurrogate(code)) {
          skipped++;
          continue;
        }
        if (gid <= 0 || gid >= layout.numGlyphs) {
          skipped++;
          continue;
        }
        const width = layout.advances[gid] / upem;
        let height;
        let depth;
        if (layout.yMax && layout.yMin) {
          height = Math.max(0, layout.yMax[gid] / upem);
          depth = Math.max(0, -layout.yMin[gid] / upem);
        } else if (isSpacing(code)) {
          height = 0;
          depth = 0;
        } else {
          height = layout.fontAscent;
          depth = layout.fontDescent;
        }
        chars[String(code)] = [height, depth, width];
        mapped++;
      }
      if (mapped === 0) {
        notes.push("No usable codepoint could be mapped from cmap; declining.");
        return null;
      }
      notes.push(`Mapped ${mapped} codepoints; kept MathJax metrics for ${skipped} control, private-use or absent ones.`);
      if (layout.verticalSource !== "glyf") {
        notes.push("Vertical extents are a font-wide approximation (OS/2 sTypo / hhea), not per-glyph ink.");
      }
      notes.push("Stretchy delimiter sizes were left to MathJax: Minion Math is substituted into MathJax and does not own the assembly.");
      return {
        source: "opentype-math",
        chars,
        delimiters: undefined,
        constants,
        ownsStretchyAssembly: false,
        notes
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      notes.push(`Minion Math adapter failed mid-build: ${message}`);
      const count = Object.keys(chars).length;
      if (count === 0) {
        return null;
      }
      return {
        source: "opentype-math",
        chars,
        delimiters: undefined,
        constants,
        ownsStretchyAssembly: false,
        notes
      };
    }
  }
};

// src/math-standards/adapters/noto-math.ts
var notoMathAdapter = {
  id: "noto-math",
  name: "Noto Sans/Serif Math",
  families: ["Noto Sans Math", "Noto Serif Math", "Noto Sans Math Mono"],
  priority: 100,
  matches(familyName) {
    return matchByFamilyName(this, familyName);
  },
  build(binary, _ctx) {
    const font = readOpenTypeFontInfo(binary);
    if (!font) {
      return null;
    }
    const math = readOpenTypeMathTable(binary);
    const built = buildCharsFromFont(font);
    if (built.mapped === 0) {
      return null;
    }
    const notes = [
      "Noto maths fonts: coverage-first design, deliberately plain shapes.",
      math ? "Read from the font's OpenType MATH table; nothing was measured." : "No MATH table found — boxes come from the font's own hmtx/OS-2 metrics.",
      `Mapped ${built.mapped} glyphs; left ${built.skippedAbsent} uncovered ones to MathJax.`
    ];
    if (math && math.extendedShapes.size > 0) {
      notes.push(`${math.extendedShapes.size} glyphs are extended shapes.`);
    }
    return {
      source: math ? "opentype-math" : "tex-tfm",
      chars: built.chars,
      delimiters: undefined,
      ownsStretchyAssembly: false,
      constants: math ? math.constants : undefined,
      notes
    };
  }
};

// src/math-standards/adapters/fira-math.ts
var firaMathAdapter = {
  id: "fira-math",
  name: "Fira Math",
  families: ["Fira Math"],
  priority: 110,
  matches(familyName) {
    return matchByFamilyName(this, familyName);
  },
  build(binary, _ctx) {
    const font = readOpenTypeFontInfo(binary);
    if (!font) {
      return null;
    }
    const math = readOpenTypeMathTable(binary);
    const built = buildCharsFromFont(font);
    if (built.mapped === 0) {
      return null;
    }
    const notes = [
      "Fira lineage: humanist sans, large x-height and short ascenders.",
      math ? "Read from the font's OpenType MATH table; nothing was measured." : "No MATH table found — boxes come from the font's own hmtx/OS-2 metrics.",
      `Mapped ${built.mapped} glyphs; left ${built.skippedAbsent} uncovered ones to MathJax.`
    ];
    if (font.verticals.xHeight) {
      notes.push(`x-height ${font.verticals.xHeight.toFixed(3)}em, ascent ${font.verticals.ascent.toFixed(3)}em.`);
    }
    return {
      source: math ? "opentype-math" : "tex-tfm",
      chars: built.chars,
      delimiters: undefined,
      ownsStretchyAssembly: false,
      constants: math ? math.constants : undefined,
      notes
    };
  }
};

// src/math-standards/adapters/euler-math.ts
var EULER_FAMILIES = ["Euler Math", "Neo Euler", "Euler"];
var MAX_MAPPED_CODEPOINTS = 65536;
var MAX_BAND_EM = 2;
function isPrivateUse6(code) {
  return code >= 57344 && code <= 63743 || code >= 983040 && code <= 1048573 || code >= 1048576 && code <= 1114109;
}
function isControl6(code) {
  return code < 32 || code >= 127 && code <= 159;
}
function isSurrogate2(code) {
  return code >= 55296 && code <= 57343;
}
function sfntBase(dv) {
  try {
    if (dv.byteLength < 12)
      return null;
    const tag = String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3));
    if (tag === "ttcf") {
      if (dv.byteLength < 16)
        return null;
      return dv.getUint32(12);
    }
    const version = dv.getUint32(0);
    if (version === 65536 || tag === "OTTO" || tag === "true" || tag === "typ1")
      return 0;
    return null;
  } catch {
    return null;
  }
}
function findTable4(dv, base, tag) {
  try {
    if (base + 12 > dv.byteLength)
      return null;
    const numTables = dv.getUint16(base + 4);
    for (let i = 0;i < numTables; i++) {
      const rec = base + 12 + i * 16;
      if (rec + 16 > dv.byteLength)
        return null;
      const t2 = String.fromCharCode(dv.getUint8(rec), dv.getUint8(rec + 1), dv.getUint8(rec + 2), dv.getUint8(rec + 3));
      if (t2 === tag) {
        return { offset: dv.getUint32(rec + 8), length: dv.getUint32(rec + 12) };
      }
    }
  } catch {}
  return null;
}
function readFontWide(binary) {
  try {
    const dv = new DataView(binary);
    const base = sfntBase(dv);
    if (base === null)
      return null;
    const out = {
      unitsPerEm: 1000,
      typoAscender: null,
      typoDescender: null,
      hheaAscender: null,
      hheaDescender: null,
      numberOfHMetrics: null,
      numGlyphs: null
    };
    const head = findTable4(dv, base, "head");
    if (head && head.length >= 20 && head.offset + 20 <= binary.byteLength) {
      const upem = dv.getUint16(head.offset + 18);
      if (upem > 0)
        out.unitsPerEm = upem;
    }
    const os2 = findTable4(dv, base, "OS/2");
    if (os2 && os2.length >= 72 && os2.offset + 72 <= binary.byteLength) {
      out.typoAscender = dv.getInt16(os2.offset + 68);
      out.typoDescender = dv.getInt16(os2.offset + 70);
    }
    const hhea = findTable4(dv, base, "hhea");
    if (hhea && hhea.length >= 36 && hhea.offset + 36 <= binary.byteLength) {
      out.hheaAscender = dv.getInt16(hhea.offset + 4);
      out.hheaDescender = dv.getInt16(hhea.offset + 6);
      out.numberOfHMetrics = dv.getUint16(hhea.offset + 34);
    }
    const maxp = findTable4(dv, base, "maxp");
    if (maxp && maxp.length >= 6 && maxp.offset + 6 <= binary.byteLength) {
      out.numGlyphs = dv.getUint16(maxp.offset + 4);
    }
    return out;
  } catch {
    return null;
  }
}
function parseCmapSubtable(dv, at, tableEnd) {
  try {
    if (at + 4 > tableEnd)
      return null;
    const map = new Map;
    const format = dv.getUint16(at);
    if (format === 12) {
      if (at + 16 > tableEnd)
        return null;
      const numGroups = dv.getUint32(at + 12);
      for (let g = 0;g < numGroups; g++) {
        const rec = at + 16 + g * 12;
        if (rec + 12 > tableEnd)
          break;
        const startChar = dv.getUint32(rec);
        const endChar = Math.min(dv.getUint32(rec + 4), 1114111);
        const startGid = dv.getUint32(rec + 8);
        for (let code = startChar;code <= endChar; code++) {
          if (map.size >= MAX_MAPPED_CODEPOINTS)
            return map.size > 0 ? map : null;
          const gid = startGid + (code - startChar);
          if (gid !== 0)
            map.set(code, gid);
        }
      }
    } else if (format === 4) {
      if (at + 14 > tableEnd)
        return null;
      const segCount = dv.getUint16(at + 6) >> 1;
      if (segCount < 1)
        return null;
      const endPos = at + 14;
      const startPos = endPos + segCount * 2 + 2;
      const deltaPos = startPos + segCount * 2;
      const rangePos = deltaPos + segCount * 2;
      if (rangePos + segCount * 2 > tableEnd)
        return null;
      for (let i = 0;i < segCount; i++) {
        const endCode = dv.getUint16(endPos + i * 2);
        const startCode = dv.getUint16(startPos + i * 2);
        if (startCode === 65535 || startCode > endCode)
          continue;
        const idDelta = dv.getInt16(deltaPos + i * 2);
        const idRangeOffset = dv.getUint16(rangePos + i * 2);
        for (let code = startCode;code <= endCode; code++) {
          if (map.size >= MAX_MAPPED_CODEPOINTS)
            return map.size > 0 ? map : null;
          let gid = 0;
          if (idRangeOffset === 0) {
            gid = code + idDelta & 65535;
          } else {
            const gPos = rangePos + i * 2 + idRangeOffset + (code - startCode) * 2;
            if (gPos + 2 > tableEnd)
              continue;
            gid = dv.getUint16(gPos);
            if (gid !== 0)
              gid = gid + idDelta & 65535;
          }
          if (gid !== 0)
            map.set(code, gid);
        }
      }
    } else if (format === 6) {
      if (at + 10 > tableEnd)
        return null;
      const firstCode = dv.getUint16(at + 6);
      const entryCount = dv.getUint16(at + 8);
      for (let i = 0;i < entryCount; i++) {
        const rec = at + 10 + i * 2;
        if (rec + 2 > tableEnd)
          break;
        const gid = dv.getUint16(rec);
        if (gid !== 0)
          map.set(firstCode + i, gid);
      }
    } else if (format === 0) {
      for (let code = 0;code < 256; code++) {
        const rec = at + 6 + code;
        if (rec + 1 > tableEnd)
          break;
        const gid = dv.getUint8(rec);
        if (gid !== 0)
          map.set(code, gid);
      }
    } else {
      return null;
    }
    return map.size > 0 ? map : null;
  } catch {
    return null;
  }
}
function readCmap6(binary) {
  try {
    const dv = new DataView(binary);
    const base = sfntBase(dv);
    if (base === null)
      return null;
    const cmap = findTable4(dv, base, "cmap");
    if (!cmap || cmap.length < 4)
      return null;
    const tableEnd = Math.min(cmap.offset + cmap.length, binary.byteLength);
    const numTables = dv.getUint16(cmap.offset + 2);
    const candidates = [];
    for (let i = 0;i < numTables; i++) {
      const rec = cmap.offset + 4 + i * 8;
      if (rec + 8 > tableEnd)
        break;
      const platform = dv.getUint16(rec);
      const encoding = dv.getUint16(rec + 2);
      const subOff = cmap.offset + dv.getUint32(rec + 4);
      if (subOff + 4 > tableEnd)
        continue;
      const format = dv.getUint16(subOff);
      let score = 0;
      if (format === 12)
        score = 4;
      else if (format === 4)
        score = 3;
      else if (format === 6)
        score = 2;
      else if (format === 0)
        score = 1;
      if (score === 0)
        continue;
      if (platform === 3 && encoding === 10)
        score += 3;
      else if (platform === 0)
        score += 2;
      else if (platform === 3 && encoding === 1)
        score += 1;
      candidates.push({ score, offset: subOff });
    }
    candidates.sort((a, b) => b.score - a.score);
    for (const candidate of candidates) {
      const map = parseCmapSubtable(dv, candidate.offset, tableEnd);
      if (map)
        return map;
    }
    return null;
  } catch {
    return null;
  }
}
function readAdvances3(binary, numberOfHMetrics, numGlyphs) {
  try {
    if (numberOfHMetrics < 1)
      return null;
    const dv = new DataView(binary);
    const base = sfntBase(dv);
    if (base === null)
      return null;
    const hmtx = findTable4(dv, base, "hmtx");
    if (!hmtx)
      return null;
    const count = numGlyphs !== null && numGlyphs > 0 ? numGlyphs : numberOfHMetrics;
    const need = numberOfHMetrics * 4 + Math.max(0, count - numberOfHMetrics) * 2;
    if (hmtx.offset + Math.min(need, hmtx.length) > binary.byteLength)
      return null;
    const out = new Uint16Array(count);
    for (let gid = 0;gid < count; gid++) {
      const metric = gid < numberOfHMetrics ? gid : numberOfHMetrics - 1;
      const rec = hmtx.offset + metric * 4;
      if (rec + 2 > tableEndOf(hmtx, binary.byteLength))
        return out.length > 0 ? out : null;
      out[gid] = dv.getUint16(rec);
    }
    return out;
  } catch {
    return null;
  }
}
function tableEndOf(table, fileLength) {
  return Math.min(table.offset + table.length, fileLength);
}
var eulerMathAdapter = {
  id: "euler-math",
  name: "Euler / Neo Euler",
  families: EULER_FAMILIES,
  priority: 120,
  matches(familyName) {
    return matchByFamilyName({ families: EULER_FAMILIES }, familyName);
  },
  build(binary, ctx) {
    const notes = [];
    const chars = {};
    let constants;
    let source = "opentype-math";
    try {
      const math = readOpenTypeMathTable(binary);
      const wide = readFontWide(binary);
      if (!math && !wide) {
        return null;
      }
      const unitsPerEm = (math ? math.unitsPerEm : 0) || (wide ? wide.unitsPerEm : 0) || ctx.unitsPerEm || 1000;
      let ascDesign = wide ? wide.typoAscender : null;
      let descDesign = wide ? wide.typoDescender : null;
      let bandSource = "OS/2 sTypoAscender/sTypoDescender";
      const typoUsable = typeof ascDesign === "number" && ascDesign > 0 && typeof descDesign === "number" && descDesign < 0;
      if (!typoUsable) {
        ascDesign = wide ? wide.hheaAscender : null;
        descDesign = wide ? wide.hheaDescender : null;
        bandSource = "hhea ascent/descent";
      }
      const height = typeof ascDesign === "number" ? ascDesign / unitsPerEm : NaN;
      const depth = typeof descDesign === "number" ? Math.abs(descDesign) / unitsPerEm : NaN;
      if (!(height > 0) || !(depth >= 0) || height > MAX_BAND_EM || depth > MAX_BAND_EM) {
        return null;
      }
      const numberOfHMetrics = wide ? wide.numberOfHMetrics : null;
      const numGlyphs = wide ? wide.numGlyphs : null;
      if (numberOfHMetrics === null) {
        return null;
      }
      const advances = readAdvances3(binary, numberOfHMetrics, numGlyphs);
      const cmap = readCmap6(binary);
      if (!advances || !cmap) {
        return null;
      }
      let skippedFiltered = 0;
      let skippedZeroAdvance = 0;
      const gidToCode = new Map;
      for (const [code, gid] of cmap) {
        if (isPrivateUse6(code) || isControl6(code) || isSurrogate2(code)) {
          skippedFiltered++;
          continue;
        }
        const advance = gid >= 0 && gid < advances.length ? advances[gid] : 0;
        if (!(advance > 0)) {
          skippedZeroAdvance++;
          continue;
        }
        chars[String(code)] = [height, depth, advance / unitsPerEm];
        if (!gidToCode.has(gid))
          gidToCode.set(gid, code);
      }
      if (Object.keys(chars).length === 0) {
        return null;
      }
      notes.push("Euler / Neo Euler — the OpenType revival of Zapf's AMS Euler (CTAN euler-math; Neo-Euler.otf renamed Euler-Math.otf).");
      notes.push("Design: upright-calligraphic letterforms rather than Times-like math italics; every number here is the font's own, never inferred from Times-like conventions.");
      notes.push(`Layout band (approximation, applied per glyph): height ${height.toFixed(4)}em / depth ${depth.toFixed(4)}em from ${bandSource}; ` + "width is each glyph's real advance from hmtx. OpenType MATH carries no per-glyph vertical extents, so the band over-reserves for small glyphs — expected for Euler, whose calligraphic shapes are unusually uneven.");
      if (math) {
        constants = math.constants;
        source = "opentype-math";
        const axis = math.constants.axisHeight;
        if (typeof axis === "number") {
          notes.push(`MATH table read: axisHeight ${axis.toFixed(4)}em — non-standard versus Times-like math fonts; used exactly as the font states it (Euler's fraction bars and minus signs sit on its own axis).`);
        } else {
          notes.push("MATH table read, but its axis height was not present; left undefined for MathJax.");
        }
        const italics = Object.keys(math.italicCorrection).length;
        if (italics > 0) {
          let maxId = "";
          let maxVal = -Infinity;
          for (const [gid, value] of Object.entries(math.italicCorrection)) {
            if (value > maxVal) {
              maxVal = value;
              maxId = gid;
            }
          }
          const code = gidToCode.get(Number(maxId));
          const where = code !== undefined ? `U+${code.toString(16).toUpperCase()}` : `glyph ${maxId}`;
          notes.push(`Italics corrections: ${italics} entries, largest ${maxVal.toFixed(4)}em at ${where} — non-standard versus Times-like fonts, following Euler's upright-calligraphic design.`);
        } else {
          notes.push("Italics corrections: none in the MATH table.");
        }
        notes.push("Stretchy assemblies were readable but not exported: `delimiters` stays undefined so MathJax keeps its own brace and arrow target sizes.");
      } else {
        constants = undefined;
        source = "reference";
        notes.push("No readable MATH table in this file: constants omitted; layout boxes come from head/hhea/OS/2/cmap/hmtx only.");
      }
      notes.push(`Mapped ${Object.keys(chars).length} codepoints; kept MathJax metrics for ${skippedFiltered} private-use/control/surrogate and ${skippedZeroAdvance} zero-advance codepoints.`);
      notes.push("Stretchy delimiter sizes were left to MathJax: this font does not own the assembly.");
      return {
        source,
        chars,
        delimiters: undefined,
        constants,
        ownsStretchyAssembly: false,
        notes
      };
    } catch (err) {
      if (Object.keys(chars).length > 0) {
        notes.push(`Euler adapter hit an unexpected error and returned partial metrics: ${String(err)}`);
        return {
          source,
          chars,
          delimiters: undefined,
          constants,
          ownsStretchyAssembly: false,
          notes
        };
      }
      return null;
    }
  }
};

// src/math-standards/adapters/computer-modern.ts
var TEX_DESIGN_CONSTANTS = {
  ascent: 0.75,
  descent: 0.25,
  xHeight: 0.43,
  capHeight: 0.67
};
var computerModernAdapter = {
  id: "computer-modern",
  name: "Computer Modern / Concrete",
  families: [
    "Computer Modern",
    "CMU Serif",
    "CMU Sans Serif",
    "CMU Bright",
    "CMU Typewriter Text",
    "Concrete",
    "Concrete Roman",
    "Dingbats"
  ],
  priority: 130,
  matches(familyName) {
    return matchByFamilyName(this, familyName);
  },
  build(binary, _ctx) {
    const font = readOpenTypeFontInfo(binary);
    if (!font) {
      return null;
    }
    const math = readOpenTypeMathTable(binary);
    const built = buildCharsFromFont(font);
    if (built.mapped === 0) {
      return null;
    }
    const verticalsLookSane = Math.abs(font.verticals.ascent - TEX_DESIGN_CONSTANTS.ascent) < 0.15;
    const notes = [
      "Computer Modern lineage: TeX TFM design constants apply.",
      math ? "Read from the font's OpenType MATH table; nothing was measured." : "No MATH table — boxes come from the font's own hmtx/OS-2 metrics.",
      `Mapped ${built.mapped} glyphs; left ${built.skippedAbsent} uncovered ones to MathJax.`
    ];
    if (!verticalsLookSane) {
      notes.push(`Font states ascent ${font.verticals.ascent.toFixed(3)}em against the CM design's ` + `${TEX_DESIGN_CONSTANTS.ascent}em — kept the font's own value.`);
    }
    return {
      source: math ? "opentype-math" : "tex-tfm",
      chars: built.chars,
      delimiters: undefined,
      ownsStretchyAssembly: false,
      constants: math ? math.constants : undefined,
      notes
    };
  }
};

// src/math-standards/adapters/mathjax-tex.ts
var mathJaxTexAdapter = {
  id: "mathjax-tex",
  name: "MathJax TeX faces (reference)",
  families: [
    "MJX-TEX-N",
    "MJX-TEX-B",
    "MJX-TEX-I",
    "MJX-TEX-BI",
    "MJX-TEX-MI",
    "MJX-TEX-S1",
    "MJX-TEX-S2",
    "MJX-TEX-S3",
    "MJX-TEX-S4",
    "MJX-TEX-ZERO",
    "MJX-BRK",
    "MJX-MHC-N",
    "MJX-MHC-M",
    "MJXZERO",
    "MJXTEX"
  ],
  priority: 5,
  matches(familyName) {
    try {
      return matchByFamilyName(this, familyName);
    } catch (error) {
      console.error("[mathjax-tex] family match failed:", error);
      return false;
    }
  },
  build(_binary, _ctx) {
    return null;
  }
};

// src/math-standards/fallback-measure.ts
var PROBE_SIZE = 200;
var NOT_A_GLYPH = "\uDBFF\uDFFD";
function isPrivateUse7(code) {
  return code >= 57344 && code <= 63743 || code >= 983040 && code <= 1048573 || code >= 1048576 && code <= 1114109;
}
function isControl7(code) {
  return code < 32 || code >= 127 && code <= 159;
}
function measureWith(ctx, family, text) {
  ctx.font = `${PROBE_SIZE}px "${family.replace(/"/g, "")}"`;
  const m = ctx.measureText(text);
  return {
    width: m.width,
    ascent: m.actualBoundingBoxAscent || 0,
    descent: m.actualBoundingBoxDescent || 0
  };
}
function sameInk(a, b) {
  return a.width === b.width && a.ascent === b.ascent && a.descent === b.descent;
}
var measurementFallbackAdapter = {
  id: "fallback-measure",
  name: "Measured (fallback)",
  families: [],
  priority: 1000,
  matches(_familyName) {
    return true;
  },
  build(_binary, ctx) {
    const familyName = (ctx.familyName || "").trim();
    if (!familyName) {
      return null;
    }
    const canvas = typeof document !== "undefined" ? document.createElement("canvas") : null;
    const c2d = canvas ? canvas.getContext("2d") : null;
    if (!c2d) {
      return null;
    }
    const notes = [];
    const notdef = measureWith(c2d, familyName, NOT_A_GLYPH);
    const chars = {};
    let measured = 0;
    let skippedMissing = 0;
    const ranges = [
      [32, 126],
      [160, 255],
      [8192, 8303],
      [8304, 8351],
      [8352, 8383],
      [8448, 8527],
      [8592, 8703],
      [8704, 8959],
      [8960, 9215],
      [9632, 9727],
      [9728, 9983],
      [10176, 10223],
      [10624, 10751],
      [10752, 11007],
      [119808, 120831]
    ];
    for (const [from, to] of ranges) {
      for (let code = from;code <= to; code++) {
        if (isPrivateUse7(code) || isControl7(code)) {
          continue;
        }
        const text = String.fromCodePoint(code);
        const ink = measureWith(c2d, familyName, text);
        if (sameInk(ink, notdef)) {
          skippedMissing++;
          continue;
        }
        const width = ink.width / PROBE_SIZE;
        const ascent = ink.ascent / PROBE_SIZE;
        const descent = ink.descent / PROBE_SIZE;
        const height = Math.max(0, ascent);
        const depth = Math.max(0, descent);
        if (!(width > 0)) {
          skippedMissing++;
          continue;
        }
        chars[String(code)] = [height, depth, width];
        measured++;
      }
    }
    if (measured === 0) {
      notes.push("No glyph of the probed set could be measured; leaving MathJax metrics in place.");
      return null;
    }
    notes.push(`Measured ${measured} glyphs; kept MathJax metrics for ${skippedMissing} absent or unusable ones.`);
    notes.push("Stretchy delimiter sizes were left to MathJax: this font does not own the assembly.");
    if (skippedMissing > 0) {
      notes.push(`Presence detection uses a missing-codepoint baseline, not zero-width, because canvas falls back silently.`);
    }
    return {
      source: "measured",
      chars,
      delimiters: undefined,
      ownsStretchyAssembly: false,
      notes
    };
  }
};

// src/math-standards/index.ts
var adapters = [
  xitsMathAdapter,
  stixTwoMathAdapter,
  latinModernMathAdapter,
  texGyreTermesMathAdapter,
  texGyrePagellaMathAdapter,
  libertinusMathAdapter,
  asanaMathAdapter,
  cambriaMathAdapter,
  minionMathAdapter,
  notoMathAdapter,
  firaMathAdapter,
  eulerMathAdapter,
  computerModernAdapter,
  mathJaxTexAdapter,
  measurementFallbackAdapter
].sort((a, b) => a.priority - b.priority);
function findMathFontAdapter(familyName) {
  for (const adapter of adapters) {
    if (adapter.matches(familyName)) {
      return adapter;
    }
  }
  return null;
}
function buildMathMetrics(binary, familyName, unitsPerEm) {
  const ctx = { familyName, unitsPerEm };
  const named = adapters.filter((a) => a.id !== measurementFallbackAdapter.id && a.matches(familyName));
  const pool = named.length > 0 ? named : [measurementFallbackAdapter];
  for (const adapter of pool) {
    try {
      const metrics = adapter.build(binary, ctx);
      if (metrics) {
        return { metrics, adapterId: adapter.id, adapterName: adapter.name };
      }
    } catch {
      continue;
    }
  }
  return null;
}

// src/plugin.ts
var browserNavigator = window.navigator;
var RECORDED_META_KEYS = ["platform", "os", "model", "hostname", "firstSeen", "lastSeen"];
var SEEN_REFRESH_MS = 6 * 60 * 60 * 1000;
var FONT_CSS_SNIPPET = "local-font-loader";
var FONT_FACES_ID = "local-font-loader-faces";
var FONT_GLYPHS_ID = "local-font-loader-glyphs";
var SNIPPET_PARK_RECOVERY_MS = 5000;
var MATH_ADOPTION_RETRY_MS = 5000;

class LocalFontLoaderPlugin extends import_obsidian10.Plugin {
  currentDeviceId;
  _mathAdoptionAttemptAt = 0;
  _mathFontSnapshot = null;
  _mathAdaptationLayer = null;
  _mathAdaptationSource = "MathJax's own metrics";
  _mathCoverageGaps = [];
  _appliedCss = new Map;
  _snippetCss = new Map;
  _snippetEnabled = false;
  _snippetSync = Promise.resolve();
  _isScanning = false;
  _isSaving = false;
  _dataReloadTimer = null;
  _settingsFilePresent = false;
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
      this.saveData(this.settings).catch((error) => this._logError("[Local Font Loader] Failed to save settings:", error));
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
        this._logError("[Local Font Loader] Critical: presets array is empty or undefined");
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
      if (!this.settings.deviceAliases) {
        this.settings.deviceAliases = {};
      }
      await this.repairDeviceList();
      const activeDeviceId = this.currentDeviceId;
      const deviceInfo = this._detectDeviceInfo();
      const previousMeta = this.settings.deviceMeta[activeDeviceId];
      const legacyShape = previousMeta ? Object.keys(previousMeta).some((key) => !RECORDED_META_KEYS.includes(key)) : false;
      const metaChanged = !previousMeta || previousMeta.platform !== deviceInfo.platform || previousMeta.os !== deviceInfo.os || previousMeta.model !== deviceInfo.model || previousMeta.hostname !== deviceInfo.hostname || legacyShape;
      const seenAt = new Date().toISOString();
      const lastSeenTime = previousMeta && previousMeta.lastSeen ? Date.parse(previousMeta.lastSeen) : Number.NaN;
      const seenStale = Number.isNaN(lastSeenTime) || Date.now() - lastSeenTime > SEEN_REFRESH_MS;
      const lifetime = {
        firstSeen: previousMeta && previousMeta.firstSeen || seenAt,
        lastSeen: seenStale ? seenAt : previousMeta.lastSeen
      };
      const isKnownDevice = Boolean(this.settings.deviceNameMap[activeDeviceId]);
      const storedName = this.settings.deviceNameMap[activeDeviceId];
      const generatedNameOutdated = isKnownDevice && this._isGeneratedDeviceName(storedName, previousMeta) && storedName !== this._getDefaultDeviceName(deviceInfo);
      if (!isKnownDevice) {
        this.settings.deviceMeta[activeDeviceId] = { ...deviceInfo, ...lifetime };
        this.settings.deviceNameMap[activeDeviceId] = this._getDefaultDeviceName(deviceInfo);
        await this._persistStartupState();
        this._log(`[Local Font Loader] New device registered: ${activeDeviceId} (${this.settings.deviceNameMap[activeDeviceId]})`);
      } else if (metaChanged || generatedNameOutdated || seenStale) {
        this.settings.deviceMeta[activeDeviceId] = { ...deviceInfo, ...lifetime };
        if (generatedNameOutdated) {
          this.settings.deviceNameMap[activeDeviceId] = this._getDefaultDeviceName(deviceInfo);
          this._log(`[Local Font Loader] Default device name refreshed: ${storedName} -> ${this.settings.deviceNameMap[activeDeviceId]}`);
        }
        await this._persistStartupState();
        this._log(`[Local Font Loader] Device metadata refreshed: ${activeDeviceId}`);
      } else {
        this._log(`[Local Font Loader] Device recognized: ${activeDeviceId}`);
      }
      await this._ensureDevicePreset();
      this._log("[Local Font Loader] Device preset ensured");
    } catch (error) {
      this._logError("[Local Font Loader] Failed during initialization:", error);
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
        new import_obsidian10.Notice("✓ Fonts reloaded");
      }
    });
    this.addCommand({
      id: "rescan-fonts",
      name: "Rescan Fonts",
      callback: async () => {
        await this.scanFonts();
        new import_obsidian10.Notice("✓ Font list updated");
      }
    });
    this.addCommand({
      id: "show-font-status",
      name: "Show font status",
      callback: () => {
        try {
          new FontStatusModal(this.app, this._collectFontStatusRows()).open();
        } catch (error) {
          this._logError("[Local Font Loader] Could not show the font status:", error);
          new import_obsidian10.Notice("Could not show the font status");
        }
      }
    });
    this.addSettingTab(new FontManagerSettingTab(this.app, this));
    this.registerEvent(this.app.workspace.on("css-change", () => this._ensureSnippetEnabled()));
    if (import_obsidian10.Platform.isDesktopApp) {
      for (const event of ["pagehide", "unload"]) {
        this.registerDomEvent(window, event, () => this._parkSnippetForNextStart());
      }
    }
    this.registerEvent(this.app.workspace.on("layout-change", () => {
      this._retryMathMetricAdoption();
    }));
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
            try {
              await this.repairDeviceList();
            } catch (error) {
              this._logError("[Local Font Loader] Device-list repair failed:", error);
            }
            if (this.settings.autoLoadOnStartup) {
              this._log("[Local Font Loader] Re-applying fonts after settings reload...");
              try {
                await this.applyFonts();
                this._log("[Local Font Loader] Fonts re-applied successfully");
              } catch (error) {
                this._logError("[Local Font Loader] Failed to re-apply fonts:", error);
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
      this._logError("[Local Font Loader] Font existence check failed:", error);
    }
    if (this.settings.autoLoadOnStartup) {
      this._log("[Local Font Loader] Auto-loading fonts...");
      try {
        await this.applyFonts();
        this._log("[Local Font Loader] Fonts applied successfully");
      } catch (error) {
        this._logError("[Local Font Loader] Failed to apply fonts:", error);
        new import_obsidian10.Notice("⚠️ Local Font Loader: 字体加载失败，请检查控制台日志", 5000);
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
  _buildLegacyDefaultPreset(data) {
    return {
      id: "default-preset",
      name: "Default",
      targetDevices: [],
      fonts: data.fonts || {},
      latinFontEnabled: data.latinFontEnabled || false,
      latinFontScope: data.latinFontScope || {},
      headingApplyToFileTitle: data.headingApplyToFileTitle || false
    };
  }
  async loadSettings() {
    const data = await this.loadData();
    this._settingsFilePresent = Boolean(data && Object.keys(data).length > 0);
    if (data && (!data.presets || data.presets.length === 0)) {
      this._log("[Local Font Loader] Legacy configuration detected, migrating into a default preset");
      data.presets = [this._buildLegacyDefaultPreset(data)];
      this._log("[Local Font Loader] Legacy configuration migrated");
    } else if (data && !data.presets.some((p) => p.id === "default-preset")) {
      this._log("[Local Font Loader] Default preset missing, adding it back");
      data.presets.unshift(this._buildLegacyDefaultPreset(data));
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
    if (data && !data.deviceAliases) {
      data.deviceAliases = {};
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
  async _persistStartupState() {
    if (!this._settingsFilePresent) {
      this._log("[Local Font Loader] No settings file loaded yet; not writing startup state");
      return;
    }
    await this.saveSettings();
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
      new import_obsidian10.Notice(t("cannotDeleteDefaultPreset"), 3000);
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
  async repairDeviceList() {
    const plan = planDeviceRepair({
      nameMap: this.settings.deviceNameMap || {},
      meta: this.settings.deviceMeta || {},
      aliases: this.settings.deviceAliases || {},
      now: Date.now()
    });
    plan.ambiguous.forEach((group) => {
      const names = group.ids.map((id) => this._getDeviceName(id)).join(", ");
      this._log(`[Local Font Loader] Same-model entries left alone (history: ${group.history}): ${names}`);
    });
    if (!plan.changed) {
      return 0;
    }
    const removedIds = new Set;
    plan.merges.forEach((merge) => {
      if (merge.name) {
        this.settings.deviceNameMap[merge.canonicalId] = merge.name;
      }
      if (merge.meta) {
        this.settings.deviceMeta[merge.canonicalId] = { ...merge.meta };
      }
      merge.removedIds.forEach((id) => removedIds.add(id));
    });
    removedIds.forEach((id) => {
      delete this.settings.deviceNameMap[id];
      delete this.settings.deviceMeta[id];
    });
    this.settings.presets.forEach((preset) => {
      preset.targetDevices = remapDeviceIds(preset.targetDevices, plan.aliases);
    });
    Object.keys(this.settings.deviceFingerprints || {}).forEach((fingerprint) => {
      const claimed = this.settings.deviceFingerprints[fingerprint];
      const mapped = resolveDeviceAlias(claimed, plan.aliases);
      if (mapped !== claimed) {
        this.settings.deviceFingerprints[fingerprint] = mapped;
      }
    });
    this.settings.deviceAliases = plan.aliases;
    const adopted = resolveDeviceAlias(this.currentDeviceId, plan.aliases);
    if (adopted !== this.currentDeviceId) {
      this._log(`[Local Font Loader] Device id adopted from repair: ${this.currentDeviceId} -> ${adopted}`);
      this.currentDeviceId = adopted;
      await this._persistLocalDeviceId(adopted);
    }
    await this.saveSettings();
    const merged = plan.merges.length;
    this._log(`[Local Font Loader] Device list repaired: ${merged} duplicate group(s) merged`);
    new import_obsidian10.Notice(t("deviceListRepaired").replace("{0}", String(merged)), 4000);
    return merged;
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
      this._logError("[Local Font Loader] Failed to read device-local id:", error);
    }
    if (import_obsidian10.Platform.isMobile) {
      const derivedId = await this._getPlatformDeviceId();
      if (derivedId) {
        if (storedId && storedId !== derivedId) {
          await this._adoptDerivedDeviceId(storedId, derivedId);
        }
        if (storedId !== derivedId) {
          await this._persistLocalDeviceId(derivedId);
        }
        return derivedId;
      }
      this._logError("[Local Font Loader] No platform device identity available; falling back to the stored id");
    }
    if (storedId && typeof storedId === "string") {
      const adoptedId = resolveDeviceAlias(storedId, this.settings.deviceAliases || {});
      if (adoptedId !== storedId) {
        await this._persistLocalDeviceId(adoptedId);
        this._log(`[Local Font Loader] Device id adopted from a device-list repair: ${storedId} -> ${adoptedId}`);
        return adoptedId;
      }
      if (this._sealLegacyEntries(storedId)) {
        await this.saveSettings();
        this._log(`[Local Font Loader] Legacy ledger sealed for held id: ${storedId}`);
      }
      return storedId;
    }
    const deviceId = await this._claimLegacyDeviceId() || this._generateUUID();
    await this._persistLocalDeviceId(deviceId);
    return deviceId;
  }
  async _persistLocalDeviceId(deviceId) {
    const STORAGE_KEY = "local-font-loader-device-id";
    try {
      this.app.saveLocalStorage(STORAGE_KEY, deviceId);
      const confirmed = this.app.loadLocalStorage(STORAGE_KEY);
      if (confirmed !== deviceId) {
        this._logError(`[Local Font Loader] Device id did not persist (wrote ${deviceId}, read back ${confirmed}); this device may register again on the next launch.`);
      } else {
        this._log(`[Local Font Loader] Device id persisted: ${deviceId}`);
      }
    } catch (error) {
      this._logError("[Local Font Loader] Failed to persist device-local id:", error);
    }
  }
  async _getPlatformDeviceId() {
    try {
      const deviceBridge = window.Capacitor?.Plugins?.Device;
      if (!deviceBridge || typeof deviceBridge.getId !== "function") {
        return null;
      }
      const { identifier } = await deviceBridge.getId();
      if (!identifier) {
        return null;
      }
      return await this._hashDeviceIdentifier(`${import_obsidian10.Platform.isAndroidApp ? "android" : "ios"}:${identifier}`);
    } catch (error) {
      this._logError("[Local Font Loader] Failed to read the platform device identifier:", error);
      return null;
    }
  }
  async _hashDeviceIdentifier(value) {
    if (!window.crypto || !window.crypto.subtle) {
      this._logError("[Local Font Loader] crypto.subtle is unavailable; cannot derive a device id");
      return null;
    }
    const digest = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
    const hex = Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  }
  async _adoptDerivedDeviceId(fromId, toId) {
    const nameMap = this.settings.deviceNameMap || {};
    const meta = this.settings.deviceMeta || {};
    if (nameMap[fromId] && !nameMap[toId]) {
      nameMap[toId] = nameMap[fromId];
    }
    if (meta[fromId] && !meta[toId]) {
      meta[toId] = meta[fromId];
    }
    delete nameMap[fromId];
    delete meta[fromId];
    this.settings.deviceNameMap = nameMap;
    this.settings.deviceMeta = meta;
    const aliases = { [fromId]: toId };
    this.settings.presets.forEach((preset) => {
      preset.targetDevices = remapDeviceIds(preset.targetDevices, aliases);
    });
    Object.keys(this.settings.deviceFingerprints || {}).forEach((fingerprint) => {
      if (this.settings.deviceFingerprints[fingerprint] === fromId) {
        this.settings.deviceFingerprints[fingerprint] = toId;
      }
    });
    if (!this.settings.deviceAliases) {
      this.settings.deviceAliases = {};
    }
    this.settings.deviceAliases[fromId] = toId;
    await this.saveSettings();
    this._log(`[Local Font Loader] Device id derived from the platform: ${fromId} -> ${toId}`);
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
    const platform = import_obsidian10.Platform.isMobile ? "mobile" : "desktop";
    const hostname = this._getDesktopHostname();
    if (import_obsidian10.Platform.isIosApp || /iPhone|iPad|iPod/.test(ua)) {
      const isTablet = import_obsidian10.Platform.isTablet || /iPad/.test(ua);
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
    if (!import_obsidian10.Platform.isDesktopApp) {
      return null;
    }
    try {
      const process = window.process;
      return process?.platform ?? null;
    } catch (error) {
      this._logError("[Local Font Loader] Could not read the desktop platform:", error);
      return null;
    }
  }
  _getDesktopHostname() {
    if (!import_obsidian10.Platform.isDesktopApp) {
      return "";
    }
    try {
      const nodeRequire = window.require;
      const os = nodeRequire?.("os");
      if (!os)
        return "";
      return String(os.hostname() || "").trim();
    } catch (error) {
      this._logError("[Local Font Loader] Failed to read hostname:", error);
      return "";
    }
  }
  _isGeneratedDeviceName(name, meta) {
    return isGeneratedDeviceName(name, meta);
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
    const platform = import_obsidian10.Platform.isMobile ? "mobile" : "desktop";
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
        this._log("[Local Font Loader] Default preset missing or not global; recreating it");
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
        await this._persistStartupState();
      }
    }
  }
  async _ensureFolder(path) {
    const segments = String(path || "").split("/").filter(Boolean);
    let current = "";
    for (const segment of segments) {
      current = current ? `${current}/${segment}` : segment;
      try {
        if (!await this.app.vault.adapter.exists(current)) {
          await this.app.vault.adapter.mkdir(current);
        }
      } catch (error) {
        this._logError(`[Local Font Loader] Could not create the folder ${current}:`, error);
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
        await this._ensureFolder(targetDir);
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
      await this._ensureFolder(this.settings.fontSourceDir);
      const dirList = await this.app.vault.adapter.list(this.settings.fontSourceDir);
      const fontDirs = dirList.folders;
      this._log(`[Local Font Loader] Found ${fontDirs.length} font family folders`);
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
          } catch {
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
                if (!await this.app.vault.adapter.exists(fontPath)) {
                  throw new Error("font file missing");
                }
                const basename = filename ?? "";
                const name = basename.replace(/\.(ttf|otf|woff|woff2)$/i, "");
                const ext = (basename.split(".").pop() || "").toLowerCase();
                const fontInfo = {
                  name,
                  path: fontPath,
                  basename,
                  ext,
                  familyName: family.familyName,
                  variantType
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
              } catch {
                this._log(`[Local Font Loader] Font file does not exist: ${fontPath}`);
              }
            }
          } else {
            const files = await this.app.vault.adapter.list(fontDir);
            const fontFiles = files.files.filter((f) => /\.(ttf|otf|woff|woff2)$/i.test(f));
            this._log(`[Local Font Loader] Auto-scanning ${fontFiles.length} font files in ${folderName}...`);
            const scanPromises = fontFiles.map(async (fontPath) => {
              try {
                const basename = fontPath.split("/").pop() || "";
                const name = basename.replace(/\.(ttf|otf|woff|woff2)$/i, "");
                const ext = (basename.split(".").pop() || "").toLowerCase();
                const arrayBuffer = await this.app.vault.adapter.readBinary(fontPath);
                const fontMetadata = parseFontMetadata(arrayBuffer);
                const realFamilyName = fontMetadata?.familyName || family.familyName;
                const variantType = fontMetadata?.variantType || "regular";
                const fontInfo = {
                  name,
                  path: fontPath,
                  basename,
                  ext,
                  familyName: realFamilyName,
                  variantType
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
                const scannedFont = result.fontInfo;
                if (scannedFont && !fontMap.has(scannedFont.name)) {
                  fontMap.set(scannedFont.name, scannedFont);
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
          } catch {
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
  _getMathFontData() {
    try {
      const mathJax = window.MathJax;
      const candidates = [
        mathJax?.startup?.output?.font,
        mathJax?.startup?.document?.outputJax?.font
      ];
      for (const candidate of candidates) {
        const variant = candidate?.variant;
        if (variant && typeof variant === "object") {
          return candidate;
        }
      }
      return null;
    } catch (error) {
      this._logError("[Local Font Loader] Could not reach MathJax's font table:", error);
      return null;
    }
  }
  async _waitForMathFontData(attempts = 24, delayMs = 250) {
    for (let attempt = 0;attempt < attempts; attempt++) {
      const fontData = this._getMathFontData();
      if (fontData) {
        return fontData;
      }
      await new Promise((resolve) => window.setTimeout(resolve, delayMs));
    }
    return null;
  }
  async _waitForMathFont(familyName, attempts = 12, delayMs = 250) {
    for (let attempt = 0;attempt < attempts; attempt++) {
      try {
        await document.fonts.load(`16px "${familyName}"`);
      } catch (error) {
        this._logError(`[Local Font Loader] Could not load math font "${familyName}":`, error);
      }
      if (document.fonts.check(`16px "${familyName}"`)) {
        return true;
      }
      await new Promise((resolve) => window.setTimeout(resolve, delayMs));
    }
    return false;
  }
  async _retryMathMetricAdoption() {
    try {
      const preset = this._getDevicePreset();
      const familyName = preset && preset.fonts ? preset.fonts.math : "";
      if (!familyName || this._mathFontSnapshot) {
        return;
      }
      const now = Date.now();
      if (now - this._mathAdoptionAttemptAt < MATH_ADOPTION_RETRY_MS) {
        return;
      }
      this._mathAdoptionAttemptAt = now;
      const adopted = await this._adoptMathFontMetrics(familyName);
      if (adopted) {
        await this._afterMetricAdoption();
        this._log("[Local Font Loader] Math font metrics adopted on a later attempt");
      }
    } catch (error) {
      this._logError("[Local Font Loader] Could not adopt the math font metrics:", error);
    }
  }
  async _afterMetricAdoption() {
    this.applyCss(this._buildMathGlyphRules(), FONT_GLYPHS_ID);
    await this._rebuildMathJaxStyles();
    this._refreshMathViews();
  }
  _collectFontStatusRows() {
    const preset = this._getDevicePreset();
    const fonts = preset && preset.fonts || {};
    const categories = [
      { key: "ui", label: "Interface" },
      { key: "text", label: "Text" },
      { key: "heading", label: "Heading" },
      { key: "monospace", label: "Monospace" },
      { key: "math", label: "Math" }
    ];
    return categories.map(({ key, label }) => {
      const family = (fonts[key] || "").trim();
      const variants = (this.settings.availableFonts || []).filter((f) => f.familyName && f.familyName === family || f.name === family);
      const row = {
        category: label,
        family,
        adaptation: [],
        source: "",
        files: variants.map((v) => v.variantType).join(", "),
        gaps: []
      };
      if (!family) {
        return row;
      }
      if (key === "math") {
        if (this._mathAdaptationLayer) {
          row.adaptation.push(this._mathAdaptationLayer);
          row.source = this._mathAdaptationSource;
        } else {
          row.adaptation.push("Not worked out yet — formulas use the MathJax defaults for now");
          row.source = "The MathJax defaults";
        }
        row.adaptation.push("Braces and arrows keep the MathJax sizes — those pieces come from MathJax itself");
        for (const gap of this._mathCoverageGaps) {
          row.gaps.push(gap);
        }
      } else {
        row.adaptation.push("Used as-is through CSS");
        row.source = "Not applicable — text is laid out by the text engine";
      }
      return row;
    });
  }
  async _resolveMathMetricsFromStandards(familyName) {
    try {
      const adapter = findMathFontAdapter(familyName);
      if (!adapter) {
        return { kind: "unclaimed" };
      }
      const record = (this.settings.availableFonts || []).find((f) => f.familyName && f.familyName === familyName || f.name === familyName);
      if (!record || !record.path) {
        return { kind: "declined", adapterName: adapter.name };
      }
      if (!await this.app.vault.adapter.exists(record.path)) {
        return { kind: "declined", adapterName: adapter.name };
      }
      const binary = await this.app.vault.adapter.readBinary(record.path);
      const result = buildMathMetrics(binary, familyName);
      if (!result) {
        return { kind: "declined", adapterName: adapter.name };
      }
      this._log(`[Local Font Loader] Math metrics from "${result.adapterName}" (${result.metrics.source})`);
      return { kind: "metrics", metrics: result.metrics, adapterName: result.adapterName };
    } catch (error) {
      this._logError("[Local Font Loader] Could not read the math font's own metrics:", error);
      return { kind: "unclaimed" };
    }
  }
  _applyMathMetrics(fontData, metrics, adapterName) {
    try {
      this._restoreMathFontMetrics();
      const snapshot = { chars: [], delimiters: [] };
      let adopted = 0;
      for (const variantName of Object.keys(fontData.variant ?? {})) {
        const chars = fontData.variant[variantName]?.chars;
        if (!chars) {
          continue;
        }
        for (const code of Object.keys(metrics.chars)) {
          const wanted = metrics.chars[code];
          const entry = chars[code];
          if (!Array.isArray(entry) || entry.length < 3) {
            continue;
          }
          const before = [Number(entry[0]), Number(entry[1]), Number(entry[2])];
          if (before[0] === wanted[0] && before[1] === wanted[1] && before[2] === wanted[2]) {
            continue;
          }
          snapshot.chars.push({ variantName, code, values: before });
          entry[0] = wanted[0];
          entry[1] = wanted[1];
          entry[2] = wanted[2];
          adopted++;
        }
      }
      if (adopted === 0) {
        this._log("[Local Font Loader] The family adapter found nothing to change; leaving MathJax metrics as they are.");
        return false;
      }
      this._mathFontSnapshot = snapshot;
      this._mathAdaptationLayer = `${adapterName} — ${adopted} glyph sizes read from the font`;
      this._mathAdaptationSource = metrics.source === "opentype-math" ? "Its own OpenType MATH table" : metrics.source === "tex-tfm" ? "The TeX design constants this font follows" : metrics.source === "measured" ? "Worked out from rendered text — a guess, not the font’s own numbers" : "Read from the font file";
      this._mathCoverageGaps = metrics.gaps ?? [];
      for (const note of metrics.notes ?? []) {
        this._log(`[Local Font Loader] ${adapterName}: ${note}`);
      }
      this._log(`[Local Font Loader] Adopted ${adopted} glyph boxes from ${adapterName}; delimiter sizes left to MathJax.`);
      return true;
    } catch (error) {
      this._logError("[Local Font Loader] Could not apply the font's own metrics:", error);
      return false;
    }
  }
  async _adoptMathFontMetrics(familyName) {
    const mathJax = window.MathJax;
    if (!familyName || !mathJax || !document.fonts) {
      return false;
    }
    const fontData = await this._waitForMathFontData();
    if (!fontData) {
      this._log("[Local Font Loader] MathJax's font table never became available; metrics not adopted");
      return false;
    }
    const fromStandard = await this._resolveMathMetricsFromStandards(familyName);
    if (fromStandard.kind === "metrics") {
      return this._applyMathMetrics(fontData, fromStandard.metrics, fromStandard.adapterName);
    }
    if (fromStandard.kind === "declined") {
      this._mathAdaptationLayer = `${fromStandard.adapterName} declined — MathJax's own numbers kept`;
      this._mathAdaptationSource = "The MathJax defaults";
      this._log(`[Local Font Loader] ${fromStandard.adapterName} declined this family; nothing measured.`);
      return false;
    }
    if (!await this._waitForMathFont(familyName)) {
      this._log(`[Local Font Loader] Math font "${familyName}" did not become available; metrics not adopted`);
      return false;
    }
    const canvas = createEl("canvas");
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
      } catch {
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
        snapshot.chars.push({ variantName, code, values: [Number(entry[0]), Number(entry[1]), Number(entry[2])] });
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
    this._mathAdaptationLayer = `Worked out by rendering the text — ${adopted} glyph sizes measured`;
    this._mathAdaptationSource = "Worked out from rendered text — a guess, not the font’s own numbers";
    this._mathCoverageGaps = [];
    this._log(`[Local Font Loader] Math font metrics adopted from "${familyName}": ${adopted} glyphs, ${snapshot.delimiters.length} delimiters`);
    return true;
  }
  _restoreMathFontMetrics() {
    const snapshot = this._mathFontSnapshot;
    if (!snapshot) {
      return;
    }
    const fontData = this._getMathFontData();
    if (!fontData) {
      this._mathFontSnapshot = null;
      return;
    }
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
  _buildMathGlyphRules() {
    try {
      const fontData = this._getMathFontData();
      if (!fontData || !fontData.variant) {
        return "";
      }
      const guards = {
        normal: "",
        bold: ".TEX-B",
        italic: ".TEX-I",
        "bold-italic": ".TEX-BI"
      };
      const original = new Map;
      for (const saved of this._mathFontSnapshot?.chars ?? []) {
        original.set(`${saved.variantName}@${saved.code}`, saved.values.map((v) => Number(v).toFixed(4)).join(","));
      }
      let css = `/* Per-glyph boxes that differ from MathJax's own, so display does not depend on its stylesheet */
`;
      let count = 0;
      for (const variantName of Object.keys(guards)) {
        const variant = fontData.variant[variantName];
        const chars = variant && variant.chars;
        if (!chars) {
          continue;
        }
        const guard = guards[variantName];
        for (const code of Object.keys(chars)) {
          const entry = chars[code];
          if (!Array.isArray(entry) || entry.length < 3) {
            continue;
          }
          const height = Number(entry[0]);
          const depth = Number(entry[1]);
          const width = Number(entry[2]);
          if (!Number.isFinite(height) || !Number.isFinite(depth) || !Number.isFinite(width)) {
            continue;
          }
          const key = `${variantName}@${code}`;
          const now = [height, depth, width].map((v) => v.toFixed(4)).join(",");
          if (original.get(key) === now) {
            continue;
          }
          const glyphClass = "mjx-c" + Number(code).toString(16).toUpperCase();
          css += `body mjx-c.${glyphClass}${guard} {
`;
          css += `  padding-top: ${Math.max(0, height).toFixed(4)}em !important;
`;
          css += `  padding-right: ${Math.max(0, width).toFixed(4)}em !important;
`;
          css += `  padding-bottom: ${Math.max(0, depth).toFixed(4)}em !important;
`;
          css += `  padding-left: 0 !important;
`;
          css += `}
`;
          count++;
        }
      }
      return count ? css + `
` : "";
    } catch (error) {
      this._logError("[Local Font Loader] Could not generate the per-glyph rules:", error);
      return "";
    }
  }
  async _rebuildMathJaxStyles() {
    return !!document.getElementById("MJX-CHTML-styles");
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
      this._logError("[Local Font Loader] Failed to refresh math views:", error);
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
    } catch {
      return { status: "unavailable", deviations: [] };
    }
    const canvas = createEl("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return { status: "unavailable", deviations: [] };
    }
    const SIZE = 200;
    const advanceOf = (char) => {
      try {
        ctx.font = `${SIZE}px "${familyName}"`;
        return ctx.measureText(char).width / SIZE;
      } catch {
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
      } catch {
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
        this._log("[LocalFontLoader] No preset found for current device, using default preset");
        return;
      }
      const fontsConfig = devicePreset.fonts || {};
      const latinFontEnabled = devicePreset.latinFontEnabled || false;
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
        new import_obsidian10.Notice(t("fontMissingWarning"), 5000);
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
          const deviceFontContext = this._getDeviceFontContext();
          const results = await Promise.all(familyFonts.map(async (font) => {
            const fontResourceSrc = this._getFontResourceSrc(font);
            if (!fontResourceSrc) {
              return { success: false, font, error: new Error("no resource URL") };
            }
            const built = this._buildFontFaceCss(font, deviceFontContext, fontResourceSrc);
            this._log(`[Local Font Loader] ✓ Resolved variant: ${font.name} (${font.subfamilyName || "Unknown"})`);
            return { success: true, css: built.css, font };
          }));
          for (const result of results) {
            if (result.success) {
              fontFaceCss += result.css + `
`;
              loadedCount++;
            } else {
              failedFonts.push(`${result.font.name} (读取失败: ${result.error?.message ?? "unknown"})`);
            }
          }
        } catch (error) {
          this._logError(`[Local Font Loader] ✗ 无法加载字体家族 ${familyOrFontName}:`, error);
          failedFonts.push(`${familyOrFontName} (读取失败: ${error.message})`);
        }
      }
      this._log(`[Local Font Loader] @font-face CSS total size: ${(fontFaceCss.length / 1024 / 1024).toFixed(2)} MB`);
      this.applyCss(fontFaceCss, FONT_FACES_ID);
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
        if (separatesLatin && fontsConfig.latin) {
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
        varsCss += `body mjx-c.TEX-I${sizeVariantGuard},
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
        varsCss += `body mjx-mn mjx-c${sizeVariantGuard},
`;
        varsCss += `body mjx-mn mjx-c${sizeVariantGuard}::before,
`;
        varsCss += `body mjx-mo mjx-c${sizeVariantGuard},
`;
        varsCss += `body mjx-mo mjx-c${sizeVariantGuard}::before,
`;
        varsCss += `body mjx-c:not(.TEX-I)${sizeVariantGuard},
`;
        varsCss += `body mjx-c:not(.TEX-I)${sizeVariantGuard}::before {
`;
        varsCss += `  font-family: '${this._escapeCssString(fontsConfig.math)}', MJXZERO, MJXTEX, serif !important;
`;
        varsCss += `}

`;
        varsCss += `/* Glyphs are clipped to their box by MathJax; that net is for its own fonts */
`;
        varsCss += `body mjx-c { clip-path: none !important; }

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
          varsCss += `body ${scope}:not(.TEX-I)${sizeVariantGuard},
`;
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
            return this._afterMetricAdoption();
          }).catch((error) => {
            this._logError("[Local Font Loader] Failed to adopt math font metrics:", error);
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
  _getFontResourceSrc(font) {
    try {
      const resourcePath = this.app.vault.adapter.getResourcePath(import_obsidian10.normalizePath(font.path));
      if (!resourcePath) {
        return null;
      }
      const escaped = String(resourcePath).replace(/\\/g, "\\\\").replace(/"/g, "%22");
      return `url("${escaped}")`;
    } catch (error) {
      this._logError("[Local Font Loader] getResourcePath failed; this font cannot be applied", error);
      return null;
    }
  }
  _buildFontFaceCss(font, ctx, srcValue) {
    const { fontsConfig, latinFontEnabled, latinFontScope } = ctx;
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
    css += `  src: ${srcValue};
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
    this._snippetCss.set(cssId, css);
    this._queueSnippetSync();
    this._appliedCss.set(cssId, css);
  }
  _removeGeneratedStyles(cssId) {
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
  _ensureSnippetEnabled() {
    const customCss = this.app.customCss;
    if (!customCss || this._snippetCss.size === 0) {
      return;
    }
    const isSnippetEnabled = customCss.enabledSnippets ? customCss.enabledSnippets.has(FONT_CSS_SNIPPET) : this._snippetEnabled;
    if (isSnippetEnabled) {
      return;
    }
    this._snippetEnabled = true;
    customCss.setCssEnabledStatus(FONT_CSS_SNIPPET, true);
    this._log(`[Local Font Loader] The "${FONT_CSS_SNIPPET}" snippet was switched off elsewhere; switching it back on.`);
  }
  async _syncSnippet() {
    const customCss = this.app.customCss;
    if (!customCss) {
      this._logError("[Local Font Loader] No CSS snippets on this platform: the fonts cannot be applied.");
      return;
    }
    const css = this._renderSnippetCss(false);
    const isSnippetEnabled = customCss.enabledSnippets ? customCss.enabledSnippets.has(FONT_CSS_SNIPPET) : this._snippetEnabled;
    if (!css) {
      if (!isSnippetEnabled) {
        return;
      }
      this._snippetEnabled = false;
      customCss.setCssEnabledStatus(FONT_CSS_SNIPPET, false);
      this._log(`[Local Font Loader] No generated CSS left; the "${FONT_CSS_SNIPPET}" snippet is switched off.`);
      return;
    }
    const snippetPath = customCss.getSnippetPath(FONT_CSS_SNIPPET);
    const onDisk = await this._readSnippet(snippetPath);
    if (onDisk === css) {
      if (!isSnippetEnabled) {
        this._snippetEnabled = true;
        customCss.setCssEnabledStatus(FONT_CSS_SNIPPET, true);
        this._log(`[Local Font Loader] The "${FONT_CSS_SNIPPET}" snippet was switched off; switching it back on.`);
      }
      return;
    }
    await this._ensureFolder(snippetPath.split("/").slice(0, -1).join("/"));
    await this.app.vault.adapter.write(snippetPath, css);
    this._forceSnippetReload(snippetPath);
    if (!isSnippetEnabled) {
      this._snippetEnabled = true;
      customCss.setCssEnabledStatus(FONT_CSS_SNIPPET, true);
      this._log(`[Local Font Loader] Enabling the "${FONT_CSS_SNIPPET}" snippet (nothing else can reach the PDF export).`);
    }
    this._log(`[Local Font Loader] Applied ${(css.length / 1024 / 1024).toFixed(2)} MB of CSS through the "${FONT_CSS_SNIPPET}" snippet.`);
  }
  async _readSnippet(snippetPath) {
    try {
      const adapter = this.app.vault.adapter;
      if (!await adapter.exists(snippetPath)) {
        return null;
      }
      return await adapter.read(snippetPath);
    } catch (error) {
      this._logError("[Local Font Loader] Could not read the snippet back before writing it:", error);
      return null;
    }
  }
  _forceSnippetReload(snippetPath) {
    try {
      const customCss = this.app.customCss;
      customCss?.csscache?.delete(snippetPath);
      customCss?.requestLoadSnippets?.();
    } catch (error) {
      this._logError("[Local Font Loader] Could not ask Obsidian to re-read the snippet:", error);
    }
  }
  _renderSnippetCss(parked) {
    return Array.from(this._snippetCss.entries()).map(([cssId, css]) => parked && cssId === FONT_FACES_ID ? `@media print {
${css}}
` : css).join(`
`);
  }
  _parkSnippetForNextStart() {
    try {
      const customCss = this.app.customCss;
      if (!customCss || this._snippetCss.size === 0) {
        return;
      }
      const css = this._renderSnippetCss(true);
      const snippetPath = customCss.getSnippetPath(FONT_CSS_SNIPPET);
      const adapter = this.app.vault.adapter;
      if (adapter.fs?.writeFileSync && adapter.getFullPath) {
        adapter.fs.writeFileSync(adapter.getFullPath(snippetPath), css);
        this._log(`[Local Font Loader] Snippet parked for the next start (${(css.length / 1024).toFixed(1)} KB).`);
      } else {
        adapter.write(snippetPath, css);
      }
      this._appliedCss.delete(FONT_FACES_ID);
      window.setTimeout(() => {
        this.applyFonts();
      }, SNIPPET_PARK_RECOVERY_MS);
    } catch (error) {
      this._logError("[Local Font Loader] Could not park the snippet for the next start:", error);
    }
  }
  removeFontStyles() {
    this._removeGeneratedStyles(FONT_FACES_ID);
    this._removeGeneratedStyles(FONT_GLYPHS_ID);
    this._removeGeneratedStyles("local-font-loader-vars");
    this._restoreMathFontMetrics();
  }
}

// src/main.ts
module.exports = LocalFontLoaderPlugin;
