/** Cordis registration for AryaAI's global Images page. */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { ComfyGenerateRequest, ComfyImageReference } from '@deepseek-ai/dsh-api-comfyui-controller/types'
import type {} from '@deepseek-ai/dsh-api-comfyui-controller/remote'
import type {} from '@deepseek-ai/dsh-api-mcp-controller/remote'
import type {} from '@deepseek-ai/dsh-api-workspace-controller/remote'
import type {} from '@deepseek-ai/dsh-api-workspace-controller/client'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type { MainPanelId } from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-session-log-export/client'
import type {} from '@deepseek-ai/dsh-client-ui-plugin-manager/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { SessionReference } from '@deepseek-ai/dsh-api-session-controller/client'
import type { SessionId } from '@deepseek-ai/dsh-api-remotes/client'
import { createSnapshotStore } from '@deepseek-ai/dsh-client-store'
import { revealMedia } from './folders.ts'
import { isStillMediaType } from './media.ts'
import { readImageRooms, type ImageRoomState } from './room-state.ts'
import type { PromptContentPart } from '@deepseek-ai/dsh-api-session-controller/types'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar-right/client'
import { ImagesAgent, ImagesAgentControls } from './ImagesAgent.tsx'
import { ComfyConnection, type ComfyServerPhase } from './ComfyConnection.tsx'
import { CommunityImagesPanel } from './CommunityImagesPanel.tsx'
import { ImagesIcon } from './ImagesIcon.tsx'
import type { ImagesInjected } from './ImagesPanel.tsx'
import { en, NS, zh, type ImagesKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap {
    /** Shared profile connection editor for direct and MCP ComfyUI execution. */
    'images.connection': { kind: 'single'; scope: 'root'; owner: { onSaved: () => void; presentation?: 'panel'; onServerState?: (phase: ComfyServerPhase) => void } }
    /** Dedicated agent conversation, independent of the selected main chat. */
    'images.agent': { kind: 'single'; scope: 'session'; owner: { onSettled: () => void; onUseStarter: (text: string) => void; readOnly?: boolean } }
    /** Resident model, permission and stop controls for the Images composer. */
    'images.agent.controls': { kind: 'single'; scope: 'session'; owner: { locked: boolean } }
    /** Optional dictation control; inserting text never submits a generation. */
    'images.prompt.activity': { kind: 'single'; scope: 'root'; owner: ImagePromptActivityProps }
  }
  interface LocaleNamespaceMap {
    /** Local ComfyUI generation page copy. */
    images: ImagesKey
  }
}

/** Selection and revision actions supplied by the image prompt to dictation. */
export interface ImagePromptActivityProps {
  /** Capture the selection and reject insertion after subsequent prompt edits. */
  inputActions: {
    captureInsertion(): { start: number; end: number; draftRev: number }
    insertText(text: string, span: { start: number; end: number; draftRev: number }): boolean
  }
  /** Prevent capture and insertion during generation submission. */
  locked: boolean
  /** Report capture, transcription and feedback activity to the page. */
  onActiveChange(active: boolean): void
}

declare module '@deepseek-ai/dsh-api-session-controller/client' {
  interface SessionReferenceSourceMap {
    /** Images panel conversation lifetime. */
    imagesConversation: unknown
  }
}

export const inject = ['locale', 'remote', 'remote.comfyImages', 'remote.mcp', 'remote.session', 'remote.commands', 'remote.pluginManager', 'workspaces', 'slots', 'pluginNavigation', 'sessions', 'configForms', 'sidebarRightViews']
const PANEL_ID = 'images' as MainPanelId

/** Register the global page and its left-sidebar navigation entry. */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-images: dictionaries')
  const t = ctx.locale.bind(NS)
  const preview = ctx.configForms.get<{ autoPreview: boolean; agentPreset: string; permissionPreset: string }>('ui-images')
  const unwrap = async <T>(operation: Promise<{ ok: true; value: T } | { ok: false; error: { message: string } }>): Promise<T> => {
    const result = await operation
    if (!result.ok) throw new Error(result.error.message)
    return result.value
  }
  let agent: SessionReference | undefined
  const retired = new Set<SessionReference>()
  let creating: Promise<SessionReference> | undefined
  let generation = 0
  const navigation = createSnapshotStore<unknown>({ ids: [], active: null }, { persist: { name: 'aryaai.images.rooms.v1' } })
  navigation.set(readImageRooms(navigation.getSnapshot()))
  const rooms = createSnapshotStore<ImageRoomState>(readImageRooms(navigation.getSnapshot()))
  const saveRooms = (value: ImageRoomState): void => { navigation.set(value); rooms.set(value) }
  ctx.effect(() => {
    const reconcile = (): void => {
      const catalog = ctx.sessions.list.getSnapshot()
      const current = rooms.getSnapshot()
      if (catalog.phase !== 'ready') { rooms.set({ ...current }); return }
      const ids = current.ids.filter(id => catalog.byId[id] !== undefined)
      const active = current.active !== null && ids.includes(current.active) ? current.active : null
      const archived = current.archivedIds === undefined ? {} : { archivedIds: current.archivedIds.filter(id => ids.includes(id)) }
      saveRooms({ ...current, ids, active, ...archived })
    }
    reconcile()
    return ctx.sessions.list.subscribe(reconcile)
  }, 'ui-images: room catalog')
  ctx.effect(() => {
    const syncArchives = (): void => {
      const catalog = ctx.workspaces.list.getSnapshot()
      if (catalog.phase !== 'ready') return
      const current = rooms.getSnapshot()
      const archivedIds = current.ids.filter(id => catalog.archivedSessionIds.includes(id))
      if (archivedIds.length === 0 && current.archivedIds === undefined) return
      saveRooms({ ...current, archivedIds })
    }
    syncArchives()
    return ctx.workspaces.list.subscribe(syncArchives)
  }, 'ui-images: room archives')
  const lifetime = new AbortController()
  ctx.effect(() => () => { lifetime.abort(); agent?.release(); for (const reference of retired) reference.release(); retired.clear() }, 'ui-images: conversation reference')
  const openRoom = async (id: SessionId): Promise<SessionReference> => {
    if (ctx.sessions.list.getSnapshot().byId[id] === undefined) await ctx.sessions.refresh()
    if (ctx.sessions.list.getSnapshot().byId[id] === undefined) {
      const current = rooms.getSnapshot()
      saveRooms({ ...current, ids: current.ids.filter(value => value !== id), active: current.active === id ? null : current.active })
      throw new Error(t('room.missing'))
    }
    if (!rooms.getSnapshot().ids.includes(id)) throw new Error('Unknown Images conversation')
    if (agent?.sessionId === id) { await agent.ready; return agent }
    const ticket = ++generation
    const reference = ctx.sessions.retain(id, { source: 'imagesConversation', signal: lifetime.signal })
    try {
      await reference.ready
      lifetime.signal.throwIfAborted()
      if (ticket !== generation) throw new DOMException('Images navigation superseded', 'AbortError')
      if (agent !== undefined) retired.add(agent)
      agent = reference
      saveRooms({ ...rooms.getSnapshot(), active: id })
      return reference
    } catch (error) { reference.release(); throw error }
  }
  const acquire = (): Promise<SessionReference> => {
    if (agent !== undefined) {
      const reference = agent
      return reference.ready.then(() => reference)
    }
    creating ??= (async () => {
      const active = rooms.getSnapshot().active
      if (active !== null) return openRoom(active)
      const main = Object.values(ctx.sessions.list.getSnapshot().byId).find(item => (item.retainedBy.mainView ?? 0) > 0)
      const ticket = ++generation
      const id = await ctx.sessions.create({
        ...(main?.cwd === undefined ? {} : { cwd: main.cwd }),
        agentPreset: preview.getSnapshot().value?.agentPreset ?? 'content',
      })
      lifetime.signal.throwIfAborted()
      const reference = ctx.sessions.retain(id, { source: 'imagesConversation', signal: lifetime.signal })
      try {
        await reference.ready
        const permission = await unwrap(ctx.remote.commands.execute(id, `/permission ${preview.getSnapshot().value?.permissionPreset ?? 'danger-full-access'}`, []))
        if (permission === undefined) throw new Error('Content requires the /permission command')
        if (permission.result.kind === 'error') throw new Error(permission.result.text)
        lifetime.signal.throwIfAborted()
        if (ticket !== generation) throw new DOMException('Images navigation superseded', 'AbortError')
        agent = reference
        saveRooms({ ...rooms.getSnapshot(), ids: [id, ...rooms.getSnapshot().ids], active: id })
        return reference
      } catch (error) {
        reference.release()
        /* v8 ignore next -- each retain mints a fresh reference, so the agent cannot already be this failing one. */
        if (agent === reference) agent = undefined
        throw error
      }
    })().finally(() => { creating = undefined })
    return creating
  }
  const attachFiles = (reference: SessionReference, files: readonly File[]): void => {
    lifetime.signal.throwIfAborted()
    if (ctx.workspaces.list.getSnapshot().archivedSessionIds.includes(reference.sessionId)) throw new Error(t('room.restoreFirst'))
    const conversation = ctx.sessions.scope(reference.sessionId)?.get('conversation')
    if (conversation === undefined || !conversation.attachFiles(files)) throw new Error(t('notice.attachFailed'))
  }
  const face: ImagesInjected = {
    fillDraft: async (text) => {
      const reference = await acquire()
      if (ctx.workspaces.list.getSnapshot().archivedSessionIds.includes(reference.sessionId)) throw new Error(t('room.restoreFirst'))
      const scope = ctx.sessions.scope(reference.sessionId)
      const conversation = scope?.get('conversation')
      if (conversation === undefined || scope === undefined) throw new Error(t('notice.attachFailed'))
      const result = conversation.input.requestDraftInitialization(reference.binding, { prompt: text })
      if (result !== 'applied') throw new Error(t('studio.draftPreserved'))
      conversation.input.for(scope).focus()
    },
    addFiles: async (files) => { attachFiles(await acquire(), files) },
    addMedia: async (media) => {
      const reference = await acquire()
      const files = await Promise.all(media.map(async (item) => {
        const address = 'api/comfyui-media?' + new URLSearchParams({ filename: item.filename, subfolder: item.subfolder }).toString()
        const response = await fetch(address, { signal: lifetime.signal })
        if (!response.ok) throw new Error(t('notice.attachFailed'))
        const blob = await response.blob()
        return new File([blob], item.filename, { type: blob.type })
      }))
      attachFiles(reference, files)
    },
    imagePlugin: async () => {
      const bundles = await unwrap(ctx.remote.pluginManager.listBundles())
      return bundles.some(bundle => bundle.name === 'dsh-image-gen' && bundle.enabled && bundle.error === undefined)
    },
    openImagePlugin: () => { ctx.pluginNavigation.openBundle('dsh-image-gen') },
    autoPreview: {
      // An unset field is the schema's default, not a refusal: `Config` declares
      // `.default(true)`, so only an explicit false turns the conversation off.
      // Reading it as `=== true` disagreed with that default, and because the
      // panel also gates its Chat/Advanced switcher on this flag, the
      // disagreement hid the conversation with no control left to restore it.
      getSnapshot: () => preview.getSnapshot().value?.autoPreview !== false,
      subscribe: listener => preview.subscribe(listener),
    },
    currentAgent: () => agent,
    settleAgent: (reference) => {
      for (const previous of retired) {
        if (previous !== reference) { previous.release(); retired.delete(previous) }
      }
    },
    rooms,
    openRoom,
    archiveRoom: async (id, archived) => {
      if (archived) await ctx.workspaces.archiveSession(id)
      else await ctx.workspaces.unarchiveSession(id)
      const current = rooms.getSnapshot()
      const archivedIds = archived
        ? [...new Set([...(current.archivedIds ?? []), id])]
        : (current.archivedIds ?? []).filter(value => value !== id)
      saveRooms({ ...current, archivedIds, active: current.active === id && archived ? null : current.active })
      if (archived && agent?.sessionId === id) { retired.add(agent); agent = undefined }
    },
    roomTitle: id => ctx.sessions.list.getSnapshot().byId[id]?.title ?? `${t('composer.newConversation')} · ${id.slice(-6)}`,
    exportRoom: async (id) => {
      // Provided by the session-log-export browser plugin. Read through `ctx.get`
      // rather than declared in `inject`, because it is optional: a deployment
      // without that plugin still loads this panel, and the action reports it.
      const logDownload = ctx.get('sessionLogDownload')
      if (logDownload === undefined) return false
      await logDownload.download(id)
      return true
    },
    resetAgent: async () => {
      if (agent !== undefined) {
        const snapshot = agent.binding.session.getSnapshot()
        if (snapshot.blank && !snapshot.running && !snapshot.awaitingFirstTurn) return agent
      }
      const blankId = rooms.getSnapshot().ids.find((id) => {
        const summary = ctx.sessions.list.getSnapshot().byId[id]
        return summary?.blank === true && !summary.running && !(rooms.getSnapshot().archivedIds ?? []).includes(id)
      })
      if (blankId !== undefined) return openRoom(blankId)
      const previous = agent
      const previousRooms = rooms.getSnapshot()
      ++generation
      if (agent !== undefined) retired.add(agent)
      agent = undefined
      saveRooms({ ...rooms.getSnapshot(), active: null })
      try {
        if (creating !== undefined) await creating.catch(() => undefined)
        return await acquire()
      } catch (error) {
        agent = previous
        if (previous !== undefined) retired.delete(previous)
        saveRooms(previousRooms)
        throw error
      }
    },
    askAgent: async (prompt, _status, source, uploads) => {
      const reference = await acquire()
      if (ctx.workspaces.list.getSnapshot().archivedSessionIds.includes(reference.sessionId)) throw new Error(t('room.restoreFirst'))
      const content: PromptContentPart[] = [{ type: 'text', text: prompt }]
      if (source !== null) {
        const image = await unwrap(ctx.remote.comfyImages.image(source))
        const mediaType = image.contentType
        if (!isStillMediaType(mediaType)) {
          throw new Error(`Unsupported reference image type: ${mediaType}`)
        }
        content.push({ type: 'image', mediaType, data: image.base64, name: source.filename })
      }
      if (uploads !== undefined) content.push(...uploads)
      lifetime.signal.throwIfAborted()
      if (reference.binding.session.getSnapshot().blank && prompt.trim().length > 0) {
        const renamed = await reference.binding.session.rename(prompt)
        if (!renamed.ok) throw new Error(renamed.error.message)
      }
      const result = await reference.binding.session.prompt(content, 'queue')
      if (!result.ok) throw new Error(result.error.message)
      return reference
    },
    openVoiceSettings: () => { ctx.pluginNavigation.openBundle('@deepseek-ai/dsh-experimental-voice-input-bundle') },
    status: () => unwrap(ctx.remote.comfyImages.status()),
    history: () => unwrap(ctx.remote.comfyImages.history({ limit: 40 })),
    library: (offset: number) => unwrap(ctx.remote.comfyImages.library({ offset, limit: 40 })),
    generate: (request: ComfyGenerateRequest) => unwrap(ctx.remote.comfyImages.generate(request)),
    cancel: async (promptId: string) => { await unwrap(ctx.remote.comfyImages.cancel({ promptId })) },
    remove: async (promptId: string) => { await unwrap(ctx.remote.comfyImages.deleteGeneration({ promptId })) },
    removeImage: async (image: ComfyImageReference) => { await unwrap(ctx.remote.comfyImages.deleteImage(image)) },
    removeImages: images => unwrap(ctx.remote.comfyImages.deleteImages({ images })),
    image: async (image: ComfyImageReference) => {
      const value = await unwrap(ctx.remote.comfyImages.image(image))
      return `data:${value.contentType};base64,${value.base64}`
    },
    readOutputFolder: async () => (await unwrap(ctx.remote.mcp.getComfyConnection())).outputDirectory,
    saveOutputFolder: async (directory) => {
      const current = await unwrap(ctx.remote.mcp.getComfyConnection())
      await unwrap(ctx.remote.mcp.setComfyConnection({ ...current, outputDirectory: directory }))
    },
    reveal: async (image) => {
      const connection = await unwrap(ctx.remote.mcp.getComfyConnection())
      await revealMedia(connection.outputDirectory, image)
    },
  }
  ctx.slots.inject('main', () => ctx.slots.register({
    name: 'main', key: PANEL_ID, locale: NS, inject: () => face,
    children: { 'images.prompt.activity': { kind: 'single', scope: 'root' }, 'images.agent': { kind: 'single', scope: 'session' }, 'images.agent.controls': { kind: 'single', scope: 'session' }, 'images.connection': { kind: 'single', scope: 'root' } },
  }, CommunityImagesPanel))
  ctx.slots.inject('images.agent', () => ctx.slots.register({ name: 'images.agent', locale: NS,
    inject: sessionId => ({ attachPreview: () => ctx.sidebarRightViews.registerPanel(PANEL_ID, sessionId) }) }, ImagesAgent))
  ctx.slots.inject('images.agent.controls', () => ctx.slots.register({ name: 'images.agent.controls', locale: NS,
    inject: () => ({
      stop: async () => { if (agent !== undefined) await unwrap(agent.binding.session.cancel()) },
    }) }, ImagesAgentControls))
  ctx.slots.inject('images.connection', () => ctx.slots.register({ name: 'images.connection', locale: NS, inject: () => ({
    readStatus: () => unwrap(ctx.remote.comfyImages.status()),
    pollIntervalMs: () => ctx.configForms.get<{ serverStatusPollIntervalMs: number }>('ui-images')
      .getSnapshot().value?.serverStatusPollIntervalMs ?? 10000,
    readConnection: () => unwrap(ctx.remote.mcp.getComfyConnection()),
    testConnection: (baseUrl: string) => unwrap(ctx.remote.mcp.testComfyConnection(baseUrl)),
    saveConnection: (settings: import('@deepseek-ai/dsh-api-mcp-controller/types').ComfyConnectionValue) => unwrap(ctx.remote.mcp.setComfyConnection(settings)),
    startServer: () => unwrap(ctx.remote.comfyImages.startServer()),
    stopServer: () => unwrap(ctx.remote.comfyImages.stopServer()),
    restartServer: () => unwrap(ctx.remote.comfyImages.restartServer()),
  }) }, ComfyConnection))
  ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
    name: 'sidebar.panellist', id: PANEL_ID, order: -10, locale: NS, label: () => t('panel.label'),
  }, ImagesIcon))
}
