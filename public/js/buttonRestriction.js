function toggleButton() {
    var inputField = document.getElementById("inputField").value;
    var button = document.getElementById("submitButton");

    // Example condition: enable the button if input is not empty
    if (inputField.trim() !== "") {
        button.disabled = false;
    } else {
        button.disabled = true;
    }
}