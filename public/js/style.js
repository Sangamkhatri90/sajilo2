document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('myButton');

    button.addEventListener('click', function() {
        // Toggle the "clicked" class on click
        button.classList.toggle('clicked');
    });
});
