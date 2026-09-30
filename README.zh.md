---
description: "AryaAI 本地 ComfyUI 图像生成与图库插件。"
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-images

[English](README.md) | 中文

## 概述

通过本地 ComfyUI 服务器，在 AryaAI WebUI 或桌面版中创建图像。选择已保存工作流可加载可编辑的提示词、画布、批量和采样器默认值；HMI 预设的底层模型仍可能是 Z-Image Turbo。即使最近历史记录已清除，也能浏览和管理 ComfyUI 输出目录中保留的图像。选择 **编辑图像** 可将输出图像用作下一次生成的输入，并控制变化程度；选择 **复用设置** 可再次文生图。需要完整的工作流编辑器时，可打开 ComfyUI。

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
- **浏览本地图像需要输出目录** — 将 `ARYAAI_COMFYUI_OUTPUT_DIR` 设为 ComfyUI 配置的输出文件夹；历史记录清理后，ComfyUI 的 HTTP 历史端点不会列出磁盘上保留的文件。

本插件只贡献两个插槽注册，不拥有可以独立分叉的权威投影，因此不发布 invariant companion。
