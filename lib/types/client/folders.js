/** Browser calls for the host's ComfyUI output-folder routes. */
/** Route prefix owned by the Images host plugin. */
const ROUTE = '/plugins/ui-images';
/** Read one JSON response, turning a host error code into a thrown Error.
 * @param response Fetch response.
 * @returns Parsed body.
 */
async function readJson(response) {
    const body = await response.json().catch(() => undefined);
    const record = typeof body === 'object' && body !== null ? body : {};
    if (!response.ok || record.ok !== true) {
        throw new Error(typeof record.error === 'string' ? record.error : `HTTP ${String(response.status)}`);
    }
    return record;
}
/** Post one JSON body to a plugin route.
 * @param path Route path below the plugin prefix.
 * @param body JSON payload.
 * @returns Parsed response body.
 */
async function post(path, body) {
    const response = await fetch(`${ROUTE}/${path}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
    });
    return readJson(response);
}
/** Read the output folders the host can offer, best first.
 * @param signal Cancellation for a page that unmounts first.
 * @returns Candidates plus desktop capabilities.
 */
export async function readOutputFolders(signal) {
    const response = await fetch(`${ROUTE}/output-folders`, signal === undefined ? {} : { signal });
    const body = await readJson(response);
    const candidates = Array.isArray(body.candidates)
        ? body.candidates.filter((item) => typeof item === 'object' && item !== null
            && typeof item.path === 'string'
            && typeof item.files === 'number')
        : [];
    return {
        candidates,
        canOpen: body.canOpen === true,
        fileManager: typeof body.fileManager === 'string' ? body.fileManager : null,
    };
}
/** Open the host's directory chooser.
 * @returns The chosen path, a cancellation, or an unsupported answer.
 */
export async function pickOutputFolder() {
    try {
        const body = await post('pick-folder', {});
        return typeof body.path === 'string' ? { kind: 'picked', path: body.path } : { kind: 'cancelled' };
    }
    catch (error) {
        if (error instanceof Error && (error.message === 'no-picker' || error.message === 'no-native-picker'))
            return { kind: 'unsupported' };
        throw error;
    }
}
/** Open one folder in the host file manager.
 * @param directory Absolute folder path.
 */
export async function openFolder(directory) {
    await post('open-folder', { directory });
}
/** Select one saved file in the host file manager.
 * @param directory Configured output folder.
 * @param image Subfolder and filename reported by the library.
 */
export async function revealMedia(directory, image) {
    await post('reveal-media', { directory, subfolder: image.subfolder, filename: image.filename });
}
//# sourceMappingURL=folders.js.map