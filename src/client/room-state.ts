/** Browser-local room navigation; conversation contents remain Host-owned Sessions. */
import type { SessionId } from '@deepseek-ai/dsh-api-remotes/client'

/** Persisted navigation for this browser/profile origin. */
export interface ImageRoomState {
  readonly ids: readonly SessionId[]
  readonly active: SessionId | null
  /** Archived conversations remain discoverable for restoration. */
  readonly archivedIds?: readonly SessionId[]
}

/** Validate persisted navigation before using it to open Host sessions.
 * @param value - JSON loaded from browser storage.
 * @returns deduplicated navigation, or an empty registry for invalid data.
 */
export function readImageRooms(value: unknown): ImageRoomState {
  if (typeof value !== 'object' || value === null || !('ids' in value) || !Array.isArray(value.ids)
    || !value.ids.every((id: unknown) => typeof id === 'string' && id.length > 0)) return { ids: [], active: null }
  const ids = [...new Set(value.ids)] as SessionId[]
  const active = 'active' in value && typeof value.active === 'string' && ids.includes(value.active as SessionId)
    ? value.active as SessionId : null
  const savedArchived = 'archivedIds' in value ? value.archivedIds : undefined
  const archivedIds = Array.isArray(savedArchived) ? ids.filter(id => savedArchived.includes(id)) : undefined
  return archivedIds === undefined ? { ids, active } : { ids, active, archivedIds }
}
