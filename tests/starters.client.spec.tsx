// @vitest-environment jsdom
/**
 * The shared empty-conversation examples. Both empty states render this — the
 * panel's, and the blank-room one inside `ImagesAgent` — so the spec pins the
 * behavior they share: one button per key, and a tap fills rather than sends.
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { STARTER_KEYS, Starters } from '../src/client/Starters.tsx'
import { en } from '../src/client/locales.ts'

afterEach(cleanup)

describe('Starters', () => {
  it('offers one example per key', () => {
    render(<Starters t={key => en[key]} onPick={() => {}} />)
    expect(STARTER_KEYS).toHaveLength(3)
    for (const key of STARTER_KEYS) expect(screen.getByRole('button', { name: en[key] })).toBeTruthy()
  })

  it('hands the chosen example to the composer', () => {
    const onPick = vi.fn()
    render(<Starters t={key => en[key]} onPick={onPick} />)
    fireEvent.click(screen.getByRole('button', { name: en['starter.edit'] }))
    expect(onPick).toHaveBeenCalledExactlyOnceWith(en['starter.edit'])
  })
})
