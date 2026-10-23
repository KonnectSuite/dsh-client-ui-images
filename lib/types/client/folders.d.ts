/** Browser calls for the host's ComfyUI output-folder routes. */
/** One directory the host offers as the saved-media library. */
export interface OutputFolderCandidate {
    /** Absolute folder path. */
    readonly path: string;
    /** Media files directly in the folder, or -1 when it could not be listed. */
    readonly files: number;
}
/** Folders and desktop capabilities reported by the host. */
export interface OutputFolderChoices {
    readonly candidates: readonly OutputFolderCandidate[];
    /** Whether this host can open a path in a desktop file manager. */
    readonly canOpen: boolean;
    /** Host file-manager identity, for a localized label. */
    readonly fileManager: string | null;
}
/** Outcome of one directory-chooser request. */
export type PickFolderResult = {
    readonly kind: 'picked';
    readonly path: string;
} | {
    readonly kind: 'cancelled';
} | {
    readonly kind: 'unsupported';
};
/** Read the output folders the host can offer, best first.
 * @param signal Cancellation for a page that unmounts first.
 * @returns Candidates plus desktop capabilities.
 */
export declare function readOutputFolders(signal?: AbortSignal): Promise<OutputFolderChoices>;
/** Open the host's directory chooser.
 * @returns The chosen path, a cancellation, or an unsupported answer.
 */
export declare function pickOutputFolder(): Promise<PickFolderResult>;
/** Open one folder in the host file manager.
 * @param directory Absolute folder path.
 */
export declare function openFolder(directory: string): Promise<void>;
/** Select one saved file in the host file manager.
 * @param directory Configured output folder.
 * @param image Subfolder and filename reported by the library.
 */
export declare function revealMedia(directory: string, image: {
    readonly subfolder: string;
    readonly filename: string;
}): Promise<void>;
//# sourceMappingURL=folders.d.ts.map