'use strict';
require('babel/polyfill');

import app from 'app';
import BrowserWindow from 'browser-window';
import Menu from 'menu';
import MenuItem from 'menu-item';
import crashReporter from 'crash-reporter';
import appMenu from './browser/menu/appMenu';
import devMenu from './browser/menu/submenus/development';

// TODO Fix me
// After browserify, calling remote.require('./browser/twitter') in renderer process was failed,
// because remote.require is implemented by wrapping process.mainModule.require (atom.asar/browser/lib/rpc-server.js).
// So this API may miss the "browserified module".
import twitter from './browser/twitter';

let mainWindow = null;
if(process.env.NODE_ENV === 'develop'){
  crashReporter.start();
  appMenu.append(devMenu);
}

app.on('window-all-closed', () => {
  app.quit();
});

app.on('start', () => {
  if(mainWindow) mainWindow.emit('start');
});

app.on('stop', () => {
  if(mainWindow) mainWindow.emit('stop');
});

app.on('ready', () => {
  Menu.setApplicationMenu(appMenu);
  if(process.env.NODE_ENV === 'develop') {
    // For conversation gulp(ws) process
    var WebSocket = require('ws');
    var ws = new WebSocket('ws://localhost:30080');
    ws.on('open', function () {
      console.log('ws:connected');
      ws.on('message', function (msg) {
        var message = JSON.parse(msg);
        if(message.type === 'responsePosition') {
          mainWindow = new BrowserWindow(message.data.bounds ? message.data.bounds : {
            width: 720,
            height: 600
          });
          mainWindow.loadUrl('file://' + __dirname + '/index.html');

          mainWindow.on('move', function () {
            ws.send(JSON.stringify({type: 'changePosition', data: {bounds: mainWindow.getBounds()}}));
          });
        }
      });
      ws.send(JSON.stringify({type:'getPosition'}));
    });
  }else{
    mainWindow = new BrowserWindow({
      width: 720,
      height: 600
    });
    mainWindow.loadUrl('file://' + __dirname + '/index.html');
  }
});

