import {showErrorAlert} from "./crops.js";




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
            const selectedFieldName = $("#fieldNamesComboBoxForStaffForm");

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




// -------------------------- The start - Function to add an assigned field combo box --------------------------
function addField() {

    // Fetch existing options from the first dropdown
    const existingOptions = $('.fieldForStaff:first').html();

    // Create a new dropdown with the same options
    const container = document.getElementById('assignedFieldsContainer');
    const fieldDiv = document.createElement('div');

    fieldDiv.className = 'd-flex align-items-center mb-2 col-md-8';
    fieldDiv.innerHTML = `
        <select class="form-select search-input fieldForStaff" aria-label="Default select example" id="fieldNamesComboBoxForStaffForm" name="assignedFields[]" required>
            ${ existingOptions || '<option selected>Choose a field</option>' }
        </select>
        <button type="button" class="btn btn-m custom-btn" onclick="removeField(this)">
            <i class="fa-regular fa-trash-can" style="color:rgb(17, 76, 54);"></i>
        </button>
    `;
    container.appendChild(fieldDiv);
}
// -------------------------- The start - Function to add an assigned field combo box --------------------------




// -------------------------- The start - when click staff save button --------------------------
$("#staff-save").on('click', () => {

    // get values from inputs
    const firstName = $("#staffFirstName").val();
    const lastName = $("#staffLastName").val();
    const email = $("#staffEmail").val();
    const address = $("#staffAddress").val();
    const gender = $("#staffGender").val();
    const contactNo = $("#staffPhone").val();
    const dob = $("#staffDOB").val();
    const joinedDate = $("#staffJoinedDate").val();
    const designation = $("#staffDesignation").val();
    const role = $("#staffRole").val();

    const assignedFields = [];



    // check whether print those values
    console.log("firstName: " , firstName);
    console.log("lastName: " , lastName);
    console.log("email: " , email);
    console.log("address: " , address);
    console.log("gender: " , gender);
    console.log("contactNo: " , contactNo);
    console.log("dob: " , dob);
    console.log("joinedDate: " , joinedDate);
    console.log("designation: " , designation);
    console.log("role: " , role);

    //let cropValidated = checkCropValidation(cropCommonName, cropScientificName, cropCategory, cropSeason, fieldCode, cropImage);

    //if(cropValidated) {

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

});
// -------------------------- The end - when click staff save button --------------------------