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
export declare const STILL_MEDIA_TYPES: readonly ["image/png", "image/jpeg", "image/webp", "image/gif"];
/** One of the still formats this panel accepts. */
export type ImageMediaType = (typeof STILL_MEDIA_TYPES)[number];
/**
 * Whether a media type is one this panel accepts for a reference or an upload.
 * @param mediaType - The content type to test.
 * @returns true when the type is one of the accepted still formats, narrowing it for the caller.
 */
export declare function isStillMediaType(mediaType: string): mediaType is ImageMediaType;
//# sourceMappingURL=media.d.ts.map