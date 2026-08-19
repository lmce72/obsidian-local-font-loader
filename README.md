# Obsidian Local Font Loader

[English](#english) | [简体中文](#简体中文) | [日本語](#日本語) | [한국어](#한국어) | [Español](#español)

---

## English

### Overview

**Obsidian Local Font Loader** is a powerful plugin for [Obsidian](https://obsidian.md) that allows you to load and manage custom fonts directly from your local vault. Say goodbye to relying on external CDNs or system fonts — keep everything local, private, and under your control.

### Features

- **📁 Local Font Management**: Load TTF, OTF, WOFF, and WOFF2 fonts from your vault
- **🎨 Font Categories**: Separate control for UI, body text, code blocks, and LaTeX math
- **⚡ Base64 Caching**: Optimized font loading with automatic Base64 conversion and caching
- **🌍 Latin Font Separation**: Use different fonts for Latin and CJK characters with fine-grained unicode-range control
- **🔄 Font Family Support**: Automatically detects and groups Regular, Italic, Bold, and Bold Italic variants
- **⚙️ Full-Featured Settings**: Intuitive UI for font scanning, conversion, and application
- **🚀 Auto-load on Startup**: Optionally apply your font configuration when Obsidian launches

### Installation

#### Manual Installation

1. Download the latest release from [Releases](../../releases)
2. Extract `main.js`, `manifest.json`, and `styles.css` to your vault's plugins folder:
   ```
   <vault>/.obsidian/plugins/obsidian-local-font-loader/
   ```
3. Reload Obsidian or enable the plugin in Settings → Community plugins

#### From Obsidian Community Plugins (Coming Soon)

Search for "Local Font Loader" in Obsidian's Community Plugins browser.

### Usage

1. **Organize Your Fonts**: Create a folder in your vault (e.g., `Fonts/`) and organize fonts by family:
   ```
   Fonts/
   ├── MyFont/
   │   ├── MyFont-Regular.ttf
   │   ├── MyFont-Bold.ttf
   │   ├── MyFont-Italic.ttf
   │   └── MyFont-BoldItalic.ttf
   └── AnotherFont/
       └── AnotherFont-Regular.otf
   ```

2. **Configure Plugin**: Open Settings → Local Font Loader
   - Set your font source directory
   - Click "Rescan" to detect all fonts

3. **Convert Fonts**: Click "Convert All Fonts to Base64" to generate cached CSS

4. **Apply Fonts**: 
   - Select fonts for each category (UI, Text, Code, Math)
   - Click "Apply Fonts"
   - Your fonts are now active!

### Configuration

| Setting | Description |
|---------|-------------|
| **Font Source Directory** | Path to your font families folder |
| **Base64 Cache Directory** | Where converted CSS files are stored |
| **Auto-load on Startup** | Automatically apply fonts when Obsidian starts |
| **Latin Font Separation** | Use separate fonts for Latin vs CJK characters |
| **Latin Font Scope** | Fine-tune which character ranges use the Latin font |

### Requirements

- Obsidian v1.0.0 or higher
- Font files in TTF, OTF, WOFF, or WOFF2 format

### License

This project is licensed under the [MIT License](LICENSE).

### Author

**CoreVortex**

### Acknowledgments

This plugin was developed with the assistance of **Claude** (Anthropic), an AI assistant that helped with architecture design, code implementation, and documentation. The project represents a collaborative effort between human requirements and AI technical execution.

### Support

If you encounter any issues or have feature requests, please [open an issue](../../issues).

---

## 简体中文

### 概述

**Obsidian 本地字体加载器** 是一个强大的 [Obsidian](https://obsidian.md) 插件，允许你直接从本地仓库加载和管理自定义字体。不再依赖外部 CDN 或系统字体——所有内容都保持本地化、私密化并完全由你掌控。

### 功能特性

- **📁 本地字体管理**: 从仓库加载 TTF、OTF、WOFF 和 WOFF2 字体
- **🎨 字体分类**: 分别控制界面、正文、代码块和 LaTeX 数学公式字体
- **⚡ Base64 缓存**: 自动转换和缓存字体以优化加载速度
- **🌍 拉丁字体分离**: 为拉丁字符和 CJK 字符使用不同字体，支持精细的 unicode-range 控制
- **🔄 字体家族支持**: 自动检测并分组 Regular、Italic、Bold 和 Bold Italic 变体
- **⚙️ 完整设置界面**: 直观的字体扫描、转换和应用 UI
- **🚀 启动时自动加载**: 可选在 Obsidian 启动时自动应用字体配置

### 安装

#### 手动安装

1. 从 [Releases](../../releases) 下载最新版本
2. 将 `main.js`、`manifest.json` 和 `styles.css` 解压到仓库的插件文件夹：
   ```
   <仓库>/.obsidian/plugins/obsidian-local-font-loader/
   ```
3. 重新加载 Obsidian 或在 设置 → 第三方插件 中启用插件

#### 从 Obsidian 社区插件安装（即将推出）

在 Obsidian 社区插件浏览器中搜索"Local Font Loader"。

### 使用方法

1. **整理字体**: 在仓库中创建文件夹（如 `Fonts/`），按字体家族组织：
   ```
   Fonts/
   ├── MyFont/
   │   ├── MyFont-Regular.ttf
   │   ├── MyFont-Bold.ttf
   │   ├── MyFont-Italic.ttf
   │   └── MyFont-BoldItalic.ttf
   └── AnotherFont/
       └── AnotherFont-Regular.otf
   ```

2. **配置插件**: 打开 设置 → 本地字体加载器
   - 设置字体源目录
   - 点击"重新扫描"检测所有字体

3. **转换字体**: 点击"转换所有字体为 Base64"生成缓存 CSS

4. **应用字体**: 
   - 为每个类别选择字体（界面、正文、代码、数学）
   - 点击"应用字体"
   - 字体现已生效！

### 配置选项

| 设置项 | 说明 |
|--------|------|
| **字体源目录** | 字体家族文件夹的路径 |
| **Base64 缓存目录** | 转换后 CSS 文件的存储位置 |
| **启动时自动加载** | Obsidian 启动时自动应用字体 |
| **拉丁字体分离** | 为拉丁字符和 CJK 字符使用不同字体 |
| **拉丁字体作用范围** | 精细调整哪些字符范围使用拉丁字体 |

### 系统要求

- Obsidian v1.0.0 或更高版本
- TTF、OTF、WOFF 或 WOFF2 格式的字体文件

### 许可证

本项目采用 [MIT 许可证](LICENSE)。

### 作者

**CoreVortex**

### 致谢

本插件在 **Claude**（Anthropic）的协助下开发完成，Claude 参与了架构设计、代码实现和文档编写。本项目代表了人类需求与 AI 技术执行的协作成果。

### 支持

如遇到问题或有功能需求，请[提交 issue](../../issues)。

---

## 日本語

### 概要

**Obsidian ローカルフォントローダー** は、[Obsidian](https://obsidian.md) 用の強力なプラグインで、ローカル Vault から直接カスタムフォントを読み込んで管理できます。外部 CDN やシステムフォントに依存する必要はありません。すべてをローカルでプライベートに、完全にコントロールできます。

### 機能

- **📁 ローカルフォント管理**: Vault から TTF、OTF、WOFF、WOFF2 フォントを読み込み
- **🎨 フォントカテゴリ**: UI、本文、コードブロック、LaTeX 数式を個別に制御
- **⚡ Base64 キャッシング**: 自動 Base64 変換とキャッシングによる最適化
- **🌍 ラテン文字フォント分離**: ラテン文字と CJK 文字に異なるフォントを使用、詳細な unicode-range 制御
- **🔄 フォントファミリーサポート**: Regular、Italic、Bold、Bold Italic バリアントを自動検出・グループ化
- **⚙️ フル機能設定**: 直感的なフォントスキャン、変換、適用 UI
- **🚀 起動時自動読み込み**: Obsidian 起動時にフォント設定を自動適用（オプション）

### インストール

#### 手動インストール

1. [Releases](../../releases) から最新版をダウンロード
2. `main.js`、`manifest.json`、`styles.css` を Vault のプラグインフォルダに展開：
   ```
   <vault>/.obsidian/plugins/obsidian-local-font-loader/
   ```
3. Obsidian を再読み込みするか、設定 → コミュニティプラグイン でプラグインを有効化

#### Obsidian コミュニティプラグインから（近日公開）

Obsidian のコミュニティプラグインブラウザで「Local Font Loader」を検索。

### 使用方法

1. **フォントを整理**: Vault 内にフォルダ（例：`Fonts/`）を作成し、ファミリーごとに整理：
   ```
   Fonts/
   ├── MyFont/
   │   ├── MyFont-Regular.ttf
   │   ├── MyFont-Bold.ttf
   │   ├── MyFont-Italic.ttf
   │   └── MyFont-BoldItalic.ttf
   └── AnotherFont/
       └── AnotherFont-Regular.otf
   ```

2. **プラグインを設定**: 設定 → Local Font Loader を開く
   - フォントソースディレクトリを設定
   - 「再スキャン」をクリックしてすべてのフォントを検出

3. **フォントを変換**: 「すべてのフォントを Base64 に変換」をクリックしてキャッシュ CSS を生成

4. **フォントを適用**: 
   - 各カテゴリ（UI、テキスト、コード、数式）にフォントを選択
   - 「フォントを適用」をクリック
   - フォントが有効になりました！

### 設定

| 設定項目 | 説明 |
|---------|------|
| **フォントソースディレクトリ** | フォントファミリーフォルダのパス |
| **Base64 キャッシュディレクトリ** | 変換された CSS ファイルの保存場所 |
| **起動時に自動読み込み** | Obsidian 起動時にフォントを自動適用 |
| **ラテン文字フォント分離** | ラテン文字と CJK 文字に異なるフォントを使用 |
| **ラテン文字フォントスコープ** | どの文字範囲にラテン文字フォントを使用するかを微調整 |

### 動作要件

- Obsidian v1.0.0 以上
- TTF、OTF、WOFF、または WOFF2 形式のフォントファイル

### ライセンス

このプロジェクトは [MIT ライセンス](LICENSE) の下で公開されています。

### 作者

**CoreVortex**

### 謝辞

このプラグインは **Claude**（Anthropic）の支援を受けて開発されました。Claude はアーキテクチャ設計、コード実装、ドキュメント作成に貢献しました。本プロジェクトは人間の要求と AI の技術実行の協力の成果を表しています。

### サポート

問題が発生した場合や機能リクエストがある場合は、[issue を開いてください](../../issues)。

---

## 한국어

### 개요

**Obsidian 로컬 폰트 로더**는 로컬 보관함에서 직접 커스텀 폰트를 로드하고 관리할 수 있는 강력한 [Obsidian](https://obsidian.md) 플러그인입니다. 외부 CDN이나 시스템 폰트에 의존할 필요 없이 모든 것을 로컬에서 비공개로 완전히 제어할 수 있습니다.

### 기능

- **📁 로컬 폰트 관리**: 보관함에서 TTF, OTF, WOFF, WOFF2 폰트 로드
- **🎨 폰트 카테고리**: UI, 본문 텍스트, 코드 블록, LaTeX 수식을 개별 제어
- **⚡ Base64 캐싱**: 자동 Base64 변환 및 캐싱으로 최적화된 폰트 로딩
- **🌍 라틴 폰트 분리**: 라틴 문자와 CJK 문자에 다른 폰트 사용, 세밀한 unicode-range 제어
- **🔄 폰트 패밀리 지원**: Regular, Italic, Bold, Bold Italic 변형 자동 감지 및 그룹화
- **⚙️ 완전한 설정 기능**: 직관적인 폰트 스캔, 변환, 적용 UI
- **🚀 시작 시 자동 로드**: Obsidian 시작 시 폰트 설정 자동 적용(선택 사항)

### 설치

#### 수동 설치

1. [Releases](../../releases)에서 최신 버전 다운로드
2. `main.js`, `manifest.json`, `styles.css`를 보관함의 플러그인 폴더에 압축 해제:
   ```
   <vault>/.obsidian/plugins/obsidian-local-font-loader/
   ```
3. Obsidian을 다시 로드하거나 설정 → 커뮤니티 플러그인에서 플러그인 활성화

#### Obsidian 커뮤니티 플러그인에서 (곧 출시)

Obsidian 커뮤니티 플러그인 브라우저에서 "Local Font Loader" 검색.

### 사용법

1. **폰트 정리**: 보관함에 폴더(예: `Fonts/`)를 만들고 패밀리별로 정리:
   ```
   Fonts/
   ├── MyFont/
   │   ├── MyFont-Regular.ttf
   │   ├── MyFont-Bold.ttf
   │   ├── MyFont-Italic.ttf
   │   └── MyFont-BoldItalic.ttf
   └── AnotherFont/
       └── AnotherFont-Regular.otf
   ```

2. **플러그인 구성**: 설정 → Local Font Loader 열기
   - 폰트 소스 디렉토리 설정
   - "재스캔"을 클릭하여 모든 폰트 감지

3. **폰트 변환**: "모든 폰트를 Base64로 변환"을 클릭하여 캐시된 CSS 생성

4. **폰트 적용**: 
   - 각 카테고리(UI, 텍스트, 코드, 수식)에 대한 폰트 선택
   - "폰트 적용" 클릭
   - 이제 폰트가 활성화되었습니다!

### 구성

| 설정 | 설명 |
|-----|------|
| **폰트 소스 디렉토리** | 폰트 패밀리 폴더 경로 |
| **Base64 캐시 디렉토리** | 변환된 CSS 파일 저장 위치 |
| **시작 시 자동 로드** | Obsidian 시작 시 폰트 자동 적용 |
| **라틴 폰트 분리** | 라틴 문자와 CJK 문자에 다른 폰트 사용 |
| **라틴 폰트 범위** | 라틴 폰트를 사용할 문자 범위 세밀 조정 |

### 요구 사항

- Obsidian v1.0.0 이상
- TTF, OTF, WOFF 또는 WOFF2 형식의 폰트 파일

### 라이선스

이 프로젝트는 [MIT 라이선스](LICENSE)에 따라 라이선스가 부여됩니다.

### 작성자

**CoreVortex**

### 감사의 말

이 플러그인은 **Claude**(Anthropic)의 지원을 받아 개발되었습니다. Claude는 아키텍처 설계, 코드 구현 및 문서 작성에 기여했습니다. 이 프로젝트는 인간의 요구 사항과 AI 기술 실행의 협력 결과를 나타냅니다.

### 지원

문제가 발생하거나 기능 요청이 있는 경우 [issue를 열어주세요](../../issues).

---

## Español

### Descripción General

**Obsidian Local Font Loader** es un potente complemento para [Obsidian](https://obsidian.md) que te permite cargar y administrar fuentes personalizadas directamente desde tu bóveda local. Olvídate de depender de CDNs externos o fuentes del sistema: mantén todo local, privado y bajo tu control.

### Características

- **📁 Gestión de Fuentes Locales**: Carga fuentes TTF, OTF, WOFF y WOFF2 desde tu bóveda
- **🎨 Categorías de Fuentes**: Control separado para UI, texto del cuerpo, bloques de código y matemáticas LaTeX
- **⚡ Caché Base64**: Carga de fuentes optimizada con conversión y almacenamiento en caché automático Base64
- **🌍 Separación de Fuentes Latinas**: Usa diferentes fuentes para caracteres latinos y CJK con control detallado de unicode-range
- **🔄 Soporte de Familias de Fuentes**: Detecta y agrupa automáticamente variantes Regular, Italic, Bold y Bold Italic
- **⚙️ Configuración Completa**: UI intuitiva para escaneo, conversión y aplicación de fuentes
- **🚀 Carga Automática al Inicio**: Opcionalmente aplica tu configuración de fuentes cuando se inicia Obsidian

### Instalación

#### Instalación Manual

1. Descarga la última versión desde [Releases](../../releases)
2. Extrae `main.js`, `manifest.json` y `styles.css` a la carpeta de complementos de tu bóveda:
   ```
   <bóveda>/.obsidian/plugins/obsidian-local-font-loader/
   ```
3. Recarga Obsidian o habilita el complemento en Configuración → Complementos de la comunidad

#### Desde los Complementos de la Comunidad de Obsidian (Próximamente)

Busca "Local Font Loader" en el navegador de complementos de la comunidad de Obsidian.

### Uso

1. **Organiza tus Fuentes**: Crea una carpeta en tu bóveda (por ejemplo, `Fonts/`) y organiza las fuentes por familia:
   ```
   Fonts/
   ├── MyFont/
   │   ├── MyFont-Regular.ttf
   │   ├── MyFont-Bold.ttf
   │   ├── MyFont-Italic.ttf
   │   └── MyFont-BoldItalic.ttf
   └── AnotherFont/
       └── AnotherFont-Regular.otf
   ```

2. **Configurar Complemento**: Abre Configuración → Local Font Loader
   - Establece tu directorio de origen de fuentes
   - Haz clic en "Reescanear" para detectar todas las fuentes

3. **Convertir Fuentes**: Haz clic en "Convertir Todas las Fuentes a Base64" para generar CSS en caché

4. **Aplicar Fuentes**: 
   - Selecciona fuentes para cada categoría (UI, Texto, Código, Matemáticas)
   - Haz clic en "Aplicar Fuentes"
   - ¡Tus fuentes ya están activas!

### Configuración

| Ajuste | Descripción |
|--------|-------------|
| **Directorio de Origen de Fuentes** | Ruta a tu carpeta de familias de fuentes |
| **Directorio de Caché Base64** | Donde se almacenan los archivos CSS convertidos |
| **Carga Automática al Inicio** | Aplica automáticamente las fuentes cuando se inicia Obsidian |
| **Separación de Fuentes Latinas** | Usa fuentes separadas para caracteres latinos vs CJK |
| **Ámbito de Fuente Latina** | Ajusta qué rangos de caracteres usan la fuente latina |

### Requisitos

- Obsidian v1.0.0 o superior
- Archivos de fuentes en formato TTF, OTF, WOFF o WOFF2

### Licencia

Este proyecto está licenciado bajo la [Licencia MIT](LICENSE).

### Autor

**CoreVortex**

### Agradecimientos

Este plugin fue desarrollado con la asistencia de **Claude** (Anthropic), un asistente de IA que ayudó con el diseño de arquitectura, implementación de código y documentación. El proyecto representa un esfuerzo colaborativo entre requisitos humanos y ejecución técnica de IA.

### Soporte

Si encuentras algún problema o tienes solicitudes de funciones, por favor [abre un issue](../../issues).
