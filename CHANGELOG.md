# Changelog

## [1.1.0] - 2026-08-21

### 主要更新

#### 🚀 新增功能

1. **字体导入优化**
   - 替换浏览器原生文件选择器为 Obsidian Modal 弹窗
   - 支持拖拽导入字体文件
   - 支持点击选择文件（在 Modal 内部触发，避免用户激活限制）
   - 更好的视觉反馈和用户体验

2. **防抖机制**
   - 新增 `_debouncedDisplay()` 方法（300ms 延迟）
   - 避免短时间内多次刷新界面导致抖动
   - 优化按钮交互体验

3. **多语言支持增强**
   - 新增 `importing`（导入中...）翻译键
   - 新增 `importError`（导入失败）翻译键
   - 支持 5 种语言：英文、中文、日文、韩文、西班牙文

#### 🔧 技术改进

1. **代码架构优化**
   - 新增 `FontImportModal` 类（继承自 Obsidian Modal）
   - 新增 `importFontsFromFiles()` 辅助方法
   - 移除旧的 `importFont()` 方法（异步上下文调用导致错误）

2. **文件组织**
   - 将导入逻辑从 UI 层分离到 Plugin 层
   - 统一文件处理流程

3. **错误处理增强**
   - 完善错误捕获和日志输出
   - 优雅降级处理

#### 🐛 Bug 修复

1. **文件选择器用户激活错误**
   - 问题：浏览器报错 "File chooser dialog can only be shown with a user activation"
   - 原因：在异步上下文中调用 `input.click()` 导致用户激活丢失
   - 解决：使用 Obsidian Modal 弹窗方案，完全避免浏览器限制

2. **界面抖动问题**
   - 问题：点击导入、转换、重新扫描按钮后页面跳动
   - 原因：所有按钮都调用 `this.display()` 重新渲染整个页面
   - 解决：实现防抖机制，短时间内多次调用只执行最后一次

3. **重复方法清理**
   - 删除旧的异步 `importFont()` 方法
   - 统一使用新的模块化导入流程

### 技术细节

#### 新增文件
- `FontImportModal` 类（约 120 行）
- `importFontsFromFiles()` 方法（约 30 行）

#### 修改统计
- **新增**：约 300 行代码
- **删除**：约 50 行旧代码
- **修改**：约 20 处调用点

#### 核心改动
1. `FontImportModal` 类（main.js Line 2595+）
2. `importFontsFromFiles()` 方法（main.js Line 1611+）
3. 防抖机制（main.js Line 2637-2666）
4. 导入按钮重构（main.js Line 3860+）
5. 翻译键补充（5 种语言）

### 兼容性

- ✅ 向后兼容现有配置
- ✅ 支持桌面端和移动端
- ✅ Obsidian 最低版本：0.15.0

### 已知问题

无

### 升级说明

1. 更新插件文件（main.js、manifest.json）
2. 在 Obsidian 中重新加载插件
3. 测试导入字体功能（点击"导入字体"按钮应弹出拖拽窗口）

### 贡献者

- CoreVortex (@corevortex)

---

## [1.0.0] - 2026-08-20

初始版本发布
