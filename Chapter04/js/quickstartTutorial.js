
//L.map creates a map on the page
var map = L.map('map').setView([51.505, -0.09], 13);

//L.tileLayer loads and displays tilelayers on the map
var Stadia_AlidadeSmooth = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
    maxZoom: 20,
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
}).addTo(map);

//L.marker displays clickable or draggable markers on the map
var marker = L.marker([51.505, -0.09]).addTo(map);

//L.circle draws a circle overlay on the map
var circle = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(map);

//L.polygon draws a polygon shape on the map
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(map);

//.bindPopup binds a popup to a marker click, includes content as well
//.openPopup makes sure only one popup is open at once
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon");

//L.popup is a way to open up a popup on the page without a marker
var popup = L.popup()
    //.setLatLng defines a location
    .setLatLng([51.513, -0.09])
    //.setContent determines the content
    .setContent("I am a standalone popup!")
    //.openOn opens the popup onto the map
    .openOn(map);

//this is a function that resets the popup variable everytime the map is clicked
function onMapClick(e) {
    popup
        //.setLatLng defines a location
        .setLatLng(e.latlng)
        //.setContent determines the content
        .setContent("You clicked the map at " + e.latlng.toString())
        //.openOn opens the popup onto the map
        .openOn(map);
}

//.on is an event listener waiting for a 'click' in this case, at which point it will run onMapClick
map.on('click', onMapClick);