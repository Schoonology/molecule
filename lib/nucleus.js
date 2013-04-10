//
// # Nucleus
//
// A Nucleus is the "core" of each Atom, responsible for receiving messages from other Atoms' Electrons, responding in
// kind.
//
var debug = require('debug')('molecule:Nucleus')
  , mi = require('mi')
  , shuttle = require('shuttle')
  , Field = require('./field')

//
// ## Nucleus `Nucleus(obj)`
//
// Creates a new instance of Nucleus with the following options:
//
function Nucleus(obj) {
  if (!(this instanceof Nucleus)) {
    return new Nucleus(obj)
  }

  obj = obj || {}

  shuttle.RequestHandler.call(this, obj)

  this.type = obj.type
  this.url = null

  this.on('ping', function (data, callback) {
    callback(null, Date.now())
  })
}
mi.extend(Nucleus, shuttle.RequestHandler)

//
// ## bind `bind(options)`
//
// TODO: Description.
//
Nucleus.prototype.bind = bind
Nucleus.prototype.listen = bind
function bind(options) {
  var self = this
    , opts = options || {}
    , url = opts.url

  if (Array.isArray(options)) {
    options.forEach(function (item) {
      self.bind(item)
    })
    return self
  }

  if (!url) {
    debug('Invalid bind options: %s', JSON.stringify(options))
    return self
  }

  shuttle.RequestHandler.prototype.listen.call(self, {
    url: url
  })

  self.url = url

  Field.sharedField.emit('up', {
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
Nucleus.prototype.close = close
function close() {
  var self = this

  shuttle.RequestHandler.prototype.close.call(self)

  if (!self.url) {
    return
  }

  Field.sharedField.emit('down', {
    name: self.type,
    url: self.url
  })

  return self
}

module.exports = Nucleus
