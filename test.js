'use strict'
import test from 'ava'
import fn from './'

test('title', async t => {
  const result = await fn('millette')
  t.truthy(result.events.length > 200)
  t.truthy(result.events.length < 400)
})
