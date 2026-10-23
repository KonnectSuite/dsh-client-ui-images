/** Discovery and validation for the ComfyUI output folder the Content library browses. */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { isAbsolute, join, relative, resolve, sep } from 'node:path'

/** One directory a profile can browse as saved media. */
export interface OutputFolderCandidate {
  /** Absolute folder path. */
  readonly path: string
  /** Media files directly in the folder, or -1 when it could not be listed. */
  readonly files: number
}

/** File extensions the ComfyUI controller streams from an output folder. */
const MEDIA_FILE = /\.(?:png|jpe?g|webp|gif|avif|bmp|mp4|webm|mov|mkv)$/iu
/** Bound on one listing so a huge output folder cannot stall the route. */
const MAX_LISTED_ENTRIES = 5000

/** Report whether a path names an existing directory.
 * @param value Absolute candidate path.
 * @returns True when the directory exists and is readable as a directory.
 */
export function isDirectory(value: string): boolean {
  if (value.trim() === '' || !isAbsolute(value)) return false
  try {
    return statSync(value).isDirectory()
  } catch {
    return false
  }
}

/** Count the media files directly inside a folder.
 * @param folder Absolute directory path.
 * @returns File count, or -1 when the folder cannot be listed.
 */
export function countMediaFiles(folder: string): number {
  try {
    let files = 0
    let seen = 0
    for (const entry of readdirSync(folder, { withFileTypes: true })) {
      if (++seen > MAX_LISTED_ENTRIES) break
      if (entry.isFile() && MEDIA_FILE.test(entry.name)) files += 1
    }
    return files
  } catch {
    return -1
  }
}

/** Read comfy-cli's recorded ComfyUI workspace.
 * @param env Environment holding the platform app-data root.
 * @param home Fallback home directory.
 * @returns The recorded workspace path, or null when comfy-cli keeps no config.
 */
export function comfyCliWorkspace(env: NodeJS.ProcessEnv = process.env, home: string = homedir()): string | null {
  const appData = env.LOCALAPPDATA?.trim()
  const candidates = [
    ...(appData === undefined || appData === '' ? [] : [join(appData, 'comfy-cli', 'config.ini')]),
    ...(process.platform === 'darwin' ? [join(home, 'Library', 'Application Support', 'comfy-cli', 'config.ini')] : []),
    join(home, '.config', 'comfy-cli', 'config.ini'),
  ]
  for (const file of candidates) {
    let text: string
    try {
      text = readFileSync(file, 'utf8')
    } catch {
      continue
    }
    const recorded = /^\s*recent[_-]workspace\s*=\s*(.+)$/imu.exec(text)?.[1]?.trim()
    if (recorded !== undefined && recorded !== '') return recorded
  }
  return null
}

/** Collect the output folders worth offering as the library root, best first.
 * @param options Environment and home overrides used by tests.
 * @returns Existing directories only, deduplicated by resolved path.
 */
export function discoverOutputFolders(
  options: { readonly env?: NodeJS.ProcessEnv; readonly home?: string } = {},
): readonly OutputFolderCandidate[] {
  const env = options.env ?? process.env
  const home = options.home ?? homedir()
  const workspace = comfyCliWorkspace(env, home)
  const proposed = [
    env.ARYAAI_COMFYUI_OUTPUT_DIR,
    ...(workspace === null ? [] : [join(workspace, 'output')]),
    join(home, 'Documents', 'comfy', 'ComfyUI', 'output'),
    join(home, 'Documents', 'ComfyUI', 'output'),
    join(home, 'ComfyUI', 'output'),
  ]
  const found: OutputFolderCandidate[] = []
  const seen = new Set<string>()
  for (const value of proposed) {
    if (value === undefined) continue
    const folder = value.trim()
    if (!isDirectory(folder)) continue
    const key = resolve(folder).toLocaleLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    found.push({ path: resolve(folder), files: countMediaFiles(folder) })
  }
  return found
}

/** Resolve a media reference inside its output folder.
 * @param root Configured output folder.
 * @param subfolder ComfyUI subfolder, empty at the root.
 * @param filename File name reported by the library.
 * @returns The absolute file path, or null when it would escape the folder.
 */
export function resolveMediaPath(root: string, subfolder: string, filename: string): string | null {
  if (root.trim() === '' || !isAbsolute(root) || filename.trim() === '') return null
  const base = resolve(root)
  const target = resolve(base, subfolder, filename)
  const inside = relative(base, target)
  if (isAbsolute(inside) || inside === '..' || inside.startsWith(`..${sep}`)) return null
  return target
}
