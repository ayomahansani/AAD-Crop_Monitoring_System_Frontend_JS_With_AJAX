
$(document).ready(function () {
    initMap();
});




let map = null;




// -------------------------- The start - initialize the map --------------------------
function initMap(){

    // Center coordinates for Panadura, Sri Lanka
    var panaduraCoordinates = [6.7114, 79.9072];

    // Define broader bounds to cover a larger area
    var bounds = [
        [6.45, 79.75], // Southwest corner
        [7.10, 80.05]  // Northeast corner
    ];

    // Initialize map centered on Panadura with zoom level suitable for the area
    map = L.map('map', {
        center: panaduraCoordinates,
        zoom: 13,
        maxBounds: bounds,
        maxBoundsViscosity: 1.0 // Prevents panning outside bounds
    });

    // Add OpenStreetMap tiles
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Marker to display chosen location
    var marker;

    // Map click event to place marker and get coordinates
    map.on('click', function(e) {
        const lat = e.latlng.lat.toFixed(4);  // Latitude
        const lng = e.latlng.lng.toFixed(4);  // Longitude

        var formattedLocation = formatCoordinates(lat, lng); // call another function

        // Update input fields
        document.getElementById('fieldLocation').value = formattedLocation;
        console.log(formattedLocation)

        // Update marker position
        if (marker) {
            marker.setLatLng(e.latlng);
        } else {
            marker = L.marker(e.latlng).addTo(map);
        }
    });


    // Add this to refresh the map when the modal is opened
    $('#newFieldModal').on('shown.bs.modal', function () {
        map.invalidateSize(); // Refresh map to fit the container
    });
}
// -------------------------- The start - initialize the map --------------------------


// Function to format latitude and longitude
function formatCoordinates(lat, lng) {

    var latDirection = lat >= 0 ? 'N' : 'S';
    var lngDirection = lng >= 0 ? 'E' : 'W';

    var formattedLat = Math.abs(lat).toFixed(4) + '° ' + latDirection;
    var formattedLng = Math.abs(lng).toFixed(4) + '° ' + lngDirection;

    return formattedLat + ', ' + formattedLng;
}


// update the map
function updateMap(lat, lng) {
    if (!map) {  // If the map is not yet initialized, create it
        map = L.map('map').setView([lat, lng], 12);

        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    } else {
        // If the map is already initialized, just update the center and zoom
        map.setView([lat, lng], 12);
    }

    // Remove any existing markers to avoid stacking them
    if (map._layers) {
        Object.keys(map._layers).forEach(function(layerId) {
            const layer = map._layers[layerId];
            if (layer instanceof L.Marker) {
                map.removeLayer(layer); // Remove the existing marker
            }
        });
    }

    // Add a new marker to the map for the given coordinates
    L.marker([lat, lng]).addTo(map)
        .bindPopup('Field Location') // Optional: Add a popup for the marker
        .openPopup(); // Optional: Automatically open the popup
}

