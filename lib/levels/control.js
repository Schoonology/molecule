//
// # Control
//
var debug = require('debug')('spaceage:Control')
  , shuttle = require('shuttle')
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
// ## prepare `prepare()`
//
// TODO: Description.
//
Control.prototype.prepare = prepare
function prepare() {
  var self = this

  self._radio.on('remote.up', function (data) {
    var emitter

    if (self._has(data)) {
      return
    }

    self._verify(data)
  })
  self._radio.on('remote.down', function (data) {
    if (self._has(data)) {
      return
    }

    self._verify(data)
  })

  // HACK?
  if (self.config.url) {
    self.provide()
      .handle('remote.up', function (data, callback) {
        self._add(data)
        self._radio.emit('remote.up', data)
      })
      .handle('remote.down', function (data, callback) {
        self._remove(data)
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
    self._verifySeedData({ db: db })
  })

  if (self.config.seed) {
    self._verifySeedData({ db: self.config.seed })
  }

  return self
}

//
// ## _verify `_verify(options)`
//
// Verifies that **options.name** is available via **options.url**, updating the internal URL records appropriately.
//
Control.prototype._verify = _verify
function _verify(options) {
  var self = this
    , opts = options || {}
    , name = opts.name || null
    , url = opts.url || null
    , emitter

  if (!name || !url) {
    return
  }

  emitter = shuttle.createRequestEmitter({
    timeout: 2500, // TODO
    retries: 1
  })

  emitter.connect(url)
  emitter.emit('ping', null, function (err, data) {
    if (err) {
      debug('Verification failed for %s, URL %s, with: %s', name, url, String(err.message || err))
      self._removeAndNotify({ name: name, url: url })
      return
    }

    // TODO - Care about data.
    self._addAndNotify({ name: name, url: url })
  })

  return self
}

//
// ## _verifySeedData `_verifySeedData(options)`
//
// Verifies all seed data in **options.db**.
//
Control.prototype._verifySeedData = _verifySeedData
function _verifySeedData(options) {
  var self = this
    , opts = options || {}
    , db = opts.db || {}

  Object.keys(db).forEach(function (name) {
    var arr = db[name]

    if (!Array.isArray(arr)) {
      debug('Bad value in seed db: %@', arr)
    }

    arr.forEach(function (url) {
      self._verify({ name: name, url: url })
    })
  })

  return self
}

//
// ## _addAndNotify `_addAndNotify(options)`
//
// Adds **options.url** as an available URL for **options.name**, notifying via the shared Radio if this is a new URL.
//
Control.prototype._addAndNotify = _addAndNotify
function _addAndNotify(options) {
  var self = this
    , opts = options || {}
    , name = opts.name || null
    , url = opts.url || null

  if (!name || !url) {
    return
  }

  if (self._add({ name: name, url: url })) {
    Radio.sharedRadio.emit('up', { name: name, url: url })
  }

  return self
}

//
// ## _removeAndNotify `_removeAndNotify(options)`
//
// Removes **options.url** as an available URL for **options.name**, notifying via the shared Radio if this is a
// newly-removed URL.
//
Control.prototype._removeAndNotify = _removeAndNotify
function _removeAndNotify(options) {
  var self = this
    , opts = options || {}
    , name = opts.name || null
    , url = opts.url || null

  if (!name || !url) {
    return
  }

  if (self._remove({ name: name, url: url })) {
    Radio.sharedRadio.emit('down', { name: name, url: url })
  }

  return self
}

//
// ## _add `_add(options)`
//
// Adds **options.url** as an available URL for **options.name**. Idempotent; only adds to the set if it's not present.
//
// Returns true if the URL was added, false otherwise.
//
Control.prototype._add = _add
function _add(options) {
  var self = this
    , opts = options || {}
    , name = opts.name || null
    , url = opts.url || null
    , arr

  if (!name || !url) {
    return false
  }

  arr = self._urlDb[name]

  if (!arr) {
    arr = self._urlDb[name] = []
  }

  if (self._has({ name: name, url: url })) {
    return false
  }

  debug('Adding URL for %s: %s', name, url)

  arr.push(url)
  return true
}

//
// ## _remove `_remove(options)`
//
// Removes **options.url** as an available URL for **options.name**. Idempotent; only removes from the set if present.
//
// Returns true if the URL was removed, false otherwise.
//
Control.prototype._remove = _remove
function _remove(options) {
  var self = this
    , opts = options || {}
    , name = opts.name || null
    , url = opts.url || null
    , arr

  if (!name || !url) {
    return false
  }

  arr = self._urlDb[name]

  if (!arr || !self._has({ name: name, url: url })) {
    return false
  }

  debug('Removing URL for %s: %s', name, url)

  arr.splice(arr.indexOf(url), 1)
  return true
}

//
// ## _has `_has(options)`
//
// Returns true if **options.url** is known to be an available URL for **options.name**, false otherwise.
//
Control.prototype._has = _has
function _has(options) {
  var self = this
    , opts = options || {}
    , name = opts.name || null
    , url = opts.url || null
    , arr

  if (!name || !url) {
    return false
  }

  arr = self._urlDb[name]

  if (!arr) {
    return false
  }

  return arr.indexOf(url) !== -1
}

module.exports = Control
