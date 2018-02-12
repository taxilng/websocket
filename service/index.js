const express = require('express');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');

const app = express();

app.use(function (req, res) {
    res.send({ msg: "hello" });
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });


wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  };

wss.on('connection', function connection(ws, req) {
    const location = url.parse(req.url, true);

    ws.on('close', function close(code, reason) {
        console.log('disconnected');
    });
    ws.on('error', () => {
        console.log('err');
    });
    ws.on('message', function incoming(message) {
        // console.log('received: %s', message);
        // ws.send(message);
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(message);
            }
          });
    });
    
    ws.on('open', () => {
        ws.send('hello')
    });
   
    try { ws.send('客户端，你好'); }
    catch (e) { 
        console.log(e);
     }
     
  

});


server.listen(8080, function listening() {
    console.log('Listening on %d', server.address().port);
}); 