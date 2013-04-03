//
// # Dock
//
// A Dock is a virtual "receiving bay" for messages sent by LaunchPads.
//
var debug = require('debug')('spaceage:Dock')
  , shuttle = require('shuttle')
  , Radio = require('./radio')

//
// ## Dock `Dock(obj)`
//
// Creates a new instance of Dock with the following options:
//
function Dock(obj) {
  if (!(this instanceof Dock)) {
    return new Dock(obj)
  }

  obj = obj || {}

  this.type = obj.type
  this.url = null
  this._handler = shuttle.createRequestHandler()
}

//
// ## open `open(options)`
//
// TODO: Description.
//
Dock.prototype.open = open
function open(options) {
  var self = this
    , opts = options || {}
    , url = opts.url

  self._handler.listen({
    url: url
  })
  self.url = url

  Radio.sharedRadio.emit('up', {
    name: self.type,
    url: self.url
  })

  return self
}

//
// ## close `close()`
//
// TODO: Description.
//
Dock.prototype.close = close
function close() {
  var self = this

  if (!self.url) {
    return
  }

  self._handler.close()

  Radio.sharedRadio.emit('down', {
    name: self.type,
    url: self.url
  })

  return self
}

//
// ## handle `handle(name, fn)`
//
// TODO: Description.
//
Dock.prototype.handle = handle
function handle(name, fn) {
  var self = this

  self._handler.on(name, fn)

  return self
}

//
// ## expect `expect(name, callback)`
//
// TODO: Real name.
// TODO: Description.
//
Dock.prototype.expect = expect
function expect(name, callback) {
  var self = this

  // TODO: Where do errors come into play?
  // TODO: This name is confusable with `LaunchPad.expect`.

  self._handler.once(name, function (payload) {
    callback(null, payload)
  })

  return self
}

module.exports = Dock
