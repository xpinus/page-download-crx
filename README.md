# 网页下载器 (Page Download)

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

浏览器扩展插件，基于 Manifest V3 开发，在 DevTools 面板中一键捕获并打包下载当前网页的全部资源（HTML、CSS、JS、图片、视频、音频、字体等）。

> 本扩展替代了基于 [Manifest V2](https://blog.chromium.org/2024/05/manifest-v2-phase-out-begins.html) 的[梦想网页资源下载器](https://github.com/ryanker/dream_downloads)，后者因 Chrome 淘汰 V2 已无法在新版浏览器中使用。

## 功能

- **全量资源捕获** — 自动抓取当前页面所有网络请求，支持去重
- **多维筛选** — 按请求方法（GET/POST/…）、主机域名、资源分类（图片/视频/音频/样式/脚本/文档等）快速过滤
- **大文件直链** — 超过阈值的视频/音频自动走直链下载，避免内存不足（阈值可配置，默认 20 MB）
- **ZIP 打包** — 选中资源一键打包为 ZIP，保留目录结构
- **可配置列** — 方法列、主机列、分类列可按需显隐
- **加载日志** — 可选导出下载日志，记录每个资源的处理状态

## 安装

### Edge

[点击前往 Edge 扩展添加](https://microsoftedge.microsoft.com/addons/detail/jfgodnlhpaamkoejbnmmjcpcpgkogeml)

### Chrome
1. 从 [Releases](https://github.com/xpinus/page-download-crx/releases) 下载最新 page-download-crx.zip 并解压
2. 打开 chrome://extensions，开启「开发者模式」
3. 点击「加载已解压的扩展程序」，选择解压后的 dist 目录

## 使用

1. 打开任意网页，按 F12 打开开发者工具
2. 切换到 **PageDownloader** 选项卡
3. 点击 **开始加载** 捕获页面资源
4. 勾选需要下载的资源，支持表头筛选
5. 点击 **下载** 打包导出

## 开发

```bash
pnpm install
pnpm dev
pnpm build
```

构建产物在 dist/ 目录，可直接加载为 Chrome 扩展。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3 + TypeScript |
| 构建 | Vite 7 |
| UI | Element Plus + Tailwind CSS v4 |
| 打包 | JSZip |
| 包管理 | pnpm |

## 项目结构

```
src/
├── App.vue                  # DevTools 面板主界面
├── components/
│   ├── ConfigDialog.vue     # 设置对话框
│   └── SvgIcon.vue          # SVG 图标组件
├── hooks/
│   ├── useConfig.ts         # 配置管理（chrome.storage）
│   └── usePanel.ts          # 核心逻辑（抓包、筛选、下载）
├── types/index.d.ts         # 类型定义
└── utils.ts                 # 工具函数（分类、打包、格式化）
public/
├── manifest.json            # 扩展清单
├── popup.html               # 工具栏弹窗
├── devtools.html / .js      # DevTools 面板入口
└── *.png                    # 扩展图标
```

## License

[MIT](./LICENSE)
