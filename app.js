
var tetriminoSize = 40;
var boardHeight = 16;
var colors = ["#E60000", "#00E600", "#FFFF47", "#75FFFF", "#0033CC", "#FF9933", "#CC33FF"];
var pieces = [{shape: [[1,1,0], [0,1,1]], color: 0}, 
   {shape: [[0,1,1], [1,1,0]], color: 1},
   {shape: [[1,1], [1,1]], color: 2},
   {shape: [[1], [1], [1], [1]], color: 3},
   {shape: [[1,0], [1,0], [1,1]], color: 4},
   {shape: [[0,1], [0,1], [1,1]], color: 5},
   {shape: [[0,1,0], [1,1,1]], color: 6}];

var board;

var piece;
var xOffset = 4;
var yOffset = 0;
var timer;

function startGame() {
   console.log("Starting board setup.")
   boardSetup();
   piece = getRandomPiece();
   startFallingPiece();
}



function startFallingPiece() {
   drawPiece();
   timer = window.setInterval(movePiece, 1000);
}

function movePiece() {
   if (canPieceMove(0, 1))
   {
      clearPiece(piece, xOffset, yOffset);
      yOffset += 1;
      drawPiece(piece, xOffset, yOffset);
   }  
   else
   {
      window.clearInterval(timer);
      //check cleared lines
      if (yOffset == 0)
      {
         //End the Game.
         return;
      }
      addPieceToBoard();
      piece = getRandomPiece();
      xOffset = 4;
      yOffset = 0;
      startFallingPiece();
   } 
}

function clearBlock(x, y) {
   var board = getGameBoard();   
   board.clearRect(x * tetriminoSize, y * tetriminoSize, tetriminoSize, tetriminoSize);
}

function clearPiece()
{
   for(var y = 0; y < piece.shape.length; y++)
   {
      for(var x = 0; x < piece.shape[y].length; x++)
      {
         if (piece.shape[y][x] == 1)
            clearBlock(x + xOffset, y + yOffset);
      }
   }
}

function drawBlock(x, y, color) {
   var board = getGameBoard();
   board.fillStyle = color;
   board.fillRect(x * tetriminoSize, y * tetriminoSize, tetriminoSize, tetriminoSize);
}

function drawPiece()
{
   console.log("Drawing piece Row:" + yOffset + " Column:" + xOffset);
   for(var y = 0; y < piece.shape.length; y++)
   {
      for(var x = 0; x < piece.shape[y].length; x++)
      {
         if (piece.shape[y][x] == 1)
            drawBlock(x + xOffset, y + yOffset, colors[piece.color]);
      }
   }
}

function canPieceMove(changeX, changeY)
{
   if (yOffset + piece.shape.length >= boardHeight)
      return false;
   else if (detectPieceCollision(changeX, changeY))
      return false;
   return true;
}

function detectPieceCollision(changeX, changeY)
{
   for(var y = 0; y < piece.shape.length; y++)
   {
      for(var x = 0; x < piece.shape[y].length; x++)
      {
         if (piece.shape[y][x] == 1)
         {
            if (board[y + yOffset + changeY][x + xOffset + changeX] >= 0)
            {
               console.log("Collision detected. Row: " + (y + yOffset) + "Column: " + (x + xOffset));
               return true;
            }  
         }
      }
   }   
   return false;
}

function addPieceToBoard()
{
   for(var y = 0; y < piece.shape.length; y++)
   {
      for(var x = 0; x < piece.shape[y].length; x++)
      {
         if (piece.shape[y][x] == 1)
            board[y + yOffset][x + xOffset] = piece.color;
      }
   }   
   console.log("Piece added to board");
   //console.log(logBoard());
}

function getRandomPiece() {
   return pieces[Math.floor(Math.random() * 1000) % 7];
   //return {shape: [[1,1,0], [0,1,1]], color: 0};
   //return {shape: [[0,1,1], [1,1,0]], color: 1};
   //return {shape: [[1,1], [1,1]], color: 2};
   //return {shape: [[1], [1], [1], [1]], color: 3};
   //return {shape: [[1,0], [1,0], [1,1]], color: 4};
   //return {shape: [[0,1], [0,1], [1,1]], color: 5};
   //return {shape: [[0,1,0], [1,1,1]], color: 6};
}

function getGameBoard() {
   var c = document.getElementById("gameBoard");
   var ctx = c.getContext("2d");
   return ctx;
}

function boardSetup() {
   board = [[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1]]
   console.log("Board Setup Complete")
}

function logBoard() {
   var s;
   for(var i = 0; i < board.length; i ++)
   {
      for (var j = 0; j < board[i].length; j ++)
      {
         s = s + " " + board[i][j];
      }
      s = s + "\r\n";
   }
   return s;
}