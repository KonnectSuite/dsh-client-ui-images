import { useCallback, useEffect, useState, type ReactNode } from 'react'
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
  ComfyImageReference,
  ComfyImagesStatus,
} from '@deepseek-ai/dsh-api-comfyui-controller/types'
import { NS } from './locales.ts'
import css from './ImagesPanel.module.css'

const SIZES = [
  { label: 'Square · 1024', width: 1024, height: 1024 },
  { label: 'Landscape · 1216 × 832', width: 1216, height: 832 },
  { label: 'Portrait · 832 × 1216', width: 832, height: 1216 },
] as const

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
}

const EMPTY_DRAFT: Draft = {
  prompt: '', negativePrompt: '', model: '', workflow: '', width: 1024, height: 1024,
  steps: 24, cfg: 7, seed: '', batchSize: 1,
}

export interface ImagesInjected {
  readonly status: () => Promise<ComfyImagesStatus>
  readonly history: () => Promise<readonly ComfyGeneration[]>
  readonly generate: (request: ComfyGenerateRequest) => Promise<{ readonly promptId: string; readonly seed: number }>
  readonly cancel: (promptId: string) => Promise<void>
  readonly remove: (promptId: string) => Promise<void>
  readonly image: (image: ComfyImageReference) => Promise<string>
}

export type ImagesPanelProps = PropsRuntime<'main'> & InjectFace<ImagesInjected> & PropsLocale<typeof NS>

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

function ImageCard({ generation, image, deleting, load, onDelete, onReuse, t }: {
  readonly generation: ComfyGeneration
  readonly image: ComfyImageReference
  readonly deleting: boolean
  readonly load: ImagesInjected['image']
  readonly onDelete: (generation: ComfyGeneration) => Promise<boolean>
  readonly onReuse: (generation: ComfyGeneration) => void
  readonly t: ImagesPanelProps['t']
}): ReactNode {
  const [src, setSrc] = useState<string>()
  const [failed, setFailed] = useState(false)
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  useEffect(() => {
    const controller = new AbortController()
    void load(image).then((value) => {
      if (!controller.signal.aborted) setSrc(value)
    }).catch(() => {
      if (!controller.signal.aborted) setFailed(true)
    })
    return () => { controller.abort() }
  }, [image, load])
  return (
    <article className={css.card}>
      <button
        type="button"
        className={css.preview}
        disabled={src === undefined}
        aria-label={t('gallery.open', { name: image.filename })}
        onClick={() => { setOpen(true) }}
      >
        {src !== undefined
          ? <img src={src} alt={generation.prompt} />
          : <span className={failed ? css.failed : css.loading}>{failed ? t('gallery.failed') : t('gallery.loading')}</span>}
      </button>
      <div className={css.cardBody}>
        <p className={css.workflow}>{t('gallery.workflow', { workflow: generation.workflowLabel })}</p>
        <p className={css.prompt}>{generation.prompt}</p>
        <p className={css.meta}>{generation.width} × {generation.height} · {generation.steps} steps · seed {generation.seed}</p>
        <div className={css.cardActions}>
          <Button size="sm" onClick={() => { onReuse(generation) }}>{t('action.reuse')}</Button>
          {src !== undefined && (
            <a className={css.download} href={src} download={image.filename}>
              <IconDownloadOutlineRegular size={14} />{t('action.download')}
            </a>
          )}
          <Button className={css.deleteButton} size="sm" disabled={deleting} onClick={() => { setConfirming(true) }}>
            <IconTrashOutlineRegular size={14} />{t(deleting ? 'delete.pending' : 'action.delete')}
          </Button>
        </div>
      </div>
      {open && src !== undefined && (
        <ImageLightbox
          src={src}
          alt={generation.prompt}
          labels={{ dialog: t('gallery.open', { name: image.filename }), close: t('gallery.close') }}
          onClose={() => { setOpen(false) }}
        />
      )}
      <Modal
        open={confirming}
        title={t('delete.title')}
        description={t('delete.description')}
        closeLabel={t('delete.close')}
        onClose={() => { if (!deleting) setConfirming(false) }}
        footer={<div className={css.confirmActions}>
          <Button variant="outline" disabled={deleting} onClick={() => { setConfirming(false) }}>{t('delete.cancel')}</Button>
          <Button className={css.deleteButton} disabled={deleting} onClick={() => {
            void onDelete(generation).then((deleted) => { if (deleted) setConfirming(false) })
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
  generate: requestGeneration,
  cancel: cancelGeneration,
  remove: removeGeneration,
  image: readImage,
  t,
}: ImagesPanelProps): ReactNode {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [status, setStatus] = useState<ComfyImagesStatus>()
  const [history, setHistory] = useState<readonly ComfyGeneration[]>([])
  const [pending, setPending] = useState<readonly string[]>([])
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [deleting, setDeleting] = useState<readonly string[]>([])

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
          model: nextStatus.models.some(item => item.id === current.model) ? current.model : model?.id ?? '',
          workflow: workflow?.id ?? '',
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
  useEffect(() => {
    if (pending.length === 0) return undefined
    const timer = window.setInterval(() => { void refresh() }, 1_500)
    return () => { window.clearInterval(timer) }
  }, [pending.length, refresh])

  const set = <K extends keyof Draft>(key: K, value: Draft[K]): void => {
    setDraft(current => ({ ...current, [key]: value }))
  }
  const selectedSize = `${draft.width}x${draft.height}`
  const selectedWorkflow = status?.workflows.find(workflow => workflow.id === draft.workflow)
  const canGenerate = status?.reachable === true && selectedWorkflow?.available === true && draft.prompt.trim() !== '' && !busy
  const selectedModel = status?.models.find(model => model.id === draft.model)

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
    })
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
        <textarea
          className={css.promptInput}
          value={draft.prompt}
          aria-label={t('composer.placeholder')}
          placeholder={t('composer.placeholder')}
          onChange={(event) => { set('prompt', event.target.value) }}
        />
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
                  ...current, workflow: workflow.id, steps: workflow.recommendedSteps, cfg: workflow.recommendedCfg,
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
          {status !== undefined && status.models.length > 1 && (
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
          <label>{t('composer.size')}
            <select value={selectedSize} onChange={(event) => {
              const size = SIZES.find(item => `${item.width}x${item.height}` === event.target.value)
              if (size !== undefined) setDraft(current => ({ ...current, width: size.width, height: size.height }))
            }}>
              {SIZES.map(size => <option key={size.label} value={`${size.width}x${size.height}`}>{size.label}</option>)}
            </select>
          </label>
          <label>{t('composer.steps')}<input type="number" min={1} max={150} value={draft.steps} onChange={(event) => { set('steps', Number(event.target.value)) }} /></label>
          <label>{t('composer.cfg')}<input type="number" min={0} max={30} step={0.5} value={draft.cfg} onChange={(event) => { set('cfg', Number(event.target.value)) }} /></label>
          <label>{t('composer.seed')}<input inputMode="numeric" value={draft.seed} placeholder={t('composer.random')} onChange={(event) => { set('seed', event.target.value) }} /></label>
          <label>{t('composer.batch')}<input type="number" min={1} max={8} value={draft.batchSize} onChange={(event) => { set('batchSize', Number(event.target.value)) }} /></label>
          <Button disabled={!canGenerate} onClick={() => { void generate() }}>
            <IconSparkleRegular size={16} />{busy ? t('composer.generating') : t('composer.generate')}
          </Button>
        </div>
        {status?.reachable === true && status.models.length === 1 && selectedModel !== undefined && (
          <p className={css.modelSummary}>{t('composer.usingModel', { model: selectedModel.label })}</p>
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
        <h2>{t('gallery.title')}</h2>
        {history.length === 0 && pending.length === 0
          ? <p className={css.empty}>{t('gallery.empty')}</p>
          : <div className={css.grid}>{history.flatMap(generation => generation.images.map(image => (
            <ImageCard
              key={`${generation.promptId}:${image.subfolder}:${image.filename}`}
              generation={generation}
              image={image}
              deleting={deleting.includes(generation.promptId)}
              load={readImage}
              onDelete={remove}
              onReuse={reuse}
              t={t}
            />
          )))}</div>}
      </section>
    </main>
  )
}
