var shardResources;
var gemResources;
var crystalResources;
var selection;

function findResources(resources, colorId, typeId)
{
   return _.where(resources, {color: colorId, minedresourcetypeid: typeId});
}

function populateResourceList(resources, typeId)
{  
   var list = [];
   for(var colorId = 0; colorId < 7; colorId++)
   {
      list.push(findResources(resources, colorId, typeId));
   }
   return list;
}

function getListItems(list, includeIsUsed)
{
   console.log(list);
   var resources = [];
   for(var i = 0; i < 7; i++)
   {
      if (list[i].length > 0) 
         resources.push("<li onClick='addSelectedClass(this)'>Color: " + i + ' (' + globalColorNameMapping[i] + '), Count: ' + list[i].length + '</li>');  
   }   
   return resources;
}

function addSelectedClass(element)
{
   if(selection)
   {
      var oldElement = $(selection);
      console.log(oldElement);
      oldElement.removeAttr('class', 'selected');
   }   

   console.log(element);
   $(element).attr('class', 'selected');
   selection = element;
}

$(document).ready(function() {
   var name = sessionStorage.getItem('name');
   $("#name").text(name);

   console.log("requesting mined Resources");

   $.getJSON('/minedResources?name=' + name)
   .done(function(data) {
      console.log("Mined Resources received.")
      console.log(data);

      shardResources = populateResourceList(data, 1);
      $('#shardResources').append(getListItems(shardResources).join(''));

      gemResources = populateResourceList(data, 2);
      $('#gemResources').append(getListItems(gemResources).join(''));
      
      crystalResources = populateResourceList(data, 3);
      $('#crystalResources').append(getListItems(crystalResources).join(''));      
   });

   $.getJSON('/forge/forgeRules')
   .done(function (data) {
      var rules = [];
      $.each(data, function (i, item) {
         console.log(item);
         var parts = item.split(',');
         rules.push('<li>Red: ' + parts[0] + ' Blue: ' + parts[1] + ' Yellow: ' + parts[2] + '</li>');
      });
      $('#forgeRules').append(rules.join(''));
   });
});