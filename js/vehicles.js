import {showErrorAlert} from "./crops.js";




$(document).ready(function () {
    loadVehiclesTable();
    loadStaffNamesComboBoxForVehicleForm();
});




// Define a global variable for vehicle code
let selectedVehicleCode = null;




// -------------------------- The start - vehicle table loading --------------------------
export function loadVehiclesTable() {

    // Fetch staffs first to build a lookup table
    $.ajax({
        url: "http://localhost:5052/cropMonitoringSystem/api/v1/staffs", // Staffs API
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (staffMembers) {
            const staffLookup = {};
            staffMembers.forEach(staff => {
                // Map staff ID to a full name (first + last name)
                staffLookup[staff.staffId] = `${staff.firstName} ${staff.lastName}`;
            });

            // Fetch vehicles and populate the table
            $.ajax({
                url: "http://localhost:5052/cropMonitoringSystem/api/v1/vehicles", // Vehicles API
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                success: function (vehicles) {
                    $('#vehicle-tbl-tbody').empty(); // Clear existing table body

                    vehicles.forEach(function (vehicle) {
                        const staffName = staffLookup[vehicle.staffId] || "No Staff Name";

                        let row = `
                                <tr>
                                    <td class="vehicle-licensePlateNumber-value" >${vehicle.licensePlateNumber}</td>
                                    <td class="vehicle-category-value" >${vehicle.vehicleCategory}</td>
                                    <td class="vehicle-fuelType-value" >${vehicle.fuelType}</td>
                                    <td class="vehicle-status-value" >${vehicle.vehicleStatus}</td>
                                    <td class="vehicle-remarks-value" >${vehicle.remarks}</td>
                                    <td class="vehicle-staffName-value" style="color:darkgreen; font-weight: 480">${staffName}</td>
                                </tr>
                                `;
                        $('#vehicle-tbl-tbody').append(row);
                    });
                },
                error: function (error) {
                    console.error("Failed to load vehicles:", error);
                    alert('Failed to load vehicles data.');
                }
            });
        },
        error: function (error) {
            console.error("Failed to fetch staffs:", error);
            alert("Failed to load staffs. Please try again later.");
        }
    });
}
// -------------------------- The end - vehicle table loading --------------------------




// -------------------------- The start - vehicle's count loading --------------------------
export function loadVehicleCount() {

    $.ajax({
        url: "http://localhost:5052/cropMonitoringSystem/api/v1/vehicles", // Vehicles API
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success : function (results) {
            $("#vehicle-count").html(results.length);
        },
        error : function (error) {
            console.log(error)
        }
    })
}
// -------------------------- The end - vehicle's count loading --------------------------




// -------------------------- The start - Function to fetch staffs and populate the select element --------------------------
function loadStaffNamesComboBoxForVehicleForm() {
    $.ajax({
        url: "http://localhost:5052/cropMonitoringSystem/api/v1/staffs",
        type: "GET",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (response) {

            // Assuming response is an array of staff dto objects
            const selectedStaffName = $("#staffNamesComboBoxForVehicleForm");

            // Populate the select element with field names and IDs
            response.forEach(staff => {
                const option = `<option value="${staff.staffId}">${staff.firstName} ${staff.lastName}</option>`;
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




// -------------------------- The start - when click a vehicle table row --------------------------
$("#vehicle-tbl-tbody").on('click', 'tr', function (e) {

    // Extract values from the clicked row
    let licensePlateNumber = $(this).find(".vehicle-licensePlateNumber-value").text().trim();
    let vehicleCategory = $(this).find(".vehicle-category-value").text().trim();
    let fuelType = $(this).find(".vehicle-fuelType-value").text().trim();
    let vehicleStatus = $(this).find(".vehicle-status-value").text().trim();
    let remarks = $(this).find(".vehicle-remarks-value").text().trim();
    let vehicleStaffName = $(this).find(".vehicle-staffName-value").text().trim();

    // Debug: Log extracted values
    console.log("Vehicle Staff:", vehicleStaffName);

    // Assign values to the input fields
    $("#licensePlateNumber").val(licensePlateNumber);
    $("#vehicleCategory").val(vehicleCategory);
    $("#fuelType").val(fuelType);
    $("#vehicleStatus").val(vehicleStatus);
    $("#vehicleRemarks").val(remarks);

    // Find the staffId for the vehicleStaffName
    $.ajax({
        url: "http://localhost:5052/cropMonitoringSystem/api/v1/staffs",
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (staffs) {
            // Find the staffId that corresponds to the vehicleStaffName
            const staff = staffs.find(s => `${s.firstName} ${s.lastName}` === vehicleStaffName);
            if (staff) {
                // Set the staff id as the selected value in the combobox
                $("#staffNamesComboBoxForVehicleForm").val(staff.staffId);
            } else {
                console.warn("Staff not found for vehicle:", vehicleStaffName);
            }
        },
        error: function (error) {
            console.error("Error fetching staffs:", error);
        }
    });


    // Fetch the vehicle code from the backend API using the licensePlateNumber
    $.ajax({
        url: "http://localhost:5052/cropMonitoringSystem/api/v1/vehicles",
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (results) {
            // Find the vehicle matching the input
            const searchedVehicle = results.find(vehicle => (vehicle.licensePlateNumber === licensePlateNumber));
            if (searchedVehicle) {

                selectedVehicleCode = searchedVehicle.vehicleCode; // Set the vehicle code

                // Debug: Log the global variable
                console.log("Selected Vehicle Code:", selectedVehicleCode);
            } else {
                console.warn("Vehicle code not found for license plate:", licensePlateNumber);
            }
        },
        error: function (error) {
            console.error("Error fetching vehicle details:", error);
        }
    });
});
// -------------------------- The end - when click a vehicle table row --------------------------




// -------------------------- The start - when click vehicle save button --------------------------
$("#vehicle-save").on('click', () => {

    // get values from inputs
    const licensePlateNumber = $("#licensePlateNumber").val();
    const vehicleCategory = $("#vehicleCategory").val();
    const fuelType = $("#fuelType").val();
    const vehicleStatus = $("#vehicleStatus").val();
    const remarks = $("#vehicleRemarks").val();
    const staffId = $("#staffNamesComboBoxForVehicleForm").val();

    // check whether print those values
    console.log("licensePlateNumber: " , licensePlateNumber);
    console.log("vehicleCategory: " , vehicleCategory);
    console.log("fuelType: " , fuelType);
    console.log("vehicleStatus: " , vehicleStatus);
    console.log("remarks: " , remarks);
    console.log("staffId: " , staffId);

    let vehicleValidated = checkVehicleValidation(licensePlateNumber, vehicleCategory, fuelType, vehicleStatus, remarks, staffId);

    if(vehicleValidated) {

        // create an object - Object Literal
        let vehicle = {
            licensePlateNumber: licensePlateNumber,
            vehicleCategory: vehicleCategory,
            fuelType: fuelType,
            vehicleStatus: vehicleStatus,
            remarks: remarks,
            staffId: staffId
        }

        // For testing
        console.log("JS Object : " + vehicle);

        // Create JSON
        // convert js object to JSON object
        const jsonVehicle = JSON.stringify(vehicle);
        console.log("JSON Object : " + jsonVehicle);

        // ========= Ajax with JQuery =========

        $.ajax({
            url: "http://localhost:5052/cropMonitoringSystem/api/v1/vehicles", // Vehicles API
            type: "POST",
            data: jsonVehicle,
            contentType: "application/json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },

            success: function (results) {

                // show crop saved pop up
                Swal.fire({
                    icon: 'success',
                    title: 'Vehicle saved successfully!',
                    showConfirmButton: false,
                    timer: 1500,
                    iconColor: 'rgba(131,193,170,0.79)'
                });

                // load the table
                loadVehiclesTable();

                // clean the inputs values
                $("#newVehicleModal form").trigger('reset');
            },

            error: function (error) {
                console.log(error)
                showErrorAlert('Vehicle not saved...')
            }
        });
    }
});
// -------------------------- The end - when click vehicle save button --------------------------




// -------------------------- The start - when click vehicle update button --------------------------
$("#vehicle-update").on('click', () => {

    // get values from inputs
    const licensePlateNumber = $("#licensePlateNumber").val();
    const vehicleCategory = $("#vehicleCategory").val();
    const fuelType = $("#fuelType").val();
    const vehicleStatus = $("#vehicleStatus").val();
    const remarks = $("#vehicleRemarks").val();
    const staffId = $("#staffNamesComboBoxForVehicleForm").val();

    // check whether print those values
    console.log("licensePlateNumber: " , licensePlateNumber);
    console.log("vehicleCategory: " , vehicleCategory);
    console.log("fuelType: " , fuelType);
    console.log("vehicleStatus: " , vehicleStatus);
    console.log("remarks: " , remarks);
    console.log("staffId: " , staffId);

    let vehicleValidated = checkVehicleValidation(licensePlateNumber, vehicleCategory, fuelType, vehicleStatus, remarks, staffId);

    if(vehicleValidated) {

        // create an object - Object Literal
        let vehicle = {
            licensePlateNumber: licensePlateNumber,
            vehicleCategory: vehicleCategory,
            fuelType: fuelType,
            vehicleStatus: vehicleStatus,
            remarks: remarks,
            staffId: staffId
        }

        // For testing
        console.log("JS Object : " + vehicle);

        // Create JSON
        // convert js object to JSON object
        const jsonVehicle = JSON.stringify(vehicle);
        console.log("JSON Object : " + jsonVehicle);

        // Send the PUT request
        $.ajax({
            url: `http://localhost:5052/cropMonitoringSystem/api/v1/vehicles/${selectedVehicleCode}`,
            type: "PUT",
            data: jsonVehicle,
            contentType: "application/json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            success: function () {
                Swal.fire({
                    icon: 'success',
                    title: 'Vehicle updated successfully!',
                    showConfirmButton: false,
                    timer: 1500,
                    iconColor: 'rgba(131,193,170,0.79)'
                });

                // Reload the crops table
                loadVehiclesTable();

                // clean the inputs values
                $("#newVehicleModal form").trigger('reset');
            },
            error: function (error) {
                console.error("Error updating crop:", error);
                showErrorAlert('Equipment not updated...');
            }
        });

    }
});
// -------------------------- The end - when click vehicle update button --------------------------




// -------------------------- The start - when click vehicle delete button --------------------------
$("#vehicle-delete").on('click', () => {

    // Send the DELETE request
    $.ajax({
        url: `http://localhost:5052/cropMonitoringSystem/api/v1/vehicles/${selectedVehicleCode}`,
        type: "DELETE",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function () {
            Swal.fire({
                icon: 'success',
                title: 'Vehicle deleted successfully!',
                showConfirmButton: false,
                timer: 1500,
                iconColor: 'rgba(131,193,170,0.79)'
            });

            // load the table
            loadVehiclesTable();

            // clean the inputs values
            $("#newVehicleModal form").trigger('reset');
        },
        error: function (error) {
            console.error("Error deleting vehicle:", error);
            showErrorAlert('Vehicle not deleted...');
        }
    });

});
// -------------------------- The end - when click vehicle delete button --------------------------




// -------------------------- The start - when click vehicle clear button --------------------------
$("#vehicle-clear").on('click', () => {
    $("#newVehicleModal form").trigger('reset');
});
// -------------------------- The end - when click vehicle clear button --------------------------




// -------------------------- The start - when click view all vehicles button --------------------------
$("#viewAllVehicle").on('click', function () {

    $.ajax({
        url: "http://localhost:5052/cropMonitoringSystem/api/v1/vehicles",
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success : function (results) {
            console.log(results)

            // Clear the existing table body
            $('#all-vehicles-tbl-tbody').empty();

            // Iterate over the results and append rows to the table
            results.forEach(function(vehicle) {
                let row = `
                    <tr>
                        <td>${vehicle.vehicleCategory}</td>
                        <td>-</td>
                        <td>${vehicle.licensePlateNumber}</td>
                    </tr>
                `;
                $('#all-vehicles-tbl-tbody').append(row);
                $("#all-vehicles-tbl-tbody").css("font-weight", 600);
            });
        },
        error : function (error) {
            console.log(error)
            alert('Can not get all vehicles...')
        }
    })
});
// -------------------------- The end - when click view all vehicles button --------------------------




// -------------------------- The start - when click vehicle search button --------------------------
$("#vehicle-search-btn").on('click', function () {

    var vehicleDetail = $("#searchVehicle").val();

    $.ajax({
        url: "http://localhost:5052/cropMonitoringSystem/api/v1/vehicles",
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success : function (results) {

            if (results.length !== 0) {

                for (let i=0; i<results.length; i++) {

                    if (results[i].licensePlateNumber === vehicleDetail) {
                        $("#searchedVehicleLicensePlateNumber").val(results[i].licensePlateNumber);
                        $("#searchedVehicleCategory").val(results[i].vehicleCategory);
                        $("#searchedFuelType").val(results[i].fuelType);
                        $("#searchedVehicleStatus").val(results[i].vehicleStatus);
                        $("#searchedVehicleRemarks").val(results[i].remarks);

                        $.ajax({
                            url: "http://localhost:5052/cropMonitoringSystem/api/v1/staffs/" + results[i].staffId,
                            method: 'GET',
                            headers: {
                                'Authorization': 'Bearer ' + localStorage.getItem('token')
                            },
                            success : function (staffDTO) {
                                $("#searchedSelectedStaffForVehicle").val(staffDTO.firstName + " " + staffDTO.lastName);
                            },
                            error : function (error) {
                                console.log(error)
                            }
                        })

                        $("#vehicleDetailsModalLabel").html("Vehicle Details");

                        return;
                    }
                }

                if(vehicleDetail !== "") {
                    showErrorAlert("Can't find vehicle ! Try again...");
                    searchedVehicleInputsClear();
                } else {
                    showErrorAlert("Please enter vehicle plate number to search !");
                    searchedVehicleInputsClear();
                }
            } else {
                showErrorAlert("First you need to add vehicles ! Then you can search...");
                searchedVehicleInputsClear();
            }
        },
        error : function (error) {
            console.log(error)
        }
    })
});
// -------------------------- The end - when click vehicle search button --------------------------




// -------------------------- The start - clear the vehicle search bar's value --------------------------
$("#vehicle-search-modal-close").on('click', function () {
    $("#searchVehicle").val("");
});
// -------------------------- The end - clear the vehicle search bar's value --------------------------




//-------------------------- The start - check vehicle validations --------------------------
function checkVehicleValidation(licensePlateNumber, vehicleCategory, fuelType, vehicleStatus, remarks, staffId) {

    if(!licensePlateNumber){    //check licensePlateNumber field is empty or not
        showErrorAlert("License Plate Number is required!")
        return false;
    } else {
        if(!/^[A-Za-z0-9 /-]{2,40}$/.test(licensePlateNumber)){
            showErrorAlert("Please enter a valid plate number!  Pattern - 'PQW-1234'")
            return false;
        }
    }

    if(!vehicleCategory){    //check vehicleCategory field is empty or not
        showErrorAlert("Category is required!")
        return false;
    } else {
        if(!/^[A-Za-z0-9 /-]{2,40}$/.test(vehicleCategory)){
            showErrorAlert("Please enter a valid category!  Pattern - 'Truck'")
            return false;
        }
    }

    if(fuelType === "Select fuel type"){ //check fuelType field is empty or not
        showErrorAlert("Fuel Type is required!");
        return false;
    }

    if(vehicleStatus === "Select status") { //check status field is empty or not
        showErrorAlert("Vehicle Status is required!");
        return false;
    }

    if(!remarks){    //check remarks field is empty or not
        showErrorAlert("If don't have any remarks, please type N/A")
        return false;
    }

    if(staffId === "Choose a staff"){ //check staffId field is empty or not
        showErrorAlert("Staff is required!");
        return false;
    }

    return true;

}
//-------------------------- The end - check vehicle validations --------------------------




//-------------------------- The start - clear searched inputs --------------------------
function searchedVehicleInputsClear(){
    $("#searchedVehicleLicensePlateNumber").val("");
    $("#searchedVehicleCategory").val("");
    $("#searchedFuelType").val("");
    $("#searchedVehicleStatus").val("");
    $("#searchedVehicleRemarks").val("");
    $("#searchedSelectedStaffForVehicle").val('');
    $("#vehicleDetailsModalLabel").html("Vehicle Details");
}
//-------------------------- The end - clear searched inputs --------------------------