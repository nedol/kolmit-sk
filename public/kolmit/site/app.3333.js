'use strict';
const server = require('./server.3333');
const ws = require('ws');
// const urlencode = require('urlencode');
const shortid = require('shortid');
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ port: 3000 });
server.wss = wss;

wss.on('connection', function connection(ws) {
  ws.id = shortid.generate();

  ws.on('message', function (message) {
    try {
      var q = JSON.parse(decodeURIComponent(message));
      console.log('q:' + JSON.stringify(q));
      if (q.uid) ws.uid = q.uid;
      server.HandleRequest(q, ws);
    } catch (ex) {
      console.log(q);
    }
  });
});
