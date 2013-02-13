var cradle = require('cradle');

function CouchStore(opts) {

  var self = this;

  opts = opts || {};

  self.uri = opts.uri || 'http://127.0.0.1',
  self.port = opts.port || 5984,
  self.user = opts.user || false,
  self.pass = opts.pass || false,
  self.name = opts.name || 'trackable'

  var cradle_opts = {};
  if(self.user && self.pass) {
    cradle_opts.auth = {
      username: self.user,
      password: self.pass
    }
  }

  this.db = new(cradle.Connection)(self.uri, self.port, cradle_opts).database(self.name);

  return this;

}

module.exports = CouchStore;

CouchStore.prototype.emit = function(event, cb) {
  var self = this;
  self.db.save(event, cb);
}
