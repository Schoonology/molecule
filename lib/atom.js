//
// # Atom
//
// Atoms represent and are responsible for one type of message within the system.
//
var path = require('path')
  , debug = require('debug')('molecule:Atom')
  , mi = require('mi')
  , Electron = require('./electron')
  , Nucleus = require('./nucleus')
  , Field = require('./field')

//
// ## Atom `Atom(obj)`
//
// Creates a new instance of Atom with the following options:
//
function Atom(obj) {
  if (!(this instanceof Atom)) {
    return new Atom(obj)
  }

  obj = obj || {}

  if (obj.type) {
    this.type = obj.type
  }

  debug('New Atom. Configuration: %s', JSON.stringify(obj))

  this.nucleus = null
  this.electrons = []

  if (this.type) {
    this.createNucleus(this.type)
  }
}

//
// ## inherit `Atom.inherit(ctor, type)`
//
// A wrapper around `mi` to set both the inherited prototype, **ctor**, and the **type** at the same time.
//
Atom.inherit = inherit
function inherit(ctor, type) {
  var cls = this

  mi.inherit(ctor, cls)
  ctor.prototype.type = type
  Atom._ctorCache[type] = ctor

  return cls
}

// An internal cache of Atom constructor functions. Primarily used for _pre-caching_ builtins.
Atom._ctorCache = {}

//
// ## loadAtom `Atom.loadAtom(options)`
//
// Internal use only.
//
// Synchronously loads a single Atom constructor from **options.type**, falling back to loading from **options.path**
// upon failure.
//
Atom.loadAtom = loadAtom
function loadAtom(options) {
  var cls = this
    , opts = options || {}
    , type = opts.type
    , path = opts.path
    , AtomCtor

  if (type) {
    AtomCtor = Atom._ctorCache[type]
  }

  if (!AtomCtor && path) {
    AtomCtor = Atom._ctorCache[path]

    if (AtomCtor === undefined) {
      try {
        AtomCtor = require(path)
        Atom._ctorCache[path] = AtomCtor || null
      } catch (e) {
        AtomCtor = null
      }
    }
  }

  return AtomCtor
}

//
// ## prepare `prepare()`
//
// Step two of a Atom's lifecycle, for `require`-ing and `provide`-ing Electrons and Nuclei.
//
Atom.prototype.prepare = prepare
function prepare() {
  var self = this

  // To be overridden.
  debug('Preparing.')

  return self
}

//
// ## attach `attach(options)`
//
// Internal use only.
//
// Step three of a Atom's lifecycle, for binding Electrons and Nuclei.
//
Atom.prototype.attach = attach
function attach(options) {
  var self = this
    , opts = options || {}
    , exports = opts.exports
    , imports = opts.imports

  if (exports && exports(self.type)) {
    self.nucleus.bind(exports(self.type))
  }

  if (imports) {
    self.electrons.forEach(function (electron) {
      var locs = imports(electron.type)
      if (locs) {
        electron.connect(locs)
      }
    })
  }

  return self
}

//
// ## start `start()`
//
// Step four of a Atom's lifecycle, for beginning actual work now that Nuclei have been `open`-ed.
//
Atom.prototype.start = start
function start() {
  var self = this

  // To be overridden.
  debug('Starting.')

  return self
}

//
// ## destroy `destroy()`
//
// Destroys the Atom _and everything in it_.
//
Atom.prototype.destroy = destroy
function destroy() {
  var self = this

  debug('Destroying.')

  // TODO: Create a `detach` method?

  if (self.nucleus) {
    self.nucleus.close()
  }

  self.electrons.forEach(function (electron) {
    electron.close()
  })

  return self
}

//
// ## require `require(type, methods)` Also: `createElectron`
//
// Synchronously provides an Electron for `launch`-ing **type** payloads. If provided, all **methods** will be
// `expect`-ed of the returned Electron.
//
// Returns an Electron.
//
Atom.prototype.require = _require
Atom.prototype.createElectron = _require
function _require(type, methods) {
  var self = this
    , electron

  debug('Creating Electron for %s.', JSON.stringify(type))

  electron = new Electron({
    type: type
  })

  self.electrons.push(electron)

  return electron
}

//
// ## provide `provide(type, obj)` Also: `createNucleus`
//
// Synchronously provides an Nucleus expected to handle **type** payloads. If provided, all methods of **obj** will be
// used to handle similarly-named payloads from connected Electrons.
//
// Returns an Nucleus.
//
Atom.prototype.provide = provide
Atom.prototype.createNucleus = provide
function provide(type, obj) {
  var self = this
    , nucleus

  if (self.nucleus) {
    return self.nucleus
  }

  debug('Creating Nucleus for %s.', JSON.stringify(type))

  nucleus = new Nucleus({
    type: type
  })

  self.nucleus = nucleus

  return nucleus
}

module.exports = Atom
