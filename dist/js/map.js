//Load map
var map = L.map('map', {
  center: [41.4, 2.2],
  zoom: 13,
  maxZoom: 16,
  minZoom: 13,
  zoomControl: false,
  dragging: true
});



//cursor
L.DomUtil.addClass(map._container, 'cell-cursor-enabled');


//Map bounds
var corner1 = L.latLng(41.35, 2.10),
  corner2 = L.latLng(41.47, 2.23),
  bounds = L.latLngBounds(corner1, corner2);
map.setMaxBounds(bounds);
map.on('drag', function() { //animation on or off
  map.panInsideBounds(bounds, {
    animate: false
  });
});

//Custom basemap
var basemap = L.tileLayer('dist/base/{z}/{x}/{y}.png', {
  minZoom: 13,
  maxZoom: 16,
  tms: false,
  attribution: 'TilesXYZ'
}).addTo(map);


//Load and Style Points
//Grid

var myRenderer = L.canvas({
  padding: 0.5,
  tolerance: 5
});


var gridhot = L.geoJSON(grid, {
  filter: hotfilter,
  onEachFeature: onEachFeature,
  pointToLayer: function(feature, latlng) {
    return L.circle(latlng, stylegridhot(feature));
  }
});

function hotfilter(feature) {
  if (feature.properties.CountHOT != "0.0") return true
}

function coldfilter(feature) {
  if (feature.properties.CountCOLD != "0.0") return true
}


function neutralfilter(feature) {
  if (feature.properties.CountRESI != "0.0") return true
}


function stylegridhot(feature) {
  return {
    "renderer": myRenderer,
    "color": "#fbbe13",
    "stroke": false,
    "radius": getradius(feature.properties.CountHOT, 29.4, 58.8, 88.2, 117.6),
    "fillOpacity": 0.6
  };
}

var gridcold = L.geoJSON(grid, {
  filter: coldfilter,
  onEachFeature: onEachFeature,
  pointToLayer: function(feature, latlng) {
    return L.circle(latlng, stylegridcold(feature));
  }
});

function stylegridcold(feature) {
  return {
    "renderer": myRenderer,
    "color": "#2ef4b9",
    "stroke": false,
    "radius": getradius(feature.properties.CountCOLD, 8.4, 16.8, 25.2, 33.6),
    "fillOpacity": 0.6
  };
}

var gridresi = L.geoJSON(grid, {
  filter: neutralfilter,
  onEachFeature: onEachFeature,
  pointToLayer: function(feature, latlng) {
    return L.circle(latlng, stylegridresi(feature));
  }
});

function stylegridresi(feature) {
  return {
    "renderer": myRenderer,
    "color": "#ffffff",
    "stroke": false,
    "radius": getradius(feature.properties.CountRESI, 19.8, 39.6, 59.4, 79.2),
    "fillOpacity": 0.2
  };
}


function getradius(x, a, b, c) {
  return x < 1.0 ? 0 :
    x < a ? 30 :
    x < b ? 60 :
    x < c ? 79 :
    x > c ? 100 :
    0;
}



//retrieve information Asbtract

function onEachFeature(feature, layer) {

  layer.on('mouseover', function(e) {
    var Numhot = feature.properties.CountHOT;
    var Numcold = feature.properties.CountCOLD;
    var Numresi = feature.properties.CountRESI;

    var outputhot = document.getElementById("counthot");
    outputhot.innerHTML = Numhot + " in risk";
    var outputcold = document.getElementById("countcold");
    outputcold.innerHTML = Numcold + " resilient";
    var outputresi = document.getElementById("countresi");
    outputresi.innerHTML = Numresi + " neutral";
  });

  layer.on('mouseout', function(e) {
    var outputhot = document.getElementById("counthot");
    outputhot.innerHTML = "";
    var outputcold = document.getElementById("countcold");
    outputcold.innerHTML = "";
    var outputresi = document.getElementById("countresi");
    outputresi.innerHTML = "";
  });
}


//Outline

var outline = L.geoJson(outline2, {
  onEachFeature: onEachPolygon,
  style: outline
});

function outline(feature) {
  return {
    renderer: myRenderer,
    fillColor: 'yellow',
    weight: 0.8,
    opacity: 1,
    color: getcolor(feature.properties.Type),
    fillOpacity: 0,
    lineJoin: 'round',
  };
}


function getcolor(x) {
  return x == "hot" ? "#fbbe13" :
    "#2ef4b9";
}



function onEachPolygon(feature, layer) {


  layer.on('mouseover', function(e) {
    var Name = feature.properties.Count;
    var outputName = document.getElementById("outlineinfo");
    if (feature.properties.Type == "hot") {
      outputName.innerHTML = Name + " business in risk";
    } else {
      outputName.innerHTML = Name + " resilient business";
    };
  });

  layer.on('mouseout', function(e) {
    var outputName = document.getElementById("outlineinfo");
    outputName.innerHTML = "";

  });

  layer.on({
    mouseover: highlightPoly,
    mouseout: resetPolyHighlight
  });
};

function highlightPoly(e) {
  var layer = e.target;
  var PolyHighlight = {
    "fillColor": getcolor(layer.feature.properties.Type),
    "fillOpacity": .2,
  };
  layer.setStyle(PolyHighlight);
};


function resetPolyHighlight(e) {
  var layer = e.target;
  layer.setStyle(PolyDefault);
};

var PolyDefault = {
  "fillColor": "transparent",
  "fillOpacity": 1,
};


//Control Layer Visibility

gridhot.addTo(map)
gridcold.addTo(map)
gridresi.addTo(map)

map.on('zoom', function() {
  var z = map.getZoom();

  if (z > 12 && z < 15) {
    return [gridhot.addTo(map),
        gridcold.addTo(map),
        gridresi.addTo(map)
      ],
      outline.removeFrom(map);
  }

  return [gridhot.removeFrom(map),
    gridcold.removeFrom(map),
    gridresi.removeFrom(map), outline.addTo(map)
  ];
});


// zoom in function
$('#in').click(function() {
  map.setZoom(map.getZoom() + 1)
});


// zoom out function
$('#out').click(function() {
  map.setZoom(map.getZoom() - 1)
});