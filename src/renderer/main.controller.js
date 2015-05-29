'use strict';

angular.module('renderer').controller('MainController', function ($interval, twitter, account, capture) {
  var main = this;
  var remote = require('remote');
  main.imageList = [];
  main.twitter = twitter;
  main.account = account;
  main.hasToken = undefined;
  main.isLoding = true;
  main.enableTweet = false;

  main.tweet = function () {
    if(!main.message && main.message === '') return;
    twitter.statuesUpdate({status: main.message}).then(function () {
      main.message = '';
    });
  };

  main.toggleTweet = function () {
    //console.log(main.enableTweet);
    if(main.enableTweet) {
      twitter.requestToken()
    }
  };

  /*
  main.hoge = function () {
    var remote = require('remote');
    var w = remote.getCurrentWindow();
    w.capturePage({x: 0, y:0 ,width: 500, height: 500}, function(image) {
      main.img = image.toDataUrl();
    });
  };*/

  var screen = remote.require('screen');
  var dispSize = screen.getPrimaryDisplay().size;
  console.log('Screen width: ' + dispSize.width + ', height: ' + dispSize.height);
  capture.setSize({width: dispSize.width * 0.5, height: dispSize.height * 0.5});
  main.capture = function () {
    var imgPromise = capture.getImage().then(function (image) {
      main.imageList.push(image);
      return image.base64();
    });
    if(main.enableTweet) {
      imgPromise.then(function (data) {
        console.log('Captured desktop');
        return twitter.mediaUpload({media: data, isBase64: true})
      }).then(function (res) {
        var d = new Date();
        console.log('Upload media: ', res.media_id_string);
        return twitter.statuesUpdate({status: 'Captured by https://github.com/Quramy/electron-disclosure at ' + d.toGMTString(), media_ids:res.media_id_string});
      }).then(function (data) {
        var link = 'https://twitter.com/' + account.settings().name + '/status/' + data.id_str;
        var n = new Notification('Tweet done. ' + link,{});
        n.onclick = function () {
          console.log(link);
        };
      });
    }
  };

  remote.getCurrentWindow().on('stop', function () {
    remote.getCurrentWindow().close();
  });

  main.start = function () {
    main.capture();
    main.cancel = $interval(function () {
      main.capture();
    }, 1000 * 60 * 5);
  };

  main.stop = function () {
    main.cancel && $interval.cancel(main.cancel);
    main.cancel = null;
  };

  remote.getCurrentWindow().on('capture', main.capture);
  remote.getCurrentWindow().on('start', function () {
    if(main.hasToken) main.enableTweet = true;
    main.start();
  });
  remote.getCurrentWindow().on('stop', main.stop);

  main.twitter.hasToken().then(function() {
    main.hasToken = true;
    twitter.requestToken().then(function () {
      return account.fetch();
    }).then(function () {
      main.hasToken = true;
      main.isLoding = false;
    }, function () {
      main.isLoding = false;
      main.hasToken = false;
    });
  }, function () {
    main.hasToken = false;
    main.isLoding = false;
  });

});


