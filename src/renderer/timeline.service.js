'use strict';

angular.module('renderer').factory('timeline', function ($interval, twitter) {
  var _home = null;
  var _p = null;
  var timeline = {
    home: function () {
      return _home;
    },
    refresh: function () {
      return twitter.statuesHomeTimeline({count: '5'}).then(function (data) {
        _home = data;
      });
    },
    start: function () {
      timeline.refresh().then(function () {
        _p = $interval(function () {
          timeline.refresh();
        }, 5000);
      });
    },
    stop: function () {
      if($interval.cancel(_p)){
        _p = null;
      }
    },
    status: function () {
      return !!_p;
    }
  };
  return timeline;
});
