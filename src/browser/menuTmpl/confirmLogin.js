'use strict';

var dialog = require('dialog');
var twitter = require('../twitter');

var confirmLogin = function (cb) {
  twitter.getToken(function (token) {
    if(token) {
      typeof cb === 'function' && cb(true);
      return;
    }
    var idx = dialog.showMessageBox({
      type: 'info',
      buttons: ['OK', 'Cancel'],
      message: 'You should login twitter.'
    });
    if(idx === 0){
      twitter.requestToken(function (error) {
        if(error) {
          typeof cb === 'function' && cb(false);
          return;
        }else{
          typeof cb === 'function' && cb(true);
          return;
        }
      });
    }else{
      typeof cb === 'function' && cb(false);
    }
  });
};

module.exports = confirmLogin;
