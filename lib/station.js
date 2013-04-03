//
// # Station
//
var debug = require('debug')('spaceage:Station')
  , Level = require('./level')

//
// ## Station `Station(obj)`
//
// Creates a new instance of Station with the following options:
//
//  * `control` the Control instance to use.
//
function Station(obj) {
  if (!(this instanceof Station)) {
    return new Station(obj)
  }

  debug('New Station.')

  this.external = {}
  this.levels = []

  if (obj) {
    this.load(obj)
  }
}

// TODO: Real names.
Station.appname = process.env.APP_NAME || 'Spaceage'

//
// ## load `load([manifest])`
//
// Synchronously loads all modules specified by **manifest**, falling back to settings discovered via `rc`. `load` can
// be called multiple times safely; the sum of all modules from all manifests will be loaded.
//
Station.prototype.load = load
function load(manifest) {
  var self = this
    , levels

  manifest = manifest || self.constructor.loadDefaults()
  self.external = manifest.external || {}
  levels = manifest.levels || []

  debug('Loading manfest: %s', JSON.stringify(self.config))

  levels.forEach(function (obj) {
    var LevelCtor

    if (typeof obj !== 'object') {
      debug('Invalid value for level:', obj)
      return
    }

    LevelCtor = Level.loadLevel(obj.src)

    if (typeof LevelCtor !== 'function') {
      debug('Invalid result for level %s:', obj.src, LevelCtor)
      return
    }

    self.levels.push(new LevelCtor(obj))
  })

  return self
}

//
// ## loadDefaults `Station.loadDefaults()`
//
// Synchronously loads the Station's configuration settings. Called manually unless a configuration is not provided to
// the Station constructor, at which point it's called automatically as a fallback.
//
Station.loadDefaults = loadDefaults
function loadDefaults() {
  var cls = this

  debug('Loading default configuration.')

  try {
    return require('rc')(cls.appname, require('localrc')(cls.appname, {}))
  } catch (e) {
    // Ignore. We shouldn't try to provide an actual fallback at this point.
    return {}
  }
}

//
// ## start `start()`
//
// Coordinates the startup of all Levels loaded into this Station previously.
//
Station.prototype.start = start
function start() {
  var self = this

  self.levels.forEach(function (level) {
    if (typeof level.prepare === 'function') {
      level.prepare()
    }
  })

  self.levels.forEach(function (level) {
    if (typeof level.attach === 'function') {
      level.attach(self.external)
    }
  })

  self.levels.forEach(function (level) {
    if (typeof level.start === 'function') {
      level.start()
    }
  })

  return self
}

//
// ## destroy `destroy()`
//
// Destroys the Station _and everything in it_.
//
Station.prototype.destroy = destroy
function destroy() {
  var self = this

  self.levels.forEach(function (level) {
    level.destroy()
  })
}

module.exports = Station
