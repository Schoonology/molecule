//
// # Molecule
//
var debug = require('debug')('molecule:Molecule')
  , Atom = require('./atom')

//
// ## Molecule `Molecule(obj)`
//
// Creates a new instance of Molecule with the following options:
//
function Molecule(obj) {
  if (!(this instanceof Molecule)) {
    return new Molecule(obj)
  }

  debug('New Molecule.')

  this.external = {}
  this.atoms = []

  if (obj) {
    this.load(obj)
  }
}

// TODO: Real names.
Molecule.appname = process.env.APP_NAME || 'Molecule'

//
// ## load `load([recipe])`
//
// Synchronously loads all atoms specified by **recipe**, falling back to settings discovered via `rc`. `load` can be
// called multiple times safely; the sum of all atoms from all recipes will be loaded.
//
Molecule.prototype.load = load
function load(recipe) {
  var self = this
    , atoms

  recipe = recipe || self.constructor.loadDefaults()
  self.external = recipe.external || {}
  atoms = recipe.atoms || {}

  debug('Loading recipe: %s', JSON.stringify(recipe))

  Object.keys(atoms).forEach(function (name) {
    var AtomCtor = Atom.loadAtom(name)

    if (typeof AtomCtor !== 'function') {
      debug('Invalid result for Atom %s:', name, AtomCtor)
      return
    }

    self.addAtom(new AtomCtor(atoms[name]))
  })

  return self
}

//
// ## loadDefaults `Molecule.loadDefaults()`
//
// Synchronously loads the Molecule's configuration settings. Called manually unless a configuration is not provided to
// the Molecule constructor, at which point it's called automatically as a fallback.
//
Molecule.loadDefaults = loadDefaults
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
// ## addAtom `addAtom(atom)`
//
// Synchronously adds **atom** to the set of Atoms managed by the Molecule. Callers should expect `atom.destroy` to be
// callable by the Molecule at some point in the future, and should not pass **atom** into any subsequent `addAtom`
// calls, neither for this Molecule nor any other.
//
Molecule.prototype.addAtom = addAtom
function addAtom(atom) {
  var self = this

  self.atoms.push(atom)

  return self
}

//
// ## start `start()`
//
// Coordinates the startup of all Atoms loaded into this Molecule previously.
//
Molecule.prototype.start = start
function start() {
  var self = this

  self.atoms.forEach(function (atom) {
    if (typeof atom.prepare === 'function') {
      atom.prepare()
    }
  })

  self.atoms.forEach(function (atom) {
    if (typeof atom.attach === 'function') {
      atom.attach(self.external)
    }
  })

  self.atoms.forEach(function (atom) {
    if (typeof atom.start === 'function') {
      atom.start()
    }
  })

  return self
}

//
// ## destroy `destroy()`
//
// Destroys the Molecule _and everything in it_.
//
Molecule.prototype.destroy = destroy
function destroy() {
  var self = this

  self.atoms.forEach(function (atom) {
    atom.destroy()
  })
}

module.exports = Molecule