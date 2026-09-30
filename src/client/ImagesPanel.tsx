import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  Button,
  IconDownloadOutlineRegular,
  IconRefreshOutlineRegular,
  IconSparkleRegular,
  IconTrashOutlineRegular,
  ImageLightbox,
  Modal,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {
  ComfyGenerateRequest,
  ComfyGeneration,
  ComfyDeleteImagesResult,
  ComfyImageReference,
  ComfyImagesStatus,
  ComfyLibraryPage,
  ComfyStoredImage,
} from '@deepseek-ai/dsh-api-comfyui-controller/types'
import { NS } from './locales.ts'
import css from './ImagesPanel.module.css'

const SIZES = [
  { label: 'composer.sizeSquare', width: 1024, height: 1024 },
  { label: 'composer.sizeLandscape', width: 1216, height: 832 },
  { label: 'composer.sizePortrait', width: 832, height: 1216 },
] as const

const BATCH_LIMIT = 100
const COMFY_MEDIA_ROUTE = 'api/comfyui-media'
const COMFY_ARCHIVE_ROUTE = 'api/comfyui-archive'

function mediaKey(image: ComfyImageReference): string {
  return `${image.subfolder}\0${image.filename}`
}

function mediaUrl(image: ComfyImageReference): string {
  return `${COMFY_MEDIA_ROUTE}?${new URLSearchParams({ filename: image.filename, subfolder: image.subfolder })}`
}

function archiveUrl(images: readonly ComfyImageReference[]): string {
  return `${COMFY_ARCHIVE_ROUTE}?${new URLSearchParams({ files: JSON.stringify(images) })}`
}

function isVideo(image: ComfyImageReference): boolean {
  return /\.(mp4|webm|mov|mkv)$/iu.test(image.filename)
}

interface Draft {
  readonly prompt: string
  readonly negativePrompt: string
  readonly model: string
  readonly workflow: string
  readonly width: number
  readonly height: number
  readonly steps: number
  readonly cfg: number
  readonly seed: string
  readonly batchSize: number
  readonly sourceImage: ComfyImageReference | null
  readonly denoise: number
}

const EMPTY_DRAFT: Draft = {
  prompt: '', negativePrompt: '', model: '', workflow: '', width: 1024, height: 1024,
  steps: 24, cfg: 7, seed: '', batchSize: 1,
  sourceImage: null, denoise: 0.55,
}

export interface ImagesInjected {
  readonly status: () => Promise<ComfyImagesStatus>
  readonly history: () => Promise<readonly ComfyGeneration[]>
  readonly library: (offset: number) => Promise<ComfyLibraryPage>
  readonly generate: (request: ComfyGenerateRequest) => Promise<{ readonly promptId: string; readonly seed: number }>
  readonly cancel: (promptId: string) => Promise<void>
  readonly remove: (promptId: string) => Promise<void>
  readonly removeImage: (image: ComfyImageReference) => Promise<void>
  readonly removeImages: (images: readonly ComfyImageReference[]) => Promise<ComfyDeleteImagesResult>
  readonly image: (image: ComfyImageReference) => Promise<string>
}

export type ImagesPanelProps = PropsRuntime<'main'> & InjectFace<ImagesInjected> & PropsLocale<typeof NS>

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

function ImageCard({ generation, stored, image, deleting, selecting, selected, onSelect, load, onDelete, onReuse, onEdit, t }: {
  readonly generation?: ComfyGeneration
  readonly stored?: ComfyStoredImage
  readonly image: ComfyImageReference
  readonly deleting: boolean
  readonly selecting?: boolean
  readonly selected?: boolean
  readonly onSelect?: (shift: boolean) => void
  readonly load: ImagesInjected['image']
  readonly onDelete: () => Promise<boolean>
  readonly onReuse?: (generation: ComfyGeneration) => void
  readonly onEdit: (image: ComfyImageReference, generation: ComfyGeneration | undefined, src: string) => void
  readonly t: ImagesPanelProps['t']
}): ReactNode {
  const [remoteSrc, setRemoteSrc] = useState<string>()
  const [failed, setFailed] = useState(false)
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [visible, setVisible] = useState(false)
  const cardRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const card = cardRef.current
    if (card === null) return undefined
    if (!('IntersectionObserver' in window)) { setVisible(true); return undefined }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some(entry => entry.isIntersecting)) { setVisible(true); observer.disconnect() }
    }, { rootMargin: '400px' })
    observer.observe(card)
    return () => { observer.disconnect() }
  }, [])
  useEffect(() => {
    if (!visible || stored !== undefined) return undefined
    const controller = new AbortController()
    void load(image).then((value) => {
      if (!controller.signal.aborted) setRemoteSrc(value)
    }).catch(() => {
      if (!controller.signal.aborted) setFailed(true)
    })
    return () => { controller.abort() }
  }, [image, load, stored, visible])
  const src = stored === undefined ? remoteSrc : visible ? mediaUrl(image) : undefined
  const video = stored !== undefined && isVideo(image)
  return (
    <article ref={cardRef} className={`${css.card} ${selected ? css.cardSelected : ''}`}>
      <div className={css.previewFrame}>
        {video
          ? <video className={css.video} src={src} controls={!selecting} preload="metadata" playsInline />
          : <button
              type="button" className={css.preview} disabled={src === undefined && !selecting}
              aria-label={selecting ? t('selection.toggle', { name: image.filename }) : t('gallery.open', { name: image.filename })}
              onClick={(event) => { if (selecting) onSelect?.(event.shiftKey); else setOpen(true) }}
            >
              {src !== undefined
                ? <img src={src} alt={generation?.prompt ?? image.filename} loading="lazy" onError={() => { setFailed(true) }} />
                : <span className={failed ? css.failed : css.loading}>{failed ? t('gallery.failed') : t('gallery.loading')}</span>}
            </button>}
        {selecting && <button type="button" className={`${css.selectionControl} ${video ? css.videoSelection : ''}`} aria-pressed={selected}
          aria-label={t('selection.toggle', { name: image.filename })}
          onClick={(event) => { onSelect?.(event.shiftKey) }}>
          <span className={css.selectionCheck} aria-hidden="true">{selected ? '✓' : ''}</span>
        </button>}
      </div>
      <div className={css.cardBody}>
        <p className={css.workflow}>{generation === undefined ? t(video ? 'gallery.localVideo' : 'gallery.localFile') : t('gallery.workflow', { workflow: generation.workflowLabel })}</p>
        <p className={css.prompt}>{generation?.prompt ?? image.filename}</p>
        <p className={css.meta}>{generation === undefined
          ? t('gallery.fileMeta', { date: new Date(stored?.modifiedAt ?? 0).toLocaleDateString(), size: Math.round((stored?.bytes ?? 0) / 1024) })
          : t('gallery.runMeta', { width: generation.width, height: generation.height, steps: generation.steps, seed: generation.seed })}</p>
        {!selecting && <div className={css.cardActions}>
          {generation !== undefined && onReuse !== undefined && <Button size="sm" onClick={() => { onReuse(generation) }}>{t('action.reuse')}</Button>}
          {src !== undefined && !video && <Button size="sm" onClick={() => { onEdit(image, generation, src) }}>{t('action.editImage')}</Button>}
          {src !== undefined && (
            <a className={css.download} href={stored === undefined ? src : mediaUrl(image)} download={image.filename}>
              <IconDownloadOutlineRegular size={14} />{t('action.download')}
            </a>
          )}
          <Button className={css.deleteButton} size="sm" disabled={deleting} onClick={() => { setConfirming(true) }}>
            <IconTrashOutlineRegular size={14} />{t(deleting ? 'delete.pending' : 'action.delete')}
          </Button>
        </div>}
      </div>
      {open && src !== undefined && !video && (
        <ImageLightbox
          src={src}
          alt={generation?.prompt ?? image.filename}
          labels={{ dialog: t('gallery.open', { name: image.filename }), close: t('gallery.close') }}
          onClose={() => { setOpen(false) }}
        />
      )}
      <Modal
        open={confirming}
        title={t('delete.title')}
        description={t(generation === undefined ? 'delete.fileDescription' : 'delete.description')}
        closeLabel={t('delete.close')}
        onClose={() => { if (!deleting) setConfirming(false) }}
        footer={<div className={css.confirmActions}>
          <Button variant="outline" disabled={deleting} onClick={() => { setConfirming(false) }}>{t('delete.cancel')}</Button>
          <Button className={css.deleteButton} disabled={deleting} onClick={() => {
            void onDelete().then((deleted) => { if (deleted) setConfirming(false) })
          }}>
            <IconTrashOutlineRegular size={14} />{t(deleting ? 'delete.pending' : 'delete.confirm')}
          </Button>
        </div>}
      />
    </article>
  )
}

/** Full-page local ComfyUI image generator. */
export function ImagesPanel({
  status: readStatus,
  history: readHistory,
  library: readLibrary,
  generate: requestGeneration,
  cancel: cancelGeneration,
  remove: removeGeneration,
  removeImage,
  removeImages,
  image: readImage,
  t,
}: ImagesPanelProps): ReactNode {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [status, setStatus] = useState<ComfyImagesStatus>()
  const [history, setHistory] = useState<readonly ComfyGeneration[]>([])
  const [library, setLibrary] = useState<ComfyLibraryPage>({ images: [], total: 0 })
  const [libraryLoading, setLibraryLoading] = useState(false)
  const [galleryView, setGalleryView] = useState<'library' | 'recent'>('library')
  const [sourcePreview, setSourcePreview] = useState<string>()
  const [pending, setPending] = useState<readonly string[]>([])
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [deleting, setDeleting] = useState<readonly string[]>([])
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState<readonly string[]>([])
  const [selectionError, setSelectionError] = useState<string>()
  const [bulkBusy, setBulkBusy] = useState(false)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const selectionAnchor = useRef<number | null>(null)

  const refresh = useCallback(async (): Promise<void> => {
    try {
      const [nextStatus, nextHistory] = await Promise.all([readStatus(), readHistory()])
      setStatus(nextStatus)
      setHistory(nextHistory)
      const settled = new Set(nextHistory.map(item => item.promptId))
      setPending(current => current.filter(id => !settled.has(id)))
      setDraft((current) => {
        const model = nextStatus.models[0]
        const currentWorkflow = nextStatus.workflows.find(workflow => workflow.id === current.workflow && workflow.available)
        const workflow = currentWorkflow ?? nextStatus.workflows.find(item => item.available)
        return {
          ...current,
          model: workflow?.source === 'saved' ? workflow.modelId ?? ''
            : nextStatus.models.some(item => item.id === current.model) ? current.model : model?.id ?? '',
          workflow: workflow?.id ?? '',
          prompt: currentWorkflow === undefined ? workflow?.starterPrompt ?? current.prompt : current.prompt,
          width: currentWorkflow === undefined ? workflow?.width ?? current.width : current.width,
          height: currentWorkflow === undefined ? workflow?.height ?? current.height : current.height,
          batchSize: currentWorkflow === undefined ? workflow?.batchSize ?? current.batchSize : current.batchSize,
          steps: currentWorkflow === undefined ? workflow?.recommendedSteps ?? current.steps : current.steps,
          cfg: currentWorkflow === undefined ? workflow?.recommendedCfg ?? current.cfg : current.cfg,
        }
      })
      setError(undefined)
    } catch (reason) {
      setError(errorMessage(reason, t('notice.failed')))
    }
  }, [readHistory, readStatus, t])

  useEffect(() => { void refresh() }, [refresh])
  const refreshLibrary = useCallback(async (): Promise<void> => {
    setLibraryLoading(true)
    try {
      setLibrary(await readLibrary(0))
    } catch (reason) {
      setError(errorMessage(reason, t('notice.failed')))
    } finally {
      setLibraryLoading(false)
    }
  }, [readLibrary, t])
  useEffect(() => { if (status?.libraryAvailable === true) void refreshLibrary() }, [status?.libraryAvailable, refreshLibrary])
  useEffect(() => {
    if (pending.length === 0) return undefined
    const timer = window.setInterval(() => { void refresh() }, 1_500)
    return () => { window.clearInterval(timer) }
  }, [pending.length, refresh])

  const set = <K extends keyof Draft>(key: K, value: Draft[K]): void => {
    setDraft(current => ({ ...current, [key]: value }))
  }
  const selectedSize = `${draft.width}x${draft.height}`
  const customSize = !SIZES.some(size => `${size.width}x${size.height}` === selectedSize)
  const selectedWorkflow = status?.workflows.find(workflow => workflow.id === draft.workflow)
  const canGenerate = status?.reachable === true && selectedWorkflow?.available === true && draft.prompt.trim() !== '' && !busy
  const selectedModel = status?.models.find(model => model.id === (selectedWorkflow?.source === 'saved' ? selectedWorkflow.modelId : draft.model))
  const selectedSet = new Set(selectedKeys)
  const selectedMedia = library.images.filter(item => selectedSet.has(mediaKey(item.image))).map(item => item.image)

  const toggleSelection = (index: number, shift: boolean): void => {
    const key = mediaKey(library.images[index]!.image)
    if (selectedKeys.length >= BATCH_LIMIT && !selectedSet.has(key) && !shift) {
      setSelectionError(t('selection.limit'))
      return
    }
    setSelectionError(undefined)
    setSelectedKeys(current => {
      const next = new Set(current)
      if (shift && selectionAnchor.current !== null) {
        const first = Math.min(index, selectionAnchor.current)
        const last = Math.max(index, selectionAnchor.current)
        for (const item of library.images.slice(first, last + 1)) {
          if (next.size >= BATCH_LIMIT) break
          next.add(mediaKey(item.image))
        }
      } else if (next.has(key)) next.delete(key)
      else if (next.size < BATCH_LIMIT) next.add(key)
      return [...next]
    })
    selectionAnchor.current = index
  }

  const downloadSelected = async (): Promise<void> => {
    if (selectedMedia.length === 0) return
    setBulkBusy(true)
    setSelectionError(undefined)
    try {
      const url = archiveUrl(selectedMedia)
      const response = await fetch(url, { method: 'HEAD' })
      if (!response.ok) throw new Error(await response.text())
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'aryaai-media.zip'
      anchor.click()
    } catch (reason) {
      setSelectionError(errorMessage(reason, t('notice.failed')))
    } finally {
      setBulkBusy(false)
    }
  }

  const deleteSelected = async (): Promise<void> => {
    if (selectedMedia.length === 0) return
    setBulkBusy(true)
    setSelectionError(undefined)
    try {
      const result = await removeImages(selectedMedia)
      const deletedKeys = new Set(result.deleted.map(mediaKey))
      setLibrary(current => ({
        images: current.images.filter(item => !deletedKeys.has(mediaKey(item.image))),
        total: current.total - result.deleted.length,
      }))
      setSelectedKeys(current => current.filter(key => !deletedKeys.has(key)))
      setBulkDeleteOpen(false)
      if (result.failed.length > 0) setSelectionError(t('selection.deleteFailed', { count: result.failed.length }))
    } catch (reason) {
      setSelectionError(errorMessage(reason, t('notice.failed')))
    } finally {
      setBulkBusy(false)
    }
  }

  const generate = async (): Promise<void> => {
    setBusy(true)
    setError(undefined)
    try {
      const receipt = await requestGeneration({
        prompt: draft.prompt,
        negativePrompt: draft.negativePrompt,
        model: draft.model || null,
        workflow: draft.workflow || null,
        width: draft.width,
        height: draft.height,
        steps: draft.steps,
        cfg: draft.cfg,
        seed: draft.seed.trim() === '' ? null : Number(draft.seed),
        batchSize: draft.batchSize,
        sourceImage: draft.sourceImage,
        denoise: draft.denoise,
      })
      setPending(current => [...current, receipt.promptId])
      setDraft(current => ({ ...current, seed: String(receipt.seed) }))
    } catch (reason) {
      setError(errorMessage(reason, t('notice.failed')))
    } finally {
      setBusy(false)
    }
  }

  const reuse = (generation: ComfyGeneration): void => {
    setDraft({
      prompt: generation.prompt,
      negativePrompt: generation.negativePrompt,
      model: generation.model,
      workflow: status?.workflows.some(workflow => workflow.id === generation.workflow && workflow.available)
        ? generation.workflow ?? draft.workflow
        : draft.workflow,
      width: generation.width,
      height: generation.height,
      steps: generation.steps,
      cfg: generation.cfg,
      seed: String(generation.seed),
      batchSize: 1,
      sourceImage: null,
      denoise: 0.55,
    })
    setSourcePreview(undefined)
    document.querySelector<HTMLElement>('[data-images-composer]')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const editImage = (image: ComfyImageReference, generation: ComfyGeneration | undefined, src: string): void => {
    if (generation !== undefined) reuse(generation)
    setDraft(current => ({ ...current, sourceImage: image, batchSize: 1, seed: '' }))
    setSourcePreview(src)
    document.querySelector<HTMLElement>('[data-images-composer]')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const remove = async (generation: ComfyGeneration): Promise<boolean> => {
    setDeleting(current => [...current, generation.promptId])
    setError(undefined)
    try {
      await removeGeneration(generation.promptId)
      setHistory(current => current.filter(item => item.promptId !== generation.promptId))
      return true
    } catch (reason) {
      setError(errorMessage(reason, t('notice.failed')))
      return false
    } finally {
      setDeleting(current => current.filter(id => id !== generation.promptId))
    }
  }

  const deleteLocalImage = async (image: ComfyImageReference): Promise<boolean> => {
    setDeleting(current => [...current, image.filename])
    try {
      await removeImage(image)
      const key = mediaKey(image)
      setLibrary(current => ({ images: current.images.filter(item => mediaKey(item.image) !== key), total: current.total - 1 }))
      setSelectedKeys(current => current.filter(item => item !== key))
      return true
    } catch (reason) {
      setError(errorMessage(reason, t('notice.failed')))
      return false
    } finally {
      setDeleting(current => current.filter(id => id !== image.filename))
    }
  }

  const loadMore = async (): Promise<void> => {
    setLibraryLoading(true)
    try {
      const page = await readLibrary(library.images.length)
      setLibrary(current => ({ images: [...current.images, ...page.images], total: page.total }))
    } catch (reason) {
      setError(errorMessage(reason, t('notice.failed')))
    } finally {
      setLibraryLoading(false)
    }
  }

  return (
    <main className={css.panel}>
      <header className={css.header}>
        <div>
          <h1>{t('page.title')}</h1>
          <p className={status?.reachable === true ? css.connected : css.offline}>
            {status?.reachable === true ? t('status.connected') : t('status.offline')}
          </p>
        </div>
        <div className={css.headerActions}>
          {status?.baseUrl !== undefined && <a className={css.openComfy} href={status.baseUrl} target="_blank" rel="noreferrer">{t('action.openComfy')}</a>}
          <Button size="sm" onClick={() => { void refresh() }}><IconRefreshOutlineRegular size={14} />{t('action.refresh')}</Button>
        </div>
      </header>

      <section className={css.composer} data-images-composer>
        <div className={css.composerHead}>
          <div>
            <h2>{t('composer.title')}</h2>
            <p>{t('composer.hint')}</p>
          </div>
          {selectedWorkflow !== undefined && <span>{selectedWorkflow.label}</span>}
        </div>
        <textarea
          className={css.promptInput}
          value={draft.prompt}
          aria-label={t('composer.placeholder')}
          placeholder={t('composer.placeholder')}
          onChange={(event) => { set('prompt', event.target.value) }}
        />
        {draft.sourceImage !== null && (
          <div className={css.sourceImage}>
            {sourcePreview !== undefined && <img src={sourcePreview} alt={draft.sourceImage.filename} />}
            <div>
              <strong>{t('composer.sourceImage')}</strong>
              <span>{draft.sourceImage.filename}</span>
            </div>
            <Button size="sm" onClick={() => { set('sourceImage', null); setSourcePreview(undefined) }}>{t('action.clearSource')}</Button>
          </div>
        )}
        <input
          className={css.negativeInput}
          value={draft.negativePrompt}
          aria-label={t('composer.negative')}
          placeholder={selectedWorkflow?.supportsNegativePrompt === false ? t('composer.negativeUnsupported') : t('composer.negative')}
          disabled={selectedWorkflow?.supportsNegativePrompt === false}
          onChange={(event) => { set('negativePrompt', event.target.value) }}
        />
        <div className={css.controls}>
          <label>{t('composer.workflow')}
            <select value={draft.workflow} onChange={(event) => {
              const workflow = status?.workflows.find(item => item.id === event.target.value)
              if (workflow?.available === true) {
                setDraft(current => ({
                  ...current, workflow: workflow.id, prompt: workflow.starterPrompt,
                  model: workflow.source === 'saved' ? workflow.modelId ?? current.model : current.model,
                  width: workflow.width, height: workflow.height,
                  batchSize: current.sourceImage === null ? workflow.batchSize : 1,
                  steps: workflow.recommendedSteps, cfg: workflow.recommendedCfg,
                }))
              }
            }}>
              {status?.workflows.map(workflow => (
                <option key={workflow.id} value={workflow.id} disabled={!workflow.available}>
                  {workflow.label}{workflow.available ? '' : ` · ${workflow.unavailableReason ?? t('status.unavailable')}`}
                </option>
              ))}
            </select>
          </label>
          {status !== undefined && status.models.length > 1 && selectedWorkflow?.source === 'built-in' && (
            <label>{t('composer.model')}
              <select value={draft.model} onChange={(event) => {
                const model = status.models.find(item => item.id === event.target.value)
                if (model !== undefined) {
                  setDraft(current => ({ ...current, model: model.id, steps: model.recommendedSteps, cfg: model.recommendedCfg }))
                }
              }}>
                {status.models.map(model => <option key={model.id} value={model.id}>{model.label}</option>)}
              </select>
            </label>
          )}
          {draft.sourceImage === null ? <label>{t('composer.size')}
            <select value={selectedSize} onChange={(event) => {
              const size = SIZES.find(item => `${item.width}x${item.height}` === event.target.value)
              if (size !== undefined) setDraft(current => ({ ...current, width: size.width, height: size.height }))
            }}>
              {customSize && <option value={selectedSize}>{draft.width} × {draft.height}</option>}
              {SIZES.map(size => <option key={size.label} value={`${size.width}x${size.height}`}>{t(size.label)}</option>)}
            </select>
          </label> : <label>{t('composer.size')}<span className={css.readonlyValue}>{t('composer.sourceSize')}</span></label>}
          <label>{t('composer.steps')}<input type="number" min={1} max={150} value={draft.steps} onChange={(event) => { set('steps', Number(event.target.value)) }} /></label>
          <label>{t('composer.cfg')}<input type="number" min={0} max={30} step={0.5} value={draft.cfg} onChange={(event) => { set('cfg', Number(event.target.value)) }} /></label>
          <label>{t('composer.seed')}<input inputMode="numeric" value={draft.seed} placeholder={t('composer.random')} onChange={(event) => { set('seed', event.target.value) }} /></label>
          {draft.sourceImage === null && <label>{t('composer.batch')}<input type="number" min={1} max={8} value={draft.batchSize} onChange={(event) => { set('batchSize', Number(event.target.value)) }} /></label>}
          {draft.sourceImage !== null && <label>{t('composer.denoise')}
            <input type="number" min={0.05} max={1} step={0.05} value={draft.denoise}
              onChange={(event) => { set('denoise', Number(event.target.value)) }} />
          </label>}
          <Button variant="primary" disabled={!canGenerate} onClick={() => { void generate() }}>
            <IconSparkleRegular size={16} />{busy ? t('composer.generating') : t('composer.generate')}
          </Button>
        </div>
        {status?.reachable === true && selectedWorkflow !== undefined && (
          <p className={css.modelSummary}>{t('composer.usingWorkflow', { workflow: selectedWorkflow.label, model: selectedModel?.label ?? '' })}</p>
        )}
        {status?.reachable === true && !status.workflows.some(workflow => workflow.available) && <p className={css.notice}>{t('status.noModels')}</p>}
        {error !== undefined && <p className={css.error} role="alert">{error}</p>}
      </section>

      {pending.map(promptId => (
        <section className={css.pending} key={promptId}>
          <span className={css.pendingArt}><IconSparkleRegular size={24} /></span>
          <span>{t('pending.title')}</span>
          <Button size="sm" onClick={() => { void cancelGeneration(promptId).then(() => {
            setPending(current => current.filter(id => id !== promptId))
          }).catch((reason: unknown) => { setError(errorMessage(reason, t('notice.failed'))) }) }}>{t('action.cancel')}</Button>
        </section>
      ))}

      <section className={css.gallery}>
        <div className={css.galleryHeader}>
          <div>
            <h2>{t('gallery.title')}</h2>
            <p>{t('gallery.count', { count: library.total })}</p>
          </div>
          <div className={css.galleryHeaderActions}>
            {galleryView === 'library' && library.images.length > 0 && <Button size="sm" onClick={() => {
              setSelectionMode(current => !current)
              setSelectedKeys([])
              setSelectionError(undefined)
              selectionAnchor.current = null
            }}>{t(selectionMode ? 'selection.done' : 'selection.start')}</Button>}
            <div className={css.galleryTabs} role="tablist" aria-label={t('gallery.title')}>
              <Button size="sm" aria-selected={galleryView === 'library'} role="tab" onClick={() => { setGalleryView('library') }}>{t('gallery.library')}</Button>
              <Button size="sm" aria-selected={galleryView === 'recent'} role="tab" onClick={() => { setGalleryView('recent'); setSelectionMode(false); setSelectedKeys([]) }}>{t('gallery.recent')}</Button>
            </div>
          </div>
        </div>
        {galleryView === 'library' && selectionMode && <div className={css.selectionBar}>
          <strong>{t('selection.count', { count: selectedMedia.length })}</strong>
          <span>{t('selection.hint')}</span>
          <Button size="sm" disabled={bulkBusy} onClick={() => {
            setSelectedKeys(library.images.slice(0, BATCH_LIMIT).map(item => mediaKey(item.image)))
            setSelectionError(library.images.length > BATCH_LIMIT ? t('selection.limit') : undefined)
          }}>{t('selection.selectLoaded')}</Button>
          <Button size="sm" disabled={bulkBusy || selectedMedia.length === 0} onClick={() => { setSelectedKeys([]); selectionAnchor.current = null }}>{t('selection.clear')}</Button>
          <Button size="sm" disabled={bulkBusy || selectedMedia.length === 0} onClick={() => { void downloadSelected() }}>
            <IconDownloadOutlineRegular size={14} />{t('selection.download')}
          </Button>
          <Button size="sm" className={css.deleteButton} disabled={bulkBusy || selectedMedia.length === 0}
            onClick={() => { setBulkDeleteOpen(true) }}>
            <IconTrashOutlineRegular size={14} />{t('selection.delete')}
          </Button>
        </div>}
        {galleryView === 'library' && selectionError !== undefined && <p className={css.selectionError} role="alert">{selectionError}</p>}
        {galleryView === 'library' ? (
          status?.libraryAvailable !== true
            ? <p className={css.empty}>{t('gallery.unconfigured')}</p>
            : <>
              {library.images.length === 0 && <p className={css.empty}>{libraryLoading ? t('gallery.loading') : t('gallery.emptyLibrary')}</p>}
              <div className={css.grid}>{library.images.map((stored, index) => (
                <ImageCard key={`${stored.image.subfolder}:${stored.image.filename}`} stored={stored} image={stored.image}
                  deleting={deleting.includes(stored.image.filename)} load={readImage}
                  selecting={selectionMode} selected={selectedSet.has(mediaKey(stored.image))}
                  onSelect={shift => { toggleSelection(index, shift) }}
                  onDelete={() => deleteLocalImage(stored.image)} onEdit={editImage} t={t} />
              ))}</div>
              {library.images.length < library.total && <Button size="sm" disabled={libraryLoading} onClick={() => { void loadMore() }}>{t('gallery.loadMore')}</Button>}
            </>
        ) : history.length === 0 && pending.length === 0
          ? <p className={css.empty}>{t('gallery.empty')}</p>
          : <div className={css.grid}>{history.flatMap(generation => generation.images.map(image => (
            <ImageCard
              key={`${generation.promptId}:${image.subfolder}:${image.filename}`}
              generation={generation}
              image={image}
              deleting={deleting.includes(generation.promptId)}
              load={readImage}
              onDelete={() => remove(generation)}
              onReuse={reuse}
              onEdit={editImage}
              t={t}
            />
          )))}</div>}
      </section>
      <Modal open={bulkDeleteOpen} title={t('selection.confirmTitle', { count: selectedMedia.length })}
        description={t('selection.confirmDescription', { count: selectedMedia.length })}
        closeLabel={t('delete.close')} onClose={() => { if (!bulkBusy) setBulkDeleteOpen(false) }}
        footer={<div className={css.confirmActions}>
          <Button variant="outline" disabled={bulkBusy} onClick={() => { setBulkDeleteOpen(false) }}>{t('delete.cancel')}</Button>
          <Button className={css.deleteButton} disabled={bulkBusy} onClick={() => { void deleteSelected() }}>
            <IconTrashOutlineRegular size={14} />{t(bulkBusy ? 'delete.pending' : 'selection.confirmDelete')}
          </Button>
        </div>} />
    </main>
  )
}
