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

  main.capture = function () {
    var screen = remote.require('screen');
    var dispSize = screen.getPrimaryDisplay().size;
    capture.setSize({width: dispSize.width * 0.5, height: dispSize.height * 0.5});
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
        return twitter.statuesUpdate({status: 'Captured my desktop at ' + d.toGMTString(), media_ids:res.media_id_string});
      }).then(function (data) {
        console.log('Updated status: ', data.id_str);
        var link = 'https://twitter.com';
        new Notification('Tweet done. https://');
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

  remote.getCurrentWindow().on('start', main.start);
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


