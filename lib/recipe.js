//
// # Recipe
//
// Recipes are configurations of Atoms within a Molecule.
//
var path = require('path')
  , debug = require('debug')('molecule:Recipe')
  , minimatch = require('minimatch')
  , traverse = require('traverse')
  , Atom = require('./atom')

//
// ## Recipe `Recipe(obj)`
//
// Creates a new instance of Recipe from **obj**, parsed as a set of `type`-to-configurations. If wildcards are present
// in the Object's keys, those settings are applied to all matching types.
//
function Recipe(obj) {
  if (!(this instanceof Recipe)) {
    return new Recipe(obj)
  }

  obj = obj || {}

  this.root = obj.root || process.cwd()
  this.atoms = obj.atoms || []
  this.field = obj.field || {}
  this.types = {}

  if (obj.types) {
    this._load(obj.types)
  } else {
    this._load(obj)
  }
}

//
// ## loadFromFile `Recipe.loadFromFile(filename)`
//
// Synchronously loads **filename**, specified as a String containing either an absolute path or a path relative to
// `process.cwd`, returning a new Recipe from the contents of the JSON file or module present there.
//
Recipe.loadFromFile = loadFromFile
function loadFromFile(filename) {
  var cls = this
    , obj = require(path.resolve(process.cwd(), filename))

  if (obj) {
    obj.root = path.dirname(filename)
    debug('New recipe with root: %s', obj.root)
  }

  return new cls(obj)
}

//
// ## _load `_load(obj)`
//
// Internal use only.
//
// Parses the Object at `obj`, filling out Atom `type`-specific subobjects from its contents.
//
Recipe.prototype._load = _load
function _load(obj) {
  var self = this
    , objKeys
    , typesKeys

  if (!obj) {
    return self
  }

  function mixin(src, dest) {
    var tDest = traverse(dest)

    traverse(src).forEach(function () {
      // Contrary to `traverse` and every other extend implementation, we want to treat Arrays like primitives.
      if (Array.isArray(this.node)) {
        if (tDest.get(this.path) === undefined) {
          tDest.set(this.path, this.node)
        }

        // A `traverse` hack to prevent child traversal within Arrays.
        this.before(function () {this.keys = []})
      }

      if (this.notLeaf) {
        return
      }

      if (tDest.get(this.path) === undefined) {
        tDest.set(this.path, this.node)
      }
    })
  }

  // Pass #1: Mixin all data from `obj` into `self.types`.
  mixin(obj, self.types)

  // Pass #2: Fold wildcard data into all other keys.
  typesKeys = Object.keys(self.types)
  Object.keys(obj).forEach(function (pattern) {
    typesKeys.forEach(function (type) {
      if (type !== pattern && minimatch(type, pattern)) {
        mixin(obj[pattern], self.types[type])
      }
    })
  })

  return self
}

//
// ## forEachAtom `forEachAtom(fn)`
//
// Iterates over all atoms to be loaded, calling fn with two arguments: an options Object with `type` and `path`
// properties, and the total configuration to use for Atoms of that type.
//
Recipe.prototype.forEachAtom = forEachAtom
function forEachAtom(fn) {
  var self = this

  self.atoms.forEach(function (type) {
    fn(
      {
        type: type,
        path: path.resolve(self.root, type)
      },
      self.types[type]
    )
  })

  return self
}

//
// ## getExports `getExports(type)`
//
// Returns the set of export options for internal **type** Atoms.
//
Recipe.prototype.getExports = getExports
function getExports(type) {
  var self = this
    , config = self.types[type]

  if (!config) {
    return null
  }

  return config.exports || config.export
}

//
// ## getImports `getImports(type)`
//
// Returns the set of import options for external **type** Atoms.
//
Recipe.prototype.getImports = getImports
function getImports(type) {
  var self = this
    , config = self.types[type]

  if (!config) {
    return null
  }

  return config.imports || config.import
}

module.exports = Recipe
