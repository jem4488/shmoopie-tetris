var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
app.use(express.static('client'));


/*io.on('connection', function(client) {
   client.on('messages', function (data) {
      console.log(data);
   });

   console.log('Client connected...');

   client.emit('messages', {message: 'Hello World!'});
});
*/

io.on('connection', function(client) {
   client.on('join', function (name) {
      client.name = name;
      console.log('Client ' + client.name + ' connected...');
   });

   client.on('linesCleared', function (data) {
      console.log(client.name + ": " + data);
      client.broadcast.emit("updateOpponentInfo", 
         {
            lineCount: client.name + " has cleared " + data.lineCount + " lines.",
         });
   });

   client.on('positions', function (data) {
      console.log("Received position data from " + client.name);
      console.log(data);
      client.broadcast.emit("battlePositions", data);
   });

   client.on('attack', function (data) {
      console.log("Received attack from " + client.name);
      client.broadcast.emit("attack", data);
   });

   client.on('end', function () {
      console.log("Game ended.  " + client.name + " lost.");
      client.broadcast.emit("winner");
   })

   //client.emit('messages', {message: 'Hello ' + client.name + '!'});
});
app.get('/', function (req, res) {
   console.log("Page requested");
   res.sendFile(__dirname + '/index.html');
});

server.listen(8080);