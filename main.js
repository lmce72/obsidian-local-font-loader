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
const { t, getCurrentLocale, isLatinScriptLocale } = require('./i18n');

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

            // 检测用户语言环境和Body Text Font变体
            const userLocale = getCurrentLocale();
            const isLatinUser = isLatinScriptLocale(userLocale);

            if (isLatinUser && this.settings.fonts.text) {
                const textFontName = this.settings.fonts.text;
                const textFontVariants = this.settings.availableFonts.filter(f =>
                    (f.familyName && f.familyName === textFontName) || f.name === textFontName
                );

                // 如果变体少于4个（Regular, Italic, Bold, BoldItalic），显示警告
                if (textFontVariants.length > 0 && textFontVariants.length < 4) {
                    const variantList = textFontVariants.map(f => f.subfamilyName || f.variantType || 'Unknown').join(', ');

                    // 创建确认模态框
                    const confirmed = await new Promise((resolve) => {
                        const modal = new Modal(this.app);
                        modal.titleEl.setText(t('variantWarningTitle'));

                        const bodyText = t('variantWarningBody')
                            .replace('{fontFamily}', textFontName)
                            .replace('{variantCount}', textFontVariants.length)
                            .replace('{variantList}', variantList);

                        modal.contentEl.createEl('p', { text: bodyText });

                        const buttonContainer = modal.contentEl.createDiv({ cls: 'modal-button-container' });

                        const continueBtn = buttonContainer.createEl('button', { text: t('variantWarningContinue'), cls: 'mod-cta' });
                        continueBtn.addEventListener('click', () => {
                            modal.close();
                            resolve(true);
                        });

                        const cancelBtn = buttonContainer.createEl('button', { text: t('variantWarningCancel') });
                        cancelBtn.addEventListener('click', () => {
                            modal.close();
                            resolve(false);
                        });

                        modal.open();
                    });

                    if (!confirmed) {
                        console.log('[Local Font Loader] 用户取消了字体应用（变体不足）');
                        return;
                    }
                }
            }

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
            new Notice('⚠️ Failed to apply fonts, check console');
        }
    }

    // Convert all fonts to Base64
    async convertAllFonts() {
        const notice = new Notice('Converting fonts to Base64...', 0);
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

            notice.hide();
            new Notice(`✓ Conversion complete：${converted} newly converted，${skipped} already cached`);
            console.log(`[Local Font Loader] Conversion complete：${converted} newly converted，${skipped} already cached`);

        } catch (error) {
            notice.hide();
            console.error('[Local Font Loader] 批量Conversion failed:', error);
            new Notice('⚠️ Font conversion failed, check console');
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

            new Notice(`✓ Cleaned ${count} cache files`);
            console.log(`[Local Font Loader] Cleaned ${count} cache files`);

        } catch (error) {
            console.error('[Local Font Loader] Clear Cache失败:', error);
            new Notice('⚠️ Failed to clear cache');
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
                supportsLatin: true,
                warning: '⚠️ 建议选择包含 Regular/Italic/Bold/BoldItalic 四种变体的字体家族，以确保斜体和粗体正常显示'
            },
            {
                key: 'monospace',
                name: 'Code Font',
                desc: '代码块和行内代码',
                warning: '⚠️ 必须选择等宽字体（Monospace），普通拉丁字体会导致代码对齐错乱'
            },
            {
                key: 'math',
                name: 'LaTeX Math Font',
                desc: '数学公式渲染',
                warning: '⚠️ 必须选择专用数学字体（如 Latin Modern Math, XITS Math），普通字体无法正确渲染数学符号'
            }
        ];

        for (const fontType of fontTypes) {
            // 如果有警告信息，先显示警告框
            if (fontType.warning) {
                const warningEl = containerEl.createDiv({
                    attr: {
                        style: 'margin: 12px 0 8px 0; padding: 10px 12px; background: var(--background-modifier-error-hover); border-left: 3px solid var(--text-error); border-radius: 4px; font-size: 0.9em; color: var(--text-normal);'
                    }
                });
                warningEl.createSpan({ text: fontType.warning });
            }

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

                        // 如果是Body Text Font且启用了Latin字体分离，刷新界面
                        if (fontType.key === 'text' && this.plugin.settings.latinFontEnabled) {
                            this.display();
                        }
                    });
                });

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

                        // 检查变体完整性
                        if (value) {
                            const selectedFonts = this.plugin.settings.availableFonts.filter(f =>
                                (f.familyName || f.name) === value
                            );
                            const hasItalic = selectedFonts.some(f => f.variantType === 'italic');
                            const hasBold = selectedFonts.some(f => f.variantType === 'bold');
                            const hasBoldItalic = selectedFonts.some(f => f.variantType === 'bolditalic');

                            const missing = [];
                            if (!hasItalic) missing.push('Italic');
                            if (!hasBold) missing.push('Bold');
                            if (!hasBoldItalic) missing.push('Bold Italic');

                            if (missing.length > 0) {
                                // Callout: Warning
                                setTimeout(() => {
                                    const warningCalloutEl = containerEl.createDiv({
                                        attr: { style: 'margin: 16px 0;' }
                                    });

                                    const warningMarkdown = `> [!warning] 缺少字体变体
> ${value} 缺少以下变体：${missing.join(', ')}。缺失的样式将使用浏览器合成（效果较差）。`;

                                    MarkdownRenderer.render(
                                        this.app,
                                        warningMarkdown,
                                        warningCalloutEl,
                                        '',
                                        this
                                    );
                                }, 100);
                            }
                        }

                        await this.plugin.saveSettings();
                        await this.plugin.applyFonts();
                    });
                });

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
            const notice = new Notice(`正在转换 ${font.name}...`, 0);

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

            notice.hide();
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

        const notice = new Notice('正在Delete Unused Fonts...', 0);
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

            notice.hide();
            new Notice(`✓ 已删除 ${deleted} 个未使用的字体`);
            console.log(`[Local Font Loader] 已删除 ${deleted} 个未使用的字体`);

            this.display(); // 刷新界面

        } catch (error) {
            notice.hide();
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

            const notice = new Notice('正在导入字体文件...', 0);
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

                notice.hide();
                new Notice(`✓ 已导入 ${imported} 个字体文件`);

                // Rescan
                await this.plugin.scanFonts();
                this.display();
            } catch (error) {
                notice.hide();
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
