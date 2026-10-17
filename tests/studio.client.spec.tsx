// @vitest-environment jsdom
/** Customer ideas stay editable; library filtering retains exact media references. */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { StudioIdeas } from '../src/client/StudioIdeas.tsx'
import { en } from '../src/client/locales.ts'

afterEach(cleanup)

it('offers six editable briefs without starting generation', () => {
  const onPick = vi.fn()
  render(<StudioIdeas t={key => en[key as keyof typeof en]} onPick={onPick} disabled={false} />)
  expect(screen.getAllByRole('button')).toHaveLength(6)
  fireEvent.click(screen.getByRole('button', { name: /Direct a film/ }))
  expect(onPick).toHaveBeenCalledExactlyOnceWith(en['studio.film.prompt'])
})

it('blocks starting ideas when the conversation is read only', () => {
  const onPick = vi.fn()
  render(<StudioIdeas t={key => en[key as keyof typeof en]} onPick={onPick} disabled />)
  fireEvent.click(screen.getByRole('button', { name: /Find the idea/ }))
  expect(onPick).not.toHaveBeenCalled()
})
