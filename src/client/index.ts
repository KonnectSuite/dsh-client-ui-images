/** Cordis registration for AryaAI's global Images page. */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { ComfyGenerateRequest, ComfyImageReference } from '@deepseek-ai/dsh-api-comfyui-controller/types'
import type {} from '@deepseek-ai/dsh-api-comfyui-controller/remote'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import { ImagesIcon } from './ImagesIcon.tsx'
import { ImagesPanel, type ImagesInjected } from './ImagesPanel.tsx'
import { en, NS, zh, type ImagesKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Local ComfyUI generation page copy. */
    images: ImagesKey
  }
}

export const inject = ['locale', 'remote', 'remote.comfyImages', 'slots']
const PANEL_ID = 'images'

/** Register the global page and its left-sidebar navigation entry. */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-images: dictionaries')
  const t = ctx.locale.bind(NS)
  const unwrap = async <T>(operation: Promise<{ ok: true; value: T } | { ok: false; error: { message: string } }>): Promise<T> => {
    const result = await operation
    if (!result.ok) throw new Error(result.error.message)
    return result.value
  }
  const face: ImagesInjected = {
    status: () => unwrap(ctx.remote.comfyImages.status()),
    history: () => unwrap(ctx.remote.comfyImages.history({ limit: 40 })),
    generate: (request: ComfyGenerateRequest) => unwrap(ctx.remote.comfyImages.generate(request)),
    cancel: async (promptId: string) => { await unwrap(ctx.remote.comfyImages.cancel({ promptId })) },
    remove: async (promptId: string) => { await unwrap(ctx.remote.comfyImages.deleteGeneration({ promptId })) },
    image: async (image: ComfyImageReference) => {
      const value = await unwrap(ctx.remote.comfyImages.image(image))
      return `data:${value.contentType};base64,${value.base64}`
    },
  }
  ctx.slots.inject('main', () => ctx.slots.register({
    name: 'main', key: PANEL_ID, locale: NS, inject: () => face,
  }, ImagesPanel))
  ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
    name: 'sidebar.panellist', id: PANEL_ID, order: -10, locale: NS, label: () => t('panel.label'),
  }, ImagesIcon))
}
