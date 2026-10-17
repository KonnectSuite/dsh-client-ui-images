/** Dedicated Images navigation around the standard session conversation. */
import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import { Button, StateDot } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ImagesPanelProps } from './ImagesPanel.tsx'
import type { SessionReference } from '@deepseek-ai/dsh-api-session-controller/client'
import css from './ImagesPanel.module.css'
import type { ComfyServerPhase } from './ComfyConnection.tsx'
import { CommunityMedia } from './CommunityMedia.tsx'

/** Render profile-installed image generation with ordinary chat tools and cards.
 * @param props - Durable Images sessions, plugin availability, and resident chat slots.
 * @returns The plugin setup state or full session conversation.
 */
export function CommunityImagesPanel(props: ImagesPanelProps): ReactNode {
  const { rooms, currentAgent, settleAgent, openRoom, resetAgent, roomTitle,
    exportRoom, archiveRoom, renderSlot,
    SessionProvider, imagePlugin, openImagePlugin, t } = props
  const navigation = useSyncExternalStore(listener => rooms.subscribe(listener), () => rooms.getSnapshot())
  const [reference, setReference] = useState<SessionReference | undefined>(currentAgent)
  const [serverPhase, setServerPhase] = useState<ComfyServerPhase>('checking')
  const [ready, setReady] = useState<boolean>()
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [revision, setRevision] = useState(0)
  const [archived, setArchived] = useState(false)
  const [view, setView] = useState<'studio' | 'library'>('studio')
  useEffect(() => {
    let disposed = false
    setReady(undefined)
    setError(undefined)
    void imagePlugin().then((value) => { if (!disposed) setReady(value) })
      .catch((cause: unknown) => { if (!disposed) setError(cause instanceof Error ? cause.message : t('notice.failed')) })
    return () => { disposed = true }
  }, [imagePlugin, revision, t])
  useEffect(() => { settleAgent?.(reference) }, [reference, settleAgent])
  useEffect(() => {
    if (ready !== true || reference !== undefined) return undefined
    let disposed = false
    void resetAgent().then((value) => { if (!disposed) setReference(value) })
      .catch((cause: unknown) => { if (!disposed) setError(cause instanceof Error ? cause.message : t('notice.failed')) })
    return () => { disposed = true }
  }, [ready, reference, resetAgent, t])
  const visibleIds = navigation.ids.filter(id => (navigation.archivedIds ?? []).includes(id) === archived)
  const select = (operation: () => Promise<SessionReference>): void => {
    setBusy(true)
    setError(undefined)
    void operation().then(setReference)
      .catch((cause: unknown) => { setError(cause instanceof Error ? cause.message : t('notice.failed')) })
      .finally(() => { setBusy(false) })
  }
  return <main className={`${css.panel} ${css.communityPanel}`} data-studio-view={view}>
    <header className={`${css.header} ${css.communityHeader}`}><div><h1>{t('page.title')}</h1><p>{t('community.description')}</p></div>
      <div className={css.headerActions}>
        <Button variant="outline" onClick={openImagePlugin}>{t('community.settings')}</Button>
        <Button variant="outline" onClick={() => { setRevision(value => value + 1) }}>{t('action.refresh')}</Button>
        {reference !== undefined && <Button variant="outline" onClick={() => {
          void exportRoom(reference.sessionId).then((exported) => { if (!exported) setError(t('notice.exportUnavailable')) })
            .catch((cause: unknown) => { setError(cause instanceof Error ? cause.message : t('notice.failed')) })
        }}>{t('action.export')}</Button>}
        {ready === true && <Button variant="primary" disabled={busy} onClick={() => { select(resetAgent) }}>{t('composer.newConversation')}</Button>}
      </div>
    </header>
    <div className={css.studioToolbar}>
      <div className={css.studioTabs} aria-label={t('studio.views')}>
        <Button variant="ghost" aria-pressed={view === 'studio'} onClick={() => { setView('studio') }}>{t('studio.workspace')}</Button>
        <Button variant="ghost" aria-pressed={view === 'library'} onClick={() => { setView('library') }}>{t('studio.library')}</Button>
      </div>
      <details className={css.studioConnection}>
        <summary><StateDot state={serverPhase === 'running' ? 'done' : serverPhase === 'checking' ? 'ongoing' : 'error'} />
          {t(serverPhase === 'running' ? 'studio.connected' : serverPhase === 'checking' ? 'server.checking' : 'studio.offline')}</summary>
        <div className={css.serverSection}>{renderSlot('images.connection', { presentation: 'panel', onServerState: setServerPhase,
          onSaved: () => { setRevision(value => value + 1) } })}</div>
      </details>
    </div>
    {error !== undefined && <p className={css.roomError} role="alert">{error}</p>}
    {ready === undefined && error === undefined && <div className={css.welcome}><StateDot state="ongoing" size={28} /></div>}
    {ready === false && <section className={css.welcome}>
      <h2>{t('community.installTitle')}</h2><p>{t('community.installHint')}</p>
      <Button onClick={openImagePlugin}>{t('community.installAction')}</Button>
      <a href="https://github.com/KonnectSuite/dsh-image-gen" target="_blank" rel="noreferrer">{t('community.about')}</a>
    </section>}
    <div className={css.studioWorkspace}>
      <div className={`${css.roomLayout} ${css.communityLayout}`} hidden={view !== 'studio'}>
        <details className={css.studioConversations}><summary>{t('room.conversations')}
          <span className={css.studioConversationTitle}>{reference === undefined ? t('composer.newConversation') : roomTitle(reference.sessionId)}</span>
        </summary>
        <nav className={css.conversationList} aria-label={t('room.conversations')}>
          <Button variant="ghost" onClick={() => { setArchived(value => !value) }}>{t(archived ? 'room.active' : 'room.archived')}</Button>
          {visibleIds.map(id => <div key={id} className={css.conversationEntry}>
            <button
              type="button" className={css.conversationRow} disabled={busy} aria-current={reference?.sessionId === id ? 'page' : undefined}
              onClick={() => { select(() => openRoom(id)) }}>{roomTitle(id)}</button>
            {archiveRoom !== undefined && <Button variant="ghost" disabled={busy} onClick={() => {
              void archiveRoom(id, !archived).then(() => { if (reference?.sessionId === id && !archived) setReference(undefined) })
                .catch((cause: unknown) => { setError(cause instanceof Error ? cause.message : t('notice.failed')) })
            }}>{t(archived ? 'room.restore' : 'room.archive')}</Button>}
          </div>)}
        </nav></details>
        <section className={`${css.creationArea} ${css.chatStage} ${css.communityStage}`}
          onDragOver={(event) => { if (serverPhase === 'running' && ready === true) { event.preventDefault(); event.dataTransfer.dropEffect = 'copy' } }}
          onDrop={(event) => {
            if (event.defaultPrevented) return
            const encoded = event.dataTransfer.getData('application/x-arya-media')
            if (encoded === '' && event.dataTransfer.files.length === 0) return
            event.preventDefault()
            if (serverPhase !== 'running' || ready !== true) return
            try {
              let operation: Promise<void> | undefined
              if (encoded !== '') {
                const item: unknown = JSON.parse(encoded)
                if (typeof item !== 'object' || item === null || !('filename' in item) || typeof item.filename !== 'string'
                || !('subfolder' in item) || typeof item.subfolder !== 'string' || !('type' in item) || typeof item.type !== 'string') throw new Error(t('notice.attachFailed'))
                operation = props.addMedia?.([{ filename: item.filename, subfolder: item.subfolder, type: item.type }])
              } else operation = props.addFiles?.([...event.dataTransfer.files])
              void operation?.catch((cause: unknown) => { setError(cause instanceof Error ? cause.message : t('notice.attachFailed')) })
            } catch (cause) { setError(cause instanceof Error ? cause.message : t('notice.attachFailed')) }
          }}>
          <p className={css.dropHint}>{t('room.mediaDrop')}</p>
          {ready === true && serverPhase !== 'running' && <p className={css.chatUnavailable} role="status">{t('server.chatUnavailable')}</p>}
          {reference !== undefined && <SessionProvider session={reference}>
            {renderSlot('images.agent', { onSettled: () => { setRevision(value => value + 1) }, onUseStarter: (text) => {
              void props.fillDraft?.(text).catch((cause: unknown) => { setError(cause instanceof Error ? cause.message : t('notice.failed')) })
            }, readOnly: serverPhase !== 'running' || ready !== true || (navigation.archivedIds ?? []).includes(reference.sessionId) })}
          </SessionProvider>}
        </section>
      </div>
      <CommunityMedia {...props} revision={revision} canCreate={ready === true && serverPhase === 'running'} />
    </div>
  </main>
}
