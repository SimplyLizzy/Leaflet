//Define url
var earthquakeURL = "http://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php"

// Create the tile layer that will be the background of our map.
var streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Initialize all the LayerGroups that we'll use.
var earthquakeLayer = L.layerGroup();

// Create the map with our layers.
var map = L.map("map-id", {
  center: [37.09, -95.71],
  zoom: 4,
  layers: [streetmap,earthquakeLayer]
});

// Add our "streetmap" tile layer to the map.
streetmap.addTo(map);

// Create an overlays object to add to the layer control.
var overlays = {
  "Street Map": streetmap,
  "Earthquake": earthquakeLayer
};

// Create a control for our layers, and add our overlays to it.
L.control.layers(null, overlays).addTo(map);

// Perform an API call to the Earthquake information
d3.json(earthquakeURL).then(function (data){
  //console.log(data.features);

  function markerSize(magnitude){
    return magnitude * 2.5;
  }

  function quakeColor(depth) {
    switch(true) {
      case depth < 10:
        return "green";
      case depth < 30:
        return "lightgreen";
      case depth < 50: 
        return "yellow";
      case depth < 70:
        return "gold";
      case depth < 90:
        return "orange";
      default: 
        return "red";
    }
  }

  function style(feature) {
    return {
      fillOpactiy: 1,
      opacity: 1,
      stroke: true,
      radius: markerSize(feature.properties.mag),
      fillColor: quakeColor(feature.geometry.coordinates[2])
    };
  }

  L.geoJSON(earthquakeData, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },
  
    onEachFeature: function(feature, layer) {
      layer.bindPopup("<h4>Location: " + feature.properties.place + 
      "</h4><hr><p>Date & Time: " + new Date(feature.properties.time) + 
      "</p><hr><p>Magnitude: " + feature.properties.mag + 
      "</p><hr><p>Depth: " + feature.geometry.coordinates[2] + "</p>");
    }
  }).addTo(earthquakeLayer);
  earthquakeLayer.addTo(map);

  // LEGEND 
  // Create a legend to display information about our map.
  var info = L.control({ position: "topright"});
  
  // When the layer control is added, insert a div with the class of "legend".
  info.onAdd = function() {
    var div = L.DomUtil.create("div", "legend"),
    depthValue = ["<10","<30","<50","<70","<90","+90"];
  
    div.innerHTML += "<h3>Depth</h3>"
  
    for (var i = 0; i < depthValue.length; i++) {
      div.innerHTML +=
          '<i style="background: ' + quakeColor(depthValue[i] + 1) + '"></i> ' + depthValue[i] + (depthValue[i + 1] ? '&ndash;' + depthValue[i + 1] + '<br>' : '+');
    }
  
    return div;
  };
  
  // Add the info legend to the map.
  info.addTo(map);
});
