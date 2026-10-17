import { Context, Service } from '@deepseek-ai/cordis'
import { describe, expect, it, vi } from 'vitest'
import * as ImagesPlugin from '../src/index.ts'

/** Stands in for the settings service the Host half projects its configuration through. */
class StubSettings extends Service {
  readonly configure = vi.fn()

  constructor(ctx: Context) {
    super(ctx, 'settings')
  }
}

describe('the Images host configuration', () => {
  it('registers the autoPreview projection while settings are available', async () => {
    const ctx = new Context()
    const configure = vi.fn()
    await ctx.plugin(class extends StubSettings { override readonly configure = configure })
    await ctx.plugin(ImagesPlugin)

    // The panel reads this key from the Host, so a projection that never registers leaves the
    // browser on its built-in default with no way for a deployment to change it.
    expect(configure).toHaveBeenCalledWith({ auto: false }, expect.anything())
  })
})
