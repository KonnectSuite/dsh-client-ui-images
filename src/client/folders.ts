/** Browser calls for the host's ComfyUI output-folder routes. */

/** Route prefix owned by the Images host plugin. */
const ROUTE = '/plugins/ui-images'

/** One directory the host offers as the saved-media library. */
export interface OutputFolderCandidate {
  /** Absolute folder path. */
  readonly path: string
  /** Media files directly in the folder, or -1 when it could not be listed. */
  readonly files: number
}

/** Folders and desktop capabilities reported by the host. */
export interface OutputFolderChoices {
  readonly candidates: readonly OutputFolderCandidate[]
  /** Whether this host can open a path in a desktop file manager. */
  readonly canOpen: boolean
  /** Host file-manager identity, for a localized label. */
  readonly fileManager: string | null
}

/** Outcome of one directory-chooser request. */
export type PickFolderResult =
  | { readonly kind: 'picked'; readonly path: string }
  | { readonly kind: 'cancelled' }
  | { readonly kind: 'unsupported' }

/** Read one JSON response, turning a host error code into a thrown Error.
 * @param response Fetch response.
 * @returns Parsed body.
 */
async function readJson(response: Response): Promise<Record<string, unknown>> {
  const body: unknown = await response.json().catch(() => undefined)
  const record = typeof body === 'object' && body !== null ? body as Record<string, unknown> : {}
  if (!response.ok || record.ok !== true) {
    throw new Error(typeof record.error === 'string' ? record.error : `HTTP ${String(response.status)}`)
  }
  return record
}

/** Post one JSON body to a plugin route.
 * @param path Route path below the plugin prefix.
 * @param body JSON payload.
 * @returns Parsed response body.
 */
async function post(path: string, body: unknown): Promise<Record<string, unknown>> {
  const response = await fetch(`${ROUTE}/${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  return readJson(response)
}

/** Read the output folders the host can offer, best first.
 * @param signal Cancellation for a page that unmounts first.
 * @returns Candidates plus desktop capabilities.
 */
export async function readOutputFolders(signal?: AbortSignal): Promise<OutputFolderChoices> {
  const response = await fetch(`${ROUTE}/output-folders`, signal === undefined ? {} : { signal })
  const body = await readJson(response)
  const candidates = Array.isArray(body.candidates)
    ? body.candidates.filter((item): item is OutputFolderCandidate =>
      typeof item === 'object' && item !== null
      && typeof (item as OutputFolderCandidate).path === 'string'
      && typeof (item as OutputFolderCandidate).files === 'number')
    : []
  return {
    candidates,
    canOpen: body.canOpen === true,
    fileManager: typeof body.fileManager === 'string' ? body.fileManager : null,
  }
}

/** Open the host's directory chooser.
 * @returns The chosen path, a cancellation, or an unsupported answer.
 */
export async function pickOutputFolder(): Promise<PickFolderResult> {
  try {
    const body = await post('pick-folder', {})
    return typeof body.path === 'string' ? { kind: 'picked', path: body.path } : { kind: 'cancelled' }
  } catch (error) {
    if (error instanceof Error && (error.message === 'no-picker' || error.message === 'no-native-picker')) return { kind: 'unsupported' }
    throw error
  }
}

/** Open one folder in the host file manager.
 * @param directory Absolute folder path.
 */
export async function openFolder(directory: string): Promise<void> {
  await post('open-folder', { directory })
}

/** Select one saved file in the host file manager.
 * @param directory Configured output folder.
 * @param image Subfolder and filename reported by the library.
 */
export async function revealMedia(directory: string, image: { readonly subfolder: string; readonly filename: string }): Promise<void> {
  await post('reveal-media', { directory, subfolder: image.subfolder, filename: image.filename })
}
