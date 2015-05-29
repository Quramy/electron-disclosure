'use strict';
require('babel/polyfill');
var app = require('app');
var BrowserWindow = require('browser-window');
var Menu = require('menu');
var menuTmpl = require('./menuTmpl');
var template = menuTmpl.appMenu();
var mainWindow = null;
var appMenu = null;

if(process.env.NODE_ENV === 'develop'){
  require('crash-reporter').start();
  template = template.concat(menuTmpl.devAssistMenu());
}

app.on('window-all-closed', function() {
  if (process.platform != 'darwin') app.quit();
});

app.on('capture', function () {
  if(mainWindow) mainWindow.emit('capture');
});

app.on('start', function () {
  if(mainWindow) mainWindow.emit('start');
});

app.on('stop', function () {
  if(mainWindow) mainWindow.emit('stop');
});

app.on('ready', function() {
  appMenu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(appMenu);

  mainWindow = new BrowserWindow({
    width: 720,
    height: 600
  });
  mainWindow.loadUrl('file://' + __dirname + '/../index.html');
});

