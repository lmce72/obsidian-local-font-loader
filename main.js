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

        // 目录配置
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

        // 字体变体警告
        variantWarningTitle: '字体变体警告',
        variantWarningBody: '所选正文字体 "{fontFamily}" 仅有 {variantCount} 个变体（{variantList}）。\n\n为确保拉丁文字内容的斜体和粗体正常显示，建议使用包含 Regular、Italic、Bold 和 Bold Italic 四种变体的字体家族。缺少变体可能导致伪斜体/伪粗体渲染问题。',
        variantWarningContinue: '仍然继续',
        variantWarningCancel: '取消',

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
 * @param {string} [locale] - Language code (defaults to system language)
 * @param {Object} [params] - Parameters for string interpolation
 * @returns {string} Translated string
 */
function t(key, locale = null, params = {}) {
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
    fonts: {
        ui: '',
        text: '',
        monospace: '',
        math: '',
        latin: ''  // Standard Latin font (family name)
    },
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
        console.log('[Local Font Loader] Plugin loading...');

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

        console.log('[Local Font Loader] ✓ Plugin loaded');
    }

    onunload() {
        console.log('[Local Font Loader] Plugin unloading');
        this.removeFontStyles();
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    // 扫描字体目录（使用内置元数据解析）
    // 扫描字体目录（基于文件夹 + .fontfamily.json）
    async scanFonts() {
        try {
            console.log('[Local Font Loader] Scanning font family folders...');

            // 获取字体目录下的所有子文件夹
            const dirList = await this.app.vault.adapter.list(this.settings.fontSourceDir);
            const fontDirs = dirList.folders.filter(dir => {
                const basename = dir.split('/').pop();
                return basename !== 'B64Font'; // Exclude cache directory
            });

            console.log(`[Local Font Loader] Found ${fontDirs.length} font family folders`);

            // Check Base64 cache
            let b64Files = [];
            try {
                const b64List = await this.app.vault.adapter.list(this.settings.b64OutputDir);
                b64Files = b64List.files.filter(f => f.endsWith('.css'));
            } catch (err) {
                console.warn('[Local Font Loader] B64 cache directory does not exist, will be created during conversion');
            }

            // 重置数据
            this.settings.availableFonts = [];
            this.settings.fontFamilies = [];

            // 扫描每font family folders
            for (const fontDir of fontDirs) {
                try {
                    const familyName = fontDir.split('/').pop();
                    const metadataPath = `${fontDir}/.fontfamily.json`;

                    // Try to read metadata file
                    let metadata = null;
                    try {
                        const metadataContent = await this.app.vault.adapter.read(metadataPath);
                        metadata = JSON.parse(metadataContent);
                        console.log(`[Local Font Loader] Reading family metadata: ${metadata.familyName || familyName}`);
                    } catch (err) {
                        console.warn(`[Local Font Loader] 未Found元数据文件: ${metadataPath}，will auto-scan`);
                    }

                    const family = {
                        familyName: metadata?.familyName || familyName,
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

                                const b64Path = `${this.settings.b64OutputDir}/${name}.css`;
                                const hasB64 = b64Files.includes(b64Path);

                                const fontInfo = {
                                    name,
                                    path: fontPath,
                                    basename,
                                    ext,
                                    familyName: family.familyName,
                                    variantType,
                                    hasB64,
                                    b64Path: hasB64 ? b64Path : null
                                };

                                this.settings.availableFonts.push(fontInfo);

                                // Mark variants owned by family
                                if (variantType === 'regular') family.hasRegular = true;
                                else if (variantType === 'italic') family.hasItalic = true;
                                else if (variantType === 'bold') family.hasBold = true;
                                else if (variantType === 'bolditalic') family.hasBoldItalic = true;

                                console.log(`[Local Font Loader] Identified font: ${family.familyName} (${variantType})`);
                            } catch (err) {
                                console.warn(`[Local Font Loader] Font file does not exist: ${fontPath}`);
                            }
                        }
                    } else {
                        // No metadata, auto-scan font files in folder
                        const files = await this.app.vault.adapter.list(fontDir);
                        const fontFiles = files.files.filter(f => /\.(ttf|otf|woff|woff2)$/i.test(f));

                        for (const fontPath of fontFiles) {
                            const basename = fontPath.split('/').pop();
                            const name = basename.replace(/\.(ttf|otf|woff|woff2)$/i, '');
                            const ext = basename.split('.').pop().toLowerCase();

                            // Read font metadata to determine variant type
                            const arrayBuffer = await this.app.vault.adapter.readBinary(fontPath);
                            const fontMetadata = parseFontMetadata(arrayBuffer);
                            const variantType = fontMetadata?.variantType || 'regular';

                            const b64Path = `${this.settings.b64OutputDir}/${name}.css`;
                            const hasB64 = b64Files.includes(b64Path);

                            const fontInfo = {
                                name,
                                path: fontPath,
                                basename,
                                ext,
                                familyName: family.familyName,
                                variantType,
                                hasB64,
                                b64Path: hasB64 ? b64Path : null
                            };

                            this.settings.availableFonts.push(fontInfo);

                            // Mark variants owned by family
                            if (variantType === 'regular') family.hasRegular = true;
                            else if (variantType === 'italic') family.hasItalic = true;
                            else if (variantType === 'bold') family.hasBold = true;
                            else if (variantType === 'bolditalic') family.hasBoldItalic = true;

                            console.log(`[Local Font Loader] 自动识别: ${family.familyName} (${variantType})`);
                        }
                    }

                    // Add family info
                    if (family.hasRegular || family.hasItalic || family.hasBold || family.hasBoldItalic) {
                        this.settings.fontFamilies.push(family);
                    }

                } catch (error) {
                    console.error(`[Local Font Loader] Failed to process font family: ${fontDir}`, error);
                }
            }

            await this.saveSettings();

            console.log(`[Local Font Loader] Scan complete：${this.settings.fontFamilies.length} font families，${this.settings.availableFonts.length} variants`);

        } catch (error) {
            console.error('[Local Font Loader] Font scan failed:', error);
            this.settings.availableFonts = [];
            this.settings.fontFamilies = [];
        }
    }

    // Apply fonts配置（仅从缓存加载）
    async applyFonts() {
        try {
            console.log('[Local Font Loader] 开始Apply fonts...');

            const usedFonts = new Set();
            const usedFamilies = new Set(); // Font family names (to support multiple variants)

            for (const fontName of Object.values(this.settings.fonts)) {
                if (fontName) {
                    usedFonts.add(fontName);
                    // Find corresponding font family
                    const fonts = this.settings.availableFonts.filter(f =>
                        f.name === fontName || f.familyName === fontName
                    );
                    if (fonts.length > 0) {
                        const familyName = fonts[0].familyName || fontName;
                        usedFamilies.add(familyName);
                    }
                }
            }

            if (usedFonts.size === 0) {
                console.log('[Local Font Loader] No fonts configured');
                this.removeFontStyles();
                return;
            }

            console.log('[Local Font Loader] Fonts to load:', Array.from(usedFonts));
            console.log('[Local Font Loader] Font families involved:', Array.from(usedFamilies));

            // 移除旧的 <link> 标签
            document.querySelectorAll('link[data-local-font-loader]').forEach(link => link.remove());

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
                        console.warn(`[Local Font Loader] 未Found字体家族: ${familyOrFontName}`);
                        failedFonts.push(`${familyOrFontName} (未Found)`);
                        continue;
                    }

                    console.log(`[Local Font Loader] Loading font family: ${familyOrFontName}, contains ${familyFonts.length} variants`);

                    // Load all variants of this family
                    for (const font of familyFonts) {
                        if (font.hasB64 && font.b64Path) {
                            const b64Css = await this.app.vault.adapter.read(font.b64Path);
                            console.log(`[Local Font Loader] ✓ Loaded variant: ${font.name} (${font.subfamilyName || 'Unknown'}, ${(b64Css.length / 1024).toFixed(2)} KB)`);
                            fontFaceCss += b64Css + '\n';
                            loadedCount++;
                        } else {
                            console.warn(`[Local Font Loader] Font not cached, please convert first: ${font.name}`);
                            failedFonts.push(`${font.name} (not converted)`);
                        }
                    }
                } catch (error) {
                    console.error(`[Local Font Loader] ✗ 无法Loading font family ${familyOrFontName}:`, error);
                    failedFonts.push(`${familyOrFontName} (读取失败: ${error.message})`);
                }
            }

            console.log(`[Local Font Loader] @font-face CSS 总大小: ${(fontFaceCss.length / 1024 / 1024).toFixed(2)} MB`);

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
                    console.log(`[Local Font Loader] Enable Latin font separation: ${this.settings.fonts.latin} (Latin) + ${this.settings.fonts.text} (Non-Latin)`);
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

            // 数学字体（映射 MathJax 的 Unicode class 到正确的字符）
            if (this.settings.fonts.math) {
                varsCss += `/* LaTeX Math Font - 修正 MathJax CHTML 的 content */\n`;

                // 数学斜体大写字母 A-Z (U+1D434-U+1D44D)
                for (let i = 0; i < 26; i++) {
                    const mathItalicCode = 0x1D434 + i;
                    const mathItalicChar = String.fromCodePoint(mathItalicCode);
                    varsCss += `.mjx-c${mathItalicCode.toString(16).toUpperCase()}.TEX-I::before { content: "${mathItalicChar}" !important; }\n`;
                }

                // 数学斜体小写字母 a-z (U+1D44E-U+1D467)
                for (let i = 0; i < 26; i++) {
                    const mathItalicCode = 0x1D44E + i;
                    const mathItalicChar = String.fromCodePoint(mathItalicCode);
                    varsCss += `.mjx-c${mathItalicCode.toString(16).toUpperCase()}.TEX-I::before { content: "${mathItalicChar}" !important; }\n`;
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

            console.log('[Local Font Loader] ✓ Fonts applied');

        } catch (error) {
            console.error('[Local Font Loader] Apply fonts失败:', error);
        }
    }

    // Convert all fonts to Base64
    async convertAllFonts() {
        console.log('[Local Font Loader] Starting font conversion...');
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
                    console.log(`[Local Font Loader] Converting font: ${font.name} (${font.familyName || 'Unknown'} - ${variantLabel})`);

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
                    console.log(`[Local Font Loader] ✓ Converted: ${font.name} (${fontFamily} - ${variantType}, weight: ${fontWeight}, style: ${fontStyle})`);

                } catch (error) {
                    console.error(`[Local Font Loader] Conversion failed: ${font.name}`, error);
                }
            }

            await this.saveSettings();

            console.log(`[Local Font Loader] Conversion complete：${converted} newly converted，${skipped} already cached`);

        } catch (error) {
            console.error('[Local Font Loader] 批量Conversion failed:', error);
        }
    }

    arrayBufferToBase64(buffer) {
        let binary = "";
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    applyCss(css, cssId) {
        const existingStyle = document.getElementById(cssId);
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

        // 移除 <link> 标签
        document.querySelectorAll('link[data-local-font-loader]').forEach(link => link.remove());
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

            console.log(`[Local Font Loader] Cleaned ${count} cache files`);

        } catch (error) {
            console.error('[Local Font Loader] Clear Cache失败:', error);
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
    }

    display() {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'Local Font Loader' });

        // ========================================
        // Directory Configuration
        // ========================================
        containerEl.createEl('h3', { text: 'Directory Configuration' });

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
        containerEl.createEl('h3', { text: 'Font Application Settings' });

        const fontTypes = [
            { key: 'ui', name: 'UI Interface Font', desc: '侧边栏、菜单、按钮等界面元素' },
            {
                key: 'text',
                name: 'Body Text Font',
                desc: '编辑器正文内容',
                supportsLatin: true
            },
            {
                key: 'monospace',
                name: 'Code Font',
                desc: '代码块和行内代码'
            },
            {
                key: 'math',
                name: 'LaTeX Math Font',
                desc: '数学公式渲染'
            }
        ];

        for (const fontType of fontTypes) {
            new Setting(containerEl)
                .setName(fontType.name)
                .setDesc(fontType.desc)
                .addDropdown(dropdown => {
                    dropdown.addOption('', '-- 系统默认 --');

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
                        const variantCount = familyFonts.length;

                        const label = allConverted
                            ? `${familyName} ✓ (${variantCount} 变体)`
                            : `${familyName} (${variantCount} 变体)`;

                        dropdown.addOption(familyName, label);
                    });

                    dropdown.setValue(this.plugin.settings.fonts[fontType.key]);
                    dropdown.onChange(async (value) => {
                        this.plugin.settings.fonts[fontType.key] = value;
                        await this.plugin.saveSettings();
                        await this.plugin.applyFonts();

                        // 刷新界面以显示变体警告
                        this.display();
                    });
                });

            // 在设置项下方添加变体警告（使用 callout 语法）
            if (this.plugin.settings.fonts[fontType.key]) {
                const selectedFont = this.plugin.settings.fonts[fontType.key];
                const variants = this.plugin.settings.availableFonts.filter(f =>
                    (f.familyName || f.name) === selectedFont
                );

                // Text Font: 建议 4 个变体
                if (fontType.key === 'text' && variants.length > 0 && variants.length < 4) {
                    const variantList = variants.map(f => f.variantType || 'unknown').join(', ');
                    const warningCallout = containerEl.createDiv({ attr: { style: 'margin: 8px 0 16px 0;' } });

                    const warningMd = `> [!warning] 字体变体不完整
> 所选字体 "${selectedFont}" 仅有 ${variants.length} 个变体（${variantList}）。
>
> **建议**：选择包含 Regular、Italic、Bold 和 Bold Italic 四种变体的字体家族，以确保斜体和粗体正常显示。`;

                    MarkdownRenderer.render(this.app, warningMd, warningCallout, '', this);
                }

                // Monospace Font: 必须是等宽字体
                if (fontType.key === 'monospace') {
                    const infoCallout = containerEl.createDiv({ attr: { style: 'margin: 8px 0 16px 0;' } });

                    const infoMd = `> [!info] 等宽字体要求
> 代码字体必须选择等宽字体（Monospace），普通拉丁字体会导致代码对齐错乱。`;

                    MarkdownRenderer.render(this.app, infoMd, infoCallout, '', this);
                }

                // Math Font: 必须是专用数学字体
                if (fontType.key === 'math') {
                    const infoCallout = containerEl.createDiv({ attr: { style: 'margin: 8px 0 16px 0;' } });

                    const infoMd = `> [!info] 数学字体要求
> LaTeX 数学字体必须选择专用数学字体（如 Latin Modern Math、XITS Math），普通字体无法正确渲染数学符号。`;

                    MarkdownRenderer.render(this.app, infoMd, infoCallout, '', this);
                }
            }

            // 如果是Body Text Font，添加Latin字体分离选项
            if (fontType.supportsLatin) {
                this.addLatinFontOptions(containerEl);
            }
        }

        // ========================================
        // Font File Configuration
        // ========================================
        containerEl.createEl('h3', { text: 'Font File Configuration' });

        // 图例说明
        const legendEl = containerEl.createDiv({
            attr: {
                style: 'margin-bottom: 16px; padding: 12px; background: var(--background-secondary); border-radius: 8px; display: flex; gap: 16px; flex-wrap: wrap; font-size: 0.9em;'
            }
        });

        const legends = [
            { icon: 'check', color: 'var(--color-green)', text: '已转换' },
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
                text: '未Found字体家族，请确认字体文件夹结构正确',
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
            text: '导入字体',
            attr: {
                style: 'flex: 1; padding: 12px; cursor: pointer;',
                class: 'mod-cta'
            }
        });
        importBtn.addEventListener('click', async () => {
            await this.importFont();
        });

        // 转换所有字体
        const convertBtn = fontOperationsEl.createEl('button', {
            text: '转换所有字体（使其可用）',
            attr: {
                style: 'flex: 1; padding: 12px; cursor: pointer;'
            }
        });
        convertBtn.addEventListener('click', async () => {
            await this.plugin.convertAllFonts();
            this.display();
        });

        // ========================================
        // Fallback 操作
        // ========================================
        containerEl.createEl('h3', { text: 'Fallback' });

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
                    dropdown.addOption('', '-- 系统默认 --');

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
                        dropdown.addOption('', '--- 推荐的Latin字体 ---');
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
                        dropdown.addOption('', '--- 其他字体 ---');
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
                        this.display();
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

                    const warningMarkdown = `> [!warning] 缺少字体变体
> ${latinFont} 缺少以下变体：${missing.join(', ')}。缺失的样式将使用浏览器合成（效果较差）。`;

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
                { key: 'punctuation', name: 'Punctuation', desc: '.,!?;: 等常用标点' },
                { key: 'symbols', name: 'Symbols', desc: '@#$%&* 等特殊字符' }
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
                    'aria-label': '展开/收起'
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
            headerEl.addEventListener('click', () => {
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
                        title: '重新转换此字体',
                        'aria-label': '重新转换此字体'
                    }
                });
                setIcon(convertBtn, 'refresh-cw');
                convertBtn.addEventListener('click', async () => {
                    await this.convertSingleFont(font);
                    this.display();
                });

                // 删除按钮
                const deleteBtn = actionsEl.createEl('button', {
                    attr: {
                        style: 'padding: 4px 8px; cursor: pointer; display: inline-flex; align-items: center;',
                        title: '删除此字体',
                        'aria-label': '删除此字体'
                    }
                });
                setIcon(deleteBtn, 'trash-2');
                deleteBtn.addEventListener('click', async () => {
                    if (confirm(`确定要删除字体 "${font.name}" 吗？`)) {
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
            console.log(`[Local Font Loader] Converting ${font.name}...`);

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

            console.log(`[Local Font Loader] ${font.name} Conversion complete`);
            new Notice(`✓ ${font.name} Conversion complete`);
        } catch (error) {
            console.error(`[Local Font Loader] Conversion failed: ${font.name}`, error);
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
            new Notice(`✓ 已删除 ${font.name}`);
        } catch (error) {
            console.error(`[Local Font Loader] 删除失败: ${font.name}`, error);
            new Notice(`⚠️ 删除失败: ${error.message}`);
        }
    }

    // Delete Unused Fonts
    async deleteUnusedFonts() {
        const usedFonts = new Set(Object.values(this.plugin.settings.fonts).filter(f => f));

        const unusedFonts = this.plugin.settings.availableFonts.filter(
            font => !usedFonts.has(font.name)
        );

        if (unusedFonts.length === 0) {
            new Notice('没有未使用的字体');
            return;
        }

        if (!confirm(`Found ${unusedFonts.length} 个未使用的字体，确定要删除吗？\n\n${unusedFonts.map(f => f.name).join('\n')}`)) {
            return;
        }

        console.log(`[Local Font Loader] 开始Delete Unused Fonts (${unusedFonts.length} 个)...`);
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
                    console.error(`[Local Font Loader] 删除失败: ${font.name}`, error);
                }
            }

            await this.plugin.saveSettings();

            new Notice(`✓ 已删除 ${deleted} 个未使用的字体`);
            console.log(`[Local Font Loader] 已删除 ${deleted} 个未使用的字体`);

            this.display(); // 刷新界面

        } catch (error) {
            console.error('[Local Font Loader] 批量删除失败:', error);
            new Notice('⚠️ 删除字体时出错');
        }
    }

    // 导入字体
    async importFont() {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = '.ttf,.otf,.woff,.woff2';

        input.addEventListener('change', async (e) => {
            const files = e.target.files;
            if (!files || files.length === 0) return;

            console.log(`[Local Font Loader] 开始导入 ${files.length} 个字体文件...`);
            let imported = 0;

            try {
                for (const file of files) {
                    const arrayBuffer = await file.arrayBuffer();
                    const uint8Array = new Uint8Array(arrayBuffer);

                    // 默认放入 "Imported" 文件夹
                    const targetDir = `${this.plugin.settings.fontSourceDir}/Imported`;
                    const targetPath = `${targetDir}/${file.name}`;

                    // 确保目录存在
                    try {
                        await this.plugin.app.vault.adapter.mkdir(targetDir);
                    } catch (err) {
                        // 目录可能已存在
                    }

                    await this.plugin.app.vault.adapter.writeBinary(targetPath, arrayBuffer);
                    imported++;
                }

                new Notice(`✓ 已导入 ${imported} 个字体文件`);
                console.log(`[Local Font Loader] 已导入 ${imported} 个字体文件`);

                // Rescan
                await this.plugin.scanFonts();
                this.display();
            } catch (error) {
                console.error('[Local Font Loader] 导入失败:', error);
                new Notice(`⚠️ 导入失败: ${error.message}`);
            }
        });

        input.click();
    }
}


// ============================================================================
// ── 导出 ──
// ============================================================================

module.exports = LocalFontLoaderPlugin;
