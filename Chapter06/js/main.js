var map;
var minValue;
var dataStats = {};

//creates the base map and runs the primary fetch functions
function createMap() {

    map = L.map('map').setView([34, -111], 4);

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    getData();
    getBorderWall();
}

// function calculateMinValue(json) {
//     //create empty array to store all data values
//     var allValues = [];
//     //loop through each sector 
//     for (var sector of json.features) {
//         for (var year = 2014; year <= 2020; year += 1) {
//             //get apprehension data for current year
//             var value = sector.properties["FY" + String(year) + "_total"];
//             //add value to array
// //             allValues.push(value);
//         }
//     }
//     //get minimum value of our array
//     var minValue = Math.min(...allValues)

//     return minValue;
// }

function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = .15;
    //Flannery Apperance Compensation formula
    var radius = 1.0083 * Math.pow(attValue / dataStats.min, 0.5715) * minRadius

    return radius;
};

// refactoring popup design through procedural javascript
//function createPopupContent(properties, attribute){
//      //add city to popup content string
//      var popupContent = "<p><b>CBP Sector Name: </b>" + properties.sector + "</p>";

//      //add year to pop
//      var year = attribute.split("_")[0];

//      popupContent += "<p><b>Border Apprehensions in " + year + ": </b>" + properties[attribute] + "</p>";

//      return popupContent;
// }

//refactoring popup design using object oriented javascript
function PopupContent(properties, attribute) {
    this.properties = properties;
    this.attribute = attribute;
    this.year = attribute.split("_")[0]
    this.apprehensions = this.properties[attribute];
    this.formatted = "<p><b>CBP Sector Name: </b>" + this.properties.sector + "</p><p><b>Border Apprehensions in " + this.year + ": </b>" + this.apprehensions + "</p>";
}

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
    var popupContent = new PopupContent(feature.properties, attribute);

    layer.bindPopup(popupContent.formatted);

    //return the circle marker to the L.geoJSON pointToLayer option
    return layer;
};

//Add circle markers for point features to the map
function createPropSymbols(json, attributes) {

    //create a Leaflet geoJSON layer and add it to the map
    L.geoJSON(json, {
        pointToLayer: function (feature, latlng) {
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map)
};

function createSequenceControls(json, attributes) {

    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function () {
            //create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');

            //create range input element (slider)
            container.insertAdjacentHTML('beforeend', '<input class="range-slider" type="range">');

            //add skip buttons
            container.insertAdjacentHTML('beforeend', '<button class="step" id="reverse" title="Reverse"><img src="img/reverse.png"></button>');
            container.insertAdjacentHTML('beforeend', '<button class="step" id="forward" title="Forward"><img src="img/forward.png"></button>');
            //set slider attributes
            container.querySelector(".range-slider").max = 6;
            container.querySelector(".range-slider").min = 0;
            container.querySelector(".range-slider").value = 0;
            container.querySelector(".range-slider").step = 1;

            //disable any mouse event listeners for the container
            L.DomEvent.disableClickPropagation(container);

            return container;
        }
    });

    map.addControl(new SequenceControl()); //add listeners after adding control


    //add click listener for buttons
    document.querySelectorAll('.step').forEach(function (step) {
        step.addEventListener("click", function () {
            var index = document.querySelector('.range-slider').value;
            //increment or decrement depending on button clicked
            if (step.id == 'forward') {
                index++;
                //if past the last attribute, wrap arround to first attribute
                index = index > 6 ? 0 : index;
            } else if (step.id == 'reverse') {
                index--;
                //if past the first attribute, wrap around to last attribute
                index = index < 0 ? 6 : index;
            };

            //update slider
            document.querySelector('.range-slider').value = index;

            //pass new attribute to update symbols
            updatePropSymbols(json, attributes[index]);
        })
    })

    //input listener for slider
    document.querySelector('.range-slider').addEventListener('input', function () {
        //get the new index value
        var index = this.value;
        updatePropSymbols(attributes[index]);
    });
};




//Resize proportional symbols according to new attribute values
function updatePropSymbols(json, attribute) {

    var year = attribute.split("_")[0];
    //update temporal legend
    document.querySelector("span.year").innerHTML = year;

    map.eachLayer(function (layer) {

        if (layer.feature && layer.feature.properties[attribute]) {
            var props = layer.feature.properties

            //update the layer style and popup
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            var popupContent = new PopupContent(props, attribute);

            //update popup content
            popup = layer.getPopup();
            popup.setContent(popupContent.formatted).update();


        };
    });
    //update legend content
    updateLegend(json, attribute);
};

function updateLegend(json, attribute) {
    var year = attribute.split("_")[0];
    //replace legend content
    document.querySelector("span.year").innerHTML = year;

    calcStats(json, attribute);

    //get the max, mean, and min values as an object
    var circles = ["max", "mean", "min"];

    var legendCircles = {
        max: dataStats.max,
        mean: 10000,
        min: 1000
    }

    for (var i = 0; i < legendCircles.length; i++) {
        //get the radius
        var radius = calcPropRadius(legendCircles[circles[i]]);

        document.querySelector("#" + circles[i]).setAttribute("cy", 59 - radius);
        document.querySelector("#" + circles[i]).setAttribute("r", radius)

        document.querySelector("#" + circles[i] + "-text").textContent = Math.round(legendCircles[circles[i]]);
    }
};

//PSEUDOCODE FOR ATTRIBUTE LEGEND
function createLegend(attributes) {
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function () {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            container.innerHTML = '<p class="temporalLegend">CBP Apprehensions in <span class="year">FY2014</span></p>';

            // Step 1. Add an `<svg>` element to the legend container
            var svg = '<svg id="attribute-legend" width="130px" height="130px">';

            //array of circle names to base loop on
            var circles = ["max", "mean", "min"];

            var legendCircles = {
                max: dataStats.max,
                mean: 10000,
                min: 1000
            }


            //Step 2: loop to add each circle and text to svg string
            for (var i = 0; i < legendCircles.length; i++) {

                //Step 3: assign the r and cy attributes  
                var radius = calcPropRadius(legendCircles[circles[i]]);
                var cy = 130 - radius;

                //circle string  
                svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#F47821" fill-opacity="0.8" stroke="#000000" cx="65"/>';

                //evenly space out labels            
                var textY = i * 20 + 20;

                //text string            
                svg += '<text id="' + circles[i] + '-text" x="65" y="' + textY + '">' + Math.round(legendCircles[circles[i]]) + '</text>';

            };

            //close svg string
            svg += "</svg>";

            //add attribute legend svg to container
            container.insertAdjacentHTML('beforeend', svg);

            L.DomEvent.disableClickPropagation(container);

            return container;
        }
    });

    map.addControl(new LegendControl());

}


function calcStats(json, attribute) {
    //create empty array to store all data values
    var allValues = [];
    //loop through each sector
    for (var sector of json.features) {
        //get population for current year
        var value = sector.properties[attribute];
        //add value to array
        allValues.push(value);
    }
    //get min, max, mean stats for our array
    dataStats.min = Math.min(...allValues);
    dataStats.max = Math.max(...allValues);
    //calculate meanValue
    var sum = allValues.reduce(function (a, b) { return a + b; });
    dataStats.mean = sum / allValues.length;

}

//build an attributes array from data
function processData(json) {
    //empty array to hold attributes
    var attributes = [];

    //properties of first feature in the data set
    var properties = json.features[0].properties;

    //push each attribute name into the attribute array
    for (var attribute in properties) {
        //only take attributes with FY data
        if (attribute.indexOf("FY") > -1) {
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
            // minValue = calculateMinValue(json);
            calcStats(json, attributes[0]);
            createPropSymbols(json, attributes);
            createSequenceControls(json, attributes);
            createLegend(attributes);
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
