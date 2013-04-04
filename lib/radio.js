//
// # Radio
//
// A Radio is a virtual "origin" for broadcast messages and state updates.
//
var debug = require('debug')('spaceage:Radio')
  , mi = require('mi')
  , shuttle = require('shuttle')

//
// ## Radio `Radio(obj)`
//
// Creates a new instance of Radio with the following options:
//
function Radio(obj) {
  if (!(this instanceof Radio)) {
    return new Radio(obj)
  }

  obj = obj || {}

  this._emitter = shuttle.createBroadcastEmitter()
  shuttle.BroadcastHandler.call(this)

  // TODO
  if (obj) {
    this.tune(obj)
  }
}
mi.inherit(Radio, shuttle.BroadcastHandler)

//
// ## tune `tune(options)`
//
// TODO: Description.
//
Radio.prototype.tune = tune
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
Radio.prototype.listen = listen
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
Radio.prototype.emit = emit
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
Radio.prototype.destroy = destroy
function destroy() {
  var self = this

  self._emitter.close()
  self.close()

  return self
}

// TODO: Configurable.
Radio.sharedRadio = new Radio({
  'out': {
    url: 'inproc:///tmp/spaceage-radio-shared'
  },
  'in': {
    url: 'inproc:///tmp/spaceage-radio-shared'
  }
})
process.on('exit', function () {
  Radio.sharedRadio.destroy()
})

module.exports = Radio
