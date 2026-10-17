import { describe, expect, it } from 'vitest'
import { STILL_MEDIA_TYPES, isStillMediaType } from '../src/client/media.ts'

describe('the still formats the panel accepts', () => {
  it('accepts every format it lists', () => {
    for (const mediaType of STILL_MEDIA_TYPES) expect(isStillMediaType(mediaType)).toBe(true)
  })

  it('pins the exact set of accepted formats', () => {
    // Narrowing this list is a behaviour change: a format the panel accepted would start being
    // refused as an upload. Iterating the list cannot catch that, so the set is asserted.
    expect([...STILL_MEDIA_TYPES]).toEqual(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
  })

  it('refuses a format it does not list, including a video type', () => {
    expect(isStillMediaType('image/tiff')).toBe(false)
    expect(isStillMediaType('video/mp4')).toBe(false)
    expect(isStillMediaType('')).toBe(false)
  })
})
