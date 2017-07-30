# Console-hijack
[![Build Status](https://travis-ci.org/alanguir/console-hijack.svg?branch=master)](https://travis-ci.org/alanguir/console-hijack)

Intercept and send events for console.log and friends in the browser. Why? To receive callback events when methods like `console.log` or `console.error` are called, and to mute native console methods (like log) in production.

## Installation

> NOTE: This module is still under development! Use in production at your own risk!

```
npm install console-hijack
```

...Then Include `dist/console-hijack-browser.min.js` in your project. See examples for more info.

## Usage

Including this script on your page automatically hijacks the following console methods: [LOG, INFO, WARN, ERROR];

To receive a callback for a given method, simply listen to it:

```
document.addEventListener('console.log', callback);
console.log('hi mom'); // will trigger callback, and log to console!
```

#### callback(payload)

The callback function is invoked with a payload that has the following signature:

```
{
  type: [String], // the method called, like 'console.log'
  messages: [Array] // an array of all arguments passed - `console.log('hi', 'mom')` becomes `['hi', 'mom']`
}
```

#### log level

Log level constants and log level state have been added to the native `console` object. To change levels that print to the console and fire events, set `console.LOG_LEVEL` to a `console.LOG_LEVELS` constant. Setting the log level will mute everything **below** that level. For example, setting the log level to WARN will mute LOG and INFO. The default level is LOG

```
console.LOG_LEVEL = console.LOG_LEVELS.WARN
```

The order of log leves is `[LOG, INFO, WARN, ERROR]`, with `ERROR` being the highest level and `LOG` being the lowest level.

#### Stop/Start

Any console method can be reverted to it's native behavior (no events, does not honor log levels) by calling `console.method.restore()`, for example: `console.log.restore()`.

Restored methods can be re-hijacked by calling their hijack method, for example you will start receiving events for a restored `console.log` by calling `console.log.hijack()`;
