//
// # Electron
//
// A Electron is the origin of all messages to other Atoms, sent to connected Nuclei.
//
var debug = require('debug')('molecule:Electron')
  , mi = require('mi')
  , shuttle = require('shuttle')
  , Field = require('./field')

//
// ## Electron `Electron(obj)`
//
// Creates a new instance of Electron with the following options:
//
function Electron(obj) {
  if (!(this instanceof Electron)) {
    return new Electron(obj)
  }

  obj = obj || {}

  shuttle.RequestEmitter.call(this, obj)

  this.type = obj.type
  this.urls = []

  this._initField()

  // HACK - With this (hopefully small) internal queue, we can buffer messages sent before the _first_ connection, a
  // feature lacking from Shuttle & Co.
  this._buffer = []
}
mi.extend(Electron, shuttle.RequestEmitter)

//
// ## _initField `_initField()`
//
// TODO: Description.
//
Electron.prototype._initField = _initField
function _initField() {
  var self = this

  Field.sharedField.on('up', function (data) {
    if (self.type === data.name) {
      self.connect({
        url: data.url
      })
    }
  })

  return self
}

//
// ## connect `connect(options)`
//
// TODO: Description.
//
Electron.prototype.connect = connect
function connect(options) {
  var self = this
    , opts = options || {}
    , url = opts.url

  if (Array.isArray(options)) {
    options.forEach(function (item) {
      self.connect(item)
    })
    return self
  }

  if (!url) {
    debug('Invalid connect options: %s', JSON.stringify(options))
    return self
  }

  shuttle.RequestEmitter.prototype.connect.call(self, {
    url: url
  })

  self.urls.push(url)

  if (self._buffer.length) {
    self._buffer.forEach(function (obj) {
      self.emit(obj.name, obj.payload, obj.callback)
    })
    self._buffer = []
  }

  return self
}

//
// ## close `close()`
//
// TODO: Description.
//
Electron.prototype.close = close
function close() {
  var self = this

  shuttle.RequestEmitter.prototype.close.call(self)

  if (!self.urls.length) {
    return
  }

  self.urls = []

  return self
}

//
// ## emit `emit(name, payload, [callback])`
//
// TODO: Description.
//
Electron.prototype.emit = emit
function emit(name, payload, callback) {
  var self = this

  if (!self.urls.length) {
    self._buffer.push({
      name: name,
      payload: payload,
      callback: callback
    })
    return
  }

  shuttle.RequestEmitter.prototype.emit.call(self, name, payload, callback)

  return self
}

//
// ## expect `expect(name)`
//
// TODO: Description.
//
Electron.prototype.expect = expect
function expect(name) {
  var self = this

  self[name] = function (payload, callback) {
    return self.emit(name, payload, callback)
  }

  return self
}

module.exports = Electron
