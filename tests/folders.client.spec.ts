import { afterEach, describe, expect, it, vi } from 'vitest'
import { openFolder, pickOutputFolder, readOutputFolders, revealMedia } from '../src/client/folders.ts'

/** Build one fetch response carrying a JSON body.
 * @param body Payload the route answers with.
 * @param status HTTP status code.
 * @returns A Response the helper can read.
 */
function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('output folder reads', () => {
  it('reports candidates and desktop capabilities', async () => {
    const fetch = vi.fn(async () => json({ ok: true, candidates: [{ path: 'C:\\out', files: 3 }], canOpen: true, fileManager: 'explorer' }))
    vi.stubGlobal('fetch', fetch)
    const choices = await readOutputFolders()
    expect(choices.candidates).toEqual([{ path: 'C:\\out', files: 3 }])
    expect(choices.canOpen).toBe(true)
    expect(choices.fileManager).toBe('explorer')
    expect(fetch).toHaveBeenCalledWith('/plugins/ui-images/output-folders', {})
  })

  it('drops malformed candidates instead of trusting the wire', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => json({ ok: true, candidates: [{ path: 'x' }, { path: 'C:\\ok', files: 1 }] })))
    const choices = await readOutputFolders()
    expect(choices.candidates).toEqual([{ path: 'C:\\ok', files: 1 }])
  })
})

describe('folder actions', () => {
  it('reports the picked directory', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => json({ ok: true, path: 'C:\\chosen' })))
    await expect(pickOutputFolder()).resolves.toEqual({ kind: 'picked', path: 'C:\\chosen' })
  })

  it('treats a null answer as a cancellation', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => json({ ok: true, path: null })))
    await expect(pickOutputFolder()).resolves.toEqual({ kind: 'cancelled' })
  })

  it('reports an unsupported picker instead of failing the page', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => json({ ok: false, error: 'no-native-picker' }, 501)))
    await expect(pickOutputFolder()).resolves.toEqual({ kind: 'unsupported' })
  })

  it('surfaces a real failure', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => json({ ok: false, error: 'no-desktop' }, 501)))
    await expect(openFolder('C:\\out')).rejects.toThrow('no-desktop')
  })

  it('posts the media reference it was given', async () => {
    const fetch = vi.fn(async () => json({ ok: true }))
    vi.stubGlobal('fetch', fetch)
    await revealMedia('C:\\out', { subfolder: 'run-1', filename: 'a.png' })
    expect(fetch).toHaveBeenCalledWith('/plugins/ui-images/reveal-media', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ directory: 'C:\\out', subfolder: 'run-1', filename: 'a.png' }),
    })
  })
})
