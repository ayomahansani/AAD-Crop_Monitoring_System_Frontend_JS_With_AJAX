import {loadCropsCount,loadCropsTable} from "./crops.js";
import {loadStaffsCount, loadStaffTable} from "./staff.js";
import {loadEquipmentCount,loadEquipmentsTable} from "./equipments.js";
import {loadVehicleCount, loadVehiclesTable} from "./vehicles.js";
import {loadFieldsCount, loadFieldsTable} from "./fields.js";
import {loadLogsCount, loadLogTable} from "./logs.js";




var css1 = {
    display:"none"
}
var css2 ={
    display: "block",
}
var hiddenSectionCSS = {
    display: "none"
};
var visibleSectionCSS = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
};





$(document).ready(function() {

    // hide unwanted sections
    $("#home-section").css(css1);
    $("#register-form-section").css(css1);
    $("#crop-section").css(css1);
    $("#equipment-section").css(css1);
    $("#staff-section").css(css1);
    $("#vehicle-section").css(css1);
    $("#field-section").css(css1);
    $("#logs-section").css(css1);
    $("#forgot-password-section").css(css1);


    // Show signup section and hide login section when signup button is clicked
    $("#login-signUp").click(function () {
        $("#login-form-section").css(hiddenSectionCSS);
        $("#register-form-section").css(visibleSectionCSS);
    });

    // Show login section and hide signup section when signin button is clicked
    $("#signInBtn").click(function () {
        $("#register-form-section").css(hiddenSectionCSS);
        $("#login-form-section").css(visibleSectionCSS);
    });

    // Show forgot password section
    $("#forgotPw").click(function () {
        $("#login-form-section").css(hiddenSectionCSS);
        $("#forgot-password-section").css(visibleSectionCSS);
    });

    // Back to login from forgot password
    $("#back-to-login").click(function (e) {
        e.preventDefault();
        $("#forgot-password-section").css(hiddenSectionCSS);
        $("#login-form-section").css(visibleSectionCSS);
    });

    // Handle forgot password form submission
    // ... to do


    // set all crop count to the home page's customer card
    loadCropsCount();
    // set all staff count to the home page's customer card
    loadStaffsCount();
    // set all equipments count to the home page's customer card
    loadEquipmentCount();
    // set all vehicle count to the home page's customer card
    loadVehicleCount();
    // set all field count to the home page's customer card
    loadFieldsCount();
    // set all log count to the home page's customer card
    loadLogsCount();


    // Bar Chart Data
    const barChartData = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        datasets: [{
            label: 'Monthly Sales (Rs:)',
            data: [1200, 1900, 3000, 5000, 2000, 3000],
            backgroundColor: 'rgba(17, 76, 54, 0.6)', // Green for bars
            borderColor: 'rgba(17, 76, 54, 1)',
            borderWidth: 1
        }]
    };

    // Initialize Bar Chart
    const barChartCtx = document.getElementById('barChart').getContext('2d');
    new Chart(barChartCtx, {
        type: 'bar',
        data: barChartData,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#114728',
                        font: {
                            size: 14,
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#114728'
                    },
                    grid: {
                        color: 'rgba(17, 76, 54, 0.2)'
                    }
                },
                y: {
                    ticks: {
                        color: '#114728'
                    },
                    grid: {
                        color: 'rgba(17, 76, 54, 0.2)'
                    }
                }
            }
        }
    });

    // Pie Chart Data
    const pieChartData = {
        labels: ['Crops', 'Fields', 'Staffs', 'Equipments', 'Vehicles', 'Logs'],
        datasets: [{
            data: [10, 5, 15, 8, 4, 12],
            backgroundColor: [
                'rgba(17, 76, 54, 0.6)',
                'rgba(195, 239, 214, 0.6)',
                'rgba(7,58,39,0.48)',
                'rgba(195, 239, 214, 0.4)',
                'rgba(17, 76, 54, 0.4)',
                'rgba(7, 58, 39, 0.8)'
            ],
            hoverBackgroundColor: [
                'rgba(17, 76, 54, 0.8)',
                'rgba(195, 239, 214, 0.8)',
                'rgba(7, 58, 39, 0.8)',
                'rgba(195, 239, 214, 0.6)',
                'rgba(17, 76, 54, 0.6)',
                'rgba(7, 58, 39, 1)'
            ],
            borderColor: 'rgb(9,51,2)', // Grey border color
            borderWidth: 1 // Border width in pixels
        }]
    };

    // Initialize Pie Chart
    const pieChartCtx = document.getElementById('pieChart').getContext('2d');
    new Chart(pieChartCtx, {
        type: 'pie',
        data: pieChartData,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        color: '#114728',
                        font: {
                            size: 14,
                        }
                    }
                }
            }
        }
    });



// Update date and time
    function updateDateTime() {
        const dateTimeElement = document.getElementById("dateTime");
        const now = new Date();

        // Format date and time separately
        const formattedDate = now.toISOString().slice(0, 10); // YYYY-MM-DD
        const formattedTime = now.toTimeString().slice(0, 8); // HH:mm:ss

        // Combine with "at" and add spaces
        dateTimeElement.innerHTML = `${formattedDate}&nbsp;&nbsp;at&nbsp;&nbsp;${formattedTime}`;
    }

// Update every second
    setInterval(updateDateTime, 1000);





    // <!------------------------ Sign-Up ------------------------>
    $('#signUpBtn').click(function () {

        const email = $('#signup-username').val();
        const password = $('#signup-password').val();
        const role = $('#select-role').val();
        console.log(email,password,role)

        $.ajax({
            url: 'http://localhost:5052/cropMonitoringSystem/api/v1/auth/signup',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ email, password, role }),
            success: function (response) {
                // Store the token from the response
                localStorage.setItem('token', response.token);

                // show
                Swal.fire({
                    icon: 'success',
                    title: 'Sign Up successful!',
                    showConfirmButton: false,
                    timer: 1500,
                    iconColor: 'rgba(131,193,170,0.79)'
                });

                console.log("Sign-up successful!")
                $("#login-form-section").css(css2);
                $("#register-form-section").css(css1);
            },
            error: function () {
                showErrorAlert("Sign-up failed. Please try again.")
                console.log("Sign-up failed. Please try again.")

                $('#signup-username').val("");
                $('#signup-password').val("");
            }
        });
    });
    // <!------------------------ Sign-Up ------------------------>



    // <!------------------------ Sign-In ------------------------>
    $('#login-signIn').click(function () {

        const email = $('#username').val();
        const password = $('#password').val();

        $.ajax({
            url: 'http://localhost:5052/cropMonitoringSystem/api/v1/auth/signIn',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ email, password }),
            success: function (response) {
                // Store the token from the response
                localStorage.setItem('token', response.token);
                localStorage.setItem('email',email)

                // show
                Swal.fire({
                    icon: 'success',
                    title: 'Sign In successful!',
                    showConfirmButton: false,
                    timer: 1500,
                    iconColor: 'rgba(131,193,170,0.79)'
                });

                console.log("Sign-in successful!")
                $("#login-form-section").css(css1);
                $("#register-form-section").css(css1);
                $("#home-section").css(css2)

                handleNavClick("nav-dashboard");

            },
            error: function () {
                showErrorAlert("Sign In failed. Please try again.")
                console.log("Sign In failed. Please try again.")

                $('#username').val("");
                $('#password').val("");
            }
        });
    });
    // <!------------------------ End Sign-In ------------------------>


});




// Set up click listeners for each navigation item
$("#nav-dashboard").click(function () {
    handleNavClick($(this).attr("id"), "Green Shadow - Dashboard");
});
$("#nav-field").click(function () {
    handleNavClick($(this).attr("id"), "Green Shadow - Field Management");
});
$("#nav-crop").click(function () {
    handleNavClick($(this).attr("id"), "Green Shadow - Crops Management");
});
$("#nav-equipment").click(function () {
    handleNavClick($(this).attr("id"), "Green Shadow - Equipment Management");
});
$("#nav-logs").click(function () {
    handleNavClick($(this).attr("id"), "Green Shadow - Logs Management");
});
$("#nav-staff").click(function () {
    handleNavClick($(this).attr("id"), "Green Shadow - Staff Management");
});
$("#nav-vehicles").click(function () {
    handleNavClick($(this).attr("id"), "Green Shadow - Vehicles Management");
});
$("#nav-log-out").click(function () {
    $("#home-section").css(css1);
    $("#register-form-section").css(hiddenSectionCSS);
    $("#login-form-section").css(visibleSectionCSS);

    // clear inputs
    $('#username').val('');
    $('#password').val('');

});




//-------------------------- The start - handle navbar clicking--------------------------
function handleNavClick(clickedElementId,title){

    $(".dashboard-topic").text(title);

    switch (clickedElementId) {
        case "nav-dashboard":
            showSection("dashboard-section");
            break;
        case "nav-field":
            showSection("field-section");
            loadFieldsTable()
            break;
        case "nav-crop":
            showSection("crop-section");
            loadCropsTable();
            break;
        case "nav-equipment":
            showSection("equipment-section");
            loadEquipmentsTable();
            break;
        case "nav-logs":
            showSection("logs-section");
            loadLogTable();
            break;
        case "nav-staff":
            showSection("staff-section");
            loadStaffTable();
            break;
        case "nav-vehicles":
            showSection("vehicle-section");
            loadVehiclesTable();
    }
}
//-------------------------- The end - handle navbar clicking --------------------------




//-------------------------- The start - show section --------------------------
function showSection(sectionId){
    $("#dashboard-section").css(css1);
    $("#crop-section").css(css1);
    $("#equipment-section").css(css1);
    $("#staff-section").css(css1);
    $("#vehicle-section").css(css1);
    $("#field-section").css(css1);
    $("#logs-section").css(css1);
    $(`#${sectionId}`).css(css2);
}
//-------------------------- The end - show section --------------------------




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
