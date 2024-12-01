import {showErrorAlert} from "./crops.js";




$(document).ready(function () {
    loadLogTable();
    loadFieldNamesComboBoxAndSetFieldCodesToLogForm();
    loadCropNamesComboBoxAndSetCropCodesToLogForm();
    loadStaffNamesComboBoxAndSetStaffIdsToLogForm();
});




// Define a global variable for log code
let selectedLogCode = null;




// upload log image
$('#logImage').on('change', function () {

    const file = this.files[0]; // Get the selected file
    const previewImage = $('#previewLogImage'); // Image preview element
    const noImageText = $('#noLogImageText'); // No image text element

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




// When a file is selected, update the file name display
$("#logImage").on("change", function () {
    var fileName = $(this).val().split("\\").pop() || "No file chosen";
    $("#fileName").text(fileName);
});




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




// -------------------------- The start - log's count loading --------------------------
export function loadLogsCount() {

    $.ajax({
        url: "http://localhost:5052/cropMonitoringSystem/api/v1/logs", // Logs API
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success : function (results) {
            $("#logs-count").html(results.length);
        },
        error : function (error) {
            console.log(error)
        }
    })
}
// -------------------------- The end - log's count loading --------------------------




// -------------------------- The start - Function to fetch fields and populate the select element --------------------------
function loadFieldNamesComboBoxAndSetFieldCodesToLogForm() {
    $.ajax({
        url: "http://localhost:5052/cropMonitoringSystem/api/v1/fields",
        type: "GET",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (response) {

            // Assuming response is an array of FieldDto objects
            const selectedFieldName = $("#fieldNamesComboBoxForLogForm");

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




// -------------------------- The start - Function to fetch crops and populate the select element --------------------------
function loadCropNamesComboBoxAndSetCropCodesToLogForm() {
    $.ajax({
        url: "http://localhost:5052/cropMonitoringSystem/api/v1/crops",
        type: "GET",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (response) {

            // Assuming response is an array of CropDTO objects
            const selectedCropName = $("#cropNamesComboBoxForLogForm");

            // Populate the select element with crop names and IDs
            response.forEach(crop => {
                const option = `<option value="${crop.cropCode}">${crop.cropCommonName} ${crop.cropCategory}</option>`;
                selectedCropName.append(option);
            });
        },
        error: function (error) {
            console.error("Error fetching crops:", error);
            showErrorAlert("Failed to load crops. Please try again later.");
        }
    });
}
// -------------------------- The end - Function to fetch crops and populate the select element --------------------------




// -------------------------- The start - Function to fetch staffs and populate the select element --------------------------
function loadStaffNamesComboBoxAndSetStaffIdsToLogForm() {
    $.ajax({
        url: "http://localhost:5052/cropMonitoringSystem/api/v1/staffs",
        type: "GET",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (response) {

            // Assuming response is an array of StaffDto objects
            const selectedStaffName = $("#staffNamesComboBoxForLogForm");

            // Populate the select element with staff names and IDs
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