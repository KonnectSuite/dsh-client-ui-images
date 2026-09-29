---
description: "AryaAI's built-in Images page for local ComfyUI generation and gallery browsing."
kind: "package-reference"
---
<!-- MIRROR NOTICE - added by the mirror, not part of the package. -->

> ### Mirror of an AryaAI plugin package
>
> `@deepseek-ai/dsh-client-ui-images` is a plugin for **AryaAI**, a DeepSeek Harness fork. This repository holds
> the package's source and its built output as they stand in the AryaAI workspace at
> `0.1.7-rc.2`.
>
> Its dependencies are published. `@deepseek-ai/dsh-*` at `0.1.7-rc.2` is on npm,
> so a standalone build is possible once the manifest declares them. **Pin the
> version**: the `latest` dist-tag points at an older release (`0.0.1-rc.1`), so
> an unpinned `npm install @deepseek-ai/dsh-tools` resolves to a much older API.
>
> In the monorepo this package lives at `packages/client/ui-images`.

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
The workflow menu includes Arya's standard graph and saved ComfyUI workflows;
selecting one applies that workflow's steps and prompt-strength defaults.

The same plugin bundle runs in AryaAI WebUI and Electron. The page's **Open
ComfyUI** action remains the path to ComfyUI's native workflow editor, while
this page provides the direct prompt-to-image path.

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

No invariant companion is published because this plugin contributes two slot
registrations and owns no independent authoritative projection.
