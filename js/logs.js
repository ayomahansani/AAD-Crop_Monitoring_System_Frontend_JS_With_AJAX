import {showErrorAlert} from "./crops.js";




$(document).ready(function () {
    loadLogTable();
    loadFieldNamesComboBoxAndSetFieldCodesToLogForm();
    loadCropNamesComboBoxAndSetCropCodesToLogForm();
    loadStaffNamesComboBoxAndSetStaffIdsToLogForm();
    setCurrentDate();
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



// -------------------------- The start - set current date --------------------------
function setCurrentDate(){
    // Set the current date in the #logDate input field
    const today = new Date(); // Get the current date
    const formattedDate = today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    $("#logDate").val(formattedDate); // Set the value of #logDate

}
// -------------------------- The start - set current date --------------------------



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




// -------------------------- The start - when click a log table row --------------------------
$("#log-tbl-tbody").on('click', 'tr', function (e) {

    // Check if the click was inside the log image link column
    if ($(e.target).hasClass("view-log-image")) {
        return; // Do nothing if the click was on the image link
    }

    const logDetails = $(this).find(".log-details-value").text().trim();
    let logImage = $(this).find(".view-log-image").data("image") || null; // Get the base64 image data if available

    // Fetch the log data
    $.ajax({
        url: "http://localhost:5052/cropMonitoringSystem/api/v1/logs",
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (logList) {
            const searchedLog = logList.find(log => log.logDetails === logDetails);

            if (!searchedLog) {
                alert('Log not found!');
                return;
            }

            selectedLogCode = searchedLog.logCode;
            console.log("Log code: ", selectedLogCode);

            // Fill in staff details in the modal
            $("#logDate").val(searchedLog.logDate);
            $("#logDetails").val(searchedLog.logDetails);

            // Set the image preview if image data exists
            if (logImage) {
                $("#previewLogImage").attr("src", `data:image/jpeg;base64,${logImage}`).show(); // Display the image
                $("#noLogImageText").hide(); // Hide the 'No image selected' text
                $("#logImageText").text("please again select an image...");
            } else {
                $("#previewLogImage").hide(); // Hide the image element if no image
                $("#noLogImageText").show(); // Show the 'No image selected' text
                $("#logImageText").text("please again select an image...");
            }

            // Clear existing containers
            $('#monitoredFieldsContainer').empty();
            $('#monitoredCropsContainer').empty();
            $('#monitoredStaffsContainer').empty();

            // Fetch all available fields
            $.ajax({
                url: "http://localhost:5052/cropMonitoringSystem/api/v1/fields",
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                success: function (allFields) {

                    // Fetch monitored fields, crops, staffs for the log
                    $.ajax({
                        url: `http://localhost:5052/cropMonitoringSystem/api/v1/logs/${searchedLog.logCode}/related-entities`,
                        method: 'GET',
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        },
                        success: function (data) {
                            // Create combo boxes for each assigned field
                            data.fields.forEach(field => {
                                addFieldWithOptions(allFields, field);
                            });

                            // Store the fetched fields for reuse
                            cachedFields = allFields; // Cache fields globally for future additions

                        },
                        error: function (xhr) {
                            console.error("Error fetching monitored data:", xhr.responseText);
                            alert("Failed to load  monitored data.");
                        }
                    });

                },
                error: function (xhr) {
                    console.error("Error fetching all fields:", xhr.responseText);
                    alert("Failed to load all fields.");
                }
            });

            // Fetch all available crops
            $.ajax({
                url: "http://localhost:5052/cropMonitoringSystem/api/v1/crops",
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                success: function (allCrops) {

                    // Fetch monitored fields, crops, staffs for the log
                    $.ajax({
                        url: `http://localhost:5052/cropMonitoringSystem/api/v1/logs/${searchedLog.logCode}/related-entities`,
                        method: 'GET',
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        },
                        success: function (data) {
                            // Create combo boxes for each assigned field
                            data.crops.forEach(crop => {
                                addCropWithOptions(allCrops, crop);
                            });

                            // Store the fetched crops for reuse
                            cachedCrops = allCrops; // Cache crops globally for future additions

                        },
                        error: function (xhr) {
                            console.error("Error fetching monitored data:", xhr.responseText);
                            alert("Failed to load  monitored data.");
                        }
                    });

                },
                error: function (xhr) {
                    console.error("Error fetching all crops:", xhr.responseText);
                    alert("Failed to load all crops.");
                }
            });

            // Fetch all available staffs
            $.ajax({
                url: "http://localhost:5052/cropMonitoringSystem/api/v1/staffs",
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                success: function (allStaffs) {

                    // Fetch monitored fields, crops, staffs for the log
                    $.ajax({
                        url: `http://localhost:5052/cropMonitoringSystem/api/v1/logs/${searchedLog.logCode}/related-entities`,
                        method: 'GET',
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        },
                        success: function (data) {
                            // Create combo boxes for each assigned field
                            data.staffs.forEach(staff => {
                                addStaffWithOptions(allStaffs, staff);
                            });

                            // Store the fetched staffs for reuse
                            cachedStaffs = allStaffs; // Cache staffs globally for future additions

                        },
                        error: function (xhr) {
                            console.error("Error fetching monitored data:", xhr.responseText);
                            alert("Failed to load  monitored data.");
                        }
                    });

                },
                error: function (xhr) {
                    console.error("Error fetching all staffs:", xhr.responseText);
                    alert("Failed to load all staffs.");
                }
            });


        },
        error: function (xhr) {
            console.error("Error fetching all logs:", xhr.responseText);
            alert("Failed to load all logs.");
        }
    });

});
// -------------------------- The end - when click a log table row --------------------------




// -------------------------- The start - Handle click event for viewing log image --------------------------
$('#log-tbl-tbody').on('click', '.view-log-image', function (e) {
    e.preventDefault(); // Prevent default link behavior

    const base64Image = $(this).data('image'); // Get the base64 image from the data attribute

    if (base64Image) {
        // Set the base64 image in the modal
        $('#seeLogImage').attr('src', `data:image/jpeg;base64,${base64Image}`);
        // Show the modal
        $('#logImagePreviewModal').modal('show');
        $("#logImageText").text("please again select an image...");
    } else {
        alert("No image available for this log.");
    }

    // Prevent event propagation to avoid triggering the row click
    e.stopPropagation();
});
// -------------------------- The end - Handle click event for viewing log image --------------------------




// -------------------------- The start - Function to add a field combo box with all options --------------------------
function addFieldWithOptions(allFields, selectedField = null) {
    const container = document.getElementById('monitoredFieldsContainer');
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
        <select class="form-select search-input fieldForLog" aria-label="Default select example" name="monitoredFields[]" required>
            ${optionsHtml}
        </select>
        <button type="button" class="btn btn-m custom-btn" onclick="removeField(this)">
            <i class="fa-solid fa-trash-alt" style="color:rgb(17, 76, 54);"></i>
        </button>
    `;

    container.appendChild(fieldDiv);
}
// -------------------------- The end - Function to add a field combo box with all options --------------------------




// -------------------------- The start - Function to add a crop combo box with all options --------------------------
function addCropWithOptions(allCrops, selectedCrop = null) {
    const container = document.getElementById('monitoredCropsContainer');
    const cropDiv = document.createElement('div');
    cropDiv.className = 'd-flex align-items-center mb-2 col-md-8';

    // Generate options for all crops
    let optionsHtml = '<option value="">Choose a crop</option>';
    allCrops.forEach(crop => {
        optionsHtml += `<option value="${crop.cropCode}" ${selectedCrop && crop.cropCode === selectedCrop.cropCode ? 'selected' : ''}>
                            ${crop.cropCommonName} ${crop.cropCategory}
                        </option>`;
    });

    // Set inner HTML with combo box and remove button
    cropDiv.innerHTML = `
        <select class="form-select search-input cropForLog" aria-label="Default select example" name="monitoredCrops[]" required>
            ${optionsHtml}
        </select>
        <button type="button" class="btn btn-m custom-btn" onclick="removeCrop(this)">
            <i class="fa-solid fa-trash-alt" style="color:rgb(17, 76, 54);"></i>
        </button>
    `;

    container.appendChild(cropDiv);
}
// -------------------------- The end - Function to add a crop combo box with all options --------------------------




// -------------------------- The start - Function to add a staff combo box with all options --------------------------
function addStaffWithOptions(allStaffs, selectedStaff = null) {
    const container = document.getElementById('monitoredStaffsContainer');
    const staffDiv = document.createElement('div');
    staffDiv.className = 'd-flex align-items-center mb-2 col-md-8';

    // Generate options for all staffs
    let optionsHtml = '<option value="">Choose a staff</option>';
    allStaffs.forEach(staff => {
        optionsHtml += `<option value="${staff.staffId}" ${selectedStaff && staff.staffId === selectedStaff.staffId ? 'selected' : ''}>
                            ${staff.firstName} ${staff.lastName}
                        </option>`;
    });

    // Set inner HTML with combo box and remove button
    staffDiv.innerHTML = `
        <select class="form-select search-input staffForLog" aria-label="Default select example" name="monitoredStaffs[]" required>
            ${optionsHtml}
        </select>
        <button type="button" class="btn btn-m custom-btn" onclick="removeStaff(this)">
            <i class="fa-solid fa-trash-alt" style="color:rgb(17, 76, 54);"></i>
        </button>
    `;

    container.appendChild(staffDiv);
}
// -------------------------- The end - Function to add a staff combo box with all options --------------------------




// -------------------------- The start - when click a "+ Click here to Add Field" button in add log modal --------------------------
let cachedFields = []; // Cache fields to avoid multiple API calls

$("#addFieldBtnInLogForm").on('click', () => {
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
// -------------------------- The end - when click a "+ Click here to Add Field" button in add log modal --------------------------




// -------------------------- The start - when click a "+ Click here to Add Crop" button in add log modal --------------------------
let cachedCrops = []; // Cache crops to avoid multiple API calls

$("#addCropBtnInLogForm").on('click', () => {
    // Check if crops are already cached
    if (cachedCrops.length > 0) {
        addCropWithOptions(cachedCrops);
    } else {
        // Fetch crops from the server if not cached
        $.ajax({
            url: "http://localhost:5052/cropMonitoringSystem/api/v1/crops",
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            success: function (allCrops) {
                cachedCrops = allCrops; // Cache crops globally
                addCropWithOptions(allCrops);
            },
            error: function (xhr) {
                console.error("Error fetching crops:", xhr.responseText);
                alert("Failed to load crops.");
            }
        });
    }
});
// -------------------------- The end - when click a "+ Click here to Add Crop" button in add log modal --------------------------




// -------------------------- The start - when click a "+ Click here to Add Staff" button in add log modal --------------------------
let cachedStaffs = []; // Cache crops to avoid multiple API calls

$("#addStaffBtnInLogForm").on('click', () => {
    // Check if staffs are already cached
    if (cachedStaffs.length > 0) {
        addStaffWithOptions(cachedStaffs);
    } else {
        // Fetch staffs from the server if not cached
        $.ajax({
            url: "http://localhost:5052/cropMonitoringSystem/api/v1/staffs",
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            success: function (allStaffs) {
                cachedStaffs = allStaffs; // Cache staffs globally
                addStaffWithOptions(allStaffs);
            },
            error: function (xhr) {
                console.error("Error fetching staffs:", xhr.responseText);
                alert("Failed to load staffs.");
            }
        });
    }
});
// -------------------------- The end - when click a "+ Click here to Add Staff" button in add log modal --------------------------




// -------------------------- The start - Function to remove an assigned crop combo box --------------------------
window.removeCrop = function (button) {
    button.parentElement.remove();
};
// -------------------------- The end - Function to remove an assigned crop combo box --------------------------




// -------------------------- The start - Function to remove an assigned staff combo box --------------------------
window.removeStaff = function (button) {
    button.parentElement.remove();
};
// -------------------------- The end - Function to remove an assigned staff combo box --------------------------




// -------------------------- The start - when click log save button --------------------------
$("#log-save").on('click', () => {

    // get values from inputs
    const logDate = $("#logDate").val();
    const logDetails = $("#logDetails").val();
    const observedImage = $("#logImage")[0].files[0];

    // Get all selected field IDs, crop IDs, staff IDs
    const monitoredFields= [];
    const monitoredCrops= [];
    const monitoredStaffs= [];

    $(".fieldForLog").each(function () {
        const fieldId = $(this).val();
        if (fieldId) {
            monitoredFields.push(fieldId);
        }
    });

    $(".cropForLog").each(function () {
        const cropCode = $(this).val();
        if (cropCode) {
            monitoredCrops.push(cropCode);
        }
    });

    $(".staffForLog").each(function () {
        const staffId = $(this).val();
        if (staffId) {
            monitoredStaffs.push(staffId);
        }
    });

    // check whether print those values
    console.log("logDate: " , logDate);
    console.log("logDetails: " , logDetails);
    console.log("monitoredFields: " , monitoredFields);
    console.log("monitoredCrops: " , monitoredCrops);
    console.log("monitoredStaffs: " , monitoredStaffs);


    //let staffValidated = checkStaffValidation(firstName, lastName, email, address, gender, contactNo, dob, joinedDate, designation, role, assignedFields);

    //if(staffValidated) {

        // Create a FormData object to send data as multipart/form-data
        let formData = new FormData();
        formData.append("logDate", logDate);
        formData.append("logDetails", logDetails);
        formData.append("fieldCodes", JSON.stringify(monitoredFields));
        formData.append("cropCodes", JSON.stringify(monitoredCrops));
        formData.append("staffIds", JSON.stringify(monitoredStaffs));


    // Check if file is selected
        if (observedImage) {
            formData.append("observedImage", observedImage);  // Append the image file
        }

        // ========= Ajax with JQuery =========

        $.ajax({
            url: "http://localhost:5052/cropMonitoringSystem/api/v1/logs",
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
                    title: 'Log saved successfully!',
                    showConfirmButton: false,
                    timer: 1500,
                    iconColor: 'rgba(131,193,170,0.79)'
                });

                // load the table
                loadLogTable();

                // clean the inputs values
                $("#newLogModal form").trigger('reset');
                $(".fieldForLog").val('');
                $(".cropForLog").val('');
                $(".staffForLog").val('');

                // Remove the image preview
                $("#previewLogImage").attr("src", "#").hide(); // Reset the image source and hide it
                $("#noLogImageText").show();// Show the "No image selected" text
                $("#logImageText").hide();
            },

            error: function (error) {
                console.log(error)
                showErrorAlert('Log not saved...')
            }
        });
    //}

});
// -------------------------- The end - when click log save button --------------------------