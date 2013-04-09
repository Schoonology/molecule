//
// # LogAtom
//
// TODO: Description.
//
var Atom = require('../atom')

//
// ## LogAtom `LogAtom(obj)`
//
// Creates a new instance of LogAtom with the following options:
//
function LogAtom(obj) {
  if (!(this instanceof LogAtom)) {
    return new LogAtom(obj)
  }

  obj = obj || {}

  Atom.call(this, obj)
}
Atom.inherit(LogAtom, 'core.log')

//
// ## prepare `prepare()`
//
// TODO: Description.
//
LogAtom.prototype.prepare = prepare
function prepare() {
  var self = this

  self.nucleus.on('info', self.info)

  return Atom.prototype.prepare.call(this)
}

//
// ## info `info(payload, callback)`
//
// TODO: Description.
//
LogAtom.prototype.info = info
function info(payload, callback) {
  var self = this

  console.info(payload)

  return self
}

module.exports = LogAtom
