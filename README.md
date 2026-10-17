---
description: "Dedicated image conversations using a profile-installed community image plugin."
kind: "package-bundle"
---

# @deepseek-ai/dsh-client-ui-images

English | [中文](README.zh.md)

## Summary

Create images and videos in a dedicated Content conversation. Image creation and editing use the configured dsh-image-gen provider; video creation uses installed ComfyUI workflows. Add saved media to chat, attach several files together, or drag references into the composer before sending. Content preserves existing saved conversations and uses the same composer, approvals, and output cards as workspace chat.

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)

## Use this package

Open Content. If dsh-image-gen is unavailable, open Plugins, install dsh-image-gen@latest, enable it, and configure its provider. Return to Content and select Refresh. The plugin owns generation settings and media presentation; the dedicated page does not inspect ComfyUI workflows or choose models for you.

New content conversation creates or selects an empty durable session without submitting a generation. Conversations can be reopened, archived, restored, and exported. New sessions use Content mode and the profile's default model, retaining the active main conversation's working directory. They do not copy its selected model; a workspace chat using an API model does not redirect new Content chats to that API. New Content conversations select Full Access through the logged permission command before accepting input. The ui-images permissionPreset configuration changes that default; existing conversations keep their permissions. The ui-images agentPreset configuration selects their composition (default content); it does not change the workspace-chat default. Saved conversations keep their original preset, so start a new image conversation to use Content mode. Existing session logs and browser-local room navigation remain intact.

Studio places the conversation beside the reusable media library; Library expands the gallery without closing the composer or clearing its draft. Creative idea cards fill an empty composer with an editable brief and never submit a request or replace an existing draft. Search filters loaded filenames and recent-run prompts; image and video filters narrow the visible selection. Use Select to attach multiple files, download a ZIP, or confirm a bulk deletion. Failed deletions retain their files and selection. Expand the engine status to view connection settings and start, stop, or restart progress. Image chat and reference-edit actions are unavailable until the local server is running; saved conversations, local photos, downloads, and selections remain accessible. Availability checks run every serverStatusPollIntervalMs (default 10000 ms, minimum 1000 ms).

## Understand the implementation

<details>
<summary>Implementation internals — click to expand</summary>

CommunityImagesPanel checks the profile bundle list and renders the resident Conversation factory, including its standard composer. No workflow catalog or authored generation instruction is added to new requests. The image plugin supplies its normal tools and client cards through the existing registrations. The default Web composition disables Arya's legacy images_generate tool to avoid competing generation routes. Historical Images prompt formatting remains readable without rewriting persisted logs.

Use Add to chat on a saved image or video, select several files to attach together, or drag gallery media into the conversation. These actions populate the resident composer without submitting a request; review the attachments and describe the edit or reference use before sending. Images are visual inputs; videos are attached files and do not imply that the selected model can watch them.

Content mode includes installed video-workflow discovery, text-to-video and image-to-video creation, scene timing, Director prompt segments, job-status lookup and film assembly. Reference animation stages one selected conversation image into ComfyUI. The production tool saves brief and storyboard revisions for later edits. Film assembly supports trims, transitions, scene audio and optional selectable captions. Automatic video understanding and uploaded-video staging are not provided. See [production tools](../../api/tool-images/README.md#understand-the-implementation) for their configuration and limits.

The legacy direct-generation components and controller remain source-owned for compatibility; the page retains Recent runs and the local library in the Studio and Library views but does not mount the Advanced form. The legacy autoPreview setting does not choose a generation backend for this page.

</details>

## Model Experience

### Image conversation

#### What the model sees

The user's ordinary chat request and attachments submitted through `conversation.content`, together with the configured profile's tools and video catalog/results requested by those tools. The installed community plugin owns its tool instructions and generation results.

#### Token effect

This page adds no workflow catalog or generation instruction to the user request.

#### KV Cache effect

Requests use the standard conversation prefix; this page adds no changing workflow catalog.

## Known Limitations and Deferred Work

- Plugin installation and provider setup are required. Bundle enablement does not establish valid credentials or provider availability; tool failures remain visible in chat.
- Generation speed, fidelity, and available models depend on the configured image provider. Reusing the plugin does not guarantee another service's image quality.
- Refresh rechecks plugin availability. The page does not silently install, upgrade, or bundle third-party code.
- Legacy direct-generation history remains in saved sessions; Recent runs and saved local files remain available in the library.

No invariant companion is published because this UI owns navigation and session references rather than an independent authoritative projection.

### Dev Note

<details>
<summary>Maintainer context</summary>

None.

</details>

Optional Arya product bundles are selected in the profile and managed through Plugin Market. Disabling or removing a shipped bundle changes the profile selection; it does not erase installer-owned package files. The same pinned package remains available for restoration. Core runtime and plugin management services remain protected.
