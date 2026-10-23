import type { ImagePromptActivityProps } from './index.ts'
import type { SessionReference } from '@deepseek-ai/dsh-api-session-controller/client'
import type { SessionId } from '@deepseek-ai/dsh-api-remotes/client'
import type { PromptContentPart } from '@deepseek-ai/dsh-api-session-controller/types'
import type { ImageRoomState } from './room-state.ts'
import { isStillMediaType } from './media.ts'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store'
import {
  Button,
  IconArchiveOutlineRegular,
  IconUnarchiveOutlineRegular,
  IconDownloadOutlineRegular,
  IconMicrophoneOutlineRegular,
  Tooltip,
  IconRefreshOutlineRegular,
  IconLinkOutlineRegular,
  IconSparkleRegular,
  IconPlusOutlineRegular,
  IconSendOutlineRegular,
  IconTrashOutlineRegular,
  ImageLightbox,
  Modal,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { InjectFace, PropsLocale, PropsRenderSlots } from '@deepseek-ai/dsh-client-ui-slots'
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
import { Starters } from './Starters.tsx'
import { classifyWorkflow, describeCapability } from './routing.ts'
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
  /** Fill an empty Content composer with an editable idea; never submit or replace an existing draft. */
  readonly fillDraft?: (text: string) => Promise<void>
  /** Whether the profile's community image bundle is enabled without a load error. */
  readonly imagePlugin: () => Promise<boolean>
  /** Add selected gallery media to the active composer without submitting. */
  readonly addMedia?: (media: readonly ComfyImageReference[]) => Promise<void>
  /** Add dropped files or a captured video frame to the active composer. */
  readonly addFiles?: (files: readonly File[]) => Promise<void>
  /** Open community plugin installation and configuration in the existing manager. */
  readonly openImagePlugin: () => void
  /** Whether the conversation interface is enabled in this deployment. */
  readonly autoPreview: ObservableSnapshot<boolean>
  /** Restore the Images-owned conversation without changing the main chat. */
  /** Release replaced references after React has committed the new conversation. */
  readonly settleAgent?: (reference: SessionReference | undefined) => void
  readonly currentAgent: () => SessionReference | undefined
  /** Browser-local room navigation; messages remain in durable Host sessions. */
  readonly rooms: ObservableSnapshot<ImageRoomState>
  /** Open an existing Images conversation without navigating the main chat. */
  readonly openRoom: (id: SessionId) => Promise<SessionReference>
  /** Resolve a room's latest catalog title. */
  readonly roomTitle: (id: SessionId) => string
  /** Archive or restore a durable conversation through the Host registry. */
  readonly archiveRoom?: (id: SessionId, archived: boolean) => Promise<void>
  /** Release this conversation view; its durable session remains in the catalog. */
  readonly resetAgent: () => Promise<SessionReference>
  /** Download a room's session log and its generated media as an archive. Resolves
   * false when this deployment ships no export provider, which the panel reports
   * rather than offering an action that cannot complete. */
  readonly exportRoom: (id: SessionId) => Promise<boolean>
  /** Submit a logged request with the current ComfyUI catalog and source image. */
  readonly askAgent: (prompt: string, status: ComfyImagesStatus, source: ComfyImageReference | null, uploads?: readonly Extract<PromptContentPart, { type: 'image' }>[]) => Promise<SessionReference>
  /** Open voice setup without recording or downloading models. */
  readonly openVoiceSettings: () => void
  readonly status: () => Promise<ComfyImagesStatus>
  readonly history: () => Promise<readonly ComfyGeneration[]>
  readonly library: (offset: number) => Promise<ComfyLibraryPage>
  readonly generate: (request: ComfyGenerateRequest) => Promise<{ readonly promptId: string; readonly seed: number }>
  readonly cancel: (promptId: string) => Promise<void>
  readonly remove: (promptId: string) => Promise<void>
  readonly removeImage: (image: ComfyImageReference) => Promise<void>
  readonly removeImages: (images: readonly ComfyImageReference[]) => Promise<ComfyDeleteImagesResult>
  readonly image: (image: ComfyImageReference) => Promise<string>
  /** Current ComfyUI output folder, or an empty string when the library is unconfigured. */
  readonly readOutputFolder?: () => Promise<string>
  /** Save the folder the ComfyUI controller lists saved media from. */
  readonly saveOutputFolder?: (directory: string) => Promise<void>
  /** Select one saved file in the host file manager. */
  readonly reveal?: (image: ComfyImageReference) => Promise<void>
}

export type ImagesPanelProps = PropsRenderSlots<'images.prompt.activity' | 'images.agent' | 'images.agent.controls' | 'images.connection'> & InjectFace<ImagesInjected> & PropsLocale<typeof NS>

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

/** Render saved or generated media with preview, download, edit, and delete actions.
 * @param props - Media metadata, loader, actions, and localized labels.
 * @returns A media card.
 */
export function ImageCard({
  generation, stored, image, deleting, selecting, selected, onSelect, load, onDelete, onReuse, onEdit, onAttach, onFrame, onReveal, t,
}: {
  readonly generation?: ComfyGeneration
  readonly stored?: ComfyStoredImage
  readonly image: ComfyImageReference
  readonly deleting: boolean
  readonly selecting?: boolean
  readonly selected?: boolean
  readonly onSelect?: (shift: boolean) => void
  readonly load: ImagesInjected['image']
  readonly onDelete: () => Promise<boolean>
  readonly onFrame?: ((file: File) => Promise<void>) | undefined
  readonly onAttach?: ((image: ComfyImageReference) => void) | undefined
  readonly onReuse?: (generation: ComfyGeneration) => void
  readonly onEdit?: ((image: ComfyImageReference, generation: ComfyGeneration | undefined, src: string) => void) | undefined
  readonly onReveal?: (() => void) | undefined
  readonly t: ImagesPanelProps['t']
}): ReactNode {
  const [remoteSrc, setRemoteSrc] = useState<string>()
  const [failed, setFailed] = useState(false)
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [visible, setVisible] = useState(false)
  const cardRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [frameError, setFrameError] = useState(false)
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
  const video = isVideo(image)
  return (
    <article ref={cardRef} draggable={!selecting} onDragStart={(event) => {
      event.dataTransfer.setData('application/x-arya-media', JSON.stringify(image))
      event.dataTransfer.effectAllowed = 'copy'
    }} className={`${css.card} ${selected ? css.cardSelected : ''}`}>
      <div className={css.previewFrame}>
        {video
          ? src !== undefined && !failed
            ? <video ref={videoRef} className={css.video} src={src} controls={!selecting} preload="metadata" playsInline onError={() => { setFailed(true) }} />
            : <div className={css.preview}><span className={failed ? css.failed : css.loading}>{failed ? t('gallery.failed') : t('gallery.loading')}</span></div>
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
        {frameError && <p role="alert">{t('notice.frameFailed')}</p>}
        <p className={css.workflow}>{generation === undefined ? t(video ? 'gallery.localVideo' : 'gallery.localFile') : t('gallery.workflow', { workflow: generation.workflowLabel })}</p>
        <p className={css.prompt}>{generation?.prompt ?? image.filename}</p>
        <p className={css.meta}>{generation === undefined
          ? t('gallery.fileMeta', { date: new Date(stored?.modifiedAt ?? 0).toLocaleDateString(), size: Math.round((stored?.bytes ?? 0) / 1024) })
          : t('gallery.runMeta', { width: generation.width, height: generation.height, steps: generation.steps, seed: generation.seed })}</p>
        {!selecting && <div className={css.cardActions}>
          {video && onFrame !== undefined && <Button size="sm" onClick={() => {
            const player = videoRef.current
            if (player === null || player.videoWidth === 0) { setFrameError(true); return }
            const canvas = document.createElement('canvas')
            canvas.width = player.videoWidth; canvas.height = player.videoHeight
            try {
              const context = canvas.getContext('2d')
              if (context === null) throw new Error('Canvas unavailable')
              context.drawImage(player, 0, 0)
              canvas.toBlob((blob) => {
                if (blob === null) { setFrameError(true); return }
                void onFrame(new File([blob], image.filename + '-frame.png', { type: 'image/png' }))
                  .then(() => { setFrameError(false) }).catch(() => { setFrameError(true) })
              }, 'image/png')
            } catch (_error) { setFrameError(true) }
          }}>{t('action.useFrame')}</Button>}
          {onAttach !== undefined && <Button size="sm" onClick={() => { onAttach(image) }}>{t('action.addToChat')}</Button>}
          {generation !== undefined && !video && onReuse !== undefined && <Button size="sm" onClick={() => { onReuse(generation) }}>{t('action.reuse')}</Button>}
          {src !== undefined && !video && onEdit !== undefined && <Button size="sm" onClick={() => { onEdit(image, generation, src) }}>{t('action.editImage')}</Button>}
          {onReveal !== undefined && <Button size="sm" variant="outline" onClick={() => { onReveal() }}>{t('action.showInExplorer')}</Button>}
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
  autoPreview,
  renderSlot,
  SessionProvider,
  currentAgent, settleAgent,
  rooms,
  openRoom,
  roomTitle,
  archiveRoom,
  resetAgent,
  exportRoom,
  askAgent,
  openVoiceSettings,
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
  const subscribePreview = useCallback((listener: () => void) => autoPreview.subscribe(listener), [autoPreview])
  const getPreview = useCallback(() => autoPreview.getSnapshot(), [autoPreview])
  const preview = useSyncExternalStore(subscribePreview, getPreview)
  const [requestedAuto, setAuto] = useState(true)
  const auto = preview && requestedAuto
  const [agent, setAgent] = useState<SessionReference | undefined>(currentAgent)
  useEffect(() => { settleAgent?.(agent) }, [agent, settleAgent])
  const [newRoom, setNewRoom] = useState(false)
  const subscribeRooms = useCallback((listener: () => void) => rooms.subscribe(listener), [rooms])
  const getRooms = useCallback(() => rooms.getSnapshot(), [rooms])
  const roomState = useSyncExternalStore(subscribeRooms, getRooms)
  const [uploads, setUploads] = useState<readonly Extract<PromptContentPart, { type: 'image' }>[]>([])
  const [draft, updateDraft] = useState<Draft>(EMPTY_DRAFT)
  const draftRef = useRef(draft), promptRevision = useRef(0)
  const promptRef = useRef<HTMLTextAreaElement>(null)
  const uploadRef = useRef<HTMLInputElement>(null)
  const attachmentEpoch = useRef(0)
  const [uploadReads, setUploadReads] = useState(0)
  useEffect(() => () => { attachmentEpoch.current++ }, [])
  const [dragging, setDragging] = useState(false)
  const [voiceActive, setVoiceActive] = useState(false)
  const setDraft = useCallback((update: Draft | ((current: Draft) => Draft)): void => {
    const next = typeof update === 'function' ? update(draftRef.current) : update
    if (next.prompt !== draftRef.current.prompt) promptRevision.current++
    draftRef.current = next
    updateDraft(next)
  }, [])
  // One tap puts an example in the composer and focuses it. The example is a
  // starting point the user edits, and a suggestion must never send by itself.
  const useStarter = useCallback((text: string): void => {
    setDraft(current => ({ ...current, prompt: text }))
    document.querySelector<HTMLTextAreaElement>('[data-images-composer] textarea')?.focus()
  }, [setDraft])
  const [status, setStatus] = useState<ComfyImagesStatus>()
  const [history, setHistory] = useState<readonly ComfyGeneration[]>([])
  const [library, setLibrary] = useState<ComfyLibraryPage>({ images: [], total: 0 })
  const [libraryLoading, setLibraryLoading] = useState(false)
  const [sourcePreview, setSourcePreview] = useState<string>()
  const [pending, setPending] = useState<readonly string[]>([])
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const busyRef = useRef(busy)
  busyRef.current = busy
  const [deleting, setDeleting] = useState<readonly string[]>([])
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState<readonly string[]>([])
  const [selectionError, setSelectionError] = useState<string>()
  const [bulkBusy, setBulkBusy] = useState(false)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const selectionAnchor = useRef<number | null>(null)
  useEffect(() => {
    if (!auto || agent !== undefined) return undefined
    let disposed = false
    // A blank room is what makes the composer's own controls exist: the model and
    // permission seats are session-scoped, so a panel with no session has no model
    // control to offer — which reads as "you cannot choose a model here". Opening
    // the recorded room when there is one, and starting a blank room when there is
    // not, gives every visit a session to bind them to. `resetAgent` reuses an
    // existing blank room instead of creating another, so this is one session per
    // user rather than one per visit.
    const opening = roomState.active === null ? resetAgent() : openRoom(roomState.active)
    void opening.then((reference) => { if (!disposed) setAgent(reference) })
      .catch((reason: unknown) => { if (!disposed && !(reason instanceof DOMException && reason.name === 'AbortError')) setError(errorMessage(reason, t('notice.failed'))) })
    return () => { disposed = true }
  }, [auto, agent, roomState.active, openRoom, resetAgent, t])

  const loadUploads = async (files: readonly File[]): Promise<void> => {
    if (files.length === 0) return
    setError(undefined)
    if (files.some(file => !isStillMediaType(file.type))) { setError(t('composer.uploadType')); return }
    const epoch = attachmentEpoch.current
    setUploadReads(current => current + 1)
    try {
      const images = await Promise.all(files.map(async (file): Promise<Extract<PromptContentPart, { type: 'image' }>> => {
        const mediaType = file.type
        /* v8 ignore next -- the batch was refused above for any file this check would reject. */
        if (!isStillMediaType(mediaType)) throw new Error(t('composer.uploadType'))
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => { if (typeof reader.result === 'string') resolve(reader.result); else reject(new Error(t('notice.failed'))) }
          reader.onerror = () => { reject(reader.error ?? new Error(t('notice.failed'))) }
          reader.readAsDataURL(file)
        })
        return { type: 'image', mediaType, data: dataUrl.slice(dataUrl.indexOf(',') + 1), name: file.name }
      }))
      if (epoch !== attachmentEpoch.current) return
      setUploads(current => [...current, ...images])
      set('sourceImage', null)
      setSourcePreview(undefined)
    } catch (reason) { if (epoch === attachmentEpoch.current) setError(errorMessage(reason, t('notice.failed'))) }
    finally { setUploadReads(current => current - 1) }
  }

  const refresh = useCallback(async (): Promise<void> => {
    try {
      const nextStatus = await readStatus()
      setStatus(nextStatus)
      const nextHistory = nextStatus.reachable ? await readHistory() : []
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
          prompt: current.prompt,
          width: currentWorkflow === undefined ? workflow?.width ?? current.width : current.width,
          height: currentWorkflow === undefined ? workflow?.height ?? current.height : current.height,
          batchSize: currentWorkflow === undefined ? workflow?.batchSize ?? current.batchSize : current.batchSize,
          steps: currentWorkflow === undefined ? workflow?.recommendedSteps ?? current.steps : current.steps,
          cfg: currentWorkflow === undefined ? workflow?.recommendedCfg ?? current.cfg : current.cfg,
        }
      })
      setError(nextStatus.error ?? undefined)
    } catch (reason) {
      setError(errorMessage(reason, t('notice.failed')))
    }
  }, [readHistory, readStatus, setDraft, t])

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
  const inputActions: ImagePromptActivityProps['inputActions'] = {
    captureInsertion: () => ({ start: promptRef.current?.selectionStart ?? draftRef.current.prompt.length,
      end: promptRef.current?.selectionEnd ?? draftRef.current.prompt.length, draftRev: promptRevision.current }),
    insertText: (text, span) => {
      if (busyRef.current || span.draftRev !== promptRevision.current) return false
      const current = draftRef.current.prompt
      setDraft({ ...draftRef.current, prompt: current.slice(0, span.start) + text + current.slice(span.end) })
      requestAnimationFrame(() => {
        promptRef.current?.focus()
        promptRef.current?.setSelectionRange(span.start + text.length, span.start + text.length)
      })
      return true
    },
  }
  const selectedSize = `${draft.width}x${draft.height}`
  const customSize = !SIZES.some(size => `${size.width}x${size.height}` === selectedSize)
  const selectedWorkflow = status?.workflows.find(workflow => workflow.id === draft.workflow)
  // A post-processing graph encodes no prompt, so demanding one would require input it discards.
  const promptGiven = selectedWorkflow?.takesPrompt === false || draft.prompt.trim() !== ''
  const canGenerate = (auto ? status !== undefined : status?.reachable === true && selectedWorkflow?.available === true) && promptGiven && (auto || selectedWorkflow?.task !== 'edit' || draft.sourceImage !== null) && !busy && !voiceActive && uploadReads === 0
  // The disabled Generate button is otherwise silent about the one requirement a reference
  // workflow has, so name it while that is what is missing.
  const needsReference = !auto && selectedWorkflow?.task === 'edit' && draft.sourceImage === null
  const selectedModel = status?.models.find(model => model.id === (selectedWorkflow?.source === 'saved' ? selectedWorkflow.modelId : draft.model))
  const selectedSet = new Set(selectedKeys)
  const media = [...new Map([
    ...history.flatMap(run => run.images), ...library.images.map(item => item.image),
  ].map(image => [mediaKey(image), image])).values()]
  const selectedMedia = media.filter(image => selectedSet.has(mediaKey(image)))

  const toggleSelection = (index: number, shift: boolean): void => {
    const item = media[index]
    if (item === undefined) return
    const key = mediaKey(item)
    if (selectedKeys.length >= BATCH_LIMIT && !selectedSet.has(key) && !shift) {
      setSelectionError(t('selection.limit'))
      return
    }
    setSelectionError(undefined)
    setSelectedKeys((current) => {
      const next = new Set(current)
      if (shift && selectionAnchor.current !== null) {
        const first = Math.min(index, selectionAnchor.current)
        const last = Math.max(index, selectionAnchor.current)
        for (const item of media.slice(first, last + 1)) {
          if (next.size >= BATCH_LIMIT) break
          next.add(mediaKey(item))
        }
      } else if (next.has(key)) next.delete(key)
      else if (next.size < BATCH_LIMIT) next.add(key)
      return [...next]
    })
    selectionAnchor.current = index
  }

  const downloadSelected = async (): Promise<void> => {
    /* v8 ignore next -- the controls that call this are disabled while the selection is empty. */
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
    /* v8 ignore next -- the controls that call this are disabled while the selection is empty. */
    if (selectedMedia.length === 0) return
    setBulkBusy(true)
    setSelectionError(undefined)
    try {
      if (status?.libraryAvailable !== true) {
        const runs = history.filter(run => run.images.some(image => selectedSet.has(mediaKey(image))))
        if (runs.some(run => run.images.some(image => !selectedSet.has(mediaKey(image))))) {
          setSelectionError(t('selection.wholeRuns'))
          setBulkDeleteOpen(false)
          return
        }
        for (const run of runs) {
          await removeGeneration(run.promptId)
          const removedKeys = new Set(run.images.map(mediaKey))
          setHistory(current => current.filter(item => item.promptId !== run.promptId))
          setSelectedKeys(current => current.filter(key => !removedKeys.has(key)))
        }
        setBulkDeleteOpen(false)
        return
      }
      const result = await removeImages(selectedMedia)
      const deletedKeys = new Set(result.deleted.map(mediaKey))
      setLibrary(current => ({
        images: current.images.filter(item => !deletedKeys.has(mediaKey(item.image))),
        total: Math.max(0, current.total - current.images.filter(item => deletedKeys.has(mediaKey(item.image))).length),
      }))
      setHistory(current => current.map(run => ({ ...run, images: run.images.filter(image => !deletedKeys.has(mediaKey(image))) })))
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
      if (auto && status !== undefined) {
        setAgent(await askAgent(draft.prompt, status, draft.sourceImage, uploads.length > 0 ? uploads : undefined))
        setNewRoom(false)
        setDraft(current => ({ ...current, prompt: '', sourceImage: null }))
        attachmentEpoch.current++
        setUploads([])
        setSourcePreview(undefined)
        return
      }
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
    attachmentEpoch.current++
    setAuto(false)
    setUploads([])
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
      sourceImage: generation.sourceImage ?? null,
      denoise: generation.denoise && generation.denoise > 0 ? generation.denoise : 0.55,
    })
    setSourcePreview(undefined)
    document.querySelector<HTMLElement>('[data-images-composer]')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const editImage = (image: ComfyImageReference, generation: ComfyGeneration | undefined, src: string): void => {
    attachmentEpoch.current++
    if (generation !== undefined) reuse(generation)
    if (preview) setAuto(true)
    setUploads([])
    // The deployment's own reference edit is the designed target. Saved graphs that need a source
    // also report the edit task, and they sort ahead of it, so matching on the task alone would
    // aim this action at whichever one the server lists first.
    const editWorkflow = status?.workflows.find(workflow => workflow.task === 'edit' && workflow.source === 'built-in' && workflow.available)
    ?? status?.workflows.find(workflow => workflow.task === 'edit' && workflow.available)
    setDraft(current => ({ ...current, sourceImage: image, batchSize: 1, seed: '', prompt: '',
      workflow: editWorkflow?.id ?? current.workflow, model: editWorkflow?.modelId ?? current.model,
      steps: editWorkflow?.recommendedSteps ?? current.steps, cfg: editWorkflow?.recommendedCfg ?? current.cfg }))
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
          {renderSlot('images.connection', { onSaved: () => { void refresh() } })}
          <Tooltip label={t('action.export')} side="bottom" delayMs={500} portal><Button size="sm" disabled={agent === undefined || exporting} aria-label={t('action.export')} onClick={() => {
            const reference = agent
            /* v8 ignore next -- the button is disabled without a room, so this cannot run. */
            if (reference === undefined) return
            setExporting(true); setError(undefined)
            void exportRoom(reference.sessionId).then((started) => {
              if (!started) setError(t('notice.exportUnavailable'))
            }).catch((reason: unknown) => { setError(errorMessage(reason, t('notice.failed'))) })
              .finally(() => { setExporting(false) })
          }}><IconDownloadOutlineRegular size={14} /><span className={css.actionLabel}>{t('action.export')}</span></Button></Tooltip>
          {status?.baseUrl !== undefined && <Tooltip label={t('action.openComfy')} side="bottom" delayMs={500} portal><a className={css.openComfy} href={status.baseUrl} target="_blank" rel="noreferrer" aria-label={t('action.openComfy')}><IconLinkOutlineRegular size={14} /><span className={css.actionLabel}>{t('action.openComfy')}</span></a></Tooltip>}
          <Tooltip label={t('action.refresh')} side="bottom" delayMs={500} portal><Button size="sm" onClick={() => { void refresh() }} aria-label={t('action.refresh')}><IconRefreshOutlineRegular size={14} /><span className={css.actionLabel}>{t('action.refresh')}</span></Button></Tooltip>
        </div>
      </header>

      {preview && <div className={css.modeBar}>
        <Button variant={auto ? 'primary' : 'outline'} onClick={() => { setAuto(true) }}>{t('composer.auto')}</Button>
        <Button variant={!auto ? 'primary' : 'outline'} onClick={() => { setAuto(false) }}>{t('composer.advanced')}</Button>
        {auto && <Button variant="outline" disabled={busy} aria-label={t('composer.newConversation')} onClick={() => {
          attachmentEpoch.current++
          setBusy(true); setError(undefined)
          void resetAgent().then((reference) => {
            setAgent(reference); setNewRoom(true); setDraft(EMPTY_DRAFT); setSourcePreview(undefined); setUploads([])
          }).catch((reason: unknown) => { setError(errorMessage(reason, t('notice.failed'))) }).finally(() => { setBusy(false) })
        }}><IconPlusOutlineRegular size={16} /><span className={css.actionLabel}>{t('composer.newConversation')}</span></Button>}

      </div>}
      {error !== undefined && <p className={css.roomError} role="alert">{error}</p>}
      <div className={`${css.roomLayout} ${auto ? css.withRooms : ''}`}>
        {auto && <nav className={css.conversationList} aria-label={t('room.conversations')}>
          <h2>{t('room.conversations')}</h2>
          <Button size="sm" variant="ghost" onClick={() => { setShowArchived(value => !value) }}>{t(showArchived ? 'room.active' : 'room.archived')}</Button>
          {roomState.ids.filter(id => (roomState.archivedIds ?? []).includes(id) === showArchived).map(id => <div key={id} className={css.conversationEntry}><Tooltip label={roomTitle(id)} side="right" delayMs={500}><button type="button" disabled={busy}
            className={css.conversationRow} aria-current={roomState.active === id ? 'page' : undefined}
            onClick={() => {
              attachmentEpoch.current++
              setBusy(true); setError(undefined)
              void openRoom(id).then((reference) => {
                setAgent(reference); setNewRoom(false); setDraft(EMPTY_DRAFT); setUploads([]); setSourcePreview(undefined)
              })
                .catch((reason: unknown) => { setError(errorMessage(reason, t('notice.failed'))) }).finally(() => { setBusy(false) })

            }}><IconSparkleRegular size={16} /><span>{roomTitle(id)}</span></button></Tooltip>
          {archiveRoom !== undefined && <Tooltip label={t(showArchived ? 'room.restore' : 'room.archive')} side="bottom" delayMs={500}>
            <Button size="sm" variant="ghost" className={css.conversationAction} disabled={busy}
              aria-label={t(showArchived ? 'room.restore' : 'room.archive')} onClick={() => {
                setBusy(true); setError(undefined)
                void archiveRoom(id, !showArchived).then(() => {
                  if (roomState.active === id && !showArchived) { setAgent(undefined); setNewRoom(true); setDraft(EMPTY_DRAFT) }
                }).catch((reason: unknown) => { setError(errorMessage(reason, t('notice.failed'))) }).finally(() => { setBusy(false) })
              }}>{showArchived ? <IconUnarchiveOutlineRegular size={14} /> : <IconArchiveOutlineRegular size={14} />}</Button></Tooltip>}
          </div>)}
        </nav>}
        <div className={`${css.creationArea} ${auto ? css.chatStage : ''}`}
          onDragOver={(event) => { if (auto && !busy && event.dataTransfer.types.includes('Files')) { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; setDragging(true) } }}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget instanceof Node ? event.relatedTarget : null)) setDragging(false)
          }}
          onDrop={(event) => {
            if (!auto) return
            event.preventDefault(); setDragging(false)
            if (!busy) void loadUploads(Array.from(event.dataTransfer.files))
          }}>
          {auto && <section className={css.agentConversation} data-conversation-scroll="" aria-label={t('room.conversation')}>
            {agent !== undefined && !newRoom
              ? <SessionProvider session={agent}>{renderSlot('images.agent', { onSettled: () => { void refresh(); void refreshLibrary() }, onUseStarter: useStarter })}</SessionProvider>
              : <div className={css.welcome}><IconSparkleRegular size={28} /><h2>{t('room.welcome')}</h2><p>{t('composer.autoHint')}</p><Starters t={t} onPick={useStarter} /></div>}
          </section>}
          <section className={`${css.composer} ${auto ? css.autoComposer : ''} ${dragging ? css.dropActive : ''}`} data-images-composer
          >
            {!auto && <div className={css.composerHead}>
              <div>
                <h2>{t(draft.sourceImage === null ? 'composer.title' : 'composer.editTitle')}</h2>
                <p>{t(draft.sourceImage === null ? 'composer.hint' : 'composer.editHint')}</p>
              </div>
              {selectedWorkflow !== undefined && <span>{selectedWorkflow.label}</span>}
            </div>}
            <div className={css.promptArea}>
              <textarea
                ref={promptRef}
                className={css.promptInput}
                value={draft.prompt}
                aria-label={t('composer.placeholder')}
                placeholder={t('composer.placeholder')}
                onChange={(event) => { set('prompt', event.target.value) }}
                onPaste={(event) => {
                  if (!auto || busy) return
                  const files = Array.from(event.clipboardData.files).filter(item => item.type.startsWith('image/'))
                  if (files.length > 0) { event.preventDefault(); void loadUploads(files) }
                }}
                onKeyDown={(event) => { if (auto && event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && canGenerate) { event.preventDefault(); void generate() } }}
              />
              {!auto && <div className={css.promptVoice}>
                {renderSlot('images.prompt.activity', { inputActions, locked: busy, onActiveChange: setVoiceActive }, {
                  fallback: <Tooltip label={t('composer.voiceSetup')} side="top" portal>
                    <Button size="sm" type="button" aria-label={t('composer.voiceSetup')} onClick={openVoiceSettings}>
                      <IconMicrophoneOutlineRegular size={18} />
                    </Button>
                  </Tooltip>,
                })}
              </div>}
            </div>
            {auto && <input ref={uploadRef} className={css.fileInput} aria-label={t('composer.upload')} type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif" disabled={busy} onChange={(event) => {
              void loadUploads(Array.from(event.target.files ?? []))
              event.target.value = ''
            }} />}
            {draft.sourceImage !== null && (
              <div className={css.sourceImage}>
                {sourcePreview !== undefined && <img src={sourcePreview} alt={draft.sourceImage.filename} />}
                <div>
                  <strong>{t('composer.sourceImage')}</strong>
                  <span>{draft.sourceImage.filename}</span>
                </div>
                <Button size="sm" onClick={() => { set('sourceImage', null); setSourcePreview(undefined) }}>
                  {t('action.clearSource')}
                </Button>
              </div>
            )}
            {uploads.length > 0 && <div className={css.attachments}>
              {uploads.map((upload, index) => <div key={index} className={css.sourceImage}>
                <img src={`data:${upload.mediaType};base64,${upload.data}`} alt={upload.name ?? ''} />
                <div><strong>{t('composer.sourceImage')}</strong><span>{upload.name}</span></div>
                <Button size="sm" onClick={() => { setUploads(current => current.filter((_, position) => position !== index)) }}>
                  {t('action.clearSource')}
                </Button>
              </div>)}</div>}
            {!auto && <input
              className={css.negativeInput}
              value={draft.negativePrompt}
              aria-label={t('composer.negative')}
              placeholder={selectedWorkflow?.supportsNegativePrompt === false ? t('composer.negativeUnsupported') : t('composer.negative')}
              disabled={selectedWorkflow?.supportsNegativePrompt === false}
              onChange={(event) => { set('negativePrompt', event.target.value) }}
            />}
            {!auto && <div className={css.controls}>
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
                      {workflow.label} · {describeCapability(classifyWorkflow(workflow))}{workflow.available ? '' : ` · ${workflow.unavailableReason ?? t('status.unavailable')}`}
                    </option>
                  ))}
                </select>
              </label>
              {status !== undefined && status.models.filter(model => model.kind !== 'flux2-klein').length > 1 && selectedWorkflow?.task !== 'edit' && selectedWorkflow?.source === 'built-in' && (
                <label>{t('composer.model')}
                  <select value={draft.model} onChange={(event) => {
                    const model = status.models.find(item => item.id === event.target.value)
                    if (model !== undefined) {
                      setDraft(current => ({ ...current, model: model.id, steps: model.recommendedSteps, cfg: model.recommendedCfg }))
                    }
                  }}>
                    {status.models.filter(model => model.kind !== 'flux2-klein').map(model => <option key={model.id} value={model.id}>{model.label}</option>)}
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
              {draft.sourceImage !== null && selectedWorkflow?.task !== 'edit' && <label>{t('composer.denoise')}
                <input type="number" min={0.05} max={1} step={0.05} value={draft.denoise}
                  onChange={(event) => { set('denoise', Number(event.target.value)) }} />
              </label>}
              <Tooltip label={t(needsReference ? 'room.attachHint' : 'composer.generate')} side="top" portal>
                <Button variant="primary" disabled={!canGenerate} onClick={() => { void generate() }}>
                  <IconSparkleRegular size={16} />{busy ? t('composer.generating') : t('composer.generate')}
                </Button>
              </Tooltip>
            </div>}
            {auto && <div className={css.composerToolbar}>
              <Tooltip label={t('composer.upload')} side="top" portal><Button size="sm" aria-label={t('composer.upload')} disabled={busy} onClick={() => { uploadRef.current?.click() }}><IconPlusOutlineRegular size={18} /></Button></Tooltip>
              <span className={css.dropHint}>{t(dragging ? 'room.drop' : 'room.attachHint')}</span>
              {agent !== undefined && <SessionProvider session={agent}>{renderSlot('images.agent.controls', { locked: busy })}</SessionProvider>}
              <div className={css.composerActions}>
                {renderSlot('images.prompt.activity', { inputActions, locked: busy, onActiveChange: setVoiceActive }, {
                  fallback: <Tooltip label={t('composer.voiceSetup')} side="top" portal><Button size="sm" aria-label={t('composer.voiceSetup')} onClick={openVoiceSettings}><IconMicrophoneOutlineRegular size={18} /></Button></Tooltip>,
                })}
                <Tooltip label={t('room.send')} side="top" portal><Button variant="primary" className={css.sendButton} aria-label={t('room.send')} disabled={!canGenerate} onClick={() => { void generate() }}><IconSendOutlineRegular size={18} /></Button></Tooltip>
              </div>
            </div>}
            {!auto && status?.reachable === true && selectedWorkflow !== undefined && (
              <p className={css.modelSummary}>{t('composer.usingWorkflow', { workflow: selectedWorkflow.label, model: selectedModel?.label ?? '' })}</p>
            )}
            {!auto && status?.reachable === true && !status.workflows.some(workflow => workflow.available) && <p className={css.notice}>{t('status.noModels')}</p>}
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

        </div>
        <section className={css.gallery} aria-label={t('gallery.recent')}>
          <div className={css.galleryHeader}><div><h2>{t('gallery.recent')}</h2><p>{t('gallery.recentHint')}</p></div>
            {media.length > 0 && <Button size="sm" onClick={() => { setSelectionMode(current => !current); setSelectedKeys([]); selectionAnchor.current = null }}>{t(selectionMode ? 'selection.done' : 'selection.start')}</Button>}
          </div>
          {selectionMode && <div className={css.selectionBar}>
            <strong>{t('selection.count', { count: selectedMedia.length })}</strong>
            <span>{t('selection.hint')}</span>
            <Button size="sm" disabled={bulkBusy} onClick={() => {
              setSelectedKeys(media.slice(0, BATCH_LIMIT).map(mediaKey))
              setSelectionError(media.length > BATCH_LIMIT ? t('selection.limit') : undefined)
            }}>{t('selection.selectLoaded')}</Button>
            <Button size="sm" disabled={bulkBusy || selectedMedia.length === 0} onClick={() => { setSelectedKeys([]); selectionAnchor.current = null }}>{t('selection.clear')}</Button>
            <Button size="sm" disabled={bulkBusy || selectedMedia.length === 0} onClick={() => { void downloadSelected() }}>
              <IconDownloadOutlineRegular size={14} />{t('selection.download')}
            </Button>
            <Button size="sm" className={css.deleteButton} disabled={bulkBusy || selectedMedia.length === 0}
              onClick={() => { setBulkDeleteOpen(true) }}>
              <IconTrashOutlineRegular size={14} />{t(status?.libraryAvailable === true ? 'selection.delete' : 'selection.removeRuns')}
            </Button>
          </div>}
          {selectionError !== undefined && <p className={css.selectionError} role="alert">{selectionError}</p>}
          {history.length === 0 && pending.length === 0
            ? <p className={css.empty}>{t('gallery.empty')}</p>
            : <div className={css.grid}>{history.flatMap(generation => generation.images.map(image => (
              <ImageCard key={`${generation.promptId}:${image.subfolder}:${image.filename}`} generation={generation} image={image}
                deleting={deleting.includes(generation.promptId)} load={readImage} onDelete={() => remove(generation)}
                selecting={selectionMode} selected={selectedSet.has(mediaKey(image))}
                onSelect={(shift) => { toggleSelection(media.findIndex(item => mediaKey(item) === mediaKey(image)), shift) }}
                onReuse={reuse} onEdit={editImage} t={t} />
            )))}</div>}
        </section>
        <section className={css.gallery} aria-label={t('gallery.library')}>
          <div className={css.galleryHeader}>
            <div>
              <h2>{t('gallery.library')}</h2>
              <p>{t('gallery.count', { count: library.total })}</p>
            </div>
            <div className={css.galleryHeaderActions}>
              {library.images.length > 0 && <Button size="sm" onClick={() => {
                setSelectionMode(current => !current)
                setSelectedKeys([])
                setSelectionError(undefined)
                selectionAnchor.current = null
              }}>{t(selectionMode ? 'selection.done' : 'selection.start')}</Button>}
            </div>
          </div>

          {
            status?.libraryAvailable !== true
              ? <p className={css.empty}>{t('gallery.unconfigured')}</p>
              : <>
                {library.images.length === 0 && <p className={css.empty}>{libraryLoading ? t('gallery.loading') : t('gallery.emptyLibrary')}</p>}
                <div className={css.grid}>{library.images.map(stored => (
                  <ImageCard key={`${stored.image.subfolder}:${stored.image.filename}`} stored={stored} image={stored.image}
                    deleting={deleting.includes(stored.image.filename)} load={readImage}
                    selecting={selectionMode} selected={selectedSet.has(mediaKey(stored.image))}
                    onSelect={(shift) => { toggleSelection(media.findIndex(item => mediaKey(item) === mediaKey(stored.image)), shift) }}
                    onDelete={() => deleteLocalImage(stored.image)} onEdit={editImage} t={t} />
                ))}</div>
                {library.images.length < library.total && <Button size="sm" disabled={libraryLoading} onClick={() => { void loadMore() }}>{t('gallery.loadMore')}</Button>}
              </>
          }
        </section>
      </div>
      <Modal open={bulkDeleteOpen} title={t(status?.libraryAvailable === true ? 'selection.confirmTitle' : 'selection.removeRunsTitle', { count: selectedMedia.length })}
        description={t(status?.libraryAvailable === true ? 'selection.confirmDescription' : 'selection.removeRunsDescription', { count: selectedMedia.length })}
        closeLabel={t('delete.close')} onClose={() => { if (!bulkBusy) setBulkDeleteOpen(false) }}
        footer={<div className={css.confirmActions}>
          <Button variant="outline" disabled={bulkBusy} onClick={() => { setBulkDeleteOpen(false) }}>{t('delete.cancel')}</Button>
          <Button className={css.deleteButton} disabled={bulkBusy} onClick={() => { void deleteSelected() }}>
            <IconTrashOutlineRegular size={14} />{t(bulkBusy ? 'delete.pending' : status?.libraryAvailable === true ? 'selection.confirmDelete' : 'selection.removeRuns')}
          </Button>
        </div>} />
    </main>
  )
}
