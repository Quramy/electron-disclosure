
var EventEmitter = require('events').EventEmitter;
var WebSocket = require('ws');

var Client = function () {};
Client.prototype = new EventEmitter();

Client.prototype.init = function (app, browserWindow) {
  this.app = app;
  this.socket = new WebSocket('ws://localhost:30080');
  this.socket.on('open', function () {
    console.log('client:connected');
    this.socket.on('message', function (msg) {
      try {
        var message = JSON.parse(msg);
        if(message.type && typeof message.type === 'string') {
          console.log('client:recieve: ' + message.type);
          this.emit(message.type, message.data || null);
        }
      }catch (e) {
        console.error(e);
      }
    }.bind(this));

    if(this.browserWindow) {
      this._registerWindow();
    }
  }.bind(this));
  this.registerHandler();
  if(browserWindow) {
    this.browserWindow = browserWindow;
  }
  return this;
};

Client.prototype._registerWindow = function () {
  this.browserWindow.on('move', function () {
    this.sendMessage('changePosition', {bounds: this.browserWindow.getBounds()});
  }.bind(this));
  this.sendMessage('getPosition');
};

Client.prototype.registerWindow = function (browserWindow) {
  this.browserWindow = browserWindow;
};

Client.prototype.sendMessage = function (type, data) {
  if(!type) return;
  var obj = {type: type};
  if(data) obj.data = data;
  this.socket.send(JSON.stringify(obj));
};

Client.prototype.registerHandler = function () {
  this.on('responsePosition', function (data) {
    data.bounds && this.browserWindow.setBounds(data.bounds);
  }.bind(this));
};

var obj = {
  init: function (app, browserWindow) {
    client = new Client().init(app, browserWindow);
    return client;
  }
};

module.exports = obj;
