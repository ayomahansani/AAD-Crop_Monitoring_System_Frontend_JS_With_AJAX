/*$(document).ready(function () {
    loadCropsTable()
});*/



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

// When select add crop modal, want to load combobox
$('#newCropBtn').click(function () {
    loadFieldNamesComboBoxAndSetFieldCodes()
});



// -------------------------- The start - crop table loading --------------------------
function loadCropsTable() {

    $.ajax({
        url : "http://localhost:5052/cropMonitoringSystem/api/v1/crops",   // request eka yanna one thana
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success : function (results) {
            console.log(results)
            //alert('Get All Data Successfully...')

            // Clear the existing table body
            $('#crop-tbl-tbody').empty();

            // Iterate over the results and append rows to the table
            results.forEach(function(customer) {
                let row = `
                    <tr>
                        <td class="customer-id-value">${customer.id}</td>
                        <td class="customer-name-value">${customer.name}</td>
                        <td class="customer-address-value">${customer.address}</td>
                        <td class="customer-phone-value">${customer.phone}</td>
                    </tr>
                `;
                $('#crop-tbl-tbody').append(row);
                $("#crop-tbl-tbody").css("font-weight", 600);
            });
        },
        error : function (error) {
            console.log(error)
            alert('Not Get All Crop Data...')
        }
    })
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
            selectedFieldName.empty(); // Clear existing options
            selectedFieldName.append('<option value="">Choose a field</option>'); // Add default option

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
            //loadCustomerTable();

            // clean the inputs values
            $("#newCropModal form").trigger('reset');

            // Remove the image preview
            $("#previewImage").attr("src", "#").hide(); // Reset the image source and hide it
            $("#noImageText").show();                  // Show the "No image selected" text

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