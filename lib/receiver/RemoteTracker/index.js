var dgram = require('dgram');

function RemoteTracker(opts) {

  var self = this;

  opts = opts || {};

  this.host = opts.host || 'localhost'
  this.port = opts.port || 8671

  this.cache = [];

  this.udp_client = dgram.createSocket("udp4");

  return this;

}

module.exports = RemoteTracker;

RemoteTracker.prototype.emit = function(event, cb) {
  var self = this;
  var message = new Buffer(JSON.stringify(event));
  self.udp_client.send(message, 0, message.length, this.port, this.host, cb);
}