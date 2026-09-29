import { IconSparkleRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'

/** Decorative sparkle used by the Images navigation row. */
export function ImagesIcon({ size }: PropsRuntime<'sidebar.panellist'>) {
  return <IconSparkleRegular size={size} />
}
