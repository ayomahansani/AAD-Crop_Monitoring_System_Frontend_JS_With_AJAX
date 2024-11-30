import {showErrorAlert} from "./crops.js";
import {loadStaffTable} from "./staff.js";




$(document).ready(function () {
    initMap();
    loadFieldsTable();
});



// Define a global variable for map
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
function updateMap(latitude, longitude) {
    // Check if the map is initialized
    if (!map) {
        // If the map is not yet initialized, create it
        map = L.map('map').setView([latitude, longitude], 13);

        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    } else {
        // If the map is already initialized, just update the center
        map.setView([latitude, longitude], 13);
    }

    // Clear existing markers (if any)
    map.eachLayer(function (layer) {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    // Add a marker at the new coordinates using the default Leaflet marker
    L.marker([latitude, longitude]).addTo(map);
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
                            </tr>
                        `;
                $('#field-tbl-tbody').append(row); // Append the row to the table

            });
        },
        error: function (error) {
            console.error("Failed to load fields:", error);
            alert('Failed to load field data.');
        }
    });

}
// -------------------------- The end - field table loading --------------------------




// -------------------------- The start - when click a field table row --------------------------
$("#field-tbl-tbody").on('click', 'tr', function (e) {

    // Check if the click was inside the field image 1 link column
    if ($(e.target).hasClass("view-fieldImage1")) {
        return; // Do nothing if the click was on the image link
    }

    // Check if the click was inside the field image 2 link column
    if ($(e.target).hasClass("view-fieldImage2")) {
        return; // Do nothing if the click was on the image link
    }

    // Extract values from the clicked row
    let fieldName = $(this).find(".field-name-value").text().trim();
    let fieldLocation = $(this).find(".field-location-value").text().trim();
    let fieldExtentsize = $(this).find(".field-extentsize-value").text().trim();
    let fieldImage1 = $(this).find(".view-fieldImage1").data("image") || null; // Get the base64 image data if available
    let fieldImage2 = $(this).find(".view-fieldImage2").data("image") || null; // Get the base64 image data if available

    // Split the string into longitude and latitude
    let [longitude, latitude] = fieldLocation.split(",").map(value => value.trim());

    // Format the result
    let formattedLocation = "Longitude: " + longitude + ", Latitude: " + latitude;

    // Initialize the map with parsed latitude and longitude
    updateMap(parseFloat(latitude), parseFloat(longitude));

    // Output
    console.log(formattedLocation);

    // Assign values to the input fields
    $("#fieldName").val(fieldName);
    $("#fieldLocation").val(formattedLocation);
    $("#fieldExtentsize").val(fieldExtentsize);

    // Set the image preview if image data exists
    if (fieldImage1) {
        $("#previewFieldImage1").attr("src", `data:image/jpeg;base64,${fieldImage1}`).show(); // Display the image
        $("#noFieldImage1Text").hide(); // Hide the 'No image selected' text
        $("#fieldImage1Text").text("please again select an image...");
    } else {
        $("#previewFieldImage1").hide(); // Hide the image element if no image
        $("#noFieldImage1Text").show(); // Show the 'No image selected' text
        $("#fieldImage1Text").text("please again select an image...");
    }

    // Set the image preview if image data exists
    if (fieldImage2) {
        $("#previewFieldImage2").attr("src", `data:image/jpeg;base64,${fieldImage2}`).show(); // Display the image
        $("#noFieldImage2Text").hide(); // Hide the 'No image selected' text
        $("#fieldImage2Text").text("please again select an image...");
    } else {
        $("#previewFieldImage2").hide(); // Hide the image element if no image
        $("#noFieldImage2Text").show(); // Show the 'No image selected' text
        $("#fieldImage2Text").text("please again select an image...");
    }

    // Find the staffId for the staff name
    $.ajax({
        url: "http://localhost:5052/cropMonitoringSystem/api/v1/fields",
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (fields) {
            // Find the fieldCode that corresponds to the FieldName
            const field = fields.find(f => f.fieldName === fieldName);
            if (field) {
                selectedFieldCode = field.fieldCode; // Set the field code
                console.log("Field code: ", selectedFieldCode);
            } else {
                console.warn("Field not found :", fieldName);
            }
        },
        error: function (error) {
            console.error("Error fetching fields:", error);
        }
    });

});
// -------------------------- The end - when click a field table row --------------------------




// -------------------------- The start - Handle click event for viewing field image 1 --------------------------
$('#field-tbl-tbody').on('click', '.view-fieldImage1', function (e) {
    e.preventDefault(); // Prevent default link behavior

    const base64Image = $(this).data('image'); // Get the base64 image from the data attribute

    if (base64Image) {
        // Set the base64 image in the modal
        $('#seeFieldImage').attr('src', `data:image/jpeg;base64,${base64Image}`);
        // Set the title
        $('#fieldImagePreviewModalLabel').text("Field Image 1");
        // Show the modal
        $('#fieldImagePreviewModal').modal('show');
        $("#fieldImage1Text").text("please again select an image...");
    } else {
        alert("No image available for this field.");
    }

    // Prevent event propagation to avoid triggering the row click
    e.stopPropagation();
});
// -------------------------- The end - Handle click event for viewing field image 1 --------------------------




// -------------------------- The start - Handle click event for viewing field image 2 --------------------------
$('#field-tbl-tbody').on('click', '.view-fieldImage2', function (e) {
    e.preventDefault(); // Prevent default link behavior

    const base64Image = $(this).data('image'); // Get the base64 image from the data attribute

    if (base64Image) {
        // Set the base64 image in the modal
        $('#seeFieldImage').attr('src', `data:image/jpeg;base64,${base64Image}`);
        // Set the title
        $('#fieldImagePreviewModalLabel').text("Field Image 2");
        // Show the modal
        $('#fieldImagePreviewModal').modal('show');
        $("#fieldImage2Text").text("please again select an image...");
    } else {
        alert("No image available for this field.");
    }

    // Prevent event propagation to avoid triggering the row click
    e.stopPropagation();
});
// -------------------------- The end - Handle click event for viewing field image 2 --------------------------




// -------------------------- The start - when click field save button --------------------------
$("#field-save").on('click', () => {

    // get values from inputs
    const fieldName = $("#fieldName").val();
    const fieldLocation = $("#fieldLocation").val();
    const fieldExtentsize = $("#fieldExtentsize").val();
    const fieldImage1 = $("#fieldImage1")[0].files[0];
    const fieldImage2 = $("#fieldImage2")[0].files[0];

    // Declare locationJsonObject outside the if block
    let locationJsonObject = null;

    // Use regex to extract latitude and longitude from the formatted string
    const regex = /Longitude: ([\d.-]+), Latitude: ([\d.-]+)/;
    const match = fieldLocation.match(regex);

    if (match) {
        const longitude = parseFloat(match[1]);  // Extract longitude
        const latitude = parseFloat(match[2]);   // Extract latitude

        // Create the JSON object
        locationJsonObject = {
            longitude: longitude,
            latitude: latitude
        };

    } else {
        console.log("Invalid field location format");
    }

    // check whether print those values
    console.log("fieldName: " , fieldName);
    console.log("locationJsonObject: " , locationJsonObject);
    console.log("fieldExtentsize: " , fieldExtentsize);

    if (!locationJsonObject) {
        showErrorAlert("Please select a valid location from the map!");
        return;
    }

    // Create a FormData object to send data as multipart/form-data
    let formData = new FormData();
    formData.append("fieldName", fieldName);
    formData.append("fieldLocation", JSON.stringify(locationJsonObject)); // Serialize JSON object
    formData.append("fieldExtentsize", fieldExtentsize);

    // Check if file is selected
    if (fieldImage1) {
        formData.append("fieldImage1", fieldImage1);  // Append the image file
    }

    // Check if file is selected
    if (fieldImage2) {
        formData.append("fieldImage2", fieldImage2);  // Append the image file
    }

    // For testing
    console.log("FormData Object : " + formData);

    // ========= Ajax with JQuery =========

    $.ajax({
        url: "http://localhost:5052/cropMonitoringSystem/api/v1/fields",
        type: "POST",
        data: formData,
        processData: false, // Prevent jQuery from automatically transforming the data
        contentType: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },

        success: function (results) {

            // show crop saved pop up
            Swal.fire({
                icon: 'success',
                title: 'Field saved successfully!',
                showConfirmButton: false,
                timer: 1500,
                iconColor: 'rgba(131,193,170,0.79)'
            });

            // load the table
            loadFieldsTable();

            // clean the inputs values
            $("#newFieldModal form").trigger('reset');

            // Remove the image preview
            $("#previewFieldImage1").attr("src", "#").hide(); // Reset the image source and hide it
            $("#previewFieldImage2").attr("src", "#").hide(); // Reset the image source and hide it
            $("#noFieldImage1Text").show();// Show the "No image selected" text
            $("#noFieldImage2Text").show();// Show the "No image selected" text
            $("#fieldImage1Text").hide();
            $("#fieldImage2Text").hide();
        },

        error: function (error) {
            console.log(error)
            showErrorAlert('Field not saved...')
        }
    });
});
// -------------------------- The end - when click field save button --------------------------




// -------------------------- The start - when click field update button --------------------------
$("#field-update").on('click', () => {

    // get values from inputs
    const fieldName = $("#fieldName").val();
    const fieldLocation = $("#fieldLocation").val();
    const fieldExtentsize = $("#fieldExtentsize").val();
    const fieldImage1 = $("#fieldImage1")[0].files[0];
    const fieldImage2 = $("#fieldImage2")[0].files[0];

    // Declare locationJsonObject outside the if block
    let locationJsonObject = null;

    // Use regex to extract latitude and longitude from the formatted string
    const regex = /Longitude: ([\d.-]+), Latitude: ([\d.-]+)/;
    const match = fieldLocation.match(regex);

    if (match) {
        const longitude = parseFloat(match[1]);  // Extract longitude
        const latitude = parseFloat(match[2]);   // Extract latitude

        // Create the JSON object
        locationJsonObject = {
            longitude: longitude,
            latitude: latitude
        };

    } else {
        console.log("Invalid field location format");
    }

    // check whether print those values
    console.log("fieldName: " , fieldName);
    console.log("locationJsonObject: " , locationJsonObject);
    console.log("fieldExtentsize: " , fieldExtentsize);

    if (!locationJsonObject) {
        showErrorAlert("Please select a valid location from the map!");
        return;
    }

    // Create a FormData object to send data as multipart/form-data
    let formData = new FormData();
    formData.append("fieldName", fieldName);
    formData.append("fieldLocation", JSON.stringify(locationJsonObject)); // Serialize JSON object
    formData.append("fieldExtentsize", fieldExtentsize);

    // Check if file is selected
    if (fieldImage1) {
        formData.append("fieldImage1", fieldImage1);  // Append the image file
    }

    // Check if file is selected
    if (fieldImage2) {
        formData.append("fieldImage2", fieldImage2);  // Append the image file
    }

    // For testing
    console.log("FormData Object : " + formData);


    // Send the PUT request
    $.ajax({
        url: `http://localhost:5052/cropMonitoringSystem/api/v1/fields/${selectedFieldCode}`,
        type: "PUT",
        data: formData,
        processData: false, // Prevent jQuery from transforming data
        contentType: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function () {
            Swal.fire({
                icon: 'success',
                title: 'Field updated successfully!',
                showConfirmButton: false,
                timer: 1500,
                iconColor: 'rgba(131,193,170,0.79)'
            });

            // load the table
            loadFieldsTable();

            // clean the inputs values
            $("#newFieldModal form").trigger('reset');

            // Remove the image preview
            $("#previewFieldImage1").attr("src", "#").hide(); // Reset the image source and hide it
            $("#previewFieldImage2").attr("src", "#").hide(); // Reset the image source and hide it
            $("#noFieldImage1Text").show();// Show the "No image selected" text
            $("#noFieldImage2Text").show();// Show the "No image selected" text
            $("#fieldImage1Text").hide();
            $("#fieldImage2Text").hide();
        },
        error: function (error) {
            console.error("Error updating field:", error);
            showErrorAlert('Field not updated...');
        }
    });

});
// -------------------------- The end - when click field update button --------------------------




// -------------------------- The start - when click field delete button --------------------------
$("#field-delete").on('click', () => {

    // Send the DELETE request
    $.ajax({
        url: `http://localhost:5052/cropMonitoringSystem/api/v1/fields/${selectedFieldCode}`,
        type: "DELETE",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function () {
            Swal.fire({
                icon: 'success',
                title: 'Field deleted successfully!',
                showConfirmButton: false,
                timer: 1500,
                iconColor: 'rgba(131,193,170,0.79)'
            });

            // load the table
            loadFieldsTable();
            loadStaffTable();

            // clean the inputs values
            $("#newFieldModal form").trigger('reset');

            // Remove the image preview
            $("#previewFieldImage1").attr("src", "#").hide(); // Reset the image source and hide it
            $("#previewFieldImage2").attr("src", "#").hide(); // Reset the image source and hide it
            $("#noFieldImage1Text").show();// Show the "No image selected" text
            $("#noFieldImage2Text").show();// Show the "No image selected" text
            $("#fieldImage1Text").hide();
            $("#fieldImage2Text").hide();

        },
        error: function (error) {
            console.error("Error deleting field:", error);
            showErrorAlert('Field not deleted...');
        }
    });

});
// -------------------------- The end - when click field delete button --------------------------




// -------------------------- The start - when click field clear button --------------------------
$("#field-clear").on('click', () => {

    $("#newFieldModal form").trigger('reset');

    // Reset image preview
    $("#previewFieldImage1").attr("src", "#").hide(); // Reset the image source and hide it
    $("#previewFieldImage2").attr("src", "#").hide(); // Reset the image source and hide it
    $("#noFieldImage1Text").show();// Show the "No image selected" text
    $("#noFieldImage2Text").show();// Show the "No image selected" text
    $("#fieldImage1Text").hide();
    $("#fieldImage2Text").hide();

});
// -------------------------- The end - when click field clear button --------------------------

