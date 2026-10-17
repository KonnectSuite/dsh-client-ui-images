/** Recent ComfyUI runs and the local media library beside community chat. */
import { type ReactNode } from 'react';
import { type ImagesPanelProps } from './ImagesPanel.tsx';
/** Render saved media without taking over plugin generation.
 * @param props - Existing media operations and a refresh revision.
 * @returns Recent runs, saved files, and an image-edit prompt.
 */
export declare function CommunityMedia({ revision, canCreate, ...props }: ImagesPanelProps & {
    revision: number;
    canCreate?: boolean;
}): ReactNode;
//# sourceMappingURL=CommunityMedia.d.ts.map