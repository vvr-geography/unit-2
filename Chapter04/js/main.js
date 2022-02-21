var map;

function createMap() {

    map = L.map('map').setView([20, 0], 2);

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    getData();
    getBorderWall();
}

function onEachFeature(feature, layer) {
    var popupContent = "";
    if (feature.properties) {
        for (var property in feature.properties) {
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
    } layer.bindPopup(popupContent);
};

function getData() {
    fetch('data/borderApprehensionData.geojson')
        .then(function (response) {
            return response.json();
        })
        .then(function (json){
            //create marker options
            var geojsonMarkerOptions = {
               radius: 8,
               fillColor: "#ff7800",
               color: "#000",
               weight: 1,
               opacity: 1,
               fillOpacity: 0.8
           };
            L.geoJSON(json, {
                pointToLayer:function (feature, latlng){
                    return L.circleMarker(latlng, geojsonMarkerOptions)
                }, 
                onEachFeature: onEachFeature
            }).addTo(map);
        })
};

function getBorderWall(){
    fetch('data/border_fence_map.geojson')
        .then(function (response){
            return response.json();
        })
        .then(function (json){

            var borderStyle = {
                "color": "#ff7800",
                "weight": 5,
                "opacity": 0.65
            };

            L.geoJSON(json, {
                style: function(feature) {
                    return L.polyline(feature, borderStyle)
                }
            }).addTo(map);
        })
};

document.addEventListener('DOMContentLoaded', createMap);
