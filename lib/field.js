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
}
mi.inherit(Field, shuttle.BroadcastHandler)

//
// ## listen `listen(options)`
//
// TODO: Description.
//
Field.prototype.listen = listen
function listen(options) {
  var self = this

  if (!options) {
    debug('Invalid listen options: %s', JSON.stringify(options))
    return self
  }

  if (Array.isArray(options)) {
    options.forEach(function (opt) {
      self.listen(opt)
    })
    return self
  }

  self._emitter.listen(options)

  return self
}

//
// ## connect `connect(options)`
//
// TODO: Description.
//
Field.prototype.connect = connect
function connect(options) {
  var self = this

  if (!options) {
    debug('Invalid connect options: %s', JSON.stringify(options))
    return self
  }

  if (Array.isArray(options)) {
    options.forEach(function (opt) {
      self.connect(opt)
    })
    return self
  }

  shuttle.BroadcastHandler.prototype.connect.call(self, options)

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

Field.sharedField = new Field()
process.on('exit', function () {
  Field.sharedField.destroy()
})

module.exports = Field
