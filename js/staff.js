import {showErrorAlert} from "./crops.js";




// -------------------------- The start - staff table loading --------------------------
function loadStaffTable() {

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

            // Fetch staffs and populate the table
            $.ajax({
                url: "http://localhost:5052/cropMonitoringSystem/api/v1/staffs", // Staffs API
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                success: function (results) {
                    $('#staff-tbl-tbody').empty(); // Clear existing table body

                    results.forEach(function (staff) {
                        const fieldNames = [fieldLookup[staff.fieldIds]];

                        let row = `
                            <tr>
                                <td class="crop-common-name-value" >${staff.firstName}</td>
                                <td class="crop-scientific-name-value" >${staff.lastName}</td>
                                <td class="crop-category-value" >${staff.email}</td>
                                <td class="crop-season-value" >${staff.gender}</td>
                                <td class="crop-season-value" >${staff.address}</td>
                                <td class="crop-season-value" >${staff.dob}</td>
                                <td class="crop-season-value" >${staff.contactNo}</td>
                                <td class="crop-season-value" >${staff.joinedDate}</td>
                                <td class="crop-season-value" >${staff.designation}</td>
                                <td class="crop-field-value" >${staff.role}</td>
                                <td class="crop-field-value" >${fieldNames}</td>
                            </tr>
                        `;
                        $('#staff-tbl-tbody').append(row);
                    });
                },
                error: function (error) {
                    console.error("Failed to load staffs:", error);
                    alert('Failed to load staff data.');
                }
            });
        },
        error: function (error) {
            console.error("Failed to fetch fields:", error);
            alert("Failed to load fields. Please try again later.");
        }
    });
}
// -------------------------- The end - staff table loading --------------------------




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

    // Get all selected field IDs
    const assignedFields= [];

    $(".fieldForStaff").each(function () {
        const fieldId = $(this).val();
        if (fieldId) {
            assignedFields.push(fieldId);
        }
    });

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
    console.log("assignedFields: " , assignedFields);

    //let cropValidated = checkCropValidation(cropCommonName, cropScientificName, cropCategory, cropSeason, fieldCode, cropImage);

    //if(cropValidated) {

        // create an object - Object Literal
        let staff = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            address: address,
            gender: gender,
            contactNo:contactNo,
            dob: dob,
            joinedDate: joinedDate,
            designation: designation,
            role:role,
            fieldIds: assignedFields // Field IDs as a list
        }

        // For testing
        console.log("JS Object : " + staff);

        // Create JSON
        // convert js object to JSON object
        const jsonStaff = JSON.stringify(staff);
        console.log("JSON Object : " + jsonStaff);

        // ========= Ajax with JQuery =========

        $.ajax({
            url: "http://localhost:5052/cropMonitoringSystem/api/v1/staffs",
            type: "POST",
            data: jsonStaff,
            contentType: "application/json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },

            success: function (results) {

                // show crop saved pop up
                Swal.fire({
                    icon: 'success',
                    title: 'Staff saved successfully!',
                    showConfirmButton: false,
                    timer: 1500,
                    iconColor: 'rgba(131,193,170,0.79)'
                });

                // load the table
                //loadCropsTable()

                // clean the inputs values
                $("#newStaffModal form").trigger('reset');
            },

            error: function (error) {
                console.log(error)
                showErrorAlert('Staff not saved...')
            }
        });
    //}

});
// -------------------------- The end - when click staff save button --------------------------