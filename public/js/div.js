const links = document.querySelectorAll('.toggle-link');
const sections = document.querySelectorAll('.content > div');

links.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();

        // Remove active class from all links
        links.forEach(l => l.classList.remove('active'));

        // Hide all sections
        sections.forEach(section => section.style.display = 'none');

        // Add active class to the clicked link
        this.classList.add('active');

        // Show the corresponding section
        const target = this.getAttribute('data-target');
        document.querySelector(`.${target}`).style.display = 'block';
    });
});
function previewImage(event) {
    const input = event.target;
    const previewContainer = document.getElementById('image-preview');
    
    // Clear any previous preview
    previewContainer.innerHTML = '';

    if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            previewContainer.appendChild(img);
        };

        reader.readAsDataURL(file);
    }
}

function previewImages(event) {
    const input1 = event.target;
    const previewContainer1 = document.getElementById('image-preview1');
    
    // Clear any previous previews
    previewContainer1.innerHTML = '';

    if (input1.files) {
        Array.from(input1.files).forEach(file => {
            const reader = new FileReader();

            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                previewContainer1.appendChild(img);
            };

            reader.readAsDataURL(file);
        });
    }
}
