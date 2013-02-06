function MemoryStore(opts) {

  var self = this;

  opts = opts || {};

  this.store = [];

  return this;

}

module.exports = MemoryStore;

MemoryStore.prototype.emit = function(event, cb) {
  this.store.push(event);
  cb();
}