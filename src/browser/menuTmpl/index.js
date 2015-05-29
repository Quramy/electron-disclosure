'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');
var confirmLogin = require('./confirmLogin');

var isStarted = false;
var menuCreator = {
  appMenu: function () {
    return [{
      label: 'Disclosure',
      submenu: [{
        label: 'Quit',
        accelerator: 'Command+Q',
        click: function () {app.quit()}
      }]
    }, {
      label: 'Capture',
      submenu: [{
        label: 'Start',
        accelerator: 'Command+Z',
        click: function (menu) {
          if(isStarted) {
            isStarted = false;
            menu.label = 'Start';
            app.emit('stop');
          }else{
            isStarted = true;
            menu.label = 'Stop';
            app.emit('start');
          }
        }
      }, {
        label: 'Capture',
        accelerator: 'Command+T',
        click: function () {
          app.emit('capture');
        }
      }]
    }];
  },
  devAssistMenu: function () {
    return [{
      label: 'Develop',
      submenu: [{ 
        label: 'Reload',
        accelerator: 'Command+R',
        click: function() { 
          var w = BrowserWindow.getFocusedWindow();
          w && w.reloadIgnoringCache(); 
        }
      }, {
        label: 'Toggle DevTools',
        accelerator: 'Alt+Command+I',
        click: function() { 
          var w = BrowserWindow.getFocusedWindow();
          w && w.toggleDevTools();
        }
      }]
    }];
  }
};

module.exports = menuCreator;
