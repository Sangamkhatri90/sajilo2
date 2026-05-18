// Get all movable divs
const movableDivs = document.querySelectorAll('.movableDiv');

// Add event listener to each div
movableDivs.forEach(div => {
  div.addEventListener('click', function() {
    // Reset the z-index for all divs by removing the active class
    movableDivs.forEach(d => d.classList.remove('active'));

    // Set the z-index of the clicked div to bring it to the front
    div.classList.add('active');
  });
});

// Add event listener to each div
movableDivs.forEach(div => {
  div.addEventListener('click', function() {
    // Reset the z-index for all divs by removing the 'active' class
    movableDivs.forEach(d => d.classList.remove('active'));

    // Set the z-index of the clicked div to bring it to the front
    div.classList.add('active');
  });
});