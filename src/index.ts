/** Host configuration for the Images conversation preview. */
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-settings'
import z from '@deepseek-ai/schemastery'

/** Legacy preview preference and the cadence of Images server availability checks. */
export const Config = z.object({
  autoPreview: z.boolean().default(true).volatile(),
  permissionPreset: z.string().min(1).default('danger-full-access').volatile(),
  agentPreset: z.string().min(1).default('content').volatile(),
  serverStatusPollIntervalMs: z.number().step(1).min(1000).default(10000).volatile(),
})

/** Register the configuration projection consumed by the browser.
 * @param ctx - Host context providing settings when available.
 */
export function apply(ctx: Context): void {
  ctx.inject(['settings'], (child) => { child.effect(() => child.settings.configure({ auto: false }, ctx.fiber)) })
}
