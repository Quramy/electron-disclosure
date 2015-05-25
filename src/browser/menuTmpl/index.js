'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');
var confirmLogin = require('./confirmLogin');

var menuCreator = {
  appMenu: function () {
    return [{
      label: 'captbot',
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
        click: function () {
          app.emit('start');
        }
      }, { 
        label: 'Test tweet',
        accelerator: 'Command+T',
        click: function() { 
          /*
          var w = BrowserWindow.getFocusedWindow();

          w && setTimeout(function () {
            w.emit('capture');
          }, 3000);*/
          confirmLogin(function (res) {
            app.emit('start.capture');
          });
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
