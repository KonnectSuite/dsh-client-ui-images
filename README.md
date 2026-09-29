---
description: "AryaAI's built-in Images page for local ComfyUI generation and gallery browsing."
kind: "package-reference"
---
<!-- MIRROR NOTICE - added by the mirror, not part of the package. -->

> ### This repository is a mirror, not a standalone build
>
> `@deepseek-ai/dsh-client-ui-images` is a plugin for **AryaAI**, a DeepSeek Harness fork. Its source
> depends on `@deepseek-ai/dsh-*` core packages at workspace version `0.1.7-rc.2`
> through `workspace:*`, and those versions are not published. The releases on npm
> are older (`0.0.1-rc.1`), so `pnpm install` and a build **will not work** in a
> fresh clone of this repository.
>
> To work on it, place this package into an AryaAI checkout at `packages/client/ui-images`.
> This mirror exists so the source and its built output are versioned and reviewable
> in one place.
>
> The built output under `lib/` is committed for reference. It was produced inside
> the AryaAI workspace at `0.1.7-rc.2`.

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
