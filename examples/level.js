//
// # ExampleLevel
//
// TODO: Description.
//
var Level = require('../').Level

//
// ## ExampleLevel `ExampleLevel(obj)`
//
// Creates a new instance of ExampleLevel with the following options:
//
function ExampleLevel(obj) {
  if (!(this instanceof ExampleLevel)) {
    return new ExampleLevel(obj)
  }

  obj = obj || {}

  Level.call(this, obj)

  this.logLevel = obj.level || 'info'
}
Level.inherit(ExampleLevel)
ExampleLevel.namespace = 'example'

//
// ## prepare `prepare()`
//
// TODO: Description.
//
ExampleLevel.prototype.prepare = prepare
function prepare() {
  var self = this

  self.logger = self.require('log').expect(self.logLevel)
  self.log = self.logger[self.logLevel]

  return Level.prototype.prepare.call(this)
}

//
// ## start `start()`
//
// TODO: Description.
//
ExampleLevel.prototype.start = start
function start() {
  var self = this

  self.log('Started and properly-connected.', console.error)

  return self
}

module.exports = ExampleLevel
