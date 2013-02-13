var util = require('util'),
    MemoryStore = require('./receiver/MemoryStore'),
    dgram = require('dgram');

/*
    @TODO

    - Check max. udp size and implement (de-)fragmentation if necessary
    - Implement verified emits
    - Implement caching layer + auto-resubmit
    - alias process. to _p.

*/

exports.Tracker = function Tracker(opts) {

  var self = this;

  opts = opts || {};

  this.eventCounter = 0;
  this.eventName = opts.eventName || 'trackable';
  this.emitDefaultKeys = opts.emitDefaultKeys || false;
  this.receive = opts.receive || false;
  this.receiver = opts.receiver || new MemoryStore();
  this.receiverErrorCounter = 0;
  this.verifyEmit = false;  // Verify if trackable was succesfuly stored/transmitted
                            // (udp answer on trackable id to verify and clear
                            // event from local cache? maximum cache size?)

  process.on(this.eventName, function(event) {
    // Stringify Obj by default to snapshot actual data (Parse right before storing permanently)
    var eventObj = JSON.parse(JSON.stringify(event));
    if(self.emitDefaultKeys) {
      event.time = new Date().getTime();
    }
    self.eventCounter++;

    if(opts.verbose) {
      console.log('[Tracker] Event received: ' + util.inspect(event));
    };

    self.receiver.emit(event, function(er) {
      if(er) {
        self.receiverErrorCounter++
        console.log(er);
      }
    });

    if(opts.verbose) {
      console.log('[Tracker] eventCount: ' + self.eventCounter);
      console.log('[Tracker] receiverErrorCount: ' + self.receiverErrorCounter);
    }
  });

  if(self.receive) {
    var udp_server = dgram.createSocket("udp4");

    udp_server.on('listening', function() {
      var address = udp_server.address();
      console.log('[Tracker] Listening for remote events on ' +
        address.address + ':' + address.port);
    });

    udp_server.on('message', function(msg, rinfo) {
      console.log('[Tracker] received event from ' +
        rinfo.address + ':' + rinfo.port);
      process.emit(self.eventName, JSON.parse(msg));
    });

    udp_server.bind(self.receive.port);
  }

  return this;
};


// app.use(trackable.express(tracker)
exports.Tracker.prototype.express = function express () {

  var tracker = this;

  return function (req, res, next) {

    var trackables = {};
    var end = res.end;

    if(req._trackable) return next();

    req.on(tracker.eventName, function(trackableObj) {
      for(var i in trackableObj) {
        if(trackableObj.hasOwnProperty(i)) {
          trackables[i] = trackableObj[i];
        }
      }
    });

    // Proxy the real end function
    res.end = function(chunk, encoding) {
      // Do the work expected
      res.end = end;
      res.end(chunk, encoding);
      // Emit event to listener
      if(Object.keys(trackables).length > 0) {
        process.emit(tracker.eventName, trackables);
      }
    };

    next();

  };

};
