'use strict';

var EventEmitter = require('events').EventEmitter;
var proc = require('child_process');
var electron = require('electron-prebuilt');
var _ = require('lodash');
var ProcessManager = function () {};
ProcessManager.prototype = new EventEmitter();
ProcessManager.prototype.init = function (opt) {
  this.electron = opt.electron;
  return this;
};

ProcessManager.prototype.start = function () {
  this.electronProc = proc.spawn(this.electron, [process.cwd()], {stdio: 'inherit'});
  var WebSocketServer = require('ws').Server, wss = new WebSocketServer({ port: 30080});
  wss.on('connection', function connection(ws) {
    this.ws = ws;
    this.ws.on('message', function incoming(message) {
      console.log('server:receive: %s', message);
      var obj = JSON.parse(message);
      if(obj.type && typeof obj.type === 'string') {
        this.emit(obj.type, obj.data || null);
      }
    });
    this.registerHandler();
  }.bind(this));
};

ProcessManager.prototype.sendMessage = function (type, data) {
  if(!type) return;
  var obj = {type: type};
  if(data) obj.data = data;
  ws.send(JSON.stringify(obj));
};

ProcessManager.prototype.registerHandler = function () {
  this.on('changePosition', function (data) {
    this.boudns = data.boudns;
  }.bind(this));
  this.on('getPosition', function () {
    this.sendMessage('responsePosition', {boudns: this.boudns});
  }.bind(this));
};

ProcessManager.prototype.restart = function () {
  if(this.electronProc) {
    this.electronProc.kill();
  }
  this.electronProc =  proc.spawn(this.electron, [process.cwd()], {stdio: 'inherit'});
};

ProcessManager.prototype.reload = function () {};

module.exports = {
  create: function (options) {
    var opt = _.merge(options || {}, {
      electron: require('electron-prebuilt')
    });
    return new ProcessManager().init(opt);
  }
};

