'use strict'
import test from 'ava'
import fn from './'

test('title', async t => {
  const result = await fn('millette')
  t.is(result.events.length, 300)
})
