/** Cordis registration for AryaAI's global Images page. */
import type { Context as ClientContext } from '@deepseek-ai/cordis';
import { type ImagesKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** Local ComfyUI generation page copy. */
        images: ImagesKey;
    }
}
export declare const inject: string[];
/** Register the global page and its left-sidebar navigation entry. */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map