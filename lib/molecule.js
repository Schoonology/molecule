//
// # Molecule
//
var debug = require('debug')('molecule:Molecule')
  , Atom = require('./atom')
  , Field = require('./field')
  , Recipe = require('./recipe')

//
// ## Molecule `Molecule(recipe)`
//
// Creates a new instance of Molecule from the passed-in Recipe (optional).
//
function Molecule(recipe) {
  if (!(this instanceof Molecule)) {
    return new Molecule(recipe)
  }

  debug('New Molecule.')

  this.recipe = null
  this.atoms = []

  if (recipe) {
    this.load(recipe)
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

  if (!recipe) {
    recipe = self.constructor.loadDefaults()
  }

  if (!recipe.field) {
    // The shared Field instance is vital enough that we want to provide as many fallback endpoints as we can,
    // ultimately falling back to throwing together a pid-based temp file.
    // TODO - Use loadDefaults()?
    // TODO - Windows and other non-/tmp systems.
    // TODO - Should this live in Recipe?
    recipe.field = {
      url: 'inproc:///tmp/molecule-radio-' + process.pid
    }
  }

  if (!(recipe instanceof Recipe)) {
    recipe = new Recipe(recipe)
  }

  debug('Loading recipe: %s', JSON.stringify(recipe))
  self.recipe = recipe

  recipe.forEachAtom(function (options, config) {
    var AtomCtor = Atom.loadAtom(options)

    if (typeof AtomCtor !== 'function') {
      debug('Invalid result for Atom %s:', options.type, AtomCtor)
      return
    }

    self.addAtom(new AtomCtor(config))
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

  if (!self.recipe) {
    debug('No Recipe loaded.')
    return
  }

  if (!self.recipe.field) {
    debug('No Field configuration present. Interconnectivity between Atoms will fail.')
  } else {
    Field.sharedField.listen(self.recipe.field)
    Field.sharedField.connect(self.recipe.field)
  }

  self.atoms.forEach(function (atom) {
    if (typeof atom.prepare === 'function') {
      atom.prepare()
    }
  })

  self.atoms.forEach(function (atom) {
    if (typeof atom.attach === 'function') {
      atom.attach({
        exports: function (name) {
          return self.recipe.getExports(name)
        },
        imports: function (name) {
          return self.recipe.getImports(name)
        }
      })
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
