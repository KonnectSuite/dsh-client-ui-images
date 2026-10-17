/** Starter examples offered while an Images conversation is empty. */
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import css from './ImagesPanel.module.css'

/** Locale keys of the offered examples, in display order. */
export const STARTER_KEYS = ['starter.portrait', 'starter.edit', 'starter.video'] as const

/** One starter example's locale key. */
export type StarterKey = typeof STARTER_KEYS[number]

/**
 * Render the empty conversation's examples.
 *
 * A tap fills the composer rather than sending: one click must not spend a
 * generation, and the example is a starting point the user edits rather than the
 * whole of their intent.
 *
 * Both empty states use this — the panel's, and the blank-room one inside
 * `ImagesAgent` — so the two cannot drift apart.
 *
 * @param props - Localized labels and the composer fill.
 * @returns the example buttons.
 */
export function Starters({ t, onPick }: {
  readonly t: (key: StarterKey) => string
  readonly onPick: (text: string) => void
}) {
  return <div className={css.starters}>
    {STARTER_KEYS.map(key => <Button key={key} size="sm" variant="outline" onClick={() => { onPick(t(key)) }}>{t(key)}</Button>)}
  </div>
}
