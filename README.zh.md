---
description: "AryaAI 内置的本地 ComfyUI 图像生成与图库页面。"
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-images

[English](README.md) | 中文

## 概述

这个 Cordis 客户端插件在应用侧栏中贡献 **Images**，并在全局 `main` 插槽注册页面。页面通过 Host 所有的 `comfyImages` Remote 命名空间创建图像、显示生成进度和最近的 ComfyUI 历史记录、绕过浏览器 CORS 加载输出、下载结果、确认后从最近历史中删除生成结果，并把已有生成的设置恢复到编辑器中。

当 ComfyUI 只暴露一个兼容的模型配置时，页面会自动选择它并显示模型名称，不要求用户手动选择。只有存在多个兼容配置时才显示模型菜单。
工作流菜单包含 Arya 标准图和 ComfyUI 中保存的工作流；选择工作流时会应用它的步数和提示词强度默认值。

同一个插件包在 AryaAI WebUI 和 Electron 中运行。页面中的**打开 ComfyUI**操作仍可进入 ComfyUI 原生工作流编辑器；本页面提供直接的提示词生成图像流程。

## 模型体验

无，因为页面不会改变模型请求或工具，代理驱动的 ComfyUI 工作仍由内置 MCP 服务器负责。

#### KV Cache 影响

无；这个浏览器插件不会组装或发送提供商请求。

## 已知限制与延后工作

<a id="known-limitations-and-deferred-work"></a>

- **保存的工作流必须使用受支持的标准节点** — 不兼容的条目仍会列出并显示原因，且可继续在原生 ComfyUI 中使用。
- **进度只有等待或完成状态** — ComfyUI 队列进度不会以百分比或逐节点预览的形式传输。
- **尺寸菜单使用预设** — 首个版本提供方形、横向和纵向尺寸，而不是任意宽度和高度控件。
- **必须存在兼容配置** — 当 ComfyUI 既没有检查点，也没有完整的 Z-Image Turbo 拆分模型组时，页面会说明模型缺失并保持 Generate 禁用。

本插件只贡献两个插槽注册，不拥有可以独立分叉的权威投影，因此不发布 invariant companion。
