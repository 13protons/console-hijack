# Browser Streams
[![Build Status](https://travis-ci.org/alanguir/streams.svg?branch=master)](https://travis-ci.org/alanguir/streams)

Implementing the [Nodejs Stream API](https://nodejs.org/api/stream.html) for the browser. The goal of this work is for easy future interoperability between browser based clients and Node based servers, with a specific focus on supporting many different protocols to bridge between a browser stream and server stream.

## Installation

> NOTE: This module is still under development! Use in production at your own risk!
> All features for writeable streams came with v0.1.0.
> Targeting v0.2.0 for full readable implementation

```
npm install broswer-streams
```

## Usage

`browser-streams` is meant to be used in a web browser. Here's a simple example of abstracting the console as a stream, so log messages are all sent at the end of each tick:

```
var writeable = Stream.writeable({highWaterMark: 20}, function (data){
  console.info(data.join(' '));
});

//later
writeable.write('A message to log soon');
```
