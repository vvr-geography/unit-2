var map;
var minValue;

function createMap() {

    map = L.map('map').setView([34, -111], 4);

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    getData();
    getBorderWall();
}

function calculateMinValue(json){
     //create empty array to store all data values
     var allValues = [];
     //loop through each sector 
     for (var sector of json.features){
         for (var year = 2014; year <= 2020; year+=1){
             //get apprehension data for current year
             var value = sector.properties["FY" + String(year) +"_total"];
             //add value to array
             allValues.push(value);
         }
     }
     //get minimum value of our array
     var minValue = Math.min(...allValues)

     return minValue;
}

function calcPropRadius(attValue) {
     //constant factor adjusts symbol sizes evenly
     var minRadius = .15;
     //Flannery Apperance Compensation formula
     var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius

     return radius;
};

function onEachFeature(feature, layer) {
    var popupContent = "";
    if (feature.properties) {
        for (var property in feature.properties) {
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
    } layer.bindPopup(popupContent);
};

function createPropSymbols(json) {
    
    var attribute = "FY2014_total";
    
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    L.geoJSON(json, {
        pointToLayer: function (feature, latlng) {
            var attValue = Number(feature.properties[attribute]);

            geojsonMarkerOptions.radius = calcPropRadius(attValue);

            return L.circleMarker(latlng, geojsonMarkerOptions)
        },
        onEachFeature: onEachFeature
    }).addTo(map);
};


function getData() {
    fetch('data/borderApprehensionData.geojson')
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            minValue = calculateMinValue(json);
            createPropSymbols(json);
        })
};

function getBorderWall() {
    fetch('data/border_fence_map.geojson')
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {

            var borderStyle = {
                "color": "#ff7800",
                "weight": 5,
                "opacity": 0.65
            };

            L.geoJSON(json, {
                style: function (feature) {
                    return L.polyline(feature, borderStyle)
                }
            }).addTo(map);
        })
};

document.addEventListener('DOMContentLoaded', createMap);