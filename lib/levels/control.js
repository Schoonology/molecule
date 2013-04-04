//
// # Control
//
var debug = require('debug')('spaceage:Control')
  , Level = require('../level')
  , Radio = require('../radio')

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

  Level.call(this, obj)

  this.remote = null
  this._radio = new Radio()
  this._urlDb = {}
}
Level.inherit(Control, 'core.control')

//
// ## _addUrl `_addUrl(name, url)`
//
// TODO: Description.
//
Control.prototype._addUrl = _addUrl
function _addUrl(name, url) {
  var self = this
    , arr = self._urlDb[name]

  if (!arr) {
    arr = self._urlDb[name] = []
  }

  if (self._hasUrl(name, url)) {
    return
  }

  debug('Adding URL for %s: %s', name, url)

  arr.push(url)
}

//
// ## _removeUrl `_removeUrl(name, url)`
//
// TODO: Description.
//
Control.prototype._removeUrl = _removeUrl
function _removeUrl(name, url) {
  var self = this
    , arr = self._urlDb[name]

  if (!arr || !self._hasUrl(name, url)) {
    return
  }

  debug('Removing URL for %s: %s', name, url)

  arr.splice(arr.indexOf(url), 1)
}

//
// ## _hasUrl `_hasUrl(name, url)`
//
// TODO: Description.
//
Control.prototype._hasUrl = _hasUrl
function _hasUrl(name, url) {
  var self = this
    , arr = self._urlDb[name]

  if (!arr) {
    return false
  }

  return arr.indexOf(url) !== -1
}

//
// ## prepare `prepare()`
//
// TODO: Description.
//
Control.prototype.prepare = prepare
function prepare() {
  var self = this

  self._radio.on('remote.up', function (data) {
    if (self._hasUrl(data.name, data.url)) {
      return
    }

    self._addUrl(data.name, data.url)
    Radio.sharedRadio.emit('up', data)
  })
  self._radio.on('remote.down', function (data) {
    if (self._hasUrl(data.name, data.url)) {
      return
    }

    self._removeUrl(data.name, data.url)
    Radio.sharedRadio.emit('down', data)
  })

  // HACK?
  if (self.config.url) {
    self.provide()
      .handle('remote.up', function (data, callback) {
        self._addUrl(data.name, data.url)
        self._radio.emit('remote.up', data)
      })
      .handle('remote.down', function (data, callback) {
        self._removeUrl(data.name, data.url)
        self._radio.emit('remote.down', data)
      })
      .handle('remote.list', function (data, callback) {
        callback(null, self._urlDb)
      })
  }

  self.remote = self.require('core.control').expect('remote.up').expect('remote.down').expect('remote.list')

  Radio.sharedRadio.on('up', function (data) {
    self.remote['remote.up'](data)
  })
  Radio.sharedRadio.on('down', function (data) {
    self.remote['remote.down'](data)
  })

  return self
}

//
// ## start `start()`
//
// TODO: Description.
//
Control.prototype.start = start
function start() {
  var self = this

  if (self.config.remotes) {
    self.config.remotes.forEach(function (url) {
      self._radio.connect({
        url: url
      })
    })
  }

  if (self.config.public) {
    self._radio.listen({
      url: self.config.public
    })
    self._radio.connect({
      url: self.config.public
    })
  }

  self.remote['remote.list'](null, function (err, db) {
    Object.keys(db).forEach(function (name) {
      db[name].forEach(function (url) {
        self._addUrl(name, url)
        Radio.sharedRadio.emit('up', {
          name: name,
          url: url
        })
      })
    })
  })

  return self
}

module.exports = Control
