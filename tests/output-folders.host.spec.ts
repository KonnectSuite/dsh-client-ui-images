import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { comfyCliWorkspace, countMediaFiles, discoverOutputFolders, isDirectory, resolveMediaPath } from '../src/output-folders.ts'

const temporary: string[] = []

/** Create one disposable directory tree for a test.
 * @returns Absolute path of the new root.
 */
function scratch(): string {
  const root = mkdtempSync(join(tmpdir(), 'ui-images-folders-'))
  temporary.push(root)
  return root
}

afterEach(() => {
  for (const root of temporary.splice(0)) rmSync(root, { recursive: true, force: true })
})

describe('output folder discovery', () => {
  it('counts only media files directly in the folder', () => {
    const root = scratch()
    writeFileSync(join(root, 'a.png'), '')
    writeFileSync(join(root, 'b.mp4'), '')
    writeFileSync(join(root, 'notes.txt'), '')
    mkdirSync(join(root, 'nested'))
    expect(countMediaFiles(root)).toBe(2)
  })

  it('reports a missing folder instead of throwing', () => {
    expect(countMediaFiles(join(scratch(), 'absent'))).toBe(-1)
    expect(isDirectory(join(scratch(), 'absent'))).toBe(false)
  })

  it('offers the environment override first and skips a folder that does not exist', () => {
    const root = scratch()
    const configured = join(root, 'configured')
    mkdirSync(configured)
    writeFileSync(join(configured, 'cat.png'), '')
    const found = discoverOutputFolders({ env: { ARYAAI_COMFYUI_OUTPUT_DIR: configured }, home: join(root, 'home') })
    expect(found.map(item => item.path)).toEqual([configured])
    expect(found[0]?.files).toBe(1)
  })

  it('falls back to the comfy-cli workspace output and deduplicates by resolved path', () => {
    const root = scratch()
    const workspace = join(root, 'ComfyUI')
    const output = join(workspace, 'output')
    mkdirSync(output, { recursive: true })
    const appData = join(root, 'AppData')
    mkdirSync(join(appData, 'comfy-cli'), { recursive: true })
    writeFileSync(join(appData, 'comfy-cli', 'config.ini'), '[default]\nrecent_workspace = ' + workspace + '\n')
    const found = discoverOutputFolders({ env: { LOCALAPPDATA: appData }, home: join(root, 'home') })
    expect(found.map(item => item.path)).toEqual([output])
  })

  it('reads the recorded workspace from comfy-cli config', () => {
    const root = scratch()
    const appData = join(root, 'AppData')
    mkdirSync(join(appData, 'comfy-cli'), { recursive: true })
    writeFileSync(join(appData, 'comfy-cli', 'config.ini'), 'recent_workspace = C:\\Comfy\\ComfyUI\n')
    expect(comfyCliWorkspace({ LOCALAPPDATA: appData }, root)).toBe('C:\\Comfy\\ComfyUI')
    expect(comfyCliWorkspace({ LOCALAPPDATA: join(root, 'none') }, root)).toBeNull()
  })
})

describe('media path resolution', () => {
  const root = process.platform === 'win32' ? 'C:\\Comfy\\output' : '/comfy/output'

  it('resolves a file inside its output folder', () => {
    const resolved = resolveMediaPath(root, 'run-1', 'image.png')
    expect(resolved).not.toBeNull()
    expect(resolved?.endsWith('image.png')).toBe(true)
  })

  it('refuses a reference that escapes the folder', () => {
    expect(resolveMediaPath(root, '..', 'secret.png')).toBeNull()
    expect(resolveMediaPath(root, '', '../../secret.png')).toBeNull()
    expect(resolveMediaPath('', '', 'image.png')).toBeNull()
  })
})
