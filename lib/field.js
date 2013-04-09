//
// # Field
//
// A Field is a virtual "origin" for broadcast messages and state updates.
//
var debug = require('debug')('molecule:Field')
  , mi = require('mi')
  , shuttle = require('shuttle')

//
// ## Field `Field(obj)`
//
// Creates a new instance of Field with the following options:
//
function Field(obj) {
  if (!(this instanceof Field)) {
    return new Field(obj)
  }

  obj = obj || {}

  this._emitter = shuttle.createBroadcastEmitter()
  shuttle.BroadcastHandler.call(this)

  // TODO
  if (obj) {
    this.tune(obj)
  }
}
mi.inherit(Field, shuttle.BroadcastHandler)

//
// ## tune `tune(options)`
//
// TODO: Description.
//
Field.prototype.tune = tune
function tune(options) {
  var self = this
    , opts = options || {}

  if (opts.out) {
    self.listen(opts.out)
  }

  if (opts.in) {
    self.connect(opts.in)
  }

  return self
}

//
// ## listen `listen(options)`
//
// TODO: Description.
//
Field.prototype.listen = listen
function listen(options) {
  var self = this
    , opts = options || {}

  self._emitter.listen(opts)

  return self
}

//
// ## emit `emit(name, data)`
//
// TODO: Description.
//
Field.prototype.emit = emit
function emit(name, data) {
  var self = this

  if (name === 'newListener') {
    return shuttle.BroadcastHandler.prototype.emit.call(this, name, data)
  }

  debug('Broadcasting: %s - %s', name, JSON.stringify(data))
  self._emitter.emit(name, data)

  return self
}

//
// ## destroy `destroy()`
//
// TODO: Description.
//
Field.prototype.destroy = destroy
function destroy() {
  var self = this

  self._emitter.close()
  self.close()

  return self
}

// TODO: Configurable.
Field.sharedField = new Field({
  'out': {
    url: 'inproc:///tmp/molecule-radio-shared'
  },
  'in': {
    url: 'inproc:///tmp/molecule-radio-shared'
  }
})
process.on('exit', function () {
  Field.sharedField.destroy()
})

module.exports = Field
