var trackable = require('../'),
    RemoteTracker = require('../lib/receiver/RemoteTracker');

var tracker = new trackable.Tracker({
  eventName: 'trackable',
  verbose: true,
  emitDefaultKeys: true,
  receive: {
    port: 8671
  },
  receiver: new RemoteTracker({
    host: '127.0.0.1',
    port: 8672
  })
});
