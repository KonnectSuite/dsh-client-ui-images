/** Host configuration for the Images conversation preview. */
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
/** Register the configuration projection consumed by the browser.
 * @param ctx - Host context providing settings when available.
 */
export declare function apply(ctx: Context): void;
//# sourceMappingURL=index.d.ts.map