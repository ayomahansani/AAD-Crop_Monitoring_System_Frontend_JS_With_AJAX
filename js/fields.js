
$(document).ready(function () {
    initMap();
    loadFieldsTable();
});




let map = null;




// Define a global variable for field code
let selectedFieldCode = null;




// upload field Image 1
$('#fieldImage1').on('change', function () {

    const file1 = this.files[0]; // Get the selected file
    const previewImage1 = $('#previewFieldImage1'); // Image preview element
    const noImage1Text = $('#noFieldImage1Text'); // No image text element

    if (file1) {
        const reader = new FileReader();

        // Load the file and update the preview
        reader.onload = function (e) {
            previewImage1.attr('src', e.target.result); // Set image source
            previewImage1.show(); // Show the image
            noImage1Text.hide(); // Hide the "No image selected" text
        };

        reader.readAsDataURL(file1); // Read the file as a Data URL
    } else {
        // If no file is selected, reset the preview
        previewImage1.hide();
        noImage1Text.show();
    }
});




// upload field Image 2
$('#fieldImage2').on('change', function () {

    const file2 = this.files[0]; // Get the selected file
    const previewImage2 = $('#previewFieldImage2'); // Image preview element
    const noImage2Text = $('#noFieldImage2Text'); // No image text element

    if (file2) {
        const reader = new FileReader();

        // Load the file and update the preview
        reader.onload = function (e) {
            previewImage2.attr('src', e.target.result); // Set image source
            previewImage2.show(); // Show the image
            noImage2Text.hide(); // Hide the "No image selected" text
        };

        reader.readAsDataURL(file2); // Read the file as a Data URL
    } else {
        // If no file is selected, reset the preview
        previewImage2.hide();
        noImage2Text.show();
    }
});




// When a field Image 1 file is selected, update the file name display
$("#fieldImage1").on("change", function () {
    var fileName = $(this).val().split("\\").pop() || "No file chosen";
    $("#fileName").text(fileName);
});




// When a field Image 1 file is selected, update the file name display
$("#fieldImage2").on("change", function () {
    var fileName = $(this).val().split("\\").pop() || "No file chosen";
    $("#fileName").text(fileName);
});




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

        var formattedLocation = "Longitude: " + lng + ", Latitude: " + lat ;

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
// -------------------------- The end - initialize the map --------------------------





// -------------------------- The start - update the map --------------------------
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
// -------------------------- The end - update the map --------------------------




// -------------------------- The start - field table loading --------------------------
function loadFieldsTable() {

    // Fetch fields and populate the table
    $.ajax({
        url: "http://localhost:5052/cropMonitoringSystem/api/v1/fields", // fields API
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (results) {
            $('#field-tbl-tbody').empty(); // Clear existing table body

            results.forEach(function (field) {

                // Nested AJAX to fetch staffs for each field
                $.ajax({
                    url: `http://localhost:5052/cropMonitoringSystem/api/v1/fields/${field.fieldCode}/staff`,
                    type: "GET",
                    headers: {
                        "Authorization": "Bearer " + localStorage.getItem("token")
                    },
                    success: function (staffs) {
                        // Collect staff names into a comma-separated string
                        const staffNames = staffs.map(staff => staff.firstName).join(", ");

                        const image1Link = field.fieldImage1
                            ? `<a href="#" class="view-fieldImage1" data-image="${field.fieldImage1}" style="color: darkgreen; font-size: 14px; font-weight: 600;" >Field Image 1</a>`
                            : `<span style="color: darkgreen; font-size: 14px;">No Image</span>`;

                        const image2Link = field.fieldImage2
                            ? `<a href="#" class="view-fieldImage2" data-image="${field.fieldImage2}" style="color: darkgreen; font-size: 14px; font-weight: 600;" >Field Image 2</a>`
                            : `<span style="color: darkgreen; font-size: 14px;">No Image</span>`;

                        // Create the field table row, including staff names
                        let row = `
                            <tr>
                                <td class="field-name-value">${field.fieldName}</td>
                                <td class="field-location-value">${field.fieldLocation.x} , ${field.fieldLocation.y}</td>
                                <td class="field-extentsize-value">${field.fieldExtentsize}</td>
                                <td>${image1Link}</td>
                                <td>${image2Link}</td>
                                <td class="field-assigned-staffNames" style="color:darkgreen; font-weight: 600" >${staffNames || "No staffs assigned"}</td>
                            </tr>
                        `;
                        $('#field-tbl-tbody').append(row); // Append the row to the table
                    },
                    error: function (xhr) {
                        console.error("Error fetching assigned staffs:", xhr.responseText);
                    }
                });

            });
        },
        error: function (error) {
            console.error("Failed to load fields:", error);
            alert('Failed to load field data.');
        }
    });

}
// -------------------------- The end - field table loading --------------------------




// -------------------------- The start - Handle click event for viewing field image 1 --------------------------
$('#field-tbl-tbody').on('click', '.view-fieldImage1', function (e) {
    e.preventDefault(); // Prevent default link behavior

    const base64Image = $(this).data('image'); // Get the base64 image from the data attribute

    if (base64Image) {
        // Set the base64 image in the modal
        $('#seeFieldImage1').attr('src', `data:image/jpeg;base64,${base64Image}`);
        // Show the modal
        $('#fieldImage1PreviewModal').modal('show');
        $("#noFieldImage1Text").text("please again select an image...");
    } else {
        alert("No image available for this field.");
    }

    // Prevent event propagation to avoid triggering the row click
    e.stopPropagation();
});
// -------------------------- The end - Handle click event for viewing field image 1 --------------------------




// -------------------------- The start - Handle click event for viewing field image 2 --------------------------
$('#field-tbl-tbody').on('click', '.view-fieldImage1', function (e) {
    e.preventDefault(); // Prevent default link behavior

    const base64Image = $(this).data('image'); // Get the base64 image from the data attribute

    if (base64Image) {
        // Set the base64 image in the modal
        $('#seeFieldImage2').attr('src', `data:image/jpeg;base64,${base64Image}`);
        // Show the modal
        $('#fieldImage2PreviewModal').modal('show');
        $("#noFieldImage2Text").text("please again select an image...");
    } else {
        alert("No image available for this field.");
    }

    // Prevent event propagation to avoid triggering the row click
    e.stopPropagation();
});
// -------------------------- The end - Handle click event for viewing field image 2 --------------------------

