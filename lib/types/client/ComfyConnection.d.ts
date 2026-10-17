import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots';
import type { ComfyConnectionValue } from '@deepseek-ai/dsh-api-mcp-controller/types';
import type { ComfyServerControlResult } from '@deepseek-ai/dsh-api-comfyui-controller/types';
import type { ComfyImagesStatus } from '@deepseek-ai/dsh-api-comfyui-controller/types';
import { NS } from './locales.ts';
/** Server availability and lifecycle transitions displayed by Images. */
export type ComfyServerPhase = 'checking' | 'running' | 'stopped' | 'starting' | 'stopping' | 'restarting' | 'failed';
/** Connection operations supplied by the profile's MCP controller. */
export interface ComfyConnectionActions {
    /** Read availability of the configured image server. */
    readonly readStatus?: () => Promise<ComfyImagesStatus>;
    /** Return the configured delay between completed availability checks. */
    readonly pollIntervalMs?: () => number;
    /** Publish availability and lifecycle transitions to the Images page. */
    readonly onServerState?: (phase: ComfyServerPhase) => void;
    /** Render persistent status and lifecycle controls above the conversation. */
    readonly presentation?: 'panel';
    readonly readConnection: () => Promise<ComfyConnectionValue>;
    readonly testConnection: (baseUrl: string) => Promise<void>;
    readonly saveConnection: (settings: ComfyConnectionValue) => Promise<void>;
    readonly onSaved: () => void;
    /** Start, stop and restart the server this profile talks to. */
    readonly startServer: () => Promise<ComfyServerControlResult>;
    readonly stopServer: () => Promise<ComfyServerControlResult>;
    readonly restartServer: () => Promise<ComfyServerControlResult>;
}
/** Open, test and save the profile's ComfyUI connection without losing the image draft.
 * @param props Localized form and persistent connection operations.
 * @returns Header action and dismissable connection modal.
 */
export declare function ComfyConnection({ t, readConnection, testConnection, saveConnection, onSaved, startServer, stopServer, restartServer, readStatus, pollIntervalMs, onServerState, presentation }: PropsLocale<typeof NS> & ComfyConnectionActions): import("react").JSX.Element;
//# sourceMappingURL=ComfyConnection.d.ts.map