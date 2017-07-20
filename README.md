# Console-hijack
[![Build Status](https://travis-ci.org/alanguir/console-hijack.svg?branch=master)](https://travis-ci.org/alanguir/console-hijack)

Intercepting and modifying common console printing methods in the browser. Why? To receive callback events when methods like `console.log` or `console.error` are called, and to mute native console methods (like log) in production.

## Installation

> NOTE: This module is still under development! Use in production at your own risk!

```
npm install console-hijack
```

...Then Include `dist/console-hijack.js` in your project. See examples for more info.

## Usage

Including this script on your page automatically hijacks the following console methods: [LOG, INFO, WARN, ERROR, TRACE];

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

Set the log level to mute everything below that level. For example, setting the log level to WARN will mute LOG and INFO. The default level is LOG

```
console.hijack.level = console.hijack.WARN
```

#### Stop/Start

The console object can be restored by calling `console.hijack.stop()`. No more events will be fired and the previously intercepted methods will be returned to their original state. Resume hijacking by calling `console.hijack.start()`
