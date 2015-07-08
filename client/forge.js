$(document).ready(function() {
   var name = sessionStorage.getItem('name');
   $("#name").text(name);

   console.log("requesting mined Resources");
   $.getJSON('/minedResources?name=' + name)
   .done(function(data) {
      console.log("Mined Resources received.")
      console.log(data);
      var resources = [];
      $.each(data, function(i, item) {
         resources.push('<li>Type:' + item.minedresourcetypeid + 'Color:' + item.color + '</li>');
      });
      $('#resources').append(resources.join(''));
   });
});