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
 * @version 1.0.0
 * @license MIT
 */

const { Plugin, PluginSettingTab, Setting, Modal, Notice, setIcon, MarkdownRenderer } = require('obsidian');

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
        latinFontInfoDesc: 'After enabling, you can assign a separate Latin font for Body Text. Latin characters (A-Z, a-z, numbers, punctuation) will use the Latin font, while non-Latin characters (CJK, etc.) will continue using the Body Text Font.',
        latinFontInfoDescForLatinUsers: 'This feature is designed for users who mix Latin and non-Latin scripts (e.g., English + Chinese/Japanese/Korean). If you primarily write in Latin-script languages, you likely don\'t need this feature.',
        latinFontEnabled: 'Enable Latin Font Separation',
        latinFontEnabledDesc: 'Use separate fonts for Latin and non-Latin characters',
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

        // Font Actions
        scanFonts: 'Scan Fonts',
        convertToBase64: 'Convert to Base64',
        deleteFont: 'Delete Font',
        convertAll: 'Convert All',

        // Fallback Operations
        deleteUnusedFonts: 'Delete Unused Fonts',
        deleteUnusedFontsDesc: 'Delete unused font files (configured fonts will not be deleted)',
        clearCache: 'Clear Cache',
        clearCacheDesc: 'Clear all converted font cache files',
        applyNow: 'Apply Now',
        applyNowDesc: 'Apply current font configuration',
        applyFonts: 'Apply fonts',

        // Font Variant Warnings
        variantWarningTitle: 'Font Variant Warning',
        variantWarningBody: 'The selected Body Text font "{fontFamily}" only has {variantCount} variant(s) ({variantList}).\n\nFor proper italic and bold rendering in Latin-script content, it\'s recommended to use a font family with Regular, Italic, Bold, and Bold Italic variants. Missing variants may cause faux italic/bold rendering issues.',
        variantWarningContinue: 'Continue anyway',
        variantWarningCancel: 'Cancel',
        nonLatinFontNote: 'Non-Latin fonts (Chinese, Japanese, Korean, etc.) can ignore this warning',

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

        // Font Info
        variantsCount: '{count} variants',
        familyName: 'Family',
        style: 'Style',
        path: 'Path'
    },

    zh: {
        // 插件信息
        pluginName: '本地字体加载器',
        pluginDesc: '从本地 Vault 加载自定义字体',

        // 设置标题
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

        // 通用设置
        autoLoad: '启动时自动加载',
        autoLoadDesc: '当 Obsidian 启动时自动应用字体',

        // 字体类型
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

        // 拉丁字体分离
        latinFontInfo: '拉丁字体分离',
        latinFontInfoDesc: '启用后，可为正文字体单独指定拉丁字体。拉丁字符（A-Z、a-z、数字、标点）将使用拉丁字体，而非拉丁字符（CJK等）仍使用正文字体。',
        latinFontInfoDescForLatinUsers: '此功能专为混合使用拉丁文字和非拉丁文字的用户设计（例如：英文 + 中文/日文/韩文）。如果您主要使用拉丁文字书写，可能不需要此功能。',
        latinFontEnabled: '启用拉丁字体分离',
        latinFontEnabledDesc: '为拉丁字符和非拉丁字符使用不同字体',
        latinFont: '拉丁字体',
        latinFontDesc: '用于拉丁字符的字体（A-Z、a-z、0-9、标点）',
        recommendedLatinFonts: '推荐的拉丁字体',
        latinFontScope: '拉丁字体作用范围',
        latinFontScopeDesc: '精细调整哪些字符范围使用拉丁字体',
        scopeBasic: '仅基本拉丁字符（A-Z、a-z、0-9）',
        scopeExtended: '基本 + 扩展拉丁字符（包含重音字符）',
        scopeFull: '完整拉丁字符 + 符号（包含标点和特殊符号）',

        // 字体图例
        legendConverted: '已转换',
        legendNotConverted: '未转换',

        // 字体操作
        scanFonts: '扫描字体',
        convertToBase64: '转换为 Base64',
        deleteFont: '删除字体',
        convertAll: '全部转换',

        // 备用操作
        deleteUnusedFonts: '删除未使用的字体',
        deleteUnusedFontsDesc: '删除未使用的字体文件（已配置的字体不会被删除）',
        clearCache: '清除缓存',
        clearCacheDesc: '清除所有转换的字体缓存文件',
        applyNow: '立即应用',
        applyNowDesc: '应用当前字体配置',
        applyFonts: '应用字体',

        // 字体缺失警告
        fontMissingWarning: '当前字体文件缺失，已回退至系统设置',

        // 字体变体警告
        variantWarningTitle: '字体变体警告',
        variantWarningBody: '所选正文字体 "{fontFamily}" 仅有 {variantCount} 个变体（{variantList}）。\n\n为确保拉丁文字内容的斜体和粗体正常显示，建议使用包含 Regular、Italic、Bold 和 Bold Italic 四种变体的字体家族。缺少变体可能导致伪斜体/伪粗体渲染问题。',
        variantWarningContinue: '仍然继续',
        variantWarningCancel: '取消',
        nonLatinFontNote: '非拉丁语言字体（中文、日文、韩文等）请忽略此警告',

        // 性能警告
        performanceWarningTitle: '性能注意事项',
        performanceWarningContent: '避免在单行内混合过多语言文字。密集的多语言混排（例如在同一行内混合中文+日文+韩文+阿拉伯文+俄文）可能触发字体回退机制，导致渲染引擎卡死。\n\n建议：将不同语言的内容分段显示，以获得最佳性能。',

        // 设置页面 Callout
        incompleteVariantTitle: '字体变体不完整',
        incompleteVariantBody: '所选字体 "{fontFamily}" 仅有 {variantCount} 个变体（{variantList}）。\n建议：选择包含 Regular、Italic、Bold 和 Bold Italic 四种变体的字体家族，以确保斜体和粗体正常显示。\n非拉丁语言字体通常不需要完整的 Italic/Bold 变体，可以忽略此警告。',
        monospaceRequirement: '等宽字体要求',
        monospaceRequirementBody: '代码字体必须选择等宽字体（Monospace），普通拉丁字体会导致代码对齐错乱。',
        mathFontRequirement: '数学字体要求',
        mathFontRequirementBody: 'LaTeX 数学字体必须选择专用数学字体（如 Latin Modern Math、XITS Math），普通字体无法正确渲染数学符号。',
        missingVariantTitle: '缺少字体变体',
        missingVariantBody: '{latinFont} 缺少以下变体：{missingList}。缺失的样式将使用浏览器合成（效果较差）。',

        // 界面文本
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
        importFailedError: '⚠️ 导入失败: {error}',
        punctuationDesc: '.,!?;: 等常用标点',
        symbolsDesc: '@#$%&* 等特殊字符',

        // 通知
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

        // 模态框
        confirmDelete: '确认删除',
        confirmDeleteMsg: '确定要删除此字体吗？',
        confirmDeleteUnused: '确定要删除所有未使用的字体吗？',
        delete: '删除',
        cancel: '取消',

        // 字体信息
        variantsCount: '{count} 个变体',
        familyName: '家族',
        style: '样式',
        path: '路径'
    },

    ja: {
        // プラグイン情報
        pluginName: 'ローカルフォントローダー',
        pluginDesc: 'ローカル Vault からカスタムフォントを読み込む',

        // 設定ヘッダー
        headerDirectoryConfig: 'ディレクトリ設定',
        headerGeneralSettings: '一般設定',
        headerFontApplication: 'フォント適用設定',
        headerFontFileConfig: 'フォントファイル設定',
        headerFallback: 'フォールバック操作',

        // ディレクトリ設定
        fontSourceDir: 'フォントソースディレクトリ',
        fontSourceDirDesc: 'フォントファミリーフォルダを含むディレクトリ',
        cacheDir: 'Base64 キャッシュディレクトリ',
        cacheDirDesc: '変換された CSS ファイルの保存場所',

        // 一般設定
        autoLoad: '起動時に自動読み込み',
        autoLoadDesc: 'Obsidian 起動時にフォントを自動適用',

        // フォントタイプ
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

        // ラテン文字フォント分離
        latinFontInfo: 'ラテン文字フォント分離',
        latinFontInfoDesc: '有効にすると、本文フォントに対して別のラテン文字フォントを指定できます。ラテン文字（A-Z、a-z、数字、句読点）はラテン文字フォントを使用し、非ラテン文字（CJK など）は本文フォントを使用し続けます。',
        latinFontInfoDescForLatinUsers: 'この機能はラテン文字と非ラテン文字を混在させるユーザー向けです（例：英語 + 中国語/日本語/韓国語）。主にラテン文字言語で執筆する場合、この機能は必要ないかもしれません。',
        latinFontEnabled: 'ラテン文字フォント分離を有効化',
        latinFontEnabledDesc: 'ラテン文字と非ラテン文字に異なるフォントを使用',
        latinFont: 'ラテン文字フォント',
        latinFontDesc: 'ラテン文字に使用されるフォント（A-Z、a-z、0-9、句読点）',
        recommendedLatinFonts: '推奨ラテン文字フォント',
        latinFontScope: 'ラテン文字フォントスコープ',
        latinFontScopeDesc: 'どの文字範囲にラテン文字フォントを使用するかを微調整',
        scopeBasic: '基本ラテン文字のみ（A-Z、a-z、0-9）',
        scopeExtended: '基本 + 拡張ラテン文字（アクセント付き文字を含む）',
        scopeFull: '完全ラテン文字 + 記号（句読点と特殊記号を含む）',

        // フォント凡例
        legendConverted: '変換済み',
        legendNotConverted: '未変換',

        // フォント操作
        scanFonts: 'フォントをスキャン',
        convertToBase64: 'Base64 に変換',
        deleteFont: 'フォントを削除',
        convertAll: 'すべて変換',

        // フォールバック操作
        deleteUnusedFonts: '未使用フォントを削除',
        deleteUnusedFontsDesc: '未使用のフォントファイルを削除（設定済みフォントは削除されません）',
        clearCache: 'キャッシュをクリア',
        clearCacheDesc: '変換されたすべてのフォントキャッシュファイルをクリア',
        applyNow: '今すぐ適用',
        applyNowDesc: '現在のフォント設定を適用',
        applyFonts: 'フォントを適用',

        // フォント欠落警告
        fontMissingWarning: 'フォントファイルが見つかりません。システムデフォルトにフォールバックしました',

        // フォントバリアント警告
        variantWarningTitle: 'フォントバリアント警告',
        variantWarningBody: '選択した本文フォント "{fontFamily}" には {variantCount} 個のバリアント（{variantList}）しかありません。\n\nラテン文字コンテンツの斜体と太字を適切にレンダリングするには、Regular、Italic、Bold、Bold Italic のバリアントを含むフォントファミリーを使用することをお勧めします。バリアントが不足していると、疑似斜体/疑似太字のレンダリング問題が発生する可能性があります。',
        variantWarningContinue: 'このまま続ける',
        variantWarningCancel: 'キャンセル',

        // 通知
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

        // モーダル
        confirmDelete: '削除の確認',
        confirmDeleteMsg: 'このフォントを削除してもよろしいですか？',
        confirmDeleteUnused: 'すべての未使用フォントを削除してもよろしいですか？',
        delete: '削除',
        cancel: 'キャンセル',

        // フォント情報
        variantsCount: '{count} バリアント',
        familyName: 'ファミリー',
        style: 'スタイル',
        path: 'パス'
    },

    ko: {
        // 플러그인 정보
        pluginName: '로컬 폰트 로더',
        pluginDesc: '로컬 보관함에서 커스텀 폰트 로드',

        // 설정 헤더
        headerDirectoryConfig: '디렉토리 설정',
        headerGeneralSettings: '일반 설정',
        headerFontApplication: '폰트 적용 설정',
        headerFontFileConfig: '폰트 파일 설정',
        headerFallback: '대체 작업',

        // 디렉토리 설정
        fontSourceDir: '폰트 소스 디렉토리',
        fontSourceDirDesc: '폰트 패밀리 폴더가 포함된 디렉토리',
        cacheDir: 'Base64 캐시 디렉토리',
        cacheDirDesc: '변환된 CSS 파일 저장 위치',

        // 일반 설정
        autoLoad: '시작 시 자동 로드',
        autoLoadDesc: 'Obsidian 시작 시 폰트 자동 적용',

        // 폰트 타입
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

        // 라틴 폰트 분리
        latinFontInfo: '라틴 폰트 분리',
        latinFontInfoDesc: '활성화하면 본문 폰트에 대해 별도의 라틴 폰트를 지정할 수 있습니다. 라틴 문자（A-Z, a-z, 숫자, 구두점）는 라틴 폰트를 사용하고 비라틴 문자（CJK 등）는 본문 폰트를 계속 사용합니다.',
        latinFontInfoDescForLatinUsers: '이 기능은 라틴 문자와 비라틴 문자를 혼용하는 사용자를 위한 것입니다（예: 영어 + 중국어/일본어/한국어）. 주로 라틴 문자 언어로 작성하는 경우 이 기능이 필요하지 않을 수 있습니다.',
        latinFontEnabled: '라틴 폰트 분리 활성화',
        latinFontEnabledDesc: '라틴 문자와 비라틴 문자에 다른 폰트 사용',
        latinFont: '라틴 폰트',
        latinFontDesc: '라틴 문자에 사용되는 폰트（A-Z, a-z, 0-9, 구두점）',
        recommendedLatinFonts: '권장 라틴 폰트',
        latinFontScope: '라틴 폰트 범위',
        latinFontScopeDesc: '라틴 폰트를 사용할 문자 범위 세밀 조정',
        scopeBasic: '기본 라틴 문자만（A-Z, a-z, 0-9）',
        scopeExtended: '기본 + 확장 라틴 문자（악센트 문자 포함）',
        scopeFull: '전체 라틴 문자 + 기호（구두점 및 특수 기호 포함）',

        // 폰트 범례
        legendConverted: '변환됨',
        legendNotConverted: '변환되지 않음',

        // 폰트 작업
        scanFonts: '폰트 스캔',
        convertToBase64: 'Base64로 변환',
        deleteFont: '폰트 삭제',
        convertAll: '모두 변환',

        // 대체 작업
        deleteUnusedFonts: '사용하지 않는 폰트 삭제',
        deleteUnusedFontsDesc: '사용하지 않는 폰트 파일 삭제（설정된 폰트는 삭제되지 않음）',
        clearCache: '캐시 지우기',
        clearCacheDesc: '변환된 모든 폰트 캐시 파일 지우기',
        applyNow: '지금 적용',
        applyNowDesc: '현재 폰트 설정 적용',
        applyFonts: '폰트 적용',

        // 폰트 누락 경고
        fontMissingWarning: '폰트 파일이 없습니다. 시스템 기본값으로 대체되었습니다',

        // 폰트 변형 경고
        variantWarningTitle: '폰트 변형 경고',
        variantWarningBody: '선택한 본문 폰트 "{fontFamily}"에는 {variantCount}개의 변형（{variantList}）만 있습니다.\n\n라틴 문자 콘텐츠의 기울임꼴과 굵은 글씨를 올바르게 렌더링하려면 Regular, Italic, Bold, Bold Italic 변형이 포함된 폰트 패밀리를 사용하는 것이 좋습니다. 변형이 누락되면 가짜 기울임꼴/가짜 굵은 글씨 렌더링 문제가 발생할 수 있습니다.',
        variantWarningContinue: '계속 진행',
        variantWarningCancel: '취소',

        // 알림
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

        // 모달
        confirmDelete: '삭제 확인',
        confirmDeleteMsg: '이 폰트를 삭제하시겠습니까？',
        confirmDeleteUnused: '사용하지 않는 모든 폰트를 삭제하시겠습니까？',
        delete: '삭제',
        cancel: '취소',

        // 폰트 정보
        variantsCount: '{count}개 변형',
        familyName: '패밀리',
        style: '스타일',
        path: '경로'
    },

    es: {
        // Información del plugin
        pluginName: 'Cargador de Fuentes Locales',
        pluginDesc: 'Carga fuentes personalizadas desde tu bóveda local',

        // Encabezados de configuración
        headerDirectoryConfig: 'Configuración de Directorios',
        headerGeneralSettings: 'Configuración General',
        headerFontApplication: 'Configuración de Aplicación de Fuentes',
        headerFontFileConfig: 'Configuración de Archivos de Fuentes',
        headerFallback: 'Operaciones de Respaldo',

        // Configuración de directorio
        fontSourceDir: 'Directorio de Origen de Fuentes',
        fontSourceDirDesc: 'Directorio que contiene carpetas de familias de fuentes',
        cacheDir: 'Directorio de Caché Base64',
        cacheDirDesc: 'Donde se almacenan los archivos CSS convertidos',

        // Configuración general
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

        // Separación de fuentes latinas
        latinFontInfo: 'Separación de Fuentes Latinas',
        latinFontInfoDesc: 'Al activarse, puede asignar una fuente latina separada para el Texto del Cuerpo. Los caracteres latinos (A-Z, a-z, números, puntuación) usarán la fuente latina, mientras que los caracteres no latinos (CJK, etc.) continuarán usando la Fuente de Texto del Cuerpo.',
        latinFontInfoDescForLatinUsers: 'Esta función está diseñada para usuarios que mezclan escrituras latinas y no latinas (ej., Inglés + Chino/Japonés/Coreano). Si escribe principalmente en idiomas con escritura latina, probablemente no necesite esta función.',
        latinFontEnabled: 'Activar Separación de Fuentes Latinas',
        latinFontEnabledDesc: 'Usar fuentes separadas para caracteres latinos y no latinos',
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

        // Acciones de fuentes
        scanFonts: 'Escanear Fuentes',
        convertToBase64: 'Convertir a Base64',
        deleteFont: 'Eliminar Fuente',
        convertAll: 'Convertir Todo',

        // Operaciones de respaldo
        deleteUnusedFonts: 'Eliminar Fuentes No Usadas',
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
        variantWarningBody: 'La fuente de texto del cuerpo seleccionada "{fontFamily}" solo tiene {variantCount} variante(s) ({variantList}).\n\nPara una correcta renderización de cursiva y negrita en contenido de escritura latina, se recomienda usar una familia de fuentes con variantes Regular, Italic, Bold y Bold Italic. Las variantes faltantes pueden causar problemas de renderización de falsa cursiva/negrita.',
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

        // Modales
        confirmDelete: 'Confirmar Eliminación',
        confirmDeleteMsg: '¿Está seguro de que desea eliminar esta fuente?',
        confirmDeleteUnused: '¿Está seguro de que desea eliminar todas las fuentes no usadas?',
        delete: 'Eliminar',
        cancel: 'Cancelar',

        // Información de fuente
        variantsCount: '{count} variantes',
        familyName: 'Familia',
        style: 'Estilo',
        path: 'Ruta'
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
        locale = (window.localStorage.getItem('language') || 'en').split('-')[0];
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
        this._logError('[Font Metadata] Parse failed:', error);
        return null;
    }
}

// ============================================================================
// Default Settings
// ============================================================================

const DEFAULT_SETTINGS = {
    fontSourceDir: 'Components/Library/Fonts',
    b64OutputDir: 'Components/Library/Fonts/B64Font',
    fonts: {
        ui: '',
        text: '',
        heading: '',          // Heading font (h1-h6)
        monospace: '',
        math: '',
        latin: ''  // Standard Latin font (family name)
    },
    headingApplyToFileTitle: false,  // Apply heading font to file name title (.inline-title)
    latinFontEnabled: false,  // Enable Latin font separation
    latinFontScope: {         // Latin font scope
        letters: true,        // Letters (A-Z, a-z)
        numbers: true,        // Numbers (0-9)
        punctuation: true,    // Punctuation marks
        symbols: true         // Special symbols
    },
    availableFonts: [],       // Font list (flat, for compatibility)
    fontFamilies: [],         // Font family grouping info
    autoLoadOnStartup: true
};

// ============================================================================
// Main Plugin Class
// ============================================================================

class LocalFontLoaderPlugin extends Plugin {

    // 日志级别控制
    _logEnabled = false; // 默认关闭日志输出

    _log(...args) {
        if (this._logEnabled) {
            console.log(...args);
        }
    }

    _logError(...args) {
        console.error(...args); // 错误日志始终输出
    }

    // saveSettings 防抖优化
    _saveSettingsTimer = null;
    _debouncedSaveSettings() {
        if (this._saveSettingsTimer) {
            clearTimeout(this._saveSettingsTimer);
        }
        this._saveSettingsTimer = setTimeout(() => {
            this.saveData(this.settings);
            this._saveSettingsTimer = null;
        }, 300); // 300ms 防抖延迟
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

    async onload() {
        this._log('[Local Font Loader] Plugin loading...');

        // Load settings
        await this.loadSettings();

        // Add Ribbon icon
        this.addRibbonIcon('type', 'Local Font Loader', () => {
            // Open settings panel directly
            this.app.setting.open();
            this.app.setting.openTabById('local-font-loader');
        });

        // 添加命令
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

        // 添加Settings Panel
        this.addSettingTab(new FontManagerSettingTab(this.app, this));

        // 扫描字体（如果列表为空）
        if (this.settings.availableFonts.length === 0) {
            await this.scanFonts();
        }

        // Auto-load fonts on startup
        if (this.settings.autoLoadOnStartup) {
            await this.applyFonts();
        }

        this._log('[Local Font Loader] ✓ Plugin loaded');
    }

    onunload() {
        this._log('[Local Font Loader] Plugin unloading');

        // 清理防抖计时器
        if (this._saveSettingsTimer) {
            clearTimeout(this._saveSettingsTimer);
            this._saveSettingsTimer = null;
        }

        this.removeFontStyles();
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    // 扫描字体目录（使用内置元数据解析）
    async scanFonts() {
        const startTime = performance.now();

        // 并发锁：防止同时触发多次扫描
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

            // 统一路径格式，使用文件名匹配
            let b64Files = [];
            try {
                const b64List = await this.app.vault.adapter.list(this.settings.b64OutputDir);
                b64Files = b64List.files.map(f => {
                    // 提取文件名（不含路径和扩展名）用于匹配
                    const basename = f.split('/').pop().replace('.css', '');
                    return basename;
                });
                this._log(`[Local Font Loader] Found ${b64Files.length} cached fonts`);
            } catch (err) {
                this._log('[Local Font Loader] B64 cache directory does not exist, will be created during conversion');
            }

            // 重置数据
            this.settings.availableFonts = [];
            this.settings.fontFamilies = [];

            // 使用 Map 去重
            const fontMap = new Map(); // key: font.name, value: fontInfo

            // 扫描每个 font family 文件夹
            for (const fontDir of fontDirs) {
                try {
                    const folderName = fontDir.split('/').pop();
                    const metadataPath = `${fontDir}/.fontfamily.json`;

                    // 尝试读取元数据文件
                    let metadata = null;
                    try {
                        const metadataContent = await this.app.vault.adapter.read(metadataPath);
                        metadata = JSON.parse(metadataContent);
                        this._log(`[Local Font Loader] Reading family metadata: ${metadata.familyName || folderName}`);
                    } catch (err) {
                        this._log(`[Local Font Loader] Metadata file not found: ${metadataPath}, will auto-scan`);
                    }

                    // 优先使用元数据的 familyName
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

                                // 使用文件名匹配
                                const hasB64 = b64Files.includes(name);
                                const b64Path = hasB64 ? `${this.settings.b64OutputDir}/${name}.css` : null;

                                const fontInfo = {
                                    name,
                                    path: fontPath,
                                    basename,
                                    ext,
                                    familyName: family.familyName, // 使用元数据的正确家族名
                                    variantType,
                                    hasB64,
                                    b64Path
                                };

                                // 去重：避免添加重复字体
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
                        // 并行读取字体文件元数据
                        const files = await this.app.vault.adapter.list(fontDir);
                        const fontFiles = files.files.filter(f => /\.(ttf|otf|woff|woff2)$/i.test(f));

                        this._log(`[Local Font Loader] Auto-scanning ${fontFiles.length} font files in ${folderName}...`);

                        // 并行读取所有字体文件的元数据
                        const scanPromises = fontFiles.map(async (fontPath) => {
                            try {
                                const basename = fontPath.split('/').pop();
                                const name = basename.replace(/\.(ttf|otf|woff|woff2)$/i, '');
                                const ext = basename.split('.').pop().toLowerCase();

                                // Read font metadata to determine variant type
                                const arrayBuffer = await this.app.vault.adapter.readBinary(fontPath);
                                const fontMetadata = parseFontMetadata(arrayBuffer);

                                // 使用字体内部的 familyName（如果存在）
                                const realFamilyName = fontMetadata?.familyName || family.familyName;
                                const variantType = fontMetadata?.variantType || 'regular';

                                // 使用文件名匹配
                                const hasB64 = b64Files.includes(name);
                                const b64Path = hasB64 ? `${this.settings.b64OutputDir}/${name}.css` : null;

                                const fontInfo = {
                                    name,
                                    path: fontPath,
                                    basename,
                                    ext,
                                    familyName: realFamilyName, // 使用字体内部的正确家族名
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

                        // 收集成功扫描的字体
                        for (const result of scanResults) {
                            if (result.success) {
                                // 去重：避免添加重复字体
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

            // 从 Map 转换为数组
            this.settings.availableFonts = Array.from(fontMap.values());

            await this.saveSettings();

            const endTime = performance.now();
            this._log(`[Local Font Loader] Scan completed: ${this.settings.fontFamilies.length} font families, ${this.settings.availableFonts.length} variants, took ${(endTime - startTime).toFixed(2)}ms`);

        } catch (error) {
            const endTime = performance.now();
            this._logError(`[Local Font Loader] 扫描失败，耗时 ${(endTime - startTime).toFixed(2)}ms:`, error);
            // 保持原有数据，避免清空导致 UI 问题
            await this.saveSettings();
        } finally {
            // 释放锁
            this._isScanning = false;
        }
    }

    /**
     * 检查字体是否在 vault 中存在
     * @param {string} fontName - 字体名称或家族名
     * @returns {boolean} 字体是否存在
     */
    isFontAvailable(fontName) {
        // 特殊选项（use-text-font、use-ui-font）和空字符串始终有效
        if (!fontName || fontName === 'use-text-font' || fontName === 'use-ui-font') {
            return true;
        }
        // 检查 availableFonts 数组中是否存在匹配的字体家族名或文件名
        return this.settings.availableFonts.some(f =>
            (f.familyName || f.name) === fontName
        );
    }

    // Apply fonts配置（仅从缓存加载）
    async applyFonts() {
        const startTime = performance.now();
        try {
            this._log('[Local Font Loader] Starting to apply fonts...');

            const usedFonts = new Set();
            const usedFamilies = new Set(); // 字体家族名（支持多变体）
            const missingFonts = []; // 记录缺失的字体

            // 遍历所有已配置的字体，检查存在性
            for (const fontName of Object.values(this.settings.fonts)) {
                if (fontName) {
                    // 检查字体是否存在于 vault 中
                    if (!this.isFontAvailable(fontName)) {
                        missingFonts.push(fontName);
                        this._log(`[Local Font Loader] ⚠️ Font "${fontName}" not found in vault, will fallback to system default`);
                        continue; // 跳过缺失的字体，回退到系统默认
                    }

                    usedFonts.add(fontName);
                    // 查找对应的字体家族
                    const fonts = this.settings.availableFonts.filter(f =>
                        f.name === fontName || f.familyName === fontName
                    );
                    if (fonts.length > 0) {
                        const familyName = fonts[0].familyName || fontName;
                        usedFamilies.add(familyName);
                    }
                }
            }

            // 显示缺失字体的提示（5秒）
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

            // 初始化 @font-face CSS
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

                    // 并行读取所有变体，提升加载性能
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

                    // 收集成功加载的 CSS
                    for (const result of results) {
                        if (result.success) {
                            fontFaceCss += result.css + '\n';
                            loadedCount++;
                        } else {
                            failedFonts.push(`${result.font.name} (读取失败: ${result.error.message})`);
                        }
                    }

                    // 处理未缓存的字体
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

            // 基础 CSS 变量
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
                if (this.settings.fonts[key]) {
                    const fontFamily = this.settings.fonts[key];
                    for (const cssVar of cssVars) {
                        // If Latin font separation is enabled, body text font needs special handling
                        if (key === 'text' && this.settings.latinFontEnabled && this.settings.fonts.latin) {
                            varsCss += `  ${cssVar}: "${this.settings.fonts.latin}", "${fontFamily}", sans-serif !important;\n`;
                        } else {
                            varsCss += `  ${cssVar}: "${fontFamily}", monospace !important;\n`;
                        }
                    }
                }
            }

            varsCss += '}\n\n';

            // Universal for mobile and desktop: apply directly to elements
            if (this.settings.fonts.text) {
                varsCss += `/* Body Text Font */\n`;

                // 构建 font-family 值
                let textFontFamily = `"${this.settings.fonts.text}"`;
                if (this.settings.latinFontEnabled && this.settings.fonts.latin) {
                    // Latin font first (due to unicode-range restriction), non-Latin font as fallback
                    textFontFamily = `"${this.settings.fonts.latin}", "${this.settings.fonts.text}"`;
                    this._log(`[Local Font Loader] Enable Latin font separation: ${this.settings.fonts.latin} (Latin) + ${this.settings.fonts.text} (Non-Latin)`);
                }

                // 阅读模式
                varsCss += `.markdown-preview-view,\n`;
                // 编辑模式
                varsCss += `.markdown-source-view,\n`;
                varsCss += `.cm-s-obsidian,\n`;
                varsCss += `.cm-s-obsidian .cm-line,\n`;
                varsCss += `.markdown-source-view.mod-cm6 .cm-content {\n`;
                varsCss += `  font-family: ${textFontFamily} !important;\n`;
                varsCss += `}\n\n`;
            }

            if (this.settings.fonts.monospace) {
                varsCss += `/* Code block font - via CSS variables only */\n`;
                varsCss += `/* Already set via :root variables above */\n\n`;
            }

            // Heading font
            if (this.settings.fonts.heading) {
                varsCss += `/* Heading Font */\n`;

                // 解析 heading 字体设置
                let headingFontFamily = '';
                const headingValue = this.settings.fonts.heading;

                if (headingValue === 'use-text-font') {
                    // 使用正文字体
                    if (this.settings.fonts.text) {
                        headingFontFamily = this.settings.fonts.text;
                        if (this.settings.latinFontEnabled && this.settings.fonts.latin) {
                            headingFontFamily = `"${this.settings.fonts.latin}", "${this.settings.fonts.text}"`;
                        } else {
                            headingFontFamily = `"${headingFontFamily}"`;
                        }
                    }
                } else if (headingValue === 'use-ui-font') {
                    // 使用 UI 字体
                    if (this.settings.fonts.ui) {
                        headingFontFamily = `"${this.settings.fonts.ui}"`;
                    }
                } else if (headingValue) {
                    // 使用自定义字体
                    headingFontFamily = `"${headingValue}"`;
                }

                if (headingFontFamily) {
                    // 应用到正文标题 h1-h6（阅读模式和编辑模式）
                    varsCss += `.markdown-preview-view h1, .markdown-preview-view h2,\n`;
                    varsCss += `.markdown-preview-view h3, .markdown-preview-view h4,\n`;
                    varsCss += `.markdown-preview-view h5, .markdown-preview-view h6,\n`;
                    varsCss += `.cm-header-1, .cm-header-2, .cm-header-3,\n`;
                    varsCss += `.cm-header-4, .cm-header-5, .cm-header-6`;

                    // 如果启用了文件名标题选项，则添加 .inline-title
                    if (this.settings.headingApplyToFileTitle) {
                        varsCss += `,\n.inline-title`;
                    }

                    varsCss += ` {\n  font-family: ${headingFontFamily} !important;\n}\n\n`;
                    this._log(`[Local Font Loader] Apply heading font: ${headingFontFamily}${this.settings.headingApplyToFileTitle ? ' (including file title)' : ''}`);
                }
            }

            // Math fonts (map MathJax Unicode classes to correct characters)
            if (this.settings.fonts.math) {
                varsCss += `/* LaTeX Math Font - 修正 MathJax CHTML 的 content */\n`;

                // 性能优化：预构建所有数学字符的 CSS 规则，避免运行时循环
                const mathItalicUpperStart = 0x1D434; // A-Z
                const mathItalicLowerStart = 0x1D44E; // a-z

                for (let i = 0; i < 26; i++) {
                    const upperCode = mathItalicUpperStart + i;
                    const lowerCode = mathItalicLowerStart + i;
                    varsCss += `.mjx-c${upperCode.toString(16).toUpperCase()}.TEX-I::before { content: "${String.fromCodePoint(upperCode)}" !important; }\n`;
                    varsCss += `.mjx-c${lowerCode.toString(16).toUpperCase()}.TEX-I::before { content: "${String.fromCodePoint(lowerCode)}" !important; }\n`;
                }

                varsCss += `\n/* Apply fonts */\n`;
                varsCss += `/* 斜体变量 */\n`;
                varsCss += `mjx-c.TEX-I::before {\n`;
                varsCss += `  font-family: '${this.settings.fonts.math}', MJXTEX-I, MJXZERO, serif !important;\n`;
                varsCss += `  font-style: normal !important;\n`;
                varsCss += `}\n\n`;
                varsCss += `/* Numbers和运算符 */\n`;
                varsCss += `mjx-mn mjx-c::before, mjx-mo mjx-c::before, mjx-c:not(.TEX-I)::before {\n`;
                varsCss += `  font-family: '${this.settings.fonts.math}', MJXZERO, MJXTEX, serif !important;\n`;
                varsCss += `}\n\n`;
                varsCss += `/* 容器 */\n`;
                varsCss += `mjx-container {\n`;
                varsCss += `  font-family: '${this.settings.fonts.math}', MJXZERO, MJXTEX, serif !important;\n`;
                varsCss += `}\n`;
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

                    const formatMap = {
                        'ttf': 'font/truetype',
                        'otf': 'font/opentype',
                        'woff': 'font/woff',
                        'woff2': 'font/woff2'
                    };
                    const mimeType = formatMap[font.ext] || 'font/truetype';

                    // Generate @font-face CSS
                    let singleFontCss = '';

                    // Use font family name
                    const fontFamily = font.familyName || font.name;
                    const variantType = font.variantType || 'regular';

                    // 判断是否需要添加 unicode-range（Latin字体）
                    const needsUnicodeRange =
                        fontFamily.toLowerCase().includes('times') ||
                        fontFamily.toLowerCase().includes('latin') ||
                        font.name.toLowerCase().includes('times') ||
                        font.name.toLowerCase().includes('latin');

                    // Set CSS properties based on variant type
                    let fontWeight = 400;
                    let fontStyle = 'normal';

                    switch (variantType) {
                        case 'regular':
                            fontWeight = 400;
                            fontStyle = 'normal';
                            break;
                        case 'italic':
                            fontWeight = 400;
                            fontStyle = 'italic';
                            break;
                        case 'bold':
                            fontWeight = 700;
                            fontStyle = 'normal';
                            break;
                        case 'bolditalic':
                            fontWeight = 700;
                            fontStyle = 'italic';
                            break;
                    }

                    // Generate main @font-face declaration
                    singleFontCss += `/* ${fontFamily} - ${variantType} */\n`;
                    singleFontCss += `@font-face {\n`;
                    singleFontCss += `  font-family: '${fontFamily}';\n`;
                    singleFontCss += `  src: url(data:${mimeType};base64,${base64});\n`;
                    singleFontCss += `  font-style: ${fontStyle};\n`;
                    singleFontCss += `  font-weight: ${fontWeight};\n`;
                    singleFontCss += `  font-display: swap;\n`;

                    if (needsUnicodeRange) {
                        // Generate unicode-range based on scope configuration
                        const unicodeRange = this.getUnicodeRange(this.settings.latinFontScope);
                        if (unicodeRange) {
                            singleFontCss += `  unicode-range: ${unicodeRange};\n`;
                        }
                    }

                    singleFontCss += `}\n`;

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
        const chunkSize = 8192; // 8KB 分块处理
        let binary = "";

        for (let i = 0; i < bytes.byteLength; i += chunkSize) {
            const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.byteLength));
            binary += String.fromCharCode.apply(null, chunk);
        }

        return btoa(binary);
    }

    applyCss(css, cssId) {
        const existingStyle = document.getElementById(cssId);

        // 如果内容相同，跳过更新
        if (existingStyle && existingStyle.textContent === css) {
            return;
        }

        if (existingStyle) {
            existingStyle.remove();
        }

        if (css) {
            const style = document.createElement('style');
            style.id = cssId;
            style.textContent = css;  // 使用 textContent 而非 innerHTML
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
// ── Settings Panel ──
// ============================================================================

// 新的优化版设置界面
// 这个文件将替换 FontManagerSettingTab 类 (852-1494 行)

class FontManagerSettingTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
        this._eventListeners = [];
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
     * 判断字体是否为拉丁字体（通过字体名称启发式判断）
     * @param {string} fontName - 字体家族名
     * @returns {boolean} 是否为拉丁字体
     */
    _isLatinFont(fontName) {
        const lowerName = fontName.toLowerCase();

        // 明确的非拉丁字体关键词
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
        this._cleanupEventListeners();

        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: t('pluginName') });

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

        // 启动设置
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

        for (const fontType of fontTypes) {
            const settingItem = new Setting(containerEl)
                .setName(fontType.name)
                .setDesc(fontType.desc)
                .addDropdown(dropdown => {
                    dropdown.addOption('', t('systemDefault'));

                    // 如果有 specialOptions，添加特殊选项
                    if (fontType.specialOptions) {
                        fontType.specialOptions.forEach(optKey => {
                            if (optKey === 'text') {
                                dropdown.addOption('use-text-font', t('headingUseTextFont'));
                            } else if (optKey === 'ui') {
                                dropdown.addOption('use-ui-font', t('headingUseUIFont'));
                            }
                        });
                    }

                    // 使用字体家族列表（去重）
                    const uniqueFamilies = new Set();
                    this.plugin.settings.availableFonts.forEach(font => {
                        const familyName = font.familyName || font.name;
                        uniqueFamilies.add(familyName);
                    });

                    // 为每个家族添加选项（显示变体信息）
                    Array.from(uniqueFamilies).sort().forEach(familyName => {
                        const familyFonts = this.plugin.settings.availableFonts.filter(f =>
                            (f.familyName || f.name) === familyName
                        );

                        const allConverted = familyFonts.every(f => f.hasB64);

                        // 只显示字体名，已转换的加上勾选标记
                        const label = allConverted ? `${familyName} ✓` : familyName;

                        dropdown.addOption(familyName, label);
                    });

                    dropdown.setValue(this.plugin.settings.fonts[fontType.key]);
                    dropdown.onChange(async (value) => {
                        this.plugin.settings.fonts[fontType.key] = value;
                        await this.plugin.saveSettings();
                        await this.plugin.applyFonts();

                        // 刷新界面以显示变体警告
                        // 使用 requestAnimationFrame 确保 DOM 操作在下一帧执行，避免重复渲染
                        requestAnimationFrame(() => {
                            this.display();
                        });
                    });
                });

            // 字体缺失警告：在下拉框后显示警告图标
            const selectedFont = this.plugin.settings.fonts[fontType.key];
            if (selectedFont && !this.plugin.isFontAvailable(selectedFont)) {
                const warningIcon = settingItem.controlEl.createSpan({
                    cls: 'setting-item-warning',
                    attr: {
                        'aria-label': t('fontMissingWarning'),
                        'style': 'margin-left: 8px; color: var(--text-error); cursor: help;'
                    }
                });
                setIcon(warningIcon, 'alert-triangle');
            }

            // 在设置项下方添加变体警告（使用 callout 语法）
            if (this.plugin.settings.fonts[fontType.key]) {
                const selectedFont = this.plugin.settings.fonts[fontType.key];
                const variants = this.plugin.settings.availableFonts.filter(f =>
                    (f.familyName || f.name) === selectedFont
                );

                // Text Font: recommend 4 variants (only show for Latin fonts)
                if (fontType.key === 'text' && variants.length > 0 && variants.length < 4) {
                    const variantList = variants.map(f => f.variantType || 'unknown').join(', ');

                    // Check if it is a Latin font
                    const isLatin = this._isLatinFont(selectedFont);

                    if (isLatin) {
                        // Latin font: show full warning with non-Latin hint inside callout
                        const warningCallout = containerEl.createDiv({ attr: { style: 'margin: 8px 0 16px 0;' } });

                        const warningMd = `> [!warning] ${t('incompleteVariantTitle')}
> ${t('incompleteVariantBody', { fontFamily: selectedFont, variantCount: variants.length, variantList })}`;

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

            // 如果是 Body Text Font，添加 Latin 字体分离选项
            if (fontType.supportsLatin) {
                this.addLatinFontOptions(containerEl);
            }

            // 如果是 Heading Font，添加"应用到文件名标题"选项（仅当未选择 use-text-font 时显示）
            if (fontType.supportsFileTitle) {
                const currentValue = this.plugin.settings.fonts[fontType.key];
                if (currentValue && currentValue !== 'use-text-font') {
                    this.addFileTitleOption(containerEl);
                }
            }
        }

        // ========================================
        // Font File Configuration
        // ========================================
        containerEl.createEl('h3', { text: t('headerFontFileConfig') });

        // 图例说明
        const legendEl = containerEl.createDiv({
            attr: {
                style: 'margin-bottom: 16px; padding: 12px; background: var(--background-secondary); border-radius: 8px; display: flex; gap: 16px; flex-wrap: wrap; font-size: 0.9em;'
            }
        });

        const legends = [
            { icon: 'check', color: 'var(--color-green)', text: t('converted') },
            { icon: 'circle', color: 'var(--text-muted)', text: 'not converted' }
        ];

        legends.forEach(legend => {
            const item = legendEl.createDiv({
                attr: { style: 'display: flex; align-items: center; gap: 6px;' }
            });
            const iconEl = item.createSpan({ attr: { style: `color: ${legend.color};` } });
            setIcon(iconEl, legend.icon);
            item.createSpan({ text: legend.text });
        });

        // 字体列表
        const fontListEl = containerEl.createDiv({
            attr: {
                style: 'margin: 10px 0; padding: 10px; background: var(--background-secondary); border-radius: 8px; max-height: 400px; overflow-y: auto;'
            }
        });

        if (this.plugin.settings.availableFonts.length === 0) {
            fontListEl.createEl('div', {
                text: t('notFoundFontFamily'),
                attr: { style: 'color: var(--text-muted); font-size: 0.9em; text-align: center; padding: 20px;' }
            });
        } else {
            // 按家族显示（可折叠）
            this.renderFontFamilies(fontListEl);
        }

        // 字体文件操作按钮
        const fontOperationsEl = containerEl.createDiv({
            attr: {
                style: 'display: flex; gap: 12px; margin: 16px 0;'
            }
        });

        // 导入字体
        const importBtn = fontOperationsEl.createEl('button', {
            text: t('importFont'),
            attr: {
                style: 'flex: 1; padding: 12px; cursor: pointer;',
                class: 'mod-cta'
            }
        });
        this._addEventListener(importBtn, 'click', async () => {
            await this.importFont();
        });

        // 转换所有字体
        const convertBtn = fontOperationsEl.createEl('button', {
            text: t('convertAllFonts'),
            attr: {
                style: 'flex: 1; padding: 12px; cursor: pointer;'
            }
        });
        this._addEventListener(convertBtn, 'click', async () => {
            await this.plugin.convertAllFonts();
            this.display();
        });

        // ========================================
        // Fallback 操作
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
                    await this.deleteUnusedFonts();
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
    }

    // 添加Latin字体分离选项
    addLatinFontOptions(containerEl) {
        // Callout: Info - 根据用户语言显示不同的描述
        const infoCalloutEl = containerEl.createDiv({ attr: { style: 'margin: 16px 0;' } });

        // 基础描述
        let infoMarkdown = `> [!info] ${t('latinFontInfo')}\n> ${t('latinFontInfoDesc')}`;

        // 如果是拉丁语言用户，追加额外提示
        if (isLatinScriptLocale()) {
            infoMarkdown += `\n>\n> ${t('latinFontInfoDescForLatinUsers')}`;
        }

        // 使用 Obsidian 原生渲染引擎
        MarkdownRenderer.render(
            this.app,
            infoMarkdown,
            infoCalloutEl,
            '',
            this
        );

        // 启用开关
        new Setting(containerEl)
            .setName(t('latinFontEnabled'))
            .setDesc(t('latinFontEnabledDesc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.latinFontEnabled)
                .onChange(async (value) => {
                    this.plugin.settings.latinFontEnabled = value;
                    await this.plugin.saveSettings();
                    await this.plugin.applyFonts();
                    this.display(); // 刷新界面
                }));

        if (this.plugin.settings.latinFontEnabled) {
            // 选择Latin字体
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

                    dropdown.setValue(this.plugin.settings.fonts.latin);
                    dropdown.onChange(async (value) => {
                        this.plugin.settings.fonts.latin = value;

                        await this.plugin.saveSettings();
                        await this.plugin.applyFonts();

                        // 刷新界面以显示警告
                        // 使用 requestAnimationFrame 确保 DOM 操作在下一帧执行，避免重复渲染
                        requestAnimationFrame(() => {
                            this.display();
                        });
                    });
                });

            // 在 Latin 字体选择器下方显示变体警告
            if (this.plugin.settings.fonts.latin) {
                const latinFont = this.plugin.settings.fonts.latin;
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
                        .setValue(this.plugin.settings.latinFontScope?.[scope.key] ?? true)
                        .onChange(async (value) => {
                            if (!this.plugin.settings.latinFontScope) {
                                this.plugin.settings.latinFontScope = { letters: true, numbers: true, punctuation: true, symbols: true };
                            }
                            this.plugin.settings.latinFontScope[scope.key] = value;
                            await this.plugin.saveSettings();
                            await this.plugin.applyFonts();
                        }));
            });
        }
    }

    // 添加文件名标题选项
    addFileTitleOption(containerEl) {
        // 检查当前标题字体设置，如果是 'use-text-font' 则不显示此选项
        const headingFontValue = this.plugin.settings.fonts.heading;

        if (headingFontValue === 'use-text-font') {
            // 使用正文字体时，不显示此选项
            return;
        }

        new Setting(containerEl)
            .setName(t('headingApplyToFileTitle'))
            .setDesc(t('headingApplyToFileTitleDesc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.headingApplyToFileTitle || false)
                .onChange(async (value) => {
                    this.plugin.settings.headingApplyToFileTitle = value;
                    await this.plugin.saveSettings();
                    await this.plugin.applyFonts();
                }));
    }

    // 渲染字体家族（可折叠）
    renderFontFamilies(containerEl) {
        // 按家族分组
        const familiesMap = new Map();

        this.plugin.settings.availableFonts.forEach(font => {
            const familyName = font.familyName || font.name;
            if (!familiesMap.has(familyName)) {
                familiesMap.set(familyName, []);
            }
            familiesMap.get(familyName).push(font);
        });

        // 渲染每个家族
        for (const [familyName, fonts] of familiesMap.entries()) {
            const familyEl = containerEl.createDiv({
                attr: {
                    style: 'margin-bottom: 8px; border: 1px solid var(--background-modifier-border); border-radius: 6px; overflow: hidden;'
                }
            });

            // 家族标题（可点击展开/收起）
            const headerEl = familyEl.createDiv({
                attr: {
                    style: 'padding: 12px; background: var(--background-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; user-select: none;'
                }
            });

            const leftEl = headerEl.createDiv({
                attr: { style: 'display: flex; align-items: center; gap: 12px; flex: 1;' }
            });

            // 展开/收起图标
            const expandIcon = leftEl.createSpan({
                attr: {
                    style: 'display: inline-flex; align-items: center;',
                    'aria-label': t('expandCollapse')
                }
            });
            setIcon(expandIcon, 'chevron-right');

            // 家族名
            leftEl.createSpan({
                text: familyName,
                attr: { style: 'font-weight: 600; font-family: var(--font-monospace);' }
            });

            // 字体列表（默认折叠）
            const variantsEl = familyEl.createDiv({
                attr: {
                    style: 'display: none; padding: 8px; background: var(--background-secondary);'
                }
            });

            let expanded = false;
            this._addEventListener(headerEl, 'click', () => {
                expanded = !expanded;
                variantsEl.style.display = expanded ? 'block' : 'none';
                // 切换图标
                expandIcon.empty();
                setIcon(expandIcon, expanded ? 'chevron-down' : 'chevron-right');
            });

            // 渲染变体列表
            fonts.forEach(font => {
                const variantEl = variantsEl.createDiv({
                    attr: {
                        style: 'padding: 8px; margin: 4px 0; background: var(--background-primary); border-radius: 4px; display: flex; align-items: center; justify-content: space-between;'
                    }
                });

                const infoEl = variantEl.createDiv({
                    attr: { style: 'display: flex; align-items: center; gap: 12px; flex: 1;' }
                });

                // 状态图标
                const statusIconEl = infoEl.createSpan({
                    attr: {
                        style: `color: ${font.hasB64 ? 'var(--color-green)' : 'var(--text-muted)'};`
                    }
                });
                setIcon(statusIconEl, font.hasB64 ? 'check' : 'circle');

                // 变体类型标签
                const variantLabels = {
                    'regular': 'Regular',
                    'italic': 'Italic',
                    'bold': 'Bold',
                    'bolditalic': 'Bold Italic'
                };

                const variantLabel = variantLabels[font.variantType] || 'Unknown';

                // 变体名称
                infoEl.createSpan({
                    text: variantLabel,
                    attr: { style: 'font-family: var(--font-monospace); font-size: 0.9em;' }
                });

                // 操作按钮
                const actionsEl = variantEl.createDiv({
                    attr: { style: 'display: flex; gap: 4px;' }
                });

                // 重新转换按钮
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

                // 删除按钮
                const deleteBtn = actionsEl.createEl('button', {
                    attr: {
                        style: 'padding: 4px 8px; cursor: pointer; display: inline-flex; align-items: center;',
                        title: t('deleteThisFont'),
                        'aria-label': t('deleteThisFont')
                    }
                });
                setIcon(deleteBtn, 'trash-2');
                this._addEventListener(deleteBtn, 'click', async () => {
                    if (confirm(t('confirmDeleteFont', { fontName: font.name }))) {
                        await this.deleteSingleFont(font);
                        this.display();
                    }
                });
            });
        }
    }

    // 转换单个字体
    async convertSingleFont(font) {
        try {
            this._log(`[Local Font Loader] Converting ${font.name}...`);

            const arrayBuffer = await this.plugin.app.vault.adapter.readBinary(font.path);
            const base64 = this.plugin.arrayBufferToBase64(arrayBuffer);

            const formatMap = {
                'ttf': 'font/truetype',
                'otf': 'font/opentype',
                'woff': 'font/woff',
                'woff2': 'font/woff2'
            };
            const mimeType = formatMap[font.ext] || 'font/truetype';

            const fontFamily = font.familyName || font.name;
            const variantType = font.variantType || 'regular';

            const needsUnicodeRange =
                fontFamily.toLowerCase().includes('times') ||
                fontFamily.toLowerCase().includes('latin');

            let fontWeight = 400;
            let fontStyle = 'normal';

            switch (variantType) {
                case 'regular':
                    fontWeight = 400;
                    fontStyle = 'normal';
                    break;
                case 'italic':
                    fontWeight = 400;
                    fontStyle = 'italic';
                    break;
                case 'bold':
                    fontWeight = 700;
                    fontStyle = 'normal';
                    break;
                case 'bolditalic':
                    fontWeight = 700;
                    fontStyle = 'italic';
                    break;
            }

            let singleFontCss = `/* ${fontFamily} - ${variantType} */\n`;
            singleFontCss += `@font-face {\n`;
            singleFontCss += `  font-family: '${fontFamily}';\n`;
            singleFontCss += `  src: url(data:${mimeType};base64,${base64});\n`;
            singleFontCss += `  font-style: ${fontStyle};\n`;
            singleFontCss += `  font-weight: ${fontWeight};\n`;
            singleFontCss += `  font-display: swap;\n`;

            if (needsUnicodeRange) {
                const unicodeRange = this.plugin.getUnicodeRange(this.plugin.settings.latinFontScope);
                if (unicodeRange) {
                    singleFontCss += `  unicode-range: ${unicodeRange};\n`;
                }
            }

            singleFontCss += `}\n`;

            const cachePath = `${this.plugin.settings.b64OutputDir}/${font.name}.css`;
            await this.plugin.app.vault.adapter.write(cachePath, singleFontCss);

            font.hasB64 = true;
            font.b64Path = cachePath;
            await this.plugin.saveSettings();

            this._log(`[Local Font Loader] ${font.name} Conversion complete`);
            new Notice(`✓ ${font.name} Conversion complete`);
        } catch (error) {
            this._logError(`[Local Font Loader] Conversion failed: ${font.name}`, error);
            new Notice(`⚠️ Conversion failed: ${error.message}`);
        }
    }

    // 删除单个字体
    async deleteSingleFont(font) {
        try {
            // 删除源文件
            await this.plugin.app.vault.adapter.remove(font.path);

            // 删除缓存
            if (font.b64Path) {
                try {
                    await this.plugin.app.vault.adapter.remove(font.b64Path);
                } catch (err) {
                    // 缓存可能不存在
                }
            }

            // 从列表中移除
            const index = this.plugin.settings.availableFonts.indexOf(font);
            if (index > -1) {
                this.plugin.settings.availableFonts.splice(index, 1);
            }

            await this.plugin.saveSettings();
            new Notice(t('deletedFont', { fontName: font.name }));
        } catch (error) {
            this._logError(`[Local Font Loader] 删除失败: ${font.name}`, error);
            new Notice(t('deleteFailedError', { error: error.message }));
        }
    }

    // Delete Unused Fonts
    async deleteUnusedFonts() {
        const usedFonts = new Set(Object.values(this.plugin.settings.fonts).filter(f => f));

        const unusedFonts = this.plugin.settings.availableFonts.filter(
            font => !usedFonts.has(font.name)
        );

        if (unusedFonts.length === 0) {
            new Notice(t('noUnusedFonts'));
            return;
        }

        if (!confirm(t('confirmDeleteUnusedFonts', { count: unusedFonts.length }))) {
            return;
        }

        this._log(`[Local Font Loader] Starting to delete unused fonts (${unusedFonts.length} fonts)...`);
        let deleted = 0;

        try {
            for (const font of unusedFonts) {
                try {
                    // 删除原始字体文件
                    await this.app.vault.adapter.remove(font.path);

                    // 删除缓存文件
                    if (font.hasB64 && font.b64Path) {
                        try {
                            await this.app.vault.adapter.remove(font.b64Path);
                        } catch (error) {
                            // 忽略缓存删除错误
                        }
                    }

                    // 从列表中移除
                    const index = this.plugin.settings.availableFonts.indexOf(font);
                    if (index > -1) {
                        this.plugin.settings.availableFonts.splice(index, 1);
                    }

                    deleted++;

                } catch (error) {
                    this._logError(`[Local Font Loader] 删除失败: ${font.name}`, error);
                }
            }

            await this.plugin.saveSettings();

            new Notice(t('deletedUnusedFonts', { count: deleted }));
            this._log(`[Local Font Loader] Deleted ${deleted} unused fonts`);

            this.display(); // 刷新界面

        } catch (error) {
            this._logError('[Local Font Loader] 批量删除失败:', error);
            new Notice(t('deleteError'));
        }
    }

    // 导入字体
    async importFont() {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = '.ttf,.otf,.woff,.woff2';

        this._addEventListener(input, 'change', async (e) => {
            const files = e.target.files;
            if (!files || files.length === 0) return;

            this._log(`[Local Font Loader] Starting to import ${files.length} font files...`);
            let imported = 0;

            try {
                for (const file of files) {
                    const arrayBuffer = await file.arrayBuffer();
                    const uint8Array = new Uint8Array(arrayBuffer);

                    // 默认放入 "Imported" 文件夹
                    const targetDir = `${this.plugin.settings.fontSourceDir}/Imported`;
                    const targetPath = `${targetDir}/${file.name}`;

                    // Ensure directory exists
                    try {
                        await this.plugin.app.vault.adapter.mkdir(targetDir);
                    } catch (err) {
                        // Directory might already exist
                    }

                    await this.plugin.app.vault.adapter.writeBinary(targetPath, arrayBuffer);
                    imported++;
                }

                new Notice(t('importedFonts', { count: imported }));
                this._log(`[Local Font Loader] Imported ${imported} font files`);

                // Rescan
                await this.plugin.scanFonts();
                this.display();
            } catch (error) {
                this._logError('[Local Font Loader] 导入失败:', error);
                new Notice(t('importFailedError', { error: error.message }));
            }
        });

        input.click();
    }

    hide() {
        this._cleanupEventListeners();
        super.hide();
    }
}


// ============================================================================
// ── 导出 ──
// ============================================================================

module.exports = LocalFontLoaderPlugin;
