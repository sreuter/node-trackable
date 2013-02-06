var trackable = require('../'),
    CouchStore = require('../lib/receiver/CouchStore')

var tracker = new trackable.Tracker({
  eventName: 'trackable',
  verbose: true,
  emitDefaultKeys: true,
  receiver: new CouchStore()
});

setInterval(function() {
  process.emit('trackable', {sweet: 'sugar'});
},0);
