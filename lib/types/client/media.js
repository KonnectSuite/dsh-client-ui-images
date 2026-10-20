/**
 * The still formats this panel accepts, in one place.
 *
 * A reference image, an upload, and a pasted file all pass the same gate, so the list lives here
 * rather than beside each caller: three copies drift, and a format accepted by one path and
 * refused by another is a failure the user sees as "upload failed" with no reason.
 *
 * These are the Host's still content types. Video types are served for playback and are not
 * accepted as a reference or an upload.
 */
export const STILL_MEDIA_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
/**
 * Whether a media type is one this panel accepts for a reference or an upload.
 * @param mediaType - The content type to test.
 * @returns true when the type is one of the accepted still formats, narrowing it for the caller.
 */
export function isStillMediaType(mediaType) {
    return STILL_MEDIA_TYPES.includes(mediaType);
}
//# sourceMappingURL=media.js.map