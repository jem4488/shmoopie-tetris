function startGame() {
   startFallingBlock();
}

var x = 5;
var y = 0;
var tetriminoSize = 40;

function startFallingBlock() {
   drawBlock(x, y);
   window.setInterval(moveBlock, 1000);
}

function moveBlock() {
   clearBlock();
   y = y + 1;
   if (y >= 16)
      y = 0;
   drawBlock(x, y);
   
}

function clearBlock() {
   var c = document.getElementById("gameBoard");
   var ctx = c.getContext("2d");   
   ctx.clearRect(x * tetriminoSize, y * tetriminoSize, tetriminoSize, tetriminoSize);
}

function drawBlock(x, y) {
   var c = document.getElementById("gameBoard");
   var ctx = c.getContext("2d");
   ctx.fillStyle = "#FF0000";
   ctx.fillRect(x * tetriminoSize, y * tetriminoSize, tetriminoSize, tetriminoSize);
}