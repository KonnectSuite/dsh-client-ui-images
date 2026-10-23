import type { SessionReference } from '@deepseek-ai/dsh-api-session-controller/client';
import type { SessionId } from '@deepseek-ai/dsh-api-remotes/client';
import type { PromptContentPart } from '@deepseek-ai/dsh-api-session-controller/types';
import type { ImageRoomState } from './room-state.ts';
import { type ReactNode } from 'react';
import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store';
import type { InjectFace, PropsLocale, PropsRenderSlots } from '@deepseek-ai/dsh-client-ui-slots';
import type { ComfyGenerateRequest, ComfyGeneration, ComfyDeleteImagesResult, ComfyImageReference, ComfyImagesStatus, ComfyLibraryPage, ComfyStoredImage } from '@deepseek-ai/dsh-api-comfyui-controller/types';
import { NS } from './locales.ts';
export interface ImagesInjected {
    /** Fill an empty Content composer with an editable idea; never submit or replace an existing draft. */
    readonly fillDraft?: (text: string) => Promise<void>;
    /** Whether the profile's community image bundle is enabled without a load error. */
    readonly imagePlugin: () => Promise<boolean>;
    /** Add selected gallery media to the active composer without submitting. */
    readonly addMedia?: (media: readonly ComfyImageReference[]) => Promise<void>;
    /** Add dropped files or a captured video frame to the active composer. */
    readonly addFiles?: (files: readonly File[]) => Promise<void>;
    /** Open community plugin installation and configuration in the existing manager. */
    readonly openImagePlugin: () => void;
    /** Whether the conversation interface is enabled in this deployment. */
    readonly autoPreview: ObservableSnapshot<boolean>;
    /** Restore the Images-owned conversation without changing the main chat. */
    /** Release replaced references after React has committed the new conversation. */
    readonly settleAgent?: (reference: SessionReference | undefined) => void;
    readonly currentAgent: () => SessionReference | undefined;
    /** Browser-local room navigation; messages remain in durable Host sessions. */
    readonly rooms: ObservableSnapshot<ImageRoomState>;
    /** Open an existing Images conversation without navigating the main chat. */
    readonly openRoom: (id: SessionId) => Promise<SessionReference>;
    /** Resolve a room's latest catalog title. */
    readonly roomTitle: (id: SessionId) => string;
    /** Archive or restore a durable conversation through the Host registry. */
    readonly archiveRoom?: (id: SessionId, archived: boolean) => Promise<void>;
    /** Release this conversation view; its durable session remains in the catalog. */
    readonly resetAgent: () => Promise<SessionReference>;
    /** Download a room's session log and its generated media as an archive. Resolves
     * false when this deployment ships no export provider, which the panel reports
     * rather than offering an action that cannot complete. */
    readonly exportRoom: (id: SessionId) => Promise<boolean>;
    /** Submit a logged request with the current ComfyUI catalog and source image. */
    readonly askAgent: (prompt: string, status: ComfyImagesStatus, source: ComfyImageReference | null, uploads?: readonly Extract<PromptContentPart, {
        type: 'image';
    }>[]) => Promise<SessionReference>;
    /** Open voice setup without recording or downloading models. */
    readonly openVoiceSettings: () => void;
    readonly status: () => Promise<ComfyImagesStatus>;
    readonly history: () => Promise<readonly ComfyGeneration[]>;
    readonly library: (offset: number) => Promise<ComfyLibraryPage>;
    readonly generate: (request: ComfyGenerateRequest) => Promise<{
        readonly promptId: string;
        readonly seed: number;
    }>;
    readonly cancel: (promptId: string) => Promise<void>;
    readonly remove: (promptId: string) => Promise<void>;
    readonly removeImage: (image: ComfyImageReference) => Promise<void>;
    readonly removeImages: (images: readonly ComfyImageReference[]) => Promise<ComfyDeleteImagesResult>;
    readonly image: (image: ComfyImageReference) => Promise<string>;
    /** Current ComfyUI output folder, or an empty string when the library is unconfigured. */
    readonly readOutputFolder?: () => Promise<string>;
    /** Save the folder the ComfyUI controller lists saved media from. */
    readonly saveOutputFolder?: (directory: string) => Promise<void>;
    /** Select one saved file in the host file manager. */
    readonly reveal?: (image: ComfyImageReference) => Promise<void>;
}
export type ImagesPanelProps = PropsRenderSlots<'images.prompt.activity' | 'images.agent' | 'images.agent.controls' | 'images.connection'> & InjectFace<ImagesInjected> & PropsLocale<typeof NS>;
/** Render saved or generated media with preview, download, edit, and delete actions.
 * @param props - Media metadata, loader, actions, and localized labels.
 * @returns A media card.
 */
export declare function ImageCard({ generation, stored, image, deleting, selecting, selected, onSelect, load, onDelete, onReuse, onEdit, onAttach, onFrame, onReveal, t, }: {
    readonly generation?: ComfyGeneration;
    readonly stored?: ComfyStoredImage;
    readonly image: ComfyImageReference;
    readonly deleting: boolean;
    readonly selecting?: boolean;
    readonly selected?: boolean;
    readonly onSelect?: (shift: boolean) => void;
    readonly load: ImagesInjected['image'];
    readonly onDelete: () => Promise<boolean>;
    readonly onFrame?: ((file: File) => Promise<void>) | undefined;
    readonly onAttach?: ((image: ComfyImageReference) => void) | undefined;
    readonly onReuse?: (generation: ComfyGeneration) => void;
    readonly onEdit?: ((image: ComfyImageReference, generation: ComfyGeneration | undefined, src: string) => void) | undefined;
    readonly onReveal?: (() => void) | undefined;
    readonly t: ImagesPanelProps['t'];
}): ReactNode;
/** Full-page local ComfyUI image generator. */
export declare function ImagesPanel({ autoPreview, renderSlot, SessionProvider, currentAgent, settleAgent, rooms, openRoom, roomTitle, archiveRoom, resetAgent, exportRoom, askAgent, openVoiceSettings, status: readStatus, history: readHistory, library: readLibrary, generate: requestGeneration, cancel: cancelGeneration, remove: removeGeneration, removeImage, removeImages, image: readImage, t, }: ImagesPanelProps): ReactNode;
//# sourceMappingURL=ImagesPanel.d.ts.map