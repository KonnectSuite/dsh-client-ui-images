// @vitest-environment jsdom
import { createElement, type ReactNode } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { ImagesAgent, ImagesAgentControls } from '../src/client/ImagesAgent.tsx'

afterEach(cleanup)

/** The session seat is a framework hook, so tests feed it a plain stub. */
const session = (state: Record<string, unknown>) => (select: (value: never) => unknown) => select(state as never)

it('renders the embedded chat view the conversation asks for', () => {
  let views: ((props: { renderSlot: (name: string, props: unknown) => ReactNode }) => ReactNode) | undefined
  render(createElement(ImagesAgent, {
    useSession: session({ running: false, blank: false, promptError: undefined, lastAgentError: undefined }),
    renderFactorySlot: (_name: string, _props: unknown, options: { slots: { views: typeof views } }) => {
      views = options.slots.views
      return null
    },
    onSettled: () => {}, onUseStarter: () => {}, attachPreview: () => () => {}, t: (key: string) => key,
  } as never))

  // The factory receives a chat view it renders later, when the conversation shows a transcript.
  expect(views).toBeDefined()
  const renderSlot = vi.fn(() => null)
  render(createElement(views as never, { renderSlot }))
  expect(renderSlot).toHaveBeenCalledWith('conversation.session', { view: 'chat' })
})

it('refreshes the gallery when the agent settles', () => {
  const onSettled = vi.fn()
  const props = (running: boolean) => ({
    useSession: session({ running, blank: false, promptError: undefined, lastAgentError: undefined }),
    renderFactorySlot: () => null,
    onSettled, onUseStarter: () => {}, attachPreview: () => () => {}, t: (key: string) => key,
  })
  const { rerender } = render(createElement(ImagesAgent, props(true) as never))
  expect(onSettled).not.toHaveBeenCalled()

  // Only the running-to-idle edge refreshes: a panel that refreshed on every render would
  // re-read history continuously while a render is in flight.
  rerender(createElement(ImagesAgent, props(false) as never))
  expect(onSettled).toHaveBeenCalledTimes(1)
})

it('shows the agent error in the room', () => {
  render(createElement(ImagesAgent, {
    useSession: session({ running: false, blank: false, promptError: undefined, lastAgentError: 'render rejected' }),
    renderFactorySlot: () => null,
    onSettled: () => {}, onUseStarter: () => {}, attachPreview: () => () => {}, t: (key: string) => key,
  } as never))

  expect(screen.getByRole('alert').textContent).toBe('render rejected')
})

it('keeps the composer usable when a stop request fails', async () => {
  const stop = vi.fn(() => Promise.reject(new Error('stop failed')))
  render(createElement(ImagesAgentControls, {
    useSession: session({ running: true }),
    renderFactorySlot: () => null,
    stop, locked: false, t: (key: string) => key,
  } as never))

  fireEvent.click(screen.getByRole('button'))
  // Cancellation reports its failure through the conversation's prompt error, so the click must
  // settle without throwing in the panel.
  await Promise.resolve()
  expect(stop).toHaveBeenCalled()
})
