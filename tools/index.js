'use strict';

var download = require('electron-download');
var fs = require('fs');
var path = require('path');
var extract = require('extract-zip');
var plist = require('plist');
var ncp = require('ncp');
var del = require('del');
var mkdirp = require('mkdirp');

var platforms = ['darwin'];
module.exports = function (options, cb) {
  var version = options.version || '0.27.1';
  var cacheDir = path.join(__dirname, 'cache');
  var releasePath = options.release || path.join(__dirname, '../release');
  var appName = options.appName || 'Electron';
  var appPrefix = options.appPrefix || '';

  var handlers = {};
  handlers.darwin = function (appPath) {
    var InfoPlist = plist.parse(fs.readFileSync(path.join(appPath, 'Electron.app/Contents/Info.plist'), 'utf-8'));
    InfoPlist.CFBundleDisplayName = InfoPlist.CFBundleName = appName;
    InfoPlist.CFBundleIdentifier = [appPrefix, appName].join('.');
    var rPath = path.join(releasePath, 'darwin');
    del(rPath, function () {
      mkdirp(rPath, function(error) {
        ncp(appPath, rPath, function (error) {
          if(error) throw new Error(error);
          var executablePath = path.join(rPath, appName + '.app');
          fs.rename(path.join(rPath, 'Electron.app'), executablePath, function (error) {
            if(error) throw new Error(error);
            fs.writeFileSync(path.join(executablePath, 'Contents/Info.plist'), plist.build(InfoPlist));
            typeof cb === 'function' && cb('darwin', executablePath);
          });
        });
      });
    });
  };

  handlers.win32 = function (){};
  handlers.linux = function () {};

  platforms.forEach(function (platform) {
    download({platform: 'darwin', version: version}, function (error, zipPath) {
      if(error){
        throw new Error(error);
      }
      var appPath = path.join(cacheDir, platform);
      fs.open(appPath, 'r', function (error, fd) {
        if(error) {
          extract(zipPath, {dir: appPath}, function (error) {
            if(error) throw new Error(error);
            handlers[platform](appPath);
          });
        }else{
          fd && fs.close(fd, function (error) {
            if(error) throw new Error(error);
            handlers[platform](appPath);
          });
        }
      });
    });
  });
};

