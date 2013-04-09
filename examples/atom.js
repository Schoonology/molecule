//
// # ExampleAtom
//
// TODO: Description.
//
var Atom = require('../').Atom

//
// ## ExampleAtom `ExampleAtom(obj)`
//
// Creates a new instance of ExampleAtom with the following options:
//
function ExampleAtom(obj) {
  if (!(this instanceof ExampleAtom)) {
    return new ExampleAtom(obj)
  }

  obj = obj || {}

  Atom.call(this, obj)
}
Atom.inherit(ExampleAtom, 'example')

//
// ## prepare `prepare()`
//
// TODO: Description.
//
ExampleAtom.prototype.prepare = prepare
function prepare() {
  var self = this

  self.logger = self.require('core.log').expect('info')

  return Atom.prototype.prepare.call(this)
}

//
// ## start `start()`
//
// TODO: Description.
//
ExampleAtom.prototype.start = start
function start() {
  var self = this

  setInterval(function () {
    self.logger.info('Started and properly-connected.', console.error)
  }, 1000)

  return self
}

module.exports = ExampleAtom
