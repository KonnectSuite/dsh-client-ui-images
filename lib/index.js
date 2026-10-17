import z from "@deepseek-ai/schemastery";
//#region lib/types/index.js
/** Legacy preview preference and the cadence of Images server availability checks. */
const Config = z.object({
	autoPreview: z.boolean().default(true).volatile(),
	permissionPreset: z.string().min(1).default("danger-full-access").volatile(),
	agentPreset: z.string().min(1).default("content").volatile(),
	serverStatusPollIntervalMs: z.number().step(1).min(1e3).default(1e4).volatile()
});
/** Register the configuration projection consumed by the browser.
* @param ctx - Host context providing settings when available.
*/
function apply(ctx) {
	ctx.inject(["settings"], (child) => {
		child.effect(() => child.settings.configure({ auto: false }, ctx.fiber));
	});
}
//#endregion
export { Config, apply };
