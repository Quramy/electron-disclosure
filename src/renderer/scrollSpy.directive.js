'use strict';

angular.module('renderer').directive('scrollSpy', function () {
  return {
    restrict: 'A',
    link: function ($scope, $elem) {
      $elem.on('scroll', function () {
        /*
        var i = document.elementFromPoint(300, 200);
        var $image = angular.element(i).parents('.image-item');
        $image.find('img').css('width', '120%');
        $image.next().css('width', '100%');
        $image.prev().css('width', '100%');
       */
      });
    }
  }
});
