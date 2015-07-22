$(document).ready(function() {
   var name = sessionStorage.getItem('name');
   $("#name").text(name);

   console.log("requesting sketches");
   $.getJSON('/sketchResources?name=' + name)
   .done(function(data) {
      console.log("Sketch Resources received.")
      console.log(data);
      var groupedResources = populateResourceList(data);

      var resources = [];
      for(var i = 0; i < groupedResources.length; i++)
      {
         var list = groupedResources[i];
         resources.push("<h2>Type: " + list[0].Name + "</h2>")
         resources.push("<ul class='list'>");
         $.each(list, function(j, item) {
            resources.push('<li>Sketch Number:' + item.SeqNum + '</li>');
         });
         resources.push("</ul>");
      }

/*
      var resources = [];
      resources.push("<ul class='list'>");
      $.each(data, function(i, item) {
         resources.push('<li>Type:' + item.Name + ' Number:' + item.SeqNum + '</li>');
      });
      resources.push("</ul>");
      */
      $('#resources').append(resources.join(''));
   });
});

function findResources(resources, typeId)
{
   return _.sortBy(_.where(resources, {RobotTypeID: typeId}), 'SeqNum');
};

function populateResourceList(resources)
{  
   var list = [];
   for(var typeId = 1; typeId <= 4; typeId++)
   {
      list.push(findResources(resources, typeId));
   }
   return list;
};