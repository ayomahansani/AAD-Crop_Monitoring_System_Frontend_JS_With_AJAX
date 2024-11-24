import {loadCropsCount} from "./crops.js";

var css1 = {
    display:"none"
}
var css2 ={
    display: "block",

}

function showSection(sectionId){
    $("#dashboard-section").css(css1);
    $(`#${sectionId}`).css(css2);
}

// Set up click listeners for each navigation item
$("#nav-dashboard").click(function () {
    handleNavClick($(this).attr("id"), "Dashboard");
});
$("#nav-field").click(function () {
    handleNavClick($(this).attr("id"), "Field Management");
});
$("#nav-crop").click(function () {
    handleNavClick($(this).attr("id"), "Crops Management");
});
$("#nav-equipment").click(function () {
    handleNavClick($(this).attr("id"), "Equipment Management");
});
$("#nav-logs").click(function () {
    handleNavClick($(this).attr("id"), "Monitoring Logs");
});
$("#nav-staff").click(function () {
    handleNavClick($(this).attr("id"), "Staff Management");
});
$("#nav-vehicles").click(function () {
    handleNavClick($(this).attr("id"), "Vehicles Management");
});


function handleNavClick(clickedElementId,title){

    $(".dashboard-topic").text(title);

    switch (clickedElementId) {
        case "nav-dashboard":
            showSection("dashboard-section");
            break;
        case "nav-field":
            showSection("field-section");
            break;
        case "nav-crop":
            showSection("crop-section");
            break;
        case "nav-equipment":
            showSection("equipment-section");
            break;

        case "nav-logs":
            showSection("logs-section");
            break;

        case "nav-staff":
            showSection("staff-section");
            break;

        case "nav-vehicles":
            showSection("vehicle-section");
            break;

        case "nav-profile":
            showSection("profile-section");

    }
}

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


$(document).ready(function() { // This function runs when the document is ready

    // hide unwanted sections
    $("#home-section").css(css1);
    $("#register-form-section").css(css1);
    $("#crop-section").css(css1);
    $("#equipment-section").css(css1);

    // Show signup section and hide login section when signup button is clicked
    $("#login-signUp").click(function () {
        $("#login-form-section").css(css1);
        $("#register-form-section").css(css2);
    });

    // Show login section and hide signup section when signin button is clicked
    $("#signInBtn").click(function () {
        $("#login-form-section").css(css2);
        $("#register-form-section").css(css1);
    });

    // set all crop count to the home page's customer card
    loadCropsCount();



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