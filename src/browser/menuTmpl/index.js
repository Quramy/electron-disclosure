'use strict';

var BrowserWindow = require('browser-window');

var menuCreator = {
  devAssistMenu: function () {
    // メニュー情報の作成
    return [
      {
        label: 'ReadUs',
        submenu: [
          {label: 'Quit', accelerator: 'Command+Q', click: function () {app.quit();}}
        ]
      }, {
        label: 'View',
        submenu: [
          { label: 'Reload', accelerator: 'Command+R', click: function() { BrowserWindow.getFocusedWindow().reloadIgnoringCache(); } },
          { label: 'Toggle DevTools', accelerator: 'Alt+Command+I', click: function() { BrowserWindow.getFocusedWindow().toggleDevTools(); } }
        ]
      }
    ];
  }
};

module.exports = menuCreator;
