
var tetriminoSize = 40;
var boardHeight = 16;
var colors = ["#E60000", "#00E600", "#FFFF47", "#75FFFF", "#0033CC", "#FF9933", "#CC33FF"];
var images = ["redTetrimino.jpg", "greenTetrimino.jpg", "yellowTetrimino.jpg", "tealTetrimino.jpg", "blueTetrimino.jpg", "orangeTetrimino.jpg", "purpleTetrimino.jpg"];
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
var pieces = [];
var attackPoints = [0, 0, 0, 0, 0, 0, 0];
var accumulatorPoints = [0, 0, 0, 0, 0, 0, 0];

function startGame() {
   document.addEventListener('keydown', keydown, false);
   console.log("Starting board setup.")
   playing = true;
   totalLinesCleared = 0;
   clearCanvas();
   boardSetup();
   populatePieces(3);
   piece = getNextPiece();
   console.log(piece);
   startFallingPiece();
   console.log(attackPoints);
   console.log(accumulatorPoints);
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
   drawPiece(getGameBoard(), piece, xOffset, yOffset);
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

      piece = getNextPiece();
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
      drawPiece(getGameBoard(), piece, xOffset, yOffset);
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
   drawPiece(getGameBoard(), piece, xOffset, yOffset);
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

function drawBlock(canvas, x, y, colorIndex, scale) {
   scale = scale || 1;
      
      var img = new Image();
      img.src = images[colorIndex]; //'redTetrimino.jpg';
      canvas.drawImage(img, x * tetriminoSize * scale, y * tetriminoSize * scale, tetriminoSize * scale, tetriminoSize * scale);
}

function drawPiece(canvas, piece, xOffset, yOffset, scale)
{
   //console.log("Drawing piece to scale: " + scale);
   scale = scale || 1;
   //console.log("Drawing piece Row:" + yOffset + " Column:" + xOffset);
   for(var y = 0; y < piece.shape.length; y++)
   {
      for(var x = 0; x < piece.shape[y].length; x++)
      {
         if (piece.shape[y][x] == 1)
            drawBlock(canvas, x + xOffset, y + yOffset, piece.color, scale);
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
   attack();
   console.log("Accumulator Totals:");
   console.log(accumulatorPoints);
}

function clearLine(rowIndex)
{
   getGameBoard().clearRect(0, rowIndex * tetriminoSize, tetriminoSize * 10, tetriminoSize);   
   adjustBoard(rowIndex);
}

function scoreLine(rowIndex, linesCleared)
{
   console.log("Scoring line");
   console.log(attackPoints);
   console.log(accumulatorPoints);

   var counts = calculateTetriminoColors(rowIndex);
   calculateAttackPoints(counts);
   calculateAccumulatorPoints(counts, linesCleared);

   console.log("Finished Scoring");
   console.log(attackPoints);
   console.log(accumulatorPoints);
}

function calculateTetriminoColors(rowIndex)
{
   var tetriminoCounts = [0, 0, 0, 0, 0, 0, 0];
   for(var x = 0; x < 10; x++)
   {
      tetriminoCounts[board[rowIndex][x]] += 1;
   }
   return tetriminoCounts;
}

function calculateAttackPoints(counts)
{
   for(var i = 0; i < counts.length; i++)
   {
      console.log("Adding " + counts[i] + " points to index " + i);
      attackPoints[i] = attackPoints[i] + counts[i];
      console.log(attackPoints);
   }
}

function calculateAccumulatorPoints(counts, linesCleared)
{
   if (linesCleared >= 2)
   {
      for(var i = 0; i < counts.length; i++)
      {
         accumulatorPoints[i] = accumulatorPoints[i] + counts[i] * linesCleared;
      }
   }
}

function attack()
{
   //dispense damage
   console.log("Attack");
   console.log(attackPoints);

   attackPoints = [0, 0, 0, 0, 0, 0, 0];
}

function getNextPiece()
{
   var nextPiece = pieces.shift();
   pieces.push(getRandomPiece());
   drawPiecePreview();
   return nextPiece;
}

function getRandomPiece() {
   var pieceIndex = Math.floor(Math.random() * 1000) % 7;
   return {shape: rotations[pieceIndex][0], rotationIndex: 0, color: pieceIndex};      
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
            drawBlock(getGameBoard(), x, y, board[y][x]);
         }
      }
   }
}

function drawPiecePreview() {
   var preview = getPreviewCanvas();
   preview.clearRect(0, 0, 5 * tetriminoSize/2, 16 * tetriminoSize/2);
   var pieceCount = 0;
   while(pieceCount < pieces.length)
   {
      drawPiece(preview, pieces[pieceCount], 1, pieceCount * 5 + 1, .5);
      pieceCount++;
   }
}

function populatePieces(count)
{
   for(var i = 0; i < count; i++)
   {
      var randomPiece = getRandomPiece();
      pieces.push(randomPiece);
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

function getPreviewCanvas()
{
   var c = document.getElementById("piecePreview");
   var ctx = c.getContext("2d");
   return ctx;
}
