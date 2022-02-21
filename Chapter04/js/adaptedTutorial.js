//create global map variable
var map; 


//function to create a map in Leaflet and load with DOM
function createMap() {
    map = L.map('map').setView([20, 0], 2);

    //add tile layer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    //call getData function
    getData();
}

function onEachFeature (feature, layer) {
    var popupContent = "";
    if (feature.properties) {
        for (var property in feature.properties) {
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
    } layer.bindPopup(popupContent);
};

function getData() {
    //load MegaCities.geojson data with AJAX
    fetch("data/MegaCities.geojson")
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
             //create marker options
             var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJSON(json, {
                pointToLayer:function (feature, latlng){
                    return L.circleMarker(latlng, geojsonMarkerOptions)
                }, 
                onEachFeature: onEachFeature
            }).addTo(map);
        });
};

document.addEventListener('DOMContentLoaded', createMap)





// //this function is assessing whether the geoJSON features have a propery named popup content, and binds a popup to it
// function onEachFeature(feature, layer) {
//     if (feature.properties && feature.properties.popupContent) {
//         layer.bindPopup(feature.properties.popupContent);
//     }
// }

// //this variable has two geoJSON objects in it
// var geojsonFeature = [{
//     "type": "Feature",
//     "properties": {
//         "name": "Coors Field",
//         "amenity": "Baseball Stadium",
//         "popupContent": "This is where the Rockies play!",
//         "show_on_map": true
//     },
//     "geometry": {
//         "type": "Point",
//         "coordinates": [-104.99404, 39.75621]
//     },
// }, {
//     "type": "Feature",
//     "properties": {
//         "name": "Busch Field",
//         "show_on_map": false
//     },
//     "geometry": {
//         "type": "Point",
//         "coordinates": [-104.98404, 39.74621]
//     }
// }];

// //L.geoJSON represents a geoJSON object or set of objects (in this case geojsonFeature), allows you to display on map, and manipulate it 
// L.geoJSON(geojsonFeature, {
//     //onEachFeature is a function that attaches events or popups (like this case) to features
//     onEachFeature: onEachFeature,
//     //filter is a function that determines whether to include a feature or not
//     filter: function (feature, layer) {
//         return feature.properties.show_on_map;
//     }
// }).addTo(map);

// //myLines is a variable that adds two line strings
// var myLines = [{
//     "type": "LineString",
//     "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
// }, {
//     "type": "LineString",
//     "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
// }];

// var myStyle = {
//     "color": "#ff7800",
//     "weight": 5,
//     "opacity": 0.65
// };

// //L.geoJSON represents a geoJSON object or set of objects (in this case myLines), allows you to display on map, and manipulate it 
// L.geoJSON(myLines, {
//     style: myStyle
// }).addTo(map);

// //states is a variable that defiens two geoJSON polygons
// var states = [{
//     "type": "Feature",
//     "properties": { "party": "Republican" },
//     "geometry": {
//         "type": "Polygon",
//         "coordinates": [[
//             [-104.05, 48.99],
//             [-97.22, 48.98],
//             [-96.58, 45.94],
//             [-104.03, 45.94],
//             [-104.05, 48.99]
//         ]]
//     }
// }, {
//     "type": "Feature",
//     "properties": { "party": "Democrat" },
//     "geometry": {
//         "type": "Polygon",
//         "coordinates": [[
//             [-109.05, 41.00],
//             [-102.06, 40.99],
//             [-102.03, 36.99],
//             [-109.04, 36.99],
//             [-109.05, 41.00]
//         ]]
//     }
// }];
// //L.geoJSON represents a geoJSON object or set of objects (in this case states), allows you to display on map, and manipulate it 
// L.geoJSON(states, {
//     style: function (feature) {
//         switch (feature.properties.party) {
//             case 'Republican': return { color: "#ff0000" };
//             case 'Democrat': return { color: "#0000ff" };
//         }
//     }
// }).addTo(map);

// //someGeojsonFeature is a geoJSON point feature
// var someGeojsonFeature = {
//     "type": "Feature",
//     "properties": {
//         "name": "Coors Field",
//         "amenity": "Baseball Stadium",
//         "popupContent": "This is where the Rockies play!"
//     },
//     "geometry": {
//         "type": "Point",
//         "coordinates": [-104.99404, 39.75621]
//     }
// };

// //this variable is defines style parameters
// var geojsonMarkerOptions = {
//     radius: 8,
//     fillColor: "#ff7800",
//     color: "#000",
//     weight: 1,
//     opacity: 1,
//     fillOpacity: 0.8
// };

// //L.geoJSON adds someGeoJSONFeature to map
// L.geoJSON(someGeojsonFeature, {
//     //function to convert a point to a layer
//     pointToLayer: function (feature, latlng) {
//         //L.circleMarker makes a circle marker using the geoJSON feature, it is styled by geojsonMarkerOptions
//         return L.circleMarker(latlng, geojsonMarkerOptions);
//     }
// }).addTo(map);


// var someFeatures = [{
//     "type": "Feature",
//     "properties": {
//         "name": "Coors Field",
//         "show_on_map": true
//     },
//     "geometry": {
//         "type": "Point",
//         "coordinates": [-104.99404, 39.75621]
//     }
// }, {
//     "type": "Feature",
//     "properties": {
//         "name": "Busch Field",
//         "show_on_map": false
//     },
//     "geometry": {
//         "type": "Point",
//         "coordinates": [-104.98404, 39.74621]
//     }
// }];

// L.geoJSON(someFeatures, {
//     filter: function(feature, layer) {
//         return feature.properties.show_on_map;
//     }
// }).addTo(map);

