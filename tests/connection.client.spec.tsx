// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import type { ComfyConnectionValue } from '@deepseek-ai/dsh-api-mcp-controller/types'
import { makeTranslate } from '@deepseek-ai/dsh-client-test-runtime'
import { en as commonEn } from '@deepseek-ai/dsh-client-locale/src/locales/en.ts'
import { ComfyConnection } from '../src/client/ComfyConnection.tsx'
import { en } from '../src/client/locales.ts'
import type { ComfyConnectionActions } from '../src/client/ComfyConnection.tsx'

afterEach(cleanup)

function fixture(overrides: Partial<ComfyConnectionActions> = {}) {
  const actions: ComfyConnectionActions = {
    readConnection: vi.fn().mockResolvedValue({ baseUrl: 'http://127.0.0.1:8188', outputDirectory: '', remote: false }),
    testConnection: vi.fn().mockResolvedValue(undefined),
    startServer: vi.fn().mockResolvedValue({ running: true, detail: 'Started ComfyUI.' }),
    stopServer: vi.fn().mockResolvedValue({ running: false, detail: 'Stopped ComfyUI.' }),
    restartServer: vi.fn().mockResolvedValue({ running: true, detail: 'Restarted ComfyUI.' }),
    saveConnection: vi.fn().mockResolvedValue(undefined), onSaved: vi.fn(), ...overrides,
  }
  render(<ComfyConnection {...actions} t={makeTranslate(en, commonEn)} />)
  return actions
}

it('tests an unsaved remote address and saves both settings without starting generation', async () => {
  const actions = fixture()
  fireEvent.click(screen.getByRole('button', { name: en['connection.open'] }))
  const address = await screen.findByLabelText(en['connection.address'])
  fireEvent.change(address, { target: { value: 'http://gpu-box:8188' } })
  fireEvent.change(screen.getByLabelText(en['connection.location']), { target: { value: 'remote' } })
  fireEvent.change(screen.getByLabelText(en['connection.folder']), { target: { value: 'Z:/Comfy/output' } })
  fireEvent.click(screen.getByRole('button', { name: en['connection.test'] }))
  await screen.findByText(en['connection.connected'])
  expect(actions.testConnection).toHaveBeenCalledWith('http://gpu-box:8188')
  expect(actions.saveConnection).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: en['connection.save'] }))
  await waitFor(() => { expect(actions.onSaved).toHaveBeenCalledOnce() })
  expect(actions.saveConnection).toHaveBeenCalledWith({ baseUrl: 'http://gpu-box:8188', outputDirectory: 'Z:/Comfy/output', remote: true })
  expect(screen.queryByRole('dialog')).toBeNull()
})

it('retains the form when saving fails and allows Escape dismissal', async () => {
  fixture({ saveConnection: vi.fn().mockRejectedValue(new Error('Could not save profile')) })
  fireEvent.click(screen.getByRole('button', { name: en['connection.open'] }))
  await screen.findByLabelText(en['connection.address'])
  fireEvent.click(screen.getByRole('button', { name: en['connection.save'] }))
  expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Could not save profile')
  expect(screen.getByLabelText(en['connection.address'])).toHaveProperty('value', 'http://127.0.0.1:8188')
  fireEvent.keyDown(document, { key: 'Escape' })
  await waitFor(() => { expect(screen.queryByRole('dialog')).toBeNull() })
})

it('reports a profile connection that could not be read', async () => {
  fixture({ readConnection: vi.fn().mockRejectedValue(new Error('settings unavailable')) })
  fireEvent.click(screen.getByRole('button', { name: en['connection.open'] }))

  expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'settings unavailable')
})

it('names a failure the profile reported as a plain value', async () => {
  fixture({ readConnection: vi.fn().mockRejectedValue('server refused') })
  fireEvent.click(screen.getByRole('button', { name: en['connection.open'] }))

  // A rejection need not be an Error, and the dialog still has to say what happened.
  expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'server refused')
})

it('reports a failed test and keeps the address for a retry', async () => {
  const actions = fixture({ testConnection: vi.fn().mockRejectedValue(new Error('no server')) })
  fireEvent.click(screen.getByRole('button', { name: en['connection.open'] }))
  await screen.findByLabelText(en['connection.address'])
  fireEvent.click(screen.getByRole('button', { name: en['connection.test'] }))

  expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'no server')
  expect(screen.getByLabelText(en['connection.address'])).toHaveProperty('value', 'http://127.0.0.1:8188')
  expect(actions.saveConnection).not.toHaveBeenCalled()
})

it('clears a confirmed address once it is edited', async () => {
  fixture()
  fireEvent.click(screen.getByRole('button', { name: en['connection.open'] }))
  const address = await screen.findByLabelText(en['connection.address'])
  fireEvent.click(screen.getByRole('button', { name: en['connection.test'] }))
  await screen.findByText(en['connection.connected'])

  // A confirmation belongs to the address that was tested, not to the form.
  fireEvent.change(address, { target: { value: 'http://other-box:8188' } })
  expect(screen.queryByText(en['connection.connected'])).toBeNull()
})

it('abandons the draft when the dialog is cancelled', async () => {
  const actions = fixture()
  fireEvent.click(screen.getByRole('button', { name: en['connection.open'] }))
  await screen.findByLabelText(en['connection.address'])
  fireEvent.change(screen.getByLabelText(en['connection.address']), { target: { value: 'http://draft-box:8188' } })

  fireEvent.click(screen.getByRole('button', { name: en['delete.cancel'] }))
  await waitFor(() => { expect(screen.queryByRole('dialog')).toBeNull() })
  expect(actions.saveConnection).not.toHaveBeenCalled()
})

it('holds the dialog open and blocks both actions while the profile connection loads', async () => {
  let release = (): void => {}
  fixture({ readConnection: vi.fn(() => new Promise<ComfyConnectionValue>((resolve) => { release = () => { resolve({ baseUrl: 'http://127.0.0.1:8188', outputDirectory: '', remote: false }) } })) })
  fireEvent.click(screen.getByRole('button', { name: en['connection.open'] }))

  // Escape must not discard a request that is already in flight, and the footer must not offer
  // Test or Save against settings the dialog has not received yet.
  fireEvent.keyDown(document, { key: 'Escape' })
  expect(screen.queryByRole('dialog')).not.toBeNull()
  expect(screen.getByRole('button', { name: en['connection.test'] })).toHaveProperty('disabled', true)
  // Saving relabels the action, so the pending name is the one to look for.
  expect(screen.getByRole('button', { name: en['connection.pending'] })).toHaveProperty('disabled', true)

  release()
  await screen.findByLabelText(en['connection.address'])
})

it('starts, stops and restarts the server from the panel, reporting each outcome', async () => {
  const actions = fixture()
  fireEvent.click(screen.getByRole('button', { name: en['connection.open'] }))
  await screen.findByLabelText(en['connection.address'])

  fireEvent.click(screen.getByRole('button', { name: en['connection.serverStart'] }))
  expect(await screen.findByText('Started ComfyUI.')).toBeTruthy()

  fireEvent.click(screen.getByRole('button', { name: en['connection.serverStop'] }))
  expect(await screen.findByText('Stopped ComfyUI.')).toBeTruthy()

  fireEvent.click(screen.getByRole('button', { name: en['connection.serverRestart'] }))
  expect(await screen.findByText('Restarted ComfyUI.')).toBeTruthy()

  expect(actions.startServer).toHaveBeenCalledTimes(1)
  expect(actions.stopServer).toHaveBeenCalledTimes(1)
  expect(actions.restartServer).toHaveBeenCalledTimes(1)
})

it('blocks the server controls while an action runs, then shows what it did', async () => {
  const gate = Promise.withResolvers<{ running: boolean; detail: string }>()
  fixture({ startServer: vi.fn(() => gate.promise) })
  fireEvent.click(screen.getByRole('button', { name: en['connection.open'] }))
  await screen.findByLabelText(en['connection.address'])

  fireEvent.click(screen.getByRole('button', { name: en['connection.serverStart'] }))

  // A second press while the first is in flight would be a second server.
  expect(await screen.findByText(en['connection.serverPending'])).toBeTruthy()
  expect(screen.getByRole('button', { name: en['connection.serverStop'] })).toHaveProperty('disabled', true)
  expect(screen.getByRole('button', { name: en['connection.serverRestart'] })).toHaveProperty('disabled', true)

  gate.resolve({ running: true, detail: 'Started ComfyUI.' })
  expect(await screen.findByText('Started ComfyUI.')).toBeTruthy()
})

it('surfaces a refused server action as an alert', async () => {
  fixture({ stopServer: vi.fn().mockRejectedValue(new Error('ComfyUI did not stop.')) })
  fireEvent.click(screen.getByRole('button', { name: en['connection.open'] }))
  await screen.findByLabelText(en['connection.address'])

  fireEvent.click(screen.getByRole('button', { name: en['connection.serverStop'] }))

  const alert = await screen.findByText('ComfyUI did not stop.')
  expect(alert.getAttribute('role')).toBe('alert')
})

const stoppedStatus = { reachable: false, baseUrl: 'http://127.0.0.1:8188', models: [], workflows: [],
  libraryAvailable: true, error: null }

it('shows Starting immediately, disables duplicate actions, and reports readiness after startup', async () => {
  const gate = Promise.withResolvers<{ running: boolean; detail: string }>()
  const onServerState = vi.fn()
  fixture({ presentation: 'panel', readStatus: vi.fn(async () => stoppedStatus), onServerState,
    startServer: vi.fn(() => gate.promise) })
  await screen.findByText(en['server.stopped'])
  fireEvent.click(screen.getByRole('button', { name: en['connection.serverStart'] }))
  expect(screen.getByRole('progressbar')).toHaveProperty('ariaLabel', en['server.starting'])
  expect(screen.getByRole('button', { name: en['connection.serverStart'] })).toHaveProperty('disabled', true)
  expect(onServerState).toHaveBeenLastCalledWith('starting')
  await act(async () => { gate.resolve({ running: true, detail: 'Ready' }); await gate.promise })
  await screen.findByText(en['server.running'])
  expect(onServerState).toHaveBeenLastCalledWith('running')
  expect(screen.queryByRole('progressbar')).toBeNull()
  expect(screen.getByRole('button', { name: en['connection.serverStop'] })).toHaveProperty('disabled', false)
})

it('keeps a completed start result when an earlier status check finishes late', async () => {
  const gate = Promise.withResolvers<typeof stoppedStatus>()
  const onServerState = vi.fn()
  fixture({ presentation: 'panel', readStatus: vi.fn(() => gate.promise), onServerState })
  fireEvent.click(screen.getByRole('button', { name: en['connection.open'] }))
  await screen.findByLabelText(en['connection.address'])
  fireEvent.click(screen.getAllByRole('button', { name: en['connection.serverStart'] }).at(-1)!)
  await waitFor(() => { expect(onServerState).toHaveBeenLastCalledWith('running') })
  await act(async () => { gate.resolve(stoppedStatus); await gate.promise })
  expect(onServerState).toHaveBeenLastCalledWith('running')
})

it('shows a failed state when the server operation rejects', async () => {
  const onServerState = vi.fn()
  fixture({ presentation: 'panel', readStatus: vi.fn(async () => stoppedStatus), onServerState,
    startServer: vi.fn(async () => { throw new Error('Server could not start') }) })
  await screen.findByText(en['server.stopped'])
  fireEvent.click(screen.getByRole('button', { name: en['connection.serverStart'] }))
  await screen.findByText(en['server.failed'])
  expect(onServerState).toHaveBeenLastCalledWith('failed')
  expect(screen.getByRole('alert').textContent).toBe('Server could not start')
})
