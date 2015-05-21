'use strict';

angular.module('renderer').factory('twitter', function ($q) {
  var remote = require('remote');
  var client = remote.require('./twitter');
  var twitter = {
    hasToken: function () {
      var dfrd = $q.defer();
      client.getToken(createCb(dfrd));
      return dfrd.promise;
    },
    requestToken: function () {
      var dfrd = $q.defer();
      client.requestToken(createCb(dfrd));
      return dfrd.promise;
    },
    verifyCredentials: function () {
      var dfrd = $q.defer();
      client.callApi('verifyCredentials', createCb(dfrd));
      return dfrd.promise;
    },
    accountSettings: function () {
      var dfrd = $q.defer();
      client.callApi('account', 'settings', createCb(dfrd));
      return dfrd.promise;
    },
    statuesUpdate: function (params) {
      var dfrd = $q.defer();
      client.callApi('statuses', 'update', params, createCb(dfrd));
      return dfrd.promise;
    },
    statuesHomeTimeline: function (params) {
      var dfrd = $q.defer();
      client.callApi('getTimeline', 'home', params, createCb(dfrd));
      return dfrd.promise;
    },
    mediaUpload: function (params) {
      var dfrd = $q.defer();
      client.callApi('uploadMedia', params, createCb(dfrd));
      return dfrd.promise;
    }
  };
  var createCb = function (dfrd) {
    return function (error, data, response) {
      if(error) {
        console.log('error!', error, response);
        dfrd.reject(error, response);
      }else{
        console.log('data: ', data);
        dfrd.resolve(data, response);
      }
    };
  };
  return twitter;
});
