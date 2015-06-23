'use strict';
require('babel/polyfill');

import app from 'app';
import BrowserWindow from 'browser-window';
import Menu from 'menu';
import MenuItem from 'menu-item';
import crashReporter from 'crash-reporter';
import appMenu from './browser/menu/appMenu';
import devMenu from './browser/menu/submenus/development';
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
  mainWindow = new BrowserWindow({
    width: 720,
    height: 600
  });
  mainWindow.loadUrl('file://' + __dirname + '/index.html');
});

