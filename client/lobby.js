var resources;



$(document).ready(function() {
   var name = sessionStorage.getItem('name');
   $("#name").text(name);

   $.getJSON('/dailyResources')
   .done(function(data) {
      console.log(data);
      resources = data;
      setResourceMessages();
   });
});

function setResourceMessages() {
   var mineMessage = "Click to collect your daily shard.";   
   if (resources.shardCollected === 'true')
   {   
      mineMessage = "You have already received your daily shard.";
   }
   $("#mineMessage").text(mineMessage);

   var archiveMessage = "Click to collect your daily sketch";
   console.log(resources.sketchCollected);
   if (resources.sketchCollected === 'true')
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
   if (resources.shardCollected === 'false')
   {
      // request shard from server
      resources.shardCollected = 'true';
      $("#messageText").text("You received a blank shard.").fadeIn('fast').delay(3000).fadeOut();
      $("#mineMessage").text("You have already received your daily shard.");
   }
};

function collectSketch() {
   if (resources.sketchCollected === 'false')
   {
      //request sketch from the server
      resources.sketchCollected = 'true';
      $("#messageText").text("You received a blank sketch.").fadeIn('fast').delay(3000).fadeOut();
      $("#archiveMessage").text("You have already received your daily sketch.");
   }
};