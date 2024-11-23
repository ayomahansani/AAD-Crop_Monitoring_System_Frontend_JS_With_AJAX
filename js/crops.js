$(document).ready(function () {
    loadFieldNamesComboBoxAndSetFieldCodes();
    loadCropsTable();
});



// upload crop image
$('#cropImage').on('change', function () {

    const file = this.files[0]; // Get the selected file
    const previewImage = $('#previewImage'); // Image preview element
    const noImageText = $('#noImageText'); // No image text element

    if (file) {
        const reader = new FileReader();

        // Load the file and update the preview
        reader.onload = function (e) {
            previewImage.attr('src', e.target.result); // Set image source
            previewImage.show(); // Show the image
            noImageText.hide(); // Hide the "No image selected" text
        };

        reader.readAsDataURL(file); // Read the file as a Data URL
    } else {
        // If no file is selected, reset the preview
        previewImage.hide();
        noImageText.show();
    }
});





// When the custom upload button is clicked, trigger the file input click
$(".btn-custom-file").on("click", function () {
    $("#cropImage").trigger("click");
});





// When a file is selected, update the file name display
$("#cropImage").on("change", function () {
    var fileName = $(this).val().split("\\").pop() || "No file chosen";
    $("#fileName").text(fileName);
});




// -------------------------- The start - crop table loading --------------------------
function loadCropsTable() {

    // Fetch fields first to build a lookup table
    $.ajax({
        url: "http://localhost:5052/cropMonitoringSystem/api/v1/fields", // Fields API
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (fields) {
            const fieldLookup = {};
            fields.forEach(field => {
                fieldLookup[field.fieldCode] = field.fieldName; // Map fieldCode to fieldName
            });

            // Fetch crops and populate the table
            $.ajax({
                url: "http://localhost:5052/cropMonitoringSystem/api/v1/crops", // Crops API
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                success: function (results) {
                    $('#crop-tbl-tbody').empty(); // Clear existing table body

                    results.forEach(function (crop) {
                        const fieldName = fieldLookup[crop.fieldCode] || "No Field Name";
                        const imageLink = crop.cropImage
                            ? `<a href="#" class="view-crop-image" data-image="${crop.cropImage}" style="color: darkgreen; font-size: 14px;">Crop Image</a>`
                            : `<span style="color: darkgreen; font-size: 14px;">No Image</span>`;

                        let row = `
                            <tr>
                                <td class="crop-common-name-value" >${crop.cropCommonName}</td>
                                <td class="crop-scientific-name-value" >${crop.cropScientificName}</td>
                                <td class="crop-category-value" >${crop.cropCategory}</td>
                                <td class="crop-season-value" >${crop.cropSeason}</td>
                                <td class="crop-field-value" >${fieldName}</td>
                                <td>${imageLink}</td>
                            </tr>
                        `;
                        $('#crop-tbl-tbody').append(row);
                    });
                },
                error: function (error) {
                    console.error("Failed to load crops:", error);
                    alert('Failed to load crop data.');
                }
            });
        },
        error: function (error) {
            console.error("Failed to fetch fields:", error);
            alert("Failed to load fields. Please try again later.");
        }
    });
}
// -------------------------- The end - crop table loading --------------------------




// -------------------------- The start - Function to fetch fields and populate the select element --------------------------
function loadFieldNamesComboBoxAndSetFieldCodes() {
    $.ajax({
        url: "http://localhost:5052/cropMonitoringSystem/api/v1/fields",
        type: "GET",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (response) {

            // Assuming response is an array of FieldDto objects
            const selectedFieldName = $("#fieldNamesComboBox");

            // Populate the select element with field names and IDs
            response.forEach(field => {
                const option = `<option value="${field.fieldCode}">${field.fieldName}</option>`;
                selectedFieldName.append(option);
            });
        },
        error: function (error) {
            console.error("Error fetching fields:", error);
            showErrorAlert("Failed to load fields. Please try again later.");
        }
    });
}
// -------------------------- The end - Function to fetch fields and populate the select element --------------------------




// -------------------------- The start - when click a crop table row --------------------------
$("#crop-tbl-tbody").on('click', 'tr', function (e) {

    // Check if the click was inside the crop image link column
    if ($(e.target).hasClass("view-crop-image")) {
        return; // Do nothing if the click was on the image link
    }

    // Extract values from the clicked row
    let cropCommonName = $(this).find(".crop-common-name-value").text().trim();
    let cropScientificName = $(this).find(".crop-scientific-name-value").text().trim();
    let cropCategory = $(this).find(".crop-category-value").text().trim();
    let cropSeason = $(this).find(".crop-season-value").text().trim();
    let cropFieldName = $(this).find(".crop-field-value").text().trim();
    let cropImage = $(this).find(".view-crop-image").data("image") || null; // Get the base64 image data if available

    // Debug: Log extracted values
    console.log("Crop Field Text:", cropFieldName);

    // Assign values to the input fields
    $("#cropCommonName").val(cropCommonName);
    $("#cropScientificName").val(cropScientificName);
    $("#cropCategory").val(cropCategory);
    $("#cropSeason").val(cropSeason);

    // Set the image preview if image data exists
    if (cropImage) {
        $("#previewImage").attr("src", `data:image/jpeg;base64,${cropImage}`).show(); // Display the image
        $("#noImageText").hide(); // Hide the 'No image selected' text
        $("#cropImageText").text("please again select an image...");
    } else {
        $("#previewImage").hide(); // Hide the image element if no image
        $("#noImageText").show(); // Show the 'No image selected' text
    }

    // Find the fieldCode for the cropFieldName
    $.ajax({
        url: "http://localhost:5052/cropMonitoringSystem/api/v1/fields",
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (fields) {
            // Find the fieldCode that corresponds to the cropFieldName
            const field = fields.find(f => f.fieldName === cropFieldName);
            if (field) {
                // Set the fieldCode as the selected value in the combobox
                $("#fieldNamesComboBox").val(field.fieldCode);
            } else {
                console.warn("Field not found for crop:", cropFieldName);
            }
        },
        error: function (error) {
            console.error("Error fetching fields:", error);
        }
    });
});
// -------------------------- The end - when click a crop table row --------------------------



// -------------------------- The start - Handle click event for viewing crop image --------------------------
$('#crop-tbl-tbody').on('click', '.view-crop-image', function (e) {
    e.preventDefault(); // Prevent default link behavior

    const base64Image = $(this).data('image'); // Get the base64 image from the data attribute

    if (base64Image) {
        // Set the base64 image in the modal
        $('#seeCropImage').attr('src', `data:image/jpeg;base64,${base64Image}`);
        // Show the modal
        $('#imagePreviewModal').modal('show');
    } else {
        alert("No image available for this crop.");
    }

    // Prevent event propagation to avoid triggering the row click
    e.stopPropagation();
});
// -------------------------- The end - Handle click event for viewing crop image --------------------------



// -------------------------- The start - when click crop save button --------------------------
$("#crop-save").on('click', () => {

    // get values from inputs
    const cropCommonName = $("#cropCommonName").val();      // crop Common Name value
    const cropScientificName = $("#cropScientificName").val();      // crop Scientific Name value
    const fieldCode = $("#fieldNamesComboBox").val();        // field Code value
    const cropCategory = $("#cropCategory").val();        // crop Category value
    const cropSeason = $("#cropSeason").val();        // crop Season value
    const cropImage = $("#cropImage")[0].files[0];       // file Name value

    // check whether print those values
    console.log("cropCommonName: " , cropCommonName);
    console.log("cropScientificName: " , cropScientificName);
    console.log("selectedFieldCode: " , fieldCode);
    console.log("cropCategory: " , cropCategory);
    console.log("cropSeason: " , cropSeason);


    //let customerValidated = checkCustomerValidation(idOfCustomer,nameOfCustomer,addressOfCustomer,phoneOfCustomer);


    //if(customerValidated) {

    // Check for duplicate customer IDs
    //isDuplicateCustomerId(idOfCustomer).then(isDuplicated => {

    /*if (isDuplicated) {

        // Show error message for duplicate customer ID
        showErrorAlert("Customer ID already exists. Please enter a different ID.");

    } else {*/

    // Create a FormData object to send data as multipart/form-data
    let formData = new FormData();
    formData.append("cropCommonName", cropCommonName);
    formData.append("cropScientificName", cropScientificName);
    formData.append("cropCategory", cropCategory);
    formData.append("cropSeason", cropSeason);
    formData.append("fieldCode", fieldCode);

    // Check if file is selected
    if (cropImage) {
        formData.append("cropImage", cropImage);  // Append the image file
    }

    // For testing
    console.log("FormData Object : " + formData);


    // ========= Ajax with JQuery =========

    $.ajax({
        url: "http://localhost:5052/cropMonitoringSystem/api/v1/crops",
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
                title: 'Crop saved successfully!',
                showConfirmButton: false,
                timer: 1500,
                iconColor: 'rgba(131,193,170,0.79)'
            });

            // load the table
            loadCropsTable()

            // clean the inputs values
            $("#newCropModal form").trigger('reset');

            // Remove the image preview
            $("#previewImage").attr("src", "#").hide(); // Reset the image source and hide it
            $("#noImageText").show();// Show the "No image selected" text
            $("#cropImageText").hide();
        },

        error: function (error) {
            console.log(error)
            showErrorAlert('Crop not saved...')
        }
    });
    //}

    //})

    //}

});
// -------------------------- The end - when click crop save button --------------------------



// -------------------------- The start - when click crop update button --------------------------
$("#crop-update").on('click', () => {

    // Get values from inputs
    const cropCommonName = $("#cropCommonName").val();
    const cropScientificName = $("#cropScientificName").val();
    const fieldCode = $("#fieldNamesComboBox").val();
    const cropCategory = $("#cropCategory").val();
    const cropSeason = $("#cropSeason").val();
    const cropImage = $("#cropImage")[0].files[0];

    // Find the crop code for the cropCommonName
    $.ajax({
        url: "http://localhost:5052/cropMonitoringSystem/api/v1/crops",
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (results) {
            // Find the crop matching the input
            const crop = results.find(crop => (crop.cropCommonName === cropCommonName) && (crop.cropCategory === cropCategory));
            if (crop) {
                const cropCode = crop.cropCode; // Set the crop code
                console.log("Crop code: ", cropCode);

                // Create FormData
                let formData = new FormData();
                formData.append("cropCommonName", cropCommonName);
                formData.append("cropScientificName", cropScientificName);
                formData.append("cropCategory", cropCategory);
                formData.append("cropSeason", cropSeason);
                formData.append("fieldCode", fieldCode);

                // Check if file is selected
                if (cropImage) {
                    formData.append("cropImage", cropImage);
                }

                // Send the PUT request
                $.ajax({
                    url: `http://localhost:5052/cropMonitoringSystem/api/v1/crops/${cropCode}`,
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
                            title: 'Crop updated successfully!',
                            showConfirmButton: false,
                            timer: 1500,
                            iconColor: 'rgba(131,193,170,0.79)'
                        });

                        // Reload the crops table
                        loadCropsTable();

                        // Reset the form
                        $("#newCropModal form").trigger('reset');

                        // Reset image preview
                        $("#previewImage").attr("src", "#").hide();
                        $("#noImageText").show();
                        $("#cropImageText").hide();
                    },
                    error: function (error) {
                        console.error("Error updating crop:", error);
                        showErrorAlert('Crop not updated...');
                    }
                });

            } else {
                console.warn("Crop not found:", cropCommonName);
                showErrorAlert('Crop not found for the given details.');
            }
        },
        error: function (error) {
            console.error("Error fetching crops:", error);
            showErrorAlert('Error fetching crop data.');
        }
    });
});
// -------------------------- The end - when click crop update button --------------------------



// -------------------------- The start - when click crop delete button --------------------------
$("#crop-delete").on('click', () => {

    // Get values from inputs
    const cropCommonName = $("#cropCommonName").val();
    const cropCategory = $("#cropCategory").val();

    // Find the crop code for the cropCommonName
    $.ajax({
        url: "http://localhost:5052/cropMonitoringSystem/api/v1/crops",
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (results) {
            // Find the crop matching the input
            const crop = results.find(crop => (crop.cropCommonName === cropCommonName) && (crop.cropCategory === cropCategory));
            if (crop) {
                const cropCode = crop.cropCode; // Set the crop code
                console.log("Crop code: ", cropCode);

                // Send the DELETE request
                $.ajax({
                    url: `http://localhost:5052/cropMonitoringSystem/api/v1/crops/${cropCode}`,
                    type: "DELETE",
                    headers: {
                        "Authorization": "Bearer " + localStorage.getItem("token")
                    },
                    success: function () {
                        Swal.fire({
                            icon: 'success',
                            title: 'Crop deleted successfully!',
                            showConfirmButton: false,
                            timer: 1500,
                            iconColor: 'rgba(131,193,170,0.79)'
                        });

                        // Reset the form
                        $("#newCropModal form").trigger('reset');

                        // Reset image preview
                        $("#previewImage").attr("src", "#").hide();
                        $("#noImageText").show();
                        $("#cropImageText").hide();
                    },
                    error: function (error) {
                        console.error("Error deleting crop:", error);
                        showErrorAlert('Crop not deleted...');
                    }
                });

            } else {
                console.warn("Crop not found:", cropCommonName);
                showErrorAlert('Crop not found for the given details.');
            }
        },
        error: function (error) {
            console.error("Error fetching crops:", error);
            showErrorAlert('Error fetching crop data.');
        }
    });
});
// -------------------------- The end - when click crop delete button --------------------------



// -------------------------- The start - when click crop clear button --------------------------
$("#crop-clear").on('click', () => {

    $("#newCropModal form").trigger('reset');

    // Reset image preview
    $("#previewImage").attr("src", "#").hide();
    $("#noImageText").show();
    $("#cropImageText").hide();

});
// -------------------------- The end - when click crop clear button --------------------------



//-------------------------- The start - show error alert --------------------------
function showErrorAlert(message){
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: message,
        width: '38em',
        confirmButtonColor: 'rgba(17, 76, 54, 0.79)',
        iconColor: 'rgba(131,193,170,0.79)',
    });
}
//-------------------------- The end - show error alert --------------------------