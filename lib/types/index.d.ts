/** Host configuration and filesystem routes for the Images conversation preview. */
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
/** Legacy preview preference and the cadence of Images server availability checks. */
export declare const Config: z<Schemastery.ObjectS<NoInfer<{
    autoPreview: z<boolean, boolean, "volatile-defined">;
    permissionPreset: z<string, string, "volatile-defined">;
    agentPreset: z<string, string, "volatile-defined">;
    serverStatusPollIntervalMs: z<number, number, "volatile-defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    autoPreview: z<boolean, boolean, "volatile-defined">;
    permissionPreset: z<string, string, "volatile-defined">;
    agentPreset: z<string, string, "volatile-defined">;
    serverStatusPollIntervalMs: z<number, number, "volatile-defined">;
}>>, "plain">;
/** Exact path registration surface owned by the web host. */
export interface ImagesRouteServer {
    register(route: {
        kind: 'exact';
        path: string;
        handler: (request: IncomingMessage, response: ServerResponse) => void;
    }, label?: string): () => void;
}
/** Native directory chooser exposed by the host picker backend. */
export interface ImagesDirectoryPicker {
    capability(): {
        kind: 'native';
        pick(signal: AbortSignal): Promise<string | null>;
    } | {
        kind: 'browse';
    };
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        /** HTTP route server; absent in deployments without a browser host. */
        readonly webServer: ImagesRouteServer;
        /** Workspace-directory chooser; present only when a picker backend is composed. */
        readonly directoryPicker?: ImagesDirectoryPicker;
    }
}
/** Register the configuration projection consumed by the browser.
 * @param ctx - Host context providing settings and, where available, the route server.
 */
export declare function apply(ctx: Context): void;
//# sourceMappingURL=index.d.ts.map