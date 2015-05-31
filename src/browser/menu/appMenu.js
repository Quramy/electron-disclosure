'use strict';

import app from 'app';
import Menu from 'menu';
import MenuItem from 'menu-item';
import capture from './submenus/capture';

let template = [{
  label: 'Disclosure',
  submenu: [{
    label: 'Quit',
    accelerator: 'Command+Q',
    click: function () {app.quit()}
  }]
}];

let appMenu = Menu.buildFromTemplate(template);
appMenu.append(capture);

module.exports = appMenu;
