'use strict';

var app = require('app');
var twitterAPI = require('node-twitter-api');
var fs = require('fs');
var path = require('path');
var BrowserWindow = require('browser-window');

var CACHE_FILE = path.join(app.getPath('cache'), 'electron-bot/token_twitter.json');

var twitter = new twitterAPI({
  consumerKey:  "b3NBO7StTwNDRHnrt7IeJHjEo",
  consumerSecret: "ngIS5HinqH7BxmIo3NWWzBkyUDdZs5tmvUPa66b1NyvWzGMlF2",
  callback: 'https://twitter.com/'
});

var _token = null;
var _requestToken = null;
var _requestTokenSecret = null;

var auth = {
  getUrl: function(cb) {
    twitter.getRequestToken(function (error, requestToken, requestTokenSecret, results) {
      if(error) {
        typeof cb === 'function' && cb(error, null);
        return;
      }
      _requestToken = requestToken;
      _requestTokenSecret = requestTokenSecret
      typeof cb === 'function' && cb(null, twitter.getAuthUrl(requestToken));
    });
  },
  getToken: function (cb) {
    if(_token) {
      typeof cb === 'function' && cb(null, _token);
      return;
    }
    fs.readFile(CACHE_FILE, 'utf8', function (err, txt) {
      if(err) {
        typeof cb === 'function' && cb(err, null);
        return;
      }
      if(!err && txt) {
        _token = JSON.parse(txt);
        typeof cb === 'function' && cb(null, _token);
        return;
      }
      typeof cb === 'function' && cb('Not login', null);
    });
  },
  requestToken: function (arg1, arg2) {
    var opt, cb;
    if(arg2) {
      opt = arg1, cb = arg2;
    } else {
      opt = {};
      cb = arg1;
    }
    auth.getToken(function (err, token) {
      if(!opt.force && token) {
        typeof cb === 'function' && cb(null, token);
        return;
      }
      auth.getUrl(function (error, url) {
        var loginWindow = new BrowserWindow({
          width: 600,
          height:800,
          resizable: false,
          'always-on-top': true,
          'web-preferences': {
            'web-security': false
          }
        });
        loginWindow.webContents.on('will-navigate', function(preventDefault, url){
          //console.log(url);
          var matched;
          if(matched = url.match(/\?oauth_token=([^&]*)&oauth_verifier=([^&]*)/)) {
            twitter.getAccessToken(_requestToken, _requestTokenSecret, matched[2], function (error, accessToken, accessTokenSecret, result) {
              console.log(accessTokenSecret, accessToken);
              _token = {
                accessToken: accessToken,
                accessTokenSecret: accessTokenSecret
              };
              fs.writeFileSync(CACHE_FILE, JSON.stringify(_token), 'utf8');
              typeof cb === 'function' && cb(null, _token);
              setTimeout(function () {loginWindow.close();}, 0);
              return;
            });
          }
        });

        loginWindow.loadUrl(url);
      });
    });

  },
  client: function () {
    return twitter;
  },
  callApi: function(nameSpace, action, params, cb) {
    if(!cb && !params) {
      twitter[nameSpace](_token.accessToken, _token.accessTokenSecret, action);
    }else if(!cb) {
      twitter[nameSpace](action, _token.accessToken, _token.accessTokenSecret, params);
    }else{
      twitter[nameSpace](action, params, _token.accessToken, _token.accessTokenSecret, cb);
    }
  }
};

module.exports = auth;
