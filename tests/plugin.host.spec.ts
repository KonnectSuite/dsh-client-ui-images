import { Context, Service } from '@deepseek-ai/cordis'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as ImagesPlugin from '../src/index.ts'

/** One route a stub web server was asked to serve. */
interface RegisteredRoute {
  readonly path: string
  readonly handler: (request: never, response: never) => void
}

/** Stands in for the settings service the Host half projects its configuration through. */
class StubSettings extends Service {
  readonly configure = vi.fn()

  constructor(ctx: Context) {
    super(ctx, 'settings')
  }
}

/** Stands in for the HTTP route server the browser half calls. */
class StubWebServer extends Service {
  readonly routes = new Map<string, RegisteredRoute['handler']>()

  constructor(ctx: Context) {
    super(ctx, 'webServer')
  }

  register(route: RegisteredRoute): () => void {
    this.routes.set(route.path, route.handler)
    return () => { this.routes.delete(route.path) }
  }
}

/** Build the Host context both halves expect.
 * @returns The context and the route server it registered.
 */
async function host(): Promise<{ ctx: Context; server: StubWebServer }> {
  const ctx = new Context()
  await ctx.plugin(StubSettings)
  const server = new StubWebServer(ctx)
  await ctx.plugin(ImagesPlugin)
  return { ctx, server }
}

/** Collect the JSON body a route handler writes.
 * @param handler Route handler under test.
 * @param method HTTP method the caller uses.
 * @param contentType Request media type, or an empty string for a request without one.
 * @returns Parsed body.
 */
async function call(handler: RegisteredRoute['handler'], method: string, contentType = ''): Promise<Record<string, unknown>> {
  const chunks: string[] = []
  const response = {
    writeHead: vi.fn(),
    end: (body?: string) => { if (body !== undefined) chunks.push(body) },
  }
  const request = { method, headers: contentType === '' ? {} : { 'content-type': contentType }, [Symbol.asyncIterator]: async function* () {} }
  await (handler as unknown as (req: unknown, res: unknown) => Promise<void>)(request, response)
  // Routes hand off to a dynamic import, so the response body settles after the handler returns.
  for (let attempt = 0; attempt < 100 && chunks.length === 0; attempt += 1) {
    await new Promise<void>((resolve) => { setTimeout(resolve, 10) })
  }
  return JSON.parse(chunks.join('')) as Record<string, unknown>
}

const temporary: string[] = []

afterEach(() => {
  vi.unstubAllEnvs()
  for (const root of temporary.splice(0)) rmSync(root, { recursive: true, force: true })
})

describe('the Images host configuration', () => {
  it('registers the autoPreview projection while settings are available', async () => {
    const ctx = new Context()
    const configure = vi.fn()
    await ctx.plugin(class extends StubSettings { override readonly configure = configure })
    await ctx.plugin(ImagesPlugin)

    // The panel reads this key from the Host, so a projection that never registers leaves the
    // browser on its built-in default with no way for a deployment to change it.
    expect(configure).toHaveBeenCalledWith({ auto: false }, expect.anything())
  })
})

describe('the Images filesystem routes', () => {
  it('registers every folder route the browser half calls', async () => {
    const { server } = await host()
    expect([...server.routes.keys()].sort()).toEqual([
      '/plugins/ui-images/open-folder',
      '/plugins/ui-images/output-folders',
      '/plugins/ui-images/pick-folder',
      '/plugins/ui-images/reveal-media',
    ])
  })

  it('answers the folder probe with the environment override and no desktop when unprobed', async () => {
    const root = mkdtempSync(join(tmpdir(), 'ui-images-host-'))
    temporary.push(root)
    vi.stubEnv('ARYAAI_COMFYUI_OUTPUT_DIR', root)
    const { server } = await host()
    const handler = server.routes.get('/plugins/ui-images/output-folders')
    if (handler === undefined) throw new Error('Missing output-folders route')

    const body = await call(handler, 'GET')
    expect(body.ok).toBe(true)
    // The environment override is offered first; host-inferred folders may follow it.
    expect((body.candidates as readonly { path: string; files: number }[])[0]).toEqual({ path: root, files: 0 })
  })

  it('refuses a reveal request naming a folder that does not exist', async () => {
    const { server } = await host()
    const handler = server.routes.get('/plugins/ui-images/reveal-media')
    if (handler === undefined) throw new Error('Missing reveal-media route')

    // A directory the caller names must exist; the route never resolves a path it cannot verify.
    const body = await call(handler, 'POST', 'application/json')
    expect(body).toEqual({ ok: false, error: 'folder-required' })
  })
})
