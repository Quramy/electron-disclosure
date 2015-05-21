'use strict';

angular.module('renderer').factory('capture', function ($rootElement, $rootScope, $q) {

  var canvas = angular.element('<canvas>').css('display', 'none');
  var _size;

  var getImage = function () {
    var video = angular.element('<video>').css('display', 'none');
    var dfrd = $q.defer();
    $rootElement.append(video);
    navigator.webkitGetUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'screen',
          minWidth: 800,
          maxWidth: 2560,
          minHeight: 600,
          maxHeight: 1440
        }
      }
    }, function (stream) {
      var videoDom = video[0];
      var url;
      url = window.webkitURL.createObjectURL(stream);
      //console.log('Success');
      videoDom.src = url;
      videoDom.play();
      setTimeout(function () {
        videoDom.pause();
        //main.draw(video, thecanvas);
        var context = canvas[0].getContext('2d');
        context.drawImage(videoDom, 0, 0, canvas[0].width, canvas[0].height);
        dfrd.resolve(canvas[0]);
        video.remove();
      }, 20);
    }, function (error) {
      console.error(error);
      dfrd.reject(error);
      video.remove();
    });
    return dfrd.promise;
  };

  var setSize = function (size) {
    _size = size;
    canvas.css('width', size.width + 'px');
    canvas.css('height', size.height + 'px');
  };

  var toDataURL = function () {
    return getImage().then(function (canvas) {
      return canvas.toDataURL();
    });
  };

  var base64 = function () {
    return toDataURL().then(function (url) {
      return url.replace('data:image/png;base64,', '');
    });
  };

  setSize({width: 800, height: 600});
  $rootElement.append(canvas);

  return {
    setSize: setSize,
    toDataURL: toDataURL,
    base64: base64
  };

});
