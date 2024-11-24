import {showErrorAlert} from "./crops.js";




// -------------------------- The start - equipment table loading --------------------------
function loadEquipmentsTable() {

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


            // Fetch staffs first to build a lookup table
            $.ajax({
                url: "http://localhost:5052/cropMonitoringSystem/api/v1/staffs", // Staffs API
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                success: function (staffs) {
                    const staffLookup = {};
                    staffs.forEach(staff => {
                        staffLookup[staff.staffId] = staff.firstName; // Map staff id to staff name
                    });


                    // Fetch equipments and populate the table
                    $.ajax({
                        url: "http://localhost:5052/cropMonitoringSystem/api/v1/equipments", // Equipments API
                        method: 'GET',
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        },
                        success: function (results) {
                            $('#equipment-tbl-tbody').empty(); // Clear existing table body

                            results.forEach(function (equipment) {
                                const fieldName = fieldLookup[equipment.fieldCode] || "No Field Name";
                                const staffName = staffLookup[equipment.staffId] || "No Staff Name";

                                let row = `
                                <tr>
                                    <td class="equipment-name-value" >${equipment.equipmentName}</td>
                                    <td class="equipment-type-value" >${equipment.equipmentType}</td>
                                    <td class="equipment-status-value" >${equipment.equipmentStatus}</td>
                                    <td class="equipment-fieldName-value" >${fieldName}</td>
                                    <td class="equipment-staffName-value" >${staffName}</td>
                                </tr>
                                `;
                                $('#equipment-tbl-tbody').append(row);
                            });
                        },
                        error: function (error) {
                            console.error("Failed to load equipments:", error);
                            alert('Failed to load equipments data.');
                        }
                    });


                }, error: function (error) {
                    console.error("Failed to fetch staffs:", error);
                    alert("Failed to load staffs. Please try again later.");
                }
            });

        },
        error: function (error) {
            console.error("Failed to fetch fields:", error);
            alert("Failed to load fields. Please try again later.");
        }
    });
}
// -------------------------- The end - equipment table loading --------------------------




// -------------------------- The start - equipment's count loading --------------------------
export function loadEquipmentCount() {

    $.ajax({
        url: "http://localhost:5052/cropMonitoringSystem/api/v1/equipments", // Equipments API
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success : function (results) {
            $("#equipment-count").html(results.length);
        },
        error : function (error) {
            console.log(error)
        }
    })
}
// -------------------------- The end - equipment's count loading --------------------------




// -------------------------- The start - Function to fetch fields and populate the select element --------------------------
function fieldNamesComboBoxForEquipmentForm() {
    $.ajax({
        url: "http://localhost:5052/cropMonitoringSystem/api/v1/fields",
        type: "GET",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (response) {

            // Assuming response is an array of FieldDto objects
            const selectedFieldName = $("#fieldNamesComboBoxForEquipmentForm");

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




// -------------------------- The start - Function to fetch staffs and populate the select element --------------------------
function staffNamesComboBoxForEquipmentForm() {
    $.ajax({
        url: "http://localhost:5052/cropMonitoringSystem/api/v1/staffs",
        type: "GET",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (response) {

            // Assuming response is an array of staff dto objects
            const selectedStaffName = $("#staffFirstNamesComboBoxForEquipmentForm");

            // Populate the select element with field names and IDs
            response.forEach(staff => {
                const option = `<option value="${staff.staffId}">${staff.firstName}</option>`;
                selectedStaffName.append(option);
            });
        },
        error: function (error) {
            console.error("Error fetching staffs:", error);
            showErrorAlert("Failed to load staffs. Please try again later.");
        }
    });
}
// -------------------------- The end - Function to fetch staffs and populate the select element --------------------------




// -------------------------- The start - when click a equipment table row --------------------------
$("#equipment-tbl-tbody").on('click', 'tr', function (e) {

    // Extract values from the clicked row
    let equipmentName = $(this).find(".equipment-name-value").text().trim();
    let equipmentType = $(this).find(".equipment-type-value").text().trim();
    let equipmentStatus = $(this).find(".equipment-status-value").text().trim();
    let equipmentFieldName = $(this).find(".equipment-fieldName-value").text().trim();
    let equipmentStaffName = $(this).find(".equipment-staffName-value").text().trim();

    // Debug: Log extracted values
    console.log("Equipment Field Text:", equipmentFieldName, "Equipment Staff Text:", equipmentStaffName);

    // Assign values to the input fields
    $("#equipmentName").val(equipmentName);
    $("#equipmentType").val(equipmentType);
    $("#equipmentStatus").val(equipmentStatus);

    // Find the fieldCode for the equipmentFieldName
    $.ajax({
        url: "http://localhost:5052/cropMonitoringSystem/api/v1/fields",
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (fields) {
            // Find the fieldCode that corresponds to the equipmentFieldName
            const field = fields.find(f => f.fieldName === equipmentFieldName);
            if (field) {
                // Set the fieldCode as the selected value in the combobox
                $("#fieldNamesComboBoxForEquipmentForm").val(field.fieldCode);
            } else {
                console.warn("Field not found for equipment:", equipmentFieldName);
            }
        },
        error: function (error) {
            console.error("Error fetching fields:", error);
        }
    });

    // Find the staffId for the equipmentStaffName
    $.ajax({
        url: "http://localhost:5052/cropMonitoringSystem/api/v1/staffs",
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (staffs) {
            // Find the fieldCode that corresponds to the equipmentFieldName
            const staff = staffs.find(s => s.firstName === equipmentStaffName);
            if (staff) {
                // Set the staff id as the selected value in the combobox
                $("#staffFirstNamesComboBoxForEquipmentForm").val(staff.staffId);
            } else {
                console.warn("Staff not found for equipment:", equipmentStaffName);
            }
        },
        error: function (error) {
            console.error("Error fetching staffs:", error);
        }
    });

});
// -------------------------- The end - when click a equipment table row --------------------------




// -------------------------- The start - when click equipment save button --------------------------
$("#equipment-save").on('click', () => {

    // get values from inputs
    const equipmentName = $("#equipmentName").val();
    const equipmentType = $("#equipmentType").val();
    const equipmentStatus = $("#equipmentStatus").val();
    const fieldCode = $("#fieldNamesComboBoxForEquipmentForm").val();
    const staffId = $("#staffFirstNamesComboBoxForEquipmentForm").val();

    // check whether print those values
    console.log("equipmentName: " , equipmentName);
    console.log("equipmentType: " , equipmentType);
    console.log("equipmentStatus: " , equipmentStatus);
    console.log("selectedFieldCode: " , fieldCode);
    console.log("selectedStaffId: " , staffId);

    //let cropValidated = checkCropValidation(cropCommonName, cropScientificName, cropCategory, cropSeason, fieldCode, cropImage);

    //if(cropValidated) {

        // create an object - Object Literal
        let equipment = {
            equipmentName: equipmentName,
            equipmentType: equipmentType,
            equipmentStatus: equipmentStatus,
            fieldCode: fieldCode,
            staffId: staffId
        }

        // For testing
        console.log("JS Object : " + equipment);

        // Create JSON
        // convert js object to JSON object
        const jsonEquipment = JSON.stringify(equipment);
        console.log("JSON Object : " + jsonEquipment);

        // ========= Ajax with JQuery =========

        $.ajax({
            url: "http://localhost:5052/cropMonitoringSystem/api/v1/equipments",
            type: "POST",
            data: jsonEquipment,
            processData: false, // Prevent jQuery from automatically transforming the data
            contentType: "application/json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },

            success: function (results) {

                // show crop saved pop up
                Swal.fire({
                    icon: 'success',
                    title: 'Equipment saved successfully!',
                    showConfirmButton: false,
                    timer: 1500,
                    iconColor: 'rgba(131,193,170,0.79)'
                });

                // load the table
                //loadCropsTable()

                // clean the inputs values
                $("#newEquipmentModal form").trigger('reset');
            },

            error: function (error) {
                console.log(error)
                showErrorAlert('Equipment not saved...')
            }
        });
    //}

});
// -------------------------- The end - when click equipment save button --------------------------