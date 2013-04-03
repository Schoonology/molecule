var spaceage = require('../')
  , manifest
  , station

// 1. Configure the process
manifest = require('./manifest')

// 1. Create the Station.
station = spaceage
  .createStation()
  .load(manifest)
// 1. Launch the Station. The Station's Control will start to coordinate with other Stations, `open`-ing and `close`-ing
// LaunchPads as necessary.
  .start()

// // 1. Provide a Dock for a-type payloads.
// station
//   .provide('a')
// // 1. Handle payloads named "test".
//   .handle('test')
// // 1. Open the Dock.
//   .open(config.a)

// // 1. Request a LaunchPad for b-type payloads.
// station
//   .require('b')
// // 1. Expect to send payloads named "test".
//   .expect('test')

// 1. Destroy the Station you once loved.
setTimeout(function () {
  station.destroy()
}, 1000)
