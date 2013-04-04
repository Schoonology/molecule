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
}
Level.inherit(ExampleLevel, 'example')

//
// ## prepare `prepare()`
//
// TODO: Description.
//
ExampleLevel.prototype.prepare = prepare
function prepare() {
  var self = this

  self.logger = self.require('core.log').expect('info')

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

  setInterval(function () {
    self.logger.info('Started and properly-connected.', console.error)
  }, 1000)

  return self
}

module.exports = ExampleLevel
