'use strict';

var fs = require('fs');
var path = require('path');
var EventEmitter = require('events').EventEmitter;
var download = require('electron-download');
var extract = require('extract-zip');
var plist = require('plist');
var ncp = require('ncp');
var del = require('del');
var mkdirp = require('mkdirp');

module.exports = function (options) {
  var version = options.version;
  var platforms = options.platforms || [];
  var cacheDir = options.cacheDir || path.join(process.cwd(), 'cache');
  var releasePath = options.release || path.join(process.cwd(), 'release');
  var appName = options.appName || 'yourApp';
  var appPrefix = options.appPrefix || '';

  var emitter = new EventEmitter();

  if(!version) {
    throw new Error('version is required.');
  }

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
            emitter.emit('darwin', executablePath);
          });
        });
      });
    });
  };

  handlers.win32 = function (appPath) {
    var rPath = path.join(releasePath, 'win32');
    del(rPath, function () {
      mkdirp(rPath, function (error) {
        ncp(appPath, rPath, function (error) {
          if(error) throw new Error(error);
          var exePath = path.join(rPath, 'electron.exe');
          fs.rename(exePath, path.join(rPath, appName + '.exe'), function (error) {
            if(error) throw new Error(error);
            emitter.emit('win32', rPath);
          });
        });
      });
    });
  };

  handlers.linux = function (appPath) {
    var rPath = path.join(releasePath, 'linux');
    del(rPath, function () {
      mkdirp(rPath, function (error) {
        ncp(appPath, rPath, function (error) {
          if(error) throw new Error(error);
          var exePath = path.join(rPath, 'electron');
          fs.rename(exePath, path.join(rPath, appName), function (error) {
            if(error) throw new Error(error);
            emitter.emit('linux', rPath);
          });
        });
      });
    });
  };

  platforms.forEach(function (platform) {
    download({platform: platform, version: version}, function (error, zipPath) {
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
            if(!handlers[platform]) {
              throw new Error('Invalid platform. ' + platform);
            }
            handlers[platform](appPath);
          });
        }
      });
    });
  });

  return emitter;
};

