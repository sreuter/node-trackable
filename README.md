# node-trackable (W.I.P)

## Purpose

A simple, modular node.js module for distributed app usage tracking.

The interface leverages the global process.EventEmitter to simplify implementations and to reduce the risk of side-effects caused by tracking. You can safely disable or completly remove the tracker, without the need to remove the code using it.

It comes with a *Memory*, *CouchDB* & *Remote* "receiver".

## Current status

This module is not battle-proven yet and to be considered as alpha.

## Features

- Distributable (Send events from one tracker instance to another over the network)
- Modular (write your own event store/receiver!)

## Example

### Local example

#### 1. Start a server like this:

```javascript
var trackable = require('node-trackable'),
    repl = require('repl'),
    http = require('http');

var tracker = new trackable.Tracker({
  eventName: 'trackable',
  verbose: true,
  emitDefaultKeys: true
});

http.createServer(function(req, res) {
  if(req.url === '/' && req.method.toLowerCase() === 'get') {

    process.emit('trackable', {
      type: 'pageview_home',
      ip: req.connection.remoteAddress
    });

    res.writeHead(200, {'content-type': 'text/html'});
    res.end('This request has been tracked.');
  }
}).listen(8000);

repl.start({
  prompt: "REPL> ",
  input: process.stdin,
  output: process.stdout
}).context.events = tracker.receiver.store;
```

#### 2. Visit http://youip:8000/ and see events arrive :-)

```javascript
[Tracker] Event received: { type: 'pageview_home', ip: '127.0.0.1', _ts: 1360188808356 }
[Tracker] eventCount: 1
[Tracker] receiverErrorCount: 0
REPL> console.log(events);
[ { type: 'pageview_home', ip: '127.0.0.1', _ts: 1360188808356 } ]
```

### Distributed example



# API

```javascript
var tracker = new trackable.Tracker({
  eventName: 'trackable',
  verbose: false,
  emitDefaultKeys: true
  receive: {
    port: 8000
  },
  receiver: new MemoryStore(),
  verifyEmit = false;
})
```

## Receivers

### Memory

### CouchDB

### Remote

## Changelog

### v0.0.1

Initial commit

### TODO

- Test what happens if you modify event object after emitting.
- Implement (de-)fragmentation of large udp packets (remote sender/receiver).
- Write documentation for trackable.Tracker() options

### License

Trackable is licensed under the MIT license.

### Credits

- Commit code and get featured here ;-)