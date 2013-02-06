var trackable = require('../'),
    RemoteTracker = require('../lib/receiver/RemoteTracker')


var tracker = new trackable.Tracker({
  eventName: 'trackable',
  verbose: true,
  emitDefaultKeys: true,
  receiver: new RemoteTracker({
    host: '127.0.0.1',
    port: 8671
  })
});

setInterval(function() {
  process.emit('trackable', {sweet: 'sugar'});
},0);
