var util = require('util'),
    MemoryStore = require('./receiver/MemoryStore'),
    dgram = require('dgram');

/*
    @TODO
    
    - Check max. udp size and implement (de-)fragmentation if necessary
    - Implement verified emits
    - Implement caching layer + re(try/send)
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
  this.verbose = opts.verbose || false;
  this.verifyEmit = false;  // Verify if trackable was succesfuly stored/transmitted
                            // (udp answer on trackable id to verify and clear
                            // event from local cache? maximum cache size?)

  process.on(this.eventName, function(event) {
    // "Snapshot" event object
    var eventObj = JSON.parse(JSON.stringify(event));
    if(self.emitDefaultKeys) {
      event.time = new Date().getTime();
    }
    self.eventCounter++;

    if(self.verbose) {
      console.log('[Tracker] Event received: ' + util.inspect(event));
    };

    self.receiver.emit(event, function(er) {
      if(er) {
        self.receiverErrorCounter++
        console.error(er);
      }
    });

    if(self.verbose) {
      console.log('[Tracker] eventCount: ' + self.eventCounter);
      console.log('[Tracker] receiverErrorCount: ' + self.receiverErrorCounter);
    }
  });

  if(self.receive) {
    var udp_server = dgram.createSocket("udp4");

    udp_server.on('listening', function() {
      var address = udp_server.address();
      if(self.verbose) console.log('[Tracker] Listening for remote events on ' +
        address.address + ':' + address.port);
    });

    udp_server.on('message', function(msg, rinfo) {
      if(self.verbose) console.log('[Tracker] received event from ' +
        rinfo.address + ':' + rinfo.port);
      process.emit(self.eventName, JSON.parse(msg));
    });

    udp_server.bind(self.receive.port);
  }

  return this;
};


// app.use(trackable.express(tracker)
exports.Tracker.prototype.express = function express (opts) {

  var tracker = this;

  opts = opts || {};
  tracker.trackHttpDetails = opts.trackHttpDetails || true;
  tracker.trackCustom = opts.trackCustom;

  return function (req, res, next) {

    var trackable = {
      type: '',
      details: {},
      fail: ''
    };

    // Do nothing if trackable object is already attached on request
    if(req.trackable) return next();

    // Attach trackable object to request
    req.trackable = trackable;

    // Bind event handler to request object
    req.on(tracker.eventName, function(trackableObj) {
      for(var i in trackableObj) {
        if(trackableObj.hasOwnProperty(i)) {
          trackable[i] = trackableObj[i];
        }
      }
    });

    // Proxy the real end function

    var end = res.end;

    res.end = function(chunk, encoding) {

      // Do the work expected
      res.end = end;
      res.end(chunk, encoding);

      // Gather additional client information
      if(tracker.trackHttpDetails) {
        trackable.http = {
          method: req.method || '',
          url: req.url || '',
          params: req.params || [],
          agent:req.headers['user-agent'] || ''
        };
      }

      if(req.headers['x-forwarded-for']) {
        trackable.http.client_ip = req.headers['x-forwarded-for'];
      } else {
        trackable.http.client_ip = req.socket.remoteAddress || '';
      }

      if(typeof tracker.trackCustom === 'function') {
        tracker.trackCustom(req,res,trackable);
      }

      // Emit event to listener
      if(typeof trackable.type === 'string' && trackable.type.length > 0) {
        process.emit(tracker.eventName, trackable);
      }
    };

    next();

  };

};
