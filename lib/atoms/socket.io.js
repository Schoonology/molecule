//
// # SocketIOLevel
//
// TODO: Description.
//
var Level = require('../level')

//
// ## SocketIOLevel `SocketIOLevel(obj)`
//
// Creates a new instance of SocketIOLevel with the following options:
//
function SocketIOLevel(obj) {
  if (!(this instanceof SocketIOLevel)) {
    return new SocketIOLevel(obj)
  }

  obj = obj || {}

  Level.call(this, obj)
}
Level.inherit(SocketIOLevel, 'core.socket.io')

//
// ## prepare `prepare()`
//
// TODO: Description.
//
SocketIOLevel.prototype.prepare = prepare
function prepare() {
  var self = this

  self.provide().handle('emit', function (data, callback) {
    // TODO: Passthrough.
    // TODO: Should specific RPCs be whitelisted to Socket.io clients?
  })

  return self
}

module.exports = SocketIOLevel
