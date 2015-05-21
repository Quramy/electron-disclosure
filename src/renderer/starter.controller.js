'use strict';

var remote = require('remote');
angular.module('renderer').controller('StarterController', function (twitter, account) {
  var starter = this;
  starter.account = account;

  twitter.hasToken().then(function () {
    starter.hasToken = true;
    starter.account.fetch();
  }, function () {
    starter.hasToken = false;
  });

  starter.start = function () {
    starter.started = true;
    twitter.requestToken().then(function () {
      starter.account.fetch();
      remote.getCurrentWindow().emit('start.capture');
    }, function (){});
  };

  starter.stop = function () {
    starter.started = false;
    remote.getCurrentWindow().emit('stop.capture');
  };

});
