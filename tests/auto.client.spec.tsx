import type {} from '@deepseek-ai/dsh-client-ui-images/client'
// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import type { ComfyImagesStatus } from '@deepseek-ai/dsh-api-comfyui-controller/types'
import { ImagesPanel, type ImagesPanelProps } from '../src/client/ImagesPanel.tsx'
import { imageAgentPrompt, imageUserText } from '../src/client/agent-prompt.ts'
import { en } from '../src/client/locales.ts'

const EMPTY_ROOMS = { ids: [], active: null } as const

// jsdom does not implement scrolling, and the panel scrolls a chosen run into view. Without this
// the call throws inside the click handler, which unmounts the panel and fails every later
// assertion in the test.
Element.prototype.scrollIntoView = () => {}

it('shows only the user instruction while preserving ordinary messages and request delimiters in user text', () => {
  const instruction = 'Animate this photo\n\nUser request:\nKeep this line too'
  const logged = imageAgentPrompt(instruction, status, null)
  expect(imageUserText(logged)).toBe(instruction)
  expect(logged).toContain('image-to-video')
  expect(imageUserText('User request:\nAn ordinary message')).toBe('User request:\nAn ordinary message')
  // Both openings are recognised: a session logged before the generation tool existed still
  // carries the older wording.
  expect(imageUserText('Images task: use the enabled ComfyUI MCP tools')).toBe('Images task: use the enabled ComfyUI MCP tools')
  expect(imageUserText('Images task: choose and execute a suitable installed workflow\n\nUser request:\nDo it')).toBe('Do it')
})

afterEach(cleanup)

it('keeps Auto available when the configured server is offline and does not request its history', async () => {
  const history = vi.fn().mockRejectedValue(new Error('fetch failed'))
  render(<ImagesPanel {...roomProps({ status: async () => ({ ...status, reachable: false, error: 'fetch failed' }), history })} />)
  const prompt = screen.getByRole('textbox', { name: en['composer.placeholder'] })
  fireEvent.change(prompt, { target: { value: 'Create an anime portrait using the remote MCP server' } })
  await waitFor(() => { expect(screen.getByRole('button', { name: en['room.send'] }).hasAttribute('disabled')).toBe(false) })
  expect(history).not.toHaveBeenCalled()
})

it('fills the composer from a starter example while the conversation is empty', async () => {
  // A pending room keeps the empty state on screen; an example fills the draft and
  // must not submit anything by itself.
  const resetAgent = vi.fn<ImagesPanelProps['resetAgent']>(() => new Promise(() => {}))
  render(<ImagesPanel {...roomProps({ resetAgent })} />)
  const starter = await screen.findByRole('button', { name: en['starter.video'] })
  fireEvent.click(starter)
  expect(screen.getByRole('textbox', { name: en['composer.placeholder'] })).toHaveProperty('value', en['starter.video'])
})

it('downloads the room conversation through the export provider', async () => {
  const exportRoom = vi.fn<ImagesPanelProps['exportRoom']>().mockResolvedValue(true)
  render(<ImagesPanel {...roomProps({ exportRoom })} />)
  const button = await screen.findByRole('button', { name: en['action.export'] })
  await waitFor(() => { expect(button.hasAttribute('disabled')).toBe(false) })
  fireEvent.click(button)
  await waitFor(() => { expect(exportRoom).toHaveBeenCalledOnce() })
})

it('says so when the deployment provides no export provider', async () => {
  const exportRoom = vi.fn<ImagesPanelProps['exportRoom']>().mockResolvedValue(false)
  render(<ImagesPanel {...roomProps({ exportRoom })} />)
  const button = await screen.findByRole('button', { name: en['action.export'] })
  await waitFor(() => { expect(button.hasAttribute('disabled')).toBe(false) })
  fireEvent.click(button)
  expect(await screen.findByRole('alert')).toHaveProperty('textContent', en['notice.exportUnavailable'])
})

it('starts a blank room on a brand-new panel, so the model seat has a session to bind to', async () => {
  // The model and permission seats are session-scoped: without a room the panel has
  // no model control at all, which reads as "you cannot choose a model here".
  const resetAgent = vi.fn<ImagesPanelProps['resetAgent']>().mockResolvedValue({} as never)
  const renderSlot = vi.fn(() => null)
  render(<ImagesPanel {...roomProps({ resetAgent, renderSlot })} />)
  await waitFor(() => { expect(resetAgent).toHaveBeenCalledOnce() })
  await waitFor(() => { expect(renderSlot).toHaveBeenCalledWith('images.agent.controls', expect.anything()) })
})

function roomProps(overrides: Partial<ImagesPanelProps> = {}): ImagesPanelProps {
  return {
    imagePlugin: async () => true, openImagePlugin: vi.fn(),
    autoPreview: { getSnapshot: () => true, subscribe: () => () => {} },
    t: key => en[key as keyof typeof en] ?? key,
    rooms: { getSnapshot: () => EMPTY_ROOMS, subscribe: () => () => {} },
    // The room effect awaits whichever of these the catalog asks for, so both return promises.
    openRoom: vi.fn<ImagesPanelProps['openRoom']>(async () => ({}) as never), roomTitle: id => id,
    currentAgent: () => undefined, resetAgent: vi.fn<ImagesPanelProps['resetAgent']>().mockResolvedValue({} as never), exportRoom: vi.fn<ImagesPanelProps['exportRoom']>().mockResolvedValue(true), askAgent: vi.fn(), openVoiceSettings: vi.fn(),
    status: async () => status, history: async () => [], library: async () => ({ images: [], total: 0 }),
    generate: vi.fn(), cancel: vi.fn(), remove: vi.fn(), removeImage: vi.fn(), removeImages: vi.fn(), image: vi.fn(async () => 'data:image/png;base64,AAA'),
    SessionProvider: ({ children }) => children, renderSlot: () => null,
    ...overrides,
  }
}

it('links a stored image to its bytes through the media route', async () => {
  const page = { images: [{ image: { filename: 'a.png', subfolder: 'sub', type: 'input' }, modifiedAt: 0, bytes: 1 }], total: 1 }
  // Local media is offered only where the Host reports a library, so the status carries that.
  render(<ImagesPanel {...roomProps({ library: async () => page, status: async () => ({ ...status, libraryAvailable: true }) })} />)

  // The card's download anchor is the panel's only route to a stored file, so the address it
  // builds is the contract with the Host's media route.
  const link = await screen.findByRole('link', { name: en['action.download'] })
  const href = decodeURIComponent(link.getAttribute('href') ?? '')
  expect(href).toContain('api/comfyui-media')
  expect(href).toContain('filename=a.png')
  expect(href).toContain('subfolder=sub')
})

it('renders the gallery card for a retained run', async () => {
  const generation = {
    promptId: 'run-1', state: 'complete' as const, workflow: null, workflowLabel: 'Create',
    prompt: 'a fox', negativePrompt: '', model: 'sd', modelLabel: 'SD',
    width: 512, height: 512, steps: 8, cfg: 1, seed: 1,
    images: [{ filename: 'a.png', subfolder: '', type: 'input' }],
  }
  render(<ImagesPanel {...roomProps({ history: async () => [generation] })} />)

  // The gallery is the panel's record of finished work: a retained run with an image shows a card
  // that opens it, which is the control every selection action is built on.
  const open = await screen.findByRole('button', { name: en['gallery.open'] })
  expect(open).toBeDefined()
})

it('downloads a card selected in the gallery as one archive', async () => {
  const generation = {
    promptId: 'run-1', state: 'complete' as const, workflow: null, workflowLabel: 'Create',
    prompt: 'a fox', negativePrompt: '', model: 'sd', modelLabel: 'SD',
    width: 512, height: 512, steps: 8, cfg: 1, seed: 1,
    images: [{ filename: 'a.png', subfolder: '', type: 'input' }],
  }
  const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, text: async () => '' } as Response)
  const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
  render(<ImagesPanel {...roomProps({ history: async () => [generation] })} />)

  fireEvent.click(await screen.findByRole('button', { name: en['selection.start'] }))
  fireEvent.click(await screen.findByRole('button', { name: en['selection.selectLoaded'] }))
  fireEvent.click(await screen.findByRole('button', { name: en['selection.download'] }))

  // The selection leaves as one archive, and the panel checks the address before handing it to the
  // browser rather than starting a download that cannot succeed.
  await waitFor(() => { expect(clickSpy).toHaveBeenCalled() })
  const called = decodeURIComponent(fetchSpy.mock.calls[0]?.[0] as string)
  expect(called).toContain('api/comfyui-archive')
  expect(called).toContain('filename')

  fetchSpy.mockResolvedValue({ ok: false, text: async () => 'archive unavailable' } as Response)
  fireEvent.click(await screen.findByRole('button', { name: en['selection.download'] }))
  expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'archive unavailable')

  fetchSpy.mockRestore()
  clickSpy.mockRestore()
})

it('clears a selection and offers the bulk delete for the runs it holds', async () => {
  const generation = {
    promptId: 'run-1', state: 'complete' as const, workflow: null, workflowLabel: 'Create',
    prompt: 'a fox', negativePrompt: '', model: 'sd', modelLabel: 'SD',
    width: 512, height: 512, steps: 8, cfg: 1, seed: 1,
    images: [{ filename: 'a.png', subfolder: '', type: 'input' }],
  }
  render(<ImagesPanel {...roomProps({ history: async () => [generation] })} />)

  fireEvent.click(await screen.findByRole('button', { name: en['selection.start'] }))
  fireEvent.click(await screen.findByRole('button', { name: en['selection.selectLoaded'] }))
  const download = await screen.findByRole('button', { name: en['selection.download'] })
  await waitFor(() => { expect(download.hasAttribute('disabled')).toBe(false) })

  // Clearing gives up the selection, so the actions that need one go back to being unavailable.
  fireEvent.click(screen.getByRole('button', { name: en['selection.clear'] }))
  await waitFor(() => { expect(screen.getByRole('button', { name: en['selection.download'] }).hasAttribute('disabled')).toBe(true) })

  fireEvent.click(screen.getByRole('button', { name: en['selection.selectLoaded'] }))
  await waitFor(() => { expect(screen.getByRole('button', { name: en['selection.removeRuns'] }).hasAttribute('disabled')).toBe(false) })
  fireEvent.click(screen.getByRole('button', { name: en['selection.removeRuns'] }))

  // Removing runs confirms first: the dialog names what it is about to remove.
  expect(await screen.findByRole('dialog')).toBeDefined()
})

it('opens a retained image in the viewer and loads its bytes once', async () => {
  const generation = {
    promptId: 'run-1', state: 'complete' as const, workflow: null, workflowLabel: 'Create',
    prompt: 'a fox', negativePrompt: '', model: 'sd', modelLabel: 'SD',
    width: 512, height: 512, steps: 8, cfg: 1, seed: 1,
    images: [{ filename: 'a.png', subfolder: '', type: 'input' }],
  }
  const image = vi.fn(async () => 'data:image/png;base64,AAA')
  const view = render(<ImagesPanel {...roomProps({ history: async () => [generation], image })} />)

  // Opening a card loads its bytes once and shows them; the card is not opened for selection.
  fireEvent.click(await screen.findByRole('button', { name: en['gallery.open'] }))
  await waitFor(() => { expect(image).toHaveBeenCalled() })
  expect(view.container.querySelector('img[src^="data:image/png"]')).not.toBeNull()
})

it('confirms a deletion and cancels it without removing anything', async () => {
  const generation = {
    promptId: 'run-1', state: 'complete' as const, workflow: null, workflowLabel: 'Create',
    prompt: 'a fox', negativePrompt: '', model: 'sd', modelLabel: 'SD',
    width: 512, height: 512, steps: 8, cfg: 1, seed: 1,
    images: [{ filename: 'a.png', subfolder: '', type: 'input' }],
  }
  const remove = vi.fn(async () => {})
  render(<ImagesPanel {...roomProps({ history: async () => [generation], remove })} />)
  const del = await screen.findByRole('button', { name: en['action.delete'] })

  // Cancelling leaves the run alone: the dialog closes and nothing is removed.
  fireEvent.click(del)
  expect(await screen.findByRole('dialog')).toBeDefined()
  fireEvent.click(screen.getByRole('button', { name: en['delete.cancel'] }))
  await waitFor(() => { expect(screen.queryByRole('dialog')).toBeNull() })
  expect(remove).not.toHaveBeenCalled()

  // Confirming removes the run the card was showing, identified by its prompt id.
  fireEvent.click(screen.getByRole('button', { name: en['action.delete'] }))
  fireEvent.click(await screen.findByRole('button', { name: en['delete.confirm'] }))
  await waitFor(() => { expect(remove).toHaveBeenCalledWith('run-1') })
})

it('reuses a run and edits its image through the card actions', async () => {
  const generation = {
    promptId: 'run-1', state: 'complete' as const, workflow: null, workflowLabel: 'Create',
    prompt: 'a fox in snow', negativePrompt: '', model: 'sd', modelLabel: 'SD',
    width: 512, height: 512, steps: 8, cfg: 1, seed: 1,
    images: [{ filename: 'a.png', subfolder: '', type: 'input' }],
  }
  render(<ImagesPanel {...roomProps({ history: async () => [generation] })} />)

  // Reuse puts the run's prompt back in the composer for another generation.
  fireEvent.click(await screen.findByRole('button', { name: en['action.reuse'] }))
  await waitFor(() => {
    expect(screen.getByRole('textbox', { name: en['composer.placeholder'] })).toHaveProperty('value', 'a fox in snow')
  })
})

it('opens and closes the viewer of a stored library image', async () => {
  const page = { images: [{ image: { filename: 'stored.png', subfolder: 'sub', type: 'input' }, modifiedAt: 0, bytes: 2048 }], total: 1 }
  render(<ImagesPanel {...roomProps({ library: async () => page, status: async () => ({ ...status, libraryAvailable: true }) })} />)

  // A stored image is a different card from a retained run: it has no generation, and its download
  // link reaches the media route through the Host's output folder.
  const link = await screen.findByRole('link', { name: en['action.download'] })
  expect(decodeURIComponent(link.getAttribute('href') ?? '')).toContain('filename=stored.png')

  fireEvent.click(await screen.findByRole('button', { name: en['gallery.open'] }))
  const viewer = await screen.findByRole('dialog')
  expect(viewer).toBeDefined()

  fireEvent.click(within(viewer).getByRole('button', { name: en['gallery.close'] }))
  await waitFor(() => { expect(screen.queryByRole('dialog')).toBeNull() })
})

it('refuses an attachment the model cannot receive', async () => {
  const view = render(<ImagesPanel {...roomProps()} />)
  const picker = view.container.querySelector<HTMLInputElement>('input[type="file"]')
  if (picker === null) throw new Error('Expected reference picker')

  // A format outside the accepted set is refused with a reason, and nothing is attached.
  fireEvent.change(picker, { target: { files: [new File(['x'], 'a.tiff', { type: 'image/tiff' })] } })
  expect(await screen.findByRole('alert')).toHaveProperty('textContent', en['composer.uploadType'])
  expect(screen.queryByText('a.tiff')).toBeNull()
})

it('supplies a retained image as the reference for an edit', async () => {
  const generation = {
    promptId: 'run-1', state: 'complete' as const, workflow: null, workflowLabel: 'Create',
    prompt: 'a fox', negativePrompt: '', model: 'sd', modelLabel: 'SD',
    width: 512, height: 512, steps: 8, cfg: 1, seed: 1,
    images: [{ filename: 'a.png', subfolder: '', type: 'input' }],
  }
  render(<ImagesPanel {...roomProps({ history: async () => [generation] })} />)

  // Editing takes the retained image as the next request's reference rather than only its prompt.
  fireEvent.click(await screen.findByRole('button', { name: en['action.editImage'] }))
  expect(await screen.findByText('a.png')).toBeDefined()
})

it('reports a Host the panel could not read', async () => {
  render(<ImagesPanel {...roomProps({ status: async () => { throw new Error('comfy unreachable') } })} />)

  // A controller that cannot be read is reported rather than leaving the panel silently empty.
  expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'comfy unreachable')
})

it('reports a library the Host could not list', async () => {
  render(<ImagesPanel {...roomProps({
    library: async () => { throw new Error('output folder unreadable') },
    status: async () => ({ ...status, libraryAvailable: true }),
  })} />)

  // A deployment with an output folder it cannot read still loads the panel and says why the
  // library is missing, rather than showing an empty gallery as if nothing were retained.
  expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'output folder unreadable')
})

it('inserts dictation at the captured span and refuses a stale revision', async () => {
  // The panel builds this shape and hands it to the dictation slot, so the test captures the props
  // rather than rendering the control.
  interface Activity {
    captureInsertion: () => { start: number; end: number; draftRev: number }
    insertText: (text: string, span: { start: number; end: number; draftRev: number }) => boolean
  }
  const captured: { inputActions: Activity | undefined } = { inputActions: undefined }
  const prompt = 'a fox in the snow'
  render(<ImagesPanel {...roomProps({
    renderSlot: (name: string, props: unknown) => { if (name === 'images.prompt.activity') captured.inputActions = (props as typeof captured).inputActions; return null },
  })} />)
  const field = screen.getByRole('textbox', { name: en['composer.placeholder'] })
  fireEvent.change(field, { target: { value: prompt } })

  // The control captures the selection it will insert into, and insertion is refused once the draft
  // has moved on: otherwise dictated text lands in a prompt the speaker never saw.
  const span = captured.inputActions?.captureInsertion()
  expect(span).toBeDefined()
  const stale = { ...(span ?? { start: 0, end: 0, draftRev: 0 }), draftRev: -1 }
  expect(captured.inputActions?.insertText('and ice', stale)).toBe(false)
  fireEvent.change(field, { target: { value: 'a fox' } })
  const fresh = captured.inputActions?.captureInsertion()
  expect(captured.inputActions?.insertText(' and ice', fresh ?? { start: 0, end: 0, draftRev: 0 })).toBe(true)
  // The dictated text lands in the prompt; jsdom does not track a caret, so the position it is
  // inserted at is the captured span rather than one a browser would have produced.
  await waitFor(() => {
    const value = document.querySelector('textarea')?.value ?? ''
    expect(value).toContain('and ice')
    expect(value).toContain('a fox')
    expect(value.length).toBe(' and icea fox'.length)
  })
})

it('offers the direct form and gates Generate on a prompt', async () => {
  render(<ImagesPanel {...roomProps()} />)

  // The Advanced form is the direct path: it offers Generate, which the conversation view does not.
  fireEvent.click(await screen.findByRole('button', { name: en['composer.advanced'] }))

  const generate = await screen.findByRole('button', { name: en['composer.generate'] })
  expect(generate.hasAttribute('disabled')).toBe(true)

  // A prompt is the one requirement this workflow has, so supplying it enables Generate.
  fireEvent.change(screen.getByRole('textbox', { name: en['composer.placeholder'] }), { target: { value: 'a fox' } })
  await waitFor(() => { expect(screen.getByRole('button', { name: en['composer.generate'] }).hasAttribute('disabled')).toBe(false) })
})

it('submits the direct form as a generation with the draft it was showing', async () => {
  const generate = vi.fn<ImagesPanelProps['generate']>(async () => ({ promptId: 'prompt-9' }) as never)
  render(<ImagesPanel {...roomProps({ generate })} />)
  fireEvent.click(await screen.findByRole('button', { name: en['composer.advanced'] }))
  fireEvent.change(await screen.findByRole('textbox', { name: en['composer.placeholder'] }), { target: { value: 'a fox' } })

  const button = await screen.findByRole('button', { name: en['composer.generate'] })
  await waitFor(() => { expect(button.hasAttribute('disabled')).toBe(false) })
  fireEvent.click(button)

  // The draft the user can see is what the Host is asked to run, and the run is then reported as
  // pending until history carries it.
  await waitFor(() => { expect(generate).toHaveBeenCalled() })
  expect(generate.mock.calls[0]?.[0]).toMatchObject({ prompt: 'a fox' })
  expect(await screen.findByText(en['pending.title'])).toBeDefined()
})

it('cancels a pending run and stops reporting it', async () => {
  const generate = vi.fn<ImagesPanelProps['generate']>(async () => ({ promptId: 'prompt-9' }) as never)
  const cancel = vi.fn(async () => {})
  render(<ImagesPanel {...roomProps({ generate, cancel })} />)
  fireEvent.click(await screen.findByRole('button', { name: en['composer.advanced'] }))
  fireEvent.change(await screen.findByRole('textbox', { name: en['composer.placeholder'] }), { target: { value: 'a fox' } })
  fireEvent.click(await screen.findByRole('button', { name: en['composer.generate'] }))
  await screen.findByText(en['pending.title'])

  // Cancelling asks the Host to stop the run and takes it off the pending list rather than leaving
  // it reported as in flight.
  fireEvent.click(screen.getByRole('button', { name: en['action.cancel'] }))
  await waitFor(() => { expect(cancel).toHaveBeenCalledWith('prompt-9') })
  await waitFor(() => { expect(screen.queryByText(en['pending.title'])).toBeNull() })
})

it('holds an edit workflow until a reference is supplied', async () => {
  const edit = {
    id: 'edit', output: 'image' as const, label: 'Edit', source: 'saved' as const, available: true, unavailableReason: null,
    modelId: null, starterPrompt: null, width: 512, height: 512, batchSize: 1, recommendedSteps: 8,
    recommendedCfg: 1, supportsNegativePrompt: false, task: 'edit' as const,
  }
  render(<ImagesPanel {...roomProps({ status: async () => ({ ...status, workflows: [edit as never] }) })} />)
  fireEvent.click(await screen.findByRole('button', { name: en['composer.advanced'] }))
  fireEvent.change(await screen.findByRole('textbox', { name: en['composer.placeholder'] }), { target: { value: 'a fox' } })

  // A prompt is not enough for a reference workflow: without one there is nothing to edit.
  await waitFor(() => {
    expect(screen.getByRole('button', { name: en['composer.generate'] }).hasAttribute('disabled')).toBe(true)
  })
})

it('takes the size and sampler the direct form was given', async () => {
  render(<ImagesPanel {...roomProps()} />)
  fireEvent.click(await screen.findByRole('button', { name: en['composer.advanced'] }))
  await screen.findByRole('button', { name: en['composer.generate'] })

  // The selects are the draft the Host will be asked for, so each change has to reach them.
  const size = screen.getByLabelText(en['composer.size'])
  const landscape = screen.getByRole('option', { name: en['composer.sizeLandscape'] }).getAttribute('value') ?? ''
  fireEvent.change(size, { target: { value: landscape } })
  expect(screen.getByLabelText(en['composer.size'])).toHaveProperty('value', landscape)

  const steps = screen.getByLabelText(en['composer.steps'])
  fireEvent.change(steps, { target: { value: '24' } })
  expect(screen.getByLabelText(en['composer.steps'])).toHaveProperty('value', '24')
})

it('archives the room the panel is showing', async () => {
  const archiveRoom = vi.fn<NonNullable<ImagesPanelProps['archiveRoom']>>(async () => {})
  // getSnapshot must return the same reference until the fact moves, or React re-renders forever.
  const roomState = { ids: ['room-1'] as never, active: 'room-1' as never }
  render(<ImagesPanel {...roomProps({
    rooms: { getSnapshot: () => roomState, subscribe: () => () => {} },
    roomTitle: () => 'Room one',
    archiveRoom,
  })} />)

  // The room's actions appear on hover, so the row is hovered before its controls are queried.
  const title = await screen.findByText('Room one')
  fireEvent.mouseEnter(title.parentElement ?? title)
  fireEvent.click(await screen.findByRole('button', { name: en['room.archive'] }))

  await waitFor(() => { expect(archiveRoom).toHaveBeenCalled() })
  expect(archiveRoom.mock.calls[0]?.[1]).toBe(true)
})

it('restores an archived room back into the list', async () => {
  const archiveRoom = vi.fn<NonNullable<ImagesPanelProps['archiveRoom']>>(async () => {})
  const roomState = { ids: ['room-1'] as never, active: null, archivedIds: ['room-1'] as never }
  render(<ImagesPanel {...roomProps({
    rooms: { getSnapshot: () => roomState, subscribe: () => () => {} },
    roomTitle: () => 'Room one',
    archiveRoom,
  })} />)

  // An archived room still holds its images, so the panel offers the way back rather than only the
  // way out. Archived rooms are listed under their own heading.
  fireEvent.click(await screen.findByRole('button', { name: en['room.archived'] }))
  const title = await screen.findByText('Room one')
  fireEvent.mouseEnter(title.parentElement ?? title)
  fireEvent.click(await screen.findByRole('button', { name: en['room.restore'] }))

  await waitFor(() => { expect(archiveRoom).toHaveBeenCalled() })
  expect(archiveRoom.mock.calls[0]?.[1]).toBe(false)
})

it('reports an attachment it could not read', async () => {
  const view = render(<ImagesPanel {...roomProps()} />)
  const picker = view.container.querySelector<HTMLInputElement>('input[type="file"]')
  if (picker === null) throw new Error('Expected reference picker')

  // A read that fails is reported rather than leaving the attachment silently missing.
  const failing = vi.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(function (this: FileReader) {
    queueMicrotask(() => { this.onerror?.(new Event('error') as ProgressEvent<FileReader>) })
  })
  try {
    fireEvent.change(picker, { target: { files: [new File(['x'], 'a.png', { type: 'image/png' })] } })
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', en['notice.failed'])
    expect(screen.queryByText('a.png')).toBeNull()
  } finally {
    failing.mockRestore()
  }
})

it('returns the caret to the prompt after dictation', async () => {
  interface Activity {
    captureInsertion: () => { start: number; end: number; draftRev: number }
    insertText: (text: string, span: { start: number; end: number; draftRev: number }) => boolean
  }
  const captured: { inputActions: Activity | undefined } = { inputActions: undefined }
  render(<ImagesPanel {...roomProps({
    renderSlot: (name: string, props: unknown) => { if (name === 'images.prompt.activity') captured.inputActions = (props as typeof captured).inputActions; return null },
  })} />)
  const field = await screen.findByRole('textbox', { name: en['composer.placeholder'] })
  fireEvent.change(field, { target: { value: 'a fox' } })

  // Insertion hands the caret back so the speaker can keep editing where the words landed, which
  // happens on the next frame rather than in the click.
  const span = captured.inputActions?.captureInsertion()
  expect(captured.inputActions?.insertText(' and ice', span ?? { start: 0, end: 0, draftRev: 0 })).toBe(true)
  await waitFor(() => { expect(document.activeElement).toBe(field) })
})

it('keeps asking the Host about a run it is still waiting for', async () => {
  const generate = vi.fn<ImagesPanelProps['generate']>(async () => ({ promptId: 'prompt-9' }) as never)
  const readStatus = vi.fn(async () => status as never)
  render(<ImagesPanel {...roomProps({ generate, status: readStatus })} />)
  fireEvent.click(await screen.findByRole('button', { name: en['composer.advanced'] }))
  fireEvent.change(await screen.findByRole('textbox', { name: en['composer.placeholder'] }), { target: { value: 'a fox' } })
  fireEvent.click(await screen.findByRole('button', { name: en['composer.generate'] }))
  await screen.findByText(en['pending.title'])
  const asked = readStatus.mock.calls.length

  // A run that has not reached history is polled on its own interval, so the panel notices when it
  // lands without the user doing anything. The wait is real because the interval is.
  await waitFor(() => { expect(readStatus.mock.calls.length).toBeGreaterThan(asked) }, { timeout: 2_500 })
})

it('deletes a stored image from the library once confirmed', async () => {
  const page = { images: [{ image: { filename: 'stored.png', subfolder: '', type: 'input' }, modifiedAt: 0, bytes: 1 }], total: 1 }
  const removeImage = vi.fn<NonNullable<ImagesPanelProps['removeImage']>>(async () => {})
  render(<ImagesPanel {...roomProps({
    library: async () => page,
    status: async () => ({ ...status, libraryAvailable: true }),
    removeImage,
  })} />)

  // A library file is deleted from disk, so it asks first and names the file it will remove.
  fireEvent.click(await screen.findByRole('button', { name: en['action.delete'] }))
  fireEvent.click(await screen.findByRole('button', { name: en['delete.confirm'] }))

  await waitFor(() => { expect(removeImage).toHaveBeenCalled() })
  expect(removeImage.mock.calls[0]?.[0]).toMatchObject({ filename: 'stored.png' })
})

it('caps a selection at the download limit and says why', async () => {
  const images = Array.from({ length: 101 }, (_, index) => ({
    image: { filename: `s${String(index)}.png`, subfolder: '', type: 'input' }, modifiedAt: 0, bytes: 1,
  }))
  render(<ImagesPanel {...roomProps({
    library: async () => ({ images, total: images.length }),
    status: async () => ({ ...status, libraryAvailable: true }),
  })} />)

  // Selecting everything is capped at what one archive can carry, and the cap is explained rather
  // than silently dropping files. Both galleries carry their own header, so the first is the one
  // whose media the library filled.
  fireEvent.click((await screen.findAllByRole('button', { name: en['selection.start'] }))[0] as HTMLElement)
  fireEvent.click((await screen.findAllByRole('button', { name: en['selection.selectLoaded'] }))[0] as HTMLElement)

  expect(await screen.findByRole('alert')).toHaveProperty('textContent', en['selection.limit'])
})

it('ignores a picker change that carried no files', async () => {
  const view = render(<ImagesPanel {...roomProps()} />)
  const picker = view.container.querySelector<HTMLInputElement>('input[type="file"]')
  if (picker === null) throw new Error('Expected reference picker')

  // A change with nothing in it is not an attachment, so the panel stays as it was.
  fireEvent.change(picker, { target: { files: [] } })
  expect(screen.queryByRole('alert')).toBeNull()
})

it('refreshes the panel once a saved connection is reported', async () => {
  const captured: { onSaved: (() => void) | undefined } = { onSaved: undefined }
  const readStatus = vi.fn(async () => status as never)
  render(<ImagesPanel {...roomProps({
    renderSlot: (name: string, props: unknown) => { if (name === 'images.connection') captured.onSaved = (props as typeof captured).onSaved; return null },
    status: readStatus,
  })} />)
  await waitFor(() => { expect(readStatus).toHaveBeenCalled() })
  const asked = readStatus.mock.calls.length

  // Saving the profile's connection sends the next request elsewhere, so the panel re-reads the
  // Host rather than showing the previous server's workflows.
  captured.onSaved?.()
  await waitFor(() => { expect(readStatus.mock.calls.length).toBeGreaterThan(asked) })
})

it('loads a stored image once it scrolls into view', async () => {
  const image = vi.fn(async () => 'data:image/png;base64,AAA')
  const intersect: (() => void)[] = []
  class FakeObserver {
    constructor(private readonly callback: (entries: { isIntersecting: boolean }[]) => void) {}
    observe(): void { intersect.push(() => { this.callback([{ isIntersecting: true }]) }) }
    disconnect(): void {}
  }
  vi.stubGlobal('IntersectionObserver', FakeObserver)
  try {
    const generation = {
      promptId: 'run-1', state: 'complete' as const, workflow: null, workflowLabel: 'Create',
      prompt: 'a fox', negativePrompt: '', model: 'sd', modelLabel: 'SD',
      width: 512, height: 512, steps: 8, cfg: 1, seed: 1,
      images: [{ filename: 'far.png', subfolder: '', type: 'input' }],
    }
    render(<ImagesPanel {...roomProps({ history: async () => [generation], image })} />)
    await screen.findByText('a fox')
    expect(image).not.toHaveBeenCalled()

    // A card outside the viewport is not read until it is scrolled to, so a long library does not
    // pull every file at once.
    for (const fire of intersect) fire()
    await waitFor(() => { expect(image).toHaveBeenCalled() })
  } finally {
    vi.unstubAllGlobals()
  }
})

it('loads the next page of a library that holds more than it showed', async () => {
  const library = vi.fn<ImagesPanelProps['library']>(async () => ({
    images: [{ image: { filename: 'first.png', subfolder: '', type: 'input' }, modifiedAt: 0, bytes: 1 }], total: 2,
  }))
  render(<ImagesPanel {...roomProps({ library, status: async () => ({ ...status, libraryAvailable: true }) })} />)

  // The library reports how much it holds, so the panel offers the rest instead of stopping short.
  fireEvent.click(await screen.findByRole('button', { name: en['gallery.loadMore'] }))

  await waitFor(() => { expect(library).toHaveBeenCalledWith(1) })
})

it('exports the room through the Host and reports the outcome', async () => {
  const exportRoom = vi.fn<NonNullable<ImagesPanelProps['exportRoom']>>(async () => true)
  render(<ImagesPanel {...roomProps({
    currentAgent: () => ({ sessionId: 'room-1' as never }) as never,
    exportRoom,
  })} />)

  // Exporting is offered once there is a room, and names the room it hands to the Host.
  fireEvent.click(await screen.findByRole('button', { name: en['action.export'] }))
  await waitFor(() => { expect(exportRoom).toHaveBeenCalledWith('room-1' as never) })
})

it('opens another room when its row is chosen', async () => {
  const openRoom = vi.fn<ImagesPanelProps['openRoom']>(async () => ({ sessionId: 'room-2' as never }) as never)
  const roomState = { ids: ['room-1', 'room-2'] as never, active: 'room-1' as never }
  render(<ImagesPanel {...roomProps({
    rooms: { getSnapshot: () => roomState, subscribe: () => () => {} },
    roomTitle: id => (id === 'room-1' ? 'First room' : 'Second room'),
    openRoom,
  })} />)

  // Choosing another conversation loads it rather than leaving the panel showing the previous one.
  fireEvent.click(await screen.findByText('Second room'))
  await waitFor(() => { expect(openRoom).toHaveBeenCalledWith('room-2' as never) })
})

it('returns to the conversation when Auto is chosen, and takes a negative prompt', async () => {
  render(<ImagesPanel {...roomProps()} />)
  fireEvent.click(await screen.findByRole('button', { name: en['composer.advanced'] }))
  const generate = await screen.findByRole('button', { name: en['composer.generate'] })

  // The negative prompt is part of the draft the direct form submits.
  const negative = screen.getByLabelText(en['composer.negative'])
  fireEvent.change(negative, { target: { value: 'blurry' } })
  expect(screen.getByLabelText(en['composer.negative'])).toHaveProperty('value', 'blurry')

  // Auto hands the request back to the conversation, so the direct form's own control goes away.
  fireEvent.click(screen.getByRole('button', { name: en['composer.auto'] }))
  await waitFor(() => { expect(screen.queryByRole('button', { name: en['composer.generate'] })).toBeNull() })
  expect(generate).toBeDefined()
})

it('reports an export the Host declined', async () => {
  const exportRoom = vi.fn<NonNullable<ImagesPanelProps['exportRoom']>>(async () => false)
  render(<ImagesPanel {...roomProps({
    currentAgent: () => ({ sessionId: 'room-1' as never }) as never,
    exportRoom,
  })} />)

  // A Host with no accessible output folder cannot export, and says so instead of failing quietly.
  fireEvent.click(await screen.findByRole('button', { name: en['action.export'] }))
  expect(await screen.findByRole('alert')).toHaveProperty('textContent', en['notice.exportUnavailable'])
})

it('keeps an uploaded photo and instruction when submission fails, and supports Enter without choosing a workflow', async () => {
  const askAgent = vi.fn<ImagesPanelProps['askAgent']>().mockRejectedValue(new Error('Retry this request'))
  const view = render(<ImagesPanel {...roomProps({ askAgent })} />)
  const fileInput = view.container.querySelector<HTMLInputElement>('input[type="file"]')
  if (fileInput === null) throw new Error('Expected reference picker')
  fireEvent.change(fileInput, { target: { files: [new File(['photo'], 'reference.png', { type: 'image/png' })] } })
  expect(await screen.findByText('reference.png')).toBeTruthy()
  const prompt = screen.getByRole('textbox', { name: en['composer.placeholder'] })
  fireEvent.change(prompt, { target: { value: 'Animate this photo' } })
  fireEvent.keyDown(prompt, { key: 'Enter' })
  expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Retry this request')
  expect(askAgent).toHaveBeenCalledWith('Animate this photo', status, null,
    [{ type: 'image', mediaType: 'image/png', name: 'reference.png', data: 'cGhvdG8=' }])
  expect(prompt).toHaveProperty('value', 'Animate this photo')
  expect(screen.getByText('reference.png')).toBeTruthy()
})

it('keeps one composer after submission and sends follow-ups through the Images agent', async () => {
  const askAgent = vi.fn<ImagesPanelProps['askAgent']>().mockResolvedValue({} as never)
  const view = render(<ImagesPanel {...roomProps({ askAgent, renderSlot: key => key === 'images.agent' ? <p>Previous image result</p> : null })} />)
  const prompt = screen.getByRole('textbox', { name: en['composer.placeholder'] })
  fireEvent.change(prompt, { target: { value: 'Create a sunset' } })
  await waitFor(() => { expect(screen.getByRole('button', { name: en['room.send'] }).hasAttribute('disabled')).toBe(false) })
  fireEvent.click(screen.getByRole('button', { name: en['room.send'] }))
  await screen.findByText('Previous image result')
  expect(screen.getAllByRole('textbox')).toHaveLength(1)
  expect(screen.getByRole('textbox')).toBe(prompt)
  fireEvent.change(prompt, { target: { value: 'Make it nighttime' } })
  fireEvent.keyDown(prompt, { key: 'Enter' })
  await waitFor(() => { expect(askAgent).toHaveBeenCalledTimes(2) })
  expect(askAgent).toHaveBeenLastCalledWith('Make it nighttime', status, null, undefined)
  const transcript = view.container.querySelector('[data-conversation-scroll]')
  expect(transcript?.contains(prompt)).toBe(false)
  const sections = screen.getAllByRole('region').map(section => section.getAttribute('aria-label'))
  expect(sections).toEqual([en['room.conversation'], en['gallery.recent'], en['gallery.library']])
})

it('drops multiple reference photos, removes one, and retains the others after a failed submission', async () => {
  const askAgent = vi.fn<ImagesPanelProps['askAgent']>().mockRejectedValue(new Error('Try again'))
  const view = render(<ImagesPanel {...roomProps({ askAgent })} />)
  const composer = view.container.querySelector('[data-images-composer]')
  if (composer === null) throw new Error('Expected Images composer')
  fireEvent.drop(composer, { dataTransfer: { files: [new File(['one'], 'one.png', { type: 'image/png' }), new File(['two'], 'two.png', { type: 'image/png' })] } })
  await screen.findByText('two.png')
  fireEvent.click(screen.getAllByRole('button', { name: en['action.clearSource'] })[0]!)
  expect(screen.queryByText('one.png')).toBeNull()
  const prompt = screen.getByRole('textbox')
  fireEvent.change(prompt, { target: { value: 'Use this reference' } })
  fireEvent.keyDown(prompt, { key: 'Enter' })
  expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Try again')
  expect(askAgent).toHaveBeenCalledWith('Use this reference', status, null, [{ type: 'image', mediaType: 'image/png', name: 'two.png', data: 'dHdv' }])
  expect(screen.getByText('two.png')).toBeTruthy()
})

it('plays recent video outputs and retains local-media and recent-run navigation', async () => {
  const image = { filename: 'clip.mp4', subfolder: '', type: 'output' }
  let resolveVideo: (src: string) => void = () => { throw new Error('Video load not started') }
  const media = new Promise<string>((resolve) => { resolveVideo = resolve })
  const load = vi.fn(async () => media)
  const view = render(<ImagesPanel {...roomProps({ image: load,
    history: async () => [{ promptId: 'video', state: 'complete', workflow: null, workflowLabel: 'Video',
      prompt: 'Animate a landscape', negativePrompt: '', model: '', modelLabel: '', width: 512, height: 512,
      steps: 8, cfg: 1, seed: 42, images: [image] }],
  })} />)
  expect(screen.getByRole('region', { name: en['gallery.recent'] })).toBeTruthy()
  await waitFor(() => { expect(load).toHaveBeenCalledOnce() })
  expect(view.container.querySelector('video')).toBeNull()
  expect(screen.getByText(en['gallery.loading'])).toBeTruthy()
  resolveVideo('data:video/mp4;base64,Y2xpcA==')
  await waitFor(() => { expect(view.container.querySelector('video')?.getAttribute('src')).toBe('data:video/mp4;base64,Y2xpcA==') })
  expect(screen.getByRole('region', { name: en['gallery.library'] })).toBeTruthy()
  expect(screen.getByRole('link', { name: en['action.download'] })).toBeTruthy()
  expect(screen.queryByRole('button', { name: en['action.reuse'] })).toBeNull()
  const player = view.container.querySelector('video')
  if (player === null) throw new Error('Video player missing')
  fireEvent.error(player)
  expect(view.container.querySelector('video')).toBeNull()
  expect(screen.getByText(en['gallery.failed'])).toBeTruthy()
  expect(screen.getByRole('link', { name: en['action.download'] })).toBeTruthy()
  expect(view.container.querySelector('article')?.outerHTML).toMatchSnapshot()
})

const status: ComfyImagesStatus = {
  reachable: true, baseUrl: 'http://127.0.0.1:8188', error: null, libraryAvailable: false,
  models: [], workflows: [{ id: 'hmi', output: 'image', label: 'HMI', source: 'saved', available: true, unavailableReason: null,
    modelId: null, starterPrompt: 'Preset boilerplate', width: 1024, height: 1024, batchSize: 1,
    recommendedSteps: 8, recommendedCfg: 1, supportsNegativePrompt: false }],
}

it('starts with a clean Auto prompt and keeps a failed agent submission editable', async () => {
  const askAgent = vi.fn<ImagesPanelProps['askAgent']>().mockRejectedValue(new Error('ComfyUI tools are disabled'))
  const generate = vi.fn<ImagesPanelProps['generate']>()
  const props: ImagesPanelProps = {
    imagePlugin: async () => true, openImagePlugin: vi.fn(),
    autoPreview: { getSnapshot: () => true, subscribe: () => () => {} },
    t: key => en[key as keyof typeof en] ?? key,
    rooms: { getSnapshot: () => EMPTY_ROOMS, subscribe: () => () => {} }, openRoom: vi.fn(), roomTitle: id => id,
    currentAgent: () => undefined, resetAgent: vi.fn<ImagesPanelProps['resetAgent']>().mockResolvedValue({} as never), exportRoom: vi.fn<ImagesPanelProps['exportRoom']>().mockResolvedValue(true), askAgent, openVoiceSettings: vi.fn(),
    status: async () => status, history: async () => [], library: async () => ({ images: [], total: 0 }),
    generate, cancel: vi.fn(), remove: vi.fn(), removeImage: vi.fn(), removeImages: vi.fn(), image: vi.fn(),
    SessionProvider: ({ children }) => children, renderSlot: () => null,
  }
  render(<ImagesPanel {...props} />)
  const prompt = screen.getByRole('textbox', { name: en['composer.placeholder'] })
  expect(screen.queryByRole('combobox')).toBeNull()
  expect(prompt).toHaveProperty('value', '')
  fireEvent.change(prompt, { target: { value: 'An anime portrait' } })
  await waitFor(() => { expect(screen.getByRole('button', { name: en['room.send'] }).hasAttribute('disabled')).toBe(false) })
  fireEvent.click(screen.getByRole('button', { name: en['room.send'] }))
  expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'ComfyUI tools are disabled')
  expect(askAgent).toHaveBeenCalledWith('An anime portrait', status, null, undefined)
  expect(generate).not.toHaveBeenCalled()
  expect(prompt).toHaveProperty('value', 'An anime portrait')
  fireEvent.click(screen.getByRole('button', { name: en['composer.advanced'] }))
  expect(screen.getAllByRole('combobox')).toHaveLength(2)
})

it('records the actual catalog and selected reference without rewriting the user instruction', () => {
  const prompt = imageAgentPrompt('Make it nighttime', status, { filename: 'source.png', subfolder: 'archive', type: 'output' })
  expect(prompt).toContain('User request:\nMake it nighttime')
  expect(prompt).toContain('"label":"HMI"')
  expect(prompt).toContain('"filename":"source.png"')
  expect(prompt).toMatchSnapshot()
  expect(prompt.split('\n\n').slice(-3)).toMatchInlineSnapshot(`
    [
      "Available panel workflows (these are the settings to submit with; adjust only when the request needs it): [{"id":"hmi","label":"HMI","task":"create","capability":"text to image, general","model":null,"size":"1024x1024","steps":8,"cfg":1,"supportsNegativePrompt":false,"batch":1,"starterPrompt":"Preset boilerplate"}]",
      "Selected reference: {"filename":"source.png","subfolder":"archive","type":"output"}. Read it through ComfyUI before editing.",
      "User request:
    Make it nighttime",
    ]
  `)
})

it('keeps direct workflow generation available when the Auto preview is disabled', async () => {
  const askAgent = vi.fn<ImagesPanelProps['askAgent']>()
  const generate = vi.fn<ImagesPanelProps['generate']>().mockRejectedValue(new Error('Server unavailable'))
  const props: ImagesPanelProps = {
    imagePlugin: async () => true, openImagePlugin: vi.fn(),
    autoPreview: { getSnapshot: () => false, subscribe: () => () => {} },
    t: key => en[key as keyof typeof en] ?? key,
    rooms: { getSnapshot: () => EMPTY_ROOMS, subscribe: () => () => {} }, openRoom: vi.fn(), roomTitle: id => id,
    currentAgent: () => undefined, resetAgent: vi.fn<ImagesPanelProps['resetAgent']>().mockResolvedValue({} as never), exportRoom: vi.fn<ImagesPanelProps['exportRoom']>().mockResolvedValue(true), askAgent, openVoiceSettings: vi.fn(),
    status: async () => status, history: async () => [], library: async () => ({ images: [], total: 0 }),
    generate, cancel: vi.fn(), remove: vi.fn(), removeImage: vi.fn(), removeImages: vi.fn(), image: vi.fn(),
    SessionProvider: ({ children }) => children, renderSlot: () => null,
  }
  render(<ImagesPanel {...props} />)
  expect(screen.queryByRole('button', { name: en['composer.auto'] })).toBeNull()
  expect(screen.getAllByRole('combobox')).toHaveLength(2)
  fireEvent.change(screen.getByRole('textbox', { name: en['composer.placeholder'] }), { target: { value: 'A schematic' } })
  await waitFor(() => { expect(screen.getByRole('button', { name: en['composer.generate'] }).hasAttribute('disabled')).toBe(false) })
  fireEvent.click(screen.getByRole('button', { name: en['composer.generate'] }))
  expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Server unavailable')
  expect(generate).toHaveBeenCalledWith(expect.objectContaining({ workflow: 'hmi', prompt: 'A schematic' }))
  expect(askAgent).not.toHaveBeenCalled()
})

it('does not display a superseded restore as an error', async () => {
  const id = 'saved-images' as never
  const openRoom = vi.fn<ImagesPanelProps['openRoom']>().mockRejectedValue(new DOMException('Images navigation superseded', 'AbortError'))
  const savedRooms = { ids: [id], active: id }
  render(<ImagesPanel {...roomProps({ openRoom, rooms: { getSnapshot: () => savedRooms, subscribe: () => () => {} } })} />)
  await waitFor(() => { expect(openRoom).toHaveBeenCalledOnce() })
  expect(screen.queryByRole('alert')).toBeNull()
})

it('selects recent outputs and local files once, keeps failed deletions selected, and removes successful files from both galleries', async () => {
  const one = { filename: 'one.png', subfolder: '', type: 'output' }
  const two = { filename: 'two.png', subfolder: '', type: 'output' }
  const three = { filename: 'three.png', subfolder: '', type: 'output' }
  const removeImages = vi.fn<ImagesPanelProps['removeImages']>().mockResolvedValue({ deleted: [one, three], failed: [{ image: two, message: 'File is busy' }] })
  const view = render(<ImagesPanel {...roomProps({ removeImages,
    status: async () => ({ ...status, libraryAvailable: true }), image: async () => 'data:image/png;base64,YQ==',
    history: async () => [{ promptId: 'run', state: 'complete', workflow: null, workflowLabel: 'Images', prompt: 'Landscape', negativePrompt: '', model: '', modelLabel: '', width: 512, height: 512, steps: 8, cfg: 1, seed: 42, images: [one, two] }],
    library: async () => ({ images: [one, three].map(image => ({ image, bytes: 10, modifiedAt: 1 })), total: 2 }),
  })} />)
  await waitFor(() => { expect(view.container.querySelectorAll('article')).toHaveLength(4) })
  fireEvent.click(screen.getAllByRole('button', { name: en['selection.start'] })[0]!)
  fireEvent.click(screen.getByRole('button', { name: en['selection.selectLoaded'] }))
  expect(view.container.querySelectorAll('[aria-pressed="true"]')).toHaveLength(4)
  fireEvent.click(screen.getByRole('button', { name: en['selection.delete'] }))
  fireEvent.click(screen.getAllByRole('button', { name: en['selection.confirmDelete'] }).at(-1)!)
  await waitFor(() => { expect(removeImages).toHaveBeenCalledWith([one, two, three]) })
  await waitFor(() => { expect(view.container.querySelectorAll('article')).toHaveLength(1) })
  expect(view.container.querySelector('[aria-pressed="true"]')).toBeTruthy()
  expect(screen.getByRole('alert')).toBeTruthy()
})

it('removes complete recent runs without local file access and rejects partial-run selections', async () => {
  const one = { filename: 'one.png', subfolder: '', type: 'output' }
  const two = { filename: 'two.png', subfolder: '', type: 'output' }
  const remove = vi.fn<ImagesPanelProps['remove']>().mockResolvedValue(undefined)
  const removeImages = vi.fn<ImagesPanelProps['removeImages']>()
  const view = render(<ImagesPanel {...roomProps({ remove, removeImages, image: async () => 'data:image/png;base64,YQ==',
    history: async () => [{ promptId: 'run', state: 'complete', workflow: null, workflowLabel: 'Images', prompt: 'Landscape', negativePrompt: '', model: '', modelLabel: '', width: 512, height: 512, steps: 8, cfg: 1, seed: 42, images: [one, two] }],
  })} />)
  await waitFor(() => { expect(view.container.querySelectorAll('article')).toHaveLength(2) })
  fireEvent.click(screen.getByRole('button', { name: en['selection.start'] }))
  fireEvent.click(view.container.querySelector('[aria-pressed="false"]')!)
  fireEvent.click(screen.getByRole('button', { name: en['selection.removeRuns'] }))
  fireEvent.click(screen.getAllByRole('button', { name: en['selection.removeRuns'] }).at(-1)!)
  expect(await screen.findByRole('alert')).toHaveProperty('textContent', en['selection.wholeRuns'])
  expect(remove).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: en['selection.selectLoaded'] }))
  fireEvent.click(screen.getByRole('button', { name: en['selection.removeRuns'] }))
  fireEvent.click(screen.getAllByRole('button', { name: en['selection.removeRuns'] }).at(-1)!)
  await waitFor(() => { expect(view.container.querySelectorAll('article')).toHaveLength(0) })
  expect(remove).toHaveBeenCalledWith('run')
  expect(removeImages).not.toHaveBeenCalled()
})
