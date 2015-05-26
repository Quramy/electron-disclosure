'use strict';

angular.module('renderer').directive('scrollSpy', function () {
  return {
    restrict: 'A',
    link: function ($scope, $elem, $attrs) {
      $scope.$watchCollection($attrs.scrollSpy, function () {
        $scope.$evalAsync(function () {
          var s = $elem.find('>*:first'), e = $elem.find('>*:last');
          if(!s.length || !e.length) return;
          console.log(e.position(), s.position());
          var target = e.position().left - s.position().left;
          console.log(target);
          $elem.parent().animate({
            scrollLeft: target
          });
        });
      });
    }
  }
});
