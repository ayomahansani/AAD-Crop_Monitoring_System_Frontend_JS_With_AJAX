
$(document).ready(function () {

    $('#cropImage').on('change', function () {

        const file = this.files[0]; // Get the selected file
        const previewImage = $('#previewImage'); // Image preview element
        const noImageText = $('#noImageText'); // No image text element

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

    // When the custom button is clicked, trigger the file input click
    $(".btn-custom-file").on("click", function () {
            $("#cropImage").trigger("click");
        });

    // When a file is selected, update the file name display
    $("#cropImage").on("change", function () {
            var fileName = $(this).val().split("\\").pop() || "No file chosen";
            $("#fileName").text(fileName);
        });

});