// @vitest-environment jsdom
/** Patched Better Sidebar video registration and native player delivery. */
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import type { ReactNode } from 'react'

/** Runtime plugin checks avoid merging the external host's Cordis types into the client program. */
interface VideoViewer {
  id: string
  exts: string[]
  component: (props: { title: string; mediaUrl: string }) => ReactNode
}
const { builtinViewers } = await vi.importActual<{ builtinViewers: () => VideoViewer[] }>('dsh-better-sidebar/src/client/builtins/viewers.tsx')
const { planFirstMatch } = await vi.importActual<{ planFirstMatch: (viewer: VideoViewer, address: () => string) => object }>('dsh-better-sidebar/src/client/editor-load.ts')
const { mediaUrl, downloadUrl, sidebarSocketUrl } = await vi.importActual<{
  mediaUrl: (scope: { sessionId: string; cwd: string }, path: string) => string
  downloadUrl: (scope: { sessionId: string; cwd: string }, path: string) => string
  sidebarSocketUrl: (path: string, sessionId: string) => string
}>('dsh-better-sidebar/src/client/api.ts')
const { mediaTypeForPath } = await vi.importActual<{ mediaTypeForPath: (path: string) => string }>('dsh-better-sidebar/src/index.ts')

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

it.each(['agent-opens', 'fs-watch'])('connects the %s feed to the desktop Host', (feed) => {
  vi.stubGlobal('__DSH_TRANSPORT__', { streamBaseUrl: 'http://127.0.0.1:19387' })
  expect(sidebarSocketUrl(`/sidebar/ws/${feed}`, 'room with spaces')).toBe(
    `ws://127.0.0.1:19387/sidebar/ws/${feed}?sessionId=room+with+spaces`,
  )
})

it('keeps the web feed on the page origin', () => {
  const expected = new URL('/sidebar/ws/agent-opens', location.origin)
  expected.protocol = expected.protocol === 'https:' ? 'wss:' : 'ws:'
  expected.searchParams.set('sessionId', 'room')
  expect(sidebarSocketUrl('/sidebar/ws/agent-opens', 'room')).toBe(expected.toString())
})

it.each([
  ['clip.mp4', 'video/mp4'], ['clip.m4v', 'video/mp4'], ['clip.webm', 'video/webm'],
  ['clip.mov', 'video/quicktime'], ['clip.ogv', 'video/ogg'],
])('serves %s with browser media type %s', (path, type) => {
  expect(mediaTypeForPath(path)).toBe(type)
})

it.each([
  { cwd: 'C:\\Users\\artist\\project', path: 'outputs/clip.mp4', absolute: 'C:\\Users\\artist\\project\\outputs/clip.mp4' },
  { cwd: '/workspace', path: 'outputs/clip.mp4', absolute: '/workspace/outputs/clip.mp4' },
  { cwd: '/workspace', path: '/other/clip.mp4', absolute: '/other/clip.mp4' },
])('addresses media and downloads with an absolute path under $cwd', ({ cwd, path, absolute }) => {
  const scope = { sessionId: 'video-test', cwd }
  for (const address of [mediaUrl(scope, path), downloadUrl(scope, path)]) {
    expect(new URL(address, 'https://arya.invalid').searchParams.get('path')).toBe(absolute)
  }
  expect(new URL(downloadUrl(scope, path), 'https://arya.invalid').searchParams.get('download')).toBe('1')
})

it('streams supported videos without requesting a text read and keeps a download available', () => {
  const viewer = builtinViewers().find(value => value.id === 'video')
  expect(viewer).toBeDefined()
  if (viewer === undefined) throw new Error('Video registration missing')
  expect(viewer.exts).toEqual(['mp4', 'webm', 'mov', 'm4v', 'ogv'])
  const url = '/sidebar/file?sessionId=video-test&path=clip.mp4'
  expect(planFirstMatch(viewer, () => url)).toMatchObject({ kind: 'render', mediaUrl: url })
  const props = { title: 'clip.mp4', mediaUrl: url }
  const view = render(viewer.component(props))
  const player = view.container.querySelector('video')
  expect(player?.getAttribute('src')).toBe(url)
  expect(player?.getAttribute('preload')).toBe('metadata')
  expect(player?.hasAttribute('controls')).toBe(true)
  expect(player?.getAttribute('aria-label')).toBe('clip.mp4')
  expect(view.container.querySelector('a')?.getAttribute('href')).toBe(url)
  expect(view.container.querySelector('a')?.hasAttribute('download')).toBe(true)
  expect(view.container.querySelector('a')?.textContent).toBe('Download to view')
  expect(player?.outerHTML).toMatchSnapshot()
})
