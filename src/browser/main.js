'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');
var Menu = require('menu');
var menuTmpl = require('./menuTmpl');
var template = menuTmpl.appMenu();
var mainWindow = null;

if(process.env.NODE_ENV === 'develop'){
  require('crash-reporter').start();
  template = template.concat(menuTmpl.devAssistMenu());
}

app.on('window-all-closed', function() {
  if (process.platform != 'darwin') app.quit();
});

app.on('ready', function() {
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  /*
  var starterWindow = new BrowserWindow({
    width: 400,
    height: 250
  });
  starterWindow.loadUrl('file://' + __dirname + '/../starter.html');
  */

  mainWindow = new BrowserWindow({
    width: 720,
    height: 600,
    //transparent: true,
    //fullscreen: false,
    //frame: false
  });
  mainWindow.loadUrl('file://' + __dirname + '/../index.html');
  /*
  starterWindow.on('start.capture', function () {

    mainWindow = new BrowserWindow({
      width: 10,
      height: 10,
      transparent: true,
      fullscreen: false,
      frame: false
    });
    mainWindow.loadUrl('file://' + __dirname + '/../index.html');
    mainWindow.on('closed', function() {
      mainWindow = null;
    });
  });
  starterWindow.on('stop.capture', function () {
    mainWindow && mainWindow.emit('stop');
  });
  */
});

