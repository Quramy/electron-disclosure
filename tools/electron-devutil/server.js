'use strict';

var EventEmitter = require('events').EventEmitter;
var proc = require('child_process');
var electron = require('electron-prebuilt');
var _ = require('lodash');
var webSocket = require('ws');

var ProcessManager = function () {};
ProcessManager.prototype = new EventEmitter();
ProcessManager.prototype.init = function (opt) {
  this.electron = opt.electron;
  return this;
};

ProcessManager.prototype.start = function () {
  this.electronProc = proc.spawn(this.electron, [process.cwd()], {stdio: 'inherit'});
  var WebSocketServer = webSocket.Server, wss = new WebSocketServer({ port: 30080});
  wss.on('connection', function connection(ws) {
    this.ws = ws;
    this.ws.on('message', function incoming(message) {
      console.log('server:receive: %s', message);
      var obj = JSON.parse(message);
      if(obj.type && typeof obj.type === 'string') {
        this.emit(obj.type, obj.data);
      }
    }.bind(this));
    this.registerHandler();
  }.bind(this));
};

ProcessManager.prototype.sendMessage = function (type, data) {
  if(!type || !this.ws || this.ws.readyState !== webSocket.OPEN) return;
  var obj = {type: type};
  if(data) obj.data = data;
  this.ws.send(JSON.stringify(obj));
};

ProcessManager.prototype.registerHandler = function () {
  this.on('changePosition', function (data) {
    this.bounds= data.bounds;
  }.bind(this));
  this.on('getPosition', function () {
    this.sendMessage('setBounds', {bounds: this.bounds});
  }.bind(this));
};

ProcessManager.prototype.restart = function () {
  if(this.electronProc) {
    this.electronProc.kill();
  }
  this.electronProc =  proc.spawn(this.electron, [process.cwd()], {stdio: 'inherit'});
};

ProcessManager.prototype.reload = function () {
  this.sendMessage('reload');
};

module.exports = {
  create: function (options) {
    var opt = _.merge(options || {}, {
      electron: require('electron-prebuilt')
    });
    return new ProcessManager().init(opt);
  }
};

