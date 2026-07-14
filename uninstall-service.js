// Removes the Cue Flash Windows service installed by install-service.js.
// Run from an elevated (Run as Administrator) Command Prompt:
//   node uninstall-service.js

var Service = require('node-windows').Service;
var path = require('path');

var svc = new Service({
  name: 'Cue Flash',
  script: path.join(__dirname, 'server.js')
});

svc.on('uninstall', function () {
  console.log('Cue Flash service removed.');
});

svc.uninstall();
