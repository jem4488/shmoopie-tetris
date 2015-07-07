var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
app.use(express.static('client'));

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
   });

   client.on('disconnect', function() { 
      if (client.opponent)
         client.opponent.emit("winner");

      var i = allClients.indexOf(client);     

      console.log("Client " + client.name + "disconnected. " + allClients.length + " clients connected.");
      allClients.splice(0, 1);
   })
});

app.get('/', function (req, res) {
   console.log("Page requested: login");
   res.sendFile(__dirname + '/client/login.html');
});

app.get('/lobby', function (req, res) {
   console.log("Page requested: lobby");
   res.sendFile(__dirname + '/client/lobby.html');
});

app.get('/factory', function (req, res) {
   console.log("Page requested: factory");
   res.sendFile(__dirname + '/client/factory.html');
});

app.get('/mine', function (req, res) {
   console.log("Page requested: mine");
   res.sendFile(__dirname + '/client/mine.html');
});

app.get('/archive', function (req, res) {
   console.log("Page requested: archive");
   res.sendFile(__dirname + '/client/archive.html');
});

app.get('/forge', function (req, res) {
   console.log("Page requested: forge");
   res.sendFile(__dirname + '/client/forge.html');
});

app.get('/coliseum', function (req, res) {
   console.log("Page requested: coliseum");
   //console.log(req.query.name);
   res.sendFile(__dirname + '/client/play.html');
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