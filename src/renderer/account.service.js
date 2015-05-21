'use strict';

angular.module('renderer').factory('account', function (twitter) {
  var _settings = null;
  return {
    settings: function () {
      return _settings;
    },
    fetch: function () {
      twitter.verifyCredentials().then(function (data) {
        _settings = data;
      });
    }
  };
});
