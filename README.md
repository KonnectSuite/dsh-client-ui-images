---
description: "AryaAI Images plugin for local ComfyUI generation and gallery browsing."
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-images

English | [中文](README.zh.md)

## Summary

Create images in AryaAI WebUI or Desktop with a local ComfyUI server. Choose a saved workflow to load its editable prompt, canvas, batch, and sampler defaults; HMI presets may still use Z-Image Turbo underneath. Browse and manage images retained in ComfyUI's output folder even after its recent history is cleared. Select **Edit image** to reuse an output as the next image input and control how much it changes, or **Reuse settings** for another text-to-image run. Open ComfyUI when you need its full workflow editor.

## Model Experience

None, as the page does not change model requests or tools and agent-driven ComfyUI work remains in the bundled MCP server.

#### KV Cache effect

None; this browser plugin never assembles or sends provider requests.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- **Saved workflows must use supported standard nodes** — incompatible entries remain listed with their reason and continue to work in native ComfyUI.
- **Progress is pending or complete** — ComfyUI queue progress is not streamed as a percentage or node-by-node preview.
- **The size menu is preset-based** — the first version offers square, landscape, and portrait dimensions instead of arbitrary width and height controls.
- **A compatible configuration is required** — when neither a checkpoint nor a complete Z-Image Turbo split-model set is present, the page explains the missing model and keeps Generate disabled.
- **Local browsing needs an output directory** — set `ARYAAI_COMFYUI_OUTPUT_DIR` to ComfyUI's configured output folder; ComfyUI's HTTP history endpoint does not enumerate files left on disk after history is pruned.

No invariant companion is published because this plugin contributes two slot
registrations and owns no independent authoritative projection.
