// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { waitFor } from '@testing-library/react'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import { SlotTestRuntime, stubConfigForm } from '@deepseek-ai/dsh-client-test-runtime'
import { apply, inject } from '../src/client/index.ts'
import { en } from '../src/client/locales.ts'
import { readImageRooms } from '../src/client/room-state.ts'
import type { ComfyImagesStatus } from '@deepseek-ai/dsh-api-comfyui-controller/types'

afterEach(() => { localStorage.clear() })

it.each([undefined, 'custom-content'])('creates Images with its configured preset %s, keeps the profile default model, sets Full Access, and releases references', async (agentPreset) => {
  const runtime = await SlotTestRuntime.create()
  try {
    const locale = new LocaleRuntime(runtime.ctx)
    locale.setLocale('en')
    runtime.ctx.provide('locale', locale)
    runtime.slots.installLocale(locale)
    await runtime.declare({ main: { kind: 'keyed', scope: 'root' }, 'sidebar.panellist': { kind: 'list', scope: 'root' }, 'conversation.session': { kind: 'single', scope: 'session' }, 'conversation.input.model': { kind: 'single', scope: 'session' }, 'conversation.input.permission': { kind: 'single', scope: 'session' } })
    const config = stubConfigForm<{ autoPreview: boolean; agentPreset?: string }>()
    config.publish({ value: { autoPreview: true, ...(agentPreset === undefined ? {} : { agentPreset }) }, status: 'ready' })
    runtime.ctx.provide('configForms', { get: () => config.scope } as never)
    runtime.ctx.provide('pluginNavigation', { openBundle: vi.fn() } as never)
    runtime.ctx.provide('sidebarRightViews', { registerPanel: vi.fn(() => () => {}) })
    const select = vi.fn().mockResolvedValue({ ok: true, value: undefined })
    runtime.ctx.provide('modelDirectories', { directoryFor: () => ({ load: async () => ({ current: { provider: 'deepseek-account', model: 'deepseek-flash' } }), select }) } as never)
    const status: ComfyImagesStatus = { reachable: true, baseUrl: 'http://127.0.0.1:8188', models: [], workflows: [], libraryAvailable: false, error: null }
    const permission = vi.fn(async () => ({ ok: true, value: { commandId: 'permission-command', result: { kind: 'success', text: 'preset danger-full-access' } } }))
    runtime.remote.provideNamespaces({ commands: { execute: permission }, pluginManager: { listBundles: async () => ({ ok: true, value: [{ name: 'dsh-image-gen', enabled: true }] }) }, mcp: { getComfyConnection: async () => ({ ok: true, value: { baseUrl: 'http://127.0.0.1:8188', outputDirectory: '', remote: false } }) }, session: {}, comfyImages: {
      status: async () => ({ ok: true, value: status }), history: async () => ({ ok: true, value: [] }),
      library: async () => ({ ok: true, value: { images: [], total: 0 } }),
    } })
    const mainId = await runtime.sessions.add({ id: 'main' })
    const main = runtime.sessions.retain(mainId, { source: 'mainView' })
    await main.ready
    const imageId = await runtime.sessions.add({ id: 'image-room', snapshot: { blank: true } })
    const create = vi.fn(async () => imageId)
    runtime.sessions.stubCreate(create)
    const feature = await runtime.mount({ inject, apply })
    const view = runtime.renderSlot('main', {}, { entryKey: 'images' })
    await waitFor(() => { expect(runtime.sessions.retainInfo(imageId).getSnapshot().retainedBy.imagesConversation).toBe(1) })
    expect(select).not.toHaveBeenCalled()
    await waitFor(() => { expect(permission).toHaveBeenCalledWith(imageId, '/permission danger-full-access', []) })
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ agentPreset: agentPreset ?? 'content' }))
    expect(view.view.getByRole('button', { name: en['community.settings'] })).toBeTruthy()
    expect(readImageRooms(JSON.parse(localStorage.getItem('aryaai.images.rooms.v1')!)).ids).toEqual(['image-room'])
    await feature.dispose()
    expect(runtime.sessions.retainInfo(imageId).getSnapshot().referenceCount).toBe(0)
    expect(runtime.slots.entries('main')).toHaveLength(0)
    main.release()
  } finally { await runtime.dispose() }
})
