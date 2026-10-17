/** Editable creative briefs offered before a Content conversation begins. */
import { IconSparkleRegular, IconEditOutlineRegular, IconEnhanceOutlineRegular, IconMicrophoneOutlineRegular, IconPlanOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import { NS } from './locales.ts'
import css from './ImagesPanel.module.css'

const IDEAS = ['photo', 'edit', 'design', 'animate', 'film', 'storyboard'] as const

/** Offer creative starting points without sending a request or spending a render.
 * @param props - Localized idea briefs, availability and draft insertion.
 * @returns Keyboard-accessible idea cards.
 */
export function StudioIdeas({ t, onPick, disabled }: PropsLocale<typeof NS> & {
  onPick: (text: string) => void
  disabled: boolean
}) {
  return <div className={css.ideaGrid}>{IDEAS.map((idea, index) => {
    const Icon = index === 1 ? IconEditOutlineRegular : index === 2 ? IconEnhanceOutlineRegular
      : index === 4 ? IconMicrophoneOutlineRegular : index === 5 ? IconPlanOutlineRegular : IconSparkleRegular
    return <button key={idea} type="button" className={css.ideaCard} disabled={disabled}
      onClick={() => { onPick(t(`studio.${idea}.prompt`)) }}>
      <span className={css.ideaArtwork} data-kind={idea} aria-hidden="true"><Icon /></span>
      <span className={css.ideaCopy}><span className={css.ideaTitle}>{t(`studio.${idea}.title`)}</span>
        <span className={css.ideaHint}>{t(`studio.${idea}.hint`)}</span></span>
    </button>
  })}</div>
}
