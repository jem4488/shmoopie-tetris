var sql = require('mssql');
var config = {
   user: 'BattleBlocksAdmin',
   password: 'BattleBlocksAdmin',
   server: 'localhost',
   database: 'BattleBlocks',
};

/*
var pg = require('pg');
var conString = "postgres://postgres:PostgresAdmin$$@localhost/postgres";
*/

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
app.use(express.static('client'));

var allClients = [];

var maxRobotTypeId = 4;
var maxSequenceNum = 6;
var maxMinedResourceTypeId = 3;
var maxColor = 2;
var colorMapping = [0, 2, 4];
var forgeRulesRBY = ['3,0,0', '0,1,2', '0,0,3', '0,2,1', '0,3,0', '2,0,1', '2,1,0'];


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
   var colorId = getRandomShardColor();
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

app.get('/forge/forgeRules', function (req, res) {
   console.log("Page requested: forgeRules");
   res.json(forgeRulesRBY);
})

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
   var lastShardReceived;
   var lastSketchReceived;
   //var response = res;
   var connection = new sql.Connection (config, function(err) {
      if (err) {
         console.error('Could not connect: ' + err);
         return;
      }

      var request = new sql.Request(connection);
      request.query("SELECT * FROM Competitor WHERE UserName = '" + name + "'", function(err, recordset) {
         if (err) {
            console.error("Error running query: " + err);
            return;
         }

         var today = new Date();
         console.log(today);
         if (recordset[0])
         {
            lastSketchReceived = new Date(recordset[0].LastSketchAcquired);
            lastShardReceived = new Date(recordset[0].LastShardAcquired);
            console.log("Sketch: " + lastSketchReceived);
            console.log("Shard: " + lastShardReceived);
         }
         connection.close();

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
   var connection = new sql.Connection (config, function(err) {
      if (err) {
         console.error('Could not connect: ' + err);
         return;
      }

      var request = new sql.Request(connection);
      request.query("INSERT INTO Competitor (username, LastSketchAcquired, LastShardAcquired) "
         + "SELECT '" + username + "', '2000-01-01', '2000-01-01' "
         + "WHERE NOT EXISTS ("
            + "SELECT UserName FROM Competitor WHERE UserName = '" + username + "');", function(err, recordset) {
         if (err) {
            console.error("Error running query: " + err);
            return;
         }
         
         connection.close();
         
         response.sendFile(__dirname + '/client/lobby.html');
      });
   });
};

function getRandomShardColor() {
   var rand = Math.floor(Math.random() * 1000) % maxColor;
   console.log("Random color: " + rand);
   return colorMapping[rand];
};

function getRandomSketch() {

   return {typeId: Math.floor(Math.random() * 1000) % maxRobotTypeId + 1, seqNum: Math.floor(Math.random() * 1000) % maxSequenceNum + 1};
};

function saveShardAndRespond(username, colorId, response) {
   var connection = new sql.Connection (config, function(err) {
      if (err) {
         console.error('Could not connect: ' + err);
         return;
      }

      var request = new sql.Request(connection);
      request.query(
         "INSERT INTO MinedResource (CompetitorID, MinedResourceTypeID, Color) "
         + "(SELECT C.CompetitorID, 1, " + colorId 
         + " FROM Competitor C "
         + "WHERE UserName = '" + username + "');", function(err, recordset) {

        /* pgClient.query("INSERT INTO MinedResource (CompetitorID, MinedResourceTypeID, Color) (
SELECT C.CompetitorID, 1, " + colorId + "
FROM Competitor C
WHERE UserName = '" + username + "');", function(err, result) {*/
         if (err) {
            console.error("Error running query: " + err);
            return;
         }

         request.query("UPDATE Competitor " 
            + "SET LastShardAcquired = SYSDATETIME() "
            + "WHERE UserName = '" + username + "';", function (err, recordset) {
               if (err) {
                  console.error('Error running query' + err);
                  return;
               }

               connection.close();     
               response.json({color: colorId});
         });
      });
   });
};

function saveSketchAndRespond(username, sketch, response) {
   var connection = new sql.Connection (config, function(err) {
      if (err) {
         console.error('Could not connect: ' + err);
         return;
      }

      var request = new sql.Request(connection);
      request.query(
         "INSERT INTO Sketch (CompetitorID, RobotTypeID, SeqNum) "
         + "(SELECT C.CompetitorID, " + sketch.typeId + ", " + sketch.seqNum 
         + " FROM Competitor C "
         + "WHERE UserName = '" + username + "');", function(err, recordset) {
        
         if (err) {
            console.error("Error running query: " + err);
            return;
         }

         request.query("UPDATE Competitor " 
            + "SET LastSketchAcquired = SYSDATETIME() "
            + "WHERE UserName = '" + username + "';", function (err, recordset) {
               if (err) {
                  console.error('Error running query' + err);
                  return;
               }

               connection.close();     
               response.json(sketch);
         });
      });
   });
};

function getMinedResourcesAndRespond(userName, response) {
   var connection = new sql.Connection(config, function(err) {
       if (err) {
         console.log('Could not connect: ' + err);
         return;
       }
       
       var request = new sql.Request(connection); // or: var request = connection.request(); 
       request.query("SELECT MR.MinedResourceID, MR.MinedResourceTypeID, MRTL.Name, MR.Color, MR.Used"
         +" FROM MinedResource MR"
         +"   INNER JOIN Competitor C ON MR.CompetitorID = C.CompetitorID"
         +"   INNER JOIN MinedREsourceTypeLib MRTL ON MR.MinedResourceTypeID = MRTL.MinedResourceTypeID"
         +" WHERE C.UserName = '" + userName + "';", function(err, recordset) {

           if (err) {
               console.log("Error running query:" + err)
               return;
           }
           console.log(recordset);
           connection.close();
           response.json(recordset);
       });
       
       // Stored Procedure 
       
       /*var request = new sql.Request(connection);
       request.input('input_parameter', sql.Int, 10);
       request.output('output_parameter', sql.VarChar(50));
       request.execute('procedure_name', function(err, recordsets, returnValue) {
           // ... error checks 
           
           console.dir(recordsets);
       });
       */
   });   
};

function getSketchResourcesAndRespond(userName, response) {
   var connection = new sql.Connection(config, function(err) {
      if (err) {
         console.error('Could not connect: ' + err);
         return;
      }
      var request = new sql.Request(connection);
      request.query(
         "SELECT S.SketchID, S.RobotTypeID, RTL.Name, S.SeqNum"
         +" FROM Sketch S"
         +"   INNER JOIN Competitor C ON S.CompetitorID = C.CompetitorID"
         +"   INNER JOIN RobotTypeLib RTL ON S.RobotTypeID = RTL.RobotTypeID"
         +" WHERE C.UserName = '" + userName + "';", function(err, recordset) {
        
         if (err) {
            console.error('Error running query: ' + err);
            return;
         }
         
         console.log(recordset);
         connection.close();
         response.json(recordset);         
      });
   });
};
