//
// # Radio
//
// A Radio is a virtual "origin" for broadcast messages and state updates.
//
var shuttle = require('shuttle')

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

  this._transmitter = shuttle.createBroadcastHandler()
  this._receiver = shuttle.createRequestEmitter()
}

//
// ## tune `tune(options)`
//
// TODO: Description.
//
Radio.prototype.tune = tune
function tune(options) {
  var self = this
    , opts = options || {}

  if (opts.in) {
    this._receiver.listen(opts.in)
  }

  if (opts.out) {
    this._transmitter.connect(opts.out)
  }

  return self
}

module.exports = Radio
