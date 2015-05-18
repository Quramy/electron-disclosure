'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');
var Menu = require('menu');

require('crash-reporter').start();

var mainWindow = null;

app.on('window-all-closed', function() {
  if (process.platform != 'darwin') app.quit();
});

app.on('ready', function() {

  Menu.setApplicationMenu(Menu.buildFromTemplate(require('./menuTmpl').devAssistMenu()));
  // ブラウザ(Chromium)の起動, 初期画面のロード
  mainWindow = new BrowserWindow({width: 800, height: 600});
  mainWindow.loadUrl('file://' + __dirname + '/../index.html');

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});



