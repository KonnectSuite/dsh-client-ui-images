// @vitest-environment jsdom
import { Context } from '@deepseek-ai/cordis'
import { afterEach, expect, it, vi } from 'vitest'
import * as ImagesPlugin from '../src/client/index.ts'

/** Storage key the page persists its room catalog under. */
const KEY = 'aryaai.images.rooms.v1'

/** The status the prompt builder reads; the page forwards the Host's own report to it. */
const STATUS = { reachable: true, baseUrl: 'http://127.0.0.1:8188', workflows: [], models: [] } as never

/** A library reference as the Host reports it. */
const SOURCE = { filename: 'a.png', subfolder: '', type: 'input' }

afterEach(() => { localStorage.clear() })

interface Summary {
  id: string
  title?: string
  blank?: boolean
  running?: boolean
  awaitingFirstTurn?: boolean
  retainedBy?: Record<string, number>
}

/**
 * Mounts the page against stubbed services and returns the injected face it hands to the panel.
 * The real snapshot store runs, so a test observes room state the way the browser does — through
 * what the page persists — rather than reaching inside.
 */
async function mounts(options: {
  byId?: Record<string, Summary>
  archived?: string[]
  withExport?: boolean
  imageType?: string
  phase?: string
  model?: string
  workspacePhase?: string
} = {}) {
  const byId = Object.fromEntries(
    Object.entries(options.byId ?? {}).map(([id, summary]) => [id, { retainedBy: {}, ...summary }]),
  ) as Record<string, Summary>
  const registered: string[] = []
  const faces: Record<string, unknown> = {}
  const workspaces = {
    list: {
      getSnapshot: () => ({ phase: options.workspacePhase ?? 'ready', archivedSessionIds: options.archived ?? [] as string[] }),
      subscribe: () => () => {},
    },
    archiveSession: vi.fn(async () => {}),
    unarchiveSession: vi.fn(async () => {}),
  }
  const created: string[] = []
  const sessions = {
    list: {
      getSnapshot: () => ({ phase: options.phase ?? 'ready', byId, ids: Object.keys(byId), retainedBy: {} }),
      subscribe: () => () => {},
    },
    refresh: vi.fn(async () => {}),
    create: vi.fn(async () => { const id = `created-${created.length + 1}`; created.push(id); return id }),
    retain: vi.fn((id: string) => ({
      sessionId: id, ready: Promise.resolve(), release: vi.fn(),
      binding: {
        session: {
          getSnapshot: () => ({ blank: false, running: false, awaitingFirstTurn: false }),
          prompt: vi.fn(async () => ({ ok: true as const, value: undefined })),
          rename: vi.fn(async () => ({ ok: true as const, value: undefined })),
          cancel: vi.fn(async () => ({ ok: true as const, value: undefined })),
        },
      },
    })),
  }
  const ctx = new Context()
  const selectedModel = vi.fn(async () => ({ ok: true, value: undefined }))
  await ctx.plugin({
    name: 'images-test-services',
    apply(host: Context) {
      host.provide('locale', { register: vi.fn(() => () => {}), bind: () => (key: string) => key })
      host.provide('configForms', { get: () => ({ getSnapshot: () => ({ value: { autoPreview: true, agentPreset: 'content' } }) }) })
      host.provide('sessions', sessions)
      host.provide('workspaces', workspaces)
      host.provide('modelDirectories', {
        directoryFor: () => ({
          load: async () => ({ current: options.model ?? null }),
          select: selectedModel,
        }),
      })
      // The code reaches these as `ctx.remote.mcp.…`, so the members live on the remote service.
      // The dotted names are provided too because the page declares them in `inject`.
      const comfyImages = {
        status: async () => ({ ok: true, value: { reachable: true } }),
        history: async () => ({ ok: true, value: { generations: [] } }),
        library: async () => ({ ok: true, value: { images: [] } }),
        generate: async () => ({ ok: true, value: { promptId: 'prompt-1' } }),
        cancel: async () => ({ ok: true, value: undefined }),
        deleteGeneration: async () => ({ ok: true, value: undefined }),
        deleteImage: async () => ({ ok: true, value: undefined }),
        deleteImages: async () => ({ ok: true, value: undefined }),
        image: async () => ({ ok: true, value: { contentType: options.imageType ?? 'image/png', base64: 'AAA', filename: 'a.png' } }),
      }
      const mcp = {
        getComfyConnection: vi.fn(async () => ({ ok: true, value: { baseUrl: 'http://127.0.0.1:8188', outputDirectory: '', remote: false } })),
        testComfyConnection: vi.fn(async () => ({ ok: true, value: undefined })),
        setComfyConnection: vi.fn(async () => ({ ok: true, value: undefined })),
      }
      const commands = { execute: vi.fn(async () => ({ ok: true, value: { commandId: 'permission-command', result: { kind: 'success', text: 'preset danger-full-access' } } })) }
      host.provide('remote.commands', commands)
      host.provide('remote', { commands, mcp, comfyImages, session: {}, pluginManager: { listBundles: async () => ({ ok: true, value: [] }) } })
      host.provide('remote.pluginManager', { listBundles: async () => ({ ok: true, value: [] }) })
      host.provide('remote.comfyImages', comfyImages)
      host.provide('remote.mcp', mcp)
      host.provide('remote.session', {})
      host.provide('pluginNavigation', { openBundle: vi.fn() })
      host.provide('sidebarRightViews', { registerPanel: vi.fn(() => () => {}) })
      if (options.withExport === true) host.provide('sessionLogDownload', { download: vi.fn(async () => {}) })
      host.provide('slots', {
        // The page registers through inject, which runs once the slot is declared. Declaring
        // immediately is what the shell does at boot, so the callback runs here too.
        register: (declaration: { name: string; inject?: () => unknown; label?: () => string }) => {
          registered.push(declaration.name)
          // The shell renders the row's label, so the declaration's label runs at registration.
          declaration.label?.()
          if (declaration.inject !== undefined) faces[declaration.name] = declaration.inject()
          return () => {}
        },
        inject: (_name: string, run: () => unknown) => { run(); return () => {} },
      })
    },
  })
  await ctx.plugin(ImagesPlugin)
  return { ctx, registered, faces, sessions, workspaces, selectedModel }
}

/** The panel's injected face carries the page's room operations. */
function page(faces: Record<string, unknown>) {
  return faces['main'] as {
    exportRoom: (id: string) => Promise<boolean>
    archiveRoom: (id: string, archived: boolean) => Promise<void>
    openRoom: (id: string) => Promise<{ binding: { session: { prompt: unknown; cancel: unknown } } }>
    resetAgent: () => Promise<unknown>
    rooms: { getSnapshot: () => { ids: string[]; active: string | null; archivedIds?: string[] } }
  }
}

it('registers the page dictionary and its five extension positions', async () => {
  const { registered, ctx } = await mounts()

  // The panel asks for these by name and the shell declares the two it owns; a missing
  // registration fails at load in the browser rather than at the call site.
  expect(registered).toEqual([
    'main', 'images.agent', 'images.agent.controls', 'images.connection', 'sidebar.panellist',
  ])
  expect(ctx.get('locale')).toBeDefined()
})

it('drops a room the Host no longer knows', async () => {
  localStorage.setItem(KEY, JSON.stringify({ ids: ['ghost', 'kept'], active: 'ghost' }))
  await mounts({ byId: { kept: { id: 'kept' } } })

  // The catalog the browser persists is the observable: a room the Host dropped stops being
  // offered, and an active room that disappeared stops being active.
  const saved = JSON.parse(localStorage.getItem(KEY) ?? '{}') as { ids?: string[]; active?: string | null }
  expect(saved.ids).toEqual(['kept'])
  expect(saved.active).toBeNull()
})

it('reports no export when the deployment ships no session-log downloader', async () => {
  const { faces } = await mounts()

  // The panel offers the action only when this resolves true, so a missing optional service is
  // reported rather than thrown.
  await expect(page(faces).exportRoom('room-1')).resolves.toBe(false)
})

it('exports a room when the downloader is present', async () => {
  const { faces, ctx } = await mounts({ withExport: true })

  await expect(page(faces).exportRoom('room-1')).resolves.toBe(true)
  expect((ctx.get('sessionLogDownload') as { download: unknown }).download).toHaveBeenCalledWith('room-1')
})

it('refuses to open a room the Host does not list', async () => {
  localStorage.setItem(KEY, JSON.stringify({ ids: ['ghost'], active: 'ghost' }))
  const { faces } = await mounts({ byId: {} })

  await expect(page(faces).openRoom('ghost')).rejects.toThrow('room.missing')
  // A room that cannot be opened must also stop being the active one.
  expect(page(faces).rooms.getSnapshot().active).toBeNull()
})

it('unarchives a room and keeps it out of the archived set', async () => {
  localStorage.setItem(KEY, JSON.stringify({ ids: ['room-1'], active: null, archivedIds: ['room-1'] }))
  const { faces, workspaces } = await mounts({ byId: { 'room-1': { id: 'room-1' } }, archived: ['room-1'] })

  await page(faces).archiveRoom('room-1', false)

  expect(workspaces.unarchiveSession).toHaveBeenCalledWith('room-1')
  expect(page(faces).rooms.getSnapshot().archivedIds ?? []).not.toContain('room-1')
})

it('releases a room it could not finish opening', async () => {
  localStorage.setItem(KEY, JSON.stringify({ ids: ['room-1'], active: null }))
  const release = vi.fn()
  const { faces, sessions } = await mounts({ byId: { 'room-1': { id: 'room-1' } } })
  sessions.retain.mockImplementationOnce(() => ({
    sessionId: 'room-1', ready: Promise.reject(new Error('host refused')), release,
    binding: {
      session: {
        getSnapshot: () => ({ blank: false, running: false, awaitingFirstTurn: false }),
        prompt: vi.fn(async () => ({ ok: true as const, value: undefined })),
        rename: vi.fn(async () => ({ ok: true as const, value: undefined })),
        cancel: vi.fn(async () => ({ ok: true as const, value: undefined })),
      },
    },
  }))

  await expect(page(faces).openRoom('room-1')).rejects.toThrow('host refused')
  // A reference the page cannot use must not be left retained.
  expect(release).toHaveBeenCalledOnce()
})

it('restores the previous room when starting a new one fails', async () => {
  localStorage.setItem(KEY, JSON.stringify({ ids: ['room-1'], active: 'room-1' }))
  const { faces, sessions } = await mounts({ byId: { 'room-1': { id: 'room-1' } } })
  const face = page(faces)
  await face.openRoom('room-1')
  expect(face.rooms.getSnapshot().active).toBe('room-1')

  sessions.create.mockRejectedValueOnce(new Error('create refused'))
  await expect(face.resetAgent()).rejects.toThrow('create refused')

  // The page cleared the active room before creating the next one, so a failure has to put the
  // catalog back rather than leaving the user with no room selected.
  expect(face.rooms.getSnapshot().active).toBe('room-1')
})

it('reads, tests and saves the profile connection through the MCP controller', async () => {
  const { faces, ctx } = await mounts()
  const connection = faces['images.connection'] as {
    readConnection: () => Promise<{ baseUrl: string }>
    testConnection: (baseUrl: string) => Promise<void>
    saveConnection: (settings: { baseUrl: string }) => Promise<void>
  }

  // The panel's connection form is the only route to these, so each one is exercised through
  // the face the page injects rather than against the controller directly.
  await expect(connection.readConnection()).resolves.toHaveProperty('baseUrl', 'http://127.0.0.1:8188')
  await expect(connection.testConnection('http://gpu:8188')).resolves.toBeUndefined()
  await expect(connection.saveConnection({ baseUrl: 'http://gpu:8188' })).resolves.toBeUndefined()
  expect((ctx.get('remote.mcp') as { setComfyConnection: unknown }).setComfyConnection).toHaveBeenCalled()
})

it('stops the running agent through the controls face', async () => {
  localStorage.setItem(KEY, JSON.stringify({ ids: ['room-1'], active: 'room-1' }))
  const { faces } = await mounts({ byId: { 'room-1': { id: 'room-1' } } })
  const face = page(faces)
  const controls = faces['images.agent.controls'] as { stop: () => Promise<void> }
  const reference = await face.openRoom('room-1')

  await controls.stop()

  expect(reference.binding.session.cancel).toHaveBeenCalled()
})

it('opens the voice settings bundle and copies a reference image when asked', async () => {
  const { faces, ctx } = await mounts()
  const face = faces['main'] as {
    openVoiceSettings: () => void
    image: (image: { filename: string }) => Promise<string>
  }

  face.openVoiceSettings()
  expect((ctx.get('pluginNavigation') as { openBundle: unknown }).openBundle)
    .toHaveBeenCalledWith('@deepseek-ai/dsh-experimental-voice-input-bundle')

  // The panel previews a library file as a data URL, so the media type has to survive the trip.
  await expect(face.image({ filename: 'a.png' })).resolves.toBe('data:image/png;base64,AAA')
})

it('passes the panel’s gallery requests straight through to the controller', async () => {
  const { faces } = await mounts()
  const face = faces['main'] as {
    status: () => Promise<unknown>
    history: () => Promise<unknown>
    library: (offset: number) => Promise<unknown>
    generate: (request: unknown) => Promise<unknown>
    cancel: (promptId: string) => Promise<void>
    remove: (promptId: string) => Promise<void>
    removeImage: (image: { filename: string }) => Promise<void>
    removeImages: (images: { filename: string }[]) => Promise<unknown>
  }

  await expect(face.status()).resolves.toHaveProperty('reachable', true)
  await expect(face.history()).resolves.toHaveProperty('generations', [])
  await expect(face.library(0)).resolves.toHaveProperty('images', [])
  await expect(face.generate({ prompt: 'x' })).resolves.toHaveProperty('promptId', 'prompt-1')
  await expect(face.cancel('prompt-1')).resolves.toBeUndefined()
  await expect(face.remove('prompt-1')).resolves.toBeUndefined()
  await expect(face.removeImage({ filename: 'a.png' })).resolves.toBeUndefined()
  await expect(face.removeImages([{ filename: 'a.png' }])).resolves.toBeUndefined()
})

it('sends a reference image with the request and refuses an unsupported type', async () => {
  localStorage.setItem(KEY, JSON.stringify({ ids: ['room-1'], active: 'room-1' }))
  const { faces } = await mounts({ byId: { 'room-1': { id: 'room-1' } } })
  const face = faces['main'] as {
    askAgent: (prompt: string, status: unknown, source: { filename: string } | null, uploads?: unknown[]) => Promise<unknown>
  }
  const reference = (await page(faces).openRoom('room-1')) as { binding: { session: { prompt: unknown } } }

  await face.askAgent('make it blue', STATUS, SOURCE)
  // The reference reaches the model as an image part carrying the media type the Host reported.
  // The instruction text is the builder's own output; agent-prompt.spec.ts owns its content.
  expect(reference.binding.session.prompt).toHaveBeenCalledWith(
    [
      { type: 'text', text: 'make it blue' },
      { type: 'image', mediaType: 'image/png', data: 'AAA', name: 'a.png' },
    ],
    'queue',
  )
})

it('surfaces the Host’s own message when a controller call fails', async () => {
  const { faces, ctx } = await mounts()
  const face = faces['main'] as { status: () => Promise<unknown> }
  ;(ctx.get('remote.comfyImages') as { status: unknown }).status = async () => ({ ok: false, error: { message: 'server is offline' } })

  // Every controller call travels through the same unwrap, so a refused result must reach the
  // user as the Host's message rather than as an opaque rejection.
  await expect(face.status()).rejects.toThrow('server is offline')
})

it('archives a room, clears it when active, and retires its agent', async () => {
  localStorage.setItem(KEY, JSON.stringify({ ids: ['room-1'], active: 'room-1' }))
  const { faces, workspaces } = await mounts({ byId: { 'room-1': { id: 'room-1' } } })
  const face = page(faces)
  await face.openRoom('room-1')

  await face.archiveRoom('room-1', true)

  expect(workspaces.archiveSession).toHaveBeenCalledWith('room-1')
  const saved = face.rooms.getSnapshot()
  expect(saved.archivedIds ?? []).toContain('room-1')
  // Archived work must not stay selected: the conversation is retired with the room.
  expect(saved.active).toBeNull()
})

it('reports a room the Host could not retitle', async () => {
  localStorage.setItem(KEY, JSON.stringify({ ids: ['room-1'], active: 'room-1' }))
  const { faces, sessions } = await mounts({ byId: { 'room-1': { id: 'room-1' } } })
  const face = faces['main'] as {
    askAgent: (prompt: string, status: unknown, source: null) => Promise<unknown>
  }
  // A blank room takes its title from the first request, so a refused rename is reported rather
  // than silently sending the request under no name.
  sessions.retain.mockImplementationOnce((() => ({
    sessionId: 'room-1', ready: Promise.resolve(), release: vi.fn(),
    binding: {
      session: {
        getSnapshot: () => ({ blank: true, running: false, awaitingFirstTurn: false }),
        prompt: vi.fn(async () => ({ ok: true, value: undefined })),
        rename: vi.fn(async () => ({ ok: false, error: { message: 'title rejected' } })),
        cancel: vi.fn(async () => ({ ok: true, value: undefined })),
      },
    },
  })) as never)

  await expect(face.askAgent('name this room', STATUS, null)).rejects.toThrow('title rejected')
})

it('releases a newly created room whose reference never becomes ready', async () => {
  const release = vi.fn()
  const { faces, sessions } = await mounts()
  const face = faces['main'] as { askAgent: (prompt: string, status: unknown, source: null) => Promise<unknown> }
  // Creating a room and retaining it are separate steps, so a reference that never becomes ready
  // must be released rather than left retained by a request that cannot proceed.
  sessions.retain.mockImplementationOnce((() => ({
    sessionId: 'created-1', ready: Promise.reject(new Error('host did not answer')), release,
    binding: {
      session: {
        getSnapshot: () => ({ blank: false, running: false, awaitingFirstTurn: false }),
        prompt: vi.fn(async () => ({ ok: true, value: undefined })),
        rename: vi.fn(async () => ({ ok: true, value: undefined })),
        cancel: vi.fn(async () => ({ ok: true, value: undefined })),
      },
    },
  })) as never)

  await expect(face.askAgent('start a room', STATUS, null)).rejects.toThrow('host did not answer')
  expect(release).toHaveBeenCalledOnce()
})

it('releases the conversations that are no longer in view', async () => {
  localStorage.setItem(KEY, JSON.stringify({ ids: ['room-1', 'room-2'], active: null }))
  const { faces, sessions } = await mounts({ byId: { 'room-1': { id: 'room-1' }, 'room-2': { id: 'room-2' } } })
  const face = faces['main'] as {
    openRoom: (id: string) => Promise<unknown>
    settleAgent: (reference: unknown) => void
  }
  const first = await face.openRoom('room-1')
  const second = await face.openRoom('room-2')
  const firstRelease = (sessions.retain.mock.results[0]?.value as { release: unknown }).release

  face.settleAgent(second)

  // Switching rooms retires the previous conversation, and keeping the new one must not release
  // the reference still in view.
  expect(firstRelease).toHaveBeenCalledOnce()
  const secondRelease = (sessions.retain.mock.results[1]?.value as { release: unknown }).release
  expect(secondRelease).not.toHaveBeenCalled()
  expect(first).not.toBe(second)
})

it('holds the request when the Host catalog is not ready yet', async () => {
  localStorage.setItem(KEY, JSON.stringify({ ids: ['ghost'], active: 'ghost' }))
  const { faces } = await mounts({ phase: 'loading', byId: {} })

  // A catalog still loading is not evidence that the room is gone, so nothing is pruned and the
  // request stays selected until the Host reports.
  const held = JSON.parse(localStorage.getItem(KEY) ?? '{}') as { ids?: string[] }
  expect(held.ids).toEqual(['ghost'])

  // Opening it is a different matter: the page refreshes the catalog, finds nothing, and drops the
  // room it can no longer reach.
  await expect(page(faces).openRoom('ghost')).rejects.toThrow('room.missing')
  const pruned = JSON.parse(localStorage.getItem(KEY) ?? '{}') as { ids?: string[]; active?: string | null }
  expect(pruned.ids).toEqual([])
  expect(pruned.active).toBeNull()
})

it('keeps a room that is not the active one when it is pruned', async () => {
  localStorage.setItem(KEY, JSON.stringify({ ids: ['ghost', 'kept'], active: 'kept' }))
  await mounts({ byId: { kept: { id: 'kept' } } })

  const saved = JSON.parse(localStorage.getItem(KEY) ?? '{}') as { ids?: string[]; active?: string | null }
  expect(saved.ids).toEqual(['kept'])
  // The active room survived, so the selection is untouched.
  expect(saved.active).toBe('kept')
})

it('sends uploads with the request', async () => {
  localStorage.setItem(KEY, JSON.stringify({ ids: ['room-1'], active: 'room-1' }))
  const { faces } = await mounts({ byId: { 'room-1': { id: 'room-1' } } })
  const face = faces['main'] as {
    askAgent: (prompt: string, status: unknown, source: null, uploads?: unknown[]) => Promise<unknown>
  }
  const reference = await page(faces).openRoom('room-1')
  const parts = [{ type: 'image', mediaType: 'image/png', data: 'AAA', name: 'a.png' }]

  await face.askAgent('look at this', STATUS, null, parts)
  expect(reference.binding.session.prompt).toHaveBeenCalledWith(
    [{ type: 'text', text: 'look at this' }, ...parts],
    'queue',
  )
})

it('reports a submission the Host refused', async () => {
  const { faces, sessions } = await mounts()
  const face = faces['main'] as { askAgent: (prompt: string, status: unknown, source: null) => Promise<unknown> }
  sessions.retain.mockImplementationOnce((() => ({
    sessionId: 'created-1', ready: Promise.resolve(), release: vi.fn(),
    binding: {
      session: {
        getSnapshot: () => ({ blank: false, running: false, awaitingFirstTurn: false }),
        prompt: vi.fn(async () => ({ ok: false, error: { message: 'submission refused' } })),
        rename: vi.fn(async () => ({ ok: true, value: undefined })),
        cancel: vi.fn(async () => ({ ok: true, value: undefined })),
      },
    },
  })) as never)

  await expect(face.askAgent('look at this', STATUS, null)).rejects.toThrow('submission refused')
})

it('settles a stop request with no conversation open', async () => {
  const { faces } = await mounts()
  const controls = faces['images.agent.controls'] as { stop: () => Promise<void> }

  // The control is offered while a conversation exists, but a stop that arrives after it closed
  // still has to settle rather than fail.
  await expect(controls.stop()).resolves.toBeUndefined()
})

it('reuses an idle blank room instead of creating another', async () => {
  localStorage.setItem(KEY, JSON.stringify({ ids: ['blank-1'], active: null }))
  const { faces, sessions } = await mounts({ byId: { 'blank-1': { id: 'blank-1', blank: true } } })
  const face = faces['main'] as { resetAgent: () => Promise<unknown> }

  await face.resetAgent()

  // A blank room costs nothing to reuse, so the page opens it rather than spending a creation.
  expect(sessions.retain).toHaveBeenCalledWith('blank-1', expect.anything())
  expect(sessions.create).not.toHaveBeenCalled()
})

it('refuses a conversation the page has no record of', async () => {
  const { faces } = await mounts({ byId: { known: { id: 'known' } } })

  // The Host lists it, so it is not pruned, but the page never offered it as a room.
  await expect(page(faces).openRoom('known')).rejects.toThrow('Unknown Images conversation')
})

it('skips a room that is still running when reusing a blank one', async () => {
  localStorage.setItem(KEY, JSON.stringify({ ids: ['busy-1'], active: null }))
  const { faces, sessions } = await mounts({ byId: { 'busy-1': { id: 'busy-1', blank: true, running: true } } })
  const face = faces['main'] as { resetAgent: () => Promise<unknown> }

  await face.resetAgent()

  // Reusing a room would take it away from work in progress, so a running blank room is passed over.
  expect(sessions.retain).not.toHaveBeenCalledWith('busy-1', expect.anything())
})

it('refuses a reset that could not create a room and had none to restore', async () => {
  const { faces, sessions } = await mounts()
  const face = faces['main'] as { resetAgent: () => Promise<unknown> }
  sessions.create.mockRejectedValueOnce(new Error('create refused'))

  // With no previous conversation there is nothing to put back, but the failure is still reported.
  await expect(face.resetAgent()).rejects.toThrow('create refused')
})

it('abandons a room a newer request has already replaced', async () => {
  localStorage.setItem(KEY, JSON.stringify({ ids: ['room-1', 'room-2'], active: null }))
  const release = vi.fn()
  const { faces, sessions } = await mounts({ byId: { 'room-1': { id: 'room-1' }, 'room-2': { id: 'room-2' } } })
  let resolveFirst = (): void => {}
  sessions.retain.mockImplementationOnce((() => ({
    sessionId: 'room-1', ready: new Promise<void>((resolve) => { resolveFirst = resolve }), release,
    binding: {
      session: {
        getSnapshot: () => ({ blank: false, running: false, awaitingFirstTurn: false }),
        prompt: vi.fn(async () => ({ ok: true, value: undefined })),
        rename: vi.fn(async () => ({ ok: true, value: undefined })),
        cancel: vi.fn(async () => ({ ok: true, value: undefined })),
      },
    },
  })) as never)
  const face = page(faces)

  // A known room reaches retain without awaiting, so the second request supersedes the first before
  // it can settle.
  const first = face.openRoom('room-1')
  const second = face.openRoom('room-2')
  resolveFirst()

  await expect(first).rejects.toThrow('superseded')
  // The superseded reference must not stay retained by a request that gave up.
  expect(release).toHaveBeenCalledOnce()
  await expect(second).resolves.toHaveProperty('binding')
})

it('keeps the profile default for a new room when the main chat uses an API model', async () => {
  const { faces, selectedModel } = await mounts({
    byId: { 'main-1': { id: 'main-1', retainedBy: { mainView: 1 } } },
    model: 'deepseek-chat',
  })
  const face = faces['main'] as { askAgent: (prompt: string, status: unknown, source: null) => Promise<unknown> }

  await face.askAgent('start a room', STATUS, null)

  expect(selectedModel).not.toHaveBeenCalled()
})

it('leaves the archived set alone while the workspace registry is loading', async () => {
  localStorage.setItem(KEY, JSON.stringify({ ids: ['room-1'], active: null }))
  await mounts({ byId: { 'room-1': { id: 'room-1' } }, workspacePhase: 'loading' })

  // The workspace registry decides what is archived; until it reports, the saved set is untouched.
  const saved = JSON.parse(localStorage.getItem(KEY) ?? '{}') as { archivedIds?: string[] }
  expect(saved.archivedIds).toBeUndefined()
})

it('keeps the conversation when the settled reference is the archived one', async () => {
  localStorage.setItem(KEY, JSON.stringify({ ids: ['room-1'], active: 'room-1' }))
  const { faces, sessions } = await mounts({ byId: { 'room-1': { id: 'room-1' } } })
  const face = faces['main'] as {
    openRoom: (id: string) => Promise<unknown>
    archiveRoom: (id: string, archived: boolean) => Promise<void>
    settleAgent: (reference: unknown) => void
  }
  const opened = await face.openRoom('room-1')
  const released = (sessions.retain.mock.results[0]?.value as { release: { mock: { calls: unknown[] } } }).release
  await face.archiveRoom('room-1', true)

  // Archiving already retires this conversation, so settling it afterwards must not release the
  // reference a second time.
  face.settleAgent(opened)
  expect(released.mock.calls.length).toBe(0)
})

it('abandons a room whose creation a later request replaced', async () => {
  localStorage.setItem(KEY, JSON.stringify({ ids: ['room-1'], active: null }))
  const { faces, sessions } = await mounts({ byId: { 'room-1': { id: 'room-1' } } })
  let resolveCreate = (): void => {}
  sessions.retain.mockImplementationOnce((() => ({
    sessionId: 'created-1', ready: new Promise<void>((resolve) => { resolveCreate = resolve }), release: vi.fn(),
    binding: {
      session: {
        getSnapshot: () => ({ blank: false, running: false, awaitingFirstTurn: false }),
        prompt: vi.fn(async () => ({ ok: true, value: undefined })),
        rename: vi.fn(async () => ({ ok: true, value: undefined })),
        cancel: vi.fn(async () => ({ ok: true, value: undefined })),
      },
    },
  })) as never)
  const face = page(faces)

  const creating = (faces['main'] as { askAgent: (p: string, s: unknown, src: null) => Promise<unknown> })
    .askAgent('start a room', STATUS, null)
  const navigated = face.openRoom('room-1')
  resolveCreate()

  // The new room is only worth adopting while it is still the room the user is heading to.
  await expect(creating).rejects.toThrow('superseded')
  await expect(navigated).resolves.toHaveProperty('binding')
})

it('waits for a creation already in flight before starting another room', async () => {
  const { faces, sessions } = await mounts()
  const face = faces['main'] as {
    askAgent: (prompt: string, status: unknown, source: null) => Promise<unknown>
    resetAgent: () => Promise<unknown>
  }
  sessions.retain.mockImplementationOnce((() => ({
    sessionId: 'created-1', ready: Promise.reject(new Error('refused')), release: vi.fn(),
    binding: {
      session: {
        getSnapshot: () => ({ blank: false, running: false, awaitingFirstTurn: false }),
        prompt: vi.fn(async () => ({ ok: true, value: undefined })),
        rename: vi.fn(async () => ({ ok: true, value: undefined })),
        cancel: vi.fn(async () => ({ ok: true, value: undefined })),
      },
    },
  })) as never)

  // `acquire` assigns the in-flight creation before its first await, so neither call needs to be
  // interleaved by hand: the ask starts one, the reset finds it and waits.
  const inFlight = face.askAgent('start a room', STATUS, null)
  const reset = face.resetAgent()

  await expect(inFlight).rejects.toThrow('refused')
  await reset

  // The reset did not race the failed creation: it waited for it, then started its own room.
  expect(sessions.create).toHaveBeenCalledTimes(2)
})

it('unarchives a room the page has no archived set for', async () => {
  localStorage.setItem(KEY, JSON.stringify({ ids: ['room-1'], active: null }))
  const { faces, workspaces } = await mounts({ byId: { 'room-1': { id: 'room-1' } } })

  await page(faces).archiveRoom('room-1', false)

  // A room can be restored before any archived set was ever written, and the request still goes
  // through rather than failing on a list that does not exist yet.
  expect(workspaces.unarchiveSession).toHaveBeenCalledWith('room-1')
})

it('releases the conversation it was holding when the page goes away', async () => {
  localStorage.setItem(KEY, JSON.stringify({ ids: ['room-1', 'room-2'], active: null }))
  const { faces, sessions, ctx } = await mounts({ byId: { 'room-1': { id: 'room-1' }, 'room-2': { id: 'room-2' } } })
  const face = page(faces)
  await face.openRoom('room-1')
  await face.openRoom('room-2')
  const first = (sessions.retain.mock.results[0]?.value as { release: { mock: { calls: unknown[] } } }).release
  const held = (sessions.retain.mock.results[1]?.value as { release: { mock: { calls: unknown[] } } }).release

  await ctx.fiber.dispose()

  // Reloading or disabling the plugin must not leave either the conversation in view or the one it
  // replaced retained.
  expect(held.mock.calls.length).toBeGreaterThan(0)
  expect(first.mock.calls.length).toBeGreaterThan(0)
})

it('refuses a reference the model cannot receive', async () => {  localStorage.setItem(KEY, JSON.stringify({ ids: ['room-1'], active: 'room-1' }))
  // A format outside the accepted set never reaches the model, so the request fails with a reason
  // rather than sending a part the provider would reject.
  const { faces } = await mounts({ byId: { 'room-1': { id: 'room-1' } }, imageType: 'image/tiff' })
  const face = faces['main'] as {
    askAgent: (prompt: string, status: unknown, source: { filename: string } | null) => Promise<unknown>
  }
  await page(faces).openRoom('room-1')

  await expect(face.askAgent('make it blue', STATUS, { filename: 'a.tiff' }))
    .rejects.toThrow('Unsupported reference image type: image/tiff')
})

it('refuses to open a new Content room when the permission command is unavailable', async () => {
  const { ctx, faces } = await mounts()
  vi.spyOn(ctx.remote.commands, 'execute').mockResolvedValueOnce({ ok: true, value: undefined })
  const face = faces['main'] as { resetAgent: () => Promise<unknown> }
  await expect(face.resetAgent()).rejects.toThrow('Content requires the /permission command')
})
