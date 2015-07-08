
var resources;

$(document).ready(function() {
   var name = sessionStorage.getItem('name');
   $("#name").text(name);

   $.getJSON('/dailyResources?name=' + name)
   .done(function(data) {
      console.log(data);
      resources = data;
      setResourceMessages();
   });
});

function setResourceMessages() {
   var mineMessage = "Click to collect your daily shard.";   
   if (resources.shardCollected)
   {   
      mineMessage = "You have already received your daily shard.";
   }
   $("#mineMessage").text(mineMessage);

   var archiveMessage = "Click to collect your daily sketch";
   console.log(resources.sketchCollected);
   if (resources.sketchCollected)
   {
      archiveMessage = "You have already received your daily sketch.";
   }
   $("#archiveMessage").text(archiveMessage);
};

function goToFactory() {
   window.location.href = '/factory'
};

function goToForge() {
   window.location.href = '/forge'
};

function goToColiseum() {
   window.location.href = '/coliseum'
};

function collectShard() {
   if (!resources.shardCollected)
   {
      // request shard from server
      $.getJSON('/collectShard')
         .done(function(data) {
            console.log(data);
            resources.shardCollected = true;
            $("#messageText").text("You received a " + data.color + " shard.").fadeIn('fast').delay(3000).fadeOut();
            $("#mineMessage").text("You have already received your daily shard.");
         });
   }
};

function collectSketch() {
   if (!resources.sketchCollected)
   {
      //request sketch from the server
      $.getJSON('/collectSketch')
         .done(function(data) {
            console.log(data);
            resources.sketchCollected = true;
            $("#messageText").text("You received sketch " + data.seqNum + " for the " + data.type + " class robot.").fadeIn('fast').delay(3000).fadeOut();
            $("#archiveMessage").text("You have already received your daily sketch.");
         });
      
   }
};