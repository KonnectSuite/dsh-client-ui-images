/** One directory a profile can browse as saved media. */
export interface OutputFolderCandidate {
    /** Absolute folder path. */
    readonly path: string;
    /** Media files directly in the folder, or -1 when it could not be listed. */
    readonly files: number;
}
/** Report whether a path names an existing directory.
 * @param value Absolute candidate path.
 * @returns True when the directory exists and is readable as a directory.
 */
export declare function isDirectory(value: string): boolean;
/** Count the media files directly inside a folder.
 * @param folder Absolute directory path.
 * @returns File count, or -1 when the folder cannot be listed.
 */
export declare function countMediaFiles(folder: string): number;
/** Read comfy-cli's recorded ComfyUI workspace.
 * @param env Environment holding the platform app-data root.
 * @param home Fallback home directory.
 * @returns The recorded workspace path, or null when comfy-cli keeps no config.
 */
export declare function comfyCliWorkspace(env?: NodeJS.ProcessEnv, home?: string): string | null;
/** Collect the output folders worth offering as the library root, best first.
 * @param options Environment and home overrides used by tests.
 * @returns Existing directories only, deduplicated by resolved path.
 */
export declare function discoverOutputFolders(options?: {
    readonly env?: NodeJS.ProcessEnv;
    readonly home?: string;
}): readonly OutputFolderCandidate[];
/** Resolve a media reference inside its output folder.
 * @param root Configured output folder.
 * @param subfolder ComfyUI subfolder, empty at the root.
 * @param filename File name reported by the library.
 * @returns The absolute file path, or null when it would escape the folder.
 */
export declare function resolveMediaPath(root: string, subfolder: string, filename: string): string | null;
//# sourceMappingURL=output-folders.d.ts.map