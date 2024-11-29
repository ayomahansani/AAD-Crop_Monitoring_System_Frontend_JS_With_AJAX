import {showErrorAlert} from "./crops.js";




$(document).ready(function () {
    loadVehiclesTable();
});




// -------------------------- The start - vehicle table loading --------------------------
function loadVehiclesTable() {

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