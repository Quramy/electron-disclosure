'use strict';

import app from 'app';
import Menu from 'menu';
import MenuItem from 'menu-item';

let submenu = new Menu();
let startMenu = new MenuItem({
  label: 'Start',
  accelerator: 'Command + Z',
  click: (menu) => {
    menu.enabled= false;
    stopMenu.enabled = true;
    app.emit('start');
  }
});
let stopMenu = new MenuItem({
  label: 'Stop',
  accelerator: 'Command + S',
  enabled: false,
  click: (menu) => {
    menu.enabled = false;
    startMenu.enabled = true;
    app.emit('stop');
  }
});
submenu.append(startMenu);
submenu.append(stopMenu);
let capMenu = new MenuItem({
  label: 'Capture',
  type: 'submenu',
  submenu: submenu
});

module.exports = capMenu;


