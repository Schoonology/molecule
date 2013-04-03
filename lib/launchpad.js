//
// # LaunchPad
//
// A LaunchPad is a virtual "origin planet" for messages sent to Docks.
//
var debug = require('debug')('spaceage:LaunchPad')
  , shuttle = require('shuttle')
  , Radio = require('./radio')

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
  this.urls = []
  this._emitter = shuttle.createRequestEmitter()

  this._initRadio()

  // HACK - With this (hopefully small) internal queue, we can buffer messages sent before the _first_ connection, a
  // feature lacking from Shuttle & Co.
  this._buffer = []
}

//
// ## _initRadio `_initRadio()`
//
// TODO: Description.
//
LaunchPad.prototype._initRadio = _initRadio
function _initRadio() {
  var self = this

  Radio.sharedRadio.on('up', function (data) {
    if (self.type === data.name) {
      self.open({
        url: data.url
      })
    }
  })

  return self
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
    , url

  if (Array.isArray(options)) {
    options.forEach(function (item) {
      self.open(item)
    })
  } else {
    url = options.url

    self._emitter.connect({
      url: url
    })
    self.urls.push(url)

    if (self._buffer.length) {
      self._buffer.forEach(function (obj) {
        self.launch(obj.name, obj.payload, obj.callback)
      })
      self._buffer = []
    }
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

  if (!self.urls.length) {
    return
  }

  self._emitter.close()
  self.urls = []

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

  if (!self.urls.length) {
    self._buffer.push({
      name: name,
      payload: payload,
      callback: callback
    })
    return
  }

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
