'use strict';

/**
 *
 * @ngdoc service
 * @name twitter
 * @module renderer
 * @description
 * A Twitter API Client.
 *
 **/
angular.module('renderer').factory('twitter', function ($q) {
  var remote = require('remote');
  var client = remote.require('./twitter');
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
  var twitter = {

    /**
     *
     * @returns promise
     * @description
     * Reloves true if client has access token.
     *
     **/
    hasToken: function () {
      var dfrd = $q.defer();
      client.getToken(createCb(dfrd));
      return dfrd.promise;
    },

    /**
     *
     * @returns promise
     * @description
     * Resolves access token.
     * If client does not have token, fetch new one with OAuth flow.
     *
     **/
    requestToken: function () {
      var dfrd = $q.defer();
      client.requestToken(createCb(dfrd));
      return dfrd.promise;
    },

    /**
     *
     * @returns promise
     * @description
     * Wraps verifyCredentials API.
     *
     **/
    verifyCredentials: function () {
      var dfrd = $q.defer();
      client.callApi('verifyCredentials', createCb(dfrd));
      return dfrd.promise;
    },

    /**
     *
     * @return promise
     * @description
     * Wraps account/settings API.
     *
     **/
    accountSettings: function () {
      var dfrd = $q.defer();
      client.callApi('account', 'settings', createCb(dfrd));
      return dfrd.promise;
    },

    /**
     *
     * @param params A status parameter.
     * @returns promise
     * @description
     * Wraps statuses/update API.
     *
     **/
    statuesUpdate: function (params) {
      var dfrd = $q.defer();
      client.callApi('statuses', 'update', params, createCb(dfrd));
      return dfrd.promise;
    },

    /**
     *
     * @param params A status parameter
     * @returns promise
     * Wraps statuses/home_line API.
     *
     **/
    statuesHomeTimeline: function (params) {
      var dfrd = $q.defer();
      client.callApi('getTimeline', 'home', params, createCb(dfrd));
      return dfrd.promise;
    },

    /**
     *
     * @param params A media upload parameters
     * @returns promise
     * @description
     * Wraps media/upload API.
     *
     **/
    mediaUpload: function (params) {
      var dfrd = $q.defer();
      client.callApi('uploadMedia', params, createCb(dfrd));
      return dfrd.promise;
    }
  };
  return twitter;
});
