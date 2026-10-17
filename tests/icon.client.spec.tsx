// @vitest-environment jsdom
import { createElement } from 'react'
import { cleanup, render } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { ImagesIcon } from '../src/client/ImagesIcon.tsx'

afterEach(cleanup)

it('draws the sidebar glyph for the Images row', () => {
  const { container } = render(createElement(ImagesIcon, { size: 18 } as never))

  const svg = container.querySelector('svg')
  expect(svg).not.toBeNull()
  // The row asks for a size and gets that size, so a wider or narrower sidebar stays even.
  expect(svg?.getAttribute('width')).toBe('18')
  expect(svg?.getAttribute('height')).toBe('18')
})
