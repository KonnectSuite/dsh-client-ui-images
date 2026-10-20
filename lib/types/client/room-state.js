/** Validate persisted navigation before using it to open Host sessions.
 * @param value - JSON loaded from browser storage.
 * @returns deduplicated navigation, or an empty registry for invalid data.
 */
export function readImageRooms(value) {
    if (typeof value !== 'object' || value === null || !('ids' in value) || !Array.isArray(value.ids)
        || !value.ids.every((id) => typeof id === 'string' && id.length > 0))
        return { ids: [], active: null };
    const ids = [...new Set(value.ids)];
    const active = 'active' in value && typeof value.active === 'string' && ids.includes(value.active)
        ? value.active : null;
    const savedArchived = 'archivedIds' in value ? value.archivedIds : undefined;
    const archivedIds = Array.isArray(savedArchived) ? ids.filter(id => savedArchived.includes(id)) : undefined;
    return archivedIds === undefined ? { ids, active } : { ids, active, archivedIds };
}
//# sourceMappingURL=room-state.js.map