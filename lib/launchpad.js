//
// # LaunchPad
//
// A LaunchPad is a virtual "origin planet" for messages sent to Docks.
//
var debug = require('debug')('spaceage:LaunchPad')
  , shuttle = require('shuttle')

//
// ## LaunchPad `LaunchPad(obj)`
//
// Creates a new instance of LaunchPad with the following options:
//
function LaunchPad(obj) {
  if (!(this instanceof LaunchPad)) {
    return new LaunchPad(obj)
  }

  obj = obj || {}

  this.type = obj.type
  this._emitter = shuttle.createRequestEmitter()
}

//
// ## open `open(options)`
//
// TODO: Description.
//
LaunchPad.prototype.open = open
function open(options) {
  var self = this
    , opts = options || {}

  if (Array.isArray(options)) {
    options.forEach(function (item) {
      self.open(item)
    })
  } else {
    self._emitter.connect(options)
  }

  return self
}

//
// ## close `close()`
//
// TODO: Description.
//
LaunchPad.prototype.close = close
function close() {
  var self = this

  self._emitter.close()

  return self
}

//
// ## launch `launch(name, payload, [callback])`
//
// TODO: Description.
//
LaunchPad.prototype.launch = launch
function launch(name, payload, callback) {
  var self = this

  self._emitter.emit(name, payload, callback)

  return self
}

//
// ## expect `expect(name)`
//
// TODO: Description.
//
LaunchPad.prototype.expect = expect
function expect(name) {
  var self = this

  self[name] = function (payload, callback) {
    return self.launch(name, payload, callback)
  }

  return self
}

module.exports = LaunchPad
