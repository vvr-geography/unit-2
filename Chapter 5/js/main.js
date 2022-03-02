var map;
var minValue;

//creates the base map and runs the primary fetch functions
function createMap() {

    map = L.map('map').setView([34, -111], 4);

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    getData();
    getBorderWall();
}

function calculateMinValue(json) {
    //create empty array to store all data values
    var allValues = [];
    //loop through each sector 
    for (var sector of json.features) {
        for (var year = 2014; year <= 2020; year += 1) {
            //get apprehension data for current year
            var value = sector.properties["FY" + String(year) + "_total"];
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
    var radius = 1.0083 * Math.pow(attValue / minValue, 0.5715) * minRadius

    return radius;
};

//function to convert markers into circle markers
function pointToLayer(feature, latlng, attributes) {

    //Determine which attribute to visualize with proportional symbols)
    var attribute = attributes[0];

    //create marker options
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //give each feature's circle marker a radius based on its attribute value
    geojsonMarkerOptions.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, geojsonMarkerOptions);

    //build popup content string
    var popupContent = "<p><b>CBP Sector Name: </b>" + feature.properties.sector + "</p>";

    //add year to pop
    var year = attribute.split("_")[0];

    popupContent += "<p><b>Border Apprehensions in " + year + ": </b>" + feature.properties[attribute] + "</p>";

    //bind the popup to the circle marker
    layer.bindPopup(popupContent);

    //return the circle marker to the L.geoJSON pointToLayer option
    return layer;
};

//Add circle markers for point features to the map
function createPropSymbols(json, attributes) {

    //create a Leaflet geoJSON layer and add it to the map
    L.geoJSON(json, {
        pointToLayer: function (feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map)
};

function createSequenceControls(attributes) {
    //create range input element (slider)
    var slider = "<input class='range-slider' type='range'></input>";
    document.querySelector("#panel").insertAdjacentHTML('beforeend', slider);

    //set slider attributes
    document.querySelector(".range-slider").max = 6;
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;

    document.querySelector('#panel').insertAdjacentHTML('beforeend', '<button class="step" id="reverse"></button>');
    document.querySelector('#panel').insertAdjacentHTML('beforeend', '<button class="step" id="forward"></button>');

    document.querySelector('#reverse').insertAdjacentHTML('beforeend', "<img src='img/reverse.png'>")
    document.querySelector('#forward').insertAdjacentHTML('beforeend', "<img src='img/forward.png'>")

    //add click listener for buttons
    document.querySelectorAll('.step').forEach(function(step){
        step.addEventListener("click", function(){
            var index = document.querySelector('.range-slider').value;
            //increment or decrement depending on button clicked
            if(step.id == 'forward'){
                index++;
                //if past the last attribute, wrap arround to first attribute
                index = index > 6 ? 0 : index;
            } else if (step.id == 'reverse'){
                index --;
                //if past the first attribute, wrap around to last attribute
                index = index < 0 ? 6 : index;
            };

            //update slider
            document.querySelector('.range-slider').value = index;

            //pass new attribute to update symbols
            updatePropSymbols(attributes[index]);
        })
    })

    //input listener for slider
    document.querySelector('.range-slider').addEventListener('input', function(){
        //get the new index value
        var index = this.value;
        updatePropSymbols(attributes[index]);
    });
};

//Resize proportional symbols according to new attribute values
function updatePropSymbols(attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            var props = layer.feature.properties

            //update the layer style and popup
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);
           
            //add city to popup content string
            var popupContent = "<p><b>CBP Sector Name: </b>" + props.sector + "</p>";

            //add year to pop
            var year = attribute.split("_")[0];

            popupContent += "<p><b>Border Apprehensions in " + year + ": </b>" + props[attribute] + "</p>";

            //update popup content
            popup = layer.getPopup();
            popup.setContent(popupContent).update();
        };
    });
};

//build an attributes array from data
function processData(json){
    //empty array to hold attributes
    var attributes = [];

    //properties of first feature in the data set
    var properties = json.features[0].properties;

    //push each attribute name into the attribute array
    for (var attribute in properties) {
        //only take attributes with FY data
        if (attribute.indexOf("FY") > -1){
            attributes.push(attribute);
        };
    };

    return attributes;

};


function getData() {
    fetch('data/borderApprehensionData.geojson')
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            //create attributes array
            var attributes = processData(json);
            minValue = calculateMinValue(json);
            createPropSymbols(json, attributes);
            createSequenceControls(attributes);
        })
};

//fetches the borderwall data and styles it
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

//activity 6 commit