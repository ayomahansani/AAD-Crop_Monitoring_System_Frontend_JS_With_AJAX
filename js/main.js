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


$(document).ready(function() { // This function runs when the document is ready

    $("#home-section").css(css1);
    $("#register-form-section").css(css1);

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

    /* $("#login-signIn").click(function () {

     });*/

    // Sign-Up

    $('#signUpBtn').click(function () {
        const email = $('#signUp-email').val();
        const password = $('#signUp-password').val();
        const role = $('#SelectRole').val();
        console.log(email,password,role)

        $.ajax({
            url: 'http://localhost:5052/cropMonitoringSystem/api/v1/auth/signup',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ email, password, role }),
            success: function (response) {
                // Store the token from the response
                localStorage.setItem('token', response.token);
                showAlert("Sign-up successful!","success");
                $("#login-section").css(css2);
                $("#signUp-section").css(css1);
            },
            error: function () {
                showAlert("Sign-up failed. Please try again.","error");
            }
        });
    });


// Sign-In
    $('#login-signIn').click(function () {
        const email = $('#login-email').val();
        const password = $('#login-password').val();

        $.ajax({
            url: 'http://localhost:5052/cropMonitoringSystem/api/v1/auth/signIn',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ email, password }),
            success: function (response) {
                // Store the token from the response
                localStorage.setItem('token', response.token);
                localStorage.setItem('email',email)
                showAlert("Sign-in successful!",'success');
                $("#login-section").css(css1);
                $("#signUp-section").css(css1);
                $("#homeSection").css(css2)
                handleNavClick("nav-dashboard");
                $("body").css({
                    backgroundColor:"#FAF5E6"
                })


            },
            error: function () {
                showAlert("Sign-in failed. Please try again.",'error');
            }
        });
    });

});