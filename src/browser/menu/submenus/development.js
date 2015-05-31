'use strict';

import Menu from 'menu';
import MenuItem from 'menu-item';
import BrowserWindow from 'browser-window';

let submenu = Menu.buildFromTemplate([{ 
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
  }]);

let devMenu = new MenuItem({
  label: 'Develop',
  type: 'submenu',
  submenu: submenu
});

module.exports = devMenu;
