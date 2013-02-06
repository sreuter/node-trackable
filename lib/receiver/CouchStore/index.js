var cradle = require('cradle');

function CouchStore(opts) {

  var self = this;

  opts = opts || {};

  this.db = new(cradle.Connection)().database('trackable');

  return this;

}

module.exports = CouchStore;

CouchStore.prototype.emit = function(event, cb) {
  var self = this;
  self.db.save(event, cb);
}
