var lib = require('../')
  , recipe
  , molecule

recipe = require('./recipe')

molecule = lib
  .createMolecule()
  .load(recipe)
  .start()
