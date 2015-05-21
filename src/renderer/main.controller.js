'use strict';

angular.module('renderer').controller('MainController', function ($interval, twitter, capture) {
  var main = this;
  var remote = require('remote');
  var video = document.getElementById('video'), localStream;

  main.tweet = function () {
    if(!main.message && main.message === '') return;
    twitter.statuesUpdate({status: main.message}).then(function () {
      main.message = '';
    });
  };

  main.hoge = function () {
    var remote = require('remote');
    var w = remote.getCurrentWindow();
    w.capturePage({x: 0, y:0 ,width: 500, height: 500}, function(image) {
      main.img = image.toDataUrl();
    });
  };

  main.capture = function () {
    var screen = remote.require('screen');
    var dispSize = capture.setSize(screen.getPrimaryDisplay().size);
    capture.setSize({width: dispSize * 0.25, height: dispSize * 0.25});
    capture.base64().then(function (data) {
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
  };

  remote.getCurrentWindow().on('stop', function () {
    remote.getCurrentWindow().close();
  });

  $interval(function () {
    main.capture();
  }, 1000 * 60 * 5);

  main.capture();

});


