#!/usr/bin/env node
0 > 1 // see https://github.com/babel/babel-eslint/issues/163

/*
RoLLodeQc utility to fetch user events.

Copyright 2016
Robin Millette <mailto:robin@millette.info>
<http://robin.millette.info>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the
[GNU Affero General Public License](LICENSE.md)
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

'use strict'
// npm
const meow = require('meow')
const updateNotifier = require('update-notifier')

updateNotifier({ pkg: require('./package.json') }).notify()

// self
const rollodeqcGhUserEvents = require('./')

const cli = meow([
  'Usage',
  '  $ rollodeqc-gh-user-events [input]',
  '',
  'Options',
  '  --etag  If-None-Match header value',
  '',
  'Examples',
  '  $ rollodeqc-gh-user-events',
  '  unicorns & rainbows',
  '  $ rollodeqc-gh-user-events ponies',
  '  ponies & rainbows'
])

rollodeqcGhUserEvents(cli.input[0] || 'millette', cli.flags.etag)
  .then((x) => {
    console.log(JSON.stringify(x, null, ' '))
  })
  .catch((e) => {
    console.log('ERROR:', e)
  })
