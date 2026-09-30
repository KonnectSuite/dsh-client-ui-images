import { ImagesIcon } from "./ImagesIcon.js";
import { ImagesPanel } from "./ImagesPanel.js";
import { en, NS, zh } from "./locales.js";
export const inject = ['locale', 'remote', 'remote.comfyImages', 'slots'];
const PANEL_ID = 'images';
/** Register the global page and its left-sidebar navigation entry. */
export function apply(ctx) {
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-images: dictionaries');
    const t = ctx.locale.bind(NS);
    const unwrap = async (operation) => {
        const result = await operation;
        if (!result.ok)
            throw new Error(result.error.message);
        return result.value;
    };
    const face = {
        status: () => unwrap(ctx.remote.comfyImages.status()),
        history: () => unwrap(ctx.remote.comfyImages.history({ limit: 40 })),
        library: (offset) => unwrap(ctx.remote.comfyImages.library({ offset, limit: 40 })),
        generate: (request) => unwrap(ctx.remote.comfyImages.generate(request)),
        cancel: async (promptId) => { await unwrap(ctx.remote.comfyImages.cancel({ promptId })); },
        remove: async (promptId) => { await unwrap(ctx.remote.comfyImages.deleteGeneration({ promptId })); },
        removeImage: async (image) => { await unwrap(ctx.remote.comfyImages.deleteImage(image)); },
        image: async (image) => {
            const value = await unwrap(ctx.remote.comfyImages.image(image));
            return `data:${value.contentType};base64,${value.base64}`;
        },
    };
    ctx.slots.inject('main', () => ctx.slots.register({
        name: 'main', key: PANEL_ID, locale: NS, inject: () => face,
    }, ImagesPanel));
    ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
        name: 'sidebar.panellist', id: PANEL_ID, order: -10, locale: NS, label: () => t('panel.label'),
    }, ImagesIcon));
}
//# sourceMappingURL=index.js.map