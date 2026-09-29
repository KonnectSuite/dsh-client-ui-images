import { type ReactNode } from 'react';
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { ComfyGenerateRequest, ComfyGeneration, ComfyImageReference, ComfyImagesStatus } from '@deepseek-ai/dsh-api-comfyui-controller/types';
import { NS } from './locales.ts';
export interface ImagesInjected {
    readonly status: () => Promise<ComfyImagesStatus>;
    readonly history: () => Promise<readonly ComfyGeneration[]>;
    readonly generate: (request: ComfyGenerateRequest) => Promise<{
        readonly promptId: string;
        readonly seed: number;
    }>;
    readonly cancel: (promptId: string) => Promise<void>;
    readonly remove: (promptId: string) => Promise<void>;
    readonly image: (image: ComfyImageReference) => Promise<string>;
}
export type ImagesPanelProps = PropsRuntime<'main'> & InjectFace<ImagesInjected> & PropsLocale<typeof NS>;
/** Full-page local ComfyUI image generator. */
export declare function ImagesPanel({ status: readStatus, history: readHistory, generate: requestGeneration, cancel: cancelGeneration, remove: removeGeneration, image: readImage, t, }: ImagesPanelProps): ReactNode;
//# sourceMappingURL=ImagesPanel.d.ts.map