/** Recent ComfyUI runs and the local media library beside community chat. */
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Button, Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ComfyGeneration, ComfyLibraryPage, ComfyImageReference } from '@deepseek-ai/dsh-api-comfyui-controller/types'
import { ImageCard, type ImagesPanelProps } from './ImagesPanel.tsx'
import { openFolder, pickOutputFolder, readOutputFolders, type OutputFolderCandidate } from './folders.ts'
import css from './ImagesPanel.module.css'

/** Render saved media without taking over plugin generation.
 * @param props - Existing media operations and a refresh revision.
 * @returns Recent runs, saved files, and an image-edit prompt.
 */
export function CommunityMedia({ revision, canCreate = true, ...props }:
  ImagesPanelProps & { revision: number; canCreate?: boolean }): ReactNode {
  const [runs, setRuns] = useState<readonly ComfyGeneration[]>([])
  const [library, setLibrary] = useState<ComfyLibraryPage>({ images: [], total: 0 })
  const [error, setError] = useState<string>()
  const [source, setSource] = useState<ComfyImageReference>()
  const [prompt, setPrompt] = useState('')
  const [busy, setBusy] = useState(false)
  const [selecting, setSelecting] = useState(false)
  const [selected, setSelected] = useState<readonly string[]>([])
  const [confirmDelete, setConfirmDelete] = useState(false)
  const anchor = useRef<number | undefined>(undefined)
  const [refresh, setRefresh] = useState(0)
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState<'all' | 'images' | 'videos'>('all')
  const [collection, setCollection] = useState<'library' | 'recent'>('library')
  /** Configured output folder; undefined until it is read, '' when unset. */
  const [folder, setFolder] = useState<string>()
  const [suggestion, setSuggestion] = useState<OutputFolderCandidate>()
  const readFolder = props.readOutputFolder
  useEffect(() => {
    if (readFolder === undefined) { setFolder(''); return undefined }
    let disposed = false
    void readFolder().then((value) => { if (!disposed) setFolder(value.trim()) })
      .catch(() => { if (!disposed) setFolder('') })
    return () => { disposed = true }
  }, [readFolder, revision, refresh])
  useEffect(() => {
    if (folder === undefined || folder !== '') { setSuggestion(undefined); return undefined }
    let disposed = false
    void readOutputFolders().then((choices) => { if (!disposed) setSuggestion(choices.candidates[0]) })
      .catch(() => { if (!disposed) setSuggestion(undefined) })
    return () => { disposed = true }
  }, [folder])
  useEffect(() => {
    if (folder === undefined) return undefined
    let disposed = false
    const page = folder === '' ? Promise.resolve<ComfyLibraryPage>({ images: [], total: 0 }) : props.library(0)
    void Promise.allSettled([props.history(), page]).then(([history, stored]) => {
      if (disposed) return
      if (history.status === 'fulfilled') setRuns(history.value)
      if (stored.status === 'fulfilled') setLibrary(stored.value)
      const cause: unknown = history.status === 'rejected' ? history.reason : stored.status === 'rejected' ? stored.reason : undefined
      setError(cause === undefined ? undefined : cause instanceof Error ? cause.message : props.t('notice.failed'))
    })
    return () => { disposed = true }
  }, [props.history, props.library, props.t, revision, refresh, folder])
  const key = (image: ComfyImageReference): string => JSON.stringify([image.type, image.subfolder, image.filename])
  const media = [...new Map([...runs.flatMap(run => run.images), ...library.images.map(item => item.image)]
    .map(image => [key(image), image])).values()]
  const chosen = media.filter(image => selected.includes(key(image)))
  const matches = (image: ComfyImageReference, prompt = ''): boolean => {
    const video = /\.(mp4|webm|mov|mkv)$/iu.test(image.filename)
    return (kind === 'all' || (kind === 'videos' ? video : !video))
      && `${image.filename} ${prompt}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
  }
  const visibleMedia = collection === 'recent'
    ? runs.flatMap(run => run.images.filter(image => matches(image, run.prompt)))
    : library.images.filter(item => matches(item.image)).map(item => item.image)
  const toggle = (image: ComfyImageReference, shift: boolean): void => {
    const index = visibleMedia.findIndex(item => key(item) === key(image))
    const range = shift && anchor.current !== undefined
      ? visibleMedia.slice(Math.min(index, anchor.current), Math.max(index, anchor.current) + 1) : [image]
    setSelected((current) => {
      const next = new Set(current)
      if (!shift && next.has(key(image))) next.delete(key(image))
      else for (const item of range) { if (next.size < 100) next.add(key(item)) }
      return [...next]
    })
    anchor.current = index
  }
  const download = async (): Promise<void> => {
    setBusy(true); setError(undefined)
    try {
      const url = 'api/comfyui-archive?' + new URLSearchParams({ files: JSON.stringify(chosen) }).toString()
      const response = await fetch(url, { method: 'HEAD' })
      if (!response.ok) throw new Error(await response.text())
      const link = document.createElement('a'); link.href = url; link.download = 'aryaai-media.zip'; link.click()
    } catch (cause) { setError(cause instanceof Error ? cause.message : props.t('notice.failed')) }
    finally { setBusy(false) }
  }
  const deleteSelection = async (): Promise<void> => {
    setBusy(true); setError(undefined)
    try {
      const result = await props.removeImages(chosen)
      const deleted = new Set(result.deleted.map(key))
      setRuns(current => current.map(run => ({ ...run, images: run.images.filter(image => !deleted.has(key(image))) })))
      setLibrary(current => ({ images: current.images.filter(item => !deleted.has(key(item.image))),
        total: Math.max(0, current.total - result.deleted.length) }))
      setSelected(current => current.filter(value => !deleted.has(value)))
      setConfirmDelete(false)
      if (result.failed.length > 0) setError(props.t('selection.deleteFailed', { count: result.failed.length }))
    } catch (cause) { setError(cause instanceof Error ? cause.message : props.t('notice.failed')) }
    finally { setBusy(false) }
  }
  const adoptFolder = async (directory: string): Promise<void> => {
    const save = props.saveOutputFolder
    if (save === undefined) return
    setBusy(true); setError(undefined)
    try {
      await save(directory)
      setFolder(directory)
      setSuggestion(undefined)
      setRefresh(value => value + 1)
    } catch (cause) { setError(cause instanceof Error ? cause.message : props.t('notice.folderFailed')) }
    finally { setBusy(false) }
  }
  const choose = async (): Promise<void> => {
    setBusy(true); setError(undefined)
    try {
      const result = await pickOutputFolder()
      if (result.kind === 'picked') await adoptFolder(result.path)
      else if (result.kind === 'unsupported') setError(props.t('gallery.folderPickerUnavailable'))
    } catch (cause) { setError(cause instanceof Error ? cause.message : props.t('notice.failed')) }
    finally { setBusy(false) }
  }
  const open = async (): Promise<void> => {
    if (folder === undefined || folder === '') return
    setError(undefined)
    try { await openFolder(folder) } catch (cause) { setError(cause instanceof Error ? cause.message : props.t('notice.failed')) }
  }
  const selectionButton = <Button disabled={busy} onClick={() => {
    setSelecting(value => !value); setSelected([]); anchor.current = undefined
  }}>{props.t(selecting ? 'selection.done' : 'selection.start')}</Button>
  const attach = (image: ComfyImageReference): void => {
    setError(undefined)
    void props.addMedia?.([image]).catch((cause: unknown) => { setError(cause instanceof Error ? cause.message : props.t('notice.attachFailed')) })
  }
  const edit = (image: ComfyImageReference): void => { setSource(image); setPrompt('') }
  const remove = async (operation: () => Promise<unknown>): Promise<boolean> => {
    try { await operation(); setRefresh(value => value + 1); return true }
    catch (cause: unknown) { setError(cause instanceof Error ? cause.message : props.t('notice.failed')); return false }
  }
  const reveal = props.reveal === undefined || !canCreate ? undefined : (image: ComfyImageReference): void => {
    setError(undefined)
    void props.reveal?.(image).catch((cause: unknown) => { setError(cause instanceof Error ? cause.message : props.t('notice.revealFailed')) })
  }
  return <div className={css.communityMedia}>
    <div className={css.mediaHeading}><div><h2>{props.t('studio.library')}</h2><p>{props.t('studio.mediaHint')}</p></div>
      <div className={css.mediaHeadingActions}>
        {folder !== undefined && folder !== '' && <Button size="sm" variant="outline" disabled={busy} onClick={() => { void open() }}>{props.t('gallery.openFolder')}</Button>}
        {selectionButton}
      </div>
    </div>
    <p className={css.mediaFolder} title={folder ?? ''}>{folder === undefined ? '' : folder === '' ? props.t('gallery.folderUnset') : folder}</p>
    <div className={css.mediaCollections}>
      <Button size="sm" variant="ghost" aria-pressed={collection === 'library'} onClick={() => { setCollection('library'); anchor.current = undefined }}>{props.t('gallery.library')}</Button>
      <Button size="sm" variant="ghost" aria-pressed={collection === 'recent'} onClick={() => { setCollection('recent'); anchor.current = undefined }}>{props.t('gallery.recent')}</Button>
    </div>
    <input className={css.mediaSearch} type="search" value={query} aria-label={props.t('studio.search')}
      placeholder={props.t('studio.searchHint')} onChange={(event) => { setQuery(event.target.value); anchor.current = undefined }} />
    <div className={css.mediaFilters}>{(['all', 'images', 'videos'] as const).map(value =>
      <Button key={value} size="sm" variant="ghost" aria-pressed={kind === value}
        onClick={() => { setKind(value); anchor.current = undefined }}>{props.t(`studio.${value}`)}</Button>)}</div>
    {error !== undefined && <p role="alert" className={css.roomError}>{error}</p>}
    {folder === '' && props.saveOutputFolder !== undefined && <section className={css.folderCta} aria-label={props.t('gallery.chooseFolder')}>
      <h3>{props.t('gallery.chooseFolder')}</h3>
      <p>{props.t('gallery.chooseFolderHint')}</p>
      {suggestion !== undefined && <p className={css.folderSuggestion}>
        <span>{props.t('connection.folderDetected', { path: suggestion.path, count: suggestion.files })}</span>
      </p>}
      <div className={css.confirmActions}>
        <Button disabled={busy} onClick={() => { void choose() }}>{props.t('connection.folderBrowse')}</Button>
        {suggestion !== undefined && <Button variant="outline" disabled={busy} onClick={() => { void adoptFolder(suggestion.path) }}>{props.t('connection.folderUseDetected')}</Button>}
      </div>
    </section>}
    {selecting && <div className={css.selectionBar}>
      <span>{props.t('selection.count', { count: chosen.length })}</span>
      {props.addMedia !== undefined && <Button disabled={!canCreate || busy || chosen.length === 0} onClick={() => {
        setBusy(true)
        void props.addMedia?.(chosen).catch((cause: unknown) => { setError(cause instanceof Error ? cause.message : props.t('notice.attachFailed')) }).finally(() => { setBusy(false) })
      }}>{props.t('action.addToChat')}</Button>}
      <Button disabled={busy} onClick={() => { setSelected(visibleMedia.slice(0, 100).map(key)) }}>{props.t('selection.selectLoaded')}</Button>
      <Button disabled={busy || chosen.length === 0} onClick={() => { setSelected([]) }}>{props.t('selection.clear')}</Button>
      <Button disabled={busy || chosen.length === 0} onClick={() => { void download() }}>{props.t('selection.download')}</Button>
      <Button disabled={busy || chosen.length === 0} onClick={() => { setConfirmDelete(true) }}>{props.t('selection.delete')}</Button>
      {busy && <span role="status">{props.t('connection.pending')}</span>}
    </div>}
    {visibleMedia.length === 0 && (query !== '' || kind !== 'all') && <p className={css.empty} role="status">{props.t('studio.noMatches')}</p>}
    <section className={css.gallery} aria-label={props.t('gallery.recent')} hidden={collection !== 'recent'}>
      {runs.length === 0 && <p className={css.empty}>{props.t('gallery.empty')}</p>}
      <div className={css.grid}>{runs.flatMap(run => run.images.filter(image => matches(image, run.prompt)).map(image => <ImageCard
        key={`${run.promptId}:${image.subfolder}:${image.filename}`} generation={run} image={image}
        deleting={busy} load={props.image} onEdit={canCreate ? edit : undefined}
        onAttach={canCreate && props.addMedia !== undefined ? attach : undefined}
        onReveal={reveal === undefined ? undefined : () => { reveal(image) }}
        onFrame={canCreate && props.addFiles !== undefined ? async (file) => { await props.addFiles?.([file]) } : undefined} t={props.t}
        selecting={selecting} selected={selected.includes(key(image))} onSelect={(shift) => { toggle(image, shift) }}
        onDelete={() => remove(() => props.remove(run.promptId))} />))}</div>
    </section>
    {folder !== '' && <section className={css.gallery} aria-label={props.t('gallery.library')} hidden={collection !== 'library'}>
      {library.images.length === 0 && <p className={css.empty}>{props.t('gallery.emptyLibrary')}</p>}
      <div className={css.grid}>{library.images.filter(stored => matches(stored.image)).map(stored => <ImageCard
        key={`${stored.image.subfolder}:${stored.image.filename}`} image={stored.image} stored={stored}
        deleting={busy} load={props.image} onEdit={canCreate ? edit : undefined}
        onAttach={canCreate && props.addMedia !== undefined ? attach : undefined}
        onReveal={reveal === undefined ? undefined : () => { reveal(stored.image) }}
        onFrame={canCreate && props.addFiles !== undefined ? async (file) => { await props.addFiles?.([file]) } : undefined} t={props.t}
        selecting={selecting} selected={selected.includes(key(stored.image))} onSelect={(shift) => { toggle(stored.image, shift) }}
        onDelete={() => remove(() => props.removeImage(stored.image))} />)}</div>
      {library.images.length < library.total && <Button onClick={() => {
        void props.library(library.images.length).then((page) => {
          setLibrary(current => ({ ...page, images: [...current.images, ...page.images] }))
        })
          .catch((cause: unknown) => { setError(cause instanceof Error ? cause.message : props.t('notice.failed')) })
      }}>{props.t('gallery.loadMore')}</Button>}
    </section>}
    <Modal open={confirmDelete} title={props.t('selection.confirmTitle', { count: chosen.length })}
      description={props.t('selection.confirmDescription', { count: chosen.length })} closeLabel={props.t('delete.close')}
      onClose={() => { if (!busy) setConfirmDelete(false) }} footer={<>
        <Button disabled={busy} onClick={() => { setConfirmDelete(false) }}>{props.t('delete.cancel')}</Button>
        <Button disabled={busy || chosen.length === 0} onClick={() => { void deleteSelection() }}>{props.t('delete.confirm')}</Button>
      </>} />
    <Modal open={source !== undefined} title={props.t('composer.editTitle')} closeLabel={props.t('delete.close')}
      onClose={() => { if (!busy) setSource(undefined) }} footer={<Button disabled={!canCreate || busy || prompt.trim() === ''} onClick={() => {
        if (source === undefined) return
        setBusy(true)
        void props.status().then(status => props.askAgent(prompt, status, source))
          .then(() => { setSource(undefined); setRefresh(value => value + 1) })
          .catch((cause: unknown) => { setError(cause instanceof Error ? cause.message : props.t('notice.failed')) })
          .finally(() => { setBusy(false) })
      }}>{props.t('room.send')}</Button>}>
      <textarea aria-label={props.t('composer.editHint')} placeholder={props.t('composer.editHint')}
        value={prompt} onChange={(event) => { setPrompt(event.target.value) }} disabled={busy} />
    </Modal>
  </div>
}
