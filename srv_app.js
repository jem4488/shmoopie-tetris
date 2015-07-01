var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
app.use(express.static('client'));

var clientCount = 0;
var readyCount = 0;

var allClients = [];


/*io.on('connection', function(client) {
   client.on('messages', function (data) {
      console.log(data);
   });

   console.log('Client connected...');

   client.emit('messages', {message: 'Hello World!'});
});
*/

io.on('connection', function(client) {
   allClients.push(client);

   console.log("AllClients: " + allClients.length);

   client.on('join', function (name) {
      client.name = name;
      clientCount++;
      console.log('Client ' + client.name + ' connected...');
      var opp = findOpponent(client);
      if (opp)
      {
         console.log("setting opponents.  Client id: " + client.id + " Opponent id: " + opp.id);
         client.opponent = opp;
         opp.opponent = client;

         console.log("emitting opponent found events");
         client.emit("opponentFound");
         opp.emit("opponentFound");
      }
      else
      {
         console.log("No Opponent Found");
         client.emit("waitingForOpponent");
      }
   });

   client.on('ready', function() {
      client.ready = true;
      if (!client.opponent.ready)
      {
         client.opponent.emit("opponentReady", client.name);
         client.emit("waitingForPlacement");
      }
      else {
         client.opponent.emit("startGame");
         client.emit("startGame");
      }
   });

   client.on('linesCleared', function (data) {
      console.log(client.name + ": " + data);
      client.opponent.emit("updateOpponentInfo", 
         {
            lineCount: client.name + " has cleared " + data.lineCount + " lines.",
         });
   });

   client.on('positions', function (data) {
      console.log("Received position data from " + client.name);
      console.log(data);
      client.opponent.emit("battlePositions", data);
   });

   client.on('attack', function (data) {
      console.log("Received attack from " + client.name);
      client.opponent.emit("attack", data);
   });

   client.on('end', function () {
      console.log("Game ended.  " + client.name + " lost.");
      client.opponent.emit("winner");
      readyCount = 0;
   });

   client.on('disconnect', function() { 
      var i = allClients.indexOf(client);     
      clientCount--;      
      console.log("Client " + client.name + "disconnected. " + clientCount + " clients connected.");
      allClients.splice(0, 1);
      console.log("AllClients: " + allClients.length);
   })

   //client.emit('messages', {message: 'Hello ' + client.name + '!'});
});
app.get('/', function (req, res) {
   console.log("Page requested");
   res.sendFile(__dirname + '/index.html');
});

server.listen(8080);

function findOpponent(client) {
   for (var i = 0; i < allClients.length; i ++)
   {
      var potentialOppenent = allClients[i];
      if (client != potentialOppenent && !potentialOppenent.opponent)
      {
         console.log("Opponent found");
         console.log(potentialOppenent.id);
         return potentialOppenent;
      }
   }
}