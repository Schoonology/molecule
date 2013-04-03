//
// # Level
//
// TODO: Description.
//
var path = require('path')
  , debug = require('debug')('spaceage:Level')
  , mi = require('mi')
  , LaunchPad = require('./launchpad')
  , Dock = require('./dock')
  , Radio = require('./radio')

//
// ## Level `Level(obj)`
//
// Creates a new instance of Level with the following options:
//
function Level(obj) {
  if (!(this instanceof Level)) {
    return new Level(obj)
  }

  obj = obj || {}

  this.config = obj

  debug('New Level. Configuration: %s', JSON.stringify(this.config))

  this.dock = null
  this.pads = []

  // this.radio = new Radio()
  // // TODO: Configurable.
  // this.radio.tune({
  //   out: {
  //     url: 'inproc:///tmp/spaceage-radio'
  //   },
  //   in: {
  //     url: 'inproc:///tmp/spaceage-radio'
  //   }
  // })
}
Level.inherit = mi.inherit

// An internal cache of Level constructor functions. Primarily used for _pre-caching_ builtins.
Level._ctorCache = {}

//
// ## loadLevel `Level.loadLevel(src)`
//
// Internal use only.
//
// Synchronously loads a single Level constructor from **src**.
//
Level.loadLevel = loadLevel
function loadLevel(src) {
  var cls = this
    , LevelCtor

  if (!src) {
    return null
  }

  LevelCtor = Level._ctorCache[src]

  if (!LevelCtor) {
    try {
      LevelCtor = require(path.resolve(path.dirname(require.main.filename), src))

      Level._ctorCache[src] = LevelCtor
    } catch (e) {
      LevelCtor = null
    }
  }

  return LevelCtor
}

//
// ## registerBuiltin `Level.registerBuiltin(src, LevelCtor)`
//
// Internal use only.
//
// Synchronously pre-caches the builtin **LevelCtor** as loadable by subsequent calls to `loadLevel` with **src**.
//
Level.registerBuiltin = registerBuiltin
function registerBuiltin(src, LevelCtor) {
  var cls = this

  Level._ctorCache[src] = LevelCtor

  return cls
}

//
// ## prepare `prepare()`
//
// Step two of a Level's lifecycle, for `require`-ing and `provide`-ing LaunchPads and Docks.
//
Level.prototype.prepare = prepare
function prepare() {
  var self = this

  // To be overridden.
  debug('Preparing.')

  return self
}

//
// ## attach `attach(external)`
//
// Step three of a Level's lifecycle, for `open`-ing LaunchPads and Docks.
//
Level.prototype.attach = attach
function attach(external) {
  var self = this

  debug('Attaching with config: %s and external: %s', JSON.stringify(self.config), JSON.stringify(external))
  debug('Dock: %s', self.dock)
  debug('Pads: %s', self.pads)

  if (self.dock) {
    self.dock.open(self.config.url)
  }

  self.pads.forEach(function (pad) {
    pad.open(external[pad.type])
  })

  return self
}

//
// ## start `start()`
//
// Step four of a Level's lifecycle, for beginning actual work now that Docks have been `open`-ed.
//
Level.prototype.start = start
function start() {
  var self = this

  // To be overridden.
  debug('Starting.')

  return self
}

//
// ## destroy `destroy()`
//
// Destroys the Level _and everything in it_.
//
Level.prototype.destroy = destroy
function destroy() {
  var self = this

  debug('Destroying.')

  // TODO: Create a `detach` method?

  if (self.dock) {
    self.dock.close()
  }

  self.pads.forEach(function (pad) {
    pad.close()
  })

  return self
}

//
// ## require `require(type, methods)` Also: `createLaunchPad`
//
// Synchronously provides a LaunchPad for `launch`-ing **type** payloads. If provided, all **methods** will be
// `expect`-ed of the returned LaunchPad.
//
// Returns a LaunchPad.
//
Level.prototype.require = _require
Level.prototype.createLaunchPad = _require
function _require(type, methods) {
  var self = this
    , pad

  debug('Creating LaunchPad for %s.', JSON.stringify(type))

  pad = new LaunchPad({
    type: type
  })

  self.pads.push(pad)

  return pad
}

//
// ## provide `provide(type, obj)` Also: `createDock`
//
// Synchronously provides a Dock expected to handle **type** payloads. If provided, all methods of **obj** will be used
// to handle similarly-named payloads from connected LaunchPads.
//
// Returns a Dock.
//
Level.prototype.provide = provide
Level.prototype.createDock = provide
function provide(type, obj) {
  var self = this
    , dock

  debug('Creating Dock for %s.', JSON.stringify(type))

  dock = new Dock({
    type: type
  })

  if (dock) {
    self.dock = dock
  }

  return dock
}

module.exports = Level