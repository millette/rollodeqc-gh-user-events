# rollodeqc-gh-user-events
[![Build Status](https://travis-ci.org/millette/rollodeqc-gh-user-events.svg?branch=master)](https://travis-ci.org/millette/rollodeqc-gh-user-events)
[![Coverage Status](https://coveralls.io/repos/github/millette/rollodeqc-gh-user-events/badge.svg?branch=master)](https://coveralls.io/github/millette/rollodeqc-gh-user-events?branch=master)
[![Dependency Status](https://gemnasium.com/badges/github.com/millette/rollodeqc-gh-user-events.svg)](https://gemnasium.com/github.com/millette/rollodeqc-gh-user-events)
> RoLLodeQc utility to fetch user events.

## Install
```
$ npm install --save rollodeqc-gh-user-events
```

## Usage
```js
const rollodeqcGhUserEvents = require('rollodeqc-gh-user-events')

rollodeqcGhUserEvents('unicorns')
//=> 'unicorns & rainbows'
```

## API
### rollodeqcGhUserEvents(input, [options])
#### input
Type: `string`

Lorem ipsum.

#### options
##### foo
Type: `boolean`<br>
Default: `false`

Lorem ipsum.

## CLI
```
$ npm install --global rollodeqc-gh-user-events
```

```
$ rollodeqc-gh-user-events --help

  Usage
    rollodeqc-gh-user-events [input]

  Options
    --foo  Lorem ipsum. [Default: false]

  Examples
    $ rollodeqc-gh-user-events
    unicorns & rainbows
    $ rollodeqc-gh-user-events ponies
    ponies & rainbows
```


## License
AGPL-v3 © [Robin Millette](http://robin.millette.info)
