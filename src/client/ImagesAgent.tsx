/** Embedded Images conversation using the resident Conversation factory. */
import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import type { PropsRuntime, PropsRenderFactories, PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { ConversationViewsProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import { UserTextPresentationContext } from '@deepseek-ai/dsh-client-ui-primitives'
import { imageUserText } from './agent-prompt.ts'
import css from './ImagesPanel.module.css'
import type {} from '@deepseek-ai/dsh-client-ui-model-selection/client'
import type {} from '@deepseek-ai/dsh-client-ui-permission-presets/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import { NS } from './locales.ts'
import { StudioIdeas } from './StudioIdeas.tsx'

function ImagesChatView({ renderSlot }: ConversationViewsProps): ReactNode {
  return renderSlot('conversation.session', { view: 'chat' })
}

/**
 * Refresh media when the Images agent settles; render standard tool and approval UI.
 * @param props - Session-scoped renderer seats and gallery refresh callback.
 * @returns the embedded conversation.
 */
export function ImagesAgent({ useSession, renderFactorySlot, onSettled, onUseStarter, attachPreview, t, readOnly = false }:
  PropsRuntime<'images.agent'> & PropsRenderFactories & PropsLocale<typeof NS>
  & { onSettled: () => void; onUseStarter: (text: string) => void; attachPreview: () => () => void; readOnly?: boolean }): ReactNode {
  useLayoutEffect(attachPreview, [attachPreview])
  const blank = useSession(state => state.blank)
  const running = useSession(state => state.running)
  const error = useSession(state => state.promptError?.error.message ?? state.lastAgentError)
  const wasRunning = useRef(false)
  const refresh = useRef(onSettled)
  refresh.current = onSettled
  useEffect(() => {
    if (wasRunning.current && !running) refresh.current()
    wasRunning.current = running
  }, [running])
  return <UserTextPresentationContext.Provider value={imageUserText}>
    <div className={`${css.communityConversation} ${blank && !running ? css.communityBlank : ''}`}>
      {blank && !running && <div className={css.communityGreeting}>
        <span className={css.studioEyebrow}>{t('studio.eyebrow')}</span>
        <h2>{t('studio.welcome')}</h2><p>{t('studio.welcomeHint')}</p>
        <StudioIdeas t={t} onPick={onUseStarter} disabled={readOnly} />
      </div>}
      {error != null && <p className={css.roomError} role="alert">{error}</p>}
      {renderFactorySlot('conversation.content', {
        variant: 'embedded', phase: 'active', hero: false, transcriptOnly: readOnly,
      }, { slots: { views: ImagesChatView } })}</div></UserTextPresentationContext.Provider>
}

/** Render the resident model and permission controls beside the Images composer.
 * @param props Session controls, stop operation and localized labels.
 * @returns Model selection, permission selection and a stop action while running.
 */
export function ImagesAgentControls({ useSession, renderFactorySlot, stop, locked, t }:
  PropsRuntime<'images.agent.controls'> & PropsRenderFactories &
  PropsLocale<typeof NS> & { stop: () => Promise<void>; locked: boolean }): ReactNode {
  const running = useSession(state => state.running)
  return <>
    {renderFactorySlot('permission.selection', { locked })}
    {renderFactorySlot('model.selection', { locked })}
    {running && <Button size="sm" onClick={() => { void stop().catch((_error: unknown) => {
      // Session cancellation publishes its failure through the conversation's prompt error.
    }) }}>{t('room.stop')}</Button>}
  </>
}
