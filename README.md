---
description: "AryaAI Images plugin for local ComfyUI generation and gallery browsing."
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-images

English | [中文](README.zh.md)

## Summary

This Cordis Client plugin contributes **Images** to the application sidebar and
registers its page in the global `main` slot. The page creates images through
the Host-owned `comfyImages` Remote namespace, shows generation progress and
recent ComfyUI history, loads output bytes without browser CORS, downloads
results, deletes generations from recent ComfyUI history after confirmation,
and restores a generation's settings into the composer.

When ComfyUI exposes one compatible model configuration, the page selects it
automatically and shows its name instead of requiring a model choice. A model
menu appears only when more than one compatible configuration is available.
The workflow menu includes Arya's standard graph and saved ComfyUI workflows; selecting a saved workflow loads its editable starter prompt, canvas size, batch size, steps, and prompt-strength defaults. A saved HMI workflow can still use Z-Image Turbo as its underlying model.

The Local images tab browses ComfyUI's configured output directory independently of recent history, with pagination, download, image-to-image editing, and confirmed file deletion. Recent runs retain their settings and history actions. Edit image loads the chosen output as the initial latent and exposes change strength; Reuse settings remains text-to-image.

The same plugin bundle runs in AryaAI WebUI and Electron. The page's **Open
ComfyUI** action remains the path to ComfyUI's native workflow editor, while
this page provides the direct prompt-to-image path.

The Images sidebar entry uses a photo glyph.

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
