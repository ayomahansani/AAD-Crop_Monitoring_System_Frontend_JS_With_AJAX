// Toggle sidebar for mobile

$(document).ready(function() {
    $('.menu-toggle').on('click', function() {
        $('.sidebar').toggleClass('active');
        console.log("Toggle clicked"); // Debugging line
    });
});