# 1.7.3 修复与测试记录

日期：2026-11-19。基线：`bbbc991`（1.7.2）。改动在家目录克隆仓库完成；没有部署到个人 AstroScope Vault，也没有对外发布。

## 结果

- 修复自定义数学字体的普通／拉伸大括号、尺寸变体覆盖、斜体 h 和希腊字母映射。MathJax 的尺寸变体、拼接件和根号保持原生字形与度量，避免普通字体破坏它们的几何结构。
- 只接管普通字形；共享字形数组只保存一次，切换字体／卸载后准确恢复。异步任务按代数失效，同代共享 Promise，旧任务不会解锁或覆盖新字体。
- 修复 OpenType MATH 的 GlyphPart 步长（10 字节）、TTC 表的绝对偏移，以及分数／横线／根号常量的记录错位。
- 新增默认关闭的电脑／平板／手机模式。分类信号与 Better Plugins Manager 一致：`isMobileApp`、`isTablet`。类型未分配时沿用原设备绑定；关闭后原绑定保留。未知旧移动设备不猜类型，可手动纠正，纠正值跟随 ID 迁移。
- 旧版设置页用 `display()`，新版保留声明式定义；共用刷新逻辑并保留滚动。确认弹窗使用兼容的 Obsidian Modal，危险操作默认聚焦取消。
- 校验外部设置与字体元数据，清理报告中的 unsafe assignment/member/argument/call、floating/misused Promise、createElement、无用日志和未使用变量。
- 修复删除字体文件失败后仍移除配置、关闭自动加载后残留上次样式，以及启动自动扫描可能覆盖尚未到达的同步设置。

## 旧版本调查

[插件 1.5.8](https://github.com/lmce72/obsidian-local-font-loader/releases/tag/1.5.8) 的 manifest 同样要求 Obsidian 1.13.0；直接回退到该标签不能解决旧版兼容。本次将最低 SDK 目标设为 1.5.7，并添加语言读取、设备本地存储、设置页刷新、确认弹窗与按钮样式的兼容路径。

## 已执行的检查

| 检查 | 结果 |
| --- | --- |
| `bun run check` | 类型检查、报告中对应的源码规则零告警、49 项测试通过，198 次断言 |
| `bun run check:legacy` | 使用官方 npm Obsidian 1.5.7 SDK 对全部源码检查通过；脚本结束清理临时声明文件 |
| `bun run build` | 1.7.3 构建成功，三个安装文件的版本和 ID 一致 |
| Obsidian 1.15.1 / MathJax 4.1.3 | 独立空库，8 组公式，无 `mjx-merror`；重载后普通及拉伸右大括号均可见，尺寸变体保留对应原生字体 |
| Obsidian 1.5.12 / MathJax 3.2.2 | 独立空库，插件加载、旧设置页和 8 组公式正常；h 为 U+210E，Greek 映射恢复；取消确认弹窗不删除测试预设 |
| 设备类型设置 | 默认关闭；从界面开启、选择电脑预设、重启保留、撤销类型分配及关闭模式回退均验证 |
| 自动加载关闭／卸载 | 实际重启后无字体面、无自定义度量、片段关闭；应用后立即卸载并等待异步任务，未重新注入样式 |
| 手机模拟 | Obsidian 内置移动模式，390×844 touch 视口，三类下拉有可访问名称，无横向溢出，卡片不启用拖拽 |
| 控制台 | 最终新旧应用重载后的 error/warn 检查为空 |

运行期工具使用独立 `chrome-devtools-mcp`，分别连接 19223、19371；每次连接先核对测试 Vault 绝对路径。旧版程序从官方 [1.5.12 发布包](https://github.com/obsidianmd/obsidian-releases/releases/tag/v1.5.12) 解压运行，没有安装或替换本机 Obsidian。测试后关闭独立窗口并清理两次临时环境。

## 验收截图

- [Obsidian 1.15.1 数学公式](artifacts/math-obsidian-1.15.1.png)
- [Obsidian 1.5.12 数学公式](artifacts/math-obsidian-1.5.12.png)
- [390px 手机模拟的设备分类设置](artifacts/device-mode-mobile.png)
- [运行期部分结构化记录](artifacts/runtime-results.json)

## 完整扩展审查的一项保留提示

`bun run lint:audit` 使用官方插件的完整 recommended 配置。除报告指定规则之外，它仍报 **1 项** `obsidianmd/no-forbidden-elements`：运行期创建字体面 `<style>`。这不是零告警的社区审核结果；[原始审查输出](artifacts/source-audit.json) 保留了该提示。

此处承载用户扫描得到的动态 `@font-face`，字体地址仅在当前会话有效；静态 `styles.css` 无法预先列出用户字体。继续保留独立运行期字体面，以维持弹出窗口和现有 PDF 导出克隆样式的设计，并避免把桌面会话地址同步到手机。本次将 `document.createElement` 改为所属文档的 Obsidian helper，未用规则抑制或把运行期地址写回同步片段来消除该提示。

## 验证边界

实际测试字体为 STIX Two Math；未逐一验证所有数学字体、移动端真机和 PDF 导出。1.5.7 做了官方 SDK 类型检查；旧版实际应用测试使用可公开下载的 1.5.12。数学拼接件保留原生字体，可能与用户字体存在字形风格差异。

OpenType 修复依据：[MATH / GlyphPart / MathConstants](https://learn.microsoft.com/en-us/typography/opentype/spec/math)、[Font collection 的表偏移](https://learn.microsoft.com/en-us/typography/opentype/spec/otff#the-font-collection-file-structure)。

## 本地安装产物

[local-font-loader-1.7.3.zip](artifacts/local-font-loader-1.7.3.zip) 内含 `local-font-loader/main.js`、`manifest.json`、`styles.css`。目录名必须与 manifest ID `local-font-loader` 一致。SHA-256 记录在 [build-sha256.json](artifacts/build-sha256.json)。
