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
    const ip = req.connection.remoteAddress;
    const location = url.parse(req.url, true);
    let ipStr = ip.slice(7)
        console.log(ipStr);
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
                sendData = {
                    ip: ipStr,
                    msg: message
                }
              client.send(JSON.stringify(sendData));
            }
          });
    });
    
    ws.on('open', () => {
        ws.send('hello')
    });
   
 
     
  

});


server.listen(8080, function listening() {
    console.log('Listening on %d', server.address().port);
}); 