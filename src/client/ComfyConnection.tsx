/** Profile connection form shared by Images direct generation and MCP execution. */
import { useEffect, useRef, useState } from 'react'
import { Button, Modal, StateDot, Tooltip, IconSlidersTwoOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { ComfyConnectionValue } from '@deepseek-ai/dsh-api-mcp-controller/types'
import type { ComfyServerControlResult } from '@deepseek-ai/dsh-api-comfyui-controller/types'
import type { ComfyImagesStatus } from '@deepseek-ai/dsh-api-comfyui-controller/types'
import { NS } from './locales.ts'
import { openFolder, pickOutputFolder, readOutputFolders, type OutputFolderCandidate } from './folders.ts'
import css from './ImagesPanel.module.css'

/** Server availability and lifecycle transitions displayed by Images. */
export type ComfyServerPhase = 'checking' | 'running' | 'stopped' | 'starting' | 'stopping' | 'restarting' | 'failed'

/** Connection operations supplied by the profile's MCP controller. */
export interface ComfyConnectionActions {
  /** Read availability of the configured image server. */
  readonly readStatus?: () => Promise<ComfyImagesStatus>
  /** Return the configured delay between completed availability checks. */
  readonly pollIntervalMs?: () => number
  /** Publish availability and lifecycle transitions to the Images page. */
  readonly onServerState?: (phase: ComfyServerPhase) => void
  /** Render persistent status and lifecycle controls above the conversation. */
  readonly presentation?: 'panel'
  readonly readConnection: () => Promise<ComfyConnectionValue>
  readonly testConnection: (baseUrl: string) => Promise<void>
  readonly saveConnection: (settings: ComfyConnectionValue) => Promise<void>
  readonly onSaved: () => void
  /** Start, stop and restart the server this profile talks to. */
  readonly startServer: () => Promise<ComfyServerControlResult>
  readonly stopServer: () => Promise<ComfyServerControlResult>
  readonly restartServer: () => Promise<ComfyServerControlResult>
}

/** Open, test and save the profile's ComfyUI connection without losing the image draft.
 * @param props Localized form and persistent connection operations.
 * @returns Header action and dismissable connection modal.
 */
export function ComfyConnection({ t, readConnection, testConnection, saveConnection, onSaved, startServer, stopServer, restartServer,
  readStatus, pollIntervalMs, onServerState, presentation }:
  PropsLocale<typeof NS> & ComfyConnectionActions) {
  const [open, setOpen] = useState(false)
  const [settings, setSettings] = useState<ComfyConnectionValue>()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()
  const [tested, setTested] = useState(false)
  const [serverBusy, setServerBusy] = useState(false)
  const [phase, setPhase] = useState<ComfyServerPhase>('checking')
  const operation = useRef(false)
  const epoch = useRef(0)
  const [statusRevision, setStatusRevision] = useState(0)
  const [serverState, setServerState] = useState<string>()
  const [serverError, setServerError] = useState<string>()
  const [suggestion, setSuggestion] = useState<OutputFolderCandidate>()
  useEffect(() => {
    if (!open) return undefined
    let disposed = false
    void readOutputFolders().then((choices) => {
      if (!disposed) setSuggestion(choices.candidates[0])
    }).catch(() => { if (!disposed) setSuggestion(undefined) })
    return () => { disposed = true }
  }, [open])
  useEffect(() => { onServerState?.(phase) }, [onServerState, phase])
  useEffect(() => {
    if (readStatus === undefined) return undefined
    let disposed = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const check = async (): Promise<void> => {
      const version = epoch.current
      try {
        if (!operation.current) {
          const status = await readStatus()
          if (!disposed && version === epoch.current) { setPhase(status.reachable ? 'running' : 'stopped'); setServerError(undefined) }
        }
      } catch (cause) {
        if (!disposed && version === epoch.current && !operation.current) { setPhase('failed'); setServerError(cause instanceof Error ? cause.message : String(cause)) }
      } finally {
        if (!disposed && pollIntervalMs !== undefined) timer = setTimeout(() => { void check() }, pollIntervalMs())
      }
    }
    void check()
    return () => { disposed = true; if (timer !== undefined) clearTimeout(timer) }
  }, [readStatus, pollIntervalMs, statusRevision])
  const fail = (reason: unknown): void => { setError(reason instanceof Error ? reason.message : String(reason)) }
  const control = async (action: () => Promise<ComfyServerControlResult>, transition: 'starting' | 'stopping' | 'restarting'): Promise<void> => {
    epoch.current++
    operation.current = true
    setPhase(transition); setServerBusy(true); setServerError(undefined)
    try { const result = await action(); setServerState(result.detail); setPhase(result.running ? 'running' : 'stopped'); onSaved() }
    catch (reason) { setPhase('failed'); setServerError(reason instanceof Error ? reason.message : String(reason)) }
    finally { operation.current = false; setServerBusy(false) }
  }
  const show = async (): Promise<void> => {
    setOpen(true); setPending(true); setSettings(undefined); setError(undefined); setTested(false)
    try { setSettings(await readConnection()) }
    catch (reason) { fail(reason) }
    finally { setPending(false) }
  }
  const test = async (): Promise<void> => {
    /* v8 ignore next -- the footer disables Test and Save until the profile's connection loads. */
    if (!settings) return
    setPending(true); setError(undefined); setTested(false)
    try { await testConnection(settings.baseUrl); setTested(true) }
    catch (reason) { fail(reason) }
    finally { setPending(false) }
  }
  const save = async (): Promise<void> => {
    /* v8 ignore next -- the footer disables Test and Save until the profile's connection loads. */
    if (!settings) return
    setPending(true); setError(undefined)
    try { await saveConnection(settings); epoch.current++; setPhase('checking'); setStatusRevision(value => value + 1); onSaved(); setOpen(false) }
    catch (reason) { fail(reason) }
    finally { setPending(false) }
  }
  const browse = async (): Promise<void> => {
    setPending(true); setError(undefined)
    try {
      const result = await pickOutputFolder()
      if (result.kind === 'picked') setSettings(current => current === undefined ? current : { ...current, outputDirectory: result.path })
      else if (result.kind === 'unsupported') setError(t('gallery.folderPickerUnavailable'))
    } catch (reason) { fail(reason) }
    finally { setPending(false) }
  }
  const revealCurrent = async (): Promise<void> => {
    /* v8 ignore next -- the button is disabled until the profile's connection loads. */
    if (!settings) return
    setError(undefined)
    try { await openFolder(settings.outputDirectory.trim()) }
    catch (reason) { fail(reason) }
  }
  /* v8 ignore next -- the stylesheet always declares the class; the empty fallback only satisfies exactOptionalPropertyTypes. */
  const dialogClass = css.connectionDialog ?? ''
  const controls = <div className={css.serverActions}>
    <Button disabled={serverBusy || phase === 'running' || phase === 'checking'} onClick={() => { void control(startServer, 'starting') }}>
      {t('connection.serverStart')}</Button>
    <Button variant="outline" disabled={serverBusy || phase !== 'running'} onClick={() => { void control(stopServer, 'stopping') }}>
      {t('connection.serverStop')}</Button>
    <Button variant="outline" disabled={serverBusy || phase !== 'running'} onClick={() => { void control(restartServer, 'restarting') }}>
      {t('connection.serverRestart')}</Button>
  </div>
  const transitioning = phase === 'checking' || phase === 'starting' || phase === 'stopping' || phase === 'restarting'
  return <>
    {presentation === 'panel' && <section className={css.serverPanel} data-server-state={phase} aria-busy={transitioning}>
      <div className={css.serverSummary}>
        <StateDot state={transitioning ? 'ongoing' : phase === 'running' ? 'done' : phase === 'failed' ? 'error' : 'idle'} size={24} />
        <div><h2>{t('server.title')}</h2><p role="status" aria-live="polite">{t(`server.${phase}`)}</p></div>
      </div>
      {controls}
      {transitioning && <div className={css.serverProgress} role="progressbar" aria-label={t(`server.${phase}`)} />}
      {serverError !== undefined && <p className={css.roomError} role="alert">{serverError}</p>}
    </section>}
    <Tooltip label={t('connection.open')} side="bottom" delayMs={500} portal><Button size="sm" onClick={() => { void show() }} aria-label={t('connection.open')}><IconSlidersTwoOutlineRegular size={14} /><span className={css.actionLabel}>{t('connection.open')}</span></Button></Tooltip>
    <Modal open={open} title={t('connection.title')} closeLabel={t('delete.close')} className={dialogClass}
      onClose={() => { if (!pending) setOpen(false) }}
      footer={<div className={css.confirmActions}>
        <Button variant="outline" disabled={pending} onClick={() => { setOpen(false) }}>{t('delete.cancel')}</Button>
        <Button variant="outline" disabled={pending || !settings?.baseUrl.trim()} onClick={() => { void test() }}>{t('connection.test')}</Button>
        <Button disabled={pending || !settings?.baseUrl.trim()} onClick={() => { void save() }}>{t(pending ? 'connection.pending' : 'connection.save')}</Button>
      </div>}>
      <div className={css.connectionForm}>
        <p>{t('connection.description')}</p>
        {settings && <>
          <label>{t('connection.location')}<select disabled={pending} value={settings.remote ? 'remote' : 'local'} onChange={(event) => { setSettings({ ...settings, remote: event.target.value === 'remote' }); setTested(false) }}>
            <option value="local">{t('connection.local')}</option><option value="remote">{t('connection.remote')}</option>
          </select></label>
          <label>{t('connection.address')}<input type="url" disabled={pending} value={settings.baseUrl} onChange={(event) => { setSettings({ ...settings, baseUrl: event.target.value }); setTested(false) }} /></label>
          <label>{t('connection.folder')}<input disabled={pending} value={settings.outputDirectory} onChange={(event) => { setSettings({ ...settings, outputDirectory: event.target.value }) }} /></label>
          <div className={css.folderRow}>
            <Button variant="outline" disabled={pending} onClick={() => { void browse() }}>{t('connection.folderBrowse')}</Button>
            <Button variant="outline" disabled={pending || settings.outputDirectory.trim() === ''} onClick={() => { void revealCurrent() }}>{t('connection.folderOpen')}</Button>
          </div>
          <p>{t('connection.folderHint')}</p>
          {suggestion !== undefined && settings.outputDirectory.trim() === '' && <p className={css.folderSuggestion}>
            <span>{t('connection.folderDetected', { path: suggestion.path, count: suggestion.files })}</span>
            <Button size="sm" disabled={pending} onClick={() => { setSettings({ ...settings, outputDirectory: suggestion.path }) }}>{t('connection.folderUseDetected')}</Button>
          </p>}
        </>}
        <div role="status" aria-live="polite">{pending ? t('connection.pending') : tested ? t('connection.connected') : null}</div>
        {error && <p role="alert" className={css.error}>{error}</p>}
        <section>
          <p>{t('connection.serverDescription')}</p>
          <p role="status">{t(`server.${phase}`)}</p>
          <div className={css.confirmActions}>
            <Button variant="outline" disabled={serverBusy} onClick={() => { void control(startServer, 'starting') }}>{t('connection.serverStart')}</Button>
            <Button variant="outline" disabled={serverBusy} onClick={() => { void control(stopServer, 'stopping') }}>{t('connection.serverStop')}</Button>
            <Button variant="outline" disabled={serverBusy} onClick={() => { void control(restartServer, 'restarting') }}>{t('connection.serverRestart')}</Button>
          </div>
          <div role="status" aria-live="polite">{serverBusy ? t('connection.serverPending') : serverState ?? null}</div>
          {serverError && <p role="alert" className={css.error}>{serverError}</p>}
        </section>
      </div>
    </Modal>
  </>
}
