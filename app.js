
var tetriminoSize = 40;
var boardHeight = 16;
var colors = ["#E60000", "#00E600", "#FFFF47", "#75FFFF", "#0033CC", "#FF9933", "#CC33FF"];
var rotations = [
   [[[1,1,0], [0,1,1]], [[0,1],[1,1],[1,0]]], // red z
   [[[0,1,1], [1,1,0]], [[1,0],[1,1],[0,1]]], // green s
   [[[1,1], [1,1]], [[1,1],[1,1]]], // yellow square
   [[[1], [1], [1], [1]], [[1,1,1,1]]], // lt blue l
   [[[1,0], [1,0], [1,1]], [[0,0,1],[1,1,1]], [[1,1],[0,1],[0,1]], [[0,0,0],[1,1,1],[1,0,0]]], // blue l
   [[[0,1], [0,1], [1,1]], [[0,0,0],[1,1,1],[0,0,1]], [[1,1],[1,0],[1,0]], [[1,0,0],[1,1,1]]], // orange j
   [[[0,1,0], [1,1,1]], [[0,1],[1,1],[0,1]], [[0,0,0],[1,1,1],[0,1,0]], [[1,0],[1,1],[1,0]]] // purple t
];
var KEY = {LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, ROTATERIGHT: 70, ROTATELEFT: 68}

var board;

var piece;
var xOffset = 4;
var yOffset = 0;
var timer;
var playing = false;
var totalLinesCleared = 0;

function startGame() {
   document.addEventListener('keydown', keydown, false);
   console.log("Starting board setup.")
   playing = true;
   totalLinesCleared = 0;
   clearCanvas();
   boardSetup();
   setRandomPiece();
   startFallingPiece();
}

function keydown(ev) {
   var handled = false;
   if (playing) {
      switch(ev.keyCode) {
         case KEY.LEFT:   movePiece(-1, 0);  handled = true; break;
         case KEY.RIGHT:  movePiece(1, 0); handled = true; break;
         case KEY.UP:     dropPiece();    handled = true; break;
         case KEY.DOWN:   movePieceDown();  handled = true; break;     
         case KEY.ROTATERIGHT: rotatePiece(-1);  handled = true; break;
         case KEY.ROTATELEFT: rotatePiece(1); handled = true; break;     
      }
   }      
   if (handled)
      ev.preventDefault(); // prevent arrow keys from scrolling the page (supported in IE9+ and all other browsers)
}

function startFallingPiece() {
   drawPiece();
   timer = window.setInterval(movePieceDown, 1000);
}

function dropPiece() {
   while(movePieceDown()){}
}

function movePieceDown() {
   if (!movePiece(0, 1))
   {
      window.clearInterval(timer);
      addPieceToBoard();
      //check cleared lines
      clearLines();

      if (yOffset == 0)
      {
         //End the Game.
         return false;;
      }

      setRandomPiece();
      xOffset = 4;
      yOffset = 0;
      startFallingPiece();
      return false;
   }
   return true;
}

function movePiece(changeX, changeY) {
   if (canPieceMove(changeX, changeY))
   {
      clearPiece(piece, xOffset, yOffset);
      yOffset += changeY;
      xOffset += changeX;
      drawPiece();
      return true;
   }
   return false;  
}

function rotatePiece(direction) {
   //console.log("Rotate: " + direction + " Current Index: " + piece.rotationIndex);
   var newRotationIndex = piece.rotationIndex + direction;
   if(newRotationIndex == rotations[piece.color].length)
      newRotationIndex = 0;
   else if (newRotationIndex < 0)
      newRotationIndex = rotations[piece.color].length - 1;

   clearPiece();
   piece.shape = rotations[piece.color][newRotationIndex];
   piece.rotationIndex = newRotationIndex;
   drawPiece();
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

   //var img = new Image();
   //img.src = 'tetrimino.jpg';
   //board.drawImage(img, x * tetriminoSize, y * tetriminoSize);
}

function drawPiece()
{
   //console.log("Drawing piece Row:" + yOffset + " Column:" + xOffset);
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
   var bottom = yOffset + piece.shape.length;
   var right = xOffset + piece.shape[0].length;

   if (bottom >= boardHeight)
      return false;
   else if (changeX > 0 && right >= 10)
      return false;
   else if (changeX < 0 && xOffset <= 0)
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
               //console.log("Collision detected. Row: " + (y + yOffset) + "Column: " + (x + xOffset));
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
   //console.log("Piece added to board");
   //console.log(logBoard());
}

function clearLines()
{
   var linesCleared = 0;
   for(var y = 0; y < boardHeight; y++)
   {
      var lineComplete = false;
      for(var x = 0; x < 10; x++)
      {
         if (board[y][x] < 0)
            break;
         else if (x == 9)
            lineComplete = true;
      }
      if (lineComplete)
      {
         linesCleared++;
         totalLinesCleared++;
         scoreLine(y, linesCleared);
         clearLine(y);
      }
   }
   console.log("Lines cleared by piece: " + linesCleared);
   console.log("Total lines cleared: " + totalLinesCleared);
}

function clearLine(rowIndex)
{
   getGameBoard().clearRect(0, rowIndex * tetriminoSize, tetriminoSize * 10, tetriminoSize);   
   adjustBoard(rowIndex);
}

function scoreLine(rowIndex, linesCleared)
{

}

function setRandomPiece() {
   var pieceIndex = Math.floor(Math.random() * 1000) % 7;
   piece = {shape: rotations[pieceIndex][0], rotationIndex: 0, color: pieceIndex};
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

function clearCanvas() {
   getGameBoard().clearRect(0, 0, 10 * tetriminoSize, boardHeight * tetriminoSize);
}

function adjustBoard(rowCleared) {
   for (var i = rowCleared; i > 0; i--)
   {
      board[i] = board[i-1];
   }
   board[0] = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
   redrawBoard();
}

function redrawBoard() {
   clearCanvas();
   for(var y = 0; y < boardHeight; y++)
   {
      for(var x = 0; x < 10; x++)
      {
         if (board[y][x] >= 0)
         {
            drawBlock(x, y, colors[board[y][x]]);
         }
      }
   }
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