// @vitest-environment jsdom
import { expect, it } from 'vitest'
import { readImageRooms } from '../src/client/room-state.ts'

it('rejects malformed persisted room navigation without opening arbitrary values', () => {
  for (const value of [null, [], { ids: ['ok', 3], active: 'ok' }, { ids: 'bad' }]) {
    expect(readImageRooms(value)).toEqual({ ids: [], active: null })
  }
  expect(readImageRooms({ ids: ['one', 'one', 'two'], active: 'two' })).toEqual({ ids: ['one', 'two'], active: 'two' })
  expect(readImageRooms({ ids: ['one'], active: 'missing' })).toEqual({ ids: ['one'], active: null })
  expect(readImageRooms({ ids: ['one'], active: null, archivedIds: ['one', 'missing', 3] }))
    .toEqual({ ids: ['one'], active: null, archivedIds: ['one'] })
  expect(readImageRooms({ ids: ['one'], active: null, archivedIds: 'invalid' }))
    .toEqual({ ids: ['one'], active: null })
})
