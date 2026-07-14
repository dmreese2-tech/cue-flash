// Registers Cue Flash as a Windows service using node-windows.
// Run this once, from an elevated (Run as Administrator) Command Prompt:
//   node install-service.js

var Service = require('node-windows').Service;
var path = require('path');

var svc = new Service({
  name: 'Cue Flash',
  description: 'Cue Flash stage-messaging server (control panel, display clients, Companion API).',
  script: path.join(__dirname, 'server.js'),
  // Restart automatically if the process ever dies
  wait: 2,
  grow: 0.5,
  maxRestarts: 10
});

svc.on('install', function () {
  console.log('Service installed. Starting it now...');
  svc.start();
});

svc.on('start', function () {
  console.log('Cue Flash service is running.');
  console.log('Control panel: http://localhost:3000/control.html');
});

svc.on('alreadyinstalled', function () {
  console.log('Service is already installed. Use uninstall-service.js first if you need to reinstall.');
});

svc.on('error', function (err) {
  console.error('Service error:', err);
});

svc.install();
