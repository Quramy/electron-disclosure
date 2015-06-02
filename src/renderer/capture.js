'use strict';

var streamUrl;
var video = document.getElementById('video');

let _size, _scale;

var init = (size, scale) => {

  if(scale > 1.0) scale = 1.0;
  [_size, _scale] = [size, scale];
  video.width = (size.width || 800) * scale;
  video.height = (size.height || 600) * scale;
  console.log(_size);

  return new Promise((resolve, reject) => {
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
    }, (stream) => {
      streamUrl = URL.createObjectURL(stream);
      video.src = streamUrl;
      video.play();
      setTimeout( () => {
        resolve(video);
      }, 200);
    }, (reason) => {
      console.log(reason);
      reject(reason);
    });
  });

};

class ImageHolder {
  url;
  constructor (url) {
    this.url = url;
  }
  toDataURL() {
    return this.url;
  }
  toDataString() {
    return this.url.replace('data:image/png;base64,', '');
  }
}

export class Capture {
  static init(size, scale) {
    init(size, scale);
  }
  constructor () {}
  getImage() {
    if(!streamUrl) return;
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');
    canvas.width = _size.width * _scale;
    canvas.height = _size.height * _scale;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    let url = canvas.toDataURL();
    return new ImageHolder(url);
  }
}

