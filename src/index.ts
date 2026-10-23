/** Host configuration and filesystem routes for the Images conversation preview. */
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-settings'
import z from '@deepseek-ai/schemastery'
import { discoverOutputFolders, isDirectory, resolveMediaPath } from './output-folders.ts'

/** Legacy preview preference and the cadence of Images server availability checks. */
export const Config = z.object({
  autoPreview: z.boolean().default(true).volatile(),
  permissionPreset: z.string().min(1).default('danger-full-access').volatile(),
  agentPreset: z.string().min(1).default('content').volatile(),
  serverStatusPollIntervalMs: z.number().step(1).min(1000).default(10000).volatile(),
})

/** Exact path registration surface owned by the web host. */
export interface ImagesRouteServer {
  register(route: { kind: 'exact'; path: string; handler: (request: IncomingMessage, response: ServerResponse) => void }, label?: string): () => void
}

/** Native directory chooser exposed by the host picker backend. */
export interface ImagesDirectoryPicker {
  capability(): { kind: 'native'; pick(signal: AbortSignal): Promise<string | null> } | { kind: 'browse' }
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** HTTP route server; absent in deployments without a browser host. */
    readonly webServer: ImagesRouteServer
    /** Workspace-directory chooser; present only when a picker backend is composed. */
    readonly directoryPicker?: ImagesDirectoryPicker
  }
}

/** Route prefix owned by this plugin. */
const ROUTE = '/plugins/ui-images'
/** Largest request body accepted by a route here. */
const MAX_BODY_BYTES = 8 * 1024
/** Bound on one native launch so a stuck launcher cannot hold the request open. */
const LAUNCH_TIMEOUT_MS = 15000
/** Bound on one open folder chooser: a person is choosing, so this only stops a stranded dialog. */
const PICK_TIMEOUT_MS = 600000

/** Register the configuration projection consumed by the browser.
 * @param ctx - Host context providing settings and, where available, the route server.
 */
export function apply(ctx: Context): void {
  ctx.inject(['settings'], (child) => { child.effect(() => child.settings.configure({ auto: false }, ctx.fiber)) })
  ctx.inject(['webServer'], (child) => {
    child.effect(() => child.webServer.register({
      kind: 'exact',
      path: `${ROUTE}/output-folders`,
      handler: (request, response) => { void serveOutputFolders(request, response) },
    }, 'ui-images: output folders'), 'ui-images: output folders route')
    child.effect(() => child.webServer.register({
      kind: 'exact',
      path: `${ROUTE}/open-folder`,
      handler: (request, response) => { void serveOpenFolder(request, response) },
    }, 'ui-images: open folder'), 'ui-images: open folder route')
    child.effect(() => child.webServer.register({
      kind: 'exact',
      path: `${ROUTE}/reveal-media`,
      handler: (request, response) => { void serveRevealMedia(request, response) },
    }, 'ui-images: reveal media'), 'ui-images: reveal media route')
    child.effect(() => child.webServer.register({
      kind: 'exact',
      path: `${ROUTE}/pick-folder`,
      handler: (request, response) => { void servePickFolder(child, request, response) },
    }, 'ui-images: pick folder'), 'ui-images: pick folder route')
  })
}

/** Write one JSON response.
 * @param response Node response.
 * @param status HTTP status code.
 * @param body JSON-serializable payload.
 */
function sendJson(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' })
  response.end(JSON.stringify(body))
}

/** Reject a cross-origin browser request.
 * @param request Node request.
 * @returns True when the request carries no foreign Origin.
 */
function sameOrigin(request: IncomingMessage): boolean {
  const origin = request.headers.origin
  const host = request.headers.host
  if (origin === undefined || host === undefined) return true
  return origin === `http://${host}` || origin === `https://${host}`
}

/** Read a bounded JSON request body.
 * @param request Node request.
 * @returns Parsed payload, or undefined when the body is not an accepted JSON object.
 */
async function readJsonBody(request: IncomingMessage): Promise<Record<string, unknown> | undefined> {
  const chunks: Buffer[] = []
  let bytes = 0
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk))
    bytes += buffer.byteLength
    if (bytes > MAX_BODY_BYTES) return undefined
    chunks.push(buffer)
  }
  try {
    const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) ? parsed as Record<string, unknown> : undefined
  } catch {
    return undefined
  }
}

/** Guard a JSON POST route.
 * @param request Node request.
 * @param response Node response.
 * @returns True when the caller may continue handling the request.
 */
function acceptJsonPost(request: IncomingMessage, response: ServerResponse): boolean {
  if (request.method !== 'POST') { sendJson(response, 405, { ok: false, error: 'method-not-allowed' }); return false }
  if (!(request.headers['content-type'] ?? '').toLocaleLowerCase().startsWith('application/json')) {
    sendJson(response, 415, { ok: false, error: 'json-required' })
    return false
  }
  if (!sameOrigin(request)) { sendJson(response, 403, { ok: false, error: 'origin-rejected' }); return false }
  return true
}

/** Abort a native operation once its own deadline elapses.
 * @param timeoutMs How long the native operation may run.
 * @returns A signal the caller must pass to the native launcher.
 */
function operationSignal(timeoutMs: number): AbortSignal {
  const controller = new AbortController()
  const timer = setTimeout(() => { controller.abort() }, timeoutMs)
  timer.unref()
  return controller.signal
}

/** Report the output folders worth offering and whether this host can reveal them. */
async function serveOutputFolders(request: IncomingMessage, response: ServerResponse): Promise<void> {
  if (request.method !== 'GET' && request.method !== 'HEAD') { sendJson(response, 405, { ok: false, error: 'method-not-allowed' }); return }
  if (!sameOrigin(request)) { sendJson(response, 403, { ok: false, error: 'origin-rejected' }); return }
  try {
    const native = await import('@deepseek-ai/dsh-native-command')
    sendJson(response, 200, {
      ok: true,
      candidates: discoverOutputFolders(),
      canOpen: native.canOpenNativePath(),
      fileManager: native.nativeFileManager(),
    })
  } catch {
    sendJson(response, 200, { ok: true, candidates: discoverOutputFolders(), canOpen: false, fileManager: null })
  }
}

/** Open a folder in the host file manager. */
async function serveOpenFolder(request: IncomingMessage, response: ServerResponse): Promise<void> {
  if (!acceptJsonPost(request, response)) return
  const body = await readJsonBody(request)
  const directory = typeof body?.directory === 'string' ? body.directory.trim() : ''
  if (!isDirectory(directory)) { sendJson(response, 400, { ok: false, error: 'folder-required' }); return }
  try {
    const native = await import('@deepseek-ai/dsh-native-command')
    if (!native.canOpenNativePath()) { sendJson(response, 501, { ok: false, error: 'no-desktop' }); return }
    await native.openNativePath(directory, operationSignal(LAUNCH_TIMEOUT_MS))
    sendJson(response, 200, { ok: true })
  } catch (error) {
    sendJson(response, 502, { ok: false, error: error instanceof Error ? error.message : String(error) })
  }
}

/** Select one saved file inside its output folder, or open that folder. */
async function serveRevealMedia(request: IncomingMessage, response: ServerResponse): Promise<void> {
  if (!acceptJsonPost(request, response)) return
  const body = await readJsonBody(request)
  const directory = typeof body?.directory === 'string' ? body.directory.trim() : ''
  const subfolder = typeof body?.subfolder === 'string' ? body.subfolder : ''
  const filename = typeof body?.filename === 'string' ? body.filename.trim() : ''
  if (!isDirectory(directory)) { sendJson(response, 400, { ok: false, error: 'folder-required' }); return }
  if (filename === '') {
    await serveOpenFolderBody(directory, response)
    return
  }
  const target = resolveMediaPath(directory, subfolder, filename)
  if (target === null) { sendJson(response, 403, { ok: false, error: 'outside-folder' }); return }
  try {
    const native = await import('@deepseek-ai/dsh-native-command')
    if (!native.canOpenNativePath()) { sendJson(response, 501, { ok: false, error: 'no-desktop' }); return }
    await native.revealNativePath(target, operationSignal(LAUNCH_TIMEOUT_MS))
    sendJson(response, 200, { ok: true })
  } catch (error) {
    sendJson(response, 502, { ok: false, error: error instanceof Error ? error.message : String(error) })
  }
}

/** Open one already-validated directory.
 * @param directory Existing absolute directory.
 * @param response Node response.
 */
async function serveOpenFolderBody(directory: string, response: ServerResponse): Promise<void> {
  try {
    const native = await import('@deepseek-ai/dsh-native-command')
    if (!native.canOpenNativePath()) { sendJson(response, 501, { ok: false, error: 'no-desktop' }); return }
    await native.openNativePath(directory, operationSignal(LAUNCH_TIMEOUT_MS))
    sendJson(response, 200, { ok: true })
  } catch (error) {
    sendJson(response, 502, { ok: false, error: error instanceof Error ? error.message : String(error) })
  }
}

/** Open the host's directory chooser and report the picked path. */
async function servePickFolder(ctx: Context, request: IncomingMessage, response: ServerResponse): Promise<void> {
  if (!acceptJsonPost(request, response)) return
  let picker: ImagesDirectoryPicker | undefined
  try { picker = ctx.directoryPicker } catch { picker = undefined }
  if (picker === undefined) { sendJson(response, 501, { ok: false, error: 'no-picker' }); return }
  const capability = picker.capability()
  if (capability.kind !== 'native') { sendJson(response, 501, { ok: false, error: 'no-native-picker' }); return }
  try {
    const path = await capability.pick(operationSignal(PICK_TIMEOUT_MS))
    sendJson(response, 200, { ok: true, path })
  } catch (error) {
    sendJson(response, 502, { ok: false, error: error instanceof Error ? error.message : String(error) })
  }
}
