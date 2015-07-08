var pg = require('pg');
var conString = "postgres://postgres:PostgresAdmin$$@localhost/postgres";
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
app.use(express.static('client'));

var allClients = [];

var maxRobotTypeId = 4;
var maxSequenceNum = 6;
var maxColor = 7;
var maxMinedResourceTypeId = 3;


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
   //create user if necessary
   verfiyUserAndRespond(req.query.name, res);   
});

app.get('/dailyResources', function (req, res) {
   console.log("Daily resources requested for " + req.query.name);
   var resources = getDailyResources(req.query.name, res);//{shardCollected: false, sketchCollected: false};
   console.log("After calling getDailyResources()");
});

app.get('/factory', function (req, res) {
   console.log("Page requested: factory");
   res.sendFile(__dirname + '/client/factory.html');
});

app.get('/sketchResources', function (req, res) {
   console.log("Page requested: sketchResources");
   getSketchResourcesAndRespond(req.query.name, res);
});

app.get('/collectSketch', function (req, res) {
   console.log("Sketch requested");
   var sketch = getRandomSketch();
   saveSketchAndRespond(req.query.name, sketch, res);
});

app.get('/mine', function (req, res) {
   console.log("Page requested: mine");
   res.sendFile(__dirname + '/client/mine.html');
});

app.get('/collectShard', function (req, res) {
   console.log("Shard requested");
   var colorId = getRandomColor();
   saveShardAndRespond(req.query.name, colorId, res);
   //res.json(shard);
});

app.get('/archive', function (req, res) {
   console.log("Page requested: archive");
   res.sendFile(__dirname + '/client/archive.html');
});

app.get('/forge', function (req, res) {
   console.log("Page requested: forge");
   res.sendFile(__dirname + '/client/forge.html');
});

app.get('/minedResources', function (req, res) {
   console.log("Page requested: minedResources");
   getMinedResourcesAndRespond(req.query.name, res);
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

function getDailyResources(name, res) {
   var pgClient = new pg.Client(conString);
   var lastShardReceived;
   var lastSketchReceived;
   //var response = res;
   pgClient.connect(function(err) {
      if (err) {
         return console.error('Could not connect');
      }
      pgClient.query("SELECT * FROM Competitor WHERE UserName = '" + name + "'", function(err, result) {
         if (err) {
            console.error(err);
            return console.error('Error running query');
         }
         console.log(result.rows[0]);
         var today = new Date();
         console.log(today);
         if (result.rows[0])
         {
            lastSketchReceived = new Date(result.rows[0].lastsketchacquired);
            lastShardReceived = new Date(result.rows[0].lastshardacquired);
            console.log("Sketch: " + lastSketchReceived);
            console.log("Shard: " + lastShardReceived);
         }
         pgClient.end();

         var now = new Date();
         var diff = Math.abs(now - lastSketchReceived);
         var sketchReceived = diff < 86400000;
         console.log(diff);

         diff = Math.abs(now - lastShardReceived);
         var shardReceived = diff < 86400000;
         console.log(diff);
         //console.log(response);
         res.json({shardCollected: shardReceived, sketchCollected: sketchReceived});
      });
   });
};

function verfiyUserAndRespond(username, response) {
   var pgClient = new pg.Client(conString);
   
   pgClient.connect(function(err) {
      if (err) {
         return console.error('Could not connect');
      }
      pgClient.query("INSERT INTO Competitor (username, LastSketchAcquired, LastShardAcquired) "
         + "SELECT '" + username + "', '2000-01-01', '2000-01-01' "
         + "WHERE NOT EXISTS ("
            + "SELECT UserName FROM Competitor WHERE UserName = '" + username + "');", function(err, result) {
         if (err) {
            console.error(err);
            return console.error('Error running query');
         }
         
         pgClient.end();
         
         response.sendFile(__dirname + '/client/lobby.html');
      });
   });
};

function getRandomColor() {
   return Math.floor(Math.random() * 1000) % maxColor;
};

function getRandomSketch() {

   return {typeId: Math.floor(Math.random() * 1000) % maxRobotTypeId + 1, seqNum: Math.floor(Math.random() * 1000) % maxSequenceNum + 1};
};

function saveShardAndRespond(username, colorId, response) {
   var pgClient = new pg.Client(conString);

   pgClient.connect(function(err) {
      if (err) {
         return console.error('Could not connect');
      }
      pgClient.query(
         "INSERT INTO MinedResource (CompetitorID, MinedResourceTypeID, Color) "
         + "(SELECT C.CompetitorID, 1, " + colorId 
         + " FROM Competitor C "
         + "WHERE UserName = '" + username + "');", function(err, result) {

        /* pgClient.query("INSERT INTO MinedResource (CompetitorID, MinedResourceTypeID, Color) (
SELECT C.CompetitorID, 1, " + colorId + "
FROM Competitor C
WHERE UserName = '" + username + "');", function(err, result) {*/
         if (err) {
            console.error(err);
            return console.error('Error running query');
         }

         pgClient.query("UPDATE Competitor " 
            + "SET LastShardAcquired = current_date "
            + "WHERE UserName = '" + username + "';", function (err, result) {
               if (err) {
                  console.error(err);
                  return console.error('Error running query');
               }

               pgClient.end();      
               response.json({color: colorId});
         });
      });
   });
};

function saveSketchAndRespond(username, sketch, response) {
   var pgClient = new pg.Client(conString);

   pgClient.connect(function(err) {
      if (err) {
         return console.error('Could not connect');
      }
      pgClient.query(
         "INSERT INTO Sketch (CompetitorID, RobotTypeID, SeqNum) "
         + "(SELECT C.CompetitorID, " + sketch.typeId + ", " + sketch.seqNum 
         + " FROM Competitor C "
         + "WHERE UserName = '" + username + "');", function(err, result) {
        
         if (err) {
            console.error(err);
            return console.error('Error running query');
         }

         pgClient.query("UPDATE Competitor " 
            + "SET LastSketchAcquired = current_date "
            + "WHERE UserName = '" + username + "';", function (err, result) {
               if (err) {
                  console.error(err);
                  return console.error('Error running query');
               }

               pgClient.end();      
               response.json(sketch);
         });
      });
   });
};

function getMinedResourcesAndRespond(userName, response) {
   var pgClient = new pg.Client(conString);

   pgClient.connect(function(err) {
      if (err) {
         return console.error('Could not connect');
      }
      pgClient.query(
         "SELECT MinedResourceID, MinedResourceTypeID, Color, Used"
         +" FROM MinedResource MR"
         +"   INNER JOIN Competitor C ON MR.CompetitorID = C.CompetitorID"
         +" WHERE C.UserName = '" + userName + "';", function(err, result) {
        
         if (err) {
            console.error(err);
            return console.error('Error running query');
         }
         
         console.log(result.rows);
         var rows = result.rows;
         pgClient.end();
         response.json(rows);         
      });
   });
};

function getSketchResourcesAndRespond(userName, response) {
   var pgClient = new pg.Client(conString);

   pgClient.connect(function(err) {
      if (err) {
         return console.error('Could not connect');
      }
      pgClient.query(
         "SELECT SketchID, RobotTypeID, SeqNum"
         +" FROM Sketch S"
         +"   INNER JOIN Competitor C ON S.CompetitorID = C.CompetitorID"
         +" WHERE C.UserName = '" + userName + "';", function(err, result) {
        
         if (err) {
            console.error(err);
            return console.error('Error running query');
         }
         
         console.log(result.rows);
         var rows = result.rows;
         pgClient.end();
         response.json(rows);         
      });
   });
};
