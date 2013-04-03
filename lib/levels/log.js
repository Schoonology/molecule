//
// # LogLevel
//
// TODO: Description.
//
var Level = require('../level')

//
// ## LogLevel `LogLevel(obj)`
//
// Creates a new instance of LogLevel with the following options:
//
function LogLevel(obj) {
  if (!(this instanceof LogLevel)) {
    return new LogLevel(obj)
  }

  obj = obj || {}

  Level.call(this, obj)
}
Level.inherit(LogLevel)
Level.registerBuiltin('core.log', LogLevel)

//
// ## prepare `prepare()`
//
// TODO: Description.
//
LogLevel.prototype.prepare = prepare
function prepare() {
  var self = this

  self.provide('log').handle('info', self.info)

  return Level.prototype.prepare.call(this)
}

//
// ## info `info(payload, callback)`
//
// TODO: Description.
//
LogLevel.prototype.info = info
function info(payload, callback) {
  var self = this

  console.info(payload)

  return self
}

module.exports = LogLevel
