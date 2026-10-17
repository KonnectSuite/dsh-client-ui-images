/** Browser-local room navigation; conversation contents remain Host-owned Sessions. */
import type { SessionId } from '@deepseek-ai/dsh-api-remotes/client';
/** Persisted navigation for this browser/profile origin. */
export interface ImageRoomState {
    readonly ids: readonly SessionId[];
    readonly active: SessionId | null;
    /** Archived conversations remain discoverable for restoration. */
    readonly archivedIds?: readonly SessionId[];
}
/** Validate persisted navigation before using it to open Host sessions.
 * @param value - JSON loaded from browser storage.
 * @returns deduplicated navigation, or an empty registry for invalid data.
 */
export declare function readImageRooms(value: unknown): ImageRoomState;
//# sourceMappingURL=room-state.d.ts.map