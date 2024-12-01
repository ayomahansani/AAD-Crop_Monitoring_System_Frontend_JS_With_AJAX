import {showErrorAlert} from "./crops.js";




$(document).ready(function () {
    loadLogTable();
});




// Define a global variable for log code
let selectedLogCode = null;




// -------------------------- The start - log table loading --------------------------
function loadLogTable() {
    // Fetch log data
    $.ajax({
        url: "http://localhost:5052/cropMonitoringSystem/api/v1/logs",
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (logList) {
            $('#log-tbl-tbody').empty(); // Clear existing table body

            logList.forEach(function (log) {
                // Nested AJAX to fetch fields, crops, staffs for each log
                $.ajax({
                    url: `http://localhost:5052/cropMonitoringSystem/api/v1/logs/${log.logCode}/related-entities`,
                    type: "GET",
                    headers: {
                        "Authorization": "Bearer " + localStorage.getItem("token")
                    },
                    success: function (data) {

                        // Collect field names into a comma-separated string
                        const fieldNames = data.fields.map(field => field.fieldName).join(", ");

                        // Collect crop names into a comma-separated string
                        const cropNames = data.crops.map(crop => crop.cropCommonName + " / " + crop.cropCategory).join(", ");

                        // Collect staff names into a comma-separated string
                        const staffNames = data.staffs.map(staff => staff.firstName + " " + staff.lastName).join(", ");

                        const imageLink = log.observedImage
                            ? `<a href="#" class="view-log-image" data-image="${log.observedImage}" style="color: darkgreen; font-size: 14px; font-weight: 600;" >Log Image</a>`
                            : `<span style="color: darkgreen; font-size: 14px;">No Image</span>`;


                        // Create the log table row, including field names, crop names, staff names
                        let row = `
                            <tr>
                                <td class="log-date-value">${log.logDate}</td>
                                <td class="log-details-value">${log.logDetails}</td>
                                <td class="log-monitored-fields" style="color:darkgreen; font-weight: 600" >${fieldNames || "No fields monitored"}</td>
                                <td class="log-monitored-crops" style="color:darkgreen; font-weight: 600" >${cropNames || "No crops monitored"}</td>
                                <td class="log-monitored-staffs" style="color:darkgreen; font-weight: 600" >${staffNames || "No staffs monitored"}</td>
                                <td>${imageLink}</td>
                            </tr>
                        `;
                        $('#log-tbl-tbody').append(row); // Append the row to the table
                    },
                    error: function (xhr) {
                        console.error("Error fetching assigned fields, crops or staffs:", xhr.responseText);
                    }
                });
            });
        },
        error: function (error) {
            console.error("Failed to load logs data:", error);
            alert('Failed to load logs data.');
        }
    });
}
// -------------------------- The end - log table loading --------------------------