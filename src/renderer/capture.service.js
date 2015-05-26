'use strict';

angular.module('renderer').factory('capture', function ($rootElement, $rootScope, $q) {

  var canvas = angular.element('<canvas>').css('display', 'none');
  var video;
  var _size;
  var streamUrl = null;

  var getImage = function () {
    var dfrd = $q.defer();
    if(video) {
      video[0].play();
      var context = canvas[0].getContext('2d');
      context.drawImage(video[0], 0, 0, canvas[0].width, canvas[0].height);
      dfrd.resolve(canvas[0]);
    }else{
      video = angular.element('<video>');
      //video.css('display', 'none');
      video.attr('width', _size.width + 'px');
      video.attr('height', _size.height+ 'px');
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
        streamUrl = window.URL.createObjectURL(stream);
        //console.log('Success');
        videoDom.src = streamUrl;
        videoDom.play();
        setTimeout(function () {
          //videoDom.pause();
          //main.draw(video, thecanvas);
          var context = canvas[0].getContext('2d');
          context.drawImage(videoDom, 0, 0, canvas[0].width, canvas[0].height);
          dfrd.resolve(canvas[0]);
          //video.remove();
        }, 200);
      }, function (error) {
        console.error(error);
        dfrd.reject(error);
        //video.remove();
      });
    }
    return dfrd.promise;
  };

  var setSize = function (size) {
    _size = size;
    canvas.attr('width', size.width);
    canvas.css('width', size.width + 'px');
    canvas.attr('height', size.height);
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

  $rootElement.append(canvas);
  setSize({width: 800, height: 600});

  return {
    setSize: setSize,
    toDataURL: toDataURL,
    base64: base64,
    getImage: function () {
      return getImage().then(function(canvas) {
        var url = canvas.toDataURL();
        return {
          url: function () {return url},
          base64: function () {return url.replace('data:image/png;base64,', '')}
        };
      });
    }
  };

});
