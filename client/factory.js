$(document).ready(function() {
   var name = sessionStorage.getItem('name');
   $("#name").text(name);

   console.log("requesting sketches");
   $.getJSON('/sketchResources?name=' + name)
   .done(function(data) {
      console.log("Sketch Resources received.")
      console.log(data);
      var resources = [];
      $.each(data, function(i, item) {
         resources.push('<li>Type:' + item.Name + ' Number:' + item.SeqNum + '</li>');
      });
      $('#resources').append(resources.join(''));
   });
});