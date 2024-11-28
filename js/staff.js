import {showErrorAlert} from "./crops.js";




$(document).ready(function () {
    loadStaffTable();
    loadFieldNamesComboBoxAndSetFieldCodes();
});




// -------------------------- The start - staff table loading --------------------------
function loadStaffTable() {
    // Fetch staff data
    $.ajax({
        url: "http://localhost:5052/cropMonitoringSystem/api/v1/staffs",
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (staffList) {
            $('#staff-tbl-tbody').empty(); // Clear existing table body

            staffList.forEach(function (staff) {
                // Nested AJAX to fetch fields for each staff
                $.ajax({
                    url: `http://localhost:5052/cropMonitoringSystem/api/v1/staffs/${staff.staffId}/field`,
                    type: "GET",
                    headers: {
                        "Authorization": "Bearer " + localStorage.getItem("token")
                    },
                    success: function (fields) {
                        // Collect field names into a comma-separated string
                        const fieldNames = fields.map(field => field.fieldName).join(", ");

                        // Create the staff table row, including field names
                        let row = `
                            <tr>
                                <td class="staff-firstName-value">${staff.firstName}</td>
                                <td class="staff-lastName-value">${staff.lastName}</td>
                                <td class="staff-email-value">${staff.email}</td>
                                <td class="staff-gender-value">${staff.gender}</td>
                                <td class="staff-contactNo-value">${staff.contactNo}</td>
                                <td class="staff-joinedDate-value">${staff.joinedDate}</td>
                                <td class="staff-designation-value">${staff.designation}</td>
                                <td class="staff-role-value">${staff.role}</td>
                                <td class="staff-assigned-fieldNames" style="color:rgb(14,81,27); font-weight: 600" >${fieldNames || "No fields assigned"}</td>
                            </tr>
                        `;
                        $('#staff-tbl-tbody').append(row); // Append the row to the table
                    },
                    error: function (xhr) {
                        console.error("Error fetching assigned fields:", xhr.responseText);
                    }
                });
            });
        },
        error: function (error) {
            console.error("Failed to load staff data:", error);
            alert('Failed to load staff data.');
        }
    });
}
// -------------------------- The end - staff table loading --------------------------





// -------------------------- The start - staff's count loading --------------------------
export function loadStaffsCount() {

    $.ajax({
        url: "http://localhost:5052/cropMonitoringSystem/api/v1/staffs", // Staffs API
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success : function (results) {
            $("#staff-count").html(results.length);
        },
        error : function (error) {
            console.log(error)
        }
    })
}
// -------------------------- The end - staff's count loading --------------------------





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





// -------------------------- The start - when click a staff table row --------------------------
$("#staff-tbl-tbody").on('click', 'tr', function () {
    const staffEmail = $(this).find(".staff-email-value").text().trim();

    // Fetch the staff data
    $.ajax({
        url: "http://localhost:5052/cropMonitoringSystem/api/v1/staffs",
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (staffList) {
            const staff = staffList.find(staff => staff.email === staffEmail);

            if (!staff) {
                alert('Staff not found!');
                return;
            }

            // Fill in staff details in the modal
            $("#staffFirstName").val(staff.firstName);
            $("#staffLastName").val(staff.lastName);
            $("#staffEmail").val(staff.email);
            $("#staffGender").val(staff.gender);
            $("#staffAddress").val(staff.address || "");
            $("#staffDOB").val(staff.dob || "");
            $("#staffPhone").val(staff.contactNo);
            $("#staffJoinedDate").val(staff.joinedDate);
            $("#staffDesignation").val(staff.designation);
            $("#staffRole").val(staff.role);

            // Clear existing field containers
            $('#assignedFieldsContainer').empty();

            // Fetch all available fields
            $.ajax({
                url: "http://localhost:5052/cropMonitoringSystem/api/v1/fields",
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                success: function (allFields) {
                    // Fetch assigned fields for the staff
                    $.ajax({
                        url: `http://localhost:5052/cropMonitoringSystem/api/v1/staffs/${staff.staffId}/field`,
                        method: 'GET',
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        },
                        success: function (assignedFields) {
                            // Create combo boxes for each assigned field
                            assignedFields.forEach(assignedField => {
                                addFieldWithOptions(allFields, assignedField);
                            });

                            // Store the fetched fields for reuse
                            cachedFields = allFields; // Cache fields globally for future additions

                        },
                        error: function (xhr) {
                            console.error("Error fetching assigned fields:", xhr.responseText);
                            alert("Failed to load assigned fields.");
                        }
                    });
                },
                error: function (xhr) {
                    console.error("Error fetching all fields:", xhr.responseText);
                    alert("Failed to load all fields.");
                }
            });
        },
        error: function (xhr) {
            console.error("Error fetching staff data:", xhr.responseText);
            alert("Failed to load staff data.");
        }
    });
});
// -------------------------- The end - when click a staff table row --------------------------





// -------------------------- The start - Function to add a field combo box with all options --------------------------
function addFieldWithOptions(allFields, selectedField = null) {
    const container = document.getElementById('assignedFieldsContainer');
    const fieldDiv = document.createElement('div');
    fieldDiv.className = 'd-flex align-items-center mb-2 col-md-8';

    // Generate options for all fields
    let optionsHtml = '<option value="">Choose a field</option>';
    allFields.forEach(field => {
        optionsHtml += `<option value="${field.fieldCode}" ${selectedField && field.fieldCode === selectedField.fieldCode ? 'selected' : ''}>
                            ${field.fieldName}
                        </option>`;
    });

    // Set inner HTML with combo box and remove button
    fieldDiv.innerHTML = `
        <select class="form-select search-input fieldForStaff" aria-label="Default select example" name="assignedFields[]" required>
            ${optionsHtml}
        </select>
        <button type="button" class="btn btn-m custom-btn" onclick="removeField(this)">
            <i class="fa-solid fa-trash-alt" style="color:rgb(17, 76, 54);"></i>
        </button>
    `;

    container.appendChild(fieldDiv);
}
// -------------------------- The end - Function to add a field combo box with all options --------------------------





// -------------------------- The start - when click a "+ Click here to Add Field" button in add staff modal --------------------------
let cachedFields = []; // Cache fields to avoid multiple API calls

$("#addFieldBtn").on('click', () => {
    // Check if fields are already cached
    if (cachedFields.length > 0) {
        addFieldWithOptions(cachedFields);
    } else {
        // Fetch fields from the server if not cached
        $.ajax({
            url: "http://localhost:5052/cropMonitoringSystem/api/v1/fields",
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            success: function (allFields) {
                cachedFields = allFields; // Cache fields globally
                addFieldWithOptions(allFields);
            },
            error: function (xhr) {
                console.error("Error fetching fields:", xhr.responseText);
                alert("Failed to load fields.");
            }
        });
    }
});
// -------------------------- The end - when click a "+ Click here to Add Field" button in add staff modal --------------------------





// -------------------------- The start - Function to remove an assigned field combo box --------------------------
window.removeField = function (button) {
    button.parentElement.remove();
};
// -------------------------- The end - Function to remove an assigned field combo box --------------------------





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
            fieldIds: assignedFields // Field IDs as a string list
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
                loadStaffTable();

                // clean the inputs values
                $("#newStaffModal form").trigger('reset');
                $(".fieldForStaff").val('');
            },

            error: function (error) {
                console.log(error)
                showErrorAlert('Staff not saved...')
            }
        });
    //}

});
// -------------------------- The end - when click staff save button --------------------------





// -------------------------- The start - when click staff update button --------------------------
$("#staff-update").on('click', () => {

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

    console.log("Assigned Fields : " + assignedFields)

    //let staffValidated = checkStaffValidation(firstName, lastName, email, address, gender, contactNo, dob, joinedDate, designation, role);

    //if(cropValidated) {

        // Find the staff id for the staff email
        $.ajax({
            url: "http://localhost:5052/cropMonitoringSystem/api/v1/staffs",
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            success: function (results) {
                // Find the staff matching the input
                const matchedStaff = results.find(staff => (staff.email === email));

                if (matchedStaff) {
                    const staffId = matchedStaff.staffId; // Set the staff id
                    console.log("Staff Id: ", staffId);

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


                    // Send the PUT request
                    $.ajax({
                        url: `http://localhost:5052/cropMonitoringSystem/api/v1/staffs/${staffId}`,
                        type: "PUT",
                        data: jsonStaff,
                        contentType: "application/json",
                        headers: {
                            "Authorization": "Bearer " + localStorage.getItem("token")
                        },
                        success: function () {
                            Swal.fire({
                                icon: 'success',
                                title: 'Staff updated successfully!',
                                showConfirmButton: false,
                                timer: 1500,
                                iconColor: 'rgba(131,193,170,0.79)'
                            });

                            // Reload the crops table
                            loadStaffTable()

                            // Reset the form
                            $("#newStaffModal form")[0].reset();
                            $(".fieldForStaff").val('');

                        },
                        error: function (error) {
                            console.error("Error updating staff:", error);
                            showErrorAlert('Staff not updated...');
                        }
                    });

                } else {
                    console.warn("Staff not found:", email);
                    showErrorAlert('Staff not found for the given details.');
                }
            },
            error: function (error) {
                console.error("Error fetching staffs:", error);
                showErrorAlert('Error fetching staff data.');
            }
        });
    //}
});
// -------------------------- The end - when click staff update button --------------------------





// -------------------------- The start - when click staff delete button --------------------------
$("#staff-delete").on('click', () => {

    // Get values from inputs
    const email = $("#staffEmail").val();

    // Find the staff id for the staff email
    $.ajax({
        url: "http://localhost:5052/cropMonitoringSystem/api/v1/staffs",
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (results) {
            // Find the staff matching the input
            const staff = results.find(staff => (staff.email === email));
            if (staff) {
                const staffId = staff.staffId; // Set the staff id
                console.log("Staff Id: ", staffId);

                // Send the DELETE request
                $.ajax({
                    url: `http://localhost:5052/cropMonitoringSystem/api/v1/staffs/${staffId}`,
                    type: "DELETE",
                    headers: {
                        "Authorization": "Bearer " + localStorage.getItem("token")
                    },
                    success: function () {
                        Swal.fire({
                            icon: 'success',
                            title: 'Staff deleted successfully!',
                            showConfirmButton: false,
                            timer: 1500,
                            iconColor: 'rgba(131,193,170,0.79)'
                        });

                        // load the table
                        loadStaffTable();

                        // clean the inputs values
                        $("#newStaffModal form").trigger('reset');
                        $(".fieldForStaff").val('');
                    },
                    error: function (error) {
                        console.error("Error deleting staff:", error);
                        showErrorAlert('Staff not deleted...');
                    }
                });

            } else {
                console.warn("Staff not found:", email);
                showErrorAlert('Staff not found for the given details.');
            }
        },
        error: function (error) {
            console.error("Error fetching staffs:", error);
            showErrorAlert('Error fetching staff data.');
        }
    });
});
// -------------------------- The end - when click staff delete button --------------------------





// -------------------------- The start - when click staff clear button --------------------------
$("#staff-clear").on('click', () => {
    $("#newStaffModal form").trigger('reset');
    $(".fieldForStaff").val('');
});
// -------------------------- The end - when click staff clear button --------------------------





// -------------------------- The start - when click view all staffs button --------------------------
$("#viewAllStaffs").on('click', function () {

    $.ajax({
        url: "http://localhost:5052/cropMonitoringSystem/api/v1/staffs",
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success : function (results) {
            console.log(results)

            // Clear the existing table body
            $('#all-staffs-tbl-tbody').empty();

            // Iterate over the results and append rows to the table
            results.forEach(function(staff) {
                let row = `
                    <tr>
                        <td>${staff.firstName}</td>
                    </tr>
                `;
                $('#all-staffs-tbl-tbody').append(row);
                $("#all-staffs-tbl-tbody").css("font-weight", 600);
            });
        },
        error : function (error) {
            console.log(error)
            alert('Can not get all staffs...')
        }
    })
});
// -------------------------- The end - when click view all staffs button --------------------------





// -------------------------- The start - when click staff search button --------------------------
$("#staff-search-btn").on('click', function () {

    var staffDetail = $("#searchStaff").val();

    $.ajax({
        url: "http://localhost:5052/cropMonitoringSystem/api/v1/staffs",
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success : function (results) {

            if (results.length !== 0) {

                for (let i=0; i<results.length; i++) {

                    if (results[i].email === staffDetail) {
                        $("#searchedStaffFirstName").val(results[i].firstName);
                        $("#searchedStaffLastName").val(results[i].lastName);
                        $("#searchedStaffDesignation").val(results[i].designation);
                        $("#searchedStaffGender").val(results[i].gender);
                        $("#searchedStaffJoinedDate").val(results[i].joinedDate);
                        $("#searchedStaffDOB").val(results[i].dob);
                        $("#searchedStaffAddress").val(results[i].address);
                        $("#searchedStaffPhone").val(results[i].contactNo);
                        $("#searchedStaffEmail").val(results[i].email);
                        $("#searchedStaffRole").val(results[i].role);

                    /*    $.ajax({
                            url: "http://localhost:5052/cropMonitoringSystem/api/v1/fields/" + results[i].fieldCode,
                            method: 'GET',
                            headers: {
                                'Authorization': 'Bearer ' + localStorage.getItem('token')
                            },
                            success : function (fieldDTO) {
                                $("#searchedSelectedFieldForEquipment").val(fieldDTO.fieldName);
                            },
                            error : function (error) {
                                console.log(error)
                            }
                        })*/

                        $("#staffDetailsModalLabel").html("Staff Details");

                        return;
                    }
                }

                if(staffDetail !== "") {
                    showErrorAlert("Can't find staff ! Try again...");
                    searchedStaffInputsClear();
                } else {
                    showErrorAlert("Please enter staff email to search !");
                    searchedStaffInputsClear();
                }
            } else {
                showErrorAlert("First you need to add staff ! Then you can search...");
                searchedStaffInputsClear();
            }
        },
        error : function (error) {
            console.log(error)
        }
    })
});
// -------------------------- The end - when click staff search button --------------------------





// -------------------------- The start - clear the staff search bar's value --------------------------
$("#staff-search-modal-close").on('click', function () {
    $("#searchStaff").val("");
});
// -------------------------- The end - clear the staff search bar's value --------------------------





//-------------------------- The start - check staff validations --------------------------
function checkStaffValidation(firstName, lastName, email, address, gender, contactNo, dob, joinedDate, designation, role) {

    if(!firstName){    //check firstName field is empty or not
        showErrorAlert("First Name is required!")
        return false;
    } else {
        if(!/^[A-Za-z]{2,40}$/.test(firstName)){
            showErrorAlert("Please enter a valid name!  Pattern - 'Shovel'")
            return false;
        }
    }

    if(!lastName){ //check lastName field is empty or not
        showErrorAlert("Last Name is required!");
        return false;
    } else {
        if(!/^[A-Za-z]{2,40}$/.test(lastName)){
            showErrorAlert("Please enter a valid name!  Pattern - 'Mechanical'")
            return false;
        }
    }

    if(!email){ //check category field is empty or not
        showErrorAlert("Email is required!");
        return false;
    } else {
        if(!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/.test(email)){
            showErrorAlert("Please enter a valid email! Pattern - 'Available'")
            return false;
        }
    }

    if(!address){ //check address field is empty or not
        showErrorAlert("address is required!");
        return false;
    } else {
        if(!/^[A-Za-z\d\s\-']{2,50}$/.test(address)){
            showErrorAlert("Please enter a valid address! Pattern - 'Available'")
            return false;
        }
    }

    if(!designation){ //check designation field is empty or not
        showErrorAlert("Designation is required!");
        return false;
    } else {
        if(!/^[A-Za-z ]{2,40}$/.test(designation)){
            showErrorAlert("Please enter a valid designation!  Pattern - 'Mechanical'")
            return false;
        }
    }

    if(!contactNo){ //check contactNo field is empty or not
        showErrorAlert("Contact Number is required!");
        return false;
    } else {
        if(!/^(?:0?(77|76|78|34|75|72|74)[0-9]{7}|(77|76|78|34|75|72|74)[0-9]{8})$/.test(contactNo)){
            showErrorAlert("Please enter a valid contact number!  Pattern - 'Mechanical'")
            return false;
        }
    }

    if(gender === "Select the gender"){ //check gender is empty or not
        showErrorAlert("Gender is required!");
        return false;
    }

    if(role === "Select the role"){ //check role is empty or not
        showErrorAlert("Role is required!");
        return false;
    }

    if(!dob){ //check dob is empty or not
        showErrorAlert("DOB is required!");
        return false;
    }

    if(!joinedDate){ //check joinedDate is empty or not
        showErrorAlert("Joined Date is required!");
        return false;
    }

    return true;

}
//-------------------------- The end - check staff validations --------------------------





//-------------------------- The start - clear searched inputs --------------------------
function searchedStaffInputsClear(){
    $("#searchedStaffFirstName").val("");
    $("#searchedStaffLastName").val("");
    $("#searchedStaffDesignation").val("");
    $("#searchedStaffGender").val("");
    $("#searchedStaffJoinedDate").val("");
    $("#searchedStaffDOB").val("");
    $("#searchedStaffAddress").val("");
    $("#searchedStaffPhone").val("");
    $("#searchedStaffEmail").val("");
    $("#searchedStaffRole").val("");
    $("#staffDetailsModalLabel").html("Staff Details");
}
//-------------------------- The end - clear searched inputs --------------------------