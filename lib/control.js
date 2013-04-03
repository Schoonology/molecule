//
// # Control
//
var Dock = require('./dock')
  , LaunchPad = require('./launchpad')
  , Radio = require('./radio')

//
// ## Control `Control(obj)`
//
// Creates a new instance of Control with the following options:
//
function Control(obj) {
  if (!(this instanceof Control)) {
    return new Control(obj)
  }

  obj = obj || {}

  this.docks = {}
  this.pads = {}

  this.radio = new Radio()
}

//
// ## provide `provide(type, obj)`
//
// TODO: Description.
//
// Returns the Dock responsible for **type**.
//
Control.prototype.provide = provide
function provide(type, obj) {
  var self = this
    , dock

  dock = new Dock()

  self.docks[type] = dock

  // TODO: At some point in the future, broadcast a new **type** Dock is available, and at what URL.
  // TODO: `provide` all methods and properties from **obj**.

  return dock
}

//
// ## demand `demand(type, methods)`
//
// TODO: Description.
//
// Returns the LaunchPad responsible for **type**.
//
Control.prototype.demand = demand
function demand(type, methods) {
  var self = this
    , pad

  pad = new LaunchPad()

  // TODO: At some point in the future, connect **pad** to all available **type** Docks, connecting and disconnecting as
  // they appear and disappear.
  // TODO: `expect` all **methods**.

  return pad
}

module.exports = Control
