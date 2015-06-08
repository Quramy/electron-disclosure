'use strict';

var obj = {
  start: function () {
    var WebSocketServer = require('ws').Server, wss = new WebSocketServer({ port: 30080});

    wss.on('connection', function connection(ws) {
      ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        var obj = JSON.parse(message);
        if(obj.type && messageHandler[obj.type]) {
          messageHandler[obj.type](obj.data, ws);
        }
      });
    });
  }
};

var bounds;
var messageHandler = {
  changePosition: function (data) {
    bounds = data.bounds;
  },
  getPosition: function (data, ws) {
    ws.send(JSON.stringify({type: 'responsePosition', data: {bounds: bounds}}));
  }
};

module.exports = obj;
