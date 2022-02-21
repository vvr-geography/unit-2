var map;

function createMap() {

    map = L.map('map').setView([20, 0], 2);

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    getData();
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
            return response.json
        })
        .then(function (json){
            L.geoJSON(json, {
                onEachFeature: onEachFeature
            }).addTo(map);
        })
};

document.addEventListener('DOMContentLoaded', createMap)
