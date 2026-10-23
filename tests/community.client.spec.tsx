// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { CommunityImagesPanel } from '../src/client/CommunityImagesPanel.tsx'
import { CommunityMedia } from '../src/client/CommunityMedia.tsx'
import type { ImagesPanelProps } from '../src/client/ImagesPanel.tsx'
import { en } from '../src/client/locales.ts'

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

it('filters loaded media by kind and filename while attaching the exact selected file', async () => {
  const addMedia = vi.fn(async () => {})
  const media = ['product.png', 'campaign.mp4'].map(filename => ({ filename, subfolder: 'brand', type: 'output' }))
  render(<CommunityMedia {...fixture({ addMedia, library: vi.fn(async () => ({ total: 2,
    images: media.map(image => ({ image, modifiedAt: 0, bytes: 1024 })),
  })) })} revision={0} />)
  await screen.findByText('product.png')
  fireEvent.click(screen.getByRole('button', { name: en['studio.videos'] }))
  expect(screen.queryByText('product.png')).toBeNull()
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'campaign' } })
  fireEvent.click(screen.getByRole('button', { name: en['action.addToChat'] }))
  expect(addMedia).toHaveBeenCalledExactlyOnceWith([media[1]])
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'missing' } })
  expect(screen.getByText(en['studio.noMatches'])).toBeTruthy()
})

it('switches to Library while retaining the resident conversation', async () => {
  const fillDraft = vi.fn(async () => {})
  const props = fixture({ fillDraft, imagePlugin: vi.fn(async () => true),
    resetAgent: vi.fn(async () => ({ sessionId: 'room' }) as never) })
  const view = render(<CommunityImagesPanel {...props} />)
  await screen.findByTestId('resident-chat')
  fireEvent.click(screen.getByRole('button', { name: en['studio.library'] }))
  expect(view.container.querySelector('[data-testid="resident-chat"]')).not.toBeNull()
  expect(view.container.querySelector('main')?.getAttribute('data-studio-view')).toBe('library')
  fireEvent.click(screen.getByRole('button', { name: en['studio.workspace'] }))
  const agentProps = vi.mocked(props.renderSlot).mock.calls.findLast(([name]) => name === 'images.agent')?.[1]
  if (agentProps === undefined || !('onUseStarter' in agentProps)) throw new Error('Missing starter action')
  agentProps.onUseStarter('A film brief')
  await waitFor(() => { expect(fillDraft).toHaveBeenCalledExactlyOnceWith('A film brief') })
  expect(props.askAgent).not.toHaveBeenCalled()
})

it('selects a filtered range without including hidden images', async () => {
  const addMedia = vi.fn(async () => {})
  const media = ['first.mp4', 'hidden.png', 'last.mp4'].map(filename => ({ filename, subfolder: 'clips', type: 'output' }))
  render(<CommunityMedia {...fixture({ addMedia, library: vi.fn(async () => ({ total: 3,
    images: media.map(image => ({ image, modifiedAt: 0, bytes: 1024 })),
  })) })} revision={0} />)
  await screen.findByText('last.mp4')
  fireEvent.click(screen.getByRole('button', { name: en['studio.videos'] }))
  fireEvent.click(screen.getByRole('button', { name: en['selection.start'] }))
  const choices = screen.getAllByRole('button', { name: en['selection.toggle'] })
  fireEvent.click(choices[0]!)
  fireEvent.click(choices[1]!, { shiftKey: true })
  fireEvent.click(screen.getByRole('button', { name: en['action.addToChat'] }))
  await waitFor(() => { expect(addMedia).toHaveBeenCalledExactlyOnceWith([media[0], media[2]]) })
})

it('adds the exact saved image and video to the composer without submitting a generation', async () => {
  const media = ['reference.png', 'clip.mp4'].map(filename => ({ filename, subfolder: 'saved', type: 'output' }))
  const addMedia = vi.fn(async () => {})
  const props = fixture({ addMedia, library: vi.fn(async () => ({ total: 2,
    images: media.map(image => ({ image, modifiedAt: 0, bytes: 1024 })),
  })) })
  render(<CommunityMedia {...props} revision={0} />)
  await screen.findByText('clip.mp4')
  const buttons = screen.getAllByRole('button', { name: en['action.addToChat'] })
  fireEvent.click(buttons[0]!)
  fireEvent.click(buttons[1]!)
  expect(addMedia.mock.calls).toEqual([[ [media[0]] ], [ [media[1]] ]])
  expect(props.askAgent).not.toHaveBeenCalled()
  expect(props.generate).not.toHaveBeenCalled()
})

const EMPTY_ROOMS = { ids: [], active: null } as const

function fixture(overrides: Partial<ImagesPanelProps> = {}): ImagesPanelProps {
  return {
    imagePlugin: vi.fn(async () => false), openImagePlugin: vi.fn(),
    autoPreview: { getSnapshot: () => true, subscribe: () => () => {} },
    rooms: { getSnapshot: () => EMPTY_ROOMS, subscribe: () => () => {} },
    currentAgent: () => undefined, openRoom: vi.fn(), resetAgent: vi.fn(), roomTitle: id => id,
    exportRoom: vi.fn(), askAgent: vi.fn(), openVoiceSettings: vi.fn(),
    status: vi.fn(), history: vi.fn(async () => []), library: vi.fn(async () => ({ images: [], total: 0 })),
    generate: vi.fn(), cancel: vi.fn(),
    remove: vi.fn(), removeImage: vi.fn(), removeImages: vi.fn(), image: vi.fn(),
    readOutputFolder: vi.fn(async () => 'C:\\media'),
    saveOutputFolder: vi.fn(async () => {}),
    reveal: vi.fn(async () => {}),
    SessionProvider: ({ children }) => children, renderSlot: vi.fn(() => <div data-testid="resident-chat" />),
    t: key => en[key as keyof typeof en], ...overrides,
  }
}

it('offers community installation without probing ComfyUI or creating a session', async () => {
  const props = fixture()
  const view = render(<CommunityImagesPanel {...props} />)
  await screen.findByText(en['community.installTitle'])
  expect(view.container).toMatchSnapshot()
  fireEvent.click(screen.getByRole('button', { name: en['community.installAction'] }))
  expect(props.openImagePlugin).toHaveBeenCalledOnce()
  expect(props.resetAgent).not.toHaveBeenCalled()
  expect(props.status).not.toHaveBeenCalled()
  expect(props.askAgent).not.toHaveBeenCalled()
})

it('mounts resident chat after enablement without submitting a generation', async () => {
  const props = fixture({ imagePlugin: vi.fn(async () => true), resetAgent: vi.fn(async () => ({ sessionId: 'room' }) as never) })
  render(<CommunityImagesPanel {...props} />)
  await screen.findByTestId('resident-chat')
  expect(props.resetAgent).toHaveBeenCalledOnce()
  expect(props.askAgent).not.toHaveBeenCalled()
  expect(props.status).not.toHaveBeenCalled()
})

it('keeps an availability failure retryable', async () => {
  const available = vi.fn().mockRejectedValueOnce(new Error('Plugin list unavailable')).mockResolvedValue(true)
  const props = fixture({ imagePlugin: available, resetAgent: vi.fn(async () => ({ sessionId: 'room' }) as never) })
  render(<CommunityImagesPanel {...props} />)
  expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Plugin list unavailable')
  fireEvent.click(screen.getByRole('button', { name: en['action.refresh'] }))
  await waitFor(() => { expect(screen.getByTestId('resident-chat')).toBeTruthy() })
})

it('keeps saved local photos available beside chat and loads the next library page', async () => {
  const image = { filename: 'saved.png', subfolder: '', type: 'output' }
  const stored = { image, modifiedAt: 0, bytes: 1024 }
  const library = vi.fn(async (offset: number) => ({ images: offset === 0 ? [stored] : [], total: 2 }))
  render(<CommunityImagesPanel {...fixture({ library })} />)
  await screen.findByText('saved.png')
  expect(screen.getByRole('region', { name: en['gallery.library'] })).toBeDefined()
  fireEvent.click(screen.getByRole('button', { name: en['gallery.loadMore'] }))
  await waitFor(() => { expect(library).toHaveBeenCalledWith(1) })
})

it('reports a media service failure while keeping plugin setup available', async () => {
  render(<CommunityImagesPanel {...fixture({ history: vi.fn(async () => { throw new Error('Media unavailable') }) })} />)
  await screen.findByText('Media unavailable')
  expect(screen.getByRole('button', { name: en['community.installAction'] })).toBeDefined()
})

it('confirms bulk deletion and retains photos the server could not delete', async () => {
  const images = ['first.png', 'second.png'].map(filename => ({ filename, subfolder: '', type: 'output' }))
  const removeImages = vi.fn(async () => ({ deleted: [images[0]!], failed: [{ image: images[1]!, message: 'locked' }] }))
  const props = fixture({ removeImages, library: vi.fn(async () => ({
    images: images.map(image => ({ image, modifiedAt: 0, bytes: 1024 })), total: 2,
  })) })
  render(<CommunityImagesPanel {...props} />)
  await screen.findByText('first.png')
  fireEvent.click(screen.getAllByRole('button', { name: en['selection.start'] })[0]!)
  fireEvent.click(screen.getByRole('button', { name: en['selection.selectLoaded'] }))
  fireEvent.click(screen.getByRole('button', { name: en['selection.delete'] }))
  expect(removeImages).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: en['delete.confirm'] }))
  await waitFor(() => { expect(removeImages).toHaveBeenCalledWith(images) })
  await waitFor(() => { expect(screen.queryByText('first.png')).toBeNull() })
  expect(screen.getByText('second.png')).toBeDefined()
  expect(screen.getByRole('alert').textContent).toBe(en['selection.deleteFailed'])
})

it('keeps the selection when preparing a ZIP download fails', async () => {
  const image = { filename: 'saved.png', subfolder: '', type: 'output' }
  vi.stubGlobal('fetch', vi.fn(async () => new Response('Archive unavailable', { status: 503 })))
  render(<CommunityImagesPanel {...fixture({ library: vi.fn(async () => ({
    images: [{ image, modifiedAt: 0, bytes: 1024 }], total: 1,
  })) })} />)
  await screen.findByText('saved.png')
  fireEvent.click(screen.getAllByRole('button', { name: en['selection.start'] })[0]!)
  fireEvent.click(screen.getByRole('button', { name: en['selection.selectLoaded'] }))
  fireEvent.click(screen.getByRole('button', { name: en['selection.download'] }))
  await screen.findByText('Archive unavailable')
  expect(screen.getAllByRole('button', { name: en['selection.toggle'] })
    .some(button => button.getAttribute('aria-pressed') === 'true')).toBe(true)
})

it('blocks image chat until running and blocks it again during a server transition', async () => {
  const props = fixture({ imagePlugin: vi.fn(async () => true), resetAgent: vi.fn(async () => ({ sessionId: 'room' }) as never) })
  render(<CommunityImagesPanel {...props} />)
  await screen.findByTestId('resident-chat')
  const calls = vi.mocked(props.renderSlot).mock.calls
  const owner = calls.find(([name]) => name === 'images.connection')?.[1]
  if (owner === undefined || !('onServerState' in owner) || owner.onServerState === undefined) throw new Error('Missing server state reporter')
  const report = owner.onServerState
  expect(vi.mocked(props.renderSlot).mock.calls.at(-1)?.[1]).toEqual(expect.objectContaining({ readOnly: true }))
  await act(async () => { report('running') })
  expect(vi.mocked(props.renderSlot).mock.calls.findLast(([name]) => name === 'images.agent')?.[1])
    .toEqual(expect.objectContaining({ readOnly: false }))
  await act(async () => { report('stopping') })
  expect(vi.mocked(props.renderSlot).mock.calls.findLast(([name]) => name === 'images.agent')?.[1])
    .toEqual(expect.objectContaining({ readOnly: true }))
})

it('accepts media dropped into a running conversation without starting generation', async () => {
  const addMedia = vi.fn(async () => {})
  const addFiles = vi.fn(async () => {})
  const props = fixture({ addMedia, addFiles, imagePlugin: vi.fn(async () => true), resetAgent: vi.fn(async () => ({ sessionId: 'room' }) as never) })
  render(<CommunityImagesPanel {...props} />)
  await screen.findByTestId('resident-chat')
  const reporter = vi.mocked(props.renderSlot).mock.calls.find(([name]) => name === 'images.connection')?.[1]
  if (reporter === undefined || !('onServerState' in reporter) || reporter.onServerState === undefined) throw new Error('Missing server state reporter')
  await act(async () => { reporter.onServerState?.('running') })
  const stage = screen.getByText(en['room.mediaDrop']).parentElement!
  const reference = { filename: 'chosen.mp4', subfolder: 'saved', type: 'output' }
  fireEvent.drop(stage, { dataTransfer: { getData: () => JSON.stringify(reference), files: [] } })
  await waitFor(() => { expect(addMedia).toHaveBeenCalledWith([reference]) })
  const file = new File(['reference'], 'external.png', { type: 'image/png' })
  fireEvent.drop(stage, { dataTransfer: { getData: () => '', files: [file] } })
  await waitFor(() => { expect(addFiles).toHaveBeenCalledWith([file]) })
  expect(props.generate).not.toHaveBeenCalled()
  expect(props.askAgent).not.toHaveBeenCalled()
})

it('explains an unconfigured output folder instead of reporting the controller error', async () => {
  const library = vi.fn(async () => { throw new Error('Configure outputDirectory to browse local ComfyUI images') })
  const props = fixture({ library, readOutputFolder: vi.fn(async () => '') })
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ ok: true, candidates: [{ path: 'C:\\Comfy\\output', files: 3 }], canOpen: true, fileManager: 'explorer' }),
    { status: 200, headers: { 'content-type': 'application/json' } })))
  render(<CommunityMedia {...props} revision={0} />)

  // The library route rejects while no folder is configured, so the panel must not call it and
  // must offer the folder choice instead of the raw controller message the user cannot act on.
  expect(await screen.findByText(en['gallery.chooseFolder'])).toBeTruthy()
  // The fixture's `t` does not interpolate, so the detected folder is asserted by its action.
  expect(screen.getByRole('button', { name: en['connection.folderUseDetected'] })).toBeTruthy()
  expect(library).not.toHaveBeenCalled()
  expect(screen.queryByRole('alert')).toBeNull()
})

it('saves the detected folder without opening the connection dialog', async () => {
  const saveOutputFolder = vi.fn(async () => {})
  const props = fixture({ readOutputFolder: vi.fn(async () => ''), saveOutputFolder })
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ ok: true, candidates: [{ path: 'C:\\Comfy\\output', files: 3 }], canOpen: true, fileManager: 'explorer' }),
    { status: 200, headers: { 'content-type': 'application/json' } })))
  render(<CommunityMedia {...props} revision={0} />)

  fireEvent.click(await screen.findByRole('button', { name: en['connection.folderUseDetected'] }))
  await waitFor(() => { expect(saveOutputFolder).toHaveBeenCalledExactlyOnceWith('C:\\Comfy\\output') })
})

it('reveals a saved file in the host file manager', async () => {
  const image = { filename: 'saved.png', subfolder: 'saved', type: 'output' }
  const reveal = vi.fn(async () => {})
  const props = fixture({ reveal, library: vi.fn(async () => ({ total: 1, images: [{ image, modifiedAt: 0, bytes: 1024 }] })) })
  render(<CommunityMedia {...props} revision={0} />)

  fireEvent.click(await screen.findByRole('button', { name: en['action.showInExplorer'] }))
  await waitFor(() => { expect(reveal).toHaveBeenCalledExactlyOnceWith(image) })
})
